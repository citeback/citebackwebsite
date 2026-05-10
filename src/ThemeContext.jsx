import { createContext, useContext, useEffect } from 'react'
import { themes } from './themes'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  useEffect(() => {
    const t = themes['PRESS']
    const root = document.documentElement
    Object.entries(t.vars).forEach(([k, v]) => root.style.setProperty(k, v))
    root.setAttribute('data-theme', 'PRESS')
    // Clear any stale dark theme from localStorage
    try { localStorage.removeItem('citeback-theme') } catch {}
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: 'PRESS', themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
