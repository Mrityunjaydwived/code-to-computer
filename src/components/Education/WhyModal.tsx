import React from 'react';
import { X, Sparkles, GraduationCap, Cpu, BookOpen } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

export const WhyModal: React.FC = () => {
  const { isWhyModalOpen, setIsWhyModalOpen, snapshots, currentStepIndex, educationalMode, setEducationalMode } = useExecutionStore();
  const currentSnapshot = snapshots[currentStepIndex];

  if (!isWhyModalOpen) return null;

  const explanation = currentSnapshot?.explanation;
  const currentInst = currentSnapshot?.instruction;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150 font-sans">
      <div className="w-full max-w-xl max-h-[90dvh] flex flex-col bg-white border border-[#E0E0E0] rounded-2xl shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="px-4 py-3 bg-[#2874F0] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#F8D706]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Why Did The Computer Do That?
              </h3>
              <span className="text-[10px] text-white/80 font-mono">
                Step #{currentSnapshot?.step || 0}: {currentInst?.assembly || 'Program Init'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsWhyModalOpen(false)}
            className="p-1 rounded text-white/80 hover:text-white hover:bg-white/15 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-4 pt-3 flex items-center gap-2 border-b border-[#E0E0E0] text-xs">
          <button
            onClick={() => setEducationalMode('beginner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg transition-colors ${
              educationalMode === 'beginner'
                ? 'bg-[#E8F0FE] text-[#2874F0] font-bold border-t border-x border-[#2874F0]/30'
                : 'text-[#666666] hover:text-[#212121]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#2874F0]" />
            <span>Beginner</span>
          </button>

          <button
            onClick={() => setEducationalMode('developer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg transition-colors ${
              educationalMode === 'developer'
                ? 'bg-[#E8F0FE] text-[#2874F0] font-bold border-t border-x border-[#2874F0]/30'
                : 'text-[#666666] hover:text-[#212121]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#2874F0]" />
            <span>Technical CS</span>
          </button>

          <button
            onClick={() => setEducationalMode('gate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg transition-colors ${
              educationalMode === 'gate'
                ? 'bg-[#E8F0FE] text-[#2874F0] font-bold border-t border-x border-[#2874F0]/30'
                : 'text-[#666666] hover:text-[#212121]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#2874F0]" />
            <span>GATE Mode</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Why Summary Card */}
          <div className="p-3.5 rounded-xl bg-[#FFF8E1] border border-[#F09120]/30 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#F09120] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#212121] block text-xs">Core Rationale:</span>
              <p className="text-[#666666] text-xs mt-0.5 leading-relaxed font-medium">
                {explanation?.whySummary || 'Instruction executed according to program control flow.'}
              </p>
            </div>
          </div>

          {/* Mode-specific in-depth explanation */}
          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E0E0E0] space-y-2">
            <span className="text-[11px] font-bold text-[#2874F0] uppercase tracking-wider font-mono">
              {educationalMode === 'beginner' && '👶 Plain English Metaphor'}
              {educationalMode === 'developer' && '💻 Computer Science & Architecture Explanation'}
              {educationalMode === 'gate' && '🎓 GATE Competitive Exam & RTL Notation'}
            </span>

            <p className="text-[#212121] text-xs leading-relaxed">
              {educationalMode === 'beginner' && (explanation?.beginner || 'Code line executed.')}
              {educationalMode === 'developer' && (explanation?.technical || 'Hardware operation dispatched.')}
              {educationalMode === 'gate' && (explanation?.gate || 'RTL operation processed.')}
            </p>
          </div>

          {/* Current Micro-Hardware Context */}
          {currentInst && (
            <div className="p-2.5 rounded-lg bg-[#F1F3F6] border border-[#E0E0E0] font-mono text-[11px] flex justify-between items-center">
              <span className="text-[#666666]">Instruction Register (IR):</span>
              <span className="text-[#2874F0] font-bold">{currentInst.assembly}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#F7F7F7] border-t border-[#E0E0E0] flex justify-end">
          <button
            onClick={() => setIsWhyModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-[#2874F0] hover:bg-[#1F6FE5] text-white text-xs font-bold transition-colors shadow-xs"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
