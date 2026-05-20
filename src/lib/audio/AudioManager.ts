import type { SoundPack } from "@/lib/types";
import { getSoundBuffer } from "./audioPreloader";
import {
  resolveSoundCode,
  SOUND_DEFINES_DOWN,
} from "./soundSprite";

export class AudioManager {
  private ctx: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private enabled = true;
  private volume = 0.7;
  private loading: Promise<void> | null = null;

  init() {
    if (typeof window === "undefined") return;
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === "suspended") void this.ctx.resume();
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
    this.init();
    if (!this.ctx) return;

    this.loading = (async () => {
      const ab = await getSoundBuffer();
      if (!ab || !this.ctx) return;
      try {
        this.audioBuffer = await this.ctx.decodeAudioData(ab.slice(0));
      } catch {
        this.audioBuffer = null;
      }
    })();

    return this.loading;
  }

  play(key: string, code?: string) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    if (this.audioBuffer) {
      this.playSprite(key, code);
      return;
    }

    void this.preload().then(() => {
      if (this.audioBuffer) this.playSprite(key, code);
    });
  }

  private playSprite(key: string, code?: string) {
    const ctx = this.ctx;
    const buffer = this.audioBuffer;
    if (!ctx || !buffer) return;

    const resolved = resolveSoundCode(key, code);
    const slice = SOUND_DEFINES_DOWN[resolved] ?? SOUND_DEFINES_DOWN.KeyA;
    const [startMs, durationMs] = slice;

    if (ctx.state === "suspended") void ctx.resume();

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
