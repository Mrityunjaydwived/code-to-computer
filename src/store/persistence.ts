import { TabType, EducationalMode } from './executionStore';

export const PERSISTENCE_KEY = 'code_to_computer_state_v1';

export interface PersistedAppState {
  sourceCode: string;
  selectedExampleId: string;
  currentStepIndex: number;
  activeTab: TabType;
  bottomTab: 'console' | 'events' | 'metrics';
  speed: number;
  educationalMode: EducationalMode;
  selectedGateProblemId: string;
  gateParamValues: Record<string, number>;
  selectedRealWorldScenario: 'app' | 'game';
  selectedLessonId: string;
  pipelineSubTab: 'tokens' | 'ast' | 'ir';
  executionEngineMode?: 'silicon' | 'cpython';
  stdinInput?: string;
  editorWidthPercent?: number;
}

export function loadPersistedAppState(): Partial<PersistedAppState> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {};
    }
    const raw = window.localStorage.getItem(PERSISTENCE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (err) {
    console.warn('Could not read saved state from localStorage:', err);
    return {};
  }
}

export function savePersistedAppState(state: PersistedAppState): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Could not save state to localStorage:', err);
  }
}
