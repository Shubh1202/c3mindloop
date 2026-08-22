# Requirements Document

## Introduction

The Password / Shuffle Generator is a new browser-based developer utility for the C³ MindLoop platform. It combines two related randomization features in a single tool card:

1. **Password Generator** — produces cryptographically random passwords from a configurable character set and length.
2. **Shuffle / Randomizer** — accepts a list of items (newline-separated text) or a plain string and returns a randomly shuffled result.

All computation runs 100% client-side using the browser's native `crypto.getRandomValues` API. No data is transmitted to any server.

The tool must integrate seamlessly into the existing platform by following the same file structure, design system, SEO config, translation key patterns, PRODUCTS_LIST entry, and Single Heading Policy as the Hash Generator, Base64 Encoder, and other established tools.

---

## Glossary

- **Tool**: The `PasswordShuffleGeneratorTool` React component rendered inside the tool card.
- **Page**: The `PasswordShuffleGeneratorPage` view component that wraps the Tool with the H1 heading, breadcrumb, and `ToolSeoWrapper`.
- **Password Generator**: The sub-section of the Tool that generates random passwords from a configurable character set.
- **Shuffle Generator**: The sub-section of the Tool that randomly reorders a user-supplied list or string.
- **Toolbar**: The first element inside the Tool card — a horizontal row of action controls with no inner heading.
- **Mode Toggle**: A segmented control that switches the active sub-section between Password Generator and Shuffle Generator.
- **Character Set**: The combined collection of character categories enabled by the user (uppercase, lowercase, digits, symbols).
- **Password Length**: The integer count of characters in a generated password, bounded between 8 and 128 inclusive.
- **Entropy Display**: A read-only indicator showing the bit entropy of the current password configuration.
- **Exclude Ambiguous**: A toggle that removes visually similar characters (`0`, `O`, `l`, `1`, `I`) from the character set.
- **Shuffle Input**: A textarea accepting newline-separated items or a plain string for the Shuffle Generator.
- **Shuffle Output**: A read-only display area showing the shuffled result.
- **Copy Button**: A button that writes the current output (password or shuffled result) to the clipboard.
- **Regenerate Button**: A button that discards the current output and produces a new random result using the same configuration.
- **Client-Side**: All computation occurs in the user's browser with no network requests.
- **ToolSeoWrapper**: The existing shared SEO component that renders feature description cards, a detailed guide, and FAQ accordion below the Tool card.
- **PRODUCTS_LIST**: The array in `app/lib/constants.ts` that registers a tool in the tools hub and category filter.

---

## Requirements

### Requirement 1: Tool Mode Selection

**User Story:** As a developer, I want to switch between the Password Generator and Shuffle Generator in a single tool card, so that I can use both randomization utilities without navigating away.

#### Acceptance Criteria

1. THE Tool SHALL render a Mode Toggle as the first interactive element in the Toolbar, with two options: "Password" and "Shuffle".
2. WHEN the user selects "Password", THE Tool SHALL display the Password Generator sub-section and hide the Shuffle Generator sub-section.
3. WHEN the user selects "Shuffle", THE Tool SHALL display the Shuffle Generator sub-section and hide the Password Generator sub-section.
4. THE Tool SHALL default to the "Password" mode on initial render.
5. WHEN the user switches modes, THE Tool SHALL preserve the configuration and output of the previously active mode so that switching back restores the prior state.

---

### Requirement 2: Password Generation

**User Story:** As a developer, I want to generate a strong random password with configurable length and character set, so that I can produce credentials that meet specific security requirements.

#### Acceptance Criteria

1. THE Password Generator SHALL provide a numeric length input accepting integer values from 8 to 128 inclusive.
2. IF the user enters a length below 8, THEN THE Password Generator SHALL clamp the value to 8 and display the corrected value.
3. IF the user enters a length above 128, THEN THE Password Generator SHALL clamp the value to 128 and display the corrected value.
4. THE Password Generator SHALL provide four independent boolean toggles: Uppercase (A–Z), Lowercase (a–z), Digits (0–9), and Symbols (`!@#$%^&*()-_=+[]{}|;:,.<>?`).
5. WHEN the user activates the Regenerate action, THE Password Generator SHALL produce a new password using `crypto.getRandomValues` with the currently enabled character categories and specified length.
6. IF all four character category toggles are disabled, THEN THE Password Generator SHALL disable the Regenerate action and display an inline message "Select at least one character type".
7. THE Password Generator SHALL provide an Exclude Ambiguous toggle that, when enabled, removes the characters `0`, `O`, `l`, `1`, and `I` from the active Character Set before generating.
8. WHILE the Entropy Display is visible, THE Password Generator SHALL compute and show the password entropy in bits using the formula `floor(length × log2(charsetSize))`, updating in real time when length or character toggles change.
9. THE Password Generator SHALL display the generated password in a read-only output field using a monospace font.
10. THE Password Generator SHALL include a Copy Button that writes the generated password to the clipboard and changes its label to "Copied!" for 2000 ms before reverting.
11. WHEN the user activates the Regenerate action with a valid configuration, THE Password Generator SHALL produce a new password even if the previous output is still visible.
12. THE Password Generator SHALL provide a "Load Sample" action that resets all toggles to their defaults (all four enabled, Exclude Ambiguous off, length 16) and immediately generates a new password.

---

### Requirement 3: Shuffle / Randomizer

**User Story:** As a developer, I want to paste a list of items and get them back in a random order, so that I can shuffle data sets, test cases, team rosters, or word lists without writing a script.

#### Acceptance Criteria

1. THE Shuffle Generator SHALL provide a Shuffle Input textarea where the user can type or paste content.
2. WHEN the user activates the Shuffle action, THE Shuffle Generator SHALL treat each non-empty line in the Shuffle Input as one item and produce a Shuffle Output in which the items appear in a uniformly random order using Fisher-Yates shuffle with `crypto.getRandomValues`.
3. WHEN the user activates the Shuffle action and the Shuffle Input contains only a single non-empty line, THE Shuffle Generator SHALL treat each character of that line as an individual item and shuffle the characters.
4. IF the Shuffle Input is empty or contains only whitespace when the user activates the Shuffle action, THEN THE Shuffle Generator SHALL display an inline message "Enter at least one item to shuffle" and produce no output.
5. THE Shuffle Generator SHALL preserve the original casing, spacing, and punctuation of each item in the Shuffle Output.
6. THE Shuffle Generator SHALL display the Shuffle Output in a read-only textarea using a monospace font.
7. THE Shuffle Generator SHALL include a Copy Button that writes the current Shuffle Output to the clipboard and changes its label to "Copied!" for 2000 ms before reverting.
8. THE Shuffle Generator SHALL include a Clear Button that empties both the Shuffle Input and the Shuffle Output.
9. THE Shuffle Generator SHALL provide a "Load Sample" action that populates the Shuffle Input with a preset developer-relevant list (e.g., `alpha\nbeta\ngamma\ndelta\nepsilon`) and immediately runs the shuffle.
10. WHEN the user edits the Shuffle Input after a shuffle has been performed, THE Shuffle Generator SHALL clear the Shuffle Output to avoid stale results.

---

### Requirement 4: Cryptographic Randomness

**User Story:** As a developer, I want all random values generated by this tool to be cryptographically secure, so that I can trust the output for credential generation and randomized test data.

#### Acceptance Criteria

1. THE Tool SHALL use `crypto.getRandomValues` exclusively for all random number generation in both the Password Generator and the Shuffle Generator.
2. THE Tool SHALL NOT use `Math.random()` at any point in the password generation or shuffle logic.
3. IF `crypto.getRandomValues` is not available in the current browser context, THEN THE Tool SHALL display an error message "Cryptographic API not available in this browser" and disable all generation and shuffle actions.

---

### Requirement 5: Copy to Clipboard

**User Story:** As a developer, I want a single-click copy action on all outputs, so that I can immediately use a generated password or shuffled list without manual selection.

#### Acceptance Criteria

1. WHEN the Copy Button is activated with a non-empty output, THE Tool SHALL write the output text to the system clipboard using the `navigator.clipboard.writeText` API.
2. WHEN the clipboard write succeeds, THE Tool SHALL change the Copy Button label to "Copied!" and restore the original label after 2000 ms.
3. IF the clipboard write fails, THEN THE Tool SHALL display an inline error "Copy failed — select text manually".
4. THE Copy Button SHALL be disabled and visually muted when the corresponding output field is empty.

---

### Requirement 6: Client-Side Execution and Privacy

**User Story:** As a developer, I want the tool to process all data locally in my browser, so that passwords and sensitive list data never leave my machine.

#### Acceptance Criteria

1. THE Tool SHALL perform all password generation and shuffle operations without making any network requests.
2. THE Tool SHALL display a footer bar with the text "Client-Side" in `text-neutral-400` monospace and a privacy note "No data sent to any server".
3. THE Tool SHALL NOT persist any user input or generated output in `localStorage`, `sessionStorage`, `IndexedDB`, or cookies.

---

### Requirement 7: Design System Compliance

**User Story:** As a platform maintainer, I want the new tool to look and behave exactly like the existing tools (Hash Generator, Base64 Encoder), so that the platform feels consistent.

#### Acceptance Criteria

1. THE Tool component SHALL use `bg-neutral-950 border border-neutral-800` as the root card container classes, matching the existing tool card pattern.
2. THE Tool component SHALL NOT render an inner title, heading, icon+title row, logo box, or subtitle inside the card — the card SHALL start directly with the Toolbar.
3. THE Toolbar SHALL use `bg-neutral-900 border-b border-neutral-800` and contain all primary action controls in a single flex row, matching the HashGeneratorTool toolbar pattern.
4. THE Tool SHALL use `text-xs font-mono` for all labels, output text, and status indicators.
5. THE Tool SHALL use `border-neutral-800` for all 1px internal dividers and panel borders.
6. THE Tool SHALL use `bg-neutral-900/90` for all input and output textareas.
7. WHEN a button is in an active or selected state, THE Tool SHALL apply `bg-[#1D9BF0] text-white` to the active segment, matching the existing mode-toggle pattern.
8. THE Tool SHALL use `hover:bg-red-950 hover:text-red-300` on destructive actions (Clear), matching the existing clear-button pattern.
9. THE Tool SHALL support a Full Screen mode that uses `fixed inset-0 z-[9999]` with an Escape-key handler, matching the existing fullscreen pattern.
10. THE Tool SHALL use `Maximize2` / `Minimize2` icons from `lucide-react` for the full screen toggle button.

---

### Requirement 8: Page Structure and Single Heading Policy

**User Story:** As a platform maintainer, I want the tool page to follow the Single Heading Policy so there is exactly one H1 per page.

#### Acceptance Criteria

1. THE Page SHALL render exactly one `<h1>` element, located in the breadcrumb/metadata header area above the Tool component, containing the page title "Password & Shuffle Generator".
2. THE Page SHALL NOT render any `<h1>`, `<h2>`, or heading-equivalent element inside the Tool component card.
3. THE Page SHALL render a breadcrumb navigation row with a back link to `/tools` and an active segment label "Password & Shuffle Generator", using the same markup pattern as `HashGeneratorPage`.
4. THE Page SHALL display a status badge "100% Client-Side • crypto.getRandomValues" in `text-neutral-400 font-mono` to the right of the H1, using the same `bg-surface border border-theme-subtle` pill style as existing page badges.
5. THE Page SHALL render the `ToolSeoWrapper` component below the Tool and `CTASection` at the bottom, matching the existing page layout.

---

### Requirement 9: Platform Integration

**User Story:** As a platform maintainer, I want the new tool registered in all the right places so it appears in the tools hub, SEO config, and translations.

#### Acceptance Criteria

1. THE Tool SHALL have a dedicated route at `/tools/password-shuffle-generator` implemented as `app/tools/password-shuffle-generator/page.tsx`.
2. THE Tool SHALL be registered as a new entry in `PRODUCTS_LIST` in `app/lib/constants.ts` with `id: 'password-shuffle-generator'`, `category: 'crypto'`, a plain-text description, and a relevant `icon` from `lucide-react`.
3. THE SEO config in `app/config/seo.config.ts` SHALL contain a `passwordShuffleGenerator` entry with `title`, `description`, `keywords`, `canonical`, `openGraph`, and `twitter` fields following the existing pattern.
4. THE translation file `app/messages/en.json` SHALL contain a `passwordShuffleGenerator` key with `pageTitle`, `pageBadge`, `breadcrumb`, `breadcrumbParent`, `feat1Title`, `feat1Desc`, `feat2Title`, `feat2Desc`, `feat3Title`, `feat3Desc`, `guide` (with `title`, `intro`, `step1`–`step4`, `privacyTitle`, `privacyIntro`, `privacyBullet1`, `privacyBullet2`), and `faq` (with `q1`/`a1` through `q3`/`a3`) sub-keys.
5. THE page `app/tools/password-shuffle-generator/page.tsx` SHALL export a `metadata` object with `title`, `description`, `keywords`, `alternates.canonical`, `openGraph`, and `twitter` fields populated from the SEO config entry.
6. THE `ToolSeoWrapper` SHALL be invoked with `toolKey="passwordShuffleGenerator"` so it renders the correct feature cards, guide, and FAQ sections.

---

### Requirement 10: Entropy Feedback and Strength Indicator

**User Story:** As a developer, I want to see the strength of the current password configuration before I generate, so that I can judge whether the settings meet my requirements.

#### Acceptance Criteria

1. THE Password Generator SHALL compute password entropy in bits using `floor(length × log2(charsetSize))` where `charsetSize` is the count of unique characters in the active Character Set after applying the Exclude Ambiguous filter.
2. THE Password Generator SHALL display a strength label alongside the entropy value using these thresholds: entropy < 40 → "Weak", 40 ≤ entropy < 60 → "Fair", 60 ≤ entropy < 80 → "Strong", entropy ≥ 80 → "Very Strong".
3. WHEN the character set configuration or length changes, THE Entropy Display SHALL update immediately without requiring a new generation action.
4. THE strength label SHALL use muted, non-neon colour tokens: "Weak" → `text-red-400`, "Fair" → `text-amber-400`, "Strong" → `text-sky-400`, "Very Strong" → `text-emerald-400`.
5. THE Entropy Display SHALL NOT use glowing, animated, or neon-green styling.
