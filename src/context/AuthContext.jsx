import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AI_URL = 'https://ai.citeback.com'
const TOKEN_KEY = 'citeback_token'
const USER_KEY = 'citeback_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })

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
    })
    return data
  }, [])

  const createAccount = useCallback(async (username, password) => {
    const res = await fetch(`${AI_URL}/account/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Account creation failed')
    setToken(data.token)
    setUser({
      username: data.username, userId: data.userId,
      reputation: data.reputation, tier: data.tier,
      tierName: data.tierName, pointsToNext: data.pointsToNext,
      tierThreshold: data.tierThreshold,
    })
    return data
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
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
      })
    } catch { /* network error, keep existing user state */ }
  }, [token, logout])

  // Refresh user on mount if we have a token
  useEffect(() => {
    if (token) refreshUser()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

  return (
    <AuthContext.Provider value={{ token, user, login, createAccount, logout, refreshUser, authHeaders, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
