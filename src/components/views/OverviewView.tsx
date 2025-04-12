
import React, { useMemo, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, TrendingDown, Users, Target, 
  CalendarDays, Award, UserPlus, UserMinus, BarChart3, 
  BarChart2, PieChart as PieChartIcon, Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatNumber, formatPercent } from "@/lib/formatters";
import { useDrillDown } from "@/contexts/DrillDownContext";
import { ProcessedData } from "@/types/fitnessTypes";
import { motion } from "framer-motion";
import { filterData } from "@/lib/utils";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import MetricsCard from "../dashboard/MetricsCard";
import SankeyFunnelChart from "../SankeyFunnelChart";

interface OverviewViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

// Define funnel stages for customer journey
const funnelStages = ["New Customers", "Retained", "Converted", "Churned"];

// Configurable stats names and labels for overview metrics
const STATS_CONFIG = {
  barreSessions: { label: "Barre Sessions", color: "barre" },
  cycleSessions: { label: "Cycle Sessions", color: "cycle" },
  barreCustomers: { label: "Barre Customers", color: "barre" },
  cycleCustomers: { label: "Cycle Customers", color: "cycle" },
  barrePaid: { label: "Barre Revenue", color: "barre", formatter: formatINR },
  cyclePaid: { label: "Cycle Revenue", color: "cycle", formatter: formatINR },
  avgBarreClassSize: { label: "Avg. Barre Class Size", color: "barre" },
  avgCycleClassSize: { label: "Avg. Cycle Class Size", color: "cycle" },
};

const OverviewView: React.FC<OverviewViewProps> = ({ data, selectedMonths, location }) => {
  const { showDrillDown } = useDrillDown();
  const [activeChart, setActiveChart] = useState<"attendance" | "revenue" | "customers">("attendance");

  // Filter data based on selected months and location
  const filteredData = useMemo(() => {
    return filterData(data, selectedMonths, location);
  }, [data, selectedMonths, location]);

  // Get the filtered stats and raw data
  const filteredStats = filteredData.monthlyStats;
  const filteredRawData = filteredData.rawData;

  // Calculate total metrics
  const totals = useMemo(() => {
    const initialValues = {
      barreSessions: 0,
      cycleSessions: 0,
      barreCustomers: 0,
      cycleCustomers: 0,
      barrePaid: 0,
      cyclePaid: 0,
      newCustomers: 0,
      retainedCustomers: 0,
      convertedCustomers: 0,
      churnedCustomers: 0,
      totalRevenue: 0,
      totalSessions: 0,
      totalCustomers: 0,
      avgAttendance: 0,
    };

    // Calculate totals from filtered raw data
    return filteredRawData.reduce((acc, record) => {
      acc.barreSessions += parseInt(String(record["Barre Sessions"] || 0));
      acc.cycleSessions += parseInt(String(record["Cycle Sessions"] || 0));
      acc.barreCustomers += parseInt(String(record["Barre Customers"] || 0));
      acc.cycleCustomers += parseInt(String(record["Cycle Customers"] || 0));
      acc.barrePaid += parseFloat(String(record["Barre Paid"] || 0));
      acc.cyclePaid += parseFloat(String(record["Cycle Paid"] || 0));
      
      // Add new customer metrics if they exist
      if (typeof record["New Customers"] === 'number') {
        acc.newCustomers += record["New Customers"];
      }
      if (typeof record["Retained Customers"] === 'number') {
        acc.retainedCustomers += record["Retained Customers"];
      }
      if (typeof record["Converted Customers"] === 'number') {
        acc.convertedCustomers += record["Converted Customers"];
      }
      if (typeof record["Churned Customers"] === 'number') {
        acc.churnedCustomers += record["Churned Customers"];
      }

      return acc;
    }, { ...initialValues });
  }, [filteredRawData]);

  // Derived totals
  const aggregateTotals = useMemo(() => {
    // Total revenue from Barre and Cycle
    const totalRevenue = totals.barrePaid + totals.cyclePaid;
    
    // Total sessions from Barre and Cycle
    const totalSessions = totals.barreSessions + totals.cycleSessions;
    
    // Total customers from Barre and Cycle
    const totalCustomers = totals.barreCustomers + totals.cycleCustomers;
    
    // Average class size
    const avgBarreClassSize = totals.barreSessions > 0 
      ? totals.barreCustomers / totals.barreSessions 
      : 0;
    
    const avgCycleClassSize = totals.cycleSessions > 0 
      ? totals.cycleCustomers / totals.cycleSessions 
      : 0;
    
    const avgClassSize = totalSessions > 0 
      ? totalCustomers / totalSessions 
      : 0;
    
    // Return the derived totals
    return {
      totalRevenue,
      totalSessions,
      totalCustomers,
      avgBarreClassSize,
      avgCycleClassSize,
      avgClassSize,
    };
  }, [totals]);

  // Calculate month-to-month growth rates
  const growth = useMemo(() => {
    if (filteredStats.length < 2) return { 
      revenue: 0, 
      attendance: 0,
      customers: 0
    };

    // Sort stats by month/year
    const sortedStats = [...filteredStats].sort((a, b) => {
      const [aMonth, aYear] = a.monthYear.split('-');
      const [bMonth, bYear] = b.monthYear.split('-');
      
      const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
      return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
    });

    const firstMonth = sortedStats[0];
    const lastMonth = sortedStats[sortedStats.length - 1];
    
    // FIX: Changed Boolean to a simple conditional expression
    const revenue = firstMonth.totalRevenue && firstMonth.totalRevenue > 0
      ? ((lastMonth.totalRevenue - firstMonth.totalRevenue) / firstMonth.totalRevenue) * 100
      : 0;
    
    const totalFirstAttendance = firstMonth.barreSessions + firstMonth.cycleSessions;
    const totalLastAttendance = lastMonth.barreSessions + lastMonth.cycleSessions;
    const attendance = totalFirstAttendance > 0
      ? ((totalLastAttendance - totalFirstAttendance) / totalFirstAttendance) * 100
      : 0;
    
    const totalFirstCustomers = firstMonth.barreCustomers + firstMonth.cycleCustomers;
    const totalLastCustomers = lastMonth.barreCustomers + lastMonth.cycleCustomers;
    const customers = totalFirstCustomers > 0
      ? ((totalLastCustomers - totalFirstCustomers) / totalFirstCustomers) * 100
      : 0;
    
    return { revenue, attendance, customers };
  }, [filteredStats]);

  // Prepare data for overview charts
  const chartData = useMemo(() => {
    // For monthly attendance & revenue trends
    const monthlyTrends = filteredStats.map(stat => ({
      name: stat.monthYear,
      barreAttendance: stat.barreSessions || 0,
      cycleAttendance: stat.cycleSessions || 0,
      barreRevenue: stat.barrePaid || 0,
      cycleRevenue: stat.cyclePaid || 0,
      barreCustomers: stat.barreCustomers || 0,
      cycleCustomers: stat.cycleCustomers || 0
    }));

    // For class distribution pie chart
    const classDistribution = [
      { name: 'Barre Classes', value: totals.barreSessions, color: 'hsl(var(--barre))' },
      { name: 'Cycle Classes', value: totals.cycleSessions, color: 'hsl(var(--cycle))' }
    ];

    // For customer funnel (using new customer metrics if available)
    const customerFunnel = [
      { name: "New", value: totals.newCustomers || 0 },
      { name: "Retained", value: totals.retainedCustomers || 0 },
      { name: "Converted", value: totals.convertedCustomers || 0 },
      { name: "Churned", value: totals.churnedCustomers || 0 }
    ];
    
    return { monthlyTrends, classDistribution, customerFunnel };
  }, [filteredStats, totals]);

  // Create summary metrics for the cards
  const summaryMetrics = [
    {
      title: "Total Sessions",
      value: formatNumber(aggregateTotals.totalSessions),
      icon: <Activity className="h-5 w-5 text-blue-500" />,
      trend: <Badge variant={growth.attendance >= 0 ? "default" : "destructive"} className="text-xs">
        {growth.attendance >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {growth.attendance >= 0 ? `+${growth.attendance.toFixed(1)}%` : `${growth.attendance.toFixed(1)}%`}
      </Badge>,
      details: `${formatNumber(totals.barreSessions)} Barre, ${formatNumber(totals.cycleSessions)} Cycle`
    },
    {
      title: "Total Customers",
      value: formatNumber(aggregateTotals.totalCustomers),
      icon: <Users className="h-5 w-5 text-purple-500" />,
      trend: <Badge variant={growth.customers >= 0 ? "default" : "destructive"} className="text-xs">
        {growth.customers >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {growth.customers >= 0 ? `+${growth.customers.toFixed(1)}%` : `${growth.customers.toFixed(1)}%`}
      </Badge>,
      details: `${formatNumber(totals.barreCustomers)} Barre, ${formatNumber(totals.cycleCustomers)} Cycle`
    },
    {
      title: "Average Class Size",
      value: formatNumber(aggregateTotals.avgClassSize, 1),
      icon: <Target className="h-5 w-5 text-amber-500" />,
      details: `${formatNumber(aggregateTotals.avgBarreClassSize, 1)} Barre, ${formatNumber(aggregateTotals.avgCycleClassSize, 1)} Cycle`
    },
    {
      title: "Total Revenue",
      value: formatINR(aggregateTotals.totalRevenue),
      icon: <Award className="h-5 w-5 text-green-500" />,
      trend: <Badge variant={growth.revenue >= 0 ? "default" : "destructive"} className="text-xs">
        {growth.revenue >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {growth.revenue >= 0 ? `+${growth.revenue.toFixed(1)}%` : `${growth.revenue.toFixed(1)}%`}
      </Badge>,
      details: `${formatINR(totals.barrePaid)} Barre, ${formatINR(totals.cyclePaid)} Cycle`
    },
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

  // Animation variants
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

  // CHART TOOLTIPS HAVE BEEN REFACTORED TO USE THE COMMON TOOLTIPCOMPONENT FROM UI
  // Chart configuration for styling
  const chartConfig = {
    primary: { theme: { light: "var(--chart-primary)", dark: "var(--chart-primary)", luxe: "var(--chart-primary)" } },
    secondary: { theme: { light: "var(--chart-secondary)", dark: "var(--chart-secondary)", luxe: "var(--chart-secondary)" } },
    accent: { theme: { light: "var(--chart-accent)", dark: "var(--chart-accent)", luxe: "var(--chart-accent)" } },
    barre: { theme: { light: "hsl(var(--barre))", dark: "hsl(var(--barre))", luxe: "hsl(var(--barre))" } },
    cycle: { theme: { light: "hsl(var(--cycle))", dark: "hsl(var(--cycle))", luxe: "hsl(var(--cycle))" } },
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Title section with location filter info */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold font-heading bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Performance Overview {location !== "" && location !== "all" ? `- ${location}` : ""}
          </h2>
          <Badge variant="outline" className="flex items-center px-3 py-1 rounded-full bg-background/60 backdrop-blur-sm">
            <CalendarDays className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {selectedMonths.length > 0 
                ? `Showing data for ${selectedMonths.length} months` 
                : "Showing all data"}
              {location && location !== "all" ? ` in ${location}` : ""}
            </span>
          </Badge>
        </div>
      </motion.div>

      {/* Summary metrics row */}
      <motion.div 
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4"
        variants={containerVariants}
      >
        {summaryMetrics.map((metric, index) => (
          <motion.div key={index} variants={itemVariants}>
            <MetricsCard
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              trend={metric.trend}
              details={metric.details}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Trend Charts */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Chart Card */}
        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card className="overflow-hidden backdrop-blur-sm border-border/50 bg-gradient-to-br from-background to-background/80">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  {activeChart === "attendance" && <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />}
                  {activeChart === "revenue" && <Award className="h-5 w-5 mr-2 text-green-400" />}
                  {activeChart === "customers" && <Users className="h-5 w-5 mr-2 text-purple-400" />}
                  Monthly {activeChart === "attendance" ? "Attendance" : activeChart === "revenue" ? "Revenue" : "Customers"}
                </CardTitle>
                <Tabs value={activeChart} onValueChange={(value: string) => setActiveChart(value as any)} className="w-auto">
                  <TabsList className="h-9 p-1">
                    <TabsTrigger value="attendance" className="text-xs px-3">Attendance</TabsTrigger>
                    <TabsTrigger value="revenue" className="text-xs px-3">Revenue</TabsTrigger>
                    <TabsTrigger value="customers" className="text-xs px-3">Customers</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <CardDescription>
                {activeChart === "attendance" 
                  ? "Number of sessions per month" 
                  : activeChart === "revenue" 
                  ? "Monthly revenue breakdown" 
                  : "Customer count per month"}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer 
                className="h-full"
                config={chartConfig}
              >
                {activeChart === "attendance" && (
                  <BarChart
                    data={chartData.monthlyTrends}
                    margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
                    onClick={(data) => handleDrillDown(data, 'Attendance for')}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatNumber(value)}
                      tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                    />
                    <Tooltip 
                      content={<ChartTooltipContent labelFormatter={(label) => `Month: ${label}`} />} 
                      wrapperStyle={{ zIndex: 1000 }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Bar 
                      dataKey="barreAttendance" 
                      name="Barre Sessions" 
                      fill="hsl(var(--barre))"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={true}
                      animationBegin={300}
                      animationDuration={1500}
                    />
                    <Bar 
                      dataKey="cycleAttendance" 
                      name="Cycle Sessions" 
                      fill="hsl(var(--cycle))"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={true}
                      animationBegin={600}
                      animationDuration={1500}
                    />
                  </BarChart>
                )}
                {activeChart === "revenue" && (
                  <LineChart
                    data={chartData.monthlyTrends}
                    margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
                    onClick={(data) => handleDrillDown(data, 'Revenue for')}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={70}
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
                      dataKey="barreRevenue" 
                      name="Barre Revenue" 
                      stroke="hsl(var(--barre))" 
                      activeDot={{ r: 8 }}
                      isAnimationActive={true}
                      animationBegin={300}
                      animationDuration={1500}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cycleRevenue" 
                      name="Cycle Revenue" 
                      stroke="hsl(var(--cycle))" 
                      activeDot={{ r: 8 }}
                      isAnimationActive={true}
                      animationBegin={600}
                      animationDuration={1500}
                    />
                  </LineChart>
                )}
                {activeChart === "customers" && (
                  <BarChart
                    data={chartData.monthlyTrends}
                    margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
                    onClick={(data) => handleDrillDown(data, 'Customers for')}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatNumber(value)}
                      tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                    />
                    <Tooltip 
                      content={<ChartTooltipContent labelFormatter={(label) => `Month: ${label}`} />} 
                      wrapperStyle={{ zIndex: 1000 }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Bar 
                      dataKey="barreCustomers" 
                      name="Barre Customers" 
                      fill="hsl(var(--barre))"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={true}
                      animationBegin={300}
                      animationDuration={1500}
                    />
                    <Bar 
                      dataKey="cycleCustomers" 
                      name="Cycle Customers" 
                      fill="hsl(var(--cycle))"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={true}
                      animationBegin={600}
                      animationDuration={1500}
                    />
                  </BarChart>
                )}
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column - Distribution & Funnel */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          {/* Class Distribution */}
          <Card className="overflow-hidden backdrop-blur-sm border-border/50 bg-gradient-to-br from-background to-background/80">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <PieChartIcon className="h-5 w-5 mr-2 text-amber-400" />
                Classes Distribution
              </CardTitle>
              <CardDescription>
                Barre vs Cycle classes
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[150px]">
              <ChartContainer 
                className="h-full"
                config={chartConfig}
              >
                <PieChart>
                  <Pie
                    data={chartData.classDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    isAnimationActive={true}
                    label={(entry) => `${entry.name}: ${formatNumber(entry.value)}`}
                    labelLine={false}
                  >
                    {chartData.classDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<ChartTooltipContent />} 
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Customer Funnel */}
          <Card className="overflow-hidden backdrop-blur-sm border-border/50 bg-gradient-to-br from-background to-background/80">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-400" />
                Customer Conversion
              </CardTitle>
              <CardDescription>
                Customer journey funnel
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[150px]">
              <div className="h-full">
                {totals.newCustomers || totals.retainedCustomers || totals.convertedCustomers ? (
                  <SankeyFunnelChart 
                    data={chartData.customerFunnel}
                    startColor="hsl(var(--barre))"
                    endColor="hsl(var(--cycle))"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-muted-foreground">No customer journey data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default OverviewView;
