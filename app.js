/* ==========================================================================
   Boxing Coach Pro — Studio Application Logic (v4.0)
   Home Dashboard | Workouts & Gear Catalog | Fight Arena | Camp | Academy
   ========================================================================== */
(function () {
  'use strict';

  const T_CIRC = 2 * Math.PI * 88;    // Arena timer SVG r=88 -> 552.92
  const MINI_CIRC = 2 * Math.PI * 24; // WHOOP ring SVG r=24 -> 150.80

  const VIEW_TITLES = {
    home: 'Home',
    workouts: 'Workouts',
    arena: 'Arena',
    camp: 'Camp',
    profile: 'Academy & Profile'
  };

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const DAY_SHORT_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const DAY_ORDER_MON = [1, 2, 3, 4, 5, 6, 0];

  // --- UI & Navigation State ---
  let curView = 'home';
  const initNow = new Date();
  let curYear = initNow.getFullYear();
  let curMonth = initNow.getMonth();
  let selectedDayKey = BoxingStorage.dateToDayKey(initNow);

  let activeWorkoutCategory = 'all';
  let activeWorkoutLevel = 'all';
  let filterByMyGear = false;
  let activeTrxPhase = 'pain-relief';
  let activeProfileSubTab = 'academy';
  let activeTechCategory = 'all';
  let activeComboStyle = 'all';
  let profileModalMode = 'add';

  // --- Arena / Live Session Timer State ---
  let tWorkout = null;
  let tExIdx = 0;
  let tRound = 1;
  let tRem = 0;
  let tTotal = 0;
  let tInRest = false;
  let tRunning = false;
  let tInt = null;
  let comboScheduler = null;
  let comboChildTimers = [];
  let reflexMode = false;
  let coachDrawerOpen = false;
  let focusModeActive = false;
  let sessionPunches = 0;
  let roundPunches = 0;
  let sessionElapsedSecs = 0;
  let roundDurationStartSecs = 0;
  let activeBoxingElapsedSecs = 0;
  let currentRoundGoal = 90;
  let currentComboCounted = false;
  let lastSessionLogId = null;
  let selectedRpe = 'solid';
  let currentCornerTip = '';

  // --- Quick Interval Timer State ---
  let qtRunning = false;
  let qtPaused = false;
  let qtPhase = 'prep';
  let qtRem = 0;
  let qtRound = 1;
  let qtTotalRounds = 6;
  let qtWorkSecs = 180;
  let qtRestSecs = 60;
  let qtInt = null;
  let qtComboTimer = null;

  // --- Screen Wake Lock ---
  let wakeLockSentinel = null;
  let wakeLockDesired = false;

  // --- Builders State ---
  let customComboSeq = [];
  let builderBlocks = [];

  // =========================================================================
  // Core Helpers
  // =========================================================================
  function el(id) {
    return document.getElementById(id);
  }

  function tr(key) {
    return typeof window.T === 'function' ? window.T(key) : key;
  }

  function escHtml(val) {
    return String(val == null ? '' : val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fmtTime(secs) {
    const s = Math.max(0, Math.floor(Number(secs) || 0));
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const rem = s % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  }

  function fmtHumanDuration(totalSecs) {
    const mins = Math.max(1, Math.round((Number(totalSecs) || 0) / 60));
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  }

  function showToast(message, type) {
    const container = el('toastContainer');
    if (!container) return;
    const item = document.createElement('div');
    item.className = 'toast-item' + (type === 'warn' ? ' warn' : type === 'err' ? ' err' : '');
    item.textContent = message;
    container.appendChild(item);
    setTimeout(() => {
      if (item.parentNode) item.parentNode.removeChild(item);
    }, 3200);
  }

  function setActiveButtons(pairs) {
    pairs.forEach(([id, isActive]) => {
      const node = el(id);
      if (node) node.classList.toggle('active', !!isActive);
    });
  }

  function gearIconsHtml(gearIds) {
    const list = Array.isArray(gearIds) ? gearIds : [];
    const map = {};
    BoxingWorkouts.EQUIPMENT_CATALOG.forEach(g => { map[g.id] = g; });
    return list.map(id => {
      const g = map[id];
      return g ? `<span class="meta-chip" title="${escHtml(tr(g.label))}">${g.icon} ${escHtml(tr(g.label))}</span>` : '';
    }).join('');
  }

  function getExerciseInfoEntry(ex) {
    if (!ex) return null;
    const dict = BoxingData.EXERCISE_INFO[ex.name];
    if (dict) return dict;
    if (ex.info || ex.warn) {
      return { equip: 'TRX / Body', goal: ex.detail || '', cue: ex.info || '', warn: ex.warn || null };
    }
    return null;
  }

  function buildExerciseInfoHtml(ex) {
    const info = getExerciseInfoEntry(ex);
    if (!info) return '';
    return `
      <div><strong>${escHtml(tr('Equipment'))}:</strong> ${escHtml(tr(info.equip || 'Bodyweight'))}</div>
      ${info.goal ? `<div><strong>${escHtml(tr('Goal'))}:</strong> ${escHtml(tr(info.goal))}</div>` : ''}
      ${info.cue ? `<div><strong>${escHtml(tr('Form Cue'))}:</strong> ${escHtml(tr(info.cue))}</div>` : ''}
      ${info.warn ? `<span class="back-warn">⚠ ${escHtml(tr(info.warn))}</span>` : ''}
    `;
  }

  function resolveWorkoutByAnyId(id, dateObj, profile) {
    if (!id) return null;
    const prof = profile || BoxingStorage.getActiveProfile();
    const dt = dateObj || new Date();
    const dur = prof.sessionDuration || 60;

    if (String(id).startsWith('trx:')) {
      const key = String(id).slice(4);
      const r = BoxingWorkouts.TRX_ROUTINES[key];
      if (!r) return null;
      return {
        id,
        category: 'trx',
        label: r.title,
        subtitle: r.shortLabel,
        focus: r.desc,
        color: r.color || '#00D2B4',
        gearIds: ['trx'],
        exercises: (r.exercises || []).map(e => ({ ...e }))
      };
    }

    const custom = (prof.customWorkouts || []).find(w => w.id === id);
    if (custom) {
      return { ...custom, gearIds: BoxingWorkouts.inferGearIds(custom) };
    }

    const lib = BoxingWorkouts.LIBRARY_WORKOUTS.find(w => w.id === id);
    if (lib) {
      return BoxingWorkouts.scaleWorkoutToDuration(lib, dur);
    }

    return BoxingWorkouts.getWorkoutById(id, dt, prof, dur);
  }

  // =========================================================================
  // Shared Cover Card Renderer (Home Carousels & Workouts Catalog)
  // =========================================================================
  function buildWorkoutCoverCardHtml(rawWo, options) {
    const opts = options || {};
    const stats = BoxingWorkouts.calcWorkoutStats(rawWo);
    const coverUrl = opts.coverOverride || BoxingWorkouts.getWorkoutCover(rawWo);
    const levelLabel = rawWo.level ? tr(rawWo.level[0].toUpperCase() + rawWo.level.slice(1)) : tr('All');
    const isActive = tWorkout && (tWorkout.id === rawWo.id);
    const roundBadge = stats.boxingRounds > 0
      ? `${stats.boxingRounds} ${tr('Rnds')}`
      : `${stats.totalWorkRounds} ${tr('Sets')}`;
    const gearBadges = gearIconsHtml((rawWo.gearIds || BoxingWorkouts.inferGearIds(rawWo)).slice(0, 3));
    const safeId = escHtml(rawWo.id);
    const isCustom = !!opts.isCustom;

    return `
      <div class="cover-card ${isActive ? 'active-wo' : ''}" onclick="launchWorkoutById('${safeId}')">
        <div class="cover-media">
          <img src="${escHtml(coverUrl)}" alt="${escHtml(tr(rawWo.label))}" loading="lazy">
          <div class="cover-badges-top">
            <span class="dpill ${escHtml(rawWo.pill || 'pa')}">${escHtml(levelLabel)}</span>
            <span class="dur-badge-overlay">⏱ ${escHtml(fmtHumanDuration(stats.totalSecs))} · ${escHtml(roundBadge)}</span>
          </div>
        </div>
        <div class="cover-body">
          <div class="cover-title">${escHtml(tr(rawWo.label))}</div>
          <div class="cover-sub">${escHtml(tr(rawWo.subtitle || rawWo.focus || ''))}</div>
          <div class="cover-meta">${gearBadges}</div>
          <div class="cover-foot">
            <button type="button" class="stbtn" onclick="event.stopPropagation(); launchWorkoutById('${safeId}')">▶ ${escHtml(tr('Start'))}</button>
            ${isCustom ? `<button type="button" class="info-btn" title="Delete" onclick="event.stopPropagation(); deleteCustomWorkout('${safeId}')">🗑</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Navigation & Chrome
  // =========================================================================
  function showView(viewName) {
    if (!VIEW_TITLES[viewName]) viewName = 'home';
    curView = viewName;

    document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });
    document.querySelectorAll('.mnav-item[data-view]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });
    document.querySelectorAll('.view').forEach(sec => {
      sec.classList.toggle('active', sec.id === `view-${viewName}`);
    });

    const titleNode = el('topbarViewTitle');
    if (titleNode) titleNode.textContent = tr(VIEW_TITLES[viewName]);

    if (viewName === 'home') renderHomeView();
    else if (viewName === 'workouts') renderWorkoutsView();
    else if (viewName === 'arena') renderArenaView();
    else if (viewName === 'camp') renderCampView();
    else if (viewName === 'profile') renderProfileView();

    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function updateTopbarChrome() {
    const store = BoxingStorage.getStore();
    const prof = BoxingStorage.getActiveProfile();
    const stats = BoxingStorage.getFighterStats(prof);
    const rank = BoxingStorage.getFighterRank(stats);
    const dur = Number(prof.sessionDuration) || 60;

    // Sidebar Rank Card
    const rankCard = el('sidebarRankCard');
    if (rankCard) {
      rankCard.innerHTML = `
        <div class="sr-top">
          <span class="sr-rank">${escHtml(tr(rank.rank))}</span>
          <span class="sr-xp">${rank.xp.toLocaleString()} XP</span>
        </div>
        <div class="sr-bar"><div class="sr-fill" style="width:${rank.pct}%"></div></div>
        <div class="sr-xp">${rank.nextRank ? `${escHtml(tr('Next'))}: ${escHtml(tr(rank.nextRank))} (${rank.nextXp.toLocaleString()} XP)` : escHtml(tr('Max Rank'))}</div>
      `;
    }

    const sub = el('headerCampSub');
    if (sub) {
      const stanceTxt = prof.stance === 'southpaw' ? tr('Southpaw') : tr('Orthodox');
      sub.textContent = `${prof.name} · ${tr(rank.rank)} · ${stanceTxt} · ${dur === 60 ? '1h' : dur === 90 ? '1h 30m' : '2h'}`;
    }

    setActiveButtons([
      ['topDur-60', dur === 60],
      ['topDur-90', dur === 90],
      ['topDur-120', dur === 120],
      ['catDur-60', dur === 60],
      ['catDur-90', dur === 90],
      ['catDur-120', dur === 120],
      ['pref-dur-60', dur === 60],
      ['pref-dur-90', dur === 90],
      ['pref-dur-120', dur === 120]
    ]);

    const stanceBtn = el('stanceToggleBtn');
    const stanceTxtNode = el('stanceToggleText');
    if (stanceBtn) stanceBtn.classList.toggle('southpaw', prof.stance === 'southpaw');
    if (stanceTxtNode) stanceTxtNode.textContent = tr(prof.stance === 'southpaw' ? 'Southpaw' : 'Orthodox');

    const langSel = el('langSelect');
    if (langSel) langSel.value = store.lang || 'en';

    const userSel = el('userSelect');
    if (userSel) {
      const opts = (store.profiles || []).map(p =>
        `<option value="${escHtml(p.id)}" ${p.id === store.activeUserId ? 'selected' : ''}>${escHtml(p.name)}</option>`
      );
      opts.push(`<option value="__new__">+ ${escHtml(tr('New Fighter Profile'))}</option>`);
      opts.push(`<option value="__rename__">✎ ${escHtml(tr('Rename Active'))}</option>`);
      userSel.innerHTML = opts.join('');
    }

    const am = prof.audioMode || 'both';
    setActiveButtons([
      ['am-both', am === 'both'],
      ['am-sfx', am === 'sfx'],
      ['am-voice', am === 'voice'],
      ['am-silent', am === 'silent']
    ]);

    const csBtn = el('calloutStyleBtn');
    const csVal = el('calloutStyleVal');
    if (csVal) csVal.textContent = prof.calloutStyle === 'numbers' ? tr('1-2-3 Numbers') : tr('Names');
    if (csBtn) csBtn.classList.toggle('active', prof.calloutStyle === 'numbers');

    const aaBtn = el('autoAdvanceBtn');
    const aaVal = el('autoAdvanceVal');
    const aaOn = prof.autoAdvance !== false;
    if (aaVal) aaVal.textContent = aaOn ? 'ON' : 'OFF';
    if (aaBtn) aaBtn.classList.toggle('active', aaOn);

    const rfBtn = el('reflexModeBtn');
    const rfVal = el('reflexModeVal');
    if (rfVal) rfVal.textContent = reflexMode ? 'ON' : 'OFF';
    if (rfBtn) rfBtn.classList.toggle('active', reflexMode);
  }

  function setSessionDuration(mins) {
    const valid = [60, 90, 120].includes(Number(mins)) ? Number(mins) : 60;
    BoxingStorage.updateActiveProfile({ sessionDuration: valid });
    updateTopbarChrome();
    if (curView === 'home') renderHomeView();
    else if (curView === 'workouts') renderWorkoutsView();
    else if (curView === 'camp') renderCampView();
    else if (curView === 'profile') renderProfileView();
    showToast(`${tr('Session Duration')}: ${valid === 60 ? '1h' : valid === 90 ? '1h 30m' : '2h'}`);
  }

  function toggleStanceQuick() {
    const prof = BoxingStorage.getActiveProfile();
    const next = prof.stance === 'southpaw' ? 'orthodox' : 'southpaw';
    BoxingStorage.updateActiveProfile({ stance: next });
    updateTopbarChrome();
    if (curView === 'arena') renderArenaView();
    if (curView === 'profile') renderProfileView();
    showToast(`${tr('Preferred Stance')}: ${tr(next === 'southpaw' ? 'Southpaw' : 'Orthodox')}`);
  }

  function changeLanguage(lang) {
    const store = BoxingStorage.getStore();
    store.lang = lang === 'pt-PT' ? 'pt-PT' : 'en';
    BoxingStorage.saveStore(store);
    if (typeof window.applyTranslations === 'function') window.applyTranslations();
    updateTopbarChrome();
    showView(curView);
  }

  function handleUserSelect(val) {
    if (val === '__new__') {
      openProfileModal('add');
      return;
    }
    if (val === '__rename__') {
      openProfileModal('rename');
      return;
    }
    BoxingStorage.switchProfile(val);
    updateTopbarChrome();
    showView(curView);
    const prof = BoxingStorage.getActiveProfile();
    showToast(`${tr('Profile')}: ${prof.name}`);
  }

  // =========================================================================
  // Wake Lock
  // =========================================================================
  async function requestWakeLock() {
    if (!('navigator' in window) || !('wakeLock' in navigator)) return false;
    try {
      wakeLockSentinel = await navigator.wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
        updateWakeLockUI();
      });
      updateWakeLockUI();
      return true;
    } catch (_) {
      updateWakeLockUI();
      return false;
    }
  }

  function updateWakeLockUI() {
    const btn = el('wakeLockBtn');
    const isOn = !!wakeLockSentinel;
    if (btn) btn.classList.toggle('active', isOn);
  }

  async function toggleWakeLock() {
    if (wakeLockSentinel) {
      wakeLockDesired = false;
      try { await wakeLockSentinel.release(); } catch (_) {}
      wakeLockSentinel = null;
      updateWakeLockUI();
      showToast(`${tr('Screen Awake')}: OFF`);
    } else {
      wakeLockDesired = true;
      const ok = await requestWakeLock();
      showToast(ok ? `${tr('Screen Awake')}: ON` : tr('Screen Wake Lock unavailable'));
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && wakeLockDesired && !wakeLockSentinel) {
      requestWakeLock();
    }
  });

  // =========================================================================
  // VIEW 1: Home Dashboard
  // =========================================================================
  function buildWhoopRingCardHtml(color, pct, innerText, label, val, sub) {
    const clamped = Math.max(0, Math.min(100, Math.round(pct)));
    const offset = MINI_CIRC - (MINI_CIRC * clamped / 100);
    return `
      <div class="ring-card">
        <div class="mini-ring-wrap">
          <svg class="mini-ring-svg" width="58" height="58" viewBox="0 0 58 58">
            <circle class="mini-ring-bg" cx="29" cy="29" r="24"/>
            <circle class="mini-ring-fg" cx="29" cy="29" r="24"
              stroke="${escHtml(color)}"
              stroke-dasharray="${MINI_CIRC.toFixed(2)}"
              stroke-dashoffset="${offset.toFixed(2)}"/>
          </svg>
          <div class="mini-ring-pct">${escHtml(innerText)}</div>
        </div>
        <div>
          <div class="rc-lbl">${escHtml(label)}</div>
          <div class="rc-val">${escHtml(val)}</div>
          <div class="rc-sub">${escHtml(sub)}</div>
        </div>
      </div>
    `;
  }

  function renderHomeView() {
    const prof = BoxingStorage.getActiveProfile();
    const today = new Date();
    const todayDk = BoxingStorage.dateToDayKey(today);
    const dur = prof.sessionDuration || 60;
    const weekNum = BoxingWorkouts.getWeekOfProgram(today, prof.programStartDate);
    const code = BoxingStorage.getAssignedWorkoutCode(prof, today);
    const scaledDays = BoxingWorkouts.getScaledWorkoutsForDateRange(today, prof, dur);

    // Choose today's workout or featured 4-station camp on Rest Day
    const featuredHomeCampId = dur === 120 ? 'camp_home_120' : dur === 90 ? 'camp_home_90' : 'camp_home_60';
    const isRest = code === 'R' || !scaledDays[code];
    const heroWo = isRest
      ? BoxingWorkouts.getWorkoutById(featuredHomeCampId, today, prof, dur)
      : scaledDays[code];
    const heroStats = BoxingWorkouts.calcWorkoutStats(heroWo);
    const heroCover = BoxingWorkouts.getWorkoutCover(heroWo);
    const isDoneToday = !!(prof.completed && prof.completed[todayDk]);

    const heroEl = el('todayCampHero');
    if (heroEl) {
      const eyebrowTxt = isRest
        ? `${tr('Recovery Day')} · ${tr('Week')} ${weekNum}`
        : `${tr("Today's Fight Camp")} · ${tr('Week')} ${weekNum} · ${tr(prof.fitnessLevel[0].toUpperCase() + prof.fitnessLevel.slice(1))}`;
      const launchId = isRest ? featuredHomeCampId : `day:${todayDk}`;
      const estKcal = BoxingStorage.estimateSessionKcal(heroStats.totalSecs, heroWo.category || 'camp');

      heroEl.innerHTML = `
        <img class="hero-bg-img" src="${escHtml(heroCover)}" alt="${escHtml(tr(heroWo.label))}">
        <div class="hero-scrim"></div>
        <div class="hero-content">
          <div class="hero-left">
            <div class="hero-eyebrow">⚡ ${escHtml(eyebrowTxt)}</div>
            <h2 class="hero-title">${escHtml(tr(heroWo.label))}</h2>
            <div class="hero-sub">${escHtml(tr(heroWo.subtitle || heroWo.focus || ''))}</div>
            <div class="hero-chips">
              <span class="meta-chip accent">⏱ ${escHtml(fmtHumanDuration(heroStats.totalSecs))}</span>
              <span class="meta-chip">🥊 ${heroStats.boxingRounds} ${escHtml(tr('Rnds'))}</span>
              <span class="meta-chip">🔥 ~${estKcal} ${escHtml(tr('kcal'))}</span>
              ${gearIconsHtml((heroWo.gearIds || BoxingWorkouts.inferGearIds(heroWo)).slice(0, 4))}
            </div>
          </div>
          <div class="hero-right">
            <div class="hero-cta-row">
              <button type="button" class="stbtn" onclick="launchWorkoutById('${escHtml(launchId)}')">▶ ${escHtml(tr('Start Camp'))}</button>
              <button type="button" class="mkbtn ${isDoneToday ? 'done' : ''}" onclick="toggleTodayCompleted('${escHtml(todayDk)}')">
                ${isDoneToday ? `✓ ${escHtml(tr('Completed'))}` : `○ ${escHtml(tr('Mark Done'))}`}
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // WHOOP Telemetry Rings
    const stats = BoxingStorage.getFighterStats(prof);
    const rank = BoxingStorage.getFighterRank(stats);
    const weekly = BoxingStorage.getWeeklyGoalProgress(prof);
    const stripEl = el('whoopTelemetryStrip');
    if (stripEl) {
      const streakPct = Math.min(100, Math.round((stats.currentStreak / 7) * 100));
      const punchPct = Math.min(100, Math.round((stats.totalPunches / 10000) * 100));
      stripEl.innerHTML = [
        buildWhoopRingCardHtml(
          '#C8FF00',
          weekly.pct,
          `${weekly.doneThisWeek}/${weekly.target}`,
          tr('Weekly Goal'),
          `${weekly.pct}%`,
          `${weekly.doneThisWeek} ${tr('of')} ${weekly.target} ${tr('Sessions')}`
        ),
        buildWhoopRingCardHtml(
          '#3B82F6',
          rank.pct,
          `${rank.pct}%`,
          tr('Fighter Rank'),
          tr(rank.rank),
          `${rank.xp.toLocaleString()} XP`
        ),
        buildWhoopRingCardHtml(
          '#FFB020',
          streakPct,
          `${stats.currentStreak}`,
          tr('Streak'),
          `${stats.currentStreak}d`,
          `${tr('Best')}: ${stats.bestStreak}d`
        ),
        buildWhoopRingCardHtml(
          '#00E5C0',
          punchPct,
          `${stats.totalSessions}`,
          tr('Punches'),
          stats.totalPunches.toLocaleString(),
          `${stats.totalHours}h ${tr('Hours')}`
        )
      ].join('');
    }

    // 4 Horizontal Cover-Art Carousels
    const carouselsEl = el('homeCarousels');
    if (carouselsEl) {
      const allScaledLib = BoxingWorkouts.LIBRARY_WORKOUTS.map(w => BoxingWorkouts.scaleWorkoutToDuration(w, dur));
      const fullCamps = allScaledLib.filter(w => w.category === 'full_camp');
      const bagAndShadow = allScaledLib.filter(w => w.category === 'heavy_bag' || w.category === 'shadowboxing');
      const machineCardio = allScaledLib.filter(w => w.category === 'gym_machine' || w.category === 'cardio_rope' || w.category === 'conditioning');
      const trxCards = Object.values(BoxingWorkouts.TRX_ROUTINES).map(r => ({
        id: `trx:${r.key}`,
        category: 'trx',
        level: r.key === 'pain-relief' ? 'beginner' : r.key === 'foundation' ? 'intermediate' : 'advanced',
        label: r.title,
        subtitle: r.desc,
        pill: 'ptrx',
        color: r.color || '#00D2B4',
        gearIds: ['trx'],
        exercises: r.exercises
      }));

      const sections = [
        { title: tr('Featured 4-Station Camps'), cat: 'full_camp', items: fullCamps },
        { title: tr('Heavy Bag & Shadowboxing'), cat: 'heavy_bag', items: bagAndShadow },
        { title: tr('Multi-Gym, Treadmill & Rope'), cat: 'gym_machine', items: machineCardio },
        { title: tr('TRX Core & Back Health'), cat: 'trx', items: trxCards }
      ];

      carouselsEl.innerHTML = sections.map(sec => `
        <section>
          <div class="carousel-head">
            <h3 class="carousel-title">${escHtml(sec.title)}</h3>
            <button type="button" class="browse-link-btn" onclick="openCategoryFromHome('${escHtml(sec.cat)}')">${escHtml(tr('Browse All'))} →</button>
          </div>
          <div class="carousel-track">
            ${sec.items.map(w => buildWorkoutCoverCardHtml(w)).join('')}
          </div>
        </section>
      `).join('');
    }
  }

  function openCategoryFromHome(cat) {
    activeWorkoutCategory = cat;
    showView('workouts');
  }

  function toggleTodayCompleted(dk) {
    BoxingStorage.toggleDayCompleted(dk);
    renderHomeView();
    if (curView === 'camp') renderCampView();
    updateTopbarChrome();
  }

  // =========================================================================
  // VIEW 2: Workouts Catalog & TRX Spine/Core Protocols
  // =========================================================================
  function toggleGearFilter() {
    filterByMyGear = !filterByMyGear;
    renderWorkoutsView();
  }

  function setWorkoutCategory(cat) {
    activeWorkoutCategory = cat;
    renderWorkoutsView();
  }

  function setWorkoutLevel(lvl) {
    activeWorkoutLevel = lvl;
    renderWorkoutsView();
  }

  function selectTrxPhase(phaseKey) {
    activeTrxPhase = phaseKey;
    renderTrxCatalogSection();
  }

  function renderWorkoutsView() {
    const prof = BoxingStorage.getActiveProfile();
    const dur = prof.sessionDuration || 60;
    const myGear = new Set(prof.equipment || []);

    const gfBtn = el('gearFilterBtn');
    const gfVal = el('gearFilterVal');
    if (gfBtn) gfBtn.classList.toggle('active', filterByMyGear);
    if (gfVal) gfVal.textContent = filterByMyGear ? tr('My Home Gear Only') : tr('All Gear');

    const cats = [
      { id: 'all', label: tr('All') },
      { id: 'full_camp', label: tr('4-Station Camps') },
      { id: 'heavy_bag', label: tr('Heavy Bag') },
      { id: 'shadowboxing', label: tr('Shadowboxing') },
      { id: 'gym_machine', label: tr('Multi-Gym') },
      { id: 'cardio_rope', label: tr('Treadmill & Rope') },
      { id: 'conditioning', label: tr('Conditioning') },
      { id: 'trx', label: 'TRX' },
      { id: 'custom', label: tr('My Custom') }
    ];
    const catTabs = el('workoutCatTabs');
    if (catTabs) {
      catTabs.innerHTML = cats.map(c =>
        `<button type="button" class="fpill ${activeWorkoutCategory === c.id ? 'active' : ''}" onclick="setWorkoutCategory('${c.id}')">${escHtml(c.label)}</button>`
      ).join('');
    }

    const trxSec = el('trxCatalogSection');
    const lvlTabs = el('workoutLevelTabs');
    const grid = el('workoutBrowserGrid');

    if (activeWorkoutCategory === 'trx') {
      if (lvlTabs) lvlTabs.style.display = 'none';
      if (grid) grid.style.display = 'none';
      if (trxSec) trxSec.style.display = 'block';
      renderTrxCatalogSection();
      return;
    }

    if (trxSec) trxSec.style.display = 'none';
    if (lvlTabs) lvlTabs.style.display = 'flex';
    if (grid) grid.style.display = 'grid';

    const lvls = [
      { id: 'all', label: tr('All Levels') },
      { id: 'beginner', label: tr('Beginner') },
      { id: 'intermediate', label: tr('Intermediate') },
      { id: 'advanced', label: tr('Advanced') }
    ];
    if (lvlTabs) {
      lvlTabs.innerHTML = lvls.map(l =>
        `<button type="button" class="fpill ${activeWorkoutLevel === l.id ? 'active' : ''}" onclick="setWorkoutLevel('${l.id}')">${escHtml(l.label)}</button>`
      ).join('');
    }

    // Build filtered workout list
    const scaledLib = BoxingWorkouts.LIBRARY_WORKOUTS.map(w => BoxingWorkouts.scaleWorkoutToDuration(w, dur));
    const customs = (prof.customWorkouts || []).map(w => ({ ...w, category: 'custom', isCustom: true, gearIds: BoxingWorkouts.inferGearIds(w) }));
    const combined = activeWorkoutCategory === 'custom' ? customs : [...scaledLib, ...customs];

    const filtered = combined.filter(wo => {
      if (activeWorkoutCategory !== 'all' && activeWorkoutCategory !== 'custom' && wo.category !== activeWorkoutCategory) return false;
      if (activeWorkoutCategory === 'custom' && !wo.isCustom) return false;
      if (activeWorkoutLevel !== 'all' && wo.level && wo.level !== activeWorkoutLevel) return false;
      if (filterByMyGear) {
        const req = wo.gearIds || BoxingWorkouts.inferGearIds(wo);
        if (req.some(g => !myGear.has(g))) return false;
      }
      return true;
    });

    if (grid) {
      if (!filtered.length) {
        grid.innerHTML = `<div class="settings-block" style="grid-column:1/-1;text-align:center;color:var(--text-secondary)">${escHtml(tr('No workouts match the selected filters. Try enabling more home gear or changing level.'))}</div>`;
      } else {
        grid.innerHTML = filtered.map(wo => buildWorkoutCoverCardHtml(wo, { isCustom: !!wo.isCustom })).join('');
      }
    }
  }

  function renderTrxCatalogSection() {
    const routines = BoxingWorkouts.TRX_ROUTINES;
    const phaseKeys = Object.keys(routines);
    if (!routines[activeTrxPhase]) activeTrxPhase = phaseKeys[0];
    const r = routines[activeTrxPhase];

    const tabs = el('trxPhaseTabs');
    if (tabs) {
      tabs.innerHTML = phaseKeys.map(k => {
        const item = routines[k];
        return `<button type="button" class="trx-ltab ${k === activeTrxPhase ? 'active' : ''}" onclick="selectTrxPhase('${escHtml(k)}')">${escHtml(tr(item.shortLabel || item.title))}</button>`;
      }).join('');
    }

    const stats = BoxingWorkouts.calcWorkoutStats(r);
    if (el('trxLevelTitle')) el('trxLevelTitle').textContent = tr(r.title);
    if (el('trxLevelDesc')) el('trxLevelDesc').textContent = tr(r.desc || '');
    if (el('trxLevelMeta')) {
      el('trxLevelMeta').innerHTML = `
        <span class="meta-chip accent">⏱ ${escHtml(fmtHumanDuration(stats.totalSecs))}</span>
        <span class="meta-chip">🎗️ ${r.exercises.length} ${escHtml(tr('Exercises'))}</span>
      `;
    }

    const listEl = el('trxExercisesList');
    if (listEl) {
      listEl.innerHTML = r.exercises.map((ex, i) => {
        const pm = BoxingWorkouts.PHASE_META[ex.phase] || BoxingWorkouts.PHASE_META.core;
        const rowId = `trx-info-${activeTrxPhase}-${i}`;
        return `
          <div class="exrow">
            <span class="ephase ${escHtml(pm.cls)}">${escHtml(tr(pm.label))}</span>
            <div class="exname">
              ${escHtml(tr(ex.name))}
              <div class="ex-subline">${escHtml(tr(ex.detail || ''))} ${ex.sets ? `· <strong>${escHtml(ex.sets)}</strong>` : ''}</div>
            </div>
            <span class="edur">${escHtml(fmtTime(ex.secs))} × ${ex.rounds || 1}</span>
            <button type="button" class="info-btn" onclick="toggleInfo('${escHtml(rowId)}')">ℹ</button>
            <div class="info-panel" id="${escHtml(rowId)}">${buildExerciseInfoHtml(ex)}</div>
          </div>
        `;
      }).join('');
    }
  }

  function startTrxWorkout() {
    launchWorkoutById(`trx:${activeTrxPhase}`);
  }

  function toggleInfo(domId) {
    const node = el(domId);
    if (!node) return;
    node.style.display = node.style.display === 'block' ? 'none' : 'block';
  }

  // =========================================================================
  // VIEW 3: Fight Arena (Timer, Combos, Reflex Mode, SVG HUD, Focus Mode)
  // =========================================================================
  function clearArenaTimers() {
    if (tInt) {
      clearInterval(tInt);
      tInt = null;
    }
    if (comboScheduler) {
      clearTimeout(comboScheduler);
      comboScheduler = null;
    }
    comboChildTimers.forEach(id => clearTimeout(id));
    comboChildTimers = [];
  }

  function resetArenaStrikeVisuals() {
    document.querySelectorAll('#targetSvgMain .zone-hit, #targetSvgFocus .zone-hit').forEach(n => n.classList.remove('zone-hit'));
    document.querySelectorAll('#targetSvgMain .def-hit, #targetSvgFocus .def-hit').forEach(n => n.classList.remove('def-hit'));
    const readout = el('targetZoneReadout');
    if (readout) readout.textContent = tr('Ready');
  }

  function highlightStrikeZone(punchKey) {
    const prof = BoxingStorage.getActiveProfile();
    const meta = BoxingData.getPunchMeta(punchKey);
    if (!meta) return;

    resetArenaStrikeVisuals();
    const zone = BoxingData.getStanceTargetSide(meta.targetZone, prof.stance || 'orthodox');
    const cls = zone.startsWith('def-') ? 'def-hit' : 'zone-hit';

    const mainNode = el(`zone-${zone}`);
    const focusNode = el(`fm-zone-${zone}`);
    if (mainNode) mainNode.classList.add(cls);
    if (focusNode) focusNode.classList.add(cls);

    const readout = el('targetZoneReadout');
    if (readout) {
      readout.textContent = BoxingData.getPunchDisplayLabel(meta.key, prof.calloutStyle, prof.stance);
    }
  }

  function computeRoundPunchGoal(secs) {
    return Math.max(20, Math.round((secs / 180) * 100));
  }

  function launchWorkoutById(id) {
    const prof = BoxingStorage.getActiveProfile();
    let wo = null;
    let optDayKey = null;

    if (String(id).startsWith('day:')) {
      optDayKey = String(id).slice(4);
      const dt = BoxingStorage.parseDayKey(optDayKey) || new Date();
      const scaled = BoxingWorkouts.getScaledWorkoutsForDateRange(dt, prof, prof.sessionDuration || 60);
      const code = BoxingStorage.getAssignedWorkoutCode(prof, dt);
      wo = scaled[code] || scaled.A;
    } else {
      wo = resolveWorkoutByAnyId(id, new Date(), prof);
    }

    if (!wo || !Array.isArray(wo.exercises) || !wo.exercises.length) {
      showToast(tr('Workout not found'), 'err');
      return;
    }

    loadWorkoutIntoArena(wo, optDayKey);
    showView('arena');
  }

  function loadWorkoutIntoArena(wo, optDayKey) {
    clearArenaTimers();
    BoxingAudio.stopCurrentAudio();

    tRunning = false;
    tInRest = false;
    tExIdx = 0;
    tRound = 1;
    sessionPunches = 0;
    roundPunches = 0;
    sessionElapsedSecs = 0;
    activeBoxingElapsedSecs = 0;
    lastSessionLogId = null;

    tWorkout = {
      ...wo,
      title: wo.title || wo.label || 'Boxing Session',
      dayKey: optDayKey || BoxingStorage.dateToDayKey(new Date())
    };

    const doneCard = el('sessionCompleteCard');
    if (doneCard) doneCard.style.display = 'none';
    const cornerEl = el('cornerRestOverlay');
    if (cornerEl) cornerEl.style.display = 'none';

    loadCurrentExerciseIntoClock(true);
    renderArenaView();
  }

  function loadCurrentExerciseIntoClock(resetRound) {
    if (!tWorkout || !tWorkout.exercises[tExIdx]) return;
    const ex = tWorkout.exercises[tExIdx];
    if (resetRound) {
      tRound = 1;
      tInRest = false;
    }
    tTotal = Math.max(5, Number(ex.secs) || 60);
    tRem = tTotal;
    roundDurationStartSecs = tTotal;
    roundPunches = 0;
    currentRoundGoal = computeRoundPunchGoal(tTotal);
    currentComboCounted = false;
    resetArenaStrikeVisuals();
    if (el('comboName')) el('comboName').textContent = tr(ex.name);
    if (el('comboCue')) el('comboCue').textContent = tr(ex.detail || '');
    if (el('callout')) el('callout').textContent = '—';
    if (el('comboChips')) el('comboChips').innerHTML = '';
    if (el('fmComboName')) el('fmComboName').textContent = tr(ex.name);
    if (el('fmCallout')) el('fmCallout').textContent = '—';
    if (el('fmComboChips')) el('fmComboChips').innerHTML = '';
  }

  function renderArenaView() {
    if (!tWorkout) {
      // Load today's workout automatically so Arena is never dead
      const prof = BoxingStorage.getActiveProfile();
      const dur = prof.sessionDuration || 60;
      const fallbackId = dur === 120 ? 'camp_home_120' : dur === 90 ? 'camp_home_90' : 'camp_home_60';
      const defaultWo = resolveWorkoutByAnyId(fallbackId, new Date(), prof);
      if (defaultWo) {
        tWorkout = { ...defaultWo, title: defaultWo.label, dayKey: BoxingStorage.dateToDayKey(new Date()) };
        loadCurrentExerciseIntoClock(true);
      }
    }

    updateTopbarChrome();
    renderArenaSegments();
    renderArenaStage();
    renderArenaExerciseList();
    renderCoachDrawerControls();
    renderPunchReference();
    if (focusModeActive) syncFocusModeUI();
  }

  function renderArenaSegments() {
    const segWrap = el('arenaSegments');
    if (!tWorkout || !segWrap) return;

    const exs = tWorkout.exercises || [];
    const total = exs.length;
    const pct = total > 0 ? Math.min(100, Math.round(((tExIdx + (tInRest ? 0.5 : 0)) / total) * 100)) : 0;
    if (el('tcWorkoutTitle')) el('tcWorkoutTitle').textContent = tr(tWorkout.title || tWorkout.label || 'Boxing');
    if (el('progPct')) el('progPct').textContent = `${pct}%`;

    segWrap.innerHTML = exs.map((ex, i) => {
      const pm = BoxingWorkouts.PHASE_META[ex.phase] || BoxingWorkouts.PHASE_META.boxing;
      const cls = i < tExIdx ? 'done' : i === tExIdx ? 'active' : '';
      return `<div class="seg-bar ${cls}" style="color:${escHtml(pm.color)};background:${i <= tExIdx ? escHtml(pm.color) : 'rgba(255,255,255,0.12)'}" title="${escHtml(tr(ex.name))}" onclick="jumpToEx(${i})"></div>`;
    }).join('');
  }

  function renderArenaStage() {
    if (!tWorkout || !tWorkout.exercises[tExIdx]) return;
    const ex = tWorkout.exercises[tExIdx];
    const pm = BoxingWorkouts.PHASE_META[ex.phase] || BoxingWorkouts.PHASE_META.boxing;
    const isRestState = tInRest || ex.phase === 'rest';
    const totalR = ex.rounds || 1;

    const card = el('timerCard');
    if (card) {
      card.classList.toggle('state-running', tRunning && !isRestState);
      card.classList.toggle('state-rest', isRestState);
      card.classList.toggle('state-warning', tRunning && tRem <= 3 && tRem > 0);
    }

    if (el('arenaRoundBadge')) {
      el('arenaRoundBadge').textContent = `${tr('Exercise')} ${tExIdx + 1}/${tWorkout.exercises.length}`;
    }
    if (el('tcName')) {
      el('tcName').textContent = tInRest ? tr('Corner Rest') : tr(ex.name);
    }
    const badge = el('tcBadge');
    if (badge) {
      badge.className = `tc-badge ephase ${isRestState ? 'eph-rest' : pm.cls}`;
      badge.textContent = isRestState ? tr('Rest') : tr(pm.label);
    }

    // Ring SVG progress
    const ring = el('ringFg');
    if (ring) {
      const ratio = tTotal > 0 ? Math.max(0, Math.min(1, tRem / tTotal)) : 0;
      ring.style.strokeDasharray = T_CIRC.toFixed(2);
      ring.style.strokeDashoffset = (T_CIRC * (1 - ratio)).toFixed(2);
      ring.style.stroke = isRestState ? '#94A3B8' : (tRunning && tRem <= 3 ? '#FFB020' : pm.color);
    }

    if (el('timeBig')) el('timeBig').textContent = fmtTime(tRem);
    if (el('ringRoundSub')) {
      el('ringRoundSub').textContent = isRestState ? tr('Recover') : `${tr('Round')} ${tRound}/${totalR}`;
    }
    if (el('rndInfo')) {
      el('rndInfo').textContent = tr(ex.detail || '');
    }

    // Live Context-Aware Telemetry Bar
    const isBoxingWork = ex.phase === 'boxing' && !isRestState;
    const goalLbl = el('arenaGoalLbl');
    const goalVal = el('arenaGoalVal');
    let fillPct = 0;

    if (isBoxingWork) {
      if (goalLbl) goalLbl.textContent = tr('Round Punch Target');
      if (goalVal) goalVal.innerHTML = `<strong id="roundPunchCount">${roundPunches}</strong> / <span id="roundPunchGoal">${currentRoundGoal}</span> 🥊`;
      fillPct = Math.min(100, Math.round((roundPunches / Math.max(1, currentRoundGoal)) * 100));
    } else {
      const elapsedInBlock = Math.max(0, tTotal - tRem);
      if (goalLbl) goalLbl.textContent = tr(isRestState ? 'Recovery Progress' : 'Station Progress');
      if (goalVal) goalVal.innerHTML = `<strong id="roundPunchCount">${fmtTime(elapsedInBlock)}</strong> / <span id="roundPunchGoal">${fmtTime(tTotal)}</span>`;
      fillPct = tTotal > 0 ? Math.min(100, Math.round((elapsedInBlock / tTotal) * 100)) : 0;
    }
    if (el('roundOutputFill')) el('roundOutputFill').style.width = `${fillPct}%`;

    const activeMins = activeBoxingElapsedSecs > 5 ? activeBoxingElapsedSecs / 60 : sessionElapsedSecs / 60;
    const ppm = activeMins > 0.08 ? Math.round(sessionPunches / activeMins) : 0;
    const kcal = BoxingStorage.estimateSessionKcal(sessionElapsedSecs, tWorkout.category || 'boxing');
    if (el('arenaPpmVal')) el('arenaPpmVal').textContent = String(ppm);
    if (el('arenaKcalVal')) el('arenaKcalVal').textContent = String(kcal);

    // Show/hide Boxing Target HUD & Combo Box & Strike Audio Strip cleanly
    if (el('targetHudWrap')) el('targetHudWrap').style.display = isBoxingWork ? 'flex' : 'none';
    if (el('comboBox')) el('comboBox').style.display = isBoxingWork ? 'block' : 'none';
    if (el('punchReference')) el('punchReference').style.display = ex.phase === 'boxing' ? 'block' : 'none';

    // Corner rest overlay
    const cornerEl = el('cornerRestOverlay');
    if (cornerEl) {
      if (isRestState) {
        cornerEl.style.display = 'block';
        const nextTitle = getUpcomingStepLabel();
        if (el('cornerRestNext')) el('cornerRestNext').textContent = `${tr('Next')}: ${nextTitle}`;
        if (!currentCornerTip) {
          currentCornerTip = BoxingData.CORNER_TIPS[Math.floor(Math.random() * BoxingData.CORNER_TIPS.length)];
        }
        if (el('cornerTipText')) el('cornerTipText').textContent = tr(currentCornerTip);
        if (el('restRoundPunches')) {
          el('restRoundPunches').textContent = `${roundPunches} ${tr('punches')} · ${sessionPunches} ${tr('total')}`;
        }
      } else {
        cornerEl.style.display = 'none';
        currentCornerTip = '';
      }
    }

    // Primary Start / Pause button & Next-Up preview
    const sb = el('startBtn');
    if (sb) sb.textContent = tRunning ? `⏸ ${tr('Pause')}` : (tRem < tTotal ? `▶ ${tr('Resume')}` : `▶ ${tr('Start')}`);
    if (el('nextUp')) el('nextUp').textContent = `${tr('Next')}: ${getUpcomingStepLabel()}`;
  }

  function getUpcomingStepLabel() {
    if (!tWorkout || !tWorkout.exercises) return '—';
    const ex = tWorkout.exercises[tExIdx];
    if (!ex) return tr('Finish');
    const rounds = ex.rounds || 1;
    if (tInRest && tRound < rounds) {
      return `${tr(ex.name)} (${tr('Round')} ${tRound + 1}/${rounds})`;
    }
    const nxt = tWorkout.exercises[tExIdx + 1];
    return nxt ? tr(nxt.name) : tr('Session Complete');
  }

  function renderArenaExerciseList() {
    const list = el('exListT');
    if (!list || !tWorkout) return;

    list.innerHTML = (tWorkout.exercises || []).map((ex, i) => {
      const pm = BoxingWorkouts.PHASE_META[ex.phase] || BoxingWorkouts.PHASE_META.boxing;
      const isCur = i === tExIdx;
      const infoId = `arena-ex-info-${i}`;
      const infoHtml = buildExerciseInfoHtml(ex);
      const hasInfo = !!infoHtml;
      return `
        <div class="exrow-t ${isCur ? 'aex' : ''}" onclick="jumpToEx(${i})">
          <span class="exdot" style="background:${escHtml(pm.color)}"></span>
          <div class="exname">
            ${escHtml(tr(ex.name))}
            <div class="ex-subline">${escHtml(tr(ex.detail || ''))}</div>
          </div>
          <span class="exdur2">${escHtml(fmtTime(ex.secs))} × ${ex.rounds || 1}</span>
          ${hasInfo ? `<button type="button" class="info-btn" onclick="event.stopPropagation(); toggleInfo('${infoId}')">ℹ</button>` : ''}
          ${hasInfo ? `<div class="info-panel" id="${infoId}">${infoHtml}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  function renderCoachDrawerControls() {
    const prof = BoxingStorage.getActiveProfile();
    const drawer = el('coachDrawer');
    if (drawer) drawer.style.display = coachDrawerOpen ? 'block' : 'none';

    if (el('speedSlider')) el('speedSlider').value = String(prof.comboSpeed || 1.0);
    if (el('speedVal')) el('speedVal').textContent = `${Number(prof.comboSpeed || 1.0).toFixed(1)}×`;

    const isRand = prof.restMode === 'random';
    if (el('restFixedBtn')) el('restFixedBtn').classList.toggle('active', !isRand);
    if (el('restRandomBtn')) el('restRandomBtn').classList.toggle('active', isRand);
    if (el('restFixedControls')) el('restFixedControls').style.display = isRand ? 'none' : 'block';
    if (el('restRandomControls')) el('restRandomControls').style.display = isRand ? 'block' : 'none';

    if (el('pauseSlider')) el('pauseSlider').value = String(prof.comboPauseMs || 2200);
    if (el('pauseVal')) el('pauseVal').textContent = `${((prof.comboPauseMs || 2200) / 1000).toFixed(1)}s`;
    if (el('restMinSlider')) el('restMinSlider').value = String(prof.restMinMs || 1500);
    if (el('restMinVal')) el('restMinVal').textContent = `${((prof.restMinMs || 1500) / 1000).toFixed(1)}s`;
    if (el('restMaxSlider')) el('restMaxSlider').value = String(prof.restMaxMs || 4500);
    if (el('restMaxVal')) el('restMaxVal').textContent = `${((prof.restMaxMs || 4500) / 1000).toFixed(1)}s`;
  }

  function renderPunchReference() {
    const grid = el('punchReferenceGrid');
    if (!grid) return;
    const prof = BoxingStorage.getActiveProfile();
    grid.innerHTML = Object.values(BoxingData.PUNCH_DATA).map(p => {
      const txt = BoxingData.getPunchDisplayLabel(p.key, prof.calloutStyle, prof.stance);
      return `<button type="button" class="pchip ${escHtml(p.chip)}" onclick="previewPunchAudio('${escHtml(p.key)}')">${escHtml(p.num)} · ${escHtml(txt)}</button>`;
    }).join('');
  }

  function previewPunchAudio(key) {
    const prof = BoxingStorage.getActiveProfile();
    BoxingAudio.ensureAudio();
    highlightStrikeZone(key);
    BoxingAudio.playPunch(key, { stance: prof.stance, calloutStyle: prof.calloutStyle });
  }

  // --- Timer Engine ---
  function toggleTimer() {
    if (!tWorkout) return;
    if (tRunning) {
      pauseArenaTimer();
      return;
    }
    startArenaTimer();
  }

  function pauseArenaTimer() {
    tRunning = false;
    clearArenaTimers();
    BoxingAudio.stopCurrentAudio();
    renderArenaStage();
    if (focusModeActive) syncFocusModeUI();
  }

  function startArenaTimer() {
    if (!tWorkout || !tWorkout.exercises[tExIdx]) return;
    BoxingAudio.ensureAudio();
    const doneCard = el('sessionCompleteCard');
    if (doneCard) doneCard.style.display = 'none';

    tRunning = true;
    const ex = tWorkout.exercises[tExIdx];

    if (tRem === tTotal && !tInRest) {
      BoxingAudio.playGo();
      BoxingAudio.triggerHaptic([35, 30, 35]);
      BoxingAudio.playExerciseSound(ex.name);
    }

    clearArenaTimers();
    tInt = setInterval(tickArenaSecond, 1000);

    if (ex.phase === 'boxing' && !tInRest) {
      scheduleNextCombo(600);
    }

    renderArenaStage();
    if (focusModeActive) syncFocusModeUI();
  }

  function tickArenaSecond() {
    if (!tRunning || !tWorkout || !tWorkout.exercises[tExIdx]) return;
    const ex = tWorkout.exercises[tExIdx];

    if (ex.phase !== 'rest' && !tInRest) {
      sessionElapsedSecs += 1;
      if (ex.phase === 'boxing') activeBoxingElapsedSecs += 1;
    }

    if (tRem > 1) {
      tRem -= 1;
      if (tRem <= 3) {
        BoxingAudio.playTimerSound(String(tRem));
        BoxingAudio.triggerHaptic(20);
      } else if (!tInRest && ex.phase === 'boxing' && tRem === 10 && tTotal >= 45) {
        BoxingAudio.playClapper();
      }
      renderArenaStage();
      if (focusModeActive) syncFocusModeUI();
      return;
    }

    // tRem reached 0
    tRem = 0;
    advanceAfterInterval();
  }

  function advanceAfterInterval() {
    const prof = BoxingStorage.getActiveProfile();
    const autoAdv = prof.autoAdvance !== false;
    const ex = tWorkout.exercises[tExIdx];
    const totalRounds = ex.rounds || 1;
    const restBetween = (ex.phase === 'boxing' && Number(ex.restBetween) > 0 && Number(prof.defaultRestSecs) > 0)
      ? Number(prof.defaultRestSecs)
      : (Number(ex.restBetween) || 0);

    clearArenaTimers();

    if (!tInRest && tRound < totalRounds && restBetween > 0) {
      // Transition into inter-round Corner Rest
      tInRest = true;
      tTotal = restBetween;
      tRem = restBetween;
      currentCornerTip = BoxingData.CORNER_TIPS[Math.floor(Math.random() * BoxingData.CORNER_TIPS.length)];
      BoxingAudio.playBell(1);
      BoxingAudio.triggerHaptic([60, 40, 60]);
      resetArenaStrikeVisuals();
      tInt = setInterval(tickArenaSecond, 1000);
      renderArenaSegments();
      renderArenaStage();
      if (focusModeActive) syncFocusModeUI();
      return;
    }

    if (tInRest || (!tInRest && tRound < totalRounds)) {
      // Next round of current exercise
      tInRest = false;
      tRound += 1;
      loadCurrentExerciseIntoClock(false);
      BoxingAudio.playGo();
      BoxingAudio.triggerHaptic([40, 30, 40]);
      if (autoAdv) {
        tInt = setInterval(tickArenaSecond, 1000);
        if (ex.phase === 'boxing') scheduleNextCombo(600);
      } else {
        tRunning = false;
      }
      renderArenaSegments();
      renderArenaStage();
      if (focusModeActive) syncFocusModeUI();
      return;
    }

    // Finished all rounds of current exercise -> Move to next exercise
    if (tExIdx < tWorkout.exercises.length - 1) {
      tExIdx += 1;
      loadCurrentExerciseIntoClock(true);
      BoxingAudio.playBell(1);
      BoxingAudio.triggerHaptic([50, 40, 50]);
      const nxtEx = tWorkout.exercises[tExIdx];
      if (autoAdv) {
        tInt = setInterval(tickArenaSecond, 1000);
        BoxingAudio.playExerciseSound(nxtEx.name);
        if (nxtEx.phase === 'boxing') scheduleNextCombo(650);
      } else {
        tRunning = false;
      }
      renderArenaSegments();
      renderArenaStage();
      renderArenaExerciseList();
      if (focusModeActive) syncFocusModeUI();
      return;
    }

    // Finished entire workout!
    completeArenaWorkout();
  }

  function skipCornerRest() {
    if (!tWorkout || !tWorkout.exercises[tExIdx]) return;
    const ex = tWorkout.exercises[tExIdx];
    if (tInRest) {
      advanceAfterInterval();
    } else if (ex.phase === 'rest') {
      nextEx();
    }
  }

  function completeArenaWorkout() {
    tRunning = false;
    clearArenaTimers();
    BoxingAudio.playVictory();
    BoxingAudio.playBell(3);
    BoxingAudio.triggerHaptic([80, 60, 80, 60, 120]);
    if (focusModeActive) exitFocusMode();

    const stats = BoxingWorkouts.calcWorkoutStats(tWorkout);
    const loggedSecs = sessionElapsedSecs > 30 ? sessionElapsedSecs : stats.totalSecs;
    const countedRounds = stats.boxingRounds || stats.totalWorkRounds || 1;
    const log = BoxingStorage.logWorkoutCompletion({
      dateKey: tWorkout.dayKey || BoxingStorage.dateToDayKey(new Date()),
      workoutId: tWorkout.id || 'custom',
      label: tWorkout.title || tWorkout.label || 'Boxing Session',
      category: tWorkout.category || 'camp',
      durationSecs: loggedSecs,
      rounds: countedRounds,
      punches: sessionPunches,
      rpe: 'solid'
    });
    lastSessionLogId = log.id;
    selectedRpe = 'solid';

    const kcal = BoxingStorage.estimateSessionKcal(loggedSecs, tWorkout.category || 'camp');
    const metricsEl = el('sessionDoneMetrics');
    if (metricsEl) {
      metricsEl.innerHTML = `
        <span class="meta-chip accent">⏱ ${escHtml(fmtHumanDuration(loggedSecs))}</span>
        <span class="meta-chip">🥊 ${sessionPunches.toLocaleString()} ${escHtml(tr('Punches'))}</span>
        <span class="meta-chip">🔥 ~${kcal} ${escHtml(tr('kcal'))}</span>
      `;
    }
    const card = el('sessionCompleteCard');
    if (card) card.style.display = 'block';

    document.querySelectorAll('#rpePills .rpe-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.rpe === 'solid');
    });

    updateTopbarChrome();
    renderArenaStage();
    showToast(`${tr('Session complete!')} +${countedRounds * 40 + 100} XP`);
  }

  function selectSessionRpe(rpe) {
    selectedRpe = rpe;
    document.querySelectorAll('#rpePills .rpe-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.rpe === rpe);
    });
    if (lastSessionLogId) {
      BoxingStorage.updateLastLogRpe(lastSessionLogId, rpe);
    }
  }

  function finishAndReturnCamp() {
    const card = el('sessionCompleteCard');
    if (card) card.style.display = 'none';
    showView('camp');
  }

  function jumpToEx(idx) {
    if (!tWorkout || !tWorkout.exercises[idx]) return;
    const wasRunning = tRunning;
    clearArenaTimers();
    BoxingAudio.stopCurrentAudio();
    tExIdx = idx;
    loadCurrentExerciseIntoClock(true);
    renderArenaSegments();
    renderArenaStage();
    renderArenaExerciseList();
    if (wasRunning) startArenaTimer();
    else if (focusModeActive) syncFocusModeUI();
  }

  function prevEx() {
    if (!tWorkout) return;
    jumpToEx(Math.max(0, tExIdx - 1));
  }

  function nextEx() {
    if (!tWorkout) return;
    if (tExIdx < tWorkout.exercises.length - 1) {
      jumpToEx(tExIdx + 1);
    } else {
      completeArenaWorkout();
    }
  }

  function resetCurrentExercise() {
    pauseArenaTimer();
    loadCurrentExerciseIntoClock(true);
    renderArenaSegments();
    renderArenaStage();
    if (focusModeActive) syncFocusModeUI();
    showToast(tr('Round reset'));
  }

  // --- Dynamic Combo & Reflex Engine ---
  function generateReflexCombo(ex) {
    const defenses = ['slip-l', 'slip-r', 'roll', 'pull', 'parry', 'pivot'];
    const defKey = defenses[Math.floor(Math.random() * defenses.length)];
    const counters = [
      ['cross', 'lead-hook', 'cross'],
      ['lead-hook', 'cross'],
      ['rear-upper', 'lead-hook', 'cross'],
      ['jab', 'cross', 'body-lead-hook'],
      ['cross', 'rear-upper', 'lead-hook'],
      ['body-lead-hook', 'lead-hook', 'cross']
    ];
    const allowed = Array.isArray(ex && ex.allowedPunches) ? new Set(ex.allowedPunches) : null;
    let c = counters[Math.floor(Math.random() * counters.length)];
    if (allowed) {
      const valid = counters.filter(seq => seq.every(p => allowed.has(p)));
      if (valid.length) c = valid[Math.floor(Math.random() * valid.length)];
    }
    const seq = [defKey, ...c];
    return {
      name: `REFLEX · ${seq.map(k => (BoxingData.getPunchMeta(k) || { num: k }).num).join(' – ')}`,
      cue: tr('React immediately off defense — whip your counter back before resetting guard.'),
      punches: seq
    };
  }

  function scheduleNextCombo(initialDelayMs) {
    if (!tRunning || !tWorkout || tInRest) return;
    const ex = tWorkout.exercises[tExIdx];
    if (!ex || ex.phase !== 'boxing') return;

    const prof = BoxingStorage.getActiveProfile();
    const waitMs = typeof initialDelayMs === 'number'
      ? initialDelayMs
      : (prof.restMode === 'random'
        ? (prof.restMinMs || 1500) + Math.random() * Math.max(300, (prof.restMaxMs || 4500) - (prof.restMinMs || 1500))
        : (prof.comboPauseMs || 2200));

    const actualWait = reflexMode ? Math.max(550, Math.round(waitMs * 0.72)) : waitMs;

    comboScheduler = setTimeout(() => {
      if (!tRunning || tInRest) return;
      const curEx = tWorkout && tWorkout.exercises[tExIdx];
      if (!curEx || curEx.phase !== 'boxing') return;

      const combo = reflexMode
        ? generateReflexCombo(curEx)
        : BoxingCombos.generateNextCombo(curEx, {
          level: prof.fitnessLevel,
          style: prof.preferredStyle,
          customCombos: prof.customCombos
        });

      fireComboSequence(combo);
    }, actualWait);
  }

  function fireComboSequence(combo) {
    if (!combo || !Array.isArray(combo.punches) || !combo.punches.length) return;
    const prof = BoxingStorage.getActiveProfile();
    const speed = Math.max(0.4, Number(prof.comboSpeed) || 1.0);
    const stepMs = Math.round(560 / speed);

    const notation = BoxingCombos.formatComboNotation(combo.punches, prof.calloutStyle, prof.stance);
    if (el('comboName')) el('comboName').textContent = tr(combo.name || notation);
    if (el('comboCue')) el('comboCue').textContent = tr(combo.cue || '');
    if (el('callout')) el('callout').textContent = notation;
    if (el('fmComboName')) el('fmComboName').textContent = tr(combo.name || notation);
    if (el('fmCallout')) el('fmCallout').textContent = notation;

    const chipsHtml = combo.punches.map((pKey, idx) => {
      const meta = BoxingData.getPunchMeta(pKey) || { chip: 'chip-jab', num: pKey, label: pKey };
      const label = prof.calloutStyle === 'numbers' ? meta.num : tr(meta.label);
      return `<span class="pchip ${escHtml(meta.chip)}" data-cidx="${idx}">${escHtml(label)}</span>`;
    }).join('');
    if (el('comboChips')) el('comboChips').innerHTML = chipsHtml;
    if (el('fmComboChips')) el('fmComboChips').innerHTML = chipsHtml;

    combo.punches.forEach((pKey, idx) => {
      const tid = setTimeout(() => {
        if (!tRunning) return;
        const meta = BoxingData.getPunchMeta(pKey);
        if (meta && meta.isPunch) {
          roundPunches += 1;
          sessionPunches += 1;
        }
        highlightStrikeZone(pKey);
        BoxingAudio.playPunch(pKey, { stance: prof.stance, calloutStyle: prof.calloutStyle });

        document.querySelectorAll('#comboChips .pchip, #fmComboChips .pchip').forEach(chip => {
          chip.classList.toggle('lit', Number(chip.dataset.cidx) === idx);
        });
        renderArenaStage();
        if (focusModeActive) syncFocusModeUI();
      }, idx * stepMs);
      comboChildTimers.push(tid);
    });

    const doneTid = setTimeout(() => {
      if (tRunning && !tInRest) {
        scheduleNextCombo();
      }
    }, combo.punches.length * stepMs + 250);
    comboChildTimers.push(doneTid);
  }

  function toggleReflexMode() {
    reflexMode = !reflexMode;
    updateTopbarChrome();
    showToast(`${tr('Reflex Mode')}: ${reflexMode ? 'ON' : 'OFF'}`);
  }

  function toggleCoachDrawer() {
    coachDrawerOpen = !coachDrawerOpen;
    const drawer = el('coachDrawer');
    if (drawer) drawer.style.display = coachDrawerOpen ? 'block' : 'none';
    const btn = el('coachDrawerToggle');
    if (btn) btn.classList.toggle('active', coachDrawerOpen);
  }

  function setAudioMode(mode) {
    BoxingStorage.updateActiveProfile({ audioMode: mode });
    updateTopbarChrome();
    BoxingAudio.ensureAudio();
    showToast(`${tr('Audio Mode')}: ${mode.toUpperCase()}`);
  }

  function toggleCalloutStyle() {
    const prof = BoxingStorage.getActiveProfile();
    const next = prof.calloutStyle === 'numbers' ? 'names' : 'numbers';
    BoxingStorage.updateActiveProfile({ calloutStyle: next });
    updateTopbarChrome();
    renderPunchReference();
  }

  function toggleAutoAdvance() {
    const prof = BoxingStorage.getActiveProfile();
    BoxingStorage.updateActiveProfile({ autoAdvance: prof.autoAdvance === false });
    updateTopbarChrome();
  }

  function updateSpeed(val) {
    const v = Math.max(0.5, Math.min(2.0, Number(val) || 1.0));
    BoxingStorage.updateActiveProfile({ comboSpeed: v });
    if (el('speedVal')) el('speedVal').textContent = `${v.toFixed(1)}×`;
  }

  function toggleRestMode() {
    const prof = BoxingStorage.getActiveProfile();
    const next = prof.restMode === 'random' ? 'fixed' : 'random';
    BoxingStorage.updateActiveProfile({ restMode: next });
    renderCoachDrawerControls();
  }

  function updatePause(val) {
    const ms = Math.max(400, Number(val) || 2200);
    BoxingStorage.updateActiveProfile({ comboPauseMs: ms });
    if (el('pauseVal')) el('pauseVal').textContent = `${(ms / 1000).toFixed(1)}s`;
  }

  function updateRestMin(val) {
    const prof = BoxingStorage.getActiveProfile();
    const minMs = Math.max(500, Number(val) || 1500);
    const maxMs = Math.max(minMs + 300, prof.restMaxMs || 4500);
    BoxingStorage.updateActiveProfile({ restMinMs: minMs, restMaxMs: maxMs });
    if (el('restMinVal')) el('restMinVal').textContent = `${(minMs / 1000).toFixed(1)}s`;
    if (el('restMaxSlider')) el('restMaxSlider').value = String(maxMs);
    if (el('restMaxVal')) el('restMaxVal').textContent = `${(maxMs / 1000).toFixed(1)}s`;
  }

  function updateRestMax(val) {
    const prof = BoxingStorage.getActiveProfile();
    const maxMs = Math.max((prof.restMinMs || 1500) + 300, Number(val) || 4500);
    BoxingStorage.updateActiveProfile({ restMaxMs: maxMs });
    if (el('restMaxVal')) el('restMaxVal').textContent = `${(maxMs / 1000).toFixed(1)}s`;
  }

  // --- Focus Mode ---
  function enterFocusMode() {
    focusModeActive = true;
    const ov = el('focusModeOverlay');
    if (ov) ov.classList.add('open');
    syncFocusModeUI();
  }

  function exitFocusMode() {
    focusModeActive = false;
    const ov = el('focusModeOverlay');
    if (ov) ov.classList.remove('open');
  }

  function syncFocusModeUI() {
    const ov = el('focusModeOverlay');
    if (!ov || !tWorkout || !tWorkout.exercises[tExIdx]) return;
    const ex = tWorkout.exercises[tExIdx];
    const pm = BoxingWorkouts.PHASE_META[ex.phase] || BoxingWorkouts.PHASE_META.boxing;
    const isRestState = tInRest || ex.phase === 'rest';

    ov.classList.toggle('phase-boxing', ex.phase === 'boxing' && !isRestState);
    ov.classList.toggle('phase-rest', isRestState);
    ov.classList.toggle('phase-warning', tRunning && tRem <= 3 && tRem > 0);

    if (el('fmPhase')) el('fmPhase').textContent = isRestState ? tr('Corner Rest') : tr(pm.label);
    if (el('fmExName')) el('fmExName').textContent = isRestState ? `${tr('Next')}: ${getUpcomingStepLabel()}` : tr(ex.name);
    if (el('fmRoundBadge')) el('fmRoundBadge').textContent = `${tr('Round')} ${tRound}/${ex.rounds || 1}`;
    if (el('fmPunchBadge')) el('fmPunchBadge').textContent = `${roundPunches} / ${sessionPunches} 🥊`;
    if (el('fmTimeDigits')) el('fmTimeDigits').textContent = fmtTime(tRem);

    const isBoxingWork = ex.phase === 'boxing' && !isRestState;
    if (el('fmTargetHudWrap')) el('fmTargetHudWrap').style.display = isBoxingWork ? 'block' : 'none';
    if (el('fmRestBanner')) {
      el('fmRestBanner').style.display = isRestState ? 'block' : 'none';
      if (isRestState && el('fmRestTip')) el('fmRestTip').textContent = tr(currentCornerTip);
    }
    if (el('fmStartBtn')) {
      el('fmStartBtn').textContent = tRunning ? `⏸ ${tr('Pause')}` : `▶ ${tr('Start')}`;
    }
  }

  // =========================================================================
  // VIEW 4: Fight Camp & Calendar
  // =========================================================================
  function shiftMonth(delta) {
    curMonth += delta;
    if (curMonth < 0) {
      curMonth = 11;
      curYear -= 1;
    } else if (curMonth > 11) {
      curMonth = 0;
      curYear += 1;
    }
    renderCampView();
  }

  function selectCalendarDay(dk) {
    selectedDayKey = dk;
    renderCampView();
  }

  function toggleDayCompleteFromCal(dk) {
    BoxingStorage.toggleDayCompleted(dk);
    renderCampView();
    updateTopbarChrome();
  }

  function renderCampView() {
    const prof = BoxingStorage.getActiveProfile();
    const stats = BoxingStorage.getFighterStats(prof);

    if (el('sSess')) el('sSess').textContent = String(stats.totalSessions);
    if (el('sHrs')) el('sHrs').textContent = `${stats.totalHours}h`;
    if (el('sStr')) el('sStr').textContent = `${stats.currentStreak}d`;
    if (el('sPunches')) el('sPunches').textContent = stats.totalPunches.toLocaleString();

    const mTitle = el('calTitle');
    if (mTitle) mTitle.textContent = `${tr(MONTH_NAMES[curMonth])} ${curYear}`;

    const dhRow = el('dhRow');
    if (dhRow) {
      dhRow.innerHTML = DAY_SHORT_MON.map(d => `<div class="dh">${escHtml(tr(d))}</div>`).join('');
    }

    const firstDay = new Date(curYear, curMonth, 1);
    const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
    const leadingEmpty = (firstDay.getDay() + 6) % 7; // Mon=0 .. Sun=6
    const todayDk = BoxingStorage.dateToDayKey(new Date());
    const scaledDays = BoxingWorkouts.getScaledWorkoutsForDateRange(firstDay, prof, prof.sessionDuration || 60);

    const cells = [];
    for (let i = 0; i < leadingEmpty; i++) {
      cells.push('<div class="dc empty"></div>');
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(curYear, curMonth, d);
      const dk = BoxingStorage.dayKey(curYear, curMonth, d);
      const code = BoxingStorage.getAssignedWorkoutCode(prof, dt);
      const isRest = code === 'R';
      const isToday = dk === todayDk;
      const isSel = dk === selectedDayKey;
      const isDone = !!(prof.completed && prof.completed[dk]);
      const pillCls = isRest ? 'pr' : `p${code.toLowerCase()}`;
      const woObj = !isRest ? scaledDays[code] : null;
      const pillLabel = isRest ? tr('Rest') : (woObj ? tr(woObj.label.replace(/^Day [ABCD]\s*[–-]\s*/, '')) : code);

      cells.push(`
        <div class="dc ${isToday ? 'today' : ''} ${isSel ? 'sel' : ''}" onclick="selectCalendarDay('${dk}')">
          <div class="dn">${d}</div>
          <span class="dpill ${pillCls}">${isRest ? tr('Rest') : `${code} · ${escHtml(pillLabel.slice(0, 12))}`}</span>
          ${isDone ? '<div class="dcheck"><div class="dtick"></div></div>' : ''}
        </div>
      `);
    }

    const grid = el('calGrid');
    if (grid) grid.innerHTML = cells.join('');

    renderCalendarDetailPanel(prof);
    renderCampTelemetrySummary(prof);
    renderHeatmap(prof);
  }

  function renderCalendarDetailPanel(prof) {
    const det = el('calDetail');
    if (!det) return;
    det.style.display = 'block';
    det.className = 'detail-panel';
    const dt = BoxingStorage.parseDayKey(selectedDayKey) || new Date();
    const code = BoxingStorage.getAssignedWorkoutCode(prof, dt);
    const isDone = !!(prof.completed && prof.completed[selectedDayKey]);
    const dur = prof.sessionDuration || 60;
    const scaled = BoxingWorkouts.getScaledWorkoutsForDateRange(dt, prof, dur);
    const dateNice = dt.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

    if (code === 'R' || !scaled[code]) {
      det.innerHTML = `
        <div class="dp-hd">
          <div>
            <div class="dp-title">${escHtml(dateNice)} · ${escHtml(tr('Active Recovery & Mobility'))}</div>
            <div class="dp-sub">${escHtml(tr('Light shadowboxing, hydration & TRX lumbar decompression optional.'))}</div>
          </div>
          <div class="dp-actions">
            <button type="button" class="stbtn" onclick="launchWorkoutById('trx:pain-relief')">🎗️ ${escHtml(tr('TRX Mobility'))}</button>
            <button type="button" class="mkbtn ${isDone ? 'done' : ''}" onclick="toggleDayCompleteFromCal('${escHtml(selectedDayKey)}')">
              ${isDone ? `✓ ${escHtml(tr('Completed'))}` : `○ ${escHtml(tr('Mark Done'))}`}
            </button>
          </div>
        </div>
      `;
      return;
    }

    const wo = scaled[code];
    const stats = BoxingWorkouts.calcWorkoutStats(wo);
    det.innerHTML = `
      <div class="dp-hd">
        <div>
          <div class="dp-title">${escHtml(dateNice)} — ${escHtml(tr(wo.label))}</div>
          <div class="dp-sub">${escHtml(tr(wo.focus || wo.subtitle || ''))} · <strong>${escHtml(fmtHumanDuration(stats.totalSecs))}</strong> (${stats.boxingRounds} ${escHtml(tr('Rnds'))})</div>
        </div>
        <div class="dp-actions">
          <button type="button" class="stbtn" onclick="launchWorkoutById('day:${escHtml(selectedDayKey)}')">▶ ${escHtml(tr('Launch in Timer'))}</button>
          <button type="button" class="mkbtn ${isDone ? 'done' : ''}" onclick="toggleDayCompleteFromCal('${escHtml(selectedDayKey)}')">
            ${isDone ? `✓ ${escHtml(tr('Completed'))}` : `○ ${escHtml(tr('Mark Done'))}`}
          </button>
        </div>
      </div>
      ${(wo.exercises || []).map((ex, i) => {
        const pm = BoxingWorkouts.PHASE_META[ex.phase] || BoxingWorkouts.PHASE_META.boxing;
        const infoId = `cal-ex-${i}`;
        const infoHtml = buildExerciseInfoHtml(ex);
        return `
          <div class="exrow">
            <span class="ephase ${escHtml(pm.cls)}">${escHtml(tr(pm.label))}</span>
            <div class="exname">
              ${escHtml(tr(ex.name))}
              <div class="ex-subline">${escHtml(tr(ex.detail || ''))}</div>
            </div>
            <span class="edur">${escHtml(fmtTime(ex.secs))} × ${ex.rounds || 1}</span>
            ${infoHtml ? `<button type="button" class="info-btn" onclick="toggleInfo('${infoId}')">ℹ</button>` : ''}
            ${infoHtml ? `<div class="info-panel" id="${infoId}">${infoHtml}</div>` : ''}
          </div>
        `;
      }).join('')}
    `;
  }

  function renderCampTelemetrySummary(prof) {
    const node = el('settingsTelemetry');
    if (!node) return;
    const logs = prof.workoutLogs || [];
    const totalKcal = logs.reduce((sum, l) => sum + BoxingStorage.estimateSessionKcal(l.durationSecs, l.category), 0);
    const totalRounds = logs.reduce((sum, l) => sum + (Number(l.rounds) || 0), 0);
    const completedCount = Object.keys(prof.completed || {}).length;
    const lastLog = logs.length ? logs[logs.length - 1] : null;

    node.innerHTML = `
      <div class="sc"><div class="sc-l">${escHtml(tr('Days Checked'))}</div><div class="sc-v">${completedCount}</div></div>
      <div class="sc"><div class="sc-l">${escHtml(tr('Total Rounds'))}</div><div class="sc-v">${totalRounds}</div></div>
      <div class="sc"><div class="sc-l">${escHtml(tr('Est. Kcal'))}</div><div class="sc-v">${totalKcal.toLocaleString()}</div></div>
      <div class="sc"><div class="sc-l">${escHtml(tr('Last Session'))}</div><div class="sc-v" style="font-size:14px">${lastLog ? escHtml(tr(lastLog.label).slice(0, 18)) : '—'}</div></div>
    `;
  }

  function renderHeatmap(prof) {
    const grid = el('heatmapGrid');
    if (!grid) return;
    const cells = BoxingStorage.buildActivityHeatmap(prof, 12);
    grid.innerHTML = cells.map(c =>
      `<span class="hm-cell lv${c.level}" title="${escHtml(c.dateKey)}: ${c.count} ${escHtml(tr('Sessions'))}, ${c.punches} ${escHtml(tr('Punches'))}"></span>`
    ).join('');
  }

  // =========================================================================
  // VIEW 5: Technique Academy, Combo Playbook & Fighter Profile / Gear
  // =========================================================================
  function setProfileSubTab(tab) {
    activeProfileSubTab = tab;
    renderProfileView();
  }

  function setTechCategory(cat) {
    activeTechCategory = cat;
    renderTechAcademy();
  }

  function setComboStyle(styleTag) {
    activeComboStyle = styleTag;
    renderComboPlaybook();
  }

  function renderProfileView() {
    document.querySelectorAll('#profileSubTabs .subtab').forEach(btn => {
      const target = btn.getAttribute('onclick') || '';
      btn.classList.toggle('active', target.includes(`'${activeProfileSubTab}'`));
    });

    if (el('techAcademyPane')) el('techAcademyPane').style.display = activeProfileSubTab === 'academy' ? 'block' : 'none';
    if (el('comboPlaybookPane')) el('comboPlaybookPane').style.display = activeProfileSubTab === 'combos' ? 'block' : 'none';
    if (el('fighterProfilePane')) el('fighterProfilePane').style.display = activeProfileSubTab === 'gear' ? 'block' : 'none';

    if (activeProfileSubTab === 'academy') renderTechAcademy();
    else if (activeProfileSubTab === 'combos') renderComboPlaybook();
    else renderFighterProfilePane();
  }

  function previewTechAudio(audioKey) {
    const prof = BoxingStorage.getActiveProfile();
    BoxingAudio.ensureAudio();
    BoxingAudio.playPunch(audioKey, { stance: prof.stance, calloutStyle: 'names' });
  }

  function renderTechAcademy() {
    const prof = BoxingStorage.getActiveProfile();
    const stance = prof.stance || 'orthodox';
    const cats = [
      { id: 'all', label: tr('All') },
      { id: 'punches', label: tr('Head Punches') },
      { id: 'body', label: tr('Body Shots') },
      { id: 'defense', label: tr('Defense') },
      { id: 'footwork', label: tr('Footwork') },
      { id: 'styles', label: tr('Styles') }
    ];

    const filterRow = el('techCatFilters');
    if (filterRow) {
      filterRow.innerHTML = cats.map(c =>
        `<button type="button" class="fpill ${activeTechCategory === c.id ? 'active' : ''}" onclick="setTechCategory('${c.id}')">${escHtml(c.label)}</button>`
      ).join('');
    }

    const items = BoxingData.TECHNIQUE_LIBRARY.filter(t => activeTechCategory === 'all' || t.category === activeTechCategory);
    const grid = el('techniqueGrid');
    if (grid) {
      grid.innerHTML = items.map(t => `
        <div class="tech-card">
          <div class="tech-title">
            <span>${escHtml(tr(t.name))}</span>
            <span class="tech-num-badge">${escHtml(t.num)}</span>
          </div>
          <div class="tech-desc">${escHtml(tr(t.desc))}</div>
          ${t.stanceNote ? `<div class="tech-stance-note"><strong>${escHtml(tr(stance === 'southpaw' ? 'Southpaw' : 'Orthodox'))}:</strong> ${escHtml(tr(t.stanceNote[stance] || t.stanceNote.orthodox || ''))}</div>` : ''}
          <div class="tech-tips">
            ${(t.tips || []).map(tip => `<div class="tech-tip">${escHtml(tr(tip))}</div>`).join('')}
          </div>
          ${t.mistake ? `<div class="tech-mistake">⚠ ${escHtml(tr('Avoid'))}: ${escHtml(tr(t.mistake))}</div>` : ''}
          <div class="tech-foot">
            ${t.audioKey ? `<button type="button" class="tech-btn" onclick="previewTechAudio('${escHtml(t.audioKey)}')">🔊 ${escHtml(tr('Preview Audio'))}</button>` : ''}
            ${t.yt ? `<a class="tech-btn" href="${escHtml(t.yt)}" target="_blank" rel="noopener noreferrer">▶ ${escHtml(tr('Form Video'))}</a>` : ''}
          </div>
        </div>
      `).join('');
    }
  }

  function previewComboById(id) {
    const prof = BoxingStorage.getActiveProfile();
    const all = [...BoxingCombos.COMBO_LIBRARY, ...(prof.customCombos || [])];
    const combo = all.find(c => c.id === id);
    if (!combo) return;
    BoxingAudio.ensureAudio();
    const speed = Math.max(0.5, Number(prof.comboSpeed) || 1.0);
    const stepMs = Math.round(520 / speed);
    combo.punches.forEach((p, idx) => {
      setTimeout(() => BoxingAudio.playPunch(p, { stance: prof.stance, calloutStyle: prof.calloutStyle }), idx * stepMs);
    });
  }

  function deleteCustomCombo(id) {
    const prof = BoxingStorage.getActiveProfile();
    const next = (prof.customCombos || []).filter(c => c.id !== id);
    BoxingStorage.updateActiveProfile({ customCombos: next });
    renderComboPlaybook();
    showToast(tr('Combo deleted'));
  }

  function renderComboPlaybook() {
    const prof = BoxingStorage.getActiveProfile();
    const tags = [
      { id: 'all', label: tr('All') },
      { id: 'custom', label: tr('My Custom') },
      { id: 'fundamentals', label: tr('Fundamentals') },
      { id: 'peekaboo', label: 'Peek-a-Boo' },
      { id: 'philly_shell', label: 'Philly Shell' },
      { id: 'cuban', label: tr('Cuban') },
      { id: 'body_snatcher', label: tr('Body Snatcher') },
      { id: 'counter', label: tr('Counter') },
      { id: 'power', label: tr('Power') },
      { id: 'speed', label: tr('Speed') }
    ];

    const filterRow = el('comboStyleFilters');
    if (filterRow) {
      filterRow.innerHTML = tags.map(t =>
        `<button type="button" class="fpill ${activeComboStyle === t.id ? 'active' : ''}" onclick="setComboStyle('${t.id}')">${escHtml(t.label)}</button>`
      ).join('');
    }

    const customs = (prof.customCombos || []).map(c => ({ ...c, isCustom: true }));
    const combined = [...customs, ...BoxingCombos.COMBO_LIBRARY];
    const filtered = combined.filter(c => {
      if (activeComboStyle === 'all') return true;
      if (activeComboStyle === 'custom') return !!c.isCustom;
      return Array.isArray(c.tags) && c.tags.includes(activeComboStyle);
    });

    const grid = el('comboPlaybookGrid');
    if (grid) {
      if (!filtered.length) {
        grid.innerHTML = `<div class="settings-block" style="grid-column:1/-1;text-align:center;color:var(--text-secondary)">${escHtml(tr('No combinations in this filter yet. Click "+ Build Combo" to create your own!'))}</div>`;
      } else {
        grid.innerHTML = filtered.map(c => {
          const notation = BoxingCombos.formatComboNotation(c.punches, prof.calloutStyle, prof.stance);
          const chips = (c.punches || []).map(p => {
            const meta = BoxingData.getPunchMeta(p) || { chip: 'chip-jab', num: p, label: p };
            return `<span class="pchip ${escHtml(meta.chip)}">${escHtml(prof.calloutStyle === 'numbers' ? meta.num : tr(meta.label))}</span>`;
          }).join('');
          return `
            <div class="combo-card">
              <div class="tech-title">
                <span>${escHtml(tr(c.name))}</span>
                <span class="tech-num-badge">${escHtml(c.tier ? tr(c.tier.toUpperCase()) : 'CUSTOM')}</span>
              </div>
              <div class="combo-chips">${chips}</div>
              <div class="tech-desc"><strong>${escHtml(notation)}</strong> — ${escHtml(tr(c.cue || ''))}</div>
              <div class="tech-foot">
                <button type="button" class="tech-btn" onclick="previewComboById('${escHtml(c.id)}')">🔊 ${escHtml(tr('Hear Combo'))}</button>
                ${c.isCustom ? `<button type="button" class="tech-btn" onclick="deleteCustomCombo('${escHtml(c.id)}')">🗑 ${escHtml(tr('Delete'))}</button>` : ''}
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }

  function renderFighterProfilePane() {
    const prof = BoxingStorage.getActiveProfile();
    const stats = BoxingStorage.getFighterStats(prof);
    const rank = BoxingStorage.getFighterRank(stats);

    const rankBanner = el('profileRankCard');
    if (rankBanner) {
      rankBanner.innerHTML = `
        <div class="sr-top">
          <div>
            <div class="settings-title" style="margin:0">🥊 ${escHtml(prof.name)} — ${escHtml(tr(rank.rank))}</div>
            <div class="settings-hint" style="margin:2px 0 0">${rank.xp.toLocaleString()} XP · ${stats.totalSessions} ${escHtml(tr('Sessions'))} · ${stats.totalPunches.toLocaleString()} ${escHtml(tr('Punches'))}</div>
          </div>
          <span class="tech-num-badge">${rank.pct}%</span>
        </div>
        <div class="sr-bar" style="height:7px;margin-top:10px"><div class="sr-fill" style="width:${rank.pct}%"></div></div>
        <div class="settings-hint" style="margin:6px 0 0">${rank.nextRank ? `${escHtml(tr('Next Milestone'))}: ${escHtml(tr(rank.nextRank))} (${rank.nextXp.toLocaleString()} XP)` : escHtml(tr('Champion of the Studio'))}</div>
      `;
    }

    // Badges
    const badges = BoxingStorage.getBadgesProgress(prof);
    const bGrid = el('badgesGrid');
    if (bGrid) {
      bGrid.innerHTML = badges.map(b => `
        <div class="badge-card ${b.unlocked ? 'unlocked' : ''}">
          <div class="badge-icon">${b.icon}</div>
          <div class="badge-name">${escHtml(tr(b.name))}</div>
          <div class="badge-desc">${escHtml(tr(b.desc))}</div>
          <div class="badge-prog-bar"><div class="badge-prog-fill" style="width:${b.pct}%"></div></div>
          <div class="badge-prog-lbl">${b.current}/${b.target}</div>
        </div>
      `).join('');
    }

    // Home Gym Equipment Toggles
    const owned = new Set(prof.equipment || []);
    const eqGrid = el('equipmentGrid');
    if (eqGrid) {
      eqGrid.innerHTML = BoxingWorkouts.EQUIPMENT_CATALOG.map(g => {
        const has = owned.has(g.id);
        return `
          <button type="button" class="equip-toggle-card ${has ? 'owned' : ''}" onclick="toggleUserEquipment('${escHtml(g.id)}')">
            <span>${g.icon} ${escHtml(tr(g.label))}</span>
            <span>${has ? '✓' : '+'}</span>
          </button>
        `;
      }).join('');
    }

    // Fighter Prefs active states
    setActiveButtons([
      ['pref-stance-orthodox', prof.stance !== 'southpaw'],
      ['pref-stance-southpaw', prof.stance === 'southpaw'],
      ['pref-callout-names', prof.calloutStyle !== 'numbers'],
      ['pref-callout-numbers', prof.calloutStyle === 'numbers'],
      ['pref-dur-60', (prof.sessionDuration || 60) === 60],
      ['pref-dur-90', prof.sessionDuration === 90],
      ['pref-dur-120', prof.sessionDuration === 120],
      ['lvl-beginner', prof.fitnessLevel === 'beginner'],
      ['lvl-intermediate', prof.fitnessLevel === 'intermediate'],
      ['lvl-advanced', prof.fitnessLevel === 'advanced']
    ]);

    if (el('prefStyleSelect')) el('prefStyleSelect').value = prof.preferredStyle || 'all';
    if (el('prefRestSelect')) el('prefRestSelect').value = String(prof.defaultRestSecs || 60);
    if (el('programSelect')) el('programSelect').value = prof.activeProgramId || 'classic';
    if (el('programStart')) el('programStart').value = prof.programStartDate || BoxingStorage.todayIso();
    if (el('dpwSelect')) el('dpwSelect').value = String(Math.max(2, Math.min(5, (prof.workoutDays || []).length || 3)));

    renderDayAssignGrid(prof);
    renderWeekPreview(prof);
  }

  function renderDayAssignGrid(prof) {
    const grid = el('dayAssignGrid');
    if (!grid) return;
    const assigned = {};
    (prof.workoutDays || []).forEach((dow, idx) => {
      assigned[dow] = (prof.dayOrder && prof.dayOrder[idx]) || 'A';
    });

    grid.innerHTML = DAY_ORDER_MON.map((dow, i) => {
      const code = assigned[dow] || 'R';
      return `
        <div class="day-col">
          <span class="day-col-name">${escHtml(tr(DAY_SHORT_MON[i]))}</span>
          <select class="day-sel" data-dow="${dow}">
            <option value="R" ${code === 'R' ? 'selected' : ''}>${escHtml(tr('Rest'))}</option>
            <option value="A" ${code === 'A' ? 'selected' : ''}>A</option>
            <option value="B" ${code === 'B' ? 'selected' : ''}>B</option>
            <option value="C" ${code === 'C' ? 'selected' : ''}>C</option>
            <option value="D" ${code === 'D' ? 'selected' : ''}>D</option>
          </select>
        </div>
      `;
    }).join('');
  }

  function renderWeekPreview(prof) {
    const prev = el('weekPreview');
    if (!prev) return;
    const refMonday = new Date(2026, 10, 16); // Known Monday
    prev.innerHTML = DAY_ORDER_MON.map((dow, i) => {
      const dt = new Date(refMonday.getFullYear(), refMonday.getMonth(), refMonday.getDate() + i);
      const code = BoxingStorage.getAssignedWorkoutCode(prof, dt);
      const cls = code === 'R' ? 'pr' : `p${code.toLowerCase()}`;
      return `<div class="wp-cell ${cls}">${escHtml(tr(DAY_SHORT_MON[i]))}: ${code === 'R' ? tr('Rest') : code}</div>`;
    }).join('');
  }

  function toggleUserEquipment(gearId) {
    BoxingStorage.toggleEquipment(gearId);
    renderFighterProfilePane();
    showToast(tr('Equipment updated'));
  }

  function setFighterPref(key, value) {
    BoxingStorage.updateActiveProfile({ [key]: value });
    updateTopbarChrome();
    renderFighterProfilePane();
    showToast(tr('Preference saved'));
  }

  function setLevel(lvl) {
    BoxingStorage.updateActiveProfile({ fitnessLevel: lvl });
    updateTopbarChrome();
    renderFighterProfilePane();
    showToast(`${tr('Fitness Level')}: ${tr(lvl[0].toUpperCase() + lvl.slice(1))}`);
  }

  function autoAssignDays(countStr) {
    const count = Math.max(2, Math.min(5, parseInt(countStr, 10) || 3));
    const patterns = {
      2: { dows: [1, 4], order: ['A', 'B'] },
      3: { dows: [1, 3, 5], order: ['A', 'B', 'C'] },
      4: { dows: [1, 2, 4, 5], order: ['A', 'B', 'C', 'D'] },
      5: { dows: [1, 2, 3, 5, 6], order: ['A', 'B', 'C', 'D', 'A'] }
    };
    const p = patterns[count];
    BoxingStorage.updateActiveProfile({ workoutDays: p.dows, dayOrder: p.order });
    renderFighterProfilePane();
    showToast(`${count} ${tr('Days / Week assigned')}`);
  }

  function saveSchedule() {
    const workoutDays = [];
    const dayOrder = [];
    document.querySelectorAll('#dayAssignGrid .day-sel').forEach(sel => {
      const dow = parseInt(sel.dataset.dow, 10);
      if (sel.value !== 'R') {
        workoutDays.push(dow);
        dayOrder.push(sel.value);
      }
    });
    const programId = (el('programSelect') && el('programSelect').value) || 'classic';
    const startDate = (el('programStart') && el('programStart').value) || BoxingStorage.todayIso();

    BoxingStorage.updateActiveProfile({
      activeProgramId: programId,
      programStartDate: startDate,
      workoutDays,
      dayOrder: dayOrder.length ? dayOrder : ['A']
    });
    renderFighterProfilePane();
    showToast(tr('Training schedule saved'));
  }

  function exportDataJSON() {
    const payload = BoxingStorage.buildExportPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boxing-coach-backup-${BoxingStorage.todayIso()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(tr('Backup exported'));
  }

  function importDataJSON(evt) {
    const file = evt.target && evt.target.files && evt.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        BoxingStorage.importBackupObject(parsed);
        updateTopbarChrome();
        showView(curView);
        showToast(tr('Backup imported successfully'));
      } catch (_) {
        showToast(tr('Invalid backup JSON file'), 'err');
      }
      evt.target.value = '';
    };
    reader.readAsText(file);
  }

  // =========================================================================
  // Modals: Quick Interval Timer, Custom Combo, Custom Workout, Profile
  // =========================================================================
  function openQuickTimerModal() {
    const m = el('quickTimerModal');
    if (m) m.classList.add('open');
  }

  function closeQuickTimerModal() {
    stopQuickTimer();
    const m = el('quickTimerModal');
    if (m) m.classList.remove('open');
  }

  function applyQuickPreset(work, rest, rounds) {
    if (el('intRoundDur')) el('intRoundDur').value = String(work);
    if (el('intRestDur')) el('intRestDur').value = String(rest);
    if (el('intRoundsCount')) el('intRoundsCount').value = String(rounds);
  }

  function clearQuickTimerHandles() {
    if (qtInt) { clearInterval(qtInt); qtInt = null; }
    if (qtComboTimer) { clearTimeout(qtComboTimer); qtComboTimer = null; }
  }

  function startQuickTimerFromSettings() {
    BoxingAudio.ensureAudio();
    qtWorkSecs = Math.max(10, parseInt((el('intRoundDur') || {}).value, 10) || 180);
    qtRestSecs = Math.max(5, parseInt((el('intRestDur') || {}).value, 10) || 60);
    qtTotalRounds = Math.max(1, parseInt((el('intRoundsCount') || {}).value, 10) || 6);
    qtRound = 1;
    qtPhase = 'prep';
    qtRem = 5;
    qtRunning = true;
    qtPaused = false;

    if (el('intTimerDisplay')) el('intTimerDisplay').style.display = 'block';
    if (el('intTimerSettings')) el('intTimerSettings').style.display = 'none';
    if (el('intPauseBtn')) el('intPauseBtn').textContent = tr('Pause');

    clearQuickTimerHandles();
    qtInt = setInterval(tickQuickTimer, 1000);
    syncQuickTimerUI();
  }

  function tickQuickTimer() {
    if (!qtRunning || qtPaused) return;
    if (qtRem > 1) {
      qtRem -= 1;
      if (qtRem <= 3) BoxingAudio.playTick();
      syncQuickTimerUI();
      return;
    }

    if (qtPhase === 'prep') {
      qtPhase = 'work';
      qtRem = qtWorkSecs;
      BoxingAudio.playGo();
      scheduleQuickTimerCombo();
    } else if (qtPhase === 'work') {
      if (qtComboTimer) { clearTimeout(qtComboTimer); qtComboTimer = null; }
      if (qtRound < qtTotalRounds) {
        qtPhase = 'rest';
        qtRem = qtRestSecs;
        BoxingAudio.playBell(1);
      } else {
        BoxingAudio.playVictory();
        BoxingAudio.playBell(3);
        stopQuickTimer();
        showToast(tr('Interval timer complete!'));
        return;
      }
    } else {
      qtRound += 1;
      qtPhase = 'work';
      qtRem = qtWorkSecs;
      BoxingAudio.playGo();
      scheduleQuickTimerCombo();
    }
    syncQuickTimerUI();
  }

  function scheduleQuickTimerCombo() {
    const chk = el('intCallCombosChk');
    if (!qtRunning || qtPaused || qtPhase !== 'work' || !chk || !chk.checked) return;
    const prof = BoxingStorage.getActiveProfile();
    const combo = BoxingCombos.generateNextCombo(null, { level: prof.fitnessLevel, style: prof.preferredStyle, customCombos: prof.customCombos });
    const banner = el('intLiveComboBanner');
    if (banner && combo) {
      banner.style.display = 'block';
      banner.textContent = BoxingCombos.formatComboNotation(combo.punches, prof.calloutStyle, prof.stance);
      combo.punches.forEach((p, idx) => {
        setTimeout(() => {
          if (qtRunning && !qtPaused && qtPhase === 'work') {
            BoxingAudio.playPunch(p, { stance: prof.stance, calloutStyle: prof.calloutStyle });
          }
        }, idx * 450);
      });
    }
    qtComboTimer = setTimeout(scheduleQuickTimerCombo, 3200);
  }

  function syncQuickTimerUI() {
    const badge = el('intPhaseBadge');
    if (badge) {
      badge.className = `int-phase-badge ${qtPhase === 'work' ? 'int-phase-work' : qtPhase === 'rest' ? 'int-phase-rest' : 'int-phase-prep'}`;
      badge.textContent = qtPhase === 'work' ? tr('WORK') : qtPhase === 'rest' ? tr('REST') : tr('GET READY');
    }
    if (el('intTimeDigits')) el('intTimeDigits').textContent = fmtTime(qtRem);
    if (el('intRoundsInfo')) el('intRoundsInfo').textContent = `${tr('Round')} ${qtRound} / ${qtTotalRounds}`;
  }

  function toggleQuickTimerPause() {
    if (!qtRunning) return;
    qtPaused = !qtPaused;
    if (el('intPauseBtn')) el('intPauseBtn').textContent = qtPaused ? tr('Resume') : tr('Pause');
    if (!qtPaused && qtPhase === 'work') scheduleQuickTimerCombo();
  }

  function stopQuickTimer() {
    qtRunning = false;
    qtPaused = false;
    clearQuickTimerHandles();
    if (el('intTimerDisplay')) el('intTimerDisplay').style.display = 'none';
    if (el('intTimerSettings')) el('intTimerSettings').style.display = 'block';
    if (el('intLiveComboBanner')) el('intLiveComboBanner').style.display = 'none';
  }

  // --- Custom Combo Builder ---
  function openCustomComboModal() {
    customComboSeq = [];
    if (el('customComboName')) el('customComboName').value = '';
    const sel = el('comboPunchSelector');
    if (sel) {
      sel.innerHTML = Object.values(BoxingData.PUNCH_DATA).map(p =>
        `<button type="button" class="pchip ${escHtml(p.chip)}" onclick="appendCustomPunch('${escHtml(p.key)}')">${escHtml(p.num)} · ${escHtml(tr(p.label))}</button>`
      ).join('');
    }
    renderCustomComboSeq();
    const m = el('comboBuilderModal');
    if (m) m.classList.add('open');
  }

  function closeCustomComboModal() {
    const m = el('comboBuilderModal');
    if (m) m.classList.remove('open');
  }

  function appendCustomPunch(key) {
    if (customComboSeq.length >= 10) {
      showToast(tr('Maximum 10 actions per combo'), 'warn');
      return;
    }
    customComboSeq.push(key);
    previewPunchAudio(key);
    renderCustomComboSeq();
  }

  function clearCustomComboSeq() {
    customComboSeq = [];
    renderCustomComboSeq();
  }

  function renderCustomComboSeq() {
    const box = el('customComboSequence');
    if (!box) return;
    if (!customComboSeq.length) {
      box.innerHTML = `<span style="color:var(--text-tertiary);font-size:12px">${escHtml(tr('Tap strikes above to build a sequence'))}</span>`;
      return;
    }
    box.innerHTML = customComboSeq.map(k => {
      const m = BoxingData.getPunchMeta(k) || { chip: 'chip-jab', num: k, label: k };
      return `<span class="pchip ${escHtml(m.chip)}">${escHtml(m.num)} · ${escHtml(tr(m.label))}</span>`;
    }).join('');
  }

  function testPlayCustomCombo() {
    if (!customComboSeq.length) {
      showToast(tr('Add at least 1 strike first'), 'warn');
      return;
    }
    const prof = BoxingStorage.getActiveProfile();
    BoxingAudio.ensureAudio();
    customComboSeq.forEach((p, idx) => {
      setTimeout(() => BoxingAudio.playPunch(p, { stance: prof.stance, calloutStyle: prof.calloutStyle }), idx * 480);
    });
  }

  function saveCustomCombo() {
    if (!customComboSeq.length) {
      showToast(tr('Add at least 1 strike first'), 'warn');
      return;
    }
    const rawName = (el('customComboName') && el('customComboName').value.trim()) || '';
    const name = rawName || customComboSeq.map(k => (BoxingData.getPunchMeta(k) || { num: k }).num).join('–');
    const prof = BoxingStorage.getActiveProfile();
    const list = [...(prof.customCombos || [])];
    list.push({
      id: `custom_c_${Date.now()}`,
      name,
      notation: customComboSeq.map(k => (BoxingData.getPunchMeta(k) || { num: k }).num).join('-'),
      tier: prof.fitnessLevel || 'intermediate',
      tags: ['custom', prof.preferredStyle || 'fundamentals'],
      punches: [...customComboSeq],
      cue: tr('Fighter custom combination')
    });
    BoxingStorage.updateActiveProfile({ customCombos: list });
    closeCustomComboModal();
    if (curView === 'profile') renderProfileView();
    showToast(`${tr('Saved')}: ${name}`);
  }

  // --- Custom Workout Builder ---
  function openWorkoutBuilderModal() {
    builderBlocks = [
      { ...BoxingWorkouts.WORKOUT_DRILL_TEMPLATES[0] },
      { ...(BoxingWorkouts.WORKOUT_DRILL_TEMPLATES.find(d => d.phase === 'boxing') || BoxingWorkouts.WORKOUT_DRILL_TEMPLATES[1]) }
    ];
    if (el('customWorkoutName')) el('customWorkoutName').value = '';
    const sel = el('drillTemplateSelect');
    if (sel) {
      sel.innerHTML = BoxingWorkouts.WORKOUT_DRILL_TEMPLATES.map((d, idx) =>
        `<option value="${idx}">${escHtml(tr(d.name))} (${fmtTime(d.secs)} × ${d.rounds})</option>`
      ).join('');
    }
    renderBuilderBlocks();
    const m = el('workoutBuilderModal');
    if (m) m.classList.add('open');
  }

  function closeWorkoutBuilderModal() {
    const m = el('workoutBuilderModal');
    if (m) m.classList.remove('open');
  }

  function addDrillBlockToBuilder() {
    const sel = el('drillTemplateSelect');
    const idx = parseInt(sel ? sel.value : '0', 10) || 0;
    const tpl = BoxingWorkouts.WORKOUT_DRILL_TEMPLATES[idx];
    if (tpl) builderBlocks.push({ ...tpl });
    renderBuilderBlocks();
  }

  function removeBuilderBlock(idx) {
    builderBlocks.splice(idx, 1);
    renderBuilderBlocks();
  }

  function updateBuilderBlock(idx, field, val) {
    if (!builderBlocks[idx]) return;
    builderBlocks[idx][field] = Math.max(field === 'rounds' ? 1 : 10, parseInt(val, 10) || 60);
  }

  function renderBuilderBlocks() {
    const list = el('customWorkoutBlocks');
    if (!list) return;
    if (!builderBlocks.length) {
      list.innerHTML = `<div style="text-align:center;color:var(--text-tertiary);font-size:12px">${escHtml(tr('Add drill blocks above'))}</div>`;
      return;
    }
    list.innerHTML = builderBlocks.map((b, i) => `
      <div class="builder-block-item">
        <span><strong>${escHtml(tr(b.name))}</strong></span>
        <span style="display:flex;align-items:center;gap:6px">
          <input type="number" class="builder-num" min="1" max="15" value="${b.rounds || 1}" onchange="updateBuilderBlock(${i},'rounds',this.value)"> rds ×
          <input type="number" class="builder-num" min="10" max="900" step="15" value="${b.secs || 60}" onchange="updateBuilderBlock(${i},'secs',this.value)"> s
          <button type="button" class="info-btn" onclick="removeBuilderBlock(${i})">✕</button>
        </span>
      </div>
    `).join('');
  }

  function saveCustomWorkout() {
    if (!builderBlocks.length) {
      showToast(tr('Add at least 1 exercise block'), 'warn');
      return;
    }
    const name = (el('customWorkoutName') && el('customWorkoutName').value.trim()) || `Custom Camp ${new Date().toLocaleDateString()}`;
    const lvl = (el('customWorkoutLevel') && el('customWorkoutLevel').value) || 'intermediate';
    const prof = BoxingStorage.getActiveProfile();
    const list = [...(prof.customWorkouts || [])];
    list.push({
      id: `custom_wo_${Date.now()}`,
      category: 'custom',
      level: lvl,
      label: name,
      subtitle: `${builderBlocks.length} ${tr('drills')} · ${tr('Custom session')}`,
      pill: 'pa',
      color: '#FF2E2E',
      exercises: builderBlocks.map(b => ({ ...b }))
    });
    BoxingStorage.updateActiveProfile({ customWorkouts: list });
    closeWorkoutBuilderModal();
    activeWorkoutCategory = 'custom';
    showView('workouts');
    showToast(`${tr('Saved')}: ${name}`);
  }

  function deleteCustomWorkout(id) {
    const prof = BoxingStorage.getActiveProfile();
    const list = (prof.customWorkouts || []).filter(w => w.id !== id);
    BoxingStorage.updateActiveProfile({ customWorkouts: list });
    renderWorkoutsView();
    showToast(tr('Workout deleted'));
  }

  // --- Profile Modal ---
  function openProfileModal(mode) {
    profileModalMode = mode || 'add';
    const prof = BoxingStorage.getActiveProfile();
    if (el('profileNameInput')) el('profileNameInput').value = profileModalMode === 'rename' ? prof.name : '';
    if (el('profileStanceInput')) el('profileStanceInput').value = prof.stance || 'orthodox';
    const m = el('profileModal');
    if (m) m.classList.add('open');
  }

  function closeProfileModal() {
    const m = el('profileModal');
    if (m) m.classList.remove('open');
    updateTopbarChrome();
  }

  function saveProfileModal() {
    const name = ((el('profileNameInput') || {}).value || '').trim();
    const stance = ((el('profileStanceInput') || {}).value || 'orthodox');
    if (!name) {
      showToast(tr('Please enter a fighter name'), 'warn');
      return;
    }
    if (profileModalMode === 'rename') {
      BoxingStorage.renameActiveProfile(name);
      BoxingStorage.updateActiveProfile({ stance });
    } else {
      BoxingStorage.addProfile(name, stance);
    }
    closeProfileModal();
    updateTopbarChrome();
    showView(curView);
    showToast(`${tr('Profile')}: ${name}`);
  }

  // =========================================================================
  // Keyboard Shortcuts & Initialization
  // =========================================================================
  document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (e.code === 'Space' && (curView === 'arena' || focusModeActive)) {
      e.preventDefault();
      toggleTimer();
    } else if (e.code === 'Escape') {
      if (focusModeActive) exitFocusMode();
      closeQuickTimerModal();
      closeCustomComboModal();
      closeWorkoutBuilderModal();
      closeProfileModal();
    }
  });

  function initApp() {
    BoxingStorage.initCloudSync(() => {
      updateTopbarChrome();
      showView(curView);
    });

    if (typeof window.applyTranslations === 'function') {
      window.applyTranslations();
    }

    updateTopbarChrome();

    if (window.location.hash === '#trx') {
      activeWorkoutCategory = 'trx';
      showView('workouts');
    } else {
      showView('home');
    }

    if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  // Expose public handlers for HTML inline events
  Object.assign(window, {
    showView,
    openCategoryFromHome,
    openQuickTimerModal,
    closeQuickTimerModal,
    applyQuickPreset,
    startQuickTimerFromSettings,
    toggleQuickTimerPause,
    stopQuickTimer,
    setSessionDuration,
    toggleStanceQuick,
    toggleWakeLock,
    changeLanguage,
    handleUserSelect,
    toggleTodayCompleted,
    toggleGearFilter,
    setWorkoutCategory,
    setWorkoutLevel,
    selectTrxPhase,
    startTrxWorkout,
    launchWorkoutById,
    toggleInfo,
    openCustomComboModal,
    closeCustomComboModal,
    appendCustomPunch,
    clearCustomComboSeq,
    testPlayCustomCombo,
    saveCustomCombo,
    deleteCustomCombo,
    previewComboById,
    openWorkoutBuilderModal,
    closeWorkoutBuilderModal,
    addDrillBlockToBuilder,
    removeBuilderBlock,
    updateBuilderBlock,
    saveCustomWorkout,
    deleteCustomWorkout,
    openProfileModal,
    closeProfileModal,
    saveProfileModal,
    skipCornerRest,
    selectSessionRpe,
    finishAndReturnCamp,
    prevEx,
    toggleTimer,
    nextEx,
    jumpToEx,
    resetCurrentExercise,
    enterFocusMode,
    exitFocusMode,
    toggleReflexMode,
    toggleCoachDrawer,
    setAudioMode,
    toggleCalloutStyle,
    toggleAutoAdvance,
    updateSpeed,
    toggleRestMode,
    updatePause,
    updateRestMin,
    updateRestMax,
    previewPunchAudio,
    previewTechAudio,
    shiftMonth,
    selectCalendarDay,
    toggleDayCompleteFromCal,
    setProfileSubTab,
    setTechCategory,
    setComboStyle,
    setFighterPref,
    setLevel,
    toggleUserEquipment,
    autoAssignDays,
    saveSchedule,
    exportDataJSON,
    importDataJSON
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
