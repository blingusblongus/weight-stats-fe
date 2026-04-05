export interface DataPoint {
  date: string;
  value: number;
  avg: number | null;
}

export function computeRollingAverage(
  data: { date: string; value: number }[],
  windowDays: number
): DataPoint[] {
  return data.map((point, i) => {
    // Collect points within the trailing window
    const cutoff = new Date(point.date);
    cutoff.setDate(cutoff.getDate() - windowDays);

    const windowValues: number[] = [];
    for (let j = i; j >= 0; j--) {
      if (new Date(data[j].date) < cutoff) break;
      windowValues.push(data[j].value);
    }

    const avg =
      windowValues.length >= 2
        ? windowValues.reduce((a, b) => a + b, 0) / windowValues.length
        : null;

    return { date: point.date, value: point.value, avg };
  });
}
