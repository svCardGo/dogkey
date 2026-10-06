/** DogKey brand mark — text only, no dog/animal/key graphics */
import React from 'react';

interface DogLogoProps {
  size?: number | string;
  className?: string;
  variant?: 'mark' | 'profile';
  color?: string;
}

/** Renders a simple circular "DK" text mark — never a dog drawing */
export function DogLogo({
  size = 48,
  className = '',
  color = 'var(--green, #2d9f6f)',
}: DogLogoProps) {
  const s = typeof size === 'number' ? size : 48;
  return (
    <div
      className={className}
      style={{
        width: s,
        height: s,
        borderRadius: '50%',
        background: 'var(--green-soft, #e8f6ef)',
        color: color,
        border: '1.5px solid var(--border, #e5e7e5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: s * 0.32,
        fontFamily: "'Inter', system-ui, sans-serif",
        letterSpacing: '-0.02em',
        flexShrink: 0,
      }}
      aria-label="DogKey"
      role="img"
    >
      DK
    </div>
  );
}

export function DogLogoWordmark({
  size = 28,
  color = 'var(--text, #000)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <DogLogo size={size} color="var(--green, #2d9f6f)" />
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: size * 0.72,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color,
        }}
      >
        DogKey
      </span>
    </div>
  );
}
