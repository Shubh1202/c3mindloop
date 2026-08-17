export const BASE_URL = 'https://www.c3mindloop.com';

const defaultOgImage = `${BASE_URL}/og-image.png`;

export const seoConfig = {
  default: {
    siteName: 'C³ MindLoop',
    titleTemplate: '%s | C³ MindLoop',
    baseUrl: BASE_URL,
    twitterHandle: '@c3mindloop',
    defaultOgImage,
    description:
      'Free browser-based developer tools. Format JSON, decode JWTs, convert Base64 - 100% client-side, zero data tracking, no backend.',
    keywords: [
      // Brand + phonetic variations
      'C3 MindLoop', 'C³ MindLoop', 'CCube', 'ccube.dev', 'c cube', 'c qube',
      'C Cube', 'C Qube', 'mindloop', 'c3mindloop', 'c-cube dev tools',
      // Core product
      'free developer tools', 'browser developer tools', 'client-side dev tools',
      'offline developer utilities', 'private developer tools', 'local developer tools',
      'no backend dev tools', 'zero tracking developer tools',
      // Tool categories
      'json formatter', 'jwt decoder', 'base64 encoder', 'developer utility platform',
      'open source developer tools', 'VS Code extensions',
      'json viewer', 

      // PDF
      'ats resume generator', 'private ats cv maker', 'client side resume builder', 'no upload cv creator', 'ats friendly resume builder', 'print to pdf resume online', 'secure resume generator',

      'client side pdf compressor', 'merge pdf offline browser', 'split pdf without upload', 'private pdf suite', 'free secure pdf tools', 'compress pdf locally', 'merge pdf online free',

      'free online developer tools', 'browser-based privacy utilities', 'local first web apps', 'client-side developer utilities', 'free online pdf tools', 'private resume builder',

      // AI Prompt builder
      'ai prompt context builder', 'private prompt assembler', 'client side prompt optimizer', 'secure context window builder', 'token counter online free', 'private prompt engineering tool', 'llm context aggregator', 'local prompt builder'

    ],
  },

  home: {
    title: 'C³ MindLoop — Free, Private & Open Source Developer Utilities',
    description:
      'Instant browser-based developer tools with zero server processing. Use 100% private JSON Formatter, Base64 Encoder, JWT Inspector, Hash Generator, and ATS Resume Builder.',
    keywords: [
      'developer tools', 'json formatter', 'jwt inspector', 'base64 encoder',
      'client-side web tools', 'free online dev utilities', 'ats resume builder'
    ],
    canonical: BASE_URL,
    openGraph: {
      type: 'website' as const,
      title: 'C³ MindLoop — Free, Private & Open Source Developer Utilities',
      description:
        'Instant browser-based developer tools with zero server processing. Use 100% private JSON Formatter, Base64 Encoder, JWT Inspector, Hash Generator, and ATS Resume Builder.',
      url: BASE_URL,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'C³ MindLoop - Free Developer Tools' }],
    },
    twitter: {
      title: 'C³ MindLoop — Free, Private & Open Source Developer Utilities',
      description:
        'Instant browser-based developer tools with zero server processing. Use 100% private JSON Formatter, Base64 Encoder, JWT Inspector, Hash Generator, and ATS Resume Builder.',
      images: [defaultOgImage],
    },
  },

  jsonFormatter: {
    title: 'JSON Formatter, Validator & AI Smart Repair - Free Online Tool | 100% Private',
    description:
      'Free online JSON formatter, validator, beautifier and minifier with built-in AI Smart Repair. Fixes trailing commas, missing brackets, single quotes, and unquoted keys — 100% client-side, zero server upload.',
    keywords: [
      // High-volume primary
      'json formatter', 'json formatter online', 'json beautifier', 'json validator',
      'json minifier', 'json viewer', 'json parser online', 'format json online',
      // High-intent Tier-1 CPC
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant', 'Free Online Utility',
      // AI Smart Repair long-tail
      'json smart repair', 'json ai repair', 'fix broken json online', 'json syntax fixer',
      'auto fix json errors', 'fix json trailing commas', 'fix json missing brackets',
      'json repair tool', 'json error fixer online', 'malformed json fixer',
      'fix single quotes json', 'unquoted keys json fix', 'js comment in json fix',
      'in-browser json ai', 'local ai json tool', 'json ai assist browser',
      // Tree & format long-tail
      'free json formatter online', 'json formatter and validator', 'json beautifier online free',
      'json pretty print online', 'json lint online', 'json format checker',
      'online json editor', 'json tree viewer', 'json to tree view',
      'json to typescript interface', 'json to go struct', 'json to csv converter',
      'json formatter no login', 'json formatter offline', 'client side json formatter',
      'json formatter privacy', 'json formatter no data collection',
      // Competitor alternatives
      'jsonlint alternative', 'jsonformatter.org alternative', 'codebeautify json alternative',
      'json crack alternative', 'json editor online alternative',
      // Brand
      'C³ MindLoop JSON formatter', 'ccube json tool',
    ],
    canonical: `${BASE_URL}/tools/json-formatter`,
    openGraph: {
      title: 'JSON Formatter, Validator & AI Smart Repair — Free | C³ MindLoop',
      description:
        'Format, validate, and auto-repair JSON in the browser. Built-in AI Smart Repair fixes trailing commas, missing brackets, and more — 100% Private, zero server upload.',
      url: `${BASE_URL}/tools/json-formatter`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'JSON Formatter Tool - C³ MindLoop' }],
    },
    twitter: {
      title: 'JSON Formatter + AI Smart Repair — Free | C³ MindLoop',
      description:
        'Format, validate & auto-repair JSON locally. 100% Private, zero server upload. AI Smart Repair runs in-browser.',
      images: [defaultOgImage],
    },
  },

  base64Encoder: {
    title: 'Base64 Encoder & Decoder - Free Online Tool | 100% Private Client-Side | C³ MindLoop',
    description:
      'Free online Base64 encoder and decoder. 100% Private & Client-Side with zero server upload. Encode text, decode Base64 strings, and generate file Data URIs securely.',
    keywords: [
      // High-volume primary
      'base64 encoder', 'base64 decoder', 'base64 encode online', 'base64 decode online',
      'base64 converter', 'encode base64', 'decode base64',
      // High-intent Tier-1 CPC
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant', 'Free Online Utility',
      // Long-tail
      'free base64 encoder online', 'base64 encoder decoder online free',
      'base64 to text converter', 'text to base64 converter', 'base64 string decoder',
      'url safe base64 encoder', 'base64 url encoding', 'file to base64 converter',
      'image to base64 data uri', 'base64 data uri generator', 'base64 utf-8 encoder',
      'base64 encoder no login', 'base64 encoder offline', 'client side base64 tool',
      'base64 encoder privacy', 'base64 encoder no data collection',
      // Competitor alternatives
      'base64encode.org alternative', 'base64guru alternative', 'base64.guru alternative',
      // Brand
      'C³ MindLoop base64 tool', 'ccube base64 encoder',
    ],
    canonical: `${BASE_URL}/tools/base64-encoder`,
    openGraph: {
      title: 'Base64 Encoder & Decoder - Free Online Tool | C³ MindLoop',
      description:
        'Free online Base64 encoder and decoder. 100% Private & Client-Side with zero server upload. Encode text, decode Base64, convert files to Data URI.',
      url: `${BASE_URL}/tools/base64-encoder`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Base64 Encoder Tool - C³ MindLoop' }],
    },
    twitter: {
      title: 'Base64 Encoder & Decoder - Free | C³ MindLoop',
      description:
        'Free online Base64 encoder and decoder. 100% Private & Client-Side, zero server upload.',
      images: [defaultOgImage],
    },
  },

  curlConverter: {
    title: 'cURL to Code Converter - Free Online Tool | Fetch, Axios, Python | 100% Private',
    description:
      'Free online cURL to code converter. Convert cURL commands to JavaScript Fetch, Axios, Python, Go, and PHP. 100% Private client-side execution with zero server upload.',
    keywords: [
      'curl to code', 'curl converter', 'curl to javascript', 'curl to python',
      'curl to fetch', 'curl to axios', 'curl to node', 'curl to go',
      'curl to php', 'convert curl command', 'curl command converter online',
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant', 'Free Online Utility',
      'curl to requests python', 'curl to guzzle', 'curl snippet generator',
      'curl converter online free', 'curl to code snippet', 'api curl converter',
      'C³ MindLoop curl converter', 'ccube curl tool',
    ],
    canonical: `${BASE_URL}/tools/curl-converter`,
    openGraph: {
      title: 'cURL to Code Converter - Free Online Tool | Fetch, Axios, Python | C³ MindLoop',
      description:
        'Convert cURL commands to JavaScript Fetch, Axios, Python, Go, PHP. 100% Private client-side execution with zero server upload.',
      url: `${BASE_URL}/tools/curl-converter`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'cURL Converter Tool - C³ MindLoop' }],
    },
    twitter: {
      title: 'cURL to Code Converter - Free | C³ MindLoop',
      description:
        'Convert cURL to Fetch, Axios, Python, Go, PHP. 100% Private & Client-Side, zero server upload.',
      images: [defaultOgImage],
    },
  },

  cronVisualizer: {
    title: 'Cron Expression Visualizer & Generator - Free Online Tool | 100% Private',
    description:
      'Free online Cron expression visualizer and generator. Parse 5-part and 6-part Cron strings and view execution schedules. 100% Private client-side execution with zero server upload.',
    keywords: [
      'cron expression visualizer', 'cron generator online', 'cron parser', 'cron expression builder',
      'cron job scheduler', 'cron syntax checker', 'cron expression tester', 'cron next run calculator',
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant', 'Free Online Utility',
      'free cron visualizer', 'cron expression to human readable', 'cron schedule visualizer',
      'cron expression explainer', 'cron job builder online', 'cron expression validator',
      'cron expression examples', 'cron schedule generator', 'cron expression decoder',
      'C³ MindLoop cron tool', 'ccube cron visualizer',
    ],
    canonical: `${BASE_URL}/tools/cron-visualizer`,
    openGraph: {
      title: 'Cron Expression Visualizer & Generator - Free Online Tool | C³ MindLoop',
      description:
        'Parse Cron expressions, get human-readable descriptions, and calculate execution times. 100% Private client-side execution with zero server upload.',
      url: `${BASE_URL}/tools/cron-visualizer`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Cron Visualizer Tool - C³ MindLoop' }],
    },
    twitter: {
      title: 'Cron Expression Visualizer & Generator - Free | C³ MindLoop',
      description:
        'Parse Cron strings, visualize schedules, calculate next runs. 100% Private & Client-Side, zero server upload.',
      images: [defaultOgImage],
    },
  },

  jwtInspector: {
    title: 'JWT Decoder & Inspector - Free Online Tool | 100% Private Client-Side',
    description:
      'Free online JWT decoder and inspector. 100% Private & Client-Side with zero server upload. Decode JWT headers, payload claims, and check expiration tokens securely.',
    keywords: [
      // High-volume primary
      'jwt decoder', 'jwt decoder online', 'jwt inspector', 'decode jwt', 'jwt parser',
      'json web token decoder', 'jwt token decoder', 'jwt viewer',
      // High-intent Tier-1 CPC
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant', 'Free Online Utility',
      // Long-tail
      'free jwt decoder online', 'jwt decoder and validator', 'jwt token inspector online',
      'decode jwt payload online', 'jwt header decoder', 'jwt claims viewer',
      'jwt expiry checker', 'jwt expiration checker', 'check jwt expiration online',
      'jwt debugger online', 'json web token debugger', 'jwt token analyzer',
      'jwt decoder no login', 'jwt decoder offline', 'client side jwt decoder',
      'jwt decoder privacy', 'jwt decoder no data collection', 'secure jwt decoder',
      'jwt decoder no server', 'jwt token never leaves browser',
      // Competitor alternatives
      'jwt.io alternative', 'jwtdebugger alternative', 'jwt debugger alternative',
      // Brand
      'C³ MindLoop JWT decoder', 'ccube jwt inspector',
    ],
    canonical: `${BASE_URL}/tools/jwt-inspector`,
    openGraph: {
      title: 'JWT Decoder & Inspector - Free Online Tool | C³ MindLoop',
      description:
        'Free online JWT decoder. Decode header, payload, check expiration - 100% Private & Client-Side. Token never leaves browser.',
      url: `${BASE_URL}/tools/jwt-inspector`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'JWT Inspector Tool - C³ MindLoop' }],
    },
    twitter: {
      title: 'JWT Decoder & Inspector - Free | C³ MindLoop',
      description:
        'Free online JWT decoder. 100% Private & Client-Side - token never leaves browser.',
    },
  },
  regexTester: {
    title: 'Regex Tester, Debugger & AI Pattern Generator - Free Online Tool | 100% Private',
    description:
      'Free online Regular Expression tester with live match highlighting, capture groups, code export, and an AI Pattern Generator. Describe a pattern in plain English — the tool writes the regex. 100% Private, zero server upload.',
    keywords: [
      // High-volume primary
      'regex tester', 'regex tester online', 'regular expression tester', 'regex debugger',
      'regex pattern tester', 'online regex tool', 'regex checker', 'regex validator online',
      // High-intent Tier-1 CPC
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant', 'Free Online Utility',
      // AI Regex Generator long-tail
      'ai regex generator', 'regex generator from description', 'generate regex from text',
      'plain english regex generator', 'in-browser regex ai', 'regex pattern generator online',
      'natural language regex', 'regex from plain text', 'auto generate regex',
      'local ai regex tool', 'regex ai browser', 'regex suggestion tool',
      // Pattern-specific long-tail
      'email regex pattern', 'uuid regex', 'jwt regex', 'ipv4 regex pattern',
      'url regex javascript', 'phone number regex', 'semver regex', 'hex color regex',
      'password regex', 'credit card regex', 'date regex iso 8601', 'mac address regex',
      // Feature long-tail
      'regex capture groups online', 'regex match highlighter', 'regex flags online',
      'regex to javascript code', 'regex to python', 'regex to go', 'regex to php',
      'regex cheatsheet online', 'regex presets', 'ecmascript regex tester',
      'regex tester no login', 'regex tester offline', 'client side regex tester',
      'regex tester privacy', 'regex no data collection',
      // Competitor alternatives
      'regex101 alternative', 'regexr alternative', 'regexpal alternative',
      // Brand
      'C³ MindLoop regex tool', 'ccube regex tester',
    ],
    canonical: `${BASE_URL}/tools/regex-tester`,
    openGraph: {
      title: 'Regex Tester, Debugger & AI Generator — Free | C³ MindLoop',
      description:
        'Test regex patterns with live highlighting and capture groups. Describe a pattern in plain English — the AI generator writes it for you. 100% Private, zero server upload.',
      url: `${BASE_URL}/tools/regex-tester`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Regex Tester Tool - C³ MindLoop' }],
    },
    twitter: {
      title: 'Regex Tester + AI Pattern Generator — Free | C³ MindLoop',
      description:
        'Live regex testing + AI pattern generator from plain English. 100% Private, zero server upload.',
      images: [defaultOgImage],
    },
  },
  sqlToJson: {
    title: 'SQL & cURL to JSON Converter - Free Online Tool | 100% Private Client-Side',
    description:
      'Free online SQL INSERT and cURL command to JSON converter. 100% Private & Client-Side with zero server upload. Parse SQL queries and cURL requests into structured JSON arrays.',
    keywords: [
      'sql to json', 'sql insert to json', 'curl to json', 'curl command parser',
      'sql query converter', 'insert into json converter', 'curl request to json',
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant', 'Free Online Utility',
      'sql to json online free', 'curl headers to json', 'sql json parser online',
      'convert sql to json', 'convert curl to json', 'database to json converter',
      'curl body parser', 'sql select to json array', 'C³ MindLoop sql converter',
    ],
    canonical: `${BASE_URL}/tools/sql-to-json`,
    openGraph: {
      title: 'SQL & cURL to JSON Converter - Free Online Tool | C³ MindLoop',
      description:
        'Convert SQL INSERT statements and cURL commands into clean JSON. 100% Private & Client-Side, zero server upload.',
      url: `${BASE_URL}/tools/sql-to-json`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'SQL to JSON Converter - C³ MindLoop' }],
    },
    twitter: {
      title: 'SQL & cURL to JSON Converter - Free | C³ MindLoop',
      description: 'Convert SQL and cURL to JSON. 100% Private & Client-Side, zero server upload.',
      images: [defaultOgImage],
    },
  },
  hashGenerator: {
    title: 'Hash Generator & Checksum Calculator - SHA-256, MD5, SHA-512 | Free Online Tool',
    description:
      'Free online hash generator and checksum calculator. Compute SHA-256, SHA-512, MD5 hashes and verify file checksums. 100% Private client-side WebCrypto execution with zero server upload.',
    keywords: [
      'hash generator', 'sha256 generator', 'sha-256 online', 'md5 hash generator',
      'sha512 generator', 'sha-1 hash online', 'checksum calculator', 'file checksum verifier',
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant', 'Free Online Utility',
      'hmac generator online', 'cryptographic hash online', 'hash calculator free',
      'sha256 hash checker', 'file integrity checker', 'checksum verification tool',
      'md5 checker online', 'webcrypto hash tool', 'client-side hash generator',
      'C³ MindLoop hash tool', 'ccube hash generator',
    ],
    canonical: `${BASE_URL}/tools/hash-generator`,
    openGraph: {
      title: 'Hash Generator & Checksum Calculator - Free Online Tool | C³ MindLoop',
      description:
        'Generate SHA-256, SHA-512, MD5 hashes and verify file checksums. 100% Private & Client-Side via WebCrypto API.',
      url: `${BASE_URL}/tools/hash-generator`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Hash Generator Tool - C³ MindLoop' }],
    },
    twitter: {
      title: 'Hash Generator & Checksum Calculator - Free | C³ MindLoop',
      description: 'SHA-256, SHA-512, MD5 hash generator. 100% Private & Client-Side, zero server upload.',
      images: [defaultOgImage],
    },
  },
  officeEditor: {
    title: 'Office Editor VS Code Extension - View & Edit Office Files | 100% Private & Offline',
    description:
      'Free VS Code extension to view and edit Excel, Word, PowerPoint, and PDF files directly inside your IDE. 100% Private, local execution with zero server upload.',
    keywords: [
      'Office Editor VS Code', 'VS Code Office Extension', 'view docx in vs code',
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant', 'Free Online Utility',
      'edit xlsx in vs code', 'VS Code excel viewer', 'VS Code pdf viewer',
      'office editor extension', 'c3mindloop office editor'
    ],
    canonical: `${BASE_URL}/tools/office-editor`,
    openGraph: {
      title: 'Office Editor VS Code Extension - View & Edit Office Files | C³ MindLoop',
      description:
        'View and edit Excel, Word, and PDF files directly inside VS Code. 100% Private local processing.',
      url: `${BASE_URL}/tools/office-editor`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Office Editor Extension - C³ MindLoop' }],
    },
    twitter: {
      title: 'Office Editor VS Code Extension | C³ MindLoop',
      description: 'View & edit Excel, Word, and PDF files inside VS Code. 100% Private & Local.',
      images: [defaultOgImage],
    },
  },
  pdfSuite: {
    title: '100% Private Client-Side PDF Compressor & Merger - Free Online Tool',
    description: 'Compress, merge, and split PDF files 100% in your browser. Zero file uploads, zero server processing, complete document privacy.',
    keywords: [
      'compress pdf client side', 'private pdf merger', 'offline pdf compressor', 'in-browser pdf tools', 'no upload pdf merger',
      'split pdf client side', 'merge pdf locally', 'free pdf suite online', 'secure pdf merger', 'secure pdf compressor',
      'local pdf parser', 'extract pages pdf client side', 'pdf optimization browser', 'pdf-lib tool online',
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant', 'Free Online Utility',
      'merge pdf files free no upload', 'compress pdf memory sandbox', 'c3mindloop pdf suite', 'ccube pdf tool'
    ],
    canonical: `${BASE_URL}/tools/pdf-suite`,
    openGraph: {
      title: '100% Private Client-Side PDF Compressor & Merger | C³ MindLoop',
      description: 'Compress, merge, and split PDF files locally in your browser with zero server uploads.',
      url: `${BASE_URL}/tools/pdf-suite`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'PDF Suite - C³ MindLoop' }],
    },
    twitter: {
      title: '100% Private Client-Side PDF Suite | C³ MindLoop',
      description: 'Compress, merge, and split PDF files locally. No uploads, zero tracking.',
      images: [defaultOgImage],
    },
  },

  atsResume: {
    title: 'ATS Resume Generator - Free Online Tool | 100% Private Client-Side | C\u00b3 MindLoop',
    description:
      'Free online ATS compliant resume generator for software developers. 100% Private & Client-Side with zero server upload. Build Workday & Lever parseable PDF resumes instantly.',
    keywords: [
      'free ats compliant resume builder online',
      'developer cv generator',
      'ats resume template free',
      'software engineer resume builder',
      'private resume builder no upload',
      'client-side resume generator',
      'workday ats resume parser',
      'lever ats resume',
      'pdf resume generator online free',
      'technical resume builder 2025',
      'resume builder no sign up',
      '100% private resume tool',
    ],
    canonical: `${BASE_URL}/tools/ats-resume-generator`,
    openGraph: {
      title: 'ATS Resume Generator - Free & Private | C\u00b3 MindLoop',
      description:
        'Build ATS-optimised developer resumes in seconds. Zero server upload. Client-side only. Exports as a clean PDF.',
      url: `${BASE_URL}/tools/ats-resume-generator`,
      type: 'website' as const,
    },
  },
  aiPromptBuilder: {
    title: 'AI Prompt Context Builder - Free Online Tool | 100% Private Client-Side | C\u00b3 MindLoop',
    description: 'Sanitize raw technical context (code snippets, database schemas, JSON logs) locally in your browser and format them into optimized system prompts for LLMs (ChatGPT, Claude, Cursor).',
    keywords: [
      'ai prompt builder', 'prompt context builder', 'sanitize code for chatgpt', 'sanitize prompts for claude',
      'privacy first prompt tool', 'redact api keys code', 'llm prompt sanitizer', 'code helper for cursor',
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant', 'Free Online Utility'
    ],
    canonical: `${BASE_URL}/tools/ai-prompt-builder`,
    openGraph: {
      title: 'AI Prompt Context Builder - Free & Private | C\u00b3 MindLoop',
      description: 'Sanitize raw technical context locally in your browser and format into optimized prompts for LLMs.',
      url: `${BASE_URL}/tools/ai-prompt-builder`,
      type: 'website' as const,
    },
  },
};

// ── JSON-LD Schemas ──────────────────────────────────────────────────────────

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'C³ MindLoop',
  alternateName: ['CCube', 'C-Cube', 'C3 MindLoop', 'c3mindloop', 'ccube.dev'],
  url: BASE_URL,
  logo: `${BASE_URL}/logo.svg`,
  slogan: 'Coding. Crashing. Crying.',
  description: 'Free browser-based developer tools platform. 100% client-side, zero data tracking.',
  foundingDate: '2025',
  sameAs: [
    'https://github.com/c3mindloop',
    'https://twitter.com/c3mindloop',
  ],
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'C³ MindLoop',
  alternateName: ['CCube', 'C3 MindLoop', 'ccube.dev'],
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${BASE_URL}/blog?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'C³ MindLoop',
  alternateName: ['CCube', 'C-Cube', 'C3 MindLoop', 'c3mindloop', 'c qube'],
  url: BASE_URL,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Free local-first developer tools with built-in AI assist: JSON formatter with Smart Repair, Regex Tester with AI Pattern Generator, JWT decoder, Base64 encoder — all 100% client-side, zero data transmission.',
  featureList: [
    'JSON Formatter, Validator and Beautifier',
    'JSON AI Smart Repair (fixes trailing commas, missing brackets, unquoted keys)',
    'Regex Tester with live match highlighting and capture groups',
    'Regex AI Pattern Generator from plain-English description',
    'JWT Decoder and Inspector',
    'Base64 Encoder and Decoder',
    'Local AI Assist via in-browser Web Worker (opt-in, zero download until invoked)',
    '100% client-side processing — zero data transmission',
    'No login required',
  ],
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

export const base64EncoderSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Base64 Encoder & Decoder',
  url: `${BASE_URL}/tools/base64-encoder`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  description:
    'Free online Base64 encoder and decoder. Encode text, decode Base64 strings, generate file Data URIs, URL-safe encoding - 100% Private, Client-Side Execution, GDPR Compliant.',
  featureList: [
    'UTF-8 text to Base64 encoding',
    'Base64 to UTF-8 text decoding',
    'URL-safe Base64 variant (RFC 4648)',
    'File to Base64 Data URI generator',
    'Zero server upload - fully private & GDPR compliant',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

export const jwtInspectorSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'JWT Decoder & Inspector',
  url: `${BASE_URL}/tools/jwt-inspector`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  description:
    'Free online JWT decoder and inspector. Decode JWT headers, payloads, verify expiration - 100% Private, Client-Side Execution, GDPR Compliant, zero server upload.',
  featureList: [
    'Client-side JWT decoding',
    'Header and Payload JSON display',
    'Token expiration live validation',
    'Issued-at and expiry timestamp display',
    'Zero server upload - token never leaves browser',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

export const curlConverterSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'cURL to Code Converter',
  url: `${BASE_URL}/tools/curl-converter`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  description:
    'Free online cURL to code converter. Convert cURL commands to JavaScript Fetch, Axios, Node.js, Python, Go, and PHP - 100% Private, Client-Side Execution, GDPR Compliant.',
  featureList: [
    'cURL to JavaScript Fetch API',
    'cURL to Axios',
    'cURL to Node.js node-fetch',
    'cURL to Python requests',
    'cURL to Go net/http',
    'cURL to PHP cURL and Guzzle',
    'Zero server upload - fully private',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

export const cronVisualizerSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Cron Expression Visualizer & Generator',
  url: `${BASE_URL}/tools/cron-visualizer`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  description:
    'Free online Cron expression visualizer and generator. Parse 5-part and 6-part Cron strings, get human-readable descriptions, calculate next execution times - 100% Private, Client-Side Execution.',
  featureList: [
    '5-part and 6-part Cron expression parsing',
    'Human-readable schedule description',
    'Next 5 execution times in local and UTC',
    'Interactive visual Cron builder',
    'Quick preset expressions',
    'Zero server upload - fully private',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

export const jsonFormatterSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'JSON Formatter, Validator, Beautifier & AI Smart Repair',
  url: `${BASE_URL}/tools/json-formatter`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  description:
    'Free online JSON formatter, validator, beautifier, minifier with built-in AI Smart Repair. Automatically fixes trailing commas, missing brackets, single quotes, JS comments, and unquoted keys. 100% Private, Client-Side Execution, GDPR Compliant, zero server upload.',
  featureList: [
    'Client-side JSON formatting and beautifying with 2-space, 4-space, and tab indentation',
    'Real-time JSON validation with exact error line and column location',
    'Interactive collapsible tree view for nested structures',
    'JSON minification and compact output',
    'AI Smart Repair: auto-fixes trailing commas, missing closing brackets, single quotes, JS comments, unquoted keys',
    'Convert JSON to TypeScript interfaces',
    'Convert JSON to Go structs',
    'Convert JSON to CSV',
    'File upload (.json) and file download support',
    'Synchronized side-by-side scroll between input and output',
    'Zero server upload — fully private and GDPR compliant',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

export const officeEditorSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Office Editor VS Code Extension',
  url: `${BASE_URL}/tools/office-editor`,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Windows, macOS, Linux',
  description:
    'VS Code extension to view and edit Excel, Word, PowerPoint, and PDF files directly within your IDE. Local-first, 100% Private, and offline.',
  featureList: [
    'Excel sheet viewer and editor (.xlsx, .xls)',
    'Word document viewer (.docx, .doc)',
    'PowerPoint previewer (.pptx)',
    'PDF document viewer',
    'Local execution - no third-party cloud uploads',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

export const regexTesterSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Regex Tester, Visual Debugger & AI Pattern Generator',
  url: `${BASE_URL}/tools/regex-tester`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  description:
    'Free online Regular Expression tester with live match highlighting, flags, capture groups, code export, and an AI Pattern Generator. Describe what you need in plain English — email, UUID, JWT, semver — and get a battle-tested pattern instantly. 100% Private, Client-Side Execution, GDPR Compliant.',
  featureList: [
    'Real-time regex pattern matching with live match highlighting',
    'Global, case-insensitive, multiline, sticky, unicode flag toggles',
    'Capture group extraction and match index breakdown',
    'AI Pattern Generator: type plain English, get a production-ready regex (23+ templates)',
    'One-click "Apply Pattern" pipes AI-generated regex directly into the tester',
    'Code export: JavaScript, Python, Go, PHP snippets from the current pattern',
    'Built-in presets: Email, URL, IPv4, UUID v4, and more',
    'Inline regex cheatsheet: character classes, quantifiers, anchors, groups',
    '100% client-side ECMAScript RegExp engine — zero data logging',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

export const sqlToJsonSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SQL & cURL to JSON Converter',
  url: `${BASE_URL}/tools/sql-to-json`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  description:
    'Free online SQL INSERT and cURL command to JSON converter. Parse SQL queries and cURL requests into structured JSON arrays. 100% Private, Client-Side Execution, GDPR Compliant.',
  featureList: [
    'SQL INSERT INTO statement to JSON array parsing',
    'cURL command header and body extraction',
    'Multi-format JSON export (clipboard + download)',
    'Datatype inference (boolean, integer, string)',
    '100% client-side execution - zero server upload',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

export const hashGeneratorSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Hash Generator & Checksum Calculator',
  url: `${BASE_URL}/tools/hash-generator`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  description:
    'Free online hash generator. Compute SHA-256, SHA-512, SHA-1, and MD5 cryptographic hashes. Verify file checksums - 100% Private, Client-Side Execution via WebCrypto API.',
  featureList: [
    'SHA-256 and SHA-512 via native Web Crypto API',
    'MD5 checksum calculation (client-side JS)',
    'SHA-1 legacy hash support',
    'Local file checksum verification',
    'One-click copy for all hash outputs',
    '100% client-side - zero server upload',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

// ─── ATS Resume Generator ────────────────────────────────────────────────────
export const atsResumeSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ATS Resume Generator',
  url: `${BASE_URL}/tools/ats-resume-generator`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  description:
    'Free online ATS compliant resume generator for software developers. 100% Private & Client-Side with zero server upload. Build Workday & Lever parseable PDF resumes instantly.',
  featureList: [
    'ATS-optimised resume builder for developers',
    'Live preview with instant PDF print export',
    'Workday, Lever & Greenhouse ATS compatible',
    '100% client-side - zero server upload, GDPR Compliant',
    'Section editor: Experience, Skills, Projects, Education',
    'Download as vector PDF via browser print API',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

export const pdfSuiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PDF Suite (Compress, Merge & Split)',
  url: `${BASE_URL}/tools/pdf-suite`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  description:
    'Free 100% private client-side PDF suite. Compress PDF sizes, merge multiple documents, and split page ranges locally in browser memory without server uploads.',
  featureList: [
    'Client-side PDF merging with custom file re-ordering',
    'Client-side PDF compression with Basic and Strong presets',
    'Client-side PDF page range splitting and extraction',
    '100% client-side execution — documents never upload to any server',
    'GDPR compliant and secure document sandbox',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

export const aiPromptBuilderSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AI Prompt Context Builder',
  url: `${BASE_URL}/tools/ai-prompt-builder`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  description:
    'Free online AI Prompt Context Builder. Sanitize raw technical context locally in your browser and format them into optimized prompts for LLMs.',
  featureList: [
    'Local zero-knowledge regex-based sanitization',
    'Automatic redaction of Bearer tokens, DB URIs, IPs, and API secrets',
    'Dynamic LLM template injection for Debugging, Refactoring, Unit Tests, and Schemas',
    'Quick action controls to copy prompts, copy as Markdown, and open directly in ChatGPT/Claude',
    '100% client-side execution — your data never leaves your device',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

