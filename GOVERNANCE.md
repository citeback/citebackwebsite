# GOVERNANCE.md — CiteBack Platform Rules

**Version:** 1.0  
**Status:** Active  
**Last Updated:** 2026-07-02

---

## Who Runs This

CiteBack is operated by Scott Hughes. The platform operator reviews campaign proposals, verifies professional credentials, confirms milestone completions, and enforces these rules.

This is honest: one person runs this right now. As the platform grows, that changes — see Phase 2 below.

---

## What the Operator Can and Cannot Do

**Can:**
- Review and approve or reject campaign proposals
- Verify professional credentials
- Confirm or dispute milestone deliverables
- Ban campaign organizers who violate the rules
- Update these rules (with 7-day public notice — see below)

**Cannot:**
- Access campaign wallet private keys (organizers hold their own keys — architecture-enforced)
- Move, freeze, or touch campaign funds (contributions go directly to organizer wallets — Citeback never holds funds)
- Override a denial based on an OFAC SDN match

The direct wallet model is the real trust guarantee. The operator's inability to touch funds is not a policy — it is an architectural constraint.

---

## The Rules

These rules are versioned on GitHub. The current version is always at:  
[github.com/citeback/citebackwebsite/blob/main/GOVERNANCE.md](https://github.com/citeback/citebackwebsite/blob/main/GOVERNANCE.md)

**Any change to these rules is announced publicly at least 7 days before it takes effect** — via a GitHub commit and a platform announcement. No rule change takes effect silently.

---

## Campaign Rules

**Who can run a campaign:**  
Verified professionals only — attorneys (state bar), nonprofits (EIN), licensed healthcare professionals (NPI), or institutional email (.edu / .gov). Credentials are verified automatically against public registries. Your real identity is stored privately and never shown publicly. Your public badge shows only your credential type and state.

**What campaigns must have:**
- A specific, verifiable target (a program, agency, vendor, or jurisdiction — not a vague cause)
- A cost breakdown with defined milestones
- Measurable deliverables for each milestone (FOIA filing receipt, court document, billboard photo)
- A campaign wallet (XMR or ZANO) — contributions go directly to your wallet

**What campaigns cannot do:**
- Fund criminal defense
- Fund illegal activity
- Target private individuals
- Tamper with surveillance infrastructure

These are permanent rules. They cannot be changed.

**Milestones:**  
Funding is released milestone by milestone. Each milestone requires verified proof of completion (MuckRock URL, court filing number, C2PA photo, or equivalent). The operator reviews and confirms before the next tranche is promoted.

**Early drain:**  
Campaign organizers who withdraw funds before milestone completion without approval face permanent platform ban and public notation on their profile.

---

## Campaign Organizer Credentials

| Type | Verified Against |
|------|-----------------|
| Attorney | State bar registry |
| Nonprofit / Org | IRS EO Select Check (501c3) |
| Licensed Healthcare Professional | CMS NPI Registry |
| University or Government | Institutional email (.edu / .gov) |

Verification is automatic. Your legal name is stored encrypted on our servers and is never returned to any client or shown publicly under any circumstances.

---

## The Fork Right

The entire platform — code, rules, data structures, and campaign taxonomy — is open source at [github.com/citeback/citebackwebsite](https://github.com/citeback/citebackwebsite).

If this platform disappears, changes in ways the community rejects, or the operator goes rogue: anyone can fork the repository and run their own instance. The platform is not tied to any domain or any single operator.

---

## Phase 2 — Community Participation

As the platform grows, verified campaign organizers will gain structured input into how the platform evolves — proposal processes, public comment periods, and documented decision-making.

That system will be designed publicly and announced before it activates. It will not involve token-weighted voting or mechanisms that can be gamed by coordinated credential registration.

---

## Contact

Platform decisions, rule disputes, and misconduct reports: [platform@citeback.com](mailto:platform@citeback.com)

All operator decisions that affect campaign status are logged and available on request.
