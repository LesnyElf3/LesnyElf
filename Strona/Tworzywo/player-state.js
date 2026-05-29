(function(){
  const DEBUG = false;

  function initPlayer() {
    const player = document.getElementById('player');
    if (!player) {
      if (DEBUG) console.warn('Brak elementu #player');
      return;
    }

    const KEY_TIME = 'music-time';
    const KEY_PLAYING = 'music-playing';

    function readStorage() {
      try {
        return {
          t: parseFloat(localStorage.getItem(KEY_TIME) || 0),
          playing: localStorage.getItem(KEY_PLAYING) === '1'
        };
      } catch(e) { if (DEBUG) console.warn('localStorage niedostępne', e); return {t:0, playing:false}; }
    }

    function saveStorage() {
      try {
        localStorage.setItem(KEY_TIME, String(player.currentTime || 0));
        localStorage.setItem(KEY_PLAYING, player.paused ? '0' : '1');
        if (DEBUG) console.log('saved', player.currentTime, player.paused ? 'paused' : 'playing');
      } catch(e) { if (DEBUG) console.warn('Błąd zapisu localStorage', e); }
    }

    const stored = readStorage();
    if (!isNaN(stored.t) && stored.t > 0) {
      if (player.readyState >= 1) {
        if (player.duration && stored.t < player.duration) player.currentTime = stored.t;
      } else {
        player.addEventListener('loadedmetadata', function once() {
          if (player.duration && stored.t < player.duration) player.currentTime = stored.t;
        }, { once: true });
      }
    }

    if (stored.playing) {
      player.play().catch(err => { if (DEBUG) console.warn('Autoplay zablokowane lub błąd play():', err); });
    }

    window.addEventListener('beforeunload', saveStorage);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveStorage(); });
    setInterval(saveStorage, 1000);
    player.addEventListener('pause', saveStorage);
    player.addEventListener('play', saveStorage);

    if (DEBUG) console.log('player-state initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayer);
  } else {
    initPlayer();
  }
})();
