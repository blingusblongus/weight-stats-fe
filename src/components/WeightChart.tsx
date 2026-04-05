import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface CombinedPoint {
  date: string;
  weight: number;
  weightAvg: number | null;
  leanMass: number;
  leanMassAvg: number | null;
}

interface WeightChartProps {
  data: CombinedPoint[];
  windowDays: number;
}

export type { CombinedPoint };

interface SeriesConfig {
  key: string;
  label: string;
  color: string;
  dataKey: string;
  avgKey: string;
}

const SERIES: SeriesConfig[] = [
  {
    key: "weight",
    label: "Weight",
    color: "var(--color-chart-1)",
    dataKey: "weight",
    avgKey: "weightAvg",
  },
  {
    key: "leanMass",
    label: "Lean Mass",
    color: "var(--color-chart-2)",
    dataKey: "leanMass",
    avgKey: "leanMassAvg",
  },
];

export function WeightChart({ data, windowDays }: WeightChartProps) {
  const [visible, setVisible] = useState<Record<string, boolean>>({
    weight: true,
    leanMass: false,
  });

  const toggle = (key: string) =>
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));

  const activeSeries = SERIES.filter((s) => visible[s.key]);

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Body Composition</CardTitle>
        <div className="flex gap-2">
          {SERIES.map((s) => (
            <Button
              key={s.key}
              variant={visible[s.key] ? "default" : "outline"}
              size="sm"
              onClick={() => toggle(s.key)}
              style={
                visible[s.key]
                  ? { backgroundColor: s.color, color: "#0f1117" }
                  : undefined
              }
            >
              {s.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => format(new Date(v), "M/d")}
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis
              domain={["dataMin - 2", "dataMax + 2"]}
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                color: "var(--color-foreground)",
              }}
              labelFormatter={(v) =>
                format(new Date(v as string), "MMM d, yyyy h:mm a")
              }
              formatter={(value, name) => {
                const series = SERIES.find(
                  (s) => s.dataKey === name || s.avgKey === name
                );
                if (!series) return [`${Number(value).toFixed(1)} lb`, name];
                const isAvg = name === series.avgKey;
                const label = isAvg
                  ? `${series.label} (${windowDays}d avg)`
                  : series.label;
                return [`${Number(value).toFixed(1)} lb`, label];
              }}
            />
            {activeSeries.map((s) => (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                stroke={s.color}
                strokeOpacity={0.3}
                dot={{ r: 1.5, fill: s.color, fillOpacity: 0.3 }}
                activeDot={{ r: 4 }}
              />
            ))}
            {activeSeries.map((s) => (
              <Line
                key={s.avgKey}
                type="monotone"
                dataKey={s.avgKey}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
