import type { DetectionResult } from "@/lib/mock-api";
import { motion } from "framer-motion";

const palette: Record<string, string> = {
  Car: "var(--neon-cyan)",
  Bike: "var(--neon-pink)",
  Truck: "var(--neon-orange)",
  Bus: "var(--neon-green)",
};

export function DetectionTable({ rows }: { rows: DetectionResult["detections"] }) {
  return (
    <div className="glass-lg rounded-2xl overflow-hidden backdrop-blur-xl">
      <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Live Detections</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time tracking IDs · class labels · confidence scores
          </p>
        </div>
        <div className="hidden md:flex gap-4 text-xs">
          {Object.entries(palette).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1.5 px-2 py-1 rounded-lg">
              <span className="h-2 w-2 rounded-full" style={{ background: v }} />
              <span className="text-muted-foreground font-medium">{k}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead className="bg-muted/10 text-xs uppercase tracking-widest text-muted-foreground border-b border-border/30">
            <tr>
              <th className="text-left px-6 py-3 font-semibold">Track ID</th>
              <th className="text-left px-6 py-3 font-semibold">Class</th>
              <th className="text-left px-6 py-3 font-semibold">Confidence</th>
              <th className="text-left px-6 py-3 font-semibold">Direction</th>
              <th className="text-left px-6 py-3 font-semibold">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <motion.tr
                key={r.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="border-t border-border/30 hover:bg-muted/10 transition-colors duration-200 group"
              >
                <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground">#{ r.track}</td>
                <td className="px-6 py-3.5">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{
                      background: `color-mix(in oklab, ${palette[r.type]} 15%, transparent)`,
                      color: palette[r.type],
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full animate-pulse"
                      style={{ background: palette[r.type] }}
                    />
                    {r.type}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-muted/30 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${r.confidence * 100}%` }}
                        transition={{ delay: i * 0.02, duration: 0.6 }}
                        className="h-full gradient-bg"
                      />
                    </div>
                    <span className="font-mono text-xs font-semibold text-foreground w-10 text-right">{r.confidence.toFixed(2)}</span>
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-lg inline-flex items-center gap-1 ${
                      r.direction === "IN"
                        ? "text-[var(--neon-green)]"
                        : "text-[var(--neon-pink)]"
                    }`}
                  >
                    {r.direction === "IN" ? "↓" : "↑"} {r.direction}
                  </span>
                </td>
                <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground">
                  {r.timestamp}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
