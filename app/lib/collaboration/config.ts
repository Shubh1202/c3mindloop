/**
 * Collaboration Configuration & Constants for C³ MindLoop
 * Configurable signaling endpoints, STUN servers, quotas, and pseudonym dictionaries.
 */

export const DEFAULT_SIGNALING_SERVERS: string[] = [
  'wss://y-webrtc-eu.fly.dev',
  'wss://y-webrtc.fly.dev',
];

export const DEFAULT_STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' },
];

/**
 * Maximum document payload limit (5 MB).
 * Guardrail preventing memory-exhaustion DoS attacks from untrusted peers.
 */
export const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024;

export const DEVELOPER_ADJECTIVES = [
  'Async',
  'Atomic',
  'Bytecode',
  'Cached',
  'Concurrent',
  'Curried',
  'Decentralized',
  'Diffing',
  'Encrypted',
  'Functional',
  'Idempotent',
  'Immutable',
  'Monadic',
  'Reactive',
  'Recursive',
  'Restful',
  'Rustacean',
  'Stateless',
  'TypeSafe',
  'ZeroCost',
] as const;

export const DEVELOPER_NOUNS = [
  'Falcon',
  'Otter',
  'Panda',
  'Fox',
  'Koala',
  'Badger',
  'Lynx',
  'Gecko',
  'Beaver',
  'Dolphin',
  'Osprey',
  'Cheetah',
  'Lemur',
  'Octopus',
  'Raven',
  'Hedgehog',
  'Mantis',
] as const;

export const AVATAR_PALETTE = [
  '#1D9BF0', // Twitter / MindLoop Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#6366F1', // Indigo
  '#14B8A6', // Teal
] as const;
