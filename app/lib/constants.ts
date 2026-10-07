import { Product, ServiceItem, BlogPost, CommunityCrashStory, RoadmapItem, Testimonial, CareerRole, SupportedLocale } from '../types';

export const PRODUCTS_LIST: Product[] = [
  {
    id: 'json-formatter',
    nameKey: 'JSON Formatter & Validator',
    descKey: 'Format, validate, repair, and minify JSON payloads instantly in your browser with zero server latency.',
    status: 'live',
    category: 'json',
    icon: 'Code2',
    techStack: ['Browser JS Engine', 'JSON.parse', 'Local Processing'],
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
    descKey: 'Decode JSON Web Token headers, payloads, and expiration timestamps without leaking sensitive auth claims.',
    status: 'live',
    category: 'auth',
    icon: 'ShieldCheck',
    techStack: ['Base64Url', 'Epoch Time', 'Client Verification']
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
    descKey: 'Convert cURL commands to JavaScript Fetch, Axios, Node.js, Python requests, Go, and PHP snippets instantly in your browser.',
    status: 'live',
    category: 'utilities',
    icon: 'Terminal',
    techStack: ['cURL Parser', 'Multi-Language', 'Local Processing']
  },
  {
    id: 'regex-tester',
    nameKey: 'Regex Matcher & Syntax Tester',
    descKey: 'Test Regular Expression patterns against input text with live match highlighting and group extraction.',
    status: 'live',
    category: 'utilities',
    icon: 'FileCode',
    techStack: ['RegExp Engine', 'Capture Groups', 'Syntax Highlighting']
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
    descKey: 'Compare two text or code files side by side with line-level and character-level diff highlighting. 100% client-side, zero upload.',
    status: 'live',
    category: 'utilities',
    icon: 'Columns2',
    techStack: ['Myers Diff', 'LCS Algorithm', 'Local Processing']
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
    id: 'qr-code-generator',
    nameKey: 'QR Code Generator',
    descKey: 'Generate QR codes for URLs, Wi-Fi networks, vCard contacts, email, and phone numbers. Export as PNG, WebP, or SVG with custom colors and error correction. 100% client-side via qrcode npm.',
    status: 'live',
    category: 'utilities',
    icon: 'QrCode',
    techStack: ['qrcode npm', 'Canvas API', 'SVG Renderer', 'Local Processing']
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
