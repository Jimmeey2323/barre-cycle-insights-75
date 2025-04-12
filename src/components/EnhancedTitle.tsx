import React, { useEffect, useRef } from 'react';
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Activity } from "lucide-react";
const EnhancedTitle: React.FC = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
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
  return <div className="flex flex-col items-center md:items-start">
      <div className="flex items-center mb-2 gap-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-barre to-cycle-dark shadow-lg">
          <Dumbbell className="text-white w-6 h-6" />
        </div>
        <h1 ref={titleRef} className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
          Fitness Analytics
        </h1>
        <Badge variant="outline" className="ml-2 bg-gradient-to-r from-barre-light to-cycle-light animate-pulse">
          <Activity className="w-3 h-3 mr-1" /> LIVE
        </Badge>
      </div>
      <div className="flex gap-2 text-3xl ">
        <span className="text-gradient-barre font-semibold">Barre</span> 
        <span className="text-muted-foreground">vs</span> 
        <span className="text-gradient-cycle font-semibold">Cycle</span>
        <span className="text-muted-foreground hidden md:inline-block">Performance Metrics & Comparison Dashboard</span>
      </div>
    </div>;
};
export default EnhancedTitle;