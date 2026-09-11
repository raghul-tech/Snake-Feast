# Changelog

All notable changes to this project will be documented in this file.


## [v2.0.0] - 2026-09-11
### 🚀 Multi-Platform Launch

Released Snake Feast on 5 platforms on the same day:

| Platform | Store / Link |
| --- | --- |
| 🌐 Web | Netlify (live since v1) |
| 🤖 Android | Google Play Store |
| 🪟 Windows | Microsoft Store |
| 💻 VS Code | VS Code Marketplace |
| 🌍 Chrome | Chrome Web Store |

### Added
- **Power-up system**: 6 unique food types: Normal (+1), Bonus (+5 + ghost mode), Poison (−3, shrinks snake), Magnet (pulls food), Freeze (slows speed), Warp (+3 + ghost)
- **Combo multiplier**: Chain food pickups for up to x8 score multiplier
- **11 achievements**: Unlockable in-game with toast notification popups
- **3 difficulty modes**: Easy (160ms), Medium (120ms), Hard (80ms)
- **Speed scaling**: Snake speeds up as it grows in all modes
- **6 snake colour options**: Personalise your snake before each game
- **Smooth 60fps movement**: Lerp interpolation between grid steps (no more jumping)
- **Virtual joystick**: Touch anywhere to get a joystick on mobile
- **Procedural audio engine**: All sound effects and menu music generated via Web Audio API, zero audio files needed
- **High quality mobile audio**: Pink noise, brick-wall limiter, hi-shelf boost for phone speakers
- **Menu music**: Looping ambient chord progression using RAF scheduler (no drift)
- **Power-up status badges**: Ghost, Magnet, Freeze and Combo shown in-game
- **Score pop animations**: Points appear at the food location when eaten
- **Camera shake and flash on death**
- **Death cause message**: Tells you if you hit a wall, ate yourself or died from poison
- **Android app**: Packaged with Capacitor, landscape forced, safe area support
- **Responsive layout**: Works on all screen sizes: small phones, landscape phones, tablets, desktops

### Changed
- Complete UI redesign — dark theme with `#08080f` background and `#00ffaa` accent
- Fonts switched to Orbitron (headings) and Share Tech Mono (body)
- HUD redesigned — score, mode badge, best score, pause and mute all in one bar
- Game Over screen redesigned with large score display
- Snake rendering changed from squares to circles with eye detail on head
- Food rendering changed — each type has unique shape (star for bonus, rings for warp)
- Grid changed from lines to subtle dot pattern

### Fixed
- HUD breaking on small screens — fixed with `flex-wrap: nowrap` and `clamp()` sizing
- Audio pop on app close/open — fixed with fade out before `AudioContext` suspend
- Sound corruption on phone lag — fixed with `MAX_AHEAD` clamp (180ms) on all scheduled notes
- Menu music drift — replaced `setTimeout` scheduling with `requestAnimationFrame` look-ahead

---

## [v1.1.3] - 2024-10-27
### Added
- **New Visual Enhancements**: Eye-catching gradient text for the game title.
- **Responsive Design**: Improved layout for seamless gameplay across desktop, tablet, and mobile devices.
- **Keyboard Controls**: Added intuitive arrow key navigation for easy gameplay.
- **Optimized Graphics**: Sleek visuals and smooth animations for an engaging user experience.

### Changed
- Improved game performance by optimizing JavaScript rendering.
- Enhanced food placement algorithm to prevent overlap with the snake's body.
- Minor updates to color schemes for better visibility and aesthetics.

### Fixed
- Resolved a bug where the snake's body sometimes clipped through walls on specific screen sizes.
- Fixed an issue where the snake occasionally failed to detect collision with itself.
- Corrected a typo in the "Game Over" screen.

---

## [v1.1.2] - 2024-10-15
### Added
- **Initial Release of Snake Feast**: A modern twist on the classic snake game with the following features:
  - Basic snake movement and food consumption mechanics.
  - Collision detection with walls and the snake’s body.
  - Score counter to track your progress.
  - Clean and minimalistic game interface.

### Changed
- Introduced basic game loop for consistent gameplay across devices.

### Fixed
- Resolved initial bugs related to food spawning outside of visible areas.
- Fixed an issue with arrow key controls being unresponsive on some browsers.

---

## How to Play
- **Controls**: Use the arrow keys on your keyboard to navigate the snake.
- **Objective**: Eat food to grow longer while avoiding collisions with walls or yourself.

---

[Full Release History](https://github.com/raghul-tech/Snake-Feast/releases)
