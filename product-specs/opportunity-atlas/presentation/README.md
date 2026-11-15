# Findings and product plans

Open `index.html` directly, or serve the repository and visit `/product-specs/opportunity-atlas/presentation/`.

## Files

- `executive-report.html`: nine-area synthesis, examples, sources, limits, and decisions.
- `conference.html`: 17 slides, source links, speaker notes, and print support.
- `products.html`: proposed products, tradeoffs, dependencies, alternatives, and build sequence.
- `briefs/`: nine complete proposed product requirements documents.
- `content.mjs`: editable plain-English area and product content.
- `build.mjs`: builds all HTML pages from the content and saved source lists.
- `presentation.css`: screen and print layouts.
- `slides.js`: speaker-note toggle and browser print action.
- `conference.pdf`: checked 17-page print copy of the talk.
- `executive-report.pdf`: 18-page report copy with source sections expanded.
- `verification.md`: checks performed and remaining limits.

Run `node product-specs/opportunity-atlas/presentation/build.mjs` from the repository root after editing source content. Do not hand-edit generated HTML: the next build replaces it.

The build command creates HTML only. Regenerate PDFs with the browser after content changes. Expand source sections before printing the executive report. The saved PDF copies reflect the documented review date.

## Reading and presenting

The executive report supports detailed reading. The talk is a shorter presentation with one area per slide. Open individual speaker notes or use Show speaker notes. Print slides / save PDF invokes the browser print dialog. The print stylesheet hides notes and puts each slide on a new page.

All pages use local assets and can be read without an internet connection. External source links require internet access. There are no remote fonts, analytics, or model calls in the presentation.

## Evidence status

This is a synthesis of the saved project material. It does not independently revalidate every external reference. Source rechecking, equal-depth community research across areas, participant sessions, and venue-specific conference preparation remain future work. Examples are fictional. Proposed requirements and test criteria are not completed product tests.

The existing communication-access card app is linked as prior implementation; no other new product app is created by this package. The presentation itself is the current deliverable.
