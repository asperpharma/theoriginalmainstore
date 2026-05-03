import React from "react";

interface TimerBarProps {
  /** 0..1 representing elapsed fraction of the current slide duration */
  progress: number;
  paused: boolean;
}

/**
 * A hairline gold shimmer bar that shows auto-advance progress.
 * Degrades gracefully under prefers-reduced-motion.
 */
export function TimerBar({ progress, paused }: TimerBarProps) {
  return (
    <div
      role="progressbar"
      aria-label="Slide auto-advance timer"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="relative h-0.5 w-full overflow-hidden bg-[#C5A028]/20"
    >
      {/* Fill track */}
      <div
        className="absolute inset-y-0 left-0 bg-[#C5A028] motion-safe:transition-none"
        style={{ width: `${progress * 100}%` }}
      />
      {/* Shimmer overlay — only when running */}
      {!paused && (
        <div
          aria-hidden="true"
          className="absolute inset-y-0 w-16 animate-shimmer bg-gradient-to-r from-transparent via-[#F3E5AB]/70 to-transparent motion-reduce:hidden"
          style={{ left: `calc(${progress * 100}% - 2rem)` }}
        />
      )}
    </div>
  );
}
