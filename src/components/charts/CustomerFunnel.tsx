
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import SankeyFunnelChart from "@/components/SankeyFunnelChart";
import { motion } from "framer-motion";

interface FunnelNode {
  id: string;
  label: string;
  value: number;
  color: string;
  position: "top";
  column: number;
}

interface FunnelLink {
  source: string;
  target: string;
  value: number;
  color: string;
}

interface CustomerFunnelProps {
  nodes: FunnelNode[];
  links: FunnelLink[];
  ltv: number;
  conversionRate: {
    from: string;
    to: string;
    rate: number;
  };
}

const CustomerFunnel: React.FC<CustomerFunnelProps> = ({ 
  nodes, links, ltv, conversionRate 
}) => {
  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <motion.div variants={chartVariants}>
      <Card className="overflow-hidden backdrop-blur-sm border-border/50 bg-gradient-to-br from-background to-background/80">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-cyan-400" />
            Customer Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <SankeyFunnelChart
            title=""
            nodes={nodes}
            links={links}
            ltv={ltv}
            conversionRate={conversionRate}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CustomerFunnel;
