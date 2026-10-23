// WebGL2 renderer. Every eye is one instanced quad, painted entirely in the fragment shader:
// skin, socket shading, lid crease, lashes, a spherical eyeball with a foreshortened iris,
// pupil, wet lid line, a window-shaped catchlight, and a tiny curved reflection of the viewer.

const FLOATS = 28;   // per-eye instance data: 7 x vec4

const VS = `#version 300 es
layout(location=0) in vec2 aCorner;
layout(location=1) in vec4 i0;   // cx, cy, r (px), rot
layout(location=2) in vec4 i1;   // gaze x, gaze y (world), lid, lower
layout(location=3) in vec4 i2;   // pupil, irisR, seed, aspect
layout(location=4) in vec4 i3;   // iris outer rgb, veins
layout(location=5) in vec4 i4;   // iris inner rgb, lashes
layout(location=6) in vec4 i5;   // skin rgb, light
layout(location=7) in vec4 i6;   // side, patch, reflect, -
uniform vec2 uRes;
out vec2 vP;
flat out vec2 vG;
flat out vec4 f1, f2, f3, f4, f5, f6;
void main() {
  float pr = i6.y;
  vec2 local = aCorner * vec2(pr, pr * 0.9);
  float c = cos(i0.w), s = sin(i0.w);
  vec2 rl = mat2(c, s, -s, c) * local;              // rotate in y-up space
  vec2 px = i0.xy + vec2(rl.x, -rl.y) * i0.z;        // screen is y-down
  gl_Position = vec4(px / uRes * 2.0 - 1.0, 0.0, 1.0);
  gl_Position.y = -gl_Position.y;
  vP = local;
  vG = mat2(c, -s, s, c) * i1.xy;                    // gaze into the eye's own frame
  f1 = i1; f2 = i2; f3 = i3; f4 = i4; f5 = i5; f6 = i6;
}`;

const FS = `#version 300 es
precision highp float;
in vec2 vP;
flat in vec2 vG;
flat in vec4 f1, f2, f3, f4, f5, f6;
uniform sampler2D uVideo;
uniform float uVideoOn, uTime, uReflect, uFlip;
out vec4 outColor;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float sstep(float a, float b, float x) { float t = clamp((x - a) / (b - a), 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
float band(float x, float c, float w) { float d = (x - c) / w; return exp(-d * d); }

void main() {
  vec2 p = vP;
  float side = f6.x, seed = f2.z, h = f2.w;
  float lid = f1.z, lower = f1.w;
  float xs = p.x * side;                              // < 0 towards the inner corner
  float aa = max(fwidth(p.y), 1e-4);
  float ax = abs(p.x);
  float env = max(1.0 - p.x * p.x, 0.0);

  // ---------- lids
  float up0 = h * pow(env, 0.72) * (1.0 + 0.10 * xs);
  float lo0 = -h * 0.78 * pow(env, 1.1) * (1.0 - 0.08 * xs);
  float meet = mix(lo0, up0, 0.3) - 0.03 * env;       // where the lids close
  float yL = mix(lo0, meet, clamp(lower, 0.0, 1.0));
  float yU = max(meet + (up0 - meet) * lid, yL);
  float inside = sstep(-aa, aa, yU - p.y) * sstep(-aa, aa, p.y - yL) * step(ax, 1.0);

  // ---------- eyeball
  vec3 ball = vec3(0.0);
  float irisM = 0.0;
  if (inside > 0.0) {
    float R = 0.92;
    vec3 n = normalize(vec3(p, sqrt(max(R * R - dot(p, p), 0.02))));
    vec3 g = normalize(vec3(vG, sqrt(max(1.0 - dot(vG, vG), 0.05))));
    vec3 tu = normalize(cross(vec3(0.0, 1.0, 0.0), g));
    vec3 tv = cross(g, tu);
    float irisS = f2.y / R;
    vec2 ip = vec2(dot(n, tu), dot(n, tv)) / irisS;
    float front = dot(n, g);
    float ir = length(ip);
    float aaI = aa / f2.y * 1.5;

    // sclera
    vec3 Ld = normalize(g + vec3(-0.25, 0.35, 0.5));                 // lit by the viewer, and a little from above
    vec3 sc = vec3(0.78, 0.74, 0.70) * (0.25 + 0.75 * pow(max(dot(n, Ld), 0.0), 1.3));
    sc *= 0.93 + 0.1 * fbm(p * 6.0 + seed);
    float corner = sstep(0.45, 1.0, ax);
    sc = mix(sc, vec3(0.80, 0.55, 0.50), corner * 0.35);
    float vn = abs(fbm(p * vec2(5.0, 9.0) + seed * 3.0) - 0.5);
    sc = mix(sc, vec3(0.62, 0.17, 0.15), sstep(0.03, 0.0, vn) * corner * f3.a * 0.7);
    sc = mix(sc, vec3(0.74, 0.40, 0.38), sstep(-0.8, -0.96, xs) * 0.85);   // caruncle

    // iris
    float th = atan(ip.y, ip.x);
    float fib = (sin(th * 23.0 + seed * 7.0 + 2.0 * sin(ir * 9.0 + seed))
               + 0.6 * sin(th * 51.0 + seed * 3.0 + 3.0 * ir)
               + 0.4 * sin(th * 97.0 + seed * 11.0 + 5.0 * ir)) * 0.5;
    float coll = 0.44 + 0.04 * sin(th * 7.0 + seed);
    vec3 iris = mix(f4.rgb, f3.rgb, sstep(coll - 0.06, coll + 0.1, ir));
    iris *= 0.8 + 0.24 * fib;
    iris += 0.14 * band(ir, coll, 0.035) * f4.rgb;
    float crypt = sstep(0.56, 0.74, fbm(ip * 4.5 + seed));
    iris *= 1.0 - 0.45 * crypt * sstep(0.3, 0.5, ir) * (1.0 - sstep(0.82, 0.95, ir));
    iris *= 1.0 - 0.8 * sstep(0.72, 1.0, ir);    // limbal ring
    iris *= 1.0 + 0.45 * clamp(dot(ip / (ir + 1e-4), -normalize(vec2(-0.55, 0.8) + vG)), 0.0, 1.0) * sstep(0.35, 0.85, ir);
    float pr = f2.x;
    iris *= 1.0 - 0.35 * band(ir, pr + 0.05, 0.04);   // pupillary ruff
    iris = mix(iris, vec3(0.012, 0.01, 0.012), 1.0 - sstep(pr - aaI, pr + aaI, ir));
    irisM = sstep(1.0 + aaI, 1.0 - aaI, ir) * step(0.0, front);
    ball = mix(sc, iris, irisM);

    // the viewer, tiny and bent, in the cornea
    if (uVideoOn > 0.5 && front > 0.0) {
      vec2 q = ip * (1.0 + 0.35 * ir * ir) * 0.42;                   // a convex mirror: wide and bent
      vec3 v = textureLod(uVideo, vec2(0.5 - q.x * uFlip, 0.5 - q.y * 1.4), 1.2).rgb;
      float l = dot(v, vec3(0.3, 0.59, 0.11));
      v = mix(vec3(l), v, 0.6);                                         // the cornea is not a colour photo
      float m = sstep(0.95, 0.15, ir) * f6.z * uReflect;
      ball = ball + pow(v, vec3(2.2)) * m * vec3(0.8, 0.9, 1.0) * (1.0 - 0.6 * irisM * (1.0 - sstep(f2.x + 0.1, f2.x, ir)));
    }

    // shadow of the upper lid, occlusion at the lower lid and corners, wet lower rim
    ball *= mix(0.22, 1.0, sstep(0.0, 0.5 * h, yU - p.y));
    ball *= mix(0.62, 1.0, sstep(0.0, 0.12 * h, p.y - yL));
    ball *= mix(0.5, 1.0, sstep(1.0, 0.72, ax));
    ball += 0.16 * band(p.y, yL + 0.03 * h, 0.018 * h + aa) * env;
  }

  // ---------- skin
  float light = f5.a;
  float e = length(p / vec2(1.3, h * 2.6 + 0.25));
  float shade = mix(0.5, 1.0, sstep(0.5, 1.25, e));
  shade += 0.12 * band(p.y, h * 1.9 + 0.25, 0.25);                       // brow ridge
  float crease = mix(meet + 0.1, up0 + 0.12 + 0.12 * h, clamp(lid, 0.0, 1.0));
  float onLid = step(yU, p.y) * step(p.y, crease);
  shade += 0.1 * onLid * sstep(crease, yU, p.y);                   // lit roll of the lid
  shade -= 0.28 * band(p.y, crease, 0.03 + aa) * env * clamp(lid, 0.0, 1.0);
  shade -= 0.35 * band(p.y, yU, 0.016 + aa * 0.7) * sstep(1.0, 0.8, ax);   // lash line
  shade += 0.22 * band(p.y, yU + 0.035, 0.018 + aa) * env * step(0.2, lid);      // lit rim of the upper lid
  shade += 0.18 * band(p.y, yL - 0.045, 0.025 + aa) * env;                        // thick lower lid
  shade -= 0.25 * band(p.y, yL - 0.01, 0.012 + aa * 0.7) * env;
  shade -= 0.1 * band(p.y, lo0 - 0.2, 0.12) * env;                       // under-eye
  shade = clamp(shade, 0.0, 1.2);
  vec3 skin = f5.rgb * 1.0 * (0.93 + 0.12 * vnoise(p * 38.0 + seed));
  skin = mix(skin * vec3(1.06, 0.78, 0.72), skin, shade) * shade;
  // the light comes from where the viewer is: the side of the face turned towards them is lit
  vec2 ld = vG * vec2(1.0, 0.8);
  float facingLight = dot(p / (length(p) + 0.35), ld);
  skin *= 0.62 + 0.55 * clamp(facingLight + 0.15, -0.4, 1.0) * sstep(0.2, 1.0, length(p));
  skin *= 0.62 + 0.38 * sstep(1.3, 0.3, length(p / vec2(1.0, 0.6 + h)));

  // ---------- lashes
  float lashA = 0.0;
  {
    float dirL = mix(-1.0, 1.0, sstep(0.15, 0.55, lid));        // up when open, hanging when shut
    float t = (p.y - yU) * dirL;
    float L = (0.08 + 0.12 * f4.a) * (0.55 + h) * (0.35 + 0.65 * pow(env, 0.5));
    if (t > -aa && t < L) {
      float N = 20.0 + 26.0 * f4.a;
      float bend = t * t / L * 1.4 * sign(p.x);
      for (int k = 0; k < 2; k++) {                                   // two staggered rows of lashes
        float sx = (p.x + bend * (1.0 + 0.3 * float(k))) * N + 0.5 * float(k);
        float id = floor(sx);
        float fr = fract(sx) - 0.5 - (hash(vec2(id + 7.0, seed + float(k))) - 0.5) * 0.5;
        float Lk = L * (0.5 + 0.5 * hash(vec2(id, seed + float(k) * 3.0))) * (0.35 + 0.65 * pow(env, 0.4));
        float wid = mix(0.13, 0.02, clamp(t / Lk, 0.0, 1.0)) + aa * N * 0.5;
        float strand = sstep(wid + 0.06 + aa * N, wid, abs(fr)) * (1.0 - sstep(0.75 * Lk, Lk, t));
        lashA = max(lashA, strand);
      }
      lashA = mix(lashA, 0.45 * (1.0 - sstep(0.3 * L, L, t)), sstep(0.15, 0.6, aa * N));  // far away: a soft dark fringe
      lashA *= sstep(1.0, 0.75, ax) * (0.75 + 0.25 * f4.a);
    }
    float t2 = yL - p.y;
    float L2 = L * 0.3;
    if (t2 > 0.0 && t2 < L2 && lid > 0.3) {
      float sx = (p.x - t2 * sign(xs) * side * 0.8) * 26.0;
      float strand = mix(sstep(0.2, 0.08, abs(fract(sx + seed) - 0.5)), 0.3, sstep(0.1, 0.5, aa * 26.0));
      lashA = max(lashA, strand * (1.0 - t2 / L2) * env * 0.5);
    }
  }

  // ---------- compose
  vec3 col = mix(skin * light, ball * (0.3 + 0.7 * light), inside);
  col = mix(col, vec3(0.03, 0.02, 0.02) * light, clamp(lashA, 0.0, 1.0));
  // catchlight: the glow of the room in a wet cornea, a window with a cross
  if (inside > 0.0) {
    vec2 c0 = vec2(-0.13, 0.17) + vG * vec2(0.28, 0.22);
    vec2 d = abs(p - c0);
    float box = sstep(0.075, 0.045, max(d.x * 0.9, d.y * 1.15) + 0.02 * vnoise(p * 30.0 + seed));
    vec2 c1 = vec2(0.2, -0.12) + vG * 0.15;
    float spec = box * mix(0.45, 0.9, irisM) + 0.18 * exp(-dot(p - c1, p - c1) / 0.0015);
    col += spec * inside * (0.3 + 0.45 * light) * sstep(0.0, 0.12 * h, yU - p.y);
  }

  // ---------- the patch of face fades into the dark
  float pr2 = f6.y;
  float e2 = length(p / vec2(pr2, pr2 * 0.82 * (0.6 + h)));
  float alpha = 1.0 - sstep(0.3, 1.0, e2 + (vnoise(p * 2.0 + seed) - 0.5) * 0.08);
  alpha *= alpha;
  col += (hash(gl_FragCoord.xy + fract(uTime * 7.13) * 97.0) - 0.5) * 0.03;
  outColor = vec4(max(col, 0.0) * alpha, alpha);
}`;

const BG_VS = `#version 300 es
const vec2 P[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() { gl_Position = vec4(P[gl_VertexID], 0.0, 1.0); }`;

const BG_FS = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uLight, uTime, uMode;
out vec4 o;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float sstep(float a, float b, float x) { float t = clamp((x - a) / (b - a), 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float r = length((uv - 0.5) * vec2(uRes.x / uRes.y, 1.0));
  if (uMode < 0.5) {                     // background: warm near-black
    float v = 1.0 - sstep(0.1, 1.1, r);
    vec3 c = mix(vec3(0.004, 0.003, 0.003), vec3(0.032, 0.023, 0.02), v) * (0.55 + 0.6 * uLight);
    c += (hash(gl_FragCoord.xy + fract(uTime * 3.1) * 71.0) - 0.5) * 0.012;
    o = vec4(c, 1.0);
  } else {                               // vignette, multiplied over everything
    float v = mix(1.0, 0.35, sstep(0.35, 1.05, r));
    o = vec4(vec3(v), 1.0);
  }
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
function program(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.lost = false;
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); this.lost = true; });
    canvas.addEventListener('webglcontextrestored', () => { this.init(); this.lost = false; });
    this.init();
  }

  init() {
    const gl = this.gl = this.canvas.getContext('webgl2', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('WebGL2 is not available');
    this.eyeProg = program(gl, VS, FS);
    this.bgProg = program(gl, BG_VS, BG_FS);
    this.u = {};
    for (const n of ['uRes', 'uVideo', 'uVideoOn', 'uTime', 'uReflect', 'uFlip']) this.u[n] = gl.getUniformLocation(this.eyeProg, n);
    this.ub = {};
    for (const n of ['uRes', 'uLight', 'uTime', 'uMode']) this.ub[n] = gl.getUniformLocation(this.bgProg, n);

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.inst = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.inst);
    for (let i = 0; i < 7; i++) {
      gl.enableVertexAttribArray(1 + i);
      gl.vertexAttribPointer(1 + i, 4, gl.FLOAT, false, FLOATS * 4, i * 16);
      gl.vertexAttribDivisor(1 + i, 1);
    }
    gl.bindVertexArray(null);
    this.cap = 0;
    this.data = null;

    this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    gl.generateMipmap(gl.TEXTURE_2D);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]])
      gl.texParameteri(gl.TEXTURE_2D, k, v);
    this.videoTime = -1;
    this.videoOK = false;
  }

  resize(cssW, cssH, dpr) {
    const w = Math.max(1, Math.round(cssW * dpr)), h = Math.max(1, Math.round(cssH * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
    this.scale = dpr;
  }

  uploadVideo(video) {
    const gl = this.gl;
    if (!video || video.readyState < 2 || !video.videoWidth) { this.videoOK = false; return; }
    if (video.currentTime === this.videoTime) return;
    this.videoTime = video.currentTime;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video); gl.generateMipmap(gl.TEXTURE_2D); this.videoOK = true; }
    catch { this.videoOK = false; }
  }

  draw(eyes, s) {
    if (this.lost) return;
    const gl = this.gl, k = this.scale;
    const W = this.canvas.width, H = this.canvas.height;
    gl.viewport(0, 0, W, H);

    if (s.reflect > 0 && s.video) this.uploadVideo(s.video); else this.videoOK = false;

    // background
    gl.disable(gl.BLEND);
    gl.useProgram(this.bgProg);
    gl.uniform2f(this.ub.uRes, W, H);
    gl.uniform1f(this.ub.uLight, s.light);
    gl.uniform1f(this.ub.uTime, s.time);
    gl.uniform1f(this.ub.uMode, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // eyes
    const n = eyes.length;
    if (n > this.cap) { this.cap = Math.ceil(n * 1.25); this.data = new Float32Array(this.cap * FLOATS); }
    const d = this.data;
    for (let i = 0; i < n; i++) {
      const e = eyes[i], o = i * FLOATS;
      d[o] = e.x * k; d[o + 1] = e.y * k; d[o + 2] = e.r * k; d[o + 3] = e.rot;
      d[o + 4] = e.dir.x; d[o + 5] = e.dir.y; d[o + 6] = e.lid ?? 0; d[o + 7] = e.lower;
      d[o + 8] = e.pupilOut ?? e.pupil; d[o + 9] = e.irisR; d[o + 10] = e.seed; d[o + 11] = e.aspect;
      d[o + 12] = e.iris1[0]; d[o + 13] = e.iris1[1]; d[o + 14] = e.iris1[2]; d[o + 15] = e.veins;
      d[o + 16] = e.iris2[0]; d[o + 17] = e.iris2[1]; d[o + 18] = e.iris2[2]; d[o + 19] = e.lashes;
      d[o + 20] = e.skin[0]; d[o + 21] = e.skin[1]; d[o + 22] = e.skin[2];
      d[o + 23] = s.light * (0.4 + 0.6 * e.alert);
      d[o + 24] = e.side; d[o + 25] = e.patch; d[o + 26] = e.reflect; d[o + 27] = 0;
    }
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.eyeProg);
    gl.uniform2f(this.u.uRes, W, H);
    gl.uniform1f(this.u.uTime, s.time);
    gl.uniform1f(this.u.uReflect, s.reflect);
    gl.uniform1f(this.u.uFlip, s.flip);
    gl.uniform1f(this.u.uVideoOn, this.videoOK ? 1 : 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.uniform1i(this.u.uVideo, 0);
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.inst);
    gl.bufferData(gl.ARRAY_BUFFER, d.subarray(0, n * FLOATS), gl.DYNAMIC_DRAW);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, n);
    gl.bindVertexArray(null);

    // vignette
    gl.blendFunc(gl.ZERO, gl.SRC_COLOR);
    gl.useProgram(this.bgProg);
    gl.uniform1f(this.ub.uMode, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
