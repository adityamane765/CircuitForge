"use client";

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { CircuitAST } from '@/transpiler/types';
import { buildDAG } from './dagBuilder';
import { layoutDAG, LayoutNode } from './layoutEngine';
import { useTheme } from '@/context/ThemeContext';

interface CircuitDAGProps {
  ast: CircuitAST | null;
}

const NODE_WIDTH = 80;
const NODE_HEIGHT = 36;
const NODE_RX = 6;

function getNodeColor(kind: LayoutNode['kind'], theme: any): string {
  switch (kind) {
    case 'private_input':
    case 'public_input': return theme.blockInputColor;
    case 'constant': return theme.blockArithmeticColor;
    case 'operation': return theme.blockLogicColor;
    case 'hash': return theme.blockHashColor;
    case 'constraint': return theme.blockConstraintColor;
    case 'output': return theme.blockOutputColor;
  }
}

const CircuitDAG: React.FC<CircuitDAGProps> = ({ ast }) => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 400, height: 300 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(() => {
    if (!ast || ast.statements.length === 0) return null;
    const dag = buildDAG(ast);
    if (dag.nodes.length === 0) return null;
    return layoutDAG(dag);
  }, [ast]);

  if (!layout) {
    return (
      <div
        ref={containerRef}
        className="flex items-center justify-center h-full w-full"
        style={{ color: theme.textMuted }}
      >
        <p className="text-sm">Add blocks to see the circuit dataflow graph</p>
      </div>
    );
  }

  // Compute viewBox to fit content, then scale to container
  const viewBox = `0 0 ${layout.width} ${layout.height}`;

  // Build a lookup map for node positions
  const nodeMap = new Map(layout.nodes.map(n => [n.id, n]));

  return (
    <div ref={containerRef} className="h-full w-full overflow-auto" style={{ backgroundColor: theme.bg }}>
      <svg
        width={Math.max(containerSize.width, layout.width)}
        height={Math.max(containerSize.height, layout.height)}
        viewBox={viewBox}
        style={{ display: 'block' }}
      >
        {/* Edges */}
        {layout.edges.map((edge, i) => {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          if (!from || !to) return null;

          const x1 = from.x + NODE_WIDTH / 2;
          const y1 = from.y + NODE_HEIGHT;
          const x2 = to.x + NODE_WIDTH / 2;
          const y2 = to.y;
          const cy1 = y1 + (y2 - y1) * 0.4;
          const cy2 = y2 - (y2 - y1) * 0.4;

          return (
            <path
              key={`edge-${i}`}
              d={`M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`}
              fill="none"
              stroke={theme.accent}
              strokeWidth={1.5}
              strokeOpacity={0.5}
            />
          );
        })}

        {/* Nodes */}
        {layout.nodes.map(node => {
          const color = getNodeColor(node.kind, theme);
          return (
            <g key={node.id}>
              <rect
                x={node.x}
                y={node.y}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={NODE_RX}
                fill={color}
                fillOpacity={0.85}
                stroke={color}
                strokeWidth={1.5}
              />
              <text
                x={node.x + NODE_WIDTH / 2}
                y={node.y + NODE_HEIGHT / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#ffffff"
                fontSize={11}
                fontFamily="monospace"
                fontWeight="bold"
              >
                {node.label.length > 10 ? node.label.slice(0, 9) + '…' : node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default CircuitDAG;
