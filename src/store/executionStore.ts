import { create } from 'zustand';
import { SimulationRuntime, SimulationResult } from '../engine/runtime';
import { executePythonWithWasm } from '../engine/pyodideRunner';
import { CODE_EXAMPLES } from '../data/examples';
import { GATE_PROBLEMS } from '../data/gateProblems';
import { LESSONS } from '../data/lessons';
import { loadPersistedAppState, savePersistedAppState } from './persistence';
import {
  Token,
  ASTNode,
  IRInstruction,
  ExecutionSnapshot,
  ExecutionMetrics,
} from '../engine/types';

export type TabType =
  | 'architecture'
  | 'memory'
  | 'pipeline'
  | '3d'
  | 'datastructures'
  | 'flowgraph'
  | 'lessons'
  | 'gate'
  | 'realworld';

export type EducationalMode = 'developer' | 'beginner' | 'gate';
export type MobileView = 'editor' | 'visualizer' | 'telemetry';

interface ExecutionStoreState {
  sourceCode: string;
  selectedExampleId: string;
  tokens: Token[];
  ast: ASTNode | null;
  instructions: IRInstruction[];
  snapshots: ExecutionSnapshot[];
  currentStepIndex: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  speed: number; // 0.25 to 4.0 multiplier
  activeTab: TabType;
  bottomTab: 'console' | 'events' | 'metrics';
  educationalMode: EducationalMode;
  selectedAddress: string | null;
  isWhyModalOpen: boolean;
  isCommandPaletteOpen: boolean;
  error: SimulationResult['error'] | null;
  metrics: ExecutionMetrics;

  // Dual-Engine & Competitive Programming
  executionEngineMode: 'silicon' | 'cpython';
  stdinInput: string;
  wasmOutput: string[];
  wasmStderr: string;
  isWasmRunning: boolean;
  wasmDurationMs: number;

  // Responsive & Adjustable Screen Layout
  editorWidthPercent: number; // For desktop resizable panel (25% to 75%)
  mobileView: MobileView; // For mobile phone single-pane navigation

  // Additional sub-view persisted states
  selectedGateProblemId: string;
  gateParamValues: Record<string, number>;
  selectedRealWorldScenario: 'app' | 'game';
  selectedLessonId: string;
  pipelineSubTab: 'tokens' | 'ast' | 'ir';

  // Actions
  setSourceCode: (code: string) => void;
  compileAndInit: (targetStepIndex?: number) => boolean;
  run: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  jumpToStep: (index: number) => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  setActiveTab: (tab: TabType) => void;
  setBottomTab: (tab: 'console' | 'events' | 'metrics') => void;
  setEducationalMode: (mode: EducationalMode) => void;
  setSelectedAddress: (addr: string | null) => void;
  setIsWhyModalOpen: (open: boolean) => void;
  setIsCommandPaletteOpen: (open: boolean) => void;
  loadExample: (id: string) => void;
  setSelectedGateProblemId: (id: string) => void;
  setGateParamValues: (values: Record<string, number>) => void;
  setSelectedRealWorldScenario: (scenario: 'app' | 'game') => void;
  setSelectedLessonId: (id: string) => void;
  setPipelineSubTab: (subTab: 'tokens' | 'ast' | 'ir') => void;

  // Dual-engine and layout actions
  setExecutionEngineMode: (mode: 'silicon' | 'cpython') => void;
  setStdinInput: (input: string) => void;
  runWasm: () => Promise<void>;
  setEditorWidthPercent: (width: number) => void;
  setMobileView: (view: MobileView) => void;
}

let runTimer: any = null;

const saved = loadPersistedAppState();

const initialGateParams = () => {
  if (saved.gateParamValues && Object.keys(saved.gateParamValues).length > 0) {
    return saved.gateParamValues;
  }
  const initial: Record<string, number> = {};
  GATE_PROBLEMS[0].inputs.forEach((inp) => {
    initial[inp.key] = inp.defaultVal;
  });
  return initial;
};

export const useExecutionStore = create<ExecutionStoreState>((set, get) => ({
  sourceCode: saved.sourceCode ?? CODE_EXAMPLES[0].code,
  selectedExampleId: saved.selectedExampleId ?? CODE_EXAMPLES[0].id,
  tokens: [],
  ast: null,
  instructions: [],
  snapshots: [],
  currentStepIndex: typeof saved.currentStepIndex === 'number' ? saved.currentStepIndex : 0,
  status: 'idle',
  speed: saved.speed ?? 1.0,
  activeTab: saved.activeTab ?? 'architecture',
  bottomTab: saved.bottomTab ?? 'console',
  educationalMode: saved.educationalMode ?? 'developer',
  selectedAddress: null,
  isWhyModalOpen: false,
  isCommandPaletteOpen: false,
  error: null,
  metrics: {
    instructionsExecuted: 0,
    memoryUsedBytes: 0,
    stackDepth: 1,
    heapAllocations: 0,
    cacheHits: 0,
    cacheMisses: 0,
    cpuCycles: 0,
    functionsCalled: 0,
  },

  // Dual-Engine & Competitive Programming
  executionEngineMode: saved.executionEngineMode ?? 'silicon',
  stdinInput: saved.stdinInput ?? '',
  wasmOutput: [],
  wasmStderr: '',
  isWasmRunning: false,
  wasmDurationMs: 0,

  // Responsive & Adjustable Screen Layout
  editorWidthPercent: saved.editorWidthPercent ?? 38,
  mobileView: 'editor',

  selectedGateProblemId: saved.selectedGateProblemId ?? GATE_PROBLEMS[0].id,
  gateParamValues: initialGateParams(),
  selectedRealWorldScenario: saved.selectedRealWorldScenario ?? 'app',
  selectedLessonId: saved.selectedLessonId ?? LESSONS[0].id,
  pipelineSubTab: saved.pipelineSubTab ?? 'tokens',

  setSourceCode: (code: string) => {
    if (runTimer) clearInterval(runTimer);
    set({
      sourceCode: code,
      selectedExampleId: 'custom',
      status: 'idle',
      currentStepIndex: 0,
      snapshots: [],
      error: null,
    });
  },

  compileAndInit: (targetStepIndex?: number) => {
    if (runTimer) clearInterval(runTimer);
    const code = get().sourceCode;
    const result = SimulationRuntime.execute(code);

    if (result.error) {
      set({
        tokens: result.tokens,
        ast: null,
        instructions: [],
        snapshots: [],
        error: result.error,
        status: 'error',
      });
      return false;
    }

    const maxIdx = Math.max(0, result.snapshots.length - 1);
    const desiredIndex = targetStepIndex !== undefined ? targetStepIndex : get().currentStepIndex;
    const resolvedStepIndex = Math.min(maxIdx, Math.max(0, desiredIndex));

    set({
      tokens: result.tokens,
      ast: result.ast,
      instructions: result.instructions,
      snapshots: result.snapshots,
      metrics: result.metrics,
      currentStepIndex: resolvedStepIndex,
      status: resolvedStepIndex === maxIdx && maxIdx > 0 ? 'completed' : 'paused',
      error: null,
    });
    return true;
  },

  run: () => {
    const state = get();
    if (state.executionEngineMode === 'cpython') {
      get().runWasm();
      return;
    }

    if (runTimer) clearInterval(runTimer);

    // If not compiled yet or finished, compile first
    if (state.snapshots.length === 0 || state.status === 'completed' || state.status === 'error') {
      const ok = get().compileAndInit();
      if (!ok) return;
    }

    set({ status: 'running' });

    const stepInterval = Math.max(100, Math.floor(700 / get().speed));
    runTimer = setInterval(() => {
      const current = get();
      if (current.status !== 'running') {
        clearInterval(runTimer);
        return;
      }

      if (current.currentStepIndex < current.snapshots.length - 1) {
        set({ currentStepIndex: current.currentStepIndex + 1 });
      } else {
        clearInterval(runTimer);
        set({ status: 'completed' });
      }
    }, stepInterval);
  },

  pause: () => {
    if (runTimer) clearInterval(runTimer);
    set({ status: 'paused' });
  },

  stepForward: () => {
    if (runTimer) clearInterval(runTimer);
    const state = get();
    if (state.snapshots.length === 0) {
      const ok = get().compileAndInit();
      if (!ok) return;
    }

    const nextIndex = Math.min(get().snapshots.length - 1, get().currentStepIndex + 1);
    set({
      currentStepIndex: nextIndex,
      status: nextIndex === get().snapshots.length - 1 ? 'completed' : 'paused',
    });
  },

  stepBackward: () => {
    if (runTimer) clearInterval(runTimer);
    const prevIndex = Math.max(0, get().currentStepIndex - 1);
    set({
      currentStepIndex: prevIndex,
      status: 'paused',
    });
  },

  jumpToStep: (index: number) => {
    if (runTimer) clearInterval(runTimer);
    const validIdx = Math.max(0, Math.min(get().snapshots.length - 1, index));
    set({
      currentStepIndex: validIdx,
      status: validIdx === get().snapshots.length - 1 ? 'completed' : 'paused',
    });
  },

  reset: () => {
    if (runTimer) clearInterval(runTimer);
    set({
      currentStepIndex: 0,
      status: 'idle',
      selectedAddress: null,
      isWhyModalOpen: false,
      wasmOutput: [],
      wasmStderr: '',
      isWasmRunning: false,
    });
  },

  setSpeed: (speed: number) => {
    set({ speed });
    if (get().status === 'running') {
      get().run(); // restart timer with new speed
    }
  },

  setActiveTab: (tab: TabType) => set({ activeTab: tab }),

  setBottomTab: (tab: 'console' | 'events' | 'metrics') => set({ bottomTab: tab }),

  setEducationalMode: (mode: EducationalMode) => set({ educationalMode: mode }),

  setSelectedAddress: (addr: string | null) => set({ selectedAddress: addr }),

  setIsWhyModalOpen: (open: boolean) => set({ isWhyModalOpen: open }),

  setIsCommandPaletteOpen: (open: boolean) => set({ isCommandPaletteOpen: open }),

  loadExample: (id: string) => {
    if (runTimer) clearInterval(runTimer);
    const example = CODE_EXAMPLES.find((e) => e.id === id);
    if (example) {
      set({
        sourceCode: example.code,
        selectedExampleId: id,
        status: 'idle',
        currentStepIndex: 0,
        snapshots: [],
        error: null,
        wasmOutput: [],
        wasmStderr: '',
      });
      // Auto compile on example load for immediate visual delight
      setTimeout(() => {
        get().compileAndInit(0);
      }, 50);
    }
  },

  setSelectedGateProblemId: (id: string) => set({ selectedGateProblemId: id }),

  setGateParamValues: (values: Record<string, number>) => set({ gateParamValues: values }),

  setSelectedRealWorldScenario: (scenario: 'app' | 'game') =>
    set({ selectedRealWorldScenario: scenario }),

  setSelectedLessonId: (id: string) => set({ selectedLessonId: id }),

  setPipelineSubTab: (subTab: 'tokens' | 'ast' | 'ir') => set({ pipelineSubTab: subTab }),

  setExecutionEngineMode: (mode: 'silicon' | 'cpython') => {
    if (runTimer) clearInterval(runTimer);
    set({ executionEngineMode: mode, status: 'idle' });
  },

  setStdinInput: (input: string) => set({ stdinInput: input }),

  runWasm: async () => {
    const { sourceCode, stdinInput } = get();
    set({
      isWasmRunning: true,
      status: 'running',
      bottomTab: 'console',
      error: null,
    });

    const result = await executePythonWithWasm(sourceCode, stdinInput);
    if (result.error) {
      set({
        isWasmRunning: false,
        status: 'error',
        wasmOutput: result.stdout,
        wasmStderr: result.stderr || result.error.message,
        wasmDurationMs: result.executionTimeMs,
        error: {
          line: 1,
          col: 1,
          message: result.error.message,
          suggestion: 'Check Python traceback and standard library inputs.',
        },
      });
    } else {
      set({
        isWasmRunning: false,
        status: 'completed',
        wasmOutput: result.stdout,
        wasmStderr: result.stderr || '',
        wasmDurationMs: result.executionTimeMs,
        error: null,
      });
    }
  },

  setEditorWidthPercent: (width: number) => {
    const clamped = Math.max(20, Math.min(80, width));
    set({ editorWidthPercent: clamped });
  },

  setMobileView: (view: MobileView) => set({ mobileView: view }),
}));

// Automatic persistence subscriber
let saveDebounceTimer: any = null;

useExecutionStore.subscribe((state) => {
  if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => {
    savePersistedAppState({
      sourceCode: state.sourceCode,
      selectedExampleId: state.selectedExampleId,
      currentStepIndex: state.currentStepIndex,
      activeTab: state.activeTab,
      bottomTab: state.bottomTab,
      speed: state.speed,
      educationalMode: state.educationalMode,
      selectedGateProblemId: state.selectedGateProblemId,
      gateParamValues: state.gateParamValues,
      selectedRealWorldScenario: state.selectedRealWorldScenario,
      selectedLessonId: state.selectedLessonId,
      pipelineSubTab: state.pipelineSubTab,
      executionEngineMode: state.executionEngineMode,
      stdinInput: state.stdinInput,
      editorWidthPercent: state.editorWidthPercent,
    });
  }, 100);
});

