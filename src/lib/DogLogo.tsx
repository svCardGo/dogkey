/**
 * DogKey™ brand mark — TEXT ONLY.
 * No dog · no key · no mascot · no animal imagery.
 * Clean "DK" circle mark for rare icon contexts.
 */
import React from 'react';

interface DogLogoProps {
  size?: number | string;
  className?: string;
  variant?: 'mark' | 'profile';
  color?: string;
}

export function DogLogo({
  size = 48,
  className = '',
  variant = 'mark',
  color = 'currentColor',
}: DogLogoProps) {
  const s = typeof size === 'number' ? size : undefined;
  const fontSize = typeof size === 'number' ? Math.round(size * 0.36) : '36%';

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `1.5px solid ${color === 'currentColor' ? 'var(--border-strong)' : color}`,
        background: 'var(--bg, #ffffff)',
        color: color === 'currentColor' ? 'var(--text, #000)' : color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font, Inter, system-ui, sans-serif)',
        fontWeight: 700,
        fontSize,
        letterSpacing: '-0.04em',
        flexShrink: 0,
        lineHeight: 1,
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
  color = 'var(--text)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <span
      style={{
        fontFamily: 'var(--font, Inter, system-ui, sans-serif)',
        fontSize: size * 0.85,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        color,
      }}
    >
      DogKey<span style={{ fontSize: '0.55em', verticalAlign: 'super', color: 'var(--green)', fontWeight: 600 }}>™</span>
    </span>
  );
}
