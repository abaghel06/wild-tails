/* ═══════════════════════════════════════════
   Wild Tails — animals-data.js

   Each animal is rendered from a hand-illustrated
   24-frame sprite sheet (assets/<animal>-frames/frame-NN.png),
   all facing right, background already keyed to transparent.

   `frames` marks which frame numbers cover which behaviour:
   walk, run, idle (standing/alert), rest (lying down), and
   threat (the aggressive/defensive pose). scene.js cycles
   through a range at a rate tied to actual ground speed, so
   motion speed and animation speed always match.
   ═══════════════════════════════════════════ */

const ANIMALS = {
  wolf: {
    slug: 'wolf',
    name: 'Indian Wolf',
    species: 'Canis lupus pallipes',
    habitat: 'Dry grasslands & scrub of peninsular India',
    accent: '#7A6E5F',
    accentDim: '#EFEAE1',
    biome: 'grassland',
    prey: 'hare',
    // Behaviour weighting — a wolf paces and patrols more than it rests.
    profile: {
      walkSpeed: 40, stalkSpeed: 26, stride: 52,
      restBias: 0.8, huntBias: 1.3, callBias: 1.4,
      lashOut: false, voice: 'howl',
    },
    reactions: {
      touch: 'flinches away and curls a lip — a wild wolf wants nothing to do with a hand',
      grab: 'twists free, ears flat, hackles up',
      threat: 'holds its ground stiff-legged, teeth showing, then breaks away',
    },
    facts: [
      "I'm the Indian grey wolf — I live in the dry grasslands and scrub of Maharashtra, Karnataka, Gujarat and Rajasthan, not the snowy forests most people picture.",
      "My packs are small, usually six to eight of us. The open scrub I live in doesn't hold enough big prey to feed a large pack.",
      "Blackbuck, chinkara and hares are my usual meals, and I hunt mostly at dawn and dusk to stay out of the heat.",
      "My coat is much thinner than my Himalayan and Arctic cousins' — the plains I live on cross 40°C in summer.",
      "Grasslands like mine are often written down as 'wasteland' in land records. That paperwork is one of the biggest reasons my home keeps shrinking.",
      "There may be only a couple of thousand of us left in India, which makes me one of the most threatened wolves anywhere on Earth.",
    ],
    frames: {
      dir: 'assets/wolf-frames', count: 24,
      walk: [1, 6],
      run: [7, 13],
      idle: [19, 22],
      rest: [23, 23],
      threat: [24, 24],
    },
  },

  tiger: {
    slug: 'tiger',
    name: 'Bengal Tiger',
    species: 'Panthera tigris tigris',
    habitat: 'Sundarbans mangroves, central Indian forests & the Terai',
    accent: '#C86A1E',
    accentDim: '#FBEBD9',
    biome: 'mangrove',
    prey: 'chital',
    // Ambush hunter: stalks far more than it paces.
    profile: {
      walkSpeed: 30, stalkSpeed: 20, stride: 68,
      restBias: 1.2, huntBias: 1.8, callBias: 1.0,
      lashOut: true, voice: 'roar',
    },
    reactions: {
      touch: 'wheels round with a cough of a growl — this is an apex predator, not a cat',
      grab: 'twists, roars and swipes with a forepaw',
      threat: 'ears pinned flat and sideways, tail lashing — the last warning you get',
    },
    facts: [
      "I'm India's national animal — and roughly three out of every four wild tigers on Earth live right here.",
      "In the Sundarbans I swim between mangrove islands. Tigers are strong swimmers and I'll happily cross a wide channel.",
      "No two of us share the same stripe pattern. It works like a fingerprint, which is how researchers tell me apart in camera-trap photos.",
      "My stripes aren't only on my fur — they're on my skin too. Shave me and the pattern would still be there.",
      "I need a lot of room, often 20 square kilometres or more, which is why the forest corridors linking reserves matter so much.",
      "Project Tiger started in 1973 with nine reserves. India has more than fifty tiger reserves today.",
    ],
    frames: {
      dir: 'assets/tiger-frames', count: 24,
      walk: [1, 6],
      stalk: [7, 12],
      run: [15, 18],
      idle: [19, 21],
      rest: [22, 23],
      threat: [24, 24],
    },
  },

  lion: {
    slug: 'lion',
    name: 'Asiatic Lion',
    species: 'Panthera leo leo',
    habitat: 'Gir forest & the surrounding landscape, Gujarat',
    accent: '#A5762B',
    accentDim: '#F7EBD3',
    biome: 'gir',
    // Lions rest up to twenty hours a day — the profile says so.
    profile: {
      walkSpeed: 26, stalkSpeed: 19, stride: 64,
      restBias: 2.4, huntBias: 1.0, callBias: 1.6,
      lashOut: true, voice: 'roar',
    },
    reactions: {
      touch: 'turns and lets out a low warning roar, standing its ground',
      grab: 'roars, twists free and swats the air where your hand was',
      threat: 'stares you down, roaring — it does not run from much',
    },
    prey: 'chital',
    facts: [
      "Every wild Asiatic lion on Earth lives in one landscape: the Gir forest and the country around it, in Gujarat.",
      "My mane is shorter and darker than an African lion's, so you can almost always see my ears poking through it.",
      "I have a distinctive fold of skin running along my belly. African lions rarely show it — it's one of the easiest ways to tell us apart.",
      "My prides are smaller than African ones. Males like me often live apart from the females and join them mainly to mate or share a large kill.",
      "We very nearly disappeared. Barely a couple of dozen of us survived in the early 1900s, until the Nawab of Junagadh protected the last ones.",
      "Every Asiatic lion alive today descends from that tiny surviving group — there are several hundred of us now.",
    ],
    frames: {
      dir: 'assets/lion-frames', count: 24,
      walk: [1, 6],
      stalk: [7, 11],
      run: [12, 14],
      idle: [17, 21],
      rest: [22, 22],
      threat: [23, 24],
    },
  },

  cobra: {
    slug: 'cobra',
    name: 'Indian Cobra',
    species: 'Naja naja',
    habitat: 'Farmland, forest edges & village outskirts across India',
    accent: '#3F7A4A',
    accentDim: '#E3F0E5',
    biome: 'farmland',
    prey: 'rat',
    serpent: true,
    profile: {
      walkSpeed: 24, stalkSpeed: 18, stride: 46,
      restBias: 1.6, huntBias: 1.4, callBias: 1.2,
      lashOut: true, voice: 'hiss',
    },
    reactions: {
      touch: 'rears up, spreads its hood and hisses — one step from a strike',
      grab: 'thrashes, hood flared, and strikes at your hand',
      threat: 'holds its hood wide, swaying, tracking every movement you make',
    },
    facts: [
      "I'm the Indian cobra, the nag. I'm one of the 'big four' snakes behind most serious snakebites in India.",
      "The spectacle mark on the back of my hood is my signature — it looks like a pair of watching eyes when I turn away.",
      "My hood isn't always there. I spread it by fanning out long ribs in my neck when I feel threatened.",
      "I can't hear a charmer's flute the way you do. I have no external ears — I'm tracking the movement of the pungi, not the tune.",
      "I live close to people, in fields and around villages, hunting rats. That quietly protects a great deal of stored grain.",
      "I'm protected under India's Wildlife Protection Act of 1972, and that's also the law that made snake charming illegal.",
    ],
    frames: {
      dir: 'assets/cobra-frames', count: 24,
      walk: [1, 6],
      run: [7, 12],
      threat: [13, 18],
      rest: [19, 20],
      idle: [21, 24],
    },
  },

};

const ANIMAL_ORDER = ['wolf', 'tiger', 'lion', 'cobra'];

const PREY = {
  hare: {
    label: 'hare',
    svg: `<g><ellipse cx="22" cy="20" rx="13" ry="9" fill="#A89880"/>
      <circle cx="34" cy="14" r="6.5" fill="#B5A48B"/>
      <path d="M35 9 C 34 2, 37 0, 39 1 C 40 4, 39 8, 37 10 Z" fill="#A89880"/>
      <circle cx="37" cy="13" r="1.6" fill="#241E17"/>
      <path d="M14 27 L 12 33 M22 28 L 21 33 M30 26 L 31 32" stroke="#8E7F69" stroke-width="3" stroke-linecap="round"/>
      <path d="M10 18 C 5 16, 3 20, 7 22" fill="#B5A48B"/></g>`,
  },
  chital: {
    label: 'chital',
    svg: `<g><ellipse cx="24" cy="18" rx="15" ry="9" fill="#B08258"/>
      <path d="M36 14 C 40 8, 44 6, 46 8 L 44 16 Z" fill="#B08258"/>
      <circle cx="45" cy="12" r="1.6" fill="#241E17"/>
      <path d="M40 7 L 41 1 M43 7 L 46 2" stroke="#8A6440" stroke-width="2" stroke-linecap="round"/>
      <path d="M14 26 L 12 36 M22 27 L 21 36 M31 25 L 32 35" stroke="#9A6F4A" stroke-width="3.2" stroke-linecap="round"/>
      <circle cx="20" cy="14" r="1.4" fill="#E4D2BC"/><circle cx="28" cy="17" r="1.4" fill="#E4D2BC"/>
      <circle cx="16" cy="20" r="1.4" fill="#E4D2BC"/></g>`,
  },
  rat: {
    label: 'rat',
    svg: `<g><ellipse cx="20" cy="20" rx="12" ry="7.5" fill="#8C8279"/>
      <circle cx="31" cy="17" r="5.5" fill="#9A9088"/>
      <circle cx="28" cy="12" r="3" fill="#7E736B"/>
      <circle cx="34" cy="16" r="1.4" fill="#241E17"/>
      <path d="M8 21 C 2 22, 0 27, 4 29" stroke="#7E736B" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M14 26 L 13 31 M24 26 L 24 31" stroke="#7E736B" stroke-width="2.6" stroke-linecap="round"/></g>`,
  },
};
