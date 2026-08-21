const CACHE_NAME = 'boxing-coach-v3';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './translations.js',
  './manifest.json',
  './trx.html',
  './images/boxing_bg.jpg',
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
  './audio/Shadowboxing_–_1-2-3_combos.mp3',
  './audio/Shadowboxing_–_defensive.mp3',
  './audio/Shadowboxing_–_full_combos.mp3',
  './audio/Shadowboxing_–_full_speed.mp3',
  './audio/Shadowboxing_–_slips_and_rolls.mp3',
  './audio/Speed_target_–_rapid_jabs.mp3',
  './audio/Conditioning__Sprawls.mp3',
  './audio/HIIT_–_10-punch_burst__squat.mp3',
  './audio/Heavy_bag_–_Round_1.mp3',
  './audio/Heavy_bag_–_Round_2.mp3',
  './audio/Heavy_bag_–_Round_3.mp3',
  './audio/Heavy_bag_–_body_shots.mp3',
  './audio/Heavy_bag_–_power_shots.mp3',
  './audio/Heavy_bag_–_Burnout.mp3',
  './audio/Heavy_bag_–_Counters.mp3',
  './audio/Heavy_bag_–_Def._Counters.mp3',
  './audio/Heavy_bag_–_Tabata.mp3',
  './audio/Heavy_bag_–_Technical_HIIT.mp3',
  './audio/Heavy_bag_–_Body_Snatcher.mp3',
  './audio/Heavy_bag__Check_Hooks.mp3',
  './audio/Heavy_bag__Feint_and_Counter.mp3'
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
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Network first for Supabase API calls or external CDN, Cache first for local assets
  if (e.request.url.includes('supabase.co') || e.request.url.includes('googleapis') || e.request.url.includes('gstatic')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, responseToCache);
        });
        return response;
      }).catch(() => cached);
    })
  );
});
