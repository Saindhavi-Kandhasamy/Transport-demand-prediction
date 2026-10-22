import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import OrgResult from '../components/OrgResult.jsx'
import AnalyticsPanel from '../components/AnalyticsPanel.jsx'
import ModelMetricsPanel from '../components/ModelMetricsPanel.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'

const SIDEBAR_ITEMS = [
  { key: 'predict', icon: '🔮', label: 'Predict Demand' },
  { key: 'analytics', icon: '📈', label: 'Analytics Dashboard' },
  { key: 'model', icon: '🧠', label: 'Model Performance' },
]

export default function OrgDashboard() {
  const { organization, logoutOrganization } = useAuth()
  const navigate = useNavigate()
  const [active, setActive] = useState('predict')

  const [form, setForm] = useState({
    transport_type: 'Bus', source: 'Chennai', destination: 'Bangalore', travel_date: '',
    departure_time: '08:00', fuel_cost: 3500, current_ticket_price: 550, capacity: 45,
    weather: 'Clear', traffic: 'Medium', is_holiday: 0, is_festival: 0,
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!organization) {
    navigate('/organization/login')
    return null
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await api.predictOrganization({
        ...form,
        transport_mode: form.transport_type,
        org_id: organization.id,
      })
      setResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div className="dash-shell">
        <Sidebar
          items={SIDEBAR_ITEMS}
          active={active}
          onSelect={setActive}
          userLabel={organization.org_name}
          onLogout={() => { logoutOrganization(); navigate('/') }}
        />
        <div className="dash-main">
          {active === 'predict' && (
            <>
              <div className="section-eyebrow">Organization Portal</div>
              <h2 className="section-title mb-4">Predict demand & revenue</h2>

              <form onSubmit={submit} className="tiq-card mb-2">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Transport Type</label>
                    <select className="form-select form-control-tiq"
                      value={form.transport_type} onChange={(e) => setForm({ ...form, transport_type: e.target.value })}>
                      <option>Bus</option><option>Train</option><option>Flight</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Route Source</label>
                    <input className="form-control form-control-tiq" required
                      value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Route Destination</label>
                    <input className="form-control form-control-tiq" required
                      value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Travel Date</label>
                    <input type="date" className="form-control form-control-tiq" required
                      value={form.travel_date} onChange={(e) => setForm({ ...form, travel_date: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Departure Time</label>
                    <input type="time" className="form-control form-control-tiq"
                      value={form.departure_time} onChange={(e) => setForm({ ...form, departure_time: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Fuel Cost (₹)</label>
                    <input type="number" className="form-control form-control-tiq"
                      value={form.fuel_cost} onChange={(e) => setForm({ ...form, fuel_cost: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Current Ticket Price (₹)</label>
                    <input type="number" className="form-control form-control-tiq"
                      value={form.current_ticket_price} onChange={(e) => setForm({ ...form, current_ticket_price: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Vehicle Capacity</label>
                    <input type="number" className="form-control form-control-tiq"
                      value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Weather</label>
                    <select className="form-select form-control-tiq"
                      value={form.weather} onChange={(e) => setForm({ ...form, weather: e.target.value })}>
                      <option>Clear</option><option>Cloudy</option><option>Rain</option><option>Storm</option><option>Fog</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Traffic</label>
                    <select className="form-select form-control-tiq"
                      value={form.traffic} onChange={(e) => setForm({ ...form, traffic: e.target.value })}>
                      <option>Low</option><option>Medium</option><option>High</option>
                    </select>
                  </div>
                  <div className="col-md-3 d-flex align-items-end">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="holidayCk"
                        checked={!!form.is_holiday} onChange={(e) => setForm({ ...form, is_holiday: e.target.checked ? 1 : 0 })} />
                      <label className="form-check-label small" htmlFor="holidayCk">Holiday</label>
                    </div>
                  </div>
                  <div className="col-md-3 d-flex align-items-end">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="festCk"
                        checked={!!form.is_festival} onChange={(e) => setForm({ ...form, is_festival: e.target.checked ? 1 : 0 })} />
                      <label className="form-check-label small" htmlFor="festCk">Festival</label>
                    </div>
                  </div>
                </div>
                {error && <div className="text-danger small mt-3">{error}</div>}
                <button className="btn-amber mt-4 px-4 py-2" disabled={loading}>
                  {loading ? 'Predicting…' : 'Run Prediction'}
                </button>
              </form>

              <OrgResult result={result} />
            </>
          )}

          {active === 'analytics' && (
            <>
              <div className="section-eyebrow">Organization Portal</div>
              <h2 className="section-title mb-4">Analytics dashboard</h2>
              <AnalyticsPanel />
            </>
          )}

          {active === 'model' && (
            <>
              <div className="section-eyebrow">Organization Portal</div>
              <h2 className="section-title mb-4">Model performance</h2>
              <ModelMetricsPanel />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
