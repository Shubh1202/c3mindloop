'use client';

import React, { useEffect } from 'react';
import { defaultSEO, SEOProps } from '../../lib/seo';

export const SEOHead: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  ogImage,
  extraSchema
}) => {
  const fullTitle = title ? `${title} | C³ MindLoop` : defaultSEO.title;
  const metaDesc = description || defaultSEO.description;
  const canonicalUrl = canonical ? `https://cmindloop.com${canonical}` : defaultSEO.url;

  useEffect(() => {
    document.title = fullTitle;

    // Set meta description
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', metaDesc);

    // Set canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Inject Extra JSON-LD Schema if provided
    if (extraSchema) {
      const scriptId = 'json-ld-extra';
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(extraSchema);
    }
  }, [fullTitle, metaDesc, canonicalUrl, extraSchema]);

  return null;
};
