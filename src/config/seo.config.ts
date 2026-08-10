export const BASE_URL = 'https://c3mindloop.dev';

const defaultOgImage = `${BASE_URL}/og-image.png`;

export const seoConfig = {
  default: {
    siteName: 'C³ MindLoop',
    titleTemplate: '%s | C³ MindLoop',
    baseUrl: BASE_URL,
    twitterHandle: '@c3mindloop',
    defaultOgImage,
    description:
      'Practical, reality-first developer utility platform and open-source project space. Pure client-side browser tools and authentic software projects.',
    keywords: [
      'C3 MindLoop',
      'Developer Tools',
      'JSON Formatter',
      'Browser Utilities',
      'Open Source Software',
      'VS Code Extensions',
      'Client-Side Tools',
    ],
  },

  home: {
    title: 'Developer Utility Platform & Engineering Resources',
    description:
      'A practical developer-first platform offering fast, privacy-focused browser utilities, developer tools, and real-world engineering resources. Coding. Crashing. Crying.',
    keywords: [
      'Developer Utility Platform',
      'Browser Developer Tools',
      'Privacy-First Tools',
      'Open Source Developer Resources',
      'Client-Side Utilities',
      'Engineering Resources',
    ],
    canonical: BASE_URL,
    openGraph: {
      title: 'Developer Utility Platform & Engineering Resources | C³ MindLoop',
      description:
        'A practical developer-first platform offering fast, privacy-focused browser utilities, developer tools, and real-world engineering resources.',
      url: BASE_URL,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'C³ MindLoop Developer Tools Platform' }],
    },
    twitter: {
      title: 'Developer Utility Platform & Engineering Resources | C³ MindLoop',
      description:
        'A practical developer-first platform offering fast, privacy-focused browser utilities, developer tools, and real-world engineering resources.',
      images: [defaultOgImage],
    },
  },

  jsonFormatter: {
    title: 'JSON Formatter & Validator — Privacy-First Browser Tool',
    description:
      'Free, ultra-fast client-side JSON formatter, validator, minifier, and interactive tree viewer. 100% browser-based with zero server retention.',
    keywords: [
      'JSON Formatter Online',
      'JSON Validator',
      'Format JSON Client-Side',
      'Privacy First JSON Parser',
      'JSON Tree Viewer',
      'JSON Minifier',
      'Browser JSON Tool',
      'Free JSON Formatter',
    ],
    canonical: `${BASE_URL}/tools/json-formatter`,
    openGraph: {
      title: 'JSON Formatter & Validator — Privacy-First Browser Tool | C³ MindLoop',
      description:
        'Free, ultra-fast client-side JSON formatter, validator, minifier, and interactive tree viewer. 100% browser-based with zero server retention.',
      url: `${BASE_URL}/tools/json-formatter`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'JSON Formatter Tool — C³ MindLoop' }],
    },
    twitter: {
      title: 'JSON Formatter & Validator — Privacy-First Browser Tool | C³ MindLoop',
      description:
        'Free, ultra-fast client-side JSON formatter, validator, minifier, and interactive tree viewer. 100% browser-based with zero server retention.',
      images: [defaultOgImage],
    },
  },

  base64Encoder: {
    title: 'Base64 Encoder & Decoder — Privacy-First Browser Tool',
    description:
      'Free client-side Base64 encoder and decoder. Encode UTF-8 text, decode Base64 strings, generate file Data URIs, and use URL-safe encoding — all in your browser.',
    keywords: [
      'Base64 Encoder Online',
      'Base64 Decoder',
      'Encode Base64 String',
      'Decode Base64 Text',
      'URL Safe Base64',
      'File to Base64 Data URI',
      'Client-Side Base64 Tool',
      'Free Base64 Converter',
      'Base64 UTF-8 Encoder',
    ],
    canonical: `${BASE_URL}/tools/base64-encoder`,
    openGraph: {
      title: 'Base64 Encoder & Decoder — Privacy-First Browser Tool | C³ MindLoop',
      description:
        'Free client-side Base64 encoder and decoder. Encode UTF-8 text, decode Base64 strings, generate file Data URIs, and use URL-safe encoding — all in your browser.',
      url: `${BASE_URL}/tools/base64-encoder`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Base64 Encoder Tool — C³ MindLoop' }],
    },
    twitter: {
      title: 'Base64 Encoder & Decoder — Privacy-First Browser Tool | C³ MindLoop',
      description:
        'Free client-side Base64 encoder and decoder. Encode text, decode Base64, and generate file Data URIs instantly in your browser.',
      images: [defaultOgImage],
    },
  },

  jwtInspector: {
    title: 'JWT Inspector & Token Decoder — Privacy-First Browser Tool',
    description:
      'Free client-side JWT decoder and inspector. Decode JWT headers, payloads, and verify expiration instantly in your browser. Zero server transmission.',
    keywords: [
      'JWT Decoder Online',
      'JWT Inspector',
      'Decode JWT Token',
      'JSON Web Token Debugger',
      'JWT Payload Viewer',
      'JWT Header Decoder',
      'Client-Side JWT Tool',
      'Free JWT Inspector',
      'JWT Expiry Checker',
    ],
    canonical: `${BASE_URL}/tools/jwt-inspector`,
    openGraph: {
      title: 'JWT Inspector & Token Decoder — Privacy-First Browser Tool | C³ MindLoop',
      description:
        'Free client-side JWT decoder and inspector. Decode JWT headers, payloads, and verify expiration instantly in your browser. Zero server transmission.',
      url: `${BASE_URL}/tools/jwt-inspector`,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'JWT Inspector Tool — C³ MindLoop' }],
    },
    twitter: {
      title: 'JWT Inspector & Token Decoder — Privacy-First Browser Tool | C³ MindLoop',
      description:
        'Free client-side JWT decoder and inspector. Decode JWT headers, payloads, and verify expiration instantly in your browser.',
      images: [defaultOgImage],
    },
  },
} as const;

// ── JSON-LD Schemas ──────────────────────────────────────────────────────────

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'C³ MindLoop',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.svg`,
  slogan: 'Coding. Crashing. Crying.',
  description: 'Practical, reality-first developer utility platform and open-source project space.',
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
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${BASE_URL}/blog?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export const base64EncoderSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Base64 Encoder & Decoder',
  url: `${BASE_URL}/tools/base64-encoder`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All Web Browsers',
  description:
    'Free client-side Base64 encoder and decoder. Encode UTF-8 text, decode Base64 strings, generate file Data URIs, and use URL-safe encoding — all in your browser.',
  featureList: [
    'UTF-8 text to Base64 encoding via btoa/TextEncoder',
    'Base64 to UTF-8 text decoding via atob/TextDecoder',
    'URL-safe Base64 variant (RFC 4648)',
    'File to Base64 Data URI generator',
    'Zero data transmission — fully private',
  ],
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  publisher: {
    '@type': 'Organization',
    name: 'C³ MindLoop',
    url: BASE_URL,
  },
};

export const jwtInspectorSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'JWT Inspector & Token Decoder',
  url: `${BASE_URL}/tools/jwt-inspector`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All Web Browsers',
  description:
    'Free client-side JWT decoder and inspector. Decode JWT headers, payloads, and verify expiration instantly in your browser. Zero server transmission.',
  featureList: [
    'Client-side JWT decoding via atob/TextDecoder',
    'Header & Payload JSON syntax highlighting',
    'Token expiration live validation badge',
    'Issued-at and expiry timestamp display',
    'Zero data transmission — fully private',
  ],
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  publisher: {
    '@type': 'Organization',
    name: 'C³ MindLoop',
    url: BASE_URL,
  },
};

export const jsonFormatterSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'JSON Formatter & Validator',
  url: `${BASE_URL}/tools/json-formatter`,
  applicationCategory: 'WebApplication',
  operatingSystem: 'All Web Browsers',
  description:
    'Free, ultra-fast client-side JSON formatter, validator, minifier, and interactive tree viewer. 100% browser-based with zero server retention.',
  featureList: [
    'Client-side JSON formatting',
    'JSON validation with error location',
    'Interactive collapsible tree view',
    'JSON minification',
    'Zero data transmission — fully private',
  ],
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  publisher: {
    '@type': 'Organization',
    name: 'C³ MindLoop',
    url: BASE_URL,
  },
};
