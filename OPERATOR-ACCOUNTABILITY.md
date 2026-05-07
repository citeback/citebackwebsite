# OPERATOR ACCOUNTABILITY PROTOCOL
**Citeback — Wyoming DAO LLC (in formation)**
**Version:** 0.1 — Pre-Launch Draft
**Status:** Pending community review and ratification before first operator onboarding
**Last Updated:** 2026-05-07

---

## Purpose

This document defines the process by which the Citeback community can challenge operator decisions — including campaign approvals, campaign rejections, and operator onboarding denials. It is a required governance prerequisite (GOVERNANCE.md Launch Prerequisites §11) before any operator is onboarded.

---

## 1. What Decisions Are Subject to Challenge

The following platform entity decisions can be challenged by any community member:

| Decision Type | Challenge Path |
|---|---|
| Campaign proposal approved — community believes it violates guidelines | Misconduct report (§8 of GOVERNANCE.md) |
| Campaign proposal rejected — operator believes rejection was improper | Campaign Rejection Appeal (§2 below) |
| Operator onboarding denied — applicant believes denial was improper | Onboarding Denial Appeal (§3 below) |
| Platform entity conduct — any pattern suggesting guidelines abuse | Misconduct report (§8 of GOVERNANCE.md) |

Governance votes, disbursement decisions, and TEE execution are **not** platform entity decisions — they are community or architecture-level decisions and are not subject to this protocol.

---

## 2. Campaign Rejection Appeals

### 2.1 Trigger
An operator whose proposal was rejected may initiate a Campaign Rejection Appeal if they believe the rejection:
- Was not based on a published platform guideline
- Applied a guideline incorrectly or inconsistently
- Was motivated by political valence, controversy, or embarrassment to specific actors

### 2.2 Process

**Step 1 — Request written reason (if not provided)**
Operators must request a written rejection reason via citeback@proton.me before filing an appeal. The platform entity has a **72-hour SLA** to provide a written reason.

**Step 2 — File appeal to governance interface**
The operator publishes the rejection notice (including stated reason) to the community governance interface. This triggers a community review period.

**Step 3 — Community review (7 days)**
The platform entity must publicly respond to the appeal within the governance interface within **48 hours** of filing.

**Step 4 — Major-tier community vote (if not resolved)**
If no resolution after 7 days, a Major-tier vote (60% supermajority, 25-voter quorum, 7-day window) may overrule the platform entity's rejection. If the vote passes, the proposal is published.

### 2.3 Platform Entity May Not Reject Based On
- Political valence of the campaign target
- Potential embarrassment to governments, corporations, or individuals in power
- Controversy alone (provided campaign meets published guidelines)
- Retaliatory motives (prior challenge history, criticism of the platform, etc.)

### 2.4 Grounds for Upholding a Rejection
- Campaign type not permitted under GOVERNANCE.md §3
- Campaign targets a private individual (not a government entity, government program, or government-contracted surveillance vendor)
- Operator failed to pass identity verification or OFAC pre-screening
- Campaign description contains materially false or fraudulent factual claims
- Campaign would fund activities that are clearly unlawful in the target jurisdiction
- Campaign violates the Immutables (GOVERNANCE.md §15)

---

## 3. Operator Onboarding Denial Appeals

### 3.1 Trigger
An applicant denied operator onboarding may file an Onboarding Denial Appeal if they believe the denial:
- Was not based on objective identity, OFAC, or entity verification failure
- Was discriminatory, politically motivated, or applied inconsistently

### 3.2 Scope Limitation
Onboarding denials due to the following are **not appealable**:
- OFAC SDN list match (regulatory requirement — cannot be overridden by community vote)
- Identity verification failure (applicant unable to provide required documents)
- Failure to execute the operator agreement

Appeals are only available for denials asserted to be discretionary, political, or arbitrary.

### 3.3 Process

**Step 1 — Request denial reason**
Applicant requests written denial reason from citeback@proton.me. **72-hour SLA.**

**Step 2 — File to governance interface**
Applicant publishes denial notice and stated reason (redacting any private identity information) to the governance interface.

**Step 3 — Platform entity response**
Platform entity must respond publicly within **48 hours** confirming or adding to the stated reason.

**Step 4 — Major-tier community vote**
Community may vote to override the denial (60% supermajority, 25-voter quorum, 7-day window). A passed override requires the platform entity to admit the applicant and complete onboarding.

### 3.4 Identity and OFAC Override Prohibition
No community vote may override an OFAC SDN list match. This is an immutable compliance requirement. Any attempt to do so via governance vote is void.

---

## 4. Misconduct Reports Against the Platform Entity

Community members may file a misconduct report against the platform entity under GOVERNANCE.md §8 for:
- Pattern of improper campaign rejections
- Selective application of guidelines (political bias)
- Failure to comply with appeal outcomes
- Governance interference (using emergency pause to suppress votes)
- Misuse of OFAC pre-screening as a pretext for political exclusion

Filing requirements and resolution process are identical to operator misconduct reports (GOVERNANCE.md §8.1–8.3), with the following modifications:

- **Bond:** Waived for the first misconduct report against the platform entity per calendar year
- **Respondent:** Platform entity (Wyoming DAO LLC) — not an individual operator
- **Resolution:** A confirmed misconduct finding against the platform entity is published permanently in the platform's public governance log
- **Escalation:** Three confirmed misconduct findings within 24 months trigger a mandatory Governance-tier vote on whether to appoint a community oversight committee with veto rights over platform entity decisions

---

## 5. SLAs Summary

| Action | SLA |
|---|---|
| Rejection reason provided | 72 hours |
| Platform entity appeal response | 48 hours |
| Onboarding denial reason provided | 72 hours |
| Onboarding denial response to appeal | 48 hours |
| §8 misconduct resolution | 7 days (community vote window) |

SLA breaches do not automatically resolve the appeal in the appellant's favor — they are grounds for escalation to a Major-tier community vote on the merits.

---

## 6. Anti-Retaliation

The platform entity may not penalize operators or applicants for:
- Filing Campaign Rejection Appeals
- Filing Onboarding Denial Appeals
- Filing misconduct reports against the platform entity
- Criticizing the platform entity publicly

Any evidence of retaliation is itself grounds for a misconduct report.

---

## 7. Publication and Ratification

This document must be published at a public URL (citeback.com/operator-accountability or linked from the governance documentation) and community-reviewed before the first operator is onboarded. It does not require a governance vote for initial publication — Scott Hughes (founding operator) may ratify it unilaterally as a bootstrap governance act per GOVERNANCE.md §14. However, material changes after first operator onboarding require a Major-tier vote.

---

## Related Documents

- `GOVERNANCE.md` — Full governance specification (§8 Misconduct, §9 Platform Entity)
- `TOS_DRAFT.md` — Terms of Use (pending attorney review)
- `PRE-LAUNCH.md` — Launch prerequisites checklist
