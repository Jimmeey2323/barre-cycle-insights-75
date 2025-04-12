
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  details: React.ReactNode;
  trend?: React.ReactNode;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon,
  details,
  trend
}) => {
  return (
    <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm animate-fade-in">
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
  );
};

export default MetricsCard;
