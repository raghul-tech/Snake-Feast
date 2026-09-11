# Changelog — Android

Available on [Google Play](https://play.google.com/store/apps/details?id=io.github.raghultech.snakefeast).
App ID: `io.github.raghultech.snakefeast`

---

## [v2.0.0] - 2026-09-11

### 🎉 First release on Google Play

### Added
- Published on Google Play Store — Production track
- Packaged with Capacitor from the web game source
- Forced landscape orientation via `sensorLandscape` in AndroidManifest — both landscape directions supported based on how user holds phone
- `android:resizeableActivity="true"` — proper multi-window and tablet support
- Android adaptive icon — transparent foreground logo, `#00ffaa` background
- Safe area inset CSS — handles notch, status bar and home bar on all Android phones
- GPU-accelerated canvas — `translateZ(0)` and `will-change: transform` on Phaser canvas
- AudioContext suspend on app background — no audio pop when switching apps
- Fade in/out on focus/blur events — clean audio transitions
- MAX_AHEAD clamp (180ms) — prevents sound corruption when phone lags or freezes
- Pink noise generator — smoother, less harsh noise on phone speakers
- Brick-wall limiter (ratio 20) — prevents hardware clipping on all Android speakers
- Hi-shelf boost +4dB at 3.5kHz — compensates for phone speaker high-frequency rolloff
- Low-cut filter at 60Hz — removes inaudible bass that wastes amplifier headroom
- Virtual joystick touch control — touch anywhere, joystick appears at touch point
- Swipe gesture control — swipe in any direction to turn snake
- localStorage score and achievement persistence — works natively in Capacitor WebView
- HUD nowrap fix — `flex-wrap: nowrap` prevents HUD items wrapping to second line
- `clamp()` sizing on all HUD elements — scales cleanly on every Android screen size
- Reset Best button hidden on very small screens (< 360px) to prevent overflow
- 6 power-up food types, combo system, 11 achievements, 3 difficulty modes
- Smooth 60fps lerp movement

### Changed
- versionCode set via `capacitor.config.json` `android.versionCode` — survives `npx cap sync`
- versionCode 3, versionName 2.0 (codes 1 and 2 used during internal/closed testing)

### Build details
- Built with Capacitor
- Minimum SDK: 24 (Android 7.0 Nougat)
- Target SDK: 35
- AAB size: 3.27 MB
- Download time: ~1 second

---

[Full Release History](https://github.com/raghul-tech/Snake-Feast/releases)