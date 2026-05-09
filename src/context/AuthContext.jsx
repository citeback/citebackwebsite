import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

import { API_BASE as AI_URL } from '../config.js'
const USER_KEY = 'citeback_user'
// Clean up old token-based localStorage on first load (one-time migration)
try { localStorage.removeItem('citeback_token') } catch {}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })
  // reauthUntil is NOT persisted — clears on page refresh for security
  const reauthUntilRef = useRef(0)

  // Persist user to localStorage (for UI persistence across page loads)
  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  }, [user])

  const login = useCallback(async (username, password) => {
    const res = await fetch(`${AI_URL}/account/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    setUser({
      username: data.username, userId: data.userId,
      reputation: data.reputation, tier: data.tier,
      tierName: data.tierName, pointsToNext: data.pointsToNext,
      tierThreshold: data.tierThreshold,
      hasEmail: data.hasEmail ?? false,
    })
    return data
  }, [])

  const createAccount = useCallback(async (username, password, email = null) => {
    const res = await fetch(`${AI_URL}/account/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password, ...(email ? { email } : {}) }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Account creation failed')
    setUser({
      username: data.username, userId: data.userId,
      reputation: data.reputation, tier: data.tier,
      tierName: data.tierName, pointsToNext: data.pointsToNext,
      tierThreshold: data.tierThreshold,
      hasEmail: data.hasEmail ?? false,
    })
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch(`${AI_URL}/account/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch { /* best-effort — clear state regardless */ }
    setUser(null)
    reauthUntilRef.current = 0
  }, [])

  // Step-up auth: verify password for high-stakes actions
  // Returns reauthUntil timestamp; throws on bad password
  const reauth = useCallback(async (password) => {
    if (!user) throw new Error('Not logged in')
    const res = await fetch(`${AI_URL}/account/reauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Reauth failed')
    reauthUntilRef.current = data.reauthUntil
    return data.reauthUntil
  }, [user])

  // Returns true if the user has re-authenticated within the last 5 minutes
  const isReauthed = useCallback(() => {
    return reauthUntilRef.current > Date.now()
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch(`${AI_URL}/account/me`, {
        credentials: 'include',
      })
      if (!res.ok) { setUser(null); return }
      const data = await res.json()
      setUser({
        username: data.username, userId: data.userId,
        reputation: data.reputation, tier: data.tier,
        tierName: data.tierName, tierPerk: data.tierPerk,
        pointsToNext: data.pointsToNext,
        tierThreshold: data.tierThreshold,
        createdAt: data.createdAt,
        recentEvents: data.recentEvents,
        hasEmail: data.hasEmail ?? false,
      })
    } catch { /* network error, keep existing user state */ }
  }, [])

  // Verify session on mount (cookie may have expired)
  useEffect(() => {
    if (user) refreshUser()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, login, createAccount, logout, refreshUser, authHeaders: {}, isLoggedIn: !!user, reauth, isReauthed }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
