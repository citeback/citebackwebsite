export default function PrivacyPolicy() {
  return (
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
          body: `Citeback is a surveillance resistance platform. We are committed to collecting as little data as possible about our visitors and donors. This policy documents what data flows occur when you use this site and why.

Donation privacy is handled at the cryptocurrency protocol level (Monero XMR, Zano ZANO) — not by us. We cannot see who donated, how much, or from where. This policy covers site browsing and form submissions only.`,
        },
        {
          title: '2. Data We Do Not Collect',
          body: `We do not:
• Require account creation to browse or donate
• Collect names, email addresses, or identifiers from visitors
• Use cookies, tracking pixels, or analytics scripts
• Use Google Analytics, Facebook Pixel, or any behavioral tracking
• Sell or share visitor data with third parties for marketing

There is no account system. There is no login. There is no newsletter (unless you opt in via the waitlist form).`,
        },
        {
          title: '3. Infrastructure Data (Third-Party Processors)',
          body: `By using this site, your IP address and standard HTTP request data are processed by the following infrastructure providers. We do not control their data retention — see their respective privacy policies:

• Netlify (hosting): Netlify logs server access including IP addresses. See netlify.com/privacy.
• Bunny CDN (fonts.bunny.net): Loads the Inter typeface. Bunny CDN logs CDN access requests including IP addresses. See bunny.net/privacy.
• CARTO (map tiles): The surveillance camera map loads tiles from *.basemaps.cartocdn.com. CARTO receives tile request data including IP addresses. See carto.com/privacy.
• CourtListener, USASpending.gov, api.congress.gov, Senate LDA: Some features make client-side API requests to these public services, which may log your IP address.

For maximum privacy while browsing: use Tor Browser, a trusted VPN, or a privacy proxy. Your donation privacy is at the cryptocurrency protocol layer and is not affected by browsing method.`,
        },
        {
          title: '4. Form Submissions',
          body: `This site includes three optional forms processed by Netlify Forms:

• Camera submission (report an ALPR camera location): collects lat/lng coordinates, location description, and optional notes. No identity required.
• Campaign proposal: collects campaign type, title, location, description, funding goal, and an optional contact field. Submissions are stored by Netlify.
• Registry application: collects role, location, background description, and an optional contact field. Submissions are stored by Netlify.
• Launch waitlist: collects email address only. Stored by Netlify.

If you include contact information in a form submission, that information is stored by Netlify and may be subject to legal process served to Netlify. For sensitive submissions, use a ProtonMail or other privacy-respecting email address, or omit contact information entirely.`,
        },
        {
          title: '5. Campaign Operator Data',
          body: `Campaign operators (individuals who run funded campaigns) are required to verify their real identity with the Citeback legal entity before onboarding. This identity information is held by the operator-facing entity and is not published publicly. Operators are subject to OFAC SDN list screening at onboarding and at every disbursement.

Operator identity information may be subject to legal process. The privacy protections described in this policy do not apply to operator identity data collected for legal compliance purposes.`,
        },
        {
          title: '6. Donation Privacy',
          body: `Donations are made in Monero (XMR) or Zano (ZANO). Both are privacy cryptocurrencies that enforce transaction privacy at the protocol level:

• Monero: Ring signatures, stealth addresses, and RingCT hide sender identity, recipient address, and transaction amount on-chain.
• Zano: Confidential assets hide sender, recipient, amount, and asset type at the protocol level.

Citeback cannot identify donors. We cannot comply with legal demands to identify donors because the information does not exist. This is a structural property of the cryptocurrencies used — not a policy promise.

OFAC note: Donations from OFAC-sanctioned individuals are prohibited by our Terms of Use. The platform has no technical ability to screen anonymous donors on-chain. See the OFAC gap disclosure in our How It Works section for full detail.`,
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
  )
}
