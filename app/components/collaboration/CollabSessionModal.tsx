'use client';

import React, { useState } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { CollabPeerList } from './CollabPeerList';
import { CollabStatusBadge } from './CollabStatusBadge';
import { CollabSessionState, RoomCredentials } from '@/app/lib/collaboration/types';
import { parseCollabHash } from '@/app/lib/collaboration/crypto';
import {
  Copy,
  Check,
  Share2,
  Users,
  ShieldCheck,
  LogOut,
  Radio,
  Edit2,
  ArrowRight,
} from 'lucide-react';

interface CollabSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionState: CollabSessionState;
  startSession: () => Promise<RoomCredentials>;
  joinSession: (creds: RoomCredentials) => Promise<void>;
  leaveSession: () => void;
  setDisplayName: (name: string) => void;
  isDark?: boolean;
}

export const CollabSessionModal: React.FC<CollabSessionModalProps> = ({
  isOpen,
  onClose,
  sessionState,
  startSession,
  joinSession,
  leaveSession,
  setDisplayName,
  isDark = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(sessionState.selfProfile.name);
  const [joinInput, setJoinInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleCopyLink = () => {
    if (!sessionState.shareableUrl) return;
    navigator.clipboard.writeText(sessionState.shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setDisplayName(nameInput.trim());
    }
    setEditingName(false);
  };

  const handleManualJoin = () => {
    setJoinError(null);
    const parsed = parseCollabHash(joinInput.trim());
    if (parsed?.roomId) {
      joinSession(parsed);
      setJoinInput('');
    } else {
      setJoinError('Invalid room link or hash format. Expected #collab=...&pwd=...');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Peer-to-Peer Live Collaboration">
      <div className="space-y-6 text-xs font-mono">
        {/* Header Status Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
          <div className="flex items-center gap-2">
            <Radio
              className={`w-4 h-4 ${
                sessionState.isCollaborating ? 'text-emerald-400 animate-pulse' : 'text-theme-muted'
              }`}
            />
            <span className="font-semibold text-theme-main">
              {sessionState.isCollaborating ? 'Live Session Active' : 'Offline / Standalone'}
            </span>
          </div>
          <CollabStatusBadge
            status={sessionState.status}
            peerCount={sessionState.peerCount}
            webrtcPeerCount={sessionState.webrtcPeerCount}
            bcPeerCount={sessionState.bcPeerCount}
            isDark={isDark}
          />
        </div>

        {sessionState.isCollaborating ? (
          <>
            {/* Shareable Link Section */}
            <div className="space-y-2">
              <label className="block text-theme-muted">Invite Link (100% Private Bearer Link)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={sessionState.shareableUrl || ''}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-theme-subtle text-theme-main focus:outline-hidden text-xs font-mono select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-lg bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white flex items-center gap-1.5 font-semibold shrink-0 cursor-pointer transition-colors shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-theme-muted">
                Anyone with this link can view and edit in real time over direct WebRTC DataChannels.
              </p>
            </div>

            {/* Display Name Customizer */}
            <div className="space-y-2 p-3 rounded-lg bg-surface/50 border border-theme-subtle">
              <div className="flex items-center justify-between">
                <span className="text-theme-muted">Your Display Name:</span>
                {!editingName && (
                  <button
                    onClick={() => {
                      setNameInput(sessionState.selfProfile.name);
                      setEditingName(true);
                    }}
                    className="flex items-center gap-1 text-[11px] text-[#1D9BF0] hover:underline cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {editingName ? (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') setEditingName(false);
                    }}
                    placeholder="Enter custom nickname..."
                    maxLength={30}
                    className="w-full px-2.5 py-1 rounded bg-surface border border-[#1D9BF0] text-theme-main text-xs focus:outline-hidden"
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-2.5 py-1 rounded bg-[#1D9BF0] text-white text-xs font-semibold cursor-pointer shrink-0"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-0.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: sessionState.selfProfile.color }}
                  />
                  <span className="font-semibold text-theme-main">
                    {sessionState.selfProfile.name}
                  </span>
                </div>
              )}
            </div>

            {/* Peer List */}
            <CollabPeerList
              peers={sessionState.peers}
              selfProfile={sessionState.selfProfile}
            />

            {/* Security Guarantee Banner */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Zero-Knowledge & Privacy-First</span>
              </div>
              <p className="text-[10px] text-emerald-300/80 leading-relaxed">
                Your keystrokes and document contents are exchanged directly between browsers via
                encrypted WebRTC DataChannels. C³ MindLoop servers never see, decrypt, or log your
                code.
              </p>
            </div>

            {/* Leave / Disconnect Action */}
            <div className="pt-2 border-t border-theme-subtle flex justify-end">
              <button
                onClick={() => {
                  leaveSession();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave Session</span>
              </button>
            </div>
          </>
        ) : (
          /* Disconnected State - Start or Join */
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-theme-main">
                Start a Real-Time Multiplayer Session
              </h4>
              <p className="text-theme-muted leading-relaxed">
                Work simultaneously on JSON, code, or configs with your team. Zero server setup, zero
                accounts, and end-to-end encrypted direct browser-to-browser synchronization.
              </p>

              <button
                onClick={async () => {
                  await startSession();
                }}
                className="w-full py-2.5 rounded-lg bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors text-xs"
              >
                <Share2 className="w-4 h-4" />
                <span>Start Live Session (Generate Invite Link)</span>
              </button>
            </div>

            {/* Join by URL input */}
            <div className="space-y-2 pt-3 border-t border-theme-subtle">
              <label className="block text-theme-muted">Or Join Existing Room:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value)}
                  placeholder="Paste invite link or #collab=... hash"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-theme-subtle text-theme-main focus:outline-hidden text-xs"
                />
                <button
                  onClick={handleManualJoin}
                  disabled={!joinInput.trim()}
                  className="px-3 py-2 rounded-lg bg-surface hover:bg-theme-hover border border-theme-subtle text-theme-main font-semibold flex items-center gap-1.5 shrink-0 disabled:opacity-40 cursor-pointer transition-colors"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {joinError && <p className="text-[11px] text-red-400">{joinError}</p>}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
