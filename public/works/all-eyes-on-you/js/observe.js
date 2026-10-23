// Raw detections (camera pixels) -> observations in the room (metres).
// Distance comes from body proportions: people are roughly the same size, so the smaller
// they look, the farther away they are. Several measures are tried and the LARGEST scale wins,
// because turning sideways or bending only ever makes a body part look shorter, never longer.

import { imageToWorld, focalPx } from './geometry.js';

const V = 0.5;   // landmark visibility threshold
const vis = p => p && p[2] > V;
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.min(a[2], b[2])];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// Real-world sizes in metres (adult averages; children read as a little farther away, which is harmless)
const SHOULDERS = 0.36, TORSO = 0.5, EARS = 0.145, EYES = 0.095, BODY = 1.7, BODY_W = 0.5;

export function poseToObs(person, rig, w, h) {
  const k = person.kp;
  if (!k || k.length < 25) return null;
  const nose = k[0], eyeL = k[2], eyeR = k[5], earL = k[7], earR = k[8];
  const shL = k[11], shR = k[12], hipL = k[23], hipR = k[24];

  const scales = [];
  if (vis(shL) && vis(shR)) scales.push(dist(shL, shR) / SHOULDERS);
  if (vis(shL) && vis(shR) && vis(hipL) && vis(hipR)) scales.push(dist(mid(shL, shR), mid(hipL, hipR)) / TORSO);
  if (vis(earL) && vis(earR)) scales.push(dist(earL, earR) / EARS);
  if (vis(k[3]) && vis(k[6])) scales.push(dist(k[3], k[6]) / EYES);
  if (!scales.length) return null;
  const pxPerM = Math.max(...scales);

  // the point the eyes should look at: the viewer's eyes
  let head;
  if (vis(eyeL) && vis(eyeR)) head = mid(eyeL, eyeR);
  else if (vis(nose)) head = [nose[0], nose[1] - 0.03 * pxPerM, nose[2]];
  else if (vis(earL) || vis(earR)) { const e = vis(earL) && vis(earR) ? mid(earL, earR) : vis(earL) ? earL : earR; head = [e[0], e[1] - 0.01 * pxPerM, e[2]]; }
  else if (vis(shL) && vis(shR)) { const s = mid(shL, shR); head = [s[0], s[1] - 0.27 * pxPerM, s[2]]; }
  else return null;

  // which way the face is turned: nose between the ears = facing the wall
  let facing = null;
  if (vis(earL) && vis(earR) && nose) {
    const m = mid(earL, earR), half = Math.max(dist(earL, earR) / 2, 1);
    facing = nose[2] > 0.6 ? Math.max(-1, 1 - 1.4 * Math.abs(nose[0] - m[0]) / half) : -1;
  } else if (!vis(nose) && (vis(shL) || vis(shR))) facing = -1;   // back turned

  const z = focalPx(rig, w) / pxPerM;
  const u = head[0] / w, v = head[1] / h;
  const conf = Math.max(nose?.[2] ?? 0, ((shL?.[2] ?? 0) + (shR?.[2] ?? 0)) / 2);
  const p = imageToWorld(rig, u, v, z);
  const xs = k.filter(vis).map(q => q[0]), ys = k.filter(vis).map(q => q[1]);
  return { ...p, u, v, conf, facing, size: pxPerM / w, kp: k,
    box: [Math.min(...xs) / w, Math.min(...ys) / h, (Math.max(...xs) - Math.min(...xs)) / w, (Math.max(...ys) - Math.min(...ys)) / h] };
}

export function boxToObs(person, rig, w, h) {
  const [x, y, bw, bh] = person.box;
  if (!(bw > 2 && bh > 2)) return null;
  const cutBottom = y + bh > h * 0.97;          // feet out of frame: height says nothing
  const scales = [bw / BODY_W * 0.8];            // widths vary (arms, bags): trust them less
  if (!cutBottom) scales.push(bh / BODY);
  else scales.push(bh / (BODY * 0.75));
  let pxPerM = Math.max(...scales);
  if (person.motion) pxPerM = bw / 0.6;          // motion blobs: only width means anything
  const z = focalPx(rig, w) / pxPerM;
  const u = (x + bw / 2) / w, v = Math.min(y + 0.12 * pxPerM, y + bh * 0.5) / h;
  const p = imageToWorld(rig, u, v, z);
  return { ...p, u, v, conf: person.score, facing: null, size: pxPerM / w, box: [x / w, y / h, bw / w, bh / h] };
}

export function toObservations(people, rig, w, h) {
  const out = [];
  for (const p of people || []) {
    const o = p.kp ? poseToObs(p, rig, w, h) : boxToObs(p, rig, w, h);
    if (o) out.push(o);
  }
  return out;
}
