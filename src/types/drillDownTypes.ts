
export interface DrillDownData {
  title: string;
  data: any;
  type: string;
}

export interface DrillDownContextProps {
  drillDownData: DrillDownData | null;
  setDrillDown: (data: DrillDownData | null) => void;
  showDrillDown: boolean;
  setShowDrillDown: (show: boolean) => void;
}
