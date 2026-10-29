/**
 * Room Lifecycle & Provider Manager for C³ MindLoop WebRTC Collaboration.
 * Encapsulates Yjs document, WebrtcProvider, awareness presence, and connection states.
 */

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { DEFAULT_SIGNALING_SERVERS, DEFAULT_STUN_SERVERS, MAX_DOCUMENT_SIZE_BYTES } from './config';
import {
  CollabRoomConfig,
  ConnectionStatus,
  PeerProfile,
  RoomCredentials,
} from './types';
import { generateAnonymousDeveloperName } from './crypto';

export type RoomEventCallback = (event: {
  status: ConnectionStatus;
  signalingConnected: boolean;
  peers: PeerProfile[];
  selfProfile: PeerProfile;
  webrtcPeerCount: number;
  bcPeerCount: number;
  isHost: boolean;
  error: string | null;
  terminatedReason: string | null;
}) => void;

export class CollaborationRoomManager {
  private ydoc: Y.Doc | null = null;
  private provider: WebrtcProvider | null = null;
  private config: CollabRoomConfig;
  private credentials: RoomCredentials | null = null;
  private selfProfile: PeerProfile;
  private peers: PeerProfile[] = [];
  private status: ConnectionStatus = 'idle';
  private signalingConnected = false;
  private error: string | null = null;
  private terminatedReason: string | null = null;
  private webrtcPeerCount = 0;
  private bcPeerCount = 0;
  private isHost = false;
  private eventListeners: Set<RoomEventCallback> = new Set();
  private isDestroyed = false;
  private endSessionTimeout: NodeJS.Timeout | null = null;

  constructor(config: CollabRoomConfig) {
    this.config = config;
    const generated = generateAnonymousDeveloperName();
    this.selfProfile = {
      clientId: 0,
      name: generated.name,
      color: generated.color,
      isSelf: true,
    };
  }

  public setIsHost(val: boolean): void {
    this.isHost = val;
  }

  public getIsHost(): boolean {
    return this.isHost;
  }

  public subscribe(cb: RoomEventCallback): () => void {
    this.eventListeners.add(cb);
    this.notify();
    return () => {
      this.eventListeners.delete(cb);
    };
  }

  private notify(): void {
    const payload = {
      status: this.status,
      signalingConnected: this.signalingConnected,
      peers: this.peers,
      selfProfile: this.selfProfile,
      webrtcPeerCount: this.webrtcPeerCount,
      bcPeerCount: this.bcPeerCount,
      isHost: this.isHost,
      error: this.error,
      terminatedReason: this.terminatedReason,
    };
    for (const listener of this.eventListeners) {
      listener(payload);
    }
  }

  public getDoc(): Y.Doc | null {
    return this.ydoc;
  }

  public getProvider(): WebrtcProvider | null {
    return this.provider;
  }

  public getCredentials(): RoomCredentials | null {
    return this.credentials;
  }

  public getSelfProfile(): PeerProfile {
    return this.selfProfile;
  }

  public setDisplayName(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    this.selfProfile = { ...this.selfProfile, name: trimmed };

    if (this.provider?.awareness) {
      this.provider.awareness.setLocalStateField('user', {
        name: this.selfProfile.name,
        color: this.selfProfile.color,
      });
    }
    this.notify();
  }

  /**
   * Initializes a WebRTC collaboration session for a specific room.
   */
  public async connect(credentials: RoomCredentials): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    // Guard: if already connecting/connected to the same room, no-op.
    // Prevents redundant teardown→reconnect cycles from hashchange storms.
    if (
      this.credentials?.roomId === credentials.roomId &&
      (this.status === 'connecting' || this.status === 'connected')
    ) {
      return;
    }

    if (this.provider) {
      this.disconnect();
    }

    this.isDestroyed = false;
    this.credentials = credentials;
    this.status = 'connecting';
    this.signalingConnected = false;
    this.error = null;
    this.terminatedReason = null;
    this.notify();

    try {
      // 1. Initialize fresh Y.Doc
      const ydoc = new Y.Doc({ gc: true });
      this.ydoc = ydoc;

      // 2. Document Size Protection Guardrail
      ydoc.on('update', (_update: Uint8Array, _origin: any) => {
        // Enforce max text length quota
        const textLen = ydoc.getText('content').length;
        if (textLen > MAX_DOCUMENT_SIZE_BYTES) {
          console.warn('[Collab] Document size exceeded quota:', textLen);
          this.error = `Document size exceeds ${MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024)}MB limit.`;
          this.notify();
        }
      });

      // 3. Listen for session-meta termination signal from Host
      const sessionMeta = ydoc.getMap('session-meta');
      sessionMeta.observe(() => {
        if (this.isDestroyed) return;
        const term = sessionMeta.get('terminated') as
          | { endedBy?: string; timestamp?: number }
          | undefined;
        if (term) {
          const endedBy = term.endedBy || 'Host';
          this.terminatedReason = `Session ended for all participants by ${endedBy}.`;
          this.disconnect();
        }
      });

      // 4. Room name is scoped by toolId to avoid cross-tool collision
      const scopedRoomName = `c3m-${this.config.toolId}-${credentials.roomId}`;
      const signalingServers = this.config.signalingServers || DEFAULT_SIGNALING_SERVERS;

      // 5. Initialize WebrtcProvider with optional password-derived encryption
      const provider = new WebrtcProvider(scopedRoomName, ydoc, {
        signaling: signalingServers,
        password: credentials.password || this.config.password || undefined,
        filterBcConns: this.config.filterBcConns ?? true,
        peerOpts: {
          config: {
            iceServers: DEFAULT_STUN_SERVERS,
          },
        },
      });
      this.provider = provider;

      // Update client ID in self profile
      this.selfProfile = {
        ...this.selfProfile,
        clientId: ydoc.clientID,
      };

      // 6. Initialize Awareness (Presence: Name & Color)
      if (provider.awareness) {
        provider.awareness.setLocalStateField('user', {
          name: this.selfProfile.name,
          color: this.selfProfile.color,
        });

        // Listen for peer awareness updates
        provider.awareness.on('change', () => {
          if (this.isDestroyed) return;
          this.updatePeerList();
        });
      }

      // 7. Handle provider status (signaling connectivity)
      provider.on('status', ({ connected }: { connected: boolean }) => {
        if (this.isDestroyed) return;
        this.signalingConnected = connected;
        // Distinguish signaling connectivity: provider status indicates signaling server socket
        this.status = connected ? 'connected' : 'connecting';
        this.notify();
      });

      // 8. Handle peer connection events (WebRTC and BroadcastChannel peers)
      provider.on(
        'peers',
        ({
          webrtcPeers,
          bcPeers,
        }: {
          added: string[];
          removed: string[];
          webrtcPeers: string[];
          bcPeers: string[];
        }) => {
          if (this.isDestroyed) return;
          this.webrtcPeerCount = webrtcPeers ? webrtcPeers.length : 0;
          this.bcPeerCount = bcPeers ? bcPeers.length : 0;
          this.updatePeerList();
        }
      );

      // Provider was successfully constructed; notify
      this.notify();
    } catch (err: any) {
      console.error('[Collab] Failed to initialize WebRTC provider:', err);
      this.status = 'error';
      this.signalingConnected = false;
      this.error = err?.message || 'Failed to connect to collaboration session.';
      this.notify();
    }
  }

  /**
   * Reconnects to the current room session (e.g. after network drop or timeout retry).
   */
  public async reconnect(): Promise<void> {
    if (!this.credentials) return;
    const creds = { ...this.credentials };
    const wasHost = this.isHost;
    this.disconnect();
    this.isHost = wasHost;
    await this.connect(creds);
  }

  private updatePeerList(): void {
    if (!this.provider?.awareness) return;

    const states = this.provider.awareness.getStates();
    const parsedPeers: PeerProfile[] = [];

    states.forEach((state, clientId) => {
      const user = state.user;
      if (user && typeof user.name === 'string') {
        parsedPeers.push({
          clientId,
          name: user.name,
          color: user.color || '#1D9BF0',
          isSelf: clientId === this.ydoc?.clientID,
          cursor: state.cursor || null,
        });
      }
    });

    this.peers = parsedPeers;
    this.notify();
  }

  /**
   * Terminate the entire collaboration session for all connected peers (Host only).
   */
  public endSessionForAll(): void {
    if (!this.ydoc) {
      this.disconnect();
      return;
    }

    try {
      const sessionMeta = this.ydoc.getMap('session-meta');
      sessionMeta.set('terminated', {
        endedBy: this.selfProfile.name,
        timestamp: Date.now(),
      });
    } catch (e) {
      // Ignore
    }

    if (this.endSessionTimeout) {
      clearTimeout(this.endSessionTimeout);
    }

    // Allow 150ms for WebRTC / BroadcastChannel to broadcast termination packet
    this.endSessionTimeout = setTimeout(() => {
      this.disconnect();
      this.endSessionTimeout = null;
    }, 150);
  }

  /**
   * Disconnects current session and cleanly destroys all WebRTC channels, timers, and listeners.
   */
  public disconnect(): void {
    this.isDestroyed = true;

    if (this.endSessionTimeout) {
      clearTimeout(this.endSessionTimeout);
      this.endSessionTimeout = null;
    }

    if (this.provider) {
      try {
        this.provider.disconnect();
        this.provider.destroy();
      } catch (e) {
        // Ignore teardown errors
      }
      this.provider = null;
    }

    if (this.ydoc) {
      try {
        this.ydoc.destroy();
      } catch (e) {
        // Ignore teardown errors
      }
      this.ydoc = null;
    }

    this.credentials = null;
    this.peers = [];
    this.webrtcPeerCount = 0;
    this.bcPeerCount = 0;
    this.status = 'idle';
    this.signalingConnected = false;
    this.error = null;
    this.notify();
  }
}
