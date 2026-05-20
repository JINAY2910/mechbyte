"use client";

import type { KeyDef } from "@/data/keyboardLayout";

interface KeycapProps {
  keyDef: KeyDef;
  pressed: boolean;
  animationIntensity: "low" | "medium" | "high";
  unitSize: number;
  onKeyClick?: (keyDef: KeyDef) => void;
}

export function Keycap({
  keyDef,
  pressed,
  animationIntensity,
  unitSize,
  onKeyClick,
}: KeycapProps) {
  const width   = (keyDef.width ?? 1) * unitSize;
  const pressDepth = animationIntensity === "high" ? 5 : animationIntensity === "medium" ? 4 : 2.5;

  // ── dimensions ────────────────────────────────────────────────
  // Housing stays FIXED height — only the face translates DOWN on press.
  // This gives the "pressed from above" look: face sinks, wall below shrinks visually.
  const totalH = Math.round(unitSize * 0.98);
  const faceH  = Math.round(unitSize * 0.74);
  const faceY  = pressed ? pressDepth : 0;

  const isAccent = keyDef.accent;
  const isMod    = keyDef.modifier;

  /* ── colour tokens ─────────────────────────────────────────── */
  let housingBg: string;
  let faceGrad: string;
  let facePressGrad: string; // slightly darker when pressed
  let textColor: string;
  let outerBorder: string;
  let topGlow: string;
  let angleLine: string;

  if (isAccent) {
    housingBg     = "#9e1929";
    faceGrad      = "linear-gradient(170deg, #ff5570 0%, #e02a44 100%)";
    facePressGrad = "linear-gradient(170deg, #e8324d 0%, #c8223a 100%)";
    textColor     = "#fff";
    outerBorder   = "rgba(0,0,0,0.45)";
    topGlow       = "rgba(255,130,140,0.55)";
    angleLine     = "rgba(0,0,0,0.4)";
  } else if (isMod) {
    housingBg     = "#131119";
    faceGrad      = "linear-gradient(170deg, #3c3848 0%, #2b2836 100%)";
    facePressGrad = "linear-gradient(170deg, #2e2b38 0%, #201e2b 100%)";
    textColor     = "#7e7a8e";
    outerBorder   = "rgba(0,0,0,0.55)";
    topGlow       = "rgba(255,255,255,0.04)";
    angleLine     = "rgba(0,0,0,0.45)";
  } else {
    housingBg     = "#a8a4a0";
    faceGrad      = "linear-gradient(170deg, #f4f1ec 0%, #dedad3 100%)";
    facePressGrad = "linear-gradient(170deg, #e2dfd9 0%, #cbc7c0 100%)";
    textColor     = "#3d3a42";
    outerBorder   = "rgba(0,0,0,0.18)";
    topGlow       = "rgba(255,255,255,0.7)";
    angleLine     = "rgba(0,0,0,0.22)";
  }

  // Press: 22ms snap-down. Release: spring overshoot (cubic-bezier)
  const pressTrans   = "22ms ease-in";
  const releaseTrans = "90ms cubic-bezier(0.34, 1.56, 0.64, 1)";
  const faceTrans    = `transform ${pressed ? pressTrans : releaseTrans},
                        background ${pressed ? "22ms" : "80ms"} ease,
                        box-shadow ${pressed ? "22ms" : "80ms"} ease`;
  const angleTrans   = `transform ${pressed ? pressTrans : releaseTrans}`;

  // Perspective lines angle — compresses as wall shrinks on press
  const angleRot = pressed ? 60 : 70;

  // Top-edge glow dims as face sinks (less light hits the top edge)
  const faceBoxShadow = pressed
    ? `inset 0 1px 0 rgba(0,0,0,0.08), inset 0 -1px 1px rgba(0,0,0,0.12)`
    : `inset 0 1px 0 ${topGlow}, inset 0 -1px 1px rgba(0,0,0,0.09)`;

  return (
    /* ── housing (FIXED height — provides the wall below the face) ── */
    <div
      className="relative flex-shrink-0 overflow-hidden"
      onMouseDown={(e) => {
        e.preventDefault();
        onKeyClick?.(keyDef);
      }}
      style={{
        width,
        height: totalH,
        backgroundColor: housingBg,
        borderRadius: "6px 6px 4px 4px",
        border: `1px solid ${outerBorder}`,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      {/* ── key face — translates DOWN on press ──────────────── */}
      <div
        className="relative z-10 select-none flex items-center justify-center pointer-events-none"
        style={{
          width:      width - 4,
          height:     faceH,
          background: pressed ? facePressGrad : faceGrad,
          borderRadius: "5px 5px 3px 3px",
          border: `1px solid ${outerBorder}`,
          color: textColor,
          fontSize:   isMod ? "7.5px" : "8.5px",
          fontWeight: 600,
          letterSpacing: "0.01em",
          transform:  `translateY(${faceY}px)`,
          transition: faceTrans,
          boxShadow:  faceBoxShadow,
        }}
      >
        <span className="leading-none text-center px-0.5">{keyDef.label}</span>
      </div>

      {/* ── perspective lines (bottom corners) ──────────────── */}
      <div
        className="absolute bottom-0 right-0 z-0 h-px w-9 pointer-events-none"
        style={{
          backgroundColor: angleLine,
          transform:  `translateX(14px) rotate(${angleRot}deg)`,
          transition: angleTrans,
        }}
      />
      <div
        className="absolute bottom-0 left-0 z-0 h-px w-9 pointer-events-none"
        style={{
          backgroundColor: angleLine,
          transform:  `translateX(-14px) rotate(-${angleRot}deg)`,
          transition: angleTrans,
        }}
      />
    </div>
  );
}
