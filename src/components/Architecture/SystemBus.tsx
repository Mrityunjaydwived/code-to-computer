import React from 'react';
import { Cpu, Layers, HardDrive, Zap } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

export const SystemBus: React.FC = () => {
  const { snapshots, currentStepIndex } = useExecutionStore();
  const currentSnapshot = snapshots[currentStepIndex];
  const busActivity = currentSnapshot?.busActivity;

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl p-3.5 shadow-sm flex flex-col gap-2 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-[#F09120] shrink-0" />
          <span className="text-[11px] font-bold text-[#212121] uppercase tracking-wider font-mono">
            System Bus Interconnect (Data & Address Flow)
          </span>
        </div>
        {busActivity?.active && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFF8E1] text-[#F09120] border border-[#F09120]/30 animate-pulse shrink-0">
            Active: {busActivity.label}
          </span>
        )}
      </div>

      {/* Visual Interconnect Pipeline */}
      <div className="w-full overflow-x-auto touch-pan-x pb-1">
        <div className="min-w-[420px] md:min-w-0 grid grid-cols-5 gap-2 items-center text-center font-mono text-[11px]">
        {/* Unit 1: Registers / ALU */}
        <div
          className={`p-2.5 rounded-lg border transition-all ${
            busActivity?.from === 'REGISTERS' || busActivity?.to === 'REGISTERS' || busActivity?.from === 'ALU'
              ? 'bg-[#E8F0FE] border-[#2874F0] text-[#2874F0] font-bold shadow-xs'
              : 'bg-[#FAFAFA] border-[#E0E0E0] text-[#666666]'
          }`}
        >
          <Cpu className="w-4 h-4 mx-auto mb-1 text-[#2874F0]" />
          <span className="block font-bold">ALU / REGS</span>
          <span className="text-[9px] text-[#878787]">&lt; 0.5 ns</span>
        </div>

        {/* Bus Arrow 1 */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-full h-1.5 bg-[#E0E0E0] rounded relative overflow-hidden">
            {busActivity?.active && (
              <div className="absolute inset-0 bg-[#2874F0] animate-bus-flow" />
            )}
          </div>
          <span className="text-[9px] text-[#878787] mt-1 font-medium">CPU Bus</span>
        </div>

        {/* Unit 2: L1/L2 Cache */}
        <div
          className={`p-2.5 rounded-lg border transition-all ${
            busActivity?.from === 'CACHE' || busActivity?.to === 'CACHE'
              ? 'bg-[#E8F5E9] border-[#388E3C] text-[#388E3C] font-bold shadow-xs'
              : 'bg-[#FAFAFA] border-[#E0E0E0] text-[#666666]'
          }`}
        >
          <Layers className="w-4 h-4 mx-auto mb-1 text-[#388E3C]" />
          <span className="block font-bold">CACHE (L1-L3)</span>
          <span className="text-[9px] text-[#878787]">1-40 cycles</span>
        </div>

        {/* Bus Arrow 2 */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-full h-1.5 bg-[#E0E0E0] rounded relative overflow-hidden">
            {busActivity?.active && (
              <div className="absolute inset-0 bg-[#388E3C] animate-bus-flow" />
            )}
          </div>
          <span className="text-[9px] text-[#878787] mt-1 font-medium">Memory Bus</span>
        </div>

        {/* Unit 3: Main Memory / RAM */}
        <div
          className={`p-2.5 rounded-lg border transition-all ${
            busActivity?.to === 'RAM' || busActivity?.from === 'RAM' || busActivity?.to === 'HEAP'
              ? 'bg-[#FFF8E1] border-[#F09120] text-[#F09120] font-bold shadow-xs'
              : 'bg-[#FAFAFA] border-[#E0E0E0] text-[#666666]'
          }`}
        >
          <HardDrive className="w-4 h-4 mx-auto mb-1 text-[#F09120]" />
          <span className="block font-bold">RAM (Virtual)</span>
          <span className="text-[9px] text-[#878787]">100 cycles</span>
        </div>
      </div>
      </div>
    </div>
  );
};
