import React from 'react'

export default function FeatureCard({ icon, title, text }) {
  return (
    <div className="tiq-feature-card">
      <div className="icon-wrap">{icon}</div>
      <h5>{title}</h5>
      <p>{text}</p>
    </div>
  )
}
