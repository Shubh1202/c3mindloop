import { Product, ServiceItem, BlogPost, CommunityCrashStory, RoadmapItem, Testimonial, CareerRole, SupportedLocale } from '../types';

export const PRODUCTS_LIST: Product[] = [
  {
    id: 'json-formatter',
    nameKey: 'JSON Formatter & Validator',
    descKey: 'Format, validate, repair, and minify JSON payloads in your browser. Live P2P sessions synchronize the shared JSON editor in real time.',
    status: 'live',
    category: 'json',
    icon: 'Code2',
    techStack: ['Browser JS Engine', 'Live P2P Sync', 'Local Processing'],
    demoCode: `// Client-Side Execution (0 Network Requests)
const formatted = JSON.stringify(JSON.parse(input), null, 2);`
  },
  {
    id: 'base64-encoder',
    nameKey: 'Base64 Encoder & Decoder',
    descKey: 'Safely encode and decode UTF-8 strings, URLs, and binary buffers to Base64 format locally.',
    status: 'live',
    category: 'encoders',
    icon: 'Zap',
    techStack: ['atob / btoa', 'UTF-8 Bytes', 'URL Safe Encoding']
  },
  {
    id: 'jwt-inspector',
    nameKey: 'JWT Inspector & Token Debugger',
    descKey: 'Decode JSON Web Token headers, payloads, and timestamps locally. Live collaboration synchronizes the shared token input with zero cloud storage.',
    status: 'live',
    category: 'auth',
    icon: 'ShieldCheck',
    techStack: ['Base64Url', 'Live P2P Sync', 'Client Verification']
  },
  {
    id: 'hash-generator',
    nameKey: 'Cryptographic Hash Generator',
    descKey: 'Generate SHA-256, SHA-512, and MD5 checksums locally using native Web Crypto API standards.',
    status: 'live',
    category: 'crypto',
    icon: 'Cpu',
    techStack: ['Web Crypto API', 'SubtleCrypto', 'Zero Server Logs']
  },
  {
    id: 'password-shuffle-generator',
    nameKey: 'Password & Shuffle Generator',
    descKey: 'Generate cryptographically secure passwords and shuffle any list or string. 100% client-side via crypto.getRandomValues.',
    status: 'live',
    category: 'crypto',
    icon: 'KeyRound',
    techStack: ['crypto.getRandomValues', 'Fisher-Yates Shuffle', 'Local Processing']
  },
  {
    id: 'curl-converter',
    nameKey: 'cURL to Code Converter',
    descKey: 'Convert cURL commands to Fetch, Axios, Python, Go, and PHP snippets. In live sessions, peers collaborate on the shared cURL command while keeping language targets local.',
    status: 'live',
    category: 'utilities',
    icon: 'Terminal',
    techStack: ['cURL Parser', 'Live P2P Sync', 'Local Processing']
  },
  {
    id: 'regex-tester',
    nameKey: 'Regex Matcher & Syntax Tester',
    descKey: 'Test Regular Expression patterns with live match highlighting. In live sessions, pattern, test string, and regex flags synchronize between peers.',
    status: 'live',
    category: 'utilities',
    icon: 'FileCode',
    techStack: ['RegExp Engine', 'Live P2P Sync', 'Syntax Highlighting']
  },
  {
    id: 'regex-railroad',
    nameKey: 'RegEx Railroad Diagram Generator',
    descKey: 'Visualize Regular Expressions as clean SVG railroad/flowchart syntax diagrams. Highlights capture groups, lookaheads, quantifiers, and character classes. Export as SVG.',
    status: 'live',
    category: 'utilities',
    icon: 'GitBranch',
    techStack: ['Client-Side Regex Lexer', 'SVG Flow Generator', 'Local Processing']
  },
  {
    id: 'cron-visualizer',
    nameKey: 'Cron Expression Visualizer & Generator',
    descKey: 'Parse 5-part and 6-part Cron expressions, get human-readable descriptions, and calculate the next 5 scheduled execution times in local and UTC.',
    status: 'live',
    category: 'utilities',
    icon: 'Terminal',
    techStack: ['Cron Parser', 'Date Arithmetic', 'Local Processing']
  },
  {
    id: 'sql-to-json',
    nameKey: 'SQL & cURL to JSON Converter',
    descKey: 'Convert SQL INSERT statements and cURL commands into clean, structured JSON arrays. Supports datatype inference, header extraction, and multi-format export.',
    status: 'live',
    category: 'utilities',
    icon: 'Layers',
    techStack: ['SQL Parser', 'cURL Parser', 'Local Processing']
  },
  {
    id: 'ats-resume-generator',
    nameKey: 'ATS Resume Generator',
    descKey: 'Build ATS-optimised developer resumes in your browser. Live preview, section editor, and one-click PDF export. Zero server upload - 100% client-side.',
    status: 'live',
    category: 'resume',
    icon: 'FileCode',
    techStack: ['Client-Side', 'Print API', 'Zero Upload']
  },
  {
    id: 'pdf-suite',
    nameKey: 'PDF Suite (Compress, Merge & Split)',
    descKey: 'Compress, merge, and split PDF documents 100% locally inside your browser memory sandbox. Zero server uploads.',
    status: 'live',
    category: 'utilities',
    icon: 'Layers',
    techStack: ['pdf-lib', 'pdfjs-dist', 'Canvas APIs', 'Local Processing']
  },
  {
    id: 'edit-pdf',
    nameKey: 'Edit PDF',
    descKey: 'Add text, images, signatures and whiteout to any PDF. Fill forms, manage pages, and export- 100% client-side, no upload.',
    status: 'live',
    category: 'utilities',
    icon: 'FileCode',
    techStack: ['pdf-lib', 'pdfjs-dist', 'Canvas APIs', 'Local Processing']
  },
  {
    id: 'ai-prompt-builder',
    nameKey: 'AI Prompt Context Builder',
    descKey: 'Sanitize raw technical context (code, logs, schemas) and generate optimized LLM system prompts locally.',
    status: 'live',
    category: 'utilities',
    icon: 'Sparkles',
    techStack: ['Privacy Sanitizer', 'Regex Engine', 'Local Templates']
  },
  {
    id: 'diff-checker',
    nameKey: 'Diff Checker',
    descKey: 'Compare text and code with line and char-level diffs. Live collaboration synchronizes original text, modified text, and comparison options in real time.',
    status: 'live',
    category: 'utilities',
    icon: 'Columns2',
    techStack: ['Myers Diff', 'Live P2P Sync', 'Local Processing']
  },
  {
    id: 'json-graph',
    nameKey: 'JSON Graph Visualizer',
    descKey: 'Visualize JSON as an interactive node graph with pan, zoom, expand/collapse, and PNG export. 100% client-side.',
    status: 'live',
    category: 'json',
    icon: 'LayoutGrid',
    techStack: ['SVG Renderer', 'Custom Layout Engine', 'Local Processing']
  },
  {
    id: 'code-complexity-analyzer',
    nameKey: 'Code Complexity Analyzer',
    descKey: 'Analyze cyclomatic and cognitive complexity per function for JS, TS, Python, Java, Go, C, and C++. Get actionable refactor suggestions. 100% client-side.',
    status: 'live',
    category: 'utilities',
    icon: 'GitBranch',
    techStack: ['Regex Parser', 'Heuristic Analysis', 'Local Processing']
  },
  {
    id: 'pipeline',
    nameKey: 'Tool Pipeline Builder',
    descKey: 'Chain developer tools in sequence. Base64 decode → JSON format → JWT inspect → Regex filter. Each step feeds the next. 100% client-side, shareable via URL.',
    status: 'live',
    category: 'utilities',
    icon: 'Layers',
    techStack: ['Pipeline Engine', 'URL Hash State', 'Local Processing']
  },
  {
    id: 'node-event-loop-visualizer',
    nameKey: 'Node.js Event Loop Visualizer',
    descKey: 'Interactive visualization and step-by-step simulator for Node.js Call Stack, Macrotask & Microtask queues, process.nextTick, and Event Loop phases.',
    status: 'live',
    category: 'utilities',
    icon: 'Terminal',
    techStack: ['Acorn AST Engine', 'Event Loop Simulation', 'Local Processing']
  },
  {
    id: 'js-event-loop-visualizer',
    nameKey: 'JavaScript Event Loop Visualizer',
    descKey: 'Interactive visualizer for the browser JavaScript Event Loop. Step through Call Stack, Task Queue, Microtask Queue, and the 4-phase Event Loop cycle 100% client-side.',
    status: 'live',
    category: 'utilities',
    icon: 'Terminal',
    techStack: ['Acorn AST Engine', 'Browser Event Loop', 'Framer Motion']
  },
  {
    id: 'git-visualizer',
    nameKey: 'Git Interactive DAG Visualizer',
    descKey: 'Interactive visual playground for Git commits, branches, merges, rebases, and cherry-picks. Live DAG commit tree with terminal console.',
    status: 'live',
    category: 'utilities',
    icon: 'GitBranch',
    techStack: ['Git DAG Engine', 'SVG Renderer', 'Local Processing']
  },
  {
    id: 'qr-code-generator',
    nameKey: 'QR Code Generator',
    descKey: 'Generate QR codes for URLs, Wi-Fi networks, vCard contacts, email, and phone numbers. Export as PNG, WebP, or SVG with custom colors and error correction. 100% client-side via qrcode npm.',
    status: 'live',
    category: 'utilities',
    icon: 'QrCode',
    techStack: ['qrcode npm', 'Canvas API', 'SVG Renderer', 'Local Processing']
  },
  {
    id: 'workflow-builder',
    nameKey: 'Visual Workflow Builder',
    descKey: 'Build, connect, and execute node-based data transformation pipelines visually. JSON validation, Base64 encode/decode, Regex matching, SHA-256 hashing, conditional branching. 100% client-side.',
    status: 'live',
    category: 'utilities',
    icon: 'Layers',
    techStack: ['DAG Execution Engine', 'Client-Side Canvas', 'Schema Validation', 'IndexedDB Persistence']
  }
];

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'fullstack-dev',
    titleKey: 'services.s1Title',
    descKey: 'services.s1Desc',
    icon: 'Code2',
    deliverables: ['Next.js & React Architecture', 'TypeScript & Tailwind Design System', 'Performance Optimization', 'Unit & E2E Testing']
  },
  {
    id: 'backend-cloud',
    titleKey: 'services.s2Title',
    descKey: 'services.s2Desc',
    icon: 'Server',
    deliverables: ['Express & Microservices', 'PostgreSQL & Firestore Schema', 'Redis Caching & Queue Workers', 'Containerized Deployment']
  },
  {
    id: 'saas-engineering',
    titleKey: 'services.s3Title',
    descKey: 'services.s3Desc',
    icon: 'Sparkles',
    deliverables: ['Multi-tenant Auth & RBAC', 'Stripe Integration & Billing Engine', 'Dashboard Layouts', 'Transactional Notifications']
  },
  {
    id: 'ai-automation',
    titleKey: 'services.s4Title',
    descKey: 'services.s4Desc',
    icon: 'Bot',
    deliverables: ['Gemini API Custom Fine-tuning', 'Vector Database & RAG Pipeline', 'Agentic Automation Workflows', 'Prompt Security Guardrails']
  },
  {
    id: 'api-architecture',
    titleKey: 'services.s5Title',
    descKey: 'services.s5Desc',
    icon: 'Network',
    deliverables: ['OpenAPI 3.1 Spec & SDK Setup', 'OAuth2 & JWT Auth Infrastructure', 'Rate-Limiting & Security', 'Developer Portal Setup']
  },
  {
    id: 'tech-advisory',
    titleKey: 'services.s6Title',
    descKey: 'services.s6Desc',
    icon: 'ShieldCheck',
    deliverables: ['Codebase Security & Audit Report', 'Performance Tuning & Profiling', 'Database Optimization Strategy', 'Architecture Consultation']
  }
];

const UNPUBLISHED_GUIDES: BlogPost[] = [
  {
    id: 'b1',
    slug: 'building-resilient-distributed-systems-typescript',
    title: 'Building Resilient Distributed Systems in TypeScript: Idempotency & Backpressure',
    excerpt: 'How C³ MindLoop designs idempotent message pipelines with backpressure handling and zero lost events using TypeScript and Redis.',
    content: `When handling high-concurrency event loops in Node.js and Express, traditional in-memory queues quickly bottleneck under sudden traffic spikes. At C³ MindLoop, we engineered our core event queue using atomic Lua scripts in Redis combined with type-safe Zod schema validation...`,
    category: 'Engineering',
    author: {
      name: 'C³ MindLoop Team',
      role: 'Founder & Principal Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '2026-08-01',
    readTimeMinutes: 7,
    featured: true,
    tags: ['TypeScript', 'Distributed Systems', 'Redis', 'Architecture'],
    codeSnippet: `// Atomic Lua Idempotency Lock
const tryAcquireLock = async (redis: Redis, lockKey: string, ttlSeconds: number) => {
  const result = await redis.set(lockKey, 'locked', 'EX', ttlSeconds, 'NX');
  return result === 'OK';
};`
  },
  {
    id: 'b2',
    slug: 'why-we-built-mindloop-ai-reflection-engine',
    title: 'Why We Built MindLoop AI: AST-Based Refactoring Loops Over Token Guessing',
    excerpt: 'Generic AI auto-completers produce brittle code. Discover how AST-based reflection loops verify type invariants before suggesting fixes.',
    content: `Most generative AI coding tools act like auto-complete on steroids-they guess tokens without inspecting the surrounding type hierarchy or project imports. MindLoop AI approaches code as an Abstract Syntax Tree (AST)...`,
    category: 'AI & Agents',
    author: {
      name: 'Elena Rostova',
      role: 'AI Researcher',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '2026-07-25',
    readTimeMinutes: 5,
    featured: false,
    tags: ['AI', 'Gemini', 'AST', 'Code Quality']
  },
  {
    id: 'b3',
    slug: 'the-coding-crashing-crying-ethos',
    title: 'Coding, Crashing, Crying: Embracing the Realities of Engineering Craft',
    excerpt: 'Imposter syndrome and late-night production bugs are not flaws in your career; they are the natural forge of developer mastery.',
    content: `Every senior engineer you admire has dropped a staging database, pushed a breaking bug to main, or spent six hours debugging a missing semicolon...`,
    category: 'Developer Culture',
    author: {
      name: 'Marcus Vance',
      role: 'Developer Relations Lead',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '2026-07-18',
    readTimeMinutes: 6,
    featured: false,
    tags: ['Community', 'Career', 'Engineering']
  },
  {
    id: 'b4',
    slug: 'nextjs-15-app-router-performance-mastery',
    title: 'Next.js 15 & React 19 Performance Mastery: Eliminating Hydration Bottlenecks',
    excerpt: 'Detailed guide on Server Components, dynamic imports, fluid layout shifts, and Tailwind v4 optimizations.',
    content: `React 19 introduces async transitions and server actions that drastically simplify state management. In this post, we benchmark Next.js 15 App Router...`,
    category: 'Engineering',
    author: {
      name: 'David Kim',
      role: 'Frontend Engineer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '2026-07-10',
    readTimeMinutes: 8,
    featured: false,
    tags: ['Next.js', 'React 19', 'Tailwind', 'Performance']
  }
];

// Guides are published only after their authorship and factual claims are verified.
export const BLOG_POSTS: BlogPost[] = [];

export type GuideCategory = 'engineering' | 'developerTools' | 'aiAgents' | 'developerCulture' | 'typeScript';

export interface LocalizedGuideContent {
  title: string;
  excerpt: string;
  content: string;
  metaDescription: string;
  category: GuideCategory;
  tags: string[];
  toolPath: string;
  authorName?: string;
  authorRole?: string;
  publishedAt: string;
  updatedAt?: string;
  readTimeMinutes: number;
}

export interface LocalizedGuide {
  id: string;
  slug: string;
  isPublished: boolean;
  translations: Partial<Record<SupportedLocale, LocalizedGuideContent>>;
}

// These guides describe only controls and behavior implemented in the linked tools.
// Legacy articles above remain unpublished until their authorship and claims are verified.
export const GUIDES: LocalizedGuide[] = [
  {
    id: 'guide-json-formatter',
    slug: 'format-and-validate-json-in-the-browser',
    isPublished: true,
    translations: {
      en: {
        title: 'How to Format and Validate JSON in the Browser',
        excerpt: 'Use the JSON Formatter to format valid JSON, check parsing errors, minify output, and copy or download the result.',
        metaDescription: 'A practical guide to formatting, validating, minifying, copying, and downloading JSON with the C³ MindLoop JSON Formatter.',
        content: `Open the JSON Formatter and paste a JSON value into the input panel. Select an indentation option, then use Format to parse the input with the browser's JSON parser and display formatted output. If the input is not valid JSON, the tool shows a validation error instead of producing formatted output.

Use Minify when you need the same valid JSON without extra whitespace. The tool also provides copy and download controls for the current output, plus a file picker for loading JSON from a local file. These operations are implemented in the browser: formatting and minifying use JSON.parse and JSON.stringify, and file loading uses the browser FileReader API.

Keep in mind that JSON requires double-quoted property names and string values. If the source is JavaScript object syntax, comments, or otherwise invalid JSON, correct it before formatting.`,
        category: 'engineering',
        tags: ['JSON', 'Validation', 'Formatting'],
        toolPath: '/tools/json-formatter',
        publishedAt: '2026-08-17',
        updatedAt: '2026-08-17',
        readTimeMinutes: 3,
      },
    },
  },
  {
    id: 'guide-regex-tester',
    slug: 'test-regular-expressions-in-the-browser',
    isPublished: true,
    translations: {
      en: {
        title: 'How to Test Regular Expressions in the Browser',
        excerpt: 'Use the Regex Tester to try a pattern against sample text, change flags, inspect matches and capture groups, and copy generated code.',
        metaDescription: 'Learn how to test regular expressions, adjust flags, inspect matches, and copy generated snippets with the C³ MindLoop Regex Tester.',
        content: `Open the Regex Tester, enter a pattern, and add the text you want to test. The tool evaluates the pattern with the browser's native RegExp implementation and reports syntax errors when the pattern cannot be compiled.

Use the flag controls to change how the expression runs. The tool supports the g, i, m, s, u, and y flags, and includes preset patterns for common inputs such as email addresses, URLs, IP addresses, phone numbers, and passwords. The match panel shows the matched text, capture groups, named groups when present, and match positions when the browser supports match indices.

When the pattern is ready, copy the expression or switch the code output between JavaScript, Python, Go, and PHP snippets. Generated snippets are starting points: test them in the target runtime before relying on them in an application.`,
        category: 'developerTools',
        tags: ['Regex', 'JavaScript', 'Testing'],
        toolPath: '/tools/regex-tester',
        publishedAt: '2026-08-17',
        updatedAt: '2026-08-17',
        readTimeMinutes: 4,
      },
    },
  },
  {
    id: 'guide-cron-visualizer',
    slug: 'check-cron-expressions-before-scheduling',
    isPublished: true,
    translations: {
      en: {
        title: 'How to Check a Cron Expression Before You Schedule It',
        excerpt: 'Use the Cron Visualizer to parse Standard or Quartz cron input, build an expression, and review the next scheduled runs.',
        metaDescription: 'Learn how to parse, build, and review Standard or Quartz cron expressions with the C³ MindLoop Cron Visualizer.',
        content: `Open the Cron Visualizer and choose the expression style you need: Standard uses five fields, while Quartz uses six fields. Paste an expression into the input tab or use the builder to choose field values. The tool parses the expression and shows a plain-language description when it can interpret the input.

Review the next five calculated runs before using an expression in a scheduler. The visualizer displays each result in local time and UTC, which helps catch timezone assumptions during review. You can also copy the current expression from the tool.

The visualizer is a checking aid, not a replacement for the scheduler that will run your job. Confirm that the target system accepts the selected Standard or Quartz syntax and uses the timezone you expect.`,
        category: 'developerTools',
        tags: ['Cron', 'Scheduling', 'Debugging'],
        toolPath: '/tools/cron-visualizer',
        publishedAt: '2026-08-17',
        updatedAt: '2026-08-17',
        readTimeMinutes: 3,
      },
    },
  },
  {
    id: 'guide-jwt-inspector',
    slug: 'debug-invalid-jwt-claims',
    isPublished: true,
    translations: {
      en: {
        title: 'Debugging Invalid JWT Claims: Token Header, Payload, and Expiry Errors',
        excerpt: 'Diagnose and fix invalid JWT claims. Learn how header, payload, and signature differ, solve exp, nbf, and iat timestamp errors, and troubleshoot issuer and audience mismatches safely.',
        metaDescription: 'Diagnose and fix invalid JWT claims: exp/nbf/iat timestamp errors, iss/aud mismatches, milliseconds vs seconds mistakes, and safe client-side token inspection.',
        content: `## Quick Answer: What Causes "Invalid Claims" Errors?
Invalid claim errors occur when a JSON Web Token (JWT) passes cryptographic signature checks but fails payload validation rules enforced by the verifying server or API gateway. The three most common causes are token expiration (\`exp\` timestamp in the past), clock drift between the authentication provider and the resource server without configured leeway, and mismatched identifier strings for the expected audience (\`aud\`) or issuer (\`iss\`).

To troubleshoot an invalid token:
1. Decode the token header and payload locally to inspect raw claim values.
2. Verify that all timestamp claims (\`exp\`, \`nbf\`, \`iat\`) are numeric Unix epoch timestamps in seconds, not milliseconds.
3. Compare the \`exp\` timestamp against your server's current system time in UTC (\`date -u +%s\`).
4. Ensure the \`iss\` and \`aud\` strings match the exact protocol, domain, and path expected by your validation middleware.
5. Inspect the token using the [C³ MindLoop JWT Inspector](/tools/jwt-inspector) to check expiration status and claim formatting with zero server transmission.

## Understanding JWT Structure: Header, Payload, and Signature
A JSON Web Token (RFC 7519) is a compact, URL-safe string comprised of three distinct segments separated by periods (\`.\`):
\`header.payload.signature\`

- **Header:** Identifies the token type (\`typ: "JWT"\`) and the cryptographic signing algorithm (\`alg: "HS256"\`, \`"RS256"\`, or \`"ES256"\`). It may also specify a key identifier (\`kid\`) used by the resource server to locate the corresponding public key in a JSON Web Key Set (JWKS).
- **Payload:** Contains the claims—statements about an entity (typically the user or client) and additional metadata. Claims are stored as a standard JSON object before being base64url-encoded.
- **Signature:** Generated by applying the header's algorithm over the encoded header and encoded payload (\`HMACSHA256(base64Url(header) + "." + base64Url(payload), secret)\`). The signature guarantees data integrity: if any byte in the header or payload is modified, the signature becomes invalid.

## Standard Registered Claims & Common Failure Modes
The JWT specification defines several standard registered claim keys. While optional in the RFC, modern authentication frameworks (OAuth 2.0, OpenID Connect) treat them as mandatory validation boundaries.

| Claim Key | Full Name | Expected Format | Common Failure Cause | Expected Verification Rule |
| :--- | :--- | :--- | :--- | :--- |
| \`exp\` | Expiration Time | Unix Epoch (seconds) | Passed expiration, millisecond timestamps | \`currentTime <= exp + leeway\` |
| \`nbf\` | Not Before | Unix Epoch (seconds) | Token received before activation time | \`currentTime >= nbf - leeway\` |
| \`iat\` | Issued At | Unix Epoch (seconds) | Future timestamp due to clock skew | Informational only; most libraries do not enforce as a validity boundary |
| \`iss\` | Issuer URL | String / URI | Trailing slash mismatch, wrong auth realm | \`token.iss === expectedIssuer\` |
| \`aud\` | Audience | String or Array | Mismatched client ID or API identifier | \`expectedAudience in token.aud\` |
| \`sub\` | Subject | String | Missing user ID or non-string format | Must be non-empty string identifier |

## Unix Timestamps, UTC, and Time-Zone Mistakes
Timestamp miscalculations account for the vast majority of \`TokenExpiredError\` and \`NotBeforeError\` exceptions.

### Seconds vs. Milliseconds
Standard Unix timestamps measure the number of elapsed seconds since January 1, 1970 00:00:00 UTC. However, JavaScript's \`Date.now()\` and Java's \`System.currentTimeMillis()\` return **milliseconds**.
- **Incorrect generation:** Setting \`"exp": Date.now() + 3600000\` writes a 13-digit millisecond timestamp (e.g. \`1730000000000\`). When the validating server reads this as seconds, it calculates an expiration date in the far distant future (over 50,000 years away) or fails integer bounds checks.
- **Correct generation:** Always divide by 1000 and truncate: \`Math.floor(Date.now() / 1000) + 3600\`.
- **Incorrect client reading:** Reading \`new Date(payload.exp)\` passes seconds to a constructor expecting milliseconds, producing a date in January 1970. Always multiply by 1000: \`new Date(payload.exp * 1000)\`.

### Timezone Independence and Clock Drift
Unix epoch timestamps are inherently timezone-independent. They represent a single universal moment in time regardless of whether your server runs in UTC, EST, or JST. Do not apply timezone offsets (such as adding 3600 seconds for GMT+1) to an epoch calculation; doing so shifts the timestamp by an hour and produces premature expiration or delayed activation.

Even with synchronized UTC clocks, slight hardware drift between distributed cloud servers can cause a token minted on Server A to be rejected as "not active yet" (\`nbf\`) or "expired" (\`exp\`) on Server B. Verification libraries should always configure a small clock tolerance (typically 30 to 60 seconds):

\`\`\`javascript
// Node.js jsonwebtoken verification with clock tolerance
const jwt = require('jsonwebtoken');

try {
  const decoded = jwt.verify(token, publicKey, {
    audience: 'https://api.c3mindloop.com',
    issuer: 'https://auth.c3mindloop.com',
    clockTolerance: 30, // 30 seconds leeway for clock skew
  });
} catch (err) {
  console.error('Validation failed:', err.message);
}
\`\`\`

\`\`\`python
# Python PyJWT verification with leeway
import jwt

try:
    decoded = jwt.decode(
        token,
        public_key,
        algorithms=["RS256"],
        audience="https://api.c3mindloop.com",
        issuer="https://auth.c3mindloop.com",
        leeway=30  # 30 seconds leeway
    )
except jwt.ExpiredSignatureError:
    print("Token has expired")
except jwt.InvalidAudienceError:
    print("Token audience mismatch")
except jwt.PyJWTError as e:
    print(f"Token error: {e}")
\`\`\`

## Synthetic Troubleshooting Examples: Valid vs. Invalid Payloads
The following synthetic examples illustrate valid configurations versus common syntax and logical mistakes.

### 1. Valid Token Payload
\`\`\`json
{
  "iss": "https://auth.c3mindloop.com",
  "sub": "usr_98a72b1",
  "aud": "https://api.c3mindloop.com",
  "iat": 1729800000,
  "nbf": 1729800000,
  "exp": 1729803600,
  "scope": "read:profile write:data"
}
\`\`\`
Expected Outcome: Verification succeeds. The token is active, matches audience and issuer, and expires exactly 1 hour (3600 seconds) after issuance.

### 2. Invalid: Token Expired (TokenExpiredError)
\`\`\`json
{
  "iss": "https://auth.c3mindloop.com",
  "sub": "usr_98a72b1",
  "aud": "https://api.c3mindloop.com",
  "iat": 1500000000,
  "exp": 1500003600
}
\`\`\`
Expected Outcome: Fails with \`TokenExpiredError: jwt expired\`. The \`exp\` value (\`1500003600\`) represents July 14, 2017. The current timestamp exceeds the expiration time.

### 3. Invalid: Premature Token (NotBeforeError)
\`\`\`json
{
  "iss": "https://auth.c3mindloop.com",
  "sub": "usr_98a72b1",
  "aud": "https://api.c3mindloop.com",
  "iat": 1729800000,
  "nbf": 1729807200,
  "exp": 1729810800
}
\`\`\`
Expected Outcome: Fails with \`NotBeforeError: jwt not active\`. The \`nbf\` timestamp is set two hours after issuance. The resource server rejects access until the \`nbf\` timestamp passes.

### 4. Invalid: Issuer or Audience Mismatch (JsonWebTokenError)
\`\`\`json
{
  "iss": "https://auth.c3mindloop.com/",
  "sub": "usr_98a72b1",
  "aud": "my-mobile-app",
  "exp": 1999999999
}
\`\`\`
Expected Outcome: Fails with \`JsonWebTokenError: jwt audience invalid\` if the resource server expects \`https://api.c3mindloop.com\`. Also note the trailing slash in \`iss\`: \`"https://auth.c3mindloop.com/"\` will NOT match an expected issuer string of \`"https://auth.c3mindloop.com"\`. URL comparisons are exact string matches.

## Security Rule: Decoding Is Not Verification
A critical security distinction often missed by developers is that **base64url-decoding a JWT is NOT the same as verifying it**.
- Any client, proxy, or browser can decode a JWT payload because base64url is an encoding format, not encryption.
- Never make access control, billing, or authorization decisions based solely on unverified decoded payloads.
- An attacker can easily craft an unverified payload containing \`"role": "admin"\` or an arbitrary \`"sub"\`. Without signature verification using a trusted secret or verified public key, the payload is completely untrustworthy.
- Ensure your backend rejects tokens with \`"alg": "none"\` and verifies that the signing algorithm in the header matches the algorithm expected by your security policy.

## Safe Inspection with C³ MindLoop JWT Inspector
When inspecting tokens during development, never paste production credentials, private keys, or tokens containing sensitive personal data into unknown web servers.

Use the [C³ MindLoop JWT Inspector](/tools/jwt-inspector) to inspect tokens safely. The inspector operates 100% locally inside your browser's V8 engine:
- Decodes Header and Payload claims in-memory without sending network requests.
- Converts \`exp\`, \`nbf\`, and \`iat\` timestamps into human-readable local time and UTC with a live countdown timer.
- Scans for standard security warnings, including weak algorithms and missing expiration boundaries.
- Inspects token structure completely offline with zero server logs or retention.`,
        category: 'engineering',
        tags: ['JWT', 'Authentication', 'Security', 'Debugging'],
        toolPath: '/tools/jwt-inspector',
        publishedAt: '2026-10-24',
        updatedAt: '2026-10-24',
        readTimeMinutes: 6,
      },
    },
  },
  {
    id: 'guide-curl-converter',
    slug: 'convert-curl-to-fetch-axios-python',
    isPublished: true,
    translations: {
      en: {
        title: 'How to Convert cURL Commands to Fetch, Axios, and Python Requests',
        excerpt: 'Translate terminal cURL commands into production-ready JavaScript Fetch, Axios, and Python code. Master GET and POST requests, headers, JSON bodies, authentication, and error handling.',
        metaDescription: 'Convert cURL commands to Fetch, Axios, Python Requests, Go, and PHP. Learn flag mappings, header handling, JSON bodies, auth, and secure TLS verification.',
        content: `## Quick Answer: How to Translate cURL Commands
Converting a terminal \`curl\` command into programming code requires mapping command-line flags to their HTTP client library equivalents:
- **Request URL & Query String:** Passed directly to the first argument of \`fetch(url)\`, \`axios.get(url)\`, or \`requests.get(url)\`.
- **HTTP Method (\`-X, --request\`):** Mapped to \`method: 'POST'\` in Fetch, \`axios.post()\` or \`method: 'post'\`, and \`requests.post()\` in Python.
- **Headers (\`-H, --header\`):** Converted into a key-value dictionary in the \`headers\` property.
- **Request Body (\`-d, --data, --data-raw\`):** Passed as \`body: JSON.stringify(data)\` in Fetch, \`data: payload\` in Axios (which auto-serializes objects), or \`json=payload\` in Python Requests.
- **Authentication (\`-u, --user\`):** Converted to an \`Authorization: Basic <base64>\` header, \`auth: { username, password }\` in Axios, or \`auth=('user', 'pass')\` in Python.

Use the [C³ MindLoop cURL to Code Converter](/tools/curl-converter) to automatically parse flags and generate syntax-highlighted snippets in your browser with zero server uploads.

## Step-by-Step Conversion Workflow
When translating an API call copied from Chrome DevTools, Postman, or terminal documentation into an application codebase, follow this 4-step workflow:

1. **Extract and Clean the Target URL:** Remove shell line continuations (\`\\\`) and extract query parameters. If parameters contain dynamic values, construct them using URL parameter builders (\`URLSearchParams\` in JavaScript or \`params\` dict in Python) rather than raw string concatenation.
2. **Normalize Headers and Authentication:** Separate generic headers (\`Content-Type\`, \`Accept\`) from credential headers (\`Authorization: Bearer <TOKEN>\`). Store secrets in environment variables instead of hardcoding raw strings.
3. **Format Request Payloads:** Determine whether the \`-d\` data is raw JSON or URL-encoded form data (\`application/x-www-form-urlencoded\`). Multipart file uploads (\`-F\`) require a separate implementation using \`FormData\` in JavaScript or \`files=\` in Python Requests and are not covered by the examples below.
4. **Implement Robust Error and Timeout Handling:** Never assume a request succeeds. Implement proper HTTP status checks, catch blocks, and explicit timeout signals to prevent hanging sockets.

## cURL Flags to Library Syntax Reference Table

| cURL Flag | Purpose | JavaScript Fetch | JavaScript Axios | Python Requests |
| :--- | :--- | :--- | :--- | :--- |
| \`-X GET / POST\` | HTTP Method | \`method: 'POST'\` | \`axios.post()\` | \`requests.post()\` |
| \`-H "Name: Val"\` | HTTP Header | \`headers: { 'Name': 'Val' }\` | \`headers: { 'Name': 'Val' }\` | \`headers={'Name': 'Val'}\` |
| \`-d '{"a":1}'\` | JSON Payload | \`body: JSON.stringify({a: 1})\` | \`data: { a: 1 }\` | \`json={'a': 1}\` |
| \`-d "a=1&b=2"\` | Form URL-encoded | \`body: new URLSearchParams(...)\` | \`data: new URLSearchParams(...)\` | \`data={'a': 1, 'b': 2}\` |
| \`-u "usr:pwd"\` | Basic Auth | \`headers: { Authorization: 'Basic ...' }\` | \`auth: { username, password }\` | \`auth=('usr', 'pwd')\` |
| \`-m 10\` | Timeout (seconds) | \`signal: AbortSignal.timeout(10000)\` | \`timeout: 10000\` | \`timeout=10.0\` |

## GET Request Conversion Examples
Consider this standard authenticated GET request with query parameters:

\`\`\`bash
curl -X GET "https://api.example.com/v1/users?role=developer&status=active" \\
  -H "Accept: application/json" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
\`\`\`

### 1. Modern JavaScript (Fetch API)
\`\`\`javascript
// Native Fetch (Browser & Node.js 18+)
async function fetchUsers() {
  const url = new URL('https://api.example.com/v1/users');
  url.searchParams.set('role', 'developer');
  url.searchParams.set('status', 'active');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': \`Bearer \${process.env.API_TOKEN}\`,
    },
    signal: AbortSignal.timeout(8000), // 8-second timeout
  });

  // Fetch does NOT reject on 4xx/5xx HTTP errors!
  if (!response.ok) {
    throw new Error(\`HTTP error \${response.status}: \${response.statusText}\`);
  }

  const data = await response.json();
  return data;
}
\`\`\`

### 2. JavaScript / TypeScript (Axios)
\`\`\`javascript
// Axios Client
import axios from 'axios';

async function fetchUsers() {
  try {
    const response = await axios.get('https://api.example.com/v1/users', {
      params: {
        role: 'developer',
        status: 'active',
      },
      headers: {
        'Accept': 'application/json',
        'Authorization': \`Bearer \${process.env.API_TOKEN}\`,
      },
      timeout: 8000,
    });

    // Axios automatically parses JSON and rejects non-2xx status codes
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(\`API Error \${error.response?.status}:\`, error.response?.data);
    } else {
      console.error('Network or client error:', error);
    }
    throw error;
  }
}
\`\`\`

### 3. Python (Requests)
\`\`\`python
# Python Requests
import os
import requests
from requests.exceptions import RequestException

def fetch_users():
    url = "https://api.example.com/v1/users"
    params = {
        "role": "developer",
        "status": "active"
    }
    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {os.environ.get('API_TOKEN')}"
    }

    try:
        response = requests.get(url, params=params, headers=headers, timeout=8.0)
        # Explicitly raise exception for 4xx and 5xx status codes
        response.raise_for_status()
        return response.json()
    except RequestException as err:
        print(f"Request failed: {err}")
        raise
\`\`\`

## POST Request Conversion with JSON Payload
Now consider a POST request creating a resource:

\`\`\`bash
curl -X POST https://api.example.com/v1/projects \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -d '{"name":"C3 MindLoop","isPrivate":true,"tags":["developer","utilities"]}'
\`\`\`

### 1. Modern JavaScript (Fetch API)
\`\`\`javascript
async function createProject(projectData) {
  const response = await fetch('https://api.example.com/v1/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${process.env.API_TOKEN}\`,
    },
    body: JSON.stringify(projectData),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(\`Failed to create project (\${response.status}): \${errorBody}\`);
  }

  return await response.json();
}
\`\`\`

### 2. JavaScript / TypeScript (Axios)
\`\`\`javascript
import axios from 'axios';

async function createProject(projectData) {
  const response = await axios.post(
    'https://api.example.com/v1/projects',
    projectData, // Axios auto-serializes objects to JSON and sets Content-Type
    {
      headers: {
        'Authorization': \`Bearer \${process.env.API_TOKEN}\`,
      },
      timeout: 10000,
    }
  );
  return response.data;
}
\`\`\`

### 3. Python (Requests)
\`\`\`python
import os
import requests

def create_project(project_data):
    url = "https://api.example.com/v1/projects"
    headers = {
        "Authorization": f"Bearer {os.environ.get('API_TOKEN')}"
    }

    # Using json= automatically serializes and sets Content-Type: application/json
    response = requests.post(
        url,
        json=project_data,
        headers=headers,
        timeout=10.0
    )
    response.raise_for_status()
    return response.json()
\`\`\`

## Critical Differences and Gotchas Between Clients

### 1. The Fetch ok Gotcha
The single most frequent bug in cURL-to-Fetch conversion is assuming \`fetch()\` rejects when an API returns HTTP 401, 404, or 500. It does **not**. Fetch only rejects on network failures (DNS resolution error, TCP reset, or blocked connection). You must check \`if (!response.ok)\` manually. In contrast, Axios rejects on any non-2xx status code, and Python Requests requires calling \`response.raise_for_status()\`.

### 2. Automatic JSON Serialization
- **Fetch:** Requires manual \`JSON.stringify(payload)\` in \`body\` and explicit \`'Content-Type': 'application/json'\` header.
- **Axios:** Serializes objects passed to \`data\` automatically and sets \`Content-Type: application/json\`.
- **Python:** Passing a dictionary to \`json=payload\` automatically serializes to JSON and sets the header. Passing a dictionary to \`data=payload\` sends \`application/x-www-form-urlencoded\` form data instead!

### 3. Browser CORS vs. Terminal Execution
cURL runs directly in your OS terminal with zero Cross-Origin Resource Sharing (CORS) restrictions. However, when you convert that cURL command into browser-based JavaScript (\`fetch\` or \`axios\`), the browser security sandbox applies:
- The remote server must send valid \`Access-Control-Allow-Origin\` headers.
- Custom headers trigger an automated \`OPTIONS\` preflight request.
- Certain headers (like \`User-Agent\`, \`Cookie\`, \`Host\`, and \`Referer\`) are forbidden request headers in browsers and will be silently stripped or error out.
If you need to execute arbitrary API calls that violate browser CORS policies, execute them server-side in Node.js, Python, or Go.

### 4. The \`--insecure\` / \`-k\` Flag: Never Translate This
cURL\'s \`-k\` (or \`--insecure\`) flag skips TLS certificate validation, which is sometimes used when testing against self-signed certificates in local or staging environments. Do **not** reproduce this behavior in application code. The library equivalents — \`rejectUnauthorized: false\` in Node.js, \`verify=False\` in Python Requests, or \`InsecureSkipVerify: true\` in Go — disable all TLS verification and expose requests to man-in-the-middle attacks if left in production builds. Fix the certificate chain instead of disabling validation.

## Automating Conversion with C³ MindLoop
Instead of manually rewriting headers, escaping strings, and structuring try-catch blocks every time you copy a cURL command from Chrome DevTools, use the [C³ MindLoop cURL to Code Converter](/tools/curl-converter).

The converter runs 100% locally in your browser memory:
- Tokenizes complex single-quoted and double-quoted flags without leaking API tokens or payloads to third-party servers.
- Generates ready-to-run snippets for JavaScript Fetch, Axios, Node.js Fetch, Python Requests, Go \`net/http\`, and PHP Guzzle.
- Automatically handles \`-X\`, \`-H\`, \`-d\`, and \`-u\` credential parsing with zero network transmission.`,
        category: 'developerTools',
        tags: ['cURL', 'Fetch', 'Axios', 'Python', 'API'],
        toolPath: '/tools/curl-converter',
        publishedAt: '2026-10-24',
        updatedAt: '2026-10-24',
        readTimeMinutes: 7,
      },
    },
  },
];

export type PublishedGuide = LocalizedGuideContent & {
  id: string;
  slug: string;
  usesEnglishFallback: boolean;
};

export function getPublishedGuides(locale: SupportedLocale): PublishedGuide[] {
  return GUIDES.flatMap((guide) => {
    if (!guide.isPublished) return [];
    const content = guide.translations[locale] ?? guide.translations.en;
    return content ? [{ ...content, id: guide.id, slug: guide.slug, usesEnglishFallback: !guide.translations[locale] }] : [];
  });
}

export function getPublishedEnglishGuide(slug: string): PublishedGuide | undefined {
  return getPublishedGuides('en').find((guide) => guide.slug === slug);
}

export function getRelatedGuides(slug: string, locale: SupportedLocale = 'en', limit: number = 3): PublishedGuide[] {
  const allGuides = getPublishedGuides(locale);
  const currentGuide = allGuides.find((g) => g.slug === slug);
  if (!currentGuide) {
    return allGuides.filter((g) => g.slug !== slug).slice(0, limit);
  }

  const otherGuides = allGuides.filter((g) => g.slug !== slug);
  const currentTagSet = new Set(currentGuide.tags.map((t) => t.toLowerCase()));

  const scored = otherGuides.map((guide) => {
    let score = 0;
    if (guide.category === currentGuide.category) {
      score += 2;
    }
    for (const tag of guide.tags) {
      if (currentTagSet.has(tag.toLowerCase())) {
        score += 1;
      }
    }
    return { guide, score };
  });

  scored.sort((a, b) => b.score - a.score || b.guide.publishedAt.localeCompare(a.guide.publishedAt));
  return scored.slice(0, limit).map((item) => item.guide);
}

export const CRASH_STORIES: CommunityCrashStory[] = [
  {
    id: 'cs1',
    author: 'Alexandre M.',
    role: 'Lead DevOps Engineer',
    company: 'FinTech Project',
    title: 'The Unchecked DROP TABLE in Migration Script #104',
    story: 'It was 4:45 PM on a Friday. I ran what I thought was a dry-run SQL script on staging. Turns out my terminal environment variable was pointed to production Postgres. In seconds, customer transaction records were affected.',
    lesson: 'Always require dual-confirmation prompts and explicit connection string printouts before executing DDL migrations.',
    upvotes: 342,
    tags: ['Postgres', 'Database', 'Outage']
  },
  {
    id: 'cs2',
    author: 'Sarah T.',
    role: 'Senior Frontend Dev',
    company: 'E-commerce App',
    title: 'Infinite Loop That Overwhelmed Our Auth Endpoint',
    story: 'A missing dependency array item in a useEffect caused active client sessions to send continuous auth validation requests, pinning the OAuth gateway.',
    lesson: 'Wrap API calls in debounced handlers and implement strict client-side retry exponential backoff.',
    upvotes: 289,
    tags: ['React', 'InfiniteLoop', 'Auth']
  },
  {
    id: 'cs3',
    author: 'Kenji O.',
    role: 'Full Stack Engineer',
    company: 'SaaS Startup',
    title: 'Hardcoded API Key Committed to Public GitHub',
    story: 'Committed a testing script with a live secret key. Within minutes, automated bots sniffed it and attempted fraudulent requests.',
    lesson: 'Use Git pre-commit hooks (like gitleaks) and store keys strictly in environment variables.',
    upvotes: 412,
    tags: ['Security', 'Git', 'API Keys']
  }
];

export const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    id: 'phase-1',
    quarter: 'Phase 1',
    titleKey: 'Core Developer Utilities',
    descKey: 'Fast, client-side tools including JSON Formatter, JWT Inspector, Hash Generator, Base64 Encoder/Decoder, and Regex Tester.',
    status: 'in-progress',
    upvotes: 142,
    category: 'Browser Utilities'
  },
  {
    id: 'phase-2',
    quarter: 'Phase 2',
    titleKey: 'Web & Image Processing Tools',
    descKey: 'In-browser media & front-end helpers: CSS generators, image resizers, color palette utilities, and SVG optimizers.',
    status: 'planned',
    upvotes: 98,
    category: 'Media & Web Tools'
  },
  {
    id: 'phase-3',
    quarter: 'Phase 3',
    titleKey: 'Developer Workflows & Guides',
    descKey: 'Interactive cheat-sheets, code snippet sharing with zero server retention, and practical architecture guides.',
    status: 'planned',
    upvotes: 76,
    category: 'Workflows & Content'
  }
];

export const CAREER_ROLES: CareerRole[] = [
  {
    id: 'cr1',
    title: 'Senior Systems Engineer (Rust / TypeScript)',
    department: 'Engineering',
    type: 'Full-time',
    location: 'Remote Global',
    description: 'Lead the architectural design of MindLoop Cloud and Edge WASM compiler infrastructure.',
    requirements: ['Experience building distributed backend systems', 'Expertise in Rust and TypeScript/Node.js', 'Experience with low-latency networking & Redis']
  },
  {
    id: 'cr2',
    title: 'AI Research Engineer (LLM Agents & AST)',
    department: 'AI Research',
    type: 'Full-time',
    location: 'Remote / Global',
    description: 'Build AST-guided reflection loops using Gemini API & neural code synthesis.',
    requirements: ['Experience with AST parsers (Babel, SWC, Tree-sitter)', 'Strong background in Python, TypeScript, and AI evaluation frameworks']
  },
  {
    id: 'cr3',
    title: 'Product Designer / UX Architect',
    department: 'Product Design',
    type: 'Full-time',
    location: 'Remote Global',
    description: 'Craft minimalist, high-craft developer interfaces with micro-interactions and Framer Motion.',
    requirements: ['Mastery of Figma, Tailwind CSS, Framer Motion, and design token systems', 'Portfolio showcasing developer tools or complex web interfaces']
  }
];
