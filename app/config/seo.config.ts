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
      'developer utilities', 'VS Code extensions',
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
    title: 'C³ MindLoop - Free & Private Developer Utilities',
    description:
      'Free browser-based developer tools that run 100% locally -  JSON Formatter, JWT Inspector, Base64 Encoder, Regex Tester & more. No server. No tracking.',
    keywords: [
      'developer tools', 'json formatter', 'jwt inspector', 'base64 encoder',
      'client-side web tools', 'free online dev utilities', 'ats resume builder'
    ],
    canonical: BASE_URL,
    openGraph: {
      type: 'website' as const,
      title: 'C³ MindLoop - Free & Private Developer Utilities',
      description:
        'Free browser-based developer tools that run 100% locally -  JSON Formatter, JWT Inspector, Base64 Encoder, Regex Tester & more. No server. No tracking.',
      url: BASE_URL,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'C³ MindLoop - Free Developer Tools' }],
    },
    twitter: {
      title: 'C³ MindLoop - Free & Private Developer Utilities',
      description:
        'Free browser-based developer tools that run 100% locally -  JSON Formatter, JWT Inspector, Base64 Encoder, Regex Tester & more. No server. No tracking.',
      images: [defaultOgImage],
    },
  },

  jsonFormatter: {
    title: 'JSON Formatter, Validator & AI Smart Repair - Free Online Tool | 100% Private',
    description:
      'Free online JSON formatter, validator, beautifier and minifier with built-in AI Smart Repair. Fixes trailing commas, missing brackets, single quotes, and unquoted keys - 100% client-side, zero server upload.',
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
      title: 'JSON Formatter, Validator & AI Smart Repair - Free | C³ MindLoop',
      description:
        'Format, validate, and auto-repair JSON in the browser. Built-in AI Smart Repair fixes trailing commas, missing brackets, and more - 100% Private, zero server upload.',
      url: `${BASE_URL}/tools/json-formatter`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'JSON Formatter Tool - C³ MindLoop' }],
    },
    twitter: {
      title: 'JSON Formatter + AI Smart Repair - Free | C³ MindLoop',
      description:
        'Format, validate & auto-repair JSON locally. 100% Private, zero server upload. AI Smart Repair runs in-browser.',
      images: [defaultOgImage],
    },
  },

  pipeline: {
    title: 'Tool Pipeline Builder - Chain Developer Tools',
    description:
      'Chain multiple developer tools in sequence: Base64 decode, JSON format, JWT inspect, regex filter and more. Each step feeds the next. 100% client-side, zero server upload.',
    keywords: [
      'tool pipeline', 'developer tool chain', 'pipe developer tools', 'chain tools online',
      'base64 to json pipeline', 'jwt decode json format', 'tool automation browser',
      'client-side pipeline', 'local tool pipeline', 'no server tool chain',
      'C³ MindLoop pipeline', 'ccube pipeline tool', 'developer workflow tools',
    ],
    canonical: `${BASE_URL}/tools/pipeline`,
    openGraph: {
      title: 'Tool Pipeline Builder - Chain Developer Tools | C³ MindLoop',
      description:
        'Chain Base64, JSON, JWT, Regex and Hash tools in sequence. Each step feeds the next. 100% client-side.',
      url: `${BASE_URL}/tools/pipeline`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Tool Pipeline Builder - C³ MindLoop' }],
    },
    twitter: {
      title: 'Tool Pipeline Builder | C³ MindLoop',
      description: 'Chain developer tools in sequence. Base64 → JSON → JWT → Regex. 100% client-side.',
      images: [defaultOgImage],
    },
  },

  base64Encoder: {
    title: 'Base64 Encoder & Decoder - Free Online Tool | 100% Private Client-Side',
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
      'Free online Regular Expression tester with live match highlighting, capture groups, code export, and an AI Pattern Generator. Describe a pattern in plain English - the tool writes the regex. 100% Private, zero server upload.',
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
      title: 'Regex Tester, Debugger & AI Generator - Free | C³ MindLoop',
      description:
        'Test regex patterns with live highlighting and capture groups. Describe a pattern in plain English - the AI generator writes it for you. 100% Private, zero server upload.',
      url: `${BASE_URL}/tools/regex-tester`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Regex Tester Tool - C³ MindLoop' }],
    },
    twitter: {
      title: 'Regex Tester + AI Pattern Generator - Free | C³ MindLoop',
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
  passwordShuffleGenerator: {
    title: 'Password Generator & List Randomizer - Free Online Tool | 100% Private',
    description:
      'Free online password generator and shuffle/randomizer. Generate cryptographically secure passwords with configurable length, character sets, and entropy display. Shuffle any list or string. 100% client-side via crypto.getRandomValues, zero server upload, GDPR compliant.',
    keywords: [
      // High-volume primary — password
      'password generator', 'random password generator', 'secure password generator',
      'password generator online', 'strong password generator', 'password creator',
      'free password generator', 'password generator no login', 'password maker online',
      'complex password generator', 'safe password generator', 'password generator tool',
      // Character set & options long-tail
      'password generator with symbols', 'password generator with numbers',
      'uppercase lowercase password generator', 'exclude ambiguous characters password',
      'password length generator', 'custom password generator',
      'password generator 16 characters', 'password generator 32 characters',
      'password generator 64 characters', 'alphanumeric password generator',
      // Entropy / strength
      'password strength checker', 'password entropy calculator', 'entropy bits password',
      'how strong is my password', 'password security checker', 'password complexity tool',
      // List randomizer / shuffle
      'list randomizer', 'shuffle list online', 'text shuffler', 'random list generator',
      'randomize list online', 'item shuffler', 'word randomizer', 'list shuffler',
      'shuffle words online', 'random order generator', 'shuffle text online',
      'randomize order of items', 'team randomizer', 'name picker random',
      // Fisher-Yates & crypto
      'fisher yates shuffle', 'crypto.getRandomValues', 'cryptographic password',
      'cryptographically secure password', 'CSPRNG password generator',
      // Privacy & client-side
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant', 'Free Online Utility',
      'offline password generator', 'password generator no account',
      'private password generator', 'password generator no data collection',
      'password generator browser only', 'password generator without registration',
      // Competitor alternatives
      'lastpass password generator alternative', 'bitwarden password generator alternative',
      '1password generator alternative', 'dashlane password generator alternative',
      // Brand
      'C³ MindLoop password tool', 'ccube password generator', 'c3mindloop shuffle tool',
    ],
    canonical: `${BASE_URL}/tools/password-shuffle-generator`,
    openGraph: {
      title: 'Password Generator & List Randomizer - Free | C³ MindLoop',
      description:
        'Generate cryptographically secure passwords and shuffle any list. Configurable length, character sets, entropy display. 100% Private, zero server upload.',
      url: `${BASE_URL}/tools/password-shuffle-generator`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Password & Shuffle Generator - C³ MindLoop' }],
    },
    twitter: {
      title: 'Password Generator & List Randomizer - Free | C³ MindLoop',
      description: 'Cryptographically secure passwords + list shuffler. Entropy display, 100% Private & Client-Side.',
      images: [defaultOgImage],
    },
  },
  qrCodeGenerator: {
    title: 'QR Code Generator — URL, Wi-Fi, vCard, Email | Free Online Tool',
    description:
      'Free online QR code generator. Create QR codes for URLs, text, email, phone numbers, Wi-Fi networks, and vCard contacts. Export as PNG, WebP, or SVG with custom colors and error correction. 100% client-side, zero upload.',
    keywords: [
      'qr code generator', 'qr code maker', 'free qr code generator', 'qr code online',
      'qr code creator', 'qr code maker free', 'generate qr code', 'qr code scanner online',
      'wifi qr code generator', 'wifi qr code', 'qr code for wifi', 'wifi password qr code',
      'vcard qr code generator', 'contact qr code', 'qr code for contact',
      'url qr code generator', 'link to qr code', 'website qr code',
      'email qr code', 'phone number qr code', 'text qr code',
      'qr code png download', 'qr code svg download', 'qr code webp',
      'custom qr code colors', 'colored qr code generator', 'qr code with logo',
      'qr code error correction', 'qr code size generator',
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'Free Online Utility',
      'C³ MindLoop qr tool', 'ccube qr code generator',
    ],
    canonical: `${BASE_URL}/tools/qr-code-generator`,
    openGraph: {
      title: 'QR Code Generator — URL, Wi-Fi, vCard | Free Online Tool | C³ MindLoop',
      description:
        'Generate QR codes for URLs, Wi-Fi, vCard contacts, email, and phone. Export PNG, WebP, SVG. Custom colors. 100% Client-Side.',
      url: `${BASE_URL}/tools/qr-code-generator`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'QR Code Generator - C³ MindLoop' }],
    },
    twitter: {
      title: 'QR Code Generator — URL, Wi-Fi, vCard | Free | C³ MindLoop',
      description: 'QR codes for URLs, Wi-Fi, vCard, email, phone. PNG/SVG export. Custom colors. 100% client-side.',
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
    title: 'ATS Resume Generator - Free Online Tool | 100% Private Client-Side',
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
    title: 'AI Prompt Context Builder - Free Online Tool | 100% Private Client-Side',
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

  diffChecker: {
    title: 'Diff Checker - Compare Text & Code Online | Free, 100% Private',
    description:
      'Free online diff checker. Compare two versions of code, JSON, YAML, or plain text side by side with line-level and character-level highlighting. 100% client-side, zero server upload.',
    keywords: [
      'diff checker', 'text diff online', 'code diff tool', 'compare two files online',
      'diff viewer', 'line diff checker', 'code comparison tool', 'unified diff online',
      'diff tool free', 'online diff checker', 'file diff compare',
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant', 'Free Online Utility',
      'json diff checker', 'yaml diff tool', 'compare text files online',
      'character level diff', 'side by side diff', 'inline diff viewer',
      'C³ MindLoop diff checker', 'ccube diff tool',
    ],
    canonical: `${BASE_URL}/tools/diff-checker`,
    openGraph: {
      title: 'Diff Checker - Compare Text & Code Online | C³ MindLoop',
      description:
        'Side-by-side and inline diff viewer with character-level highlighting. 100% Private, zero server upload.',
      url: `${BASE_URL}/tools/diff-checker`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Diff Checker - C³ MindLoop' }],
    },
    twitter: {
      title: 'Diff Checker - Compare Text & Code | C³ MindLoop',
      description: 'Side-by-side diff with character-level highlighting. 100% Private & Client-Side.',
      images: [defaultOgImage],
    },
  },

  jsonGraphVisualizer: {
    title: 'JSON Graph Visualizer - Interactive Node Graph | Free, 100% Private',
    description: 'Visualize JSON as an interactive node graph in your browser. Pan, zoom, expand/collapse nodes, export as PNG. 100% client-side, zero server upload.',
    keywords: [
      'json graph visualizer', 'json node graph', 'json tree visualizer', 'visualize json structure',
      'json graph online', 'json crack alternative', 'json visual explorer',
      'interactive json viewer', 'json relationship graph', 'json to graph',
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant',
      'C³ MindLoop json graph', 'ccube json visualizer',
    ],
    canonical: `${BASE_URL}/tools/json-graph`,
    openGraph: {
      title: 'JSON Graph Visualizer - Interactive Node Graph | C³ MindLoop',
      description: 'Visualize JSON as an interactive node graph. Pan, zoom, collapse nodes, export PNG. 100% client-side.',
      url: `${BASE_URL}/tools/json-graph`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'JSON Graph Visualizer - C³ MindLoop' }],
    },
    twitter: {
      title: 'JSON Graph Visualizer - Free, 100% Private | C³ MindLoop',
      description: 'Visualize JSON as interactive node graphs. Pan, zoom, export PNG. Zero server upload.',
      images: [defaultOgImage],
    },
  },

  codeComplexityAnalyzer: {
    title: 'Code Complexity Analyzer -  Cyclomatic & Cognitive Complexity | Free, 100% Private',
    description:
      'Analyze cyclomatic complexity and cognitive complexity per function for JavaScript, TypeScript, Python, Java, Go, C, and C++. Get actionable refactor suggestions. 100% client-side, zero server upload.',
    keywords: [
      'code complexity analyzer', 'cyclomatic complexity', 'cognitive complexity',
      'code quality tool', 'refactor suggestions', 'function complexity checker',
      'javascript complexity analyzer', 'typescript complexity', 'python complexity',
      'java complexity checker', 'go complexity', 'c cpp complexity',
      'code complexity metrics', 'complexity per function', 'code smell detector',
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant', 'Free Online Utility',
      'free code complexity tool', 'online complexity checker', 'browser complexity analyzer',
      'C³ MindLoop complexity analyzer', 'ccube complexity tool',
    ],
    canonical: `${BASE_URL}/tools/code-complexity-analyzer`,
    openGraph: {
      title: 'Code Complexity Analyzer -  Free Online Tool | C³ MindLoop',
      description:
        'Cyclomatic & cognitive complexity per function, with refactor suggestions. 100% Private, zero server upload.',
      url: `${BASE_URL}/tools/code-complexity-analyzer`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Code Complexity Analyzer - C³ MindLoop' }],
    },
    twitter: {
      title: 'Code Complexity Analyzer -  Free | C³ MindLoop',
      description: 'Cyclomatic & cognitive complexity + refactor suggestions. 100% Private & Client-Side.',
      images: [defaultOgImage],
    },
  },

  editPdf: {
    title: 'Edit PDF Online Free- Annotate, Add Text, Sign & Fill Forms',
    description:
      'Free browser-based PDF editor. Add text, draw shapes, place images, sign documents, fill forms, manage pages, and download- all processed locally with no file upload required.',
    keywords: [
      'edit pdf online', 'pdf editor', 'annotate pdf', 'add text to pdf',
      'pdf annotation tool', 'edit pdf in browser', 'sign pdf online',
      'fill pdf form online', 'pdf form filler', 'free pdf editor',
      'pdf editor no upload', 'client-side pdf editor', 'pdf editor privacy',
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant',
      'add image to pdf', 'whiteout pdf text', 'pdf page manager',
      'rotate pdf pages', 'delete pdf pages', 'reorder pdf pages',
      'C³ MindLoop pdf editor', 'ccube edit pdf',
    ],
    canonical: `${BASE_URL}/tools/edit-pdf`,
    openGraph: {
      title: 'Edit PDF Online Free- Annotate, Sign & Fill Forms | C³ MindLoop',
      description:
        'Add text, images, signatures and form values to any PDF directly in your browser. No upload required.',
      url: `${BASE_URL}/tools/edit-pdf`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Edit PDF - C³ MindLoop' }],
    },
    twitter: {
      title: 'Edit PDF Online Free- Annotate, Sign & Fill | C³ MindLoop',
      description: 'Free browser-based PDF editor. Add text, sign, fill forms. No file upload.',
      images: [defaultOgImage],
    },
  },

  nodeEventLoopVisualizer: {
    title: 'Node.js Event Loop Visualizer - Interactive Simulation',
    description:
      'Free interactive Node.js Event Loop visualizer. Step through Call Stack, Macrotasks, Microtasks, process.nextTick, Timers, and I/O phases 100% client-side.',
    keywords: [
      'nodejs event loop visualizer', 'node event loop visualizer', 'javascript event loop visualization',
      'event loop simulator', 'call stack visualizer', 'microtask queue visualizer', 'macrotask queue',
      'process.nexttick visualizer', 'setimmediate vs settimeout visualizer', 'libuv event loop phases',
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant', 'Free Developer Tool',
      'C³ MindLoop node visualizer', 'c3 mindloop event loop',
    ],
    canonical: `${BASE_URL}/tools/node-event-loop-visualizer`,
    openGraph: {
      title: 'Node.js Event Loop Visualizer - Interactive Simulation | C³ MindLoop',
      description:
        'Step through Call Stack, Timers, Check, I/O Poll, and nextTick microtask queues in real-time. 100% Client-Side.',
      url: `${BASE_URL}/tools/node-event-loop-visualizer`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Node.js Event Loop Visualizer - C³ MindLoop' }],
    },
    twitter: {
      title: 'Node.js Event Loop Visualizer - Free | C³ MindLoop',
      description: 'Interactive Node.js Event Loop simulator with step-by-step queue execution.',
      images: [defaultOgImage],
    },
  },

  jsEventLoopVisualizer: {
    title: 'JavaScript Event Loop Visualizer (JSV9000 & Loupe Online)',
    description:
      'Free interactive JavaScript Event Loop visualizer inspired by JS Visualizer 9000 and Loupe. Step through Call Stack, Task Queue, Microtask Queue, and the 4-phase Event Loop cycle 100% client-side in your browser.',
    keywords: [
      'javascript event loop visualizer', 'js visualizer 9000', 'jsv9000 online', 'loupe visualizer',
      'js event loop simulation', 'call stack visualizer', 'microtask queue vs task queue',
      'promise vs settimeout event loop', 'event loop 4 steps', 'interactive event loop debugger',
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'Free Online Utility',
      'C³ MindLoop JS visualizer', 'c3mindloop event loop',
    ],
    canonical: `${BASE_URL}/tools/js-event-loop-visualizer`,
    openGraph: {
      title: 'JavaScript Event Loop Visualizer (JSV9000) | C³ MindLoop',
      description:
        'Interactive JavaScript Event Loop visualizer. Step through Call Stack, Task Queue (Macrotasks), Microtask Queue, and the 4-phase Event Loop 100% client-side.',
      url: `${BASE_URL}/tools/js-event-loop-visualizer`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'JavaScript Event Loop Visualizer - C³ MindLoop' }],
    },
    twitter: {
      title: 'JavaScript Event Loop Visualizer | C³ MindLoop',
      description: 'Step-by-step interactive JavaScript Event Loop simulator (Call Stack, Task Queue, Microtask Queue).',
      images: [defaultOgImage],
    },
  },

  gitVisualizer: {
    title: 'Git Interactive DAG Visualizer & Branch Simulator',
    description:
      'Free interactive Git DAG visualizer and branch simulator. Visualize git commit, branch, merge, rebase, cherry-pick, and reset in real-time with an interactive terminal. 100% client-side, zero upload.',
    keywords: [
      'git visualizer', 'git interactive graph', 'git branch visualizer', 'git dag simulator',
      'visualize git merge and rebase', 'git cherry-pick visualizer', 'interactive git tutorial online',
      'learn git branching visually', 'git commit tree graph', 'git terminal simulator',
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'Free Developer Utility',
      'C³ MindLoop git visualizer', 'c3mindloop git graph',
    ],
    canonical: `${BASE_URL}/tools/git-visualizer`,
    openGraph: {
      title: 'Git Interactive DAG Visualizer & Branch Simulator | C³ MindLoop',
      description:
        'Visualize Git commits, branches, merges, and rebases in real-time. Interactive command terminal and animated DAG graph.',
      url: `${BASE_URL}/tools/git-visualizer`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Git DAG Visualizer - C³ MindLoop' }],
    },
    twitter: {
      title: 'Git Interactive DAG Visualizer | C³ MindLoop',
      description: 'Interactive Git DAG graph simulator with live terminal for merge, rebase, cherry-pick & branch.',
      images: [defaultOgImage],
    },
  },

  codeCompiler: {
    title: 'Online Code Compiler - Run Python, JavaScript, Java, C, C++, PHP',
    description:
      'Free online multi-language code compiler and runner. Execute Python 3, JavaScript (Node.js), Java, C, C++, and PHP code directly in your browser with real-time stdout/stderr, interactive stdin, and distraction-free fullscreen IDE mode. No signup required.',
    keywords: [
      'online compiler', 'online code runner', 'online ide',
      'run python online', 'run javascript online', 'run java online',
      'run c online', 'run cpp online', 'c++ online compiler', 'run php online',
      'php online compiler', 'php runner online', 'php code editor',
      'free code compiler', 'browser compiler', 'execute code online',
      'python playground', 'javascript runner online', 'java compiler online',
      'fullscreen code compiler', 'online terminal code runner',
      'code editor with stdin', 'no signup compiler', 'sandboxed code execution',
      'C³ MindLoop code compiler', 'ccube compiler',
    ],
    canonical: `${BASE_URL}/compiler`,
    openGraph: {
      title: 'Online Code Compiler - Run Python, JS, Java, C, C++, PHP | C³ MindLoop',
      description:
        'Run Python, JavaScript, Java, C, C++, and PHP code directly in your browser. Real-time stdout, stderr diagnostics, interactive stdin & full-screen mode.',
      url: `${BASE_URL}/compiler`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Online Code Compiler - C³ MindLoop' }],
    },
    twitter: {
      title: 'Online Code Compiler - Run Python, JS, Java, C, C++, PHP | C³ MindLoop',
      description:
        'Execute code online in 6 languages with instant stdout, stderr, stdin, and fullscreen IDE mode. 100% Free.',
      images: [defaultOgImage],
    },
  },

  workflowBuilder: {
    title: 'Visual Workflow Builder - Free Online Tool | C³ MindLoop',
    description:
      'Build, connect, and execute browser-based data transformation workflows visually. 100% client-side DAG execution, zero server upload.',
    keywords: [
      'visual workflow builder', 'data pipeline builder online', 'browser workflow engine',
      'dag visualizer and runner', 'client-side data pipelines', 'json workflow builder',
      'developer workflow automation', '100% Private', 'Client-Side Execution',
      'C³ MindLoop workflow builder', 'c3mindloop visual workflow',
    ],
    canonical: `${BASE_URL}/tools/workflow-builder`,
    openGraph: {
      title: 'Visual Workflow Builder - Free Online Tool | C³ MindLoop',
      description:
        'Build, connect, and execute browser-based data transformation workflows visually. 100% client-side DAG execution.',
      url: `${BASE_URL}/tools/workflow-builder`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Visual Workflow Builder - C³ MindLoop' }],
    },
    twitter: {
      title: 'Visual Workflow Builder - Free | C³ MindLoop',
      description: 'Build and run data transformation workflows in your browser with zero server latency.',
      images: [defaultOgImage],
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
  description: 'Free local-first developer tools with built-in AI assist: JSON formatter with Smart Repair, Regex Tester with AI Pattern Generator, JWT decoder, Base64 encoder - all 100% client-side, zero data transmission.',
  featureList: [
    'JSON Formatter, Validator and Beautifier',
    'JSON AI Smart Repair (fixes trailing commas, missing brackets, unquoted keys)',
    'Regex Tester with live match highlighting and capture groups',
    'Regex AI Pattern Generator from plain-English description',
    'JWT Decoder and Inspector',
    'Base64 Encoder and Decoder',
    'Local AI Assist via in-browser Web Worker (opt-in, zero download until invoked)',
    '100% client-side processing - zero data transmission',
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
    'Zero server upload - fully private and GDPR compliant',
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
    'Free online Regular Expression tester with live match highlighting, flags, capture groups, code export, and an AI Pattern Generator. Describe what you need in plain English - email, UUID, JWT, semver - and get a battle-tested pattern instantly. 100% Private, Client-Side Execution, GDPR Compliant.',
  featureList: [
    'Real-time regex pattern matching with live match highlighting',
    'Global, case-insensitive, multiline, sticky, unicode flag toggles',
    'Capture group extraction and match index breakdown',
    'AI Pattern Generator: type plain English, get a production-ready regex (23+ templates)',
    'One-click "Apply Pattern" pipes AI-generated regex directly into the tester',
    'Code export: JavaScript, Python, Go, PHP snippets from the current pattern',
    'Built-in presets: Email, URL, IPv4, UUID v4, and more',
    'Inline regex cheatsheet: character classes, quantifiers, anchors, groups',
    '100% client-side ECMAScript RegExp engine - zero data logging',
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
    '100% client-side execution - documents never upload to any server',
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
    '100% client-side execution - your data never leaves your device',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

export const diffCheckerSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Diff Checker',
  url: `${BASE_URL}/tools/diff-checker`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  description:
    'Free online diff checker. Compare two versions of code, JSON, YAML, or plain text with line-level and character-level diff highlighting. 100% Private, Client-Side Execution, GDPR Compliant.',
  featureList: [
    'Line-level diff using Myers/LCS algorithm',
    'Character-level intra-line highlighting for changed lines',
    'Side-by-side split view with synchronized scrolling',
    'Unified inline view',
    'File upload for both panels (FileReader API, no server upload)',
    'Copy unified diff output to clipboard',
    'Swap, Sample, Clear, and Fullscreen toolbar actions',
    '100% client-side execution - zero data transmission',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

export const editPdfSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Edit PDF- Online PDF Editor',
  url: `${BASE_URL}/tools/edit-pdf`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  description:
    'Free browser-based PDF editor. Add text overlays, draw whiteout rectangles, place images, draw freehand signatures, manage pages (rotate, delete, reorder), and fill AcroForm fields. All processing runs locally using pdf-lib and pdfjs-dist- no file upload required.',
  featureList: [
    'Add and position text overlays on any PDF page',
    'Whiteout / redact content with white rectangles',
    'Place images and stamps on PDF pages',
    'Draw freehand signatures and place them on any page',
    'Fill AcroForm text fields, checkboxes, and dropdowns',
    'Rotate, delete, and reorder PDF pages',
    'Undo / redo full edit history',
    'Export and download the annotated PDF',
    'Client-side processing using pdf-lib- no server upload',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

export const passwordShuffleGeneratorSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Password Generator & List Randomizer',
  url: `${BASE_URL}/tools/password-shuffle-generator`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  description:
    'Free online password generator and list randomizer. Generate cryptographically secure passwords with configurable length (8–128), character sets, ambiguous character exclusion, and live entropy display. Shuffle any newline-separated list or string using Fisher-Yates with crypto.getRandomValues. 100% Private, Client-Side Execution, GDPR Compliant, zero server upload.',
  featureList: [
    'Cryptographically secure password generation via crypto.getRandomValues (CSPRNG)',
    'Configurable password length from 8 to 128 characters',
    'Four independent character set toggles: Uppercase, Lowercase, Digits, Symbols',
    'Exclude visually ambiguous characters (0, O, l, 1, I) with one click',
    'Live entropy display in bits with four-tier strength label (Weak / Fair / Strong / Very Strong)',
    'Guaranteed character-category inclusion — every enabled type appears in the output',
    'Fisher-Yates list shuffler with crypto.getRandomValues — uniform random order',
    'Single-line input shuffles individual characters; multi-line input shuffles items',
    'One-click Copy to clipboard with 2-second confirmation feedback',
    'Load Sample presets for instant demo in both modes',
    'Full-screen mode with Escape-key exit',
    '100% client-side — no passwords or list data ever leave the browser',
    'Zero persistence — nothing written to localStorage, sessionStorage, or cookies',
    'GDPR compliant, zero server upload',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

export const pipelineSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Tool Pipeline Builder',
  url: `${BASE_URL}/tools/pipeline`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All Web Browsers',
  description:
    'Chain multiple developer tools together in a visual pipeline. Base64 decode, JSON format, JWT inspect, regex filter - each step feeds the next. 100% client-side, zero server upload.',
  featureList: [
    'Chain up to 8 tool adapters in sequence',
    'Drag-and-drop step reordering',
    'Auto-run with 350ms debounce',
    'Shareable pipeline URL via URL hash encoding',
    'Per-step output preview and error display',
    'Download final output as plain text',
    '100% client-side - no data leaves the browser',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

export const workflowBuilderSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Visual Workflow Builder',
  url: `${BASE_URL}/tools/workflow-builder`,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'All Web Browsers',
  description:
    'Build, connect, and execute browser-based data transformation workflows visually. 100% client-side DAG execution, zero server upload.',
  featureList: [
    'Visual node-based canvas with drag-and-drop',
    'Real client-side DAG execution engine with cycle detection',
    'Nodes: JSON Input, JSON Formatter, Base64 Encode/Decode, Regex Match, SHA-256 Hash, Conditional Branch, Output Sink',
    'Per-node execution status, duration, and intermediate output inspection',
    'Import and export workflow JSON schemas with schema validation',
    'LocalStorage auto-save and preset templates',
    '100% client-side - zero data transmission',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C³ MindLoop', url: BASE_URL },
};

export const nodeEventLoopVisualizerSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Node.js Event Loop Visualizer',
  url: `${BASE_URL}/tools/node-event-loop-visualizer`,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'All Web Browsers',
  description:
    'Interactive Node.js Event Loop visualizer and simulator. Step through Call Stack, Macrotask Queue, Microtask Queue, process.nextTick, and Event Loop phases 100% client-side.',
  featureList: [
    'Interactive step-by-step Call Stack frame execution and inspection',
    'Macrotask Queue monitoring (setTimeout, setInterval, setImmediate, I/O)',
    'Microtask & process.nextTick queue execution prioritization',
    'Visual stepper for Event Loop phases (Timers, Pending, Poll, Check, Close)',
    'Live standard output terminal emulation with console.log streaming',
    'CommonJS and ESModules module syntax toggle support',
    '100% client-side AST execution - zero server upload',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C\u00b3 MindLoop', url: BASE_URL },
};

export const jsEventLoopVisualizerSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'JavaScript Event Loop Visualizer',
  url: `${BASE_URL}/tools/js-event-loop-visualizer`,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'All Web Browsers',
  description:
    'Free interactive JavaScript Event Loop visualizer inspired by JS Visualizer 9000 and Loupe. Step through Call Stack, Task Queue, Microtask Queue, and the 4-phase Event Loop cycle 100% client-side.',
  featureList: [
    'Interactive step-by-step Call Stack execution and active frame highlighting',
    'Task Queue (Macrotasks: setTimeout, setInterval, event callbacks) visual container',
    'Microtask Queue (Promise.then, queueMicrotask, async/await resumption) tracking',
    '4-phase Event Loop cycle stepper (1. Evaluate Script -> 2. Run a Task -> 3. Run all Microtasks -> 4. Rerender)',
    'Live browser console.log stream output with timestamp logs',
    'Interactive step scrubbing timeline with variable playback speeds (0.5x, 1x, 2x)',
    '100% client-side JavaScript execution — zero server communication',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C\u00b3 MindLoop', url: BASE_URL },
};

export const gitVisualizerSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Git Interactive DAG Visualizer',
  url: `${BASE_URL}/tools/git-visualizer`,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'All Web Browsers',
  description:
    'Free interactive Git Directed Acyclic Graph (DAG) visualizer and branch simulator. Test git commit, merge, rebase, cherry-pick, reset, and checkout with a live terminal. 100% client-side.',
  featureList: [
    'Interactive animated Git commit DAG (Directed Acyclic Graph) rendering',
    'Support for git commit, branch, checkout, switch, merge, rebase, cherry-pick, reset, and tag',
    'Real-time terminal emulator with command history and instant output feedback',
    'Pre-loaded scenarios: Feature Branch Merge, Rebase vs Merge, Cherry-Pick, Hotfix release',
    'Commit node inspector with full hash, parent list, message, and branch pointer tags',
    '100% client-side in-memory execution — zero server uploads',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C\u00b3 MindLoop', url: BASE_URL },
};

export const qrCodeGeneratorSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'QR Code Generator',
  url: `${BASE_URL}/tools/qr-code-generator`,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'All Web Browsers',
  description:
    'Free online QR code generator. Create QR codes for URLs, text, email, phone numbers, Wi-Fi networks, and vCard contacts. Export as PNG, WebP, or SVG with custom colors and error correction levels. 100% client-side via the qrcode npm library.',
  featureList: [
    'URL, text, email, phone, Wi-Fi, and vCard QR code types',
    'PNG, WebP, and SVG export formats',
    'Custom foreground and background colors with preset palettes',
    'Error correction level selection: L, M, Q, H',
    'Adjustable QR code size (100\u2013600px) and quiet zone margin',
    'Copy image to clipboard and copy SVG markup',
    'Fullscreen QR preview mode',
    '100% client-side \u2014 no data leaves the browser',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C\u00b3 MindLoop', url: BASE_URL },
};

export const codeCompilerSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Online Code Compiler & Playground',
  url: `${BASE_URL}/compiler`,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'All Web Browsers',
  description:
    'Free online multi-language code compiler and runner. Execute Python 3, JavaScript (Node.js), Java, C, C++, and PHP directly in your browser with sandboxed isolation, interactive stdin, and distraction-free fullscreen IDE mode.',
  featureList: [
    'Multi-language support: Python 3, JavaScript (Node.js), Java (OpenJDK 21), C (GCC 13/14), C++ (G++ 14), and PHP (PHP 8.3)',
    'High-speed sandboxed code execution with real stdout and stderr isolation',
    'Interactive standard input (stdin) support for terminal prompt simulation',
    'Distraction-free Fullscreen IDE Mode with Esc keyboard shortcut',
    'Keyboard hotkeys: Ctrl+Enter (Run code), Tab (smart 2-space indentation), Esc (Exit fullscreen)',
    'Execution runtime tracking in milliseconds with exit code badges',
    'One-click code reset, file upload (.py, .js, .java, .c, .cpp, .php), and terminal copy',
    'Zero installation and no account registration required',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'C\u00b3 MindLoop', url: BASE_URL },
};

export const codeCompilerFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Which programming languages can I compile and run online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'C³ MindLoop Online Code Compiler supports Python 3, JavaScript (Node.js), Java (OpenJDK 21), C (GCC), C++ (G++), and PHP (PHP 8.3). Each language includes sample boilerplate code to help you get started immediately.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the interactive Standard Input (stdin) feature work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Click the "stdin" button in the compiler toolbar to expand the input panel. Any text provided in this box is automatically streamed to your program when reading from input (such as input() in Python, scanf() in C, Scanner in Java, or fgets(STDIN) in PHP).',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I enter and exit Full Screen IDE mode?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Click the "Full Screen" button in the upper right toolbar to expand the editor and terminal across your entire display. You can quickly exit full screen at any time by pressing the Escape (Esc) key or clicking the Exit button.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a keyboard shortcut to run code quickly?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Press Ctrl+Enter on Windows/Linux or Cmd+Enter on macOS inside the code editor to compile and execute your code immediately without clicking the Run button.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is code execution safe and isolated?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. All programs execute inside an isolated sandbox environment with execution timeouts and automatic temporary directory cleanup. System process spawning and unauthorized access are strictly restricted.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to install any compilers or pay for an API key?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The C³ MindLoop compiler is 100% free with no login, no third-party API keys, and no local compilers required. Everything runs seamlessly in the browser.',
      },
    },
  ],
};

export const toolsCollectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Free Developer Utilities - C³ MindLoop',
  description: 'Browse all C³ MindLoop free developer tools: JSON Formatter, Base64 Encoder, JWT Decoder and more. 100% client-side, no login, no data collection.',
  url: `${BASE_URL}/tools`,
  mainEntity: {
    '@type': 'ItemList',
    name: 'Developer Utilities & Tools',
    numberOfItems: 24,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'JSON Formatter & Validator', url: `${BASE_URL}/tools/json-formatter` },
      { '@type': 'ListItem', position: 2, name: 'Base64 Encoder & Decoder', url: `${BASE_URL}/tools/base64-encoder` },
      { '@type': 'ListItem', position: 3, name: 'JWT Inspector & Token Debugger', url: `${BASE_URL}/tools/jwt-inspector` },
      { '@type': 'ListItem', position: 4, name: 'Cryptographic Hash Generator', url: `${BASE_URL}/tools/hash-generator` },
      { '@type': 'ListItem', position: 5, name: 'Password & Shuffle Generator', url: `${BASE_URL}/tools/password-shuffle-generator` },
      { '@type': 'ListItem', position: 6, name: 'cURL to Code Converter', url: `${BASE_URL}/tools/curl-converter` },
      { '@type': 'ListItem', position: 7, name: 'Regex Matcher & Syntax Tester', url: `${BASE_URL}/tools/regex-tester` },
      { '@type': 'ListItem', position: 8, name: 'RegEx Railroad Diagram Generator', url: `${BASE_URL}/tools/regex-railroad-generator` },
      { '@type': 'ListItem', position: 9, name: 'Cron Expression Visualizer & Generator', url: `${BASE_URL}/tools/cron-visualizer` },
      { '@type': 'ListItem', position: 10, name: 'SQL & cURL to JSON Converter', url: `${BASE_URL}/tools/sql-to-json` },
      { '@type': 'ListItem', position: 11, name: 'ATS Resume Generator', url: `${BASE_URL}/tools/ats-resume-generator` },
      { '@type': 'ListItem', position: 12, name: 'PDF Suite (Compress, Merge & Split)', url: `${BASE_URL}/tools/pdf-suite` },
      { '@type': 'ListItem', position: 13, name: 'Edit PDF', url: `${BASE_URL}/tools/edit-pdf` },
      { '@type': 'ListItem', position: 14, name: 'AI Prompt Context Builder', url: `${BASE_URL}/tools/ai-prompt-builder` },
      { '@type': 'ListItem', position: 15, name: 'Diff Checker', url: `${BASE_URL}/tools/diff-checker` },
      { '@type': 'ListItem', position: 16, name: 'JSON Graph Visualizer', url: `${BASE_URL}/tools/json-graph` },
      { '@type': 'ListItem', position: 17, name: 'Code Complexity Analyzer', url: `${BASE_URL}/tools/code-complexity-analyzer` },
      { '@type': 'ListItem', position: 18, name: 'Tool Pipeline Builder', url: `${BASE_URL}/tools/pipeline` },
      { '@type': 'ListItem', position: 19, name: 'Node.js Event Loop Visualizer', url: `${BASE_URL}/tools/node-event-loop-visualizer` },
      { '@type': 'ListItem', position: 20, name: 'JavaScript Event Loop Visualizer', url: `${BASE_URL}/tools/js-event-loop-visualizer` },
      { '@type': 'ListItem', position: 21, name: 'Git Interactive DAG Visualizer', url: `${BASE_URL}/tools/git-visualizer` },
      { '@type': 'ListItem', position: 22, name: 'QR Code Generator', url: `${BASE_URL}/tools/qr-code-generator` },
      { '@type': 'ListItem', position: 23, name: 'Office Editor VS Code Extension', url: `${BASE_URL}/tools/office-editor` },
      { '@type': 'ListItem', position: 24, name: 'Online Code Compiler & Runner', url: `${BASE_URL}/compiler` },
    ],
  },
};



