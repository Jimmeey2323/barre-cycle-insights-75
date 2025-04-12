
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TrainerAvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

const TrainerAvatar: React.FC<TrainerAvatarProps> = ({ 
  name, 
  imageUrl, 
  size = "md",
  showName = false 
}) => {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  const getSizeClass = (): string => {
    switch (size) {
      case "sm": return "h-8 w-8 text-xs";
      case "lg": return "h-12 w-12 text-lg";
      default: return "h-10 w-10 text-sm";
    }
  };
  
  // Generate a deterministic background color based on name
  const getColorClass = (name: string): string => {
    const colors = [
      "bg-gradient-to-br from-red-500 to-pink-500",
      "bg-gradient-to-br from-blue-500 to-cyan-500",
      "bg-gradient-to-br from-green-500 to-emerald-500", 
      "bg-gradient-to-br from-yellow-500 to-amber-500",
      "bg-gradient-to-br from-purple-500 to-indigo-500",
      "bg-gradient-to-br from-pink-500 to-purple-500",
      "bg-gradient-to-br from-cyan-500 to-blue-500",
      "bg-gradient-to-br from-barre to-barre-dark",
      "bg-gradient-to-br from-cycle to-cycle-dark"
    ];
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash + name.charCodeAt(i)) % colors.length;
    }
    
    return colors[hash];
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="group flex flex-col items-center">
            <Avatar className={`${getSizeClass()} ring-2 ring-background ${getColorClass(name)} transition-all duration-300 group-hover:ring-primary/50 group-hover:scale-105`}>
              {imageUrl ? (
                <AvatarImage src={imageUrl} alt={name} />
              ) : null}
              <AvatarFallback className={`font-medium ${getColorClass(name)} text-white`}>
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            {showName && (
              <span className="mt-1 text-xs font-medium text-muted-foreground">{name.split(' ')[0]}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">Fitness Trainer</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TrainerAvatar;
