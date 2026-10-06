import React from 'react';

interface DogLogoProps {
  size?: number | string;
  className?: string;
  variant?: 'mark' | 'wordmark';
  color?: string;
}

export function DogLogo({
  size = 48,
  className = '',
  variant = 'mark',
  color = 'currentColor',
}: DogLogoProps) {
  const s = typeof size === 'number' ? size : undefined;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: size, height: size, color }}
      aria-label="DogKey"
    >
      <circle cx="32" cy="32" r="30" fill="rgba(196,165,116,0.12)" stroke="rgba(196,165,116,0.35)" strokeWidth="1.5" />
      <path
        d="M32 14c-6.2 0-11.2 3.4-13.4 8.4-1.1-0.6-2.4-1-3.8-1-3.6 0-6.5 2.7-6.5 6.1 0 2.4 1.4 4.5 3.5 5.5v0.3c0 9.2 7.2 16.6 16.2 16.6h8c9 0 16.2-7.4 16.2-16.6v-0.3c2.1-1 3.5-3.1 3.5-5.5 0-3.4-2.9-6.1-6.5-6.1-1.4 0-2.7 0.4-3.8 1C43.2 17.4 38.2 14 32 14z"
        fill={color}
        opacity="0.92"
      />
      <path d="M18.5 24.5c-1.8-3.2-1.2-6.8 1.4-8.4 1.8 2.4 3.2 5.4 3.6 8.6-1.7 0.2-3.4-0.1-5-0.2z" fill={color} opacity="0.75" />
      <path d="M45.5 24.5c1.8-3.2 1.2-6.8-1.4-8.4-1.8 2.4-3.2 5.4-3.6 8.6 1.7 0.2 3.4-0.1 5-0.2z" fill={color} opacity="0.75" />
      <circle cx="26" cy="32" r="2.2" fill="var(--bg-ivory, #faf6f0)" />
      <circle cx="38" cy="32" r="2.2" fill="var(--bg-ivory, #faf6f0)" />
      <circle cx="26.4" cy="32.3" r="1" fill={color} />
      <circle cx="38.4" cy="32.3" r="1" fill={color} />
      <ellipse cx="32" cy="37.5" rx="2.4" ry="1.8" fill="var(--bg-ivory, #faf6f0)" opacity="0.9" />
      <path d="M28 40.5c1.2 1.4 2.6 2.1 4 2.1s2.8-0.7 4-2.1" stroke="var(--bg-ivory, #faf6f0)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
  );
}

export function DogLogoWordmark({ size = 28 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <DogLogo size={size} color="var(--accent-deep)" />
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: size * 0.72,
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: 'var(--accent-deep)',
        }}
      >
        DogKey
      </span>
    </div>
  );
}
