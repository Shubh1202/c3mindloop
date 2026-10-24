'use client';

import React from 'react';
import { PeerProfile } from '@/app/lib/collaboration/types';
import { User } from 'lucide-react';

interface CollabPeerListProps {
  peers: PeerProfile[];
  selfProfile: PeerProfile;
}

export const CollabPeerList: React.FC<CollabPeerListProps> = ({
  peers,
  selfProfile,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-theme-muted">
        <span>Active Participants ({peers.length})</span>
      </div>

      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
        {peers.map((peer) => {
          const isMe = peer.isSelf || peer.clientId === selfProfile.clientId;
          const initials = peer.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={peer.clientId}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${
                isMe
                  ? 'bg-surface border-theme-subtle text-theme-main'
                  : 'bg-surface/50 border-theme-subtle/50 text-theme-muted'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs shrink-0"
                  style={{ backgroundColor: peer.color }}
                >
                  {initials || <User className="w-3.5 h-3.5" />}
                </div>
                <span className="font-medium text-theme-main truncate max-w-[200px]">
                  {peer.name}
                </span>
                {isMe && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1D9BF0]/15 text-[#1D9BF0] font-semibold border border-[#1D9BF0]/30">
                    You
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-theme-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Active</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
