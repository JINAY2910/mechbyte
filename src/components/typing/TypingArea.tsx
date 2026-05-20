"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import type { TestStatus } from "@/hooks/useTypingTest";

interface TypingAreaProps {
  text: string;
  input: string;
  status: TestStatus;
}

const LINE_SPRING = { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.8 };
const RESET_EASE = { duration: 0.15, ease: [0.23, 1, 0.32, 1] as const };

export function TypingArea({ text, input, status }: TypingAreaProps) {
  const { typingFont, mode, focusMode } = useAppStore();
  const viewportRef = useRef<HTMLDivElement>(null);
  // Attached to the OUTER span.relative so offsetTop gives the line position
  // relative to viewportRef (its offsetParent). The inner absolute cursor bar
  // is purely visual and doesn't contribute to offsetTop.
  const cursorRef = useRef<HTMLSpanElement>(null);
  const zenScrollRef = useRef<HTMLDivElement>(null);
  const [rowOffset, setRowOffset] = useState(0);

  const fontFamily =
    typingFont === "jetbrains"
      ? "var(--font-jetbrains), ui-monospace, monospace"
      : "ui-monospace, monospace";

  const cursorPos = input.length;
  const resetting = status === "idle";

  useLayoutEffect(() => {
    if (mode === "zen") {
      const el = zenScrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
      return;
    }

    const viewport = viewportRef.current;
    const cursor = cursorRef.current;
    if (!viewport || !cursor) return;

    const lineH = parseFloat(getComputedStyle(viewport).lineHeight);
    if (!lineH || isNaN(lineH)) return;

    // cursor.offsetTop is the Y position of the outer span relative to
    // viewportRef (its nearest positioned ancestor). Dividing by lineH
    // gives the 0-indexed row the cursor is on.
    const row = Math.round(cursor.offsetTop / lineH);
    setRowOffset(Math.max(0, row - 1) * lineH);
  }, [cursorPos, text, mode, input]);

  if (mode === "zen") {
    return (
      <div
        ref={zenScrollRef}
        className="relative h-[7.8rem] w-full overflow-y-auto overflow-x-hidden text-left text-[1.65rem] leading-relaxed text-[var(--color-text-muted)] select-none"
        style={{ fontFamily }}
      >
        {input ? (
          <span className="text-[var(--color-text-dim)]">{input}</span>
        ) : (
          <span className="opacity-40">Start typing freely...</span>
        )}
      </div>
    );
  }

  const chars = text.split("");

  let wordStart = 0;
  for (let i = cursorPos - 1; i >= 0; i--) {
    if (text[i] === " ") {
      wordStart = i + 1;
      break;
    }
  }
  let wordEnd = text.length;
  for (let i = cursorPos; i < text.length; i++) {
    if (text[i] === " ") {
      wordEnd = i;
      break;
    }
  }

  return (
    <div
      ref={viewportRef}
      className="relative h-[7.8rem] w-full overflow-hidden text-left text-[1.65rem] leading-relaxed select-none"
      style={{ fontFamily }}
      aria-label="Typing test text"
    >
      <motion.div
        animate={{ y: -rowOffset }}
        transition={resetting ? RESET_EASE : LINE_SPRING}
        className="will-change-transform"
      >
        {chars.map((char, i) => {
          const typed = i < input.length;
          const correct = typed && input[i] === char;
          const incorrect = typed && input[i] !== char;
          const isCursor = i === cursorPos && status !== "finished";
          const inCurrentWord = i >= wordStart && i < wordEnd;
          const isPast = i < cursorPos;
          const isUpcoming = i > cursorPos;

          let color = "text-[var(--color-text-muted)]";
          if (incorrect) color = "text-[#ff5555]";
          else if (isPast && correct) color = "text-[var(--color-text-dim)]/60";
          else if (inCurrentWord) color = "text-[var(--color-text)]";
          else if (focusMode && isUpcoming) color = "text-[var(--color-text-muted)]/25";

          return (
            // cursorRef goes on the OUTER span so offsetTop = line position
            // relative to viewportRef. The inner span is just the visual bar.
            <span
              key={i}
              ref={isCursor ? cursorRef : undefined}
              className="relative inline"
            >
              {isCursor && (
                <span
                  className="absolute -left-[1.5px] top-1/2 -translate-y-1/2 h-[1.15em] w-[3px] rounded-full bg-[var(--color-crimson)] animate-cursor-blink"
                  aria-hidden
                />
              )}
              <span className={color}>{char}</span>
            </span>
          );
        })}
        {/* Sentinel: when input has reached the end of currently-rendered text
            (during a refill re-render), keep cursorRef alive at the last
            position so the scroll doesn't reset. */}
        {cursorPos >= chars.length && status !== "finished" && (
          <span ref={cursorRef} className="relative inline">
            <span
              className="absolute -left-[1.5px] top-1/2 -translate-y-1/2 h-[1.15em] w-[3px] rounded-full bg-[var(--color-crimson)] animate-cursor-blink"
              aria-hidden
            />
          </span>
        )}
        {input.length > text.length &&
          input
            .slice(text.length)
            .split("")
            .map((c, i) => (
              <span key={`extra-${i}`} className="text-[#ff5555]">
                {c}
              </span>
            ))}
      </motion.div>
    </div>
  );
}
