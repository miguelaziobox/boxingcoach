# Boxing Coach Pro (v3.0)

A complete, offline-ready combat-sports coaching and home-gym boxing training PWA.

## Quick Start

1. Open `index.html` in any modern browser (works locally via `file://` or over HTTP/HTTPS as an installable PWA).
2. Switch between **Orthodox** and **Southpaw** stances in the header at any time — punch callouts, technique notes, and the live target silhouette adapt automatically.
3. Configure your owned gear under **Stats & Settings → My Home Gym Gear** (Heavy Bag, Jump Rope, Treadmill, Multi-Gym Machine, TRX Suspension).

## Architecture

- `index.html` — Responsive 5-tab application shell, SVG Target HUD, Full-Screen Focus Mode overlay, Quick Fight Timer, Custom Combo Builder, and Custom Workout Builder.
- `style.css` — Dark obsidian combat-sports design system (`#090B0E` matte surfaces, responsive mobile bottom navigation bar & desktop grid).
- `js/storage.js` — Local-first persistence (`boxingCoach_v3`), multi-profile support, cross-month consecutive streak engine, 12-week heatmap aggregation, 10 achievement badges, and JSON backup import/export (v2 & v3 compatible).
- `js/data-boxing.js` — Official 1–6 boxing punch numbering + body shots + defensive slips/rolls/pulls/parries/pivots, 18-guide Technique Academy, comprehensive Exercise Info directory, and rotating Corner Tips.
- `js/data-combos.js` — 62 tiered biomechanical combinations across Beginner, Intermediate, and Advanced levels (Peek-a-Boo, Philly Shell, Cuban Matador, Body Snatcher, Counter-Punching).
- `js/data-workouts.js` — Scheduled Fight Camp (Days A–D across 3 tiers integrated with Multi-Gym, Treadmill & Jump Rope), 22 curated specialty workouts across 5 categories, and the full 4-phase TRX Core & Back Health program.
- `js/audio-engine.js` — Ringside Web Audio synthesizer (brass bell, 10-second wooden clapper, distinct leather punch/whoosh SFX) paired with local MP3 + Web Speech callouts (`Names` or `1-2-3 Numbers`).
- `app.js` — Leak-free timer & inter-round rest state machine, Focus Mode controller, Workout Browser, builders, and keyboard shortcuts (`Space`, `ArrowLeft`, `ArrowRight`, `F`, `Esc`).
- `translations.js` — English (`en`) and European Portuguese (`pt-PT`) translations.
- `sw.js` & `manifest.json` — Offline Service Worker (`boxing-coach-v4`) and PWA manifest.
