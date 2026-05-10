import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Car, TrendingDown, TrendingUp, Clock, Layers } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { MetricCard } from "@/components/metric-card";
import { VehicleCountChart, VehicleTypePie, CongestionChart } from "@/components/charts";
import { fetchResults, type DetectionResult } from "@/lib/mock-api";
import { DetectionTable } from "@/components/detection-table";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — TrafficAI" },
      { name: "description", content: "Live traffic analytics dashboard." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [data, setData] = useState<DetectionResult | null>(null);
  useEffect(() => {
    fetchResults().then(setData);
  }, []);

  return (
    <DashboardShell title="Overview Dashboard">
      {!data ? (
        <SkeletonGrid />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
            <MetricCard label="Total Vehicles" value={data.totalVehicles} delta="+12% vs last hr" icon={Car} accent="orange" index={0} />
            <MetricCard label="Traffic Density" value={data.density} delta="Above average" icon={Layers} accent="pink" index={1} />
            <MetricCard label="Incoming" value={data.incoming} delta="↓ Direction" icon={TrendingDown} accent="cyan" index={2} />
            <MetricCard label="Outgoing" value={data.outgoing} delta="↑ Direction" icon={TrendingUp} accent="green" index={3} />
            <MetricCard label="Peak Time" value={data.peakTime} delta="Highest flow" icon={Clock} accent="purple" index={4} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="glass-lg rounded-2xl p-6 lg:col-span-2 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-lg">Vehicle Count Over Time</h2>
                  <p className="text-xs text-muted-foreground mt-1">5-minute intervals</p>
                </div>
                <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-muted/30">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
              </div>
              <VehicleCountChart data={data.timeSeries} />
            </div>
            <div className="glass-lg rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="font-bold text-lg">Vehicle Types</h2>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Total: {data.totalVehicles}</p>
              <VehicleTypePie
                data={[
                  { name: "Cars", value: data.cars },
                  { name: "Bikes", value: data.bikes },
                  { name: "Trucks", value: data.trucks },
                  { name: "Buses", value: data.buses },
                ]}
              />
            </div>
          </div>

          <div className="glass-lg rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-lg">Traffic Congestion</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Bars in pink indicate heavy congestion
                </p>
              </div>
            </div>
            <CongestionChart data={data.congestion} />
          </div>

          <DetectionTable rows={data.detections.slice(0, 8)} />
        </div>
      )}
    </DashboardShell>
  );
}

function SkeletonGrid() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 h-28 animate-pulse" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl h-72 lg:col-span-2 animate-pulse" />
        <div className="glass rounded-2xl h-72 animate-pulse" />
      </div>
    </div>
  );
}
