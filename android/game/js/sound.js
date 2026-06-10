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
    compressor.threshold.setValueAtTime(-12, ctx.currentTime);
    compressor.knee.setValueAtTime(8,        ctx.currentTime);
    compressor.ratio.setValueAtTime(4,       ctx.currentTime);
    compressor.attack.setValueAtTime(0.005,  ctx.currentTime);
    compressor.release.setValueAtTime(0.3,   ctx.currentTime);
    compressor.connect(ctx.destination);
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.4, ctx.currentTime);
    masterGain.connect(compressor);
  }

  function _suspendCtx() {
    _loopGen++;
    if (menuLoop) { try { menuLoop.stop(0); } catch(e){} menuLoop = null; }
    if (ctx && ctx.state === 'running') {
      try { ctx.suspend(); } catch(e) {}
    }
  }

  function _resumeCtx() {
    if (!ctx) { _init(); return; }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  function _dest() { return masterGain || ctx.destination; }

 
  function _osc(type, freq, start, dur, vol) {
    if (!ctx || muted) return;
    const now = ctx.currentTime;
    const t   = Math.max(start, now);
    const g   = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(_dest());
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.connect(g);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function _oscSlide(type, f0, f1, start, dur, vol) {
    if (!ctx || muted) return;
    const now = ctx.currentTime;
    const t   = Math.max(start, now);
    const g   = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(_dest());
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
    o.connect(g);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function _noise(start, dur, vol, filterFreq, filterType) {
    if (!ctx || muted) return;
    const now     = ctx.currentTime;
    const t       = Math.max(start, now);
    const samples = Math.ceil(ctx.sampleRate * dur);
    const buf     = ctx.createBuffer(1, samples, ctx.sampleRate);
    const data    = buf.getChannelData(0);
    for (let i = 0; i < samples; i++) data[i] = Math.random() * 2 - 1;
    const src  = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type            = filterType || 'bandpass';
    filt.frequency.value = filterFreq;
    filt.Q.value         = 1.0;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(_dest());
    src.connect(filt);
    filt.connect(g);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  function _makeMenuLoop() {
    if (!ctx || muted) return null;
    const myGen = _loopGen;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 2.5);
    gain.connect(_dest());

    const filt = ctx.createBiquadFilter();
    filt.type            = 'lowpass';
    filt.frequency.value = 1200;
    filt.Q.value         = 0.4;
    filt.connect(gain);

    const BAR    = 6.0;
    const chords = [
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
      [110.00, 130.81, 164.81, 220.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 392.00], // G7
    ];
    let chordIdx  = 0;
    let nextStart = ctx.currentTime + 0.1;
    let rafId     = null;
    let stopped   = false;

    function scheduleBar(startTime) {
      if (stopped || muted || _loopGen !== myGen || !ctx) return;
      const notes = chords[chordIdx % chords.length];
      chordIdx++;


      notes.forEach((freq, i) => {
        const t = startTime + i * 0.10;

        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, t);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0,    t);
        g.gain.linearRampToValueAtTime(0.18, t + 0.6);
        g.gain.linearRampToValueAtTime(0.10, t + 2.5);
        g.gain.linearRampToValueAtTime(0,    startTime + BAR - 0.4);
        o.connect(g); g.connect(filt);
        o.start(t); o.stop(startTime + BAR);


        const o2 = ctx.createOscillator();
        o2.type = 'triangle';
        o2.frequency.setValueAtTime(freq * 2, t + 0.15);
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0,    t + 0.15);
        g2.gain.linearRampToValueAtTime(0.05, t + 0.9);
        g2.gain.linearRampToValueAtTime(0,    startTime + BAR - 0.6);
        o2.connect(g2); g2.connect(filt);
        o2.start(t + 0.15); o2.stop(startTime + BAR);
      });

      const sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(notes[0] * 0.5, startTime);
      const subG = ctx.createGain();
      subG.gain.setValueAtTime(0,    startTime);
      subG.gain.linearRampToValueAtTime(0.25, startTime + 0.3);
      subG.gain.linearRampToValueAtTime(0.10, startTime + 2.5);
      subG.gain.linearRampToValueAtTime(0,    startTime + BAR - 0.5);
      sub.connect(subG); subG.connect(filt);
      sub.start(startTime); sub.stop(startTime + BAR);
    }

    function tick() {
      if (stopped || _loopGen !== myGen || !ctx) return;
      const lookAhead = nextStart - ctx.currentTime;
      if (lookAhead < 1.5) {
        scheduleBar(nextStart);
        nextStart += BAR;
      }
      rafId = requestAnimationFrame(tick);
    }

    scheduleBar(nextStart);
    nextStart += BAR;
    scheduleBar(nextStart);
    nextStart += BAR;
    rafId = requestAnimationFrame(tick);

    return {
      stop(fade = 0.4) {
        stopped = true;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        try {
          if (ctx) {
            gain.gain.cancelScheduledValues(ctx.currentTime);
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
    _noise(t, 0.04, 0.5, 1800, 'bandpass');
    _oscSlide('sine', 440, 880, t, 0.10, 0.5);
    _osc('sine', 1320, t + 0.05, 0.07, 0.4);
  }

  function playBonus() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [523, 659, 784, 1047, 1318].forEach((f, i) => {
      _osc('sine',     f,       t + i * 0.055, 0.20, 0.5);
      _osc('triangle', f * 1.5, t + i * 0.055, 0.12, 0.2);
    });
    _noise(t, 0.04, 0.5, 5000, 'bandpass');
  }

  function playPoison() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('sine',     400, 180, t,        0.30, 0.6);
    _oscSlide('sine',     420, 170, t + 0.03, 0.28, 0.4);
    _noise(t,        0.10, 0.4, 500, 'bandpass');
    _noise(t + 0.12, 0.15, 0.3, 300, 'lowpass');
    _oscSlide('sawtooth', 160, 80, t + 0.1, 0.28, 0.35);
  }

  function playPoisonDeath() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('sawtooth', 340, 40,  t,        0.50, 0.7);
    _oscSlide('sawtooth', 320, 35,  t + 0.04, 0.45, 0.6);
    _noise(t,        0.15, 0.6, 600, 'bandpass');
    _noise(t + 0.15, 0.3,  0.4, 200, 'lowpass');
    _oscSlide('sine', 800, 60, t + 0.2, 0.5, 0.4);
  }

  function playMagnet() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('square', 140, 420, t,        0.20, 0.45);
    _oscSlide('square', 420, 140, t + 0.22, 0.20, 0.4);
    _noise(t, 0.06, 0.3, 6000, 'highpass');
  }

  function playFreeze() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [1400, 1800, 2200, 2800, 3400, 2000].forEach((f, i) => {
      _osc('sine',     f,       t + i * 0.04, 0.18, 0.45);
      _osc('triangle', f * 0.5, t + i * 0.04, 0.12, 0.25);
    });
    _noise(t,       0.06, 0.45, 5000, 'highpass');
    _noise(t + 0.1, 0.10, 0.3,  2500, 'bandpass');
  }

  function playWarp() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('sine', 160,  1400, t,        0.18, 0.55);
    _oscSlide('sine', 1400, 160,  t + 0.20, 0.18, 0.5);
    _osc('triangle', 700, t + 0.08, 0.15, 0.4);
    _noise(t + 0.05, 0.12, 0.28, 900, 'bandpass');
  }

  function playCombo(multiplier) {
    if (!ctx || muted) return;
    const t    = ctx.currentTime;
    const base = 380 * Math.pow(1.22, multiplier - 2);
    _osc('sine',     base,        t,        0.14, 0.6);
    _osc('sine',     base * 1.25, t + 0.06, 0.11, 0.5);
    _osc('sine',     base * 1.5,  t + 0.12, 0.09, 0.4);
    _osc('triangle', base * 2,    t + 0.04, 0.07, 0.3);
    if (multiplier >= 4) _noise(t, 0.04, 0.35, 4000, 'bandpass');
  }

  function playWallHit() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('sine', 220, 30, t, 0.28, 0.9);
    _noise(t,       0.18, 0.7,  180,  'lowpass');
    _noise(t,       0.08, 0.55, 2000, 'bandpass');
    _noise(t + 0.1, 0.12, 0.35, 800,  'bandpass');
    _osc('sine',     80,   t,      0.30, 0.8);
    _osc('triangle', 1200, t,      0.05, 0.45);
  }

  function playSelfHit() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('sawtooth', 800, 35,  t,        0.50, 0.75);
    _oscSlide('sawtooth', 650, 25,  t + 0.05, 0.40, 0.6);
    _noise(t,        0.06, 0.65, 1200, 'bandpass');
    _noise(t + 0.06, 0.20, 0.5,  500,  'lowpass');
    _noise(t + 0.18, 0.25, 0.3,  300,  'lowpass');
    _oscSlide('sine', 1400, 200, t + 0.02, 0.22, 0.4);
  }

  function playWin() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [261.63, 329.63, 392.00, 523.25, 659.25, 783.99].forEach((f, i) => {
      _osc('sine',     f,     t + i * 0.08, 0.35, 0.6);
      _osc('triangle', f * 2, t + i * 0.08, 0.20, 0.4);
    });
    const t2 = t + 0.52;
    [523.25, 659.25, 783.99].forEach(f => _osc('sine', f, t2, 1.1, 0.35));
    _noise(t2, 0.08, 0.45, 5000, 'bandpass');
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
      _osc('sine',     freq,     t + delay, 1.0,  0.5);
      _osc('triangle', freq * 2, t + delay, 0.7,  0.28);
      _osc('sine',     freq / 2, t + delay, 0.55, 0.20);
    });
    _noise(t + 0.5, 0.9, 0.5, 100, 'lowpass');
    _noise(t + 0.7, 0.6, 0.35, 280, 'bandpass');
    _oscSlide('sine', 120, 20, t + 1.0, 0.55, 0.6);
  }

  function playPause() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _osc('sine', 900, t,        0.08, 0.45);
    _osc('sine', 680, t + 0.10, 0.08, 0.45);
  }

  function playResume() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _osc('sine', 680, t,        0.08, 0.45);
    _osc('sine', 900, t + 0.10, 0.08, 0.45);
  }

  function startMenu() {
    _screen = 'menu';
    _init();
    _resumeCtx();
    if (menuLoop) { menuLoop.stop(0.05); menuLoop = null; }
    if (!muted) {
      setTimeout(() => {
        if (_screen === 'menu' && !muted && ctx) {
          if (ctx.state === 'suspended') ctx.resume().then(() => { menuLoop = _makeMenuLoop(); });
          else menuLoop = _makeMenuLoop();
        }
      }, 150);
    }
  }

  function startGame() {
    _screen = 'game';
    _init();
    _resumeCtx();
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
      _resumeCtx();
      ctx.resume().then(() => {
        if (_screen === 'menu' && !menuLoop) menuLoop = _makeMenuLoop();
      }).catch(() => {});
    }
    return muted;
  }

  function isMuted() { return muted; }

  function autoStart() {
    if (_started) return;
    _started = true;
    _init();

    const tryPlay = () => {
      if (muted || !ctx) return;
      ctx.resume().then(() => {
        if (_screen === 'menu' && !menuLoop) menuLoop = _makeMenuLoop();
      }).catch(() => {});
    };

    if (ctx.state === 'running') { tryPlay(); return; }
    document.addEventListener('pointerdown', tryPlay, { once: true });
    document.addEventListener('touchstart',  tryPlay, { once: true });
    document.addEventListener('click',       tryPlay, { once: true });
  }


  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      _suspendCtx();
    } else if (!muted) {
      setTimeout(() => {
        if (muted) return;
        _resumeCtx();
        if (ctx) {
          ctx.resume().then(() => {
            if (_screen === 'menu' && !menuLoop) menuLoop = _makeMenuLoop();
          }).catch(() => {});
        }
      }, 200);
    }
  });


  window.addEventListener('blur', () => {
    if (menuLoop) { menuLoop.stop(0.2); menuLoop = null; }
    if (ctx && ctx.state === 'running') {
      try { ctx.suspend(); } catch(e) {}
    }
  });

  window.addEventListener('focus', () => {
    if (!muted) {
      setTimeout(() => {
        if (muted || !ctx) return;
        ctx.resume().then(() => {
          if (_screen === 'menu' && !menuLoop) menuLoop = _makeMenuLoop();
        }).catch(() => {});
      }, 200);
    }
  });

  return {
    autoStart,
    startMenu, startGame, stopAll,
    toggleMute, isMuted,
    playEat, playBonus, playPoison, playPoisonDeath,
    playMagnet, playFreeze, playWarp, playCombo,
    playWallHit, playSelfHit, playWin, playLose,
    playPause, playResume,
  };
})();