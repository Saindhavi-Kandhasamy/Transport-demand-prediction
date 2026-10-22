"""
app.py
------
Flask REST API for the AI-Powered Transport Demand Prediction and Smart
Travel Recommendation System.

Endpoints are grouped as:
  /api/auth/*            - passenger & organization register/login
  /api/predict/passenger - ML demand/occupancy/seat prediction + recommendations
  /api/predict/organization - ML revenue/occupancy prediction + AI suggestions
  /api/analytics/*       - aggregate chart data for dashboards
  /api/model/metrics      - model comparison metrics (MAE/RMSE/R2)
  /api/history/<user_type>/<id> - past predictions

Run:
    python app.py
Server starts on http://localhost:5000
"""

import os
import json
import joblib
import numpy as np
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

from database import db
from ml import recommendation_engine as rec

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

# ---------------------------------------------------------------------
# Load trained artifacts once at startup
# ---------------------------------------------------------------------
try:
    MODELS = joblib.load(os.path.join(MODEL_DIR, "rf_models.joblib"))
    ENCODERS = joblib.load(os.path.join(MODEL_DIR, "encoders.joblib"))
    with open(os.path.join(MODEL_DIR, "feature_list.json")) as f:
        FEATURE_LIST = json.load(f)
    with open(os.path.join(MODEL_DIR, "metrics.json")) as f:
        METRICS = json.load(f)
    MODELS_LOADED = True
except FileNotFoundError:
    MODELS, ENCODERS, FEATURE_LIST, METRICS = {}, {}, [], {}
    MODELS_LOADED = False
    print("WARNING: trained models not found. Run backend/ml/train_model.py first.")

db.init_db()


# ---------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------
def safe_encode(encoder, value, fallback=0):
    """Encode a categorical value; fall back gracefully for unseen labels."""
    try:
        return int(encoder.transform([value])[0])
    except Exception:
        return fallback


def build_feature_row(payload):
    date = payload.get("travel_date") or datetime.utcnow().strftime("%Y-%m-%d")
    try:
        dt = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        dt = datetime.utcnow()

    weekday = dt.weekday()
    month = dt.month
    is_weekend = 1 if weekday >= 5 else 0
    is_holiday = int(payload.get("is_holiday", 0))
    is_festival = int(payload.get("is_festival", 0))

    source_enc = safe_encode(ENCODERS["source"], payload.get("source", ""))
    destination_enc = safe_encode(ENCODERS["destination"], payload.get("destination", ""))
    mode_enc = safe_encode(ENCODERS["transport_mode"], payload.get("transport_mode", "Bus"))
    weather = payload.get("weather", "Clear")
    weather_enc = safe_encode(ENCODERS["weather"], weather)
    traffic = payload.get("traffic", "Medium")
    traffic_enc = safe_encode(ENCODERS["traffic"], traffic)

    dep_hour = int(str(payload.get("preferred_time", "10:00")).split(":")[0] or 10)

    default_capacity = {"Bus": 45, "Train": 400, "Flight": 180}
    capacity = int(payload.get("capacity") or default_capacity.get(payload.get("transport_mode", "Bus"), 45))

    import pandas as pd
    row = pd.DataFrame(
        [[weekday, month, is_weekend, is_holiday, is_festival, source_enc,
          destination_enc, mode_enc, weather_enc, traffic_enc, dep_hour, capacity]],
        columns=FEATURE_LIST,
    )

    ctx = {
        "weekday": weekday, "month": month, "is_weekend": is_weekend,
        "is_holiday": is_holiday, "is_festival": is_festival, "weather": weather,
        "traffic": traffic, "capacity": capacity, "date": date,
    }
    return row, ctx


def run_ml_predictions(feature_row):
    """Returns raw ML model outputs — explicitly the ML-sourced fields."""
    out = {}
    for target, model in MODELS.items():
        pred = float(model.predict(feature_row)[0])
        out[target] = round(max(pred, 0), 2)
    return out


# ---------------------------------------------------------------------
# AUTH
# ---------------------------------------------------------------------
@app.route("/api/auth/register/<user_type>", methods=["POST"])
def register(user_type):
    data = request.get_json(force=True)
    conn = db.get_conn()
    try:
        if user_type == "passenger":
            conn.execute(
                "INSERT INTO passengers (full_name, email, phone, password_hash) VALUES (?,?,?,?)",
                (data["full_name"], data["email"], data.get("phone", ""),
                 generate_password_hash(data["password"])),
            )
        elif user_type == "organization":
            conn.execute(
                "INSERT INTO organizations (org_name, org_type, email, phone, password_hash) VALUES (?,?,?,?,?)",
                (data["org_name"], data.get("org_type", "Bus"), data["email"],
                 data.get("phone", ""), generate_password_hash(data["password"])),
            )
        else:
            return jsonify({"error": "invalid user_type"}), 400
        conn.commit()
        return jsonify({"message": "Registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        conn.close()


@app.route("/api/auth/login/<user_type>", methods=["POST"])
def login(user_type):
    data = request.get_json(force=True)
    table = "passengers" if user_type == "passenger" else "organizations"
    conn = db.get_conn()
    row = conn.execute(f"SELECT * FROM {table} WHERE email = ?", (data["email"],)).fetchone()
    conn.close()
    if not row or not check_password_hash(row["password_hash"], data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401
    user = dict(row)
    user.pop("password_hash")
    return jsonify({"message": "Login successful", "user": user})


# ---------------------------------------------------------------------
# PASSENGER PREDICTION
# ---------------------------------------------------------------------
@app.route("/api/predict/passenger", methods=["POST"])
def predict_passenger():
    payload = request.get_json(force=True)
    if not MODELS_LOADED:
        return jsonify({"error": "Models not trained yet. Run train_model.py"}), 503

    feature_row, ctx = build_feature_row(payload)
    ml = run_ml_predictions(feature_row)

    demand = ml.get("demand_score", 50)
    occupancy = ml.get("occupancy_pct", 50)
    revenue = ml.get("revenue", 0)
    seat_avail = int(ml.get("seat_availability", 0))
    capacity = ctx["capacity"]
    mode = payload.get("transport_mode", "Bus")
    budget = float(payload.get("budget") or 999999)

    default_fare = {"Bus": 550, "Train": 650, "Flight": 4200}[mode]
    est_fare = round(default_fare * (1 + (demand - 50) / 200), 2)
    budget_fit = est_fare <= budget
    duration_ok = True

    seat_ratio = seat_avail / max(capacity, 1)
    seat_info = rec.seat_chance(seat_avail, capacity)
    cheapest_day, best_booking_day = rec.cheapest_and_best_booking_day(ctx["date"])

    result = {
        "ml_predictions": {   # <-- sourced from the trained Random Forest model
            "expected_demand": demand,
            "expected_occupancy_pct": occupancy,
            "predicted_seat_availability": seat_avail,
            "estimated_revenue_context": revenue,
            "source": "ml_model",
        },
        "business_rule_recommendations": {   # <-- sourced from rule engine
            "peak_status": rec.peak_status(demand),
            "crowd_level": rec.crowd_level(occupancy),
            "seat_chance": seat_info,
            "booking_advice": rec.booking_advice(demand, seat_avail, capacity,
                                                  ctx["is_weekend"], ctx["is_holiday"]),
            "fare_trend": rec.fare_trend(demand),
            "estimated_ticket_cost": est_fare,
            "weather_impact": rec.WEATHER_IMPACT.get(ctx["weather"], "Unknown"),
            "holiday_impact": "Elevated demand expected" if ctx["is_holiday"] else "No holiday impact",
            "festival_impact": "Elevated demand expected" if ctx["is_festival"] else "No festival impact",
            "weekend_impact": "Elevated demand expected" if ctx["is_weekend"] else "Normal weekday demand",
            "traffic_condition": ctx["traffic"],
            "alternative_date": rec.alternative_dates(ctx["date"], demand),
            "cheapest_day": cheapest_day,
            "best_booking_day": best_booking_day,
            "recommended_transport": mode,
            "recommendation_reasons": rec.reasons_for_recommendation(
                mode, seat_ratio, ctx["weather"], budget_fit, duration_ok, demand),
            "recommendation_score": rec.recommendation_score(
                demand, seat_ratio, ctx["weather"], budget_fit, duration_ok),
            "source": "business_rule",
        },
    }

    # mode-specific extras
    if mode == "Bus":
        result["mode_specific"] = {
            "remaining_seats": seat_avail,
            "waiting_list_possibility": "High" if seat_ratio < 0.05 else "Low",
            "suggestion": rec.booking_advice(demand, seat_avail, capacity, ctx["is_weekend"], ctx["is_holiday"]),
            "fare_movement": rec.fare_trend(demand),
        }
    elif mode == "Train":
        result["mode_specific"] = {
            "waiting_list_probability_pct": max(0, min(95, int(100 - seat_ratio * 100))) if seat_ratio < 0.15 else 5,
            "expected_delay_min": int(15 if ctx["weather"] in ("Rain", "Storm", "Fog") else 3),
            "recommended_train": f"{payload.get('source','Source')}-{payload.get('destination','Dest')} Express",
        }
    elif mode == "Flight":
        result["mode_specific"] = {
            "fare_trend": rec.fare_trend(demand),
            "cheapest_day": cheapest_day,
            "best_booking_day": best_booking_day,
            "recommended_flight": f"{payload.get('source','SRC')[:3].upper()}-{payload.get('destination','DST')[:3].upper()} Flight",
        }

    if "email" in payload or "user_id" in payload:
        try:
            db.save_prediction("passenger", payload.get("user_id", 0), payload, {
                "predicted_demand": demand, "predicted_occupancy": occupancy,
                "predicted_revenue": revenue, "predicted_seat_availability": seat_avail,
                "recommendation_score": result["business_rule_recommendations"]["recommendation_score"],
                **result,
            })
        except Exception:
            pass

    return jsonify(result)


# ---------------------------------------------------------------------
# ORGANIZATION PREDICTION
# ---------------------------------------------------------------------
@app.route("/api/predict/organization", methods=["POST"])
def predict_organization():
    payload = request.get_json(force=True)
    if not MODELS_LOADED:
        return jsonify({"error": "Models not trained yet. Run train_model.py"}), 503

    feature_row, ctx = build_feature_row(payload)
    ml = run_ml_predictions(feature_row)

    demand = ml.get("demand_score", 50)
    occupancy = ml.get("occupancy_pct", 50)
    revenue = ml.get("revenue", 0)
    seat_avail = int(ml.get("seat_availability", 0))
    capacity = ctx["capacity"]

    fuel_cost = float(payload.get("fuel_cost") or {"Bus": 3500, "Train": 12000, "Flight": 95000}
                       .get(payload.get("transport_type", "Bus"), 3500))
    profit = round(revenue - fuel_cost, 2)
    booked = capacity - seat_avail
    cancellation_prob = round(max(0, min(40, 40 - demand / 3)), 1)

    result = {
        "ml_predictions": {
            "passenger_demand": demand,
            "expected_occupancy_pct": occupancy,
            "revenue": revenue,
            "profit": profit,
            "ticket_sales_est": booked,
            "peak_time": demand >= 60,
            "cancellation_probability_pct": cancellation_prob,
            "vehicle_utilization_pct": occupancy,
            "operational_cost": fuel_cost,
            "fuel_consumption_estimate": round(fuel_cost / 90, 2),
            "source": "ml_model",
        },
        "ai_suggestions": rec.org_suggestions(   # business rules
            demand, occupancy, profit, capacity,
            ctx["is_weekend"], ctx["is_holiday"], ctx["is_festival"],
        ),
        "source_note": "ai_suggestions are business-rule based; ml_predictions are from the trained Random Forest model",
    }

    if "org_id" in payload:
        try:
            db.save_prediction("organization", payload.get("org_id", 0), payload, {
                "predicted_demand": demand, "predicted_occupancy": occupancy,
                "predicted_revenue": revenue, "predicted_seat_availability": seat_avail,
                "recommendation_score": None, **result,
            })
        except Exception:
            pass

    return jsonify(result)


# ---------------------------------------------------------------------
# ANALYTICS
# ---------------------------------------------------------------------
@app.route("/api/analytics/overview", methods=["GET"])
def analytics_overview():
    import pandas as pd
    csv_path = os.path.join(BASE_DIR, "database", "transport_dataset.csv")
    if not os.path.exists(csv_path):
        return jsonify({"error": "dataset not found"}), 404
    df = pd.read_csv(csv_path)

    by_month = df.groupby("month").agg(
        demand=("demand_score", "mean"), revenue=("revenue", "sum"),
        occupancy=("occupancy_pct", "mean"),
    ).round(2).reset_index().to_dict(orient="records")

    by_mode = df.groupby("transport_mode").agg(
        demand=("demand_score", "mean"), revenue=("revenue", "sum"),
        bookings=("booked_seats", "sum"),
    ).round(2).reset_index().to_dict(orient="records")

    by_route = (df.groupby(["source", "destination"]).agg(
        demand=("demand_score", "mean"), trips=("demand_score", "count"),
    ).round(2).reset_index().sort_values("demand", ascending=False).head(8)
        .to_dict(orient="records"))

    by_weekday = df.groupby("weekday").agg(
        demand=("demand_score", "mean"), occupancy=("occupancy_pct", "mean"),
    ).round(2).reset_index().to_dict(orient="records")

    weather_impact = df.groupby("weather").agg(
        demand=("demand_score", "mean"),
    ).round(2).reset_index().to_dict(orient="records")

    return jsonify({
        "by_month": by_month, "by_mode": by_mode, "by_route": by_route,
        "by_weekday": by_weekday, "weather_impact": weather_impact,
        "totals": {
            "total_revenue": round(float(df["revenue"].sum()), 2),
            "total_profit": round(float(df["profit"].sum()), 2),
            "avg_occupancy": round(float(df["occupancy_pct"].mean()), 2),
            "total_trips": int(len(df)),
        },
    })


@app.route("/api/model/metrics", methods=["GET"])
def model_metrics():
    return jsonify({"metrics": METRICS, "primary_model": "RandomForest"})


@app.route("/api/history/<user_type>/<int:user_id>", methods=["GET"])
def history(user_type, user_id):
    return jsonify({"history": db.get_prediction_history(user_type, user_id)})


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "models_loaded": MODELS_LOADED})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
