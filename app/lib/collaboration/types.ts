/**
 * Collaboration System Types for C³ MindLoop
 * Standardized interfaces for P2P WebRTC, Yjs CRDT synchronization, and Presence.
 */

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';

export interface PeerProfile {
  clientId: number;
  name: string;
  color: string;
  isSelf: boolean;
  cursor?: {
    line: number;
    ch: number;
  } | null;
}

export interface RoomCredentials {
  roomId: string;
  password?: string;
}

export interface CollabRoomConfig {
  toolId: string;
  signalingServers?: string[];
  password?: string;
  maxDocumentSizeBytes?: number;
  filterBcConns?: boolean; // Set to true in tests/strict mode to enforce pure WebRTC
  autoConnectFromUrl?: boolean;
}

export interface CollabSessionState {
  status: ConnectionStatus;
  roomId: string | null;
  isHost: boolean;
  peers: PeerProfile[];
  selfProfile: PeerProfile;
  peerCount: number;
  webrtcPeerCount: number;
  bcPeerCount: number;
  isCollaborating: boolean;
  shareableUrl: string | null;
  error: string | null;
}

export interface UseCollaborativeTextProps {
  ydoc: import('yjs').Doc | null;
  field?: string;
  value: string;
  onChange: (val: string) => void;
  enabled: boolean;
  isHost?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}
