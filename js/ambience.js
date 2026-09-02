/* ═══════════════════════════════════════════
   Wild Tails — ambience.js

   Habitat sound, generated live with the Web Audio
   API — no audio files, nothing to license, a few
   hundred bytes instead of a few megabytes.

   Wind is filtered noise. Insects are detuned
   oscillator pairs. Birds are short pitch sweeps
   fired on a loose timer. Each habitat mixes them
   differently, and the animals have their own calls.

   Browsers won't let a page make noise until the
   visitor asks, so this stays off until the toggle
   is pressed.
   ═══════════════════════════════════════════ */

const Ambience = {
  ctx: null,
  on: false,
  nodes: {},
  timers: [],
  biome: 'grassland',

  /* A reusable buffer of pink-ish noise for wind, water and rustle. */
  noiseBuffer() {
    const ctx = this.ctx;
    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.0990460;
      b1 = 0.96300 * b1 + white * 0.2965164;
      b2 = 0.57000 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.16;
    }
    return buf;
  },

  start(biome) {
    this.biome = biome || this.biome;
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.stop();
    this.on = true;

    const ctx = this.ctx;
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.6);
    this.nodes.master = master;

    this.wind(master);
    if (this.biome === 'mangrove') this.stream(master);
    if (this.biome !== 'mangrove') this.insects(master);
    this.birdLoop(master);
  },

  stop() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    if (this.nodes.master) {
      try {
        this.nodes.master.gain.cancelScheduledValues(this.ctx.currentTime);
        this.nodes.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);
      } catch (e) { /* context already gone */ }
    }
    Object.values(this.nodes).forEach(n => {
      if (n && n.stop) { try { n.stop(this.ctx.currentTime + 0.5); } catch (e) {} }
    });
    setTimeout(() => {
      Object.values(this.nodes).forEach(n => { try { n.disconnect(); } catch (e) {} });
      this.nodes = {};
    }, 600);
    this.on = false;
  },

  /* Wind through dry grass, or heavier air in the mangroves. */
  wind(out) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer();
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = this.biome === 'mangrove' ? 420 : 620;
    filter.Q.value = 0.7;

    const gain = ctx.createGain();
    gain.gain.value = 0.16;

    // Slow gusting
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.06;
    lfoGain.gain.value = 0.1;
    lfo.connect(lfoGain).connect(gain.gain);

    src.connect(filter).connect(gain).connect(out);
    src.start(); lfo.start();
    this.nodes.wind = src;
    this.nodes.windLfo = lfo;
  },

  /* Tidal water for the Sundarbans. */
  stream(out) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer();
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;

    const gain = ctx.createGain();
    gain.gain.value = 0.1;

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.15;
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain).connect(gain.gain);

    src.connect(filter).connect(gain).connect(out);
    src.start(); lfo.start();
    this.nodes.water = src;
    this.nodes.waterLfo = lfo;
  },

  /* Cicadas and crickets — the constant bed of an Indian afternoon. */
  insects(out) {
    const ctx = this.ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0.028;
    gain.connect(out);

    [3100, 3250].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;

      const band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = freq;
      band.Q.value = 12;

      // Chirp rate — cicadas pulse rather than drone
      const trem = ctx.createOscillator();
      const tremGain = ctx.createGain();
      trem.type = 'sine';
      trem.frequency.value = 7 + i * 1.4;
      tremGain.gain.value = 0.5;
      const vca = ctx.createGain();
      vca.gain.value = 0.5;
      trem.connect(tremGain).connect(vca.gain);

      osc.connect(band).connect(vca).connect(gain);
      osc.start(); trem.start();
      this.nodes['insect' + i] = osc;
      this.nodes['trem' + i] = trem;
    });
  },

  /* An occasional bird — peacock, lapwing, egret, depending where you are. */
  bird(out) {
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const base = { grassland: 900, gir: 780, mangrove: 640, farmland: 1050, forest: 720 }[this.biome] || 880;
    const f0 = base * (0.85 + Math.random() * 0.4);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(f0, now);
    osc.frequency.exponentialRampToValueAtTime(f0 * 1.7, now + 0.09);
    osc.frequency.exponentialRampToValueAtTime(f0 * 0.9, now + 0.28);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc.connect(gain).connect(out);
    osc.start(now);
    osc.stop(now + 0.5);
  },

  birdLoop(out) {
    const next = () => {
      if (!this.on) return;
      this.bird(out);
      if (Math.random() < 0.4) setTimeout(() => this.on && this.bird(out), 320);
      this.timers.push(setTimeout(next, 4000 + Math.random() * 9000));
    };
    this.timers.push(setTimeout(next, 1800));
  },

  /* The animal's own voice: a wolf's howl, a big cat's roar, a hiss. */
  call(kind) {
    if (!this.on || !this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const out = this.nodes.master;
    if (!out) return;

    if (kind === 'hiss') {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer();
      const bp = ctx.createBiquadFilter();
      bp.type = 'highpass'; bp.frequency.value = 2600;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.14, now + 0.06);
      g.gain.setValueAtTime(0.14, now + 0.7);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
      src.connect(bp).connect(g).connect(out);
      src.start(now); src.stop(now + 1.2);
      return;
    }

    if (kind === 'trumpet') {
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const g = ctx.createGain();
      const band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = 1500;
      band.Q.value = 1.8;

      osc.type = 'sawtooth';
      osc2.type = 'sawtooth';
      const f0 = 340;
      osc.frequency.setValueAtTime(f0, now);
      osc2.frequency.setValueAtTime(f0 * 1.01, now);
      // Sharp blaring rise, a wavering hold, then a falling-off honk.
      osc.frequency.exponentialRampToValueAtTime(f0 * 2.3, now + 0.14);
      osc.frequency.exponentialRampToValueAtTime(f0 * 2.0, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(f0 * 2.25, now + 0.5);
      osc.frequency.exponentialRampToValueAtTime(f0 * 1.9, now + 0.75);
      osc.frequency.exponentialRampToValueAtTime(f0 * 1.1, now + 1.3);
      osc2.frequency.exponentialRampToValueAtTime(f0 * 2.28, now + 0.14);
      osc2.frequency.exponentialRampToValueAtTime(f0 * 1.98, now + 0.3);
      osc2.frequency.exponentialRampToValueAtTime(f0 * 2.22, now + 0.5);
      osc2.frequency.exponentialRampToValueAtTime(f0 * 1.88, now + 0.75);
      osc2.frequency.exponentialRampToValueAtTime(f0 * 1.08, now + 1.3);

      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.26, now + 0.06);
      g.gain.setValueAtTime(0.26, now + 0.8);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc.connect(band); osc2.connect(band);
      band.connect(g).connect(out);
      osc.start(now); osc2.start(now);
      osc.stop(now + 1.5); osc2.stop(now + 1.5);
      return;
    }

    // Howl and roar are both low sweeps; the roar adds grit and drops.
    const roar = kind === 'roar';
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = roar ? 700 : 1400;

    osc.type = roar ? 'sawtooth' : 'sine';
    osc2.type = roar ? 'square' : 'sine';

    const f0 = roar ? 105 : 330;
    const dur = roar ? 1.5 : 2.4;

    osc.frequency.setValueAtTime(f0, now);
    osc2.frequency.setValueAtTime(f0 * 1.01, now);

    if (roar) {
      osc.frequency.exponentialRampToValueAtTime(f0 * 1.5, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(f0 * 0.6, now + dur);
      osc2.frequency.exponentialRampToValueAtTime(f0 * 1.48, now + 0.25);
      osc2.frequency.exponentialRampToValueAtTime(f0 * 0.58, now + dur);
    } else {
      osc.frequency.exponentialRampToValueAtTime(f0 * 1.35, now + 0.5);
      osc.frequency.setValueAtTime(f0 * 1.35, now + 1.5);
      osc.frequency.exponentialRampToValueAtTime(f0 * 0.9, now + dur);
      osc2.frequency.exponentialRampToValueAtTime(f0 * 1.36, now + 0.5);
      osc2.frequency.exponentialRampToValueAtTime(f0 * 0.9, now + dur);
    }

    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(roar ? 0.3 : 0.16, now + 0.12);
    g.gain.setValueAtTime(roar ? 0.3 : 0.16, now + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(lp); osc2.connect(lp);
    lp.connect(g).connect(out);
    osc.start(now); osc2.start(now);
    osc.stop(now + dur + 0.1); osc2.stop(now + dur + 0.1);
  },

  toggle(biome) {
    if (this.on) { this.stop(); return false; }
    this.start(biome);
    return true;
  },
};
