
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
  monthYear: string;
  totalSessions: number;
  barreSessions: number;
  cycleSessions: number;
  barreCustomers: number;
  cycleCustomers: number;
  barrePaid: number;
  cyclePaid: number;
  totalRevenue: number;
  avgClassSize: number;
  Location: string;
  // Additional calculated fields
  totalBarreSessions?: number;
  totalCycleSessions?: number;
  totalBarreCustomers?: number;
  totalCycleCustomers?: number;
  totalBarrePaid?: number;
  totalCyclePaid?: number;
  avgBarreClassSize?: number | string;
  avgCycleClassSize?: number | string;
  barreRevenue?: number;  // Added for revenue chart
  cycleRevenue?: number;  // Added for revenue chart
  barreAttendance?: number;  // Added for attendance chart
  cycleAttendance?: number;  // Added for attendance chart
  totalRetained?: number;  // Added for funnel chart
  totalConverted?: number;  // Added for funnel chart
  totalNew?: number;  // Added for new customers metric
  mostPopularClass?: string;  // Added for class popularity metric
  revenuePerSeat?: number;  // Added for financials metrics
  avgRevenuePerSeat?: number; // Added for financials metrics
  seatUtilization?: number;  // Added for financials metrics
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
  teachers?: string[]; // Added for backwards compatibility
}

// View types for the dashboard
export type ViewType = 'overview' | 'teachers' | 'classes' | 'financials' | 'retention' | 'tables' | 'pivot';

// Recharts types - already present, keeping for reference
export type RechartsValueType = number | string | Array<string | number>;
export type RechartsNameType = string | number;

// DrillDown Context types
export interface DrillDownContextProps {
  showDrillDown: (data: any, title: string, type: 'teacher' | 'class' | 'location' | 'month' | 'financial' | 'retention') => void;
  hideDrillDown: () => void;
  isVisible: boolean;
  drillDownData: any;
  drillDownTitle: string;
  drillDownType: 'teacher' | 'class' | 'location' | 'month' | 'financial' | 'retention';
}

// SpeechRecognition globals
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}
