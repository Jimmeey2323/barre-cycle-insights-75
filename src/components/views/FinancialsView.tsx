
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData, RechartsValueType } from "@/types/fitnessTypes";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, 
  AreaChart, Area
} from 'recharts';
import { formatINR, formatNumber, formatPercent } from "@/lib/formatters";
import { useDrillDown } from "@/contexts/DrillDownContext";
import { Badge } from "@/components/ui/badge";
import { 
  IndianRupee, MapPinIcon, TrendingUp, TrendingDown, 
  ActivityIcon, Users, ArrowUpRight, CreditCard, 
  DollarSign, Target, Dumbbell, Calendar
} from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";
import { filterData } from "@/lib/utils";
import MetricsCard from "../dashboard/MetricsCard";

interface FinancialsViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const FinancialsView: React.FC<FinancialsViewProps> = ({ data, selectedMonths, location }) => {
  const { showDrillDown } = useDrillDown();
  const { theme } = useTheme();

  // Filter data based on selected months and location
  const filteredData = useMemo(() => {
    return filterData(data, selectedMonths, location);
  }, [data, selectedMonths, location]);

  // Extract filtered stats and raw data
  const filteredStats = filteredData.monthlyStats;
  const filteredRawData = filteredData.rawData;

  // Calculate total revenue
  const totalRevenue = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseFloat(String(record["Barre Paid"] || 0)) + parseFloat(String(record["Cycle Paid"] || 0)), 0), 
    [filteredRawData]);

  // Calculate revenue for each class type
  const totalBarrePaid = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseFloat(String(record["Barre Paid"] || 0)), 0), 
    [filteredRawData]);

  const totalCyclePaid = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseFloat(String(record["Cycle Paid"] || 0)), 0), 
    [filteredRawData]);

  // Calculate attendance for class types
  const totalBarreSessions = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Barre Sessions"] || 0)), 0), 
    [filteredRawData]);

  const totalCycleSessions = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Cycle Sessions"] || 0)), 0), 
    [filteredRawData]);

  const totalSessions = totalBarreSessions + totalCycleSessions;

  const totalBarreCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Barre Customers"] || 0)), 0), 
    [filteredRawData]);

  const totalCycleCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Cycle Customers"] || 0)), 0), 
    [filteredRawData]);

  const totalCustomers = totalBarreCustomers + totalCycleCustomers;

  // Calculate advanced revenue metrics
  const avgRevenuePerMonth = filteredStats.length > 0 ? totalRevenue / filteredStats.length : 0;
  const avgRevenuePerClass = totalSessions > 0 ? totalRevenue / totalSessions : 0;
  const avgBarreRevPerClass = totalBarreSessions > 0 ? totalBarrePaid / totalBarreSessions : 0;
  const avgCycleRevPerClass = totalCycleSessions > 0 ? totalCyclePaid / totalCycleSessions : 0;
  
  // Calculate revenue per seat (customer)
  const revenuePerSeat = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  const barreRevenuePerSeat = totalBarreCustomers > 0 ? totalBarrePaid / totalBarreCustomers : 0;
  const cycleRevenuePerSeat = totalCycleCustomers > 0 ? totalCyclePaid / totalCycleCustomers : 0;

  // Calculate seat utilization
  const avgBarreClassSize = totalBarreSessions > 0 ? totalBarreCustomers / totalBarreSessions : 0;
  const avgCycleClassSize = totalCycleSessions > 0 ? totalCycleCustomers / totalCycleSessions : 0;
  const seatUtilization = Math.min(((avgBarreClassSize + avgCycleClassSize) / 2) / 15 * 100, 100); // Assuming max capacity of 15

  // Calculate most popular class by revenue
  const mostPopularClassByRevenue = totalBarrePaid > totalCyclePaid ? "Barre" : "Cycle";
  const mostPopularClassRevenue = Math.max(totalBarrePaid, totalCyclePaid);

  // Determine most profitable class (revenue per seat)
  const mostProfitableClass = barreRevenuePerSeat > cycleRevenuePerSeat ? "Barre" : "Cycle";
  const mostProfitableRevenue = Math.max(barreRevenuePerSeat, cycleRevenuePerSeat);

  // Prepare chart data
  // Revenue by class type data
  const revenueByClassTypeData = [
    { name: "Barre", value: totalBarrePaid, fill: "hsl(var(--barre))" },
    { name: "Cycle", value: totalCyclePaid, fill: "hsl(var(--cycle))" }
  ];

  // Revenue by location
  const revenueByLocationData = useMemo(() => {
    const locationRevenue: Record<string, number> = {};
    
    filteredRawData.forEach(record => {
      const locationName = String(record.Location);
      const totalPaid = parseFloat(String(record["Barre Paid"] || 0)) + parseFloat(String(record["Cycle Paid"] || 0));
      
      locationRevenue[locationName] = (locationRevenue[locationName] || 0) + totalPaid;
    });
    
    return Object.entries(locationRevenue).map(([name, value]) => ({
      name,
      value
    }));
  }, [filteredRawData]);

  // Revenue trends over time
  const revenueTrendsData = filteredStats
    .map(stat => ({
      name: stat.monthYear,
      revenue: stat.totalRevenue,
      barreRev: stat.barrePaid || 0,
      cycleRev: stat.cyclePaid || 0
    }))
    .sort((a, b) => {
      const [aMonth, aYear] = a.name.split('-');
      const [bMonth, bYear] = b.name.split('-');
      
      const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
      return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
    });

  // Revenue per seat over time
  const revenuePerSeatTrendsData = filteredStats
    .map(stat => {
      const totalCustomers = (stat.barreCustomers || 0) + (stat.cycleCustomers || 0);
      const revPerSeat = totalCustomers > 0 ? stat.totalRevenue / totalCustomers : 0;
      
      return {
        name: stat.monthYear,
        revenuePerSeat: revPerSeat,
        barreRevPerSeat: (stat.barreCustomers || 0) > 0 ? (stat.barrePaid || 0) / stat.barreCustomers : 0,
        cycleRevPerSeat: (stat.cycleCustomers || 0) > 0 ? (stat.cyclePaid || 0) / stat.cycleCustomers : 0
      };
    })
    .sort((a, b) => {
      const [aMonth, aYear] = a.name.split('-');
      const [bMonth, bYear] = b.name.split('-');
      
      const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
      return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
    });

  // Chart configuration for consistent styling
  const chartConfig = {
    primary: { theme: { light: "var(--chart-primary)", dark: "var(--chart-primary)", luxe: "var(--chart-primary)", physique57: "var(--chart-primary)" } },
    secondary: { theme: { light: "var(--chart-secondary)", dark: "var(--chart-secondary)", luxe: "var(--chart-secondary)", physique57: "var(--chart-secondary)" } },
    accent: { theme: { light: "var(--chart-accent)", dark: "var(--chart-accent)", luxe: "var(--chart-accent)", physique57: "var(--chart-accent)" } },
    barre: { theme: { light: "hsl(var(--barre))", dark: "hsl(var(--barre))", luxe: "hsl(var(--barre))", physique57: "hsl(var(--barre))" } },
    cycle: { theme: { light: "hsl(var(--cycle))", dark: "hsl(var(--cycle))", luxe: "hsl(var(--cycle))", physique57: "hsl(var(--cycle))" } },
  };

  // Handle drill downs for charts
  const handleDrillDown = (data: any, dataKey: string, dataLabel: string) => {
    if (!data || !data.activePayload || !data.activePayload.length) return;
    
    const item = data.activePayload[0].payload;
    let detailedData = [];
    
    if (dataKey === "month") {
      detailedData = filteredRawData.filter(record => 
        String(record["Month Year"]) === item.name
      );
    } else if (dataKey === "type") {
      detailedData = filteredRawData.filter(record => 
        String(record.Type) === item.name
      );
    } else if (dataKey === "location") {
      detailedData = filteredRawData.filter(record => 
        String(record.Location) === item.name
      );
    }
    
    if (detailedData.length > 0) {
      showDrillDown(detailedData, `${dataLabel}: ${item.name}`, dataKey);
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

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Metrics data for cards
  const metricsData = [
    { 
      title: "Total Revenue", 
      value: formatINR(totalRevenue), 
      icon: <IndianRupee className="h-5 w-5 text-green-500" />,
      details: `Avg ${formatINR(avgRevenuePerMonth)} per month`,
      trend: <Badge variant="outline" className="text-green-500">
        <TrendingUp className="h-3 w-3 mr-1" />
        +7%
      </Badge>
    },
    { 
      title: "Avg Revenue/Class", 
      value: formatINR(avgRevenuePerClass), 
      icon: <CreditCard className="h-5 w-5 text-violet-500" />,
      details: `From ${formatNumber(totalSessions)} total sessions`,
      trend: <Badge variant="outline" className="text-green-500">
        <TrendingUp className="h-3 w-3 mr-1" />
        +3%
      </Badge>
    },
    { 
      title: "Revenue Per Seat", 
      value: formatINR(revenuePerSeat), 
      icon: <DollarSign className="h-5 w-5 text-blue-500" />,
      details: `From ${formatNumber(totalCustomers)} customers`,
      trend: <Badge variant="outline" className="text-green-500">
        <ArrowUpRight className="h-3 w-3 mr-1" />
        +4.2%
      </Badge>
    },
    { 
      title: "Seat Utilization", 
      value: `${seatUtilization.toFixed(1)}%`, 
      icon: <Target className="h-5 w-5 text-amber-500" />,
      details: `Avg ${(avgBarreClassSize + avgCycleClassSize) / 2 > 0 ? ((avgBarreClassSize + avgCycleClassSize) / 2).toFixed(1) : "0"} per class`,
      trend: <Badge variant="outline" className="text-green-500">
        <TrendingUp className="h-3 w-3 mr-1" />
        +2%
      </Badge>
    },
    // Additional metrics
    {
      title: "Top Revenue Class",
      value: mostPopularClassByRevenue,
      icon: <Dumbbell className="h-5 w-5 text-rose-500" />,
      details: `Total: ${formatINR(mostPopularClassRevenue)}`,
      trend: <Badge variant="outline" className="text-blue-500">
        <TrendingUp className="h-3 w-3 mr-1" />
        Trending
      </Badge>
    },
    {
      title: "Most Profitable Class",
      value: mostProfitableClass,
      icon: <ActivityIcon className="h-5 w-5 text-yellow-500" />,
      details: `${formatINR(mostProfitableRevenue)} per seat`,
      trend: <Badge variant="outline" className="text-green-500">
        <ArrowUpRight className="h-3 w-3 mr-1" />
        +5.8%
      </Badge>
    },
    {
      title: "Barre Rev/Seat",
      value: formatINR(barreRevenuePerSeat),
      icon: <Users className="h-5 w-5 text-pink-500" />,
      details: `${formatNumber(totalBarreCustomers)} customers`,
      trend: <Badge variant="outline" className="text-green-500">
        <TrendingUp className="h-3 w-3 mr-1" />
        +3.5%
      </Badge>
    },
    {
      title: "Cycle Rev/Seat",
      value: formatINR(cycleRevenuePerSeat),
      icon: <Users className="h-5 w-5 text-teal-500" />,
      details: `${formatNumber(totalCycleCustomers)} customers`,
      trend: <Badge variant="outline" className={cycleRevenuePerSeat > barreRevenuePerSeat ? "text-green-500" : "text-red-500"}>
        {cycleRevenuePerSeat > barreRevenuePerSeat ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {cycleRevenuePerSeat > barreRevenuePerSeat ? "+6.2%" : "-2.1%"}
      </Badge>
    },
  ];

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold font-heading bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
            Financial Overview
            {location !== "" && location !== "all" ? ` - ${location}` : ""}
          </h2>
          <Badge variant="outline" className="flex items-center px-3 py-1 rounded-full bg-background/60 backdrop-blur-sm">
            <IndianRupee className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {selectedMonths.length > 0 
                ? `Showing data for ${selectedMonths.length} months` 
                : "Showing all data"}
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
              trend={metric.trend}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Revenue by Class Type & Location Charts */}
      <motion.div 
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        variants={containerVariants}
      >
        <motion.div variants={chartVariants}>
          <Card className="overflow-hidden backdrop-blur-sm border-border/50 bg-gradient-to-br from-background to-background/80">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <ActivityIcon className="h-5 w-5 mr-2 text-barre" />
                Revenue by Class Type
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer 
                className="h-full"
                config={chartConfig}
              >
                <PieChart>
                  <Pie
                    data={revenueByClassTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={120}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${formatINR(value)}`}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {revenueByClassTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<ChartTooltipContent formatter={(value: RechartsValueType) => formatINR(Number(value))} />} 
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                  <Legend align="center" verticalAlign="bottom" layout="horizontal" />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={chartVariants}>
          <Card className="overflow-hidden backdrop-blur-sm border-border/50 bg-gradient-to-br from-background to-background/80">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-cycle" />
                Revenue by Location
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer 
                className="h-full"
                config={chartConfig}
              >
                <BarChart 
                  data={revenueByLocationData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                  onClick={(data) => handleDrillDown(data, "location", "Location")}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    type="number" 
                    tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                    tickFormatter={formatINR}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                    width={120}
                  />
                  <Tooltip 
                    content={<ChartTooltipContent formatter={(value: RechartsValueType) => formatINR(Number(value))} />} 
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                  <Bar 
                    dataKey="value"
                    name="Revenue"
                    fill="var(--chart-primary)"
                    radius={[0, 4, 4, 0]}
                    isAnimationActive={true}
                    animationDuration={1500}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Revenue Trends & Revenue Per Seat */}
      <motion.div 
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        variants={containerVariants}
      >
        <motion.div variants={chartVariants}>
          <Card className="overflow-hidden backdrop-blur-sm border-border/50 bg-gradient-to-br from-background to-background/80">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-barre" />
                Revenue Over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer 
                className="h-full"
                config={chartConfig}
              >
                <AreaChart
                  data={revenueTrendsData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  onClick={(data) => handleDrillDown(data, "month", "Month")}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                    tickFormatter={formatINR}
                  />
                  <Tooltip 
                    content={<ChartTooltipContent formatter={(value: RechartsValueType) => formatINR(Number(value))} />} 
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Total Revenue" 
                    stroke="var(--chart-primary)"
                    fill="var(--chart-primary)" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    isAnimationActive={true}
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="barreRev" 
                    name="Barre Revenue" 
                    stroke="hsl(var(--barre))"
                    fill="hsl(var(--barre))"
                    fillOpacity={0.2}
                    strokeWidth={1.5}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationBegin={300}
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cycleRev" 
                    name="Cycle Revenue" 
                    stroke="hsl(var(--cycle))"
                    fill="hsl(var(--cycle))"
                    fillOpacity={0.2}
                    strokeWidth={1.5}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationBegin={600}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={chartVariants}>
          <Card className="overflow-hidden backdrop-blur-sm border-border/50 bg-gradient-to-br from-background to-background/80">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-cycle" />
                Revenue Per Seat Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer 
                className="h-full"
                config={chartConfig}
              >
                <LineChart
                  data={revenuePerSeatTrendsData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  onClick={(data) => handleDrillDown(data, "month", "Month")}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                    tickFormatter={formatINR}
                  />
                  <Tooltip 
                    content={<ChartTooltipContent formatter={(value: RechartsValueType) => formatINR(Number(value))} />} 
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line 
                    type="monotone" 
                    dataKey="revenuePerSeat" 
                    name="Avg. Revenue/Seat" 
                    stroke="var(--chart-primary)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8, strokeWidth: 1 }}
                    isAnimationActive={true}
                    animationDuration={1500}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="barreRevPerSeat" 
                    name="Barre Rev/Seat" 
                    stroke="hsl(var(--barre))" 
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationBegin={300}
                    animationDuration={1500}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cycleRevPerSeat" 
                    name="Cycle Rev/Seat" 
                    stroke="hsl(var(--cycle))" 
                    dot={{ r: 3 }}
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
      </motion.div>
    </motion.div>
  );
};

export default FinancialsView;
