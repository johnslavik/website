# Website intent specification

These contracts capture accepted design intent. Update the specification and its tests together when intentionally changing behavior. A green suite proves these explicit checks, not every possible visual or security property.

| ID          | Contract                                                                                                 | Enforcement                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| DOT-01      | Decorative squares are 3 CSS px on a 7 CSS px grid, independent of container size.                       | Shared DOT constants, fixed-unit SVG; unit and responsive browser tests.     |
| DOT-02      | Surface boundaries and opaque-content cutouts fall in cell gaps, never through a square.                 | dotViewport / dotExclusion; deterministic fractional-size enumeration.       |
| DOT-03      | Light and dark areas use one continuous pattern, not scattered clusters.                                 | DotSurface in all six areas; browser checks no legacy grain.                 |
| NAV-01      | All hero navigation links have identical nonzero inset at each breakpoint.                               | Browser computed-style assertions at five widths.                            |
| NAV-02      | Navigation docks immediately when its original anchor passes above the viewport.                         | Browser scroll/observer check.                                               |
| MOBILE-01   | No horizontal overflow at 320, 390, 768, 1280 or 1920 CSS px.                                            | Browser checks after scrolling every section.                                |
| MOBILE-02   | Small screens have no draggable decoration or runner.                                                    | Browser checks for draggable nodes and hidden runner.                        |
| MOTION-01   | Reduced motion hides the runner and disables navigation transitions.                                     | Browser media-emulation check.                                               |
| CONTENT-01  | Activity displays PRs, never individual commits, including the fallback snapshot.                        | Pure normalizer tests with hostile URLs and invalid records; snapshot check. |
| CONTENT-02  | Business link is in the footer, every talk has a cover, and profile link names GitHub.                   | Browser semantic assertions.                                                 |
| LINKS-01    | External web links open a new tab with noopener; privacy remains accessible.                             | Browser link contract.                                                       |
| LOAD-01     | Contact is deferred until approached; message mode is shorter than call mode.                            | Browser before/after behavior check.                                         |
| SECURITY-01 | Booking origin, validation, idempotency and honeypot rules remain enforced; inbox parsing stays bounded. | Existing booking and inbox unit suites.                                      |

`npm run verify` runs type checks, formatting/lint, deterministic tests and a production build. Every build independently runs the dot invariant tests. `npm run test:browser` runs the responsive intent checks against a local production Worker. CI runs both on every push and pull request and retains browser traces on failure. GitHub branch protection must require the **verify** check to prevent merging a failing change; repository policy is separate from this workflow.

Visual review remains necessary for aesthetic balance, contrast, transition feel and asset selection. Browser tests deliberately avoid screenshot snapshots tied to one machine's font rendering. A viewport edge may naturally crop scrolling page content; the whole-square contract governs authored field boundaries and content masks.
