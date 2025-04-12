
import { useMemo } from "react";
import { MonthlyStats } from "@/types/fitnessTypes";

export const useChartData = (filteredStats: MonthlyStats[]) => {
  // Revenue trends data
  const revenueTrendsData = useMemo(() => {
    return filteredStats.map(stat => ({
      name: stat.monthYear,
      revenue: stat.totalRevenue,
      barreRev: stat.barrePaid || 0,
      cycleRev: stat.cyclePaid || 0
    })).sort((a, b) => {
      // Sort by month/year
      const [aMonth, aYear] = a.name.split('-');
      const [bMonth, bYear] = b.name.split('-');
      
      const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
      return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
    });
  }, [filteredStats]);

  // Attendance comparison data
  const attendanceComparisonData = useMemo(() => {
    return filteredStats.map(stat => ({
      name: stat.monthYear,
      barreAttendance: stat.barreCustomers || 0,
      cycleAttendance: stat.cycleCustomers || 0,
      barreAvg: stat.avgBarreClassSize || 0,
      cycleAvg: stat.avgCycleClassSize || 0
    })).sort((a, b) => {
      // Sort by month/year
      const [aMonth, aYear] = a.name.split('-');
      const [bMonth, bYear] = b.name.split('-');
      
      const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
      return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
    });
  }, [filteredStats]);

  // Chart configuration
  const chartConfig = {
    primary: { theme: { light: "var(--chart-primary)", dark: "var(--chart-primary)", luxe: "var(--chart-primary)", physique57: "var(--chart-primary)" } },
    secondary: { theme: { light: "var(--chart-secondary)", dark: "var(--chart-secondary)", luxe: "var(--chart-secondary)", physique57: "var(--chart-secondary)" } },
    accent: { theme: { light: "var(--chart-accent)", dark: "var(--chart-accent)", luxe: "var(--chart-accent)", physique57: "var(--chart-accent)" } },
    barre: { theme: { light: "hsl(var(--barre))", dark: "hsl(var(--barre))", luxe: "hsl(var(--barre))", physique57: "hsl(var(--barre))" } },
    cycle: { theme: { light: "hsl(var(--cycle))", dark: "hsl(var(--cycle))", luxe: "hsl(var(--cycle))", physique57: "hsl(var(--cycle))" } },
  };

  return {
    revenueTrendsData,
    attendanceComparisonData,
    chartConfig
  };
};
