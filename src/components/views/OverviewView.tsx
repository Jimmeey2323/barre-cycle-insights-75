
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData } from "@/types/fitnessTypes";
import { LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ComposedChart, Area } from 'recharts';
import { useDrillDown } from "@/contexts/DrillDownContext";
import DrillDownDetail from "../DrillDownDetail";
import { formatNumber, formatPercent, formatINR } from "@/lib/formatters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, ArrowDown, ArrowDownRight, ArrowUp, ArrowUpRight, BarChart2, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Users } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import MetricsCard from "../dashboard/MetricsCard";
import FunnelChart from "../FunnelChart";

interface OverviewViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const OverviewView: React.FC<OverviewViewProps> = ({ 
  data, 
  selectedMonths,
  location
}) => {
  const { theme } = useTheme();
  const { setDrillDownData, setShowDrillDown } = useDrillDown();
  const [overviewTab, setOverviewTab] = useState("summary");
  
  // Base colors with theme-aware variations
  const barreColor = theme === "dark" ? "#a78bfa" : "#845EC2"; // Adjusting for dark mode
  const cycleColor = theme === "dark" ? "#5eead4" : "#00C2A8";
  const studentColor = theme === "dark" ? "#93c5fd" : "#60A5FA";
  const revenueColor = theme === "dark" ? "#fcd34d" : "#F59E0B";
  
  // Filter data based on selected months and location
  const filteredStats = data.monthlyStats.filter(stat => 
    (selectedMonths.length === 0 || selectedMonths.includes(stat.monthYear))
  );

  const filteredRawData = data.rawData.filter(record => 
    (selectedMonths.length === 0 || selectedMonths.includes(record["Month Year"])) &&
    (location === "" || location === "all" || record.Location === location)
  );

  // Calculate trend metrics
  let totalBarreSessions = 0;
  let totalCycleSessions = 0;
  let totalBarreRevenue = 0;
  let totalCycleRevenue = 0;
  let totalBarreStudents = 0;
  let totalCycleStudents = 0;
  
  filteredRawData.forEach(record => {
    totalBarreSessions += parseInt(String(record["Barre Sessions"] || "0"));
    totalCycleSessions += parseInt(String(record["Cycle Sessions"] || "0"));
    totalBarreRevenue += parseInt(String(record["Barre Revenue"] || "0"));
    totalCycleRevenue += parseInt(String(record["Cycle Revenue"] || "0"));
    totalBarreStudents += parseInt(String(record["Barre Students"] || "0"));
    totalCycleStudents += parseInt(String(record["Cycle Students"] || "0"));
  });
  
  const totalSessions = totalBarreSessions + totalCycleSessions;
  const totalRevenue = totalBarreRevenue + totalCycleRevenue;
  const totalStudents = totalBarreStudents + totalCycleStudents;
  
  // Calculate trends if we have enough data
  let sessionsTrend = 0;
  let revenueTrend = 0;
  let studentsTrend = 0;
  
  if (filteredStats.length >= 2) {
    // Just compare first and last month as a simple trend
    const firstMonth = filteredStats[0];
    const lastMonth = filteredStats[filteredStats.length - 1];
    
    const firstMonthSessions = parseInt(String(firstMonth.totalBarreSessions || "0")) + 
                              parseInt(String(firstMonth.totalCycleSessions || "0"));
    const lastMonthSessions = parseInt(String(lastMonth.totalBarreSessions || "0")) + 
                             parseInt(String(lastMonth.totalCycleSessions || "0"));
                             
    const firstMonthRevenue = parseInt(String(firstMonth.barreRevenue || "0")) + 
                             parseInt(String(firstMonth.cycleRevenue || "0"));
    const lastMonthRevenue = parseInt(String(lastMonth.barreRevenue || "0")) + 
                            parseInt(String(lastMonth.cycleRevenue || "0"));
                            
    const firstMonthStudents = parseInt(String(firstMonth.barreStudents || "0")) + 
                              parseInt(String(firstMonth.cycleStudents || "0"));
    const lastMonthStudents = parseInt(String(lastMonth.barreStudents || "0")) + 
                             parseInt(String(lastMonth.cycleStudents || "0"));
    
    if (firstMonthSessions > 0) sessionsTrend = ((lastMonthSessions - firstMonthSessions) / firstMonthSessions) * 100;
    if (firstMonthRevenue > 0) revenueTrend = ((lastMonthRevenue - firstMonthRevenue) / firstMonthRevenue) * 100;
    if (firstMonthStudents > 0) studentsTrend = ((lastMonthStudents - firstMonthStudents) / firstMonthStudents) * 100;
  }
  
  // Format trends for display with proper icon
  const formatTrend = (trendValue: number) => {
    const value = Math.abs(trendValue).toFixed(1);
    if (trendValue > 0) {
      return <div className="flex items-center text-green-500"><ArrowUp className="mr-1 h-4 w-4" />{value}%</div>;
    } else if (trendValue < 0) {
      return <div className="flex items-center text-red-500"><ArrowDown className="mr-1 h-4 w-4" />{value}%</div>;
    }
    return null;
  };
  
  // Prepare data for charts
  const sessionsData = filteredStats.map(stat => ({
    name: stat.monthYear,
    barre: stat.totalBarreSessions,
    cycle: stat.totalCycleSessions,
    total: parseInt(String(stat.totalBarreSessions || "0")) + parseInt(String(stat.totalCycleSessions || "0"))
  }));
  
  const revenueData = filteredStats.map(stat => ({
    name: stat.monthYear,
    barre: parseInt(String(stat.barreRevenue || "0")),
    cycle: parseInt(String(stat.cycleRevenue || "0")),
    total: parseInt(String(stat.barreRevenue || "0")) + parseInt(String(stat.cycleRevenue || "0"))
  }));
  
  const studentsData = filteredStats.map(stat => ({
    name: stat.monthYear,
    barre: stat.barreStudents,
    cycle: stat.cycleStudents,
    total: parseInt(String(stat.barreStudents || "0")) + parseInt(String(stat.cycleStudents || "0"))
  }));
  
  // Comparison data for pie charts
  const sessionsCompare = [
    { name: "Barre", value: totalBarreSessions },
    { name: "Cycle", value: totalCycleSessions }
  ];
  
  const revenueCompare = [
    { name: "Barre", value: totalBarreRevenue },
    { name: "Cycle", value: totalCycleRevenue }
  ];
  
  const studentsCompare = [
    { name: "Barre", value: totalBarreStudents },
    { name: "Cycle", value: totalCycleStudents }
  ];
  
  // Chart colors
  const compareColors = [barreColor, cycleColor];
  
  // Simple funnel data
  const funnelStages = [
    {
      id: "total-sessions",
      label: "Total Sessions",
      value: totalSessions,
      color: "#818CF8", // Indigo
      detailedInfo: "Total number of classes conducted across both Barre and Cycle formats."
    },
    {
      id: "filled-sessions",
      label: "Filled Sessions",
      value: filteredRawData.reduce((sum, record) => 
        sum + parseInt(String(record["Non-Empty Barre Sessions"] || "0")) + 
              parseInt(String(record["Non-Empty Cycle Sessions"] || "0"))
      , 0),
      color: "#6366F1", // Indigo medium
      previousStageId: "total-sessions",
      detailedInfo: "Sessions that had at least one student attending."
    },
    {
      id: "total-students",
      label: "Total Students",
      value: totalStudents,
      color: "#4F46E5", // Indigo dark
      previousStageId: "filled-sessions",
      detailedInfo: "Total number of students across all classes."
    },
    {
      id: "revenue",
      label: "Total Revenue",
      value: totalRevenue,
      color: "#4338CA", // Indigo darker
      previousStageId: "total-students",
      detailedInfo: "Total revenue generated across all classes."
    }
  ];
  
  // Function for drill down on chart click
  const handleChartClick = (data: any, chartType: string) => {
    // Only drill down if we have data to show
    if (!data) return;
    
    let detailData: any[] = [];
    
    // Format detail data based on chart type
    if (chartType.includes('Session')) {
      detailData = filteredStats.map(stat => ({
        name: stat.monthYear,
        'Barre Sessions': stat.totalBarreSessions,
        'Cycle Sessions': stat.totalCycleSessions,
        'Total': parseInt(String(stat.totalBarreSessions || "0")) + parseInt(String(stat.totalCycleSessions || "0"))
      }));
    } else if (chartType.includes('Revenue')) {
      detailData = filteredStats.map(stat => ({
        name: stat.monthYear,
        'Barre Revenue': parseInt(String(stat.barreRevenue || "0")),
        'Cycle Revenue': parseInt(String(stat.cycleRevenue || "0")),
        'Total Revenue': parseInt(String(stat.barreRevenue || "0")) + parseInt(String(stat.cycleRevenue || "0"))
      }));
    } else if (chartType.includes('Student')) {
      detailData = filteredStats.map(stat => ({
        name: stat.monthYear,
        'Barre Students': stat.barreStudents,
        'Cycle Students': stat.cycleStudents,
        'Total Students': parseInt(String(stat.barreStudents || "0")) + parseInt(String(stat.cycleStudents || "0"))
      }));
    }
    
    // Set drill down data
    setDrillDownData({
      title: chartType,
      data: detailData,
      type: 'chart'
    });
    
    // Show drill down
    setShowDrillDown(true);
  };
  
  // Check if we have data before rendering charts
  const hasData = Boolean(filteredStats.length > 0 && filteredRawData.length > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricsCard
          title="Total Sessions"
          value={formatNumber(totalSessions)}
          icon={<Activity className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
          details={`${formatNumber(totalBarreSessions)} Barre / ${formatNumber(totalCycleSessions)} Cycle`}
          trend={formatTrend(sessionsTrend)}
          tooltipContent={
            <div className="space-y-2">
              <p>Total number of classes conducted across both Barre and Cycle formats.</p>
              <div className="flex items-center justify-between text-xs">
                <span>Barre:</span>
                <span className="font-medium">{formatNumber(totalBarreSessions)} sessions ({formatPercent((totalBarreSessions / (totalSessions || 1)).toString())})</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Cycle:</span>
                <span className="font-medium">{formatNumber(totalCycleSessions)} sessions ({formatPercent((totalCycleSessions / (totalSessions || 1)).toString())})</span>
              </div>
            </div>
          }
        />
        
        <MetricsCard
          title="Total Revenue"
          value={formatINR(totalRevenue)}
          icon={<IndianRupee className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
          details={`${formatINR(totalBarreRevenue)} Barre / ${formatINR(totalCycleRevenue)} Cycle`}
          trend={formatTrend(revenueTrend)}
          tooltipContent={
            <div className="space-y-2">
              <p>Total revenue generated across all classes.</p>
              <div className="flex items-center justify-between text-xs">
                <span>Barre:</span>
                <span className="font-medium">{formatINR(totalBarreRevenue)} ({formatPercent((totalBarreRevenue / (totalRevenue || 1)).toString())})</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Cycle:</span>
                <span className="font-medium">{formatINR(totalCycleRevenue)} ({formatPercent((totalCycleRevenue / (totalRevenue || 1)).toString())})</span>
              </div>
            </div>
          }
        />
        
        <MetricsCard
          title="Total Students"
          value={formatNumber(totalStudents)}
          icon={<Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          details={`${formatNumber(totalBarreStudents)} Barre / ${formatNumber(totalCycleStudents)} Cycle`}
          trend={formatTrend(studentsTrend)}
          tooltipContent={
            <div className="space-y-2">
              <p>Total number of students across all classes.</p>
              <div className="flex items-center justify-between text-xs">
                <span>Barre:</span>
                <span className="font-medium">{formatNumber(totalBarreStudents)} ({formatPercent((totalBarreStudents / (totalStudents || 1)).toString())})</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Cycle:</span>
                <span className="font-medium">{formatNumber(totalCycleStudents)} ({formatPercent((totalCycleStudents / (totalStudents || 1)).toString())})</span>
              </div>
            </div>
          }
        />
      </div>

      {hasData ? (
        <>
          <Tabs value={overviewTab} onValueChange={setOverviewTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <LineChartIcon className="h-4 w-4" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                Comparison
              </TabsTrigger>
              <TabsTrigger value="funnel" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Funnel
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Sessions Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={sessionsData}
                          margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
                          onClick={(data) => handleChartClick(data, "Sessions Detail")}
                        >
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#818CF8" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#818CF8" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                          <XAxis 
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            angle={-30}
                            tickLine={false}
                            axisLine={false}
                            height={50}
                            textAnchor="end"
                            tickMargin={5}
                          />
                          <YAxis 
                            width={30}
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip />
                          <Bar dataKey="barre" stackId="a" fill={barreColor} radius={[4, 4, 0, 0]} barSize={20} />
                          <Bar dataKey="cycle" stackId="a" fill={cycleColor} radius={[4, 4, 0, 0]} barSize={20} />
                          <Area 
                            type="monotone" 
                            dataKey="total" 
                            stroke="#818CF8" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorTotal)" 
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
                      <div>
                        <span className="inline-block h-2 w-2 rounded-full bg-indigo-500"></span>
                        {" "}Barre: {formatNumber(totalBarreSessions)}
                      </div>
                      <div>
                        <span className="inline-block h-2 w-2 rounded-full bg-teal-500"></span>
                        {" "}Cycle: {formatNumber(totalCycleSessions)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      Revenue Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={revenueData}
                          margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
                          onClick={(data) => handleChartClick(data, "Revenue Detail")}
                        >
                          <defs>
                            <linearGradient id="colorRevenueTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                          <XAxis 
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            angle={-30}
                            tickLine={false}
                            axisLine={false}
                            height={50}
                            textAnchor="end"
                            tickMargin={5}
                          />
                          <YAxis 
                            width={30}
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => formatINR(value).substring(0, 4) + (value > 9999 ? 'k' : '')}
                          />
                          <Tooltip formatter={(value) => formatINR(value)} />
                          <Bar dataKey="barre" stackId="a" fill={barreColor} radius={[4, 4, 0, 0]} barSize={20} />
                          <Bar dataKey="cycle" stackId="a" fill={cycleColor} radius={[4, 4, 0, 0]} barSize={20} />
                          <Area 
                            type="monotone" 
                            dataKey="total" 
                            stroke="#F59E0B" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorRevenueTotal)" 
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
                      <div>
                        <span className="inline-block h-2 w-2 rounded-full bg-indigo-500"></span>
                        {" "}Barre: {formatINR(totalBarreRevenue)}
                      </div>
                      <div>
                        <span className="inline-block h-2 w-2 rounded-full bg-teal-500"></span>
                        {" "}Cycle: {formatINR(totalCycleRevenue)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Students Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={studentsData}
                          margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
                          onClick={(data) => handleChartClick(data, "Students Detail")}
                        >
                          <defs>
                            <linearGradient id="colorStudentTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                          <XAxis 
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            angle={-30}
                            tickLine={false}
                            axisLine={false}
                            height={50}
                            textAnchor="end"
                            tickMargin={5}
                          />
                          <YAxis 
                            width={30}
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip />
                          <Bar dataKey="barre" stackId="a" fill={barreColor} radius={[4, 4, 0, 0]} barSize={20} />
                          <Bar dataKey="cycle" stackId="a" fill={cycleColor} radius={[4, 4, 0, 0]} barSize={20} />
                          <Area 
                            type="monotone" 
                            dataKey="total" 
                            stroke="#60A5FA" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorStudentTotal)" 
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
                      <div>
                        <span className="inline-block h-2 w-2 rounded-full bg-indigo-500"></span>
                        {" "}Barre: {formatNumber(totalBarreStudents)}
                      </div>
                      <div>
                        <span className="inline-block h-2 w-2 rounded-full bg-teal-500"></span>
                        {" "}Cycle: {formatNumber(totalCycleStudents)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="trends">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Sessions Trend</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={sessionsData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
                        onClick={(data) => handleChartClick(data, "Sessions Trend")}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis 
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="barre" 
                          name="Barre Sessions" 
                          stroke={barreColor}
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cycle" 
                          name="Cycle Sessions" 
                          stroke={cycleColor}
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={revenueData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
                        onClick={(data) => handleChartClick(data, "Revenue Trend")}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis 
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis tickFormatter={(value) => formatINR(value).substring(0, 5) + (value > 9999 ? 'k' : '')} />
                        <Tooltip formatter={(value) => formatINR(value)} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="barre" 
                          name="Barre Revenue" 
                          stroke={barreColor}
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cycle" 
                          name="Cycle Revenue" 
                          stroke={cycleColor}
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="comparison">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Sessions by Type</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart onClick={(data) => handleChartClick(data, "Sessions by Type")}>
                        <Pie
                          data={sessionsCompare}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {sessionsCompare.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={compareColors[index % compareColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatNumber(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Type</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart onClick={(data) => handleChartClick(data, "Revenue by Type")}>
                        <Pie
                          data={revenueCompare}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {revenueCompare.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={compareColors[index % compareColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatINR(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Students by Type</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart onClick={(data) => handleChartClick(data, "Students by Type")}>
                        <Pie
                          data={studentsCompare}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {studentsCompare.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={compareColors[index % compareColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatNumber(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="funnel">
              <Card>
                <CardHeader>
                  <CardTitle>Business Funnel</CardTitle>
                  <CardDescription>From sessions to revenue flow</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="px-4 md:px-20">
                    <FunnelChart 
                      title=""
                      stages={funnelStages}
                      height={350}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">No data available for the selected filters.</div>
          <div className="mt-2 text-sm">Try adjusting your month or location filters.</div>
        </Card>
      )}
    </div>
  );
};

// Missing import
import { IndianRupee } from "lucide-react";

export default OverviewView;
