"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
const FONTS = [
  { id: "jetbrains" as const, label: "JetBrains Mono" },
  { id: "ibm-plex" as const, label: "IBM Plex Mono" },
];

export function SettingsDrawer() {
  const {
    settingsOpen,
    setSettingsOpen,
    audioEnabled,
    volume,
    showKeyboard,
    typingFont,
    focusMode,
    showLiveStats,
    updateSettings,
  } = useAppStore();

  const [fontOpen, setFontOpen] = useState(false);

  useEffect(() => {
    if (!settingsOpen) {
      setFontOpen(false);
    }
  }, [settingsOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSettingsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setSettingsOpen]);

  const fontLabel = FONTS.find((f) => f.id === typingFont)?.label ?? "JetBrains Mono";

  return (
    <AnimatePresence>
      {settingsOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSettingsOpen(false)}
          />
          <motion.div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              role="dialog"
              aria-modal
              aria-labelledby="settings-title"
              className="pointer-events-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141118] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div className="flex items-center justify-between px-6 pt-6 pb-2">
                <h2
                  id="settings-title"
                  className="text-[1.35rem] font-semibold tracking-tight text-[var(--color-text)]"
                >
                  Settings
                </h2>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-[var(--color-text-dim)] transition-colors hover:bg-white/[0.1] hover:text-[var(--color-text)]"
                  aria-label="Close settings"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </motion.div>

              <motion.div className="max-h-[min(70vh,560px)] overflow-y-auto px-6 pb-4">
                <Section title="Typing">
                  <motion.div>
                    <LinkRow
                      label="Font"
                      value={fontLabel}
                      onClick={() => {
                        setFontOpen((o) => !o);
                      }}
                      open={fontOpen}
                    />
                    {fontOpen && (
                      <SubMenu>
                        {FONTS.map((f) => (
                          <SubMenuItem
                            key={f.id}
                            label={f.label}
                            active={typingFont === f.id}
                            onClick={() => {
                              updateSettings({ typingFont: f.id });
                              setFontOpen(false);
                            }}
                          />
                        ))}
                      </SubMenu>
                    )}
                  </motion.div>
                  <SettingToggle
                    label="Live stats"
                    description="Show WPM and accuracy while typing"
                    checked={showLiveStats}
                    onChange={(v) => updateSettings({ showLiveStats: v })}
                  />
                  <SettingToggle
                    label="Ghost mode"
                    description="Dim upcoming words for focus"
                    checked={focusMode}
                    onChange={(v) => updateSettings({ focusMode: v })}
                  />
                </Section>

                <Section title="Keyboard">
                  <SettingToggle
                    label="Show keyboard"
                    description="Virtual keyboard below the test"
                    checked={showKeyboard}
                    onChange={(v) => updateSettings({ showKeyboard: v })}
                  />
                  <SettingToggle
                    label="Sound"
                    description="Mechanical key sounds"
                    checked={audioEnabled}
                    onChange={(v) => updateSettings({ audioEnabled: v })}
                  />
                  {audioEnabled && (
                    <motion.div className="pt-1 pb-2">
                      <motion.div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={volume}
                          onChange={(e) =>
                            updateSettings({ volume: Number(e.target.value) })
                          }
                          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/[0.08] accent-[var(--color-crimson)]"
                        />
                        <span className="w-10 text-right text-sm tabular-nums text-[var(--color-text-dim)]">
                          {Math.round(volume * 100)}%
                        </span>
                      </motion.div>
                    </motion.div>
                  )}
                </Section>
              </motion.div>

              <motion.div className="border-t border-white/[0.06] px-6 py-4 text-center text-[13px] text-[var(--color-text-muted)]">
                Press{" "}
                <kbd className="mx-0.5 rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[11px] text-[var(--color-text-dim)]">
                  ⌘ K
                </kbd>{" "}
                to toggle settings
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h3 className="mb-3 text-[11px] font-medium tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
        {title}
      </h3>
      <motion.div className="space-y-1">{children}</motion.div>
    </section>
  );
}

function LinkRow({
  label,
  value,
  onClick,
  open,
}: {
  label: string;
  value: string;
  onClick: () => void;
  open?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl px-1 py-3 text-left transition-opacity hover:opacity-80"
    >
      <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>
      <span className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
        {value}
        <ChevronRight
          size={16}
          className={cn(
            "transition-transform",
            open && "rotate-90 text-[var(--color-crimson)]",
          )}
        />
      </span>
    </button>
  );
}

function SubMenu({ children }: { children: React.ReactNode }) {
  return (
    <motion.div className="mb-2 ml-1 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03]">
      {children}
    </motion.div>
  );
}

function SubMenuItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full px-4 py-2.5 text-left text-sm transition-colors",
        active
          ? "bg-[var(--color-crimson)]/15 text-[var(--color-crimson)]"
          : "text-[var(--color-text-dim)] hover:bg-white/[0.04]",
      )}
    >
      {label}
    </button>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <motion.div className="flex items-center justify-between gap-4 rounded-xl px-1 py-3">
      <motion.div className="min-w-0">
        <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-[var(--color-text-muted)]">
          {description}
        </p>
      </motion.div>
      <Toggle checked={checked} onChange={onChange} />
    </motion.div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-[46px] shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-[var(--color-crimson)]" : "bg-white/[0.12]",
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "left-[23px]" : "left-1",
        )}
      />
    </button>
  );
}
