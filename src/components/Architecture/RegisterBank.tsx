import React, { useState } from 'react';
import { Database } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';
import { RegisterBank as IRegisterBank } from '../../engine/types';

export const RegisterBank: React.FC = () => {
  const { snapshots, currentStepIndex, status } = useExecutionStore();
  const currentSnapshot = snapshots[currentStepIndex];
  const prevSnapshot = currentStepIndex > 0 ? snapshots[currentStepIndex - 1] : null;

  const [viewFormat, setViewFormat] = useState<'dec' | 'hex' | 'bin'>('dec');

  const registers: IRegisterBank = currentSnapshot?.cpu?.registers || {
    RAX: 0,
    RBX: 0,
    RCX: 0,
    RDX: 0,
    RSI: 0,
    RDI: 0,
    R8: 0,
    R9: 0,
    RSP: '0x7FFFFFF0',
    RBP: '0x7FFFFFF0',
    RIP: '0x00400000',
    FLAGS: { ZF: false, SF: false, OF: false },
  };

  const prevRegisters = prevSnapshot?.cpu?.registers;

  const formatValue = (val: any) => {
    if (typeof val === 'number') {
      if (viewFormat === 'hex') return '0x' + (val >>> 0).toString(16).toUpperCase().padStart(8, '0');
      if (viewFormat === 'bin') {
        const bin = (val >>> 0).toString(2).padStart(16, '0');
        return bin.match(/.{1,4}/g)?.join(' ') || bin;
      }
      return val.toString();
    }
    return String(val);
  };

  const generalRegs: Array<{ name: keyof IRegisterBank; role: string; desc: string }> = [
    { name: 'RAX', role: 'Accumulator', desc: 'Arithmetic operand & function return value' },
    { name: 'RBX', role: 'Base / Aux', desc: 'Base register / secondary operand storage' },
    { name: 'RCX', role: 'Counter', desc: 'Loop iteration counter & shift operand' },
    { name: 'RDX', role: 'Data', desc: 'I/O data & arithmetic overflow/multiplier' },
    { name: 'RSI', role: 'Source Idx', desc: '2nd function argument / memory string source' },
    { name: 'RDI', role: 'Dest Idx', desc: '1st function argument / memory string dest' },
    { name: 'R8', role: 'Arg 5 / GP', desc: '5th function argument / general purpose' },
    { name: 'R9', role: 'Arg 6 / GP', desc: '6th function argument / general purpose' },
  ];

  const pointerRegs: Array<{ name: keyof IRegisterBank; role: string; desc: string }> = [
    { name: 'RSP', role: 'Stack Pointer', desc: 'Points to top of active Call Stack' },
    { name: 'RBP', role: 'Base Pointer', desc: 'Anchors base of current stack frame' },
    { name: 'RIP', role: 'Instruction Ptr', desc: 'Points to current instruction in text segment' },
  ];

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl p-3 shadow-sm flex flex-col gap-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#2874F0]" />
          <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
            CPU Register Bank
          </h2>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E8F0FE] text-[#2874F0] border border-[#2874F0]/30 font-mono font-bold">
            x86-64 Architecture
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-[#F1F3F6] border border-[#E0E0E0] rounded-lg p-0.5 text-[11px] font-mono">
          <button
            onClick={() => setViewFormat('dec')}
            className={`px-2 py-0.5 rounded transition-colors ${
              viewFormat === 'dec' ? 'bg-[#2874F0] text-white font-bold shadow-xs' : 'text-[#666666] hover:text-[#212121]'
            }`}
          >
            DEC
          </button>
          <button
            onClick={() => setViewFormat('hex')}
            className={`px-2 py-0.5 rounded transition-colors ${
              viewFormat === 'hex' ? 'bg-[#2874F0] text-white font-bold shadow-xs' : 'text-[#666666] hover:text-[#212121]'
            }`}
          >
            HEX
          </button>
          <button
            onClick={() => setViewFormat('bin')}
            className={`px-2 py-0.5 rounded transition-colors ${
              viewFormat === 'bin' ? 'bg-[#2874F0] text-white font-bold shadow-xs' : 'text-[#666666] hover:text-[#212121]'
            }`}
          >
            BIN
          </button>
        </div>
      </div>

      {/* General Purpose Registers Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {generalRegs.map((reg) => {
          const currentVal = registers[reg.name];
          const prevVal = prevRegisters ? prevRegisters[reg.name] : currentVal;
          const hasChanged = prevVal !== undefined && prevVal !== currentVal && status !== 'idle';

          return (
            <div
              key={reg.name}
              title={reg.desc}
              className={`p-2.5 rounded-lg border transition-all duration-200 relative overflow-hidden ${
                hasChanged
                  ? 'bg-[#FFF8E1] border-[#F09120] shadow-xs'
                  : 'bg-[#FAFAFA] border-[#E0E0E0] hover:border-[#2874F0]'
              }`}
            >
              {hasChanged && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F09120] animate-ping" />
              )}
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-mono text-xs font-bold text-[#2874F0]">{reg.name}</span>
                <span className="text-[10px] text-[#878787]">{reg.role}</span>
              </div>

              <div className="font-mono text-sm font-bold text-[#212121] truncate">
                {formatValue(currentVal)}
              </div>

              {hasChanged && (
                <div className="text-[10px] font-mono text-[#F09120] font-semibold mt-0.5 flex items-center gap-1">
                  <span>{formatValue(prevVal)}</span>
                  <span>→</span>
                  <span className="font-bold">{formatValue(currentVal)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pointer & Control Registers */}
      <div className="grid grid-cols-3 gap-2">
        {pointerRegs.map((reg) => {
          const val = registers[reg.name];
          const prevVal = prevRegisters ? prevRegisters[reg.name] : val;
          const hasChanged = prevVal !== undefined && prevVal !== val && status !== 'idle';

          return (
            <div
              key={reg.name}
              title={reg.desc}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                hasChanged
                  ? 'bg-[#E8F0FE] border-[#2874F0]'
                  : 'bg-[#FAFAFA] border-[#E0E0E0]'
              }`}
            >
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="font-mono text-[11px] font-bold text-[#2874F0]">{reg.name}</span>
                <span className="text-[9px] text-[#878787]">{reg.role}</span>
              </div>
              <div className="font-mono text-xs font-semibold text-[#212121] truncate">
                {String(val)}
              </div>
            </div>
          );
        })}
      </div>

      {/* ALU Condition Flags */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#F7F7F7] border border-[#E0E0E0] text-xs">
        <span className="text-[11px] font-bold text-[#666666]">FLAGS:</span>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-1">
            <span className="text-[#878787]">ZF:</span>
            <span
              className={`px-1.5 py-0.2 rounded font-bold ${
                registers.FLAGS.ZF
                  ? 'bg-[#E8F5E9] text-[#388E3C] border border-[#388E3C]/30'
                  : 'bg-[#E0E0E0] text-[#878787]'
              }`}
            >
              {registers.FLAGS.ZF ? '1' : '0'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[#878787]">SF:</span>
            <span
              className={`px-1.5 py-0.2 rounded font-bold ${
                registers.FLAGS.SF
                  ? 'bg-[#FFF8E1] text-[#F09120] border border-[#F09120]/30'
                  : 'bg-[#E0E0E0] text-[#878787]'
              }`}
            >
              {registers.FLAGS.SF ? '1' : '0'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[#878787]">OF:</span>
            <span
              className={`px-1.5 py-0.2 rounded font-bold ${
                registers.FLAGS.OF
                  ? 'bg-[#FFEBEE] text-[#E53935] border border-[#E53935]/30'
                  : 'bg-[#E0E0E0] text-[#878787]'
              }`}
            >
              {registers.FLAGS.OF ? '1' : '0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
