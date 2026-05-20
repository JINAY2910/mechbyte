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
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, scale: 1 });

  const unitSize = 38;
  const gap      = 4;

  useEffect(() => {
    const wrap  = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    const update = () => {
      const parentWidth = wrap.clientWidth;
      const unscaledWidth = inner.scrollWidth;
      const unscaledHeight = inner.scrollHeight;
      
      const widthScale = parentWidth / unscaledWidth;
      
      // 820px is the threshold for a full scale keyboard.
      // Below 820px window height, we scale the keyboard down proportionally to fit the shorter viewport.
      const heightScale = typeof window !== "undefined" ? window.innerHeight / 820 : 1;
      
      const s = Math.min(1, widthScale, heightScale);

      setDimensions({
        width: unscaledWidth,
        height: unscaledHeight,
        scale: Number.isFinite(s) && s > 0 ? s : 1,
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);

    if (typeof window !== "undefined") {
      window.addEventListener("resize", update);
    }

    return () => {
      ro.disconnect();
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", update);
      }
    };
  }, [showKeyboard]);

  if (!showKeyboard) return null;

  return (
    <div ref={wrapRef} className="flex w-full justify-center overflow-hidden">
      <div
        className="relative"
        style={{
          width: dimensions.width ? dimensions.width * dimensions.scale : "auto",
          height: dimensions.height ? dimensions.height * dimensions.scale : "auto",
        }}
      >
        <div
          ref={innerRef}
          className={`origin-top-left ${
            dimensions.width ? "absolute left-0 top-0" : "relative"
          }`}
          style={{ transform: `scale(${dimensions.scale})` }}
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
    </div>
  );
}
