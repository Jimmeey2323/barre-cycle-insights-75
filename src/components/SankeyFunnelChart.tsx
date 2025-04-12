
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPercent, formatINR } from "@/lib/formatters";

interface FunnelNode {
  id: string;
  label: string;
  value: number;
  color: string;
  position: 'top' | 'bottom';
  column: number;
}

interface FunnelLink {
  source: string;
  target: string;
  value: number;
  color: string;
}

interface SankeyFunnelChartProps {
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
        <svg width="100%" height="340" style={{ overflow: 'visible' }}>
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
                  const nodeHeight = (node.value / maxValue) * 100;
                  const yPos = node.position === 'top' ? 0 : 280 - nodeHeight;
                  
                  return (
                    <g key={node.id} transform={`translate(-70, ${yPos})`}>
                      <rect
                        x="0"
                        y="0"
                        width="140"
                        height={nodeHeight}
                        fill={node.color}
                        fillOpacity="0.2"
                        stroke={node.color}
                        strokeWidth="1"
                        rx="6"
                        ry="6"
                      />
                      <foreignObject x="10" y="10" width="120" height={nodeHeight - 20}>
                        <div className="flex h-full flex-col items-center justify-center text-center">
                          <div className="text-lg font-bold">{node.value}</div>
                          <div className="text-xs">{node.label}</div>
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
            
            const sourceHeight = (sourceNode.value / maxValue) * 100;
            const targetHeight = (targetNode.value / maxValue) * 100;
            
            const sourceY = sourceNode.position === 'top' ? 0 : 280 - sourceHeight;
            const targetY = targetNode.position === 'top' ? 0 : 280 - targetHeight;
            
            // Calculate control points for the Bezier curve
            const sourceControlX = sourceX + sourceColWidth * 0.8;
            const targetControlX = targetX - targetColWidth * 0.8;
            
            // Calculate link width based on value
            const linkWidth = (link.value / maxValue) * 60;
            
            // Create path between the nodes
            const sourceRight = sourceX + 70; // 140/2 = 70
            const targetLeft = targetX - 70;
            
            const sourceMid = sourceY + sourceHeight / 2;
            const targetMid = targetY + targetHeight / 2;
            
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
        
        {/* Legend or additional information could go here */}
        <div className="mt-4 flex justify-center">
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <button className="flex items-center gap-1 rounded-md border px-3 py-1 hover:bg-muted">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 9l-7 7-7-7" />
              </svg>
              Filters
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SankeyFunnelChart;
