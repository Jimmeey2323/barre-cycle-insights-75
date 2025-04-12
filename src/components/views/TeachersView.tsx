
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData, RechartsValueType } from "@/types/fitnessTypes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, TrendingUp, IndianRupee, BadgeIndianRupee, Award, ActivityIcon } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface TeachersViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const TeachersView: React.FC<TeachersViewProps> = ({ data, selectedMonths, location }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Filter data based on selected months and location
  const filteredData = data.rawData.filter(record => 
    (selectedMonths.length === 0 || selectedMonths.includes(String(record["Month Year"]))) &&
    (location === "" || location === "all" || record.Location === location)
  );

  // Further filter by search term
  const searchFilteredData = filteredData.filter(record => 
    String(record["Teacher Name"]).toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  // Group by teacher
  const teacherData = searchFilteredData.reduce((acc: { [key: string]: any }, record) => {
    const teacherName = String(record["Teacher Name"]);
    
    if (!acc[teacherName]) {
      acc[teacherName] = {
        name: teacherName,
        email: String(record["Teacher Email"]),
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
    acc[teacherName].barrePaid += parseInt(String(record["Barre Paid"] || "0"));
    acc[teacherName].cyclePaid += parseInt(String(record["Cycle Paid"] || "0"));
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

  // Revenue over time data
  const revenueByTeacher = teacherList.slice(0, 5).map((teacher: any) => ({
    name: teacher.name.split(' ')[0],
    revenue: teacher.barrePaid + teacher.cyclePaid,
    barreRevenue: teacher.barrePaid,
    cycleRevenue: teacher.cyclePaid
  }));

  const barreColor = "#845EC2"; // Purple for barre
  const cycleColor = "#00C2A8"; // Teal for cycle

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
      icon: <ActivityIcon className="h-5 w-5 text-barre" />,
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
      icon: <Award className="h-5 w-5 text-cycle" />,
      change: "across all teachers"
    }
  ];

  const COLORS = ['#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F'];

  // For pie chart
  const pieData = teacherList.slice(0, 5).map((teacher: any, index) => ({
    name: teacher.name.split(' ')[0],
    value: teacher.totalSessions,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold font-heading bg-gradient-to-r from-barre to-cycle bg-clip-text text-transparent">
          Teacher Performance
        </h2>
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            className="pl-8 bg-background/70"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Animated Metrics Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="animate-fade-in premium-card overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <h3 className="text-2xl font-bold mt-1 animate-fade-up bg-gradient-to-r from-primary to-barre bg-clip-text text-transparent" style={{ animationDelay: `${index * 0.1 + 0.2}s` }}>
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="animate-fade-in premium-card xl:col-span-2 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ActivityIcon className="h-5 w-5 mr-2 text-barre" />
              Top Teachers by Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topTeacherSessions}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'var(--foreground)',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                />
                <Legend iconType="circle" iconSize={8} />
                <Bar 
                  dataKey="barre" 
                  name="Barre Sessions" 
                  fill={barreColor}
                  radius={[0, 4, 4, 0]}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
                <Bar 
                  dataKey="cycle" 
                  name="Cycle Sessions" 
                  fill={cycleColor}
                  radius={[0, 4, 4, 0]}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  animationBegin={300}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-up premium-card overflow-hidden transform transition-all duration-300 hover:shadow-xl" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BadgeIndianRupee className="h-5 w-5 mr-2 text-cycle" />
              Revenue Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1500}
                  animationEasing="ease-out"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: RechartsValueType) => {
                    return [`${typeof value === 'number' ? value.toLocaleString() : value} sessions`, ""];
                  }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'var(--foreground)',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="animate-fade-up premium-card overflow-hidden transform transition-all duration-300 hover:shadow-xl" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <IndianRupee className="h-5 w-5 mr-2 text-barre" />
              Top Teachers by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topTeacherRevenue}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: RechartsValueType) => {
                    return [`₹${typeof value === 'number' ? value.toLocaleString() : value}`, ""];
                  }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'var(--foreground)',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                />
                <Legend iconType="circle" iconSize={8} />
                <Bar 
                  dataKey="barre" 
                  name="Barre Revenue" 
                  fill={barreColor}
                  radius={[0, 4, 4, 0]}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
                <Bar 
                  dataKey="cycle" 
                  name="Cycle Revenue" 
                  fill={cycleColor}
                  radius={[0, 4, 4, 0]}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  animationBegin={300}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-up premium-card overflow-hidden transform transition-all duration-300 hover:shadow-xl" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-cycle" />
              Revenue Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueByTeacher}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: RechartsValueType) => {
                    return [`₹${typeof value === 'number' ? value.toLocaleString() : value}`, ""];
                  }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'var(--foreground)',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                  }}
                  cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                />
                <Legend iconType="circle" iconSize={8} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Total Revenue" 
                  stroke="#FFD700"
                  strokeWidth={3}
                  dot={{ fill: '#FFD700', r: 6, strokeWidth: 0 }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
                <Line 
                  type="monotone" 
                  dataKey="barreRevenue" 
                  name="Barre Revenue" 
                  stroke={barreColor}
                  strokeWidth={2}
                  dot={{ fill: barreColor, r: 5, strokeWidth: 0 }}
                  activeDot={{ r: 7, strokeWidth: 0 }}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  animationBegin={300}
                />
                <Line 
                  type="monotone" 
                  dataKey="cycleRevenue" 
                  name="Cycle Revenue" 
                  stroke={cycleColor}
                  strokeWidth={2}
                  dot={{ fill: cycleColor, r: 5, strokeWidth: 0 }}
                  activeDot={{ r: 7, strokeWidth: 0 }}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  animationBegin={600}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-up premium-card overflow-hidden transform transition-all duration-300 hover:shadow-xl" style={{ animationDelay: "0.4s" }}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" /> 
            Teacher Performance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border shadow-inner">
            <div className="max-h-[500px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-muted/40 backdrop-blur-sm">
                  <TableRow>
                    <TableHead className="font-heading">Teacher</TableHead>
                    <TableHead className="text-right font-heading">Barre Sessions</TableHead>
                    <TableHead className="text-right font-heading">Cycle Sessions</TableHead>
                    <TableHead className="text-right font-heading">Barre Revenue</TableHead>
                    <TableHead className="text-right font-heading">Cycle Revenue</TableHead>
                    <TableHead className="text-right font-heading">Avg Class Size (Barre)</TableHead>
                    <TableHead className="text-right font-heading">Avg Class Size (Cycle)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherList.map((teacher: any, index: number) => (
                    <TableRow key={index} className="animate-fade-in hover:bg-muted/20 transition-colors duration-200" style={{ animationDelay: `${index * 0.05 + 0.5}s` }}>
                      <TableCell className="font-medium">{teacher.name}</TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-barre">{teacher.barreSessions}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-cycle">{teacher.cycleSessions}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">₹{Math.floor(teacher.barrePaid).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">₹{Math.floor(teacher.cyclePaid).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{teacher.avgBarreClassSize}</TableCell>
                      <TableCell className="text-right">{teacher.avgCycleClassSize}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Totals</TableCell>
                    <TableCell className="text-right">{totals.barreSessions}</TableCell>
                    <TableCell className="text-right">{totals.cycleSessions}</TableCell>
                    <TableCell className="text-right font-mono">₹{Math.floor(totals.barrePaid).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">₹{Math.floor(totals.cyclePaid).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{averages.avgBarreClassSize.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{averages.avgCycleClassSize.toFixed(1)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeachersView;
