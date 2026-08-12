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
    title: 'JSON Formatter, Validator & Beautifier - Free Online Tool',
    description:
      'Free online JSON formatter, validator, beautifier and minifier. 100% client-side - paste JSON and instantly format, validate, minify or view as interactive tree. No data sent to server.',
    keywords: [
      // High-volume primary
      'json formatter', 'json formatter online', 'json beautifier', 'json validator',
      'json minifier', 'json viewer', 'json parser online', 'format json online',
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
      title: 'JSON Formatter, Validator & Beautifier - Free Online Tool | C³ MindLoop',
      description:
        'Free online JSON formatter, validator and beautifier. 100% client-side - format, validate, minify or view JSON as tree. No data sent to server.',
      url: `${BASE_URL}/tools/json-formatter`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'JSON Formatter Tool - C³ MindLoop' }],
    },
    twitter: {
      title: 'JSON Formatter, Validator & Beautifier - Free | C³ MindLoop',
      description:
        'Free online JSON formatter and validator. 100% client-side, no data sent to server.',
      images: [defaultOgImage],
    },
  },

  base64Encoder: {
    title: 'Base64 Encoder & Decoder - Free Online Tool',
    description:
      'Free online Base64 encoder and decoder. Encode text to Base64, decode Base64 strings, convert files to Data URI, URL-safe Base64 - all 100% client-side with zero data transmission.',
    keywords: [
      // High-volume primary
      'base64 encoder', 'base64 decoder', 'base64 encode online', 'base64 decode online',
      'base64 converter', 'encode base64', 'decode base64',
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
        'Free online Base64 encoder and decoder. Encode text, decode Base64, convert files to Data URI - 100% client-side, zero data transmission.',
      url: `${BASE_URL}/tools/base64-encoder`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Base64 Encoder Tool - C³ MindLoop' }],
    },
    twitter: {
      title: 'Base64 Encoder & Decoder - Free | C³ MindLoop',
      description:
        'Free online Base64 encoder and decoder. 100% client-side, no data sent to server.',
      images: [defaultOgImage],
    },
  },

  curlConverter: {
    title: 'cURL to Code Converter | Fetch, Axios, Python | C³ MindLoop',
    description:
      'Free online cURL to code converter. Convert cURL commands to JavaScript Fetch, Axios, Node.js, Python requests, Go, and PHP - 100% client-side, zero data transmission.',
    keywords: [
      'curl to code', 'curl converter', 'curl to javascript', 'curl to python',
      'curl to fetch', 'curl to axios', 'curl to node', 'curl to go',
      'curl to php', 'convert curl command', 'curl command converter online',
      'curl to requests python', 'curl to guzzle', 'curl snippet generator',
      'curl converter online free', 'curl to code snippet', 'api curl converter',
      'C³ MindLoop curl converter', 'ccube curl tool',
    ],
    canonical: `${BASE_URL}/tools/curl-converter`,
    openGraph: {
      title: 'cURL to Code Converter | Fetch, Axios, Python | C³ MindLoop',
      description:
        'Convert cURL commands to JavaScript Fetch, Axios, Python, Go, PHP - 100% client-side, zero data transmission.',
      url: `${BASE_URL}/tools/curl-converter`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'cURL Converter Tool - C³ MindLoop' }],
    },
    twitter: {
      title: 'cURL to Code Converter - Free | C³ MindLoop',
      description:
        'Convert cURL to Fetch, Axios, Python, Go, PHP - 100% client-side, no data sent to server.',
      images: [defaultOgImage],
    },
  },

  cronVisualizer: {
    title: 'Cron Expression Visualizer & Generator - Free Online Tool',
    description:
      'Free online Cron expression visualizer and generator. Parse 5-part and 6-part Cron strings, get human-readable descriptions, calculate next 5 execution times in local and UTC - 100% client-side, zero data transmission.',
    keywords: [
      'cron expression visualizer', 'cron generator online', 'cron parser', 'cron expression builder',
      'cron job scheduler', 'cron syntax checker', 'cron expression tester', 'cron next run calculator',
      'free cron visualizer', 'cron expression to human readable', 'cron schedule visualizer',
      'cron expression explainer', 'cron job builder online', 'cron expression validator',
      'cron expression examples', 'cron schedule generator', 'cron expression decoder',
      'C³ MindLoop cron tool', 'ccube cron visualizer',
    ],
    canonical: `${BASE_URL}/tools/cron-visualizer`,
    openGraph: {
      title: 'Cron Expression Visualizer & Generator - Free Online Tool | C³ MindLoop',
      description:
        'Parse Cron expressions, get human-readable descriptions, and calculate next 5 execution times. 100% client-side, zero data transmission.',
      url: `${BASE_URL}/tools/cron-visualizer`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Cron Visualizer Tool - C³ MindLoop' }],
    },
    twitter: {
      title: 'Cron Expression Visualizer & Generator - Free | C³ MindLoop',
      description:
        'Parse Cron strings, visualize schedules, calculate next runs - 100% client-side, no data sent to server.',
      images: [defaultOgImage],
    },
  },

  jwtInspector: {
    title: 'JWT Decoder & Inspector - Free Online Tool',
    description:
      'Free online JWT decoder and inspector. Decode JWT header, payload and signature, check token expiration, view claims - 100% client-side with zero server transmission. No token ever leaves your browser.',
    keywords: [
      // High-volume primary
      'jwt decoder', 'jwt decoder online', 'jwt inspector', 'decode jwt', 'jwt parser',
      'json web token decoder', 'jwt token decoder', 'jwt viewer',
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
        'Free online JWT decoder. Decode header, payload, check expiration - 100% client-side. Your token never leaves the browser.',
      url: `${BASE_URL}/tools/jwt-inspector`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'JWT Inspector Tool - C³ MindLoop' }],
    },
    twitter: {
      title: 'JWT Decoder & Inspector - Free | C³ MindLoop',
      description:
        'Free online JWT decoder. 100% client-side - your token never leaves the browser.',
    },
  },
  officeEditor: {
    title: 'Office Editor VS Code Extension - View & Edit Office Files',
    description:
      'View and edit Excel, Word, PowerPoint, and PDF files directly inside VS Code with Office Editor. Local, fast, secure, and offline-first.',
    keywords: [
      'Office Editor VS Code', 'VS Code Office Extension', 'view docx in vs code',
      'edit xlsx in vs code', 'VS Code excel viewer', 'VS Code pdf viewer',
      'office editor extension', 'c3mindloop office editor'
    ],
    canonical: `${BASE_URL}/tools/office-editor`,
    openGraph: {
      title: 'Office Editor VS Code Extension - View & Edit Office Files | C³ MindLoop',
      description:
        'View and edit Excel, Word, and PDF files directly inside VS Code. Local and private processing.',
      url: `${BASE_URL}/tools/office-editor`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Office Editor Extension - C³ MindLoop' }],
    },
    twitter: {
      title: 'Office Editor VS Code Extension | C³ MindLoop',
      description: 'View & edit Excel, Word, and PDF files inside VS Code.',
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
  operatingSystem: 'All Web Browsers',
  description:
    'Free online Base64 encoder and decoder. Encode text, decode Base64 strings, generate file Data URIs, URL-safe encoding - 100% client-side.',
  featureList: [
    'UTF-8 text to Base64 encoding',
    'Base64 to UTF-8 text decoding',
    'URL-safe Base64 variant (RFC 4648)',
    'File to Base64 Data URI generator',
    'Zero data transmission - fully private',
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
  operatingSystem: 'All Web Browsers',
  description:
    'Free online JWT decoder and inspector. Decode JWT headers, payloads, verify expiration - 100% client-side, zero server transmission.',
  featureList: [
    'Client-side JWT decoding',
    'Header and Payload JSON display',
    'Token expiration live validation',
    'Issued-at and expiry timestamp display',
    'Zero data transmission - token never leaves browser',
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
  operatingSystem: 'All Web Browsers',
  description:
    'Free online cURL to code converter. Convert cURL commands to JavaScript Fetch, Axios, Node.js, Python, Go, and PHP - 100% client-side.',
  featureList: [
    'cURL to JavaScript Fetch API',
    'cURL to Axios',
    'cURL to Node.js node-fetch',
    'cURL to Python requests',
    'cURL to Go net/http',
    'cURL to PHP cURL and Guzzle',
    'Zero data transmission - fully private',
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
  operatingSystem: 'All Web Browsers',
  description:
    'Free online Cron expression visualizer and generator. Parse 5-part and 6-part Cron strings, get human-readable descriptions, calculate next execution times - 100% client-side.',
  featureList: [
    '5-part and 6-part Cron expression parsing',
    'Human-readable schedule description',
    'Next 5 execution times in local and UTC',
    'Interactive visual Cron builder',
    'Quick preset expressions',
    'Zero data transmission - fully private',
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
  operatingSystem: 'All Web Browsers',
  description:
    'Free online JSON formatter, validator, beautifier and minifier. 100% client-side with zero server retention.',
  featureList: [
    'Client-side JSON formatting and beautifying',
    'JSON validation with error location',
    'Interactive collapsible tree view',
    'JSON minification',
    'Zero data transmission - fully private',
  ],
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
    'VS Code extension to view and edit Excel, Word, PowerPoint, and PDF files directly within your IDE. Local-first and fully offline.',
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
