import { useState, useEffect, lazy, Suspense } from 'react'
import { CameraCountProvider } from './context/CameraCount'
import ThemePicker from './components/ThemePicker'
import { AuthProvider } from './context/AuthContext'
import { API_BASE as AI_URL } from './config.js'
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom'
import Nav from './components/Nav'
// ActivityTicker removed per Scott 2026-05-07
import LaunchTracker from './components/LaunchTracker'
import Hero from './components/Hero'
import StatsSection from './components/StatsSection'
import CampaignSelector from './components/CampaignSelector'
import CampaignList from './components/CampaignList'
import HowItWorks from './components/HowItWorks'
import BuildWithUs from './components/BuildWithUs'
import CryptoPrimer from './components/CryptoPrimer'
// HumanRegistry — lazy loaded below
import ALPRExplainer from './components/ALPRExplainer'
import SurveillanceExplainer from './components/SurveillanceExplainer'
import Manifesto from './components/Manifesto'
import GuaranteeSection from './components/GuaranteeSection'
// Transparency — lazy loaded below
import Footer from './components/Footer'
import ScrollProgress from './components/ScrollProgress'
import LiveFeed from './components/LiveFeed'
// Route-level components — lazy loaded to keep main bundle lean
const CampaignModal = lazy(() => import('./components/CampaignModal'))
const ProposeModal = lazy(() => import('./components/ProposeModal'))
const TrustFAQ = lazy(() => import('./components/TrustFAQ'))
const Governance = lazy(() => import('./components/Governance'))
const Operators = lazy(() => import('./components/Operators'))
const FrontlineFunds = lazy(() => import('./components/FrontlineFunds'))
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'))
const TermsPage = lazy(() => import('./components/TermsPage'))
const SightingForm = lazy(() => import('./components/SightingForm'))
const ReputationPage = lazy(() => import('./components/ReputationPage'))
const AdminPanel = lazy(() => import('./components/AdminPanel'))
const ResetPasswordPage = lazy(() => import('./components/ResetPasswordPage'))
const ClaimAccountPage = lazy(() => import('./components/ClaimAccountPage'))
const HumanRegistry = lazy(() => import('./components/HumanRegistry'))
const Transparency = lazy(() => import('./components/Transparency'))

// Lazy-loaded heavy components
const CameraMap = lazy(() => import('./components/CameraMap'))
const SurveillanceFeed = lazy(() => import('./components/SurveillanceFeed'))
const ConversationalInterface = lazy(() => import('./components/ConversationalInterface'))

const LazyFallback = ({ label = 'Loading…' }) => (
  <div role="status" aria-live="polite" className="lazy-fallback">{label}</div>
)

function NotFound({ setTab }) {
  return (
    <div className="not-found">
      <div className="not-found-code">404</div>
      <h1 className="not-found-heading">Page not found</h1>
      <p className="not-found-body">The page you're looking for doesn't exist or has moved.</p>
      <button className="not-found-btn" onClick={() => setTab('home')}>Go home</button>
    </div>
  )
}

const TAB_TO_PATH = {
  home: '/',
  campaigns: '/campaigns',
  map: '/map',
  registry: '/expert-directory',
  transparency: '/transparency',
  trust: '/how-it-works',
  governance: '/governance',
  operators: '/run-a-campaign',
  frontline: '/frontline-funds',
  feed: '/intelligence-feed',
  privacy: '/privacy',
  terms: '/terms',
  report: '/report',
  reputation: '/reputation',
}

function CampaignDeepLink({ setSelectedCampaign, setTab }) {
  const { id } = useParams()
  useEffect(() => {
    // Use single-campaign endpoint — avoids fetching all campaigns just to find one
    fetch(`${AI_URL}/api/campaigns/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(campaign => { if (campaign) setSelectedCampaign(campaign) })
      .catch(() => {})
  }, [id])
  return <CampaignList full setSelectedCampaign={setSelectedCampaign} setTab={setTab} />
}

const PATH_TO_TAB = Object.fromEntries(Object.entries(TAB_TO_PATH).map(([k, v]) => [v, k]))
PATH_TO_TAB['/'] = 'home'

const ROUTE_TITLES = {
  '/': 'Citeback — Fund the Fight Against Surveillance',
  '/campaigns': 'Campaigns | Citeback',
  '/map': 'Camera Map | Citeback',
  '/expert-directory': 'Expert Directory | Citeback',
  '/transparency': 'Transparency | Citeback',
  '/how-it-works': 'How It Works | Citeback',
  '/governance': 'Governance | Citeback',
  '/run-a-campaign': 'Run a Campaign | Citeback',
  '/frontline-funds': 'Frontline Funds | Citeback',
  '/intelligence-feed': 'Intelligence Feed | Citeback',
  '/privacy': 'Privacy Policy | Citeback',
  '/terms': 'Terms | Citeback',
  '/report': 'Report a Camera | Citeback',
  '/reputation': 'Reputation | Citeback',
  '/cx-admin': 'Admin | Citeback',
  '/reset-password': 'Reset Password | Citeback',
  '/claim-account': 'Claim Account | Citeback',
}

const tabToPath = (tab) => TAB_TO_PATH[tab] ?? `/${tab}`
const pathToTab = (path) => {
  if (PATH_TO_TAB[path]) return PATH_TO_TAB[path]
  if (path.startsWith('/campaigns/')) return 'campaigns'
  return 'home'
}

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [showAI, setShowAI] = useState(false)
  const [proposePrefill, setProposePrefill] = useState(null)

  const tab = pathToTab(location.pathname)
  const setTab = (t, query = '') => navigate(tabToPath(t) + query)

  useEffect(() => {
    const path = location.pathname
    let title = ROUTE_TITLES[path]
    if (!title && path.startsWith('/campaigns/')) title = 'Campaign | Citeback'
    document.title = title || 'Citeback — Fund the Fight Against Surveillance'
  }, [location.pathname])

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
    <AuthProvider>
    <CameraCountProvider>
    <div className="app-root">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <ScrollProgress />
      <Nav tab={tab} setTab={setTab} />
      <main id="main-content" tabIndex={-1} className="app-main">
        {/* ActivityTicker removed */}

        <Routes>
          <Route path="/" element={
            <>
              <Hero setTab={setTab} />
              <StatsSection />
              <CampaignSelector setSelectedCampaign={setSelectedCampaign} setTab={setTab} />
              <HowItWorks setTab={setTab} />
              <CryptoPrimer />
              <GuaranteeSection setTab={setTab} />
              <div className="launch-tracker-section">
                <LaunchTracker />
              </div>
              <SurveillanceExplainer setTab={setTab} />
              <ALPRExplainer setTab={setTab} />
              <Manifesto setTab={setTab} />
              <BuildWithUs setTab={setTab} />
              <LiveFeed setTab={setTab} />
            </>
          } />
          <Route path="/campaigns/:id" element={<CampaignDeepLink setSelectedCampaign={setSelectedCampaign} setTab={setTab} />} />
          <Route path="/campaigns" element={<CampaignList full setSelectedCampaign={setSelectedCampaign} setTab={setTab} />} />
          <Route path="/map" element={<Suspense fallback={<LazyFallback label="Loading map…" />}><CameraMap /></Suspense>} />
          <Route path="/expert-directory" element={<Suspense fallback={<LazyFallback label="Loading…" />}><HumanRegistry /></Suspense>} />
          <Route path="/transparency" element={<Suspense fallback={<LazyFallback label="Loading…" />}><Transparency setTab={setTab} /></Suspense>} />
          <Route path="/how-it-works" element={<Suspense fallback={<LazyFallback label="Loading…" />}><TrustFAQ setTab={setTab} /></Suspense>} />
          <Route path="/governance" element={<Suspense fallback={<LazyFallback label="Loading…" />}><Governance setTab={setTab} /></Suspense>} />
          <Route path="/run-a-campaign" element={<Suspense fallback={<LazyFallback label="Loading…" />}><Operators /></Suspense>} />
          <Route path="/frontline-funds" element={<Suspense fallback={<LazyFallback label="Loading…" />}><FrontlineFunds /></Suspense>} />
          <Route path="/privacy" element={<Suspense fallback={<LazyFallback label="Loading…" />}><PrivacyPolicy /></Suspense>} />
          <Route path="/terms" element={<Suspense fallback={<LazyFallback label="Loading…" />}><TermsPage /></Suspense>} />
          <Route path="/intelligence-feed" element={<Suspense fallback={<LazyFallback label="Loading feed…" />}><SurveillanceFeed setTab={setTab} /></Suspense>} />
          <Route path="/report" element={<Suspense fallback={<LazyFallback label="Loading…" />}><SightingForm setTab={setTab} /></Suspense>} />
          <Route path="/reputation" element={<Suspense fallback={<LazyFallback label="Loading…" />}><ReputationPage setTab={setTab} /></Suspense>} />
          <Route path="/cx-admin" element={<Suspense fallback={<LazyFallback label="Loading…" />}><AdminPanel /></Suspense>} />
          <Route path="/reset-password" element={<Suspense fallback={<LazyFallback label="Loading…" />}><ResetPasswordPage setTab={setTab} /></Suspense>} />
          <Route path="/claim-account" element={<Suspense fallback={<LazyFallback label="Loading…" />}><ClaimAccountPage setTab={setTab} /></Suspense>} />
          <Route path="*" element={<NotFound setTab={setTab} />} />
        </Routes>

        {showAI && <Suspense fallback={<LazyFallback label="Loading AI…" />}><ConversationalInterface onClose={() => setShowAI(false)} /></Suspense>}
        <ThemePicker />
        {!showAI && (
          <button
            onClick={() => setShowAI(true)}
            aria-label="Ask questions about surveillance, campaigns, and the platform"
            title="Ask questions about surveillance, campaigns, and the platform"
            className="ai-chat-btn"
          >
            💬 Ask Citeback AI
          </button>
        )}
      </main>

      <Footer setTab={setTab} />


      {selectedCampaign && (
        <Suspense fallback={null}><CampaignModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} /></Suspense>
      )}
      {proposePrefill && (
        <Suspense fallback={null}><ProposeModal prefill={proposePrefill} onClose={() => setProposePrefill(null)} /></Suspense>
      )}
    </div>
    </CameraCountProvider>
    </AuthProvider>
  )
}
