import React, { useState } from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

type DsKind = 'array' | 'linkedlist' | 'stack' | 'queue' | 'bst';

interface DsPreset {
  id: DsKind;
  name: string;
  category: string;
  description: string;
  highLevelDiagram: React.ReactNode;
  memoryEntries: Array<{ address: string; label: string; value: string | number; nextPtr?: string }>;
}

export const DsMemoryBridge: React.FC = () => {
  const [activeKind, setActiveKind] = useState<DsKind>('array');
  const { setSelectedAddress } = useExecutionStore();

  const presets: Record<DsKind, DsPreset> = {
    array: {
      id: 'array',
      name: 'Contiguous Array',
      category: 'Linear Sequential',
      description: 'Elements stored in consecutive adjacent memory addresses. Direct O(1) random access via formula: Base + Index * Size.',
      highLevelDiagram: (
        <div className="flex items-center gap-2 p-3 overflow-x-auto justify-center">
          {[10, 20, 30, 40].map((v, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[10px] text-[#878787] font-mono">[{i}]</span>
              <div className="w-14 h-14 rounded-lg bg-[#E8F0FE] border border-[#2874F0]/40 flex items-center justify-center text-[#2874F0] font-bold font-mono text-base shadow-xs">
                {v}
              </div>
            </div>
          ))}
        </div>
      ),
      memoryEntries: [
        { address: '0x00001000', label: 'arr[0]', value: 10 },
        { address: '0x00001004', label: 'arr[1]', value: 20 },
        { address: '0x00001008', label: 'arr[2]', value: 30 },
        { address: '0x0000100C', label: 'arr[3]', value: 40 },
      ],
    },
    linkedlist: {
      id: 'linkedlist',
      name: 'Singly Linked List',
      category: 'Pointer-Linked',
      description: 'Nodes scattered dynamically anywhere across the Heap. Each node stores data payload + 8-byte pointer to next node address.',
      highLevelDiagram: (
        <div className="flex items-center gap-2 p-3 overflow-x-auto justify-center font-mono">
          {[
            { val: 10, addr: '0x5000', next: '0x5040' },
            { val: 20, addr: '0x5040', next: '0x5080' },
            { val: 30, addr: '0x5080', next: 'NULL' },
          ].map((node, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-[#878787]">{node.addr}</span>
                <div className="flex rounded-lg overflow-hidden border border-[#2874F0]/40 bg-[#E8F0FE]">
                  <div className="px-3 py-2 text-[#2874F0] font-bold">{node.val}</div>
                  <div className="px-2 py-2 bg-[#2874F0] text-[10px] text-white font-bold flex items-center">
                    next
                  </div>
                </div>
              </div>
              {i < 2 && <ArrowRight className="w-4 h-4 text-[#2874F0] shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      ),
      memoryEntries: [
        { address: '0x00005000', label: 'Node#1 (Head)', value: 10, nextPtr: '0x00005040' },
        { address: '0x00005040', label: 'Node#2', value: 20, nextPtr: '0x00005080' },
        { address: '0x00005080', label: 'Node#3 (Tail)', value: 30, nextPtr: '0x00000000 (NULL)' },
      ],
    },
    stack: {
      id: 'stack',
      name: 'Stack (LIFO)',
      category: 'Push / Pop',
      description: 'Last-In First-Out container. Controlled via Stack Pointer (RSP) register decrements/increments.',
      highLevelDiagram: (
        <div className="flex flex-col-reverse items-center gap-1.5 p-3 justify-center font-mono">
          {[
            { val: 30, top: true },
            { val: 20, top: false },
            { val: 10, top: false },
          ].map((item, i) => (
            <div
              key={i}
              className={`w-36 py-2 rounded-lg border text-center font-bold text-sm ${
                item.top
                  ? 'bg-[#FFF8E1] border-[#F09120] text-[#F09120] ring-2 ring-[#F09120]/30'
                  : 'bg-[#FAFAFA] border-[#E0E0E0] text-[#212121]'
              }`}
            >
              {item.val} {item.top && '← TOP (RSP)'}
            </div>
          ))}
        </div>
      ),
      memoryEntries: [
        { address: '0x7FFFFFF0', label: 'Stack Base', value: 10 },
        { address: '0x7FFFFFEC', label: 'Frame Data', value: 20 },
        { address: '0x7FFFFFE8', label: 'Top (RSP)', value: 30 },
      ],
    },
    queue: {
      id: 'queue',
      name: 'Queue (FIFO)',
      category: 'Enqueue / Dequeue',
      description: 'First-In First-Out buffer with Front and Rear pointers.',
      highLevelDiagram: (
        <div className="flex items-center gap-2 p-3 overflow-x-auto justify-center font-mono">
          <span className="text-[10px] text-[#2874F0] font-bold">Front ←</span>
          {[100, 200, 300].map((v, i) => (
            <div key={i} className="w-14 h-12 rounded-lg bg-[#E8F5E9] border border-[#388E3C]/40 flex items-center justify-center text-[#388E3C] font-bold">
              {v}
            </div>
          ))}
          <span className="text-[10px] text-[#2874F0] font-bold">← Rear</span>
        </div>
      ),
      memoryEntries: [
        { address: '0x00002000', label: 'Queue[Front]', value: 100 },
        { address: '0x00002004', label: 'Queue[+1]', value: 200 },
        { address: '0x00002008', label: 'Queue[Rear]', value: 300 },
      ],
    },
    bst: {
      id: 'bst',
      name: 'Binary Search Tree (BST)',
      category: 'Hierarchical',
      description: 'Root node references Left and Right child addresses. Left < Root < Right.',
      highLevelDiagram: (
        <div className="flex flex-col items-center gap-2 p-3 font-mono">
          <div className="w-12 h-12 rounded-full bg-[#E8F0FE] border border-[#2874F0] flex items-center justify-center text-[#2874F0] font-bold text-sm shadow-xs">
            50
          </div>
          <div className="flex items-center gap-8">
            <div className="w-10 h-10 rounded-full bg-[#FAFAFA] border border-[#2874F0]/40 flex items-center justify-center text-[#2874F0] text-xs font-bold">
              30
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FAFAFA] border border-[#2874F0]/40 flex items-center justify-center text-[#2874F0] text-xs font-bold">
              70
            </div>
          </div>
        </div>
      ),
      memoryEntries: [
        { address: '0x00006000', label: 'Root (50)', value: '50 | L:0x6030, R:0x6060' },
        { address: '0x00006030', label: 'Left Node (30)', value: '30 | L:NULL, R:NULL' },
        { address: '0x00006060', label: 'Right Node (70)', value: '70 | L:NULL, R:NULL' },
      ],
    },
  };

  const currentPreset = presets[activeKind];

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 shadow-sm flex flex-col gap-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E0E0E0] pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#2874F0]" />
          <div>
            <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
              Data Structures: High-Level Model ↔ Low-Level Memory
            </h2>
            <span className="text-[10px] text-[#666666] font-mono">
              Compare abstract representations against actual byte offsets in silicon RAM
            </span>
          </div>
        </div>

        {/* Data Structure Selector */}
        <div className="flex items-center bg-[#F1F3F6] border border-[#E0E0E0] rounded-lg p-0.5 text-xs font-mono">
          {(Object.keys(presets) as DsKind[]).map((k) => (
            <button
              key={k}
              onClick={() => setActiveKind(k)}
              className={`px-3 py-1 rounded transition-colors ${
                activeKind === k
                  ? 'bg-[#2874F0] text-white font-bold shadow-xs'
                  : 'text-[#666666] hover:text-[#212121]'
              }`}
            >
              {presets[k].name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side: High Level Diagram vs Low-Level Memory Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: High-Level Abstract Representation */}
        <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E0E0E0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#2874F0] uppercase tracking-wider font-mono">
                1. High-Level Data Structure View
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[#666666] font-mono border border-[#E0E0E0]">
                {currentPreset.category}
              </span>
            </div>
            {currentPreset.highLevelDiagram}
          </div>
          <p className="text-[11px] text-[#666666] font-sans mt-3 border-t border-[#E0E0E0] pt-2">
            {currentPreset.description}
          </p>
        </div>

        {/* Right: Low-Level Physical / Virtual Memory Map */}
        <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E0E0E0]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#388E3C] uppercase tracking-wider font-mono">
              2. Physical Virtual Memory Map
            </span>
            <span className="text-[10px] text-[#878787] font-mono">Word Aligned</span>
          </div>

          <div className="divide-y divide-[#E0E0E0] font-mono text-xs border border-[#E0E0E0] rounded-lg overflow-hidden bg-white shadow-xs">
            {currentPreset.memoryEntries.map((entry, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedAddress(entry.address)}
                className="p-2.5 flex items-center justify-between hover:bg-[#E8F0FE] cursor-pointer transition-colors"
              >
                <div>
                  <span className="text-[#2874F0] font-bold block">{entry.address}</span>
                  <span className="text-[#212121] text-[11px] font-medium">{entry.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#388E3C] font-bold text-sm block">
                    {String(entry.value)}
                  </span>
                  {entry.nextPtr && (
                    <span className="text-[10px] text-[#F09120] font-bold">→ {entry.nextPtr}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
