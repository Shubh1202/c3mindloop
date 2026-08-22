# Design Document — Password & Shuffle Generator

## Overview

A single tool card with two modes: **Password Generator** and **Shuffle Generator**. Everything runs 100% in the browser via `crypto.getRandomValues`. No backend, no persistence, no network requests. The tool integrates into the existing platform using the identical file layout, class tokens, and patterns as `HashGeneratorTool` / `HashGeneratorPage`.

---

## Architecture

### File Structure

```
app/
├── components/tools/
│   └── PasswordShuffleGeneratorTool.tsx   ← Tool component (no H1 inside)
├── views/
│   └── PasswordShuffleGeneratorPage.tsx   ← Page component (H1 + breadcrumb + ToolSeoWrapper)
├── tools/
│   └── password-shuffle-generator/
│       └── page.tsx                       ← Next.js route with metadata export
├── config/
│   └── seo.config.ts                      ← Add passwordShuffleGenerator entry
├── lib/
│   └── constants.ts                       ← Add PRODUCTS_LIST entry
└── messages/
    └── en.json                            ← Add passwordShuffleGenerator translation keys
```

### Component Hierarchy

```
PasswordShuffleGeneratorPage
├── breadcrumb nav row  (ArrowLeft + Link to /tools)
├── <h1>Password & Shuffle Generator</h1>
├── status badge  "100% Client-Side • crypto.getRandomValues"
├── PasswordShuffleGeneratorTool           ← tool card starts directly with toolbar
│   ├── Toolbar  (bg-neutral-900 border-b border-neutral-800)
│   │   ├── Mode Toggle  [Password | Shuffle]
│   │   ├── Load Sample button
│   │   ├── Clear button  (destructive style)
│   │   └── Fullscreen toggle  (Maximize2 / Minimize2)
│   ├── [Password mode panel]
│   │   ├── Config row  (length input + 4 char-type toggles + Exclude Ambiguous)
│   │   ├── Entropy / Strength bar  (live, no animation)
│   │   ├── Password output  (read-only, monospace, bg-neutral-900/90)
│   │   └── Copy button
│   ├── [Shuffle mode panel]
│   │   ├── Shuffle Input textarea  (monospace, bg-neutral-900/90)
│   │   ├── Shuffle button
│   │   ├── Shuffle Output textarea  (read-only, monospace, bg-neutral-900/90)
│   │   └── Copy button
│   └── Footer bar  "Client-Side • No data sent to any server"
├── ToolSeoWrapper toolKey="passwordShuffleGenerator"
└── CTASection
```

---

## Component Design

### `PasswordShuffleGeneratorTool.tsx`

**Props:** none  
**State:**

| State variable | Type | Purpose |
|---|---|---|
| `mode` | `'password' \| 'shuffle'` | Active sub-section |
| `isFullScreen` | `boolean` | Fullscreen overlay active |
| `pwLength` | `number` | Password length (8–128), default 16 |
| `pwUpper` | `boolean` | Uppercase enabled, default true |
| `pwLower` | `boolean` | Lowercase enabled, default true |
| `pwDigits` | `boolean` | Digits enabled, default true |
| `pwSymbols` | `boolean` | Symbols enabled, default true |
| `pwExcludeAmbiguous` | `boolean` | Exclude ambiguous chars, default false |
| `pwOutput` | `string` | Generated password |
| `pwCopied` | `boolean` | Copy feedback active |
| `shuffleInput` | `string` | Shuffle textarea value |
| `shuffleOutput` | `string` | Shuffle result |
| `shuffleCopied` | `boolean` | Copy feedback active |
| `shuffleError` | `string` | Inline error message |
| `cryptoError` | `boolean` | crypto.getRandomValues unavailable |

---

### Core Logic (pure functions, no external deps)

#### `buildCharset(upper, lower, digits, symbols, excludeAmbiguous): string`

Assembles the active character set:
- Uppercase pool: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`
- Lowercase pool: `abcdefghijklmnopqrstuvwxyz`
- Digits pool: `0123456789`
- Symbols pool: `!@#$%^&*()-_=+[]{}|;:,.<>?`
- If `excludeAmbiguous` is true, strip `0`, `O`, `l`, `1`, `I` from the assembled string.
- Returns the deduplicated combined string.

#### `generatePassword(charset: string, length: number): string`

```
const buf = new Uint32Array(length);
crypto.getRandomValues(buf);
return Array.from(buf)
  .map(n => charset[n % charset.length])
  .join('');
```

Uses rejection sampling is not required here — modulo bias is negligible for password generation when charset sizes are << 2^32.

#### `computeEntropy(charsetSize: number, length: number): number`

```
if (charsetSize === 0) return 0;
return Math.floor(length * Math.log2(charsetSize));
```

#### `strengthLabel(entropy: number): { label: string; colorClass: string }`

| entropy | label | colorClass |
|---|---|---|
| < 40 | Weak | `text-red-400` |
| 40–59 | Fair | `text-amber-400` |
| 60–79 | Strong | `text-sky-400` |
| ≥ 80 | Very Strong | `text-emerald-400` |

#### `fisherYatesShuffle<T>(items: T[]): T[]`

```
const arr = [...items];
for (let i = arr.length - 1; i > 0; i--) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  const j = buf[0] % (i + 1);
  [arr[i], arr[j]] = [arr[j], arr[i]];
}
return arr;
```

Uses `crypto.getRandomValues` per swap. For lists up to 500 items this is fast enough synchronously.

#### `shuffleText(input: string): string`

1. Split input on `\n`, filter empty lines → `lines[]`
2. If `lines.length === 0` → return error "Enter at least one item to shuffle"
3. If `lines.length === 1` → split that line into individual characters, shuffle characters, rejoin
4. If `lines.length > 1` → shuffle lines array, rejoin with `\n`

---

### Fullscreen Behaviour

Matches `HashGeneratorTool` exactly:
```ts
useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isFullScreen) setIsFullScreen(false);
  };
  const navbar = document.querySelector('header') as HTMLElement | null;
  if (isFullScreen) {
    document.body.style.overflow = 'hidden';
    if (navbar) navbar.style.display = 'none';
    window.addEventListener('keydown', handleKey);
  } else {
    document.body.style.overflow = '';
    if (navbar) navbar.style.display = '';
  }
  return () => {
    document.body.style.overflow = '';
    if (navbar) navbar.style.display = '';
    window.removeEventListener('keydown', handleKey);
  };
}, [isFullScreen]);
```

Root container class:
```
isFullScreen
  ? 'fixed inset-0 z-[9999] overflow-hidden'
  : 'w-full rounded-lg shadow-2xl'
```
Always includes: `bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-100 flex flex-col`

---

### Toolbar Layout

```tsx
<div className="px-3 py-2.5 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2">
  {/* Left group */}
  <div className="flex items-center gap-2 flex-wrap">
    {/* Mode toggle */}
    <div className="flex items-center bg-neutral-950 p-1 rounded border border-neutral-800 text-[11px] font-sans">
      <button className={mode === 'password' ? 'bg-[#1D9BF0] text-white ...' : 'text-neutral-400 ...'}>
        Password
      </button>
      <button className={mode === 'shuffle' ? 'bg-[#1D9BF0] text-white ...' : 'text-neutral-400 ...'}>
        Shuffle
      </button>
    </div>
    {/* Load Sample */}
    <button className="px-2.5 py-1.5 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-[11px] font-sans ...">
      Load Sample
    </button>
    {/* Clear (destructive) */}
    <button className="px-2.5 py-1.5 rounded bg-neutral-800/80 hover:bg-red-950 hover:text-red-300 text-neutral-400 text-[11px] font-sans ...">
      <Trash2 /> Clear
    </button>
  </div>
  {/* Right group */}
  <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 ...">
    {isFullScreen ? <Minimize2 /> : <Maximize2 />}
  </button>
</div>
```

---

### Password Panel Layout

```
┌─ Config row ──────────────────────────────────────────────────────┐
│  Length: [___16___]  [A-Z ✓] [a-z ✓] [0-9 ✓] [!@# ✓]  [No Ambig] │
└───────────────────────────────────────────────────────────────────┘
┌─ Entropy row ─────────────────────────────────────────────────────┐
│  Entropy: 95 bits  ·  Very Strong  [text-emerald-400]              │
└───────────────────────────────────────────────────────────────────┘
┌─ Output ──────────────────────────────────────────────────────────┐
│  [read-only monospace input  bg-neutral-900/90]        [Copy]     │
└───────────────────────────────────────────────────────────────────┘
         [Regenerate button  — primary blue bg-[#1D9BF0]]
```

Inline error (when no char types selected):
```tsx
<p className="text-xs text-amber-400 font-mono">Select at least one character type</p>
```

Guaranteed-inclusion logic: after `generatePassword`, if a required category has no representative character in the output, replace random positions with one char from each required category before returning. This ensures the password always satisfies the selected toggles.

---

### Shuffle Panel Layout

```
┌─ Input ───────────────────────────────────────────────────────────┐
│  [textarea  min-h-[160px]  bg-neutral-900/90  monospace]           │
└───────────────────────────────────────────────────────────────────┘
         [Shuffle button  — primary blue]

┌─ Output ──────────────────────────────────────────────────────────┐
│  [read-only textarea  min-h-[160px]  bg-neutral-900/90  mono]      │
│                                                      [Copy]       │
└───────────────────────────────────────────────────────────────────┘
{shuffleError && <p className="text-xs text-amber-400 font-mono">{shuffleError}</p>}
```

On input change (after a shuffle has been run): clear `shuffleOutput` and `shuffleError`.

---

### Footer Bar

```tsx
<div className="px-4 py-2 bg-neutral-900/80 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
  <div className="flex items-center gap-1.5 text-neutral-400">
    <Info className="w-3.5 h-3.5 text-neutral-500" />
    <span>Client-Side · No data sent to any server</span>
  </div>
  <div className="flex items-center gap-1.5 text-neutral-500">
    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
    <span>crypto.getRandomValues</span>
  </div>
</div>
```

---

## Page Component: `PasswordShuffleGeneratorPage.tsx`

Mirrors `HashGeneratorPage` exactly:

```tsx
'use client';
export const PasswordShuffleGeneratorPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="pt-6 sm:pt-8 pb-16 bg-app text-theme-main relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb + H1 */}
        <div className="space-y-1.5 border-b border-theme-subtle pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-theme-muted">
            <Link to="/tools" className="hover:text-theme-main ...">
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('tools.passwordShuffleGenerator.breadcrumbParent', 'Developer Tools')}
            </Link>
            <span>/</span>
            <span className="text-[#1D9BF0] font-semibold">
              {t('tools.passwordShuffleGenerator.breadcrumb', 'Password & Shuffle Generator')}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-theme-main">
              {t('tools.passwordShuffleGenerator.pageTitle', 'Password & Shuffle Generator')}
            </h1>
            <span className="text-[11px] font-mono text-neutral-400 bg-surface px-2.5 py-1 rounded border border-theme-subtle shrink-0">
              {t('tools.passwordShuffleGenerator.pageBadge', '100% Client-Side • crypto.getRandomValues')}
            </span>
          </div>
        </div>
        <PasswordShuffleGeneratorTool />
        <ToolSeoWrapper toolKey="passwordShuffleGenerator" />
        <CTASection />
      </div>
    </div>
  );
};
```

---

## Route: `app/tools/password-shuffle-generator/page.tsx`

```tsx
import type { Metadata } from 'next';
import { PasswordShuffleGeneratorPage } from '@/app/views/PasswordShuffleGeneratorPage';
import { seoConfig } from '../../config/seo.config';

const { passwordShuffleGenerator } = seoConfig;

export const metadata: Metadata = {
  title: passwordShuffleGenerator.title,
  description: passwordShuffleGenerator.description,
  keywords: passwordShuffleGenerator.keywords,
  alternates: { canonical: passwordShuffleGenerator.canonical },
  openGraph: passwordShuffleGenerator.openGraph,
  twitter: passwordShuffleGenerator.twitter,
};

export default function Page() {
  return <PasswordShuffleGeneratorPage />;
}
```

---

## SEO Config Entry (`seo.config.ts`)

New key `passwordShuffleGenerator` added to `seoConfig`:

```ts
passwordShuffleGenerator: {
  title: 'Password Generator & List Randomizer - Free Online Tool | 100% Private | C³ MindLoop',
  description:
    'Free online password generator and shuffle/randomizer. Generate cryptographically secure passwords and shuffle any list or string. 100% client-side via crypto.getRandomValues, zero server upload.',
  keywords: [
    'password generator', 'random password generator', 'secure password generator',
    'password generator online', 'strong password generator', 'password creator',
    'list randomizer', 'shuffle list online', 'text shuffler', 'random list generator',
    'randomize list online', 'item shuffler', 'word randomizer',
    'crypto.getRandomValues', 'cryptographic password', 'entropy calculator',
    '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant', 'Free Online Utility',
    'fisher yates shuffle', 'password strength checker', 'entropy bits password',
    'C³ MindLoop password tool', 'ccube password generator',
  ],
  canonical: `${BASE_URL}/tools/password-shuffle-generator`,
  openGraph: {
    title: 'Password Generator & List Randomizer - Free | C³ MindLoop',
    description:
      'Generate cryptographically secure passwords and shuffle any list. 100% Private, zero server upload.',
    url: `${BASE_URL}/tools/password-shuffle-generator`,
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Password & Shuffle Generator - C³ MindLoop' }],
  },
  twitter: {
    title: 'Password Generator & List Randomizer - Free | C³ MindLoop',
    description: 'Cryptographically secure passwords + list shuffler. 100% Private & Client-Side.',
    images: [defaultOgImage],
  },
},
```

---

## PRODUCTS_LIST Entry (`constants.ts`)

```ts
{
  id: 'password-shuffle-generator',
  nameKey: 'Password & Shuffle Generator',
  descKey: 'Generate cryptographically secure passwords and shuffle any list or string. 100% client-side via crypto.getRandomValues.',
  status: 'live',
  category: 'crypto',
  icon: 'KeyRound',
  techStack: ['crypto.getRandomValues', 'Fisher-Yates Shuffle', 'Local Processing']
},
```

---

## Translation Keys (`en.json`)

Under `tools.passwordShuffleGenerator`:

```json
"passwordShuffleGenerator": {
  "pageTitle": "Password & Shuffle Generator",
  "pageBadge": "100% Client-Side • crypto.getRandomValues",
  "breadcrumb": "Password & Shuffle Generator",
  "breadcrumbParent": "Developer Tools",
  "feat1Title": "Cryptographic Password Generation",
  "feat1Desc": "Generates passwords using crypto.getRandomValues — the same API browsers use for TLS. Configurable length (8–128), character categories, and ambiguous-character exclusion.",
  "feat2Title": "Fisher-Yates List Shuffler",
  "feat2Desc": "Paste any newline-separated list and get it back in a uniformly random order. Single-line input shuffles individual characters. All randomness from crypto.getRandomValues.",
  "feat3Title": "Entropy & Strength Feedback",
  "feat3Desc": "Live entropy display in bits with a four-tier strength label (Weak / Fair / Strong / Very Strong) so you can judge password quality before generating.",
  "guide": {
    "title": "How the Password & Shuffle Generator Works",
    "intro": "Both tools use the browser's crypto.getRandomValues API — the same source of randomness used in TLS key generation — so output is suitable for credentials and randomized test data.",
    "step1": "Choose a mode: Switch between Password and Shuffle using the mode toggle in the toolbar.",
    "step2": "Configure password options: Set a length from 8 to 128, enable the character categories you need (uppercase, lowercase, digits, symbols), and optionally exclude visually ambiguous characters like 0/O and l/1/I.",
    "step3": "Generate or shuffle: Click Regenerate to produce a new password, or paste a list into the Shuffle panel and click Shuffle to randomize the order of items.",
    "step4": "Copy the result: Click the Copy button next to the output. The label changes to Copied! for two seconds and then reverts.",
    "privacyTitle": "Why Client-Side Matters for Passwords",
    "privacyIntro": "Generating passwords or shuffling sensitive lists through a remote server means that data crosses a network, passes through server logs, and may be stored. This tool does none of that.",
    "privacyBullet1": "Zero transmission: crypto.getRandomValues runs inside your browser's JavaScript engine. No password or list item is sent to any C³ MindLoop server.",
    "privacyBullet2": "No persistence: Nothing is written to localStorage, sessionStorage, or cookies. Closing or refreshing the page clears all state."
  },
  "faq": {
    "q1": "Is crypto.getRandomValues actually cryptographically secure?",
    "a1": "Yes. crypto.getRandomValues is seeded by the operating system's CSPRNG (e.g., /dev/urandom on Linux, BCryptGenRandom on Windows). It is the same entropy source browsers use when establishing TLS connections. It is suitable for generating passwords, tokens, and nonces.",
    "q2": "What happens when I shuffle a single line of text?",
    "a2": "When the input contains only one non-empty line, the tool treats each character as an individual item and shuffles them using Fisher-Yates with crypto.getRandomValues. This lets you randomize short strings or single words character by character.",
    "q3": "Does the tool store my passwords or shuffled lists?",
    "a3": "No. All state lives only in React component memory for the duration of your browser session. Nothing is written to localStorage, sessionStorage, IndexedDB, or cookies. Closing or refreshing the page discards everything."
  }
}
```

---

## Components and Interfaces

### `PasswordShuffleGeneratorTool` (React FC)

**File:** `app/components/tools/PasswordShuffleGeneratorTool.tsx`  
**Exports:** named export `PasswordShuffleGeneratorTool`  
**Props:** none  
**Dependencies:** React, lucide-react icons (`KeyRound`, `Shuffle`, `Copy`, `Check`, `Trash2`, `Maximize2`, `Minimize2`, `Info`, `ShieldCheck`, `RotateCcw`)

### `PasswordShuffleGeneratorPage` (React FC)

**File:** `app/views/PasswordShuffleGeneratorPage.tsx`  
**Exports:** named export `PasswordShuffleGeneratorPage`  
**Props:** none  
**Dependencies:** `PasswordShuffleGeneratorTool`, `ToolSeoWrapper`, `CTASection`, `useTranslation`, `Link`, `ArrowLeft`

### Route page

**File:** `app/tools/password-shuffle-generator/page.tsx`  
**Exports:** `metadata` (Next.js Metadata), default export `Page`

### Pure utility functions (module-level in Tool file)

| Function | Signature | Pure |
|---|---|---|
| `buildCharset` | `(upper, lower, digits, symbols, excludeAmbiguous: boolean) => string` | ✓ |
| `generatePassword` | `(charset: string, length: number) => string` | uses crypto |
| `computeEntropy` | `(charsetSize: number, length: number) => number` | ✓ |
| `strengthLabel` | `(entropy: number) => { label: string; colorClass: string }` | ✓ |
| `fisherYatesShuffle` | `<T>(items: T[]) => T[]` | uses crypto |
| `shuffleText` | `(input: string) => { result: string; error: string }` | uses crypto |

---

## Data Models

### Password Configuration (React state, no persistence)

```ts
interface PasswordConfig {
  length: number;       // 8–128, default 16
  upper: boolean;       // default true
  lower: boolean;       // default true
  digits: boolean;      // default true
  symbols: boolean;     // default true
  excludeAmbiguous: boolean; // default false
}
```

### Entropy / Strength Result

```ts
interface EntropyResult {
  bits: number;         // floor(length * log2(charsetSize))
  label: string;        // 'Weak' | 'Fair' | 'Strong' | 'Very Strong'
  colorClass: string;   // Tailwind text-* class
}
```

### Shuffle Result

```ts
interface ShuffleResult {
  result: string;  // joined shuffled items (empty string on error)
  error: string;   // non-empty string if input was invalid
}
```

### Translation shape (`tools.passwordShuffleGenerator`)

```ts
interface PasswordShuffleGeneratorI18n {
  pageTitle: string;
  pageBadge: string;
  breadcrumb: string;
  breadcrumbParent: string;
  feat1Title: string; feat1Desc: string;
  feat2Title: string; feat2Desc: string;
  feat3Title: string; feat3Desc: string;
  guide: {
    title: string; intro: string;
    step1: string; step2: string; step3: string; step4: string;
    privacyTitle: string; privacyIntro: string;
    privacyBullet1: string; privacyBullet2: string;
  };
  faq: {
    q1: string; a1: string;
    q2: string; a2: string;
    q3: string; a3: string;
  };
}
```

### PRODUCTS_LIST entry shape (existing `Product` type)

```ts
{
  id: 'password-shuffle-generator',
  nameKey: string,
  descKey: string,
  status: 'live',
  category: 'crypto',
  icon: 'KeyRound',
  techStack: string[]
}
```

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| `crypto.getRandomValues` unavailable on mount | Set `cryptoError = true`; show error banner "Cryptographic API not available in this browser"; disable Regenerate and Shuffle buttons |
| All four password char types disabled | Show inline message "Select at least one character type"; disable Regenerate |
| Shuffle input empty / whitespace only | Show inline `shuffleError` "Enter at least one item to shuffle"; no output produced |
| Clipboard write fails | Show inline error "Copy failed — select text manually" via a brief `pwCopied`/`shuffleCopied` error state |
| Length input outside 8–128 | Clamp on `blur` or `change`; update input field to clamped value |
| `charsetSize === 0` passed to `computeEntropy` | Return `0` bits (guarded with `if (charsetSize === 0) return 0`) |

---

## Correctness Properties

### Property 1: No Math.random usage
`generatePassword` and `fisherYatesShuffle` MUST NOT call `Math.random()` anywhere in their call chain.

**Validates: Requirements 4.1, 4.2**

### Property 2: Full charset coverage
`buildCharset` with all four toggles enabled and `excludeAmbiguous = false` MUST produce a charset containing at least one character from each of the four pools (uppercase, lowercase, digits, symbols).

**Validates: Requirements 2.4**

### Property 3: Ambiguous exclusion is complete
`buildCharset` with `excludeAmbiguous = true` MUST NOT contain any of the characters `0`, `O`, `l`, `1`, `I` in the returned string.

**Validates: Requirements 2.7**

### Property 4: Zero-charset entropy guard
`computeEntropy(0, n)` MUST return `0` for any `n` without throwing a runtime error.

**Validates: Requirements 10.1**

### Property 5: Character-shuffle length preservation
`shuffleText` on a single non-empty line MUST return a result string of the same character length as the input line (character-level shuffle only).

**Validates: Requirements 3.3, 3.5**

### Property 6: Line-shuffle set preservation
`shuffleText` on a multi-line input MUST return a string containing exactly the same set of non-empty lines as the input, with no lines added, dropped, or modified.

**Validates: Requirements 3.2, 3.5**

### Property 7: Guaranteed category inclusion in passwords
Every generated password MUST contain at least one character from each enabled character category (guaranteed by post-processing replacement before the password is returned to the caller).

**Validates: Requirements 2.4, 2.5**

---

## Testing Strategy

Unit tests (co-located in `__tests__/` or `.test.ts` suffix) cover:

- `buildCharset`: all combos of toggles, ambiguous exclusion removes exactly the five chars
- `computeEntropy`: spot values, zero-charset guard
- `strengthLabel`: boundary values (39, 40, 59, 60, 79, 80)
- `fisherYatesShuffle`: output length = input length, output is a permutation of input (no duplicates or drops)
- `shuffleText`: empty → error, single line → char shuffle, multi-line → line shuffle
- `generatePassword`: length matches requested length, all chars in charset, guaranteed-inclusion holds for each toggle combination

Component tests (React Testing Library):
- Mode toggle switches visible panel
- Regenerate disabled when no char types selected
- Entropy display updates when length or toggles change
- Copy button shows "Copied!" then reverts after 2000 ms
- Load Sample populates defaults and produces output
- Clear clears all fields

---

## Design Decisions

**Why no separate utility file?** The crypto logic (`buildCharset`, `generatePassword`, `fisherYatesShuffle`) is small enough to live at the top of the Tool component file, matching the pattern in `HashGeneratorTool.tsx` where hash utilities are defined inline.

**Why rejection sampling is not needed here:** The modulo bias when doing `n % charsetSize` is `2^32 % charsetSize` out of 2^32, which for charset sizes ≤ 96 (full ASCII printable) is < 0.00003% — well within acceptable tolerance for password generation. SHA-256 key derivation does not apply here.

**Why no strength progress bar:** The requirements explicitly prohibit glowing/animated/neon styling. A plain inline text label with a muted colour token (`text-red-400`, `text-amber-400`, `text-sky-400`, `text-emerald-400`) is sufficient and matches the platform tone.

**Why Fisher-Yates per-swap instead of a bulk random array:** Ensures each swap uses a fresh `crypto.getRandomValues` call, avoiding any theoretical correlation between consecutive positions. The performance cost is negligible for list sizes ≤ 500.

**Mode state preservation:** Both password config/output and shuffle input/output are kept in state at all times. Switching mode just toggles which panel is visible — it never clears the other mode's state. This satisfies Requirement 1 AC5.
