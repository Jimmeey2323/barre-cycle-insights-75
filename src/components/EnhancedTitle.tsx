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
    const letters = titleRef.current.innerText.split('');
    titleRef.current.innerHTML = '';
    letters.forEach((letter, index) => {
      const span = document.createElement('span');
      span.textContent = letter;
      span.style.opacity = '0';
      span.style.transform = 'translateY(20px)';
      span.style.display = 'inline-block';
      span.style.transition = 'all 0.5s ease';
      span.style.transitionDelay = `${index * 0.03}s`;
      titleRef.current?.appendChild(span);
    });
    setTimeout(() => {
      const spans = titleRef.current?.querySelectorAll('span');
      spans?.forEach(span => {
        span.style.opacity = '1';
        span.style.transform = 'translateY(0)';
      });
    }, 100);
  }, []);
  return <div className="flex flex-col items-center">
      
      
      <div className="flex gap-2 text-3xl">
        <span className="text-gradient-barre font-semibold">Barre</span> 
        <span className="text-muted-foreground">vs</span> 
        <span className="text-gradient-cycle font-semibold">Cycle</span>
        <span className="text-muted-foreground hidden md:inline-block">Performance Metrics & Comparison Dashboard</span>
      </div>
      
      
    </div>;
};
export default EnhancedTitle;