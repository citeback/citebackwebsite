# Citeback Legal Stress Test — Revised Funding Model
**Prepared:** 2026-05-06  
**Prepared by:** Remmy (AI Legal Stress-Test Analyst)  
**For:** Scott Hughes / Citeback — attorney briefing use only  
**Status:** Pre-attorney engagement analysis — NOT legal advice. For internal risk assessment only.

> **Scope:** This document stress-tests a revised funding model against the six legal risk areas analyzed in LEGAL-RESEARCH-2026-05-06.md. It does not replace that research; it supplements it. The attorney should receive both documents.

---

## THE MODEL BEING STRESS-TESTED

### Old Model (baseline from prior legal research)
- Graduated 3–5% platform fee collected by Wyoming DAO LLC on every campaign disbursement
- TEE holds and disburses campaign funds, with fee splitting to the LLC's operations wallet
- Wyoming DAO LLC financially benefits from every campaign that executes

### New Model (what this document analyzes)
1. **Pure pass-through:** Donations flow directly donor → campaign TEE wallet → vendor/attorney/printer. The Wyoming DAO LLC never holds, pools, controls, or receives any portion of campaign funds at any point.
2. **Zero platform fee on campaigns:** The LLC takes no percentage of donations. No fee is deducted from campaign funds.
3. **Voluntary tips:** Users who choose to support the platform may send a separate, entirely voluntary, unspecified-amount tip directly to the Wyoming DAO LLC. These are structurally separate from campaign funds and involve a separate wallet address.
4. **Scott's capital contributions:** Until tips cover operating costs, Scott personally contributes to the LLC for operating expenses (estimated ~$30/month VPS + domains + dev overhead).

---

## EXECUTIVE SUMMARY — DELTA ANALYSIS

| Risk Area | Old Risk Level | New Risk Level | Direction | Primary Driver |
|---|---|---|---|---|
| MSB/FinCEN | 🔴 CRITICAL | 🟠 HIGH | ⬇ IMPROVED | Zero-fee removes commercial aggravator; pass-through weakens custody analysis |
| OFAC | 🔴 CRITICAL | 🔴 CRITICAL | ↔ UNCHANGED | Structural screening impossibility survives; facilitation theory unaffected by fees |
| Wyoming DAO LLC | 🟡 MEDIUM | 🟡 MEDIUM | ↔ UNCHANGED | Core gaps (no federal shield, no case law) persist; tips-only slightly narrows liability surface |
| §230 | 🟠 HIGH | 🟡 MEDIUM | ⬇ IMPROVED | Platform no longer "funds" billboard content; economic participation argument eliminated |
| FARA/LDA | 🟡 MEDIUM | 🟡 MEDIUM | ↔ UNCHANGED | As expected; no new exposure created |
| Tax (tips) | *(new area)* | 🟡 MEDIUM | NEW | Tips are taxable income; label creates IRS characterization question; SE tax applies |

**Net assessment:** The revised model is meaningfully better on MSB and §230. It does nothing for OFAC, which remains the platform's most unresolvable structural risk. It creates a new, manageable tax question that requires attorney review. The weakest point in the entire new model is the OFAC facilitation theory — the platform's zero-fee posture does not change that operating the infrastructure that enables crypto to move from sanctioned donors to operators constitutes "engaging in" a prohibited transaction under OFAC's strict liability framework.

---

## SECTION 1: MSB / FinCEN

### Does the New Model Change the Money Transmission Analysis?

**Direction: IMPROVED — risk level drops from 🔴 CRITICAL to 🟠 HIGH**

**What the new model improves:**

*Removal of the fee aggravator.* The prior research flagged the 3–5% graduated fee as making the platform "look more like a commercial service than a passive infrastructure layer." This was listed as the fourth aggravating factor. The zero-fee model eliminates this aggravator entirely. FinCEN's enforcement history — Sterlingov (Bitcoin Fog), Harmon (Helix), Storm (Tornado Cash) — has focused on operators who charged fees or took economic benefit from transmission. A zero-fee infrastructure operator presents a different commercial profile, even if not a different legal profile.

*Strengthening the agent-of-the-payee exemption.* Under FIN-2019-G001 §4.5.1, the "agent of the payee" exemption requires: (1) sender intends to pay recipient directly; (2) agent has formal agreement with payee; (3) agent does not control when or whether funds are transmitted. Under the new model, the Wyoming DAO LLC is not extracting any value from the transmission. Its role is eligibility review and governance — arguably closer to a pure agent of the operator/payee than an economic intermediary. This is Citeback's best available argument and the new model strengthens it.

*The software-infrastructure framing.* The zero-fee, pure-pass-through model allows the platform to frame itself as providing software and governance infrastructure rather than a financial service. The TEE holds funds; the LLC provides the administrative layer. When the LLC takes no economic benefit from fund flows, the "what does the LLC actually do with money?" question has a clean answer: nothing. It never touches campaign funds.

**What the new model does NOT fix:**

*The functional test still applies.* FinCEN FIN-2019-G001 explicitly states: "The label applied to [a] business model does not determine the applicable regulatory treatment." The TEE software, deployed and maintained by Citeback, accepts XMR from donors and transmits it to operators. That function — accept value from A, transmit it to B — is the statutory definition of money transmission (31 CFR § 1010.100(ff)(5)), regardless of fees charged. The zero-fee model changes the economic profile, not the statutory function.

*FinCEN's non-custodial silence.* FIN-2019-G001 declined to create a blanket exemption for automated or software-based systems. There is still no FinCEN guidance specifically addressing whether TEE-mediated, zero-fee pass-through constitutes money transmission. This gap is not closed by the new model — it remains an unresolved question that requires a written attorney opinion.

*The "administrator" theory.* An entity that deploys and controls the software performing transmission can still be an MSB even without touching funds directly. FinCEN has consistently held that the responsible party is the entity that controls the system, not the specific mechanism (human vs. automated) used to move money.

**New legal questions the new model creates:**

1. *What is FinCEN's position on zero-fee automated crypto pass-through?* This is genuinely novel. There is limited guidance on whether a zero-fee, non-custodial infrastructure operator is an MSB. The 2019 FinCEN guidance did not squarely address this configuration. A FinCEN administrative ruling request is now a more viable strategy — a zero-fee, civil-liberties-infrastructure narrative is more sympathetic than a fee-charging commercial operation.

2. *Do voluntary tips to the LLC create their own MSB registration issue?* Tips go directly from a user to the Wyoming DAO LLC wallet. This is a one-direction, single-party payment — the LLC receives value but does not transmit it to a third party. This is not facially money transmission. Tips received by a business from customers are income, not transmission. **However:** If the LLC receives XMR tips and later converts or uses them, it may trigger Exchange MSB obligations under 31 CFR § 1010.100(ff)(1) if it exchanges CVC to fiat. This should be addressed in the attorney's MSB opinion — specifically, whether the LLC's receipt and management of XMR tips creates any separate MSB registration requirement independent of the campaign architecture.

**The weakest point in the new MSB argument:**

The voluntary tip characterization is legally fragile. FinCEN looks at economic substance, not labels. If a regulator can argue that tips are compensation for the platform's transmission services — i.e., users send tips because the platform provides a transmission service they value — the "tip" label collapses and the LLC is back to receiving fee revenue for money transmission services. See the Red Team section.

**Specific recommendation changes:**

The written MSB opinion remains non-negotiable before any wallet accepts funds. The new model does not eliminate the opinion requirement — it changes its focus. The attorney should now specifically address: (a) does zero-fee pass-through via TEE still constitute money transmission under 31 CFR § 1010.100(ff)(5); (b) is the agent-of-the-payee exemption stronger or determinative under the new model; and (c) does the LLC's receipt of XMR tips create a separate MSB issue independent of campaign architecture.

---

## SECTION 2: OFAC / Sanctions Exposure

### Does Pass-Through Change the Screening Impossibility Analysis?

**Direction: UNCHANGED — risk level remains 🔴 CRITICAL**

**The hard truth:** The revised funding model does not materially change the OFAC analysis. The legal theory for OFAC liability does not require Citeback to *receive* or *benefit from* prohibited transactions — it requires only that Citeback *engage in* transactions with SDN-listed parties. Operating the infrastructure through which SDN-linked funds flow constitutes engagement with a prohibited transaction under IEEPA and OFAC enforcement theory, regardless of whether Citeback collects a fee.

**What the new model does NOT change:**

*Facilitation theory survives.* OFAC enforcement has historically targeted facilitators — parties who enable prohibited transactions even without direct financial benefit. The Tornado Cash prosecution of Roman Storm proceeded on the theory that he *knowingly facilitated* OFAC-prohibited transactions by operating the infrastructure, not that he received the proceeds. Storm's financial benefit from TC operations was a separate basis for liability (unlicensed MSB); the OFAC theory was facilitation. Under the new model, Citeback still operates the infrastructure through which donor funds (potentially from SDN-linked parties) flow. That facilitation is OFAC-relevant regardless of fees.

*The structural screening gap is unchanged.* Monero's RingCT and stealth address protocols make it technically impossible to screen donors. The zero-fee model doesn't change Monero's cryptographic properties. The inability to screen remains, and OFAC's *Sanctions Compliance Guidance for the Virtual Currency Industry* (October 2021) is explicit that ToS prohibitions alone are insufficient — available controls must be implemented. The new model's only change to compliance posture is the removal of the economic stake in individual transactions, not the addition of any new screening capability.

*The strict liability exposure is unchanged.* OFAC civil penalties are strict liability per transaction. Maximum penalty is $368,136 per transaction (inflation-adjusted) or twice the transaction value, whichever is greater. This applies whether Citeback charges 5% or 0% — a prohibited transaction is a prohibited transaction.

**What the new model marginally affects:**

*Enforcement priority calculus.* OFAC enforcement is discretionary. The agency allocates resources to the highest-risk actors — those facilitating mass-scale sanctions evasion, generating significant transaction volumes, or serving clearly illicit purposes (DPRK hackers, ransomware groups, drug trafficking). A zero-fee civil liberties platform with operator-side KYC, documented compliance posture, and no economic stake in individual transactions is a meaningfully lower enforcement priority than Tornado Cash or Helix. This is not a legal argument — it is an enforcement discretion observation. But it is realistic.

*Good-faith mitigation credit.* OFAC's civil penalty guidelines give significant mitigation credit for "good faith" compliance efforts and "voluntary self-disclosure." A platform that charges no fees has less of a commercial incentive to look the other way on sanction violations. This contextual argument won't eliminate liability but would be presented to OFAC in any penalty settlement proceeding.

**New legal questions the new model creates:**

1. *If the Wyoming DAO LLC never receives campaign funds, is the LLC itself "engaging in" a prohibited transaction?* The legal theory would have to establish that operating the administrative infrastructure (website, operator onboarding, governance rules) without touching funds constitutes "engagement" in the underlying crypto transactions. This is a more attenuated theory than in the old model, where the LLC was literally receiving fee revenue from every campaign. The distinction is worth developing in the attorney's OFAC opinion.

2. *Does tip receipt create independent OFAC exposure?* If an SDN-listed individual sends a voluntary tip to the Wyoming DAO LLC, the LLC has received value from an SDN-listed party — that is a direct OFAC violation regardless of the amount or label. The LLC needs to implement OFAC screening for tip receipt to the same extent it screens operators. This is achievable (the tip wallet address can be treated like an operator wallet — OFAC screen before allowing tips), but it requires operational implementation.

**Specific recommendation changes:**

The written OFAC opinion remains non-negotiable. The attorney should now specifically address: (a) does the pass-through, zero-fee model change the OFAC facilitation theory; (b) is the LLC directly liable for SDN-linked tips received; and (c) whether a pre-launch voluntary disclosure to OFAC describing the structural screening gap and available mitigation measures would create a favorable enforcement posture. The voluntary disclosure strategy is worth exploring specifically for the new model — the lower commercial stakes and stronger civil-liberties-infrastructure narrative may make a voluntary disclosure more sympathetically received.

---

## SECTION 3: Wyoming DAO LLC — Liability and Governance Analysis

### Does the No-Fee, Tips-Only Model Change the LLC Analysis?

**Direction: UNCHANGED with minor improvements — risk level remains 🟡 MEDIUM**

**What the new model improves:**

*Narrower liability surface.* Under the old model, the Wyoming DAO LLC was directly receiving fee revenue from campaign disbursements — which tied it economically to every campaign outcome. Claims arising from a specific campaign (operator misconduct, false billboard claims) could potentially include a theory that the LLC was a financially interested party in the campaign's outcome and therefore exercised (or should have exercised) more control. Under the new model, the LLC has no economic stake in any individual campaign. This slightly narrows the factual basis for "LLC as co-venturing financial participant" theories.

*Cleaner separation of LLC activities from campaign funds.* The LLC now clearly does two things: (1) administrative/governance functions (campaign review, operator onboarding, website); and (2) receives voluntary tips for its own support. Campaign funds are completely separate. This makes it easier to argue that the LLC's liability shield applies to LLC activities (site management, governance) and that campaign outcomes are entirely the operators' responsibility.

**What the new model does NOT fix:**

*No federal shield.* Wyo. Stat. § 17-31-115 still explicitly preserves federal law applicability. FinCEN, OFAC, DOJ, and SEC enforcement reach the LLC regardless of its DAO designation. This is unchanged and unchangeable under Wyoming law.

*No criminal shield for Scott.* The LLC cannot protect Scott from personal federal criminal liability under 18 U.S.C. § 1960 (unlicensed MSB) or OFAC criminal violations. This is unchanged and is the most important cross-cutting risk from the prior research.

*No case law.* As of this research, there are essentially no reported cases interpreting the Wyoming DAO LLC statute against federal regulatory frameworks. This gap is not narrowed by the new funding model.

**New legal questions the new model creates:**

1. *Scott's capital contributions — piercing risk?* Scott personally contributing capital to fund LLC operating expenses is entirely standard LLC practice. Capital contributions are not income to the LLC, are not piercing-risk events, and establish Scott's basis in the entity. However: if Scott is repeatedly infusing capital into an LLC that is otherwise generating no revenue (and tips are minimal), a creditor or adversary might characterize the LLC as undercapitalized or as Scott's alter ego. The cure: document all capital contributions formally (capital account entries, written contribution agreements), ensure the LLC has separate bank accounts, maintain separate finances. No operational risk here if properly documented.

2. *Wyoming DAO LLC governance when revenue is entirely voluntary.* The DAO LLC statute requires a minimum operating agreement structure. Scott should confirm with counsel that the tips-based operating model is consistent with Wyoming DAO LLC requirements — specifically, whether a DAO LLC that derives all operating revenue from voluntary tips (rather than governed fees) still meets the statutory requirements for the DAO designation. There is no reason to expect a problem here, but it should be confirmed.

3. *NM foreign qualification — does Scott's capital contribution trigger nexus?* Already identified in prior research as an open question. Scott's personal capital contributions to a Wyoming LLC he operates from New Mexico almost certainly confirm "business nexus" in New Mexico for foreign qualification purposes. This strengthens the case that NM foreign qualification is required — the attorney should address this specifically.

**Specific recommendation changes:**

No material changes to prior recommendations. Add: (a) document Scott's capital contributions formally with written contribution agreements and LLC account entries; (b) confirm NM foreign qualification is required and file accordingly; (c) have attorney confirm the tips-based operating model is consistent with Wyoming DAO LLC statutory requirements.

---

## SECTION 4: §230 Immunity

### Does the Pass-Through Model Change the Billboard Campaign §230 Analysis?

**Direction: IMPROVED — risk level drops from 🟠 HIGH to 🟡 MEDIUM**

**This is the most significant §230 improvement in the new model.**

**The old model's §230 vulnerability for billboard campaigns:**

The prior research identified the core problem: when Citeback disbursed a platform fee (drawn from campaign donations) to its operations wallet after approving a billboard campaign, the LLC was *economically participating in the physical publication of that content*. A court could frame this as the LLC affirmatively choosing to financially support specific third-party content — which moves the analysis from "passive hosting" toward "publishing." The Roommates.com material contribution test asks whether the platform "materially contributes to the unlawful nature of" the content. Financial contribution to the creation of allegedly defamatory physical content is a more direct "material contribution" than simply hosting it online.

**What the new model fixes:**

Under pure pass-through, the Wyoming DAO LLC *funds nothing*. Donors' money goes directly to operators; Citeback receives zero from campaign disbursements. When an operator places a billboard, Citeback has not financially contributed to that billboard. The LLC's role is:
1. Eligibility review — does this campaign meet our published criteria?
2. Operator onboarding — is this operator real and OFAC-clean?
3. Infrastructure provision — the TEE software that executes the governance rules

None of these activities constitute "funding" billboard content. The platform is now firmly in the position of a hosting intermediary that reviews for eligibility (not accuracy), rather than an economic participant in the content's publication.

**The Roommates.com analysis under the new model:**

Under *Fair Housing Council v. Roommates.com*, 521 F.3d 1157 (9th Cir. 2008), a platform loses §230 when it "materially contributes to the unlawful nature of" the content. Under the new model:

- **Does Citeback fund the content?** No. Zero economic stake.
- **Does Citeback author or develop the content?** No. Operators write billboard content; Citeback reviews eligibility.
- **Does Citeback require or prompt the allegedly unlawful content?** No. The eligibility criteria screen for lawfulness, not illegality.
- **Does the eligibility review constitute "development"?** Under existing precedent: no. *Force v. Facebook*, 934 F.3d 53 (2d Cir. 2019) and *Twitter v. Taamneh*, 598 U.S. 471 (2023) both affirm that editorial curation and eligibility filtering do not transform a platform into a content developer.

The new model significantly strengthens Citeback's §230 posture for billboard campaigns. The platform is now more analogous to a governance layer over a community-funded project than to a financially participating publisher.

**What the new model does NOT fix:**

*Human editorial review still creates the Roommates.com tension.* The prior research correctly identified the tension between human editorial review (necessary for accountability and governance) and the material contribution risk. This tension is somewhat reduced — the platform is reviewing for eligibility, not deploying its own funds — but it is not eliminated. The key is maintaining the documented bright line: review for eligibility criteria (campaign type, target legitimacy, documentation adequacy), never for content accuracy. This procedural distinction is what preserves §230 under the new model.

*§230 exceptions are unchanged.* Federal criminal statutes, intellectual property, ECPA, and FOSTA-SESTA still fall outside §230. The new funding model does not change which claims are excepted.

**New §230 questions the new model creates:**

1. *Does pure pass-through affect the "interactive computer service" analysis?* No. The ICS definition is broad. A zero-fee platform is still an ICS. The new model makes no difference here.

2. *Does the absence of platform fee change the "information content provider" analysis?* This is the most interesting new §230 question. Under 47 U.S.C. § 230(f)(3), an "information content provider" is someone who is responsible, "in whole or in part, for the creation or development of information." Under the old model, one could argue the platform's financial stake made it a partial developer of the campaigns it funded. Under the new model, with no financial stake, the "responsible, in whole or in part" argument is significantly weaker. The platform is providing the infrastructure; operators and donors are providing the substance and funding.

**Specific recommendation changes:**

The §230 attorney review for billboard campaigns remains necessary, but the scope of concern has narrowed. The attorney should specifically note in their analysis that under the new zero-fee model, the "economic participation in content publication" theory — which was the most dangerous avenue — is eliminated. The residual analysis focuses solely on whether eligibility review (as distinct from content development) breaks §230, which is a much more favorable question under existing precedent.

---

## SECTION 5: FARA / Lobbying Disclosure Act

### Does the New Model Change the FARA/LDA Analysis?

**Direction: UNCHANGED — risk level remains 🟡 MEDIUM**

**As expected, no material change.** The FARA analysis in the prior research correctly identified that the platform's FARA exposure is low because the platform does not act "at the order, request, or under the direction or control" of any foreign principal — the two-element test under 22 U.S.C. § 611. This analysis does not change based on whether the platform charges a fee or operates on voluntary tips.

**Minor improvement:** Under the old model, one could construct (weakly) a theory that the fee-based commercial relationship between the LLC and campaign donors who might be foreign nationals created some form of compensated agency. Under the new model, the LLC receives no compensation from any campaign-related activity. Any "direction or control" theory is further attenuated because the LLC is not even compensated for its services from campaign participants.

**The operator-side FARA/LDA exposure is unchanged.** Operators engaging in legislative advocacy who receive campaign funds (regardless of whether those funds flow through a fee model or pass-through model) still need to evaluate their own FARA/LDA and state lobbying registration obligations. The platform's change in revenue model does not change the operators' legal status.

**No new legal questions created.** The new model does not change who directs Citeback's activities, who controls its governance, or how foreign funds interact with U.S. political activities. The prior research recommendations remain applicable without modification.

---

## SECTION 6: TAX TREATMENT OF VOLUNTARY TIPS

### New Area — Risk Level: 🟡 MEDIUM

*This area did not exist under the old model. The following analysis identifies the key issues that require attorney (ideally a CPA/tax attorney) review.*

**Threshold question: Wyoming DAO LLC tax classification**

The tax treatment of tips depends on how the Wyoming DAO LLC is classified for federal tax purposes. Wyoming DAO LLCs are LLCs — they default to IRS "check-the-box" entity classification:

- **Single-member LLC (Scott as sole member):** Disregarded entity for federal tax purposes. All income and expenses flow through to Scott's personal return (Schedule C). Tips = self-employment income. Scott deducts business expenses. Self-employment tax (15.3% on net earnings up to the SS wage base, 2.9% above) applies.
- **Multi-member LLC:** Partnership by default. Pass-through to members via K-1. Each member reports their share of tips as ordinary income.

Assumption for this analysis: Single-member LLC (Scott is the sole member until the platform has meaningful community governance). This is almost certainly the current structure.

**Are voluntary tips to a for-profit LLC taxable?**

Yes, unambiguously. IRS guidance is clear: voluntary payments received by a for-profit entity in connection with its business operations are taxable income regardless of label. The "tip" label does not transform income into a tax-exempt gift. Under 26 U.S.C. § 102, gifts are excluded from income only if they are "made out of detached and disinterested generosity" — payments made by users because they value and want to support a service they use are not gifts under the Duberstein standard (*Commissioner v. Duberstein*, 363 U.S. 278 (1960)). They are compensation for services rendered or incentives for service continuation, which is taxable income.

**IRS characterization risk: "Tips" vs. "Donations" vs. "Revenue"**

There is a meaningful IRS characterization question here, though none of the characterizations are tax-favorable for Scott:

| Label | IRS Treatment | Risk |
|---|---|---|
| "Tips" | Business income (Schedule C) | Standard SE tax applies |
| "Donations" to for-profit | Same as tips — still business income | "Donation" label has no legal effect for for-profit entity |
| "Revenue" | Business income (Schedule C) | No difference from tips in practice |
| "Gift" | Potentially excluded — but fails Duberstein test | Cannot successfully argue this; creates audit risk |

**The actual risk:** The characterization question creates audit attention if Scott (a) labels them "donations" in marketing (implying tax-deductible contributions, which they are not for a for-profit entity) or (b) attempts to treat them as non-taxable gifts on his return. Neither is appropriate. If Citeback's website describes tips as "donations" to create a false implication of deductibility, that creates donor-side misrepresentation risk in addition to IRS characterization risk.

**Recommendation:** Call them what they are: voluntary contributions to support platform operations. Do not use the word "donation" in any context that implies tax deductibility. The LLC should issue receipts that clearly state: "This contribution is NOT tax-deductible. Citeback is a for-profit Wyoming LLC, not a 501(c)(3) organization."

**Scott's capital contributions — tax treatment**

Scott contributing personal funds to his single-member LLC creates no taxable event. Capital contributions to an LLC by a member increase the member's basis in the LLC interest (26 U.S.C. § 722) but are not income to the LLC (or to Scott as the pass-through entity). When Scott eventually withdraws capital (as opposed to earnings), distributions up to basis are not taxable — they are return of capital.

There is no IRS characterization risk with capital contributions. The risk is purely bookkeeping: Scott must maintain clear records of (a) what was contributed as capital (not deductible business expense), (b) what were business expenses (deductible), and (c) what were earnings/distributions (taxable when distributed, if ever). A simple spreadsheet maintained from day one eliminates this risk.

**New Mexico state tax implications**

Scott operates from New Mexico. New Mexico's Gross Receipts Tax (NM GRT) applies to receipts from selling goods or services in New Mexico (N.M. Stat. § 7-9-3.5). The GRT rate is approximately 5% on gross receipts. If the Wyoming DAO LLC is foreign-qualified in NM (as recommended), and the LLC's tip income is considered "receipts" from services provided in NM, NM GRT applies to tip income received. This should be addressed in the NM foreign qualification attorney analysis.

New Mexico personal income tax would also apply to Scott's pass-through income from the LLC at NM's graduated rate (up to 5.9% for 2026).

**Practical scale**

At ~$30/month in operating costs, the volume of tips needed to cover operations is small. Tax compliance at this scale is minimal. The issue scales if the platform succeeds and tips become substantial. The attorney should establish a simple bookkeeping and estimated-tax payment framework from day one so Scott isn't surprised at tax filing.

**Specific recommendations for tips taxation:**

1. **Do not use the word "donation."** Use "tip," "voluntary contribution," or "support." Add a clear disclosure: "Contributions to Citeback are not tax-deductible."
2. **File Schedule C from year one.** Report all tip income. Deduct all legitimate business expenses (VPS, hosting, domains, software subscriptions, attorney fees, etc.).
3. **Make quarterly estimated tax payments** (Form 1040-ES) if annual tax liability on platform income exceeds $1,000. This avoids underpayment penalties.
4. **Document capital contributions separately** from business expenses in LLC records.
5. **Get CPA or tax attorney review** before year-one filing. The DAO LLC structure combined with XMR receipt and pass-through creates enough novelty that a tax professional familiar with crypto should review the treatment — especially if XMR tips are received at one price and converted/used at another (capital gains potential on crypto holdings).
6. **Monitor IRS virtual currency guidance.** The IRS has issued annual guidance on crypto taxation since Notice 2014-21. The attorney's scope should include current guidance on crypto receipts and conversions.

---

## RED TEAM SECTION: FinCEN Examiner / DOJ Attorney Attack Analysis

*You are a FinCEN examiner or DOJ trial attorney. Where do you attack this model?*

### Attack 1: "The TEE Is Not a Person. Citeback Is."

**The theory:** 31 CFR § 1010.100(ff)(5) applies to persons "who engage in the business of accepting and transmitting currency." The TEE is not a person. The person who deploys, operates, updates, and controls the TEE software is Citeback (Wyoming DAO LLC, operated by Scott Hughes). When the TEE accepts XMR from a donor and transmits it to an operator's wallet, *Scott Hughes* — through his software — has accepted and transmitted value.

**Supporting facts I would use:** (1) Scott writes and deploys the TEE code. (2) Scott reviews and approves campaigns before the TEE creates wallets. (3) Scott determines the disbursement rules coded into the TEE. (4) Scott can update the TEE software (within governance limits). (5) FinCEN FIN-2019-G001 explicitly states that automated systems do not escape the functional test.

**The Sterlingov analogy:** Roman Sterlingov did not personally touch every Bitcoin that passed through Bitcoin Fog. He operated the software that did. He was convicted. Same theory applies here.

**Why this attack is strong:** It is consistent with settled FinCEN doctrine. The "automation doesn't create a safe harbor" principle is explicit in FIN-2019-G001 and has been applied in enforcement actions. The zero-fee model weakens *one* aggravating factor but doesn't address the core theory.

**How Citeback would defend:** Agent-of-the-payee exemption; software-infrastructure provider framing; community governance as evidence of distributed control; civil liberties mission as relevant to enforcement discretion. These are partial defenses, not complete shields.

---

### Attack 2: "The Tips Are Just Fees With a Different Name"

**The theory:** OFAC and FinCEN look at economic substance, not legal form. Under *Gregory v. Helvering*, 293 U.S. 465 (1935) and its progeny, courts "look through" form to substance in regulatory analysis. Citeback provides a money transmission service. Users send "tips" because they value that service and want it to continue. The economic substance of tips is compensation for services — i.e., fees. The structure is a deliberate attempt to disguise MSB fee revenue as voluntary contributions to avoid MSB scrutiny.

**Supporting facts I would use:** (1) Tips are solicited on the platform, creating a commercial dynamic. (2) The platform would not survive without tips or Scott's capital — the tips are functionally necessary for operations. (3) Users sending tips are motivated by their stake in the platform's continued operation (they have active campaigns, they are regular donors). (4) There is no genuine "disinterested generosity" — tip senders benefit from the platform's continuation. (5) The fee model change occurred *after* legal scrutiny raised MSB registration questions.

**The timing argument:** If Citeback operated under a fee model, received legal advice identifying MSB risk, and then changed to a tips model specifically to avoid MSB classification, FinCEN or a prosecutor could argue the change was a bad-faith structuring device rather than a genuine business model revision. The timing of the model change relative to legal research will be discoverable.

**Why this attack is serious:** The substance-over-form principle is well-established. If the economic reality is that users are paying Citeback for transmission services through a nominally voluntary tip structure, FinCEN could treat tips as fees for MSB purposes.

**How Citeback would defend:** Tips are genuinely voluntary (no required amount, no required payment, no service withdrawal for non-tippers). Many platforms receive entirely voluntary support (Wikipedia, Signal) without being characterized as fee-for-service operators. The tips are structurally separate from campaign funds — they go to a different wallet, for a different purpose (platform operations). The temporal coincidence of the model change with legal research is circumstantial at most.

**Attorney note:** The attorney should advise whether documenting the *independent business rationale* for the tips model (e.g., reducing MSB registration risk IS a legitimate business reason, but so is mission alignment with civil liberties values) would be helpful or harmful.

---

### Attack 3: "Pass-Through Is Still Transmission — Conduit Arrangements Are Not Safe"

**The theory:** The concept of a "conduit" arrangement — an intermediary who passes funds from A to B without holding them — is well-understood in FinCEN doctrine. Wire transfer networks are conduits. They are still MSBs (or bank-equivalent regulated entities). The fact that funds "pass through" does not create an exception to money transmission. FinCEN's 2019 guidance specifically addressed this: "whether a person operates on its own behalf or on behalf of another person" is not the determinative question.

**Supporting facts I would use:** Payment processors (Visa, Stripe) are also "pass-through" and are regulated. The fact that campaign funds go donor→TEE→operator rather than donor→Citeback→operator is a technical routing distinction, not a legal one. Citeback controls the routing rules. Citeback approves which operators receive funds and when. Citeback defines the disbursement conditions. The conduit is Citeback's conduit.

**Why this attack is serious:** The conduit analogy is legally sound. Pass-through routing has never been a recognized exemption from money transmission. The payment processor exemption (31 CFR § 1010.100(ff)(5)(ii)(B)) does not apply here (it requires clearance and settlement systems for goods/services sales). Citeback has no clean safe harbor.

**How Citeback would defend:** The "conduit" characterization applies most cleanly when an entity controls routing. In Citeback's model, disbursement conditions are community-governed, not platform-controlled. The platform executes rules; the community sets them. This is more like a multi-party smart contract than a conduit — but FinCEN has never accepted this distinction in formal guidance.

---

### Attack 4: "Willful Blindness by Architectural Design"

**The theory:** For criminal MSB violations (18 U.S.C. § 1960) and criminal OFAC violations, *knowledge* is required. However, courts have consistently held that willful blindness satisfies the knowledge requirement. When a platform is specifically designed to make it impossible to screen donors — choosing Monero precisely because it conceals sender identity — that architectural choice may constitute willful blindness to the sanctions status of donors.

**The Storm/TC parallel:** This is exactly the theory DOJ is using in *United States v. Storm*. The government's position is that Roman Storm knew TC processed DPRK funds and continued operating anyway. Applied to Citeback: if Scott knows (and he demonstrably does, because this is documented in platform governance) that Monero makes donor screening impossible, and he knows OFAC sanctions are strict liability, and he proceeds anyway — that pattern is willful blindness.

**Supporting facts I would use:** GOVERNANCE.md §9.3 explicitly states: "it is technically impossible to link an incoming donation to an SDN-list identity." This document was written by Scott (via his AI assistant) and reflects his actual knowledge. He knows he cannot screen donors. He chose this architecture anyway. That is a documented fact that I would use in a willful blindness argument.

**Why this attack is the most dangerous one in the entire model:** It converts a structural compliance gap into a potential criminal intent argument. The more thoroughly Citeback documents that it *knows* about the OFAC screening impossibility (as it should, for good-faith compliance documentation), the more it documents Scott's *knowledge* of operating with an OFAC compliance gap. There is a genuine tension between documentation-as-compliance and documentation-as-evidence.

**How Citeback would defend:** Willful blindness requires more than knowing a gap exists — it requires conscious disregard of a *known high probability* of prohibited activity. Citeback's architecture is not designed to *attract* SDN-linked funds; it is designed to serve civil liberties missions. The operator-side KYC and OFAC screening demonstrates affirmative compliance effort. Voluntarily disclosing the structural gap to OFAC pre-launch (recommended in prior research) is strong evidence against willful blindness. The platform is using the maximum technically feasible screening; it cannot be required to use screening that would destroy its core functionality.

**However:** This defense has not been tested in court against a privacy-coin platform with documented knowledge of its screening gap. It is an untested argument in a field where the government has been winning.

---

### Attack 5: "Wyoming DAO LLC Does Not Isolate Scott from Liability"

**The theory:** This is not novel — it is established law. *Sterlingov*. *Storm*. The individual who operates an unlicensed MSB is personally liable under 18 U.S.C. § 1960 regardless of whether they operate through an entity. The Wyoming DAO LLC does not create a federal criminal shield. Scott Hughes, as the sole operator of Citeback, is personally exposed under § 1960 if Citeback constitutes an unlicensed MSB.

**Why I include this in the red team:** Because it is the most personally consequential attack, and because the new funding model does not change it at all. Every improvement in the model that reduces the platform's MSB risk also reduces Scott's personal exposure — but the entity form itself provides zero protection on the criminal side.

---

## CONSOLIDATED ATTORNEY BRIEFING ADDENDUM

The following questions are newly created or materially changed by the new funding model and should be added to the attorney briefing:

**MSB/FinCEN addendum:**
1. Does a zero-fee, pure-pass-through TEE architecture still constitute money transmission under 31 CFR § 1010.100(ff)(5) and FIN-2019-G001?
2. Is the agent-of-the-payee exemption (FIN-2019-G001 §4.5.1) stronger or determinative under the new model? What additional facts would strengthen it?
3. Does the Wyoming DAO LLC's receipt of XMR voluntary tips create any separate MSB registration requirement (e.g., as a CVC exchanger if tips are converted)?
4. Is a FinCEN administrative ruling request viable and advisable under the new model? What would the ruling address?
5. Does the timing of the model change (from fee-based to tips-based) create any "bad faith structuring" argument that FinCEN could use?

**OFAC addendum:**
6. Under the new zero-fee model, does the Wyoming DAO LLC still "engage in" prohibited transactions by operating the infrastructure (as distinguished from receiving fee revenue from those transactions)?
7. Is pre-launch voluntary disclosure to OFAC advisable? If so, what should the disclosure describe?
8. Does receiving XMR tips create a separate OFAC obligation? What screening procedure should apply to tip receipt?

**§230 addendum:**
9. Under the new model (zero fee, no economic participation in campaign outcomes), does the "material contribution to unlawful content" analysis still apply to billboard campaigns? What is the analysis under Roommates.com?
10. Does the absence of platform fee change the "information content provider" analysis under 47 U.S.C. § 230(f)(3)?

**Tax addendum:**
11. What is the correct tax classification of voluntary tips received by a single-member Wyoming DAO LLC for federal income tax purposes?
12. Is there any risk that the IRS could characterize tips as "fees" for MSB services for tax purposes (separate from FinCEN classification)?
13. What are Scott's quarterly estimated tax obligations given the tip-plus-capital-contribution structure?
14. Does NM Gross Receipts Tax apply to tip income received by the LLC?
15. Are there any crypto-specific tax events triggered by receiving XMR tips (e.g., cost basis at receipt, capital gain/loss on subsequent use of XMR for business expenses)?

---

## BOTTOM LINE RISK ASSESSMENT — NEW MODEL

**Where the new model is genuinely better:**
- MSB profile is improved: zero-fee removes the most commercially aggravating factor; pass-through strengthens the agent-of-the-payee exemption argument
- §230 is materially stronger for billboard campaigns: no economic participation eliminates the strongest "funding = publishing" theory
- The platform's civil liberties narrative is cleaner when it's genuinely not profiting from campaigns

**Where the new model changes nothing:**
- OFAC facilitation theory is unchanged; strict liability exposure per prohibited transaction survives
- Donor-side screening is still structurally impossible
- Wyoming DAO LLC provides no federal criminal shield for Scott regardless of revenue model
- The core architecture (anonymous XMR donors → TEE → identified operators) creates the same fundamental regulatory questions

**The model's weakest point:**
The voluntary tip characterization is legally fragile and will be the first thing an adversarial regulator challenges. If FinCEN or a DOJ attorney can establish that tips are economically equivalent to fees for transmission services, the substance-over-form principle collapses the new model's primary MSB improvement. The attorney should analyze this specific vulnerability and advise whether the tips structure requires additional safeguards (e.g., documented absence of any relationship between tip amount and service access; clear platform statements that tips are not required; ensuring non-tippers receive identical service).

**Pre-launch gates remain unchanged:**
1. Written MSB opinion (now updated to address zero-fee pass-through and tips)
2. Written OFAC opinion (now also addressing tip receipt and pre-launch voluntary disclosure)
3. Wyoming DAO LLC formation
4. Tax structure advice (new requirement under revised model)

The new model does not reduce the urgency of these pre-launch gates. It changes their scope but not their necessity.

---

*This document was prepared by an AI research assistant and does not constitute legal advice. All findings should be independently verified by qualified legal counsel before reliance. The red team arguments in this document represent adversarial legal theories that a hostile regulator or prosecutor could advance — they are not predictions of enforcement, and the strength of countervailing arguments has been noted where applicable.*

*Prepared for: Scott Hughes / Citeback — 2026-05-06*
