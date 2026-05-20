"use client";

import { useEffect, useRef } from "react";
import { KeyboardVisualizer } from "@/components/keyboard/KeyboardVisualizer";
import { ResultModal } from "@/components/results/ResultModal";
import { TypingTest } from "@/components/typing/TypingTest";
import { audioManager } from "@/lib/audio/AudioManager";
import { isTimedFocusActive } from "@/lib/typing/focusMode";
import { cn } from "@/lib/utils";
import { useTypingTest } from "@/hooks/useTypingTest";
import { useAppStore } from "@/store/useAppStore";
import { codeToChar } from "@/data/keyboardLayout";
import type { KeyDef } from "@/data/keyboardLayout";

/** HomePage component */
export default function HomePage() {
  const { mode, difficulty, addSession, soundPack, showKeyboard, typingStatus } =
    useAppStore();
  const timedFocus = isTimedFocusActive(mode, typingStatus);
  const {
    text,
    input,
    status,
    pressedKeys,
    result,
    reset,
    timeLeft,
    liveWpm,
    liveAccuracy,
  } = useTypingTest();

  const savedRef = useRef<number | null>(null);
  const isFinished = status === "finished";

  const handleVirtualKeyClick = (keyDef: KeyDef) => {
    const code = keyDef.code;
    let key = keyDef.label;

    if (code === "Space") {
      key = " ";
    } else if (code === "Backspace") {
      key = "Backspace";
    } else if (code === "Enter") {
      key = "Enter";
    } else if (code === "Tab") {
      key = "Tab";
    } else {
      const char = codeToChar(code, false);
      if (char) {
        key = char;
        // Match the case of the expected character in the text at current input position
        const expectedChar = text[input.length];
        if (expectedChar && expectedChar.toLowerCase() === char.toLowerCase()) {
          key = expectedChar;
        }
      }
    }

    const downEvent = new KeyboardEvent("keydown", {
      key,
      code,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(downEvent);

    setTimeout(() => {
      const upEvent = new KeyboardEvent("keyup", {
        key,
        code,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(upEvent);
    }, 100);
  };

  useEffect(() => {
    void audioManager.preload(soundPack);
  }, [soundPack]);

  useEffect(() => {
    if (result && status === "finished" && savedRef.current !== result.completedAt) {
      savedRef.current = result.completedAt;
      addSession({
        ...result,
        id: `${result.completedAt}`,
        mode,
        difficulty,
      });
    }
    if (status === "idle") savedRef.current = null;
  }, [result, status, mode, difficulty, addSession]);

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main
          className={cn(
            "layout-shift flex min-h-0 flex-1 flex-col px-6 transition-all duration-300",
            isFinished
              ? "justify-center px-10 py-2"
              : status === "active"
              ? "items-center justify-start pt-4 md:justify-center md:pt-0"
              : "items-center justify-center",
          )}
        >
          <TypingTest
            text={text}
            input={input}
            status={status}
            liveWpm={liveWpm}
            liveAccuracy={liveAccuracy}
            timeLeft={timeLeft}
            onRestart={reset}
          />
        </main>

        <footer
          className={cn(
            "layout-shift hidden shrink-0 flex-col items-center justify-end overflow-hidden lg:flex",
            !isFinished && showKeyboard
              ? "max-h-[52vh] opacity-100 pb-4"
              : "max-h-0 opacity-0 pb-0",
          )}
        >
            <div className="w-full max-w-5xl scale-[0.95] px-2">
              <KeyboardVisualizer
                pressedKeys={pressedKeys}
                onKeyClick={handleVirtualKeyClick}
              />
            </div>
             <p className="mt-2 text-center text-[13px] text-[var(--color-text-dim)]">
              Built by Jinay Shah. The source code is available on{" "}
              <a
                href="https://github.com/JINAY2910/mechbyte"
                className="text-[var(--color-text)] underline-offset-2 hover:text-[var(--color-crimson)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              .
            </p>
        </footer>
      </div>

      <ResultModal result={result} onRestart={reset} />
    </>
  );
}
