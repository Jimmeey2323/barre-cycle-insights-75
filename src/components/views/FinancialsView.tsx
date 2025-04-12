import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData, RechartsValueType } from "@/types/fitnessTypes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { formatINR } from "@/lib/formatters";
import { useDrillDown } from "@/contexts/DrillDownContext";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, MapPinIcon, TrendingUp, TrendingDown, ActivityIcon, Users } from "lucide-react";

interface FinancialsViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const FinancialsView: React.FC<FinancialsViewProps> = ({ data, selectedMonths, location }) => {
  const drillDown = useDrillDown();

  // Filter data based on selected months and location
  const filteredStats = useMemo(() => {
    return data.monthlyStats.filter(stat =>
      (selectedMonths.length === 0 || selectedMonths.includes(stat.monthYear)) &&
      (location === "" || location === "all" || stat.location === location)
    );
  }, [data, selectedMonths, location]);

  const filteredRawData = useMemo(() => {
    return data.rawData.filter(record =>
      (selectedMonths.length === 0 || selectedMonths.includes(String(record["Month Year"]))) &&
      (location === "" || location === "all" || record.Location === location)
    );
  }, [data, selectedMonths, location]);

  // Calculate total revenue
  const totalRevenue = useMemo(() => {
    return filteredStats.reduce((sum, stat) => sum + stat.totalRevenue, 0);
  }, [filteredStats]);

  // Calculate average revenue per month
  const avgRevenuePerMonth = useMemo(() => {
    return filteredStats.length > 0 ? totalRevenue / filteredStats.length : 0;
  }, [totalRevenue, filteredStats]);

  // Calculate revenue by class type
  const revenueByClassType = useMemo(() => {
    return filteredRawData.reduce((acc: { [key: string]: number }, record) => {
      const classType = String(record.Type);
      const classRevenue = parseInt(String(record["Class Revenue"] || "0"));
      acc[classType] = (acc[classType] || 0) + classRevenue;
      return acc;
    }, {});
  }, [filteredRawData]);

  // Convert revenue by class type to array for chart
  const revenueByClassTypeData = useMemo(() => {
    return Object.entries(revenueByClassType).map(([name, value]) => ({
      name,
      value
    }));
  }, [revenueByClassType]);

  // Calculate revenue by location
  const revenueByLocation = useMemo(() => {
    return filteredRawData.reduce((acc: { [key: string]: number }, record) => {
      const locationName = String(record.Location);
      const classRevenue = parseInt(String(record["Class Revenue"] || "0"));
      acc[locationName] = (acc[locationName] || 0) + classRevenue;
      return acc;
    }, {});
  }, [filteredRawData]);

  // Convert revenue by location to array for chart
  const revenueByLocationData = useMemo(() => {
    return Object.entries(revenueByLocation).map(([name, value]) => ({
      name,
      value
    }));
  }, [revenueByLocation]);

  // Calculate revenue over time
  const revenueOverTime = useMemo(() => {
    return filteredStats.map(stat => ({
      name: stat.monthYear,
      revenue: stat.totalRevenue
    }));
  }, [filteredStats]);

  // Define colors for charts
  const classTypeColors = ["#8884d8", "#82ca9d", "#ffc658", "#a4de6c", "#d0ed57"];
  const locationColors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"];

  // This function now correctly uses setShowDrillDown
  const handleDrillDown = (dataItem: any, dataKey: string, dataLabel: string) => {
    // Format and set drill down data
    const detailedData = data.rawData.filter(record => {
      if (dataKey === "month") {
        return String(record["Month Year"]) === dataItem.name;
      } else if (dataKey === "type") {
        return String(record.Type) === dataItem.name;
      } else if (dataKey === "location") {
        return String(record.Location) === dataItem.name;
      }
      return false;
    });
    
    drillDown.setDrillDown({
      title: `${dataLabel}: ${dataItem.name}`,
      data: detailedData,
      type: dataKey
    });
    
    // This is now the correct property
    drillDown.setShowDrillDown(true);
  };

  const metrics = [
    { 
      title: "Total Revenue", 
      value: formatINR(totalRevenue), 
      icon: <IndianRupee className="h-5 w-5 text-green-500" />,
      change: "+12% from last month"
    },
    { 
      title: "Avg Revenue / Month", 
      value: formatINR(avgRevenuePerMonth), 
      icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
      change: "+3% from last month"
    },
    { 
      title: "Most Popular Class", 
      value: revenueByClassTypeData.length > 0 ? revenueByClassTypeData[0].name : "N/A",
      icon: <ActivityIcon className="h-5 w-5 text-yellow-500" />,
      change: "Based on revenue"
    },
    { 
      title: "Top Location", 
      value: revenueByLocationData.length > 0 ? revenueByLocationData[0].name : "N/A",
      icon: <MapPinIcon className="h-5 w-5 text-red-500" />,
      change: "Based on revenue"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold font-heading bg-gradient-to-r from-barre to-cycle bg-clip-text text-transparent">
          Financial Overview
        </h2>
        <Badge variant="outline" className="flex items-center px-3 py-1 rounded-full bg-background/60 backdrop-blur-sm">
          <IndianRupee className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Last updated: Today</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="animate-fade-in premium-card overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <h3 className="text-2xl font-bold mt-1 animate-fade-up bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent" style={{ animationDelay: `${index * 0.1 + 0.2}s` }}>
                    {metric.value}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{metric.change}</p>
                </div>
                <div className="rounded-full bg-green-500/10 p-2">
                  {metric.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="animate-fade-in premium-card overflow-hidden transform transition-all duration-300 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ActivityIcon className="h-5 w-5 mr-2 text-barre" />
              Revenue by Class Type
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart onClick={(e) => {
                  if (e && e.activeShape && e.activeShape.payload) {
                    const dataItem = e.activeShape.payload;
                    handleDrillDown(dataItem, "type", "Class Type");
                  }
                }}>
                <Pie
                  data={revenueByClassTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={140}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {revenueByClassTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={classTypeColors[index % classTypeColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: RechartsValueType) => {
                    return [formatINR(Number(value)), ""];
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
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-in premium-card overflow-hidden transform transition-all duration-300 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2 text-cycle" />
              Revenue by Location
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart onClick={(e) => {
                  if (e && e.activeShape && e.activeShape.payload) {
                    const dataItem = e.activeShape.payload;
                    handleDrillDown(dataItem, "location", "Location");
                  }
                }}>
                <Pie
                  data={revenueByLocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={140}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {revenueByLocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={locationColors[index % locationColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: RechartsValueType) => {
                    return [formatINR(Number(value)), ""];
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
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-in premium-card overflow-hidden transform transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-barre" />
            Revenue Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={revenueOverTime}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              onClick={(e) => {
                  if (e && e.activeShape && e.activeShape.payload) {
                    const dataItem = e.activeShape.payload;
                    handleDrillDown(dataItem, "month", "Month");
                  }
                }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
              <Tooltip 
                formatter={(value: RechartsValueType) => {
                  return [formatINR(Number(value)), ""];
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
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#FFD700" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialsView;
