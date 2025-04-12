
import React, { useState } from 'react';
import { ProcessedData } from "@/types/fitnessTypes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { CheckIcon, ChevronDown, Filter, CalendarIcon, Users, Map, Sliders, Activity } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

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
  const [filterTab, setFilterTab] = useState("time");
  const [compareEnabled, setCompareEnabled] = useState(false);
  
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
  
  const handleMonthsChange = (months: string[]) => {
    setSelectedMonths(months);
  };
  
  const selectAllMonths = () => {
    setSelectedMonths([...allMonths]);
  };
  
  const clearAllMonths = () => {
    setSelectedMonths([]);
  };
  
  const selectLastThreeMonths = () => {
    setSelectedMonths(allMonths.slice(-3));
  };
  
  const toggleMonth = (month: string) => {
    if (selectedMonths.includes(month)) {
      setSelectedMonths(selectedMonths.filter(m => m !== month));
    } else {
      setSelectedMonths([...selectedMonths, month]);
    }
  };
  
  const isQuarterSelected = (quarter: number, year: string) => {
    const monthsInQuarter = allMonths.filter(m => {
      const [month, yr] = m.split('-');
      const monthIdx = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(month);
      const quarterOfMonth = Math.floor(monthIdx / 3) + 1;
      return quarterOfMonth === quarter && yr === year;
    });
    
    return monthsInQuarter.every(m => selectedMonths.includes(m));
  };
  
  const selectQuarter = (quarter: number, year: string) => {
    const monthsInQuarter = allMonths.filter(m => {
      const [month, yr] = m.split('-');
      const monthIdx = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(month);
      const quarterOfMonth = Math.floor(monthIdx / 3) + 1;
      return quarterOfMonth === quarter && yr === year;
    });
    
    const allSelected = monthsInQuarter.every(m => selectedMonths.includes(m));
    
    if (allSelected) {
      setSelectedMonths(selectedMonths.filter(m => !monthsInQuarter.includes(m)));
    } else {
      const newSelection = [...selectedMonths.filter(m => !monthsInQuarter.includes(m)), ...monthsInQuarter];
      setSelectedMonths(newSelection);
    }
  };
  
  const years = [...new Set(allMonths.map(m => m.split('-')[1]))].sort();
  const quarters = [1, 2, 3, 4];

  return (
    <div className="space-y-4 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs value={filterTab} onValueChange={setFilterTab} className="w-auto bg-muted/30 p-1 rounded-lg">
          <TabsList className="grid w-full grid-cols-4 h-9">
            <TabsTrigger value="time" className="text-xs">
              <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
              Time
            </TabsTrigger>
            <TabsTrigger value="location" className="text-xs">
              <Map className="h-3.5 w-3.5 mr-1.5" />
              Location
            </TabsTrigger>
            <TabsTrigger value="trainers" className="text-xs">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Trainers
            </TabsTrigger>
            <TabsTrigger value="classes" className="text-xs">
              <Activity className="h-3.5 w-3.5 mr-1.5" />
              Classes
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={compareEnabled}
              onCheckedChange={setCompareEnabled}
              size="sm"
              className="data-[state=checked]:bg-barre"
            />
            <span className="text-xs font-medium">Compare</span>
          </div>
          
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs">Save View</span>
          </Button>
        </div>
      </div>
      
      {filterTab === "time" && (
        <div className="animate-fade-in">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
            <div className="flex flex-wrap gap-1">
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
            
            <Badge variant="outline" className="text-xs">
              {selectedMonths.length} month{selectedMonths.length !== 1 ? 's' : ''} selected
            </Badge>
          </div>
          
          <div className="space-y-3">
            {years.map(year => (
              <div key={year} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{year}</h3>
                  <Separator className="flex-1" />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {quarters.map(quarter => {
                    const monthsInQuarter = allMonths.filter(m => {
                      const [month, yr] = m.split('-');
                      const monthIdx = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(month);
                      const quarterOfMonth = Math.floor(monthIdx / 3) + 1;
                      return quarterOfMonth === quarter && yr === year;
                    });
                    
                    if (monthsInQuarter.length === 0) return null;
                    
                    return (
                      <div key={`${year}-Q${quarter}`} className="space-y-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`w-full justify-between h-8 text-xs ${isQuarterSelected(quarter, year) ? 'bg-primary text-primary-foreground' : ''}`}
                          onClick={() => selectQuarter(quarter, year)}
                        >
                          <span>Q{quarter}</span>
                          {isQuarterSelected(quarter, year) && <CheckIcon className="h-3 w-3" />}
                        </Button>
                        
                        <div className="grid grid-cols-3 gap-1">
                          {monthsInQuarter.map(month => (
                            <Badge 
                              key={month}
                              variant={selectedMonths.includes(month) ? "default" : "outline"} 
                              className="cursor-pointer text-xs py-1"
                              onClick={() => toggleMonth(month)}
                            >
                              {month.split('-')[0]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {filterTab === "location" && (
        <div className="animate-fade-in">
          <Popover open={openLocation} onOpenChange={setOpenLocation}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openLocation}
                className="w-full justify-between"
              >
                {location === "all" ? "All Locations" : location}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
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
                      >
                        {loc === "all" ? "All Locations" : loc}
                        <CheckIcon
                          className={`ml-auto h-4 w-4 ${location === loc ? "opacity-100" : "opacity-0"}`}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            {locations.map(loc => (
              <Button
                key={loc}
                variant={location === loc ? "default" : "outline"}
                className="justify-start"
                onClick={() => setLocation(loc)}
              >
                <Map className="mr-2 h-4 w-4" />
                {loc === "all" ? "All Locations" : loc}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {filterTab === "trainers" && (
        <div className="animate-fade-in">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => setTrainers(allTrainers)}
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
            
            <div className="grid grid-cols-2 gap-2">
              {allTrainers.map(trainer => (
                <Button
                  key={trainer}
                  variant={trainers.includes(trainer) ? "default" : "outline"}
                  className="justify-start text-xs"
                  onClick={() => {
                    if (trainers.includes(trainer)) {
                      setTrainers(trainers.filter(t => t !== trainer));
                    } else {
                      setTrainers([...trainers, trainer]);
                    }
                  }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  {trainer}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {filterTab === "classes" && (
        <div className="animate-fade-in">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => setClassTypes(allClassTypes)}
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
            
            <div className="grid grid-cols-2 gap-2">
              {allClassTypes.map(type => (
                <Button
                  key={type}
                  variant={classTypes.includes(type) ? "default" : "outline"}
                  className={`justify-start text-xs ${type.toLowerCase().includes('barre') ? 'data-[state=default]:bg-barre' : type.toLowerCase().includes('cycle') ? 'data-[state=default]:bg-cycle-dark' : ''}`}
                  onClick={() => {
                    if (classTypes.includes(type)) {
                      setClassTypes(classTypes.filter(t => t !== type));
                    } else {
                      setClassTypes([...classTypes, type]);
                    }
                  }}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedFilters;
