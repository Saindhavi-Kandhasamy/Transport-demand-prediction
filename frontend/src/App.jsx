import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import PassengerLogin from './pages/PassengerLogin.jsx'
import PassengerRegister from './pages/PassengerRegister.jsx'
import PassengerDashboard from './pages/PassengerDashboard.jsx'
import OrgLogin from './pages/OrgLogin.jsx'
import OrgRegister from './pages/OrgRegister.jsx'
import OrgDashboard from './pages/OrgDashboard.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/passenger/login" element={<PassengerLogin />} />
      <Route path="/passenger/register" element={<PassengerRegister />} />
      <Route path="/passenger/dashboard" element={<PassengerDashboard />} />
      <Route path="/organization/login" element={<OrgLogin />} />
      <Route path="/organization/register" element={<OrgRegister />} />
      <Route path="/organization/dashboard" element={<OrgDashboard />} />
    </Routes>
  )
}
