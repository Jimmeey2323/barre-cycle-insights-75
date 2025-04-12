
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatNumber, formatPercent } from "@/lib/formatters";

interface FunnelStage {
  id: string;
  label: string;
  value: number;
  color: string;
  previousStageId?: string;
  conversionRate?: number;
  detailedInfo?: string;
}

interface FunnelChartProps {
  title: string;
  stages: FunnelStage[];
  height?: number;
}

const FunnelChart: React.FC<FunnelChartProps> = ({ 
  title, 
  stages,
  height = 250
}) => {
  // Calculate max width for scaling
  const maxValue = Math.max(...stages.map(stage => stage.value));
  
  return (
    <Card className="overflow-hidden border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="relative" style={{ height: `${height}px` }}>
          {stages.map((stage, index) => {
            const width = stage.value > 0 ? (stage.value / maxValue * 80) + 20 : 20; // Min 20%, max 100%
            const prevStage = stage.previousStageId 
              ? stages.find(s => s.id === stage.previousStageId)
              : null;
            
            const conversionRate = prevStage && prevStage.value > 0
              ? (stage.value / prevStage.value * 100)
              : null;
            
            return (
              <div key={stage.id} className="funnel-stage-container my-2 flex items-center px-2">
                <div
                  className="funnel-stage relative rounded-sm p-2 text-white transition-all duration-300 hover:opacity-90"
                  style={{
                    width: `${width}%`,
                    backgroundColor: stage.color,
                    minHeight: '40px'
                  }}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex w-full cursor-pointer items-center justify-between">
                          <div>
                            <span className="text-sm font-semibold">{stage.label}</span>
                          </div>
                          <div className="text-sm font-bold">{formatNumber(stage.value)}</div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="w-[260px] p-4" side="right">
                        <p className="font-semibold">{stage.label}</p>
                        <p className="text-sm text-muted-foreground">{stage.detailedInfo || 'No additional details available'}</p>
                        {prevStage && (
                          <>
                            <div className="mt-2 text-sm font-semibold">Conversion rate from {prevStage.label}</div>
                            <div className="text-sm">
                              {conversionRate !== null ? formatPercent(conversionRate.toString()) : 'N/A'}
                              <span className="text-xs text-muted-foreground"> ({stage.value} out of {prevStage.value})</span>
                            </div>
                          </>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {/* Show conversion rate between stages */}
                {prevStage && (
                  <div className="conversion-connector px-2 text-xs font-medium text-muted-foreground">
                    {conversionRate !== null ? formatPercent(conversionRate.toString()) : '-'}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Flow connections - can be added for a more advanced visual */}
          {/* This would require more advanced SVG paths between the stages */}
        </div>
      </CardContent>
    </Card>
  );
};

export default FunnelChart;
