// The wall's attention: who is worth looking at, and what each eye is doing about it.
// Pure logic (no DOM); tested in tests/edge-cases.test.mjs.
//
// Wall states:
//   sleep      nobody for a long time. Nearly every eye shut; now and then one opens and looks around.
//   drowsy     nobody, recently. Half-lids, wandering glances, eyes looking at each other. Slowly shutting.
//   watch      somebody is here.
//   search     the last person just vanished: eyes dart around where they were.
//   after      then stare at the spot where they left, before letting go.
//
// Who gets looked at (salience of each tracked person):
//   nearer people much more (inverse square), moving people more, NEW people much more (novelty fades
//   over ~5 s), people facing the screen a little more, people standing still for a long time less,
//   people cut off at the edge of the camera less, posters and mannequins (static) not at all.
// Each eye then chooses one person at random in proportion to salience x closeness on the wall,
// sticks with that choice for a few seconds (hysteresis), and re-chooses more often in a crowd.

import { clamp, worldToScreen, mulberry32 } from './geometry.js';

export function salience(t, cfg) {
  if (t.static || t.overflow || t.state === 'tentative') return 0;
  if (t.z > cfg.maxDistanceM) return 0;
  const closeness = clamp((1.6 / Math.max(t.z, 0.3)) ** 2, 0.03, 3);
  const motion = 1 + 0.7 * Math.min(t.speed || 0, 1.5);
  const novelty = 1 + 1.4 * Math.exp(-(t.age || 0) / 5);
  const facing = t.facing == null ? 1 : 1 + 0.3 * Math.max(0, t.facing);
  const bored = (t.stillS || 0) > cfg.boredAfterS ? 0.65 : 1;
  const edge = t.u < 0.04 || t.u > 0.96 ? 0.6 : 1;
  return (t.presence ?? 1) * closeness * motion * novelty * facing * bored * edge;
}

const pick = (rng, arr) => arr[(rng() * arr.length) | 0];

export class Attention {
  constructor(cfg) {
    this.cfg = cfg;
    this.rng = mulberry32(cfg.seed ^ 0x5eed);
    this.state = 'sleep';
    this.since = 0;
    this.emptySince = -1e12;
    this.lastPos = { x: 0, y: 0, z: 2 };
    this.known = new Set();
    this.sal = new Map();
    this.contactT = 0;
    this.contactReadyAt = 0;
    this.nextSentinel = 0;
    this.light = 0.2;
    this.events = [];      // [{t, type, ...}] for the debug overlay
  }

  emit(now, type, extra = {}) {
    this.events.push({ t: now, type, ...extra });
    if (this.events.length > 30) this.events.shift();
  }

  setState(now, s) { if (this.state !== s) { this.state = s; this.since = now; } }

  // Delay for a wave of attention spreading across the wall from a person's position.
  waveDelay(e, rig, src) {
    const p = worldToScreen(rig, { x: clamp(src.x, -rig.W / 2, rig.W / 2), y: clamp(src.y, -rig.H / 2, rig.H / 2) });
    return Math.hypot(e.x - p.x, e.y - p.y) / (1.3 * Math.max(rig.pxW, rig.pxH)) * 1000;
  }

  update(now, dt, tracks, eyes, rig) {
    const cfg = this.cfg, rng = this.rng;
    const live = [];
    this.sal.clear();
    for (const t of tracks) {
      const s = salience(t, cfg);
      if (s > 0.01) { live.push(t); this.sal.set(t.id, s); }
    }
    const total = live.reduce((a, t) => a + this.sal.get(t.id), 0);
    if (this.emptySince < -1e11) { this.emptySince = now; this.setState(now, 'drowsy'); }   // wake up drowsy, then drift off
    const prev = this.state;

    // ---- wall state
    if (live.length) {
      const w = live.reduce((a, t) => { const s = this.sal.get(t.id); a.x += t.x * s; a.y += t.y * s; a.z += t.z * s; return a; }, { x: 0, y: 0, z: 0 });
      this.lastPos = { x: w.x / total, y: w.y / total, z: w.z / total };
      if (prev !== 'watch') {
        if (prev === 'search') {
          this.emit(now, 'return');
          for (const e of eyes) e.reevalAt = now + e.latency * 1000;
        } else {
          this.emit(now, 'arrival', { id: live[0].id });
          const src = live.reduce((a, b) => this.sal.get(b.id) > this.sal.get(a.id) ? b : a);
          for (const e of eyes) {
            e.wakeAt = now + this.waveDelay(e, rig, src) + rng() * 260;
            e.pendingWake = true;
          }
        }
        this.setState(now, 'watch');
      }
    } else {
      if (prev === 'watch') { this.setState(now, 'search'); this.emptySince = now; this.emit(now, 'departure'); }
      const el = (now - this.since) / 1000;
      if (this.state === 'search' && el > cfg.searchS) this.setState(now, 'after');
      else if (this.state === 'after' && el > cfg.afterimageS) this.setState(now, 'drowsy');
      else if (this.state === 'drowsy' && (now - this.emptySince) / 1000 > cfg.sleepAfterS) this.setState(now, 'sleep');
    }

    // ---- newcomers: while people are already here, a new face turns heads in a wave
    const ids = new Set(live.map(t => t.id));
    if (prev === 'watch') {
      for (const t of live) {
        if (this.known.has(t.id)) continue;
        this.emit(now, 'newcomer', { id: t.id });
        const share = this.sal.get(t.id) / total;
        for (const e of eyes) {
          if (e.dissenter) continue;
          const r = rng();
          if (r < Math.min(0.8, 0.3 + share)) {
            e.reevalAt = now + this.waveDelay(e, rig, t) + e.latency * 1000;
            e.prefer = t.id;
          } else if (r > 0.9) {   // some glance at their neighbour first, as if to say "did you see that?"
            e.glanceUntil = now + 500 + rng() * 500;
            e.focus = { kind: 'eye', j: pick(rng, e.neighbours) };
          }
        }
      }
    }
    // remember everyone announced for as long as the tracker still has them, so a person whose
    // salience dips for a moment (overflow in a crowd, a missed frame) is not announced again
    const present = new Set(tracks.map(t => t.id));
    for (const id of this.known) if (!present.has(id)) this.known.delete(id);
    for (const id of ids) this.known.add(id);

    // ---- held gaze: one person, still, facing the wall -> every eye blinks at once
    if (live.length) {
      const dom = live.reduce((a, b) => this.sal.get(b.id) > this.sal.get(a.id) ? b : a);
      const held = this.sal.get(dom.id) / total > 0.6 && dom.facing != null && dom.facing > 0.6
        && dom.speed < 0.2 && dom.z < 3.5 && dom.age > 1.5;
      this.contactT = held ? this.contactT + dt : 0;
      if (this.contactT > cfg.contactHoldS && now >= this.contactReadyAt) {
        this.emit(now, 'contact', { id: dom.id });
        this.contactReadyAt = now + cfg.contactCooldownS * 1000;
        for (const e of eyes) if (e.mood === 'watch') e.forceBlinkAt = now + 140 + this.waveDelay(e, rig, dom) * 0.15;
      }
    } else this.contactT = 0;

    // ---- sentinels: while the wall sleeps, one eye at a time keeps watch
    if (this.state === 'sleep' && now >= this.nextSentinel) {
      const e = pick(rng, eyes);
      if (e) e.sentinelUntil = now + 4000 + rng() * 3500;
      this.nextSentinel = now + 7000 + rng() * 14000;
    }

    // ---- each eye
    const crowd = 1 + 0.35 * Math.max(0, live.length - 1);
    for (const e of eyes) this.drive(e, now, live, rig, crowd);

    // how bright the room of skin is
    const lightT = { watch: 0.95, search: 0.8, after: 0.6, drowsy: 0.38, sleep: 0.2 }[this.state];
    this.light += (lightT - this.light) * Math.min(1, dt * (lightT > this.light ? 1.5 : 0.25));
    return { state: this.state, live, total };
  }

  choose(e, live, rig) {
    if (e.prefer != null) { const id = e.prefer; e.prefer = null; if (live.some(t => t.id === id)) return id; }
    const sig = 0.33 * rig.W;
    const cur = e.focus?.kind === 'track' ? e.focus.id : null;
    let sum = 0;
    const w = live.map(t => {
      const dx = e.wx - clamp(t.x, -rig.W / 2, rig.W / 2);
      const loc = Math.exp(-dx * dx / (2 * sig * sig));
      const v = this.sal.get(t.id) * (0.3 + 0.7 * loc) * (t.id === cur ? 1.8 : 1);
      sum += v; return v;
    });
    let x = this.rng() * sum;
    for (let i = 0; i < live.length; i++) if ((x -= w[i]) <= 0) return live[i].id;
    return live[live.length - 1].id;
  }

  wander(e) {
    const r = this.rng;
    return { kind: 'point', p: { x: (r() - 0.5) * 5, y: -0.6 + (r() - 0.5) * 1.2, z: 1 + r() * 3 } };
  }

  setFocus(e, f) {
    // keep the same object while the target is the same, so the eye does not re-react
    const c = e.focus;
    if (c && f && c.kind === f.kind && ((f.kind === 'track' && c.id === f.id) || (f.kind === 'eye' && c.j === f.j))) return;
    e.focus = f;
  }

  drive(e, now, live, rig, crowd) {
    const cfg = this.cfg, rng = this.rng;
    const st = this.state;

    if (st === 'watch') {
      if (now < e.wakeAt) return;                     // the wave has not reached this eye yet
      if (e.pendingWake) {
        e.pendingWake = false;
        e.arousal = Math.min(1.5, e.arousal + 0.9);
        e.surpriseUntil = now + 500 + rng() * 400;
        e.reevalAt = 0;
      }
      if (now < e.glanceUntil) { e.mood = 'glance'; e.openTarget = 0.9; return; }
      const cur = live.find(t => t.id === e.watchId);
      const needsTrack = e.mood !== 'bored' && e.mood !== 'dissent' && e.mood !== 'shy';
      if (now >= e.reevalAt || !cur || (needsTrack && e.focus?.kind !== 'track')) {
        e.reevalAt = now + (1400 + rng() * 3800) / crowd;
        const id = this.choose(e, live, rig);
        const t = live.find(q => q.id === id);
        e.watchId = id;
        if (e.dissenter) {
          // not everyone is looking at you
          e.mood = 'dissent'; e.openTarget = 0.55;
          this.setFocus(e, rng() < 0.6 ? { kind: 'eye', j: pick(rng, e.neighbours) } : { kind: 'down', dx: (rng() - 0.5) * 2 });
          return;
        }
        if (e.shy && t.z < 1.0) {
          e.mood = 'shy'; e.openTarget = 0.7;
          this.setFocus(e, { kind: 'down', dx: (rng() - 0.5) * 1.5 });
          return;
        }
        const boredNow = t.stillS > cfg.boredAfterS + e.patience;
        if (boredNow && rng() < 0.7) {
          e.mood = 'bored'; e.openTarget = 0.72;
          this.setFocus(e, rng() < 0.5 ? { kind: 'eye', j: pick(rng, e.neighbours) } : this.wander(e));
          return;
        }
        if (e.mood === 'bored' && !boredNow) {  // you moved: attention snaps back
          e.surpriseUntil = now + 450; e.arousal += 0.5;
        }
        e.mood = 'watch';
        this.setFocus(e, { kind: 'track', id });
      }
      if (e.mood === 'watch') e.openTarget = cur && cur.z < 1.0 ? 1.05 : 0.95;
      else if (e.mood === 'bored' && cur.stillS < 1) e.reevalAt = Math.min(e.reevalAt, now + e.latency * 1000);
      return;
    }

    e.wakeAt = 0; e.pendingWake = false; e.prefer = null;

    if (st === 'search') {
      e.mood = 'search'; e.openTarget = 1.0;
      if (now >= e.reevalAt) {
        const p = this.lastPos;
        e.focus = { kind: 'point', p: { x: p.x + (rng() - 0.5) * 1.6, y: p.y + (rng() - 0.5) * 0.6, z: Math.max(0.5, p.z + (rng() - 0.5)) } };
        e.reevalAt = now + 350 + rng() * 550;
      }
      return;
    }
    if (st === 'after') {
      e.mood = 'after'; e.openTarget = 0.78;
      if (e.focus?.kind !== 'point' || e.focus.p !== this.lastPos) e.focus = { kind: 'point', p: this.lastPos };
      e.reevalAt = 0;
      return;
    }
    if (st === 'drowsy' || (st === 'sleep' && now < (e.sentinelUntil || 0))) {
      const sentinel = st === 'sleep';
      const d = clamp((now - this.emptySince) / 1000 / cfg.sleepAfterS, 0, 1);
      e.mood = sentinel ? 'sentinel' : 'drowsy';
      e.openTarget = sentinel ? 0.62 : Math.max(0, (0.62 - 0.55 * d) * (0.6 + 0.8 * e.drowsy) - (e.drowsy > 0.8 ? 0.3 * d : 0));
      if (now >= e.reevalAt) {
        const r = rng();
        e.focus = r < 0.35 && !sentinel ? { kind: 'eye', j: pick(rng, e.neighbours) } : this.wander(e);
        e.reevalAt = now + (sentinel ? 700 + rng() * 1200 : 1800 + rng() * 4500);
      }
      return;
    }
    // sleep
    e.mood = 'sleep'; e.openTarget = 0;
    if (e.focus && e.focus.kind !== 'down') e.focus = { kind: 'down', dx: 0 };
  }
}
