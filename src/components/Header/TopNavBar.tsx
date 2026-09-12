import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  StepForward,
  StepBack,
  RotateCcw,
  Sparkles,
  Cpu,
  Search,
  Zap,
  Terminal,
  Loader2,
  Keyboard,
  ChevronDown,
  Sliders,
  X,
  FastForward,
  Menu,
} from 'lucide-react';
import { useExecutionStore, EducationalMode } from '../../store/executionStore';
import { ExampleSelector } from '../Editor/ExampleSelector';

export const TopNavBar: React.FC = () => {
  const {
    status,
    run,
    pause,
    stepForward,
    stepBackward,
    jumpToStep,
    reset,
    speed,
    setSpeed,
    educationalMode,
    setEducationalMode,
    setIsCommandPaletteOpen,
    setIsWhyModalOpen,
    executionEngineMode,
    setExecutionEngineMode,
    isWasmRunning,
    runWasm,
    wasmDurationMs,
    currentStepIndex,
    snapshots,
  } = useExecutionStore();

  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isStepJumpOpen, setIsStepJumpOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const speedMenuRef = useRef<HTMLDivElement>(null);
  const shortcutsMenuRef = useRef<HTMLDivElement>(null);
  const stepJumpRef = useRef<HTMLDivElement>(null);

  const isRunning = status === 'running' || isWasmRunning;
  const isCpython = executionEngineMode === 'cpython';
  const totalSteps = snapshots.length;
  const currentStepDisplay = totalSteps > 0 ? currentStepIndex + 1 : 0;
  const stepPercentage = totalSteps > 0 ? Math.min(100, Math.round(((currentStepIndex + 1) / totalSteps) * 100)) : 0;

  const speedOptions = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0];

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (speedMenuRef.current && !speedMenuRef.current.contains(target)) {
        setIsSpeedMenuOpen(false);
      }
      if (shortcutsMenuRef.current && !shortcutsMenuRef.current.contains(target)) {
        setIsShortcutsOpen(false);
      }
      if (stepJumpRef.current && !stepJumpRef.current.contains(target)) {
        setIsStepJumpOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 sm:h-16 bg-gradient-to-r from-[#2874F0] via-[#1E6DE3] to-[#1F74BA] text-white px-2.5 sm:px-4 lg:px-6 flex items-center justify-between z-30 sticky top-0 border-b border-[#185AC2] shadow-[0_2px_12px_rgba(0,0,0,0.14)] select-none">
      {/* DESKTOP NAVBAR (md and up) */}
      <div className="hidden md:flex items-center justify-between w-full h-full gap-2 sm:gap-3">
        {/* 1. LEFT CLUSTER: Brand & Dual-Engine Segmented Pill */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Brand Logo & Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/15 border border-white/30 flex items-center justify-center shadow-inner shrink-0 group">
            <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm lg:text-base font-black tracking-tight text-white flex items-center gap-0.5 sm:gap-1">
                <span>CODE</span>
                <span className="text-[#F8D706] font-extrabold">→</span>
                <span>COMPUTER</span>
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-[#F8D706] text-[#212121] shadow-xs flex items-center gap-0.5">
                <span>PLUS</span>
                <span className="text-[10px] leading-none text-[#FF9F00]">✦</span>
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-white/75 font-medium hidden md:inline-block leading-tight">
              Hardware Architecture &amp; CPython 3
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-white/20 hidden sm:block" />

        {/* Dual-Engine Mode Switcher Pill */}
        <div className="flex items-center bg-black/20 backdrop-blur-xs border border-white/20 rounded-full p-0.5 text-xs font-semibold shadow-inner">
          <button
            onClick={() => setExecutionEngineMode('silicon')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs transition-all ${
              !isCpython
                ? 'bg-white text-[#2874F0] font-bold shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title="Hardware Silicon Simulator: Cycle-by-cycle register, cache, memory & pipeline execution"
          >
            <Zap className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${!isCpython ? 'text-[#FF9F00] fill-[#FF9F00]' : ''}`} />
            <span className="hidden sm:inline">Silicon Sim</span>
            <span className="sm:hidden">Silicon</span>
            {!isCpython && <span className="w-1.5 h-1.5 rounded-full bg-[#388E3C] animate-pulse hidden lg:inline-block" />}
          </button>

          <button
            onClick={() => setExecutionEngineMode('cpython')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs transition-all ${
              isCpython
                ? 'bg-[#F8D706] text-[#212121] font-bold shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title="CPython 3 WebAssembly: 100% Python 3 compatibility, advanced algorithms & competitive programming standard library"
          >
            <Terminal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">CPython 3 (Wasm)</span>
            <span className="sm:hidden">Wasm</span>
            {isCpython && <span className="w-1.5 h-1.5 rounded-full bg-[#2874F0] animate-pulse hidden lg:inline-block" />}
          </button>
        </div>
      </div>

      {/* 2. CENTER CLUSTER: Execution Deck & Step Telemetry */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {!isCpython ? (
          /* SILICON SIMULATOR CONTROLLER */
          <div className="flex items-center gap-1 bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-1 shadow-sm">
            {/* Step Back */}
            <button
              onClick={stepBackward}
              disabled={currentStepIndex <= 0 || isRunning}
              title="Step Backward (Left Arrow)"
              className="p-1.5 sm:px-2 rounded-lg text-white/90 hover:text-white hover:bg-white/15 disabled:opacity-35 disabled:hover:bg-transparent transition-all"
            >
              <StepBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Run / Pause Hero Button */}
            {isRunning ? (
              <button
                onClick={pause}
                title="Pause Execution (Space)"
                className="flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-lg bg-[#F8D706] hover:bg-[#F5D000] text-[#212121] font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span className="hidden xs:inline">Pause</span>
              </button>
            ) : (
              <button
                onClick={run}
                title="Run Silicon Simulation (Space)"
                className="flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-lg bg-[#FF9F00] hover:bg-[#F09120] text-white font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run</span>
              </button>
            )}

            {/* Step Forward */}
            <button
              onClick={stepForward}
              disabled={currentStepIndex >= totalSteps - 1 || isRunning}
              title="Step Forward (Right Arrow)"
              className="p-1.5 sm:px-2 rounded-lg text-white/90 hover:text-white hover:bg-white/15 disabled:opacity-35 disabled:hover:bg-transparent transition-all"
            >
              <StepForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Reset */}
            <button
              onClick={reset}
              title="Reset Simulation (R)"
              className="p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/15 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* High-Efficiency Step Counter Pill */}
            <div className="relative" ref={stepJumpRef}>
              <button
                onClick={() => setIsStepJumpOpen(!isStepJumpOpen)}
                title="Click to jump to Start / Mid / End step"
                className="hidden md:flex flex-col justify-center px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-left transition-all min-w-[76px]"
              >
                <div className="flex items-center justify-between gap-1 text-[10px] font-mono font-semibold text-white/90">
                  <span>Step</span>
                  <span className="text-[#F8D706]">
                    {currentStepDisplay}/{totalSteps}
                  </span>
                </div>
                {/* Mini Progress Track */}
                <div className="w-full h-1 bg-black/30 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="h-full bg-[#F8D706] transition-all duration-150"
                    style={{ width: `${stepPercentage}%` }}
                  />
                </div>
              </button>

              {/* Step Jumper Dropdown Menu */}
              {isStepJumpOpen && totalSteps > 0 && (
                <div className="absolute top-full left-0 mt-1.5 w-44 bg-white text-[#212121] rounded-xl shadow-xl border border-[#E0E0E0] p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[11px] font-bold text-[#666666] px-1.5 pb-1 border-b border-[#F0F0F0] flex items-center justify-between">
                    <span>Jump to Step</span>
                    <span className="text-[#2874F0] font-mono">{stepPercentage}%</span>
                  </div>
                  <div className="flex flex-col gap-1 mt-1.5">
                    <button
                      onClick={() => {
                        jumpToStep(0);
                        setIsStepJumpOpen(false);
                      }}
                      className="flex items-center justify-between px-2 py-1 rounded-lg text-xs hover:bg-[#F1F3F6] text-left font-medium transition-colors"
                    >
                      <span>Initial Step</span>
                      <span className="text-[10px] font-mono text-[#878787]">#1</span>
                    </button>
                    <button
                      onClick={() => {
                        jumpToStep(Math.floor(totalSteps / 2));
                        setIsStepJumpOpen(false);
                      }}
                      className="flex items-center justify-between px-2 py-1 rounded-lg text-xs hover:bg-[#F1F3F6] text-left font-medium transition-colors"
                    >
                      <span>Midpoint</span>
                      <span className="text-[10px] font-mono text-[#878787]">#{Math.floor(totalSteps / 2) + 1}</span>
                    </button>
                    <button
                      onClick={() => {
                        jumpToStep(totalSteps - 1);
                        setIsStepJumpOpen(false);
                      }}
                      className="flex items-center justify-between px-2 py-1 rounded-lg text-xs hover:bg-[#F1F3F6] text-left font-medium transition-colors"
                    >
                      <span>Completion</span>
                      <span className="text-[10px] font-mono text-[#878787]">#{totalSteps}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sleek Speed Control Dropdown Popover */}
            <div className="relative" ref={speedMenuRef}>
              <button
                onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-colors"
                title="Change simulation clock speed"
              >
                <span className="text-[#F8D706] font-bold">{speed}x</span>
                <ChevronDown className="w-3 h-3 opacity-75" />
              </button>

              {isSpeedMenuOpen && (
                <div className="absolute top-full right-0 sm:left-0 mt-1.5 w-48 bg-white text-[#212121] rounded-xl shadow-xl border border-[#E0E0E0] p-2.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#666666] pb-1.5 border-b border-[#F0F0F0]">
                    <span className="flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-[#2874F0]" />
                      Clock Speed
                    </span>
                    <span className="text-[#2874F0] font-mono font-bold">{speed}x</span>
                  </div>

                  {/* Preset Buttons Grid */}
                  <div className="grid grid-cols-3 gap-1.5 my-2">
                    {speedOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSpeed(opt);
                          setIsSpeedMenuOpen(false);
                        }}
                        className={`px-1.5 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                          speed === opt
                            ? 'bg-[#2874F0] text-white shadow-xs'
                            : 'bg-[#F1F3F6] text-[#212121] hover:bg-[#E8F0FE] hover:text-[#2874F0]'
                        }`}
                      >
                        {opt}x
                      </button>
                    ))}
                  </div>

                  {/* Slider */}
                  <div className="pt-1">
                    <input
                      type="range"
                      min="0.25"
                      max="3.0"
                      step="0.25"
                      value={speed}
                      onChange={(e) => setSpeed(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#E0E0E0] rounded-lg appearance-none cursor-pointer accent-[#2874F0]"
                    />
                    <div className="flex justify-between text-[9px] text-[#878787] mt-1 font-medium">
                      <span>0.25x Slow</span>
                      <span>3.0x Warp</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* CPYTHON 3 (WASM) CONTROLLER */
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-1 shadow-sm">
            {isWasmRunning ? (
              <button
                disabled
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#FF9F00] text-white font-bold text-xs shadow-sm opacity-90 cursor-wait"
              >
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Executing Code...</span>
              </button>
            ) : (
              <button
                onClick={runWasm}
                title="Execute code with WebAssembly CPython 3 (Ctrl+Enter)"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FF9F00] hover:bg-[#F09120] text-white font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Python 3</span>
              </button>
            )}

            {wasmDurationMs > 0 && (
              <div
                title="Last Execution Time"
                className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 text-[11px] font-mono text-[#F8D706]"
              >
                <FastForward className="w-3 h-3" />
                <span>{wasmDurationMs}ms</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. RIGHT CLUSTER: Examples, Search, Why?, Modes & Shortcuts */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Example Programs Selector */}
        <ExampleSelector />

        {/* "Why?" Deep Architectural Insight Button */}
        <button
          onClick={() => setIsWhyModalOpen(true)}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#F8D706] hover:bg-[#F5D000] text-[#212121] text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
          title="Explain current computer architecture event"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#212121] fill-[#212121]" />
          <span className="hidden sm:inline">Why?</span>
        </button>

        {/* Signature Flipkart Search Bar (Command Palette Trigger) */}
        <div
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 bg-white hover:bg-slate-50 text-[#212121] rounded-lg px-2.5 sm:px-3 py-1.5 cursor-pointer shadow-xs border border-white/30 transition-all group shrink-0"
          title="Open Command Palette (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-[#2874F0] group-hover:scale-110 transition-transform" />
          <span className="text-[11px] text-[#757575] hidden xl:inline">Search features...</span>
          <kbd className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-[#F1F3F6] text-[#616161] rounded border border-[#D6D8DB]">
            Ctrl+K
          </kbd>
        </div>

        {/* Mobile Search Icon Button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="md:hidden p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors shrink-0"
          title="Command Palette (Ctrl+K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Educational Mode Switcher (Large Screens) */}
        <div className="hidden 2xl:flex items-center bg-black/20 border border-white/20 rounded-lg p-0.5 text-xs font-medium shrink-0">
          {(['developer', 'beginner', 'gate'] as EducationalMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setEducationalMode(mode)}
              className={`px-2 py-1 rounded transition-colors capitalize ${
                educationalMode === mode
                  ? 'bg-white text-[#2874F0] font-bold shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {mode === 'developer' ? 'Dev' : mode}
            </button>
          ))}
        </div>

        {/* Keyboard Shortcuts Quick Reference Button */}
        <div className="relative shrink-0" ref={shortcutsMenuRef}>
          <button
            onClick={() => setIsShortcutsOpen(!isShortcutsOpen)}
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
            title="Keyboard Shortcuts Cheat Sheet"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {isShortcutsOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-64 bg-white text-[#212121] rounded-xl shadow-2xl border border-[#E0E0E0] p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                <span className="text-xs font-bold text-[#2874F0] flex items-center gap-1.5">
                  <Keyboard className="w-3.5 h-3.5" />
                  Keyboard Shortcuts
                </span>
                <button
                  onClick={() => setIsShortcutsOpen(false)}
                  className="text-[#878787] hover:text-[#212121] p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col gap-2 mt-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#616161]">Run / Pause Simulation</span>
                  <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#F1F3F6] border border-[#D6D8DB] rounded">
                    Space
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#616161]">Step Forward</span>
                  <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#F1F3F6] border border-[#D6D8DB] rounded">
                    →
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#616161]">Step Backward</span>
                  <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#F1F3F6] border border-[#D6D8DB] rounded">
                    ←
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#616161]">Reset Execution</span>
                  <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#F1F3F6] border border-[#D6D8DB] rounded">
                    R
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#616161]">Command Palette &amp; Search</span>
                  <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#F1F3F6] border border-[#D6D8DB] rounded">
                    Ctrl+K
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#616161]">Execute CPython 3 (Wasm)</span>
                  <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#F1F3F6] border border-[#D6D8DB] rounded">
                    Ctrl+Enter
                  </kbd>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
      {/* END DESKTOP NAVBAR */}

      {/* MOBILE NAVBAR (< md) */}
      <div className="flex md:hidden items-center justify-between w-full h-full">
        {/* Brand */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-white/15 border border-white/30 flex items-center justify-center shadow-inner">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-black tracking-tight text-white flex items-center gap-0.5">
              <span>CODE</span>
              <span className="text-[#F8D706]">→</span>
              <span>COMPUTER</span>
            </span>
            <span className="px-1 py-0.2 text-[8px] font-black uppercase rounded bg-[#F8D706] text-[#212121]">
              PLUS
            </span>
          </div>
        </div>

        {/* Mobile Right Controls: Run / Step / Why / Menu */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Run/Pause Hero Button */}
          {isRunning ? (
            <button
              onClick={pause}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F8D706] text-[#212121] font-bold text-xs shadow-sm active:scale-95 transition-transform"
            >
              <Pause className="w-3 h-3 fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={isCpython ? runWasm : run}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FF9F00] hover:bg-[#F09120] text-white font-bold text-xs shadow-sm active:scale-95 transition-transform"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run</span>
            </button>
          )}

          {/* Quick Step Forward */}
          {!isCpython && (
            <button
              onClick={stepForward}
              disabled={currentStepIndex >= totalSteps - 1 || isRunning}
              className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white disabled:opacity-30 transition-colors"
              title="Step Forward"
            >
              <StepForward className="w-3.5 h-3.5" />
            </button>
          )}

          {/* "Why?" Button */}
          <button
            onClick={() => setIsWhyModalOpen(true)}
            className="p-1.5 rounded-lg bg-[#F8D706] text-[#212121] font-bold shadow-xs active:scale-95 transition-transform"
            title="Explain Event"
          >
            <Sparkles className="w-3.5 h-3.5 fill-[#212121]" />
          </button>

          {/* Hamburger Drawer Menu Button */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Tools & Settings"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MOBILE SLIDE-OVER DRAWER */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-[85vw] max-w-sm h-full bg-white text-[#212121] shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-right duration-200">
            <div>
              {/* Drawer Header */}
              <div className="bg-[#2874F0] text-white p-3.5 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black tracking-tight flex items-center gap-1">
                      <span>CODE → COMPUTER</span>
                      <span className="text-[#F8D706] text-[9px] font-bold">PLUS ✦</span>
                    </h3>
                    <p className="text-[10px] text-white/80">Settings &amp; Tools</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-3.5 space-y-4">
                {/* 1. Execution Engine */}
                <div>
                  <label className="text-[10px] font-bold text-[#666666] uppercase tracking-wider block mb-1.5">
                    Execution Engine
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setExecutionEngineMode('silicon');
                        setIsMobileDrawerOpen(false);
                      }}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        !isCpython
                          ? 'bg-[#E8F0FE] border-[#2874F0] text-[#2874F0] shadow-xs font-bold'
                          : 'bg-[#F8FAFC] border-[#E0E0E0] text-[#666666]'
                      }`}
                    >
                      <Zap className="w-4 h-4 text-[#FF9F00]" />
                      <span>Silicon Sim</span>
                      <span className="text-[9px] text-[#878787] font-normal">Hardware cycle</span>
                    </button>

                    <button
                      onClick={() => {
                        setExecutionEngineMode('cpython');
                        setIsMobileDrawerOpen(false);
                      }}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isCpython
                          ? 'bg-[#FFFBEB] border-[#F8D706] text-[#212121] shadow-xs font-bold'
                          : 'bg-[#F8FAFC] border-[#E0E0E0] text-[#666666]'
                      }`}
                    >
                      <Terminal className="w-4 h-4 text-[#2874F0]" />
                      <span>Python 3 Wasm</span>
                      <span className="text-[9px] text-[#878787] font-normal">Full CPython 3.12</span>
                    </button>
                  </div>
                </div>

                {/* 2. Example Programs */}
                <div>
                  <label className="text-[10px] font-bold text-[#666666] uppercase tracking-wider block mb-1.5">
                    Select Example Program
                  </label>
                  <div className="w-full">
                    <ExampleSelector />
                  </div>
                </div>

                {/* 3. Simulation Speed */}
                {!isCpython && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-bold text-[#666666] uppercase tracking-wider">
                        Clock Speed
                      </label>
                      <span className="text-xs font-mono font-bold text-[#2874F0]">{speed}x</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 mb-2">
                      {[0.5, 1.0, 1.5, 2.0].map((s) => (
                        <button
                          key={s}
                          onClick={() => setSpeed(s)}
                          className={`py-1 rounded-md text-xs font-mono font-bold border transition-all ${
                            speed === s
                              ? 'bg-[#2874F0] text-white border-[#2874F0]'
                              : 'bg-[#F1F3F6] border-[#E0E0E0] text-[#212121]'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>

                    <input
                      type="range"
                      min="0.25"
                      max="3.0"
                      step="0.25"
                      value={speed}
                      onChange={(e) => setSpeed(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#E0E0E0] rounded-lg appearance-none cursor-pointer accent-[#2874F0]"
                    />
                  </div>
                )}

                {/* 4. Command Palette & Search */}
                <div>
                  <label className="text-[10px] font-bold text-[#666666] uppercase tracking-wider block mb-1.5">
                    Command Palette &amp; Search
                  </label>
                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      setIsCommandPaletteOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E0E0E0] text-xs text-[#666666] hover:bg-[#F1F3F6] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-[#2874F0]" />
                      <span>Search features...</span>
                    </div>
                    <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white border border-[#D6D8DB] rounded">
                      Ctrl+K
                    </kbd>
                  </button>
                </div>

                {/* 5. Educational Mode */}
                <div>
                  <label className="text-[10px] font-bold text-[#666666] uppercase tracking-wider block mb-1.5">
                    Educational Perspective
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['developer', 'beginner', 'gate'] as EducationalMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setEducationalMode(mode)}
                        className={`py-1.5 rounded-lg text-xs font-bold capitalize border transition-all ${
                          educationalMode === mode
                            ? 'bg-[#2874F0] text-white border-[#2874F0] shadow-xs'
                            : 'bg-[#F1F3F6] border-[#E0E0E0] text-[#666666]'
                        }`}
                      >
                        {mode === 'developer' ? 'Dev' : mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Reset Simulation */}
                <div>
                  <button
                    onClick={() => {
                      reset();
                      setIsMobileDrawerOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs font-bold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Simulation to Beginning</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-3 bg-[#F8FAFC] border-t border-[#E0E0E0] text-[10px] text-[#878787] flex items-center justify-between">
              <span>Code → Computer v2.0</span>
              <span className="text-[#2874F0] font-bold">Flipkart Edition</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

