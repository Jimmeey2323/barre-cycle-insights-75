
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import TrainerAvatar from './TrainerAvatar';

interface InstructorsListProps {
  trainers: string[];
  onTrainerClick?: (trainer: string) => void;
}

const InstructorsList: React.FC<InstructorsListProps> = ({ 
  trainers, 
  onTrainerClick 
}) => {
  // Remove duplicates and sort
  const uniqueTrainers = [...new Set(trainers)].sort();
  
  return (
    <Card className="bg-white/60 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3 justify-center">
          {uniqueTrainers.map(trainer => (
            <div 
              key={trainer} 
              onClick={() => onTrainerClick && onTrainerClick(trainer)}
              className="cursor-pointer"
            >
              <TrainerAvatar 
                name={trainer} 
                size="md" 
                showName
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InstructorsList;
