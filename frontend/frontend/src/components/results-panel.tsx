import type { DetectionResult } from "@/lib/mock-api";
import { Download, Car, Truck, Bus, Bike } from "lucide-react";
import { motion } from "framer-motion";

const classCounts = (r: DetectionResult) => [
  { label: "Cars", value: r.cars, Icon: Car, color: "var(--neon-cyan)" },
  { label: "Bikes", value: r.bikes, Icon: Bike, color: "var(--neon-pink)" },
  { label: "Trucks", value: r.trucks, Icon: Truck, color: "var(--neon-purple)" },
  { label: "Buses", value: r.buses, Icon: Bus, color: "var(--neon-green)" },
];

const legend = [
  { label: "Car", color: "var(--neon-cyan)" },
  { label: "Bike", color: "var(--neon-pink)" },
  { label: "Truck", color: "var(--neon-purple)" },
  { label: "Bus", color: "var(--neon-green)" },
];

export function ResultsPanel({ result }: { result: DetectionResult }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="glass rounded-2xl p-6 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold">Processed Output</h2>
            <p className="text-xs text-muted-foreground">
              Bounding boxes · track IDs · line crossings
            </p>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg gradient-bg text-primary-foreground text-xs font-semibold hover:shadow-[0_0_30px_var(--neon-purple)] transition">
            <Download className="h-3.5 w-3.5" /> Download Video
          </button>
        </div>

        {/* Mock video frame with synthetic bounding boxes */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-border">
          <div className="absolute inset-0 grid-bg opacity-30" />
          {/* line */}
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-[var(--neon-pink)] shadow-[0_0_12px_var(--neon-pink)]">
            <span className="absolute -top-5 right-3 text-[10px] font-mono text-[var(--neon-pink)]">
              COUNT LINE
            </span>
          </div>
          {/* boxes */}
          {[
            { x: "8%", y: "30%", w: "18%", h: "22%", c: "var(--neon-cyan)", l: "Car · 0.94 · #1024" },
            { x: "45%", y: "55%", w: "22%", h: "26%", c: "var(--neon-purple)", l: "Truck · 0.88 · #1031" },
            { x: "72%", y: "38%", w: "14%", h: "18%", c: "var(--neon-pink)", l: "Bike · 0.82 · #1042" },
            { x: "30%", y: "68%", w: "16%", h: "20%", c: "var(--neon-green)", l: "Bus · 0.91 · #1056" },
          ].map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="absolute rounded"
              style={{
                left: b.x, top: b.y, width: b.w, height: b.h,
                border: `2px solid ${b.c}`, boxShadow: `0 0 12px ${b.c}`,
              }}
            >
              <span
                className="absolute -top-5 left-0 text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: b.c, color: "#0a0a0a" }}
              >
                {b.l}
              </span>
            </motion.div>
          ))}
          {/* scan */}
          <div className="absolute inset-x-0 h-12 bg-gradient-to-b from-transparent via-[var(--neon-cyan)]/30 to-transparent animate-scan pointer-events-none" />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {legend.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-xs">
              <span className="h-2 w-2 rounded-sm" style={{ background: l.color, boxShadow: `0 0 8px ${l.color}` }} />
              <span className="text-muted-foreground">{l.label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Total Vehicles Counted
          </p>
          <p className="mt-2 text-5xl font-bold gradient-text">{result.totalVehicles}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Across all classes · line crossings
          </p>
        </div>
        <div className="glass rounded-2xl p-4 space-y-2">
          {classCounts(result).map(({ label, value, Icon, color }) => (
            <div key={label} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-card/40 transition">
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center"
                style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold flex-1">{label}</span>
              <span className="font-mono text-sm">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
