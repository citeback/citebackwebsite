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

export default function App() {
  const [tab, setTab] = useState('home')
  const [selectedCampaign, setSelectedCampaign] = useState(null)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ScrollProgress />
      <Nav tab={tab} setTab={setTab} />

      {tab === 'home' && (
        <>
          <Hero setTab={setTab} />
          <StatsSection />
          <CampaignSelector setSelectedCampaign={setSelectedCampaign} setTab={setTab} />
          <HowItWorks />
          <Manifesto />
          <GuaranteeSection />
        </>
      )}
      {tab === 'campaigns' && <CampaignList full setSelectedCampaign={setSelectedCampaign} setTab={setTab} />}
      {tab === 'map' && <CameraMap />}
      {tab === 'registry' && <HumanRegistry />}
      {tab === 'transparency' && <Transparency />}
      {tab === 'trust' && <TrustFAQ />}
      {tab === 'governance' && <Governance />}
      {tab === 'operators' && <Operators />}

      <Footer setTab={setTab} />
      <ChatBot />

      {selectedCampaign && (
        <CampaignModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
      )}
    </div>
  )
}
