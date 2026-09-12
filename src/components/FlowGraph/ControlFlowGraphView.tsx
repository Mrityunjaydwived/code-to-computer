import React, { useMemo } from 'react';
import { GitBranch } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

interface CFGNode {
  id: string;
  line: number;
  text: string;
  type: 'start' | 'statement' | 'condition' | 'loop' | 'return' | 'end';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CFGEdge {
  fromId: string;
  toId: string;
  label?: string;
  isLoopBack?: boolean;
  isBranchTrue?: boolean;
  isBranchFalse?: boolean;
}

export const ControlFlowGraphView: React.FC = () => {
  const { sourceCode, snapshots, currentStepIndex, jumpToStep } = useExecutionStore();

  const currentSnapshot = snapshots[currentStepIndex];
  const activeLine = currentSnapshot ? currentSnapshot.line : -1;
  const prevSnapshot = currentStepIndex > 0 ? snapshots[currentStepIndex - 1] : null;
  const prevLine = prevSnapshot ? prevSnapshot.line : -1;

  // Build CFG nodes and edges from sourceCode
  const { nodes, edges, totalHeight, totalWidth } = useMemo(() => {
    const rawLines = sourceCode.split('\n');
    const parsedNodes: CFGNode[] = [];
    const parsedEdges: CFGEdge[] = [];

    let currentY = 50;
    const nodeWidth = 220;
    const nodeHeight = 44;
    const centerX = 260;
    const verticalGap = 42;

    // Start Node
    parsedNodes.push({
      id: 'node-start',
      line: 0,
      text: 'START (Program Entry)',
      type: 'start',
      x: centerX - 80,
      y: currentY,
      width: 160,
      height: 36,
    });
    currentY += 36 + verticalGap;

    const lineNodes: CFGNode[] = [];

    rawLines.forEach((raw, idx) => {
      const lineNum = idx + 1;
      const trimmed = raw.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      let type: CFGNode['type'] = 'statement';
      if (trimmed.startsWith('if ') || trimmed.startsWith('elif ')) {
        type = 'condition';
      } else if (trimmed.startsWith('while ') || trimmed.startsWith('for ')) {
        type = 'loop';
      } else if (trimmed.startsWith('return ') || trimmed === 'return') {
        type = 'return';
      }

      const node: CFGNode = {
        id: `node-line-${lineNum}`,
        line: lineNum,
        text: trimmed.length > 28 ? trimmed.slice(0, 26) + '...' : trimmed,
        type,
        x: centerX - nodeWidth / 2,
        y: currentY,
        width: nodeWidth,
        height: nodeHeight,
      };

      parsedNodes.push(node);
      lineNodes.push(node);
      currentY += nodeHeight + verticalGap;
    });

    // End Node
    parsedNodes.push({
      id: 'node-end',
      line: rawLines.length + 1,
      text: 'END (Program Exit)',
      type: 'end',
      x: centerX - 80,
      y: currentY,
      width: 160,
      height: 36,
    });

    // Connect Start to first statement
    if (lineNodes.length > 0) {
      parsedEdges.push({ fromId: 'node-start', toId: lineNodes[0].id });

      for (let i = 0; i < lineNodes.length - 1; i++) {
        const curr = lineNodes[i];
        const next = lineNodes[i + 1];

        if (curr.type === 'loop') {
          // Loop connects to next, and we add a loopback edge
          parsedEdges.push({
            fromId: curr.id,
            toId: next.id,
            label: 'True (Enter Loop)',
            isBranchTrue: true,
          });
          parsedEdges.push({
            fromId: next.id,
            toId: curr.id,
            label: 'Next Iteration',
            isLoopBack: true,
          });
        } else if (curr.type === 'condition') {
          parsedEdges.push({
            fromId: curr.id,
            toId: next.id,
            label: 'True (Branch)',
            isBranchTrue: true,
          });
        } else {
          parsedEdges.push({ fromId: curr.id, toId: next.id });
        }
      }

      // Connect last line to End
      parsedEdges.push({ fromId: lineNodes[lineNodes.length - 1].id, toId: 'node-end' });
    } else {
      parsedEdges.push({ fromId: 'node-start', toId: 'node-end' });
    }

    return {
      nodes: parsedNodes,
      edges: parsedEdges,
      totalHeight: currentY + 60,
      totalWidth: centerX * 2 + 100,
    };
  }, [sourceCode]);

  // Find step corresponding to a clicked line
  const handleNodeClick = (lineNum: number) => {
    if (lineNum <= 0) return;
    const targetStep = snapshots.findIndex((s) => s.line === lineNum);
    if (targetStep >= 0) {
      jumpToStep(targetStep);
    }
  };

  const nodeMap = useMemo(() => {
    const map = new Map<string, CFGNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  return (
    <div className="bg-white rounded-xl border border-[#E0E0E0] shadow-xs p-3.5 flex flex-col h-full overflow-hidden">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0F0F0] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E8F0FE] text-[#2874F0] flex items-center justify-center font-bold shrink-0">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#212121]">Control Flow Graph (CFG)</h3>
            <p className="text-[10px] text-[#666666]">
              Interactive directed graph showing statement transitions, branches, and active execution flow.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E8F0FE] text-[#2874F0]">
            <span className="w-2 h-2 rounded-full bg-[#2874F0] animate-ping" />
            Active Line: {activeLine > 0 ? `#${activeLine}` : 'None'}
          </span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="flex-1 overflow-auto touch-pan-x touch-pan-y max-w-full mt-2 bg-[#F8FAFC] rounded-lg border border-[#E8EEF5] p-3 relative">
        <svg
          width={Math.max(520, totalWidth)}
          height={Math.max(480, totalHeight)}
          className="mx-auto select-none"
        >
          <defs>
            <style>
              {`
                @keyframes flowDash {
                  to {
                    stroke-dashoffset: -24;
                  }
                }
                .flow-active-edge {
                  animation: flowDash 0.8s linear infinite;
                }
              `}
            </style>
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#94A3B8" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#2874F0" />
            </marker>
            <marker
              id="arrow-loop"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#FF9F00" />
            </marker>
          </defs>

          {/* Render Edges */}
          {edges.map((edge, idx) => {
            const from = nodeMap.get(edge.fromId);
            const to = nodeMap.get(edge.toId);
            if (!from || !to) return null;

            const isEdgeActive =
              (from.line === prevLine && to.line === activeLine) ||
              (to.line === activeLine && edge.fromId === 'node-start');

            if (edge.isLoopBack) {
              // Curved Loopback edge on the right
              const xStart = from.x + from.width;
              const yStart = from.y + from.height / 2;
              const xEnd = to.x + to.width;
              const yEnd = to.y + to.height / 2;
              const controlX = Math.max(xStart, xEnd) + 60;

              return (
                <g key={`edge-${idx}`}>
                  <path
                    d={`M ${xStart} ${yStart} C ${controlX} ${yStart}, ${controlX} ${yEnd}, ${xEnd} ${yEnd}`}
                    fill="none"
                    stroke={isEdgeActive ? '#FF9F00' : '#CBD5E1'}
                    strokeWidth={isEdgeActive ? 3 : 1.5}
                    strokeDasharray={isEdgeActive ? '6,4' : 'none'}
                    className={isEdgeActive ? 'flow-active-edge' : ''}
                    markerEnd="url(#arrow-loop)"
                  />
                  <text
                    x={controlX + 8}
                    y={(yStart + yEnd) / 2}
                    fill="#FF9F00"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    Loop Cycle ⟲
                  </text>
                </g>
              );
            }

            // Normal downward vertical/curved edge
            const xStart = from.x + from.width / 2;
            const yStart = from.y + from.height;
            const xEnd = to.x + to.width / 2;
            const yEnd = to.y;

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={xStart}
                  y1={yStart}
                  x2={xEnd}
                  y2={yEnd}
                  stroke={isEdgeActive ? '#2874F0' : '#CBD5E1'}
                  strokeWidth={isEdgeActive ? 3 : 1.5}
                  strokeDasharray={isEdgeActive ? '6,4' : 'none'}
                  className={isEdgeActive ? 'flow-active-edge' : ''}
                  markerEnd={isEdgeActive ? 'url(#arrow-active)' : 'url(#arrow-default)'}
                />
                {edge.label && (
                  <text
                    x={(xStart + xEnd) / 2 + 8}
                    y={(yStart + yEnd) / 2}
                    fill={isEdgeActive ? '#2874F0' : '#64748B'}
                    fontSize="9"
                    fontWeight="600"
                    fontFamily="monospace"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => {
            const isActive = node.line === activeLine;
            const isExecuted =
              currentSnapshot &&
              snapshots.slice(0, currentStepIndex + 1).some((s) => s.line === node.line);

            let nodeFill = '#FFFFFF';
            let nodeStroke = '#CBD5E1';
            let textColor = '#212121';

            if (node.type === 'start') {
              nodeFill = '#E8F0FE';
              nodeStroke = '#2874F0';
              textColor = '#2874F0';
            } else if (node.type === 'end') {
              nodeFill = '#F1F3F6';
              nodeStroke = '#94A3B8';
              textColor = '#64748B';
            } else if (isActive) {
              nodeFill = '#FFFBEB';
              nodeStroke = '#F8D706';
              textColor = '#212121';
            } else if (isExecuted) {
              nodeFill = '#F8FAFC';
              nodeStroke = '#93C5FD';
            }

            return (
              <g
                key={node.id}
                onClick={() => handleNodeClick(node.line)}
                className="cursor-pointer group"
                transform={`translate(${node.x}, ${node.y})`}
              >
                {/* Active Pulsing Glow Ring */}
                {isActive && (
                  <rect
                    x="-4"
                    y="-4"
                    width={node.width + 8}
                    height={node.height + 8}
                    rx="12"
                    fill="none"
                    stroke="#F8D706"
                    strokeWidth="3"
                    className="animate-pulse"
                  />
                )}

                {/* Main Node Shape */}
                <rect
                  x="0"
                  y="0"
                  width={node.width}
                  height={node.height}
                  rx={node.type === 'start' || node.type === 'end' ? '18' : '8'}
                  fill={nodeFill}
                  stroke={isActive ? '#F8D706' : nodeStroke}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className="transition-all group-hover:filter group-hover:drop-shadow-md"
                />

                {/* Line number badge */}
                {node.line > 0 && (
                  <rect
                    x="8"
                    y="10"
                    width="28"
                    height="24"
                    rx="4"
                    fill={isActive ? '#F8D706' : isExecuted ? '#2874F0' : '#E2E8F0'}
                  />
                )}
                {node.line > 0 && (
                  <text
                    x="22"
                    y="26"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                    fill={isActive ? '#212121' : isExecuted ? '#FFFFFF' : '#64748B'}
                  >
                    {node.line}
                  </text>
                )}

                {/* Node Code Label */}
                <text
                  x={node.line > 0 ? 44 : node.width / 2}
                  y={node.height / 2 + 4}
                  textAnchor={node.line > 0 ? 'start' : 'middle'}
                  fontSize={node.type === 'start' || node.type === 'end' ? '11' : '11'}
                  fontWeight={isActive ? 'bold' : '600'}
                  fontFamily="monospace"
                  fill={textColor}
                >
                  {node.text}
                </text>

                {/* Checkmark when executed */}
                {isExecuted && !isActive && node.line > 0 && (
                  <circle cx={node.width - 16} cy={node.height / 2} r="5" fill="#10B981" />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2.5 mt-2 border-t border-[#F0F0F0] text-[10px] text-[#666666] shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F8D706] border border-[#D97706]" /> Active Step
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Executed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF9F00]" /> Loop Transition
          </span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-[#878787]">Click any node to jump execution</span>
      </div>
    </div>
  );
};
