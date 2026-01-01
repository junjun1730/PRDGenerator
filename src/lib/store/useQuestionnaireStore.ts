import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Stage1Data,
  Stage2Data,
  Stage3Data,
  QuestionnaireStore,
} from '@/lib/types/questionnaire';

const initialStage1: Stage1Data = {
  serviceName: '',
  coreFeatures: [],
  mainScreens: '',
  userJourney: '',
  toneAndManner: '',
};

const initialStage2: Stage2Data = {
  themes: [],
  brandKeywords: [],
  colorSystem: {
    primary: '',
    background: '',
    darkModeSupport: false,
  },
  typography: 'gothic',
  customFont: '',
  uiDetails: {
    buttonRadius: 'md',
    iconWeight: 'regular',
    shadowIntensity: 'sm',
  },
  references: '',
};

const initialStage3: Stage3Data = {
  techStack: {
    frontend: [],
    backend: [],
  },
  dataManagement: {
    realtimeRequired: false,
    largeMediaHandling: false,
  },
  externalAPIs: [],
  authMethod: 'email',
  edgeCases: '',
};

export const useQuestionnaireStore = create<QuestionnaireStore>()(
  persist(
    (set) => ({
      // State
      stage1: initialStage1,
      stage2: initialStage2,
      stage3: initialStage3,
      currentStage: 1,
      completedStages: new Set<number>(),

      // Actions
      updateStage1: (data) =>
        set((state) => ({
          stage1: { ...state.stage1, ...data },
        })),

      updateStage2: (data) =>
        set((state) => ({
          stage2: { ...state.stage2, ...data },
        })),

      updateStage3: (data) =>
        set((state) => ({
          stage3: { ...state.stage3, ...data },
        })),

      setCurrentStage: (stage) =>
        set(() => ({
          currentStage: stage,
        })),

      resetAll: () =>
        set(() => ({
          stage1: initialStage1,
          stage2: initialStage2,
          stage3: initialStage3,
          currentStage: 1,
          completedStages: new Set<number>(),
        })),
    }),
    {
      name: 'questionnaire-storage',
      partialize: (state) => ({
        stage1: state.stage1,
        stage2: state.stage2,
        stage3: state.stage3,
        currentStage: state.currentStage,
      }),
    }
  )
);
