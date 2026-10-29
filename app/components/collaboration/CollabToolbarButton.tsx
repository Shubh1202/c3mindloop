'use client';

import React, { useState } from 'react';
import { Toolbar } from '@/app/components/ui/Toolbar';
import { CollabSessionModal } from './CollabSessionModal';
import { CollabSessionState, RoomCredentials } from '@/app/lib/collaboration/types';
import { Users } from 'lucide-react';

interface CollabToolbarButtonProps {
  sessionState: CollabSessionState;
  startSession: () => Promise<RoomCredentials>;
  joinSession: (creds: RoomCredentials) => Promise<void>;
  retryConnection?: () => Promise<void> | void;
  leaveSession: () => void;
  endSessionForAll?: () => void;
  setDisplayName: (name: string) => void;
  isDark?: boolean;
}

export const CollabToolbarButton: React.FC<CollabToolbarButtonProps> = ({
  sessionState,
  startSession,
  joinSession,
  retryConnection,
  leaveSession,
  endSessionForAll,
  setDisplayName,
  isDark = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Listen for open-modal events triggered from active banners
  React.useEffect(() => {
    const handleOpen = () => setIsModalOpen(true);
    window.addEventListener('collab:open-modal', handleOpen);
    return () => window.removeEventListener('collab:open-modal', handleOpen);
  }, []);

  const isLive = sessionState.isCollaborating;
  const peerCount = sessionState.peerCount;
  const hasPeers = peerCount > 1;

  return (
    <>
      <Toolbar.Button
        onClick={() => setIsModalOpen(true)}
        isDark={isDark}
        active={isLive}
        variant={isLive ? 'primary' : 'secondary'}
        data-testid="collab-toolbar-button"
        aria-label={
          isLive
            ? hasPeers
              ? `Live collaboration active with ${peerCount} participants`
              : 'Collaboration active: waiting for peers to join (1 participant in room)'
            : 'Start or join live collaboration'
        }
        className={
          isLive
            ? hasPeers
              ? '!bg-emerald-600 hover:!bg-emerald-500 !text-white border-emerald-500/50 shadow-sm'
              : '!bg-amber-700 hover:!bg-amber-600 !text-white border-amber-600/50 shadow-sm'
            : ''
        }
        title={
          isLive
            ? hasPeers
              ? `Live P2P Session Active • ${peerCount} Connected`
              : 'Session Active • Waiting for peers to connect'
            : 'Start or join a real-time multiplayer session'
        }
      >
        {isLive ? (
          hasPeers ? (
            <>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" aria-hidden="true" />
              <span className="font-semibold text-xs font-mono">Live ({peerCount})</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-white/90 animate-ping shrink-0" aria-hidden="true" />
              <span className="font-semibold text-xs font-mono">Waiting (1)</span>
            </>
          )
        ) : (
          <>
            <Users className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
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
        retryConnection={retryConnection}
        leaveSession={leaveSession}
        endSessionForAll={endSessionForAll}
        setDisplayName={setDisplayName}
        isDark={isDark}
      />
    </>
  );
};
