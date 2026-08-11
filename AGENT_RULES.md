# C³ MindLoop - Agent Rules for New Developer Tools


Rules for all AI agents (Amazon Q, Kiro, GitHub Copilot, Claude Code, Cursor, etc.) building new tools in this project.
Read this file before writing any code. These rules are non-negotiable.

---

## 1. Brand & Copywriting

### Brand Name
- Always render as: **C³ MindLoop** (superscript ³, not C3 or C^3)
- In HTML/JSX: `C<sup>³</sup> MindLoop` or the Unicode character `C³ MindLoop`
- In metadata strings (title, description, og:title): use the Unicode form `C³ MindLoop`

### Banned Characters
- **NO AI EM-DASHES (—)**. Use a hyphen `-` or colon `:` instead.
  - Wrong: `JWT Inspector — Token Decoder`
  - Correct: `JWT Inspector & Token Decoder` or `JWT Inspector: Token Decoder`

### Banned Words & Phrases
Never use any of the following in UI copy, metadata, comments, or documentation:

| Banned | Use instead |
|--------|-------------|
| Seamlessly | (just describe what it does) |
| Cutting-edge | (omit or be specific) |
| Revolutionary | (omit) |
| Empower / Empowering | (omit) |
| Paradigm | (omit) |
| Crafted with passion | (omit) |
| Ecosystem (as marketing fluff) | platform, set of tools |
| Leverage (as a verb) | use |
| Real engineering craft | (omit) |
| Next-level | (omit) |

### Tone
Write direct, developer-to-developer English. State what the tool does, list its controls, and stop.
No motivational padding. No marketing preamble.

---

## 2. Architecture & Privacy Rules

### Client-Side First - Non-Negotiable
- All data processing must run 100% in the user's browser.
- Zero server-side API calls that receive user input data.
- Zero data retention of any kind.
- Use native browser APIs: `JSON.parse`, `atob`, `btoa`, `TextEncoder`, `TextDecoder`, `crypto.subtle`, `FileReader`, etc.
- If a feature genuinely requires a network call (e.g., fetching a public JWKS endpoint), it must be opt-in, clearly labeled, and the user must initiate it explicitly.

### No New Backend Dependencies
Do not introduce:
- New API routes that receive user payload data
- Database connections or ORM models
- Server-side authentication flows
- Third-party analytics SDKs that transmit user input

### Privacy Badge
Every tool page must display the standard privacy badge in the breadcrumb header:

```tsx
<span className="text-[11px] font-mono text-neutral-400 bg-surface px-2.5 py-1 rounded border border-theme-subtle shrink-0">
  100% Client-Side - Local Browser Processing
</span>
```

And a footer privacy note inside the tool card:

```tsx
<span className="text-[10px] font-mono text-neutral-500">
  Local browser processing - No data sent to any server
</span>
```

---

## 3. Required File Structure

For a new tool named `my-tool`, create exactly these files:

```
app/
  tools/
    my-tool/
      page.tsx              <- Next.js route with metadata export
  views/
    MyToolPage.tsx          <- Page layout: breadcrumb + H1 + <MyTool /> + feature cards + <CTASection />
  components/
    tools/
      MyTool.tsx            <- The interactive tool component (toolbar-first, no inner H1)
  config/
    seo.config.ts           <- Add myTool entry + myToolSchema export (edit existing file)
  messages/
    en.json                 <- Add tools.myTool.* keys (edit existing file)
    de.json                 <- Mirror keys with translated strings
    es.json                 <- Mirror keys with translated strings
    ja.json                 <- Mirror keys with translated strings
```

### page.tsx - Required Shape

```tsx
// app/tools/my-tool/page.tsx
import type { Metadata } from 'next';
import { MyToolPage } from './../../views/MyToolPage';
import { seoConfig, myToolSchema } from './../../config/seo.config';

const { myTool } = seoConfig;

export const metadata: Metadata = {
  title: myTool.title,
  description: myTool.description,
  keywords: [...myTool.keywords],
  alternates: { canonical: myTool.canonical },
  openGraph: myTool.openGraph,
  twitter: { card: 'summary_large_image', ...myTool.twitter },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(myToolSchema) }}
      />
      <MyToolPage />
    </>
  );
}
```

### seo.config.ts - Required Entry Shape

```ts
myTool: {
  title: 'My Tool Name - Free Online Tool',
  description: 'One sentence. What it does. 100% client-side, zero data transmission.',
  keywords: ['primary keyword', 'long-tail keyword', 'C³ MindLoop my tool'],
  canonical: `${BASE_URL}/tools/my-tool`,
  openGraph: {
    title: 'My Tool Name - Free Online Tool | C³ MindLoop',
    description: 'Short og description. 100% client-side.',
    url: `${BASE_URL}/tools/my-tool`,
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'My Tool - C³ MindLoop' }],
  },
  twitter: {
    title: 'My Tool Name - Free | C³ MindLoop',
    description: 'Short twitter description.',
    images: [defaultOgImage],
  },
},
```

And a JSON-LD schema export:

```ts
export const myToolSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'My Tool Name',
  url: `${BASE_URL}/tools/my-tool`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All Web Browsers',
  description: 'One sentence description.',
  featureList: ['Feature 1', 'Feature 2', 'Zero data transmission - fully private'],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};
```

---

## 4. Page Layout Rules (MyToolPage.tsx)

### Single H1 Policy - Strictly Enforced
- Every tool page has exactly ONE `<h1>` tag.
- It lives in `*Page.tsx`, inside the breadcrumb header block.
- The `*Tool.tsx` component must NOT contain any `<h1>`, `<h2>` title headers, logo boxes, icon+title rows, or branded subtitle blocks.

### Required Page Structure

```tsx
// app/views/MyToolPage.tsx
'use client';

export const MyToolPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="pt-6 sm:pt-8 pb-16 bg-app text-theme-main relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">

        {/* Breadcrumb + H1 - ONLY heading on this page */}
        <div className="space-y-1.5 border-b border-theme-subtle pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-theme-muted">
            <Link to="/tools" className="hover:text-theme-main transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('tools.myTool.breadcrumbParent')}</span>
            </Link>
            <span>/</span>
            <span className="text-[#1D9BF0] font-semibold">{t('tools.myTool.breadcrumb')}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-theme-main">
              {t('tools.myTool.pageTitle')}
            </h1>
            <span className="text-[11px] font-mono text-neutral-400 bg-surface px-2.5 py-1 rounded border border-theme-subtle shrink-0">
              {t('tools.myTool.pageBadge')}
            </span>
          </div>
        </div>

        {/* Tool component - starts directly with toolbar, no inner heading */}
        <MyTool />

        {/* 3-column feature info cards */}
        <div className="pt-12 border-t border-theme-subtle grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono text-theme-muted">
          {/* 3x feature cards */}
        </div>

        <CTASection />
      </div>
    </div>
  );
};
```

---

## 5. Tool Component Rules (MyTool.tsx)

### Component Card Structure - Required Order

```
<div card>
  <div toolbar>     <- FIRST element: all action buttons (primary actions, options, Copy, Clear)
  <div editor>      <- Input/output panels
  <div footer>      <- Privacy note + "Client-Side" status badge
</div>
```

### Toolbar First
The very first child of the tool card must be the action toolbar. No exceptions.
Do not place a title, subtitle, icon row, or description above the toolbar inside the card.

### Responsive Layout
- Desktop (`lg:`): side-by-side 2-column grid for input/output panels
- Mobile: stacked single-column
- Use `grid grid-cols-1 lg:grid-cols-2 gap-4` for the editor panels container.

### Error Handling
- All tool logic must be wrapped in try/catch.
- Display inline validation errors below the relevant input - never use `alert()` or `console.error()` only.
- The component must never throw an unhandled exception that crashes the page.
- Use a React error boundary at the page level if the tool has complex state.

### Minimal Example Shape

```tsx
// app/components/tools/MyTool.tsx
'use client';

export const MyTool: React.FC = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleProcess = () => {
    try {
      setError('');
      // 100% client-side processing here
      setOutput(/* result */);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Processing failed.');
    }
  };

  return (
    <div className="rounded-lg border border-theme-subtle bg-surface overflow-hidden">
      {/* Toolbar - always first */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-theme-subtle bg-neutral-950">
        <button onClick={handleProcess}>Process</button>
        {/* other action buttons */}
      </div>

      {/* Editor panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-theme-subtle">
        <div className="p-3">
          <textarea value={input} onChange={e => setInput(e.target.value)} />
          {error && <p className="text-red-400 text-xs mt-1 font-mono">{error}</p>}
        </div>
        <div className="p-3">
          <pre>{output}</pre>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-theme-subtle flex items-center justify-between">
        <span className="text-[10px] font-mono text-neutral-500">
          {t('tools.myTool.privacyNote')}
        </span>
        <span className="text-[10px] font-mono text-neutral-500">Client-Side</span>
      </div>
    </div>
  );
};
```

---

## 6. Localization Rules

All UI strings must go through the `useTranslation()` hook. No hardcoded English strings in components.

### Required Keys for Every New Tool

Add these keys to `app/messages/en.json` under `tools.myTool`:

```json
"myTool": {
  "pageTitle": "My Tool Name",
  "pageBadge": "100% Client-Side - Local Browser Processing",
  "breadcrumb": "My Tool",
  "breadcrumbParent": "Developer Tools",
  "inputLabel": "Input",
  "inputPlaceholder": "Paste input here...",
  "outputLabel": "Output",
  "outputPlaceholder": "Output will appear here...",
  "process": "Process",
  "copy": "Copy",
  "copied": "Copied!",
  "clear": "Clear",
  "loadSample": "Load Sample",
  "errorInvalid": "Invalid input. [specific reason].",
  "privacyNote": "Local browser processing - No data sent to any server",
  "feat1Title": "Feature 1 Title",
  "feat1Desc": "One sentence. What it does technically.",
  "feat2Title": "Feature 2 Title",
  "feat2Desc": "One sentence.",
  "feat3Title": "Feature 3 Title",
  "feat3Desc": "One sentence."
}
```

Mirror all keys in `de.json`, `es.json`, and `ja.json` with translated strings.
Do not leave any locale file missing keys that exist in `en.json`.

---

## 7. Styling Conventions

Follow the existing design tokens. Do not introduce new color values or Tailwind config changes.

| Element | Class |
|---------|-------|
| Card container | `rounded-lg border border-theme-subtle bg-surface overflow-hidden` |
| Toolbar row | `flex flex-wrap items-center gap-2 px-3 py-2 border-b border-theme-subtle bg-neutral-950` |
| Primary action button | `px-3 py-1.5 text-xs font-mono bg-[#1D9BF0] text-white rounded hover:bg-[#1a8cd8] transition-colors` |
| Secondary button | `px-3 py-1.5 text-xs font-mono border border-theme-subtle text-theme-muted rounded hover:text-theme-main hover:border-neutral-600 transition-colors` |
| Textarea / pre | `w-full h-full min-h-[280px] bg-transparent text-xs font-mono text-theme-main resize-none outline-none` |
| Error text | `text-red-400 text-xs mt-1 font-mono` |
| Footer bar | `px-3 py-2 border-t border-theme-subtle flex items-center justify-between` |
| Privacy note | `text-[10px] font-mono text-neutral-500` |
| Section label | `text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1` |

---

## 8. Metadata Title Format

Page titles must follow this exact format:

```
{Tool Name} - Free Online Tool | C³ MindLoop
```

Examples:
- `JSON Formatter, Validator & Beautifier - Free Online Tool | C³ MindLoop`
- `JWT Decoder & Inspector - Free Online Tool | C³ MindLoop`
- `Base64 Encoder & Decoder - Free Online Tool | C³ MindLoop`

Do not use em-dashes in titles. Use hyphens `-` or ampersands `&`.

---

## 9. Feature Info Cards (Below Tool)

Every tool page must include exactly 3 feature info cards below the tool component, inside a `grid grid-cols-1 md:grid-cols-3` layout. Each card covers one key technical capability of the tool.

Card content rules:
- Title: short noun phrase, no fluff
- Description: 1-2 sentences, technical and specific
- No icons required - text only is fine
- All strings must use `t()` keys

---

## 10. Checklist Before Submitting a New Tool

- [ ] `app/tools/[tool-name]/page.tsx` exists with `metadata` export
- [ ] `app/views/[ToolName]Page.tsx` has exactly one `<h1>` tag
- [ ] `app/components/tools/[ToolName]Tool.tsx` starts with toolbar row, no inner heading
- [ ] Tool card has responsive 2-col desktop / 1-col mobile layout
- [ ] All processing is 100% client-side, no fetch/axios calls with user data
- [ ] All errors are caught and displayed inline
- [ ] `seoConfig.myTool` entry added to `app/config/seo.config.ts`
- [ ] JSON-LD schema export added to `app/config/seo.config.ts`
- [ ] All UI strings use `t()` - no hardcoded English in components
- [ ] `en.json`, `de.json`, `es.json`, `ja.json` all have the new tool keys
- [ ] No em-dashes (—) anywhere in copy, metadata, or comments
- [ ] No banned buzzwords in any user-facing string
- [ ] Privacy badge present in page header
- [ ] Privacy note present in tool card footer
- [ ] `<CTASection />` included at the bottom of the page view
