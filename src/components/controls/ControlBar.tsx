"use client";

import { motion } from "framer-motion";
import { AtSign, Clock, Hash, Mountain, Quote, Type } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { QuoteLength, TestMode, TimerDuration } from "@/lib/types";

const MODES: { id: TestMode; label: string; icon: React.ReactNode }[] = [
  { id: "time", label: "time", icon: <Clock size={14} strokeWidth={2} /> },
  { id: "words", label: "words", icon: <Type size={14} strokeWidth={2} /> },
  { id: "quote", label: "quote", icon: <Quote size={14} strokeWidth={2} /> },
  { id: "zen", label: "zen", icon: <Mountain size={14} strokeWidth={2} /> },
];

const TIMERS: TimerDuration[] = [15, 30, 60, 120];
const WORD_COUNTS = [10, 25, 50, 100];
const QUOTE_LENGTHS: QuoteLength[] = ["short", "medium", "long"];

const pillEase = { duration: 0.2, ease: [0.23, 1, 0.32, 1] as const };

/** ControlBar component */
export function ControlBar() {
  const {
    mode,
    difficulty,
    punctuation,
    numbers,
    timer,
    wordCount,
    quoteLength,
    setMode,
    setDifficulty,
    setTimer,
    setWordCount,
    setQuoteLength,
    updateSettings,
  } = useAppStore();

  return (
    <div className="flex w-full justify-center">
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {/* Group 1 — toggles */}
        <div className="pill-group">
          <Toggle active={punctuation} onClick={() => updateSettings({ punctuation: !punctuation })}>
            <AtSign size={14} />
            punctuation
          </Toggle>
          <Toggle active={numbers} onClick={() => updateSettings({ numbers: !numbers })}>
            <Hash size={14} />
            numbers
          </Toggle>
          <Sep />
          <Toggle active={difficulty === "easy"} onClick={() => setDifficulty("easy")}>
            easy
          </Toggle>
          <Toggle active={difficulty === "hard"} onClick={() => setDifficulty("hard")}>
            hard
          </Toggle>
        </div>

        {/* Group 2 — modes */}
        <div className="pill-group">
          {MODES.map((m) => (
            <Selector
              key={m.id}
              active={mode === m.id}
              layoutId="mode"
              onClick={() => setMode(m.id)}
            >
              {m.icon}
              {m.label}
            </Selector>
          ))}
        </div>

        {/* Group 3 — sub-options (single row so pill width fits content) */}
        {mode !== "zen" && (
          <div className="pill-group">
            {mode === "time" &&
              TIMERS.map((t) => (
                <Selector
                  key={t}
                  active={timer === t}
                  layoutId="sub-time"
                  onClick={() => setTimer(t)}
                >
                  {t}
                </Selector>
              ))}
            {mode === "words" &&
              WORD_COUNTS.map((w) => (
                <Selector
                  key={w}
                  active={wordCount === w}
                  layoutId="sub-words"
                  onClick={() => setWordCount(w)}
                >
                  {w}
                </Selector>
              ))}
            {mode === "quote" &&
              QUOTE_LENGTHS.map((q) => (
                <Selector
                  key={q}
                  active={quoteLength === q}
                  layoutId="sub-quote"
                  onClick={() => setQuoteLength(q)}
                >
                  {q}
                </Selector>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Sep() {
  return <div className="mx-0.5 h-4 w-px shrink-0 self-center bg-white/[0.06]" aria-hidden />;
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 items-center justify-center gap-1 rounded-[10px] px-2.5 text-xs font-medium leading-none transition-colors ${
        active
          ? "text-[var(--color-crimson)]"
          : "text-[var(--color-text-muted)]/50 hover:text-[var(--color-text-dim)]"
      }`}
    >
      {children}
    </button>
  );
}

function Selector({
  active,
  onClick,
  layoutId,
  children,
}: {
  active: boolean;
  onClick: () => void;
  layoutId: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative z-10 inline-flex h-8 items-center justify-center gap-1 rounded-[10px] px-3 text-xs font-medium leading-none transition-colors ${
        active
          ? "text-[var(--color-crimson)]"
          : "text-[var(--color-text-muted)]/50 hover:text-[var(--color-text-dim)]"
      }`}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-[10px] bg-[var(--color-crimson)]/20"
          transition={pillEase}
        />
      )}
      <span className="relative inline-flex items-center justify-center gap-1 leading-none">
        {children}
      </span>
    </button>
  );
}
