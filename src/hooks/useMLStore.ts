import { create } from 'zustand';
import type { Language } from '@/lib/translations';

export type Screen = 'home' | 'dataHub' | 'model' | 'evaluation' | 'leaderboard';
export type TaskType = 'classification' | 'regression';
export type ModelType = 'rf' | 'xgb' | 'linear' | 'tree' | 'knn' | 'svm' | 'gb' | 'ridge' | 'lasso';
export type DataHubTab = 'overview' | 'lab' | 'quality';

// ColumnInfo matches the backend response directly (flat structure with optional stats)
export interface ColumnInfo {
  name: string;
  type: 'numeric' | 'categorical' | 'boolean' | 'datetime';
  missing: number;
  unique: number;
  // Stats fields (flat, from backend)
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  std?: number;
  mode?: string | number;
}

export interface ModelResult {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1?: number;
  rmse?: number;
  r2?: number;
  mae?: number;
  trainScore?: number;
  cvMean?: number;
  cvStd?: number;
  featureImportance?: { name: string; importance: number }[];
  confusionMatrix?: number[][];
  predictions?: { actual: number; predicted: number }[];
  rocData?: { fpr: number; tpr: number }[];
  prData?: { precision: number; recall: number }[];
  auc?: number;
  treeRules?: string;
}

export interface LeaderboardEntry {
  id: string;
  modelType: ModelType;
  modelName: string;
  taskType: TaskType;
  timestamp: Date;
  params: Record<string, any>;
  metrics: {
    accuracy?: number;
    f1?: number;
    r2?: number;
    rmse?: number;
  };
}

interface HistoryState {
  data: Record<string, any>[];
  columns: ColumnInfo[];
}

interface MLState {
  // App State
  lang: Language;
  setLang: (lang: Language) => void;
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  dataHubTab: DataHubTab;
  setDataHubTab: (tab: DataHubTab) => void;

  // Data State
  data: Record<string, any>[] | null;
  setData: (data: Record<string, any>[] | null) => void;
  originalData: Record<string, any>[] | null;
  setOriginalData: (data: Record<string, any>[] | null) => void;
  columns: ColumnInfo[];
  setColumns: (columns: ColumnInfo[]) => void;
  selectedColumn: string | null;
  setSelectedColumn: (column: string | null) => void;
  dataHistory: HistoryState[];
  setDataHistory: (history: HistoryState[]) => void;
  dataName: string;
  setDataName: (name: string) => void;
  totalRows: number;
  setTotalRows: (rows: number) => void;

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
  trainSize: number;
  setTrainSize: (size: number) => void;
  randomState: number;
  setRandomState: (state: number) => void;
  useCV: boolean;
  setUseCV: (use: boolean) => void;
  autoScale: boolean;
  setAutoScale: (scale: boolean) => void;
  autoEncode: boolean;
  setAutoEncode: (encode: boolean) => void;

  // Results State
  isTraining: boolean;
  setIsTraining: (training: boolean) => void;
  results: ModelResult | null;
  setResults: (results: ModelResult | null) => void;
  threshold: number;
  setThreshold: (threshold: number) => void;

  // Leaderboard
  leaderboard: LeaderboardEntry[];
  addToLeaderboard: (entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>) => void;
  clearLeaderboard: () => void;

  // Actions
  reset: () => void;
}

const initialState = {
  lang: 'he' as Language,
  currentScreen: 'home' as Screen,
  dataHubTab: 'overview' as DataHubTab,
  data: null,
  originalData: null,
  columns: [],
  selectedColumn: null,
  dataHistory: [],
  dataName: '',
  totalRows: 0,
  targetColumn: null,
  taskType: 'classification' as TaskType,
  selectedModel: null,
  droppedFeatures: [],
  modelParams: {},
  trainSize: 0.8,
  randomState: 42,
  useCV: false,
  autoScale: true,
  autoEncode: true,
  isTraining: false,
  results: null,
  threshold: 0.5,
  leaderboard: [],
};

export const useMLStore = create<MLState>((set) => ({
  ...initialState,

  setLang: (lang) => set({ lang }),
  setCurrentScreen: (currentScreen) => set({ currentScreen }),
  setDataHubTab: (dataHubTab) => set({ dataHubTab }),
  setData: (data) => set({ data }),
  setOriginalData: (originalData) => set({ originalData }),
  setColumns: (columns) => set({ columns }),
  setSelectedColumn: (selectedColumn) => set({ selectedColumn }),
  setDataHistory: (dataHistory) => set({ dataHistory }),
  setDataName: (dataName) => set({ dataName }),
  setTotalRows: (totalRows) => set({ totalRows }),
  setTargetColumn: (targetColumn) => set({ targetColumn }),
  setTaskType: (taskType) => set({ taskType }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setDroppedFeatures: (droppedFeatures) => set({ droppedFeatures }),
  setModelParams: (modelParams) => set({ modelParams }),
  setTrainSize: (trainSize) => set({ trainSize }),
  setRandomState: (randomState) => set({ randomState }),
  setUseCV: (useCV) => set({ useCV }),
  setAutoScale: (autoScale) => set({ autoScale }),
  setAutoEncode: (autoEncode) => set({ autoEncode }),
  setIsTraining: (isTraining) => set({ isTraining }),
  setResults: (results) => set({ results }),
  setThreshold: (threshold) => set({ threshold }),
  
  addToLeaderboard: (entry) => set((state) => ({
    leaderboard: [
      ...state.leaderboard,
      { ...entry, id: Date.now().toString(), timestamp: new Date() }
    ]
  })),
  clearLeaderboard: () => set({ leaderboard: [] }),

  reset: () => set(initialState),
}));
