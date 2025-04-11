
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData, RechartsValueType, RechartsNameType } from "@/types/fitnessTypes";
import { AreaChart, BarChart, ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from "@/components/ui/table";
import { IndianRupee, ArrowUpRight, ArrowDownRight, TrendingUp, BarChart3, LineChart, PieChart } from "lucide-react";

interface FinancialsViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const FinancialsView: React.FC<FinancialsViewProps> = ({ data, selectedMonths, location }) => {
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

  const barreColor = "#FF6F91";
  const cycleColor = "#9FD8CB";
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

  // Animated metrics cards
  const metricsData = [
    {
      title: "Total Revenue",
      value: `₹${Math.floor(totalRevenue).toLocaleString()}`,
      change: `${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%`,
      trend: growthRate >= 0 ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : <ArrowDownRight className="h-4 w-4 text-red-500" />,
      icon: <IndianRupee className="h-5 w-5 text-primary" />
    },
    {
      title: "Barre Revenue",
      value: `₹${Math.floor(barreRevenue).toLocaleString()}`,
      change: `${((barreRevenue / totalRevenue) * 100).toFixed(1)}% of total`,
      trend: <BarChart3 className="h-4 w-4 text-barre" />,
      icon: <IndianRupee className="h-5 w-5 text-barre" />
    },
    {
      title: "Cycle Revenue",
      value: `₹${Math.floor(cycleRevenue).toLocaleString()}`,
      change: `${((cycleRevenue / totalRevenue) * 100).toFixed(1)}% of total`,
      trend: <LineChart className="h-4 w-4 text-cycle-dark" />,
      icon: <IndianRupee className="h-5 w-5 text-cycle-dark" />
    },
    {
      title: "Revenue per Session",
      value: `₹${Math.floor((totalBarreSessions + totalCycleSessions) > 0 ? 
        totalRevenue / (totalBarreSessions + totalCycleSessions) : 0).toLocaleString()}`,
      change: `${((avgRevenuePerBarreSession + avgRevenuePerCycleSession) / 2).toFixed(1)} avg`,
      trend: <TrendingUp className="h-4 w-4 text-blue-500" />,
      icon: <PieChart className="h-5 w-5 text-blue-500" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsData.map((metric, index) => (
          <Card key={index} className="overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
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
                  <div className="text-2xl font-bold animate-fade-up" style={{ animationDelay: `${index * 0.1 + 0.2}s` }}>
                    {metric.value}
                  </div>
                  <p className="text-xs text-muted-foreground">{metric.change}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="animate-fade-up">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" /> Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueByMonth}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip formatter={(value: RechartsValueType) => {
                  return [`₹${typeof value === 'number' ? Math.floor(value).toLocaleString() : value}`, ""];
                }} />
                <Legend />
                <Area type="monotone" dataKey="barre" name="Barre Revenue" stroke={barreColor} fill={barreColor} fillOpacity={0.6} />
                <Area type="monotone" dataKey="cycle" name="Cycle Revenue" stroke={cycleColor} fill={cycleColor} fillOpacity={0.6} />
                <Area type="monotone" dataKey="total" name="Total Revenue" stroke={totalColor} fill={totalColor} fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" /> Monthly Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={monthlyTrendData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: RechartsValueType, name: RechartsNameType) => {
                    if (name === 'revenue') {
                      return [`₹${typeof value === 'number' ? Math.floor(value).toLocaleString() : value}`, 'Revenue'];
                    }
                    return [`${typeof value === 'number' ? value.toFixed(1) : value}%`, 'Change'];
                  }} 
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill={totalColor} />
                <Line yAxisId="right" type="monotone" dataKey="change" name="% Change" stroke={changeColor} />
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
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Barre Revenue</TableHead>
                  <TableHead className="text-right">Cycle Revenue</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                  <TableHead className="text-right">Customers</TableHead>
                  <TableHead className="text-right">Avg. Revenue/Customer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.month}</TableCell>
                    <TableCell isNumeric isCurrency>₹{Math.floor(item.barreRevenue).toLocaleString()}</TableCell>
                    <TableCell isNumeric isCurrency>₹{Math.floor(item.cycleRevenue).toLocaleString()}</TableCell>
                    <TableCell isNumeric isCurrency>₹{Math.floor(item.totalRevenue).toLocaleString()}</TableCell>
                    <TableCell isNumeric>{item.totalCustomers}</TableCell>
                    <TableCell isNumeric isAverage>₹{item.revenuePerCustomer.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                {/* Quarterly Subtotals */}
                {quarterlyTotals.map((quarter: any, index: number) => (
                  <TableRow key={`quarter-${index}`} isSubtotal>
                    <TableCell className="font-medium">{quarter.quarter}</TableCell>
                    <TableCell isNumeric isCurrency>₹{Math.floor(quarter.barreRevenue).toLocaleString()}</TableCell>
                    <TableCell isNumeric isCurrency>₹{Math.floor(quarter.cycleRevenue).toLocaleString()}</TableCell>
                    <TableCell isNumeric isCurrency>₹{Math.floor(quarter.totalRevenue).toLocaleString()}</TableCell>
                    <TableCell isNumeric>{quarter.totalCustomers}</TableCell>
                    <TableCell isNumeric isAverage>₹{quarter.revenuePerCustomer.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
                {/* Grand Total */}
                <TableRow isTotal>
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell isNumeric isCurrency>₹{Math.floor(tableTotals.barreRevenue).toLocaleString()}</TableCell>
                  <TableCell isNumeric isCurrency>₹{Math.floor(tableTotals.cycleRevenue).toLocaleString()}</TableCell>
                  <TableCell isNumeric isCurrency>₹{Math.floor(tableTotals.totalRevenue).toLocaleString()}</TableCell>
                  <TableCell isNumeric>{tableTotals.totalCustomers}</TableCell>
                  <TableCell isNumeric isAverage>₹{tableTotals.revenuePerCustomer.toFixed(1)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" /> Revenue per Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenuePerCustomer}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip formatter={(value: RechartsValueType) => {
                  return [`₹${typeof value === 'number' ? value.toFixed(1) : value}`, ""];
                }} />
                <Legend />
                <Bar dataKey="barre" name="Barre Rev/Customer" fill={barreColor} />
                <Bar dataKey="cycle" name="Cycle Rev/Customer" fill={cycleColor} />
                <Bar dataKey="average" name="Avg Rev/Customer" fill={totalColor} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="mr-2 h-5 w-5" /> Revenue per Session
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenuePerSession}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip formatter={(value: RechartsValueType) => {
                  return [`₹${typeof value === 'number' ? value.toFixed(1) : value}`, ""];
                }} />
                <Legend />
                <Bar dataKey="barre" name="Barre Rev/Session" fill={barreColor} />
                <Bar dataKey="cycle" name="Cycle Rev/Session" fill={cycleColor} />
                <Bar dataKey="average" name="Avg Rev/Session" fill={totalColor} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialsView;
