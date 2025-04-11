
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthSelectorProps {
  months: string[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  months,
  selectedMonth,
  setSelectedMonth,
}) => {
  const sortedMonths = [...months].sort((a, b) => {
    // Parse "MMM-YYYY" format
    const [aMonth, aYear] = a.split('-');
    const [bMonth, bYear] = b.split('-');
    
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const yearComparison = Number(aYear) - Number(bYear);
    if (yearComparison !== 0) return yearComparison;
    
    return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
  });

  const currentIndex = sortedMonths.indexOf(selectedMonth);
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setSelectedMonth(sortedMonths[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < sortedMonths.length - 1) {
      setSelectedMonth(sortedMonths[currentIndex + 1]);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        disabled={currentIndex <= 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Select Month" />
        </SelectTrigger>
        <SelectContent>
          {sortedMonths.map((month) => (
            <SelectItem key={month} value={month}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={currentIndex >= sortedMonths.length - 1}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MonthSelector;
