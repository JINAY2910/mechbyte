import { QUOTES } from "@/data/quotes";
import {
  EASY_WORDS,
  HARD_WORDS,
  NUMBER_CHARS,
  PUNCTUATION_CHARS,
} from "@/data/words";
import type { Difficulty, QuoteLength, TestMode } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickWords(pool: string[], count: number): string[] {
  const shuffled = shuffle(pool);
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(shuffled[i % shuffled.length]);
  }
  return result;
}

function maybePunctuate(word: string, enablePunct: boolean): string {
  if (!enablePunct || Math.random() > 0.12) return word;
  const p = PUNCTUATION_CHARS[Math.floor(Math.random() * 6)];
  return Math.random() > 0.5 ? word + p : p + word;
}

function maybeNumber(word: string, enableNumbers: boolean): string {
  if (!enableNumbers || Math.random() > 0.08) return word;
  const n = NUMBER_CHARS[Math.floor(Math.random() * NUMBER_CHARS.length)];
  return Math.random() > 0.5 ? `${word}${n}` : `${n}${word}`;
}

export function generateWordText(
  wordCount: number,
  difficulty: Difficulty,
  punctuation: boolean,
  numbers: boolean,
): string {
  const pool = difficulty === "easy" ? EASY_WORDS : HARD_WORDS;
  const words = pickWords(pool, wordCount).map((w) =>
    maybeNumber(maybePunctuate(w, punctuation), numbers),
  );
  return words.join(" ");
}

export function generateTimedText(
  difficulty: Difficulty,
  punctuation: boolean,
  numbers: boolean,
): string {
  return generateWordText(65, difficulty, punctuation, numbers);
}

function quotesForLength(length: QuoteLength) {
  const ranges: Record<QuoteLength, [number, number]> = {
    short: [0, 70],
    medium: [70, 140],
    long: [140, Infinity],
  };
  const [min, max] = ranges[length];
  const filtered = QUOTES.filter((q) => q.text.length >= min && q.text.length < max);
  return filtered.length > 0 ? filtered : QUOTES;
}

export function generateQuoteText(length: QuoteLength = "medium"): {
  text: string;
  author: string;
} {
  const pool = quotesForLength(length);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function generateTestText(
  mode: TestMode,
  difficulty: Difficulty,
  wordCount: number,
  punctuation: boolean,
  numbers: boolean,
  quoteLength: QuoteLength = "medium",
): string {
  if (mode === "quote") {
    return generateQuoteText(quoteLength).text;
  }
  if (mode === "zen") {
    return "";
  }
  // Both "words" and "time" use wordCount — for "time" the caller passes
  // a duration-scaled count (e.g. 280 for 60 s, 560 for 120 s).
  return generateWordText(wordCount, difficulty, punctuation, numbers);
}
