# Implementation Plan — Password & Shuffle Generator

## Overview

This plan delivers the `password-shuffle-generator` feature: a single tool card with Password and Shuffle modes, running 100% client-side via `crypto.getRandomValues`. It integrates into the existing platform using the identical file layout, design tokens, SEO config pattern, translation keys, and `PRODUCTS_LIST` registration as the Hash Generator and other established tools.

## Tasks

Tasks are ordered so all integration/config work lands first as parallel independent tasks, the core Tool component comes next, the Page view follows, the Next.js route depends on both the view and SEO config, and a final verification task confirms the build and render.

### Task Group 1 — Platform Integration (Parallel, No Dependencies)

These four tasks are fully independent of each other and of the components. Execute them in any order or in parallel.

---

- [x] 1. Add `passwordShuffleGenerator` entry to `seo.config.ts`

  **File:** `app/config/seo.config.ts`

  **Sub-tasks:**
  - [x] 1.1 Add the `passwordShuffleGenerator` key to the `seoConfig` object following the exact same shape as the `hashGenerator` entry (title, description, keywords, canonical, openGraph, twitter).
  - [x] 1.2 Use `${BASE_URL}/tools/password-shuffle-generator` for `canonical` and all `url` / `images[].url` paths.
  - [x] 1.3 Populate `title`, `description`, `keywords`, `openGraph`, and `twitter` with the exact values specified in `design.md § SEO Config Entry`.
  - [x] 1.4 Verify that `defaultOgImage` (already declared at the top of the file) is referenced correctly in both `openGraph.images` and `twitter.images` — no new variable needed.

  **Acceptance Criteria:** Requirements 9.3, 9.5

---

- [x] 2. Add `passwordShuffleGenerator` translation keys to `en.json`

  **File:** `app/messages/en.json`

  **Sub-tasks:**
  - [x] 2.1 Locate the `tools` object in `en.json` and add the `passwordShuffleGenerator` key as a sibling of `hashGenerator`.
  - [x] 2.2 Add top-level string keys: `pageTitle`, `pageBadge`, `breadcrumb`, `breadcrumbParent`.
  - [x] 2.3 Add feature card keys: `feat1Title`, `feat1Desc`, `feat2Title`, `feat2Desc`, `feat3Title`, `feat3Desc`.
  - [x] 2.4 Add the `guide` sub-object with keys: `title`, `intro`, `step1`, `step2`, `step3`, `step4`, `privacyTitle`, `privacyIntro`, `privacyBullet1`, `privacyBullet2`.
  - [x] 2.5 Add the `faq` sub-object with keys: `q1`, `a1`, `q2`, `a2`, `q3`, `a3`.
  - [x] 2.6 Use the exact string values specified in `design.md § Translation Keys`.
  - [x] 2.7 Confirm the file remains valid JSON after the addition (no trailing commas, no duplicate keys).

  **Acceptance Criteria:** Requirements 9.4

---

- [x] 3. Register tool in `PRODUCTS_LIST` in `constants.ts`

  **File:** `app/lib/constants.ts`

  **Sub-tasks:**
  - [x] 3.1 Add a new entry object to the `PRODUCTS_LIST` array with `id: 'password-shuffle-generator'`.
  - [x] 3.2 Set `nameKey: 'Password & Shuffle Generator'`, `status: 'live'`, `category: 'crypto'`, `icon: 'KeyRound'`.
  - [x] 3.3 Set `descKey` to the plain-text description from `design.md § PRODUCTS_LIST Entry`.
  - [x] 3.4 Set `techStack: ['crypto.getRandomValues', 'Fisher-Yates Shuffle', 'Local Processing']`.
  - [x] 3.5 Verify the entry conforms to the existing `Product` type (no extra fields, all required fields present).
  - [x] 3.6 Confirm TypeScript compilation succeeds for `constants.ts` after the change.

  **Acceptance Criteria:** Requirements 9.2

---

### Task Group 2 — Core Tool Component

Depends on nothing from Group 1. The Tool is self-contained.

---

- [x] 4. Implement `PasswordShuffleGeneratorTool` component

  **File:** `app/components/tools/PasswordShuffleGeneratorTool.tsx`

  **Sub-tasks:**

  **4.1 Pure utility functions (module-level, before the component)**
  - [x] 4.1.1 Implement `buildCharset(upper, lower, digits, symbols, excludeAmbiguous): string` — assembles the four character pools and strips `0`, `O`, `l`, `1`, `I` when `excludeAmbiguous` is true.
  - [x] 4.1.2 Implement `generatePassword(charset: string, length: number): string` — uses `crypto.getRandomValues(new Uint32Array(length))` with modulo mapping; applies guaranteed-inclusion post-processing so the result contains at least one char from each enabled category.
  - [x] 4.1.3 Implement `computeEntropy(charsetSize: number, length: number): number` — returns `Math.floor(length * Math.log2(charsetSize))`, guarded with `if (charsetSize === 0) return 0`.
  - [x] 4.1.4 Implement `strengthLabel(entropy: number): { label: string; colorClass: string }` — returns one of `{ 'Weak', 'text-red-400' }`, `{ 'Fair', 'text-amber-400' }`, `{ 'Strong', 'text-sky-400' }`, `{ 'Very Strong', 'text-emerald-400' }` per the thresholds in `design.md § strengthLabel`.
  - [x] 4.1.5 Implement `fisherYatesShuffle<T>(items: T[]): T[]` — Fisher-Yates with a fresh `crypto.getRandomValues(new Uint32Array(1))` per swap.
  - [x] 4.1.6 Implement `shuffleText(input: string): { result: string; error: string }` — splits on `\n`, filters empty lines; single-line → character shuffle; multi-line → line shuffle; empty input → error `"Enter at least one item to shuffle"`.

  **4.2 Component state**
  - [x] 4.2.1 Declare all state variables from `design.md § State` table: `mode`, `isFullScreen`, `pwLength` (default 16), `pwUpper/Lower/Digits/Symbols` (all true), `pwExcludeAmbiguous` (false), `pwOutput`, `pwCopied`, `shuffleInput`, `shuffleOutput`, `shuffleCopied`, `shuffleError`, `cryptoError`.

  **4.3 Full-screen behaviour**
  - [x] 4.3.1 Implement the `useEffect` that sets `document.body.style.overflow`, hides/restores `header`, and listens for Escape — identical to the code block in `design.md § Fullscreen Behaviour`.
  - [x] 4.3.2 Apply root container classes: `bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-100 flex flex-col` plus the fullscreen conditional (`fixed inset-0 z-[9999] overflow-hidden` vs `w-full rounded-lg shadow-2xl`).

  **4.4 Toolbar**
  - [x] 4.4.1 Render the Toolbar div with `px-3 py-2.5 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2`.
  - [x] 4.4.2 Implement Mode Toggle (Password / Shuffle) with `bg-[#1D9BF0] text-white` on the active segment and `text-neutral-400` on the inactive one.
  - [x] 4.4.3 Add "Load Sample" button (`bg-neutral-800/80 hover:bg-neutral-700`) with `RotateCcw` icon — in Password mode resets config to defaults and regenerates; in Shuffle mode loads preset list and runs shuffle.
  - [x] 4.4.4 Add "Clear" button (`bg-neutral-800/80 hover:bg-red-950 hover:text-red-300`) with `Trash2` icon — clears all fields.
  - [x] 4.4.5 Add Fullscreen toggle button (`p-1.5 rounded bg-neutral-800 hover:bg-neutral-700`) with `Maximize2`/`Minimize2` icons.
  - [x] 4.4.6 Confirm the Toolbar contains NO inner title, heading, icon+title row, or subtitle — per the Single Heading Policy (Requirement 7.2).

  **4.5 Password mode panel**
  - [x] 4.5.1 Render a numeric length input clamped to 8–128; clamp on `change` and display the corrected value.
  - [x] 4.5.2 Render four toggle buttons for Uppercase, Lowercase, Digits, Symbols — each independently togglable.
  - [x] 4.5.3 Render "Exclude Ambiguous" toggle.
  - [x] 4.5.4 Render live entropy display using `computeEntropy` + `strengthLabel`; update immediately on any config change without requiring Regenerate.
  - [x] 4.5.5 Render read-only password output field (`bg-neutral-900/90 border-neutral-800 font-mono`).
  - [x] 4.5.6 Render Copy button that calls `navigator.clipboard.writeText`, shows "Copied!" for 2000 ms, then reverts; disabled when `pwOutput` is empty.
  - [x] 4.5.7 Render "Regenerate" primary button (`bg-[#1D9BF0]`); disabled with inline message "Select at least one character type" when all four toggles are off.
  - [x] 4.5.8 Handle clipboard write failure: show inline error "Copy failed — select text manually".

  **4.6 Shuffle mode panel**
  - [x] 4.6.1 Render Shuffle Input textarea (`min-h-[160px] bg-neutral-900/90 border-neutral-800 font-mono`).
  - [x] 4.6.2 On input change after a shuffle has been run, clear `shuffleOutput` and `shuffleError`.
  - [x] 4.6.3 Render "Shuffle" primary button (`bg-[#1D9BF0]`); on click call `shuffleText` and populate `shuffleOutput` or `shuffleError`.
  - [x] 4.6.4 Render read-only Shuffle Output textarea (`min-h-[160px] bg-neutral-900/90 font-mono`).
  - [x] 4.6.5 Render Copy button for shuffle output; same 2000 ms feedback pattern; disabled when `shuffleOutput` is empty.
  - [x] 4.6.6 Render inline `shuffleError` message in `text-xs text-amber-400 font-mono` when set.

  **4.7 `crypto.getRandomValues` unavailability handling**
  - [x] 4.7.1 On mount (`useEffect`), detect if `crypto.getRandomValues` is unavailable; set `cryptoError = true`.
  - [x] 4.7.2 When `cryptoError` is true, render error banner "Cryptographic API not available in this browser" and disable Regenerate + Shuffle buttons.

  **4.8 Footer bar**
  - [x] 4.8.1 Render the footer with `px-4 py-2 bg-neutral-900/80 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono`.
  - [x] 4.8.2 Left side: `Info` icon + "Client-Side · No data sent to any server" in `text-neutral-400`.
  - [x] 4.8.3 Right side: `ShieldCheck` icon in `text-emerald-500/70` + `crypto.getRandomValues` in `text-neutral-500`.

  **4.9 Imports**
  - [x] 4.9.1 Import only from `react` and `lucide-react` (`KeyRound`, `Shuffle`, `Copy`, `Check`, `Trash2`, `Maximize2`, `Minimize2`, `Info`, `ShieldCheck`, `RotateCcw`). No external crypto libraries.

  **Acceptance Criteria:** Requirements 1, 2, 3, 4, 5, 6, 7, 10

---

### Task Group 3 — Page View Component

Depends on Task 4 (`PasswordShuffleGeneratorTool` exists as a named export).

---

- [x] 5. Implement `PasswordShuffleGeneratorPage` view component

  **File:** `app/views/PasswordShuffleGeneratorPage.tsx`

  **Sub-tasks:**
  - [x] 5.1 Add `'use client';` directive at the top.
  - [x] 5.2 Import `PasswordShuffleGeneratorTool` from `../components/tools/PasswordShuffleGeneratorTool`.
  - [x] 5.3 Import `ToolSeoWrapper` from `../components/seo/ToolSeoWrapper`, `CTASection` from `../components/sections/CTASection`, `Link` from `../lib/router-compat`, `ArrowLeft` from `lucide-react`, and `useTranslation` from `../lib/i18n`.
  - [x] 5.4 Render the outer page wrapper with `pt-6 sm:pt-8 pb-16 bg-app text-theme-main relative z-10` and inner max-width container with `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8`.
  - [x] 5.5 Render the breadcrumb/metadata header block — breadcrumb row with `ArrowLeft` + `Link to="/tools"` using translated `breadcrumbParent`; active segment in `text-[#1D9BF0] font-semibold` using translated `breadcrumb`.
  - [x] 5.6 Render the single `<h1>` with `text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-theme-main` using translated `pageTitle`.
  - [x] 5.7 Render status badge with `text-[11px] font-mono text-neutral-400 bg-surface px-2.5 py-1 rounded border border-theme-subtle shrink-0` using translated `pageBadge`.
  - [x] 5.8 Render `<PasswordShuffleGeneratorTool />` below the header block.
  - [x] 5.9 Render `<ToolSeoWrapper toolKey="passwordShuffleGenerator" />` below the tool.
  - [x] 5.10 Render `<CTASection />` at the bottom.
  - [x] 5.11 Confirm there is exactly one `<h1>` on the page and no heading elements inside `PasswordShuffleGeneratorTool` — enforcing the Single Heading Policy (Requirement 8).
  - [x] 5.12 Export as named export: `export const PasswordShuffleGeneratorPage: React.FC = () => { ... }`.

  **Acceptance Criteria:** Requirements 8, 9.5, 9.6

---

### Task Group 4 — Next.js Route

Depends on Task 5 (`PasswordShuffleGeneratorPage`) and Task 1 (`seo.config.ts` entry).

---

- [x] 6. Create the Next.js route `page.tsx`

  **File:** `app/tools/password-shuffle-generator/page.tsx`

  **Sub-tasks:**
  - [x] 6.1 Create the directory `app/tools/password-shuffle-generator/` if it does not exist.
  - [x] 6.2 Import `type { Metadata }` from `'next'`.
  - [x] 6.3 Import `PasswordShuffleGeneratorPage` from `'@/app/views/PasswordShuffleGeneratorPage'`.
  - [x] 6.4 Import `seoConfig` from the correct relative path (e.g. `'../../config/seo.config'`).
  - [x] 6.5 Destructure `const { passwordShuffleGenerator } = seoConfig;`.
  - [x] 6.6 Export a `metadata` object of type `Metadata` with `title`, `description`, `keywords`, `alternates: { canonical }`, `openGraph`, and `twitter` all populated from `passwordShuffleGenerator`.
  - [x] 6.7 Export a default `Page` function that returns `<PasswordShuffleGeneratorPage />`.
  - [x] 6.8 Do NOT add `'use client'` — this is a server component / route file.

  **Acceptance Criteria:** Requirements 9.1, 9.5

---

### Task Group 5 — Verification

Depends on all previous tasks.

---

- [x] 7. Build verification and smoke test

  **Sub-tasks:**
  - [x] 7.1 Run `next build` (or the project's configured build command) and confirm zero TypeScript errors and zero build errors.
  - [x] 7.2 Confirm `app/tools/password-shuffle-generator/page.tsx` is included in the build output and the route is reachable.
  - [x] 7.3 Start the dev server and navigate to `/tools/password-shuffle-generator`; confirm the page renders with the H1 "Password & Shuffle Generator" visible above the tool card.
  - [x] 7.4 Verify the Tool card renders with the Toolbar as its first element (no inner title, heading, or logo block inside the card).
  - [x] 7.5 Confirm the password-shuffle-generator entry appears in the tools hub (products list).
  - [x] 7.6 Confirm there are no console errors related to missing translation keys (`passwordShuffleGenerator.*`).
  - [x] 7.7 Confirm there are no console errors related to a missing `seoConfig.passwordShuffleGenerator` key.

  **Acceptance Criteria:** Requirements 1–10 (integration smoke test)

---

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["1", "2", "3", "4"],
      "description": "Platform integration config tasks and core Tool component — all independent, can run in parallel"
    },
    {
      "wave": 2,
      "tasks": ["5"],
      "description": "Page view component — depends on Task 4 (Tool component)"
    },
    {
      "wave": 3,
      "tasks": ["6"],
      "description": "Next.js route — depends on Task 1 (SEO config) and Task 5 (Page view)"
    },
    {
      "wave": 4,
      "tasks": ["7"],
      "description": "Build verification and smoke test — depends on all prior tasks"
    }
  ]
}
```

## Notes

- Tasks 1, 2, 3, and 4 have no mutual dependencies and can be implemented in parallel.
- Task 4 (`PasswordShuffleGeneratorTool`) is the largest task. It contains all pure utility functions and UI. No external crypto libraries are needed — only `crypto.getRandomValues` (browser built-in).
- Task 5 (`PasswordShuffleGeneratorPage`) mirrors `HashGeneratorPage.tsx` closely. Use it as a reference to match the exact class tokens, layout structure, and translation call pattern.
- Task 6 (`page.tsx`) mirrors `app/tools/hash-generator/page.tsx`. Check the relative import path for `seo.config.ts` carefully since the directory depth differs from the hash generator route.
- The Single Heading Policy (AGENTS.md §5, Requirement 8) is the most critical design constraint: the `<h1>` lives only in the Page component, never inside the Tool component card.
- All randomness MUST use `crypto.getRandomValues`. `Math.random()` is strictly prohibited (Requirement 4.2).
- No state is persisted to `localStorage`, `sessionStorage`, `IndexedDB`, or cookies (Requirement 6.3).
