"""
db.py
-----
Lightweight SQLite data layer used out-of-the-box so the project runs with
zero external setup (per brief: "clean, modular... suitable for a
final-year BCA project"). The equivalent MySQL schema is provided in
schema_mysql.sql — flip DB_ENGINE=mysql and supply MYSQL_* env vars in a
real deployment to use it via the same table names/columns.
"""

import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "transport_ai.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS passengers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_name TEXT NOT NULL,
    org_type TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_type TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    transport_mode TEXT,
    source TEXT,
    destination TEXT,
    travel_date TEXT,
    predicted_demand REAL,
    predicted_occupancy REAL,
    predicted_revenue REAL,
    predicted_seat_availability INTEGER,
    recommendation_score REAL,
    raw_response TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    passenger_id INTEGER NOT NULL,
    transport_mode TEXT,
    source TEXT,
    destination TEXT,
    travel_date TEXT,
    fare REAL,
    status TEXT DEFAULT 'Confirmed',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    org_id INTEGER
);

CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER NOT NULL,
    vehicle_type TEXT NOT NULL,
    identifier TEXT,
    capacity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS seat_availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER,
    travel_date TEXT,
    total_seats INTEGER,
    booked_seats INTEGER,
    available_seats INTEGER
);

CREATE TABLE IF NOT EXISTS revenue_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER NOT NULL,
    travel_date TEXT,
    revenue REAL,
    profit REAL,
    fuel_cost REAL
);

CREATE TABLE IF NOT EXISTS weather_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location TEXT,
    date TEXT,
    condition_text TEXT,
    temperature REAL
);

CREATE TABLE IF NOT EXISTS demand_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    route_id INTEGER,
    transport_mode TEXT,
    date TEXT,
    demand_score REAL,
    occupancy_pct REAL
);
"""


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    conn.executescript(SCHEMA)
    conn.commit()
    conn.close()


def save_prediction(user_type, user_id, payload, result):
    conn = get_conn()
    conn.execute(
        """INSERT INTO predictions
        (user_type, user_id, transport_mode, source, destination, travel_date,
         predicted_demand, predicted_occupancy, predicted_revenue,
         predicted_seat_availability, recommendation_score, raw_response, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            user_type, user_id, payload.get("transport_mode"), payload.get("source"),
            payload.get("destination"), payload.get("travel_date"),
            result.get("predicted_demand"), result.get("predicted_occupancy"),
            result.get("predicted_revenue"), result.get("predicted_seat_availability"),
            result.get("recommendation_score"), json.dumps(result),
            datetime.utcnow().isoformat(),
        ),
    )
    conn.commit()
    conn.close()


def get_prediction_history(user_type, user_id, limit=25):
    conn = get_conn()
    rows = conn.execute(
        """SELECT * FROM predictions WHERE user_type=? AND user_id=?
           ORDER BY id DESC LIMIT ?""",
        (user_type, user_id, limit),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]
