
import React, { useState } from 'react';
import { BarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR, formatNumber, formatPercent } from '@/lib/formatters';
import { BarChart as BarChartIcon, LineChart as LineChartIcon, Table2 } from 'lucide-react';
import { RechartsValueType } from '@/types/fitnessTypes';

interface DrillDownDetailProps {
  data: any;
  title: string;
  type: 'teacher' | 'class' | 'location' | 'month' | 'financial' | 'retention';
}

const DrillDownDetail: React.FC<DrillDownDetailProps> = ({ data, title, type }) => {
  const [activeTab, setActiveTab] = useState('chart');
  
  if (!data || !Array.isArray(data)) {
    return <div className="text-center py-8">No data available</div>;
  }
  
  // Get field names from first record to build columns
  const columns = data[0] ? Object.keys(data[0]) : [];
  
  // Prepare chart data
  const chartData = data.map(item => {
    // Format based on type
    const itemCopy = { ...item };
    
    // Truncate labels if too long
    if (itemCopy.name && itemCopy.name.length > 15) {
      itemCopy.name = itemCopy.name.substring(0, 15) + '...';
    }
    
    return itemCopy;
  });
  
  // Identify which fields are numeric for charting
  const numericFields = columns.filter(col => {
    const sample = data[0][col];
    return typeof sample === 'number' || !isNaN(parseFloat(sample));
  });
  
  // Choose colors based on type
  const getColorByField = (field: string) => {
    if (field.toLowerCase().includes('barre')) return '#FF6F91';
    if (field.toLowerCase().includes('cycle')) return '#9FD8CB';
    if (field.toLowerCase().includes('revenue') || field.toLowerCase().includes('paid')) return '#6366F1';
    if (field.toLowerCase().includes('retention') || field.toLowerCase().includes('retained')) return '#10B981';
    if (field.toLowerCase().includes('new')) return '#60A5FA';
    if (field.toLowerCase().includes('convert')) return '#F59E0B';
    return '#6366F1';
  };
  
  // Calculate totals for table
  const calculateTotals = () => {
    const totals: Record<string, any> = {};
    
    numericFields.forEach(field => {
      const sum = data.reduce((acc: number, cur: any) => {
        const value = typeof cur[field] === 'number' ? cur[field] : parseFloat(cur[field]) || 0;
        return acc + value;
      }, 0);
      
      totals[field] = sum;
    });
    
    return totals;
  };
  
  const totals = calculateTotals();
  
  // Is this field a currency field?
  const isCurrencyField = (field: string) => {
    return field.toLowerCase().includes('revenue') || 
           field.toLowerCase().includes('paid') ||
           field.toLowerCase().includes('income');
  };
  
  // Is this field a percentage field?
  const isPercentField = (field: string) => {
    return field.toLowerCase().includes('rate') ||
           field.toLowerCase().includes('percent');
  };
  
  // Format cell value based on field type
  const formatCellValue = (value: any, fieldName: string) => {
    if (value === null || value === undefined) return '-';
    
    if (isCurrencyField(fieldName)) {
      return formatINR(value);
    } else if (isPercentField(fieldName)) {
      return formatPercent(value);
    } else if (typeof value === 'number' || !isNaN(parseFloat(value))) {
      return formatNumber(value);
    }
    
    return value;
  };

  // Custom tooltip formatter for recharts
  const customFormatter = (value: RechartsValueType) => {
    // Handle the case where value is an array
    if (Array.isArray(value)) {
      return value.length > 0 ? String(value[0]) : '0';
    }
    return String(value);
  };
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="chart" className="flex items-center gap-1">
            <BarChartIcon className="h-4 w-4" />
            Chart View
          </TabsTrigger>
          <TabsTrigger value="line" className="flex items-center gap-1">
            <LineChartIcon className="h-4 w-4" />
            Trend View
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-1">
            <Table2 className="h-4 w-4" />
            Table View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{title} - Chart View</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    tick={{ fontSize: 12 }}
                    height={80}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      const strValue = customFormatter(value);
                      if (isCurrencyField(name.toString())) {
                        return [formatINR(strValue), name];
                      } else if (isPercentField(name.toString())) {
                        return [formatPercent(strValue), name];
                      }
                      return [formatNumber(strValue), name];
                    }}
                  />
                  <Legend />
                  {numericFields.map((field, index) => (
                    <Bar 
                      key={field} 
                      dataKey={field} 
                      fill={getColorByField(field)}
                      barSize={30}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="line" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{title} - Trend View</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    tick={{ fontSize: 12 }}
                    height={80}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      const strValue = customFormatter(value);
                      if (isCurrencyField(name.toString())) {
                        return [formatINR(strValue), name];
                      } else if (isPercentField(name.toString())) {
                        return [formatPercent(strValue), name];
                      }
                      return [formatNumber(strValue), name];
                    }}
                  />
                  <Legend />
                  {numericFields.map((field, index) => (
                    <Line 
                      key={field} 
                      type="monotone"
                      dataKey={field} 
                      stroke={getColorByField(field)}
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="table" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{title} - Detailed Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column) => (
                        <TableHead 
                          key={column}
                          className={column === columns[0] ? "text-left" : "text-center"}
                        >
                          {column}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {columns.map((column, colIndex) => (
                          <TableCell 
                            key={`${rowIndex}-${colIndex}`}
                            className={column === columns[0] ? "text-left" : "text-center"}
                          >
                            {formatCellValue(row[column], column)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell>{data.length} items</TableCell>
                      {columns.slice(1).map((column) => (
                        <TableCell 
                          key={`total-${column}`}
                          className="text-center"
                        >
                          {numericFields.includes(column) ? 
                            formatCellValue(totals[column], column) : 
                            ""}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DrillDownDetail;
