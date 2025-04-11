
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData, RechartsValueType } from "@/types/fitnessTypes";
import { BarChart, LineChart, AreaChart, PieChart, ComposedChart, Bar, Line, Area, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface OverviewViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const OverviewView: React.FC<OverviewViewProps> = ({ data, selectedMonths, location }) => {
  // Filter data based on selected months and location
  const filteredStats = data.monthlyStats.filter(stat => 
    (selectedMonths.length === 0 || selectedMonths.includes(stat.monthYear))
  );

  const filteredRawData = data.rawData.filter(record => 
    (selectedMonths.length === 0 || selectedMonths.includes(record["Month Year"])) &&
    (location === "" || record.Location === location)
  );

  // For session comparison chart
  const sessionComparisonData = filteredStats.map(stat => ({
    name: stat.monthYear,
    barre: stat.totalBarreSessions,
    cycle: stat.totalCycleSessions
  }));

  // For customer comparison chart
  const customerComparisonData = filteredStats.map(stat => ({
    name: stat.monthYear,
    barre: stat.totalBarreCustomers,
    cycle: stat.totalCycleCustomers
  }));

  // For revenue comparison chart
  const revenueComparisonData = filteredStats.map(stat => ({
    name: stat.monthYear,
    barre: stat.totalBarrePaid,
    cycle: stat.totalCyclePaid
  }));

  // For retention/conversion chart
  const retentionData = filteredStats.map(stat => ({
    name: stat.monthYear,
    retained: stat.totalRetained,
    converted: stat.totalConverted
  }));

  // For class size comparison
  const classSizeData = filteredStats.map(stat => ({
    name: stat.monthYear,
    barre: parseFloat(stat.avgBarreClassSize),
    cycle: parseFloat(stat.avgCycleClassSize)
  }));

  // Calculate overall distribution for pie chart
  const totalBarreSessions = filteredStats.reduce((sum, stat) => sum + stat.totalBarreSessions, 0);
  const totalCycleSessions = filteredStats.reduce((sum, stat) => sum + stat.totalCycleSessions, 0);
  
  const distributionData = [
    { name: 'Barre', value: totalBarreSessions },
    { name: 'Cycle', value: totalCycleSessions }
  ];

  const barreColor = "#FF6F91";
  const cycleColor = "#9FD8CB";
  const colors = [barreColor, cycleColor];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalBarreSessions + totalCycleSessions}
            </div>
            <div className="mt-1 flex items-center">
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-barre">{totalBarreSessions} Barre</span> / <span className="font-semibold text-cycle-dark">{totalCycleSessions} Cycle</span>
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredStats.reduce((sum, stat) => sum + stat.totalBarreCustomers + stat.totalCycleCustomers, 0)}
            </div>
            <div className="mt-1 flex items-center">
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-barre">
                  {filteredStats.reduce((sum, stat) => sum + stat.totalBarreCustomers, 0)} Barre
                </span> / 
                <span className="font-semibold text-cycle-dark">
                  {filteredStats.reduce((sum, stat) => sum + stat.totalCycleCustomers, 0)} Cycle
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(filteredStats.reduce((sum, stat) => sum + stat.totalBarrePaid + stat.totalCyclePaid, 0)).toLocaleString()}
            </div>
            <div className="mt-1 flex items-center">
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-barre">
                  ₹{(filteredStats.reduce((sum, stat) => sum + stat.totalBarrePaid, 0)).toLocaleString()} Barre
                </span> / 
                <span className="font-semibold text-cycle-dark">
                  ₹{(filteredStats.reduce((sum, stat) => sum + stat.totalCyclePaid, 0)).toLocaleString()} Cycle
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Class Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredStats.length > 0 ? 
                ((
                  filteredStats.reduce((sum, stat) => sum + parseFloat(stat.avgBarreClassSize) * stat.totalBarreSessions, 0) +
                  filteredStats.reduce((sum, stat) => sum + parseFloat(stat.avgCycleClassSize) * stat.totalCycleSessions, 0)
                ) / (totalBarreSessions + totalCycleSessions)).toFixed(1) : "0"}
            </div>
            <div className="mt-1 flex items-center">
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-barre">
                  {filteredStats.length > 0 ? 
                    (filteredStats.reduce((sum, stat) => sum + parseFloat(stat.avgBarreClassSize) * stat.totalBarreSessions, 0) / 
                    Math.max(1, totalBarreSessions)).toFixed(1) : "0"} Barre
                </span> / 
                <span className="font-semibold text-cycle-dark">
                  {filteredStats.length > 0 ? 
                    (filteredStats.reduce((sum, stat) => sum + parseFloat(stat.avgCycleClassSize) * stat.totalCycleSessions, 0) / 
                    Math.max(1, totalCycleSessions)).toFixed(1) : "0"} Cycle
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="animate-fade-up">
          <CardHeader>
            <CardTitle>Sessions Comparison</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sessionComparisonData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="barre" name="Barre Sessions" fill={barreColor} />
                <Bar dataKey="cycle" name="Cycle Sessions" fill={cycleColor} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle>Class Distribution</CardTitle>
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
        <Card className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={revenueComparisonData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip formatter={(value: RechartsValueType) => {
                  return [`₹${typeof value === 'number' ? value.toLocaleString() : value}`, ""];
                }} />
                <Legend />
                <Area type="monotone" dataKey="barre" name="Barre Revenue" fill={barreColor} stroke={barreColor} fillOpacity={0.5} />
                <Area type="monotone" dataKey="cycle" name="Cycle Revenue" fill={cycleColor} stroke={cycleColor} fillOpacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <CardTitle>Average Class Size</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={classSizeData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="barre" name="Barre Avg Size" stroke={barreColor} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="cycle" name="Cycle Avg Size" stroke={cycleColor} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewView;
