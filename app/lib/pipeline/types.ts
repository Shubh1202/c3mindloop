// Pipeline engine types
// All processing is 100% client-side - no data leaves the browser.

export type AdapterId =
  | 'base64-encode'
  | 'base64-decode'
  | 'json-format'
  | 'json-minify'
  | 'jwt-inspect'
  | 'regex-filter'
  | 'hash-sha256'
  | 'sql-to-json';

export interface AdapterConfig {
  // base64-encode
  urlSafe?: boolean;
  // json-format
  indent?: 2 | 4;
  // regex-filter
  pattern?: string;
  flags?: string;
  // hash-sha256 — no extra config needed for SHA-256 only adapter
}

export interface PipelineStep {
  id: string; // unique step instance id (nanoid or Date.now())
  adapterId: AdapterId;
  config: AdapterConfig;
}

export interface StepResult {
  stepId: string;
  output: string;
  error: string | null;
  durationMs: number;
}

export interface PipelineRunResult {
  steps: StepResult[];
  finalOutput: string;
  hasError: boolean;
}

// Minimal shape serialized into URL hash for shareable links
export interface SerializedPipeline {
  steps: Array<{
    a: AdapterId;
    c: AdapterConfig;
  }>;
  input: string;
}
