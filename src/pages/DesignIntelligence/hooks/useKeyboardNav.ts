import { useEffect } from "react";

interface KeyboardNavOptions {
  onPrev: () => void;
  onNext: () => void;
  onTogglePause: () => void;
}

/**
 * Binds ArrowLeft → prev, ArrowRight → next, Space → togglePause.
 * Attaches to the document so the user doesn't need to focus the component.
 */
export function useKeyboardNav({ onPrev, onNext, onTogglePause }: KeyboardNavOptions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't steal keys from form inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      } else if (e.key === " ") {
        e.preventDefault();
        onTogglePause();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onPrev, onNext, onTogglePause]);
}
