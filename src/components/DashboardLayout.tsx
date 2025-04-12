
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcessedData, ViewType } from "@/types/fitnessTypes";
import { BarChart, LineChart, PieChart, ActivityIcon, Users, IndianRupee, RefreshCw, Database, TableProperties, SearchIcon, ArrowUpRightSquare, ChevronDown, FilterIcon, MapPinIcon, Dumbbell } from "lucide-react";
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
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";

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

const LoadingMessages = ["Gathering Attendance...", "Compiling Report...", "Drawing Charts...", "Adding Filters...", "Adding J Factor..."];

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
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % LoadingMessages.length);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // You could implement actual search functionality here
  };

  // Extract unique locations for the filter
  const locations = React.useMemo(() => {
    if (!data?.rawData) return [];
    const uniqueLocations = new Set<string>();
    data.rawData.forEach(record => {
      if (record.Location) uniqueLocations.add(String(record.Location));
    });
    return Array.from(uniqueLocations);
  }, [data?.rawData]);

  // Extract unique trainers
  const uniqueTrainers = React.useMemo(() => {
    if (!data?.rawData) return [];
    const teachers = new Set<string>();
    data.rawData.forEach(record => {
      if (record["Teacher Name"]) teachers.add(String(record["Teacher Name"]));
    });
    return Array.from(teachers);
  }, [data?.rawData]);

  // Extract unique class types
  const uniqueClassTypes = React.useMemo(() => {
    if (!data?.rawData) return [];
    const types = new Set<string>();
    data.rawData.forEach(record => {
      // Check if record has Barre Sessions
      if (record["Barre Sessions"] && parseInt(String(record["Barre Sessions"])) > 0) {
        types.add("Barre");
      }

      // Check if record has Cycle Sessions
      if (record["Cycle Sessions"] && parseInt(String(record["Cycle Sessions"])) > 0) {
        types.add("Cycle");
      }
    });
    return Array.from(types);
  }, [data?.rawData]);
  
  // Select all trainers
  const selectAllTrainers = () => {
    setTrainers(uniqueTrainers);
  };

  // Clear all trainers
  const clearTrainers = () => {
    setTrainers([]);
  };

  // Select all class types
  const selectAllClassTypes = () => {
    setClassTypes(uniqueClassTypes);
  };

  // Clear all class types
  const clearClassTypes = () => {
    setClassTypes([]);
  };

  // Select all months
  const selectAllMonths = () => {
    setSelectedMonths(data?.monthlyStats.map(stat => stat.monthYear) || []);
  };

  // Clear all months
  const clearSelectedMonths = () => {
    setSelectedMonths([]);
  };

  console.log("DashboardLayout rendering with:", {
    hasData: !!data,
    isLoading,
    hasError: !!error,
    selectedMonths,
    location,
    uniqueTrainers: uniqueTrainers.length,
    uniqueClassTypes: uniqueClassTypes.length
  });
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="text-center premium-card p-8 rounded-xl animate-fade-in">
          <ActivityIcon className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h2 className="mt-4 text-2xl font-bold font-heading">{LoadingMessages[loadingMessageIndex]}</h2>
          <p className="mt-2 text-muted-foreground">Fetching data from Google Sheets</p>
        </div>
      </div>;
  }
  
  if (error) {
    return <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="text-center max-w-md mx-auto premium-card p-8 rounded-xl">
          <h2 className="text-2xl font-bold text-red-500">Error loading data</h2>
          <p className="mt-2 text-sm">{error.message}</p>
          <div className="mt-4 p-4 bg-red-50 rounded-md text-xs text-left overflow-auto max-h-60">
            <pre>{error.stack}</pre>
          </div>
        </div>
      </div>;
  }
  
  if (!data) {
    return <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="text-center premium-card p-8 rounded-xl">
          <h2 className="text-2xl font-bold">No data available</h2>
          <p className="mt-2 text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>;
  }

  // Calculate filter effects - for now it's just information display
  const totalRecords = data.rawData.length;
  const filteredCount = data.rawData.filter(record => (selectedMonths.length === 0 || selectedMonths.includes(String(record["Month Year"]))) && (location === "" || location === "all" || record.Location === location) && (trainers.length === 0 || record["Teacher Name"] && trainers.includes(String(record["Teacher Name"]))) && (classTypes.length === 0 || record["Barre Sessions"] && parseInt(String(record["Barre Sessions"])) > 0 && classTypes.includes("Barre") || record["Cycle Sessions"] && parseInt(String(record["Cycle Sessions"])) > 0 && classTypes.includes("Cycle"))).length;
  const filterPercentage = totalRecords > 0 ? Math.round(filteredCount / totalRecords * 100) : 0;
  
  return <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 pb-8 font-sans">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <EnhancedTitle />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-[280px]">
              <VoiceSearch onSearch={handleSearch} className="search-bar" />
            </div>
            <div className="flex-shrink-0">
              <ThemeToggle />
            </div>
            <Button variant="outline" size="icon" className="bg-background/70 backdrop-blur-sm flex-shrink-0">
              <ArrowUpRightSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <Card className="w-full card-glass backdrop-blur-sm border-opacity-30 shadow-lg overflow-hidden">
            <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-start">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 bg-background/70">
                      <FilterIcon className="h-4 w-4 text-primary" />
                      <span>Months</span>
                      <Badge className="ml-1 bg-primary hover:bg-primary">{selectedMonths.length || 'All'}</Badge>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px] p-2 rounded-lg shadow-lg backdrop-blur-sm bg-popover/95 animate-scale-in" onCloseAutoFocus={(e) => {
                    // Prevent the dropdown from closing when clicking inside
                    e.preventDefault();
                  }}>
                    <div className="flex justify-between px-2 py-1 border-b mb-1">
                      <button 
                        className="text-xs text-primary hover:text-primary/80 font-medium"
                        onClick={selectAllMonths}
                      >
                        Select All
                      </button>
                      <button 
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={clearSelectedMonths}
                      >
                        Clear
                      </button>
                    </div>
                    {data.monthlyStats.map(stat => <DropdownMenuItem key={stat.monthYear} className="flex items-center gap-2 rounded-md cursor-pointer" onClick={(e) => {
                    // Prevent the dropdown from closing
                    e.preventDefault();
                    
                    if (selectedMonths.includes(stat.monthYear)) {
                      setSelectedMonths(selectedMonths.filter(m => m !== stat.monthYear));
                    } else {
                      setSelectedMonths([...selectedMonths, stat.monthYear]);
                    }
                  }}>
                        <div className={`w-4 h-4 rounded border ${selectedMonths.includes(stat.monthYear) ? 'bg-primary border-primary' : 'border-muted-foreground'} flex items-center justify-center`}>
                          {selectedMonths.includes(stat.monthYear) && <div className="w-2 h-2 rounded-sm bg-primary-foreground" />}
                        </div>
                        <span>{stat.monthYear}</span>
                      </DropdownMenuItem>)}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2">
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="w-[150px] bg-background/70">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-primary" />
                      <SelectValue placeholder="All locations" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-lg shadow-lg backdrop-blur-sm bg-popover/95 animate-scale-in">
                    <SelectItem value="all">All locations</SelectItem>
                    {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 bg-background/70">
                      <Users className="h-4 w-4 text-primary" />
                      <span>Teachers</span>
                      <Badge className="ml-1 bg-primary hover:bg-primary">{trainers.length || 'All'}</Badge>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px] p-2 rounded-lg shadow-lg backdrop-blur-sm bg-popover/95 animate-scale-in max-h-[300px] overflow-y-auto" onCloseAutoFocus={(e) => {
                    // Prevent the dropdown from closing when clicking inside
                    e.preventDefault();
                  }}>
                    <div className="flex justify-between px-2 py-1 border-b mb-1">
                      <button 
                        className="text-xs text-primary hover:text-primary/80 font-medium"
                        onClick={selectAllTrainers}
                      >
                        Select All
                      </button>
                      <button 
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={clearTrainers}
                      >
                        Clear
                      </button>
                    </div>
                    {uniqueTrainers.map(teacher => <DropdownMenuItem key={teacher} className="flex items-center gap-2 rounded-md cursor-pointer" onClick={(e) => {
                    // Prevent the dropdown from closing
                    e.preventDefault();
                    
                    if (trainers.includes(teacher)) {
                      setTrainers(trainers.filter(t => t !== teacher));
                    } else {
                      setTrainers([...trainers, teacher]);
                    }
                  }}>
                        <div className={`w-4 h-4 rounded border ${trainers.includes(teacher) ? 'bg-primary border-primary' : 'border-muted-foreground'} flex items-center justify-center`}>
                          {trainers.includes(teacher) && <div className="w-2 h-2 rounded-sm bg-primary-foreground" />}
                        </div>
                        <span>{teacher}</span>
                      </DropdownMenuItem>)}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 bg-background/70">
                      <ActivityIcon className="h-4 w-4 text-primary" />
                      <span>Class Types</span>
                      <Badge className="ml-1 bg-primary hover:bg-primary">{classTypes.length || 'All'}</Badge>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px] p-2 rounded-lg shadow-lg backdrop-blur-sm bg-popover/95 animate-scale-in" onCloseAutoFocus={(e) => {
                    // Prevent the dropdown from closing when clicking inside
                    e.preventDefault();
                  }}>
                    <div className="flex justify-between px-2 py-1 border-b mb-1">
                      <button 
                        className="text-xs text-primary hover:text-primary/80 font-medium"
                        onClick={selectAllClassTypes}
                      >
                        Select All
                      </button>
                      <button 
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={clearClassTypes}
                      >
                        Clear
                      </button>
                    </div>
                    {uniqueClassTypes.map(type => <DropdownMenuItem key={type} className="flex items-center gap-2 rounded-md cursor-pointer" onClick={(e) => {
                    // Prevent the dropdown from closing
                    e.preventDefault();
                    
                    if (classTypes.includes(type)) {
                      setClassTypes(classTypes.filter(t => t !== type));
                    } else {
                      setClassTypes([...classTypes, type]);
                    }
                  }}>
                        <div className={`w-4 h-4 rounded border ${classTypes.includes(type) ? 'bg-primary border-primary' : 'border-muted-foreground'} flex items-center justify-center`}>
                          {classTypes.includes(type) && <div className="w-2 h-2 rounded-sm bg-primary-foreground" />}
                        </div>
                        <span>{type}</span>
                      </DropdownMenuItem>)}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {(selectedMonths.length > 0 || location !== "" || trainers.length > 0 || classTypes.length > 0) && <Button variant="ghost" size="sm" onClick={() => {
              setSelectedMonths([]);
              setLocation("");
              setTrainers([]);
              setClassTypes([]);
            }} className="ml-auto text-xs text-muted-foreground hover:text-foreground">
                  Clear all filters
                </Button>}
            </CardContent>
          </Card>
        </div>

        <Tabs value={currentView} onValueChange={value => setCurrentView(value as ViewType)} className="space-y-4">
          <div className="bg-card/70 backdrop-blur-xl rounded-lg p-1 border border-border/50 sticky top-4 z-10 shadow-md">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-7">
              <TabsTrigger value="overview" className="flex items-center gap-2 transition-all duration-300">
                <BarChart className="h-4 w-4" />
                <span className="hidden md:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="teachers" className="flex items-center gap-2 transition-all duration-300">
                <Users className="h-4 w-4" />
                <span className="hidden md:inline">Teachers</span>
              </TabsTrigger>
              <TabsTrigger value="classes" className="flex items-center gap-2 transition-all duration-300">
                <ActivityIcon className="h-4 w-4" />
                <span className="hidden md:inline">Classes</span>
              </TabsTrigger>
              <TabsTrigger value="financials" className="flex items-center gap-2 transition-all duration-300">
                <IndianRupee className="h-4 w-4" />
                <span className="hidden md:inline">Financials</span>
              </TabsTrigger>
              <TabsTrigger value="retention" className="flex items-center gap-2 transition-all duration-300">
                <RefreshCw className="h-4 w-4" />
                <span className="hidden md:inline">Retention</span>
              </TabsTrigger>
              <TabsTrigger value="tables" className="flex items-center gap-2 transition-all duration-300">
                <Database className="h-4 w-4" />
                <span className="hidden md:inline">Tables</span>
              </TabsTrigger>
              <TabsTrigger value="pivot" className="flex items-center gap-2 transition-all duration-300">
                <TableProperties className="h-4 w-4" />
                <span className="hidden md:inline">Pivot</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {searchQuery ? <div className="p-8 text-center premium-card rounded-xl">
              <h2 className="text-2xl font-bold mb-4">Search Results for "{searchQuery}"</h2>
              <p className="text-muted-foreground">
                Showing results across all dashboard sections. 
                <Button variant="link" onClick={() => setSearchQuery("")}>Clear search</Button>
              </p>
            </div> : <>
              <TabsContent value="overview" className="space-y-4 animate-fade-in">
                <OverviewView data={data} selectedMonths={selectedMonths} location={location} />
              </TabsContent>

              <TabsContent value="teachers" className="space-y-4 animate-fade-in">
                <TeachersView data={data} selectedMonths={selectedMonths} location={location} />
              </TabsContent>

              <TabsContent value="classes" className="space-y-4 animate-fade-in">
                <ClassesView data={data} selectedMonths={selectedMonths} location={location} />
              </TabsContent>

              <TabsContent value="financials" className="space-y-4 animate-fade-in">
                <FinancialsView data={data} selectedMonths={selectedMonths} location={location} />
              </TabsContent>

              <TabsContent value="retention" className="space-y-4 animate-fade-in">
                <RetentionView data={data} selectedMonths={selectedMonths} location={location} />
              </TabsContent>

              <TabsContent value="tables" className="space-y-4 animate-fade-in">
                <TablesView data={data} selectedMonths={selectedMonths} location={location} />
              </TabsContent>
              
              <TabsContent value="pivot" className="space-y-4 animate-fade-in">
                <PivotTableView data={data.rawData} selectedMonths={selectedMonths} location={location} />
              </TabsContent>
            </>}
        </Tabs>
      </div>
    </div>;
};

export default DashboardLayout;
