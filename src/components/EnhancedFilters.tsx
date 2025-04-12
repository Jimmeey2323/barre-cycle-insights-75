
import React, { useState } from 'react';
import { ProcessedData } from "@/types/fitnessTypes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, ChevronDown, ChevronsUpDown, Filter, Map, Users, Activity, Calendar } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { MultiSelect } from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";

interface EnhancedFiltersProps {
  data: ProcessedData;
  selectedMonths: string[];
  setSelectedMonths: (months: string[]) => void;
  location: string;
  setLocation: (location: string) => void;
  trainers?: string[];
  setTrainers?: (trainers: string[]) => void;
  classTypes?: string[];
  setClassTypes?: (types: string[]) => void;
  view?: string;
  setView?: (view: string) => void;
}

const EnhancedFilters: React.FC<EnhancedFiltersProps> = ({
  data,
  selectedMonths,
  setSelectedMonths,
  location,
  setLocation,
  trainers = [],
  setTrainers = () => {},
  classTypes = [],
  setClassTypes = () => {},
  view = "all",
  setView = () => {}
}) => {
  const [openLocation, setOpenLocation] = useState(false);
  const [openMonths, setOpenMonths] = useState(false);
  const [openTrainers, setOpenTrainers] = useState(false);
  const [openClasses, setOpenClasses] = useState(false);
  
  const allMonths = data.monthlyStats.map(stat => stat.monthYear)
    .sort((a, b) => {
      const [aMonth, aYear] = a.split('-');
      const [bMonth, bYear] = b.split('-');
      
      const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      const yearComparison = Number(aYear) - Number(bYear);
      if (yearComparison !== 0) return yearComparison;
      
      return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
    });
  
  const locations = ["all", ...(data.locations || [])];
  const allTrainers = [...new Set(data.rawData.map(item => item.Teacher || ""))].filter(Boolean);
  const allClassTypes = [...new Set(data.rawData.map(item => item.Type || ""))].filter(Boolean);
  
  // Convert trainers and class types to option format for MultiSelect
  const trainerOptions = allTrainers.map(trainer => ({ label: String(trainer), value: String(trainer) }));
  const classTypeOptions = allClassTypes.map(type => ({ label: String(type), value: String(type) }));
  
  const monthGroups = allMonths.reduce((groups: Record<string, string[]>, month) => {
    const [_, year] = month.split('-');
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(month);
    return groups;
  }, {});
  
  // Quick selection options
  const selectAllMonths = () => setSelectedMonths([...allMonths]);
  const clearAllMonths = () => setSelectedMonths([]);
  const selectLastThreeMonths = () => setSelectedMonths(allMonths.slice(-3));
  const selectCurrentYear = () => {
    const currentYear = new Date().getFullYear().toString();
    setSelectedMonths(allMonths.filter(month => month.endsWith(currentYear)));
  };

  return (
    <div className="py-2">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <Popover open={openMonths} onOpenChange={setOpenMonths}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between border-dashed"
              role="combobox"
              aria-expanded={openMonths}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {selectedMonths.length === 0 
                    ? "Select Months" 
                    : selectedMonths.length === 1
                      ? selectedMonths[0]
                      : `${selectedMonths.length} months selected`}
                </span>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <div className="p-2 flex flex-wrap gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
                onClick={selectLastThreeMonths}
              >
                Last 3 Months
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
                onClick={selectCurrentYear}
              >
                This Year
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
                onClick={selectAllMonths}
              >
                All Time
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
                onClick={clearAllMonths}
              >
                Clear
              </Button>
            </div>
            <Command className="max-h-[400px] overflow-auto">
              <CommandInput placeholder="Search months..." />
              <CommandEmpty>No month found.</CommandEmpty>
              <CommandGroup>
                {Object.entries(monthGroups).map(([year, months]) => (
                  <div key={year} className="p-1">
                    <h3 className="font-medium text-xs px-2 py-1.5">{year}</h3>
                    <div className="grid grid-cols-4 gap-1 px-1">
                      {months.map(month => (
                        <Badge 
                          key={month}
                          variant={selectedMonths.includes(month) ? "default" : "outline"} 
                          className={cn(
                            "cursor-pointer text-xs py-1 px-2",
                            selectedMonths.includes(month) ? 
                              "hover:bg-primary/80" : 
                              "hover:bg-muted"
                          )}
                          onClick={() => {
                            if (selectedMonths.includes(month)) {
                              setSelectedMonths(selectedMonths.filter(m => m !== month));
                            } else {
                              setSelectedMonths([...selectedMonths, month]);
                            }
                          }}
                        >
                          {month.split('-')[0]}
                        </Badge>
                      ))}
                    </div>
                    <Separator className="my-1" />
                  </div>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover open={openLocation} onOpenChange={setOpenLocation}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openLocation}
              className="w-full justify-between border-dashed"
            >
              <div className="flex items-center gap-2">
                <Map className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {location === "all" ? "All Locations" : location || "Select Location"}
                </span>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search location..." className="h-9" />
              <CommandList>
                <CommandEmpty>No location found.</CommandEmpty>
                <CommandGroup>
                  {locations.map((loc) => (
                    <CommandItem
                      key={loc}
                      value={loc}
                      onSelect={() => {
                        setLocation(loc);
                        setOpenLocation(false);
                      }}
                      className="cursor-pointer"
                    >
                      <div className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        location === loc 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "opacity-50 border-muted-foreground"
                      )}>
                        {location === loc && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 5L3.5 7.5L9 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      {loc === "all" ? "All Locations" : loc}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        <Popover open={openTrainers} onOpenChange={setOpenTrainers}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openTrainers}
              className="w-full justify-between border-dashed"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {trainers.length === 0 
                    ? "Select Trainers" 
                    : trainers.length === 1
                      ? trainers[0]
                      : `${trainers.length} trainers selected`}
                </span>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0" align="start">
            <div className="p-2 flex flex-wrap gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => setTrainers(allTrainers.map(t => String(t)))}
              >
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => setTrainers([])}
              >
                Clear
              </Button>
            </div>
            <div className="p-2">
              <MultiSelect
                options={trainerOptions}
                selected={trainers}
                onChange={setTrainers}
                placeholder="Select trainers..."
              />
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover open={openClasses} onOpenChange={setOpenClasses}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openClasses}
              className="w-full justify-between border-dashed"
            >
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {classTypes.length === 0 
                    ? "Select Class Types" 
                    : classTypes.length === 1
                      ? classTypes[0]
                      : `${classTypes.length} types selected`}
                </span>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0" align="start">
            <div className="p-2 flex flex-wrap gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => setClassTypes(allClassTypes.map(t => String(t)))}
              >
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => setClassTypes([])}
              >
                Clear
              </Button>
            </div>
            <div className="p-2">
              <MultiSelect
                options={classTypeOptions}
                selected={classTypes}
                onChange={setClassTypes}
                placeholder="Select class types..."
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default EnhancedFilters;
