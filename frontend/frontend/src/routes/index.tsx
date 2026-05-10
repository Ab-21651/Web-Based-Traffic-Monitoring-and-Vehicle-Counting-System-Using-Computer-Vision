import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Activity,
  Eye,
  Gauge,
  Radar,
  Sparkles,
  ChevronRight,
  Car,
  Truck,
  Bus,
  Bike,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TrafficAI — AI Traffic Monitoring System" },
      {
        name: "description",
        content:
          "Real-time vehicle detection, tracking & traffic flow analysis using YOLOv8 and OpenCV.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Eye,
    title: "Vehicle Detection",
    desc: "YOLOv8 detects cars, bikes, trucks & buses in every frame.",
  },
  {
    icon: Activity,
    title: "Multi-Object Tracking",
    desc: "Unique IDs persist across frames using ByteTrack.",
  },
  {
    icon: Gauge,
    title: "Line-Crossing Counts",
    desc: "Estimate flow & congestion as vehicles cross virtual lines.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background image with overlay */}
      <div 
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: 'url(/src/components/ui/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          opacity: 'var(--bg-image-opacity, 0.4)',
        }}
      />
      <div className="pointer-events-none fixed inset-0" style={{
        background: 'var(--overlay-gradient)'
      }} />
      
      {/* Grid pattern */}
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-20" />

      {/* Nav */}
      <header className="relative z-20 mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))", boxShadow: "0 0 20px var(--neon-cyan)" }}>
            <Radar className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold tracking-tight" style={{ color: "var(--foreground)" }}>TrafficAI</p>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
              Vision System
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 h-10 rounded-full text-white text-sm font-semibold transition-all"
            style={{ 
              background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))",
              boxShadow: "0 0 20px var(--neon-cyan)"
            }}
          >
            Open Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs backdrop-blur-sm"
            style={{ 
              background: "color-mix(in oklab, var(--neon-cyan) 15%, transparent)",
              border: "1px solid var(--neon-cyan)",
              color: "var(--neon-cyan)"
            }}
          >
            <Sparkles className="h-3 w-3" />
            <span>Computer Vision Project</span>
          </span>
          <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]" style={{ color: "var(--foreground)" }}>
            AI Traffic
            <br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))" }}>Monitoring System</span>
          </h1>
          <p className="mt-6 text-base md:text-lg max-w-2xl leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Real-time vehicle detection, tracking, and traffic flow analysis using
            Computer Vision. Upload any traffic feed and let YOLOv8 + OpenCV count
            and classify every vehicle crossing the line.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-6 h-12 rounded-full text-white font-semibold transition-all"
              style={{ 
                background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))",
                boxShadow: "0 0 20px var(--neon-cyan)"
              }}
            >
              Run Detection <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-2 px-6 h-12 rounded-full font-semibold transition-all backdrop-blur-md"
              style={{ 
                background: "color-mix(in oklab, var(--neon-cyan) 20%, transparent)",
                border: "1px solid var(--neon-cyan)",
                color: "var(--neon-cyan)"
              }}
            >
              View Analytics <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        {/* Floating vehicle icons */}
        <div className="relative mt-16 grid md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * i + 0.3 }}
              className="rounded-2xl p-6 relative overflow-hidden group backdrop-blur-md transition-all"
              style={{ 
                background: "color-mix(in oklab, var(--neon-cyan) 10%, transparent)",
                border: "1px solid var(--neon-cyan)",
                borderColor: "var(--neon-cyan)"
              }}
            >
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl opacity-10 group-hover:opacity-30 transition-all duration-500" style={{ background: "var(--neon-cyan)" }} />
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center mb-2"
                style={{ 
                  background: "color-mix(in oklab, var(--neon-cyan) 25%, transparent)",
                  color: "var(--neon-cyan)"
                }}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <p className="font-bold text-base" style={{ color: "var(--foreground)" }}>{f.title}</p>
              <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Animated vehicle row */}
        <div className="mt-16 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md"
          style={{ 
            background: "color-mix(in oklab, var(--neon-cyan) 10%, transparent)",
            border: "1px solid var(--neon-cyan)"
          }}
        >
          <p className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: "var(--neon-cyan)" }}>
            🚗 Detects & classifies
          </p>
          <div className="flex flex-wrap items-center gap-8">
            {[
              { I: Car, n: "Cars", c: "var(--neon-cyan)" },
              { I: Bike, n: "Bikes", c: "var(--neon-pink)" },
              { I: Truck, n: "Trucks", c: "var(--neon-purple)" },
              { I: Bus, n: "Buses", c: "var(--neon-green)" },
            ].map(({ I, n, c }, i) => (
              <motion.div
                key={n}
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: i * 0.3 }}
                className="flex items-center gap-3"
              >
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 bg-white/10 backdrop-blur-md"
                  style={{
                    color: c,
                    boxShadow: `0 0 15px ${c}40`,
                    border: `1px solid ${c}`
                  }}
                >
                  <I className="h-6 w-6" />
                </div>
                <span className="font-semibold" style={{ color: "var(--foreground)" }}>{n}</span>
              </motion.div>
            ))}
            <div className="ml-auto hidden md:flex items-center gap-2 text-xs font-mono" style={{ color: "var(--neon-cyan)" }}>
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse-glow" />
              LIVE & READY
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
