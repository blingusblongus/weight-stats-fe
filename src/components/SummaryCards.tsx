import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Measurement } from "@/types";

interface SummaryCardsProps {
  data: Measurement[];
}

interface StatProps {
  label: string;
  value: string;
  change?: number;
  unit?: string;
  changeUnit?: string;
  subtitle?: string;
  muted?: boolean;
}

function Stat({ label, value, change, unit = "lb", changeUnit, subtitle, muted }: StatProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">
        {value}
        <span className="text-sm font-normal text-muted-foreground ml-1">
          {unit}
        </span>
      </p>
      {change !== undefined && (
        <p
          className={`text-sm font-medium ${
            muted
              ? "text-muted-foreground"
              : change < 0
                ? "text-[var(--color-chart-1)]"
                : change > 0
                  ? "text-[var(--color-chart-3)]"
                  : "text-muted-foreground"
          }`}
        >
          {change > 0 ? "+" : ""}
          {change.toFixed(1)} {changeUnit ?? unit}
        </p>
      )}
      {subtitle && (
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

function computeResidualStdDev(data: Measurement[], windowDays: number = 7): number {
  if (data.length < 3) return 0;

  const residuals: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const cutoff = new Date(data[i].measured_at);
    cutoff.setDate(cutoff.getDate() - windowDays);

    const windowValues: number[] = [];
    for (let j = i; j >= 0; j--) {
      if (new Date(data[j].measured_at) < cutoff) break;
      windowValues.push(data[j].weight);
    }

    if (windowValues.length >= 2) {
      const avg = windowValues.reduce((a, b) => a + b, 0) / windowValues.length;
      residuals.push(data[i].weight - avg);
    }
  }

  if (residuals.length < 2) return 0;
  const mean = residuals.reduce((a, b) => a + b, 0) / residuals.length;
  const sqDiffs = residuals.map((v) => (v - mean) ** 2);
  return Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / (residuals.length - 1));
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const [expanded, setExpanded] = useState(false);

  if (data.length === 0) return null;

  const first = data[0];
  const last = data[data.length - 1];

  const weightChange = last.weight - first.weight;
  const leanMassChange = last.fat_free_weight - first.fat_free_weight;
  const bodyFatChange = last.body_fat - first.body_fat;

  const days =
    (new Date(last.measured_at).getTime() -
      new Date(first.measured_at).getTime()) /
    (1000 * 60 * 60 * 24);
  const weeks = days / 7;

  const weightPerWeek = weeks > 0 ? weightChange / weeks : 0;
  const leanMassPerWeek = weeks > 0 ? leanMassChange / weeks : 0;

  const fatLoss = weightChange - leanMassChange;
  const fatLossPerWeek = weeks > 0 ? fatLoss / weeks : 0;
  const fatLossRatio =
    weightChange !== 0 ? Math.abs((fatLoss / weightChange) * 100) : 0;

  const bmrChange = last.bmr - first.bmr;
  const residualStdDev = computeResidualStdDev(data);
  const weights = data.map((m) => m.weight);
  const weightMin = Math.min(...weights);
  const weightMax = Math.max(...weights);

  return (
    <Card className="bg-card">
      <CardContent className="pt-4 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Stat
            label="Current Weight"
            value={last.weight.toFixed(1)}
            change={weightChange}
            subtitle={`over ${Math.round(days)} days`}
          />
          <Stat
            label="Lean Mass"
            value={last.fat_free_weight.toFixed(1)}
            change={leanMassChange}
            muted
            subtitle={`over ${Math.round(days)} days`}
          />
          <Stat
            label="Body Fat"
            value={last.body_fat.toFixed(1)}
            unit="%"
            change={bodyFatChange}
          />
          <Stat
            label="Fat Mass Change"
            value={`${fatLoss > 0 ? "+" : ""}${fatLoss.toFixed(1)}`}
            unit="lb"
            change={fatLossPerWeek}
            changeUnit="lb/wk"
          />
        </div>

        <div className="mt-3 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground"
          >
            {expanded ? "Less" : "More details"}
            {expanded ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-1 h-4 w-4" />
            )}
          </Button>
        </div>

        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-3 border-t border-border">
              <Stat
                label={`Weight ${weightPerWeek <= 0 ? "Loss" : "Gain"} / Week`}
                value={Math.abs(weightPerWeek).toFixed(1)}
                unit="lb/wk"
              />
              <Stat
                label={`Lean Mass ${leanMassPerWeek <= 0 ? "Loss" : "Gain"} / Week`}
                value={Math.abs(leanMassPerWeek).toFixed(1)}
                unit="lb/wk"
              />
              <Stat
                label={`Fat ${fatLossPerWeek <= 0 ? "Loss" : "Gain"} / Week`}
                value={Math.abs(fatLossPerWeek).toFixed(1)}
                unit="lb/wk"
              />
              <Stat
                label="Fat Ratio"
                value={fatLossRatio.toFixed(0)}
                unit="%"
                subtitle={`of weight ${weightChange <= 0 ? "lost" : "gained"} was fat`}
              />
            </div>
            <div className="grid grid-cols-3 gap-6 pt-3 border-t border-border">
              <Stat
                label="BMR"
                value={last.bmr.toString()}
                unit="kcal"
                change={bmrChange}
                muted
                subtitle="from scale estimate"
              />
              <Stat
                label="Daily Noise"
                value={`± ${residualStdDev.toFixed(1)}`}
                unit="lb"
                subtitle="vs 7-day trend"
              />
              <Stat
                label="Range"
                value={`${weightMin.toFixed(1)} – ${weightMax.toFixed(1)}`}
                unit="lb"
                subtitle={`${(weightMax - weightMin).toFixed(1)} lb spread`}
              />
            </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
