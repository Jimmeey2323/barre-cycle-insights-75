
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ProcessedData } from "@/types/fitnessTypes";
import { FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FilterControlsProps {
  allMonths: string[];
  selectedMonths: string[];
  setSelectedMonths: (months: string[]) => void;
  location: string;
  setLocation: (location: string) => void;
  data: ProcessedData;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  allMonths,
  selectedMonths,
  setSelectedMonths,
  location,
  setLocation,
  data
}) => {
  // Get unique locations from the data
  const locations = Array.from(new Set(data.rawData.map(item => item.Location)));

  const handleMonthToggle = (month: string) => {
    if (selectedMonths.includes(month)) {
      setSelectedMonths(selectedMonths.filter(m => m !== month));
    } else {
      setSelectedMonths([...selectedMonths, month]);
    }
  };

  const selectAllMonths = () => {
    setSelectedMonths([...allMonths]);
  };

  const clearMonths = () => {
    setSelectedMonths([]);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex-grow">
        <Label htmlFor="location" className="mb-1 block text-sm font-medium">
          Location
        </Label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger id="location">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Locations</SelectItem>
            {locations.map(loc => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-grow">
        <Label className="mb-1 block text-sm font-medium">Month Filter</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>{selectedMonths.length} of {allMonths.length} selected</span>
              <FilterIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="end">
            <div className="border-b p-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filter by Month</h4>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={selectAllMonths} className="h-8 px-2 text-xs">
                    Select All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearMonths} className="h-8 px-2 text-xs">
                    Clear
                  </Button>
                </div>
              </div>
            </div>
            <div className="max-h-[300px] overflow-auto p-3">
              {allMonths.sort((a, b) => {
                // Parse "MMM-YYYY" format
                const [aMonth, aYear] = a.split('-');
                const [bMonth, bYear] = b.split('-');
                
                const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                
                const yearComparison = Number(aYear) - Number(bYear);
                if (yearComparison !== 0) return yearComparison;
                
                return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
              }).map(month => (
                <div key={month} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`month-${month}`}
                    checked={selectedMonths.includes(month)}
                    onCheckedChange={() => handleMonthToggle(month)}
                  />
                  <Label htmlFor={`month-${month}`} className="cursor-pointer text-sm">
                    {month}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default FilterControls;
