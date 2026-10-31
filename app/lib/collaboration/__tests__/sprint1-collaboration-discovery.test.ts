import { COLLABORATIVE_TOOL_IDS, isCollaborativeTool } from '../constants';
import { PRODUCTS_LIST } from '@/app/lib/constants';
import { parseCollabHash, buildCollabHash } from '../crypto';

describe('Sprint 1: Collaboration Discovery & Tool Mapping Verification', () => {
  it('strictly registers exactly the five verified collaboration-enabled tools', () => {
    const expectedTools = [
      'json-formatter',
      'diff-checker',
      'regex-tester',
      'curl-converter',
      'jwt-inspector',
    ];

    expect(COLLABORATIVE_TOOL_IDS).toHaveLength(5);
    expect([...COLLABORATIVE_TOOL_IDS].sort()).toEqual(expectedTools.sort());
  });

  it('correctly evaluates isCollaborativeTool for all products in PRODUCTS_LIST', () => {
    // Exactly 5 should return true
    const collaborativeFromProducts = PRODUCTS_LIST.filter((p) => isCollaborativeTool(p.id));
    expect(collaborativeFromProducts).toHaveLength(5);

    const ids = collaborativeFromProducts.map((p) => p.id);
    expect(ids).toContain('json-formatter');
    expect(ids).toContain('diff-checker');
    expect(ids).toContain('regex-tester');
    expect(ids).toContain('curl-converter');
    expect(ids).toContain('jwt-inspector');

    // Single-player tools must strictly return false
    expect(isCollaborativeTool('base64-encoder')).toBe(false);
    expect(isCollaborativeTool('cron-visualizer')).toBe(false);
    expect(isCollaborativeTool('hash-generator')).toBe(false);
    expect(isCollaborativeTool('password-shuffle-generator')).toBe(false);
    expect(isCollaborativeTool('ats-resume-generator')).toBe(false);
    expect(isCollaborativeTool('pdf-suite')).toBe(false);
    expect(isCollaborativeTool('edit-pdf')).toBe(false);
    expect(isCollaborativeTool('ai-prompt-builder')).toBe(false);
    expect(isCollaborativeTool('json-graph')).toBe(false);
    expect(isCollaborativeTool('code-complexity-analyzer')).toBe(false);
    expect(isCollaborativeTool('pipeline')).toBe(false);
    expect(isCollaborativeTool('node-event-loop-visualizer')).toBe(false);
    expect(isCollaborativeTool('js-event-loop-visualizer')).toBe(false);
    expect(isCollaborativeTool('git-visualizer')).toBe(false);
    expect(isCollaborativeTool('qr-code-generator')).toBe(false);
    expect(isCollaborativeTool('workflow-builder')).toBe(false);
  });

  it('formats and parses collaboration hash fragments correctly (RFC 3986)', () => {
    const creds = { roomId: 'c3m-abc12345', password: 'pwd-secret9876' };
    const hash = buildCollabHash(creds);

    expect(hash).toBe('#collab=c3m-abc12345&pwd=pwd-secret9876');

    const parsed = parseCollabHash(hash);
    expect(parsed).toEqual(creds);

    // Invalid or missing hash handling
    expect(parseCollabHash('')).toBeNull();
    expect(parseCollabHash('#')).toBeNull();
    expect(parseCollabHash('#other=123')).toBeNull();
  });
});
