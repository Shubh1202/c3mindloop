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
    ],
  },

  home: {
    title: 'Free Browser-Based Local Developer Utilities',
    description:
      'C³ MindLoop offers free, 100% client-side developer tools - JSON formatter, JWT decoder, Base64 encoder and more. No ads, no data collection, no backend.',
    keywords: [
      'free developer tools online', 'browser based developer tools', 'client side developer utilities',
      'offline dev tools no backend', 'private developer tools no tracking', 'local developer tools',
      'json formatter free', 'jwt decoder free', 'base64 encoder free',
      'developer utility platform', 'open source dev tools', 'best free developer tools 2025',
      'developer tools no login', 'instant developer tools', 'fast developer utilities',
      'C3 MindLoop', 'CCube', 'ccube.dev', 'c3mindloop tools',
    ],
    canonical: BASE_URL,
    openGraph: {
      title: 'C³ MindLoop | Free Browser-Based Local Developer Utilities',
      description:
        'Free, 100% client-side developer tools. Format JSON, decode JWTs, convert Base64 - all in your browser with zero data tracking.',
      url: BASE_URL,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'C³ MindLoop - Free Developer Tools' }],
    },
    twitter: {
      title: 'C³ MindLoop | Free Browser-Based Local Developer Utilities',
      description:
        'Free, 100% client-side developer tools. Format JSON, decode JWTs, convert Base64 - zero data tracking.',
      images: [defaultOgImage],
    },
  },

  jsonFormatter: {
    title: 'JSON Formatter & Validator - Free Online Tool | 100% Private Client-Side',
    description:
      'Free online JSON formatter, validator, beautifier and minifier. 100% Private & Client-Side with zero server upload. Format, validate, and inspect JSON as an interactive tree.',
    keywords: [
      // High-volume primary
      'json formatter', 'json formatter online', 'json beautifier', 'json validator',
      'json minifier', 'json viewer', 'json parser online', 'format json online',
      // High-intent Tier-1 CPC
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant', 'Free Online Utility',
      // Long-tail
      'free json formatter online', 'json formatter and validator', 'json beautifier online free',
      'json pretty print online', 'json lint online', 'json format checker',
      'online json editor', 'json tree viewer', 'json to tree view',
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
      title: 'JSON Formatter & Validator - Free Online Tool | C³ MindLoop',
      description:
        'Free online JSON formatter, validator and beautifier. 100% Private & Client-Side with zero server upload. Format, validate, minify or view JSON as tree.',
      url: `${BASE_URL}/tools/json-formatter`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'JSON Formatter Tool - C³ MindLoop' }],
    },
    twitter: {
      title: 'JSON Formatter & Validator - Free | C³ MindLoop',
      description:
        'Free online JSON formatter and validator. 100% Private & Client-Side, zero server upload.',
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
    title: 'Regex Tester & Debugger - Free Online Tool | 100% Private Client-Side',
    description:
      'Free online Regular Expression tester with live match highlighting, flags, capture groups, and cheatsheet. 100% Private client-side parsing with zero server upload.',
    keywords: [
      'regex tester', 'regular expression debugger', 'client-side regex',
      'regex matcher', 'regex pattern tester', 'online regex tool',
      '100% Private', 'Client-Side Execution', 'No Server Upload', 'GDPR Compliant', 'Free Online Utility'
    ],
    canonical: `${BASE_URL}/tools/regex-tester`,
    openGraph: {
      title: 'Regex Tester & Debugger - Free Online Tool | C³ MindLoop',
      description:
        'Test Regular Expressions with live match highlights and capture groups. 100% Private & Client-Side.',
      url: `${BASE_URL}/tools/regex-tester`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Regex Tester Tool - C³ MindLoop' }],
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
  description: 'Free local-first developer tools: JSON formatter, JWT decoder, Base64 encoder - all 100% client-side.',
  featureList: [
    'JSON Formatter and Validator',
    'JWT Decoder and Inspector',
    'Base64 Encoder and Decoder',
    '100% client-side processing',
    'Zero data transmission',
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
  name: 'JSON Formatter, Validator & Beautifier',
  url: `${BASE_URL}/tools/json-formatter`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  description:
    'Free online JSON formatter, validator, beautifier and minifier. 100% Private, Client-Side Execution, GDPR Compliant with zero server upload.',
  featureList: [
    'Client-side JSON formatting and beautifying',
    'JSON validation with error location',
    'Interactive collapsible tree view',
    'JSON minification',
    'Zero server upload - fully private',
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
  name: 'Regex Tester & Visual Debugger',
  url: `${BASE_URL}/tools/regex-tester`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  description:
    'Free online Regular Expression tester with live match highlighting, flags, capture groups, and cheatsheet. 100% Private, Client-Side Execution, GDPR Compliant.',
  featureList: [
    'Real-time regex pattern matching',
    'Global, case-insensitive, multiline flag toggles',
    'Capture group extraction and match index breakdown',
    'Built-in regex cheatsheet presets',
    '100% client-side execution - zero data logging'
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
