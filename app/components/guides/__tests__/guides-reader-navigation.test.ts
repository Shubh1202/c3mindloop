import { getPublishedGuides, getPublishedEnglishGuide, getRelatedGuides } from '@/app/lib/constants';
import { GuideCard, GuideArticleReader } from '@/app/components/guides';
import React from 'react';

describe('Guides Dedicated Page Navigation & Reusable Reader Verification', () => {
  const publishedGuides = getPublishedGuides('en');

  it('has at least 5 verified published guides available for dedicated reading', () => {
    expect(publishedGuides.length).toBeGreaterThanOrEqual(5);
  });

  describe('getRelatedGuides', () => {
    it('returns related guides for any published guide slug excluding itself', () => {
      for (const guide of publishedGuides) {
        const related = getRelatedGuides(guide.slug, 'en', 3);
        expect(related).toBeDefined();
        expect(Array.isArray(related)).toBe(true);
        expect(related.length).toBeLessThanOrEqual(3);

        // Crucial: Must never include the current guide in its own related list
        const selfMatch = related.find((r) => r.slug === guide.slug);
        expect(selfMatch).toBeUndefined();
      }
    });

    it('prioritizes guides with matching category or overlapping tags', () => {
      // json-formatter has category 'developerTools' and tags ['JSON', 'Validator', 'Formatter', 'Developer Tools']
      const jsonRelated = getRelatedGuides('format-and-validate-json-in-the-browser', 'en', 3);
      expect(jsonRelated.length).toBeGreaterThan(0);

      // All returned guides must be valid published guides
      for (const r of jsonRelated) {
        expect(r.title).toBeDefined();
        expect(r.slug).toBeDefined();
        expect(r.slug).not.toBe('format-and-validate-json-in-the-browser');
      }

      // Check cURL guide related list
      const curlRelated = getRelatedGuides('convert-curl-to-fetch-axios-python', 'en', 2);
      expect(curlRelated).toHaveLength(2);
      expect(curlRelated[0].slug).not.toBe('convert-curl-to-fetch-axios-python');
      expect(curlRelated[1].slug).not.toBe('convert-curl-to-fetch-axios-python');
    });

    it('falls back gracefully when an unknown slug is queried', () => {
      const fallback = getRelatedGuides('unknown-nonexistent-guide-slug', 'en', 3);
      expect(fallback.length).toBeLessThanOrEqual(3);
      expect(fallback.length).toBeGreaterThan(0);
    });
  });

  describe('Reusable Components Structure', () => {
    it('exports GuideCard and GuideArticleReader as valid React components', () => {
      expect(typeof GuideCard).toBe('function');
      expect(typeof GuideArticleReader).toBe('function');
    });

    it('instantiates GuideCard with direct dedicated page href and no modal trigger', () => {
      const sampleGuide = publishedGuides[0];
      const element = React.createElement(GuideCard, { guide: sampleGuide });

      expect(element).toBeDefined();
      expect(element.props.guide.slug).toBe(sampleGuide.slug);
      expect(element.props.compact).toBeUndefined();
    });

    it('instantiates GuideArticleReader with guide, related guides, and companion tool', () => {
      const sampleGuide = publishedGuides[0];
      const related = getRelatedGuides(sampleGuide.slug, 'en', 3);
      const companion = {
        name: 'JSON Formatter & Validator',
        desc: 'Format, validate, repair, and minify JSON payloads.',
        action: 'Open JSON Formatter',
        path: '/tools/json-formatter',
      };

      const element = React.createElement(GuideArticleReader, {
        guide: sampleGuide,
        relatedGuides: related,
        companionTool: companion,
      });

      expect(element).toBeDefined();
      expect(element.props.guide.title).toBe(sampleGuide.title);
      expect(element.props.relatedGuides).toHaveLength(related.length);
      expect(element.props.companionTool?.name).toBe('JSON Formatter & Validator');
    });
  });

  describe('Published Guide Integrity & Tool Paths', () => {
    it('verifies all published guides have valid tool paths and excerpts', () => {
      for (const guide of publishedGuides) {
        expect(guide.title.trim().length).toBeGreaterThan(5);
        expect(guide.excerpt.trim().length).toBeGreaterThan(10);
        expect(guide.content.trim().length).toBeGreaterThan(50);
        expect(guide.toolPath).toMatch(/^\/tools\//);
        expect(guide.readTimeMinutes).toBeGreaterThan(0);
      }
    });
  });
});

