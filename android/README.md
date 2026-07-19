# 🐍 Snake Feast

A fast-paced, feature-rich snake game built with **Phaser 3** and packaged as a native Android app using **Capacitor**. Play it on the web, install it on Android, or run it on desktop.

---

## 🎮 About the Game

Snake Feast is a modern take on the classic snake game with power-ups, combos, achievements, and procedurally generated Web Audio sound effects — no audio files needed.

### Food types

| Food | Color | Effect |
|------|-------|--------|
| Normal | 🔵 Blue | +1 point |
| Bonus | 🟡 Yellow | +5 points + ghost mode |
| Poison | 🟢 Green | −3 points, shrinks snake |
| Magnet | 🩷 Pink | Pulls nearby food toward you |
| Freeze | 🩵 Cyan | Slows tick speed temporarily |
| Warp | 🟣 Purple | +3 points + brief ghost mode |

### Controls

| Platform | Control |
|----------|---------|
| Mobile (Android) | Swipe anywhere on screen |
| Keyboard | Arrow keys or WASD |
| Pause | P or ESC |

### Difficulty modes
- **Easy** — 160ms tick
- **Medium** — 120ms tick  
- **Hard** — 80ms tick (speed increases as snake grows)

### Achievements
11 unlockable achievements tracked via `localStorage` — First Blood, Double Digits, Century, Hot Streak, Phase Shift, Magnetar, Cryogenics, Toxin Proof, Slitherer, Great Serpent, Combo x3.

---

## 📁 Project Structure

```
Snake-Feast/
├── web/                        ← Live on Netlify (web version)
├── app/                        ← Desktop app (Qt)
└── android/
    ├── game/                   ← Game source files (HTML/CSS/JS)
    │   ├── index.html
    │   ├── css/
    │   │   ├── style.css
    │   │   └── googlefonts.css
    │   ├── js/
    │   │   ├── phaser.min.js
    │   │   ├── sound.js
    │   │   ├── score.js
    │   │   ├── script.js
    │   │   └── scene.js
    │   └── icon/
    ├── android/                ← Auto-generated Capacitor Android project
    ├── capacitor.config.json
    └── package.json
```

---

## 🛠 Prerequisites

Install these before anything else:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | ≥ 22.0.0 | https://nodejs.org (pick LTS) |
| Android Studio | Latest | https://developer.android.com/studio |
| Java (JDK) | Via Android Studio embedded JDK | Bundled with Android Studio |

After installing Android Studio, open it once and complete the **Standard setup wizard** — this installs the Android SDK automatically.

---

## 🚀 Running Locally (Web)

No build step needed. Just open `android/game/index.html` in any browser, or serve it:

```bash
cd android/game
npx serve .
```

---

## 📱 Running on Android (Development)

### 1. Install dependencies

```bash
cd android
npm install
```

### 2. Sync game files into the Android project

```bash
npx cap sync
```

> Run this every time you change files in `android/game/`

### 3. Open in Android Studio

```bash
npx cap open android
```

### 4. Fix Gradle JDK (first time only)

If Android Studio shows a JDK error:
- Go to **File → Settings → Build, Execution, Deployment → Build Tools → Gradle**
- Set **Gradle JDK** to **Embedded JDK**
- Click OK — Gradle will re-sync

### 5. Fix SDK path (if needed)

If you see `SDK location not found`:
- Go to **File → Settings → Appearance & Behavior → System Settings → Android SDK**
- Note the **Android SDK Location** path
- Create the file `android/android/local.properties`:
  ```
  sdk.dir=C\:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
  ```

### 6. Run on a real phone (recommended)

**On your Android phone:**
1. Settings → About Phone → tap **Build Number** 7 times
2. Settings → Additional Settings → **Developer Options** → enable **USB Debugging**
3. Plug phone into PC via USB
4. On phone: tap **Allow** when asked to trust the PC
5. Swipe down notification bar → tap USB notification → select **File Transfer**

**In Android Studio:**
- Your phone appears in the device dropdown at the top
- Press the **▶ green Run button**

### 7. Run on Emulator (no phone needed)

1. Tools → AVD Manager → Create Virtual Device
2. Pick **Pixel 6** → API 35 → Finish
3. Select the emulator in the dropdown → press ▶

---

## 📦 Building the Android APK / AAB for Release

### Step 1 — Set screen orientation in AndroidManifest.xml

Location: `android/android/app/src/main/AndroidManifest.xml`

The activity should have:
```xml
android:screenOrientation="sensorLandscape"
android:resizeableActivity="true"
```

### Step 2 — Add your app icon

1. In Android Studio → right-click `app` → **New → Image Asset**
2. Foreground layer: upload your logo PNG
3. Background layer: pick **Color** → enter `#00ffaa` (or your preferred color)
4. Click **Next → Finish**

### Step 3 — Sync latest game files

```bash
cd android
npx cap sync
```

### Step 4 — Generate a signed AAB

> The Play Store requires an **AAB (Android App Bundle)**, not a plain APK.

1. In Android Studio → **Build → Generate Signed Bundle / APK**
2. Choose **Android App Bundle** → click **Next**
3. **Create new keystore** (first time only):
   - Save location: somewhere safe outside the project, e.g. `C:\keys\snakefeast.jks`
   - Set a strong password
   - Fill in your name and country code (e.g. `IN`)
   - Click **OK**
4. Enter your keystore password → select **release** build variant → click **Finish**
5. Android Studio builds the `.aab` file
6. Output location shown in the event log — usually:
   ```
   android/android/app/release/app-release.aab
   ```

> ⚠️ **Keep your `.jks` keystore file safe.** You need it for every future update. Losing it means you can never update your Play Store app.

### Step 5 — Upload to Google Play Console

1. Go to [play.google.com/console](https://play.google.com/console)
2. Select your app → **Production → Releases → Create new release**
3. Upload the `.aab` file
4. Add release notes (e.g. "Initial release")
5. Click **Review release → Start rollout to Production**

Google reviews new apps in **1–3 business days**.

---

## 🔧 Common Issues

| Error | Fix |
|-------|-----|
| `NodeJS >=22.0.0 required` | Download LTS from nodejs.org, restart terminal |
| `SDK location not found` | Create `local.properties` with `sdk.dir=` path |
| `Invalid Gradle JDK` | File → Settings → Gradle → set Embedded JDK |
| `Unable to find adb` | Add `SDK/platform-tools` to system PATH |
| Phone not detected | Try different USB cable; enable File Transfer mode |
| `INSTALL_FAILED` | Developer Options → enable **Install via USB** |
| App installs but crashes | Run `adb logcat` in terminal, paste error |
| Sound not playing | Audio unlocks on first touch — tap the screen first |

---

## 🗂 Key Files Reference

| File | Purpose |
|------|---------|
| `game/js/scene.js` | Phaser game scene — snake logic, rendering, smooth lerp movement |
| `game/js/script.js` | UI logic — menus, HUD, achievements, swipe/dpad input |
| `game/js/sound.js` | Web Audio API sound engine — all SFX and menu music |
| `game/js/score.js` | Score persistence via localStorage |
| `game/css/style.css` | Responsive styles — portrait, landscape phone, tablet, desktop |
| `capacitor.config.json` | Capacitor configuration — app ID, web directory |
| `android/android/app/src/main/AndroidManifest.xml` | Android permissions, orientation, activity config |

---

## 📜 Tech Stack

- **Phaser 3** — game rendering and input
- **Capacitor** — wraps web app as native Android APK
- **Web Audio API** — procedural sound, no audio files
- **localStorage** — score and achievement persistence
- **Pure HTML/CSS/JS** — no framework, no bundler needed

---

## 👤 Author

**Raghul** — [github.com/raghul-tech](https://github.com/raghul-tech)

App ID: `io.github.raghultech.snakefeast`