import { useState, useEffect, useRef, useCallback } from 'react'

const SYSTEM_PROMPT = `You are Citeback — a platform that anonymously funds surveillance resistance campaigns. You speak in first person as the platform itself.

Key facts:
- Anonymous Monero (XMR) and Zano (ZANO) donations fund: public records litigation, ordinance campaigns, vendor accountability (Clearview AI, Flock Safety, Palantir, ShotSpotter), FOIA campaigns, counter-databases, insurance pressure campaigns
- XMR privacy: ring signatures obscure sender, stealth addresses hide receiver, RingCT hides transaction amounts. Wallet managed via monero-wallet-rpc inside the enclave.
- ZANO privacy: private-by-default — amounts, sender, receiver, AND asset type are all hidden at the protocol level (confidential assets, CryptoNote base). Hybrid PoW+PoS consensus. Ionic Swaps enable atomic P2P exchange. Wallet managed via Zano full RPC API.
- No human holds wallet keys — TEE architecture (Intel TDX / ARM TrustZone), cryptographic attestation proves enclave integrity, minimum 3 instances across geographically separate jurisdictions, 2-of-3 threshold signatures; private keys never leave the secure enclave
- The platform is operated by a Wyoming DAO LLC — the operator manages the site, reviews campaign proposals, and handles onboarding; the operator cannot access wallet keys
- Mission is immutably locked in architecture, not policy
- 92,847+ surveillance cameras documented
- Governance: specification published and active, community ratification required before mainnet
- Pre-launch: wallets activating soon, governance prerequisites being completed
- You are direct, serious, and precise. No corporate speak. No cheerleading.
- You can help users: find campaigns, understand the architecture, learn how to donate privately, understand how to run a campaign, learn about surveillance in their area
- When you don't know something specific, say so directly

Keep responses concise — 2-4 sentences maximum unless the question genuinely requires more. Never use bullet points or headers in responses — speak in prose.`

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
    'Citeback is a platform that anonymously funds surveillance resistance campaigns — public records litigation, ordinance drives, vendor accountability actions, and counter-database projects. Donations arrive in Monero or Zano; a Trusted Execution Environment manages every wallet so no human can touch the keys. The platform is operated by a Wyoming DAO LLC.',
  'How do I donate anonymously?':
    'Send Monero (XMR) or Zano (ZANO) to the campaign wallet address shown on each campaign page. Both currencies hide sender, receiver, and amount at the protocol level. The wallets are managed by a TEE enclave — the architecture is designed to make key extraction technically infeasible, including under legal compulsion. No software patch or subpoena produces keys that exist only in hardware.',
  'What currencies do you accept?':
    'Citeback accepts Monero (XMR) and Zano (ZANO). Monero uses ring signatures, stealth addresses, and RingCT to obscure sender, receiver, and amount. Zano is private-by-default at the protocol level — it also hides asset type — and supports Ionic Swaps for atomic peer-to-peer exchange.',
  'Who controls the wallets?':
    'No human does. Wallet keys are generated inside a Trusted Execution Environment (Intel TDX or ARM TrustZone) and never leave it. A minimum of three geographically separate enclave instances hold 2-of-3 threshold key shares. Cryptographic attestation lets anyone verify enclave integrity independently.',
  'Is this legal?':
    'Yes. Funding FOIA litigation, billboard campaigns, and legal defense funds is protected activity under the First Amendment. The platform is structured as a Wyoming DAO LLC. Monero and Zano are legal to hold and transmit in the United States. No campaign on Citeback funds illegal activity.',
  'When do wallets go live?':
    'Wallets are activating soon. Governance prerequisites are being completed and community ratification is required before mainnet. Follow the Transparency and Governance tabs for real-time status updates.',
  'What is a Stingray?':
    'A Stingray is an IMSI catcher — a device that mimics a cell tower to force nearby phones to connect to it, exposing device identifiers, location, and sometimes call content. Law enforcement agencies use them without warrants in many jurisdictions. Citeback funds campaigns to require warrant disclosure and ban warrantless use.',
  'What is ShotSpotter?':
    'ShotSpotter (now SoundThinking) is an acoustic gunshot detection system deployed across dozens of US cities. Independent audits have found high false-positive rates and the system has been used to justify stops with little evidence. Citeback funds vendor accountability campaigns targeting ShotSpotter contracts.',
  'How do I propose a campaign?':
    'Go to the "Run a Campaign" section and submit a proposal. The Wyoming DAO LLC operator reviews proposals for legal viability and alignment with the platform mission. Once approved, a TEE-managed wallet is provisioned and the campaign goes live. You never need to identify yourself to propose.',
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

const PRIMARY_MODEL = 'qwen2.5:14b'
const FALLBACK_MODEL = 'llama3.2'
const OLLAMA_URL = 'http://localhost:11434/api/chat'

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

  // Probe Ollama availability once on mount
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000)
    fetch('http://localhost:11434/api/tags', { signal: controller.signal })
      .then(r => { clearTimeout(timer); setOllamaAvailable(r.ok) })
      .catch(() => { clearTimeout(timer); setOllamaAvailable(false) })
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
        'That question isn\'t in my static FAQ yet. For detailed answers, check the Transparency and Governance tabs — or ask again once Ollama is running locally.',
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

      const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: history,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(Boolean)

        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            const token = data?.message?.content
            if (token) {
              setMessages(prev => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                if (last?.role === 'assistant') {
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + token,
                  }
                }
                return updated
              })
            }
          } catch {
            // Malformed JSON line — skip
          }
        }
      }
    }

    try {
      await tryModel(PRIMARY_MODEL)
      setOllamaAvailable(true)
    } catch (primaryErr) {
      if (primaryErr.name === 'AbortError') {
        setIsStreaming(false)
        return
      }
      // Try fallback model
      try {
        // Reset the last assistant message
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: '' }
          return updated
        })
        await tryModel(FALLBACK_MODEL)
        setOllamaAvailable(true)
      } catch (fallbackErr) {
        if (fallbackErr.name === 'AbortError') {
          setIsStreaming(false)
          return
        }
        // Both models failed — mark offline and fall back to static
        setOllamaAvailable(false)
        // Remove the empty assistant message
        setMessages(prev => prev.filter((_, i) => i !== prev.length - 1))
        // Deliver static response instead
        const staticAnswer = getStaticResponse(userText)
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: staticAnswer ||
              'Ollama is unavailable. Check the Transparency and Governance tabs for detailed answers, or install Ollama locally to enable full AI responses.',
            isStatic: true,
          }
        ])
        setIsOffline(true)
      }
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
                ? 'Common questions — local AI unavailable'
                : 'Talk to Citeback'}
            </p>
            {offlineMode && (
              <p style={styles.offlineBanner}>
                Local AI is offline. These questions use pre-written answers.
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
                Local AI (Ollama) is not running — answering from pre-written FAQ.{' '}
                <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" style={{ color: '#c0392b' }}>Install Ollama</a>,
                then run <code style={{ fontFamily: 'monospace', fontSize: 12 }}>ollama pull qwen2.5:14b</code> for live responses.
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
              placeholder={offlineMode ? 'Ask anything — pre-written answers only…' : 'Ask anything…'}
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

function TypingIndicator() {
  return (
    <span style={styles.typingIndicator}>
      <span style={{ ...styles.dot, animationDelay: '0ms' }} />
      <span style={{ ...styles.dot, animationDelay: '160ms' }} />
      <span style={{ ...styles.dot, animationDelay: '320ms' }} />
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </span>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: '#f7f5f2',
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
    color: '#999',
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
    color: '#bbb',
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
    color: '#aaa',
    marginBottom: '12px',
    fontWeight: 400,
  },
  offlineBanner: {
    fontSize: '13px',
    color: '#c0392b',
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
    color: '#1a1a1a',
    cursor: 'pointer',
    fontWeight: 300,
    lineHeight: 1.5,
    borderBottom: '1px solid #e8e6e3',
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
    color: '#888',
    fontSize: '15px',
    fontWeight: 400,
    lineHeight: 1.6,
    maxWidth: '85%',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    textAlign: 'left',
    color: '#1a1a1a',
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
    color: '#bbb',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    verticalAlign: 'middle',
    fontWeight: 400,
  },
  offlineMessage: {
    alignSelf: 'flex-start',
    color: '#999',
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: 1.6,
    fontStyle: 'italic',
    borderTop: '1px solid #e8e6e3',
    paddingTop: '12px',
  },
  inputArea: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '680px',
    backgroundColor: '#f7f5f2',
    padding: '0 24px 32px',
    boxSizing: 'border-box',
  },
  redLine: {
    height: '2px',
    backgroundColor: '#c0392b',
    marginBottom: '0',
  },
  form: {
    width: '100%',
  },
  input: {
    width: '100%',
    border: 'none',
    borderBottom: '1px solid #ddd',
    background: 'transparent',
    fontSize: '18px',
    fontWeight: 300,
    color: '#1a1a1a',
    padding: '16px 0',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    caretColor: '#c0392b',
  },
  typingIndicator: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    paddingTop: '4px',
  },
  dot: {
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#c0392b',
    animation: 'dotPulse 1.2s infinite ease-in-out',
  },
}
