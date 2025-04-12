
import React, { useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData } from "@/types/fitnessTypes";
import { LineChart, BarChart, PieChart, FunnelChart, Funnel, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, TooltipProps, LabelList } from 'recharts';
import { formatINR, formatNumber, formatPercent } from "@/lib/formatters";
import { useDrillDown } from "@/contexts/DrillDownContext";
import { Users, BarChart as BarChartIcon, BarChart2, Activity, TrendingUp, TrendingDown, User, UserPlus, RefreshCcw, Dumbbell, Hourglass, Timer, IndianRupee, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import MetricsCard from "../dashboard/MetricsCard";
import { motion } from "framer-motion";

interface OverviewViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const OverviewView: React.FC<OverviewViewProps> = ({ data, selectedMonths, location }) => {
  const { setDrillDown, setShowDrillDown } = useDrillDown();

  // Filter data based on selected months and location
  const filteredStats = useMemo(() => {
    return data.monthlyStats.filter(stat => 
      (selectedMonths.length === 0 || selectedMonths.includes(stat.monthYear)) &&
      (location === "" || location === "all" || stat.Location === location)
    );
  }, [data, selectedMonths, location]);

  const filteredRawData = useMemo(() => {
    return data.rawData.filter(record => 
      (selectedMonths.length === 0 || selectedMonths.includes(String(record["Month Year"]))) &&
      (location === "" || location === "all" || record.Location === location)
    );
  }, [data, selectedMonths, location]);

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
  const totalBarreAttendance = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Barre Attendance"] || 0)), 0), 
    [filteredRawData]);

  const totalCycleAttendance = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Cycle Attendance"] || 0)), 0), 
    [filteredRawData]);

  const totalAttendance = totalBarreAttendance + totalCycleAttendance;

  // Calculate total customers and revenue
  const totalCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Total Customers"] || 0)), 0), 
    [filteredRawData]);

  const totalRevenue = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Total Revenue"] || 0)), 0), 
    [filteredRawData]);

  // Calculate retention and conversion metrics for funnel
  const totalRetained = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Retained Customers"] || 0)), 0), 
    [filteredRawData]);

  const totalConverted = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Converted Customers"] || 0)), 0), 
    [filteredRawData]);

  const totalNewCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["New Customers"] || 0)), 0), 
    [filteredRawData]);

  // Calculate averages
  const avgBarreClassSize = totalBarreSessions > 0 ? totalBarreAttendance / totalBarreSessions : 0;
  const avgCycleClassSize = totalCycleSessions > 0 ? totalCycleAttendance / totalCycleSessions : 0;
  const avgRevPerClass = totalSessions > 0 ? totalRevenue / totalSessions : 0;
  const avgRevPerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  // Calculate retention and conversion rates
  const retentionRate = totalCustomers > 0 ? (totalRetained / totalCustomers) * 100 : 0;
  const conversionRate = totalCustomers > 0 ? (totalConverted / totalCustomers) * 100 : 0;
  const newCustomerRate = totalCustomers > 0 ? (totalNewCustomers / totalCustomers) * 100 : 0;

  // PREPARE CHART DATA
  // Sessions comparison data
  const sessionsComparisonData = filteredStats.map(stat => ({
    name: stat.monthYear,
    barre: parseInt(String(stat.totalBarreSessions)),
    cycle: parseInt(String(stat.totalCycleSessions))
  }));

  // Customer funnel data
  const funnelData = [
    {
      name: "Total Customers",
      value: totalCustomers,
      fill: "#845EC2"
    },
    {
      name: "Retained Customers",
      value: totalRetained,
      fill: "#00C2A8"
    },
    {
      name: "Converted Customers", 
      value: totalConverted,
      fill: "#B39CD0"
    }
  ];

  // Revenue trends data
  const revenueTrendsData = filteredStats.map(stat => ({
    name: stat.monthYear,
    revenue: stat.totalRevenue,
    barreRev: stat.barreRevenue || 0,
    cycleRev: stat.cycleRevenue || 0
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
    barreAttendance: stat.barreAttendance || 0,
    cycleAttendance: stat.cycleAttendance || 0,
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

  // Handle drill downs
  const handleDrillDown = (data: any, title: string) => {
    if (!data || !data.activePayload || !data.activePayload.length) return;
    
    const item = data.activePayload[0].payload;
    const monthData = filteredRawData.filter(record => 
      String(record["Month Year"]) === item.name
    );
    
    if (monthData.length > 0) {
      setDrillDown({
        title: `${title}: ${item.name}`,
        data: monthData,
        type: 'month'
      });
      setShowDrillDown(true);
    }
  };

  // CHART COLORS AND STYLING
  const barreColor = "#FF6F91";
  const cycleColor = "#00C2A8";
  const revenueColor = "#845EC2";
  const customerColor = "#00C9A7";
  const retainedColor = "#FFC75F";
  const convertedColor = "#F9F871";

  // METRICS DATA FOR CARDS
  const metricsData = [
    {
      title: "Total Sessions",
      value: formatNumber(totalSessions),
      icon: <Activity className="h-5 w-5 text-purple-500" />,
      details: `${formatNumber(totalBarreSessions)} Barre, ${formatNumber(totalCycleSessions)} Cycle`,
      trend: <Badge variant="outline" className={totalSessions > 0 ? "text-green-500" : "text-red-500"}>
        {totalSessions > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {totalSessions > 0 ? "+5%" : "-2%"}
      </Badge>
    },
    {
      title: "Total Attendance",
      value: formatNumber(totalAttendance),
      icon: <Users className="h-5 w-5 text-blue-500" />,
      details: `${formatNumber(totalBarreAttendance)} Barre, ${formatNumber(totalCycleAttendance)} Cycle`,
      trend: <Badge variant="outline" className="text-green-500">
        <TrendingUp className="h-3 w-3 mr-1" />
        +3%
      </Badge>
    },
    {
      title: "Total Revenue",
      value: formatINR(totalRevenue),
      icon: <IndianRupee className="h-5 w-5 text-green-500" />,
      details: `Avg ${formatINR(avgRevPerClass)} per class`,
      trend: <Badge variant="outline" className="text-green-500">
        <TrendingUp className="h-3 w-3 mr-1" />
        +7%
      </Badge>
    },
    {
      title: "Total Customers",
      value: formatNumber(totalCustomers),
      icon: <User className="h-5 w-5 text-amber-500" />,
      details: `${formatNumber(totalNewCustomers)} new customers`,
      trend: <Badge variant="outline" className="text-green-500">
        <TrendingUp className="h-3 w-3 mr-1" />
        +4%
      </Badge>
    },
    // Additional metrics
    {
      title: "Avg Class Size",
      value: (avgBarreClassSize + avgCycleClassSize) / 2 > 0 ? 
        ((avgBarreClassSize + avgCycleClassSize) / 2).toFixed(1) : "0",
      icon: <Users className="h-5 w-5 text-violet-500" />,
      details: `Barre: ${avgBarreClassSize.toFixed(1)}, Cycle: ${avgCycleClassSize.toFixed(1)}`,
      trend: <Badge variant="outline" className="text-green-500">
        <TrendingUp className="h-3 w-3 mr-1" />
        +2%
      </Badge>
    },
    {
      title: "Retention Rate",
      value: `${retentionRate.toFixed(1)}%`,
      icon: <RefreshCcw className="h-5 w-5 text-teal-500" />,
      details: `${formatNumber(totalRetained)} retained customers`,
      trend: <Badge variant="outline" className="text-green-500">
        <TrendingUp className="h-3 w-3 mr-1" />
        +1.5%
      </Badge>
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate.toFixed(1)}%`,
      icon: <Zap className="h-5 w-5 text-amber-500" />,
      details: `${formatNumber(totalConverted)} converted customers`,
      trend: <Badge variant="outline" className="text-green-500">
        <TrendingUp className="h-3 w-3 mr-1" />
        +2.3%
      </Badge>
    },
    {
      title: "Avg Rev/Customer",
      value: formatINR(avgRevPerCustomer),
      icon: <IndianRupee className="h-5 w-5 text-rose-500" />,
      details: `Total: ${formatINR(totalRevenue)}`,
      trend: <Badge variant="outline" className="text-green-500">
        <TrendingUp className="h-3 w-3 mr-1" />
        +6%
      </Badge>
    },
  ];

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

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/90 backdrop-blur-sm p-3 rounded-lg border border-border/50 shadow-lg">
          <p className="font-medium text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <p className="text-xs">
                <span className="font-medium">{entry.name}: </span>
                {entry.name.toLowerCase().includes('revenue') 
                  ? formatINR(entry.value)
                  : entry.name.toLowerCase().includes('rate')
                    ? `${entry.value}%`
                    : formatNumber(entry.value)}
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
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
          <h2 className="text-3xl font-bold font-heading bg-gradient-to-r from-barre to-cycle bg-clip-text text-transparent">
            Dashboard Overview
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
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
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

      {/* Customer Funnel & Revenue Trends */}
      <motion.div 
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-customerColor" />
                Customer Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Funnel
                    dataKey="value"
                    data={funnelData}
                    isAnimationActive={true}
                    animationBegin={200}
                    animationDuration={800}
                  >
                    <LabelList 
                      position="right"
                      fill="#888"
                      stroke="none"
                      dataKey="name"
                    />
                    <LabelList
                      position="center"
                      fill="#fff"
                      stroke="none"
                      dataKey="value"
                      formatter={(value: number) => formatNumber(value)}
                    />
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <IndianRupee className="h-5 w-5 mr-2 text-revenueColor" />
                Revenue Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={revenueTrendsData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
                  onClick={(data) => handleDrillDown(data, 'Revenue for')}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60} 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tickFormatter={(value) => formatINR(value)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Total Revenue" 
                    stroke={revenueColor} 
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
                    stroke={barreColor} 
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationBegin={300}
                    animationDuration={1500}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cycleRev" 
                    name="Cycle Revenue" 
                    stroke={cycleColor} 
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationBegin={600}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Sessions Comparison & Class Attendance */}
      <motion.div 
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-barreColor" />
                Sessions Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={sessionsComparisonData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
                  onClick={(data) => handleDrillDown(data, 'Sessions for')}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60} 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar 
                    dataKey="barre" 
                    name="Barre Sessions" 
                    fill={barreColor}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={1200}
                  />
                  <Bar 
                    dataKey="cycle" 
                    name="Cycle Sessions" 
                    fill={cycleColor}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={true}
                    animationBegin={300}
                    animationDuration={1200}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Class Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={attendanceComparisonData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
                  onClick={(data) => handleDrillDown(data, 'Attendance for')}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60} 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Line 
                    type="monotone" 
                    dataKey="barreAttendance" 
                    name="Barre Attendance" 
                    stroke={barreColor}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8, strokeWidth: 1 }}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={1200}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cycleAttendance" 
                    name="Cycle Attendance" 
                    stroke={cycleColor}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8, strokeWidth: 1 }}
                    isAnimationActive={true}
                    animationBegin={300}
                    animationDuration={1200}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default OverviewView;
