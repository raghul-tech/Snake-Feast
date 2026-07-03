# <img src="icon/48.png" alt="Snake Feast" width="32" height="32" style="vertical-align:middle;"> Snake Feast 🐍

A modern, feature-rich Snake game that runs in your browser. Eat food, grow longer, collect power-ups, rack up combos, and chase your high score — no install needed.

[![Production](https://img.shields.io/badge/Production-Live-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://snake-feast-web.netlify.app/)
[![Staging](https://img.shields.io/badge/Staging-Live-F0AD4E?style=for-the-badge&logo=netlify&logoColor=white)](https://snake-feast-staging.netlify.app/)
[![License](https://img.shields.io/badge/License-GPL%20v3-blue.svg?style=for-the-badge)](LICENSE)

---

## 🌐 Live URLs

| Environment | URL |
|---|---|
| 🟢 Production | https://snake-feast-web.netlify.app/ |
| 🟡 Staging | https://snake-feast-staging.netlify.app/ |

---

## 🚀 CI/CD — Auto Deploy via Netlify

This project uses **Netlify branch deploys**. Pushing to either branch triggers an automatic deployment — no manual steps needed.

| Branch | Deploys To |
|---|---|
| `staging` | https://snake-feast-staging.netlify.app/ |
| `main` | https://snake-feast-web.netlify.app/ |

### How it works

```
Your machine
    │
    ├── git push origin staging  →  Netlify builds  →  snake-feast-staging.netlify.app
    │
    └── git push origin main     →  Netlify builds  →  snake-feast-web.netlify.app
```

### Typical release flow

```bash
# 1. Work on your feature
git checkout staging
git add .
git commit -m "feat: your change"
git push origin staging
# ✅ Staging deploys automatically — test it at snake-feast-staging.netlify.app

# 2. Once happy, promote to production
git checkout main
git merge staging
git push origin main
# ✅ Production deploys automatically — live at snake-feast-web.netlify.app
```

---

## ⚙️ Netlify Setup (one-time)

If you're setting this up fresh on a new Netlify account:

**1. Connect your repository**
- Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
- Connect your GitHub account and select this repository

**2. Configure the production site**
- Set **Branch to deploy** to `main`
- Build command: *(leave empty — this is a static site)*
- Publish directory: `.` *(or the folder containing `index.html`)*
- Click **Deploy site**
- Rename the site to `snake-feast-web` under **Site settings → General**

**3. Configure the staging site**
- Go back to **Add new site** → import the same repository again
- This time set **Branch to deploy** to `staging`
- Same build command and publish directory
- Rename this site to `snake-feast-staging`

That's it — every push to either branch auto-deploys from here on.

---

## 🎮 Features

- **Six food types** — normal, bonus, poison, magnet, freeze, and warp, each with unique effects and sounds
- **Three difficulty modes** — Easy, Medium, and Hard, with speed that increases as your snake grows
- **Power-up system** — ghost mode, magnet pull, board freeze, and warp tunneling
- **Combo scoring** — eat foods in quick succession to multiply your points up to ×8
- **Eleven achievements** — unlock badges for milestones like length, score, and power-up use
- **Custom snake color** — six color options to personalize your snake
- **Synthesized sound effects** — every action has a distinct Web Audio API sound, no audio files needed
- **Ambient menu music** — calm chord-based music in the menu, silence during gameplay
- **High score persistence** — best scores saved per difficulty mode via localStorage
- **Keyboard, WASD, and swipe** — full control support for desktop and touch

---

## 🕹 How to Play

| Action | Control |
|---|---|
| Move snake | Arrow keys or WASD |
| Move on mobile | Swipe in any direction |
| Pause / Resume | P, Escape, or ⏸ button |
| Mute / Unmute | 🔊 button in the HUD |
| Reset best score | Reset Best button (resets current mode only) |
| Return to menu | ← Main Menu on game over screen |

---

## 🍎 Food Types

| Color | Type | Effect |
|---|---|---|
| 🔵 Blue | Normal | +1 point |
| 🟡 Yellow star | Bonus | +5 points, activates ghost mode |
| 🟢 Green | Poison | −3 points, shrinks snake |
| 🩷 Pink | Magnet | Pulls nearby food toward the snake |
| 🩵 Cyan | Freeze | Slows food aging |
| 🟣 Purple | Warp | +3 points, activates ghost mode |

---

## 🛠 Tech Stack

- **Phaser 3** — game engine for canvas rendering and input
- **Web Audio API** — all sound effects and music synthesized in JavaScript, no audio files
- **localStorage** — scores and preferences persist across browser sessions
- **Netlify** — static hosting with automatic branch deploys
- **Vanilla JavaScript** — no frameworks, no build tools required

---

## 📣 Links

- [Play Now (Production)](https://snake-feast-web.netlify.app/)
- [Staging](https://snake-feast-staging.netlify.app/)
- [GitHub Repository](https://github.com/raghul-tech/snake-feast)
- [Report an Issue](https://github.com/raghul-tech/snake-feast/issues)

---

## 📄 License

GNU General Public License v3.0 — see [LICENSE](LICENSE) for details.