import type { Measurement } from "./types";

export async function getMeasurements(
  start?: string,
  end?: string
): Promise<Measurement[]> {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);

  const url = `/api/measurements${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch measurements: ${res.statusText}`);
  }
  return res.json();
}
