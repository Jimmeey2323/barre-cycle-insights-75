
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData } from "@/types/fitnessTypes";
import { 
  LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, PieChart, Pie, Sector, ComposedChart, Area
} from 'recharts';
import { formatINR, formatNumber, formatPercent } from "@/lib/formatters";
import { useDrillDown } from "@/contexts/DrillDownContext";
import { 
  IndianRupee, TrendingUp, TrendingDown, 
  DollarSign, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import MetricsCard from "../dashboard/MetricsCard";
import { motion } from "framer-motion";
import { filterData } from "@/lib/utils";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/contexts/ThemeContext";
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';

interface FinancialsViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const FinancialsView: React.FC<FinancialsViewProps> = ({ data, selectedMonths, location }) => {
  const { showDrillDown } = useDrillDown();
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Filter data based on selected months and location
  const filteredData = useMemo(() => {
    return filterData(data, selectedMonths, location);
  }, [data, selectedMonths, location]);

  // Extract filtered stats and raw data
  const filteredStats = filteredData.monthlyStats;
  const filteredRawData = filteredData.rawData;

  // CALCULATIONS FOR METRICS AND CHARTS
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

  // Calculate total sessions and customers
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

  // Calculate financial metrics
  const avgRevenuePerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;
  const avgRevenuePerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  const barreRevenuePerSession = totalBarreSessions > 0 ? totalBarrePaid / totalBarreSessions : 0;
  const cycleRevenuePerSession = totalCycleSessions > 0 ? totalCyclePaid / totalCycleSessions : 0;
  const barreRevenuePerCustomer = totalBarreCustomers > 0 ? totalBarrePaid / totalBarreCustomers : 0;
  const cycleRevenuePerCustomer = totalCycleCustomers > 0 ? totalCyclePaid / totalCycleCustomers : 0;

  // Only add revenue share if we have revenue data
  const revenueShare = totalRevenue > 0 ? {
    barreShare: (totalBarrePaid / totalRevenue) * 100,
    cycleShare: (totalCyclePaid / totalRevenue) * 100
  } : { barreShare: 0, cycleShare: 0 };

  // Calculate revenue growth (using first and last month in filtered data)
  const sortedMonthlyStats = [...filteredStats].sort((a, b) => {
    const [aMonth, aYear] = a.monthYear.split('-');
    const [bMonth, bYear] = b.monthYear.split('-');
    
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
    return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
  });

  const firstMonth = sortedMonthlyStats[0];
  const lastMonth = sortedMonthlyStats[sortedMonthlyStats.length - 1];
  
  // Fixed Boolean call signature error - change Boolean to a conditional expression
  const revenueGrowth = firstMonth && lastMonth && firstMonth.totalRevenue > 0 
    ? ((lastMonth.totalRevenue - firstMonth.totalRevenue) / firstMonth.totalRevenue) * 100 
    : 0;

  // PREPARE CHART DATA
  // Revenue trends data
  const revenueTrendsData = sortedMonthlyStats.map(stat => ({
    name: stat.monthYear,
    revenue: stat.totalRevenue,
    barreRev: stat.barrePaid || 0,
    cycleRev: stat.cyclePaid || 0
  }));

  // Revenue per session data
  const revenuePerSessionData = sortedMonthlyStats.map(stat => {
    const barreSessions = stat.barreSessions || 0;
    const cycleSessions = stat.cycleSessions || 0;
    const barreRevPerSession = barreSessions > 0 ? (stat.barrePaid || 0) / barreSessions : 0;
    const cycleRevPerSession = cycleSessions > 0 ? (stat.cyclePaid || 0) / cycleSessions : 0;
    const totalRevPerSession = (barreSessions + cycleSessions) > 0 
      ? (stat.totalRevenue || 0) / (barreSessions + cycleSessions) 
      : 0;
    
    return {
      name: stat.monthYear,
      barreRevPerSession,
      cycleRevPerSession,
      totalRevPerSession
    };
  });

  // Revenue breakdown data for pie chart
  const revenueBreakdownData = [
    { name: "Barre Revenue", value: totalBarrePaid, fill: "hsl(var(--barre))" },
    { name: "Cycle Revenue", value: totalCyclePaid, fill: "hsl(var(--cycle))" }
  ];

  // Revenue per customer data
  const revenuePerCustomerData = sortedMonthlyStats.map(stat => {
    const barreCustomers = stat.barreCustomers || 0;
    const cycleCustomers = stat.cycleCustomers || 0;
    const barreRevPerCustomer = barreCustomers > 0 ? (stat.barrePaid || 0) / barreCustomers : 0;
    const cycleRevPerCustomer = cycleCustomers > 0 ? (stat.cyclePaid || 0) / cycleCustomers : 0;
    const totalRevPerCustomer = (barreCustomers + cycleCustomers) > 0 
      ? (stat.totalRevenue || 0) / (barreCustomers + cycleCustomers) 
      : 0;
    
    return {
      name: stat.monthYear,
      barreRevPerCustomer,
      cycleRevPerCustomer,
      totalRevPerCustomer
    };
  });

  // Revenue composition data
  const revenueCompositionData = sortedMonthlyStats.map(stat => ({
    name: stat.monthYear,
    barreRevenue: stat.barrePaid || 0,
    cycleRevenue: stat.cyclePaid || 0
  }));

  // Handle drill downs
  const handleDrillDown = (data: any, title: string) => {
    if (!data || !data.activePayload || !data.activePayload.length) return;
    
    const item = data.activePayload[0].payload;
    const monthData = filteredRawData.filter(record => 
      String(record["Month Year"]) === item.name
    );
    
    if (monthData.length > 0) {
      showDrillDown(monthData, `${title}: ${item.name}`, 'financial');
    }
  };

  // METRICS DATA FOR CARDS
  const metricsData = [
    {
      title: "Total Revenue",
      value: formatINR(totalRevenue),
      icon: <IndianRupee className="h-5 w-5 text-green-500" />,
      details: `${formatINR(totalBarrePaid)} Barre, ${formatINR(totalCyclePaid)} Cycle`,
      trend: <Badge variant="outline" className={revenueGrowth >= 0 ? "text-green-500" : "text-red-500"}>
        {revenueGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {revenueGrowth >= 0 ? `+${revenueGrowth.toFixed(1)}%` : `${revenueGrowth.toFixed(1)}%`}
      </Badge>,
      sparkline: revenueTrendsData.map(d => d.revenue)
    },
    {
      title: "Avg Revenue/Session",
      value: formatINR(avgRevenuePerSession),
      icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
      details: `${formatINR(barreRevenuePerSession)} Barre, ${formatINR(cycleRevenuePerSession)} Cycle`,
      trend: <Badge variant="outline" className="text-green-500">
        <TrendingUp className="h-3 w-3 mr-1" />
        +3.2%
      </Badge>,
      sparkline: revenuePerSessionData.map(d => d.totalRevPerSession)
    },
    {
      title: "Avg Revenue/Customer",
      value: formatINR(avgRevenuePerCustomer),
      icon: <DollarSign className="h-5 w-5 text-purple-500" />,
      details: `${formatINR(barreRevenuePerCustomer)} Barre, ${formatINR(cycleRevenuePerCustomer)} Cycle`,
      trend: <Badge variant="outline" className="text-green-500">
        <TrendingUp className="h-3 w-3 mr-1" />
        +2.8%
      </Badge>,
      sparkline: revenuePerCustomerData.map(d => d.totalRevPerCustomer)
    },
    {
      title: "Revenue Share",
      value: `${revenueShare ? revenueShare.barreShare.toFixed(1) : '0'}% / ${revenueShare ? revenueShare.cycleShare.toFixed(1) : '0'}%`,
      icon: <PieChartIcon className="h-5 w-5 text-amber-500" />,
      details: `Barre / Cycle`,
      trend: <Badge variant="outline" className="text-blue-500">
        <LineChartIcon className="h-3 w-3 mr-1" />
        Stable
      </Badge>
    }
  ];

  // Active shape for pie chart
  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
  
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-sm font-medium">
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none"/>
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none"/>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="var(--foreground)" className="text-xs">
          {`${formatINR(value)}`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="var(--muted-foreground)" className="text-xs">
          {`(${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
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
          <h2 className="text-3xl font-bold font-heading bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            Financial Analysis {location !== "" && location !== "all" ? `- ${location}` : ""}
          </h2>
          <Badge variant="outline" className="flex items-center px-3 py-1 rounded-full bg-background/60 backdrop-blur-sm">
            <IndianRupee className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {selectedMonths.length > 0 
                ? `Showing data for ${selectedMonths.length} months` 
                : "Showing all data"}
              {location && location !== "all" ? ` in ${location}` : ""}
            </span>
          </Badge>
        </div>
      </motion.div>

      {/* Metrics Grid with Sparklines */}
      <motion.div 
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4"
        variants={containerVariants}
      >
        {metricsData.map((metric, index) => (
          <motion.div key={index} variants={itemVariants} custom={index}>
            <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm animate-fade-in hover:border-primary/30 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    {metric.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                      {metric.trend}
                    </div>
                    <div className="text-2xl font-bold animate-fade-up">
                      {metric.value}
                    </div>
                    <p className="text-xs text-muted-foreground">{metric.details}</p>
                    
                    {/* Add sparkline if data is available */}
                    {metric.sparkline && metric.sparkline.length > 0 && (
                      <div className="h-8 mt-2">
                        <Sparklines data={metric.sparkline} width={100} height={30}>
                          <SparklinesLine color="var(--chart-primary)" style={{ fill: "none" }} />
                          <SparklinesSpots size={2} style={{ fill: "var(--chart-primary)" }} />
                        </Sparklines>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs for different financial views */}
      <motion.div variants={containerVariants}>
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">Revenue Trends</TabsTrigger>
            <TabsTrigger value="breakdown">Revenue Breakdown</TabsTrigger>
            <TabsTrigger value="perSession">Revenue per Session</TabsTrigger>
            <TabsTrigger value="perCustomer">Revenue per Customer</TabsTrigger>
          </TabsList>
          
          {/* Revenue Trends Tab */}
          <TabsContent value="trends" className="mt-4">
            <motion.div variants={chartVariants}>
              <Card className="overflow-hidden backdrop-blur-sm border-border/50 bg-gradient-to-br from-background to-background/80">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <LineChartIcon className="h-5 w-5 mr-2 text-green-400" />
                    Revenue Trends Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
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
                        tickFormatter={formatINR} 
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
          </TabsContent>
          
          {/* Revenue Breakdown Tab */}
          <TabsContent value="breakdown" className="mt-4">
            <motion.div variants={chartVariants}>
              <Card className="overflow-hidden backdrop-blur-sm border-border/50 bg-gradient-to-br from-background to-background/80">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2 text-amber-400" />
                    Revenue Breakdown by Class Type
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ChartContainer 
                    className="h-full"
                    config={chartConfig}
                  >
                    <PieChart>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={revenueBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        dataKey="value"
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={1800}
                      >
                        {revenueBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
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
            </motion.div>
          </TabsContent>
          
          {/* Revenue per Session Tab */}
          <TabsContent value="perSession" className="mt-4">
            <motion.div variants={chartVariants}>
              <Card className="overflow-hidden backdrop-blur-sm border-border/50 bg-gradient-to-br from-background to-background/80">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
                    Revenue per Session Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ChartContainer 
                    className="h-full"
                    config={chartConfig}
                  >
                    <LineChart 
                      data={revenuePerSessionData}
                      margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                      onClick={(data) => handleDrillDown(data, 'Revenue per Session for')}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                        padding={{ left: 10, right: 10 }}
                      />
                      <YAxis 
                        tickFormatter={formatINR} 
                        tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                      />
                      <Tooltip 
                        content={<ChartTooltipContent labelFormatter={(label) => `Month: ${label}`} />} 
                        wrapperStyle={{ zIndex: 1000 }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Line 
                        type="monotone" 
                        dataKey="totalRevPerSession" 
                        name="Total Revenue per Session" 
                        stroke="var(--chart-primary)" 
                        strokeWidth={2}
                        activeDot={{ r: 8, strokeWidth: 1 }}
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={1500}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="barreRevPerSession" 
                        name="Barre Revenue per Session" 
                        stroke="hsl(var(--barre))" 
                        activeDot={{ r: 6 }}
                        isAnimationActive={true}
                        animationBegin={300}
                        animationDuration={1500}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cycleRevPerSession" 
                        name="Cycle Revenue per Session" 
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
          </TabsContent>
          
          {/* Revenue per Customer Tab */}
          <TabsContent value="perCustomer" className="mt-4">
            <motion.div variants={chartVariants}>
              <Card className="overflow-hidden backdrop-blur-sm border-border/50 bg-gradient-to-br from-background to-background/80">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-purple-400" />
                    Revenue per Customer Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ChartContainer 
                    className="h-full"
                    config={chartConfig}
                  >
                    <ComposedChart 
                      data={revenueCompositionData}
                      margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                      onClick={(data) => handleDrillDown(data, 'Revenue Composition for')}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                        padding={{ left: 10, right: 10 }}
                      />
                      <YAxis 
                        tickFormatter={formatINR} 
                        tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                      />
                      <Tooltip 
                        content={<ChartTooltipContent labelFormatter={(label) => `Month: ${label}`} />} 
                        wrapperStyle={{ zIndex: 1000 }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Area 
                        type="monotone" 
                        dataKey="barreRevenue" 
                        name="Barre Revenue" 
                        fill="hsl(var(--barre))" 
                        stroke="hsl(var(--barre))"
                        fillOpacity={0.3}
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={1500}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="cycleRevenue" 
                        name="Cycle Revenue" 
                        fill="hsl(var(--cycle))" 
                        stroke="hsl(var(--cycle))"
                        fillOpacity={0.3}
                        isAnimationActive={true}
                        animationBegin={300}
                        animationDuration={1500}
                      />
                      <Bar 
                        dataKey="barreRevenue" 
                        name="Barre Revenue" 
                        fill="hsl(var(--barre))"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                        fillOpacity={0.8}
                        isAnimationActive={true}
                        animationBegin={600}
                        animationDuration={1500}
                      />
                      <Bar 
                        dataKey="cycleRevenue" 
                        name="Cycle Revenue" 
                        fill="hsl(var(--cycle))"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                        fillOpacity={0.8}
                        isAnimationActive={true}
                        animationBegin={900}
                        animationDuration={1500}
                      />
                    </ComposedChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default FinancialsView;
