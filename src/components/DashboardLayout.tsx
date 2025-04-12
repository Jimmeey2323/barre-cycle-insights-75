
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcessedData, ViewType } from "@/types/fitnessTypes";
import { 
  BarChart, LineChart, PieChart, ActivityIcon, Users, IndianRupee, 
  RefreshCw, Database, TableProperties, SearchIcon, ArrowUpRightSquare 
} from "lucide-react";
import OverviewView from "./views/OverviewView";
import TeachersView from "./views/TeachersView";
import ClassesView from "./views/ClassesView";
import FinancialsView from "./views/FinancialsView";
import RetentionView from "./views/RetentionView";
import TablesView from "./views/TablesView";
import PivotTableView from "./views/PivotTableView";
import EnhancedFilters from "./EnhancedFilters";
import EnhancedTitle from "./EnhancedTitle";
import VoiceSearch from "./VoiceSearch";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [trainers, setTrainers] = useState<string[]>([]);
  const [classTypes, setClassTypes] = useState<string[]>([]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // You could implement actual search functionality here
  };

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

  // Calculate filter effects - for now it's just information display
  const totalRecords = data.rawData.length;
  const filteredCount = data.rawData.filter(record => 
    (selectedMonths.length === 0 || selectedMonths.includes(record["Month Year"])) &&
    (location === "" || location === "all" || record.Location === location) &&
    (trainers.length === 0 || trainers.includes(record.Teacher)) &&
    (classTypes.length === 0 || classTypes.includes(record.Type))
  ).length;
  
  const filterPercentage = totalRecords > 0 ? Math.round((filteredCount / totalRecords) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start gap-4">
          <EnhancedTitle />
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <VoiceSearch onSearch={handleSearch} />
            
            <Button 
              variant="outline" 
              size="icon"
              className="bg-background/70 backdrop-blur-sm"
            >
              <ArrowUpRightSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <Card className="card-glass backdrop-blur-sm border-opacity-30">
            <CardContent className="pt-6">
              {data && (
                <EnhancedFilters 
                  data={data}
                  selectedMonths={selectedMonths}
                  setSelectedMonths={setSelectedMonths}
                  location={location}
                  setLocation={setLocation}
                  trainers={trainers}
                  setTrainers={setTrainers}
                  classTypes={classTypes}
                  setClassTypes={setClassTypes}
                />
              )}
            </CardContent>
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

          {searchQuery ? (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Search Results for "{searchQuery}"</h2>
              <p className="text-muted-foreground">
                Showing results across all dashboard sections. 
                <Button variant="link" onClick={() => setSearchQuery("")}>Clear search</Button>
              </p>
            </div>
          ) : (
            <>
              <TabsContent value="overview" className="space-y-4">
                <OverviewView data={data} selectedMonths={selectedMonths} location={location} />
              </TabsContent>

              <TabsContent value="teachers" className="space-y-4">
                <TeachersView data={data} selectedMonths={selectedMonths} location={location} />
              </TabsContent>

              <TabsContent value="classes" className="space-y-4">
                <ClassesView data={data} selectedMonths={selectedMonths} location={location} />
              </TabsContent>

              <TabsContent value="financials" className="space-y-4">
                <FinancialsView data={data} selectedMonths={selectedMonths} location={location} />
              </TabsContent>

              <TabsContent value="retention" className="space-y-4">
                <RetentionView data={data} selectedMonths={selectedMonths} location={location} />
              </TabsContent>

              <TabsContent value="tables" className="space-y-4">
                <TablesView data={data} selectedMonths={selectedMonths} location={location} />
              </TabsContent>
              
              <TabsContent value="pivot" className="space-y-4">
                <PivotTableView data={data} selectedMonths={selectedMonths} location={location} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardLayout;
