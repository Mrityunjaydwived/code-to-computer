import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Play,
  StepForward,
  RotateCcw,
  Cpu,
  Layers,
  Sparkles,
  GraduationCap,
  Boxes,
  Compass,
} from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';
import { CODE_EXAMPLES } from '../../data/examples';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    run,
    stepForward,
    reset,
    setActiveTab,
    setEducationalMode,
    loadExample,
  } = useExecutionStore();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const actions = [
    { label: 'Run Program', icon: Play, action: () => run(), category: 'Execution' },
    { label: 'Step Forward', icon: StepForward, action: () => stepForward(), category: 'Execution' },
    { label: 'Reset Simulation', icon: RotateCcw, action: () => reset(), category: 'Execution' },
    { label: 'View: CPU & Computer Architecture', icon: Cpu, action: () => setActiveTab('architecture'), category: 'Navigation' },
    { label: 'View: Memory, Stack & Heap', icon: Layers, action: () => setActiveTab('memory'), category: 'Navigation' },
    { label: 'View: Compiler Pipeline (Tokens & AST)', icon: Compass, action: () => setActiveTab('pipeline'), category: 'Navigation' },
    { label: 'View: Interactive 3D Architecture', icon: Boxes, action: () => setActiveTab('3d'), category: 'Navigation' },
    { label: 'View: Data Structures in Memory', icon: Layers, action: () => setActiveTab('datastructures'), category: 'Navigation' },
    { label: 'View: Interactive CS Lessons & Quiz', icon: GraduationCap, action: () => setActiveTab('lessons'), category: 'Navigation' },
    { label: 'View: GATE Exam Mode & EMAT Solver', icon: Sparkles, action: () => setActiveTab('gate'), category: 'Navigation' },
    { label: 'Mode: Developer Mode', icon: Cpu, action: () => setEducationalMode('developer'), category: 'Mode' },
    { label: 'Mode: Beginner Learning Mode', icon: GraduationCap, action: () => setEducationalMode('beginner'), category: 'Mode' },
    { label: 'Mode: GATE Exam Mode', icon: Sparkles, action: () => setEducationalMode('gate'), category: 'Mode' },
    ...CODE_EXAMPLES.map((ex) => ({
      label: `Load Example: ${ex.title}`,
      icon: Compass,
      action: () => loadExample(ex.id),
      category: 'Examples',
    })),
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-24 p-4 animate-in fade-in duration-150 font-sans">
      <div className="w-full max-w-xl bg-white border border-[#E0E0E0] rounded-xl shadow-2xl overflow-hidden">
        {/* Search Bar */}
        <div className="p-3 border-b border-[#E0E0E0] flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-[#2874F0]" />
          <input
            autoFocus
            type="text"
            placeholder="Search commands, views, or examples (e.g. 'run', 'memory', '3D')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-[#212121] placeholder-[#878787] focus:outline-none"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded text-[#878787] hover:text-[#212121]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 bg-white">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#878787]">No matching commands found.</div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    item.action();
                    setIsCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-[#F5F5F5] transition-colors group"
                >
                  <div className="flex items-center gap-2.5 text-xs text-[#212121] group-hover:text-[#2874F0] font-medium">
                    <Icon className="w-4 h-4 text-[#878787] group-hover:text-[#2874F0]" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#F1F3F6] text-[#666666] border border-[#E0E0E0] font-mono">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="p-2.5 bg-[#F7F7F7] border-t border-[#E0E0E0] flex justify-between items-center text-[11px] text-[#878787]">
          <span>Navigate with arrows or mouse</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};
