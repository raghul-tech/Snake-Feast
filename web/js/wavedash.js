const WavedashManager = (() => {

  const IS_WAVEDASH = () => typeof Wavedash !== 'undefined';
  const LEADERBOARD_NAMES = {
    easy:   'easy',
    medium: 'medium',
    hard:   'hard',
  };
  const leaderboardIds = { easy: null, medium: null, hard: null };
  const ACH_MAP = {
    first:   'FIRST_BLOOD',
    sc10:    'DOUBLE_DIGITS',
    sc50:    'FIFTY_FEAST',
    sc100:   'CENTURY',
    combo3:  'HOT_STREAK',
    ghost:   'PHASE_SHIFT',
    magnet:  'MAGNETAR',
    freeze:  'CRYOGENICS',
    poison:  'TOXIN_PROOF',
    len15:   'SLITHERER',
    len30:   'GREAT_SERPENT',
  };
  const STATS = {
    totalGames:  'total_games',
    totalScore:  'total_score',
    totalEaten:  'total_food_eaten',
    bestEasy:    'best_score_easy',
    bestMedium:  'best_score_medium',
    bestHard:    'best_score_hard',
  };

  let _ready = false;
  async function init() {
    if (!IS_WAVEDASH()) {
      return;
    }
    let attempts = 0;
    while (typeof Wavedash === 'undefined' && attempts < 50) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }
    if (!IS_WAVEDASH()) return;
    try {
      Wavedash.init({ gameId: 'j97c9rdm2pgtpg69vsns8r1ms98anp7d', debug: false });
      await Wavedash.requestStats();
      await Promise.all(
        Object.entries(LEADERBOARD_NAMES).map(async ([mode, name]) => {
          const res = await Wavedash.getOrCreateLeaderboard(name, 1, 0);
          if (res?.success && res.data?.id) {
            leaderboardIds[mode] = res.data.id;
            console.log(`[Wavedash] Leaderboard ready: ${name} → ${res.data.id}`);
          } else {
            console.warn(`[Wavedash] Leaderboard failed: ${name}`, res);
          }
        })
      );
      _ready = true;
      await _loadCloudScores();

    } catch (e) {
      console.warn('[Wavedash] Init error:', e);
    }
  }

  async function _loadCloudScores() {
    if (!_ready || !IS_WAVEDASH()) return;
    try {
      const exists = await Wavedash.remoteFileExists('saves/scores.json');
      if (!exists?.success || !exists.data) return;
      await Wavedash.downloadRemoteFile('saves/scores.json');
      const bytes = await Wavedash.readLocalFile('saves/scores.json');
      if (!bytes) return;
      const cloud = JSON.parse(new TextDecoder().decode(bytes));
      console.log('[Wavedash] Cloud scores:', cloud);
      ['easy', 'medium', 'hard'].forEach(m => {
        const cloudVal = parseInt(cloud[m] || '0');
        if (cloudVal > (G.hs[m] || 0)) {
          G.hs[m] = cloudVal;
          localStorage.setItem('sfHs_' + m, cloudVal);
        }
      });
      const el = document.getElementById('hv-hs');
      if (el) el.textContent = G.hs[G.mode] || 0;

    } catch (e) {
      console.warn('[Wavedash] Cloud load error:', e);
    }
  }
  
  async function submitScore(mode, score) {
    if (!_ready || !IS_WAVEDASH()) return;
    const id = leaderboardIds[mode];
    if (!id) { console.warn('[Wavedash] No leaderboard ID for', mode); return; }

    try {
      const res = await Wavedash.uploadLeaderboardScore(id, Math.floor(score), true);
      if (res?.success) {
        console.log(`[Wavedash] Score submitted: ${score} on ${mode}, rank: ${res.data?.globalRank}`);
      } else {
        console.warn('[Wavedash] Score submit failed:', res);
      }
    } catch (e) {
      console.warn('[Wavedash] Score submit error:', e);
    }
    const statKey = { easy: STATS.bestEasy, medium: STATS.bestMedium, hard: STATS.bestHard }[mode];
    const current = Wavedash.getStat(statKey) || 0;
    if (score > current) {
      Wavedash.setStat(statKey, Math.floor(score), true);
    }
    Wavedash.setStat(STATS.totalScore, (Wavedash.getStat(STATS.totalScore) || 0) + Math.floor(score), true);
    await _saveCloudScores();
  }

  async function _saveCloudScores() {
    if (!_ready || !IS_WAVEDASH()) return;
    try {
      const payload = {
        easy:   G.hs.easy   || 0,
        medium: G.hs.medium || 0,
        hard:   G.hs.hard   || 0,
        saved:  Date.now(),
      };
      const bytes = new TextEncoder().encode(JSON.stringify(payload));
      await Wavedash.writeLocalFile('saves/scores.json', bytes);
      const res = await Wavedash.uploadRemoteFile('saves/scores.json');
      if (res?.success) console.log('[Wavedash] Scores synced to cloud.');
    } catch (e) {
      console.warn('[Wavedash] Cloud save error:', e);
    }
  }

  function unlockAchievement(localId) {
    if (!_ready || !IS_WAVEDASH()) return;
    const wdId = ACH_MAP[localId];
    if (!wdId) return;
    try {
      Wavedash.setAchievement(wdId, true);
      console.log(`[Wavedash] Achievement unlocked: ${wdId}`);
    } catch (e) {
      console.warn('[Wavedash] Achievement error:', e);
    }
  }

  function trackGameStart(mode) {
    if (!_ready || !IS_WAVEDASH()) return;
    try {
      const total = (Wavedash.getStat(STATS.totalGames) || 0) + 1;
      Wavedash.setStat(STATS.totalGames, total, true);
      Wavedash.updateUserPresence({
        status:  'Playing Snake Feast',
        details: `${mode.charAt(0).toUpperCase() + mode.slice(1)} mode`,
      }).catch(() => {});
    } catch (e) {
      console.warn('[Wavedash] trackGameStart error:', e);
    }
  }

  function trackFoodEaten(count = 1) {
    if (!_ready || !IS_WAVEDASH()) return;
    try {
      const total = (Wavedash.getStat(STATS.totalEaten) || 0) + count;
      Wavedash.setStat(STATS.totalEaten, total, true);
    } catch (e) {}
  }

  function trackGameEnd(mode, score, cause) {
    if (!_ready || !IS_WAVEDASH()) return;
    try {
      Wavedash.updateUserPresence({
        status:  'Snake Feast',
        details: `Scored ${score} on ${mode}`,
      }).catch(() => {});
    } catch (e) {}
  }

  return {
    init,
    submitScore,
    unlockAchievement,
    trackGameStart,
    trackFoodEaten,
    trackGameEnd,
    get isReady() { return _ready; },
    get isWavedash() { return IS_WAVEDASH(); },
  };

})();