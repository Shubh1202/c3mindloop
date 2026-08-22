'use client';

import React, { useRef, useState, useCallback } from 'react';
import { X, GripVertical } from 'lucide-react';
import type { Overlay, FormField } from '../editor/editor.types';

interface Props {
  selectedOverlay: Overlay | null;
  formFields: FormField[];
  onUpdateOverlay: (id: string, patch: Partial<Overlay>) => void;
  onUpdateOverlaySilent: (id: string, patch: Partial<Overlay>) => void;
  onCaptureSnapshot: (id: string) => void;
  onUpdateFormField: (name: string, value: string) => void;
  onClose: () => void;
}

export const PdfEditorProperties: React.FC<Props> = ({
  selectedOverlay, formFields,
  onUpdateOverlay, onUpdateOverlaySilent, onCaptureSnapshot,
  onUpdateFormField, onClose,
}) => {
  // ── Drag state ─────────────────────────────────────────────────────────────
  const panelRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ x: number; y: number } | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const onDragStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const onMove = (ev: PointerEvent) => {
      if (!dragOffset.current) return;
      setPos({
        x: ev.clientX - dragOffset.current.x,
        y: ev.clientY - dragOffset.current.y,
      });
    };
    const onUp = () => {
      dragOffset.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, []);

  if (!selectedOverlay) return null;

  const kindLabel =
    selectedOverlay.kind === 'text' ? 'Text'
    : selectedOverlay.kind === 'whiteout' ? 'Whiteout'
    : selectedOverlay.kind === 'signature' ? 'Signature'
    : 'Image';

  return (
    <div
      ref={panelRef}
      style={pos ? { position: 'fixed', left: pos.x, top: pos.y, bottom: 'auto', right: 'auto' } : {}}
      className="w-56 bg-neutral-900/95 backdrop-blur-md border border-neutral-700 rounded-xl shadow-2xl overflow-hidden select-none"
    >
      {/* ── Header / drag handle ─────────────────────────────────────────── */}
      <div
        onPointerDown={onDragStart}
        className="flex items-center justify-between px-3 py-2 bg-neutral-800/80 border-b border-neutral-700 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-1.5">
          <GripVertical className="w-3 h-3 text-neutral-500" />
          <span className="text-[10px] font-mono font-semibold text-neutral-300 uppercase tracking-wider">
            {kindLabel}
          </span>
        </div>
        <button
          onClick={onClose}
          title="Deselect (Esc)"
          className="p-0.5 rounded hover:bg-neutral-700 text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">

        {/* Text controls */}
        {selectedOverlay.kind === 'text' && (
          <>
            <Field label="Content">
              <input
                type="text"
                value={selectedOverlay.text}
                onChange={e => onUpdateOverlay(selectedOverlay.id, { text: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Format">
              <div className="flex items-center gap-1">
                <FmtBtn active={!!selectedOverlay.bold} title="Bold" onClick={() => onUpdateOverlay(selectedOverlay.id, { bold: !selectedOverlay.bold })}>B</FmtBtn>
                <FmtBtn active={!!selectedOverlay.italic} title="Italic" extraCls="italic" onClick={() => onUpdateOverlay(selectedOverlay.id, { italic: !selectedOverlay.italic })}>I</FmtBtn>
                <FmtBtn active={!!selectedOverlay.underline} title="Underline" extraCls="underline" onClick={() => onUpdateOverlay(selectedOverlay.id, { underline: !selectedOverlay.underline })}>U</FmtBtn>
              </div>
            </Field>

            <Field label="Font">
              <select
                value={selectedOverlay.fontFamily}
                onChange={e => onUpdateOverlay(selectedOverlay.id, { fontFamily: e.target.value as any })}
                className={inputCls}
              >
                <option value="sans">Sans-serif</option>
                <option value="serif">Serif</option>
                <option value="mono">Monospace</option>
              </select>
            </Field>

            <Field label={`Size — ${selectedOverlay.fontSize}px`}>
              <input
                type="range" min={8} max={72} step={1}
                value={selectedOverlay.fontSize}
                onPointerDown={() => onCaptureSnapshot(selectedOverlay.id)}
                onChange={e => onUpdateOverlaySilent(selectedOverlay.id, { fontSize: parseInt(e.target.value) })}
                className="w-full accent-[#1D9BF0]"
              />
            </Field>

            <Field label="Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedOverlay.color}
                  onChange={e => onUpdateOverlay(selectedOverlay.id, { color: e.target.value })}
                  className="w-8 h-6 rounded border border-neutral-700 cursor-pointer bg-transparent shrink-0"
                />
                <span className="text-neutral-500 text-[10px] font-mono">{selectedOverlay.color}</span>
              </div>
            </Field>

            <Field label={`Opacity — ${Math.round(selectedOverlay.opacity * 100)}%`}>
              <input
                type="range" min={0.1} max={1} step={0.05}
                value={selectedOverlay.opacity}
                onPointerDown={() => onCaptureSnapshot(selectedOverlay.id)}
                onChange={e => onUpdateOverlaySilent(selectedOverlay.id, { opacity: parseFloat(e.target.value) })}
                className="w-full accent-[#1D9BF0]"
              />
            </Field>
          </>
        )}

        {/* Whiteout controls */}
        {selectedOverlay.kind === 'whiteout' && (
          <>
            <Field label="Replace with">
              <input
                type="text"
                placeholder="Replacement text..."
                value={selectedOverlay.replacementText ?? ''}
                onChange={e => onUpdateOverlay(selectedOverlay.id, { replacementText: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Font">
              <select
                value={selectedOverlay.replacementFontFamily ?? 'sans'}
                onChange={e => onUpdateOverlay(selectedOverlay.id, { replacementFontFamily: e.target.value as any })}
                className={inputCls}
              >
                <option value="sans">Sans-serif</option>
                <option value="serif">Serif</option>
                <option value="mono">Monospace</option>
              </select>
            </Field>

            <Field label={`Size — ${selectedOverlay.replacementFontSize ?? 12}px`}>
              <input
                type="range" min={8} max={48} step={1}
                value={selectedOverlay.replacementFontSize ?? 12}
                onPointerDown={() => onCaptureSnapshot(selectedOverlay.id)}
                onChange={e => onUpdateOverlaySilent(selectedOverlay.id, { replacementFontSize: parseInt(e.target.value) })}
                className="w-full accent-[#1D9BF0]"
              />
            </Field>

            <Field label="Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedOverlay.replacementColor ?? '#000000'}
                  onChange={e => onUpdateOverlay(selectedOverlay.id, { replacementColor: e.target.value })}
                  className="w-8 h-6 rounded border border-neutral-700 cursor-pointer bg-transparent shrink-0"
                />
                <span className="text-neutral-500 text-[10px] font-mono">{selectedOverlay.replacementColor ?? '#000000'}</span>
              </div>
            </Field>
          </>
        )}

        {/* Image / Signature controls */}
        {(selectedOverlay.kind === 'image' || selectedOverlay.kind === 'signature') && (
          <Field label={`Opacity — ${Math.round(selectedOverlay.opacity * 100)}%`}>
            <input
              type="range" min={0.1} max={1} step={0.05}
              value={selectedOverlay.opacity}
              onPointerDown={() => onCaptureSnapshot(selectedOverlay.id)}
              onChange={e => onUpdateOverlaySilent(selectedOverlay.id, { opacity: parseFloat(e.target.value) })}
              className="w-full accent-[#1D9BF0]"
            />
          </Field>
        )}

        {/* AcroForm fields */}
        {formFields.length > 0 && (
          <div className="border-t border-neutral-800 pt-3 space-y-3">
            <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">Form Fields</p>
            {formFields.map(field => (
              <Field key={field.name} label={field.name}>
                {field.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    checked={field.value === 'true'}
                    onChange={e => onUpdateFormField(field.name, String(e.target.checked))}
                    className="accent-[#1D9BF0] w-3.5 h-3.5"
                  />
                ) : field.type === 'dropdown' && field.options ? (
                  <select
                    value={field.value}
                    onChange={e => onUpdateFormField(field.name, e.target.value)}
                    className={inputCls}
                  >
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={field.value}
                    onChange={e => onUpdateFormField(field.name, e.target.value)}
                    className={inputCls}
                  />
                )}
              </Field>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer hint ──────────────────────────────────────────────────── */}
      <div className="px-3 py-1.5 border-t border-neutral-800 bg-neutral-950/60">
        <p className="text-[9px] font-mono text-neutral-600">Press Esc or click × to deselect</p>
      </div>
    </div>
  );
};

// ── Shared helpers ────────────────────────────────────────────────────────────

const inputCls =
  'w-full px-2 py-1 rounded bg-neutral-950 border border-neutral-800 focus:border-[#1D9BF0] focus:outline-none text-neutral-200 text-[10px] font-mono transition-colors';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1">
    <label className="text-[9px] uppercase tracking-wider text-neutral-500 block font-mono">{label}</label>
    {children}
  </div>
);

const FmtBtn: React.FC<{
  active: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  extraCls?: string;
}> = ({ active, title, onClick, children, extraCls = '' }) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold cursor-pointer transition-colors ${extraCls} ${
      active
        ? 'bg-[#1D9BF0] text-white'
        : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
    }`}
  >
    {children}
  </button>
);