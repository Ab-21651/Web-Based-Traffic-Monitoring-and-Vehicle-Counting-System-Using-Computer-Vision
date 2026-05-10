import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const colors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--foreground)",
};

export function VehicleCountChart({ data }: { data: { t: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ left: -20, right: 8, top: 10 }}>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.7} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="t" stroke="var(--muted-foreground)" fill="var(--foreground)" fontSize={11} />
        <YAxis stroke="var(--muted-foreground)" fill="var(--foreground)" fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#g1)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function VehicleTypePie({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={4}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CongestionChart({
  data,
}: {
  data: { t: string; level: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: -20, right: 8, top: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="t" stroke="var(--muted-foreground)" fill="var(--foreground)" fontSize={11} />
        <YAxis stroke="var(--muted-foreground)" fill="var(--foreground)" fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="level" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.level > 60 ? "var(--chart-3)" : "var(--chart-2)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
