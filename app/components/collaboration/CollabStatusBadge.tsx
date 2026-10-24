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
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Connecting...
      </span>
    );
  }

  if (status === 'connected') {
    const isP2P = webrtcPeerCount > 0;
    const modeLabel = isP2P
      ? `P2P WebRTC (${peerCount})`
      : bcPeerCount > 0
      ? `Local Peer (${peerCount})`
      : 'Waiting for peers (1)';

    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {modeLabel}
      </span>
    );
  }

  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-red-500/10 text-red-400 border border-red-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Connection Error
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono text-neutral-400 bg-surface border border-theme-subtle">
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
      Offline
    </span>
  );
};
