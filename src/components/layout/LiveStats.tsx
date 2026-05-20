"use client";

interface LiveStatsProps {
  wpm: number;
  accuracy: number;
  timeLeft: number;
  mode: string;
  status: string;
  visible: boolean;
}

export function LiveStats({
  wpm,
  accuracy,
  timeLeft,
  mode,
  status,
  visible,
}: LiveStatsProps) {
  if (!visible || status === "idle") return null;

  return (
    <div className="page-shell flex justify-center gap-8 py-1 text-sm tabular-nums">
      <Stat label="wpm" value={String(wpm)} accent />
      <Stat label="acc" value={`${accuracy}%`} />
      {mode === "time" && <Stat label="time" value={`${timeLeft}`} />}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider">
        {label}
      </span>
      <span
        className={`font-mono font-medium ${accent ? "text-[var(--color-crimson)]" : "text-[var(--color-text-dim)]"}`}
      >
        {value}
      </span>
    </div>
  );
}
