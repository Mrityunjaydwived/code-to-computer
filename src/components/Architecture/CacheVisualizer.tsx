import React, { useState } from 'react';
import { Layers, CheckCircle2, XCircle, Gauge, Clock } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

export const CacheVisualizer: React.FC = () => {
  const { snapshots, currentStepIndex } = useExecutionStore();
  const currentSnapshot = snapshots[currentStepIndex];
  const cache = currentSnapshot?.cache;

  const [selectedLevel, setSelectedLevel] = useState<'L1' | 'L2' | 'L3'>('L1');

  if (!cache) {
    return (
      <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 text-center text-xs text-[#878787]">
        Run or step the program to observe multi-level cache operations.
      </div>
    );
  }

  const activeCacheLevel = cache.levels[selectedLevel];
  const lastAccess = cache.lastAccess;

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 shadow-sm flex flex-col gap-4 font-sans">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E0E0E0] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] flex items-center justify-center">
            <Layers className="w-4 h-4 text-[#388E3C]" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
              Cache Hierarchy (L1 / L2 / L3) & Latency
            </h2>
            <span className="text-[10px] text-[#666666] font-mono">
              Direct-Mapped SRAM Caches with LRU Replacement
            </span>
          </div>
        </div>

        {/* Level Selector Tabs */}
        <div className="flex items-center bg-[#F1F3F6] border border-[#E0E0E0] rounded-lg p-0.5 text-xs font-mono">
          {(['L1', 'L2', 'L3'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-1 rounded transition-colors ${
                selectedLevel === level
                  ? 'bg-[#2874F0] text-white font-bold shadow-xs'
                  : 'text-[#666666] hover:text-[#212121]'
              }`}
            >
              {level} Cache
            </button>
          ))}
        </div>
      </div>

      {/* Telemetry Dashboard: Hit Ratio, EMAT, Latency */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        {/* Hit Ratio */}
        <div className="p-2.5 rounded-lg bg-[#E8F5E9] border border-[#388E3C]/30">
          <div className="text-[10px] text-[#388E3C] font-semibold mb-1 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-[#388E3C]" />
            <span>Hit Ratio</span>
          </div>
          <div className="text-base font-bold text-[#388E3C]">
            {(cache.hitRatio * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-[#666666] mt-0.5">
            {cache.totalHits} Hits / {cache.totalMisses} Misses
          </div>
        </div>

        {/* EMAT */}
        <div className="p-2.5 rounded-lg bg-[#E8F0FE] border border-[#2874F0]/30">
          <div className="text-[10px] text-[#2874F0] font-semibold mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#2874F0]" />
            <span>Effective Access (EMAT)</span>
          </div>
          <div className="text-base font-bold text-[#2874F0]">
            {cache.effectiveAccessTime} <span className="text-xs text-[#666666] font-normal">cycles</span>
          </div>
          <div className="text-[10px] text-[#666666] mt-0.5">
            vs 100c un-cached RAM
          </div>
        </div>

        {/* Selected Cache Latency */}
        <div className="p-2.5 rounded-lg bg-[#FAFAFA] border border-[#E0E0E0]">
          <div className="text-[10px] text-[#878787] mb-1">
            <span>{selectedLevel} Latency</span>
          </div>
          <div className="text-base font-bold text-[#212121]">
            {activeCacheLevel.latencyCycles} <span className="text-xs text-[#878787] font-normal">cycles</span>
          </div>
          <div className="text-[10px] text-[#666666] mt-0.5">
            Capacity: {activeCacheLevel.sizeBytes} Bytes
          </div>
        </div>

        {/* Last Memory Access Indicator */}
        <div className="p-2.5 rounded-lg bg-[#FAFAFA] border border-[#E0E0E0]">
          <div className="text-[10px] text-[#878787] mb-1">
            <span>Last Request</span>
          </div>
          {lastAccess ? (
            <div className="flex items-center gap-1.5">
              {lastAccess.status === 'HIT' ? (
                <CheckCircle2 className="w-4 h-4 text-[#388E3C] shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-[#E53935] shrink-0" />
              )}
              <div className="truncate">
                <span
                  className={`text-xs font-bold ${
                    lastAccess.status === 'HIT' ? 'text-[#388E3C]' : 'text-[#E53935]'
                  }`}
                >
                  {lastAccess.status} ({lastAccess.hitLevel})
                </span>
                <div className="text-[9px] text-[#878787] truncate">{lastAccess.address}</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#878787]">No memory fetch yet</div>
          )}
        </div>
      </div>

      {/* Cache Lines Visual Table */}
      <div className="border border-[#E0E0E0] rounded-xl overflow-hidden bg-white">
        <div className="px-3 py-2 bg-[#F7F7F7] border-b border-[#E0E0E0] flex justify-between items-center text-xs">
          <span className="font-semibold text-[#212121]">
            {selectedLevel} Cache Lines ({activeCacheLevel.lines.length} slots)
          </span>
          <span className="text-[10px] text-[#878787] font-mono">32 Bytes / line</span>
        </div>

        <div className="max-h-56 overflow-y-auto divide-y divide-[#E0E0E0] font-mono text-xs">
          {activeCacheLevel.lines.map((line) => {
            const isJustAccessed = lastAccess && lastAccess.address === line.addressHex;
            return (
              <div
                key={line.lineIndex}
                className={`p-2.5 flex items-center justify-between transition-colors ${
                  isJustAccessed
                    ? 'bg-[#E8F0FE] border-l-4 border-[#2874F0]'
                    : 'hover:bg-[#F5F5F5]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#878787] text-[11px] w-8">#{line.lineIndex}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      line.valid
                        ? 'bg-[#E8F5E9] text-[#388E3C] border border-[#388E3C]/30'
                        : 'bg-[#F1F3F6] text-[#878787]'
                    }`}
                  >
                    {line.valid ? 'VALID' : 'INVALID'}
                  </span>
                  <span className="text-[#666666] text-xs">Tag: {line.tag}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[#878787] text-[11px] hidden sm:inline">
                    {line.addressHex}
                  </span>
                  <div className="w-24 text-right">
                    {line.data !== null && line.data !== undefined ? (
                      <span className="font-bold text-[#2874F0]">{String(line.data)}</span>
                    ) : (
                      <span className="text-[#BDBDBD] italic">empty</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
