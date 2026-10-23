// Turns noisy, flickering per-frame detections into a small set of people with stable ids.
// Pure logic (no DOM), so the edge cases can be tested in node: see tests/.
//
// Edge cases handled here:
//  - one-frame false positives        -> a track must be seen `confirmHits` times before it counts
//  - missed frames / brief occlusion  -> confirmed tracks coast on their velocity for `graceMs`
//  - people crossing                  -> association uses the predicted position, not the last one
//  - crowds                           -> nearest `maxPeople` are kept; the rest are background
//  - far background passers-by        -> dropped beyond `maxDistanceM`; weak salience otherwise (attention.js)
//  - posters, photos, mannequins, TVs -> a "person" that never moves for `staticAfterS` becomes static,
//                                        and the spot is remembered so it is recognised quickly next time
//  - reflections in windows / mirrors -> manual ignore zones in camera coordinates
//  - garbage (NaN, missing landmarks) -> filtered before anything else

export class OneEuro {
  constructor(minCutoff = 1.2, beta = 0.6, dCutoff = 1.0) {
    this.minCutoff = minCutoff; this.beta = beta; this.dCutoff = dCutoff;
    this.x = null; this.dx = 0;
  }
  static alpha(cutoff, dt) { const tau = 1 / (2 * Math.PI * cutoff); return 1 / (1 + tau / dt); }
  filter(x, dt) {
    if (this.x === null || !(dt > 0)) { this.x = x; this.dx = 0; return x; }
    const dx = (x - this.x) / dt;
    this.dx += OneEuro.alpha(this.dCutoff, dt) * (dx - this.dx);
    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx);
    this.x += OneEuro.alpha(cutoff, dt) * (x - this.x);
    return this.x;
  }
}

export function inZones(u, v, zones) {
  if (!zones) return false;
  for (const z of zones) {
    const u0 = Math.min(z[0], z[2]), u1 = Math.max(z[0], z[2]);
    const v0 = Math.min(z[1], z[3]), v1 = Math.max(z[1], z[3]);
    if (u >= u0 && u <= u1 && v >= v0 && v <= v1) return true;
  }
  return false;
}

const finite = (...a) => a.every(Number.isFinite);

export class Tracker {
  constructor(cfg) {
    this.cfg = cfg;
    this.tracks = [];
    this.nextId = 1;
    this.staticSpots = [];   // {u, v, until}
    this.lastUpdate = null;
  }

  get confirmed() { return this.tracks.filter(t => t.state !== 'tentative'); }

  reset() { this.tracks = []; }

  // obs: [{x,y,z (world m), u,v (raw image 0..1), conf, facing (-1..1 | null), size}]
  update(obs, now) {
    const cfg = this.cfg;
    const dtAll = this.lastUpdate == null ? 0 : Math.min((now - this.lastUpdate) / 1000, 1);
    this.lastUpdate = now;

    // 1. sanitise
    let clean = (obs || []).filter(o => o && finite(o.x, o.y, o.z, o.u, o.v)
      && (o.conf ?? 1) >= cfg.minConfidence
      && o.z <= cfg.maxDistanceM && o.z >= cfg.minDistanceM
      && !inZones(o.u, o.v, cfg.ignoreZones));
    // A crowd: keep the nearest. Everyone else is, for the eyes, part of the background.
    clean.sort((a, b) => a.z - b.z);
    clean = clean.slice(0, Math.ceil(cfg.maxPeople * 1.5));
    // Two detections of the same body (the model sometimes double-fires): merge near-duplicates.
    clean = clean.filter((o, i) => !clean.slice(0, i).some(p => Math.hypot(p.x - o.x, p.y - o.y) < 0.12 && Math.abs(p.z - o.z) < 0.5));

    // 2. predict + 3. associate (greedy on predicted position, gated)
    const pairs = [];
    for (const t of this.tracks) {
      const since = Math.min((now - t.lastSeen) / 1000, 0.6);
      const px = t.x + t.vx * since, py = t.y + t.vy * since, pz = t.z + t.vz * since * 0.5;
      const gate = 0.55 + 1.4 * since + 0.12 * t.z;
      clean.forEach((o, j) => {
        const c = Math.hypot(o.x - px, o.y - py, 0.35 * (o.z - pz));
        if (c < gate) pairs.push([c, t, j]);
      });
    }
    pairs.sort((a, b) => a[0] - b[0]);
    const usedT = new Set(), usedO = new Set();
    for (const [, t, j] of pairs) {
      if (usedT.has(t) || usedO.has(j)) continue;
      usedT.add(t); usedO.add(j);
      this._observe(t, clean[j], now);
    }

    // 4. births
    clean.forEach((o, j) => {
      if (usedO.has(j) || this.tracks.length >= cfg.maxPeople * 2) return;
      this.tracks.push(this._birth(o, now));
    });

    // 5. unmatched tracks coast, then die
    for (const t of this.tracks) if (!usedT.has(t)) this._coast(t, now, dtAll);
    this._expire(now);

    // 6. derived state
    for (const t of this.tracks) this._derive(t, now);

    // 7. more confirmed people than we can follow: keep the nearest
    const conf = this.confirmed.sort((a, b) => a.z - b.z);
    for (let i = cfg.maxPeople; i < conf.length; i++) conf[i].overflow = true;
    for (let i = 0; i < Math.min(cfg.maxPeople, conf.length); i++) conf[i].overflow = false;
    return this.tracks;
  }

  _expire(now) {
    this.tracks = this.tracks.filter(t => {
      const gone = now - t.lastSeen;
      if (t.state === 'tentative') return gone < 300;
      if (gone < this.cfg.graceMs) return true;
      if (t.static) this.staticSpots.push({ u: t.u, v: t.v, until: now + 30 * 60e3 });
      return false;
    });
    this.staticSpots = this.staticSpots.filter(s => s.until > now);
  }

  _birth(o, now) {
    const f = () => new OneEuro(1.0, 0.8);
    const t = {
      id: this.nextId++, state: 'tentative', hits: 1, born: now, lastSeen: now, confirmedAt: null,
      x: o.x, y: o.y, z: o.z, u: o.u, v: o.v, vx: 0, vy: 0, vz: 0, speed: 0,
      fx: f(), fy: f(), fz: new OneEuro(0.4, 0.3),
      facing: o.facing ?? null, size: o.size ?? 0, conf: o.conf ?? 1, box: o.box, kp: o.kp,
      anchor: { x: o.x, y: o.y, t: now }, stillSince: now, static: false, presence: 0, overflow: false,
    };
    t.fx.filter(o.x, 0); t.fy.filter(o.y, 0); t.fz.filter(o.z, 0);
    // Born on a spot where a static thing used to be: it is probably that thing again.
    if (this.staticSpots.some(s => Math.hypot(s.u - o.u, s.v - o.v) < 0.05))
      t.anchor.t = now - (this.cfg.staticAfterS - 3) * 1000;
    return t;
  }

  _observe(t, o, now) {
    const dt = Math.max((now - t.lastSeen) / 1000, 1e-3);
    const x = t.fx.filter(o.x, dt), y = t.fy.filter(o.y, dt), z = t.fz.filter(o.z, dt);
    const k = Math.min(1, dt * 6);
    t.vx += ((x - t.x) / dt - t.vx) * k;
    t.vy += ((y - t.y) / dt - t.vy) * k;
    t.vz += ((z - t.z) / dt - t.vz) * k;
    t.x = x; t.y = y; t.z = z; t.u = o.u; t.v = o.v;
    t.facing = o.facing ?? t.facing;
    t.size = o.size ?? t.size; t.conf = o.conf ?? 1; t.box = o.box; t.kp = o.kp;
    t.hits++;
    t.lastSeen = now;
    if (t.state === 'coasting') t.state = 'confirmed';
    if (t.state === 'tentative' && t.hits >= this.cfg.confirmHits && now - t.born >= this.cfg.confirmMs) {
      t.state = 'confirmed'; t.confirmedAt = now;
    }
  }

  _coast(t, now, dt) {
    if (t.state === 'tentative') return;
    t.state = 'coasting';
    // drift on, but slow down: a person who vanished is probably standing still behind someone
    const damp = Math.exp(-dt * 2.5);
    t.vx *= damp; t.vy *= damp; t.vz *= damp;
    t.x += t.vx * dt; t.y += t.vy * dt;
  }

  _derive(t, now) {
    const cfg = this.cfg;
    // depth estimates are the noisiest axis, so they count for less in "movement"
    t.speed = Math.hypot(t.vx, t.vy, 0.3 * t.vz);
    if (t.speed > 0.18) t.stillSince = now;
    if (Math.hypot(t.x - t.anchor.x, t.y - t.anchor.y) > cfg.staticMoveM) {
      t.anchor = { x: t.x, y: t.y, t: now };
      if (t.static) { t.static = false; this.staticSpots = this.staticSpots.filter(s => Math.hypot(s.u - t.u, s.v - t.v) > 0.05); }
    }
    if (t.state !== 'tentative' && now - t.anchor.t > cfg.staticAfterS * 1000) t.static = true;
    t.age = t.confirmedAt == null ? 0 : (now - t.confirmedAt) / 1000;
    t.stillS = (now - t.stillSince) / 1000;
    const fadeIn = t.confirmedAt == null ? 0 : Math.min(1, (now - t.confirmedAt) / 400);
    t.presence = t.state === 'tentative' ? 0 : fadeIn * Math.max(0, 1 - Math.max(0, now - t.lastSeen - 120) / cfg.graceMs);
  }

  // Called on frames where the detector produced nothing new: expire and age, but do not coast.
  tick(now) {
    this._expire(now);
    for (const t of this.tracks) this._derive(t, now);
    return this.tracks;
  }
}
