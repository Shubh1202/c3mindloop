'use client';

import React, { useState } from 'react';
import { Toolbar } from '@/app/components/ui/Toolbar';
import { CollabSessionModal } from './CollabSessionModal';
import { CollabSessionState, RoomCredentials } from '@/app/lib/collaboration/types';
import { Users, Radio } from 'lucide-react';

interface CollabToolbarButtonProps {
  sessionState: CollabSessionState;
  startSession: () => Promise<RoomCredentials>;
  joinSession: (creds: RoomCredentials) => Promise<void>;
  leaveSession: () => void;
  endSessionForAll?: () => void;
  setDisplayName: (name: string) => void;
  isDark?: boolean;
}

export const CollabToolbarButton: React.FC<CollabToolbarButtonProps> = ({
  sessionState,
  startSession,
  joinSession,
  leaveSession,
  endSessionForAll,
  setDisplayName,
  isDark = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isLive = sessionState.isCollaborating;
  const peerCount = sessionState.peerCount;

  return (
    <>
      <Toolbar.Button
        onClick={() => setIsModalOpen(true)}
        isDark={isDark}
        active={isLive}
        variant={isLive ? 'primary' : 'secondary'}
        className={
          isLive
            ? '!bg-emerald-600 hover:!bg-emerald-500 !text-white border-emerald-500/50 shadow-sm'
            : ''
        }
        title={
          isLive
            ? `Live P2P Session Active • ${peerCount} Connected`
            : 'Start or join a real-time multiplayer session'
        }
      >
        {isLive ? (
          <>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
            <span className="font-semibold text-xs font-mono">Live ({peerCount})</span>
          </>
        ) : (
          <>
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline font-mono text-xs">Collaborate</span>
          </>
        )}
      </Toolbar.Button>

      <CollabSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sessionState={sessionState}
        startSession={startSession}
        joinSession={joinSession}
        leaveSession={leaveSession}
        endSessionForAll={endSessionForAll}
        setDisplayName={setDisplayName}
        isDark={isDark}
      />
    </>
  );
};
