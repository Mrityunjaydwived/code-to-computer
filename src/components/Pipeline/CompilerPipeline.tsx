import React, { useState } from 'react';
import { ArrowRight, Tag, GitFork, Terminal, CheckCircle2 } from 'lucide-react';
import { TokenViewer } from './TokenViewer';
import { AstViewer } from './AstViewer';
import { InstructionViewer } from './InstructionViewer';
import { useExecutionStore } from '../../store/executionStore';

export const CompilerPipeline: React.FC = () => {
  const { tokens, ast, instructions, pipelineSubTab, setPipelineSubTab } = useExecutionStore();

  const stages = [
    { id: 'source', label: '1. Source Code', count: null },
    { id: 'tokens', label: '2. Lexer / Tokens', count: tokens.length },
    { id: 'ast', label: '3. Parser / AST', count: ast ? 1 : 0 },
    { id: 'ir', label: '4. IR Bytecode', count: instructions.length },
    { id: 'cpu', label: '5. CPU Execution', count: null },
  ];

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* High-Level Pipeline Progress Flow */}
      <div className="bg-white border border-[#E0E0E0] rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between gap-2 overflow-x-auto text-xs font-mono">
          {stages.map((st, i) => (
            <React.Fragment key={st.id}>
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                  (pipelineSubTab === st.id) || (st.id === 'source') || (st.id === 'cpu')
                    ? 'bg-[#E8F0FE] border-[#2874F0] text-[#2874F0] font-bold shadow-xs'
                    : 'bg-[#FAFAFA] border-[#E0E0E0] text-[#666666]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2874F0]" />
                <span className="whitespace-nowrap">{st.label}</span>
                {st.count !== null && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-[#2874F0] font-bold border border-[#E0E0E0]">
                    {st.count}
                  </span>
                )}
              </div>

              {i < stages.length - 1 && (
                <ArrowRight className="w-4 h-4 text-[#BDBDBD] shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E0E0E0] pb-2 text-xs font-mono">
        <button
          onClick={() => setPipelineSubTab('tokens')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors ${
            pipelineSubTab === 'tokens'
              ? 'bg-[#2874F0] text-white font-bold shadow-xs'
              : 'text-[#666666] hover:text-[#212121] bg-white border border-[#E0E0E0]'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Tokens ({tokens.length})</span>
        </button>

        <button
          onClick={() => setPipelineSubTab('ast')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors ${
            pipelineSubTab === 'ast'
              ? 'bg-[#2874F0] text-white font-bold shadow-xs'
              : 'text-[#666666] hover:text-[#212121] bg-white border border-[#E0E0E0]'
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>Abstract Syntax Tree (AST)</span>
        </button>

        <button
          onClick={() => setPipelineSubTab('ir')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors ${
            pipelineSubTab === 'ir'
              ? 'bg-[#2874F0] text-white font-bold shadow-xs'
              : 'text-[#666666] hover:text-[#212121] bg-white border border-[#E0E0E0]'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Bytecode ({instructions.length})</span>
        </button>
      </div>

      {/* Active Sub-Tab Content */}
      {pipelineSubTab === 'tokens' && <TokenViewer />}
      {pipelineSubTab === 'ast' && <AstViewer />}
      {pipelineSubTab === 'ir' && <InstructionViewer />}
    </div>
  );
};
