const ScoreManager = (() => {


  const IS_DESKTOP = !!(window.qt && window.qt.webChannelTransport);
  let _bridge  = null;
  let _ready   = false;
  let _pending = [];

  function _connectBridge(callback) {
    if (!IS_DESKTOP) { callback(); return; }
    new QWebChannel(window.qt.webChannelTransport, (channel) => {
      _bridge = channel.objects.pyBridge;
      _ready  = true;
      _pending.forEach(([mode, val]) => _bridge.saveScore(mode, val));
      _pending = [];
      callback();
    });
  }

  function loadAll(callback) {
    if (!IS_DESKTOP) {
      callback({
        easy:   parseInt(localStorage.getItem('sfHs_easy')   || '0'),
        medium: parseInt(localStorage.getItem('sfHs_medium') || '0'),
        hard:   parseInt(localStorage.getItem('sfHs_hard')   || '0'),
      });
      return;
    }
    _connectBridge(() => {
      _bridge.getScores((jsonStr) => {
        try { callback(JSON.parse(jsonStr)); }
        catch(e) { callback({ easy: 0, medium: 0, hard: 0 }); }
      });
    });
  }

  function saveOne(mode, value) {

    localStorage.setItem('sfHs_' + mode, String(value));

    if (IS_DESKTOP) {
      if (_ready && _bridge) {
        _bridge.saveScore(mode, value);
      } else {
        _pending.push([mode, value]);
        if (!_bridge) _connectBridge(() => {});
      }
    }
  }

  function resetAll() {
    ['easy', 'medium', 'hard'].forEach(m => {
      localStorage.setItem('sfHs_' + m, '0');
    });
  }

  return { loadAll, saveOne, resetAll, IS_DESKTOP };
})();