import React, { useState, useMemo } from 'react';
import {
  Workflow,
  GitBranch,
  TrendingUp,
  Database,
  GitFork,
  LayoutGrid,
  Play,
  Pause,
  StepForward,
  StepBack,
  RotateCcw,
  Sparkles,
  Terminal,
  Cpu,
} from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';
import { ControlFlowGraphView } from './ControlFlowGraphView';
import { VariableDynamicsView } from './VariableDynamicsView';
import { DataStructurePointersView } from './DataStructurePointersView';
import { RecursionTreeView } from './RecursionTreeView';

type FlowSubTab = 'all' | 'cfg' | 'dynamics' | 'pointers' | 'recursion';

export const CodeFlowVisualizer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<FlowSubTab>('all');
  const {
    sourceCode,
    snapshots,
    currentStepIndex,
    jumpToStep,
    run,
    pause,
    stepForward,
    stepBackward,
    reset,
    status,
  } = useExecutionStore();

  const isRunning = status === 'running';
  const currentSnapshot = snapshots[currentStepIndex];
  const activeLine = currentSnapshot ? currentSnapshot.line : -1;
  const totalSteps = snapshots.length;

  // Split source code into lines
  const codeLines = useMemo(() => {
    return sourceCode.split('\n');
  }, [sourceCode]);

  // Variables in current scope
  const currentVars = useMemo(() => {
    if (!currentSnapshot) return [];
    return currentSnapshot.memory;
  }, [currentSnapshot]);

  return (
    <div className="flex flex-col gap-3 min-h-[600px] animate-in fade-in duration-150">
      {/* 1. Header Toolbar: Mode Switcher & Execution Telemetry */}
      <div className="bg-white rounded-xl border border-[#E0E0E0] shadow-xs p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Section Title & Status */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2874F0] text-white flex items-center justify-center font-bold shadow-xs">
            <Workflow className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-extrabold text-[#212121]">Live Code Flow &amp; Graph Visualizer</h2>
              <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-[#F8D706] text-[#212121]">
                ANIMATED
              </span>
            </div>
            <p className="text-[10px] text-[#666666] hidden sm:block">
              Line-by-line synchronized execution graphs, control flowcharts, variable dynamics &amp; pointer shifts.
            </p>
          </div>
        </div>

        {/* Center: Graph Mode Sub-Tabs */}
        <div className="flex items-center bg-[#F1F3F6] p-1 rounded-xl border border-[#E0E0E0] text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              activeSubTab === 'all'
                ? 'bg-white text-[#2874F0] font-bold shadow-xs'
                : 'text-[#666666] hover:text-[#212121]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveSubTab('cfg')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              activeSubTab === 'cfg'
                ? 'bg-white text-[#2874F0] font-bold shadow-xs'
                : 'text-[#666666] hover:text-[#212121]'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Flowchart</span>
          </button>

          <button
            onClick={() => setActiveSubTab('dynamics')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              activeSubTab === 'dynamics'
                ? 'bg-white text-[#2874F0] font-bold shadow-xs'
                : 'text-[#666666] hover:text-[#212121]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Variable Charts</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pointers')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              activeSubTab === 'pointers'
                ? 'bg-white text-[#2874F0] font-bold shadow-xs'
                : 'text-[#666666] hover:text-[#212121]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>DS Pointers</span>
          </button>

          <button
            onClick={() => setActiveSubTab('recursion')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              activeSubTab === 'recursion'
                ? 'bg-white text-[#2874F0] font-bold shadow-xs'
                : 'text-[#666666] hover:text-[#212121]'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Recursion Tree</span>
          </button>
        </div>

        {/* Right: Quick Player Controls */}
        <div className="flex items-center gap-1 bg-[#F1F3F6] p-0.5 rounded-lg border border-[#E0E0E0]">
          <button
            onClick={stepBackward}
            disabled={currentStepIndex <= 0 || isRunning}
            className="p-1 rounded text-[#666666] hover:text-[#212121] disabled:opacity-30"
            title="Step Back"
          >
            <StepBack className="w-3.5 h-3.5" />
          </button>

          {isRunning ? (
            <button
              onClick={pause}
              className="px-2 py-0.5 bg-[#F8D706] text-[#212121] font-bold text-xs rounded shadow-xs"
            >
              <Pause className="w-3 h-3 fill-current" />
            </button>
          ) : (
            <button
              onClick={run}
              className="px-2 py-0.5 bg-[#FF9F00] text-white font-bold text-xs rounded shadow-xs"
            >
              <Play className="w-3 h-3 fill-current" />
            </button>
          )}

          <button
            onClick={stepForward}
            disabled={currentStepIndex >= totalSteps - 1 || isRunning}
            className="p-1 rounded text-[#666666] hover:text-[#212121] disabled:opacity-30"
            title="Step Forward"
          >
            <StepForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={reset}
            className="p-1 rounded text-[#666666] hover:text-[#212121]"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* Left Column: Synchronized Line-by-Line Code Viewer */}
        <div className="xl:col-span-4 bg-white rounded-xl border border-[#E0E0E0] shadow-xs p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#212121]">
                <Terminal className="w-3.5 h-3.5 text-[#2874F0]" />
                <span>Line-by-Line Code Synchronizer</span>
              </div>
              <span className="text-[10px] font-mono text-[#878787]">
                Line {activeLine > 0 ? `#${activeLine}` : '-'}
              </span>
            </div>

            {/* Code Lines List */}
            <div className="space-y-1 font-mono text-xs max-h-[460px] overflow-y-auto pr-1">
              {codeLines.map((lineText, idx) => {
                const lineNum = idx + 1;
                const isActive = lineNum === activeLine;
                const isExecuted = snapshots.slice(0, currentStepIndex + 1).some((s) => s.line === lineNum);

                return (
                  <div
                    key={`code-line-${lineNum}`}
                    onClick={() => {
                      const target = snapshots.findIndex((s) => s.line === lineNum);
                      if (target >= 0) jumpToStep(target);
                    }}
                    className={`flex items-center justify-between px-2 py-1 rounded-lg cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#FFFBEB] border border-[#F8D706] shadow-xs text-[#212121] font-bold'
                        : isExecuted
                        ? 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
                        : 'text-[#94A3B8] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span
                        className={`w-6 text-right select-none text-[10px] ${
                          isActive ? 'text-[#D97706] font-bold' : 'text-[#94A3B8]'
                        }`}
                      >
                        {lineNum}
                      </span>
                      {isActive && <span className="text-[#FF9F00] text-[10px]">▶</span>}
                      <span className="truncate">{lineText || ' '}</span>
                    </div>

                    {isActive && (
                      <span className="px-1.5 py-0.2 rounded bg-[#F8D706] text-[#212121] text-[9px] font-bold shrink-0 ml-1">
                        NOW
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Step Machine Explanation Bubble */}
          <div className="mt-3 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
            <div className="flex items-center gap-1 font-bold text-[#2874F0] text-[11px] mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Machine Execution Event</span>
            </div>
            <p className="text-[11px] text-[#475569] leading-relaxed">
              {currentSnapshot?.explanation?.beginner ||
                currentSnapshot?.explanation?.whySummary ||
                'Executing program instructions cycle-by-cycle.'}
            </p>
          </div>
        </div>

        {/* Right Column: Graphs & Visualizations based on active sub-tab */}
        <div className="xl:col-span-8 flex flex-col gap-3">
          {activeSubTab === 'all' && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <ControlFlowGraphView />
                <VariableDynamicsView />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <DataStructurePointersView />
                <RecursionTreeView />
              </div>
            </div>
          )}

          {activeSubTab === 'cfg' && <ControlFlowGraphView />}
          {activeSubTab === 'dynamics' && <VariableDynamicsView />}
          {activeSubTab === 'pointers' && <DataStructurePointersView />}
          {activeSubTab === 'recursion' && <RecursionTreeView />}
        </div>
      </div>
    </div>
  );
};
