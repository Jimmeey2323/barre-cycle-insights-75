
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData } from "@/types/fitnessTypes";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowDown, ArrowUp, ChevronsUpDown, Download, Filter, MoreHorizontal, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";

interface TablesViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const TablesView: React.FC<TablesViewProps> = ({ data, selectedMonths, location }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("Month Year");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeTable, setActiveTable] = useState<"rawData" | "monthlyStats">("rawData");
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Extract unique teachers and class types
  const teachers = useMemo(() => {
    const uniqueTeachers = new Set<string>();
    data.rawData.forEach(record => {
      if (record.Teacher) uniqueTeachers.add(String(record.Teacher));
    });
    return Array.from(uniqueTeachers);
  }, [data.rawData]);
  
  const classTypes = useMemo(() => {
    const uniqueTypes = new Set<string>();
    data.rawData.forEach(record => {
      if (record.Type) uniqueTypes.add(String(record.Type));
    });
    return Array.from(uniqueTypes);
  }, [data.rawData]);

  // Convert teachers and types to option format for MultiSelect
  const teacherOptions = useMemo(() => 
    teachers.map(teacher => ({ label: teacher, value: teacher })),
  [teachers]);
  
  const typeOptions = useMemo(() => 
    classTypes.map(type => ({ label: type, value: type })),
  [classTypes]);

  // Filter data based on selected months, location, teachers, types and search query
  const filteredRawData = useMemo(() => {
    return data.rawData.filter(record =>
      (selectedMonths.length === 0 || selectedMonths.includes(String(record["Month Year"]))) &&
      (location === "" || location === "all" || record.Location === location) &&
      (selectedTeachers.length === 0 || (record.Teacher && selectedTeachers.includes(String(record.Teacher)))) &&
      (selectedTypes.length === 0 || (record.Type && selectedTypes.includes(String(record.Type)))) &&
      Object.values(record).some(value =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data.rawData, selectedMonths, location, searchQuery, selectedTeachers, selectedTypes]);

  const filteredMonthlyStats = useMemo(() => {
    return data.monthlyStats.filter(stat =>
      (selectedMonths.length === 0 || selectedMonths.includes(stat.monthYear)) &&
      Object.values(stat).some(value =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data.monthlyStats, selectedMonths, searchQuery]);

  // Sort data
  const sortedRawData = useMemo(() => {
    return [...filteredRawData].sort((a, b) => {
      const aValue = a[sortColumn as keyof typeof a];
      const bValue = b[sortColumn as keyof typeof b];
      
      // Handle numerical sorting
      if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
        return sortDirection === "asc" 
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }
      
      // Handle string sorting
      const aStr = String(aValue || "");
      const bStr = String(bValue || "");
      
      return sortDirection === "asc" 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredRawData, sortColumn, sortDirection]);

  const sortedMonthlyStats = useMemo(() => {
    return [...filteredMonthlyStats].sort((a, b) => {
      const aValue = a[sortColumn as keyof typeof a];
      const bValue = b[sortColumn as keyof typeof b];
      
      // Handle numerical sorting
      if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
        return sortDirection === "asc" 
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }
      
      // Handle string sorting
      const aStr = String(aValue || "");
      const bStr = String(bValue || "");
      
      return sortDirection === "asc" 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredMonthlyStats, sortColumn, sortDirection]);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  
  const handleExportCSV = () => {
    const data = activeTable === "rawData" ? sortedRawData : sortedMonthlyStats;
    if (data.length === 0) {
      toast({
        title: "No data to export",
        description: "The filtered table is empty.",
        variant: "destructive"
      });
      return;
    }
    
    // Get headers
    const headers = Object.keys(data[0]);
    
    // Convert data to CSV
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers
          .map(header => {
            const value = row[header as keyof typeof row];
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : String(value);
          })
          .join(',')
      )
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fitness-data-${activeTable}-${new Date().toISOString().slice(0,10)}.csv`);
    link.click();
    
    toast({
      title: "Export successful",
      description: `${activeTable} data has been exported as CSV.`
    });
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedTeachers([]);
    setSelectedTypes([]);
    
    toast({
      title: "Filters cleared",
      description: "All table filters have been reset."
    });
  };

  const RawDataTable = () => (
    <div className="rounded-md border overflow-x-auto">
      <Table className="min-w-full table-compact">
        <TableHeader className="bg-muted/40 sticky top-0">
          <TableRow>
            {Object.keys(data.rawData[0]).map((header) => (
              <TableHead 
                key={header} 
                onClick={() => handleSort(header)}
                className="cursor-pointer hover:bg-muted transition-colors py-3 whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  {header}
                  {sortColumn === header && (
                    sortDirection === "asc" ? 
                      <ArrowUp className="h-4 w-4 inline-block" /> : 
                      <ArrowDown className="h-4 w-4 inline-block" />
                  )}
                  {sortColumn !== header && <ChevronsUpDown className="h-3 w-3 opacity-30" />}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRawData.length > 0 ? (
            sortedRawData.map((record, index) => (
              <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                {Object.entries(record).map(([key, value], i) => (
                  <TableCell key={i} className="py-2 whitespace-nowrap">
                    {typeof value === 'number' && !isNaN(value) && key.toLowerCase().includes('paid') 
                      ? formatINR(value) 
                      : String(value)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={Object.keys(data.rawData[0]).length} className="h-24 text-center">
                No results found. Try adjusting your filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  const MonthlyStatsTable = () => (
    <div className="rounded-md border overflow-x-auto">
      <Table className="min-w-full table-compact">
        <TableHeader className="bg-muted/40 sticky top-0">
          <TableRow>
            {Object.keys(data.monthlyStats[0]).map((header) => (
              <TableHead 
                key={header} 
                onClick={() => handleSort(header)}
                className="cursor-pointer hover:bg-muted transition-colors py-3 whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  {header}
                  {sortColumn === header && (
                    sortDirection === "asc" ? 
                      <ArrowUp className="h-4 w-4 inline-block" /> : 
                      <ArrowDown className="h-4 w-4 inline-block" />
                  )}
                  {sortColumn !== header && <ChevronsUpDown className="h-3 w-3 opacity-30" />}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMonthlyStats.length > 0 ? (
            sortedMonthlyStats.map((item, index) => (
              <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                <TableCell>{item.month}</TableCell>
                <TableCell>{item.monthYear}</TableCell>
                <TableCell>{parseInt(String(item.totalSessions))}</TableCell>
                <TableCell>{parseInt(String(item.barreSessions))}</TableCell>
                <TableCell>{parseInt(String(item.cycleSessions))}</TableCell>
                <TableCell>{parseInt(String(item.barreCustomers))}</TableCell>
                <TableCell>{parseInt(String(item.cycleCustomers))}</TableCell>
                <TableCell>{formatINR(item.barrePaid)}</TableCell>
                <TableCell>{formatINR(item.cyclePaid)}</TableCell>
                <TableCell>{formatINR(item.totalRevenue)}</TableCell>
                <TableCell>{typeof item.avgClassSize === 'number' ? item.avgClassSize.toFixed(1) : item.avgClassSize}</TableCell>
                <TableCell>{item.totalBarreSessions}</TableCell>
                <TableCell>{item.totalCycleSessions}</TableCell>
                <TableCell>{item.totalBarreCustomers}</TableCell>
                <TableCell>{item.totalCycleCustomers}</TableCell>
                <TableCell>{item.totalBarrePaid}</TableCell>
                <TableCell>{item.totalCyclePaid}</TableCell>
                <TableCell>{item.avgBarreClassSize}</TableCell>
                <TableCell>{item.avgCycleClassSize}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={Object.keys(data.monthlyStats[0]).length} className="h-24 text-center">
                No results found. Try adjusting your filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-xl font-semibold">Data Tables</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportCSV}
                className="flex items-center gap-1 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                    Options
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={clearAllFilters}>
                    Clear All Filters
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setActiveTable(activeTable === "rawData" ? "monthlyStats" : "rawData");
                  }}>
                    {activeTable === "rawData" ? "Switch to Monthly Stats" : "Switch to Raw Data"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search table..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>
            
            <Select 
              value={activeTable} 
              onValueChange={(value: "rawData" | "monthlyStats") => setActiveTable(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rawData">Raw Data</SelectItem>
                <SelectItem value="monthlyStats">Monthly Stats</SelectItem>
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full flex justify-between">
                  <span className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    Teachers
                    {selectedTeachers.length > 0 && (
                      <span className="ml-1 rounded-full bg-primary w-5 h-5 text-[10px] flex items-center justify-center text-primary-foreground">
                        {selectedTeachers.length}
                      </span>
                    )}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="p-4 max-h-[300px] overflow-auto">
                  <MultiSelect
                    options={teacherOptions}
                    selected={selectedTeachers}
                    onChange={setSelectedTeachers}
                    placeholder="Select teachers..."
                  />
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full flex justify-between">
                  <span className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    Class Types
                    {selectedTypes.length > 0 && (
                      <span className="ml-1 rounded-full bg-primary w-5 h-5 text-[10px] flex items-center justify-center text-primary-foreground">
                        {selectedTypes.length}
                      </span>
                    )}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="p-4 max-h-[300px] overflow-auto">
                  <MultiSelect
                    options={typeOptions}
                    selected={selectedTypes}
                    onChange={setSelectedTypes}
                    placeholder="Select class types..."
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="rounded-md border overflow-hidden mb-4">
            <div className="p-2 bg-muted/20 border-b flex items-center justify-between">
              <div className="text-sm font-medium">
                {activeTable === "rawData" ? "Raw Data" : "Monthly Stats"}
              </div>
              <div className="text-xs text-muted-foreground">
                Showing {activeTable === "rawData" ? sortedRawData.length : sortedMonthlyStats.length} records
              </div>
            </div>
            
            <div className="max-h-[600px] overflow-auto">
              {activeTable === "rawData" ? (
                data.rawData.length > 0 ? <RawDataTable /> : <p className="p-4 text-center">No Raw Data available</p>
              ) : (
                data.monthlyStats.length > 0 ? <MonthlyStatsTable /> : <p className="p-4 text-center">No Monthly Stats available.</p>
              )}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground italic">
            * Click on column headers to sort the table. Use the filters above to refine the data.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TablesView;
