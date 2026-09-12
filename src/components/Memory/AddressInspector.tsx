import React from 'react';
import { X, Hash, Binary, Info } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

export const AddressInspector: React.FC = () => {
  const { selectedAddress, setSelectedAddress, snapshots, currentStepIndex } = useExecutionStore();
  const currentSnapshot = snapshots[currentStepIndex];

  if (!selectedAddress) return null;

  const block = currentSnapshot?.memory?.find((m) => m.addressHex === selectedAddress);
  const heapObj = currentSnapshot?.heap?.find((o) => o.addressHex === selectedAddress);

  const label = block?.label || heapObj?.type || 'Memory Location';
  const val = block ? block.value : heapObj ? JSON.stringify(heapObj.fields) : 'Unknown';
  const hexVal = block?.hexRepresentation || selectedAddress;
  const binVal = block?.binaryRepresentation || '0000 0000 0000 0000 0000 0000 0000 0000';
  const size = block?.size || heapObj?.size || 4;
  const segment = block?.segment || (heapObj ? 'HEAP' : 'DATA');
  const type = block?.type || heapObj?.type || '32-bit Integer';

  const hexClean = hexVal.replace('0x', '').padStart(8, '0');
  const bytes = [
    hexClean.slice(6, 8),
    hexClean.slice(4, 6),
    hexClean.slice(2, 4),
    hexClean.slice(0, 2),
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
      <div className="w-full max-w-lg bg-white border border-[#E0E0E0] rounded-2xl shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="px-4 py-3 bg-[#2874F0] text-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Hash className="w-4 h-4 text-white" />
            <h3 className="font-bold text-white">Memory Address Inspector</h3>
            <span className="px-2 py-0.2 rounded bg-white text-[#2874F0] text-[10px] font-bold">
              {selectedAddress}
            </span>
          </div>
          <button
            onClick={() => setSelectedAddress(null)}
            className="p-1 rounded text-white/80 hover:text-white hover:bg-white/15 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* Main overview grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-[#FAFAFA] border border-[#E0E0E0]">
              <span className="text-[10px] text-[#878787] block mb-0.5">Variable Symbol / Label</span>
              <span className="text-[#2874F0] font-bold text-sm">{label}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#FAFAFA] border border-[#E0E0E0]">
              <span className="text-[10px] text-[#878787] block mb-0.5">Memory Segment</span>
              <span className="text-[#F09120] font-bold text-sm">{segment} SEGMENT</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#FAFAFA] border border-[#E0E0E0]">
              <span className="text-[10px] text-[#878787] block mb-0.5">Stored Value</span>
              <span className="text-[#388E3C] font-bold text-base">{String(val)}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#FAFAFA] border border-[#E0E0E0]">
              <span className="text-[10px] text-[#878787] block mb-0.5">Data Type & Width</span>
              <span className="text-[#212121] font-bold">{type} ({size} Bytes)</span>
            </div>
          </div>

          {/* Hexadecimal representation */}
          <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E0E0E0] space-y-1">
            <div className="flex justify-between text-[#666666]">
              <span>Hexadecimal (Base 16):</span>
              <span className="text-[#2874F0] font-bold">{hexVal}</span>
            </div>
          </div>

          {/* 32-Bit Binary Bitfield */}
          <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E0E0E0] space-y-1.5">
            <div className="flex items-center justify-between text-[#666666]">
              <span className="flex items-center gap-1.5">
                <Binary className="w-3.5 h-3.5 text-[#2874F0]" />
                <span>32-Bit Binary Layout (Nibbles):</span>
              </span>
              <span className="text-[10px] text-[#878787]">MSB → LSB</span>
            </div>
            <div className="p-2.5 rounded bg-[#E8F0FE] text-[#2874F0] font-bold text-xs tracking-wider break-all text-center border border-[#2874F0]/30">
              {binVal}
            </div>
          </div>

          {/* Little-Endian Byte Order */}
          <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E0E0E0] space-y-1.5">
            <div className="flex justify-between text-[#666666]">
              <span>Little-Endian Byte Order:</span>
              <span className="text-[10px] text-[#878787]">LSB first</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {bytes.map((byte, i) => (
                <div key={i} className="p-2 rounded bg-white border border-[#E0E0E0] shadow-xs">
                  <span className="text-[10px] text-[#878787] block">Byte +{i}</span>
                  <span className="font-bold text-[#F09120]">0x{byte}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Note */}
          <div className="p-2.5 rounded-lg bg-[#E8F0FE] border border-[#2874F0]/30 text-[11px] text-[#212121] flex items-start gap-2 font-sans">
            <Info className="w-4 h-4 text-[#2874F0] shrink-0 mt-0.5" />
            <span>
              Modern x86-64 processors store multi-byte numbers in <strong>Little-Endian</strong> format:
              the least significant byte is stored at the lowest memory address.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#F7F7F7] border-t border-[#E0E0E0] flex justify-end">
          <button
            onClick={() => setSelectedAddress(null)}
            className="px-4 py-1.5 rounded-lg bg-[#2874F0] hover:bg-[#1F6FE5] text-white text-xs font-bold transition-colors shadow-xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
