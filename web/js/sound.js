const SoundManager = (() => {
  let ctx        = null;
  let masterGain = null;
  let compressor = null;
  let menuLoop   = null;
  let muted      = false;
  let _screen    = 'menu';
  let _started   = false;
  let _loopGen   = 0; 

  function _init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-10, ctx.currentTime);
    compressor.knee.setValueAtTime(6,        ctx.currentTime);
    compressor.ratio.setValueAtTime(3,       ctx.currentTime);
    compressor.attack.setValueAtTime(0.003,  ctx.currentTime);
    compressor.release.setValueAtTime(0.25,  ctx.currentTime);
    compressor.connect(ctx.destination);
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.8, ctx.currentTime);
    masterGain.connect(compressor);
  }

  function _destroyCtx() {
    _loopGen++;
    if (menuLoop) { try { menuLoop.stop(0); } catch(e){} menuLoop = null; }
    if (ctx) {
      try { ctx.close(); } catch(e) {}
      ctx        = null;
      masterGain = null;
      compressor = null;
    }
  }

  function _dest() { return masterGain || ctx.destination; }

  function _osc(type, freq, start, dur, vol, dest) {
    if (!ctx || muted) return;
    const d = dest || _dest();
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    g.connect(d);
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    o.connect(g);
    o.start(start);
    o.stop(start + dur + 0.02);
  }

  function _oscSlide(type, f0, f1, start, dur, vol, dest) {
    if (!ctx || muted) return;
    const d = dest || _dest();
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    g.connect(d);
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, start);
    o.frequency.exponentialRampToValueAtTime(f1, start + dur);
    o.connect(g);
    o.start(start);
    o.stop(start + dur + 0.02);
  }

  function _noise(start, dur, vol, filterFreq, filterType, dest) {
    if (!ctx || muted) return;
    const d       = dest || _dest();
    const samples = Math.ceil(ctx.sampleRate * dur);
    const buf     = ctx.createBuffer(1, samples, ctx.sampleRate);
    const data    = buf.getChannelData(0);
    for (let i = 0; i < samples; i++) data[i] = Math.random() * 2 - 1;
    const src  = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type            = filterType || 'bandpass';
    filt.frequency.value = filterFreq;
    filt.Q.value         = 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    g.connect(d);
    src.connect(filt);
    filt.connect(g);
    src.start(start);
    src.stop(start + dur + 0.02);
  }

  function _makeMenuLoop() {
    if (!ctx || muted) return null;
    const myGen = _loopGen;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 2.0);
    gain.connect(_dest());

    const filt = ctx.createBiquadFilter();
    filt.type            = 'lowpass';
    filt.frequency.value = 900;
    filt.Q.value         = 0.5;
    filt.connect(gain);

    let playing   = true;
    const BAR     = 6.0; 
    const chords  = [
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
      [110.00, 130.81, 164.81, 220.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 392.00], // G7
    ];
    let chordIdx = 0;
    function scheduleBar(startTime) {
      if (!playing || muted || _loopGen !== myGen || !ctx) return;
      const notes = chords[chordIdx % chords.length];
      chordIdx++;

      notes.forEach((freq, i) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, startTime + i * 0.12);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0,    startTime + i * 0.12);
        g.gain.linearRampToValueAtTime(0.22, startTime + i * 0.12 + 0.8);
        g.gain.linearRampToValueAtTime(0.14, startTime + i * 0.12 + 3.0);
        g.gain.linearRampToValueAtTime(0,    startTime + BAR - 0.3);
        o.connect(g); g.connect(filt);
        o.start(startTime + i * 0.12);
        o.stop(startTime + BAR);

        const o2 = ctx.createOscillator();
        o2.type = 'triangle';
        o2.frequency.setValueAtTime(freq * 2, startTime + i * 0.12 + 0.2);
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0,    startTime + i * 0.12 + 0.2);
        g2.gain.linearRampToValueAtTime(0.07, startTime + i * 0.12 + 1.0);
        g2.gain.linearRampToValueAtTime(0,    startTime + BAR - 0.5);
        o2.connect(g2); g2.connect(filt);
        o2.start(startTime + i * 0.12 + 0.2);
        o2.stop(startTime + BAR);
      });

      const sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(notes[0] * 0.5, startTime);
      const subG = ctx.createGain();
      subG.gain.setValueAtTime(0.35, startTime + 0.1);
      subG.gain.linearRampToValueAtTime(0.15, startTime + 2.0);
      subG.gain.linearRampToValueAtTime(0,    startTime + BAR - 0.4);
      sub.connect(subG); subG.connect(filt);
      sub.start(startTime); sub.stop(startTime + BAR);

      if (playing) {
        setTimeout(() => scheduleBar(ctx ? ctx.currentTime + 0.08 : 0),
          (BAR - 0.3) * 1000);
      }
    }

    scheduleBar(ctx.currentTime + 0.15);

    return {
      stop(fade = 0.3) {
        playing = false;
        try {
          gain.gain.cancelScheduledValues(ctx ? ctx.currentTime : 0);
          if (ctx) {
            gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + fade);
          }
        } catch(e) {}
      }
    };
  }

  function playEat() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _noise(t, 0.04, 0.7, 1800, 'bandpass', null);
    _oscSlide('sine', 440, 880, t, 0.12, 0.6, null);
    _osc('sine', 1320, t + 0.06, 0.08, 0.5, null);
  }

  function playBonus() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [523, 659, 784, 1047, 1318].forEach((f, i) => {
      _osc('sine',     f,       t + i * 0.055, 0.22, 0.6, null);
      _osc('triangle', f * 1.5, t + i * 0.055, 0.15, 0.25, null);
    });
    _noise(t, 0.04, 0.8, 5000, 'bandpass', null);
  }

  function playPoison() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('sine',     400, 180, t,       0.35, 0.7, null);
    _oscSlide('sine',     420, 170, t + 0.03, 0.35, 0.5, null);
    _noise(t,       0.10, 0.55, 500,  'bandpass', null);
    _noise(t + 0.12, 0.15, 0.4, 300, 'lowpass',  null);
    _oscSlide('sawtooth', 160, 80, t + 0.1, 0.3, 0.45, null);
  }

  function playPoisonDeath() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('sawtooth', 340, 40,  t,        0.55, 0.9, null);
    _oscSlide('sawtooth', 320, 35,  t + 0.04, 0.55, 0.7, null);
    _noise(t,        0.15, 0.8,  600, 'bandpass', null);
    _noise(t + 0.15, 0.3,  0.55, 200, 'lowpass',  null);
    _oscSlide('sine', 800, 60, t + 0.2, 0.6, 0.5, null);
  }

  function playMagnet() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('square', 140, 420, t,       0.22, 0.6, null);
    _oscSlide('square', 420, 140, t + 0.22, 0.22, 0.5, null);
    _noise(t, 0.06, 0.45, 6000, 'highpass', null);
  }

  function playFreeze() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [1400, 1800, 2200, 2800, 3400, 2000].forEach((f, i) => {
      _osc('sine',     f,       t + i * 0.04, 0.20, 0.55, null);
      _osc('triangle', f * 0.5, t + i * 0.04, 0.15, 0.3,  null);
    });
    _noise(t,       0.06, 0.65, 5000, 'highpass', null);
    _noise(t + 0.1, 0.10, 0.4,  2500, 'bandpass', null);
  }

  function playWarp() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('sine', 160, 1400, t,       0.20, 0.7, null);
    _oscSlide('sine', 1400, 160, t + 0.20, 0.20, 0.6, null);
    _osc('triangle', 700, t + 0.08, 0.18, 0.5, null);
    _noise(t + 0.05, 0.12, 0.35, 900, 'bandpass', null);
  }

  function playCombo(multiplier) {
    if (!ctx || muted) return;
    const t    = ctx.currentTime;
    const base = 380 * Math.pow(1.22, multiplier - 2);
    _osc('sine',     base,        t,        0.16, 0.75, null);
    _osc('sine',     base * 1.25, t + 0.06, 0.13, 0.65, null);
    _osc('sine',     base * 1.5,  t + 0.12, 0.11, 0.55, null);
    _osc('triangle', base * 2,    t + 0.04, 0.09, 0.4,  null);
    if (multiplier >= 4) _noise(t, 0.04, 0.5, 4000, 'bandpass', null);
  }

  function playWallHit() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('sine', 220, 30, t, 0.3, 1.1, null);
    _noise(t,       0.18, 1.0,  180,  'lowpass',  null);
    _noise(t,       0.08, 0.8,  2000, 'bandpass', null);
    _noise(t + 0.1, 0.12, 0.5,  800,  'bandpass', null);
    _osc('sine',     80,  t,       0.35, 1.0, null);
    _osc('triangle', 1200, t,      0.06, 0.6, null);
  }

  function playSelfHit() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('sawtooth', 800, 35,  t,        0.55, 0.9,  null);
    _oscSlide('sawtooth', 650, 25,  t + 0.05, 0.45, 0.75, null);
    _noise(t,        0.06, 0.9,  1200, 'bandpass', null);
    _noise(t + 0.06, 0.20, 0.65, 500,  'lowpass',  null);
    _noise(t + 0.18, 0.25, 0.4,  300,  'lowpass',  null);
    _oscSlide('sine', 1400, 200, t + 0.02, 0.25, 0.5, null);
  }

  function playWin() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [261.63, 329.63, 392.00, 523.25, 659.25, 783.99].forEach((f, i) => {
      _osc('sine',     f,     t + i * 0.08, 0.4,  0.7, null);
      _osc('triangle', f * 2, t + i * 0.08, 0.25, 0.5, null);
    });
    setTimeout(() => {
      if (!ctx || muted) return;
      const t2 = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach(f => _osc('sine', f, t2, 1.2, 0.4, null));
      _noise(t2, 0.08, 0.6, 5000, 'bandpass', null);
    }, 520);
  }

  function playLose() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [
      [220.00, 0.00],
      [196.00, 0.20],
      [174.61, 0.40],
      [155.56, 0.62],
      [130.81, 0.86],
    ].forEach(([freq, delay]) => {
      _osc('sine',     freq,     t + delay, 1.1,  0.6,  null);
      _osc('triangle', freq * 2, t + delay, 0.8,  0.35, null);
      _osc('sine',     freq / 2, t + delay, 0.65, 0.25, null);
    });
    _noise(t + 0.5, 0.9, 0.65, 100, 'lowpass',  null);
    _noise(t + 0.7, 0.6, 0.45, 280, 'bandpass', null);
    _oscSlide('sine', 120, 20, t + 1.0, 0.6, 0.8, null);
  }

  function playPause() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _osc('sine', 900, t,        0.09, 0.55, null);
    _osc('sine', 680, t + 0.10, 0.09, 0.55, null);
  }

  function playResume() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _osc('sine', 680, t,        0.09, 0.55, null);
    _osc('sine', 900, t + 0.10, 0.09, 0.55, null);
  }

  function startMenu() {
    _screen = 'menu';
    _init();
    if (menuLoop) { menuLoop.stop(0.05); menuLoop = null; }
    if (!muted) {
      setTimeout(() => {
        if (_screen === 'menu' && !muted) menuLoop = _makeMenuLoop();
      }, 200);
    }
  }

  function startGame() {
    _screen = 'game';
    _init();
    if (menuLoop) { menuLoop.stop(0.3); menuLoop = null; }
    _loopGen++;
  }

  function stopAll(fade = 0.5) {
    _loopGen++;
    if (menuLoop) { try { menuLoop.stop(fade); } catch(e){} menuLoop = null; }
  }

  function toggleMute() {
    muted = !muted;
    if (muted) {
      stopAll(0.15);
    } else {
      _init();
      if (ctx.state === 'suspended') ctx.resume();
      if (_screen === 'menu' && !menuLoop) menuLoop = _makeMenuLoop();
    }
    return muted;
  }

  function isMuted() { return muted; }

  function setMute(mute) {
    muted = mute;
    if (muted) {
      stopAll(0.15);
    } else {
      _init();
      if (ctx.state === 'suspended') ctx.resume();
      if (_screen === 'menu' && !menuLoop) menuLoop = _makeMenuLoop();
    }
  }

  function autoStart() {
    if (_started) return;
    _started = true;
    _init();

    const tryPlay = () => {
      if (muted) return;
      if (ctx.state === 'suspended') ctx.resume();
      if (_screen === 'menu' && !menuLoop) menuLoop = _makeMenuLoop();
    };

    if (ctx.state === 'running') { tryPlay(); return; }

    const onFirst = () => {
      tryPlay();
      document.removeEventListener('pointerdown', onFirst);
      document.removeEventListener('keydown',     onFirst);
      document.removeEventListener('click',       onFirst);
    };
    document.addEventListener('pointerdown', onFirst);
    document.addEventListener('keydown',     onFirst);
    document.addEventListener('click',       onFirst);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      _destroyCtx();
    } else if (!muted) {
      setTimeout(() => {
        if (muted) return;
        _init();
        if (_screen === 'menu' && !menuLoop) menuLoop = _makeMenuLoop();
      }, 150);
    }
  });

  window.addEventListener('blur', () => {
    _destroyCtx();
  });

  window.addEventListener('focus', () => {
    if (!muted) {
      setTimeout(() => {
        if (muted) return;
        _init();
        if (_screen === 'menu' && !menuLoop) menuLoop = _makeMenuLoop();
      }, 150);
    }
  });

  return {
    autoStart,
    startMenu, startGame, stopAll,
    toggleMute, isMuted, setMute,
    playEat, playBonus, playPoison, playPoisonDeath,
    playMagnet, playFreeze, playWarp, playCombo,
    playWallHit, playSelfHit, playWin, playLose,
    playPause, playResume,
  };
})();