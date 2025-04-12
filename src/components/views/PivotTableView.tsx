
import React, { useState, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Filter,
  Grid3X3,
  Grid,
  IndianRupee,
  LayoutGrid,
  MoreHorizontal,
  RefreshCw,
  RotateCw,
  Search
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PivotTableViewProps {
  data: any[];
}

// Create a simple useDebounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const PivotTableView: React.FC<PivotTableViewProps> = ({ data }) => {
  const [rowHeader, setRowHeader] = useState<string | null>(null);
  const [colHeader, setColHeader] = useState<string | null>(null);
  const [valueField, setValueField] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [enableGrouping, setEnableGrouping] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { toast } = useToast();

  const availableFields = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const groupedData = useMemo(() => {
    if (!data || data.length === 0 || !rowHeader || !colHeader || !valueField) {
      return {};
    }

    const result: { [key: string]: { [key: string]: number } } = {};

    data.forEach((item) => {
      const rowValue = item[rowHeader] as string;
      const colValue = item[colHeader] as string;
      const value = Number(item[valueField]);

      if (!result[rowValue]) {
        result[rowValue] = {};
      }

      if (!result[rowValue][colValue]) {
        result[rowValue][colValue] = 0;
      }

      result[rowValue][colValue] += value;
    });

    return result;
  }, [data, rowHeader, colHeader, valueField]);

  const rowKeys = useMemo(() => Object.keys(groupedData), [groupedData]);
  
  const colKeys = useMemo(() => {
    const keys = new Set<string>();
    Object.values(groupedData).forEach((row) => {
      Object.keys(row).forEach((key) => keys.add(key));
    });
    return Array.from(keys);
  }, [groupedData]);

  const tableData = useMemo(() => {
    return rowKeys.map((rowKey) => {
      const rowData: { [key: string]: string | number } = { [rowHeader as string]: rowKey };
      colKeys.forEach((colKey) => {
        rowData[colKey] = groupedData[rowKey][colKey] || 0;
      });
      return rowData;
    });
  }, [groupedData, rowKeys, colKeys, rowHeader]);

  const [sorting, setSorting] = useState<any[]>([]);

  return (
    <div className="w-full space-y-4">
      <Card>
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
        <Card>
          <CardHeader>
            <CardTitle>Pivot Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead isFirstColumn>{rowHeader}</TableHead>
                    {colKeys.map((col, i) => (
                      <TableHead key={`col-${i}`}>{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rowKeys.map((row, i) => (
                    <TableRow key={`row-${i}`}>
                      <TableCell isFirstColumn className="font-medium">{row}</TableCell>
                      {colKeys.map((col, j) => (
                        <TableCell key={`value-${i}-${j}`}>
                          {groupedData[row][col] || 0}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PivotTableView;
