
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { RawDataRecord } from "@/types/fitnessTypes";
import { ArrowDownUp, DownloadIcon, ChevronsUpDown } from 'lucide-react';

interface PivotTableViewProps {
  data: RawDataRecord[];
  selectedMonths: string[];
  location: string;
}

const PivotTableView: React.FC<PivotTableViewProps> = ({ data, selectedMonths, location }) => {
  const [rowHeader, setRowHeader] = useState<string | null>(null);
  const [colHeader, setColHeader] = useState<string | null>(null);
  const [valueField, setValueField] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { toast } = useToast();

  // Filter data based on selectedMonths and location
  const filteredData = useMemo(() => {
    return data.filter(item => 
      (selectedMonths.length === 0 || selectedMonths.includes(String(item["Month Year"]))) &&
      (location === "" || location === "all" || item.Location === location) &&
      (debouncedSearchTerm === "" || 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
      )
    );
  }, [data, selectedMonths, location, debouncedSearchTerm]);

  // Available fields for selection
  const availableFields = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  // Process data for pivot table
  const groupedData = useMemo(() => {
    if (!filteredData || filteredData.length === 0 || !rowHeader || !colHeader || !valueField) {
      return {};
    }

    const result: Record<string, Record<string, number>> = {};
    
    filteredData.forEach((item) => {
      const rowValue = String(item[rowHeader as keyof typeof item] || 'Unknown');
      const colValue = String(item[colHeader as keyof typeof item] || 'Unknown');
      const value = Number(item[valueField as keyof typeof item] || 0);
      
      if (isNaN(value)) return;
      
      if (!result[rowValue]) {
        result[rowValue] = {};
      }
      
      if (!result[rowValue][colValue]) {
        result[rowValue][colValue] = 0;
      }
      
      result[rowValue][colValue] += value;
    });
    
    return result;
  }, [filteredData, rowHeader, colHeader, valueField]);

  const rowKeys = useMemo(() => {
    const keys = Object.keys(groupedData);
    
    if (sortBy === 'row') {
      return keys.sort((a, b) => {
        return sortDirection === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
      });
    }
    
    return keys;
  }, [groupedData, sortBy, sortDirection]);

  const colKeys = useMemo(() => {
    const keys = new Set<string>();
    
    Object.values(groupedData).forEach((row) => {
      Object.keys(row).forEach((key) => keys.add(key));
    });
    
    const keysArray = Array.from(keys);
    
    if (sortBy === 'column') {
      return keysArray.sort((a, b) => {
        return sortDirection === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
      });
    }
    
    return keysArray;
  }, [groupedData, sortBy, sortDirection]);

  // Calculated totals for each row and column
  const rowTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    rowKeys.forEach(row => {
      totals[row] = colKeys.reduce((sum, col) => {
        return sum + (groupedData[row]?.[col] || 0);
      }, 0);
    });
    
    return totals;
  }, [rowKeys, colKeys, groupedData]);

  const colTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    colKeys.forEach(col => {
      totals[col] = rowKeys.reduce((sum, row) => {
        return sum + (groupedData[row]?.[col] || 0);
      }, 0);
    });
    
    return totals;
  }, [rowKeys, colKeys, groupedData]);

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

  const handleExportCSV = () => {
    if (!rowHeader || !colHeader || !valueField) {
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
        rowData.push(String(groupedData[row]?.[col] || 0));
      });
      
      // Add row total
      rowData.push(String(rowTotals[row]));
      
      return rowData.join(',');
    });
    
    // Add totals row
    const totalsRow = ['Total'];
    colKeys.forEach(col => {
      totalsRow.push(String(colTotals[col]));
    });
    totalsRow.push(String(grandTotal));
    
    // Combine all into CSV content
    const csvContent = [
      csvHeader.join(','),
      ...csvRows,
      totalsRow.join(',')
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pivot-table-${rowHeader}-${colHeader}-${valueField}.csv`);
    link.click();
    
    toast({
      title: "Export successful",
      description: "Pivot table data has been exported as CSV."
    });
  };

  return (
    <div className="w-full space-y-4">
      <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle>Pivot Table Configuration</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="row-header">Row Header</Label>
            <Select onValueChange={setRowHeader}>
              <SelectTrigger id="row-header">
                <SelectValue placeholder="Select Row Header" />
              </SelectTrigger>
              <SelectContent>
                {availableFields.map((field) => (
                  <SelectItem key={field} value={field}>{field}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="col-header">Column Header</Label>
            <Select onValueChange={setColHeader}>
              <SelectTrigger id="col-header">
                <SelectValue placeholder="Select Column Header" />
              </SelectTrigger>
              <SelectContent>
                {availableFields.map((field) => (
                  <SelectItem key={field} value={field}>{field}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="value-field">Value Field</Label>
            <Select onValueChange={setValueField}>
              <SelectTrigger id="value-field">
                <SelectValue placeholder="Select Value Field" />
              </SelectTrigger>
              <SelectContent>
                {availableFields.map((field) => (
                  <SelectItem key={field} value={field}>{field}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {rowHeader && colHeader && valueField && (
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
                  {rowHeader} by {colHeader} (Sum of {valueField})
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
                          {rowHeader}
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
                      
                      <TableHead className="font-bold">Total</TableHead>
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
                            {groupedData[row]?.[col] || 0}
                          </TableCell>
                        ))}
                        
                        <TableCell className="font-bold text-right">{rowTotals[row]}</TableCell>
                      </TableRow>
                    ))}
                    
                    <TableRow className="bg-muted/30 font-bold">
                      <TableCell>Total</TableCell>
                      
                      {colKeys.map((col, i) => (
                        <TableCell 
                          key={`total-${i}`}
                          className="text-right"
                        >
                          {colTotals[col]}
                        </TableCell>
                      ))}
                      
                      <TableCell className="text-right">{grandTotal}</TableCell>
                    </TableRow>
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
