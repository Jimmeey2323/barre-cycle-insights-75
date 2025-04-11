
import React, { useState, useEffect } from "react";
import { ProcessedData, ViewType } from "@/types/fitnessTypes";
import { useToast } from "@/components/ui/use-toast";
import { fetchSheetData, processFitnessData } from "@/services/googleSheetsService";
import DashboardLayout from "@/components/DashboardLayout";

const SPREADSHEET_ID = "1JG6yAClbjr3iF1kapJHS-pf0G539afUpo-OdcMylnOI";
const SHEET_NAME = "◉ Payroll";

const Index = () => {
  const [data, setData] = useState<ProcessedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  const [currentView, setCurrentView] = useState<ViewType>("overview");
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [location, setLocation] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Starting data fetch process...");
        setIsLoading(true);
        setError(null);
        
        // Fetch data from Google Sheets
        const sheetData = await fetchSheetData(SPREADSHEET_ID, SHEET_NAME);
        console.log(`Sheet data fetched: ${sheetData?.length} rows`);
        
        if (!sheetData || sheetData.length === 0) {
          throw new Error("No data received from Google Sheets");
        }
        
        // Process the data into the format we need
        const processedData = processFitnessData(sheetData);
        console.log("Processed data result:", processedData ? "success" : "null");
        
        if (!processedData) {
          throw new Error("Failed to process fitness data");
        }
        
        console.log("Setting data in state, with monthly stats:", processedData.monthlyStats.length);
        setData(processedData);
        
        // Auto-select the last 3 months or all if less than 3
        if (processedData.monthlyStats.length > 0) {
          const allMonths = processedData.monthlyStats.map(stat => stat.monthYear);
          console.log("Available months:", allMonths);
          
          const sortedMonths = [...allMonths].sort((a, b) => {
            // Parse "MMM-YYYY" format
            const [aMonth, aYear] = a.split('-');
            const [bMonth, bYear] = b.split('-');
            
            const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            
            const yearComparison = Number(aYear) - Number(bYear);
            if (yearComparison !== 0) return yearComparison;
            
            return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
          });
          
          // Get last 3 months (most recent)
          const monthsToSelect = sortedMonths.slice(-3);
          console.log("Auto-selecting months:", monthsToSelect);
          
          // Set selected months
          setSelectedMonths(monthsToSelect);
        }
        
        // Show a success toast
        toast({
          title: "Data loaded successfully",
          description: `Loaded ${processedData.rawData.length} records across ${processedData.monthlyStats.length} months.`,
        });
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setData(null);
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: err instanceof Error ? err.message : String(err),
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Initial data load
    loadData();
  }, [toast]);

  console.log("Index rendering with data:", data ? "available" : "null", "isLoading:", isLoading);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardLayout
        data={data}
        isLoading={isLoading}
        error={error}
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedMonths={selectedMonths}
        setSelectedMonths={setSelectedMonths}
        location={location}
        setLocation={setLocation}
      />
    </div>
  );
};

export default Index;
