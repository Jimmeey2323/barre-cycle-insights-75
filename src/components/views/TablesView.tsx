
import React, { useState } from "react";
import { ProcessedData } from "@/types/fitnessTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TablesViewProps {
  data: ProcessedData;
  selectedMonths: string[];
  location: string;
}

const TablesView: React.FC<TablesViewProps> = ({ data, selectedMonths, location }) => {
  const [activeTab, setActiveTab] = useState("raw-data");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter the raw data based on selected months and location
  const filteredRawData = data.rawData.filter(item => {
    const matchesMonth = selectedMonths.length === 0 || selectedMonths.includes(item["Month Year"]);
    const matchesLocation = !location || item["Location"] === location;
    return matchesMonth && matchesLocation;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredRawData.length / itemsPerPage);
  const paginatedData = filteredRawData.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // Format currency values
  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
  };

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="text-gradient-barre">
          Detailed Data Tables
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            <TabsTrigger value="raw-data">Raw Data</TabsTrigger>
            <TabsTrigger value="teacher-data">Teacher Data</TabsTrigger>
            <TabsTrigger value="session-data">Session Data</TabsTrigger>
            <TabsTrigger value="revenue-data">Revenue Data</TabsTrigger>
          </TabsList>

          {/* Raw Data Table */}
          <TabsContent value="raw-data" className="space-y-4">
            <div className="rounded-md border">
              <Table className="table-compact">
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Total Sessions</TableHead>
                    <TableHead>Total Customers</TableHead>
                    <TableHead isNumeric>Total Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row["Month Year"]}</TableCell>
                      <TableCell>{row["Teacher Name"]}</TableCell>
                      <TableCell>{row["Location"]}</TableCell>
                      <TableCell>{row["Total Sessions"]}</TableCell>
                      <TableCell>{row["Total Customers"]}</TableCell>
                      <TableCell isNumeric>{formatCurrency(row["Total Paid"])}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show current page and surrounding pages
                  let pageNum = currentPage - 2 + i;
                  if (pageNum < 1) pageNum += 5;
                  if (pageNum > totalPages) pageNum -= 5;
                  if (pageNum >= 1 && pageNum <= totalPages) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          isActive={pageNum === currentPage} 
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </TabsContent>

          {/* Teacher Data Table */}
          <TabsContent value="teacher-data" className="space-y-4">
            <div className="rounded-md border">
              <Table className="table-compact">
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher Name</TableHead>
                    <TableHead>Teacher ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Barre Sessions</TableHead>
                    <TableHead>Cycle Sessions</TableHead>
                    <TableHead isNumeric>Barre Revenue</TableHead>
                    <TableHead isNumeric>Cycle Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row["Teacher Name"]}</TableCell>
                      <TableCell>{row["Teacher ID"]}</TableCell>
                      <TableCell>{row["Teacher Email"]}</TableCell>
                      <TableCell>{row["Barre Sessions"]}</TableCell>
                      <TableCell>{row["Cycle Sessions"]}</TableCell>
                      <TableCell isNumeric>{formatCurrency(row["Barre Paid"])}</TableCell>
                      <TableCell isNumeric>{formatCurrency(row["Cycle Paid"])}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pagination>
              {/* Same pagination as above */}
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage - 2 + i;
                  if (pageNum < 1) pageNum += 5;
                  if (pageNum > totalPages) pageNum -= 5;
                  if (pageNum >= 1 && pageNum <= totalPages) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          isActive={pageNum === currentPage} 
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </TabsContent>

          {/* Session Data Table */}
          <TabsContent value="session-data" className="space-y-4">
            <div className="rounded-md border">
              <Table className="table-compact">
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Total Sessions</TableHead>
                    <TableHead>Empty Sessions</TableHead>
                    <TableHead>Non-Empty Sessions</TableHead>
                    <TableHead>Barre Sessions</TableHead>
                    <TableHead>Cycle Sessions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row["Month Year"]}</TableCell>
                      <TableCell>{row["Location"]}</TableCell>
                      <TableCell>{row["Total Sessions"]}</TableCell>
                      <TableCell>{row["Total Empty Sessions"]}</TableCell>
                      <TableCell>{row["Total Non-Empty Sessions"]}</TableCell>
                      <TableCell>{row["Barre Sessions"]}</TableCell>
                      <TableCell>{row["Cycle Sessions"]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pagination>
              {/* Same pagination as above */}
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage - 2 + i;
                  if (pageNum < 1) pageNum += 5;
                  if (pageNum > totalPages) pageNum -= 5;
                  if (pageNum >= 1 && pageNum <= totalPages) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          isActive={pageNum === currentPage} 
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </TabsContent>

          {/* Revenue Data Table */}
          <TabsContent value="revenue-data" className="space-y-4">
            <div className="rounded-md border">
              <Table className="table-compact">
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Total Customers</TableHead>
                    <TableHead isNumeric>Barre Revenue</TableHead>
                    <TableHead isNumeric>Cycle Revenue</TableHead>
                    <TableHead isNumeric>Total Revenue</TableHead>
                    <TableHead>New</TableHead>
                    <TableHead>Retained</TableHead>
                    <TableHead>Converted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row["Month Year"]}</TableCell>
                      <TableCell>{row["Location"]}</TableCell>
                      <TableCell>{row["Total Customers"]}</TableCell>
                      <TableCell isNumeric>{formatCurrency(row["Barre Paid"])}</TableCell>
                      <TableCell isNumeric>{formatCurrency(row["Cycle Paid"])}</TableCell>
                      <TableCell isNumeric>{formatCurrency(row["Total Paid"])}</TableCell>
                      <TableCell>{row["New"]}</TableCell>
                      <TableCell>{row["Retained"]}</TableCell>
                      <TableCell>{row["Converted"]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pagination>
              {/* Same pagination as above */}
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage - 2 + i;
                  if (pageNum < 1) pageNum += 5;
                  if (pageNum > totalPages) pageNum -= 5;
                  if (pageNum >= 1 && pageNum <= totalPages) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          isActive={pageNum === currentPage} 
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TablesView;
