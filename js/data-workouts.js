/* ── BOXING COACH PRO v3.0 — REALISTIC WORKOUT CAMPS, ON-DEMAND LIBRARY & 4-PHASE TRX ── */
(function (global) {
  'use strict';

  const PHASE_META = {
    warmup:   { label: 'Warm-up',   cls: 'eph-warmup',   color: '#F5A623' },
    boxing:   { label: 'Boxing',    cls: 'eph-boxing',   color: '#EF3E36' },
    strength: { label: 'Strength',  cls: 'eph-strength', color: '#3B82F6' },
    core:     { label: 'Core',      cls: 'eph-core',     color: '#22C55E' },
    cooldown: { label: 'Cool-down', cls: 'eph-cooldown', color: '#00D2B4' },
    rest:     { label: 'Rest',      cls: 'eph-rest',     color: '#94A3B8' }
  };

  function restBlock(secs, detail) {
    return {
      name: 'Rest',
      phase: 'rest',
      secs: secs || 30,
      rounds: 1,
      restBetween: 0,
      detail: detail || 'Shake out shoulders and breathe deep'
    };
  }

  /* ── SHARED REALISTIC WARM-UP & COOL-DOWN BUILDING BLOCKS ── */
  const WU_BEG = [
    { name: 'Jump rope – Boxer Skip', phase: 'warmup', secs: 120, rounds: 1, restBetween: 0, detail: 'Light rhythm on balls of feet' },
    { name: 'Arm Circles, Shoulder & Spine Prep', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Open shoulders & thoracic rotation' },
    { name: 'Dynamic Shadow Flow & Footwork', phase: 'warmup', secs: 90, rounds: 1, restBetween: 0, detail: 'Loose jabs, stance balance, chin tucked' },
    restBlock(30, 'Wrap check, water sip & deep breath')
  ];

  const WU_INT = [
    { name: 'Jump rope – Fast Singles', phase: 'warmup', secs: 180, rounds: 1, restBetween: 0, detail: '3-min boxing rhythm with wrist flicks' },
    { name: 'Neck, Wrist & Hip Mobilisation', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Prepare joints for heavy rotation' },
    { name: 'Dynamic Shadow Flow & Footwork', phase: 'warmup', secs: 120, rounds: 1, restBetween: 0, detail: 'Step-drag, jab entries, light slips' },
    restBlock(30, 'Gloves on — lock focus for round 1')
  ];

  const WU_ADV = [
    { name: 'Jump rope – Double Unders & Sprints', phase: 'warmup', secs: 180, rounds: 2, restBetween: 30, detail: '20s boxer skip / 10s sprint cycles' },
    { name: 'Neck, Wrist & Hip Mobilisation', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Controlled ROM & wrist lock check' },
    { name: 'Dynamic Shadow Flow & Footwork', phase: 'warmup', secs: 120, rounds: 1, restBetween: 0, detail: 'Sharp fight pace, feints & exits' },
    restBlock(30, 'Hands wrapped tight — championship focus')
  ];

  const CD_STD = [
    { name: 'Cool-Down Flush Shadowboxing', phase: 'cooldown', secs: 90, rounds: 1, restBetween: 0, detail: '30% speed — flush lactic acid from arms' },
    { name: 'Cool-Down Static Stretch & Decompression', phase: 'cooldown', secs: 150, rounds: 1, restBetween: 0, detail: 'Chest, shoulders, hip flexors & low back' }
  ];

  /* ── SCHEDULED FIGHT CAMP: BEGINNER (2-Min Rounds, 60s Rest) ── */
  const WORKOUTS_BEG = {
    A: {
      id: 'A',
      label: 'Day A – Power',
      subtitle: 'Heavy Bag Impact & Multi-Gym Strength',
      pill: 'pa',
      color: '#EF3E36',
      gearIds: ['heavy_bag', 'jump_rope', 'gym_machine'],
      equipment: ['Heavy Bag', 'Multi-Gym Machine', 'Jump Rope'],
      focus: 'Straight power mechanics, 1–2–3 rotation, explosive machine press & leg drive.',
      exercises: [
        ...WU_BEG,
        {
          name: 'Shadowboxing – 1-2 Range & Stance',
          phase: 'boxing', secs: 120, rounds: 2, restBetween: 60,
          detail: 'Full extension on 1–2, snap hands back to chin',
          comboTags: ['fundamentals', 'jab_mastery'],
          allowedPunches: ['jab', 'cross', 'slip-l', 'slip-r']
        },
        restBlock(45, 'Gloves on — step to the heavy bag'),
        {
          name: 'Heavy Bag – 1-2-3 Foundation Combos',
          phase: 'boxing', secs: 120, rounds: 3, restBetween: 60,
          detail: 'Rotate hips cleanly on every cross and lead hook',
          comboTags: ['fundamentals', 'power'],
          allowedPunches: ['jab', 'cross', 'lead-hook', 'body-jab'],
          noBack: true
        },
        restBlock(45, 'Gloves off — step to your multi-gym station'),
        { name: 'Multi-Gym – Explosive Chest Press', phase: 'strength', secs: 45, rounds: 2, restBetween: 35, detail: '8–10 explosive presses, 2s controlled return' },
        { name: 'Multi-Gym – Leg Press / Leg Drive Power', phase: 'strength', secs: 45, rounds: 2, restBetween: 35, detail: '10–12 crisp reps — keep tailbone glued to pad' },
        { name: 'Multi-Gym – Cable Woodchopper (Rotational Torque)', phase: 'core', secs: 45, rounds: 2, restBetween: 25, detail: '10 reps/side pivoting back heel cleanly', noBack: true },
        ...CD_STD
      ]
    },
    B: {
      id: 'B',
      label: 'Day B – Speed',
      subtitle: 'Ali Shuffle Rope, Footwork & Rotational Cable Snap',
      pill: 'pb',
      color: '#3B82F6',
      gearIds: ['jump_rope', 'gym_machine'],
      equipment: ['Jump Rope', 'Multi-Gym Machine'],
      focus: 'Light feet, fast retraction, standing cable punch press & shoulder health.',
      exercises: [
        { name: 'Jump rope – Ali Shuffle & Footwork', phase: 'warmup', secs: 120, rounds: 1, restBetween: 0, detail: 'Switch stances smoothly on balls of feet' },
        { name: 'Arm Circles, Shoulder & Spine Prep', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Open shoulders & thoracic rotation' },
        restBlock(30, 'Lock your fighting stance'),
        {
          name: 'Footwork-Only Pendulum & Box Drill',
          phase: 'boxing', secs: 120, rounds: 2, restBetween: 60,
          detail: 'Zero punches — master glide step & 90° pivots',
          comboTags: ['angles', 'cuban'],
          allowedPunches: ['pivot', 'slip-l', 'slip-r', 'feint']
        },
        restBlock(30, 'Add crisp fast hands to your footwork'),
        {
          name: 'Shadowboxing – Rapid Hand Speed',
          phase: 'boxing', secs: 120, rounds: 3, restBetween: 60,
          detail: 'Relaxed shoulders, snappy straight flurries',
          comboTags: ['speed', 'fundamentals', 'jab_mastery'],
          allowedPunches: ['jab', 'cross', 'lead-hook', 'feint']
        },
        restBlock(40, 'Standing cable speed & shoulder armor'),
        { name: 'Multi-Gym – Single-Arm Rotational Punch Press', phase: 'strength', secs: 45, rounds: 2, restBetween: 30, detail: '8 explosive reps/arm pivoting rear heel' },
        { name: 'Multi-Gym – Cable Face Pulls & Rotator Cuff', phase: 'strength', secs: 45, rounds: 2, restBetween: 30, detail: '12–15 controlled reps — thumbs back' },
        { name: 'Pogo Ankle Hops & Skater Bounds', phase: 'core', secs: 40, rounds: 2, restBetween: 25, detail: 'Springy ankles & lateral balance' },
        ...CD_STD
      ]
    },
    C: {
      id: 'C',
      label: 'Day C – Conditioning',
      subtitle: 'Body Work, High-Knee Rope & Treadmill Hill Engine',
      pill: 'pc',
      color: '#22C55E',
      gearIds: ['heavy_bag', 'jump_rope', 'treadmill', 'gym_machine'],
      equipment: ['Heavy Bag', 'Jump Rope', 'Treadmill', 'Multi-Gym Machine'],
      focus: 'Level changing, body punches, jump-rope sprints & uphill treadmill conditioning.',
      exercises: [
        { name: 'Jump rope – 30/30 High-Knee Sprint Intervals', phase: 'warmup', secs: 120, rounds: 1, restBetween: 0, detail: '30s boxer skip / 30s high knees' },
        { name: 'Neck, Wrist & Hip Mobilisation', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Loosen hips for body shots & sprints' },
        restBlock(30, 'Gloves on — attack the body'),
        {
          name: 'Heavy Bag – Guard & Body Basics',
          phase: 'boxing', secs: 120, rounds: 3, restBetween: 60,
          detail: 'Bend knees for body shots — bring hands straight back up',
          comboTags: ['body_snatcher', 'fundamentals'],
          allowedPunches: ['jab', 'cross', 'body-jab', 'body-cross', 'body-lead-hook', 'lead-hook'],
          noBack: true
        },
        restBlock(45, 'Step onto your treadmill (8% incline) or clear floor space'),
        { name: 'Treadmill – Hill Incline Sprints (8–10%)', phase: 'strength', secs: 35, rounds: 3, restBetween: 35, detail: '35s strong incline drive / 35s rail recovery' },
        { name: 'Multi-Gym – Cable Pallof Press (Anti-Rotation)', phase: 'core', secs: 45, rounds: 2, restBetween: 25, detail: 'Brace ribs against rotational cable pull' },
        { name: 'Treadmill – Active Recovery Cool-Down Walk', phase: 'cooldown', secs: 120, rounds: 1, restBetween: 0, detail: 'Easy 4.0 km/h walk — slow nasal breaths' },
        { name: 'Cool-Down Static Stretch & Decompression', phase: 'cooldown', secs: 120, rounds: 1, restBetween: 0, detail: 'Calves, hip flexors & low back' }
      ]
    },
    D: {
      id: 'D',
      label: 'Day D – Ringcraft',
      subtitle: 'Defense, Check Hooks & Guard-Posture Pulls',
      pill: 'pd',
      color: '#F5A623',
      gearIds: ['heavy_bag', 'jump_rope', 'gym_machine'],
      equipment: ['Heavy Bag', 'Jump Rope', 'Multi-Gym Machine'],
      focus: 'Head movement tied to weight shift, check hooks, cable rows & neck stability.',
      exercises: [
        ...WU_BEG,
        {
          name: 'Shadowboxing – Peek-a-Boo Slips & Rolls',
          phase: 'boxing', secs: 120, rounds: 2, restBetween: 60,
          detail: 'Nose-over-knee slips and compact U-rolls',
          comboTags: ['peekaboo', 'counter'],
          allowedPunches: ['jab', 'cross', 'slip-l', 'slip-r', 'roll', 'lead-hook']
        },
        restBlock(30, 'Apply angles and counters on the bag or in air'),
        {
          name: 'Heavy Bag – Check Hooks & Pivot Exits',
          phase: 'boxing', secs: 120, rounds: 2, restBetween: 60,
          detail: 'Pivot 90° off-line as you clip the check hook',
          comboTags: ['angles', 'cuban', 'counter'],
          allowedPunches: ['jab', 'cross', 'lead-hook', 'pivot', 'feint']
        },
        restBlock(45, 'Upper-back retraction & core armor'),
        { name: 'Multi-Gym – Seated Cable Row (Guard Retraction)', phase: 'strength', secs: 45, rounds: 2, restBetween: 30, detail: '10–12 crisp pulls to lower ribs' },
        { name: 'Multi-Gym – Lat Pulldown (Punch Snap & Posture)', phase: 'strength', secs: 45, rounds: 2, restBetween: 30, detail: '10–12 reps to upper collarbone' },
        { name: 'Isometric Neck & Anti-Rotation Plank', phase: 'core', secs: 45, rounds: 2, restBetween: 25, detail: 'Gentle 4-way hand resistance + plank' },
        ...CD_STD
      ]
    }
  };

  /* ── SCHEDULED FIGHT CAMP: INTERMEDIATE (3-Min Rounds, 60s Rest) ── */
  const WORKOUTS_INT = {
    A: {
      id: 'A',
      label: 'Day A – Power',
      subtitle: 'Heavy Impact & Multi-Gym Knockout Torque',
      pill: 'pa',
      color: '#EF3E36',
      gearIds: ['heavy_bag', 'jump_rope', 'gym_machine'],
      equipment: ['Heavy Bag', 'Multi-Gym Machine', 'Jump Rope'],
      focus: 'Full 3-minute heavy rounds, body-to-head hooks & explosive machine power.',
      exercises: [
        ...WU_INT,
        {
          name: 'Shadowboxing – 1-2-3 Rotational Flow',
          phase: 'boxing', secs: 180, rounds: 2, restBetween: 60,
          detail: 'Snap hips cleanly behind every 1–2–3–2',
          comboTags: ['fundamentals', 'power'],
          allowedPunches: ['jab', 'cross', 'lead-hook', 'rear-hook', 'slip-l', 'slip-r']
        },
        restBlock(45, 'Gloves tight — attack the heavy bag'),
        {
          name: 'Heavy Bag – Power Impact & Weight Transfer',
          phase: 'boxing', secs: 180, rounds: 3, restBetween: 60,
          detail: 'Sit down on 3–5 punch power combinations',
          comboTags: ['power', 'body_snatcher'],
          noBack: true
        },
        restBlock(45, 'Gloves off — multi-gym explosive circuit'),
        { name: 'Multi-Gym – Explosive Chest Press', phase: 'strength', secs: 45, rounds: 3, restBetween: 35, detail: '8–10 explosive presses, slow 2s return' },
        { name: 'Multi-Gym – Leg Press / Leg Drive Power', phase: 'strength', secs: 45, rounds: 3, restBetween: 35, detail: '10–12 powerful midfoot drives' },
        { name: 'Multi-Gym – Cable Woodchopper (Rotational Torque)', phase: 'core', secs: 50, rounds: 3, restBetween: 25, detail: '10 reps/side from hip to shoulder', noBack: true },
        ...CD_STD
      ]
    },
    B: {
      id: 'B',
      label: 'Day B – Speed',
      subtitle: 'Ali Shuffle Rope, Cuban Footwork & Cable Punch Snap',
      pill: 'pb',
      color: '#3B82F6',
      gearIds: ['heavy_bag', 'jump_rope', 'gym_machine'],
      equipment: ['Jump Rope', 'Multi-Gym Machine', 'Heavy Bag'],
      focus: 'Pendulum entries, L-step exits, standing cable rotation & rapid flurries.',
      exercises: [
        { name: 'Jump rope – Ali Shuffle & Footwork', phase: 'warmup', secs: 180, rounds: 1, restBetween: 0, detail: '3-min fluid stance switches & lateral hops' },
        { name: 'Neck, Wrist & Hip Mobilisation', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Joint & ankle reactivity prep' },
        restBlock(30, 'Lock your Cuban matador rhythm'),
        {
          name: 'Shadowboxing – Cuban Pendulum & Angles',
          phase: 'boxing', secs: 180, rounds: 2, restBetween: 60,
          detail: 'Double jab glide entries into 90° L-step pivots',
          comboTags: ['cuban', 'angles', 'jab_mastery']
        },
        restBlock(45, 'Keep shoulders loose for speed rounds'),
        {
          name: 'Heavy Bag – Rapid Hand Speed Flurries',
          phase: 'boxing', secs: 180, rounds: 3, restBetween: 45,
          detail: 'Non-stop snapping 4–6 punch bursts, quick reset',
          comboTags: ['speed', 'fundamentals', 'angles']
        },
        restBlock(45, 'Cable speed & shoulder prehab'),
        { name: 'Multi-Gym – Single-Arm Rotational Punch Press', phase: 'strength', secs: 50, rounds: 3, restBetween: 30, detail: '10 fast presses/arm pivoting rear foot' },
        { name: 'Multi-Gym – Cable Face Pulls & Rotator Cuff', phase: 'strength', secs: 45, rounds: 3, restBetween: 25, detail: '15 reps for bulletproof shoulders' },
        { name: 'Pogo Ankle Hops & Skater Bounds', phase: 'core', secs: 45, rounds: 2, restBetween: 30, detail: 'Minimal ground contact time' },
        ...CD_STD
      ]
    },
    C: {
      id: 'C',
      label: 'Day C – Conditioning',
      subtitle: 'Body Snatcher, High-Knee Rope & Treadmill Sprints',
      pill: 'pc',
      color: '#22C55E',
      gearIds: ['heavy_bag', 'jump_rope', 'treadmill', 'gym_machine'],
      equipment: ['Heavy Bag', 'Jump Rope', 'Treadmill', 'Multi-Gym Machine'],
      focus: 'Sustained body-to-head pressure, rope sprints & steep uphill treadmill power.',
      exercises: [
        { name: 'Jump rope – 30/30 High-Knee Sprint Intervals', phase: 'warmup', secs: 180, rounds: 1, restBetween: 0, detail: '30s boxer skip / 30s rapid high knees' },
        { name: 'Dynamic Shadow Flow & Footwork', phase: 'warmup', secs: 90, rounds: 1, restBetween: 0, detail: 'Warm shoulders & hips' },
        restBlock(30, 'Gloves on — rip the midsection'),
        {
          name: 'Heavy Bag – Mexican Body Snatcher',
          phase: 'boxing', secs: 180, rounds: 3, restBetween: 60,
          detail: 'Blind high, rip 45° hooks to ribs, finish upstairs',
          comboTags: ['body_snatcher', 'inside'],
          noBack: true
        },
        restBlock(45, 'Breathe deep — burnout round next'),
        {
          name: 'Heavy Bag – 30/30 Championship Burnout',
          phase: 'boxing', secs: 180, rounds: 2, restBetween: 60,
          detail: 'Follow callouts at 75%, sprint 1-2s on tempo surges',
          comboTags: ['speed', 'power'],
          noBack: true
        },
        restBlock(45, 'Step onto treadmill (8–10% incline)'),
        { name: 'Treadmill – Hill Incline Sprints (8–10%)', phase: 'strength', secs: 30, rounds: 5, restBetween: 30, detail: '30s hard uphill drive / 30s rail rest' },
        { name: 'Multi-Gym – Cable Pallof Press (Anti-Rotation)', phase: 'core', secs: 50, rounds: 3, restBetween: 25, detail: 'Resist rotational cable tension' },
        { name: 'Treadmill – Active Recovery Cool-Down Walk', phase: 'cooldown', secs: 120, rounds: 1, restBetween: 0, detail: 'Easy recovery pace + nasal breathing' },
        { name: 'Cool-Down Static Stretch & Decompression', phase: 'cooldown', secs: 120, rounds: 1, restBetween: 0, detail: 'Calves, quads, hip flexors & low back' }
      ]
    },
    D: {
      id: 'D',
      label: 'Day D – Ringcraft',
      subtitle: 'Peek-a-Boo Counters & Back-Armor Cable Pulls',
      pill: 'pd',
      color: '#F5A623',
      gearIds: ['heavy_bag', 'jump_rope', 'gym_machine'],
      equipment: ['Heavy Bag', 'Jump Rope', 'Multi-Gym Machine'],
      focus: 'Defense triggers offense: slip, roll, pull, parry, counter angles & guard posture.',
      exercises: [
        ...WU_INT,
        {
          name: 'Shadowboxing – Defensive Counters',
          phase: 'boxing', secs: 180, rounds: 2, restBetween: 60,
          detail: 'Parry, pull or slip first — fire instant 3-punch counter',
          comboTags: ['counter', 'philly_shell', 'peekaboo']
        },
        restBlock(45, 'Take your defense to the heavy bag'),
        {
          name: 'Heavy Bag – Counter-Puncher’s Trap',
          phase: 'boxing', secs: 180, rounds: 3, restBetween: 60,
          detail: 'Slip the swinging bag, counter sharp & pivot off-line',
          comboTags: ['counter', 'angles', 'cuban']
        },
        restBlock(45, 'Posterior-chain pull, core & neck armor'),
        { name: 'Multi-Gym – Seated Cable Row (Guard Retraction)', phase: 'strength', secs: 45, rounds: 3, restBetween: 30, detail: '10–12 fast pulls, slow eccentric' },
        { name: 'Multi-Gym – Lat Pulldown (Punch Snap & Posture)', phase: 'strength', secs: 45, rounds: 3, restBetween: 30, detail: 'Drive elbows cleanly down' },
        { name: 'Multi-Gym – Cable Pallof Press (Anti-Rotation)', phase: 'core', secs: 45, rounds: 2, restBetween: 25, detail: 'Body-shot armor brace' },
        { name: 'Isometric Neck & Anti-Rotation Plank', phase: 'core', secs: 50, rounds: 2, restBetween: 25, detail: '4-way neck hold + rigid plank' },
        ...CD_STD
      ]
    }
  };

  /* ── SCHEDULED FIGHT CAMP: ADVANCED (3-Min Rounds, 45s Championship Rest) ── */
  const WORKOUTS_ADV = {
    A: {
      id: 'A',
      label: 'Day A – Power',
      subtitle: 'Title Power Pyramid & Heavy Multi-Gym Drive',
      pill: 'pa',
      color: '#EF3E36',
      gearIds: ['heavy_bag', 'jump_rope', 'gym_machine'],
      equipment: ['Heavy Bag', 'Multi-Gym Machine', 'Jump Rope'],
      focus: '4-round heavy bag war, 1-to-10 pyramid output & maximal cable/leg drive.',
      exercises: [
        ...WU_ADV,
        {
          name: 'Shadowboxing – Championship Ghost Sparring',
          phase: 'boxing', secs: 180, rounds: 2, restBetween: 45,
          detail: 'Feint, stalk, slip counters & unload crisp 5-punch bursts',
          comboTags: ['power', 'counter', 'angles']
        },
        restBlock(45, 'Gloves on — championship power rounds'),
        {
          name: 'Heavy Bag – Power Pyramid (1-to-10)',
          phase: 'boxing', secs: 180, rounds: 4, restBetween: 45,
          detail: 'Climb volume while sitting hard on every hook & cross',
          comboTags: ['power', 'inside', 'body_snatcher'],
          noBack: true
        },
        restBlock(45, 'Multi-gym explosive strength & rotational core'),
        { name: 'Multi-Gym – Explosive Chest Press', phase: 'strength', secs: 50, rounds: 3, restBetween: 35, detail: 'Heavy explosive push, 2s controlled return' },
        { name: 'Multi-Gym – Leg Press / Leg Drive Power', phase: 'strength', secs: 50, rounds: 3, restBetween: 35, detail: 'Forceful midfoot drive' },
        { name: 'Multi-Gym – Cable Woodchopper (Rotational Torque)', phase: 'core', secs: 55, rounds: 3, restBetween: 25, detail: 'Explosive diagonal torque both sides', noBack: true },
        ...CD_STD
      ]
    },
    B: {
      id: 'B',
      label: 'Day B – Speed',
      subtitle: 'Ali Shuffle, Cuban Angles & Cable Tricep Lockout',
      pill: 'pb',
      color: '#3B82F6',
      gearIds: ['heavy_bag', 'jump_rope', 'gym_machine'],
      equipment: ['Jump Rope', 'Heavy Bag', 'Multi-Gym Machine'],
      focus: 'Pro sparring cadence, Lomachenko pivots, rotational cable speed & lockout snap.',
      exercises: [
        { name: 'Jump rope – Ali Shuffle & Footwork', phase: 'warmup', secs: 180, rounds: 2, restBetween: 30, detail: 'Fast stance switches & rapid wrist turns' },
        { name: 'Neck, Wrist & Hip Mobilisation', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Shoulder & ankle prep' },
        restBlock(30, 'Shadowbox Cuban angles'),
        {
          name: 'Shadowboxing – Cuban Pendulum & Angles',
          phase: 'boxing', secs: 180, rounds: 3, restBetween: 45,
          detail: 'Never stand on one track twice — pivot out of every burst',
          comboTags: ['cuban', 'angles', 'speed']
        },
        restBlock(45, 'Fast hands on the bag — 45s corners'),
        {
          name: 'Heavy Bag – Rapid Hand Speed Flurries',
          phase: 'boxing', secs: 180, rounds: 4, restBetween: 45,
          detail: 'High-speed shoeshine bursts & immediate defensive resets',
          comboTags: ['speed', 'inside', 'cuban']
        },
        restBlock(45, 'Speed-strength cable block'),
        { name: 'Multi-Gym – Single-Arm Rotational Punch Press', phase: 'strength', secs: 50, rounds: 3, restBetween: 25, detail: 'Max speed punch extension with hip snap' },
        { name: 'Multi-Gym – Cable Tricep Pushdowns (Punch Lockout)', phase: 'strength', secs: 45, rounds: 3, restBetween: 25, detail: 'Crisp elbow snap for 1–2 speed' },
        { name: 'Multi-Gym – Cable Face Pulls & Rotator Cuff', phase: 'core', secs: 45, rounds: 2, restBetween: 25, detail: 'Keep shoulders bulletproof' },
        ...CD_STD
      ]
    },
    C: {
      id: 'C',
      label: 'Day C – Conditioning',
      subtitle: 'Deep Waters Burnout, Rope Sprints & Treadmill Hills',
      pill: 'pc',
      color: '#22C55E',
      gearIds: ['heavy_bag', 'jump_rope', 'treadmill', 'gym_machine'],
      equipment: ['Heavy Bag', 'Jump Rope', 'Treadmill', 'Multi-Gym Machine'],
      focus: '6+ fighting rounds, high-knee sprints, steep hill sprints & iron core armor.',
      exercises: [
        { name: 'Jump rope – 30/30 High-Knee Sprint Intervals', phase: 'warmup', secs: 180, rounds: 2, restBetween: 30, detail: 'High-tempo jump rope intervals' },
        { name: 'Neck, Wrist & Hip Mobilisation', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Joint prep' },
        restBlock(30, 'Gloves on — championship body rounds'),
        {
          name: 'Heavy Bag – Mexican Body Snatcher',
          phase: 'boxing', secs: 180, rounds: 3, restBetween: 45,
          detail: 'Pressure forward, rip 3b–4b inside & finish upstairs',
          comboTags: ['body_snatcher', 'inside'],
          noBack: true
        },
        restBlock(45, '45-second corner — empty the tank next'),
        {
          name: 'Heavy Bag – 30/30 Championship Burnout',
          phase: 'boxing', secs: 180, rounds: 3, restBetween: 45,
          detail: 'Zero pause — relentless straight and hook bursts',
          comboTags: ['speed', 'power'],
          noBack: true
        },
        restBlock(45, 'Championship treadmill hill sprints'),
        { name: 'Treadmill – Hill Incline Sprints (8–10%)', phase: 'strength', secs: 30, rounds: 6, restBetween: 30, detail: 'All-out 10% uphill drive / 30s rail recovery' },
        { name: 'Multi-Gym – Cable Pallof Press (Anti-Rotation)', phase: 'core', secs: 55, rounds: 3, restBetween: 20, detail: 'Rock-solid core brace under peak heart rate' },
        { name: 'Treadmill – Active Recovery Cool-Down Walk', phase: 'cooldown', secs: 120, rounds: 1, restBetween: 0, detail: 'Drop heart rate smoothly' },
        { name: 'Cool-Down Static Stretch & Decompression', phase: 'cooldown', secs: 120, rounds: 1, restBetween: 0, detail: 'Full recovery stretch' }
      ]
    },
    D: {
      id: 'D',
      label: 'Day D – Ringcraft',
      subtitle: 'Title Simulation, Guard-Pull Strength & Neck Iron',
      pill: 'pd',
      color: '#F5A623',
      gearIds: ['heavy_bag', 'jump_rope', 'gym_machine'],
      equipment: ['Heavy Bag', 'Jump Rope', 'Multi-Gym Machine'],
      focus: 'Peek-a-Boo & Philly Shell transitions across 7 rounds + heavy pull/neck armor.',
      exercises: [
        ...WU_ADV,
        {
          name: 'Shadowboxing – Peek-a-Boo Slips & Rolls',
          phase: 'boxing', secs: 180, rounds: 3, restBetween: 45,
          detail: 'Constant upper-body motion into 6–3–2 ambushes',
          comboTags: ['peekaboo', 'counter', 'philly_shell']
        },
        restBlock(45, 'Step to the heavy bag for live simulation'),
        {
          name: 'Heavy Bag – Title Fight Simulation',
          phase: 'boxing', secs: 180, rounds: 4, restBetween: 45,
          detail: 'Full 360° ring movement, feints, counters & final-30s blitz',
          comboTags: ['counter', 'angles', 'cuban', 'power'],
          noBack: true
        },
        restBlock(45, 'Posterior pull, anti-rotation & neck armor'),
        { name: 'Multi-Gym – Seated Cable Row (Guard Retraction)', phase: 'strength', secs: 50, rounds: 3, restBetween: 30, detail: 'Heavy upper-back snap & posture' },
        { name: 'Multi-Gym – Lat Pulldown (Punch Snap & Posture)', phase: 'strength', secs: 50, rounds: 3, restBetween: 30, detail: 'Full lat stretch & crisp drive' },
        { name: 'Multi-Gym – Cable Pallof Press (Anti-Rotation)', phase: 'core', secs: 50, rounds: 2, restBetween: 20, detail: 'Sideways anti-rotation hold' },
        { name: 'Isometric Neck & Anti-Rotation Plank', phase: 'core', secs: 60, rounds: 2, restBetween: 20, detail: '4-way cervical strength + plank' },
        ...CD_STD
      ]
    }
  };

  /* ── ON-DEMAND CURATED WORKOUT LIBRARY (16 SPECIALTY SESSIONS) ── */
  const LIBRARY_WORKOUTS = [
    /* Heavy Bag – Beginner (3) */
    {
      id: 'hb_beg_1',
      category: 'heavy_bag',
      level: 'beginner',
      label: 'Jab Command & Range',
      subtitle: 'Master distance, stutter jabs & clean guard recovery',
      pill: 'pa',
      color: '#F5A623',
      equipment: ['Heavy Bag', 'Wraps & Gloves'],
      focus: 'Use single, double & body jabs to control range without smothering your power.',
      exercises: [
        { name: 'Jump rope – Boxer Skip', phase: 'warmup', secs: 120, rounds: 1, restBetween: 0, detail: 'Light calves, loose wrists' },
        { name: 'Arm Circles, Shoulder & Spine Prep', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Shoulder & wrist readiness' },
        restBlock(30, 'Gloves on — measure arm-length range on the bag'),
        {
          name: 'Heavy Bag – Jab Command & Range',
          phase: 'boxing', secs: 120, rounds: 3, restBetween: 60,
          detail: 'Snap 1, 1–1, 1–1–1 & 1b without pushing the bag',
          comboTags: ['jab_mastery', 'fundamentals'],
          allowedPunches: ['jab', 'body-jab', 'feint'],
          noBack: true
        },
        {
          name: 'Heavy Bag – 1-2-3 Foundation Combos',
          phase: 'boxing', secs: 120, rounds: 2, restBetween: 60,
          detail: 'Follow your jab command with crisp 1–2s',
          comboTags: ['fundamentals'],
          allowedPunches: ['jab', 'cross', 'body-jab'],
          noBack: true
        },
        restBlock(30, 'Gloves off — short strength & core'),
        { name: 'Boxer’s Push-Ups (Staggered)', phase: 'strength', secs: 35, rounds: 2, restBetween: 30, detail: 'Controlled chest-to-floor press' },
        { name: 'Forearm Plank & Side Plank', phase: 'core', secs: 40, rounds: 2, restBetween: 20, detail: 'Tight abs & neutral pelvis' },
        ...CD_STD
      ]
    },
    {
      id: 'hb_beg_2',
      category: 'heavy_bag',
      level: 'beginner',
      label: '1-2-3 Foundation Bag',
      subtitle: 'Clean rotation on boxing’s highest-percentage combination',
      pill: 'pa',
      color: '#F5A623',
      equipment: ['Heavy Bag', 'Wraps & Gloves'],
      focus: 'Connect jab, cross, and 90° lead hook with balanced footwork.',
      exercises: [
        { name: 'Jump rope – Boxer Skip', phase: 'warmup', secs: 120, rounds: 1, restBetween: 0, detail: 'Smooth bounce rhythm' },
        { name: 'Dynamic Shadow Flow & Footwork', phase: 'warmup', secs: 90, rounds: 1, restBetween: 0, detail: 'Rehearse 1–2–3 in open air' },
        restBlock(30, 'Gloves on — face the heavy bag'),
        {
          name: 'Heavy Bag – 1-2-3 Foundation Combos',
          phase: 'boxing', secs: 120, rounds: 4, restBetween: 60,
          detail: 'Pivot rear foot on 2, front foot on 3',
          comboTags: ['fundamentals', 'power'],
          allowedPunches: ['jab', 'cross', 'lead-hook', 'rear-hook'],
          noBack: true
        },
        restBlock(30, 'Gloves off — legs & core'),
        { name: 'Bodyweight Squats & Shadow Guard', phase: 'strength', secs: 40, rounds: 2, restBetween: 30, detail: 'Gloves high on jaw' },
        { name: 'Forearm Plank & Side Plank', phase: 'core', secs: 40, rounds: 2, restBetween: 20, detail: 'Hold rigid' },
        ...CD_STD
      ]
    },
    {
      id: 'hb_beg_3',
      category: 'heavy_bag',
      level: 'beginner',
      label: 'Guard & Body Basics',
      subtitle: 'High-low target switching & chin discipline',
      pill: 'pa',
      color: '#F5A623',
      equipment: ['Heavy Bag', 'Wraps & Gloves'],
      focus: 'Bend knees to strike the ribs cleanly without leaning forward.',
      exercises: [
        { name: 'Jump rope – Boxer Skip', phase: 'warmup', secs: 120, rounds: 1, restBetween: 0, detail: 'Light pace' },
        { name: 'Neck, Wrist & Hip Mobilisation', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Loosen hips for level changes' },
        restBlock(30, 'Gloves on — stay compact'),
        {
          name: 'Heavy Bag – Guard & Body Basics',
          phase: 'boxing', secs: 120, rounds: 3, restBetween: 60,
          detail: '1–2 upstairs, drop knees for 1b, 2b & 3b',
          comboTags: ['body_snatcher', 'fundamentals'],
          allowedPunches: ['jab', 'cross', 'body-jab', 'body-cross', 'body-lead-hook', 'lead-hook'],
          noBack: true
        },
        {
          name: 'Heavy Bag – Jab Command & Range',
          phase: 'boxing', secs: 120, rounds: 2, restBetween: 60,
          detail: 'Reset distance after body exchanges',
          comboTags: ['fundamentals', 'angles'],
          allowedPunches: ['jab', 'cross', 'slip-l', 'lead-hook']
        },
        restBlock(30, 'Walking lunges & core'),
        { name: 'Walking Lunges & Torso Twist', phase: 'strength', secs: 40, rounds: 2, restBetween: 30, detail: 'Balanced posture' },
        ...CD_STD
      ]
    },

    /* Heavy Bag – Intermediate (3) */
    {
      id: 'hb_int_1',
      category: 'heavy_bag',
      level: 'intermediate',
      label: 'Mexican Body Snatcher',
      subtitle: '45° liver hooks & brutal high-low combinations',
      pill: 'pb',
      color: '#3B82F6',
      equipment: ['Heavy Bag', 'Wraps & Gloves'],
      focus: 'Drop your opponent’s elbows with body work and finish upstairs.',
      exercises: [
        ...WU_INT,
        {
          name: 'Heavy Bag – Mexican Body Snatcher',
          phase: 'boxing', secs: 180, rounds: 4, restBetween: 60,
          detail: 'Dig 3b and 4b into ribs, chain right into 3–2',
          comboTags: ['body_snatcher', 'inside'],
          noBack: true
        },
        {
          name: 'Heavy Bag – Power Impact & Weight Transfer',
          phase: 'boxing', secs: 180, rounds: 2, restBetween: 60,
          detail: 'Heavy 4-punch combinations with clean pivots out',
          comboTags: ['power', 'angles'],
          noBack: true
        },
        restBlock(30, 'Core armor finish'),
        { name: 'Rotational Russian Twists', phase: 'core', secs: 45, rounds: 2, restBetween: 25, detail: 'Ribcage torque', noBack: true },
        ...CD_STD
      ]
    },
    {
      id: 'hb_int_2',
      category: 'heavy_bag',
      level: 'intermediate',
      label: 'Counter-Puncher’s Trap',
      subtitle: 'Read the swinging bag, slip/parry & fire back immediately',
      pill: 'pb',
      color: '#3B82F6',
      equipment: ['Heavy Bag', 'Wraps & Gloves'],
      focus: 'Turn defensive movements (slip, roll, pull, parry) into instant counters.',
      exercises: [
        ...WU_INT,
        {
          name: 'Heavy Bag – Counter-Puncher’s Trap',
          phase: 'boxing', secs: 180, rounds: 3, restBetween: 60,
          detail: 'Slip or pull when bag swings at you, counter 2–3–2',
          comboTags: ['counter', 'philly_shell', 'peekaboo']
        },
        {
          name: 'Heavy Bag – Check Hooks & Pivot Exits',
          phase: 'boxing', secs: 180, rounds: 2, restBetween: 60,
          detail: '90° L-step pivot out of danger while landing 3',
          comboTags: ['angles', 'cuban', 'counter']
        },
        restBlock(30, 'Explosive lower-body finish'),
        { name: 'Split Squat Jumps (Boxing Stance)', phase: 'strength', secs: 45, rounds: 2, restBetween: 30, detail: 'Athletic landings' },
        ...CD_STD
      ]
    },
    {
      id: 'hb_int_3',
      category: 'heavy_bag',
      level: 'intermediate',
      label: 'Inside Pocket Warfare',
      subtitle: 'Short hooks, double uppercuts & rib-crushing frames',
      pill: 'pb',
      color: '#3B82F6',
      equipment: ['Heavy Bag', 'Wraps & Gloves'],
      focus: 'Stay chest-to-bag and dominate tight phone-booth exchanges.',
      exercises: [
        ...WU_INT,
        {
          name: 'Heavy Bag – Inside Pocket Warfare',
          phase: 'boxing', secs: 180, rounds: 4, restBetween: 60,
          detail: 'Tight 90° elbows — chain 5–6–3–4–3b cleanly',
          comboTags: ['inside', 'peekaboo', 'body_snatcher'],
          noBack: true
        },
        {
          name: 'Heavy Bag – 30/30 Championship Burnout',
          phase: 'boxing', secs: 180, rounds: 1, restBetween: 60,
          detail: '1 final round of nonstop inside shoeshine bursts',
          comboTags: ['speed', 'inside']
        },
        restBlock(30, 'Shoulder & core stability'),
        { name: 'Push-Ups – Shoulder Taps', phase: 'strength', secs: 45, rounds: 2, restBetween: 30, detail: 'Lock core & scapulae' },
        ...CD_STD
      ]
    },

    /* Heavy Bag – Advanced (3) */
    {
      id: 'hb_adv_1',
      category: 'heavy_bag',
      level: 'advanced',
      label: 'Power Pyramid 1-to-10',
      subtitle: 'Escalating volume with bad intentions on every shot',
      pill: 'pc',
      color: '#EF3E36',
      equipment: ['Heavy Bag', 'Wraps & Gloves'],
      focus: 'Maintain full hip snap from 2-punch setups up to 8-punch combinations.',
      exercises: [
        ...WU_ADV,
        {
          name: 'Heavy Bag – Power Pyramid (1-to-10)',
          phase: 'boxing', secs: 180, rounds: 4, restBetween: 45,
          detail: 'Ramp output each minute; pivot clean after every burst',
          comboTags: ['power', 'speed', 'inside'],
          noBack: true
        },
        {
          name: 'Heavy Bag – Mexican Body Snatcher',
          phase: 'boxing', secs: 180, rounds: 2, restBetween: 45,
          detail: 'Heavy body-to-head hooks on tired legs',
          comboTags: ['body_snatcher', 'power'],
          noBack: true
        },
        restBlock(30, 'Plyometric & core finisher'),
        { name: 'Explosive Plyo Push-Ups', phase: 'strength', secs: 45, rounds: 3, restBetween: 30, detail: 'Explode off the mat' },
        ...CD_STD
      ]
    },
    {
      id: 'hb_adv_2',
      category: 'heavy_bag',
      level: 'advanced',
      label: '8-Round Title Fight Sim',
      subtitle: 'Full championship pacing: feel-out, pocket war & championship finish',
      pill: 'pc',
      color: '#EF3E36',
      equipment: ['Heavy Bag', 'Jump Rope', 'Wraps & Gloves'],
      focus: '8 distinct boxing rounds (2 shadow + 6 heavy bag) with strict 45s corners.',
      exercises: [
        { name: 'Jump rope – Double Unders & Sprints', phase: 'warmup', secs: 180, rounds: 1, restBetween: 0, detail: 'Fast cardio prime' },
        { name: 'Neck, Wrist & Hip Mobilisation', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Joint prep' },
        restBlock(30, 'Touch gloves — 8 rounds of championship work'),
        {
          name: 'Shadowboxing – Cuban Pendulum & Angles',
          phase: 'boxing', secs: 180, rounds: 2, restBetween: 45,
          detail: 'Rounds 1–2: Feel out range, feints & pendulum angles',
          comboTags: ['cuban', 'angles', 'jab_mastery']
        },
        {
          name: 'Heavy Bag – Title Fight Simulation',
          phase: 'boxing', secs: 180, rounds: 4, restBetween: 45,
          detail: 'Rounds 3–6: Counter traps, body rips & tactical pivots',
          comboTags: ['counter', 'body_snatcher', 'power'],
          noBack: true
        },
        {
          name: 'Heavy Bag – 30/30 Championship Burnout',
          phase: 'boxing', secs: 180, rounds: 2, restBetween: 45,
          detail: 'Rounds 7–8: Championship rounds — empty the gas tank',
          comboTags: ['speed', 'power'],
          noBack: true
        },
        ...CD_STD
      ]
    },
    {
      id: 'hb_adv_3',
      category: 'heavy_bag',
      level: 'advanced',
      label: '30/30 Championship Burnout',
      subtitle: 'High-volume anaerobic heavy bag sprints & burpee finishers',
      pill: 'pc',
      color: '#EF3E36',
      equipment: ['Heavy Bag', 'Jump Rope', 'Wraps & Gloves'],
      focus: 'Push peak VO2 output with minimal 45s recovery between heavy rounds.',
      exercises: [
        ...WU_ADV,
        {
          name: 'Heavy Bag – 30/30 Championship Burnout',
          phase: 'boxing', secs: 180, rounds: 5, restBetween: 45,
          detail: '30s sharp technical combos / 30s rapid nonstop flurries',
          comboTags: ['speed', 'power', 'inside'],
          noBack: true
        },
        restBlock(45, 'Final conditioning sprint'),
        { name: 'Championship Burpees', phase: 'strength', secs: 50, rounds: 3, restBetween: 25, detail: 'All-out pace' },
        { name: 'Iron Core Circuit (Plank / Climbers / Hollow)', phase: 'core', secs: 60, rounds: 2, restBetween: 20, detail: 'Hold form while breathing heavy' },
        ...CD_STD
      ]
    },

    /* Shadowboxing & Footwork — No Gear (4) */
    {
      id: 'sb_ignition',
      category: 'shadowboxing',
      level: 'beginner',
      label: 'Morning Boxer’s Ignition',
      subtitle: '15-min zero-gear wake-up for stance, rhythm & sharp 1–2s',
      pill: 'pb',
      color: '#00D2B4',
      equipment: ['No Gear'],
      focus: 'Wake up hips, shoulders & reflexes before work or training.',
      exercises: [
        { name: 'Arm Circles, Shoulder & Spine Prep', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Loosen joints smoothly' },
        { name: 'Shadowboxing – Morning Ignition', phase: 'boxing', secs: 120, rounds: 3, restBetween: 30, detail: 'Loose shoulders, light bouncing, sharp 1–2s', comboTags: ['fundamentals', 'jab_mastery'] },
        { name: 'Shadowboxing – 1-2-3 Rotational Flow', phase: 'boxing', secs: 120, rounds: 1, restBetween: 30, detail: 'Finish with clean hip rotation', comboTags: ['fundamentals', 'angles'] },
        { name: 'Forearm Plank & Side Plank', phase: 'core', secs: 45, rounds: 2, restBetween: 20, detail: 'Activate deep core' },
        { name: 'Cool-Down Static Stretch & Decompression', phase: 'cooldown', secs: 120, rounds: 1, restBetween: 0, detail: 'Open chest & hips' }
      ]
    },
    {
      id: 'sb_cuban',
      category: 'shadowboxing',
      level: 'intermediate',
      label: 'Cuban Footwork & Angles Clinic',
      subtitle: 'Pendulum step, L-step pivots, check hooks & matador escapes',
      pill: 'pb',
      color: '#3B82F6',
      equipment: ['No Gear (Mirror / Line optional)'],
      focus: 'Hit without getting hit — master dynamic entries and 90° exits.',
      exercises: [
        { name: 'Neck, Wrist & Hip Mobilisation', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Ankle, knee & hip prep' },
        {
          name: 'Footwork-Only Pendulum & Box Drill',
          phase: 'boxing', secs: 180, rounds: 2, restBetween: 45,
          detail: 'Master forward/back pendulum bounce & square pivots',
          comboTags: ['cuban', 'angles'],
          allowedPunches: ['pivot', 'feint', 'slip-l', 'slip-r']
        },
        {
          name: 'Shadowboxing – Cuban Pendulum & Angles',
          phase: 'boxing', secs: 180, rounds: 3, restBetween: 45,
          detail: 'Double jab entry → 2–3 → L-step pivot exit',
          comboTags: ['cuban', 'angles', 'jab_mastery']
        },
        { name: 'Pogo Ankle Hops & Skater Bounds', phase: 'strength', secs: 45, rounds: 2, restBetween: 30, detail: 'Elastic calf reactivity' },
        ...CD_STD
      ]
    },
    {
      id: 'sb_peekaboo',
      category: 'shadowboxing',
      level: 'intermediate',
      label: 'Peek-a-Boo Head Movement & Counters',
      subtitle: 'Tight cheekbone shell, U-rolls & explosive 6–3–2 ambushes',
      pill: 'pd',
      color: '#F5A623',
      equipment: ['No Gear'],
      focus: 'Load your hips with every slip and roll so defense automatically fuels offense.',
      exercises: [
        { name: 'Dynamic Shadow Flow & Footwork', phase: 'warmup', secs: 120, rounds: 1, restBetween: 0, detail: 'High guard, subtle pendulum slip' },
        {
          name: 'Shadowboxing – Peek-a-Boo Slips & Rolls',
          phase: 'boxing', secs: 180, rounds: 3, restBetween: 60,
          detail: 'Nose over knee slips + U-shape rolls into 6–3–2',
          comboTags: ['peekaboo', 'counter']
        },
        {
          name: 'Shadowboxing – Defensive Counters',
          phase: 'boxing', secs: 180, rounds: 2, restBetween: 60,
          detail: 'Mix shoulder-roll pulls & inside uppercuts',
          comboTags: ['philly_shell', 'counter', 'inside']
        },
        { name: 'Bodyweight Squats & Shadow Guard', phase: 'strength', secs: 45, rounds: 2, restBetween: 30, detail: 'Quad stamina for bob & weave' },
        ...CD_STD
      ]
    },
    {
      id: 'sb_ghost',
      category: 'shadowboxing',
      level: 'advanced',
      label: '6-Round Ghost Sparring Fight Sim',
      subtitle: '30-min championship visualization with zero equipment',
      pill: 'pc',
      color: '#EF3E36',
      equipment: ['No Gear'],
      focus: 'Visualize an aggressive pressure opponent and out-box them across 6 full rounds.',
      exercises: [
        { name: 'Neck, Wrist & Hip Mobilisation', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Full joint readiness' },
        { name: 'Dynamic Shadow Flow & Footwork', phase: 'warmup', secs: 120, rounds: 1, restBetween: 0, detail: 'Fast pace ignition' },
        restBlock(30, '6 rounds × 3 minutes — full sparring tempo'),
        {
          name: 'Shadowboxing – Championship Ghost Sparring',
          phase: 'boxing', secs: 180, rounds: 4, restBetween: 45,
          detail: 'Rounds 1–4: Feints, counter traps & ring cutting',
          comboTags: ['counter', 'angles', 'cuban', 'peekaboo']
        },
        {
          name: 'Shadowboxing – Rapid Hand Speed',
          phase: 'boxing', secs: 180, rounds: 2, restBetween: 45,
          detail: 'Rounds 5–6: Final-round speed flurries & escapes',
          comboTags: ['speed', 'power']
        },
        ...CD_STD
      ]
    },

    /* Multi-Gym Strength Machine (3) */
    {
      id: 'gym_power_base',
      category: 'gym_machine',
      level: 'beginner',
      label: 'Boxer’s Multi-Gym Strength Base',
      subtitle: 'Chest press, cable row, leg drive & anti-rotation armor',
      pill: 'pb',
      color: '#3B82F6',
      gearIds: ['gym_machine', 'jump_rope'],
      equipment: ['Multi-Gym Machine', 'Jump Rope'],
      focus: 'Build functional boxing push, pull, leg drive and core bracing on your machine.',
      exercises: [
        { name: 'Jump rope – Boxer Skip', phase: 'warmup', secs: 120, rounds: 1, restBetween: 0, detail: 'Light calves & warm shoulders' },
        { name: 'Arm Circles, Shoulder & Spine Prep', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Full upper-back & shoulder prep' },
        restBlock(30, 'Set moderate weight for crisp form'),
        { name: 'Multi-Gym – Explosive Chest Press', phase: 'strength', secs: 45, rounds: 3, restBetween: 45, detail: '8–10 explosive presses, 2s controlled negative' },
        { name: 'Multi-Gym – Seated Cable Row (Guard Retraction)', phase: 'strength', secs: 45, rounds: 3, restBetween: 45, detail: '10–12 crisp pulls to lower ribs' },
        { name: 'Multi-Gym – Leg Press / Leg Drive Power', phase: 'strength', secs: 45, rounds: 3, restBetween: 45, detail: '12 reps — glue tailbone flat to seat' },
        { name: 'Multi-Gym – Lat Pulldown (Punch Snap & Posture)', phase: 'strength', secs: 45, rounds: 3, restBetween: 40, detail: '10–12 reps to upper collarbone' },
        { name: 'Multi-Gym – Cable Pallof Press (Anti-Rotation)', phase: 'core', secs: 45, rounds: 2, restBetween: 30, detail: 'Hold 2s extended each rep without twisting' },
        ...CD_STD
      ]
    },
    {
      id: 'gym_knockout_torque',
      category: 'gym_machine',
      level: 'intermediate',
      label: 'Rotational Knockout Cable Camp',
      subtitle: 'Standing punch presses, woodchoppers & shadowboxing supersets',
      pill: 'pa',
      color: '#EF3E36',
      gearIds: ['gym_machine'],
      equipment: ['Multi-Gym Machine'],
      focus: 'Translate cable resistance directly into hook, cross and straight-punch snap.',
      exercises: [
        { name: 'Arm Circles, Shoulder & Spine Prep', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Shoulder & thoracic prep' },
        { name: 'Dynamic Shadow Flow & Footwork', phase: 'warmup', secs: 120, rounds: 1, restBetween: 0, detail: 'Loose rotation & pivots' },
        restBlock(30, 'Set mid-pulley for standing punch press'),
        { name: 'Multi-Gym – Single-Arm Rotational Punch Press', phase: 'strength', secs: 50, rounds: 3, restBetween: 35, detail: '10 explosive drives/side with rear-heel pivot' },
        { name: 'Multi-Gym – Cable Woodchopper (Rotational Torque)', phase: 'core', secs: 50, rounds: 3, restBetween: 30, detail: '10 dynamic rotations/side from hip to shoulder', noBack: true },
        { name: 'Multi-Gym – Explosive Chest Press', phase: 'strength', secs: 45, rounds: 3, restBetween: 40, detail: '8 explosive reps for fast-twitch force' },
        { name: 'Multi-Gym – Cable Tricep Pushdowns (Punch Lockout)', phase: 'strength', secs: 45, rounds: 3, restBetween: 30, detail: '12–15 reps — crisp straight extension' },
        { name: 'Multi-Gym – Leg Press / Leg Drive Power', phase: 'strength', secs: 50, rounds: 3, restBetween: 40, detail: 'Explosive drive off midfoot' },
        {
          name: 'Shadowboxing – 1-2-3 Rotational Flow',
          phase: 'boxing', secs: 180, rounds: 2, restBetween: 45,
          detail: 'Post-activation shadowboxing: feel the extra punch snap!',
          comboTags: ['power', 'fundamentals']
        },
        ...CD_STD
      ]
    },
    {
      id: 'gym_shoulder_armor',
      category: 'gym_machine',
      level: 'advanced',
      label: 'Bulletproof Shoulders, Back & Guard',
      subtitle: 'High-volume pulling, rotator cuff health & isometric neck armor',
      pill: 'pd',
      color: '#F5A623',
      gearIds: ['gym_machine'],
      equipment: ['Multi-Gym Machine'],
      focus: 'Eliminate punch shoulder fatigue, fix rounded guard posture & armor the neck.',
      exercises: [
        { name: 'Neck, Wrist & Hip Mobilisation', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Full cervical & rotator cuff warm-up' },
        { name: 'Arm Circles, Shoulder & Spine Prep', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Scapular activation' },
        restBlock(30, 'Attach rope or straight bar at high pulley'),
        { name: 'Multi-Gym – Cable Face Pulls & Rotator Cuff', phase: 'strength', secs: 50, rounds: 4, restBetween: 30, detail: '15–18 reps pulling toward forehead with thumbs back' },
        { name: 'Multi-Gym – Seated Cable Row (Guard Retraction)', phase: 'strength', secs: 50, rounds: 3, restBetween: 35, detail: '10–12 reps — fast pull, 2s slow return' },
        { name: 'Multi-Gym – Lat Pulldown (Punch Snap & Posture)', phase: 'strength', secs: 50, rounds: 3, restBetween: 35, detail: '10–12 crisp reps — elbows down' },
        { name: 'Multi-Gym – Single-Arm Rotational Punch Press', phase: 'strength', secs: 45, rounds: 3, restBetween: 30, detail: '8 explosive punches/arm' },
        { name: 'Multi-Gym – Cable Pallof Press (Anti-Rotation)', phase: 'core', secs: 50, rounds: 3, restBetween: 25, detail: 'Anti-rotation body-shot brace' },
        { name: 'Isometric Neck & Anti-Rotation Plank', phase: 'core', secs: 60, rounds: 2, restBetween: 25, detail: '4-way gentle hand resistance + plank' },
        ...CD_STD
      ]
    },

    /* Treadmill & Jump Rope Conditioning (4) */
    {
      id: 'cardio_treadmill_rounds',
      category: 'cardio_rope',
      level: 'intermediate',
      label: 'Treadmill 6-Round Fight Roadwork',
      subtitle: 'Six 3-min hard running rounds paired with 60s corner walk recovery',
      pill: 'pc',
      color: '#22C55E',
      gearIds: ['treadmill'],
      equipment: ['Treadmill'],
      focus: 'Train your heart rate to recover rapidly inside a 60-second boxing corner.',
      exercises: [
        { name: 'Treadmill – Aerobic Zone 2 Base Run', phase: 'warmup', secs: 180, rounds: 1, restBetween: 0, detail: '1.5% incline easy warm-up jog' },
        restBlock(30, 'Set 1.5% incline — get ready for Round 1'),
        { name: 'Treadmill – 3-Min Fight Interval Runs', phase: 'strength', secs: 180, rounds: 6, restBetween: 60, detail: '85% fight pace for 3:00 — walk 4–5 km/h during 1:00 rest' },
        { name: 'Treadmill – Active Recovery Cool-Down Walk', phase: 'cooldown', secs: 180, rounds: 1, restBetween: 0, detail: '0% incline 4.0 km/h slow nasal breathing' },
        { name: 'Cool-Down Static Stretch & Decompression', phase: 'cooldown', secs: 150, rounds: 1, restBetween: 0, detail: 'Calves, hamstrings, hip flexors & low back' }
      ]
    },
    {
      id: 'cardio_treadmill_hills',
      category: 'cardio_rope',
      level: 'advanced',
      label: 'Treadmill Hill Incline Knockout Sprints',
      subtitle: '8–10% uphill bursts, fast rope singles & iron core conditioning',
      pill: 'pa',
      color: '#EF3E36',
      gearIds: ['treadmill', 'jump_rope'],
      equipment: ['Treadmill', 'Jump Rope'],
      focus: 'Build explosive calf drive, hip power and peak anaerobic recovery.',
      exercises: [
        { name: 'Treadmill – Aerobic Zone 2 Base Run', phase: 'warmup', secs: 180, rounds: 1, restBetween: 0, detail: '2% incline warm-up jog' },
        restBlock(30, 'Raise treadmill incline to 8–10%'),
        { name: 'Treadmill – Hill Incline Sprints (8–10%)', phase: 'strength', secs: 30, rounds: 8, restBetween: 30, detail: '30s max uphill drive / 30s safe rail rest' },
        restBlock(45, 'Step off safely — grab your jump rope'),
        { name: 'Jump rope – Fast Singles', phase: 'boxing', secs: 180, rounds: 2, restBetween: 45, detail: 'Crisp wrist flicks on tired calves', comboTags: ['speed'] },
        { name: 'Iron Core Circuit (Plank / Climbers / Hollow)', phase: 'core', secs: 60, rounds: 2, restBetween: 20, detail: 'Core finisher' },
        { name: 'Treadmill – Active Recovery Cool-Down Walk', phase: 'cooldown', secs: 120, rounds: 1, restBetween: 0, detail: '0% incline recovery walk' },
        { name: 'Cool-Down Static Stretch & Decompression', phase: 'cooldown', secs: 120, rounds: 1, restBetween: 0, detail: 'Deep calf & hip release' }
      ]
    },
    {
      id: 'cardio_treadmill_fartlek',
      category: 'cardio_rope',
      level: 'beginner',
      label: 'Treadmill Zone 2 & Fartlek Engine',
      subtitle: 'Aerobic base builder with controlled 20s fight-pace surges',
      pill: 'pb',
      color: '#00D2B4',
      gearIds: ['treadmill'],
      equipment: ['Treadmill'],
      focus: 'Grow mitochondrial endurance while practicing sudden changes of fighting tempo.',
      exercises: [
        { name: 'Treadmill – Active Recovery Cool-Down Walk', phase: 'warmup', secs: 120, rounds: 1, restBetween: 0, detail: 'Brisk 5 km/h walk warm-up' },
        { name: 'Treadmill – Aerobic Zone 2 Base Run', phase: 'strength', secs: 300, rounds: 2, restBetween: 60, detail: '1.5% incline steady conversational jog' },
        { name: 'Treadmill – Fartlek Fight Surges', phase: 'strength', secs: 180, rounds: 2, restBetween: 60, detail: '40s cruise / 20s surge cycles on 2% incline' },
        { name: 'Treadmill – Active Recovery Cool-Down Walk', phase: 'cooldown', secs: 180, rounds: 1, restBetween: 0, detail: 'Cool-down nasal breathing walk' },
        { name: 'Cool-Down Static Stretch & Decompression', phase: 'cooldown', secs: 120, rounds: 1, restBetween: 0, detail: 'Stretch calves & hips' }
      ]
    },
    {
      id: 'cardio_rope_mastery',
      category: 'cardio_rope',
      level: 'intermediate',
      label: 'Pro Boxer’s Jump Rope Mastery',
      subtitle: '6-round footwork clinic: Boxer Skip, Ali Shuffle, High-Knees & Double-Unders',
      pill: 'pb',
      color: '#3B82F6',
      gearIds: ['jump_rope'],
      equipment: ['Jump Rope'],
      focus: 'Develop effortless boxer calf spring, coordination and rapid anaerobic surges.',
      exercises: [
        { name: 'Neck, Wrist & Hip Mobilisation', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Ankles, wrists & calves ready' },
        { name: 'Jump rope – Boxer Skip', phase: 'warmup', secs: 180, rounds: 1, restBetween: 45, detail: 'Round 1: Easy 2-tap boxer skip rhythm' },
        { name: 'Jump rope – Ali Shuffle & Footwork', phase: 'boxing', secs: 180, rounds: 2, restBetween: 45, detail: 'Rounds 2–3: Stance switches & lateral hops', comboTags: ['cuban', 'angles'] },
        { name: 'Jump rope – Fast Singles', phase: 'boxing', secs: 180, rounds: 1, restBetween: 45, detail: 'Round 4: High-RPM speed singles', comboTags: ['speed'] },
        { name: 'Jump rope – 30/30 High-Knee Sprint Intervals', phase: 'boxing', secs: 180, rounds: 1, restBetween: 45, detail: 'Round 5: 30s cruise / 30s max high-knee sprint', comboTags: ['speed'] },
        { name: 'Jump rope – Double Unders & Sprints', phase: 'boxing', secs: 180, rounds: 1, restBetween: 45, detail: 'Round 6: Double-under finishers & sprints', comboTags: ['speed'] },
        ...CD_STD
      ]
    },

    /* Conditioning & Core (2) */
    {
      id: 'cond_core_neck',
      category: 'conditioning',
      level: 'intermediate',
      label: 'Fighter’s Iron Core & Neck Durability',
      subtitle: 'Body-shot armor, rotational torque & cervical stability',
      pill: 'pc',
      color: '#22C55E',
      gearIds: [],
      equipment: ['Mat / Towel'],
      focus: 'Build a chin-stabilizing neck and 360° rotational core.',
      exercises: [
        { name: 'Arm Circles, Shoulder & Spine Prep', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Warm thoracic & neck gently' },
        { name: 'Shadowboxing – Morning Ignition', phase: 'boxing', secs: 120, rounds: 1, restBetween: 30, detail: 'Rotational shadow loosen-up', comboTags: ['fundamentals'] },
        { name: 'Isometric Neck & Anti-Rotation Plank', phase: 'core', secs: 60, rounds: 3, restBetween: 30, detail: '4-way hand resistance + rigid plank' },
        { name: 'Rotational Russian Twists', phase: 'core', secs: 45, rounds: 3, restBetween: 25, detail: 'Hook/cross oblique power', noBack: true },
        { name: 'Iron Core Circuit (Plank / Climbers / Hollow)', phase: 'core', secs: 60, rounds: 3, restBetween: 25, detail: 'Brace ribs down against body shots' },
        { name: 'Forearm Plank & Side Plank', phase: 'core', secs: 60, rounds: 2, restBetween: 25, detail: '30s front + 15s each side' },
        { name: 'Cool-Down Static Stretch & Decompression', phase: 'cooldown', secs: 150, rounds: 1, restBetween: 0, detail: 'Release lumbar & hip flexors' }
      ]
    },
    {
      id: 'cond_lactic',
      category: 'conditioning',
      level: 'advanced',
      label: 'Championship Lactic Burnout Circuit',
      subtitle: 'Brutal bodyweight + shadowboxing sprints to fight in deep waters',
      pill: 'pc',
      color: '#EF3E36',
      gearIds: ['jump_rope'],
      equipment: ['Jump Rope (Optional Bag)'],
      focus: 'Alternating high-speed punch bursts with explosive bodyweight circuits.',
      exercises: [
        { name: 'Jump rope – Double Unders & Sprints', phase: 'warmup', secs: 180, rounds: 1, restBetween: 0, detail: 'Rapid cardio spike' },
        { name: 'HIIT – 10-Punch Burst & Squat', phase: 'boxing', secs: 180, rounds: 3, restBetween: 45, detail: '10 rapid punches + 2 crisp squats nonstop', comboTags: ['speed'] },
        { name: 'Championship Burpees', phase: 'strength', secs: 50, rounds: 3, restBetween: 30, detail: 'Max clean reps' },
        { name: 'Conditioning – Sprawls & Guard Up', phase: 'strength', secs: 50, rounds: 3, restBetween: 30, detail: 'Fast snap back to stance' },
        { name: 'Split Squat Jumps (Boxing Stance)', phase: 'strength', secs: 45, rounds: 3, restBetween: 25, detail: 'Explosive legs under fatigue' },
        { name: 'Iron Core Circuit (Plank / Climbers / Hollow)', phase: 'core', secs: 60, rounds: 2, restBetween: 20, detail: 'Iron core finisher' },
        ...CD_STD
      ]
    },

    /* 4-Station Complete Home-Gym Camps (Heavy Bag + Multi-Gym + Treadmill + Jump Rope) */
    {
      id: 'camp_home_60',
      category: 'full_camp',
      level: 'intermediate',
      fixedDuration: true,
      label: '1-Hour Complete Home-Gym Camp',
      subtitle: 'All 4 stations: Jump Rope, Heavy Bag, Multi-Gym Strength & Treadmill Sprints',
      pill: 'pa',
      color: '#EF3E36',
      gearIds: ['heavy_bag', 'gym_machine', 'treadmill', 'jump_rope'],
      equipment: ['Heavy Bag', 'Multi-Gym Machine', 'Treadmill', 'Jump Rope'],
      focus: 'Balanced 60-minute pro home camp hitting boxing power, cable torque & incline engine.',
      exercises: [
        { name: 'Jump rope – Boxer Skip', phase: 'warmup', secs: 180, rounds: 1, restBetween: 0, detail: '3-min fluid calf bounce' },
        { name: 'Arm Circles, Shoulder & Spine Prep', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Joint & shoulder prep' },
        { name: 'Dynamic Shadow Flow & Footwork', phase: 'warmup', secs: 120, rounds: 1, restBetween: 0, detail: 'Loose stance, jabs & light slips' },
        restBlock(30, 'Lock hands & mind for Shadowboxing'),
        { name: 'Shadowboxing – 1-2-3 Rotational Flow', phase: 'boxing', secs: 180, rounds: 2, restBetween: 60, detail: '2×3:00 rotational shadow rounds', comboTags: ['fundamentals', 'power'] },
        restBlock(45, 'Gloves on — step to the heavy bag'),
        { name: 'Heavy Bag – Power Impact & Weight Transfer', phase: 'boxing', secs: 180, rounds: 3, restBetween: 60, detail: '3×3:00 heavy bag power', comboTags: ['power', 'fundamentals'], noBack: true },
        { name: 'Heavy Bag – Mexican Body Snatcher', phase: 'boxing', secs: 180, rounds: 2, restBetween: 60, detail: '2×3:00 body-to-head hooks', comboTags: ['body_snatcher', 'inside'], noBack: true },
        restBlock(60, 'Gloves off — transition to Multi-Gym station'),
        { name: 'Multi-Gym – Explosive Chest Press', phase: 'strength', secs: 45, rounds: 3, restBetween: 45, detail: 'Explosive punch push, 2s controlled return' },
        { name: 'Multi-Gym – Seated Cable Row (Guard Retraction)', phase: 'strength', secs: 45, rounds: 3, restBetween: 45, detail: 'Fast retraction to ribs' },
        { name: 'Multi-Gym – Cable Woodchopper (Rotational Torque)', phase: 'core', secs: 50, rounds: 3, restBetween: 30, detail: 'Explosive hook/cross oblique torque', noBack: true },
        restBlock(45, 'Step onto treadmill — set 8–10% incline'),
        { name: 'Treadmill – Hill Incline Sprints (8–10%)', phase: 'strength', secs: 30, rounds: 6, restBetween: 30, detail: '6×30s uphill sprints / 30s rail rest' },
        { name: 'Iron Core Circuit (Plank / Climbers / Hollow)', phase: 'core', secs: 60, rounds: 2, restBetween: 30, detail: 'Body-shot abdominal armor' },
        { name: 'Treadmill – Active Recovery Cool-Down Walk', phase: 'cooldown', secs: 180, rounds: 1, restBetween: 0, detail: 'Easy 4.0 km/h nasal breathing walk' },
        { name: 'Cool-Down Static Stretch & Decompression', phase: 'cooldown', secs: 240, rounds: 1, restBetween: 0, detail: 'Chest, shoulders, hips & lumbar release' }
      ]
    },
    {
      id: 'camp_home_90',
      category: 'full_camp',
      level: 'intermediate',
      fixedDuration: true,
      label: '1h30 Contender 4-Station Camp',
      subtitle: '11 boxing rounds, full Multi-Gym circuit & 3-min Treadmill fight intervals',
      pill: 'pb',
      color: '#3B82F6',
      gearIds: ['heavy_bag', 'gym_machine', 'treadmill', 'jump_rope'],
      equipment: ['Heavy Bag', 'Multi-Gym Machine', 'Treadmill', 'Jump Rope'],
      focus: 'Extended 90-minute camp pairing Cuban footwork, body snatching, rotational cables & roadwork.',
      exercises: [
        { name: 'Jump rope – Fast Singles', phase: 'warmup', secs: 180, rounds: 2, restBetween: 45, detail: '2×3:00 crisp boxer singles' },
        { name: 'Neck, Wrist & Hip Mobilisation', phase: 'warmup', secs: 60, rounds: 1, restBetween: 0, detail: 'Full joint preparation' },
        { name: 'Dynamic Shadow Flow & Footwork', phase: 'warmup', secs: 150, rounds: 1, restBetween: 0, detail: 'Pendulum step & crisp feints' },
        restBlock(45, 'Shadowbox Cuban footwork & pivots'),
        { name: 'Shadowboxing – Cuban Pendulum & Angles', phase: 'boxing', secs: 180, rounds: 3, restBetween: 60, detail: '3×3:00 angles & L-step exits', comboTags: ['cuban', 'angles', 'jab_mastery'] },
        restBlock(45, 'Gloves on — 8 heavy bag rounds ahead'),
        { name: 'Heavy Bag – Power Impact & Weight Transfer', phase: 'boxing', secs: 180, rounds: 3, restBetween: 60, detail: 'Sit on heavy 3–5 punch combos', comboTags: ['power', 'fundamentals'], noBack: true },
        { name: 'Heavy Bag – Mexican Body Snatcher', phase: 'boxing', secs: 180, rounds: 3, restBetween: 60, detail: '45° liver hooks & head follow-ups', comboTags: ['body_snatcher', 'inside'], noBack: true },
        { name: 'Heavy Bag – Counter-Puncher’s Trap', phase: 'boxing', secs: 180, rounds: 2, restBetween: 60, detail: 'Slip swinging bag & fire 3-punch counter', comboTags: ['counter', 'angles'] },
        restBlock(60, 'Gloves off — 4-station Multi-Gym strength'),
        { name: 'Multi-Gym – Single-Arm Rotational Punch Press', phase: 'strength', secs: 50, rounds: 3, restBetween: 40, detail: 'Standing punch extension + heel pivot' },
        { name: 'Multi-Gym – Seated Cable Row (Guard Retraction)', phase: 'strength', secs: 50, rounds: 3, restBetween: 40, detail: 'Crisp upper-back snap' },
        { name: 'Multi-Gym – Leg Press / Leg Drive Power', phase: 'strength', secs: 50, rounds: 3, restBetween: 40, detail: 'Explosive boxing base' },
        { name: 'Multi-Gym – Cable Woodchopper (Rotational Torque)', phase: 'core', secs: 50, rounds: 3, restBetween: 30, detail: 'Oblique rotational power', noBack: true },
        restBlock(45, 'Step onto treadmill for fight interval rounds'),
        { name: 'Treadmill – 3-Min Fight Interval Runs', phase: 'strength', secs: 180, rounds: 3, restBetween: 60, detail: '3×3:00 hard pace / 1:00 active walk' },
        { name: 'Isometric Neck & Anti-Rotation Plank', phase: 'core', secs: 60, rounds: 2, restBetween: 30, detail: '4-way cervical hold + plank' },
        { name: 'Cool-Down Flush Shadowboxing', phase: 'cooldown', secs: 120, rounds: 1, restBetween: 0, detail: '30% easy shadow flush' },
        { name: 'Treadmill – Active Recovery Cool-Down Walk', phase: 'cooldown', secs: 180, rounds: 1, restBetween: 0, detail: '0% incline recovery walk' },
        { name: 'Cool-Down Static Stretch & Decompression', phase: 'cooldown', secs: 180, rounds: 1, restBetween: 0, detail: 'Full-body decompression' }
      ]
    },
    {
      id: 'camp_home_120',
      category: 'full_camp',
      level: 'advanced',
      fixedDuration: true,
      label: '2-Hour Championship 4-Station Pro Camp',
      subtitle: '15 boxing rounds, 6-station Multi-Gym armor, Treadmill intervals & hill sprints',
      pill: 'pc',
      color: '#F5A623',
      gearIds: ['heavy_bag', 'gym_machine', 'treadmill', 'jump_rope'],
      equipment: ['Heavy Bag', 'Multi-Gym Machine', 'Treadmill', 'Jump Rope'],
      focus: 'Full pro-style 120-minute training camp combining championship bag volume, gym power & roadwork.',
      exercises: [
        { name: 'Jump rope – Double Unders & Sprints', phase: 'warmup', secs: 180, rounds: 3, restBetween: 30, detail: '3×3:00 pro rope warm-up' },
        { name: 'Neck, Wrist & Hip Mobilisation', phase: 'warmup', secs: 90, rounds: 1, restBetween: 0, detail: 'Thorough joint prep' },
        { name: 'Dynamic Shadow Flow & Footwork', phase: 'warmup', secs: 180, rounds: 1, restBetween: 0, detail: 'Loose ringcraft ignition' },
        restBlock(45, '4 technical shadowboxing rounds'),
        { name: 'Shadowboxing – Cuban Pendulum & Angles', phase: 'boxing', secs: 180, rounds: 2, restBetween: 45, detail: 'Pendulum entries & 90° L-steps', comboTags: ['cuban', 'angles'] },
        { name: 'Shadowboxing – Peek-a-Boo Slips & Rolls', phase: 'boxing', secs: 180, rounds: 2, restBetween: 45, detail: 'Tight cheekbone guard & 6–3–2 ambushes', comboTags: ['peekaboo', 'counter'] },
        restBlock(45, 'Gloves on — 11 championship bag rounds'),
        { name: 'Heavy Bag – Jab Command & Range', phase: 'boxing', secs: 180, rounds: 2, restBetween: 45, detail: 'Rounds 1–2: Dictate range behind double/triple jabs', comboTags: ['jab_mastery', 'fundamentals'], noBack: true },
        { name: 'Heavy Bag – Power Pyramid (1-to-10)', phase: 'boxing', secs: 180, rounds: 3, restBetween: 45, detail: 'Rounds 3–5: Escalating power combos', comboTags: ['power', 'inside'], noBack: true },
        { name: 'Heavy Bag – Mexican Body Snatcher', phase: 'boxing', secs: 180, rounds: 2, restBetween: 45, detail: 'Rounds 6–7: Heavy rib & liver attacks', comboTags: ['body_snatcher', 'power'], noBack: true },
        { name: 'Heavy Bag – Counter-Puncher’s Trap', phase: 'boxing', secs: 180, rounds: 2, restBetween: 45, detail: 'Rounds 8–9: Read swing, slip & counter', comboTags: ['counter', 'philly_shell'] },
        { name: 'Heavy Bag – 30/30 Championship Burnout', phase: 'boxing', secs: 180, rounds: 2, restBetween: 45, detail: 'Rounds 10–11: Empty the tank', comboTags: ['speed', 'power'], noBack: true },
        restBlock(60, 'Gloves off — 6-station Multi-Gym strength & armor'),
        { name: 'Multi-Gym – Explosive Chest Press', phase: 'strength', secs: 50, rounds: 3, restBetween: 40, detail: 'Explosive press + 2s negative' },
        { name: 'Multi-Gym – Seated Cable Row (Guard Retraction)', phase: 'strength', secs: 50, rounds: 3, restBetween: 40, detail: 'Heavy upper-back retraction' },
        { name: 'Multi-Gym – Leg Press / Leg Drive Power', phase: 'strength', secs: 50, rounds: 3, restBetween: 40, detail: 'Lower-body knockout base' },
        { name: 'Multi-Gym – Lat Pulldown (Punch Snap & Posture)', phase: 'strength', secs: 50, rounds: 3, restBetween: 35, detail: 'Lat drive & thoracic posture' },
        { name: 'Multi-Gym – Cable Face Pulls & Rotator Cuff', phase: 'strength', secs: 45, rounds: 3, restBetween: 30, detail: 'Shoulder longevity armor' },
        { name: 'Multi-Gym – Cable Pallof Press (Anti-Rotation)', phase: 'core', secs: 50, rounds: 3, restBetween: 25, detail: 'Anti-rotation core lock' },
        restBlock(60, 'Step onto treadmill — interval runs & uphill finish'),
        { name: 'Treadmill – 3-Min Fight Interval Runs', phase: 'strength', secs: 180, rounds: 3, restBetween: 60, detail: '3×3:00 hard pace / 1:00 active walk' },
        { name: 'Treadmill – Hill Incline Sprints (8–10%)', phase: 'strength', secs: 30, rounds: 4, restBetween: 30, detail: '4×30s steep hill sprints' },
        { name: 'Isometric Neck & Anti-Rotation Plank', phase: 'core', secs: 60, rounds: 3, restBetween: 30, detail: '4-way cervical durability' },
        { name: 'Iron Core Circuit (Plank / Climbers / Hollow)', phase: 'core', secs: 60, rounds: 2, restBetween: 30, detail: 'Final core burnout' },
        { name: 'Cool-Down Flush Shadowboxing', phase: 'cooldown', secs: 120, rounds: 1, restBetween: 0, detail: 'Slow blood-clearing shadowboxing' },
        { name: 'Treadmill – Active Recovery Cool-Down Walk', phase: 'cooldown', secs: 180, rounds: 1, restBetween: 0, detail: 'Gradual heart-rate drop' },
        { name: 'Cool-Down Static Stretch & Decompression', phase: 'cooldown', secs: 195, rounds: 1, restBetween: 0, detail: 'Full-body decompression' }
      ]
    }
  ];

  /* ── FULL 4-PHASE TRX CORE & BACK HEALTH (CONSOLIDATED FROM TRX.HTML) ── */
  const TRX_ROUTINES = {
    'pain-relief': {
      id: 'TRX_1',
      key: 'pain-relief',
      shortLabel: 'Phase 1: Pain Relief',
      title: 'Phase 1 – Pain Relief & Mobility',
      color: '#00D2B4',
      desc: 'Gentle lumbar decompression and deep stabilizer activation. Focus on breathing and pain-free range.',
      exercises: [
        { name: 'TRX Standing Row – Slow', phase: 'warmup', sets: '2×10 reps', secs: 60, rounds: 2, restBetween: 20, detail: 'Strap length: mid-length. Gentle lumbar traction.', info: 'Stand facing the anchor at 45°. Lean back, arms extended. Pull chest to hands, squeezing shoulder blades. Return slowly. Do NOT arch the lower back.', warn: 'Avoid if acute pain worsens.' },
        { name: 'Supine Pelvic Tilt', phase: 'warmup', sets: '2×12 reps', secs: 60, rounds: 1, restBetween: 0, detail: 'Floor exercise, use strap for balance only.', info: 'Lie on back, knees bent. Gently flatten the lower back against the floor by tightening the abs. Hold 3s. Resets the lumbar curve and activates deep stabilisers.', warn: null },
        { name: 'TRX Hip Hinge', phase: 'warmup', sets: '2×10 reps', secs: 60, rounds: 1, restBetween: 0, detail: 'Hinge at hip, not low back.', info: 'Hold straps, feet hip-width. Push hips back while keeping a neutral spine. Feel a gentle hamstring stretch and drive hips forward to return.', warn: null },
        { name: 'TRX Fallout (Kneeling)', phase: 'core', sets: '2×8 reps', secs: 60, rounds: 2, restBetween: 30, detail: 'Short strap. Go only as far as pain-free.', info: 'Kneel holding straps overhead. Lean forward keeping a rigid plank from knees to ears. Engage deep abs as you fall out; pull back with lats, not lower back.', warn: 'No arching — keep ribcage down.' },
        { name: 'TRX Supported Glute Bridge', phase: 'strength', sets: '3×10 reps', secs: 60, rounds: 3, restBetween: 30, detail: 'Feet in straps. Drives glutes, relieves lumbar compression.', info: 'Lie on back, heels in foot cradles. Push heels into straps and lift hips until body forms a straight line. Squeeze glutes hard at top and lower slowly.', warn: null },
        { name: 'Bird Dog (TRX Assisted)', phase: 'core', sets: '2×8/side', secs: 60, rounds: 2, restBetween: 20, detail: 'Hold one strap for balance. Focus: opposite arm/leg.', info: 'On all fours, hold one strap for stability. Extend opposite arm and leg smoothly keeping pelvis level and spine neutral. Hold 2s at top.', warn: null },
        { name: 'TRX Chest Stretch', phase: 'cooldown', sets: '2×30s', secs: 60, rounds: 1, restBetween: 0, detail: 'Opens thoracic spine, reducing lower back compensation.', info: 'Face away from anchor with arms in straps. Walk forward gently to open chest and thoracic spine with deep nasal breaths.', warn: null },
        { name: 'TRX Hip Flexor Stretch', phase: 'cooldown', sets: '2×30s/side', secs: 60, rounds: 1, restBetween: 0, detail: 'Tight hip flexors pull on lower back. Key release.', info: 'Lunge forward, back knee on pad, holding one strap for balance. Tuck tailbone gently and push hips forward for a deep hip flexor release.', warn: null },
        { name: 'TRX Supine Twist', phase: 'cooldown', sets: '2×30s/side', secs: 60, rounds: 1, restBetween: 0, detail: 'Gentle lumbar rotation on the floor.', info: 'Lie on back, arms wide, knees bent. Let knees gently fall side to side while breathing slowly to release QL and piriformis tension.', warn: null },
        { name: 'TRX Assisted Forward Fold', phase: 'cooldown', sets: '2×30s', secs: 60, rounds: 1, restBetween: 0, detail: 'Decompress entire posterior chain.', info: 'Face anchor holding long straps. Hinge forward and let the straps carry your upper-body weight so the spine decompresses.', warn: null },
        { name: 'TRX Child’s Pose Stretch', phase: 'cooldown', sets: '1×60s', secs: 60, rounds: 1, restBetween: 0, detail: 'Full lumbar and thoracic decompression.', info: 'Hold straps, kneel back toward heels with arms extended forward. Let your chest sink gently toward the floor for L4-L5 relief.', warn: null }
      ]
    },
    'foundation': {
      id: 'TRX_2',
      key: 'foundation',
      shortLabel: 'Phase 2: Foundation',
      title: 'Phase 2 – Foundation Stability',
      color: '#3B82F6',
      desc: 'Build deep core stabiliser strength with strict spine-neutral alignment throughout.',
      exercises: [
        { name: 'TRX Overhead Squat', phase: 'warmup', sets: '2×12 reps', secs: 60, rounds: 2, restBetween: 20, detail: 'Ankles, knees, hips all mobilised.', info: 'Hold straps overhead with straight arms. Squat deep keeping chest tall and lumbar neutral; straps counterbalance depth safely.', warn: null },
        { name: 'Cat-Cow on TRX', phase: 'warmup', sets: '2×10 reps', secs: 60, rounds: 1, restBetween: 0, detail: 'Hands in straps. Suspended spinal mobility.', info: 'Quadruped over strap handles. Arch spine up smoothly then extend gently; strap instability sharpens lumbar proprioception.', warn: null },
        { name: 'TRX Plank', phase: 'core', sets: '3×25s', secs: 45, rounds: 3, restBetween: 30, detail: 'Feet in cradles. Anterior core + anti-extension.', info: 'Feet in cradles, forearms on floor. Maintain a rigid plank; every micro-oscillation activates deep transverse abdominals and multifidus.', warn: 'If lower back dips, drop immediately to knees.' },
        { name: 'TRX Single-Leg Squat', phase: 'strength', sets: '3×8/side', secs: 60, rounds: 3, restBetween: 30, detail: 'Unilateral loading fixes pelvic asymmetries.', info: 'Hold straps and lower smoothly into a single-leg squat without spine rounding or knee cave.', warn: null },
        { name: 'TRX Pike', phase: 'core', sets: '3×10 reps', secs: 60, rounds: 3, restBetween: 30, detail: 'Feet in cradles. Dynamic anti-extension.', info: 'Start in TRX plank. Drive hips straight up into an inverted-V by pulling feet toward anchor, then return slowly without sagging.', warn: 'Advance slowly — high demand on lumbar stabilisers.' },
        { name: 'TRX Low Row', phase: 'strength', sets: '3×12 reps', secs: 60, rounds: 3, restBetween: 30, detail: 'Posterior chain strength; reverses desk/guard posture.', info: 'Facing anchor, body rigid. Pull elbows tight to ribs squeezing shoulder blades together without shrugging.', warn: null },
        { name: 'TRX Lat Stretch', phase: 'cooldown', sets: '2×30s/side', secs: 60, rounds: 1, restBetween: 0, detail: 'Releases thoracolumbar fascia.', info: 'Hold one strap overhead and side-step away from anchor, stretching smoothly from hip to armpit.', warn: null },
        { name: 'Supine Hamstring Stretch (TRX)', phase: 'cooldown', sets: '2×30s/side', secs: 60, rounds: 1, restBetween: 0, detail: 'Tight hamstrings pull lumbar into flexion.', info: 'Lie on back with one heel in cradle. Gently bring straight leg up using strap assistance while breathing calmly.', warn: null }
      ]
    },
    'strength': {
      id: 'TRX_3',
      key: 'strength',
      shortLabel: 'Phase 3: Core Strength',
      title: 'Phase 3 – Core Strength',
      color: '#F5A623',
      desc: 'Progressive anti-extension and anti-rotation loading with full spinal protection.',
      exercises: [
        { name: 'TRX Jump Squat (Low Impact)', phase: 'warmup', sets: '2×10 reps', secs: 60, rounds: 2, restBetween: 25, detail: 'Hold straps for safety. Land softly.', info: 'Squat to parallel holding straps, jump lightly and absorb landing softly through toes-to-heels.', warn: 'Skip impact if any spinal pain occurs on landing.' },
        { name: 'TRX Inchworm', phase: 'warmup', sets: '2×8 reps', secs: 60, rounds: 1, restBetween: 0, detail: 'Full posterior chain warm-up.', info: 'Walk hands smoothly from standing to plank and back with zero axial spinal compression.', warn: null },
        { name: 'TRX Rollout', phase: 'core', sets: '3×10 reps', secs: 60, rounds: 3, restBetween: 30, detail: 'Gold-standard anti-extension core builder.', info: 'Face away from anchor holding handles. Reach overhead into a rigid plank lean and pull back with lats and abs.', warn: 'Do NOT arch lower back.' },
        { name: 'TRX Side Plank', phase: 'core', sets: '3×25s/side', secs: 60, rounds: 3, restBetween: 30, detail: 'Feet in cradles. Trains QL & obliques.', info: 'Stack feet in cradles on side forearm. Keep hips stacked and ribcage locked without sagging.', warn: 'Drop hips immediately if lower back hurts.' },
        { name: 'TRX Body Saw', phase: 'core', sets: '3×12 reps', secs: 60, rounds: 3, restBetween: 30, detail: 'Dynamic anterior core load shift.', info: 'Forearm plank with feet in cradles. Saw smoothly backward and forward using elbows without letting hips dip.', warn: null },
        { name: 'TRX Hip Press', phase: 'strength', sets: '3×12 reps', secs: 60, rounds: 3, restBetween: 30, detail: 'Glute dominance over lower back.', info: 'Heels in cradles, drive hips straight up squeezing glutes cleanly without lumbar hyperextension.', warn: null },
        { name: 'TRX Standing Anti-Rotation', phase: 'core', sets: '3×8/side', secs: 60, rounds: 3, restBetween: 25, detail: 'Oblique brace for punch absorption.', info: 'Stand sideways holding extended straps; resist torso twist with rock-solid hips and core.', warn: null },
        { name: 'TRX Assisted Deep Squat Hold', phase: 'cooldown', sets: '2×40s', secs: 80, rounds: 1, restBetween: 0, detail: 'Decompresses lumbar discs & opens hips.', info: 'Hold straps, sink into a deep comfortable squat and breathe deeply for full lumbar unloading.', warn: null },
        { name: 'TRX Standing Thoracic Extension', phase: 'cooldown', sets: '2×30s', secs: 60, rounds: 1, restBetween: 0, detail: 'Thoracic mobility prevents lumbar compensation.', info: 'Face away holding straps overhead and gently open chest upward through mid-back.', warn: null }
      ]
    },
    'performance': {
      id: 'TRX_4',
      key: 'performance',
      shortLabel: 'Phase 4: Boxing Power',
      title: 'Phase 4 – Explosive Boxing Power',
      color: '#EF3E36',
      desc: 'High-intensity rotational power transfer integrating boxing kinetic chains.',
      exercises: [
        { name: 'TRX Explosive Row', phase: 'warmup', sets: '3×8 reps', secs: 60, rounds: 3, restBetween: 30, detail: 'Fast concentric pull, controlled eccentric.', info: 'Lean back aggressively and pull explosively to chest, training fast back-snap for hooks and retraction.', warn: null },
        { name: 'TRX Power Pull', phase: 'strength', sets: '3×6/side', secs: 60, rounds: 3, restBetween: 30, detail: 'Boxing-specific rotational power.', info: 'Single-arm rotational pull mimicking cross-and-hook hip torque with controlled core tension.', warn: null },
        { name: 'TRX Atomic Push-Up', phase: 'strength', sets: '3×10 reps', secs: 60, rounds: 3, restBetween: 30, detail: 'Push-up + suspended knee tuck.', info: 'Perform push-up with feet in cradles, then drive both knees smoothly toward chest without piking lower back.', warn: 'High demand — master TRX Plank first.' },
        { name: 'TRX Single-Arm Row (Rotational)', phase: 'strength', sets: '3×10/side', secs: 60, rounds: 3, restBetween: 30, detail: 'Mimics lead hook & cross torso whip.', info: 'Row powerfully on one strap while rotating torso smoothly through full boxing shoulder turn.', warn: null },
        { name: 'TRX Mountain Climber', phase: 'core', sets: '3×15/side', secs: 60, rounds: 3, restBetween: 30, detail: 'Rapid suspended knees to chest.', info: 'Plank with feet in cradles; drive alternate knees briskly while keeping shoulders stacked over wrists.', warn: null },
        { name: 'TRX Plank to Pike Jump', phase: 'core', sets: '3×8 reps', secs: 60, rounds: 3, restBetween: 30, detail: 'Reactive hip flexion & core snap.', info: 'Explode smoothly from suspended plank to tight pike and absorb return cleanly.', warn: null },
        { name: 'TRX Bulgarian Split Squat', phase: 'strength', sets: '3×8/side', secs: 60, rounds: 3, restBetween: 30, detail: 'Unilateral leg power for boxing footwork.', info: 'Rear foot suspended in cradle; drop cleanly into split squat to build explosive front-leg drive with zero spinal loading.', warn: 'Start shallow and build depth gradually.' },
        { name: 'TRX Full Body Stretch Flow', phase: 'cooldown', sets: '1×3 min', secs: 180, rounds: 1, restBetween: 0, detail: 'Slow flow across all ranges.', info: 'Flow through forward fold, runner’s lunge, lateral lat stretch, and thoracic opener with 3 slow breaths per pose.', warn: null }
      ]
    }
  };

  const EQUIPMENT_CATALOG = [
    { id: 'heavy_bag',   label: 'Heavy Bag',         icon: '🥊' },
    { id: 'jump_rope',   label: 'Jump Rope',         icon: '〰️' },
    { id: 'treadmill',   label: 'Treadmill',         icon: '🏃' },
    { id: 'gym_machine', label: 'Multi-Gym Machine', icon: '🏋️‍♂️' },
    { id: 'trx',         label: 'TRX Suspension',    icon: '🎗️' }
  ];

  function inferGearIds(wo) {
    if (!wo) return [];
    if (Array.isArray(wo.gearIds)) return wo.gearIds;
    const set = new Set();
    const names = (wo.exercises || []).map(e => String(e.name || '').toLowerCase()).join(' | ');
    const eq = Array.isArray(wo.equipment) ? wo.equipment.join(' ').toLowerCase() : '';
    const hay = names + ' ' + eq;
    if (hay.includes('heavy bag') || hay.includes('bag')) set.add('heavy_bag');
    if (hay.includes('jump rope') || hay.includes('rope')) set.add('jump_rope');
    if (hay.includes('treadmill')) set.add('treadmill');
    if (hay.includes('multi-gym') || hay.includes('machine') || hay.includes('cable')) set.add('gym_machine');
    if (hay.includes('trx')) set.add('trx');
    return Array.from(set);
  }

  LIBRARY_WORKOUTS.forEach(w => {
    if (!Array.isArray(w.gearIds)) w.gearIds = inferGearIds(w);
  });

  /* ── CUSTOM WORKOUT DRILL TEMPLATES ── */
  const WORKOUT_DRILL_TEMPLATES = [
    { name: 'Jump rope – Boxer Skip', phase: 'warmup', secs: 180, rounds: 1, restBetween: 0, detail: 'Warm-up rhythm' },
    { name: 'Jump rope – Ali Shuffle & Footwork', phase: 'warmup', secs: 180, rounds: 1, restBetween: 0, detail: 'Stance switches & lateral hops' },
    { name: 'Jump rope – 30/30 High-Knee Sprint Intervals', phase: 'warmup', secs: 180, rounds: 1, restBetween: 0, detail: '30s cruise / 30s high-knee sprints' },
    { name: 'Dynamic Shadow Flow & Footwork', phase: 'warmup', secs: 120, rounds: 1, restBetween: 0, detail: 'Loose stance & movement' },
    { name: 'Shadowboxing – 1-2-3 Rotational Flow', phase: 'boxing', secs: 180, rounds: 2, restBetween: 60, detail: 'Technical shadowboxing', comboTags: ['fundamentals', 'power'] },
    { name: 'Shadowboxing – Cuban Pendulum & Angles', phase: 'boxing', secs: 180, rounds: 2, restBetween: 60, detail: 'Footwork & pivots', comboTags: ['cuban', 'angles'] },
    { name: 'Shadowboxing – Peek-a-Boo Slips & Rolls', phase: 'boxing', secs: 180, rounds: 2, restBetween: 60, detail: 'Head movement & counters', comboTags: ['peekaboo', 'counter'] },
    { name: 'Heavy Bag – Power Impact & Weight Transfer', phase: 'boxing', secs: 180, rounds: 3, restBetween: 60, detail: 'Heavy bag power rounds', comboTags: ['power', 'fundamentals'] },
    { name: 'Heavy Bag – Mexican Body Snatcher', phase: 'boxing', secs: 180, rounds: 3, restBetween: 60, detail: 'Body-to-head hooks', comboTags: ['body_snatcher', 'inside'] },
    { name: 'Heavy Bag – Counter-Puncher’s Trap', phase: 'boxing', secs: 180, rounds: 3, restBetween: 60, detail: 'Defense-first bag counters', comboTags: ['counter', 'angles'] },
    { name: 'Heavy Bag – 30/30 Championship Burnout', phase: 'boxing', secs: 180, rounds: 2, restBetween: 45, detail: 'Speed & cardio burnout', comboTags: ['speed', 'power'] },
    { name: 'Multi-Gym – Explosive Chest Press', phase: 'strength', secs: 45, rounds: 3, restBetween: 40, detail: 'Explosive press, slow return' },
    { name: 'Multi-Gym – Single-Arm Rotational Punch Press', phase: 'strength', secs: 50, rounds: 3, restBetween: 30, detail: 'Standing punch extension + hip pivot' },
    { name: 'Multi-Gym – Seated Cable Row (Guard Retraction)', phase: 'strength', secs: 45, rounds: 3, restBetween: 35, detail: 'Fast retraction to ribs' },
    { name: 'Multi-Gym – Lat Pulldown (Punch Snap & Posture)', phase: 'strength', secs: 45, rounds: 3, restBetween: 35, detail: 'Thoracic posture & lat drive' },
    { name: 'Multi-Gym – Cable Woodchopper (Rotational Torque)', phase: 'core', secs: 50, rounds: 3, restBetween: 25, detail: 'Explosive hook/cross core torque' },
    { name: 'Multi-Gym – Cable Pallof Press (Anti-Rotation)', phase: 'core', secs: 45, rounds: 3, restBetween: 25, detail: 'Anti-rotation body-shot brace' },
    { name: 'Multi-Gym – Cable Face Pulls & Rotator Cuff', phase: 'strength', secs: 45, rounds: 3, restBetween: 25, detail: 'Shoulder durability & posture' },
    { name: 'Multi-Gym – Leg Press / Leg Drive Power', phase: 'strength', secs: 50, rounds: 3, restBetween: 40, detail: 'Lower-body knockout base' },
    { name: 'Treadmill – 3-Min Fight Interval Runs', phase: 'strength', secs: 180, rounds: 4, restBetween: 60, detail: '3:00 hard pace / 1:00 recovery walk' },
    { name: 'Treadmill – Hill Incline Sprints (8–10%)', phase: 'strength', secs: 30, rounds: 6, restBetween: 30, detail: '30s uphill drive / 30s rail rest' },
    { name: 'Explosive Plyo Push-Ups', phase: 'strength', secs: 45, rounds: 3, restBetween: 30, detail: 'Upper-body snap' },
    { name: 'Split Squat Jumps (Boxing Stance)', phase: 'strength', secs: 45, rounds: 3, restBetween: 30, detail: 'Explosive legs' },
    { name: 'Championship Burpees', phase: 'strength', secs: 45, rounds: 3, restBetween: 30, detail: 'Anaerobic burner' },
    { name: 'Iron Core Circuit (Plank / Climbers / Hollow)', phase: 'core', secs: 60, rounds: 2, restBetween: 25, detail: 'Rotational & anti-extension core' },
    { name: 'Treadmill – Active Recovery Cool-Down Walk', phase: 'cooldown', secs: 120, rounds: 1, restBetween: 0, detail: 'Slow nasal recovery walk' },
    { name: 'Cool-Down Static Stretch & Decompression', phase: 'cooldown', secs: 150, rounds: 1, restBetween: 0, detail: 'Post-session recovery' }
  ];

  /* ── PRO DURATION SCALING ENGINE (60m / 90m / 120m) ── */
  function blockSeconds(ex) {
    const r = Math.max(1, Number(ex.rounds) || 1);
    const s = Math.max(0, Number(ex.secs) || 0);
    const rb = Math.max(0, Number(ex.restBetween) || 0);
    return r * s + (r > 1 ? (r - 1) * rb : 0);
  }

  function listSeconds(list) {
    return list.reduce((sum, ex) => sum + blockSeconds(ex), 0);
  }

  function buildExpansionPool(wo) {
    const cat = wo.category || 'camp';
    const lvl = wo.level || 'intermediate';
    const id = wo.id || '';
    const gear = inferGearIds(wo);
    const roundSec = lvl === 'beginner' ? 120 : 180;
    const roundRest = lvl === 'advanced' ? 45 : 60;

    if (cat === 'shadowboxing') {
      return [
        { name: 'Shadowboxing – Cuban Pendulum & Angles', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Pendulum entries & 90° pivots', comboTags: ['cuban', 'angles'] },
        { name: 'Shadowboxing – Peek-a-Boo Slips & Rolls', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Head movement into 6–3–2', comboTags: ['peekaboo', 'counter'] },
        { name: 'Shadowboxing – Defensive Counters', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Parry, pull & return crisp combos', comboTags: ['counter', 'philly_shell'] },
        { name: 'Footwork-Only Pendulum & Box Drill', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Pure stance balance & exits', comboTags: ['angles', 'cuban'], allowedPunches: ['pivot', 'feint', 'slip-l', 'slip-r'] },
        { name: 'Shadowboxing – Championship Ghost Sparring', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Full 360° sparring simulation', comboTags: ['counter', 'power'] },
        { name: 'Shadowboxing – Rapid Hand Speed', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Loose shoulders & fast flurries', comboTags: ['speed', 'fundamentals'] },
        { name: 'Pogo Ankle Hops & Skater Bounds', phase: 'strength', secs: 45, rounds: 3, restBetween: 30, detail: 'Elastic calf reactivity' },
        { name: 'Split Squat Jumps (Boxing Stance)', phase: 'strength', secs: 45, rounds: 3, restBetween: 30, detail: 'Explosive leg spring' },
        { name: 'Iron Core Circuit (Plank / Climbers / Hollow)', phase: 'core', secs: 60, rounds: 2, restBetween: 30, detail: 'Core bracing' },
        { name: 'Isometric Neck & Anti-Rotation Plank', phase: 'core', secs: 60, rounds: 2, restBetween: 30, detail: 'Neck stability & plank' }
      ];
    }

    if (cat === 'gym_machine') {
      return [
        { name: 'Multi-Gym – Single-Arm Rotational Punch Press', phase: 'strength', secs: 50, rounds: 3, restBetween: 40, detail: 'Standing punch extension + heel pivot' },
        { name: 'Multi-Gym – Seated Cable Row (Guard Retraction)', phase: 'strength', secs: 50, rounds: 3, restBetween: 40, detail: 'Crisp upper-back snap' },
        { name: 'Multi-Gym – Explosive Chest Press', phase: 'strength', secs: 50, rounds: 3, restBetween: 40, detail: 'Explosive press + 2s return' },
        { name: 'Multi-Gym – Leg Press / Leg Drive Power', phase: 'strength', secs: 50, rounds: 3, restBetween: 40, detail: 'Heavy midfoot leg drive' },
        { name: 'Multi-Gym – Lat Pulldown (Punch Snap & Posture)', phase: 'strength', secs: 50, rounds: 3, restBetween: 35, detail: 'Thoracic posture & lat pull' },
        { name: 'Multi-Gym – Cable Woodchopper (Rotational Torque)', phase: 'core', secs: 50, rounds: 3, restBetween: 30, detail: 'Rotational hook/cross torque', noBack: true },
        { name: 'Multi-Gym – Cable Face Pulls & Rotator Cuff', phase: 'strength', secs: 45, rounds: 3, restBetween: 30, detail: 'Rotator cuff longevity' },
        { name: 'Multi-Gym – Cable Tricep Pushdowns (Punch Lockout)', phase: 'strength', secs: 45, rounds: 3, restBetween: 30, detail: 'Fast 1–2 elbow lockout' },
        { name: 'Multi-Gym – Cable Pallof Press (Anti-Rotation)', phase: 'core', secs: 50, rounds: 3, restBetween: 25, detail: 'Body-shot anti-rotation brace' },
        { name: 'Shadowboxing – 1-2-3 Rotational Flow', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Translate strength into snap', comboTags: ['power', 'fundamentals'] }
      ];
    }

    if (cat === 'cardio_rope') {
      const list = [];
      if (gear.includes('treadmill')) {
        list.push(
          { name: 'Treadmill – 3-Min Fight Interval Runs', phase: 'strength', secs: 180, rounds: 3, restBetween: 60, detail: '3:00 hard pace / 1:00 active walk' },
          { name: 'Treadmill – Fartlek Fight Surges', phase: 'strength', secs: 180, rounds: 2, restBetween: 60, detail: 'Steady jog with 20s surges' },
          { name: 'Treadmill – Hill Incline Sprints (8–10%)', phase: 'strength', secs: 30, rounds: 5, restBetween: 30, detail: 'Steep uphill drive / 30s rail rest' },
          { name: 'Treadmill – Aerobic Zone 2 Base Run', phase: 'strength', secs: 240, rounds: 2, restBetween: 60, detail: 'Controlled aerobic fight base' }
        );
      }
      if (gear.includes('jump_rope')) {
        list.push(
          { name: 'Jump rope – Ali Shuffle & Footwork', phase: 'boxing', secs: 180, rounds: 2, restBetween: 45, detail: 'Fluid stance switches & hops', comboTags: ['cuban', 'angles'] },
          { name: 'Jump rope – 30/30 High-Knee Sprint Intervals', phase: 'boxing', secs: 180, rounds: 2, restBetween: 45, detail: '30s cruise / 30s sprint knees', comboTags: ['speed'] },
          { name: 'Jump rope – Double Unders & Sprints', phase: 'boxing', secs: 180, rounds: 2, restBetween: 45, detail: 'Rapid wrist double-unders', comboTags: ['speed'] }
        );
      }
      list.push(
        { name: 'Pogo Ankle Hops & Skater Bounds', phase: 'strength', secs: 45, rounds: 3, restBetween: 30, detail: 'Ankle & calf springiness' },
        { name: 'Iron Core Circuit (Plank / Climbers / Hollow)', phase: 'core', secs: 60, rounds: 2, restBetween: 30, detail: 'Core stability' },
        { name: 'Shadowboxing – Rapid Hand Speed', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Light shadow rhythm', comboTags: ['speed'] }
      );
      return list;
    }

    if (cat === 'conditioning') {
      return [
        { name: 'HIIT – 10-Punch Burst & Squat', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: '10 straight bursts + 2 squats', comboTags: ['speed'] },
        { name: 'Championship Burpees', phase: 'strength', secs: 50, rounds: 3, restBetween: 30, detail: 'Anaerobic grit' },
        { name: 'Conditioning – Sprawls & Guard Up', phase: 'strength', secs: 50, rounds: 3, restBetween: 30, detail: 'Snap straight back to guard' },
        { name: 'Split Squat Jumps (Boxing Stance)', phase: 'strength', secs: 45, rounds: 3, restBetween: 30, detail: 'Explosive leg drive' },
        { name: 'Shadowboxing – Rapid Hand Speed', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Fast shadow recovery', comboTags: ['speed', 'fundamentals'] },
        { name: 'Iron Core Circuit (Plank / Climbers / Hollow)', phase: 'core', secs: 60, rounds: 3, restBetween: 25, detail: 'Body-shot abdominal armor' },
        { name: 'Isometric Neck & Anti-Rotation Plank', phase: 'core', secs: 60, rounds: 2, restBetween: 30, detail: 'Cervical stability' },
        { name: 'Rotational Russian Twists', phase: 'core', secs: 45, rounds: 3, restBetween: 25, detail: 'Oblique rotation', noBack: true }
      ];
    }

    // Default: Camp A / B / C / D & Heavy Bag
    const list = [];
    if (id === 'B') {
      list.push(
        { name: 'Shadowboxing – Cuban Pendulum & Angles', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Pendulum entries & 90° L-steps', comboTags: ['cuban', 'angles'] },
        { name: 'Heavy Bag – Rapid Hand Speed Flurries', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Nonstop fast hands', comboTags: ['speed'] },
        { name: 'Heavy Bag – Check Hooks & Pivot Exits', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Pivot 90° off pressure', comboTags: ['angles', 'cuban'] },
        { name: 'Multi-Gym – Single-Arm Rotational Punch Press', phase: 'strength', secs: 50, rounds: 3, restBetween: 35, detail: 'Explosive punch extension' },
        { name: 'Multi-Gym – Cable Tricep Pushdowns (Punch Lockout)', phase: 'strength', secs: 45, rounds: 3, restBetween: 30, detail: 'Crisp straight punch snap' },
        { name: 'Jump rope – Ali Shuffle & Footwork', phase: 'warmup', secs: 180, rounds: 2, restBetween: 45, detail: 'Fast stance footwork' },
        { name: 'Pogo Ankle Hops & Skater Bounds', phase: 'strength', secs: 45, rounds: 3, restBetween: 30, detail: 'Reactive agility' }
      );
    } else if (id === 'C') {
      list.push(
        { name: 'Heavy Bag – Mexican Body Snatcher', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Rip 45° liver hooks & head combos', comboTags: ['body_snatcher', 'inside'], noBack: true },
        { name: 'Heavy Bag – 30/30 Championship Burnout', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: '30s technical / 30s speed sprint', comboTags: ['speed', 'power'], noBack: true },
        { name: 'HIIT – 10-Punch Burst & Squat', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Punch burst + squat intervals', comboTags: ['speed'] },
        { name: 'Treadmill – 3-Min Fight Interval Runs', phase: 'strength', secs: 180, rounds: 2, restBetween: 60, detail: '3:00 hard pace / 1:00 active walk' },
        { name: 'Treadmill – Hill Incline Sprints (8–10%)', phase: 'strength', secs: 30, rounds: 4, restBetween: 30, detail: 'Steep incline bursts' },
        { name: 'Championship Burpees', phase: 'strength', secs: 50, rounds: 3, restBetween: 30, detail: 'Anaerobic capacity' },
        { name: 'Multi-Gym – Cable Pallof Press (Anti-Rotation)', phase: 'core', secs: 50, rounds: 3, restBetween: 25, detail: 'Anti-rotation body brace' }
      );
    } else if (id === 'D') {
      list.push(
        { name: 'Shadowboxing – Peek-a-Boo Slips & Rolls', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Nose-over-knee slips & U-rolls', comboTags: ['peekaboo', 'counter'] },
        { name: 'Shadowboxing – Defensive Counters', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Catch, pull & counter', comboTags: ['philly_shell', 'counter'] },
        { name: 'Heavy Bag – Counter-Puncher’s Trap', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Slip swinging bag & fire 3-punch counter', comboTags: ['counter', 'angles'] },
        { name: 'Heavy Bag – Check Hooks & Pivot Exits', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'L-step off-line counters', comboTags: ['angles', 'cuban'] },
        { name: 'Heavy Bag – Title Fight Simulation', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Full 360° ring simulation', comboTags: ['counter', 'power'], noBack: true },
        { name: 'Multi-Gym – Seated Cable Row (Guard Retraction)', phase: 'strength', secs: 50, rounds: 3, restBetween: 35, detail: 'Fast guard retraction' },
        { name: 'Multi-Gym – Lat Pulldown (Punch Snap & Posture)', phase: 'strength', secs: 50, rounds: 3, restBetween: 35, detail: 'Upper-back posture' },
        { name: 'Isometric Neck & Anti-Rotation Plank', phase: 'core', secs: 60, rounds: 2, restBetween: 30, detail: 'Cervical stability' }
      );
    } else {
      list.push(
        { name: 'Heavy Bag – Mexican Body Snatcher', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'High-low level switching', comboTags: ['body_snatcher', 'inside'], noBack: true },
        { name: 'Heavy Bag – Counter-Puncher’s Trap', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Defense triggers counter', comboTags: ['counter', 'angles'] },
        { name: 'Heavy Bag – Inside Pocket Warfare', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Short hooks & uppercuts', comboTags: ['inside', 'peekaboo'], noBack: true },
        { name: 'Heavy Bag – Power Pyramid (1-to-10)', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Escalating volume with full rotation', comboTags: ['power'], noBack: true },
        { name: 'Shadowboxing – 1-2-3 Rotational Flow', phase: 'boxing', secs: roundSec, rounds: 2, restBetween: roundRest, detail: 'Clean shadow mechanics', comboTags: ['fundamentals', 'power'] },
        { name: 'Multi-Gym – Explosive Chest Press', phase: 'strength', secs: 50, rounds: 3, restBetween: 40, detail: 'Explosive pressing power' },
        { name: 'Multi-Gym – Leg Press / Leg Drive Power', phase: 'strength', secs: 50, rounds: 3, restBetween: 40, detail: 'Sturdy lower-body base' },
        { name: 'Multi-Gym – Cable Woodchopper (Rotational Torque)', phase: 'core', secs: 50, rounds: 3, restBetween: 30, detail: 'Rotational hook torque', noBack: true },
        { name: 'Iron Core Circuit (Plank / Climbers / Hollow)', phase: 'core', secs: 60, rounds: 2, restBetween: 30, detail: 'Core armor' }
      );
      if (gear.includes('treadmill')) {
        list.push({ name: 'Treadmill – 3-Min Fight Interval Runs', phase: 'strength', secs: 180, rounds: 2, restBetween: 60, detail: '3:00 hard pace / 1:00 recovery walk' });
      }
    }
    return list;
  }

  function scaleWorkoutToDuration(wo, targetMins) {
    if (!wo || !Array.isArray(wo.exercises)) return wo;
    const target = Number(targetMins);
    if (![60, 90, 120].includes(target) || wo.fixedDuration || wo.category === 'trx' || wo.category === 'custom') {
      return wo;
    }

    const cloned = Object.assign({}, wo, {
      exercises: wo.exercises.map(ex => Object.assign({}, ex))
    });
    const targetSecs = target * 60;
    const baseStats = calcWorkoutStats(cloned);

    if (Math.abs(baseStats.totalSecs - targetSecs) <= 90) {
      return cloned;
    }

    // Separate trailing cooldown items
    let splitIdx = cloned.exercises.length;
    while (splitIdx > 0 && cloned.exercises[splitIdx - 1].phase === 'cooldown') {
      splitIdx--;
    }
    const body = cloned.exercises.slice(0, splitIdx);
    const tail = splitIdx < cloned.exercises.length
      ? cloned.exercises.slice(splitIdx)
      : [{ name: 'Cool-Down Static Stretch & Decompression', phase: 'cooldown', secs: 150, rounds: 1, restBetween: 0, detail: 'Full body stretch & recovery' }];

    // Extend warm-up rope/shadow slightly on 90m/120m
    if (target >= 90 && body.length > 0 && body[0].phase === 'warmup' && body[0].rounds === 1 && body[0].secs <= 180) {
      body[0].rounds = 2;
      body[0].restBetween = 30;
    }

    let curSecs = listSeconds(body) + listSeconds(tail);
    const pool = buildExpansionPool(cloned);

    // Phase 1: Expand using authentic category blocks
    let cycle = 0;
    let guard = 0;
    while (curSecs < targetSecs - 180 && cycle < 4 && guard < 40) {
      for (let i = 0; i < pool.length && curSecs < targetSecs - 120; i++) {
        guard++;
        const cand = Object.assign({}, pool[i]);
        const restSecs = body.length > 0 && body[body.length - 1].phase !== 'rest' ? 30 : 0;
        const fullAdd = restSecs + blockSeconds(cand);

        if (curSecs + fullAdd <= targetSecs + 60) {
          if (restSecs > 0) body.push(restBlock(restSecs, 'Breathe deep — transition station'));
          body.push(cand);
          curSecs += fullAdd;
        } else if (cand.rounds > 1) {
          const singleCand = Object.assign({}, cand, { rounds: 1, restBetween: 0 });
          const singleAdd = restSecs + blockSeconds(singleCand);
          if (curSecs + singleAdd <= targetSecs + 60) {
            if (restSecs > 0) body.push(restBlock(restSecs, 'Breathe deep — transition station'));
            body.push(singleCand);
            curSecs += singleAdd;
          }
        }
      }
      cycle++;
    }

    // Phase 2: Deterministic fine-tuning to guarantee [targetMins - 2, targetMins + 2]
    const gear = inferGearIds(cloned);
    let fineGuard = 0;
    while (curSecs < targetSecs - 60 && fineGuard < 20) {
      fineGuard++;
      const deficit = targetSecs - curSecs;
      if (deficit >= 150 && gear.includes('treadmill')) {
        const walkBlock = { name: 'Treadmill – Active Recovery Cool-Down Walk', phase: 'cooldown', secs: 150, rounds: 1, restBetween: 0, detail: 'Nasal recovery walk' };
        tail.unshift(walkBlock);
        curSecs += 150;
      } else if (deficit >= 120) {
        const flush = { name: 'Cool-Down Flush Shadowboxing', phase: 'cooldown', secs: 120, rounds: 1, restBetween: 0, detail: '30% easy shadow flush' };
        tail.unshift(flush);
        curSecs += 120;
      } else if (deficit >= 60) {
        const plank = { name: 'Forearm Plank & Side Plank', phase: 'core', secs: 60, rounds: 1, restBetween: 0, detail: 'Final core brace' };
        body.push(plank);
        curSecs += 60;
      } else {
        const lastCd = tail[tail.length - 1];
        if (lastCd && lastCd.secs + deficit <= 300) {
          lastCd.secs += deficit;
          curSecs += deficit;
        } else {
          break;
        }
      }
    }

    let trimGuard = 0;
    while (curSecs > targetSecs + 60 && trimGuard < 20) {
      trimGuard++;
      const over = curSecs - targetSecs;
      let trimmed = false;
      for (let i = body.length - 1; i >= 0; i--) {
        const ex = body[i];
        if (ex.phase === 'rest' && ex.secs >= 30) {
          body.splice(i, 1);
          curSecs -= ex.secs;
          trimmed = true;
          break;
        }
        if (ex.rounds > 1 && ex.phase !== 'warmup') {
          const prevSec = blockSeconds(ex);
          ex.rounds -= 1;
          curSecs -= (prevSec - blockSeconds(ex));
          trimmed = true;
          break;
        }
      }
      if (!trimmed && tail.length > 0) {
        const lastCd = tail[tail.length - 1];
        if (lastCd.secs > 120) {
          const cut = Math.min(over, lastCd.secs - 90);
          lastCd.secs -= cut;
          curSecs -= cut;
          trimmed = true;
        }
      }
      if (!trimmed) break;
    }

    cloned.exercises = [...body, ...tail];
    return cloned;
  }

  /* ── ACCURATE WORKOUT DURATION & ROUND CALCULATOR ── */
  function calcWorkoutStats(wo) {
    if (!wo || !Array.isArray(wo.exercises)) {
      return { totalSecs: 0, totalMins: 0, boxingRounds: 0, totalWorkRounds: 0 };
    }
    let totalSecs = 0;
    let boxingRounds = 0;
    let totalWorkRounds = 0;

    wo.exercises.forEach(ex => {
      const rounds = Math.max(1, Number(ex.rounds) || 1);
      const secs = Math.max(0, Number(ex.secs) || 0);
      const rb = Math.max(0, Number(ex.restBetween) || 0);

      totalSecs += rounds * secs;
      if (rounds > 1 && rb > 0) {
        totalSecs += (rounds - 1) * rb;
      }
      if (ex.phase === 'boxing') boxingRounds += rounds;
      if (ex.phase !== 'rest') totalWorkRounds += rounds;
    });

    return {
      totalSecs,
      totalMins: Math.max(1, Math.round(totalSecs / 60)),
      boxingRounds,
      totalWorkRounds
    };
  }

  /* ── PROGRESSIVE PROGRAM RESOLUTION ── */
  function getWeekOfProgram(dateObj, startDateStr) {
    const start = startDateStr ? new Date(startDateStr + 'T00:00:00') : new Date();
    const d = dateObj ? new Date(dateObj) : new Date();
    const diffMs = Math.max(0, d.getTime() - start.getTime());
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.floor(diffDays / 7) + 1);
  }

  function getWorkoutsForDateRange(dateObj, profile) {
    const prof = profile || (global.BoxingStorage ? global.BoxingStorage.getActiveProfile() : null);
    const progId = prof?.activeProgramId || 'classic';
    const lvl = prof?.fitnessLevel || 'intermediate';
    const startStr = prof?.programStartDate;

    if (progId === 'classic') {
      if (lvl === 'beginner') return WORKOUTS_BEG;
      if (lvl === 'advanced') return WORKOUTS_ADV;
      return WORKOUTS_INT;
    }

    const week = getWeekOfProgram(dateObj || new Date(), startStr);
    if (progId === '6m-ba') {
      if (week <= 8) return WORKOUTS_BEG;
      if (week <= 16) return WORKOUTS_INT;
      return WORKOUTS_ADV;
    }
    if (progId === '6m-bi') {
      return week <= 12 ? WORKOUTS_BEG : WORKOUTS_INT;
    }
    if (progId === '6m-ia') {
      return week <= 12 ? WORKOUTS_INT : WORKOUTS_ADV;
    }
    if (progId === '1y-ba') {
      if (week <= 16) return WORKOUTS_BEG;
      if (week <= 34) return WORKOUTS_INT;
      return WORKOUTS_ADV;
    }
    return WORKOUTS_INT;
  }

  function getScaledWorkoutsForDateRange(dateObj, profile, overrideMins) {
    const prof = profile || (global.BoxingStorage ? global.BoxingStorage.getActiveProfile() : null);
    const targetMins = Number(overrideMins) || Number(prof?.sessionDuration) || 60;
    const baseCamp = getWorkoutsForDateRange(dateObj, prof);
    const out = {};
    Object.keys(baseCamp).forEach(k => {
      out[k] = scaleWorkoutToDuration(baseCamp[k], targetMins);
    });
    return out;
  }

  function getWorkoutById(id, dateObj, profile, overrideMins) {
    const prof = profile || (global.BoxingStorage ? global.BoxingStorage.getActiveProfile() : null);
    const targetMins = Number(overrideMins) || Number(prof?.sessionDuration) || 60;
    const camp = getWorkoutsForDateRange(dateObj || new Date(), prof);
    if (camp[id]) return scaleWorkoutToDuration(camp[id], targetMins);

    const lib = LIBRARY_WORKOUTS.find(w => w.id === id);
    if (lib) return scaleWorkoutToDuration(lib, targetMins);

    if (prof && Array.isArray(prof.customWorkouts)) {
      const cw = prof.customWorkouts.find(w => w.id === id);
      if (cw) return cw;
    }

    const trxKey = Object.keys(TRX_ROUTINES).find(k => TRX_ROUTINES[k].id === id || k === id);
    if (trxKey) {
      const r = TRX_ROUTINES[trxKey];
      return {
        id: r.id,
        category: 'trx',
        level: 'all',
        fixedDuration: true,
        label: r.title,
        subtitle: r.desc,
        pill: 'ptrx',
        color: r.color,
        equipment: ['TRX Suspension Straps'],
        focus: r.desc,
        exercises: r.exercises
      };
    }

    return scaleWorkoutToDuration(camp.A, targetMins);
  }

  function getWorkoutCover(wo) {
    if (!wo) return 'images/covers/camp_hero.jpg';
    const cat = wo.category || '';
    const id = wo.id || '';
    if (id === 'camp_home_60' || id === 'A') return 'images/covers/camp_hero.jpg';
    if (id === 'camp_home_90') return 'images/covers/heavy_bag.jpg';
    if (id === 'camp_home_120') return 'images/covers/gym_machine.jpg';
    if (cat === 'full_camp') return 'images/covers/camp_hero.jpg';
    if (cat === 'heavy_bag') return 'images/covers/heavy_bag.jpg';
    if (cat === 'shadowboxing' || id === 'B' || id === 'D') return 'images/covers/shadow_footwork.jpg';
    if (cat === 'gym_machine') return 'images/covers/gym_machine.jpg';
    if (cat === 'cardio_rope' || cat === 'conditioning' || id === 'C') return 'images/covers/treadmill_rope.jpg';
    if (cat === 'trx' || id.startsWith('TRX')) return 'images/covers/shadow_footwork.jpg';
    return 'images/boxing_bg.jpg';
  }

  global.BoxingWorkouts = {
    PHASE_META,
    EQUIPMENT_CATALOG,
    WORKOUTS_BEG,
    WORKOUTS_INT,
    WORKOUTS_ADV,
    LIBRARY_WORKOUTS,
    TRX_ROUTINES,
    WORKOUT_DRILL_TEMPLATES,
    inferGearIds,
    scaleWorkoutToDuration,
    calcWorkoutStats,
    getWeekOfProgram,
    getWorkoutsForDateRange,
    getScaledWorkoutsForDateRange,
    getWorkoutById,
    getWorkoutCover
  };
})(typeof window !== 'undefined' ? window : globalThis);
