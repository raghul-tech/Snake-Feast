<div align="center">

<img src="webview/icon/48.png" alt="Snake Feast" width="80" height="80">

# Snake Feast 🐍

**The snake game built for developers — play it without leaving VS Code.**

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Install-0078D4?style=for-the-badge&logo=eclipseide&logoColor=white&labelColor=1a1a2e)](https://marketplace.visualstudio.com/items?itemName=raghul-tech.snake-feast)
[![Open VSX](https://img.shields.io/badge/Open%20VSX-Install-A100FF?style=for-the-badge&logo=eclipseide&logoColor=white&labelColor=1a1a2e)](https://open-vsx.org/extension/raghul-tech/snake-feast)
[![Play Online](https://img.shields.io/badge/Play%20Online-snake--feast.netlify.app-00C7B7?style=for-the-badge&logo=netlify&logoColor=white&labelColor=1a1a2e)](https://snake-feast-web.netlify.app/)
[![Wavedash](https://img.shields.io/badge/Wavedash-Play%20%26%20Leaderboard-FF6B35?style=for-the-badge&logo=gamepad&logoColor=white&labelColor=1a1a2e)](https://wavedash.com/g/raghul-tech/snake-feast)
[![GitHub](https://img.shields.io/badge/GitHub-snake--feast-181717?style=for-the-badge&logo=github&logoColor=white&labelColor=1a1a2e)](https://github.com/raghul-tech/snake-feast)
[![License](https://img.shields.io/badge/License-GPL%20v3-blue?style=for-the-badge&logo=gnu&logoColor=white&labelColor=1a1a2e)](LICENSE)

*Take a break. Eat some food. Don't hit the wall.*

</div>

---

## 🎮 What is Snake Feast?

Snake Feast is a fully-featured, modern Snake game that runs as a panel right inside Visual Studio Code. No browser tab, no alt-tab, no distractions — just open it, play it, close it, and get back to coding.

Built with Phaser 3 and the VS Code Webview API, it has everything the classic game is missing: six unique food types with real effects, power-ups that change how the game plays, a combo multiplier for chaining eats, synthesized sound effects (no audio files), and per-difficulty high scores that save to your VS Code profile.

> **One-click launch** from the status bar at the bottom of your screen. Your high scores persist across sessions automatically.

---

## ✨ Features at a glance

| | |
|---|---|
| 🎮 **Phaser 3 rendering** | Smooth 60fps canvas rendering inside a VS Code panel |
| 🍎 **Six food types** | Each with unique points, effects, and sounds |
| ⚡ **Power-up system** | Ghost mode, magnet, freeze, and warp — all stackable |
| 🔥 **Combo multiplier** | Chain eats quickly to multiply points up to ×8 |
| 🏆 **High score persistence** | Best scores saved per difficulty to your VS Code profile |
| 🔊 **Synthesized audio** | Every action has its own sound — no audio files needed |
| 🎵 **Ambient menu music** | Calm background music on the menu, silence while playing |
| 🎨 **Six snake colors** | Personalize your snake before each game |
| ⌨️ **Keyboard + swipe** | Arrow keys, WASD, or swipe if you're on a touch display |
| 🌙 **Dark neon UI** | Designed to match your dark theme — not fight it |

---

## 🚀 Getting Started

**Install from the VS Code Marketplace:**

1. Open VS Code
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac) to open Extensions
3. Search for **Snake Feast**
4. Click **Install**

**Launch the game:**

- Click **🐍 Snake Feast** in the bottom status bar, **or**
- Open the Command Palette (`Ctrl+Shift+P`) and run `Snake Feast: Start`

The game opens in a VS Code panel. Pick your difficulty, choose your snake color, and hit **START GAME**.

---

## 🕹 How to Play

```
Goal: eat food to grow longer and score points.
      don't hit the walls or your own body.
```

### Controls

| Action | Keys |
|---|---|
| Move up | `↑` or `W` |
| Move down | `↓` or `S` |
| Move left | `←` or `A` |
| Move right | `→` or `D` |
| Pause / Resume | `P` or `Esc` or ⏸ button |
| Mute / Unmute | 🔊 button in the top bar |
| Start game | `Enter` or **START GAME** button |

> **Tip:** The snake speeds up as it grows. Shorter bursts of play can score more points than reckless growth.

---

## 🍎 Food Types

Six types of food appear on the board at once. Learning what each one does is the key to high scores.

| Color | Name | Points | Effect |
|---|---|---|---|
| 🔵 **Blue** | Normal | +1 | Standard food. Grow and score. |
| 🟡 **Gold star** | Bonus | +5 | High value. Also activates **ghost mode** — pass through your own body briefly. |
| 🟢 **Green** | Poison | −3 | Shrinks your snake by 3 segments. Risky shortcut for clearing space. |
| 🩷 **Pink** | Magnet | +2 | Pulls nearby food toward you for several seconds. Great for chaining combos. |
| 🩵 **Cyan** | Freeze | +2 | Freezes food aging so items don't expire while you eat. |
| 🟣 **Purple** | Warp | +3 | Activates ghost mode. High value, worth chasing. |

> **Poison tip:** If your snake is very short, poison can be fatal. If you're long, eating it can buy you space to maneuver — sometimes worth the −3.

---

## 🔥 Combo System

Eat food quickly in succession to build a **combo multiplier**:

```
First eat         →  ×1  (normal)
Second eat fast   →  ×2  (double points)
Third eat fast    →  ×3  (triple points)
...up to...       →  ×8  (maximum)
```

The combo resets if you wait too long between eats. Magnet food is extremely powerful for combo-chaining because it pulls other food toward the snake head.

**Example:** Eating a bonus food (+5) at ×3 combo gives **+15 points** instead of +5.

---

## ⚡ Power-Ups

| Power-up | Duration | What it does |
|---|---|---|
| 👻 **Ghost mode** | ~11 seconds (easy) | Your snake passes through its own body. No self-collision. Activated by bonus or warp food. |
| 🧲 **Magnet** | ~22 seconds (easy) | Food within 4 cells is pulled toward the snake head every tick. |
| ❄ **Freeze** | ~13 seconds (easy) | Food stops aging — nothing expires while freeze is active. |

Active power-ups are shown as badges in the bottom-left corner of the game area.

---

## 🏆 Difficulty Modes

| Mode | Speed | Best for |
|---|---|---|
| **Easy** | Slow | Casual play, learning food types |
| **Medium** | Moderate | Regular play, combo building |
| **Hard** | Fast | High score chasing |

Each difficulty has its own separate high score. Resetting one mode does not affect the others.

> Speed also increases as your snake grows longer — Hard mode with a length-30 snake is a genuine challenge.

---

## 💾 High Scores

Your best score for each difficulty is saved automatically to your VS Code global state — it persists across sessions, workspace changes, and VS Code restarts.

- **Reset Best** button in the top bar resets only the currently selected mode
- Switching mode in the menu updates the displayed best score immediately

---

## 🎵 Sound

All sounds are synthesized using the **Web Audio API** — no audio files are downloaded or bundled. Every action has a distinct sound:

| Event | Sound |
|---|---|
| Eat normal food | Short blip |
| Eat bonus food | Rising chime |
| Eat magnet | Magnetic pulse |
| Eat freeze | Ice crystal |
| Eat warp | Warp whoosh |
| Eat poison | Sour drop |
| Combo | Layered chime (higher with each level) |
| Pause | Soft mute |
| Wall hit / Self hit | Distinct crunch sounds |
| Game over | Descending chord |
| Menu music | Ambient chord loop |

Mute and unmute with the 🔊 button. Mute state is saved per session.

---

## 📸 Screenshots

<p align="center">
    <img src="webview/icon/start.png" alt="Start">
  </a>
</p>

<p align="center">
    <img src="webview/icon/play.png" alt="play">
  </a>
</p>

<p align="center">
    <img src="webview/icon/end.png" alt="end">
  </a>
</p>

---

## ❓ FAQ

**Does it work offline?**
Yes — the game is entirely self-contained. No internet connection needed.

**Will it slow down my editor?**
No. The game only runs when the panel is open and visible. When you switch to a code tab, the Webview is hidden and rendering pauses automatically.

**My high score disappeared.**
High scores are saved to VS Code's `globalState`. If you reinstall the extension or reset VS Code's extension data, scores will reset. This is a VS Code platform limitation.

**Can I move the panel?**
Yes — drag the Snake Feast tab to any panel group, or move it to a split editor on the right while your code is on the left.

**The game is too fast on Hard.**
That's intentional 😄 — try Medium and build up combos to maximize your score without dying to speed.

**I want to suggest a feature or report a bug.**
Open an issue on [GitHub](https://github.com/raghul-tech/snake-feast/issues). PRs are welcome.

---

## 🛠 Extension Details

| | |
|---|---|
| **Publisher** | raghul-tech |
| **Engine** | Phaser 3 (local, no CDN) |
| **Audio** | Web Audio API (no files) |
| **Storage** | VS Code `globalState` API |
| **Permissions** | None — no network access, no filesystem access |
| **VS Code version** | 1.75.0 or later |

---

## 🔗 Links

- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=raghul-tech.snake-feast)
- [Open VSX](https://open-vsx.org/extension/raghul-tech/snake-feast)
- [GitHub Repository](https://github.com/raghul-tech/snake-feast)
- [Report an Issue](https://github.com/raghul-tech/snake-feast/issues)
- [Play in Browser](https://snake-feast-web.netlify.app/)
- [Play on Wavedash](https://wavedash.com/g/raghul-tech/snake-feast)

---

## 📄 License

GNU General Public License v3.0 — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Made for developers who need a break.**

*Star the repo if you enjoyed it ⭐*

</div>