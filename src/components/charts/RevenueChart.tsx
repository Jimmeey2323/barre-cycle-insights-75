
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
} from 'recharts';
import { formatINR } from "@/lib/formatters";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { motion } from "framer-motion";

interface RevenueChartProps {
  data: {
    name: string;
    revenue: number;
    barreRev: number;
    cycleRev: number;
  }[];
  onDrillDown: (data: any, title: string) => void;
  chartConfig: any;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, onDrillDown, chartConfig }) => {
  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <motion.div variants={chartVariants}>
      <Card className="overflow-hidden backdrop-blur-sm border-border/50 bg-gradient-to-br from-background to-background/80">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <IndianRupee className="h-5 w-5 mr-2 text-green-400" />
            Revenue Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ChartContainer 
            className="h-full"
            config={chartConfig}
          >
            <LineChart 
              data={data}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              onClick={(data) => onDrillDown(data, 'Revenue for')}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                tickFormatter={(value) => formatINR(value)} 
                tick={{ fill: 'var(--foreground)', fontSize: 12 }}
              />
              <Tooltip 
                content={<ChartTooltipContent labelFormatter={(label) => `Month: ${label}`} />} 
                wrapperStyle={{ zIndex: 1000 }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Total Revenue" 
                stroke="var(--chart-primary)" 
                strokeWidth={2}
                activeDot={{ r: 8, strokeWidth: 1 }}
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={1500}
              />
              <Line 
                type="monotone" 
                dataKey="barreRev" 
                name="Barre Revenue" 
                stroke="hsl(var(--barre))" 
                activeDot={{ r: 6 }}
                isAnimationActive={true}
                animationBegin={300}
                animationDuration={1500}
              />
              <Line 
                type="monotone" 
                dataKey="cycleRev" 
                name="Cycle Revenue" 
                stroke="hsl(var(--cycle))" 
                activeDot={{ r: 6 }}
                isAnimationActive={true}
                animationBegin={600}
                animationDuration={1500}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RevenueChart;
