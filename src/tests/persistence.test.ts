import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadPersistedAppState,
  savePersistedAppState,
  PERSISTENCE_KEY,
  PersistedAppState,
} from '../store/persistence';

describe('State Persistence Layer', () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    const localStorageMock = {
      getItem: vi.fn((key: string) => mockStore[key] ?? null),
      setItem: vi.fn((key: string, val: string) => {
        mockStore[key] = val;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStore[key];
      }),
      clear: vi.fn(() => {
        mockStore = {};
      }),
    };
    vi.stubGlobal('localStorage', localStorageMock);
    vi.stubGlobal('window', { localStorage: localStorageMock });
  });

  it('should return empty object when localStorage has no saved state', () => {
    const state = loadPersistedAppState();
    expect(state).toEqual({});
  });

  it('should save and reload complete app state seamlessly', () => {
    const testState: PersistedAppState = {
      sourceCode: 'val = 999\nprint(val)',
      selectedExampleId: 'custom',
      currentStepIndex: 3,
      activeTab: 'gate',
      bottomTab: 'events',
      speed: 2.0,
      educationalMode: 'gate',
      selectedGateProblemId: 'emat_calculation',
      gateParamValues: { h1: 0.95, t1: 1 },
      selectedRealWorldScenario: 'game',
      selectedLessonId: 'lesson_assignment',
      pipelineSubTab: 'ir',
    };

    savePersistedAppState(testState);
    const loaded = loadPersistedAppState();

    expect(loaded.sourceCode).toBe('val = 999\nprint(val)');
    expect(loaded.currentStepIndex).toBe(3);
    expect(loaded.activeTab).toBe('gate');
    expect(loaded.bottomTab).toBe('events');
    expect(loaded.speed).toBe(2.0);
    expect(loaded.selectedGateProblemId).toBe('emat_calculation');
    expect(loaded.gateParamValues).toEqual({ h1: 0.95, t1: 1 });
    expect(loaded.selectedRealWorldScenario).toBe('game');
    expect(loaded.pipelineSubTab).toBe('ir');
  });

  it('should gracefully handle malformed JSON in localStorage without throwing', () => {
    mockStore[PERSISTENCE_KEY] = 'INVALID_JSON_CORRUPTED{[';
    const loaded = loadPersistedAppState();
    expect(loaded).toEqual({});
  });
});
