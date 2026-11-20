/* ── BOXING COACH PRO v3.0 — AUTHENTIC BOXING DICTIONARY, TECHNIQUE & CUES ── */
(function (global) {
  'use strict';

  const PUNCH_ALIASES = {
    'slip': 'slip-l',
    'hook': 'lead-hook',
    'uppercut': 'lead-upper',
    'body': 'body-lead-hook'
  };

  const PUNCH_DATA = {
    'jab': {
      key: 'jab',
      num: '1',
      label: 'Jab',
      word: 'JAB!',
      numWord: 'One!',
      hand: 'lead',
      chip: 'chip-jab',
      targetZone: 'head-c',
      isPunch: true,
      delay: 360
    },
    'cross': {
      key: 'cross',
      num: '2',
      label: 'Cross',
      word: 'CROSS!',
      numWord: 'Two!',
      hand: 'rear',
      chip: 'chip-cross',
      targetZone: 'head-c',
      isPunch: true,
      delay: 440
    },
    'lead-hook': {
      key: 'lead-hook',
      num: '3',
      label: 'L.Hook',
      word: 'LEAD HOOK!',
      numWord: 'Three!',
      hand: 'lead',
      chip: 'chip-hook',
      targetZone: 'head-l',
      isPunch: true,
      delay: 540
    },
    'rear-hook': {
      key: 'rear-hook',
      num: '4',
      label: 'R.Hook',
      word: 'REAR HOOK!',
      numWord: 'Four!',
      hand: 'rear',
      chip: 'chip-hook',
      targetZone: 'head-r',
      isPunch: true,
      delay: 580
    },
    'lead-upper': {
      key: 'lead-upper',
      num: '5',
      label: 'L.Upper',
      word: 'LEAD UPPER!',
      numWord: 'Five!',
      hand: 'lead',
      chip: 'chip-uppercut',
      targetZone: 'head-c',
      isPunch: true,
      delay: 560
    },
    'rear-upper': {
      key: 'rear-upper',
      num: '6',
      label: 'R.Upper',
      word: 'REAR UPPER!',
      numWord: 'Six!',
      hand: 'rear',
      chip: 'chip-uppercut',
      targetZone: 'head-c',
      isPunch: true,
      delay: 580
    },
    'body-jab': {
      key: 'body-jab',
      num: '1b',
      label: 'B.Jab',
      word: 'BODY JAB!',
      numWord: 'Body One!',
      hand: 'lead',
      chip: 'chip-body',
      targetZone: 'body-c',
      isPunch: true,
      delay: 460
    },
    'body-cross': {
      key: 'body-cross',
      num: '2b',
      label: 'B.Cross',
      word: 'BODY CROSS!',
      numWord: 'Body Two!',
      hand: 'rear',
      chip: 'chip-body',
      targetZone: 'body-c',
      isPunch: true,
      delay: 520
    },
    'body-lead-hook': {
      key: 'body-lead-hook',
      num: '3b',
      label: 'B.L.Hook',
      word: 'LIVER HOOK!',
      numWord: 'Body Three!',
      hand: 'lead',
      chip: 'chip-body',
      targetZone: 'body-l',
      isPunch: true,
      delay: 600
    },
    'body-rear-hook': {
      key: 'body-rear-hook',
      num: '4b',
      label: 'B.R.Hook',
      word: 'BODY REAR!',
      numWord: 'Body Four!',
      hand: 'rear',
      chip: 'chip-body',
      targetZone: 'body-r',
      isPunch: true,
      delay: 600
    },
    'slip-l': {
      key: 'slip-l',
      num: 'SLIP-L',
      label: 'Slip L',
      word: 'SLIP LEAD!',
      numWord: 'Slip Lead!',
      hand: 'defense',
      chip: 'chip-slip',
      targetZone: 'def-slip-l',
      isPunch: false,
      delay: 440
    },
    'slip-r': {
      key: 'slip-r',
      num: 'SLIP-R',
      label: 'Slip R',
      word: 'SLIP REAR!',
      numWord: 'Slip Rear!',
      hand: 'defense',
      chip: 'chip-slip',
      targetZone: 'def-slip-r',
      isPunch: false,
      delay: 440
    },
    'roll': {
      key: 'roll',
      num: 'ROLL',
      label: 'Roll',
      word: 'ROLL UNDER!',
      numWord: 'Roll!',
      hand: 'defense',
      chip: 'chip-slip',
      targetZone: 'def-roll',
      isPunch: false,
      delay: 560
    },
    'pull': {
      key: 'pull',
      num: 'PULL',
      label: 'Pull',
      word: 'PULL BACK!',
      numWord: 'Pull!',
      hand: 'defense',
      chip: 'chip-slip',
      targetZone: 'def-pull',
      isPunch: false,
      delay: 460
    },
    'parry': {
      key: 'parry',
      num: 'PARRY',
      label: 'Parry',
      word: 'CATCH & PARRY!',
      numWord: 'Parry!',
      hand: 'defense',
      chip: 'chip-slip',
      targetZone: 'def-parry',
      isPunch: false,
      delay: 380
    },
    'feint': {
      key: 'feint',
      num: 'FEINT',
      label: 'Feint',
      word: 'FEINT!',
      numWord: 'Feint!',
      hand: 'defense',
      chip: 'chip-feint',
      targetZone: 'def-feint',
      isPunch: false,
      delay: 380
    },
    'pivot': {
      key: 'pivot',
      num: 'PIVOT',
      label: 'Pivot',
      word: 'PIVOT ANGLE!',
      numWord: 'Pivot!',
      hand: 'footwork',
      chip: 'chip-footwork',
      targetZone: 'def-pivot',
      isPunch: false,
      delay: 540
    }
  };

  function resolvePunchKey(key) {
    if (PUNCH_DATA[key]) return key;
    if (PUNCH_ALIASES[key]) return PUNCH_ALIASES[key];
    return 'jab';
  }

  function getPunchMeta(key) {
    return PUNCH_DATA[resolvePunchKey(key)];
  }

  function getStanceHand(key, stance) {
    const meta = getPunchMeta(key);
    const isSouthpaw = stance === 'southpaw';
    if (meta.hand === 'lead') return isSouthpaw ? 'Right Hand (Lead)' : 'Left Hand (Lead)';
    if (meta.hand === 'rear') return isSouthpaw ? 'Left Hand (Rear)' : 'Right Hand (Rear)';
    if (meta.hand === 'footwork') return isSouthpaw ? 'Pivot off Right Foot' : 'Pivot off Left Foot';
    return 'Head / Guard';
  }

  function getStanceTargetSide(zone, stance) {
    // Flip horizontal target orientation visually when Southpaw so coach HUD mirrors fighter's angle
    if (stance !== 'southpaw') return zone;
    const map = {
      'head-l': 'head-r',
      'head-r': 'head-l',
      'body-l': 'body-r',
      'body-r': 'body-l',
      'def-slip-l': 'def-slip-r',
      'def-slip-r': 'def-slip-l'
    };
    return map[zone] || zone;
  }

  function getPunchDisplayLabel(key, calloutStyle, stance) {
    const meta = getPunchMeta(key);
    if (calloutStyle === 'numbers') return meta.num;
    if (stance === 'southpaw') {
      if (meta.key === 'lead-hook') return 'R.Hook';
      if (meta.key === 'rear-hook') return 'L.Hook';
      if (meta.key === 'lead-upper') return 'R.Upper';
      if (meta.key === 'rear-upper') return 'L.Upper';
      if (meta.key === 'body-lead-hook') return 'B.R.Hook';
      if (meta.key === 'body-rear-hook') return 'B.L.Hook';
    }
    return meta.label;
  }

  /* ── TECHNIQUE ACADEMY (18 AUTHENTIC GUIDES) ── */
  const TECHNIQUE_LIBRARY = [
    {
      id: 'jab',
      num: '1',
      category: 'punches',
      name: 'The Jab (1)',
      audioKey: 'jab',
      desc: 'Boxing’s master key. A fast straight lead punch that controls range, disrupts rhythm, blinds your opponent, and sets up every power shot.',
      stanceNote: {
        orthodox: 'Left hand leads from your chin; step subtly forward with your left foot as it snaps out.',
        southpaw: 'Right hand leads straight down the pipe; claim outside foot position against orthodox opponents.'
      },
      tips: [
        'Tuck your chin behind your lead shoulder at full extension.',
        'Turn knuckles over at the last 20% of travel and snap straight back to your eyebrow.',
        'Keep your rear glove glued to your cheekbone — never drop it while jabbing.'
      ],
      mistake: 'Pushing the jab with a flared elbow or leaning weight past your front knee.',
      yt: 'https://www.youtube.com/results?search_query=boxing+jab+technique+tutorial'
    },
    {
      id: 'cross',
      num: '2',
      category: 'punches',
      name: 'The Cross (2)',
      audioKey: 'cross',
      desc: 'Your primary rear-hand power straight. Travels from the back shoulder through full kinetic-chain rotation of foot, knee, hip, and torso.',
      stanceNote: {
        orthodox: 'Drive off the ball of your right foot and rotate the right hip forward through the target.',
        southpaw: 'The feared straight left: explode off the left ball of the foot right down an orthodox fighter’s center line.'
      },
      tips: [
        'Pivot your rear heel outward like squashing a cigarette on the canvas.',
        'Exhale with a sharp "shh!" at impact to tighten your core.',
        'Pull your lead hand tight to your jaw as the rear shoulder rotates forward.'
      ],
      mistake: 'Arm-punching without turning the rear hip, or leaning forward off-balance.',
      yt: 'https://www.youtube.com/results?search_query=boxing+cross+power+punch+tutorial'
    },
    {
      id: 'lead-hook',
      num: '3',
      category: 'punches',
      name: 'Lead Hook (3)',
      audioKey: 'lead-hook',
      desc: 'A devastating short-arc horizontal weapon targeting the temple, jaw, or guard gap after straight punches draw your opponent’s hands center.',
      stanceNote: {
        orthodox: 'Left hook pivots on the front foot while shifting weight smoothly back toward your rear leg.',
        southpaw: 'Right hook whips cleanly around an orthodox jab or low left hand.'
      },
      tips: [
        'Keep the elbow bent near 90° and parallel to the floor for maximum structural lock.',
        'Initiate with hip and front-foot pivot, not by swinging the arm wide.',
        'Keep your forearm compact so the punch lands cleanly inside phone-booth range.'
      ],
      mistake: 'Looping or "slapping" with a wide wind-up that telegraphs and leaves your chin exposed.',
      yt: 'https://www.youtube.com/results?search_query=boxing+lead+hook+tutorial'
    },
    {
      id: 'rear-hook',
      num: '4',
      category: 'punches',
      name: 'Rear Hook / Overhand (4)',
      audioKey: 'rear-hook',
      desc: 'A heavy rear-side arc or looping overhand thrown around or over an opponent’s lead shoulder and high guard.',
      stanceNote: {
        orthodox: 'Right hook or overhand right: slip slightly toward your lead hip to load the rear side, then whip across.',
        southpaw: 'Left hook / overhand left: ideal counter over an orthodox lazy jab.'
      },
      tips: [
        'Keep your lead glove anchored high to cover your chin during the wide torque.',
        'For an overhand, drop your head off the centerline slightly to avoid counter straight shots.',
        'Follow through horizontally into the target rather than falling forward.'
      ],
      mistake: 'Dropping your head blindly with your eyes down instead of tracking the target.',
      yt: 'https://www.youtube.com/results?search_query=boxing+rear+hook+overhand+tutorial'
    },
    {
      id: 'lead-upper',
      num: '5',
      category: 'punches',
      name: 'Lead Uppercut (5)',
      audioKey: 'lead-upper',
      desc: 'An inside upward-driving punch designed to split a tight high guard or catch an opponent crouching forward.',
      stanceNote: {
        orthodox: 'Left uppercut: dip slightly into the lead hip, then drive vertically through the legs and ribs.',
        southpaw: 'Right uppercut: deadly inside weapon when tied up chest-to-chest.'
      },
      tips: [
        'Power comes from your legs and upward hip drive — not dipping your hand down to your waist.',
        'Keep palm facing yourself at impact and elbow tight to the ribs.',
        'Immediately transition into a 2 (Cross) or 3 (Hook) while their chin lifts.'
      ],
      mistake: 'Winding the glove down by your thigh, giving away the punch and opening yourself to a counter hook.',
      yt: 'https://www.youtube.com/results?search_query=boxing+lead+uppercut+tutorial'
    },
    {
      id: 'rear-upper',
      num: '6',
      category: 'punches',
      name: 'Rear Uppercut (6)',
      audioKey: 'rear-upper',
      desc: 'The heaviest vertical knockout punch in boxing, loaded from the rear leg and driven straight up through the midline.',
      stanceNote: {
        orthodox: 'Right uppercut: load onto the rear hip by slipping right or finishing a left hook, then snap upward.',
        southpaw: 'Left uppercut: threads right up the middle against a shelling-up orthodox opponent.'
      },
      tips: [
        'Pivot your rear foot and lift through the hips as if lifting a heavy kettlebell under their chin.',
        'Stop the upward travel at eye level so you stay covered and balanced.',
        'Keep your lead hand pinned tightly to your temple.'
      ],
      mistake: 'Over-rotating upright and exposing your ribs before resetting your stance.',
      yt: 'https://www.youtube.com/results?search_query=boxing+rear+uppercut+tutorial'
    },
    {
      id: 'body-jab',
      num: '1b',
      category: 'body',
      name: 'Body Jab (1b)',
      audioKey: 'body-jab',
      desc: 'A level-changing straight jab fired into the solar plexus or ribcage that freezes feet and pulls the opponent’s guard downward.',
      stanceNote: {
        orthodox: 'Drop elevation through both knees, step outside, and spear the left jab into the stomach.',
        southpaw: 'Step outside the orthodox lead foot and stab the right body jab to the ribs.'
      },
      tips: [
        'Change levels with your knees and hips — never bend over at the lower back.',
        'Keep your head slightly off-center (slip side) while jabbing low to avoid uppercuts.',
        'Exit immediately or follow up top with a head cross (2) or lead hook (3).'
      ],
      mistake: 'Looking down at the stomach or dropping your rear guard while changing levels.',
      yt: 'https://www.youtube.com/results?search_query=boxing+body+jab+tutorial'
    },
    {
      id: 'body-cross',
      num: '2b',
      category: 'body',
      name: 'Body Cross (2b)',
      audioKey: 'body-cross',
      desc: 'A heavy rear straight thrown into the solar plexus. Steals breath, lowers high guards, and pairs seamlessly with a rising lead hook upstairs.',
      stanceNote: {
        orthodox: 'Drop knees into a deep lunge stance and drive the right straight cleanly into the midsection.',
        southpaw: 'Fire the straight left to the liver/solar plexus while slipping your head off the centerline.'
      },
      tips: [
        'Lead with a high 1 (Jab) to blind their eyes before dropping to throw 2b.',
        'Tuck your chin tightly against your rear shoulder to protect against a counter check hook.',
        'Spring right back up into a 3 (Lead Hook) to the head.'
      ],
      mistake: 'Reaching forward without bending the knees, which puts strain on the lower back and leaves your jaw exposed.',
      yt: 'https://www.youtube.com/results?search_query=boxing+body+cross+tutorial'
    },
    {
      id: 'body-lead-hook',
      num: '3b',
      category: 'body',
      name: 'Liver Hook / Body Hook (3b)',
      audioKey: 'body-lead-hook',
      desc: 'The signature Mexican boxing shot. Digs upward at a 45° angle underneath the floating ribs to shock the liver or spleen.',
      stanceNote: {
        orthodox: 'Step slightly left and drop level; whip the left hook at a 45° upward angle with palm vertical or slightly facing up.',
        southpaw: 'Dig the right body hook cleanly into the ribs after forcing a high guard with a straight left.'
      },
      tips: [
        'Load weight onto your lead hip (just like an outside slip) right before firing.',
        'Drive upward at 45° under the ribcage rather than slapping flat from the side.',
        'Chain 3b directly into 3 (head hook) or 2 (cross) as their elbows drop.'
      ],
      mistake: 'Swinging from too far away instead of stepping inside range behind a jab or slip.',
      yt: 'https://www.youtube.com/results?search_query=boxing+liver+shot+body+hook+tutorial'
    },
    {
      id: 'slip-lr',
      num: 'SLIP',
      category: 'defense',
      name: 'Outside & Inside Slip',
      audioKey: 'slip-l',
      desc: 'Precision head movement shifting your skull inches off the centerline so straight punches whiz past your ear while loading your counter.',
      stanceNote: {
        orthodox: 'Slip Left (lead) loads your Lead Hook (3); Slip Right (rear) loads your Cross (2) and Rear Uppercut (6).',
        southpaw: 'Slip Right (lead) loads your Right Hook (3); Slip Left (rear) loads your Straight Left (2).'
      },
      tips: [
        'Think "nose over knee" — transfer weight cleanly from hip to hip without bending at the waist.',
        'Move only 3–4 inches: miss by an inch, stay close enough to punish.',
        'Eyes stay glued to your opponent’s chest and shoulders the entire time.'
      ],
      mistake: 'Over-exaggerating the lean until you lose balance and cannot fire an immediate counter.',
      yt: 'https://www.youtube.com/results?search_query=boxing+slipping+punches+properly'
    },
    {
      id: 'roll',
      num: 'ROLL',
      category: 'defense',
      name: 'The Roll (Bob & Weave)',
      audioKey: 'roll',
      desc: 'Sliding smoothly beneath incoming hooks in a compact "U" arc using your legs so you surface outside their punch ready to rip counters.',
      stanceNote: {
        orthodox: 'Dip down, roll weight left-to-right (or right-to-left) through the knees, rising cleanly on the opposite leg.',
        southpaw: 'Same U-arc knee drive; roll under an orthodox lead hook to surface on their blind angle.'
      },
      tips: [
        'Bend at the knees and ankles — keep your spine upright and eyes forward.',
        'Trace a tight letter "U" with your chin, keeping gloves glued to your cheekbones.',
        'Come up punching: Roll under → immediately fire 2–3–2 or 6–3–2.'
      ],
      mistake: 'Hinging forward at the waist with eyes on the floor — an invitation for uppercuts.',
      yt: 'https://www.youtube.com/results?search_query=boxing+bob+and+weave+roll+tutorial'
    },
    {
      id: 'pull',
      num: 'PULL',
      category: 'defense',
      name: 'The Pull Counter',
      audioKey: 'pull',
      desc: 'An elite high-IQ defense: lean your torso back inches onto your rear hip to make a jab or cross fall short, then explode back with a 2.',
      stanceNote: {
        orthodox: 'Shift weight sharply onto your rear right leg as their jab misses your chin, then fire the Cross (2) off that loaded leg.',
        southpaw: 'Load back onto your left hip to dodge the lead punch and snap the straight left straight down the middle.'
      },
      tips: [
        'Keep your lead foot rooted and knees bent — never lean stiff-legged backwards.',
        'Keep your chin tucked down and rear glove high as you pull.',
        'Never pull straight back twice in a row against a smart pressure fighter; add a pivot exit.'
      ],
      mistake: 'Pulling upright with both feet flat or backing straight toward the ropes.',
      yt: 'https://www.youtube.com/results?search_query=boxing+pull+counter+mayweather+tutorial'
    },
    {
      id: 'parry',
      num: 'PARRY',
      category: 'defense',
      name: 'Catch & Parry',
      audioKey: 'parry',
      desc: 'Deflecting incoming straight shots with minimal wrist/palm movement instead of shelling up, keeping both hands poised for instant counter fire.',
      stanceNote: {
        orthodox: 'Catch straight shots with your rear palm near your chin, or swat a jab down inches with your lead palm.',
        southpaw: 'Use your rear left hand to catch jabs and lead right hand to parry crosses in open-stance battles.'
      },
      tips: [
        'Keep the motion tiny — slap downward or inward just 2–3 inches, never reach out toward them.',
        'Catching with the rear glove immediately sets up your own counter Jab (1) or Lead Hook (3).',
        'Reset your parrying hand back to your eyebrow instantaneously.'
      ],
      mistake: 'Reaching far forward to swat a feint, opening your cheek to a follow-up hook.',
      yt: 'https://www.youtube.com/results?search_query=boxing+catch+and+parry+tutorial'
    },
    {
      id: 'pendulum',
      num: 'STEP',
      category: 'footwork',
      name: 'Cuban Pendulum Step',
      audioKey: 'Shadowboxing footwork',
      desc: 'A fluid bounce-glide rhythm forward and backward on the balls of your feet that lets you enter range cleanly and drift out before counters arrive.',
      stanceNote: {
        orthodox: 'Glide lead-rear / rear-lead with knees springy, keeping shoulder-width spacing intact.',
        southpaw: 'Maintain outside lead foot alignment while pulsing in and out smoothly.'
      },
      tips: [
        'Stay on the balls of your feet — heels barely kiss the mat.',
        'Move both feet almost simultaneously with low height (not jumping high like basketball).',
        'Pair forward glide with a snapping 1–2 and immediate backward drift out of pocket.'
      ],
      mistake: 'Crossing ankles or bouncing too tall, which wastes calf energy and stalls punches.',
      yt: 'https://www.youtube.com/results?search_query=cuban+boxing+pendulum+step+footwork'
    },
    {
      id: 'pivot',
      num: 'PIVOT',
      category: 'footwork',
      name: 'L-Step Pivot & Check Hook',
      audioKey: 'Heavy bag  Check Hooks',
      desc: 'Plant the lead foot and whip the rear leg 90° off-line while firing a Lead Hook (3), turning an aggressive rusher past thin air.',
      stanceNote: {
        orthodox: 'Plant ball of left foot, swing right heel around counter-clockwise while throwing the Check Hook.',
        southpaw: 'Plant ball of right foot, whip left leg clockwise off-line as you land a right check hook.'
      },
      tips: [
        'Stay centered over your lead hip while spinning so you finish in a balanced firing stance.',
        'Never cross your feet during the exit — widen slightly as you complete the 90° turn.',
        'Follow the pivot immediately with a clean 2–3 before they can re-square.'
      ],
      mistake: 'Throwing the check hook while leaning backward instead of rotating tightly around the lead axis.',
      yt: 'https://www.youtube.com/results?search_query=boxing+check+hook+pivot+tutorial'
    },
    {
      id: 'peekaboo',
      num: 'STYLE',
      category: 'styles',
      name: 'Peek-a-Boo Style',
      audioKey: 'Shadowboxing – slips and rolls',
      desc: 'Pioneered by Cus D’Amato for Mike Tyson and Floyd Patterson: tight cheekbone guard, rhythmic pendulum slips, explosive forward weave, and vicious hooks/uppercuts.',
      stanceNote: {
        orthodox: 'Square up slightly more, elbows glued to ribs, gloves tight on cheekbones; slip side-to-side into 6–3–2 ambushes.',
        southpaw: 'Apply identical tight shell and rolling momentum to unleash explosive left uppercut–right hook sequences.'
      },
      tips: [
        'Never stand straight upright in front of a taller opponent — keep constant subtle side-to-side head motion.',
        'Every slip or roll must compress your legs so you explode out with bad intentions.',
        'Chain 5–6–3–2 and 3b–3 inside the pocket.'
      ],
      mistake: 'Moving your head randomly without closing distance or keeping hands glued to your jaw.',
      yt: 'https://www.youtube.com/results?search_query=peek+a+boo+boxing+style+tutorial'
    },
    {
      id: 'philly-shell',
      num: 'STYLE',
      category: 'styles',
      name: 'Philly Shell (Crab Guard)',
      audioKey: 'Heavy bag – Def. Counters',
      desc: 'Bladed stance with lead arm low across the ribs, rear hand glued to the cheek, and lead shoulder elevated to roll crosses into sharp Pull/Roll counters.',
      stanceNote: {
        orthodox: 'Lead left arm shields the liver/body; elevate left shoulder tight to your chin to roll right hands into your own Cross (2).',
        southpaw: 'Requires mastery against orthodox fighters — prioritize parrying crosses with rear hand and angling away from their right.'
      },
      tips: [
        'Blade your torso 45° so your opponent sees only a narrow target.',
        'Roll with incoming crosses by turning your lead shoulder slightly clockwise, never turning your back.',
        'Fire an immediate 2–3–2 or 6–3 counter off the shoulder roll.'
      ],
      mistake: 'Dropping the lead arm without keeping the lead shoulder high enough to protect the jaw.',
      yt: 'https://www.youtube.com/results?search_query=philly+shell+shoulder+roll+boxing+tutorial'
    },
    {
      id: 'cuban-school',
      num: 'STYLE',
      category: 'styles',
      name: 'Cuban Matador School',
      audioKey: 'Shadowboxing  ringcraft',
      desc: 'Olympic-pedigree ringcraft built on economy of motion, pendulum timing, subtle feints, blinding jabs, and laser-accurate counter-angles.',
      stanceNote: {
        orthodox: 'Rule the ring with double jabs, pendulum entries, L-step exits, and crisp 1–2–PIVOT–3–2 flurries.',
        southpaw: 'Use dominant lead-foot angles and feints to frustrate orthodox fighters into walking onto straight lefts.'
      },
      tips: [
        'Hit and don’t get hit: finish every combo with an angle step, pull, or pivot.',
        'Use feints constantly to read how your opponent defends before committing.',
        'Keep shoulders loose and fluid — speed beats raw stiffness.'
      ],
      mistake: 'Staying planted on the tracks admirng your punches after landing a combination.',
      yt: 'https://www.youtube.com/results?search_query=cuban+boxing+style+breakdown'
    }
  ];

  /* ── COMPREHENSIVE EXERCISE COACHING DIRECTORY ── */
  const EXERCISE_INFO = {
    'Jump rope – Boxer Skip': {
      equip: 'Jump Rope',
      goal: 'Aerobic warm-up & calf springiness',
      cue: 'Shift weight smoothly from ball of left foot to right foot (2 taps per side). Elbows tucked at ribs, spin purely from the wrists.'
    },
    'Jump rope – Fast Singles': {
      equip: 'Jump Rope',
      goal: 'Foot speed & cardio spike',
      cue: 'Minimal height off the ground, crisp wrist flicks, core braced tall, steady nasal-mouth rhythm.'
    },
    'Jump rope – Double Unders & Sprints': {
      equip: 'Jump Rope',
      goal: 'Anaerobic calf power & coordination',
      cue: 'Alternate 20s relaxed boxer skip with 10s fast sprints or double-unders. Stay tall; never tuck heels behind you.'
    },
    'Arm Circles, Shoulder & Spine Prep': {
      equip: 'None',
      goal: 'Rotator cuff & thoracic warm-up',
      cue: 'Progressive forward/backward circles, open-book thoracic rotations, and gentle wrist rolls to protect knuckles and shoulders.'
    },
    'Neck, Wrist & Hip Mobilisation': {
      equip: 'None',
      goal: 'Joint readiness & injury prevention',
      cue: 'Controlled neck nods/rotations, wrist flexion/extension, and hip circles / dynamic leg swings both sides.'
    },
    'Dynamic Shadow Flow & Footwork': {
      equip: 'None',
      goal: 'Stance ignition & ring movement',
      cue: 'Zero stiff punches: focus purely on moving smoothly on balls of feet, jabbing off the step, and keeping chin tucked.'
    },
    'Shadowboxing – 1-2 Range & Stance': {
      equip: 'None (Mirror ideal)',
      goal: 'Straight punch mechanics & guard discipline',
      cue: 'Picture a sparring partner at arm’s reach. Snap 1s and 1-2s at full extension, returning gloves straight back to cheekbones.'
    },
    'Shadowboxing – 1-2-3 Rotational Flow': {
      equip: 'None',
      goal: 'Hip rotation & hook mechanics',
      cue: 'Chain straight shots into tight 90° lead hooks. Transfer weight from rear leg to front leg smoothly without leaning.'
    },
    'Shadowboxing – Cuban Pendulum & Angles': {
      equip: 'None',
      goal: 'Matador footwork & lateral pivots',
      cue: 'Glide in with a pendulum step, fire crisp combos, then L-step pivot 90° off-line. Never cross your feet.'
    },
    'Shadowboxing – Peek-a-Boo Slips & Rolls': {
      equip: 'None',
      goal: 'Head movement tied to counters',
      cue: 'Keep gloves pinned to cheekbones. Slip nose-over-knee, roll in tight U-shapes through the legs, and come up firing 6-3-2.'
    },
    'Shadowboxing – Defensive Counters': {
      equip: 'None',
      goal: 'Catch, pull & parry instincts',
      cue: 'Visualize incoming jabs and crosses. Parry or pull back first, then fire sharp 2-3 punch counters before stepping off-line.'
    },
    'Shadowboxing – Rapid Hand Speed': {
      equip: 'None (optional 1-2 lb eggs)',
      goal: 'Fast-twitch hand speed & relaxation',
      cue: 'Stay totally relaxed in your shoulders until impact. Snap straight punches back faster than you threw them.'
    },
    'Shadowboxing – Championship Ghost Sparring': {
      equip: 'None',
      goal: 'Tactical fight simulation',
      cue: 'Fight 3 full minutes of imaginary pressure: feint entries, cut off the ring, defend counters, and finish rounds strong.'
    },
    'Shadowboxing – Morning Ignition': {
      equip: 'None',
      goal: 'Wake-up rhythm & sharp basics',
      cue: 'Smooth movement, crisp breathing ("shh!"), mixing clean 1-2s with light slips and steady footwork.'
    },
    'Footwork-Only Pendulum & Box Drill': {
      equip: 'None (Tape line optional)',
      goal: 'Pure foot speed & balance',
      cue: 'Hands high at chin, throw zero punches. Step-drag forward, backward, side-to-side, and execute crisp 90° pivots on command.'
    },
    'Heavy Bag – Jab Command & Range': {
      equip: 'Heavy Bag, Wraps & Gloves',
      goal: 'Distance control & stiff jab snap',
      cue: 'Touch the swinging bag only at full arm extension. Use single, double, and body jabs to stop the bag’s momentum without pushing.'
    },
    'Heavy Bag – 1-2-3 Foundation Combos': {
      equip: 'Heavy Bag, Wraps & Gloves',
      goal: 'Clean 3-punch rhythm & guard recovery',
      cue: 'Throw clean 1-2 and 1-2-3 combos, pausing briefly to reset feet and guard between bursts.'
    },
    'Heavy Bag – Guard & Body Basics': {
      equip: 'Heavy Bag, Wraps & Gloves',
      goal: 'Level changes & tight defense',
      cue: 'Drop at the knees to dig clean 1b and 3b body shots, then bring hands straight back to your eyebrows.',
      backCare: 'Keep spine tall when dropping level — bend knees and hips rather than rounding your lower back.'
    },
    'Heavy Bag – Power Impact & Weight Transfer': {
      equip: 'Heavy Bag, Wraps & Gloves',
      goal: 'Maximum kinetic power per strike',
      cue: 'Sit down on your punches, pivot feet firmly, and drive force from the floor into the leather. Reset balance after every combo.',
      backCare: 'Rotate cleanly through hips and thoracic spine; avoid over-twisting lumbar.'
    },
    'Heavy Bag – Mexican Body Snatcher': {
      equip: 'Heavy Bag, Wraps & Gloves',
      goal: 'High-low level mixing & liver hooks',
      cue: 'Blind the high guard with straight 1-2s upstairs, step in tight, and rip 45° body hooks to the ribs before finishing top.'
    },
    'Heavy Bag – Counter-Puncher’s Trap': {
      equip: 'Heavy Bag, Wraps & Gloves',
      goal: 'Defense-first timing on a swinging bag',
      cue: 'When the bag swings toward you, treat it like an incoming jab: slip, parry, or pull, then explode with a 3-punch counter.'
    },
    'Heavy Bag – Inside Pocket Warfare': {
      equip: 'Heavy Bag, Wraps & Gloves',
      goal: 'Short hooks, uppercuts & tight frames',
      cue: 'Stand chest-to-leather. Fire compact 3-4-5-6 combinations with elbows tight, keeping your forehead near the bag without leaning.'
    },
    'Heavy Bag – Check Hooks & Pivot Exits': {
      equip: 'Heavy Bag, Wraps & Gloves',
      goal: 'Creating dominant angles on pressure',
      cue: 'Let the bag swing toward you, snap a crisp lead Check Hook while pivoting 90° off the track, and punish the open side.'
    },
    'Heavy Bag – Power Pyramid (1-to-10)': {
      equip: 'Heavy Bag, Wraps & Gloves',
      goal: 'Anaerobic power endurance',
      cue: 'Climb punch volume from 2 → 4 → 6 → 8 → 10 clean punches per burst, maintaining crisp mechanics as fatigue builds.'
    },
    'Heavy Bag – 30/30 Championship Burnout': {
      equip: 'Heavy Bag, Wraps & Gloves',
      goal: 'Lactic acid tolerance & finishing sprint',
      cue: 'Follow every coach combo at 75%, then explode into rapid 1-2 flurries whenever speed spikes. Empty the tank with clean technique.'
    },
    'Heavy Bag – Rapid Hand Speed Flurries': {
      equip: 'Heavy Bag (or Double-End Bag)',
      goal: 'Hand speed & shoulder stamina',
      cue: 'Throw light, snappy, non-stop 4–7 punch combinations focusing on hand return speed rather than heavy thudding force.'
    },
    'Heavy Bag – Title Fight Simulation': {
      equip: 'Heavy Bag, Wraps & Gloves',
      goal: 'Championship pace & tactical adaptation',
      cue: 'Treat every round like a live bout: move continuously around the bag, mix feints, slips, body work, and final-30-second flurries.'
    },
    'HIIT – 10-Punch Burst & Squat': {
      equip: 'Heavy Bag or Shadowbox',
      goal: 'Heart-rate spikes & leg stamina',
      cue: 'Fire 10 fast straight punches followed immediately by 2 crisp bodyweight squats, then bounce right back into guard.'
    },
    'Explosive Plyo Push-Ups': {
      equip: 'None',
      goal: 'Upper-body explosive snap',
      cue: 'Lower chest with control, explode up so hands leave (or lighten on) the floor. Drop to knees if form dips.'
    },
    'Push-Ups – Shoulder Taps': {
      equip: 'None',
      goal: 'Anti-rotation shoulder & core lock',
      cue: 'From high plank, tap opposite shoulder cleanly after every push-up without letting your hips sway side to side.'
    },
    'Boxer’s Push-Ups (Staggered)': {
      equip: 'None',
      goal: 'Unilateral pressing & guard endurance',
      cue: 'Perform crisp push-ups keeping elbows at 45°; alternate one hand slightly forward each set to mirror your boxing stance.'
    },
    'Split Squat Jumps (Boxing Stance)': {
      equip: 'None',
      goal: 'Explosive leg drive & footwork spring',
      cue: 'Start in your fighting stance, drop slightly, explode upward switching feet or holding stance, and land softly on balls of feet.'
    },
    'Pogo Ankle Hops & Skater Bounds': {
      equip: 'None',
      goal: 'Tendon stiffness & lateral ring agility',
      cue: 'Alternate quick stiff-ankle pogo hops with explosive side-to-side skater bounds, sticking each landing cleanly.'
    },
    'Conditioning – Sprawls & Guard Up': {
      equip: 'None',
      goal: 'Full-body conditioning & recovery speed',
      cue: 'Snap legs back cleanly into a tight plank (never sag lower back!), pop right back to your fighting stance with hands up.'
    },
    'Bodyweight Squats & Shadow Guard': {
      equip: 'None',
      goal: 'Lower-body foundation & level change',
      cue: 'Keep hands glued to cheekbones throughout every squat; drive up through midfoot and snap a jab-cross at the top.'
    },
    'Championship Burpees': {
      equip: 'None',
      goal: 'Peak anaerobic capacity',
      cue: 'Controlled plank drop, crisp push-up, snap feet wide, jump cleanly with hands up — keep breathing steady.'
    },
    'Walking Lunges & Torso Twist': {
      equip: 'None',
      goal: 'Hip strength & rotational obliques',
      cue: 'Step forward into a balanced 90/90 lunge and rotate smoothly over your lead knee before stepping into the next rep.'
    },
    'Rotational Russian Twists': {
      equip: 'None (light weight optional)',
      goal: 'Oblique torque for hooks & crosses',
      cue: 'Brace abs tight with spine long; rotate from the ribcage side to side rather than flailing arms.',
      backCare: 'Keep heels down and lean back only 15–20° with a neutral spine if lower back feels tight.'
    },
    'Iron Core Circuit (Plank / Climbers / Hollow)': {
      equip: 'None',
      goal: 'Body-shot armor & spinal stability',
      cue: 'Brace abs as if expecting a body hook. Keep ribs tucked down toward pelvis throughout forearm plank and mountain climbers.'
    },
    'Isometric Neck & Anti-Rotation Plank': {
      equip: 'None (Towel optional)',
      goal: 'Chin stability & shock absorption',
      cue: 'Perform gentle hand-resistance isometric neck holds (front, back, both sides) followed by a rigid forearm plank.'
    },
    'Forearm Plank & Side Plank': {
      equip: 'None',
      goal: '360° core bracing',
      cue: 'Squeeze glutes and quads; pull elbows toward toes mentally to fire deep transverse abdominals.'
    },
    'Roadwork – 3-Min Interval Runs': {
      equip: 'Running Shoes / Track / Treadmill',
      goal: 'Fight-specific VO2 max & recovery',
      cue: 'Run hard at 85% effort for each 3-minute round, then drop to an active recovery jog/walk during the 1-minute corner rest.'
    },
    'Jump rope – Ali Shuffle & Footwork': {
      equip: 'Jump Rope',
      goal: 'Stance agility & boxer foot-speed rhythm',
      cue: 'Alternate front-to-back stance switches (Ali Shuffle) and side-to-side hops synced tightly with crisp wrist flicks.'
    },
    'Jump rope – 30/30 High-Knee Sprint Intervals': {
      equip: 'Jump Rope',
      goal: 'Peak cardiovascular spike & ankle reactivity',
      cue: '30s smooth boxer skip followed immediately by 30s rapid high-knee sprint skipping while keeping chest tall and elbows tucked.'
    },
    'Multi-Gym – Explosive Chest Press': {
      equip: 'Multi-Gym Machine',
      goal: 'Punch extension power & pec-tricep snap',
      cue: 'Pin shoulder blades into backrest, press handles forward explosively like firing twin crosses, then control return for 2 seconds.'
    },
    'Multi-Gym – Single-Arm Rotational Punch Press': {
      equip: 'Multi-Gym Machine',
      goal: 'Standing kinetic punch power (foot-hip-shoulder)',
      cue: 'Stand in fighting stance facing away from mid-pulley; pivot your rear heel and drive the handle straight out with full hip torque.'
    },
    'Multi-Gym – Seated Cable Row (Guard Retraction)': {
      equip: 'Multi-Gym Machine',
      goal: 'Fast glove retraction & upper-back posture',
      cue: 'Pull handle cleanly to lower ribs squeezing shoulder blades together without shrugging; mirrors snapping punches back to your chin.'
    },
    'Multi-Gym – Lat Pulldown (Punch Snap & Posture)': {
      equip: 'Multi-Gym Machine',
      goal: 'Lat strength for guard stamina & thoracic posture',
      cue: 'Pull bar smoothly to upper collarbone driving elbows downward; counteracts rounded boxing shoulders and anchors hooks.'
    },
    'Multi-Gym – Cable Woodchopper (Rotational Torque)': {
      equip: 'Multi-Gym Machine',
      goal: 'Explosive hook & cross core rotation',
      cue: 'Pivot back foot and drive cable across torso from hip-to-shoulder using obliques and hips rather than stiff arms.',
      backCare: 'Keep ribs stacked over pelvis and initiate twist through hips and mid-back — never crank the lower back.'
    },
    'Multi-Gym – Cable Pallof Press (Anti-Rotation)': {
      equip: 'Multi-Gym Machine',
      goal: 'Body-shot armor & anti-rotation spine stability',
      cue: 'Stand sideways to pulley in athletic boxing stance; press handle straight out from sternum and hold 2s resisting rotational pull.'
    },
    'Multi-Gym – Cable Face Pulls & Rotator Cuff': {
      equip: 'Multi-Gym Machine',
      goal: 'Bulletproof shoulders & rear-delt endurance',
      cue: 'Pull rope toward forehead with thumbs pointing back and elbows high; prevents shoulder impingement from high-volume jabbing.'
    },
    'Multi-Gym – Cable Tricep Pushdowns (Punch Lockout)': {
      equip: 'Multi-Gym Machine',
      goal: 'Crisp elbow snap on straight 1–2s',
      cue: 'Keep elbows pinned tight at ribs, drive handles down to full crisp lockout and control the upward return.'
    },
    'Multi-Gym – Leg Press / Leg Drive Power': {
      equip: 'Multi-Gym Machine',
      goal: 'Lower-body knockout base without spinal compression',
      cue: 'Feet shoulder-width on sled; lower controlled to 90° and drive forcefully through midfoot for explosive ring push-off.',
      backCare: 'Keep tailbone and lower back pressed flat against the seat pad — never let hips tuck off the cushion.'
    },
    'Treadmill – Aerobic Zone 2 Base Run': {
      equip: 'Treadmill',
      goal: 'Fight-camp aerobic engine & heart-rate efficiency',
      cue: 'Set 1–2% incline at steady conversational pace; focus on quiet mid-foot landings, upright posture, and controlled nasal breathing.'
    },
    'Treadmill – 3-Min Fight Interval Runs': {
      equip: 'Treadmill',
      goal: 'Championship 3:00 round conditioning & 60s recovery',
      cue: 'Set 1.5% incline: push 85% hard running pace for 3:00 round, then drop immediately to a 4–5 km/h active walk during 1:00 corner rest.'
    },
    'Treadmill – Hill Incline Sprints (8–10%)': {
      equip: 'Treadmill',
      goal: 'Explosive calves, glutes & anaerobic capacity',
      cue: 'Set 8–10% incline: drive knees hard for 30s sprints pumping boxing-guard arms, then straddle rails safely or walk 30s between bouts.'
    },
    'Treadmill – Fartlek Fight Surges': {
      equip: 'Treadmill',
      goal: 'Chaos pace shifts (simulating exchanges off the ropes)',
      cue: 'At 2% incline, hold steady jog and surge into 20s fast sprints every minute as if emptying combinations in the final seconds.'
    },
    'Treadmill – Active Recovery Cool-Down Walk': {
      equip: 'Treadmill',
      goal: 'Gradual heart-rate drop & calf flush',
      cue: '0–1% incline at easy 3.5–4.5 km/h; focus on 4-second nasal inhales and 6-second exhales until breathing settles.'
    },
    'Cool-Down Flush Shadowboxing': {
      equip: 'None',
      goal: 'Active blood lactate clearance',
      cue: 'Drop pace to 30%. Throw slow, loose punches and shake out shoulders and calves between strikes.'
    },
    'Cool-Down Static Stretch & Decompression': {
      equip: 'None',
      goal: 'Shoulder, hip flexor & lumbar recovery',
      cue: 'Hold chest opener, hip-flexor lunge, hamstring hinge, and child’s pose for 30s each with deep nasal belly breaths.'
    }
  };

  const CORNER_TIPS = [
    'Deep breath in through the nose for 4 seconds, long exhale out — drop your heart rate before the bell.',
    'Check your guard: keep both elbows tucked to your ribs and rear glove glued to your cheekbone.',
    'Power starts at the canvas. Pivot your back heel on every cross and sit into your hips on hooks.',
    'Relax your shoulders between combinations. Tension slows hand speed and drains your gas tank.',
    'Never exit straight backward after finishing a combo — step off at a 45° angle or pivot out.',
    'Exhale sharply ("shh!") on every punch so your core stays armored against counters.',
    'Double up your jab this round — disrupt your opponent’s timing before firing the right hand.',
    'Change levels with your knees, not your waist, whenever you attack the body.',
    'Bring every punch straight back to your chin faster than you threw it out.',
    'Keep your eyes locked on the opponent’s chest center; peripheral vision reads hooks and uppercuts.',
    'Stay light on the balls of your feet — avoid planting flat-footed in pocket range.',
    'Mix tempo: throw light touching jabs to mask the one explosive power shot that follows.',
    'When slipping, move just enough to miss by an inch so you stay close enough to fire back immediately.',
    'Attack the body early to bring their elbows down — then rip hooks upstairs.',
    'Shake out your calves and forearms right now. Reset mentally and win the opening 15 seconds.',
    'Use feints to draw out their reaction before committing to your 3-punch sequence.',
    'Keep your chin tucked down against your collarbone — protect the off-button under fatigue.',
    'Championship rounds are won on discipline: crisp hands up even when your arms feel heavy.'
  ];

  global.BoxingData = {
    PUNCH_DATA,
    PUNCH_ALIASES,
    TECHNIQUE_LIBRARY,
    EXERCISE_INFO,
    CORNER_TIPS,
    resolvePunchKey,
    getPunchMeta,
    getStanceHand,
    getStanceTargetSide,
    getPunchDisplayLabel
  };
})(typeof window !== 'undefined' ? window : globalThis);
