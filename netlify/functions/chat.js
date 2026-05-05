// Netlify Function — proxies chat requests to Hetzner Ollama backend
// API key is stored in Netlify env vars, never exposed to the browser

const OLLAMA_URL = 'http://77.42.124.157:11435/api/chat'
const API_KEY = process.env.CITEBACK_AI_KEY

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': 'https://citeback.com',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  if (!API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfigured' }) }
  }

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: event.body,
    })

    const data = await response.json()

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'AI backend unavailable', detail: err.message }),
    }
  }
}
