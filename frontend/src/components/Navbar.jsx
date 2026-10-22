import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="tiq-navbar">
      <div className="container d-flex align-items-center justify-content-between">
        <Link to="/" className="brand">
          <span>Transit<span className="dot">IQ</span></span>
        </Link>
        <div className="d-none d-lg-flex align-items-center">
          <Link to="/#about" className="nav-link-custom">About</Link>
          <Link to="/#features" className="nav-link-custom">Features</Link>
          <Link to="/#contact" className="nav-link-custom">Contact</Link>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Link to="/passenger/login" className="btn-outline-teal">Passenger Login</Link>
          <Link to="/organization/login" className="btn-amber">Organization Login</Link>
        </div>
      </div>
    </nav>
  )
}
