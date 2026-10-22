import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // In-memory session (no browser storage per artifact/runtime constraints in some
  // environments; for a real deployment this can be swapped for a JWT + cookie).
  const [passenger, setPassenger] = useState(null)
  const [organization, setOrganization] = useState(null)

  const value = {
    passenger,
    organization,
    loginPassenger: (u) => setPassenger(u),
    logoutPassenger: () => setPassenger(null),
    loginOrganization: (u) => setOrganization(u),
    logoutOrganization: () => setOrganization(null),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
