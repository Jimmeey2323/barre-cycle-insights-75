
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { motion } from "framer-motion";

interface AttendanceData {
  name: string;
  barreAttendance: number;
  cycleAttendance: number;
  barreAvg: number;
  cycleAvg: number;
}

interface AttendanceChartProps {
  data: AttendanceData[];
  onDrillDown: (data: any, title: string) => void;
  chartConfig: any;
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ data, onDrillDown, chartConfig }) => {
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
            <Users className="h-5 w-5 mr-2 text-blue-400" />
            Class Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ChartContainer 
            className="h-full"
            config={chartConfig}
          >
            <BarChart 
              data={data}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              onClick={(data) => onDrillDown(data, 'Attendance for')}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                tick={{ fill: 'var(--foreground)', fontSize: 12 }}
              />
              <Tooltip 
                content={<ChartTooltipContent labelFormatter={(label) => `Month: ${label}`} />} 
                wrapperStyle={{ zIndex: 1000 }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar 
                dataKey="barreAttendance" 
                name="Barre Attendance" 
                fill="hsl(var(--barre))"
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
              <Bar 
                dataKey="cycleAttendance" 
                name="Cycle Attendance" 
                fill="#0EA5E9"
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
                animationBegin={300}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AttendanceChart;
