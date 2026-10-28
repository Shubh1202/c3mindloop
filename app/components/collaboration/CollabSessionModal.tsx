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
  ShieldCheck,
  LogOut,
  Radio,
  Edit2,
  ArrowRight,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

interface CollabSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionState: CollabSessionState;
  startSession: () => Promise<RoomCredentials>;
  joinSession: (creds: RoomCredentials) => Promise<void>;
  leaveSession: () => void;
  /** Host-only: terminate the session for all connected peers */
  endSessionForAll?: () => void;
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
  endSessionForAll,
  setDisplayName,
  isDark = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(sessionState.selfProfile.name);
  const [joinInput, setJoinInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  // Confirmation dialog before ending the session for all
  const [showEndConfirm, setShowEndConfirm] = useState(false);

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

  const handleConfirmEndSession = () => {
    endSessionForAll?.();
    setShowEndConfirm(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Peer-to-Peer Live Collaboration">
      <div className="space-y-6 text-xs font-mono">

        {/* ── Terminated Session Banner (non-host peers see this after host ends the session) ── */}
        {sessionState.terminatedReason && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-950/40 border border-red-700/50 text-red-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <div>
              <p className="font-semibold text-red-300 text-[11px] mb-0.5">Session Terminated</p>
              <p className="text-[10px] text-red-300/80 leading-relaxed">{sessionState.terminatedReason}</p>
            </div>
          </div>
        )}

        {/* ── Header Status Bar ── */}
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
            {/* ── Shareable Link ── */}
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

            {/* ── Display Name Customizer ── */}
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
                  {sessionState.isHost && (
                    <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wide">
                      Host
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* ── Peer List ── */}
            <CollabPeerList
              peers={sessionState.peers}
              selfProfile={sessionState.selfProfile}
            />

            {/* ── Security Guarantee Banner ── */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Zero-Knowledge &amp; Privacy-First</span>
              </div>
              <p className="text-[10px] text-emerald-300/80 leading-relaxed">
                Your keystrokes and document contents are exchanged directly between browsers via
                encrypted WebRTC DataChannels. C³ MindLoop servers never see, decrypt, or log your
                code.
              </p>
            </div>

            {/* ── Leave / End Session Actions ── */}
            <div className="pt-2 border-t border-theme-subtle flex items-center justify-end gap-2">

              {/* Both host and guests can leave the session (personal disconnect only) */}
              <button
                onClick={() => {
                  leaveSession();
                  onClose();
                }}
                className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  sessionState.isHost
                    ? 'bg-surface hover:bg-theme-hover border border-theme-subtle text-theme-muted'
                    : 'bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave Session</span>
              </button>

              {/* Host-only: End the session for all connected peers */}
              {sessionState.isHost && endSessionForAll && (
                <button
                  onClick={() => setShowEndConfirm(true)}
                  className="px-3.5 py-2 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-700/60 text-red-300 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>End Session for All</span>
                </button>
              )}
            </div>

            {/* ── End-Session Confirmation Overlay ── */}
            {showEndConfirm && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-[#1a1a1a] border border-red-800/60 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-950/60 border border-red-800/50">
                      <XCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">End Session for Everyone?</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">This cannot be undone.</p>
                    </div>
                  </div>
                  <p className="text-[12px] text-gray-300 leading-relaxed">
                    As the{' '}
                    <span className="text-amber-400 font-semibold">Host</span>, ending the session
                    will immediately disconnect all connected peers. They will see a termination
                    notice and be returned to standalone mode.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => setShowEndConfirm(false)}
                      className="flex-1 py-2 rounded-lg bg-surface hover:bg-theme-hover border border-theme-subtle text-theme-main text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmEndSession}
                      className="flex-1 py-2 rounded-lg bg-red-800 hover:bg-red-700 border border-red-600 text-white text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Yes, End for All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* ── Disconnected State – Start or Join ── */
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

            {/* ── Join by URL input ── */}
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
