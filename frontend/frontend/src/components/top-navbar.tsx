import { Bell, Search, Zap } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function TopNavbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/40 bg-background/50 backdrop-blur-2xl px-4 md:px-8">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">{title}</h1>
          <p className="text-xs text-muted-foreground">
            Computer Vision · Real-time vehicle analytics
          </p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden md:flex glass-lg rounded-xl items-center gap-2 px-4 h-10 w-64 bg-muted/20 border border-border/50">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search detections, tracks…"
            className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground text-foreground"
          />
        </div>
        <button className="glass-lg relative h-10 w-10 rounded-xl flex items-center justify-center hover:bg-muted/50 transition-all duration-200 border border-border/40">
          <Bell className="h-4 w-4 text-foreground" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--neon-orange)] animate-pulse-glow" />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
