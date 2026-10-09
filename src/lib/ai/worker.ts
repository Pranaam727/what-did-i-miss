/* eslint-disable @typescript-eslint/no-explicit-any */
import { pipeline, env } from '@xenova/transformers';

// Configure environment for strict client-side browser execution
env.allowLocalModels = false;
env.useBrowserCache = true;

// Define pipeline singleton in the Web Worker
class SummarizerPipelineSingleton {
  static task = 'summarization' as const;
  static model = 'Xenova/distilbart-cnn-6-12';
  static instance: any = null;

  static async getInstance(progress_callback?: (progress: any) => void) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model, {
        progress_callback,
      });
    }
    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event: MessageEvent) => {
  const { action, text, maxTokens = 120 } = event.data;

  if (action === 'init') {
    try {
      self.postMessage({ status: 'progress', message: 'Initializing local model weights...' });
      await SummarizerPipelineSingleton.getInstance((data: any) => {
        self.postMessage({
          status: 'progress',
          progress: data.progress,
          file: data.file,
          message: data.status ? `Loading: ${data.status} ${data.file || ''}` : 'Loading model...',
        });
      });
      self.postMessage({ status: 'ready', message: 'Local ONNX model loaded into browser memory.' });
    } catch (err: any) {
      self.postMessage({ status: 'error', error: err?.message || 'Failed to initialize local model' });
    }
    return;
  }

  if (action === 'summarize') {
    try {
      self.postMessage({ status: 'progress', message: 'Loading local summarization pipeline...' });
      const summarizer = await SummarizerPipelineSingleton.getInstance((data: any) => {
        self.postMessage({
          status: 'progress',
          progress: data.progress,
          file: data.file,
          message: data.status ? `Fetching local weights: ${data.file || ''}` : 'Preparing model...',
        });
      });

      self.postMessage({ status: 'progress', message: 'Running local in-browser WASM inference...' });

      // Run local inference
      const result = await summarizer(text, {
        max_new_tokens: maxTokens,
        min_new_tokens: 30,
        temperature: 0.7,
      });

      const generatedSummary = Array.isArray(result)
        ? result[0]?.summary_text || result[0]?.generated_text || ''
        : (result as any)?.summary_text || '';

      self.postMessage({
        status: 'summary_complete',
        summary: generatedSummary,
      });
    } catch (err: any) {
      console.warn('Local WASM inference encountered an issue:', err);
      self.postMessage({
        status: 'error',
        error: err?.message || 'Local AI inference fallback activated',
      });
    }
  }
});
