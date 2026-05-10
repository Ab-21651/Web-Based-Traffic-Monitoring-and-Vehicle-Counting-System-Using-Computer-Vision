import { Github, Heart } from "lucide-react";

const team = ["Abdullah Attique", "Minahil Rizwan", "Talha Akram"];

export function Footer() {
  return (
    <footer className="relative z-10 mt-12 border-t border-border bg-background/40 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <p className="font-bold gradient-text text-lg">TrafficAI</p>
          <p className="text-xs text-muted-foreground mt-2 max-w-xs">
            A computer vision pipeline for detecting, tracking, and counting
            vehicles in traffic camera feeds.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Team
          </p>
          <ul className="space-y-1 text-sm">
            {team.map((m) => (
              <li key={m} className="text-foreground/80">{m}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Tech Stack
          </p>
          <p className="text-sm text-foreground/80">
            YOLOv8 · OpenCV · ByteTrack · React · Tailwind · Framer Motion
          </p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
        Built with <Heart className="h-3 w-3 text-[var(--neon-pink)]" /> for our Computer Vision Project
        <span className="mx-2">·</span>
        <Github className="h-3 w-3" /> Open source
      </div>
    </footer>
  );
}
