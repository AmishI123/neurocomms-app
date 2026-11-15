# Helper Jobs design and implementation audit

## Source material

The product requirements come from `Helper Jobs — App Specification.pdf` (9 pages, 25 October 2026). It defines a shared-tablet outing tool for Pragnya adults and volunteer leads, with a coordinator-facing model later.

## Borrowed visual and delivery system

The inherited communication app is archived at `archive/communication-tool/`; its presentation and handout surfaces are at `archive/presentation/`. The new app reuses the following design decisions:

- Fraunces for warm editorial display headings, with a system sans-serif for controls and instructions.
- Paper `#f3ede2`, surface `#fbf7f0`, ink `#2b2622`, muted `#5a5047`, rust `#9a4a22`, peach `#e3b98f`, and plum focus treatment.
- Thin warm borders, compact radii, tactile cards, restrained shadows, large section dividers, eyebrow labels, and a calm editorial landing page.
- Picture-led cards and hand-drawn-feeling illustration blocks instead of dense dashboard chrome.
- Responsive single-column behavior, visible focus states, reduced-motion support, forced-colors support, and generous touch targets.
- Static hosting compatibility: no build dependency is needed for the prototype; the same directory can be served by the inherited static hosting patterns.

## Journeys covered in the first slice

### Helper

Landing → Helper mode → photo identity → permitted Level 1 jobs → one step per screen → read aloud → fixed Help → Stop anytime → Done → smiley → badge → another job or finish.

### Volunteer lead

Landing → Lead mode → four-digit PIN → live board → visible Help alert → snack check reminder → wrap-up note per helper.

## Safety and accessibility decisions represented

- Help is fixed to the same bottom-right location and produces a persistent lead-facing alert state.
- Stop anytime is available in helper flows.
- Locked Level 2 and Level 3 jobs visibly explain that coordinator approval is required.
- The helper sees first names only in the prototype; kid-sensitive records are intentionally not implemented in helper mode.
- One action is emphasized per screen, with large buttons and no rushing timer.
- Read-aloud uses browser speech synthesis when available and fails quietly when unavailable.
- The color system has non-color text labels for statuses and supports reduced motion and forced colors.

## Follow-on implementation gates

The next implementation slice should add local-first persistence, real outing/assignment records, coordinator-managed kid snack permissions, an acknowledgment path for Help alerts, explicit volunteer matches required before saving assignments, offline sync queues, consent/retention controls, and a coordinator web surface. Those are product gates, not cosmetic enhancements.
