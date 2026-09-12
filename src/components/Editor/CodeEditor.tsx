import React, { useRef, useState } from 'react';
import { Copy, Check, AlertCircle, FileCode, ChevronDown, ChevronUp, Terminal, Zap } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

export const CodeEditor: React.FC = () => {
  const {
    sourceCode,
    setSourceCode,
    snapshots,
    currentStepIndex,
    compileAndInit,
    status,
    error,
    executionEngineMode,
    stdinInput,
    setStdinInput,
  } = useExecutionStore();

  const [copied, setCopied] = useState(false);
  const [showStdin, setShowStdin] = useState(Boolean(stdinInput && stdinInput.length > 0));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const currentSnapshot = snapshots[currentStepIndex];
  const activeLine = currentSnapshot?.line;

  const lines = sourceCode.split('\n');

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sourceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCpython = executionEngineMode === 'cpython';

  return (
    <div className="flex flex-col h-full bg-white select-none shadow-xs">
      {/* Editor Header */}
      <div className="h-10 px-3 border-b border-[#E0E0E0] flex items-center justify-between bg-[#F7F7F7] text-xs text-[#666666]">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-[#2874F0]" />
          <span className="font-mono text-[#212121] font-bold text-xs">main.py</span>
          
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
              isCpython
                ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]'
                : 'bg-[#E8F0FE] text-[#1967D2] border border-[#AECBFA]'
            }`}
          >
            {isCpython ? <Terminal className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
            <span>{isCpython ? 'CPython 3 Wasm' : 'Silicon Engine'}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* STDIN Toggle Button */}
          <button
            onClick={() => setShowStdin(!showStdin)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
              showStdin || (stdinInput && stdinInput.length > 0)
                ? 'bg-[#F8D706]/20 border-[#F8D706] text-[#212121]'
                : 'bg-white border-[#E0E0E0] text-[#666666] hover:text-[#212121]'
            }`}
            title="Toggle STDIN Input (for competitive programming)"
          >
            <Terminal className="w-3 h-3" />
            <span>STDIN</span>
            {showStdin ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={handleCopy}
            title="Copy code"
            className="p-1 rounded hover:bg-[#E0E0E0] text-[#666666] hover:text-[#212121] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#388E3C]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {!isCpython && (
            <button
              onClick={() => compileAndInit()}
              title="Re-analyze & Parse"
              className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#2874F0] border border-[#2874F0]/30 text-[11px] font-semibold transition-colors"
            >
              <span>Analyze</span>
            </button>
          )}
        </div>
      </div>

      {/* STDIN Input Drawer (Collapsible) */}
      {showStdin && (
        <div className="bg-[#F7F7F7] border-b border-[#E0E0E0] p-2.5 space-y-1.5 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#666666]">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3 text-[#2874F0]" />
              <span>Standard Input (STDIN)</span>
              <span className="text-[10px] text-[#878787] font-normal">(Fed into sys.stdin / input())</span>
            </span>
            {stdinInput.length > 0 && (
              <button
                onClick={() => setStdinInput('')}
                className="text-[10px] text-[#E53935] hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            value={stdinInput}
            onChange={(e) => setStdinInput(e.target.value)}
            rows={3}
            placeholder="Enter testcase inputs here (e.g. 5\n10 20 30 40 50)..."
            className="w-full p-2 bg-white border border-[#E0E0E0] rounded text-xs font-mono text-[#212121] focus:outline-none focus:border-[#2874F0] resize-y"
          />
        </div>
      )}

      {/* Editor Body */}
      <div className="relative flex-1 flex overflow-hidden font-mono text-xs bg-white">
        {/* Line Numbers Gutter */}
        <div
          ref={gutterRef}
          className="w-12 py-3 bg-[#F7F7F7] text-[#878787] text-right pr-3 select-none overflow-hidden border-r border-[#E0E0E0] leading-6 font-mono"
        >
          {lines.map((_, i) => {
            const lineNum = i + 1;
            const isExecuting = activeLine === lineNum && status !== 'idle';
            const isErrorLine = error?.line === lineNum;

            return (
              <div
                key={lineNum}
                className={`relative h-6 flex items-center justify-end ${
                  isErrorLine
                    ? 'text-[#E53935] font-bold bg-[#FFEBEE]'
                    : isExecuting
                    ? 'text-[#2874F0] font-bold bg-[#E8F0FE]'
                    : 'hover:text-[#212121]'
                }`}
              >
                {isExecuting && (
                  <span className="absolute left-1 text-[#2874F0] text-[10px] font-bold animate-pulse">❯</span>
                )}
                <span>{lineNum}</span>
              </div>
            );
          })}
        </div>

        {/* Text Area & Visual Highlighting Overlay */}
        <div className="relative flex-1 h-full overflow-hidden bg-white">
          {/* Active execution line highlight (in silicon mode) */}
          {activeLine && status !== 'idle' && !isCpython && (
            <div
              className="absolute left-0 right-0 pointer-events-none bg-[#E8F0FE] border-y border-[#2874F0]/40 transition-all duration-150 z-0"
              style={{
                top: `${(activeLine - 1) * 24 + 12}px`,
                height: '24px',
              }}
            />
          )}

          <textarea
            ref={textareaRef}
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            onScroll={handleScroll}
            spellCheck={false}
            className="w-full h-full p-3 bg-transparent text-[#212121] resize-none focus:outline-none font-mono text-xs leading-6 selection:bg-[#E8F0FE] z-10 relative overflow-auto whitespace-pre"
            placeholder="Write Python code here..."
          />
        </div>
      </div>

      {/* Syntax Error Diagnostic Banner */}
      {error && (
        <div className="p-3 bg-[#FFEBEE] border-t border-[#E53935]/40 text-xs text-[#212121] flex items-start gap-2.5 animate-in slide-in-from-bottom duration-200">
          <AlertCircle className="w-4 h-4 text-[#E53935] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-[#E53935]">
              Syntax Error on Line {error.line}, Column {error.col}
            </div>
            <div className="text-[#212121] font-mono text-[11px] whitespace-pre-wrap">{error.message}</div>
            <div className="text-[11px] text-[#F09120] font-sans font-medium">
              💡 Suggestion: {error.suggestion}
            </div>
          </div>
        </div>
      )}

      {/* Editor Status Footer */}
      <div className="h-7 px-3 bg-[#F7F7F7] border-t border-[#E0E0E0] flex items-center justify-between text-[11px] text-[#878787]">
        <div className="flex items-center gap-2">
          <span>UTF-8</span>
          <span>•</span>
          <span>{isCpython ? 'CPython 3.12 (Wasm)' : 'Python 3.x'}</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span>Ln {activeLine || 1}, Col 1</span>
          <span>•</span>
          <span className="text-[#2874F0] font-semibold">{lines.length} lines</span>
        </div>
      </div>
    </div>
  );
};
