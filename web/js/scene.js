
class SnakeFeastScene extends Phaser.Scene {

  constructor() { super({ key: 'SnakeFeast' }); }

  create() {
    window.GAME_SCENE = this;
    this.gfx = this.add.graphics();
    this.blinkOn = true;
    this.time.addEvent({
      delay: 500,
      callback: () => { this.blinkOn = !this.blinkOn; },
      loop: true
    });
    
    this.running   = false;
    this.paused    = false;
    this.snake     = []; 
    this.dir       = { x:1, y:0 };
    this.nextDir   = { x:1, y:0 };
    this.foods     = [];
    this.score     = 0;
    this.combo     = 1;
    this.comboTick = 0;
    this.ghostTick = 0;
    this.magTick   = 0;
    this.frzTick   = 0;
    this.snakeCol  = G.snakeCol;
    this.tickEvt   = null;
    this.deathMsg  = '';
    const kb = this.input.keyboard;
    const turn = (dx, dy) => {
      if (dx !== 0 && this.dir.x !== 0) return;
      if (dy !== 0 && this.dir.y !== 0) return;
      this.nextDir = { x: dx, y: dy };
    };
    kb.on('keydown-LEFT',  () => turn(-1,  0));
    kb.on('keydown-RIGHT', () => turn( 1,  0));
    kb.on('keydown-UP',    () => turn( 0, -1));
    kb.on('keydown-DOWN',  () => turn( 0,  1));
    kb.on('keydown-A',     () => turn(-1,  0));
    kb.on('keydown-D',     () => turn( 1,  0));
    kb.on('keydown-W',     () => turn( 0, -1));
    kb.on('keydown-S',     () => turn( 0,  1));
    kb.on('keydown-P',     () => this.togglePause());
    kb.on('keydown-ESC',   () => this.togglePause());
    kb.on('keydown-ENTER', () => { if (!this.running) doStart(); });
    let swipeX = 0, swipeY = 0;
    this.input.on('pointerdown', p => { swipeX = p.x; swipeY = p.y; });
    this.input.on('pointerup', p => {
      if (!this.running || this.paused) return;
      const dx = p.x - swipeX, dy = p.y - swipeY, min = 25;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > min) turn(dx > 0 ? 1 : -1, 0);
      } else {
        if (Math.abs(dy) > min) turn(0, dy > 0 ? 1 : -1);
      }
    });
  }

  restartGame() {
    if (this.tickEvt) { this.tickEvt.remove(); this.tickEvt = null; }
    this.cols = Math.floor(this.scale.width  / T);
    this.rows = Math.floor(this.scale.height / T);
    this.score     = 0;
    this.combo     = 1;
    this.comboTick = 0;
    this.ghostTick = 0;
    this.magTick   = 0;
    this.frzTick   = 0;
    this.deathMsg  = '';
    this.dir       = { x:1, y:0 };
    this.nextDir   = { x:1, y:0 };
    this.foods     = [];
    this.running   = true;
    this.paused    = false;
    this.snakeCol  = G.snakeCol;

    document.getElementById('btn-pause').textContent = '⏸';
    this.snake = [];
    const sy = Math.floor(this.rows / 2);
    for (let i = 5; i >= 0; i--) this.snake.push({ x: i, y: sy });
    this._spawnFoods();
    this._startTick();
    updateHUD(0, G.mode);
  }

  stopGame() {
    this.running = false;
    if (this.tickEvt) { this.tickEvt.remove(); this.tickEvt = null; }
    this.gfx.clear();
  }

  togglePause() {
    if (!this.running) return;
    this.paused = !this.paused;
    document.getElementById('btn-pause').textContent = this.paused ? '▶' : '⏸';
  }
  _startTick() {
    if (this.tickEvt) this.tickEvt.remove();
    this.tickEvt = this.time.addEvent({
      delay: this._speed(), callback: this._tick, callbackScope: this, loop: true
    });
  }

  _speed() {
    const base = SPEEDS[G.mode];
    return Math.max(50, base - Math.floor(this.snake.length / 5) * 4);
  }

  _restartTick() {
    if (!this.tickEvt) return;
    this.tickEvt.reset({
      delay: this._speed(), callback: this._tick, callbackScope: this, loop: true
    });
  }

  _tick() {
    if (!this.running || this.paused) return;
    this.dir = { ...this.nextDir };
    const head = this.snake[0];
    const nx   = head.x + this.dir.x;
    const ny   = head.y + this.dir.y;
    if (nx < 0 || nx >= this.cols || ny < 0 || ny >= this.rows) {
      this.deathMsg = 'hit the wall'; this._die(); return;
    }
    if (this.ghostTick <= 0 && this.snake.some(s => s.x === nx && s.y === ny)) {
      this.deathMsg = 'ate yourself'; this._die(); return;
    }
    if (this.ghostTick <= 0 && this.snake.some(s => s.x === nx && s.y === ny)) {
      this.deathMsg = 'ate yourself'; this._die(); return;
    }
    let ateIdx = this.foods.findIndex(f => f.x === nx && f.y === ny);
    let ate    = ateIdx >= 0 ? this.foods.splice(ateIdx, 1)[0] : null;
    for (let i = this.snake.length - 1; i > 0; i--) {
      this.snake[i].x = this.snake[i-1].x;
      this.snake[i].y = this.snake[i-1].y;
    }
    this.snake[0].x = nx;
    this.snake[0].y = ny;

    if (ate) {
      this._eatFood(ate, nx, ny);
    }
    if (this.magTick > 0) {
      this.foods.forEach(f => {
        const d = Math.abs(f.x - nx) + Math.abs(f.y - ny);
        if (d <= 4) {
          if (f.x > nx && !this._onSnake(f.x-1, f.y)) f.x--;
          else if (f.x < nx && !this._onSnake(f.x+1, f.y)) f.x++;
          if (f.y > ny && !this._onSnake(f.x, f.y-1)) f.y--;
          else if (f.y < ny && !this._onSnake(f.x, f.y+1)) f.y++;
        }
      });
    }
    if (this.ghostTick > 0) this.ghostTick--;
    if (this.magTick   > 0) this.magTick--;
    if (this.frzTick   > 0) this.frzTick--;
    if (this.comboTick > 0) { this.comboTick--; if (this.comboTick === 0) this.combo = 1; }
    this.foods.forEach(f => f.age++);
    this.foods = this.foods.filter(f => f.age < 280);
    this._spawnFoods();
    this._restartTick();

    if (this.score >= 10)  unlockAch('sc10');
    if (this.score >= 50)  unlockAch('sc50');
    if (this.score >= 100) unlockAch('sc100');
    if (this.snake.length >= 15) unlockAch('len15');
    if (this.snake.length >= 30) unlockAch('len30');
    if (this.combo  >= 3)  unlockAch('combo3');
    updateHUD(this.score, G.mode);
  }
  _eatFood(food, nx, ny) {
    const def   = FOOD_TYPES[food.type];
    const px    = nx * T + T / 2; 
    const py    = ny * T + T / 2;

    if (food.type === 'poison') {
      for (let i = 0; i < 3 && this.snake.length > 2; i++) this.snake.pop();
      if (this.snake.length <= 1) { this.deathMsg = 'poison was fatal'; this._die(); return; }
      this.score = Math.max(0, this.score - 3);
      spawnScorePop('-3', 0x84cc16, px, py);
      unlockAch('poison');
      this.cameras.main.shake(120, 0.01);
    } else {
      const last = this.snake[this.snake.length - 1];
      this.snake.push({ x: last.x, y: last.y });
    }
    if (food.type === 'bonus')  { this.ghostTick = 90;  unlockAch('ghost');  }
    if (food.type === 'magnet') { this.magTick   = 180; unlockAch('magnet'); }
    if (food.type === 'freeze') { this.frzTick   = 110; unlockAch('freeze'); }
    if (food.type === 'warp')   { this.ghostTick = 60; }

    if (def.pts > 0) {
      this.combo     = this.comboTick > 0 ? Math.min(this.combo + 1, 8) : 1;
      this.comboTick = 180;
      const earned   = def.pts * this.combo;
      this.score    += earned;

      const popCol = this.combo > 2 ? 0xf59e0b : def.col;
      const label  = (this.combo > 1 ? '×' + this.combo + ' ' : '') + '+' + earned;
      spawnScorePop(label, popCol, px, py);
    }

    if (['bonus','warp','magnet','freeze'].includes(food.type)) {
      this.cameras.main.shake(70, 0.005);
    }

    unlockAch('first');
     if (this.score > G.hs[G.mode]) {
    G.hs[G.mode] = this.score;
    ScoreManager.saveOne(G.mode, this.score);
  }
  }

  _spawnFoods() {
    while (this.foods.length < 3) {
      const r = Math.random();
      let type;
      if      (r < 0.44) type = 'normal';
      else if (r < 0.58) type = 'bonus';
      else if (r < 0.70) type = 'poison';
      else if (r < 0.80) type = 'magnet';
      else if (r < 0.89) type = 'freeze';
      else                type = 'warp';
      let fx, fy, tries = 0;
      do {
        fx = Math.floor(Math.random() * this.cols);
        fy = Math.floor(Math.random() * this.rows);
        tries++;
      } while (tries < 400 && (
        this._onSnake(fx, fy) ||
        this.foods.some(f => f.x === fx && f.y === fy)
      ));

      this.foods.push({ x: fx, y: fy, type, age: 0 });
    }
  }
  _die() {
    if (!this.running) return;
    this.running = false;
    if (this.tickEvt) { this.tickEvt.remove(); this.tickEvt = null; }
    if (this.score > G.hs[G.mode]) {
    G.hs[G.mode] = this.score;
    ScoreManager.saveOne(G.mode, this.score);
  }

    this.cameras.main.shake(450, 0.022);
    this.cameras.main.flash(280, 255, 40, 70, true);

    document.getElementById('go-score').textContent  = this.score;
    document.getElementById('go-hs-val').textContent  = G.hs[G.mode];
    document.getElementById('go-cause').textContent   = this.deathMsg ? 'You ' + this.deathMsg + '…' : '';

    setTimeout(() => document.getElementById('scr-over').classList.add('visible'), 720);
  }

  _onSnake(x, y) { return this.snake.some(s => s.x === x && s.y === y); }
  update() {
    const g    = this.gfx;
    const cols = this.cols || Math.floor(this.scale.width  / T);
    const rows = this.rows || Math.floor(this.scale.height / T);
    const W    = cols * T;
    const H    = rows * T;
    g.clear();
    g.fillStyle(0x05050b, 1);
    g.fillRect(0, 0, W, H);
    g.fillStyle(0x00ffaa, 0.04);
    for (let c = 0; c <= cols; c++) {
      for (let r = 0; r <= rows; r++) {
        g.fillRect(c * T - 0.5, r * T - 0.5, 1, 1);
      }
    }
    if (!this.running && !this.paused && this.snake.length === 0) return;
    this.foods.forEach(f => {
      const def = FOOD_TYPES[f.type];
      const cx  = f.x * T + T / 2;
      const cy  = f.y * T + T / 2;
      const fade = f.age > 230 ? Math.max(0, 1 - (f.age - 230) / 50) : 1;

      if (f.type === 'bonus') {
        this._drawStar(cx, cy, T/2 - 3, T/4, 5, def.col, fade);
        if (this.blinkOn) {
          g.lineStyle(1.5, def.ring, 0.55 * fade);
          g.strokeCircle(cx, cy, T/2 + 2);
        }

      } else if (f.type === 'warp') {
        g.lineStyle(2, def.col, fade);
        g.strokeCircle(cx, cy, T/2 - 3);
        g.lineStyle(1, def.ring, 0.5 * fade);
        g.strokeCircle(cx, cy, T/2 - 6);
        g.fillStyle(def.col, fade);
        g.fillCircle(cx, cy, 3);

      } else {
        const pulsing = def.blink;
        const r = pulsing ? (this.blinkOn ? T/2 - 3 : T/2 - 5) : T/2 - 4;
        g.fillStyle(def.col, fade);
        g.fillCircle(cx, cy, r);
        if (pulsing) {
          g.lineStyle(1, def.ring, 0.45 * fade);
          g.strokeCircle(cx, cy, r + 3);
        }
      }
    });
    if (this.snake && this.snake.length > 0) {
      const col     = this.snakeCol;
      const isGhost = this.ghostTick > 0;
      for (let i = this.snake.length - 1; i >= 0; i--) {
        const seg  = this.snake[i];
        const cx   = seg.x * T + T / 2;
        const cy   = seg.y * T + T / 2;
        const isHd = (i === 0);
        const alpha = isGhost
          ? 0.35
          : Math.max(0.25, 1 - i * 0.028);
        if (isHd) {
          g.fillStyle(col, 0.1);
          g.fillCircle(cx, cy, T * 1.1);
          g.fillStyle(col, 0.05);
          g.fillCircle(cx, cy, T * 1.5);
        }
        const r = isHd ? T/2 - 1 : T/2 - 3;
        g.fillStyle(col, alpha);
        g.fillCircle(cx, cy, r);
        if (isGhost && isHd) {
          g.lineStyle(1.5, 0xfbbf24, this.blinkOn ? 0.9 : 0.3);
          g.strokeCircle(cx, cy, T/2 + 5);
        }
        if (isHd) {
          const d  = this.dir;
          const fwd = 4;  
          const sep = 3;  
          const ex = d.y !== 0 ? sep : 0;
          const ey = d.x !== 0 ? sep : 0;
          const fx = d.x * fwd;
          const fy = d.y * fwd;
          g.fillStyle(0x000000, 1);
          g.fillCircle(cx + fx - ex, cy + fy - ey, 2.5);
          g.fillCircle(cx + fx + ex, cy + fy + ey, 2.5);
          g.fillStyle(0xffffff, 0.75);
          g.fillCircle(cx + fx - ex + 0.8, cy + fy - ey - 0.8, 0.9);
          g.fillCircle(cx + fx + ex + 0.8, cy + fy + ey - 0.8, 0.9);
        }
      }
      const h = this.snake[0];
      g.lineStyle(1, col, 0.18);
      g.strokeRect(h.x * T, h.y * T, T, T);
    }
    if (this.running) {
      let badge = null;
      if (this.ghostTick > 0) badge = { txt: '👻 GHOST',  col: 0xfbbf24 };
      if (this.magTick   > 0) badge = { txt: '🧲 MAGNET', col: 0xf472b6 };
      if (this.frzTick   > 0) badge = { txt: '❄ FREEZE',  col: 0x67e8f9 };
      if (this.combo > 1)     badge = { txt: '×' + this.combo + ' COMBO', col: 0xf59e0b };

      if (badge) {
        g.fillStyle(0x000000, 0.7);
        g.fillRoundedRect(8, H - 30, 120, 22, 6);
        g.lineStyle(1, badge.col, 0.7);
        g.strokeRoundedRect(8, H - 30, 120, 22, 6);
      }
    }

    if (this.paused) {
      g.fillStyle(0x000000, 0.52);
      g.fillRect(0, 0, W, H);
      if (!this._pauseTxt) {
        this._pauseTxt = this.add.text(W/2, H/2, 'PAUSED', {
          fontFamily: 'Orbitron',
          fontSize:   '32px',
          fontStyle:  '900',
          color:      '#ffffff',
          stroke:     '#00ffaa',
          strokeThickness: 3,
        }).setOrigin(0.5).setDepth(10);
      }
      this._pauseTxt.setVisible(true);
    } else if (this._pauseTxt) {
      this._pauseTxt.setVisible(false);
    }
  }

  _drawStar(cx, cy, outerR, innerR, points, col, alpha) {
    const verts = [];
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i * Math.PI / points) - Math.PI / 2;
      verts.push(new Phaser.Math.Vector2(
        cx + Math.cos(a) * r,
        cy + Math.sin(a) * r
      ));
    }
    this.gfx.fillStyle(col, alpha);
    this.gfx.fillPoints(verts, true);
  }
}