import React from 'react'

/**
 * Signature visual: a transit-line diagram where each "stop" represents a
 * stage of the prediction pipeline (Data -> Model -> Recommendation -> Trip).
 * Reinforces the transport subject matter instead of a generic gradient hero.
 */
export default function RouteLine() {
  const stops = [
    { x: 60, label: 'Historical Data' },
    { x: 260, label: 'ML Prediction' },
    { x: 460, label: 'Smart Recommendation' },
    { x: 660, label: 'Your Trip' },
  ]
  return (
    <div className="route-line-wrap">
      <svg viewBox="0 0 720 110" className="route-line-svg">
        <line x1="60" y1="55" x2="660" y2="55" stroke="#2DD4BF" strokeWidth="3" strokeDasharray="1 10" strokeLinecap="round" />
        {stops.map((s, i) => (
          <g key={i}>
            <circle cx={s.x} cy="55" r="9" fill="#0B1D3A" stroke="#FFB020" strokeWidth="3" />
            <text x={s.x} y="90" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="12" fill="#0B1D3A" fontWeight="600">
              {s.label}
            </text>
            <text x={s.x} y="30" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" fill="#8993A8">
              {String(i + 1).padStart(2, '0')}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
