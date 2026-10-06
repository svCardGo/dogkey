import React, { useEffect, useRef } from 'react';

interface GlassDialogProps {
  open: boolean;
  title: string;
  subtitle?: string;
  value?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  maxLength?: number;
  inputType?: 'text' | 'password' | 'number';
  onConfirm: (value: string) => void;
  onCancel: () => void;
  choices?: { label: string; value: string }[];
}

export function GlassDialog({
  open,
  title,
  subtitle,
  value = '',
  placeholder = '',
  confirmLabel = 'Save',
  cancelLabel = 'Cancel',
  maxLength,
  inputType = 'text',
  onConfirm,
  onCancel,
  choices,
}: GlassDialogProps) {
  const [text, setText] = React.useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setText(value);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open, value]);

  if (!open) return null;

  return (
    <div
      className="glass-dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="glass-dialog" role="dialog" aria-modal="true">
        <div className="glass-dialog-title">{title}</div>
        {subtitle && <div className="glass-dialog-sub">{subtitle}</div>}
        {choices ? (
          <div className="glass-dialog-choices">
            {choices.map((c) => (
              <button
                key={c.value}
                type="button"
                className="glass-dialog-choice"
                onClick={() => onConfirm(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        ) : (
          <input
            ref={inputRef}
            className="glass-input"
            type={inputType}
            value={text}
            maxLength={maxLength}
            placeholder={placeholder}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && text.trim()) onConfirm(text.trim());
              if (e.key === 'Escape') onCancel();
            }}
          />
        )}
        {!choices && (
          <div className="glass-dialog-actions">
            <button type="button" className="glass-button secondary" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button
              type="button"
              className="glass-button"
              onClick={() => onConfirm(text.trim())}
              disabled={!text.trim()}
            >
              {confirmLabel}
            </button>
          </div>
        )}
        {choices && (
          <button type="button" className="glass-button secondary" style={{ width: '100%', marginTop: 12 }} onClick={onCancel}>
            {cancelLabel}
          </button>
        )}
      </div>
    </div>
  );
}
