import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function OrgLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginOrganization } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.loginOrganization(form)
      loginOrganization(res.user)
      navigate('/organization/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div className="auth-shell">
        <div className="auth-card">
          <h3>Organization Login</h3>
          <div className="sub">Access demand forecasts, revenue predictions & AI suggestions.</div>
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label small fw-medium">Email</label>
              <input type="email" required className="form-control form-control-tiq"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">Password</label>
              <input type="password" required className="form-control form-control-tiq"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            {error && <div className="text-danger small mb-3">{error}</div>}
            <button className="btn-amber w-100 py-2" disabled={loading}>
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>
          <div className="text-center mt-3 small">
            <span style={{ color: 'var(--slate)' }}>No account? </span>
            <Link to="/organization/register" style={{ color: '#0f9c8b', fontWeight: 600 }}>Register</Link>
          </div>
          <div className="text-center mt-2 small">
            <Link to="/passenger/login" style={{ color: 'var(--slate)' }}>Passenger login →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
