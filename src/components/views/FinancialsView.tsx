
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData, RechartsValueType, RechartsNameType } from "@/types/fitnessTypes";
import { AreaChart, BarChart, ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from "@/components/ui/table";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { formatINR, formatPercent, toNumber } from "@/lib/formatters";
import { IndianRupee, ArrowUpRight, ArrowDownRight, TrendingUp, BarChart3, LineChart, PieChart } from "lucide-react";
import { useDrillDown } from "@/contexts/DrillDownContext";

interface FinancialsViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const FinancialsView: React.FC<FinancialsViewProps> = ({ data, selectedMonths, location }) => {
  const { showDrillDown } = useDrillDown();
  
  // Filter data based on selected months and location
  const filteredStats = data.monthlyStats.filter(stat => 
    (selectedMonths.length === 0 || selectedMonths.includes(stat.monthYear))
  );

  const filteredRawData = data.rawData.filter(record => 
    (selectedMonths.length === 0 || selectedMonths.includes(record["Month Year"])) &&
    (location === "" || record.Location === location)
  );

  // Sort by month year
  filteredStats.sort((a, b) => {
    // Parse "MMM-YYYY" format
    const [aMonth, aYear] = a.monthYear.split('-');
    const [bMonth, bYear] = b.monthYear.split('-');
    
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const yearComparison = Number(aYear) - Number(bYear);
    if (yearComparison !== 0) return yearComparison;
    
    return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
  });

  // Revenue by month
  const revenueByMonth = filteredStats.map(stat => ({
    name: stat.monthYear,
    barre: stat.totalBarrePaid,
    cycle: stat.totalCyclePaid,
    total: stat.totalBarrePaid + stat.totalCyclePaid
  }));

  // Calculate revenue per customer
  const revenuePerCustomer = filteredStats.map(stat => {
    const barreRevPerCustomer = stat.totalBarreCustomers > 0 ? stat.totalBarrePaid / stat.totalBarreCustomers : 0;
    const cycleRevPerCustomer = stat.totalCycleCustomers > 0 ? stat.totalCyclePaid / stat.totalCycleCustomers : 0;
    const totalCustomers = stat.totalBarreCustomers + stat.totalCycleCustomers;
    const totalRevenue = stat.totalBarrePaid + stat.totalCyclePaid;
    const avgRevPerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    
    return {
      name: stat.monthYear,
      barre: barreRevPerCustomer,
      cycle: cycleRevPerCustomer,
      average: avgRevPerCustomer
    };
  });

  // Revenue per session
  const revenuePerSession = filteredStats.map(stat => {
    const barreRevPerSession = stat.totalBarreSessions > 0 ? stat.totalBarrePaid / stat.totalBarreSessions : 0;
    const cycleRevPerSession = stat.totalCycleSessions > 0 ? stat.totalCyclePaid / stat.totalCycleSessions : 0;
    const totalSessions = stat.totalBarreSessions + stat.totalCycleSessions;
    const totalRevenue = stat.totalBarrePaid + stat.totalCyclePaid;
    const avgRevPerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;
    
    return {
      name: stat.monthYear,
      barre: barreRevPerSession,
      cycle: cycleRevPerSession,
      average: avgRevPerSession
    };
  });

  // Monthly trend with percentage change
  const monthlyTrendData = filteredStats.map((stat, index, array) => {
    const prevMonth = index > 0 ? array[index - 1] : null;
    
    const currentRevenue = stat.totalBarrePaid + stat.totalCyclePaid;
    const prevRevenue = prevMonth ? (prevMonth.totalBarrePaid + prevMonth.totalCyclePaid) : 0;
    
    const change = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    
    return {
      name: stat.monthYear,
      revenue: currentRevenue,
      change: change
    };
  });

  // Create table data
  const tableData = filteredStats.map(stat => ({
    month: stat.monthYear,
    barreRevenue: stat.totalBarrePaid,
    cycleRevenue: stat.totalCyclePaid,
    totalRevenue: stat.totalBarrePaid + stat.totalCyclePaid,
    barreCustomers: stat.totalBarreCustomers,
    cycleCustomers: stat.totalCycleCustomers,
    totalCustomers: stat.totalBarreCustomers + stat.totalCycleCustomers,
    revenuePerCustomer: (stat.totalBarreCustomers + stat.totalCycleCustomers) > 0 ? 
      (stat.totalBarrePaid + stat.totalCyclePaid) / (stat.totalBarreCustomers + stat.totalCycleCustomers) : 0
  }));

  // Calculate totals for table
  const tableTotals = {
    barreRevenue: tableData.reduce((sum, item) => sum + item.barreRevenue, 0),
    cycleRevenue: tableData.reduce((sum, item) => sum + item.cycleRevenue, 0),
    totalRevenue: tableData.reduce((sum, item) => sum + item.totalRevenue, 0),
    barreCustomers: tableData.reduce((sum, item) => sum + item.barreCustomers, 0),
    cycleCustomers: tableData.reduce((sum, item) => sum + item.cycleCustomers, 0),
    totalCustomers: tableData.reduce((sum, item) => sum + item.totalCustomers, 0),
    revenuePerCustomer: 0
  };
  
  // Calculate average revenue per customer
  tableTotals.revenuePerCustomer = tableTotals.totalCustomers > 0 ? 
    tableTotals.totalRevenue / tableTotals.totalCustomers : 0;

  // Calculate quarterly totals (subtotals)
  const getQuarter = (monthStr: string) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthStr.split('-')[0];
    const monthIndex = monthNames.indexOf(month);
    return Math.floor(monthIndex / 3) + 1;
  };

  const quarterlyData: { [key: string]: any } = {};
  tableData.forEach(item => {
    const year = item.month.split('-')[1];
    const quarter = getQuarter(item.month);
    const key = `Q${quarter} ${year}`;
    
    if (!quarterlyData[key]) {
      quarterlyData[key] = {
        quarter: key,
        barreRevenue: 0,
        cycleRevenue: 0,
        totalRevenue: 0,
        barreCustomers: 0,
        cycleCustomers: 0,
        totalCustomers: 0,
        months: []
      };
    }
    
    quarterlyData[key].barreRevenue += item.barreRevenue;
    quarterlyData[key].cycleRevenue += item.cycleRevenue;
    quarterlyData[key].totalRevenue += item.totalRevenue;
    quarterlyData[key].barreCustomers += item.barreCustomers;
    quarterlyData[key].cycleCustomers += item.cycleCustomers;
    quarterlyData[key].totalCustomers += item.totalCustomers;
    quarterlyData[key].months.push(item.month);
  });

  // Calculate average revenue per customer for each quarter
  Object.values(quarterlyData).forEach((quarter: any) => {
    quarter.revenuePerCustomer = quarter.totalCustomers > 0 ? 
      quarter.totalRevenue / quarter.totalCustomers : 0;
  });

  const quarterlyTotals = Object.values(quarterlyData).sort((a: any, b: any) => {
    // Sort by year then quarter
    const yearA = a.quarter.split(' ')[1];
    const yearB = b.quarter.split(' ')[1];
    const quarterA = a.quarter.split(' ')[0].substring(1);
    const quarterB = b.quarter.split(' ')[0].substring(1);
    
    if (yearA !== yearB) return Number(yearA) - Number(yearB);
    return Number(quarterA) - Number(quarterB);
  });

  const barreColor = "#845EC2";  // Updated to match new colors
  const cycleColor = "#00C2A8";  // Updated to match new colors
  const totalColor = "#6366F1";
  const changeColor = "#10B981";

  // Calculate summary metrics
  const totalRevenue = filteredStats.reduce((sum, stat) => sum + stat.totalBarrePaid + stat.totalCyclePaid, 0);
  const barreRevenue = filteredStats.reduce((sum, stat) => sum + stat.totalBarrePaid, 0);
  const cycleRevenue = filteredStats.reduce((sum, stat) => sum + stat.totalCyclePaid, 0);
  
  const totalBarreSessions = filteredStats.reduce((sum, stat) => sum + stat.totalBarreSessions, 0);
  const totalCycleSessions = filteredStats.reduce((sum, stat) => sum + stat.totalCycleSessions, 0);
  
  const avgRevenuePerBarreSession = totalBarreSessions > 0 ? barreRevenue / totalBarreSessions : 0;
  const avgRevenuePerCycleSession = totalCycleSessions > 0 ? cycleRevenue / totalCycleSessions : 0;

  // Calculate growth rate
  const firstMonth = filteredStats[0];
  const lastMonth = filteredStats[filteredStats.length - 1];
  const growthRate = filteredStats.length > 1 && firstMonth ? 
    ((lastMonth.totalBarrePaid + lastMonth.totalCyclePaid) - (firstMonth.totalBarrePaid + firstMonth.totalCyclePaid)) / 
    (firstMonth.totalBarrePaid + firstMonth.totalCyclePaid) * 100 : 0;

  // Handle chart click for drill down
  const handleChartClick = (data: any, chartName: string) => {
    if (data) {
      showDrillDown({
        title: `${chartName}: ${data.name}`,
        data: filteredRawData.filter(r => r["Month Year"] === data.name),
        summary: {
          totalRevenue: data.total || data.revenue || 0,
          barreRevenue: data.barre || 0,
          cycleRevenue: data.cycle || 0,
          change: data.change !== undefined ? data.change : null,
          averageRevenue: data.average || 0
        }
      });
    }
  };

  // Custom tooltip formatter to use INR
  const customTooltipFormatter = (value: RechartsValueType, name: RechartsNameType) => {
    let formattedValue;
    
    if (name === 'change') {
      formattedValue = `${typeof value === 'number' ? value.toFixed(1) : value}%`;
      return [formattedValue, 'Change'];
    }
    
    // For all revenue metrics, use INR format
    formattedValue = formatINR(toNumber(value));
    
    // Map name to more readable label
    const nameMap: {[key: string]: string} = {
      'barre': 'Barre Revenue',
      'cycle': 'Cycle Revenue',
      'total': 'Total Revenue',
      'revenue': 'Revenue',
      'average': 'Average'
    };
    
    return [formattedValue, nameMap[name as string] || name];
  };

  // Enhanced chart styles
  const chartProps = {
    margin: { top: 20, right: 30, left: 20, bottom: 60 },
    style: { filter: 'drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.15))' }
  };
  
  const gradientOffset = () => {
    const dataMax = Math.max(...monthlyTrendData.map(d => d.change));
    const dataMin = Math.min(...monthlyTrendData.map(d => d.change));
    
    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;
    
    return dataMax / (dataMax - dataMin);
  };

  // Animated metrics cards
  const metricsData = [
    {
      title: "Total Revenue",
      value: totalRevenue,
      change: `${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%`,
      trend: growthRate >= 0 ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : <ArrowDownRight className="h-4 w-4 text-red-500" />,
      icon: <IndianRupee className="h-5 w-5 text-primary" />,
      formatter: formatINR
    },
    {
      title: "Barre Revenue",
      value: barreRevenue,
      change: `${((barreRevenue / totalRevenue) * 100).toFixed(1)}% of total`,
      trend: <BarChart3 className="h-4 w-4 text-barre" />,
      icon: <IndianRupee className="h-5 w-5 text-barre" />,
      formatter: formatINR
    },
    {
      title: "Cycle Revenue",
      value: cycleRevenue,
      change: `${((cycleRevenue / totalRevenue) * 100).toFixed(1)}% of total`,
      trend: <LineChart className="h-4 w-4 text-cycle-dark" />,
      icon: <IndianRupee className="h-5 w-5 text-cycle-dark" />,
      formatter: formatINR
    },
    {
      title: "Revenue per Session",
      value: (totalBarreSessions + totalCycleSessions) > 0 ? 
        totalRevenue / (totalBarreSessions + totalCycleSessions) : 0,
      change: `${((avgRevenuePerBarreSession + avgRevenuePerCycleSession) / 2).toFixed(1)} avg`,
      trend: <TrendingUp className="h-4 w-4 text-blue-500" />,
      icon: <PieChart className="h-5 w-5 text-blue-500" />,
      formatter: formatINR
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsData.map((metric, index) => (
          <Card key={index} className="overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                  {metric.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    {metric.trend}
                  </div>
                  <div className="text-2xl font-bold animate-fade-up" style={{ animationDelay: `${index * 0.1 + 0.2}s` }}>
                    <AnimatedCounter 
                      value={metric.value} 
                      formatter={(val) => metric.formatter(val)}
                      animationDelay={index * 100} 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{metric.change}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="animate-fade-up overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" /> Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueByMonth}
                {...chartProps}
                onClick={(data) => handleChartClick(data.activePayload?.[0]?.payload, "Revenue Trends")}
              >
                <defs>
                  <linearGradient id="barreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={barreColor} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={barreColor} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="cycleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={cycleColor} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={cycleColor} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={totalColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={totalColor} stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60} 
                  tick={{ fontSize: 12, fill: '#888' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#888' }}
                  tickFormatter={(value) => `₹${Math.floor(value).toLocaleString()}`}
                />
                <Tooltip 
                  formatter={customTooltipFormatter}
                  contentStyle={{ borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="barre" 
                  name="Barre Revenue" 
                  stroke={barreColor} 
                  fill="url(#barreGradient)" 
                  activeDot={{ r: 8, strokeWidth: 0, fill: barreColor }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cycle" 
                  name="Cycle Revenue" 
                  stroke={cycleColor} 
                  fill="url(#cycleGradient)"
                  activeDot={{ r: 8, strokeWidth: 0, fill: cycleColor }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  name="Total Revenue" 
                  stroke={totalColor} 
                  fill="url(#totalGradient)"
                  activeDot={{ r: 8, strokeWidth: 0, fill: totalColor }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-up overflow-hidden" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" /> Monthly Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={monthlyTrendData}
                {...chartProps}
                onClick={(data) => handleChartClick(data.activePayload?.[0]?.payload, "Monthly Growth")}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={totalColor} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={totalColor} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={gradientOffset()} stopColor="green" stopOpacity={0.8}/>
                    <stop offset={gradientOffset()} stopColor="red" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60} 
                  tick={{ fontSize: 12, fill: '#888' }}
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  tick={{ fontSize: 12, fill: '#888' }}
                  tickFormatter={(value) => `₹${Math.floor(value).toLocaleString()}`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fontSize: 12, fill: '#888' }}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <Tooltip formatter={customTooltipFormatter} />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="revenue" 
                  name="Revenue" 
                  fill="url(#revenueGradient)" 
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="change" 
                  name="% Change" 
                  stroke={changeColor} 
                  strokeWidth={2}
                  dot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0, fill: changeColor }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IndianRupee className="mr-2 h-5 w-5" /> Financial Performance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead isFirstColumn>Period</TableHead>
                  <TableHead>Barre Revenue</TableHead>
                  <TableHead>Cycle Revenue</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>Customers</TableHead>
                  <TableHead>Avg. Revenue/Customer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell isFirstColumn className="font-medium">{item.month}</TableCell>
                    <TableCell isCurrency>{formatINR(item.barreRevenue)}</TableCell>
                    <TableCell isCurrency>{formatINR(item.cycleRevenue)}</TableCell>
                    <TableCell isCurrency>{formatINR(item.totalRevenue)}</TableCell>
                    <TableCell>{item.totalCustomers}</TableCell>
                    <TableCell isAverage>{formatINR(item.revenuePerCustomer)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                {/* Quarterly Subtotals */}
                {quarterlyTotals.map((quarter: any, index: number) => (
                  <TableRow key={`quarter-${index}`} isSubtotal>
                    <TableCell isFirstColumn className="font-medium">{quarter.quarter}</TableCell>
                    <TableCell isCurrency>{formatINR(quarter.barreRevenue)}</TableCell>
                    <TableCell isCurrency>{formatINR(quarter.cycleRevenue)}</TableCell>
                    <TableCell isCurrency>{formatINR(quarter.totalRevenue)}</TableCell>
                    <TableCell>{quarter.totalCustomers}</TableCell>
                    <TableCell isAverage>{formatINR(quarter.revenuePerCustomer)}</TableCell>
                  </TableRow>
                ))}
                {/* Grand Total */}
                <TableRow isTotal>
                  <TableCell isFirstColumn className="font-bold">Total</TableCell>
                  <TableCell isCurrency>{formatINR(tableTotals.barreRevenue)}</TableCell>
                  <TableCell isCurrency>{formatINR(tableTotals.cycleRevenue)}</TableCell>
                  <TableCell isCurrency>{formatINR(tableTotals.totalRevenue)}</TableCell>
                  <TableCell>{tableTotals.totalCustomers}</TableCell>
                  <TableCell isAverage>{formatINR(tableTotals.revenuePerCustomer)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="animate-fade-up overflow-hidden" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" /> Revenue per Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenuePerCustomer}
                {...chartProps}
                onClick={(data) => handleChartClick(data.activePayload?.[0]?.payload, "Revenue per Customer")}
              >
                <defs>
                  <linearGradient id="barreCustomerGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="5%" stopColor={barreColor} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={barreColor} stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="cycleCustomerGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="5%" stopColor={cycleColor} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={cycleColor} stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="averageCustomerGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="5%" stopColor={totalColor} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={totalColor} stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60} 
                  tick={{ fontSize: 12, fill: '#888' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#888' }}
                  tickFormatter={(value) => `₹${Math.floor(value).toLocaleString()}`}
                />
                <Tooltip formatter={customTooltipFormatter} />
                <Legend />
                <Bar 
                  dataKey="barre" 
                  name="Barre Rev/Customer" 
                  fill="url(#barreCustomerGradient)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
                <Bar 
                  dataKey="cycle" 
                  name="Cycle Rev/Customer" 
                  fill="url(#cycleCustomerGradient)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  animationEasing="ease-out"
                  animationBegin={200}
                />
                <Bar 
                  dataKey="average" 
                  name="Avg Rev/Customer" 
                  fill="url(#averageCustomerGradient)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  animationEasing="ease-out"
                  animationBegin={400}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-up overflow-hidden" style={{ animationDelay: "0.4s" }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="mr-2 h-5 w-5" /> Revenue per Session
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenuePerSession}
                {...chartProps}
                onClick={(data) => handleChartClick(data.activePayload?.[0]?.payload, "Revenue per Session")}
              >
                <defs>
                  <linearGradient id="barreSessionGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="5%" stopColor={barreColor} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={barreColor} stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="cycleSessionGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="5%" stopColor={cycleColor} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={cycleColor} stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="averageSessionGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="5%" stopColor={totalColor} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={totalColor} stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60} 
                  tick={{ fontSize: 12, fill: '#888' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#888' }}
                  tickFormatter={(value) => `₹${Math.floor(value).toLocaleString()}`}
                />
                <Tooltip formatter={customTooltipFormatter} />
                <Legend />
                <Bar 
                  dataKey="barre" 
                  name="Barre Rev/Session" 
                  fill="url(#barreSessionGradient)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
                <Bar 
                  dataKey="cycle" 
                  name="Cycle Rev/Session" 
                  fill="url(#cycleSessionGradient)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  animationEasing="ease-out"
                  animationBegin={200}
                />
                <Bar 
                  dataKey="average" 
                  name="Avg Rev/Session" 
                  fill="url(#averageSessionGradient)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  animationEasing="ease-out"
                  animationBegin={400}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialsView;
