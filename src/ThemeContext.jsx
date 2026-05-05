import { createContext, useContext, useState, useEffect } from 'react'
import { themes } from './themes'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('PRESS')

  useEffect(() => {
    const t = themes[theme]
    const root = document.documentElement
    Object.entries(t.vars).forEach(([k, v]) => root.style.setProperty(k, v))
    // Set data-theme so CSS selectors like [data-theme="BRUTAL"] work
    root.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
