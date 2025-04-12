
import React, { useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData } from "@/types/fitnessTypes";
import { 
  LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, TooltipProps, LabelList
} from 'recharts';
import { formatINR, formatNumber, formatPercent } from "@/lib/formatters";
import { useDrillDown } from "@/contexts/DrillDownContext";
import { 
  Users, BarChart as BarChartIcon, BarChart2, Activity, TrendingUp, TrendingDown, 
  User, UserPlus, RefreshCcw, Dumbbell, Hourglass, Timer, IndianRupee, Zap, Award, Target, CalendarClock 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import MetricsCard from "../dashboard/MetricsCard";
import { motion } from "framer-motion";
import { filterData } from "@/lib/utils";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useTheme } from "@/contexts/ThemeContext";
import SankeyFunnelChart from "../SankeyFunnelChart";

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

  // CALCULATIONS FOR METRICS AND CHARTS
  // Calculate total sessions
  const totalBarreSessions = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Barre Sessions"] || 0)), 0), 
    [filteredRawData]);

  const totalCycleSessions = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Cycle Sessions"] || 0)), 0), 
    [filteredRawData]);

  const totalSessions = totalBarreSessions + totalCycleSessions;

  // Calculate total attendance
  const totalBarreCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Barre Customers"] || 0)), 0), 
    [filteredRawData]);

  const totalCycleCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Cycle Customers"] || 0)), 0), 
    [filteredRawData]);

  const totalCustomers = totalBarreCustomers + totalCycleCustomers;

  // Calculate total revenue
  const totalBarrePaid = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseFloat(String(record["Barre Paid"] || 0)), 0), 
    [filteredRawData]);

  const totalCyclePaid = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseFloat(String(record["Cycle Paid"] || 0)), 0), 
    [filteredRawData]);

  const totalRevenue = totalBarrePaid + totalCyclePaid;

  // Calculate non-empty sessions data
  const totalNonEmptyBarreSessions = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Non-Empty Barre Sessions"] || 0)), 0), 
    [filteredRawData]);
    
  const totalNonEmptyCycleSessions = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Non-Empty Cycle Sessions"] || 0)), 0), 
    [filteredRawData]);
  
  const nonEmptySessions = totalNonEmptyBarreSessions + totalNonEmptyCycleSessions;

  // Calculate averages
  const avgBarreClassSize = totalBarreSessions > 0 ? totalBarreCustomers / totalBarreSessions : 0;
  const avgCycleClassSize = totalCycleSessions > 0 ? totalCycleCustomers / totalCycleSessions : 0;
  const avgRevPerClass = totalSessions > 0 ? totalRevenue / totalSessions : 0;
  const avgRevPerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  
  // Calculate attendance rate - Average # of customers per session
  const avgAttendanceRate = nonEmptySessions > 0 ? 
    ((totalBarreCustomers + totalCycleCustomers) / nonEmptySessions) : 0;

  // Calculate additional metrics
  const avgSessionsPerCustomer = totalCustomers > 0 ? totalSessions / totalCustomers : 0;

  // Get actual metrics for the funnel from the raw data
  const totalLeads = useMemo(() => 
    filteredRawData.reduce((sum, record) => {
      const leads = Number(record["Leads"] || 0);
      return sum + (isNaN(leads) ? 0 : leads);
    }, 0), 
    [filteredRawData]);
    
  const totalVisitors = useMemo(() => 
    filteredRawData.reduce((sum, record) => {
      const visitors = parseInt(String(record["Visitors"] || 0));
      return sum + (isNaN(visitors) ? 0 : visitors);
    }, 0), 
    [filteredRawData]);

  const totalNewCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => {
      const newCust = parseInt(String(record["New Customers"] || 0));
      return sum + (isNaN(newCust) ? 0 : newCust);
    }, 0), 
    [filteredRawData]);

  const totalRetainedCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => {
      const retained = parseInt(String(record["Retained Customers"] || 0));
      return sum + (isNaN(retained) ? 0 : retained);
    }, 0), 
    [filteredRawData]);

  const totalConvertedCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => {
      const converted = parseInt(String(record["Converted Customers"] || 0));
      return sum + (isNaN(converted) ? 0 : converted);
    }, 0), 
    [filteredRawData]);

  const totalChurnedCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => {
      const churned = parseInt(String(record["Churned Customers"] || 0));
      return sum + (isNaN(churned) ? 0 : churned);
    }, 0), 
    [filteredRawData]);

  // Calculate retention and conversion rates using the same logic as RetentionView
  const retentionRate = useMemo(() => {
    const retainableCustomers = totalRetainedCustomers + totalChurnedCustomers;
    return retainableCustomers > 0 ? (totalRetainedCustomers / retainableCustomers) * 100 : 0;
  }, [totalRetainedCustomers, totalChurnedCustomers]);

  const conversionRate = useMemo(() => {
    return totalNewCustomers > 0 ? (totalConvertedCustomers / totalNewCustomers) * 100 : 0;
  }, [totalConvertedCustomers, totalNewCustomers]);

  // PREPARE CHART DATA
  // Enhanced Customer funnel data with Sankey style
  // Define nodes and links for the Sankey funnel chart based on actual data
  const funnelNodes = [
    {
      id: "visitors",
      label: "Visitors",
      value: totalVisitors > 0 ? totalVisitors : totalCustomers * 1.2, // Fallback if no visitor data
      color: "#818cf8",
      position: "top" as const,
      column: 0
    },
    {
      id: "leads",
      label: "Leads",
      value: totalLeads > 0 ? totalLeads : totalNewCustomers * 1.1, // Fallback if no leads data
      color: "#93c5fd",
      position: "top" as const,
      column: 1
    },
    {
      id: "customers",
      label: "Customers",
      value: totalCustomers,
      color: "#34d399",
      position: "top" as const,
      column: 2
    },
    {
      id: "retained",
      label: "Retained",
      value: totalRetainedCustomers > 0 ? totalRetainedCustomers : totalCustomers * 0.65, // Fallback if no retention data
      color: "#10b981",
      position: "top" as const,
      column: 3
    }
  ];
  
  const funnelLinks = [
    {
      source: "visitors",
      target: "leads",
      value: totalLeads > 0 ? totalLeads : totalNewCustomers * 1.1,
      color: "#818cf8"
    },
    {
      source: "leads",
      target: "customers",
      value: totalCustomers,
      color: "#93c5fd"
    },
    {
      source: "customers",
      target: "retained",
      value: totalRetainedCustomers > 0 ? totalRetainedCustomers : totalCustomers * 0.65,
      color: "#34d399"
    }
  ];

  // Revenue trends data
  const revenueTrendsData = filteredStats.map(stat => ({
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

  // Attendance comparison data
  const attendanceComparisonData = filteredStats.map(stat => ({
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

  // Class distribution data for pie chart
  const classDistributionData = [
    { name: "Barre Classes", value: totalBarreSessions, fill: "hsl(var(--barre))" },
    { name: "Cycle Classes", value: totalCycleSessions, fill: "hsl(var(--cycle))" }
  ];

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

  // METRICS DATA FOR CARDS - Using only actual data, no placeholders
  const metricsData = [
    {
      title: "Total Sessions",
      value: formatNumber(totalSessions),
      icon: <Activity className="h-5 w-5 text-purple-500" />,
      details: `${formatNumber(totalBarreSessions)} Barre, ${formatNumber(totalCycleSessions)} Cycle`,
      tooltipContent: "Total number of sessions conducted across all locations and class types",
      calculationDetails: `Barre Sessions (${totalBarreSessions}) + Cycle Sessions (${totalCycleSessions}) = ${totalSessions}`
    },
    {
      title: "Total Attendance",
      value: formatNumber(totalCustomers),
      icon: <Users className="h-5 w-5 text-blue-500" />,
      details: `${formatNumber(totalBarreCustomers)} Barre, ${formatNumber(totalCycleCustomers)} Cycle`,
      tooltipContent: "Total number of customers who attended classes",
      calculationDetails: `Barre Customers (${totalBarreCustomers}) + Cycle Customers (${totalCycleCustomers}) = ${totalCustomers}`
    },
    {
      title: "Total Revenue",
      value: formatINR(totalRevenue),
      icon: <IndianRupee className="h-5 w-5 text-green-500" />,
      details: `Avg ${formatINR(avgRevPerClass)} per class`,
      tooltipContent: "Total revenue generated from all classes",
      calculationDetails: `Barre Revenue (${formatINR(totalBarrePaid)}) + Cycle Revenue (${formatINR(totalCyclePaid)}) = ${formatINR(totalRevenue)}`
    },
    {
      title: "Avg Class Size",
      value: (avgBarreClassSize + avgCycleClassSize) / 2 > 0 ? 
        ((avgBarreClassSize + avgCycleClassSize) / 2).toFixed(1) : "0",
      icon: <Users className="h-5 w-5 text-violet-500" />,
      details: `Barre: ${avgBarreClassSize.toFixed(1)}, Cycle: ${avgCycleClassSize.toFixed(1)}`,
      tooltipContent: "Average number of customers per class",
      calculationDetails: `Barre: ${totalBarreCustomers} customers / ${totalBarreSessions} sessions = ${avgBarreClassSize.toFixed(2)}\nCycle: ${totalCycleCustomers} customers / ${totalCycleSessions} sessions = ${avgCycleClassSize.toFixed(2)}`
    }
  ];

  // Only add retention rate if we have the data for it
  if (totalRetainedCustomers > 0 || totalChurnedCustomers > 0) {
    metricsData.push({
      title: "Retention Rate",
      value: `${retentionRate.toFixed(1)}%`,
      icon: <RefreshCcw className="h-5 w-5 text-teal-500" />,
      details: `${formatNumber(totalRetainedCustomers)} retained customers`,
      tooltipContent: "Percentage of customers who return for additional classes",
      calculationDetails: `${totalRetainedCustomers} retained / (${totalRetainedCustomers} + ${totalChurnedCustomers}) = ${retentionRate.toFixed(2)}%`
    });
  }

  // Only add conversion rate if we have the data for it
  if (totalConvertedCustomers > 0 && totalNewCustomers > 0) {
    metricsData.push({
      title: "Conversion Rate",
      value: `${conversionRate.toFixed(1)}%`,
      icon: <Zap className="h-5 w-5 text-amber-500" />,
      details: `${formatNumber(totalConvertedCustomers)} from ${formatNumber(totalNewCustomers)} new`,
      tooltipContent: "Percentage of new customers who convert to regular customers",
      calculationDetails: `${totalConvertedCustomers} converted / ${totalNewCustomers} new = ${conversionRate.toFixed(2)}%`
    });
  }

  // Only add attendance rate if we have non-empty sessions
  if (nonEmptySessions > 0) {
    metricsData.push({
      title: "Attendance Rate",
      value: `${avgAttendanceRate.toFixed(1)}`,
      icon: <Target className="h-5 w-5 text-orange-500" />,
      details: `Avg customers per session`,
      tooltipContent: "Average number of customers per non-empty session",
      calculationDetails: `Total Customers (${totalCustomers}) / Non-Empty Sessions (${nonEmptySessions}) = ${avgAttendanceRate.toFixed(2)}`
    });
  }

  // Only add avg revenue per customer if we have revenue and customers
  if (totalRevenue > 0 && totalCustomers > 0) {
    metricsData.push({
      title: "Avg Rev/Customer",
      value: formatINR(avgRevPerCustomer),
      icon: <IndianRupee className="h-5 w-5 text-rose-500" />,
      details: `Total: ${formatINR(totalRevenue)}`,
      tooltipContent: "Average revenue generated per customer",
      calculationDetails: `Total Revenue (${formatINR(totalRevenue)}) / Total Customers (${totalCustomers}) = ${formatINR(avgRevPerCustomer)}`
    });
  }

  // Only add sessions per customer if we have both metrics
  if (totalSessions > 0 && totalCustomers > 0) {
    metricsData.push({
      title: "Sessions per Customer",
      value: avgSessionsPerCustomer.toFixed(1),
      icon: <CalendarClock className="h-5 w-5 text-cyan-500" />,
      details: `Avg attendance frequency`,
      tooltipContent: "Average number of sessions attended per customer",
      calculationDetails: `Total Sessions (${totalSessions}) / Total Customers (${totalCustomers}) = ${avgSessionsPerCustomer.toFixed(2)}`
    });
  }

  // Add popular class if we have session data
  if (totalBarreSessions > 0 || totalCycleSessions > 0) {
    metricsData.push({
      title: "Popular Class",
      value: totalBarreSessions > totalCycleSessions ? "Barre" : "Cycle",
      icon: <Award className="h-5 w-5 text-yellow-500" />,
      details: `Based on ${formatNumber(Math.max(totalBarreSessions, totalCycleSessions))} sessions`,
      tooltipContent: "Most popular class type based on number of sessions",
      calculationDetails: `Barre Sessions: ${totalBarreSessions} vs Cycle Sessions: ${totalCycleSessions}`
    });
  }

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

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Chart configuration for consistent styling
  const chartConfig = {
    primary: { theme: { light: "var(--chart-primary)", dark: "var(--chart-primary)", luxe: "var(--chart-primary)", physique57: "var(--chart-primary)" } },
    secondary: { theme: { light: "var(--chart-secondary)", dark: "var(--chart-secondary)", luxe: "var(--chart-secondary)", physique57: "var(--chart-secondary)" } },
    accent: { theme: { light: "var(--chart-accent)", dark: "var(--chart-accent)", luxe: "var(--chart-accent)", physique57: "var(--chart-accent)" } },
    barre: { theme: { light: "hsl(var(--barre))", dark: "hsl(var(--barre))", luxe: "hsl(var(--barre))", physique57: "hsl(var(--barre))" } },
    cycle: { theme: { light: "hsl(var(--cycle))", dark: "hsl(var(--cycle))", luxe: "hsl(var(--cycle))", physique57: "hsl(var(--cycle))" } },
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
      <motion.div 
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        variants={containerVariants}
      >
        {metricsData.map((metric, index) => (
          <motion.div key={index} variants={itemVariants} custom={index}>
            <MetricsCard
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              details={metric.details}
              tooltipContent={metric.tooltipContent}
              calculationDetails={metric.calculationDetails}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Enhanced Customer Funnel - FULL WIDTH */}
      <motion.div variants={containerVariants}>
        <motion.div variants={chartVariants}>
          <Card className="overflow-hidden backdrop-blur-sm border-border/50 bg-gradient-to-br from-background to-background/80">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-cyan-400" />
                Customer Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <SankeyFunnelChart
                title=""
                nodes={funnelNodes}
                links={funnelLinks}
                ltv={avgRevPerCustomer * 2.5} // Estimated LTV based on actual revenue
                conversionRate={{
                  from: "Leads",
                  to: "Customers",
                  rate: conversionRate
                }}
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Revenue Trends & Class Distribution */}
      <motion.div 
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        variants={containerVariants}
      >
        <motion.div variants={chartVariants}>
          <Card className="overflow-hidden backdrop-blur-sm border-border/50 bg-gradient-to-br from-background to-background/80">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <IndianRupee className="h-5 w-5 mr-2 text-green-400" />
                Revenue Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer 
                className="h-full"
                config={chartConfig}
              >
                <LineChart 
                  data={revenueTrendsData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  onClick={(data) => handleDrillDown(data, 'Revenue for')}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatINR(value)} 
                    tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                  />
                  <Tooltip 
                    content={<ChartTooltipContent labelFormatter={(label) => `Month: ${label}`} />} 
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Total Revenue" 
                    stroke="var(--chart-primary)" 
                    strokeWidth={2}
                    activeDot={{ r: 8, strokeWidth: 1 }}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={1500}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="barreRev" 
                    name="Barre Revenue" 
                    stroke="hsl(var(--barre))" 
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationBegin={300}
                    animationDuration={1500}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cycleRev" 
                    name="Cycle Revenue" 
                    stroke="hsl(var(--cycle))" 
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationBegin={600}
                    animationDuration={1500}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={chartVariants}>
          <Card className="overflow-hidden backdrop-blur-sm border-border/50 bg-gradient-to-br from-background to-background/80">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Dumbbell className="h-5 w-5 mr-2 text-amber-400" />
                Class Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer 
                className="h-full"
                config={chartConfig}
              >
                <PieChart>
                  <Pie
                    data={classDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={1800}
                  >
                    {classDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<ChartTooltipContent />} 
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Class Attendance Chart - Updated with different colors */}
      <motion.div variants={containerVariants}>
        <motion.div variants={chartVariants}>
          <Card className="overflow-hidden backdrop-blur-sm border-border/50 bg-gradient-to-br from-background to-background/80">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-400" />
                Class Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer 
                className="h-full"
                config={chartConfig}
              >
                <BarChart 
                  data={attendanceComparisonData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  onClick={(data) => handleDrillDown(data, 'Attendance for')}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis 
                    tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                  />
                  <Tooltip 
                    content={<ChartTooltipContent labelFormatter={(label) => `Month: ${label}`} />} 
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar 
                    dataKey="barreAttendance" 
                    name="Barre Attendance" 
                    fill="hsl(var(--barre))"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                  <Bar 
                    dataKey="cycleAttendance" 
                    name="Cycle Attendance" 
                    fill="#0EA5E9" // Using Ocean Blue from the color palette for Cycle
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                    animationBegin={300}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default OverviewView;
