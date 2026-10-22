# Multimodal Transport Demand Prediction — AI-Powered Transport Demand Prediction & Smart Travel Recommendation System

A full-stack ML web application with two portals — **Passenger** and **Transport
Organization** — that predicts transport demand, occupancy, revenue and seat
availability using a trained Random Forest model, and turns those predictions
into explainable, rule-based travel/operational recommendations.

```
transport-ai/
├── backend/                 Flask REST API
│   ├── app.py                Main API (auth, predictions, analytics)
│   ├── requirements.txt
│   ├── ml/
│   │   ├── generate_dataset.py       Synthetic historical dataset generator
│   │   ├── train_model.py            Trains & compares 4 ML models
│   │   └── recommendation_engine.py  Business-rule recommendation logic
│   ├── database/
│   │   ├── db.py                     SQLite data layer (default, zero-config)
│   │   ├── schema_mysql.sql          Equivalent MySQL schema (production)
│   │   └── transport_dataset.csv     Generated training dataset (~4.7k rows)
│   └── models/                       Trained model artifacts (.joblib, metrics.json)
└── frontend/                 React (Vite) + Bootstrap 5 + Chart.js
    └── src/
        ├── pages/             Home, Passenger & Org login/register/dashboard
        ├── components/        Navbar, cards, charts, prediction result panels
        ├── api/client.js      REST API client
        └── context/           In-memory auth session
```

---

## 1. Quick Start

### Backend (Flask + ML)

```bash
cd backend
python3 -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt

# Dataset & model artifacts are already included under database/ and models/.
# To regenerate them from scratch (optional):
cd ml
python3 generate_dataset.py
python3 train_model.py
cd ..

python3 app.py
```

The API starts on **http://localhost:5000**. It uses SQLite by default
(`backend/database/transport_ai.db`, auto-created on first run) — no external
database setup required to try the project.

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Opens on **http://localhost:5173**. The Vite dev server proxies all `/api/*`
requests to the Flask backend (see `vite.config.js`), so just make sure the
backend is running first.

### Production build

```bash
cd frontend
npm run build      # outputs static files to frontend/dist
```

Serve `frontend/dist` with any static host (Nginx, Netlify, etc.) and point
it at your deployed Flask API.

---

## 2. Switching to MySQL

The project ships with SQLite for zero-config local use. To use MySQL in
production:

1. Run `backend/database/schema_mysql.sql` against your MySQL server:
   ```bash
   mysql -u root -p < backend/database/schema_mysql.sql
   ```
2. Replace the SQLite calls in `backend/database/db.py` with a MySQL
   connector (e.g. `mysql-connector-python` or `PyMySQL`) using the same
   table/column names — the schema is a drop-in match.

---

## 3. Machine Learning

- **Dataset**: `backend/ml/generate_dataset.py` builds a synthetic but
  realistic historical dataset (routes, weather, holidays, festivals,
  traffic, weekday/weekend effects) since real-time transport data wasn't
  available — as noted in the project brief.
- **Models compared**: Linear Regression, Decision Tree, Random Forest
  (primary/production model), and XGBoost — trained on four targets:
  `demand_score`, `occupancy_pct`, `revenue`, `seat_availability`.
- **Metrics**: MAE, RMSE and R² for every model/target combination are saved
  to `backend/models/metrics.json` and rendered in the Organization
  dashboard's **Model Performance** tab.
- Random Forest achieves **R² ≈ 0.94** on revenue and **R² ≈ 0.93** on seat
  availability on held-out test data.

### ML vs. Business Rules — clearly labeled

Every prediction API response separates:
- `ml_predictions` / fields tagged `"source": "ml_model"` — output of the
  trained Random Forest model.
- `business_rule_recommendations` / `ai_suggestions` tagged
  `"source": "business_rule"` — deterministic logic in
  `recommendation_engine.py` (peak/off-peak labeling, booking advice, fare
  trend direction, AI suggestions for operators, etc.)

The frontend visually distinguishes these with a teal "● ML Model
Prediction" chip vs. an amber "● Business Rule Recommendation" chip
throughout both dashboards.

---

## 4. REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/passenger` | Register a passenger |
| POST | `/api/auth/login/passenger` | Passenger login |
| POST | `/api/auth/register/organization` | Register an organization |
| POST | `/api/auth/login/organization` | Organization login |
| POST | `/api/predict/passenger` | Demand/occupancy/seat prediction + recommendations |
| POST | `/api/predict/organization` | Revenue/occupancy prediction + AI suggestions |
| GET | `/api/analytics/overview` | Aggregate chart data (by month, mode, route, weekday, weather) |
| GET | `/api/model/metrics` | Model comparison metrics (MAE/RMSE/R²) |
| GET | `/api/history/<user_type>/<id>` | Past predictions for a user |
| GET | `/api/health` | Health check |

---

## 5. What's implemented vs. extensible

**Implemented and tested:** two-portal auth, ML-backed passenger predictions
(demand, occupancy, seat availability, peak status, crowd level, booking
advice, fare trend, mode-specific bus/train/flight details, recommendation
score with reasons), organization predictions (revenue, profit, occupancy,
cancellation probability, AI suggestions), analytics dashboard (month/mode/
route/weekday charts + totals), model performance comparison panel.

**Scaffolded for extension** (straightforward to add on top of the existing
API/DB structure, kept out of this pass to focus effort on a working core):
forgot-password flow, admin dataset upload/retrain UI, PDF/CSV export, live
weather/holiday/Maps API integration, AI chat assistant, dark mode toggle,
email notifications. The database schema and modular Flask blueprint-style
structure already anticipate these.

---

## 6. Tech Stack

**Frontend:** React 18, React Router, Bootstrap 5, Chart.js (via
react-chartjs-2), Vite.
**Backend:** Python, Flask, Flask-CORS, Werkzeug (password hashing).
**ML:** scikit-learn (Random Forest, Decision Tree, Linear Regression),
XGBoost, pandas, NumPy, joblib.
**Database:** SQLite (default/demo), MySQL (production schema provided).
