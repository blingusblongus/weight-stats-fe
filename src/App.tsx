import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { getMeasurements } from "./api";
import { computeRollingAverage } from "./lib/rolling-average";
import type { Measurement } from "./types";
import { WeightChart } from "./components/WeightChart";
import type { CombinedPoint } from "./components/WeightChart";
import { RollingAvgSlider } from "./components/RollingAvgSlider";
import { DateRangePicker } from "./components/DateRangePicker";
import { MeasurementsTable } from "./components/MeasurementsTable";
import { SummaryCards } from "./components/SummaryCards";

export default function App() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [windowDays, setWindowDays] = useState(7);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const start = startDate ? format(startDate, "yyyy-MM-dd") : undefined;
      const end = endDate ? format(endDate, "yyyy-MM-dd") : undefined;
      const data = await getMeasurements(start, end);
      setMeasurements(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch data");
    } finally {
      setInitialLoad(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartData = useMemo(() => {
    const weightRolling = computeRollingAverage(
      measurements.map((m) => ({ date: m.measured_at, value: m.weight })),
      windowDays
    );
    const leanMassRolling = computeRollingAverage(
      measurements.map((m) => ({
        date: m.measured_at,
        value: m.fat_free_weight,
      })),
      windowDays
    );
    return weightRolling.map(
      (w, i): CombinedPoint => ({
        date: w.date,
        ts: new Date(w.date).getTime(),
        weight: w.value,
        weightAvg: w.avg,
        leanMass: leanMassRolling[i].value,
        leanMassAvg: leanMassRolling[i].avg,
      })
    );
  }, [measurements, windowDays]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Weight Stats</h1>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <DateRangePicker
            start={startDate}
            end={endDate}
            onChangeStart={setStartDate}
            onChangeEnd={setEndDate}
          />
        </div>

        <RollingAvgSlider value={windowDays} onChange={setWindowDays} />

        {initialLoad && (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        )}

        {error && (
          <p className="text-destructive text-center py-8">{error}</p>
        )}

        {!initialLoad && !error && measurements.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No measurements found.
          </p>
        )}

        {!initialLoad && !error && measurements.length > 0 && (
          <>
            <SummaryCards data={measurements} />
            <WeightChart data={chartData} windowDays={windowDays} />
            <MeasurementsTable data={measurements} />
          </>
        )}
      </div>
    </div>
  );
}
