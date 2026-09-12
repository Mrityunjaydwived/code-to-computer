import React from 'react';
import { Terminal } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

export const InstructionViewer: React.FC = () => {
  const { instructions, snapshots, currentStepIndex, status } = useExecutionStore();
  const currentSnapshot = snapshots[currentStepIndex];
  const activeInst = currentSnapshot?.instruction;

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 shadow-sm flex flex-col gap-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#2874F0]" />
          <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
            Intermediate Representation (IR) / Machine Bytecode
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8F0FE] text-[#2874F0] font-mono font-bold">
            {instructions.length} Instructions
          </span>
        </div>
        <span className="text-[11px] text-[#878787] hidden sm:inline">Linear Instruction Stream</span>
      </div>

      {/* Instruction List */}
      {instructions.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#878787] bg-[#FAFAFA] rounded-xl border border-[#E0E0E0]">
          No bytecode generated yet. Write code and press Run or Analyze.
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto divide-y divide-[#E0E0E0] border border-[#E0E0E0] rounded-xl bg-white text-xs shadow-inner">
          {instructions.map((inst) => {
            const isCurrent = activeInst && activeInst.index === inst.index && status !== 'idle';
            return (
              <div
                key={inst.index}
                className={`p-2.5 flex items-center justify-between transition-all ${
                  isCurrent
                    ? 'bg-[#E8F0FE] border-l-4 border-[#2874F0] font-bold text-[#2874F0]'
                    : 'hover:bg-[#F5F5F5] text-[#212121]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#878787] text-[11px] w-8">
                    #{inst.index.toString().padStart(2, '0')}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                      isCurrent
                        ? 'bg-[#2874F0] text-white'
                        : 'bg-[#F1F3F6] text-[#666666] border border-[#E0E0E0]'
                    }`}
                  >
                    {inst.opcode}
                  </span>
                  <span className="font-semibold text-[#212121]">{inst.assembly}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#666666] hidden md:inline font-sans">
                    {inst.explanation}
                  </span>
                  <span className="text-[10px] text-[#878787]">Ln {inst.line}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
