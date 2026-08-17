# Requirements Document

## Introduction

The Diff Checker is a new developer utility tool for the C³ MindLoop platform. It lets developers paste two blocks of text or code side by side and see a highlighted, line-by-line diff between them — entirely in the browser, with no data sent to any server.

The tool follows the same conventions as the existing tools (JSON Formatter, Base64 Encoder, Regex Tester): a single H1 on the page level, a clean action toolbar inside `DiffCheckerTool.tsx`, two editor panels, and a footer status bar. All diffing logic runs client-side using the browser's JavaScript engine.

## Glossary

- **Diff_Checker**: The tool component (`DiffCheckerTool.tsx`) and its host page (`DiffCheckerPage.tsx`). Responsible for accepting two text inputs, computing differences, and rendering the result.
- **Original_Panel**: The left input panel, labeled "Original". Accepts the base version of the text or code.
- **Modified_Panel**: The right input panel, labeled "Modified". Accepts the changed version of the text or code.
- **Diff_Engine**: The client-side diffing logic (pure JavaScript / TypeScript) that computes line-level and character-level differences between the two inputs.
- **Diff_View**: The rendered output area showing added, removed, and unchanged lines with color coding.
- **Hunk**: A contiguous block of changed lines within the diff output.
- **Inline_Mode**: A view variant where both Original and Modified content are shown merged in a single column, with deletions and insertions interleaved per line.
- **Split_Mode**: The default view variant showing Original on the left and Modified on the right in two synchronized columns.
- **Line_Number**: The 1-based line index shown alongside each line in the Diff_View.
- **Change_Summary**: The count badge showing total added lines and total removed lines after a diff is computed.
- **Toolbar**: The action control row at the top of `DiffCheckerTool.tsx`, containing all primary action buttons. No heading or logo appears inside this component — those live in `DiffCheckerPage.tsx`.

---

## Requirements

### Requirement 1: Side-by-Side Text Input

**User Story:** As a developer, I want to paste two versions of code or text into two panels, so that I can see their differences highlighted without leaving my browser.

#### Acceptance Criteria

1. THE Diff_Checker SHALL render the Original_Panel and Modified_Panel as editable `<textarea>` elements with monospace font and syntax-neutral styling.
2. THE Diff_Checker SHALL accept any plain text input in both panels, including code in any language, JSON, YAML, log output, and prose.
3. WHEN either panel's content changes, THE Diff_Engine SHALL recompute the diff within 300ms of the last keystroke; if computation exceeds 300ms, THE Diff_Checker SHALL continue without blocking user input or displaying a loading indicator.
4. THE Diff_Checker SHALL preserve all whitespace characters — including tabs, trailing spaces, and blank lines — exactly as entered.
5. WHEN both panels are empty, THE Diff_Checker SHALL display an empty Diff_View with no error.

---

### Requirement 2: Line-Level Diff Computation

**User Story:** As a developer, I want the tool to identify which lines were added, removed, or unchanged, so that I can quickly spot what changed between two versions.

#### Acceptance Criteria

1. THE Diff_Engine SHALL classify each line in the output as one of: `added`, `removed`, or `unchanged`.
2. WHEN a line exists only in the Modified_Panel, THE Diff_Engine SHALL classify it as `added`.
3. WHEN a line exists only in the Original_Panel, THE Diff_Engine SHALL classify it as `removed`.
4. WHEN a line is identical in both panels at the same logical position, THE Diff_Engine SHALL classify it as `unchanged`.
5. THE Diff_Engine SHALL use the longest-common-subsequence algorithm (or equivalent) to minimize the number of reported changes.
6. FOR ALL pairs of Original and Modified inputs, the Diff_Engine SHALL produce a diff result whose applied patch reconstructs the Modified input exactly from the Original input (round-trip property).

---

### Requirement 3: Character-Level Highlighting Within Changed Lines

**User Story:** As a developer, I want to see exactly which characters changed within a modified line, so that I can identify small edits like renamed variables or punctuation changes without reading the whole line.

#### Acceptance Criteria

1. WHEN a line is classified as `added` or `removed` and a corresponding counterpart line exists in the opposite panel, THE Diff_Engine SHALL compute character-level differences within that line pair.
2. THE Diff_View SHALL highlight the specific characters that differ within a changed line using a distinct background color that differs from the line-level background color.
3. WHEN no corresponding counterpart line exists (pure insertion or pure deletion), THE Diff_Checker SHALL render the line with only line-level highlighting and no character-level highlighting. WHEN a counterpart line exists, THE Diff_Engine SHALL always attempt character-level highlighting regardless of algorithm difficulty.
4. THE Diff_Engine SHALL treat each Unicode scalar value as a single character unit for the purpose of character-level diffing.

---

### Requirement 4: Split View and Inline View

**User Story:** As a developer, I want to switch between a side-by-side split view and a unified inline view, so that I can choose the layout that suits my workflow or screen size.

#### Acceptance Criteria

1. THE Diff_Checker SHALL default to Split_Mode on page load.
2. WHEN the user activates Inline_Mode, THE Diff_View SHALL render all lines in a single column with `removed` and `added` lines ordered to prioritize visual flow within each Hunk, rather than enforcing strict removed-before-added precedence.
3. WHEN the user activates Split_Mode, THE Diff_View SHALL render the Original_Panel diff on the left and the Modified_Panel diff on the right with synchronized line numbers.
4. THE Diff_Checker SHALL preserve the current input contents when the user switches between Split_Mode and Inline_Mode.
5. WHILE in Split_Mode, THE Diff_View SHALL synchronize vertical scroll position between the left and right columns so that corresponding line numbers remain aligned; WHEN the user switches to Inline_Mode, scroll synchronization SHALL remain active until explicitly reset by the user.

---

### Requirement 5: Color Coding

**User Story:** As a developer, I want added and removed lines to be clearly visually distinct, so that I can scan the diff quickly without reading every line.

#### Acceptance Criteria

1. THE Diff_View SHALL render `added` lines with a green-tinted background (e.g. `bg-emerald-950` or equivalent muted token from the platform palette, not neon `#00FF00`).
2. THE Diff_View SHALL render `removed` lines with a red-tinted background (e.g. `bg-red-950` or equivalent muted token).
3. THE Diff_View SHALL render `unchanged` lines with no background tint (standard `bg-neutral-950` surface).
4. THE Diff_View SHALL prefix `added` lines with a `+` gutter indicator and `removed` lines with a `-` gutter indicator using `text-emerald-400` and `text-red-400` respectively.
5. THE Diff_View SHALL NOT use neon green (`#00FF00`), bright red, or any high-saturation color that violates the platform's visual design rules.

---

### Requirement 6: Line Numbers

**User Story:** As a developer, I want line numbers shown alongside each diff line, so that I can refer to specific positions when discussing changes with teammates.

#### Acceptance Criteria

1. THE Diff_View SHALL display Line_Numbers for each line in both panels in Split_Mode.
2. THE Diff_View SHALL display Line_Numbers in the single column in Inline_Mode, showing the Original line number for `removed` lines and the Modified line number for `added` lines.
3. WHEN a line is `added` (exists only in Modified), THE Diff_View SHALL leave the corresponding Original line number cell empty in Split_Mode, except when populating both cells is needed for alignment or context, in which case both cells MAY be populated.
4. WHEN a line is `removed` (exists only in Original), THE Diff_View SHALL leave the corresponding Modified line number cell empty in Split_Mode, except when populating both cells is needed for alignment or context, in which case both cells MAY be populated.
5. THE Diff_View SHALL render line numbers in `text-neutral-500` with a fixed-width monospace column that does not wrap.

---

### Requirement 7: Change Summary

**User Story:** As a developer, I want a quick count of how many lines were added and removed, so that I can gauge the scope of changes at a glance.

#### Acceptance Criteria

1. WHEN the Diff_Engine produces a result, THE Diff_Checker SHALL display the Change_Summary showing the count of `added` lines prefixed with `+` and the count of `removed` lines prefixed with `-`.
2. WHEN both panels are identical, THE Diff_Checker SHALL display the Change_Summary with `+0` and `-0` and a label indicating no differences were found; this label SHALL only appear when panels are truly identical with no added or removed lines, and SHALL NOT appear when there are actual line changes.
3. THE Diff_Checker SHALL update the Change_Summary immediately whenever the Diff_Engine recomputes.
4. THE Change_Summary SHALL be rendered in the Toolbar row or immediately adjacent to it — not in a separate floating badge section.

---

### Requirement 8: Toolbar Actions

**User Story:** As a developer, I want quick-access buttons for common operations like swapping panels, loading a sample, copying the diff, and clearing inputs, so that I can use the tool efficiently without hunting for controls.

#### Acceptance Criteria

1. THE Toolbar SHALL be the first rendered element inside the `DiffCheckerTool` component, containing all primary action controls.
2. THE Diff_Checker SHALL provide a "Swap" action that exchanges the content of Original_Panel and Modified_Panel and recomputes the diff.
3. THE Diff_Checker SHALL provide a "Load Sample" action that populates both panels with a built-in representative example (e.g. two versions of a short JavaScript or JSON snippet).
4. THE Diff_Checker SHALL provide a "Clear" action that empties both panels and resets the Diff_View.
5. THE Diff_Checker SHALL provide a "Copy Diff" action that writes the unified diff output (in standard unified diff format) to the system clipboard.
6. WHEN the "Copy Diff" action succeeds, THE Diff_Checker SHALL display a transient confirmation state ("Copied!") on the button for approximately 2000ms (slight variation is acceptable) then revert to the default label; IF the clipboard write operation fails, THEN THE Diff_Checker SHALL display an error state on the button for the same duration.
7. THE Diff_Checker SHALL provide a "Full Screen" toggle that expands the tool to cover the full viewport, hiding the site navigation header, and dismisses on pressing Escape.

---

### Requirement 9: File Upload

**User Story:** As a developer, I want to load files from my local filesystem into either panel, so that I can diff files without having to manually copy their content.

#### Acceptance Criteria

1. THE Diff_Checker SHALL provide a file upload trigger for both the Original_Panel and the Modified_Panel independently.
2. WHEN a file is selected for a panel, THE Diff_Checker SHALL read the file content using the browser's `FileReader` API and populate the corresponding panel's textarea.
3. THE Diff_Checker SHALL accept any plain-text file regardless of extension.
4. IF a file cannot be read (e.g. binary content detected or read error), THEN THE Diff_Checker SHALL display an inline error message beneath the affected panel and leave its existing content unchanged.
5. THE Diff_Checker SHALL process file reading entirely client-side with no file content transmitted to any server.

---

### Requirement 10: Privacy and Client-Side Processing

**User Story:** As a developer, I want to know that my code and text are never sent anywhere, so that I can safely diff sensitive content like credentials, internal configs, or unreleased code.

#### Acceptance Criteria

1. THE Diff_Checker SHALL perform all diff computation using browser-native JavaScript with no network requests.
2. WHEN all diff computation is confirmed to be local with no network requests, THE Diff_Checker SHALL render a footer status bar as the last element in the component containing the label "Local browser processing · No data sent to any server" in `text-neutral-400` monospace font.
3. THE Diff_Checker SHALL NOT set any cookies, use localStorage, or persist input content beyond the current browser session for the purpose of sending it externally.
4. THE Diff_Checker SHALL NOT embed any third-party diff library that makes outbound network calls at runtime, and SHALL NOT itself make any network requests for diff processing.

---

### Requirement 11: Platform UI Conventions

**User Story:** As a platform maintainer, I want the Diff Checker to conform to the same structural and visual conventions as every other tool, so that the codebase stays consistent and future maintenance is predictable.

#### Acceptance Criteria

1. THE Diff_Checker SHALL NOT render any heading (`<h1>`, `<h2>`) inside the `DiffCheckerTool` component; a branded logo icon without an accompanying heading is permitted.
2. THE DiffCheckerPage SHALL render exactly one `<h1>` element containing the tool title, positioned above the `DiffCheckerTool` component in the breadcrumb header area.
3. THE Diff_Checker SHALL use `bg-neutral-950` as the primary background, `border-neutral-800` for panel borders, and `#1D9BF0` as the active/accent color for selected controls.
4. THE Diff_Checker SHALL use `font-mono text-xs` for all panel content areas to match the existing tool typography.
5. THE Diff_Checker SHALL be registered under the route `/tools/diff-checker` following the existing pattern in `app/tools/`.
6. THE Diff_Checker SHALL appear in the tools listing page (`/tools`) with an icon, a one-sentence description, and a link to its dedicated page.
