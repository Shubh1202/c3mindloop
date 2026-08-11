import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppClientShell } from './components/layout/AppClientShell';
import { seoConfig, organizationSchema, websiteSchema, webApplicationSchema } from './config/seo.config';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0e0e0e' },
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
  ],
  width: 'device-width',
  initialScale: 1,
};

const { default: cfg } = seoConfig;

export const metadata: Metadata = {
  metadataBase: new URL(cfg.baseUrl),
  title: {
    default: 'C³ MindLoop | Free Browser-Based Local Developer Utilities',
    template: cfg.titleTemplate,
  },
  description: cfg.description,
  keywords: [
    // Brand + phonetic variations
    'C3 MindLoop', 'C³ MindLoop', 'CCube', 'ccube.dev', 'c cube', 'c qube',
    'C Cube', 'C Qube', 'mindloop', 'c3mindloop', 'c-cube dev tools',
    // Core tools
    'json formatter', 'json validator', 'json beautifier', 'json minifier', 'json viewer',
    'jwt decoder', 'jwt inspector', 'json web token decoder',
    'base64 encoder', 'base64 decoder', 'base64 converter',
    // Value proposition
    'free developer tools online', 'browser based developer tools',
    'client side developer utilities', 'offline developer tools',
    'private developer tools no tracking', 'local developer tools no backend',
    'developer tools no login', 'zero data collection dev tools',
    // Long-tail
    'free json formatter online', 'free jwt decoder online', 'free base64 encoder online',
    'client side json parser', 'browser json formatter', 'online json editor free',
    'json formatter no login', 'jwt decoder no server', 'base64 encoder offline',
    // Competitor alternatives
    'jsonlint alternative', 'jwt.io alternative', 'base64encode.org alternative',
    'json crack alternative', 'jsonformatter.org alternative',
  ],
  authors: [{ name: 'C³ MindLoop' }],
  creator: cfg.siteName,
  publisher: cfg.siteName,
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/logo-cube.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: cfg.baseUrl,
    siteName: cfg.siteName,
    title: 'C³ MindLoop | Free Browser-Based Local Developer Utilities',
    description: 'Free, 100% client-side developer tools. Format JSON, decode JWTs, convert Base64 - no ads, no backend, no data collection.',
    images: [{ url: cfg.defaultOgImage, width: 1200, height: 630, alt: 'C³ MindLoop - Free Developer Tools' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: cfg.twitterHandle,
    title: 'C³ MindLoop | Free Browser-Based Developer Utilities',
    description: '100% client-side JSON formatter, JWT decoder, Base64 encoder and more. Zero data tracking.',
    images: [cfg.defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: cfg.baseUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`} suppressHydrationWarning={true}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
        />
      </head>
      <body className="bg-neutral-950 text-neutral-100 antialiased min-h-screen">
        <AppClientShell>{children}</AppClientShell>
      </body>
    </html>
  );
}
