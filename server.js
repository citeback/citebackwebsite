import http from 'http'
import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID, timingSafeEqual, createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto'
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import busboy from 'busboy'
import Exifr from 'exifr'
import AdmZip from 'adm-zip'
import { createC2pa } from 'c2pa-node'
import nodemailer from 'nodemailer'
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'

// ── Password entropy check ───────────────────────────────────────────────────
const COMMON_PASSWORDS = new Set([
  'password','password1','password123','12345678','123456789','1234567890',
  'qwerty123','qwerty','abc12345','letmein','welcome','monkey','dragon',
  'master','sunshine','princess','shadow','superman','iloveyou','trustno1',
  'baseball','football','soccer','hockey','batman','starwars','minecraft',
  'passw0rd','p@ssword','p@ssw0rd','admin123','login123','secret','hunter2',
  'citeback','surveillance','privacy','anonymous','freedom','liberty',
])

function checkPasswordStrength(pw) {
  const lower = pw.toLowerCase()
  if (COMMON_PASSWORDS.has(lower)) return 'Password is too common — choose something unique'

  // Character class scoring
  const hasLower = /[a-z]/.test(pw)
  const hasUpper = /[A-Z]/.test(pw)
  const hasDigit = /[0-9]/.test(pw)
  const hasSymbol = /[^a-zA-Z0-9]/.test(pw)
  const classes = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length

  // Rough entropy: log2(charset_size) * length
  const charsetSize = (hasLower ? 26 : 0) + (hasUpper ? 26 : 0) + (hasDigit ? 10 : 0) + (hasSymbol ? 32 : 0)
  const entropy = Math.log2(charsetSize) * pw.length

  if (entropy < 55) {
    if (classes === 1) {
      return 'Password too weak — mix in uppercase letters, numbers, or symbols'
    }
    return 'Password too weak — try a longer password or mix character types'
  }

  // Reject all-same or simple sequences
  if (/^(.)/u.test(pw) && pw.split('').every(c => c === pw[0])) return 'Password too weak — avoid repeated characters'

  return null // passes
}

// ── Magic bytes validation (Content-Type can be spoofed; bytes cannot) ────────
function validateMagicBytes(buf, mimeType) {
  if (!buf || buf.length < 12) return false
  if (mimeType === 'image/jpeg') return buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF
  if (mimeType === 'image/png') return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47
  if (mimeType === 'image/webp') return buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP'
  if (mimeType === 'image/heic') return buf.slice(4, 8).toString('ascii') === 'ftyp'
  // ZIP (Proofmode bundles): PK signature
  if (['application/zip', 'application/x-zip-compressed', 'application/octet-stream'].includes(mimeType))
    return buf[0] === 0x50 && buf[1] === 0x4B
  return false
}

// ── Strip EXIF/XMP/IPTC from JPEG before serving (protects GPS + camera info) ─
// Removes all APP1-APP15 segments; keeps APP0 (JFIF), SOF, SOS, and image data.
function stripJpegExif(filePath) {
  try {
    const buf = fs.readFileSync(filePath)
    if (buf[0] !== 0xFF || buf[1] !== 0xD8) return // Not JPEG
    const out = [buf.slice(0, 2)] // SOI
    let i = 2
    while (i < buf.length - 1) {
      if (buf[i] !== 0xFF) { out.push(buf.slice(i)); break }
      const marker = buf[i + 1]
      if (marker === 0xDA) { out.push(buf.slice(i)); break } // SOS — image data follows
      if (i + 3 >= buf.length) break
      const segLen = buf.readUInt16BE(i + 2)
      if (segLen < 2) break
      // APP1 (0xE1 = Exif/XMP) through APP15 (0xEF) — strip all
      // Exception: APP11 (0xEB) is used by C2PA manifests — preserve it
      if (marker >= 0xE1 && marker <= 0xEF && marker !== 0xEB) {
        i += 2 + segLen
      } else {
        out.push(buf.slice(i, i + 2 + segLen))
        i += 2 + segLen
      }
    }
    fs.writeFileSync(filePath, Buffer.concat(out))
  } catch { /* non-fatal: serve original if stripping fails */ }
}

// Real cryptographic C2PA verification — not string matching
const c2paReader = createC2pa()
async function verifyC2PA(filePath) {
  try {
    const result = await c2paReader.read({ path: filePath })
    // result is null if no C2PA manifest present
    if (!result) return false
    // Check that a manifest store exists and has at least one manifest
    return !!(result.manifest_store && Object.keys(result.manifest_store).length > 0)
  } catch (e) {
    console.log('C2PA verify error (not a C2PA image):', e.message?.slice(0, 80))
    return false
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const PHOTOS_DIR = path.join(DATA_DIR, 'photos')
try { fs.mkdirSync(DATA_DIR, { recursive: true }) } catch {}
// ── Version / verification info ───────────────────────────────────────────────
const SERVER_FILE = path.join(__dirname, 'server.js')
let SERVER_SHA256 = 'unknown'
const DEPLOYED_AT = new Date().toISOString()
try {
  const serverBytes = fs.readFileSync(SERVER_FILE)
  SERVER_SHA256 = createHash('sha256').update(serverBytes).digest('hex')
  fs.writeFileSync(path.join(__dirname, '.version'), JSON.stringify({
    sha256: SERVER_SHA256, deployedAt: DEPLOYED_AT,
    repo: 'https://github.com/citeback/citebackwebsite',
  }))
} catch (e) { console.error('version hash error:', e.message) }
console.log('Server SHA-256:', SERVER_SHA256)


try { fs.mkdirSync(PHOTOS_DIR, { recursive: true }) } catch {}

const ALLOWED_IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic' }
const ALLOWED_ZIP_TYPES = new Set(['application/zip', 'application/x-zip-compressed', 'application/octet-stream'])
const MAX_PHOTO_BYTES = 12 * 1024 * 1024 // 12MB per upload
const MAX_PHOTOS_DIR_BYTES = 10 * 1024 * 1024 * 1024 // 10GB total photos dir hard cap

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

// Email encryption key — 32 bytes derived from JWT_SECRET for AES-256-GCM
const EMAIL_ENC_KEY = createHash('sha256').update(JWT_SECRET + ':email-enc-v1').digest()

function encryptEmail(email) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', EMAIL_ENC_KEY, iv)
  const enc = Buffer.concat([cipher.update(email.toLowerCase().trim(), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return iv.toString('hex') + ':' + tag.toString('hex') + ':' + enc.toString('hex')
}

function decryptEmail(stored) {
  try {
    const [ivHex, tagHex, encHex] = stored.split(':')
    const decipher = createDecipheriv('aes-256-gcm', EMAIL_ENC_KEY, Buffer.from(ivHex, 'hex'))
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
    return decipher.update(Buffer.from(encHex, 'hex')) + decipher.final('utf8')
  } catch { return null }
}

// Email transport — configured via SMTP_* env vars (optional; recovery disabled if unset)
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587')
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_FROM = process.env.SMTP_FROM || 'Citeback <noreply@citeback.com>'
const emailEnabled = !!(SMTP_HOST && SMTP_USER && SMTP_PASS)
const mailer = emailEnabled ? nodemailer.createTransport({
  host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_PORT === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
}) : null
console.log('Email recovery:', emailEnabled ? `enabled (${SMTP_HOST})` : 'disabled (no SMTP config)')

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
    tier INTEGER DEFAULT 0,
    email_enc TEXT DEFAULT NULL,
    password_version INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS recovery_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS idx_recovery_user ON recovery_tokens(user_id);
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

// ── Campaigns table ──────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    win_condition TEXT,
    location TEXT NOT NULL,
    goal INTEGER NOT NULL,
    raised INTEGER DEFAULT 0,
    backers INTEGER DEFAULT 0,
    deadline TEXT NOT NULL,
    tags TEXT DEFAULT '[]',
    source TEXT,
    contract_context TEXT,
    verify_meta TEXT,
    milestones TEXT,
    status TEXT DEFAULT 'unclaimed',
    operator_id TEXT REFERENCES users(id),
    wallet_xmr TEXT,
    wallet_zano TEXT,
    operator_name TEXT,
    operator_bio TEXT,
    claimed_at TEXT,
    activated_at TEXT,
    created_at TEXT NOT NULL
  );
`)

// ── Attorney applications table ────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS attorney_applications (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    bar_state TEXT NOT NULL,
    bar_number TEXT,
    bar_verified INTEGER DEFAULT 0,
    bar_result TEXT,
    location TEXT NOT NULL,
    background TEXT NOT NULL,
    email TEXT,
    status TEXT DEFAULT 'pending',
    submitted_at TEXT NOT NULL,
    reviewed_at TEXT,
    notes TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_attorney_status ON attorney_applications(status);
  CREATE INDEX IF NOT EXISTS idx_attorney_submitted ON attorney_applications(submitted_at);
`)


// ── Admin audit log table ──────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    target_id TEXT,
    detail TEXT,
    ip TEXT,
    created_at TEXT NOT NULL
  );
`)

// ── Interest counts table (persists across restarts) ─────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS interest_counts (
    campaign_id INTEGER PRIMARY KEY,
    count INTEGER DEFAULT 0
  )
`)
// Seed campaigns from JSON if table is empty
;(function() {
  const n = db.prepare('SELECT COUNT(*) as n FROM campaigns').get().n
  if (n > 0) return
  try {
    const seedPath = new URL('./data/campaign-seeds.json', import.meta.url).pathname
    const seeds = JSON.parse(fs.readFileSync(seedPath, 'utf8'))
    const ins = db.prepare('INSERT INTO campaigns (id,type,title,description,win_condition,location,goal,deadline,tags,source,contract_context,verify_meta,milestones,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    for (const c of seeds) {
      ins.run(c.id,c.type,c.title,c.description,c.winCondition||null,c.location,c.goal,c.deadline,JSON.stringify(c.tags||[]),c.source||null,c.contractContext||null,c.verifyMeta?JSON.stringify(c.verifyMeta):null,c.milestones?JSON.stringify(c.milestones):null,new Date().toISOString())
    }
    console.log('Seeded', seeds.length, 'campaigns')
  } catch(e) { console.warn('Campaign seed failed:', e.message) }
})()

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

// ── Cookie helpers ───────────────────────────────────────────────────────────
function parseCookies(req) {
  const header = req.headers.cookie || ''
  const cookies = {}
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx < 1) continue
    cookies[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim())
  }
  return cookies
}

const JWT_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds
const COOKIE_OPTS = `HttpOnly; Secure; SameSite=Strict; Max-Age=${JWT_COOKIE_MAX_AGE}; Path=/`
const COOKIE_CLEAR = `token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/`

// Migrate: add password_version column for existing DBs (safe no-op if already exists)
try { db.prepare('ALTER TABLE users ADD COLUMN password_version INTEGER DEFAULT 0').run() } catch {}

// ── Attorney account fields migration ────────────────────────────────────────
try { db.prepare('ALTER TABLE users ADD COLUMN attorney_verified INTEGER DEFAULT 0').run() } catch {}
// Wallet audit trail — tracks when operators change wallet addresses post-activation
try { db.prepare('ALTER TABLE campaigns ADD COLUMN wallet_changed_at TEXT DEFAULT NULL').run() } catch {}
try { db.prepare('ALTER TABLE users ADD COLUMN role TEXT DEFAULT NULL').run() } catch {}
try { db.prepare('ALTER TABLE attorney_applications ADD COLUMN account_created INTEGER DEFAULT 0').run() } catch {}
try { db.prepare('ALTER TABLE attorney_applications ADD COLUMN account_user_id TEXT DEFAULT NULL').run() } catch {}
try { db.prepare('ALTER TABLE attorney_applications ADD COLUMN email TEXT DEFAULT NULL').run() } catch {}

// ── Claim tokens table (for attorney account setup links) ─────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS claim_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0
  )
`)

// ── Passkeys table ────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS passkeys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    credential_id TEXT UNIQUE NOT NULL,
    public_key TEXT NOT NULL,
    sign_count INTEGER DEFAULT 0,
    device_name TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_passkeys_user ON passkeys(user_id);
  CREATE INDEX IF NOT EXISTS idx_passkeys_cred ON passkeys(credential_id);
`)

// ── Passkey challenges table (persistent across restarts) ──────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS passkey_challenges (
    temp_id TEXT PRIMARY KEY,
    challenge TEXT NOT NULL,
    user_id TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_pk_challenges_ts ON passkey_challenges(created_at);
`)
// GC expired challenges on startup and every 5 minutes
function gcPasskeyChallenges() {
  db.prepare('DELETE FROM passkey_challenges WHERE created_at < ?').run(Date.now() - 5 * 60 * 1000)
}
gcPasskeyChallenges()
setInterval(gcPasskeyChallenges, 5 * 60 * 1000)

// ── Server-side reauth sessions ───────────────────────────────────────────────
// userId -> reauthUntil timestamp (in-memory; resets on restart — acceptable)
const reauthSessions = new Map()
function recordReauth(userId) {
  reauthSessions.set(userId, Date.now() + 5 * 60 * 1000)
}
function isReauthedServer(userId) {
  const until = reauthSessions.get(userId)
  return !!(until && until > Date.now())
}

// ── Token verification with password_version check ────────────────────────────
function verifyToken(req) {
  try {
    const cookies = parseCookies(req)
    const token = cookies.token
    if (!token) return null
    const claims = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
    // Invalidate tokens issued before a password reset
    const row = db.prepare('SELECT password_version FROM users WHERE id = ?').get(claims.userId)
    if (!row) return null
    if ((row.password_version || 0) !== (claims.pv || 0)) return null
    return claims
  } catch { return null }
}

function awardReputation(userId, sightingId, eventType, points) {
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO reputation_events (user_id, sighting_id, event_type, points, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, sightingId, eventType, points, now)
  const user = db.prepare('SELECT reputation, tier, email_enc, username FROM users WHERE id = ?').get(userId)
  const currentRep = user?.reputation || 0
  const oldTier = user?.tier || 0
  const newRep = currentRep + points
  const newTier = getTierFromRep(newRep)
  db.prepare('UPDATE users SET reputation = ?, tier = ? WHERE id = ?').run(newRep, newTier, userId)
  // Tier-up email notification (fire-and-forget)
  if (emailEnabled && newTier > oldTier && user?.email_enc) {
    const userEmail = decryptEmail(user.email_enc)
    if (userEmail) {
      const tierName = TIER_NAMES[newTier]
      const messages = {
        1: `Congratulations — you've reached Tier 1 (Operator) on Citeback! You now have access to claim and run campaigns. Visit https://citeback.com/campaigns to browse available campaigns.`,
        2: `You've reached Tier 2 (Verifier) on Citeback. Verification bounties are now available to you. Keep contributing.`,
        3: `You've reached Tier 3 (Guardian) on Citeback — the highest tier. Full operator access and governance voting are now unlocked.`,
      }
      mailer.sendMail({
        from: SMTP_FROM,
        to: userEmail,
        subject: `Citeback — You've reached ${tierName}!`,
        text: messages[newTier] || `You've reached ${tierName} on Citeback. Keep contributing.`,
      }).catch(e => console.error('tier-up email error:', e.message))
    }
  }
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

// Separate stricter rate limiter for auth endpoints (5 req / 15 min per IP)
const authRateCounts = new Map()
function checkAuthRateLimit(ip) {
  const now = Date.now()
  const AUTH_WINDOW = 15 * 60 * 1000
  const AUTH_LIMIT = 5
  const entry = authRateCounts.get(ip)
  if (!entry || now - entry.start > AUTH_WINDOW) { authRateCounts.set(ip, { count: 1, start: now }); return true }
  if (entry.count >= AUTH_LIMIT) return false
  entry.count++; return true
}

// ── Bar lookup rate limiter (3 req / 60s per IP) ──────────────────────────
const barRateCounts = new Map()
function checkBarRateLimit(ip) {
  const now = Date.now()
  const BAR_WINDOW = 60 * 1000
  const BAR_LIMIT = 3
  const entry = barRateCounts.get(ip)
  if (!entry || now - entry.start > BAR_WINDOW) { barRateCounts.set(ip, { count: 1, start: now }); return true }
  if (entry.count >= BAR_LIMIT) return false
  entry.count++; return true
}

// ── WebAuthn / Passkey config ────────────────────────────────────────────────
const RP_NAME = 'Citeback'
const RP_ID = 'citeback.com'
const RP_ORIGIN = 'https://citeback.com'
// SQLite-backed challenge helpers (survives server restarts)
function pkChallengeSet(tempId, challenge, userId) {
  db.prepare('INSERT OR REPLACE INTO passkey_challenges (temp_id, challenge, user_id, created_at) VALUES (?, ?, ?, ?)').run(tempId, challenge, userId ?? null, Date.now())
}
function pkChallengeGet(tempId) {
  const row = db.prepare('SELECT * FROM passkey_challenges WHERE temp_id = ?').get(tempId)
  if (!row) return null
  if (Date.now() - row.created_at > 5 * 60 * 1000) { db.prepare('DELETE FROM passkey_challenges WHERE temp_id = ?').run(tempId); return null }
  return row
}
function pkChallengeDelete(tempId) {
  db.prepare('DELETE FROM passkey_challenges WHERE temp_id = ?').run(tempId)
}

// Passkey rate limiters (auth: 10/min, register: 5/min)
const pkAuthRateCounts = new Map()
const pkRegRateCounts = new Map()
function _pkRateCheck(map, ip, limit) {
  const now = Date.now()
  const WINDOW = 60 * 1000
  const entry = map.get(ip)
  if (!entry || now - entry.start > WINDOW) { map.set(ip, { count: 1, start: now }); return true }
  if (entry.count >= limit) return false
  entry.count++; return true
}
function checkPkAuthRateLimit(ip) { return _pkRateCheck(pkAuthRateCounts, ip, 10) }
function checkPkRegRateLimit(ip) { return _pkRateCheck(pkRegRateCounts, ip, 5) }

// ── Forgot-username rate limiter (3 req / 60min per IP) ─────────────────────
const forgotUsernameRateCounts = new Map()
function checkForgotUsernameRateLimit(ip) {
  const now = Date.now()
  const WINDOW = 60 * 60 * 1000
  const LIMIT = 3
  const entry = forgotUsernameRateCounts.get(ip)
  if (!entry || now - entry.start > WINDOW) { forgotUsernameRateCounts.set(ip, { count: 1, start: now }); return true }
  if (entry.count >= LIMIT) return false
  entry.count++; return true
}

// ── Bar state whitelist ──────────────────────────────────────────────────────
const US_BAR_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
])

// Sanitize bar number: strip non-alphanumeric, cap at 20 chars
function sanitizeBarNumber(raw) {
  return String(raw || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
}

// Fetch with hard timeout (ms) — only allows calbar.ca.gov domain for CA lookups
function fetchUrlWithTimeout(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    // SSRF guard: only allow the calbar.ca.gov host
    let parsed
    try { parsed = new URL(url) } catch { return reject(new Error('invalid_url')) }
    if (parsed.hostname !== 'apps.calbar.ca.gov') return reject(new Error('ssrf_blocked'))
    if (parsed.protocol !== 'https:') return reject(new Error('ssrf_blocked'))

    const req = https.get(url, { timeout: timeoutMs }, (res) => {
      let body = ''
      res.setEncoding('utf8')
      res.on('data', chunk => { if (body.length < 200000) body += chunk })
      res.on('end', () => resolve({ statusCode: res.statusCode, body }))
    })
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
    req.on('error', reject)
  })
}

// CA State Bar lookup — only numeric bar numbers, constructs URL from whitelist template
async function lookupCABar(rawBarNumber) {
  const sanitized = sanitizeBarNumber(rawBarNumber)
  if (!sanitized || !/^\d{1,8}$/.test(sanitized)) {
    return { status: 'not_found', reason: 'invalid_format' }
  }
  // URL is constructed entirely from our template — no user input in path beyond sanitized digits
  const url = `https://apps.calbar.ca.gov/attorney/Licensee/Detail/${sanitized}`
  try {
    const { statusCode, body } = await fetchUrlWithTimeout(url, 5000)
    if (statusCode === 404) return { status: 'not_found' }
    // Valid attorney: title = "{Name} # {barNum} - Attorney Licensee Search"
    const titleMatch = body.match(/<title>\s*([\s\S]*?)\s*<\/title>/)
    const titleText = titleMatch?.[1]?.trim() || ''
    const profileMatch = titleText.match(/^(.+?)\s+#\s+\d+\s+-\s+Attorney Licensee Search$/i)
    if (!profileMatch) return { status: 'not_found' }
    const name = profileMatch[1].trim().replace(/\s+/g, ' ')
    // Check for Active status — look for isolated 'Active' token in page body
    const activeMatch = />\s*Active\s*</.test(body)
    return { status: 'found', name, barNumber: sanitized, active: activeMatch }
  } catch (e) {
    if (e.message === 'timeout') return { status: 'error', reason: 'lookup_timeout' }
    if (e.message === 'ssrf_blocked' || e.message === 'invalid_url') return { status: 'error', reason: 'blocked' }
    return { status: 'error', reason: 'lookup_failed' }
  }
}

// Clean up expired recovery tokens every hour
setInterval(() => {
  try {
    const deleted = db.prepare('DELETE FROM recovery_tokens WHERE expires_at < ? OR used = 1').run(new Date().toISOString())
    if (deleted.changes > 0) console.log(`Cleaned ${deleted.changes} expired/used recovery tokens`)
  } catch (e) { console.error('Token cleanup error:', e.message) }
}, 60 * 60 * 1000)

// ── Scheduled WAL checkpoint (prevents unbounded WAL file growth) ────────────────
setInterval(() => {
  try { db.prepare('PRAGMA wal_checkpoint(PASSIVE)').run() } catch (e) { console.error('WAL checkpoint error:', e.message) }
}, 60 * 60 * 1000) // every hour

// Periodic GC for in-memory rate-limit maps — prevents unbounded growth from unique IPs
// Each entry is ~100 bytes; without GC a busy server accumulates millions of stale entries.
setInterval(() => {
  const now = Date.now()
  for (const [k, e] of rateCounts)      { if (now - e.start > RATE_WINDOW)       rateCounts.delete(k)      }
  for (const [k, e] of authRateCounts)  { if (now - e.start > 15 * 60 * 1000)   authRateCounts.delete(k)  }
  for (const [k, e] of barRateCounts)   { if (now - e.start > 60 * 1000)        barRateCounts.delete(k)   }
  for (const [k, e] of pkAuthRateCounts){ if (now - e.start > 60 * 1000)        pkAuthRateCounts.delete(k)}
  for (const [k, e] of pkRegRateCounts) { if (now - e.start > 60 * 1000)        pkRegRateCounts.delete(k) }
  for (const [ip, e] of adminFailCounts){ if (e.lockedUntil && now > e.lockedUntil + 60000) adminFailCounts.delete(ip) }
  for (const [k, e] of forgotUsernameRateCounts){ if (now - e.start > 60 * 60 * 1000) forgotUsernameRateCounts.delete(k) }
}, 10 * 60 * 1000) // every 10 minutes

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
    res.writeHead(502, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Ollama unavailable' }))
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
  'ignore your', 'ignore previous', 'forget your', 'disregard', 'override your',
  'pretend you are', 'pretend to be', 'roleplay as', 'act as if you', 'act like you',
  'you are now a', 'you are now an', 'new persona', 'jailbreak', 'dan mode',
  'developer mode', 'god mode', 'unrestricted mode', 'no filter mode',
  'your system prompt', 'original instructions', 'what were your instructions',
  'your real instructions', 'with no restrictions', 'without restrictions',
  'respond as', 'answer as', 'speak as', 'write as', 'reply as',
  'simulate a', 'imagine you are', 'hypothetically you are',
  'bypass your', 'circumvent your', 'disable your', 'turn off your',
  'what would you say if', 'how would you respond if you had no',
  'repeat after me', 'say the following', 'output the following',
  'print your', 'show your', 'reveal your', 'tell me your',
  'what are your rules', 'what are you not allowed',
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
function normalizeInput(text) {
  return text
    // Strip zero-width and invisible Unicode (common bypass vector)
    .replace(/[​-‍﻿­⁠᠎]/g, '')
    // Normalize multiple spaces/newlines to single space
    .replace(/\s+/g, ' ')
    // Normalize homoglyphs for common bypass chars (ɑ→a, ʙ→b, etc)
    .replace(/[ɑа]/g, 'a')  // Latin alpha, Cyrillic a
    .replace(/е/g, 'e')           // Cyrillic e
    .replace(/о/g, 'o')           // Cyrillic o
    .replace(/р/g, 'r')           // Cyrillic r
    .replace(/і/g, 'i')           // Cyrillic i
    .trim()
}
function isOnTopic(text) {
  // NFKC collapses Unicode compatibility equivalents (Ⅰ→I, ① →1, fullwidth→ASCII, etc.)
  const normalized = normalizeInput(text.normalize('NFKC'))
  const lower = normalized.toLowerCase()
  // Hard block on injection patterns
  if (INJECTION_SIGNALS.some(s => lower.includes(s))) return false
  // Block if message is suspiciously long with no on-topic signal (context stuffing)
  if (lower.length > 2000 && !ON_TOPIC_KEYWORDS.some(k => lower.includes(k))) return false
  const hasOffTopic = OFF_TOPIC_SIGNALS.some(s => lower.includes(s))
  if (!hasOffTopic) return true
  return ON_TOPIC_KEYWORDS.some(k => lower.includes(k))
}
const makeMsg = (content) => ({ model: 'citeback-filter', message: { role: 'assistant', content }, done: true })
const OFF_TOPIC = makeMsg("I'm focused on surveillance resistance and the Citeback platform. Ask me about ALPR cameras, privacy rights, campaigns, how to contribute anonymously, or what surveillance technology is deployed near you.")
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


// Reverse geocode GPS coords to human-readable location using Nominatim
const reverseGeocode = (lat, lng) => new Promise((resolve) => {
  const opts = {
    hostname: 'nominatim.openstreetmap.org',
    path: `/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&format=json&addressdetails=1`,
    headers: { 'User-Agent': 'citeback.com surveillance map' },
  }
  const req = https.get(opts, (res) => {
    let body = ''
    res.on('data', chunk => body += chunk)
    res.on('end', () => {
      try {
        const result = JSON.parse(body)
        const addr = result.address || {}
        const city = addr.city || addr.town || addr.village || addr.county || ''
        const state = addr.state || ''
        const road = addr.road || addr.neighbourhood || ''
        resolve({ city, state, address: road })
      } catch { resolve(null) }
    })
  })
  req.on('error', () => resolve(null))
  req.setTimeout(6000, () => { req.destroy(); resolve(null) })
})

// Interest counts — persisted in SQLite (survives restarts)

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
          { text: 'Is this a genuine photograph taken by a real physical camera of a surveillance camera, ALPR license plate reader, or billboard that is actually installed outdoors or in a public location? Answer NO if ANY of the following are true: (1) the image appears to be AI-generated, digitally rendered, or created by image generation software, (2) it is a screenshot, graphic, illustration, drawing, or digital artwork, (3) it shows camera icons, patterns, or graphics rather than a real physical device, (4) the device is a consumer product on a shelf or in a store, (5) it is an indoor residential or office camera, (6) it is a printed or reproduced image photographed from a screen or paper, (7) the image quality, lighting, or texture looks synthetic or computer-generated rather than photographed in natural conditions. Reply only: yes or no.' }
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

// ── Admin brute-force lockout (5 failures → 15min lockout per IP) ──────────
const adminFailCounts = new Map()
const ADMIN_MAX_FAILS = 5
const ADMIN_LOCKOUT_MS = 15 * 60 * 1000
function checkAdminLockout(ip) {
  const entry = adminFailCounts.get(ip)
  if (!entry) return true
  if (entry.lockedUntil && Date.now() < entry.lockedUntil) return false
  if (entry.lockedUntil && Date.now() >= entry.lockedUntil) { adminFailCounts.delete(ip); return true }
  return true
}
function recordAdminFail(ip) {
  const entry = adminFailCounts.get(ip) || { fails: 0 }
  entry.fails = (entry.fails || 0) + 1
  if (entry.fails >= ADMIN_MAX_FAILS) entry.lockedUntil = Date.now() + ADMIN_LOCKOUT_MS
  adminFailCounts.set(ip, entry)
}
function clearAdminFail(ip) { adminFailCounts.delete(ip) }

// ── Admin session tokens (httpOnly cookie, 4hr TTL) ─────────────────────────
const adminSessions = new Map()
const ADMIN_SESSION_TTL = 4 * 60 * 60 * 1000
const ADMIN_COOKIE = 'cx_admin_token'
function issueAdminSession(ip) {
  const token = randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '')
  adminSessions.set(token, { ip, created: Date.now() })
  return token
}
function verifyAdminSession(req) {
  const cookies = parseCookies(req)
  const token = cookies[ADMIN_COOKIE]
  if (!token) return false
  const session = adminSessions.get(token)
  if (!session) return false
  if (Date.now() - session.created > ADMIN_SESSION_TTL) { adminSessions.delete(token); return false }
  // IP binding: admin session is tied to the IP it was issued on.
  // A stolen cookie is useless from a different network.
  const reqIp = getClientIp(req)
  if (session.ip && session.ip !== reqIp) { adminSessions.delete(token); return false }
  return true
}
function revokeAdminSession(req) {
  const cookies = parseCookies(req)
  const token = cookies[ADMIN_COOKIE]
  if (token) adminSessions.delete(token)
}
setInterval(() => {
  const now = Date.now()
  for (const [token, s] of adminSessions) {
    if (now - s.created > ADMIN_SESSION_TTL) adminSessions.delete(token)
  }
}, 60 * 60 * 1000)

// ── Admin audit logger ───────────────────────────────────────────────────────
function auditLog(action, targetId, detail, ip) {
  try {
    db.prepare('INSERT INTO admin_audit_log (action, target_id, detail, ip, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(action, targetId || null, detail || null, ip || null, new Date().toISOString())
  } catch (e) { console.error('audit log error:', e.message) }
}

function isAdmin(req, body) {
  if (verifyAdminSession(req)) return true
  // Header-based secret: apply same brute-force lockout as /admin/login
  const _ip = getClientIp(req)
  if (!checkAdminLockout(_ip)) return false
  const headerSecret = req.headers['x-admin-secret']
  if (headerSecret && timingSafeCompare(headerSecret, ADMIN_SECRET)) { clearAdminFail(_ip); return true }
  if (headerSecret) recordAdminFail(_ip)
  return false
}

// ── HTTP Server ───────────────────────────────────────────────────────────────
// ── Trusted IP extraction ────────────────────────────────────────────────────
// X-Real-IP is set by Caddy to the actual client IP (not forgeable from the internet
// because Caddy overwrites it). X-Forwarded-For fallback is for local dev only.
// Never trust XFF as authoritative in production.
function getClientIp(req) {
  return req.headers['x-real-ip']
    || req.headers['x-forwarded-for']?.split(',')[0].trim()
    || req.socket.remoteAddress
    || 'unknown'
}

const server = http.createServer(async (req, res) => {
  const ip = getClientIp(req)

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end() }

  // ── Health check ──────────────────────────────────────────────────────────────
  if (req.method === 'GET' && req.url === '/health') {
    // Simple liveness check — no sensitive info
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ ok: true, ts: new Date().toISOString() }))
  }

  // ── Feedback ───────────────────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/feedback') {
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
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
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
    // Omit operational details (rateLimited, uptime, queueDepth, processing) that
    // would help an attacker profile server load or time requests around restarts.
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({
      thumbsUp: stats.thumbsUp,
      thumbsDown: stats.thumbsDown,
      total: stats.total,
      since: stats.since,
      cameraCount: osmCameras.length,
    }))
  }

  // ── Campaign interest counter ──────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/interest') {
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
    try {
      const body = await parseBody(req)
      if (body.action === 'counts') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        const rows = db.prepare('SELECT campaign_id, count FROM interest_counts').all()
        const counts = {}
        rows.forEach(r => { counts[r.campaign_id] = r.count })
        return res.end(JSON.stringify({ counts }))
      }
      if (body.action === 'increment' && body.campaignId != null) {
        // Validate: must be a real campaign integer — prevents memory bloat with arbitrary keys
        const idNum = parseInt(String(body.campaignId), 10)
        if (!Number.isFinite(idNum) || idNum < 1) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify({ error: 'invalid campaignId' }))
        }
        const campaignExists = db.prepare('SELECT id FROM campaigns WHERE id = ?').get(idNum)
        if (!campaignExists) {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify({ error: 'campaign not found' }))
        }
        const id = String(idNum)
        db.prepare(`
          INSERT INTO interest_counts (campaign_id, count) VALUES (?, 1)
          ON CONFLICT(campaign_id) DO UPDATE SET count = count + 1
        `).run(idNum)
        const row = db.prepare('SELECT count FROM interest_counts WHERE campaign_id = ?').get(idNum)
        const newCount = row?.count || 1
        // Fire-and-forget operator milestone notification at 5, 10, 25, 50, 100 interest signals
        const MILESTONES = [5, 10, 25, 50, 100]
        if (emailEnabled && MILESTONES.includes(newCount)) {
          try {
            const camp = db.prepare('SELECT c.title, c.operator_id, u.email_enc FROM campaigns c LEFT JOIN users u ON c.operator_id = u.id WHERE c.id = ?').get(idNum)
            if (camp?.email_enc) {
              const operatorEmail = decryptEmail(camp.email_enc)
              if (operatorEmail) {
                mailer.sendMail({
                  from: SMTP_FROM,
                  to: operatorEmail,
                  subject: `Citeback — ${newCount} people are interested in your campaign`,
                  text: `Your campaign "${camp.title}" has reached ${newCount} interest signals on Citeback.\n\nThis means ${newCount} people have clicked "I'm Interested" on your campaign page. Strong early interest helps campaigns get funded when wallets activate.\n\nView campaign: https://citeback.com/campaigns/${idNum}\n\nCiteback`,
                }).catch(e => console.error('operator interest notify error:', e.message))
              }
            }
          } catch (e) { console.error('operator interest notify lookup error:', e.message) }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ ok: true, campaignId: idNum, count: newCount }))
      }
      res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'invalid action' }))
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'bad request' }))
    }
  }

  // ── Anonymous campaign proposal submission ─────────────────────────────────
  if (req.method === 'POST' && req.url === '/submit') {
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
    try {
      const body = await parseBody(req)
      const allowed = ['billboard', 'legal', 'foia', 'verify', 'other']
      const type = allowed.includes(body.type) ? body.type : 'other'
      const title = String(body.title || '').slice(0, 200).trim()
      const location = String(body.location || '').slice(0, 200).trim()
      const description = String(body.description || '').slice(0, 2000).trim()
      const rawGoal = Number(body.goal)
      const goal = (!Number.isFinite(rawGoal) || rawGoal < 0) ? 0 : Math.min(rawGoal, 1_000_000)
      if (!title || !location || !description) { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'missing fields' })) }
      appendRecord('proposals.jsonl', { type, title, location, description, goal })
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true }))
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'bad request' }))
    }
  }

  // ── Account: create ────────────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/account/create') {
    const clientIp = getClientIp(req)
    if (!checkAuthRateLimit(clientIp)) {
      res.writeHead(429, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Too many attempts — please wait 15 minutes and try again' }))
    }
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
      const pwStrengthError = checkPasswordStrength(password)
      if (pwStrengthError) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: pwStrengthError }))
      }

      const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
      if (existing) {
        res.writeHead(409, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Username already taken' }))
      }

      const emailRaw = String(body.email || '').toLowerCase().trim()
      if (emailRaw && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailRaw)) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Invalid email address' }))
      }
      const emailEnc = emailRaw ? encryptEmail(emailRaw) : null

      const id = randomUUID()
      const password_hash = await bcrypt.hash(password, 12)
      const now = new Date().toISOString()
      db.prepare('INSERT INTO users (id, username, password_hash, created_at, email_enc) VALUES (?, ?, ?, ?, ?)').run(id, username, password_hash, now, emailEnc)

      const token = jwt.sign({ userId: id, username, pv: 0 }, JWT_SECRET, { expiresIn: JWT_EXPIRY })
      res.setHeader('Set-Cookie', `token=${token}; ${COOKIE_OPTS}`)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({
        ok: true, username, userId: id,
        reputation: 0, tier: 0,
        tierName: TIER_NAMES[0], pointsToNext: TIER_THRESHOLDS[1],
        tierThreshold: TIER_THRESHOLDS[1],
        hasEmail: !!emailEnc,
      }))
    } catch (e) {
      console.error('account/create error:', e.message)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Server error' }))
    }
  }

  // ── Account: login ─────────────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/account/login') {
    const clientIp = getClientIp(req)
    if (!checkAuthRateLimit(clientIp)) {
      res.writeHead(429, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Too many attempts — please wait 15 minutes and try again' }))
    }
    try {
      const body = await parseBody(req)
      const username = String(body.username || '').trim()
      const password = String(body.password || '')

      if (!username || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Username and password required' }))
      }

      const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
      // Timing-safe: always run bcrypt regardless of whether user exists.
      // Without this, "user not found" returns in ~1ms vs ~100ms for wrong password — enumerable.
      const DUMMY_HASH = '$2b$12$61HvlwlGyluJ3mFweaDccOSWZCQyRLY/P6YC1MT4w4D1IImXLI3mG'
      const valid = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH)
      if (!user || !valid) {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Invalid username or password' }))
      }

      const token = jwt.sign({ userId: user.id, username: user.username, pv: user.password_version || 0 }, JWT_SECRET, { expiresIn: JWT_EXPIRY })
      res.setHeader('Set-Cookie', `token=${token}; ${COOKIE_OPTS}`)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({
        ok: true, username: user.username, userId: user.id,
        reputation: user.reputation, tier: user.tier,
        tierName: TIER_NAMES[user.tier],
        pointsToNext: getPointsToNextTier(user.reputation, user.tier),
        tierThreshold: TIER_THRESHOLDS[user.tier + 1] ?? null,
        hasEmail: !!user.email_enc,
      }))
    } catch (e) {
      console.error('account/login error:', e.message)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Server error' }))
    }
  }

  // ── Account: logout ────────────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/account/logout') {
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
    res.setHeader('Set-Cookie', COOKIE_CLEAR)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ ok: true }))
  }

  // ── Account: logout all sessions (bumps password_version, invalidates all JWTs) ──
  if (req.method === 'POST' && req.url === '/account/logout-all') {
    if (!checkAuthRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many attempts. Try again later.' })) }
    const claims = verifyToken(req)
    if (!claims) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Authentication required' })) }
    db.prepare('UPDATE users SET password_version = COALESCE(password_version, 0) + 1 WHERE id = ?').run(claims.userId)
    res.setHeader('Set-Cookie', COOKIE_CLEAR)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ ok: true }))
  }

  // ── Account: change password ─────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/account/change-password') {
    const claims = verifyToken(req)
    if (!claims) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Authentication required' })) }
    if (!checkAuthRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many attempts. Try again later.' })) }
    try {
      const body = await parseBody(req)
      const currentPassword = String(body.currentPassword || '')
      const newPassword = String(body.newPassword || '')
      if (!currentPassword || !newPassword) {
        res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'currentPassword and newPassword are required' }))
      }
      const user = db.prepare('SELECT id, password_hash, password_version FROM users WHERE id = ?').get(claims.userId)
      if (!user) { res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'User not found' })) }
      const match = await bcrypt.compare(currentPassword, user.password_hash)
      if (!match) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Current password is incorrect' })) }
      const strengthError = checkPasswordStrength(newPassword)
      if (strengthError) { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: strengthError })) }
      const newHash = await bcrypt.hash(newPassword, 12)
      const newPv = (user.password_version || 0) + 1
      db.prepare('UPDATE users SET password_hash = ?, password_version = ? WHERE id = ?').run(newHash, newPv, user.id)
      // Issue a fresh JWT for the current session; all other sessions are invalidated
      const freshToken = jwt.sign({ userId: user.id, username: claims.username, pv: newPv }, JWT_SECRET, { expiresIn: JWT_EXPIRY })
      res.setHeader('Set-Cookie', `token=${freshToken}; ${COOKIE_OPTS}`)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true }))
    } catch (e) {
      console.error('change-password error:', e.message)
      res.writeHead(500, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Server error' }))
    }
  }

  // ── Account: profile ───────────────────────────────────────────────────────
  if (req.method === 'GET' && req.url === '/account/me') {
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
    const claims = verifyToken(req)
    if (!claims) {
      res.writeHead(401, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Authentication required' }))
    }

    const user = db.prepare('SELECT id, username, reputation, tier, created_at, email_enc, attorney_verified, role FROM users WHERE id = ?').get(claims.userId)
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
      hasEmail: !!user.email_enc,
      attorney_verified: user.attorney_verified || 0,
      role: user.role || null,
    }))
  }

  // ── Account: sighting history ──────────────────────────────────────────────
  if (req.method === 'GET' && req.url === '/account/sightings') {
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
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

  // ── Account: update email ────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/account/email') {
    const clientIp = getClientIp(req)
    if (!checkAuthRateLimit(clientIp)) {
      res.writeHead(429, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Too many attempts — please wait 15 minutes and try again' }))
    }
    const claims = verifyToken(req)
    if (!claims) {
      res.writeHead(401, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Authentication required' }))
    }
    // Email change requires recent step-up auth
    if (!isReauthedServer(claims.userId)) {
      res.writeHead(403, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Step-up authentication required — please re-enter your password' }))
    }
    try {
      const body = await parseBody(req)
      const email = String(body.email || '').toLowerCase().trim()
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Invalid email address' }))
      }
      const enc = email ? encryptEmail(email) : null
      db.prepare('UPDATE users SET email_enc = ? WHERE id = ?').run(enc, claims.userId)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true, hasEmail: !!email }))
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Server error' }))
    }
  }

  // ── Account: check if email set (masked) ─────────────────────────────────
  if (req.method === 'GET' && req.url === '/account/email') {
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
    const claims = verifyToken(req)
    if (!claims) {
      res.writeHead(401, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Authentication required' }))
    }
    const user = db.prepare('SELECT email_enc FROM users WHERE id = ?').get(claims.userId)
    let maskedEmail = null
    if (user?.email_enc) {
      const plain = decryptEmail(user.email_enc)
      if (plain) {
        const [local, domain] = plain.split('@')
        maskedEmail = local.slice(0,2) + '***@' + domain
      }
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ hasEmail: !!user?.email_enc, maskedEmail }))
  }

  // ── Account: attorney info (bar state/number for verified attorneys) ────────
  if (req.method === 'GET' && req.url === '/account/attorney-info') {
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
    const claims = verifyToken(req)
    if (!claims) {
      res.writeHead(401, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Authentication required' }))
    }
    const appRow = db.prepare('SELECT bar_state, bar_number, status FROM attorney_applications WHERE account_user_id = ? ORDER BY submitted_at DESC LIMIT 1').get(claims.userId)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ bar_state: appRow?.bar_state || null, bar_number: appRow?.bar_number || null, status: appRow?.status || null }))
  }

  // ── Account: request password recovery ───────────────────────────────────
  if (req.method === 'POST' && req.url === '/account/recover') {
    const clientIp = getClientIp(req)
    if (!checkAuthRateLimit(clientIp)) {
      res.writeHead(429, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true, message: 'If that account has a recovery email, a reset link has been sent.' })) // same response — don’t reveal rate limiting
    }
    try {
      const body = await parseBody(req)
      const username = String(body.username || '').trim()
      if (!username) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Username required' }))
      }
      // Always respond OK — never confirm whether user/email exists
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true, message: 'If that account has a recovery email, a reset link has been sent.' }))

      // Do the actual work after response (fire-and-forget)
      const user = db.prepare('SELECT id, email_enc FROM users WHERE username = ? COLLATE NOCASE').get(username)
      if (!user?.email_enc || !emailEnabled) return
      const email = decryptEmail(user.email_enc)
      if (!email) return

      // Generate token
      const token = randomBytes(32).toString('hex')
      const tokenHash = await bcrypt.hash(token, 10)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min
      const tokenId = randomUUID()
      // Invalidate old tokens for this user
      db.prepare('DELETE FROM recovery_tokens WHERE user_id = ?').run(user.id)
      db.prepare('INSERT INTO recovery_tokens (id, user_id, token_hash, expires_at) VALUES (?,?,?,?)').run(tokenId, user.id, tokenHash, expiresAt)

      const resetUrl = `https://citeback.com/reset-password?token=${token}&id=${tokenId}`
      await mailer.sendMail({
        from: SMTP_FROM,
        to: email,
        subject: 'Citeback — Password Reset',
        text: `You requested a password reset for your Citeback account.\n\nReset link (valid for 30 minutes):\n${resetUrl}\n\nIf you didn't request this, ignore this email. Your password has not been changed.\n\nCiteback never stores your identity. This email was only kept for this purpose.`,
        html: `<p>You requested a password reset for your Citeback account.</p><p><a href="${resetUrl}">Reset your password</a> (valid 30 minutes)</p><p>If you didn't request this, ignore this email. Your password has not been changed.</p><p style="color:#888;font-size:12px">Citeback never stores your identity. This email was only kept for this purpose.</p>`,
      })
    } catch (e) {
      console.error('recovery error:', e.message)
      if (!res.headersSent) { res.writeHead(500, {"Content-Type": "application/json"}); res.end(JSON.stringify({error: "Server error"})); }
    }
    return
  }

  // ── Account: forgot username (send username reminder to recovery email) ──────
  if (req.method === 'POST' && req.url === '/account/forgot-username') {
    if (!checkForgotUsernameRateLimit(ip)) {
      // Always respond 200 — never reveal rate limiting status
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true, message: 'If that email has an account, your username has been sent.' }))
    }
    try {
      const body = await parseBody(req)
      const emailRaw = String(body.email || '').toLowerCase().trim()
      // Always respond OK — never confirm whether email exists
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true, message: 'If that email has an account, your username has been sent.' }))

      // Fire-and-forget: do the real work after response is sent
      if (!emailRaw || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailRaw) || !emailEnabled) return
      // Scan all users to find one with matching encrypted email
      const allUsers = db.prepare('SELECT id, username, email_enc FROM users WHERE email_enc IS NOT NULL').all()
      const match = allUsers.find(u => {
        const decrypted = decryptEmail(u.email_enc)
        return decrypted && decrypted.toLowerCase() === emailRaw
      })
      if (!match) return
      await mailer.sendMail({
        from: SMTP_FROM,
        to: emailRaw,
        subject: 'Citeback — Your Username',
        text: `Your Citeback username is: ${match.username}\n\nIf you also forgot your password, visit https://citeback.com and use the "Forgot password?" link on the login screen.\n\nIf you didn't request this, ignore this email.\n\nCiteback never stores your identity. This email was only kept for account recovery.`,
        html: `<p>Your Citeback username is: <strong>${match.username}</strong></p><p>If you also forgot your password, use the <a href="https://citeback.com">Forgot password?</a> link on the login screen.</p><p>If you didn't request this, ignore this email.</p><p style="color:#888;font-size:12px">Citeback never stores your identity. This email was only kept for account recovery.</p>`,
      })
    } catch (e) {
      console.error('forgot-username error:', e.message)
      // Response already sent — nothing to do
    }
    return
  }

  // ── Account: reset password with token ───────────────────────────────────
  if (req.method === 'POST' && req.url === '/account/reset-password') {
    // Rate limit: prevent brute-forcing token + unlimited bcrypt invocations
    if (!checkAuthRateLimit(ip)) {
      res.writeHead(429, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Too many attempts — please wait 15 minutes' }))
    }
    try {
      const body = await parseBody(req)
      const { token, id: tokenId, password } = body
      if (!token || !tokenId || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Missing required fields' }))
      }
      const pwError = checkPasswordStrength(password)
      if (pwError) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: pwError }))
      }
      const row = db.prepare('SELECT * FROM recovery_tokens WHERE id = ?').get(tokenId)
      if (!row || row.used || new Date(row.expires_at) < new Date()) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Reset link is invalid or has expired' }))
      }
      const valid = await bcrypt.compare(token, row.token_hash)
      if (!valid) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Reset link is invalid or has expired' }))
      }
      const newHash = await bcrypt.hash(password, 12)
      // Increment password_version — invalidates all existing JWTs for this user
      db.prepare('UPDATE users SET password_hash = ?, password_version = COALESCE(password_version, 0) + 1 WHERE id = ?').run(newHash, row.user_id)
      db.prepare('UPDATE recovery_tokens SET used = 1 WHERE id = ?').run(tokenId)
      // Clear any server-side reauth session for this user
      reauthSessions.delete(row.user_id)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true }))
    } catch (e) {
      console.error('reset-password error:', e.message)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Server error' }))
    }
  }

  // ── Account: step-up reauth (verify password for high-stakes actions) ─────
  if (req.method === 'POST' && req.url === '/account/reauth') {
    const clientIp = getClientIp(req)
    if (!checkAuthRateLimit(clientIp)) {
      res.writeHead(429, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Too many requests — wait 15 minutes' }))
    }
    const claims = verifyToken(req)
    if (!claims) {
      res.writeHead(401, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Not authenticated' }))
    }
    try {
      const body = await parseBody(req)
      const password = String(body.password || '')
      if (!password) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Password required' }))
      }
      const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(claims.userId)
      if (!row) {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Account not found' }))
      }
      const match = await bcrypt.compare(password, row.password_hash)
      if (!match) {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Incorrect password' }))
      }
      // 5-minute reauth window — enforced both server-side and returned to client
      const reauthUntil = Date.now() + 5 * 60 * 1000
      recordReauth(claims.userId)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true, reauthUntil }))
    } catch (e) {
      console.error('account/reauth error:', e.message)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Server error' }))
    }
  }

  // ── Sighting submission — C2PA required, no exceptions ──────────────────────
  if (req.method === 'POST' && req.url === '/sighting') {
    const ip = getClientIp(req)

    // ── Rate limit BEFORE any file I/O, disk writes, or C2PA CPU work ────────
    // JWT is in the cookie (request headers) — check auth without reading body.
    // Unauthenticated IPs get the standard limit; authenticated get more headroom.
    const preAuthClaims = verifyToken(req)
    if (!preAuthClaims && !checkRateLimit(ip)) {
      res.writeHead(429, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Rate limit exceeded. Please wait a minute.' }))
    }

    const contentType = req.headers['content-type'] || ''
    const isMultipart = contentType.includes('multipart/form-data')
    let fields = {}, photoFilename = null, detectedC2PA = false, photoWritePromise = Promise.resolve()

    // Disk quota guard — refuse uploads if photos dir exceeds 10GB
    if (isMultipart) {
      try {
        const { size: dirSize } = await new Promise((res, rej) => {
          let total = 0
          fs.readdir(PHOTOS_DIR, (err, files) => {
            if (err) return res({ size: 0 })
            let pending = files.length
            if (!pending) return res({ size: 0 })
            files.forEach(f => {
              fs.stat(path.join(PHOTOS_DIR, f), (e, s) => {
                if (!e && s?.isFile()) total += s.size
                if (--pending === 0) res({ size: total })
              })
            })
          })
        })
        if (dirSize > MAX_PHOTOS_DIR_BYTES) {
          res.writeHead(507, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify({ error: 'Storage limit reached. Please try again later.' }))
        }
      } catch { /* non-fatal — proceed */ }
    }

    try {
      if (isMultipart) {
        await new Promise((resolve, reject) => {
          const bb = busboy({ headers: req.headers, limits: { fileSize: MAX_PHOTO_BYTES, files: 1 } })
          bb.on('field', (name, val) => { fields[name] = val })
          bb.on('file', (name, stream, info) => {
            const isImage = !!ALLOWED_IMAGE_TYPES[info.mimeType]
            const isZip = ALLOWED_ZIP_TYPES.has(info.mimeType) || (info.filename || '').toLowerCase().endsWith('.zip')
            if (!isImage && !isZip) { stream.resume(); return }
            const declaredMime = info.mimeType
            const ext = isZip ? 'zip' : ALLOWED_IMAGE_TYPES[info.mimeType]
            const filename = `${randomUUID()}.${ext}`
            const dest = path.join(PHOTOS_DIR, filename)
            const out = fs.createWriteStream(dest)
            let size = 0
            let headerBuf = null // capture first 12 bytes for magic bytes check
            stream.on('data', chunk => {
              size += chunk.length
              if (size > MAX_PHOTO_BYTES) { out.destroy(); fs.unlink(dest, () => {}); stream.resume(); return }
              if (!headerBuf) headerBuf = chunk.slice(0, 12)
              out.write(chunk)
            })
            stream.on('end', () => {
              photoWritePromise = new Promise((res, rej) => {
                out.end()
                out.on('finish', () => {
                  // Magic bytes validation — reject if Content-Type was spoofed
                  if (headerBuf && !validateMagicBytes(headerBuf, declaredMime)) {
                    fs.unlink(dest, () => {})
                    return rej(new Error('Invalid file type (magic bytes mismatch)'))
                  }
                  photoFilename = filename
                  res()
                })
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
            // Find the JPEG photo entry
            const jpegEntry = entries.find(e => /\.(jpg|jpeg)$/i.test(e.entryName) && !e.isDirectory)
            // Find proof.json for GPS
            const proofEntry = entries.find(e => /proof\.json$/i.test(e.entryName))
            if (jpegEntry) {
              const jpegFilename = `${randomUUID()}.jpg`
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
                // Proofmode uses flat dot-notation keys: 'LOCATION.LATITUDE'
                // Proofmode schema v1: 'Location.Latitude' / 'Location.Longitude'
                const lat = proof['Location.Latitude'] ?? proof['LOCATION.LATITUDE'] ?? proof['location.latitude'] ?? null
                const lng = proof['Location.Longitude'] ?? proof['LOCATION.LONGITUDE'] ?? proof['location.longitude'] ?? null
                if (lat && lng) {
                  fields._proofLat = String(lat)
                  fields._proofLng = String(lng)
                }
              } catch (pe) { console.error('proof.json parse error:', pe.message) }
            }
          } catch (e) {
            console.error('zip extract error:', e.message)
          }
        }

        // Real cryptographic C2PA verification — verifies the actual manifest signature
        // Not string matching. A forged 'c2pa' string in EXIF will NOT pass this.
        // C2PA verification runs on the original file (pre-strip) because the C2PA
        // manifest hash covers the full file bytes.
        if (photoFilename) {
          detectedC2PA = await verifyC2PA(path.join(PHOTOS_DIR, photoFilename))
        }

        // Strip EXIF from JPEG after C2PA verification — protects user privacy.
        // Removes GPS coordinates, camera model, timestamps, and other PII from EXIF.
        // APP11 (C2PA) is preserved; APP1/APP2/IPTC/XMP are stripped.
        if (photoFilename && photoFilename.match(/\.(jpg|jpeg)$/i)) {
          stripJpegExif(path.join(PHOTOS_DIR, photoFilename))
        }
      } else {
        fields = await parseBody(req)
      }

      // Secondary rate limit gate for any slip-through (admin users bypass pre-auth check)
      const trusted = isAdmin(req, fields)
      if (!trusted && !preAuthClaims && !checkRateLimit(ip)) {
        if (photoFilename) fs.unlink(path.join(PHOTOS_DIR, photoFilename), () => {})
        res.writeHead(429, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Rate limit exceeded. Please wait a minute before submitting again.' }))
      }
      if (fields.honeypot) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ ok: true })) }

      // Server-only C2PA verification — client cannot claim hasC2PA, server decides
      const hasC2PA = detectedC2PA
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
        }
      }

      // Try EXIF GPS from JPEG as well (for non-zip uploads)
      if ((!finalLat || !finalLng) && photoFilename) {
        try {
          const gps = await Exifr.gps(path.join(PHOTOS_DIR, photoFilename))
          if (gps?.latitude && gps?.longitude) {
            finalLat = String(gps.latitude)
            finalLng = String(gps.longitude)
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

      // EXIF camera metadata check — real photos have camera make/model/ISO; AI images don't
      // Proofmode ZIPs are exempted (they embed GPS via proof.json, EXIF may be minimal)
      if (!trusted && photoFilename && !photoFilename.endsWith('.zip')) {
        try {
          const exifData = await Exifr.parse(path.join(PHOTOS_DIR, photoFilename), {
            pick: ['Make', 'Model', 'ISO', 'ExposureTime', 'FNumber', 'DateTimeOriginal']
          })
          const hasCamera = exifData && (exifData.Make || exifData.Model || exifData.ISO || exifData.ExposureTime)
          if (!hasCamera) {
            if (photoFilename) fs.unlink(path.join(PHOTOS_DIR, photoFilename), () => {})
            res.writeHead(422, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({
              error: 'Photo is missing camera metadata. AI-generated images and screenshots are not accepted.',
              hint: 'Submit a real photo taken with your phone or camera. Shoot with Proofmode (iOS/Android) for strongest verification.',
            }))
          }
        } catch (exifErr) {
          // If EXIF parsing fails entirely, treat as no metadata
          if (photoFilename) fs.unlink(path.join(PHOTOS_DIR, photoFilename), () => {})
          res.writeHead(422, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify({
            error: 'Could not read photo metadata. Please submit a real photograph taken with a camera or phone.',
          }))
        }
      }

      // GPS plausibility check — reject suspiciously round coordinates that suggest manual entry
      if (!trusted) {
        const latNum = parseFloat(finalLat)
        const lngNum = parseFloat(finalLng)
        const latStr = String(finalLat)
        const lngStr = String(finalLng)
        // Flag coords with no sub-degree precision (e.g. exactly 35.5 or 35.000000)
        // Real EXIF GPS always has 4+ significant decimal digits
        const latFrac = latStr.includes('.') ? latStr.split('.')[1].replace(/0+$/, '') : ''
        const lngFrac = lngStr.includes('.') ? lngStr.split('.')[1].replace(/0+$/, '') : ''
        const tooRound = latFrac.length < 3 || lngFrac.length < 3
        const isZero = (latNum === 0 && lngNum === 0)
        if (tooRound || isZero) {
          if (photoFilename) fs.unlink(path.join(PHOTOS_DIR, photoFilename), () => {})
          res.writeHead(422, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify({
            error: 'GPS coordinates appear to be manually entered rather than from a photo. Shoot with location enabled so GPS is embedded in the image.',
            hint: 'Real EXIF GPS has full precision (e.g. 35.123456). Round numbers are rejected.',
          }))
        }
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
      const id = `s_${randomUUID()}`
      // Fire-and-forget reverse geocode to populate address fields from GPS
      let finalAddress = address, finalCity = city, finalState = state
      if (finalLat && finalLng && (!address && !city && !state)) {
        try {
          const geo = await reverseGeocode(finalLat, finalLng)
          if (geo) {
            finalAddress = geo.address || address
            finalCity = geo.city || city
            finalState = geo.state || state
          }
        } catch {} // non-fatal, proceed with empty address
      }
      appendRecord('sightings.jsonl', {
        id, cameraType, address: finalAddress, city: finalCity, state: finalState,
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
      res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'bad request' }))
    }
  }

  // ── Expert directory application ─────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/registry') {
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
    try {
      const body = await parseBody(req)
      const roles = ['attorney', 'journalist', 'advocate', 'researcher', 'organizer', 'other']
      const role = roles.includes(body.role) ? body.role : 'other'
      const location = String(body.location || '').slice(0, 200).trim()
      const background = String(body.background || '').slice(0, 2000).trim()
      if (!location || !background) { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'missing fields' })) }
      appendRecord('registry.jsonl', { role, location, background })
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true }))
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'bad request' }))
    }
  }

  // ── Bar lookup ─────────────────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/verify-bar') {
    const clientIp = getClientIp(req)
    if (!checkBarRateLimit(clientIp)) {
      res.writeHead(429, { 'Content-Type': 'application/json', 'Retry-After': '60' })
      return res.end(JSON.stringify({ error: 'Rate limit — try again in a minute', retryAfter: 60 }))
    }
    try {
      const body = await parseBody(req)
      const rawState = String(body.state || '').toUpperCase().trim()
      const rawNum = String(body.barNumber || '').trim()
      if (!US_BAR_STATES.has(rawState)) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Invalid or unrecognized state code', status: 'invalid_state' }))
      }
      if (!rawNum) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Bar number required' }))
      }
      let result
      if (rawState === 'CA') {
        result = await lookupCABar(rawNum)
      } else {
        result = { status: 'manual_review', reason: 'Automated lookup not available for this state' }
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify(result))
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'bad request' }))
    }
  }

  // ── Attorney application ──────────────────────────────────────────────────
  if (req.method === "POST" && req.url === "/attorney/apply") {
    // Rate limit BEFORE auth check — prevents timing oracle on token validation
    if (!checkAuthRateLimit(ip)) {
      res.writeHead(429, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Too many attempts — please wait 15 minutes' }))
    }
    const applyUser = verifyToken(req)
    if (!applyUser) { res.writeHead(401, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ error: "Login required to submit an attorney application" })) }
    try {
      const body = await parseBody(req)
      // Input validation with strict length limits — no string concat into SQL (parameterized only)
      const full_name = String(body.full_name || '').trim().slice(0, 200)
      const bar_state = String(body.bar_state || '').toUpperCase().trim()
      const bar_number = sanitizeBarNumber(body.bar_number)
      const location = String(body.location || '').trim().slice(0, 300)
      const background = String(body.background || '').trim().slice(0, 3000)
      const appEmail = String(body.email || '').trim().slice(0, 200) || null

      if (!full_name || !bar_state || !location || !background) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Missing required fields: full_name, bar_state, location, background' }))
      }
      if (!US_BAR_STATES.has(bar_state)) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Invalid bar state' }))
      }

      const id = randomUUID()
      const now = new Date().toISOString()

      // Auto-verify for CA if bar number provided
      let bar_verified = 0
      let bar_result = null
      if (bar_state === 'CA' && bar_number) {
        const lookup = await lookupCABar(bar_number)
        bar_verified = lookup.status === 'found' ? 1 : 0
        bar_result = JSON.stringify(lookup)
      }

      // All values bound via parameterized query — no SQL injection possible
      db.prepare(`
        INSERT INTO attorney_applications
          (id, full_name, bar_state, bar_number, bar_verified, bar_result, location, background, email, status, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
      `).run(id, full_name, bar_state, bar_number || null, bar_verified, bar_result, location, background, appEmail, now)

      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true, id, barVerified: !!bar_verified }))
    } catch (e) {
      console.error('attorney/apply error:', e.message)
      res.writeHead(400, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'bad request' }))
    }
  }

  // ── Admin: list all campaigns (admin view) ────────────────────────────────
  if (req.method === 'GET' && req.url === '/admin/campaigns') {
    if (!isAdmin(req, {})) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'unauthorized' })) }
    const rows = db.prepare('SELECT c.*, u.username as operator_username FROM campaigns c LEFT JOIN users u ON c.operator_id = u.id ORDER BY c.id ASC').all()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify(rows.map(c => ({
      id: c.id, type: c.type, title: c.title, status: c.status,
      goal: c.goal, raised: c.raised, deadline: c.deadline,
      operatorId: c.operator_id, operatorUsername: c.operator_username,
      walletXMR: c.wallet_xmr, walletZANO: c.wallet_zano,
      claimedAt: c.claimed_at, activatedAt: c.activated_at, walletChangedAt: c.wallet_changed_at,
    }))))
  }

  // ── Admin: update campaign (status, deadline, goal) ────────────────────────
  if (req.method === 'PATCH' && /^\/admin\/campaigns\/\d+$/.test(req.url)) {
    if (!isAdmin(req, {})) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'unauthorized' })) }
    const id = parseInt(req.url.split('/')[3])
    try {
      const body = await parseBody(req)
      const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id)
      if (!campaign) { res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Campaign not found' })) }
      const ALLOWED_STATUSES = ['unclaimed', 'claimed', 'active', 'funded', 'cancelled']
      const updates = {}
      if (body.status && ALLOWED_STATUSES.includes(body.status)) {
        updates.status = body.status
        if (body.status === 'active' && !campaign.activated_at) updates.activated_at = new Date().toISOString()
      }
      if (body.deadline && /^\d{4}-\d{2}-\d{2}$/.test(String(body.deadline))) updates.deadline = body.deadline
      if (body.goal && Number.isFinite(Number(body.goal)) && Number(body.goal) > 0) updates.goal = Math.round(Number(body.goal))
      if (!Object.keys(updates).length) { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'No valid fields to update' })) }
      const setClauses = Object.keys(updates).map(k => k + ' = ?').join(', ')
      db.prepare('UPDATE campaigns SET ' + setClauses + ' WHERE id = ?').run(...Object.values(updates), id)
      auditLog('admin_campaign_update', String(id), JSON.stringify(updates), ip)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true, id, updates }))
    } catch { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'bad request' })) }
  }

  // ── Admin: list campaign proposals ────────────────────────────────────────
  if (req.method === 'GET' && req.url === '/admin/proposals') {
    if (!isAdmin(req, {})) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'unauthorized' })) }
    try {
      const file = path.join(DATA_DIR, 'proposals.jsonl')
      const lines = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean) : []
      const proposals = lines.map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ proposals: proposals.reverse(), total: proposals.length }))
    } catch { res.writeHead(500, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'server error' })) }
  }

  // ── Admin: list registry applications ─────────────────────────────────────
  if (req.method === 'GET' && req.url === '/admin/registry') {
    if (!isAdmin(req, {})) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'unauthorized' })) }
    try {
      const file = path.join(DATA_DIR, 'registry.jsonl')
      const lines = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean) : []
      const entries = lines.map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ entries: entries.reverse(), total: entries.length }))
    } catch { res.writeHead(500, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'server error' })) }
  }

  // ── Admin: list attorney applications ────────────────────────────────────
  if (req.method === 'GET' && req.url.startsWith('/admin/attorney-applications')) {
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
    if (!isAdmin(req, {})) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'unauthorized' })) }
    try {
      const all = db.prepare('SELECT * FROM attorney_applications ORDER BY submitted_at DESC').all()
      const pending = all.filter(a => a.status === 'pending')
      const approved = all.filter(a => a.status === 'approved')
      const rejected = all.filter(a => a.status === 'rejected')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ pending, approved, rejected, total: all.length }))
    } catch {
      res.writeHead(500, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'server error' }))
    }
  }

  // ── Admin: review attorney application ───────────────────────────────────
  if (req.method === 'POST' && req.url === '/admin/attorney-applications/review') {
    // Auth BEFORE body parse — unauthed requests never trigger body read
    if (!isAdmin(req, {})) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'unauthorized' })) }
    try {
      const body = await parseBody(req)
      const { id, action } = body
      if (!id || !['approve', 'reject'].includes(action)) {
        res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'id and action (approve|reject) required' }))
      }
      const notes = String(body.notes || '').trim().slice(0, 1000) || null
      const newStatus = action === 'approve' ? 'approved' : 'rejected'
      // Parameterized query — no injection possible
      const changed = db.prepare(
        'UPDATE attorney_applications SET status = ?, reviewed_at = ?, notes = ? WHERE id = ?'
      ).run(newStatus, new Date().toISOString(), notes, id)
      auditLog('attorney_' + action, id, notes || null, ip)
      if (changed.changes > 0 && action === 'approve') {
        try {
          const appRow = db.prepare('SELECT full_name, email, account_created FROM attorney_applications WHERE id = ?').get(id)
          if (appRow && appRow.email && !appRow.account_created) {
            // Generate username from full_name
            const baseName = appRow.full_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 15)
            let newUsername = null
            for (let attempt = 0; attempt < 5; attempt++) {
              const suffix = String(Math.floor(1000 + Math.random() * 9000))
              const candidate = (baseName || 'attorney') + '_' + suffix
              const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(candidate)
              if (!existing) { newUsername = candidate; break }
            }
            if (!newUsername) {
              console.error('attorney account creation: could not generate unique username for', id)
            } else {
              const newUserId = randomUUID()
              const randomPw = randomUUID() + randomUUID() // unusable random password
              const pwHash = await bcrypt.hash(randomPw, 10)
              const accountCreatedAt = new Date().toISOString()
              db.prepare(
                "INSERT INTO users (id, username, password_hash, created_at, attorney_verified, role) VALUES (?, ?, ?, ?, 1, 'attorney')"
              ).run(newUserId, newUsername, pwHash, accountCreatedAt)
              // Insert claim token
              const rawToken = randomBytes(32).toString('hex')
              const tokenHash = await bcrypt.hash(rawToken, 10)
              const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              const claimTokenId = randomUUID()
              db.prepare('INSERT INTO claim_tokens (id, user_id, token_hash, expires_at, used) VALUES (?, ?, ?, ?, 0)')
                .run(claimTokenId, newUserId, tokenHash, expiresAt)
              // Update application
              db.prepare('UPDATE attorney_applications SET account_created = 1, account_user_id = ? WHERE id = ?')
                .run(newUserId, id)
              auditLog('attorney_account_created', id, newUserId, ip)
              // Send welcome email
              const claimLink = `https://citeback.com/claim-account?token=${rawToken}&id=${newUserId}`
              const welcomeText = `Hi ${appRow.full_name},\n\nYour application to the Citeback Expert Directory has been approved. Click the link below to set up your account and access your dashboard.\n\nActivate your account: ${claimLink}\n\n(This link is valid for 7 days)\n\nIf you have any questions, contact citeback@proton.me.\n\nCiteback`
              if (emailEnabled) {
                mailer.sendMail({ from: SMTP_FROM, to: appRow.email, subject: 'Welcome to Citeback — set up your account', text: welcomeText }).catch(e => console.error('attorney welcome email error:', e.message))
              }
            }
          } else if (appRow && appRow.email && emailEnabled) {
            // Already has account — send approval notification only
            const notifyText = 'Hi ' + appRow.full_name + ',\n\nYour application to the Citeback Expert Directory has been approved. You will be listed in the directory when the platform launches.\n\nIf you have any questions, contact citeback@proton.me.\n\nCiteback'
            mailer.sendMail({ from: SMTP_FROM, to: appRow.email, subject: 'Your Citeback Expert Directory application has been approved', text: notifyText }).catch(e => console.error('attorney notify error:', e.message))
          }
        } catch (e) { console.error('attorney account creation error:', e.message) }
      } else if (changed.changes > 0 && action === 'reject' && emailEnabled) {
        try {
          const appRow = db.prepare('SELECT full_name, email FROM attorney_applications WHERE id = ?').get(id)
          if (appRow && appRow.email) {
            const notifyText = 'Hi ' + appRow.full_name + ',\n\nThank you for applying to the Citeback Expert Directory. After review, we are unable to approve your application at this time.' + (notes ? '\n\nNote from reviewer: ' + notes : '') + '\n\nIf you have questions, contact citeback@proton.me.\n\nCiteback'
            mailer.sendMail({ from: SMTP_FROM, to: appRow.email, subject: 'Update on your Citeback Expert Directory application', text: notifyText }).catch(e => console.error('attorney notify error:', e.message))
          }
        } catch (e) { console.error('attorney notify lookup error:', e.message) }
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: changed.changes > 0, id, status: newStatus }))
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'bad request' }))
    }
  }

  // ── Claim account (attorney account setup via token link) ───────────────
  if (req.method === 'POST' && req.url === '/claim-account') {
    if (!checkAuthRateLimit(ip)) {
      res.writeHead(429, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Too many attempts. Try again later.' }))
    }
    try {
      let body
      try { body = await parseBody(req) } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Invalid request body.' }))
      }
      const { userId, token, username, password } = body
      // Generic error to avoid user enumeration
      const badToken = () => { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Invalid or expired activation link.' })) }
      if (!userId || !token || !username || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Missing required fields.' }))
      }
      // Validate username: 3-20 chars, alphanumeric + underscore only
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Username must be 3-20 characters, letters, numbers, and underscores only.' }))
      }
      // Validate password strength (not just length)
      if (password.length < 8) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Password must be at least 8 characters.' }))
      }
      const claimPwError = checkPasswordStrength(password)
      if (claimPwError) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: claimPwError }))
      }
      // Validate token format (64 hex chars)
      if (!/^[0-9a-f]{64}$/.test(token)) return badToken()
      // Look up user (same response for not-found to avoid enumeration)
      const user = db.prepare('SELECT id, attorney_verified, role FROM users WHERE id = ?').get(userId)
      if (!user) return badToken()
      // Atomic token burn: mark used=1 before any async work to close TOCTOU race window.
      // If two concurrent requests race in, only one UPDATE will find used=0; the other gets changes=0.
      // Step 1: read token hash while still unused
      const claimRow = db.prepare('SELECT id, token_hash, expires_at FROM claim_tokens WHERE user_id = ? AND used = 0').get(userId)
      if (!claimRow) return badToken()
      // Check expiry before burning
      if (new Date(claimRow.expires_at) < new Date()) return badToken()
      // Step 2: atomically mark used — only one concurrent request can win this UPDATE
      const burned = db.prepare('UPDATE claim_tokens SET used = 1 WHERE id = ? AND used = 0').run(claimRow.id)
      if (burned.changes === 0) return badToken() // lost the race; token already consumed
      // Step 3: verify token (token is now burned regardless of outcome — admin must reissue if wrong)
      const tokenMatch = await bcrypt.compare(token, claimRow.token_hash)
      if (!tokenMatch) return badToken()
      // Check username availability
      const takenUser = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, userId)
      if (takenUser) {
        res.writeHead(409, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Username is already taken. Choose another.' }))
      }
      // Update user with chosen username and hashed password
      const newHash = await bcrypt.hash(password, 12)
      db.prepare('UPDATE users SET username = ?, password_hash = ?, password_version = COALESCE(password_version,0)+1 WHERE id = ?')
        .run(username, newHash, userId)
      // Issue JWT session cookie
      const newPv = db.prepare('SELECT password_version FROM users WHERE id = ?').get(userId)?.password_version || 0
      const sessionToken = jwt.sign({ userId, username, pv: newPv }, JWT_SECRET, { expiresIn: JWT_EXPIRY })
      res.setHeader('Set-Cookie', `token=${sessionToken}; ${COOKIE_OPTS}`)
      auditLog('claim_account_used', userId, username, ip)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true, username }))
    } catch (e) {
      console.error('claim-account error:', e.message)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Server error. Please try again.' }))
    }
  }

  // ── Serve sighting photos ──────────────────────────────────────────────
  if (req.method === 'GET' && req.url.startsWith('/photos/')) {
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
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
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
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
      res.writeHead(500, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'server error' }))
    }
  }

  
  // ── Admin: login (exchange secret for session cookie) ─────────────────────
  if (req.method === 'POST' && req.url === '/admin/login') {
    const clientIp = getClientIp(req)
    if (!checkAdminLockout(clientIp)) {
      res.writeHead(429, { 'Content-Type': 'application/json', 'Retry-After': '900' })
      return res.end(JSON.stringify({ error: 'Too many failed attempts — locked out for 15 minutes' }))
    }
    try {
      const body = await parseBody(req)
      const supplied = String(body.secret || '').trim()
      if (!supplied || !timingSafeCompare(supplied, ADMIN_SECRET)) {
        recordAdminFail(clientIp)
        res.writeHead(401, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Invalid secret' }))
      }
      clearAdminFail(clientIp)
      const token = issueAdminSession(clientIp)
      auditLog('admin_login', null, null, clientIp)
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Set-Cookie': ADMIN_COOKIE + '=' + token + '; HttpOnly; Secure; SameSite=Strict; Max-Age=14400; Path=/',
      })
      return res.end(JSON.stringify({ ok: true }))
    } catch { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'bad request' })) }
  }

  // ── Admin: logout ──────────────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/admin/logout') {
    revokeAdminSession(req)
    auditLog('admin_logout', null, null, ip)
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Set-Cookie': ADMIN_COOKIE + '=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
    })
    return res.end(JSON.stringify({ ok: true }))
  }

  // ── Admin: verify session ──────────────────────────────────────────────────
  if (req.method === 'GET' && req.url === '/admin/verify-session') {
    const valid = verifyAdminSession(req)
    res.writeHead(valid ? 200 : 401, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ ok: valid }))
  }

  // ── Admin: audit log ──────────────────────────────────────────────────────
  if (req.method === 'GET' && req.url === '/admin/audit-log') {
    if (!isAdmin(req, {})) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'unauthorized' })) }
    try {
      const rows = db.prepare('SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT 200').all()
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify(rows))
    } catch { res.writeHead(500, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'server error' })) }
  }

// ── Admin: list pending sightings ─────────────────────────────────────────
  if (req.method === 'GET' && req.url.startsWith('/admin/sightings')) {
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
    if (!isAdmin(req, {})) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'unauthorized' })) }
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
      res.writeHead(500, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'server error' }))
    }
  }

  // ── Admin: approve or reject a sighting ───────────────────────────────────
  if (req.method === 'POST' && req.url === '/admin/sightings/moderate') {
    if (!isAdmin(req, {})) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'unauthorized' })) }
    try {
      const body = await parseBody(req)
      const { id, action } = body
      if (!id || !['approve', 'reject'].includes(action)) {
        res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'id and action (approve|reject) required' }))
      }
      const newStatus = action === 'approve' ? 'approved' : 'rejected'
      const changed = updateRecord('sightings.jsonl', s => s.id === id, s => ({ ...s, status: newStatus, moderatedAt: new Date().toISOString() }))
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: changed, id, status: newStatus }))
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'bad request' }))
    }
  }

  // ── Admin: bulk approve all pending sightings with lat/lng ────────────────
  if (req.method === 'POST' && req.url === '/admin/sightings/approve-all') {
    if (!isAdmin(req, {})) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'unauthorized' })) }
    try {
      const body = await parseBody(req)
      const file = path.join(DATA_DIR, 'sightings.jsonl')
      if (!fs.existsSync(file)) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ ok: true, approved: 0 })) }
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
      res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'bad request' }))
    }
  }

  // ── Campaigns API ────────────────────────────────────────────────────────────
  // OPTIONS preflight for /api/ is handled by the global OPTIONS handler above

  // GET /api/campaigns
  if (req.method === 'GET' && req.url === '/api/campaigns') {
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
    const rows = db.prepare('SELECT c.*, u.username as operator_username FROM campaigns c LEFT JOIN users u ON c.operator_id = u.id ORDER BY c.id ASC').all()
    const result = rows.map(c => ({
      id: c.id, type: c.type, title: c.title, description: c.description,
      winCondition: c.win_condition, location: c.location, goal: c.goal,
      raised: c.raised, backers: c.backers, deadline: c.deadline,
      tags: JSON.parse(c.tags || '[]'), source: c.source,
      contractContext: c.contract_context,
      verifyMeta: c.verify_meta ? JSON.parse(c.verify_meta) : null,
      milestones: c.milestones ? JSON.parse(c.milestones) : null,
      status: c.status, operatorId: c.operator_id,
      operatorUsername: c.operator_username,
      operatorName: c.operator_name, operatorBio: c.operator_bio,
      walletXMR: c.wallet_xmr, walletZANO: c.wallet_zano,
      claimedAt: c.claimed_at, activatedAt: c.activated_at,
      walletChangedAt: c.wallet_changed_at || null,
    }))
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify(result))
  }

  // GET /api/campaigns/:id — single campaign (for deep links and reduced payload)
  if (req.method === 'GET' && /^\/api\/campaigns\/\d+$/.test(req.url)) {
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
    const id = parseInt(req.url.split('/')[3])
    if (!Number.isFinite(id) || id < 1) { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'invalid id' })) }
    const c = db.prepare('SELECT c.*, u.username as operator_username FROM campaigns c LEFT JOIN users u ON c.operator_id = u.id WHERE c.id = ?').get(id)
    if (!c) { res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Campaign not found' })) }
    const result = {
      id: c.id, type: c.type, title: c.title, description: c.description,
      winCondition: c.win_condition, location: c.location, goal: c.goal,
      raised: c.raised, backers: c.backers, deadline: c.deadline,
      tags: JSON.parse(c.tags || '[]'), source: c.source,
      contractContext: c.contract_context,
      verifyMeta: c.verify_meta ? JSON.parse(c.verify_meta) : null,
      milestones: c.milestones ? JSON.parse(c.milestones) : null,
      status: c.status, operatorId: c.operator_id,
      operatorUsername: c.operator_username,
      operatorName: c.operator_name, operatorBio: c.operator_bio,
      walletXMR: c.wallet_xmr, walletZANO: c.wallet_zano,
      claimedAt: c.claimed_at, activatedAt: c.activated_at,
      walletChangedAt: c.wallet_changed_at || null,
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify(result))
  }

  // POST /api/campaigns/:id/claim
  if (req.method === 'POST' && /^\/api\/campaigns\/\d+\/claim$/.test(req.url)) {
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
    const id = parseInt(req.url.split('/')[3])
    const claims = verifyToken(req)
    if (!claims) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Not authenticated' })) }
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(claims.userId)
    if (!user || user.tier < 1) { res.writeHead(403, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Operator tier required (10+ reputation points)' })) }
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id)
    if (!campaign) { res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Campaign not found' })) }
    if (campaign.operator_id) { res.writeHead(409, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Campaign already claimed' })) }
    db.prepare('UPDATE campaigns SET operator_id = ?, status = ?, claimed_at = ? WHERE id = ?').run(claims.userId, 'claimed', new Date().toISOString(), id)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ ok: true, campaignId: id }))
  }

  // PATCH /api/campaigns/:id — update wallet + operator info (owner only)
  if (req.method === 'PATCH' && /^\/api\/campaigns\/\d+$/.test(req.url)) {
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
    const id = parseInt(req.url.split('/')[3])
    const claims = verifyToken(req)
    if (!claims) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Not authenticated' })) }
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id)
    if (!campaign) { res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Campaign not found' })) }
    if (campaign.operator_id !== claims.userId) { res.writeHead(403, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Not the campaign operator' })) }
    try {
      const body = await parseBody(req)
      const fields = {}
      // XMR/ZANO addresses: ~95-97 chars, base58 alphabet
      const WALLET_RE = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{90,110}$/
      if (body.walletXmr !== undefined) {
        const w = String(body.walletXmr||'').trim()
        if (w && !WALLET_RE.test(w)) { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Invalid XMR wallet address format' })) }
        fields.wallet_xmr = w || null
      }
      if (body.walletZano !== undefined) {
        const w = String(body.walletZano||'').trim()
        if (w && !WALLET_RE.test(w)) { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Invalid ZANO wallet address format' })) }
        fields.wallet_zano = w || null
      }
      if (body.operatorName !== undefined) fields.operator_name = String(body.operatorName||'').trim().slice(0,100) || null
      if (body.operatorBio !== undefined) fields.operator_bio = String(body.operatorBio||'').trim().slice(0,500) || null
      if (!Object.keys(fields).length) { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'No valid fields' })) }
      const updXmr = fields.wallet_xmr !== undefined ? fields.wallet_xmr : campaign.wallet_xmr
      const updZano = fields.wallet_zano !== undefined ? fields.wallet_zano : campaign.wallet_zano
      if (updXmr && updZano && campaign.status !== 'active') { fields.status = 'active'; fields.activated_at = new Date().toISOString() }
      // Audit trail: log wallet changes on active campaigns (important for donor trust)
      const walletChanged = (fields.wallet_xmr !== undefined || fields.wallet_zano !== undefined)
      if (walletChanged) {
        fields.wallet_changed_at = new Date().toISOString()
        // Write to persistent audit log (not just console — survives log rotation)
        auditLog('campaign_wallet_update', String(id), JSON.stringify({
          operator: claims.userId,
          xmr_changed: fields.wallet_xmr !== undefined,
          zano_changed: fields.wallet_zano !== undefined,
          was_active: campaign.status === 'active',
        }), ip)
      }
      const setClauses = Object.keys(fields).map(k => k + ' = ?').join(', ')
      db.prepare('UPDATE campaigns SET ' + setClauses + ' WHERE id = ?').run(...Object.values(fields), id)
      const updated = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true, campaign: updated }))
    } catch (e) {
      console.error('campaign PATCH error:', e.message)
      if (!res.headersSent) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Bad request' })) }
    }
  }

  // ── Passkey: register options ────────────────────────────────────────────────
  if (req.method === 'GET' && req.url === '/passkey/register-options') {
    const claims = verifyToken(req)
    if (!claims) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Authentication required' })) }
    try {
      const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(claims.userId)
      if (!user) { res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'User not found' })) }
      const existingKeys = db.prepare('SELECT credential_id FROM passkeys WHERE user_id = ?').all(user.id)
      const excludeCredentials = existingKeys.map(k => ({ id: k.credential_id, type: 'public-key' }))
      if (!checkPkRegRateLimit(ip)) {
        res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many attempts. Try again later.' }))
      }
      const options = await generateRegistrationOptions({
        rpName: RP_NAME,
        rpID: RP_ID,
        userID: new TextEncoder().encode(user.id),
        userName: user.username,
        userDisplayName: user.username,
        attestationType: 'none',
        excludeCredentials,
        authenticatorSelection: { residentKey: 'preferred', userVerification: 'required' },
      })
      const tempId = randomUUID()
      pkChallengeSet(tempId, options.challenge, user.id)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ options, tempId }))
    } catch (e) {
      console.error('passkey register-options error:', e.message)
      res.writeHead(500, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Server error' }))
    }
  }

  // ── Passkey: register verify ──────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/passkey/register-verify') {
    if (!checkPkRegRateLimit(ip)) {
      res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many attempts. Try again later.' }))
    }
    const claims = verifyToken(req)
    if (!claims) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Authentication required' })) }
    try {
      const body = await parseBody(req)
      const { response, tempId, deviceName } = body
      const stored = pkChallengeGet(tempId)
      if (!stored || stored.user_id !== claims.userId) {
        res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Challenge expired or invalid.' }))
      }
      pkChallengeDelete(tempId) // single-use
      const verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: stored.challenge,
        expectedOrigin: RP_ORIGIN,
        expectedRPID: RP_ID,
      })
      if (!verification.verified || !verification.registrationInfo) {
        res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Passkey verification failed.' }))
      }
      const { credential } = verification.registrationInfo
      const credentialId = Buffer.from(credential.id).toString('base64url')
      const publicKey = Buffer.from(credential.publicKey).toString('base64url')
      const passkeyId = randomUUID()
      const safeName = deviceName ? String(deviceName).trim().slice(0, 80) : null
      db.prepare('INSERT INTO passkeys (id, user_id, credential_id, public_key, sign_count, device_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        passkeyId, claims.userId, credentialId, publicKey, credential.counter, safeName, new Date().toISOString()
      )
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true, credentialId }))
    } catch (e) {
      console.error('passkey register-verify error:', e.message)
      res.writeHead(500, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Server error' }))
    }
  }

  // ── Passkey: auth options ─────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/passkey/auth-options') {
    if (!checkPkAuthRateLimit(ip)) {
      res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many attempts. Try again later.' }))
    }
    try {
      const body = await parseBody(req)
      const username = body.username ? String(body.username).trim() : null
      let allowCredentials = []
      let lookupUserId = null
      if (username) {
        const user = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
        if (user) {
          lookupUserId = user.id
          const keys = db.prepare('SELECT credential_id FROM passkeys WHERE user_id = ?').all(user.id)
          allowCredentials = keys.map(k => ({ id: k.credential_id, type: 'public-key' }))
        }
      }
      const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        userVerification: 'required',
        allowCredentials,
      })
      const tempId = randomUUID()
      pkChallengeSet(tempId, options.challenge, lookupUserId)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ options, tempId }))
    } catch (e) {
      console.error('passkey auth-options error:', e.message)
      res.writeHead(500, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Server error' }))
    }
  }

  // ── Passkey: auth verify ──────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/passkey/auth-verify') {
    if (!checkPkAuthRateLimit(ip)) {
      res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many attempts. Try again later.' }))
    }
    try {
      const body = await parseBody(req)
      const { response, tempId } = body
      const stored = pkChallengeGet(tempId)
      if (!stored) {
        res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Challenge expired. Please try again.' }))
      }
      pkChallengeDelete(tempId) // single-use
      // Look up passkey by credential ID
      const rawCredentialId = response.id
      const passkeyRow = db.prepare('SELECT * FROM passkeys WHERE credential_id = ?').get(rawCredentialId)
      if (!passkeyRow) {
        res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Passkey not recognized.' }))
      }
      // Cross-check: if challenge was issued for a specific user, credential must belong to that user
      if (stored.user_id && passkeyRow.user_id !== stored.user_id) {
        res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Passkey does not match the requested account.' }))
      }
      const publicKeyBytes = Buffer.from(passkeyRow.public_key, 'base64url')
      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: stored.challenge,
        expectedOrigin: RP_ORIGIN,
        expectedRPID: RP_ID,
        credential: {
          id: passkeyRow.credential_id,
          publicKey: publicKeyBytes,
          counter: passkeyRow.sign_count,
        },
      })
      if (!verification.verified) {
        res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Passkey authentication failed.' }))
      }
      // Replay protection: new counter must be >= stored (0 counters indicate non-roaming key — allowed)
      const newCounter = verification.authenticationInfo.newCounter
      if (passkeyRow.sign_count > 0 && newCounter <= passkeyRow.sign_count) {
        res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Passkey replay detected. Security violation.' }))
      }
      db.prepare('UPDATE passkeys SET sign_count = ? WHERE id = ?').run(newCounter, passkeyRow.id)
      // Issue JWT
      const user = db.prepare('SELECT id, username, password_version FROM users WHERE id = ?').get(passkeyRow.user_id)
      if (!user) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'User not found.' })) }
      const sessionToken = jwt.sign({ userId: user.id, username: user.username, pv: user.password_version || 0 }, JWT_SECRET, { expiresIn: JWT_EXPIRY })
      res.setHeader('Set-Cookie', `token=${sessionToken}; ${COOKIE_OPTS}`)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true, username: user.username }))
    } catch (e) {
      console.error('passkey auth-verify error:', e.message)
      res.writeHead(500, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Server error' }))
    }
  }

  // ── Passkey: list ─────────────────────────────────────────────────────────
  if (req.method === 'GET' && req.url === '/passkey/list') {
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
    const claims = verifyToken(req)
    if (!claims) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Authentication required' })) }
    const keys = db.prepare('SELECT id, credential_id, device_name, created_at FROM passkeys WHERE user_id = ? ORDER BY created_at DESC').all(claims.userId)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ passkeys: keys }))
  }

  // ── Passkey: delete ───────────────────────────────────────────────────────
  if (req.method === 'DELETE' && req.url.startsWith('/passkey/')) {
    if (!checkAuthRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
    const claims = verifyToken(req)
    if (!claims) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Authentication required' })) }
    let credentialId
    try { credentialId = decodeURIComponent(req.url.slice('/passkey/'.length)) } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Invalid credential ID' }))
    }
    if (!credentialId) { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Missing credentialId' })) }
    const result = db.prepare('DELETE FROM passkeys WHERE credential_id = ? AND user_id = ?').run(credentialId, claims.userId)
    if (result.changes === 0) { res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Passkey not found or not yours' })) }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ ok: true }))
  }


  // ── Public: version / independent verification ───────────────────────────
  if (req.method === 'GET' && req.url === '/version') {
    if (!checkRateLimit(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Too many requests' })) }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({
      server: {
        sha256: SERVER_SHA256,
        deployedAt: DEPLOYED_AT,
        file: 'server.js',
        howToVerify: 'Fetch server.js from the public GitHub repo at the matching commit and run: sha256sum server.js — the hash must match.',
      },
      frontend: {
        repo: 'https://github.com/citeback/citebackwebsite',
        deploys: 'https://app.netlify.com/sites/heroic-yeot-51eaeb/deploys',
        howToVerify: 'Every frontend deploy on Netlify lists the exact GitHub commit it was built from.',
      },
      note: 'SHA-256 is computed from the live server.js at startup. If it matches the public repo, the code running here is exactly what is published.',
    }))
  }

  // ── AI chat ────────────────────────────────────────────────────────────────
  if (req.method !== 'POST' || req.url !== '/api/chat') {
    res.writeHead(404); return res.end('Not found')
  }

  stats.total++

  // Rate limit + queue check BEFORE reading body — prevents body-stuffing DoS
  if (!checkRateLimit(ip)) {
    stats.rateLimited++
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify(RATE_LIMITED))
  }
  if (queue.length >= MAX_QUEUE) {
    stats.busy++
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify(BUSY))
  }

  // Body size cap: 64KB is more than enough for any real chat message
  const MAX_CHAT_BODY = 64 * 1024
  let rawBody = ''
  let bodyBytes = 0
  req.on('data', chunk => {
    bodyBytes += chunk.length
    if (bodyBytes > MAX_CHAT_BODY) { req.destroy(); return }
    rawBody += chunk
  })
  req.on('end', () => {
    if (bodyBytes > MAX_CHAT_BODY) return // destroyed
    let parsed
    try { parsed = JSON.parse(rawBody) } catch { res.writeHead(400); return res.end('Bad request') }
    // Cap history to last 20 messages — prevents context-stuffing with huge histories
    const messages = (parsed.messages || []).slice(-20)
    const lastUser = [...messages].reverse().find(m => m.role === 'user')
    // Cap individual message length — prevent single-message context stuffing
    const rawUserText = lastUser?.content || ''
    const userText = typeof rawUserText === 'string' ? rawUserText.slice(0, 4000) : ''
    // Check injection signals across ALL messages in the thread (multi-turn bypass prevention).
    // Attackers inject in an early turn then ask a benign question as the last message.
    // isOnTopic only checks the last user message — hasInjectionInHistory covers the rest.
    const hasInjectionInHistory = messages.some(m => {
      const txt = normalizeInput(typeof m.content === 'string' ? m.content.normalize('NFKC') : '')
      return INJECTION_SIGNALS.some(s => txt.toLowerCase().includes(s))
    })
    if (!checkRateLimit(ip)) {
      // Second check in case of race (belt + suspenders)
      stats.rateLimited++
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify(RATE_LIMITED))
    }
    if (hasInjectionInHistory || !isOnTopic(userText)) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify(OFF_TOPIC))
    }
    const timer = setTimeout(() => {
      const idx = queue.findIndex(q => q.res === res)
      if (idx !== -1) { queue.splice(idx, 1); stats.busy++ }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(BUSY))
    }, QUEUE_TIMEOUT)
    // Forward sanitised capped messages — not the raw client body
    const safeBody = JSON.stringify({ ...parsed, messages })
    queue.push({ body: safeBody, res, timer })
    processNext()
  })
})

// ── Process stability handlers ───────────────────────────────────────────────
// Prevent unhandled rejections from crashing the process (= instant downtime)
process.on('unhandledRejection', (reason, promise) => {
  console.error('[unhandledRejection] at:', promise, 'reason:', reason?.message || reason)
  // Don't exit — log and continue. The request that caused it will time out gracefully.
})
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err.message, err.stack)
  // For truly uncaught exceptions, log and attempt graceful shutdown
  setTimeout(() => process.exit(1), 3000) // Give systemd time to restart
})

// Graceful shutdown — drain in-flight requests on SIGTERM (systemctl stop/restart)
process.on('SIGTERM', () => {
  console.log('[SIGTERM] Shutting down gracefully...')
  server.close(() => {
    console.log('[SIGTERM] Server closed. Exiting.')
    // Checkpoint WAL before exit
    try { db.prepare('PRAGMA wal_checkpoint(TRUNCATE)').run() } catch {}
    process.exit(0)
  })
  // Force exit after 10s if connections don't drain
  setTimeout(() => { console.error('[SIGTERM] Force exit'); process.exit(1) }, 10_000)
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Citeback proxy :${PORT} | queue:${MAX_QUEUE} | rate:${RATE_LIMIT}req/min | data:${DATA_DIR} | auth:enabled | admin:enabled`)
})
