
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData } from "@/types/fitnessTypes";
import { LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useDrillDown } from "@/contexts/DrillDownContext";
import { formatINR } from "@/lib/formatters";
import { ChevronRight } from "lucide-react";

interface FinancialsViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const FinancialsView: React.FC<FinancialsViewProps> = ({ data, selectedMonths, location }) => {
  // Use the drill down context
  const { setDrillDownData, setShowDrillDown } = useDrillDown();
  
  // Filter data based on selected months and location
  const filteredStats = data.monthlyStats.filter(stat => 
    (selectedMonths.length === 0 || selectedMonths.includes(stat.monthYear))
  );

  const filteredRawData = data.rawData.filter(record => 
    (selectedMonths.length === 0 || selectedMonths.includes(record["Month Year"])) &&
    (location === "" || location === "all" || record.Location === location)
  );

  // Calculate total revenue
  const totalBarreRevenue = filteredRawData.reduce(
    (sum, record) => sum + parseInt(String(record["Barre Revenue"] || "0")), 
    0
  );
  
  const totalCycleRevenue = filteredRawData.reduce(
    (sum, record) => sum + parseInt(String(record["Cycle Revenue"] || "0")),
    0
  );
  
  // Monthly revenue data
  const revenueData = filteredStats.map(stat => ({
    name: stat.monthYear,
    barreRevenue: parseInt(String(stat.barreRevenue || "0")),
    cycleRevenue: parseInt(String(stat.cycleRevenue || "0"))
  }));

  // Calculate average revenue per class
  const avgBarreRevenuePerClass = filteredRawData.reduce(
    (sum, record) => {
      const revenue = parseInt(String(record["Barre Revenue"] || "0"));
      const sessions = parseInt(String(record["Barre Sessions"] || "0"));
      return sessions > 0 ? sum + (revenue / sessions) : sum;
    },
    0
  ) / (filteredRawData.length || 1);

  const avgCycleRevenuePerClass = filteredRawData.reduce(
    (sum, record) => {
      const revenue = parseInt(String(record["Cycle Revenue"] || "0"));
      const sessions = parseInt(String(record["Cycle Sessions"] || "0"));
      return sessions > 0 ? sum + (revenue / sessions) : sum;
    },
    0
  ) / (filteredRawData.length || 1);

  // Calculate revenue per student
  const totalBarreStudents = filteredRawData.reduce(
    (sum, record) => sum + parseInt(String(record["Barre Students"] || "0")), 
    0
  );
  
  const totalCycleStudents = filteredRawData.reduce(
    (sum, record) => sum + parseInt(String(record["Cycle Students"] || "0")), 
    0
  );
  
  const revenuePerBarreStudent = totalBarreStudents > 0 ? totalBarreRevenue / totalBarreStudents : 0;
  const revenuePerCycleStudent = totalCycleStudents > 0 ? totalCycleRevenue / totalCycleStudents : 0;

  // Revenue by month data
  const monthlyRevenueData = filteredStats.map(stat => ({
    name: stat.monthYear,
    barre: parseInt(String(stat.barreRevenue || "0")),
    cycle: parseInt(String(stat.cycleRevenue || "0"))
  }));

  // Revenue comparison pie chart data
  const revenueComparisonData = [
    { name: "Barre", value: totalBarreRevenue },
    { name: "Cycle", value: totalCycleRevenue }
  ];

  // Revenue per class comparison
  const revenuePerClassData = [
    { name: "Barre", value: avgBarreRevenuePerClass },
    { name: "Cycle", value: avgCycleRevenuePerClass }
  ];

  // Colors for different chart elements
  const barreColor = "#845EC2"; // Purple for Barre
  const cycleColor = "#00C2A8"; // Teal for Cycle
  const colors = [barreColor, cycleColor];

  // Calculate percentage difference in revenue compared to previous period
  // This should compare total revenue in selected months vs previous equivalent period
  let revenueTrendPercentage = 0;
  if (filteredStats.length > 0) {
    // For now just use first vs last month in filtered data as a simple metric
    const firstMonthRevenue = parseInt(String(filteredStats[0]?.barreRevenue || "0")) + 
                              parseInt(String(filteredStats[0]?.cycleRevenue || "0"));
    
    const lastMonthRevenue = parseInt(String(filteredStats[filteredStats.length - 1]?.barreRevenue || "0")) + 
                             parseInt(String(filteredStats[filteredStats.length - 1]?.cycleRevenue || "0"));
    
    if (firstMonthRevenue > 0) {
      revenueTrendPercentage = ((lastMonthRevenue - firstMonthRevenue) / firstMonthRevenue) * 100;
    }
  }

  // Handle drill-down for charts
  const handleChartClick = (data: any, chartType: string) => {
    if (!data) return;
    
    setDrillDownData({
      title: `${data.name} - ${chartType} Details`,
      data: [data],
      type: 'financial'
    });
    setShowDrillDown(true);
  };
  
  // Function for formatting the tooltip values
  const formatTooltipValue = (value: number) => {
    return formatINR(value.toString());
  };
  
  // Check if there's data before rendering the charts
  const hasData = Boolean(filteredStats.length > 0 && filteredRawData.length > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatINR((totalBarreRevenue + totalCycleRevenue).toString())}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              For selected time period
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Barre Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatINR(totalBarreRevenue.toString())}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {Math.round((totalBarreRevenue / (totalBarreRevenue + totalCycleRevenue || 1)) * 100)}% of total revenue
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cycle Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatINR(totalCycleRevenue.toString())}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {Math.round((totalCycleRevenue / (totalBarreRevenue + totalCycleRevenue || 1)) * 100)}% of total revenue
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${revenueTrendPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {revenueTrendPercentage >= 0 ? '+' : ''}{revenueTrendPercentage.toFixed(1)}%
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Compared to previous period
            </div>
          </CardContent>
        </Card>
      </div>

      {hasData ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyRevenueData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    onClick={(data) => data && handleChartClick(data.activePayload?.[0]?.payload, 'Monthly Revenue')}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      tick={{ fontSize: 12 }}
                      height={80}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatINR(value.toString()).substring(0, 7) + (value > 999999 ? 'k' : '')}
                    />
                    <Tooltip formatter={formatTooltipValue} />
                    <Legend />
                    <Bar dataKey="barre" name="Barre Revenue" fill={barreColor} />
                    <Bar dataKey="cycle" name="Cycle Revenue" fill={cycleColor} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueComparisonData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      onClick={(data) => handleChartClick(data, 'Revenue Distribution')}
                    >
                      {revenueComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={formatTooltipValue} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Revenue Per Class (Barre)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatINR(avgBarreRevenuePerClass.toFixed(0))}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Per session
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Revenue Per Class (Cycle)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatINR(avgCycleRevenuePerClass.toFixed(0))}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Per session
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenue Per Student (Barre)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatINR(revenuePerBarreStudent.toFixed(0))}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Per student
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenue Per Student (Cycle)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatINR(revenuePerCycleStudent.toFixed(0))}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Per student
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">No financial data available for the selected filters.</div>
          <div className="mt-2 text-sm">Try adjusting your month or location filters.</div>
        </Card>
      )}
    </div>
  );
};

export default FinancialsView;
