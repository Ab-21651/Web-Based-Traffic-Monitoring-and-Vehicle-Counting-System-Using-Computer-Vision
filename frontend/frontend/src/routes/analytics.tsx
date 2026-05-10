import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { VehicleCountChart, VehicleTypePie, CongestionChart } from "@/components/charts";
import { fetchResults, type DetectionResult } from "@/lib/mock-api";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — TrafficAI" },
      { name: "description", content: "Detailed traffic analytics & visualizations." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [data, setData] = useState<DetectionResult | null>(null);
  useEffect(() => {
    fetchResults().then(setData);
  }, []);

  if (!data) {
    return (
      <DashboardShell title="Analytics">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass rounded-2xl h-72 animate-pulse" />
          <div className="glass rounded-2xl h-72 animate-pulse" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Analytics">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold">Vehicle Count Over Time</h2>
          <p className="text-xs text-muted-foreground mb-3">5-minute intervals</p>
          <VehicleCountChart data={data.timeSeries} />
        </div>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold">Vehicle Type Distribution</h2>
          <p className="text-xs text-muted-foreground mb-3">Across all classes</p>
          <VehicleTypePie
            data={[
              { name: "Cars", value: data.cars },
              { name: "Bikes", value: data.bikes },
              { name: "Trucks", value: data.trucks },
              { name: "Buses", value: data.buses },
            ]}
          />
        </div>
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <h2 className="font-bold">Traffic Congestion Graph</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Density level by time interval
          </p>
          <CongestionChart data={data.congestion} />
        </div>
      </div>
    </DashboardShell>
  );
}
