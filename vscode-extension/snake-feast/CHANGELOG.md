# Changelog — VS Code Extension

Available on [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=raghul-tech.snake-feast) and [Open VSX](https://open-vsx.org/extension/raghul-tech/snake-feast).
Publisher: `raghul-tech`

---

## [v2.0.0] - 2026-09-11

### 🎉 First release on VS Code Marketplace and Open VSX

### Added
- Published on VS Code Marketplace
- Published on Open VSX Registry — available for VSCodium and other VS Code forks
- One-click launch from status bar — 🐍 Snake Feast button at the bottom of the editor
- Command Palette support — `Snake Feast: Start` via `Ctrl+Shift+P`
- Game runs in a VS Code Webview panel — drag to any panel group or split editor
- Webview rendering pauses automatically when panel is hidden — zero performance impact on coding
- Score persistence via VS Code `globalState` API — survives sessions, workspace changes and restarts
- 6 power-up food types — Normal, Bonus, Poison, Magnet, Freeze, Warp
- Combo multiplier up to ×8
- 11 unlockable achievements with toast notifications
- 3 difficulty modes — Easy (160ms), Medium (120ms), Hard (80ms)
- Speed scaling — snake speeds up as it grows
- 6 snake colour options
- Smooth 60fps lerp interpolation on snake movement
- Procedural Web Audio sound engine — all SFX and menu music, zero audio files
- Ambient chord-progression menu music — silence during gameplay so you can focus
- Keyboard controls — Arrow keys and WASD
- Power-up status badges in-game
- Score pop animations at food position
- Dark neon UI — `#08080f` background, `#00ffaa` accent — designed to match dark editor themes
- No network access, no filesystem access — zero permissions required
- Phaser 3 bundled locally — no CDN dependency, works fully offline
- VS Code version requirement: 1.75.0 or later

### Build details
- Engine: Phaser 3 (local, no CDN)
- Audio: Web Audio API (no audio files)
- Storage: VS Code `globalState` API
- Permissions: none

---

[Full Release History](https://github.com/raghul-tech/Snake-Feast/releases)