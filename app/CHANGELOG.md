# Changelog — Desktop

Available on [Microsoft Store](https://apps.microsoft.com/detail/9pc2z9ngjkkt), [SourceForge](https://sourceforge.net/projects/snake-feast/) and [itch.io](https://raghul-tech.itch.io/snake-feast).
Supports Windows and Linux.

---

## [v2.0.0] - 2026-09-11

### Added
- Linux support — AppImage and binary via SourceForge and itch.io
- `winget install "Snake Feast"` support on Windows
- Published on itch.io alongside Microsoft Store and SourceForge
- 6 power-up food types — Normal, Bonus, Poison, Magnet, Freeze, Warp
- Combo multiplier up to ×8
- 11 unlockable achievements with toast notifications
- 3 difficulty modes — Easy, Medium, Hard
- Smooth 60fps lerp interpolation on snake movement
- Procedural Web Audio sound engine — all SFX and music, zero audio files
- Pink noise generator for higher quality sound
- Brick-wall limiter + soft compressor chain
- RAF-based menu music scheduler — no drift
- Power-up status badges in-game
- Score pop animations at food position
- Window state memory — saves and restores position, size and maximised state between sessions (`window.json`)
- Score persistence via PyQt bridge to `scores.json` in platform-appropriate data directory
  - Windows: `%APPDATA%\SnakeFeast\`
  - Linux: `~/.local/share/SnakeFeast/`
- Dark native title bar on Windows
- F11 fullscreen toggle
- Mute state persists across sessions

### Changed
- PyInstaller build command updated — excludes unused PyQt5 modules to reduce binary size
- Windows packaging changed to `.msixbundle` format for Microsoft Store submission
- `makeappx.exe` used for bundle creation
- Web game files shared from `../web/` folder — no duplication between desktop and web builds
- Complete UI redesign matching web v2.0 — dark theme, Orbitron + Share Tech Mono

### Fixed
- Audio pop on window focus/blur — fade before AudioContext suspend
- Sound corruption on system lag — MAX_AHEAD clamp on audio scheduling
- Menu music drift when window was minimised

### Build commands
**Windows:**
```bash
pyinstaller --onedir --windowed --icon=icon/snakefeast.ico ... main.py
makeappx.exe bundle /d "msix" /p "Output\snakefeast-v2.0.0.msixbundle"
```
**Linux:**
```bash
pyinstaller --onedir --windowed --icon=icon/snakefeast.png ... main.py
```

---

## [v1.0.0] - 2025

### Added
- Initial release on Microsoft Store (Windows only)
- PyQt5 desktop wrapper around web game core
- PyQtWebEngine for HTML5/JS rendering
- QWebChannel Python ↔ JavaScript bridge for score persistence
- Basic snake movement, food, collision, score counter
- Dark title bar on Windows

---

[Full Release History](https://github.com/raghul-tech/Snake-Feast/releases)