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
      signalingConnected: false,
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
      connectionWarning: null,
      terminatedReason: null,
    };
  });

  // 15-second bounded connection watchdog timer
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearWatchdog = useCallback(() => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
  }, []);

  // Keep state synchronized with manager events
  useEffect(() => {
    const manager = managerRef.current;
    if (!manager) return;

    const unsubscribe = manager.subscribe((event) => {
      const creds = manager.getCredentials();
      const isCollab = event.status === 'connected' || event.status === 'connecting';
      const shareUrl = creds ? buildShareableUrl(creds) : null;

      // Clear connection warning as soon as any peer connects
      const hasPeer = event.webrtcPeerCount > 0 || event.bcPeerCount > 0;
      if (hasPeer) {
        clearWatchdog();
      }

      setState((prev) => ({
        status: event.status,
        signalingConnected: event.signalingConnected,
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
        connectionWarning: hasPeer ? null : prev.connectionWarning,
        terminatedReason: event.terminatedReason,
      }));
    });

    return () => {
      unsubscribe();
    };
  }, [clearWatchdog]);

  const armWatchdog = useCallback((isHost: boolean) => {
    clearWatchdog();
    watchdogTimerRef.current = setTimeout(() => {
      const currentCreds = managerRef.current?.getCredentials();
      if (!currentCreds) return;

      setState((prev) => {
        // If peers already connected, do not warn
        if (prev.webrtcPeerCount > 0 || prev.bcPeerCount > 0) {
          return prev;
        }

        if (prev.status === 'connecting') {
          return {
            ...prev,
            connectionWarning:
              'Signaling handshake is taking longer than usual. Public signaling may be delayed; retrying in background...',
          };
        }

        if (!isHost) {
          return {
            ...prev,
            connectionWarning:
              'Waiting for host connection. If the host closed their tab or your network blocks direct peer connections (symmetric NAT / enterprise firewall without TURN), live sync cannot establish.',
          };
        }

        return prev;
      });
    }, 15000);
  }, [clearWatchdog]);

  // Start a new live session (as Host)
  const startSession = useCallback(
    async (customPassword?: string): Promise<RoomCredentials> => {
      const manager = managerRef.current;
      if (!manager) throw new Error('Room manager not initialized');

      clearWatchdog();
      const roomId = generateSecureId('c3m', 10);
      const password = customPassword ?? generateRoomPassword();
      const creds: RoomCredentials = { roomId, password };

      manager.setIsHost(true);
      await manager.connect(creds);

      if (typeof window !== 'undefined') {
        const newHash = buildCollabHash(creds);
        if (window.location.hash !== newHash) {
          window.location.hash = newHash;
        }
      }

      armWatchdog(true);
      return creds;
    },
    [armWatchdog, clearWatchdog]
  );

  // Join an existing session
  const joinSession = useCallback(
    async (creds: RoomCredentials) => {
      const manager = managerRef.current;
      if (!manager) return;

      clearWatchdog();
      manager.setIsHost(false);
      await manager.connect(creds);

      if (typeof window !== 'undefined') {
        const newHash = buildCollabHash(creds);
        if (window.location.hash !== newHash) {
          window.location.hash = newHash;
        }
      }

      armWatchdog(false);
    },
    [armWatchdog, clearWatchdog]
  );

  // Retry / Reconnect to current session
  const retryConnection = useCallback(async () => {
    const manager = managerRef.current;
    if (!manager) return;

    clearWatchdog();
    setState((prev) => ({
      ...prev,
      status: 'connecting',
      connectionWarning: null,
      error: null,
    }));

    await manager.reconnect();
    armWatchdog(manager.getIsHost());
  }, [armWatchdog, clearWatchdog]);

  // Leave session (local only — does NOT terminate for others)
  const leaveSession = useCallback(() => {
    clearWatchdog();
    const manager = managerRef.current;
    if (manager) {
      manager.setIsHost(false);
      manager.disconnect();
    }
    clearCollabHash();
    setState((prev) => ({ ...prev, connectionWarning: null, error: null }));
  }, [clearWatchdog]);

  // End session for ALL connected peers (Host only)
  const endSessionForAll = useCallback(() => {
    clearWatchdog();
    const manager = managerRef.current;
    if (manager) {
      manager.endSessionForAll();
    }
    clearCollabHash();
    setState((prev) => ({ ...prev, connectionWarning: null, error: null }));
  }, [clearWatchdog]);

  // Dismiss connection warning
  const dismissWarning = useCallback(() => {
    setState((prev) => ({ ...prev, connectionWarning: null }));
  }, []);

  // Dismiss error
  const dismissError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
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
      const hash = window.location.hash;
      if (!hash || hash === '#') return;

      // Only process hashes that target collaboration
      if (hash.startsWith('#collab=') || hash.includes('collab=')) {
        const hashCreds = parseCollabHash(hash);
        if (!hashCreds?.roomId) {
          setState((prev) => ({
            ...prev,
            error: 'Invalid collaboration link: missing or malformed room credentials.',
          }));
          return;
        }

        const currentCreds = managerRef.current?.getCredentials();
        if (hashCreds.roomId !== currentCreds?.roomId) {
          joinSession(hashCreds);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);

    // Clean teardown on unmount
    return () => {
      clearWatchdog();
      window.removeEventListener('hashchange', handleHash);
      managerRef.current?.disconnect();
    };
  }, [config.autoConnectFromUrl, joinSession, clearWatchdog]);

  // If host closes the tab / navigates away, end session for all peers
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      const manager = managerRef.current;
      if (manager?.getIsHost() && manager.getCredentials()) {
        manager.endSessionForAll();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return {
    ...state,
    ydoc: managerRef.current?.getDoc() ?? null,
    provider: managerRef.current?.getProvider() ?? null,
    startSession,
    joinSession,
    retryConnection,
    leaveSession,
    endSessionForAll,
    setDisplayName,
    dismissWarning,
    dismissError,
  };
}
