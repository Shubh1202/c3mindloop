/**
 * Authoritative registry of verified collaboration-enabled tools in C³ MindLoop.
 * Exactly these five tools have real-time Yjs CRDT + WebRTC synchronization implemented.
 */

export const COLLABORATIVE_TOOL_IDS = [
  'json-formatter',
  'diff-checker',
  'regex-tester',
  'curl-converter',
  'jwt-inspector',
] as const;

export type CollaborativeToolId = (typeof COLLABORATIVE_TOOL_IDS)[number];

/**
 * Checks whether a tool supports real-time peer-to-peer collaboration.
 */
export function isCollaborativeTool(toolId: string): boolean {
  return (COLLABORATIVE_TOOL_IDS as readonly string[]).includes(toolId);
}
