const ScoreManager = (() => {

  function loadAll(callback) {
    callback({
      easy:   parseInt(localStorage.getItem('sfHs_easy')   || '0'),
      medium: parseInt(localStorage.getItem('sfHs_medium') || '0'),
      hard:   parseInt(localStorage.getItem('sfHs_hard')   || '0'),
    });
  }

  function saveOne(mode, value) {
    localStorage.setItem('sfHs_' + mode, String(value));
  }

  function resetAll() {
    ['easy', 'medium', 'hard'].forEach(m => {
      localStorage.setItem('sfHs_' + m, '0');
    });
  }

  return { loadAll, saveOne, resetAll };

})();