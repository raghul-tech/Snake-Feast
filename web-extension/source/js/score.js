const ScoreManager = (() => {

  function loadAll(callback) {
    callback({
      easy:   parseInt(localStorage.getItem('sfHs_easy')   || '0'),
      medium: parseInt(localStorage.getItem('sfHs_medium') || '0'),
      hard:   parseInt(localStorage.getItem('sfHs_hard')   || '0'),
      muted:  localStorage.getItem('sfMuted') === 'true',
    });
  }

  function saveOne(mode, value) {
    localStorage.setItem('sfHs_' + mode, String(value));
  }

  function reset(mode){
    saveOne(mode, 0);
  }

  function saveMute(mute) {
    localStorage.setItem('sfMuted', mute);
  }

  return { loadAll, saveOne, reset, saveMute };

})();