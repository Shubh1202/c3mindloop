# Implementation Plan

- [x] 1. Create shared types and constants
  - Create `app/components/tools/complexityAnalyzer/complexityTypes.ts` with all shared TypeScript types: `SupportedLanguage`, `FunctionResult`, `RiskLevel`, `RefactorSuggestion`, `AnalysisResult`, `SortColumn`, `SortDirection`
  - Create `app/components/tools/complexityAnalyzer/complexityConstants.ts` with: accepted extensions list, extension-to-language mapping, risk-level Tailwind class maps, suggestion max-length constant (120), and sample code snippet (at least 3 functions, at least one with nested control structure)
  - No React imports; pure TypeScript only

- [x] 2. Create languageDetector.ts
  - Depends on: 1
  - Create `app/components/tools/complexityAnalyzer/languageDetector.ts`
  - Implement `detectFromExtension(filename: string): SupportedLanguage | null` using the extension-to-language map
  - Implement `detectFromCode(code: string): { language: SupportedLanguage; assumed: boolean }` that scores heuristic signals per language (def→Python, func→Go, #include→C/C++, import/const/let→JS/TS), selects highest-score language, ties default to JavaScript, returns `assumed: true` only when zero signals matched
  - No React imports; pure functions only

- [x] 3. Create complexityEngine.ts
  - Depends on: 1
  - Create `app/components/tools/complexityAnalyzer/complexityEngine.ts`
  - Implement regex/heuristic-based function detection for all 7 languages: named functions, methods, named-variable arrow/anonymous functions; exclude IIFEs and unassigned anonymous functions; capture start/end line and function name
  - Implement cyclomatic complexity: base 1 per function, count if/else if/elif/for/while/do/case/catch/&&/||/ternary; nested-function decision points must NOT count toward outer function
  - Implement cognitive complexity: structural constructs with nesting-depth penalty (depth before entering); logical operator runs (+1 per type-change run); ternary with nesting penalty; nested function resets nesting depth to 0 independently
  - Implement `computeRiskLevel(cyclomatic: number, cognitive: number): RiskLevel` using priority order: Critical(>20 OR >24) → High(>10 OR >15) → Medium(>5 OR >7) → Low
  - Implement `generateSuggestions(...)` for all 5 patterns: >3 nested levels, >4 if/else if branches, cognitive>15+multiple logical sequences, >50 lines, cyclomatic>10; order by score contribution descending; each suggestion ≤120 chars
  - Implement `analyzeCode(code: string, language: SupportedLanguage): AnalysisResult` returning `{ results, partial, errorMessage }`; handle syntax errors gracefully with partial results
  - No React, no fetch, no network calls; pure TypeScript only

- [x] 4. Create CodeComplexityAnalyzerTool.tsx
  - Depends on: 1, 2, 3
  - Create `app/components/tools/CodeComplexityAnalyzerTool.tsx`
  - First rendered element MUST be the action toolbar (Analyze, Upload, Load Sample, Clear, Copy JSON, Download CSV)
  - Implement file upload: accept listed extensions; 500 KB limit with inline error; binary/unreadable inline error; preserve existing input on rejection; replace on valid upload; detect language from extension
  - Implement language selector with "assumed" inline label when Language_Detector returned assumed:true and no manual override has been made; manual override suppresses the assumed label
  - Implement Analyze button triggering analyzeCode; show analyzing state for large inputs; re-run when language changes
  - Implement results table with columns: Function Name / Lines / Cyclomatic / Cognitive / Risk Level / Suggestions; sortable by Function Name, Cyclomatic, Cognitive, Risk Level (ascending first click, descending second); visible sort indicator; parse order default; monospace numeric values
  - Implement summary bar above table: total functions, per-risk-level counts, highest-cyclomatic function name + score
  - Implement collapsible suggestions per row (every row gets toggle regardless); "No suggestions" label when none exist; suggestion list when expanded
  - Implement risk badges with exact Tailwind classes: Low→text-emerald-400 bg-emerald-950, Medium→text-amber-400 bg-amber-950, High→text-orange-400 bg-orange-950, Critical→text-red-400 bg-red-950; plain-text text-neutral-300 fallback
  - Implement three display states: no-analysis ("Paste or upload code, then click Analyze."), zero-results (headers + no-functions message), results
  - Implement Copy JSON: clipboard write → "Copied ✓" 2 seconds; API present but write throws → inline error + suggest fallback textarea; clipboard API unavailable (non-secure context) → show read-only fallback textarea pre-populated with JSON
  - Implement Download CSV: exact column order (Function Name, Start Line, End Line, Cyclomatic, Cognitive, Risk Level, Suggestions); semicolon-separated suggestions; filename `complexity-report-{timestamp}.csv` without colons; disabled when no results
  - Implement Clear: resets all state; fires trackEvent
  - Footer bar: "Client-Side · No Upload" in muted monospace; NOT inside any header block within the tool card
  - Call trackEvent(GA_EVENTS.TOOL_ACTION, { tool_name: 'code_complexity_analyzer', action: '...' }) for analyze/copy_json/download_csv/load_sample/clear; never include user code in analytics payload
  - bg-neutral-950 card, bg-neutral-900 toolbar and panel surfaces, border-neutral-800 borders

- [x] 5. Create CodeComplexityAnalyzerPage.tsx
  - Depends on: 4
  - Create `app/views/CodeComplexityAnalyzerPage.tsx`
  - Follow exact DiffCheckerPage.tsx / RegexTesterPage.tsx pattern
  - Render exactly ONE `<h1>` with title "Code Complexity Analyzer" inside the breadcrumb + metadata header block
  - Breadcrumb: ArrowLeft icon + "← Developer Tools" link to /tools, tool name segment in text-[#1D9BF0]
  - Badge: "100% Client-Side · Local Browser Processing" in muted monospace matching existing pages
  - Mount `<CodeComplexityAnalyzerTool />` below the header block
  - No analyzer logic in this file; 'use client' directive at top

- [x] 6. Create App Router route and register SEO config
  - Depends on: 5
  - Add `codeComplexityAnalyzer` entry to `app/config/seo.config.ts` following the diffChecker/hashGenerator pattern with title, description, keywords, canonical, openGraph, twitter
  - Create `app/tools/code-complexity-analyzer/page.tsx` following exact pattern of `app/tools/diff-checker/page.tsx`
  - Export Next.js `metadata` object using the new seo.config entry
  - Default export renders `<CodeComplexityAnalyzerPage />`

- [x] 7. Build verification and quality checks
  - Depends on: 3, 4, 5, 6
  - Run `npm run type-check` and fix all TypeScript errors until zero errors remain
  - Run `npm run lint` and fix all ESLint errors
  - Run `npm run build` and confirm clean production build
  - Verify no unused imports, no unused variables, no untyped `any` (comment-justify any that are truly unavoidable)
  - Verify privacy: confirm no fetch/axios/API routes/server actions in the new analyzer files
  - Provide final implementation report: files created, files modified, parser approach used per language, build result, any requirement that could not be fully implemented and why
