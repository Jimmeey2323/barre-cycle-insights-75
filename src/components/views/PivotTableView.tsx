
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { RawDataRecord } from "@/types/fitnessTypes";
import { ArrowDownUp, DownloadIcon, ChevronsUpDown, Save, Trash2, Edit, Settings, Plus, X, RefreshCw } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface PivotTableConfig {
  id: string;
  name: string;
  rowHeaders: string[];
  colHeaders: string[];
  valueField: string;
  aggregationMethod: "sum" | "avg" | "min" | "max" | "count" | "countUnique";
  showRowTotals: boolean;
  showColTotals: boolean;
}

interface PivotTableViewProps {
  data: RawDataRecord[];
  selectedMonths: string[];
  location: string;
}

type AggregationMethodType = "sum" | "avg" | "min" | "max" | "count" | "countUnique";

const PivotTableView: React.FC<PivotTableViewProps> = ({ data, selectedMonths, location }) => {
  const [rowHeaders, setRowHeaders] = useState<string[]>([]);
  const [colHeaders, setColHeaders] = useState<string[]>([]);
  const [valueField, setValueField] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [savedPivots, setSavedPivots] = useState<PivotTableConfig[]>([]);
  const [currentPivotName, setCurrentPivotName] = useState("");
  const [showRowTotals, setShowRowTotals] = useState(true);
  const [showColTotals, setShowColTotals] = useState(true);
  const [aggregationMethod, setAggregationMethod] = useState<AggregationMethodType>("sum");
  const [filterFields, setFilterFields] = useState<{[key: string]: string[]}>({});
  const [availableFilters, setAvailableFilters] = useState<string[]>([]);
  const [editingPivotId, setEditingPivotId] = useState<string | null>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved pivots from localStorage
    const savedPivotsStr = localStorage.getItem('savedPivotConfigs');
    if (savedPivotsStr) {
      try {
        const parsedPivots = JSON.parse(savedPivotsStr);
        if (Array.isArray(parsedPivots)) {
          setSavedPivots(parsedPivots);
        }
      } catch (e) {
        console.error("Failed to parse saved pivots", e);
      }
    }
    
    // Extract possible filter fields
    if (data.length > 0) {
      const commonFields = Object.keys(data[0]).filter(field => 
        !['Teacher Email', 'Month Year', 'Location', 'Teacher Name'].includes(field)
      );
      setAvailableFilters(commonFields);
    }
  }, []);

  // Filter data based on selectedMonths and location
  const filteredData = useMemo(() => {
    let filtered = data.filter(item => 
      (selectedMonths.length === 0 || selectedMonths.includes(String(item["Month Year"]))) &&
      (location === "" || location === "all" || item.Location === location) &&
      (debouncedSearchTerm === "" || 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
      )
    );
    
    // Apply additional filter fields
    Object.entries(filterFields).forEach(([field, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(item => 
          values.includes(String(item[field as keyof typeof item]))
        );
      }
    });
    
    return filtered;
  }, [data, selectedMonths, location, debouncedSearchTerm, filterFields]);

  // Available fields for selection
  const availableFields = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  // Process data for pivot table
  const groupedData = useMemo(() => {
    if (!filteredData || filteredData.length === 0 || !rowHeaders.length || !colHeaders.length || !valueField) {
      return {};
    }

    const result: Record<string, Record<string, any>> = {};
    
    filteredData.forEach((item) => {
      // Create a combined row key from all rowHeaders
      const rowKeys = rowHeaders.map(header => String(item[header as keyof typeof item] || 'Unknown'));
      const rowKey = rowKeys.join(' - ');
      
      // Create a combined column key from all colHeaders
      const colKeys = colHeaders.map(header => String(item[header as keyof typeof item] || 'Unknown'));
      const colKey = colKeys.join(' - ');
      
      const value = item[valueField as keyof typeof item];
      
      if (value === undefined || value === null) return;
      
      if (!result[rowKey]) {
        result[rowKey] = {};
      }
      
      if (!result[rowKey][colKey]) {
        result[rowKey][colKey] = [];
      }
      
      // Store all values to support different aggregation methods
      result[rowKey][colKey].push(value);
    });
    
    return result;
  }, [filteredData, rowHeaders, colHeaders, valueField]);

  // Apply aggregation based on selected method
  const aggregatedData = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    
    Object.entries(groupedData).forEach(([rowKey, colData]) => {
      result[rowKey] = {};
      
      Object.entries(colData).forEach(([colKey, values]) => {
        let aggregatedValue: number = 0;
        
        if (values.length === 0) {
          result[rowKey][colKey] = 0;
          return;
        }
        
        switch (aggregationMethod) {
          case "sum":
            aggregatedValue = values.reduce((sum, val) => sum + Number(val), 0);
            break;
          case "avg":
            aggregatedValue = values.reduce((sum, val) => sum + Number(val), 0) / values.length;
            break;
          case "min":
            aggregatedValue = Math.min(...values.map(val => Number(val)));
            break;
          case "max":
            aggregatedValue = Math.max(...values.map(val => Number(val)));
            break;
          case "count":
            aggregatedValue = values.length;
            break;
          case "countUnique":
            aggregatedValue = new Set(values).size;
            break;
          default:
            aggregatedValue = values.reduce((sum, val) => sum + Number(val), 0);
        }
        
        result[rowKey][colKey] = aggregatedValue;
      });
    });
    
    return result;
  }, [groupedData, aggregationMethod]);

  const rowKeys = useMemo(() => {
    const keys = Object.keys(aggregatedData);
    
    if (sortBy === 'row') {
      return keys.sort((a, b) => {
        return sortDirection === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
      });
    }
    
    return keys;
  }, [aggregatedData, sortBy, sortDirection]);

  const colKeys = useMemo(() => {
    const keys = new Set<string>();
    
    Object.values(aggregatedData).forEach((row) => {
      Object.keys(row).forEach((key) => keys.add(key));
    });
    
    const keysArray = Array.from(keys);
    
    if (sortBy === 'column') {
      return keysArray.sort((a, b) => {
        return sortDirection === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
      });
    }
    
    return keysArray;
  }, [aggregatedData, sortBy, sortDirection]);

  // Calculated totals for each row and column
  const rowTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    if (!showRowTotals) return totals;
    
    rowKeys.forEach(row => {
      totals[row] = colKeys.reduce((sum, col) => {
        return sum + (aggregatedData[row]?.[col] || 0);
      }, 0);
    });
    
    return totals;
  }, [rowKeys, colKeys, aggregatedData, showRowTotals]);

  const colTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    if (!showColTotals) return totals;
    
    colKeys.forEach(col => {
      totals[col] = rowKeys.reduce((sum, row) => {
        return sum + (aggregatedData[row]?.[col] || 0);
      }, 0);
    });
    
    return totals;
  }, [rowKeys, colKeys, aggregatedData, showColTotals]);

  const grandTotal = useMemo(() => {
    return Object.values(rowTotals).reduce((sum, total) => sum + total, 0);
  }, [rowTotals]);

  const handleSortRows = () => {
    if (sortBy === 'row') {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy('row');
      setSortDirection('asc');
    }
  };

  const handleSortColumns = () => {
    if (sortBy === 'column') {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy('column');
      setSortDirection('asc');
    }
  };

  const handleAddRowHeader = (field: string) => {
    if (!rowHeaders.includes(field)) {
      setRowHeaders([...rowHeaders, field]);
    }
  };
  
  const handleRemoveRowHeader = (field: string) => {
    setRowHeaders(rowHeaders.filter(header => header !== field));
  };
  
  const handleAddColHeader = (field: string) => {
    if (!colHeaders.includes(field)) {
      setColHeaders([...colHeaders, field]);
    }
  };
  
  const handleRemoveColHeader = (field: string) => {
    setColHeaders(colHeaders.filter(header => header !== field));
  };

  const handleExportCSV = () => {
    if (rowHeaders.length === 0 || colHeaders.length === 0 || !valueField) {
      toast({
        title: "Cannot export data",
        description: "Please select row, column and value fields first.",
        variant: "destructive"
      });
      return;
    }

    if (rowKeys.length === 0) {
      toast({
        title: "No data to export",
        description: "The pivot table is empty.",
        variant: "destructive"
      });
      return;
    }
    
    // Build CSV header
    const csvHeader = ['Row Field', ...colKeys, 'Total'];
    
    // Build rows
    const csvRows = rowKeys.map(row => {
      const rowData = [row];
      
      colKeys.forEach(col => {
        rowData.push(String(aggregatedData[row]?.[col] || 0));
      });
      
      // Add row total
      if (showRowTotals) {
        rowData.push(String(rowTotals[row]));
      }
      
      return rowData.join(',');
    });
    
    // Add totals row
    if (showColTotals) {
      const totalsRow = ['Total'];
      colKeys.forEach(col => {
        totalsRow.push(String(colTotals[col]));
      });
      if (showRowTotals) {
        totalsRow.push(String(grandTotal));
      }
      csvRows.push(totalsRow.join(','));
    }
    
    // Combine all into CSV content
    const csvContent = [
      csvHeader.join(','),
      ...csvRows
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pivot-table-${rowHeaders.join('-')}-${colHeaders.join('-')}-${valueField}.csv`);
    link.click();
    
    toast({
      title: "Export successful",
      description: "Pivot table data has been exported as CSV."
    });
  };
  
  const savePivotConfig = () => {
    if (!currentPivotName.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a name for your pivot table configuration.",
        variant: "destructive"
      });
      return;
    }
    
    if (rowHeaders.length === 0 || colHeaders.length === 0 || !valueField) {
      toast({
        title: "Incomplete configuration",
        description: "Please select at least one row header, column header, and value field.",
        variant: "destructive"
      });
      return;
    }
    
    const newConfig: PivotTableConfig = {
      id: editingPivotId || `pivot-${Date.now()}`,
      name: currentPivotName,
      rowHeaders: [...rowHeaders],
      colHeaders: [...colHeaders],
      valueField: valueField,
      aggregationMethod: aggregationMethod,
      showRowTotals,
      showColTotals
    };
    
    let updatedPivots;
    
    if (editingPivotId) {
      updatedPivots = savedPivots.map(p => p.id === editingPivotId ? newConfig : p);
      setEditingPivotId(null);
    } else {
      updatedPivots = [...savedPivots, newConfig];
    }
    
    setSavedPivots(updatedPivots);
    localStorage.setItem('savedPivotConfigs', JSON.stringify(updatedPivots));
    
    setCurrentPivotName("");
    
    toast({
      title: editingPivotId ? "Configuration updated" : "Configuration saved",
      description: `Pivot table configuration "${newConfig.name}" has been ${editingPivotId ? 'updated' : 'saved'}.`,
    });
  };
  
  const loadPivotConfig = (config: PivotTableConfig) => {
    setRowHeaders(config.rowHeaders);
    setColHeaders(config.colHeaders);
    setValueField(config.valueField);
    setAggregationMethod(config.aggregationMethod);
    setShowRowTotals(config.showRowTotals);
    setShowColTotals(config.showColTotals);
    
    toast({
      description: `Loaded pivot configuration: ${config.name}`,
    });
  };
  
  const editPivotConfig = (config: PivotTableConfig) => {
    setCurrentPivotName(config.name);
    setEditingPivotId(config.id);
  };
  
  const deletePivotConfig = (id: string) => {
    const updatedPivots = savedPivots.filter(p => p.id !== id);
    setSavedPivots(updatedPivots);
    localStorage.setItem('savedPivotConfigs', JSON.stringify(updatedPivots));
    
    toast({
      description: "Pivot configuration deleted.",
    });
  };
  
  const resetConfig = () => {
    setRowHeaders([]);
    setColHeaders([]);
    setValueField(null);
    setCurrentPivotName("");
    setEditingPivotId(null);
    setShowRowTotals(true);
    setShowColTotals(true);
    setAggregationMethod("sum");
    setFilterFields({});
  };
  
  const formatValue = (value: number): string => {
    if (isNaN(value)) return "0";
    
    if (aggregationMethod === "avg") {
      return value.toFixed(2);
    }
    
    if (["count", "countUnique"].includes(aggregationMethod)) {
      return String(Math.round(value));
    }
    
    return String(value);
  };

  return (
    <div className="w-full space-y-4">
      <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pivot Table Configuration</CardTitle>
          <div className="flex items-center gap-2">
            {savedPivots.length > 0 && (
              <Select onValueChange={(id) => {
                const config = savedPivots.find(p => p.id === id);
                if (config) loadPivotConfig(config);
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Load saved pivot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Saved Pivot Tables</SelectLabel>
                    {savedPivots.map(pivot => (
                      <SelectItem key={pivot.id} value={pivot.id}>{pivot.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Save className="h-4 w-4" />
                  Save Configuration
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingPivotId ? "Update Pivot Configuration" : "Save Pivot Table Configuration"}</DialogTitle>
                  <DialogDescription>
                    {editingPivotId ? "Update your pivot table settings for future use." : "Save your current pivot table settings for future use."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="pivot-name">Configuration Name</Label>
                    <Input
                      id="pivot-name"
                      value={currentPivotName}
                      onChange={(e) => setCurrentPivotName(e.target.value)}
                      placeholder="Enter a name for this pivot configuration"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={savePivotConfig}>
                      {editingPivotId ? "Update" : "Save"}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" onClick={resetConfig} className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Row Headers</Label>
              <div className="flex flex-wrap gap-1 min-h-[36px] p-2 border rounded-lg">
                {rowHeaders.map(header => (
                  <Badge key={header} className="flex items-center gap-1 bg-primary">
                    {header}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveRowHeader(header)} />
                  </Badge>
                ))}
              </div>
              <Select onValueChange={handleAddRowHeader}>
                <SelectTrigger>
                  <SelectValue placeholder="Add row field" />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map((field) => (
                    <SelectItem key={field} value={field} disabled={rowHeaders.includes(field)}>{field}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Column Headers</Label>
              <div className="flex flex-wrap gap-1 min-h-[36px] p-2 border rounded-lg">
                {colHeaders.map(header => (
                  <Badge key={header} className="flex items-center gap-1 bg-primary">
                    {header}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveColHeader(header)} />
                  </Badge>
                ))}
              </div>
              <Select onValueChange={handleAddColHeader}>
                <SelectTrigger>
                  <SelectValue placeholder="Add column field" />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map((field) => (
                    <SelectItem key={field} value={field} disabled={colHeaders.includes(field)}>{field}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Value Field & Aggregation</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select onValueChange={setValueField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Value Field" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((field) => (
                      <SelectItem key={field} value={field}>{field}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={aggregationMethod} onValueChange={(v) => setAggregationMethod(v as AggregationMethodType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Aggregation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="avg">Average</SelectItem>
                    <SelectItem value="min">Minimum</SelectItem>
                    <SelectItem value="max">Maximum</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="countUnique">Count Unique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox id="show-row-totals" checked={showRowTotals} onCheckedChange={() => setShowRowTotals(!showRowTotals)} />
                  <Label htmlFor="show-row-totals" className="text-sm">Row Totals</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="show-col-totals" checked={showColTotals} onCheckedChange={() => setShowColTotals(!showColTotals)} />
                  <Label htmlFor="show-col-totals" className="text-sm">Column Totals</Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Additional Filters</Label>
            <div className="flex flex-wrap gap-2">
              {availableFilters.slice(0, 5).map(field => (
                <Popover key={field}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 flex items-center gap-1">
                      {field}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-2">
                    <div className="space-y-2">
                      <div className="font-medium text-sm">{field} Filter</div>
                      <div className="max-h-[150px] overflow-y-auto space-y-1">
                        {Array.from(
                          new Set(data.map(item => String(item[field as keyof typeof item])))
                        ).filter(Boolean).sort().map(value => (
                          <div key={value} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`${field}-${value}`}
                              checked={(filterFields[field] || []).includes(value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFilterFields({
                                    ...filterFields,
                                    [field]: [...(filterFields[field] || []), value]
                                  });
                                } else {
                                  setFilterFields({
                                    ...filterFields,
                                    [field]: (filterFields[field] || []).filter(v => v !== value)
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={`${field}-${value}`} className="text-xs">{value}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {savedPivots.length > 0 && (
        <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Saved Pivot Configurations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {savedPivots.map(pivot => (
              <div key={pivot.id} className="pivot-saved">
                <div>
                  <div className="pivot-saved-title">{pivot.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Rows: {pivot.rowHeaders.join(', ')} | 
                    Cols: {pivot.colHeaders.join(', ')} | 
                    Value: {pivot.valueField} ({pivot.aggregationMethod})
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => loadPivotConfig(pivot)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => editPivotConfig(pivot)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deletePivotConfig(pivot.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {rowHeaders.length > 0 && colHeaders.length > 0 && valueField && (
        <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Pivot Table</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportCSV}
              className="flex items-center gap-1"
            >
              <DownloadIcon className="h-4 w-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="p-2 flex items-center justify-between border-b bg-muted/20">
                <div className="text-sm font-medium">
                  {rowHeaders.join(', ')} by {colHeaders.join(', ')} 
                  ({aggregationMethod === "sum" ? "Sum" : 
                    aggregationMethod === "avg" ? "Average" : 
                    aggregationMethod === "min" ? "Minimum" : 
                    aggregationMethod === "max" ? "Maximum" : 
                    aggregationMethod === "count" ? "Count" : 
                    "Count Unique"} of {valueField})
                </div>
                <div className="text-xs text-muted-foreground">
                  {rowKeys.length} rows, {colKeys.length} columns
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted transition-colors"
                        onClick={handleSortRows}
                      >
                        <div className="flex items-center gap-1">
                          {rowHeaders.join(' + ')}
                          {sortBy === 'row' && (
                            sortDirection === 'asc' ? 
                              <ArrowDownUp className="h-4 w-4 rotate-180" /> : 
                              <ArrowDownUp className="h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      
                      {colKeys.map((col, i) => (
                        <TableHead 
                          key={`col-${i}`}
                          className="cursor-pointer hover:bg-muted transition-colors"
                          onClick={handleSortColumns}
                        >
                          <div className="flex items-center gap-1">
                            {col}
                            {i === 0 && sortBy === 'column' && (
                              sortDirection === 'asc' ? 
                                <ArrowDownUp className="h-4 w-4 rotate-180" /> : 
                                <ArrowDownUp className="h-4 w-4" />
                            )}
                          </div>
                        </TableHead>
                      ))}
                      
                      {showRowTotals && (
                        <TableHead className="font-bold">Total</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rowKeys.map((row, i) => (
                      <TableRow key={`row-${i}`} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{row}</TableCell>
                        
                        {colKeys.map((col, j) => (
                          <TableCell 
                            key={`value-${i}-${j}`}
                            className="text-right"
                          >
                            {formatValue(aggregatedData[row]?.[col] || 0)}
                          </TableCell>
                        ))}
                        
                        {showRowTotals && (
                          <TableCell className="font-bold text-right">{formatValue(rowTotals[row])}</TableCell>
                        )}
                      </TableRow>
                    ))}
                    
                    {showColTotals && (
                      <TableRow className="bg-muted/30 font-bold">
                        <TableCell>Total</TableCell>
                        
                        {colKeys.map((col, i) => (
                          <TableCell 
                            key={`total-${i}`}
                            className="text-right"
                          >
                            {formatValue(colTotals[col])}
                          </TableCell>
                        ))}
                        
                        {showRowTotals && (
                          <TableCell className="text-right">{formatValue(grandTotal)}</TableCell>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PivotTableView;
