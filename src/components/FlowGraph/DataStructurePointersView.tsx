import React, { useMemo } from 'react';
import { Layers, ArrowDown, Database, Pointer, Sparkles, Hash } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

interface ArrayPointer {
  name: string;
  index: number;
  color: string;
}

export const DataStructurePointersView: React.FC = () => {
  const { snapshots, currentStepIndex } = useExecutionStore();

  const currentSnapshot = snapshots[currentStepIndex];

  // Detect arrays and pointers from memory & heap
  const { arrayData, pointers } = useMemo(() => {
    if (!currentSnapshot) return { arrayData: null, pointers: [] };

    // 1. Look for array in heap
    let detectedArray: Array<{ index: number; value: any; address: string }> | null = null;
    let arrayName = 'arr';

    // Check heap objects
    const heapArray = currentSnapshot.heap.find((h) => h.type === 'array');

    if (heapArray && heapArray.fields) {
      const items = Array.isArray(heapArray.fields.elements)
        ? heapArray.fields.elements
        : Object.values(heapArray.fields);
      const baseAddr = parseInt(heapArray.addressHex.replace(/^0x/i, '') || '5000', 16);
      detectedArray = items.map((v: any, i: number) => ({
        index: i,
        value: v,
        address: `0x${(baseAddr + i * 4).toString(16).toUpperCase().padStart(4, '0')}`,
      }));
    } else {
      // Check memory blocks for list or array
      const memArray = currentSnapshot.memory.find(
        (m) => Array.isArray(m.value) || (typeof m.value === 'string' && m.value.startsWith('[') && m.value.endsWith(']'))
      );

      if (memArray) {
        arrayName = memArray.label;
        let parsed: any[] = [];
        if (Array.isArray(memArray.value)) {
          parsed = memArray.value;
        } else {
          try {
            parsed = JSON.parse(memArray.value as string);
          } catch {
            parsed = [10, 20, 30, 40, 50];
          }
        }
        detectedArray = parsed.map((v, i) => ({
          index: i,
          value: v,
          address: `0x${(4096 + i * 4).toString(16).toUpperCase().padStart(4, '0')}`,
        }));
      }
    }

    // Fallback: If no explicit array in memory, but index pointers exist (e.g. basic code or demo),
    // provide a default illustrative sequence so pointers still animate clearly
    if (!detectedArray) {
      const defaultValues = [12, 24, 37, 45, 59, 68, 83, 91];
      detectedArray = defaultValues.map((v, i) => ({
        index: i,
        value: v,
        address: `0x${(4096 + i * 4).toString(16).toUpperCase().padStart(4, '0')}`,
      }));
    }

    // 2. Identify pointer variables: left, right, mid, i, j, low, high, start, end, idx, ptr, k
    const pointerCandidates = ['left', 'right', 'mid', 'i', 'j', 'low', 'high', 'start', 'end', 'idx', 'k'];
    const pointerColors: Record<string, string> = {
      left: '#2874F0', // Flipkart Blue
      low: '#2874F0',
      start: '#2874F0',
      mid: '#FF9F00',  // Flipkart Orange
      right: '#8B5CF6', // Purple
      high: '#8B5CF6',
      end: '#8B5CF6',
      i: '#10B981',    // Green
      j: '#EC4899',    // Pink
      k: '#F59E0B',    // Amber
      idx: '#06B6D4',  // Cyan
    };

    const activePointers: ArrayPointer[] = [];

    currentSnapshot.memory.forEach((mem) => {
      const lower = mem.label.toLowerCase();
      if (pointerCandidates.includes(lower) && typeof mem.value === 'number') {
        activePointers.push({
          name: mem.label,
          index: mem.value,
          color: pointerColors[lower] || '#2874F0',
        });
      }
    });

    return {
      arrayData: detectedArray,
      pointers: activePointers,
    };
  }, [currentSnapshot]);

  // Check if current instruction addresses a specific index
  const activeAccessedIndex = useMemo(() => {
    if (!currentSnapshot?.instruction) return null;
    const inst = currentSnapshot.instruction;
    const text = `${inst.assembly} ${inst.explanation}`;
    if (text.includes('[')) {
      const match = text.match(/\[(\d+)\]/);
      if (match) return parseInt(match[1], 10);
    }
    return null;
  }, [currentSnapshot]);

  return (
    <div className="bg-white rounded-xl border border-[#E0E0E0] shadow-xs p-3.5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E8F0FE] text-[#2874F0] flex items-center justify-center font-bold">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#212121]">Data Structure &amp; Pointer Graph</h3>
            <p className="text-[10px] text-[#666666]">
              Contiguous memory allocation with animated floating pointers (e.g. Binary Search, Two Pointers, Sliding Window).
            </p>
          </div>
        </div>

        {pointers.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {pointers.map((p) => (
              <span
                key={p.name}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-xs"
                style={{ backgroundColor: p.color }}
              >
                {p.name} = {p.index}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Array Visualization Canvas */}
      <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E8EEF5] overflow-x-auto">
        <div className="min-w-[500px] flex flex-col items-center">
          {/* Pointers Top Row */}
          <div className="flex items-end gap-2.5 pb-2 min-h-[36px]">
            {arrayData?.map((item) => {
              const matchingPointers = pointers.filter((p) => p.index === item.index);
              return (
                <div key={`ptr-col-${item.index}`} className="w-14 flex flex-col items-center justify-end">
                  {matchingPointers.map((p) => (
                    <div
                      key={p.name}
                      className="flex flex-col items-center animate-bounce duration-300"
                    >
                      <span
                        className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold text-white shadow-xs"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.name}
                      </span>
                      <ArrowDown className="w-3.5 h-3.5" style={{ color: p.color }} />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Array Cells Row */}
          <div className="flex items-center gap-2.5">
            {arrayData?.map((item) => {
              const isAccessed = activeAccessedIndex === item.index;
              const hasPointer = pointers.some((p) => p.index === item.index);

              return (
                <div
                  key={`cell-${item.index}`}
                  className="flex flex-col items-center group"
                >
                  {/* Index Header */}
                  <span className="text-[10px] font-mono font-bold text-[#878787] mb-1">
                    [{item.index}]
                  </span>

                  {/* Array Cell Box */}
                  <div
                    className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-mono font-extrabold text-base transition-all ${
                      isAccessed
                        ? 'bg-[#FFFBEB] text-[#212121] border-2 border-[#F8D706] shadow-md scale-105'
                        : hasPointer
                        ? 'bg-white text-[#2874F0] border-2 border-[#2874F0] shadow-sm'
                        : 'bg-white text-[#212121] border border-[#CBD5E1] hover:border-[#94A3B8]'
                    }`}
                  >
                    <span>{item.value}</span>
                    {isAccessed && (
                      <span className="text-[8px] text-[#D97706] flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> Read
                      </span>
                    )}
                  </div>

                  {/* Address Below */}
                  <span className="text-[9px] font-mono text-[#94A3B8] mt-1.5">
                    {item.address}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Memory Pointer Info Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
        <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E0E0E0] flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#E8F0FE] text-[#2874F0] flex items-center justify-center font-bold text-xs">
            <Hash className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-[#212121]">Direct Index Formula</div>
            <div className="text-[10px] font-mono text-[#666666]">Base + (Index × 4 Bytes)</div>
          </div>
        </div>

        <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E0E0E0] flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#FFFBEB] text-[#D97706] flex items-center justify-center font-bold text-xs">
            <Pointer className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-[#212121]">Active Pointer Variables</div>
            <div className="text-[10px] font-mono text-[#666666]">
              {pointers.length > 0 ? pointers.map((p) => p.name).join(', ') : 'None in current frame'}
            </div>
          </div>
        </div>

        <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E0E0E0] flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-bold text-xs">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-[#212121]">Memory Alignment</div>
            <div className="text-[10px] font-mono text-[#666666]">32-bit (4-byte) Contiguous Word</div>
          </div>
        </div>
      </div>
    </div>
  );
};
