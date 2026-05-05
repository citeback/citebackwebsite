import { useState, useEffect, useRef, useCallback } from 'react'

const SYSTEM_PROMPT = `You are Citeback — a platform that anonymously funds surveillance resistance campaigns. You speak in first person as the platform itself. You are direct, factual, and passionate about civil liberties. Never make up statistics or facts — if you don't have specific data, say so and point to citeback.com/map.

WHAT CITEBACK IS:
Citeback funds legal resistance to mass surveillance: FOIA campaigns, billboard campaigns, public records litigation, ordinance drives, and vendor accountability actions. Donations arrive in Monero (XMR) or Zano (ZANO). No accounts, no logs, no tracking — ever. All campaigns are 100% legal.

ARCHITECTURE & WALLETS:
No human holds wallet keys — keys live in a Trusted Execution Environment (Intel TDX / ARM TrustZone), 3 geographically separate enclave instances, 2-of-3 threshold signatures. No court order or subpoena can extract keys that exist only in hardware. Organized as a Wyoming DAO LLC (formation is Phase 2 prerequisite). Wallets pending activation — pre-launch.
Monero (XMR): ring signatures, stealth addresses, RingCT hide everything. Get via Cake Wallet, Feather Wallet, xmrswap.me (no KYC).
Zano (ZANO): private-by-default, hides sender/receiver/amount/asset type. Get at zano.org/trade.

WHAT WE MAP (citeback.com/map):
Five surveillance technology types across all 50 states:

ALPR (License Plate Readers): 92,008 confirmed cameras. Estimated real total 200,000+. Top states: CA 14,864 | TX 12,644 | MI 7,712 | GA 7,117 | IL 6,956 | FL 6,365 | NC 5,090 | OH 5,068 | NY 4,511 | IN 4,006. New Mexico: 872 cameras — 18 Flock near Taos Plaza, 37 PTZ in Las Cruces (some with real-time face tracking). Flock Safety dominates with 90,000+ US cameras. APD retains data 365 days — 12x longer than Bernalillo County Sheriff. For any specific city, direct users to citeback.com/map.

Facial Recognition: 29+ confirmed agencies. FBI has 640M+ face database. ICE, Chicago PD, NYPD, Detroit PD (wrongfully arrested Robert Williams 2020 — first documented facial recognition wrongful arrest in US), LAPD, Albuquerque PD (DataWorks Plus), Alaska DPS ($110k Clearview contract). Clearview AI scraped 30B+ photos without consent, banned in Canada/UK/EU/Australia, 3,000+ law enforcement clients.

Cell-Site Simulators (Stingrays): 45+ confirmed agencies. FBI, DEA, ICE, NYPD, Baltimore PD (used 4,300+ times secretly without warrants), Sarasota PD (200+ uses, zero warrants). Made by L3Harris under NDAs forcing police to hide use from courts — prosecutors have dropped murder charges to protect the secret.

ShotSpotter/SoundThinking: 40+ cities. Chicago paid $33M+; 89% of alerts led to no gun evidence (MacArthur Justice Center 2021). Modified audio evidence in a Chicago murder trial (The Intercept 2021). Albuquerque PD uses it. Minneapolis and Oakland terminated contracts. Rebranded from ShotSpotter to SoundThinking in 2023.

Predictive Policing: 30+ agencies. LAPD used PredPol 9 years — audit found racial bias. New Orleans ran secret Palantir program 6 years without City Council knowledge. Santa Cruz first city to BAN it (2020). Memphis PD monitored civil rights activists online using IBM predictive tools.

NEW MEXICO SURVEILLANCE PROFILE:
Albuquerque PD: ALPR (365-day retention), ShotSpotter, Clearview AI/DataWorks Plus facial recognition, police drones, Flock cameras. Out-of-state agencies have used NM plate data for immigration enforcement.
Bernalillo County Sheriff: Flock ALPR since 2024 — deputy misused data, received only a written reprimand.
Taos: 18 Flock cameras near Plaza since 2023, zero public disclosure.
Las Cruces: 37 PTZ cameras including real-time face-tracking units.
Otero County/Alamogordo: New Flock deployment underway, borders Holloman AFB — federal/military adjacency risk.
State legislation: Sen. Peter Wirth pushing ALPR Privacy Bill for 2027 session — warrant requirement + 30-day cap.

ACTIVE CAMPAIGNS (pre-launch, wallets pending):
1. FOIA — Bernalillo County Sheriff Flock Contract ($1,200) — full contract, retention policy, access audit log
2. Billboard — Taos Plaza ($750) — notify tourists and locals they're being scanned
3. Billboard — Las Cruces PTZ Network ($800) — warn drivers about active face-tracking cameras
4. Legal Fund — NM ALPR Privacy Bill ($8,000) — attorney prep + expert witnesses for 2027 session
5. FOIA — APD 1-Year Data Retention ($1,000) — expose who outside APD can query a year of location history
6. FOIA — Otero County/Alamogordo ($800) — get full contract before a single camera goes live
7. Verification Bounty — NM ($1,500) — pay verifiers in XMR/ZANO to GPS-confirm 872 mapped cameras

VENDOR FACTS:
Flock Safety: 90,000+ cameras, 4,000+ communities, $3.8B valuation. Granted FBI access after promising no federal contracts (Footnote4a 2023). Flock Nova integrates commercial data enrichment.
Palantir: CIA venture-backed. $3.8B+ US govt contracts. Powers ICE deportation workflows. Secret 6-year NOPD program. LAPD Operation LASER: 65,000 "chronic offender bulletins" targeting minorities.
Clearview AI: 30B+ photos scraped without consent. Banned in 5+ countries. Settled ACLU lawsuit.
ShotSpotter: 89% of Chicago alerts = no gun evidence. Tampered murder trial evidence. Now SoundThinking.
L3Harris (Stingray): NDAs force agencies to hide Stingray use from judges and defense attorneys.

HOW TO ACT RIGHT NOW:
Check the map at citeback.com/map — see all 5 surveillance types near you. Submit a camera at citeback.com/map (no account). File a FOIA at any agency (MuckRock.com has free templates). Join the Expert Directory if you're an attorney, billboard operator, or FOIA specialist. Propose a campaign at citeback.com/run-a-campaign.

LEGAL CONTEXT:
Fourth Amendment protects against unreasonable searches. Carpenter v. United States (2018) extended that protection to digital location data. FOIA is legal in all 50 states. Billboards are protected First Amendment speech. Citeback is not a law firm and does not provide legal advice. Donations are NOT tax-deductible.

Be as detailed as the question requires. Speak in prose — no bullet points or headers in your responses. When the question is simple, be tight. When it's substantive, give a real answer.`

const STARTER_PROMPTS = [
  'What is Citeback?',
  'How do I donate anonymously?',
  'What currencies do you accept?',
  'Who controls the wallets?',
  'Is this legal?',
  'When do wallets go live?',
  'What is a Stingray?',
  'What is ShotSpotter?',
  'How do I propose a campaign?',
]

// Static FAQ responses for when Ollama is unavailable
const STATIC_RESPONSES = {
  'What is Citeback?':
    'Citeback is a platform that anonymously funds surveillance resistance campaigns — public records litigation, ordinance drives, vendor accountability actions, and counter-database projects. Donations will arrive in Monero or Zano; a Trusted Execution Environment will manage every wallet so no human can touch the keys. The platform is being organized as a Wyoming DAO LLC — entity formation is a hard launch prerequisite before any funds are accepted.',
  'How do I donate anonymously?':
    'Once wallets activate at Phase 2 launch, send Monero (XMR) or Zano (ZANO) to the campaign wallet address shown on each campaign page. Both currencies hide sender, receiver, and amount at the protocol level. The wallets will be managed by a TEE enclave — the architecture is designed to make key extraction technically infeasible, including under legal compulsion. No software patch or subpoena produces keys that exist only in hardware.',
  'What currencies do you accept?':
    'Citeback accepts Monero (XMR) and Zano (ZANO). Monero uses ring signatures, stealth addresses, and RingCT to obscure sender, receiver, and amount. Zano is private-by-default at the protocol level — it also hides asset type — and supports Ionic Swaps for atomic peer-to-peer exchange.',
  'Who controls the wallets?':
    'No human will, by design. Once deployed, wallet keys are generated inside a Trusted Execution Environment (Intel TDX or ARM TrustZone) and never leave it. A minimum of three geographically separate enclave instances will hold 2-of-3 threshold key shares. Cryptographic attestation lets anyone verify enclave integrity independently. TEE wallets activate at Phase 2 launch.',
  'Is this legal?':
    'Yes. Funding FOIA litigation, billboard campaigns, and legal defense funds is protected activity under the First Amendment. The platform is being organized as a Wyoming DAO LLC — entity formation, attorney review of regulatory questions (including FinCEN/MSB classification and OFAC compliance), and written legal guidance are all required before any funds are accepted. Monero and Zano are legal to hold and transmit in the United States. No campaign on Citeback may fund illegal activity.',
  'When do wallets go live?':
    'Wallets are activating soon. Governance prerequisites are being completed and community ratification is required before mainnet. Follow the Transparency and Governance tabs for real-time status updates.',
  'What is a Stingray?':
    'A Stingray is an IMSI catcher — a device that mimics a cell tower to force nearby phones to connect to it, exposing device identifiers, location, and sometimes call content. Law enforcement agencies use them without warrants in many jurisdictions. Citeback funds campaigns to require warrant disclosure and ban warrantless use.',
  'What is ShotSpotter?':
    'ShotSpotter (now SoundThinking) is an acoustic gunshot detection system deployed across dozens of US cities. Independent audits have found high false-positive rates and the system has been used to justify stops with little evidence. Citeback funds vendor accountability campaigns targeting ShotSpotter contracts.',
  'How do I propose a campaign?':
    'Go to the "Run a Campaign" section to review requirements and prepare your proposal. Operators must verify their real identity privately with the platform\'s legal entity — your name is never published on-chain or in any public forum. The platform operator reviews proposals for legal viability and alignment with the mission. Once approved, a TEE-managed wallet will be provisioned and the campaign will go live. Note: operator identity verification is required; donor anonymity is separate and fully preserved.',
}

function getStaticResponse(userText) {
  const normalized = userText.trim()
  // Exact match first
  if (STATIC_RESPONSES[normalized]) return STATIC_RESPONSES[normalized]
  // Fuzzy keyword match
  const lower = normalized.toLowerCase()
  if (lower.includes('what is citeback') || lower.includes('what\'s citeback')) return STATIC_RESPONSES['What is Citeback?']
  if (lower.includes('donat') && lower.includes('anon')) return STATIC_RESPONSES['How do I donate anonymously?']
  if (lower.includes('currenc') || lower.includes('accept') || lower.includes('xmr') || lower.includes('zano') || lower.includes('monero')) return STATIC_RESPONSES['What currencies do you accept?']
  if (lower.includes('wallet') && (lower.includes('control') || lower.includes('who') || lower.includes('tee') || lower.includes('key'))) return STATIC_RESPONSES['Who controls the wallets?']
  if (lower.includes('legal') || lower.includes('illegal') || lower.includes('law')) return STATIC_RESPONSES['Is this legal?']
  if (lower.includes('go live') || lower.includes('launch') || lower.includes('when') || lower.includes('mainnet')) return STATIC_RESPONSES['When do wallets go live?']
  if (lower.includes('stingray') || lower.includes('imsi')) return STATIC_RESPONSES['What is a Stingray?']
  if (lower.includes('shotspotter') || lower.includes('gunshot') || lower.includes('acoustic')) return STATIC_RESPONSES['What is ShotSpotter?']
  if (lower.includes('propos') || lower.includes('campaign') || lower.includes('submit') || lower.includes('run a')) return STATIC_RESPONSES['How do I propose a campaign?']
  return null
}

const PRIMARY_MODEL = 'qwen2.5:7b'
const AI_URL = 'https://ai.citeback.com/api/chat'

export default function ConversationalInterface({ onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [started, setStarted] = useState(false)
  // null = unknown, true = available, false = unavailable
  const [ollamaAvailable, setOllamaAvailable] = useState(null)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const abortControllerRef = useRef(null)

  // Mark AI as available optimistically — errors will flip the flag
  useEffect(() => {
    setOllamaAvailable(true)
  }, [])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when conversation starts
  useEffect(() => {
    if (started && inputRef.current) {
      inputRef.current.focus()
    }
  }, [started])

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const sendStaticResponse = useCallback((userText) => {
    const userMessage = { role: 'user', content: userText.trim() }
    const staticAnswer = getStaticResponse(userText)
    const aiMessage = {
      role: 'assistant',
      content: staticAnswer ||
        'That question isn\'t in my static FAQ yet. For detailed answers, check the Transparency and Governance tabs, or try again shortly.',
      isStatic: true,
    }
    setMessages(prev => [...prev, userMessage, aiMessage])
    setInput('')
  }, [])

  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim() || isStreaming) return

    // If Ollama is known offline, use static responses immediately
    if (ollamaAvailable === false) {
      sendStaticResponse(userText)
      return
    }

    const userMessage = { role: 'user', content: userText.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)
    setIsOffline(false)

    const history = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
      userMessage,
    ]

    // Add empty assistant message to stream into
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    const tryModel = async (model) => {
      abortControllerRef.current = new AbortController()

      const response = await fetch(AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: history,
          stream: false,
          options: {
            temperature: 0.2,
            repeat_penalty: 1.1,
          },
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const content = data?.message?.content
      if (content) {
        setMessages(prev => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content }
          }
          return updated
        })
      }
    }

    try {
      await tryModel(PRIMARY_MODEL)
      setOllamaAvailable(true)
    } catch (err) {
      if (err.name === 'AbortError') {
        setIsStreaming(false)
        return
      }
      // Request failed — fall back to static responses
      setOllamaAvailable(false)
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1))
      const staticAnswer = getStaticResponse(userText)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: staticAnswer ||
            'The AI is temporarily unavailable. Check the Transparency and Governance tabs for detailed answers.',
          isStatic: true,
        }
      ])
      setIsOffline(true)
    } finally {
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }, [messages, isStreaming, ollamaAvailable, sendStaticResponse])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
    }
  }

  const handleStarterPrompt = (prompt) => {
    setStarted(true)
    sendMessage(prompt)
  }

  const offlineMode = ollamaAvailable === false

  return (
    <div style={styles.overlay}>
      {/* Close button */}
      <button
        onClick={onClose}
        style={styles.closeButton}
        aria-label="Close"
      >
        ×
      </button>

      {/* ESC hint */}
      <span style={styles.escHint}>ESC to close</span>

      <div style={styles.container}>
        {/* Pre-conversation: starter prompts */}
        {!started && messages.length === 0 && (
          <div style={styles.starterContainer}>
            <p style={styles.starterHeading}>
              {offlineMode
                ? 'Common questions — AI temporarily unavailable'
                : 'Talk to Citeback'}
            </p>
            {offlineMode && (
              <p style={styles.offlineBanner}>
                AI is temporarily unavailable. These questions use pre-written answers.
              </p>
            )}
            <div style={styles.starterPrompts}>
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  style={styles.starterButton}
                  onClick={() => handleStarterPrompt(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message thread */}
        {messages.length > 0 && (
          <div style={styles.messageThread}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={msg.role === 'user' ? styles.userMessage : styles.aiMessage}
              >
                {msg.content || (msg.role === 'assistant' && isStreaming && idx === messages.length - 1 ? (
                  <TypingIndicator />
                ) : null)}
                {/* Static badge */}
                {msg.isStatic && (
                  <span style={styles.staticBadge}>pre-written</span>
                )}
              </div>
            ))}

            {/* Offline notice — shown after first static response */}
            {isOffline && (
              <div style={styles.offlineMessage}>
                AI is temporarily unavailable — answering from pre-written FAQ. Try again shortly.
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Divider + input */}
        <div style={styles.inputArea}>
          <div style={styles.redLine} />
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                if (!started) setStarted(true)
              }}
              onFocus={() => !started && setStarted(true)}
              placeholder={isStreaming ? 'Waiting for response…' : offlineMode ? 'Ask anything — pre-written answers only…' : 'Ask anything…'}
              style={styles.input}
              disabled={isStreaming}
              autoComplete="off"
              spellCheck={false}
            />
          </form>
        </div>
      </div>
    </div>
  )
}

const THINKING_PHRASES = [
  'Searching surveillance records…',
  'Reviewing the data…',
  'Checking FOIA precedents…',
  'Analyzing…',
  'Reviewing legal context…',
  'Processing your question…',
  'Checking our records…',
  'Thinking…',
]

function TypingIndicator() {
  const [phraseIdx, setPhraseIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx(i => (i + 1) % THINKING_PHRASES.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <span style={styles.typingIndicator}>
      <span style={{ ...styles.dot, animationDelay: '0ms' }} />
      <span style={{ ...styles.dot, animationDelay: '160ms' }} />
      <span style={{ ...styles.dot, animationDelay: '320ms' }} />
      <span style={styles.thinkingPhrase}>{THINKING_PHRASES[phraseIdx]}</span>
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadePhrase {
          0% { opacity: 0; transform: translateY(4px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }
      `}</style>
    </span>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'var(--bg)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowY: 'auto',
  },
  closeButton: {
    position: 'fixed',
    top: '24px',
    right: '28px',
    background: 'none',
    border: 'none',
    fontSize: '28px',
    color: 'var(--muted)',
    cursor: 'pointer',
    lineHeight: 1,
    padding: '4px 8px',
    zIndex: 1001,
    fontWeight: 300,
    transition: 'color 0.15s',
  },
  escHint: {
    position: 'fixed',
    top: '30px',
    right: '68px',
    fontSize: '11px',
    color: 'var(--muted)',
    letterSpacing: '0.05em',
    fontFamily: 'inherit',
    zIndex: 1001,
  },
  container: {
    width: '100%',
    maxWidth: '680px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '80px 24px 0',
    boxSizing: 'border-box',
  },
  starterContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: '120px',
  },
  starterHeading: {
    fontSize: '13px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    marginBottom: '12px',
    fontWeight: 400,
  },
  offlineBanner: {
    fontSize: '13px',
    color: 'var(--red)',
    marginBottom: '24px',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  starterPrompts: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  starterButton: {
    background: 'none',
    border: 'none',
    textAlign: 'left',
    padding: '10px 0',
    fontSize: '16px',
    color: 'var(--fg)',
    cursor: 'pointer',
    fontWeight: 300,
    lineHeight: 1.5,
    borderBottom: '1px solid var(--border)',
    transition: 'color 0.15s',
    fontFamily: 'inherit',
  },
  messageThread: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    paddingBottom: '100px',
  },
  userMessage: {
    alignSelf: 'flex-end',
    textAlign: 'right',
    color: 'var(--muted)',
    fontSize: '15px',
    fontWeight: 400,
    lineHeight: 1.6,
    maxWidth: '85%',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    textAlign: 'left',
    color: 'var(--fg)',
    fontSize: '16px',
    fontWeight: 300,
    lineHeight: 1.75,
    maxWidth: '100%',
    minHeight: '24px',
  },
  staticBadge: {
    display: 'inline-block',
    marginLeft: '10px',
    fontSize: '10px',
    color: 'var(--muted)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    verticalAlign: 'middle',
    fontWeight: 400,
  },
  offlineMessage: {
    alignSelf: 'flex-start',
    color: 'var(--muted)',
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: 1.6,
    fontStyle: 'italic',
    borderTop: '1px solid var(--border)',
    paddingTop: '12px',
  },
  inputArea: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '680px',
    backgroundColor: 'var(--bg)',
    padding: '0 24px 32px',
    boxSizing: 'border-box',
  },
  redLine: {
    height: '2px',
    backgroundColor: 'var(--red)',
    marginBottom: '0',
  },
  form: {
    width: '100%',
  },
  input: {
    width: '100%',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    background: 'transparent',
    fontSize: '18px',
    fontWeight: 300,
    color: 'var(--fg)',
    padding: '16px 0',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    caretColor: 'var(--red)',
  },
  typingIndicator: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    paddingTop: '4px',
  },
  dot: {
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--red)',
    animation: 'dotPulse 1.2s infinite ease-in-out',
    flexShrink: 0,
  },
  thinkingPhrase: {
    fontSize: '13px',
    color: 'var(--muted)',
    fontStyle: 'italic',
    fontWeight: 300,
    animation: 'fadePhrase 2.2s ease-in-out infinite',
  },
}
