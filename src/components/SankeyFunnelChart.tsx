
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPercent, formatINR } from "@/lib/formatters";

export interface FunnelNode {
  id: string;
  label: string;
  value: number;
  color: string;
  position: 'top' | 'bottom';
  column: number;
}

export interface FunnelLink {
  source: string;
  target: string;
  value: number;
  color: string;
}

export interface SankeyFunnelChartProps {
  title: string;
  nodes: FunnelNode[];
  links: FunnelLink[];
  ltv?: number;
  conversionRate?: {
    from: string;
    to: string;
    rate: number;
  };
}

const SankeyFunnelChart: React.FC<SankeyFunnelChartProps> = ({
  title,
  nodes,
  links,
  ltv,
  conversionRate
}) => {
  // Group nodes by column
  const columns: Record<number, FunnelNode[]> = {};
  nodes.forEach(node => {
    if (!columns[node.column]) columns[node.column] = [];
    columns[node.column].push(node);
  });
  
  // Get unique columns and sort them
  const columnNumbers = Object.keys(columns).map(Number).sort((a, b) => a - b);
  
  // Calculate the maximum value for scaling
  const maxValue = Math.max(...nodes.map(node => node.value));
  
  return (
    <Card className="overflow-hidden border border-border/50">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          {ltv && (
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground">Leads LTV:</span>
              <span className="ml-2 font-bold">{formatINR(ltv)}</span>
            </div>
          )}
        </div>
        
        {conversionRate && (
          <div className="mt-1 flex flex-wrap items-center gap-1 text-xs">
            <span className="text-muted-foreground">Conversion rate:</span>
            <span className="rounded-md bg-red-100 px-2 py-0.5 text-red-800">{conversionRate.from}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-medium">{formatPercent(conversionRate.rate.toString())}</span>
            <span className="text-muted-foreground">→</span>
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-blue-800">{conversionRate.to}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="relative p-4">
        <svg width="100%" height="110" style={{ overflow: 'visible' }}>
          <defs>
            {links.map((link, index) => (
              <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={link.color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={link.color} stopOpacity="0.4" />
              </linearGradient>
            ))}
          </defs>
          
          {/* Draw the columns */}
          {columnNumbers.map(colNum => {
            const colWidth = 100 / columnNumbers.length;
            const xPos = colNum * colWidth;
            
            return (
              <g key={`col-${colNum}`} transform={`translate(${xPos}%, 0)`}>
                {columns[colNum].map((node, idx) => {
                  const nodeHeight = (node.value / maxValue) * 40;
                  const yPos = node.position === 'top' ? 0 : 80 - nodeHeight;
                  
                  return (
                    <g key={node.id} transform={`translate(-45, ${yPos})`}>
                      <rect
                        x="0"
                        y="0"
                        width="90"
                        height={nodeHeight > 0 ? Math.max(nodeHeight, 20) : 20}
                        fill={node.color}
                        fillOpacity="0.2"
                        stroke={node.color}
                        strokeWidth="1"
                        rx="4"
                        ry="4"
                      />
                      <foreignObject x="5" y="5" width="80" height={Math.max(nodeHeight - 10, 10)}>
                        <div className="flex h-full flex-col items-center justify-center text-center">
                          <div className="text-xs font-bold">{node.value}</div>
                          <div className="text-xs whitespace-nowrap overflow-hidden text-ellipsis w-full">{node.label}</div>
                        </div>
                      </foreignObject>
                    </g>
                  );
                })}
              </g>
            );
          })}
          
          {/* Draw links between nodes */}
          {links.map((link, index) => {
            const sourceNode = nodes.find(n => n.id === link.source);
            const targetNode = nodes.find(n => n.id === link.target);
            
            if (!sourceNode || !targetNode) return null;
            
            const sourceColWidth = 100 / columnNumbers.length;
            const targetColWidth = 100 / columnNumbers.length;
            
            const sourceX = sourceNode.column * sourceColWidth;
            const targetX = targetNode.column * targetColWidth;
            
            const sourceHeight = (sourceNode.value / maxValue) * 40;
            const targetHeight = (targetNode.value / maxValue) * 40;
            
            const sourceY = sourceNode.position === 'top' ? 0 : 80 - sourceHeight;
            const targetY = targetNode.position === 'top' ? 0 : 80 - targetHeight;
            
            // Calculate control points for the Bezier curve
            const sourceControlX = sourceX + sourceColWidth * 0.8;
            const targetControlX = targetX - targetColWidth * 0.8;
            
            // Calculate link width based on value
            const linkWidth = Math.max(2, (link.value / maxValue) * 20);
            
            // Create path between the nodes
            const sourceRight = sourceX + 45; // 90/2 = 45
            const targetLeft = targetX - 45;
            
            const sourceMid = sourceY + Math.max(sourceHeight, 20) / 2;
            const targetMid = targetY + Math.max(targetHeight, 20) / 2;
            
            const path = `M ${sourceRight} ${sourceMid} 
                          C ${sourceControlX} ${sourceMid}, 
                            ${targetControlX} ${targetMid}, 
                            ${targetLeft} ${targetMid}`;
            
            return (
              <path
                key={`link-${index}`}
                d={path}
                stroke={`url(#gradient-${index})`}
                strokeWidth={linkWidth}
                fill="none"
                strokeOpacity="0.6"
              />
            );
          })}
        </svg>
      </CardContent>
    </Card>
  );
};

export default SankeyFunnelChart;
