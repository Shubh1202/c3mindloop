/**
 * Room Lifecycle & Provider Manager for C³ MindLoop WebRTC Collaboration.
 * Encapsulates Yjs document, WebrtcProvider, awareness presence, and connection states.
 */

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { DEFAULT_SIGNALING_SERVERS, MAX_DOCUMENT_SIZE_BYTES } from './config';
import {
  CollabRoomConfig,
  ConnectionStatus,
  PeerProfile,
  RoomCredentials,
} from './types';
import { generateAnonymousDeveloperName } from './crypto';

export type RoomEventCallback = (event: {
  status: ConnectionStatus;
  peers: PeerProfile[];
  selfProfile: PeerProfile;
  webrtcPeerCount: number;
  bcPeerCount: number;
  isHost: boolean;
  error: string | null;
}) => void;

export class CollaborationRoomManager {
  private ydoc: Y.Doc | null = null;
  private provider: WebrtcProvider | null = null;
  private config: CollabRoomConfig;
  private credentials: RoomCredentials | null = null;
  private selfProfile: PeerProfile;
  private peers: PeerProfile[] = [];
  private status: ConnectionStatus = 'idle';
  private error: string | null = null;
  private webrtcPeerCount = 0;
  private bcPeerCount = 0;
  private isHost = false;
  private eventListeners: Set<RoomEventCallback> = new Set();
  private isDestroyed = false;

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
      peers: this.peers,
      selfProfile: this.selfProfile,
      webrtcPeerCount: this.webrtcPeerCount,
      bcPeerCount: this.bcPeerCount,
      isHost: this.isHost,
      error: this.error,
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
    this.error = null;
    this.notify();

    try {
      // 1. Initialize fresh Y.Doc
      const ydoc = new Y.Doc({ gc: true });
      this.ydoc = ydoc;

      // 2. Document Size Protection Guardrail
      ydoc.on('update', (update: Uint8Array, origin: any) => {
        // Enforce max text length quota
        const textLen = ydoc.getText('content').length;
        if (textLen > MAX_DOCUMENT_SIZE_BYTES) {
          console.warn('[Collab] Document size exceeded quota:', textLen);
          this.error = `Document size exceeds ${MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024)}MB limit.`;
          this.notify();
        }
      });

      // 3. Room name is scoped by toolId to avoid cross-tool collision
      const scopedRoomName = `c3m-${this.config.toolId}-${credentials.roomId}`;
      const signalingServers = this.config.signalingServers || DEFAULT_SIGNALING_SERVERS;

      // 4. Initialize WebrtcProvider with optional password-derived encryption
      const provider = new WebrtcProvider(scopedRoomName, ydoc, {
        signaling: signalingServers,
        password: credentials.password || this.config.password || undefined,
        filterBcConns: this.config.filterBcConns ?? true,
      });
      this.provider = provider;

      // Update client ID in self profile
      this.selfProfile = {
        ...this.selfProfile,
        clientId: ydoc.clientID,
      };

      // 5. Initialize Awareness (Presence: Name & Color)
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

      // 6. Handle provider events
      provider.on('status', ({ connected }: { connected: boolean }) => {
        if (this.isDestroyed) return;
        this.status = connected ? 'connected' : 'connecting';
        this.notify();
      });

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

      this.status = 'connected';
      this.notify();
    } catch (err: any) {
      console.error('[Collab] Failed to initialize WebRTC provider:', err);
      this.status = 'error';
      this.error = err?.message || 'Failed to connect to collaboration session.';
      this.notify();
    }
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
   * Disconnects current session and cleanly destroys all WebRTC channels and listeners.
   */
  public disconnect(): void {
    this.isDestroyed = true;

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
    this.error = null;
    this.notify();
  }
}
