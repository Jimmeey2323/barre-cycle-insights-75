
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcessedData, ViewType } from "@/types/fitnessTypes";
import { BarChart, LineChart, PieChart, ActivityIcon, Users, IndianRupee, RefreshCw, Database, TableProperties } from "lucide-react";
import OverviewView from "./views/OverviewView";
import TeachersView from "./views/TeachersView";
import ClassesView from "./views/ClassesView";
import FinancialsView from "./views/FinancialsView";
import RetentionView from "./views/RetentionView";
import TablesView from "./views/TablesView";
import PivotTableView from "./views/PivotTableView";
import FilterControls from "./FilterControls";

interface DashboardLayoutProps {
  data: ProcessedData | null;
  isLoading: boolean;
  error: Error | null;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedMonths: string[];
  setSelectedMonths: (months: string[]) => void;
  location: string;
  setLocation: (location: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  data,
  isLoading,
  error,
  currentView,
  setCurrentView,
  selectedMonths,
  setSelectedMonths,
  location,
  setLocation
}) => {
  console.log("DashboardLayout rendering with:", { 
    hasData: !!data, 
    isLoading, 
    hasError: !!error,
    selectedMonths,
    location
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="text-center card-glass p-8 rounded-xl animate-fade-in">
          <ActivityIcon className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h2 className="mt-4 text-xl font-semibold">Loading fitness data...</h2>
          <p className="mt-2 text-muted-foreground">Fetching data from Google Sheets</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="text-center max-w-md mx-auto card-glass p-8 rounded-xl">
          <h2 className="text-xl font-semibold text-red-500">Error loading data</h2>
          <p className="mt-2 text-sm">{error.message}</p>
          <div className="mt-4 p-4 bg-red-50 rounded-md text-xs text-left overflow-auto max-h-60">
            <pre>{error.stack}</pre>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="text-center card-glass p-8 rounded-xl">
          <h2 className="text-xl font-semibold">No data available</h2>
          <p className="mt-2 text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const allMonths = data.monthlyStats.map(stat => stat.monthYear);
  console.log("Available months for filtering:", allMonths);
  
  // Get actual filtered location
  const actualLocation = location === "all" ? "" : location;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            <span className="text-gradient-barre">Barre</span> vs <span className="text-gradient-cycle">Cycle</span> Analytics
          </h1>
          <p className="text-muted-foreground">
            Interactive analytics dashboard for fitness program performance metrics
          </p>
        </div>

        <div className="mb-6">
          <Card className="card-glass backdrop-blur-sm border-opacity-30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                <FilterControls 
                  allMonths={allMonths} 
                  selectedMonths={selectedMonths} 
                  setSelectedMonths={setSelectedMonths}
                  location={location}
                  setLocation={setLocation}
                  data={data}
                />
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewType)} className="space-y-4">
          <div className="bg-card/80 backdrop-blur-sm rounded-lg p-1 border border-border/50 sticky top-4 z-10 shadow-md">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-7">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                <span className="hidden md:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="teachers" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden md:inline">Teachers</span>
              </TabsTrigger>
              <TabsTrigger value="classes" className="flex items-center gap-2">
                <ActivityIcon className="h-4 w-4" />
                <span className="hidden md:inline">Classes</span>
              </TabsTrigger>
              <TabsTrigger value="financials" className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                <span className="hidden md:inline">Financials</span>
              </TabsTrigger>
              <TabsTrigger value="retention" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span className="hidden md:inline">Retention</span>
              </TabsTrigger>
              <TabsTrigger value="tables" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="hidden md:inline">Tables</span>
              </TabsTrigger>
              <TabsTrigger value="pivot" className="flex items-center gap-2">
                <TableProperties className="h-4 w-4" />
                <span className="hidden md:inline">Pivot</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <OverviewView data={data} selectedMonths={selectedMonths} location={actualLocation} />
          </TabsContent>

          <TabsContent value="teachers" className="space-y-4">
            <TeachersView data={data} selectedMonths={selectedMonths} location={actualLocation} />
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            <ClassesView data={data} selectedMonths={selectedMonths} location={actualLocation} />
          </TabsContent>

          <TabsContent value="financials" className="space-y-4">
            <FinancialsView data={data} selectedMonths={selectedMonths} location={actualLocation} />
          </TabsContent>

          <TabsContent value="retention" className="space-y-4">
            <RetentionView data={data} selectedMonths={selectedMonths} location={actualLocation} />
          </TabsContent>

          <TabsContent value="tables" className="space-y-4">
            <TablesView data={data} selectedMonths={selectedMonths} location={actualLocation} />
          </TabsContent>
          
          <TabsContent value="pivot" className="space-y-4">
            <PivotTableView data={data} selectedMonths={selectedMonths} location={actualLocation} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardLayout;
