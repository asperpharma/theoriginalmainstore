import React from "react";

interface GhostNumeralProps {
  numeral: string; // "01" .. "07"
}

/**
 * Large watermark numeral rendered behind the pillar card.
 * Decorative only — hidden from assistive technology.
 */
export function GhostNumeral({ numeral }: GhostNumeralProps) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-8 -right-4 select-none font-display text-[12rem] font-bold leading-none text-[#800020]/[0.06] motion-reduce:hidden sm:text-[16rem]"
    >
      {numeral}
    </span>
  );
}
