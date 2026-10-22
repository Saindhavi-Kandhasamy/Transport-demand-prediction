import React from 'react'

export default function Sidebar({ items, active, onSelect, userLabel, onLogout }) {
  return (
    <div className="dash-sidebar d-flex flex-column">
      <div className="mb-4 px-2">
        <div className="mono" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>SIGNED IN AS</div>
        <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{userLabel}</div>
      </div>
      <div className="flex-grow-1">
        {items.map((it) => (
          <div
            key={it.key}
            className={`side-link ${active === it.key ? 'active' : ''}`}
            onClick={() => onSelect(it.key)}
          >
            <span>{it.icon}</span>
            <span>{it.label}</span>
          </div>
        ))}
      </div>
      <div className="side-link" onClick={onLogout} style={{ color: '#FF6B6B' }}>
        <span>⏻</span><span>Logout</span>
      </div>
    </div>
  )
}
