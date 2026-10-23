// Runs the detector off the main thread so the eyes never stutter while a frame is analysed.

// MediaPipe loads its wasm glue with importScripts(), which module workers do not allow.
// A synchronous fetch + global eval does the same job.
self.importScripts = (...urls) => {
  for (const url of urls) {
    const x = new XMLHttpRequest();
    x.open('GET', url, false);
    x.send();
    if (x.status >= 400) throw new Error(`importScripts ${url}: ${x.status}`);
    (0, eval)(x.responseText + `\n//# sourceURL=${url}`);
  }
};

import { initDetector, detect } from './detect-core.js';

let ready = false;
self.onmessage = async ({ data }) => {
  if (data.type === 'init') {
    try {
      const info = await initDetector(data.opts);
      ready = true;
      self.postMessage({ type: 'ready', ...info });
    } catch (e) {
      self.postMessage({ type: 'error', message: String(e?.message || e) });
    }
    return;
  }
  if (data.type === 'frame') {
    const { bitmap, ts } = data;
    try {
      if (!ready) return;
      const t0 = performance.now();
      const people = detect(bitmap, bitmap.width, bitmap.height, ts);
      self.postMessage({ type: 'result', ts, people, w: bitmap.width, h: bitmap.height, ms: performance.now() - t0 });
    } catch (e) {
      self.postMessage({ type: 'result', ts, people: [], w: bitmap.width, h: bitmap.height, ms: 0, error: String(e?.message || e) });
    } finally {
      bitmap.close();
    }
  }
};
