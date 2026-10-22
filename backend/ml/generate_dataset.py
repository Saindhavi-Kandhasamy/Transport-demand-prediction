"""
generate_dataset.py
--------------------
Generates a realistic SYNTHETIC historical transport dataset used to train
the demand / occupancy / revenue / seat-availability models.

Real-time / real-world data was not available for this project, so this
script builds a rule-driven synthetic dataset (as required by the brief):
"Use sample historical data where real-time transport data is unavailable".

Run:
    python generate_dataset.py
Output:
    ../database/transport_dataset.csv   (~15,000 rows)
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta

np.random.seed(42)

ROUTES = [
    ("Chennai", "Bangalore"), ("Chennai", "Coimbatore"), ("Chennai", "Trichy"),
    ("Bangalore", "Hyderabad"), ("Mumbai", "Pune"), ("Mumbai", "Goa"),
    ("Delhi", "Jaipur"), ("Delhi", "Chandigarh"), ("Kolkata", "Bhubaneswar"),
    ("Hyderabad", "Vijayawada"), ("Trichy", "Madurai"), ("Coimbatore", "Kochi"),
]

MODES = ["Bus", "Train", "Flight"]
WEATHER = ["Clear", "Cloudy", "Rain", "Storm", "Fog"]

MODE_BASE_CAPACITY = {"Bus": 45, "Train": 400, "Flight": 180}
MODE_BASE_FARE = {"Bus": 550, "Train": 650, "Flight": 4200}
MODE_BASE_FUEL = {"Bus": 3500, "Train": 12000, "Flight": 95000}

HOLIDAYS_2024_2025 = {
    "2024-01-26", "2024-03-25", "2024-08-15", "2024-10-02", "2024-11-01",
    "2024-12-25", "2025-01-01", "2025-01-26", "2025-08-15", "2025-10-02",
}
FESTIVALS = {
    "2024-01-14", "2024-03-08", "2024-04-11", "2024-08-19", "2024-09-07",
    "2024-10-12", "2024-10-31", "2024-11-01", "2025-01-14", "2025-03-14",
}


def build_row(date, mode, source, destination):
    weekday = date.weekday()  # 0=Mon
    month = date.month
    date_str = date.strftime("%Y-%m-%d")
    is_weekend = 1 if weekday >= 5 else 0
    is_holiday = 1 if date_str in HOLIDAYS_2024_2025 else 0
    is_festival = 1 if date_str in FESTIVALS else 0
    weather = np.random.choice(WEATHER, p=[0.45, 0.25, 0.2, 0.05, 0.05])
    traffic = np.random.choice(["Low", "Medium", "High"], p=[0.3, 0.45, 0.25])

    capacity = MODE_BASE_CAPACITY[mode] + np.random.randint(-5, 6)
    capacity = max(capacity, 10)

    # ---- demand score (0-100) built from explainable business signals ----
    demand = 40.0
    demand += 20 if is_weekend else 0
    demand += 25 if is_holiday else 0
    demand += 22 if is_festival else 0
    demand += {"Clear": 5, "Cloudy": 2, "Rain": -8, "Storm": -20, "Fog": -10}[weather]
    demand += {"Low": -5, "Medium": 5, "High": 12}[traffic]
    demand += {"Bus": 0, "Train": 4, "Flight": 8}[mode]
    demand += np.random.normal(0, 8)
    demand = float(np.clip(demand, 5, 100))

    occupancy_pct = np.clip(demand / 100 * np.random.uniform(0.85, 1.05), 0.05, 0.99)
    booked_seats = int(occupancy_pct * capacity)
    seat_availability = max(capacity - booked_seats, 0)

    fare = MODE_BASE_FARE[mode]
    fare *= 1 + (demand - 50) / 200  # surge-like pricing
    fare = round(max(fare, 100), 2)

    fuel_cost = MODE_BASE_FUEL[mode] * np.random.uniform(0.9, 1.15)
    revenue = round(booked_seats * fare, 2)
    profit = round(revenue - fuel_cost, 2)

    dep_hour = np.random.choice([6, 8, 10, 12, 14, 16, 18, 20, 22])
    departure_time = f"{dep_hour:02d}:00"
    duration_hr = {"Bus": np.random.uniform(3, 10), "Train": np.random.uniform(4, 16),
                   "Flight": np.random.uniform(1, 3)}[mode]
    arrival_hour = (dep_hour + duration_hr) % 24
    arrival_time = f"{int(arrival_hour):02d}:{int((arrival_hour % 1) * 60):02d}"

    return {
        "date": date_str, "weekday": weekday, "month": month,
        "is_weekend": is_weekend, "is_holiday": is_holiday, "is_festival": is_festival,
        "source": source, "destination": destination, "transport_mode": mode,
        "weather": weather, "traffic": traffic,
        "departure_time": departure_time, "arrival_time": arrival_time,
        "capacity": capacity, "booked_seats": booked_seats,
        "seat_availability": seat_availability,
        "fare": fare, "fuel_cost": round(fuel_cost, 2),
        "revenue": revenue, "profit": profit,
        "passenger_count": booked_seats,
        "demand_score": round(demand, 2),
        "occupancy_pct": round(occupancy_pct * 100, 2),
    }


def generate(n_days=450, out_path="../database/transport_dataset.csv"):
    start = datetime(2024, 1, 1)
    rows = []
    for d in range(n_days):
        date = start + timedelta(days=d)
        # sample a handful of route/mode combos per day (not all, for realism)
        for _ in range(np.random.randint(8, 14)):
            source, destination = ROUTES[np.random.randint(len(ROUTES))]
            mode = np.random.choice(MODES, p=[0.5, 0.3, 0.2])
            rows.append(build_row(date, mode, source, destination))

    df = pd.DataFrame(rows)
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} rows -> {out_path}")
    return df


if __name__ == "__main__":
    generate()
