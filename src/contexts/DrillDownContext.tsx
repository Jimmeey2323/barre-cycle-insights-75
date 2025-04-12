
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { DrillDownContextProps, DrillDownData } from '@/types/drillDownTypes';

// Create context with default values
const DrillDownContext = createContext<DrillDownContextProps>({
  drillDownData: null,
  setDrillDown: () => {},
  showDrillDown: false,
  setShowDrillDown: () => {}
});

interface DrillDownProviderProps {
  children: ReactNode;
}

export const DrillDownProvider = ({ children }: DrillDownProviderProps) => {
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [showDrillDown, setShowDrillDown] = useState(false);

  const setDrillDown = (data: DrillDownData | null) => {
    setDrillDownData(data);
  };

  return (
    <DrillDownContext.Provider value={{ 
      drillDownData, 
      setDrillDown,
      showDrillDown,
      setShowDrillDown
    }}>
      {children}
    </DrillDownContext.Provider>
  );
};

export const useDrillDown = () => useContext(DrillDownContext);
