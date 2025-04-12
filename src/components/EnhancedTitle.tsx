
import React, { useEffect, useRef, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Activity, SunMoon, Moon, Sun } from "lucide-react";
import { useTheme } from '@/contexts/ThemeContext';

const EnhancedTitle: React.FC = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const {
    theme,
    setTheme
  } = useTheme();
  
  useEffect(() => {
    if (!titleRef.current) return;
    const barreText = "Barre";
    const cycleText = "Cycle";
    
    // Clear previous content
    const barreElement = document.getElementById('barre-title');
    const cycleElement = document.getElementById('cycle-title');
    
    if (barreElement && cycleElement) {
      barreElement.innerHTML = '';
      cycleElement.innerHTML = '';
      
      // Create animated characters for "Barre"
      barreText.split('').forEach((letter) => {
        const span = document.createElement('span');
        span.textContent = letter;
        span.className = 'title-char';
        barreElement.appendChild(span);
      });
      
      // Create animated characters for "Cycle"
      cycleText.split('').forEach((letter) => {
        const span = document.createElement('span');
        span.textContent = letter;
        span.className = 'title-char';
        cycleElement.appendChild(span);
      });
    }
  }, []);
  
  return (
    <div className="flex items-center justify-center gap-3">
      <Dumbbell 
        className="h-7 w-7 text-barre title-icon" 
        strokeWidth={1.5} 
      />
      
      <div className="flex items-center gap-2 text-3xl">
        <span id="barre-title" className="text-gradient-barre font-semibold text-4xl">Barre</span> 
        <span className="text-muted-foreground text-4xl font-light text-center">vs</span> 
        <span id="cycle-title" className="text-gradient-cycle font-semibold text-4xl">Cycle</span>
      </div>
      
      <Activity 
        className="h-7 w-7 text-cycle title-icon" 
        strokeWidth={1.5} 
      />
    </div>
  );
};

export default EnhancedTitle;
