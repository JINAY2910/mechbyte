"use client";

import { RotateCcw } from "lucide-react";
import { ControlBar } from "@/components/controls/ControlBar";
import { TypingArea } from "@/components/typing/TypingArea";
import { isTimedFocusActive } from "@/lib/typing/focusMode";
import { useAppStore } from "@/store/useAppStore";
import type { TestStatus } from "@/hooks/useTypingTest";
import { cn } from "@/lib/utils";

interface TypingTestProps {
  text: string;
  input: string;
  status: TestStatus;
  liveWpm: number;
  liveAccuracy: number;
  timeLeft: number;
  onRestart: () => void;
}

export function TypingTest({
  text,
  input,
  status,
  liveWpm,
  liveAccuracy,
  timeLeft,
  onRestart,
}: TypingTestProps) {
  const { mode, showLiveStats, typingStatus } = useAppStore();
  const started = status === "active" || status === "finished";
  const timedFocus = isTimedFocusActive(mode, typingStatus);

  return (
    <div
      className="flex w-full max-w-5xl flex-col items-center gap-3.5"
    >
      <div className={cn("w-full", timedFocus && "focus-blur")}>
        <ControlBar />
      </div>

      <div className="focus-zone relative w-full">
        <div
          className={cn(
            "mb-4 flex h-9 items-center justify-between",
            !showLiveStats && !timedFocus && "pointer-events-none",
          )}
        >
          <div className="flex-1" />
          <div
            className={cn(
              "flex items-baseline gap-6 transition-opacity duration-200",
              started || timedFocus ? "opacity-100" : "opacity-0",
            )}
          >
            {mode === "time" && (
              <span className="tabular-nums">
                <span
                  className={cn(
                    "font-bold tabular-nums",
                    timedFocus
                      ? "text-2xl text-[var(--color-crimson)]"
                      : "text-xl text-[var(--color-text)]",
                  )}
                >
                  {timeLeft}
                </span>
                <span
                  className={cn(
                    "ml-0.5",
                    timedFocus
                      ? "text-sm text-[var(--color-crimson)]/80"
                      : "text-sm text-[var(--color-text-muted)]",
                  )}
                >
                  s
                </span>
              </span>
            )}
            {showLiveStats && (
              <>
                <span className="tabular-nums">
                  <span className="text-xl font-bold text-[var(--color-text)]">{liveWpm}</span>
                  <span className="ml-0.5 text-sm text-[var(--color-text-muted)]">wpm</span>
                </span>
                <span className="tabular-nums">
                  <span className="text-xl font-bold text-[var(--color-text)]">
                    {liveAccuracy}
                  </span>
                  <span className="text-sm text-[var(--color-text-muted)]">% acc</span>
                </span>
              </>
            )}
          </div>
        </div>

        <TypingArea text={text} input={input} status={status} />

        <div className="mt-3 flex justify-center">
          <RestartButton onRestart={onRestart} />
        </div>
      </div>

      <div className="mt-2 flex flex-col items-center">
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]/50 transition-opacity duration-300",
            timedFocus ? "opacity-0" : "opacity-100",
          )}
        >
          <kbd className="rounded-[4px] bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px]">
            tab
          </kbd>
          <span className="text-[var(--color-text-muted)]/30">+</span>
          <kbd className="rounded-[4px] bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px]">
            enter
          </kbd>
          <span className="ml-0.5">restart</span>
        </div>
      </div>
    </div>
  );
}

function RestartButton({ onRestart }: { onRestart: () => void }) {
  return (
    <button
      type="button"
      onClick={onRestart}
      className="rounded-full p-2 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-crimson)]"
      aria-label="Restart test"
    >
      <RotateCcw size={18} strokeWidth={1.75} />
    </button>
  );
}
