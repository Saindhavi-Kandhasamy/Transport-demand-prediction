"""
train_model.py
---------------
Trains ML models on the synthetic transport dataset and saves the best
performing model (Random Forest, primary model per spec) plus label
encoders, to be loaded by the Flask backend at prediction time.

Targets trained:
    - demand_score        (0-100 continuous demand indicator)
    - occupancy_pct        (% of capacity filled)
    - revenue               (₹ revenue for that trip)
    - seat_availability     (remaining seats)

Models compared per target: Linear Regression, Decision Tree, Random Forest
(primary), XGBoost. Metrics (MAE, RMSE, R²) are saved to metrics.json so the
frontend "Model Performance" panel can display them transparently.

Run:
    python train_model.py
"""

import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

try:
    from xgboost import XGBRegressor
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

DATA_PATH = "../database/transport_dataset.csv"
MODEL_DIR = "../models"

FEATURES = [
    "weekday", "month", "is_weekend", "is_holiday", "is_festival",
    "source_enc", "destination_enc", "transport_mode_enc", "weather_enc",
    "traffic_enc", "dep_hour", "capacity",
]
TARGETS = ["demand_score", "occupancy_pct", "revenue", "seat_availability"]


def load_and_prepare():
    df = pd.read_csv(DATA_PATH)
    df["dep_hour"] = df["departure_time"].str.slice(0, 2).astype(int)

    encoders = {}
    for col in ["source", "destination", "transport_mode", "weather", "traffic"]:
        le = LabelEncoder()
        df[col + "_enc"] = le.fit_transform(df[col])
        encoders[col] = le

    return df, encoders


def evaluate(y_test, y_pred):
    mae = mean_absolute_error(y_test, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = r2_score(y_test, y_pred)
    return {"MAE": round(mae, 3), "RMSE": round(rmse, 3), "R2": round(r2, 4)}


def train_all():
    df, encoders = load_and_prepare()
    X = df[FEATURES]

    all_metrics = {}
    best_models = {}

    for target in TARGETS:
        y = df[target]
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        candidates = {
            "LinearRegression": LinearRegression(),
            "DecisionTree": DecisionTreeRegressor(max_depth=10, random_state=42),
            "RandomForest": RandomForestRegressor(
                n_estimators=200, max_depth=14, random_state=42, n_jobs=-1
            ),
        }
        if HAS_XGB:
            candidates["XGBoost"] = XGBRegressor(
                n_estimators=200, max_depth=6, learning_rate=0.08,
                random_state=42, verbosity=0
            )

        target_metrics = {}
        for name, model in candidates.items():
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            target_metrics[name] = evaluate(y_test, preds)

        all_metrics[target] = target_metrics

        # Random Forest is the primary/production model per project spec
        rf_final = RandomForestRegressor(
            n_estimators=120, max_depth=10, min_samples_leaf=3,
            random_state=42, n_jobs=-1
        )
        rf_final.fit(X, y)
        best_models[target] = rf_final

    # persist (compressed — keeps the shipped model file small)
    joblib.dump(best_models, f"{MODEL_DIR}/rf_models.joblib", compress=3)
    joblib.dump(encoders, f"{MODEL_DIR}/encoders.joblib")
    with open(f"{MODEL_DIR}/metrics.json", "w") as f:
        json.dump(all_metrics, f, indent=2)
    with open(f"{MODEL_DIR}/feature_list.json", "w") as f:
        json.dump(FEATURES, f)

    print("Training complete. Metrics:")
    print(json.dumps(all_metrics, indent=2))
    return all_metrics


if __name__ == "__main__":
    train_all()
