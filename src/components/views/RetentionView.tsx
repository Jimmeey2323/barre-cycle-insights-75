import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData, RechartsValueType, RechartsNameType } from "@/types/fitnessTypes";
import { BarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingDown, TrendingUp, Users } from "lucide-react";

interface RetentionViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const RetentionView: React.FC<RetentionViewProps> = ({ data, selectedMonths, location }) => {
  const filteredStats = data.monthlyStats.filter(stat => 
    (selectedMonths.length === 0 || selectedMonths.includes(stat.monthYear)) &&
    (location === "" || location === "all" || String(stat.Location) === location)
  );

  const filteredRawData = data.rawData.filter(record => 
    (selectedMonths.length === 0 || selectedMonths.includes(String(record["Month Year"]))) &&
    (location === "" || location === "all" || record.Location === location)
  );

  filteredStats.sort((a, b) => {
    const [aMonth, aYear] = a.monthYear.split('-');
    const [bMonth, bYear] = b.monthYear.split('-');
    
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const yearComparison = Number(aYear) - Number(bYear);
    if (yearComparison !== 0) return yearComparison;
    
    return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
  });

  const retentionDataByMonth = filteredRawData.reduce((acc: Record<string, any>, record) => {
    const monthYear = String(record["Month Year"]);
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        monthYear,
        newCustomers: 0,
        retainedCustomers: 0,
        convertedCustomers: 0
      };
    }
    
    acc[monthYear].newCustomers += parseInt(String(record["New"] || "0"));
    acc[monthYear].retainedCustomers += parseInt(String(record["Retained"] || "0"));
    acc[monthYear].convertedCustomers += parseInt(String(record["Converted"] || "0"));
    
    return acc;
  }, {});

  const retentionData = Object.values(retentionDataByMonth).map((item: any) => {
    const retentionRate = (item.newCustomers + item.retainedCustomers) > 0 
      ? (item.retainedCustomers / (item.newCustomers + item.retainedCustomers)) * 100 
      : 0;
      
    const conversionRate = (item.newCustomers + item.retainedCustomers) > 0
      ? (item.convertedCustomers / (item.newCustomers + item.retainedCustomers)) * 100
      : 0;
      
    return {
      name: String(item.monthYear),
      new: parseInt(String(item.newCustomers), 10),
      retained: parseInt(String(item.retainedCustomers), 10),
      converted: parseInt(String(item.convertedCustomers), 10),
      retentionRate,
      conversionRate
    };
  }).sort((a, b) => {
    const [aMonth, aYear] = a.name.split('-');
    const [bMonth, bYear] = b.name.split('-');
    
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const yearComparison = Number(aYear) - Number(bYear);
    if (yearComparison !== 0) return yearComparison;
    
    return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
  });

  const totalNewCustomers = retentionData.reduce((sum, item) => sum + (item.new || 0), 0);
  const totalRetainedCustomers = retentionData.reduce((sum, item) => sum + (item.retained || 0), 0);
  const totalConvertedCustomers = retentionData.reduce((sum, item) => sum + (item.converted || 0), 0);
  
  const overallRetentionRate = (totalNewCustomers + totalRetainedCustomers) > 0
    ? (totalRetainedCustomers / (totalNewCustomers + totalRetainedCustomers)) * 100
    : 0;
    
  const overallConversionRate = (totalNewCustomers + totalRetainedCustomers) > 0
    ? (totalConvertedCustomers / (totalNewCustomers + totalRetainedCustomers)) * 100
    : 0;

  const newColor = "#60A5FA";
  const retainedColor = "#10B981";
  const convertedColor = "#F59E0B";
  const retentionRateColor = "#6366F1";
  const conversionRateColor = "#EC4899";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold font-heading bg-gradient-to-r from-barre to-cycle bg-clip-text text-transparent animate-fade-in">
          Customer Retention Analysis
        </h2>
        <Badge variant="outline" className="flex items-center px-3 py-1 rounded-full bg-background/60 backdrop-blur-sm">
          <RefreshCw className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Last updated: Today</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="overflow-hidden bg-gradient-to-br from-background to-muted/20 border border-border/40 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">{totalNewCustomers}</div>
            <div className="mt-1 text-xs text-muted-foreground flex items-center">
              <Users className="h-3 w-3 mr-1 opacity-70" />
              First-time visitors
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden bg-gradient-to-br from-background to-muted/20 border border-border/40 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Retained Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">{totalRetainedCustomers}</div>
            <div className="mt-1 text-xs text-muted-foreground flex items-center">
              <RefreshCw className="h-3 w-3 mr-1 opacity-70" />
              Returning visitors
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden bg-gradient-to-br from-background to-muted/20 border border-border/40 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Converted Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">{totalConvertedCustomers}</div>
            <div className="mt-1 text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 opacity-70" />
              Moved between class types
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden bg-gradient-to-br from-background to-muted/20 border border-border/40 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">{overallRetentionRate.toFixed(1)}%</div>
            <div className="mt-1 text-xs text-muted-foreground flex items-center">
              {overallRetentionRate > 50 ? 
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" /> : 
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              }
              Customer retention
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden bg-gradient-to-br from-background to-muted/20 border border-border/40 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">{overallConversionRate.toFixed(1)}%</div>
            <div className="mt-1 text-xs text-muted-foreground flex items-center">
              {overallConversionRate > 20 ? 
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" /> : 
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              }
              Class type switching
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="overflow-hidden bg-gradient-to-br from-background to-muted/20 border border-border/40 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-barre" />
              Customer Retention by Month
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={retentionData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                className="animate-fade-in"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
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
                <Legend 
                  wrapperStyle={{ paddingTop: 20 }}
                  iconType="circle"
                  iconSize={8} 
                />
                <Bar 
                  dataKey="new" 
                  name="New Customers" 
                  fill={newColor} 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
                <Bar 
                  dataKey="retained" 
                  name="Retained Customers" 
                  fill={retainedColor} 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  animationBegin={300}
                />
                <Bar 
                  dataKey="converted" 
                  name="Converted Customers" 
                  fill={convertedColor} 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  animationBegin={600}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-gradient-to-br from-background to-muted/20 border border-border/40 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-cycle" />
              Retention & Conversion Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={retentionData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                className="animate-fade-in"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: RechartsValueType) => {
                    return [`${typeof value === 'number' ? value.toFixed(1) : value}%`, ""];
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
                <Legend 
                  wrapperStyle={{ paddingTop: 20 }}
                  iconType="circle"
                  iconSize={8} 
                />
                <Area 
                  type="monotone" 
                  dataKey="retentionRate" 
                  name="Retention Rate" 
                  stroke={retentionRateColor} 
                  fill={`${retentionRateColor}20`}
                  strokeWidth={2} 
                  activeDot={{ r: 8, strokeWidth: 0, fill: retentionRateColor }}
                  animationDuration={1500}
                  animationEasing="ease-out" 
                />
                <Area 
                  type="monotone" 
                  dataKey="conversionRate" 
                  name="Conversion Rate" 
                  stroke={conversionRateColor} 
                  fill={`${conversionRateColor}20`}
                  strokeWidth={2} 
                  activeDot={{ r: 8, strokeWidth: 0, fill: conversionRateColor }} 
                  animationDuration={1500}
                  animationEasing="ease-out"
                  animationBegin={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1">
        <Card className="overflow-hidden bg-gradient-to-br from-background to-muted/20 border border-border/40 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-gradient-barre" />
              Customer Journey Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={retentionData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                className="animate-fade-in"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: RechartsValueType, name: RechartsNameType) => {
                    const nameStr = typeof name === 'string' ? name : String(name);
                    if (nameStr.includes('Rate')) {
                      return [`${typeof value === 'number' ? value.toFixed(1) : value}%`, nameStr];
                    }
                    return [value, nameStr];
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
                <Legend 
                  wrapperStyle={{ paddingTop: 20 }}
                  iconType="circle"
                  iconSize={8} 
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="new" 
                  name="New Customers" 
                  stroke={newColor} 
                  activeDot={{ r: 8, strokeWidth: 0, fill: newColor }} 
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="retained" 
                  name="Retained Customers" 
                  stroke={retainedColor} 
                  activeDot={{ r: 8, strokeWidth: 0, fill: retainedColor }} 
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  animationBegin={300}
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="converted" 
                  name="Converted Customers" 
                  stroke={convertedColor} 
                  activeDot={{ r: 8, strokeWidth: 0, fill: convertedColor }} 
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  animationBegin={600}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="retentionRate" 
                  name="Retention Rate" 
                  stroke={retentionRateColor} 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: retentionRateColor }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  animationBegin={900}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="conversionRate" 
                  name="Conversion Rate" 
                  stroke={conversionRateColor} 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: conversionRateColor }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  animationBegin={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RetentionView;
