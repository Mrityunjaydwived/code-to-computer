import React from 'react';
import { Play, Sparkles, Cpu, Layers, HardDrive, Compass, ArrowRight, X } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

interface LandingHeroProps {
  onDismiss: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onDismiss }) => {
  const { run, loadExample } = useExecutionStore();

  const handleStart = () => {
    onDismiss();
    run();
  };

  const handleDemo = () => {
    loadExample('arithmetic');
    onDismiss();
    run();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 md:p-8 flex flex-col items-center justify-center font-sans animate-in fade-in duration-200">
      {/* Modal Card */}
      <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 sm:p-8 md:p-10 shadow-2xl relative max-w-4xl w-full text-center space-y-4 sm:space-y-8 my-auto">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-3 sm:top-5 right-3 sm:right-5 p-1.5 sm:p-2 rounded-xl bg-[#F1F3F6] border border-[#E0E0E0] text-[#666666] hover:text-[#212121] hover:bg-[#E0E0E0] transition-colors"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0FE] border border-[#B3D4FC] text-[#2874F0] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#2874F0]" />
          <span>Interactive Computer Science Visualization Platform</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#212121]">
            CODE → COMPUTER
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-[#666666] font-medium max-w-2xl mx-auto leading-relaxed">
            Write Code. See What The Computer <span className="text-[#2874F0] font-semibold underline decoration-[#2874F0]/40">Actually Does</span>.
          </p>
          <p className="text-xs sm:text-sm text-[#878787] max-w-xl mx-auto">
            Experience the complete journey from Python source code, lexical tokens, and AST down to CPU instruction cycles, register shifts, L1/L2 caches, virtual memory, and call stack frames.
          </p>
        </div>

        {/* Animated Journey Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs max-w-3xl mx-auto">
          {[
            { label: 'SOURCE CODE', sub: 'Python 3' },
            { label: 'TOKENS & AST', sub: 'Compiler' },
            { label: 'CPU & REGISTERS', sub: 'ALU & x86' },
            { label: 'CACHE & RAM', sub: 'Virtual Memory' },
            { label: 'PROGRAM OUTPUT', sub: 'STDOUT' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#F7F7F7] border border-[#E0E0E0] flex flex-col items-center justify-center gap-1 shadow-xs hover:border-[#2874F0] transition-colors"
            >
              <span className="text-[#2874F0] font-bold text-[11px]">{item.label}</span>
              <span className="text-[#878787] text-[10px]">{item.sub}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2874F0] hover:bg-[#1F74BA] text-white font-bold text-sm shadow-md shadow-[#2874F0]/25 transition-all scale-100 hover:scale-105"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Visualizing</span>
          </button>

          <button
            onClick={handleDemo}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF9F00] hover:bg-[#F09120] text-white font-bold text-sm shadow-md shadow-[#FF9F00]/25 transition-all"
          >
            <span>Explore Demo</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Subsystem Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left">
          <div className="p-4 rounded-xl bg-[#F1F3F6] border border-[#E0E0E0] space-y-1">
            <div className="flex items-center gap-2 text-[#2874F0] font-bold text-xs font-mono">
              <Cpu className="w-4 h-4" />
              <span>Real Hardware Simulation</span>
            </div>
            <p className="text-[11px] text-[#666666] leading-relaxed">
              Real registers (RAX, RBX, RSP, RBP, RIP), ALU add/sub, condition flags, and 5-stage CPU cycle stages.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F1F3F6] border border-[#E0E0E0] space-y-1">
            <div className="flex items-center gap-2 text-[#1F74BA] font-bold text-xs font-mono">
              <Layers className="w-4 h-4" />
              <span>Memory & Cache Hierarchy</span>
            </div>
            <p className="text-[11px] text-[#666666] leading-relaxed">
              Virtual addresses, L1/L2/L3 cache hit/miss ratio, call stack frames, and dynamic heap objects.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F1F3F6] border border-[#E0E0E0] space-y-1">
            <div className="flex items-center gap-2 text-[#388E3C] font-bold text-xs font-mono">
              <Compass className="w-4 h-4" />
              <span>Time-Travel Debugger</span>
            </div>
            <p className="text-[11px] text-[#666666] leading-relaxed">
              Step forward and backward with zero latency. Every computational event creates an immutable state snapshot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
