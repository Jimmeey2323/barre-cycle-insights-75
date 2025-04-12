
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData } from "@/types/fitnessTypes";
import { LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface ClassesViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const ClassesView: React.FC<ClassesViewProps> = ({ data, selectedMonths, location }) => {
  // Filter data based on selected months and location
  const filteredStats = data.monthlyStats.filter(stat => 
    (selectedMonths.length === 0 || selectedMonths.includes(stat.monthYear))
  );

  const filteredRawData = data.rawData.filter(record => 
    (selectedMonths.length === 0 || selectedMonths.includes(record["Month Year"])) &&
    (location === "" || record.Location === location)
  );

  // Class attendance data
  const attendanceData = filteredStats.map(stat => ({
    name: stat.monthYear,
    barreAvg: typeof stat.avgBarreClassSize === 'string' ? parseFloat(stat.avgBarreClassSize) : stat.avgBarreClassSize,
    cycleAvg: typeof stat.avgCycleClassSize === 'string' ? parseFloat(stat.avgCycleClassSize) : stat.avgCycleClassSize
  }));

  // Empty vs non-empty classes
  const emptyVsNonEmptyBarre = filteredRawData.reduce(
    (acc, record) => {
      acc.empty += parseInt(String(record["Empty Barre Sessions"] || "0"));
      acc.nonEmpty += parseInt(String(record["Non-Empty Barre Sessions"] || "0"));
      return acc;
    },
    { empty: 0, nonEmpty: 0 }
  );

  const emptyVsNonEmptyCycle = filteredRawData.reduce(
    (acc, record) => {
      acc.empty += parseInt(String(record["Empty Cycle Sessions"] || "0"));
      acc.nonEmpty += parseInt(String(record["Non-Empty Cycle Sessions"] || "0"));
      return acc;
    },
    { empty: 0, nonEmpty: 0 }
  );

  const emptyVsNonEmptyBarreData = [
    { name: "Filled Classes", value: emptyVsNonEmptyBarre.nonEmpty },
    { name: "Empty Classes", value: emptyVsNonEmptyBarre.empty }
  ];

  const emptyVsNonEmptyCycleData = [
    { name: "Filled Classes", value: emptyVsNonEmptyCycle.nonEmpty },
    { name: "Empty Classes", value: emptyVsNonEmptyCycle.empty }
  ];

  // Sessions by month
  const sessionsByMonth = filteredStats.map(stat => ({
    name: stat.monthYear,
    barre: stat.totalBarreSessions,
    cycle: stat.totalCycleSessions
  }));

  // Class fill rate (non-empty sessions as % of total)
  const barreClassFillRate = filteredRawData.map(record => {
    const totalSessions = parseInt(String(record["Barre Sessions"] || "0"));
    const nonEmptySessions = parseInt(String(record["Non-Empty Barre Sessions"] || "0"));
    const fillRate = totalSessions > 0 ? (nonEmptySessions / totalSessions) * 100 : 0;
    
    return {
      name: record["Month Year"],
      fillRate: fillRate.toFixed(1)
    };
  });

  const aggregatedBarreFillRates = barreClassFillRate.reduce((acc: Record<string, any>, item) => {
    if (!acc[item.name]) {
      acc[item.name] = { 
        name: item.name, 
        totalSessions: 0, 
        nonEmptySessions: 0 
      };
    }
    
    const record = filteredRawData.find(r => r["Month Year"] === item.name);
    if (record) {
      acc[item.name].totalSessions += parseInt(String(record["Barre Sessions"] || "0"));
      acc[item.name].nonEmptySessions += parseInt(String(record["Non-Empty Barre Sessions"] || "0"));
    }
    
    return acc;
  }, {});

  const fillRateData = Object.values(aggregatedBarreFillRates).map((item: any) => ({
    name: item.name,
    barre: item.totalSessions > 0 ? (item.nonEmptySessions / item.totalSessions) * 100 : 0
  }));

  // Cycle class fill rate
  const cycleClassFillRate = filteredRawData.reduce((acc: Record<string, any>, record) => {
    const monthYear = record["Month Year"];
    if (!acc[monthYear]) {
      acc[monthYear] = { 
        totalSessions: 0, 
        nonEmptySessions: 0 
      };
    }
    
    acc[monthYear].totalSessions += parseInt(String(record["Cycle Sessions"] || "0"));
    acc[monthYear].nonEmptySessions += parseInt(String(record["Non-Empty Cycle Sessions"] || "0"));
    
    return acc;
  }, {});

  // Combine the fill rate data
  const combinedFillRateData = Object.keys(aggregatedBarreFillRates).map(month => {
    const barreRate = aggregatedBarreFillRates[month].totalSessions > 0 
      ? (aggregatedBarreFillRates[month].nonEmptySessions / aggregatedBarreFillRates[month].totalSessions) * 100
      : 0;
      
    const cycleRate = cycleClassFillRate[month]?.totalSessions > 0 
      ? (cycleClassFillRate[month].nonEmptySessions / cycleClassFillRate[month].totalSessions) * 100
      : 0;
      
    return {
      name: month,
      barre: parseFloat(barreRate.toFixed(1)),
      cycle: parseFloat(cycleRate.toFixed(1))
    };
  });

  // Sort by month/year
  combinedFillRateData.sort((a, b) => {
    // Parse "MMM-YYYY" format
    const [aMonth, aYear] = String(a.name).split('-');
    const [bMonth, bYear] = String(b.name).split('-');
    
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const yearComparison = Number(aYear) - Number(bYear);
    if (yearComparison !== 0) return yearComparison;
    
    return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
  });

  const barreColor = "#FF6F91";
  const cycleColor = "#9FD8CB";
  const emptyColor = "#E5E7EB";
  const filledColor = "#60A5FA";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Barre Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredRawData.reduce((sum, record) => sum + parseInt(record["Barre Sessions"] || "0"), 0)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {emptyVsNonEmptyBarre.nonEmpty} filled, {emptyVsNonEmptyBarre.empty} empty
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cycle Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredRawData.reduce((sum, record) => sum + parseInt(record["Cycle Sessions"] || "0"), 0)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {emptyVsNonEmptyCycle.nonEmpty} filled, {emptyVsNonEmptyCycle.empty} empty
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Class Size (Barre)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredStats.length > 0 ? 
                (filteredStats.reduce((sum, stat) => sum + parseFloat(stat.avgBarreClassSize), 0) / filteredStats.length).toFixed(1) 
                : "0"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              persons per class
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Class Size (Cycle)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredStats.length > 0 ? 
                (filteredStats.reduce((sum, stat) => sum + parseFloat(stat.avgCycleClassSize), 0) / filteredStats.length).toFixed(1) 
                : "0"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              persons per class
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Class Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={attendanceData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="barreAvg" name="Barre Avg Attendance" stroke={barreColor} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="cycleAvg" name="Cycle Avg Attendance" stroke={cycleColor} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class Fill Rate</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={combinedFillRateData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, ""]} />
                <Legend />
                <Line type="monotone" dataKey="barre" name="Barre Fill Rate" stroke={barreColor} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="cycle" name="Cycle Fill Rate" stroke={cycleColor} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Barre Classes (Filled vs Empty)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={emptyVsNonEmptyBarreData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill={filledColor} />
                  <Cell fill={emptyColor} />
                </Pie>
                <Tooltip formatter={(value) => [`${value} classes`, ""]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cycle Classes (Filled vs Empty)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={emptyVsNonEmptyCycleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill={filledColor} />
                  <Cell fill={emptyColor} />
                </Pie>
                <Tooltip formatter={(value) => [`${value} classes`, ""]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClassesView;
