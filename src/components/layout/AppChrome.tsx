"use client";

import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { SettingsDrawer } from "@/components/settings/SettingsDrawer";
import { useAppStore } from "@/store/useAppStore";

/** AppChrome shell */
export function AppChrome({ children }: { children: ReactNode }) {
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const typingStatus = useAppStore((s) => s.typingStatus);

  const setOverscroll = (enabled: boolean) => {
    document.documentElement.style.overscrollBehavior = enabled ? "" : "none";
    document.body.style.overscrollBehavior = enabled ? "" : "none";
  };

  // Re-enable bounce when test resets to idle
  useEffect(() => {
    if (typingStatus === "idle") setOverscroll(true);
  }, [typingStatus]);

  // Synchronously kill overscroll on FIRST keydown — before React re-renders
  // This prevents the one-time bounce that happens when typing begins
  useEffect(() => {
    const onFirstKey = (e: KeyboardEvent) => {
      // Ignore modifier-only shortcuts
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      setOverscroll(false);
    };
    document.addEventListener("keydown", onFirstKey, { capture: true });
    return () => document.removeEventListener("keydown", onFirstKey, { capture: true });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const open = useAppStore.getState().settingsOpen;
        setSettingsOpen(!open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setSettingsOpen]);

  return (
    <motion.div className="app-shell">
      <Header />
      {children}
      <SettingsDrawer />
    </motion.div>
  );
}
