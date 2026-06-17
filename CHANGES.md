# EcoTrack — Accessibility & Testing Fix Summary

Scope: address the two lowest-scoring categories from the AI evaluation
(Testing: 0/100, Accessibility: 30/100) without touching app behavior,
visuals, or the logic in `calculations.js`.

## Testing (was 0)

The project had zero test files and no test runner configured. Added:

- `vitest`, `@testing-library/react`, `@testing-library/jest-dom`,
  `@testing-library/user-event`, `jsdom`, `@vitest/coverage-v8` as
  devDependencies, plus `test` / `test:watch` / `test:coverage` npm scripts.
- `vitest.config.js` (jsdom environment, global test APIs).
- `src/test/setup.js` — extends matchers, cleans up the DOM after each test.
- `src/lib/calculations.test.js` — 24 unit tests covering every exported
  function in the pure calculation core (`calcFP`, `getScore`,
  `getTopActions`, `calcMoney`, `makeTrend`, `getBudgetDate`, and the
  exported constants). This is the highest-value target since it's pure
  logic with no rendering dependencies.
- `src/components/Shared.test.jsx` — smoke tests for `Chip`, `Toasts`,
  `ScoreRings`, and `CarbonClock`, including the new `role="status"` live
  region.

**Verification note:** this sandbox has no network access, so `vitest`
itself couldn't be `npm install`-ed and run here. Every assertion in
`calculations.test.js` was instead manually replayed against the real
`calculations.js` logic in plain Node (all 51 checks passed), and every
modified `.jsx` file was bundled and server-rendered with real React 19
via esbuild to confirm no syntax errors and correct output (all passed).
Run `npm install && npm test` once you have network access to get the
actual vitest report — I expect a clean pass based on the above, but
flagging this so you're not caught off guard if your CI environment
differs in some way I haven't accounted for.

## Accessibility (was 30)

- **Form labels**: every `<input>` across `AuthPage`, `Onboarding`,
  `ImpactSimulator`, and `Settings` now has a properly associated label
  (`htmlFor`/`id`, or a visually-hidden `sr-only` label where the design
  uses placeholder-only inputs).
- **Custom radio groups**: the diet-selector button groups (Onboarding,
  ImpactSimulator, Settings) now use `role="radiogroup"` /
  `role="radio"` / `aria-checked` instead of plain unlabeled buttons.
- **Range sliders**: added `aria-valuetext` so screen readers announce
  the unit (e.g. "60 km/week") instead of a bare number.
- **Navigation**: `aria-current="page"` on the active nav link, an
  `aria-label` on the `<nav>`, and text alternatives for the emoji-only
  streak/XP badges.
- **Live regions**: toast notifications now use `role="status"` +
  `aria-live="polite"` so they're announced without stealing focus.
  Form errors on `AuthPage` use `role="alert"`.
- **SVG chart**: `ScoreRings` now exposes a generated `aria-label`
  summarizing the score and per-category values, with the redundant
  inner SVG text and legend marked `aria-hidden` to avoid double
  announcement.
- **Heading structure**: every page now has exactly one `<h1>` (several
  were previously `<h2>` with no `<h1>` anywhere on the page).
- **Landmark**: routed page content in `App.jsx` is now wrapped in a
  `<main>` element.
- **Keyboard focus**: added a visible `:focus-visible` outline for every
  interactive element (previously only `<input>` had any focus styling).
- **Color contrast**: raised the `mut` and `dim` text-color opacities in
  `design.js` (0.5→0.68 and 0.22→0.45) to move secondary/tertiary text
  much closer to WCAG AA contrast against the near-black background,
  while preserving the existing visual hierarchy.
- **Motion**: added a `prefers-reduced-motion` media query that disables
  animations/transitions for users who've requested it at the OS level.

## Also fixed

- `@supabase/supabase-js` was imported by `lib/supabase.js` and
  `AuthPage.jsx` but missing from `package.json` dependencies — this
  would have failed `npm install`/build for anyone cloning the repo
  fresh. Added it. (Note: `AuthPage` itself isn't currently wired into
  `App.jsx`'s routing — it exists but is unreached dead code. I didn't
  wire it in since that's a product decision outside what was asked.)

## What I did not touch

`calculations.js` logic, visual design, color palette beyond the two
contrast-related opacity values, page layout, or any user-facing
behavior. The goal was to close the Testing/Accessibility gaps without
introducing regression risk elsewhere.
