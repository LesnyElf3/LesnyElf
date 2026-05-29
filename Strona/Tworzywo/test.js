(function(){
  const player = document.getElementById('player');
  if (!player) { console.warn('Brak elementu #player'); return; }

  const KEY_TIME = 'music-time';
  const KEY_PLAYING = 'music-playing';

  function readStorage() {
    try {
      return {
        t: parseFloat(localStorage.getItem(KEY_TIME) || 0),
        playing: localStorage.getItem(KEY_PLAYING) === '1'
      };
    } catch(e) { console.warn('localStorage niedostępne', e); return {t:0, playing:false}; }
  }

  function saveStorage() {
    try {
      localStorage.setItem(KEY_TIME, String(player.currentTime || 0));
      localStorage.setItem(KEY_PLAYING, player.paused ? '0' : '1');
      // console.log('saved', player.currentTime, player.paused ? 'paused' : 'playing');
    } catch(e) { console.warn('Błąd zapisu localStorage', e); }
  }

  // Przywróć pozycję po załadowaniu metadanych
  const stored = readStorage();
  if (!isNaN(stored.t) && stored.t > 0) {
    if (player.readyState >= 1) { // HAVE_METADATA
      if (player.duration && stored.t < player.duration) player.currentTime = stored.t;
    } else {
      player.addEventListener('loadedmetadata', function once() {
        if (player.duration && stored.t < player.duration) player.currentTime = stored.t;
      }, { once: true });
    }
  }

  // Spróbuj wznowić jeśli wcześniej było odtwarzane
  if (stored.playing) {
    player.play().catch(err => {
      console.warn('Autoplay zablokowane lub błąd play():', err);
    });
  }

  // Zapisuj częściej i przy zmianach
  window.addEventListener('beforeunload', saveStorage);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveStorage(); });
  setInterval(saveStorage, 1000);
  player.addEventListener('pause', saveStorage);
  player.addEventListener('play', saveStorage);

  console.log('player-state.js zainicjalizowany');
})();
