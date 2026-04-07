/* ── DATA (v1.0.1 - Vercel Fix) ── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DNAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const CIRC = 2 * Math.PI * 75;

// Initialize Supabase Client
const SUPABASE_URL = 'https://fuqmqcusthzmqekltpkk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dZPVMFIFhd3sXQdx_B9mtw_wVvv5oq7';
const sbClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let currentLang = localStorage.getItem('lang') || 'en';

let userProfiles = JSON.parse(localStorage.getItem('boxingProfiles')) || [
  { id: '1', name: 'Fighter 1' }
];
let activeUserId = localStorage.getItem('activeUserId') || userProfiles[0].id;
if (!userProfiles.find(p => p.id === activeUserId)) activeUserId = userProfiles[0].id;

let programStartDate = localStorage.getItem('programStartDate') || new Date().toISOString().split('T')[0];
let completed = {};
let supabaseProfileId = null;

function populateProfiles() {
  const select = document.getElementById('userSelect');
  if (!select) return;
  select.innerHTML = userProfiles.map(p => 
    `<option value="${p.id}" style="color: black;" ${p.id === activeUserId ? 'selected' : ''}>${T(p.name)}</option>`
  ).join('');
  if (userProfiles.length < 4) {
    select.innerHTML += `<option value="new" style="color: black; font-weight: bold;">${T('+ Add Profile')}</option>`;
  }
}

function handleUserSelect(val) {
  if (val === 'new') {
    document.getElementById('profileModal').style.display = 'flex';
    const inp = document.getElementById('profileNameInput');
    inp.value = '';
    setTimeout(() => inp.focus(), 50);
  } else {
    switchUser(val);
  }
}

function closeProfileModal() {
  document.getElementById('profileModal').style.display = 'none';
  populateProfiles();
}

function saveProfileModal() {
  const pName = document.getElementById('profileNameInput').value;
  if (pName && pName.trim()) {
    document.getElementById('profileModal').style.display = 'none';
    const newId = Date.now().toString();
    userProfiles.push({ id: newId, name: pName.trim() });
    localStorage.setItem('boxingProfiles', JSON.stringify(userProfiles));
    switchUser(newId);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const selector = document.getElementById('langSelect');
  if (selector) selector.value = currentLang;
  populateProfiles();
  applyTranslations(document.body);
  highlightLevel();
  
  // Restore rest controls from saved values
  const pauseSlider = document.getElementById('pauseSlider');
  if (pauseSlider) {
    const pVal = comboPauseMs / 1000;
    pauseSlider.value = pVal;
    const pauseValEl = document.getElementById('pauseVal');
    if (pauseValEl) pauseValEl.textContent = (pVal % 1 === 0 ? pVal.toFixed(0) : pVal.toFixed(1)) + 's';
  }
  const restMinSlider = document.getElementById('restMinSlider');
  if (restMinSlider) {
    restMinSlider.value = restMinMs / 1000;
    document.getElementById('restMinVal').textContent = (restMinMs / 1000 % 1 === 0 ? (restMinMs/1000).toFixed(0) : (restMinMs/1000).toFixed(1)) + 's';
  }
  const restMaxSlider = document.getElementById('restMaxSlider');
  if (restMaxSlider) {
    restMaxSlider.value = restMaxMs / 1000;
    document.getElementById('restMaxVal').textContent = (restMaxMs / 1000 % 1 === 0 ? (restMaxMs/1000).toFixed(0) : (restMaxMs/1000).toFixed(1)) + 's';
  }
  applyRestModeUI();

  if (currentLang !== 'en') {
    const observer = new MutationObserver((mutations) => {
      observer.disconnect();
      applyTranslations(document.body);
      observer.observe(document.body, { childList: true, subtree: true });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Cloud Sync
  initSupabaseSync();
});

async function initSupabaseSync() {
  if (!sbClient) return;
  
  const activeProfile = userProfiles.find(p => p.id === activeUserId) || userProfiles[0];
  
  if (!activeProfile.supabaseProfileId) {
    activeProfile.supabaseProfileId = "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
    const legacyId = localStorage.getItem('supabase_profile_id');
    if (legacyId && activeProfile.id === '1') {
       activeProfile.supabaseProfileId = legacyId;
    }
    localStorage.setItem('boxingProfiles', JSON.stringify(userProfiles));
  }
  
  // Sync Profile Settings from DB if available
  const { data: profData } = await sbClient.from('profiles').select('*').eq('id', activeProfile.supabaseProfileId).single();
  if (profData) {
    if (profData.fitness_level) {
      localStorage.setItem('fitnessLevel', profData.fitness_level);
      highlightLevel();
    }
    if (profData.program_start_date) {
      localStorage.setItem('programStartDate', profData.program_start_date);
      programStartDate = profData.program_start_date;
    }
    if (profData.active_program_id) {
       localStorage.setItem('activeProgramId', profData.active_program_id);
    }
  }

  // Sync back local state (ensures DB is up to date)
  const currentLvl = localStorage.getItem('fitnessLevel') || 'intermediate';
  const progId = localStorage.getItem('activeProgramId') || 'classic';
  await sbClient.from('profiles').upsert({ 
    id: activeProfile.supabaseProfileId, 
    name: activeProfile.name, 
    language: currentLang, 
    fitness_level: currentLvl,
    program_start_date: programStartDate,
    active_program_id: progId,
    active_program: 'classic' 
  }, { onConflict: 'id' }).select();
  
  supabaseProfileId = activeProfile.supabaseProfileId;
  completed = {}; // Clear for new user context

  const { data } = await sbClient.from('workouts_completed').select('day_key').eq('profile_id', supabaseProfileId);
  if (data) {
    data.forEach(row => { completed[row.day_key] = true; });
  }
  if (document.getElementById('view-calendar').classList.contains('active')) buildCalendar();
}

function changeLanguage(lang) {
  localStorage.setItem('lang', lang);
  currentLang = lang;
  window.location.reload();
}

function switchUser(id) {
  activeUserId = id;
  localStorage.setItem('activeUserId', id);
  populateProfiles();
  
  initSupabaseSync().then(() => {
    buildCalendar();
    if (document.getElementById('view-timer').classList.contains('active')) {
      buildTimerTabs(); renderExList(); loadEx(false);
    } else if (document.getElementById('calDetail')?.style.display === 'block') {
      if (selectedCalDay) {
        const parts = selectedCalDay.split('-');
        calSelect(selectedCalDay, parseInt(parts[2]));
      }
    }
  });
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
  jab:          { label: 'Jab',      chip: 'chip-jab',      word: 'JAB!',         delay: 400 },
  cross:        { label: 'Cross',    chip: 'chip-cross',    word: 'CROSS!',       delay: 450 },
  'lead-hook':  { label: 'L.Hook',   chip: 'chip-hook',     word: 'LEAD HOOK!',   delay: 1000 },
  'rear-hook':  { label: 'R.Hook',   chip: 'chip-hook',     word: 'REAR HOOK!',   delay: 1000 },
  'lead-upper': { label: 'L.Upper',  chip: 'chip-uppercut', word: 'LEAD UPPER!',  delay: 1000 },
  'rear-upper': { label: 'R.Upper',  chip: 'chip-uppercut', word: 'REAR UPPER!',  delay: 1000 },
  'body-jab':       { label: 'B.Jab',     chip: 'chip-body',     word: 'BODY JAB!',       delay: 800 },
  'body-cross':     { label: 'B.Cross',   chip: 'chip-body',     word: 'BODY CROSS!',     delay: 800 },
  'body-lead-hook': { label: 'B.L.Hook',  chip: 'chip-body',     word: 'BODY HOOK!',      delay: 1000 },
  'body-rear-hook': { label: 'B.R.Hook',  chip: 'chip-body',     word: 'BODY HOOK!',      delay: 1000 },
  slip:         { label: 'Slip',     chip: 'chip-slip',     word: 'SLIP!',        delay: 900 },
  roll:         { label: 'Roll',     chip: 'chip-slip',     word: 'ROLL!',        delay: 900 },
  feint:        { label: 'Feint',    chip: 'chip-slip',     word: 'FEINT!',       delay: 600 },
};

/* ── COMBO LIBRARY (Tiered by difficulty) ── */
const COMBOS_BEG = [
  { name: 'Jab–Cross (1–2)',                  punches: ['jab','cross'] },
  { name: 'Double Jab–Cross (1–1–2)',         punches: ['jab','jab','cross'] },
  { name: 'Jab–Cross–Jab (1–2–1)',            punches: ['jab','cross','jab'] },
  { name: 'Jab–Cross–Lead Hook (1–2–3)',      punches: ['jab','cross','lead-hook'] },
  { name: 'Jab–Lead Hook (1–3)',              punches: ['jab','lead-hook'] },
  { name: 'Cross–Lead Hook (2–3)',            punches: ['cross','lead-hook'] },
  { name: 'Jab–Cross–Rear Hook (1–2–4)',      punches: ['jab', 'cross', 'rear-hook'] },
  { name: 'Lead Uppercut–Cross (5–2)',        punches: ['lead-upper', 'cross'] },
  { name: 'Jab–Rear Uppercut (1–6)',          punches: ['jab', 'rear-upper'] },
  { name: 'Body Jab–Cross (7–2)',             punches: ['body-jab','cross'] },
];

const COMBOS_INT = [
  ...COMBOS_BEG,
  { name: '1–2–3–2',                           punches: ['jab','cross','lead-hook','cross'] },
  { name: 'Jab–Cross–Lead Uppercut (1–2–5)',   punches: ['jab','cross','lead-upper'] },
  { name: 'Cross–Lead Upper–Lead Hook (2–5–3)',punches: ['cross','lead-upper','lead-hook'] },
  { name: 'Slip–Cross–Lead Hook',              punches: ['slip','cross','lead-hook'] },
  { name: 'Jab–Cross–Body Lead Hook (1–2–9)',  punches: ['jab','cross','body-lead-hook'] },
  { name: 'Body Jab–Head Cross (7–2)',         punches: ['body-jab','cross'] },
  { name: 'Jab–Rear Upper–Cross (1–6–2)',      punches: ['jab','rear-upper','cross'] },
  { name: 'Cross–Lead Hook–Cross (2–3–2)',     punches: ['cross','lead-hook','cross'] },
  { name: 'Slip–Rear Upper–Lead Hook',         punches: ['slip','rear-upper','lead-hook'] },
  { name: '1–2–Block–3',                       punches: ['jab','cross','slip','lead-hook'] },
  { name: 'Lead Hook–Rear Hook (3–4)',         punches: ['lead-hook','rear-hook'] },
  { name: 'Lead Upper–Rear Upper–Hook (5–6–3)',punches: ['lead-upper','rear-upper','lead-hook'] },
];

const COMBOS_ADV = [
  ...COMBOS_INT,
  { name: 'Power Builder (1–2–3–6–3)',          punches: ['jab','cross','lead-hook','rear-upper','lead-hook'] },
  { name: 'Body Breaker (1–8–9–3–2)',           punches: ['jab','body-cross','body-lead-hook','lead-hook','cross'] },
  { name: 'Counter Puncher',                    punches: ['feint','cross','slip','rear-upper','lead-hook','cross'] },
  { name: 'Precision Drill (1–7–2–S–3)',        punches: ['jab','body-jab','cross','slip','lead-hook'] },
  { name: 'Pressure Fighter',                   punches: ['jab','cross','lead-hook','cross','lead-hook','rear-upper'] },
  { name: 'Same-Side Punches (3–5–3)',          punches: ['lead-hook','lead-upper','lead-hook'] },
  { name: 'Level Changer (1–2–6–9–3–2)',        punches: ['jab','cross','rear-upper','body-lead-hook','lead-hook','cross'] },
  { name: 'Inside Uppercuts (5–6–5–6)',         punches: ['lead-upper','rear-upper','lead-upper','rear-upper'] },
  { name: 'Speed Flurry (1–2–1–2–3–2–1)',       punches: ['jab','cross','jab','cross','lead-hook','cross','jab'] },
  { name: 'Inside Hooks & Uppers (3–4–5–6–1)',  punches: ['lead-hook','rear-hook','lead-upper','rear-upper','jab'] },
  { name: 'Rear Hook Power (1–2–3–4)',          punches: ['jab', 'cross', 'lead-hook', 'rear-hook'] },
  { name: 'Tyson Drill (Roll–6–3–2)',           punches: ['roll', 'rear-upper', 'lead-hook', 'cross'] },
];

// Legacy alias for backward compatibility
const COMBOS = COMBOS_INT;

function getCombosForLevel() {
  const level = localStorage.getItem('fitnessLevel') || 'intermediate';
  const date = new Date();
  const workouts = getWorkoutsForDateRange(date);
  if (workouts === WORKOUTS_BEG) return COMBOS_BEG;
  if (workouts === WORKOUTS_ADV) return COMBOS_ADV;
  return COMBOS_INT;
}

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
  'Shadowboxing – Mirror Drill': 'Stand in front of a mirror to self-correct form. Check for tucked chin, hands returning to face, and feet not crossing while moving.',
  'Shadowboxing – 1-2 basics': 'Focus on the Jab and Cross only. Full arm extension, rotate your hips, and exhale with every punch. Quality over quantity.',
  'Shadowboxing – 1-2-3 combos': 'Jab, Cross, Lead Hook. Ensure full extension on straight punches and pivot your lead foot on the hook.',
  'Shadowboxing – slips and rolls': 'Practice evasive head movement. Slip outside straight punches and roll (bob and weave) under hooks.',
  'Shadowboxing – full combos': 'Put together all offensive and defensive tools. Be creative and visualize a real sparring round.',
  'Shadowboxing – defensive': 'Emphasize your guard, head movement, and footwork retreats. Only throw counter punches.',
  'Shadowboxing – full speed': 'Simulate fight pace. Throw punches with max speed while maintaining form and defense.',
  'Shadowboxing – Ghost Sparring': 'Imagine a specific opponent (taller, shorter, aggressive). React to their imaginary movements with footwork, slips, and counters.',
  'Shadowboxing – Brain Training': 'Throw a DIFFERENT three-punch combination every single time for a full round. Improves mental sharpness and variety.',
  'Shadowboxing – Combo Stacking': 'Start with a 1-2, then add a hook, then a slip, then more shots – building up to an 8-punch sequence progressively.',
  'Shadowboxing – ringcraft': 'Focus on movement and pivoting. Control the center of the ring, cut off angles, and maintain balance.',
  'Footwork-Only Round': 'Move for a full round without throwing punches. Stay on the balls of your feet, maintain shoulder-width base, move in all directions.',
  'Heavy bag – power shots': 'Focus on weight transfer and rotation. Sit down on your punches and hit the bag as hard as possible.',
  'Heavy bag – body shots': 'Change levels by bending your knees. Dig hooks and uppercuts into the lower half of the bag.',
  'Heavy bag – Round 1': 'Establish distance with the jab. Use double and triple jabs, both head and body.',
  'Heavy bag – Round 2': 'Focus on the 1-2 combination (Jab-Cross). Ensure the cross lands with power and snapping hip rotation.',
  'Heavy bag – Round 3': 'Integrate the lead hook (1-2-3). Ensure proper body mechanics and bring hands right back to the guard.',
  'Heavy bag – Def. Counters': 'Visualize an incoming punch. Slip or roll first, then immediately fire a fast combination.',
  'Heavy bag – Body Snatcher': 'Use the Jab to blind the opponent, then dig a heavy body hook, followed by an overhand or cross.',
  'Heavy bag – Burnout': 'Non-stop punching. Throw straight 1-2s continuously at the bag as fast as you can. Empty the tank.',
  'Heavy bag – Tabata': '15 seconds of maximum-speed punches followed by 15 seconds of active rest (bouncing). Repeat for 8 intervals.',
  'Heavy bag – Technical HIIT': 'Combine explosive bursts with active recovery (footwork/jabs). Maintain perfect technique even when tired.',
  'Heavy bag – Counters': 'Work on defending an attack and immediately replying with an uppercut or hook counter.',
  'Heavy bag – Power Pyramid': 'Min 1: Single power shots with 1-2s resets. Min 2: Two-punch combos. Min 3: Three to five-punch combos thrown with bad intentions.',
  'Heavy bag – Level Mixing': 'Alternate head and body shots. Body Jab to Head Cross (7-2), Head Jab to Body Cross to Head Hook (1-2b-3). Bend knees to change levels.',
  'Heavy bag – Inside Fighting': 'Get close to the bag. Nonstop alternating uppercuts and hooks. Focus on hip rotation and staying grounded. Make it ugly.',
  'Heavy bag – Speed Tabata': '15s max-speed shoeshine punches, 15s active rest (bouncing). 8 intervals. Focus on fast breathing and fast muscle contractions.',
  'Heavy bag – 7-Second Drill': '7 seconds hitting the bag as hard and fast as possible, 7 seconds rest. Repeat for the round. Finish with 5 burpees.',
  'Heavy bag – Endurance': 'Continuous punching at moderate intensity (50-60% power) for the full round. Focus on breathing and maintaining form under fatigue.',
  'Heavy bag – Feint & Counter': 'Use feints to draw a reaction from the "opponent" (the bag), then slip and fire a sharp counter combination.',
  'Heavy bag – Check Hooks': 'Practice landing the hook while pivoting 90 degrees as the bag moves towards you; stay balanced.',
  'Heavy bag – Lead Hook': 'Pivot on the lead foot, rotate the hips and torso as one unit. Elbow stays at 90°, fist parallel to the floor. Snap it back to guard immediately.',
  'Heavy bag – Rear Hook': 'Step in slightly, pivot on the rear foot and throw the hook from the back hand. Keep the elbow tight and torso rotating. Power comes from the hip.',
  'Heavy bag – Lead Uppercut': 'Drop your lead knee slightly, drive upward from the legs through the hips. Fist faces you (palm toward your face). Short, compact punch aimed at the chin.',
  'Heavy bag – Rear Uppercut': 'Bend the rear knee and explode upward, rotating the rear hip forward. Keep the elbow tight, fist rising on a vertical line. Great for close-range power.',
  'Shadowboxing – Lead Hook': 'Focus purely on the lead hook mechanics. Pivot the front foot, rotate core, keep elbow at 90°. Throw at head height then body height alternately.',
  'Shadowboxing – Rear Hook': 'Practice the rear hook in isolation. Step in, pivot rear foot, rotate hips. Focus on keeping your guard hand protecting the chin throughout.',
  'Shadowboxing – Lead Uppercut': 'Drill the lead uppercut in front of a mirror. Dip slightly, drive up from the legs, keep the punch compact. Alternate between head and body targets.',
  'Shadowboxing – Rear Uppercut': 'Isolate the rear uppercut. Drop the rear knee, explode upward rotating the hip. Immediately return hand to guard. Practice at different speeds.',
  'Speed target – rapid jabs': 'Keep your non-punching hand glued to your chin. Snap the jab out and back as fast as possible.',
  'HIIT – 10-punch burst  squat': 'Throw 10 straight punches as fast as possible, then immediately perform 1 bodyweight squat.',
  'HIIT – Bag & Bodyweight': '45 seconds work, 15 seconds rest: bag combos, burpees, body shots, push-ups, speed punches, high knees. 3 total rounds.',
  'Push-ups': 'Keep a straight line from head to heels. Lower your chest to the floor and press up to full extension.',
  'Push-ups – shoulder taps': 'From push-up position, tap alternate shoulders while keeping hips stable. Builds shoulder stability and core.',
  'Diamond push-ups': 'Place hands close together under your chest forming a diamond shape. Targets the triceps and inner chest.',
  'Bodyweight squats': 'Keep your chest up and back straight. Lower your hips until thighs are parallel to the floor.',
  'Jump squats': 'Explosively jump up from the bottom of the squat position. Land softly and go immediately into the next rep.',
  'Walking lunges': 'Step forward and lower your hips until both knees are bent at a 90-degree angle.',
  'Lateral skater jumps': 'Jump laterally from foot to foot like a speed skater. Builds the lateral agility needed for pivots and movement.',
  'Burpees': 'Drop to a push-up position, perform a push-up, jump feet back to hands, and explosively jump up with hands overhead.',
  'Plank': 'Hold a straight body position resting on your forearms. Squeeze your core and glutes.',
  'Side plank': 'Balance on one forearm with body in a straight line. Hold for specified time, then switch sides.',
  'Mountain climbers': 'From a push-up position, rapidly drive your knees alternating toward your chest.',
  'V-sits': 'Sit balancing on your sit bones. Extend legs and lean back, then bring knees and chest together.',
  'Russian twists': 'Sit with feet slightly elevated. Twist your torso side to side, touching the floor on each side.',
  'Hollow body hold': 'Lie on your back, flatten your lower back to the floor, and hover your arms and legs slightly off the ground.',
  'Bicycle crunches': 'Lie on your back. Alternate bringing your opposite elbow to your knee in a pedaling motion.',
  'Neck & wrist mobilisation': 'Gently stretch the neck in all directions and rotate the wrists to prepare for impact.',
  'Torso twists': 'Stand with a wide stance and twist your upper body left and right to loosen the core and spine.',
  'Dynamic stretching': 'Use movement-based stretches to take joints through their full range of motion.',
  'Cool-down stretch': 'Perform static stretches holding each position for 15-30 seconds to improve flexibility.',
  'Cool-down shadowboxing': 'Very slow, smooth shadowboxing while consciously slowing your breathing. Light footwork, deep nasal breaths.',
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
  // ── DAY A: POWER FOUNDATIONS (50-70% power, form focus) ───────────────────
  A1: { label: 'Power I',   pill: 'pa', color: '#E24B4A', exercises: [
    ...WU_STD,
    { name: 'Shadowboxing – Mirror Drill',  phase: 'boxing',   secs: 120, rounds: 2, detail: 'Check chin, guard height, stance in mirror' },
    RBTR60,
    { name: 'Shadowboxing – 1-2 basics',    phase: 'boxing',   secs: 120, rounds: 2, detail: 'Jab & Cross only – full extension, exhale each punch' },
    RBTR60,
    { name: 'Heavy bag – Round 1',          phase: 'boxing',   secs: 120, rounds: 2, detail: 'Jab only – find your distance at 50% power', noBack: true },
    RBTR60,
    { name: 'Push-ups',                     phase: 'strength', secs: 30,  rounds: 2, detail: '8–10 reps' },
    REST30,
    { name: 'Bodyweight squats',            phase: 'strength', secs: 30,  rounds: 2, detail: '10 reps' },
    REST30,
    { name: 'Plank',                        phase: 'core',     secs: 30,  rounds: 2, detail: 'Tight core, level hips' },
    REST20,
    ...CD_SHORT,
  ]},
  A2: { label: 'Power II',  pill: 'pa', color: '#E24B4A', exercises: [
    ...WU_STD,
    { name: 'Shadowboxing – 1-2 basics',    phase: 'boxing',   secs: 120, rounds: 2, detail: 'Snap the punches, breathe out on every strike' },
    RBTR60,
    { name: 'Heavy bag – Round 2',          phase: 'boxing',   secs: 120, rounds: 2, detail: '1-2 combo focus – rotate hips on Cross', noBack: true },
    RBTR60,
    { name: 'Diamond push-ups',             phase: 'strength', secs: 30,  rounds: 2, detail: '8 reps, control descent' },
    REST30,
    { name: 'Walking lunges',               phase: 'strength', secs: 30,  rounds: 2, detail: '8 each leg' },
    REST30,
    { name: 'Mountain climbers',            phase: 'core',     secs: 30,  rounds: 2, detail: 'Moderate pace' },
    REST20,
    ...CD_SHORT,
  ]},
  A3: { label: 'Power III', pill: 'pa', color: '#E24B4A', exercises: [
    ...WU_STD,
    { name: 'Shadowboxing – Lead Hook',     phase: 'boxing',   secs: 90,  rounds: 2, detail: 'Pivot front foot, rotate core, elbow at 90°' },
    RBTR45,
    { name: 'Shadowboxing – 1-2-3 combos',  phase: 'boxing',   secs: 120, rounds: 2, detail: 'Add the Lead Hook – pivot your front foot' },
    RBTR60,
    { name: 'Heavy bag – Round 3',          phase: 'boxing',   secs: 120, rounds: 2, detail: '1-2-3 combo at 60% power', noBack: true },
    RBTR60,
    { name: 'Push-ups',                     phase: 'strength', secs: 30,  rounds: 2, detail: '10 reps' },
    REST30,
    { name: 'Bodyweight squats',            phase: 'strength', secs: 30,  rounds: 2, detail: '12 reps' },
    REST30,
    { name: 'Hollow body hold',             phase: 'core',     secs: 25,  rounds: 2, detail: 'Lower back flat' },
    REST20,
    ...CD_SHORT,
  ]},

  // ── DAY B: SPEED & DEFENCE (footwork first, then head movement) ──────────
  B1: { label: 'Speed I',   pill: 'pb', color: '#185FA5', exercises: [
    ...WU_SB,
    { name: 'Footwork-Only Round',           phase: 'boxing',   secs: 120, rounds: 2, detail: 'No punches – move in all directions, stay on toes' },
    RBTR60,
    { name: 'Shadowboxing – slips and rolls', phase: 'boxing',  secs: 90,  rounds: 2, detail: 'Slow, exaggerated head movement' },
    RBTR60,
    { name: 'Walking lunges',                phase: 'strength', secs: 30,  rounds: 2, detail: '8 each leg' },
    REST30,
    { name: 'Mountain climbers',             phase: 'core',     secs: 30,  rounds: 2, detail: 'Moderate pace' },
    REST20,
    ...CD_SHORT,
  ]},
  B2: { label: 'Speed II',  pill: 'pb', color: '#185FA5', exercises: [
    ...WU_SB,
    { name: 'Speed target – rapid jabs',     phase: 'boxing',   secs: 90,  rounds: 2, detail: 'Max hand speed – hand back to chin each time' },
    RBTR45,
    { name: 'Shadowboxing – defensive',      phase: 'boxing',   secs: 90,  rounds: 2, detail: 'Guard & counter only – no leading' },
    RBTR60,
    { name: 'Push-ups',                      phase: 'strength', secs: 30,  rounds: 2, detail: '10 reps' },
    REST30,
    { name: 'Russian twists',                phase: 'core',     secs: 30,  rounds: 2, detail: 'Controlled rotation', noBack: true },
    REST20,
    ...CD_SHORT,
  ]},
  B3: { label: 'Speed III', pill: 'pb', color: '#185FA5', exercises: [
    ...WU_DEF,
    { name: 'Footwork-Only Round',           phase: 'boxing',   secs: 90,  rounds: 2, detail: 'Pivot practice – step and drag, never cross feet' },
    RBTR45,
    { name: 'Shadowboxing – 1-2-3 combos',  phase: 'boxing',   secs: 120, rounds: 2, detail: 'Combo then slip – defensive integration' },
    RBTR60,
    { name: 'Bodyweight squats',             phase: 'strength', secs: 30,  rounds: 2, detail: '12 reps' },
    REST30,
    { name: 'Plank',                         phase: 'core',     secs: 30,  rounds: 2, detail: 'Brace everything' },
    REST20,
    ...CD_SHORT,
  ]},

  // ── DAY C: CONDITIONING (bag work + bodyweight) ───────────────────────────
  C1: { label: 'Conditioning I',   pill: 'pc', color: '#639922', exercises: [
    ...WU_DEF,
    { name: 'Heavy bag – body shots',       phase: 'boxing',   secs: 120, rounds: 2, detail: 'Bend knees to change level – hooks to body' },
    RBTR60,
    { name: 'Shadowboxing – defensive',     phase: 'boxing',   secs: 120, rounds: 2, detail: 'Guard & counter only' },
    RBTR60,
    { name: 'Bodyweight squats',            phase: 'strength', secs: 30,  rounds: 2, detail: '10 reps' },
    REST30,
    { name: 'Hollow body hold',             phase: 'core',     secs: 25,  rounds: 2, detail: 'Lower back flat to floor' },
    REST20,
    ...CD_SHORT,
  ]},
  C2: { label: 'Conditioning II',  pill: 'pc', color: '#639922', exercises: [
    ...WU_STD,
    { name: 'Heavy bag – Endurance',        phase: 'boxing',   secs: 120, rounds: 2, detail: '50-60% power – focus on breathing rhythm', noBack: true },
    RBTR60,
    { name: 'Shadowboxing  footwork',       phase: 'boxing',   secs: 90,  rounds: 2, detail: 'Angle changes, stay light on feet' },
    RBTR60,
    { name: 'Walking lunges',               phase: 'strength', secs: 30,  rounds: 2, detail: '8 each leg' },
    REST30,
    { name: 'Mountain climbers',            phase: 'core',     secs: 30,  rounds: 2, detail: 'Moderate pace' },
    REST20,
    ...CD_SHORT,
  ]},
  C3: { label: 'Conditioning III', pill: 'pc', color: '#639922', exercises: [
    ...WU_SB,
    { name: 'Heavy bag – body shots',       phase: 'boxing',   secs: 120, rounds: 2, detail: 'Liver shots & solar plexus' },
    RBTR60,
    { name: 'Heavy bag – Round 2',          phase: 'boxing',   secs: 120, rounds: 2, detail: '1-2 for power at 70%', noBack: true },
    RBTR60,
    { name: 'Push-ups',                     phase: 'strength', secs: 30,  rounds: 2, detail: '10 reps' },
    REST30,
    { name: 'Bicycle crunches',             phase: 'core',     secs: 30,  rounds: 2, detail: 'Full rotation' },
    REST20,
    ...CD_SHORT,
  ]},
  D: { label: 'Fundamentals', pill: 'pc', color: '#888780', exercises: [
    ...WU_STD,
    { name: 'Shadowboxing – Mirror Drill',  phase: 'boxing',   secs: 120, rounds: 2, detail: 'Stance check – chin tucked, guard up, balanced' },
    RBTR60,
    { name: 'Shadowboxing – Lead Hook',     phase: 'boxing',   secs: 90,  rounds: 2, detail: 'Isolate the hook – pivot front foot, rotate core' },
    RBTR45,
    { name: 'Shadowboxing – Lead Uppercut', phase: 'boxing',   secs: 90,  rounds: 2, detail: 'Dip slightly, drive up from legs, keep it compact' },
    RBTR60,
    { name: 'Heavy bag – Round 1',          phase: 'boxing',   secs: 120, rounds: 2, detail: 'Jab focus – full extension, snap back', noBack: true },
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
  // ── DAY A: POWER (80% power, combination building) ────────────────────────
  A1: { label: 'Power I',   pill: 'pa', color: '#E24B4A', exercises: [
    ...WU_STD,
    { name: 'Shadowboxing – 1-2-3 combos', phase: 'boxing',   secs: 180, rounds: 3, detail: 'L-Jab, R-Cross, L-Hook – full rotation' },
    RBTR60,
    { name: 'Heavy bag – Lead Hook',       phase: 'boxing',   secs: 120, rounds: 3, detail: 'Isolate the 3 – pivot, rotate, snap back to guard', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Power Pyramid',   phase: 'boxing',   secs: 180, rounds: 3, detail: 'Single shots → 2-punch → 3-punch combos', noBack: true },
    RBTR60,
    { name: 'Push-ups',                    phase: 'strength', secs: 45,  rounds: 3, detail: '12–15 reps' },
    REST30,
    { name: 'Bodyweight squats',           phase: 'strength', secs: 45,  rounds: 3, detail: '15 reps – drive from the ground' },
    REST30,
    { name: 'Plank',                       phase: 'core',     secs: 45,  rounds: 3, detail: 'Tight core' },
    REST30,
    { name: 'Mountain climbers',           phase: 'core',     secs: 40,  rounds: 2, detail: 'Fast knees' },
    REST20,
    ...CD_MED,
  ]},
  A2: { label: 'Power II',  pill: 'pa', color: '#E24B4A', exercises: [
    ...WU_STD,
    { name: 'Heavy bag – Lead Uppercut',   phase: 'boxing',   secs: 120, rounds: 3, detail: 'Dip, drive up from legs – compact punch to chin', noBack: true },
    RBTR45,
    { name: 'Shadowboxing – Combo Stacking', phase: 'boxing',  secs: 180, rounds: 3, detail: 'Build from 1-2 to 5-punch sequences' },
    RBTR60,
    { name: 'Heavy bag – Level Mixing',    phase: 'boxing',   secs: 180, rounds: 3, detail: 'Head-body-head: 1-2b-3, 7-2', noBack: true },
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
    { name: 'Heavy bag – Rear Hook',       phase: 'boxing',   secs: 120, rounds: 3, detail: 'Step in, pivot rear foot, rotate hips – keep elbow tight', noBack: true },
    RBTR45,
    { name: 'Shadowboxing – Ghost Sparring', phase: 'boxing',  secs: 180, rounds: 3, detail: 'Visualize a taller opponent – manage distance' },
    RBTR60,
    { name: 'Heavy bag – Def. Counters',   phase: 'boxing',   secs: 180, rounds: 3, detail: 'Slip then fire counter at 80% power', noBack: true },
    RBTR60,
    { name: 'Push-ups',                    phase: 'strength', secs: 45,  rounds: 3, detail: '15 reps' },
    REST30,
    { name: 'Walking lunges',              phase: 'strength', secs: 45,  rounds: 3, detail: '12 each leg' },
    REST30,
    { name: 'Russian twists',              phase: 'core',     secs: 40,  rounds: 3, detail: 'Rotate fully each side', noBack: true },
    REST20,
    ...CD_MED,
  ]},

  // ── DAY B: SPEED (head movement, counter-punching) ────────────────────────
  B1: { label: 'Speed I',   pill: 'pb', color: '#185FA5', exercises: [
    ...WU_SB,
    { name: 'Speed target – rapid jabs',    phase: 'boxing',   secs: 120, rounds: 4, detail: 'Max hand speed – snap back to chin' },
    RBTR45,
    { name: 'Shadowboxing – full combos',   phase: 'boxing',   secs: 180, rounds: 3, detail: '3-5 punch sequences with slips' },
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
    { name: 'Shadowboxing – slips and rolls', phase: 'boxing', secs: 120, rounds: 3, detail: 'Fast, crisp head movement – then counter' },
    RBTR60,
    { name: 'Shadowboxing – Ghost Sparring', phase: 'boxing',  secs: 180, rounds: 3, detail: 'Aggressive opponent – use footwork to evade' },
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
    { name: 'Shadowboxing – defensive',     phase: 'boxing',   secs: 180, rounds: 3, detail: 'Guard, slip, counter – never stand still' },
    RBTR60,
    { name: 'Burpees',                      phase: 'strength', secs: 40,  rounds: 3, detail: '8 reps', noBack: true },
    REST30,
    { name: 'Bicycle crunches',             phase: 'core',     secs: 45,  rounds: 3, detail: 'Slow and controlled' },
    REST20,
    ...CD_MED,
  ]},

  // ── DAY C: CONDITIONING (HIIT, inside fighting) ───────────────────────────
  C1: { label: 'Conditioning I',   pill: 'pc', color: '#639922', exercises: [
    ...WU_DEF,
    { name: 'HIIT – 10-punch burst  squat', phase: 'boxing',   secs: 180, rounds: 4, detail: '10 alternating punches then squat', noBack: true },
    RBTR60,
    { name: 'Heavy bag – Inside Fighting', phase: 'boxing',   secs: 180, rounds: 3, detail: 'Close range – uppercuts & hooks, stay grounded', noBack: true },
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
    { name: 'Shadowboxing – Brain Training', phase: 'boxing',  secs: 180, rounds: 3, detail: 'Different 3-punch combo every time' },
    RBTR60,
    { name: 'Burpees',                      phase: 'strength', secs: 40,  rounds: 3, detail: '8 reps', noBack: true },
    REST30,
    { name: 'Bicycle crunches',             phase: 'core',     secs: 45,  rounds: 3, detail: 'Slow and controlled' },
    REST20,
    { name: 'Cool-down shadowboxing',       phase: 'cooldown', secs: 180, rounds: 1, detail: 'Slow, smooth, deep nasal breathing' },
    ...CD_LONG,
  ]},
  C3: { label: 'Conditioning III', pill: 'pc', color: '#639922', exercises: [
    ...WU_STD,
    { name: 'Heavy bag – Body Snatcher',    phase: 'boxing',   secs: 180, rounds: 3, detail: 'Jab, body hook, overhand', noBack: true },
    RBTR60,
    { name: 'Heavy bag – power shots',      phase: 'boxing',   secs: 180, rounds: 3, detail: 'Max power rotation at 80%', noBack: true },
    RBTR60,
    { name: 'Jump squats',                  phase: 'strength', secs: 40,  rounds: 3, detail: 'Max explosion', noBack: true },
    REST30,
    { name: 'Russian twists',               phase: 'core',     secs: 40,  rounds: 3, detail: 'Full rotation', noBack: true },
    REST20,
    ...CD_LONG,
  ]},
  D: { label: 'Ringcraft', pill: 'pc', color: '#888780', exercises: [
    ...WU_SB,
    { name: 'Shadowboxing – ringcraft',     phase: 'boxing',   secs: 180, rounds: 3, detail: 'Centre control, cut off angles, pivot' },
    RBTR60,
    { name: 'Heavy bag – Feint & Counter',  phase: 'boxing',   secs: 180, rounds: 3, detail: 'Sell the feint, then counter', noBack: true },
    RBTR60,
    { name: 'Heavy bag – Check Hooks',      phase: 'boxing',   secs: 180, rounds: 3, detail: 'Pivot 90° while landing hook', noBack: true },
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
  // ── DAY A: MAX POWER (100% fight pace, high volume) ──────────────────────
  A1: { label: 'Power I',   pill: 'pa', color: '#E24B4A', exercises: [
    ...WU_STD,
    { name: 'Shadowboxing – full speed',   phase: 'boxing',   secs: 180, rounds: 4, detail: 'Fight pace with defensive movement' },
    RBTR45,
    { name: 'Heavy bag – Lead Hook',       phase: 'boxing',   secs: 120, rounds: 4, detail: 'Max power hooks – full hip rotation, sit down on it', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Power Pyramid',   phase: 'boxing',   secs: 180, rounds: 5, detail: '1-shot → 2-punch → 5-punch flurries at max power', noBack: true },
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
    { name: 'Shadowboxing – Brain Training', phase: 'boxing',  secs: 180, rounds: 4, detail: 'Different combo every time – no repeats' },
    RBTR45,
    { name: 'Heavy bag – Rear Uppercut',   phase: 'boxing',   secs: 120, rounds: 4, detail: 'Bend rear knee, explode upward – max power on every rep', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Burnout',         phase: 'boxing',   secs: 120, rounds: 4, detail: 'Non-stop 1-2s, max speed', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Inside Fighting', phase: 'boxing',   secs: 180, rounds: 3, detail: 'Close range – uppercuts, hooks, hip rotation', noBack: true },
    RBTR45,
    { name: 'Push-ups – shoulder taps',    phase: 'strength', secs: 45,  rounds: 4, detail: '20 reps' },
    REST25,
    { name: 'Bodyweight squats',           phase: 'strength', secs: 45,  rounds: 4, detail: '20 reps, explosive' },
    REST25,
    { name: 'V-sits',                      phase: 'core',     secs: 45,  rounds: 4, detail: 'Controlled', noBack: true },
    REST20,
    ...CD_LONG,
  ]},
  A3: { label: 'Power III', pill: 'pa', color: '#E24B4A', exercises: [
    ...WU_STD,
    { name: 'Heavy bag – Rear Hook',       phase: 'boxing',   secs: 120, rounds: 4, detail: 'Step in, pivot rear foot – devastating power hook', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Lead Uppercut',   phase: 'boxing',   secs: 120, rounds: 4, detail: 'Dip and drive – palm facing you, tight and compact', noBack: true },
    RBTR45,
    { name: 'Shadowboxing – full combos',  phase: 'boxing',   secs: 180, rounds: 4, detail: '5+ punch combos with feints & level changes' },
    RBTR45,
    { name: 'Heavy bag – 7-Second Drill',  phase: 'boxing',   secs: 180, rounds: 4, detail: '7s all-out → 7s rest → repeat. 5 burpees to finish', noBack: true },
    RBTR45,
    { name: 'Diamond push-ups',            phase: 'strength', secs: 45,  rounds: 4, detail: '15 reps, explosive' },
    REST25,
    { name: 'Walking lunges',              phase: 'strength', secs: 45,  rounds: 4, detail: '16 each leg' },
    REST25,
    { name: 'Russian twists',              phase: 'core',     secs: 45,  rounds: 4, detail: 'Max rotation', noBack: true },
    REST20,
    ...CD_LONG,
  ]},

  // ── DAY B: SPEED & REFLEXES (Tabata, counter-punching mastery) ────────────
  B1: { label: 'Speed I',   pill: 'pb', color: '#185FA5', exercises: [
    ...WU_SB,
    { name: 'Speed target – rapid jabs',      phase: 'boxing',   secs: 120, rounds: 5, detail: 'Burst speed, max hand speed' },
    RBTR45,
    { name: 'Shadowboxing – full speed',      phase: 'boxing',   secs: 180, rounds: 4, detail: 'Fight simulation – no breaks' },
    RBTR45,
    { name: 'Heavy bag – Speed Tabata',       phase: 'boxing',   secs: 180, rounds: 3, detail: '15s max-speed shoeshine → 15s active rest', noBack: true },
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
    { name: 'Shadowboxing – Ghost Sparring',  phase: 'boxing',   secs: 180, rounds: 4, detail: 'Southpaw opponent – adjust angles & distance' },
    RBTR45,
    { name: 'Heavy bag – Def. Counters',      phase: 'boxing',   secs: 180, rounds: 3, detail: 'Slip → fire fast combo at 100%', noBack: true },
    RBTR45,
    { name: 'Lateral skater jumps',           phase: 'strength', secs: 45,  rounds: 4, detail: 'Build lateral agility for pivots', noBack: true },
    REST25,
    { name: 'Russian twists',                 phase: 'core',     secs: 45,  rounds: 4, detail: 'Full rotation speed', noBack: true },
    REST20,
    ...CD_LONG,
  ]},
  B3: { label: 'Speed III', pill: 'pb', color: '#185FA5', exercises: [
    ...WU_SB,
    { name: 'Shadowboxing – defensive',       phase: 'boxing',   secs: 180, rounds: 3, detail: 'Guard, slip, pivot, angled escape' },
    RBTR45,
    { name: 'Heavy bag – Counters',           phase: 'boxing',   secs: 180, rounds: 4, detail: 'Catch and reply – immediate counter', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Check Hooks',        phase: 'boxing',   secs: 180, rounds: 3, detail: '90° pivot while landing hook', noBack: true },
    RBTR45,
    { name: 'Walking lunges',                 phase: 'strength', secs: 45,  rounds: 4, detail: '16 each leg' },
    REST25,
    { name: 'Bicycle crunches',               phase: 'core',     secs: 45,  rounds: 4, detail: 'Full rotation, controlled' },
    REST20,
    ...CD_LONG,
  ]},

  // ── DAY C: ELITE CONDITIONING (Marathon Man, Tabata, circuits) ────────────
  C1: { label: 'Conditioning I',   pill: 'pc', color: '#639922', exercises: [
    ...WU_DEF,
    { name: 'Heavy bag – Endurance',          phase: 'boxing',   secs: 600, rounds: 1, detail: 'MARATHON ROUND – 10 min continuous at 50-60% power', noBack: true },
    RBTR60,
    { name: 'Heavy bag – Burnout',            phase: 'boxing',   secs: 180, rounds: 3, detail: 'Post-marathon finisher – increasing 60%→70%→80%', noBack: true },
    RBTR45,
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
    { name: 'Heavy bag – Tabata',             phase: 'boxing',   secs: 240, rounds: 4, detail: '15s all-out shoeshine → 15s active rest', noBack: true },
    RBTR45,
    { name: 'Heavy bag – body shots',         phase: 'boxing',   secs: 180, rounds: 4, detail: 'Shark attack – liver & solar plexus' },
    RBTR45,
    { name: 'Jump squats',                    phase: 'strength', secs: 45,  rounds: 4, detail: 'Max height', noBack: true },
    REST20,
    { name: 'Side plank',                     phase: 'core',     secs: 45,  rounds: 4, detail: 'Each side – total body stability' },
    REST20,
    { name: 'Cool-down shadowboxing',         phase: 'cooldown', secs: 180, rounds: 1, detail: 'Slow rhythm, deep nasal breathing' },
    ...CD_LONG,
  ]},
  C3: { label: 'Conditioning III', pill: 'pc', color: '#639922', exercises: [
    ...WU_SB,
    { name: 'HIIT – 10-punch burst  squat',   phase: 'boxing',   secs: 180, rounds: 5, detail: 'Max output, 10-punch sprint + squat', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Technical HIIT',     phase: 'boxing',   secs: 180, rounds: 4, detail: 'Explosive technique bursts', noBack: true },
    RBTR45,
    { name: 'Burpees',                        phase: 'strength', secs: 45,  rounds: 4, detail: '12+ reps', noBack: true },
    REST20,
    { name: 'Russian twists',                 phase: 'core',     secs: 45,  rounds: 4, detail: 'Max speed rotation', noBack: true },
    REST20,
    ...CD_LONG,
  ]},
  D: { label: 'Elite Ringcraft', pill: 'pc', color: '#888780', exercises: [
    ...WU_DEF,
    { name: 'Shadowboxing – ringcraft',       phase: 'boxing',   secs: 180, rounds: 4, detail: 'Centre control + pivots + feints' },
    RBTR45,
    { name: 'Heavy bag – Feint & Counter',    phase: 'boxing',   secs: 180, rounds: 4, detail: 'Sell the feint, explode on counter', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Inside Fighting',    phase: 'boxing',   secs: 180, rounds: 4, detail: 'Same-side combos: 3-5-3, alternating hooks & uppers', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Def. Counters',      phase: 'boxing',   secs: 180, rounds: 3, detail: 'Slip → fire fast combo at max power', noBack: true },
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

function getWeekOfProgram(date) {
  const start = new Date(programStartDate);
  const diff = date.getTime() - start.getTime();
  if (diff < 0) return 0;
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 7)) + 1;
}

function getWorkoutsForDateRange(date) {
  const week = getWeekOfProgram(date);
  const userId = activeUserId;
  
  if (userId === '1') { // 1Yr B->A
    if (week <= 16) return WORKOUTS_BEG;
    if (week <= 32) return WORKOUTS_INT;
    return WORKOUTS_ADV;
  }
  if (userId === '2') { // 6Mo B->A
    if (week <= 8) return WORKOUTS_BEG;
    if (week <= 16) return WORKOUTS_INT;
    return WORKOUTS_ADV;
  }
  if (userId === '3') { // 6Mo B->I
    if (week <= 12) return WORKOUTS_BEG;
    return WORKOUTS_INT;
  }
  if (userId === '4') { // 6Mo I->A
    if (week <= 12) return WORKOUTS_INT;
    return WORKOUTS_ADV;
  }
  
  // Default to static fitness level if no user program
  const level = localStorage.getItem('fitnessLevel') || 'intermediate';
  return WORKOUTS_MAP[level] || WORKOUTS_INT;
}

function getWorkouts() {
  // If we are looking at a specific calendar date, we should ideally pass that.
  // But for the "Workouts" tab (current training), we use today's level.
  return getWorkoutsForDateRange(new Date());
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
  HB_BEG_1: { label: 'HB 1', pill: 'pa', color: '#BA7517', exercises: [
    ...HB_WUP,
    { name: 'Heavy bag – Round 1',          phase: 'boxing',   secs: 120, rounds: 3, detail: 'Focus on Jab distance', noBack: true },
    RBTR60,
    { name: 'Heavy bag – Round 2',          phase: 'boxing',   secs: 120, rounds: 2, detail: 'Focus on 1-2 Combo', noBack: true },
    RBTR60,
    { name: 'Push-ups',                     phase: 'strength', secs: 30,  rounds: 3, detail: '8-12 reps' },
    REST30,
    { name: 'Plank',                        phase: 'core',     secs: 45,  rounds: 2, detail: 'Hold steady' },
    ...HB_CD 
  ]},
  HB_BEG_2: { label: 'HB 2', pill: 'pa', color: '#BA7517', exercises: [
    ...HB_WUP,
    { name: 'Heavy bag – Round 3',          phase: 'boxing',   secs: 120, rounds: 3, detail: 'Focus on Lead Hook', noBack: true },
    RBTR60,
    { name: 'Heavy bag – body shots',       phase: 'boxing',   secs: 120, rounds: 2, detail: 'Bend knees, dig hooks' },
    RBTR60,
    { name: 'Bodyweight squats',            phase: 'strength', secs: 30,  rounds: 3, detail: '15 reps' },
    REST30,
    { name: 'Bicycle crunches',             phase: 'core',     secs: 30,  rounds: 2, detail: 'Controlled rotation' },
    ...HB_CD 
  ]},
  HB_BEG_3: { label: 'HB 3', pill: 'pa', color: '#BA7517', exercises: [
    ...HB_WUP,
    { name: 'Heavy bag – power shots',      phase: 'boxing',   secs: 120, rounds: 3, detail: 'Full rotation, sit on punches' },
    RBTR60,
    { name: 'Heavy bag – Endurance',        phase: 'boxing',   secs: 180, rounds: 2, detail: 'Keep moving, keep popping', noBack: true },
    RBTR60,
    { name: 'Walking lunges',               phase: 'strength', secs: 40,  rounds: 2, detail: 'Stay balanced' },
    REST30,
    { name: 'Mountain climbers',            phase: 'core',     secs: 40,  rounds: 2, detail: 'Moderate pace' },
    ...HB_CD 
  ]},
  
  HB_INT_1: { label: 'HB 1', pill: 'pb', color: '#185FA5', exercises: [
    ...HB_WUP,
    { name: 'Heavy bag – Def. Counters',    phase: 'boxing',   secs: 180, rounds: 3, detail: 'Slip and Counter', noBack: true },
    RBTR60,
    { name: 'Heavy bag – Body Snatcher',    phase: 'boxing',   secs: 180, rounds: 2, detail: 'Level changing focus', noBack: true },
    RBTR60,
    { name: 'Push-ups – shoulder taps',     phase: 'strength', secs: 45,  rounds: 2, detail: 'Stability focus' },
    REST30,
    { name: 'Russian twists',                phase: 'core',     secs: 45,  rounds: 2, detail: 'Fast rotation', noBack: true },
    ...HB_CD 
  ]},
  HB_INT_2: { label: 'HB 2', pill: 'pb', color: '#185FA5', exercises: [
    ...HB_WUP,
    { name: 'Heavy bag – Level Mixing',     phase: 'boxing',   secs: 180, rounds: 3, detail: 'Head & Body combos' },
    RBTR60,
    { name: 'Heavy bag – Counters',          phase: 'boxing',   secs: 180, rounds: 2, detail: 'Catch and Reply', noBack: true },
    RBTR60,
    { name: 'Jump squats',                  phase: 'strength', secs: 45,  rounds: 2, detail: 'Explosive power' },
    REST30,
    { name: 'V-sits',                       phase: 'core',     secs: 45,  rounds: 2, detail: 'Core tension' },
    ...HB_CD 
  ]},
  HB_INT_3: { label: 'HB 3', pill: 'pb', color: '#185FA5', exercises: [
    ...HB_WUP,
    { name: 'Heavy bag – Power Pyramid',    phase: 'boxing',   secs: 180, rounds: 3, detail: 'Build the volume' },
    RBTR60,
    { name: 'Heavy bag – Technical HIIT',   phase: 'boxing',   secs: 180, rounds: 2, detail: 'Explosive technique bursts', noBack: true },
    RBTR60,
    { name: 'Push-ups',                     phase: 'strength', secs: 60,  rounds: 2, detail: 'Max reps' },
    REST30,
    { name: 'Leg raises',                   phase: 'core',     secs: 45,  rounds: 2, detail: 'Lower abs' },
    ...HB_CD 
  ]},

  HB_ADV_1: { label: 'HB 1', pill: 'pc', color: '#E24B4A', exercises: [
    ...HB_WUP,
    { name: 'Heavy bag – Burnout',          phase: 'boxing',   secs: 180, rounds: 4, detail: 'Max intensity intervals', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Speed Tabata',     phase: 'boxing',   secs: 240, rounds: 2, detail: 'Sprints on the bag', noBack: true },
    RBTR60,
    { name: 'Burpees',                      phase: 'strength', secs: 60,  rounds: 3, detail: 'Max heart rate' },
    REST30,
    { name: 'Russian twists',                phase: 'core',     secs: 60,  rounds: 2, detail: 'Full range', noBack: true },
    ...HB_CD 
  ]},
  HB_ADV_2: { label: 'HB 2', pill: 'pc', color: '#E24B4A', exercises: [
    ...HB_WUP,
    { name: 'Heavy bag – Technical HIIT',   phase: 'boxing',   secs: 180, rounds: 4, detail: 'Explosive speed', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Inside Fighting',  phase: 'boxing',   secs: 180, rounds: 2, detail: 'Rip hooks & uppercuts' },
    RBTR60,
    { name: 'Jump squats',                  phase: 'strength', secs: 60,  rounds: 3, detail: 'Explosivity' },
    REST30,
    { name: 'Hollow body hold',             phase: 'core',     secs: 60,  rounds: 2, detail: 'Total core burn' },
    ...HB_CD 
  ]},
  HB_ADV_3: { label: 'HB 3', pill: 'pc', color: '#E24B4A', exercises: [
    ...HB_WUP,
    { name: 'Heavy bag – Tabata',           phase: 'boxing',   secs: 240, rounds: 4, detail: 'Interval sprints', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Burnout',          phase: 'boxing',   secs: 180, rounds: 2, detail: 'No mercy', noBack: true },
    RBTR60,
    { name: 'Burpees',                      phase: 'strength', secs: 60,  rounds: 3, detail: 'Empty the tank' },
    REST30,
    { name: 'Plank',                        phase: 'core',     secs: 90,  rounds: 2, detail: 'Mental toughness' },
    ...HB_CD 
  ]},
};

Object.assign(WORKOUTS_BEG, HB_DATA);
Object.assign(WORKOUTS_INT, HB_DATA);
Object.assign(WORKOUTS_ADV, HB_DATA);

/* ── STATE ── */
const today = new Date();
let viewYear = today.getFullYear();
let viewMonth = today.getMonth();
let selectedCalDay = null;
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
let comboPauseMs = parseInt(localStorage.getItem('comboPauseMs') || '3000');
let restMode = localStorage.getItem('restMode') || 'fixed';
let restMinMs = parseInt(localStorage.getItem('restMinMs') || '1000');
let restMaxMs = parseInt(localStorage.getItem('restMaxMs') || '5000');
let restCountdownInterval = null;

function setLevel(level) {
  localStorage.setItem('fitnessLevel', level);
  highlightLevel();
  // Sync to Supabase
  if (sbClient && supabaseProfileId) {
    sbClient.from('profiles').update({ fitness_level: level }).eq('id', supabaseProfileId).then();
  }
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

function fmtRestVal(num) {
  return (num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)) + 's';
}

function updatePause(val) {
  comboPauseMs = parseFloat(val) * 1000;
  localStorage.setItem('comboPauseMs', comboPauseMs);
  const el = document.getElementById('pauseVal');
  if (el) el.textContent = fmtRestVal(parseFloat(val));
}

function toggleRestMode() {
  restMode = restMode === 'fixed' ? 'random' : 'fixed';
  localStorage.setItem('restMode', restMode);
  applyRestModeUI();
}

function applyRestModeUI() {
  const fixedBtn = document.getElementById('restFixedBtn');
  const randomBtn = document.getElementById('restRandomBtn');
  const fixedCtrl = document.getElementById('restFixedControls');
  const randomCtrl = document.getElementById('restRandomControls');
  if (!fixedBtn) return;
  if (restMode === 'fixed') {
    fixedBtn.style.background = '#F5A623'; fixedBtn.style.color = '#000';
    randomBtn.style.background = 'transparent'; randomBtn.style.color = 'var(--text-tertiary)';
    fixedCtrl.style.display = 'flex';
    randomCtrl.style.display = 'none';
  } else {
    fixedBtn.style.background = 'transparent'; fixedBtn.style.color = 'var(--text-tertiary)';
    randomBtn.style.background = '#F5A623'; randomBtn.style.color = '#000';
    fixedCtrl.style.display = 'none';
    randomCtrl.style.display = 'block';
  }
}

function updateRestMin(val) {
  restMinMs = parseFloat(val) * 1000;
  if (restMinMs > restMaxMs) {
    restMaxMs = restMinMs;
    localStorage.setItem('restMaxMs', restMaxMs);
    document.getElementById('restMaxSlider').value = val;
    document.getElementById('restMaxVal').textContent = fmtRestVal(parseFloat(val));
  }
  localStorage.setItem('restMinMs', restMinMs);
  document.getElementById('restMinVal').textContent = fmtRestVal(parseFloat(val));
}

function updateRestMax(val) {
  restMaxMs = parseFloat(val) * 1000;
  if (restMaxMs < restMinMs) {
    restMinMs = restMaxMs;
    localStorage.setItem('restMinMs', restMinMs);
    document.getElementById('restMinSlider').value = val;
    document.getElementById('restMinVal').textContent = fmtRestVal(parseFloat(val));
  }
  localStorage.setItem('restMaxMs', restMaxMs);
  document.getElementById('restMaxVal').textContent = fmtRestVal(parseFloat(val));
}

function getRestDuration() {
  if (restMode === 'random') {
    return restMinMs + Math.random() * (restMaxMs - restMinMs);
  }
  return comboPauseMs;
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
    currentCombo = generateNextCombo(ex);
    renderChips(currentCombo, -1);
  }
}

/* ── AUDIO ── */
const PUNCH_SOUNDS = {
  jab:          new Audio('audio/jab.mp3'),
  cross:        new Audio('audio/cross.mp3'),
  'lead-hook':  new Audio('audio/L_Hook.mp3'),
  'rear-hook':  new Audio('audio/R_Hook.mp3'),
  'lead-upper': new Audio('audio/L_Upper.mp3'),
  'rear-upper': new Audio('audio/R_Upper.mp3'),
  'body-jab':       new Audio('audio/Body_Jab.mp3'),
  'body-cross':     new Audio('audio/Body_Cross.mp3'),
  'body-lead-hook': new Audio('audio/Body_Lead_Hook.mp3'),
  'body-rear-hook': new Audio('audio/Body_Rear_Hook.mp3'),
  slip:         new Audio('audio/slip.mp3'),
  roll:         new Audio('audio/Roll.mp3'),
  feint:        new Audio('audio/Feint.mp3'),
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
      const safeFilename = filename.replace(/ /g, '_');
      const s = new Audio(`audio/${safeFilename}.mp3`);
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
  document.getElementById('sHrs').textContent = (done * 1); // 1h per session
  document.getElementById('sStr').textContent = streak + 'd';
}

function calSelect(dk, d) {
  selectedCalDay = dk;
  const parts = dk.split('-');
  const y = parseInt(parts[0]), mo = parseInt(parts[1]);
  const wt = getWorkoutForDate(y, mo, d);
  const isDone = !!completed[dk];
  const dateStr = T(MONTHS[mo]) + ' ' + d + ', ' + y;

  const currentWorkouts = getWorkoutsForDateRange(new Date(y, mo, d));
  const woLevel = currentWorkouts === WORKOUTS_BEG ? 'Beginner' : currentWorkouts === WORKOUTS_INT ? 'Intermediate' : 'Advanced';
  const weekNum = getWeekOfProgram(new Date(y, mo, d));

  let html = `<div class="detail-panel">
    <div class="dp-hd">
      <div>
        <div class="dp-sub">${T(dateStr)} • ${T('Week')} ${weekNum} • ${T(woLevel)}</div>
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
    const wo = currentWorkouts[wt];
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
  const isDone = completed[dk];
  if (isDone) {
    delete completed[dk];
    if (sbClient) sbClient.from('workouts_completed').delete().match({ profile_id: supabaseProfileId, day_key: dk }).then();
  } else {
    completed[dk] = true;
    if (sbClient) sbClient.from('workouts_completed').insert({ profile_id: supabaseProfileId, day_key: dk }).then();
  }
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

function getAllowedPunches(name, detail) {
  const s = (name + ' ' + (detail || '')).toLowerCase();
  let allowed = new Set();
  
  if (s.includes('jab only') || s.includes('rapid jabs')) {
    allowed.add('jab');
  } else if (s.includes('1-2 basics') || s.includes('1-2 combo')) {
    allowed.add('jab'); allowed.add('cross');
  } else if (s.includes('1-2-3')) {
    allowed.add('jab'); allowed.add('cross'); allowed.add('lead-hook');
  } else if (s.includes('lead hook')) {
    allowed.add('lead-hook');
  } else if (s.includes('rear hook')) {
    allowed.add('rear-hook');
  } else if (s.includes('lead uppercut')) {
    allowed.add('lead-upper');
  } else if (s.includes('rear uppercut')) {
    allowed.add('rear-upper');
  } else if (s.includes('body shots') || s.includes('body snatcher')) {
    allowed.add('body-jab'); allowed.add('body-cross'); allowed.add('body-lead-hook'); allowed.add('body-rear-hook');
  } else if (s.includes('slips and rolls')) {
    allowed.add('slip'); allowed.add('roll');
  } else if (s.includes('defensive')) {
    allowed.add('slip'); allowed.add('roll'); allowed.add('feint'); allowed.add('jab'); allowed.add('cross');
  } else if (s.includes('check hooks')) {
    allowed.add('lead-hook'); allowed.add('rear-hook');
  } else {
    return Object.keys(PUNCH_DATA);
  }
  return Array.from(allowed);
}

function generateNextCombo(ex) {
  if (ex.name === 'HIIT – 10-punch burst  squat') {
    return { name: '10-Punch Burst!', punches: ['jab','cross','jab','cross','jab','cross','jab','cross','jab','cross'] };
  }
  const allowed = getAllowedPunches(ex.name, ex.detail);
  const _combos = getCombosForLevel(); 
  const validCombos = _combos.filter(c => c.punches.every(p => allowed.includes(p)));
  if (validCombos.length > 0) {
    return validCombos[Math.floor(Math.random() * validCombos.length)];
  } else {
    const p1 = allowed[Math.floor(Math.random() * allowed.length)];
    const p2 = allowed[Math.floor(Math.random() * allowed.length)];
    return { name: 'Focus', punches: [p1, p2] };
  }
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
    document.getElementById('punchReference').style.display = 'none';
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
    const allowed = getAllowedPunches(ex.name, ex.detail);
    currentCombo = generateNextCombo(ex);
    
    renderChips(currentCombo, -1);
    document.getElementById('comboBox').style.display = 'block';
    
    // Render static punch reference filtered by allowed punches
    document.getElementById('punchReferenceGrid').innerHTML = allowed.map(p => {
      const pd = PUNCH_DATA[p];
      return `<div class="pchip ${pd.chip}" style="opacity:0.85">${pd.label}</div>`;
    }).join('');
    document.getElementById('punchReference').style.display = 'block';
  } else {
    document.getElementById('comboBox').style.display = 'none';
    document.getElementById('punchReference').style.display = 'none';
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
  // After last punch, brief pause then show next combo + rest countdown
  comboSeqId = setTimeout(() => {
    if (!tRunning) return;
    const ex = getWorkouts()[tActiveDay].exercises[tActiveEx];
    currentCombo = generateNextCombo(ex);
    renderChips(currentCombo, -1);

    // Get rest duration (fixed or random)
    const thisRestMs = getRestDuration();

    // Show reposition countdown
    const callout = document.getElementById('callout');
    let restSecs = Math.ceil(thisRestMs / 1000);
    callout.textContent = '🥊 ' + T('Reposition') + '... ' + restSecs + 's';
    callout.style.opacity = '0.7';

    if (restCountdownInterval) clearInterval(restCountdownInterval);
    restCountdownInterval = setInterval(() => {
      restSecs--;
      if (restSecs > 0) {
        callout.textContent = '🥊 ' + T('Reposition') + '... ' + restSecs + 's';
      } else {
        clearInterval(restCountdownInterval);
        restCountdownInterval = null;
        callout.style.opacity = '1';
      }
    }, 1000);

    setTimeout(() => {
      if (restCountdownInterval) { clearInterval(restCountdownInterval); restCountdownInterval = null; }
      callout.style.opacity = '1';
      if (tRunning) fireCombo(currentCombo);
    }, thisRestMs);
  }, delay + 500);
}

function clearSeq() {
  if (comboSeqId) { clearTimeout(comboSeqId); comboSeqId = null; }
  if (restCountdownInterval) { clearInterval(restCountdownInterval); restCountdownInterval = null; }
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
          currentCombo = generateNextCombo(ex);
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
          
          let targetDk = dayKey(today.getFullYear(), today.getMonth(), today.getDate());
          if (selectedCalDay) {
            const parts = selectedCalDay.split('-');
            if (getWorkoutForDate(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2])) === tActiveDay) {
              targetDk = selectedCalDay;
            }
          }
          const isDone = !!completed[targetDk];
          
          document.getElementById('rndInfo').innerHTML = T('Great work, fighter!') + 
            `<br><button id="sessionCompleteBtn" class="mkbtn${isDone ? ' done' : ''}" style="margin-top:20px; width:200px" onclick="markSessionComplete('${targetDk}')">${T(isDone ? 'Completed' : 'Mark done')}</button>`;
            
          document.getElementById('progFill').style.width = '100%';
          document.getElementById('progPct').textContent = '100%';
        }
      }
    }
  }, 1000);
}

function markSessionComplete(dk) {
  const isDone = completed[dk];
  if (isDone) {
    delete completed[dk];
    if (sbClient) sbClient.from('workouts_completed').delete().match({ profile_id: supabaseProfileId, day_key: dk }).then();
  } else {
    completed[dk] = true;
    if (sbClient) sbClient.from('workouts_completed').insert({ profile_id: supabaseProfileId, day_key: dk }).then();
  }
  buildCalendar(); // Update calendar in background
  
  const newDone = !!completed[dk];
  const btn = document.getElementById('sessionCompleteBtn');
  if (btn) {
    btn.className = `mkbtn${newDone ? ' done' : ''}`;
    btn.textContent = T(newDone ? 'Completed' : 'Mark done');
  }
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
  const pSel = document.getElementById('programSelect');
  if (pSel) pSel.value = localStorage.getItem('activeProgramId') || 'classic';
  const pStr = document.getElementById('programStart');
  if (pStr) pStr.value = programStartDate;

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
  
  // Update locals
  workoutDays = training.map(p => p.dow);
  const assigned = training.map(p => p.val);
  const order = [];
  ['A', 'B', 'C'].forEach(t => { if (assigned.includes(t)) order.push(t); });
  dayOrder = order.length > 0 ? order : ['A', 'B', 'C'];
  
  const progVal = document.getElementById('programSelect').value;
  const dateVal = document.getElementById('programStart').value;
  
  localStorage.setItem('activeProgramId', progVal);
  localStorage.setItem('programStartDate', dateVal);
  programStartDate = dateVal;
  
  // Sync to Supabase
  if (sbClient && supabaseProfileId) {
    sbClient.from('profiles').update({ 
      active_program_id: progVal, 
      program_start_date: dateVal 
    }).eq('id', supabaseProfileId).then();
  }

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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW failed', err));
  });
}

