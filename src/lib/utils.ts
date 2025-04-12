
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { RawDataRecord, MonthlyStats, ProcessedData } from "@/types/fitnessTypes";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Filter data based on selected months and location
 */
export function filterData(
  data: ProcessedData,
  selectedMonths: string[],
  location: string
): ProcessedData {
  // Filter raw data
  const filteredRawData = data.rawData.filter((record) => {
    const matchesMonth = selectedMonths.length === 0 || selectedMonths.includes(record["Month Year"]);
    const matchesLocation = !location || location === "" || record.Location === location;
    return matchesMonth && matchesLocation;
  });

  // Filter monthly stats
  const filteredMonthlyStats = data.monthlyStats.filter((stat) => {
    return selectedMonths.length === 0 || selectedMonths.includes(stat.monthYear);
  });

  // Recalculate monthly stats if location filter is applied
  let processedMonthlyStats = filteredMonthlyStats;
  
  if (location && location !== "") {
    // Group by month and recalculate stats
    const monthlyData = new Map<string, RawDataRecord[]>();
    
    filteredRawData.forEach((record) => {
      const monthYear = record["Month Year"];
      if (!monthlyData.has(monthYear)) {
        monthlyData.set(monthYear, []);
      }
      monthlyData.get(monthYear)?.push(record);
    });
    
    processedMonthlyStats = Array.from(monthlyData.entries()).map(([monthYear, records]) => {
      // Calculate aggregates for this month and location
      const totalBarreSessions = records.reduce((sum, r) => sum + (r["Barre Sessions"] || 0), 0);
      const totalCycleSessions = records.reduce((sum, r) => sum + (r["Cycle Sessions"] || 0), 0);
      const totalBarreCustomers = records.reduce((sum, r) => sum + (r["Barre Customers"] || 0), 0);
      const totalCycleCustomers = records.reduce((sum, r) => sum + (r["Cycle Customers"] || 0), 0);
      const totalBarrePaid = records.reduce((sum, r) => sum + (r["Barre Paid"] || 0), 0);
      const totalCyclePaid = records.reduce((sum, r) => sum + (r["Cycle Paid"] || 0), 0);
      
      // Calculate averages
      const avgBarreClassSize = totalBarreSessions > 0
        ? (totalBarreCustomers / totalBarreSessions).toFixed(1)
        : "0";
      
      const avgCycleClassSize = totalCycleSessions > 0
        ? (totalCycleCustomers / totalCycleSessions).toFixed(1)
        : "0";
      
      return {
        monthYear,
        totalBarreSessions,
        totalCycleSessions, 
        totalBarreCustomers,
        totalCycleCustomers,
        totalBarrePaid,
        totalCyclePaid,
        avgBarreClassSize,
        avgCycleClassSize
      };
    });
  }

  return {
    rawData: filteredRawData,
    monthlyStats: processedMonthlyStats,
    locations: data.locations,
    teachers: data.teachers,
  };
}

/**
 * Check if cycle data should be shown based on location
 */
export function shouldShowCycle(location: string): boolean {
  // Kwality House doesn't have cycle classes
  if (location === "Kwality House") {
    return false;
  }
  return true;
}

/**
 * Format a number with the appropriate suffix (k, M, B)
 */
export function formatWithSuffix(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

/**
 * Create a unique ID
 */
export function createId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Sort data by a field
 */
export function sortData<T>(
  data: T[],
  field: keyof T,
  direction: "asc" | "desc" = "asc"
): T[] {
  return [...data].sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];
    
    // Convert to numbers if possible
    if (typeof aValue === "string" && !isNaN(Number(aValue))) {
      aValue = Number(aValue);
    }
    
    if (typeof bValue === "string" && !isNaN(Number(bValue))) {
      bValue = Number(bValue);
    }
    
    // Sort based on type
    if (typeof aValue === "number" && typeof bValue === "number") {
      return direction === "asc" ? aValue - bValue : bValue - aValue;
    }
    
    // Handle dates in format MMM-YYYY
    if (
      typeof aValue === "string" &&
      typeof bValue === "string" &&
      aValue.includes("-") &&
      bValue.includes("-")
    ) {
      const [aMonth, aYear] = aValue.split("-");
      const [bMonth, bYear] = bValue.split("-");
      
      const monthOrder = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      
      const yearCompare = Number(aYear) - Number(bYear);
      
      if (yearCompare !== 0) {
        return direction === "asc" ? yearCompare : -yearCompare;
      }
      
      const monthCompare = monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
      return direction === "asc" ? monthCompare : -monthCompare;
    }
    
    // Default string comparison
    if (typeof aValue === "string" && typeof bValue === "string") {
      return direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });
}

/**
 * Check if an object is empty
 */
export function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Generate random colors for charts
 */
export function generateRandomColors(count: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 137.5) % 360; // Golden angle approximation for good distribution
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }
  return colors;
}

/**
 * Sleep for a given amount of time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
