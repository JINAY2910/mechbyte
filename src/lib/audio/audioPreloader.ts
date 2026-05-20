import { SOUND_SPRITE_URL } from "./soundSprite";

let cachedBuffer: ArrayBuffer | null = null;
let fetchPromise: Promise<ArrayBuffer | null> | null = null;

const FALLBACK_URLS = [
  SOUND_SPRITE_URL,
  "/sounds/public_sounds_sound.ogg",
];

function startFetch(): Promise<ArrayBuffer | null> {
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    for (const url of FALLBACK_URLS) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const ab = await res.arrayBuffer();
        cachedBuffer = ab;
        return ab;
      } catch {
        // try next
      }
    }
    return null;
  })();

  return fetchPromise;
}

if (typeof window !== "undefined") {
  void startFetch();
}

export function getSoundBuffer(): Promise<ArrayBuffer | null> {
  if (cachedBuffer) return Promise.resolve(cachedBuffer);
  return startFetch();
}
