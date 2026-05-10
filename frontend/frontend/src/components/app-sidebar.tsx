import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Upload, BarChart3, Eye, Home, Radar, Zap } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Upload & Detect", url: "/upload", icon: Upload },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Detections", url: "/detections", icon: Eye },
];

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside className="hidden md:flex sticky top-0 h-screen w-64 flex-col border-r border-border/40 bg-sidebar/50 backdrop-blur-2xl">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border/30">
        <div className="relative">
          <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center neon-glow">
            <Radar className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="absolute inset-0 rounded-xl gradient-bg blur-xl opacity-50 -z-10" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight">TrafficAI</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Vision System
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const active = path === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors group"
            >
              {active && (
                <motion.span
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-[var(--neon-orange)]/15 to-[var(--neon-cyan)]/15 border border-primary/20"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon className={`relative h-4 w-4 transition-colors ${active ? "text-[var(--neon-orange)]" : "group-hover:text-foreground"}`} />
              <span className="relative">{item.title}</span>
              {active && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative ml-auto h-2 w-2 rounded-full gradient-bg animate-pulse-glow"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 glass-lg rounded-xl p-4 border border-border/50 backdrop-blur-lg">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-[var(--neon-orange)]" />
          <p className="text-xs text-muted-foreground font-medium">AI Model</p>
        </div>
        <p className="text-sm font-bold bg-gradient-to-r from-[var(--neon-orange)] to-[var(--neon-cyan)] bg-clip-text text-transparent">
          YOLOv8 + ByteTrack
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--neon-green)] animate-pulse-glow" />
          <span className="text-xs text-muted-foreground font-medium">Live & Ready</span>
        </div>
      </div>
    </aside>
  );
}
