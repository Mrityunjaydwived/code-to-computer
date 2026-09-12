import React from 'react';
import { Terminal, Copy, Check, Clock, AlertTriangle } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

export const ConsoleOutput: React.FC = () => {
  const {
    snapshots,
    currentStepIndex,
    status,
    executionEngineMode,
    wasmOutput,
    wasmStderr,
    wasmDurationMs,
    isWasmRunning,
  } = useExecutionStore();

  const isCpython = executionEngineMode === 'cpython';
  const currentSnapshot = snapshots[currentStepIndex];
  const stdout = isCpython ? wasmOutput : (currentSnapshot?.stdout || []);

  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const fullText = isCpython
      ? [...wasmOutput, wasmStderr ? `STDERR:\n${wasmStderr}` : ''].filter(Boolean).join('\n')
      : stdout.join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl p-3 shadow-xs flex flex-col gap-2 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#E0E0E0] pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#388E3C] shrink-0" />
          <h3 className="font-bold text-[#212121] text-xs uppercase tracking-wider">
            {isCpython ? 'CPython 3 (Wasm) Output Console' : 'Standard Output Console (STDOUT)'}
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isCpython && wasmDurationMs > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8F0FE] text-[#1967D2] font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{wasmDurationMs} ms</span>
            </span>
          )}

          {status === 'completed' && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E8F5E9] text-[#388E3C] font-semibold border border-[#A5D6A7]">
              Process Finished (Exit 0)
            </span>
          )}

          {status === 'error' && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FFEBEE] text-[#E53935] font-semibold border border-[#EF9A9A]">
              Process Failed (Exit 1)
            </span>
          )}

          {(stdout.length > 0 || wasmStderr) && (
            <button
              onClick={handleCopy}
              className="p-1 rounded text-[#666666] hover:text-[#212121] hover:bg-[#F5F5F5] transition-colors"
              title="Copy output"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#388E3C]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Terminal Display */}
      <div className="min-h-[70px] max-h-48 overflow-y-auto p-3 rounded-lg bg-[#F7F7F7] border border-[#E0E0E0] font-mono text-xs space-y-1">
        {isWasmRunning ? (
          <div className="text-[#2874F0] flex items-center gap-2 py-2">
            <span className="animate-spin inline-block">⏳</span>
            <span>Executing Python 3 WebAssembly runtime...</span>
          </div>
        ) : stdout.length === 0 && !wasmStderr ? (
          <div className="text-[#878787] italic">
            {isCpython
              ? 'No output produced yet. Click [Run] to execute using CPython 3 Wasm.'
              : 'No output produced yet. Use print(...) in code.'}
          </div>
        ) : (
          <>
            {stdout.map((line, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[#212121] font-semibold">
                <span className="text-[#2874F0] select-none font-bold">&gt;</span>
                <span className="break-all whitespace-pre-wrap">{line}</span>
              </div>
            ))}
            {wasmStderr && (
              <div className="mt-2 p-2 bg-[#FFEBEE] border border-[#EF9A9A] rounded text-[#E53935] font-mono text-xs whitespace-pre-wrap flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{wasmStderr}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
