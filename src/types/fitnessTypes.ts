
export interface RawDataRecord {
  [key: string]: any;
  "Month Year": string;
  "Teacher Name": string;
  "Location": string;
  "Total Sessions": number;
  "Barre Sessions": number;
  "Cycle Sessions": number;
  "Total Customers": number;
  "Barre Customers": number;
  "Cycle Customers": number;
  "Total Paid": number;
  "Barre Paid": number;
  "Cycle Paid": number;
  "Empty Barre Sessions": number;
  "Empty Cycle Sessions": number;
  "Non-Empty Barre Sessions": number;
  "Non-Empty Cycle Sessions": number;
  "New": number;
  "Retained": number;
  "Converted": number;
  "Avg Barre Class Size": string;
  "Avg Cycle Class Size": string;
}

export interface MonthlyStats {
  monthYear: string;
  totalBarreSessions: number;
  totalCycleSessions: number;
  totalBarreCustomers: number;
  totalCycleCustomers: number;
  totalBarrePaid: number;
  totalCyclePaid: number;
  avgBarreClassSize: string;
  avgCycleClassSize: string;
}

export interface ProcessedData {
  rawData: RawDataRecord[];
  monthlyStats: MonthlyStats[];
  locations: string[];
  teachers: string[];
}

export type RechartsValueType = number | string | Array<number | string>;
export type RechartsNameType = number | string;

export type ViewType = 
  | "overview" 
  | "teachers" 
  | "classes" 
  | "financials" 
  | "retention" 
  | "tables" 
  | "pivot";

export interface DrillDownDataItem {
  [key: string]: any;
  name?: string;
}

export interface PaginatedData<T> {
  data: T[];
  pageCount: number;
  pageSize: number;
  currentPage: number;
}

export type SortDirection = "asc" | "desc";

export interface SortState {
  column: string | null;
  direction: SortDirection;
}
