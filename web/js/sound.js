const SoundManager = (() => {
  let ctx        = null;
  let masterGain = null;
  let compressor = null;
  let menuLoop   = null;
  let gameLoop   = null;
  let muted      = false;
  let _screen    = 'menu';

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

  function _dest() { return masterGain || ctx.destination; }

  function _resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

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

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 2.5);
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
      if (!playing || muted) return;
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
        setTimeout(() => scheduleBar(ctx.currentTime + 0.08), (BAR - 0.3) * 1000);
      }
    }

    scheduleBar(ctx.currentTime + 0.2);

    return {
      stop(fade = 1.5) {
        playing = false;
        if (gain) {
          gain.gain.cancelScheduledValues(ctx.currentTime);
          gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + fade);
        }
      }
    };
  }

  function _makeGameLoop() {
    if (!ctx || muted) return null;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.6);
    gain.connect(_dest());

    let playing  = true;
    const BPM    = 130;
    const B      = 60 / BPM;       
    const BAR    = B * 4;          

    const arpPat = [
      261.63, 329.63, 392.00, 523.25,
      392.00, 329.63, 261.63, 196.00,
    ];
    let barCount = 0;

    function scheduleBar(t) {
      if (!playing || muted) return;

      [0, B * 2].forEach(offset => {
        const st = t + offset;
        _oscSlide('sine', 200, 35, st, 0.22, 1.0, gain);
        _noise(st, 0.012, 0.9, 3500, 'highpass', gain);
      });

      [B, B * 3].forEach(offset => {
        const st = t + offset;
        _noise(st, 0.14, 0.75, 1600, 'bandpass', gain);
        _osc('sine', 200, st, 0.08, 0.5, gain);
      });

      for (let h = 0; h < 8; h++) {
        const vol = h % 2 === 0 ? 0.22 : 0.12;
        _noise(t + h * B * 0.5, 0.03, vol, 9000, 'highpass', gain);
      }

      const bassRoot = 65.41;
      _oscSlide('square', bassRoot, bassRoot * 0.95, t,           B * 0.9, 0.35, gain);
      _oscSlide('square', bassRoot * 1.5, bassRoot,  t + B * 1.5, B * 0.4, 0.28, gain);
      _oscSlide('square', bassRoot * 2,   bassRoot,  t + B * 3,   B * 0.8, 0.3,  gain);

      for (let n = 0; n < 8; n++) {
        const noteIdx = (barCount * 8 + n) % arpPat.length;
        const nt      = t + n * B * 0.5;
        _osc('square', arpPat[noteIdx], nt, B * 0.35, 0.18, gain);
        _osc('sine',   arpPat[noteIdx] * 2, nt + 0.01, B * 0.3, 0.07, gain);
      }

      barCount++;
      if (playing) {
        setTimeout(() => scheduleBar(ctx.currentTime + 0.04), (BAR - 0.2) * 1000);
      }
    }

    scheduleBar(ctx.currentTime + 0.05);

    return {
      stop(fade = 0.5) {
        playing = false;
        if (gain) {
          gain.gain.cancelScheduledValues(ctx.currentTime);
          gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + fade);
        }
      }
    };
  }

  function playEat() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('sine', 520, 980, t,        0.09, 0.7, null);
    _osc('sine',      1200,        t+0.07, 0.07, 0.5, null);
  }

  function playBonus() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [523, 659, 784, 1047, 1318].forEach((f, i) => {
      _osc('sine',     f,       t + i*0.055, 0.22, 0.6, null);
      _osc('triangle', f * 1.5, t + i*0.055, 0.15, 0.25, null);
    });
    _noise(t, 0.04, 0.8, 5000, 'bandpass', null);
  }

  function playPoison() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('sawtooth', 340, 70,  t,      0.5, 0.65, null);
    _oscSlide('sawtooth', 320, 80,  t+0.02, 0.5, 0.45, null);
    _noise(t+0.08, 0.25, 0.4, 700, 'bandpass', null);
  }

  function playMagnet() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('square', 140, 420, t,      0.22, 0.6, null);
    _oscSlide('square', 420, 140, t+0.22, 0.22, 0.5, null);
    _noise(t, 0.06, 0.45, 6000, 'highpass', null);
  }

  function playFreeze() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [1400, 1800, 2200, 2800, 3400, 2000].forEach((f, i) => {
      _osc('sine',     f,       t + i*0.04, 0.20, 0.55, null);
      _osc('triangle', f * 0.5, t + i*0.04, 0.15, 0.3,  null);
    });
    _noise(t,      0.06, 0.65, 5000, 'highpass', null);
    _noise(t+0.1,  0.10, 0.4,  2500, 'bandpass', null);
  }

  function playWarp() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('sine', 160, 1400, t,      0.20, 0.7, null);
    _oscSlide('sine', 1400, 160, t+0.20, 0.20, 0.6, null);
    _osc('triangle', 700, t+0.08, 0.18, 0.5, null);
    _noise(t+0.05, 0.12, 0.35, 900, 'bandpass', null);
  }

  function playCombo(multiplier) {
    if (!ctx || muted) return;
    const t    = ctx.currentTime;
    const base = 380 * Math.pow(1.22, multiplier - 2);
    _osc('sine',     base,        t,       0.16, 0.75, null);
    _osc('sine',     base * 1.25, t+0.06,  0.13, 0.65, null);
    _osc('sine',     base * 1.5,  t+0.12,  0.11, 0.55, null);
    _osc('triangle', base * 2,    t+0.04,  0.09, 0.4,  null);
    if (multiplier >= 4) _noise(t, 0.04, 0.5, 4000, 'bandpass', null);
  }

  function playWallHit() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _noise(t,      0.14, 1.0,  180, 'lowpass',  null);
    _noise(t,      0.07, 0.7, 1200, 'bandpass', null);
    _osc('sine',  50,   t,      0.28, 0.9, null);
    _osc('sine',  100,  t,      0.18, 0.6, null);
  }

  function playSelfHit() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _oscSlide('sawtooth', 700, 40, t, 0.55, 0.85, null);
    _noise(t,       0.08, 0.8,  900, 'bandpass', null);
    _noise(t+0.08,  0.22, 0.5,  400, 'lowpass',  null);
  }

  function playGameOver() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [
      [220.00, 0.00],
      [196.00, 0.18],
      [174.61, 0.36],
      [155.56, 0.55],
      [130.81, 0.76],
    ].forEach(([freq, delay]) => {
      _osc('sine',     freq,     t+delay, 1.1,  0.55, null);
      _osc('triangle', freq * 2, t+delay, 0.8,  0.3,  null);
      _osc('sine',     freq / 2, t+delay, 0.65, 0.2,  null);
    });
    _noise(t+0.5, 0.8, 0.6, 100, 'lowpass',  null);
    _noise(t+0.7, 0.5, 0.4, 300, 'bandpass', null);
  }

  function playPause() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _osc('sine', 900, t,       0.09, 0.55, null);
    _osc('sine', 680, t+0.10,  0.09, 0.55, null);
  }

  function playResume() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    _osc('sine', 680, t,       0.09, 0.55, null);
    _osc('sine', 900, t+0.10,  0.09, 0.55, null);
  }

  function startMenu() {
    _screen = 'menu';
    _init();
    _resume();
    // if (gameLoop) {
    //   gameLoop.stop(0.4);
    //   gameLoop = null;
    // }
    if (menuLoop) {
      menuLoop.stop(0.05);
      menuLoop = null;
    }
    if (!muted) {
      setTimeout(() => {
        if (_screen === 'menu' && !muted) {
          menuLoop = _makeMenuLoop();
        }
      }, 450);
    }
  }

  function startGame() {
    _screen = 'game';
    _init();
    _resume();
    if (menuLoop) {
      menuLoop.stop(0.3);
      menuLoop = null;
    }
    // if (gameLoop) {
    //   gameLoop.stop(0.05);
    //   gameLoop = null;
    // }
    // if (!muted) {
    //   setTimeout(() => {
    //     if (_screen === 'game' && !muted) {
    //       gameLoop = _makeGameLoop();
    //     }
    //   }, 350);
    // }
  }

  function stopAll(fade = 0.5) {
    if (menuLoop) { menuLoop.stop(fade); menuLoop = null; }
    if (gameLoop) { gameLoop.stop(fade); gameLoop = null; }
  }

  function toggleMute() {
    muted = !muted;
    if (muted) {
      stopAll(0.2);
    } else {
      _resume();
      if (_screen === 'game') startGame();
      else startMenu();
    }
    return muted;
  }

  function isMuted() { return muted; }

  function autoStart() {
    _init();
    if (ctx.state === 'running' && !muted) {
      menuLoop = _makeMenuLoop();
      return;
    }
    const onFirst = () => {
      _resume();
      if (!menuLoop && !gameLoop && !muted && _screen === 'menu') {
        menuLoop = _makeMenuLoop();
      }
      document.removeEventListener('pointerdown', onFirst);
      document.removeEventListener('keydown',     onFirst);
      document.removeEventListener('click',       onFirst);
    };
    document.addEventListener('pointerdown', onFirst);
    document.addEventListener('keydown',     onFirst);
    document.addEventListener('click',       onFirst);
  }

  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) {
      ctx.suspend();
    } else if (!muted) {
      ctx.resume().then(() => {
        if (!menuLoop && !gameLoop) {
          if (_screen === 'game') gameLoop = _makeGameLoop();
          else                    menuLoop = _makeMenuLoop();
        }
      });
    }
  });

  window.addEventListener('blur', () => {
    if (ctx) ctx.suspend();
  });

  window.addEventListener('focus', () => {
    if (ctx && !muted) {
      ctx.resume().then(() => {
        if (!menuLoop && !gameLoop) {
          if (_screen === 'game') gameLoop = _makeGameLoop();
          else                    menuLoop = _makeMenuLoop();
        }
      });
    }
  });

  return {
    autoStart,
    startMenu, startGame, stopAll,
    toggleMute, isMuted,
    playEat, playBonus, playPoison, playMagnet,
    playFreeze, playWarp, playCombo,
    playWallHit, playSelfHit, playGameOver,
    playPause, playResume,
  };
})();