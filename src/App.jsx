import { useState, useEffect, lazy, Suspense } from 'react'
import Nav from './components/Nav'
import ActivityTicker from './components/ActivityTicker'
import LaunchTracker from './components/LaunchTracker'
import ThemePicker from './components/ThemePicker'
import Hero from './components/Hero'
import StatsSection from './components/StatsSection'
import CampaignSelector from './components/CampaignSelector'
import CampaignList from './components/CampaignList'
import HowItWorks from './components/HowItWorks'
import BuildWithUs from './components/BuildWithUs'
import HumanRegistry from './components/HumanRegistry'
import ALPRExplainer from './components/ALPRExplainer'
import SurveillanceExplainer from './components/SurveillanceExplainer'
import Manifesto from './components/Manifesto'
import GuaranteeSection from './components/GuaranteeSection'
import Transparency from './components/Transparency'
import Footer from './components/Footer'
import CampaignModal from './components/CampaignModal'
import ProposeModal from './components/ProposeModal'
import TrustFAQ from './components/TrustFAQ'
import Governance from './components/Governance'
import Operators from './components/Operators'
import ScrollProgress from './components/ScrollProgress'
import LiveFeed from './components/LiveFeed'
// ARCameraOverlay removed — too complex to debug cross-platform

// Lazy-loaded heavy components
const CameraMap = lazy(() => import('./components/CameraMap'))
const SurveillanceFeed = lazy(() => import('./components/SurveillanceFeed'))
const ConversationalInterface = lazy(() => import('./components/ConversationalInterface'))

const LazyFallback = ({ label = 'Loading…' }) => (
  <div style={{ padding: '60px 24px', textAlign: 'center', opacity: 0.5, fontSize: 14 }}>{label}</div>
)

export default function App() {
  const [tab, setTab] = useState('home')
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [showAI, setShowAI] = useState(false)
  const [proposePrefill, setProposePrefill] = useState(null)

  useEffect(() => {
    const handler = (e) => setProposePrefill(e.detail || {})
    window.addEventListener('openPropose', handler)
    return () => window.removeEventListener('openPropose', handler)
  }, [])


  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Skip-to-content link (WCAG 2.4.1) */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <ScrollProgress />
      <Nav tab={tab} setTab={setTab} />
      <main id="main-content" tabIndex={-1} style={{ outline: 'none', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <ActivityTicker />

      {tab === 'home' && (
        <>
          <Hero setTab={setTab} />
          <StatsSection />
          <CampaignSelector setSelectedCampaign={setSelectedCampaign} setTab={setTab} />
          <HowItWorks setTab={setTab} />
          <GuaranteeSection setTab={setTab} />
          <div style={{ padding: '60px 24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <LaunchTracker />
          </div>
          <SurveillanceExplainer setTab={setTab} />
          <ALPRExplainer setTab={setTab} />
          <Manifesto setTab={setTab} />
          <BuildWithUs setTab={setTab} />
          <LiveFeed setTab={setTab} />
        </>
      )}
      {tab === 'campaigns' && <CampaignList full setSelectedCampaign={setSelectedCampaign} setTab={setTab} />}
      {tab === 'map' && <Suspense fallback={<LazyFallback label="Loading map…" />}><CameraMap /></Suspense>}
      {tab === 'registry' && <HumanRegistry />}
      {tab === 'transparency' && <Transparency setTab={setTab} />}
      {tab === 'trust' && <TrustFAQ setTab={setTab} />}
      {tab === 'governance' && <Governance setTab={setTab} />}
      {tab === 'operators' && <Operators />}
      {tab === 'feed' && <Suspense fallback={<LazyFallback label="Loading feed…" />}><SurveillanceFeed setTab={setTab} /></Suspense>}

      {showAI && <Suspense fallback={<LazyFallback label="Loading AI…" />}><ConversationalInterface onClose={() => setShowAI(false)} /></Suspense>}
      {/* Floating chatbot button */}
      {!showAI && (
        <button
          onClick={() => setShowAI(true)}
          aria-label="Ask Citeback AI — requires Ollama running locally"
          title="Ask questions about Citeback — requires Ollama running locally"
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 999,
            padding: '12px 20px',
            background: 'var(--fg)', color: 'var(--bg)',
            border: 'none', fontSize: 13, fontWeight: 500,
            letterSpacing: '0.04em', cursor: 'pointer',
            borderRadius: 999,
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          }}
        >
          💬 Ask Citeback AI
        </button>
      )}

      </main>
      <Footer setTab={setTab} />
      <ThemePicker />

      {selectedCampaign && (
        <CampaignModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
      )}
      {proposePrefill && (
        <ProposeModal prefill={proposePrefill} onClose={() => setProposePrefill(null)} />
      )}
    </div>
  )
}
