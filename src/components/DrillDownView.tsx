
import React from 'react';
import { useDrillDown } from '@/contexts/DrillDownContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X } from 'lucide-react';
import { Button } from './ui/button';

const DrillDownView: React.FC = () => {
  const { drillDownData, showDrillDown, setShowDrillDown } = useDrillDown();

  if (!showDrillDown || !drillDownData) {
    return null;
  }

  return (
    <div className="drill-down-overlay" onClick={() => setShowDrillDown(false)}>
      <div className="drill-down-content" onClick={(e) => e.stopPropagation()}>
        <Card className="border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">{drillDownData.title}</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowDrillDown(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {drillDownData.type === 'table' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      {Object.keys(drillDownData.data[0] || {}).map((key) => (
                        <th key={key} className="p-2 text-left">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {drillDownData.data.map((row: any, index: number) => (
                      <tr key={index}>
                        {Object.values(row).map((value: any, i: number) => (
                          <td key={i} className="p-2">{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {drillDownData.type === 'chart' && (
              <div>
                <pre className="text-sm overflow-auto max-h-96 p-4 bg-muted/10 rounded-md">
                  {JSON.stringify(drillDownData.data, null, 2)}
                </pre>
              </div>
            )}
            
            {drillDownData.type === 'text' && (
              <div className="prose dark:prose-invert max-w-none">
                {typeof drillDownData.data === 'string' 
                  ? <p>{drillDownData.data}</p>
                  : <pre className="text-sm overflow-auto max-h-96 p-4 bg-muted/10 rounded-md">
                      {JSON.stringify(drillDownData.data, null, 2)}
                    </pre>
                }
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DrillDownView;
