import React from 'react';

interface PinPadProps {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  onComplete?: (pin: string) => void;
}

export function PinPad({ value, onChange, maxLength = 4, onComplete }: PinPadProps) {
  const press = (key: string) => {
    if (key === 'del') {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length >= maxLength) return;
    const next = value + key;
    onChange(next);
    if (next.length === maxLength && onComplete) {
      setTimeout(() => onComplete(next), 150);
    }
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="pin-pad-wrap">
      <div className="pin-dots">
        {Array.from({ length: maxLength }).map((_, i) => (
          <div key={i} className={`pin-dot ${i < value.length ? 'filled' : ''}`} />
        ))}
      </div>
      <div className="pin-pad">
        {keys.map((k, i) =>
          k === '' ? (
            <div key={i} className="pin-key empty" />
          ) : (
            <button
              key={i}
              type="button"
              className="pin-key"
              onClick={() => press(k)}
              aria-label={k === 'del' ? 'Delete' : k}
            >
              {k === 'del' ? '⌫' : k}
            </button>
          )
        )}
      </div>
    </div>
  );
}
