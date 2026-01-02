// Stage 1: Service Overview
export interface Stage1Data {
  serviceName: string;
  coreFeatures: string[]; // Top 3 features
  mainScreens: string;
  userJourney: string;
  serviceMood: string; // 서비스 분위기와 느낌
}

// Stage 2: Design Elements
export interface Stage2Data {
  themes: string[]; // Multi-select: minimal, interactive, trustworthy, cute, etc.
  brandKeywords: string[]; // 3 keywords
  colorSystem: {
    primary: string;
    background: string;
    darkModeSupport: boolean;
  };
  typography: 'gothic' | 'serif' | 'custom';
  customFont?: string;
  uiDetails: {
    buttonRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    iconWeight: 'thin' | 'regular' | 'bold';
    shadowIntensity: 'none' | 'sm' | 'md' | 'lg';
  };
  references: string;
}

// Stage 3: Technical Constraints
export interface Stage3Data {
  techStack: {
    frontend: string[];
    database: string[];
    backend: string[];
    other: string[];
  };
  dataManagement: {
    realtimeRequired: boolean;
    largeMediaHandling: boolean;
  };
  externalAPIs: string[];
  authMethod?: 'email' | 'two-factor';
  exceptionHandling: string; // 예외 상황 처리
}

// Complete questionnaire state
export interface QuestionnaireState {
  stage1: Stage1Data;
  stage2: Stage2Data;
  stage3: Stage3Data;
  currentStage: 1 | 2 | 3;
  completedStages: Set<number>;
}

// Store actions
export interface QuestionnaireActions {
  updateStage1: (data: Partial<Stage1Data>) => void;
  updateStage2: (data: Partial<Stage2Data>) => void;
  updateStage3: (data: Partial<Stage3Data>) => void;
  setCurrentStage: (stage: 1 | 2 | 3) => void;
  resetAll: () => void;
}

// Complete store type
export type QuestionnaireStore = QuestionnaireState & QuestionnaireActions;
