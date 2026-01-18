import { create } from 'zustand';
import type { Language } from '@/lib/translations';

export type Screen = 'home' | 'data' | 'lab' | 'model' | 'evaluation';
export type TaskType = 'classification' | 'regression';
export type ModelType = 'rf' | 'xgb' | 'linear' | 'tree' | 'knn' | 'svm';

export interface ColumnInfo {
  name: string;
  type: 'numeric' | 'categorical' | 'boolean' | 'datetime';
  missing: number;
  unique: number;
  stats?: {
    mean?: number;
    median?: number;
    std?: number;
    min?: number;
    max?: number;
    mode?: string | number;
  };
}

export interface ModelResult {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1?: number;
  rmse?: number;
  r2?: number;
  featureImportance?: { name: string; importance: number }[];
}

interface MLState {
  // App State
  lang: Language;
  setLang: (lang: Language) => void;
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;

  // Data State
  data: Record<string, any>[] | null;
  setData: (data: Record<string, any>[] | null) => void;
  columns: ColumnInfo[];
  setColumns: (columns: ColumnInfo[]) => void;
  selectedColumn: string | null;
  setSelectedColumn: (column: string | null) => void;

  // Model State
  targetColumn: string | null;
  setTargetColumn: (column: string | null) => void;
  taskType: TaskType;
  setTaskType: (type: TaskType) => void;
  selectedModel: ModelType | null;
  setSelectedModel: (model: ModelType | null) => void;
  droppedFeatures: string[];
  setDroppedFeatures: (features: string[]) => void;
  modelParams: Record<string, any>;
  setModelParams: (params: Record<string, any>) => void;

  // Results State
  isTraining: boolean;
  setIsTraining: (training: boolean) => void;
  results: ModelResult | null;
  setResults: (results: ModelResult | null) => void;
  threshold: number;
  setThreshold: (threshold: number) => void;

  // Actions
  reset: () => void;
}

const initialState = {
  lang: 'he' as Language,
  currentScreen: 'home' as Screen,
  data: null,
  columns: [],
  selectedColumn: null,
  targetColumn: null,
  taskType: 'classification' as TaskType,
  selectedModel: null,
  droppedFeatures: [],
  modelParams: {},
  isTraining: false,
  results: null,
  threshold: 0.5,
};

export const useMLStore = create<MLState>((set) => ({
  ...initialState,

  setLang: (lang) => set({ lang }),
  setCurrentScreen: (currentScreen) => set({ currentScreen }),
  setData: (data) => set({ data }),
  setColumns: (columns) => set({ columns }),
  setSelectedColumn: (selectedColumn) => set({ selectedColumn }),
  setTargetColumn: (targetColumn) => set({ targetColumn }),
  setTaskType: (taskType) => set({ taskType }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setDroppedFeatures: (droppedFeatures) => set({ droppedFeatures }),
  setModelParams: (modelParams) => set({ modelParams }),
  setIsTraining: (isTraining) => set({ isTraining }),
  setResults: (results) => set({ results }),
  setThreshold: (threshold) => set({ threshold }),

  reset: () => set(initialState),
}));
