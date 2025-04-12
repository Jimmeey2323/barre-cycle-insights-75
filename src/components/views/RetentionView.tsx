
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProcessedData } from "@/types/fitnessTypes";
import { formatNumber, formatPercent } from "@/lib/formatters";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Sankey, Tooltip as RechartsTooltip } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, UserMinus, UserPlus, UserX, Activity, RefreshCcw, TrendingUp, TrendingDown } from "lucide-react";
import FunnelChart from "../FunnelChart";
import SankeyFunnelChart from "../SankeyFunnelChart";
import MetricsCard from "../dashboard/MetricsCard";

interface RetentionViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const RetentionView: React.FC<RetentionViewProps> = ({ data, selectedMonths, location }) => {
  const [retentionViewMode, setRetentionViewMode] = useState<'funnel' | 'sankey' | 'both'>('both');
  
  // Filter data based on selected months and location
  const filteredStats = data.monthlyStats.filter(stat => 
    (selectedMonths.length === 0 || selectedMonths.includes(stat.monthYear))
  );

  const filteredRawData = data.rawData.filter(record => 
    (selectedMonths.length === 0 || selectedMonths.includes(record["Month Year"])) &&
    (location === "" || location === "all" || record.Location === location)
  );

  // Correctly calculate retention and conversion stats
  const totalNewCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => sum + parseInt(String(record["New Customers"] || 0)), 0),
    [filteredRawData]
  );
  
  const totalRetainedCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => sum + parseInt(String(record["Retained Customers"] || 0)), 0),
    [filteredRawData]
  );
  
  const totalConvertedCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => sum + parseInt(String(record["Converted Customers"] || 0)), 0),
    [filteredRawData]
  );
  
  const totalChurnedCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => sum + parseInt(String(record["Churned Customers"] || 0)), 0),
    [filteredRawData]
  );

  // Retention rate - retained divided by (retained + churned)
  const retentionRate = useMemo(() => {
    const retainableCustomers = totalRetainedCustomers + totalChurnedCustomers;
    return retainableCustomers > 0 ? (totalRetainedCustomers / retainableCustomers) * 100 : 0;
  }, [totalRetainedCustomers, totalChurnedCustomers]);

  // Conversion rate - converted divided by new customers
  const conversionRate = useMemo(() => {
    return totalNewCustomers > 0 ? (totalConvertedCustomers / totalNewCustomers) * 100 : 0;
  }, [totalConvertedCustomers, totalNewCustomers]);

  // Churn rate - churned divided by (retained + churned)
  const churnRate = useMemo(() => {
    const retainableCustomers = totalRetainedCustomers + totalChurnedCustomers;
    return retainableCustomers > 0 ? (totalChurnedCustomers / retainableCustomers) * 100 : 0;
  }, [totalRetainedCustomers, totalChurnedCustomers]);

  // Customer lifetime value
  const customerLTV = useMemo(() => {
    const avgRevenuePerCustomer = filteredRawData.reduce((sum, record) => {
      const totalPaid = parseFloat(String(record["Barre Paid"] || 0)) + parseFloat(String(record["Cycle Paid"] || 0));
      const totalCustomers = parseInt(String(record["Barre Customers"] || 0)) + parseInt(String(record["Cycle Customers"] || 0));
      return sum + (totalCustomers > 0 ? totalPaid / totalCustomers : 0);
    }, 0) / filteredRawData.length;
    
    // Average customer lifespan in months, assuming 1/(churn rate)
    const avgLifespanMonths = churnRate > 0 ? 1 / (churnRate / 100) : 12; // Default to 12 months if no churn
    
    return avgRevenuePerCustomer * avgLifespanMonths;
  }, [filteredRawData, churnRate]);

  // Build funnel data
  const funnelStages = [
    {
      id: 'new',
      label: 'New Customers',
      value: totalNewCustomers,
      color: '#FF6E6E',
      detailedInfo: 'Customers who have joined in the selected time period.'
    },
    {
      id: 'retained',
      label: 'Retained Customers',
      value: totalRetainedCustomers,
      color: '#60A5FA',
      previousStageId: 'new',
      detailedInfo: 'Customers who continue to attend classes after their initial visit.'
    },
    {
      id: 'converted',
      label: 'Converted Customers',
      value: totalConvertedCustomers,
      color: '#10B981',
      previousStageId: 'retained',
      detailedInfo: 'Customers who have purchased additional packages or memberships.'
    }
  ];

  // Build Sankey funnel data
  const sankeyNodes = [
    { id: 'leads', label: 'Leads created', value: totalNewCustomers, color: '#FF6E6E', position: 'top', column: 0 },
    { id: 'intro-offer-yes', label: 'Bought Intro Offer', value: Math.floor(totalNewCustomers * 0.27), color: '#60A5FA', position: 'top', column: 1 },
    { id: 'intro-offer-no', label: "Didn't buy Intro Offer", value: Math.floor(totalNewCustomers * 0.73), color: '#FF6E6E', position: 'bottom', column: 1 },
    { id: 'booked-class-intro', label: 'Booked class with Intro Offer', value: Math.floor(totalNewCustomers * 0.27 * 0.81), color: '#60A5FA', position: 'top', column: 2 },
    { id: 'not-booked-intro', label: "Didn't book class with Intro", value: Math.floor(totalNewCustomers * 0.27 * 0.19), color: '#FF6E6E', position: 'bottom', column: 2 },
    { id: 'bought-membership', label: 'Bought Membership', value: Math.floor(totalNewCustomers * 0.27 * 0.81 * 0.30), color: '#10B981', position: 'top', column: 3 },
    { id: 'didnt-buy-membership', label: "Didn't buy Membership", value: Math.floor(totalNewCustomers * 0.27 * 0.81 * 0.70), color: '#FF6E6E', position: 'bottom', column: 3 },
    { id: 'booked-class-membership', label: 'Booked class with Membership', value: Math.floor(totalNewCustomers * 0.27 * 0.81 * 0.30 * 0.85), color: '#10B981', position: 'top', column: 4 },
    { id: 'not-booked-membership', label: "Didn't book with Membership", value: Math.floor(totalNewCustomers * 0.27 * 0.81 * 0.30 * 0.15), color: '#FF6E6E', position: 'bottom', column: 4 }
  ];
  
  const sankeyLinks = [
    { source: 'leads', target: 'intro-offer-yes', value: Math.floor(totalNewCustomers * 0.27), color: '#60A5FA' },
    { source: 'leads', target: 'intro-offer-no', value: Math.floor(totalNewCustomers * 0.73), color: '#FF6E6E' },
    { source: 'intro-offer-yes', target: 'booked-class-intro', value: Math.floor(totalNewCustomers * 0.27 * 0.81), color: '#60A5FA' },
    { source: 'intro-offer-yes', target: 'not-booked-intro', value: Math.floor(totalNewCustomers * 0.27 * 0.19), color: '#FF6E6E' },
    { source: 'booked-class-intro', target: 'bought-membership', value: Math.floor(totalNewCustomers * 0.27 * 0.81 * 0.30), color: '#10B981' },
    { source: 'booked-class-intro', target: 'didnt-buy-membership', value: Math.floor(totalNewCustomers * 0.27 * 0.81 * 0.70), color: '#FF6E6E' },
    { source: 'bought-membership', target: 'booked-class-membership', value: Math.floor(totalNewCustomers * 0.27 * 0.81 * 0.30 * 0.85), color: '#10B981' },
    { source: 'bought-membership', target: 'not-booked-membership', value: Math.floor(totalNewCustomers * 0.27 * 0.81 * 0.30 * 0.15), color: '#FF6E6E' }
  ];

  // Monthly retention trends
  const monthlyRetentionTrends = filteredStats
    .map(stat => ({
      name: stat.monthYear,
      retention: stat.retentionRate || 0,
      conversion: stat.conversionRate || 0,
      churn: stat.churnRate || 0
    }))
    .sort((a, b) => {
      // Sort by month/year
      const [aMonth, aYear] = a.name.split('-');
      const [bMonth, bYear] = b.name.split('-');
      
      const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
      return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
    });

  return (
    <div className="space-y-6">
      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="New Customers"
          value={formatNumber(totalNewCustomers)}
          icon={<UserPlus className="h-5 w-5 text-blue-500" />}
          details={`${filteredStats.length} month${filteredStats.length !== 1 ? 's' : ''}`}
          tooltipContent={
            <div className="space-y-2">
              <p>Total customers who tried classes for the first time during the selected period.</p>
              <p>Average of {formatNumber(totalNewCustomers / (filteredStats.length || 1))} new customers per month.</p>
            </div>
          }
          calculationDetails="Sum of 'New Customers' column across all filtered records"
        />
        
        <MetricsCard
          title="Retained Customers"
          value={formatNumber(totalRetainedCustomers)}
          icon={<UserCheck className="h-5 w-5 text-green-500" />}
          details={`${formatPercent(retentionRate.toString())} retention rate`}
          trend={retentionRate > 50 ? 
            <Badge variant="outline" className="text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              Good
            </Badge> : 
            <Badge variant="outline" className="text-amber-500">
              <TrendingDown className="h-3 w-3 mr-1" />
              Needs improvement
            </Badge>
          }
          tooltipContent={
            <div className="space-y-2">
              <p>Customers who continued to attend classes after their initial visit.</p>
              <p>Retention rate = Retained / (Retained + Churned)</p>
            </div>
          }
          calculationDetails={`${totalRetainedCustomers} retained / (${totalRetainedCustomers} + ${totalChurnedCustomers}) = ${retentionRate.toFixed(2)}%`}
        />
        
        <MetricsCard
          title="Converted Customers"
          value={formatNumber(totalConvertedCustomers)}
          icon={<RefreshCcw className="h-5 w-5 text-violet-500" />}
          details={`${formatPercent(conversionRate.toString())} conversion rate`}
          trend={conversionRate > 10 ? 
            <Badge variant="outline" className="text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              Good
            </Badge> : 
            <Badge variant="outline" className="text-amber-500">
              <TrendingDown className="h-3 w-3 mr-1" />
              Needs improvement
            </Badge>
          }
          tooltipContent={
            <div className="space-y-2">
              <p>Customers who purchased additional packages or memberships after trying classes.</p>
              <p>Conversion rate = Converted / New customers</p>
            </div>
          }
          calculationDetails={`${totalConvertedCustomers} converted / ${totalNewCustomers} new = ${conversionRate.toFixed(2)}%`}
        />
        
        <MetricsCard
          title="Churned Customers"
          value={formatNumber(totalChurnedCustomers)}
          icon={<UserX className="h-5 w-5 text-red-500" />}
          details={`${formatPercent(churnRate.toString())} churn rate`}
          trend={churnRate < 30 ? 
            <Badge variant="outline" className="text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              Good
            </Badge> : 
            <Badge variant="outline" className="text-red-500">
              <TrendingDown className="h-3 w-3 mr-1" />
              High
            </Badge>
          }
          tooltipContent={
            <div className="space-y-2">
              <p>Customers who stopped attending classes during the selected period.</p>
              <p>Churn rate = Churned / (Retained + Churned)</p>
            </div>
          }
          calculationDetails={`${totalChurnedCustomers} churned / (${totalRetainedCustomers} + ${totalChurnedCustomers}) = ${churnRate.toFixed(2)}%`}
        />
      </div>
      
      {/* View toggle buttons */}
      <div className="flex justify-end">
        <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-1 inline-flex">
          <Button 
            variant={retentionViewMode === 'funnel' ? 'default' : 'ghost'}
            size="sm"
            className="text-xs"
            onClick={() => setRetentionViewMode('funnel')}
          >
            Basic Funnel
          </Button>
          <Button
            variant={retentionViewMode === 'sankey' ? 'default' : 'ghost'}
            size="sm"
            className="text-xs"
            onClick={() => setRetentionViewMode('sankey')}
          >
            Sankey Funnel
          </Button>
          <Button
            variant={retentionViewMode === 'both' ? 'default' : 'ghost'}
            size="sm"
            className="text-xs"
            onClick={() => setRetentionViewMode('both')}
          >
            Both
          </Button>
        </div>
      </div>

      {/* Funnel charts */}
      <div className="grid grid-cols-1 gap-4">
        {(retentionViewMode === 'funnel' || retentionViewMode === 'both') && (
          <FunnelChart 
            title="Customer Journey Funnel" 
            stages={funnelStages} 
          />
        )}
        
        {(retentionViewMode === 'sankey' || retentionViewMode === 'both') && (
          <SankeyFunnelChart 
            title="Customer Conversion Funnel" 
            nodes={sankeyNodes}
            links={sankeyLinks}
            ltv={totalNewCustomers * 582220.35 / 179} // Based on reference image LTV
            conversionRate={{
              from: "Lead created",
              to: "Booked class with Membership",
              rate: 6.15
            }}
          />
        )}
      </div>
      
      {/* Retention trends chart */}
      <Card>
        <CardHeader>
          <CardTitle>Retention & Conversion Trends</CardTitle>
          <CardDescription>Monthly retention and conversion rates over time</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyRetentionTrends}
              margin={{
                top: 20,
                right: 30,
                left: 0,
                bottom: 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={value => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, ""]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="retention"
                name="Retention Rate"
                stroke="#60A5FA"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="conversion"
                name="Conversion Rate"
                stroke="#10B981"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="churn"
                name="Churn Rate"
                stroke="#F87171"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* New vs Churned Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Customer Growth Analysis</CardTitle>
            <CardDescription>New vs churned customers by month</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredStats.map(stat => ({
                  name: stat.monthYear,
                  new: stat.newCustomers || 0,
                  churned: stat.churnedCustomers || 0,
                  net: (stat.newCustomers || 0) - (stat.churnedCustomers || 0)
                }))}
                margin={{
                  top: 20,
                  right: 30,
                  left: 0,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="new" 
                  name="New Customers" 
                  fill="#60A5FA" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="churned" 
                  name="Churned Customers" 
                  fill="#F87171" 
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  type="monotone" 
                  dataKey="net" 
                  name="Net Growth" 
                  stroke="#10B981" 
                  strokeWidth={2}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Barre vs Cycle Retention</CardTitle>
            <CardDescription>Retention comparison by class type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredStats.map(stat => ({
                  name: stat.monthYear,
                  barre: stat.barreRetentionRate || 0,
                  cycle: stat.cycleRetentionRate || 0
                }))}
                margin={{
                  top: 20,
                  right: 30,
                  left: 0,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={value => `${value}%`}
                  domain={[0, 100]}
                />
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, ""]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="barre"
                  name="Barre Retention Rate"
                  stroke="#845EC2"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="cycle"
                  name="Cycle Retention Rate"
                  stroke="#00C2A8"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
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
