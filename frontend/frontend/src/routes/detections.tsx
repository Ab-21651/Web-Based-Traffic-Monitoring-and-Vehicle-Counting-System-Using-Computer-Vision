import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { DetectionTable } from "@/components/detection-table";
import { ResultsPanel } from "@/components/results-panel";
import { fetchResults, type DetectionResult } from "@/lib/mock-api";

export const Route = createFileRoute("/detections")({
  head: () => ({
    meta: [
      { title: "Detections — TrafficAI" },
      { name: "description", content: "Live detections, bounding boxes & track IDs." },
    ],
  }),
  component: DetectionsPage,
});

function DetectionsPage() {
  const [data, setData] = useState<DetectionResult | null>(null);
  useEffect(() => {
    fetchResults().then(setData);
  }, []);

  return (
    <DashboardShell title="Detections">
      {!data ? (
        <div className="space-y-6">
          <div className="glass rounded-2xl h-96 animate-pulse" />
          <div className="glass rounded-2xl h-72 animate-pulse" />
        </div>
      ) : (
        <div className="space-y-6">
          <ResultsPanel result={data} />
          <DetectionTable rows={data.detections} />
        </div>
      )}
    </DashboardShell>
  );
}
