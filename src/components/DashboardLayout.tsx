
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcessedData, ViewType } from "@/types/fitnessTypes";
import { BarChart, LineChart, PieChart, ActivityIcon, Users, DollarSign, RefreshCw } from "lucide-react";
import OverviewView from "./views/OverviewView";
import TeachersView from "./views/TeachersView";
import ClassesView from "./views/ClassesView";
import FinancialsView from "./views/FinancialsView";
import RetentionView from "./views/RetentionView";
import MonthSelector from "./MonthSelector";
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
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <ActivityIcon className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h2 className="mt-4 text-xl font-semibold">Loading fitness data...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-500">Error loading data</h2>
          <p className="mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No data available</h2>
        </div>
      </div>
    );
  }

  const allMonths = data.monthlyStats.map(stat => stat.monthYear);

  return (
    <div className="container mx-auto my-8 px-4">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          <span className="text-barre">Barre</span> vs <span className="text-cycle-dark">Cycle</span> Insights
        </h1>
        <p className="text-muted-foreground">
          Analyze and compare performance metrics across both fitness programs
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <Card className="flex-1">
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
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
            <DollarSign className="h-4 w-4" />
            <span className="hidden md:inline">Financials</span>
          </TabsTrigger>
          <TabsTrigger value="retention" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden md:inline">Retention</span>
          </TabsTrigger>
        </TabsList>

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
      </Tabs>
    </div>
  );
};

export default DashboardLayout;
