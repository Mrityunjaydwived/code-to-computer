import React from 'react';
import { Clock, Play, StepForward, StepBack, SkipForward } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

export const ExecutionTimeline: React.FC = () => {
  const { snapshots, currentStepIndex, jumpToStep, status } = useExecutionStore();

  if (snapshots.length === 0) return null;

  const totalSteps = snapshots.length;

  return (
    <div className="bg-white border-t border-[#E0E0E0] px-4 py-2.5 flex flex-col gap-1.5 font-mono select-none shadow-sm">
      {/* Timeline Controls & Label */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#2874F0]" />
          <span className="font-bold text-[#212121] uppercase text-[11px] tracking-wider">
            Execution Timeline (Time-Travel)
          </span>
          <span className="text-[10px] px-2 py-0.2 rounded bg-[#E8F0FE] text-[#2874F0] border border-[#B3D4FC] font-bold">
            Step {currentStepIndex} / {totalSteps - 1}
          </span>
        </div>

        <div className="text-[11px] text-[#666666] flex items-center gap-2">
          <span className="text-[#878787]">Active Instruction:</span>
          <span className="text-[#2874F0] font-bold">
            {snapshots[currentStepIndex]?.instruction?.assembly || 'Program Init'}
          </span>
        </div>
      </div>

      {/* Scrubber Range Slider */}
      <div className="relative flex items-center">
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentStepIndex}
          onChange={(e) => jumpToStep(parseInt(e.target.value))}
          className="w-full h-2 bg-[#E0E0E0] rounded-lg appearance-none cursor-pointer accent-[#2874F0] hover:accent-[#1F74BA] transition-all"
        />
      </div>

      {/* Step Event Mini-Pills */}
      <div className="flex items-center gap-1 overflow-x-auto py-1">
        {snapshots.slice(0, 30).map((snap, idx) => {
          const isCurrent = idx === currentStepIndex;
          const opcode = snap.instruction?.opcode || 'INIT';

          return (
            <button
              key={idx}
              onClick={() => jumpToStep(idx)}
              className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition-all ${
                isCurrent
                  ? 'bg-[#2874F0] text-white font-bold shadow-xs scale-105'
                  : 'bg-[#F1F3F6] text-[#666666] hover:text-[#212121] hover:bg-[#E8F0FE] border border-[#E0E0E0]'
              }`}
              title={`Step ${idx}: ${snap.instruction?.assembly || 'Init'}`}
            >
              #{idx} {opcode}
            </button>
          );
        })}
        {totalSteps > 30 && (
          <span className="text-[10px] text-[#878787] px-2">+{totalSteps - 30} more</span>
        )}
      </div>
    </div>
  );
};
