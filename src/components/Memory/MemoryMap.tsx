import React from 'react';
import { HardDrive, Eye } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

export const MemoryMap: React.FC = () => {
  const { snapshots, currentStepIndex, setSelectedAddress } = useExecutionStore();
  const currentSnapshot = snapshots[currentStepIndex];
  const memoryBlocks = currentSnapshot?.memory || [];

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 shadow-sm flex flex-col gap-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-2">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-[#2874F0]" />
          <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
            Virtual Memory Space (RAM)
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8F0FE] text-[#2874F0] font-mono font-bold">
            {memoryBlocks.length} Variables Allocated
          </span>
        </div>

        <span className="text-[11px] text-[#878787] font-mono">
          Base: 0x00001000 (32-bit Aligned)
        </span>
      </div>

      {/* Memory Table */}
      {memoryBlocks.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#878787] font-mono bg-[#FAFAFA] rounded-lg border border-[#E0E0E0]">
          Memory is empty. Run code or step forward to allocate variables in RAM.
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#E0E0E0] rounded-xl bg-white shadow-xs">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#F1F3F6] text-[#666666] border-b border-[#E0E0E0] text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Address</th>
                <th className="py-2.5 px-3">Variable</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Value</th>
                <th className="py-2.5 px-3">Hex</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {memoryBlocks.map((block) => (
                <tr
                  key={block.addressHex}
                  onClick={() => setSelectedAddress(block.addressHex)}
                  className="hover:bg-[#E8F0FE] cursor-pointer transition-colors group"
                >
                  <td className="py-2.5 px-3 text-[#2874F0] font-bold">{block.addressHex}</td>
                  <td className="py-2.5 px-3 text-[#212121] font-bold">{block.label}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#F1F3F6] text-[#666666] font-semibold border border-[#E0E0E0]">
                      {block.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#878787]">{block.size}B</td>
                  <td className="py-2.5 px-3 text-[#388E3C] font-bold text-sm">{String(block.value)}</td>
                  <td className="py-2.5 px-3 text-[#666666]">{block.hexRepresentation}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAddress(block.addressHex);
                      }}
                      className="p-1 rounded hover:bg-[#2874F0]/15 text-[#878787] group-hover:text-[#2874F0] transition-colors"
                      title="Inspect Memory Address"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
