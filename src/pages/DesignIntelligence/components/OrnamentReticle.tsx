import React from "react";

/**
 * Decorative SVG microscope reticle — top-right corner, 6% opacity.
 * Pure presentational, hidden from assistive technology.
 */
export function OrnamentReticle() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 120 120"
      className="pointer-events-none absolute right-4 top-4 h-24 w-24 text-[#800020] opacity-[0.06] motion-reduce:hidden"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.75"
    >
      {/* Outer circle */}
      <circle cx="60" cy="60" r="56" />
      {/* Inner circle */}
      <circle cx="60" cy="60" r="36" />
      {/* Centre dot */}
      <circle cx="60" cy="60" r="3" fill="currentColor" />
      {/* Cross-hair lines */}
      <line x1="60" y1="4" x2="60" y2="24" />
      <line x1="60" y1="96" x2="60" y2="116" />
      <line x1="4" y1="60" x2="24" y2="60" />
      <line x1="96" y1="60" x2="116" y2="60" />
      {/* Tick marks at 45° */}
      <line x1="99.6" y1="20.4" x2="86.9" y2="33.1" />
      <line x1="20.4" y1="99.6" x2="33.1" y2="86.9" />
      <line x1="20.4" y1="20.4" x2="33.1" y2="33.1" />
      <line x1="99.6" y1="99.6" x2="86.9" y2="86.9" />
    </svg>
  );
}
