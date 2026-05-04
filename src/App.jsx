import { useState } from 'react'
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
import Manifesto from './components/Manifesto'
import GuaranteeSection from './components/GuaranteeSection'
import Transparency from './components/Transparency'
import Footer from './components/Footer'
import CampaignModal from './components/CampaignModal'
import ChatBot from './components/ChatBot'
import TrustFAQ from './components/TrustFAQ'
import Governance from './components/Governance'
import Operators from './components/Operators'
import ScrollProgress from './components/ScrollProgress'
import ConversationalInterface from './components/ConversationalInterface'
import LiveFeed from './components/LiveFeed'
// ARCameraOverlay removed — too complex to debug cross-platform

export default function App() {
  const [tab, setTab] = useState('home')
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [showAI, setShowAI] = useState(false)


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
          <HowItWorks />
          <Manifesto />
          <GuaranteeSection />
          <LiveFeed />
        </>
      )}
      {tab === 'campaigns' && <CampaignList full setSelectedCampaign={setSelectedCampaign} setTab={setTab} />}
      {tab === 'map' && <CameraMap />}
      {tab === 'registry' && <HumanRegistry />}
      {tab === 'transparency' && <Transparency />}
      {tab === 'trust' && <TrustFAQ />}
      {tab === 'governance' && <Governance />}
      {tab === 'operators' && <Operators />}

      {showAI && <ConversationalInterface onClose={() => setShowAI(false)} />}
      {/* Floating chatbot button */}
      {!showAI && (
        <button onClick={() => setShowAI(true)} style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          padding: '12px 20px',
          background: 'var(--fg)', color: 'var(--bg)',
          border: 'none', fontSize: 13, fontWeight: 500,
          letterSpacing: '0.04em', cursor: 'pointer',
          borderRadius: 999,
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        }}>💬 Ask Citeback AI</button>
      )}

      <Footer setTab={setTab} />
      <ThemePicker />
      <ChatBot />

      {selectedCampaign && (
        <CampaignModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
      )}
    </div>
  )
}
