/* ═══════════════════════════════════════════
   Wild Tails — habitat-art.js

   Habitats drawn to match the animals: bold vector
   illustration. Layered silhouettes, saturated
   colour, heavy outlines, jagged foliage edges, and
   a warm gradient glow behind the treeline.

   Layers, back to front:
     sky → clouds → ridge → canopy → ground → scrub → animals
   ═══════════════════════════════════════════ */

const OUTLINE = '#1A1207';

/* Jagged-edged foliage mass — the spiky silhouette this style uses
   instead of a smooth blob. */
function foliage(cx, cy, rx, ry, spikes, fill, stroke) {
  let d = '';
  for (let i = 0; i <= spikes; i++) {
    const t = (i / spikes) * Math.PI * 2;
    const out = i % 2 === 0 ? 1 : 0.82;
    const x = cx + Math.cos(t) * rx * out;
    const y = cy + Math.sin(t) * ry * out;
    d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
  }
  return `<path d="${d}Z" fill="${fill}" stroke="${stroke || OUTLINE}" stroke-width="2" stroke-linejoin="round"/>`;
}

/* A tuft of grass: a few tapered blades, outlined. */
function tuft(fill, dark) {
  return `<svg viewBox="0 0 46 54">
    <path d="M23 54 C 16 40, 11 26, 7 12 L12 10 C 17 25, 21 39, 26 54 Z" fill="${fill}" stroke="${OUTLINE}" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M23 54 C 23 38, 23 24, 24 8 L29 9 C 28 25, 27 39, 27 54 Z" fill="${dark}" stroke="${OUTLINE}" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M23 54 C 29 40, 34 28, 40 16 L44 20 C 38 32, 32 42, 28 54 Z" fill="${fill}" stroke="${OUTLINE}" stroke-width="1.4" stroke-linejoin="round"/>
  </svg>`;
}

const ART = {
  /* Dry grassland & scrub — the Indian wolf's country */
  grassland: {
    label: 'Deccan grassland',
    ridge() {
      return `<svg viewBox="0 0 1200 220" preserveAspectRatio="none" class="layer-svg">
        <path d="M0 120 C 150 66, 300 96, 430 88 C 560 80, 660 118, 800 104
                 C 940 90, 1060 118, 1200 92 L1200 220 L0 220 Z"
              fill="#C9A455" stroke="${OUTLINE}" stroke-width="3"/>
        <path d="M0 158 C 170 122, 340 152, 520 144 C 720 134, 900 164, 1200 140
                 L1200 220 L0 220 Z" fill="#B8913F" stroke="${OUTLINE}" stroke-width="3"/>
      </svg>`;
    },
    canopy() {
      // Babool / acacia — the flat-crowned thorn tree of the dry plains
      return [6, 24, 46, 64, 83, 96].map((left, i) => {
        const s = 0.6 + (i % 3) * 0.2;
        return `<div class="tree acacia sway" style="left:${left}%; --s:${s}; --d:${(i * 1.7).toFixed(1)}s">
          <svg viewBox="0 0 150 160">
            <path d="M74 160 L70 92 M72 108 L96 88 M71 100 L48 82" stroke="${OUTLINE}" stroke-width="9" fill="none" stroke-linecap="round"/>
            <path d="M74 160 L70 92 M72 108 L96 88 M71 100 L48 82" stroke="#6B4E22" stroke-width="5" fill="none" stroke-linecap="round"/>
            <path d="M12 76 C 18 50, 46 38, 74 40 C 104 38, 132 50, 138 76
                     C 118 68, 96 64, 74 64 C 50 64, 30 68, 12 76 Z"
                  fill="#6E7A34" stroke="${OUTLINE}" stroke-width="2.6" stroke-linejoin="round"/>
            <path d="M26 62 C 36 48, 56 42, 74 43 C 94 43, 112 49, 122 62
                     C 104 56, 90 53, 74 53 C 54 53, 38 57, 26 62 Z" fill="#8A9642"/>
          </svg></div>`;
      }).join('');
    },
    scrub() {
      let out = '';
      for (let i = 0; i < 24; i++) {
        const depth = Math.random();
        out += `<div class="grass sway" style="left:${(Math.random() * 100).toFixed(1)}%;
                 bottom:${(4 + depth * 30).toFixed(1)}%; --s:${(0.45 + depth * 0.85).toFixed(2)};
                 --d:${(Math.random() * 3).toFixed(1)}s; opacity:${(0.62 + depth * 0.38).toFixed(2)}">
          ${tuft('#C4A busy', '#A98A38')}</div>`.replace('#C4A busy', '#C6A64A');
      }
      return out;
    },
    extras() {
      return `<div class="glow"></div>
      <div class="kite" style="--dur:38s"><svg viewBox="0 0 44 18">
        <path d="M3 10 C 11 2, 16 2, 22 9 C 28 2, 33 2, 41 10 C 32 7, 26 9, 22 14 C 18 9, 12 7, 3 10 Z"
              fill="#4A3A22" stroke="${OUTLINE}" stroke-width="1.6"/></svg></div>
      <div class="heat"></div>`;
    },
  },

  /* Sundarbans — tidal mangrove forest */
  mangrove: {
    label: 'Sundarbans mangrove',
    ridge() {
      return `<svg viewBox="0 0 1200 220" preserveAspectRatio="none" class="layer-svg">
        <path d="M0 96 C 120 56, 260 84, 380 74 C 520 62, 620 100, 760 86
                 C 900 72, 1040 100, 1200 70 L1200 220 L0 220 Z"
              fill="#3F6B45" stroke="${OUTLINE}" stroke-width="3"/>
        <path d="M0 140 C 150 108, 320 138, 500 128 C 700 118, 880 148, 1200 122
                 L1200 220 L0 220 Z" fill="#325838" stroke="${OUTLINE}" stroke-width="3"/>
      </svg>`;
    },
    canopy() {
      return [4, 21, 40, 58, 74, 91].map((left, i) => {
        const s = 0.62 + (i % 3) * 0.2;
        return `<div class="tree mangrove sway" style="left:${left}%; --s:${s}; --d:${(i * 1.3).toFixed(1)}s">
          <svg viewBox="0 0 150 170">
            <path d="M75 170 L75 92 M75 126 L48 170 M75 126 L102 170 M75 140 L60 170 M75 140 L90 170"
                  stroke="${OUTLINE}" stroke-width="10" fill="none" stroke-linecap="round"/>
            <path d="M75 170 L75 92 M75 126 L48 170 M75 126 L102 170 M75 140 L60 170 M75 140 L90 170"
                  stroke="#5A4327" stroke-width="6" fill="none" stroke-linecap="round"/>
            ${foliage(75, 62, 56, 36, 22, '#2F6238')}
            ${foliage(52, 50, 30, 22, 16, '#3F7A47')}
            ${foliage(100, 52, 28, 20, 16, '#3F7A47')}
          </svg></div>`;
      }).join('');
    },
    scrub() {
      let out = '';
      for (let i = 0; i < 20; i++) {
        const depth = Math.random();
        out += `<div class="grass sway" style="left:${(Math.random() * 100).toFixed(1)}%;
                 bottom:${(3 + depth * 26).toFixed(1)}%; --s:${(0.5 + depth * 0.75).toFixed(2)};
                 --d:${(Math.random() * 3).toFixed(1)}s; opacity:${(0.65 + depth * 0.35).toFixed(2)}">
          ${tuft('#4B8450', '#39683D')}</div>`;
      }
      return out;
    },
    extras() {
      return `<div class="glow"></div>
      <div class="water"><div class="shimmer"></div></div>
      <div class="kite" style="--dur:44s"><svg viewBox="0 0 44 18">
        <path d="M3 10 C 11 2, 16 2, 22 9 C 28 2, 33 2, 41 10 C 32 7, 26 9, 22 14 C 18 9, 12 7, 3 10 Z"
              fill="#F4F6F0" stroke="${OUTLINE}" stroke-width="1.6"/></svg></div>
      <div class="mist"></div>`;
    },
  },

  /* Gir — dry deciduous teak forest */
  gir: {
    label: 'Gir dry forest',
    ridge() {
      return `<svg viewBox="0 0 1200 220" preserveAspectRatio="none" class="layer-svg">
        <path d="M0 110 C 130 52, 250 92, 380 80 C 520 66, 620 110, 770 94
                 C 920 78, 1050 110, 1200 82 L1200 220 L0 220 Z"
              fill="#A98247" stroke="${OUTLINE}" stroke-width="3"/>
        <path d="M0 152 C 160 116, 330 148, 510 138 C 710 128, 880 158, 1200 132
                 L1200 220 L0 220 Z" fill="#95702F" stroke="${OUTLINE}" stroke-width="3"/>
      </svg>`;
    },
    canopy() {
      return [5, 22, 41, 59, 76, 92].map((left, i) => {
        const s = 0.62 + (i % 3) * 0.22;
        return `<div class="tree teak sway" style="left:${left}%; --s:${s}; --d:${(i * 1.5).toFixed(1)}s">
          <svg viewBox="0 0 150 170">
            <path d="M75 170 L72 86 M72 116 L100 96 M72 106 L44 88" stroke="${OUTLINE}" stroke-width="11" fill="none" stroke-linecap="round"/>
            <path d="M75 170 L72 86 M72 116 L100 96 M72 106 L44 88" stroke="#7A5522" stroke-width="7" fill="none" stroke-linecap="round"/>
            ${foliage(74, 56, 54, 38, 20, '#7C7A32')}
            ${foliage(48, 46, 28, 22, 14, '#93913F')}
            ${foliage(100, 48, 26, 20, 14, '#93913F')}
          </svg></div>`;
      }).join('');
    },
    scrub() {
      let out = '';
      for (let i = 0; i < 20; i++) {
        const depth = Math.random();
        if (Math.random() < 0.24) {
          out += `<div class="rock" style="left:${(Math.random() * 100).toFixed(1)}%;
                   bottom:${(4 + depth * 24).toFixed(1)}%; --s:${(0.55 + depth * 0.85).toFixed(2)}">
            <svg viewBox="0 0 70 40">
              <path d="M4 40 C 6 20, 20 8, 36 8 C 52 8, 64 20, 66 40 Z" fill="#9A8256" stroke="${OUTLINE}" stroke-width="2.4" stroke-linejoin="round"/>
              <path d="M16 40 C 18 26, 26 18, 38 18 C 47 18, 54 26, 56 40 Z" fill="#B29A6C"/>
            </svg></div>`;
        } else {
          out += `<div class="grass sway" style="left:${(Math.random() * 100).toFixed(1)}%;
                   bottom:${(4 + depth * 26).toFixed(1)}%; --s:${(0.5 + depth * 0.8).toFixed(2)};
                   --d:${(Math.random() * 3).toFixed(1)}s; opacity:${(0.62 + depth * 0.38).toFixed(2)}">
            ${tuft('#B08F3E', '#94742C')}</div>`;
        }
      }
      return out;
    },
    extras() {
      return `<div class="glow"></div>
      <div class="kite" style="--dur:40s"><svg viewBox="0 0 44 18">
        <path d="M3 10 C 11 2, 16 2, 22 9 C 28 2, 33 2, 41 10 C 32 7, 26 9, 22 14 C 18 9, 12 7, 3 10 Z"
              fill="#5A4526" stroke="${OUTLINE}" stroke-width="1.6"/></svg></div>
      <div class="heat"></div>`;
    },
  },

  /* Village farmland — where the cobra actually lives */
  farmland: {
    label: 'Village farmland',
    ridge() {
      return `<svg viewBox="0 0 1200 220" preserveAspectRatio="none" class="layer-svg">
        <path d="M0 130 L1200 112 L1200 220 L0 220 Z" fill="#8FB255" stroke="${OUTLINE}" stroke-width="3"/>
        <g stroke="${OUTLINE}" stroke-width="2.6" stroke-linejoin="round">
          <path d="M110 130 L152 96 L194 130 Z" fill="#C09B6A"/>
          <rect x="124" y="130" width="56" height="26" fill="#D8BE92"/>
          <path d="M960 126 L1004 90 L1048 126 Z" fill="#C09B6A"/>
          <rect x="976" y="126" width="56" height="28" fill="#D8BE92"/>
        </g>
        <g stroke="${OUTLINE}" stroke-width="2.6">
          <path d="M250 132 L250 96" stroke-width="7"/><path d="M890 128 L890 92" stroke-width="7"/>
        </g>
        <path d="M250 96 C 226 88, 210 92, 202 102 C 220 92, 236 92, 250 96 Z" fill="#4F7A3C" stroke="${OUTLINE}" stroke-width="2.2"/>
        <path d="M250 96 C 274 88, 292 92, 300 102 C 280 92, 264 92, 250 96 Z" fill="#4F7A3C" stroke="${OUTLINE}" stroke-width="2.2"/>
        <path d="M890 92 C 866 84, 850 88, 842 98 C 860 88, 876 88, 890 92 Z" fill="#4F7A3C" stroke="${OUTLINE}" stroke-width="2.2"/>
        <path d="M890 92 C 914 84, 932 88, 940 98 C 920 88, 904 88, 890 92 Z" fill="#4F7A3C" stroke="${OUTLINE}" stroke-width="2.2"/>
        <path d="M0 168 L1200 152 L1200 220 L0 220 Z" fill="#7DA146" stroke="${OUTLINE}" stroke-width="3"/>
      </svg>`;
    },
    canopy() {
      return [12, 35, 63, 87].map((left, i) => {
        const s = 0.6 + (i % 3) * 0.2;
        return `<div class="tree palm sway" style="left:${left}%; --s:${s}; --d:${(i * 1.9).toFixed(1)}s">
          <svg viewBox="0 0 150 190">
            <path d="M75 190 C 72 140, 70 100, 73 64" stroke="${OUTLINE}" stroke-width="13" fill="none" stroke-linecap="round"/>
            <path d="M75 190 C 72 140, 70 100, 73 64" stroke="#7E6034" stroke-width="8" fill="none" stroke-linecap="round"/>
            <g fill="#3F7A3C" stroke="${OUTLINE}" stroke-width="2.2" stroke-linejoin="round">
              <path d="M73 64 C 44 50, 22 56, 10 72 C 30 58, 52 56, 73 64 Z"/>
              <path d="M73 64 C 102 50, 126 56, 138 72 C 118 58, 94 56, 73 64 Z"/>
              <path d="M73 64 C 58 38, 44 26, 28 22 C 48 34, 62 48, 73 64 Z"/>
              <path d="M73 64 C 88 38, 104 26, 120 22 C 100 34, 84 48, 73 64 Z"/>
              <path d="M73 64 C 70 40, 72 24, 76 12 C 80 30, 78 48, 76 64 Z"/>
            </g>
          </svg></div>`;
      }).join('');
    },
    scrub() {
      let out = '';
      for (let i = 0; i < 28; i++) {
        const depth = Math.random();
        out += `<div class="grass crop sway" style="left:${(Math.random() * 100).toFixed(1)}%;
                 bottom:${(3 + depth * 30).toFixed(1)}%; --s:${(0.5 + depth * 0.8).toFixed(2)};
                 --d:${(Math.random() * 2.4).toFixed(1)}s; opacity:${(0.7 + depth * 0.3).toFixed(2)}">
          <svg viewBox="0 0 46 58">
            <path d="M23 58 L23 18" stroke="${OUTLINE}" stroke-width="5" stroke-linecap="round"/>
            <path d="M23 58 L23 18" stroke="#6B9440" stroke-width="3" stroke-linecap="round"/>
            <path d="M23 32 C 13 28, 8 18, 7 8 L13 7 C 15 17, 19 26, 26 31 Z" fill="#7CA84C" stroke="${OUTLINE}" stroke-width="1.4" stroke-linejoin="round"/>
            <path d="M23 26 C 33 22, 38 13, 39 4 L33 3 C 31 12, 27 20, 21 25 Z" fill="#7CA84C" stroke="${OUTLINE}" stroke-width="1.4" stroke-linejoin="round"/>
            <ellipse cx="23" cy="12" rx="5" ry="10" fill="#D4B44E" stroke="${OUTLINE}" stroke-width="1.4"/>
          </svg></div>`;
      }
      return out;
    },
    extras() {
      return `<div class="glow"></div>
      <div class="kite egret" style="--dur:50s"><svg viewBox="0 0 44 18">
        <path d="M3 10 C 11 2, 16 2, 22 9 C 28 2, 33 2, 41 10 C 32 7, 26 9, 22 14 C 18 9, 12 7, 3 10 Z"
              fill="#FBFBF4" stroke="${OUTLINE}" stroke-width="1.6"/></svg></div>`;
    },
  },
  /* Western Ghats — tall, humid, broad-leaved forest */
  forest: {
    label: 'Western Ghats forest',
    ridge() {
      return `<svg viewBox="0 0 1200 220" preserveAspectRatio="none" class="layer-svg">
        <path d="M0 88 C 140 44, 280 76, 400 64 C 540 50, 660 90, 800 74
                 C 940 58, 1060 90, 1200 62 L1200 220 L0 220 Z"
              fill="#3A5A34" stroke="${OUTLINE}" stroke-width="3"/>
        <path d="M0 134 C 160 100, 330 130, 510 118 C 710 106, 890 138, 1200 110
                 L1200 220 L0 220 Z" fill="#2E4A29" stroke="${OUTLINE}" stroke-width="3"/>
      </svg>`;
    },
    canopy() {
      // Tall broad-leaved forest giants, with a hanging vine or two
      return [3, 20, 38, 56, 73, 90].map((left, i) => {
        const s = 0.68 + (i % 3) * 0.22;
        return `<div class="tree jungle sway" style="left:${left}%; --s:${s}; --d:${(i * 1.6).toFixed(1)}s">
          <svg viewBox="0 0 150 190">
            <path d="M75 190 L73 78" stroke="${OUTLINE}" stroke-width="12" fill="none" stroke-linecap="round"/>
            <path d="M75 190 L73 78" stroke="#5C4A28" stroke-width="7" fill="none" stroke-linecap="round"/>
            ${foliage(74, 54, 60, 42, 24, '#3F6B38')}
            ${foliage(46, 46, 30, 24, 16, '#4E7C44')}
            ${foliage(102, 48, 30, 22, 16, '#4E7C44')}
            <path d="M52 86 C 50 118, 54 148, 50 176" stroke="#3F6B38" stroke-width="3" fill="none" stroke-linecap="round"/>
          </svg></div>`;
      }).join('');
    },
    scrub() {
      let out = '';
      for (let i = 0; i < 24; i++) {
        const depth = Math.random();
        out += `<div class="grass sway" style="left:${(Math.random() * 100).toFixed(1)}%;
                 bottom:${(3 + depth * 28).toFixed(1)}%; --s:${(0.55 + depth * 0.85).toFixed(2)};
                 --d:${(Math.random() * 3).toFixed(1)}s; opacity:${(0.66 + depth * 0.34).toFixed(2)}">
          ${tuft('#5C8A46', '#436834')}</div>`;
      }
      return out;
    },
    extras() {
      return `<div class="glow"></div>
      <div class="kite" style="--dur:46s"><svg viewBox="0 0 44 18">
        <path d="M3 10 C 11 2, 16 2, 22 9 C 28 2, 33 2, 41 10 C 32 7, 26 9, 22 14 C 18 9, 12 7, 3 10 Z"
              fill="#2A241A" stroke="${OUTLINE}" stroke-width="1.6"/></svg></div>
      <div class="mist"></div>`;
    },
  },
};

function paintHabitat(root, biome) {
  const art = ART[biome] || ART.grassland;
  root.dataset.biome = biome;
  root.querySelector('.ridge').innerHTML = art.ridge();
  root.querySelector('.canopy').innerHTML = art.canopy();
  root.querySelector('.scrub').innerHTML = art.scrub();
  root.querySelector('.extras').innerHTML = art.extras();

  const clouds = root.querySelector('.clouds');
  let html = '';
  for (let i = 0; i < 4; i++) {
    html += `<div class="cloud" style="top:${5 + i * 7}%; --dur:${95 + i * 34}s; --delay:${-i * 26}s;
              --s:${(0.7 + Math.random() * 0.8).toFixed(2)}; opacity:${(0.5 + Math.random() * 0.35).toFixed(2)}">
      <svg viewBox="0 0 210 80">
        <path d="M22 62 C 6 62, 4 42, 20 38 C 22 20, 48 14, 60 28 C 74 10, 108 12, 116 32
                 C 138 24, 162 34, 162 50 C 182 50, 188 62, 176 68 C 140 72, 60 72, 22 62 Z"
              fill="#FFFFFF" stroke="${OUTLINE}" stroke-width="2" stroke-linejoin="round" opacity="0.92"/>
      </svg></div>`;
  }
  clouds.innerHTML = html;
  return art.label;
}
