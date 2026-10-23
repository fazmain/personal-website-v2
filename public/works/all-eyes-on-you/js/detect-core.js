// Person detection. Runs inside a worker (detect-worker.js) or, if workers fail, on the main thread.
// Returns raw people in camera-image pixels; observe.js turns them into positions in the room.
//
//   pose   MediaPipe PoseLandmarker: up to N skeletons. Gives the head exactly and which way the face turns.
//   object EfficientDet person boxes: better for far-away people and crowds, no face direction.
//   motion frame differencing: needs no model at all, the last resort when nothing else loads.

let vision = null;
let task = null;
let kind = null;
let motion = null;

export async function initDetector(opts) {
  kind = opts.kind;
  if (kind === 'motion') { motion = new MotionDetector(); return { kind, delegate: 'cpu' }; }
  vision = vision || await import(opts.base + 'lib/mediapipe/vision_bundle.mjs');
  const files = await vision.FilesetResolver.forVisionTasks(opts.base + 'lib/mediapipe');
  const build = async (delegate) => {
    if (kind === 'pose') {
      return vision.PoseLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: `${opts.base}models/pose_landmarker_${opts.model === 'full' ? 'full' : 'lite'}.task`, delegate },
        runningMode: 'VIDEO', numPoses: opts.numPoses,
        minPoseDetectionConfidence: opts.minConf, minPosePresenceConfidence: opts.minConf, minTrackingConfidence: 0.5,
      });
    }
    return vision.ObjectDetector.createFromOptions(files, {
      baseOptions: { modelAssetPath: `${opts.base}models/efficientdet_lite0.tflite`, delegate },
      runningMode: 'VIDEO', categoryAllowlist: ['person'], scoreThreshold: Math.max(0.3, opts.minConf - 0.1), maxResults: opts.numPoses * 2,
    });
  };
  try { task = await build('GPU'); return { kind, delegate: 'gpu' }; }
  catch (e) { task = await build('CPU'); return { kind, delegate: 'cpu' }; }
}

let lastTs = 0;
export function detect(frame, w, h, ts) {
  if (kind === 'motion') return motion.detect(frame, w, h);
  ts = Math.max(ts, lastTs + 1); lastTs = ts;       // MediaPipe needs strictly increasing timestamps
  const res = task.detectForVideo(frame, ts);
  if (kind === 'pose') {
    return (res.landmarks || []).map(lm => ({
      kp: lm.map(p => [p.x * w, p.y * h, p.visibility ?? 1]),
    }));
  }
  return (res.detections || []).map(d => ({
    box: [d.boundingBox.originX, d.boundingBox.originY, d.boundingBox.width, d.boundingBox.height],
    score: d.categories?.[0]?.score ?? 0.5,
  }));
}

// ---- last resort: things that move
class MotionDetector {
  constructor() { this.W = 96; this.H = 54; this.bg = null; this.canvas = null; }
  detect(frame, w, h) {
    const { W, H } = this;
    if (!this.canvas) {
      this.canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }
    this.ctx.drawImage(frame, 0, 0, W, H);
    const px = this.ctx.getImageData(0, 0, W, H).data;
    const g = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) g[i] = px[i * 4] * 0.3 + px[i * 4 + 1] * 0.59 + px[i * 4 + 2] * 0.11;
    if (!this.bg) { this.bg = g; return []; }
    const col = new Int32Array(W), top = new Int32Array(W).fill(H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (Math.abs(g[i] - this.bg[i]) > 22) { col[x]++; if (y < top[x]) top[x] = y; }
      this.bg[i] += (g[i] - this.bg[i]) * 0.03;   // slowly absorb whatever stops moving
    }
    const people = [];
    for (let x = 0; x < W;) {
      if (col[x] < 3) { x++; continue; }
      let x1 = x, t = H, n = 0;
      while (x1 < W && col[x1] >= 2) { t = Math.min(t, top[x1]); n += col[x1]; x1++; }
      const bw = x1 - x;
      if (bw >= 3 && n > 25) {
        const fill = n / (bw * (H - t));
        people.push({ box: [x / W * w, t / H * h, bw / W * w, (H - t) / H * h], score: Math.min(1, 0.4 + fill), motion: true });
      }
      x = x1;
    }
    return people;
  }
}
