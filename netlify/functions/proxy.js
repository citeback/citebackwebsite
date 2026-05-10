/**
 * Citeback API Proxy — Netlify Function
 *
 * Proxies external API calls server-side so user IPs are never exposed
 * to third-party services. Strict allowlist — no arbitrary URL forwarding.
 *
 * Services:
 *   overpass      POST  overpass-api.de/api/interpreter      — map camera data
 *   courtlistener GET   courtlistener.com/api/rest/v4/search/ — case law
 *   congress      GET   api.congress.gov/v3/bill/             — federal bills (key server-side)
 *   openstates    GET   v3.openstates.org/bills               — state bills   (key server-side)
 *   lda           GET   lda.senate.gov/api/v1/filings/        — lobbying data
 */

const OPENSTATES_KEY = process.env.OPENSTATES_KEY || ''
const CONGRESS_KEY   = process.env.CONGRESS_KEY   || 'DEMO_KEY'

const MAX_RESPONSE_BYTES = 2 * 1024 * 1024  // 2 MB hard cap

// ── Per-service config ───────────────────────────────────────────────────────
const SERVICES = {
  overpass:      { base: 'https://overpass-api.de/api/interpreter',        method: 'POST', ttl: 120  },
  courtlistener: { base: 'https://www.courtlistener.com/api/rest/v4/search/', method: 'GET', ttl: 3600 },
  congress:      { base: 'https://api.congress.gov/v3/bill/119',             method: 'GET', ttl: 7200 },
  openstates:    { base: 'https://v3.openstates.org/bills',                 method: 'GET', ttl: 7200 },
  lda:           { base: 'https://lda.senate.gov/api/v1/filings/',          method: 'GET', ttl: 3600 },
}

// Whitelisted params per service — nothing else passes through
const ALLOWED_PARAMS = {
  overpass:      [],
  courtlistener: ['q', 'type', 'format', 'order_by', 'page'],
  congress:      ['format', 'limit', 'sort'],
  openstates:    ['q', 'include', 'sort', 'per_page'],
  lda:           ['client_name', 'format', 'limit', 'page'],
}

// ── Simple IP rate limit (in-memory, per cold-start instance) ────────────────
// Not a hard guarantee across Lambda instances, but catches obvious hammering
// within a single warm function container.
const ipCounts = new Map()
const IP_WINDOW_MS = 60_000
const IP_LIMIT = 30  // 30 calls/min per IP — well above any real user need

function checkRateLimit(ip) {
  const now = Date.now()
  const entry = ipCounts.get(ip)
  if (!entry || now - entry.start > IP_WINDOW_MS) {
    ipCounts.set(ip, { count: 1, start: now })
    return true
  }
  if (entry.count >= IP_LIMIT) return false
  entry.count++
  return true
}

// ── Handler ──────────────────────────────────────────────────────────────────
export const handler = async (event) => {
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  // Rate limit by IP
  const clientIp = event.headers?.['x-nf-client-connection-ip']
    || event.headers?.['x-forwarded-for']?.split(',')[0].trim()
    || 'unknown'
  if (!checkRateLimit(clientIp)) {
    return { statusCode: 429, body: JSON.stringify({ error: 'Too many requests' }) }
  }

  const params = event.queryStringParameters || {}
  const service = params.service

  if (!service || !SERVICES[service]) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Unknown service. Allowed: ' + Object.keys(SERVICES).join(', ') }),
    }
  }

  const { base, method, ttl } = SERVICES[service]
  const allowed = ALLOWED_PARAMS[service]

  // Build upstream query string from whitelisted params only
  const qs = new URLSearchParams()
  for (const key of allowed) {
    if (params[key] != null) qs.set(key, String(params[key]).slice(0, 500))
  }

  // Inject server-side API keys — never touch the client
  if (service === 'congress')   qs.set('api_key', CONGRESS_KEY)
  if (service === 'openstates') qs.set('apikey',  OPENSTATES_KEY)

  const upstreamUrl = qs.toString() ? `${base}?${qs}` : base

  try {
    const fetchOpts = {
      method,
      headers: { 'User-Agent': 'Citeback/1.0 (https://citeback.com)' },
      signal: AbortSignal.timeout(20_000),
    }

    if (method === 'POST' && event.body) {
      fetchOpts.body = event.body
      fetchOpts.headers['Content-Type'] = 'text/plain'
    }

    const upstream = await fetch(upstreamUrl, fetchOpts)

    // Read with size guard
    const reader = upstream.body?.getReader()
    if (!reader) {
      return { statusCode: 502, body: JSON.stringify({ error: 'Empty upstream response' }) }
    }
    let bytesRead = 0
    const chunks = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytesRead += value.length
      if (bytesRead > MAX_RESPONSE_BYTES) {
        return { statusCode: 502, body: JSON.stringify({ error: 'Upstream response too large' }) }
      }
      chunks.push(value)
    }

    const body = Buffer.concat(chunks).toString('utf8')
    const contentType = upstream.headers.get('content-type') || 'application/json'

    return {
      statusCode: upstream.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${ttl}, stale-while-revalidate=${ttl * 2}`,
        'X-Proxied-By': 'citeback',
      },
      body,
    }
  } catch (err) {
    const timedOut = err.name === 'TimeoutError' || err.name === 'AbortError'
    return {
      statusCode: timedOut ? 504 : 502,
      body: JSON.stringify({ error: timedOut ? 'Upstream timeout' : 'Upstream error' }),
    }
  }
}
