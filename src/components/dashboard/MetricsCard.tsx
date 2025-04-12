
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  details: React.ReactNode;
  trend?: React.ReactNode;
  tooltipContent?: React.ReactNode;
  calculationDetails?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon,
  details,
  trend,
  tooltipContent,
  calculationDetails
}) => {
  return (
    <HoverCard openDelay={100} closeDelay={200}>
      <HoverCardTrigger asChild>
        <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm animate-fade-in hover:border-primary/30 transition-all duration-200 cursor-help">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                {icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">{title}</p>
                  {trend}
                </div>
                <div className="text-2xl font-bold animate-fade-up">
                  {value}
                </div>
                <p className="text-xs text-muted-foreground">{details}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="max-w-[300px] p-4 z-50">
        <div className="space-y-2">
          <p className="font-semibold">{title}</p>
          {tooltipContent && <div className="text-sm">{tooltipContent}</div>}
          {calculationDetails && (
            <>
              <p className="text-xs font-medium pt-2">Calculation:</p>
              <p className="text-xs text-muted-foreground font-mono bg-muted/30 p-2 rounded">{calculationDetails}</p>
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default MetricsCard;
