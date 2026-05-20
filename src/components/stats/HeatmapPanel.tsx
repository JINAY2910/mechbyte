"use client";

import { motion } from "framer-motion";
import { KEYBOARD_LAYOUT } from "@/data/keyboardLayout";

interface HeatmapPanelProps {
  heatmap: Record<string, number>;
}

export function HeatmapPanel({ heatmap }: HeatmapPanelProps) {
  const max = Math.max(1, ...Object.values(heatmap));

  const allKeys = KEYBOARD_LAYOUT.flat();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <p className="text-xs text-[#6f6a7c] mb-3 uppercase tracking-wider">
        Key heatmap
      </p>
      <div className="flex flex-wrap gap-1">
        {allKeys
          .filter((k) => !k.modifier || k.code.startsWith("Key"))
          .slice(0, 40)
          .map((key) => {
            const count = heatmap[key.code] ?? 0;
            const intensity = count / max;
            return (
              <motion.div
                key={key.id}
                className="w-7 h-7 rounded text-[9px] flex items-center justify-center font-mono"
                style={{
                  background: `rgba(255, 59, 92, ${0.05 + intensity * 0.7})`,
                  color: intensity > 0.4 ? "#f8f8f2" : "#6f6a7c",
                  boxShadow:
                    intensity > 0.5
                      ? `0 0 ${8 * intensity}px rgba(255,59,92,0.5)`
                      : undefined,
                }}
                title={`${key.label}: ${count}`}
              >
                {key.label.slice(0, 2)}
              </motion.div>
            );
          })}
      </div>
    </motion.div>
  );
}
