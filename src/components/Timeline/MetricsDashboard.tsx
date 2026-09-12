import React from 'react';
import { Activity, Gauge, HardDrive, Cpu, Layers, Database } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

export const MetricsDashboard: React.FC = () => {
  const { snapshots, currentStepIndex, metrics } = useExecutionStore();
  const currentSnapshot = snapshots[currentStepIndex];

  const memBlocks = currentSnapshot?.memory || [];
  const heapObjs = currentSnapshot?.heap || [];
  const frames = currentSnapshot?.stack || [];
  const cache = currentSnapshot?.cache;

  const memUsedBytes = memBlocks.length * 4;
  const heapUsedBytes = heapObjs.reduce((acc, o) => acc + o.size, 0);
  const stackUsedBytes = frames.length * 32;

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl p-3 shadow-xs flex flex-col gap-2 font-mono text-xs">
      <div className="flex items-center gap-2 border-b border-[#E0E0E0] pb-2">
        <Activity className="w-4 h-4 text-[#2874F0]" />
        <h3 className="font-bold text-[#212121] text-xs uppercase tracking-wider">
          Runtime Hardware Telemetry
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* Instructions Executed */}
        <div className="p-2 rounded-lg bg-[#F7F7F7] border border-[#E0E0E0]">
          <span className="text-[10px] text-[#878787] block">Instructions</span>
          <span className="text-sm font-bold text-[#2874F0]">{currentStepIndex}</span>
          <span className="text-[9px] text-[#878787] block">executed</span>
        </div>

        {/* Memory Used */}
        <div className="p-2 rounded-lg bg-[#F7F7F7] border border-[#E0E0E0]">
          <span className="text-[10px] text-[#878787] block">Virtual RAM</span>
          <span className="text-sm font-bold text-[#212121]">{memUsedBytes} B</span>
          <span className="text-[9px] text-[#878787] block">{memBlocks.length} variables</span>
        </div>

        {/* Stack Usage */}
        <div className="p-2 rounded-lg bg-[#F7F7F7] border border-[#E0E0E0]">
          <span className="text-[10px] text-[#878787] block">Stack Usage</span>
          <span className="text-sm font-bold text-[#1F74BA]">{stackUsedBytes} B</span>
          <span className="text-[9px] text-[#878787] block">{frames.length} frame(s)</span>
        </div>

        {/* Heap Usage */}
        <div className="p-2 rounded-lg bg-[#F7F7F7] border border-[#E0E0E0]">
          <span className="text-[10px] text-[#878787] block">Heap Usage</span>
          <span className="text-sm font-bold text-[#F09120]">{heapUsedBytes} B</span>
          <span className="text-[9px] text-[#878787] block">{heapObjs.length} objects</span>
        </div>

        {/* Cache Hits/Misses */}
        <div className="p-2 rounded-lg bg-[#F7F7F7] border border-[#E0E0E0]">
          <span className="text-[10px] text-[#878787] block">Cache Ratio</span>
          <span className="text-sm font-bold text-[#388E3C]">
            {cache ? `${(cache.hitRatio * 100).toFixed(0)}%` : '100%'}
          </span>
          <span className="text-[9px] text-[#878787] block">
            {cache?.totalHits || 0}H / {cache?.totalMisses || 0}M
          </span>
        </div>

        {/* CPU Cycles */}
        <div className="p-2 rounded-lg bg-[#F7F7F7] border border-[#E0E0E0]">
          <span className="text-[10px] text-[#878787] block">Est. Cycles</span>
          <span className="text-sm font-bold text-[#2874F0]">{currentStepIndex * 3}</span>
          <span className="text-[9px] text-[#878787] block">~3c / inst</span>
        </div>
      </div>
    </div>
  );
};
