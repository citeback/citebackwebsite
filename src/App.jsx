import { useState } from 'react'
import { useTheme } from './ThemeContext'
import Nav from './components/Nav'
import Hero from './components/Hero'
import CampaignList from './components/CampaignList'
import CameraMap from './components/CameraMap'
import HowItWorks from './components/HowItWorks'
import HumanRegistry from './components/HumanRegistry'
import ALPRExplainer from './components/ALPRExplainer'
import Manifesto from './components/Manifesto'
import Transparency from './components/Transparency'
import ActivityTicker from './components/ActivityTicker'
import Footer from './components/Footer'
import CampaignModal from './components/CampaignModal'
import ThemePicker from './components/ThemePicker'
import ChatBot from './components/ChatBot'
import TrustFAQ from './components/TrustFAQ'

export default function App() {
  const [tab, setTab] = useState('home')
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const { theme } = useTheme()

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav tab={tab} setTab={setTab} />
      <ActivityTicker />

      {tab === 'home' && (
        <>
          <Hero setTab={setTab} />
          <HowItWorks />
          <CampaignList setSelectedCampaign={setSelectedCampaign} setTab={setTab} />
          <Manifesto />
          <ALPRExplainer />
        </>
      )}
      {tab === 'campaigns' && <CampaignList full setSelectedCampaign={setSelectedCampaign} setTab={setTab} />}
      {tab === 'map' && <CameraMap />}
      {tab === 'registry' && <HumanRegistry />}
      {tab === 'transparency' && <Transparency />}
      {tab === 'trust' && <TrustFAQ />}

      <Footer setTab={setTab} />
      <ThemePicker />
      <ChatBot />

      {selectedCampaign && (
        <CampaignModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
      )}
    </div>
  )
}
