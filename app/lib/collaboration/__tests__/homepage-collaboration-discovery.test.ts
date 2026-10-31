/**
 * Tests for Homepage Collaboration Discovery, CTAs, and Tool Capabilities
 */

import { PRODUCTS_LIST } from '@/app/lib/constants';
import { COLLABORATIVE_TOOL_IDS, isCollaborativeTool } from '../constants';
import enMessages from '@/app/messages/en.json';

describe('Homepage Collaboration Discovery & Product Communication', () => {
  describe('Hero Non-Negotiable Copy Integrity', () => {
    it('preserves exact kicker copy', () => {
      expect(enMessages.hero.kicker).toBe('C³ MINDLOOP • WHERE TECH MEETS TRUTH');
    });

    it('preserves exact status pill copy', () => {
      expect(enMessages.hero.pill).toBe('Coding. Crashing. Crying.');
    });

    it('defines the prominent live collaboration CTA copy', () => {
      expect(enMessages.hero.ctaCollab).toBe('Try Live Collaboration');
    });

    it('preserves secondary tools exploration CTA copy', () => {
      expect(enMessages.hero.ctaPrimary).toBe('Explore Developer Tools');
    });
  });

  describe('Collaborative Tool Description Accuracy in PRODUCTS_LIST', () => {
    it('accurately describes JSON Formatter synchronized capability', () => {
      const tool = PRODUCTS_LIST.find((p) => p.id === 'json-formatter');
      expect(tool).toBeDefined();
      expect(tool?.descKey).toContain('Live P2P sessions synchronize the shared JSON editor');
    });

    it('accurately describes Diff Checker synchronized vs local capability', () => {
      const tool = PRODUCTS_LIST.find((p) => p.id === 'diff-checker');
      expect(tool).toBeDefined();
      expect(tool?.descKey).toContain('synchronizes original text, modified text, and comparison options');
    });

    it('accurately describes Regex Tester synchronized flags & pattern', () => {
      const tool = PRODUCTS_LIST.find((p) => p.id === 'regex-tester');
      expect(tool).toBeDefined();
      expect(tool?.descKey).toContain('pattern, test string, and regex flags synchronize between peers');
    });

    it('accurately describes cURL Converter synchronized input and independent language targets', () => {
      const tool = PRODUCTS_LIST.find((p) => p.id === 'curl-converter');
      expect(tool).toBeDefined();
      expect(tool?.descKey).toContain('shared cURL command while keeping language targets local');
    });

    it('accurately describes JWT Inspector synchronized token and client-side privacy', () => {
      const tool = PRODUCTS_LIST.find((p) => p.id === 'jwt-inspector');
      expect(tool).toBeDefined();
      expect(tool?.descKey).toContain('synchronizes the shared token input with zero cloud storage');
    });

    it('strictly preserves single-player tool descriptions without claiming collaboration', () => {
      const singlePlayerIds = [
        'base64-encoder',
        'cron-visualizer',
        'hash-generator',
        'password-shuffle-generator',
        'ats-resume-generator',
        'pdf-suite',
        'edit-pdf',
        'ai-prompt-builder',
      ];

      for (const id of singlePlayerIds) {
        const tool = PRODUCTS_LIST.find((p) => p.id === id);
        expect(tool).toBeDefined();
        expect(isCollaborativeTool(id)).toBe(false);
        expect(tool?.descKey.toLowerCase()).not.toContain('live p2p');
        expect(tool?.descKey.toLowerCase()).not.toContain('live session');
        expect(tool?.descKey.toLowerCase()).not.toContain('synchronize between peers');
      }
    });
  });

  describe('Collaboration Routes and Workflows', () => {
    it('maps every collaborative tool to an active tool route', () => {
      const routeMap: Record<string, string> = {
        'json-formatter': '/tools/json-formatter',
        'diff-checker': '/tools/diff-checker',
        'regex-tester': '/tools/regex-tester',
        'curl-converter': '/tools/curl-converter',
        'jwt-inspector': '/tools/jwt-inspector',
      };

      for (const toolId of COLLABORATIVE_TOOL_IDS) {
        expect(routeMap[toolId]).toBeDefined();
        expect(routeMap[toolId]).toMatch(/^\/tools\//);
      }
    });
  });
});

