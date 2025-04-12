
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData, RechartsValueType } from "@/types/fitnessTypes";
import { BarChart, LineChart, AreaChart, PieChart, ComposedChart, Bar, Line, Area, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useToast } from "@/components/ui/use-toast";
import { IndianRupee, Users, Calendar, TrendingUp } from "lucide-react";
import MetricsCard from "../dashboard/MetricsCard";
import { formatINR } from "@/lib/formatters";

interface OverviewViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const OverviewView: React.FC<OverviewViewProps> = ({ data, selectedMonths, location }) => {
  const { toast } = useToast();
  const [showCycleMetrics, setShowCycleMetrics] = useState(true);
  
  // Check if we should show cycle metrics based on location
  useEffect(() => {
    setShowCycleMetrics(location === "" || location === "Supreme HQ");
  }, [location]);

  // Filter data based on selected months and location
  const filteredStats = data.monthlyStats.filter(stat => 
    (selectedMonths.length === 0 || selectedMonths.includes(stat.monthYear))
  );

  const filteredRawData = data.rawData.filter(record => 
    (selectedMonths.length === 0 || selectedMonths.includes(record["Month Year"])) &&
    (location === "" || record.Location === location)
  );

  // For session comparison chart - conditionally include cycle data
  const sessionComparisonData = filteredStats.map(stat => {
    const data: any = {
      name: stat.monthYear,
      barre: stat.totalBarreSessions,
    };
    
    if (showCycleMetrics) {
      data.cycle = stat.totalCycleSessions;
    }
    
    return data;
  });

  // For customer comparison chart - conditionally include cycle data
  const customerComparisonData = filteredStats.map(stat => {
    const data: any = {
      name: stat.monthYear,
      barre: stat.totalBarreCustomers,
    };
    
    if (showCycleMetrics) {
      data.cycle = stat.totalCycleCustomers;
    }
    
    return data;
  });

  // For revenue comparison chart - conditionally include cycle data
  const revenueComparisonData = filteredStats.map(stat => {
    const data: any = {
      name: stat.monthYear,
      barre: stat.totalBarrePaid,
    };
    
    if (showCycleMetrics) {
      data.cycle = stat.totalCyclePaid;
    }
    
    data.total = showCycleMetrics ? 
      stat.totalBarrePaid + stat.totalCyclePaid : 
      stat.totalBarrePaid;
    
    return data;
  });

  // For class size comparison - conditionally include cycle data
  const classSizeData = filteredStats.map(stat => {
    const data: any = {
      name: stat.monthYear,
      barre: parseFloat(stat.avgBarreClassSize),
    };
    
    if (showCycleMetrics) {
      data.cycle = parseFloat(stat.avgCycleClassSize);
    }
    
    return data;
  });

  // Calculate metrics based on filters
  const totalBarreSessions = filteredStats.reduce((sum, stat) => sum + stat.totalBarreSessions, 0);
  const totalCycleSessions = showCycleMetrics ? 
    filteredStats.reduce((sum, stat) => sum + stat.totalCycleSessions, 0) : 0;
  
  const totalBarreCustomers = filteredStats.reduce((sum, stat) => sum + stat.totalBarreCustomers, 0);
  const totalCycleCustomers = showCycleMetrics ? 
    filteredStats.reduce((sum, stat) => sum + stat.totalCycleCustomers, 0) : 0;
  
  const totalBarreRevenue = filteredStats.reduce((sum, stat) => sum + stat.totalBarrePaid, 0);
  const totalCycleRevenue = showCycleMetrics ? 
    filteredStats.reduce((sum, stat) => sum + stat.totalCyclePaid, 0) : 0;
  
  const avgBarreClassSize = totalBarreSessions > 0 ? 
    (totalBarreCustomers / totalBarreSessions).toFixed(1) : "0";
  
  const avgCycleClassSize = showCycleMetrics && totalCycleSessions > 0 ? 
    (totalCycleCustomers / totalCycleSessions).toFixed(1) : "0";
  
  // Calculate overall distribution for pie chart - conditionally include cycle data
  const distributionData = showCycleMetrics ? 
    [
      { name: 'Barre', value: totalBarreSessions },
      { name: 'Cycle', value: totalCycleSessions }
    ] : 
    [
      { name: 'Barre', value: totalBarreSessions }
    ];

  const barreColor = "#845EC2"; // Updated to match the theme
  const cycleColor = "#00C2A8";
  const colors = [barreColor, cycleColor];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Sessions"
          value={totalBarreSessions + totalCycleSessions}
          icon={<Calendar className="h-5 w-5 text-primary" />}
          details={
            <>
              <span className="font-semibold text-barre">{totalBarreSessions} Barre</span>
              {showCycleMetrics && (
                <> / <span className="font-semibold text-cycle-dark">{totalCycleSessions} Cycle</span></>
              )}
            </>
          }
        />
        
        <MetricsCard
          title="Total Customers"
          value={totalBarreCustomers + totalCycleCustomers}
          icon={<Users className="h-5 w-5 text-primary" />}
          details={
            <>
              <span className="font-semibold text-barre">{totalBarreCustomers} Barre</span>
              {showCycleMetrics && (
                <> / <span className="font-semibold text-cycle-dark">{totalCycleCustomers} Cycle</span></>
              )}
            </>
          }
        />
        
        <MetricsCard
          title="Total Revenue"
          value={formatINR(totalBarreRevenue + totalCycleRevenue)}
          icon={<IndianRupee className="h-5 w-5 text-primary" />}
          details={
            <>
              <span className="font-semibold text-barre">{formatINR(totalBarreRevenue)} Barre</span>
              {showCycleMetrics && (
                <> / <span className="font-semibold text-cycle-dark">{formatINR(totalCycleRevenue)} Cycle</span></>
              )}
            </>
          }
        />
        
        <MetricsCard
          title="Average Class Size"
          value={showCycleMetrics ? 
            ((parseFloat(avgBarreClassSize) + parseFloat(avgCycleClassSize)) / 2).toFixed(1) : 
            avgBarreClassSize
          }
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          details={
            <>
              <span className="font-semibold text-barre">{avgBarreClassSize} Barre</span>
              {showCycleMetrics && (
                <> / <span className="font-semibold text-cycle-dark">{avgCycleClassSize} Cycle</span></>
              )}
            </>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Sessions Comparison</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sessionComparisonData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="barre" name="Barre Sessions" fill={barreColor} />
                {showCycleMetrics && <Bar dataKey="cycle" name="Cycle Sessions" fill={cycleColor} />}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Class Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: RechartsValueType) => [`${value} sessions`, ""]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={revenueComparisonData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip formatter={(value: RechartsValueType) => {
                  return [formatINR(Number(value)), ""];
                }} />
                <Legend />
                <Area type="monotone" dataKey="barre" name="Barre Revenue" fill={barreColor} stroke={barreColor} fillOpacity={0.5} />
                {showCycleMetrics && <Area type="monotone" dataKey="cycle" name="Cycle Revenue" fill={cycleColor} stroke={cycleColor} fillOpacity={0.5} />}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Average Class Size</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={classSizeData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="barre" name="Barre Avg Size" stroke={barreColor} activeDot={{ r: 8 }} />
                {showCycleMetrics && <Line type="monotone" dataKey="cycle" name="Cycle Avg Size" stroke={cycleColor} activeDot={{ r: 8 }} />}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewView;
