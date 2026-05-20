"use client";

import { useEffect, useRef } from "react";
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

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Focus hidden input on load, on change of status to idle, and on click anywhere on screen
  useEffect(() => {
    hiddenInputRef.current?.focus();

    const handleGlobalClick = (e: MouseEvent) => {
      if (useAppStore.getState().settingsOpen) return;

      const target = e.target as HTMLElement;
      if (
        target.closest("button") ||
        target.closest("a") ||
        target.closest("input") ||
        target.closest("select") ||
        target.closest("textarea") ||
        target.closest("[role='button']")
      ) {
        return;
      }

      hiddenInputRef.current?.focus();
    };

    window.addEventListener("click", handleGlobalClick);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  useEffect(() => {
    if (status === "idle") {
      hiddenInputRef.current?.focus();
    }
  }, [status]);

  const handleRestart = () => {
    onRestart();
    setTimeout(() => {
      hiddenInputRef.current?.focus();
    }, 50);
  };

  const handleHiddenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status === "finished") return;

    const newValue = e.target.value;
    const oldLen = input.length;
    const newLen = newValue.length;

    const dispatchKey = (key: string) => {
      let code = "";
      if (key === " ") {
        code = "Space";
      } else if (key === "Backspace") {
        code = "Backspace";
      } else if (key === "Enter") {
        code = "Enter";
      } else {
        code = `Key${key.toUpperCase()}`;
      }

      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key,
          code,
          bubbles: true,
          cancelable: true,
        })
      );
      window.dispatchEvent(
        new KeyboardEvent("keyup", {
          key,
          code,
          bubbles: true,
          cancelable: true,
        })
      );
    };

    if (newLen > oldLen) {
      for (let i = oldLen; i < newLen; i++) {
        dispatchKey(newValue[i]);
      }
    } else if (newLen < oldLen) {
      for (let i = 0; i < oldLen - newLen; i++) {
        dispatchKey("Backspace");
      }
    }
  };

  return (
    <div
      className="flex w-full max-w-5xl flex-col items-center gap-2 md:gap-3.5"
    >
      <div className={cn(
        "w-full transition-all duration-300",
        timedFocus && "focus-blur",
        status === "active" && "max-md:h-0 max-md:opacity-0 max-md:pointer-events-none overflow-hidden"
      )}>
        <ControlBar />
      </div>

      <div className="focus-zone relative w-full">
        <div
          className={cn(
            "mb-2 md:mb-4 flex h-7 md:h-9 items-center justify-between",
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

        <div className="mt-2 md:mt-3 flex justify-center">
          <RestartButton onRestart={handleRestart} />
        </div>
      </div>

      {/* Hidden input to receive mobile soft keyboard events */}
      <input
        ref={hiddenInputRef}
        type="text"
        value={input}
        onChange={handleHiddenInputChange}
        className="absolute opacity-0 pointer-events-none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "1px",
          height: "1px",
          zIndex: -1,
        }}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Typing input"
      />

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
