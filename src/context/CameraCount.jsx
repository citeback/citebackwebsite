import { createContext, useContext, useEffect, useState } from 'react'

const CameraCountContext = createContext(null)

const CACHE_KEY = 'citeback_camera_count'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

async function fetchCameraCount() {
  const query = `[out:json][timeout:25];
node["man_made"="surveillance"]["surveillance:type"="ALPR"];
out count;`

  const res = await fetch('/.netlify/functions/proxy?service=overpass', {
    method: 'POST',
    body: query,
  })
  if (!res.ok) throw new Error('Overpass error')
  const data = await res.json()
  return data?.elements?.[0]?.tags?.total ?? null
}

function getInitialCount() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.count
  } catch (_) {}
  return null
}

export function CameraCountProvider({ children }) {
  const [count, setCount] = useState(getInitialCount)

  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
      if (cached && Date.now() - cached.ts < CACHE_TTL) return // already loaded synchronously
    } catch (_) {}

    fetchCameraCount()
      .then(n => {
        if (n != null) {
          setCount(n)
          localStorage.setItem(CACHE_KEY, JSON.stringify({ count: n, ts: Date.now() }))
        }
      })
      .catch(() => {}) // silent — fallback text handles it
  }, [])

  return (
    <CameraCountContext.Provider value={count}>
      {children}
    </CameraCountContext.Provider>
  )
}

/** Returns a formatted string like "94,231+" or "92,000+" if still loading */
export function useCameraCount(fallback = '92,000+') {
  const count = useContext(CameraCountContext)
  if (count == null) return fallback
  return count.toLocaleString() + '+'
}
