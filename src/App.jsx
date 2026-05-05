import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
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
import FrontlineFunds from './components/FrontlineFunds'
import ScrollProgress from './components/ScrollProgress'
import LiveFeed from './components/LiveFeed'

// Lazy-loaded heavy components
const CameraMap = lazy(() => import('./components/CameraMap'))
const SurveillanceFeed = lazy(() => import('./components/SurveillanceFeed'))
const ConversationalInterface = lazy(() => import('./components/ConversationalInterface'))

const LazyFallback = ({ label = 'Loading…' }) => (
  <div style={{ padding: '60px 24px', textAlign: 'center', opacity: 0.5, fontSize: 14 }}>{label}</div>
)

const tabToPath = (tab) => tab === 'home' ? '/' : `/${tab}`
const pathToTab = (path) => {
  const base = path.split('/')[1]
  return base === '' ? 'home' : base
}

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [showAI, setShowAI] = useState(false)
  const [proposePrefill, setProposePrefill] = useState(null)

  const tab = pathToTab(location.pathname)
  const setTab = (t) => navigate(tabToPath(t))

  useEffect(() => {
    const handler = (e) => setTab(e.detail)
    window.addEventListener('navigate', handler)
    return () => window.removeEventListener('navigate', handler)
  }, [])

  useEffect(() => {
    const handler = (e) => setProposePrefill(e.detail || {})
    window.addEventListener('openPropose', handler)
    return () => window.removeEventListener('openPropose', handler)
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <ScrollProgress />
      <Nav tab={tab} setTab={setTab} />
      <main id="main-content" tabIndex={-1} style={{ outline: 'none', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ActivityTicker />

        <Routes>
          <Route path="/" element={
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
          } />
          <Route path="/campaigns" element={<CampaignList full setSelectedCampaign={setSelectedCampaign} setTab={setTab} />} />
          <Route path="/map" element={<Suspense fallback={<LazyFallback label="Loading map…" />}><CameraMap /></Suspense>} />
          <Route path="/registry" element={<HumanRegistry />} />
          <Route path="/transparency" element={<Transparency setTab={setTab} />} />
          <Route path="/trust" element={<TrustFAQ setTab={setTab} />} />
          <Route path="/governance" element={<Governance setTab={setTab} />} />
          <Route path="/operators" element={<Operators />} />
          <Route path="/frontline" element={<FrontlineFunds />} />
          <Route path="/feed" element={<Suspense fallback={<LazyFallback label="Loading feed…" />}><SurveillanceFeed setTab={setTab} /></Suspense>} />
          <Route path="*" element={
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
          } />
        </Routes>

        {showAI && <Suspense fallback={<LazyFallback label="Loading AI…" />}><ConversationalInterface onClose={() => setShowAI(false)} /></Suspense>}
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
