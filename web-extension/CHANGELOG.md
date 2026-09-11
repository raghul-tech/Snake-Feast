# Changelog — Browser Extension

Available on [Chrome Web Store](https://chromewebstore.google.com/detail/snake-feast/hfmacflbnmdcjlilbnhflplpaaocaohp), [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/snake-feast/jlibkeadeilgolekhdoefckmknpmaiik) and [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/snake-feast/).

---

## [v2.0.0] - 2026-09-11

### 🎉 First release on Chrome, Edge and Firefox

### Added
- Published on Chrome Web Store (Manifest V3)
- Published on Microsoft Edge Add-ons (Manifest V3)
- Published on Firefox Add-ons (Manifest V2)
- Game accessible from browser toolbar — click the extension icon from any tab
- Single shared `source/` folder — one codebase for all three browsers
- Three browser-specific `build-*/` folders — each contains only its `manifest.json`
- Build process: copy `source/*` into build folder → zip contents → submit to store
- Service worker / background script (`sw.js`) for extension lifecycle
- Manifest V3 for Chrome and Edge — uses `action`, `background.service_worker`, object CSP
- Manifest V2 for Firefox — uses `browser_action`, `background.scripts`, string CSP
- 6 power-up food types — Normal, Bonus, Poison, Magnet, Freeze, Warp
- Combo multiplier up to ×8
- 11 unlockable achievements with toast notifications
- 3 difficulty modes — Easy, Medium, Hard
- 6 snake colour options
- Smooth 60fps lerp interpolation on snake movement
- Procedural Web Audio sound engine — all SFX and menu music, zero audio files
- Ambient chord-progression menu music
- Keyboard controls — Arrow keys, WASD and swipe
- Power-up status badges in-game
- Score pop animations at food position
- Phaser 3 bundled locally — no CDN, works offline
- Score persistence via localStorage

### Manifest differences by browser

| Feature | Chrome / Edge (MV3) | Firefox (MV2) |
|---------|---------------------|---------------|
| Manifest version | 3 | 2 |
| Popup key | `action` | `browser_action` |
| Background | `background.service_worker` | `background.scripts` |
| CSP format | Object `{ extension_pages: "..." }` | Plain string |
| web_accessible_resources | Array of objects with `matches` | Flat array of strings |

---

[Full Release History](https://github.com/raghul-tech/Snake-Feast/releases)