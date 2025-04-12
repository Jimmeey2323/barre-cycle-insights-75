import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedData } from "@/types/fitnessTypes";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn, sortData } from "@/lib/utils";
import { formatINR } from "@/lib/formatters";

interface TablesViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const TablesView: React.FC<TablesViewProps> = ({ data, selectedMonths, location }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof any>("Month Year");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeTable, setActiveTable] = useState<"rawData" | "monthlyStats">("rawData");

  // Filter data based on selected months and location
  const filteredRawData = useMemo(() => {
    return data.rawData.filter(record =>
      (selectedMonths.length === 0 || selectedMonths.includes(record["Month Year"])) &&
      (location === "" || record.Location === location) &&
      Object.values(record).some(value =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data.rawData, selectedMonths, location, searchQuery]);

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
    return sortData(filteredRawData, sortColumn, sortDirection);
  }, [filteredRawData, sortColumn, sortDirection]);

  const sortedMonthlyStats = useMemo(() => {
    return sortData(filteredMonthlyStats, sortColumn, sortDirection);
  }, [filteredMonthlyStats, sortColumn, sortDirection]);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSort = (column: keyof any) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const RawDataTable = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Object.keys(data.rawData[0]).map((header) => (
              <TableHead key={header} onClick={() => handleSort(header)}>
                {header}
                {sortColumn === header && (
                  sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4 inline-block" /> : <ArrowDown className="ml-2 h-4 w-4 inline-block" />
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRawData.map((record, index) => (
            <TableRow key={index}>
              {Object.entries(record).map(([key, value], i) => (
                <TableCell key={i}>
                  {typeof value === 'number' ? value : String(value)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const MonthlyStatsTable = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Object.keys(data.monthlyStats[0]).map((header) => (
              <TableHead key={header} onClick={() => handleSort(header)}>
                {header}
                {sortColumn === header && (
                  sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4 inline-block" /> : <ArrowDown className="ml-2 h-4 w-4 inline-block" />
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMonthlyStats.map((item, index) => (
            <TableRow key={index}>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Input
              type="search"
              placeholder="Search table..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Select value={activeTable} onValueChange={setActiveTable}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rawData">Raw Data</SelectItem>
                <SelectItem value="monthlyStats">Monthly Stats</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {activeTable === "rawData" ? (
            data.rawData.length > 0 ? <RawDataTable /> : <p>No Raw Data available</p>
          ) : (
            data.monthlyStats.length > 0 ? <MonthlyStatsTable /> : <p>No Monthly Stats available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TablesView;
