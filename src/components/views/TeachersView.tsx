
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData } from "@/types/fitnessTypes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

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
    
    acc[teacherName].barreSessions += parseInt(record["Barre Sessions"] || "0");
    acc[teacherName].cycleSessions += parseInt(record["Cycle Sessions"] || "0");
    acc[teacherName].barreCustomers += parseInt(record["Barre Customers"] || "0");
    acc[teacherName].cycleCustomers += parseInt(record["Cycle Customers"] || "0");
    acc[teacherName].barrePaid += parseFloat(record["Barre Paid"] || "0");
    acc[teacherName].cyclePaid += parseFloat(record["Cycle Paid"] || "0");
    acc[teacherName].totalSessions += parseInt(record["Total Sessions"] || "0");
    
    // Calculate avg class size for non-empty sessions
    const nonEmptyBarreSessions = parseInt(record["Non-Empty Barre Sessions"] || "0");
    const nonEmptyCycleSessions = parseInt(record["Non-Empty Cycle Sessions"] || "0");
    
    if (nonEmptyBarreSessions > 0) {
      acc[teacherName].avgBarreClassSize = (acc[teacherName].barreCustomers / nonEmptyBarreSessions).toFixed(1);
    }
    
    if (nonEmptyCycleSessions > 0) {
      acc[teacherName].avgCycleClassSize = (acc[teacherName].cycleCustomers / nonEmptyCycleSessions).toFixed(1);
    }
    
    return acc;
  }, {});

  const teacherList = Object.values(teacherData).sort((a: any, b: any) => b.totalSessions - a.totalSessions);

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
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

        <Card>
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
                <Tooltip formatter={(value) => [`₹${parseInt(value).toLocaleString()}`, ""]} />
                <Legend />
                <Bar dataKey="barre" name="Barre Revenue" fill={barreColor} />
                <Bar dataKey="cycle" name="Cycle Revenue" fill={cycleColor} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher Performance Details</CardTitle>
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
                    <TableCell className="text-right">{teacher.barreSessions}</TableCell>
                    <TableCell className="text-right">{teacher.cycleSessions}</TableCell>
                    <TableCell className="text-right">₹{teacher.barrePaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</TableCell>
                    <TableCell className="text-right">₹{teacher.cyclePaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</TableCell>
                    <TableCell className="text-right">{teacher.avgBarreClassSize}</TableCell>
                    <TableCell className="text-right">{teacher.avgCycleClassSize}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeachersView;
