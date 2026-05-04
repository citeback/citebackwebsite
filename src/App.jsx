import { useState, useEffect } from 'react'
import Nav from './components/Nav'
import ActivityTicker from './components/ActivityTicker'
import LaunchTracker from './components/LaunchTracker'
import ThemePicker from './components/ThemePicker'
import Hero from './components/Hero'
import StatsSection from './components/StatsSection'
import CampaignSelector from './components/CampaignSelector'
import CampaignList from './components/CampaignList'
import CameraMap from './components/CameraMap'
import HowItWorks from './components/HowItWorks'
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
import ConversationalInterface from './components/ConversationalInterface'
import LiveFeed from './components/LiveFeed'
import SurveillanceFeed from './components/SurveillanceFeed'
// ARCameraOverlay removed — too complex to debug cross-platform

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
      <ScrollProgress />
      <Nav tab={tab} setTab={setTab} />
      <ActivityTicker />

      {tab === 'home' && (
        <>
          <Hero setTab={setTab} />
          <LaunchTracker />
          <StatsSection />
          <CampaignSelector setSelectedCampaign={setSelectedCampaign} setTab={setTab} />
          <HowItWorks setTab={setTab} />
          <ALPRExplainer setTab={setTab} />
          <SurveillanceExplainer />
          <Manifesto />
          <GuaranteeSection setTab={setTab} />
          <LiveFeed setTab={setTab} />
        </>
      )}
      {tab === 'campaigns' && <CampaignList full setSelectedCampaign={setSelectedCampaign} setTab={setTab} />}
      {tab === 'map' && <CameraMap />}
      {tab === 'registry' && <HumanRegistry />}
      {tab === 'transparency' && <Transparency setTab={setTab} />}
      {tab === 'trust' && <TrustFAQ setTab={setTab} />}
      {tab === 'governance' && <Governance setTab={setTab} />}
      {tab === 'operators' && <Operators />}
      {tab === 'feed' && <SurveillanceFeed />}

      {showAI && <ConversationalInterface onClose={() => setShowAI(false)} />}
      {/* Floating chatbot button */}
      {!showAI && (
        <button
          onClick={() => setShowAI(true)}
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
