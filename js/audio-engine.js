/* ── BOXING COACH PRO v3.0 — RINGSIDE AUDIO & VOICE ENGINE ── */
(function (global) {
  'use strict';

  const KNOWN_PUNCH_AUDIO = {
    'jab':            'jab.mp3',
    'cross':          'cross.mp3',
    'lead-hook':      'L_Hook.mp3',
    'rear-hook':      'R_Hook.mp3',
    'lead-upper':     'L_Upper.mp3',
    'rear-upper':     'R_Upper.mp3',
    'body-jab':       'Body_Jab.mp3',
    'body-cross':     'Body_Cross.mp3',
    'body-lead-hook': 'Body_Lead_Hook.mp3',
    'body-rear-hook': 'Body_Rear_Hook.mp3',
    'slip-l':         'slip.mp3',
    'slip-r':         'slip.mp3',
    'roll':           'Roll.mp3',
    'feint':          'Feint.mp3'
  };

  const SOUTHPAW_PUNCH_AUDIO_OVERRIDE = {
    'lead-hook':  'R_Hook.mp3',
    'rear-hook':  'L_Hook.mp3',
    'lead-upper': 'R_Upper.mp3',
    'rear-upper': 'L_Upper.mp3'
  };

  const KNOWN_TIMER_AUDIO = {
    '1': '1.mp3',
    '2': '2.mp3',
    '3': '3.mp3',
    '4': '4.mp3',
    '5': '5.mp3',
    '10': '10.mp3',
    '30 seconds': '30 seconds.mp3',
    '40 seconds': '40 seconds.mp3',
    '45 seconds': '45 seconds.mp3',
    '1 minute': '1 minute.mp3',
    '1 minute 30 seconds': '1 minute 30 seconds.mp3',
    '2 minutes': '2 minutes.mp3',
    '2 minutes and 30 seconds': '2 minutes and 30 seconds.mp3',
    '3 minutes': '3 minutes.mp3',
    '4 minutes': '4 minutes.mp3',
    '5 minutes': '5 minutes.mp3'
  };

  const KNOWN_EX_AUDIO = {
    'Rest': 'rest.mp3',
    'Rest between rounds': 'rest.mp3',
    'Jump rope': 'jump_rope.mp3',
    'Jump rope – Boxer Skip': 'jump_rope.mp3',
    'Jump rope – Ali Shuffle & Footwork': 'jump_rope.mp3',
    'Jump rope – Fast Singles': 'Jump_rope_\u2013_fast_singles.mp3',
    'Jump rope – 30/30 High-Knee Sprint Intervals': 'Jump_rope_\u2013_fast_singles.mp3',
    'Jump rope – Double Unders & Sprints': 'Jump_rope_\u2013_double_unders.mp3',
    'Arm Circles, Shoulder & Spine Prep': 'Arm_circles__shoulder_rolls.mp3',
    'Neck, Wrist & Hip Mobilisation': 'Neck_&_wrist_mobilisation.mp3',
    'Dynamic Shadow Flow & Footwork': 'Shadowboxing__footwork.mp3',
    'Shadowboxing – 1-2 Range & Stance': 'Shadowboxing_\u2013_full_combos.mp3',
    'Shadowboxing – 1-2-3 Rotational Flow': 'Shadowboxing_\u2013_1-2-3_combos.mp3',
    'Shadowboxing – Cuban Pendulum & Angles': 'Shadowboxing__ringcraft.mp3',
    'Shadowboxing – Peek-a-Boo Slips & Rolls': 'Shadowboxing_\u2013_slips_and_rolls.mp3',
    'Shadowboxing – Defensive Counters': 'Shadowboxing_\u2013_defensive.mp3',
    'Shadowboxing – Rapid Hand Speed': 'Shadowboxing_\u2013_full_speed.mp3',
    'Shadowboxing – Championship Ghost Sparring': 'Shadowboxing_\u2013_full_combos.mp3',
    'Shadowboxing – Morning Ignition': 'Shadowboxing_footwork.mp3',
    'Footwork-Only Pendulum & Box Drill': 'Shadowboxing__footwork.mp3',
    'Heavy Bag – Jab Command & Range': 'Heavy_bag_\u2013_Round_1.mp3',
    'Heavy Bag – 1-2-3 Foundation Combos': 'Heavy_bag_\u2013_Round_3.mp3',
    'Heavy Bag – Guard & Body Basics': 'Heavy_bag_\u2013_body_shots.mp3',
    'Heavy Bag – Power Impact & Weight Transfer': 'Heavy_bag_\u2013_power_shots.mp3',
    'Heavy Bag – Mexican Body Snatcher': 'Heavy_bag_\u2013_Body_Snatcher.mp3',
    'Heavy Bag – Counter-Puncher’s Trap': 'Heavy_bag_\u2013_Def._Counters.mp3',
    'Heavy Bag – Check Hooks & Pivot Exits': 'Heavy_bag__Check_Hooks.mp3',
    'Heavy Bag – 30/30 Championship Burnout': 'Heavy_bag_\u2013_Burnout.mp3',
    'Heavy Bag – Rapid Hand Speed Flurries': 'Speed_target_\u2013_rapid_jabs.mp3',
    'Heavy Bag – Title Fight Simulation': 'Heavy_bag_\u2013_Technical_HIIT.mp3',
    'HIIT – 10-Punch Burst & Squat': 'HIIT_\u2013_10-punch_burst__squat.mp3',
    'Championship Burpees': 'Burpees.mp3',
    'Conditioning – Sprawls & Guard Up': 'Conditioning__Sprawls.mp3',
    'Rotational Russian Twists': 'Russian_twists.mp3',
    'Forearm Plank & Side Plank': 'Plank.mp3',
    'Cool-Down Static Stretch & Decompression': 'Cool-down_stretch.mp3'
  };

  let audioCtx = null;
  let noiseBuffer = null;
  let currentExAudio = null;
  const punchAudioCache = {};

  function getMode() {
    if (global.BoxingStorage) {
      return global.BoxingStorage.getActiveProfile().audioMode || 'both';
    }
    return localStorage.getItem('boxingAudioMode') || 'both';
  }

  function triggerHaptic(pattern) {
    if (global.navigator && typeof global.navigator.vibrate === 'function') {
      try {
        global.navigator.vibrate(pattern || [35]);
      } catch (e) {}
    }
  }

  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = global.AudioContext || global.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    if (audioCtx && !noiseBuffer) {
      const len = Math.floor(audioCtx.sampleRate * 0.4);
      noiseBuffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    return audioCtx;
  }

  /* ── SYNTHETIC RINGSIDE BRASS BELL ── */
  function singleBellStrike(ctx, startTime, gainScale) {
    const partials = [
      { f: 620, g: 0.42, d: 1.55 },
      { f: 1245, g: 0.28, d: 1.25 },
      { f: 1872, g: 0.20, d: 0.95 },
      { f: 2498, g: 0.14, d: 0.72 },
      { f: 3320, g: 0.08, d: 0.45 }
    ];
    partials.forEach(p => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.f, startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(p.g * (gainScale || 1), startTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0005, startTime + p.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + p.d + 0.05);
    });
  }

  function playBell(strikes) {
    const count = strikes || 1;
    triggerHaptic(count > 1 ? [120, 60, 120, 60, 120] : [130]);
    if (getMode() === 'silent') return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    for (let i = 0; i < count; i++) {
      singleBellStrike(ctx, now + i * 0.23, i === 0 ? 1 : 0.88);
    }
  }

  /* ── SYNTHETIC 10-SECOND WOODEN CLAPPER ── */
  function playClapper() {
    triggerHaptic([45, 55, 45, 55, 45]);
    if (getMode() === 'silent') return;
    const ctx = ensureAudio();
    if (!ctx || !noiseBuffer) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.12;
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1450, t);
      filter.Q.setValueAtTime(4.2, t);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.65, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.065);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(t);
      src.stop(t + 0.075);
    }
  }

  function playTick() {
    triggerHaptic([20]);
    if (getMode() === 'silent') return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  function playGo() {
    triggerHaptic([70, 40, 90]);
    if (getMode() === 'silent') return;
    playBell(1);
  }

  function playVictory() {
    triggerHaptic([90, 50, 90, 50, 160]);
    if (getMode() === 'silent') return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const t = now + idx * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  /* ── TACTILE PUNCH & WHOOSH WEB AUDIO SFX ── */
  function playPunchSfx(key) {
    const ctx = ensureAudio();
    if (!ctx || !noiseBuffer) return;
    const now = ctx.currentTime;

    if (['slip-l', 'slip-r', 'roll', 'pull', 'parry', 'feint', 'pivot'].includes(key)) {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950, now);
      filter.frequency.exponentialRampToValueAtTime(280, now + 0.13);
      filter.Q.setValueAtTime(1.8, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(now);
      src.stop(now + 0.15);
      return;
    }

    const isBody = key.startsWith('body-');
    const isJab = key === 'jab' || key === 'body-jab';
    const isUpper = key.includes('upper');

    // Low-end leather bag thump
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = isBody ? 'sine' : 'triangle';

    const startFreq = isBody ? 115 : isJab ? 210 : isUpper ? 165 : 175;
    const endFreq = isBody ? 40 : isJab ? 80 : 52;
    const dur = isJab ? 0.085 : 0.13;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + dur);
    oscGain.gain.setValueAtTime(isBody ? 0.48 : isJab ? 0.28 : 0.44, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);

    // Glove leather snap transient
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = isBody ? 'lowpass' : 'bandpass';
    filter.frequency.setValueAtTime(isBody ? 650 : isJab ? 1900 : 1350, now);
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(isBody ? 0.22 : isJab ? 0.34 : 0.30, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
    noiseSrc.connect(filter);
    filter.connect(nGain);
    nGain.connect(ctx.destination);
    noiseSrc.start(now);
    noiseSrc.stop(now + 0.075);
  }

  function speakText(text, lang, rate) {
    try {
      if (!global.speechSynthesis) return Promise.resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'pt-PT' ? 'pt-PT' : 'en-US';
      u.rate = rate || 1.15;
      return new Promise(resolve => {
        u.onend = resolve;
        u.onerror = resolve;
        global.speechSynthesis.speak(u);
      });
    } catch (e) {
      return Promise.resolve();
    }
  }

  function playCachedMp3(path, volume) {
    return new Promise((resolve, reject) => {
      try {
        let base = punchAudioCache[path];
        if (!base) {
          base = new Audio(path);
          punchAudioCache[path] = base;
        }
        const clone = base.cloneNode();
        clone.volume = volume != null ? volume : 0.92;
        clone.onended = resolve;
        clone.onerror = reject;
        const p = clone.play();
        if (p && typeof p.catch === 'function') p.catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  function playPunch(key, opts) {
    const bd = global.BoxingData;
    const resolved = bd ? bd.resolvePunchKey(key) : key;
    const mode = getMode();
    triggerHaptic([32]);
    if (mode === 'silent') return;

    const prof = global.BoxingStorage ? global.BoxingStorage.getActiveProfile() : null;
    const stance = opts?.stance || prof?.stance || 'orthodox';
    const calloutStyle = opts?.calloutStyle || prof?.calloutStyle || 'names';
    const lang = (global.BoxingStorage && global.BoxingStorage.getStore().lang) || 'en';

    if (mode === 'both' || mode === 'sfx') {
      playPunchSfx(resolved);
    }

    if (mode === 'both' || mode === 'voice') {
      if (calloutStyle === 'numbers' || lang !== 'en') {
        const meta = bd ? bd.getPunchMeta(resolved) : null;
        const phrase = calloutStyle === 'numbers'
          ? (meta?.numWord || resolved)
          : (global.T ? global.T(meta?.word || resolved) : (meta?.word || resolved));
        speakText(phrase, lang, 1.32);
        return;
      }

      let mp3 = null;
      if (stance === 'southpaw' && SOUTHPAW_PUNCH_AUDIO_OVERRIDE[resolved]) {
        mp3 = SOUTHPAW_PUNCH_AUDIO_OVERRIDE[resolved];
      } else if (KNOWN_PUNCH_AUDIO[resolved]) {
        mp3 = KNOWN_PUNCH_AUDIO[resolved];
      }

      if (mp3) {
        playCachedMp3(`audio/${mp3}`, 0.95).catch(() => {});
      } else {
        const meta = bd ? bd.getPunchMeta(resolved) : null;
        speakText(meta ? meta.word.replace(/!/g, '') : resolved, 'en', 1.32);
      }
    }
  }

  function stopCurrentAudio() {
    if (currentExAudio) {
      try {
        currentExAudio.pause();
        currentExAudio.currentTime = 0;
      } catch (e) {}
      currentExAudio = null;
    }
    if (global.speechSynthesis) {
      try { global.speechSynthesis.cancel(); } catch (e) {}
    }
  }

  function playExerciseSound(name) {
    const mode = getMode();
    if (mode === 'silent' || mode === 'sfx') return Promise.resolve();
    stopCurrentAudio();

    const lang = (global.BoxingStorage && global.BoxingStorage.getStore().lang) || 'en';
    const knownFile = lang === 'en' ? KNOWN_EX_AUDIO[name] : null;

    if (knownFile) {
      return new Promise(resolve => {
        const s = new Audio(`audio/${knownFile}`);
        currentExAudio = s;
        s.onended = () => { currentExAudio = null; resolve(); };
        s.onerror = () => { currentExAudio = null; resolve(); };
        const p = s.play();
        if (p && typeof p.catch === 'function') p.catch(() => { currentExAudio = null; resolve(); });
      });
    }

    const spokenName = global.T ? global.T(name) : name;
    return speakText(spokenName, lang, 1.05);
  }

  function playTimerSound(key) {
    const mode = getMode();
    if (mode === 'silent') return Promise.resolve();
    if (mode === 'sfx') {
      playTick();
      return Promise.resolve();
    }

    const kStr = String(key);
    const known = KNOWN_TIMER_AUDIO[kStr];
    if (known) {
      return new Promise(resolve => {
        const s = new Audio(`audio/timer/${known}`);
        currentExAudio = s;
        s.onended = () => { currentExAudio = null; resolve(); };
        s.onerror = () => { currentExAudio = null; resolve(); };
        const p = s.play();
        if (p && typeof p.catch === 'function') p.catch(() => { currentExAudio = null; resolve(); });
      });
    }
    return Promise.resolve();
  }

  global.BoxingAudio = {
    KNOWN_PUNCH_AUDIO,
    KNOWN_TIMER_AUDIO,
    KNOWN_EX_AUDIO,
    ensureAudio,
    triggerHaptic,
    playBell,
    playClapper,
    playTick,
    playGo,
    playVictory,
    playPunchSfx,
    playPunch,
    stopCurrentAudio,
    playExerciseSound,
    playTimerSound,
    speakText
  };
})(typeof window !== 'undefined' ? window : globalThis);
