'use client';

import React from 'react';
import type { Overlay, FormField } from '../editor/editor.types';
import { FONT_CSS } from '../editor/editor.utils';

interface Props {
  selectedOverlay: Overlay | null;
  formFields: FormField[];
  onUpdateOverlay: (id: string, patch: Partial<Overlay>) => void;
  onUpdateOverlaySilent: (id: string, patch: Partial<Overlay>) => void;
  onCaptureSnapshot: (id: string) => void;
  onUpdateFormField: (name: string, value: string) => void;
}

export const PdfEditorProperties: React.FC<Props> = ({
  selectedOverlay, formFields, onUpdateOverlay, onUpdateOverlaySilent, onCaptureSnapshot, onUpdateFormField,
}) => {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-3 h-full text-xs font-mono">

      {/* Selected overlay properties */}
      {selectedOverlay ? (
        <section className="space-y-3">
          <p className="text-[9px] uppercase tracking-wider text-neutral-500">
            {selectedOverlay.kind === 'text' ? 'Text Properties'
              : selectedOverlay.kind === 'whiteout' ? 'Whiteout Properties'
              : 'Image Properties'}
          </p>

          {selectedOverlay.kind === 'text' && (
            <>
              <Field label="Text">
                <input
                  type="text"
                  value={selectedOverlay.text}
                  onChange={e => onUpdateOverlay(selectedOverlay.id, { text: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Format">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateOverlay(selectedOverlay.id, { bold: !selectedOverlay.bold })}
                    title="Bold"
                    className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold cursor-pointer transition-colors ${
                      selectedOverlay.bold
                        ? 'bg-[#1D9BF0] text-white'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                    }`}
                  >B</button>
                  <button
                    onClick={() => onUpdateOverlay(selectedOverlay.id, { italic: !selectedOverlay.italic })}
                    title="Italic"
                    className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold italic cursor-pointer transition-colors ${
                      selectedOverlay.italic
                        ? 'bg-[#1D9BF0] text-white'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                    }`}
                  >I</button>
                  <button
                    onClick={() => onUpdateOverlay(selectedOverlay.id, { underline: !selectedOverlay.underline })}
                    title="Underline"
                    className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold underline cursor-pointer transition-colors ${
                      selectedOverlay.underline
                        ? 'bg-[#1D9BF0] text-white'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                    }`}
                  >U</button>
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
              <Field label="Size">
                <div className="flex items-center gap-2">
                  <input
                    type="range" min={8} max={72} step={1}
                    value={selectedOverlay.fontSize}
                    onPointerDown={() => onCaptureSnapshot(selectedOverlay.id)}
                    onChange={e => onUpdateOverlaySilent(selectedOverlay.id, { fontSize: parseInt(e.target.value) })}
                    className="flex-1 accent-[#1D9BF0]"
                  />
                  <span className="text-neutral-300 w-6 text-right">{selectedOverlay.fontSize}</span>
                </div>
              </Field>
              <Field label="Color">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedOverlay.color}
                    onChange={e => onUpdateOverlay(selectedOverlay.id, { color: e.target.value })}
                    className="w-8 h-6 rounded border border-neutral-700 cursor-pointer bg-transparent"
                  />
                  <span className="text-neutral-400">{selectedOverlay.color}</span>
                </div>
              </Field>
              <Field label="Opacity">
                <div className="flex items-center gap-2">
                  <input
                    type="range" min={0.1} max={1} step={0.05}
                    value={selectedOverlay.opacity}
                    onPointerDown={() => onCaptureSnapshot(selectedOverlay.id)}
                    onChange={e => onUpdateOverlaySilent(selectedOverlay.id, { opacity: parseFloat(e.target.value) })}
                    className="flex-1 accent-[#1D9BF0]"
                  />
                  <span className="text-neutral-300 w-8 text-right">{Math.round(selectedOverlay.opacity * 100)}%</span>
                </div>
              </Field>
            </>
          )}

          {selectedOverlay.kind === 'whiteout' && (
            <>
              <Field label="Replace with">
                <input
                  type="text"
                  placeholder="Replacement text…"
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
              <Field label="Size">
                <div className="flex items-center gap-2">
                  <input
                    type="range" min={8} max={48} step={1}
                    value={selectedOverlay.replacementFontSize ?? 12}
                    onPointerDown={() => onCaptureSnapshot(selectedOverlay.id)}
                    onChange={e => onUpdateOverlaySilent(selectedOverlay.id, { replacementFontSize: parseInt(e.target.value) })}
                    className="flex-1 accent-[#1D9BF0]"
                  />
                  <span className="text-neutral-300 w-6 text-right">{selectedOverlay.replacementFontSize ?? 12}</span>
                </div>
              </Field>
              <Field label="Color">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedOverlay.replacementColor ?? '#000000'}
                    onChange={e => onUpdateOverlay(selectedOverlay.id, { replacementColor: e.target.value })}
                    className="w-8 h-6 rounded border border-neutral-700 cursor-pointer bg-transparent"
                  />
                  <span className="text-neutral-400">{selectedOverlay.replacementColor ?? '#000000'}</span>
                </div>
              </Field>
            </>
          )}

          {(selectedOverlay.kind === 'image' || selectedOverlay.kind === 'signature') && (
            <Field label="Opacity">
              <div className="flex items-center gap-2">
                <input
                  type="range" min={0.1} max={1} step={0.05}
                  value={selectedOverlay.opacity}
                  onPointerDown={() => onCaptureSnapshot(selectedOverlay.id)}
                  onChange={e => onUpdateOverlaySilent(selectedOverlay.id, { opacity: parseFloat(e.target.value) })}
                  className="flex-1 accent-[#1D9BF0]"
                />
                <span className="text-neutral-300 w-8 text-right">{Math.round(selectedOverlay.opacity * 100)}%</span>
              </div>
            </Field>
          )}
        </section>
      ) : (
        <p className="text-[10px] text-neutral-600 italic">Select an element to edit its properties.</p>
      )}

      {/* AcroForm fields */}
      {formFields.length > 0 && (
        <section className="space-y-3 border-t border-neutral-800 pt-3">
          <p className="text-[9px] uppercase tracking-wider text-neutral-500">Form Fields ({formFields.length})</p>
          {formFields.map(field => (
            <Field key={field.name} label={field.name}>
              {field.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  checked={field.value === 'true'}
                  onChange={e => onUpdateFormField(field.name, String(e.target.checked))}
                  className="accent-[#1D9BF0]"
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
        </section>
      )}
    </div>
  );
};

const inputCls = 'w-full px-2 py-1 rounded bg-neutral-950 border border-neutral-800 focus:border-[#1D9BF0] focus:outline-none text-neutral-200 text-[10px] font-mono';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1">
    <label className="text-[9px] uppercase tracking-wider text-neutral-500 block">{label}</label>
    {children}
  </div>
);
