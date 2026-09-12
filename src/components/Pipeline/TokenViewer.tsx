import React, { useState } from 'react';
import { Tag } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';
import { Token } from '../../engine/types';

export const TokenViewer: React.FC = () => {
  const { tokens } = useExecutionStore();
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  const getCategoryColor = (category: Token['category']) => {
    switch (category) {
      case 'keyword':
        return 'bg-[#E8F0FE] text-[#2874F0] border-[#2874F0]/30 hover:bg-[#D2E3FC]';
      case 'identifier':
        return 'bg-[#FFF8E1] text-[#F09120] border-[#F09120]/30 hover:bg-[#FFE082]';
      case 'literal':
        return 'bg-[#E8F5E9] text-[#388E3C] border-[#388E3C]/30 hover:bg-[#C8E6C9]';
      case 'operator':
        return 'bg-[#FFEBEE] text-[#E53935] border-[#E53935]/30 hover:bg-[#FFCDD2]';
      case 'separator':
      default:
        return 'bg-[#F1F3F6] text-[#666666] border-[#E0E0E0] hover:bg-[#E0E0E0]';
    }
  };

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 shadow-sm flex flex-col gap-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-2">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#2874F0]" />
          <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
            Lexical Analysis: Token Stream
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8F0FE] text-[#2874F0] font-mono font-bold">
            {tokens.length} Token(s)
          </span>
        </div>
        <span className="text-[11px] text-[#878787] hidden sm:inline">Click any token to inspect</span>
      </div>

      {/* Interactive Token Stream Chips */}
      <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-[#FAFAFA] border border-[#E0E0E0] font-mono text-xs max-h-56 overflow-y-auto">
        {tokens.map((token, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedToken(token)}
            className={`px-2.5 py-1 rounded-md border text-xs font-mono font-semibold transition-all duration-150 ${getCategoryColor(
              token.category
            )} ${selectedToken === token ? 'ring-2 ring-[#2874F0] scale-105 shadow-xs' : ''}`}
          >
            <span>{token.value === '\\n' ? '↵' : token.value}</span>
            <span className="text-[9px] opacity-75 ml-1">({token.type.slice(0, 3)})</span>
          </button>
        ))}
      </div>

      {/* Selected Token Inspector */}
      {selectedToken && (
        <div className="p-3.5 rounded-xl bg-[#F7F7F7] border border-[#2874F0]/30 text-xs font-mono space-y-2 animate-in fade-in duration-150 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#2874F0] font-bold">
              Token: {selectedToken.value === '\\n' ? 'Newline (\\n)' : selectedToken.value}
            </span>
            <span className="text-[#878787] text-[11px]">
              Line {selectedToken.line}, Col {selectedToken.col}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-white border border-[#E0E0E0]">
              <span className="text-[#878787] block">Type:</span>
              <span className="text-[#212121] font-bold">{selectedToken.type}</span>
            </div>
            <div className="p-2 rounded bg-white border border-[#E0E0E0]">
              <span className="text-[#878787] block">Category:</span>
              <span className="text-[#2874F0] font-bold capitalize">{selectedToken.category}</span>
            </div>
          </div>
          <p className="text-[11px] text-[#666666] font-sans">{selectedToken.description}</p>
        </div>
      )}
    </div>
  );
};
