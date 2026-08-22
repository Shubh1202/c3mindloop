// Pipeline execution engine
// Runs steps sequentially, feeding each step's output into the next step's input.
// 100% client-side - no network calls.

import type { PipelineStep, StepResult, PipelineRunResult, SerializedPipeline } from './types';
import { ADAPTER_MAP } from './adapters';

// ── Run a single step ────────────────────────────────────────────────────────

export async function runStep(step: PipelineStep, input: string): Promise<StepResult> {
  const adapter = ADAPTER_MAP[step.adapterId];
  const start = performance.now();

  if (!adapter) {
    return {
      stepId: step.id,
      output: '',
      error: `Unknown adapter: ${step.adapterId}`,
      durationMs: 0,
    };
  }

  try {
    const result = await Promise.resolve(adapter.process(input, step.config));
    return {
      stepId: step.id,
      output: result,
      error: null,
      durationMs: Math.round(performance.now() - start),
    };
  } catch (e) {
    return {
      stepId: step.id,
      output: '',
      error: e instanceof Error ? e.message : 'Processing failed.',
      durationMs: Math.round(performance.now() - start),
    };
  }
}

// ── Run the full pipeline ────────────────────────────────────────────────────

export async function runPipeline(
  steps: PipelineStep[],
  initialInput: string
): Promise<PipelineRunResult> {
  const results: StepResult[] = [];
  let current = initialInput;
  let hasError = false;

  for (const step of steps) {
    if (hasError) {
      // Skip remaining steps after first error — output stays empty
      results.push({ stepId: step.id, output: '', error: 'Skipped: previous step failed.', durationMs: 0 });
      continue;
    }
    const result = await runStep(step, current);
    results.push(result);
    if (result.error) {
      hasError = true;
    } else {
      current = result.output;
    }
  }

  return {
    steps: results,
    finalOutput: hasError ? '' : current,
    hasError,
  };
}

// ── URL serialization ────────────────────────────────────────────────────────

export function serializePipeline(steps: PipelineStep[], input: string): string {
  const payload: SerializedPipeline = {
    steps: steps.map((s) => ({ a: s.adapterId, c: s.config })),
    input,
  };
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

export function deserializePipeline(encoded: string): SerializedPipeline | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    const parsed = JSON.parse(json) as SerializedPipeline;
    if (!Array.isArray(parsed.steps)) return null;
    return parsed;
  } catch {
    return null;
  }
}
