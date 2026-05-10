import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export function MetricCard({
  label,
  value,
  delta,
  icon: Icon,
  accent = "purple",
  index = 0,
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon: LucideIcon;
  accent?: "purple" | "cyan" | "pink" | "green" | "orange";
  index?: number;
}) {
  const accents: Record<string, string> = {
    purple: "var(--neon-purple)",
    cyan: "var(--neon-cyan)",
    pink: "var(--neon-pink)",
    green: "var(--neon-green)",
    orange: "var(--neon-orange)",
  };
  const c = accents[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl p-5 group card-elevated"
    >
      {/* Subtle background glow */}
      <div
        className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-15 group-hover:opacity-30 transition-all duration-500"
        style={{ background: c }}
      />

      <div className="flex items-center justify-between relative z-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">{label}</p>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ 
            background: `color-mix(in oklab, ${c} 25%, transparent)`,
            color: c,
          }}
        >
          <Icon className="h-4 w-4" />
        </motion.div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-foreground relative z-10">{value}</p>
      {delta && (
        <p className="mt-1 text-xs text-muted-foreground relative z-10">{delta}</p>
      )}
    </motion.div>
  );
}
