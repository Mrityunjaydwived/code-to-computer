import React, { useMemo } from 'react';
import { GitFork, ArrowRight, CornerDownRight, CheckCircle2, Play, Sparkles } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

interface TreeNode {
  id: string;
  funcName: string;
  args: Record<string, any>;
  depth: number;
  callStep: number;
  returnStep?: number;
  returnValue?: any;
  parentId?: string;
  x: number;
  y: number;
}

export const RecursionTreeView: React.FC = () => {
  const { snapshots, currentStepIndex, loadExample } = useExecutionStore();

  const currentSnapshot = snapshots[currentStepIndex];

  // Reconstruct the recursion tree from all execution snapshots
  const { treeNodes, treeEdges, isRecursive, maxDepth } = useMemo(() => {
    // Check if any functions are called in stack
    const allFrames: Array<{
      funcName: string;
      args: Record<string, any>;
      step: number;
      depth: number;
    }> = [];

    snapshots.forEach((snap, stepIdx) => {
      if (snap.stack && snap.stack.length > 0) {
        snap.stack.forEach((frame, depth) => {
          if (frame.functionName !== '<main>' && frame.functionName !== 'global') {
            allFrames.push({
              funcName: frame.functionName,
              args: frame.parameters || {},
              step: stepIdx,
              depth: depth + 1,
            });
          }
        });
      }
    });

    // Check if we have multiple function calls with same name (recursion) or function calls
    const funcCalls = allFrames.filter(
      (f, idx, arr) => idx === 0 || f.step !== arr[idx - 1].step || f.depth !== arr[idx - 1].depth
    );

    const hasRecursion = allFrames.length > 0;

    // Fallback illustrative tree if code does not have recursion
    if (!hasRecursion) {
      return {
        treeNodes: [],
        treeEdges: [],
        isRecursive: false,
        maxDepth: 0,
      };
    }

    // Build unique nodes based on stack transitions
    const nodes: TreeNode[] = [];
    const edges: Array<{ fromId: string; toId: string }> = [];

    // Simple layout coordinates
    const startX = 280;
    const startY = 40;
    const levelHeight = 70;

    // Extract distinct call instances
    const distinctCalls: Array<{
      id: string;
      funcName: string;
      args: Record<string, any>;
      depth: number;
      callStep: number;
      parentId?: string;
    }> = [];

    snapshots.forEach((snap, stepIdx) => {
      const activeFunctions = (snap.stack || []).filter(
        (f) => f.functionName !== '<main>' && f.functionName !== 'global'
      );

      activeFunctions.forEach((f, depthIdx) => {
        const id = `call-${f.functionName}-${JSON.stringify(f.parameters)}-${depthIdx}`;
        if (!distinctCalls.some((c) => c.id === id)) {
          const parent = depthIdx > 0 ? distinctCalls[distinctCalls.length - 1]?.id : undefined;
          distinctCalls.push({
            id,
            funcName: f.functionName,
            args: f.parameters || {},
            depth: depthIdx + 1,
            callStep: stepIdx,
            parentId: parent,
          });
        }
      });
    });

    let depthCounters: Record<number, number> = {};
    let computedMaxDepth = 1;

    distinctCalls.forEach((call) => {
      const depth = call.depth;
      if (depth > computedMaxDepth) computedMaxDepth = depth;
      depthCounters[depth] = (depthCounters[depth] || 0) + 1;
      const indexInLevel = depthCounters[depth] - 1;

      const spacing = 140 / depth;
      const x = startX + (indexInLevel - 0.5) * spacing;
      const y = startY + (depth - 1) * levelHeight;

      nodes.push({
        ...call,
        x,
        y,
      });

      if (call.parentId) {
        edges.push({ fromId: call.parentId, toId: call.id });
      }
    });

    return {
      treeNodes: nodes,
      treeEdges: edges,
      isRecursive: true,
      maxDepth: computedMaxDepth,
    };
  }, [snapshots]);

  // Current active frame in call stack
  const activeStack = currentSnapshot?.stack || [];

  return (
    <div className="bg-white rounded-xl border border-[#E0E0E0] shadow-xs p-3.5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E8F0FE] text-[#2874F0] flex items-center justify-center font-bold">
            <GitFork className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#212121]">Recursion &amp; Call Tree Graph</h3>
            <p className="text-[10px] text-[#666666]">
              Dynamic branching invocation tree visualizing call stack frames, parameter passing, and return values.
            </p>
          </div>
        </div>

        {isRecursive && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E8F0FE] text-[#2874F0]">
            Max Call Depth: {maxDepth}
          </span>
        )}
      </div>

      {!isRecursive ? (
        <div className="bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1] p-6 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#E8F0FE] text-[#2874F0] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#212121]">No Recursive Functions Detected</h4>
            <p className="text-xs text-[#666666] max-w-md mt-1">
              Your current program runs sequentially in the main scope. To visualize recursive call trees and stack unwinding, try running a recursive algorithm like Fibonacci!
            </p>
          </div>
          <button
            onClick={() => loadExample('fibonacci')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2874F0] hover:bg-[#1E6DE3] text-white font-bold text-xs shadow-xs transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Load Recursive Fibonacci Example</span>
          </button>
        </div>
      ) : (
        <div className="bg-[#F8FAFC] rounded-xl border border-[#E8EEF5] p-4 overflow-x-auto min-h-[300px] flex items-center justify-center">
          <svg width="600" height={Math.max(260, (maxDepth + 1) * 75)} className="select-none">
            {/* Draw Edges */}
            {treeEdges.map((edge, idx) => {
              const fromNode = treeNodes.find((n) => n.id === edge.fromId);
              const toNode = treeNodes.find((n) => n.id === edge.toId);
              if (!fromNode || !toNode) return null;

              return (
                <line
                  key={`edge-${idx}`}
                  x1={fromNode.x + 60}
                  y1={fromNode.y + 36}
                  x2={toNode.x + 60}
                  y2={toNode.y}
                  stroke="#94A3B8"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />
              );
            })}

            {/* Draw Nodes */}
            {treeNodes.map((node) => {
              const isActive =
                activeStack.some(
                  (f) =>
                    f.functionName === node.funcName &&
                    JSON.stringify(f.parameters) === JSON.stringify(node.args)
                );

              const hasPassed = currentStepIndex >= node.callStep;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                >
                  {/* Glowing active ring */}
                  {isActive && (
                    <rect
                      x="-3"
                      y="-3"
                      width="126"
                      height="42"
                      rx="10"
                      fill="none"
                      stroke="#2874F0"
                      strokeWidth="3"
                      className="animate-pulse"
                    />
                  )}

                  {/* Main Node Card */}
                  <rect
                    x="0"
                    y="0"
                    width="120"
                    height="36"
                    rx="8"
                    fill={isActive ? '#E8F0FE' : hasPassed ? '#FFFFFF' : '#F1F3F6'}
                    stroke={isActive ? '#2874F0' : hasPassed ? '#10B981' : '#CBD5E1'}
                    strokeWidth={isActive ? 2 : 1.5}
                    className="shadow-xs transition-all"
                  />

                  {/* Text Header */}
                  <text
                    x="60"
                    y="16"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                    fill={isActive ? '#2874F0' : '#212121'}
                  >
                    {node.funcName}({Object.values(node.args).join(', ')})
                  </text>

                  {/* Status subtitle */}
                  <text
                    x="60"
                    y="28"
                    textAnchor="middle"
                    fontSize="8"
                    fontFamily="monospace"
                    fill={isActive ? '#2874F0' : hasPassed ? '#10B981' : '#94A3B8'}
                  >
                    {isActive ? '● Executing' : hasPassed ? '✓ Returned' : 'Pending'}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Active Call Stack Frames List */}
      <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E0E0E0]">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#212121] mb-2">
          <CornerDownRight className="w-3.5 h-3.5 text-[#2874F0]" />
          <span>Active Call Stack Frame Inspection</span>
        </div>

        {activeStack.length === 0 ? (
          <span className="text-[11px] text-[#878787] font-mono">Stack empty (Main Thread)</span>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            {activeStack.map((frame, i) => (
              <div
                key={`frame-${i}`}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-[#2874F0]/40 shadow-xs text-xs font-mono"
              >
                <span className="text-[10px] text-[#878787]">#{i}</span>
                <span className="font-bold text-[#2874F0]">{frame.functionName}</span>
                <span className="text-[#666666]">
                  ({Object.entries(frame.parameters || {}).map(([k, v]) => `${k}=${v}`).join(', ')})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
