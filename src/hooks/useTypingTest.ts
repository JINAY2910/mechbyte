"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateTestText } from "@/lib/typing/generateText";
import { calcAccuracy, calcRawWpm, calcWpm } from "@/lib/typing/stats";
import { audioManager } from "@/lib/audio/AudioManager";
import type {
  SessionResult,
  TestMode,
  TimerDuration,
  TypingTestStatus,
  WPMPoint,
} from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";

// Words needed to keep up with fast typists for each duration
const WORDS_BY_DURATION: Record<number, number> = {
  15: 70,
  30: 140,
  60: 280,
  120: 560,
};

function wordsForTimer(t: number): number {
  return WORDS_BY_DURATION[t] ?? 70;
}

export type TestStatus = TypingTestStatus;

export function useTypingTest() {
  const {
    mode,
    difficulty,
    timer,
    wordCount,
    quoteLength,
    punctuation,
    numbers,
    audioEnabled,
    volume,
    soundPack,
  } = useAppStore();

  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<TestStatus>("idle");
  const [timeLeft, setTimeLeft] = useState<number>(timer);
  const [elapsed, setElapsed] = useState(0);
  const [errors, setErrors] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentWordStreak, setCurrentWordStreak] = useState(0);
  const wordPerfectRef = useRef(true);
  const [wpmHistory, setWpmHistory] = useState<WPMPoint[]>([]);
  const [keyHeatmap, setKeyHeatmap] = useState<Record<string, number>>({});
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<SessionResult | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tabHeldRef = useRef(false);
  const finishTestRef = useRef<() => void>(() => {});
  // Prevent the refill from firing on every keystroke while near the threshold
  const refillInProgressRef = useRef(false);
  // Always-current mirror of text state – updated synchronously before renders
  const textRef = useRef("");

  const statsRef = useRef({
    input: "",
    correctChars: 0,
    errors: 0,
    bestStreak: 0,
    wpmHistory: [] as WPMPoint[],
    keyHeatmap: {} as Record<string, number>,
  });

  useEffect(() => {
    statsRef.current = {
      input,
      correctChars,
      errors,
      bestStreak,
      wpmHistory,
      keyHeatmap,
    };
  }, [input, correctChars, errors, bestStreak, wpmHistory, keyHeatmap]);

  const reset = useCallback(() => {
    refillInProgressRef.current = false;
    const wordCount_ = mode === "time" ? wordsForTimer(timer) : wordCount;
    const newText = generateTestText(
      mode,
      difficulty,
      wordCount_,
      punctuation,
      numbers,
      quoteLength,
    );
    textRef.current = newText;
    setText(newText);
    setInput("");
    setStatus("idle");
    setTimeLeft(timer);
    setElapsed(0);
    setErrors(0);
    setCorrectChars(0);
    setBestStreak(0);
    setCurrentWordStreak(0);
    wordPerfectRef.current = true;
    setWpmHistory([]);
    setKeyHeatmap({});
    setPressedKeys(new Set());
    setResult(null);
    startTimeRef.current = null;
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [mode, difficulty, timer, wordCount, quoteLength, punctuation, numbers]);

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    useAppStore.getState().setTypingStatus(status);
  }, [status]);

  useEffect(() => {
    audioManager.setEnabled(audioEnabled);
    audioManager.setVolume(volume);
    audioManager.setSoundPack(soundPack);
  }, [audioEnabled, volume, soundPack]);

  const finishTest = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const end = Date.now();
    const elapsedMs = startTimeRef.current ? end - startTimeRef.current : 0;
    const duration =
      mode === "time" ? Math.max(elapsedMs, timer * 1000) : elapsedMs;

    const {
      input: finalInput,
      correctChars: finalCorrect,
      errors: finalErrors,
      bestStreak: finalStreak,
      wpmHistory: finalHistory,
      keyHeatmap: finalHeatmap,
    } = statsRef.current;

    const totalTyped = finalInput.length;
    const accuracy = calcAccuracy(
      finalCorrect,
      Math.max(totalTyped, finalCorrect + finalErrors),
    );
    const wpm = calcWpm(finalCorrect, duration);
    const rawWpm = calcRawWpm(totalTyped, duration);

    const sessionResult: SessionResult = {
      wpm,
      rawWpm,
      accuracy,
      errors: finalErrors,
      correctChars: finalCorrect,
      totalChars: totalTyped,
      duration,
      bestStreak: finalStreak,
      wpmHistory: finalHistory,
      keyHeatmap: finalHeatmap,
      completedAt: end,
    };
    setResult(sessionResult);
    setStatus("finished");
  }, [mode, timer]);

  finishTestRef.current = finishTest;

  const startTest = useCallback(() => {
    if (status !== "idle") return;
    setStatus("active");
    startTimeRef.current = Date.now();

    if (mode === "time") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            finishTestRef.current();
            return 0;
          }
          return t - 1;
        });
        setElapsed((e) => e + 1);

        // ── text refill ───────────────────────────────────────────────
        // Fires once per second. If the user is within 500 chars of the
        // end of the text, append 120 more words so they never hit a wall.
        const currentInput = statsRef.current.input;
        const charsLeft = textRef.current.length - currentInput.length;
        if (charsLeft < 500 && !refillInProgressRef.current) {
          refillInProgressRef.current = true;
          const extra = generateTestText(
            "time",
            useAppStore.getState().difficulty,
            120,
            useAppStore.getState().punctuation,
            useAppStore.getState().numbers,
            useAppStore.getState().quoteLength,
          );
          const appended = textRef.current + " " + extra;
          textRef.current = appended;
          setText(appended);
          refillInProgressRef.current = false;
        }
        // ─────────────────────────────────────────────────────────────
      }, 1000);
    } else if (mode !== "zen") {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    }
  }, [status, mode]);

  const recordKey = useCallback((code: string) => {
    setPressedKeys((prev) => new Set(prev).add(code));
    setKeyHeatmap((h) => ({ ...h, [code]: (h[code] ?? 0) + 1 }));
    setTimeout(() => {
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(code);
        return next;
      });
    }, 120);
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === "Tab") tabHeldRef.current = false;
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (useAppStore.getState().settingsOpen) return;

      if (e.key === "Tab") {
        e.preventDefault();
        tabHeldRef.current = true;
        return;
      }

      if (e.key === "Enter" && tabHeldRef.current) {
        e.preventDefault();
        tabHeldRef.current = false;
        reset();
        return;
      }

      if (status === "finished") return;

      if (status === "idle" && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        startTest();
      }

      recordKey(e.code);
      if (audioEnabled) {
        void audioManager.preload(soundPack);
        audioManager.play(e.key, e.code);
      }

      if (mode === "zen") {
        if (e.key === "Backspace") {
          setInput((prev) => prev.slice(0, -1));
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          setInput((prev) => prev + e.key);
          setCorrectChars((c) => c + 1);
          if (e.key === " ") {
            const next = currentWordStreak + 1;
            setCurrentWordStreak(next);
            setBestStreak((b) => Math.max(b, next));
          }
        }
        return;
      }

      const target = text;
      const pos = input.length;

      if (e.key === "Backspace") {
        e.preventDefault();
        if (input.length > 0) {
          setInput((prev) => prev.slice(0, -1));
        }
        return;
      }

      if (e.key.length !== 1 || e.ctrlKey || e.metaKey) return;
      e.preventDefault();

      if (pos >= textRef.current.length) return;

      const expected = textRef.current[pos];
      const typed = e.key;
      const isCorrect = typed === expected;
      const nextInput = input + typed;
      const nextCorrect = correctChars + (isCorrect ? 1 : 0);
      const nextErrors = errors + (isCorrect ? 0 : 1);

      let nextWordStreak = currentWordStreak;
      let wordPerfect = wordPerfectRef.current;

      if (!isCorrect) {
        nextWordStreak = 0;
        wordPerfect = false;
      } else if (expected === " ") {
        if (wordPerfect) nextWordStreak = currentWordStreak + 1;
        wordPerfect = true;
      }

      wordPerfectRef.current = wordPerfect;
      const nextBestStreak = Math.max(bestStreak, nextWordStreak);

      let nextHistory = wpmHistory;
      if (startTimeRef.current) {
        const dur = Date.now() - startTimeRef.current;
        const wpm = calcWpm(nextCorrect, dur);
        nextHistory = [...wpmHistory, { time: Math.floor(dur / 1000), wpm }];
      }

      statsRef.current = {
        input: nextInput,
        correctChars: nextCorrect,
        errors: nextErrors,
        bestStreak: nextBestStreak,
        wpmHistory: nextHistory,
        keyHeatmap: statsRef.current.keyHeatmap,
      };

      setInput(nextInput);

      if (isCorrect) {
        setCorrectChars(nextCorrect);
        setCurrentWordStreak(nextWordStreak);
        setBestStreak(nextBestStreak);
      } else {
        setErrors(nextErrors);
        setCurrentWordStreak(0);
      }
      setWpmHistory(nextHistory);

      const newLen = nextInput.length;

      if (mode === "words" && newLen >= textRef.current.length) {
        finishTestRef.current();
      } else if (mode === "quote" && newLen >= textRef.current.length) {
        finishTestRef.current();
      }
    },
    [
      status,
      mode,
      input,
      correctChars,
      currentWordStreak,
      bestStreak,
      wpmHistory,
      errors,
      audioEnabled,
      startTest,
      recordKey,
      reset,
      difficulty,
      punctuation,
      numbers,
      quoteLength,
      soundPack,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (mode === "time" && status === "active") {
      setTimeLeft(timer);
    }
  }, [timer, mode, status]);

  const liveWpm =
    startTimeRef.current && status === "active"
      ? calcWpm(correctChars, Date.now() - startTimeRef.current)
      : 0;

  const liveAccuracy =
    input.length > 0
      ? calcAccuracy(correctChars, input.length)
      : 100;

  return {
    text,
    input,
    status,
    timeLeft,
    elapsed,
    errors,
    correctChars,
    liveWpm,
    liveAccuracy,
    bestStreak,
    wpmHistory,
    keyHeatmap,
    pressedKeys,
    result,
    reset,
    finishTest,
  };
}
