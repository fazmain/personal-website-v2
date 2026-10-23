// Where things are in the room.
// World: metres, origin at the centre of the picture, x right (as the viewer sees it),
// y up, z out of the screen towards the viewer. The eyes live on the plane z = 0.

const D2R = Math.PI / 180;

export function makeRig(cfg, pxW, pxH, imageAspect = 16 / 9) {
  const W = cfg.screenWidthM;
  const H = W * pxH / pxW;
  let camY = cfg.cameraY;
  if (camY === 'top') camY = H / 2 + 0.03;
  else if (camY === 'bottom') camY = -H / 2 - 0.03;
  const tanH = Math.tan(cfg.cameraHFovDeg * D2R / 2);
  const tilt = cfg.cameraTiltDeg * D2R;
  return {
    W, H, pxW, pxH,
    pxPerM: pxW / W,
    cam: { x: cfg.cameraX, y: camY, z: 0 },
    tanH, tanV: tanH / imageAspect, imageAspect,
    cosT: Math.cos(tilt), sinT: Math.sin(tilt),
    flip: cfg.flipX ? -1 : 1,
  };
}

export function setImageAspect(rig, aspect) {
  if (!(aspect > 0.2 && aspect < 5)) return;
  rig.imageAspect = aspect;
  rig.tanV = rig.tanH / aspect;
}

// Focal length in pixels for an image `imgW` pixels wide.
export function focalPx(rig, imgW) { return imgW / 2 / rig.tanH; }

// Raw camera image point (u,v in 0..1, v down) at depth z (metres along the camera axis) -> world.
export function imageToWorld(rig, u, v, z) {
  const xn = (u - 0.5) * 2 * rig.tanH;
  const yn = (0.5 - v) * 2 * rig.tanV;
  // camera basis: right = (flip,0,0); up = (0,cosT,sinT); forward = (0,-sinT,cosT)
  return {
    x: rig.cam.x + rig.flip * xn * z,
    y: rig.cam.y + yn * z * rig.cosT - z * rig.sinT,
    z: rig.cam.z + yn * z * rig.sinT + z * rig.cosT,
  };
}

export function worldToImage(rig, p) {
  const dx = p.x - rig.cam.x, dy = p.y - rig.cam.y, dz = p.z - rig.cam.z;
  const depth = -dy * rig.sinT + dz * rig.cosT;
  const upc = dy * rig.cosT + dz * rig.sinT;
  const xn = dx * rig.flip / depth, yn = upc / depth;
  return { u: 0.5 + xn / (2 * rig.tanH), v: 0.5 - yn / (2 * rig.tanV), depth };
}

// Canvas pixel <-> world point on the screen plane.
export function screenToWorld(rig, sx, sy) {
  return { x: (sx / rig.pxW - 0.5) * rig.W, y: (0.5 - sy / rig.pxH) * rig.H, z: 0 };
}
export function worldToScreen(rig, p) {
  return { x: (p.x / rig.W + 0.5) * rig.pxW, y: (0.5 - p.y / rig.H) * rig.pxH };
}

export const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth01 = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

// Small deterministic PRNG so layouts can be reproduced with ?seed=.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
