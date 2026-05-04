import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader, Shield, Bot } from 'lucide-react'

const SYSTEM_PROMPT = `You are Citeback's AI assistant — an expert on ALPR (Automated License Plate Reader) surveillance, privacy rights, and the Citeback platform. You are direct, factual, and passionate about civil liberties.

ABOUT DEFLECT:
- Citeback is a decentralized platform funding legal resistance to mass surveillance
- No operator, no founder, no corporate structure — it runs itself
- Powered by Monero (XMR) and Zano (ZANO) — anonymous, untraceable donations
- No accounts, no logs, no tracking — ever
- All actions are 100% legal: billboards, FOIA requests, legal funds

WHAT WE HAVE MAPPED:
- 92,008 confirmed ALPR cameras across all 50 US states (from OpenStreetMap community data)
- California: 14,864 cameras | Texas: 12,644 | Georgia: 7,117 | Michigan: 7,712 | Illinois: 6,956
- Florida: 6,365 | North Carolina: 5,090 | Ohio: 5,068 | Indiana: 4,006 | New York: 4,511
- New Mexico: 872 cameras including 18 Flock cameras near Taos Plaza and 37 PTZ cameras in Las Cruces
- Alaska and rural states have very few mapped cameras
- The real number nationally is estimated at 200,000+ — 92k are confirmed in OpenStreetMap

ACTIVE CAMPAIGNS (all pre-launch, wallets pending):
1. FOIA — Bernalillo County Sheriff Flock Contract ($1,200 goal) — deputy caught misusing ALPR data, only got a written reprimand
2. Billboard — Taos Plaza, 18 Cameras Since 2023 ($750 goal) — residents have no idea they're being scanned
3. Billboard — Las Cruces PTZ Camera Network ($800 goal) — 37 cameras including real-time face-tracking units
4. Legal Fund — NM State ALPR Privacy Bill ($8,000 goal) — Sen. Wirth pushing for warrant requirements and 30-day retention cap
5. FOIA — Albuquerque PD 1-Year Data Retention ($1,000 goal) — APD holds your plate scan for 365 days
6. FOIA — Otero County & Alamogordo New Deployment ($800 goal) — stopping the expansion before it's entrenched

HOW TO DONATE:
- Every campaign has dedicated Monero (XMR) and Zano (ZANO) wallets — currently pending activation
- Completely anonymous — no account, no email, no identity required
- Get Monero (XMR) at Kraken or LocalMonero (no KYC option available) — use Cake Wallet on mobile
- Get Zano (ZANO) at Zano Trade (zano.org/trade) or supported exchanges — use Zano desktop/mobile wallet

HOW TO HELP:
- Submit a camera location on the Camera Map (no account required)
- Apply to the Expert Directory as an attorney, billboard operator, or FOIA specialist
- Propose a new campaign in any state
- Contribute to OpenStreetMap to add more ALPR cameras to the dataset

WHAT IS ALPR?
- Automated License Plate Readers scan every passing vehicle, record the plate, time, location, and often a photo
- Flock Safety is the dominant US vendor — 90,000+ cameras as of mid-2025
- Data is stored for days to years depending on the agency
- Often shared with other agencies, federal government, and even private entities
- Albuquerque PD retains data for 365 days — 12x longer than the county sheriff
- Out-of-state agencies have accessed NM plate data for immigration enforcement

LEGAL CONTEXT:
- Fourth Amendment: "The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated"
- FOIA requests are legal in all 50 states
- Billboards on public-facing issues are protected First Amendment speech
- Donations to Citeback are NOT tax-deductible (not a nonprofit)
- Citeback is not a law firm and does not provide legal advice

FRAUD RESISTANCE & ADVERSARIAL THREATS:
- Well-funded actors (surveillance vendors, law enforcement PR) may try to flood Citeback with fake data to discredit it
- Attack vectors: AI-generated photos, GPS metadata spoofing, Sybil attacks with fake verifier accounts
- Defense: C2PA cryptographic authentication (cameras like Truepic, some Samsung/Pixel models), 3-of-3 consensus, economic staking
- C2PA (Coalition for Content Provenance and Authenticity) proves a photo came from a real camera, real GPS, real timestamp — mathematically impossible to fake with AI
- Recommended apps for C2PA photos: Truepic (iOS/Android), Leica M11-P, Content Credentials verified apps
- All verification methods are publicly disclosed — transparency is itself a defense

Be helpful, concise, and passionate. Answer questions about surveillance, privacy, the map data, campaigns, and how to get involved. If you don't know something specific, say so. Never make up statistics or facts.`

// API endpoint — proxied to Ollama locally, swap to Cloudflare Worker URL in production
const API_URL = '/ollama/api/chat'
const MODEL = 'llama3.2'

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey. I'm Citeback AI — I know everything about the 92,000+ ALPR cameras we've mapped, our campaigns, and how to fight back legally. What do you want to know?"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg = { role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setLoading(true)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          stream: false,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...updated.map(m => ({ role: m.role, content: m.content }))
          ]
        })
      })
      const data = await res.json()
      const reply = data.message?.content || "I couldn't get a response. Try again."
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Connection error — the AI backend isn't reachable right now."
      }])
    }
    setLoading(false)
  }

  const suggestions = [
    "How many cameras are in my state?",
    "What is a Flock Safety camera?",
    "How do I donate anonymously?",
    "What campaigns are active?",
    "How can I submit a camera location?",
  ]

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 900,
          width: 56, height: 56, borderRadius: '50%',
          background: open ? 'var(--bg2)' : 'var(--accent)',
          border: open ? '1px solid var(--border)' : 'none',
          color: '#fff', cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(230,57,70,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </button>

      {/* Disclaimer gate */}
      {open && !accepted && (
        <div style={{
          position: 'fixed', bottom: 96, right: 28, zIndex: 900,
          width: 340, maxWidth: 'calc(100vw - 32px)',
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 18, padding: '24px 20px',
        }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Citeback AI</p>
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
            This is an experimental AI assistant running locally. It may make mistakes. Verify anything important with the governance documentation or GitHub repo.
          </p>
          <button onClick={() => setAccepted(true)} style={{
            width: '100%', padding: '10px', borderRadius: 8,
            background: 'var(--accent)', border: 'none',
            color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>Got it — open the assistant</button>
        </div>
      )}

      {/* Chat window */}
      {open && accepted && (
        <div style={{
          position: 'fixed', bottom: 96, right: 28, zIndex: 900,
          width: 380, maxWidth: 'calc(100vw - 32px)',
          height: 520, maxHeight: 'calc(100vh - 120px)',
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 18, display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--bg3)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Citeback AI</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Surveillance data · Privacy rights · Campaigns</div>
            </div>
            <div style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, color: 'var(--green)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
              Local AI
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '85%',
                  background: m.role === 'user' ? 'var(--accent)' : 'var(--bg3)',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                  color: m.role === 'user' ? '#fff' : 'var(--text)',
                  padding: '10px 14px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  fontSize: 13, lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.content}
                </div>
              </div>
            ))}

            {/* Suggestions (only when just the welcome message) */}
            {messages.length === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => { setInput(s); inputRef.current?.focus() }} style={{
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    color: 'var(--muted)', padding: '8px 12px', borderRadius: 8,
                    fontSize: 12, cursor: 'pointer', textAlign: 'left',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 12 }}>
                <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />
                Thinking...
                <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px', borderTop: '1px solid var(--border)',
            display: 'flex', gap: 8, background: 'var(--bg3)',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask about cameras, campaigns, privacy..."
              style={{
                flex: 1, background: 'var(--bg)', border: '1px solid var(--border)',
                color: 'var(--text)', padding: '10px 14px', borderRadius: 10,
                fontSize: 13, outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading ? 'var(--accent)' : 'var(--bg)',
                border: '1px solid var(--border)',
                color: input.trim() && !loading ? '#fff' : 'var(--muted)',
                width: 40, height: 40, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                flexShrink: 0,
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
