import React, { useState } from 'react';
import { Terminal, Filter, ArrowUpRight } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';
import { ExecutionEvent } from '../../engine/types';

export const EventLog: React.FC = () => {
  const { snapshots, currentStepIndex, jumpToStep } = useExecutionStore();
  const [filter, setFilter] = useState<string>('ALL');

  // Collect all events up to current snapshot
  const activeEvents = snapshots
    .slice(0, currentStepIndex + 1)
    .map((s) => s.lastEvent)
    .filter(Boolean);

  const filteredEvents = activeEvents.filter((e) => {
    if (filter === 'ALL') return true;
    return e.subsystem === filter;
  });

  const getSubsystemColor = (sub: ExecutionEvent['subsystem']) => {
    switch (sub) {
      case 'CPU':
        return 'text-[#2874F0] bg-[#E8F0FE] border-[#B3D4FC]';
      case 'MEMORY':
        return 'text-[#1F74BA] bg-[#E8F0FE] border-[#B3D4FC]';
      case 'CACHE':
        return 'text-[#388E3C] bg-[#E8F5E9] border-[#A5D6A7]';
      case 'STACK':
        return 'text-[#2874F0] bg-[#E8F0FE] border-[#B3D4FC]';
      case 'HEAP':
        return 'text-[#F09120] bg-[#FFF8E1] border-[#FFE082]';
      case 'OUTPUT':
        return 'text-[#388E3C] bg-[#E8F5E9] border-[#A5D6A7]';
      default:
        return 'text-[#666666] bg-[#F1F3F6] border-[#E0E0E0]';
    }
  };

  const subsystems = ['ALL', 'CPU', 'MEMORY', 'CACHE', 'STACK', 'HEAP', 'OUTPUT'];

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl p-3 shadow-xs flex flex-col gap-2.5 font-mono text-xs">
      {/* Header & Subsystem Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E0E0E0] pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#2874F0]" />
          <h3 className="font-bold text-[#212121] text-xs uppercase tracking-wider">
            Hardware Event Log
          </h3>
          <span className="text-[10px] text-[#878787]">
            ({filteredEvents.length} events)
          </span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
          {subsystems.map((sub) => (
            <button
              key={sub}
              onClick={() => setFilter(sub)}
              className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                filter === sub
                  ? 'bg-[#2874F0] text-white font-bold shadow-xs'
                  : 'text-[#666666] hover:text-[#212121] hover:bg-[#F5F5F5]'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <div className="max-h-48 overflow-y-auto space-y-1.5 p-1">
        {filteredEvents.length === 0 ? (
          <div className="p-4 text-center text-[11px] text-[#878787] italic">
            No events recorded yet. Run code to stream hardware events.
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const isCurrent = evt.step === currentStepIndex;
            return (
              <div
                key={evt.id}
                onClick={() => jumpToStep(evt.step)}
                className={`p-2 rounded-lg border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-[#E8F0FE] border-[#2874F0] text-[#212121] shadow-xs'
                    : 'bg-white border-[#E0E0E0] hover:bg-[#F5F5F5] text-[#212121]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[#878787] text-[10px]">[{evt.timestamp}]</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${getSubsystemColor(
                      evt.subsystem
                    )}`}
                  >
                    {evt.subsystem}
                  </span>
                  <span className="truncate text-[11px]">{evt.message}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-[#878787] hover:text-[#2874F0]">
                  <span className="text-[10px]">#{evt.step}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
