import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppClientShell } from '../components/layout/AppClientShell';
import { seoConfig, organizationSchema, websiteSchema } from '../config/seo.config';

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
    default: 'C³ MindLoop — Coding. Crashing. Crying.',
    template: cfg.titleTemplate,
  },
  description: cfg.description,
  keywords: cfg.keywords,
  authors: [{ name: 'C³ MindLoop Team' }],
  creator: cfg.siteName,
  publisher: cfg.siteName,
  icons: { icon: '/favicon.ico' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: cfg.baseUrl,
    siteName: cfg.siteName,
    title: 'C³ MindLoop — Coding. Crashing. Crying.',
    description: cfg.description,
    images: [{ url: cfg.defaultOgImage, width: 1200, height: 630, alt: 'C³ MindLoop Developer Tools Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: cfg.twitterHandle,
    title: 'C³ MindLoop — Coding. Crashing. Crying.',
    description: cfg.description,
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
      </head>
      <body className="bg-neutral-950 text-neutral-100 antialiased min-h-screen">
        <AppClientShell>{children}</AppClientShell>
      </body>
    </html>
  );
}
