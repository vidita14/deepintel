# Landing-page verification

The landing-page redesign uses a forensic field-report theme: blue-black and ice blue, variable-width Instrument Sans and DM Mono, a magnified lookalike-domain specimen, the existing clickable evidence explorer, and a contrasting light evaluation report. The actual product captures, video, illustrative-data disclosures, and benchmark limitations remain in place.

## Functional checks

- `node website/app.test.cjs` tests all walkthrough selections, exclusive button state, repository-only attribution, local media/assets (including the dashboard source assembled by Pages), the illustrative-data disclosure, and script ordering.
- `node website/landing-motion.test.cjs` tests the finite scan, replay, evidence transitions, missing-library fallback, stylesheet opacity integration, and initial/runtime reduced-motion handling. Anime.js 4.5.0 is bundled locally with its MIT license; the Pages workflow copies the script and assets and runs both tests.
- `node scripts/test_dashboard_origin.cjs` tests hosted API origins, local API and standalone previews, public read-only mode, local compatibility, and offline feedback gating.
- `node --test browser-extension/hops.test.js browser-extension/onion.test.js browser-extension/cookies.test.js` covers the existing extension helpers.
- Public-demo gateway tests and container checks are recorded in `deploy/` and the hosting guide.
- Video sources, fixture provenance, timeline, captures and render instructions are recorded in `video/`.

The media uses the actual product frontends with explicitly fixed demonstration data. It does not claim measured live inference, production adoption, or individual authorship.

## Limits

The earlier strict Taste design gate remained open with 55 findings. Its fixed-screen-height, grid and nested-UI conventions did not pass; this revision does not claim to clear that gate. The engine source link now has an explicit high-contrast keyboard focus style. Real-browser interaction, keyboard focus, reduced-motion, and 320–1440px overflow checks passed. The independent media reviewer inspected actual frames at 6, 14, 20, and 23 seconds; repo attribution, synthetic-data disclosure, score consistency, and final typography passed targeted review.

No remote GitHub or backend deployment is implied by local files. A fresh model was trained from committed splits; native artifacts are in ignored models/. The ONNX proof includes an exported model. Public backend deployment still requires staging trusted artifacts. Browser configuration remains local-first until a real hosted backend URL is selected.

The real-model public gateway integration check passed readiness, dashboard/config routes, blocked feedback, input validation/body cap, inference, and shared rate limiting. Docker memory-cap testing is not complete because the daemon is unavailable. Workbench frame parity is not complete; the actual MP4 was independently inspected. Browser feature/model parity results are in ../browser-prototype/browser-results.json; full detector/explanation parity remains unimplemented.

## Redesign scope

The landing page keeps the existing motion/hover layer and letters-assemble moment. Anime.js adds a 1.7-second scan and a 280ms evidence transition, with no infinite animations. The scan and content settle when reduced motion is enabled. The dark palette comes from blue-black-cornflower; the condensed variable-width heading adapts the existing product UI into a readable split rather than a rotating collage. Voice: technical and direct, grounded in actual URL signals and offline test results. No assumed product facts or stock artwork were added.

Node walkthrough, animation, dashboard-origin checks and diff whitespace checks pass. Independent review found an invisible scan caused by CSS opacity; the script now sets and restores opacity explicitly and the regression check covers it. No backend behavior, model data or dashboard functionality was changed. No publishing was performed.

The five-width consistency run (1440, 1024, 820, 768, 390) passed page overflow, collision, reduced-motion, hidden-content, image alternatives, control names, heading order, and font loading; its 320px overflow walk also had zero failures. It reported 168 strict design findings in the initial revision, including fixed-screen section rhythm, grid lines inside the demo, typography hierarchy and visual recognition. The initial run began before the motion asset existed, producing one stale 404. The staged final-page performance run confirms zero broken requests. Subsequent corrections strengthen label/report contrast, increase touch targets, avoid smooth-scroll focus timing, reduce letter scattering and resolve the walkthrough heading hierarchy. These corrections do not imply a clean strict design audit.

Desktop and phone performance: zero FAIL, approximately 450 KiB initial transfer, zero long tasks, measured layout shift 0.010 desktop / 0.000 phone. The two retained image warnings refer to the original dashboard and extension screenshots, which stay sharp at larger display sizes. Copy lint: zero FAIL; retained warnings cover factual class-performance figures and the section/case labels used by the field-report theme. No waivers or assumed facts.

Final strict gate: `GATE: FAIL 59 (round 1 of 3)`. No waivers. Remaining categories are visual recognition, copy heading vocabulary, heading/figure scale, hero content margins, fixed-screen section height/rhythm, rules between report content, shared-screen headings, grid/container edges, split alignment, and neighbouring sections in screenshots. The final staged run no longer reports broken assets, contrast, focus visibility, hidden content, overflow, or collision failures. Additional style-gate rounds were stopped when the user requested prompt completion. The implementation is delivered locally, without publishing.
