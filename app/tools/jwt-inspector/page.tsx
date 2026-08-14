import type { Metadata } from 'next';
import { JwtInspectorPage } from '@/app/views/JwtInspectorPage';
import { seoConfig, jwtInspectorSchema } from './../../config/seo.config';

const { jwtInspector } = seoConfig;

const jwtFaqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is it safe to paste production JWT tokens into this decoder?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, absolutely. Unlike cloud-hosted utilities, C³ MindLoop decodes tokens using native browser atob and TextDecoder APIs completely offline. Your sensitive authorization credentials, signatures, and private claims are never transmitted to any external server.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does this tool verify the signature of my JWT?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The decoder structures and translates Header and Payload properties locally. For signature verification, you can input your HMAC/RSA secret key directly into the local browser sandbox using native Web Crypto APIs.',
      },
    },
    {
      '@type': 'Question',
      name: "Why is my decoded JWT showing 'Token Expired'?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'JSON Web Tokens contain an \'exp\' (Expiration Time) epoch claim. Our inspector automatically reads this timestamp and evaluates it against your current system time to alert you if the authorization window has closed.',
      },
    },
    {
      '@type': 'Question',
      name: 'What algorithms are supported for JWT parsing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'This tool supports structural decoding for all standard JWT and JWS algorithms, including HMAC (HS256, HS384, HS512) and RSA/ECDSA (RS256, RS512, ES256) token payload structures.',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'JWT Inspector & Token Decoder - Free Online Tool | 100% Private Client-Side',
  description: 'Free, 100% private client-side JWT Decoder and Token Inspector. Decode your authorization bearer tokens, inspect payload user claims, and validate expiration times locally in your browser.',
  keywords: [...jwtInspector.keywords],
  alternates: { canonical: jwtInspector.canonical },
  openGraph: {
    ...jwtInspector.openGraph,
    title: 'JWT Inspector & Token Decoder - Free Online Tool | 100% Private Client-Side',
    description: 'Free, 100% private client-side JWT Decoder and Token Inspector. Decode your authorization bearer tokens, inspect payload user claims, and validate expiration times locally in your browser.',
  },
  twitter: {
    card: 'summary_large_image',
    ...jwtInspector.twitter,
    title: 'JWT Inspector & Token Decoder - Free Online Tool | 100% Private Client-Side',
    description: 'Free, 100% private client-side JWT Decoder and Token Inspector. Decode your authorization bearer tokens, inspect payload user claims, and validate expiration times locally in your browser.',
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jwtInspectorSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jwtFaqPageSchema) }}
      />
      <JwtInspectorPage />
    </>
  );
}
