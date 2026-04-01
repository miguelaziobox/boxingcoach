/* ── DATA (v1.0.1 - Vercel Fix) ── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DNAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const CIRC = 2 * Math.PI * 75;

let currentLang = localStorage.getItem('lang') || 'en';

window.addEventListener('DOMContentLoaded', () => {
  const selector = document.getElementById('langSelect');
  if (selector) selector.value = currentLang;
  applyTranslations(document.body);
  highlightLevel();
  
  if (currentLang !== 'en') {
    const observer = new MutationObserver((mutations) => {
      observer.disconnect();
      applyTranslations(document.body);
      observer.observe(document.body, { childList: true, subtree: true });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
});

function changeLanguage(lang) {
  localStorage.setItem('lang', lang);
  currentLang = lang;
  window.location.reload();
}

function applyTranslations(root) {
  if (currentLang === 'en' || typeof PT_DICT === 'undefined') return;
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
  let n;
  while(n = walk.nextNode()) {
    const parent = n.parentNode;
    if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) continue;
    let txt = n.nodeValue;
    let trimmed = txt.trim();
    if (trimmed && PT_DICT[trimmed]) {
      n.nodeValue = txt.replace(trimmed, PT_DICT[trimmed]);
    }
  }
}

function T(txt) {
  if (currentLang === 'en' || typeof PT_DICT === 'undefined') return txt;
  return PT_DICT[txt] || txt;
}

const PUNCH_DATA = {
  jab:      { label: 'Jab',      chip: 'chip-jab',      word: 'JAB!',    delay: 400 },
  cross:    { label: 'Cross',    chip: 'chip-cross',    word: 'CROSS!',  delay: 450 },
  hook:     { label: 'Hook',     chip: 'chip-hook',     word: 'HOOK!',   delay: 1000 },
  uppercut: { label: 'Uppercut', chip: 'chip-uppercut', word: 'UPPER!',  delay: 1000 },
  body:     { label: 'Body',     chip: 'chip-body',     word: 'BODY!',   delay: 1000 },
  slip:     { label: 'Slip',     chip: 'chip-slip',     word: 'SLIP!',   delay: 900 },
};

const COMBOS = [
  { name: 'Jab–Cross (1–2)',         punches: ['jab','cross'] },
  { name: 'Jab–Cross–Hook (1–2–3)',  punches: ['jab','cross','hook'] },
  { name: 'Double Jab–Cross',        punches: ['jab','jab','cross'] },
  { name: '1–2–3–2',                 punches: ['jab','cross','hook','cross'] },
  { name: 'Slip–Cross–Hook',         punches: ['slip','cross','hook'] },
  { name: 'Body–Head Jab',           punches: ['body','jab'] },
  { name: 'Jab–Uppercut–Cross',      punches: ['jab','uppercut','cross'] },
  { name: 'Cross–Hook–Cross',        punches: ['cross','hook','cross'] },
  { name: 'Jab–Cross–Body Hook',     punches: ['jab','cross','body'] },
  { name: 'Slip–Uppercut–Hook',      punches: ['slip','uppercut','hook'] },
];

const PHASE_META = {
  warmup:   { label: 'Warm-up',   cls: 'eph-warmup',   color: '#BA7517' },
  boxing:   { label: 'Boxing',    cls: 'eph-boxing',   color: '#E24B4A' },
  strength: { label: 'Strength',  cls: 'eph-strength', color: '#185FA5' },
  core:     { label: 'Core',      cls: 'eph-core',     color: '#639922' },
  cooldown: { label: 'Cool-down', cls: 'eph-cooldown', color: '#0F6E56' },
  rest:     { label: 'Rest',      cls: 'eph-rest',     color: '#888780' },
};

const PUNCH_LIBRARY = [
  { 
    id: 'jab', 
    name: 'The Jab (1)', 
    desc: 'The most important punch in boxing. A straight lead-hand strike used to gauge distance, blind opponents, and set up power shots.',
    tips: ['Keep your chin tucked behind your lead shoulder.', 'Snap the hand out and back to your face immediately.', 'Stay light on your feet and avoid leaning forward.'],
    yt: 'https://www.youtube.com/results?search_query=boxing+jab+tutorial'
  },
  { 
    id: 'cross', 
    name: 'The Cross (2)', 
    desc: 'The power punch thrown from the rear hand. It travels a longer distance and utilizes full body rotation.',
    tips: ['Pivot your back foot like you are "squashing a bug".', 'Ensure your lead hand stays up to protect your face.', 'Exhale sharply as you throw the punch.'],
    yt: 'https://www.youtube.com/results?search_query=boxing+cross+tutorial'
  },
  { 
    id: 'hook', 
    name: 'Lead Hook (3)', 
    desc: 'A powerful lateral punch thrown with the front hand. It targets the side of the head or the liver.',
    tips: ['Keep your elbow at a 90-degree angle.', 'Pivot your front foot and rotate your hip aggressively.', 'Keep your rear hand high on your chin.'],
    yt: 'https://www.youtube.com/results?search_query=boxing+hook+tutorial'
  },
  { 
    id: 'uppercut', 
    name: 'Uppercut (4)', 
    desc: 'A vertical punch used to strike from underneath, typically targeting the chin of an opponent leaning forward.',
    tips: ['Dip your knees slightly before throwing.', 'Drive the power from your legs and hips.', 'Do not drop your hand too low before the strike.'],
    yt: 'https://www.youtube.com/results?search_query=boxing+uppercut+tutorial'
  },
  { 
    id: 'body', 
    name: 'Body Shot', 
    desc: 'Punches directed at the torso, specifically the liver (lead side) or solar plexus.',
    tips: ['Bend your knees to change levels; do not just lean over.', 'Step slightly off-center to find the angle.', 'Stay tight and keep your guard up to avoid counters.'],
    yt: 'https://www.youtube.com/results?search_query=boxing+body+shots+tutorial'
  },
  { 
    id: 'slip', 
    name: 'The Slip', 
    desc: 'A core defensive movement where you move your head slightly off the center line to evade a straight punch.',
    tips: ['Small movements are better than big ones.', 'Keep your hands up while slipping.', 'Immediately look for counter-punch opportunities.'],
    yt: 'https://www.youtube.com/results?search_query=boxing+slipping+punches'
  },
  { 
    id: 'roll', 
    name: 'The Roll (Bob & Weave)', 
    desc: 'Defending against hooks and overhands by rolling your head and torso underneath the punch in a "U" motion.',
    tips: ['Transfer your weight from one leg to the other during the roll.', 'Do not bend at the waist; use your knees.', 'Keep your eyes on the opponent even when underneath.'],
    yt: 'https://www.youtube.com/results?search_query=boxing+bob+and+weave+tutorial'
  },
  { 
    id: 'pivot', 
    name: 'The Pivot', 
    desc: 'Fundamental footwork used to change angles, create openings, and escape pressure or corners.',
    tips: ['Stay on the ball of your lead foot.', 'Whip your back leg around to quickly change orientation.', 'Keep your hands up and stay balanced throughout.'],
    yt: 'https://www.youtube.com/results?search_query=boxing+footwork+pivot+tutorial'
  },
  { 
    id: 'check-hook', 
    name: 'Check Hook', 
    desc: 'An advanced defensive counter where you throw a lead hook while pivoting away from an aggressive opponent.',
    tips: ['Time the punch as the opponent moves into your range.', 'The pivot must happen simultaneously with the punch.', 'Lead the opponent into where you were, not where you are.'],
    yt: 'https://www.youtube.com/results?search_query=boxing+check+hook+tutorial'
  },
  { 
    id: 'feint', 
    name: 'Feinting', 
    desc: 'The art of deceptive movement to bait a reaction, blind an opponent, or create an opening for a real attack.',
    tips: ['Use your eyes, hands, and shoulders to sell the fake.', 'Ensure the feint is subtle but convincing.', 'Be ready to capitalize on the opening instantly.'],
    yt: 'https://www.youtube.com/results?search_query=boxing+feinting+tutorial'
  },
  { 
    id: 'parry', 
    name: 'The Parry', 
    desc: 'Deflecting a straight punch by tapping it with the palm of your glove, directing it away from your centerline.',
    tips: ['Use short, sharp tapping motions.', 'Do not reach out; wait for the punch to come to you.', 'Keep your elbows tucked and stay protected.'],
    yt: 'https://www.youtube.com/results?search_query=boxing+parry+tutorial'
  },
  { 
    id: 'catch-shoot', 
    name: 'Catch & Shoot', 
    desc: 'A classic counter-punching skill where you catch a punch with your glove and fire back immediately.',
    tips: ['Absorption and retaliation should be one fluid motion.', 'Keep your feet planted to generate counter-power.', 'Always protect the side of your head while shooting back.'],
    yt: 'https://www.youtube.com/results?search_query=boxing+catch+and+shoot+tutorial'
  },
  { 
    id: 'sprawl', 
    name: 'The Sprawl', 
    desc: 'A dynamic conditioning and defensive move used to drop your hips to the floor and evade low attacks or build explosive power.',
    tips: ['Shoot your legs back as far as possible.', 'Drop your hips flush to the floor.', 'Explode back up into your fighting stance immediately.'],
    yt: 'https://www.youtube.com/results?search_query=boxing+sprawl+drill'
  },
  { 
    id: 'weighted-shadow', 
    name: 'Weighted Shadowboxing', 
    desc: 'Shadowboxing while holding light dumbbells (1-2kg) to significantly increase shoulder endurance and punch snap.',
    tips: ['Do not go too heavy; the goal is speed and form.', 'Focus on keeping your hands up even when tired.', 'Maintain perfect technique; do not lunge or over-extend.'],
    yt: 'https://www.youtube.com/results?search_query=weighted+shadowboxing+tutorial'
  }
];

const EXERCISE_INFO = {
  'Jump rope': 'Keep elbows tucked in. Stay light on the balls of your feet. Small jumps are enough to clear the rope.',
  'Jump rope – fast singles': 'Focus on speed. Small, rapid jumps keeping the core tight and hands spinning the rope quickly.',
  'Jump rope – double unders': 'Flick the wrists quickly to spin the rope twice per jump. Requires a slightly higher jump and good timing.',
  'Arm circles  shoulder rolls': 'Warm up the shoulder joint by making progressive circles forward and backward, then rolling the shoulders.',
  'Hip rotations  leg swings': 'Rotate the hips in circles, then swing each leg forward, backward, and side-to-side to loosen the hips and hamstrings.',
  'Shadowboxing  footwork': 'Focus on your stance and movement. Move forward, backward, and laterally while maintaining balance.',
  'Shadowboxing footwork': 'Maintain a solid base. Step and drag your feet; never cross them. Visualize an opponent.',
  'Shadowboxing – 1-2-3 combos': 'Jab, Cross, Lead Hook. Ensure full extension on straight punches and pivot your lead foot on the hook.',
  'Shadowboxing – slips and rolls': 'Practice evasive head movement. Slip outside straight punches and roll (bob and weave) under hooks.',
  'Shadowboxing – full combos': 'Put together all offensive and defensive tools. Be creative and visualize a real sparring round.',
  'Shadowboxing – defensive': 'Emphasize your guard, head movement, and footwork retreats. Only throw counter punches.',
  'Shadowboxing – full speed': 'Simulate fight pace. Throw punches with max speed while maintaining form and defense.',
  'Heavy bag – power shots': 'Focus on weight transfer and rotation. Sit down on your punches and hit the bag as hard as possible.',
  'Heavy bag – body shots': 'Change levels by bending your knees. Dig hooks and uppercuts into the lower half of the bag.',
  'Heavy bag – Round 1': 'Establish distance with the jab. Use double and triple jabs, both head and body.',
  'Heavy bag – Round 2': 'Focus on the 1-2 combination (Jab-Cross). Ensure the cross lands with power and snapping hip rotation.',
  'Heavy bag – Round 3': 'Integrate the lead hook (1-2-3). Ensure proper body mechanics and bring hands right back to the guard.',
  'Heavy bag – Def. Counters': 'Visualize an incoming punch. Slip or roll first, then immediately fire a fast combination.',
  'Heavy bag – Body Snatcher': 'Use the Jab to blind the opponent, then dig a heavy body hook, followed by an overhand or cross.',
  'Heavy bag – Burnout': 'Non-stop punching. Throw straight 1-2s continuously at the bag as fast as you can.',
  'Heavy bag – Tabata': '20 seconds of maximum effort sprinting on the bag, followed by 10 seconds of complete rest.',
  'Heavy bag – Technical HIIT': 'Combine explosive bursts with active recovery (footwork/jabs). Maintain perfect technique even when tired.',
  'Heavy bag – Counters': 'Work on defending an attack and immediately replying with an uppercut or hook counter.',
  'Speed target – rapid jabs': 'Keep your non-punching hand glued to your chin. Snap the jab out and back as fast as possible.',
  'HIIT – 10-punch burst  squat': 'Throw 10 straight punches as fast as possible, then immediately perform 1 bodyweight squat.',
  'Push-ups': 'Keep a straight line from head to heels. Lower your chest to the floor and press up to full extension.',
  'Diamond push-ups': 'Place hands close together under your chest forming a diamond shape. Targets the triceps and inner chest.',
  'Bodyweight squats': 'Keep your chest up and back straight. Lower your hips until thighs are parallel to the floor.',
  'Jump squats': 'Explosively jump up from the bottom of the squat position. Land softly and go immediately into the next rep.',
  'Walking lunges': 'Step forward and lower your hips until both knees are bent at a 90-degree angle.',
  'Burpees': 'Drop to a push-up position, perform a push-up, jump feet back to hands, and explosively jump up with hands overhead.',
  'Plank': 'Hold a straight body position resting on your forearms. Squeeze your core and glutes.',
  'Mountain climbers': 'From a push-up position, rapidly drive your knees alternating toward your chest.',
  'V-sits': 'Sit balancing on your sit bones. Extend legs and lean back, then bring knees and chest together.',
  'Russian twists': 'Sit with feet slightly elevated. Twist your torso side to side, touching the floor on each side.',
  'Hollow body hold': 'Lie on your back, flatten your lower back to the floor, and hover your arms and legs slightly off the ground.',
  'Bicycle crunches': 'Lie on your back. Alternate bringing your opposite elbow to your knee in a pedaling motion.',
  'Neck & wrist mobilisation': 'Gently stretch the neck in all directions and rotate the wrists to prepare for impact.',
  'Torso twists': 'Stand with a wide stance and twist your upper body left and right to loosen the core and spine.',
  'Dynamic stretching': 'Use movement-based stretches to take joints through their full range of motion.',
  'Cool-down stretch': 'Perform static stretches holding each position for 15-30 seconds to improve flexibility.',
  'Shadowboxing – ringcraft': 'Focus on movement and pivoting. Control the center of the ring, cut off angles, and maintain balance.',
  'Heavy bag – Feint & Counter': 'Use feints to draw a reaction from the "opponent" (the bag), then slip and fire a sharp counter combination.',
  'Heavy bag – Check Hooks': 'Practice landing the hook while pivoting 90 degrees as the bag moves towards you; stay balanced.',
  'Conditioning – Sprawls': 'Drop into a sprawl (hips to floor, legs back) then quickly recover to your fighting stance.',
};

function toggleInfo(e, id) {
  e.stopPropagation();
  const panel = document.getElementById(id);
  if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

const WU_STD = [
  { name: 'Jump rope',                   phase: 'warmup',   secs: 120, rounds: 1, detail: 'Light pace, stay on toes' },
  { name: 'Arm circles  shoulder rolls', phase: 'warmup',   secs: 60,  rounds: 1, detail: 'Full ROM' },
  { name: 'Hip rotations  leg swings',   phase: 'warmup',   secs: 60,  rounds: 1, detail: 'Both sides' },
  { name: 'Rest',                        phase: 'rest',     secs: 30,  rounds: 1, detail: '' },
];
const WU_SB = [
  { name: 'Jump rope',                     phase: 'warmup',   secs: 120, rounds: 1, detail: 'Build rhythm' },
  { name: 'Neck & wrist mobilisation',     phase: 'warmup',   secs: 60,  rounds: 1, detail: '' },
  { name: 'Shadowboxing  footwork',        phase: 'warmup',   secs: 90,  rounds: 1, detail: 'Move & pivot' },
  { name: 'Rest',                          phase: 'rest',     secs: 30,  rounds: 1, detail: '' },
];
const WU_DEF = [
  { name: 'Jump rope',                       phase: 'warmup',   secs: 120, rounds: 1, detail: 'Easy pace' },
  { name: 'Torso twists',                    phase: 'warmup',   secs: 60,  rounds: 1, detail: 'Loose and fluid' },
  { name: 'Dynamic stretching',              phase: 'warmup',   secs: 60,  rounds: 1, detail: 'Full range of motion' },
  { name: 'Rest',                            phase: 'rest',     secs: 30,  rounds: 1, detail: '' },
];
const CD_SHORT = [{ name: 'Cool-down stretch', phase: 'cooldown', secs: 180, rounds: 1, detail: 'Full body stretch' }];
const CD_MED   = [{ name: 'Cool-down stretch', phase: 'cooldown', secs: 240, rounds: 1, detail: 'Full body stretch' }];
const CD_LONG  = [{ name: 'Cool-down stretch', phase: 'cooldown', secs: 300, rounds: 1, detail: 'Deep recovery stretch' }];
const REST30   = { name: 'Rest',                phase: 'rest',     secs: 30,  rounds: 1, detail: '' };
const REST20   = { name: 'Rest',                phase: 'rest',     secs: 20,  rounds: 1, detail: '' };
const RBTR60   = { name: 'Rest between rounds', phase: 'rest',     secs: 60,  rounds: 1, detail: '' };
const RBTR45   = { name: 'Rest between rounds', phase: 'rest',     secs: 45,  rounds: 1, detail: '' };

const WORKOUTS_BEG = {
  // ── DAY A: POWER BASICS ─────────────────────────────────────────────────────
  A1: { label: 'Power I',   pill: 'pa', color: '#E24B4A', exercises: [
    ...WU_STD,
    { name: 'Shadowboxing – 1-2-3 combos', phase: 'boxing',   secs: 120, rounds: 2, detail: 'Focus on form over speed' },
    RBTR60,
    { name: 'Heavy bag – Round 1',         phase: 'boxing',   secs: 120, rounds: 2, detail: 'Jab to find distance', noBack: true },
    RBTR60,
    { name: 'Push-ups',                    phase: 'strength', secs: 30,  rounds: 2, detail: '8–10 reps' },
    REST30,
    { name: 'Bodyweight squats',           phase: 'strength', secs: 30,  rounds: 2, detail: '10 reps' },
    REST30,
    { name: 'Plank',                       phase: 'core',     secs: 30,  rounds: 2, detail: 'Tight core, level hips' },
    REST20,
    ...CD_SHORT,
  ]},
  A2: { label: 'Power II',  pill: 'pa', color: '#E24B4A', exercises: [
    ...WU_STD,
    { name: 'Shadowboxing – 1-2-3 combos', phase: 'boxing',   secs: 120, rounds: 2, detail: 'Snap the punches, breathe out' },
    RBTR60,
    { name: 'Heavy bag – Round 2',         phase: 'boxing',   secs: 120, rounds: 2, detail: '1-2 combo focus', noBack: true },
    RBTR60,
    { name: 'Diamond push-ups',            phase: 'strength', secs: 30,  rounds: 2, detail: '8 reps, control descent' },
    REST30,
    { name: 'Walking lunges',              phase: 'strength', secs: 30,  rounds: 2, detail: '8 each leg' },
    REST30,
    { name: 'Mountain climbers',           phase: 'core',     secs: 30,  rounds: 2, detail: 'Moderate pace' },
    REST20,
    ...CD_SHORT,
  ]},
  A3: { label: 'Power III', pill: 'pa', color: '#E24B4A', exercises: [
    ...WU_STD,
    { name: 'Speed target – rapid jabs',   phase: 'boxing',   secs: 90,  rounds: 2, detail: 'Snap jab back fast' },
    RBTR60,
    { name: 'Heavy bag – Round 3',         phase: 'boxing',   secs: 120, rounds: 2, detail: 'Add the lead hook', noBack: true },
    RBTR60,
    { name: 'Push-ups',                    phase: 'strength', secs: 30,  rounds: 2, detail: '10 reps' },
    REST30,
    { name: 'Bodyweight squats',           phase: 'strength', secs: 30,  rounds: 2, detail: '12 reps' },
    REST30,
    { name: 'Hollow body hold',            phase: 'core',     secs: 25,  rounds: 2, detail: 'Lower back flat' },
    REST20,
    ...CD_SHORT,
  ]},

  // ── DAY B: SPEED & DEFENCE ──────────────────────────────────────────────────
  B1: { label: 'Speed I',   pill: 'pb', color: '#185FA5', exercises: [
    ...WU_SB,
    { name: 'Speed target – rapid jabs',    phase: 'boxing',   secs: 90,  rounds: 2, detail: 'Max hand speed' },
    RBTR45,
    { name: 'Shadowboxing – slips and rolls', phase: 'boxing', secs: 90,  rounds: 2, detail: 'Slow, exaggerated movement' },
    RBTR60,
    { name: 'Walking lunges',               phase: 'strength', secs: 30,  rounds: 2, detail: '8 each leg' },
    REST30,
    { name: 'Mountain climbers',            phase: 'core',     secs: 30,  rounds: 2, detail: 'Moderate pace' },
    REST20,
    ...CD_SHORT,
  ]},
  B2: { label: 'Speed II',  pill: 'pb', color: '#185FA5', exercises: [
    ...WU_SB,
    { name: 'Shadowboxing – 1-2-3 combos',  phase: 'boxing',   secs: 120, rounds: 2, detail: 'Smooth, no rushing' },
    RBTR60,
    { name: 'Shadowboxing – defensive',     phase: 'boxing',   secs: 90,  rounds: 2, detail: 'Guard & counter only' },
    RBTR60,
    { name: 'Push-ups',                     phase: 'strength', secs: 30,  rounds: 2, detail: '10 reps' },
    REST30,
    { name: 'Russian twists',               phase: 'core',     secs: 30,  rounds: 2, detail: 'Controlled rotation', noBack: true },
    REST20,
    ...CD_SHORT,
  ]},
  B3: { label: 'Speed III', pill: 'pb', color: '#185FA5', exercises: [
    ...WU_DEF,
    { name: 'Speed target – rapid jabs',    phase: 'boxing',   secs: 90,  rounds: 2, detail: 'Focus on snap' },
    RBTR45,
    { name: 'Shadowboxing – 1-2-3 combos',  phase: 'boxing',   secs: 120, rounds: 2, detail: 'Add slips between combos' },
    RBTR60,
    { name: 'Bodyweight squats',            phase: 'strength', secs: 30,  rounds: 2, detail: '12 reps' },
    REST30,
    { name: 'Plank',                        phase: 'core',     secs: 30,  rounds: 2, detail: 'Brace everything' },
    REST20,
    ...CD_SHORT,
  ]},

  // ── DAY C: CONDITIONING ──────────────────────────────────────────────────────
  C1: { label: 'Conditioning I',   pill: 'pc', color: '#639922', exercises: [
    ...WU_DEF,
    { name: 'Heavy bag – body shots',  phase: 'boxing',   secs: 120, rounds: 2, detail: 'Level change, hooks to body' },
    RBTR60,
    { name: 'Shadowboxing – defensive', phase: 'boxing',  secs: 120, rounds: 2, detail: 'Guard & counter only' },
    RBTR60,
    { name: 'Bodyweight squats',       phase: 'strength', secs: 30,  rounds: 2, detail: '10 reps' },
    REST30,
    { name: 'Hollow body hold',        phase: 'core',     secs: 25,  rounds: 2, detail: 'Lower back flat to floor' },
    REST20,
    ...CD_SHORT,
  ]},
  C2: { label: 'Conditioning II',  pill: 'pc', color: '#639922', exercises: [
    ...WU_STD,
    { name: 'Heavy bag – Round 1',     phase: 'boxing',   secs: 120, rounds: 2, detail: 'Control the distance', noBack: true },
    RBTR60,
    { name: 'Shadowboxing  footwork',  phase: 'boxing',   secs: 90,  rounds: 2, detail: 'Angle changes, stay light' },
    RBTR60,
    { name: 'Walking lunges',          phase: 'strength', secs: 30,  rounds: 2, detail: '8 each leg' },
    REST30,
    { name: 'Mountain climbers',       phase: 'core',     secs: 30,  rounds: 2, detail: 'Moderate pace' },
    REST20,
    ...CD_SHORT,
  ]},
  C3: { label: 'Conditioning III', pill: 'pc', color: '#639922', exercises: [
    ...WU_SB,
    { name: 'Heavy bag – body shots',  phase: 'boxing',   secs: 120, rounds: 2, detail: 'Liver shots & solar plexus' },
    RBTR60,
    { name: 'Heavy bag – Round 2',     phase: 'boxing',   secs: 120, rounds: 2, detail: '1-2 for power', noBack: true },
    RBTR60,
    { name: 'Push-ups',                phase: 'strength', secs: 30,  rounds: 2, detail: '10 reps' },
    REST30,
    { name: 'Bicycle crunches',        phase: 'core',     secs: 30,  rounds: 2, detail: 'Full rotation' },
    REST20,
    ...CD_SHORT,
  ]},
  D: { label: 'Basics', pill: 'pc', color: '#888780', exercises: [
    ...WU_STD,
    { name: 'Heavy bag – Round 1',          phase: 'boxing',   secs: 120, rounds: 2, detail: 'Jab focus', noBack: true },
    RBTR60,
    { name: 'Heavy bag – Round 2',          phase: 'boxing',   secs: 120, rounds: 2, detail: '1-2 combo focus', noBack: true },
    RBTR60,
    { name: 'Push-ups',                     phase: 'strength', secs: 30,  rounds: 2, detail: '8 reps' },
    REST30,
    { name: 'Plank',                        phase: 'core',     secs: 30,  rounds: 2, detail: 'Core braced' },
    REST20,
    ...CD_SHORT,
  ]},
};
Object.assign(WORKOUTS_BEG, { A: WORKOUTS_BEG.A1, B: WORKOUTS_BEG.B1, C: WORKOUTS_BEG.C1 });

const WORKOUTS_INT = {
  // ── DAY A: POWER ─────────────────────────────────────────────────────────────
  A1: { label: 'Power I',   pill: 'pa', color: '#E24B4A', exercises: [
    ...WU_STD,
    { name: 'Shadowboxing – 1-2-3 combos', phase: 'boxing',   secs: 180, rounds: 3, detail: 'L-Jab, R-Cross, L-Hook' },
    RBTR60,
    { name: 'Heavy bag – power shots',     phase: 'boxing',   secs: 180, rounds: 3, detail: 'Max power R-Crosses & L-Hooks', noBack: true },
    RBTR60,
    { name: 'Push-ups',                    phase: 'strength', secs: 45,  rounds: 3, detail: '12–15 reps' },
    REST30,
    { name: 'Bodyweight squats',           phase: 'strength', secs: 45,  rounds: 3, detail: '15 reps' },
    REST30,
    { name: 'Plank',                       phase: 'core',     secs: 45,  rounds: 3, detail: 'Tight core' },
    REST30,
    { name: 'Mountain climbers',           phase: 'core',     secs: 40,  rounds: 2, detail: 'Fast knees' },
    REST20,
    ...CD_MED,
  ]},
  A2: { label: 'Power II',  pill: 'pa', color: '#E24B4A', exercises: [
    ...WU_STD,
    { name: 'Shadowboxing – full combos',  phase: 'boxing',   secs: 180, rounds: 3, detail: 'Add uppercuts & body shots' },
    RBTR60,
    { name: 'Heavy bag – body shots',      phase: 'boxing',   secs: 180, rounds: 3, detail: 'Dig in hooks & uppercuts' },
    RBTR60,
    { name: 'Diamond push-ups',            phase: 'strength', secs: 45,  rounds: 3, detail: '10–12 reps' },
    REST30,
    { name: 'Jump squats',                 phase: 'strength', secs: 40,  rounds: 3, detail: 'Explosive, land soft', noBack: true },
    REST30,
    { name: 'Hollow body hold',            phase: 'core',     secs: 40,  rounds: 3, detail: 'Lower back pressed down' },
    REST20,
    ...CD_MED,
  ]},
  A3: { label: 'Power III', pill: 'pa', color: '#E24B4A', exercises: [
    ...WU_STD,
    { name: 'Shadowboxing – 1-2-3 combos', phase: 'boxing',   secs: 180, rounds: 3, detail: 'Combo into slips' },
    RBTR60,
    { name: 'Heavy bag – Def. Counters',   phase: 'boxing',   secs: 180, rounds: 3, detail: 'Slip then fire counter', noBack: true },
    RBTR60,
    { name: 'Push-ups',                    phase: 'strength', secs: 45,  rounds: 3, detail: '15 reps' },
    REST30,
    { name: 'Walking lunges',              phase: 'strength', secs: 45,  rounds: 3, detail: '12 each leg' },
    REST30,
    { name: 'Russian twists',              phase: 'core',     secs: 40,  rounds: 3, detail: 'Rotate fully each side', noBack: true },
    REST20,
    ...CD_MED,
  ]},

  // ── DAY B: SPEED ──────────────────────────────────────────────────────────────
  B1: { label: 'Speed I',   pill: 'pb', color: '#185FA5', exercises: [
    ...WU_SB,
    { name: 'Speed target – rapid jabs',    phase: 'boxing',   secs: 120, rounds: 4, detail: 'Max hand speed with L-Jab' },
    RBTR45,
    { name: 'Shadowboxing – full combos',   phase: 'boxing',   secs: 180, rounds: 3, detail: 'Full combo sequences' },
    RBTR60,
    { name: 'Burpees',                      phase: 'strength', secs: 40,  rounds: 3, detail: '8–10 reps, explosive', noBack: true },
    REST30,
    { name: 'Walking lunges',               phase: 'strength', secs: 45,  rounds: 3, detail: '12 each leg' },
    REST30,
    { name: 'V-sits',                       phase: 'core',     secs: 40,  rounds: 3, detail: '15 reps controlled', noBack: true },
    REST20,
    ...CD_MED,
  ]},
  B2: { label: 'Speed II',  pill: 'pb', color: '#185FA5', exercises: [
    ...WU_SB,
    { name: 'Shadowboxing – slips and rolls', phase: 'boxing', secs: 120, rounds: 3, detail: 'Fast, crisp head movement' },
    RBTR60,
    { name: 'Shadowboxing – full combos',   phase: 'boxing',   secs: 180, rounds: 3, detail: 'L-Jab, R-Cross, L-Hook, R-Upper' },
    RBTR60,
    { name: 'Jump squats',                  phase: 'strength', secs: 40,  rounds: 3, detail: 'Explosive, land soft', noBack: true },
    REST30,
    { name: 'Russian twists',               phase: 'core',     secs: 40,  rounds: 3, detail: 'Rotate fully each side', noBack: true },
    REST20,
    ...CD_MED,
  ]},
  B3: { label: 'Speed III', pill: 'pb', color: '#185FA5', exercises: [
    ...WU_DEF,
    { name: 'Speed target – rapid jabs',    phase: 'boxing',   secs: 120, rounds: 3, detail: 'Burst speed on L-Jab' },
    RBTR45,
    { name: 'Shadowboxing – defensive',     phase: 'boxing',   secs: 180, rounds: 3, detail: 'Guard, slip, counter' },
    RBTR60,
    { name: 'Burpees',                      phase: 'strength', secs: 40,  rounds: 3, detail: '8 reps', noBack: true },
    REST30,
    { name: 'Bicycle crunches',             phase: 'core',     secs: 45,  rounds: 3, detail: 'Slow and controlled' },
    REST20,
    ...CD_MED,
  ]},

  // ── DAY C: CONDITIONING ──────────────────────────────────────────────────────
  C1: { label: 'Conditioning I',   pill: 'pc', color: '#639922', exercises: [
    ...WU_DEF,
    { name: 'HIIT – 10-punch burst  squat', phase: 'boxing',   secs: 180, rounds: 4, detail: '10 alternating punches then squat', noBack: true },
    RBTR60,
    { name: 'Heavy bag – body shots',       phase: 'boxing',   secs: 180, rounds: 3, detail: 'L-Hook liver & R solar plexus' },
    RBTR60,
    { name: 'Diamond push-ups',             phase: 'strength', secs: 45,  rounds: 3, detail: '10–12 reps' },
    REST30,
    { name: 'Jump squats',                  phase: 'strength', secs: 40,  rounds: 3, detail: 'Explosive, land soft', noBack: true },
    REST30,
    { name: 'Hollow body hold',             phase: 'core',     secs: 40,  rounds: 3, detail: 'Lower back pressed down' },
    REST20,
    ...CD_LONG,
  ]},
  C2: { label: 'Conditioning II',  pill: 'pc', color: '#639922', exercises: [
    ...WU_SB,
    { name: 'Heavy bag – Counters',         phase: 'boxing',   secs: 180, rounds: 3, detail: 'Catch and reply combo', noBack: true },
    RBTR60,
    { name: 'Shadowboxing – full combos',   phase: 'boxing',   secs: 180, rounds: 3, detail: 'Non-stop at pace' },
    RBTR60,
    { name: 'Burpees',                      phase: 'strength', secs: 40,  rounds: 3, detail: '8 reps', noBack: true },
    REST30,
    { name: 'Bicycle crunches',             phase: 'core',     secs: 45,  rounds: 3, detail: 'Slow and controlled' },
    REST20,
    ...CD_LONG,
  ]},
  C3: { label: 'Conditioning III', pill: 'pc', color: '#639922', exercises: [
    ...WU_STD,
    { name: 'Heavy bag – Body Snatcher',    phase: 'boxing',   secs: 180, rounds: 3, detail: 'Jab, body hook, overhand', noBack: true },
    RBTR60,
    { name: 'Heavy bag – power shots',      phase: 'boxing',   secs: 180, rounds: 3, detail: 'Max power rotation', noBack: true },
    RBTR60,
    { name: 'Jump squats',                  phase: 'strength', secs: 40,  rounds: 3, detail: 'Max explosion', noBack: true },
    REST30,
    { name: 'Russian twists',               phase: 'core',     secs: 40,  rounds: 3, detail: 'Full rotation', noBack: true },
    REST20,
    ...CD_LONG,
  ]},
  D: { label: 'Ringcraft', pill: 'pc', color: '#888780', exercises: [
    ...WU_SB,
    { name: 'Shadowboxing – ringcraft',     phase: 'boxing',   secs: 180, rounds: 3, detail: 'Focus on angles & pivots' },
    RBTR60,
    { name: 'Heavy bag – Feint & Counter',  phase: 'boxing',   secs: 180, rounds: 3, detail: 'Deceptive entry, then counter', noBack: true },
    RBTR60,
    { name: 'Heavy bag – Check Hooks',      phase: 'boxing',   secs: 180, rounds: 3, detail: 'Pivot 90 deg while landing hook', noBack: true },
    RBTR60,
    { name: 'Conditioning – Sprawls',       phase: 'strength', secs: 45,  rounds: 3, detail: 'Max speed sprawls' },
    REST30,
    { name: 'Plank',                        phase: 'core',     secs: 60,  rounds: 3, detail: 'Maintain total tension' },
    REST20,
    ...CD_LONG,
  ]},
};
Object.assign(WORKOUTS_INT, { A: WORKOUTS_INT.A1, B: WORKOUTS_INT.B1, C: WORKOUTS_INT.C1 });

const REST25 = { name: 'Rest', phase: 'rest', secs: 25, rounds: 1, detail: '' };

const WORKOUTS_ADV = {
  // ── DAY A: MAX POWER ─────────────────────────────────────────────────────────
  A1: { label: 'Power I',   pill: 'pa', color: '#E24B4A', exercises: [
    ...WU_STD,
    { name: 'Shadowboxing – full combos',  phase: 'boxing',   secs: 180, rounds: 4, detail: 'Full pace with head movement' },
    RBTR45,
    { name: 'Heavy bag – power shots',     phase: 'boxing',   secs: 180, rounds: 5, detail: 'Max power, rotate fully', noBack: true },
    RBTR45,
    { name: 'Diamond push-ups',            phase: 'strength', secs: 45,  rounds: 4, detail: '15+ reps' },
    REST25,
    { name: 'Jump squats',                 phase: 'strength', secs: 40,  rounds: 4, detail: 'Max height, land soft', noBack: true },
    REST25,
    { name: 'Plank',                       phase: 'core',     secs: 60,  rounds: 4, detail: 'Total-body tension' },
    REST20,
    { name: 'Mountain climbers',           phase: 'core',     secs: 45,  rounds: 3, detail: 'Sprint pace' },
    REST20,
    ...CD_LONG,
  ]},
  A2: { label: 'Power II',  pill: 'pa', color: '#E24B4A', exercises: [
    ...WU_STD,
    { name: 'Shadowboxing – full speed',   phase: 'boxing',   secs: 180, rounds: 4, detail: 'Fight pace, no breaks' },
    RBTR45,
    { name: 'Heavy bag – Burnout',         phase: 'boxing',   secs: 120, rounds: 4, detail: 'Non-stop 1-2s, max speed', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Body Snatcher',   phase: 'boxing',   secs: 180, rounds: 3, detail: 'Jab, body hook, overhand', noBack: true },
    RBTR45,
    { name: 'Push-ups',                    phase: 'strength', secs: 45,  rounds: 4, detail: '20 reps' },
    REST25,
    { name: 'Bodyweight squats',           phase: 'strength', secs: 45,  rounds: 4, detail: '20 reps, explosive' },
    REST25,
    { name: 'V-sits',                      phase: 'core',     secs: 45,  rounds: 4, detail: 'Controlled', noBack: true },
    REST20,
    ...CD_LONG,
  ]},
  A3: { label: 'Power III', pill: 'pa', color: '#E24B4A', exercises: [
    ...WU_STD,
    { name: 'Shadowboxing – full combos',  phase: 'boxing',   secs: 180, rounds: 4, detail: 'Combos with defensive movement' },
    RBTR45,
    { name: 'Heavy bag – Technical HIIT',  phase: 'boxing',   secs: 180, rounds: 4, detail: 'Explosive technique bursts', noBack: true },
    RBTR45,
    { name: 'Diamond push-ups',            phase: 'strength', secs: 45,  rounds: 4, detail: '15 reps, explosive' },
    REST25,
    { name: 'Walking lunges',              phase: 'strength', secs: 45,  rounds: 4, detail: '16 each leg' },
    REST25,
    { name: 'Russian twists',              phase: 'core',     secs: 45,  rounds: 4, detail: 'Max rotation', noBack: true },
    REST20,
    ...CD_LONG,
  ]},

  // ── DAY B: SPEED & REFLEXES ──────────────────────────────────────────────────
  B1: { label: 'Speed I',   pill: 'pb', color: '#185FA5', exercises: [
    ...WU_SB,
    { name: 'Speed target – rapid jabs',      phase: 'boxing',   secs: 120, rounds: 5, detail: 'Burst speed, max hand speed' },
    RBTR45,
    { name: 'Shadowboxing – full speed',      phase: 'boxing',   secs: 180, rounds: 4, detail: 'Fight simulation – no breaks' },
    RBTR45,
    { name: 'Heavy bag – Technical HIIT',     phase: 'boxing',   secs: 180, rounds: 3, detail: 'Explosive technique bursts', noBack: true },
    RBTR45,
    { name: 'Burpees',                        phase: 'strength', secs: 45,  rounds: 4, detail: '12+ reps', noBack: true },
    REST25,
    { name: 'V-sits',                         phase: 'core',     secs: 45,  rounds: 4, detail: 'Controlled slow reps', noBack: true },
    REST20,
    ...CD_LONG,
  ]},
  B2: { label: 'Speed II',  pill: 'pb', color: '#185FA5', exercises: [
    ...WU_DEF,
    { name: 'Speed target – rapid jabs',      phase: 'boxing',   secs: 120, rounds: 4, detail: 'Max hand speed' },
    RBTR45,
    { name: 'Shadowboxing – slips and rolls', phase: 'boxing',   secs: 120, rounds: 4, detail: 'Fast, precise head movement' },
    RBTR45,
    { name: 'Shadowboxing – full combos',     phase: 'boxing',   secs: 180, rounds: 3, detail: 'Attack then defend' },
    RBTR45,
    { name: 'Jump squats',                    phase: 'strength', secs: 45,  rounds: 4, detail: 'Explosive', noBack: true },
    REST25,
    { name: 'Russian twists',                 phase: 'core',     secs: 45,  rounds: 4, detail: 'Full rotation speed', noBack: true },
    REST20,
    ...CD_LONG,
  ]},
  B3: { label: 'Speed III', pill: 'pb', color: '#185FA5', exercises: [
    ...WU_SB,
    { name: 'Shadowboxing – defensive',       phase: 'boxing',   secs: 180, rounds: 3, detail: 'Guard, slip, pivot, counter' },
    RBTR45,
    { name: 'Heavy bag – Def. Counters',      phase: 'boxing',   secs: 180, rounds: 4, detail: 'Slip then fire combo', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Counters',           phase: 'boxing',   secs: 180, rounds: 3, detail: 'Catch and reply', noBack: true },
    RBTR45,
    { name: 'Walking lunges',                 phase: 'strength', secs: 45,  rounds: 4, detail: '16 each leg' },
    REST25,
    { name: 'Bicycle crunches',               phase: 'core',     secs: 45,  rounds: 4, detail: 'Full rotation, controlled' },
    REST20,
    ...CD_LONG,
  ]},

  // ── DAY C: ELITE CONDITIONING ────────────────────────────────────────────────
  C1: { label: 'Conditioning I',   pill: 'pc', color: '#639922', exercises: [
    ...WU_DEF,
    { name: 'HIIT – 10-punch burst  squat',   phase: 'boxing',   secs: 180, rounds: 5, detail: 'Max output, 10-punch sprint + squat', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Tabata',             phase: 'boxing',   secs: 240, rounds: 4, detail: '20s all-out / 10s rest', noBack: true },
    RBTR60,
    { name: 'Diamond push-ups',               phase: 'strength', secs: 45,  rounds: 4, detail: '15 reps' },
    REST20,
    { name: 'Jump squats',                    phase: 'strength', secs: 45,  rounds: 4, detail: 'Maximum height', noBack: true },
    REST20,
    { name: 'Hollow body hold',               phase: 'core',     secs: 45,  rounds: 4, detail: 'Perfect position, no sag' },
    REST20,
    ...CD_LONG,
  ]},
  C2: { label: 'Conditioning II',  pill: 'pc', color: '#639922', exercises: [
    ...WU_STD,
    { name: 'Heavy bag – body shots',         phase: 'boxing',   secs: 180, rounds: 4, detail: 'Shark attack – liver & solar plexus' },
    RBTR45,
    { name: 'Heavy bag – Burnout',            phase: 'boxing',   secs: 120, rounds: 4, detail: 'Non-stop max speed', noBack: true },
    RBTR45,
    { name: 'Jump squats',                    phase: 'strength', secs: 45,  rounds: 4, detail: 'Max height', noBack: true },
    REST20,
    { name: 'Bicycle crunches',               phase: 'core',     secs: 45,  rounds: 4, detail: 'Full rotation, controlled' },
    REST20,
    ...CD_LONG,
  ]},
  C3: { label: 'Conditioning III', pill: 'pc', color: '#639922', exercises: [
    ...WU_SB,
    { name: 'Heavy bag – Technical HIIT',     phase: 'boxing',   secs: 180, rounds: 4, detail: 'Explosive technique bursts', noBack: true },
    RBTR45,
    { name: 'Heavy bag – power shots',        phase: 'boxing',   secs: 180, rounds: 4, detail: 'Max power rotation', noBack: true },
    RBTR45,
    { name: 'Burpees',                        phase: 'strength', secs: 45,  rounds: 4, detail: '12+ reps', noBack: true },
    REST20,
    { name: 'Russian twists',                 phase: 'core',     secs: 45,  rounds: 4, detail: 'Max speed rotation', noBack: true },
    REST20,
    ...CD_LONG,
  ]},
  D: { label: 'Elite Ringcraft', pill: 'pc', color: '#888780', exercises: [
    ...WU_DEF,
    { name: 'Shadowboxing – ringcraft',       phase: 'boxing',   secs: 180, rounds: 4, detail: 'Centre control + pivots' },
    RBTR45,
    { name: 'Heavy bag – Feint & Counter',    phase: 'boxing',   secs: 180, rounds: 4, detail: 'Sell the feint, explode on counter', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Check Hooks',        phase: 'boxing',   secs: 180, rounds: 4, detail: 'Full 90° pivot, balance perfect', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Def. Counters',      phase: 'boxing',   secs: 180, rounds: 3, detail: 'Slip → fire fast combo', noBack: true },
    RBTR45,
    { name: 'Conditioning – Sprawls',         phase: 'strength', secs: 45,  rounds: 4, detail: 'Explosive sprawl recovery' },
    REST20,
    { name: 'Plank',                          phase: 'core',     secs: 60,  rounds: 4, detail: 'Total body tension' },
    REST20,
    ...CD_LONG,
  ]},
};
Object.assign(WORKOUTS_ADV, { A: WORKOUTS_ADV.A1, B: WORKOUTS_ADV.B1, C: WORKOUTS_ADV.C1 });



const WORKOUTS_MAP = { beginner: WORKOUTS_BEG, intermediate: WORKOUTS_INT, advanced: WORKOUTS_ADV };

function getWorkouts() {
  const level = localStorage.getItem('fitnessLevel') || 'intermediate';
  return WORKOUTS_MAP[level] || WORKOUTS_INT;
}


/* ── HEAVY BAG WORKOUTS ── */
const HB_WUP = [
  { name: 'Jump rope',                    phase: 'warmup',   secs: 180, rounds: 1, detail: 'Light pace' },
  { name: 'Arm circles  shoulder rolls',  phase: 'warmup',   secs: 60,  rounds: 1, detail: 'Full ROM' },
  { name: 'Hip rotations  leg swings',    phase: 'warmup',   secs: 60,  rounds: 1, detail: 'Dynamic mobility' },
  { name: 'Shadowboxing  footwork',       phase: 'warmup',   secs: 120, rounds: 1, detail: 'Move & pivot' },
  { name: 'Rest',                         phase: 'rest',     secs: 30,  rounds: 1, detail: '' },
];
const HB_CD = [
  { name: 'Cool-down stretch',            phase: 'cooldown', secs: 300, rounds: 1, detail: 'Static stretching' },
];

const HB_DATA = {
  HB_BEG_1: { label: 'HB 1', pill: 'pa', color: '#BA7517', exercises: [...HB_WUP, { name: 'Heavy bag – Round 1', phase: 'boxing', secs: 180, rounds: 3, detail: 'Focus on Jab distance', noBack: true }, ...HB_CD ] },
  HB_BEG_2: { label: 'HB 2', pill: 'pa', color: '#BA7517', exercises: [...HB_WUP, { name: 'Heavy bag – Round 2', phase: 'boxing', secs: 180, rounds: 3, detail: 'Focus on 1-2 Combo', noBack: true }, ...HB_CD ] },
  HB_BEG_3: { label: 'HB 3', pill: 'pa', color: '#BA7517', exercises: [...HB_WUP, { name: 'Heavy bag – Round 3', phase: 'boxing', secs: 180, rounds: 3, detail: 'Focus on Lead Hook', noBack: true }, ...HB_CD ] },
  HB_INT_1: { label: 'HB 1', pill: 'pb', color: '#185FA5', exercises: [...HB_WUP, { name: 'Heavy bag – Def. Counters', phase: 'boxing', secs: 180, rounds: 4, detail: 'Slip and Counter', noBack: true }, ...HB_CD ] },
  HB_INT_2: { label: 'HB 2', pill: 'pb', color: '#185FA5', exercises: [...HB_WUP, { name: 'Heavy bag – Body Snatcher', phase: 'boxing', secs: 180, rounds: 4, detail: 'Level changing focus', noBack: true }, ...HB_CD ] },
  HB_INT_3: { label: 'HB 3', pill: 'pb', color: '#185FA5', exercises: [...HB_WUP, { name: 'Heavy bag – Counters', phase: 'boxing', secs: 180, rounds: 4, detail: 'Catch and Reply', noBack: true }, ...HB_CD ] },
  HB_ADV_1: { label: 'HB 1', pill: 'pc', color: '#E24B4A', exercises: [...HB_WUP, { name: 'Heavy bag – Burnout', phase: 'boxing', secs: 180, rounds: 5, detail: 'Max intensity intervals', noBack: true }, ...HB_CD ] },
  HB_ADV_2: { label: 'HB 2', pill: 'pc', color: '#E24B4A', exercises: [...HB_WUP, { name: 'Heavy bag – Technical HIIT', phase: 'boxing', secs: 180, rounds: 5, detail: 'Explosive technique bursts', noBack: true }, ...HB_CD ] },
  HB_ADV_3: { label: 'HB 3', pill: 'pc', color: '#E24B4A', exercises: [...HB_WUP, { name: 'Heavy bag – Tabata', phase: 'boxing', secs: 240, rounds: 4, detail: 'Sprints on the bag', noBack: true }, ...HB_CD ] },
};

Object.assign(WORKOUTS_BEG, HB_DATA);
Object.assign(WORKOUTS_INT, HB_DATA);
Object.assign(WORKOUTS_ADV, HB_DATA);

/* ── STATE ── */
const today = new Date();
let viewYear = today.getFullYear();
let viewMonth = today.getMonth();
let selectedCalDay = null;
let completed = {};
let workoutDays = [1, 3, 5]; // Mon, Wed, Fri
let dayOrder = ['A', 'B', 'C', 'D'];

let tActiveDay = 'A';
let tActiveEx = -1;
let tRunning = false;
let tInterval = null;
let tRemaining = 0;
let tRound = 1;
let comboSeqId = null;
let currentCombo = null;
let audioCtx = null;
let countdownInterval = null;
let isCountingDown = false;
let currentExAudio = null;
let isSpeaking = false;
let comboSpeedMultiplier = 1.0;

function setLevel(level) {
  localStorage.setItem('fitnessLevel', level);
  highlightLevel();
  // Reset timer to reflect new workouts
  stopTimer(); tActiveEx = -1; tRound = 1;
  buildTimerTabs(); renderExList(); loadEx(false);
}

function highlightLevel() {
  const level = localStorage.getItem('fitnessLevel') || 'intermediate';
  ['beginner','intermediate','advanced'].forEach(l => {
    const btn = document.getElementById('lvl-' + l);
    if (btn) btn.classList.toggle('primary', l === level);
  });
}

function updateSpeed(val) {
  comboSpeedMultiplier = parseFloat(val);
  const el = document.getElementById('speedVal');
  if (el) el.textContent = val + 'x';
}

function renderRndInfo(ex) {
  if (ex.rounds > 1) {
    document.getElementById('rndInfo').innerHTML = `
      <div style="display:inline-flex; align-items:center; gap:12px;">
        <button class="nbtn" style="padding:4px 10px; font-size:12px; border-radius:4px; ${tRound <= 1 ? 'opacity:0.3; pointer-events:none;' : ''}" onclick="changeRound(-1)">&#9666;</button>
        <span style="min-width:70px; text-align:center;">${T('Round')} ${tRound} ${T('of')} ${ex.rounds}</span>
        <button class="nbtn" style="padding:4px 10px; font-size:12px; border-radius:4px; ${tRound >= ex.rounds ? 'opacity:0.3; pointer-events:none;' : ''}" onclick="changeRound(1)">&#9656;</button>
      </div>
    `;
  } else {
    document.getElementById('rndInfo').textContent = T(ex.detail) || '';
  }
}

function changeRound(dir) {
  if (tActiveEx < 0) return;
  const ex = getWorkouts()[tActiveDay].exercises[tActiveEx];
  if (!ex || ex.rounds <= 1) return;
  
  let newRound = tRound + dir;
  if (newRound < 1 || newRound > ex.rounds) return;
  
  stopTimer();
  tRound = newRound;
  tRemaining = ex.secs;
  document.getElementById('startBtn').textContent = T('Start');
  document.getElementById('timeBig').textContent = fmt(tRemaining);
  document.getElementById('ringFg').style.strokeDashoffset = CIRC;
  renderRndInfo(ex);
  if (ex.phase === 'boxing') {
    currentCombo = COMBOS[Math.floor(Math.random() * COMBOS.length)];
    renderChips(currentCombo, -1);
  }
}

/* ── AUDIO ── */
const PUNCH_SOUNDS = {
  jab:      new Audio('audio/jab.mp3'),
  cross:    new Audio('audio/cross.mp3'),
  hook:     new Audio('audio/hook.mp3'),
  uppercut: new Audio('audio/uppercut.mp3'),
  body:     new Audio('audio/body.mp3'),
  slip:     new Audio('audio/slip.mp3'),
};

function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playPunch(key) {
  const s = PUNCH_SOUNDS[key];
  if (s) {
    const clone = s.cloneNode();
    clone.play().catch(e => console.log('Audio play blocked:', e));
  }
}

function stopCurrentAudio() {
  if (currentExAudio) {
    currentExAudio.pause();
    currentExAudio.currentTime = 0;
    currentExAudio = null;
  }
  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
  }
}

function playExerciseSound(name) {
  stopCurrentAudio();

  const tryPlay = (filename) => {
    return new Promise((resolve, reject) => {
      const s = new Audio(`audio/${filename}.mp3`);
      currentExAudio = s;
      s.onended = () => { currentExAudio = null; resolve(); };
      s.onerror = (e) => { currentExAudio = null; reject(e); };
      s.play().catch(reject);
    });
  };

  let actualName = name;
  if (name === 'Rest between rounds') actualName = 'rest';

  const clean = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[–—\-]/g, ' ').replace(/\s+/g, ' ').trim();
  const c = clean(actualName);
  
  const attempts = [
    actualName,
    actualName.toLowerCase(),
    actualName.replace(/&/g, 'and').replace(/\s*[–—\-]\s*/g, '  '), // Match 'Heavy bag  Feint and Counter'
    actualName.replace(/&/g, 'and').replace(/\s*[–—\-]\s*/g, ' '),  // Match 'Heavy bag Feint and Counter'
    c,
    c.replace(/\s/g, '  '), 
    actualName.replace(/–/g, '-'),
    actualName.toLowerCase().replace(/–/g, '-'),
    (actualName.toLowerCase().match(/[a-z0-9]+/g) || []).join(' '),
    (actualName.toLowerCase().match(/[a-z0-9]+/g) || []).join('  ')
  ];

  if (name.toLowerCase().includes('jump rope')) attempts.push('jump rope');
  if (name.toLowerCase().includes('shadowboxing')) attempts.push('Shadowboxing footwork');
  if (name.toLowerCase().includes('heavy bag')) attempts.push('Heavy bag – Round 1');

  return new Promise(async (resolve) => {
    for (const a of attempts) {
      try {
        await tryPlay(a);
        return resolve();
      } catch (e) {}
    }
    
    console.log('MP3 not found, using Speech Synthesis for:', name);
    try {
      isSpeaking = true;
      const utterance = new SpeechSynthesisUtterance(name);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.onend = () => { isSpeaking = false; resolve(); };
      utterance.onerror = () => { isSpeaking = false; resolve(); };
      speechSynthesis.speak(utterance);
    } catch (e) {
      isSpeaking = false;
      resolve();
    }
  });
}

function playBell() {
  ensureAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.connect(g); g.connect(audioCtx.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(1200, audioCtx.currentTime);
  g.gain.setValueAtTime(0.5, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
  o.start(); o.stop(audioCtx.currentTime + 2.0);
}
function playWhistle() { /* Logic for whistle if needed */ }

function playTick() {
  ensureAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.connect(g); g.connect(audioCtx.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(800, audioCtx.currentTime);
  g.gain.setValueAtTime(0.15, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
  o.start(); o.stop(audioCtx.currentTime + 0.1);
}

function playTimerSound(key) {
  return new Promise((resolve) => {
    const s = new Audio(`audio/timer/${key}.mp3`);
    currentExAudio = s;
    s.onended = () => { currentExAudio = null; resolve(); };
    s.onerror = () => { currentExAudio = null; resolve(); };
    s.play().catch(() => { currentExAudio = null; resolve(); });
  });
}

function playGo() {
  ensureAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.connect(g); g.connect(audioCtx.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(1200, audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.3);
  g.gain.setValueAtTime(0.3, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
  o.start(); o.stop(audioCtx.currentTime + 0.4);
}

function startCountdown(onComplete) {
  isCountingDown = true;
  let count = 5;
  document.getElementById('startBtn').textContent = T('Cancel');
  document.getElementById('tcName').textContent = T('Get Ready!');
  document.getElementById('timeBig').textContent = count;
  document.getElementById('rndInfo').textContent = T('Starting in...');
  document.getElementById('ringFg').style.stroke = '#FFA500';
  document.getElementById('ringFg').style.strokeDashoffset = 0;
  document.getElementById('comboBox').style.display = 'none';
  playTimerSound(count);

  countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      document.getElementById('timeBig').textContent = count;
      document.getElementById('ringFg').style.strokeDashoffset = CIRC * (1 - count / 5);
      playTimerSound(count);
    } else {
      clearInterval(countdownInterval);
      countdownInterval = null;
      isCountingDown = false;
      try { playGo(); } catch(e) {}
      onComplete();
    }
  }, 1000);
}

/* ── HELPERS ── */
function fmt(s) {
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
function dayKey(y, m, d) { return y + '-' + m + '-' + d; }

function getWorkoutForDate(y, m, d) {
  const dow = new Date(y, m, d).getDay();
  const idx = workoutDays.indexOf(dow);
  if (idx === -1) return 'R';
  return dayOrder[idx % dayOrder.length] || 'R';
}

/* ── NAVIGATION ── */
function showView(v) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(el => {
    // Only main tabs, subtabs use .dt
    if (el.parentElement.classList.contains('tab-bar')) {
       el.classList.remove('active');
    }
  });
  const target = document.getElementById('view-' + v);
  if (target) target.classList.add('active');
  const mapping = { calendar: 0, timer: 1, technique: 2, settings: 3 };
  const idx = mapping[v];
  if (idx !== undefined) {
    const mainTabs = document.querySelectorAll('.tab-bar .tab');
    if (mainTabs[idx]) mainTabs[idx].classList.add('active');
  }
  if (v === 'calendar') buildCalendar();
  if (v === 'timer') { buildTimerTabs(); renderExList(); loadEx(false); }
  if (v === 'technique') buildTechnique();
  if (v === 'settings') buildSettings();
}

function buildTechnique() {
  const grid = document.getElementById('techniqueGrid');
  if (!grid) return;
  grid.innerHTML = PUNCH_LIBRARY.map(p => `
    <div class="tech-card">
      <div class="tech-title">
        ${T(p.name)}
        <a href="${p.yt}" target="_blank" class="tech-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="margin-top:1px"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          ${T('Video')}
        </a>
      </div>
      <div class="tech-desc">${T(p.desc)}</div>
      <div class="tech-tips">
        ${p.tips.map(t => `<div class="tech-tip">${T(t)}</div>`).join('')}
      </div>
    </div>
  `).join('');
}

/* ── CALENDAR ── */
function buildCalendar() {
  const y = viewYear, mo = viewMonth;
  document.getElementById('calTitle').textContent = T(MONTHS[mo]) + ' ' + y;
  document.getElementById('dhRow').innerHTML = DNAMES.map(d => `<div class="dh">${d}</div>`).join('');

  const firstDay = new Date(y, mo, 1).getDay();
  const dim = new Date(y, mo + 1, 0).getDate();
  let sess = 0, done = 0, streak = 0;
  let html = '';

  for (let i = 0; i < firstDay; i++) html += `<div class="dc empty"></div>`;

  for (let d = 1; d <= dim; d++) {
    const wt = getWorkoutForDate(y, mo, d);
    const dk = dayKey(y, mo, d);
    const isToday = y === today.getFullYear() && mo === today.getMonth() && d === today.getDate();
    const isSel = selectedCalDay === dk;
    const isDone = !!completed[dk];
    const date = new Date(y, mo, d);
    const isPast = date <= today;

    if (wt !== 'R') sess++;
    if (wt !== 'R' && isDone) done++;
    if (isPast && wt !== 'R' && isDone) streak++;

    let cls = 'dc' + (isToday ? ' today' : '') + (isSel ? ' sel' : '');
    const currentWorkouts = getWorkouts();
    const pillCls = wt === 'R' ? 'pr' : (currentWorkouts[wt]?.pill || 'pa');
    const pillLbl = wt === 'R' ? T('Rest') : T('Day ' + wt);
    const focusTxt = wt === 'A' ? T('Power') : wt === 'B' ? T('Speed') : wt === 'C' ? T('Cond.') : '';

    html += `<div class="${cls}" onclick="calSelect('${dk}',${d})" id="dc-${dk}">
      <div class="dn">${d}</div>
      <div class="dpill ${pillCls}">${pillLbl}</div>
      ${wt !== 'R' ? `<div class="dfocus">${focusTxt}</div>` : ''}
      ${isDone ? `<div class="dcheck"><div class="dtick"></div></div>` : ''}
    </div>`;
  }

  const trailing = (firstDay + dim) % 7 === 0 ? 0 : 7 - (firstDay + dim) % 7;
  for (let i = 0; i < trailing; i++) html += `<div class="dc empty"></div>`;
  document.getElementById('calGrid').innerHTML = html;

  document.getElementById('sSess').textContent = sess;
  document.getElementById('sDone').textContent = done;
  document.getElementById('sHrs').textContent = done + 'h';
  document.getElementById('sStr').textContent = streak + 'd';
}

function calSelect(dk, d) {
  selectedCalDay = dk;
  const parts = dk.split('-');
  const y = parseInt(parts[0]), mo = parseInt(parts[1]);
  const wt = getWorkoutForDate(y, mo, d);
  const isDone = !!completed[dk];
  const dateStr = T(MONTHS[mo]) + ' ' + d + ', ' + y;

  let html = `<div class="detail-panel">
    <div class="dp-hd">
      <div>
        <div class="dp-sub">${dateStr}</div>
        <div class="dp-title">${wt === 'R' ? T('Rest day') : T('Day ' + wt) + ' – ' + T(wt === 'A' ? 'Power' : wt === 'B' ? 'Speed' : 'Cond.')}</div>
      </div>
      <div class="dp-actions">`;

  if (wt !== 'R') {
    html += `<button class="mkbtn${isDone ? ' done' : ''}" onclick="toggleDone('${dk}')">${isDone ? T('Completed') : T('Mark done')}</button>
      <button class="stbtn" onclick="launchTimer('${wt}')">${T('Start')}</button>`;
  }

  html += `</div></div>`;

  if (wt === 'R') {
    html += `<div style="font-size:13px;color:var(--text-secondary)">${T('Active recovery day. Light walk, mobility work, or full rest.')}</div>`;
  } else {
    const wo = getWorkouts()[wt];
    let lastPh = null;
    html += `<div>`;
    wo.exercises.forEach(ex => {
      const ph = ex.phase;
      if (ph !== 'rest' && ph !== lastPh) { html += `<div class="ph-lbl">${T(PHASE_META[ph].label)}</div>`; lastPh = ph; }
      if (ph === 'rest') return;
      const info = EXERCISE_INFO[ex.name];
      const ytLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' boxing tutorial')}`;
      const fullInfo = info ? `${T(info)}<br><a href="${ytLink}" target="_blank" style="display:inline-block;margin-top:6px;color:#ffffff;font-weight:600;text-decoration:none;">&#9654; ${T('Watch Tutorial')}</a>` : '';
      const rnd = ex.rounds > 1 ? `${ex.rounds}×${fmt(ex.secs)}` : fmt(ex.secs);
      const safeId = ex.name.replace(/\W/g, '');
      html += `<div class="exrow" style="flex-wrap:wrap;cursor:pointer" onclick="toggleInfo(event,'eip_cal_${safeId}')">
        <div class="ephase ${PHASE_META[ph].cls}">${T(PHASE_META[ph].label).slice(0,4)}</div>
        <div style="flex:1;font-size:12px;color:var(--text-primary)">
          ${T(ex.name)}${ex.noBack ? ` <span style="color:#F5A623;font-size:10px;font-weight:700">(${T('Back Care')} ⚠️)</span>` : ''}
          ${ex.detail ? `<div style="font-size:11px;color:var(--text-secondary);font-weight:400">${T(ex.detail)}</div>` : ''}
        </div>
        <div class="edur">${rnd}</div>
        ${info ? `<button class="info-btn" style="pointer-events:none">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </button>
        <div class="info-panel" id="eip_cal_${safeId}" style="display:none" onclick="event.stopPropagation()">${fullInfo}</div>` : ''}
      </div>`;
    });
    html += `</div><div style="margin-top:.5rem;font-size:11px;color:var(--text-tertiary)">${T('60 min · 3 boxing rounds · punch sounds + combo timer')}</div>`;
  }

  html += `</div>`;
  const panel = document.getElementById('calDetail');
  panel.innerHTML = html;
  panel.style.display = 'block';
  buildCalendar();
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function toggleDone(dk) {
  if (completed[dk]) delete completed[dk]; else completed[dk] = true;
  buildCalendar();
  const parts = dk.split('-');
  calSelect(dk, parseInt(parts[2]));
}

function launchTimer(wt) {
  showView('timer');
  switchTimerDay(wt);
}

function shiftMonth(d) {
  viewMonth += d;
  if (viewMonth > 11) { viewMonth = 0; viewYear++; }
  if (viewMonth < 0) { viewMonth = 11; viewYear--; }
  selectedCalDay = null;
  document.getElementById('calDetail').style.display = 'none';
  buildCalendar();
}

/* ── TIMER ── */
const renderTabs = (id, keys) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = keys.map(k =>
    `<button class="dt${k === tActiveDay ? ' active' : ''}" onclick="switchTimerDay('${k}')">${T(getWorkouts()[k]?.label || k)}</button>`
  ).join('');
};

function buildTimerTabs() {
  const wo = getWorkouts();
  // Filter for A1, A2, A3, B1, B2, B3, C1, C2, C3, D
  const keys = Object.keys(wo).filter(k => 
    !k.startsWith('HB') && // Exclude heavy bag
    !['A','B','C'].includes(k) // Exclude aliases
  ).sort((a, b) => {
    // Sort D to the end, others by variant A1, A2...
    if (a === 'D') return 1;
    if (b === 'D') return -1;
    return a.localeCompare(b);
  });
  renderTabs('dayTabsT', keys);
  
  renderTabs('hbBegTabs', ['HB_BEG_1', 'HB_BEG_2', 'HB_BEG_3']);
  renderTabs('hbIntTabs', ['HB_INT_1', 'HB_INT_2', 'HB_INT_3']);
  renderTabs('hbAdvTabs', ['HB_ADV_1', 'HB_ADV_2', 'HB_ADV_3']);
}

function switchTimerDay(d) {
  stopTimer(); tActiveDay = d; tActiveEx = -1; tRound = 1;
  buildTimerTabs(); renderExList(); loadEx(false);
}

function renderExList() {
  const wo = getWorkouts()[tActiveDay];
  let html = '', lastPh = null, open = false;
  wo.exercises.forEach((ex, i) => {
    if (ex.phase === 'rest') { if (open) { html += '</div>'; open = false; } lastPh = null; return; }
    if (ex.phase !== lastPh) {
      if (open) html += '</div>';
      html += `<div class="ph-lbl">${T(PHASE_META[ex.phase].label)}</div><div class="ex-list-t">`;
      open = true; lastPh = ex.phase;
    }
    const info = EXERCISE_INFO[ex.name];
    const ytLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' boxing tutorial')}`;
    const fullInfo = info ? `${T(info)}<br><a href="${ytLink}" target="_blank" style="display:inline-block;margin-top:6px;color:#ffffff;font-weight:600;text-decoration:none;">&#9654; ${T('Watch Tutorial')}</a>` : '';
    const rnd = ex.rounds > 1 ? `${ex.rounds}×${fmt(ex.secs)}` : fmt(ex.secs);
    html += `<div class="exrow-t${i === tActiveEx ? ' aex' : ''}" id="et${i}">
      <div style="display:flex;align-items:center;width:100%;gap:8px;" onclick="jumpToEx(${i})">
        <div class="exdot" style="background:${PHASE_META[ex.phase].color}"></div>
        <div class="exname">${T(ex.name)}${ex.noBack ? ` <span style="color:#F5A623;font-size:10px">⚠️</span>` : ''}
          ${ex.detail ? `<div class="exdet">${T(ex.detail)}</div>` : ''}
        </div>
        <div class="exdur2">${rnd}</div>
        ${info ? `<button class="info-btn" onclick="toggleInfo(event,'eip_t_${i}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </button>` : ''}
      </div>
      ${info ? `<div class="info-panel" id="eip_t_${i}" style="display:none" onclick="event.stopPropagation()">${fullInfo}</div>` : ''}
    </div>`;
  });
  if (open) html += '</div>';
  document.getElementById('exListT').innerHTML = html;
}

async function loadEx(playAudio = true) {
  if (tActiveEx === -1) {
    document.getElementById('timeBig').textContent = '--:--';
    document.getElementById('ringFg').style.strokeDashoffset = CIRC;
    document.getElementById('ringFg').style.stroke = '#888780';
    document.getElementById('tcName').textContent = T('Ready to Train?');
    const b = document.getElementById('tcBadge');
    b.className = 'tc-badge eph-rest';
    b.textContent = T('Pre-game');
    document.getElementById('rndInfo').textContent = T(getWorkouts()[tActiveDay]?.label || '');
    document.getElementById('comboBox').style.display = 'none';
    document.getElementById('startBtn').textContent = T('Start Workout');
    updateNextUp();
    document.getElementById('progFill').style.width = '0%';
    document.getElementById('progPct').textContent = '0%';
    document.querySelectorAll('.exrow-t').forEach(r => r.classList.remove('aex'));
    stopCurrentAudio();
    return;
  }

  const ex = getWorkouts()[tActiveDay].exercises[tActiveEx];
  tRemaining = ex.secs;
  document.getElementById('timeBig').textContent = fmt(tRemaining);
  document.getElementById('ringFg').style.strokeDashoffset = CIRC;
  document.getElementById('ringFg').style.stroke = PHASE_META[ex.phase].color;
  document.getElementById('tcName').innerHTML = T(ex.name) + (ex.noBack ? `<span style="font-size:16px;margin-left:8px;vertical-align:middle">⚠️</span>` : '');
  const b = document.getElementById('tcBadge');
  b.className = 'tc-badge eph-' + ex.phase;
  b.textContent = T(PHASE_META[ex.phase].label);
  renderRndInfo(ex);
  updateNextUp(); updateProg();
  
  const durMap = {
    30: '30 seconds',
    40: '40 seconds',
    45: '45 seconds',
    60: '1 minute',
    90: '1 minute 30 seconds',
    120: '2 minutes',
    150: '2 minutes and 30 seconds',
    180: '3 minutes',
    240: '4 minutes',
    300: '5 minutes'
  };

  stopCurrentAudio();
  if (playAudio) {
    await playExerciseSound(ex.name);
    if (durMap[ex.secs]) {
      await playTimerSound(durMap[ex.secs]);
    }
  }

  if (ex.phase === 'boxing') {
    if (ex.name === 'HIIT – 10-punch burst  squat') {
      currentCombo = { 
        name: '10-Punch Burst!', 
        punches: ['jab','cross','jab','cross','jab','cross','jab','cross','jab','cross'] 
      };
    } else {
      currentCombo = COMBOS[Math.floor(Math.random() * COMBOS.length)];
    }
    renderChips(currentCombo, -1);
    document.getElementById('comboBox').style.display = 'block';
  } else {
    document.getElementById('comboBox').style.display = 'none';
  }
  document.querySelectorAll('.exrow-t').forEach(r => r.classList.remove('aex'));
  const row = document.getElementById('et' + tActiveEx);
  if (row) {
    row.classList.add('aex');
    row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

function renderChips(combo, activeIdx) {
  if (!combo) { document.getElementById('comboBox').style.display = 'none'; return; }
  document.getElementById('comboName').textContent = combo.name;
  document.getElementById('comboChips').innerHTML = combo.punches.map((p, i) => {
    const pd = PUNCH_DATA[p];
    return `<div class="pchip ${pd.chip}${i === activeIdx ? ' lit' : ''}">${pd.label}</div>`;
  }).join('');
  document.getElementById('callout').textContent = activeIdx >= 0 ? PUNCH_DATA[combo.punches[activeIdx]].word : '';
}

function fireCombo(combo) {
  clearSeq();
  let delay = 600 / comboSpeedMultiplier;
  combo.punches.forEach((p, i) => {
    setTimeout(() => {
      if (!tRunning) return;
      playPunch(p);
      renderChips(combo, i);
    }, delay);
    
    let punchDelay = PUNCH_DATA[p]?.delay || 500;
    const nextP = combo.punches[i + 1];
    if ((p === 'jab' || p === 'cross') && nextP && nextP !== 'jab' && nextP !== 'cross') {
      punchDelay = 800;
    }
    delay += (punchDelay / comboSpeedMultiplier);
  });
  comboSeqId = setTimeout(() => {
    if (!tRunning) return;
    currentCombo = COMBOS[Math.floor(Math.random() * COMBOS.length)];
    renderChips(currentCombo, -1);
    setTimeout(() => { if (tRunning) fireCombo(currentCombo); }, 600 / comboSpeedMultiplier);
  }, delay + (800 / comboSpeedMultiplier));
}

function clearSeq() {
  if (comboSeqId) { clearTimeout(comboSeqId); comboSeqId = null; }
}

function toggleTimer() {
  ensureAudio();
  if (isCountingDown) {
    clearInterval(countdownInterval);
    countdownInterval = null;
    isCountingDown = false;
    loadEx(false);
    return;
  }
  if (tRunning) { stopTimer(); return; }
  
  if (tActiveEx === -1) {
    tActiveEx = 0;
    renderExList();
    loadEx(false);
  }

  startCountdown(() => {
    beginExerciseTimer();
  });
}

function beginExerciseTimer() {
  tRunning = true;
  document.getElementById('startBtn').textContent = T('Pause');
  const ex = getWorkouts()[tActiveDay].exercises[tActiveEx];
  document.getElementById('tcName').textContent = T(ex.name);
  document.getElementById('timeBig').textContent = fmt(tRemaining);
  document.getElementById('ringFg').style.stroke = PHASE_META[ex.phase].color;
  document.getElementById('ringFg').style.strokeDashoffset = CIRC;
  document.getElementById('rndInfo').textContent = ex.rounds > 1 ? `${T('Round')} ${tRound} ${T('of')} ${ex.rounds}` : (T(ex.detail) || '');
  if (ex.phase === 'boxing') {
    document.getElementById('comboBox').style.display = 'block';
    fireCombo(currentCombo);
  }
  tInterval = setInterval(() => {
    tRemaining--;
    document.getElementById('timeBig').textContent = fmt(tRemaining);
    const pct = tRemaining / ex.secs;
    document.getElementById('ringFg').style.strokeDashoffset = CIRC * (1 - pct);
    
    // Time alerts
    if (tRemaining === 300) playTimerSound('5 minutes');
    if (tRemaining === 240) playTimerSound('4 minutes');
    if (tRemaining === 180) playTimerSound('3 minutes');
    if (tRemaining === 120) playTimerSound('2 minutes');
    if (tRemaining === 90)  playTimerSound('1 minute 30 seconds');
    if (tRemaining === 60)  playTimerSound('1 minute');
    if (tRemaining === 45)  playTimerSound('45 seconds');
    if (tRemaining === 40)  playTimerSound('40 seconds');
    if (tRemaining === 30)  playTimerSound('30 seconds');
    
    if ([3,2,1].includes(tRemaining)) playTimerSound(tRemaining);
    else if (tRemaining <= 3 && tRemaining > 0) playTick();
    if (tRemaining <= 0) {
      playBell(); clearSeq(); renderChips(null, -1);
      if (ex.rounds > 1 && tRound < ex.rounds) {
        tRound++; tRemaining = ex.secs;
        clearInterval(tInterval);
        stopTimer();
        document.getElementById('startBtn').textContent = T('Start');
        
        document.getElementById('timeBig').textContent = fmt(tRemaining);
        document.getElementById('ringFg').style.strokeDashoffset = CIRC;
        renderRndInfo(ex);
        
        if (ex.phase === 'boxing') {
          currentCombo = COMBOS[Math.floor(Math.random() * COMBOS.length)];
          renderChips(currentCombo, -1);
        }
        return;
      } else {
        tRound = 1;
        const wo = getWorkouts()[tActiveDay];
        if (tActiveEx < wo.exercises.length - 1) {
          clearInterval(tInterval);
          tActiveEx++; renderExList(); loadEx(true);
          stopTimer();
          return;
        } else {
          stopTimer();
          document.getElementById('tcName').textContent = T('Session complete!');
          document.getElementById('rndInfo').textContent = T('Great work, fighter!');
          document.getElementById('progFill').style.width = '100%';
          document.getElementById('progPct').textContent = '100%';
        }
      }
    }
  }, 1000);
}

function stopTimer() {
  tRunning = false;
  clearInterval(tInterval);
  clearSeq();
  if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
  isCountingDown = false;
  document.getElementById('startBtn').textContent = T('Start');
}

function jumpToEx(i) { stopTimer(); tActiveEx = i; tRound = 1; loadEx(true); }
function prevEx() { 
  stopTimer(); tRound = 1; 
  if (tActiveEx > 0) { tActiveEx--; renderExList(); loadEx(true); } 
  else if (tActiveEx === 0) { tActiveEx = -1; renderExList(); loadEx(true); }
}
function nextEx() { 
  stopTimer(); tRound = 1; 
  const wo = getWorkouts()[tActiveDay]; 
  if (tActiveEx < wo.exercises.length - 1) { tActiveEx++; renderExList(); loadEx(true); } 
}

function updateNextUp() {
  const wo = getWorkouts()[tActiveDay], el = document.getElementById('nextUp');
  el.innerHTML = tActiveEx < wo.exercises.length - 1
    ? `${T('Next:')} <span>${T(wo.exercises[tActiveEx + 1].name)}</span>`
    : `<span>${T('Final exercise!')}</span>`;
}

function updateProg() {
  const total = getWorkouts()[tActiveDay].exercises.length;
  const pct = Math.round((Math.max(0, tActiveEx) / total) * 100);
  document.getElementById('progFill').style.width = pct + '%';
  document.getElementById('progPct').textContent = pct + '%';
}

/* ── SETTINGS ── */
function buildSettings() {
  const grid = document.getElementById('dayAssignGrid');
  grid.innerHTML = DNAMES.map((dn, i) => {
    const cur = getAssignedType(i);
    const opts = ['R', 'A', 'B', 'C'].map(v =>
      `<option value="${v}"${cur === v ? ' selected' : ''}>${v === 'R' ? T('Rest') : T('Day ' + v)}</option>`
    ).join('');
    return `<div class="day-col">
      <div class="day-col-name">${T(dn)}</div>
      <select class="day-sel" id="ds${i}" onchange="previewSchedule()">${opts}</select>
    </div>`;
  }).join('');
  previewSchedule();
  buildOrderRow();
}

function getAssignedType(dow) {
  const idx = workoutDays.indexOf(dow);
  if (idx === -1) return 'R';
  return dayOrder[idx] || 'R';
}

function previewSchedule() {
  const picks = DNAMES.map((_, i) => (document.getElementById('ds' + i) || {}).value || 'R');
  const styles = {
    A: { bg: '#FCEBEB', c: '#791F1F' },
    B: { bg: '#E6F1FB', c: '#0C447C' },
    C: { bg: '#EAF3DE', c: '#27500A' },
    R: { bg: 'var(--bg-secondary)', c: 'var(--text-tertiary)' },
  };
  document.getElementById('weekPreview').innerHTML = DNAMES.map((dn, i) => {
    const v = picks[i]; const s = styles[v];
    return `<div class="wp-cell" style="background:${s.bg};color:${s.c}">${v === 'R' ? '–' : v}</div>`;
  }).join('');
}

function buildOrderRow() {
  document.getElementById('orderRow').innerHTML = dayOrder.map((d, i) =>
    `<div class="order-chip">${T('Day ' + d)}</div>${i < dayOrder.length - 1 ? '<span class="order-arrow">→</span>' : ''}`
  ).join('');
}

function saveSchedule() {
  const picks = DNAMES.map((_, i) => ({ dow: i, val: (document.getElementById('ds' + i) || {}).value || 'R' }));
  const training = picks.filter(p => p.val !== 'R');
  if (training.length === 0) { alert(T('Pick at least 1 training day.')); return; }
  workoutDays = training.map(p => p.dow);
  const assigned = training.map(p => p.val);
  const order = [];
  ['A', 'B', 'C'].forEach(t => { if (assigned.includes(t)) order.push(t); });
  dayOrder = order.length > 0 ? order : ['A', 'B', 'C'];
  selectedCalDay = null;
  document.getElementById('calDetail').style.display = 'none';
  buildCalendar();
  buildSettings();
  showView('calendar');
}

/* ── INIT ── */
buildCalendar();
buildTimerTabs();
renderExList();
loadEx(false);
