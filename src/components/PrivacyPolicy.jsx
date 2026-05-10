import { Helmet } from 'react-helmet-async'

export default function PrivacyPolicy() {
  return (
    <>
    <Helmet>
      <title>Privacy Policy | Citeback — Zero Tracking, No Identity Required</title>
      <meta name="description" content="Citeback's privacy policy: no tracking, no analytics, no identity collection. Contributions are private by default via Monero and Zano cryptocurrency protocols." />
      <meta property="og:title" content="Privacy Policy | Citeback — Zero Tracking, No Identity Required" />
      <meta property="og:description" content="Citeback's privacy policy: no tracking, no analytics, no identity collection. Contributions are private by default via Monero and Zano cryptocurrency protocols." />
    </Helmet>
    <section style={{ padding: '64px 24px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: 'var(--red)', marginBottom: 12,
      }}>Legal</div>
      <h1 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
        Privacy Policy
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 48 }}>
        Last updated: May 2026 · Citeback (Wyoming DAO LLC, in formation)
      </p>

      {[
        {
          title: '1. Overview',
          body: `Citeback is a surveillance resistance platform. We are committed to collecting as little data as possible about our visitors and contributors. This policy documents what data flows occur when you use this site and why.

Contribution privacy is handled at the cryptocurrency protocol level (Monero XMR, Zano ZANO) — not by us. We cannot see who contributed, how much, or from where. This policy covers site browsing, form submissions, and account usage.`,
        },
        {
          title: '2. Data We Do Not Collect',
          body: `We do not:
• Require account creation to browse or contribute (accounts are optional — operators need them, contributors do not)
• Collect names, email addresses, or identifiers from visitors who do not create accounts
• Use cookies, tracking pixels, or analytics scripts
• Use Google Analytics, Facebook Pixel, or any behavioral tracking
• Sell or share visitor data with third parties for marketing

There is no newsletter. Anonymous browsing and financial contributions to campaigns require no account of any kind. Campaign operators require an account.`,
        },
        {
          title: '3. Infrastructure Data (Third-Party Processors)',
          body: `By using this site, your IP address and standard HTTP request data are processed by the following infrastructure providers. We do not control their data retention — see their respective privacy policies:

• Netlify (hosting): Netlify logs server access including IP addresses. See netlify.com/privacy.
• Fonts: All typefaces (Inter, Space Grotesk, JetBrains Mono) are self-hosted on Citeback's servers. No external font CDN is used.
• CARTO (map tiles): The surveillance camera map loads tiles from *.basemaps.cartocdn.com. CARTO receives tile request data including IP addresses. See carto.com/privacy.
• OpenStreetMap Overpass API, CourtListener, api.congress.gov, OpenStates, Senate LDA: All requests to these external data sources are proxied through Citeback's own servers. Your IP address is not exposed to any of these third-party services.

For maximum privacy while browsing: use Tor Browser, a trusted VPN, or a privacy proxy. Your contribution privacy is at the cryptocurrency protocol layer and is not affected by browsing method.`,
        },
        {
          title: '4. Form Submissions — What We Store and What We Don\u2019t',
          body: `This site includes optional forms. We distinguish two categories:

\u25b8 Surveillance infrastructure reports (camera sightings, campaign proposals)
These contain information about surveillance systems — not about you. A sighting report includes camera type, street address, and optional notes. A campaign proposal includes type, title, location, and description. No name, no email, no contact information is collected or required. These submissions are sent directly to our own server where IP address logging is disabled at the infrastructure level. Submissions enter a moderation queue before any public display.

\u25b8 Expert Directory applications
Role type, geographic location, and professional background. No name, email, or contact information is collected or required. Stored on our own server with IP logging disabled.

\u25b8 Accounts (operators and community members)
Citeback has an optional account system. If you create an account, we store: username, bcrypt-hashed password (never plaintext), optional recovery email (AES-256-GCM encrypted at rest, used only for password reset, never for marketing), reputation points, and a JWT session token. Operators are additionally required to provide identity verification, held privately and used only for OFAC screening and platform accountability.

What we do not collect in any form: your name, your email address, cookies, device fingerprint, or IP address from any form submission on this site.`,
        },
        {
          title: '5. Campaign Operator Data',
          body: `Campaign operators (individuals who run funded campaigns) are required to verify their real identity with the Citeback legal entity before onboarding. This identity information is held by the operator-facing entity and is not published publicly. Operators are subject to OFAC SDN list screening at onboarding and at every disbursement.

Operator identity information may be subject to legal process. The privacy protections described in this policy do not apply to operator identity data collected for legal compliance purposes.`,
        },
        {
          title: '6. Privacy When Contributing',
          body: `Contributions are sent in Monero (XMR) or Zano (ZANO). Both are privacy cryptocurrencies that enforce transaction privacy at the protocol level:

• Monero: Ring signatures, stealth addresses, and RingCT hide sender identity, recipient address, and transaction amount on-chain.
• Zano: Confidential assets hide sender, recipient, amount, and asset type at the protocol level.

Citeback cannot identify contributors. We cannot comply with legal demands to identify contributors because the information does not exist. This is a structural property of the cryptocurrencies used — not a policy promise.

OFAC note: Contributions from OFAC-sanctioned individuals are prohibited by our Terms of Use. The platform has no technical ability to screen anonymous contributors on-chain. See the OFAC gap disclosure in our How It Works section for full detail.`,
        },
        {
          title: '7. Changes to This Policy',
          body: `We will update this policy as the platform evolves. Material changes will be announced via the GitHub repository and noted in the governance changelog. The current version is always available at citeback.com/privacy.`,
        },
        {
          title: '8. Contact',
          body: `Privacy questions: citeback@proton.me

For security vulnerability disclosures: see /.well-known/security.txt`,
        },
      ].map(({ title, body }) => (
        <div key={title} style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{title}</h2>
          <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{body}</div>
        </div>
      ))}
    </section>
    </>
  )
}
