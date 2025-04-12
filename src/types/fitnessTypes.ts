// Basic types for fitness data
export interface RawDataRecord {
  [key: string]: string | number;
  "Month Year": string;
  Location: string;
  Teacher: string;
  "Teacher Name": string;
  "Teacher Email": string;
  Type: string;
  "Total Sessions": number;
  "Barre Sessions": number;
  "Cycle Sessions": number;
  "Barre Customers": number;
  "Cycle Customers": number;
  "Barre Paid": number;
  "Cycle Paid": number;
  "Non-Empty Barre Sessions": number;
  "Non-Empty Cycle Sessions": number;
}

export interface MonthlyStats {
  month: string;
  totalSessions: number;
  barreSessions: number;
  cycleSessions: number;
  barreCustomers: number;
  cycleCustomers: number;
  barrePaid: number;
  cyclePaid: number;
  totalRevenue: number;
  avgClassSize: number;
}

export interface TeacherStats {
  name: string;
  email: string;
  barreSessions: number;
  cycleSessions: number;
  barreCustomers: number;
  cycleCustomers: number;
  barrePaid: number;
  cyclePaid: number;
  totalSessions: number;
  avgBarreClassSize: number;
  avgCycleClassSize: number;
}

export interface ProcessedData {
  rawData: RawDataRecord[];
  monthlyStats: MonthlyStats[];
  teacherStats: TeacherStats[];
  locations: string[];
  months: string[];
  trainers: string[];
  classTypes: string[];
}

// View types for the dashboard
export type ViewType = 'overview' | 'teachers' | 'classes' | 'financials' | 'retention' | 'tables' | 'pivot';

// Recharts types - already present, keeping for reference
export type RechartsValueType = number | string | Array<string | number>;
export type RechartsNameType = string | number;

// SpeechRecognition globals
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}
