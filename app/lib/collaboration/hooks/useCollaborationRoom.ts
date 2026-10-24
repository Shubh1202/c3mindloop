'use client';

/**
 * useCollaborationRoom Hook for C³ MindLoop.
 * Manages the high-level room lifecycle, auto-join from URL hash, and session state.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { CollaborationRoomManager } from '../room-manager';
import {
  CollabRoomConfig,
  CollabSessionState,
  RoomCredentials,
} from '../types';
import {
  generateSecureId,
  generateRoomPassword,
  parseCollabHash,
  buildCollabHash,
  clearCollabHash,
  buildShareableUrl,
} from '../crypto';

export function useCollaborationRoom(config: CollabRoomConfig) {
  const managerRef = useRef<CollaborationRoomManager | null>(null);

  // Lazy-initialize manager instance
  if (!managerRef.current) {
    managerRef.current = new CollaborationRoomManager(config);
  }

  const [state, setState] = useState<CollabSessionState>(() => {
    const initialSelf = managerRef.current!.getSelfProfile();
    return {
      status: 'idle',
      roomId: null,
      isHost: false,
      peers: [initialSelf],
      selfProfile: initialSelf,
      peerCount: 1,
      webrtcPeerCount: 0,
      bcPeerCount: 0,
      isCollaborating: false,
      shareableUrl: null,
      error: null,
    };
  });

  // Keep state synchronized with manager events
  useEffect(() => {
    const manager = managerRef.current;
    if (!manager) return;

    const unsubscribe = manager.subscribe((event) => {
      const creds = manager.getCredentials();
      const isCollab = event.status === 'connected' || event.status === 'connecting';
      const shareUrl = creds ? buildShareableUrl(creds) : null;

      setState({
        status: event.status,
        roomId: creds?.roomId || null,
        isHost: event.isHost,
        peers: event.peers.length > 0 ? event.peers : [event.selfProfile],
        selfProfile: event.selfProfile,
        peerCount: Math.max(event.peers.length, 1),
        webrtcPeerCount: event.webrtcPeerCount,
        bcPeerCount: event.bcPeerCount,
        isCollaborating: isCollab,
        shareableUrl: shareUrl,
        error: event.error,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Start a new live session (as Host)
  const startSession = useCallback(
    async (customPassword?: string): Promise<RoomCredentials> => {
      const manager = managerRef.current;
      if (!manager) throw new Error('Room manager not initialized');

      const roomId = generateSecureId('c3m', 10);
      const password = customPassword ?? generateRoomPassword();
      const creds: RoomCredentials = { roomId, password };

      manager.setIsHost(true);
      await manager.connect(creds);

      // Only update the hash if it actually differs, to avoid firing
      // the hashchange listener and re-entering joinSession.
      if (typeof window !== 'undefined') {
        const newHash = buildCollabHash(creds);
        if (window.location.hash !== newHash) {
          window.location.hash = newHash;
        }
      }

      return creds;
    },
    []
  );

  // Join an existing session
  const joinSession = useCallback(
    async (creds: RoomCredentials) => {
      const manager = managerRef.current;
      if (!manager) return;

      manager.setIsHost(false);
      await manager.connect(creds);

      // Only update the hash if it actually differs.
      if (typeof window !== 'undefined') {
        const newHash = buildCollabHash(creds);
        if (window.location.hash !== newHash) {
          window.location.hash = newHash;
        }
      }
    },
    []
  );

  // Leave / end session
  const leaveSession = useCallback(() => {
    const manager = managerRef.current;
    if (manager) {
      manager.setIsHost(false);
      manager.disconnect();
    }
    clearCollabHash();
  }, []);

  // Update display name
  const setDisplayName = useCallback((name: string) => {
    managerRef.current?.setDisplayName(name);
  }, []);

  // Auto-connect from URL hash on mount and on hashchange
  useEffect(() => {
    if (config.autoConnectFromUrl === false) return;
    if (typeof window === 'undefined') return;

    const handleHash = () => {
      const hashCreds = parseCollabHash(window.location.hash);
      const currentCreds = managerRef.current?.getCredentials();
      // Only join if it's a new or different room
      if (hashCreds?.roomId && hashCreds.roomId !== currentCreds?.roomId) {
        joinSession(hashCreds);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);

    // Clean teardown on unmount
    return () => {
      window.removeEventListener('hashchange', handleHash);
      managerRef.current?.disconnect();
    };
  }, [config.autoConnectFromUrl, joinSession]);

  return {
    ...state,
    ydoc: managerRef.current?.getDoc() ?? null,
    provider: managerRef.current?.getProvider() ?? null,
    startSession,
    joinSession,
    leaveSession,
    setDisplayName,
  };
}
