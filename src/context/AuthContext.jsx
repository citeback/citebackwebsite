import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

import { API_BASE as AI_URL } from '../config.js'
const TOKEN_KEY = 'citeback_token'
const USER_KEY = 'citeback_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })
  // reauthUntil is NOT persisted — clears on page refresh for security
  const reauthUntilRef = useRef(0)

  // Persist to localStorage whenever they change
  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  }, [user])

  const login = useCallback(async (username, password) => {
    const res = await fetch(`${AI_URL}/account/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    setToken(data.token)
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
      body: JSON.stringify({ username, password, ...(email ? { email } : {}) }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Account creation failed')
    setToken(data.token)
    setUser({
      username: data.username, userId: data.userId,
      reputation: data.reputation, tier: data.tier,
      tierName: data.tierName, pointsToNext: data.pointsToNext,
      tierThreshold: data.tierThreshold,
      hasEmail: data.hasEmail ?? false,
    })
    return data
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    reauthUntilRef.current = 0
  }, [])

  // Step-up auth: verify password for high-stakes actions
  // Returns reauthUntil timestamp; throws on bad password
  const reauth = useCallback(async (password) => {
    if (!token) throw new Error('Not logged in')
    const res = await fetch(`${AI_URL}/account/reauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Reauth failed')
    reauthUntilRef.current = data.reauthUntil
    return data.reauthUntil
  }, [token])

  // Returns true if the user has re-authenticated within the last 5 minutes
  const isReauthed = useCallback(() => {
    return reauthUntilRef.current > Date.now()
  }, [])

  const refreshUser = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${AI_URL}/account/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) { logout(); return }
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
  }, [token, logout])

  // Refresh user on mount if we have a token
  useEffect(() => {
    if (token) refreshUser()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

  return (
    <AuthContext.Provider value={{ token, user, login, createAccount, logout, refreshUser, authHeaders, isLoggedIn: !!token, reauth, isReauthed }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
