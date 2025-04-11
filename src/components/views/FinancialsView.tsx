
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData } from "@/types/fitnessTypes";
import { AreaChart, BarChart, ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              For {selectedMonths.length > 0 ? selectedMonths.length : filteredStats.length} months
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Barre Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{barreRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {((barreRevenue / totalRevenue) * 100).toFixed(1)}% of total
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cycle Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{cycleRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {((cycleRevenue / totalRevenue) * 100).toFixed(1)}% of total
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue per Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{((totalBarreSessions + totalCycleSessions) > 0 
                ? totalRevenue / (totalBarreSessions + totalCycleSessions)
                : 0
              ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="mt-1 text-xs">
              <span className="text-barre">₹{avgRevenuePerBarreSession.toLocaleString(undefined, { maximumFractionDigits: 0 })} Barre</span> / 
              <span className="text-cycle-dark"> ₹{avgRevenuePerCycleSession.toLocaleString(undefined, { maximumFractionDigits: 0 })} Cycle</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
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
                <Tooltip formatter={(value) => [`₹${parseInt(value).toLocaleString()}`, ""]} />
                <Legend />
                <Area type="monotone" dataKey="barre" name="Barre Revenue" stroke={barreColor} fill={barreColor} fillOpacity={0.6} />
                <Area type="monotone" dataKey="cycle" name="Cycle Revenue" stroke={cycleColor} fill={cycleColor} fillOpacity={0.6} />
                <Area type="monotone" dataKey="total" name="Total Revenue" stroke={totalColor} fill={totalColor} fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Growth</CardTitle>
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
                  formatter={(value, name) => [
                    name === 'revenue' ? `₹${parseInt(value).toLocaleString()}` : `${value.toFixed(1)}%`, 
                    name === 'revenue' ? 'Revenue' : 'Change'
                  ]} 
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill={totalColor} />
                <Line yAxisId="right" type="monotone" dataKey="change" name="% Change" stroke={changeColor} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue per Customer</CardTitle>
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
                <Tooltip formatter={(value) => [`₹${value.toFixed(0)}`, ""]} />
                <Legend />
                <Bar dataKey="barre" name="Barre Rev/Customer" fill={barreColor} />
                <Bar dataKey="cycle" name="Cycle Rev/Customer" fill={cycleColor} />
                <Bar dataKey="average" name="Avg Rev/Customer" fill={totalColor} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue per Session</CardTitle>
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
                <Tooltip formatter={(value) => [`₹${value.toFixed(0)}`, ""]} />
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
