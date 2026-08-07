import React from 'react';

// Shared hand-drawn SVG icons — used in place of generic stock icons
// (lucide) for decorative "feature/trust" badge grids across the site
// (About, Contact, Delivery/Area pages), so those spots read as bespoke
// rather than a generic AI-template icon-in-a-box pattern. Functional UI
// icons (search, cart, chevrons, form fields, buttons) intentionally stay
// as standard lucide icons — those need to be instantly recognisable, not
// distinctive.

export type HandIconProps = { className?: string; style?: React.CSSProperties };

export const JarHeart: React.FC<HandIconProps> = ({ className, style }) => (
  <svg viewBox="0 0 44 44" className={className} style={style} aria-hidden>
    <path d="M14 16h16l-2 22a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3L14 16Z" fill="#F3D9B1" stroke="#C79B68" strokeWidth="1.4" />
    <path d="M12 16h20" stroke="#C79B68" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M18 16v-3a4 4 0 0 1 8 0v3" fill="none" stroke="#C79B68" strokeWidth="1.4" />
    <path d="M22 23c-3.2 2.6-3.2 6 0 8 3.2-2 3.2-5.4 0-8Z" fill="#F04E4E" opacity="0.85" />
  </svg>
);

export const Sprout: React.FC<HandIconProps> = ({ className, style }) => (
  <svg viewBox="0 0 40 44" className={className} style={style} aria-hidden>
    <path d="M20 40V22" stroke="#85974C" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M20 24C10 24 6 16 8 8 16 8 22 14 20 24Z" fill="#AEBE74" stroke="#85974C" strokeWidth="1.2" />
    <path d="M20 20C28 18 32 10 30 4 22 6 17 12 20 20Z" fill="#C3D28C" stroke="#85974C" strokeWidth="1.2" />
  </svg>
);

export const GrainStalk: React.FC<HandIconProps> = ({ className, style }) => (
  <svg viewBox="0 0 34 44" className={className} style={style} aria-hidden>
    <path d="M17 42V6" stroke="#C79B68" strokeWidth="1.4" strokeLinecap="round" />
    <g fill="#E7C9A1" stroke="#C79B68" strokeWidth="1">
      <ellipse cx="12" cy="10" rx="4" ry="6" transform="rotate(-25 12 10)" />
      <ellipse cx="22" cy="10" rx="4" ry="6" transform="rotate(25 22 10)" />
      <ellipse cx="10" cy="20" rx="4" ry="6" transform="rotate(-25 10 20)" />
      <ellipse cx="24" cy="20" rx="4" ry="6" transform="rotate(25 24 20)" />
      <ellipse cx="17" cy="4" rx="3.4" ry="5" />
    </g>
  </svg>
);

export const Droplet: React.FC<HandIconProps> = ({ className, style }) => (
  <svg viewBox="0 0 34 44" className={className} style={style} aria-hidden>
    <path d="M17 4C25 16 30 24 30 30a13 13 0 0 1-26 0C4 24 9 16 17 4Z" fill="#CDE3EE" stroke="#6FA6C4" strokeWidth="1.4" />
    <path d="M12 27c-1 4 1 7 4 8" fill="none" stroke="#6FA6C4" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
  </svg>
);

export const Crate: React.FC<HandIconProps> = ({ className, style }) => (
  <svg viewBox="0 0 44 40" className={className} style={style} aria-hidden>
    <g fill="#F3D9A0" stroke="#C79B68" strokeWidth="1.3">
      <rect x="4" y="18" width="16" height="16" rx="2" />
      <rect x="22" y="18" width="16" height="16" rx="2" />
      <rect x="13" y="4" width="16" height="16" rx="2" />
    </g>
    <path d="M4 24h16M22 24h16M13 10h16" stroke="#C79B68" strokeWidth="1" opacity="0.6" />
  </svg>
);

export const Compass: React.FC<HandIconProps> = ({ className, style }) => (
  <svg viewBox="0 0 44 44" className={className} style={style} aria-hidden>
    <circle cx="22" cy="22" r="18" fill="#E3E6FA" stroke="#6C6FC4" strokeWidth="1.4" />
    <path d="M28 14 24 24 14 30l4-10 10-6Z" fill="#8B8EDB" stroke="#6C6FC4" strokeWidth="1" />
  </svg>
);

export const HandTruck: React.FC<HandIconProps> = ({ className, style }) => (
  <svg viewBox="0 0 44 32" className={className} style={style} aria-hidden>
    <rect x="2" y="8" width="24" height="16" rx="2" fill="#FBD8D2" stroke="#F04E4E" strokeWidth="1.3" />
    <path d="M26 14h9l6 6v4h-15Z" fill="#FBD8D2" stroke="#F04E4E" strokeWidth="1.3" />
    <circle cx="12" cy="27" r="3" fill="#fff" stroke="#F04E4E" strokeWidth="1.3" />
    <circle cx="33" cy="27" r="3" fill="#fff" stroke="#F04E4E" strokeWidth="1.3" />
  </svg>
);

export const CheckBadge: React.FC<HandIconProps> = ({ className, style }) => (
  <svg viewBox="0 0 40 44" className={className} style={style} aria-hidden>
    <path d="M20 2 34 8v14c0 10-6 16-14 20C12 38 6 32 6 22V8Z" fill="#D2EFE0" stroke="#059669" strokeWidth="1.4" />
    <path d="M13 21l5 5 9-11" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChatBubble: React.FC<HandIconProps> = ({ className, style }) => (
  <svg viewBox="0 0 44 40" className={className} style={style} aria-hidden>
    <path d="M6 8a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H16l-8 8V8Z" fill="#FCD9D9" stroke="#F04E4E" strokeWidth="1.4" />
    <circle cx="16" cy="16" r="1.6" fill="#F04E4E" />
    <circle cx="22" cy="16" r="1.6" fill="#F04E4E" />
    <circle cx="28" cy="16" r="1.6" fill="#F04E4E" />
  </svg>
);
