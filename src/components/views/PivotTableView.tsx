
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProcessedData } from "@/types/fitnessTypes";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { formatINR, formatNumber } from "@/lib/formatters";
import { Save, Download, Share, Trash2, Plus, Filter } from "lucide-react";

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
}

interface SavedView {
  id: string;
  name: string;
  config: PivotConfig;
}

const SAMPLE_FIELDS = [
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
  "Cycle Customers"
];

const DEFAULT_CONFIG: PivotConfig = {
  rows: ["Month Year"],
  columns: ["Location"],
  values: ["Total Paid"],
  aggregation: "sum",
  name: "Default View"
};

const PivotTableView: React.FC<PivotTableViewProps> = ({ data, selectedMonths, location }) => {
  const { toast } = useToast();
  const [activeConfig, setActiveConfig] = useState<PivotConfig>(DEFAULT_CONFIG);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [viewName, setViewName] = useState("");
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  
  // Filter data based on selected months and location
  const filteredRawData = data.rawData.filter(record => 
    (selectedMonths.length === 0 || selectedMonths.includes(record["Month Year"])) &&
    (location === "" || record.Location === location)
  );

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

  // Generate dynamic pivot table data based on current configuration
  const generatePivotData = () => {
    // This is a simplified implementation - a full pivot table would require more complex logic
    const rows = activeConfig.rows;
    const columns = activeConfig.columns;
    const values = activeConfig.values;
    const aggregation = activeConfig.aggregation;
    
    // Get unique row values
    const rowValues = new Set<string>();
    filteredRawData.forEach(record => {
      const rowKey = rows.map(field => record[field]).join(" - ");
      rowValues.add(rowKey);
    });
    
    // Get unique column values
    const columnValues = new Set<string>();
    filteredRawData.forEach(record => {
      const colKey = columns.map(field => record[field]).join(" - ");
      columnValues.add(colKey);
    });
    
    // Create the pivot structure
    const pivotData: { [key: string]: { [key: string]: number } } = {};
    
    Array.from(rowValues).forEach(rowKey => {
      pivotData[rowKey] = {};
      Array.from(columnValues).forEach(colKey => {
        pivotData[rowKey][colKey] = 0;
      });
    });
    
    // Fill the pivot with aggregated data
    filteredRawData.forEach(record => {
      const rowKey = rows.map(field => record[field]).join(" - ");
      const colKey = columns.map(field => record[field]).join(" - ");
      
      values.forEach(valueField => {
        const value = parseFloat(record[valueField] || "0");
        
        if (!isNaN(value)) {
          if (aggregation === "sum" || aggregation === "average") {
            pivotData[rowKey][colKey] += value;
          } else if (aggregation === "count") {
            pivotData[rowKey][colKey] += 1;
          }
        }
      });
    });
    
    return {
      rowKeys: Array.from(rowValues),
      columnKeys: Array.from(columnValues),
      data: pivotData
    };
  };

  const pivotData = generatePivotData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-semibold">Pivot Table Builder</CardTitle>
                <CardDescription>
                  Create custom views of your fitness data
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={createNewView}>
                  <Plus className="mr-2 h-4 w-4" />
                  New
                </Button>
                <Button variant="default" size="sm" onClick={saveCurrentView}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="config">
              <TabsList className="mb-4">
                <TabsTrigger value="config">Configure</TabsTrigger>
                <TabsTrigger value="saved">Saved Views ({savedViews.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="config" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>View Name</Label>
                    <Input 
                      placeholder="My Custom View" 
                      value={viewName} 
                      onChange={(e) => setViewName(e.target.value)} 
                    />
                  </div>
                
                  <div className="space-y-2">
                    <Label>Row Fields</Label>
                    <Select 
                      value={activeConfig.rows[0]} 
                      onValueChange={(value) => updateConfig('rows', [value])}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {SAMPLE_FIELDS.map(field => (
                          <SelectItem key={field} value={field}>{field}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                
                  <div className="space-y-2">
                    <Label>Column Fields</Label>
                    <Select 
                      value={activeConfig.columns[0]} 
                      onValueChange={(value) => updateConfig('columns', [value])}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {SAMPLE_FIELDS.map(field => (
                          <SelectItem key={field} value={field}>{field}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                
                  <div className="space-y-2">
                    <Label>Value Fields</Label>
                    <Select 
                      value={activeConfig.values[0]} 
                      onValueChange={(value) => updateConfig('values', [value])}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {SAMPLE_FIELDS.map(field => (
                          <SelectItem key={field} value={field}>{field}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                
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
                      <Card key={view.id} className={`overflow-hidden ${activeViewId === view.id ? 'border-primary' : 'border-border/50'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{view.name}</h3>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => loadView(view.id)}
                                title="Load view"
                              >
                                <Filter className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteView(view.id)}
                                title="Delete view"
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
        
        <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {viewName || "Pivot Table"} 
              {selectedMonths.length > 0 && <span className="text-sm font-normal text-muted-foreground ml-2">
                ({selectedMonths.length} months selected)
              </span>}
              {location && <span className="text-sm font-normal text-muted-foreground ml-2">
                | Location: {location}
              </span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{activeConfig.rows.join(' / ')}</TableHead>
                    {pivotData.columnKeys.map(colKey => (
                      <TableHead key={colKey} isNumeric>{colKey}</TableHead>
                    ))}
                    <TableHead isNumeric>Total</TableHead>
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
                      <TableRow key={rowKey}>
                        <TableCell>{rowKey}</TableCell>
                        {pivotData.columnKeys.map(colKey => {
                          const value = pivotData.data[rowKey][colKey] || 0;
                          return (
                            <TableCell key={colKey} isNumeric>
                              {activeConfig.values.includes("Paid") ? 
                                formatINR(value) : 
                                formatNumber(value)}
                            </TableCell>
                          );
                        })}
                        <TableCell isNumeric>
                          {activeConfig.values.includes("Paid") ? 
                            formatINR(rowTotal) : 
                            formatNumber(rowTotal)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PivotTableView;
