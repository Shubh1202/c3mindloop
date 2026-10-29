'use client';

import React, { useState } from 'react';
import { CollabSessionState } from '@/app/lib/collaboration/types';
import { Users, Copy, Check, LogOut, XCircle, AlertTriangle, X } from 'lucide-react';

interface CollabActiveBannerProps {
  sessionState: CollabSessionState;
  leaveSession: () => void;
  endSessionForAll?: () => void;
  onOpenModal?: () => void;
  isDark?: boolean;
  onDismissError?: () => void;
}

export const CollabActiveBanner: React.FC<CollabActiveBannerProps> = ({
  sessionState,
  leaveSession,
  endSessionForAll,
  onOpenModal,
  isDark = true,
  onDismissError,
}) => {
  const [copied, setCopied] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);

  // If there is an active error and the user is not collaborating, show a visible error banner
  if (!sessionState.isCollaborating) {
    if (sessionState.error && !errorDismissed) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className={`w-full border-b text-xs transition-colors px-3 py-2 flex items-center justify-between gap-2.5 ${
            isDark
              ? 'bg-red-950/50 border-red-800/60 text-red-300'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <XCircle className="w-4 h-4 shrink-0 text-red-500" aria-hidden="true" />
            <span className="font-mono text-[11px] truncate">{sessionState.error}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setErrorDismissed(true);
                onDismissError?.();
              }}
              aria-label="Dismiss error notification"
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer border ${
                isDark
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                  : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-300'
              }`}
            >
              Dismiss
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  const hasPeers = sessionState.peerCount > 1;
  const isHost = sessionState.isHost;

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    const url = sessionState.shareableUrl || window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenDetails = () => {
    if (onOpenModal) {
      onOpenModal();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('collab:open-modal'));
    }
  };

  return (
    <div
      role="region"
      aria-label="Active collaboration session status bar"
      className={`w-full border-b text-xs transition-colors ${
        isDark
          ? 'bg-neutral-900/95 border-neutral-800 text-neutral-200'
          : 'bg-neutral-50/95 border-neutral-200 text-neutral-800'
      }`}
    >
      <div className="px-3 py-2 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Status & Room details */}
        <div className="flex items-center flex-wrap gap-2 min-w-0">
          {hasPeers ? (
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border ${
                isDark
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span>Live Collaboration ({sessionState.peerCount} connected)</span>
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border ${
                isDark
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" aria-hidden="true" />
              <span>Session Active • Waiting for peers (1 participant)</span>
            </span>
          )}

          <span
            className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
              isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200 text-neutral-800'
            }`}
          >
            {isHost ? 'Role: Host' : 'Role: Participant'}
          </span>

          {sessionState.roomId && (
            <span
              className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 truncate max-w-[140px] sm:max-w-[200px]"
              title={sessionState.roomId}
            >
              Room: {sessionState.roomId.slice(0, 10)}...
            </span>
          )}
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center flex-wrap gap-1.5 shrink-0 ml-auto">
          <button
            type="button"
            onClick={handleCopyLink}
            aria-label="Copy invitation link"
            className={`px-2 py-1 rounded text-xs font-mono font-medium flex items-center gap-1 transition-colors cursor-pointer border ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-500'
                : isDark
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300 shadow-xs'
            }`}
          >
            {copied ? (
              <Check className="w-3 h-3 text-white" aria-hidden="true" />
            ) : (
              <Copy className="w-3 h-3 text-neutral-400" aria-hidden="true" />
            )}
            <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenDetails}
            aria-label="Open session details and participant settings"
            className={`px-2 py-1 rounded text-xs font-mono font-medium flex items-center gap-1 transition-colors cursor-pointer border ${
              isDark
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-300'
            }`}
          >
            <Users className="w-3 h-3" aria-hidden="true" />
            <span className="hidden sm:inline">Details</span>
          </button>

          {isHost && endSessionForAll ? (
            <>
              <button
                type="button"
                onClick={leaveSession}
                title="Leave room (session stays open for other peers)"
                aria-label="Leave room"
                className={`px-2 py-1 rounded text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer border ${
                  isDark
                    ? 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                    : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-300'
                }`}
              >
                <LogOut className="w-3 h-3" aria-hidden="true" />
                <span className="hidden md:inline">Leave</span>
              </button>

              <button
                type="button"
                onClick={endSessionForAll}
                title="End session for all participants"
                aria-label="End session for all participants"
                className="px-2 py-1 rounded text-xs font-mono font-medium flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer shadow-xs"
              >
                <XCircle className="w-3 h-3" aria-hidden="true" />
                <span>End for All</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={leaveSession}
              aria-label="Leave collaboration session"
              className="px-2 py-1 rounded text-xs font-mono font-medium flex items-center gap-1 bg-red-600/90 hover:bg-red-600 text-white transition-colors cursor-pointer shadow-xs"
            >
              <LogOut className="w-3 h-3" aria-hidden="true" />
              <span>Leave</span>
            </button>
          )}
        </div>
      </div>

      {/* Advisory warning bar if peer connection is delayed or restricted */}
      {sessionState.connectionWarning && (
        <div
          role="status"
          aria-live="polite"
          className={`px-3 py-1.5 border-t flex items-center justify-between gap-2 text-[11px] font-sans ${
            isDark
              ? 'bg-amber-950/40 border-amber-800/50 text-amber-300'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" aria-hidden="true" />
            <span className="truncate">{sessionState.connectionWarning}</span>
          </div>
          <button
            type="button"
            onClick={handleOpenDetails}
            className="underline font-medium hover:opacity-80 shrink-0 ml-auto cursor-pointer"
          >
            Troubleshoot
          </button>
        </div>
      )}
    </div>
  );
};
