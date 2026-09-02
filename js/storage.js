/* ═══════════════════════════════════════════
   Wild Tails — storage.js
   Safe localStorage wrapper (JSON in / JSON out)
   ═══════════════════════════════════════════ */

const WT = {
  read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },

  write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  },

  moodKey(slug) {
    return 'wildtails:mood:' + slug;
  },
};
