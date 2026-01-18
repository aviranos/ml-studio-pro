/**
 * ML-Lab API Service
 * Connects to local FastAPI backend at http://localhost:8000
 * 
 * IMPORTANT: This requires a running Python backend server.
 * Start the server with: uvicorn main:app --reload --port 8000
 */

const API_BASE_URL = 'http://localhost:8000';

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

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new APIError(response.status, errorText || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Upload a CSV file to the backend
 */
export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse<UploadResponse>(response);
}

/**
 * Upload CSV from URL
 */
export async function uploadFromURL(url: string): Promise<UploadResponse> {
  const response = await fetch(`${API_BASE_URL}/upload-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  return handleResponse<UploadResponse>(response);
}

/**
 * Get column information and data preview
 */
export async function getColumns(): Promise<ColumnsResponse> {
  const response = await fetch(`${API_BASE_URL}/columns`);
  return handleResponse<ColumnsResponse>(response);
}

/**
 * Get full data for the Lab screen
 */
export async function getData(): Promise<{
  data: Record<string, any>[];
  columns: ColumnInfoAPI[];
  total_rows: number;
}> {
  const response = await fetch(`${API_BASE_URL}/data`);
  return handleResponse(response);
}

/**
 * Perform data cleaning operation
 */
export async function cleanData(request: CleanRequest): Promise<CleanResponse> {
  const response = await fetch(`${API_BASE_URL}/clean`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  return handleResponse<CleanResponse>(response);
}

/**
 * Reset data to original state
 */
export async function resetData(): Promise<CleanResponse> {
  const response = await fetch(`${API_BASE_URL}/reset`, {
    method: 'POST',
  });

  return handleResponse<CleanResponse>(response);
}

/**
 * Undo last data operation
 */
export async function undoData(): Promise<CleanResponse> {
  const response = await fetch(`${API_BASE_URL}/undo`, {
    method: 'POST',
  });

  return handleResponse<CleanResponse>(response);
}

/**
 * Create a new feature column
 */
export async function createFeature(name: string, formula: string): Promise<CleanResponse> {
  const response = await fetch(`${API_BASE_URL}/feature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, formula }),
  });

  return handleResponse<CleanResponse>(response);
}

/**
 * Train a machine learning model
 */
export async function trainModel(request: TrainRequest): Promise<TrainResponse> {
  const response = await fetch(`${API_BASE_URL}/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  return handleResponse<TrainResponse>(response);
}

/**
 * Get training progress (for streaming updates)
 */
export async function* getTrainingProgress(): AsyncGenerator<{ step: string; progress: number }> {
  const response = await fetch(`${API_BASE_URL}/train/progress`, {
    headers: { Accept: 'text/event-stream' },
  });

  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        yield data;
      }
    }
  }
}

/**
 * Auto-tune model hyperparameters
 */
export async function autoTune(request: Omit<TrainRequest, 'params'>): Promise<{
  best_params: Record<string, any>;
  best_score: number;
}> {
  const response = await fetch(`${API_BASE_URL}/auto-tune`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  return handleResponse(response);
}

/**
 * Check if backend is available
 */
export async function healthCheck(): Promise<{ status: string; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    return handleResponse(response);
  } catch {
    return { status: 'offline', message: 'Backend is not running' };
  }
}
