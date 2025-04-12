
import React, { createContext, useContext, useState, ReactNode } from 'react';

type DrillDownType = 'teacher' | 'class' | 'location' | 'month' | 'financial' | 'retention' | null;

interface DrillDownData {
  type: DrillDownType;
  title: string;
  data: any;
  filter?: Record<string, any>;
}

interface DrillDownContextProps {
  drillDownData: DrillDownData | null;
  setDrillDown: (data: DrillDownData | null) => void;
  closeDrillDown: () => void;
}

const DrillDownContext = createContext<DrillDownContextProps>({
  drillDownData: null,
  setDrillDown: () => {},
  closeDrillDown: () => {},
});

export const useDrillDown = () => useContext(DrillDownContext);

interface DrillDownProviderProps {
  children: ReactNode;
}

export const DrillDownProvider: React.FC<DrillDownProviderProps> = ({ children }) => {
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);

  const setDrillDown = (data: DrillDownData | null) => {
    setDrillDownData(data);
    
    // When opening a drill down, prevent body scrolling
    if (data) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const closeDrillDown = () => {
    setDrillDownData(null);
    document.body.style.overflow = '';
  };

  return (
    <DrillDownContext.Provider
      value={{
        drillDownData,
        setDrillDown,
        closeDrillDown,
      }}
    >
      {children}
      {drillDownData && (
        <div 
          className="drill-down-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeDrillDown();
            }
          }}
        >
          <div className="drill-down-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-semibold">{drillDownData.title}</h2>
              <button 
                className="p-2 hover:bg-muted/50 rounded-full"
                onClick={closeDrillDown}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="p-6">
              {typeof drillDownData.data === 'function' 
                ? drillDownData.data()
                : drillDownData.data}
            </div>
          </div>
        </div>
      )}
    </DrillDownContext.Provider>
  );
};
