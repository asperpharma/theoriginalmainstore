import React from "react";
import { cn } from "@/lib/utils";
import type { Pillar } from "../pillars";

interface PillarSpineProps {
  pillars: Pillar[];
  active: number;
  onSelect: (index: number) => void;
}

/**
 * Left vertical navigation spine — shows pillar numerals and a live progress indicator.
 * Collapses to a row of dots on small screens.
 */
export function PillarSpine({ pillars, active, onSelect }: PillarSpineProps) {
  return (
    <nav
      aria-label="Design pillars"
      className="flex flex-row items-center gap-3 lg:flex-col lg:items-start lg:gap-2"
    >
      {pillars.map((pillar, i) => {
        const isCurrent = i === active;
        return (
          <button
            key={pillar.id}
            type="button"
            aria-current={isCurrent ? "true" : undefined}
            aria-label={`Pillar ${pillar.numeral}: ${pillar.title}`}
            onClick={() => onSelect(i)}
            className={cn(
              "group flex cursor-pointer items-center gap-3 rounded-none border-0 bg-transparent p-0 text-start transition-all duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A028] focus-visible:ring-offset-2",
            )}
          >
            {/* Active indicator bar */}
            <span
              className={cn(
                "hidden h-8 w-0.5 transition-all duration-300 lg:block",
                isCurrent ? "bg-[#C5A028]" : "bg-[#800020]/20 group-hover:bg-[#800020]/50",
              )}
            />
            {/* Dot for small screens */}
            <span
              className={cn(
                "block h-2 w-2 rounded-full transition-all duration-300 lg:hidden",
                isCurrent ? "bg-[#C5A028] scale-125" : "bg-[#800020]/30 group-hover:bg-[#800020]/60",
              )}
            />
            {/* Numeral + title — hidden on small screens */}
            <span className="hidden lg:block">
              <span
                className={cn(
                  "block font-body text-[10px] uppercase tracking-[0.2em] transition-colors duration-300",
                  isCurrent ? "text-[#C5A028]" : "text-[#333333]/40 group-hover:text-[#333333]/70",
                )}
              >
                {pillar.numeral}
              </span>
              <span
                className={cn(
                  "block font-display text-xs font-semibold transition-colors duration-300",
                  isCurrent ? "text-[#800020]" : "text-[#333333]/50 group-hover:text-[#333333]/80",
                )}
              >
                {pillar.title}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
