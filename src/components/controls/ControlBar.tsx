"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AtSign, Clock, Hash, Mountain, Quote, Sliders, Type } from "lucide-react";
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
    setSettingsOpen,
  } = useAppStore();

  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 896, height: 40, scale: 1 });

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    const update = () => {
      requestAnimationFrame(() => {
        const wrapEl = wrapRef.current;
        const innerEl = innerRef.current;
        if (!wrapEl || !innerEl) return;

        const parentWidth = wrapEl.clientWidth;
        const unscaledWidth = innerEl.scrollWidth;
        const unscaledHeight = innerEl.scrollHeight || 40;
        const s = Math.min(1, parentWidth / unscaledWidth);

        setDimensions({
          width: unscaledWidth,
          height: unscaledHeight,
          scale: Number.isFinite(s) && s > 0 ? s : 1,
        });
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [mode, difficulty, punctuation, numbers, timer, wordCount, quoteLength]);

  return (
    <div className="flex w-full justify-center">
      {/* Desktop View */}
      <div
        ref={wrapRef}
        className="hidden md:flex w-full justify-center overflow-hidden"
      >
        <div
          className="relative"
          style={{
            width: dimensions.width * dimensions.scale,
            height: dimensions.height * dimensions.scale,
          }}
        >
          <div
            ref={innerRef}
            className="absolute left-1/2 top-0 origin-top flex items-center justify-center gap-4 w-max"
            style={{
              transform: `translateX(-50%) scale(${dimensions.scale})`,
            }}
          >
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
      </div>

      {/* Mobile View - Sleek Status Pill (matches keythm style) */}
      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        className="flex md:hidden items-center justify-center gap-2 rounded-full bg-white/[0.04] px-4 py-2 border border-white/[0.06] text-[11px] font-medium text-[var(--color-text-dim)] shadow-sm active:scale-[0.98] transition-transform duration-100"
      >
        <span className="flex items-center gap-1.5 text-[var(--color-crimson)] capitalize">
          {mode === "time" && <Clock size={12} strokeWidth={2.5} />}
          {mode === "words" && <Type size={12} strokeWidth={2.5} />}
          {mode === "quote" && <Quote size={12} strokeWidth={2.5} />}
          {mode === "zen" && <Mountain size={12} strokeWidth={2.5} />}
          {mode}
        </span>
        <Sep />
        <span className="text-[var(--color-text)]">
          {mode === "time" && `${timer}s`}
          {mode === "words" && `${wordCount}w`}
          {mode === "quote" && <span className="capitalize">{quoteLength}</span>}
          {mode === "zen" && "zen"}
        </span>
        <Sep />
        <span className="capitalize">{difficulty}</span>
        {(punctuation || numbers) && <Sep />}
        {punctuation && <AtSign size={11} className="text-[var(--color-crimson)]" />}
        {numbers && <Hash size={11} className="text-[var(--color-crimson)]" />}
        <Sep />
        <Sliders size={12} className="text-[var(--color-text-muted)]" />
      </button>
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
