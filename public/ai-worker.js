/**
 * ai-worker.js - C³ MindLoop Local AI Web Worker
 *
 * Architecture:
 *  - Runs entirely inside a browser Web Worker (off the main thread).
 *  - Loaded lazily: only instantiated when the developer explicitly clicks "Load Model".
 *  - Uses Transformers.js via ESM CDN to avoid Next.js bundler conflicts.
 *  - Zero bytes of user data leave the browser. Models are cached by the browser after first load.
 *
 * Message Protocol (main thread → worker):
 *  { type: 'load' }
 *    → Triggers model download + initialization. Emits 'progress' and 'ready' responses.
 *
 *  { type: 'infer', task: 'json-explain' | 'regex-explain', payload: string }
 *    → Runs inference. Emits 'result' or 'error' response.
 *
 * Message Protocol (worker → main thread):
 *  { type: 'progress', stage: string, progress: number }
 *  { type: 'ready' }
 *  { type: 'result', task: string, output: string }
 *  { type: 'error', message: string }
 */

// Use ESM import from CDN - avoids bundler complications with Web Workers in Next.js.
// The browser caches this after the first load.
const TRANSFORMERS_CDN = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3/dist/transformers.min.js';

let pipeline = null;
let isReady = false;

/**
 * Progress callback forwarded to the main thread so the UI can show
 * a download progress bar.
 */
function onProgress(progressEvent) {
  if (progressEvent.status === 'progress') {
    self.postMessage({
      type: 'progress',
      stage: progressEvent.file || 'Downloading model weights',
      progress: Math.round((progressEvent.loaded / progressEvent.total) * 100) || 0,
    });
  } else if (progressEvent.status === 'initiate') {
    self.postMessage({
      type: 'progress',
      stage: `Initializing: ${progressEvent.file || 'model'}`,
      progress: 0,
    });
  } else if (progressEvent.status === 'done') {
    self.postMessage({
      type: 'progress',
      stage: `Loaded: ${progressEvent.file || 'component'}`,
      progress: 100,
    });
  }
}

/**
 * Load the model. We use Xenova/flan-t5-small (quantized int8 ~65 MB) -
 * the smallest model that can do useful text2text generation for developer tasks.
 */
async function loadModel() {
  try {
    self.postMessage({ type: 'progress', stage: 'Loading Transformers.js runtime...', progress: 0 });

    // Dynamic ESM import from CDN
    const { pipeline: createPipeline, env } = await import(TRANSFORMERS_CDN);

    // Disable local model cache path - worker doesn't have FS access
    env.allowLocalModels = false;

    self.postMessage({ type: 'progress', stage: 'Downloading model (first load only, cached after)...', progress: 5 });

    pipeline = await createPipeline(
      'text2text-generation',
      'Xenova/flan-t5-small',
      { progress_callback: onProgress, quantized: true }
    );

    isReady = true;
    self.postMessage({ type: 'ready' });
  } catch (err) {
    self.postMessage({
      type: 'error',
      message: `Model load failed: ${err.message || 'Unknown error'}. Check your network connection.`,
    });
  }
}

/**
 * Run inference for a specific developer task.
 */
async function runInference(task, payload) {
  if (!isReady || !pipeline) {
    self.postMessage({ type: 'error', message: 'Model is not loaded yet. Load it first.' });
    return;
  }

  try {
    let prompt = '';

    if (task === 'regex-explain') {
      prompt = `Explain what this regular expression does in plain English, briefly:\n/${payload}/`;
    } else if (task === 'json-explain') {
      prompt = `Briefly describe the structure of this JSON object in one sentence:\n${payload.slice(0, 500)}`;
    } else if (task === 'regex-suggest') {
      prompt = `Generate a JavaScript regular expression for: ${payload}. Return only the pattern without delimiters.`;
    } else {
      prompt = payload;
    }

    const result = await pipeline(prompt, {
      max_new_tokens: 120,
      temperature: 0.3,
      do_sample: false,
    });

    const output = Array.isArray(result)
      ? result[0]?.generated_text || result[0]?.translation_text || ''
      : result?.generated_text || '';

    self.postMessage({ type: 'result', task, output: output.trim() });
  } catch (err) {
    self.postMessage({ type: 'error', message: `Inference failed: ${err.message || 'Unknown error'}` });
  }
}

// ── Message Handler ──────────────────────────────────────────────────────────

self.addEventListener('message', (event) => {
  const { type, task, payload } = event.data || {};

  switch (type) {
    case 'load':
      loadModel();
      break;
    case 'infer':
      runInference(task, payload);
      break;
    default:
      self.postMessage({ type: 'error', message: `Unknown message type: ${type}` });
  }
});
