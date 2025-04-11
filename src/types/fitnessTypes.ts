
export interface FitnessRecord {
  "Teacher ID": string;
  "Teacher Name": string;
  "Teacher Email": string;
  "Location": string;
  "Cycle Sessions": string;
  "Empty Cycle Sessions": string;
  "Non-Empty Cycle Sessions": string;
  "Cycle Customers": string;
  "Cycle Paid": string;
  "Barre Sessions": string;
  "Empty Barre Sessions": string;
  "Non-Empty Barre Sessions": string;
  "Barre Customers": string;
  "Barre Paid": string;
  "Total Sessions": string;
  "Total Empty Sessions": string;
  "Total Non-Empty Sessions": string;
  "Total Customers": string;
  "Total Paid": string;
  "Month Year": string;
  "New": string;
  "Retained": string;
  "Converted": string;
  "Retention": string;
  "Conversion": string;
  "Class Avg - Barre": string;
  "Class Avg - Cycle": string;
  "Class Avg - Combined": string;
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
  totalRetained: number;
  totalConverted: number;
}

export interface ProcessedData {
  monthlyStats: MonthlyStats[];
  rawData: FitnessRecord[];
}

export type ViewType = 'overview' | 'teachers' | 'classes' | 'financials' | 'retention';
export type ChartType = 'bar' | 'line' | 'pie' | 'area';

// Recharts types for type safety
export type RechartsValueType = string | number | Array<string | number>;
export type RechartsNameType = string | number;
