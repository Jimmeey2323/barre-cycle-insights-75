
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData, RechartsValueType, RechartsNameType } from "@/types/fitnessTypes";
import { BarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RetentionViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const RetentionView: React.FC<RetentionViewProps> = ({ data, selectedMonths, location }) => {
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

  // Aggregate retention and conversion data by month
  const retentionDataByMonth = filteredRawData.reduce((acc: Record<string, any>, record) => {
    const monthYear = record["Month Year"];
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        monthYear,
        newCustomers: 0,
        retainedCustomers: 0,
        convertedCustomers: 0
      };
    }
    
    acc[monthYear].newCustomers += parseInt(record["New"] || "0");
    acc[monthYear].retainedCustomers += parseInt(record["Retained"] || "0");
    acc[monthYear].convertedCustomers += parseInt(record["Converted"] || "0");
    
    return acc;
  }, {});

  // Convert to array and calculate rates
  const retentionData = Object.values(retentionDataByMonth).map((item: any) => {
    const retentionRate = (item.newCustomers + item.retainedCustomers) > 0 
      ? (item.retainedCustomers / (item.newCustomers + item.retainedCustomers)) * 100 
      : 0;
      
    const conversionRate = (item.newCustomers + item.retainedCustomers) > 0
      ? (item.convertedCustomers / (item.newCustomers + item.retainedCustomers)) * 100
      : 0;
      
    return {
      name: item.monthYear,
      new: item.newCustomers,
      retained: item.retainedCustomers,
      converted: item.convertedCustomers,
      retentionRate,
      conversionRate
    };
  }).sort((a, b) => {
    // Parse "MMM-YYYY" format
    const [aMonth, aYear] = a.name.split('-');
    const [bMonth, bYear] = b.name.split('-');
    
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const yearComparison = Number(aYear) - Number(bYear);
    if (yearComparison !== 0) return yearComparison;
    
    return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
  });

  // Calculate overall retention metrics
  const totalNewCustomers = retentionData.reduce((sum, item) => sum + item.new, 0);
  const totalRetainedCustomers = retentionData.reduce((sum, item) => sum + item.retained, 0);
  const totalConvertedCustomers = retentionData.reduce((sum, item) => sum + item.converted, 0);
  
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNewCustomers}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              First-time visitors
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Retained Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRetainedCustomers}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Returning visitors
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Converted Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConvertedCustomers}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Moved between class types
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallRetentionRate.toFixed(1)}%</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Customer retention
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallConversionRate.toFixed(1)}%</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Class type switching
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Retention by Month</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={retentionData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="new" name="New Customers" fill={newColor} />
                <Bar dataKey="retained" name="Retained Customers" fill={retainedColor} />
                <Bar dataKey="converted" name="Converted Customers" fill={convertedColor} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retention & Conversion Rates</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={retentionData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip formatter={(value: RechartsValueType) => {
                  return [`${typeof value === 'number' ? value.toFixed(1) : value}%`, ""];
                }} />
                <Legend />
                <Line type="monotone" dataKey="retentionRate" name="Retention Rate" stroke={retentionRateColor} strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="conversionRate" name="Conversion Rate" stroke={conversionRateColor} strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Customer Journey Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={retentionData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: RechartsValueType, name: RechartsNameType) => {
                    const nameStr = typeof name === 'string' ? name : String(name);
                    if (nameStr.includes('Rate')) {
                      return [`${typeof value === 'number' ? value.toFixed(1) : value}%`, nameStr];
                    }
                    return [value, nameStr];
                  }} 
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="new" name="New Customers" stroke={newColor} activeDot={{ r: 8 }} />
                <Line yAxisId="left" type="monotone" dataKey="retained" name="Retained Customers" stroke={retainedColor} activeDot={{ r: 8 }} />
                <Line yAxisId="left" type="monotone" dataKey="converted" name="Converted Customers" stroke={convertedColor} activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="retentionRate" name="Retention Rate" stroke={retentionRateColor} strokeWidth={2} strokeDasharray="5 5" />
                <Line yAxisId="right" type="monotone" dataKey="conversionRate" name="Conversion Rate" stroke={conversionRateColor} strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RetentionView;
