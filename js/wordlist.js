/* ═══════════════════════════════════════════
   Wild Tails — wordlist.js
   Doubles as the solution pool AND the valid-guess
   pool: with no backend there's no dictionary to
   check against, so guesses must be wildlife words.
   ═══════════════════════════════════════════ */

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const WORDLIST = [
  'GROWL', 'CLAWS', 'FANGS', 'PROWL', 'PACKS', 'SCALE', 'SCALY', 'HOWLS',
  'STING', 'VENOM', 'TALON', 'HORNS', 'MANES', 'PELTS', 'STALK', 'HUNTS',
  'ROARS', 'FLOCK', 'HERDS', 'NESTS', 'PRIDE', 'SWARM', 'LEAPS', 'CHASE',
  'TRAIL', 'SCENT', 'MUSKY', 'WILDS', 'BEAST', 'TAMED', 'FERAL', 'ALPHA',
  'SPOTS', 'BITES', 'FEAST', 'PREYS', 'RIVER', 'MARSH', 'SWAMP', 'RIDGE',
  'CLIFF', 'CAVES', 'CREST', 'QUILL', 'SHELL', 'BEAKS', 'WINGS', 'GILLS',
  'GLIDE', 'SWOOP', 'LUNGE', 'TRACK', 'TRACE', 'SCOUT', 'GRAZE', 'FEEDS',
  'TIGER', 'HYENA', 'CIVET', 'GAURS', 'SLOTH', 'MACAW', 'EGRET', 'STORK',
];
