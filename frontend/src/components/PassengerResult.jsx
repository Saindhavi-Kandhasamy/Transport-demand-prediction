import React from 'react'
import { ProgressBar, SourceTag } from './StatCard.jsx'

function Badge({ status }) {
  const cls = status === 'Peak' ? 'badge-peak' : status === 'Non-Peak' ? 'badge-nonpeak' : 'badge-moderate'
  return <span className={`badge ${cls} px-2 py-1`}>{status}</span>
}

export default function PassengerResult({ result }) {
  if (!result) return null
  const ml = result.ml_predictions
  const br = result.business_rule_recommendations
  const modeSpecific = result.mode_specific

  return (
    <div className="mt-4">
      {/* Overall score */}
      <div className="tiq-card mb-4" style={{ borderColor: '#FFB020', background: 'linear-gradient(135deg, rgba(255,176,32,0.06), transparent)' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h6>Overall Recommendation Score</h6>
            <div className="d-flex align-items-baseline gap-2">
              <span className="metric-value" style={{ fontSize: '2.4rem' }}>{br.recommendation_score}</span>
              <span style={{ color: 'var(--slate)' }}>/ 100</span>
            </div>
            <div className="mt-2">
              {br.recommendation_reasons.map((r, i) => (
                <span className="chip" key={i}>{r}</span>
              ))}
            </div>
          </div>
          <div style={{ minWidth: 160 }}>
            <div className="mb-1 small" style={{ color: 'var(--slate)' }}>Recommended: <strong>{br.recommended_transport}</strong></div>
            <Badge status={br.peak_status} />
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* ML predictions */}
        <div className="col-lg-6">
          <div className="tiq-card h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h6 className="mb-0">Machine Learning Predictions</h6>
              <SourceTag type="ml_model" />
            </div>
            <div className="row g-3 mt-1">
              <div className="col-6">
                <div className="small mb-1" style={{ color: 'var(--slate)' }}>Expected Demand</div>
                <ProgressBar pct={ml.expected_demand} />
                <div className="mono small mt-1">{ml.expected_demand} / 100</div>
              </div>
              <div className="col-6">
                <div className="small mb-1" style={{ color: 'var(--slate)' }}>Expected Occupancy</div>
                <ProgressBar pct={ml.expected_occupancy_pct} color="#FFB020" />
                <div className="mono small mt-1">{ml.expected_occupancy_pct}%</div>
              </div>
              <div className="col-6">
                <div className="small" style={{ color: 'var(--slate)' }}>Predicted Seat Availability</div>
                <div className="metric-value" style={{ fontSize: '1.3rem' }}>{ml.predicted_seat_availability}</div>
              </div>
              <div className="col-6">
                <div className="small" style={{ color: 'var(--slate)' }}>Crowd Level</div>
                <div className="metric-value" style={{ fontSize: '1.3rem' }}>{br.crowd_level}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Business rule recommendations */}
        <div className="col-lg-6">
          <div className="tiq-card h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h6 className="mb-0">Smart Recommendations</h6>
              <SourceTag type="business_rule" />
            </div>
            <ul className="list-unstyled small mb-0" style={{ color: 'var(--ink)' }}>
              <li className="mb-2"><strong>Booking advice:</strong> {br.booking_advice}</li>
              <li className="mb-2"><strong>Estimated fare:</strong> ₹{br.estimated_ticket_cost} — {br.fare_trend}</li>
              <li className="mb-2"><strong>Seat chance:</strong> {br.seat_chance.label} ({br.seat_chance.confidence_pct}% confidence)</li>
              <li className="mb-2"><strong>Weather impact:</strong> {br.weather_impact}</li>
              <li className="mb-2"><strong>Traffic:</strong> {br.traffic_condition}</li>
              <li className="mb-2"><strong>Holiday / Festival:</strong> {br.holiday_impact} · {br.festival_impact}</li>
              <li><strong>Alternative date:</strong> {br.alternative_date} &nbsp;|&nbsp; <strong>Cheapest day:</strong> {br.cheapest_day}</li>
            </ul>
          </div>
        </div>

        {/* Mode-specific */}
        {modeSpecific && (
          <div className="col-12">
            <div className="tiq-card">
              <h6 className="mb-3">Mode-Specific Details</h6>
              <div className="row g-3">
                {Object.entries(modeSpecific).map(([k, v]) => (
                  <div className="col-md-3 col-6" key={k}>
                    <div className="small text-capitalize" style={{ color: 'var(--slate)' }}>{k.replaceAll('_', ' ')}</div>
                    <div style={{ fontWeight: 600 }}>{String(v)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
