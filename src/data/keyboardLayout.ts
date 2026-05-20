export interface KeyDef {
  id: string;
  label: string;
  code: string;
  width?: number;
  accent?: boolean;
  modifier?: boolean;
  row?: number;
}

// 75% layout — Keychron K2/K3 style
//
// All rows tuned so nav key right-edges flush with the case right edge:
//   Case width reference = Row 4 = 778.8px
//
//   Row 1: esc(1)+F×12(1.12)+del(1)+ins(1) = 16.44u, 14g → 777px  (F-keys naturally smaller)
//   Row 2: `+digits+−+=+bksp(2.5)+pgup     = 16.5u,  14g → 779.5px ✓
//   Row 3: tab(1.5)+QWERTY+[+]+bksl(2.0)+pgdn = 16.5u, 14g → 779.5px ✓
//   Row 4: caps(1.6)+ASDF+enter(2)+home     = 16.6u,  13g → 778.8px ✓ (reference)
//   Row 5: lshift(2)+ZXCV+rshift(2.6)+↑+end = 16.6u,  13g → 778.8px ✓
//   Row 6: mods+space(6.9)+mods+←+↓+→      = 17.1u,   9g → 780.3px ✓
//
// Arrow alignment (gap-count aware):
//   ↑ left edge: (2+10+2.6)×43 + 12×5 = 627.8+60 = 687.8px
//   ↓ left edge: (7.2+6.9+1)×43 + 8×5 = 649.3+40 = 689.3px  (≈1.5px — imperceptible) ✓
export const KEYBOARD_LAYOUT: KeyDef[][] = [
  // ── Row 1: F-row ─────────────────────────────────────────────
  [
    { id: "esc",  label: "esc", code: "Escape", accent: true,   width: 1    },
    { id: "f1",   label: "F1",  code: "F1",     modifier: true, width: 1.12 },
    { id: "f2",   label: "F2",  code: "F2",     modifier: true, width: 1.12 },
    { id: "f3",   label: "F3",  code: "F3",     modifier: true, width: 1.12 },
    { id: "f4",   label: "F4",  code: "F4",     modifier: true, width: 1.12 },
    { id: "f5",   label: "F5",  code: "F5",     modifier: true, width: 1.12 },
    { id: "f6",   label: "F6",  code: "F6",     modifier: true, width: 1.12 },
    { id: "f7",   label: "F7",  code: "F7",     modifier: true, width: 1.12 },
    { id: "f8",   label: "F8",  code: "F8",     modifier: true, width: 1.12 },
    { id: "f9",   label: "F9",  code: "F9",     modifier: true, width: 1.12 },
    { id: "f10",  label: "F10", code: "F10",    modifier: true, width: 1.12 },
    { id: "f11",  label: "F11", code: "F11",    modifier: true, width: 1.12 },
    { id: "f12",  label: "F12", code: "F12",    modifier: true, width: 1.12 },
    { id: "del",  label: "Del", code: "Delete", modifier: true, width: 1    },
    { id: "ins",  label: "Ins", code: "Insert", modifier: true, width: 1    },
  ],
  // ── Row 2: number row ────────────────────────────────────────
  // bksp = 2.5u → PgUp right edge = 736.5+43 = 779.5px ≈ case right ✓
  [
    { id: "backtick", label: "`", code: "Backquote", width: 1 },
    { id: "1",  label: "1", code: "Digit1", width: 1 },
    { id: "2",  label: "2", code: "Digit2", width: 1 },
    { id: "3",  label: "3", code: "Digit3", width: 1 },
    { id: "4",  label: "4", code: "Digit4", width: 1 },
    { id: "5",  label: "5", code: "Digit5", width: 1 },
    { id: "6",  label: "6", code: "Digit6", width: 1 },
    { id: "7",  label: "7", code: "Digit7", width: 1 },
    { id: "8",  label: "8", code: "Digit8", width: 1 },
    { id: "9",  label: "9", code: "Digit9", width: 1 },
    { id: "0",  label: "0", code: "Digit0", width: 1 },
    { id: "minus", label: "-", code: "Minus", width: 1 },
    { id: "equal", label: "=", code: "Equal", width: 1 },
    { id: "bksp",  label: "⌫",    code: "Backspace", modifier: true, width: 2.5 },
    { id: "pgup",  label: "PgUp", code: "PageUp",    modifier: true, width: 1   },
  ],
  // ── Row 3: QWERTY row ────────────────────────────────────────
  // backslash = 2.0u → PgDn right edge = 736.5+43 = 779.5px ≈ case right ✓
  [
    { id: "tab",       label: "Tab", code: "Tab",         modifier: true, width: 1.5 },
    { id: "q",  label: "Q", code: "KeyQ", width: 1 },
    { id: "w",  label: "W", code: "KeyW", width: 1 },
    { id: "e",  label: "E", code: "KeyE", width: 1 },
    { id: "r",  label: "R", code: "KeyR", width: 1 },
    { id: "t",  label: "T", code: "KeyT", width: 1 },
    { id: "y",  label: "Y", code: "KeyY", width: 1 },
    { id: "u",  label: "U", code: "KeyU", width: 1 },
    { id: "i",  label: "I", code: "KeyI", width: 1 },
    { id: "o",  label: "O", code: "KeyO", width: 1 },
    { id: "p",  label: "P", code: "KeyP", width: 1 },
    { id: "lbracket",  label: "[",  code: "BracketLeft",  width: 1   },
    { id: "rbracket",  label: "]",  code: "BracketRight", width: 1   },
    { id: "backslash", label: "\\", code: "Backslash",    width: 2.0 },
    { id: "pgdn", label: "PgDn", code: "PageDown", modifier: true, width: 1 },
  ],
  // ── Row 4: home row  (reference — sets case width at 778.8px) ─
  [
    { id: "caps",      label: "Caps", code: "CapsLock",  modifier: true, width: 1.6 },
    { id: "a",  label: "A", code: "KeyA", width: 1 },
    { id: "s",  label: "S", code: "KeyS", width: 1 },
    { id: "d",  label: "D", code: "KeyD", width: 1 },
    { id: "f",  label: "F", code: "KeyF", width: 1 },
    { id: "g",  label: "G", code: "KeyG", width: 1 },
    { id: "h",  label: "H", code: "KeyH", width: 1 },
    { id: "j",  label: "J", code: "KeyJ", width: 1 },
    { id: "k",  label: "K", code: "KeyK", width: 1 },
    { id: "l",  label: "L", code: "KeyL", width: 1 },
    { id: "semicolon", label: ";", code: "Semicolon", width: 1 },
    { id: "quote",     label: "'", code: "Quote",     width: 1 },
    { id: "enter",     label: "↵", code: "Enter",     modifier: true, width: 2 },
    { id: "home", label: "Home", code: "Home", modifier: true, width: 2 },
  ],
  // ── Row 5: shift row ─────────────────────────────────────────
  // rshift = 2.6u → End right edge = 670.8+65+43 = 778.8px = case right ✓
  [
    { id: "lshift", label: "⇧", code: "ShiftLeft",  modifier: true, width: 2   },
    { id: "z",  label: "Z", code: "KeyZ", width: 1 },
    { id: "x",  label: "X", code: "KeyX", width: 1 },
    { id: "c",  label: "C", code: "KeyC", width: 1 },
    { id: "v",  label: "V", code: "KeyV", width: 1 },
    { id: "b",  label: "B", code: "KeyB", width: 1 },
    { id: "n",  label: "N", code: "KeyN", width: 1 },
    { id: "m",  label: "M", code: "KeyM", width: 1 },
    { id: "comma",  label: ",", code: "Comma",  width: 1 },
    { id: "period", label: ".", code: "Period", width: 1 },
    { id: "slash",  label: "/", code: "Slash",  width: 1 },
    { id: "rshift", label: "⇧", code: "ShiftRight", modifier: true, width: 2.6 },
    { id: "up",  label: "↑", code: "ArrowUp", modifier: true, width: 1 },
    { id: "end", label: "End", code: "End",    modifier: true, width: 1 },
  ],
  // ── Row 6: bottom row ────────────────────────────────────────
  // space = 6.9u re-aligns ↓ under ↑ after rshift change:
  //   ↑ @ 14.6u×43+12×5 = 687.8px
  //   ↓ @ (7.2+6.9+1)×43+8×5 = 689.3px  (1.5px — imperceptible) ✓
  [
    { id: "lctrl",  label: "Ctrl", code: "ControlLeft",  modifier: true, width: 1.2 },
    { id: "lmeta",  label: "⌘",    code: "MetaLeft",     modifier: true, width: 1.2 },
    { id: "lalt",   label: "Alt",  code: "AltLeft",      modifier: true, width: 1.2 },
    { id: "space",  label: "",     code: "Space",                         width: 6.9 },
    { id: "ralt",   label: "Alt",  code: "AltRight",     modifier: true, width: 1.2 },
    { id: "rmeta",  label: "⌘",    code: "MetaRight",    modifier: true, width: 1.2 },
    { id: "rctrl",  label: "Ctrl", code: "ControlRight", modifier: true, width: 1.2 },
    { id: "left",  label: "←", code: "ArrowLeft",  modifier: true, width: 1 },
    { id: "down",  label: "↓", code: "ArrowDown",  modifier: true, width: 1 },
    { id: "right", label: "→", code: "ArrowRight", modifier: true, width: 1 },
  ],
];

export function codeToChar(code: string, shift = false): string | null {
  const map: Record<string, string> = {
    Space: " ",
    Enter: "\n",
    Backquote: "`",
    Minus: "-",
    Equal: "=",
    BracketLeft: "[",
    BracketRight: "]",
    Backslash: "\\",
    Semicolon: ";",
    Quote: "'",
    Comma: ",",
    Period: ".",
    Slash: "/",
    Digit1: "1", Digit2: "2", Digit3: "3", Digit4: "4", Digit5: "5",
    Digit6: "6", Digit7: "7", Digit8: "8", Digit9: "9", Digit0: "0",
    KeyA: "a", KeyB: "b", KeyC: "c", KeyD: "d", KeyE: "e", KeyF: "f",
    KeyG: "g", KeyH: "h", KeyI: "i", KeyJ: "j", KeyK: "k", KeyL: "l",
    KeyM: "m", KeyN: "n", KeyO: "o", KeyP: "p", KeyQ: "q", KeyR: "r",
    KeyS: "s", KeyT: "t", KeyU: "u", KeyV: "v", KeyW: "w", KeyX: "x",
    KeyY: "y", KeyZ: "z",
  };
  const c = map[code];
  if (!c) return null;
  return shift && c.length === 1 ? c.toUpperCase() : c;
}
