export type Difficulty = "easy" | "hard";
export type TestMode = "time" | "words" | "quote" | "zen";
export type TimerDuration = 15 | 30 | 60 | 120;
export type QuoteLength = "short" | "medium" | "long";
export type SoundPack = "linear" | "tactile" | "clicky" | "thock";
export type TypingTestStatus = "idle" | "active" | "finished";

export interface TypingChar {
  char: string;
  status: "pending" | "correct" | "incorrect" | "extra";
}

export interface WPMPoint {
  time: number;
  wpm: number;
}

export interface SessionResult {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  correctChars: number;
  totalChars: number;
  duration: number;
  bestStreak: number;
  wpmHistory: WPMPoint[];
  keyHeatmap: Record<string, number>;
  completedAt: number;
}

export interface SessionHistoryEntry extends SessionResult {
  id: string;
  mode: TestMode;
  difficulty: Difficulty;
}
