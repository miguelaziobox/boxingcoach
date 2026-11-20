const CACHE_NAME = 'boxing-coach-v7';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './translations.js',
  './manifest.json',
  './trx.html',
  './js/storage.js',
  './js/data-boxing.js',
  './js/data-combos.js',
  './js/data-workouts.js',
  './js/audio-engine.js',
  './images/boxing_bg.jpg',
  './images/covers/camp_hero.jpg',
  './images/covers/heavy_bag.jpg',
  './images/covers/shadow_footwork.jpg',
  './images/covers/gym_machine.jpg',
  './images/covers/treadmill_rope.jpg',
  './images/boxing_gloves.png',
  './images/boxing_gloves_base.png',
  './images/android/boxing_app_icon.png',
  './images/android/splash_screen.jpg',
  './audio/jab.mp3',
  './audio/cross.mp3',
  './audio/hook.mp3',
  './audio/uppercut.mp3',
  './audio/body.mp3',
  './audio/slip.mp3',
  './audio/Roll.mp3',
  './audio/Feint.mp3',
  './audio/L_Hook.mp3',
  './audio/R_Hook.mp3',
  './audio/L_Upper.mp3',
  './audio/R_Upper.mp3',
  './audio/Body_Jab.mp3',
  './audio/Body_Cross.mp3',
  './audio/Body_Lead_Hook.mp3',
  './audio/Body_Rear_Hook.mp3',
  './audio/rest.mp3',
  './audio/jump_rope.mp3',
  './audio/Push-ups.mp3',
  './audio/Plank.mp3',
  './audio/Burpees.mp3',
  './audio/Jump_squats.mp3',
  './audio/Bodyweight_squats.mp3',
  './audio/Walking_lunges.mp3',
  './audio/Mountain_climbers.mp3',
  './audio/Russian_twists.mp3',
  './audio/Bicycle_crunches.mp3',
  './audio/Hollow_body_hold.mp3',
  './audio/V-sits.mp3',
  './audio/Diamond_push-ups.mp3',
  './audio/Dynamic_stretching.mp3',
  './audio/Cool-down_stretch.mp3',
  './audio/Torso_twists.mp3',
  './audio/Arm_circles__shoulder_rolls.mp3',
  './audio/Hip_rotations__leg_swings.mp3',
  './audio/Neck_&_wrist_mobilisation.mp3',
  './audio/Shadowboxing_footwork.mp3',
  './audio/Shadowboxing__footwork.mp3',
  './audio/Shadowboxing__ringcraft.mp3',
  './audio/Shadowboxing_\u2013_1-2-3_combos.mp3',
  './audio/Shadowboxing_\u2013_defensive.mp3',
  './audio/Shadowboxing_\u2013_full_combos.mp3',
  './audio/Shadowboxing_\u2013_full_speed.mp3',
  './audio/Shadowboxing_\u2013_slips_and_rolls.mp3',
  './audio/Speed_target_\u2013_rapid_jabs.mp3',
  './audio/Conditioning__Sprawls.mp3',
  './audio/HIIT_\u2013_10-punch_burst__squat.mp3',
  './audio/Heavy_bag_\u2013_Round_1.mp3',
  './audio/Heavy_bag_\u2013_Round_2.mp3',
  './audio/Heavy_bag_\u2013_Round_3.mp3',
  './audio/Heavy_bag_\u2013_body_shots.mp3',
  './audio/Heavy_bag_\u2013_power_shots.mp3',
  './audio/Heavy_bag_\u2013_Burnout.mp3',
  './audio/Heavy_bag_\u2013_Counters.mp3',
  './audio/Heavy_bag_\u2013_Def._Counters.mp3',
  './audio/Heavy_bag_\u2013_Tabata.mp3',
  './audio/Heavy_bag_\u2013_Technical_HIIT.mp3',
  './audio/Heavy_bag_\u2013_Body_Snatcher.mp3',
  './audio/Heavy_bag__Check_Hooks.mp3',
  './audio/Heavy_bag__Feint_and_Counter.mp3',
  './audio/timer/1.mp3',
  './audio/timer/2.mp3',
  './audio/timer/3.mp3',
  './audio/timer/4.mp3',
  './audio/timer/5.mp3',
  './audio/timer/10.mp3',
  './audio/timer/30 seconds.mp3',
  './audio/timer/40 seconds.mp3',
  './audio/timer/45 seconds.mp3',
  './audio/timer/1 minute.mp3',
  './audio/timer/1 minute 30 seconds.mp3',
  './audio/timer/2 minutes.mp3',
  './audio/timer/2 minutes and 30 seconds.mp3',
  './audio/timer/3 minutes.mp3',
  './audio/timer/4 minutes.mp3',
  './audio/timer/5 minutes.mp3'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const asset of ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('Failed to cache asset:', asset, err);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('supabase.co') || e.request.url.includes('googleapis') || e.request.url.includes('gstatic')) {
    return;
  }

  const reqUrl = new URL(e.request.url);
  const isMedia = /\.(mp3|wav|ogg|jpg|jpeg|png|webp|svg|ico)$/i.test(reqUrl.pathname);

  if (isMedia) {
    // Cache-first for heavy static audio & cover imagery
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
          }
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // Network-first for HTML, JS, CSS, JSON so updates appear immediately while preserving offline fallback
  e.respondWith(
    fetch(e.request).then(response => {
      if (response && response.status === 200 && response.type === 'basic') {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
      }
      return response;
    }).catch(() => caches.match(e.request))
  );
});
