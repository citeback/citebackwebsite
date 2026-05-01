import { useState } from 'react'
import Nav from './components/Nav'
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
import CameraGlobe from './components/CameraGlobe'
import ConversationalInterface from './components/ConversationalInterface'
import LiveFeed from './components/LiveFeed'
import ARCameraOverlay from './components/ARCameraOverlay'

export default function App() {
  const [tab, setTab] = useState('home')
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [showAI, setShowAI] = useState(false)
  const [showAR, setShowAR] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ScrollProgress />
      <Nav tab={tab} setTab={setTab} />

      {tab === 'home' && (
        <>
          <CameraGlobe compact />
          <Hero setTab={setTab} />
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
      {tab === 'globe' && <CameraGlobe />}
      {tab === 'ar' && <ARCameraOverlay onClose={() => setTab('home')} />}
      {tab === 'registry' && <HumanRegistry />}
      {tab === 'transparency' && <Transparency />}
      {tab === 'trust' && <TrustFAQ />}
      {tab === 'governance' && <Governance />}
      {tab === 'operators' && <Operators />}

      {showAI && <ConversationalInterface onClose={() => setShowAI(false)} />}
      {showAR && <ARCameraOverlay onClose={() => setShowAR(false)} />}

      {/* Floating action buttons */}
      {!showAI && !showAR && (
        <div style={{ position: 'fixed', bottom: 28, left: 28, zIndex: 800, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => setShowAI(true)} style={{
            padding: '12px 20px',
            background: 'var(--fg)', color: 'var(--bg)',
            border: 'none', fontSize: 13, fontWeight: 500,
            letterSpacing: '0.04em', cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          }}>Talk to Fourthright</button>
          <button onClick={() => setShowAR(true)} style={{
            padding: '12px 20px',
            background: 'var(--red)', color: '#fff',
            border: 'none', fontSize: 13, fontWeight: 500,
            letterSpacing: '0.04em', cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(220,38,38,0.3)',
          }}>📍 AR Camera View</button>
        </div>
      )}

      <Footer setTab={setTab} />
      <ChatBot />

      {selectedCampaign && (
        <CampaignModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
      )}
    </div>
  )
}
