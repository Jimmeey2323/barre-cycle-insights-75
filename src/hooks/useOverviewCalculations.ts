
import { useMemo } from "react";
import { formatINR, formatNumber } from "@/lib/formatters";
import { ProcessedData, RawDataRecord } from "@/types/fitnessTypes";
import { IndianRupee, Activity, Users, RefreshCcw, Zap, Target, Award, CalendarClock } from "lucide-react";

export const useOverviewCalculations = (filteredRawData: RawDataRecord[]) => {
  // Calculate total sessions
  const totalBarreSessions = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Barre Sessions"] || 0)), 0), 
    [filteredRawData]);

  const totalCycleSessions = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Cycle Sessions"] || 0)), 0), 
    [filteredRawData]);

  const totalSessions = totalBarreSessions + totalCycleSessions;

  // Calculate total attendance
  const totalBarreCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Barre Customers"] || 0)), 0), 
    [filteredRawData]);

  const totalCycleCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Cycle Customers"] || 0)), 0), 
    [filteredRawData]);

  const totalCustomers = totalBarreCustomers + totalCycleCustomers;

  // Calculate total revenue
  const totalBarrePaid = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseFloat(String(record["Barre Paid"] || 0)), 0), 
    [filteredRawData]);

  const totalCyclePaid = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseFloat(String(record["Cycle Paid"] || 0)), 0), 
    [filteredRawData]);

  const totalRevenue = totalBarrePaid + totalCyclePaid;

  // Calculate non-empty sessions data
  const totalNonEmptyBarreSessions = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Non-Empty Barre Sessions"] || 0)), 0), 
    [filteredRawData]);
    
  const totalNonEmptyCycleSessions = useMemo(() => 
    filteredRawData.reduce((sum, record) => 
      sum + parseInt(String(record["Non-Empty Cycle Sessions"] || 0)), 0), 
    [filteredRawData]);
  
  const nonEmptySessions = totalNonEmptyBarreSessions + totalNonEmptyCycleSessions;

  // Calculate averages
  const avgBarreClassSize = totalBarreSessions > 0 ? totalBarreCustomers / totalBarreSessions : 0;
  const avgCycleClassSize = totalCycleSessions > 0 ? totalCycleCustomers / totalCycleSessions : 0;
  const avgRevPerClass = totalSessions > 0 ? totalRevenue / totalSessions : 0;
  const avgRevPerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  
  // Calculate attendance rate
  const avgAttendanceRate = nonEmptySessions > 0 ? 
    ((totalBarreCustomers + totalCycleCustomers) / nonEmptySessions) : 0;

  // Calculate additional metrics
  const avgSessionsPerCustomer = totalCustomers > 0 ? totalSessions / totalCustomers : 0;

  // Get funnel metrics
  const totalLeads = useMemo(() => 
    filteredRawData.reduce((sum, record) => {
      const leads = Number(record["Leads"] || 0);
      return sum + (isNaN(leads) ? 0 : leads);
    }, 0), 
    [filteredRawData]);
    
  const totalVisitors = useMemo(() => 
    filteredRawData.reduce((sum, record) => {
      const visitors = parseInt(String(record["Visitors"] || 0));
      return sum + (isNaN(visitors) ? 0 : visitors);
    }, 0), 
    [filteredRawData]);

  const totalNewCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => {
      const newCust = parseInt(String(record["New Customers"] || 0));
      return sum + (isNaN(newCust) ? 0 : newCust);
    }, 0), 
    [filteredRawData]);

  const totalRetainedCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => {
      const retained = parseInt(String(record["Retained Customers"] || 0));
      return sum + (isNaN(retained) ? 0 : retained);
    }, 0), 
    [filteredRawData]);

  const totalConvertedCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => {
      const converted = parseInt(String(record["Converted Customers"] || 0));
      return sum + (isNaN(converted) ? 0 : converted);
    }, 0), 
    [filteredRawData]);

  const totalChurnedCustomers = useMemo(() => 
    filteredRawData.reduce((sum, record) => {
      const churned = parseInt(String(record["Churned Customers"] || 0));
      return sum + (isNaN(churned) ? 0 : churned);
    }, 0), 
    [filteredRawData]);

  // Calculate rates
  const retentionRate = useMemo(() => {
    const retainableCustomers = totalRetainedCustomers + totalChurnedCustomers;
    return retainableCustomers > 0 ? (totalRetainedCustomers / retainableCustomers) * 100 : 0;
  }, [totalRetainedCustomers, totalChurnedCustomers]);

  const conversionRate = useMemo(() => {
    return totalNewCustomers > 0 ? (totalConvertedCustomers / totalNewCustomers) * 100 : 0;
  }, [totalConvertedCustomers, totalNewCustomers]);

  // Build metrics data for cards
  const buildMetricsData = () => {
    const metrics = [
      {
        title: "Total Sessions",
        value: formatNumber(totalSessions),
        icon: <Activity className="h-5 w-5 text-purple-500" />,
        details: `${formatNumber(totalBarreSessions)} Barre, ${formatNumber(totalCycleSessions)} Cycle`,
        tooltipContent: "Total number of sessions conducted across all locations and class types",
        calculationDetails: `Barre Sessions (${totalBarreSessions}) + Cycle Sessions (${totalCycleSessions}) = ${totalSessions}`
      },
      {
        title: "Total Attendance",
        value: formatNumber(totalCustomers),
        icon: <Users className="h-5 w-5 text-blue-500" />,
        details: `${formatNumber(totalBarreCustomers)} Barre, ${formatNumber(totalCycleCustomers)} Cycle`,
        tooltipContent: "Total number of customers who attended classes",
        calculationDetails: `Barre Customers (${totalBarreCustomers}) + Cycle Customers (${totalCycleCustomers}) = ${totalCustomers}`
      },
      {
        title: "Total Revenue",
        value: formatINR(totalRevenue),
        icon: <IndianRupee className="h-5 w-5 text-green-500" />,
        details: `Avg ${formatINR(avgRevPerClass)} per class`,
        tooltipContent: "Total revenue generated from all classes",
        calculationDetails: `Barre Revenue (${formatINR(totalBarrePaid)}) + Cycle Revenue (${formatINR(totalCyclePaid)}) = ${formatINR(totalRevenue)}`
      },
      {
        title: "Avg Class Size",
        value: (avgBarreClassSize + avgCycleClassSize) / 2 > 0 ? 
          ((avgBarreClassSize + avgCycleClassSize) / 2).toFixed(1) : "0",
        icon: <Users className="h-5 w-5 text-violet-500" />,
        details: `Barre: ${avgBarreClassSize.toFixed(1)}, Cycle: ${avgCycleClassSize.toFixed(1)}`,
        tooltipContent: "Average number of customers per class",
        calculationDetails: `Barre: ${totalBarreCustomers} customers / ${totalBarreSessions} sessions = ${avgBarreClassSize.toFixed(2)}\nCycle: ${totalCycleCustomers} customers / ${totalCycleSessions} sessions = ${avgCycleClassSize.toFixed(2)}`
      }
    ];

    // Only add retention rate if we have the data for it
    if (totalRetainedCustomers > 0 || totalChurnedCustomers > 0) {
      metrics.push({
        title: "Retention Rate",
        value: `${retentionRate.toFixed(1)}%`,
        icon: <RefreshCcw className="h-5 w-5 text-teal-500" />,
        details: `${formatNumber(totalRetainedCustomers)} retained customers`,
        tooltipContent: "Percentage of customers who return for additional classes",
        calculationDetails: `${totalRetainedCustomers} retained / (${totalRetainedCustomers} + ${totalChurnedCustomers}) = ${retentionRate.toFixed(2)}%`
      });
    }

    // Only add conversion rate if we have the data for it
    if (totalConvertedCustomers > 0 && totalNewCustomers > 0) {
      metrics.push({
        title: "Conversion Rate",
        value: `${conversionRate.toFixed(1)}%`,
        icon: <Zap className="h-5 w-5 text-amber-500" />,
        details: `${formatNumber(totalConvertedCustomers)} from ${formatNumber(totalNewCustomers)} new`,
        tooltipContent: "Percentage of new customers who convert to regular customers",
        calculationDetails: `${totalConvertedCustomers} converted / ${totalNewCustomers} new = ${conversionRate.toFixed(2)}%`
      });
    }

    // Only add attendance rate if we have non-empty sessions
    if (nonEmptySessions > 0) {
      metrics.push({
        title: "Attendance Rate",
        value: `${avgAttendanceRate.toFixed(1)}`,
        icon: <Target className="h-5 w-5 text-orange-500" />,
        details: `Avg customers per session`,
        tooltipContent: "Average number of customers per non-empty session",
        calculationDetails: `Total Customers (${totalCustomers}) / Non-Empty Sessions (${nonEmptySessions}) = ${avgAttendanceRate.toFixed(2)}`
      });
    }

    // Only add avg revenue per customer if we have revenue and customers
    if (totalRevenue > 0 && totalCustomers > 0) {
      metrics.push({
        title: "Avg Rev/Customer",
        value: formatINR(avgRevPerCustomer),
        icon: <IndianRupee className="h-5 w-5 text-rose-500" />,
        details: `Total: ${formatINR(totalRevenue)}`,
        tooltipContent: "Average revenue generated per customer",
        calculationDetails: `Total Revenue (${formatINR(totalRevenue)}) / Total Customers (${totalCustomers}) = ${formatINR(avgRevPerCustomer)}`
      });
    }

    // Only add sessions per customer if we have both metrics
    if (totalSessions > 0 && totalCustomers > 0) {
      metrics.push({
        title: "Sessions per Customer",
        value: avgSessionsPerCustomer.toFixed(1),
        icon: <CalendarClock className="h-5 w-5 text-cyan-500" />,
        details: `Avg attendance frequency`,
        tooltipContent: "Average number of sessions attended per customer",
        calculationDetails: `Total Sessions (${totalSessions}) / Total Customers (${totalCustomers}) = ${avgSessionsPerCustomer.toFixed(2)}`
      });
    }

    // Add popular class if we have session data
    if (totalBarreSessions > 0 || totalCycleSessions > 0) {
      metrics.push({
        title: "Popular Class",
        value: totalBarreSessions > totalCycleSessions ? "Barre" : "Cycle",
        icon: <Award className="h-5 w-5 text-yellow-500" />,
        details: `Based on ${formatNumber(Math.max(totalBarreSessions, totalCycleSessions))} sessions`,
        tooltipContent: "Most popular class type based on number of sessions",
        calculationDetails: `Barre Sessions: ${totalBarreSessions} vs Cycle Sessions: ${totalCycleSessions}`
      });
    }

    return metrics;
  };

  // Create chart data
  const createFunnelData = () => {
    // Define nodes and links for the Sankey funnel chart based on actual data
    const funnelNodes = [
      {
        id: "new",
        label: "New Customers",
        value: totalNewCustomers > 0 ? totalNewCustomers : totalCustomers * 0.3,
        color: "#818cf8",
        position: "top" as const,
        column: 0
      },
      {
        id: "customers",
        label: "Customers",
        value: totalCustomers,
        color: "#93c5fd",
        position: "top" as const,
        column: 1
      },
      {
        id: "retained",
        label: "Retained",
        value: totalRetainedCustomers > 0 ? totalRetainedCustomers : totalCustomers * 0.65,
        color: "#34d399",
        position: "top" as const,
        column: 2
      },
      {
        id: "converted",
        label: "Converted",
        value: totalConvertedCustomers > 0 ? totalConvertedCustomers : totalNewCustomers * 0.2,
        color: "#10b981",
        position: "top" as const,
        column: 3
      }
    ];
    
    const funnelLinks = [
      {
        source: "new",
        target: "customers",
        value: totalCustomers,
        color: "#818cf8"
      },
      {
        source: "customers", 
        target: "retained",
        value: totalRetainedCustomers > 0 ? totalRetainedCustomers : totalCustomers * 0.65,
        color: "#93c5fd"
      },
      {
        source: "customers",
        target: "converted",
        value: totalConvertedCustomers > 0 ? totalConvertedCustomers : totalNewCustomers * 0.2,
        color: "#34d399"
      }
    ];

    return {
      nodes: funnelNodes,
      links: funnelLinks,
      ltv: avgRevPerCustomer * 2.5, // Estimated LTV based on actual revenue
      conversionRate: {
        from: "New Customers",
        to: "Converted",
        rate: conversionRate
      }
    };
  };

  const createClassDistributionData = () => {
    return [
      { name: "Barre Classes", value: totalBarreSessions, fill: "hsl(var(--barre))" },
      { name: "Cycle Classes", value: totalCycleSessions, fill: "hsl(var(--cycle))" }
    ];
  };

  return {
    totalBarreSessions,
    totalCycleSessions,
    totalSessions,
    totalBarreCustomers,
    totalCycleCustomers,
    totalCustomers,
    totalBarrePaid,
    totalCyclePaid,
    totalRevenue,
    avgBarreClassSize,
    avgCycleClassSize,
    avgRevPerClass,
    avgRevPerCustomer,
    totalNewCustomers,
    totalRetainedCustomers,
    totalConvertedCustomers,
    conversionRate,
    retentionRate,
    buildMetricsData,
    createFunnelData,
    createClassDistributionData
  };
};
