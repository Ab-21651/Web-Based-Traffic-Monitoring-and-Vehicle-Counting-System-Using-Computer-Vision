import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Loader2, Play, RotateCcw } from "lucide-react";
import { useState } from "react";
import { runDetection } from "@/lib/mock-api";

export function ProcessingPanel({
  ready,
  onComplete,
  onReset,
}: {
  ready: boolean;
  onComplete: () => void;
  onReset: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState("");
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  const start = async () => {
    setRunning(true);
    setCompleted(false);
    await runDetection("mock", (s, p) => {
      setStage(s);
      setProgress(p);
    });
    setRunning(false);
    setCompleted(true);
    onComplete();
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Detection Pipeline</h2>
          <p className="text-xs text-muted-foreground">
            YOLOv8 → ByteTrack → Line-crossing counter
          </p>
        </div>
        <Cpu className="h-5 w-5 text-primary" />
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            disabled={!ready || running}
            onClick={start}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-primary-foreground font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_30px_var(--neon-purple)] transition"
          >
            {running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {running ? "Processing…" : "Run Detection"}
          </button>
          <button
            onClick={() => {
              setRunning(false);
              setStage("");
              setProgress(0);
              setCompleted(false);
              onReset();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card/40 hover:bg-card text-sm font-semibold transition"
          >
            <RotateCcw className="h-4 w-4" /> Reset System
          </button>
        </div>

        <AnimatePresence>
          {(running || completed) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-muted-foreground">
                  {stage || "Detection complete"}
                </span>
                <span className="font-mono text-primary">{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden relative">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  className="h-full gradient-bg"
                />
                {running && (
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-scan" />
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["Detect", "Track", "Count"].map((label, i) => {
                  const active = progress > i * 33;
                  return (
                    <div
                      key={label}
                      className={`rounded-lg border px-3 py-2 text-xs font-mono transition ${
                        active
                          ? "border-primary/50 text-primary bg-primary/5"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      <span className={active ? "animate-pulse-glow" : ""}>● {label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
