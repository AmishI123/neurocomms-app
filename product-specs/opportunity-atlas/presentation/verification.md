# Presentation package checks

Checked on 15 September 2026.

## Scope

- 13 new HTML pages: home, report, talk, comparison, and nine product briefs.
- Nine briefs each contain three concepts, four screens, four product-specific feature checks, common requirements, failure cases, information handling, build order, and review questions.
- The conference talk has 17 slides and 17 speaker-note sections.
- The end-to-end goal identifies source review, product choice, building, engineering checks, accessible review, and the decision to continue, revise, or stop.

## Checks performed

- Rebuilt all 13 HTML pages with Node 18.19.1.
- Opened all 13 in Playwright Chromium from local files.
- Verified one main heading per page and that local page, stylesheet, and script targets exist.
- Checked page width at 1280px and 375px: no page-level horizontal overflow. Wide tables scroll within their own labelled regions.
- No browser JavaScript errors occurred.
- Show speaker notes opened all 17 notes; Hide speaker notes closed them.
- Saved desktop screenshots of the index and talk and a phone screenshot of a product brief in `qa/`.
- Exported the talk to PDF and confirmed 17 pages, one slide per page, with text on every page.
- Exported the executive report with sources expanded; confirmed 18 pages.
- Reviewed the desktop index visually. Automated layout checks are not a full accessibility assessment or user review.

Chromium initially could not find system libraries. The successful run used the existing libraries at `/home/mehta/.cache/sdl-browser-libs/usr/lib/x86_64-linux-gnu` through `LD_LIBRARY_PATH`; no host packages were installed.

## Limits

External source destinations were not independently revalidated during this documentation pass. The source lists and ledger are inherited evidence, with this limit stated in the report and briefs. No larger community corpus, interviews, clinical study, adoption study, or new product implementation was performed. Product acceptance checks describe future requirements; they are not reported as passing tests of those products.

The PDF files are snapshots. Rebuild HTML and regenerate them after changing the report or slide content.
