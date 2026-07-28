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

    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.setValueAtTime(-1.0, ctx.currentTime);
    limiter.knee.setValueAtTime(0,         ctx.currentTime);
    limiter.ratio.setValueAtTime(20,       ctx.currentTime);
    limiter.attack.setValueAtTime(0.001,   ctx.currentTime);
    limiter.release.setValueAtTime(0.1,    ctx.currentTime);
    limiter.connect(ctx.destination);

    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, ctx.currentTime);
    compressor.knee.setValueAtTime(12,       ctx.currentTime);
    compressor.ratio.setValueAtTime(2.5,     ctx.currentTime);
    compressor.attack.setValueAtTime(0.010,  ctx.currentTime);
    compressor.release.setValueAtTime(0.35,  ctx.currentTime);
    compressor.connect(limiter);

    const hiShelf = ctx.createBiquadFilter();
    hiShelf.type            = 'highshelf';
    hiShelf.frequency.value = 3500;
    hiShelf.gain.value      = 4;
    hiShelf.connect(compressor);

    const lowCut = ctx.createBiquadFilter();
    lowCut.type            = 'highpass';
    lowCut.frequency.value = 60;
    lowCut.Q.value         = 0.7;
    lowCut.connect(hiShelf);

    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.85, ctx.currentTime);
    masterGain.connect(lowCut);
  }

  function _fadeOut(duration = 0.15) {
    if (!ctx || !masterGain) return;
    try {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    } catch(e) {}
  }

  function _fadeIn(duration = 0.3) {
    if (!ctx || !masterGain) return;
    try {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.85, ctx.currentTime + duration);
    } catch(e) {}
  }

  function _suspendCtx() {
    _loopGen++;
    if (menuLoop) { try { menuLoop.stop(0.12); } catch(e){} menuLoop = null; }
    if (!ctx || ctx.state !== 'running') return;
    _fadeOut(0.12);
    setTimeout(() => {
      if (ctx && ctx.state === 'running') {
        try { ctx.suspend(); } catch(e) {}
      }
    }, 140);
  }

  function _resumeCtx() {
    if (!ctx) { _init(); return; }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  }

  function _dest() { return masterGain || ctx.destination; }

  function _osc(type, freq, start, dur, vol) {
    if (!ctx || muted) return;
    const t = Math.max(start, ctx.currentTime + 0.001);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.002);
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
    const t = Math.max(start, ctx.currentTime + 0.001);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.003);
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
    const t       = Math.max(start, ctx.currentTime + 0.001);
    const samples = Math.ceil(ctx.sampleRate * Math.min(dur, 1.0));
    const buf     = ctx.createBuffer(1, samples, ctx.sampleRate);
    const data    = buf.getChannelData(0);
    let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0;
    for (let i = 0; i < samples; i++) {
      const wh = Math.random() * 2 - 1;
      b0 = 0.99886*b0 + wh*0.0555179;
      b1 = 0.99332*b1 + wh*0.0750759;
      b2 = 0.96900*b2 + wh*0.1538520;
      b3 = 0.86650*b3 + wh*0.3104856;
      b4 = 0.55000*b4 + wh*0.5329522;
      b5 = -0.7616*b5 - wh*0.0168980;
      data[i] = (b0+b1+b2+b3+b4+b5+wh*0.5362) * 0.11;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type            = filterType || 'bandpass';
    filt.frequency.value = filterFreq;
    filt.Q.value         = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(_dest());
    src.connect(filt); filt.connect(g);
    src.start(t); src.stop(t + dur + 0.02);
  }

  function _makeMenuLoop() {
    if (!ctx || muted) return null;
    const myGen = _loopGen;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 2.5);
    gain.connect(_dest());

    const filt = ctx.createBiquadFilter();
    filt.type            = 'lowpass';
    filt.frequency.value = 2400;
    filt.Q.value         = 0.35;
    filt.connect(gain);

    const BAR    = 6.0;
    const chords = [
      [130.81, 164.81, 196.00, 246.94],
      [110.00, 130.81, 164.81, 220.00],
      [174.61, 220.00, 261.63, 329.63],
      [196.00, 246.94, 293.66, 392.00],
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
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.20, t + 0.5);
        g.gain.linearRampToValueAtTime(0.12, t + 2.5);
        g.gain.linearRampToValueAtTime(0,    startTime + BAR - 0.4);
        o.connect(g); g.connect(filt);
        o.start(t); o.stop(startTime + BAR);

        const o2 = ctx.createOscillator();
        o2.type = 'triangle';
        o2.frequency.setValueAtTime(freq * 2, t + 0.12);
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0, t + 0.12);
        g2.gain.linearRampToValueAtTime(0.07, t + 0.8);
        g2.gain.linearRampToValueAtTime(0,    startTime + BAR - 0.6);
        o2.connect(g2); g2.connect(filt);
        o2.start(t + 0.12); o2.stop(startTime + BAR);

        const o3 = ctx.createOscillator();
        o3.type = 'sine';
        o3.frequency.setValueAtTime(freq * 4, t + 0.08);
        const g3 = ctx.createGain();
        g3.gain.setValueAtTime(0, t + 0.08);
        g3.gain.linearRampToValueAtTime(0.03, t + 0.6);
        g3.gain.linearRampToValueAtTime(0,    startTime + BAR - 0.8);
        o3.connect(g3); g3.connect(filt);
        o3.start(t + 0.08); o3.stop(startTime + BAR);
      });

      const sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(notes[0] * 0.5, startTime);
      const subG = ctx.createGain();
      subG.gain.setValueAtTime(0,    startTime);
      subG.gain.linearRampToValueAtTime(0.20, startTime + 0.4);
      subG.gain.linearRampToValueAtTime(0.08, startTime + 2.5);
      subG.gain.linearRampToValueAtTime(0,    startTime + BAR - 0.5);
      sub.connect(subG); subG.connect(filt);
      sub.start(startTime); sub.stop(startTime + BAR);
    }

    function tick() {
      if (stopped || _loopGen !== myGen || !ctx) return;
      if (nextStart - ctx.currentTime < 1.5) {
        scheduleBar(nextStart);
        nextStart += BAR;
      }
      rafId = requestAnimationFrame(tick);
    }

    scheduleBar(nextStart); nextStart += BAR;
    scheduleBar(nextStart); nextStart += BAR;
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
    _noise(t, 0.035, 0.55, 2200, 'bandpass');
    _oscSlide('sine', 520, 1040, t, 0.10, 0.55);
    _osc('sine', 1560, t + 0.05, 0.07, 0.45);
    _osc('triangle', 2080, t + 0.02, 0.05, 0.3);
  }

  function playBonus() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [523, 659, 784, 1047, 1318, 1568].forEach((f, i) => {
      _osc('sine',     f,       t + i * 0.05, 0.20, 0.5);
      _osc('triangle', f * 1.5, t + i * 0.05, 0.10, 0.18);
    });
    _noise(t + 0.1, 0.06, 0.45, 6000, 'highpass');
  }

  function playPoison() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('sine',     380, 160, t,        0.28, 0.6);
    _oscSlide('sine',     400, 150, t + 0.03, 0.25, 0.45);
    _noise(t,        0.10, 0.4,  600, 'bandpass');
    _noise(t + 0.10, 0.14, 0.3,  350, 'lowpass');
    _oscSlide('sawtooth', 200, 80, t + 0.08, 0.25, 0.35);
  }

  function playPoisonDeath() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('sawtooth', 360, 40,  t,        0.48, 0.7);
    _oscSlide('sawtooth', 340, 35,  t + 0.04, 0.42, 0.6);
    _noise(t,        0.14, 0.6, 700, 'bandpass');
    _noise(t + 0.14, 0.28, 0.4, 250, 'lowpass');
    _oscSlide('sine', 900, 55, t + 0.18, 0.55, 0.45);
  }

  function playMagnet() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('square', 160, 480, t,        0.18, 0.4);
    _oscSlide('square', 480, 160, t + 0.20, 0.18, 0.35);
    _noise(t, 0.08, 0.3, 7000, 'highpass');
    _osc('sine', 960, t + 0.05, 0.12, 0.35);
  }

  function playFreeze() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [1600, 2000, 2400, 3000, 3600, 2200].forEach((f, i) => {
      _osc('sine',     f,       t + i * 0.038, 0.18, 0.45);
      _osc('triangle', f * 0.5, t + i * 0.038, 0.10, 0.22);
    });
    _noise(t,       0.06, 0.5,  6000, 'highpass');
    _noise(t + 0.1, 0.10, 0.35, 3000, 'bandpass');
  }

  function playWarp() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('sine', 180,  1600, t,        0.18, 0.6);
    _oscSlide('sine', 1600, 180,  t + 0.18, 0.18, 0.55);
    _osc('triangle', 800,  t + 0.06, 0.14, 0.42);
    _osc('sine',     1600, t + 0.09, 0.08, 0.35);
    _noise(t + 0.04, 0.12, 0.3, 1100, 'bandpass');
  }

  function playCombo(multiplier) {
    if (!ctx || muted) return;
    const t    = ctx.currentTime;
    const base = 440 * Math.pow(1.25, multiplier - 2);
    _osc('sine',     base,        t,        0.15, 0.65);
    _osc('sine',     base * 1.25, t + 0.05, 0.12, 0.55);
    _osc('sine',     base * 1.5,  t + 0.10, 0.10, 0.48);
    _osc('triangle', base * 2,    t + 0.03, 0.08, 0.35);
    if (multiplier >= 3) _osc('sine', base * 3, t + 0.08, 0.06, 0.3);
    if (multiplier >= 4) _noise(t, 0.05, 0.35, 5000, 'bandpass');
  }

  function playWallHit() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('sine', 240, 30, t, 0.26, 0.85);
    _noise(t,       0.16, 0.65, 200,  'lowpass');
    _noise(t,       0.08, 0.5,  2400, 'bandpass');
    _noise(t + 0.1, 0.12, 0.35, 900,  'bandpass');
    _osc('sine',     90,   t,       0.28, 0.75);
    _osc('triangle', 1400, t,       0.05, 0.4);
  }

  function playSelfHit() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('sawtooth', 880, 40,  t,        0.48, 0.72);
    _oscSlide('sawtooth', 720, 28,  t + 0.04, 0.38, 0.58);
    _noise(t,        0.06, 0.6,  1400, 'bandpass');
    _noise(t + 0.06, 0.18, 0.45, 600,  'lowpass');
    _noise(t + 0.18, 0.22, 0.3,  350,  'lowpass');
    _oscSlide('sine', 1600, 220, t + 0.02, 0.22, 0.42);
  }

  function playWin() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      _osc('sine',     f,     t + i * 0.07, 0.32, 0.6);
      _osc('triangle', f * 2, t + i * 0.07, 0.18, 0.38);
    });
    const t2 = t + 0.50;
    [523.25, 659.25, 783.99, 1046.50].forEach(f => _osc('sine', f, t2, 1.0, 0.32));
    _noise(t2, 0.08, 0.4, 6000, 'highpass');
  }

  function playLose() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [[220.00,0],[196.00,0.22],[174.61,0.44],[155.56,0.66],[130.81,0.90]]
      .forEach(([freq, delay]) => {
        _osc('sine',     freq,     t + delay, 1.0,  0.48);
        _osc('triangle', freq * 2, t + delay, 0.7,  0.26);
        _osc('sine',     freq / 2, t + delay, 0.55, 0.18);
      });
    _noise(t + 0.5, 0.85, 0.45, 120, 'lowpass');
    _noise(t + 0.7, 0.55, 0.32, 300, 'bandpass');
    _oscSlide('sine', 130, 22, t + 1.0, 0.55, 0.55);
  }

  function playPause() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _osc('sine', 1000, t,        0.09, 0.5);
    _osc('sine',  750, t + 0.11, 0.09, 0.5);
  }

  function playResume() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _osc('sine',  750, t,        0.09, 0.5);
    _osc('sine', 1000, t + 0.11, 0.09, 0.5);
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
      _fadeOut(0.15);
      setTimeout(() => {
        _loopGen++;
        if (menuLoop) { try { menuLoop.stop(0); } catch(e){} menuLoop = null; }
        if (ctx && ctx.state === 'running') { try { ctx.suspend(); } catch(e) {} }
      }, 180);
    } else if (!muted) {
      setTimeout(() => {
        if (muted || !ctx) return;
        _fadeIn(0.3);
        ctx.resume().then(() => {
          if (_screen === 'menu' && !menuLoop) menuLoop = _makeMenuLoop();
        }).catch(() => {});
      }, 200);
    }
  });

  window.addEventListener('blur', () => {
    if (!ctx || !masterGain) return;
    _fadeOut(0.12);
    setTimeout(() => {
      if (menuLoop) { try { menuLoop.stop(0); } catch(e){} menuLoop = null; }
      if (ctx && ctx.state === 'running') { try { ctx.suspend(); } catch(e) {} }
    }, 150);
  });

  window.addEventListener('focus', () => {
    if (!muted && ctx && masterGain) {
      setTimeout(() => {
        if (muted || !ctx) return;
        _fadeIn(0.3);
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