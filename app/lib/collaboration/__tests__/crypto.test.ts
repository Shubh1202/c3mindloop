import {
  generateSecureId,
  generateRoomPassword,
  generateAnonymousDeveloperName,
  parseCollabHash,
  buildCollabHash,
} from '../crypto';

describe('Collaboration Crypto & Hash Helpers', () => {
  it('generates secure room IDs with given prefix and length', () => {
    const id = generateSecureId('c3m', 8);
    expect(id.startsWith('c3m-')).toBe(true);
    expect(id.length).toBeGreaterThan(10);
  });

  it('generates unique room passwords', () => {
    const pwd1 = generateRoomPassword();
    const pwd2 = generateRoomPassword();
    expect(pwd1).not.toEqual(pwd2);
    expect(pwd1.startsWith('pwd-')).toBe(true);
  });

  it('generates friendly anonymous developer pseudonyms with colors', () => {
    const profile = generateAnonymousDeveloperName();
    expect(profile.name).toMatch(/^[A-Za-z]+ [A-Za-z]+$/);
    expect(profile.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('serializes and parses collaboration hash correctly', () => {
    const creds = { roomId: 'c3m-test1234', password: 'pwd-secret5678' };
    const hash = buildCollabHash(creds);
    expect(hash).toBe('#collab=c3m-test1234&pwd=pwd-secret5678');

    const parsed = parseCollabHash(hash);
    expect(parsed).toEqual(creds);
  });

  it('handles hashes without password', () => {
    const creds = { roomId: 'c3m-test9999' };
    const hash = buildCollabHash(creds);
    expect(hash).toBe('#collab=c3m-test9999');

    const parsed = parseCollabHash(hash);
    expect(parsed).toEqual({ roomId: 'c3m-test9999', password: undefined });
  });

  it('returns null on empty or invalid hashes', () => {
    expect(parseCollabHash('')).toBeNull();
    expect(parseCollabHash('#')).toBeNull();
    expect(parseCollabHash('#invalid=true')).toBeNull();
  });
});
