const T = 20;
const SPEEDS = { easy: 160, medium: 120, hard: 80 };
const FOOD_TYPES = {
  normal: { col: 0x38bdf8, ring: 0x0ea5e9, pts:  1, blink: false },
  bonus:  { col: 0xfbbf24, ring: 0xf59e0b, pts:  5, blink: true  },
  poison: { col: 0x84cc16, ring: 0x65a30d, pts: -3, blink: true  },
  magnet: { col: 0xf472b6, ring: 0xec4899, pts:  2, blink: true  },
  freeze: { col: 0x67e8f9, ring: 0x22d3ee, pts:  2, blink: true  },
  warp:   { col: 0xa78bfa, ring: 0x8b5cf6, pts:  3, blink: true  },
};
const ACHIEVEMENTS = [
  { id:'first',   ico:'🍽', name:'First Blood',     desc:'Ate your first food'       },
  { id:'sc10',    ico:'🔟', name:'Double Digits',   desc:'Scored 10 points'          },
  { id:'sc50',    ico:'⭐', name:'Fifty Feast',     desc:'Scored 50 points'          },
  { id:'sc100',   ico:'💯', name:'Century',         desc:'Scored 100 points'         },
  { id:'combo3',  ico:'🔥', name:'Hot Streak',      desc:'x3 combo'                  },
  { id:'ghost',   ico:'👻', name:'Phase Shift',     desc:'Bonus food → ghost mode'   },
  { id:'magnet',  ico:'🧲', name:'Magnetar',        desc:'Used magnet power'         },
  { id:'freeze',  ico:'❄',  name:'Cryogenics',      desc:'Froze the board'           },
  { id:'poison',  ico:'☠',  name:'Toxin Proof',     desc:'Survived poison'           },
  { id:'len15',   ico:'🐍', name:'Slitherer',       desc:'Snake length 15'           },
  { id:'len30',   ico:'🐉', name:'Great Serpent',   desc:'Snake length 30'           },
];

let G = {
  mode:      'easy',
  snakeCol:  0x00ff88,
  unlocked:  JSON.parse(localStorage.getItem('sfUnlocked') || '[]'),
  hs:        { easy: 0, medium: 0, hard: 0 },
};

ScoreManager.loadAll((scores) => {
  G.hs = scores;
  const el = document.getElementById('hv-hs');
  if (el) el.textContent = scores[G.mode] || 0;
});

function setMode(m, btn) {
  G.mode = m;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('on'));
  btn.classList.add('on');
  ScoreManager.loadAll((scores) => {
    G.hs = scores;
    const el = document.getElementById('hv-hs');
    if (el) el.textContent = scores[G.mode] || 0;
  });
  document.getElementById('hud-mode').textContent = m.toUpperCase();
}

function pickColor(btn) {
  G.snakeCol = parseInt(btn.dataset.hex, 16);
  document.querySelectorAll('.cdot').forEach(d => d.classList.remove('on'));
  btn.classList.add('on');
  if (window.GAME_SCENE) window.GAME_SCENE.snakeCol = G.snakeCol;
}

function _syncPauseBtn() {
  const btn     = document.getElementById('btn-pause');
  const running = window.GAME_SCENE && window.GAME_SCENE.running;
  btn.style.display = running ? '' : 'none';
}

function doStart() {
  document.getElementById('scr-start').classList.remove('visible');
  document.getElementById('scr-over').classList.remove('visible');
  SoundManager.startGame();
  if (window.GAME_SCENE) window.GAME_SCENE.restartGame();
  _syncPauseBtn();
}

function showStart() {
  document.getElementById('scr-over').classList.remove('visible');
  document.getElementById('scr-start').classList.add('visible');
  SoundManager.startMenu();
  if (window.GAME_SCENE) window.GAME_SCENE.stopGame();
  _syncPauseBtn();
}

function togglePause() {
  if (window.GAME_SCENE && window.GAME_SCENE.running) {
    const willPause = !window.GAME_SCENE.paused;
    window.GAME_SCENE.togglePause();
    if (willPause) SoundManager.playPause();
    else           SoundManager.playResume();
  }
}

function resetHS() {
  ScoreManager.reset(G.mode);
  document.getElementById('hv-hs').textContent = '0';
  document.getElementById('go-hs-val') && (document.getElementById('go-hs-val').textContent = '0');
}

function spawnScorePop(txt, hexColor, canvasPixelX, canvasPixelY) {
  const area  = document.getElementById('game-area');
  const mount = document.getElementById('phaser-mount');
  const rect  = mount.getBoundingClientRect();
  const aRect = area.getBoundingClientRect();

  const el = document.createElement('div');
  el.className   = 'spop';
  el.textContent = txt;
  el.style.color = '#' + hexColor.toString(16).padStart(6, '0');
  el.style.left  = (rect.left - aRect.left + canvasPixelX - 14) + 'px';
  el.style.top   = (rect.top  - aRect.top  + canvasPixelY - 10) + 'px';
  area.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

let _toastQ = [], _toastBusy = false;
function achievementToast(ico, name, desc) {
  _toastQ.push({ ico, name, desc });
  if (!_toastBusy) _nextToast();
}
function _nextToast() {
  if (!_toastQ.length) { _toastBusy = false; return; }
  _toastBusy = true;
  const { ico, name, desc } = _toastQ.shift();
  document.getElementById('t-ico').textContent  = ico;
  document.getElementById('t-name').textContent = name;
  document.getElementById('t-desc').textContent = desc;
  document.getElementById('toast').classList.add('show');
  setTimeout(() => {
    document.getElementById('toast').classList.remove('show');
    setTimeout(_nextToast, 380);
  }, 2800);
}

function unlockAch(id) {
  if (G.unlocked.includes(id)) return;
  G.unlocked.push(id);
  localStorage.setItem('sfUnlocked', JSON.stringify(G.unlocked));
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (a) achievementToast(a.ico, a.name, a.desc);
}

function updateHUD(score, mode) {
  document.getElementById('hv-score').textContent = score;
  const hs = G.hs[mode] || 0;
  document.getElementById('hv-hs').textContent    = hs;
  document.getElementById('hud-mode').textContent = mode.toUpperCase();
}

window.addEventListener('DOMContentLoaded', () => {
  const unlockAudio = () => {
    SoundManager.autoStart();
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('pointerdown', unlockAudio);
    document.removeEventListener('click', unlockAudio);
  };
  document.addEventListener('touchstart',  unlockAudio, { once: true });
  document.addEventListener('pointerdown', unlockAudio, { once: true });
  document.addEventListener('click',       unlockAudio, { once: true });

  SoundManager.autoStart();

  document.getElementById('btn-pause').style.display = 'none';

  document.getElementById('btn-mute').addEventListener('click', () => {
    const m = SoundManager.toggleMute();
    document.getElementById('btn-mute').textContent = m ? '🔇' : '🔊';
  });

  const area = document.getElementById('game-area');

  const game = new Phaser.Game({
    type:            Phaser.CANVAS,
    width:           area.clientWidth,
    height:          area.clientHeight,
    backgroundColor: 0x05050b,
    parent:          'phaser-mount',
    scene:           SnakeFeastScene,
    scale: {
      mode:   Phaser.Scale.RESIZE,
      width:  '100%',
      height: '100%',
    },
    fps:   { target: 60, forceSetTimeOut: true },
    render: {
      antialias:       true,
      powerPreference: 'high-performance',
    },
  });

  window.addEventListener('resize', () => {
    game.scale.resize(area.clientWidth, area.clientHeight);
    if (window.GAME_SCENE && window.GAME_SCENE.running) {
      window.GAME_SCENE.cols = Math.floor(area.clientWidth  / T);
      window.GAME_SCENE.rows = Math.floor(area.clientHeight / T);
    }
  });
});