
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData } from "@/types/fitnessTypes";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowDown, ArrowUp, ChevronsUpDown, Download, Filter, MoreHorizontal, SearchIcon, Table2, TableIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";

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
  const debouncedSearchTerm = useDebounce(searchQuery, 300);
  
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

  const filteredRawData = useMemo(() => {
    return data.rawData.filter(record =>
      (selectedMonths.length === 0 || selectedMonths.includes(String(record["Month Year"]))) &&
      (location === "" || location === "all" || record.Location === location) &&
      (selectedTeachers.length === 0 || (record.Teacher && selectedTeachers.includes(String(record.Teacher)))) &&
      (selectedTypes.length === 0 || (record.Type && selectedTypes.includes(String(record.Type)))) &&
      Object.values(record).some(value =>
        String(value).toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    );
  }, [data.rawData, selectedMonths, location, debouncedSearchTerm, selectedTeachers, selectedTypes]);

  const filteredStats = React.useMemo(() => {
    return data.monthlyStats.filter(stat => 
      (selectedMonths.length === 0 || selectedMonths.includes(stat.monthYear)) &&
      (location === "" || location === "all" || stat.Location === location)
    );
  }, [data, selectedMonths, location]);

  const sortedRawData = useMemo(() => {
    return [...filteredRawData].sort((a, b) => {
      const aValue = a[sortColumn as keyof typeof a];
      const bValue = b[sortColumn as keyof typeof b];
      
      if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
        return sortDirection === "asc" 
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }
      
      const aStr = String(aValue || "");
      const bStr = String(bValue || "");
      
      return sortDirection === "asc" 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredRawData, sortColumn, sortDirection]);

  const sortedStats = useMemo(() => {
    return [...filteredStats].sort((a, b) => {
      const aValue = a[sortColumn as keyof typeof a];
      const bValue = b[sortColumn as keyof typeof b];
      
      if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
        return sortDirection === "asc" 
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }
      
      const aStr = String(aValue || "");
      const bStr = String(bValue || "");
      
      return sortDirection === "asc" 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredStats, sortColumn, sortDirection]);

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
    const dataToExport = activeTable === "rawData" ? sortedRawData : sortedStats;
    if (dataToExport.length === 0) {
      toast({
        title: "No data to export",
        description: "The filtered table is empty.",
        variant: "destructive"
      });
      return;
    }
    
    const headers = Object.keys(dataToExport[0]);
    
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => 
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
  
  const handleTableTypeChange = (value: string) => {
    setActiveTable(value as "rawData" | "monthlyStats");
  };

  const RawDataTable = () => (
    <div className="rounded-md border overflow-x-auto">
      <Table className="min-w-full table-compact">
        <TableHeader className="bg-muted/40 backdrop-blur-sm sticky top-0">
          <TableRow>
            {Object.keys(data.rawData[0]).map((header) => (
              <TableHead 
                key={header} 
                onClick={() => handleSort(header)}
                className="cursor-pointer hover:bg-muted transition-colors py-3 whitespace-nowrap font-heading"
              >
                <div className="flex items-center gap-1">
                  {header}
                  {sortColumn === header && (
                    sortDirection === "asc" ? 
                      <ArrowUp className="h-4 w-4 inline-block text-primary" /> : 
                      <ArrowDown className="h-4 w-4 inline-block text-primary" />
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
              <TableRow key={index} className="hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${index * 0.03}s` }}>
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
        <TableHeader className="bg-muted/40 backdrop-blur-sm sticky top-0">
          <TableRow>
            {Object.keys(data.monthlyStats[0]).map((header) => (
              <TableHead 
                key={header} 
                onClick={() => handleSort(header)}
                className="cursor-pointer hover:bg-muted transition-colors py-3 whitespace-nowrap font-heading"
              >
                <div className="flex items-center gap-1">
                  {header}
                  {sortColumn === header && (
                    sortDirection === "asc" ? 
                      <ArrowUp className="h-4 w-4 inline-block text-primary" /> : 
                      <ArrowDown className="h-4 w-4 inline-block text-primary" />
                  )}
                  {sortColumn !== header && <ChevronsUpDown className="h-3 w-3 opacity-30" />}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStats.length > 0 ? (
            sortedStats.map((item, index) => (
              <TableRow key={index} className="hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${index * 0.03}s` }}>
                {Object.entries(item).map(([key, value], i) => (
                  <TableCell key={i} className="py-2 whitespace-nowrap">
                    {key.toLowerCase().includes('paid') || key.toLowerCase().includes('revenue') 
                      ? formatINR(Number(value)) 
                      : key.toLowerCase().includes('size') 
                        ? typeof value === 'number' ? value.toFixed(1) : value
                        : value}
                  </TableCell>
                ))}
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold font-heading bg-gradient-to-r from-barre to-cycle bg-clip-text text-transparent">
          Data Tables
        </h2>
        <Badge variant="outline" className="flex items-center px-3 py-1 rounded-full bg-background/60 backdrop-blur-sm">
          <Filter className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Showing {activeTable === "rawData" ? sortedRawData.length : sortedStats.length} records</span>
        </Badge>
      </div>
      
      <Card className="overflow-hidden premium-card">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center">
            <TableIcon className="h-5 w-5 mr-2 text-primary" />
            {activeTable === "rawData" ? "Raw Data Table" : "Monthly Statistics"}
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportCSV}
              className="flex items-center gap-1 text-xs bg-background/70 hover:bg-background"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs bg-background/70 hover:bg-background">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                  Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="p-2 rounded-lg shadow-lg backdrop-blur-sm bg-popover/95 animate-scale-in">
                <DropdownMenuItem onClick={clearAllFilters} className="flex items-center gap-2 cursor-pointer">
                  <Filter className="h-4 w-4" />
                  Clear All Filters
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTableTypeChange(activeTable === "rawData" ? "monthlyStats" : "rawData")} className="flex items-center gap-2 cursor-pointer">
                  <Table2 className="h-4 w-4" />
                  {activeTable === "rawData" ? "Switch to Monthly Stats" : "Switch to Raw Data"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search table..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 bg-background/70"
              />
            </div>
            
            <Select 
              value={activeTable} 
              onValueChange={handleTableTypeChange}
            >
              <SelectTrigger className="bg-background/70">
                <div className="flex items-center gap-2">
                  <Table2 className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="Select Table" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-lg shadow-lg backdrop-blur-sm bg-popover/95 animate-scale-in">
                <SelectItem value="rawData">Raw Data</SelectItem>
                <SelectItem value="monthlyStats">Monthly Stats</SelectItem>
              </SelectContent>
            </Select>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full flex justify-between bg-background/70 hover:bg-background">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    <span>Filter options</span>
                    {(selectedTeachers.length > 0 || selectedTypes.length > 0) && (
                      <Badge className="ml-1 bg-primary hover:bg-primary">
                        {selectedTeachers.length + selectedTypes.length}
                      </Badge>
                    )}
                  </div>
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px] p-3 rounded-lg shadow-lg backdrop-blur-sm bg-popover/95 animate-scale-in">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Teachers ({selectedTeachers.length}/{teachers.length})</h3>
                    <div className="grid grid-cols-2 gap-1 max-h-[120px] overflow-y-auto">
                      {teachers.map(teacher => (
                        <div
                          key={teacher}
                          className={`text-xs flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer ${selectedTeachers.includes(teacher) ? 'bg-primary/20' : 'hover:bg-muted/20'}`}
                          onClick={() => {
                            if (selectedTeachers.includes(teacher)) {
                              setSelectedTeachers(selectedTeachers.filter(t => t !== teacher));
                            } else {
                              setSelectedTeachers([...selectedTeachers, teacher]);
                            }
                          }}
                        >
                          <div className={`w-3 h-3 rounded-sm ${selectedTeachers.includes(teacher) ? 'bg-primary' : 'border border-muted-foreground'}`} />
                          <span className="truncate">{teacher}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Class Types ({selectedTypes.length}/{classTypes.length})</h3>
                    <div className="grid grid-cols-2 gap-1 max-h-[120px] overflow-y-auto">
                      {classTypes.map(type => (
                        <div
                          key={type}
                          className={`text-xs flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer ${selectedTypes.includes(type) ? 'bg-primary/20' : 'hover:bg-muted/20'}`}
                          onClick={() => {
                            if (selectedTypes.includes(type)) {
                              setSelectedTypes(selectedTypes.filter(t => t !== type));
                            } else {
                              setSelectedTypes([...selectedTypes, type]);
                            }
                          }}
                        >
                          <div className={`w-3 h-3 rounded-sm ${selectedTypes.includes(type) ? 'bg-primary' : 'border border-muted-foreground'}`} />
                          <span className="truncate">{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {(selectedTeachers.length > 0 || selectedTypes.length > 0) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedTeachers([]);
                        setSelectedTypes([]);
                      }}
                      className="w-full text-xs"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="rounded-md border overflow-hidden mb-4 shadow-md bg-card/50">
            <div className="p-2 bg-muted/20 border-b flex items-center justify-between">
              <div className="text-sm font-medium">
                {activeTable === "rawData" ? "Raw Data" : "Monthly Stats"}
              </div>
              <div className="text-xs text-muted-foreground">
                Showing {activeTable === "rawData" ? sortedRawData.length : sortedStats.length} records
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
