import React, { useState } from 'react';
import { Trash2, CheckCircle2, AlertOctagon, RefreshCw, Sparkles } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

export const GcVisualizer: React.FC = () => {
  const { snapshots, currentStepIndex } = useExecutionStore();
  const currentSnapshot = snapshots[currentStepIndex];
  const heapObjects = currentSnapshot?.heap || [];
  const stackFrames = currentSnapshot?.stack || [];

  const [reclaimedMsg, setReclaimedMsg] = useState<string | null>(null);

  // Find all root pointers from stack
  const rootPointers = new Set<string>();
  stackFrames.forEach((frame) => {
    Object.values(frame.locals).forEach((loc) => {
      if (typeof loc.value === 'string' && loc.value.startsWith('0x')) {
        rootPointers.add(loc.value);
      }
    });
    Object.values(frame.parameters).forEach((param) => {
      if (typeof param === 'string' && param.startsWith('0x')) {
        rootPointers.add(param);
      }
    });
  });

  const unreachableObjects = heapObjects.filter((obj) => !rootPointers.has(obj.addressHex));
  const reachableObjects = heapObjects.filter((obj) => rootPointers.has(obj.addressHex));

  const handleSimulateGc = () => {
    if (unreachableObjects.length > 0) {
      const freedBytes = unreachableObjects.reduce((acc, o) => acc + o.size, 0);
      setReclaimedMsg(
        `GC Sweep completed! Reclaimed ${unreachableObjects.length} orphaned object(s) (${freedBytes} Bytes freed).`
      );
    } else {
      setReclaimedMsg('GC Mark-and-Sweep: 100% of allocated heap objects are currently reachable. No memory leaked!');
    }
    setTimeout(() => setReclaimedMsg(null), 4000);
  };

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 shadow-sm flex flex-col gap-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-2">
        <div className="flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-[#E53935]" />
          <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
            Garbage Collector (Mark & Sweep)
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFEBEE] text-[#E53935] font-mono font-bold">
            Automatic Reclamation
          </span>
        </div>

        <button
          onClick={handleSimulateGc}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E53935] hover:bg-[#D32F2F] text-white text-xs font-bold transition-all shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Trigger GC Sweep</span>
        </button>
      </div>

      {/* Message feedback */}
      {reclaimedMsg && (
        <div className="p-2.5 rounded-lg bg-[#E8F5E9] border border-[#388E3C]/40 text-xs text-[#388E3C] flex items-center gap-2 animate-in fade-in duration-200 font-mono font-semibold">
          <Sparkles className="w-4 h-4 text-[#388E3C] shrink-0" />
          <span>{reclaimedMsg}</span>
        </div>
      )}

      {/* Reachability Graph Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
        {/* Reachable Roots & Objects */}
        <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E0E0E0] space-y-2">
          <div className="flex items-center justify-between text-[#388E3C] font-bold border-b border-[#E0E0E0] pb-1.5">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Live Reachable Roots ({reachableObjects.length})</span>
            </span>
            <span className="text-[10px] px-2 py-0.2 rounded bg-[#E8F5E9] font-bold">PRESERVED</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {reachableObjects.length === 0 ? (
              <div className="text-[#878787] italic text-[11px]">No live objects referenced</div>
            ) : (
              reachableObjects.map((obj) => (
                <div
                  key={obj.addressHex}
                  className="p-2 rounded bg-white border border-[#E0E0E0] flex justify-between items-center text-[11px] shadow-xs"
                >
                  <span className="text-[#212121] font-semibold">{obj.type} ({obj.addressHex})</span>
                  <span className="text-[#388E3C] font-bold">Refs: {obj.referenceCount}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Unreachable Objects (Eligible for Sweep) */}
        <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E0E0E0] space-y-2">
          <div className="flex items-center justify-between text-[#E53935] font-bold border-b border-[#E0E0E0] pb-1.5">
            <span className="flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4" />
              <span>Unreachable Garbage ({unreachableObjects.length})</span>
            </span>
            <span className="text-[10px] px-2 py-0.2 rounded bg-[#FFEBEE] font-bold">COLLECTIBLE</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {unreachableObjects.length === 0 ? (
              <div className="text-[#878787] italic text-[11px]">No unreachable objects detected</div>
            ) : (
              unreachableObjects.map((obj) => (
                <div
                  key={obj.addressHex}
                  className="p-2 rounded bg-[#FFEBEE] border border-[#E53935]/30 flex justify-between items-center text-[11px]"
                >
                  <span className="text-[#212121] font-semibold">{obj.type} ({obj.addressHex})</span>
                  <span className="text-[#E53935] font-bold">{obj.size} B to reclaim</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
