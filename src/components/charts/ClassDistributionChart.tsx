
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { 
  PieChart, Pie, Cell, Tooltip, Legend
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { motion } from "framer-motion";

interface ClassDistributionChartProps {
  data: { 
    name: string; 
    value: number; 
    fill: string;
  }[];
  chartConfig: any;
}

const ClassDistributionChart: React.FC<ClassDistributionChartProps> = ({ data, chartConfig }) => {
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
            <Dumbbell className="h-5 w-5 mr-2 text-amber-400" />
            Class Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ChartContainer 
            className="h-full"
            config={chartConfig}
          >
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => {
                  const percentValue = percent !== undefined ? (percent * 100).toFixed(0) : '0';
                  return `${name}: ${percentValue}%`;
                }}
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={1800}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                content={<ChartTooltipContent />} 
                wrapperStyle={{ zIndex: 1000 }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ClassDistributionChart;
