import React from 'react';
import { GraduationCap, Calculator, Sparkles, BookOpen, Lightbulb } from 'lucide-react';
import { GATE_PROBLEMS, GateProblem } from '../../data/gateProblems';
import { useExecutionStore } from '../../store/executionStore';

export const GateModeView: React.FC = () => {
  const {
    selectedGateProblemId,
    setSelectedGateProblemId,
    gateParamValues,
    setGateParamValues,
  } = useExecutionStore();

  const activeProblem =
    GATE_PROBLEMS.find((p) => p.id === selectedGateProblemId) || GATE_PROBLEMS[0];

  const handleSelectProblem = (id: string) => {
    setSelectedGateProblemId(id);
    const prob = GATE_PROBLEMS.find((p) => p.id === id) || GATE_PROBLEMS[0];
    const initial: Record<string, number> = {};
    prob.inputs.forEach((inp) => {
      initial[inp.key] = inp.defaultVal;
    });
    setGateParamValues(initial);
  };

  const handleInputChange = (key: string, val: number) => {
    setGateParamValues({ ...gateParamValues, [key]: val });
  };

  const solution = activeProblem.calculate(gateParamValues);

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 shadow-sm flex flex-col gap-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E0E0E0] pb-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[#2874F0]" />
          <div>
            <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
              GATE / CS Competitive Exam Mode
            </h2>
            <span className="text-[10px] text-[#666666] font-mono">
              Live Architecture Numerical Solver & Theoretical Derivations
            </span>
          </div>
        </div>

        {/* Problem Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto touch-pan-x max-w-full text-xs font-mono pb-1">
          {GATE_PROBLEMS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectProblem(p.id)}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                selectedGateProblemId === p.id
                  ? 'bg-[#2874F0] text-white font-bold shadow-xs'
                  : 'text-[#666666] hover:text-[#212121] hover:bg-[#F5F5F5]'
              }`}
            >
              {p.title.split('(')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Problem Definition Card */}
      <div className="p-4 rounded-xl bg-[#FFF8E1] border border-[#FFE082] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#F09120] uppercase tracking-wider font-mono">
            Topic: {activeProblem.topic}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[#F09120] border border-[#FFE082] font-semibold font-mono">
            Standard Exam Formulation
          </span>
        </div>
        <h3 className="text-sm font-bold text-[#212121]">{activeProblem.title}</h3>
        <p className="text-xs text-[#666666] leading-relaxed">{activeProblem.problemStatement}</p>
        <div className="p-2 rounded-lg bg-white border border-[#FFE082] font-mono text-xs text-[#212121]">
          Formula: <span className="font-bold text-[#2874F0]">{activeProblem.formula}</span>
        </div>
      </div>

      {/* Interactive Input Variables & Live Calculation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Input Variables Sliders & Fields */}
        <div className="p-4 rounded-xl bg-[#F7F7F7] border border-[#E0E0E0] space-y-3">
          <span className="text-xs font-bold text-[#212121] uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-[#2874F0]" />
            <span>Interactive Input Parameters</span>
          </span>

          <div className="space-y-3">
            {activeProblem.inputs.map((inp) => {
              const currentVal = gateParamValues[inp.key] ?? inp.defaultVal;
              return (
                <div key={inp.key} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#666666]">{inp.label}</span>
                    <span className="text-[#2874F0] font-bold">
                      {currentVal} {inp.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={inp.unit.includes('fraction') ? 0.05 : 1}
                    max={inp.unit.includes('fraction') ? 0.99 : inp.unit === 'ns' ? 200 : 2000}
                    step={inp.unit.includes('fraction') ? 0.01 : 1}
                    value={currentVal}
                    onChange={(e) => handleInputChange(inp.key, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#E0E0E0] rounded appearance-none cursor-pointer accent-[#2874F0]"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Step-by-Step Derivation & Final Answer */}
        <div className="p-4 rounded-xl bg-[#F7F7F7] border border-[#E0E0E0] flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#388E3C] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#388E3C]" />
              <span>Step-by-Step Numerical Derivation</span>
            </span>

            <div className="space-y-1.5 font-mono text-xs">
              {solution.steps.map((st, i) => (
                <div key={i} className="p-2 rounded bg-white border border-[#E0E0E0] text-[#212121] text-[11px]">
                  {st}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7] flex items-center justify-between">
            <span className="text-xs font-bold text-[#388E3C] font-mono">Computed Result:</span>
            <span className="text-lg font-bold text-[#388E3C] font-mono">
              {solution.result} {solution.unit}
            </span>
          </div>
        </div>
      </div>

      {/* Exam Tip Card */}
      <div className="p-3 rounded-xl bg-[#E8F0FE] border border-[#B3D4FC] text-xs text-[#1F74BA] flex items-start gap-2.5">
        <Lightbulb className="w-4 h-4 text-[#2874F0] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#2874F0] block">GATE Key Insight & Trap:</span>
          <p className="mt-0.5 text-[#212121]">{activeProblem.examTip}</p>
        </div>
      </div>
    </div>
  );
};
