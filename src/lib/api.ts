/**
 * ML-Lab API Service - MOCK MODE
 * Simulates backend behavior for UI/UX development
 * No backend server required!
 */

export interface UploadResponse {
  success: boolean;
  message: string;
  filename: string;
  rows: number;
  columns: string[];
}

export interface ColumnInfoAPI {
  name: string;
  dtype: string;
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

export interface ColumnsResponse {
  columns: ColumnInfoAPI[];
  data_preview: Record<string, any>[];
  total_rows: number;
}

export interface TrainRequest {
  target: string;
  features: string[];
  model_type: string;
  task_type: 'classification' | 'regression';
  params: Record<string, any>;
  train_size: number;
  random_state: number;
  use_cv: boolean;
  auto_scale: boolean;
  auto_encode: boolean;
}

export interface TrainResponse {
  success: boolean;
  message: string;
  metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1?: number;
    r2?: number;
    mae?: number;
    rmse?: number;
    train_score: number;
    cv_mean?: number;
    cv_std?: number;
    auc?: number;
  };
  confusion_matrix?: number[][];
  feature_importance?: { name: string; importance: number }[];
  predictions?: { actual: number; predicted: number }[];
  roc_data?: { fpr: number; tpr: number }[];
  pr_data?: { precision: number; recall: number }[];
  tree_rules?: string;
}

export interface CleanRequest {
  action: 'drop_column' | 'fill_missing' | 'remove_outliers' | 'drop_missing_rows' | 'drop_duplicates';
  column?: string;
  fill_method?: 'mean' | 'median' | 'mode';
}

export interface CleanResponse {
  success: boolean;
  message: string;
  rows: number;
  columns: ColumnInfoAPI[];
  data_preview: Record<string, any>[];
}

// ============ MOCK DATA GENERATORS ============

const MOCK_COLUMNS: ColumnInfoAPI[] = [
  { name: 'age', dtype: 'int64', missing: 12, unique: 45, stats: { mean: 35.2, median: 33, std: 12.5, min: 18, max: 78 } },
  { name: 'income', dtype: 'float64', missing: 5, unique: 234, stats: { mean: 52000, median: 48000, std: 15000, min: 20000, max: 150000 } },
  { name: 'category', dtype: 'object', missing: 0, unique: 5, stats: { mode: 'Premium' } },
  { name: 'score', dtype: 'float64', missing: 8, unique: 89, stats: { mean: 72.5, median: 74, std: 15.2, min: 20, max: 100 } },
  { name: 'is_active', dtype: 'bool', missing: 0, unique: 2, stats: { mode: 'True' } },
  { name: 'signup_date', dtype: 'datetime64', missing: 3, unique: 312, stats: {} },
  { name: 'region', dtype: 'object', missing: 2, unique: 8, stats: { mode: 'North' } },
  { name: 'transactions', dtype: 'int64', missing: 0, unique: 156, stats: { mean: 23.4, median: 18, std: 15.8, min: 1, max: 120 } },
  { name: 'target', dtype: 'int64', missing: 0, unique: 2, stats: { mode: 1 } },
];

const MOCK_DATA_PREVIEW = [
  { age: 32, income: 55000, category: 'Premium', score: 78.5, is_active: true, signup_date: '2023-01-15', region: 'North', transactions: 25, target: 1 },
  { age: 45, income: 72000, category: 'Gold', score: 82.3, is_active: true, signup_date: '2022-08-22', region: 'South', transactions: 45, target: 1 },
  { age: 28, income: 38000, category: 'Standard', score: 65.1, is_active: false, signup_date: '2023-06-10', region: 'East', transactions: 12, target: 0 },
  { age: null, income: 61000, category: 'Premium', score: null, is_active: true, signup_date: '2022-11-30', region: 'West', transactions: 33, target: 1 },
  { age: 52, income: 95000, category: 'Platinum', score: 91.2, is_active: true, signup_date: '2021-03-18', region: 'North', transactions: 78, target: 1 },
  { age: 35, income: 48000, category: 'Gold', score: 70.8, is_active: false, signup_date: '2023-02-28', region: 'South', transactions: 19, target: 0 },
  { age: 41, income: 67000, category: 'Premium', score: 85.4, is_active: true, signup_date: '2022-05-14', region: 'East', transactions: 52, target: 1 },
  { age: 29, income: 42000, category: 'Standard', score: 62.9, is_active: true, signup_date: '2023-08-05', region: 'West', transactions: 8, target: 0 },
];

let mockColumns = [...MOCK_COLUMNS];
let mockDataPreview = [...MOCK_DATA_PREVIEW];
let mockTotalRows = 891;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

// ============ MOCK API FUNCTIONS ============

export async function uploadFile(file: File): Promise<UploadResponse> {
  await delay(800);
  
  mockColumns = [...MOCK_COLUMNS];
  mockDataPreview = [...MOCK_DATA_PREVIEW];
  mockTotalRows = Math.floor(randomBetween(500, 2000));

  return {
    success: true,
    message: `Successfully loaded ${file.name}`,
    filename: file.name,
    rows: mockTotalRows,
    columns: mockColumns.map(c => c.name),
  };
}

export async function uploadFromURL(url: string): Promise<UploadResponse> {
  await delay(1200);
  
  mockColumns = [...MOCK_COLUMNS];
  mockDataPreview = [...MOCK_DATA_PREVIEW];
  mockTotalRows = Math.floor(randomBetween(500, 2000));

  const filename = url.split('/').pop() || 'data.csv';

  return {
    success: true,
    message: `Successfully loaded from URL`,
    filename,
    rows: mockTotalRows,
    columns: mockColumns.map(c => c.name),
  };
}

export async function getColumns(): Promise<ColumnsResponse> {
  await delay(300);
  
  return {
    columns: mockColumns,
    data_preview: mockDataPreview,
    total_rows: mockTotalRows,
  };
}

export async function getData(): Promise<{
  data: Record<string, any>[];
  columns: ColumnInfoAPI[];
  total_rows: number;
}> {
  await delay(400);
  
  return {
    data: mockDataPreview,
    columns: mockColumns,
    total_rows: mockTotalRows,
  };
}

export async function cleanData(request: CleanRequest): Promise<CleanResponse> {
  await delay(600);

  let message = '';
  
  switch (request.action) {
    case 'drop_column':
      mockColumns = mockColumns.filter(c => c.name !== request.column);
      message = `Dropped column "${request.column}"`;
      break;
    case 'fill_missing':
      const col = mockColumns.find(c => c.name === request.column);
      if (col) {
        const prevMissing = col.missing;
        col.missing = 0;
        message = `Filled ${prevMissing} missing values in "${request.column}" with ${request.fill_method}`;
      }
      break;
    case 'remove_outliers':
      const removed = Math.floor(randomBetween(5, 25));
      mockTotalRows -= removed;
      message = `Removed ${removed} outliers from "${request.column}"`;
      break;
    case 'drop_missing_rows':
      const droppedRows = Math.floor(randomBetween(10, 50));
      mockTotalRows -= droppedRows;
      mockColumns.forEach(c => c.missing = 0);
      message = `Dropped ${droppedRows} rows with missing values`;
      break;
    case 'drop_duplicates':
      const dups = Math.floor(randomBetween(5, 30));
      mockTotalRows -= dups;
      message = `Removed ${dups} duplicate rows`;
      break;
  }

  return {
    success: true,
    message,
    rows: mockTotalRows,
    columns: mockColumns,
    data_preview: mockDataPreview,
  };
}

export async function resetData(): Promise<CleanResponse> {
  await delay(400);
  
  mockColumns = [...MOCK_COLUMNS];
  mockDataPreview = [...MOCK_DATA_PREVIEW];
  mockTotalRows = 891;

  return {
    success: true,
    message: 'Data reset to original state',
    rows: mockTotalRows,
    columns: mockColumns,
    data_preview: mockDataPreview,
  };
}

export async function undoData(): Promise<CleanResponse> {
  await delay(300);

  return {
    success: true,
    message: 'Undid last operation',
    rows: mockTotalRows,
    columns: mockColumns,
    data_preview: mockDataPreview,
  };
}

export async function createFeature(name: string, formula: string): Promise<CleanResponse> {
  await delay(500);

  const newCol: ColumnInfoAPI = {
    name,
    dtype: 'float64',
    missing: 0,
    unique: Math.floor(randomBetween(50, 200)),
    stats: {
      mean: randomBetween(10, 100),
      median: randomBetween(10, 100),
      std: randomBetween(5, 30),
      min: randomBetween(0, 10),
      max: randomBetween(100, 200),
    },
  };

  mockColumns.push(newCol);

  return {
    success: true,
    message: `Created feature "${name}" using formula: ${formula}`,
    rows: mockTotalRows,
    columns: mockColumns,
    data_preview: mockDataPreview,
  };
}

/**
 * Train a machine learning model (MOCK with progress simulation)
 */
export async function trainModel(
  request: TrainRequest,
  onProgress?: (step: string, progress: number) => void
): Promise<TrainResponse> {
  const steps = [
    { step: 'Validating data...', progress: 10 },
    { step: 'Preprocessing features...', progress: 25 },
    { step: 'Encoding categorical variables...', progress: 40 },
    { step: `Training ${request.model_type}...`, progress: 60 },
    { step: 'Cross-validating...', progress: 80 },
    { step: 'Computing metrics...', progress: 95 },
    { step: 'Training complete!', progress: 100 },
  ];

  for (const { step, progress } of steps) {
    onProgress?.(step, progress);
    await delay(300 + Math.random() * 200);
  }

  const isClassification = request.task_type === 'classification';
  
  // Generate realistic metrics based on model type
  const modelBonus = {
    xgb: 0.05,
    rf: 0.03,
    gb: 0.04,
    tree: -0.02,
    linear: 0,
    svm: 0.02,
    knn: -0.01,
    ridge: 0,
    lasso: -0.01,
  }[request.model_type] || 0;

  const baseAccuracy = 0.82 + modelBonus;
  
  const metrics = isClassification ? {
    accuracy: baseAccuracy + randomBetween(-0.05, 0.05),
    precision: baseAccuracy - 0.02 + randomBetween(-0.03, 0.03),
    recall: baseAccuracy - 0.03 + randomBetween(-0.03, 0.03),
    f1: baseAccuracy - 0.025 + randomBetween(-0.03, 0.03),
    auc: baseAccuracy + 0.02 + randomBetween(-0.02, 0.02),
    train_score: baseAccuracy + 0.05 + randomBetween(-0.02, 0.02),
    cv_mean: request.use_cv ? baseAccuracy + randomBetween(-0.03, 0.03) : undefined,
    cv_std: request.use_cv ? randomBetween(0.02, 0.05) : undefined,
  } : {
    r2: 0.75 + modelBonus + randomBetween(-0.1, 0.1),
    mae: randomBetween(2, 8),
    rmse: randomBetween(3, 12),
    train_score: 0.8 + randomBetween(-0.05, 0.1),
    cv_mean: request.use_cv ? 0.73 + randomBetween(-0.05, 0.05) : undefined,
    cv_std: request.use_cv ? randomBetween(0.02, 0.06) : undefined,
  };

  // Generate confusion matrix for classification
  const confusionMatrix = isClassification ? [
    [Math.floor(randomBetween(100, 150)), Math.floor(randomBetween(10, 30))],
    [Math.floor(randomBetween(15, 35)), Math.floor(randomBetween(80, 120))],
  ] : undefined;

  // Generate feature importance
  const featureImportance = request.features.map(name => ({
    name,
    importance: randomBetween(0.02, 0.3),
  })).sort((a, b) => b.importance - a.importance);

  // Generate ROC curve data for classification
  const rocData = isClassification ? Array.from({ length: 20 }, (_, i) => ({
    fpr: i / 19,
    tpr: Math.min(1, (i / 19) ** 0.5 + randomBetween(-0.05, 0.05)),
  })) : undefined;

  // Generate PR curve data for classification
  const prData = isClassification ? Array.from({ length: 20 }, (_, i) => ({
    recall: i / 19,
    precision: Math.max(0.3, 1 - (i / 19) * 0.5 + randomBetween(-0.1, 0.1)),
  })) : undefined;

  // Generate predictions sample
  const predictions = Array.from({ length: 50 }, () => {
    const actual = isClassification ? Math.round(Math.random()) : randomBetween(10, 100);
    const predicted = isClassification 
      ? (Math.random() > 0.15 ? actual : 1 - actual)
      : actual + randomBetween(-15, 15);
    return { actual, predicted };
  });

  // Generate tree rules for decision tree
  const treeRules = request.model_type === 'tree' ? `
Decision Tree Rules:
├── If age <= 35.5
│   ├── If income <= 45000
│   │   └── Class: 0 (samples: 45)
│   └── If income > 45000
│       ├── If transactions <= 20
│       │   └── Class: 0 (samples: 23)
│       └── If transactions > 20
│           └── Class: 1 (samples: 67)
└── If age > 35.5
    ├── If score <= 70.0
    │   └── Class: 0 (samples: 31)
    └── If score > 70.0
        └── Class: 1 (samples: 89)
  `.trim() : undefined;

  return {
    success: true,
    message: `${request.model_type} trained successfully`,
    metrics,
    confusion_matrix: confusionMatrix,
    feature_importance: featureImportance,
    predictions,
    roc_data: rocData,
    pr_data: prData,
    tree_rules: treeRules,
  };
}

export async function autoTune(request: Omit<TrainRequest, 'params'>): Promise<{
  best_params: Record<string, any>;
  best_score: number;
}> {
  await delay(3000);

  const paramsByModel: Record<string, Record<string, any>> = {
    rf: { n_estimators: 150, max_depth: 12, min_samples_split: 5 },
    xgb: { n_estimators: 200, learning_rate: 0.05, max_depth: 8 },
    svm: { C: 1.5, kernel: 'rbf', gamma: 'auto' },
    linear: { C: 0.8, max_iter: 200 },
    gb: { n_estimators: 180, learning_rate: 0.08, max_depth: 6 },
  };

  return {
    best_params: paramsByModel[request.model_type] || { n_estimators: 100 },
    best_score: 0.85 + randomBetween(-0.05, 0.08),
  };
}

export async function healthCheck(): Promise<{ status: string; message: string }> {
  await delay(100);
  return { status: 'mock', message: 'Running in Mock Mode (no backend required)' };
}
