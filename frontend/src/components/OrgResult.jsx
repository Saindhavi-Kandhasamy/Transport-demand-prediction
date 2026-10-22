import React from 'react'
import { StatCard, SourceTag } from './StatCard.jsx'

export default function OrgResult({ result }) {
  if (!result) return null
  const ml = result.ml_predictions
  const suggestions = result.ai_suggestions

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">Machine Learning Predictions</h6>
        <SourceTag type="ml_model" />
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6"><StatCard label="Passenger Demand" value={ml.passenger_demand} suffix="/100" /></div>
        <div className="col-md-3 col-6"><StatCard label="Occupancy" value={ml.expected_occupancy_pct} suffix="%" /></div>
        <div className="col-md-3 col-6"><StatCard label="Revenue" value={`₹${ml.revenue.toLocaleString('en-IN')}`} accent="#2DD4BF" /></div>
        <div className="col-md-3 col-6"><StatCard label="Profit" value={`₹${ml.profit.toLocaleString('en-IN')}`} accent={ml.profit >= 0 ? '#2DD4BF' : '#FF6B6B'} /></div>
        <div className="col-md-3 col-6"><StatCard label="Ticket Sales (est.)" value={ml.ticket_sales_est} /></div>
        <div className="col-md-3 col-6"><StatCard label="Cancellation Prob." value={ml.cancellation_probability_pct} suffix="%" /></div>
        <div className="col-md-3 col-6"><StatCard label="Vehicle Utilization" value={ml.vehicle_utilization_pct} suffix="%" /></div>
        <div className="col-md-3 col-6"><StatCard label="Peak Time" value={ml.peak_time ? 'Yes' : 'No'} accent={ml.peak_time ? '#FFB020' : undefined} /></div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">Smart AI Suggestions</h6>
        <SourceTag type="business_rule" />
      </div>
      <div className="row g-3">
        {suggestions.map((s, i) => (
          <div className="col-md-6" key={i}>
            <div className="tiq-card h-100">
              <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{s.action}</div>
              <div className="small mt-1" style={{ color: 'var(--slate)' }}>{s.reason}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
