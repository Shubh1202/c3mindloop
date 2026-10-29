'use client';

import React from 'react';
import { ConnectionStatus } from '@/app/lib/collaboration/types';

interface CollabStatusBadgeProps {
  status: ConnectionStatus;
  peerCount: number;
  webrtcPeerCount: number;
  bcPeerCount: number;
  isDark?: boolean;
}

export const CollabStatusBadge: React.FC<CollabStatusBadgeProps> = ({
  status,
  peerCount,
  webrtcPeerCount,
  bcPeerCount,
  isDark = true,
}) => {
  if (status === 'connecting') {
    return (
      <span
        data-testid="collab-status-badge"
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border ${
          isDark
            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            : 'bg-amber-50 text-amber-800 border-amber-300'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            isDark ? 'bg-amber-400' : 'bg-amber-600'
          }`}
          aria-hidden="true"
        />
        <span>Connecting...</span>
      </span>
    );
  }

  if (status === 'connected') {
    const isP2P = webrtcPeerCount > 0;
    const hasPeers = isP2P || bcPeerCount > 0;
    const modeLabel = isP2P
      ? `P2P WebRTC (${peerCount})`
      : bcPeerCount > 0
      ? `Local Peer (${peerCount})`
      : 'Waiting for peers (1)';

    return (
      <span
        data-testid="collab-status-badge"
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border ${
          hasPeers
            ? isDark
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : isDark
            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            : 'bg-amber-50 text-amber-800 border-amber-300'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            hasPeers
              ? isDark
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-emerald-600 animate-pulse'
              : isDark
              ? 'bg-amber-400 animate-ping'
              : 'bg-amber-600 animate-ping'
          }`}
          aria-hidden="true"
        />
        <span>{modeLabel}</span>
      </span>
    );
  }

  if (status === 'error') {
    return (
      <span
        data-testid="collab-status-badge"
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border ${
          isDark
            ? 'bg-red-500/15 text-red-300 border-red-500/30'
            : 'bg-red-50 text-red-800 border-red-300'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isDark ? 'bg-red-400' : 'bg-red-600'
          }`}
          aria-hidden="true"
        />
        <span>Connection Error</span>
      </span>
    );
  }

  return (
    <span
      data-testid="collab-status-badge"
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border ${
        isDark
          ? 'bg-neutral-800/80 text-neutral-300 border-neutral-700'
          : 'bg-neutral-100 text-neutral-700 border-neutral-300'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isDark ? 'bg-neutral-400' : 'bg-neutral-500'
        }`}
        aria-hidden="true"
      />
      <span>Offline</span>
    </span>
  );
};
