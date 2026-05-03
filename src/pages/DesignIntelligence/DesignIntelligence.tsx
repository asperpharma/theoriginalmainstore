import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PILLARS } from "./pillars";
import { useAutoAdvance } from "./hooks/useAutoAdvance";
import { useKeyboardNav } from "./hooks/useKeyboardNav";
import { PillarSpine } from "./components/PillarSpine";
import { PillarCard } from "./components/PillarCard";
import { TimerBar } from "./components/TimerBar";
import { FooterControls } from "./components/FooterControls";

/**
 * DesignIntelligence — Editorial seven-pillar walkthrough of the Asper Beauty
 * "Medical Luxury" design system. Auto-advances every 8 s; keyboard-navigable.
 */
export default function DesignIntelligence() {
  const { active, paused, progress, goTo, prev, next, togglePause } =
    useAutoAdvance(PILLARS.length);

  useKeyboardNav({ onPrev: prev, onNext: next, onTogglePause: togglePause });

  const currentPillar = PILLARS[active];

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F8FF]">
      <Header />

      <main id="di-main" className="flex flex-1 flex-col">
        {/* ── Page header ── */}
        <section className="border-b border-[#800020]/10 px-6 py-10 sm:px-12">
          <p className="mb-2 font-body text-xs uppercase tracking-[0.3em] text-[#C5A028]">
            Design System
          </p>
          <h1 className="font-display text-4xl font-bold text-[#800020] sm:text-5xl">
            Design Intelligence
          </h1>
          <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-[#333333]/70">
            A narrated tour through the seven pillars of the Asper Beauty Medical Luxury
            design system — every interaction signals craft.
          </p>
        </section>

        {/* ── Timer bar ── */}
        <TimerBar progress={progress} paused={paused} />

        {/* ── Main walkthrough layout ── */}
        <div className="flex flex-1 flex-col gap-8 px-6 py-10 sm:px-12 lg:flex-row lg:gap-12 lg:py-16">
          {/* Left spine nav */}
          <aside className="lg:w-48 lg:shrink-0">
            <PillarSpine
              pillars={PILLARS}
              active={active}
              onSelect={goTo}
            />
          </aside>

          {/* Right card area */}
          <div className="relative flex-1">
            <PillarCard pillar={currentPillar} animKey={active} />
          </div>
        </div>

        {/* ── Footer controls ── */}
        <div className="border-t border-[#800020]/10 px-6 py-4 sm:px-12">
          <FooterControls
            total={PILLARS.length}
            active={active}
            paused={paused}
            onPrev={prev}
            onNext={next}
            onTogglePause={togglePause}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
