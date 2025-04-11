
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
        setIsLoading(true);
        const sheetData = await fetchSheetData(SPREADSHEET_ID, SHEET_NAME);
        const processedData = processFitnessData(sheetData);
        
        setData(processedData);
        
        // Auto-select the last 3 months or all if less than 3
        if (processedData && processedData.monthlyStats.length > 0) {
          const allMonths = processedData.monthlyStats.map(stat => stat.monthYear);
          const sortedMonths = [...allMonths].sort((a, b) => {
            // Parse "MMM-YYYY" format
            const [aMonth, aYear] = a.split('-');
            const [bMonth, bYear] = b.split('-');
            
            const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            
            const yearComparison = Number(aYear) - Number(bYear);
            if (yearComparison !== 0) return yearComparison;
            
            return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
          });
          
          const monthsToSelect = sortedMonths.slice(-3); // Get last 3 months
          setSelectedMonths(monthsToSelect);
        }
        
        toast({
          title: "Data loaded successfully",
          description: "Fitness metrics have been loaded.",
        });
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: err instanceof Error ? err.message : String(err),
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

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
