"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import type { SessionResult } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";

interface ResultModalProps {
  result: SessionResult | null;
  onRestart: () => void;
}

/* ─── helpers ────────────────────────────────────────────────────── */
function calcConsistency(wpmPoints: { wpm: number }[]): number {
  if (wpmPoints.length < 2) return 100;
  const vals = wpmPoints.map((p) => p.wpm);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  if (mean === 0) return 100;
  const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length;
  const std = Math.sqrt(variance);
  return Math.round(Math.max(0, Math.min(100, 100 - (std / mean) * 100)));
}

function buildSvgPath(
  points: { x: number; y: number }[],
  w: number,
  h: number,
): string {
  if (points.length < 2) return "";
  const n = points.length;
  const d: string[] = [];
  
  // Make sure starting coordinates are valid numbers
  const startX = isNaN(points[0].x) ? 0 : points[0].x;
  const startY = isNaN(points[0].y) ? 0 : points[0].y;
  d.push(`M ${startX} ${startY}`);

  for (let i = 1; i < n; i++) {
    const p0 = points[Math.max(0, i - 2)];
    const p1 = points[i - 1];
    const p2 = points[i];
    const p3 = points[Math.min(n - 1, i + 1)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    // Safety fallbacks to prevent NaN paths
    const x = isNaN(p2.x) ? 0 : p2.x;
    const y = isNaN(p2.y) ? 0 : p2.y;
    const c1x = isNaN(cp1x) ? x : cp1x;
    const c1y = isNaN(cp1y) ? y : cp1y;
    const c2x = isNaN(cp2x) ? x : cp2x;
    const c2y = isNaN(cp2y) ? y : cp2y;

    d.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x} ${y}`);
  }
  return d.join(" ");
}

/* ─── WPM Chart ──────────────────────────────────────────────────── */
function WpmChart({
  wpmHistory = [],
  durationMs,
}: {
  wpmHistory?: { time: number; wpm: number }[];
  durationMs?: number;
}) {
  const W = 800;
  const H = 180;
  const PAD = { top: 16, right: 24, bottom: 36, left: 40 };

  const data = useMemo(() => {
    // Filter and deduplicate by time, keep last
    const map = new Map<number, number>();
    for (const p of wpmHistory) {
      if (p && typeof p.time === "number" && !isNaN(p.time) && typeof p.wpm === "number" && !isNaN(p.wpm)) {
        map.set(p.time, p.wpm);
      }
    }
    let pts = Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([time, wpm]) => ({ time, wpm }));

    // Calculate fallback duration in seconds (must be a valid positive integer)
    let durSec = 30;
    if (typeof durationMs === "number" && !isNaN(durationMs) && durationMs > 0) {
      durSec = Math.max(1, Math.round(durationMs / 1000));
    }

    // Fallback: if no points or 1 point, generate straight horizontal line representing the duration
    if (pts.length === 0) {
      pts = [
        { time: 0, wpm: 0 },
        { time: durSec, wpm: 0 },
      ];
    } else if (pts.length === 1) {
      const singlePt = pts[0];
      const endSec = Math.max(singlePt.time + 1, durSec);
      pts = [
        { time: 0, wpm: singlePt.wpm },
        { time: endSec, wpm: singlePt.wpm },
      ];
    }
    return pts;
  }, [wpmHistory, durationMs]);

  // Safeguard: always render the SVG frame
  const maxTime = Math.max(1, data[data.length - 1]?.time || 1);
  const rawMaxWpm = Math.max(...data.map((p) => p.wpm), 10);
  const maxWpm = isNaN(rawMaxWpm) ? 10 : rawMaxWpm;
  const yMax = Math.max(20, Math.ceil(maxWpm / 10) * 10 + 10);

  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const toX = (t: number) => {
    const val = PAD.left + (t / maxTime) * chartW;
    return isNaN(val) ? PAD.left : val;
  };
  
  const toY = (w: number) => {
    const val = PAD.top + chartH - (w / yMax) * chartH;
    return isNaN(val) ? PAD.top + chartH : val;
  };

  const pts = data.map((p) => ({ x: toX(p.time), y: toY(p.wpm) }));
  const path = buildSvgPath(pts, W, H);

  // Y-axis grid values
  const yTicks = [0, Math.round(yMax / 2), yMax];
  
  // X-axis labels (seconds)
  const interval = Math.ceil(maxTime / 8) || 1;
  const xTicks = data
    .filter((p, i) => i === 0 || i === data.length - 1 || p.time % interval === 0)
    .map((p) => p.time);
  const uniqueXTicks = [...new Set(xTicks)];

  const gradId = "wpm-grad";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
      aria-label="WPM over time chart"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-crimson)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--color-crimson)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y grid lines */}
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={toY(v)}
            y2={toY(v)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
          <text
            x={PAD.left - 8}
            y={toY(v) + 4}
            textAnchor="end"
            fontSize={11}
            fill="rgba(255,255,255,0.22)"
            fontFamily="var(--font-mono)"
          >
            {v}
          </text>
        </g>
      ))}

      {/* X axis labels */}
      {uniqueXTicks.map((t) => (
        <text
          key={t}
          x={toX(t)}
          y={H - 4}
          textAnchor="middle"
          fontSize={11}
          fill="rgba(255,255,255,0.22)"
          fontFamily="var(--font-mono)"
        >
          {t}
        </text>
      ))}

      {/* Gradient fill under line */}
      <path
        d={`${path} L ${pts[pts.length - 1].x} ${toY(0)} L ${pts[0].x} ${toY(0)} Z`}
        fill={`url(#${gradId})`}
      />

      {/* WPM line */}
      <path
        d={path}
        fill="none"
        stroke="var(--color-crimson)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3.5}
          fill="var(--color-crimson)"
          stroke="var(--color-bg)"
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}

/* ─── StatBlock ──────────────────────────────────────────────────── */
function StatBlock({
  value,
  label,
  dim,
}: {
  value: string;
  label: string;
  dim?: boolean;
}) {
  return (
    <div className="flex flex-col items-center" style={{ gap: "0.15rem" }}>
      <span className="text-2xl font-bold tabular-nums leading-none text-[var(--color-text)]">
        {value}
      </span>
      <span className="text-[10px] tracking-[0.16em] text-[var(--color-text-muted)] uppercase">
        {label}
      </span>
    </div>
  );
}

/* ─── ResultModal ────────────────────────────────────────────────── */
export function ResultModal({ result, onRestart }: ResultModalProps) {
  const { mode, timer, sessionHistory } = useAppStore();

  const consistency = useMemo(
    () => (result ? calcConsistency(result.wpmHistory) : 100),
    [result],
  );

  // All-time best WPM across every saved session
  const bestWpm = useMemo(() => {
    if (sessionHistory.length === 0) return result?.wpm ?? 0;
    return Math.max(...sessionHistory.map((s) => s.wpm));
  }, [sessionHistory, result]);

  const durationLabel = useMemo(() => {
    if (!result) return "";
    if (mode === "time") return `${timer}s`;
    return `${(result.duration / 1000).toFixed(1)}s`;
  }, [result, mode, timer]);

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {/* blurred backdrop */}
          <div className="absolute inset-0 bg-[var(--color-bg)]/80 backdrop-blur-[10px]" />

          <motion.div
            className="relative w-full max-w-3xl px-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
          >

            {/* Hero numbers */}
            <div className="mb-6 flex justify-center">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto auto",
                  gridTemplateRows: "auto auto",
                  columnGap: "3rem",
                  rowGap: "0.5rem",
                  justifyItems: "center",
                }}
              >
                {/* Row 1: numbers */}
                <span
                  className="font-mono font-bold tabular-nums text-[var(--color-crimson)]"
                  style={{ fontSize: "5.5rem", lineHeight: 1 }}
                >
                  {result.wpm}
                </span>
                <span
                  className="font-mono font-bold tabular-nums"
                  style={{ fontSize: "5.5rem", lineHeight: 1, color: "var(--color-text)" }}
                >
                  {Math.round(result.accuracy)}
                  <span style={{ fontSize: "3.5rem", color: "var(--color-text-dim)" }}>%</span>
                </span>
                {/* Row 2: labels */}
                <span className="text-xs tracking-[0.16em] text-[var(--color-text-muted)] uppercase">
                  wpm
                </span>
                <span className="text-xs tracking-[0.16em] text-[var(--color-text-muted)] uppercase">
                  accuracy
                </span>
              </div>
            </div>

            {/* Sub stats */}
            <div className="mb-4 flex items-center justify-center gap-0 divide-x divide-white/[0.08]">
              <div className="pr-5">
                <StatBlock value={String(result.rawWpm)} label="raw" dim />
              </div>
              <div className="px-5">
                <StatBlock value={`${consistency}%`} label="consistency" dim />
              </div>
              <div className="px-5">
                <StatBlock value={String(bestWpm)} label="best" dim />
              </div>
              <div className="px-5">
                <StatBlock value={String(result.errors)} label="errors" dim />
              </div>
              <div className="px-5">
                <StatBlock value={String(result.bestStreak)} label="streak" dim />
              </div>
              <div className="pl-5">
                <StatBlock value={durationLabel} label="time" dim />
              </div>
            </div>

            {/* Chart */}
            <div className="mb-8 h-44 w-full">
              <WpmChart wpmHistory={result.wpmHistory} durationMs={result.duration} />
            </div>

            {/* Restart */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onRestart}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-6 py-2.5 text-sm font-medium text-[var(--color-text-dim)] transition-all hover:border-[var(--color-crimson)]/40 hover:bg-[var(--color-crimson)]/10 hover:text-[var(--color-text)]"
              >
                <RotateCcw size={14} strokeWidth={2} />
                restart
              </button>
              <span className="text-xs text-[var(--color-text-muted)]/50">
                or press{" "}
                <kbd className="mx-0.5 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[11px]">
                  tab
                </kbd>
                +
                <kbd className="mx-0.5 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[11px]">
                  enter
                </kbd>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
