'use client';

import React, { useEffect } from 'react';
import { defaultSEO, SEOProps } from '../../lib/seo';

/**
 * SEOHead - No-op stub.
 * In Next.js App Router, metadata, canonicals, OpenGraph, and JSON-LD
 * are handled exclusively by Server Components via the Metadata API
 * and server-rendered <script type="application/ld+json"> tags.
 * Imperative client-side DOM mutation in useEffect is deprecated
 * to prevent hydration mismatches and title/canonical flapping.
 */
export const SEOHead: React.FC<SEOProps> = () => {
  return null;
};
