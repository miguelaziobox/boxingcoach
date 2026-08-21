/* ── DATA (v2.0.0 - Enhanced Boxing Coach) ── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DNAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const CIRC = 2 * Math.PI * 78;

// Initialize Supabase Client
const SUPABASE_URL = 'https://fuqmqcusthzmqekltpkk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dZPVMFIFhd3sXQdx_B9mtw_wVvv5oq7';
const sbClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let currentLang = localStorage.getItem('lang') || 'en';
let audioMode = localStorage.getItem('boxingAudioMode') || 'both'; // 'both', 'sfx', 'voice', 'silent'
let wakeLock = null;
let wakeLockManual = false;

let userProfiles = JSON.parse(localStorage.getItem('boxingProfiles')) || [
  { id: '1', name: 'Fighter 1', customCombos: [] }
];
let activeUserId = localStorage.getItem('activeUserId') || userProfiles[0].id;
if (!userProfiles.find(p => p.id === activeUserId)) activeUserId = userProfiles[0].id;

let programStartDate = localStorage.getItem('programStartDate') || new Date().toISOString().split('T')[0];
let completed = {};
let supabaseProfileId = null;

/* ── SCREEN WAKE LOCK ── */
async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        updateWakeLockUI(false);
      });
      updateWakeLockUI(true);
    } catch (err) {
      console.warn('Wake Lock error:', err);
      updateWakeLockUI(false);
    }
  }
}

async function releaseWakeLock() {
  if (wakeLock) {
    try {
      await wakeLock.release();
      wakeLock = null;
    } catch (e) {}
  }
  updateWakeLockUI(false);
}

function toggleWakeLock() {
  if (wakeLock) {
    wakeLockManual = false;
    releaseWakeLock();
  } else {
    wakeLockManual = true;
    requestWakeLock();
  }
}

function updateWakeLockUI(active) {
  const btn = document.getElementById('wakeLockBtn');
  const txt = document.getElementById('wakeLockText');
  if (!btn || !txt) return;
  if (active) {
    btn.classList.add('active');
    txt.textContent = T('Awake');
  } else {
    btn.classList.remove('active');
    txt.textContent = T('Screen Awake');
  }
}

document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible' && (tRunning || intRunning || wakeLockManual)) {
    await requestWakeLock();
  }
});

/* ── HAPTIC VIBRATION ── */
function triggerHaptic(pattern = [35]) {
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) {}
  }
}

/* ── AUDIO MODE ── */
function setAudioMode(mode) {
  audioMode = mode;
  localStorage.setItem('boxingAudioMode', mode);
  ['both', 'sfx', 'voice', 'silent'].forEach(m => {
    const btn = document.getElementById('am-' + m);
    if (btn) btn.classList.toggle('active', m === mode);
  });
}

function populateProfiles() {
  const select = document.getElementById('userSelect');
  if (!select) return;
  select.innerHTML = userProfiles.map(p => 
    `<option value="${p.id}" style="color: black;" ${p.id === activeUserId ? 'selected' : ''}>${T(p.name)}</option>`
  ).join('');
  if (userProfiles.length < 5) {
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
    userProfiles.push({ id: newId, name: pName.trim(), customCombos: [] });
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
  setAudioMode(audioMode);
  
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
  if (document.getElementById('view-calendar')?.classList.contains('active')) buildCalendar();
  buildBadgesGrid();
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
    buildBadgesGrid();
    if (document.getElementById('view-timer')?.classList.contains('active')) {
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

function getCombosForLevel() {
  const profile = userProfiles.find(p => p.id === activeUserId);
  const customCombos = profile?.customCombos || [];
  
  const workouts = getWorkoutsForDateRange(new Date());
  let baseCombos = COMBOS_INT;
  if (workouts === WORKOUTS_BEG) baseCombos = COMBOS_BEG;
  if (workouts === WORKOUTS_ADV) baseCombos = COMBOS_ADV;
  
  return [...baseCombos, ...customCombos];
}

const PHASE_META = {
  warmup:   { label: 'Warm-up',   cls: 'eph-warmup',   color: '#BA7517' },
  boxing:   { label: 'Boxing',    cls: 'eph-boxing',   color: '#E24B4A' },
  strength: { label: 'Strength',  cls: 'eph-strength', color: '#185FA5' },
  core:     { label: 'Core',      cls: 'eph-core',     color: '#639922' },
  cooldown: { label: 'Cool-down', cls: 'eph-cooldown', color: '#00C9A7' },
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
  'Push-ups': 'Keep a straight line from head to heels. Lower your chest to the floor and press up to full extension.',
  'Push-ups – shoulder taps': 'From push-up position, tap alternate shoulders while keeping hips stable. Builds shoulder stability and core.',
  'Diamond push-ups': 'Place hands close together under your chest forming a diamond shape. Targets the triceps and inner chest.',
  'Bodyweight squats': 'Keep your chest up and back straight. Lower your hips until thighs are parallel to the floor.',
  'Jump squats': 'Explosively jump up from the bottom of the squat position. Land softly and go immediately into the next rep.',
  'Walking lunges': 'Step forward and lower your hips until both knees are bent at a 90-degree angle.',
  'Burpees': 'Drop to a push-up position, perform a push-up, jump feet back to hands, and explosively jump up with hands overhead.',
  'Plank': 'Hold a straight body position resting on your forearms. Squeeze your core and glutes.',
  'Mountain climbers': 'From a push-up position, rapidly drive your knees alternating toward your chest.',
  'Cool-down stretch': 'Perform static stretches holding each position for 15-30 seconds to improve flexibility.',
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
const REST30   = { name: 'Rest',                phase: 'rest',     secs: 30,  rounds: 1, detail: '' };
const REST20   = { name: 'Rest',                phase: 'rest',     secs: 20,  rounds: 1, detail: '' };
const RBTR60   = { name: 'Rest between rounds', phase: 'rest',     secs: 60,  rounds: 1, detail: '' };
const RBTR45   = { name: 'Rest between rounds', phase: 'rest',     secs: 45,  rounds: 1, detail: '' };

const WORKOUTS_BEG = {
  A: { label: 'Day A – Power', pill: 'pa', color: '#E24B4A', exercises: [
    ...WU_STD,
    { name: 'Shadowboxing – Mirror Drill',  phase: 'boxing',   secs: 120, rounds: 2, detail: 'Check chin, guard height, stance' },
    RBTR60,
    { name: 'Shadowboxing – 1-2 basics',    phase: 'boxing',   secs: 120, rounds: 2, detail: 'Jab & Cross only – full extension' },
    RBTR60,
    { name: 'Heavy bag – Round 1',          phase: 'boxing',   secs: 120, rounds: 2, detail: 'Jab only – find your distance', noBack: true },
    RBTR60,
    { name: 'Push-ups',                     phase: 'strength', secs: 30,  rounds: 2, detail: '8–10 reps' },
    REST30,
    { name: 'Bodyweight squats',            phase: 'strength', secs: 30,  rounds: 2, detail: '10 reps' },
    REST30,
    { name: 'Plank',                        phase: 'core',     secs: 30,  rounds: 2, detail: 'Tight core, level hips' },
    REST20,
    ...CD_SHORT,
  ]},
  B: { label: 'Day B – Speed', pill: 'pb', color: '#378ADD', exercises: [
    ...WU_SB,
    { name: 'Footwork-Only Round',           phase: 'boxing',   secs: 120, rounds: 2, detail: 'Stay on toes, move in all directions' },
    RBTR60,
    { name: 'Shadowboxing – slips and rolls', phase: 'boxing',  secs: 90,  rounds: 2, detail: 'Slow, exaggerated head movement' },
    RBTR60,
    { name: 'Walking lunges',                phase: 'strength', secs: 30,  rounds: 2, detail: '8 each leg' },
    REST30,
    { name: 'Mountain climbers',             phase: 'core',     secs: 30,  rounds: 2, detail: 'Moderate pace' },
    REST20,
    ...CD_SHORT,
  ]},
  C: { label: 'Day C – Conditioning', pill: 'pc', color: '#639922', exercises: [
    ...WU_DEF,
    { name: 'Heavy bag – body shots',       phase: 'boxing',   secs: 120, rounds: 2, detail: 'Bend knees to change level' },
    RBTR60,
    { name: 'Shadowboxing – defensive',     phase: 'boxing',   secs: 120, rounds: 2, detail: 'Guard & counter only' },
    RBTR60,
    { name: 'Bodyweight squats',            phase: 'strength', secs: 30,  rounds: 2, detail: '10 reps' },
    REST30,
    { name: 'Plank',                        phase: 'core',     secs: 30,  rounds: 2, detail: 'Solid core' },
    REST20,
    ...CD_SHORT,
  ]},
  D: { label: 'Day D – Ringcraft', pill: 'pd', color: '#FAC775', exercises: [
    ...WU_DEF,
    { name: 'Shadowboxing – footwork',      phase: 'boxing',   secs: 120, rounds: 2, detail: 'Focus on angles & pivots' },
    RBTR60,
    { name: 'Heavy bag – Check Hooks',      phase: 'boxing',   secs: 120, rounds: 2, detail: 'Pivot 90 deg while landing hook' },
    RBTR60,
    { name: 'Conditioning – Sprawls',       phase: 'strength', secs: 30,  rounds: 2, detail: 'Max speed sprawls' },
    REST30,
    ...CD_SHORT
  ]}
};

const WORKOUTS_INT = {
  A: { label: 'Day A – Power', pill: 'pa', color: '#E24B4A', exercises: [
    ...WU_STD,
    { name: 'Shadowboxing – 1-2-3 combos',  phase: 'boxing',   secs: 180, rounds: 3, detail: 'Rotate through power punches' },
    RBTR60,
    { name: 'Heavy bag – Round 2',          phase: 'boxing',   secs: 180, rounds: 3, detail: '1-2-3 combos with bad intentions', noBack: true },
    RBTR60,
    { name: 'Push-ups – shoulder taps',     phase: 'strength', secs: 45,  rounds: 3, detail: '12-15 reps' },
    REST30,
    { name: 'Jump squats',                  phase: 'strength', secs: 45,  rounds: 3, detail: 'Explosive power' },
    REST30,
    { name: 'Russian twists',               phase: 'core',     secs: 45,  rounds: 3, detail: 'Rotational power', noBack: true },
    REST20,
    ...CD_SHORT
  ]},
  B: { label: 'Day B – Speed', pill: 'pb', color: '#378ADD', exercises: [
    ...WU_SB,
    { name: 'Speed target – rapid jabs',    phase: 'boxing',   secs: 120, rounds: 3, detail: 'Max hand speed' },
    RBTR45,
    { name: 'Shadowboxing – full speed',    phase: 'boxing',   secs: 180, rounds: 3, detail: 'High pace combinations' },
    RBTR60,
    { name: 'Diamond push-ups',             phase: 'strength', secs: 45,  rounds: 3, detail: 'Tricep endurance' },
    REST30,
    { name: 'Mountain climbers',            phase: 'core',     secs: 45,  rounds: 3, detail: 'Sprint pace' },
    REST20,
    ...CD_SHORT
  ]},
  C: { label: 'Day C – Conditioning', pill: 'pc', color: '#639922', exercises: [
    ...WU_DEF,
    { name: 'HIIT – 10-punch burst  squat', phase: 'boxing',   secs: 180, rounds: 3, detail: 'Punch flurry then squat' },
    RBTR60,
    { name: 'Heavy bag – Burnout',          phase: 'boxing',   secs: 180, rounds: 3, detail: 'Continuous volume', noBack: true },
    RBTR60,
    { name: 'Burpees',                      phase: 'strength', secs: 45,  rounds: 3, detail: 'Max heart rate' },
    REST30,
    { name: 'Plank',                        phase: 'core',     secs: 60,  rounds: 2, detail: 'Brace hard' },
    REST20,
    ...CD_SHORT
  ]},
  D: { label: 'Day D – Ringcraft', pill: 'pd', color: '#FAC775', exercises: [
    ...WU_DEF,
    { name: 'Shadowboxing – full combos',   phase: 'boxing',   secs: 180, rounds: 3, detail: 'Pivots and level changes' },
    RBTR60,
    { name: 'Heavy bag – Feint & Counter',  phase: 'boxing',   secs: 180, rounds: 3, detail: 'Deceptive entry, then counter' },
    RBTR60,
    { name: 'Jump squats',                  phase: 'strength', secs: 45,  rounds: 3, detail: 'Explosive legs' },
    REST30,
    ...CD_SHORT
  ]}
};

const WORKOUTS_ADV = {
  A: { label: 'Day A – Power', pill: 'pa', color: '#E24B4A', exercises: [
    ...WU_STD,
    { name: 'Shadowboxing – full combos',   phase: 'boxing',   secs: 180, rounds: 4, detail: 'Max velocity' },
    RBTR45,
    { name: 'Heavy bag – Power Pyramid',    phase: 'boxing',   secs: 180, rounds: 4, detail: 'Heavy impact', noBack: true },
    RBTR60,
    { name: 'Diamond push-ups',             phase: 'strength', secs: 60,  rounds: 3, detail: 'Max reps' },
    REST30,
    { name: 'Jump squats',                  phase: 'strength', secs: 60,  rounds: 3, detail: 'Explosive power' },
    REST30,
    { name: 'Plank',                        phase: 'core',     secs: 90,  rounds: 2, detail: 'Total body tension' },
    REST20,
    ...CD_SHORT
  ]},
  B: { label: 'Day B – Speed', pill: 'pb', color: '#378ADD', exercises: [
    ...WU_SB,
    { name: 'Speed target – rapid jabs',    phase: 'boxing',   secs: 180, rounds: 4, detail: 'Nonstop hand speed' },
    RBTR45,
    { name: 'Shadowboxing – full speed',    phase: 'boxing',   secs: 180, rounds: 4, detail: 'Pro sparring pace' },
    RBTR45,
    { name: 'Burpees',                      phase: 'strength', secs: 60,  rounds: 3, detail: 'Sprint pace' },
    REST30,
    { name: 'Mountain climbers',            phase: 'core',     secs: 60,  rounds: 3, detail: 'Fast knees' },
    REST20,
    ...CD_SHORT
  ]},
  C: { label: 'Day C – Conditioning', pill: 'pc', color: '#639922', exercises: [
    ...WU_DEF,
    { name: 'Heavy bag – Tabata',           phase: 'boxing',   secs: 240, rounds: 4, detail: 'Interval sprints', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Burnout',          phase: 'boxing',   secs: 180, rounds: 3, detail: 'No mercy', noBack: true },
    RBTR60,
    { name: 'Burpees',                      phase: 'strength', secs: 60,  rounds: 3, detail: 'Empty the tank' },
    REST30,
    { name: 'Plank',                        phase: 'core',     secs: 90,  rounds: 2, detail: 'Mental toughness' },
    ...CD_SHORT
  ]},
  D: { label: 'Day D – Ringcraft', pill: 'pd', color: '#FAC775', exercises: [
    ...WU_DEF,
    { name: 'Shadowboxing – full combos',   phase: 'boxing',   secs: 180, rounds: 4, detail: 'Championship tempo' },
    RBTR45,
    { name: 'Heavy bag – Def. Counters',    phase: 'boxing',   secs: 180, rounds: 4, detail: 'Slip and Counter', noBack: true },
    RBTR45,
    { name: 'Conditioning – Sprawls',       phase: 'strength', secs: 60,  rounds: 3, detail: 'Max speed' },
    REST30,
    ...CD_SHORT
  ]}
};

const HB_WUP = [
  { name: 'Jump rope',                   phase: 'warmup',   secs: 120, rounds: 1, detail: 'Light pace' },
  { name: 'Arm circles  shoulder rolls', phase: 'warmup',   secs: 60,  rounds: 1, detail: 'Full ROM' },
  { name: 'Rest',                        phase: 'rest',     secs: 30,  rounds: 1, detail: '' },
];
const HB_CD = [{ name: 'Cool-down stretch', phase: 'cooldown', secs: 180, rounds: 1, detail: 'Full body recovery' }];

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
    ...HB_CD 
  ]},
  HB_BEG_3: { label: 'HB 3', pill: 'pa', color: '#BA7517', exercises: [
    ...HB_WUP,
    { name: 'Heavy bag – power shots',      phase: 'boxing',   secs: 120, rounds: 3, detail: 'Full rotation, sit on punches' },
    RBTR60,
    { name: 'Heavy bag – Burnout',          phase: 'boxing',   secs: 120, rounds: 2, detail: 'Continuous straight punches', noBack: true },
    RBTR60,
    { name: 'Walking lunges',               phase: 'strength', secs: 30,  rounds: 2, detail: 'Stay balanced' },
    REST30,
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
    ...HB_CD 
  ]},
  HB_INT_3: { label: 'HB 3', pill: 'pb', color: '#185FA5', exercises: [
    ...HB_WUP,
    { name: 'Heavy bag – Technical HIIT',   phase: 'boxing',   secs: 180, rounds: 3, detail: 'Explosive technique bursts', noBack: true },
    RBTR60,
    { name: 'Heavy bag – Burnout',          phase: 'boxing',   secs: 180, rounds: 2, detail: 'Nonstop punches' },
    RBTR60,
    { name: 'Push-ups',                     phase: 'strength', secs: 60,  rounds: 2, detail: 'Max reps' },
    REST30,
    ...HB_CD 
  ]},
  HB_ADV_1: { label: 'HB 1', pill: 'pc', color: '#E24B4A', exercises: [
    ...HB_WUP,
    { name: 'Heavy bag – Burnout',          phase: 'boxing',   secs: 180, rounds: 4, detail: 'Max intensity intervals', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Tabata',           phase: 'boxing',   secs: 240, rounds: 2, detail: 'Sprints on the bag', noBack: true },
    RBTR60,
    { name: 'Burpees',                      phase: 'strength', secs: 60,  rounds: 3, detail: 'Max heart rate' },
    REST30,
    ...HB_CD 
  ]},
  HB_ADV_2: { label: 'HB 2', pill: 'pc', color: '#E24B4A', exercises: [
    ...HB_WUP,
    { name: 'Heavy bag – Technical HIIT',   phase: 'boxing',   secs: 180, rounds: 4, detail: 'Explosive speed', noBack: true },
    RBTR45,
    { name: 'Heavy bag – Body Snatcher',    phase: 'boxing',   secs: 180, rounds: 2, detail: 'Rip hooks & uppercuts' },
    RBTR60,
    { name: 'Jump squats',                  phase: 'strength', secs: 60,  rounds: 3, detail: 'Explosivity' },
    REST30,
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
    ...HB_CD 
  ]},
};

Object.assign(WORKOUTS_BEG, HB_DATA);
Object.assign(WORKOUTS_INT, HB_DATA);
Object.assign(WORKOUTS_ADV, HB_DATA);

/* ── TRX DATA ── */
const TRX_ROUTINES = {
  1: {
    title: 'Level 1: Mobility & Back Relief',
    desc: 'Decompress lumbar spine and activate deep stabilizers.',
    exercises: [
      { name: 'TRX Standing Row – Slow', phase: 'warmup', secs: 60, rounds: 2, detail: 'Gentle lumbar traction, squeeze scaps' },
      REST30,
      { name: 'TRX Supported Glute Bridge', phase: 'strength', secs: 60, rounds: 3, detail: 'Heels in straps, lift hips' },
      REST30,
      { name: 'TRX Fallout (Kneeling)', phase: 'core', secs: 60, rounds: 2, detail: 'Engage abs, keep neutral spine' },
      REST30,
      { name: 'Cool-down stretch', phase: 'cooldown', secs: 120, rounds: 1, detail: 'Assisted child pose and chest stretch' }
    ]
  },
  2: {
    title: 'Level 2: Core Stability & Rotation',
    desc: 'Build foundational core strength with anti-rotation control.',
    exercises: [
      { name: 'TRX Overhead Squat', phase: 'warmup', secs: 60, rounds: 2, detail: 'Deep squat with counterbalance' },
      REST30,
      { name: 'TRX Plank', phase: 'core', secs: 45, rounds: 3, detail: 'Feet in cradles, tight core' },
      REST30,
      { name: 'TRX Low Row', phase: 'strength', secs: 60, rounds: 3, detail: 'Pull elbows to ribcage' },
      REST30,
      { name: 'Cool-down stretch', phase: 'cooldown', secs: 120, rounds: 1, detail: 'Thoracic and hamstring stretches' }
    ]
  },
  3: {
    title: 'Level 3: Explosive Boxing Power',
    desc: 'High-intensity rotational core strength for punch snap and stability.',
    exercises: [
      { name: 'TRX Explosive Row', phase: 'warmup', secs: 60, rounds: 3, detail: 'Explosive pull, slow return' },
      REST30,
      { name: 'TRX Atomic Push-Up', phase: 'strength', secs: 60, rounds: 3, detail: 'Push-up + knee tuck' },
      REST30,
      { name: 'TRX Mountain Climber', phase: 'core', secs: 60, rounds: 3, detail: 'Rapid knees to chest in straps' },
      REST30,
      { name: 'Cool-down stretch', phase: 'cooldown', secs: 180, rounds: 1, detail: 'Full body stretch flow' }
    ]
  }
};

let currentTrxLevel = 1;

function setTrxLevel(lvl) {
  currentTrxLevel = lvl;
  [1, 2, 3].forEach(l => {
    const btn = document.getElementById('trx-tab-' + l);
    if (btn) btn.classList.toggle('active', l === lvl);
  });
  buildTrxView();
}

function buildTrxView() {
  const routine = TRX_ROUTINES[currentTrxLevel];
  const listEl = document.getElementById('trxExercisesList');
  const titleEl = document.getElementById('trxLevelTitle');
  if (titleEl) titleEl.textContent = routine.title;
  if (!listEl) return;

  listEl.innerHTML = routine.exercises.map((ex, idx) => {
    if (ex.phase === 'rest') return '';
    return `
      <div class="exrow-t" style="margin-bottom:6px;">
        <div class="exdot" style="background:${PHASE_META[ex.phase].color}"></div>
        <div class="exname">${T(ex.name)}</div>
        <div class="exdur2">${ex.rounds > 1 ? `${ex.rounds}×${fmt(ex.secs)}` : fmt(ex.secs)}</div>
      </div>
    `;
  }).join('');
}

function startTrxWorkout() {
  const routine = TRX_ROUTINES[currentTrxLevel];
  // Inject into workouts as TRX Day
  const currentWorkouts = getWorkouts();
  currentWorkouts['TRX'] = {
    label: routine.title,
    pill: 'ptrx',
    color: '#00C9A7',
    exercises: routine.exercises
  };
  tActiveDay = 'TRX';
  showView('timer');
  buildTimerTabs();
  renderExList();
  loadEx(false);
}

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

function getWeekOfProgram(date) {
  const start = new Date(programStartDate);
  const diffTime = Math.abs(date - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.ceil(diffDays / 7));
}

function getWorkoutsForDateRange(date) {
  const progId = localStorage.getItem('activeProgramId') || 'classic';
  if (progId === 'classic') {
    const lvl = localStorage.getItem('fitnessLevel') || 'intermediate';
    if (lvl === 'beginner') return WORKOUTS_BEG;
    if (lvl === 'advanced') return WORKOUTS_ADV;
    return WORKOUTS_INT;
  }
  const week = getWeekOfProgram(date);
  if (progId === '6m-ba') {
    if (week <= 8) return WORKOUTS_BEG;
    if (week <= 16) return WORKOUTS_INT;
    return WORKOUTS_ADV;
  }
  if (progId === '6m-bi') {
    if (week <= 12) return WORKOUTS_BEG;
    return WORKOUTS_INT;
  }
  if (progId === '6m-ia') {
    if (week <= 12) return WORKOUTS_INT;
    return WORKOUTS_ADV;
  }
  if (progId === '1y-ba') {
    if (week <= 16) return WORKOUTS_BEG;
    if (week <= 34) return WORKOUTS_INT;
    return WORKOUTS_ADV;
  }
  return WORKOUTS_INT;
}

function getWorkouts() {
  return getWorkoutsForDateRange(new Date());
}

function setLevel(level) {
  localStorage.setItem('fitnessLevel', level);
  highlightLevel();
  if (sbClient && supabaseProfileId) {
    sbClient.from('profiles').update({ fitness_level: level }).eq('id', supabaseProfileId).then();
  }
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

/* ── AUDIO & SOUND ENGINE ── */
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
  triggerHaptic([35]);
  if (audioMode === 'silent') return;
  
  if (audioMode === 'both' || audioMode === 'sfx') {
    const s = PUNCH_SOUNDS[key];
    if (s) {
      const clone = s.cloneNode();
      clone.play().catch(e => console.log('Audio play blocked:', e));
    }
  }
  
  if (audioMode === 'voice') {
    try {
      const word = PUNCH_DATA[key]?.word || key;
      const u = new SpeechSynthesisUtterance(word);
      u.rate = 1.3;
      speechSynthesis.speak(u);
    } catch (e) {}
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
  if (audioMode === 'silent') return Promise.resolve();
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
    actualName.replace(/&/g, 'and').replace(/\s*[–—\-]\s*/g, '  '),
    actualName.replace(/&/g, 'and').replace(/\s*[–—\-]\s*/g, ' '),
    c,
    c.replace(/\s/g, '  '), 
    actualName.replace(/–/g, '-'),
    actualName.toLowerCase().replace(/–/g, '-')
  ];

  return new Promise(async (resolve) => {
    for (const a of attempts) {
      try {
        await tryPlay(a);
        return resolve();
      } catch (e) {}
    }
    
    try {
      isSpeaking = true;
      const utterance = new SpeechSynthesisUtterance(name);
      utterance.lang = currentLang === 'pt-PT' ? 'pt-PT' : 'en-US';
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
  triggerHaptic([100, 50, 100]);
  if (audioMode === 'silent') return;
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

function playTick() {
  triggerHaptic([20]);
  if (audioMode === 'silent') return;
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
  if (audioMode === 'silent') return Promise.resolve();
  return new Promise((resolve) => {
    const s = new Audio(`audio/timer/${key}.mp3`);
    currentExAudio = s;
    s.onended = () => { currentExAudio = null; resolve(); };
    s.onerror = () => { currentExAudio = null; resolve(); };
    s.play().catch(() => { currentExAudio = null; resolve(); });
  });
}

function playGo() {
  triggerHaptic([60, 40, 60]);
  if (audioMode === 'silent') return;
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

/* ── STANDALONE QUICK INTERVAL BOXING TIMER ── */
let intRunning = false;
let intPaused = false;
let intPhase = 'prep'; // 'prep', 'work', 'rest'
let intCurrentRound = 1;
let intTotalRounds = 6;
let intWorkSecs = 180;
let intRestSecs = 60;
let intRemainingSecs = 5;
let intIntervalTimer = null;

function openQuickTimerModal() {
  document.getElementById('quickTimerModal').style.display = 'flex';
}

function closeQuickTimerModal() {
  if (!intRunning) {
    document.getElementById('quickTimerModal').style.display = 'none';
  } else {
    // Keep running or confirm
    document.getElementById('quickTimerModal').style.display = 'none';
  }
}

function startQuickTimerFromSettings() {
  intWorkSecs = parseInt(document.getElementById('intRoundDur').value) || 180;
  intRestSecs = parseInt(document.getElementById('intRestDur').value) || 60;
  intTotalRounds = parseInt(document.getElementById('intRoundsCount').value) || 6;
  startQuickTimer();
}

function startQuickTimer() {
  ensureAudio();
  requestWakeLock();
  intRunning = true;
  intPaused = false;
  intPhase = 'prep';
  intCurrentRound = 1;
  intRemainingSecs = 5;

  document.getElementById('intTimerSettings').style.display = 'none';
  document.getElementById('intTimerDisplay').style.display = 'block';
  document.getElementById('intPauseBtn').textContent = T('Pause');

  updateQuickTimerUI();
  playTimerSound(5);

  if (intIntervalTimer) clearInterval(intIntervalTimer);
  intIntervalTimer = setInterval(quickTimerTick, 1000);
}

function quickTimerTick() {
  if (intPaused) return;
  intRemainingSecs--;
  
  if (intPhase === 'prep') {
    if (intRemainingSecs > 0) {
      playTimerSound(intRemainingSecs);
    } else {
      intPhase = 'work';
      intRemainingSecs = intWorkSecs;
      playBell();
    }
  } else if (intPhase === 'work') {
    if (intRemainingSecs === 10) {
      playTick();
    } else if ([3, 2, 1].includes(intRemainingSecs)) {
      playTimerSound(intRemainingSecs);
    } else if (intRemainingSecs <= 0) {
      playBell();
      if (intCurrentRound >= intTotalRounds) {
        stopQuickTimer();
        alert(T('Session complete! Great work, fighter!'));
        return;
      } else {
        intPhase = 'rest';
        intRemainingSecs = intRestSecs;
      }
    }
  } else if (intPhase === 'rest') {
    if (intRemainingSecs === 10) {
      playTick();
    } else if ([3, 2, 1].includes(intRemainingSecs)) {
      playTimerSound(intRemainingSecs);
    } else if (intRemainingSecs <= 0) {
      intCurrentRound++;
      intPhase = 'work';
      intRemainingSecs = intWorkSecs;
      playBell();
    }
  }
  updateQuickTimerUI();
}

function updateQuickTimerUI() {
  const digits = document.getElementById('intTimeDigits');
  const badge = document.getElementById('intPhaseBadge');
  const info = document.getElementById('intRoundsInfo');
  if (!digits || !badge || !info) return;

  digits.textContent = fmt(intRemainingSecs);
  info.textContent = `${T('Round')} ${intCurrentRound} ${T('of')} ${intTotalRounds}`;

  badge.className = 'int-phase-badge';
  if (intPhase === 'prep') {
    badge.classList.add('int-phase-prep');
    badge.textContent = T('Get Ready!');
  } else if (intPhase === 'work') {
    badge.classList.add('int-phase-work');
    badge.textContent = T('WORK');
  } else if (intPhase === 'rest') {
    badge.classList.add('int-phase-rest');
    badge.textContent = T('REST');
  }
}

function toggleQuickTimerPause() {
  intPaused = !intPaused;
  const btn = document.getElementById('intPauseBtn');
  if (btn) btn.textContent = intPaused ? T('Resume') : T('Pause');
}

function stopQuickTimer() {
  intRunning = false;
  intPaused = false;
  if (intIntervalTimer) { clearInterval(intIntervalTimer); intIntervalTimer = null; }
  if (!tRunning && !wakeLockManual) releaseWakeLock();
  
  document.getElementById('intTimerSettings').style.display = 'block';
  document.getElementById('intTimerDisplay').style.display = 'none';
}

/* ── CUSTOM COMBO BUILDER ── */
let currentCustomSeq = [];

function openCustomComboModal() {
  document.getElementById('comboBuilderModal').style.display = 'flex';
  const selector = document.getElementById('comboPunchSelector');
  if (selector) {
    selector.innerHTML = Object.keys(PUNCH_DATA).map(key => {
      const p = PUNCH_DATA[key];
      return `<button onclick="addPunchToCustomCombo('${key}')" class="pchip ${p.chip}" style="cursor:pointer; border:1px solid rgba(255,255,255,0.2);">${p.label}</button>`;
    }).join('');
  }
  currentCustomSeq = [];
  renderCustomComboSeq();
}

function closeCustomComboModal() {
  document.getElementById('comboBuilderModal').style.display = 'none';
}

function addPunchToCustomCombo(key) {
  if (currentCustomSeq.length >= 8) return;
  currentCustomSeq.push(key);
  playPunch(key);
  renderCustomComboSeq();
}

function clearCustomComboSeq() {
  currentCustomSeq = [];
  renderCustomComboSeq();
}

function renderCustomComboSeq() {
  const container = document.getElementById('customComboSequence');
  if (!container) return;
  if (currentCustomSeq.length === 0) {
    container.innerHTML = `<span style="font-size:12px; color:var(--text-tertiary);">No punches added yet</span>`;
    return;
  }
  container.innerHTML = currentCustomSeq.map((k, i) => {
    const p = PUNCH_DATA[k];
    return `<div class="pchip ${p.chip}" onclick="removePunchFromCustomCombo(${i})" style="cursor:pointer;" title="Tap to remove">${p.label} &times;</div>`;
  }).join('');
}

function removePunchFromCustomCombo(i) {
  currentCustomSeq.splice(i, 1);
  renderCustomComboSeq();
}

function testPlayCustomCombo() {
  if (currentCustomSeq.length === 0) return;
  let delay = 100;
  currentCustomSeq.forEach(p => {
    setTimeout(() => {
      playPunch(p);
    }, delay);
    delay += (PUNCH_DATA[p]?.delay || 500) / comboSpeedMultiplier;
  });
}

function saveCustomCombo() {
  const nameInput = document.getElementById('customComboName');
  const name = nameInput.value.trim() || `Custom Combo (${currentCustomSeq.map(p => PUNCH_DATA[p].label).join('-')})`;
  if (currentCustomSeq.length === 0) {
    alert('Please add at least 1 punch to the combo.');
    return;
  }
  const activeProf = userProfiles.find(p => p.id === activeUserId);
  if (!activeProf.customCombos) activeProf.customCombos = [];
  activeProf.customCombos.push({ name, punches: [...currentCustomSeq] });
  localStorage.setItem('boxingProfiles', JSON.stringify(userProfiles));
  closeCustomComboModal();
  alert(`Combo "${name}" saved and added to workout generator!`);
}

/* ── GAMIFICATION & BADGES ── */
const BADGES = [
  { id: 'first_blood', name: 'First Blood', icon: '🥊', desc: 'Completed first workout', check: (c) => Object.keys(c).length >= 1 },
  { id: 'streak_3', name: '3-Day Streak', icon: '🔥', desc: '3 scheduled days completed', check: (c, s) => s >= 3 },
  { id: 'streak_7', name: 'Iron Will', icon: '⚡', desc: '7-day training streak', check: (c, s) => s >= 7 },
  { id: 'heavy_hitter', name: 'Heavy Hitter', icon: '💥', desc: '2,500 estimated punches', check: (c) => Object.keys(c).length * 150 >= 2500 },
  { id: 'golden_gloves', name: 'Golden Gloves', icon: '👑', desc: '10,000 estimated punches', check: (c) => Object.keys(c).length * 150 >= 10000 },
  { id: 'centurion', name: 'Centurion', icon: '🏆', desc: 'Completed 20 full sessions', check: (c) => Object.keys(c).length >= 20 },
];

function buildBadgesGrid() {
  const grid = document.getElementById('badgesGrid');
  if (!grid) return;
  const count = Object.keys(completed).length;
  grid.innerHTML = BADGES.map(b => {
    const isUnlocked = b.check(completed, count);
    return `
      <div class="badge-card ${isUnlocked ? 'unlocked' : ''}">
        <div class="badge-icon" style="${isUnlocked ? '' : 'filter:grayscale(1); opacity:0.4;'}">${b.icon}</div>
        <div class="badge-name">${T(b.name)}</div>
        <div class="badge-desc">${T(b.desc)}</div>
      </div>
    `;
  }).join('');
}

/* ── DATA BACKUP & PORTABILITY ── */
function exportDataJSON() {
  const exportPayload = {
    app: 'BoxingCoachPRO',
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    profiles: userProfiles,
    activeUserId,
    completedWorkouts: completed,
    programStartDate,
    fitnessLevel: localStorage.getItem('fitnessLevel') || 'intermediate',
    activeProgramId: localStorage.getItem('activeProgramId') || 'classic',
    workoutDays,
    dayOrder
  };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `boxing_coach_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importDataJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.profiles) {
        userProfiles = data.profiles;
        localStorage.setItem('boxingProfiles', JSON.stringify(userProfiles));
      }
      if (data.completedWorkouts) {
        completed = data.completedWorkouts;
      }
      if (data.workoutDays) workoutDays = data.workoutDays;
      if (data.dayOrder) dayOrder = data.dayOrder;
      if (data.programStartDate) {
        programStartDate = data.programStartDate;
        localStorage.setItem('programStartDate', programStartDate);
      }
      alert('Data backup successfully restored!');
      window.location.reload();
    } catch (err) {
      alert('Failed to parse backup file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

/* ── COMBO LOGIC & HELPERS ── */
function getAllowedPunches(exName, exDetail) {
  const text = (exName + ' ' + (exDetail || '')).toLowerCase();
  
  if (text.includes('1-2 basics') || text.includes('round 2')) return ['jab', 'cross'];
  if (text.includes('round 1') || text.includes('rapid jabs')) return ['jab'];
  if (text.includes('1-2-3 combos') || text.includes('round 3')) return ['jab', 'cross', 'lead-hook'];
  if (text.includes('lead hook')) return ['lead-hook'];
  if (text.includes('rear hook')) return ['rear-hook'];
  if (text.includes('lead uppercut')) return ['lead-upper'];
  if (text.includes('rear uppercut')) return ['rear-upper'];
  if (text.includes('slips and rolls')) return ['jab', 'cross', 'slip', 'roll'];
  if (text.includes('body shots') || text.includes('body snatcher')) {
    return ['body-jab', 'body-cross', 'body-lead-hook', 'body-rear-hook', 'lead-hook', 'cross'];
  }
  if (text.includes('defensive') || text.includes('counters') || text.includes('def. counters')) {
    return ['slip', 'roll', 'feint', 'cross', 'lead-hook', 'lead-upper', 'rear-upper'];
  }
  return Object.keys(PUNCH_DATA);
}

function generateNextCombo(ex) {
  const allowed = getAllowedPunches(ex.name, ex.detail);
  const pool = getCombosForLevel().filter(c => c.punches.every(p => allowed.includes(p)));
  if (pool.length > 0) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const randomPunches = [];
  const length = Math.floor(Math.random() * 3) + 2;
  for (let i = 0; i < length; i++) {
    randomPunches.push(allowed[Math.floor(Math.random() * allowed.length)]);
  }
  return {
    name: 'Dynamic Combo',
    punches: randomPunches
  };
}

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

function showView(v) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-bar .tab').forEach(el => el.classList.remove('active'));
  
  const target = document.getElementById('view-' + v);
  if (target) target.classList.add('active');
  
  const mapping = { calendar: 0, timer: 1, trx: 2, technique: 3, settings: 4 };
  const idx = mapping[v];
  if (idx !== undefined) {
    const mainTabs = document.querySelectorAll('.tab-bar .tab');
    if (mainTabs[idx]) mainTabs[idx].classList.add('active');
  }
  
  if (v === 'calendar') buildCalendar();
  if (v === 'timer') { buildTimerTabs(); renderExList(); loadEx(false); }
  if (v === 'trx') buildTrxView();
  if (v === 'technique') buildTechnique();
  if (v === 'settings') { buildSettings(); buildBadgesGrid(); }
}

function buildTechnique() {
  const grid = document.getElementById('techniqueGrid');
  if (!grid) return;
  grid.innerHTML = PUNCH_LIBRARY.map(p => `
    <div class="tech-card">
      <div class="tech-title">
        ${T(p.name)}
        <a href="${p.yt}" target="_blank" class="tech-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
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

function shiftMonth(dir) {
  viewMonth += dir;
  if (viewMonth > 11) { viewMonth = 0; viewYear++; }
  if (viewMonth < 0) { viewMonth = 11; viewYear--; }
  buildCalendar();
}

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
    const focusTxt = wt === 'A' ? T('Power') : wt === 'B' ? T('Speed') : wt === 'C' ? T('Cond.') : wt === 'D' ? T('Ring.') : '';

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
  document.getElementById('sHrs').textContent = (done * 1);
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
        <div class="dp-title">${wt === 'R' ? T('Rest day') : T('Day ' + wt) + ' – ' + T(wt === 'A' ? 'Power' : wt === 'B' ? 'Speed' : wt === 'C' ? 'Cond.' : 'Ringcraft')}</div>
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
    if (wo && wo.exercises) {
      wo.exercises.forEach(ex => {
        const ph = ex.phase;
        if (ph !== 'rest' && ph !== lastPh) { html += `<div class="ph-lbl">${T(PHASE_META[ph].label)}</div>`; lastPh = ph; }
        if (ph === 'rest') return;
        const info = EXERCISE_INFO[ex.name];
        const ytLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' boxing tutorial')}`;
        const rnd = ex.rounds > 1 ? `${ex.rounds}×${fmt(ex.secs)}` : fmt(ex.secs);
        const safeId = ex.name.replace(/\W/g, '');
        html += `<div class="exrow" style="flex-wrap:wrap;cursor:pointer" onclick="toggleInfo(event,'eip_cal_${safeId}')">
          <div class="ephase ${PHASE_META[ph].cls}">${T(PHASE_META[ph].label).slice(0,4)}</div>
          <div style="flex:1;font-size:12px;color:var(--text-primary)">
            ${T(ex.name)}${ex.noBack ? ` <span style="color:#F5A623;font-size:10px;font-weight:700">(${T('Back Care')} ⚠️)</span>` : ''}
            ${ex.detail ? `<div style="font-size:11px;color:var(--text-secondary);font-weight:400">${T(ex.detail)}</div>` : ''}
          </div>
          <div class="edur">${rnd}</div>
          <div class="info-panel" id="eip_cal_${safeId}">${T(info || '')}<br><a href="${ytLink}" target="_blank" style="display:inline-block;margin-top:6px;color:#ffffff;font-weight:700;text-decoration:none;">&#9654; Video Tutorial</a></div>
        </div>`;
      });
    }
    html += `</div>`;
  }

  const detailEl = document.getElementById('calDetail');
  detailEl.innerHTML = html;
  detailEl.style.display = 'block';
  applyTranslations(detailEl);
}

function toggleDone(dk) {
  if (completed[dk]) {
    delete completed[dk];
    if (sbClient) sbClient.from('workouts_completed').delete().match({ profile_id: supabaseProfileId, day_key: dk }).then();
  } else {
    completed[dk] = true;
    if (sbClient) sbClient.from('workouts_completed').insert({ profile_id: supabaseProfileId, day_key: dk }).then();
  }
  buildCalendar();
  const parts = dk.split('-');
  calSelect(dk, parseInt(parts[2]));
  buildBadgesGrid();
}

function launchTimer(day) {
  tActiveDay = day;
  showView('timer');
}

/* ── WORKOUTS & TIMER LOGIC ── */
function buildTimerTabs() {
  const currentWorkouts = getWorkouts();
  const days = ['A', 'B', 'C', 'D'];
  if (currentWorkouts['TRX']) days.push('TRX');

  document.getElementById('dayTabsT').innerHTML = days.map(d => {
    if (!currentWorkouts[d]) return '';
    return `<button class="dt${tActiveDay === d ? ' active' : ''}" onclick="selectTimerDay('${d}')">${T(currentWorkouts[d].label)}</button>`;
  }).join('');

  document.getElementById('hbBegTabs').innerHTML = ['HB_BEG_1', 'HB_BEG_2', 'HB_BEG_3'].map(k => {
    return `<button class="dt${tActiveDay === k ? ' active' : ''}" onclick="selectTimerDay('${k}')">${currentWorkouts[k]?.label || k}</button>`;
  }).join('');

  document.getElementById('hbIntTabs').innerHTML = ['HB_INT_1', 'HB_INT_2', 'HB_INT_3'].map(k => {
    return `<button class="dt${tActiveDay === k ? ' active' : ''}" onclick="selectTimerDay('${k}')">${currentWorkouts[k]?.label || k}</button>`;
  }).join('');

  document.getElementById('hbAdvTabs').innerHTML = ['HB_ADV_1', 'HB_ADV_2', 'HB_ADV_3'].map(k => {
    return `<button class="dt${tActiveDay === k ? ' active' : ''}" onclick="selectTimerDay('${k}')">${currentWorkouts[k]?.label || k}</button>`;
  }).join('');
}

function selectTimerDay(day) {
  stopTimer();
  tActiveDay = day;
  tActiveEx = -1;
  tRound = 1;
  buildTimerTabs();
  renderExList();
  loadEx(false);
}

function renderExList() {
  const wo = getWorkouts()[tActiveDay];
  if (!wo) return;
  document.getElementById('exListT').innerHTML = `
    <div class="ex-list-t">
      ${wo.exercises.map((ex, i) => {
        const info = EXERCISE_INFO[ex.name];
        const ytLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' boxing tutorial')}`;
        const safeId = 'et_info_' + i;
        const dur = ex.rounds > 1 ? `${ex.rounds}×${fmt(ex.secs)}` : fmt(ex.secs);
        return `
          <div class="exrow-t${i === tActiveEx ? ' aex' : ''}" id="et${i}" onclick="jumpToEx(${i})">
            <div class="exdot" style="background:${PHASE_META[ex.phase].color}"></div>
            <div class="exname">${T(ex.name)}</div>
            <div class="exdur2">${dur}</div>
            ${info ? `<button class="info-btn" onclick="toggleInfo(event,'${safeId}')">ℹ</button>` : ''}
            ${info ? `<div class="info-panel" id="${safeId}">${T(info)}<br><a href="${ytLink}" target="_blank" style="display:inline-block;margin-top:4px;color:#fff;font-weight:700;text-decoration:none;">&#9654; Tutorial</a></div>` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

async function loadEx(playAudio = true) {
  const wo = getWorkouts()[tActiveDay];
  if (!wo) return;

  if (tActiveEx < 0 || tActiveEx >= wo.exercises.length) {
    document.getElementById('tcName').textContent = T(wo.label);
    document.getElementById('tcBadge').textContent = T(wo.label);
    document.getElementById('tcBadge').style.background = wo.color;
    document.getElementById('timeBig').textContent = '0:00';
    document.getElementById('ringFg').style.strokeDashoffset = CIRC;
    document.getElementById('rndInfo').textContent = '';
    document.getElementById('comboBox').style.display = 'none';
    document.getElementById('punchReference').style.display = 'none';
    updateNextUp();
    updateProg();
    return;
  }

  const ex = wo.exercises[tActiveEx];
  tRemaining = ex.secs;
  document.getElementById('tcName').textContent = T(ex.name);
  document.getElementById('tcBadge').textContent = T(PHASE_META[ex.phase].label);
  document.getElementById('tcBadge').style.background = PHASE_META[ex.phase].color;
  document.getElementById('timeBig').textContent = fmt(tRemaining);
  document.getElementById('ringFg').style.stroke = PHASE_META[ex.phase].color;
  document.getElementById('ringFg').style.strokeDashoffset = CIRC;
  renderRndInfo(ex);
  updateNextUp();
  updateProg();

  stopCurrentAudio();
  if (playAudio) {
    await playExerciseSound(ex.name);
  }

  if (ex.phase === 'boxing') {
    const allowed = getAllowedPunches(ex.name, ex.detail);
    currentCombo = generateNextCombo(ex);
    renderChips(currentCombo, -1);
    document.getElementById('comboBox').style.display = 'block';
    
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

  comboSeqId = setTimeout(() => {
    if (!tRunning) return;
    const ex = getWorkouts()[tActiveDay].exercises[tActiveEx];
    currentCombo = generateNextCombo(ex);
    renderChips(currentCombo, -1);

    const thisRestMs = getRestDuration();
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

  requestWakeLock();

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
    if (tRemaining === 60)  playTimerSound('1 minute');
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
  buildCalendar();
  buildBadgesGrid();
  
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
  if (!intRunning && !wakeLockManual) releaseWakeLock();
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
    const opts = ['R', 'A', 'B', 'C', 'D'].map(v =>
      `<option value="${v}"${cur === v ? ' selected' : ''}>${v === 'R' ? T('Rest') : T('Day ' + v)}</option>`
    ).join('');
    return `<div class="day-col">
      <div class="day-col-name">${T(dn)}</div>
      <select class="day-sel" id="ds${i}" onchange="previewSchedule()">${opts}</select>
    </div>`;
  }).join('');
  previewSchedule();
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
    D: { bg: '#FAEEDA', c: '#633806' },
    R: { bg: 'var(--bg-secondary)', c: 'var(--text-tertiary)' },
  };
  document.getElementById('weekPreview').innerHTML = DNAMES.map((dn, i) => {
    const v = picks[i]; const s = styles[v] || styles['R'];
    return `<div class="wp-cell" style="background:${s.bg};color:${s.c}">${v === 'R' ? '–' : v}</div>`;
  }).join('');
}

function autoAssignDays(val) {
  const num = parseInt(val);
  if (num === 2) {
    workoutDays = [2, 4]; // Tue, Thu
    dayOrder = ['A', 'B'];
  } else if (num === 4) {
    workoutDays = [1, 2, 4, 5]; // Mon, Tue, Thu, Fri
    dayOrder = ['A', 'B', 'C', 'D'];
  } else {
    workoutDays = [1, 3, 5]; // Mon, Wed, Fri
    dayOrder = ['A', 'B', 'C', 'D'];
  }
  buildSettings();
}

function saveSchedule() {
  const picks = DNAMES.map((_, i) => ({ dow: i, val: (document.getElementById('ds' + i) || {}).value || 'R' }));
  const training = picks.filter(p => p.val !== 'R');
  if (training.length === 0) { alert(T('Pick at least 1 training day.')); return; }
  
  workoutDays = training.map(p => p.dow);
  const assigned = training.map(p => p.val);
  const order = [];
  ['A', 'B', 'C', 'D'].forEach(t => { if (assigned.includes(t)) order.push(t); });
  dayOrder = order.length > 0 ? order : ['A', 'B', 'C', 'D'];
  
  const progVal = document.getElementById('programSelect').value;
  const dateVal = document.getElementById('programStart').value;
  
  localStorage.setItem('activeProgramId', progVal);
  localStorage.setItem('programStartDate', dateVal);
  programStartDate = dateVal;
  
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
buildTrxView();
buildBadgesGrid();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW failed', err));
  });
}
