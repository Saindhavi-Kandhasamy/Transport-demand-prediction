"""
recommendation_engine.py
-------------------------
Business-RULE based recommendation logic (explicitly NOT the ML model).
The brief requires the app to "clearly indicate which predictions are
based on the trained machine learning model and which recommendations
are generated through business rules" — every function here is rules,
not a trained estimator, and every API response tags its fields
accordingly (source: "ml_model" vs source: "business_rule").
"""

from datetime import datetime, timedelta

WEATHER_IMPACT = {
    "Clear": "Favorable — no delays expected",
    "Cloudy": "Minor — negligible impact",
    "Rain": "Moderate — possible delays",
    "Storm": "High — significant disruption risk",
    "Fog": "Moderate — visibility-related delays possible",
}

MODE_FARE_HINT = {"Bus": "budget", "Train": "balanced", "Flight": "premium"}


def peak_status(demand_score: float) -> str:
    if demand_score >= 70:
        return "Peak"
    if demand_score >= 45:
        return "Moderate"
    return "Non-Peak"


def crowd_level(occupancy_pct: float) -> str:
    if occupancy_pct >= 85:
        return "Very High"
    if occupancy_pct >= 65:
        return "High"
    if occupancy_pct >= 35:
        return "Moderate"
    return "Low"


def seat_chance(seat_availability: int, capacity: int) -> dict:
    ratio = seat_availability / max(capacity, 1)
    if ratio > 0.4:
        label, pct = "Excellent", 92
    elif ratio > 0.2:
        label, pct = "Good", 75
    elif ratio > 0.08:
        label, pct = "Limited", 45
    elif ratio > 0:
        label, pct = "Very Limited — Waitlist Risk", 20
    else:
        label, pct = "Full — Waitlist Likely", 5
    return {"label": label, "confidence_pct": pct}


def booking_advice(demand_score, seat_availability, capacity, is_weekend, is_holiday):
    ratio = seat_availability / max(capacity, 1)
    if demand_score >= 70 or ratio < 0.1:
        return "Book immediately — high demand, limited seats"
    if is_weekend or is_holiday:
        return "Book soon — weekend/holiday surge expected"
    if demand_score <= 35 and ratio > 0.4:
        return "You can wait — low demand, seats readily available"
    return "Book within 2-3 days for best availability"


def fare_trend(demand_score: float) -> str:
    if demand_score >= 65:
        return "Expected fare increase — prices trending up"
    if demand_score <= 35:
        return "Expected fare decrease — good time to book"
    return "Stable pricing expected"


def cheapest_and_best_booking_day(travel_date_str: str):
    try:
        d = datetime.strptime(travel_date_str, "%Y-%m-%d")
    except Exception:
        d = datetime.utcnow()
    # rule of thumb: mid-week travel & booking 5-7 days out is cheapest
    cheapest_day = d - timedelta(days=(d.weekday() - 2) % 7 or 3)
    best_booking_day = d - timedelta(days=6)
    return cheapest_day.strftime("%Y-%m-%d"), best_booking_day.strftime("%Y-%m-%d")


def alternative_dates(travel_date_str: str, demand_score: float):
    try:
        d = datetime.strptime(travel_date_str, "%Y-%m-%d")
    except Exception:
        d = datetime.utcnow()
    offset = -2 if demand_score >= 60 else 2
    alt = d + timedelta(days=offset)
    return alt.strftime("%Y-%m-%d")


def recommendation_score(demand_score, seat_ratio, weather, budget_fit, duration_ok):
    """0-100 composite score explaining WHY a mode is recommended."""
    score = 50
    score += 15 if seat_ratio > 0.3 else (5 if seat_ratio > 0.1 else -15)
    score += 10 if weather in ("Clear", "Cloudy") else -10
    score += 15 if budget_fit else -10
    score += 10 if duration_ok else -5
    score += 10 if 35 <= demand_score <= 65 else -5
    return int(max(0, min(100, score)))


def reasons_for_recommendation(mode, seat_ratio, weather, budget_fit, duration_ok, demand_score):
    reasons = []
    if budget_fit:
        reasons.append("Fits within your budget")
    if seat_ratio > 0.2:
        reasons.append("Good seat availability")
    if weather in ("Clear", "Cloudy"):
        reasons.append("Favorable weather conditions")
    if duration_ok:
        reasons.append("Travel duration is acceptable")
    if 35 <= demand_score <= 65:
        reasons.append("Demand is moderate — balanced pricing & comfort")
    if MODE_FARE_HINT.get(mode) == "budget":
        reasons.append("Lower overall cost vs other modes")
    if not reasons:
        reasons.append("Best overall match among available options")
    return reasons


def org_suggestions(demand_score, occupancy_pct, profit, capacity, is_weekend, is_holiday, is_festival):
    """Smart AI suggestions for the organization portal — rule-based."""
    suggestions = []

    if occupancy_pct >= 85:
        suggestions.append({"action": "Increase capacity / add extra trips", "reason": "Occupancy above 85% risks overbooking & lost demand"})
    elif occupancy_pct <= 30:
        suggestions.append({"action": "Reduce trips / consolidate schedules", "reason": "Low occupancy — operating cost outweighs demand"})

    if demand_score >= 70:
        suggestions.append({"action": "Increase ticket price moderately", "reason": "High demand supports premium pricing without losing riders"})
    elif demand_score <= 30:
        suggestions.append({"action": "Offer discount / promotional pricing", "reason": "Low demand — discounts can stimulate bookings"})

    if is_weekend:
        suggestions.append({"action": "Launch a weekend offer", "reason": "Weekend travel typically sees elevated demand"})
    if is_holiday or is_festival:
        suggestions.append({"action": "Add festival/holiday special trips", "reason": "Holiday & festival periods show demand spikes"})

    if profit < 0:
        suggestions.append({"action": "Review fuel & operational cost optimization", "reason": "Current trip is projected to run at a loss"})
    else:
        suggestions.append({"action": "Maintain current fleet utilization", "reason": "Trip is profitable at current configuration"})

    suggestions.append({"action": "Schedule preventive maintenance in low-demand windows", "reason": "Minimizes service disruption during peak periods"})

    return suggestions
