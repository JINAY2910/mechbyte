"use client";

import { useEffect, useRef, useState } from "react";
import { KEYBOARD_LAYOUT } from "@/data/keyboardLayout";
import type { KeyDef } from "@/data/keyboardLayout";
import { Keycap } from "./Keycap";
import { useAppStore } from "@/store/useAppStore";

interface KeyboardVisualizerProps {
  pressedKeys: Set<string>;
  onKeyClick?: (keyDef: KeyDef) => void;
}

export function KeyboardVisualizer({ pressedKeys, onKeyClick }: KeyboardVisualizerProps) {
  const { animationIntensity, showKeyboard } = useAppStore();
  const wrapRef  = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const unitSize = 43;
  const gap      = 5;

  useEffect(() => {
    const wrap  = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    const update = () => {
      const s = Math.min(1, wrap.clientWidth / inner.scrollWidth);
      console.log("Keyboard dimensions:", {
        wrapWidth: wrap.clientWidth,
        keyboardWidth: inner.scrollWidth,
        scale: s
      });
      setScale(Number.isFinite(s) && s > 0 ? s : 1);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [showKeyboard]);

  if (!showKeyboard) return null;

  return (
    <div ref={wrapRef} className="flex w-full justify-center overflow-hidden">
      <div
        ref={innerRef}
        className="relative origin-bottom"
        style={{ transform: `scale(${scale})` }}
      >
        {/* ── crimson underglow ──────────────────────────────── */}
        <div
          className="absolute inset-x-[8%] -bottom-4 h-8 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(255,59,92,0.35) 0%, transparent 70%)",
            filter: "blur(10px)",
          }}
          aria-hidden
        />

        {/* ── outer bezel / case body ───────────────────────── */}
        <div
          className="rounded-[18px] p-[11px]"
          style={{
            background: "linear-gradient(165deg, #2e2a3a 0%, #1c1a26 100%)",
            boxShadow: [
              "0 28px 60px rgba(0,0,0,0.7)",
              "0 8px 20px rgba(0,0,0,0.4)",
              "0 0 0 1px rgba(255,255,255,0.07)",
              "inset 0 1px 0 rgba(255,255,255,0.09)",
              "inset 0 -1px 0 rgba(0,0,0,0.3)",
            ].join(", "),
          }}
        >
          {/* ── inner plate / switch plate ────────────────── */}
          <div
            className="rounded-[10px] p-[6px]"
            style={{
              background: "linear-gradient(180deg, #1e1b2b 0%, #171523 100%)",
              boxShadow: [
                "inset 0 2px 8px rgba(0,0,0,0.55)",
                "inset 0 0 0 1px rgba(0,0,0,0.45)",
                "0 0 0 1px rgba(255,255,255,0.03)",
              ].join(", "),
            }}
          >
            {/* ── key rows ──────────────────────────────── */}
            <div className="flex flex-col" style={{ gap }}>
              {KEYBOARD_LAYOUT.map((row, rowIdx) => (
                <div key={rowIdx} className="flex" style={{ gap }}>
                  {row.map((keyDef) => (
                    <Keycap
                      key={keyDef.id}
                      keyDef={keyDef}
                      pressed={pressedKeys.has(keyDef.code)}
                      animationIntensity={animationIntensity}
                      unitSize={unitSize}
                      onKeyClick={onKeyClick}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
