
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { DrillDownContextProps } from '@/types/drillDownTypes';

// Create context with default values
const DrillDownContext = createContext<DrillDownContextProps>({
  drillDownData: null,
  showDrillDown: () => {},
  hideDrillDown: () => {},
  isVisible: false,
  drillDownTitle: '',
  drillDownType: '',
});

interface DrillDownProviderProps {
  children: ReactNode;
}

export const DrillDownProvider = ({ children }: DrillDownProviderProps) => {
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [drillDownTitle, setDrillDownTitle] = useState('');
  const [drillDownType, setDrillDownType] = useState<'teacher' | 'class' | 'location' | 'month' | 'financial' | 'retention' | ''>('');

  const showDrillDown = (data: any, title: string, type: 'teacher' | 'class' | 'location' | 'month' | 'financial' | 'retention') => {
    setDrillDownData(data);
    setDrillDownTitle(title);
    setDrillDownType(type);
    setIsVisible(true);
  };

  const hideDrillDown = () => {
    setIsVisible(false);
    setDrillDownData(null);
    setDrillDownTitle('');
    setDrillDownType('');
  };

  return (
    <DrillDownContext.Provider value={{ 
      drillDownData, 
      showDrillDown,
      hideDrillDown,
      isVisible,
      drillDownTitle,
      drillDownType
    }}>
      {children}
    </DrillDownContext.Provider>
  );
};

export const useDrillDown = () => useContext(DrillDownContext);
