"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Difficulty,
  QuoteLength,
  SessionHistoryEntry,
  SoundPack,
  TestMode,
  TimerDuration,
  TypingTestStatus,
} from "@/lib/types";

interface AppSettings {
  audioEnabled: boolean;
  volume: number;
  soundPack: SoundPack;
  showKeyboard: boolean;
  fontSize: "sm" | "md" | "lg";
  typingFont: "jetbrains" | "ibm-plex";
  animationIntensity: "low" | "medium" | "high";
  rgbIntensity: number;
  focusMode: boolean;
  showLiveStats: boolean;
  punctuation: boolean;
  numbers: boolean;
}

interface AppState extends AppSettings {
  difficulty: Difficulty;
  mode: TestMode;
  timer: TimerDuration;
  wordCount: number;
  quoteLength: QuoteLength;
  settingsOpen: boolean;
  typingStatus: TypingTestStatus;
  inputFocused: boolean;
  sessionHistory: SessionHistoryEntry[];
  setTypingStatus: (status: TypingTestStatus) => void;
  setInputFocused: (focused: boolean) => void;
  setDifficulty: (d: Difficulty) => void;
  setMode: (m: TestMode) => void;
  setTimer: (t: TimerDuration) => void;
  setWordCount: (n: number) => void;
  setQuoteLength: (l: QuoteLength) => void;
  setSettingsOpen: (open: boolean) => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
  addSession: (entry: SessionHistoryEntry) => void;
  clearHistory: () => void;
}

const defaultSettings: AppSettings = {
  audioEnabled: true,
  volume: 0.7,
  soundPack: "tactile",
  showKeyboard: true,
  fontSize: "md",
  typingFont: "jetbrains",
  animationIntensity: "medium",
  rgbIntensity: 0.6,
  focusMode: false,
  showLiveStats: true,
  punctuation: false,
  numbers: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      difficulty: "hard",
      mode: "time",
      timer: 15,
      wordCount: 25,
      quoteLength: "medium",
      settingsOpen: false,
      typingStatus: "idle",
      inputFocused: false,
      sessionHistory: [],

      setTypingStatus: (typingStatus) => set({ typingStatus }),
      setInputFocused: (inputFocused) => set({ inputFocused }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setMode: (mode) => set({ mode }),
      setTimer: (timer) => set({ timer }),
      setWordCount: (wordCount) => set({ wordCount }),
      setQuoteLength: (quoteLength) => set({ quoteLength }),
      setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
      updateSettings: (partial) => set(partial),
      addSession: (entry) =>
        set((s) => ({
          sessionHistory: [entry, ...s.sessionHistory].slice(0, 50),
        })),
      clearHistory: () => set({ sessionHistory: [] }),
    }),
    {
      name: "mechbyte-settings",
      partialize: (state) => ({
        audioEnabled: state.audioEnabled,
        volume: state.volume,
        soundPack: state.soundPack,
        showKeyboard: state.showKeyboard,
        fontSize: state.fontSize,
        typingFont: state.typingFont,
        animationIntensity: state.animationIntensity,
        rgbIntensity: state.rgbIntensity,
        focusMode: state.focusMode,
        showLiveStats: state.showLiveStats,
        punctuation: state.punctuation,
        numbers: state.numbers,
        difficulty: state.difficulty,
        mode: state.mode,
        timer: state.timer,
        wordCount: state.wordCount,
        quoteLength: state.quoteLength,
        sessionHistory: state.sessionHistory,
      }),
    },
  ),
);
