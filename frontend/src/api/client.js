const BASE = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data
}

export const api = {
  registerPassenger: (payload) =>
    request('/auth/register/passenger', { method: 'POST', body: JSON.stringify(payload) }),
  loginPassenger: (payload) =>
    request('/auth/login/passenger', { method: 'POST', body: JSON.stringify(payload) }),
  registerOrganization: (payload) =>
    request('/auth/register/organization', { method: 'POST', body: JSON.stringify(payload) }),
  loginOrganization: (payload) =>
    request('/auth/login/organization', { method: 'POST', body: JSON.stringify(payload) }),
  predictPassenger: (payload) =>
    request('/predict/passenger', { method: 'POST', body: JSON.stringify(payload) }),
  predictOrganization: (payload) =>
    request('/predict/organization', { method: 'POST', body: JSON.stringify(payload) }),
  analyticsOverview: () => request('/analytics/overview'),
  modelMetrics: () => request('/model/metrics'),
  history: (userType, id) => request(`/history/${userType}/${id}`),
}
