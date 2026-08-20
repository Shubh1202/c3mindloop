# Requirements Document

## Introduction

The Code Complexity Analyzer is a new developer utility tool for the C³ MindLoop platform. It lets developers paste or upload source code and immediately see cyclomatic complexity and cognitive complexity scores broken down per function or method, along with actionable refactor suggestions. All analysis runs 100% client-side in the browser — no code is transmitted to any server. The tool follows the platform's established VS Code / Chrome DevTools aesthetic: `bg-neutral-950` backgrounds, `border-neutral-800` 1px borders, a single H1 in the page wrapper, and the `*Tool.tsx` component starting directly with the action toolbar.

Supported languages in the initial release: JavaScript, TypeScript, Python, Java, Go, C, and C++.

---

## Glossary

- **Analyzer**: The client-side engine (`complexityEngine.ts`) that parses source code and computes complexity metrics.
- **Cyclomatic_Complexity**: A count of independent paths through a function. Each decision point (if, else if, for, while, do-while, case, catch, &&, ||, ternary `?:`) adds 1; the base value per function is 1.
- **Cognitive_Complexity**: A measure of how difficult a function is to understand, weighted by nesting depth. Increments for structural breaks (if, else if, else, for, while, do-while, switch, catch) and adds extra nesting penalty per level.
- **Function_Result**: A data record produced by the Analyzer for a single function/method, containing function name, start line, end line, cyclomatic score, cognitive score, and derived risk level.
- **Risk_Level**: A categorical label derived from complexity scores: `Low` (cyclomatic ≤ 5 AND cognitive ≤ 7), `Medium` (cyclomatic 6–10 OR cognitive 8–15), `High` (cyclomatic 11–20 OR cognitive 16–24), `Critical` (cyclomatic > 20 OR cognitive > 24).
- **Refactor_Suggestion**: A short, actionable text recommendation tied to a Function_Result when its Risk_Level is Medium or above.
- **Language_Detector**: The client-side module that infers programming language from file extension or code heuristics.
- **Tool**: The `CodeComplexityAnalyzerTool.tsx` React component.
- **Page**: The `CodeComplexityAnalyzerPage.tsx` React view that renders the single H1 and mounts the Tool.

---

## Requirements

### Requirement 1: Code Input

**User Story:** As a developer, I want to paste source code or upload a file, so that I can analyze code I am currently working on without leaving the browser.

#### Acceptance Criteria

1. THE Tool SHALL render a code input textarea as the primary input surface, with a placeholder that lists the accepted file extensions (`.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.java`, `.go`, `.c`, `.cpp`, `.h`, `.hpp`).
2. WHEN a user uploads a file via the Upload button, THE Tool SHALL read the file contents and populate the code input textarea with the file's text content.
3. WHEN a file is uploaded, THE Tool SHALL accept files with extensions `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.java`, `.go`, `.c`, `.cpp`, `.h`, `.hpp`.
4. IF an uploaded file exceeds 500 KB, THEN THE Tool SHALL display an inline error message stating the file size limit and reject the file without clearing existing input.
5. WHEN a valid file is uploaded and its size is within the 500 KB limit, THE Tool SHALL replace the existing textarea content with the uploaded file contents.
6. IF an uploaded file cannot be read as text (e.g., binary or unreadable encoding), THEN THE Tool SHALL display an inline error message and reject the file without clearing existing input.
7. THE Tool SHALL provide a "Load Sample" button that populates the input textarea with a representative code snippet containing at least 3 functions, including at least one function with a nested control structure.
8. THE Tool SHALL provide a "Clear" button that removes all text from the code input textarea and removes any displayed analysis results, returning the tool to its initial state.

---

### Requirement 2: Language Detection and Selection

**User Story:** As a developer, I want the tool to detect my code's language automatically, so that the correct parser is used without manual configuration.

#### Acceptance Criteria

1. WHEN a file is uploaded, THE Language_Detector SHALL infer the programming language from the file extension using the mapping: `.js`/`.jsx` → JavaScript, `.ts`/`.tsx` → TypeScript, `.py` → Python, `.java` → Java, `.go` → Go, `.c`/`.h` → C, `.cpp`/`.hpp` → C++; and shall set the language selector to the detected language.
2. IF the uploaded file's extension is not in the recognized mapping, THEN THE Language_Detector SHALL leave the language selector unchanged.
3. WHEN no file is uploaded and the user pastes code, THE Language_Detector SHALL infer the language by scoring heuristic signals (e.g., `def ` → Python, `func ` → Go, `#include` → C/C++, `import`/`const`/`let` → JavaScript/TypeScript); the language with the highest signal count is selected; IF two languages tie, THEN THE Language_Detector SHALL select JavaScript.
4. THE Tool SHALL render a language selector control allowing the user to manually override the detected language to one of: JavaScript, TypeScript, Python, Java, Go, C, C++.
5. WHEN the user changes the language selector, THE Analyzer SHALL re-run analysis on the current input using the newly selected language's parsing rules.
6. IF THE Language_Detector matches zero heuristic signals when analyzing pasted code, THEN THE Language_Detector SHALL default to JavaScript and display an inline text label within the language selector row indicating the language was assumed.

---

### Requirement 3: Cyclomatic Complexity Analysis

**User Story:** As a developer, I want to see cyclomatic complexity per function, so that I can identify functions with too many independent execution paths.

#### Acceptance Criteria

1. WHEN the user triggers analysis, THE Analyzer SHALL compute Cyclomatic_Complexity for each function and method in the input code.
2. THE Analyzer SHALL count each of the following constructs as +1 toward Cyclomatic_Complexity: `if`, `else if`, `elif`, `for`, `while`, `do`, `case` (switch branch), `catch`, `&&` (logical AND), `||` (logical OR), ternary operator `?:`.
3. THE Analyzer SHALL assign a base Cyclomatic_Complexity value of 1 to each function before counting decision points.
4. THE Analyzer SHALL produce one Function_Result per detected function or method; a "detectable function" includes named functions and methods, and arrow or anonymous functions that are assigned to a named variable; immediately-invoked or unassigned anonymous functions are excluded.
5. IF the input contains no detectable functions, THEN THE Analyzer SHALL produce no Function_Results and THE Tool SHALL display the "No functions detected" message specified in Requirement 7.6.
6. WHEN a function is nested inside another function, THE Analyzer SHALL count decision points of the inner function only toward the inner function's Cyclomatic_Complexity score, not toward the outer function's score.
7. WHEN the input contains a syntax error that prevents complete parsing, THE Analyzer SHALL produce Function_Results for all successfully parsed functions before the error and SHALL display an inline error message indicating that the analysis is partial due to a syntax error.

---

### Requirement 4: Cognitive Complexity Analysis

**User Story:** As a developer, I want to see cognitive complexity per function, so that I can find code that is hard to read and understand despite having a manageable number of paths.

#### Acceptance Criteria

1. WHEN the user triggers analysis, THE Analyzer SHALL compute Cognitive_Complexity for each function and method in the input code.
2. THE Analyzer SHALL increment Cognitive_Complexity by 1 for each structural control flow construct: `if`, `else if`, `elif`, `else`, `for`, `while`, `do-while`, `switch`, `catch`, `break` with label, `continue` with label, `goto`.
3. THE Analyzer SHALL track nesting depth starting at 0 for the outermost body of each function, increment depth by 1 upon entering any block opened by a structural control flow construct listed in criterion 2, and decrement depth by 1 upon exiting that block; the nesting penalty applied to a structural construct SHALL equal the nesting depth value at the point the construct is entered, before that construct increments the depth for its own nested children.
4. THE Analyzer SHALL score logical operator sequences within a single boolean expression as follows: the first uninterrupted run of identical operators (`&&` or `||`) counts as +1; each subsequent run that differs in operator type from the immediately preceding run also counts as +1; runs separated only by parentheses without an operator-type change are treated as the same run.
5. THE Analyzer SHALL not add any nesting penalty for sequence-only expressions (logical operators) — only structural constructs receive the nesting bonus.
6. THE Analyzer SHALL increment Cognitive_Complexity by 1 for each ternary expression (`?:`) encountered, applying the same nesting penalty as structural constructs based on the nesting depth at the point the ternary expression is entered.
7. WHEN a function or lambda is defined inside another function, THE Analyzer SHALL reset the nesting depth to 0 for the inner function's body and compute its Cognitive_Complexity independently, without inheriting the enclosing function's nesting depth.
8. THE Analyzer SHALL include the cognitive score in each Function_Result.

---

### Requirement 5: Risk Level Classification

**User Story:** As a developer, I want each function labeled with a risk level, so that I can quickly scan results and prioritise which functions to refactor first.

#### Acceptance Criteria

1. THE Analyzer SHALL assign a Risk_Level to each Function_Result using the following top-down priority order, applying the first matching rule:
   - `Critical`: Cyclomatic_Complexity > 20 OR Cognitive_Complexity > 24
   - `High`: Cyclomatic_Complexity > 10 OR Cognitive_Complexity > 15
   - `Medium`: Cyclomatic_Complexity > 5 OR Cognitive_Complexity > 7
   - `Low`: all other cases
2. THE Tool SHALL render each Function_Result's Risk_Level as a color-coded badge using the Tailwind classes: `Low` → `text-emerald-400 bg-emerald-950`, `Medium` → `text-amber-400 bg-amber-950`, `High` → `text-orange-400 bg-orange-950`, `Critical` → `text-red-400 bg-red-950`.
3. IF the badge element is absent from the rendered output, THEN THE Tool SHALL display the Risk_Level as plain text in `text-neutral-300` as a fallback.

---

### Requirement 6: Refactor Suggestions

**User Story:** As a developer, I want actionable suggestions for complex functions, so that I know what specific changes would reduce complexity.

#### Acceptance Criteria

1. WHEN a Function_Result has Risk_Level of Medium, High, or Critical, THE Analyzer SHALL attach at least one Refactor_Suggestion to that Function_Result.
2. THE Analyzer SHALL order Refactor_Suggestions within a Function_Result by descending individual score contribution — the construct or pattern contributing the highest numeric value to the complexity score is listed first.
3. WHEN a function contains more than 3 nested control flow levels, THE Analyzer SHALL attach a suggestion to extract the inner blocks into named helper functions.
4. WHEN a function has more than 4 `if`/`else if` branches at the same nesting level, THE Analyzer SHALL attach a suggestion to replace the conditional chain with a lookup table or strategy pattern.
5. WHEN a function has a Cognitive_Complexity score above 15 and contains more than one logical operator sequence, THE Analyzer SHALL attach a suggestion to extract the boolean expressions into named predicate functions.
6. WHEN a function spans more than 50 lines, THE Analyzer SHALL attach a suggestion to split the function by responsibility.
7. WHEN a function's Cyclomatic_Complexity exceeds 10, THE Analyzer SHALL attach a suggestion that the function may benefit from additional unit tests to cover all independent paths.
8. WHEN more than one pattern from criteria 3–7 matches the same function, THE Analyzer SHALL include all matching suggestions, ordered by the score contribution of the triggering construct (highest first).
9. THE Tool SHALL render a collapsible toggle element within every Function_Result row regardless of whether suggestions exist; rows with no suggestions SHALL display the label "No suggestions" when expanded.
10. WHEN the user expands a Function_Result's suggestions, THE Tool SHALL display each suggestion as a concise, plain-English instruction of no more than 120 characters.

---

### Requirement 7: Results Display

**User Story:** As a developer, I want a clear, scannable results table, so that I can quickly compare complexity scores across all functions in a file.

#### Acceptance Criteria

1. WHEN analysis completes, THE Tool SHALL display a results table listing each Function_Result with columns: Function Name, Lines (start–end), Cyclomatic, Cognitive, Risk Level, and Suggestions; clicking the Suggestions cell for a row SHALL reveal that row's suggestion list inline and a second click SHALL collapse it.
2. WHEN analysis completes, THE Tool SHALL display a summary bar above the results table showing: total functions analyzed, count per Risk_Level category, and the name and cyclomatic score of the function with the single highest Cyclomatic_Complexity value.
3. THE Tool SHALL render all numeric values (Cyclomatic, Cognitive, line numbers) in a monospace typeface visually distinct from the surrounding proportional text.
4. WHEN a column header (Function Name, Cyclomatic, Cognitive, or Risk Level) is clicked, THE Tool SHALL sort the results table by that column; the first click sorts ascending, the second click on the same header sorts descending; the active sort column and direction SHALL be indicated by a visible arrow or marker on the header; the default state before any header is clicked is unsorted (results appear in parse order).
5. WHEN no analysis has been run yet, THE Tool SHALL display the message "Paste or upload code, then click Analyze." in the results area with no table structure visible.
6. WHEN analysis produces zero Function_Results, THE Tool SHALL display the results table column headers with no data rows and the message "No functions detected. Check that the selected language matches your code." below the header row.

---

### Requirement 8: Export

**User Story:** As a developer, I want to export the analysis results, so that I can share them in code reviews or track complexity over time.

#### Acceptance Criteria

1. WHEN the user clicks the "Copy JSON" button and analysis results exist, THE Tool SHALL copy a JSON array of all Function_Results (including function name, start line, end line, cyclomatic score, cognitive score, risk level, and suggestions array) to the clipboard.
2. WHEN the user clicks the "Download CSV" button and analysis results exist, THE Tool SHALL trigger a browser download of a CSV file with the following ordered columns: Function Name, Start Line, End Line, Cyclomatic, Cognitive, Risk Level, Suggestions (semicolon-separated within the cell).
3. WHEN the clipboard write succeeds, THE Tool SHALL change the "Copy JSON" button label to "Copied ✓" for 2 seconds before reverting to "Copy JSON".
4. WHEN the clipboard write is attempted but the API throws an error (API present but write fails), THE Tool SHALL display an inline error message indicating the copy failed and suggesting the user use the fallback textarea.
5. IF the clipboard API is unavailable (non-secure context), THEN THE Tool SHALL display the JSON output in a read-only textarea pre-populated with the JSON string, for manual copying.
6. THE Tool SHALL name downloaded CSV files using the pattern `complexity-report-{timestamp}.csv`, where `{timestamp}` is the ISO 8601 date and time at the moment of download, without colons (e.g., `complexity-report-20250819T143022.csv`).
7. WHEN no analysis results exist (analysis has not been run or was cleared), THE Tool SHALL disable the "Copy JSON" and "Download CSV" buttons and display no error on click.

---

### Requirement 9: Client-Side Processing and Privacy

**User Story:** As a developer, I want all analysis to happen in my browser, so that sensitive proprietary code never leaves my machine.

#### Acceptance Criteria

1. THE Analyzer SHALL perform all parsing and metric computation using JavaScript executed in the browser — no code input, partial input, or result data SHALL be transmitted to any server, remote endpoint, or networked host outside the local browser process.
2. THE Tool SHALL display a status indicator in the footer bar with the text `Client-Side · No Upload` styled in a muted monospace typeface — this indicator SHALL NOT appear inside any header block within the tool card.
3. WHEN the browser has no active internet connection after the initial page load, THE Tool SHALL produce the same analysis results as when a network connection is present, relying solely on in-memory JavaScript execution; no feature SHALL degrade or become unavailable due to the absence of a network connection.

---

### Requirement 10: UI Structure and Platform Compliance

**User Story:** As a developer using C³ MindLoop, I want the Code Complexity Analyzer to look and behave like every other tool on the platform, so that the experience is consistent and familiar.

#### Acceptance Criteria

1. THE Page SHALL render exactly one `<h1>` element containing the tool title, positioned inside the breadcrumb + metadata header block, above the Tool component container.
2. THE Tool component SHALL begin with the action toolbar row as its first rendered element — no title block, logo, icon+title row, or subtitle SHALL appear inside the tool card before the toolbar.
3. THE Tool SHALL use `bg-neutral-950` as the card outer surface background, `bg-neutral-900` for the toolbar sub-surface and any panel sub-surfaces, and `border-neutral-800` for the card outer border, the toolbar bottom border, and all internal panel dividers — no neon or bright background colors.
4. THE Page SHALL implement the breadcrumb + metadata header block containing: an ArrowLeft icon and "← Developer Tools" back-link to `/tools`, the tool `<h1>` title, and a `100% Client-Side · Local Browser Processing` badge — this block SHALL be rendered in `CodeComplexityAnalyzerPage.tsx`, not inside `CodeComplexityAnalyzerTool.tsx`.
5. WHEN the user activates the Analyze, Copy JSON, Download CSV, Load Sample, or Clear actions, THE Tool SHALL call `trackEvent` from `app/lib/analytics.ts` with `GA_EVENTS.TOOL_ACTION` and the payload `{ tool_name: 'code_complexity_analyzer', action: 'analyze' | 'copy_json' | 'download_csv' | 'load_sample' | 'clear' }` respectively.
6. THE Tool SHALL be accessible at the route `/tools/code-complexity-analyzer` via a Next.js App Router `page.tsx` file at `app/tools/code-complexity-analyzer/page.tsx` that renders the `CodeComplexityAnalyzerPage` view component.
