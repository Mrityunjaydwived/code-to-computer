import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Cpu,
  Layers,
  Compass,
  Boxes,
  GraduationCap,
  Sparkles,
  Smartphone,
  HardDrive,
  Terminal,
  Activity,
  HelpCircle,
  FileCode,
  GripVertical,
  Maximize2,
  Minimize2,
  Workflow,
} from 'lucide-react';
import { useExecutionStore, TabType, MobileView } from './store/executionStore';
import { TopNavBar } from './components/Header/TopNavBar';
import { CommandPalette } from './components/Header/CommandPalette';
import { CodeEditor } from './components/Editor/CodeEditor';
import { CpuVisualizer } from './components/Architecture/CpuVisualizer';
import { RegisterBank } from './components/Architecture/RegisterBank';
import { CacheVisualizer } from './components/Architecture/CacheVisualizer';
import { SystemBus } from './components/Architecture/SystemBus';
import { Architecture3D } from './components/Architecture/Architecture3D';
import { MemoryMap } from './components/Memory/MemoryMap';
import { StackVisualizer } from './components/Memory/StackVisualizer';
import { HeapVisualizer } from './components/Memory/HeapVisualizer';
import { GcVisualizer } from './components/Memory/GcVisualizer';
import { AddressInspector } from './components/Memory/AddressInspector';
import { CompilerPipeline } from './components/Pipeline/CompilerPipeline';
import { DsMemoryBridge } from './components/DataStructures/DsMemoryBridge';
import { CodeFlowVisualizer } from './components/FlowGraph/CodeFlowVisualizer';
import { WhyModal } from './components/Education/WhyModal';
import { LessonsView } from './components/Education/LessonsView';
import { GateModeView } from './components/Education/GateModeView';
import { RealWorldView } from './components/Education/RealWorldView';
import { ExecutionTimeline } from './components/Timeline/ExecutionTimeline';
import { EventLog } from './components/Timeline/EventLog';
import { ConsoleOutput } from './components/Timeline/ConsoleOutput';
import { MetricsDashboard } from './components/Timeline/MetricsDashboard';
import { LandingHero } from './components/Landing/LandingHero';

export const App: React.FC = () => {
  const {
    compileAndInit,
    activeTab,
    setActiveTab,
    bottomTab,
    setBottomTab,
    run,
    pause,
    stepForward,
    stepBackward,
    reset,
    status,
    editorWidthPercent,
    setEditorWidthPercent,
    mobileView,
    setMobileView,
  } = useExecutionStore();

  const [showLanding, setShowLanding] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState<boolean>(false);
  const savedWidthRef = useRef<number>(editorWidthPercent);

  // Initial compilation on mount (restores saved execution position)
  useEffect(() => {
    compileAndInit();
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside textarea or input
      if (
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'INPUT'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (status === 'running') pause();
        else run();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, run, pause, stepForward, stepBackward, reset]);

  // Draggable Splitter Handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleTouchStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newPercent = (e.clientX / window.innerWidth) * 100;
      setEditorWidthPercent(newPercent);
      if (isEditorCollapsed) setIsEditorCollapsed(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const newPercent = (touch.clientX / window.innerWidth) * 100;
        setEditorWidthPercent(newPercent);
        if (isEditorCollapsed) setIsEditorCollapsed(false);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isEditorCollapsed, setEditorWidthPercent]);

  const toggleEditorCollapse = () => {
    if (isEditorCollapsed) {
      setIsEditorCollapsed(false);
      setEditorWidthPercent(savedWidthRef.current || 38);
    } else {
      savedWidthRef.current = editorWidthPercent;
      setIsEditorCollapsed(true);
    }
  };

  const tabs: Array<{ id: TabType; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'architecture', label: 'CPU & Architecture', icon: Cpu },
    { id: 'flowgraph', label: 'Code Flow & Graphs', icon: Workflow },
    { id: 'memory', label: 'Memory & Stack/Heap', icon: Layers },
    { id: 'pipeline', label: 'Compiler Pipeline', icon: Compass },
    { id: '3d', label: '3D Silicon View', icon: Boxes },
    { id: 'datastructures', label: 'Data Structures', icon: HardDrive },
    { id: 'lessons', label: 'Lessons & Quiz', icon: GraduationCap },
    { id: 'gate', label: 'GATE Exam Mode', icon: Sparkles },
    { id: 'realworld', label: 'Real-World Systems', icon: Smartphone },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F1F3F6] text-[#212121] font-sans selection:bg-[#2874F0]/20 selection:text-[#2874F0]">
      {/* Landing Page Hero Tour (Optional Overlay) */}
      {showLanding && <LandingHero onDismiss={() => setShowLanding(false)} />}

      {/* Modals */}
      <CommandPalette />
      <AddressInspector />
      <WhyModal />

      {/* Top Navigation Bar */}
      <TopNavBar />

      {/* Mobile-Only Segment Switcher Bar (screens < 768px) */}
      <div className="md:hidden flex items-center justify-around bg-white border-b border-[#E0E0E0] px-2 py-1.5 shrink-0 z-20">
        <button
          onClick={() => setMobileView('editor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mobileView === 'editor'
              ? 'bg-[#2874F0] text-white shadow-xs'
              : 'text-[#666666] hover:bg-[#F5F5F5]'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Code Editor</span>
        </button>

        <button
          onClick={() => setMobileView('visualizer')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mobileView === 'visualizer'
              ? 'bg-[#2874F0] text-white shadow-xs'
              : 'text-[#666666] hover:bg-[#F5F5F5]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Visualizer</span>
        </button>

        <button
          onClick={() => setMobileView('telemetry')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mobileView === 'telemetry'
              ? 'bg-[#2874F0] text-white shadow-xs'
              : 'text-[#666666] hover:bg-[#F5F5F5]'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Console</span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden select-none">
        {/* Left Column: Code Editor */}
        <div
          style={{
            width: isEditorCollapsed ? '0px' : undefined,
            flexBasis: isEditorCollapsed ? '0px' : `${editorWidthPercent}%`,
          }}
          className={`shrink-0 flex flex-col overflow-hidden transition-[width,flex-basis] duration-100 ease-out border-r border-[#E0E0E0] ${
            mobileView === 'editor' ? 'flex h-[calc(100vh-170px)]' : 'hidden md:flex h-[calc(100vh-160px)]'
          }`}
        >
          {!isEditorCollapsed && <CodeEditor />}
        </div>

        {/* Draggable Resizer Splitter (visible on md+ screens) */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onDoubleClick={() => setEditorWidthPercent(38)}
          title="Drag to resize panel • Double-click to reset (38%)"
          className={`hidden md:flex w-2 hover:w-2.5 items-center justify-center cursor-col-resize select-none shrink-0 transition-all ${
            isDragging ? 'bg-[#2874F0] shadow-md' : 'bg-[#E0E0E0] hover:bg-[#2874F0]/50'
          }`}
        >
          <GripVertical className="w-3 h-3 text-[#666666] pointer-events-none" />
        </div>

        {/* Right Column: Interactive Multi-Tab Visualizations */}
        <div
          className={`flex-1 flex flex-col h-[calc(100vh-170px)] md:h-[calc(100vh-160px)] overflow-hidden bg-[#F1F3F6] ${
            mobileView === 'editor' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Main Visualizer Navigation Tabs & Collapse Control */}
          <div className="h-11 px-3 bg-white border-b border-[#E0E0E0] flex items-center justify-between gap-1 overflow-x-auto select-none shrink-0">
            <div className="flex items-center gap-1">
              {/* Desktop Editor Collapse / Expand Toggle */}
              <button
                onClick={toggleEditorCollapse}
                title={isEditorCollapsed ? "Expand Editor" : "Collapse Editor (Full Visualizer Mode)"}
                className="hidden md:flex items-center p-1.5 rounded-lg text-[#666666] hover:text-[#212121] hover:bg-[#F5F5F5] transition-colors shrink-0 mr-1"
              >
                {isEditorCollapsed ? <Maximize2 className="w-3.5 h-3.5 text-[#2874F0]" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (mobileView === 'telemetry') setMobileView('visualizer');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#2874F0] text-white font-bold shadow-xs'
                        : 'text-[#666666] hover:text-[#212121] hover:bg-[#F5F5F5]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#878787]'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowLanding(true)}
              className="p-1.5 rounded-lg text-[#878787] hover:text-[#212121] hover:bg-[#F5F5F5] text-xs transition-colors shrink-0"
              title="Open Tour & Overview"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Active Visualization Tab Container */}
          <div className="flex-1 p-3 overflow-y-auto space-y-4">
            {/* Tab 1: CPU Architecture */}
            {activeTab === 'architecture' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <CpuVisualizer />
                <RegisterBank />
                <SystemBus />
                <CacheVisualizer />
              </div>
            )}

            {/* Tab: Code Flow & Graphs */}
            {activeTab === 'flowgraph' && (
              <div className="animate-in fade-in duration-150">
                <CodeFlowVisualizer />
              </div>
            )}

            {/* Tab 2: Memory, Stack & Heap */}
            {activeTab === 'memory' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <MemoryMap />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <StackVisualizer />
                  <HeapVisualizer />
                </div>
                <GcVisualizer />
              </div>
            )}

            {/* Tab 3: Compiler Pipeline */}
            {activeTab === 'pipeline' && (
              <div className="animate-in fade-in duration-150">
                <CompilerPipeline />
              </div>
            )}

            {/* Tab 4: 3D Silicon Architecture */}
            {activeTab === '3d' && (
              <div className="h-full min-h-[460px] animate-in fade-in duration-150">
                <Architecture3D />
              </div>
            )}

            {/* Tab 5: Data Structures */}
            {activeTab === 'datastructures' && (
              <div className="animate-in fade-in duration-150">
                <DsMemoryBridge />
              </div>
            )}

            {/* Tab 6: Lessons & Quizzes */}
            {activeTab === 'lessons' && (
              <div className="animate-in fade-in duration-150">
                <LessonsView />
              </div>
            )}

            {/* Tab 7: GATE Exam Mode */}
            {activeTab === 'gate' && (
              <div className="animate-in fade-in duration-150">
                <GateModeView />
              </div>
            )}

            {/* Tab 8: Real-World Systems */}
            {activeTab === 'realworld' && (
              <div className="animate-in fade-in duration-150">
                <RealWorldView />
              </div>
            )}
          </div>

          {/* Collapsible Lower Dock: Console / Event Log / Telemetry */}
          <div
            className={`border-t border-[#E0E0E0] bg-white shrink-0 ${
              mobileView === 'telemetry' ? 'h-full flex flex-col' : ''
            }`}
          >
            <div className="flex items-center justify-between px-3 h-8 bg-[#F7F7F7] border-b border-[#E0E0E0] text-xs font-mono">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setBottomTab('console')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded transition-colors ${
                    bottomTab === 'console'
                      ? 'text-[#388E3C] font-bold bg-[#E8F5E9]'
                      : 'text-[#666666] hover:text-[#212121]'
                  }`}
                >
                  <Terminal className="w-3 h-3" />
                  <span>Terminal (Stdout)</span>
                </button>

                <button
                  onClick={() => setBottomTab('events')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded transition-colors ${
                    bottomTab === 'events'
                      ? 'text-[#2874F0] font-bold bg-[#E8F0FE]'
                      : 'text-[#666666] hover:text-[#212121]'
                  }`}
                >
                  <Activity className="w-3 h-3" />
                  <span>Hardware Events</span>
                </button>

                <button
                  onClick={() => setBottomTab('metrics')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded transition-colors ${
                    bottomTab === 'metrics'
                      ? 'text-[#1F74BA] font-bold bg-[#E8F0FE]'
                      : 'text-[#666666] hover:text-[#212121]'
                  }`}
                >
                  <Cpu className="w-3 h-3" />
                  <span>Performance Telemetry</span>
                </button>
              </div>

              <span className="text-[10px] text-[#878787] hidden sm:inline">
                Space: Run/Pause • Arrows: Step • R: Reset • Ctrl+K: Search
              </span>
            </div>

            <div className="p-2.5 max-h-52 overflow-y-auto bg-[#F1F3F6]">
              {bottomTab === 'console' && <ConsoleOutput />}
              {bottomTab === 'events' && <EventLog />}
              {bottomTab === 'metrics' && <MetricsDashboard />}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Master Execution Timeline Scrubber */}
      <ExecutionTimeline />
    </div>
  );
};
export default App;
