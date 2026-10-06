/**
 * DogKey™ brand mark — DOG ONLY.
 * No key · no key shape · no key stroke · no key symbolism.
 * Clean dog head: floppy ears, soft muzzle, loyal face.
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

  if (variant === 'profile') {
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
        role="img"
      >
        {/* Single solid profile path — no internal holes */}
        <path
          fill={color}
          fillRule="evenodd"
          d="M8 47c2.2-5.5 7-11 12.5-14 1.8-4.2 5-8 9-10 3.2-1.6 6.8-2 10-1 3.5 1.1 6.4 3.6 8 6.8 1.2 2.4 1.5 5.1.9 7.7 3.5 1.8 6.2 4.8 7.8 8.5 1.8 4.2 1.8 9-.2 13.2-1.4 3-3.8 5.5-6.8 7-2.5 1.3-5.3 1.9-8.1 1.9H28.5c-1.8 0-3.3-1.3-3.5-3.1-4.2-1.5-7.8-4.4-10-8.2C12 52.5 9.2 49.5 8 47z
             M20 22c-2.8 0-5.2 2.2-5.8 5.2-1.2 5.5.2 12 3.5 16.5.8 1.1 1.8 2 2.9 2.7.6-8.2.8-16.5-.6-24.4z"
        />
      </svg>
    );
  }

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
      role="img"
    >
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="rgba(212,184,150,0.10)"
        stroke="rgba(212,184,150,0.28)"
        strokeWidth="1.25"
      />
      {/* Unified dog silhouette: ears + head + muzzle */}
      <ellipse cx="14" cy="30" rx="9" ry="14" transform="rotate(-18 14 30)" fill={color} />
      <ellipse cx="50" cy="30" rx="9" ry="14" transform="rotate(18 50 30)" fill={color} />
      <ellipse cx="32" cy="30" rx="17" ry="16" fill={color} />
      <ellipse cx="32" cy="38" rx="10" ry="8" fill={color} />
      {/* Eyes */}
      <circle cx="25" cy="28" r="2.8" fill="rgba(250,246,240,0.95)" />
      <circle cx="39" cy="28" r="2.8" fill="rgba(250,246,240,0.95)" />
      <circle cx="25.5" cy="28.4" r="1.2" fill={color} />
      <circle cx="39.5" cy="28.4" r="1.2" fill={color} />
      {/* Nose */}
      <ellipse cx="32" cy="37.5" rx="3.4" ry="2.6" fill="rgba(250,246,240,0.92)" />
      {/* Smile */}
      <path
        d="M26.5 42c1.8 2 3.6 2.9 5.5 2.9s3.7-.9 5.5-2.9"
        stroke="rgba(250,246,240,0.82)"
        strokeWidth="1.45"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function DogLogoWordmark({
  size = 28,
  color = 'var(--accent-champagne)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <DogLogo size={size} color={color} />
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: size * 0.72,
          fontWeight: 600,
          letterSpacing: '0.04em',
          color,
        }}
      >
        DogKey
      </span>
    </div>
  );
}
