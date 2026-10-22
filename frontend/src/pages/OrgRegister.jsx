import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { api } from '../api/client.js'

export default function OrgRegister() {
  const [form, setForm] = useState({ org_name: '', org_type: 'Bus', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.registerOrganization(form)
      setSuccess(true)
      setTimeout(() => navigate('/organization/login'), 1200)
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
          <h3>Register Organization</h3>
          <div className="sub">For bus operators, railway authorities & airlines.</div>
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label small fw-medium">Organization Name</label>
              <input required className="form-control form-control-tiq"
                value={form.org_name} onChange={(e) => setForm({ ...form, org_name: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">Organization Type</label>
              <select className="form-select form-control-tiq"
                value={form.org_type} onChange={(e) => setForm({ ...form, org_type: e.target.value })}>
                <option>Bus</option>
                <option>Train</option>
                <option>Flight</option>
                <option>Multi-modal</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">Email</label>
              <input type="email" required className="form-control form-control-tiq"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">Phone</label>
              <input className="form-control form-control-tiq"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">Password</label>
              <input type="password" required minLength={6} className="form-control form-control-tiq"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            {error && <div className="text-danger small mb-3">{error}</div>}
            {success && <div className="text-success small mb-3">Account created! Redirecting to login…</div>}
            <button className="btn-amber w-100 py-2" disabled={loading}>
              {loading ? 'Creating…' : 'Create Organization Account'}
            </button>
          </form>
          <div className="text-center mt-3 small">
            <span style={{ color: 'var(--slate)' }}>Already registered? </span>
            <Link to="/organization/login" style={{ color: '#0f9c8b', fontWeight: 600 }}>Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
