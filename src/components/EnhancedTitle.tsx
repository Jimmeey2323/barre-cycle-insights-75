
import React, { useEffect, useRef, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Activity, SunMoon, Moon, Sun } from "lucide-react";
import { useTheme } from '@/contexts/ThemeContext';

const EnhancedTitle: React.FC = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { theme, setTheme } = useTheme();
  
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
  
  return (
    <div className="flex flex-col items-center md:items-start space-y-2">
      <div className="flex items-center mb-2 gap-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-barre to-cycle-dark shadow-lg transform hover:scale-110 transition-transform">
          <Dumbbell className="text-white w-6 h-6" />
        </div>
        
        <h1 ref={titleRef} className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
          Fitness Analytics
        </h1>
        
        <Badge variant="outline" className="ml-2 bg-gradient-to-r from-barre-light to-cycle-light animate-pulse">
          <Activity className="w-3 h-3 mr-1" /> LIVE
        </Badge>
      </div>
      
      <div className="flex gap-2 text-3xl">
        <span className="text-gradient-barre font-semibold">Barre</span> 
        <span className="text-muted-foreground">vs</span> 
        <span className="text-gradient-cycle font-semibold">Cycle</span>
        <span className="text-muted-foreground hidden md:inline-block">Performance Metrics & Comparison Dashboard</span>
      </div>
      
      <div className="fixed top-4 right-4 flex gap-2">
        <button 
          className={`p-2 rounded-full transition-all duration-300 ${theme === 'light' ? 'bg-primary text-white' : 'bg-card/50 text-muted-foreground'}`}
          onClick={() => setTheme('light')}
          aria-label="Light theme"
        >
          <Sun className="w-5 h-5" />
        </button>
        
        <button 
          className={`p-2 rounded-full transition-all duration-300 ${theme === 'dark' ? 'bg-primary text-white' : 'bg-card/50 text-muted-foreground'}`}
          onClick={() => setTheme('dark')}
          aria-label="Dark theme"
        >
          <Moon className="w-5 h-5" />
        </button>
        
        <button 
          className={`p-2 rounded-full transition-all duration-300 ${theme === 'luxe' ? 'bg-primary text-white' : 'bg-card/50 text-muted-foreground'}`}
          onClick={() => setTheme('luxe')}
          aria-label="Luxe theme"
        >
          <SunMoon className="w-5 h-5" />
        </button>
        
        <button 
          className={`p-2 rounded-full transition-all duration-300 ${theme === 'physique57' ? 'bg-primary text-white' : 'bg-card/50 text-muted-foreground'}`}
          onClick={() => setTheme('physique57')}
          aria-label="Physique 57 theme"
        >
          <div className="w-5 h-5 flex items-center justify-center font-bold text-xs">57</div>
        </button>
      </div>
    </div>
  );
};

export default EnhancedTitle;
