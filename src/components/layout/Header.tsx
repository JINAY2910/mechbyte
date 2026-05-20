"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Github, Settings, Volume2, VolumeX } from "lucide-react";
import { isTimedFocusActive } from "@/lib/typing/focusMode";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

export function Header() {
  const { audioEnabled, updateSettings, setSettingsOpen, mode, typingStatus } =
    useAppStore();
  const blurred = isTimedFocusActive(mode, typingStatus);

  const [isMac, setIsMac] = useState(true);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(/Mac|iPhone|iPod|iPad/i.test(navigator.userAgent));
    }
  }, []);

  const isMobileActive = typingStatus === "active";

  return (
    <header
      className={cn(
        "layout-shift flex shrink-0 justify-center px-6 py-2.5 md:px-10 md:py-5 transition-all duration-300",
        blurred && "focus-blur",
        isMobileActive && "max-md:h-0 max-md:py-0 max-md:opacity-0 max-md:pointer-events-none overflow-hidden"
      )}
    >
      <div className="relative flex w-full max-w-5xl items-center justify-between">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="flex cursor-pointer items-center gap-2.5 font-semibold text-[1.35rem] tracking-tight"
        >
          <Image
            src="/logo.png"
            alt="MechByte"
            width={26}
            height={29}
            className="h-[26px] w-auto"
            priority
          />
          <span className="leading-none">
            <span className="text-[var(--color-crimson)]">mech</span>
            <span className="text-[var(--color-text)]">byte</span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateSettings({ audioEnabled: !audioEnabled })}
            className="flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3.5 py-2 text-sm text-[var(--color-text-dim)] transition-colors hover:bg-white/[0.08] hover:text-[var(--color-text)]"
            aria-label="Toggle audio"
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="hidden sm:inline">Audio</span>
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="group flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3.5 py-2 text-sm text-[var(--color-text-dim)] transition-all duration-200 hover:bg-white/[0.08] hover:text-[var(--color-text)]"
          >
            <Settings size={16} className="transition-transform duration-300 group-hover:rotate-45" />
            <span className="hidden sm:inline">Settings</span>
            <kbd className="hidden items-center gap-[2px] rounded-[4px] border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[11px] font-mono text-[var(--color-text-muted)]/70 transition-all duration-200 group-hover:border-[var(--color-crimson)]/40 group-hover:text-[var(--color-crimson)] leading-none sm:inline-flex select-none">
              <span className="text-[12.5px] leading-none">{isMac ? "⌘" : "Ctrl"}</span>
              <span className="text-[10px] leading-none">K</span>
            </kbd>
          </button>
          <a
            href="https://github.com/JINAY2910/mechbyte"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#f5f3f7] px-4 py-2 text-sm font-medium text-[#0e0c11]"
          >
            <Github size={16} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
