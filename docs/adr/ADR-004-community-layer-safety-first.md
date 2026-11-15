# ADR-004: Safety-first community layer for neurodivergent young people

Status: Proposed
Date: 2026-10-17
Owners: product/backend thread; frontend and voice threads are contributors

## Decision

Build the first community layer as a moderated, pseudonymous, age-banded support space with structured group participation and explicit trusted-adult pathways. Do not begin with open direct messages, public profiles, adult-to-child matching, algorithmic discovery, or an always-on feed.

The initial product is for ages 13–17, split into 13–15 and 16–17 spaces. Under-13 access is out of scope for the first release because COPPA, parental consent, age assurance, and child-safety obligations materially change the product and operating model. Adults may participate only as verified, role-limited support-network members or trained moderators; they are never discoverable as peer contacts.

## Context and research basis

The existing product already has a local-first, review-first, privacy-bounded model. A community layer introduces a different risk class: identity, contact, harassment, grooming, self-harm, medical misinformation, doxxing, and pressure to move conversations off-platform.

Research indicates that online support can be useful as a complement to in-person support, especially when written communication, flexible timing, and knowledgeable coaches are available. Co-designed neurodivergent peer-support work also emphasizes belonging, authenticity, self-advocacy, and neurodivergent leadership. These benefits do not justify unmoderated contact; they justify a carefully bounded, participatory design.

Relevant platform patterns:

- TikTok uses private-by-default teen accounts, disables direct messages for under-16 accounts, limits live access to adults, and provides Family Pairing.
- Reddit requires users to be at least 13 globally, applies additional teen protections, and gates mature content. Its age and child-data enforcement history shows that self-declared age alone is not a sufficient safety plan.
- Discord uses teen safety alerts for first-time DMs, message-request protections, Family Center, and explicit prohibitions on grooming and teen dating spaces. Its hybrid of public servers, semi-private groups, voice, and DMs demonstrates why our MVP should avoid equivalent open contact surfaces.
- YouTube uses supervised accounts, age-appropriate content settings, and additional restrictions for content featuring or uploaded by minors.

The UK ICO Children's Code calls for the child's best interests, high-privacy defaults, data minimisation, limited sharing, geolocation off by default, transparent policies, and careful use of profiling and nudges. COPPA requires notice and verifiable parental consent when a covered service collects personal information from children under 13.

Sources:

- [FTC COPPA parental consent guidance](https://www.ftc.gov/business-guidance/privacy-security/verifiable-parental-consent-childrens-online-privacy-rule)
- [ICO Age Appropriate Design Code](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/)
- [TikTok community controls](https://www.tiktok.com/safety/community-controls/)
- [TikTok guardian guide](https://www.tiktok.com/safety/guardians-guide/)
- [Reddit teen safety principles](https://support.reddithelp.com/hc/en-us/articles/50409255286164-Our-Principles-for-Teen-Safety)
- [Discord teen and child safety policy](https://discord.com/safety/child-safety-policy-explainer)
- [YouTube child safety policy](https://support.google.com/youtube/answer/2801999)
- [Internet-based ADHD/autism support study](https://pmc.ncbi.nlm.nih.gov/articles/PMC5774035/)
- [Co-designed neurodivergent student-led peer support](https://journals.sagepub.com/doi/10.1177/27546330231205770)

## Product consequences

1. Safety is a product capability, not a moderation page. Every interaction must have an age-band, visibility, reporting, and escalation policy.
2. The child controls what is shared with a trusted adult. Guardian visibility is transparent and bounded; it is not silent surveillance.
3. “Support network” means verified role-based adults such as a parent/guardian, school staff member, clinician, or approved community worker. It does not mean searchable adult strangers.
4. The service must be useful without diagnosis disclosure. Users can choose support preferences and interests without declaring a diagnosis.
5. The system must preserve an audit trail for moderation decisions while minimising retained child content.

## Rejected alternatives

- Open Discord-like servers with unrestricted DMs: too much contact and moderation risk for the first release.
- A public social feed: encourages engagement optimisation, popularity pressure, and uncontrolled discovery.
- Diagnosis-based matching: exposes sensitive health information and invites stereotyping.
- AI-only moderation: insufficient for grooming, coercion, self-harm, or context-heavy neurodivergent communication.
- Automatic guardian access to all messages: conflicts with trust, autonomy, and minimum-necessary disclosure.

## Consequences

The MVP will feel smaller than a conventional social network. That is intentional. It can establish whether structured, moderated peer support is useful before adding additional communication surfaces. A launch requires a safeguarding lead, documented response SLAs, trained moderators, age-assurance/privacy review, and a jurisdiction-specific legal review.
