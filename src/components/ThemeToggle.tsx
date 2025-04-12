
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sun, Moon, Palette, Diamond } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          {theme === 'luxe' && <Palette className="absolute h-[1.2rem] w-[1.2rem] scale-0 transition-all luxe:scale-100" />}
          {theme === 'physique57' && <Diamond className="absolute h-[1.2rem] w-[1.2rem] scale-0 transition-all physique57:scale-100" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2 cursor-pointer">
          <Sun className="h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2 cursor-pointer">
          <Moon className="h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("luxe")} className="flex items-center gap-2 cursor-pointer">
          <Palette className="h-4 w-4" />
          Luxe
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("physique57")} className="flex items-center gap-2 cursor-pointer">
          <Diamond className="h-4 w-4" />
          Physique57
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
