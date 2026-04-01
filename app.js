/* ── DATA (v1.0.1 - Vercel Fix) ── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DNAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const CIRC = 2 * Math.PI * 50;

let currentLang = localStorage.getItem('lang') || 'en';

window.addEventListener('DOMContentLoaded', () => {
  const selector = document.getElementById('langSelect');
  if (selector) selector.value = currentLang;
  applyTranslations(document.body);
  
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
  jab:      { label: 'Jab',      chip: 'chip-jab',      word: 'JAB!' },
  cross:    { label: 'Cross',    chip: 'chip-cross',    word: 'CROSS!' },
  hook:     { label: 'Hook',     chip: 'chip-hook',     word: 'HOOK!' },
  uppercut: { label: 'Uppercut', chip: 'chip-uppercut', word: 'UPPER!' },
  body:     { label: 'Body',     chip: 'chip-body',     word: 'BODY!' },
  slip:     { label: 'Slip',     chip: 'chip-slip',     word: 'SLIP!' },
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

const WORKOUTS = {
  A: { label: 'Day A – Power', pill: 'pa', color: '#E24B4A', exercises: [
    { name: 'Jump rope',                    phase: 'warmup',   secs: 180, rounds: 1, detail: 'Light pace, stay on toes' },
    { name: 'Arm circles  shoulder rolls',  phase: 'warmup',   secs: 60,  rounds: 1, detail: 'Full ROM' },
    { name: 'Hip rotations  leg swings',    phase: 'warmup',   secs: 60,  rounds: 1, detail: 'Both sides' },
    { name: 'Shadowboxing  footwork',       phase: 'warmup',   secs: 120, rounds: 1, detail: 'Move & pivot' },
    { name: 'Rest',                         phase: 'rest',     secs: 30,  rounds: 1, detail: '' },
    { name: 'Shadowboxing – 1-2-3 combos',  phase: 'boxing',   secs: 180, rounds: 3, detail: 'L-Jab, R-Cross, L-Hook' },
    { name: 'Rest between rounds',          phase: 'rest',     secs: 60,  rounds: 1, detail: '' },
    { name: 'Heavy bag – power shots',      phase: 'boxing',   secs: 180, rounds: 3, detail: 'Max power R-Crosses & L-Hooks', noBack: true },
    { name: 'Rest between rounds',          phase: 'rest',     secs: 60,  rounds: 1, detail: '' },
    { name: 'Push-ups',                     phase: 'strength', secs: 45,  rounds: 3, detail: '12–15 reps' },
    { name: 'Rest',                         phase: 'rest',     secs: 30,  rounds: 1, detail: '' },
    { name: 'Bodyweight squats',            phase: 'strength', secs: 45,  rounds: 3, detail: '15 reps, drive through heels' },
    { name: 'Rest',                         phase: 'rest',     secs: 30,  rounds: 1, detail: '' },
    { name: 'Plank',                        phase: 'core',     secs: 45,  rounds: 3, detail: 'Tight core, level hips' },
    { name: 'Rest',                         phase: 'rest',     secs: 30,  rounds: 1, detail: '' },
    { name: 'Mountain climbers',            phase: 'core',     secs: 40,  rounds: 2, detail: 'Fast knees' },
    { name: 'Rest',                         phase: 'rest',     secs: 20,  rounds: 1, detail: '' },
    { name: 'Cool-down stretch',            phase: 'cooldown', secs: 240, rounds: 1, detail: 'Full body stretch' },
  ]},
  B: { label: 'Day B – Speed', pill: 'pb', color: '#185FA5', exercises: [
    { name: 'Jump rope – fast singles',     phase: 'warmup',   secs: 180, rounds: 1, detail: 'Build up pace' },
    { name: 'Neck & wrist mobilisation',    phase: 'warmup',   secs: 60,  rounds: 1, detail: '' },
    { name: 'Torso twists',                 phase: 'warmup',   secs: 60,  rounds: 1, detail: 'Loose and fluid' },
    { name: 'Shadowboxing – slips and rolls', phase: 'warmup',   secs: 120, rounds: 1, detail: 'Defence focus' },
    { name: 'Rest',                         phase: 'rest',     secs: 30,  rounds: 1, detail: '' },
    { name: 'Speed target – rapid jabs',    phase: 'boxing',   secs: 120, rounds: 4, detail: 'Max hand speed with L-Jab' },
    { name: 'Rest between rounds',          phase: 'rest',     secs: 45,  rounds: 1, detail: '' },
    { name: 'Shadowboxing – full combos',   phase: 'boxing',   secs: 180, rounds: 3, detail: 'L-Jab, R-Cross, L-Hook, R-Uppercut' },
    { name: 'Rest between rounds',          phase: 'rest',     secs: 60,  rounds: 1, detail: '' },
    { name: 'Burpees',                      phase: 'strength', secs: 40,  rounds: 3, detail: '8–10 reps, explosive', noBack: true },
    { name: 'Rest',                         phase: 'rest',     secs: 30,  rounds: 1, detail: '' },
    { name: 'Walking lunges',               phase: 'strength', secs: 45,  rounds: 3, detail: '12 each leg' },
    { name: 'Rest',                         phase: 'rest',     secs: 30,  rounds: 1, detail: '' },
    { name: 'V-sits',                       phase: 'core',     secs: 40,  rounds: 3, detail: '15 reps controlled', noBack: true },
    { name: 'Rest',                         phase: 'rest',     secs: 20,  rounds: 1, detail: '' },
    { name: 'Russian twists',               phase: 'core',     secs: 40,  rounds: 3, detail: 'Rotate fully each side', noBack: true },
    { name: 'Rest',                         phase: 'rest',     secs: 20,  rounds: 1, detail: '' },
    { name: 'Cool-down stretch',            phase: 'cooldown', secs: 240, rounds: 1, detail: 'Full body stretch' },
  ]},
  C: { label: 'Day C – Conditioning', pill: 'pc', color: '#639922', exercises: [
    { name: 'Jump rope – double unders',         phase: 'warmup',   secs: 180, rounds: 1, detail: 'Mix singles and doubles' },
    { name: 'Dynamic stretching',                phase: 'warmup',   secs: 90,  rounds: 1, detail: 'Leg swings, arm crosses' },
    { name: 'Shadowboxing – defensive',          phase: 'warmup',   secs: 120, rounds: 1, detail: 'Slip, roll, pivot focus' },
    { name: 'Rest',                              phase: 'rest',     secs: 30,  rounds: 1, detail: '' },
    { name: 'HIIT – 10-punch burst  squat',      phase: 'boxing',   secs: 180, rounds: 4, detail: '10 all-out alternating punches then squat', noBack: true },
    { name: 'Rest between rounds',               phase: 'rest',     secs: 60,  rounds: 1, detail: '' },
    { name: 'Heavy bag – body shots',            phase: 'boxing',   secs: 180, rounds: 3, detail: 'L-Hook to Liver & R-Punch to Solar Plexus' },
    { name: 'Rest between rounds',               phase: 'rest',     secs: 60,  rounds: 1, detail: '' },
    { name: 'Diamond push-ups',                  phase: 'strength', secs: 45,  rounds: 3, detail: '10–12 reps' },
    { name: 'Rest',                              phase: 'rest',     secs: 30,  rounds: 1, detail: '' },
    { name: 'Jump squats',                       phase: 'strength', secs: 40,  rounds: 3, detail: 'Explosive, land soft', noBack: true },
    { name: 'Rest',                              phase: 'rest',     secs: 30,  rounds: 1, detail: '' },
    { name: 'Hollow body hold',                  phase: 'core',     secs: 40,  rounds: 3, detail: 'Lower back pressed down' },
    { name: 'Rest',                              phase: 'rest',     secs: 20,  rounds: 1, detail: '' },
    { name: 'Bicycle crunches',                  phase: 'core',     secs: 45,  rounds: 3, detail: 'Slow and controlled' },
    { name: 'Rest',                              phase: 'rest',     secs: 20,  rounds: 1, detail: '' },
    { name: 'Cool-down stretch',                 phase: 'cooldown', secs: 300, rounds: 1, detail: 'Full body stretch' },
  ]},
  D: { label: 'Day D – Ringcraft', pill: 'pc', color: '#888780', exercises: [
    { name: 'Jump rope',                    phase: 'warmup',   secs: 180, rounds: 1, detail: 'Build rhythm' },
    { name: 'Shadowboxing  footwork',       phase: 'warmup',   secs: 120, rounds: 1, detail: 'Pivot & slide' },
    { name: 'Rest',                         phase: 'rest',     secs: 30,  rounds: 1, detail: '' },
    { name: 'Shadowboxing – ringcraft',     phase: 'boxing',   secs: 180, rounds: 3, detail: 'Focus on angles & pivots' },
    { name: 'Rest between rounds',          phase: 'rest',     secs: 60,  rounds: 1, detail: '' },
    { name: 'Heavy bag – Feint & Counter',  phase: 'boxing',   secs: 180, rounds: 3, detail: 'Deceptive entry, then counter', noBack: true },
    { name: 'Rest between rounds',          phase: 'rest',     secs: 60,  rounds: 1, detail: '' },
    { name: 'Heavy bag – Check Hooks',      phase: 'boxing',   secs: 180, rounds: 3, detail: 'Pivot 90 deg while landing hook', noBack: true },
    { name: 'Rest between rounds',          phase: 'rest',     secs: 60,  rounds: 1, detail: '' },
    { name: 'Conditioning – Sprawls',       phase: 'strength', secs: 45,  rounds: 3, detail: 'Max speed sprawls' },
    { name: 'Rest',                         phase: 'rest',     secs: 30,  rounds: 1, detail: '' },
    { name: 'Plank',                        phase: 'core',     secs: 60,  rounds: 3, detail: 'Maintain total tension' },
    { name: 'Rest',                         phase: 'rest',     secs: 30,  rounds: 1, detail: '' },
    { name: 'Cool-down stretch',            phase: 'cooldown', secs: 300, rounds: 1, detail: 'Deep recovery stretch' },
  ]},
};

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

Object.assign(WORKOUTS, {
  HB_BEG_1: { label: 'HB 1', pill: 'pa', color: '#BA7517', exercises: [...HB_WUP, { name: 'Heavy bag – Round 1', phase: 'boxing', secs: 180, rounds: 3, detail: 'Focus on Jab distance', noBack: true }, ...HB_CD ] },
  HB_BEG_2: { label: 'HB 2', pill: 'pa', color: '#BA7517', exercises: [...HB_WUP, { name: 'Heavy bag – Round 2', phase: 'boxing', secs: 180, rounds: 3, detail: 'Focus on 1-2 Combo', noBack: true }, ...HB_CD ] },
  HB_BEG_3: { label: 'HB 3', pill: 'pa', color: '#BA7517', exercises: [...HB_WUP, { name: 'Heavy bag – Round 3', phase: 'boxing', secs: 180, rounds: 3, detail: 'Focus on Lead Hook', noBack: true }, ...HB_CD ] },

  HB_INT_1: { label: 'HB 1', pill: 'pb', color: '#185FA5', exercises: [...HB_WUP, { name: 'Heavy bag – Def. Counters', phase: 'boxing', secs: 180, rounds: 4, detail: 'Slip and Counter', noBack: true }, ...HB_CD ] },
  HB_INT_2: { label: 'HB 2', pill: 'pb', color: '#185FA5', exercises: [...HB_WUP, { name: 'Heavy bag – Body Snatcher', phase: 'boxing', secs: 180, rounds: 4, detail: 'Level changing focus', noBack: true }, ...HB_CD ] },
  HB_INT_3: { label: 'HB 3', pill: 'pb', color: '#185FA5', exercises: [...HB_WUP, { name: 'Heavy bag – Counters', phase: 'boxing', secs: 180, rounds: 4, detail: 'Catch and Reply', noBack: true }, ...HB_CD ] },

  HB_ADV_1: { label: 'HB 1', pill: 'pc', color: '#E24B4A', exercises: [...HB_WUP, { name: 'Heavy bag – Burnout', phase: 'boxing', secs: 180, rounds: 5, detail: 'Max intensity intervals', noBack: true }, ...HB_CD ] },
  HB_ADV_2: { label: 'HB 2', pill: 'pc', color: '#E24B4A', exercises: [...HB_WUP, { name: 'Heavy bag – Technical HIIT', phase: 'boxing', secs: 180, rounds: 5, detail: 'Explosive technique bursts', noBack: true }, ...HB_CD ] },
  HB_ADV_3: { label: 'HB 3', pill: 'pc', color: '#E24B4A', exercises: [...HB_WUP, { name: 'Heavy bag – Tabata', phase: 'boxing', secs: 240, rounds: 4, detail: 'Sprints on the bag', noBack: true }, ...HB_CD ] },
});

/* ── STATE ── */
const today = new Date();
let viewYear = today.getFullYear();
let viewMonth = today.getMonth();
let selectedCalDay = null;
let completed = {};
let workoutDays = [1, 3, 5]; // Mon, Wed, Fri
let dayOrder = ['A', 'B', 'C', 'D'];

let tActiveDay = 'A';
let tActiveEx = 0;
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
  if (name === 'Rest' || name === 'Rest between rounds') return Promise.resolve();
  
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

  const attempts = [
    name,
    name.toLowerCase(),
    name.replace(/–/g, '-'),
    name.toLowerCase().replace(/–/g, '-'),
    name.replace(/\s+/g, ' '),
    name.toLowerCase().replace(/\s+/g, ' ')
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

function playBell()    { (new Audio('audio/jump rope.mp3')).play().catch(e=>{}); } 
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
  if (v === 'timer') { buildTimerTabs(); renderExList(); loadEx(); }
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
    const pillCls = wt === 'R' ? 'pr' : WORKOUTS[wt].pill;
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
    const wo = WORKOUTS[wt];
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
    `<button class="dt${k === tActiveDay ? ' active' : ''}" onclick="switchTimerDay('${k}')">${T(WORKOUTS[k].label)}</button>`
  ).join('');
};

function buildTimerTabs() {
  renderTabs('dayTabsT', ['A', 'B', 'C']);
  renderTabs('hbBegTabs', ['HB_BEG_1', 'HB_BEG_2', 'HB_BEG_3']);
  renderTabs('hbIntTabs', ['HB_INT_1', 'HB_INT_2', 'HB_INT_3']);
  renderTabs('hbAdvTabs', ['HB_ADV_1', 'HB_ADV_2', 'HB_ADV_3']);
}

function switchTimerDay(d) {
  stopTimer(); tActiveDay = d; tActiveEx = 0; tRound = 1;
  buildTimerTabs(); renderExList(); loadEx();
}

function renderExList() {
  const wo = WORKOUTS[tActiveDay];
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

async function loadEx() {
  const ex = WORKOUTS[tActiveDay].exercises[tActiveEx];
  tRemaining = ex.secs;
  document.getElementById('timeBig').textContent = fmt(tRemaining);
  document.getElementById('ringFg').style.strokeDashoffset = CIRC;
  document.getElementById('ringFg').style.stroke = PHASE_META[ex.phase].color;
  document.getElementById('tcName').innerHTML = T(ex.name) + (ex.noBack ? `<span style="font-size:16px;margin-left:8px;vertical-align:middle">⚠️</span>` : '');
  const b = document.getElementById('tcBadge');
  b.className = 'tc-badge eph-' + ex.phase;
  b.textContent = T(PHASE_META[ex.phase].label);
  document.getElementById('rndInfo').textContent = ex.rounds > 1 ? `${T('Round')} 1 ${T('of')} ${ex.rounds}` : (T(ex.detail) || '');
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
  await playExerciseSound(ex.name);
  if (durMap[ex.secs]) {
    await playTimerSound(durMap[ex.secs]);
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
  document.querySelectorAll('.exrow-t').forEach((r, i) => r.classList.toggle('aex', i === tActiveEx));
  const row = document.getElementById('et' + tActiveEx);
  if (row) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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
  let delay = 600;
  combo.punches.forEach((p, i) => {
    setTimeout(() => {
      if (!tRunning) return;
      playPunch(p);
      renderChips(combo, i);
    }, delay);
    delay += 380;
  });
  comboSeqId = setTimeout(() => {
    if (!tRunning) return;
    currentCombo = COMBOS[Math.floor(Math.random() * COMBOS.length)];
    renderChips(currentCombo, -1);
    setTimeout(() => { if (tRunning) fireCombo(currentCombo); }, 600);
  }, delay + 800);
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
    loadEx();
    return;
  }
  if (tRunning) { stopTimer(); return; }
  startCountdown(() => {
    beginExerciseTimer();
  });
}

function beginExerciseTimer() {
  tRunning = true;
  document.getElementById('startBtn').textContent = T('Pause');
  const ex = WORKOUTS[tActiveDay].exercises[tActiveEx];
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
        tRunning = false;
        startCountdown(() => {
          if (ex.phase === 'boxing') {
            currentCombo = COMBOS[Math.floor(Math.random() * COMBOS.length)];
            renderChips(currentCombo, -1);
          }
          beginExerciseTimer();
        });
        return;
      } else {
        tRound = 1;
        const wo = WORKOUTS[tActiveDay];
        if (tActiveEx < wo.exercises.length - 1) {
          clearInterval(tInterval);
          tActiveEx++; renderExList(); loadEx();
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

function jumpToEx(i) { stopTimer(); tActiveEx = i; tRound = 1; loadEx(); }
function prevEx() { stopTimer(); tRound = 1; if (tActiveEx > 0) { tActiveEx--; renderExList(); loadEx(); } }
function nextEx() { stopTimer(); tRound = 1; const wo = WORKOUTS[tActiveDay]; if (tActiveEx < wo.exercises.length - 1) { tActiveEx++; renderExList(); loadEx(); } }

function updateNextUp() {
  const wo = WORKOUTS[tActiveDay], el = document.getElementById('nextUp');
  el.innerHTML = tActiveEx < wo.exercises.length - 1
    ? `${T('Next:')} <span>${T(wo.exercises[tActiveEx + 1].name)}</span>`
    : `<span>${T('Final exercise!')}</span>`;
}

function updateProg() {
  const total = WORKOUTS[tActiveDay].exercises.length;
  const pct = Math.round((tActiveEx / total) * 100);
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
loadEx();
