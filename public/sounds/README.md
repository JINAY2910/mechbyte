# Keyboard sound sprite

MechByte uses one **`sound.ogg`** file (~39s) with per-key time slices.

## Files

| File | Purpose |
|------|---------|
| `sound.ogg` | Main sprite (required for real mechanical sounds) |
| `public_sounds_sound.ogg` | Fallback if you keep the original upload name |

The app preloads `sound.ogg` on startup and plays the correct slice for each key (e.g. `KeyA`, `Space`, `Backspace`).

## Replace sounds

1. Drop your own `sound.ogg` in this folder (or replace the existing file).
2. If your sprite uses different timings, edit `src/lib/audio/soundSprite.ts` (`SOUND_DEFINES_DOWN`).
3. Hard-refresh the browser.

Slice format: `{ KeyCode: [startMs, durationMs] }`.
