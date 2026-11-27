/* leaderboard.js — Sleigh Catch online leaderboard UI
 * Exposes window.Leaderboard = { init, submit }
 * Never blocks play. Gracefully no-ops on file://.
 */
(function () {
  'use strict';

  var API          = '/api/scores';
  var STORAGE_KEY  = 'game.name';
  var UID_KEY      = 'game.uid';
  var TIMEOUT_MS   = 5000;

  /* ── helpers ──────────────────────────────────────────────────────────────── */

  function isFileProtocol() {
    return window.location.protocol === 'file:';
  }

  function savedName() {
    try { return localStorage.getItem(STORAGE_KEY) || ''; } catch { return ''; }
  }

  function saveName(n) {
    try { localStorage.setItem(STORAGE_KEY, n); } catch { /* ignore */ }
  }

  function getUid() {
    try {
      var id = localStorage.getItem(UID_KEY);
      if (!id) {
        // crypto.randomUUID is available in all modern browsers
        id = (crypto.randomUUID ? crypto.randomUUID()
          : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, function(c){
              return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
            }));
        localStorage.setItem(UID_KEY, id);
      }
      return id;
    } catch { return 'anonymous'; }
  }

  function fetchWithTimeout(url, opts) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS);
    return fetch(url, Object.assign({}, opts, { signal: ctrl.signal }))
      .finally(function () { clearTimeout(timer); });
  }

  /* ── render helpers ───────────────────────────────────────────────────────── */

  function renderTable(top, myName) {
    if (!top || top.length === 0) {
      return '<p class="lb-empty">No scores yet — be the first! 🎁</p>';
    }
    var rows = top.map(function (row, i) {
      var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
      var isMine = myName && row.name.toLowerCase() === myName.toLowerCase();
      var cls = isMine ? ' class="lb-mine"' : '';
      // textContent-safe: build text nodes, never innerHTML for user data
      return '<tr' + cls + '><td>' + medal + '</td>'
        + '<td class="lb-name">' + escHtml(row.name) + '</td>'
        + '<td class="lb-pts">' + Number(row.score) + '</td></tr>';
    }).join('');
    return '<table class="lb-table"><tbody>' + rows + '</tbody></table>';
  }

  // Minimal HTML escape (only for display — scores/ranks are numbers)
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function offlineMsg() {
    return '<p class="lb-offline">🌐 The online leaderboard works on your live site.</p>';
  }

  /* ── init ─────────────────────────────────────────────────────────────────── */

  function init() {
    var startScreen = document.getElementById('start-screen');
    if (!startScreen) return;
    // Guard: don't inject elements twice
    if (document.getElementById('lb-nick-wrap')) return;

    // ── nickname row ──────────────────────────────────────────────────────────
    var nickWrap = document.createElement('div');
    nickWrap.id = 'lb-nick-wrap';
    nickWrap.innerHTML =
      '<label for="lb-nick-input" class="lb-label">Your nickname</label>'
      + '<input id="lb-nick-input" class="lb-nick-input" type="text"'
      + ' maxlength="12" autocomplete="off" spellcheck="false"'
      + ' placeholder="e.g. FrostyElf" />'
      + '<p class="lb-privacy">Your nickname is public. Do not use your full name.</p>';
    startScreen.appendChild(nickWrap);

    var nickInput = nickWrap.querySelector('#lb-nick-input');
    nickInput.value = savedName();
    nickInput.addEventListener('input', function () {
      saveName(nickInput.value.trim());
    });
    // Ensure a UID is generated the moment the player focuses the nickname field
    nickInput.addEventListener('focus', function () { getUid(); }, { once: true });

    // ── Hall of Fame panel ────────────────────────────────────────────────────
    var hofWrap = document.createElement('div');
    hofWrap.id = 'lb-hof';
    hofWrap.innerHTML = '<h2 class="lb-heading">🏆 Hall of Fame</h2>'
      + '<div id="lb-hof-body"><p class="lb-loading">Loading…</p></div>';
    startScreen.appendChild(hofWrap);

    if (isFileProtocol()) {
      document.getElementById('lb-hof-body').innerHTML = offlineMsg();
      return;
    }

    fetchWithTimeout(API)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        document.getElementById('lb-hof-body').innerHTML =
          renderTable(data.top, savedName());
      })
      .catch(function () {
        document.getElementById('lb-hof-body').innerHTML = offlineMsg();
      });
  }

  /* ── submit ───────────────────────────────────────────────────────────────── */

  function submit(score, seconds) {
    var goScreen  = document.getElementById('gameover-screen');
    var resultDiv = document.getElementById('lb-go-result');

    // Create the result container inside game-over screen if not yet present
    if (!resultDiv && goScreen) {
      resultDiv = document.createElement('div');
      resultDiv.id = 'lb-go-result';
      // Insert before the replay button
      var replayBtn = document.getElementById('replay-btn');
      if (replayBtn) {
        goScreen.insertBefore(resultDiv, replayBtn);
      } else {
        goScreen.appendChild(resultDiv);
      }
    }

    if (!resultDiv) return;
    resultDiv.innerHTML = '<p class="lb-loading">Saving score…</p>';

    if (isFileProtocol() || !score || score <= 0) {
      resultDiv.innerHTML = offlineMsg();
      return;
    }

    var name = savedName();
    if (!name) {
      resultDiv.innerHTML = '<p class="lb-offline">Set a nickname on the start screen to appear on the leaderboard.</p>';
      return;
    }

    fetchWithTimeout(API, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: name, uid: getUid(), score: score, seconds: seconds }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.ok) {
          resultDiv.innerHTML = '<p class="lb-offline">Score not saved: ' + escHtml(data.error || 'error') + '</p>';
          return;
        }
        var rankLine = data.rank
          ? '<p class="lb-rank">🏅 You ranked <strong>#' + data.rank + '</strong>!</p>'
          : '';
        resultDiv.innerHTML = rankLine
          + '<h2 class="lb-heading">🏆 Hall of Fame</h2>'
          + renderTable(data.top, name);
      })
      .catch(function () {
        resultDiv.innerHTML = offlineMsg();
      });
  }

  /* ── expose ───────────────────────────────────────────────────────────────── */

  window.Leaderboard = { init: init, submit: submit };
}());
