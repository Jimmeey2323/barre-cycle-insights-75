
import React, { useMemo, useEffect } from "react";
import { ProcessedData } from "@/types/fitnessTypes";
import { formatNumber } from "@/lib/formatters";
import { useDrillDown } from "@/contexts/DrillDownContext";
import { BarChart2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { filterData } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import MetricsGrid from "../overview/MetricsGrid";
import RevenueChart from "../charts/RevenueChart";
import ClassDistributionChart from "../charts/ClassDistributionChart";
import AttendanceChart from "../charts/AttendanceChart";
import CustomerFunnel from "../charts/CustomerFunnel";
import { useOverviewCalculations } from "@/hooks/useOverviewCalculations";
import { useChartData } from "@/hooks/useChartData";

interface OverviewViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const OverviewView: React.FC<OverviewViewProps> = ({ data, selectedMonths, location }) => {
  const { showDrillDown } = useDrillDown();
  const { theme } = useTheme();

  // Use the filterData utility to properly filter data based on location and months
  const filteredData = useMemo(() => {
    return filterData(data, selectedMonths, location);
  }, [data, selectedMonths, location]);

  // Extract filtered stats and raw data
  const filteredStats = filteredData.monthlyStats;
  const filteredRawData = filteredData.rawData;

  // Add debug logging
  useEffect(() => {
    console.log("OverviewView rendering with filters:", {
      selectedMonths,
      location,
      filteredStatsCount: filteredStats.length,
      filteredRawDataCount: filteredRawData.length
    });
  }, [selectedMonths, location, filteredStats, filteredRawData]);

  // Get calculations
  const calculations = useOverviewCalculations(filteredRawData);
  
  // Get chart data
  const { revenueTrendsData, attendanceComparisonData, chartConfig } = useChartData(filteredStats);
  
  // Get metrics data
  const metricsData = calculations.buildMetricsData();
  
  // Get funnel data
  const funnelData = calculations.createFunnelData();
  
  // Get class distribution data
  const classDistributionData = calculations.createClassDistributionData();

  // Handle drill downs
  const handleDrillDown = (data: any, title: string) => {
    if (!data || !data.activePayload || !data.activePayload.length) return;
    
    const item = data.activePayload[0].payload;
    const monthData = filteredRawData.filter(record => 
      String(record["Month Year"]) === item.name
    );
    
    if (monthData.length > 0) {
      showDrillDown(monthData, `${title}: ${item.name}`, 'month');
    }
  };

  // ANIMATIONS CONFIGURATION
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold font-heading bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
            Dashboard Overview {location !== "" && location !== "all" ? `- ${location}` : ""}
          </h2>
          <Badge variant="outline" className="flex items-center px-3 py-1 rounded-full bg-background/60 backdrop-blur-sm">
            <BarChart2 className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {selectedMonths.length > 0 
                ? `Showing data for ${selectedMonths.length} months` 
                : "Showing all data"}
              {location && location !== "all" ? ` in ${location}` : ""}
            </span>
          </Badge>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <MetricsGrid metrics={metricsData} />

      {/* Enhanced Customer Funnel - FULL WIDTH */}
      <motion.div variants={containerVariants}>
        <CustomerFunnel 
          nodes={funnelData.nodes} 
          links={funnelData.links}
          ltv={funnelData.ltv}
          conversionRate={funnelData.conversionRate}
        />
      </motion.div>

      {/* Revenue Trends & Class Distribution */}
      <motion.div 
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        variants={containerVariants}
      >
        <RevenueChart 
          data={revenueTrendsData} 
          onDrillDown={handleDrillDown}
          chartConfig={chartConfig} 
        />
        <ClassDistributionChart 
          data={classDistributionData} 
          chartConfig={chartConfig} 
        />
      </motion.div>

      {/* Class Attendance Chart */}
      <motion.div variants={containerVariants}>
        <AttendanceChart 
          data={attendanceComparisonData} 
          onDrillDown={handleDrillDown}
          chartConfig={chartConfig} 
        />
      </motion.div>
    </motion.div>
  );
};

export default OverviewView;
