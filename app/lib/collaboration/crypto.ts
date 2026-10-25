/**
 * Cryptographic & URL utilities for C³ MindLoop Collaboration.
 * Handles secure room ID generation, password generation, hash encoding, and developer pseudonym creation.
 */

import { DEVELOPER_ADJECTIVES, DEVELOPER_NOUNS, AVATAR_PALETTE } from './config';
import { RoomCredentials } from './types';

/**
 * Generate a cryptographically secure random alphanumeric string.
 */
export function generateSecureId(prefix = 'c3m', byteLength = 12): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${prefix}-${hex}`;
  }
  // Fallback for environments lacking crypto.getRandomValues
  return `${prefix}-${Math.random().toString(36).substring(2, 14)}`;
}

/**
 * Generate a cryptographically strong room password / encryption secret.
 */
export function generateRoomPassword(): string {
  return generateSecureId('pwd', 16);
}

/**
 * Generates an anonymous, developer-themed pseudonym and avatar color.
 */
export function generateAnonymousDeveloperName(): { name: string; color: string } {
  const adjIndex = Math.floor(Math.random() * DEVELOPER_ADJECTIVES.length);
  const nounIndex = Math.floor(Math.random() * DEVELOPER_NOUNS.length);
  const colorIndex = Math.floor(Math.random() * AVATAR_PALETTE.length);

  return {
    name: `${DEVELOPER_ADJECTIVES[adjIndex]} ${DEVELOPER_NOUNS[nounIndex]}`,
    color: AVATAR_PALETTE[colorIndex],
  };
}

/**
 * Parses collaboration credentials from a URL hash string.
 * Example: #collab=c3m-a1b2c3d4&pwd=pwd-99887766
 * RFC 3986 compliance: The hash is never transmitted to servers or logged in access logs.
 */
export function parseCollabHash(hash: string): RoomCredentials | null {
  if (!hash) return null;
  const hashIndex = hash.indexOf('#');
  const cleanHash = hashIndex !== -1 ? hash.slice(hashIndex + 1) : hash;
  if (!cleanHash) return null;

  try {
    const params = new URLSearchParams(cleanHash);
    const roomId = params.get('collab');
    if (!roomId) return null;

    const password = params.get('pwd') || undefined;
    return { roomId, password };
  } catch {
    return null;
  }
}

/**
 * Serializes collaboration credentials into a URL hash fragment.
 */
export function buildCollabHash(credentials: RoomCredentials): string {
  const params = new URLSearchParams();
  params.set('collab', credentials.roomId);
  if (credentials.password) {
    params.set('pwd', credentials.password);
  }
  return `#${params.toString()}`;
}

/**
 * Safely removes the collaboration hash from the browser URL without causing a page reload.
 */
export function clearCollabHash(): void {
  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname + window.location.search;
  window.history.replaceState(null, '', currentPath);
}

/**
 * Builds the full shareable invitation URL including the hash.
 */
export function buildShareableUrl(credentials: RoomCredentials): string {
  if (typeof window === 'undefined') return '';
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  return `${baseUrl}${buildCollabHash(credentials)}`;
}
