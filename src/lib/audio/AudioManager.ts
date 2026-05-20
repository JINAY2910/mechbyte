import type { SoundPack } from "@/lib/types";
import { getSoundBuffer } from "./audioPreloader";
import {
  resolveSoundCode,
  SOUND_DEFINES_DOWN,
} from "./soundSprite";

export class AudioManager {
  private ctx: AudioContext | null = null;
  private rawBuffer: ArrayBuffer | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private enabled = true;
  private volume = 0.7;
  private loading: Promise<void> | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const resumeContext = (e: Event) => {
        if (e.isTrusted) {
          if (!this.ctx) {
            this.init();
          } else if (this.ctx.state === "suspended") {
            void this.ctx.resume();
          }
        }
      };
      window.addEventListener("click", resumeContext, { passive: true });
      window.addEventListener("touchstart", resumeContext, { passive: true });
    }
  }

  init() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
      } catch (e) {
        console.warn("Web Audio API is not supported in this browser", e);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /** Kept for settings UI compatibility — sprite is shared across packs */
  setSoundPack(_pack: SoundPack) {
    // same sprite for all packs
  }

  async preload(_pack?: SoundPack) {
    if (this.loading) return this.loading;

    this.loading = (async () => {
      const ab = await getSoundBuffer();
      if (!ab) return;
      this.rawBuffer = ab;

      // Decode using OfflineAudioContext immediately to avoid any autoplay warnings
      try {
        const OfflineCtxClass = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
        if (OfflineCtxClass) {
          const offlineCtx = new OfflineCtxClass(1, 1, 44100);
          this.audioBuffer = await offlineCtx.decodeAudioData(ab.slice(0));
        }
      } catch (err) {
        // Fallback to normal decode on user gesture
        if (this.ctx && !this.audioBuffer) {
          try {
            this.audioBuffer = await this.ctx.decodeAudioData(ab.slice(0));
          } catch {
            this.audioBuffer = null;
          }
        }
      }
    })();

    return this.loading;
  }

  play(key: string, code?: string, isTrusted = false) {
    if (!this.enabled) return;

    if (isTrusted) {
      this.init();
    }

    if (!this.ctx || this.ctx.state === "suspended" || !this.audioBuffer) {
      // Decode raw buffer if it wasn't decoded yet and ctx is running
      if (this.ctx && this.ctx.state === "running" && this.rawBuffer && !this.audioBuffer) {
        void this.ctx.decodeAudioData(this.rawBuffer.slice(0))
          .then((decoded) => {
            this.audioBuffer = decoded;
            this.playSprite(key, code);
          })
          .catch(() => {});
      }
      return;
    }

    this.playSprite(key, code);
  }

  private playSprite(key: string, code?: string) {
    const ctx = this.ctx;
    const buffer = this.audioBuffer;
    if (!ctx || !buffer) return;

    const resolved = resolveSoundCode(key, code);
    const slice = SOUND_DEFINES_DOWN[resolved] ?? SOUND_DEFINES_DOWN.KeyA;
    const [startMs, durationMs] = slice;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = this.volume;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0, startMs / 1000, durationMs / 1000);
  }
}

export const audioManager = new AudioManager();
