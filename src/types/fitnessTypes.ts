
export type ViewType = "overview" | "teachers" | "classes" | "financials" | "retention";

export interface RawFitnessData {
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
  [key: string]: string;
}

export interface MonthlyStat {
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
  totalNew: number;
}

export interface ProcessedData {
  rawData: RawFitnessData[];
  monthlyStats: MonthlyStat[];
}

// For typing Recharts data
export type RechartsValueType = string | number | Array<string | number>;
export type RechartsNameType = string | number;
