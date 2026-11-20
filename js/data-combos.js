/* ── BOXING COACH PRO v3.0 — AUTHENTIC BIOMECHANICAL COMBINATION LIBRARY ── */
(function (global) {
  'use strict';

  const COMBO_LIBRARY = [
    /* ── BEGINNER TIER (16 combos) ── */
    {
      id: 'b_jab_single',
      name: 'Range Finder Jab',
      notation: '1',
      tier: 'beginner',
      tags: ['fundamentals', 'jab_mastery'],
      punches: ['jab'],
      cue: 'Step smoothly, snap the jab straight out and back to your eyebrow.'
    },
    {
      id: 'b_double_jab',
      name: 'Double Jab Stutter',
      notation: '1–1',
      tier: 'beginner',
      tags: ['fundamentals', 'jab_mastery', 'cuban'],
      punches: ['jab', 'jab'],
      cue: 'First jab gauges distance; second steps inside with authority.'
    },
    {
      id: 'b_triple_jab',
      name: 'Triple Jab Pressure',
      notation: '1–1–1',
      tier: 'beginner',
      tags: ['fundamentals', 'jab_mastery', 'speed'],
      punches: ['jab', 'jab', 'jab'],
      cue: 'Walk forward cleanly behind three snapping leads without leaning.'
    },
    {
      id: 'b_one_two',
      name: 'Classic One-Two',
      notation: '1–2',
      tier: 'beginner',
      tags: ['fundamentals', 'power', 'speed'],
      punches: ['jab', 'cross'],
      cue: 'Blind with the jab, rotate the rear hip hard through the cross.'
    },
    {
      id: 'b_double_jab_cross',
      name: 'Double Jab–Cross',
      notation: '1–1–2',
      tier: 'beginner',
      tags: ['fundamentals', 'jab_mastery', 'cuban'],
      punches: ['jab', 'jab', 'cross'],
      cue: 'Break their rhythm on the second jab, then unleash the straight rear hand.'
    },
    {
      id: 'b_jab_cross_jab',
      name: 'Jab–Cross–Exit Jab',
      notation: '1–2–1',
      tier: 'beginner',
      tags: ['fundamentals', 'jab_mastery', 'angles'],
      punches: ['jab', 'cross', 'jab'],
      cue: 'Step back out on the final jab so you never linger in pocket range.'
    },
    {
      id: 'b_one_two_three',
      name: 'Text-Book 1-2-3',
      notation: '1–2–3',
      tier: 'beginner',
      tags: ['fundamentals', 'power'],
      punches: ['jab', 'cross', 'lead-hook'],
      cue: 'Straight shots draw hands center; whip the 90° lead hook around the guard.'
    },
    {
      id: 'b_jab_hook',
      name: 'Jab–Lead Hook',
      notation: '1–3',
      tier: 'beginner',
      tags: ['fundamentals', 'angles'],
      punches: ['jab', 'lead-hook'],
      cue: 'Touch upstairs with the jab and step slightly right as you whip the 3.'
    },
    {
      id: 'b_cross_hook',
      name: 'Cross–Lead Hook',
      notation: '2–3',
      tier: 'beginner',
      tags: ['fundamentals', 'power', 'inside'],
      punches: ['cross', 'lead-hook'],
      cue: 'Weight transfers rear-to-front on the 2, snapping back on the 3.'
    },
    {
      id: 'b_body_jab_head_cross',
      name: 'Body Jab–Head Cross',
      notation: '1b–2',
      tier: 'beginner',
      tags: ['fundamentals', 'body_snatcher'],
      punches: ['body-jab', 'cross'],
      cue: 'Drop knees to stab the solar plexus, spring right up with the rear straight.'
    },
    {
      id: 'b_head_jab_body_cross',
      name: 'High-Low 1–2b',
      notation: '1–2b',
      tier: 'beginner',
      tags: ['fundamentals', 'body_snatcher'],
      punches: ['jab', 'body-cross'],
      cue: 'Snap the high jab into their eyes, dip knees and drill the cross downstairs.'
    },
    {
      id: 'b_one_two_four',
      name: 'Straight-to-Overhand',
      notation: '1–2–4',
      tier: 'beginner',
      tags: ['fundamentals', 'power'],
      punches: ['jab', 'cross', 'rear-hook'],
      cue: 'Follow the 2 with a crisp looping rear hook over their lead shoulder.'
    },
    {
      id: 'b_lead_upper_cross',
      name: 'Lead Upper–Cross',
      notation: '5–2',
      tier: 'beginner',
      tags: ['fundamentals', 'inside'],
      punches: ['lead-upper', 'cross'],
      cue: 'Lift their chin with the tight 5, then split the open guard with the 2.'
    },
    {
      id: 'b_jab_rear_upper',
      name: 'Jab–Rear Uppercut',
      notation: '1–6',
      tier: 'beginner',
      tags: ['fundamentals', 'inside'],
      punches: ['jab', 'rear-upper'],
      cue: 'Step inside behind the jab and drive the rear uppercut vertically.'
    },
    {
      id: 'b_jab_body_hook',
      name: 'Jab–Body Lead Hook',
      notation: '1–3b',
      tier: 'beginner',
      tags: ['fundamentals', 'body_snatcher'],
      punches: ['jab', 'body-lead-hook'],
      cue: 'Use the jab as camouflage while stepping onto the lead hip for a liver hook.'
    },
    {
      id: 'b_slip_jab_cross',
      name: 'Slip & 1-2',
      notation: 'SLIP-L–1–2',
      tier: 'beginner',
      tags: ['fundamentals', 'counter', 'peekaboo'],
      punches: ['slip-l', 'jab', 'cross'],
      cue: 'Take your head inches off-line before answering immediately with 1–2.'
    },

    /* ── INTERMEDIATE TIER (22 combos) ── */
    {
      id: 'i_one_two_three_two',
      name: 'Championship 1-2-3-2',
      notation: '1–2–3–2',
      tier: 'intermediate',
      tags: ['fundamentals', 'power', 'speed'],
      punches: ['jab', 'cross', 'lead-hook', 'cross'],
      cue: 'Fluid left-right-left-right kinetic rotation; pivot feet cleanly on every punch.'
    },
    {
      id: 'i_mexican_liver',
      name: 'Mexican Liver Setup',
      notation: '1–2–3b–3',
      tier: 'intermediate',
      tags: ['body_snatcher', 'power'],
      punches: ['jab', 'cross', 'body-lead-hook', 'lead-hook'],
      cue: 'Go body then head on the same left side — drop their elbow with 3b, finish upstairs.'
    },
    {
      id: 'i_body_cross_hook',
      name: 'Level-Change Ripper',
      notation: '1–2b–3–2',
      tier: 'intermediate',
      tags: ['body_snatcher', 'power'],
      punches: ['jab', 'body-cross', 'lead-hook', 'cross'],
      cue: 'Dip for the body cross, rise directly into the lead hook and trailing straight.'
    },
    {
      id: 'i_double_body_head',
      name: 'Body Snatcher Special',
      notation: '1–2–3b–4b',
      tier: 'intermediate',
      tags: ['body_snatcher', 'inside'],
      punches: ['jab', 'cross', 'body-lead-hook', 'body-rear-hook'],
      cue: 'Bring hands up top, then dig alternating hooks under both floating ribs.'
    },
    {
      id: 'i_slip_r_counter',
      name: 'Outside Slip Counter',
      notation: 'SLIP-R–2–3–2',
      tier: 'intermediate',
      tags: ['counter', 'peekaboo', 'philly_shell'],
      punches: ['slip-r', 'cross', 'lead-hook', 'cross'],
      cue: 'Slip outside their jab onto your rear hip, then fire back with full torque.'
    },
    {
      id: 'i_slip_l_counter',
      name: 'Lead Slip Liver Rip',
      notation: 'SLIP-L–3b–2–3',
      tier: 'intermediate',
      tags: ['counter', 'body_snatcher', 'peekaboo'],
      punches: ['slip-l', 'body-lead-hook', 'cross', 'lead-hook'],
      cue: 'Slip inside their cross right into range for a crushing liver hook–cross–hook.'
    },
    {
      id: 'i_roll_counter',
      name: 'Roll Under & Return',
      notation: 'ROLL–2–3–2',
      tier: 'intermediate',
      tags: ['counter', 'peekaboo'],
      punches: ['roll', 'cross', 'lead-hook', 'cross'],
      cue: 'Bob in a compact U under the hook and surface firing the rear hand.'
    },
    {
      id: 'i_parry_counter',
      name: 'Catch & Pitch',
      notation: 'PARRY–1–2–3',
      tier: 'intermediate',
      tags: ['counter', 'philly_shell', 'fundamentals'],
      punches: ['parry', 'jab', 'cross', 'lead-hook'],
      cue: 'Catch their jab cleanly in your rear palm and instantly return 1–2–3.'
    },
    {
      id: 'i_pull_two_three',
      name: 'Pull Counter Blitz',
      notation: 'PULL–2–3–2',
      tier: 'intermediate',
      tags: ['counter', 'philly_shell'],
      punches: ['pull', 'cross', 'lead-hook', 'cross'],
      cue: 'Lean inches onto your back hip so their lead misses, then explode down the pipe.'
    },
    {
      id: 'i_check_hook_pivot',
      name: 'Check Hook Escape',
      notation: '1–2–PIVOT–3',
      tier: 'intermediate',
      tags: ['angles', 'cuban', 'counter'],
      punches: ['jab', 'cross', 'pivot', 'lead-hook'],
      cue: 'Draw pressure forward, whip 90° off-line on the pivot, and clip them with the 3.'
    },
    {
      id: 'i_uppercut_combo',
      name: 'Guard Splitter',
      notation: '1–2–5–2',
      tier: 'intermediate',
      tags: ['inside', 'power'],
      punches: ['jab', 'cross', 'lead-upper', 'cross'],
      cue: 'Drive straight shots to tighten their guard, lift their chin with 5, finish with 2.'
    },
    {
      id: 'i_cross_upper_hook',
      name: 'Inside Triangle',
      notation: '2–5–3',
      tier: 'intermediate',
      tags: ['inside', 'power', 'peekaboo'],
      punches: ['cross', 'lead-upper', 'lead-hook'],
      cue: 'Same-side 5–3 after the 2 forces your lead hip to recoil and whip fast.'
    },
    {
      id: 'i_upper_hook_cross',
      name: 'Uppercut-Hook-Cross',
      notation: '6–3–2',
      tier: 'intermediate',
      tags: ['inside', 'power', 'peekaboo'],
      punches: ['rear-upper', 'lead-hook', 'cross'],
      cue: 'Drive the rear uppercut through the center, wrap the hook, slam the cross.'
    },
    {
      id: 'i_feint_two_three',
      name: 'Feint & Punish',
      notation: 'FEINT–2–3–2',
      tier: 'intermediate',
      tags: ['angles', 'cuban', 'counter'],
      punches: ['feint', 'cross', 'lead-hook', 'cross'],
      cue: 'Sell the jab twitch with shoulders and eyes; fire as soon as their guard reacts.'
    },
    {
      id: 'i_feint_body',
      name: 'High Feint to Body',
      notation: 'FEINT–1–2b–3',
      tier: 'intermediate',
      tags: ['body_snatcher', 'cuban'],
      punches: ['feint', 'jab', 'body-cross', 'lead-hook'],
      cue: 'Lift their hands upstairs with the feint + jab, drop into 2b, rise with 3.'
    },
    {
      id: 'i_speed_four',
      name: 'Rapid Straight Burst',
      notation: '1–2–1–2',
      tier: 'intermediate',
      tags: ['speed', 'fundamentals'],
      punches: ['jab', 'cross', 'jab', 'cross'],
      cue: 'Keep shoulders loose and pop 4 straight punches with zero pause between strikes.'
    },
    {
      id: 'i_double_hook',
      name: 'Hook-to-Hook Swap',
      notation: '3–4–3',
      tier: 'intermediate',
      tags: ['inside', 'power'],
      punches: ['lead-hook', 'rear-hook', 'lead-hook'],
      cue: 'Compact elbows inside; drive weight rhythmically left-right-left.'
    },
    {
      id: 'i_jab_upper_cross',
      name: 'Jab–Rear Upper–Hook',
      notation: '1–6–3',
      tier: 'intermediate',
      tags: ['inside', 'angles'],
      punches: ['jab', 'rear-upper', 'lead-hook'],
      cue: 'Split their high guard with 6 right up the middle, then clip around with 3.'
    },
    {
      id: 'i_one_two_slip_three',
      name: 'Hit, Slip, Punish',
      notation: '1–2–SLIP-L–3',
      tier: 'intermediate',
      tags: ['counter', 'angles'],
      punches: ['jab', 'cross', 'slip-l', 'lead-hook'],
      cue: 'Expect a counter after your 1–2; slip immediately and answer with a sharp 3.'
    },
    {
      id: 'i_cuban_entry',
      name: 'Cuban Pendulum Entry',
      notation: '1–1–2–PIVOT',
      tier: 'intermediate',
      tags: ['cuban', 'angles', 'jab_mastery'],
      punches: ['jab', 'jab', 'cross', 'pivot'],
      cue: 'Glide in behind a double jab–cross and immediately pivot off the track.'
    },
    {
      id: 'i_upstairs_downstairs',
      name: 'Upstairs-Downstairs',
      notation: '1–3b–2–3',
      tier: 'intermediate',
      tags: ['body_snatcher', 'speed'],
      punches: ['jab', 'body-lead-hook', 'cross', 'lead-hook'],
      cue: 'Mix targets cleanly so their hands never know whether to guard high or low.'
    },
    {
      id: 'i_double_upper_hook',
      name: 'Shoeshine Uppers & Hook',
      notation: '5–6–3–2',
      tier: 'intermediate',
      tags: ['inside', 'speed'],
      punches: ['lead-upper', 'rear-upper', 'lead-hook', 'cross'],
      cue: 'Fast alternating uppercuts up the center line followed by heavy horizontal power.'
    },

    /* ── ADVANCED TIER (24 combos) ── */
    {
      id: 'a_peekaboo_ambush',
      name: 'Peek-a-Boo Tyson Ambush',
      notation: 'SLIP-R–ROLL–6–3–2',
      tier: 'advanced',
      tags: ['peekaboo', 'counter', 'power'],
      punches: ['slip-r', 'roll', 'rear-upper', 'lead-hook', 'cross'],
      cue: 'Slip the jab, weave beneath the hook, and explode up with D’Amato’s signature 6–3–2.'
    },
    {
      id: 'a_dempsey_roll',
      name: 'Pendulum Peek-a-Boo',
      notation: 'SLIP-L–3b–3–SLIP-R–2',
      tier: 'advanced',
      tags: ['peekaboo', 'body_snatcher'],
      punches: ['slip-l', 'body-lead-hook', 'lead-hook', 'slip-r', 'cross'],
      cue: 'Double left hook body-to-head off a lead slip, slip off the return, fire the cross.'
    },
    {
      id: 'a_philly_crab_counter',
      name: 'Philly Shell Shoulder Counter',
      notation: 'ROLL–2–3–PULL–2',
      tier: 'advanced',
      tags: ['philly_shell', 'counter'],
      punches: ['roll', 'cross', 'lead-hook', 'pull', 'cross'],
      cue: 'Shoulder-roll the cross, counter 2–3, pull back from their panic hook, snipe with 2.'
    },
    {
      id: 'a_philly_trap',
      name: 'Philly Parry-Pull Trap',
      notation: 'PARRY–1–PULL–2–3–PIVOT',
      tier: 'advanced',
      tags: ['philly_shell', 'counter', 'angles'],
      punches: ['parry', 'jab', 'pull', 'cross', 'lead-hook', 'pivot'],
      cue: 'Catch the jab, bait a cross with your own 1, pull-counter 2–3 and vanish on the angle.'
    },
    {
      id: 'a_cuban_matador',
      name: 'Cuban Matador Flurry',
      notation: '1–1–2–PIVOT–3–2–1',
      tier: 'advanced',
      tags: ['cuban', 'angles', 'speed'],
      punches: ['jab', 'jab', 'cross', 'pivot', 'lead-hook', 'cross', 'jab'],
      cue: 'Blitz down the pipe, L-step off the centerline, unleash 3–2, exit behind a stiff jab.'
    },
    {
      id: 'a_cuban_feint_blitz',
      name: 'Cuban Double-Feint Angle',
      notation: 'FEINT–1–2–SLIP-R–3–PIVOT',
      tier: 'advanced',
      tags: ['cuban', 'angles', 'counter'],
      punches: ['feint', 'jab', 'cross', 'slip-r', 'lead-hook', 'pivot'],
      cue: 'Draw their guard with the feint, land 1–2, slip past their jab, check-hook pivot out.'
    },
    {
      id: 'a_power_builder',
      name: 'Power Builder 1-2-3-6-3',
      notation: '1–2–3–6–3',
      tier: 'advanced',
      tags: ['power', 'inside'],
      punches: ['jab', 'cross', 'lead-hook', 'rear-upper', 'lead-hook'],
      cue: 'Every shot loaded from the canvas; finish with an explosive hook as they drop guard.'
    },
    {
      id: 'a_body_breaker',
      name: 'Mexican Body Breaker',
      notation: '1–2b–3b–3–2',
      tier: 'advanced',
      tags: ['body_snatcher', 'power'],
      punches: ['jab', 'body-cross', 'body-lead-hook', 'lead-hook', 'cross'],
      cue: 'Tear into the midsection with 2b–3b before rising cleanly into 3–2 upstairs.'
    },
    {
      id: 'a_body_head_weave',
      name: 'Pocket Ripper & Weave',
      notation: '3b–4b–5–3–ROLL',
      tier: 'advanced',
      tags: ['body_snatcher', 'inside', 'peekaboo'],
      punches: ['body-lead-hook', 'body-rear-hook', 'lead-upper', 'lead-hook', 'roll'],
      cue: 'Dig both ribs, lift the chin with 5, wrap 3, and weave clean out of pocket.'
    },
    {
      id: 'a_speed_seven',
      name: 'Speed Flurry 7-Punch',
      notation: '1–2–1–2–3–2–1',
      tier: 'advanced',
      tags: ['speed', 'power'],
      punches: ['jab', 'cross', 'jab', 'cross', 'lead-hook', 'cross', 'jab'],
      cue: 'Rapid-fire cadence with sharp exhales; touch, snap, overwhelm without stiff shoulders.'
    },
    {
      id: 'a_shoeshine_eight',
      name: 'Ray Leonard Shoeshine',
      notation: '1–2–5–6–5–6–3–2',
      tier: 'advanced',
      tags: ['speed', 'inside'],
      punches: ['jab', 'cross', 'lead-upper', 'rear-upper', 'lead-upper', 'rear-upper', 'lead-hook', 'cross'],
      cue: 'Blind them with 1–2, flurry rapid uppercuts inside, crack hard with the 3–2.'
    },
    {
      id: 'a_same_side_stack',
      name: 'Same-Side Triple Stack',
      notation: '3b–5–3–2',
      tier: 'advanced',
      tags: ['inside', 'body_snatcher', 'peekaboo'],
      punches: ['body-lead-hook', 'lead-upper', 'lead-hook', 'cross'],
      cue: 'Reload the lead hip between each left-hand angle change, then slam the right cross.'
    },
    {
      id: 'a_counter_surgeon',
      name: 'Counter Surgeon',
      notation: 'FEINT–2–SLIP-L–3–6–2',
      tier: 'advanced',
      tags: ['counter', 'angles'],
      punches: ['feint', 'cross', 'slip-l', 'lead-hook', 'rear-upper', 'cross'],
      cue: 'Bait the jab, counter straight, slip their second punch, and unload heavy inside.'
    },
    {
      id: 'a_level_changer_six',
      name: 'Three-Level Sniper',
      notation: '1–2–6–3b–3–2',
      tier: 'advanced',
      tags: ['body_snatcher', 'power'],
      punches: ['jab', 'cross', 'rear-upper', 'body-lead-hook', 'lead-hook', 'cross'],
      cue: 'Straight high, uppercut midline, hook to liver, hook to jaw, cross straight home.'
    },
    {
      id: 'a_check_hook_blitz',
      name: 'Pressure Stopper',
      notation: '1–1b–3–PIVOT–2–3',
      tier: 'advanced',
      tags: ['angles', 'cuban', 'body_snatcher'],
      punches: ['jab', 'body-jab', 'lead-hook', 'pivot', 'cross', 'lead-hook'],
      cue: 'Freeze feet with the 1–1b, turn them with the pivot hook, punish the open side.'
    },
    {
      id: 'a_overhand_weave',
      name: 'Overhand-Weave-Hook',
      notation: '1–4–ROLL–3–2',
      tier: 'advanced',
      tags: ['power', 'peekaboo', 'counter'],
      punches: ['jab', 'rear-hook', 'roll', 'lead-hook', 'cross'],
      cue: 'Drop your head off-center throwing the heavy 4, roll under their counter, punish.'
    },
    {
      id: 'a_parry_inside_storm',
      name: 'Catch-and-Storm',
      notation: 'PARRY–3–6–3–2',
      tier: 'advanced',
      tags: ['counter', 'inside', 'philly_shell'],
      punches: ['parry', 'lead-hook', 'rear-upper', 'lead-hook', 'cross'],
      cue: 'Catch the jab with your rear glove and immediately fire a four-piece inside storm.'
    },
    {
      id: 'a_body_jab_counter',
      name: 'Body-Jab Slip Ambush',
      notation: '1b–SLIP-R–2–3b–2',
      tier: 'advanced',
      tags: ['body_snatcher', 'counter'],
      punches: ['body-jab', 'slip-r', 'cross', 'body-lead-hook', 'cross'],
      cue: 'Stab low to draw their counter cross, slip outside it, and rip 2–3b–2.'
    },
    {
      id: 'a_double_pivot',
      name: 'Lomachenko Angle Matrix',
      notation: '1–2–PIVOT–1–2–3–PIVOT',
      tier: 'advanced',
      tags: ['cuban', 'angles', 'speed'],
      punches: ['jab', 'cross', 'pivot', 'jab', 'cross', 'lead-hook', 'pivot'],
      cue: 'Never punch twice from the same zip code — shift angles between every burst.'
    },
    {
      id: 'a_inside_hooks_exit',
      name: 'Phone-Booth Hook Exchange',
      notation: '3–4–5–6–ROLL–3',
      tier: 'advanced',
      tags: ['inside', 'peekaboo'],
      punches: ['lead-hook', 'rear-hook', 'lead-upper', 'rear-upper', 'roll', 'lead-hook'],
      cue: 'Short tight elbows inside, drop cleanly under their counter hook, and snap last.'
    },
    {
      id: 'a_rear_upper_body',
      name: 'Uppercut-to-Liver Combo',
      notation: '1–6–3b–4–3',
      tier: 'advanced',
      tags: ['body_snatcher', 'inside', 'power'],
      punches: ['jab', 'rear-upper', 'body-lead-hook', 'rear-hook', 'lead-hook'],
      cue: 'Lift their chin with 6 to expose the ribs for 3b, then slam 4–3 to the jaw.'
    },
    {
      id: 'a_championship_finisher',
      name: 'Title Round Burnout',
      notation: '1–2–3–2–3–4–1–2',
      tier: 'advanced',
      tags: ['speed', 'power'],
      punches: ['jab', 'cross', 'lead-hook', 'cross', 'lead-hook', 'rear-hook', 'jab', 'cross'],
      cue: 'Eight crisp strikes at championship pace — snap every glove straight back to guard.'
    },
    {
      id: 'a_slip_double_upper',
      name: 'Slip & Uppercut Trap',
      notation: 'SLIP-L–5–6–3–PIVOT',
      tier: 'advanced',
      tags: ['peekaboo', 'counter', 'inside'],
      punches: ['slip-l', 'lead-upper', 'rear-upper', 'lead-hook', 'pivot'],
      cue: 'Slip inside the cross, dig both uppercuts between their elbows, hook & pivot out.'
    },
    {
      id: 'a_feint_pull_finish',
      name: 'High-IQ Feint & Snipe',
      notation: 'FEINT–PULL–2–3b–3–2',
      tier: 'advanced',
      tags: ['philly_shell', 'counter', 'cuban'],
      punches: ['feint', 'pull', 'cross', 'body-lead-hook', 'lead-hook', 'cross'],
      cue: 'Trigger their panic jab with a twitch, pull cleanly, and counter 2–3b–3–2.'
    }
  ];

  let lastSelectedComboId = null;

  function tierRank(tier) {
    if (tier === 'beginner') return 1;
    if (tier === 'intermediate') return 2;
    return 3;
  }

  function formatComboNotation(punches, calloutStyle, stance) {
    const bd = global.BoxingData;
    if (!bd) return (punches || []).join('–');
    return (punches || []).map(k => bd.getPunchDisplayLabel(k, calloutStyle || 'names', stance || 'orthodox')).join(' · ');
  }

  function getCombosForFilter(opts) {
    const { level = 'intermediate', tags = [], style = 'all', customCombos = [] } = opts || {};
    const maxRank = tierRank(level);
    let pool = COMBO_LIBRARY.filter(c => tierRank(c.tier) <= maxRank);

    if (Array.isArray(tags) && tags.length > 0) {
      const tagged = pool.filter(c => c.tags.some(t => tags.includes(t)));
      if (tagged.length > 0) pool = tagged;
    }

    if (style && style !== 'all') {
      const styled = pool.filter(c => c.tags.includes(style));
      if (styled.length >= 3) pool = styled;
    }

    // Mix in user custom combos if they match or if no strict tag filter excludes all
    const validCustom = (customCombos || []).map((cc, idx) => ({
      id: cc.id || `custom_${idx}`,
      name: cc.name || 'Custom Combo',
      notation: (cc.punches || []).join('–'),
      tier: 'custom',
      tags: ['custom'],
      punches: (cc.punches || []).map(k => global.BoxingData ? global.BoxingData.resolvePunchKey(k) : k),
      cue: cc.cue || 'Your custom combination — snap punches cleanly and reset your guard.'
    }));

    return [...pool, ...validCustom];
  }

  function generateNextCombo(ex, options) {
    const opts = options || {};
    const level = opts.level || 'intermediate';
    const style = opts.style || 'all';
    const customCombos = opts.customCombos || [];

    const exTags = Array.isArray(ex?.comboTags) ? ex.comboTags : [];
    const allowedPunches = Array.isArray(ex?.allowedPunches) ? ex.allowedPunches : null;

    let pool = getCombosForFilter({
      level,
      tags: exTags,
      style,
      customCombos
    });

    if (allowedPunches && allowedPunches.length > 0) {
      const strict = pool.filter(c => c.punches.every(p => allowedPunches.includes(p)));
      if (strict.length > 0) pool = strict;
    }

    // Filter out pure custom combos if exercise specifies strict allowedPunches that custom doesn't fit
    if (pool.length === 0 && allowedPunches && allowedPunches.length > 0) {
      const len = Math.floor(Math.random() * 2) + 2;
      const punches = [];
      for (let i = 0; i < len; i++) {
        punches.push(allowedPunches[Math.floor(Math.random() * allowedPunches.length)]);
      }
      return {
        id: 'dyn_' + Date.now(),
        name: 'Tactical Drill',
        notation: formatComboNotation(punches, 'numbers', 'orthodox'),
        tier: level,
        tags: exTags,
        punches,
        cue: 'Stay sharp on mechanics and snap gloves back to your chin.'
      };
    }

    // Prefer non-repeat
    let candidates = pool;
    if (pool.length > 1 && lastSelectedComboId) {
      const withoutLast = pool.filter(c => c.id !== lastSelectedComboId);
      if (withoutLast.length > 0) candidates = withoutLast;
    }

    const picked = candidates[Math.floor(Math.random() * candidates.length)] || COMBO_LIBRARY[3];
    lastSelectedComboId = picked.id;
    return picked;
  }

  global.BoxingCombos = {
    COMBO_LIBRARY,
    getCombosForFilter,
    generateNextCombo,
    formatComboNotation
  };
})(typeof window !== 'undefined' ? window : globalThis);
