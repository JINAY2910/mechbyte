/** Per-key [startMs, durationMs] slices in `/sounds/sound.ogg`. */
export type SoundSlice = [startMs: number, durationMs: number];

export const SOUND_SPRITE_URL = "/sounds/sound.ogg";

export const SOUND_DEFINES_DOWN: Record<string, SoundSlice> = {
  Escape: [9069, 115],
  F1: [2754, 104],
  F2: [3155, 99],
  F3: [3545, 103],
  F4: [3913, 100],
  F5: [4305, 96],
  F6: [4666, 103],
  F7: [5034, 110],
  F8: [5433, 103],
  F9: [7795, 109],
  F10: [6146, 105],
  F11: [7322, 97],
  F12: [7699, 98],
  Delete: [14199, 100],
  Backquote: [9069, 115],
  Digit1: [2280, 109],
  Digit2: [9444, 102],
  Digit3: [9833, 103],
  Digit4: [10185, 107],
  Digit5: [10551, 108],
  Digit6: [10899, 107],
  Digit7: [11282, 99],
  Digit8: [11623, 103],
  Digit9: [11976, 110],
  Digit0: [12337, 108],
  Minus: [12667, 107],
  Equal: [13058, 105],
  Backspace: [13765, 101],
  PageUp: [14522, 108],
  Tab: [15916, 97],
  KeyQ: [16284, 83],
  KeyW: [16637, 97],
  KeyE: [16964, 105],
  KeyR: [17275, 102],
  KeyT: [17613, 108],
  KeyY: [17957, 95],
  KeyU: [18301, 105],
  KeyI: [18643, 110],
  KeyO: [18994, 98],
  KeyP: [19331, 108],
  BracketLeft: [19671, 94],
  BracketRight: [20020, 96],
  Backslash: [20387, 97],
  PageDown: [14852, 93],
  CapsLock: [22560, 100],
  KeyA: [22869, 109],
  KeyS: [23237, 98],
  KeyD: [23586, 103],
  KeyF: [23898, 98],
  KeyG: [24237, 102],
  KeyH: [24550, 106],
  KeyJ: [24917, 103],
  KeyK: [25274, 102],
  KeyL: [25625, 101],
  Semicolon: [25989, 100],
  Quote: [26335, 99],
  Enter: [26703, 100],
  Home: [20766, 102],
  ShiftLeft: [28109, 99],
  KeyZ: [28550, 92],
  KeyX: [28855, 101],
  KeyC: [29557, 112],
  KeyV: [29557, 112],
  KeyB: [29909, 98],
  KeyN: [30252, 112],
  KeyM: [30605, 101],
  Comma: [30965, 117],
  Period: [31315, 97],
  Slash: [31659, 96],
  ShiftRight: [28109, 99],
  ArrowUp: [32429, 96],
  End: [21409, 83],
  ControlLeft: [8036, 92],
  AltLeft: [34551, 96],
  MetaLeft: [34551, 96],
  Space: [33857, 100],
  MetaRight: [34181, 97],
  ControlRight: [8036, 92],
  ArrowLeft: [36907, 90],
  ArrowDown: [37267, 94],
  ArrowRight: [37586, 88],
  AltRight: [35878, 90],
};

/** Map typed character to nearest sprite when code is unavailable */
const CHAR_TO_CODE: Record<string, string> = {
  " ": "Space",
  Enter: "Enter",
  Backspace: "Backspace",
  Tab: "Tab",
};

export function resolveSoundCode(key: string, code?: string): string {
  if (code && SOUND_DEFINES_DOWN[code]) return code;
  if (CHAR_TO_CODE[key]) return CHAR_TO_CODE[key];

  if (key.length === 1) {
    const upper = key.toUpperCase();
    if (upper >= "A" && upper <= "Z") return `Key${upper}`;
    if (key >= "0" && key <= "9") return `Digit${key}`;
    if (key === "-") return "Minus";
    if (key === "=") return "Equal";
    if (key === "[") return "BracketLeft";
    if (key === "]") return "BracketRight";
    if (key === "\\") return "Backslash";
    if (key === ";") return "Semicolon";
    if (key === "'") return "Quote";
    if (key === ",") return "Comma";
    if (key === ".") return "Period";
    if (key === "/") return "Slash";
    if (key === "`") return "Backquote";
  }

  return "KeyA";
}
