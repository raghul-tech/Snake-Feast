# Changelog — Web

Deployed on [Netlify](https://snake-feast-web.netlify.app/) with staging at [snake-feast-staging.netlify.app](https://snake-feast-staging.netlify.app/).
Also published on [Wavedash](https://wavedash.com/g/raghul-tech/snake-feast) with global leaderboards and cloud saves.

---

## [v2.0.0] - 2026-09-11

### Added
- Published on Wavedash — global leaderboards per difficulty, cloud saves, achievements sync, friends and stats
- Staging environment — `staging` branch auto-deploys to snake-feast-staging.netlify.app
- Production environment — `main` branch auto-deploys to snake-feast-web.netlify.app
- Netlify branch deploy CI/CD — push to branch = instant deploy, no manual steps
- `wavedash.toml` deploy config — `wavedash build push` from `web/` folder
- Wavedash SDK integration — `wavedash.js` handles leaderboard submit, achievement unlock, stats
- 6 power-up food types — Normal, Bonus, Poison, Magnet, Freeze, Warp
- Combo multiplier system up to ×8
- 11 unlockable achievements with toast notifications
- 3 difficulty modes — Easy, Medium, Hard
- Smooth 60fps lerp interpolation on snake movement
- Virtual joystick touch control — touch anywhere on screen
- Procedural Web Audio sound engine — all SFX and music, zero audio files
- RAF-based menu music scheduler — no drift
- Power-up status badges in-game
- Score pop animations at food position
- Responsive layout — works on all screen sizes
- Safe area CSS for notch/home bar devices
- localStorage score and achievement persistence (non-Wavedash sessions)

### Changed
- Complete UI redesign — dark theme, Orbitron + Share Tech Mono fonts
- Snake and food rendering completely redrawn with Phaser 3 Graphics API
- `score.js` updated — uses Wavedash cloud saves on Wavedash platform, localStorage elsewhere

### Fixed
- Audio pop on tab hide/show — fade before AudioContext suspend
- Sound corruption on slow connections — MAX_AHEAD clamp on audio scheduling
- Menu music drift when tab was backgrounded
- HUD overflow on narrow screens

---

## [v1.1.3] - 2024-10-27

### Added
- Gradient title text
- Improved responsive layout
- Arrow key controls
- Optimized animations

### Fixed
- Snake clipping through walls
- Self-collision detection
- Game Over screen typo

---

## [v1.1.2] - 2024-10-15

### Added
- Initial web release
- Basic snake movement, collision, score counter
- Game loop for cross-device consistency

### Fixed
- Food spawning off-screen
- Arrow keys unresponsive on some browsers

---

[Full Release History](https://github.com/raghul-tech/Snake-Feast/releases)