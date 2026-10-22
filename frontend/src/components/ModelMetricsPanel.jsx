import React, { useEffect, useState } from 'react'
import { api } from '../api/client.js'

export default function ModelMetricsPanel() {
  const [metrics, setMetrics] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.modelMetrics().then((res) => setMetrics(res.metrics)).catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="tiq-card text-danger">{error}</div>
  if (!metrics) return <div className="tiq-card">Loading model metrics…</div>

  return (
    <div className="tiq-card">
      <h6>Model Comparison — MAE / RMSE / R² (Random Forest is primary)</h6>
      {Object.entries(metrics).map(([target, models]) => (
        <div key={target} className="mb-4">
          <div className="fw-semibold mb-2 text-capitalize">{target.replaceAll('_', ' ')}</div>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr><th>Model</th><th>MAE</th><th>RMSE</th><th>R² Score</th></tr>
              </thead>
              <tbody>
                {Object.entries(models).map(([name, m]) => (
                  <tr key={name} style={name === 'RandomForest' ? { background: 'rgba(45,212,191,0.08)', fontWeight: 600 } : {}}>
                    <td>{name}{name === 'RandomForest' ? ' ★' : ''}</td>
                    <td className="mono">{m.MAE}</td>
                    <td className="mono">{m.RMSE}</td>
                    <td className="mono">{m.R2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
