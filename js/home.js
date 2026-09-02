/* ═══════════════════════════════════════════
   Wild Tails — home.js
   The landing page is a habitat too: one of the
   four animals is out there living its day behind
   the cards, picked at random each visit.
   ═══════════════════════════════════════════ */

function esc(str) {
  return String(str).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

const world = document.getElementById('world');
const host = pick(ANIMAL_ORDER);
paintHabitat(world, ANIMALS[host].biome);

const scene = new Scene(world, ANIMALS[host], {
  onCall: () => Ambience.call(ANIMALS[host].profile.voice),
  onThreat: () => Ambience.call(ANIMALS[host].profile.voice),
});

document.getElementById('picker').innerHTML = ANIMAL_ORDER.map(id => {
  const a = ANIMALS[id];
  const saved = WT.read(WT.moodKey(id), null);
  const label = (saved && saved.petName) || a.name;
  const seen = saved && saved.lastSeen;
  const thumb = `${a.frames.dir}/frame-${String(a.frames.idle[0]).padStart(2, '0')}.png`;
  return `
    <a class="panel animal-card" href="habitat.html?animal=${id}">
      <img src="${thumb}" alt="${esc(a.name)}" loading="lazy">
      <p class="card-name" style="color:${a.accent}">${esc(label)}</p>
      <p class="card-habitat">${esc(a.habitat)}</p>
      <span class="card-cta" style="background:${a.accentDim};color:${a.accent}">
        ${seen ? 'Back to it →' : 'Go and watch →'}
      </span>
    </a>`;
}).join('');

const btn = document.getElementById('btnSound');
btn.addEventListener('click', () => {
  const on = Ambience.toggle(ANIMALS[host].biome);
  btn.textContent = on ? '🔊 Sound' : '🔇 Sound';
  btn.setAttribute('aria-pressed', String(on));
});
