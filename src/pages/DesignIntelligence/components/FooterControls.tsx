import React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

interface FooterControlsProps {
  total: number;
  active: number;
  paused: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePause: () => void;
}

/**
 * Prev / Pause-Play / Next controls plus a slide counter.
 */
export function FooterControls({
  total,
  active,
  paused,
  onPrev,
  onNext,
  onTogglePause,
}: FooterControlsProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Slide counter */}
      <span className="font-body text-xs tabular-nums text-[#333333]/50">
        <span className="text-[#800020] font-semibold">{String(active + 1).padStart(2, "0")}</span>
        {" / "}
        {String(total).padStart(2, "0")}
      </span>

      {/* Controls */}
      <div className="flex items-center gap-2" role="group" aria-label="Slide controls">
        <button
          type="button"
          aria-label="Previous pillar"
          onClick={onPrev}
          className={cn(
            "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#800020]/20",
            "text-[#800020]/60 transition-all duration-200 hover:border-[#800020]/60 hover:text-[#800020]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A028]",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          aria-label={paused ? "Resume auto-advance" : "Pause auto-advance"}
          aria-pressed={paused}
          onClick={onTogglePause}
          className={cn(
            "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border",
            "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A028]",
            paused
              ? "border-[#C5A028] bg-[#C5A028]/10 text-[#C5A028]"
              : "border-[#800020]/20 text-[#800020]/60 hover:border-[#800020]/60 hover:text-[#800020]",
          )}
        >
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </button>

        <button
          type="button"
          aria-label="Next pillar"
          onClick={onNext}
          className={cn(
            "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#800020]/20",
            "text-[#800020]/60 transition-all duration-200 hover:border-[#800020]/60 hover:text-[#800020]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A028]",
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Keyboard hint */}
      <span className="hidden font-body text-[10px] text-[#333333]/30 lg:block">
        ← → Space
      </span>
    </div>
  );
}
