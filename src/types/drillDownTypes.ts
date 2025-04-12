
export interface DrillDownData {
  data: any[];
  title: string;
  type: 'teacher' | 'class' | 'location' | 'month' | 'financial' | 'retention';
}

export interface DrillDownContextProps {
  drillDownData: DrillDownData | null;
  showDrillDown: (data: any, title: string, type: 'teacher' | 'class' | 'location' | 'month' | 'financial' | 'retention') => void;
  hideDrillDown: () => void;
  isVisible: boolean;
  drillDownTitle: string;
  drillDownType: 'teacher' | 'class' | 'location' | 'month' | 'financial' | 'retention' | '';
}
