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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <>
      <header className="h-14 sm:h-16 bg-gradient-to-r from-[#2874F0] via-[#1E6DE3] to-[#1F74BA] text-white px-2.5 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-3 z-30 sticky top-0 border-b border-[#185AC2] shadow-[0_2px_12px_rgba(0,0,0,0.14)] select-none">
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

      {/* 2. CENTER CLUSTER: Execution Deck & Step Telemetry (Desktop/Tablet) */}
      <div className="hidden md:flex items-center gap-1.5 sm:gap-2 shrink-0">
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

      {/* 3. RIGHT CLUSTER: Examples, Search, Why?, Modes & Shortcuts (Desktop/Tablet) */}
      <div className="hidden md:flex items-center gap-1.5 sm:gap-2 shrink-0">
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

      {/* 4. MOBILE-ONLY CONTROL CLUSTER (screens < 768px) */}
      <div className="md:hidden flex items-center gap-1.5 shrink-0">
        {!isCpython ? (
          <div className="flex items-center gap-1 bg-black/20 backdrop-blur-xs border border-white/20 rounded-xl p-1 shadow-xs">
            {/* Run / Pause Hero Button */}
            {isRunning ? (
              <button
                onClick={pause}
                title="Pause Execution"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F8D706] active:bg-[#F5D000] text-[#212121] font-bold text-xs shadow-xs min-h-[36px]"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs">Pause</span>
              </button>
            ) : (
              <button
                onClick={run}
                title="Run Simulation"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FF9F00] active:bg-[#F09120] text-white font-bold text-xs shadow-xs min-h-[36px]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs">Run</span>
              </button>
            )}

            {/* Step Forward */}
            <button
              onClick={stepForward}
              disabled={currentStepIndex >= totalSteps - 1 || isRunning}
              title="Step Forward"
              className="p-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/15 disabled:opacity-35 min-w-[36px] min-h-[36px] flex items-center justify-center transition-all"
            >
              <StepForward className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-black/20 backdrop-blur-xs border border-white/20 rounded-xl p-1 shadow-xs">
            {isWasmRunning ? (
              <button
                disabled
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF9F00] text-white font-bold text-xs opacity-90 min-h-[36px]"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Running...</span>
              </button>
            ) : (
              <button
                onClick={runWasm}
                title="Execute code with WebAssembly CPython 3"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF9F00] active:bg-[#F09120] text-white font-bold text-xs shadow-xs min-h-[36px]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run</span>
              </button>
            )}
          </div>
        )}

        {/* Hamburger / Drawer Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          className={`p-2 rounded-xl border transition-all min-w-[38px] min-h-[38px] flex items-center justify-center ${
            isMobileMenuOpen
              ? 'bg-[#F8D706] text-[#212121] border-[#F8D706] shadow-sm'
              : 'bg-white/15 text-white border-white/25 hover:bg-white/25'
          }`}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
    </header>

    {/* MOBILE SLIDE-DOWN DRAWER */}
    {isMobileMenuOpen && (
      <div className="md:hidden fixed inset-x-0 top-14 sm:top-16 bottom-0 z-40 bg-black/50 backdrop-blur-xs flex flex-col justify-start">
        <div className="bg-white text-[#212121] max-h-[85dvh] overflow-y-auto border-b border-[#E0E0E0] shadow-2xl p-4 flex flex-col gap-3.5 animate-in slide-in-from-top-2 duration-200">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#2874F0] flex items-center gap-1.5">
              <Sliders className="w-4 h-4" />
              Control Deck &amp; Settings
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 rounded-lg text-[#878787] hover:text-[#212121] hover:bg-[#F1F3F6]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. Silicon Step Scrubber & Jumper (if Silicon mode) */}
          {!isCpython && (
            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-[#64748B]">Simulation Step:</span>
                <span className="text-[#2874F0] font-bold">
                  {currentStepDisplay} / {totalSteps} ({stepPercentage}%)
                </span>
              </div>

              {/* Mini Step Track */}
              <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2874F0] transition-all duration-150"
                  style={{ width: `${stepPercentage}%` }}
                />
              </div>

              {/* Step Jumper Buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => {
                    stepBackward();
                  }}
                  disabled={currentStepIndex <= 0 || isRunning}
                  className="flex items-center justify-center gap-1 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs font-semibold text-[#334155] disabled:opacity-40 min-h-[40px]"
                >
                  <StepBack className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  onClick={() => {
                    jumpToStep(0);
                  }}
                  disabled={totalSteps === 0}
                  className="py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs font-semibold text-[#334155] min-h-[40px]"
                >
                  Start
                </button>

                <button
                  onClick={() => {
                    jumpToStep(Math.floor(totalSteps / 2));
                  }}
                  disabled={totalSteps === 0}
                  className="py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs font-semibold text-[#334155] min-h-[40px]"
                >
                  Mid
                </button>

                <button
                  onClick={() => {
                    jumpToStep(totalSteps - 1);
                  }}
                  disabled={totalSteps === 0}
                  className="py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs font-semibold text-[#334155] min-h-[40px]"
                >
                  End
                </button>
              </div>

              {/* Clock Speed Selection */}
              <div className="pt-2 border-t border-[#E2E8F0]">
                <div className="flex items-center justify-between text-xs font-bold text-[#64748B] mb-1.5">
                  <span>Clock Speed:</span>
                  <span className="text-[#2874F0] font-mono">{speed}x</span>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {speedOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSpeed(opt)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all min-h-[36px] ${
                        speed === opt
                          ? 'bg-[#2874F0] text-white shadow-xs'
                          : 'bg-white border border-[#CBD5E1] text-[#334155] hover:bg-[#E8F0FE]'
                      }`}
                    >
                      {opt}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  reset();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-[#CBD5E1] hover:bg-[#FEE2E2] hover:text-[#DC2626] text-xs font-bold transition-colors min-h-[42px]"
              >
                <RotateCcw className="w-4 h-4 text-[#DC2626]" />
                <span>Reset Simulation</span>
              </button>
            </div>
          )}

          {/* 2. Example Programs Dropdown */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#64748B] block">Load Code Example:</span>
            <ExampleSelector fullWidth />
          </div>

          {/* 3. "Why Did The Computer Do That?" Deep Insight Button */}
          <button
            onClick={() => {
              setIsWhyModalOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#F8D706] to-[#F5D000] text-[#212121] text-xs font-extrabold shadow-sm min-h-[44px]"
          >
            <Sparkles className="w-4 h-4 fill-current text-[#212121]" />
            <span>Why Did The Computer Do That? (Insight)</span>
          </button>

          {/* 4. Search & Command Palette Trigger */}
          <button
            onClick={() => {
              setIsCommandPaletteOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-semibold text-[#334155] min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#2874F0]" />
              <span>Search features &amp; commands</span>
            </div>
            <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white border border-[#CBD5E1] rounded">
              Ctrl+K
            </kbd>
          </button>

          {/* 5. Educational Mode Switcher */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-[#64748B] block">Educational Mode:</span>
            <div className="grid grid-cols-3 gap-1.5">
              {(['developer', 'beginner', 'gate'] as EducationalMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setEducationalMode(mode);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold capitalize transition-all min-h-[40px] ${
                    educationalMode === mode
                      ? 'bg-[#2874F0] text-white shadow-xs'
                      : 'bg-[#F8FAFC] border border-[#CBD5E1] text-[#64748B]'
                  }`}
                >
                  {mode === 'developer' ? 'Technical CS' : mode === 'beginner' ? 'Beginner' : 'GATE Exam'}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Keyboard Shortcuts Reference Button */}
          <button
            onClick={() => {
              setIsShortcutsOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#F1F3F6] text-[#475569] text-xs font-semibold min-h-[40px]"
          >
            <Keyboard className="w-4 h-4 text-[#2874F0]" />
            <span>View Keyboard Shortcuts</span>
          </button>
        </div>

        {/* Backdrop click to dismiss */}
        <div
          className="flex-1"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      </div>
    )}
    </>
  );
};

