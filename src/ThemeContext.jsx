import { createContext, useContext, useState, useEffect } from 'react'
import { themes } from './themes'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('citeback-theme') || 'COLD' } catch { return 'COLD' }
  })

  useEffect(() => {
    const t = themes[theme]
    const root = document.documentElement
    Object.entries(t.vars).forEach(([k, v]) => root.style.setProperty(k, v))
    root.setAttribute('data-theme', theme)
    try { localStorage.setItem('citeback-theme', theme) } catch {}
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
