import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import PassengerResult from '../components/PassengerResult.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'

const SIDEBAR_ITEMS = [
  { key: 'predict', icon: '🔮', label: 'Predict Trip' },
  { key: 'history', icon: '🕘', label: 'Prediction History' },
]

export default function PassengerDashboard() {
  const { passenger, logoutPassenger } = useAuth()
  const navigate = useNavigate()
  const [active, setActive] = useState('predict')

  const [form, setForm] = useState({
    source: 'Chennai', destination: 'Bangalore', travel_date: '', preferred_time: '08:00',
    num_passengers: 1, budget: 1000, transport_mode: 'Bus', weather: 'Clear', traffic: 'Medium',
  })
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!passenger) {
    navigate('/passenger/login')
    return null
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await api.predictPassenger({ ...form, user_id: passenger.id, email: passenger.email })
      setResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    try {
      const res = await api.history('passenger', passenger.id)
      setHistory(res.history)
    } catch (err) {
      setError(err.message)
    }
  }

  const onSelect = (key) => {
    setActive(key)
    if (key === 'history') loadHistory()
  }

  return (
    <div>
      <Navbar />
      <div className="dash-shell">
        <Sidebar
          items={SIDEBAR_ITEMS}
          active={active}
          onSelect={onSelect}
          userLabel={passenger.full_name}
          onLogout={() => { logoutPassenger(); navigate('/') }}
        />
        <div className="dash-main">
          {active === 'predict' && (
            <>
              <div className="section-eyebrow">Passenger Portal</div>
              <h2 className="section-title mb-4">Predict your trip</h2>

              <form onSubmit={submit} className="tiq-card mb-2">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Source</label>
                    <input className="form-control form-control-tiq" required
                      value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Destination</label>
                    <input className="form-control form-control-tiq" required
                      value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Travel Date</label>
                    <input type="date" className="form-control form-control-tiq" required
                      value={form.travel_date} onChange={(e) => setForm({ ...form, travel_date: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Preferred Time</label>
                    <input type="time" className="form-control form-control-tiq"
                      value={form.preferred_time} onChange={(e) => setForm({ ...form, preferred_time: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Passengers</label>
                    <input type="number" min={1} className="form-control form-control-tiq"
                      value={form.num_passengers} onChange={(e) => setForm({ ...form, num_passengers: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Budget (₹)</label>
                    <input type="number" min={0} className="form-control form-control-tiq"
                      value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Preferred Transport</label>
                    <select className="form-select form-control-tiq"
                      value={form.transport_mode} onChange={(e) => setForm({ ...form, transport_mode: e.target.value })}>
                      <option>Bus</option>
                      <option>Train</option>
                      <option>Flight</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Expected Weather</label>
                    <select className="form-select form-control-tiq"
                      value={form.weather} onChange={(e) => setForm({ ...form, weather: e.target.value })}>
                      <option>Clear</option><option>Cloudy</option><option>Rain</option><option>Storm</option><option>Fog</option>
                    </select>
                  </div>
                </div>
                {error && <div className="text-danger small mt-3">{error}</div>}
                <button className="btn-amber mt-4 px-4 py-2" disabled={loading}>
                  {loading ? 'Predicting…' : 'Predict'}
                </button>
              </form>

              <PassengerResult result={result} />
            </>
          )}

          {active === 'history' && (
            <>
              <div className="section-eyebrow">Passenger Portal</div>
              <h2 className="section-title mb-4">Prediction history</h2>
              {history.length === 0 && <div className="tiq-card">No predictions yet — run one from "Predict Trip".</div>}
              <div className="row g-3">
                {history.map((h) => (
                  <div className="col-md-6" key={h.id}>
                    <div className="tiq-card">
                      <div className="d-flex justify-content-between">
                        <strong>{h.source} → {h.destination}</strong>
                        <span className="mono small" style={{ color: 'var(--slate)' }}>{h.travel_date}</span>
                      </div>
                      <div className="small mt-2" style={{ color: 'var(--slate)' }}>
                        Mode: {h.transport_mode} · Demand: {h.predicted_demand} · Occupancy: {h.predicted_occupancy}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
