import React from 'react'

export function StatCard({ label, value, suffix = '', accent }) {
  return (
    <div className="tiq-card">
      <h6>{label}</h6>
      <div className="metric-value" style={accent ? { color: accent } : {}}>
        {value}{suffix}
      </div>
    </div>
  )
}

export function ProgressBar({ pct, color = '#2DD4BF' }) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div className="progress-tiq">
      <div className="bar" style={{ width: `${clamped}%`, background: color }} />
    </div>
  )
}

export function SourceTag({ type }) {
  const isML = type === 'ml_model'
  return (
    <span
      className="chip"
      style={{
        borderColor: isML ? '#2DD4BF' : '#FFB020',
        color: isML ? '#0f9c8b' : '#c07a00',
        background: isML ? 'rgba(45,212,191,0.1)' : 'rgba(255,176,32,0.12)',
      }}
    >
      {isML ? '● ML Model Prediction' : '● Business Rule Recommendation'}
    </span>
  )
}
