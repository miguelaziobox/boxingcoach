/* ── BOXING COACH PRO v3.0 — LOCAL-FIRST STORAGE, ANALYTICS & CLOUD SYNC ── */
(function (global) {
  'use strict';

  const STORAGE_KEY_V3 = 'boxingCoach_v3';
  const SUPABASE_URL = typeof localStorage !== 'undefined' ? (localStorage.getItem('boxingCoach_supabaseUrl') || '') : '';
  const SUPABASE_ANON_KEY = typeof localStorage !== 'undefined' ? (localStorage.getItem('boxingCoach_supabaseKey') || '') : '';

  let sbClient = null;
  try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY && global.supabase && typeof global.supabase.createClient === 'function') {
      sbClient = global.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  } catch (e) {
    sbClient = null;
  }

  function uuidV4() {
    if (global.crypto && typeof global.crypto.getRandomValues === 'function') {
      return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
        (c ^ (global.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
      );
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function todayIso() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function dayKey(y, m, d) {
    return `${y}-${m}-${d}`;
  }

  function dateToDayKey(date) {
    return dayKey(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function parseDayKey(dk) {
    if (!dk || typeof dk !== 'string') return null;
    const parts = dk.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    return new Date(parts[0], parts[1], parts[2]);
  }

  const DEFAULT_EQUIPMENT = ['heavy_bag', 'jump_rope', 'treadmill', 'gym_machine', 'trx'];

  function createDefaultProfile(overrides) {
    const base = {
      id: '1',
      name: 'Fighter 1',
      stance: 'orthodox',
      fitnessLevel: 'intermediate',
      preferredStyle: 'all',
      calloutStyle: 'names',
      autoAdvance: true,
      defaultRestSecs: 60,
      sessionDuration: 60,
      audioMode: 'both',
      comboSpeed: 1.0,
      comboPauseMs: 3000,
      restMode: 'fixed',
      restMinMs: 1000,
      restMaxMs: 5000,
      equipment: [...DEFAULT_EQUIPMENT],
      workoutDays: [1, 3, 5],
      dayOrder: ['A', 'B', 'C', 'D'],
      activeProgramId: 'classic',
      programStartDate: todayIso(),
      customCombos: [],
      customWorkouts: [],
      workoutLogs: [],
      completed: {},
      supabaseProfileId: uuidV4()
    };
    return Object.assign(base, overrides || {});
  }

  function normalizeProfile(raw) {
    const def = createDefaultProfile();
    const p = Object.assign({}, def, raw || {});
    if (!Array.isArray(p.equipment)) p.equipment = [...DEFAULT_EQUIPMENT];
    if (!Array.isArray(p.workoutDays) || p.workoutDays.length === 0) p.workoutDays = [1, 3, 5];
    if (!Array.isArray(p.dayOrder) || p.dayOrder.length === 0) p.dayOrder = ['A', 'B', 'C', 'D'];
    if (!Array.isArray(p.customCombos)) p.customCombos = [];
    if (!Array.isArray(p.customWorkouts)) p.customWorkouts = [];
    if (!Array.isArray(p.workoutLogs)) p.workoutLogs = [];
    if (!p.completed || typeof p.completed !== 'object') p.completed = {};
    if (!['orthodox', 'southpaw'].includes(p.stance)) p.stance = 'orthodox';
    if (!['beginner', 'intermediate', 'advanced'].includes(p.fitnessLevel)) p.fitnessLevel = 'intermediate';
    if (!['names', 'numbers'].includes(p.calloutStyle)) p.calloutStyle = 'names';
    if (!['both', 'sfx', 'voice', 'silent'].includes(p.audioMode)) p.audioMode = 'both';
    p.sessionDuration = [60, 90, 120].includes(Number(p.sessionDuration)) ? Number(p.sessionDuration) : 60;
    if (!p.supabaseProfileId) p.supabaseProfileId = uuidV4();
    if (!p.programStartDate) p.programStartDate = todayIso();
    return p;
  }

  function migrateFromLegacy() {
    let legacyProfiles = null;
    try {
      legacyProfiles = JSON.parse(localStorage.getItem('boxingProfiles'));
    } catch (e) {
      legacyProfiles = null;
    }

    const legacyActiveId = localStorage.getItem('activeUserId') || '1';
    const legacyLevel = localStorage.getItem('fitnessLevel') || 'intermediate';
    const legacyProg = localStorage.getItem('activeProgramId') || 'classic';
    const legacyStart = localStorage.getItem('programStartDate') || todayIso();
    const legacyAudio = localStorage.getItem('boxingAudioMode') || 'both';
    const legacyPause = parseInt(localStorage.getItem('comboPauseMs') || '3000', 10);
    const legacyRestMode = localStorage.getItem('restMode') || 'fixed';
    const legacyMin = parseInt(localStorage.getItem('restMinMs') || '1000', 10);
    const legacyMax = parseInt(localStorage.getItem('restMaxMs') || '5000', 10);
    const legacySbId = localStorage.getItem('supabase_profile_id');

    let profiles;
    if (Array.isArray(legacyProfiles) && legacyProfiles.length > 0) {
      profiles = legacyProfiles.map((lp, idx) =>
        normalizeProfile({
          id: String(lp.id || idx + 1),
          name: lp.name || `Fighter ${idx + 1}`,
          fitnessLevel: legacyLevel,
          activeProgramId: legacyProg,
          programStartDate: legacyStart,
          audioMode: legacyAudio,
          comboPauseMs: isNaN(legacyPause) ? 3000 : legacyPause,
          restMode: legacyRestMode,
          restMinMs: isNaN(legacyMin) ? 1000 : legacyMin,
          restMaxMs: isNaN(legacyMax) ? 5000 : legacyMax,
          customCombos: Array.isArray(lp.customCombos) ? lp.customCombos : [],
          supabaseProfileId: lp.supabaseProfileId || (idx === 0 && legacySbId ? legacySbId : uuidV4())
        })
      );
    } else {
      profiles = [
        normalizeProfile({
          id: '1',
          name: 'Fighter 1',
          fitnessLevel: legacyLevel,
          activeProgramId: legacyProg,
          programStartDate: legacyStart,
          audioMode: legacyAudio,
          supabaseProfileId: legacySbId || uuidV4()
        })
      ];
    }

    const activeUserId = profiles.some(p => p.id === legacyActiveId) ? legacyActiveId : profiles[0].id;
    return {
      version: 3,
      lang: localStorage.getItem('lang') || 'en',
      activeUserId,
      profiles
    };
  }

  function loadStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_V3);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.profiles) && parsed.profiles.length > 0) {
          parsed.profiles = parsed.profiles.map(normalizeProfile);
          if (!parsed.profiles.some(p => p.id === parsed.activeUserId)) {
            parsed.activeUserId = parsed.profiles[0].id;
          }
          if (!parsed.lang) parsed.lang = localStorage.getItem('lang') || 'en';
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Storage load fallback:', e);
    }
    const migrated = migrateFromLegacy();
    saveStore(migrated);
    return migrated;
  }

  function saveStore(store) {
    try {
      localStorage.setItem(STORAGE_KEY_V3, JSON.stringify(store));
      if (store.lang) localStorage.setItem('lang', store.lang);
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }

  let appStore = loadStore();

  function getStore() {
    return appStore;
  }

  function getActiveProfile() {
    let p = appStore.profiles.find(item => item.id === appStore.activeUserId);
    if (!p) {
      p = appStore.profiles[0];
      appStore.activeUserId = p.id;
    }
    return p;
  }

  function updateActiveProfile(patch) {
    const p = getActiveProfile();
    Object.assign(p, patch || {});
    saveStore(appStore);
    return p;
  }

  function addProfile(name, stance) {
    const cleanName = (name || '').trim().slice(0, 20) || `Fighter ${appStore.profiles.length + 1}`;
    const id = String(Date.now());
    const prof = createDefaultProfile({
      id,
      name: cleanName,
      stance: stance === 'southpaw' ? 'southpaw' : 'orthodox'
    });
    appStore.profiles.push(prof);
    appStore.activeUserId = id;
    saveStore(appStore);
    return prof;
  }

  function renameActiveProfile(name) {
    const clean = (name || '').trim().slice(0, 20);
    if (!clean) return getActiveProfile();
    const p = updateActiveProfile({ name: clean });
    syncProfileToCloud(p);
    return p;
  }

  function switchProfile(id) {
    const found = appStore.profiles.find(p => p.id === String(id));
    if (!found) return getActiveProfile();
    appStore.activeUserId = found.id;
    saveStore(appStore);
    return found;
  }

  function getAssignedWorkoutCode(profile, dateObj) {
    const p = profile || getActiveProfile();
    const dow = dateObj.getDay();
    const idx = p.workoutDays.indexOf(dow);
    if (idx === -1) return 'R';
    return p.dayOrder[idx % p.dayOrder.length] || 'R';
  }

  /* ── ACCURATE CROSS-MONTH STREAK CALCULATOR ── */
  function calculateStreaks(profile, refDate) {
    const p = profile || getActiveProfile();
    const completedMap = p.completed || {};
    const now = refDate ? new Date(refDate) : new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Find earliest completed date or 365 days back
    let earliest = new Date(todayMidnight);
    earliest.setDate(earliest.getDate() - 365);

    Object.keys(completedMap).forEach(dk => {
      if (!completedMap[dk]) return;
      const d = parseDayKey(dk);
      if (d && d < earliest) earliest = d;
    });

    // Forward scan for Best Streak
    let bestStreak = 0;
    let running = 0;
    const cursor = new Date(earliest);
    while (cursor <= todayMidnight) {
      const dk = dateToDayKey(cursor);
      const isDone = !!completedMap[dk];
      const scheduled = getAssignedWorkoutCode(p, cursor) !== 'R';
      const isToday = cursor.getTime() === todayMidnight.getTime();

      if (isDone) {
        running++;
        if (running > bestStreak) bestStreak = running;
      } else if (scheduled && !isToday) {
        running = 0;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    // Backward scan for Current Active Streak
    let currentStreak = 0;
    const back = new Date(todayMidnight);
    for (let i = 0; i < 400; i++) {
      const dk = dateToDayKey(back);
      const isDone = !!completedMap[dk];
      const scheduled = getAssignedWorkoutCode(p, back) !== 'R';
      if (isDone) {
        currentStreak++;
      } else if (scheduled && i > 0) {
        break;
      }
      back.setDate(back.getDate() - 1);
      if (back < earliest && currentStreak === 0) break;
    }

    if (currentStreak > bestStreak) bestStreak = currentStreak;
    return { currentStreak, bestStreak };
  }

  /* ── ANALYTICS & 12-WEEK ACTIVITY HEATMAP ── */
  function getFighterStats(profile) {
    const p = profile || getActiveProfile();
    const logs = p.workoutLogs || [];
    const completedKeys = Object.keys(p.completed || {}).filter(k => p.completed[k]);
    const loggedDateKeys = new Set(logs.map(l => l.dateKey).filter(Boolean));

    // Legacy completed sessions without detailed logs get realistic 45-min / 240-punch estimates
    let legacyOnlySessions = 0;
    completedKeys.forEach(dk => {
      if (!loggedDateKeys.has(dk)) legacyOnlySessions++;
    });

    let logSecs = 0;
    let logPunches = 0;
    let logRounds = 0;
    let trxSessions = 0;
    let maxRoundsSingle = 0;
    let maxDurationSingle = 0;

    logs.forEach(log => {
      const d = Number(log.durationSecs) || 0;
      const pu = Number(log.punches) || 0;
      const rd = Number(log.rounds) || 0;
      logSecs += d;
      logPunches += pu;
      logRounds += rd;
      if (rd > maxRoundsSingle) maxRoundsSingle = rd;
      if (d > maxDurationSingle) maxDurationSingle = d;
      if (log.category === 'trx' || String(log.workoutId || '').startsWith('TRX')) {
        trxSessions++;
      }
    });

    const totalSessions = Math.max(completedKeys.length, logs.length + legacyOnlySessions);
    const totalSecs = logSecs + legacyOnlySessions * 2700;
    const totalHours = +(totalSecs / 3600).toFixed(1);
    const totalPunches = logPunches + legacyOnlySessions * 240;
    const totalRounds = logRounds + legacyOnlySessions * 6;
    const streaks = calculateStreaks(p);

    return {
      totalSessions,
      totalSecs,
      totalHours,
      totalPunches,
      totalRounds,
      trxSessions,
      maxRoundsSingle,
      maxDurationSingle,
      currentStreak: streaks.currentStreak,
      bestStreak: streaks.bestStreak
    };
  }

  function buildActivityHeatmap(profile, weeks = 12) {
    const p = profile || getActiveProfile();
    const totalDays = weeks * 7;
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // Align end of grid to Saturday of current week or today
    const end = new Date(todayMidnight);
    const dayLogs = {};
    (p.workoutLogs || []).forEach(l => {
      if (!l.dateKey) return;
      if (!dayLogs[l.dateKey]) dayLogs[l.dateKey] = { count: 0, punches: 0, secs: 0 };
      dayLogs[l.dateKey].count++;
      dayLogs[l.dateKey].punches += Number(l.punches) || 0;
      dayLogs[l.dateKey].secs += Number(l.durationSecs) || 0;
    });

    const cells = [];
    const start = new Date(end);
    start.setDate(end.getDate() - (totalDays - 1));
    // Rewind to Sunday for clean 7-row columns
    while (start.getDay() !== 0) {
      start.setDate(start.getDate() - 1);
    }

    const cur = new Date(start);
    while (cur <= end) {
      const dk = dateToDayKey(cur);
      const isCompleted = !!(p.completed && p.completed[dk]);
      const logInfo = dayLogs[dk];
      const count = logInfo ? logInfo.count : (isCompleted ? 1 : 0);
      const punches = logInfo ? logInfo.punches : (isCompleted ? 240 : 0);
      let level = 0;
      if (count >= 2 || punches >= 500) level = 4;
      else if (punches >= 300 || (logInfo && logInfo.secs >= 2400)) level = 3;
      else if (count === 1 && punches > 0) level = 2;
      else if (isCompleted) level = 2;

      cells.push({
        dateKey: dk,
        date: new Date(cur),
        count,
        punches,
        level
      });
      cur.setDate(cur.getDate() + 1);
    }
    return cells;
  }

  /* ── ACHIEVEMENTS & BADGES ── */
  const BADGE_DEFS = [
    {
      id: 'first_bell',
      name: 'First Bell',
      icon: '🔔',
      desc: 'Complete 1 full training session',
      target: 1,
      progress: (s) => s.totalSessions
    },
    {
      id: 'streak_3',
      name: '3-Session Streak',
      icon: '🔥',
      desc: 'Hit 3 scheduled sessions in a row',
      target: 3,
      progress: (s) => s.bestStreak
    },
    {
      id: 'streak_7',
      name: 'Iron Discipline',
      icon: '⚡',
      desc: 'Reach a 7-session fight camp streak',
      target: 7,
      progress: (s) => s.bestStreak
    },
    {
      id: 'heavy_hitter',
      name: 'Heavy Hitter',
      icon: '🥊',
      desc: 'Throw 2,500 tracked punches',
      target: 2500,
      progress: (s) => s.totalPunches
    },
    {
      id: 'golden_gloves',
      name: 'Golden Gloves',
      icon: '👑',
      desc: 'Throw 10,000 tracked punches',
      target: 10000,
      progress: (s) => s.totalPunches
    },
    {
      id: 'title_contender',
      name: 'Title Contender',
      icon: '💥',
      desc: 'Throw 25,000 tracked punches',
      target: 25000,
      progress: (s) => s.totalPunches
    },
    {
      id: 'centurion',
      name: 'Ring Veteran',
      icon: '🏆',
      desc: 'Complete 20 total training sessions',
      target: 20,
      progress: (s) => s.totalSessions
    },
    {
      id: 'trx_warrior',
      name: 'Spine & Core Guard',
      icon: '🏋️',
      desc: 'Complete 5 TRX Core & Back sessions',
      target: 5,
      progress: (s) => s.trxSessions
    },
    {
      id: 'combo_architect',
      name: 'Combo Architect',
      icon: '🧠',
      desc: 'Build 3 custom combos or workouts',
      target: 3,
      progress: (_, p) => (p.customCombos?.length || 0) + (p.customWorkouts?.length || 0)
    },
    {
      id: 'championship_rounds',
      name: 'Championship Rounds',
      icon: '⏱️',
      desc: 'Finish a 6+ round or 35+ min session',
      target: 1,
      progress: (s) => (s.maxRoundsSingle >= 6 || s.maxDurationSingle >= 2100 ? 1 : 0)
    }
  ];

  function getBadgesProgress(profile) {
    const p = profile || getActiveProfile();
    const stats = getFighterStats(p);
    return BADGE_DEFS.map(b => {
      const current = Math.max(0, b.progress(stats, p));
      const pct = Math.min(100, Math.round((current / b.target) * 100));
      return {
        id: b.id,
        name: b.name,
        icon: b.icon,
        desc: b.desc,
        target: b.target,
        current: Math.min(current, b.target),
        rawCurrent: current,
        pct,
        unlocked: current >= b.target
      };
    });
  }

  /* ── WORKOUT LOGGING & COMPLETION ── */
  function logWorkoutCompletion(entry) {
    const p = getActiveProfile();
    const dk = entry.dateKey || dateToDayKey(new Date());
    const log = {
      id: String(Date.now()),
      dateKey: dk,
      timestamp: new Date().toISOString(),
      workoutId: entry.workoutId || 'A',
      label: entry.label || 'Boxing Session',
      category: entry.category || 'camp',
      durationSecs: Number(entry.durationSecs) || 0,
      rounds: Number(entry.rounds) || 0,
      punches: Number(entry.punches) || 0,
      rpe: entry.rpe || 'solid'
    };
    p.workoutLogs.push(log);
    p.completed[dk] = true;
    saveStore(appStore);
    syncCompletionToCloud(p, dk, true);
    return log;
  }

  function updateLastLogRpe(logId, rpe) {
    const p = getActiveProfile();
    const found = (p.workoutLogs || []).find(l => l.id === logId);
    if (found) {
      found.rpe = rpe;
      saveStore(appStore);
    }
    return found;
  }

  function toggleDayCompleted(dk) {
    const p = getActiveProfile();
    const currentlyDone = !!p.completed[dk];
    if (currentlyDone) {
      delete p.completed[dk];
      saveStore(appStore);
      syncCompletionToCloud(p, dk, false);
      return false;
    } else {
      p.completed[dk] = true;
      saveStore(appStore);
      syncCompletionToCloud(p, dk, true);
      return true;
    }
  }

  /* ── OPTIONAL NON-BLOCKING SUPABASE SYNC ── */
  async function syncProfileToCloud(profile) {
    if (!sbClient || !profile || !profile.supabaseProfileId) return;
    try {
      await sbClient.from('profiles').upsert({
        id: profile.supabaseProfileId,
        name: profile.name,
        language: appStore.lang || 'en',
        fitness_level: profile.fitnessLevel,
        program_start_date: profile.programStartDate,
        active_program_id: profile.activeProgramId,
        active_program: 'classic'
      }, { onConflict: 'id' });
    } catch (e) {
      // Offline / cloud optional
    }
  }

  async function syncCompletionToCloud(profile, dk, isDone) {
    if (!sbClient || !profile || !profile.supabaseProfileId) return;
    try {
      if (isDone) {
        await sbClient.from('workouts_completed').insert({
          profile_id: profile.supabaseProfileId,
          day_key: dk
        });
      } else {
        await sbClient.from('workouts_completed').delete().match({
          profile_id: profile.supabaseProfileId,
          day_key: dk
        });
      }
    } catch (e) {
      // Offline / cloud optional
    }
  }

  async function initCloudSync(onUpdate) {
    if (!sbClient) return;
    const p = getActiveProfile();
    try {
      await syncProfileToCloud(p);
      const { data } = await sbClient
        .from('workouts_completed')
        .select('day_key')
        .eq('profile_id', p.supabaseProfileId);
      if (Array.isArray(data) && data.length > 0) {
        let changed = false;
        data.forEach(row => {
          if (row && row.day_key && !p.completed[row.day_key]) {
            p.completed[row.day_key] = true;
            changed = true;
          }
        });
        if (changed) {
          saveStore(appStore);
          if (typeof onUpdate === 'function') onUpdate();
        }
      }
    } catch (e) {
      // Non-blocking fallback
    }
  }

  /* ── BACKUP EXPORT & IMPORT (V3 + V2 COMPATIBLE) ── */
  function buildExportPayload() {
    return {
      app: 'BoxingCoachPRO',
      version: '3.0.0',
      exportDate: new Date().toISOString(),
      store: appStore
    };
  }

  function importBackupObject(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid backup file format.');
    }
    // V3 format
    if (data.store && Array.isArray(data.store.profiles) && data.store.profiles.length > 0) {
      appStore = {
        version: 3,
        lang: data.store.lang || appStore.lang || 'en',
        activeUserId: data.store.activeUserId || data.store.profiles[0].id,
        profiles: data.store.profiles.map(normalizeProfile)
      };
      if (!appStore.profiles.some(p => p.id === appStore.activeUserId)) {
        appStore.activeUserId = appStore.profiles[0].id;
      }
      saveStore(appStore);
      return appStore;
    }

    // Legacy V2 format migration
    if (Array.isArray(data.profiles) && data.profiles.length > 0) {
      const migratedProfiles = data.profiles.map((lp, idx) =>
        normalizeProfile({
          id: String(lp.id || idx + 1),
          name: lp.name || `Fighter ${idx + 1}`,
          fitnessLevel: data.fitnessLevel || 'intermediate',
          activeProgramId: data.activeProgramId || 'classic',
          programStartDate: data.programStartDate || todayIso(),
          workoutDays: Array.isArray(data.workoutDays) ? data.workoutDays : [1, 3, 5],
          dayOrder: Array.isArray(data.dayOrder) ? data.dayOrder : ['A', 'B', 'C', 'D'],
          customCombos: Array.isArray(lp.customCombos) ? lp.customCombos : [],
          completed: (idx === 0 || String(lp.id) === String(data.activeUserId)) && data.completedWorkouts
            ? data.completedWorkouts
            : {},
          supabaseProfileId: lp.supabaseProfileId || uuidV4()
        })
      );
      appStore = {
        version: 3,
        lang: appStore.lang || 'en',
        activeUserId: migratedProfiles.some(p => p.id === String(data.activeUserId))
          ? String(data.activeUserId)
          : migratedProfiles[0].id,
        profiles: migratedProfiles
      };
      saveStore(appStore);
      return appStore;
    }

    throw new Error('Unrecognized Boxing Coach backup structure.');
  }

  const RANK_TIERS = [
    { name: 'Novice',     minXp: 0 },
    { name: 'Prospect',   minXp: 500 },
    { name: 'Amateur',    minXp: 1500 },
    { name: 'Contender',  minXp: 4000 },
    { name: 'Champion',   minXp: 10000 },
    { name: 'Undisputed', minXp: 25000 }
  ];

  function getFighterRank(stats) {
    const s = stats || getFighterStats();
    const xp = (s.totalSessions || 0) * 120 + (s.totalRounds || 0) * 15 + Math.floor((s.totalPunches || 0) / 10);
    let idx = 0;
    for (let i = 0; i < RANK_TIERS.length; i++) {
      if (xp >= RANK_TIERS[i].minXp) idx = i;
    }
    const cur = RANK_TIERS[idx];
    const nxt = RANK_TIERS[idx + 1] || null;
    const pct = nxt
      ? Math.min(100, Math.round(((xp - cur.minXp) / (nxt.minXp - cur.minXp)) * 100))
      : 100;
    return {
      rank: cur.name,
      nextRank: nxt ? nxt.name : null,
      xp,
      nextXp: nxt ? nxt.minXp : cur.minXp,
      pct
    };
  }

  function estimateSessionKcal(durationSecs, category) {
    const mins = Math.max(0, Number(durationSecs) || 0) / 60;
    let kcalPerMin = 9.5;
    if (category === 'heavy_bag' || category === 'full_camp' || category === 'conditioning') kcalPerMin = 10.8;
    else if (category === 'cardio_rope') kcalPerMin = 10.2;
    else if (category === 'gym_machine') kcalPerMin = 8.4;
    else if (category === 'shadowboxing') kcalPerMin = 8.2;
    else if (category === 'trx') kcalPerMin = 6.2;
    return Math.round(mins * kcalPerMin);
  }

  function getWeeklyGoalProgress(profile) {
    const p = profile || getActiveProfile();
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    let doneThisWeek = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dk = dateToDayKey(d);
      if (p.completed && p.completed[dk]) doneThisWeek++;
    }
    const target = Math.max(1, (p.workoutDays || []).length || 3);
    const pct = Math.min(100, Math.round((doneThisWeek / target) * 100));
    return { doneThisWeek, target, pct };
  }

  function toggleEquipment(gearId) {
    const p = getActiveProfile();
    const list = Array.isArray(p.equipment) ? [...p.equipment] : [...DEFAULT_EQUIPMENT];
    const idx = list.indexOf(gearId);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(gearId);
    p.equipment = list;
    saveStore(appStore);
    return p.equipment;
  }

  global.BoxingStorage = {
    STORAGE_KEY_V3,
    DEFAULT_EQUIPMENT,
    RANK_TIERS,
    dayKey,
    dateToDayKey,
    parseDayKey,
    todayIso,
    getStore,
    saveStore,
    getActiveProfile,
    updateActiveProfile,
    toggleEquipment,
    addProfile,
    renameActiveProfile,
    switchProfile,
    getAssignedWorkoutCode,
    calculateStreaks,
    getFighterStats,
    getFighterRank,
    estimateSessionKcal,
    getWeeklyGoalProgress,
    buildActivityHeatmap,
    getBadgesProgress,
    logWorkoutCompletion,
    updateLastLogRpe,
    toggleDayCompleted,
    syncProfileToCloud,
    initCloudSync,
    buildExportPayload,
    importBackupObject
  };
})(typeof window !== 'undefined' ? window : globalThis);
