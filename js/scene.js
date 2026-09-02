/* ═══════════════════════════════════════════
   Wild Tails — scene.js

   A habitat simulation that fills the whole window.
   The animal decides for itself what to do: patrol,
   stand and listen, stalk, rush, feed, rest, call.

   These are wild animals, not pets. Reach in and
   grab one and it will do what a wild animal does —
   pin its ears, snarl, lash out, and leave.

   JS owns position, speed, behaviour, AND which sprite
   frame is on screen: each animal is a hand-illustrated
   24-frame sheet (assets/<animal>-frames/frame-NN.png).
   `animal.frames` marks which frame numbers cover which
   behaviour; playback rate for locomotion is derived
   from real ground speed, so faster movement means a
   faster-cycling stride, not a fixed-speed loop.
   ═══════════════════════════════════════════ */

const GROUND_TOP = 0.50;
const GROUND_BOT = 0.80;
const NEAR_SCALE = 1.5;
const FAR_SCALE = 0.85;
const PREY_RESPAWN = [7000, 16000];
const CATCH_RANGE = 62;
const ESCAPE_CHANCE = 0.3;

// A behaviour state may not have its own frame range (e.g. a "pounce"
// is a lunge, not a separate illustrated pose) — fall back to the
// closest range that exists for that animal.
const FRAME_FALLBACK = {
  stalk: 'walk', pounce: 'run', fall: 'idle', land: 'idle',
  swipe: 'threat', held: 'threat', eat: 'idle', call: 'threat', flee: 'run',
};

const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pad2 = n => String(n).padStart(2, '0');

class Scene {
  constructor(root, animal, hooks = {}) {
    this.root = root;
    this.animal = animal;
    this.hooks = hooks;
    this.prey = null;
    this.preyTimer = rand(2000, 5000);
    this.huntCooldown = 0;
    this.food = null;
    this.lastT = performance.now();
    this.measure();

    this.layer = root.querySelector('.critters') || root;
    this.actor = this.spawnActor();
    window.addEventListener('resize', () => this.measure(), { passive: true });
    requestAnimationFrame(t => this.tick(t));
  }

  measure() {
    const r = this.root.getBoundingClientRect();
    this.w = r.width;
    this.h = r.height;
    this.groundTop = this.h * GROUND_TOP;
    this.groundBot = this.h * GROUND_BOT;
  }

  depthScale(y) {
    const t = clamp((y - this.groundTop) / (this.groundBot - this.groundTop), 0, 1);
    return FAR_SCALE + t * (NEAR_SCALE - FAR_SCALE);
  }

  randomGroundPoint() {
    return { x: rand(70, this.w - 70), y: rand(this.groundTop, this.groundBot) };
  }

  /* ── Spawning ────────────────────────────── */

  spawnActor() {
    const el = document.createElement('div');
    el.className = 'critter actor';
    el.innerHTML = `<div class="flip"><img class="sprite" draggable="false" alt=""></div>`;
    this.layer.appendChild(el);

    const start = this.randomGroundPoint();
    const a = {
      el,
      flip: el.querySelector('.flip'),
      img: el.querySelector('.sprite'),
      x: start.x, y: start.y,
      dir: Math.random() < 0.5 ? 1 : -1,
      speed: 0, targetSpeed: 0,
      state: '', stateT: 0, stateDur: 0,
      target: null, pounceVX: 0, pounceVY: 0,
      held: false, fallTo: 0, fallV: 0,
      turning: 0, wantDir: 1,
      frameT: 0, currentFrame: -1,
    };
    el.addEventListener('pointerdown', e => this.grab(e, a));
    this.setState(a, 'idle', rand(1.5, 3));
    return a;
  }

  /* Pick the frame range for the current state (with fallback), advance
     through it at a rate tied to real speed for locomotion states, and
     swap the <img> src only when the frame actually changes. */
  updateSprite(a, dt) {
    const f = this.animal.frames;
    const key = f[a.state] ? a.state : (FRAME_FALLBACK[a.state] || 'idle');
    const range = f[key] || f.idle;
    const span = range[1] - range[0] + 1;

    let fps;
    if (key === 'walk') fps = 5 + a.speed * 0.11;
    else if (key === 'run') fps = 9 + a.speed * 0.045;
    else if (key === 'stalk') fps = 2.6;
    else fps = span > 1 ? 3 : 0;

    a.frameT += dt * fps;
    const offset = span > 1 ? Math.floor(a.frameT) % span : 0;
    const num = range[0] + offset;

    if (num !== a.currentFrame) {
      a.currentFrame = num;
      a.img.src = `${f.dir}/frame-${pad2(num)}.png`;
    }
  }

  spawnPrey() {
    if (this.prey || !PREY[this.animal.prey]) return;
    const el = document.createElement('div');
    el.className = 'critter prey';
    el.innerHTML = `<div class="flip"><svg viewBox="0 0 62 44">${PREY[this.animal.prey].svg}</svg></div>`;
    this.layer.appendChild(el);

    const fromLeft = Math.random() < 0.5;
    this.prey = {
      el,
      flip: el.querySelector('.flip'),
      x: fromLeft ? -40 : this.w + 40,
      y: rand(this.groundTop, this.groundBot),
      dir: fromLeft ? 1 : -1,
      state: 'graze', stateT: 0, stateDur: rand(2, 4),
      target: { x: rand(120, this.w - 120), y: 0 },
      reactDelay: 0,
    };
    this.prey.target.y = this.prey.y;
    this.prey.state = 'wander';
  }

  removePrey(caught) {
    if (!this.prey) return;
    if (caught) this.puff(this.prey.x, this.prey.y);
    this.prey.el.remove();
    this.prey = null;
    this.preyTimer = rand(...PREY_RESPAWN);
  }

  dropFood(x, y) {
    if (this.food) this.food.el.remove();
    const el = document.createElement('div');
    el.className = 'food';
    el.textContent = this.animal.foodEmoji || '🍖';
    this.layer.appendChild(el);

    const fx = x != null ? x : rand(120, this.w - 120);
    const fy = y != null ? y : rand(this.groundTop, this.groundBot);
    this.food = { el, x: fx, y: fy };
    el.style.transform = `translate3d(${fx - 14}px, ${fy - 28}px, 0) scale(${this.depthScale(fy)})`;
    el.style.zIndex = Math.round(fy);

    // A wary animal won't come straight in — it waits, watches, then approaches.
    const delay = this.hooks.trust && this.hooks.trust() > 55 ? 300 : rand(1200, 2600);
    setTimeout(() => {
      if (!this.food || this.actor.held) return;
      this.setState(this.actor, 'walk', 12, { x: fx, y: fy, thenEat: true });
    }, delay);
  }

  puff(x, y) {
    const p = document.createElement('div');
    p.className = 'puff';
    p.style.left = (x - 23) + 'px';
    p.style.top = (y - 46) + 'px';
    this.layer.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }

  /* ── States ──────────────────────────────── */

  setState(a, state, dur, opts = {}) {
    if (a.state) a.el.classList.remove('st-' + a.state);
    a.state = state;
    a.stateT = 0;
    a.stateDur = dur;
    a.el.classList.add('st-' + state);
    a.target = null;
    a.thenEat = false;

    const p = this.animal.profile;
    switch (state) {
      case 'walk':
        a.targetSpeed = p.walkSpeed;
        a.target = opts.x != null ? { x: opts.x, y: opts.y } : this.randomGroundPoint();
        a.thenEat = !!opts.thenEat;
        break;
      case 'run':
      case 'flee':
        a.targetSpeed = p.walkSpeed * 3.1;
        a.target = opts.x != null ? { x: opts.x, y: opts.y } : this.randomGroundPoint();
        break;
      case 'stalk':
        a.targetSpeed = p.stalkSpeed;
        break;
      default:
        a.targetSpeed = 0;
    }

    if (this.hooks.onState) this.hooks.onState(state);
    if (state === 'call' && this.hooks.onCall) this.hooks.onCall();
  }

  chooseNext(a) {
    const p = this.animal.profile;
    const options = [
      { s: 'walk', w: 3 },
      { s: 'idle', w: 2.2 },
      { s: 'rest', w: 1.1 * p.restBias },
      { s: 'call', w: 0.45 * p.callBias },
    ];
    if (this.prey && this.huntCooldown <= 0) options.push({ s: 'stalk', w: 3.2 * p.huntBias });

    const total = options.reduce((s, o) => s + o.w, 0);
    let r = Math.random() * total;
    const choice = options.find(o => (r -= o.w) <= 0) || options[0];

    const durs = { walk: 10, idle: rand(2, 4.5), rest: rand(6, 14), call: 2.2, stalk: 11 };
    this.setState(a, choice.s, durs[choice.s]);
  }

  /* ── Frame ───────────────────────────────── */

  tick(now) {
    const dt = Math.min(0.05, (now - this.lastT) / 1000);
    this.lastT = now;

    if (this.huntCooldown > 0) this.huntCooldown -= dt;
    this.updateActor(this.actor, dt);
    this.updatePrey(dt);

    this.preyTimer -= dt * 1000;
    if (this.preyTimer <= 0 && !this.prey) this.spawnPrey();

    if (this.hooks.onFrame) this.hooks.onFrame(this.actor);
    requestAnimationFrame(t => this.tick(t));
  }

  updateActor(a, dt) {
    a.stateT += dt;
    if (a.held) { this.updateSprite(a, dt); this.draw(a); return; }

    switch (a.state) {
      case 'walk':
        if (this.moveToward(a, a.target, dt)) {
          if (a.thenEat && this.food) this.eatFood(a);
          else this.chooseNext(a);
        } else if (a.stateT > a.stateDur) this.chooseNext(a);
        break;

      case 'run':
      case 'flee':
        if (this.moveToward(a, a.target, dt) || a.stateT > a.stateDur) {
          this.setState(a, 'idle', rand(1.5, 3));
        }
        break;

      case 'stalk': {
        if (!this.prey) { this.chooseNext(a); break; }
        const d = Math.hypot(this.prey.x - a.x, this.prey.y - a.y);
        if (d < CATCH_RANGE + 40) {
          a.wantDir = this.prey.x >= a.x ? 1 : -1;
          a.dir = a.wantDir;
          this.pounce(a);
        } else {
          this.moveToward(a, { x: this.prey.x - a.dir * 34, y: this.prey.y }, dt);
          if (a.stateT > a.stateDur) this.chooseNext(a);
        }
        break;
      }

      case 'pounce':
        a.x = clamp(a.x + a.pounceVX * dt, 40, this.w - 40);
        a.y = clamp(a.y + a.pounceVY * dt, this.groundTop, this.groundBot);
        if (a.stateT > a.stateDur) this.resolvePounce(a);
        break;

      case 'fall':
        a.fallV += 1400 * dt;
        a.y += a.fallV * dt;
        if (a.y >= a.fallTo) {
          a.y = a.fallTo;
          this.setState(a, 'land', 0.7);
        }
        break;

      case 'land':
        if (a.stateT > a.stateDur) {
          // Put down by a human: warn, then put distance between you and it.
          this.reactToHandling(a, false);
        }
        break;

      case 'threat':
        if (a.stateT > a.stateDur) this.retreat(a);
        break;

      case 'swipe':
        if (a.stateT > a.stateDur) this.setState(a, 'threat', rand(1.2, 2));
        break;

      default: // idle, eat, rest, call
        if (a.stateT > a.stateDur) {
          if (a.state === 'eat' && this.hooks.onFed) this.hooks.onFed();
          this.chooseNext(a);
        }
    }

    this.applyGait(a, dt);
    this.updateSprite(a, dt);
    this.draw(a);
  }

  /* Ease into and out of a pace instead of snapping to it. */
  applyGait(a, dt) {
    const accel = a.targetSpeed > a.speed ? 130 : 260;
    const diff = a.targetSpeed - a.speed;
    a.speed += clamp(diff, -accel * dt, accel * dt);
  }

  moveToward(a, target, dt) {
    if (!target) return true;
    const dx = target.x - a.x;
    const dy = target.y - a.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 8) { a.targetSpeed = 0; return true; }

    // Slow down before arriving, and turn the body before setting off.
    const p = this.animal.profile;
    const cruise = (a.state === 'run' || a.state === 'flee') ? p.walkSpeed * 3.1
                 : a.state === 'stalk' ? p.stalkSpeed : p.walkSpeed;
    a.targetSpeed = dist < 46 ? cruise * Math.max(0.28, dist / 46) : cruise;

    const want = dx > 0 ? 1 : -1;
    if (want !== a.dir && Math.abs(dx) > 14) {
      a.turning = 0.22;
      a.dir = want;
    }
    if (a.turning > 0) { a.turning -= dt; a.speed *= 0.9; }

    const step = a.speed * dt;
    a.x = clamp(a.x + (dx / dist) * step, 40, this.w - 40);
    a.y = clamp(a.y + (dy / dist) * step * 0.4, this.groundTop, this.groundBot);
    return false;
  }

  pounce(a) {
    const DUR = 0.45;
    this.setState(a, 'pounce', DUR);
    const lead = this.prey ? (this.prey.x > a.x ? 1 : -1) * 30 : 0;
    const tx = this.prey ? this.prey.x + lead : a.x + a.dir * 80;
    const ty = this.prey ? this.prey.y : a.y;
    a.pounceVX = (tx - a.x) / DUR;
    a.pounceVY = (ty - a.y) / DUR;
    a.speed = Math.hypot(a.pounceVX, a.pounceVY);

    if (this.prey) {
      this.prey.state = 'flee';
      this.prey.reactDelay = 0.2;
    }
  }

  resolvePounce(a) {
    const caught = this.prey &&
      Math.hypot(this.prey.x - a.x, this.prey.y - a.y) < CATCH_RANGE &&
      Math.random() > ESCAPE_CHANCE;

    if (caught) {
      this.removePrey(true);
      this.setState(a, 'eat', rand(4, 6.5));
      if (this.hooks.onHunt) this.hooks.onHunt(true);
    } else {
      if (this.prey) { this.prey.state = 'flee'; this.prey.stateDur = 3; }
      this.huntCooldown = rand(6, 11);
      this.setState(a, 'idle', rand(1.6, 2.6));
      if (this.hooks.onHunt) this.hooks.onHunt(false);
    }
  }

  eatFood(a) {
    if (this.food) { this.food.el.remove(); this.food = null; }
    this.setState(a, 'eat', rand(3.5, 5));
  }

  updatePrey(dt) {
    const p = this.prey;
    if (!p) return;
    p.stateT += dt;

    if (p.state === 'flee') {
      if (p.reactDelay > 0) {
        p.reactDelay -= dt;
      } else {
        p.dir = (this.actor.x > p.x) ? -1 : 1;
        p.x += p.dir * 190 * dt;
        if (p.x < -80 || p.x > this.w + 80) { this.removePrey(false); return; }
      }
    } else {
      if (p.stateT > p.stateDur) {
        p.stateT = 0;
        if (p.state === 'graze') {
          p.state = 'wander';
          p.stateDur = rand(0.9, 2);
          p.target = this.randomGroundPoint();
        } else {
          p.state = 'graze';
          p.stateDur = rand(3, 6);
        }
      }
      if (p.state === 'wander' && p.target) {
        const dx = p.target.x - p.x;
        if (Math.abs(dx) > 4) {
          p.dir = dx > 0 ? 1 : -1;
          p.x += p.dir * 24 * dt;
        }
      }
    }

    p.el.classList.toggle('is-fleeing', p.state === 'flee');
    const s = this.depthScale(p.y) * 0.85;
    p.el.style.zIndex = Math.round(p.y);
    p.el.style.transform = `translate3d(${p.x - 31}px, ${p.y - 44}px, 0) scale(${s})`;
    p.flip.style.transform = `scaleX(${p.dir})`;
  }

  draw(a) {
    const s = this.depthScale(a.y) * (a.held ? 1.05 : 1);
    a.el.style.zIndex = a.held ? 9000 : Math.round(a.y);
    a.el.style.transform = `translate3d(${a.x - 130}px, ${a.y - 160}px, 0) scale(${s})`;
    a.flip.style.transform = `scaleX(${a.dir})`;
  }

  /* ── Handling a wild animal ──────────────── */

  /* Warn first, then leave. How loudly depends on the species. */
  reactToHandling(a, wasTouchOnly) {
    a.dir = (this.lastTouchX != null && this.lastTouchX > a.x) ? 1 : -1;
    const p = this.animal.profile;

    if (this.hooks.onThreat) this.hooks.onThreat(wasTouchOnly);

    // A big cat that has just been grabbed may lash out before retreating.
    if (!wasTouchOnly && p.lashOut && Math.random() < 0.6) {
      this.setState(a, 'swipe', 0.6);
    } else {
      this.setState(a, 'threat', rand(1.3, 2.2));
    }
  }

  retreat(a) {
    const away = a.x < this.w / 2 ? this.w - 120 : 120;
    const jitter = rand(-120, 120);
    this.setState(a, 'flee', 5, {
      x: clamp(away + jitter, 70, this.w - 70),
      y: clamp(a.y + rand(-40, 40), this.groundTop, this.groundBot),
    });
  }

  grab(e, a) {
    e.preventDefault();
    const rect = this.root.getBoundingClientRect();
    const startX = e.clientX, startY = e.clientY;
    let moved = false;

    this.lastTouchX = e.clientX - rect.left;
    a.held = true;
    a.speed = 0;
    try { a.el.setPointerCapture(e.pointerId); } catch (err) { /* not fatal */ }
    a.el.classList.add('is-held');
    this.setState(a, 'held', Infinity);
    if (this.hooks.onGrab) this.hooks.onGrab();

    const move = ev => {
      if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > 6) moved = true;
      a.x = clamp(ev.clientX - rect.left, 30, this.w - 30);
      a.y = clamp(ev.clientY - rect.top + 44, 30, this.groundBot);
      this.lastTouchX = a.x;
      this.draw(a);
    };

    const up = () => {
      a.el.removeEventListener('pointermove', move);
      a.el.removeEventListener('pointerup', up);
      a.el.removeEventListener('pointercancel', up);
      a.held = false;
      a.el.classList.remove('is-held');

      if (!moved) {
        this.reactToHandling(a, true);   // just touched
        return;
      }
      if (a.y < this.groundTop) {
        a.fallTo = clamp(a.y + 90, this.groundTop, this.groundBot);
        a.fallV = 0;
        this.setState(a, 'fall', 3);
      } else {
        a.y = clamp(a.y, this.groundTop, this.groundBot);
        this.setState(a, 'land', 0.7);
      }
    };

    a.el.addEventListener('pointermove', move);
    a.el.addEventListener('pointerup', up);
    a.el.addEventListener('pointercancel', up);
  }

  /* ── Commands ────────────────────────────── */

  callOut() {
    if (this.actor.held) return;
    this.setState(this.actor, 'call', 2.2);
  }

  toss() { this.dropFood(); }
}
