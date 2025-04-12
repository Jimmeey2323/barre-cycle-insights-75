
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProcessedData } from "@/types/fitnessTypes";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { formatINR, formatNumber, formatUSD, formatPercent } from "@/lib/formatters";
import { Save, Download, Share, Trash2, Plus, Filter, FlipVertical, FlipHorizontal, Table2 } from "lucide-react";

interface PivotTableViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

interface PivotConfig {
  rows: string[];
  columns: string[];
  values: string[];
  aggregation: "sum" | "count" | "average";
  name: string;
  showRowTotals: boolean;
  showColumnTotals: boolean;
}

interface SavedView {
  id: string;
  name: string;
  config: PivotConfig;
}

const AVAILABLE_FIELDS = [
  "Teacher Name", 
  "Location", 
  "Month Year", 
  "Total Paid", 
  "Barre Paid", 
  "Cycle Paid",
  "Barre Sessions",
  "Cycle Sessions",
  "Total Sessions",
  "Barre Customers",
  "Cycle Customers",
  "Total Customers",
  "Avg Barre Class Size",
  "Avg Cycle Class Size",
  "Empty Barre Sessions",
  "Empty Cycle Sessions",
  "Non-Empty Barre Sessions",
  "Non-Empty Cycle Sessions",
  "New",
  "Retained",
  "Converted"
];

const DEFAULT_CONFIG: PivotConfig = {
  rows: ["Month Year"],
  columns: ["Location"],
  values: ["Total Paid"],
  aggregation: "sum",
  name: "Default View",
  showRowTotals: true,
  showColumnTotals: true,
};

const PivotTableView: React.FC<PivotTableViewProps> = ({ data, selectedMonths, location }) => {
  const { toast } = useToast();
  const [activeConfig, setActiveConfig] = useState<PivotConfig>(DEFAULT_CONFIG);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [viewName, setViewName] = useState("");
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  
  // Filter data based on selected months and location
  const filteredRawData = useMemo(() => {
    return data.rawData.filter(record => 
      (selectedMonths.length === 0 || selectedMonths.includes(record["Month Year"])) &&
      (location === "" || record.Location === location)
    );
  }, [data.rawData, selectedMonths, location]);

  // Load saved views from localStorage on component mount
  useEffect(() => {
    const savedViewsData = localStorage.getItem('fitnessAppPivotViews');
    if (savedViewsData) {
      try {
        const parsedViews = JSON.parse(savedViewsData);
        setSavedViews(parsedViews);
        
        // Load the last active view if it exists
        const lastActiveViewId = localStorage.getItem('fitnessAppLastActiveView');
        if (lastActiveViewId) {
          const lastView = parsedViews.find((view: SavedView) => view.id === lastActiveViewId);
          if (lastView) {
            setActiveConfig(lastView.config);
            setActiveViewId(lastView.id);
            setViewName(lastView.name);
          }
        }
      } catch (e) {
        console.error("Failed to parse saved views:", e);
      }
    }
  }, []);

  // Save views to localStorage whenever they change
  useEffect(() => {
    if (savedViews.length > 0) {
      localStorage.setItem('fitnessAppPivotViews', JSON.stringify(savedViews));
    }
    
    if (activeViewId) {
      localStorage.setItem('fitnessAppLastActiveView', activeViewId);
    }
  }, [savedViews, activeViewId]);

  // Function to save current view
  const saveCurrentView = () => {
    if (!viewName.trim()) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please provide a name for this view."
      });
      return;
    }
    
    const newView: SavedView = {
      id: activeViewId || `view-${Date.now()}`,
      name: viewName,
      config: { ...activeConfig, name: viewName }
    };
    
    if (activeViewId) {
      // Update existing view
      setSavedViews(savedViews.map(view => 
        view.id === activeViewId ? newView : view
      ));
    } else {
      // Create new view
      setSavedViews([...savedViews, newView]);
      setActiveViewId(newView.id);
    }
    
    toast({
      title: "View saved",
      description: `Your view "${viewName}" has been saved.`
    });
  };

  // Function to load a saved view
  const loadView = (viewId: string) => {
    const view = savedViews.find(v => v.id === viewId);
    if (view) {
      setActiveConfig(view.config);
      setViewName(view.name);
      setActiveViewId(view.id);
      
      toast({
        title: "View loaded",
        description: `Loaded view "${view.name}".`
      });
    }
  };

  // Function to delete a saved view
  const deleteView = (viewId: string) => {
    setSavedViews(savedViews.filter(v => v.id !== viewId));
    
    if (activeViewId === viewId) {
      setActiveConfig(DEFAULT_CONFIG);
      setViewName("");
      setActiveViewId(null);
    }
    
    toast({
      title: "View deleted",
      description: "The selected view has been deleted."
    });
  };

  // Function to create a new view
  const createNewView = () => {
    setActiveConfig(DEFAULT_CONFIG);
    setViewName("");
    setActiveViewId(null);
  };

  // Update a field in the config
  const updateConfig = (field: keyof PivotConfig, value: any) => {
    setActiveConfig({
      ...activeConfig,
      [field]: value
    });
  };

  // Helper to check if a field is currency type
  const isCurrencyField = (field: string) => {
    return field.includes('Paid');
  };

  // Helper to check if a field is average/percentage type
  const isAverageField = (field: string) => {
    return field.includes('Avg') || field.includes('Size');
  };

  // Generate dynamic pivot table data based on current configuration
  const generatePivotData = () => {
    const rows = activeConfig.rows;
    const columns = activeConfig.columns;
    const values = activeConfig.values;
    const aggregation = activeConfig.aggregation;
    
    if (rows.length === 0 || columns.length === 0 || values.length === 0) {
      return {
        rowKeys: [],
        columnKeys: [],
        data: {},
        rowTotals: {},
        columnTotals: {},
        grandTotal: 0
      };
    }
    
    // Get unique row values combinations
    const rowValues = new Set<string>();
    filteredRawData.forEach(record => {
      const rowKey = rows.map(field => record[field] || 'N/A').join(" | ");
      rowValues.add(rowKey);
    });
    
    // Get unique column values combinations
    const columnValues = new Set<string>();
    filteredRawData.forEach(record => {
      const colKey = columns.map(field => record[field] || 'N/A').join(" | ");
      columnValues.add(colKey);
    });
    
    // Create the pivot structure
    const pivotData: { [key: string]: { [key: string]: number } } = {};
    const dataCount: { [key: string]: { [key: string]: number } } = {};  // For average calculation
    
    Array.from(rowValues).forEach(rowKey => {
      pivotData[rowKey] = {};
      dataCount[rowKey] = {};
      Array.from(columnValues).forEach(colKey => {
        pivotData[rowKey][colKey] = 0;
        dataCount[rowKey][colKey] = 0;
      });
    });
    
    // Fill the pivot with aggregated data
    filteredRawData.forEach(record => {
      const rowKey = rows.map(field => record[field] || 'N/A').join(" | ");
      const colKey = columns.map(field => record[field] || 'N/A').join(" | ");
      
      values.forEach(valueField => {
        const value = parseFloat(record[valueField] || "0");
        
        if (!isNaN(value)) {
          if (aggregation === "sum") {
            pivotData[rowKey][colKey] += value;
          } else if (aggregation === "count") {
            pivotData[rowKey][colKey] += 1;
          } else if (aggregation === "average") {
            pivotData[rowKey][colKey] += value;
            dataCount[rowKey][colKey] += 1;
          }
        }
      });
    });
    
    // Calculate averages if needed
    if (aggregation === "average") {
      Object.keys(pivotData).forEach(rowKey => {
        Object.keys(pivotData[rowKey]).forEach(colKey => {
          if (dataCount[rowKey][colKey] > 0) {
            pivotData[rowKey][colKey] = pivotData[rowKey][colKey] / dataCount[rowKey][colKey];
          }
        });
      });
    }
    
    // Calculate row totals
    const rowTotals: { [key: string]: number } = {};
    Array.from(rowValues).forEach(rowKey => {
      rowTotals[rowKey] = Object.values(pivotData[rowKey]).reduce((sum, val) => sum + (val || 0), 0);
    });
    
    // Calculate column totals
    const columnTotals: { [key: string]: number } = {};
    Array.from(columnValues).forEach(colKey => {
      columnTotals[colKey] = Array.from(rowValues).reduce(
        (sum, rowKey) => sum + (pivotData[rowKey][colKey] || 0), 
        0
      );
    });
    
    // Calculate grand total
    const grandTotal = Object.values(rowTotals).reduce((sum, val) => sum + (val || 0), 0);
    
    return {
      rowKeys: Array.from(rowValues),
      columnKeys: Array.from(columnValues),
      data: pivotData,
      rowTotals,
      columnTotals,
      grandTotal
    };
  };

  const pivotData = generatePivotData();

  // Format value based on field type
  const formatValue = (value: number, fieldName: string) => {
    if (isCurrencyField(fieldName)) {
      return formatINR(value);
    } else if (isAverageField(fieldName)) {
      return formatNumber(value);
    } else {
      return formatNumber(value);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (pivotData.rowKeys.length === 0 || pivotData.columnKeys.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: "The pivot table is empty."
      });
      return;
    }
    
    // Create header row
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `${activeConfig.rows.join(' | ')},${pivotData.columnKeys.join(',')},Total\n`;
    
    // Add data rows
    pivotData.rowKeys.forEach(rowKey => {
      let row = rowKey;
      pivotData.columnKeys.forEach(colKey => {
        const value = pivotData.data[rowKey][colKey] || 0;
        row += `,${value}`;
      });
      row += `,${pivotData.rowTotals[rowKey] || 0}\n`;
      csvContent += row;
    });
    
    // Add totals row
    let totalsRow = "Total";
    pivotData.columnKeys.forEach(colKey => {
      totalsRow += `,${pivotData.columnTotals[colKey] || 0}`;
    });
    totalsRow += `,${pivotData.grandTotal || 0}\n`;
    csvContent += totalsRow;
    
    // Create and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pivot_${viewName || 'data'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: "The pivot table data has been exported to CSV."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Card className="card-glass animate-fade-in">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-semibold">Pivot Table Builder</CardTitle>
                <CardDescription>
                  Create custom multi-dimensional views of your fitness data
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={createNewView} className="transition-all hover:bg-primary/10">
                  <Plus className="mr-2 h-4 w-4" />
                  New
                </Button>
                <Button variant="default" size="sm" onClick={saveCurrentView} className="transition-all">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={exportToCSV} className="transition-all hover:bg-primary/10">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="config">
              <TabsList className="mb-4">
                <TabsTrigger value="config" className="flex items-center gap-1">
                  <Table2 className="h-4 w-4" />
                  Configure
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex items-center gap-1">
                  <Save className="h-4 w-4" />
                  Saved Views ({savedViews.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="config" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>View Name</Label>
                    <Input 
                      placeholder="My Custom View" 
                      value={viewName} 
                      onChange={(e) => setViewName(e.target.value)} 
                      className="transition-all focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Row Fields (select multiple)</Label>
                      <MultiSelect 
                        options={AVAILABLE_FIELDS.map(field => ({ 
                          label: field, 
                          value: field 
                        }))}
                        selected={activeConfig.rows}
                        onChange={(selected) => updateConfig('rows', selected)}
                        placeholder="Select row fields"
                      />
                    </div>
                  
                    <div className="space-y-2">
                      <Label>Column Fields (select multiple)</Label>
                      <MultiSelect 
                        options={AVAILABLE_FIELDS.map(field => ({ 
                          label: field, 
                          value: field 
                        }))}
                        selected={activeConfig.columns}
                        onChange={(selected) => updateConfig('columns', selected)}
                        placeholder="Select column fields"
                      />
                    </div>
                  
                    <div className="space-y-2">
                      <Label>Value Fields (select multiple)</Label>
                      <MultiSelect 
                        options={AVAILABLE_FIELDS.map(field => ({ 
                          label: field, 
                          value: field 
                        }))}
                        selected={activeConfig.values}
                        onChange={(selected) => updateConfig('values', selected)}
                        placeholder="Select value fields"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Aggregation</Label>
                      <Select 
                        value={activeConfig.aggregation} 
                        onValueChange={(value: "sum" | "count" | "average") => updateConfig('aggregation', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select aggregation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sum">Sum</SelectItem>
                          <SelectItem value="count">Count</SelectItem>
                          <SelectItem value="average">Average</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-4 pt-8">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="show-row-totals" 
                          checked={activeConfig.showRowTotals}
                          onCheckedChange={(checked) => updateConfig('showRowTotals', checked)}
                        />
                        <Label htmlFor="show-row-totals" className="cursor-pointer">Show Row Totals</Label>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 pt-8">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="show-column-totals" 
                          checked={activeConfig.showColumnTotals}
                          onCheckedChange={(checked) => updateConfig('showColumnTotals', checked)}
                        />
                        <Label htmlFor="show-column-totals" className="cursor-pointer">Show Column Totals</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="saved">
                {savedViews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No saved views yet. Configure and save a view to see it here.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedViews.map(view => (
                      <Card key={view.id} className={`overflow-hidden transition-all hover:shadow-md ${activeViewId === view.id ? 'border-primary' : 'border-border/50'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{view.name}</h3>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => loadView(view.id)}
                                title="Load view"
                                className="transition-all hover:bg-primary/10"
                              >
                                <Filter className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteView(view.id)}
                                title="Delete view"
                                className="transition-all hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            <p>Rows: {view.config.rows.join(', ')}</p>
                            <p>Columns: {view.config.columns.join(', ')}</p>
                            <p>Values: {view.config.values.join(', ')} ({view.config.aggregation})</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="card-glass animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center justify-between">
              <span>
                {viewName || "Pivot Table"} 
                {selectedMonths.length > 0 && <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({selectedMonths.length} months selected)
                </span>}
                {location && <span className="text-sm font-normal text-muted-foreground ml-2">
                  | Location: {location}
                </span>}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={exportToCSV}>
                  <Download className="h-4 w-4" />
                  <span className="hidden md:inline">Export</span>
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pivotData.rowKeys.length === 0 || pivotData.columnKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No data available for the current configuration. Try changing the filters or pivot settings.
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{activeConfig.rows.join(' / ')}</TableHead>
                      {pivotData.columnKeys.map(colKey => (
                        <TableHead key={colKey} isNumeric>{colKey}</TableHead>
                      ))}
                      {activeConfig.showRowTotals && (
                        <TableHead isNumeric className="bg-muted/20 font-semibold">Total</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pivotData.rowKeys.map(rowKey => {
                      // Calculate row total
                      const rowTotal = pivotData.columnKeys.reduce(
                        (sum, colKey) => sum + (pivotData.data[rowKey][colKey] || 0), 
                        0
                      );
                      
                      return (
                        <TableRow key={rowKey} className="hover:bg-muted/10 transition-colors">
                          <TableCell>{rowKey}</TableCell>
                          {pivotData.columnKeys.map(colKey => {
                            const value = pivotData.data[rowKey][colKey] || 0;
                            return (
                              <TableCell key={colKey} isNumeric isCurrency={isCurrencyField(activeConfig.values[0])} isAverage={isAverageField(activeConfig.values[0])}>
                                {formatValue(value, activeConfig.values[0])}
                              </TableCell>
                            );
                          })}
                          {activeConfig.showRowTotals && (
                            <TableCell isNumeric isCurrency={isCurrencyField(activeConfig.values[0])} isAverage={isAverageField(activeConfig.values[0])} className="bg-muted/20 font-semibold">
                              {formatValue(rowTotal, activeConfig.values[0])}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  {activeConfig.showColumnTotals && (
                    <TableFooter>
                      <TableRow className="bg-muted/20">
                        <TableCell className="font-semibold">Total</TableCell>
                        {pivotData.columnKeys.map(colKey => (
                          <TableCell key={colKey} isNumeric isCurrency={isCurrencyField(activeConfig.values[0])} isAverage={isAverageField(activeConfig.values[0])}>
                            {formatValue(pivotData.columnTotals[colKey] || 0, activeConfig.values[0])}
                          </TableCell>
                        ))}
                        {activeConfig.showRowTotals && (
                          <TableCell isNumeric isCurrency={isCurrencyField(activeConfig.values[0])} isAverage={isAverageField(activeConfig.values[0])} className="font-bold">
                            {formatValue(pivotData.grandTotal || 0, activeConfig.values[0])}
                          </TableCell>
                        )}
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PivotTableView;
