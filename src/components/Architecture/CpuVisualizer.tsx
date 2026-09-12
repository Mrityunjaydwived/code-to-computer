import React from 'react';
import { Cpu, Zap, ArrowRight, Cog } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';
import { CycleStage } from '../../engine/types';

export const CpuVisualizer: React.FC = () => {
  const { snapshots, currentStepIndex, status } = useExecutionStore();
  const currentSnapshot = snapshots[currentStepIndex];
  const cpuState = currentSnapshot?.cpu;

  const cycleStages: CycleStage[] = ['FETCH', 'DECODE', 'EXECUTE', 'MEMORY', 'WRITE_BACK'];
  const activeStage = cpuState?.activeCycleStage || 'FETCH';

  const alu = cpuState?.alu || { active: false };
  const currentInst = currentSnapshot?.instruction;

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 shadow-sm flex flex-col gap-4 font-sans">
      {/* Header & 5-Stage Instruction Cycle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E0E0E0] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#E8F0FE] flex items-center justify-center">
            <Cpu className="w-4 h-4 text-[#2874F0]" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
              Central Processing Unit (CPU)
            </h2>
            <span className="text-[10px] text-[#666666] font-mono">
              Harvard / Von Neumann Execution Core
            </span>
          </div>
        </div>

        {/* 5-Stage Instruction Cycle Badges */}
        <div className="flex items-center gap-1 bg-[#F1F3F6] p-1 rounded-lg border border-[#E0E0E0]">
          {cycleStages.map((stage, idx) => {
            const isActive = stage === activeStage && status !== 'idle';
            return (
              <React.Fragment key={stage}>
                <div
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                    isActive
                      ? 'bg-[#2874F0] text-white shadow-xs scale-105'
                      : 'text-[#666666] bg-white border border-[#E0E0E0]'
                  }`}
                >
                  {stage}
                </div>
                {idx < cycleStages.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-[#BDBDBD] shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Internal CPU Units: ALU and Control Unit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Arithmetic Logic Unit (ALU) */}
        <div
          className={`p-3 rounded-xl border transition-all duration-200 ${
            alu.active
              ? 'bg-[#E8F0FE] border-[#2874F0] shadow-sm'
              : 'bg-[#FAFAFA] border-[#E0E0E0]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Zap className={`w-4 h-4 ${alu.active ? 'text-[#2874F0] animate-pulse' : 'text-[#878787]'}`} />
              <span className="text-xs font-bold text-[#212121]">ALU (Arithmetic Logic Unit)</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                alu.active ? 'bg-[#2874F0] text-white' : 'bg-[#E0E0E0] text-[#666666]'
              }`}
            >
              {alu.active ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-[#E0E0E0] font-mono text-xs space-y-1.5 shadow-xs">
            <div className="flex justify-between text-[#666666]">
              <span>Operation:</span>
              <span className="text-[#2874F0] font-bold">{alu.operation || 'None'}</span>
            </div>

            <div className="flex justify-between text-[#666666]">
              <span>Operands:</span>
              <span className="text-[#212121] font-medium">
                {alu.operand1 !== undefined ? String(alu.operand1) : '—'} ,{' '}
                {alu.operand2 !== undefined ? String(alu.operand2) : '—'}
              </span>
            </div>

            <div className="flex justify-between text-[#666666] pt-1 border-t border-[#E0E0E0]">
              <span>ALU Output:</span>
              <span className="text-[#388E3C] font-bold text-sm">
                {alu.result !== undefined ? String(alu.result) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Control Unit */}
        <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E0E0E0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Cog className="w-4 h-4 text-[#F09120]" />
                <span className="text-xs font-bold text-[#212121]">Control Unit (CU)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFF8E1] text-[#F09120] border border-[#F09120]/30 font-mono font-bold">
                Decoded
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-[#E0E0E0] font-mono text-xs space-y-1.5 shadow-xs">
              <div className="flex justify-between text-[#666666]">
                <span>Instruction:</span>
                <span className="text-[#2874F0] font-bold">
                  {currentInst ? currentInst.assembly : 'NOP (No Operation)'}
                </span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Program Counter:</span>
                <span className="text-[#212121]">{cpuState?.registers?.RIP || '0x00400000'}</span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Control Signals:</span>
                <span className="text-[#878787] text-[10px] truncate max-w-[160px]">
                  {cpuState?.controlUnit?.signals?.join(', ') || 'CLK_PULSE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
