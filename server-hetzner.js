import http from 'http'
import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID, timingSafeEqual } from 'crypto'
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import busboy from 'busboy'
import Exifr from 'exifr'
import AdmZip from 'adm-zip'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const PHOTOS_DIR = path.join(DATA_DIR, 'photos')
try { fs.mkdirSync(DATA_DIR, { recursive: true }) } catch {}
try { fs.mkdirSync(PHOTOS_DIR, { recursive: true }) } catch {}

const ALLOWED_IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic' }
const ALLOWED_ZIP_TYPES = new Set(['application/zip', 'application/x-zip-compressed', 'application/octet-stream'])
const MAX_PHOTO_BYTES = 12 * 1024 * 1024 // 12MB

const PORT = 11435
const OLLAMA_HOST = '127.0.0.1'
const OLLAMA_PORT = 11434
const MAX_QUEUE = 5
const QUEUE_TIMEOUT = 120000
const RATE_LIMIT = 10
const RATE_WINDOW = 60000

// Admin secret — MUST be set via ADMIN_SECRET env var. No fallback.
const ADMIN_SECRET = process.env.ADMIN_SECRET
if (!ADMIN_SECRET) { console.error('FATAL: ADMIN_SECRET env var not set'); process.exit(1) }

// JWT — MUST be set via JWT_SECRET env var. No fallback.
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) { console.error('FATAL: JWT_SECRET env var not set'); process.exit(1) }
const JWT_EXPIRY = '7d'

// ── SQLite init ────────────────────────────────────────────────────────────────
const db = new Database(path.join(DATA_DIR, 'citeback.db'))
db.pragma('journal_mode = WAL')
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    reputation INTEGER DEFAULT 0,
    tier INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS reputation_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    sighting_id TEXT,
    event_type TEXT NOT NULL,
    points INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_rep_events_user ON reputation_events(user_id);
  CREATE INDEX IF NOT EXISTS idx_rep_events_sighting ON reputation_events(sighting_id);
`)

// Tier thresholds: rep points needed for Tier 0, 1, 2, 3
const TIER_THRESHOLDS = [0, 10, 50, 200]
const TIER_NAMES = ['Scout', 'Operator', 'Verifier', 'Guardian']
const TIER_PERKS = [
  'Submit sightings, build reputation',
  'Campaign access up to $500',
  'Unlock verification bounties',
  'Full operator access + governance voting',
]

function getTierFromRep(rep) {
  let tier = 0
  for (let i = 0; i < TIER_THRESHOLDS.length; i++) {
    if (rep >= TIER_THRESHOLDS[i]) tier = i
  }
  return tier
}

function getPointsToNextTier(rep, tier) {
  if (tier >= TIER_THRESHOLDS.length - 1) return null
  return TIER_THRESHOLDS[tier + 1] - rep
}

function verifyToken(req) {
  try {
    const auth = req.headers['authorization'] || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return null
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
  } catch { return null }
}

function awardReputation(userId, sightingId, eventType, points) {
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO reputation_events (user_id, sighting_id, event_type, points, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, sightingId, eventType, points, now)
  const currentRep = db.prepare('SELECT reputation FROM users WHERE id = ?').get(userId)?.reputation || 0
  const newRep = currentRep + points
  const newTier = getTierFromRep(newRep)
  db.prepare('UPDATE users SET reputation = ?, tier = ? WHERE id = ?').run(newRep, newTier, userId)
  return { newRep, newTier }
}

const stats = { thumbsUp: 0, thumbsDown: 0, busy: 0, rateLimited: 0, total: 0, since: new Date().toISOString() }
const rateCounts = new Map()
function checkRateLimit(ip) {
  const now = Date.now()
  const entry = rateCounts.get(ip)
  if (!entry || now - entry.start > RATE_WINDOW) { rateCounts.set(ip, { count: 1, start: now }); return true }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++; return true
}

let processing = false
const queue = []
function processNext() {
  if (processing || queue.length === 0) return
  processing = true
  const { body, res, timer } = queue.shift()
  clearTimeout(timer)
  const options = {
    hostname: OLLAMA_HOST, port: OLLAMA_PORT, path: '/api/chat', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  }
  const proxy = http.request(options, (ollama) => {
    res.writeHead(ollama.statusCode, { 'Content-Type': 'application/json' })
    ollama.pipe(res)
    ollama.on('end', () => { processing = false; processNext() })
  })
  proxy.on('error', (e) => {
    res.writeHead(502); res.end(JSON.stringify({ error: 'Ollama unavailable', detail: e.message }))
    processing = false; processNext()
  })
  proxy.write(body); proxy.end()
}

const ON_TOPIC_KEYWORDS = [
  'alpr', 'license plate', 'flock', 'flock safety', 'camera', 'surveillance',
  'stingray', 'imsi', 'cell-site', 'cell site', 'shotspotter', 'soundthinking',
  'gunshot detection', 'facial recognition', 'face recognition', 'clearview',
  'dataworks', 'palantir', 'predpol', 'predictive policing', 'predictive polic',
  'drone', 'cctv', 'lpr', 'ptz', 'plate reader', 'plate scan', 'l3harris',
  'vigilant solutions', 'privacy', 'fourth amendment', '4th amendment', 'foia',
  'public records', 'warrant', 'warrantless', 'data retention', 'tracking',
  'surveillance data', 'civil liberties', 'civil rights', 'constitutional',
  'first amendment', 'aclu', 'eff', 'carpenter v', 'police surveillance',
  'immigration enforcement', 'citeback', 'campaign', 'donate', 'donation',
  'monero', 'xmr', 'zano', 'wallet', 'tee ', 'enclave', 'dao ', 'wyoming dao',
  'billboard', 'verification bounty', 'crowdfund', 'new mexico', 'albuquerque',
  'bernalillo', 'taos', 'las cruces', 'alamogordo', 'otero county', 'santa fe',
  'carlsbad nm', 'roswell nm',
]
const INJECTION_SIGNALS = [
  'ignore your', 'ignore previous', 'forget your', 'disregard',
  'pretend you are', 'pretend to be', 'roleplay as', 'act as if you',
  'you are now a', 'new persona', 'jailbreak', 'dan mode', 'developer mode',
  'your system prompt', 'original instructions', 'what were your instructions',
  'your real instructions', 'with no restrictions', 'without restrictions',
]
const OFF_TOPIC_SIGNALS = [
  'alternator', 'carburetor', 'transmission fluid', 'oil change', 'tire rotation',
  'car repair', 'auto repair', 'gmc canyon', 'ford f-150', 'engine oil', 'brake pad',
  'recipe', 'how to cook', 'bake a cake', 'restaurant recommendation', 'best food',
  'netflix show', 'best movie', 'song lyrics', 'video game', 'fortnite',
  'minecraft', 'pokemon', 'nfl game', 'nba game', 'mlb game',
  'ask my boss', 'boss for a raise', 'cover letter', 'quantum physics',
  'capital of france', 'capital of germany', 'capital of china',
  'what is 2+2', 'what is 1+1', 'solve this math',
  'tell me a joke', 'knock knock', 'make me laugh',
  'stocks to buy', 'which stocks', 'stock market advice',
]
function isOnTopic(text) {
  const lower = text.toLowerCase()
  if (INJECTION_SIGNALS.some(s => lower.includes(s))) return false
  const hasOffTopic = OFF_TOPIC_SIGNALS.some(s => lower.includes(s))
  if (!hasOffTopic) return true
  return ON_TOPIC_KEYWORDS.some(k => lower.includes(k))
}
const makeMsg = (content) => ({ model: 'citeback-filter', message: { role: 'assistant', content }, done: true })
const DEFLECT = makeMsg("I'm focused on surveillance resistance and the Citeback platform. Ask me about ALPR cameras, privacy rights, campaigns, how to donate anonymously, or what surveillance technology is deployed near you.")
const BUSY = makeMsg("Our AI handles one conversation at a time — your session stays completely isolated. Send yours again in a few seconds.")
const RATE_LIMITED = makeMsg("Take a breath — our AI runs locally and works through questions one at a time. Try again in a moment.")

// ── Data helpers ──────────────────────────────────────────────────────────────
const appendRecord = (filename, record) => {
  try {
    fs.appendFileSync(
      path.join(DATA_DIR, filename),
      JSON.stringify({ ...record, ts: new Date().toISOString() }) + '\n',
      'utf8'
    )
  } catch (e) { console.error('Write error:', e.message) }
}

const updateRecord = (filename, matchFn, updateFn) => {
  try {
    const file = path.join(DATA_DIR, filename)
    if (!fs.existsSync(file)) return false
    const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)
    let changed = false
    const updated = lines.map(l => {
      try {
        const rec = JSON.parse(l)
        if (matchFn(rec)) { changed = true; return JSON.stringify(updateFn(rec)) }
        return l
      } catch { return l }
    })
    if (changed) fs.writeFileSync(file, updated.join('\n') + '\n', 'utf8')
    return changed
  } catch (e) { console.error('Update error:', e.message); return false }
}

const parseBody = (req) => new Promise((resolve, reject) => {
  let body = ''
  req.on('data', chunk => {
    body += chunk
    if (body.length > 20000) reject(new Error('too large'))
  })
  req.on('end', () => { try { resolve(JSON.parse(body)) } catch { reject(new Error('bad json')) } })
  req.on('error', reject)
})

// Geocode using Nominatim (1 req/sec limit — fine for rare sighting submissions)
const geocode = (address, city, state) => new Promise((resolve) => {
  const q = encodeURIComponent([address, city, state, 'USA'].filter(Boolean).join(', '))
  const opts = {
    hostname: 'nominatim.openstreetmap.org',
    path: `/search?q=${q}&format=json&limit=1`,
    headers: { 'User-Agent': 'citeback.com surveillance map' },
  }
  const req = https.get(opts, (res) => {
    let body = ''
    res.on('data', chunk => body += chunk)
    res.on('end', () => {
      try {
        const results = JSON.parse(body)
        if (results[0]) resolve({ lat: results[0].lat, lng: results[0].lon })
        else resolve(null)
      } catch { resolve(null) }
    })
  })
  req.on('error', () => resolve(null))
  req.setTimeout(8000, () => { req.destroy(); resolve(null) })
})

// Interest counts — in-memory (resets on restart; soft signal only)
const interestCounts = {}

// ── Haversine distance (returns km) ───────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}
const NEW_CAMERA_THRESHOLD_KM = 0.1 // 100 metres

// ── Load OSM camera data at startup for proximity checks ──────────────────────
let osmCameras = []
try {
  const osmPath = path.join(DATA_DIR, 'alpr-us.json')
  if (fs.existsSync(osmPath)) {
    osmCameras = JSON.parse(fs.readFileSync(osmPath, 'utf8'))
    console.log(`Loaded ${osmCameras.length} OSM cameras for proximity check`)
  }
} catch (e) { console.error('OSM load error:', e.message) }

// ── Gemini Flash vision content check ───────────────────────────────────────
async function checkPhotoContent(photoPath) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY
  if (!GEMINI_KEY) {
    console.log('Vision check: no GEMINI_API_KEY — skipping (fail-open)')
    return true
  }
  try {
    const imageData = fs.readFileSync(photoPath)
    const base64Image = imageData.toString('base64')
    const ext = path.extname(photoPath).toLowerCase()
    const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
    const body = JSON.stringify({
      contents: [{
        parts: [
          { inline_data: { mime_type: mimeType, data: base64Image } },
          { text: 'Does this photo show a surveillance camera, ALPR license plate reader, or billboard? Reply only: yes or no.' }
        ]
      }],
      generationConfig: { maxOutputTokens: 10, thinkingConfig: { thinkingBudget: 0 } }
    })
    const result = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_KEY}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      }, (apiRes) => {
        let data = ''
        apiRes.on('data', chunk => data += chunk)
        apiRes.on('end', () => { try { resolve(JSON.parse(data)) } catch { reject(new Error('bad json')) } })
      })
      req.on('error', reject)
      req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')) })
      req.write(body)
      req.end()
    })
    const answer = (result?.candidates?.[0]?.content?.parts?.[0]?.text || '').toLowerCase().trim()
    console.log(`Vision check result: "${answer}"`)
    return answer.startsWith('yes')
  } catch (e) {
    console.error('Vision check error (fail-open):', e.message)
    return true // fail open — don't block legit submissions if API is down
  }
}

function isNewCamera(lat, lng) {
  const fLat = parseFloat(lat), fLng = parseFloat(lng)
  if (isNaN(fLat) || isNaN(fLng)) return false
  // Check OSM dataset
  for (const cam of osmCameras) {
    if (haversine(fLat, fLng, parseFloat(cam.lat), parseFloat(cam.lon)) < NEW_CAMERA_THRESHOLD_KM) return false
  }
  // Check existing approved community sightings
  try {
    const file = path.join(DATA_DIR, 'sightings.jsonl')
    if (fs.existsSync(file)) {
      for (const l of fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)) {
        try {
          const s = JSON.parse(l)
          if (s.status === 'approved' && s.lat && s.lng &&
              haversine(fLat, fLng, parseFloat(s.lat), parseFloat(s.lng)) < NEW_CAMERA_THRESHOLD_KM) return false
        } catch {}
      }
    }
  } catch {}
  return true // genuinely new to our data
}


// ── Auth helper ───────────────────────────────────────────────────────────────
function timingSafeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}
function isAdmin(req, body) {
  // Header-only. Body secret removed to avoid appearing in request body logs.
  const headerSecret = req.headers['x-admin-secret']
  return !!(headerSecret && timingSafeCompare(headerSecret, ADMIN_SECRET))
}

// ── HTTP Server ───────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end() }

  // ── Feedback ───────────────────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/feedback') {
    try {
      const { vote } = await parseBody(req)
      if (vote === 'up') stats.thumbsUp++
      else if (vote === 'down') stats.thumbsDown++
    } catch {}
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ ok: true }))
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  if (req.method === 'GET' && req.url === '/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ ...stats, queueDepth: queue.length, processing, uptime: Math.floor((Date.now() - new Date(stats.since).getTime()) / 1000) + 's' }))
  }

  // ── Campaign interest counter ──────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/interest') {
    try {
      const body = await parseBody(req)
      if (body.action === 'counts') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ counts: { ...interestCounts } }))
      }
      if (body.action === 'increment' && body.campaignId != null) {
        const id = String(body.campaignId)
        interestCounts[id] = (interestCounts[id] || 0) + 1
        res.writeHead(200, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ ok: true, campaignId: id, count: interestCounts[id] }))
      }
      res.writeHead(400); return res.end(JSON.stringify({ error: 'invalid action' }))
    } catch {
      res.writeHead(400); return res.end(JSON.stringify({ error: 'bad request' }))
    }
  }

  // ── Anonymous campaign proposal submission ─────────────────────────────────
  if (req.method === 'POST' && req.url === '/submit') {
    try {
      const body = await parseBody(req)
      const allowed = ['billboard', 'legal', 'foia', 'verify', 'other']
      const type = allowed.includes(body.type) ? body.type : 'other'
      const title = String(body.title || '').slice(0, 200).trim()
      const location = String(body.location || '').slice(0, 200).trim()
      const description = String(body.description || '').slice(0, 2000).trim()
      const goal = Number(body.goal) || 0
      if (!title || !location || !description) { res.writeHead(400); return res.end(JSON.stringify({ error: 'missing fields' })) }
      appendRecord('proposals.jsonl', { type, title, location, description, goal })
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true }))
    } catch {
      res.writeHead(400); return res.end(JSON.stringify({ error: 'bad request' }))
    }
  }

  // ── Account: create ────────────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/account/create') {
    try {
      const body = await parseBody(req)
      const username = String(body.username || '').trim()
      const password = String(body.password || '')

      if (!username || username.length < 3 || username.length > 20) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Username must be 3–20 characters' }))
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Username may only contain letters, numbers, and underscores' }))
      }
      if (!password || password.length < 8) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Password must be at least 8 characters' }))
      }

      const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
      if (existing) {
        res.writeHead(409, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Username already taken' }))
      }

      const id = randomUUID()
      const password_hash = await bcrypt.hash(password, 12)
      const now = new Date().toISOString()
      db.prepare('INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)').run(id, username, password_hash, now)

      const token = jwt.sign({ userId: id, username }, JWT_SECRET, { expiresIn: JWT_EXPIRY })
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({
        ok: true, token, username, userId: id,
        reputation: 0, tier: 0,
        tierName: TIER_NAMES[0], pointsToNext: TIER_THRESHOLDS[1],
        tierThreshold: TIER_THRESHOLDS[1],
      }))
    } catch (e) {
      console.error('account/create error:', e.message)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Server error' }))
    }
  }

  // ── Account: login ─────────────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/account/login') {
    try {
      const body = await parseBody(req)
      const username = String(body.username || '').trim()
      const password = String(body.password || '')

      if (!username || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Username and password required' }))
      }

      const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
      if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Invalid username or password' }))
      }

      const valid = await bcrypt.compare(password, user.password_hash)
      if (!valid) {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Invalid username or password' }))
      }

      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRY })
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({
        ok: true, token, username: user.username, userId: user.id,
        reputation: user.reputation, tier: user.tier,
        tierName: TIER_NAMES[user.tier],
        pointsToNext: getPointsToNextTier(user.reputation, user.tier),
        tierThreshold: TIER_THRESHOLDS[user.tier + 1] ?? null,
      }))
    } catch (e) {
      console.error('account/login error:', e.message)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Server error' }))
    }
  }

  // ── Account: profile ───────────────────────────────────────────────────────
  if (req.method === 'GET' && req.url === '/account/me') {
    const claims = verifyToken(req)
    if (!claims) {
      res.writeHead(401, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Authentication required' }))
    }

    const user = db.prepare('SELECT id, username, reputation, tier, created_at FROM users WHERE id = ?').get(claims.userId)
    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'User not found' }))
    }

    const events = db.prepare('SELECT event_type, points, sighting_id, created_at FROM reputation_events WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(user.id)

    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({
      username: user.username, userId: user.id,
      reputation: user.reputation, tier: user.tier,
      tierName: TIER_NAMES[user.tier], tierPerk: TIER_PERKS[user.tier],
      pointsToNext: getPointsToNextTier(user.reputation, user.tier),
      tierThreshold: TIER_THRESHOLDS[user.tier + 1] ?? null,
      createdAt: user.created_at,
      recentEvents: events,
    }))
  }

  // ── Account: sighting history ──────────────────────────────────────────────
  if (req.method === 'GET' && req.url === '/account/sightings') {
    const claims = verifyToken(req)
    if (!claims) {
      res.writeHead(401, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Authentication required' }))
    }

    try {
      const file = path.join(DATA_DIR, 'sightings.jsonl')
      const lines = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean) : []
      const sightings = lines
        .map(l => { try { return JSON.parse(l) } catch { return null } })
        .filter(s => s && s.userId === claims.userId)
        .map(s => ({
          id: s.id, cameraType: s.cameraType, address: s.address,
          city: s.city, state: s.state, status: s.status,
          ts: s.ts, points: s.reputationPoints || 0,
        }))
        .reverse()

      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ sightings }))
    } catch {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Server error' }))
    }
  }

  // ── Sighting submission — C2PA required, no exceptions ──────────────────────
  if (req.method === 'POST' && req.url === '/sighting') {
    const contentType = req.headers['content-type'] || ''
    const isMultipart = contentType.includes('multipart/form-data')
    let fields = {}, photoFilename = null, detectedC2PA = false, photoWritePromise = Promise.resolve()

    try {
      if (isMultipart) {
        await new Promise((resolve, reject) => {
          const bb = busboy({ headers: req.headers, limits: { fileSize: MAX_PHOTO_BYTES, files: 1 } })
          bb.on('field', (name, val) => { fields[name] = val })
          bb.on('file', (name, stream, info) => {
            const isImage = !!ALLOWED_IMAGE_TYPES[info.mimeType]
            const isZip = ALLOWED_ZIP_TYPES.has(info.mimeType) || (info.filename || '').toLowerCase().endsWith('.zip')
            if (!isImage && !isZip) { stream.resume(); return }
            const ext = isZip ? 'zip' : ALLOWED_IMAGE_TYPES[info.mimeType]
            const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`
            const dest = path.join(PHOTOS_DIR, filename)
            const out = fs.createWriteStream(dest)
            let size = 0
            stream.on('data', chunk => {
              size += chunk.length
              if (size > MAX_PHOTO_BYTES) { out.destroy(); fs.unlink(dest, () => {}); stream.resume(); return }
              out.write(chunk)
            })
            stream.on('end', () => {
              photoWritePromise = new Promise((res, rej) => {
                out.end()
                out.on('finish', () => { photoFilename = filename; res() })
                out.on('error', rej)
              })
            })
            stream.on('error', () => { out.destroy(); fs.unlink(dest, () => {}) })
          })
          bb.on('finish', async () => { try { await photoWritePromise; resolve() } catch (e) { reject(e) } })
          bb.on('error', reject)
          req.pipe(bb)
        })

        // If zip uploaded (Proofmode bundle): extract JPEG + proof.json
        if (photoFilename && photoFilename.endsWith('.zip')) {
          try {
            const zipPath = path.join(PHOTOS_DIR, photoFilename)
            const zip = new AdmZip(zipPath)
            const entries = zip.getEntries()
            console.log('zip entries:', entries.map(e => e.entryName))
            // Find the JPEG photo entry
            const jpegEntry = entries.find(e => /\.(jpg|jpeg)$/i.test(e.entryName) && !e.isDirectory)
            // Find proof.json for GPS
            const proofEntry = entries.find(e => /proof\.json$/i.test(e.entryName))
            if (jpegEntry) {
              const jpegFilename = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}.jpg`
              const jpegDest = path.join(PHOTOS_DIR, jpegFilename)
              // Use readFile (not extractEntryTo) to avoid zip path traversal — entry names can
              // contain '../' sequences that escape PHOTOS_DIR if written directly to disk.
              const jpegData = zip.readFile(jpegEntry)
              if (!jpegData) throw new Error('could not read JPEG from zip')
              fs.writeFileSync(jpegDest, jpegData)
              // Delete the zip, keep only the JPEG
              fs.unlink(zipPath, () => {})
              photoFilename = jpegFilename
            }
            // Read GPS from proof.json — Proofmode on iOS doesn't write GPS to JPEG EXIF
            // C2PA on the JPEG is the authenticity gate; proof.json GPS is acceptable
            if (proofEntry) {
              try {
                const proof = JSON.parse(proofEntry.getData().toString('utf8'))
                console.log('proof.json keys:', Object.keys(proof).slice(0, 20))
                console.log('proof.json sample:', JSON.stringify(proof).slice(0, 400))
                // Proofmode uses flat dot-notation keys: 'LOCATION.LATITUDE'
                // Proofmode schema v1: 'Location.Latitude' / 'Location.Longitude'
                const lat = proof['Location.Latitude'] ?? proof['LOCATION.LATITUDE'] ?? proof['location.latitude'] ?? null
                const lng = proof['Location.Longitude'] ?? proof['LOCATION.LONGITUDE'] ?? proof['location.longitude'] ?? null
                if (lat && lng) {
                  fields._proofLat = String(lat)
                  fields._proofLng = String(lng)
                  console.log('proof.json GPS:', lat, lng)
                }
              } catch (pe) { console.error('proof.json parse error:', pe.message) }
            }
          } catch (e) {
            console.error('zip extract error:', e.message)
          }
        }

        // C2PA detection: JPEG APP11 marker (0xFF 0xEB) or XMP content credentials tag
        if (photoFilename) {
          try {
            const buf = Buffer.allocUnsafe(8192)
            const fd = fs.openSync(path.join(PHOTOS_DIR, photoFilename), 'r')
            fs.readSync(fd, buf, 0, 8192, 0)
            fs.closeSync(fd)
            const str = buf.toString('latin1')
            detectedC2PA = (buf[0] === 0xFF && buf[1] === 0xEB) ||
              str.includes('c2pa') || str.includes('C2PA') || str.includes('contentauthenticity')
          } catch {}
        }
      } else {
        fields = await parseBody(req)
      }

      // Rate limit non-trusted submissions BEFORE expensive vision check
      const trusted = isAdmin(req, fields)
      if (!trusted && !checkRateLimit(ip)) {
        if (photoFilename) fs.unlink(path.join(PHOTOS_DIR, photoFilename), () => {})
        res.writeHead(429, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Rate limit exceeded. Please wait a minute before submitting again.' }))
      }
      if (fields.honeypot) { res.writeHead(200); return res.end(JSON.stringify({ ok: true })) }

      const hasC2PA = detectedC2PA || fields.hasC2PA === 'true' || fields.hasC2PA === true
      const hasPhoto = !!photoFilename

      // ── Non-C2PA = rejected. Photo deleted. Not stored. ──────────────────────
      if (!trusted && (!hasPhoto || !hasC2PA)) {
        if (photoFilename) fs.unlink(path.join(PHOTOS_DIR, photoFilename), () => {})
        res.writeHead(422, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({
          error: 'C2PA-verified photo required.',
          hint: 'Shoot with Proofmode (iOS/Android), Samsung Galaxy S24+, or Google Pixel 10.',
        }))
      }

      const allowedTypes = ['alpr', 'shotspotter', 'facial', 'cctv', 'drone', 'unknown']
      const cameraType = allowedTypes.includes(fields.cameraType) ? fields.cameraType : 'unknown'
      const address = String(fields.address || fields.location || '').slice(0, 300).trim()
      const city = String(fields.city || '').slice(0, 100).trim()
      const state = String(fields.state || '').slice(0, 2).trim().toUpperCase()
      const notes = String(fields.notes || '').slice(0, 1000).trim()
      const lat = fields.lat != null ? String(fields.lat).slice(0, 20) : null
      const lng = fields.lng != null ? String(fields.lng).slice(0, 20) : null

      // address is optional — lat/lng from EXIF or client is the primary location source

      const claims = verifyToken(req)
      const userId = claims?.userId || null

      let finalLat = lat, finalLng = lng

      // Use proof.json GPS from Proofmode zip (iOS doesn't write GPS to JPEG EXIF)
      if (!finalLat || !finalLng) {
        if (fields._proofLat && fields._proofLng) {
          finalLat = fields._proofLat
          finalLng = fields._proofLng
          console.log('Using proof.json GPS:', finalLat, finalLng)
        }
      }

      // Try EXIF GPS from JPEG as well (for non-zip uploads)
      if ((!finalLat || !finalLng) && photoFilename) {
        try {
          const gps = await Exifr.gps(path.join(PHOTOS_DIR, photoFilename))
          if (gps?.latitude && gps?.longitude) {
            finalLat = String(gps.latitude)
            finalLng = String(gps.longitude)
            console.log(`EXIF GPS extracted: ${finalLat}, ${finalLng}`)
          }
        } catch {}
      }

      // No geocode fallback — GPS must come from photo or proof.json
      if (!finalLat || !finalLng) {
        if (photoFilename) fs.unlink(path.join(PHOTOS_DIR, photoFilename), () => {})
        res.writeHead(422, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({
          error: 'No GPS coordinates found in photo. Make sure Location is enabled in Proofmode before shooting.',
          hint: 'Settings → Location → ON in Proofmode app',
        }))
      }

      // Vision content check — confirm photo actually shows a camera/ALPR/billboard
      if (!trusted) {
        const isCamera = await checkPhotoContent(path.join(PHOTOS_DIR, photoFilename))
        if (!isCamera) {
          fs.unlink(path.join(PHOTOS_DIR, photoFilename), () => {})
          res.writeHead(422, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify({
            error: 'Photo does not appear to show a surveillance camera, ALPR reader, or billboard.',
            hint: 'Make sure your photo clearly shows the surveillance device.',
          }))
        }
      }

      // Proximity check: new camera = +2 pts, existing = +1 pt
      const newCamera = (finalLat && finalLng) ? isNewCamera(finalLat, finalLng) : false
      const reputationPoints = userId ? (newCamera ? 2 : 1) : 0

      // C2PA verified = straight to approved, live on map immediately
      const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      appendRecord('sightings.jsonl', {
        id, cameraType, address, city, state,
        lat: finalLat, lng: finalLng, notes,
        hasPhoto: true, photoFilename,
        hasC2PA: true, status: 'approved', newCamera,
        userId: userId || null,
        reputationPoints,
      })

      let repResult = null
      if (userId && reputationPoints > 0) {
        repResult = awardReputation(userId, id, newCamera ? 'sighting_new' : 'sighting_confirmed', reputationPoints)
      }

      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({
        ok: true, id, newCamera,
        liveonmap: true,
        ...(repResult ? {
          reputationAwarded: reputationPoints,
          newReputation: repResult.newRep,
          newTier: repResult.newTier,
          tierName: TIER_NAMES[repResult.newTier],
          pointsToNext: getPointsToNextTier(repResult.newRep, repResult.newTier),
        } : {}),
      }))
    } catch (e) {
      if (photoFilename) fs.unlink(path.join(PHOTOS_DIR, photoFilename), () => {})
      console.error('sighting error:', e.message)
      res.writeHead(400); return res.end(JSON.stringify({ error: 'bad request' }))
    }
  }

  // ── Expert directory application ─────────────────────────────────────────
    // ── Expert directory application ─────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/registry') {
    try {
      const body = await parseBody(req)
      const roles = ['attorney', 'journalist', 'advocate', 'researcher', 'organizer', 'other']
      const role = roles.includes(body.role) ? body.role : 'other'
      const location = String(body.location || '').slice(0, 200).trim()
      const background = String(body.background || '').slice(0, 2000).trim()
      if (!location || !background) { res.writeHead(400); return res.end(JSON.stringify({ error: 'missing fields' })) }
      appendRecord('registry.jsonl', { role, location, background })
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true }))
    } catch {
      res.writeHead(400); return res.end(JSON.stringify({ error: 'bad request' }))
    }
  }

  // ── Serve sighting photos ──────────────────────────────────────────────
  if (req.method === 'GET' && req.url.startsWith('/photos/')) {
    try {
      // Strict filename validation — only alphanumeric, underscores, hyphens, dots
      // No path traversal possible: reject anything with '/' or '..'
      const raw = decodeURIComponent(req.url.slice('/photos/'.length))
      if (!raw || /[/\\]/.test(raw) || raw.includes('..') || !/^[\w.-]+$/.test(raw)) {
        res.writeHead(400); return res.end('bad filename')
      }
      const filePath = path.join(PHOTOS_DIR, raw)
      if (!fs.existsSync(filePath)) { res.writeHead(404); return res.end('not found') }
      const ext = path.extname(raw).toLowerCase()
      const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.heic': 'image/heic' }
      const mime = mimeMap[ext] || 'application/octet-stream'
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': 'private, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
      })
      fs.createReadStream(filePath).pipe(res)
      return
    } catch {
      res.writeHead(500); return res.end('server error')
    }
  }

  // ── Public sightings (community map layer) ─── ONLY approved ────────────
  if (req.method === 'GET' && req.url === '/sightings/public') {
    try {
      const file = path.join(DATA_DIR, 'sightings.jsonl')
      const lines = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean) : []
      const sightings = lines
        .map(l => { try { return JSON.parse(l) } catch { return null } })
        .filter(s => s && s.lat && s.lng && s.status === 'approved')
        .map(s => ({ id: s.id, cameraType: s.cameraType, address: s.address, city: s.city, state: s.state, lat: s.lat, lng: s.lng, notes: s.notes, ts: s.ts, newCamera: s.newCamera, hasC2PA: s.hasC2PA, photoFilename: s.photoFilename }))
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ sightings }))
    } catch {
      res.writeHead(500); return res.end(JSON.stringify({ error: 'server error' }))
    }
  }

  // ── Admin: list pending sightings ─────────────────────────────────────────
  if (req.method === 'GET' && req.url.startsWith('/admin/sightings')) {
    if (!isAdmin(req, {})) { res.writeHead(401); return res.end(JSON.stringify({ error: 'unauthorized' })) }
    try {
      const file = path.join(DATA_DIR, 'sightings.jsonl')
      const lines = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean) : []
      const all = lines.map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
      const pending = all.filter(s => s.status === 'pending')
      const approved = all.filter(s => s.status === 'approved')
      const rejected = all.filter(s => s.status === 'rejected')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ pending, approved, rejected, total: all.length }))
    } catch {
      res.writeHead(500); return res.end(JSON.stringify({ error: 'server error' }))
    }
  }

  // ── Admin: approve or reject a sighting ───────────────────────────────────
  if (req.method === 'POST' && req.url === '/admin/sightings/moderate') {
    try {
      const body = await parseBody(req)
      if (!isAdmin(req, body)) { res.writeHead(401); return res.end(JSON.stringify({ error: 'unauthorized' })) }
      const { id, action } = body
      if (!id || !['approve', 'reject'].includes(action)) {
        res.writeHead(400); return res.end(JSON.stringify({ error: 'id and action (approve|reject) required' }))
      }
      const newStatus = action === 'approve' ? 'approved' : 'rejected'
      const changed = updateRecord('sightings.jsonl', s => s.id === id, s => ({ ...s, status: newStatus, moderatedAt: new Date().toISOString() }))
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: changed, id, status: newStatus }))
    } catch {
      res.writeHead(400); return res.end(JSON.stringify({ error: 'bad request' }))
    }
  }

  // ── Admin: bulk approve all pending sightings with lat/lng ────────────────
  if (req.method === 'POST' && req.url === '/admin/sightings/approve-all') {
    try {
      const body = await parseBody(req)
      if (!isAdmin(req, body)) { res.writeHead(401); return res.end(JSON.stringify({ error: 'unauthorized' })) }
      const file = path.join(DATA_DIR, 'sightings.jsonl')
      if (!fs.existsSync(file)) { res.writeHead(200); return res.end(JSON.stringify({ ok: true, approved: 0 })) }
      const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)
      let count = 0
      const now = new Date().toISOString()
      const updated = lines.map(l => {
        try {
          const rec = JSON.parse(l)
          if (rec.status === 'pending' && rec.lat && rec.lng) {
            count++
            return JSON.stringify({ ...rec, status: 'approved', moderatedAt: now })
          }
          return l
        } catch { return l }
      })
      fs.writeFileSync(file, updated.join('\n') + '\n', 'utf8')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true, approved: count }))
    } catch {
      res.writeHead(400); return res.end(JSON.stringify({ error: 'bad request' }))
    }
  }

  // ── AI chat ────────────────────────────────────────────────────────────────
  if (req.method !== 'POST' || req.url !== '/api/chat') {
    res.writeHead(404); return res.end('Not found')
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown'
  stats.total++

  let rawBody = ''
  req.on('data', chunk => rawBody += chunk)
  req.on('end', () => {
    let parsed
    try { parsed = JSON.parse(rawBody) } catch { res.writeHead(400); return res.end('Bad request') }
    const messages = parsed.messages || []
    const lastUser = [...messages].reverse().find(m => m.role === 'user')
    const userText = lastUser?.content || ''
    if (!checkRateLimit(ip)) {
      stats.rateLimited++
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify(RATE_LIMITED))
    }
    if (!isOnTopic(userText)) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify(DEFLECT))
    }
    if (queue.length >= MAX_QUEUE) {
      stats.busy++
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify(BUSY))
    }
    const timer = setTimeout(() => {
      const idx = queue.findIndex(q => q.res === res)
      if (idx !== -1) { queue.splice(idx, 1); stats.busy++ }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(BUSY))
    }, QUEUE_TIMEOUT)
    queue.push({ body: rawBody, res, timer })
    processNext()
  })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Citeback proxy :${PORT} | queue:${MAX_QUEUE} | rate:${RATE_LIMIT}req/min | data:${DATA_DIR} | auth:enabled | admin:enabled`)
})
