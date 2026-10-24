'use client';

/**
 * useCollaborativeText Hook for C³ MindLoop.
 * Binds a React state string and optional HTMLTextAreaElement to a Yjs Y.Text instance.
 *
 * Architecture decisions to prevent "Page Unresponsive":
 * ─────────────────────────────────────────────────────
 * 1. INGESTION MUTEX (`isIngestingRemoteRef`)
 *    When the observer receives a remote Y.Text change and calls `onChange(text)`,
 *    React queues a state update for `value`. On the next render, Effect 3 would see
 *    `value !== lastSyncedTextRef.current` (because React batching hasn't settled yet)
 *    and would push a DIFF back into Y.Doc → broadcast → other peer repeats → ∞ loop.
 *    The mutex blocks Effect 3 from running during this transient period.
 *
 * 2. requestAnimationFrame THROTTLING
 *    Local keystrokes fire `value` changes synchronously. Without throttling, every
 *    keystroke computes a string diff and creates a Yjs transaction immediately.
 *    Under fast typing or collaboration churn, this saturates the main thread.
 *    We coalesce diffs into one rAF callback (~16ms) so the browser can paint.
 *
 * 3. DUAL ECHO SUPPRESSION
 *    Both `lastSyncedTextRef` (string equality) and `isIngestingRemoteRef` (mutex)
 *    are checked before pushing. The ref covers the steady-state case; the mutex
 *    covers the transient React-batching window.
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
  // ── Refs for echo suppression ──────────────────────────────────────────────

  // The last text value we synchronised (received from remote OR pushed locally).
  // If React's `value` matches this, there is nothing new to push.
  const lastSyncedTextRef = useRef<string | null>(null);

  // Ingestion mutex. TRUE while we are funnelling a remote update into React
  // via `onChange()`. While true, Effect 3 (local push) MUST be a no-op.
  const isIngestingRemoteRef = useRef(false);

  // Whether the initial remote document has been received.
  // Joiners wait for this before pushing any local state to avoid overwriting.
  const hasSyncedRef = useRef(isHost);
  const initializedRef = useRef(false);

  // Handle for the rAF-throttled local push. Cancelled on cleanup or re-schedule.
  const localPushRafRef = useRef<number | null>(null);

  // Stable ref to the latest `value` for use inside the rAF callback,
  // which may fire after React has already re-rendered with a newer value.
  const valueRef = useRef(value);
  valueRef.current = value;

  // When a new session begins, reset sync flags.
  useEffect(() => {
    hasSyncedRef.current = isHost;
    initializedRef.current = false;
  }, [isHost, ydoc]);

  // ── Effect 1 & 2: Initialisation + Remote Observer ─────────────────────────
  useEffect(() => {
    if (!enabled || !ydoc) {
      initializedRef.current = false;
      hasSyncedRef.current = isHost;
      return;
    }

    const ytext = ydoc.getText(field);

    // ── 1. Initial State Negotiation ──
    if (!initializedRef.current) {
      initializedRef.current = true;
      const remoteText = ytext.toString();

      if (remoteText.length > 0) {
        // Document already present in Y.Doc (cached from peers)
        hasSyncedRef.current = true;
        lastSyncedTextRef.current = remoteText;
        isIngestingRemoteRef.current = true;
        onChange(remoteText);
        // Release mutex after React processes the setState microtask.
        queueMicrotask(() => { isIngestingRemoteRef.current = false; });
      } else if (isHost && value.length > 0) {
        // We are the host → seed the Y.Doc with our local text
        hasSyncedRef.current = true;
        lastSyncedTextRef.current = value;
        ydoc.transact(() => {
          ytext.insert(0, value);
        }, 'local-init');
      }
    }

    // ── 2. Remote Y.Text Observer ──
    const observer = (event: Y.YTextEvent, transaction: Y.Transaction) => {
      // Skip our own local transactions (string-origin check).
      if (
        transaction.origin === 'local-user' ||
        transaction.origin === 'local-init'
      ) {
        return;
      }

      const updatedText = ytext.toString();

      // Mark initial sync complete (for joiners)
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
      // CRITICAL ORDER: set refs BEFORE calling onChange so that if React
      // flushes synchronously (e.g. in a concurrent-mode lane), Effect 3
      // already sees the mutex and the matching lastSyncedTextRef.
      lastSyncedTextRef.current = updatedText;
      isIngestingRemoteRef.current = true;
      onChange(updatedText);

      // Release mutex after the microtask queue drains (covers React batching).
      queueMicrotask(() => {
        isIngestingRemoteRef.current = false;
      });

      // Restore cursor on next paint
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
      // Cancel any pending throttled push
      if (localPushRafRef.current !== null) {
        cancelAnimationFrame(localPushRafRef.current);
        localPushRafRef.current = null;
      }
    };
    // Note: `value` is intentionally excluded from deps here.
    // Including it would tear down and re-attach the observer on every keystroke.
    // Effect 3 handles pushing `value` changes into Y.Doc.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ydoc, field, isHost, onChange, textareaRef]);

  // ── Effect 3: Push local changes → Y.Doc (rAF-throttled) ──────────────────
  useEffect(() => {
    if (!enabled || !ydoc) {
      return;
    }

    // CRITICAL: If we are currently ingesting a remote update, skip.
    // React hasn't settled yet; `value` still reflects the pre-remote state.
    if (isIngestingRemoteRef.current) {
      return;
    }

    // Joiner hasn't synced yet → check if Y.Doc arrived, adopt it, don't push.
    if (!hasSyncedRef.current) {
      const ytext = ydoc.getText(field);
      if (ytext.length > 0) {
        hasSyncedRef.current = true;
        const remoteText = ytext.toString();
        lastSyncedTextRef.current = remoteText;
        isIngestingRemoteRef.current = true;
        onChange(remoteText);
        queueMicrotask(() => { isIngestingRemoteRef.current = false; });
      }
      return;
    }

    // Echo suppression: value matches what was last synced → nothing to push.
    if (value === lastSyncedTextRef.current) {
      return;
    }

    // Cancel any previously scheduled push to coalesce rapid keystrokes.
    if (localPushRafRef.current !== null) {
      cancelAnimationFrame(localPushRafRef.current);
    }

    // Schedule the actual Y.Doc mutation on the next animation frame (~16ms).
    // This prevents synchronous diff computation on every keystroke from
    // blocking the main thread and triggering Chrome's "Page Unresponsive".
    localPushRafRef.current = requestAnimationFrame(() => {
      localPushRafRef.current = null;

      // Re-check guards inside the rAF callback because state may have changed
      // between scheduling and execution.
      if (!ydoc || isIngestingRemoteRef.current) return;

      const currentValue = valueRef.current;
      const ytext = ydoc.getText(field);
      const currentYText = ytext.toString();

      // Already in sync → record and bail
      if (currentYText === currentValue) {
        lastSyncedTextRef.current = currentValue;
        return;
      }

      const { index, deleteCount, insertText } = computeStringDiff(currentYText, currentValue);

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
  }, [enabled, ydoc, field, value, onChange]);
}
