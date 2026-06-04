const SoundManager = (() => {
  let ctx = null;
  let menuLoop = null;
  let gameLoop = null;
  let menuGain = null;
  let gameGain = null;
  let muted = true;

  function _init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  function _osc(type, freq, start, dur, gainVal, dest, fadeOut = true) {
    if (!ctx || muted) return;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gainVal, start);
    if (fadeOut) g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    g.connect(dest || ctx.destination);

    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    o.connect(g);
    o.start(start);
    o.stop(start + dur + 0.01);
    return o;
  }

  function _noise(start, dur, gainVal, filterFreq, dest) {
    if (!ctx || muted) return;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = filterFreq;
    filt.Q.value = 1.5;

    const g = ctx.createGain();
    g.gain.setValueAtTime(gainVal, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);

    src.connect(filt);
    filt.connect(g);
    g.connect(dest || ctx.destination);
    src.start(start);
    src.stop(start + dur);
  }

  function _makeMenuLoop() {
    if (!ctx || muted) return null;

    menuGain = ctx.createGain();
    menuGain.gain.setValueAtTime(0, ctx.currentTime);
    menuGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.5);
    menuGain.connect(ctx.destination);

    const notes = [130.81, 164.81, 196.00, 246.94]; 
    const interval = 4.0;
    let playing = true;

    function scheduleChord(startTime) {
      if (!playing || muted) return;
      notes.forEach((freq, i) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, startTime + i * 0.08);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0, startTime + i * 0.08);
        g.gain.linearRampToValueAtTime(0.12, startTime + i * 0.08 + 0.4);
        g.gain.linearRampToValueAtTime(0.06, startTime + i * 0.08 + 2.0);
        g.gain.linearRampToValueAtTime(0, startTime + interval - 0.1);

        o.connect(g);
        g.connect(menuGain);
        o.start(startTime + i * 0.08);
        o.stop(startTime + interval);
      });
      const sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(65.4, startTime);
      const subG = ctx.createGain();
      subG.gain.setValueAtTime(0.08, startTime);
      subG.gain.exponentialRampToValueAtTime(0.001, startTime + 2.0);
      sub.connect(subG);
      subG.connect(menuGain);
      sub.start(startTime);
      sub.stop(startTime + 2.0);

      if (playing) {
        setTimeout(() => scheduleChord(ctx.currentTime + 0.05), (interval - 0.2) * 1000);
      }
    }

    scheduleChord(ctx.currentTime + 0.1);

    return {
      stop: (fade = 1.0) => {
        playing = false;
        if (menuGain) {
          menuGain.gain.linearRampToValueAtTime(0, ctx.currentTime + fade);
        }
      }
    };
  }

  function _makeGameLoop() {
    if (!ctx || muted) return null;

    gameGain = ctx.createGain();
    gameGain.gain.setValueAtTime(0, ctx.currentTime);
    gameGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.0);
    gameGain.connect(ctx.destination);

    let playing = true;
    const bpm = 120;
    const beat = 60 / bpm;

    function scheduleBeat(startTime) {
      if (!playing || muted) return;

      const kick = ctx.createOscillator();
      kick.type = 'sine';
      kick.frequency.setValueAtTime(120, startTime);
      kick.frequency.exponentialRampToValueAtTime(40, startTime + 0.15);
      const kickG = ctx.createGain();
      kickG.gain.setValueAtTime(0.25, startTime);
      kickG.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
      kick.connect(kickG);
      kickG.connect(gameGain);
      kick.start(startTime);
      kick.stop(startTime + 0.25);

      _noise(startTime + beat * 0.5, 0.06, 0.06, 8000, gameGain);
      _noise(startTime + beat * 1.5, 0.06, 0.04, 8000, gameGain);
      const arpNotes = [261.63, 329.63, 392.00, 523.25];
      const noteIdx  = Math.floor(startTime / beat) % arpNotes.length;
      _osc('square', arpNotes[noteIdx] * 0.5, startTime + beat, beat * 0.3, 0.04, gameGain);

      if (playing) {
        setTimeout(() => scheduleBeat(ctx.currentTime + 0.02), (beat * 2 - 0.1) * 1000);
      }
    }

    scheduleBeat(ctx.currentTime + 0.1);

    return {
      stop: (fade = 0.5) => {
        playing = false;
        if (gameGain) {
          gameGain.gain.linearRampToValueAtTime(0, ctx.currentTime + fade);
        }
      }
    };
  }

  function playEat() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(400, t);
    o.frequency.exponentialRampToValueAtTime(800, t + 0.08);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.15);
  }

  function playBonus() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [523, 659, 784, 1047].forEach((freq, i) => {
      _osc('sine', freq, t + i * 0.07, 0.18, 0.25, null);
    });
    _osc('triangle', 2093, t + 0.1, 0.3, 0.1, null);
  }

  function playPoison() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(300, t);
    o.frequency.exponentialRampToValueAtTime(80, t + 0.35);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    const o2 = ctx.createOscillator();
    o2.type = 'sawtooth';
    o2.frequency.setValueAtTime(314, t);
    o2.frequency.exponentialRampToValueAtTime(84, t + 0.35);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.15, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    o.connect(g);   g.connect(ctx.destination);
    o2.connect(g2); g2.connect(ctx.destination);
    o.start(t);  o.stop(t + 0.45);
    o2.start(t); o2.stop(t + 0.45);
  }

  function playMagnet() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.setValueAtTime(150, t);
    o.frequency.linearRampToValueAtTime(300, t + 0.2);
    o.frequency.linearRampToValueAtTime(150, t + 0.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.5);
  }

  function playFreeze() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [1200, 1600, 2000, 2400, 1800].forEach((freq, i) => {
      _osc('sine', freq, t + i * 0.05, 0.25, 0.15, null);
    });
    _noise(t, 0.15, 0.08, 3000, null);
  }

  function playWarp() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(200, t);
    o.frequency.exponentialRampToValueAtTime(800, t + 0.15);
    o.frequency.exponentialRampToValueAtTime(200, t + 0.35);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.45);
    _osc('triangle', 400, t + 0.05, 0.3, 0.12, null);
  }

  function playCombo(multiplier) {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const base = 440 * Math.pow(1.2, multiplier - 2);
    _osc('sine', base,        t,        0.12, 0.3, null);
    _osc('sine', base * 1.25, t + 0.05, 0.10, 0.2, null);
    _osc('sine', base * 1.5,  t + 0.10, 0.10, 0.15, null);
  }

  function playWallHit() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _noise(t, 0.08, 0.4, 200, null);
    _osc('sine', 80, t, 0.2, 0.5, null);
  }

  function playSelfHit() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(440, t);
    o.frequency.exponentialRampToValueAtTime(55, t + 0.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.5);
    _noise(t + 0.05, 0.15, 0.2, 500, null);
  }

  function playGameOver() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [
      [220.00, 0.00],
      [185.00, 0.12],
      [155.56, 0.24],
      [130.81, 0.38],
    ].forEach(([freq, delay]) => {
      _osc('sine',     freq,       t + delay, 0.7, 0.22, null);
      _osc('triangle', freq * 2,   t + delay, 0.5, 0.08, null);
    });
    _noise(t + 0.3, 0.5, 0.15, 120, null);
  }

  function playPause() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _osc('sine', 600, t,        0.08, 0.2, null);
    _osc('sine', 450, t + 0.09, 0.08, 0.2, null);
  }

  function playResume() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _osc('sine', 450, t,        0.08, 0.2, null);
    _osc('sine', 600, t + 0.09, 0.08, 0.2, null);
  }

  function startMenu() {
    _init();
    resume();
    if (gameLoop)  { gameLoop.stop(0.4);  gameLoop  = null; }
    if (menuLoop)  { menuLoop.stop(0.1);  menuLoop  = null; }
    menuLoop = _makeMenuLoop();
  }

  function startGame() {
    _init();
    resume();
    if (menuLoop) { menuLoop.stop(0.6); menuLoop = null; }
    if (gameLoop) { gameLoop.stop(0.1); gameLoop = null; }
    gameLoop = _makeGameLoop();
  }

  function stopAll(fade = 0.5) {
    if (menuLoop) { menuLoop.stop(fade); menuLoop = null; }
    if (gameLoop) { gameLoop.stop(fade); gameLoop = null; }
  }

  function toggleMute() {
    muted = !muted;
    if (muted) stopAll(0.2);
    return muted;
  }

  function isMuted() { return muted; }

  return {
    startMenu, startGame, stopAll, toggleMute, isMuted, resume,
    playEat, playBonus, playPoison, playMagnet,
    playFreeze, playWarp, playCombo, playWallHit,
    playSelfHit, playGameOver, playPause, playResume,
  };
})();