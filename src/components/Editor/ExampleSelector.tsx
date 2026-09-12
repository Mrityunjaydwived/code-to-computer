import React from 'react';
import { BookOpen } from 'lucide-react';
import { CODE_EXAMPLES } from '../../data/examples';
import { useExecutionStore } from '../../store/executionStore';

interface ExampleSelectorProps {
  fullWidth?: boolean;
}

export const ExampleSelector: React.FC<ExampleSelectorProps> = ({ fullWidth = false }) => {
  const { loadExample, selectedExampleId } = useExecutionStore();

  return (
    <div className={fullWidth ? "relative w-full" : "relative shrink-0"}>
      <div className={`flex items-center gap-1.5 ${fullWidth ? 'px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] w-full' : 'px-2 sm:px-2.5 py-1.5 rounded-lg bg-white shadow-xs border border-white/40 hover:border-white'} text-[#212121] text-xs transition-all`}>
        <BookOpen className="w-3.5 h-3.5 text-[#2874F0] shrink-0" />
        <select
          aria-label="Select Code Example"
          value={selectedExampleId || ''}
          onChange={(e) => {
            if (e.target.value && e.target.value !== 'custom') {
              loadExample(e.target.value);
            }
          }}
          className={`bg-transparent text-xs text-[#212121] font-semibold focus:outline-none cursor-pointer pr-1 truncate ${fullWidth ? 'w-full max-w-none' : 'max-w-[110px] sm:max-w-[150px] md:max-w-[180px] lg:max-w-[210px]'}`}
        >
          <option value="" disabled className="text-[#878787]">
            Examples...
          </option>
          {selectedExampleId === 'custom' && (
            <option value="custom" className="text-[#2874F0] font-semibold">
              ⚡ Custom User Code
            </option>
          )}
          <optgroup label="Beginner" className="text-[#2874F0] font-semibold">
            {CODE_EXAMPLES.filter((e) => e.category === 'Beginner').map((ex) => (
              <option key={ex.id} value={ex.id} className="text-[#212121] font-normal">
                {ex.title}
              </option>
            ))}
          </optgroup>
          <optgroup label="Intermediate" className="text-[#F09120] font-semibold">
            {CODE_EXAMPLES.filter((e) => e.category === 'Intermediate').map((ex) => (
              <option key={ex.id} value={ex.id} className="text-[#212121] font-normal">
                {ex.title}
              </option>
            ))}
          </optgroup>
          <optgroup label="Advanced" className="text-[#388E3C] font-semibold">
            {CODE_EXAMPLES.filter((e) => e.category === 'Advanced').map((ex) => (
              <option key={ex.id} value={ex.id} className="text-[#212121] font-normal">
                {ex.title}
              </option>
            ))}
          </optgroup>
        </select>
      </div>
    </div>
  );
};

