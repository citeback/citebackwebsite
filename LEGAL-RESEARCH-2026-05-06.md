# Citeback Legal Risk Research
**Prepared:** 2026-05-06  
**Prepared by:** Remmy (AI Research Assistant)  
**For:** Scott Hughes, Citeback  
**Status:** Pre-attorney engagement research — NOT legal advice. For attorney briefing use only.

> **Methodology note:** Web search was unavailable at time of preparation. Research draws on FinCEN, OFAC, and DOJ primary sources retrieved via web_fetch, combined with comprehensive training-data knowledge of cited statutes, regulations, guidance, and case law through early 2026. All citations should be independently verified before attorney use. Where specific 2025–2026 developments are referenced, they are flagged.

---

## EXECUTIVE SUMMARY — RISK SCORECARD

| Risk Area | Risk Level | Primary Concern |
|---|---|---|
| 1. MSB/FinCEN | 🔴 **CRITICAL** | TEE-custody model unresolved; § 1960 criminal exposure; no clear safe harbor |
| 2. OFAC / Monero | 🔴 **CRITICAL** | Structural inability to screen donors; strict-liability exposure; Tornado Cash precedent |
| 3. Wyoming DAO LLC | 🟡 **MEDIUM** | Civil liability protection real but narrow; no federal law shield; minimal case law |
| 4. §230 Immunity | 🟠 **HIGH** | Camera data probably protected; billboard funding likely breaks §230; human review creates Roommates.com tension |
| 5. FARA/LDA | 🟡 **MEDIUM** | Platform itself low FARA risk; operators face real LDA exposure; anonymous foreign donors create residual FARA gap |
| 6. Camera Sighting Liability | 🟢 **LOW-MEDIUM** | §230 protects false sightings if platform doesn't develop content; verification practices create tradeoffs |

**Minimum pre-launch gates (based on this research):** Written attorney opinions on Items 1 (MSB) and 2 (OFAC) before any wallet accepts funds. Everything else can be phased, but these two carry federal criminal exposure.

---

## SECTION 1: MSB / FinCEN REGISTRATION

### Current Law and Guidance

**Statutory framework:** 31 U.S.C. § 5330 and 31 CFR § 1010.100(ff)(5) define "money transmission services" as "the acceptance of currency, funds, or other value that substitutes for currency from one person and the transmission of currency, funds, or other value that substitutes for currency to another location or person by any means." Operating an unlicensed MSB is a federal crime under 18 U.S.C. § 1960 (up to 5 years imprisonment per count, or 10 years if the violation involves international money laundering).

**Primary guidance:** FinCEN FIN-2019-G001 (May 9, 2019), *Application of FinCEN's Regulations to Certain Business Models Involving Convertible Virtual Currencies*, is the controlling guidance document. It explicitly addresses multiple CVC business models and their MSB implications. Key holdings relevant to Citeback:

- **"Administrators" vs. "exchangers":** FinCEN draws a distinction, but the more relevant category here is the money transmitter analysis, which applies regardless of whether the platform issues its own CVC.
- **Funding platforms:** FIN-2019-G001 §4.5 addresses platforms that receive CVC from multiple persons and distribute it to third parties. FinCEN's position is that accepting and transmitting value — even through automated systems — generally constitutes money transmission.
- **Non-custodial / autonomous systems:** FinCEN explicitly declined to create a blanket exemption for automated or software-based systems. The guidance states that "the label applied to [a] business model does not determine the applicable regulatory treatment." The *function* performed governs.
- **TEE-specific analysis absent:** FIN-2019-G001 predates the widespread use of Trusted Execution Environments for custody. There is **no FinCEN guidance directly addressing whether TEE-mediated custody constitutes money transmission**. This is an unresolved question.

**Relevant exemptions:**

*Payment processor exemption* (31 CFR § 1010.100(ff)(5)(ii)(B)): Exempts companies that process payments "through clearance and settlement systems" for the sale of goods or services. Citeback does not sell goods or services — it funds campaigns. This exemption almost certainly does not apply.

*Agent of the payee exemption* (FIN-2019-G001 §4.5.1): Exempts platforms acting purely as the agent of the recipient (operator), where (1) the sender intends to pay the recipient directly, (2) the agent has a formal agreement with the payee, and (3) the agent does not control when or whether funds are transmitted. This is Citeback's strongest potential exemption argument. The multi-milestone, community-governed disbursement model arguably resembles conditional escrow rather than discretionary transmission — but the platform controls campaign eligibility, approval, and disbursement rules, which cuts against the "pure agent" framing.

**Recent enforcement actions (training knowledge through early 2026):**
- *United States v. Harmon* (D.D.C. 2020): FinCEN assessed a $60 million civil penalty against Helix, a Bitcoin mixing service, for BSA violations. Established that privacy-enhancing cryptocurrency services are squarely within BSA jurisdiction.
- *United States v. Sterlingov* (D.D.C. 2023): Bitcoin Fog operator convicted of money laundering and operating an unlicensed MSB. The key takeaway: *the operator cannot claim ignorance of the BSA because the service handles CVC.* Personal criminal liability attached even for a solo operator.
- **FinCEN has not issued guidance specifically addressing DAOs or DAO LLCs**, as of this research. FinCEN has, however, stated informally that it will "look through" DAO structures to find responsible parties — the Wyoming DAO LLC designation does not immunize the entity from MSB registration requirements.

### Risk Assessment: 🔴 CRITICAL

**Why critical:** The platform's core function — accepting XMR/ZANO from multiple donors and disbursing to operators per governance rules — is facially money transmission under 31 CFR § 1010.100(ff)(5). The TEE-custody argument is untested and novel. FinCEN has shown zero hesitation to pursue solo operators of unlicensed crypto transmission services under § 1960 even when those operators believed their architecture created a legal distinction.

**Mitigating factors:**
1. The Wyoming DAO LLC is an identifiable legal entity that CAN register as an MSB if required. This is meaningfully better than an anonymous or purely autonomous operator.
2. The "agent of the payee" exemption may have traction given that (a) operators are pre-screened and have formal agreements, (b) disbursements are rule-bound and community-governed, and (c) the platform does not exercise discretionary control over fund release.
3. The campaign-funding model (rather than general value transmission) may be distinguishable from a generic money transmitter.
4. The non-profit-like mission does not, by itself, create an exemption — but it provides context for a "public interest" interpretation of ambiguous cases.

**Aggravating factors:**
1. The anonymous donor architecture is the same architecture that FinCEN has characterized as a "red flag" for AML risk in multiple guidance documents.
2. Monero's privacy features make BSA-required recordkeeping for sender transactions impossible. FinCEN has never blessed an architecture that structurally cannot maintain BSA records.
3. Solo founder in New Mexico = personal § 1960 exposure at pre-registration launch.
4. Graduated 3–5% fee model makes this look more like a commercial service than a passive infrastructure layer.

### Specific Recommendations

1. **Obtain a written MSB opinion before any wallet is funded.** This is non-negotiable. The opinion should be directed to the Wyoming DAO LLC by name, analyze FIN-2019-G001 against the split model, and expressly address the agent-of-the-payee exemption. Budget $5,000–15,000 for a specialized FinCEN attorney.

2. **If MSB registration is required:** Register before launch. The Wyoming DAO LLC can be the registrant. Build an AML program around operator-side KYC (which the LLC already performs). The program cannot screen donors, but documenting the structural impossibility of donor screening — alongside the ToS prohibition and operator pre-screening — is the available good-faith posture.

3. **Explore a FinCEN administrative ruling (FinCEN Ruling Request):** The platform's TEE-custody model is novel enough that FinCEN may issue a ruling on request. This takes 6–12 months but creates a documented safe harbor. Do not launch while awaiting a ruling — file a ruling request in parallel with the MSB opinion process.

4. **If the attorney identifies a specific exemption:** Document it in writing, maintained in platform compliance records. Review annually as FinCEN guidance evolves.

5. **Operator-side AML program minimum elements** (if MSB registration required): Written AML policy, designated compliance officer (Scott initially), SAR filing procedures for suspicious operator activity, operator identity verification (already implemented), OFAC screening (already implemented), recordkeeping for operator transactions.

---

## SECTION 2: OFAC — MONERO AND SANCTIONS EXPOSURE

### Current Law and Guidance

**Statutory framework:** OFAC administers sanctions under the International Emergency Economic Powers Act (IEEPA), 50 U.S.C. § 1701 et seq., and various country- and program-specific Executive Orders. U.S. persons are broadly prohibited from engaging in transactions with SDN-listed individuals and entities, regardless of geographic location. Violations are strict liability for the transaction itself — good faith is a *mitigating factor* in penalty calculation but does not eliminate civil liability.

**OFAC's virtual currency framework:** OFAC FAQ 559 (March 2018) confirmed that OFAC sanctions apply to virtual currency transactions. OFAC FAQ 560 confirmed that OFAC can and does add cryptocurrency wallet addresses to the SDN list. OFAC's *Sanctions Compliance Guidance for the Virtual Currency Industry* (October 2021) laid out a risk-based compliance framework expecting virtual currency firms to: (1) conduct sanctions screening of counterparties, (2) implement geolocation tools, (3) implement KYC procedures, and (4) conduct transaction monitoring.

**Tornado Cash precedent — critical for Citeback:**

On August 8, 2022, OFAC designated Tornado Cash (TC) under E.O. 13694, citing its use to launder proceeds from North Korean state-sponsored cybercrime (Lazarus Group). TC had processed over $7 billion in transactions, including hundreds of millions in proceeds from DPRK-linked hacks.

*Van Loon v. Dep't of the Treasury*, No. 23-50669 (5th Cir. Nov. 26, 2024): The Fifth Circuit held that OFAC exceeded its statutory authority in designating TC's *immutable smart contracts* as "property" subject to IEEPA, because immutable code that no person controls does not constitute "property" of TC. The court distinguished between the *software itself* (not blockable) and *TC's organization and its assets* (blockable). This is a partial win for privacy-preserving platforms — but critically:

- The Fifth Circuit's reasoning applies to *immutable, autonomous* infrastructure that no legal person controls. **Citeback has an identified legal entity (Wyoming DAO LLC) that controls access, campaign eligibility, operator onboarding, and governance rules.** The Van Loon reasoning does *not* insulate Citeback's DAO LLC from OFAC designation.
- The Fifth Circuit decision does not address personal criminal liability of the *operators* of privacy-preserving platforms — only the sanctionability of the software itself.
- The *Tornado Cash criminal case* (*United States v. Storm*, S.D.N.Y. Aug. 2023): Roman Storm was indicted for money laundering conspiracy and operating an unlicensed MSB in connection with TC. The government's theory was that Storm *knowingly* facilitated DPRK money laundering by operating TC despite awareness of SDN-linked transactions. As of early 2026, this case is proceeding and has not been dismissed on Van Loon grounds.

**Is Monero itself on the SDN list?** As of this research (through early 2026), **Monero (XMR) as a currency/protocol is NOT on the OFAC SDN list.** Specific XMR wallet addresses associated with sanctioned individuals could theoretically be listed, but Monero's privacy protocol makes attribution to specific addresses essentially impossible for OFAC. This is a double-edged situation: Monero's untraceability means OFAC cannot list specific wallet addresses, but it also means the platform cannot demonstrate that it *hasn't* received SDN-linked funds.

**The structural gap in Citeback's compliance posture:**

Monero's RingCT and stealth address protocols make donor identity technically impossible to determine. Every incoming XMR transaction is anonymized at the protocol level. This creates an absolute gap in OFAC compliance: the platform cannot screen donors, cannot verify donor non-SDN status, and cannot maintain BSA records of donor transactions. The ToS prohibition on SDN donations is a paper control that carries no meaningful compliance weight if the platform cannot detect violations.

OFAC's *Sanctions Compliance Guidance for the Virtual Currency Industry* explicitly states that firms should "implement transaction monitoring and screening" and that ToS prohibitions *alone* do not constitute adequate compliance. The guidance acknowledges that firms may not always be able to screen every counterparty but expects *available* controls to be implemented. When an architecture is designed to make counterparty screening impossible, OFAC has signaled it will look hard at whether that architecture choice itself reflects willful blindness.

### Risk Assessment: 🔴 CRITICAL

**Why critical:** The combination of (a) XMR-only donor architecture, (b) structural impossibility of donor screening, (c) identified U.S.-person operator (Wyoming DAO LLC), (d) ability to receive funds from anywhere in the world, and (e) campaign types that could attract state-actor interest creates a genuine strict-liability exposure for every transaction. Maximum civil OFAC penalties are $368,136 per transaction (adjusted for inflation), or twice the value of the transaction, whichever is greater. Criminal exposure exists for willful violations.

**What distinguishes Citeback from Tornado Cash:**
- Citeback serves a documented civil liberties purpose; TC was a general-purpose mixer
- Citeback screens *operators* (identified parties) against the SDN list — TC screened no one
- Citeback restricts campaign types to lawful accountability activities
- Citeback has not been associated with state-sponsored cybercrime proceeds (yet)

**What does NOT distinguish Citeback from Tornado Cash:**
- Both operate anonymous value transfer
- Both are controlled by identified U.S. persons (who can be criminally prosecuted)
- Both are architecturally incapable of SDN-screening on the donor side
- Both accept crypto from anyone, anywhere

**The key asymmetry:** OFAC enforcement has historically focused on platforms used to launder clearly illicit proceeds (hacks, ransomware, drug trafficking). A surveillance accountability platform with documented civil liberties goals and operator-side KYC is a very different profile from TC. But this is an enforcement discretion argument, not a legal compliance argument. OFAC operates under strict liability.

### Specific Recommendations

1. **Obtain a written OFAC opinion before launch.** The attorney should provide a specific assessment of civil penalty exposure per transaction, the good-faith mitigation credit available given current compliance posture, and whether the platform's civil liberties mission would be treated as a mitigating factor in an enforcement calculus.

2. **Document everything about the operator OFAC screening process.** The operator-side screening is the strongest available OFAC compliance mechanism. Maintain detailed logs: date of screening, name checked, SDN list version used, result. This documentation is what OFAC looks at to calculate "good faith" mitigation in a civil penalty proceeding.

3. **Add a geographic disclaimer where feasible.** Even though the platform cannot technically geoblock XMR donations, clearly disclosing that contributions from OFAC-sanctioned countries/individuals are prohibited (and building this into the ToS) is the minimum acceptable compliance posture.

4. **Consider a voluntary self-disclosure framework.** OFAC's enforcement guidelines give significant credit for voluntary self-disclosure. Before launch, the attorney should advise on whether pre-launch voluntary disclosure of the structural gap (describing the architecture and mitigation measures) would create a favorable enforcement posture.

5. **Monitor OFAC XMR guidance actively.** OFAC has not yet listed any XMR wallet addresses on the SDN list, but regulatory posture toward privacy coins is evolving rapidly. The platform should have a documented process for monitoring OFAC guidance and updating compliance procedures when new guidance issues.

6. **Do not accept Zcash, Dash, or other privacy coins beyond XMR/ZANO without additional attorney review.** Zcash has a more complex regulatory history due to its optional privacy features.

7. **Monero itself is currently not OFAC-listed.** This is an important baseline fact the attorney should confirm as of the date of launch, as it means the *act of receiving XMR* is not per se a sanctions violation — only receiving XMR from SDN-listed persons is.

---

## SECTION 3: WYOMING DAO LLC

### Current Law and Governance

**Statutory framework:** Wyoming enacted the Decentralized Autonomous Organization Supplement (Wyo. Stat. §§ 17-31-101 to 17-31-116) effective July 1, 2021. It is the first U.S. statute to explicitly recognize DAOs as a legal entity form. Key provisions:

- **Legal personhood:** A DAO LLC is a limited liability company under Wyoming law. It has all the powers of a standard Wyoming LLC (Wyo. Stat. § 17-29-105) plus the ability to operate primarily through smart contract governance.
- **Liability shield:** Members (and algorithmically determined members) of a Wyoming DAO LLC have limited liability from the debts, obligations, and liabilities of the entity — the standard LLC liability shield. Personal assets of members are protected from entity claims absent personal guarantees or piercing.
- **Operating agreement:** Can be a smart contract or algorithmic governance document (Wyo. Stat. § 17-31-104). Citeback's GOVERNANCE.md could serve as or supplement the operating agreement.
- **Registered agent:** Required. The entity must maintain a registered agent in Wyoming for service of process.
- **Membership:** Can be anonymous; membership can be determined algorithmically. "Algorithmically determined member" means the DAO's code determines membership rights.

**What the Wyoming DAO LLC DOES provide:**
1. **Civil liability protection** for Scott as the founder/operator. Claims arising from the platform's operations (operator lawsuits, vendor disputes, etc.) generally cannot reach Scott's personal assets.
2. **Legal entity status** for FinCEN/OFAC compliance purposes — critical for all regulatory analysis.
3. **Contractual capacity** — the entity can sign operator agreements, retain counsel, open bank accounts (though crypto-focused banking is limited).
4. **Governance by smart contract** — the GOVERNANCE.md / TEE combination can serve as the operating agreement, which is legally novel and largely untested.

**What the Wyoming DAO LLC does NOT provide:**
1. **No federal law immunity.** Wyoming Stat. § 17-31-115 explicitly states that the DAO LLC provisions do not limit "any federal or state laws or regulations applicable to the digital assets of the DAO." This means FinCEN, OFAC, SEC, and DOJ enforcement reach the entity just as they would any LLC.
2. **No protection from personal criminal liability.** If Scott is convicted of § 1960 or OFAC violations, the LLC does not shield him personally from criminal prosecution. The entity and the individual are both exposed.
3. **No resolution of the MSB question.** The entity can register as an MSB — it's actually an advantage over an anonymous or entityless operator — but the DAO designation itself creates no exemption from MSB requirements.
4. **No tested case law.** As of early 2026, there is essentially no reported case law interpreting the Wyoming DAO LLC statute. No appellate decisions, no federal court decisions addressing its limitations. This is a frontier entity form operating on untested legal ground.

**Foreign qualification:** Citeback, operated by a New Mexico founder, likely needs to "foreign qualify" the Wyoming DAO LLC in New Mexico (N.M. Stat. § 53-19-43 et seq.) if the LLC conducts "business" in New Mexico. New Mexico generally requires foreign qualification for LLCs transacting business in the state. The ATTORNEY-BRIEF correctly identifies this as a separate question from FARA.

**Wyoming DAO LLC and FinCEN MSB nexus:** The Wyoming DAO LLC provides a registered entity that can serve as the MSB registrant if registration is required. FinCEN MSB registration for a DAO LLC is novel but procedurally straightforward — the entity files Form FinCEN 107 and designates a compliance officer. This is a meaningfully better compliance posture than an anonymous operator.

### Risk Assessment: 🟡 MEDIUM

**Why medium:** The Wyoming DAO LLC provides real civil liability protection and real legal entity advantages for regulatory compliance. The risk is not from the entity form itself but from what it *doesn't* provide: no federal law shield, no MSB exemption, no OFAC protection, and no tested case law. The medium risk is primarily the risk that Scott and his attorney will overestimate the protection provided and underestimate the gaps.

**Practical value assessment:** The Wyoming DAO LLC is worth having. It provides meaningful protection for civil claims, gives Scott a legitimate legal entity to work with, and creates the compliance infrastructure needed for MSB registration if required. It is NOT, however, a compliance solution — it's a compliance tool.

### Specific Recommendations

1. **File the Wyoming DAO LLC immediately.** This is the cheapest, fastest action item on the entire launch checklist and it unblocks multiple other legal steps. Cost: ~$150, 30 minutes online.

2. **Obtain New Mexico foreign qualification advice from the attorney.** New Mexico requires foreign qualification for LLCs conducting business in state. Scott operates from New Mexico. The attorney should confirm whether the platform's activities constitute "transacting business" in New Mexico.

3. **Have the attorney confirm the operating agreement structure.** GOVERNANCE.md v0.8 should be reviewed and potentially adapted to serve as or supplement the Wyoming DAO LLC operating agreement. There are specific drafting requirements under Wyo. Stat. § 17-31-104 that should be addressed.

4. **Do not represent to anyone that the Wyoming DAO LLC limits federal exposure.** The GOVERNANCE.md correctly notes this. Any investor, operator, or advisor who is told the DAO LLC structure creates federal law protection is being misled.

5. **Warrant canary legality for Wyoming DAO LLC:** While this document is not the attorney brief, the question is relevant. Warrant canary notices have been maintained by several technology companies (notably Apple and Canary Watch participants). No court has definitively ruled them legal or illegal. The Ninth Circuit has not issued a definitive ruling on whether a canary constitutes prohibited disclosure of an NSL under 18 U.S.C. § 2709(c). A canary is probably viable as a practical matter, but its legal status under NSL/FISA is genuinely uncertain. The attorney should advise specifically on this.

---

## SECTION 4: §230 IMMUNITY

### Current Law

**Statutory framework:** 47 U.S.C. § 230(c)(1) provides that "[n]o provider or user of an interactive computer service shall be treated as the publisher or speaker of any information provided by another information content provider." This immunity has been interpreted extremely broadly by most federal circuits, but with important exceptions.

**Key cases:**

*Zeran v. AOL*, 129 F.3d 327 (4th Cir. 1997): Foundational §230 case. AOL not liable for defamatory content posted by third parties even after notice. Established that §230 bars distributors as well as publisher liability.

*Fair Housing Council v. Roommates.com*, 521 F.3d 1157 (9th Cir. 2008) (en banc): The critical material contribution test. The Ninth Circuit held that a platform loses §230 protection when it "materially contributes to the unlawful nature of" third-party content. The platform in Roommates.com required users to disclose preferences that themselves violated the Fair Housing Act — the platform *designed and required* the discriminatory content. The key question is whether a platform's design or editorial choices transform it from a neutral host into a developer of content.

*Force v. Facebook*, 934 F.3d 53 (2d Cir. 2019): §230 protects Facebook's algorithmic recommendations even when algorithms amplified terrorist content. Editorial curation does not = development.

*Herrick v. Grindr*, 765 F. App'x 586 (2d Cir. 2019): §230 protected Grindr from harassment campaigns facilitated by the platform's location features. The platform didn't create the harassment.

*Twitter v. Taamneh*, 598 U.S. 471 (2023): Supreme Court held Twitter was not liable for ISIS attacks allegedly facilitated by algorithmic recommendations. Very favorable for platforms.

*Gonzalez v. Google*, 598 U.S. 617 (2023): Supreme Court declined to address §230's scope in a case about algorithmic recommendations, instead resolving on ATA grounds. §230's scope remains broadly protective under existing circuit precedent.

**§230 exceptions:** By statute, §230(e) excludes: (1) federal criminal law, (2) intellectual property claims, (3) electronic privacy law (ECPA), and (4) sex trafficking (FOSTA-SESTA). State law claims not covered by these exceptions are generally preempted by §230.

### Application to Citeback

**Camera sighting data — user-submitted false sightings:**

**Probable §230 protection.** The analysis:

1. *Is Citeback an "interactive computer service"?* Almost certainly yes. ICS is broadly defined as "any information service, system, or access software provider that provides or enables computer access by multiple users to a computer server" (47 U.S.C. § 230(f)(2)). A web-based crowdfunding/mapping platform qualifies.

2. *Did the user (not Citeback) create the false sighting?* Yes, under the standard campaign model. Users submit sighting data; the platform hosts it.

3. *Did Citeback "develop" the false sighting?* This is the key question. Under Roommates.com, development requires "materially contributing to" the *unlawful nature* of the content. A false camera sighting is:
   - Probably not defamatory at all (defamation requires a false statement of fact about a *person* — a false camera location isn't typically about a person).
   - Not independently unlawful under most theories — erroneous surveillance mapping is a factual error, not a tort in most jurisdictions absent additional circumstances.
   - Not "developed" by requiring users to submit it through a structured form, unless that form *dictates* the false content.

4. **Practical §230 analysis for camera sightings:** Very high probability of §230 protection. False location data for a physical device does not fit the standard defamation/tortious content pattern. More importantly, the platform doesn't prompt or require false submissions — it requires user attestation of accuracy, which actually *reinforces* the neutral host posture.

**Critical caveat on verification:** If Citeback implements a "verified" badge for camera sightings, conducts editorial review that "endorses" specific data, or represents data as accurate, it may have adopted the content as its own and lost §230 protection for that content. **The platform should never represent camera sighting data as independently verified or accurate** — it should always be presented as user-reported.

**Billboard campaigns — platform funding of third-party content:**

**§230 protection is seriously uncertain here.** The analysis:

1. **The funding problem:** §230 protects platforms for *hosting* third-party content. It is unclear whether §230 protects a platform that *funds* the physical publication of third-party content (a billboard). When Citeback disburses money to an operator to place a billboard, Citeback is not passively hosting the content — it is financing its physical creation and public display.

2. **Publishing vs. hosting:** Traditional defamation law distinguishes between publishers (who exercise editorial control and bear liability), distributors (who distribute without knowledge and have reduced liability), and common carriers (who transmit without any liability). A platform that finances a physical advertisement may be characterized as a *publisher* — it made the affirmative choice to fund that specific content.

3. **Roommates.com development test applied to billboard funding:** When Citeback's human operator reviews a billboard campaign proposal and approves it with knowledge of the specific claims, it has arguably exercised editorial judgment over the content in a way that *materially contributes to its publication*. This is different from Roommates.com (which prompted illegal content) but similar in the sense that the platform made an affirmative content-selection decision.

4. **The better §230 argument for billboard campaigns:** The platform reviews for *eligibility* (campaign type, target legitimacy, documentation adequacy) — not for content *accuracy*. If the human operator maintains a bright line between "eligibility determination" and "content endorsement," the Roommates.com material-contribution test may not be met. The attestation model (operator swears to accuracy; platform doesn't verify) supports this reading.

5. **The billboard liability question may be moot for the specific content:** Surveillance accountability claims about government contractors (Clearview AI, Flock Safety, Palantir) are primarily claims about documented governmental and commercial practices. Most such claims would qualify as protected opinion or fair comment on public concern under First Amendment doctrine, regardless of §230.

**The §230 / editorial control tension for the split model:**

The ATTORNEY-BRIEF correctly identifies the tension: human editorial review (good for accountability and governance) creates the Roommates.com material-contribution risk (bad for §230). The resolution is procedural:

- Review for **eligibility criteria** (is this campaign type allowed? Is the target a government entity or government-contracted vendor?) = §230-preserving
- Review for **factual accuracy of specific claims** = potentially §230-undermining
- Review for **legal risk to the platform** = probably §230-neutral if documented as a business-judgment call, not editorial adoption of the content

The platform should document its review process clearly: "We reviewed this campaign for compliance with our campaign taxonomy and eligibility criteria. We did not independently verify the accuracy of any factual claims. Responsibility for factual accuracy rests with the operator."

### Risk Assessment: 🟠 HIGH

**Why high:** Camera data is probably well-protected. But the billboard funding model creates genuine §230 uncertainty that courts have not resolved in this specific configuration. The physical-publication-funding question is not cleanly answered by existing doctrine. A court hostile to the platform's mission could find that funding physical defamatory content falls outside §230.

### Specific Recommendations

1. **Camera sighting data:** Maintain clear "user-reported, not verified" language on all sighting data. Never add "verified" badges or endorsements. Implement a removal-on-notification policy for data that operators or third parties contest with supporting documentation. This preserves good-faith §230 posture.

2. **Billboard campaigns:** The attorney must draft specific attestation language that (a) places all factual accuracy responsibility on the operator, (b) confirms the platform reviewed only for eligibility, not accuracy, and (c) acknowledges the operator's indemnification of the platform for defamation claims. Keep the human review criteria narrow and documented.

3. **Billboard content review protocol:** Create a documented checklist of what the human operator reviews (campaign type, target legitimacy, claimed documentation present) and what is explicitly NOT reviewed (accuracy of specific factual claims). This documentation is what a court will examine in a §230 motion.

4. **Named vendor campaigns (Clearview AI, Flock Safety, Palantir):** All three are private companies. Clearview AI has a documented history of aggressive litigation. Before any billboard campaign targeting these entities goes live, have the attorney review the specific claims. "Documented fact" vs. "evaluative opinion" analysis is critical.

5. **Hobbs Act / extortion bright line:** This is flagged in GOVERNANCE.md as an open question and must be addressed before billboard campaigns go live. The attorney needs to define when a campaign claiming "pay for surveillance rollback or face exposure" crosses into 18 U.S.C. § 1951 territory. The platform should proactively prohibit campaigns structured as conditional demands.

---

## SECTION 5: FARA / LOBBYING DISCLOSURE ACT

### Current Law

**FARA (22 U.S.C. § 611 et seq.):**

FARA requires "agents of foreign principals" to register with DOJ and periodically disclose activities, receipts, and disbursements. The key elements:

1. **"Foreign principal"** means a foreign government, foreign political party, foreign entity, or "any person outside of the United States" — this is broad and includes foreign individuals.

2. **"Agent of a foreign principal"** means a person who acts "at the order, request, or under the direction or control" of a foreign principal and engages in political activities, public relations activities, political consulting, fundraising, or related activities in the US.

3. **"Political activities"** means activities intended to influence any US government official or the American public on US domestic or foreign policy, or on behalf of a foreign principal in connection with any US government action.

**FARA exemptions relevant to Citeback:**
- *Bona fide commercial activities* exemption (22 U.S.C. § 613(d)): Does not apply if the activity includes political activities.
- *Domestic advocacy* exemption: Activities relating purely to domestic political matters without foreign principal direction are exempt.
- *Persons not acting under foreign direction:* If a platform receives foreign money but is not *directed by* a foreign principal, FARA does not apply.

**The critical FARA distinction for Citeback:**

FARA requires both (a) a foreign principal AND (b) acting at that principal's direction or control. Anonymous XMR donors are not "foreign principals" directing Citeback's activities — they have no direction or control over what campaigns are approved, what advocacy is conducted, or how funds are disbursed. Donors give money and receive governance votes proportional to their contribution — but governance votes are not "direction or control" of a designated FARA agent relationship.

**However:** If an operator is funded by a campaign where foreign-sourced donations constitute a significant portion, and that operator engages in political activities in the US at the de facto direction of those foreign funders, the operator could potentially be characterized as acting "at the request" of foreign principals. This is a stretch but not a zero-probability argument in an aggressive enforcement environment.

**FARA enforcement posture (2023–2026):** DOJ's FARA Unit has significantly increased enforcement since 2016 (post-Mueller investigation). Recent cases have targeted foreign influence campaigns. However, domestic civil liberties advocacy funded by anonymous donors who may include foreigners is NOT the profile DOJ's FARA Unit has historically targeted — they focus on organized foreign government influence operations.

**LDA (2 U.S.C. § 1603):**

The Lobbying Disclosure Act requires registration of "lobbyists" — individuals who make more than one "lobbying contact" on behalf of a client, spend more than 20% of their time on lobbying activities for that client in a quarterly period, AND receive more than $3,000 in lobbying-related income in that period from a single client.

Key LDA application to Citeback-funded operators:

1. **"Lobbying contact":** A communication to a covered government official regarding federal legislation, regulations, or policy. Contact with state officials regarding *state* legislation triggers state lobbying registration, not federal LDA registration.

2. **The $3,000 threshold and 20% test:** An operator running a campaign to fund NM state ALPR advocacy receives XMR equivalent to, say, $10,000 and spends 20%+ of their time on the advocacy work. Does LDA apply? **No** — LDA is federal. State lobbying law would apply to NM state legislative advocacy.

3. **New Mexico's Lobbyist Regulation Act (N.M. Stat. § 2-11-1 et seq.):** Requires registration for anyone who "communicates for compensation with a member of the legislature or a legislative staff member for the purpose of influencing the passage or defeat of any legislation." The $500 compensation threshold (substantially lower than federal LDA). An operator receiving campaign funds and advocating for HB 123 (NM ALPR bill) could potentially trigger NM lobbyist registration if they're making direct communications with legislators.

4. **Federal LDA and Citeback campaigns:** FOIA request campaigns, billboard campaigns, and counter-database projects do NOT constitute "lobbying contacts" under LDA. They are not communications with covered government officials regarding federal legislation. The risk is specifically with campaigns that explicitly target federal legislation or regulation.

**Specific application to NM HB 123 / ALPR privacy bill:**

This is a *state* legislative advocacy campaign, not federal. Federal FARA and LDA do not apply to state-level legislative advocacy (unless the advocacy is done "on behalf of" a foreign principal under FARA, which requires the direction-and-control element discussed above). **The applicable law is New Mexico's Lobbyist Regulation Act.** Any operator receiving Citeback campaign funds and directly communicating with NM legislators should evaluate NM lobbyist registration requirements.

### Risk Assessment: 🟡 MEDIUM

**Why medium:** FARA exposure for the *platform* is genuinely low — Citeback is not acting at the direction of any foreign principal. The risk is primarily for *operators* who may be conducting LDA/state-lobbying-registerable activities while funded by campaigns with anonymous donors who may include foreigners. The "anonymous foreign donor" gap creates a residual FARA risk for operators, but the lack of "direction or control" makes FARA application legally tenuous.

**Highest actual risk:** NM operators participating in HB 123 advocacy who receive over the NM threshold ($500) and make direct legislator communications need to evaluate NM lobbyist registration. This is a $0 legal problem if the operator simply registers — it's a disclosure obligation, not a prohibition.

### Specific Recommendations

1. **Platform-level FARA exposure is low.** The attorney should confirm this, but the platform is not an agent of any foreign principal. The receiving of anonymous donations, without direction or control by a foreign principal, does not constitute FARA agency.

2. **Operators must be advised of LDA/state lobbying registration obligations.** The operator agreement and platform documentation should clearly state that operators engaging in legislative advocacy are responsible for their own lobbying registration compliance under applicable federal and state law.

3. **Federal LDA threshold analysis for operators:** Federal LDA does not apply to NM state-level advocacy. It would apply if an operator uses platform funds to lobby Congress or federal agencies. The $3,000 / 20% time test would govern. Operators should be advised to track their lobbying time and contacts if they receive over $3,000 from any single campaign.

4. **Consider a pre-launch FARA consultation with DOJ.** The FARA Unit at DOJ's National Security Division allows informal advisory opinion requests. A pre-launch letter describing the platform's structure and asking whether the platform itself constitutes a FARA agent could provide documented good-faith protection. This is a low-cost action (attorney letter-writing exercise) that could create significant compliance value.

5. **Campaign type restriction for legislative advocacy:** The GOVERNANCE.md correctly requires attorney sign-off before legislative advocacy campaigns go live. This is the right call. The attorney opinion should specifically address whether the operator's activities, funded by anonymous crypto including potentially foreign donors, require any disclosure or registration.

---

## SECTION 6: CAMERA SIGHTING DATA LIABILITY

### Current Law and Analysis

**The specific scenario:** A user submits a camera sighting to Citeback's map. The sighting contains incorrect information — wrong location, wrong camera type, or false claim of camera presence. The platform publishes the sighting. A party (government entity, private company, property owner) claims harm from the false data.

**Defamation analysis:**

*Who is potentially defamed by a false camera sighting?*

Defamation requires a false statement of fact that (1) is of or concerning a *person or legal entity*, (2) is communicated to third parties, (3) is false, and (4) causes harm.

A false claim that "there is an ALPR camera at [Location X]" is primarily a statement about a *device and location*, not about a person. However:

- If the sighting implies that a specific law enforcement agency or official *unlawfully* placed a camera at a location, there could be a defamation-adjacent claim by the agency or official.
- **Government entities cannot sue for defamation** under the First Amendment — *City of Chicago v. Tribune Co.*, 307 Ill. 595 (1923) and its progeny. Police departments, city governments, and state agencies cannot claim defamation in the US.
- **Government officials** can sue for defamation as individuals, but only for false statements about their personal conduct, not about the existence of a surveillance device.
- **Private surveillance vendors** (Clearview AI, Flock Safety) cannot be defamed by false reports of their cameras at specific locations unless those reports imply something unlawful or disreputable about the company specifically.

**Practical conclusion on defamation from camera sighting data:** The risk is genuinely low. Surveillance mapping data (camera locations, camera types) is factual data about physical devices, not about persons. There is no identified US plaintiff who has sued a surveillance mapping organization for defamation based on incorrect sighting data.

**Comparable platforms:** EFF's Atlas of Surveillance (a well-established surveillance camera mapping project) has operated for years without material defamation litigation arising from data accuracy issues. This is meaningful precedent.

**§230 analysis for false camera sightings (expanded):**

1. **Standard §230 protection applies** if the false sighting is submitted by a user and Citeback doesn't materially contribute to the specific false content. See Section 4 discussion above.

2. **The attestation model:** Requiring users to attest to accuracy before submission does NOT eliminate §230 protection — it's an eligibility requirement, not content development. Courts have consistently held that requiring users to agree to accuracy before posting doesn't transform the platform into a content developer. *See Barnes v. Yahoo!*, 570 F.3d 1096 (9th Cir. 2009) (§230 analysis of platform conduct).

3. **The "notice" problem:** Under Zeran, §230 bars publisher-liability claims even after notice of potentially false content. However, if the platform receives specific, credible notice that a particular sighting is false and takes no action, some courts (particularly outside the Fourth Circuit) have considered this in evaluating non-§230 claims. A clear removal-on-notice policy reduces this risk.

4. **No "negligent data" theory without physical harm:** Courts have been reluctant to impose liability for inaccurate online data absent physical harm directly traceable to the inaccuracy. A false camera sighting that causes someone to visit a location and find no camera has not been treated as tortious in any identified case.

**Other liability theories for false sightings:**

*Negligence:* Would require establishing that Citeback owed a duty of accuracy to someone who relied on the data to their detriment. This is a very difficult theory — the platform explicitly disclaims accuracy in the ToS (§14 of TOS_DRAFT.md). Courts have been very reluctant to impose negligence liability on platforms for user-submitted data, particularly when disclaimers are present.

*False light / invasion of privacy:* Requires placing a person in a false light before the public that is highly offensive to a reasonable person. A false camera sighting does not typically place any *person* in a false light — it makes a claim about a physical device.

*Intentional infliction of emotional distress (IIED):* Would require the platform's conduct (publishing the false sighting) to be extreme and outrageous. A false camera sighting published without malice does not meet this standard.

**The physical harassment risk:** This is a practical (not legal) risk. If a false sighting associates a private individual's property with illegal surveillance, third parties acting on that data could harass the property owner. The platform's operator terms (restricting campaigns to government entities and government-contracted vendors) significantly mitigate this risk at the campaign level. For basic mapping data, the platform should include clear disclaimers.

### Risk Assessment: 🟢 LOW-MEDIUM

**Why low-medium:** Defamation from camera sighting data faces multiple legal barriers (no person defamed, §230 protection, EFF Atlas precedent). The primary exposure is theoretical and has not materialized for comparable platforms. The "medium" qualifier reflects the risk that an aggressive plaintiff (a named vendor like Flock Safety or Clearview AI) could bring a creative claim that tests §230 in a novel configuration, particularly for camera data that implies specific unlawful vendor conduct.

### Specific Recommendations

1. **Maintain "user-reported" disclaimers universally.** Every camera sighting should clearly indicate: "Reported by user. Not independently verified. Data may be inaccurate." Include this in the displayed data, not just the ToS.

2. **Implement a clear, functional dispute process.** If a government entity or private party identifies a specific false sighting and provides supporting documentation, have a documented process for review and removal. This preserves §230 good faith and reduces the harassment liability risk.

3. **Do not implement a "verified" tier for camera data** unless the platform is actually capable of independent verification (expensive, slow, and legally complex). A verified/unverified binary creates liability gradients that could undermine §230 for "verified" data.

4. **Distinguish mapping data from campaign claims.** Camera sighting data on the map is different from factual claims made in billboard campaign descriptions about specific entities. The §230 and defamation analysis for those campaign claims (especially vendor-specific claims about Clearview AI, Flock Safety, or Palantir) is different and more complex. Billboard campaign claims need separate attorney review per claim type.

5. **Data retention policy for contested sightings.** When a sighting is removed following a dispute, maintain the removal log (who contested it, what documentation they provided, when it was removed). This documentation is valuable if the platform ever faces litigation regarding prior sighting data.

6. **Consider a "community correction" mechanism.** If other users can flag or contest sightings, the platform has a built-in accuracy-improvement mechanism that also demonstrates good faith. This can be implemented without imposing any legal duty of accuracy.

---

## CROSS-CUTTING ISSUES

### Issue A: Solo Founder Personal Criminal Exposure

The most important cross-cutting risk is Scott's personal exposure under 18 U.S.C. § 1960 (unlicensed MSB) and OFAC criminal violations. The Wyoming DAO LLC shields personal assets from civil claims but provides **zero protection from federal criminal prosecution**. The United States v. Sterlingov conviction (Bitcoin Fog, 2023) and the Storm indictment (Tornado Cash, 2023) both demonstrate that solo or small-team operators of privacy-preserving crypto platforms face personal federal criminal exposure that cannot be entity-shielded.

**Priority recommendation:** Obtain written attorney opinions on MSB and OFAC *before any wallet accepts funds*. Full stop. The potential personal criminal exposure is disproportionately severe relative to the $150 filing fee and $20,000–40,000 in attorney costs.

### Issue B: The Interim Custody Question

LAUNCH_PLAN.md raises the possibility of a "Phase 1 Soft Launch" with human-held interim escrow. This is significantly more dangerous from an MSB and OFAC perspective than the TEE-custody model. Human custody of donated crypto = classic money transmission. Human-controlled wallets are also fully traceable, potentially making OFAC violations *detectable* in ways that TEE/XMR custody is not. **The interim custody model should not proceed without explicit attorney clearance.**

### Issue C: The "Accountability vs. Extortion" Bright Line

Several campaign types — particularly billboard campaigns making factual claims about vendors, and campaigns implicitly conditioning advocacy on vendor behavior — approach the Hobbs Act (18 U.S.C. § 1951) extortion boundary. The bright line is: a campaign that documents and publicizes lawful conduct = protected. A campaign that threatens to publicize information unless a vendor pays, withdraws, or changes behavior = potential extortion. The attorney must draft an operational definition of this line for the human operator's use in campaign review.

### Issue D: ICANN Domain Verification (Urgent)

LAUNCH_PLAN.md flags that citeback.com ICANN registration must be verified before **May 14, 2026**. This is time-sensitive and should be treated as an immediate action item independent of legal review.

---

## PRIORITY ACTION MATRIX

| Priority | Action | Timeline | Owner | Cost |
|---|---|---|---|---|
| 🔴 IMMEDIATE | ICANN domain verification for citeback.com | Before May 14, 2026 | Scott | $0 |
| 🔴 IMMEDIATE | File Wyoming DAO LLC | This week | Scott | ~$150 |
| 🔴 HIGH | Retain FinCEN/BSA specialized attorney — Items 1 & 3 minimum | Within 2 weeks of LLC filing | Scott | $5k–$15k minimum |
| 🔴 HIGH | Written MSB opinion before any wallet goes live | Before launch | Attorney | Included above |
| 🔴 HIGH | Written OFAC opinion before any wallet goes live | Before launch | Attorney | Included above |
| 🟠 HIGH | §230 analysis for billboard campaign funding model | Before billboard campaigns | Attorney | Bundled |
| 🟠 HIGH | Hobbs Act / extortion bright-line guidance | Before billboard campaigns | Attorney | Bundled |
| 🟡 MEDIUM | FARA consultation with DOJ FARA Unit | Before legislative advocacy campaigns | Attorney | Low-cost |
| 🟡 MEDIUM | NM foreign qualification analysis | Before operating in NM | Attorney | Bundled |
| 🟡 MEDIUM | Operator LDA/state lobbying registration guidance | Before legislative advocacy campaigns | Attorney | Bundled |
| 🟢 LOW | Camera data dispute policy | Pre-launch | Scott | $0 |
| 🟢 LOW | "User-reported" disclaimer implementation | Pre-launch | Scott | $0 |

---

## SOURCES AND CITATIONS

**Statutes:**
- 31 U.S.C. § 5330 (MSB registration requirement)
- 31 CFR § 1010.100(ff)(5) (money transmitter definition)
- 18 U.S.C. § 1960 (unlicensed MSB criminal prohibition)
- 18 U.S.C. §§ 1956, 1957 (money laundering)
- 50 U.S.C. § 1701 et seq. (IEEPA — OFAC authority)
- 47 U.S.C. § 230 (CDA §230)
- 22 U.S.C. § 611 et seq. (FARA)
- 2 U.S.C. § 1603 (LDA)
- Wyo. Stat. §§ 17-31-101 to 17-31-116 (Wyoming DAO LLC)
- N.M. Stat. § 2-11-1 et seq. (NM Lobbyist Regulation Act)
- 18 U.S.C. § 1951 (Hobbs Act)

**Regulations and Guidance:**
- FinCEN FIN-2019-G001 (May 9, 2019) — CVC business model guidance
- OFAC FAQ 559, 560 (2018) — virtual currency sanctions
- OFAC *Sanctions Compliance Guidance for the Virtual Currency Industry* (Oct. 2021)

**Enforcement Actions:**
- *In re Harmon* (D.D.C. 2020) — $60M FinCEN penalty against Bitcoin mixer
- *United States v. Sterlingov* (D.D.C. 2023) — Bitcoin Fog MSB conviction
- OFAC Tornado Cash Designation (Aug. 8, 2022)
- *United States v. Storm* (S.D.N.Y., Aug. 2023 indictment) — Tornado Cash criminal case

**Case Law:**
- *Fair Housing Council v. Roommates.com*, 521 F.3d 1157 (9th Cir. 2008) — §230 material contribution
- *Zeran v. AOL*, 129 F.3d 327 (4th Cir. 1997) — §230 foundational
- *Force v. Facebook*, 934 F.3d 53 (2d Cir. 2019) — §230 algorithmic curation
- *Twitter v. Taamneh*, 598 U.S. 471 (2023) — §230 scope
- *Van Loon v. Dep't of Treasury*, No. 23-50669 (5th Cir. Nov. 26, 2024) — Tornado Cash IEEPA limits
- *Barnes v. Yahoo!*, 570 F.3d 1096 (9th Cir. 2009) — §230 platform conduct

---

*This document was prepared by an AI research assistant and does not constitute legal advice. All findings should be independently verified by qualified legal counsel before reliance. Statutes, regulations, and enforcement postures may have changed after the research cutoff date.*

*Prepared for: Scott Hughes / Citeback — 2026-05-06*
