import React, { useMemo, useState } from 'react';
import { TrendingUp, Activity, BarChart3, Clock, ArrowUpRight, ArrowDownRight, Minus, Sparkles } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

const COLOR_PALETTE = [
  { stroke: '#2874F0', fill: 'rgba(40, 116, 240, 0.15)', name: 'Blue' },
  { stroke: '#FF9F00', fill: 'rgba(255, 159, 0, 0.15)', name: 'Orange' },
  { stroke: '#10B981', fill: 'rgba(16, 185, 129, 0.15)', name: 'Green' },
  { stroke: '#8B5CF6', fill: 'rgba(139, 92, 246, 0.15)', name: 'Purple' },
  { stroke: '#EC4899', fill: 'rgba(236, 72, 153, 0.15)', name: 'Pink' },
  { stroke: '#F59E0B', fill: 'rgba(245, 158, 11, 0.15)', name: 'Amber' },
];

export const VariableDynamicsView: React.FC = () => {
  const { snapshots, currentStepIndex, jumpToStep } = useExecutionStore();
  const [selectedVar, setSelectedVar] = useState<string | null>(null);

  // Extract all distinct numeric variables across all snapshots
  const { varNames, varHistories, minVal, maxVal } = useMemo(() => {
    const namesSet = new Set<string>();

    snapshots.forEach((snap) => {
      snap.memory.forEach((mem) => {
        if (typeof mem.value === 'number') {
          namesSet.add(mem.label);
        }
      });
    });

    const names = Array.from(namesSet);
    const histories: Record<string, Array<{ step: number; value: number }>> = {};
    names.forEach((name) => {
      histories[name] = [];
    });

    let overallMin = Infinity;
    let overallMax = -Infinity;

    snapshots.forEach((snap, stepIdx) => {
      const stepMemMap = new Map<string, number>();
      snap.memory.forEach((mem) => {
        if (typeof mem.value === 'number') {
          stepMemMap.set(mem.label, mem.value);
        }
      });

      names.forEach((name) => {
        const lastVal = histories[name].length > 0 ? histories[name][histories[name].length - 1].value : 0;
        const val = stepMemMap.has(name) ? stepMemMap.get(name)! : lastVal;
        histories[name].push({ step: stepIdx, value: val });
        if (val < overallMin) overallMin = val;
        if (val > overallMax) overallMax = val;
      });
    });

    if (overallMin === Infinity) overallMin = 0;
    if (overallMax === -Infinity || overallMax === overallMin) overallMax = overallMin + 10;

    return {
      varNames: names,
      varHistories: histories,
      minVal: overallMin,
      maxVal: overallMax,
    };
  }, [snapshots]);

  const currentSnapshot = snapshots[currentStepIndex];
  const prevSnapshot = currentStepIndex > 0 ? snapshots[currentStepIndex - 1] : null;

  // Chart dimensions
  const chartWidth = 640;
  const chartHeight = 220;
  const padding = { top: 20, right: 30, bottom: 30, left: 40 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const totalSteps = Math.max(1, snapshots.length - 1);
  const valRange = Math.max(1, maxVal - minVal);

  const getX = (step: number) => padding.left + (step / totalSteps) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - ((val - minVal) / valRange) * innerHeight;

  // Compute current variables with delta
  const currentVarMetrics = useMemo(() => {
    if (!currentSnapshot) return [];

    return currentSnapshot.memory.map((mem) => {
      const prevMem = prevSnapshot ? prevSnapshot.memory.find((m) => m.label === mem.label) : null;
      let deltaType: 'increase' | 'decrease' | 'same' | 'new' = 'same';
      let deltaText = 'Unchanged';

      if (!prevMem) {
        deltaType = 'new';
        deltaText = 'Initialized';
      } else if (typeof mem.value === 'number' && typeof prevMem.value === 'number') {
        const diff = mem.value - prevMem.value;
        if (diff > 0) {
          deltaType = 'increase';
          deltaText = `+${diff}`;
        } else if (diff < 0) {
          deltaType = 'decrease';
          deltaText = `${diff}`;
        }
      } else if (mem.value !== prevMem.value) {
        deltaType = 'increase';
        deltaText = 'Updated';
      }

      return {
        ...mem,
        deltaType,
        deltaText,
      };
    });
  }, [currentSnapshot, prevSnapshot]);

  return (
    <div className="bg-white rounded-xl border border-[#E0E0E0] shadow-xs p-3.5 flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E8F0FE] text-[#2874F0] flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#212121]">Variable Dynamics &amp; Evolution Graphs</h3>
            <p className="text-[10px] text-[#666666]">
              Real-time time-series plots and state magnitude trackers showing how values mutate line-by-line.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-[#666666]">
          <Clock className="w-3.5 h-3.5 text-[#2874F0]" />
          <span>Step {currentStepIndex + 1} of {snapshots.length}</span>
        </div>
      </div>

      {/* 1. Time-Series Line & Area Chart */}
      <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E8EEF5]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#212121]">
            <Activity className="w-3.5 h-3.5 text-[#2874F0]" />
            <span>Time-Series Trajectory Plot</span>
          </div>

          {/* Variable Toggles */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {varNames.map((name, i) => {
              const color = COLOR_PALETTE[i % COLOR_PALETTE.length];
              const isSelected = selectedVar === null || selectedVar === name;
              return (
                <button
                  key={name}
                  onClick={() => setSelectedVar(selectedVar === name ? null : name)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all ${
                    isSelected
                      ? 'bg-white shadow-xs border text-[#212121]'
                      : 'opacity-40 hover:opacity-80'
                  }`}
                  style={{ borderColor: color.stroke }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.stroke }} />
                  <span>{name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SVG Time-Series Chart */}
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-48 select-none cursor-crosshair"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, (clickX - (padding.left / chartWidth) * rect.width) / ((innerWidth / chartWidth) * rect.width)));
              const targetStep = Math.round(ratio * totalSteps);
              jumpToStep(targetStep);
            }}
          >
            <defs>
              {varNames.map((name, i) => {
                const color = COLOR_PALETTE[i % COLOR_PALETTE.length];
                return (
                  <linearGradient key={`grad-${name}`} id={`grad-${name}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color.stroke} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color.stroke} stopOpacity="0.0" />
                  </linearGradient>
                );
              })}
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = padding.top + innerHeight * (1 - pct);
              const val = Math.round(minVal + pct * valRange);
              return (
                <g key={`grid-${idx}`}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + innerWidth}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="3,3"
                  />
                  <text
                    x={padding.left - 6}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="9"
                    fontFamily="monospace"
                    fill="#94A3B8"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Render Area & Line for each variable */}
            {varNames.map((name, i) => {
              if (selectedVar !== null && selectedVar !== name) return null;
              const color = COLOR_PALETTE[i % COLOR_PALETTE.length];
              const history = varHistories[name];
              if (!history || history.length === 0) return null;

              // Generate path d
              const points = history.map((pt) => `${getX(pt.step)},${getY(pt.value)}`);
              const linePath = `M ${points.join(' L ')}`;
              const areaPath = `${linePath} L ${getX(history[history.length - 1].step)},${padding.top + innerHeight} L ${getX(0)},${padding.top + innerHeight} Z`;

              return (
                <g key={`series-${name}`}>
                  <path d={areaPath} fill={`url(#grad-${name})`} />
                  <path d={linePath} fill="none" stroke={color.stroke} strokeWidth="2.5" strokeLinecap="round" />
                </g>
              );
            })}

            {/* Active Step Vertical Playhead */}
            {snapshots.length > 0 && (
              <g>
                <line
                  x1={getX(currentStepIndex)}
                  y1={padding.top}
                  x2={getX(currentStepIndex)}
                  y2={padding.top + innerHeight}
                  stroke="#2874F0"
                  strokeWidth="2"
                  strokeDasharray="4,2"
                />
                <circle
                  cx={getX(currentStepIndex)}
                  cy={padding.top}
                  r="4"
                  fill="#2874F0"
                  className="animate-pulse"
                />

                {/* Dots on points for active step */}
                {varNames.map((name, i) => {
                  if (selectedVar !== null && selectedVar !== name) return null;
                  const color = COLOR_PALETTE[i % COLOR_PALETTE.length];
                  const history = varHistories[name];
                  const pt = history ? history[currentStepIndex] : null;
                  if (!pt) return null;

                  return (
                    <g key={`pt-${name}`}>
                      <circle
                        cx={getX(currentStepIndex)}
                        cy={getY(pt.value)}
                        r="5"
                        fill={color.stroke}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                      <rect
                        x={getX(currentStepIndex) + 6}
                        y={getY(pt.value) - 10}
                        width="36"
                        height="16"
                        rx="3"
                        fill="#212121"
                        opacity="0.85"
                      />
                      <text
                        x={getX(currentStepIndex) + 24}
                        y={getY(pt.value) + 2}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                        fill="#FFFFFF"
                      >
                        {pt.value}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* 2. Live Variable Magnitude Bars & Delta Indicators */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#212121] mb-2.5">
          <BarChart3 className="w-3.5 h-3.5 text-[#2874F0]" />
          <span>Active Variable States &amp; Value Shifts</span>
        </div>

        {currentVarMetrics.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#878787] bg-[#F8FAFC] rounded-lg border border-dashed border-[#CBD5E1]">
            No variables allocated in current step. Step forward to allocate memory.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {currentVarMetrics.map((mem, idx) => {
              const numVal = typeof mem.value === 'number' ? mem.value : null;
              const barPercent = numVal !== null ? Math.min(100, Math.max(8, ((numVal - minVal) / valRange) * 100)) : 100;
              const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];

              return (
                <div
                  key={mem.label}
                  className="bg-white p-2.5 rounded-lg border border-[#E0E0E0] shadow-xs flex flex-col justify-between hover:border-[#2874F0] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.stroke }} />
                      <span className="font-mono font-bold text-xs text-[#212121]">{mem.label}</span>
                    </div>

                    {/* Delta Badge */}
                    <span
                      className={`flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                        mem.deltaType === 'increase'
                          ? 'bg-[#E8F5E9] text-[#2E7D32]'
                          : mem.deltaType === 'decrease'
                          ? 'bg-[#FFEBEE] text-[#C62828]'
                          : mem.deltaType === 'new'
                          ? 'bg-[#E8F0FE] text-[#2874F0]'
                          : 'bg-[#F1F3F6] text-[#616161]'
                      }`}
                    >
                      {mem.deltaType === 'increase' && <ArrowUpRight className="w-3 h-3" />}
                      {mem.deltaType === 'decrease' && <ArrowDownRight className="w-3 h-3" />}
                      {mem.deltaType === 'same' && <Minus className="w-2.5 h-2.5" />}
                      {mem.deltaType === 'new' && <Sparkles className="w-2.5 h-2.5" />}
                      <span>{mem.deltaText}</span>
                    </span>
                  </div>

                  {/* Value */}
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-[10px] text-[#878787] font-mono">{mem.address}</span>
                    <span className="text-base font-extrabold font-mono text-[#212121]">
                      {typeof mem.value === 'object' ? JSON.stringify(mem.value) : String(mem.value)}
                    </span>
                  </div>

                  {/* Magnitude Bar */}
                  <div className="w-full h-1.5 bg-[#F1F3F6] rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${barPercent}%`,
                        backgroundColor: color.stroke,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
