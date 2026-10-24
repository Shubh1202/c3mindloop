'use client';

/**
 * useCollaborativeText Hook for C³ MindLoop.
 * Binds a React state string and optional HTMLTextAreaElement to a Yjs Y.Text instance.
 * Features:
 * - Deterministic room initialization (joiners wait for remote document, preventing overwriting)
 * - Prefix/suffix diffing for character-level operational transforms
 * - Cursor preservation against remote incoming edits
 * - Robust echo suppression that handles React async render cycles
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
  const lastRemoteTextRef = useRef<string | null>(null);
  const hasSyncedRef = useRef(isHost);
  const initializedRef = useRef(false);

  // When session starts, host is immediately considered synced; joiners wait.
  useEffect(() => {
    hasSyncedRef.current = isHost;
    initializedRef.current = false;
  }, [isHost, ydoc]);

  // Main synchronization effect
  useEffect(() => {
    if (!enabled || !ydoc) {
      initializedRef.current = false;
      hasSyncedRef.current = isHost;
      return;
    }

    const ytext = ydoc.getText(field);

    // 1. Initial State Negotiation Policy
    if (!initializedRef.current) {
      initializedRef.current = true;
      const remoteText = ytext.toString();

      if (remoteText.length > 0) {
        // Document already exists on Y.Doc (e.g. from cached peers)
        hasSyncedRef.current = true;
        lastRemoteTextRef.current = remoteText;
        onChange(remoteText);
      } else if (isHost && value.length > 0) {
        // We are the host creating the room -> initialize with local text
        hasSyncedRef.current = true;
        lastRemoteTextRef.current = value;
        ydoc.transact(() => {
          ytext.insert(0, value);
        }, 'local-init');
      }
    }

    // 2. Listen for remote Y.Text changes
    const observer = (event: Y.YTextEvent, transaction: Y.Transaction) => {
      // Ignore transactions originated by our own local hook
      if (transaction.origin === 'local-user' || transaction.origin === 'local-init') {
        return;
      }

      const updatedText = ytext.toString();

      // Mark that initial remote sync has arrived
      hasSyncedRef.current = true;

      // Track cursor position prior to applying remote update
      const textarea = textareaRef?.current;
      let prevSelStart = textarea ? textarea.selectionStart : null;
      let prevSelEnd = textarea ? textarea.selectionEnd : null;

      // Calculate cursor offset adjustment based on delta location
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

      // Record this remote text to prevent echo in Effect 3
      lastRemoteTextRef.current = updatedText;
      onChange(updatedText);

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
    };
  }, [enabled, ydoc, field, isHost, onChange, textareaRef, value]);

  // 3. Push local changes to Y.Text using minimal character-level diffing
  useEffect(() => {
    if (!enabled || !ydoc) {
      return;
    }

    // If joiner hasn't received remote document yet, do NOT push local default text!
    if (!hasSyncedRef.current) {
      const ytext = ydoc.getText(field);
      if (ytext.length > 0) {
        // Document arrived
        hasSyncedRef.current = true;
        const remoteText = ytext.toString();
        lastRemoteTextRef.current = remoteText;
        onChange(remoteText);
      }
      return;
    }

    // Echo suppression: if value matches what remote just told us, do not push back
    if (value === lastRemoteTextRef.current) {
      return;
    }

    const ytext = ydoc.getText(field);
    const currentYText = ytext.toString();

    if (currentYText === value) {
      return;
    }

    const { index, deleteCount, insertText } = computeStringDiff(currentYText, value);

    if (deleteCount > 0 || insertText.length > 0) {
      lastRemoteTextRef.current = value;
      ydoc.transact(() => {
        if (deleteCount > 0) {
          ytext.delete(index, deleteCount);
        }
        if (insertText.length > 0) {
          ytext.insert(index, insertText);
        }
      }, 'local-user');
    }
  }, [enabled, ydoc, field, value, onChange]);
}
