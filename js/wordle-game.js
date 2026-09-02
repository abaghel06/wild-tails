/* ═══════════════════════════════════════════
   Wild Tails — wordle-game.js
   Daily wildlife word game. Everything (word of
   the day, progress, stats) is derived or stored
   client-side — there is no server.
   ═══════════════════════════════════════════ */

const PROGRESS_KEY = 'wildtails:wordle:progress';
const STATS_KEY = 'wildtails:wordle:stats';
const PUZZLE_EPOCH = new Date(2026, 0, 1);
const DAY_MS = 86400000;

const KB_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
];

const boardEl = document.getElementById('board');
const keyboardEl = document.getElementById('keyboard');
const toastEl = document.getElementById('toast');
const resultEl = document.getElementById('result');

let answer = '';
let guesses = [];
let current = '';
let isOver = false;
let isWin = false;
let toastTimer = null;

/* ── Daily word ── */

function todayKey(date = new Date()) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dailyWord(date = new Date()) {
  const midnight = new Date(date);
  midnight.setHours(0, 0, 0, 0);
  const days = Math.floor((midnight - PUZZLE_EPOCH) / DAY_MS);
  const idx = ((days % WORDLIST.length) + WORDLIST.length) % WORDLIST.length;
  return WORDLIST[idx];
}

/* ── Scoring (two passes, so repeated letters score correctly) ── */

function scoreGuess(guess, target) {
  const result = Array(WORD_LENGTH).fill('absent');
  const bank = target.split('');

  guess.split('').forEach((ch, i) => {
    if (ch === bank[i]) { result[i] = 'correct'; bank[i] = null; }
  });
  guess.split('').forEach((ch, i) => {
    if (result[i] === 'correct') return;
    const idx = bank.indexOf(ch);
    if (idx !== -1) { result[i] = 'present'; bank[idx] = null; }
  });

  return result;
}

/* ── Rendering ── */

function renderBoard() {
  boardEl.innerHTML = '';
  for (let r = 0; r < MAX_GUESSES; r++) {
    const row = document.createElement('div');
    row.className = 'row';
    row.dataset.row = r;

    const word = guesses[r] !== undefined ? guesses[r] : (r === guesses.length ? current : '');
    const scored = guesses[r] !== undefined ? scoreGuess(guesses[r], answer) : null;

    for (let c = 0; c < WORD_LENGTH; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      const letter = word[c] || '';
      tile.textContent = letter;
      if (letter) tile.classList.add('filled');
      if (scored) tile.classList.add('tile-' + scored[c]);
      row.appendChild(tile);
    }
    boardEl.appendChild(row);
  }
}

function renderKeyboard() {
  const best = {};
  const rank = { absent: 0, present: 1, correct: 2 };

  guesses.forEach(g => {
    scoreGuess(g, answer).forEach((status, i) => {
      const ch = g[i];
      if (!best[ch] || rank[status] > rank[best[ch]]) best[ch] = status;
    });
  });

  keyboardEl.innerHTML = KB_ROWS.map(row => (
    `<div class="kb-row">` + row.map(key => {
      const wide = key.length > 1 ? ' wide' : '';
      const status = best[key] ? ' key-' + best[key] : '';
      const label = key === 'DEL' ? '⌫' : key;
      return `<button class="key${wide}${status}" type="button" data-key="${key}">${label}</button>`;
    }).join('') + `</div>`
  )).join('');
}

function toast(message) {
  clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.hidden = false;
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 1800);
}

function shakeCurrentRow() {
  const row = boardEl.querySelector(`.row[data-row="${guesses.length}"]`);
  if (!row) return;
  row.classList.add('shake');
  setTimeout(() => row.classList.remove('shake'), 420);
}

function renderResult() {
  if (!isOver) { resultEl.hidden = true; return; }

  const stats = readStats();
  document.getElementById('resultTitle').textContent = isWin ? 'Tracked it down! 🐾' : 'It slipped away…';
  document.getElementById('resultWord').innerHTML = isWin
    ? `You got it in ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'}.`
    : `The word was <strong>${answer}</strong>.`;
  document.getElementById('statPlayed').textContent = stats.played;
  document.getElementById('statWinPct').textContent = stats.played ? Math.round((stats.wins / stats.played) * 100) + '%' : '0%';
  document.getElementById('statStreak').textContent = stats.currentStreak;
  document.getElementById('statMax').textContent = stats.maxStreak;
  resultEl.hidden = false;
}

/* ── Persistence ── */

function readStats() {
  return WT.read(STATS_KEY, {
    played: 0, wins: 0, currentStreak: 0, maxStreak: 0,
    lastWinDate: null, guessDistribution: [0, 0, 0, 0, 0, 0],
  });
}

function saveProgress() {
  WT.write(PROGRESS_KEY, { date: todayKey(), guesses, isOver, isWin });
}

function loadProgress() {
  const saved = WT.read(PROGRESS_KEY, null);
  if (!saved || saved.date !== todayKey()) return;
  guesses = Array.isArray(saved.guesses) ? saved.guesses : [];
  isOver = !!saved.isOver;
  isWin = !!saved.isWin;
}

function recordResult(won) {
  const stats = readStats();
  const today = todayKey();
  const yesterday = todayKey(new Date(Date.now() - DAY_MS));

  stats.played += 1;
  if (won) {
    stats.wins += 1;
    stats.guessDistribution[guesses.length - 1] += 1;
    stats.currentStreak = stats.lastWinDate === yesterday ? stats.currentStreak + 1 : 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.lastWinDate = today;
  } else {
    stats.currentStreak = 0;
  }

  WT.write(STATS_KEY, stats);
}

/* ── Play ── */

function pressKey(key) {
  if (isOver) return;

  if (key === 'ENTER') return submitGuess();
  if (key === 'DEL') {
    current = current.slice(0, -1);
    return renderBoard();
  }
  if (/^[A-Z]$/.test(key) && current.length < WORD_LENGTH) {
    current += key;
    renderBoard();
  }
}

function submitGuess() {
  if (current.length < WORD_LENGTH) {
    shakeCurrentRow();
    return toast('Needs five letters');
  }
  if (!WORDLIST.includes(current)) {
    shakeCurrentRow();
    return toast('Not in the wildlife word list');
  }

  guesses.push(current);
  const won = current === answer;
  current = '';

  if (won || guesses.length === MAX_GUESSES) {
    isOver = true;
    isWin = won;
    recordResult(won);
  }

  saveProgress();
  renderBoard();
  renderKeyboard();
  renderResult();
}

keyboardEl.addEventListener('click', e => {
  const btn = e.target.closest('.key');
  if (btn) pressKey(btn.dataset.key);
});

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const key = e.key === 'Backspace' ? 'DEL' : e.key === 'Enter' ? 'ENTER' : e.key.toUpperCase();
  if (key === 'DEL' || key === 'ENTER' || /^[A-Z]$/.test(key)) {
    e.preventDefault();
    pressKey(key);
  }
});

answer = dailyWord();
loadProgress();
renderBoard();
renderKeyboard();
renderResult();
