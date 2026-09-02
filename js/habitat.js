/* ═══════════════════════════════════════════
   Wild Tails — habitat.js
   Wires the world to the page: trust (not
   affection), naming, field notes, the running
   commentary, and the sound toggle.
   ═══════════════════════════════════════════ */

const DAY_MS = 86400000;
const FACT_MS = 10000;

const el = {
  world: document.getElementById('world'),
  tabs: document.getElementById('animalTabs'),
  name: document.getElementById('animalName'),
  species: document.getElementById('animalSpecies'),
  habitat: document.getElementById('animalHabitat'),
  biomeLabel: document.getElementById('biomeLabel'),
  nameEditBtn: document.getElementById('nameEditBtn'),
  nameForm: document.getElementById('nameForm'),
  nameInput: document.getElementById('nameInput'),
  nameCancelBtn: document.getElementById('nameCancelBtn'),
  trustFill: document.getElementById('trustFill'),
  trustValue: document.getElementById('trustValue'),
  bubble: document.getElementById('factBubble'),
  factText: document.getElementById('factText'),
  factSpeaker: document.getElementById('factSpeaker'),
  factClose: document.getElementById('factClose'),
  doing: document.getElementById('doing'),
  btnSound: document.getElementById('btnSound'),
};

const slug = resolveSlug();
const animal = ANIMALS[slug];
let state = loadState(slug);
let factTimer = null;
let scene = null;

function resolveSlug() {
  const requested = new URLSearchParams(location.search).get('animal');
  return ANIMALS[requested] ? requested : 'wolf';
}

function defaultState() {
  // Wild animals start wary of people. Trust is earned, and it is easy to lose.
  return {
    trust: 22,
    lastSeen: Date.now(),
    counts: { fed: 0, hunts: 0, disturbed: 0 },
    factIndex: 0,
    factsSeen: 0,
    petName: '',
  };
}

function loadState(id) {
  const stored = WT.read(WT.moodKey(id), null);
  if (!stored) return defaultState();

  const merged = Object.assign(defaultState(), stored);
  merged.counts = Object.assign({ fed: 0, hunts: 0, disturbed: 0 }, stored.counts);
  if (typeof stored.trust !== 'number') merged.trust = 22;

  // Left alone for a while, a wild animal settles back to its own baseline.
  const daysAway = Math.floor((Date.now() - merged.lastSeen) / DAY_MS);
  if (daysAway >= 1) merged.trust = merged.trust + (30 - merged.trust) * Math.min(0.35 * daysAway, 0.7);
  return merged;
}

const save = () => { state.lastSeen = Date.now(); WT.write(WT.moodKey(slug), state); };
const displayName = () => state.petName || animal.name;

function trustWord(v) {
  if (v < 20) return 'Keeps away';
  if (v < 40) return 'Wary';
  if (v < 60) return 'Tolerates you';
  if (v < 82) return 'At ease';
  return 'Unbothered';
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* ── Commentary ── */

const DOING = {
  idle:   ['stops and listens', 'lifts its head, testing the air', 'stands still, watching'],
  walk:   ['moves through its range', 'walks the treeline', 'patrols'],
  run:    ['breaks into a run'],
  flee:   ['puts distance between you and it'],
  stalk:  ['drops low — it has seen something', 'stalks, one slow paw at a time', 'closes the gap'],
  pounce: ['rushes!'],
  eat:    ['feeds', 'is eating'],
  rest:   ['lies down in the shade', 'rests, eyes half shut'],
  call:   ['calls out across the habitat'],
  held:   ['is struggling in your hands'],
  fall:   ['is dropping'],
  land:   ['hits the ground and rights itself'],
  threat: null,   // set from the species' own reaction text
  swipe:  null,
};

let lastDoing = '';
function setDoing(stateName) {
  if (stateName === lastDoing) return;
  lastDoing = stateName;

  let text, alarm = false;
  if (stateName === 'threat') {
    text = `${displayName()} ${animal.reactions.threat}`;
    alarm = true;
  } else if (stateName === 'swipe') {
    text = `${displayName()} ${animal.reactions.grab}`;
    alarm = true;
  } else if (stateName === 'held') {
    text = `${displayName()} ${DOING.held[0].replace('is ', 'is ')}`;
    alarm = true;
  } else {
    const lines = DOING[stateName];
    if (!lines) return;
    text = `${displayName()} ${pick(lines)}`;
  }
  el.doing.textContent = text;
  el.doing.classList.toggle('alarm', alarm);
}

/* ── Trust ── */

function adjustTrust(delta, counter) {
  state.trust = Math.max(0, Math.min(100, state.trust + delta));
  if (counter) state.counts[counter] = (state.counts[counter] || 0) + 1;
  save();
  renderTrust();
}

/* ── Rendering ── */

function renderTabs() {
  el.tabs.innerHTML = ANIMAL_ORDER.map(id => {
    const a = ANIMALS[id];
    const saved = WT.read(WT.moodKey(id), null);
    const label = (saved && saved.petName) || a.name;
    return `<a class="animal-tab${id === slug ? ' current' : ''}" href="habitat.html?animal=${id}">${escapeHtml(label)}</a>`;
  }).join('');
}

function renderChrome() {
  document.documentElement.style.setProperty('--animal-accent', animal.accent);
  document.documentElement.style.setProperty('--animal-dim', animal.accentDim);
  el.species.textContent = animal.species;
  el.habitat.textContent = animal.habitat;
  el.biomeLabel.textContent = paintHabitat(el.world, animal.biome);
  renderName();
}

function renderName() {
  el.name.textContent = displayName();
  el.nameEditBtn.title = state.petName ? 'Rename' : 'Give it a name';
  document.title = `${displayName()} — Wild Tails`;
}

function renderTrust() {
  el.trustFill.style.width = state.trust + '%';
  el.trustValue.textContent = trustWord(state.trust);
}

/* ── Field notes ── */

function showFact() {
  const fact = animal.facts[state.factIndex % animal.facts.length];
  state.factIndex = (state.factIndex + 1) % animal.facts.length;
  state.factsSeen = Math.min(animal.facts.length, state.factsSeen + 1);
  save();

  el.factSpeaker.textContent = `${displayName()} — field note`;
  el.factText.textContent = fact;
  el.bubble.hidden = false;

  clearTimeout(factTimer);
  factTimer = setTimeout(hideFact, FACT_MS);
}

function hideFact() {
  clearTimeout(factTimer);
  el.bubble.hidden = true;
}

function trackBubble(actor) {
  if (el.bubble.hidden) return;
  const bw = el.bubble.offsetWidth;
  const bh = el.bubble.offsetHeight;
  const x = Math.min(Math.max(actor.x - bw / 2, 8), window.innerWidth - bw - 8);
  const y = Math.max(actor.y - 160 * scene.depthScale(actor.y) - bh - 6, 70);
  el.bubble.style.left = x + 'px';
  el.bubble.style.top = y + 'px';
}

/* ── Naming ── */

function openNameEditor() {
  el.nameInput.value = state.petName;
  el.nameForm.hidden = false;
  el.name.hidden = true;
  el.nameEditBtn.hidden = true;
  el.nameInput.focus();
  el.nameInput.select();
}

function closeNameEditor() {
  el.nameForm.hidden = true;
  el.name.hidden = false;
  el.nameEditBtn.hidden = false;
}

const cleanName = raw =>
  raw.replace(/[^\p{L}\p{N} '\-.]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 20);

/* ── Boot ── */

renderChrome();
renderTrust();
renderTabs();

scene = new Scene(el.world, animal, {
  trust: () => state.trust,
  onFrame: trackBubble,
  onState: setDoing,

  // Handling a wild animal costs you its trust, every time.
  onGrab: () => adjustTrust(-6, 'disturbed'),
  onThreat: touchOnly => {
    adjustTrust(touchOnly ? -4 : -9);
    el.doing.textContent = `${displayName()} ${touchOnly ? animal.reactions.touch : animal.reactions.grab}`;
    el.doing.classList.add('alarm');
    lastDoing = 'reaction';
    Ambience.call(animal.profile.voice);
  },

  // Food left out, and space given, is the only thing that earns trust.
  onFed: () => {
    adjustTrust(+7, 'fed');
    el.doing.classList.remove('alarm');
  },
  onHunt: success => { if (success) adjustTrust(+2, 'hunts'); },
  onCall: () => Ambience.call(animal.profile.voice),
});

document.getElementById('btnFeed').addEventListener('click', () => scene.toss());
document.getElementById('btnCall').addEventListener('click', () => scene.callOut());
document.getElementById('btnFact').addEventListener('click', showFact);
el.factClose.addEventListener('click', hideFact);

el.btnSound.addEventListener('click', () => {
  const on = Ambience.toggle(animal.biome);
  el.btnSound.textContent = on ? '🔊 Sound' : '🔇 Sound';
  el.btnSound.setAttribute('aria-pressed', String(on));
});

el.nameEditBtn.addEventListener('click', openNameEditor);
el.nameCancelBtn.addEventListener('click', closeNameEditor);
el.nameForm.addEventListener('submit', e => {
  e.preventDefault();
  state.petName = cleanName(el.nameInput.value);
  save();
  closeNameEditor();
  renderName();
  renderTabs();
  lastDoing = '';
});
