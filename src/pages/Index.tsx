
import React, { useState, useEffect } from "react";
import { ProcessedData, ViewType } from "@/types/fitnessTypes";
import { useToast } from "@/components/ui/use-toast";
import { fetchSheetData, processFitnessData } from "@/services/googleSheetsService";
import DashboardLayout from "@/components/DashboardLayout";
import { ActivityIcon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const SPREADSHEET_ID = "1JG6yAClbjr3iF1kapJHS-pf0G539afUpo-OdcMylnOI";
const SHEET_NAME = "◉ Payroll";

const LOADING_MESSAGES = [
  "Gathering Attendance",
  "Compiling Report",
  "Drawing Charts",
  "Adding Filters",
  "Adding J Factor"
];

const Index = () => {
  const [data, setData] = useState<ProcessedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const { theme } = useTheme();
  
  // Include 'pivot' in the ViewType
  const [currentView, setCurrentView] = useState<ViewType>("overview");
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [location, setLocation] = useState("all");

  // Cycle through loading messages
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isLoading]);

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
        
        // Load last view from local storage if available
        const lastView = localStorage.getItem("fitnessAppLastView");
        if (lastView && ["overview", "teachers", "classes", "financials", "retention", "tables", "pivot"].includes(lastView)) {
          setCurrentView(lastView as ViewType);
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
  
  // Save current view to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("fitnessAppLastView", currentView);
  }, [currentView]);

  console.log("Index rendering with data:", data ? "available" : "null", "isLoading:", isLoading);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="text-center premium-card p-8 rounded-xl animate-fade-in">
          <ActivityIcon className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h2 className="mt-4 text-2xl font-bold font-heading animate-pulse">
            {LOADING_MESSAGES[loadingMessageIndex]}...
          </h2>
          <p className="mt-2 text-muted-foreground">Making your data beautiful</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
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
