import { TimeRange } from "@/types";
import { Timestamp } from "firebase/firestore";

/**
 * Converts a TimeRange to a Timestamp representing the start of that range
 * @param timeRange - The time range ('6h', '24h', '1w', '1m', or 'all')
 * @returns Timestamp for the beginning of the range, or null for 'all'
 */
export const getTimeRangeThreshold = (
  timeRange: TimeRange
): Timestamp | null => {
  if (timeRange === "all") {
    return null;
  }

  const hoursMap: Record<Exclude<TimeRange, "all">, number> = {
    "6h": 6,
    "24h": 24,
    "1w": 7 * 24,
    "1m": 30 * 24,
  };

  const hours = hoursMap[timeRange as Exclude<TimeRange, "all">];
  const now = Date.now();
  const pastDate = new Date(now - hours * 60 * 60 * 1000);

  return Timestamp.fromDate(pastDate);
};
