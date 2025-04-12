import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData, RechartsValueType } from "@/types/fitnessTypes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, TrendingUp, IndianRupee, ActivitySquare, BadgeIndianRupee, Award } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface TeachersViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const TeachersView: React.FC<TeachersViewProps> = ({ data, selectedMonths, location }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter data based on selected months and location
  const filteredData = data.rawData.filter(record => 
    (selectedMonths.length === 0 || selectedMonths.includes(record["Month Year"])) &&
    (location === "" || record.Location === location)
  );

  // Further filter by search term
  const searchFilteredData = filteredData.filter(record => 
    record["Teacher Name"].toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by teacher
  const teacherData = searchFilteredData.reduce((acc: { [key: string]: any }, record) => {
    const teacherName = record["Teacher Name"];
    
    if (!acc[teacherName]) {
      acc[teacherName] = {
        name: teacherName,
        email: record["Teacher Email"],
        barreSessions: 0,
        cycleSessions: 0,
        barreCustomers: 0,
        cycleCustomers: 0,
        barrePaid: 0,
        cyclePaid: 0,
        avgBarreClassSize: 0,
        avgCycleClassSize: 0,
        retentionRate: 0,
        conversionRate: 0,
        totalSessions: 0
      };
    }
    
    acc[teacherName].barreSessions += parseInt(String(record["Barre Sessions"] || "0"));
    acc[teacherName].cycleSessions += parseInt(String(record["Cycle Sessions"] || "0"));
    acc[teacherName].barreCustomers += parseInt(String(record["Barre Customers"] || "0"));
    acc[teacherName].cycleCustomers += parseInt(String(record["Cycle Customers"] || "0"));
    acc[teacherName].barrePaid += parseFloat(record["Barre Paid"] || "0");
    acc[teacherName].cyclePaid += parseFloat(record["Cycle Paid"] || "0");
    acc[teacherName].totalSessions += parseInt(String(record["Total Sessions"] || "0"));
    
    // Calculate avg class size for non-empty sessions
    const nonEmptyBarreSessions = parseInt(String(record["Non-Empty Barre Sessions"] || "0"));
    const nonEmptyCycleSessions = parseInt(String(record["Non-Empty Cycle Sessions"] || "0"));
    
    if (nonEmptyBarreSessions > 0) {
      acc[teacherName].avgBarreClassSize = (acc[teacherName].barreCustomers / nonEmptyBarreSessions).toFixed(1);
    }
    
    if (nonEmptyCycleSessions > 0) {
      acc[teacherName].avgCycleClassSize = (acc[teacherName].cycleCustomers / nonEmptyCycleSessions).toFixed(1);
    }
    
    return acc;
  }, {});

  const teacherList = Object.values(teacherData).sort((a: any, b: any) => b.totalSessions - a.totalSessions);

  // Calculate totals
  const totals = {
    barreSessions: teacherList.reduce((sum: number, teacher: any) => sum + teacher.barreSessions, 0),
    cycleSessions: teacherList.reduce((sum: number, teacher: any) => sum + teacher.cycleSessions, 0),
    barreCustomers: teacherList.reduce((sum: number, teacher: any) => sum + teacher.barreCustomers, 0),
    cycleCustomers: teacherList.reduce((sum: number, teacher: any) => sum + teacher.cycleCustomers, 0),
    barrePaid: teacherList.reduce((sum: number, teacher: any) => sum + teacher.barrePaid, 0),
    cyclePaid: teacherList.reduce((sum: number, teacher: any) => sum + teacher.cyclePaid, 0),
    totalSessions: teacherList.reduce((sum: number, teacher: any) => sum + teacher.totalSessions, 0)
  };

  // Calculate averages
  const averages = {
    avgBarreClassSize: totals.barreCustomers / Math.max(1, totals.barreSessions),
    avgCycleClassSize: totals.cycleCustomers / Math.max(1, totals.cycleSessions)
  };

  // Top 10 teachers by sessions for chart
  const topTeacherSessions = teacherList.slice(0, 10).map((teacher: any) => ({
    name: teacher.name.split(' ')[0], // First name only to save space
    barre: teacher.barreSessions,
    cycle: teacher.cycleSessions
  }));

  // Top 10 teachers by revenue for chart
  const topTeacherRevenue = teacherList.slice(0, 10).map((teacher: any) => ({
    name: teacher.name.split(' ')[0], // First name only to save space
    barre: teacher.barrePaid,
    cycle: teacher.cyclePaid
  }));

  const barreColor = "#FF6F91";
  const cycleColor = "#9FD8CB";

  // Metrics for animated display
  const metrics = [
    { 
      title: "Total Teachers", 
      value: teacherList.length, 
      icon: <Users className="h-5 w-5 text-primary" />,
      change: "+5% from last month"
    },
    { 
      title: "Top Teacher Sessions", 
      value: teacherList.length > 0 ? teacherList[0].totalSessions : 0, 
      icon: <ActivitySquare className="h-5 w-5 text-secondary" />,
      change: teacherList.length > 0 ? `by ${teacherList[0].name.split(' ')[0]}` : ""
    },
    { 
      title: "Highest Revenue", 
      value: teacherList.length > 0 ? 
        `₹${Math.floor(teacherList[0].barrePaid + teacherList[0].cyclePaid).toLocaleString()}` : "₹0",
      icon: <BadgeIndianRupee className="h-5 w-5 text-yellow-500" />,
      change: teacherList.length > 0 ? `by ${teacherList[0].name.split(' ')[0]}` : ""
    },
    { 
      title: "Avg Class Size", 
      value: ((averages.avgBarreClassSize + averages.avgCycleClassSize) / 2).toFixed(1),
      icon: <Award className="h-5 w-5 text-barre" />,
      change: "across all teachers"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Teacher Performance</h2>
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Animated Metrics Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="animate-fade-in overflow-hidden" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <h3 className="text-2xl font-bold mt-1 animate-fade-up" style={{ animationDelay: `${index * 0.1 + 0.2}s` }}>
                    {metric.value}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{metric.change}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-2">
                  {metric.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="animate-fade-up">
          <CardHeader>
            <CardTitle>Top Teachers by Sessions</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topTeacherSessions}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
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
            <CardTitle>Top Teachers by Revenue</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topTeacherRevenue}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(value: RechartsValueType) => {
                  return [`₹${typeof value === 'number' ? value.toLocaleString() : value}`, ""];
                }} />
                <Legend />
                <Bar dataKey="barre" name="Barre Revenue" fill={barreColor} />
                <Bar dataKey="cycle" name="Cycle Revenue" fill={cycleColor} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" /> Teacher Performance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead className="text-right">Barre Sessions</TableHead>
                  <TableHead className="text-right">Cycle Sessions</TableHead>
                  <TableHead className="text-right">Barre Revenue</TableHead>
                  <TableHead className="text-right">Cycle Revenue</TableHead>
                  <TableHead className="text-right">Avg Class Size (Barre)</TableHead>
                  <TableHead className="text-right">Avg Class Size (Cycle)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacherList.map((teacher: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell isNumeric>{teacher.barreSessions}</TableCell>
                    <TableCell isNumeric>{teacher.cycleSessions}</TableCell>
                    <TableCell isNumeric isCurrency>₹{Math.floor(teacher.barrePaid).toLocaleString()}</TableCell>
                    <TableCell isNumeric isCurrency>₹{Math.floor(teacher.cyclePaid).toLocaleString()}</TableCell>
                    <TableCell isNumeric isAverage>{teacher.avgBarreClassSize}</TableCell>
                    <TableCell isNumeric isAverage>{teacher.avgCycleClassSize}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow isSubtotal>
                  <TableCell className="font-semibold">Subtotal</TableCell>
                  <TableCell isNumeric>{totals.barreSessions}</TableCell>
                  <TableCell isNumeric>{totals.cycleSessions}</TableCell>
                  <TableCell isNumeric isCurrency>₹{Math.floor(totals.barrePaid).toLocaleString()}</TableCell>
                  <TableCell isNumeric isCurrency>₹{Math.floor(totals.cyclePaid).toLocaleString()}</TableCell>
                  <TableCell isNumeric isAverage>{averages.avgBarreClassSize.toFixed(1)}</TableCell>
                  <TableCell isNumeric isAverage>{averages.avgCycleClassSize.toFixed(1)}</TableCell>
                </TableRow>
                <TableRow isTotal>
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell isNumeric colSpan={2}>{totals.totalSessions} Sessions</TableCell>
                  <TableCell isNumeric isCurrency colSpan={2}>₹{Math.floor(totals.barrePaid + totals.cyclePaid).toLocaleString()}</TableCell>
                  <TableCell isNumeric isAverage colSpan={2}>
                    {((averages.avgBarreClassSize + averages.avgCycleClassSize) / 2).toFixed(1)} Avg Class Size
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeachersView;
