import React from 'react';
import { Database, Link2, AlertTriangle, CheckCircle2, Box } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';
import { HeapObject } from '../../engine/types';

export const HeapVisualizer: React.FC = () => {
  const { snapshots, currentStepIndex, setSelectedAddress } = useExecutionStore();
  const currentSnapshot = snapshots[currentStepIndex];
  const heapObjects: HeapObject[] = currentSnapshot?.heap || [];

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 shadow-sm flex flex-col gap-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#F09120]" />
          <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
            Dynamic Heap Memory Space
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFF8E1] text-[#F09120] font-mono font-bold">
            {heapObjects.length} Heap Object(s)
          </span>
        </div>
        <span className="text-[11px] text-[#878787] font-mono">
          Base: 0x00005000 (Dynamic Allocs)
        </span>
      </div>

      {/* Heap Objects Grid */}
      {heapObjects.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#878787] font-mono bg-[#FAFAFA] rounded-lg border border-[#E0E0E0]">
          No dynamic heap objects allocated yet. Run code creating lists or classes (`[10, 20]` or `Node()`).
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
          {heapObjects.map((obj) => {
            const fields = Object.entries(obj.fields);
            return (
              <div
                key={obj.addressHex}
                onClick={() => setSelectedAddress(obj.addressHex)}
                className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer hover:border-[#2874F0] shadow-xs ${
                  obj.isReachable
                    ? 'bg-white border-[#E0E0E0]'
                    : 'bg-[#FFEBEE] border-[#E53935]/40'
                }`}
              >
                {/* Object Top Bar */}
                <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-2 mb-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Box className="w-4 h-4 text-[#F09120]" />
                    <span className="font-bold text-[#212121]">{obj.type}</span>
                    <span className="text-[10px] text-[#878787]">({obj.size} Bytes)</span>
                  </div>
                  <span className="text-[#2874F0] font-bold">{obj.addressHex}</span>
                </div>

                {/* Fields / Elements */}
                <div className="space-y-1.5 text-xs">
                  {fields.length === 0 ? (
                    <div className="text-[#878787] italic text-[11px]">Empty object structure</div>
                  ) : (
                    fields.map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between p-2 rounded bg-[#F7F7F7] border border-[#E0E0E0] text-[11px]"
                      >
                        <span className="text-[#666666] font-medium">[{k}]:</span>
                        <span className="text-[#2874F0] font-bold">{String(v)}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer: Reachability & Reference Count */}
                <div className="mt-2.5 pt-2 border-t border-[#E0E0E0] flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1 text-[#666666]">
                    <Link2 className="w-3 h-3 text-[#2874F0]" />
                    <span>Refs: {obj.referenceCount}</span>
                  </div>

                  {obj.isReachable ? (
                    <span className="flex items-center gap-1 text-[#388E3C] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Reachable (Live)</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[#E53935] font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Unreachable (Garbage)</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
