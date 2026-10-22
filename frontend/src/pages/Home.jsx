import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import RouteLine from '../components/RouteLine.jsx'
import FeatureCard from '../components/FeatureCard.jsx'

const FEATURES = [
  { icon: '📊', title: 'Demand Prediction', text: 'Random Forest models forecast passenger demand from historical travel patterns.' },
  { icon: '🪑', title: 'Seat Availability', text: 'Real-time-style seat, occupancy and waiting-list predictions per transport mode.' },
  { icon: '⛅', title: 'Weather Analysis', text: 'Weather impact scoring factored directly into demand and delay estimates.' },
  { icon: '🧭', title: 'Travel Recommendation', text: 'Rule-based engine recommends the best mode, date and time to travel.' },
  { icon: '💰', title: 'Revenue Prediction', text: 'Organizations get ML-driven revenue, profit and utilization forecasts.' },
  { icon: '⚙️', title: 'Cost Optimization', text: 'AI suggestions on pricing, fleet size and scheduling to cut operational cost.' },
]

export default function Home() {
  return (
    <div>
      <Navbar />

      <section className="tiq-hero">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="eyebrow">Final-year ML system · Bus · Train · Flight</div>
              <h1 className="display-font">
                Predict transport demand.<br />Travel smarter.
              </h1>
              <p className="lead">
                Multimodal Transport Demand Prediction uses Random Forest regression trained on historical travel
                data to forecast demand, occupancy and revenue — then turns those
                predictions into clear, explainable recommendations for passengers
                and transport operators.
              </p>
              <div className="d-flex gap-3 mt-4 flex-wrap">
                <Link to="/passenger/login" className="btn-amber">Passenger Portal →</Link>
                <Link to="/organization/login" className="btn-outline-teal">Organization Portal →</Link>
              </div>

              <div className="flap-board mt-5 flex-wrap">
                <div className="flap"><div className="flap-value">4</div><div className="flap-label">ML Models Compared</div></div>
                <div className="flap"><div className="flap-value">94%</div><div className="flap-label">Revenue R² Score</div></div>
                <div className="flap"><div className="flap-value">3</div><div className="flap-label">Transport Modes</div></div>
                <div className="flap"><div className="flap-value">12+</div><div className="flap-label">Routes Tracked</div></div>
              </div>
            </div>
            <div className="col-lg-6 mt-5 mt-lg-0">
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 20 }}>
                <div className="mono" style={{ color: '#8993A8', fontSize: '0.75rem', marginBottom: 10 }}>PREDICTION PIPELINE</div>
                <RouteLine />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-5" style={{ background: 'var(--paper)' }}>
        <div className="container py-4">
          <div className="section-eyebrow">What Multimodal Transport Demand Prediction predicts</div>
          <h2 className="section-title mb-4">Six signals, one recommendation</h2>
          <div className="row g-4">
            {FEATURES.map((f) => (
              <div className="col-md-6 col-lg-4" key={f.title}>
                <FeatureCard {...f} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-5" style={{ background: '#fff', borderTop: '1px solid var(--line)' }}>
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="section-eyebrow">About the system</div>
              <h2 className="section-title mb-3">Two portals, one model</h2>
              <p style={{ color: 'var(--slate)' }}>
                Passengers get personalized recommendations — the best mode, date,
                time, and price to travel. Transport organizations get operational
                intelligence — occupancy, revenue, and AI-generated suggestions to
                optimize pricing, fleet size, and scheduling. Both portals are backed
                by the same trained Random Forest model, with predictions and
                business-rule recommendations clearly labeled throughout.
              </p>
            </div>
            <div className="col-lg-6">
              <div className="row g-3">
                <div className="col-6"><div className="tiq-card"><h6>Primary Model</h6><div className="metric-value">Random Forest</div></div></div>
                <div className="col-6"><div className="tiq-card"><h6>Compared Against</h6><div className="metric-value" style={{ fontSize: '1.1rem' }}>Linear · Tree · XGBoost</div></div></div>
                <div className="col-6"><div className="tiq-card"><h6>Database</h6><div className="metric-value" style={{ fontSize: '1.1rem' }}>MySQL</div></div></div>
                <div className="col-6"><div className="tiq-card"><h6>Stack</h6><div className="metric-value" style={{ fontSize: '1.1rem' }}>React · Flask</div></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" style={{ background: 'var(--ink)', color: 'rgba(255,255,255,0.6)' }} className="py-4">
        <div className="container d-flex flex-wrap justify-content-between align-items-center">
          <div className="brand" style={{ color: '#fff' }}>Transit<span style={{ color: 'var(--amber)' }}>IQ</span></div>
          <div className="mono" style={{ fontSize: '0.8rem' }}>AI-Powered Transport Demand Prediction System · Academic Project</div>
        </div>
      </footer>
    </div>
  )
}
