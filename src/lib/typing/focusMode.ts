import type { TestMode, TypingTestStatus } from "@/lib/types";

/** Timed focus mode: blur chrome while timed test is running */
export function isTimedFocusActive(mode: TestMode, status: TypingTestStatus) {
  return mode === "time" && status === "active";
}
