import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { UploadCard } from "@/components/upload-card";
import { ProcessingPanel } from "@/components/processing-panel";
import { ResultsPanel } from "@/components/results-panel";
import { fetchResults, type DetectionResult } from "@/lib/mock-api";
import { MetricCard } from "@/components/metric-card";
import { Car, Layers, Clock, TrendingDown, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload & Detect — TrafficAI" },
      { name: "description", content: "Upload traffic videos and run detection." },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);

  return (
    <DashboardShell title="Upload & Run Detection">
      <div className="grid gap-6 lg:grid-cols-2">
        <UploadCard onUploaded={() => setReady(true)} />
        <ProcessingPanel
          ready={ready}
          onComplete={async () => setResult(await fetchResults())}
          onReset={() => {
            setReady(false);
            setResult(null);
          }}
        />
      </div>

      {result && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
            <MetricCard label="Total Vehicles" value={result.totalVehicles} icon={Car} accent="purple" index={0} />
            <MetricCard label="Density" value={result.density} icon={Layers} accent="pink" index={1} />
            <MetricCard label="Incoming" value={result.incoming} icon={TrendingDown} accent="cyan" index={2} />
            <MetricCard label="Outgoing" value={result.outgoing} icon={TrendingUp} accent="green" index={3} />
            <MetricCard label="Peak Time" value={result.peakTime} icon={Clock} accent="purple" index={4} />
          </div>
          <ResultsPanel result={result} />
        </div>
      )}
    </DashboardShell>
  );
}
