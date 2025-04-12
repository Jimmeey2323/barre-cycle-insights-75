
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcessedData } from "@/types/fitnessTypes";
import { formatINR, toNumber } from "@/lib/formatters";
import { TableProperties, Users, Calendar, Indian, Percent, Target, BarChart3, SlidersHorizontal } from "lucide-react";

interface PivotTableViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

type DimensionOption = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

type MeasureOption = {
  label: string;
  value: string;
  icon: React.ReactNode;
  format?: (value: number) => string;
  isCurrency?: boolean;
  isAverage?: boolean;
};

const PivotTableView: React.FC<PivotTableViewProps> = ({ data, selectedMonths, location }) => {
  // Filter data based on selected months and location
  const filteredData = data.rawData.filter(record => 
    (selectedMonths.length === 0 || selectedMonths.includes(record["Month Year"])) &&
    (location === "" || record.Location === location)
  );
  
  const [rowDimensions, setRowDimensions] = useState<string[]>(["Month Year"]);
  const [colDimensions, setColDimensions] = useState<string[]>(["Type"]);
  const [measures, setMeasures] = useState<string[]>(["Attendance", "Revenue"]);
  const [showRowTotals, setShowRowTotals] = useState(true);
  const [showColTotals, setShowColTotals] = useState(true);
  const [showClassAvg, setShowClassAvg] = useState(true);
  
  const dimensionOptions: DimensionOption[] = [
    { label: "Month", value: "Month Year", icon: <Calendar className="h-4 w-4" /> },
    { label: "Type", value: "Type", icon: <BarChart3 className="h-4 w-4" /> },
    { label: "Teacher", value: "Teacher", icon: <Users className="h-4 w-4" /> },
    { label: "Location", value: "Location", icon: <Target className="h-4 w-4" /> },
    { label: "Day", value: "Day", icon: <Calendar className="h-4 w-4" /> },
    { label: "Time", value: "Time", icon: <Calendar className="h-4 w-4" /> }
  ];
  
  const measureOptions: MeasureOption[] = [
    { 
      label: "Attendance", 
      value: "Attendance", 
      icon: <Users className="h-4 w-4" />,
      format: (value) => value.toFixed(0)
    },
    { 
      label: "Revenue", 
      value: "Revenue", 
      icon: <Indian className="h-4 w-4" />,
      format: (value) => formatINR(value),
      isCurrency: true
    },
    { 
      label: "Fill Rate", 
      value: "Fill Rate", 
      icon: <Percent className="h-4 w-4" />,
      format: (value) => `${value.toFixed(1)}%`,
      isAverage: true
    },
    { 
      label: "Retention", 
      value: "Retention", 
      icon: <Percent className="h-4 w-4" />,
      format: (value) => `${value.toFixed(1)}%`,
      isAverage: true
    }
  ];
  
  const toggleRowDimension = (dim: string) => {
    if (rowDimensions.includes(dim)) {
      setRowDimensions(rowDimensions.filter(d => d !== dim));
    } else {
      setRowDimensions([...rowDimensions, dim]);
    }
  };
  
  const toggleColDimension = (dim: string) => {
    if (colDimensions.includes(dim)) {
      setColDimensions(colDimensions.filter(d => d !== dim));
    } else {
      setColDimensions([...colDimensions, dim]);
    }
  };
  
  const toggleMeasure = (measure: string) => {
    if (measures.includes(measure)) {
      setMeasures(measures.filter(m => m !== measure));
    } else {
      setMeasures([...measures, measure]);
    }
  };
  
  const getMeasureOption = (measureValue: string): MeasureOption | undefined => {
    return measureOptions.find(m => m.value === measureValue);
  };
  
  // Generate pivot table data
  const pivotData = useMemo(() => {
    if (!filteredData.length || !rowDimensions.length || !colDimensions.length || !measures.length) {
      return { rows: [], cols: [], data: new Map(), totals: new Map(), rowTotals: new Map(), colTotals: new Map(), colCounts: new Map() };
    }
    
    // Get unique values for row and column dimensions
    const rowValues: Map<string, Set<string>> = new Map();
    const colValues: Map<string, Set<string>> = new Map();
    
    rowDimensions.forEach(dim => {
      rowValues.set(dim, new Set(filteredData.map(d => String(d[dim])).filter(Boolean)));
    });
    
    colDimensions.forEach(dim => {
      colValues.set(dim, new Set(filteredData.map(d => String(d[dim])).filter(Boolean)));
    });
    
    // Generate all possible row and column combinations
    const generateCombinations = (dimensions: string[], valueMap: Map<string, Set<string>>) => {
      if (dimensions.length === 0) return [{}];
      
      const result: Array<{[key: string]: string}> = [];
      const firstDim = dimensions[0];
      const restDims = dimensions.slice(1);
      
      const firstDimValues = Array.from(valueMap.get(firstDim) || []);
      
      if (restDims.length === 0) {
        return firstDimValues.map(value => ({ [firstDim]: value }));
      }
      
      const restCombinations = generateCombinations(restDims, valueMap);
      
      for (const firstValue of firstDimValues) {
        for (const restCombo of restCombinations) {
          result.push({ [firstDim]: firstValue, ...restCombo });
        }
      }
      
      return result;
    };
    
    const rows = generateCombinations(rowDimensions, rowValues);
    const cols = generateCombinations(colDimensions, colValues);
    
    // Create data structure for pivot table
    const data = new Map();
    const rowTotals = new Map();
    const colTotals = new Map();
    const colCounts = new Map(); // Store counts for calculating averages
    
    // Helper function to check if a record matches a dimension combination
    const matchesCombination = (record: any, combination: {[key: string]: string}) => {
      return Object.entries(combination).every(([dim, value]) => String(record[dim]) === value);
    };
    
    // Initialize data structure
    for (const row of rows) {
      const rowKey = JSON.stringify(row);
      data.set(rowKey, new Map());
      rowTotals.set(rowKey, {});
      
      for (const measure of measures) {
        rowTotals.get(rowKey)[measure] = 0;
      }
      
      for (const col of cols) {
        const colKey = JSON.stringify(col);
        data.get(rowKey).set(colKey, {});
        
        for (const measure of measures) {
          data.get(rowKey).get(colKey)[measure] = 0;
        }
      }
    }
    
    for (const col of cols) {
      const colKey = JSON.stringify(col);
      colTotals.set(colKey, {});
      colCounts.set(colKey, {});
      
      for (const measure of measures) {
        colTotals.get(colKey)[measure] = 0;
        colCounts.get(colKey)[measure] = 0;
      }
    }
    
    // Calculate totals
    const grandTotals: {[key: string]: number} = {};
    const grandCounts: {[key: string]: number} = {};
    
    for (const measure of measures) {
      grandTotals[measure] = 0;
      grandCounts[measure] = 0;
    }
    
    // Aggregate data
    for (const record of filteredData) {
      // Find which row and column combination this record belongs to
      for (const row of rows) {
        if (matchesCombination(record, row)) {
          const rowKey = JSON.stringify(row);
          
          for (const col of cols) {
            if (matchesCombination(record, col)) {
              const colKey = JSON.stringify(col);
              
              for (const measure of measures) {
                const value = toNumber(record[measure] || 0);
                
                // Update cell value
                data.get(rowKey).get(colKey)[measure] += value;
                
                // Update row total
                rowTotals.get(rowKey)[measure] += value;
                
                // Update column total
                colTotals.get(colKey)[measure] += value;
                
                // Update grand total
                grandTotals[measure] += value;
                
                // Update counts for averages
                if (value !== 0) {
                  colCounts.get(colKey)[measure] = (colCounts.get(colKey)[measure] || 0) + 1;
                  grandCounts[measure] = (grandCounts[measure] || 0) + 1;
                }
              }
            }
          }
        }
      }
    }
    
    return { rows, cols, data, totals: new Map([["grand", grandTotals]]), rowTotals, colTotals, colCounts, grandCounts };
  }, [filteredData, rowDimensions, colDimensions, measures]);
  
  const getDimensionKey = (combination: {[key: string]: string}, dimensions: string[]): string => {
    return dimensions.map(dim => combination[dim]).join(" - ");
  };
  
  const formatMeasureValue = (measure: string, value: number, isAverage: boolean = false, count: number = 1): string => {
    const measureOption = getMeasureOption(measure);
    
    if (isAverage && measureOption?.isAverage) {
      // For average measures, we calculate the average
      const avgValue = count > 0 ? value / count : 0;
      return measureOption.format ? measureOption.format(avgValue) : avgValue.toString();
    }
    
    if (measureOption?.format) {
      return measureOption.format(value);
    }
    
    return value.toString();
  };
  
  const renderMeasureCell = (measure: string, value: number, isAverage: boolean = false, count: number = 1): React.ReactNode => {
    const measureOption = getMeasureOption(measure);
    
    return (
      <TableCell 
        key={`${measure}-value`}
        isNumeric 
        isCurrency={measureOption?.isCurrency} 
        isAverage={measureOption?.isAverage || isAverage}
      >
        {formatMeasureValue(measure, value, isAverage, count)}
      </TableCell>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <TableProperties className="h-5 w-5" />
            Pivot Table Builder
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Switch id="row-totals" checked={showRowTotals} onCheckedChange={setShowRowTotals} />
              <label htmlFor="row-totals" className="text-sm cursor-pointer">Row Totals</label>
            </div>
            <div className="flex items-center space-x-1">
              <Switch id="col-totals" checked={showColTotals} onCheckedChange={setShowColTotals} />
              <label htmlFor="col-totals" className="text-sm cursor-pointer">Column Totals</label>
            </div>
            <div className="flex items-center space-x-1">
              <Switch id="class-avg" checked={showClassAvg} onCheckedChange={setShowClassAvg} />
              <label htmlFor="class-avg" className="text-sm cursor-pointer">Class Averages</label>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-1">
                  <SlidersHorizontal className="h-4 w-4" /> Rows
                </h3>
                <Badge variant="outline">{rowDimensions.length} selected</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {dimensionOptions.map(dim => (
                  <Badge
                    key={`row-${dim.value}`}
                    variant={rowDimensions.includes(dim.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleRowDimension(dim.value)}
                  >
                    {dim.icon}
                    <span className="ml-1">{dim.label}</span>
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-1">
                  <SlidersHorizontal className="h-4 w-4 rotate-90" /> Columns
                </h3>
                <Badge variant="outline">{colDimensions.length} selected</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {dimensionOptions.map(dim => (
                  <Badge
                    key={`col-${dim.value}`}
                    variant={colDimensions.includes(dim.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleColDimension(dim.value)}
                  >
                    {dim.icon}
                    <span className="ml-1">{dim.label}</span>
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" /> Measures
                </h3>
                <Badge variant="outline">{measures.length} selected</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {measureOptions.map(measure => (
                  <Badge
                    key={`measure-${measure.value}`}
                    variant={measures.includes(measure.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleMeasure(measure.value)}
                  >
                    {measure.icon}
                    <span className="ml-1">{measure.label}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="rounded-md border overflow-auto max-h-[600px]">
            <Table className="relative">
              <TableHeader className="sticky top-0 z-10">
                <TableRow>
                  {/* Row headers */}
                  {rowDimensions.map(dim => (
                    <TableHead key={`header-${dim}`} isFirstColumn>
                      {dimensionOptions.find(d => d.value === dim)?.label}
                    </TableHead>
                  ))}
                  
                  {/* Column value headers */}
                  {pivotData.cols.map(col => (
                    <TableHead 
                      key={`col-${JSON.stringify(col)}`}
                      colSpan={measures.length}
                      className="text-center border-l"
                    >
                      {getDimensionKey(col, colDimensions)}
                    </TableHead>
                  ))}
                  
                  {/* Row totals header */}
                  {showRowTotals && (
                    <TableHead
                      colSpan={measures.length}
                      className="text-center border-l font-bold bg-muted/20"
                    >
                      Total
                    </TableHead>
                  )}
                </TableRow>
                
                <TableRow>
                  {/* Empty cells for row dimensions */}
                  {rowDimensions.map((dim, idx) => (
                    <TableHead key={`empty-${idx}`} />
                  ))}
                  
                  {/* Measure headers for each column */}
                  {pivotData.cols.map(col => (
                    measures.map(measure => (
                      <TableHead 
                        key={`col-${JSON.stringify(col)}-${measure}`}
                        className="text-xs font-normal border-l-0"
                      >
                        {getMeasureOption(measure)?.label}
                      </TableHead>
                    ))
                  ))}
                  
                  {/* Measure headers for row totals */}
                  {showRowTotals && measures.map(measure => (
                    <TableHead 
                      key={`total-${measure}`}
                      className="text-xs font-normal border-l bg-muted/20"
                    >
                      {getMeasureOption(measure)?.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {pivotData.rows.map(row => (
                  <TableRow key={`row-${JSON.stringify(row)}`}>
                    {/* Row dimension values */}
                    {rowDimensions.map(dim => (
                      <TableCell key={`row-${JSON.stringify(row)}-${dim}`} isFirstColumn>
                        {row[dim]}
                      </TableCell>
                    ))}
                    
                    {/* Cell values */}
                    {pivotData.cols.map(col => (
                      measures.map(measure => {
                        const rowKey = JSON.stringify(row);
                        const colKey = JSON.stringify(col);
                        const value = pivotData.data.get(rowKey)?.get(colKey)?.[measure] || 0;
                        
                        return renderMeasureCell(measure, value);
                      })
                    ))}
                    
                    {/* Row totals */}
                    {showRowTotals && measures.map(measure => {
                      const rowKey = JSON.stringify(row);
                      const value = pivotData.rowTotals.get(rowKey)?.[measure] || 0;
                      
                      return (
                        <TableCell 
                          key={`row-total-${rowKey}-${measure}`}
                          isNumeric 
                          isCurrency={getMeasureOption(measure)?.isCurrency}
                          isAverage={getMeasureOption(measure)?.isAverage}
                          className="font-medium bg-muted/20"
                        >
                          {formatMeasureValue(measure, value)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
              
              {showColTotals && (
                <TableFooter>
                  <TableRow isTotal>
                    {/* Total label */}
                    <TableCell colSpan={rowDimensions.length} isFirstColumn>
                      <span className="font-bold">Total</span>
                    </TableCell>
                    
                    {/* Column totals */}
                    {pivotData.cols.map(col => (
                      measures.map(measure => {
                        const colKey = JSON.stringify(col);
                        const value = pivotData.colTotals.get(colKey)?.[measure] || 0;
                        
                        return renderMeasureCell(measure, value);
                      })
                    ))}
                    
                    {/* Grand total */}
                    {showRowTotals && measures.map(measure => {
                      const value = pivotData.totals.get("grand")?.[measure] || 0;
                      
                      return renderMeasureCell(measure, value);
                    })}
                  </TableRow>
                  
                  {/* Class averages row */}
                  {showClassAvg && (
                    <TableRow>
                      <TableCell colSpan={rowDimensions.length} isFirstColumn>
                        <span className="font-medium text-blue-600">Class Average</span>
                      </TableCell>
                      
                      {/* Column averages */}
                      {pivotData.cols.map(col => (
                        measures.map(measure => {
                          const colKey = JSON.stringify(col);
                          const value = pivotData.colTotals.get(colKey)?.[measure] || 0;
                          const count = pivotData.colCounts.get(colKey)?.[measure] || 0;
                          
                          return renderMeasureCell(measure, value, true, count);
                        })
                      ))}
                      
                      {/* Grand averages */}
                      {showRowTotals && measures.map(measure => {
                        const value = pivotData.totals.get("grand")?.[measure] || 0;
                        const count = pivotData.grandCounts?.[measure] || 0;
                        
                        return renderMeasureCell(measure, value, true, count);
                      })}
                    </TableRow>
                  )}
                </TableFooter>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PivotTableView;
