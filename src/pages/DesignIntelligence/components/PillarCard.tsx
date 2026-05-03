import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Pillar } from "../pillars";
import { GhostNumeral } from "./GhostNumeral";
import { OrnamentReticle } from "./OrnamentReticle";

interface PillarCardProps {
  pillar: Pillar;
  /** Key that changes on each pillar transition — triggers enter animation */
  animKey: string | number;
}

const STAGGER_MS = 120;

/**
 * Right-side animated card that presents a single pillar.
 * Points appear with a 120ms CSS stagger.
 * Respects prefers-reduced-motion.
 */
export function PillarCard({ pillar, animKey }: PillarCardProps) {
  const [visiblePoints, setVisiblePoints] = useState<boolean[]>([]);

  // Reset and stagger-reveal bullet points whenever the pillar changes
  useEffect(() => {
    setVisiblePoints(new Array(pillar.points.length).fill(false));
    const timers = pillar.points.map((_, i) =>
      setTimeout(() => {
        setVisiblePoints((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 200 + i * STAGGER_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [animKey, pillar.points.length]);

  return (
    <article
      key={animKey}
      aria-label={`Pillar ${pillar.numeral}: ${pillar.title}`}
      className={cn(
        "relative flex h-full min-h-[420px] flex-col justify-between overflow-hidden rounded-sm",
        "bg-[#F8F8FF] px-8 py-10 shadow-neu-raised",
        "motion-safe:animate-[fadeIn_0.32s_cubic-bezier(0.19,1,0.22,1)_both]",
      )}
    >
      <OrnamentReticle />
      <GhostNumeral numeral={pillar.numeral} />

      {/* Header */}
      <header className="relative z-10 mb-8">
        <p className="mb-2 font-body text-xs uppercase tracking-[0.25em] text-[#C5A028]">
          {pillar.numeral} / 07
        </p>
        <h2 className="font-display text-3xl font-bold leading-tight text-[#800020] sm:text-4xl">
          {pillar.title}
        </h2>
        <p className="mt-2 font-body text-sm text-[#333333]/70">{pillar.subtitle}</p>
        {/* Gold stitch underline */}
        <div className="mt-4 h-px w-12 bg-[#C5A028]" />
      </header>

      {/* Bullet points */}
      <ul className="relative z-10 space-y-3" role="list">
        {pillar.points.map((point, i) => (
          <li
            key={i}
            className={cn(
              "flex items-start gap-3 font-body text-sm leading-relaxed text-[#333333]",
              "motion-safe:transition-all motion-safe:duration-300",
              visiblePoints[i]
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-0",
            )}
          >
            {/* Gold bullet */}
            <span
              aria-hidden="true"
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C5A028]"
            />
            {point}
          </li>
        ))}
      </ul>
    </article>
  );
}
