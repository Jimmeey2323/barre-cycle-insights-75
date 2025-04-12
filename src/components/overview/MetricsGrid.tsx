
import React from "react";
import { motion } from "framer-motion";
import MetricsCard from "../dashboard/MetricsCard";

interface MetricsGridProps {
  metrics: Array<{
    title: string;
    value: string;
    icon: React.ReactNode;
    details: string;
    tooltipContent: string;
    calculationDetails: string;
  }>;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      variants={containerVariants}
    >
      {metrics.map((metric, index) => (
        <motion.div key={index} variants={itemVariants} custom={index}>
          <MetricsCard
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            details={metric.details}
            tooltipContent={metric.tooltipContent}
            calculationDetails={metric.calculationDetails}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MetricsGrid;
