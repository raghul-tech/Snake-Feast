
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
        try {
          const scores = JSON.parse(jsonStr);
          callback(scores);
        } catch(e) {
          callback({ easy: 0, medium: 0, hard: 0 });
        }
      });
    });
  }

  function saveOne(mode, value) {
    if (!IS_DESKTOP) {
      localStorage.setItem('sfHs_' + mode, value);
      return;
    }

    if (_ready && _bridge) {
      _bridge.saveScore(mode, value);
    } else {
      _pending.push([mode, value]);
      if (!_bridge) _connectBridge(() => {});
    }
  }

  function reset(mode){
    saveOne(mode, 0);
  }

  return { loadAll, saveOne, IS_DESKTOP, reset };
})();