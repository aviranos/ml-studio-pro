/**
 * ML-Lab API Service - PRODUCTION MODE
 * Connects to FastAPI Python Backend at localhost:8000
 */

const API_BASE_URL = 'http://localhost:8000';

// Type definitions
export interface UploadResponse {
  success: boolean;
  message: string;
  filename: string;
  rows: number;
  columns: string[];
}

export interface ColumnStats {
  mean?: number;
  median?: number;
  std?: number;
  min?: number;
  max?: number;
  mode?: string | number;
}

export interface ColumnInfoAPI {
  name: string;
  dtype: string;
  missing: number;
  unique: number;
  stats?: ColumnStats;
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

// Error handling
export class APIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new APIError(errorData.detail || `HTTP ${response.status}`, response.status);
  }
  return response.json();
}

// Helper to check if error is due to offline backend
export function isOfflineError(err: unknown): boolean {
  return err instanceof TypeError && err.message.includes('fetch');
}

// API Functions
export async function healthCheck(): Promise<{ status: string; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  } catch {
    return { status: 'offline', message: 'Backend is offline' };
  }
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse(response);
}

export async function uploadFromURL(url: string): Promise<UploadResponse> {
  const response = await fetch(`${API_BASE_URL}/upload-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  return handleResponse(response);
}

export async function getColumns(): Promise<ColumnsResponse> {
  const response = await fetch(`${API_BASE_URL}/columns`);
  return handleResponse(response);
}

export async function getData() {
  const result = await getColumns();
  return { data: result.data_preview, columns: result.columns, total_rows: result.total_rows };
}

export async function cleanData(request: CleanRequest): Promise<CleanResponse> {
  const response = await fetch(`${API_BASE_URL}/clean`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  return handleResponse(response);
}

export async function resetData(): Promise<CleanResponse> {
  const response = await fetch(`${API_BASE_URL}/reset`, { method: 'POST' });
  return handleResponse(response);
}

export async function undoData(): Promise<CleanResponse> {
  const response = await fetch(`${API_BASE_URL}/undo`, { method: 'POST' });
  return handleResponse(response);
}

export async function createFeature(name: string, formula: string): Promise<CleanResponse> {
  const response = await fetch(`${API_BASE_URL}/create-feature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, formula }),
  });

  return handleResponse(response);
}

export async function trainModel(request: TrainRequest): Promise<TrainResponse> {
  const response = await fetch(`${API_BASE_URL}/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  return handleResponse(response);
}

export async function autoTune(request: Omit<TrainRequest, 'params'>) {
  throw new APIError('Auto-tune not yet implemented', 501);
}
