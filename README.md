# 🐾 Wild Tails

Four wild animals of India, living their day in their own habitats. An Indian wolf on the Deccan grasslands, a Bengal tiger in the Sundarbans, an Asiatic lion in Gir, a cobra in village farmland.

They are not pets, and they don't behave like pets.

**Live:** https://abaghel06.github.io/wild-tails/

## What it does

- **The habitat is the whole page.** Sky, treeline, ground and scrub fill the window, with grass and branches moving in the wind, clouds drifting, a kite working the thermals overhead.
- **The animals decide for themselves.** A behaviour loop runs each animal through patrolling, standing and listening, stalking, rushing prey, feeding, resting and calling — weighted by species, so the lion rests far more than the wolf and the tiger stalks more than either.
- **Real locomotion.** Stride rate is derived from actual ground speed, so the feet never skate; animals accelerate, slow into a stop, turn their body before setting off, and drop into a crouch to stalk.
- **Wild reactions.** Reach in and touch one and it does what a wild animal does. The tiger wheels round with its ears pinned flat and swipes. The lion stands its ground and roars. The wolf curls a lip and leaves. The cobra rears, spreads its hood and strikes. Handling costs you trust; leaving food out and keeping your distance is the only thing that earns it.
- **Habitat sound**, synthesised live in the browser — wind, cicadas, water, birds, and each animal's own voice. No audio files.
- **Field notes** with real facts about each species and where it actually lives.
- **Wild Words** — a daily five-letter word game where every answer comes from the wild.

Trust, names and game streaks are saved in your browser's `localStorage`. Nothing leaves your device — no backend, no account, no analytics.

## Built with

Plain HTML, CSS and JavaScript. No frameworks, no libraries, no build step. Every animal, plant and habitat is hand-drawn SVG; every movement is CSS keyframes driven by a small simulation loop; the sound is Web Audio oscillators and filtered noise.

```
index.html            landing habitat + the four animals
habitat.html          one animal in its own habitat (?animal=wolf|tiger|lion|cobra)
games/wordle.html     the word game
css/base.css          design tokens and page furniture
css/habitat.css       the world, the scenery, and the whole animation rig
js/animals-data.js    anatomy, markings, behaviour profiles, reactions, facts
js/habitat-art.js     the habitats: treelines, grass, water, clouds, birds
js/scene.js           the simulation — behaviour, locomotion, hunting, handling
js/ambience.js        synthesised habitat sound
```

## Running it locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

---

Made by [Amit Baghel](https://abaghel06.github.io).
