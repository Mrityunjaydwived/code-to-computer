import React from 'react';
import { Layers, ArrowDown, Box } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';
import { StackFrame } from '../../engine/types';

export const StackVisualizer: React.FC = () => {
  const { snapshots, currentStepIndex, setSelectedAddress } = useExecutionStore();
  const currentSnapshot = snapshots[currentStepIndex];
  const frames: StackFrame[] = currentSnapshot?.stack || [];

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 shadow-sm flex flex-col gap-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#2874F0]" />
          <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
            Call Stack (LIFO Frames)
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8F0FE] text-[#2874F0] font-mono font-bold">
            Depth: {frames.length} Frame(s)
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#878787] font-mono">
          <span>Grows Downward</span>
          <ArrowDown className="w-3 h-3 text-[#2874F0]" />
        </div>
      </div>

      {/* Stack Frames List */}
      <div className="space-y-3 font-mono">
        {frames.map((frame, idx) => {
          const isTopFrame = idx === frames.length - 1;
          const locals = Object.entries(frame.locals);
          const params = Object.entries(frame.parameters);

          return (
            <div
              key={frame.id}
              className={`rounded-xl border overflow-hidden transition-all duration-200 ${
                isTopFrame
                  ? 'bg-[#E8F0FE] border-[#2874F0] shadow-xs'
                  : 'bg-[#FAFAFA] border-[#E0E0E0]'
              }`}
            >
              {/* Frame Header */}
              <div className="px-3 py-2 bg-white border-b border-[#E0E0E0] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Box className="w-3.5 h-3.5 text-[#2874F0]" />
                  <span className="font-bold text-[#212121]">{frame.functionName}</span>
                  {isTopFrame && (
                    <span className="text-[9px] px-2 py-0.2 rounded bg-[#2874F0] text-white font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-[#878787]">
                  <span>RBP: {frame.framePointer}</span>
                  <span>•</span>
                  <span>RSP: {frame.stackPointer}</span>
                </div>
              </div>

              {/* Frame Contents: Parameters & Locals */}
              <div className="p-3 text-xs space-y-2.5">
                {/* Parameters */}
                {params.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#878787] uppercase tracking-wider font-semibold">
                      Arguments & Parameters:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {params.map(([k, v]) => (
                        <div
                          key={k}
                          className="p-2 rounded bg-white border border-[#E0E0E0] flex justify-between items-center shadow-xs"
                        >
                          <span className="text-[#666666]">{k}:</span>
                          <span className="text-[#2874F0] font-bold">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Locals */}
                {locals.length > 0 ? (
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#878787] uppercase tracking-wider font-semibold">
                      Local Variables:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {locals.map(([k, loc]) => (
                        <div
                          key={k}
                          onClick={() => setSelectedAddress(loc.addressHex)}
                          className="p-2 rounded bg-white border border-[#E0E0E0] flex items-center justify-between hover:border-[#2874F0] cursor-pointer transition-colors shadow-xs"
                        >
                          <div>
                            <span className="text-[#212121] font-bold">{k}</span>
                            <span className="text-[10px] text-[#878787] block">{loc.addressHex}</span>
                          </div>
                          <span className="text-[#388E3C] font-bold text-sm">
                            {String(loc.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-[#878787] italic">No local variables allocated yet</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
