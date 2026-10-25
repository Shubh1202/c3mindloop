'use client';

/**
 * useCollaborativeText Hook for C³ MindLoop.
 * Binds a React state string and optional HTMLTextAreaElement to a Yjs Y.Text instance.
 *
 * Architecture decisions for high-performance zero-conflict collaboration:
 * ──────────────────────────────────────────────────────────────────────────
 * 1. UNIDIRECTIONAL MUTEX (`isApplyingRemoteRef`)
 *    When the observer receives a remote Y.Text change and calls `onChange(text)`,
 *    React queues a state update for `value`. The mutex prevents the local push
 *    effect from mistaking this incoming remote update for a local keystroke.
 *    Reset happens cleanly via `requestAnimationFrame` to span the React commit phase.
 *
 * 2. STRICT SEPARATION OF CONCERNS
 *    - Observer handles Remote → React State (never pushes to Y.Doc).
 *    - Push Effect handles Local Keystrokes → Y.Doc (never calls setState/onChange).
 *    This separation structurally guarantees NO infinite loops and NO "Maximum update depth exceeded".
 *
 * 3. REQUEST ANIMATION FRAME COALESCING
 *    Local typing events are coalesced within one animation frame (~16ms)
 *    before calculating character diffs and creating Yjs transactions.
 *    This prevents main thread saturation during rapid typing or large diffs,
 *    eliminating Chrome's "Page Unresponsive" freeze.
 *
 * 4. JOINER SAFE-GUARD
 *    Joiners do not push their un-synced initial template value until remote
 *    sync is established, or unless the user explicitly starts typing.
 */

import { useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { UseCollaborativeTextProps } from '../types';

/**
 * Computes the minimal prefix/suffix difference between two strings.
 */
export function computeStringDiff(
  oldStr: string,
  newStr: string
): { index: number; deleteCount: number; insertText: string } {
  const oldLen = oldStr.length;
  const newLen = newStr.length;

  let prefix = 0;
  while (
    prefix < oldLen &&
    prefix < newLen &&
    oldStr.charCodeAt(prefix) === newStr.charCodeAt(prefix)
  ) {
    prefix++;
  }

  let oldSuffix = oldLen;
  let newSuffix = newLen;
  while (
    oldSuffix > prefix &&
    newSuffix > prefix &&
    oldStr.charCodeAt(oldSuffix - 1) === newStr.charCodeAt(newSuffix - 1)
  ) {
    oldSuffix--;
    newSuffix--;
  }

  const deleteCount = oldSuffix - prefix;
  const insertText = newStr.slice(prefix, newSuffix);

  return { index: prefix, deleteCount, insertText };
}

export function useCollaborativeText({
  ydoc,
  field = 'content',
  value,
  onChange,
  enabled,
  isHost = false,
  textareaRef,
}: UseCollaborativeTextProps) {
  // ── Synchronization State Refs ─────────────────────────────────────────────

  // The last text string that was synchronized with Y.Doc (remote or local).
  const lastSyncedTextRef = useRef<string | null>(null);

  // Mutex flag: true when React is rendering an update that originated from a remote peer.
  const isApplyingRemoteRef = useRef(false);

  // Tracks if initial remote sync has completed.
  const hasSyncedRef = useRef(isHost);

  // Tracks the initial local value on mount / session start.
  const initialValueRef = useRef(value);

  // Handle for rAF-throttled local push.
  const localPushRafRef = useRef<number | null>(null);

  // Stable ref to the latest `value` for rAF callback.
  const valueRef = useRef(value);
  valueRef.current = value;

  // Stable ref to `onChange` callback.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // ── Effect 1: Session Lifecycle & Remote Y.Text Observer ───────────────────
  useEffect(() => {
    if (!enabled || !ydoc) {
      hasSyncedRef.current = isHost;
      lastSyncedTextRef.current = null;
      isApplyingRemoteRef.current = false;
      return;
    }

    const ytext = ydoc.getText(field);
    initialValueRef.current = valueRef.current;
    hasSyncedRef.current = isHost;

    // ── Initial State Negotiation ──
    const currentYText = ytext.toString();
    if (currentYText.length > 0) {
      // Document already exists in Y.Doc (cached or existing)
      hasSyncedRef.current = true;
      lastSyncedTextRef.current = currentYText;
      isApplyingRemoteRef.current = true;
      onChangeRef.current(currentYText);
      requestAnimationFrame(() => {
        isApplyingRemoteRef.current = false;
      });
    } else if (isHost && valueRef.current.length > 0) {
      // Host seeding the Y.Doc with initial local text
      hasSyncedRef.current = true;
      lastSyncedTextRef.current = valueRef.current;
      ydoc.transact(() => {
        ytext.insert(0, valueRef.current);
      }, 'local-init');
    }

    // ── Remote Y.Text Observer ──
    const observer = (event: Y.YTextEvent, transaction: Y.Transaction) => {
      // Ignore transactions originated by our own local hook
      if (
        transaction.origin === 'local-user' ||
        transaction.origin === 'local-init'
      ) {
        return;
      }

      const updatedText = ytext.toString();

      // Skip if already in sync
      if (updatedText === lastSyncedTextRef.current) {
        return;
      }

      hasSyncedRef.current = true;

      // ── Cursor preservation ──
      const textarea = textareaRef?.current;
      let prevSelStart = textarea ? textarea.selectionStart : null;
      let prevSelEnd = textarea ? textarea.selectionEnd : null;

      if (prevSelStart !== null && prevSelEnd !== null) {
        let deltaOffset = 0;
        event.delta.forEach((deltaItem) => {
          if (deltaItem.retain) {
            deltaOffset += deltaItem.retain;
          }
          if (deltaItem.delete && deltaOffset < prevSelStart!) {
            const shift = Math.min(deltaItem.delete, prevSelStart! - deltaOffset);
            prevSelStart! -= shift;
            prevSelEnd! -= shift;
          }
          if (deltaItem.insert && deltaOffset <= prevSelStart!) {
            const insertLen =
              typeof deltaItem.insert === 'string' ? deltaItem.insert.length : 1;
            prevSelStart! += insertLen;
            prevSelEnd! += insertLen;
          }
        });
      }

      // ── Apply remote text to React state ──
      lastSyncedTextRef.current = updatedText;
      isApplyingRemoteRef.current = true;
      onChangeRef.current(updatedText);

      // Release mutex after next frame has painted
      requestAnimationFrame(() => {
        isApplyingRemoteRef.current = false;
      });

      // Restore cursor position on next animation frame
      if (textarea && prevSelStart !== null && prevSelEnd !== null) {
        requestAnimationFrame(() => {
          if (document.activeElement === textarea) {
            textarea.setSelectionRange(prevSelStart, prevSelEnd);
          }
        });
      }
    };

    ytext.observe(observer);

    return () => {
      ytext.unobserve(observer);
      if (localPushRafRef.current !== null) {
        cancelAnimationFrame(localPushRafRef.current);
        localPushRafRef.current = null;
      }
    };
  }, [enabled, ydoc, field, isHost, textareaRef]);

  // ── Effect 2: Push Local Changes → Y.Doc (rAF-throttled) ───────────────────
  useEffect(() => {
    if (!enabled || !ydoc) {
      return;
    }

    // Guard 1: Skip if this render was triggered by applying remote text
    if (isApplyingRemoteRef.current) {
      return;
    }

    // Guard 2: Skip if value is already what we synced last
    if (value === lastSyncedTextRef.current) {
      return;
    }

    // Guard 3: For joiners waiting for initial remote sync, do not push
    // untouched initial template text. But if user modified it, allow push.
    if (!hasSyncedRef.current) {
      if (value === initialValueRef.current) {
        return;
      }
      hasSyncedRef.current = true;
    }

    // Cancel previously scheduled push to coalesce rapid keystrokes (~16ms)
    if (localPushRafRef.current !== null) {
      cancelAnimationFrame(localPushRafRef.current);
    }

    localPushRafRef.current = requestAnimationFrame(() => {
      localPushRafRef.current = null;

      if (!ydoc || isApplyingRemoteRef.current) return;

      const currentValue = valueRef.current;
      const ytext = ydoc.getText(field);
      const currentYText = ytext.toString();

      // Already identical → record and exit
      if (currentYText === currentValue) {
        lastSyncedTextRef.current = currentValue;
        return;
      }

      const { index, deleteCount, insertText } = computeStringDiff(
        currentYText,
        currentValue
      );

      if (deleteCount > 0 || insertText.length > 0) {
        lastSyncedTextRef.current = currentValue;
        ydoc.transact(() => {
          if (deleteCount > 0) {
            ytext.delete(index, deleteCount);
          }
          if (insertText.length > 0) {
            ytext.insert(index, insertText);
          }
        }, 'local-user');
      }
    });
  }, [enabled, ydoc, field, value]);
}
