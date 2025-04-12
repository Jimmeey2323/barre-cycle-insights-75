
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number | string;
  duration?: number; // Duration in milliseconds
  prefix?: string;
  suffix?: string;
  formatter?: (value: number) => string;
  className?: string;
  animationDelay?: number;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  prefix = "",
  suffix = "",
  formatter = (val) => val.toString(),
  className,
  animationDelay = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState<string>("0");
  const [isAnimating, setIsAnimating] = useState(false);
  const targetValue = typeof value === "string" ? parseFloat(value) : value;
  const startValueRef = useRef(0);
  const startTimeRef = useRef(0);
  const frameRef = useRef(0);

  const easeOutQuad = (t: number) => t * (2 - t);

  const animateValue = (timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuad(progress);
    
    const currentValue = startValueRef.current + easedProgress * (targetValue - startValueRef.current);
    setDisplayValue(formatter(Math.round(currentValue * 10) / 10));

    if (progress < 1) {
      frameRef.current = requestAnimationFrame(animateValue);
    } else {
      setIsAnimating(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
      startValueRef.current = typeof displayValue === 'string' ? parseFloat(displayValue) || 0 : displayValue;
      startTimeRef.current = 0;
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(animateValue);
    }, animationDelay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frameRef.current);
    };
  }, [targetValue, duration, animationDelay]);

  return (
    <span className={cn("inline-block", isAnimating ? "animate-pulse" : "", className)}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
