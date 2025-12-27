// Fitroenie Script - v1.1 - Updated with Skelet Exercise
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAnalytics, isSupported as isAnalyticsSupported, setAnalyticsCollectionEnabled } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-analytics.js';
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  signInAnonymously
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  onValue,
  onDisconnect,
  serverTimestamp,
  get
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js';

console.log("FITROENIE SCRIPT V4 LOADED - Les 4 Updated");

const quizPicker = document.getElementById('quiz-picker');
const flashcardsPanel = document.getElementById('flashcards-panel');
const flashcardsDisplay = document.getElementById('flashcards-display');
const flashcardsPlayPanel = document.getElementById('flashcards-play-panel');
const flashcardsPlay = document.getElementById('flashcards-play');
const quizRunner = document.getElementById('quiz-runner');
const quizResults = document.getElementById('quiz-results');
const practiceDisplay = document.getElementById('practice-display');
const sectionTabs = document.getElementById('section-tabs');
const panels = document.querySelectorAll('[data-panel]');
const subjectSidebar = document.getElementById('subject-sidebar');
const progressBanner = document.getElementById('progress-banner');
const subjectSearch = document.getElementById('subject-search');
const subjectCatalog = document.getElementById('subject-catalog');
const loginBtn = document.getElementById('login-btn');
const account = document.getElementById('account');
const accountToggle = document.getElementById('account-toggle');
const accountPanel = document.getElementById('account-panel');
const accountLogin = document.getElementById('account-login');
const accountRegister = document.getElementById('account-register');
const homeLogin = document.getElementById('home-login');
const authModal = document.getElementById('auth-modal');
const authOverlay = document.getElementById('auth-overlay');
const authClose = document.getElementById('auth-close');
const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authSubmit = document.getElementById('auth-submit');
const authToggle = document.getElementById('auth-toggle');
const authMessage = document.getElementById('auth-message');
const googleBtn = document.getElementById('google-btn');
const views = document.querySelectorAll('.view');
const viewToggles = document.querySelectorAll('[data-view-target]');
const subjectMenu = document.getElementById('subject-menu');
const subjectMenuPanel = document.getElementById('subject-menu-panel');
const subjectMenuToggle = document.getElementById('subject-menu-toggle');
const gamemodeNav = document.getElementById('gamemode-nav');
const gamejoinModal = document.getElementById('gamejoin-modal');
const gamejoinOverlay = document.getElementById('gamejoin-overlay');
const gamejoinClose = document.getElementById('gamejoin-close');
const gamejoinForm = document.getElementById('gamejoin-form');
const gamejoinCode = document.getElementById('gamejoin-code');
const gamejoinSubmit = document.getElementById('gamejoin-submit');
const gamejoinCancel = document.getElementById('gamejoin-cancel');
const gamejoinMessage = document.getElementById('gamejoin-message');
const quizRunnerTitle = document.getElementById('quiz-runner-title');
const quizRunnerSubtitle = document.getElementById('quiz-runner-subtitle');
const quizRunnerStep = document.getElementById('quiz-runner-step');
const quizQuestionTitle = document.getElementById('quiz-question-title');
const quizQuestionText = document.getElementById('quiz-question-text');
const quizOptions = document.getElementById('quiz-options');
const quizPrev = document.getElementById('quiz-prev');
const quizNext = document.getElementById('quiz-next');
const quizSubmit = document.getElementById('quiz-submit');
const quizRunnerHint = document.getElementById('quiz-runner-hint');
const quizExit = document.getElementById('quiz-exit');
const quizResultsTitle = document.getElementById('quiz-results-title');
const quizResultsSubtitle = document.getElementById('quiz-results-subtitle');
const quizResultsList = document.getElementById('quiz-results-list');
const quizBack = document.getElementById('quiz-back');
const quizRetake = document.getElementById('quiz-retake');
const quizExitCompact = document.getElementById('quiz-exit-compact');
const activeSubjectHeading = document.getElementById('active-subject');
const profileHeading = document.getElementById('profile-heading');
const profileSubtitle = document.getElementById('profile-subtitle');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileStatus = document.getElementById('profile-status');
const profileQuizList = document.getElementById('profile-quiz-list');
const profileQuizCount = document.getElementById('profile-quiz-count');
const profileLogin = document.getElementById('profile-login');
const profileRegister = document.getElementById('profile-register');
const profileLogout = document.getElementById('profile-logout');
const profileBack = document.getElementById('profile-back');
const accountProfile = document.getElementById('account-profile');
const accountLogout = document.getElementById('account-logout');
const accountAvatar = document.getElementById('account-avatar');
const profileAvatarEl = document.getElementById('profile-avatar');
const profileAvatarInline = document.getElementById('profile-avatar-inline');
const profileUsername = document.getElementById('profile-username');
const profileAvatarGrid = document.getElementById('profile-avatar-grid');
const profileSave = document.getElementById('profile-save');
const profileUsernameField = document.getElementById('profile-username-field');
const avatarPicker = document.getElementById('avatar-picker');
const avatarChoose = document.getElementById('avatar-choose');

const fallbackFirebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_FIREBASE_AUTH_DOMAIN',
  projectId: 'YOUR_FIREBASE_PROJECT_ID',
  storageBucket: 'YOUR_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'YOUR_FIREBASE_APP_ID',
  measurementId: 'YOUR_FIREBASE_MEASUREMENT_ID'
};

const firebaseConfig = window.FITROENIE_FIREBASE_CONFIG || fallbackFirebaseConfig;

if (
  Object.values(firebaseConfig).some((v) => typeof v === 'string' && v.startsWith('YOUR_FIREBASE_'))
) {
  console.warn(
    'Firebase-configuratie ontbreekt. Zet een volledig config-object op window.FITROENIE_FIREBASE_CONFIG voor je script inlaadt.'
  );
}

function isValidFirebaseConfig(cfg) {
  if (!cfg || typeof cfg !== 'object') return false;
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
  return required.every((k) => cfg[k] && typeof cfg[k] === 'string' && !cfg[k].startsWith('YOUR_FIREBASE_'));
}

const firebaseAvailable = isValidFirebaseConfig(firebaseConfig);
let app = null;
let auth = null;
let provider = null;
let db = null;
if (firebaseAvailable) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
  db = getDatabase(app);
  isAnalyticsSupported()
    .then((ok) => {
      if (ok) {
        const analytics = getAnalytics(app);
        const enabled = !!window.FITROENIE_ANALYTICS_ENABLED;
        setAnalyticsCollectionEnabled(analytics, enabled);
      }
    })
    .catch((err) => console.warn('Analytics niet beschikbaar:', err));
}

function makeLoginCode() {
  let s = '';
  const len = 6;
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
  return s;
}

async function createGameSession(subjectName, setTitle) {
  if (!db) return null;
  if (auth && !auth.currentUser) {
    try { await signInAnonymously(auth); } catch {}
  }
  const hostId = auth?.currentUser?.uid || null;
  const sessionRef = push(ref(db, 'sessions'));
  const sessionId = sessionRef.key;
  let code = makeLoginCode();
  try {
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 5) {
      const snap = await get(ref(db, `codes/${code}`));
      exists = snap.exists();
      if (exists) {
        code = makeLoginCode();
      }
      attempts++;
    }
  } catch {}
  const now = Date.now();
  const session = {
    code,
    hostId,
    subjectName,
    setTitle,
    status: 'waiting',
    currentQuestionIndex: -1,
    questionStartTs: null,
    createdAt: now,
    expiresAt: now + 2 * 60 * 60 * 1000
  };
  let backendUnavailable = false;
  try {
    await set(sessionRef, session);
    await set(ref(db, `codes/${code}`), { sessionId, createdAt: now });
  } catch {
    backendUnavailable = true;
  }
  const url = new URL(window.location.href);
  url.searchParams.set('mode', 'game');
  url.searchParams.set('code', code);
  url.searchParams.set('subject', subjectName);
  url.searchParams.set('set', setTitle);
  return { sessionId, code, deepLink: url.toString(), backendUnavailable };
}

function renderQRCode(container, url) {
  if (!container) return;
  container.innerHTML = '';
  const img = document.createElement('img');
  img.alt = 'QR code om snel te joinen';
  img.width = 240;
  img.height = 240;
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}`;
  img.onerror = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 240, 240);
    ctx.strokeStyle = '#cfe1d6';
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, 228, 228);
    ctx.fillStyle = '#0f2016';
    ctx.font = 'bold 16px Manrope, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scan QR niet beschikbaar', 120, 100);
    ctx.fillText('Gebruik code:', 120, 126);
    const code = (new URL(url)).searchParams.get('code') || '';
    ctx.font = 'bold 20px Manrope, sans-serif';
    ctx.fillText(code, 120, 154);
    container.appendChild(canvas);
  };
  container.appendChild(img);
}

let activeGame = null;

async function startGamemode(setTitle) {
  const subject = getActiveSubject();
  if (!subject || !setTitle) return;
  const created = await createGameSession(subject.name, setTitle);
  if (!created) return;
  const { sessionId, code, deepLink, backendUnavailable } = created;
  activeGame = { sessionId, code, subjectName: subject.name, setTitle, index: -1, started: false, expected: 1 };
  const hostPanel = document.getElementById('gamemode-host-panel');
  const gmCodeText = document.getElementById('gm-code-text');
  const qrEl = document.getElementById('gamemode-qr');
  const playerCountEl = document.getElementById('gamemode-player-count');
  const leaderboardEl = document.getElementById('gamemode-leaderboard');
  const gmExpected = document.getElementById('gm-expected');
  const gmConnStatus = document.getElementById('gm-connection-status');
  const startBtn = document.getElementById('gamemode-start');
  hostPanel.hidden = false;
  gmCodeText.textContent = code;
  const gmCodeTop = document.getElementById('gm-code-top');
  if (gmCodeTop) gmCodeTop.textContent = `Code: ${code}`;
  renderQRCode(qrEl, deepLink);
  const statusEl = document.getElementById('gamemode-timer');
  if (backendUnavailable) {
    statusEl.textContent = 'Preview zonder realtime';
  }
  function setStartEnabled(enabled) {
    if (!startBtn) return;
    startBtn.disabled = !enabled;
    startBtn.classList.toggle('disabled', !enabled);
  }
  function updateConnectionUI(list, connectedCount) {
    const exp = Number(gmExpected?.value || activeGame.expected || 1);
    activeGame.expected = isNaN(exp) || exp < 1 ? 1 : exp;
    gmConnStatus.textContent = `${connectedCount}/${activeGame.expected} verbonden`;
    playerCountEl.textContent = `${list.length} spelers`;
    setStartEnabled(connectedCount >= activeGame.expected && activeGame.expected > 0);
  }
  gmExpected?.addEventListener('input', () => {
    const exp = Number(gmExpected.value);
    activeGame.expected = isNaN(exp) || exp < 1 ? 1 : exp;
  });
  const playersRef = ref(db, `sessions/${sessionId}/players`);
  onValue(playersRef, (snap) => {
    const val = snap.val() || {};
    const list = Object.values(val);
    const connectedCount = list.filter((p) => p.connected !== false).length;
    updateConnectionUI(list, connectedCount);
    if (connectedCount > 0) {
      const qrWrap = document.querySelector('.gamemode-host__qr');
      if (qrWrap) qrWrap.hidden = true;
      hostPanel.classList.add('fullscreen');
    }
    leaderboardEl.innerHTML = list
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 10)
      .map((p, i) => `<div class="lb-row"><span class="lb-rank">${i + 1}</span><span class="lb-name">${p.nickname || 'Speler'}</span><span class="lb-score">${p.score || 0}</span></div>`)
      .join('');
  });
  const sessionRef = ref(db, `sessions/${sessionId}`);
  onValue(sessionRef, async (snap) => {
    const s = snap.val() || {};
    if (s.status === 'finished') {
      const ps = await get(playersRef);
      const list = Object.values(ps.val() || {}).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 3);
      leaderboardEl.innerHTML = list
        .map((p, i) => `<div class="podium podium--${i + 1}"><span class="podium__place">${i + 1}</span><span class="podium__name">${p.nickname || 'Speler'}</span><span class="podium__score">${p.score || 0}</span></div>`)
        .join('');
      setTimeout(() => {
        hostPanel.classList.remove('fullscreen');
        const qrWrap = document.querySelector('.gamemode-host__qr');
        if (qrWrap) qrWrap.hidden = false;
        setActivePanel('quiz-panel');
      }, 1500);
    }
  });
  document.getElementById('gamemode-start')?.addEventListener('click', () => {
    if (!activeGame || activeGame.started || startBtn?.disabled) return;
    activeGame.started = true;
    update(ref(db, `sessions/${sessionId}`), { status: 'playing' }).then(() => broadcastQuestion(0));
  });
  document.getElementById('gamemode-next')?.addEventListener('click', () => {
    if (!activeGame || !activeGame.started) return;
    const next = (activeGame.index || 0) + 1;
    broadcastQuestion(next);
  });
  document.getElementById('gamemode-end')?.addEventListener('click', () => {
    if (!activeGame) return;
    update(ref(db, `sessions/${sessionId}`), { status: 'finished' });
  });
}

function broadcastQuestion(index) {
  const set = getActiveSet(getActiveSubject());
  if (!activeGame || !set) return;
  if (index >= set.questions.length) {
    update(ref(db, `sessions/${activeGame.sessionId}`), { status: 'finished' });
    return;
  }
  activeGame.index = index;
  const startTs = Date.now();
  update(ref(db, `sessions/${activeGame.sessionId}`), {
    currentQuestionIndex: index,
    questionStartTs: startTs
  });
  const timerEl = document.getElementById('gamemode-timer');
  let left = 30;
  timerEl.textContent = `${left}s`;
  const iv = setInterval(() => {
    left -= 1;
    if (left <= 0) {
      clearInterval(iv);
      timerEl.textContent = `0s`;
      resolveQuestion(index);
    } else {
      timerEl.textContent = `${left}s`;
    }
  }, 1000);
}

function computePoints(elapsedMs, correct) {
  if (!correct) return 0;
  const elapsedSec = Math.min(30, Math.max(0, Math.round(elapsedMs / 1000)));
  const timeFactor = (30 - elapsedSec) / 30;
  return Math.round(1000 * (0.5 + 0.5 * timeFactor));
}

async function resolveQuestion(index) {
  const subject = getActiveSubject();
  const set = getActiveSet(subject);
  if (!activeGame || !set) return;
  const answersSnap = await get(ref(db, `sessions/${activeGame.sessionId}/answers/${index}`));
  const answers = answersSnap.val() || {};
  const playersSnap = await get(ref(db, `sessions/${activeGame.sessionId}/players`));
  const players = playersSnap.val() || {};
  const updates = {};
  Object.entries(answers).forEach(([playerId, pick]) => {
    const correct = computePickCorrect(set.questions[index], pick);
    const points = computePoints(pick.elapsedMs || 30000, correct);
    updates[`sessions/${activeGame.sessionId}/answers/${index}/${playerId}/correct`] = correct;
    updates[`sessions/${activeGame.sessionId}/answers/${index}/${playerId}/points`] = points;
    const prev = players[playerId]?.score || 0;
    updates[`sessions/${activeGame.sessionId}/players/${playerId}/score`] = prev + points;
  });
  if (Object.keys(updates).length) {
    await update(ref(db), updates);
  }
}

function testComputePoints() {
  const p1 = computePoints(0, true);
  const p2 = computePoints(15000, true);
  const p3 = computePoints(30000, true);
  const p4 = computePoints(1000, false);
  return { p1, p2, p3, p4 };
}

function resolveQuestionOffline(index) {
  const subject = getActiveSubject();
  const set = getActiveSet(subject);
  if (!activeGame || !set) return;
  const code = activeGame.code;
  const answers = WOENIE_LOCAL_SESSIONS[code].answers[index] || {};
  Object.entries(answers).forEach(([playerId, pick]) => {
    const correct = computePickCorrect(set.questions[index], pick);
    const points = computePoints(pick.elapsedMs || 30000, correct);
    const prev = WOENIE_LOCAL_SESSIONS[code].players[playerId]?.score || 0;
    WOENIE_LOCAL_SESSIONS[code].players[playerId].score = prev + points;
  });
  activeGame.channel?.postMessage({ type: 'scores', index });
}

let activePlayer = null;

async function joinGamemodeByCode(code, nickname) {
  if (!code) return null;
  if (db) {
    try {
      const codeSnap = await get(ref(db, `codes/${code}`));
      if (codeSnap.exists()) {
        const { sessionId } = codeSnap.val();
        const sessionRef = ref(db, `sessions/${sessionId}`);
        const sessionSnap = await get(sessionRef);
        if (!sessionSnap.exists()) return null;
        const session = sessionSnap.val();
        const playerId = localStorage.getItem('woenie_player_id') || Math.random().toString(36).slice(2);
        localStorage.setItem('woenie_player_id', playerId);
        const playerRef = ref(db, `sessions/${sessionId}/players/${playerId}`);
        await set(playerRef, { nickname: nickname || 'Speler', joinedAt: Date.now(), score: 0, connected: true });
        try { onDisconnect(playerRef).update({ connected: false }); } catch {}
        activePlayer = { sessionId, playerId, subjectName: session.subjectName, setTitle: session.setTitle, offline: false };
        activeSubject = session.subjectName;
        setActivePanel('gamemode-panel');
        render();
        try {
          const mSnap = await get(ref(db, `sessions/${sessionId}/metrics/joins`));
          const prev = mSnap.val() || 0;
          await set(ref(db, `sessions/${sessionId}/metrics/joins`), prev + 1);
        } catch {}
        return session;
      }
    } catch {}
  }
  const chan = openGameChannel(code);
  if (!chan) return null;
  const playerId = localStorage.getItem('woenie_player_id') || Math.random().toString(36).slice(2);
  localStorage.setItem('woenie_player_id', playerId);
  activePlayer = { sessionId: `local-${code}`, playerId, subjectName: '', setTitle: '', offline: true, channel: chan, code };
  setActivePanel('gamemode-panel');
  render();
  return await new Promise((resolve) => {
    const timeout = setTimeout(() => resolve({ subjectName: '', setTitle: '' }), 800);
    chan.addEventListener('message', (e) => {
      const msg = e.data || {};
      if (msg.type === 'session-start') {
        activePlayer.subjectName = msg.subjectName || '';
        activePlayer.setTitle = msg.setTitle || '';
        clearTimeout(timeout);
        resolve({ subjectName: activePlayer.subjectName, setTitle: activePlayer.setTitle });
      }
    });
    chan.postMessage({ type: 'request-sync' });
    chan.postMessage({ type: 'join-request', nickname, playerId });
  });
}

function renderGamemodeHost(subject) {
  const panel = document.getElementById('gamemode-host-panel');
  if (!panel) return;
  const visible = !!activeGame;
  panel.hidden = !visible;
}

function renderGamemodePlayer(subject) {
  const panel = document.getElementById('gamemode-panel');
  if (!panel) return;
  const play = document.getElementById('gamemode-play');
  const joinBtn = document.getElementById('gamemode-join');
  const codeInput = document.getElementById('gamemode-code-input');
  const nnInput = document.getElementById('gamemode-nickname');
  const avatarEl = document.getElementById('gamemode-avatar');
  const qTitle = document.getElementById('gamemode-question-title');
  const qText = document.getElementById('gamemode-question-text');
  const optWrap = document.getElementById('gamemode-options');
  const playerTimer = document.getElementById('gamemode-player-timer');
  const params = new URLSearchParams(window.location.search);
  const codeParam = params.get('code') || '';
  if (codeParam && codeInput && !codeInput.value) codeInput.value = codeParam;
  if (auth?.currentUser?.photoURL && avatarEl) {
    avatarEl.src = auth.currentUser.photoURL;
    avatarEl.hidden = false;
  }
  if (auth?.currentUser?.displayName && nnInput && !nnInput.value) {
    nnInput.value = auth.currentUser.displayName;
  }
  const scanBtn = document.getElementById('gamemode-scan');
  scanBtn?.addEventListener('click', async () => {
    const supported = 'BarcodeDetector' in window;
    if (!supported) return;
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const tick = async () => {
        if (video.readyState >= 2) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          const bitm = canvas.transferToImageBitmap ? canvas.transferToImageBitmap() : null;
          const detections = await detector.detect(bitm || canvas);
          if (detections && detections[0]?.rawValue) {
            const url = new URL(detections[0].rawValue);
            const c = url.searchParams.get('code');
            if (c && codeInput) codeInput.value = c.toUpperCase();
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
        }
        requestAnimationFrame(tick);
      };
      tick();
    } catch {}
  });
  joinBtn?.addEventListener('click', async () => {
    const code = (codeInput?.value || '').toUpperCase().trim();
    const nick = (nnInput?.value || auth?.currentUser?.displayName || '').trim();
    const session = await joinGamemodeByCode(code, nick);
    if (!session) return;
    panel.hidden = false;
    play.hidden = false;
    panel.classList.add('fullscreen');
    if (activePlayer.offline) {
      const chan = activePlayer.channel;
      let startTs = Date.now();
      chan.addEventListener('message', (e) => {
        const msg = e.data || {};
        if (msg.type === 'session-start') {
          const subj = getActiveSubject();
          const set = subj ? getAllQuizSets(subj).find((x) => x.title === activePlayer.setTitle) : null;
          if (set) qTitle.textContent = formatSetTitle(set.title);
        } else if (msg.type === 'question') {
          const subj = getActiveSubject();
          const set = subj ? getAllQuizSets(subj).find((x) => x.title === activePlayer.setTitle) : null;
          if (!set) return;
          const idx = msg.index;
          const question = set.questions[idx];
          qTitle.textContent = formatSetTitle(set.title);
          qText.textContent = question.question;
          startTs = msg.startTs || Date.now();
          let left = Math.max(0, 30 - Math.floor((Date.now() - startTs) / 1000));
          playerTimer.textContent = `${left}s`;
          const iv = setInterval(() => {
            left = Math.max(0, 30 - Math.floor((Date.now() - startTs) / 1000));
            playerTimer.textContent = `${left}s`;
            if (left <= 0) clearInterval(iv);
          }, 1000);
          optWrap.querySelectorAll('.gm-option').forEach((btn) => {
            btn.onclick = null;
            btn.disabled = false;
            btn.addEventListener('click', () => {
              const choice = Number(btn.dataset.choice);
              const elapsedMs = Date.now() - startTs;
              if (elapsedMs > 30000) return;
              chan.postMessage({ type: 'answer', index: idx, playerId: activePlayer.playerId, choice, elapsedMs });
              optWrap.querySelectorAll('.gm-option').forEach((b) => (b.disabled = true));
            });
          });
        }
      });
    } else {
      const sessionRef = ref(db, `sessions/${activePlayer.sessionId}`);
      onValue(sessionRef, (snap) => {
        const s = snap.val() || {};
        const subject = getActiveSubject();
        const set = subject && s.setTitle ? getAllQuizSets(subject).find((x) => x.title === s.setTitle) : null;
        if (!set) return;
        const idx = s.currentQuestionIndex;
        if (typeof idx !== 'number' || idx < 0) return;
        const question = set.questions[idx];
        qTitle.textContent = formatSetTitle(set.title);
        qText.textContent = question.question;
        const startTs = s.questionStartTs || Date.now();
        let left = Math.max(0, 30 - Math.floor((Date.now() - startTs) / 1000));
        playerTimer.textContent = `${left}s`;
        const iv = setInterval(() => {
          left = Math.max(0, 30 - Math.floor((Date.now() - startTs) / 1000));
          playerTimer.textContent = `${left}s`;
          if (left <= 0) clearInterval(iv);
        }, 1000);
        optWrap.querySelectorAll('.gm-option').forEach((btn) => {
          btn.onclick = null;
          btn.disabled = false;
          btn.addEventListener('click', () => {
            const choice = Number(btn.dataset.choice);
            const elapsedMs = Date.now() - startTs;
            if (elapsedMs > 30000) return;
            set(ref(db, `sessions/${activePlayer.sessionId}/answers/${idx}/${activePlayer.playerId}`), {
              choice,
              elapsedMs
            });
            try {
              get(ref(db, `sessions/${activePlayer.sessionId}/metrics/submissions`)).then((mSnap) => {
                const prev = mSnap.val() || 0;
                set(ref(db, `sessions/${activePlayer.sessionId}/metrics/submissions`), prev + 1);
              });
            } catch {}
            optWrap.querySelectorAll('.gm-option').forEach((b) => (b.disabled = true));
          });
        });
      });
    }
  });
}

async function simulatePlayers(count = 25) {
  if (!activeGame) return;
  if (activeGame.offline) {
    const code = activeGame.code;
    for (let i = 0; i < count; i++) {
      const id = `sim-${i}-${Math.random().toString(36).slice(2, 6)}`;
      WOENIE_LOCAL_SESSIONS[code].players[id] = { nickname: `Tester ${i + 1}`, score: 0 };
    }
    const idx = typeof activeGame.index === 'number' ? activeGame.index : 0;
    for (let i = 0; i < count; i++) {
      const id = `sim-${i}-${Math.random().toString(36).slice(2, 6)}`;
      const elapsedMs = Math.floor(Math.random() * 30000);
      const choice = Math.floor(Math.random() * 4);
      const answers = WOENIE_LOCAL_SESSIONS[code].answers[idx] || (WOENIE_LOCAL_SESSIONS[code].answers[idx] = {});
      answers[id] = { choice, elapsedMs };
    }
    resolveQuestionOffline(idx);
  } else {
    const sessionId = activeGame.sessionId;
    for (let i = 0; i < count; i++) {
      const id = `sim-${i}-${Math.random().toString(36).slice(2, 6)}`;
      await set(ref(db, `sessions/${sessionId}/players/${id}`), { nickname: `Tester ${i + 1}`, score: 0, connected: true });
    }
    const idx = typeof activeGame.index === 'number' ? activeGame.index : 0;
    const startTsSnap = await get(ref(db, `sessions/${sessionId}/questionStartTs`));
    const startTs = startTsSnap.val() || Date.now();
    const submissions = [];
    for (let i = 0; i < count; i++) {
      const id = `sim-${i}-${Math.random().toString(36).slice(2, 6)}`;
      const elapsedMs = Math.floor(Math.random() * 30000);
      const choice = Math.floor(Math.random() * 4);
      submissions.push(set(ref(db, `sessions/${sessionId}/answers/${idx}/${id}`), { choice, elapsedMs }));
    }
    await Promise.all(submissions);
  }
}

function validateGameCode(code) {
  const raw = String(code || '').trim().toUpperCase();
  if (!raw) return { ok: false, reason: 'Voer een code in.' };
  const re = /^[0-9]{6}$/;
  if (!re.test(raw)) return { ok: false, reason: 'Ongeldige code. Gebruik precies 6 cijfers.' };
  return { ok: true, value: raw };
}

function openGamejoinModal() {
  if (!gamejoinModal || !gamejoinOverlay) return;
  gamejoinMessage.textContent = '';
  gamejoinModal.hidden = false;
  gamejoinOverlay.hidden = false;
  requestAnimationFrame(() => {
    gamejoinModal.classList.add('visible');
    gamejoinOverlay.classList.add('visible');
    gamejoinCode?.focus();
  });
  document.body.classList.add('modal-open');
  const hostBtn = document.getElementById('gamejoin-host');
  if (hostBtn) hostBtn.hidden = !activeQuizSetTitle;
  hostBtn?.addEventListener('click', () => {
    if (!activeQuizSetTitle) {
      gamejoinMessage.textContent = 'Kies eerst een quizset via Examens.';
      return;
    }
    startGamemode(activeQuizSetTitle);
    closeGamejoinModal();
  });
}

function closeGamejoinModal() {
  if (!gamejoinModal || !gamejoinOverlay) return;
  gamejoinModal.hidden = true;
  gamejoinOverlay.hidden = true;
  gamejoinModal.classList.remove('visible');
  gamejoinOverlay.classList.remove('visible');
  document.body.classList.remove('modal-open');
}

function setupGamemodeNav() {
  gamemodeNav?.addEventListener('click', openGamejoinModal);
  gamejoinClose?.addEventListener('click', closeGamejoinModal);
  gamejoinCancel?.addEventListener('click', closeGamejoinModal);
  gamejoinOverlay?.addEventListener('click', closeGamejoinModal);
  gamejoinForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = validateGameCode(gamejoinCode?.value);
    if (gamejoinCode) gamejoinCode.setAttribute('aria-invalid', String(!v.ok));
    if (!v.ok) {
      gamejoinMessage.textContent = v.reason;
      return;
    }
    if (gamejoinSubmit) {
      gamejoinSubmit.disabled = true;
      gamejoinSubmit.textContent = 'Bezig...';
    }
    gamejoinMessage.textContent = '';
    try {
      const session = await joinGamemodeByCode(v.value, '');
      if (!session) {
        gamejoinMessage.textContent = 'Code niet gevonden of verlopen.';
        if (gamejoinSubmit) {
          gamejoinSubmit.disabled = false;
          gamejoinSubmit.textContent = 'Meedoen';
        }
        return;
      }
      closeGamejoinModal();
      setActivePanel('gamemode-panel');
      render();
    } catch (err) {
      gamejoinMessage.textContent = 'Verbindingsprobleem. Probeer opnieuw.';
      console.error('[WoenieQuiz Gamemode] join error', err);
    } finally {
      if (gamejoinSubmit) {
        gamejoinSubmit.disabled = false;
        gamejoinSubmit.textContent = 'Meedoen';
      }
    }
  });
  gamejoinModal?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeGamejoinModal();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupGamemodeNav();
});
// Ensure listeners are bound even if DOMContentLoaded has already fired
try { setupGamemodeNav(); } catch {}
let authMode = 'login';
let lastFocusedElement = null;
let lastQuestionDelta = 0;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let activeFlashcardsCategory = null;
let activePracticeCategory = null;
let activePracticeExercise = null;

const STORAGE_KEY = 'fitroenie-anatomie';
const PROGRESS_NS = 'fitroenie-progress';
const allowedOsteologySections = ['osteo-upper', 'osteo-lower', 'osteo-proef'];
const VERSION_KEY = 'fitroenie-version';
const CURRENT_VERSION = '4';
const USER_PREFS_KEY = 'fitroenie-userprefs';
const AVAILABLE_AVATARS = ['Bob.png','Dog Boss.png','Happy.png','Jessy.png','Pingoe.png','Poes.png','Sniffy.png','Wolfje.png'];
let userPrefs = loadUserPrefs();
const FORCE_CLEAN = (localStorage.getItem(VERSION_KEY) !== CURRENT_VERSION);
if (FORCE_CLEAN) {
  localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (_) {}
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function formatSetTitle(raw = '') {
  if (!raw) return '';
  let title = raw
    .replace(/^[\s✅🟦🟧•–-]+/u, '')
    .replace(/^quiz\s*\d*\s*[–—-]?\s*/i, '')
    .replace(/^quiz\s*[–—-]?\s*/i, '')
    .replace(/\bmini\s*quiz\b[:\s-]*/i, '')
    .replace(/\s*[–—-]\s*\d+\s*(?:vragen|vrg|vrn)?[^)]*\)?$/i, '')
    .replace(/\s*\(\s*\d+\s*(?:vragen|vrg|vrn)[^)]*\)\s*$/i, '')
    .trim();

  if (!title) return raw.trim();
  return title;
}

function isOpenQuestion(q) {
  return !!q && (q.type === 'open' || (!q.options && (q.answerText || q.answerKeywords)));
}

function normalizeWords(str = '') {
  const clean = String(str)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .trim();
  return clean.split(/\s+/).filter((w) => w.length > 1);
}

function openAnswerCorrect(userText = '', correct, minMatches = 2) {
  const uSet = new Set(normalizeWords(userText));
  const cWords = Array.isArray(correct) ? correct : normalizeWords(String(correct || ''));
  let matches = 0;
  const seen = new Set();
  for (const w of cWords) {
    if (uSet.has(w) && !seen.has(w)) {
      seen.add(w);
      matches += 1;
      if (matches >= minMatches) break;
    }
  }
  return matches >= minMatches;
}

function pickAnswered(pick) {
  if (!pick) return false;
  if (typeof pick.choice === 'number') return true;
  if (typeof pick.text === 'string' && pick.text.trim().length) return true;
  return false;
}

function computePickCorrect(question, pick) {
  if (!question || !pick) return false;
  if (pick.forceCorrect) return true;
  if (typeof pick.choice === 'number' && typeof question.answerIndex === 'number') {
    return pick.choice === question.answerIndex;
  }
  if (isOpenQuestion(question)) {
    const correctText = question.answerText || (question.answerKeywords ? question.answerKeywords.join(' ') : '');
    const required = question.minMatches || 2;
    return openAnswerCorrect(pick.text || '', correctText, required);
  }
  return false;
}

function getNormalizedSectionsForDomain(domain) {
  if (!domain?.sections) return [];
  if (domain.id === 'osteologie') {
    return domain.sections.filter((sec) => allowedOsteologySections.includes(sec.id));
  }
  return domain.sections;
}

function createDefaultSubjects() {
  const vasteHoofdstukken = [
    {
      title: 'Osteologie – 20 examenvragen (A–D)',
      questions: [
        {
          question: 'Een salto gebeurt in…',
          options: [
            'Sagittaal vlak – sagitale as',
            'Frontaal vlak – sagittale as',
            'Sagittaal vlak – breedte-as',
            'Transversaal vlak – breedte-as'
          ],
          answerIndex: 2
        },
        {
          question: 'De incisura trochlearis bevindt zich op de…',
          options: ['Humerus', 'Radius', 'Ulna', 'Scapula'],
          answerIndex: 2
        },
        {
          question: 'De spina scapulae loopt uit in de…',
          options: ['Processus coracoideus', 'Acromion', 'Glenoid', 'Tuberculum supraglenoidale'],
          answerIndex: 1
        },
        {
          question: 'Welk werveltype bevat een foramen transversarium?',
          options: ['Thoracale wervel', 'Cervicale wervel', 'Lumbale wervel', 'Heiligbeen'],
          answerIndex: 1
        },
        {
          question: 'De atlas (C1) herken je aan…',
          options: ['Een dens', 'Een massief corpus', 'Een ringvormige bouw', 'Een lange processus spinosus'],
          answerIndex: 2
        },
        {
          question: 'De dens hoort bij de…',
          options: ['Atlas', 'Axis', 'C3', 'Th1'],
          answerIndex: 1
        },
        {
          question: 'De tuberositas tibiae dient voor…',
          options: [
            'Aanhechting hamstrings',
            'Aanhechting patellaband',
            'Aanhechting adductoren',
            'Aanhechting quadricepspees'
          ],
          answerIndex: 1
        },
        {
          question: 'De fovea capitis ligt op…',
          options: ['Humerus', 'Femur', 'Radius', 'Ulna'],
          answerIndex: 1
        },
        {
          question: 'De sustentaculum tali bevindt zich op de…',
          options: ['Talus', 'Naviculare', 'Calcaneus', 'Cuboideum'],
          answerIndex: 2
        },
        {
          question: 'De facies patellaris ligt op…',
          options: ['Tibia', 'Femur', 'Patella', 'Fibula'],
          answerIndex: 1
        },
        {
          question: 'De trochlea humeri articuleert met…',
          options: ['Caput radii', 'Incisura trochlearis', 'Fovea capitis radii', 'Olecranon'],
          answerIndex: 1
        },
        {
          question: 'Wat is GEEN functie van een tussenwervelschijf?',
          options: ['Schokdemping', 'Drukverdeling', 'Verbinding tussen wervelbogen', 'Beweeglijkheid verhogen'],
          answerIndex: 2
        },
        {
          question: 'Welk botstuk maakt GEEN deel uit van het os coxae?',
          options: ['Os pubis', 'Os ilium', 'Os sacrum', 'Os ischii'],
          answerIndex: 2
        },
        {
          question: 'Waar ligt de fossa subscapularis?',
          options: [
            'Op de ventrale zijde van de scapula',
            'Op de dorsale zijde van de scapula',
            'Op de humerus',
            'Op de clavicula'
          ],
          answerIndex: 0
        },
        {
          question: 'De processus spinosus is typisch…',
          options: ['Lateraal gericht', 'Ventraal gericht', 'Dorsaal gericht', 'Mediaal gericht'],
          answerIndex: 2
        },
        {
          question: 'Welk botarticulatie vormt het dak boven de schouderkop?',
          options: ['Glenoid', 'Tuberculum majus', 'Acromion', 'Spina scapulae'],
          answerIndex: 2
        },
        {
          question: 'Hoe herken je een thoracale wervel?',
          options: ['Geen corpus', 'Foramen transversarium', 'Facetten voor ribben', 'Massief corpus'],
          answerIndex: 2
        },
        {
          question: 'De caput humeri ligt…',
          options: ['Proximaal en mediaal', 'Proximaal en lateraal', 'Distaal en mediaal', 'Distaal en lateraal'],
          answerIndex: 0
        },
        {
          question: 'Welk bot draagt GEEN lichaamsgewicht?',
          options: ['Talus', 'Calcaneus', 'Tibia', 'Fibula'],
          answerIndex: 3
        },
        {
          question: 'Een rotatie om de lengte-as wordt uitgevoerd in het…',
          options: ['Frontaal vlak', 'Sagittaal vlak', 'Transversaal vlak', 'Horizontaal vlak'],
          answerIndex: 3
        }
      ]
    },
    {
      title: 'Algemeen Examen – 20 vragen + oplossingen',
      questions: [
        {
          question: 'Wat is een diarthrose?',
          options: [
            'Een botverbinding zonder gewrichtsspleet',
            'Een beweeglijke verbinding met gewrichtsspleet',
            'Een kraakbeenknobbel tussen botstukken',
            'Een volledig onbeweeglijk gewricht'
          ],
          answerIndex: 1
        },
        {
          question: 'Welk onderdeel produceert synoviaal vocht?',
          options: ['Ligamenten', 'Meniscus', 'Synoviale laag van het kapsel', 'Hyalien kraakbeen'],
          answerIndex: 2
        },
        {
          question: 'Wat is de functie van een discus of meniscus?',
          options: [
            'Spieractivatie verhogen',
            'Congruentie vergroten',
            'Beweging remmen',
            'Pezen glijden'
          ],
          answerIndex: 1
        },
        {
          question: 'Welke structuur hoort bij het scharniergewricht?',
          options: ['Draaiing rond lengte-as', 'Flexie en extensie', 'Circumductie', 'Laterale glijbeweging'],
          answerIndex: 1
        },
        {
          question: 'Het AC-gewricht (acromioclaviculair) is een…',
          options: ['Kogelgewricht', 'Vlak gewricht', 'Zadelgewricht', 'Rolgewricht'],
          answerIndex: 1
        },
        {
          question: 'Het SC-gewricht bevat een discus die zorgt voor…',
          options: [
            'Extra beweging',
            'Stabiliteit en congruentie',
            'Remming van elevatie',
            'Vermindering synoviaal vocht'
          ],
          answerIndex: 1
        },
        {
          question: 'Het ligamentum coracoacromiale heeft als functie…',
          options: ['Abductie remmen', 'Humeruskop fixeren', 'Endorotatie beperken', 'Circumductie toelaten'],
          answerIndex: 0
        },
        {
          question: 'Het glenohumerale kapsel wordt versterkt door…',
          options: [
            'Lig. collaterale ulnare',
            'Lig. glenohumeralia (superius/medium/inferius)',
            'Lig. cruciatum anterius',
            'Lig. deltoideum'
          ],
          answerIndex: 1
        },
        {
          question: 'Het ligamentum anulare radii…',
          options: [
            'Houdt de ulna op zijn plaats',
            'Houdt de radiuskop tegen de ulna',
            'Fixeert humerus aan radius',
            'Verbindt carpus met radius'
          ],
          answerIndex: 1
        },
        {
          question: 'Welk gewricht laat pronatie en supinatie toe?',
          options: [
            'Articulatio humeri',
            'Articulatio tibiofibularis',
            'Articulatio radio-ulnaris',
            'Articulatio coxae'
          ],
          answerIndex: 2
        },
        {
          question: 'Het kniegewricht bevat 2 kruisbanden om…',
          options: [
            'Rotatie te vergroten',
            'Luxatie te voorkomen',
            'Tibia te fixeren in alle posities',
            'Te dienen als schokdemper'
          ],
          answerIndex: 2
        },
        {
          question: 'De meniscus medialis is…',
          options: ['O-vormig en los', 'C-vormig en vaster', 'O-vormig en vast', 'C-vormig en los'],
          answerIndex: 1
        },
        {
          question: 'Het ligamentum collaterale laterale (LCL) verhindert…',
          options: ['Valgus', 'Varus', 'Flexie', 'Extensie'],
          answerIndex: 1
        },
        {
          question: 'Het talocrurale gewricht is een…',
          options: ['1-assig scharniergewricht', 'Kogelgewricht', 'Zadelgewricht', 'Rolgewricht'],
          answerIndex: 0
        },
        {
          question: 'Het ligamentum deltoideum (mediaal enkelband) bestaat uit…',
          options: ['2 delen', '3 delen', '4 delen', '5 delen'],
          answerIndex: 2
        },
        {
          question: 'Welk ligament wordt het meest gekwetst bij een inversietrauma?',
          options: [
            'Lig. talofibulare anterius (ATFL)',
            'Lig. talofibulare posterius',
            'Lig. deltoideum',
            'Lig. tibiofibulare posterius'
          ],
          answerIndex: 0
        },
        {
          question: 'De articulatio tibiofibularis proximalis is een…',
          options: ['Diarthrose met veel beweging', 'Amfiarthrose (weinig beweging)', 'Synchondrose', 'Syndesmose'],
          answerIndex: 1
        },
        {
          question: 'De distale tibiofibulaire verbinding is een…',
          options: ['Scharniergewricht', 'Trochoïde', 'Syndesmose', 'Ellipsoïde'],
          answerIndex: 2
        },
        {
          question: 'Wat is GEEN functie van het gewrichtskapsel?',
          options: [
            'Afsluiting gewrichtsholte',
            'Beweging sturen',
            'Synoviaal vocht aanmaken',
            'Stabiliteit leveren'
          ],
          answerIndex: 2
        },
        {
          question: 'Een zadelgewricht laat toe…',
          options: [
            'Rotatie rond lengte-as',
            'Flexie/extensie + abductie/adductie',
            'Enorme circumductie',
            'Enkel 1-as beweging'
          ],
          answerIndex: 1
        }
      ]
    }
  ];

  const [osteologieHoofdstuk, arthrologieHoofdstuk] = vasteHoofdstukken;

  const les2MC = [
    {
      question: 'Welke spier behoort NIET tot de groep van de borstspieren zoals beschreven in hoofdstuk 4?',
      options: ['Musculus Pectoralis Major', 'Musculus Serratus Anterior', 'Musculus Subclavius', 'Musculus Trapezius'],
      answerIndex: 3
    },
    {
      question: 'De Musculus Pectoralis Major heeft drie delen. Welk deel ontspringt aan de buikspier aponeurose (rectusschede)?',
      options: ['Pars Clavicularis', 'Pars Sternocostalis', 'Pars Abdominalis', 'Pars Acromialis'],
      answerIndex: 2
    },
    {
      question: 'Wat is de insertie van de Musculus Pectoralis Major?',
      options: ['Crista Tuberculi Minoris', 'Crista Tuberculi Majoris (Ventraal op humerus)', 'Processus Coracoideus', 'Tuberositas Deltoidea'],
      answerIndex: 1
    },
    {
      question: 'Welke functie heeft de Musculus Pectoralis Major?',
      options: ['Abductie', 'Retroversie', 'Exorotatie', 'Adductie en Endorotatie'],
      answerIndex: 3
    },
    {
      question: 'Wat is de specifieke functie van de Musculus Subclavius?',
      options: ['Elevatie van de clavicula', 'Stabilisatie van de Clavicula in het Sternoclaviculair gewricht', 'Protractie van de scapula', 'Depressie van de humerus'],
      answerIndex: 1
    },
    {
      question: 'Welke spier behoort tot de schoudergordel?',
      options: ['Musculus Deltoideus', 'Musculus Supraspinatus', 'Musculus Rhomboideus Major', 'Musculus Teres Major'],
      answerIndex: 2
    },
    {
      question: 'De Musculus Latissimus Dorsi heeft een zeer brede oorsprong. Welke structuur hoort hierbij?',
      options: ['Manubrium Sterni', 'Fascia Thoracolumbalis', 'Fossa Subscapularis', 'Spina Scapulae'],
      answerIndex: 1
    },
    {
      question: 'Wat is de insertie van de Musculus Latissimus Dorsi?',
      options: ['Crista Tuberculi Majoris', 'Crista Tuberculi Minoris (Ventraal Humerus)', 'Tuberculum Majus', 'Tuberculum Minus'],
      answerIndex: 1
    },
    {
      question: 'Welke functie heeft de Musculus Latissimus Dorsi op de schouder zelf (naast adductie en endorotatie)?',
      options: ['Ondersteunt Elevatie en Protractie', 'Ondersteunt Depressie en Retractie', 'Ondersteunt Abductie en Anteversie', 'Ondersteunt Exorotatie'],
      answerIndex: 1
    },
    {
      question: 'Welke spier bedekt de schouderkop en bestaat uit een Pars Clavicularis, Pars Acromialis en Pars Spinalis?',
      image: 'Les 2 Myologie/Deltoideus.png',
      imageAlt: 'Deltoideus',
      options: ['Musculus Trapezius', 'Musculus Deltoideus', 'Musculus Pectoralis Major', 'Musculus Supraspinatus'],
      answerIndex: 1
    },
    {
      question: 'Welke functie heeft de Pars Acromialis (laterale deel) van de Musculus Deltoideus?',
      options: ['Adductie', 'Abductie tot horizontaal (Horizontale abductie)', 'Anteflexie', 'Endorotatie'],
      answerIndex: 1
    },
    {
      question: 'Wat is de oorsprong van de Musculus Supraspinatus?',
      options: ['Fossa Infraspinata', 'Spina Scapulae', 'Fossa Supraspinata Scapulae', 'Margo Lateralis'],
      answerIndex: 2
    },
    {
      question: 'Welke spier ligt onder de spina scapulae in de Fossa Infraspinata en hecht aan op het Tuberculum Majus?',
      image: 'Les 2 Myologie/Infraspinatus.png',
      imageAlt: 'Infraspinatus',
      options: ['Musculus Supraspinatus', 'Musculus Teres Minor', 'Musculus Infraspinatus', 'Musculus Subscapularis'],
      answerIndex: 2
    },
    {
      question: 'Wat is de functie van de Musculus Teres Minor?',
      options: ['Endorotatie en Adductie', 'Exorotatie en Adductie', 'Abductie en Exorotatie', 'Retroversie en Endorotatie'],
      answerIndex: 1
    },
    {
      question: 'De Musculus Teres Major heeft dezelfde functie als de Latissimus Dorsi (endorotatie en adductie). Waar is zijn insertie?',
      options: ['Tuberculum Minus', 'Tuberculum Majus', 'Crista Tuberculi Majoris', 'Tuberositas Deltoidea'],
      answerIndex: 2
    },
    {
      question: 'Welke spier vult de Fossa Subscapularis (aan de ribbenkast-zijde) en hecht aan op het Tuberculum Minus?',
      image: 'Les 2 Myologie/Subscapularis.png',
      imageAlt: 'Subscapularis',
      options: ['Musculus Serratus Anterior', 'Musculus Subscapularis', 'Musculus Pectoralis Minor', 'Musculus Infraspinatus'],
      answerIndex: 1
    },
    {
      question: 'Wat is de functie van het Craniale deel van de Musculus Subscapularis?',
      options: ['Exorotatie en Abductie', 'Endorotatie en Abductie', 'Endorotatie en Adductie', 'Retroversie'],
      answerIndex: 1
    },
    {
      question: 'Welke vier spieren vormen de Rotator Cuff?',
      image: 'Les 2 Myologie/RC.png',
      imageAlt: 'Rotator Cuff',
      options: ['Supraspinatus, Infraspinatus, Teres Major, Subscapularis', 'Supraspinatus, Infraspinatus, Teres Minor, Subscapularis', 'Deltoideus, Infraspinatus, Teres Minor, Subscapularis', 'Supraspinatus, Infraspinatus, Teres Minor, Subclavius'],
      answerIndex: 1
    },
    {
      question: 'De Musculus Deltoideus bestaat uit drie delen. Welke combinatie van functies hoort bij de Pars Spinalis (het dorsale deel)?',
      options: ['Abductie tot horizontaal', 'Adductie, Endorotatie en Anteflexie', 'Adductie, Exorotatie en Retroflexie', 'Abductie, Endorotatie en Retroflexie'],
      answerIndex: 2
    },
    {
      question: 'De Musculus Infraspinatus heeft een craniaal en een caudaal deel met licht verschillende functies. Welke functie voert het Caudale Deel uit (naast exorotatie)?',
      options: ['Abductie', 'Adductie', 'Endorotatie', 'Anteversie'],
      answerIndex: 1
    }
  ];

  const les2Myo = {
    title: 'Myologie – Les 2 (20 vragen)',
    description: '4. Borstspieren t.e.m Schouderspieren',
    questions: les2MC
  };

  const les3MyoMC = [
    {
      question: 'Welke spier, hier zichtbaar aan de achterzijde van de arm, zorgt voor extensie van de elleboog en adductie van de schouder?',
      image: 'Les 3 Myologie/Triceps.png',
      imageAlt: 'Triceps Brachii',
      options: ['Musculus Biceps Brachii', 'Musculus Brachialis', 'Musculus Triceps Brachii', 'Musculus Deltoideus'],
      answerIndex: 2
    },
    {
      question: 'Wat is de insertie van de Musculus Triceps Brachii?',
      options: ['Tuberositas Radii', 'Olecranon', 'Processus Coronoideus', 'Tuberositas Ulnae'],
      answerIndex: 1
    },
    {
      question: 'Waar ontspringt het Caput Longum van de Musculus Triceps Brachii?',
      options: ['Tuberculum Supraglenoidale', 'Tuberculum Infraglenoidale scapulae', 'Processus Coracoideus', 'Epicondylus Lateralis'],
      answerIndex: 1
    },
    {
      question: 'Welke kleine spier helpt bij de extensie van de elleboog en ontspringt aan de Epicondylus Lateralis?',
      options: ['Musculus Anconeus', 'Musculus Supinator', 'Musculus Pronator Teres', 'Musculus Palmaris Longus'],
      answerIndex: 0
    },
    {
      question: 'Welke tweekoppige spier zie je hier aan de voorzijde van de bovenarm?',
      image: 'Les 3 Myologie/Biceps.png',
      imageAlt: 'Biceps Brachii',
      options: ['Musculus Brachialis', 'Musculus Triceps Brachii', 'Musculus Biceps Brachii', 'Musculus Coracobrachialis'],
      answerIndex: 2
    },
    {
      question: 'Welke functie heeft de Musculus Biceps Brachii in de elleboog (naast flexie)?',
      options: ['Pronatie', 'Supinatie', 'Adductie', 'Extensie'],
      answerIndex: 1
    },
    {
      question: 'Wat is de insertie van de Musculus Brachialis?',
      options: ['Tuberositas Radii', 'Tuberositas Ulnae', 'Processus Styloideus Radii', 'Olecranon'],
      answerIndex: 1
    },
    {
      question: 'Welke spier ligt diep onder de biceps brachii en zorgt puur voor flexie van de elleboog?',
      image: 'Les 3 Myologie/Brachialis.png',
      imageAlt: 'Brachialis',
      options: ['Musculus Coracobrachialis', 'Musculus Brachialis', 'Musculus Pronator Teres', 'Musculus Triceps Brachii'],
      answerIndex: 1
    },
    {
      question: 'De Musculus Coracobrachialis heeft drie functies. Welke hoort erbij?',
      options: ['Abductie', 'Retroversie', 'Adductie', 'Supinatie'],
      answerIndex: 2
    },
    {
      question: 'Welke spier zorgt voor pronatie en flexie en ontspringt o.a. aan de Processus Coronoideus van de Ulna?',
      options: ['Musculus Supinator', 'Musculus Pronator Quadratus', 'Musculus Pronator Teres', 'Musculus Palmaris Longus'],
      answerIndex: 2
    },
    {
      question: 'Welke spier loopt diagonaal over de voorarm en zorgt voor pronatie?',
      image: 'Les 3 Myologie/PronatorTeres.png',
      imageAlt: 'Pronator Teres',
      options: ['Musculus Flexor Carpi Radialis', 'Musculus Palmaris Longus', 'Musculus Pronator Teres', 'Musculus Brachioradialis'],
      answerIndex: 2
    },
    {
      question: 'Wat is de insertie van de Musculus Flexor Carpi Radialis?',
      options: ['Basis Metacarpalis II', 'Basis Metacarpalis V', 'Os Pisiforme', 'Aponeurosis Palmaris'],
      answerIndex: 0
    },
    {
      question: 'Welke spier hecht aan op het Os Pisiforme en de Basis van Metacarpalis V?',
      options: ['Musculus Flexor Carpi Radialis', 'Musculus Flexor Carpi Ulnaris', 'Musculus Extensor Carpi Ulnaris', 'Musculus Palmaris Longus'],
      answerIndex: 1
    },
    {
      question: 'Welke functie heeft de Musculus Flexor Digitorum Superficialis?',
      options: ['Flexie van de duim', 'Extensie van de vingers', 'Flexie van Phalanx II tot V', 'Pronatie van de voorarm'],
      answerIndex: 2
    },
    {
      question: 'Welke lange, slanke spier (hier rood gekleurd) loopt centraal over de voorarm naar de handpalm?',
      image: 'Les 3 Myologie/Palmaris.png',
      imageAlt: 'Palmaris Longus',
      options: ['Musculus Flexor Carpi Ulnaris', 'Musculus Palmaris Longus', 'Musculus Flexor Carpi Radialis', 'Musculus Pronator Teres'],
      answerIndex: 1
    },
    {
      question: 'Welke spier zorgt voor flexie van de duim (Distale Phalanx)?',
      options: ['Musculus Flexor Pollicis Longus', 'Musculus Abductor Pollicis Longus', 'Musculus Flexor Digitorum Profundus', 'Musculus Extensor Pollicis Brevis'],
      answerIndex: 0
    },
    {
      question: 'Welke vierkante spier ligt diep in de pols en zorgt voor pronatie?',
      image: 'Les 3 Myologie/PronatorQuad.png',
      imageAlt: 'Pronator Quadratus',
      options: ['Musculus Supinator', 'Musculus Pronator Teres', 'Musculus Pronator Quadratus', 'Musculus Flexor Retinaculum'],
      answerIndex: 2
    },
    {
      question: 'Wat is de functie van de Musculus Supinator?',
      options: ['Pronatie', 'Supinatie', 'Flexie', 'Extensie'],
      answerIndex: 1
    },
    {
      question: 'De Musculus Flexor Digitorum Profundus hecht aan op:',
      options: ['De middenhandsbeentjes', 'De proximale phalangen II-V', 'De distale phalangen II-V', 'De carpale beentjes'],
      answerIndex: 2
    },
    {
      question: 'Welke spier heeft zijn oorsprong op de Epicondylus Lateralis en wikkelt zich om de radius om te supineren?',
      options: ['Musculus Pronator Teres', 'Musculus Anconeus', 'Musculus Supinator', 'Musculus Brachialis'],
      answerIndex: 2
    }
  ];

  const les3Myo = {
    title: 'Myologie – Les 3 (20 vragen)',
    questions: les3MyoMC
  };

  const les4MyoMC = [
    {
      question: 'Welke spier, die goed zichtbaar is bij een "Hammer Curl", zie je hier aan de radiale zijde van de onderarm?',
      description: 'Afbeelding: Brachioradialis.png',
      image: 'Les 4 Myologie/Brachioradialis.png',
      imageAlt: 'Brachioradialis',
      options: ['Musculus Extensor Carpi Radialis Longus', 'Musculus Brachioradialis', 'Musculus Supinator', 'Musculus Extensor Carpi Ulnaris'],
      answerIndex: 1
    },
    {
      question: 'Wat is de insertie van de Musculus Brachioradialis?',
      options: ['Basis Metacarpalis II', 'Basis Metacarpalis III', 'Processus Styloideus', 'Tuberositas Radii'],
      answerIndex: 2
    },
    {
      question: 'Welke functie hebben alle drie de radiale spieren (Brachioradialis, Extensor Carpi Radialis Longus & Brevis) gemeen ter hoogte van de elleboog?',
      options: ['Extensie', 'Flexie', 'Alleen Supinatie', 'Alleen Pronatie'],
      answerIndex: 1
    },
    {
      question: 'Wat is de insertie van de Musculus Extensor Carpi Radialis Longus?',
      options: ['Dorsaal op basis Metacarpalis II', 'Dorsaal op basis Metacarpalis III', 'Processus Styloideus', 'Os Trapezium'],
      answerIndex: 0
    },
    {
      question: 'Welke functie hebben de radiale spieren (Brachioradialis en de Carpi Radialis spieren) gemeen ter hoogte van de elleboog?',
      options: ['Extensie', 'Flexie', 'Alleen Supinatie', 'Alleen Pronatie'],
      answerIndex: 1
    },
    {
      question: 'Welke spier loopt centraal over de dorsale zijde van de onderarm en splitst zich in vier pezen naar de vingers?',
      description: 'Afbeelding: ExtensorDigitorum.png',
      image: 'Les 4 Myologie/ExtensorDigitorum.png',
      imageAlt: 'Extensor Digitorum',
      options: ['Musculus Extensor Digiti Minimi', 'Musculus Extensor Digitorum', 'Musculus Extensor Pollicis Longus', 'Musculus Extensor Indicis'],
      answerIndex: 1
    },
    {
      question: 'Wat is de oorsprong van de Musculus Extensor Digitorum?',
      options: ['Epicondylus Medialis Humeri', 'Epicondylus Lateralis Humeri', 'Facies Posterior Ulnae', 'Membrana Interossea'],
      answerIndex: 1
    },
    {
      question: 'Welke spier zorgt specifiek voor de extensie en abductie (spreiding) van de pink (Digitorum V)?',
      options: ['Musculus Extensor Carpi Ulnaris', 'Musculus Extensor Digiti Minimi', 'Musculus Extensor Digitorum', 'Musculus Abductor Pollicis Longus'],
      answerIndex: 1
    },
    {
      question: 'Wat is de insertie van de Musculus Extensor Carpi Ulnaris?',
      options: ['Os Pisiforme', 'Basis Metacarpalis II', 'Dorsale vlak van Metacarpalis V', 'Dorsale aponeurose van de pink'],
      answerIndex: 2
    },
    {
      question: 'Welke beweging maakt de Musculus Extensor Carpi Ulnaris in de pols (carpus) naast extensie?',
      options: ['Radiale deviatie', 'Ulnaire deviatie', 'Pronatie', 'Supinatie'],
      answerIndex: 1
    },
    {
      question: 'Welke diepe spier (hier zichtbaar) zorgt voor de extensie van de duim en hecht aan op de Eindphalanx?',
      description: 'Afbeelding: ExtensorPollicisLongus.png',
      image: 'Les 4 Myologie/ExtensorPollicisLongus.png',
      imageAlt: 'Extensor Pollicis Longus',
      options: ['Musculus Extensor Pollicis Brevis', 'Musculus Abductor Pollicis Longus', 'Musculus Extensor Pollicis Longus', 'Musculus Extensor Indicis'],
      answerIndex: 2
    },
    {
      question: 'Wat is de insertie van de Musculus Extensor Indicis?',
      options: ['Dorsale Aponeurose Digitorum II (Wijsvinger)', 'Dorsale Aponeurose Digitorum V (Pink)', 'Basis Metacarpalis II', 'Eindphalanx Duim'],
      answerIndex: 0
    },
    {
      question: 'Welke functie heeft de Musculus Extensor Pollicis Longus in het polsgewricht?',
      options: ['Palmaire Flexie en Ulnaire Deviatie', 'Dorsale Flexie en Radiale Abductie', 'Dorsale Flexie en Ulnaire Deviatie', 'Palmaire Flexie en Radiale Abductie'],
      answerIndex: 1
    },
    {
      question: 'Waar ontspringt de Musculus Extensor Indicis?',
      options: ['Epicondylus Lateralis', 'Facies Posterior Radii', 'Facies Posterior Ulna en Membrana Interossea', 'Processus Styloideus'],
      answerIndex: 2
    },
    {
      question: 'Welke spier loopt naar de duimbasis, hecht aan op Basis Metacarpalis Pollicis en zorgt voor abductie van de duim?',
      description: 'Afbeelding: AbductorPollicisLongus.png',
      image: 'Les 4 Myologie/AbductorPollicisLongus.png',
      imageAlt: 'Abductor Pollicis Longus',
      options: ['Musculus Abductor Pollicis Longus', 'Musculus Extensor Pollicis Brevis', 'Musculus Extensor Pollicis Longus', 'Musculus Supinator'],
      answerIndex: 0
    },
    {
      question: 'Wat is de insertie van de Musculus Extensor Pollicis Brevis?',
      options: ['Basis Metacarpalis Pollicis', 'Proximale Phalanx Duim', 'Distale Phalanx Duim', 'Os Trapezium'],
      answerIndex: 1
    },
    {
      question: 'Welke spier heeft als functie Supinatie naast bewegingen van de duim en pols?',
      options: ['Musculus Extensor Pollicis Brevis', 'Musculus Abductor Pollicis Longus', 'Musculus Extensor Indicis', 'Musculus Extensor Digiti Minimi'],
      answerIndex: 1
    },
    {
      question: 'De Musculus Extensor Pollicis Brevis zorgt voor abductie en repositie in welk gewricht?',
      options: ['Articulatio Cubiti (Elleboog)', 'Articulatio Radiocarpalis (Pols)', 'Articulatio Sellaris (Zadelgewricht duim)', 'Articulatio Humeri (Schouder)'],
      answerIndex: 2
    },
    {
      question: 'Welke spier ligt net distaal van de Abductor Pollicis Longus en loopt naar het eerste kootje (proximale phalanx) van de duim?',
      description: 'Afbeelding: ExtensorPollicisBrevis.png',
      image: 'Les 4 Myologie/ExtensorPollicisBrevis.png',
      imageAlt: 'Extensor Pollicis Brevis',
      options: ['Musculus Extensor Pollicis Longus', 'Musculus Extensor Pollicis Brevis', 'Musculus Extensor Indicis', 'Musculus Flexor Pollicis Longus'],
      answerIndex: 1
    },
    {
      question: 'Welke twee spieren in deze lijst hebben hun oorsprong (deels) op de Facies Posterior Radii?',
      options: ['Extensor Pollicis Longus en Extensor Indicis', 'Abductor Pollicis Longus en Extensor Pollicis Brevis', 'Extensor Digitorum en Extensor Digiti Minimi', 'Brachioradialis en Extensor Carpi Radialis Longus'],
      answerIndex: 1
    }
  ];

  const les4Myo = {
    title: 'Myologie – Les 4',
    description: 'Radiale Spieren VD Onderarm t.e.m. Diepe Radiale Voorarmspieren',
    questions: les4MyoMC
  };

  const les5MyoMC = [
    {
      question: 'Welke spiergroep, hier zichtbaar aan de binnenzijde van het bekken en de lendenwervels, is de krachtigste heupbuiger (flexor) en bestaat uit de M. Iliacus en M. Psoas Major?',
      image: 'Les 5 Myologie/Iliopsoas.png',
      imageAlt: 'Iliopsoas',
      options: ['Musculus Sartorius', 'Musculus Quadriceps Femoris', 'Musculus Iliopsoas', 'Musculus Pectineus'],
      answerIndex: 2
    },
    {
      question: 'Wat is de insertie van de Musculus Iliopsoas (Iliacus + Psoas Major)?',
      options: ['Trochanter Major', 'Trochanter Minor', 'Spina Iliaca Anterior Superior', 'Tuberositas Tibiae'],
      answerIndex: 1
    },
    {
      question: 'Welke drie spieren vormen samen de Pes Anserinus (Ganzenpoot) aan de mediale zijde van de tibia?',
      options: ['Sartorius, Gracilis, Semimembranosus', 'Rectus Femoris, Vastus Medialis, Sartorius', 'Sartorius, Gracilis, Semitendinosus', 'Semitendinosus, Semimembranosus, Biceps Femoris'],
      answerIndex: 2
    },
    {
      question: 'Wat is de functie van de Musculus Psoas Minor bij de mens?',
      options: ['Flexie van de heup', 'Geen duidelijke functie', 'Exorotatie', 'Retroversie van het bekken'],
      answerIndex: 1
    },
    {
      question: 'Welke spiergroep aan de voorzijde van het dijbeen zorgt voor extensie van de knie?',
      image: 'Les 5 Myologie/Quadriceps.png',
      imageAlt: 'Quadriceps',
      options: ['Hamstrings', 'Adductoren', 'Musculus Quadriceps Femoris', 'Musculus Triceps Surae'],
      answerIndex: 2
    },
    {
      question: 'De Musculus Quadriceps Femoris bestaat uit vier koppen. Welke kop heeft ook een functie over het heupgewricht (flexie) omdat hij ontspringt aan de Spina Iliaca Anterior Inferior?',
      options: ['Musculus Vastus Medialis', 'Musculus Vastus Lateralis', 'Musculus Rectus Femoris', 'Musculus Vastus Intermedius'],
      answerIndex: 2
    },
    {
      question: 'Wat is de gemeenschappelijke insertie van de Musculus Quadriceps Femoris?',
      options: ['Caput Fibulae', 'Condylus Medialis Tibiae', 'Tuberositas Tibiae (via de Patella)', 'Pes Anserinus'],
      answerIndex: 2
    },
    {
      question: 'Welke lange, slanke spier bevindt zich het meest mediaal aan het bovenbeen en loopt helemaal door tot aan de Pes Anserinus op het scheenbeen?',
      image: 'Les 5 Myologie/Gracialis.png',
      imageAlt: 'Gracilis',
      options: ['Musculus Adductor Longus', 'Musculus Gracilis', 'Musculus Pectineus', 'Musculus Sartorius'],
      answerIndex: 1
    },
    {
      question: 'Welke grote spier aan de binnenzijde van het dijbeen heeft een insertie op het Tuberculum Adductorium en de hele Linea Aspera?',
      image: 'Les 5 Myologie/AdductorMagnus.png',
      imageAlt: 'Adductor Magnus',
      options: ['Musculus Adductor Longus', 'Musculus Adductor Magnus', 'Musculus Gracilis', 'Musculus Pectineus'],
      answerIndex: 1
    },
    {
      question: 'Welke functie heeft de Musculus Pectineus naast adductie van het bovenbeen?',
      options: ['Extensie van de heup', 'Flexie en exorotatie van de heup', 'Flexie en endorotatie van de heup', 'Extensie en endorotatie van de heup'],
      answerIndex: 1
    },
    {
      question: 'Welke bilspier is cruciaal voor het stabiliseren van het bekken tijdens het lopen (voorkomt afzakken bekken) en zorgt voor abductie?',
      options: ['Musculus Gluteus Maximus', 'Musculus Gluteus Medius', 'Musculus Piriformis', 'Musculus Quadratus Femoris'],
      answerIndex: 1
    },
    {
      question: 'Wat is de insertie van de Musculus Gluteus Maximus?',
      options: ['Trochanter Minor', 'Alleen Tuberositas Glutealis', 'Tuberositas Glutealis en Tractus Iliotibialis', 'Trochanter Major'],
      answerIndex: 2
    },
    {
      question: 'Welke spier spant de Fascia Latae op en helpt bij flexie, abductie en extensie van de knie?',
      options: ['Musculus Tensor Fascia Latae', 'Musculus Rectus Femoris', 'Musculus Sartorius', 'Musculus Gluteus Minimus'],
      answerIndex: 0
    },
    {
      question: 'De spieren Gemellus Superior, Gemellus Inferior, Obturator Internus en Quadratus Femoris hebben allemaal als hoofdfunctie:',
      options: ['Flexie van de heup', 'Abductie van de heup', 'Exorotatie van de heup', 'Endorotatie van de heup'],
      answerIndex: 2
    },
    {
      question: 'Op welke structuur hechten de Musculus Piriformis, Obturator Internus en de Gemelli (indirect via Fossa Trochanterica of top) aan?',
      options: ['Trochanter Minor', 'Trochanter Major', 'Spina Iliaca Anterior Superior', 'Tuber Ischiadicum'],
      answerIndex: 1
    },
    {
      question: 'Welke specifieke spier aan de achterzijde van het bovenbeen ligt aan de laterale zijde (buitenkant) en hecht aan op het Caput Fibulae?',
      image: 'Les 5 Myologie/BicepsFemoris.png',
      imageAlt: 'Biceps Femoris',
      options: ['Musculus Semitendinosus', 'Musculus Semimembranosus', 'Musculus Biceps Femoris', 'Musculus Rectus Femoris'],
      answerIndex: 2
    },
    {
      question: 'Wat is de gemeenschappelijke oorsprong van de lange kop van de Biceps Femoris, de Semitendinosus en de Semimembranosus?',
      options: ['Crista Iliaca', 'Tuber Ischiadicum', 'Os Sacrum', 'Os Pubis'],
      answerIndex: 1
    },
    {
      question: 'Welke functie hebben de Hamstrings over het kniegewricht?',
      options: ['Extensie', 'Flexie', 'Abductie', 'Adductie'],
      answerIndex: 1
    },
    {
      question: 'De Musculus Biceps Femoris heeft een korte kop (Caput Breve). Waar ontspringt deze?',
      options: ['Tuber Ischiadicum', 'Epicondylus Lateralis', 'Helft van Linea Aspera (Labium Laterale)', 'Crista Iliaca'],
      answerIndex: 2
    },
    {
      question: 'Welke spier van de hamstrings hecht aan op de Condylus Medialis Tibiae (en dus niet op de Pes Anserinus)?',
      options: ['Musculus Semitendinosus', 'Musculus Semimembranosus', 'Musculus Sartorius', 'Musculus Gracilis'],
      answerIndex: 1
    }
  ];

  const les5Myo = {
    title: 'Myologie – Les 5',
    description: 'Ventrale Heupspieren t.e.m. Dorsale Bovenbeenspieren',
    questions: les5MyoMC
  };

  const les6MyoMC = [
    {
      question: 'Welke spier ligt aan de voorzijde van het scheenbeen, hecht aan op Basis metatarsalis I en zorgt voor dorsale flexie en supinatie?',
      image: 'Les 6 Myologie/TibialisAnterior.png',
      imageAlt: 'Tibialis Anterior',
      options: ['Musculus Extensor Hallucis Longus', 'Musculus Tibialis Anterior', 'Musculus Extensor Digitorum Longus', 'Musculus Fibularis Tertius'],
      answerIndex: 1
    },
    {
      question: 'Wat is de insertie van de Musculus Extensor Digitorum Longus?',
      options: ['Dorsale vlak grote teen', 'Dorsale aponeurose tenen', 'Tuberositas Ossis Metatarsalis V', 'Os cuneiforme mediale'],
      answerIndex: 1
    },
    {
      question: 'Welke spier zorgt specifiek voor de extentie van de grote teen?',
      options: ['Musculus Tibialis Anterior', 'Musculus Extensor Digitorum Longus', 'Musculus Extensor Hallucis Longus', 'Musculus Fibularis Longus'],
      answerIndex: 2
    },
    {
      question: 'Welke functie heeft de Musculus Fibularis Tertius (naast extentie tenen en dorsale flexie)?',
      options: ['Supinatie in onderste spronggewricht', 'Pronatie in onderste spronggewricht (laterale abductie)', 'Plantaire flexie', 'Inversie'],
      answerIndex: 1
    },
    {
      question: 'Wat is de oorsprong van de Musculus Tibialis Anterior?',
      options: ['Facies Medialis Fibulae', 'Condylus lateralis en facies lateralis tibiae (plus membrana interossea)', 'Caput Fibulae', 'Epicondylus Lateralis Femur'],
      answerIndex: 1
    },
    {
      question: 'Welke spier loopt langs de buitenkant van het onderbeen en hecht helemaal onder de voet aan op Tuberositas ossis metatarsalis I en Os cuneiforme mediale?',
      image: 'Les 6 Myologie/FibularisLongus.png',
      imageAlt: 'Fibularis Longus',
      options: ['Musculus Fibularis (Peroneus) Longus', 'Musculus Fibularis Brevis', 'Musculus Tibialis Anterior', 'Musculus Soleus'],
      answerIndex: 0
    },
    {
      question: 'Wat is de insertie van de Musculus Fibularis Brevis?',
      options: ['Basis Metatarsalis I', 'Tuberositas Ossis Metatarsalis V', 'Tuber Calcanei', 'Dorsale aponeurose tenen'],
      answerIndex: 1
    },
    {
      question: 'Welke spier stelt je in staat om goed op je tenen te staan (plantaire flexie) en zorgt voor pronatie, en hecht aan de basis van de kleine teen?',
      options: ['Musculus Fibularis Longus', 'Musculus Fibularis Brevis', 'Musculus Fibularis Tertius', 'Musculus Extensor Digitorum Longus'],
      answerIndex: 1
    },
    {
      question: 'Wat is de oorsprong van de Musculus Fibularis Longus?',
      options: ['Distale deel facies lateralis fibulae', 'Caput fibulae en proximale deel facies lateralis', 'Facies Posterior Tibiae', 'Epicondylus Lateralis Femur'],
      answerIndex: 1
    },
    {
      question: 'Welke functie hebben beide Fibularis spieren (Longus en Brevis) gemeen?',
      options: ['Dorsale Flexie en Supinatie', 'Plantaire Flexie en Pronatie', 'Dorsale Flexie en Pronatie', 'Plantaire Flexie en Supinatie'],
      answerIndex: 1
    },
    {
      question: 'Welke tweekoppige spier vormt het oppervlakkige deel van de kuit en hecht aan op het Tuber Calcanei via de achillespees?',
      image: 'Les 6 Myologie/Gastrocnemius.png',
      imageAlt: 'Gastrocnemius',
      options: ['Musculus Soleus', 'Musculus Gastrocnemius', 'Musculus Plantaris', 'Musculus Popliteus'],
      answerIndex: 1
    },
    {
      question: 'Wat is de oorsprong van de Musculus Gastrocnemius?',
      options: ['Caput Fibulae en Tibia', 'Epicondylus Medialis en Lateralis Femur', 'Linea Aspera', 'Facies Posterior Tibiae'],
      answerIndex: 1
    },
    {
      question: 'Welke brede spier ligt diep onder de Gastrocnemius en heeft zijn oorsprong o.a. aan de Arcus Tendineus Musculi Solei?',
      image: 'Les 6 Myologie/Soleus.png',
      imageAlt: 'Soleus',
      options: ['Musculus Plantaris', 'Musculus Popliteus', 'Musculus Soleus', 'Musculus Tibialis Posterior'],
      answerIndex: 2
    },
    {
      question: 'Welke spier van de Triceps Surae werkt alleen over het enkelgewricht (plantaire flexie/supinatie) en niet over de knie?',
      options: ['Musculus Gastrocnemius', 'Musculus Soleus', 'Musculus Plantaris', 'Musculus Popliteus'],
      answerIndex: 1
    },
    {
      question: 'Welke kleine spier heeft een heel lange pees, loopt parallel aan de gastrocnemius en hecht ook aan op de Tuber Calcanei?',
      options: ['Musculus Plantaris', 'Musculus Popliteus', 'Musculus Fibularis Tertius', 'Musculus Soleus'],
      answerIndex: 0
    },
    {
      question: 'Welke kleine, driehoekige spier ligt direct achter de knie en zorgt voor endorotatie van het onderbeen?',
      image: 'Les 6 Myologie/Popliteus.png',
      imageAlt: 'Popliteus',
      options: ['Musculus Plantaris', 'Musculus Popliteus', 'Musculus Soleus', 'Musculus Gastrocnemius'],
      answerIndex: 1
    },
    {
      question: 'Wat is de oorsprong van de Musculus Popliteus?',
      options: ['Epicondylus Medialis Femur', 'Epicondylus Lateralis Femur (en Meniscus Lateralis)', 'Caput Tibiae', 'Tuber Ischiadicum'],
      answerIndex: 1
    },
    {
      question: 'Wat is de insertie van de Musculus Popliteus?',
      options: ['Tuber Calcanei', 'Facies Posterior Tibiae (boven Linea Musculi Solei)', 'Tuberositas Tibiae', 'Caput Fibulae'],
      answerIndex: 1
    },
    {
      question: 'Welke spiergroep wordt gevormd door de Gastrocnemius, Soleus en Plantaris samen?',
      options: ['Quadriceps Femoris', 'Hamstrings', 'Triceps Surae', 'Pes Anserinus'],
      answerIndex: 2
    },
    {
      question: 'Welke functie heeft de Musculus Gastrocnemius over het kniegewricht?',
      options: ['Extensie', 'Flexie', 'Endorotatie', 'Exorotatie'],
      answerIndex: 1
    }
  ];

  const les6Myo = {
    title: 'Myologie – Les 6',
    description: 'Ventrale Onderbeenspieren t.e.m. Dorsale Onderbeenspieren',
    questions: les6MyoMC
  };

  const les7MyoMC = [
    {
      question: 'Welke spier behoort tot de groep van de diep gelegen dorsale onderbeenspieren?',
      options: ['Musculus Tibialis Anterior', 'Musculus Gastrocnemius', 'Musculus Tibialis Posterior', 'Musculus Soleus'],
      answerIndex: 2
    },
    {
      question: 'Wat is de insertie van de Musculus Tibialis Posterior?',
      options: ['Tuber Calcanei', 'Os Navicularis en Ossa Cuneiformia', 'Eindphalanx van de 2e tot 5e teen', 'Basis Metatarsalis V'],
      answerIndex: 1
    },
    {
      question: 'Welke functie heeft de Musculus Flexor Digitorum Longus?',
      options: ['Dorsale flexie en pronatie', 'Plantaire flexie en supinatie (plus flexie van tenen 2-5)', 'Alleen extensie van de tenen', 'Pronatie en abductie'],
      answerIndex: 1
    },
    {
      question: 'Wat is de oorsprong van de Musculus Tibialis Posterior?',
      options: ['Facies Posterior Tibiae, Membrana Interossea Cruris, Facies Medialis Fibulae', 'Epicondylus Lateralis Femur', 'Caput Fibulae en Linea Musculi Solei', 'Tibia Facies Anterior'],
      answerIndex: 0
    },
    {
      question: 'Op welke structuur hecht de Musculus Flexor Digitorum Longus aan?',
      options: ['Tuber Calcanei', 'Eindphalanx van 2e tot 5e teen', 'Os Naviculare', 'Basis van de grote teen'],
      answerIndex: 1
    }
  ];

  const les7Myo = {
    title: 'Myologie – Les 7',
    description: 'Diepe Dorsale Onderbeenspieren',
    questions: les7MyoMC
  };

  const anatomie = {
    name: 'Anatomie',
    summary: 'Hier komen de samenvattingen van Anatomie zodra ze beschikbaar zijn.',
    categories: [
      {
        id: 'arthrologie-core',
        domain: 'arthrologie',
        section: 'arthrologie',
        title: 'Algemeen Examen',
        description: 'Examenvragen over gewrichten en ligamenten.',
        quizSets: [arthrologieHoofdstuk]
      },
      {
        id: 'arthro-upper',
        domain: 'arthrologie',
        section: 'arthro-upper',
        title: 'Bovenste ledematen',
        description: 'Gewrichten van schoudergordel tot hand.',
        quizSets: [
          {
            title: 'Bovenste Ledematen – 20 vragen',
            questions: [
              { question: 'Welk ligament verbindt de eerste rib met de onderzijde van de clavicula (impressio ligamenti costoclavicularis)?', options: ['Ligamentum interclaviculare','Ligamentum costoclaviculare','Ligamentum sternocostale radiatum','Ligamentum coracoclaviculare'], answerIndex: 1 },
              { question: 'Waar bevindt het Ligamentum interclaviculare zich?', options: ['Tussen het sternum en de ribben','Tussen het coracoid en het acromion','Bovenaan tussen de twee claviculae ter hoogte van de incisura jugularis','Aan de onderzijde van het sternoclaviculaire gewricht'], answerIndex: 2 },
              { question: 'Wat is een kenmerk van het Ligamentum sternocostale radiatum?', options: ['Het is lusvormig','Het loopt door het wervelkanaal','Het vertakt en verbreedt zich op de insertie van het andere botstuk','Het verbindt de scapula met de humerus'], answerIndex: 2 },
              { question: 'Welke bewegingen worden specifiek geremd door het Ligamentum coraco-acromiale?', options: ['Elevatie en depressie van de scapula','Abductie en anteversie van de schouder','Exorotatie en endorotatie','Pronatie en supinatie'], answerIndex: 1 },
              { question: 'Uit welke twee delen bestaat het Ligamentum coracoclaviculare?', options: ['Lig. trapezoideum en Lig. conoideum','Lig. collaterale ulnare en radiale','Lig. flavum en Lig. nuchae','Lig. supraspinatus en Lig. infraspinatus'], answerIndex: 0 },
              { question: 'Waarvoor dient de Recessus axillaris in het gewrichtskapsel van de schouder?', options: ['Het beschermt de bloedvaten','Het zorgt voor smering van de bicepspees','Het helpt voor meer bewegingsvrijheid bij het heffen van de arm','Het verbindt het acromion met de clavicula'], answerIndex: 2 },
              { question: 'Welke ligamenten stabiliseren specifiek de voorzijde van het schouderkapsel?', options: ['Ligamenta glenohumeralia (superius, medium, inferius)','Ligamentum transversum scapulae','Ligamentum sacrospinale','Ligamentum nuchae'], answerIndex: 0 },
              { question: 'Welke beweging vindt plaats rond de sagittale as in het schoudergewricht (Articulatio humeri)?', options: ['Anteflexie en retroflexie','Exorotatie en endorotatie','Adductie en abductie','Pronatie en supinatie'], answerIndex: 2 },
              { question: 'Welke beweging vindt plaats rond de frontale as in het schoudergewricht?', options: ['Anteflexie en retroflexie','Adductie en abductie','Exorotatie en endorotatie','Circumductie'], answerIndex: 0 },
              { question: 'Welk ligament in de elleboog is lusvormig en loopt rond de radiuskop?', options: ['Ligamentum collaterale radiale','Ligamentum collaterale ulnare','Ligamentum anulare radii','Chorda obliqua'], answerIndex: 2 },
              { question: 'Wat is de functie van het Ligamentum anulare radii?', options: ['Het remt de buiging van de elleboog','Het zorgt voor de geleiding van de draaiing van de radiuskop','Het verbindt de ulna met de humerus','Het voorkomt abductie van de onderarm'], answerIndex: 1 },
              { question: 'Wat is de functie van de collaterale ligamenten in de elleboog?', options: ['Ze zorgen voor rotatie','Ze zorgen voor mediale en laterale stabiliteit','Ze zorgen voor glijbewegingen van de pols','Ze verbinden de biceps met de radius'], answerIndex: 1 },
              { question: 'Hoe wordt het gewricht tussen Humerus en Ulna geclassificeerd in de tekst?', options: ['3-assig kogelgewricht','2-assig zadelgewricht','1-assig scharniergewricht','1-assig draaigewricht'], answerIndex: 2 },
              { question: 'Hoe wordt het gewricht tussen Humerus en Radius geclassificeerd in de tekst?', options: ['1-assig scharniergewricht','2-assig eigewricht','3-assig kogelgewricht','Vlak gewricht'], answerIndex: 2 },
              { question: 'Welk type gewricht is de verbinding tussen Radius en Ulna?', options: ['Scharniergewricht','Draaigewricht (Articulatio trochoidea)','Zadelgewricht','Vlak gewricht'], answerIndex: 1 },
              { question: 'Wat laten de collaterale ligamenten van de vingergewrichten (vingers) toe?', options: ['Enkel rotatie','Enkel flexie en extensie','Abductie en adductie in gestrekte stand','Circumductie'], answerIndex: 1 },
              { question: 'Wat is de functie van de Ligamenta palmaria in de hand?', options: ['Ze zorgen voor spreiding van de vingers','Ze houden overstrekking (hyperextensie) van de vingers tegen','Ze verbinden de polsbeentjes met de radius','Ze beschermen de nagelriemen'], answerIndex: 1 },
              { question: 'Waar bevindt het Ligamentum transversum scapulae superius zich?', options: ['Over de incisura scapulae','Tussen het acromion en de clavicula','Tussen de processus spinosi','In de elleboog'], answerIndex: 0 },
              { question: 'Waar loopt het Ligamentum coracohumerale?', options: ['Van het coracoid naar de clavicula','Van het coracoid naar het acromion','Van het coracoid naar de humerus (dorsaal kapsel)','Tussen radius en ulna'], answerIndex: 2 },
              { question: 'Wat is de algemene functie van een discus of meniscus in een gewricht (zoals genoemd bij de incongruentie van vlakken)?', options: ['Productie van synoviaal vocht','Zorgen voor grotere congruentie (passend maken)','Verbinding van spieren aan bot','Voeding van het bot'], answerIndex: 1 }
            ]
          }
        ]
      },
      {
        id: 'arthro-lower',
        domain: 'arthrologie',
        section: 'arthro-lower',
        title: 'Onderste ledematen',
        description: 'Gewrichten van heup tot voet.',
        quizSets: [
          {
            title: 'Onderste Ledematen – deel 1 (10 vragen)',
            questions: [
              { question: 'Welke vorm heeft de Meniscus Medialis in het kniegewricht?', options: ['O-vormig (kleiner oppervlak)','C-vormig (groter oppervlak)','Driehoekig','Vierkant'], answerIndex: 1 },
              { question: 'Wat is de functie van het Ligamentum transversum genus in de knie?', options: ['Het verbindt de tibia met de fibula.','Het verbindt de femur met de patella.','Het verbindt beide menisci aan de ventrale zijde met elkaar.','Het verbindt de kruisbanden met elkaar.'], answerIndex: 2 },
              { question: 'Waar hecht het Ligamentum cruciatum anterius (voorste kruisband) aan op het dijbeen?', options: ['De laterale zijde van de condylus medialis femoris.','De mediale zijde van de condylus lateralis femoris.','De fossa intercondylaris.','De tuberositas tibiae.'], answerIndex: 1 },
              { question: 'Welk ligament in de knie is verweven met de mediale meniscus?', options: ['Ligamentum collaterale laterale (fibulare)','Ligamentum cruciatum posterius','Ligamentum collaterale mediale (tibiale)','Ligamentum patellae'], answerIndex: 2 },
              { question: 'Wat is de specifieke functie van het Ligamentum collaterale laterale (LCL) van de knie?', options: ['Het voorkomt een valgusbeweging (X-stand).','Het voorkomt een varusbeweging (O-stand) en beperkt exorotatie.','Het zorgt voor de slotextensie.','Het trekt de meniscus naar achteren tijdens flexie.'], answerIndex: 1 },
              { question: 'Welk ligament aan de achterzijde van de knie (dorsaal) vertrekt van de fibula en buigt af over de spier (afgebogen)?', options: ['Ligamentum popliteum obliquum','Ligamentum popliteum arcuatum','Ligamentum meniscofemorale posterius','Ligamentum cruciatum posterius'], answerIndex: 1 },
              { question: 'Wat is een kenmerk van het Ligamentum popliteum obliquum?', options: ['Het heeft een perforatie.','Het ligt intra-articulair (in het gewricht).','Het verbindt de patella met de tibia.','Het is het zwakste ligament van de knie.'], answerIndex: 0 },
              { question: 'Wanneer is rotatie in het kniegewricht mogelijk?', options: ['In volledige extensie (gestrekt been).','Tijdens het lopen.','Enkel in lichte flexie (gebogen stand).','Nooit, de knie is een scharniergewricht dat geen rotatie toelaat.'], answerIndex: 2 },
              { question: 'Wat wordt bedoeld met "Slotextensie" van de knie?', options: ['De knie kan niet meer buigen door een blokkade.','De stand waarin de collaterale ligamenten maximaal gespannen zijn (volledige strekking).','De meniscus zit klem tussen de botten.','Een geforceerde hyperextensie van meer dan 10 graden.'], answerIndex: 1 },
              { question: 'Welke botstukken vormen het Articulatio talocruralis (bovenste spronggewricht)?', options: ['Tibia, Fibula en Calcaneus.','Tibia, Fibula en Talus.','Talus, Calcaneus en Naviculare.','Femur, Tibia en Patella.'], answerIndex: 1 }
            ]
          }
          ,
          {
            title: 'Onderste Ledematen – deel 2 (10 vragen)',
            questions: [
              { question: 'Welk ligament behoort niet tot de laterale ligamenten van de enkel?', options: ['Ligamentum talofibulare anterius','Ligamentum calcaneofibulare','Ligamentum talofibulare posterius','Ligamentum tibionavicularis'], answerIndex: 3 },
              { question: 'Uit hoeveel delen bestaat het Ligamentum deltoideum (mediale enkelband)?', options: ['2 delen','3 delen','4 delen','5 delen'], answerIndex: 2 },
              { question: 'Welk deel van het Ligamentum deltoideum loopt van de malleolus tibialis naar het os naviculare?', options: ['Pars tibiotalaris anterior','Pars tibiocalcanearis','Pars tibionavicularis','Pars tibiotalaris posterior'], answerIndex: 2 },
              { question: 'Wat is de functie van de membrana interossea in het onderbeen?', options: ['Het verbindt de tibia en fibula over de lengte.','Het beschermt de achillespees.','Het zorgt voor de voeding van de kuitspier.','Het vormt het gewrichtsoppervlak van de enkel.'], answerIndex: 0 },
              { question: 'Welk ligament aan de plantaire zijde (zool) van de voet is het belangrijkst voor het in stand houden van het voetgewelf?', options: ['Ligamentum bifurcatum','Ligamentum plantare longum','Ligamentum talocalcaneum laterale','Ligamentum metatarsalia dorsalia'], answerIndex: 1 },
              { question: 'Waar bevindt het Ligamentum bifurcatum zich?', options: ['Aan de dorsale zijde (bovenkant) van de voet.','Aan de plantaire zijde (onderkant) van de voet.','Aan de achterzijde van de hiel.','Tussen tibia en fibula.'], answerIndex: 0 },
              { question: 'Wat is de functie van het Ligamentum patellae?', options: ['Het zorgt voor zijdelingse stabiliteit van de knie.','Het brengt de kracht van de quadriceps over op de tibia.','Het houdt de meniscus op zijn plaats.','Het voorkomt hyperextensie van de knie.'], answerIndex: 1 },
              { question: 'Wat is een "Valgum" stand van de knie?', options: ['O-benen (femur staat te recht).','X-benen (femur heeft een te verre inclinatie naar binnen).','Een overstrekte knie.','Een gedraaide knie.'], answerIndex: 1 },
              { question: 'Welk ligament loopt van de malleolus lateralis naar het os calcaneus?', options: ['Ligamentum talofibulare anterius','Ligamentum calcaneofibulare','Ligamentum deltoideum','Ligamentum bifurcatum'], answerIndex: 1 },
              { question: 'Wat is de functie van de menisci in de knie?', options: ['Ze produceren gewrichtsvocht.','Ze zorgen voor optimalisatie van de congruentie (pasvorm) van het gewrichtsoppervlak.','Ze verbinden de kruisbanden met de collaterale banden.','Ze dienen als aanhechting voor de quadriceps.'], answerIndex: 1 }
            ]
          }
        ]
      },
      {
        id: 'myo-les1',
        domain: 'myologie',
        section: 'myo-les-1',
        title: 'Les 1',
        description: '1. Dorsale Spieren Craniaal t.e.m Ademhalingsspieren',
        quizSets: [
          {
            title: 'Myologie – Les 1 (20 vragen)',
            description: '1. Dorsale Spieren Craniaal t.e.m Ademhalingsspieren',
            questions: [
              {
                question: 'Welke spier zie je op deze afbeelding (de oppervlakkige laag)?',
                description: 'Afbeelding: Trapezius 1.png',
                image: 'Les 1 Myologie/Trapezius 1.png',
                imageAlt: 'Trapezius – oppervlakkige laag',
                options: ['Musculus Latissimus Dorsi','Musculus Trapezius','Musculus Rhomboideus Major','Musculus Erector Spinae'],
                answerIndex: 1
              },
              {
                question: 'Wat is de oorsprong van de spier die je hier op het skelet ziet?',
                description: 'Afbeelding: Trapezius 2.png',
                image: 'Les 1 Myologie/Trapezius 2.png',
                imageAlt: 'Trapezius op skelet – oorsprong',
                options: ['Processus transversus C1-C4','Os occipitale en Processus spinosus T1-T12','Thoracale wervels T1-T4','Crista Iliaca en Sacrum'],
                answerIndex: 1
              },
              {
                question: 'De Musculus Trapezius bestaat uit drie delen. Wat is de specifieke functie van de Pars Ascendens (de verticale, stijgende vezels)?',
                description: 'Tekstvraag zonder afbeelding',
                options: ['Elevatie van de scapula','Retractie van de scapula','Rotatie van de scapula','Adductie van de scapula'],
                answerIndex: 2
              },
              {
                question: 'Welke dieper gelegen spier wordt hier getoond?',
                description: 'Afbeelding: Levator Scapulae.png',
                image: 'Les 1 Myologie/Levator Scapulae.png',
                imageAlt: 'Levator scapulae',
                options: ['Musculus Levator Scapulae','Musculus Scalenus','Musculus Sternocleidomastoideus','Musculus Splenius Capitis'],
                answerIndex: 0
              },
              {
                question: 'Wat is de insertie van deze spier op het schouderblad?',
                description: 'Afbeelding: Levator Scapulae.png',
                image: 'Les 1 Myologie/Levator Scapulae.png',
                imageAlt: 'Levator scapulae – insertie op scapula',
                options: ['Spina Scapulae','Acromion','Angulus Superior en Margo Medialis','Processus Coracoideus'],
                answerIndex: 2
              },
              {
                question: 'Je ziet hier de M. Rhomboideus Major en Minor. Wat is de functie van deze spieren?',
                description: 'Afbeelding: Rhomboideus Major en Minor.png',
                image: 'Les 1 Myologie/Rhomboideus Major en Minor.png',
                imageAlt: 'Rhomboideus major en minor',
                options: ['Protractie en depressie','Adductie en elevatie van de scapula','Endorotatie van de arm','Lateroflexie van de wervelkolom'],
                answerIndex: 1
              },
              {
                question: 'Welke spier zie je hier, gelegen onder de grote borstspier?',
                description: 'Afbeelding: Pectoralis Minor.png',
                image: 'Les 1 Myologie/Pectoralis Minor.png',
                imageAlt: 'Pectoralis minor onder pectoralis major',
                options: ['Musculus Subclavius','Musculus Pectoralis Minor','Musculus Pectoralis Major','Musculus Serratus Anterior'],
                answerIndex: 1
              },
              {
                question: 'Wat is de oorsprong van deze spier?',
                description: 'Afbeelding: Pectoralis Minor.png',
                image: 'Les 1 Myologie/Pectoralis Minor.png',
                imageAlt: 'Pectoralis minor – oorsprong',
                options: ['Rib 1-9','Rib 2-5 (Bovenste deel ribbenkast)','Sternum','Clavicula'],
                answerIndex: 1
              },
              {
                question: 'Welke spier zie je hier aan de zijkant van de borstkas?',
                description: 'Afbeelding: Seratus Anterior.png',
                image: 'Les 1 Myologie/Seratus Anterior.png',
                imageAlt: 'Serratus anterior – laterale borstkas',
                options: ['Musculus Obliquus Externus','Musculus Serratus Anterior','Musculus Latissimus Dorsi','Musculus Intercostales'],
                answerIndex: 1
              },
              {
                question: 'Wat is de functie van deze spier?',
                description: 'Afbeelding: Seratus Anterior.png',
                image: 'Les 1 Myologie/Seratus Anterior.png',
                imageAlt: 'Serratus anterior – functie',
                options: ['Retractie van de scapula','Elevatie van de scapula','Stabilisatie en protractie van de scapula','Adductie van de arm'],
                answerIndex: 2
              },
              {
                question: 'Welke spier wordt beschouwd als een lokale stabilisator en fungeert als een diepe dwarse buikspier (korset)?',
                description: 'Tekstvraag zonder afbeelding',
                options: ['Musculus Rectus Abdominis','Musculus Obliquus Externus','Musculus Transversus Abdominis','Musculus Quadratus Lumborum'],
                answerIndex: 2
              },
              {
                question: 'Welke spier zie je hier, waarvan de vezels lopen als "handen in de zakken" (Lateraal naar Inferior)?',
                description: 'Afbeelding: Obliquus Externus Abdominis.png',
                image: 'Les 1 Myologie/Obliquus Externus Abdominis.png',
                imageAlt: 'Obliquus externus abdominis',
                options: ['Musculus Obliquus Internus Abdominis','Musculus Obliquus Externus Abdominis','Musculus Transversus Abdominis','Musculus Rectus Abdominis'],
                answerIndex: 1
              },
              {
                question: 'Wat is de oorsprong van de Musculus Obliquus Internus Abdominis (dus niet degene op de foto, maar de laag eronder)?',
                description: 'Tekstvraag zonder afbeelding',
                options: ['Rib 5-12','Crista Iliaca en Fascia Thoracolumbalis','Symphysis Pubis','Rib 1-9'],
                answerIndex: 1
              },
              {
                question: 'Welke spier is de globale mobilisator van de romp (de "sixpack")?',
                description: 'Afbeelding: Rectus Abdominis.png',
                image: 'Les 1 Myologie/Rectus Abdominis.png',
                imageAlt: 'Rectus abdominis',
                options: ['Musculus Psoas Major','Musculus Rectus Abdominis','Musculus Pyramidalis','Musculus Quadratus Lumborum'],
                answerIndex: 1
              },
              {
                question: 'Waar bevindt zich de insertie van deze spier?',
                description: 'Afbeelding: Rectus Abdominis.png',
                image: 'Les 1 Myologie/Rectus Abdominis.png',
                imageAlt: 'Rectus abdominis – insertie',
                options: ['Processus Xiphoideus','Rib 5-7','Symphysis Pubis','Crista Iliaca'],
                answerIndex: 2
              },
              {
                question: 'Welke diepe rugspier zie je hier, die de Crista Iliaca met de 12e rib verbindt?',
                description: 'Afbeelding: Quadratus Lumboris.png',
                image: 'Les 1 Myologie/Quadratus Lumboris.png',
                imageAlt: 'Quadratus lumborum',
                options: ['Musculus Erector Spinae','Musculus Latissimus Dorsi','Musculus Quadratus Lumborum','Musculus Multifidus'],
                answerIndex: 2
              },
              {
                question: 'Welke grote spiergroep zorgt voor extensie van de wervelkolom en lateroflexie?',
                description: 'Afbeelding: Erector Spinae.png',
                image: 'Les 1 Myologie/Erector Spinae.png',
                imageAlt: 'Erector spinae',
                options: ['Musculus Rectus Abdominis','Musculus Erector Spinae','Musculus Trapezius','Musculus Rhomboideus'],
                answerIndex: 1
              },
              {
                question: 'Wat is de functie van de Musculus Intercostales Externi (buitenste tussenribspieren)?',
                description: 'Tekstvraag zonder afbeelding',
                options: ['Dalen van de ribben bij uitademen','Optrekken van onderliggende ribben bij inademen','Rotatie van de romp','Stabilisatie van het sternum'],
                answerIndex: 1
              },
              {
                question: 'Welke bewering over de Musculus Intercostales Interni is juist?',
                description: 'Tekstvraag zonder afbeelding',
                options: ['Ze zorgen voor inademing.','De vezels lopen van Postero-craniaal naar ventro-caudaal.','De insertie is de Sulcus costae.','De functie is het dalen van de onderliggende rib (actieve uitademing).'],
                answerIndex: 3
              },
              {
                question: 'Waar bevindt zich de insertie van het Diafragma?',
                description: 'Tekstvraag zonder afbeelding',
                options: ['Rondom onderrand borstkas','Centrum Tendineum','Linea Alba','Processus Xiphoideus'],
                answerIndex: 1
              }
            ]
          }
        ]
      },
      {
        id: 'myo-les2',
        domain: 'myologie',
        section: 'myo-les-2',
        title: 'Les 2',
        description: '4. Borstspieren t.e.m Schouderspieren',
        quizSets: [les2Myo]
      },
      {
        id: 'myo-les3',
        domain: 'myologie',
        section: 'myo-les-3',
        title: 'Les 3',
        description: 'Dorsale Bovenarmspieren t.e.m. Oppervlakkig Gelegen Ventrale Voorarmspieren',
        quizSets: [
          {
            title: 'Myologie – Les 3',
            questions: les3MyoMC
          }
        ]
      },
      {
        id: 'myo-les4',
        domain: 'myologie',
        section: 'myo-les-4',
        title: 'Les 4',
        description: 'Radiale Spieren VD Onderarm t.e.m. Diepe Radiale Voorarmspieren',
        quizSets: [les4Myo]
      },
      {
        id: 'myo-les5',
        domain: 'myologie',
        section: 'myo-les-5',
        title: 'Les 5',
        description: 'Ventrale Heupspieren t.e.m. Dorsale Bovenbeenspieren',
        quizSets: [les5Myo]
      },
      {
        id: 'myo-les6',
        domain: 'myologie',
        section: 'myo-les-6',
        title: 'Les 6',
        description: 'Ventrale Onderbeenspieren t.e.m. Dorsale Onderbeenspieren',
        quizSets: [les6Myo]
      },
      {
        id: 'myo-les7',
        domain: 'myologie',
        section: 'myo-les-7',
        title: 'Les 7',
        description: 'Diepe Dorsale Onderbeenspieren',
        quizSets: [les7Myo]
      },
      {
        id: 'upper',
        domain: 'osteologie',
        section: 'osteo-upper',
        title: 'Bovenste ledematen',
        description: 'Van schoudergordel tot hand – meer vragen volgen snel.',
        quizSets: [
          {
            title: 'Clavicula',
            questions: [
              {
                question: 'Welke vorm heeft de clavicula?',
                options: ['Rechte buis', 'S-vormige kromming', 'Zwaardvorm', 'Volledig ronde staaf'],
                answerIndex: 1
              },
              {
                question: 'Met welk bot articuleert de laterale zijde van de clavicula?',
                options: ['Sternum', 'Scapula', 'Humerus', 'Costa I'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het gewricht tussen clavicula en sternum?',
                options: ['Acromioclaviculair gewricht', 'Sternoclaviculair gewricht', 'Glenohumerale gewricht', 'Costoclaviculair gewricht'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het gewricht tussen clavicula en acromion?',
                options: ['Sternoclaviculair', 'Scapuloclaviculair', 'Acromioclaviculair', 'Claviculohumeral'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet het ruwe gebied onderaan de clavicula voor ligamentaanhechting?',
                options: ['Linea costalis', 'Facies articularis', 'Tuberositas coracoidea', 'Conoid tubercle'],
                answerIndex: 3
              },
              {
                question: 'Welke zijde van de clavicula is bol naar voren gericht?',
                options: ['Laterale zijde', 'Mediale zijde', 'Caudale zijde', 'Dorsale zijde'],
                answerIndex: 1
              },
              {
                question: 'De mediale clavicula is…',
                options: ['Plat', 'Rond en dik', 'Ovaal en dun', 'Driehoekig'],
                answerIndex: 1
              },
              {
                question: 'De laterale clavicula articuleert met…',
                options: ['Scapula (acromion)', 'Os coxae', 'Humeruskop', 'Sternum'],
                answerIndex: 0
              },
              {
                question: 'Wat is de belangrijkste functie van de clavicula?',
                options: ['Bescherming van longen', 'Stabiliserende verbinding arm-romp', 'Aanmaken van bloedcellen', 'Draaipunt voor elleboog'],
                answerIndex: 1
              },
              {
                question: 'Waar ligt de impressio ligamenti costoclavicularis?',
                options: ['Lateraal', 'Mediaal', 'Op dorsale zijde', 'Op craniale zijde'],
                answerIndex: 1
              },
              {
                question: 'Welke structuur ligt aan de laterale clavicula?',
                options: ['Conoid tubercle', 'Impressio costalis', 'Sternal facet', 'Linea intermedia'],
                answerIndex: 0
              },
              {
                question: 'Hoe heet het vlak waarmee de clavicula met het sternum articuleert?',
                options: ['Facies articularis sternalis', 'Facies glenoidalis', 'Facies costalis', 'Facies humeralis'],
                answerIndex: 0
              },
              {
                question: 'Waarvoor dient het conoid tubercle?',
                options: ['Aanhechting coracoclaviculair ligament', 'Aanhechting van borstspieren', 'Aanhechting voor trapezius', 'Aanhechting voor deltoideus'],
                answerIndex: 0
              },
              {
                question: 'De clavicula is het enige bot dat…',
                options: ['Met de ribben articuleert', 'De arm met de romp verbindt', 'Geen gewrichten heeft', 'Met twee wervels articuleert'],
                answerIndex: 1
              },
              {
                question: 'Welke zijde van de clavicula is vlakker en breder?',
                options: ['Mediale', 'Laterale', 'Dorsale', 'Caudale'],
                answerIndex: 1
              },
              {
                question: 'Waar ligt het acromiale uiteinde?',
                options: ['Mediaal', 'Lateraal', 'Ventraal', 'Dorsaal'],
                answerIndex: 1
              },
              {
                question: 'Waar ligt het sternale uiteinde?',
                options: ['Lateraal', 'Dorsaal', 'Mediaal', 'Onder scapula'],
                answerIndex: 2
              },
              {
                question: 'Welke spier hecht aan de onderkant van de clavicula?',
                options: ['Trapezius', 'Subclavius', 'Latissimus dorsi', 'Rhomboideus'],
                answerIndex: 1
              },
              {
                question: 'Wat is typisch voor de clavicula bij een breuk?',
                options: ['Breekt zelden', 'Breekt vaak in het midden', 'Breekt alleen aan de uiteinden', 'Breekt steeds verticaal'],
                answerIndex: 1
              },
              {
                question: 'Wat ligt ventraal van de clavicula?',
                options: ['Scapula', 'Longtop', 'Humerus', 'Ribben'],
                answerIndex: 3
              }
            ]
          },
          {
            title: 'Scapula',
            questions: [
              {
                question: 'Welke structuur loopt uit in het acromion?',
                options: ['Spina scapulae', 'Processus coracoideus', 'Cavitas glenoidalis', 'Fossa subscapularis'],
                answerIndex: 0
              },
              {
                question: 'Hoe heet het ravenbekvormige uitsteeksel van de scapula?',
                options: ['Acromion', 'Angulus superior', 'Processus coracoideus', 'Tuberculum supraglenoidale'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet de gewrichtskom van de scapula?',
                options: ['Fossa supraspinata', 'Cavitas glenoidalis', 'Angulus inferior', 'Fossa infraspinata'],
                answerIndex: 1
              },
              {
                question: 'Wat ligt er boven de spina scapulae?',
                options: ['Fossa infraspinata', 'Fossa supraspinata', 'Cavitas glenoidalis', 'Fossa subscapularis'],
                answerIndex: 1
              },
              {
                question: 'Wat ligt er onder de spina scapulae?',
                options: ['Fossa supraspinata', 'Fossa subscapularis', 'Fossa infraspinata', 'Angulus superior'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet het botpunt onderaan de scapula?',
                options: ['Angulus superior', 'Angulus inferor', 'Angulus inferior', 'Angulus medialis'],
                answerIndex: 2
              },
              {
                question: 'De margo medialis ligt…',
                options: ['Tegen de wervelkolom', 'Tegen de ribben', 'Tegen de humerus', 'Tegen de clavicula'],
                answerIndex: 0
              },
              {
                question: 'De margo lateralis ligt…',
                options: ['Naar het sternum gericht', 'Dicht bij de humerus', 'Tegen de wervelkolom', 'Achter de clavicula'],
                answerIndex: 1
              },
              {
                question: 'Welke structuur ligt aan de voorzijde van de scapula?',
                options: ['Fossa subscapularis', 'Fossa infraspinata', 'Fossa supraspinata', 'Acromion'],
                answerIndex: 0
              },
              {
                question: 'Wat ligt er boven op de cavitas glenoidalis?',
                options: ['Tuberculum infraglenoidale', 'Processus coracoideus', 'Tuberculum supraglenoidale', 'Acromion'],
                answerIndex: 2
              },
              {
                question: 'Wat ligt er onder de cavitas glenoidalis?',
                options: ['Tuberculum supraglenoidale', 'Tuberculum infraglenoidale', 'Processus coracoideus', 'Fossa subscapularis'],
                answerIndex: 1
              },
              {
                question: 'Wat is de functie van het acromion?',
                options: ['Aanhechting hamstrings', 'Gewrichtsvlak voor clavicula', 'Bescherming van ribben', 'Aanhechting sternum'],
                answerIndex: 1
              },
              {
                question: 'Wat is de positie van de cavitas glenoidalis?',
                options: ['Lateraal gericht', 'Mediaal gericht', 'Ventraal gericht', 'Dorsaal gericht'],
                answerIndex: 0
              },
              {
                question: 'Hoe noem je de bovenste hoek van de scapula?',
                options: ['Angulus inferior', 'Angulus superior', 'Angulus medialis', 'Angulus centralis'],
                answerIndex: 1
              },
              {
                question: 'Hoe noem je de rand onder de cavitas glenoidalis richting de oksel?',
                options: ['Margo medialis', 'Margo superior', 'Margo lateralis', 'Crista glenoidalis'],
                answerIndex: 2
              },
              {
                question: 'Wat vormt de spina scapulae?',
                options: ['Een scheiding tussen supra- en infraspinata', 'De gewrichtskom', 'Het ventrale oppervlak', 'De mediale rand'],
                answerIndex: 0
              },
              {
                question: 'De facies costalis is het oppervlak dat…',
                options: ['Tegen de ribben ligt', 'Tegen de wervels ligt', 'De humerus draagt', 'De clavicula draagt'],
                answerIndex: 0
              },
              {
                question: 'Wat bevindt zich op de dorsale zijde van de scapula?',
                options: ['Fossa subscapularis', 'Cavitas costalis', 'Fossa supra- en infraspinata', 'Processus xiphoideus'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet de bovenste inkeping aan de medial bovenrand?',
                options: ['Incisura scapulae', 'Incisura glenoidalis', 'Incisura medialis', 'Incisura coracoidea'],
                answerIndex: 0
              },
              {
                question: 'Waar articuleert de scapula rechtstreeks mee?',
                options: ['Humerus & clavicula', 'Ribben & clavicula', 'Sternum & humerus', 'Sternum & clavicula'],
                answerIndex: 0
              }
            ]
          },
          {
            title: 'Humerus',
            questions: [
              {
                question: 'Hoe heet de kop van de humerus?',
                options: ['Caput humeri', 'Tuberculum majus', 'Collum anatomicum', 'Glenoid head'],
                answerIndex: 0
              },
              {
                question: 'Wat articuleert met de cavitas glenoidalis van de scapula?',
                options: ['Trochlea humeri', 'Caput humeri', 'Epicondylus lateralis', 'Fossa olecrani'],
                answerIndex: 1
              },
              {
                question: 'Wat ligt lateraal van de sulcus intertubercularis?',
                options: ['Tuberculum minus', 'Tuberculum majus', 'Trochlea humeri', 'Fossa coronoidea'],
                answerIndex: 1
              },
              {
                question: 'Wat ligt mediaal van de sulcus intertubercularis?',
                options: ['Tuberculum majus', 'Tuberculum minus', 'Caput humeri', 'Collum chirurgicum'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het smalle deel onder de caput humeri?',
                options: ['Collum anatomicum', 'Corpus humeri', 'Collum chirurgicum', 'Crista humeri'],
                answerIndex: 2
              },
              {
                question: 'Wat zit er aan de achterzijde van de humerus distaal?',
                options: ['Fossa olecrani', 'Fossa radialis', 'Tuberositas deltoidea', 'Fovea articularis'],
                answerIndex: 0
              },
              {
                question: 'Hoe heet het uitsteeksel aan de laterale zijde distaal?',
                options: ['Epicondylus medialis', 'Epicondylus lateralis', 'Trochlea humeri', 'Caput laterale'],
                answerIndex: 1
              },
              {
                question: 'Welke structuur articuleert met de ulna?',
                options: ['Capitulum humeri', 'Trochlea humeri', 'Tuberculum minus', 'Fossa radialis'],
                answerIndex: 1
              },
              {
                question: 'Welke structuur articuleert met de radius?',
                options: ['Trochlea humeri', 'Fossa olecrani', 'Capitulum humeri', 'Epicondylus medialis'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet de groeve voor de m. latissimus dorsi?',
                options: ['Sulcus intertubercularis', 'Sulcus nervi radialis', 'Tuberositas deltoidea', 'Sulcus bicipitalis'],
                answerIndex: 1
              },
              {
                question: 'Wat loopt door de sulcus nervi radialis?',
                options: ['A. subclavia', 'N. medianus', 'N. radialis', 'N. musculocutaneus'],
                answerIndex: 2
              },
              {
                question: 'Waar ligt de tuberositas deltoidea?',
                options: ['Helemaal distaal', 'Lateraal op het corpus humeri', 'Mediaal op de humeruskop', 'Op de trochlea'],
                answerIndex: 1
              },
              {
                question: 'Wat ligt boven de capitulum humeri?',
                options: ['Fossa olecrani', 'Fossa radialis', 'Fossa coronoidea', 'Caput humeri'],
                answerIndex: 2
              },
              {
                question: 'Wat ligt boven de trochlea humeri?',
                options: ['Fossa radialis', 'Fossa coronoidea', 'Epicondylus lateralis', 'Collum chirurgicum'],
                answerIndex: 1
              },
              {
                question: 'Waarvoor dient het collum chirurgicum als klinisch punt?',
                options: ['Breukgevoelig gebied', 'Aanhechting triceps', 'Gewrichtsvlak', 'Biceps-aanhechting'],
                answerIndex: 0
              },
              {
                question: 'Welke zijde heeft een grotere epicondylus?',
                options: ['Lateraal', 'Mediaal', 'Distaal', 'Craniaal'],
                answerIndex: 1
              },
              {
                question: 'Wat ligt aan de voorzijde van de humerus distaal?',
                options: ['Fossa olecrani', 'Fossa radialis & coronoidea', 'Tuberculum majus', 'Collum anatomicum'],
                answerIndex: 1
              },
              {
                question: 'Welke structuur maakt pronatie-supinatie mogelijk?',
                options: ['Capitulum humeri', 'Trochlea humeri', 'Tuberculum minus', 'Epicondylus'],
                answerIndex: 0
              },
              {
                question: 'Wat is de aanhechtingsplaats voor de m. deltoideus?',
                options: ['Tuberositas deltoidea', 'Tuberculum majus', 'Trochlea humeri', 'Sulcus intertubercularis'],
                answerIndex: 0
              },
              {
                question: 'Wat ligt posterieur op de humerus?',
                options: ['Fossa radialis', 'Tuberculum minus', 'Sulcus nervi radialis', 'Capitulum humeri'],
                answerIndex: 2
              }
            ]
          },
          {
            title: 'Ulna',
            questions: [
              {
                question: 'Hoe heet het grote proximale uitsteeksel van de ulna dat de punt van de elleboog vormt?',
                options: ['Processus coronoideus', 'Tuberculum ulnare', 'Olecranon', 'Capitulum'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet de gewrichtsuitsparing op de ulna die met de trochlea humeri articuleert?',
                options: ['Incisura radialis', 'Incisura trochlearis', 'Fovea ulnaris', 'Facies trochlearis'],
                answerIndex: 1
              },
              {
                question: 'Waar ligt de incisura trochlearis?',
                options: ['Distaal', 'Proximaal', 'Lateraal', 'Op de radius'],
                answerIndex: 1
              },
              {
                question: 'Welke structuur ligt onder de incisura trochlearis?',
                options: ['Olecranon', 'Processus coronoideus', 'Caput ulnae', 'Incisura radialis'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het kleine gewrichtsvlak voor de radius op de ulna?',
                options: ['Processus styloideus', 'Incisura radialis', 'Fovea capitis', 'Sulcus radialis'],
                answerIndex: 1
              },
              {
                question: 'Wat vormt de achterzijde van de elleboog?',
                options: ['Processus styloideus', 'Tuberositas ulnae', 'Olecranon', 'Collum ulnae'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet de knokkelvormige verdikking aan het distale einde?',
                options: ['Caput ulnae', 'Collum ulnare', 'Fovea carpalis', 'Tuberositas ulnaris'],
                answerIndex: 0
              },
              {
                question: 'Welk uitsteeksel ligt distaal aan de ulna?',
                options: ['Trochlea', 'Processus styloideus', 'Tuberositas coronoidea', 'Facies carpalis'],
                answerIndex: 1
              },
              {
                question: 'Wat articuleert met het caput ulnae?',
                options: ['Humerus', 'Radius', 'Carpus direct', 'Scapula'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet de aanhechtingsplaats onder de processus coronoideus?',
                options: ['Tuberositas ulnae', 'Tuberositas radii', 'Tuberculum carpale', 'Groove ulnaris'],
                answerIndex: 0
              },
              {
                question: 'Wat is de vorm van de ulna?',
                options: ['Rechte buis', 'S-vormig', 'Licht gekromde pijp', 'Volledig plat'],
                answerIndex: 2
              },
              {
                question: 'Welke zijde van de onderarm vormt de ulna?',
                options: ['Lateraal (duimzijde)', 'Mediaal (pinkzijde)', 'Craniaal', 'Caudaal'],
                answerIndex: 1
              },
              {
                question: 'Welke structuur articuleert met het olecranon?',
                options: ['Fossa olecrani (humerus)', 'Fossa radialis', 'Capitulum', 'Collum humeri'],
                answerIndex: 0
              },
              {
                question: 'Wat articuleert met de incisura radialis?',
                options: ['Caput humeri', 'Caput radii', 'Trochlea humeri', 'Carpus'],
                answerIndex: 1
              },
              {
                question: 'Welke structuur zorgt voor de belangrijkste aanhechting van de m. brachialis?',
                options: ['Processus styloideus', 'Tuberculum ulnare', 'Tuberositas ulnae', 'Collum ulnae'],
                answerIndex: 2
              },
              {
                question: 'Welk bot is langer, ulna of radius?',
                options: ['Ulna', 'Radius', 'Beide even lang', 'Verschilt per persoon sterk'],
                answerIndex: 0
              },
              {
                question: 'Wat vormt het proximaal deel van het ellebooggewricht?',
                options: ['Processus styloideus', 'Olecranon + incisura trochlearis', 'Caput ulnae', 'Incisura radialis'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het eindpunt van de ulna aan de pols?',
                options: ['Processus trochlearis', 'Processus styloideus ulnae', 'Olecranon', 'Tuberculum carpale'],
                answerIndex: 1
              },
              {
                question: 'Waar bevindt zich de incisura radialis op de ulna?',
                options: ['Mediale zijde', 'Laterale zijde', 'Dorsale zijde', 'Distaal'],
                answerIndex: 1
              },
              {
                question: 'Wat is de functie van de ulna in de onderarm?',
                options: [
                  'Draaias voor pronatie-supinatie',
                  'Hoofdondersteuning van pols',
                  'Zorgt voor flexie-extensie elleboog',
                  'Draagt bovenarmgewicht'
                ],
                answerIndex: 2
              }
            ]
          },
          {
            title: 'Radius',
            questions: [
              {
                question: 'Hoe heet het bovenste uiteinde van de radius?',
                options: ['Caput radii', 'Collum radii', 'Tuberositas radii', 'Facies radialis'],
                answerIndex: 0
              },
              {
                question: 'Welk deel articuleert met het capitulum humeri?',
                options: ['Collum radii', 'Caput radii', 'Processus styloideus radii', 'Facies carpalis'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het kleine nekje net onder de radiuskop?',
                options: ['Fovea radii', 'Collum radii', 'Fossa radialis', 'Circumferentia radii'],
                answerIndex: 1
              },
              {
                question: 'Wat ligt er mediaal van de proximale radius?',
                options: ['Tuberositas radii', 'Tuberculum dorsale', 'Incisura trochlearis', 'Processus styloideus'],
                answerIndex: 0
              },
              {
                question: 'Wat hecht aan op de tuberositas radii?',
                options: ['Biceps brachii', 'Triceps brachii', 'Brachialis', 'Pronator teres'],
                answerIndex: 0
              },
              {
                question: 'Hoe heet het distale uitsteeksel dat je aan de duimzijde voelt?',
                options: ['Olecranon', 'Tuberositas radii', 'Processus styloideus radii', 'Caput radii'],
                answerIndex: 2
              },
              {
                question: 'Wat articuleert er met de incisura ulnaris van de radius?',
                options: ['Caput humeri', 'Olecranon', 'Caput ulnae', 'Carpus'],
                answerIndex: 2
              },
              {
                question: 'De radius ligt in anatomische houding…',
                options: ['Pinkzijde', 'Mediaal', 'Duimzijde', 'Dorsaal'],
                answerIndex: 2
              },
              {
                question: 'Welke beweging maakt de radius mogelijk rond de ulna?',
                options: ['Flexie', 'Extensie', 'Pronatie en supinatie', 'Circumductie'],
                answerIndex: 2
              },
              {
                question: 'Wat ligt op de distale voorzijde van de radius?',
                options: ['Fovea carpalis', 'Facies articularis carpalis', 'Sulcus radialis', 'Trochlea radii'],
                answerIndex: 1
              },
              {
                question: 'Met welke carpale beenderen articuleert de radius?',
                options: ['Pisiforme & triquetrum', 'Scaphoideum & lunatum', 'Trapezium & hamatum', 'Capitatum & trapezoideum'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet de achterste groef waar pezen doorheen lopen?',
                options: ['Tuberositas dorsalis', 'Tuberculum dorsale', 'Crista radialis', 'Sulcus radii posterior'],
                answerIndex: 1
              },
              {
                question: 'Waarvoor dient het tuberculum dorsale van Lister?',
                options: ['Aanhechting carpalisch ligament', 'Katrol voor extensorpezen', 'Aanhechting bicepspees', 'Stabilisator van elleboog'],
                answerIndex: 1
              },
              {
                question: 'Wat loopt door de incisura ulnaris van de radius?',
                options: ['Fovea capitis', 'Olecranon', 'Caput ulnae', 'Tuberositas ulnae'],
                answerIndex: 2
              },
              {
                question: 'Welke zijde van het distale radiusvlak is breder?',
                options: ['Dorsaal', 'Ventraal', 'Lateraal', 'Mediaal'],
                answerIndex: 1
              },
              {
                question: 'Wat is de vorm van de caput radii?',
                options: ['Zadelvormig', 'Schotelvormig', 'Ovaal', 'Hartvormig'],
                answerIndex: 1
              },
              {
                question: 'Welke structuur articuleert met de humerus bij flexie-extensie?',
                options: ['Tuberositas radii', 'Caput radii', 'Circumferentia articularis', 'Fovea capitis radii'],
                answerIndex: 3
              },
              {
                question: 'Waar bevindt zich de tuberositas radii?',
                options: ['Lateraal', 'Dorsaal', 'Mediaal', 'Distaal'],
                answerIndex: 2
              },
              {
                question: 'Waar ligt de circumferentia articularis radii?',
                options: ['Rond de radiuskop', 'Op de distale rand', 'Op de radiusbasis', 'Bij de tuberositas'],
                answerIndex: 0
              },
              {
                question: 'Wat vormt samen met de ulna het ellebooggewricht?',
                options: ['Caput radii', 'Trochlea en capitulum', 'Scaphoideum', 'Glenoid'],
                answerIndex: 1
              }
            ]
          },
          {
            title: 'Ossa carpi',
            questions: [
              {
                question: 'Hoeveel handwortelbeentjes heeft een mens?',
                options: ['6', '7', '8', '9'],
                answerIndex: 2
              },
              {
                question: 'In welke volgorde liggen de proximale carpalia van radiaal naar ulna?',
                options: [
                  'Trapezium – trapezoideum – capitatum – hamatum',
                  'Pisiforme – triquetrum – lunatum – scaphoideum',
                  'Scaphoideum – lunatum – triquetrum – pisiforme',
                  'Lunatum – scaphoideum – pisiforme – hamatum'
                ],
                answerIndex: 2
              },
              {
                question: 'Welk os ligt het meest radiaal in de proximale rij?',
                options: ['Lunatum', 'Scaphoideum', 'Triquetrum', 'Pisiforme'],
                answerIndex: 1
              },
              {
                question: 'Welk os ligt het meest ulnair in de proximale rij?',
                options: ['Scaphoideum', 'Hamatum', 'Pisiforme', 'Capitatum'],
                answerIndex: 2
              },
              {
                question: 'Welk bot hecht aan op het os pisiforme?',
                options: ['Flexor carpi radialis', 'Flexor carpi ulnaris', 'Extensor digitorum', 'Pronator quadratus'],
                answerIndex: 1
              },
              {
                question: 'Welk carpale bot articuleert met de radius?',
                options: ['Hamatus', 'Capitatum', 'Scaphoideum en lunatum', 'Triquetrum en pisiforme'],
                answerIndex: 2
              },
              {
                question: 'Wat is het grootste carpale bot?',
                options: ['Trapezoideum', 'Hamatum', 'Capitatum', 'Scaphoideum'],
                answerIndex: 2
              },
              {
                question: 'Welk bot heeft een haakvormig uitsteeksel (“hamulus”)?',
                options: ['Hamatum', 'Capitatum', 'Trapezium', 'Pisiforme'],
                answerIndex: 0
              },
              {
                question: 'Welk carpale bot ligt onder de duim?',
                options: ['Pisiforme', 'Trapezium', 'Hamatum', 'Lunatum'],
                answerIndex: 1
              },
              {
                question: 'Welke botten vormen de distale carpale rij?',
                options: [
                  'Scaphoideum – lunatum – triquetrum – pisiforme',
                  'Trapezium – trapezoideum – capitatum – hamatum',
                  'Radius – ulna – pisiforme – scaphoideum',
                  'Capitatum – lunatum – pisiforme – trapezoideum'
                ],
                answerIndex: 1
              },
              {
                question: 'Welk bot vormt een belangrijk deel van het “snuff box”-gebied?',
                options: ['Triquetrum', 'Capitatum', 'Scaphoideum', 'Lunatum'],
                answerIndex: 2
              },
              {
                question: 'Welk carpale bot luxeert het snelst?',
                options: ['Capitatum', 'Scaphoideum', 'Lunatum', 'Trapezoideum'],
                answerIndex: 2
              },
              {
                question: 'Welk bot ligt direct ventraal op het triquetrum?',
                options: ['Pisiforme', 'Lunatum', 'Capitatum', 'Trapezium'],
                answerIndex: 0
              },
              {
                question: 'Wat articuleert met het trapezium?',
                options: ['Ulna', 'Duimmetacarpale (MC I)', 'Radius', 'Hamatum'],
                answerIndex: 1
              },
              {
                question: 'Welk bot ligt centraal in de distale rij?',
                options: ['Trapezium', 'Trapezoideum', 'Capitatum', 'Hamatum'],
                answerIndex: 2
              },
              {
                question: 'Wat is de functie van het hamulus ossis hamati?',
                options: ['Aanhechting biceps', 'Beschermen van zenuwen en pezen', 'Hechting aan de ulna', 'Ondersteunen van duimoppositie'],
                answerIndex: 1
              },
              {
                question: 'Wat is het kleinste carpale bot?',
                options: ['Pisiforme', 'Scaphoideum', 'Lunatum', 'Trapezium'],
                answerIndex: 0
              },
              {
                question: 'Welk bot ligt tussen scaphoideum en capitatum?',
                options: ['Lunatum', 'Pisiforme', 'Hamatum', 'Trapezoideum'],
                answerIndex: 0
              },
              {
                question: 'Wat articuleert met het hamatum aan de laterale zijde?',
                options: ['Trapezium', 'Pisiforme', 'Capitatum', 'Scaphoideum'],
                answerIndex: 2
              },
              {
                question: 'Met welke twee botten articuleert het triquetrum?',
                options: ['Scaphoideum & trapezium', 'Lunatum & pisiforme', 'Radius & ulna', 'Trapezoideum & capitatum'],
                answerIndex: 1
              }
            ]
          }
        ]
      },
      {
        id: 'torso',
        domain: 'osteologie',
        section: 'osteo-upper',
        title: 'As tot os coxae',
        description: 'Van atlas en axis tot het bekkengebied (valt onder bovenste ledematen).',
        quizSets: [
          {
            title: 'Atlas (C1)',
            questions: [
              {
                question: 'Waar zit de fovea dentis?',
                options: [
                  'Op de arcus posterior',
                  'Op de massa lateralis',
                  'Op de arcus anterior',
                  'Op het processus transversus'
                ],
                answerIndex: 2
              },
              {
                question: 'Wat schuift in de fovea dentis?',
                options: ['Caput radii', 'Dens van axis', 'Tuberculum posterius', 'Processus costalis'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet de voorkant van de ring van de atlas?',
                options: ['Arcus posterior', 'Arcus anterior', 'Lamina arcus', 'Crista anterior'],
                answerIndex: 1
              },
              {
                question: 'Welk deel van de atlas draagt het gewicht van het hoofd?',
                options: ['Tuberculum anterius', 'Massa lateralis', 'Arcus posterior', 'Foramen transversarium'],
                answerIndex: 1
              },
              {
                question: 'Wat loopt door het foramen transversarium?',
                options: ['Ruggenmerg', 'Vertebrale arteriën', 'N. phrenicus', 'V. jugularis interna'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het kleine knobbeltje aan de achterkant van de atlas?',
                options: ['Tuberculum posterius', 'Spina atlas', 'Processus spinosus', 'Crista dorsalis'],
                answerIndex: 0
              },
              {
                question: 'Wat ontbreekt bij de atlas t.o.v. andere wervels?',
                options: ['Arcus', 'Processus transversus', 'Corpus vertebrae', 'Foramen vertebrale'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet het gewrichtsvlak voor de condyli occipitales?',
                options: [
                  'Facies costalis',
                  'Facies articularis superior',
                  'Facies articularis inferior',
                  'Fovea cranialis'
                ],
                answerIndex: 1
              },
              {
                question: 'Wat is de functie van de massa lateralis?',
                options: [
                  'Aanhechting ribben',
                  'Draaibeweging mogelijk maken',
                  'Gewrichtsvlak voor schedel dragen',
                  'Aanhechting rugspieren'
                ],
                answerIndex: 2
              },
              {
                question: 'Wat is kenmerkend voor de atlas?',
                options: [
                  'Een dikke processus spinosus',
                  'Een dens',
                  'Een ringvormige structuur',
                  'Een groot corpus'
                ],
                answerIndex: 2
              },
              {
                question: 'Wat ligt er direct achter de arcus anterior?',
                options: [
                  'Tuberculum posterius',
                  'Fovea dentis',
                  'Facies articularis superior',
                  'Foramen transversarium'
                ],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het grote gat in de atlas?',
                options: [
                  'Foramen transversarium',
                  'Foramen magnum',
                  'Foramen vertebrale',
                  'Foramen intervertebrale'
                ],
                answerIndex: 2
              },
              {
                question: 'Welke structuur articuleert met de axis?',
                options: [
                  'Facies articularis superior',
                  'Fovea dentis',
                  'Facies articularis inferior',
                  'Arcus posterior'
                ],
                answerIndex: 2
              },
              {
                question: 'Wat is de functie van de arcus posterior?',
                options: [
                  'Beschermt ruggenmerg',
                  'Verankert ribben',
                  'Vormt draaipunt met dens',
                  'Vormt gewricht met schedel'
                ],
                answerIndex: 0
              },
              {
                question: 'Wat is de naam van het knobbeltje aan de voorzijde?',
                options: [
                  'Tuberculum anterius',
                  'Tuberculum laterale',
                  'Tuberculum articulare',
                  'Processus anterior'
                ],
                answerIndex: 0
              },
              {
                question: 'De atlas laat voornamelijk welke beweging toe?',
                options: ['“Nee”-beweging', '“Ja”-beweging', 'Lateroflexie', 'Hyperextensie'],
                answerIndex: 1
              },
              {
                question: 'Op welke structuur rust de schedel?',
                options: [
                  'Facies articularis inferior',
                  'Tuberculum anterius',
                  'Facies articularis superior',
                  'Arcus posterior'
                ],
                answerIndex: 2
              },
              {
                question: 'Wat vormt het dorsale deel van de ring?',
                options: ['Arcus anterior', 'Tuberculum anterius', 'Arcus posterior', 'Massa lateralis'],
                answerIndex: 2
              },
              {
                question: 'Wat bevindt zich posterieur aan het foramen vertebrale?',
                options: ['Arcus posterior', 'Dens', 'Corpus vertebrae', 'Massa lateralis'],
                answerIndex: 0
              },
              {
                question: 'Welke uitspraak klopt?',
                options: [
                  'Atlas heeft een corpus',
                  'Atlas heeft geen processus transversus',
                  'Atlas heeft een typische processus spinosus',
                  'Atlas heeft geen corpus'
                ],
                answerIndex: 3
              }
            ]
          },
          {
            title: 'Axis (C2)',
            questions: [
              {
                question: 'Wat is het meest kenmerkende deel van de axis?',
                options: ['Tuberculum anterius', 'Dens', 'Corpus vertebrae ontbreekt', 'Foramen transversarium ontbreekt'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het puntje bovenaan de dens?',
                options: ['Crista dentis', 'Apex dentis', 'Tuberculum dentale', 'Spina dentis'],
                answerIndex: 1
              },
              {
                question: 'Waar articuleert de dens mee?',
                options: [
                  'Arcus posterior van de atlas',
                  'Facies articularis inferior van de atlas',
                  'Fovea dentis in de atlas',
                  'Corpus atlantis'
                ],
                answerIndex: 2
              },
              {
                question: 'Waarvoor dient de dens?',
                options: ['Voor flexie/extensie', 'Voor de draaibeweging (“nee”-beweging)', 'Voor lateroflexie', 'Voor stabiliteit van het sacrum'],
                answerIndex: 1
              },
              {
                question: 'De axis heeft een duidelijk ontwikkeld…',
                options: ['Corpus vertebrae', 'Apex costalis', 'Ramus vertebralis', 'Tuberculum posterior'],
                answerIndex: 0
              },
              {
                question: 'De processus spinosus van de axis is…',
                options: ['Niet aanwezig', 'Dubbel gespleten', 'Zeer lang', 'Glad en rond'],
                answerIndex: 1
              },
              {
                question: 'Waar liggen de facies articulares superiores van de axis?',
                options: ['Boven op de dens', 'Lateraal van de dens', 'Onder de massa lateralis', 'Dorsaal van de arcus anterior'],
                answerIndex: 1
              },
              {
                question: 'Wat loopt door het foramen transversarium van de axis?',
                options: ['Spinale zenuwen', 'Vena cava', 'A. vertebralis', 'Slagaders naar het sacrum'],
                answerIndex: 2
              },
              {
                question: 'Waar bevindt zich het corpus vertebrae van de axis?',
                options: ['Het is afwezig', 'Onder de dens', 'Op de arcus posterior', 'Onder de fovea dentis'],
                answerIndex: 1
              },
              {
                question: 'Welke beweging gebeurt in articulatie tussen atlas en axis?',
                options: ['“Ja”-beweging', 'Lateroflexie', '“Nee”-beweging', 'Extensie'],
                answerIndex: 2
              },
              {
                question: 'Welk deel van de axis articuleert met de atlas?',
                options: ['Processus spinosus', 'Facies articularis superior', 'Arcus posterior', 'Apex dentis'],
                answerIndex: 1
              },
              {
                question: 'Waar ligt de dens t.o.v. de axis?',
                options: ['Ventraal', 'Dorsaal', 'Lateraal', 'Caudaal'],
                answerIndex: 0
              },
              {
                question: 'Wat ligt dorsaal van het corpus van de axis?',
                options: ['Dens', 'Foramen vertebrale', 'Processus spinosus', 'Processus articularis inferior'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het botdeel waar ruggenmerg doorheen loopt?',
                options: ['Foramen dentis', 'Foramen transversarium', 'Foramen articulare', 'Foramen vertebrale'],
                answerIndex: 3
              },
              {
                question: 'Welke structuur ligt direct achter de dens?',
                options: ['Ligamenten', 'Ruggenmerg', 'Arcus posterior atlas', 'Fovea dentis'],
                answerIndex: 2
              },
              {
                question: 'Wat zit er op de apex dentis?',
                options: ['Niets, het is een punt', 'Een gewrichtsvlak', 'Aanhechting voor ribben', 'Een peesgroeve'],
                answerIndex: 0
              },
              {
                question: 'De processus articularis inferior staat in verbinding met…',
                options: ['Axis', 'Atlas', 'C3 cervicale wervel', 'Sacrum'],
                answerIndex: 2
              },
              {
                question: 'De axis maakt deel uit van welke groep wervels?',
                options: ['Thoracaal', 'Sacraal', 'Cervicaal', 'Lumbaal'],
                answerIndex: 2
              },
              {
                question: 'Wat ligt er lateraal op de axis?',
                options: ['Processus transversus', 'Dens', 'Apex dentis', 'Tuberculum transversum'],
                answerIndex: 0
              },
              {
                question: 'Wat is de functie van de processus spinosus bij de axis?',
                options: ['Draagt schedel', 'Geeft aanhechting aan spieren', 'Articuleert met atlas', 'Maakt rotatie mogelijk'],
                answerIndex: 1
              }
            ]
          },
          {
            title: 'Cervicale wervels (C3–C7)',
            questions: [
              {
                question: 'Wat is het typische kenmerk van cervicale wervels?',
                options: [
                  'Geen foramen transversarium',
                  'Foramen transversarium aanwezig',
                  'Ze hebben een dens',
                  'Ze hebben zeer lange spinosi'
                ],
                answerIndex: 1
              },
              {
                question: 'Welke vorm heeft het corpus van een cervicale wervel?',
                options: ['Rond', 'Driehoekig', 'Rechthoekig', 'Hartvormig'],
                answerIndex: 2
              },
              {
                question: 'Hoe ziet het foramen vertebrale eruit bij cervicale wervels?',
                options: ['Rond', 'Driehoekig', 'Ovaal', 'Klein en smal'],
                answerIndex: 1
              },
              {
                question: 'Wat loopt door het foramen transversarium?',
                options: ['Ruggenmerg', 'A. vertebralis', 'N. vagus', 'V. cava superior'],
                answerIndex: 1
              },
              {
                question: 'Wat is kenmerkend voor de processus spinosus bij C3–C6?',
                options: ['Ze zijn gespleten', 'Ze zijn niet aanwezig', 'Ze zijn massief en rond', 'Ze wijzen recht naar boven'],
                answerIndex: 0
              },
              {
                question: 'Wat is het belangrijkste verschil tussen C7 en andere cervicale wervels?',
                options: [
                  'C7 heeft geen corpus',
                  'C7 heeft geen foramen transversarium',
                  'C7 heeft een zeer prominente processus spinosus',
                  'C7 heeft een dens'
                ],
                answerIndex: 2
              },
              {
                question: 'Hoe noemt men de wervel C7?',
                options: ['Atlas', 'Axis', 'Vertebra prominens', 'Cervicale tuberculum'],
                answerIndex: 2
              },
              {
                question: 'Wat is de functie van de processus transversus?',
                options: [
                  'Beschermen van ruggenmerg',
                  'Aanhechting van spieren',
                  'Draaipunt van rotatie',
                  'Contactvlak met ribben'
                ],
                answerIndex: 1
              },
              {
                question: 'Hoe staat de processus spinosus t.o.v. de wervelboog?',
                options: ['Ventraal', 'Lateraal', 'Dorsaal', 'Craniaal'],
                answerIndex: 2
              },
              {
                question: 'Wat ligt er direct achter het corpus vertebrae?',
                options: ['Processus transversus', 'Foramen transversarium', 'Arcus vertebrae', 'Processus articularis superior'],
                answerIndex: 2
              },
              {
                question: 'Welke structuur vormt het gewricht met bovenliggende wervel?',
                options: ['Facies articularis superior', 'Facies costalis', 'Fovea ribalis', 'Tuberculum articulare'],
                answerIndex: 0
              },
              {
                question: 'Hoe ziet de processus transversus eruit in cervicale wervels?',
                options: ['Verdikt en naar boven gericht', 'Bevat een opening (foramen)', 'Zeer kort', 'Naar mediaal gericht'],
                answerIndex: 1
              },
              {
                question: 'Welke bewegingen zijn het meest mogelijk in de cervicale regio?',
                options: ['Rotatie', 'Flexie-extensie + rotatie', 'Alleen extensie', 'Enkel lateroflexie'],
                answerIndex: 1
              },
              {
                question: 'Wat ligt er in het foramen vertebrale?',
                options: ['Longslagaders', 'Ruggenmerg', 'Slokdarm', 'Luchtpijp'],
                answerIndex: 1
              },
              {
                question: 'Waarvoor dient het corpus vertebrae vooral?',
                options: ['Bescherming', 'Aanhechting spieren', 'Dragende functie', 'Rotatiefunctie'],
                answerIndex: 2
              },
              {
                question: 'Welke structuur hoort NIET bij cervicale wervels?',
                options: ['Foramen transversarium', 'Dens', 'Processus spinosus', 'Corpus vertebrae'],
                answerIndex: 1
              },
              {
                question: 'Hoe staan de gewrichtsoppervlakken bij cervicale wervels?',
                options: ['Heel vlak', 'Heel steil', 'Loodrecht', 'Horizontaal'],
                answerIndex: 0
              },
              {
                question: 'Welke wervel is het meest beweeglijk?',
                options: ['Sacraal', 'Lumbaal', 'Thoracaal', 'Cervicaal'],
                answerIndex: 3
              },
              {
                question: 'Hoe heet het deel tussen corpus en processus spinosus?',
                options: ['Arcus vertebrae', 'Tuberculum posterior', 'Ramus dorsalis', 'Fovea arcus'],
                answerIndex: 0
              },
              {
                question: 'Waar zit de processus articularis inferior?',
                options: [
                  'Boven de massa lateralis',
                  'Onder de processus articularis superior',
                  'Op het corpus',
                  'In het foramen vertebrale'
                ],
                answerIndex: 1
              }
            ]
          },
          {
            title: 'Thoracale wervels (T1–T12)',
            questions: [
              {
                question: 'Wat is het typische kenmerk van thoracale wervels?',
                options: ['Ze hebben foramen transversarium', 'Ze articuleren met ribben', 'Ze hebben een dens', 'Ze hebben geen processus spinosus'],
                answerIndex: 1
              },
              {
                question: 'Welke vorm heeft het foramen vertebrale bij thoracale wervels?',
                options: ['Driehoekig', 'Rond', 'Rechthoekig', 'Hartvormig'],
                answerIndex: 0
              },
              {
                question: 'Wat is de vorm van het corpus bij een thoracale wervel?',
                options: ['Rechthoekig', 'Klein en rond', 'Hartvormig', 'Zeer plat'],
                answerIndex: 2
              },
              {
                question: 'Waarvoor dient de fovea costalis op de wervel?',
                options: ['Bevestiging van ligamenten', 'Aanhechting van spieren', 'Gewrichtsvlak voor ribben', 'Doorlaat voor bloedvaten'],
                answerIndex: 2
              },
              {
                question: 'Waar bevindt de fovea costalis superior/inferior zich?',
                options: ['Op het corpus vertebrae', 'Op de arcus', 'Op de processus transversus', 'Op de processus spinosus'],
                answerIndex: 0
              },
              {
                question: 'Wat ligt er op de processus transversus van een thoracale wervel?',
                options: ['Fovea costalis transversalis', 'Fovea dentis', 'Fovea capitis', 'Fovea transversaria'],
                answerIndex: 0
              },
              {
                question: 'Hoe ziet de processus spinosus eruit bij thoracale wervels?',
                options: ['Kort en gespleten', 'Lang en naar caudaal gericht', 'Helemaal afwezig', 'Zeer horizontaal'],
                answerIndex: 1
              },
              {
                question: 'Wat is de oriëntatie van de gewrichtsvlakken bij thoracaal?',
                options: ['Heel vlak', 'Steil en gehoekt', 'Loodrecht', 'Naar boven gedraaid'],
                answerIndex: 1
              },
              {
                question: 'Welke beweging is in thoracale wervels het meest mogelijk?',
                options: ['Flexie-extensie', 'Rotatie', 'Circumductie', 'Hyperextensie'],
                answerIndex: 1
              },
              {
                question: 'Wat ligt er achter het corpus van de wervel?',
                options: ['Processus transversus', 'Arcus vertebrae', 'Foramen transversarium', 'Discus articularis'],
                answerIndex: 1
              },
              {
                question: 'Welke structuur articuleert met het tuberculum costae van de rib?',
                options: ['Corpus', 'Processus transversus', 'Lamina', 'Processus spinosus'],
                answerIndex: 1
              },
              {
                question: 'Wat vormt samen de arcus vertebrae?',
                options: ['Lamina + pediculi', 'Corpus + processus spinosus', 'Discus + foramen', 'Rib + tuberculum'],
                answerIndex: 0
              },
              {
                question: 'Met welke wervelkolomregio vormt de thoracale wervel een kyfose?',
                options: ['Lumbaal', 'Cervicaal', 'Sacraal', 'Thoracaal zelf'],
                answerIndex: 3
              },
              {
                question: 'Het corpus van thoracale wervels is…',
                options: ['Slecht ontwikkeld', 'Erg klein', 'Meer ontwikkeld dan cervicaal', 'Minder ontwikkeld dan lumbaal'],
                answerIndex: 2
              },
              {
                question: 'De rib articuleert met…',
                options: ['Alleen corpus', 'Alleen processus transversus', 'Corpus én processus transversus', 'Alleen lamina'],
                answerIndex: 2
              },
              {
                question: 'Welke wervelregio is het minst beweeglijk?',
                options: ['Lumbaal', 'Thoracaal', 'Cervicaal', 'Sacraal'],
                answerIndex: 1
              },
              {
                question: 'Hoe ziet de processus transversus eruit?',
                options: ['Kort en dun', 'Groot met fovea costalis', 'Verdikt en naar craniaal gericht', 'Naar mediaal gericht'],
                answerIndex: 1
              },
              {
                question: 'Wat is de belangrijkste reden voor beperkte beweging in thoracaal?',
                options: ['Discus is te groot', 'De ribben beperken beweging', 'De processus spinosus is te kort', 'De wervel is te klein'],
                answerIndex: 1
              },
              {
                question: 'Waar bevindt zich het gewrichtsvlak voor het caput costae?',
                options: ['Op lamina', 'Op corpus vertebrae', 'Op het foramen', 'Op de spinosus'],
                answerIndex: 1
              },
              {
                question: 'Wat is het meest herkenbare kenmerk van T-wervels?',
                options: ['Fovea costalis', 'Dens', 'Gespleten spinosus', 'Groot foramen transversarium'],
                answerIndex: 0
              }
            ]
          },
          {
            title: 'Lumbale wervels (L1–L5)',
            questions: [
              {
                question: 'Wat is het meest herkenbare kenmerk van lumbale wervels?',
                options: ['Een dens', 'Groot en massief corpus', 'Fovea costalis', 'Foramen transversarium'],
                answerIndex: 1
              },
              {
                question: 'Hoe ziet het corpus vertebrae eruit bij een lumbale wervel?',
                options: ['Driehoekig', 'Hartvormig', 'Boonvormig', 'Rond'],
                answerIndex: 2
              },
              {
                question: 'Waarom is het corpus zo groot?',
                options: ['Voor rotatie', 'Om ribben te dragen', 'Om gewicht te dragen', 'Voor lateroflexie'],
                answerIndex: 2
              },
              {
                question: 'Hoe ziet het foramen vertebrale eruit bij L-wervels?',
                options: ['Cirkelvormig', 'Driehoekig', 'Zeer klein', 'Onderbroken'],
                answerIndex: 1
              },
              {
                question: 'Hoe ziet de processus spinosus eruit?',
                options: ['Lang en caudaal gericht', 'Kort en stomp', 'Gespleten', 'Niet aanwezig'],
                answerIndex: 1
              },
              {
                question: 'Wat is een typisch kenmerk van de processus transversus in lumbaal?',
                options: ['Zeer groot', 'Horizontaal gericht', 'Met foramen transversarium', 'Naar craniaal gericht'],
                answerIndex: 1
              },
              {
                question: 'Wat is de oriëntatie van de gewrichtsvlakken bij lumbaal?',
                options: ['Horizontaal', 'Verticaler/loodrecht', 'Steil en gehoekt', 'Plat en ovaal'],
                answerIndex: 1
              },
              {
                question: 'Welke beweging is het minst mogelijk in de lumbale regio?',
                options: ['Flexie', 'Extensie', 'Lateroflexie', 'Rotatie'],
                answerIndex: 3
              },
              {
                question: 'Wat bevindt zich tussen twee corpussen van lumbale wervels?',
                options: ['Geen schijf', 'Tussenwervelschijf', 'Ligament transversum', 'Fovea lumbalis'],
                answerIndex: 1
              },
              {
                question: 'Wat is een functie van de lumbale wervelkolom?',
                options: ['Rotatie zoals in cervicale regio', 'Draagt het bovenlichaam', 'Verbinding met ribben', 'Ondersteunt de schedel'],
                answerIndex: 1
              },
              {
                question: 'Hoe ziet de arcus vertebrae eruit in een lumbale wervel?',
                options: ['Heel dik en stevig', 'Dun en lang', 'Geen arcus aanwezig', 'Zoals cervicaal'],
                answerIndex: 0
              },
              {
                question: 'Wat vormt het foramen vertebrale?',
                options: ['Corpus + spieraanhechtingen', 'Arcus + corpus', 'Tuberculum + processus', 'Costale koppelingen'],
                answerIndex: 1
              },
              {
                question: 'Wat ligt er dorsaal van het corpus vertebrae?',
                options: ['Discus', 'Arcus vertebrae', 'Ribben', 'Processus transversus'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het uitsteeksel dat achteraan zit?',
                options: ['Processus articularis', 'Arcus posterior', 'Processus spinosus', 'Manubrium'],
                answerIndex: 2
              },
              {
                question: 'Waarom is rotatie beperkt in lumbaal?',
                options: ['Door ribben', 'Door hoge processus spinosus', 'Door oriëntatie gewrichtsvlakken', 'Door dens'],
                answerIndex: 2
              },
              {
                question: 'Welke wervelregio is het meest stabiel?',
                options: ['Cervicaal', 'Thoracaal', 'Lumbaal', 'Sacraal'],
                answerIndex: 2
              },
              {
                question: 'Hoe heten de gewrichtsuitsteeksels?',
                options: ['Processus dentales', 'Processus articularis', 'Processus obliqui', 'Tuberculum anterior'],
                answerIndex: 1
              },
              {
                question: 'Hoe ziet de processus transversus eruit t.o.v. cervicale wervels?',
                options: ['Groter en zonder foramen', 'Kleiner en met foramen', 'Gespleten', 'Niet aanwezig'],
                answerIndex: 0
              },
              {
                question: 'Wat ligt er in het foramen vertebrale?',
                options: ['Nieren', 'Ruggenmerg', 'Longen', 'Slokdarm'],
                answerIndex: 1
              },
              {
                question: 'Waarvoor dient de lumbale lordose?',
                options: ['Voor bescherming van ribben', 'Voor balans en schokabsorptie', 'Om rotaties mogelijk te maken', 'Om het sacrum te verbinden'],
                answerIndex: 1
              }
            ]
          },
          {
            title: 'Os sacrum',
            questions: [
              {
                question: 'Waaruit bestaat het os sacrum?',
                options: ['3 vergroeide wervels', '5 vergroeide wervels', '7 vergroeide wervels', '2 vergroeide wervels'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet de bovenste uitstekende rand van het sacrum?',
                options: ['Basis ossis sacri', 'Ala sacralis', 'Promontorium', 'Crista sacralis'],
                answerIndex: 2
              },
              {
                question: 'Wat loopt door het canalis sacralis?',
                options: ['Ruggenmerg', 'Zenuwwortels', 'Aorta', 'Slokdarm'],
                answerIndex: 1
              },
              {
                question: 'Hoe noemen we de openingen aan de voorzijde van het sacrum?',
                options: ['Foramina sacralia posteriora', 'Foramina sacralia anteriora', 'Hiatus sacralis', 'Foramen obturatum'],
                answerIndex: 1
              },
              {
                question: 'Wat bevindt zich op de dorsale middenlijn van het sacrum?',
                options: ['Crista sacralis mediana', 'Processus dentatus', 'Processus spinosus', 'Linea glutea'],
                answerIndex: 0
              },
              {
                question: 'Wat ligt er lateraal van de crista sacralis mediana?',
                options: ['Foramina anteriora', 'Tuberositas sacralis', 'Crista sacralis lateralis', 'Ala ossis sacri'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet de achterste opening van het sacraal kanaal?',
                options: ['Hiatus sacralis', 'Foramen sacrale', 'Fossa sacralis', 'Incisura sacralis'],
                answerIndex: 0
              },
              {
                question: 'Hoe heet de ruwe zone voor ligamentaanhechting?',
                options: ['Facies auricularis', 'Tuberositas ossis sacri', 'Fovea sacralis', 'Sinus sacralis'],
                answerIndex: 1
              },
              {
                question: 'Met welk bot articuleert het sacrum lateraal?',
                options: ['Os pubis', 'Os ilium', 'Os ischii', 'Femur'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het oorvormige gewrichtsvlak?',
                options: ['Facies ophthalmica', 'Facies auricularis', 'Facies articularis superior', 'Facies sacralis'],
                answerIndex: 1
              },
              {
                question: 'Wat vormen de vergroeide processus spinosi van het sacrum?',
                options: ['Crista glutea', 'Crista sacralis mediana', 'Crista sacralis posterior', 'Crista intermedia'],
                answerIndex: 1
              },
              {
                question: 'Wat is de functie van het sacrum?',
                options: ['Beweging mogelijk maken', 'Verbinding tussen beide os coxae', 'Rotatie van wervelkolom', 'Aanhechting van ribben'],
                answerIndex: 1
              },
              {
                question: 'Wat loopt door de foramina sacralia anteriora?',
                options: ['Slagaders', 'Spinale zenuwen', 'Wervelslagader', 'Spieraanhechtingen'],
                answerIndex: 1
              },
              {
                question: 'Welke structuur ligt direct boven het sacrum?',
                options: ['L2', 'L3', 'L4', 'L5'],
                answerIndex: 3
              },
              {
                question: 'Wat bevindt zich naast de ala ossis sacri?',
                options: ['Foramina posteriora', 'Facies auricularis', 'Foramen obturatum', 'Symphysis pubica'],
                answerIndex: 1
              },
              {
                question: 'Waar eindigt het canalis sacralis caudaal?',
                options: ['Promontorium', 'Crista sacralis', 'Hiatus sacralis', 'Corpus sacri'],
                answerIndex: 2
              },
              {
                question: 'Wat is de vorm van het sacrum dorsaal gezien?',
                options: ['Recht', 'Hol', 'Bol', 'Driehoekig'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet de laterale rand van het sacrum?',
                options: ['Tuberositas arcuata', 'Margo lateralis', 'Linea arcuata', 'Linea intermedia'],
                answerIndex: 1
              },
              {
                question: 'Wat zit er ventraal op het sacrum?',
                options: ['Crista sacralis medialis', 'Lineae transversae', 'Facies auricularis', 'Foramina posteriora'],
                answerIndex: 1
              },
              {
                question: 'Wat is typisch aan het sacrum?',
                options: ['Zeer beweeglijk', 'Geen tussenwervelschijven', '7 processus transversi', 'Het bevat een dens'],
                answerIndex: 1
              }
            ]
          },
          {
            title: 'Os coccygis',
            questions: [
              {
                question: 'Waaruit bestaat het os coccygis?',
                options: ['2–3 vergroeide wervels', '3–5 vergroeide wervels', '7 vergroeide wervels', '1 wervel'],
                answerIndex: 1
              },
              {
                question: 'Waar bevindt het staartbeen zich?',
                options: ['Tussen de lumbale wervels', 'Onder het sacrum', 'Voor het os pubis', 'Achter de ribben'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het gewricht tussen sacrum en coccyx?',
                options: ['Articulatio sacrococcygea', 'Articulatio sacroiliaca', 'Articulatio interpubica', 'Articulatio lumbo-sacralis'],
                answerIndex: 0
              },
              {
                question: 'Wat is de belangrijkste functie van het os coccygis?',
                options: ['Gewicht dragen', 'Spier- en ligamentaanhechting', 'Bescherming van organen', 'Articulatie met femur'],
                answerIndex: 1
              },
              {
                question: 'Hoe is de vorm van het coccyx best te omschrijven?',
                options: ['Hartvormig', 'Driehoekig', 'Zwaardvormig', 'Boogvormig'],
                answerIndex: 2
              },
              {
                question: 'Wat bevindt zich boven het os coccygis?',
                options: ['Femur', 'Sacrum', 'L3', 'Pubis'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het eerste segment van het staartbeen?',
                options: ['Cornu coccygeum', 'Corpus coccygis', 'Basis coccygis', 'Apex coccygis'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet het onderste puntje van het coccyx?',
                options: ['Apex coccygis', 'Promontorium', 'Tuberositas coccygea', 'Cornu sacralis'],
                answerIndex: 0
              },
              {
                question: 'Wat zijn de cornua coccygea?',
                options: ['Kleine ribuitsteeksels', 'Processus spinosi', 'Uitsteeksels die naar het sacrum wijzen', 'Inkepingen voor zenuwen'],
                answerIndex: 2
              },
              {
                question: 'Wat gebeurt er meestal met het coccyx bij volwassenen?',
                options: ['Het vergroot', 'Het wordt botweefsel met tussenwervelschijven', 'Het vergroeid volledig', 'Het draait naar craniaal'],
                answerIndex: 2
              },
              {
                question: 'Welke beweging is mogelijk in de articulatio sacrococcygea?',
                options: ['Rotatie', 'Extensie', 'Lichte flexie', 'Geen enkele beweging'],
                answerIndex: 2
              },
              {
                question: 'Bij vrouwen is het coccyx vaak…',
                options: ['Veel korter', 'Naar ventraal gericht', 'Meer beweeglijk', 'Groter dan bij mannen'],
                answerIndex: 2
              },
              {
                question: 'Wat hecht er onder meer aan het os coccygis?',
                options: ['Gluteus medius', 'Ligamenten van bekkenbodem', 'Hamstrings', 'Quadriceps'],
                answerIndex: 1
              },
              {
                question: 'Wat ligt er ventraal van het coccyx?',
                options: ['Sacraal kanaal', 'Rectum', 'Spina ischiadica', 'Blaswand'],
                answerIndex: 1
              },
              {
                question: 'Hoe noemen we een pijnlijke kneuzing van het coccyx?',
                options: ['Coccygodynie', 'Sacrodynie', 'Coccytitis', 'Coxalgie'],
                answerIndex: 0
              },
              {
                question: 'Het coccyx bevat…',
                options: ['Grote gewrichtsvlakken', 'Kleine rudimentaire processus', 'Een dens', 'Foramina zoals het sacrum'],
                answerIndex: 1
              },
              {
                question: 'Wat is de positie van het coccyx bij anatomische houding?',
                options: ['Ventraal gekromd', 'Dorsaal gekromd', 'Helemaal recht', 'Naar links gericht'],
                answerIndex: 0
              },
              {
                question: 'De coccygeale wervels bevatten…',
                options: ['Geen corpus', 'Een zeer klein corpus', 'Grote processus transversi', 'Een volledig wervellichaam zoals L1'],
                answerIndex: 1
              },
              {
                question: 'Wat is het grootste verschil met het sacrum?',
                options: ['Het sacrum beweegt veel meer', 'Het coccyx is langer', 'Het coccyx is veel kleiner en eenvoudiger', 'Het coccyx articuleert met ribben'],
                answerIndex: 2
              },
              {
                question: 'Wat is de bovenste rand van het os coccygis?',
                options: ['Apex', 'Basis', 'Cornu', 'Tuberositas'],
                answerIndex: 1
              }
            ]
          },
          {
            title: 'Sternum',
            questions: [
              {
                question: 'Uit welke delen bestaat het sternum?',
                options: ['Manubrium – Corpus – Processus xiphoideus', 'Basis – Corpus – Ala', 'Caput – Collum – Corpus', 'Manubrium – Arcus – Tuberculum'],
                answerIndex: 0
              },
              {
                question: 'Hoe heet de bovenste inkeping van het sternum?',
                options: ['Incisura costalis', 'Incisura clavicularis', 'Incisura jugularis', 'Fovea sternalis'],
                answerIndex: 2
              },
              {
                question: 'Waar articuleren de claviculae met het sternum?',
                options: ['Op het corpus sterni', 'Op de incisura costalis', 'Op de incisura clavicularis', 'Op het xiphoïd'],
                answerIndex: 2
              },
              {
                question: 'Waar articuleren de ribben met het sternum?',
                options: ['Incisura jugularis', 'Incisura costalis', 'Foramen sternale', 'Crista sterni'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het onderste deel van het sternum?',
                options: ['Processus xiphoideus', 'Corpus sterni', 'Manubrium', 'Tuberculum sterni'],
                answerIndex: 0
              },
              {
                question: 'Wat ligt er tussen het manubrium en corpus sterni?',
                options: ['Corpus costae', 'Angulus sterni', 'Tuberositas sterni', 'Arcus sterni'],
                answerIndex: 1
              },
              {
                question: 'Wat is het Angulus Sterni?',
                options: ['Een aanhechtingsplaats voor de ribben', 'De overgang tussen corpus en xiphoid', 'Een voelbare hoek tussen manubrium en corpus', 'De verbinding tussen sternum en clavicula'],
                answerIndex: 2
              },
              {
                question: 'Hoeveel incisurae costales zijn er aan elke zijde van het sternum?',
                options: ['3', '5', '7', '12'],
                answerIndex: 2
              },
              {
                question: 'Wat hecht vast aan de Processus xiphoideus?',
                options: ['Rib 1', 'Clavicula', 'Buikspieren', 'Trapzius'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet het kraakbeen dat ribben met sternum verbindt?',
                options: ['Cartilago costalis', 'Ligamentum costosternale', 'Capsula costalis', 'Cartilago sternale'],
                answerIndex: 0
              },
              {
                question: 'Waar ligt het sternum anatomisch?',
                options: ['Lateraal in de thorax', 'Dorsaal in de thorax', 'Anterieur in de thorax', 'Onder de clavicula alleen'],
                answerIndex: 2
              },
              {
                question: 'Welke vorm heeft het sternum?',
                options: ['Driehoekig', 'Zwaardvormig', 'Kubusvormig', 'C-vormig'],
                answerIndex: 1
              },
              {
                question: 'Het sternum beschermt vooral…',
                options: ['Hersenen', 'Ruggenmerg', 'Longen en hart', 'Bekkenorganen'],
                answerIndex: 2
              },
              {
                question: 'Wat is een kenmerk van het corpus sterni?',
                options: ['Heeft een incisura jugularis', 'Heeft meerdere incisurae costales', 'Articuleert met clavicula', 'Heeft de dens'],
                answerIndex: 1
              },
              {
                question: 'Wat is een klinisch herkenningspunt voor borstcompressies?',
                options: ['Angulus sterni', 'Incisura clavicularis', 'Processus xiphoideus', 'Corpus sterni'],
                answerIndex: 3
              },
              {
                question: 'Wat ligt er onder de Processus xiphoideus?',
                options: ['Diaphragma', 'Patella', 'Pubis', 'Humerus'],
                answerIndex: 0
              },
              {
                question: 'Wat gebeurt er met het sternum bij ouder worden?',
                options: ['Het verkalkt en kan vergroeien', 'Het wordt zachter', 'Het verdwijnt', 'Het wordt cartilage'],
                answerIndex: 0
              },
              {
                question: 'Hoe heet het gewricht tussen sternum en ribkraakbeen?',
                options: ['Articulatio sternoclavicularis', 'Articulatio costosternalis', 'Articulatio sternoxiphoidea', 'Articulatio manubristerni'],
                answerIndex: 1
              },
              {
                question: 'Met welk bot vormt het sternum een gewricht aan de bovenkant?',
                options: ['Scapula', 'Clavicula', 'Costae III', 'Vertebra C7'],
                answerIndex: 1
              },
              {
                question: 'Wat is het middenste en grootste deel van het sternum?',
                options: ['Manubrium sterni', 'Corpus sterni', 'Processus xiphoideus', 'Tuberculum costae'],
                answerIndex: 1
              }
            ]
          }
        ]
      },
      {
        id: 'lower',
        domain: 'osteologie',
        section: 'osteo-lower',
        title: 'Onderste ledematen',
        description: 'Van os coxae tot de voet – per deel geoefend.',
        quizSets: [
          {
            title: 'Os coxae',
            questions: [
              {
                question: 'Uit welke drie botstukken bestaat het os coxae bij kinderen?',
                options: ['Ilium – sacrum – pubis', 'Ilium – ischium – pubis', 'Ilium – femur – pubis', 'Ilium – ischium – coccyx'],
                answerIndex: 1
              },
              {
                question: 'Waar komen deze drie botten samen?',
                options: ['Fossa iliaca', 'Ala ossis ilii', 'Acetabulum', 'Foramen obturatum'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet de grote holte waar de femurkop in past?',
                options: ['Fovea capitis', 'Cavitas glenoidalis', 'Acetabulum', 'Fossa iliaca'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet het grote gat in het os coxae?',
                options: ['Foramen vertebrale', 'Foramen obturatum', 'Foramen magnum', 'Foramen ischiadicum majus'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet de bovenrand van het ilium?',
                options: ['Crista iliaca', 'Margo superioris', 'Linea arcuata', 'Arcus iliacus'],
                answerIndex: 0
              },
              {
                question: 'Hoe heet de voorste bovenste uitsteeksel van het ilium?',
                options: ['AIIS', 'PIIS', 'ASIS', 'PSIS'],
                answerIndex: 2
              },
              {
                question: 'Wat is de afkorting voor “anterior inferior iliac spine”?',
                options: ['ASIS', 'AIIS', 'PIIS', 'PSIS'],
                answerIndex: 1
              },
              {
                question: 'Welke structuur voel je achteraan bovenaan op je bekken?',
                options: ['ASIS', 'PSIS', 'Ischiale knobbel', 'Acetabular rim'],
                answerIndex: 1
              },
              {
                question: 'Waar ligt de tuber ischiadicum?',
                options: ['Onderkant van het ischium', 'Voorzijde van de pubis', 'Laterale zijde van het ilium', 'Bovenrand van het acetabulum'],
                answerIndex: 0
              },
              {
                question: 'Wat vormt de zitknobbel?',
                options: ['Tuber pubicum', 'Tuber ischiadicum', 'Crista iliaca', 'Spina iliaca posterior'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet de scherpe rand aan de binnenzijde van het bekken?',
                options: ['Linea intertrochanterica', 'Linea arcuata', 'Linea glutea', 'Linea terminalis'],
                answerIndex: 3
              },
              {
                question: 'Welke structuur vormt de bovenrand van het acetabulum?',
                options: ['Limbus acetabuli', 'Fovea capitis', 'Ala ossis ilii', 'Incisura ischiadica major'],
                answerIndex: 0
              },
              {
                question: 'Hoe heet de diepe inkeping achteraan het os coxae?',
                options: ['Incisura acetabuli', 'Incisura ischiadica major', 'Incisura iliaca', 'Incisura obturatoria'],
                answerIndex: 1
              },
              {
                question: 'Welk ligament passeert door de incisura ischiadica major?',
                options: ['Lig. inguinale', 'Lig. sacrotuberale', 'Lig. capitis femoris', 'Lig. pubicum'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het voorste deel van het os coxae?',
                options: ['Ilium', 'Pubis', 'Sacrum', 'Femur'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet de verbinding tussen beide pubisbeenderen?',
                options: ['Symphysis pubica', 'Articulatio sacroiliaca', 'Fissura pelvis', 'Linea terminalis'],
                answerIndex: 0
              },
              {
                question: 'Welke zijde van het os coxae is bol en naar buiten gericht?',
                options: ['Facies pelvina', 'Facies glutea', 'Facies obturatoria', 'Facies sacralis'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het kleine uitsteeksel boven de acetabulumrand?',
                options: ['Spina ischiadica', 'Spina iliaca anterior superior', 'Tuberculum pubicum', 'Eminentia iliopubica'],
                answerIndex: 0
              },
              {
                question: 'Wat ligt posterieur van het acetabulum?',
                options: ['Foramen obturatum', 'Incisura ischiadica major', 'Symfyse', 'Pubisramus'],
                answerIndex: 1
              },
              {
                question: 'Waar ligt de facies lunata?',
                options: ['Op de femurkop', 'Binnenin het acetabulum', 'Op de crista iliaca', 'Aan de voorzijde van de pubis'],
                answerIndex: 1
              }
            ]
          },
          {
            title: 'Femur',
            questions: [
              {
                question: 'Hoe heet de kop van het femur?',
                options: ['Condylus femoris', 'Caput femoris', 'Eminentia femoris', 'Fovea capitis'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het smalle gedeelte onder de femurkop?',
                options: ['Collum femoris', 'Corpus femoris', 'Trochanter major', 'Linea aspera'],
                answerIndex: 0
              },
              {
                question: 'Wat verbindt de femurkop met de heupkom?',
                options: ['Fossa acetabuli', 'Ligamentum capitis femoris', 'Margo acetabuli', 'Linea terminalis'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet de grote knobbel lateraal op het proximale femur?',
                options: ['Trochanter major', 'Trochanter minor', 'Epicondylus lateralis', 'Caput femoris'],
                answerIndex: 0
              },
              {
                question: 'Hoe heet de kleine knobbel mediaal en posterieur?',
                options: ['Trochanter major', 'Tuberculum minus', 'Trochanter minor', 'Condylus medialis'],
                answerIndex: 2
              },
              {
                question: 'Welke structuur ligt tussen trochanter major & minor?',
                options: ['Fovea capitis', 'Christa femoralis', 'Linea intertrochanterica', 'Linea aspera'],
                answerIndex: 2
              },
              {
                question: 'Waar bevindt zich de fovea capitis?',
                options: ['Op het collum', 'In de femurkop', 'Op de trochanter', 'Distaal'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet de scherpe lijn op de dorsale zijde van het femur?',
                options: ['Linea alba', 'Linea glutea', 'Linea intermedia', 'Linea aspera'],
                answerIndex: 3
              },
              {
                question: 'Welke structuur ligt mediaal op het distale femur?',
                options: ['Condylus lateralis', 'Epicondylus lateralis', 'Condylus medialis', 'Linea aspera'],
                answerIndex: 2
              },
              {
                question: 'Wat ligt er tussen de beide condylen posterieur?',
                options: ['Fossa intercondylaris', 'Tuberositas glenoidea', 'Fovea condyli', 'Linea poplitea'],
                answerIndex: 0
              },
              {
                question: 'Wat ligt er tussen de condylen aan de voorzijde?',
                options: ['Tuberculum femoris', 'Trochlea femoris', 'Linea intertrochanterica', 'Eminentia intercondylaris'],
                answerIndex: 1
              },
              {
                question: 'Wat articuleert met de trochlea femoris?',
                options: ['Tibia', 'Patella', 'Fibula', 'Acetabulum'],
                answerIndex: 1
              },
              {
                question: 'Wat ligt het meest lateraal aan het distale uiteinde?',
                options: ['Epicondylus medialis', 'Condylus medialis', 'Epicondylus lateralis', 'Caput femoris'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet de ruwe verhevenheid op de femurdiaphyse?',
                options: ['Tuberositas tibiae', 'Tuberositas glutea', 'Tuberositas quadriceps', 'Tuberositas ischiadica'],
                answerIndex: 1
              },
              {
                question: 'Waar ligt de trochanter minor?',
                options: ['Lateraal en craniaal', 'Mediaal en dorsaal', 'Lateraal en ventraal', 'Mediaal en ventraal'],
                answerIndex: 1
              },
              {
                question: 'Wat is de functie van de lineae supracondylares?',
                options: ['Aanhechting spieren', 'Articulatie met tibia', 'Beweging van heup', 'Stabilisatie van wervels'],
                answerIndex: 0
              },
              {
                question: 'Wat bevindt zich tussen de femurcondylen op de tibia?',
                options: ['Tuberculum intermedium', 'Eminentia intercondylaris', 'Fovea tibiae', 'Condylus tibiae'],
                answerIndex: 1
              },
              {
                question: 'Wat is de orientatie van het collum femoris tov corpus?',
                options: ['45°', '60°', '125°', '150°'],
                answerIndex: 2
              },
              {
                question: 'Wat ligt posterieur en distaal op het femur voor de gastrocnemius?',
                options: ['Linea glutea', 'Fossa intercondylaris', 'Fossa poplitea', 'Trochlea femoris'],
                answerIndex: 2
              },
              {
                question: 'Wat is het langste bot van het menselijk lichaam?',
                options: ['Tibia', 'Humerus', 'Femur', 'Radius'],
                answerIndex: 2
              }
            ]
          },
          {
            title: 'Patella',
            questions: [
              {
                question: 'In welke pees ligt de patella?',
                options: ['Bicepspees', 'Quadricepspees', 'Hamstringpees', 'Tricepspees'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet de onderpunt van de patella?',
                options: ['Basis', 'Apex', 'Trochlea', 'Fossa'],
                answerIndex: 1
              },
              {
                question: 'Met welk bot articuleert de patella?',
                options: ['Tibia', 'Femur', 'Fibula', 'Talus'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het achterste gewrichtsoppervlak van de patella?',
                options: ['Facies dorsalis', 'Facies muscularis', 'Facies articularis', 'Facies poplitea'],
                answerIndex: 2
              },
              {
                question: 'Wat is de belangrijkste functie van de patella?',
                options: [
                  'Stabilisatie van de heup',
                  'Vergroten van de kracht van de quadriceps',
                  'Bescherming van de tibia',
                  'Rotatie van de femurkop'
                ],
                answerIndex: 1
              }
            ]
          },
          {
            title: 'Tibia',
            questions: [
              {
                question: 'Hoe heet de bovenkant van de tibia?',
                options: ['Condylus superior', 'Tibia plateau', 'Caput tibiae', 'Basis tibiae'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet het vooraan uitstekende punt onderaan de knie?',
                options: ['Tuberositas tibiae', 'Margo anterior', 'Eminentia intercondylaris', 'Linea musculi'],
                answerIndex: 0
              },
              {
                question: 'Welk ligament hecht aan de tuberositas tibiae?',
                options: ['Lig. collaterale mediale', 'Lig. cruciatum', 'Lig. patellae', 'Lig. popliteum'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet de scherpe voorrand van de tibia?',
                options: ['Margo posterior', 'Margo lateralis', 'Margo anterior', 'Crista tibialis'],
                answerIndex: 2
              },
              {
                question: 'Wat ligt tussen de twee tibiacondylen?',
                options: ['Margo intermedius', 'Eminentia intercondylaris', 'Fovea tibiae', 'Tuberculum popliteum'],
                answerIndex: 1
              },
              {
                question: 'Welke condyl is groter?',
                options: ['Lateralis', 'Medialis', 'Beiden even groot', 'Geen condylen aanwezig'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het vlak dat met de femurcondylen articuleert?',
                options: ['Facies carpalis', 'Facies auricularis', 'Facies articularis superior', 'Facies patellaris'],
                answerIndex: 2
              },
              {
                question: 'Waar articuleert de laterale condyl van de tibia nog mee?',
                options: ['Fibula', 'Patella', 'Talus', 'Femur'],
                answerIndex: 0
              },
              {
                question: 'Hoe heet het concave vlak dat met het talus articuleert?',
                options: ['Facies malleolaris', 'Facies articularis inferior', 'Facies tibionavicularis', 'Fovea talaris'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het enkeluitsteeksel van de tibia?',
                options: ['Malleolus medialis', 'Malleolus lateralis', 'Malleolus tibialis superior', 'Apex medialis'],
                answerIndex: 0
              },
              {
                question: 'Hoe heet de achterkant van de tibia waar de m. popliteus hecht?',
                options: ['Linea poplitea', 'Sulcus popliteus', 'Linea solei', 'Facies posterior'],
                answerIndex: 1
              },
              {
                question: 'Waar ligt de linea musculi solei?',
                options: ['Op het laterale vlak', 'Ventraal', 'Posterieur', 'Op de malleolus'],
                answerIndex: 2
              },
              {
                question: 'Wat articuleert met de fibula proximaal?',
                options: ['Condylus medialis', 'Condylus lateralis', 'Tuberositas tibiae', 'Malleolus medialis'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet de punt distaal aan de tibia?',
                options: ['Apex tibiae', 'Malleolus medialis', 'Tuberositas distalis', 'Eminentia inferior'],
                answerIndex: 1
              },
              {
                question: 'Wat vormt samen het tibiaplateau?',
                options: ['Corpus + eminentia', 'De twee condylen', 'Malleolus + corpus', 'Facies anterior + posterior'],
                answerIndex: 1
              },
              {
                question: 'Wat ligt ventraal op de tibia?',
                options: ['Linea solei', 'Margo anterior', 'Linea intercondylaris', 'Margo medialis'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het driehoekige achtervlak van de tibia?',
                options: ['Facies articularis posterior', 'Facies poplitea', 'Facies tibialis', 'Linea posterior'],
                answerIndex: 1
              },
              {
                question: 'Welke beweging is afhankelijk van de tibia in het kniegewricht?',
                options: ['Flexie–extensie', 'Pronatie', 'Supinatie', 'Circumductie'],
                answerIndex: 0
              },
              {
                question: 'Met welk bot vormt de tibia distaal een gewricht voor de enkel?',
                options: ['Calcaneus', 'Talus', 'Naviculare', 'Cuboideum'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet de groeve achter de malleolus medialis?',
                options: ['Sulcus malleolaris', 'Sulcus tibialis', 'Sulcus posterior', 'Sulcus calcaneus'],
                answerIndex: 0
              }
            ]
          },
          {
            title: 'Fibula',
            questions: [
              {
                question: 'Hoe heet de kop van de fibula?',
                options: ['Apex fibulae', 'Caput fibulae', 'Collum fibulae', 'Malleolus lateralis'],
                answerIndex: 1
              },
              {
                question: 'Waar ligt de fibula t.o.v. de tibia?',
                options: ['Mediaal', 'Lateraal', 'Ventraal', 'Dorsaal'],
                answerIndex: 1
              },
              {
                question: 'Wat is de functie van de fibula?',
                options: [
                  'Draagt lichaamsgewicht',
                  'Stabiliseert enkel & dient als spieraanhechting',
                  'Articuleert met femur',
                  'Sluit de knieschijf in'
                ],
                answerIndex: 1
              },
              {
                question: 'Wat articuleert met de caput fibulae?',
                options: ['Femur', 'Tibia', 'Talus', 'Calcaneus'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het smalle deel onder de kop?',
                options: ['Apex', 'Collum fibulae', 'Margo fibularis', 'Corpus fibrosis'],
                answerIndex: 1
              },
              {
                question: 'Wat vormt de laterale enkelknobbel?',
                options: ['Malleolus medialis', 'Malleolus lateralis', 'Apex fibulae', 'Caput fibulae'],
                answerIndex: 1
              },
              {
                question: 'Waar articuleert de fibula distaal mee?',
                options: ['Femur', 'Calcaneus', 'Talus', 'Patella'],
                answerIndex: 2
              },
              {
                question: 'Wat is breder: het proximale of distale uiteinde?',
                options: ['Proximaal', 'Distaal', 'Ze zijn gelijk', 'Verschilt per persoon'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet de gewrichtsverbinding tussen tibia en fibula bovenaan?',
                options: [
                  'Art. tibiofibularis proximalis',
                  'Art. intercondylaris',
                  'Art. fibulotalaris',
                  'Art. tibiofibularis inferior'
                ],
                answerIndex: 0
              },
              {
                question: 'Hoe heet de bindweefselverbinding tussen tibia en fibula?',
                options: [
                  'Syndesmosis tibiofibularis',
                  'Membrana interossea',
                  'Fascia intercruralis',
                  'Ligamentum fibulare'
                ],
                answerIndex: 1
              },
              {
                question: 'Wat ligt aan de laterale kant van de fibula?',
                options: ['Margo medialis', 'Margo posterior', 'Margo lateralis', 'Margo anterior'],
                answerIndex: 2
              },
              {
                question: 'Waar ligt de sulcus malleolaris van de fibula?',
                options: [
                  'Op de mediale enkel',
                  'Op de laterale malleolus',
                  'Proximaal bij de kop',
                  'Ventraal op het corpus'
                ],
                answerIndex: 1
              },
              {
                question: 'Welk bot draagt NIET bij aan het kniegewricht?',
                options: ['Femur', 'Tibia', 'Fibula', 'Patella'],
                answerIndex: 2
              },
              {
                question: 'Welke spieren hechten vooral aan de fibula?',
                options: [
                  'Extensoren van de knie',
                  'Hamstrings',
                  'Peroneus (fibularis) spieren',
                  'Quadriceps'
                ],
                answerIndex: 2
              },
              {
                question: 'Hoe heet de achterste rand van de fibula?',
                options: ['Margo interosseus', 'Margo posterior', 'Margo anterior', 'Crista posterior'],
                answerIndex: 1
              },
              {
                question: 'De malleolus lateralis bevindt zich…',
                options: [
                  'Meer proximaal dan de mediale malleolus',
                  'Op exact dezelfde hoogte',
                  'Meer distaal dan de mediale malleolus',
                  'Totaal niet aan de enkel'
                ],
                answerIndex: 2
              },
              {
                question: 'Wat articuleert met het mediale oppervlak van de malleolus lateralis?',
                options: ['Femur', 'Calcaneus', 'Talus', 'Naviculare'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet de driehoekige schacht van de fibula?',
                options: ['Corpus fibulae', 'Fascia fibularis', 'Collum fibulae', 'Fovea fibularis'],
                answerIndex: 0
              },
              {
                question: 'Waar ligt de incisura fibularis?',
                options: ['Op de fibula', 'Op de tibia distaal', 'Op de talus', 'Op de calcaneus'],
                answerIndex: 1
              },
              {
                question: 'De fibula draagt ongeveer…',
                options: ['50% van het gewicht', '25%', '10%', '0–2%'],
                answerIndex: 3
              }
            ]
          },
          {
            title: 'Tarsalia',
            questions: [
              {
                question: 'Hoeveel tarsale beenderen heeft de mens?',
                options: ['5', '7', '8', '10'],
                answerIndex: 1
              },
              {
                question: 'Welke twee tarsale botten dragen het lichaamsgewicht?',
                options: ['Talus & naviculare', 'Calcaneus & talus', 'Cuboideum & calcaneus', 'Cuneiforme mediale & talus'],
                answerIndex: 1
              },
              {
                question: 'Welk bot vormt de hiel?',
                options: ['Talus', 'Calcaneus', 'Naviculare', 'Cuboideum'],
                answerIndex: 1
              },
              {
                question: 'Welke structuur articuleert met de tibia?',
                options: ['Calcaneus', 'Talus', 'Naviculare', 'Cuneiforme laterale'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het schipvormige tarsale bot?',
                options: ['Calcaneus', 'Talus', 'Naviculare', 'Cuboideum'],
                answerIndex: 2
              },
              {
                question: 'Welke drie tarsale botten liggen in een rij naast elkaar?',
                options: [
                  'Cuneiforme mediale – intermedium – laterale',
                  'Talus – calcaneus – naviculare',
                  'Cuboideum – naviculare – talus',
                  'Calcaneus – cuboideum – naviculare'
                ],
                answerIndex: 0
              },
              {
                question: 'Welk bot ligt lateraal van het naviculare?',
                options: ['Calcaneus', 'Talus', 'Cuboideum', 'Cuneiforme mediale'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet het uitsteeksel onder de talus op de calcaneus?',
                options: ['Sustentaculum tali', 'Tuber calcanei', 'Apex calcanei', 'Processus calcaneus'],
                answerIndex: 0
              },
              {
                question: 'Wat is de functie van het sustentaculum tali?',
                options: ['Aanhechting quadriceps', 'Ondersteunen van de talus', 'Aanhechting hamstrings', 'Articuleren met tibia'],
                answerIndex: 1
              },
              {
                question: 'Welk bot articuleert met het cuboideum?',
                options: ['Talus', 'Calcaneus', 'Naviculare', 'Alle bovenstaande'],
                answerIndex: 1
              },
              {
                question: 'Welke botten vormen het Chopart-gewricht?',
                options: [
                  'Talus-calcaneus',
                  'Calcaneus-cuboideum + talus-naviculare',
                  'Naviculare-cuneiforme',
                  'Cuneiforme combinatie'
                ],
                answerIndex: 1
              },
              {
                question: 'Waar ligt het tuber calcanei?',
                options: ['Op de talus', 'Op de calcaneus (hielknobbel)', 'Op het naviculare', 'Op het cuboideum'],
                answerIndex: 1
              },
              {
                question: 'Welk bot ligt direct voor de talus?',
                options: ['Cuboideum', 'Naviculare', 'Calcaneus', 'Cuneiforme mediale'],
                answerIndex: 1
              },
              {
                question: 'Welke botten articuleren met het naviculare?',
                options: ['Talus + 3 cuneiformia', 'Calcaneus + cuboideum', 'Talus + cuboideum', 'Alleen cuneiforme intermedium'],
                answerIndex: 0
              },
              {
                question: 'Welk bot ligt lateraal van de calcaneus?',
                options: ['Cuboideum', 'Naviculare', 'Talus', 'Cuneiforme laterale'],
                answerIndex: 0
              },
              {
                question: 'Welk tarsaal bot is het hoogste in de voet?',
                options: ['Cuboideum', 'Calcaneus', 'Talus', 'Naviculare'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet het puntje achteraan de calcaneus voor de aanhechting van de achillespees?',
                options: ['Tuber calcanei', 'Apex calci', 'Processus acromialis', 'Tuber naviculare'],
                answerIndex: 0
              },
              {
                question: 'Welk bot ligt direct mediaal van het cuboideum?',
                options: ['Calcaneus', 'Naviculare', 'Talus', 'Cuneiforme laterale'],
                answerIndex: 3
              },
              {
                question: 'Welke tarsale botten liggen tussen de metatarsalen en het naviculare?',
                options: ['Calcaneus', 'Talus', 'Cuneiforme-botjes', 'Cuboideum'],
                answerIndex: 2
              },
              {
                question: 'Wat is het enige tarsale bot dat GEEN spieraanhechtingen heeft?',
                options: ['Calcaneus', 'Naviculare', 'Talus', 'Cuboideum'],
                answerIndex: 2
              }
            ]
          },
          {
            title: 'Talus',
            questions: [
              {
                question: 'Welk bot articuleert direct met de tibia?',
                options: ['Calcaneus', 'Talus', 'Naviculare', 'Cuboideum'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het bovenste gewrichtsvlak van de talus?',
                options: ['Trochlea tali', 'Facies navicularis', 'Sustentaculum tali', 'Caput tali'],
                answerIndex: 0
              },
              {
                question: 'Hoe heet het voorste deel van de talus?',
                options: ['Corpus tali', 'Caput tali', 'Collum tali', 'Basis tali'],
                answerIndex: 1
              },
              {
                question: 'Wat ligt tussen caput en corpus van de talus?',
                options: ['Sulcus tali', 'Collum tali', 'Fovea tali', 'Crista tali'],
                answerIndex: 1
              },
              {
                question: 'Welk tarsaal bot ligt direct onder de talus?',
                options: ['Cuboideum', 'Naviculare', 'Calcaneus', 'Cuneiforme laterale'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet de achterste knobbel van de talus?',
                options: ['Tuber tali', 'Sustentaculum tali', 'Processus posterior tali', 'Spina tali'],
                answerIndex: 2
              },
              {
                question: 'Waar articuleert de talus aan de voorzijde mee?',
                options: ['Calcaneus', 'Naviculare', 'Cuboideum', 'Cuneiforme mediale'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet de diepe groeve onder de talus die samen met de calcaneus het tarsale kanaal vormt?',
                options: ['Sulcus tali', 'Incisura talaris', 'Fossa tali', 'Meatus tali'],
                answerIndex: 0
              },
              {
                question: 'Wat draagt GEEN spieren?',
                options: ['Calcaneus', 'Talus', 'Naviculare', 'Cuboideum'],
                answerIndex: 1
              },
              {
                question: 'Met welk bot vormt de talus GEEN gewricht?',
                options: ['Fibula', 'Calcaneus', 'Naviculare', 'Cuboideum'],
                answerIndex: 3
              },
              {
                question: 'Hoe heet het gebied waar tibia en fibula samen op de talus rusten?',
                options: ['Trochlea tali', 'Sulcus tali', 'Collum tali', 'Caput tali'],
                answerIndex: 0
              },
              {
                question: 'De talus vormt samen met tibia en fibula het…',
                options: [
                  'Tarsometatarsale gewricht',
                  'Subtalaire gewricht',
                  'Bovenspronggewricht (art. talocruralis)',
                  'Midtarsale gewricht'
                ],
                answerIndex: 2
              },
              {
                question: 'Welke bewegingen gebeuren in het bovenste spronggewricht?',
                options: ['Inversie–eversie', 'Pronatie–supinatie', 'Dorsiflexie–plantairflexie', 'Rotatie–antirotatie'],
                answerIndex: 2
              },
              {
                question: 'Wat ligt direct achter de talus?',
                options: ['Calcaneus', 'Achillespees', 'Tuber calcanei', 'Fibula'],
                answerIndex: 1
              },
              {
                question: 'Welke structuur draagt het caput tali?',
                options: ['Naviculare', 'Calcaneus', 'Cuboideum', 'Talus zelf'],
                answerIndex: 0
              },
              {
                question: 'Wat vormt samen met sulcus tali de sinus tarsi?',
                options: ['Sulcus navicularis', 'Sulcus calcanei', 'Sulcus cuneiformis', 'Fossa tali'],
                answerIndex: 1
              },
              {
                question: 'Wat is de functie van de trochlea tali?',
                options: ['Articulatie met naviculare', 'Aanhechting pezen', 'Draagvlak voor tibia en fibula', 'Aanhechting ligamenten'],
                answerIndex: 2
              },
              {
                question: 'Hoe heet het middelste deel van de talus?',
                options: ['Corpus tali', 'Caput tali', 'Collum tali', 'Basis tali'],
                answerIndex: 2
              },
              {
                question: 'Waar articuleert de talus inferieur mee?',
                options: ['Naviculare', 'Tibia', 'Calcaneus', 'Fibula'],
                answerIndex: 2
              },
              {
                question: 'Wat is bijzonder aan de talus?',
                options: [
                  'Bevat meerdere spieraanhechtingen',
                  'Draagt bijna volledig het lichaamsgewicht',
                  'Heeft GEEN spieraanhechtingen',
                  'Articuleert niet met de tibia'
                ],
                answerIndex: 2
              }
            ]
          },
          {
            title: 'Calcaneus',
            questions: [
              {
                question: 'Welk bot vormt de hiel?',
                options: ['Talus', 'Calcaneus', 'Cuboideum', 'Naviculare'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het grote achterste uitsteeksel waar de achillespees aanhecht?',
                options: ['Tuber calcanei', 'Sustentaculum tali', 'Trochlea calcanei', 'Facies posterior tali'],
                answerIndex: 0
              },
              {
                question: 'Welke structuur draagt de talus aan de mediale zijde?',
                options: ['Trochlea calcanei', 'Sustentaculum tali', 'Processus posterior', 'Fovea tali'],
                answerIndex: 1
              },
              {
                question: 'Waar ligt de sulcus calcanei?',
                options: ['Op het naviculare', 'Tussen talus en tibia', 'Op de calcaneus, dorsaal', 'Op de calcaneus, superieur'],
                answerIndex: 3
              },
              {
                question: 'Wat vormt samen met sulcus tali de sinus tarsi?',
                options: ['Sulcus navicularis', 'Sulcus cuneiformis', 'Sulcus calcanei', 'Fovea calcanei'],
                answerIndex: 2
              },
              {
                question: 'Welk bot articuleert met de voorzijde van de calcaneus?',
                options: ['Naviculare', 'Cuboideum', 'Talus', 'Tibia'],
                answerIndex: 1
              },
              {
                question: 'Hoe heet het zijwaartse botuitsteeksel op de calcaneus?',
                options: ['Trochlea calcanei', 'Apex calcanei', 'Sustentaculum tali', 'Spina calcanei'],
                answerIndex: 0
              },
              {
                question: 'Wat loopt door de sulcus achter de trochlea calcanei?',
                options: ['Pezen peroneus longus & brevis', 'Achillespees', 'Plantair ligament', 'Tibialis posterior'],
                answerIndex: 0
              },
              {
                question: 'Hoe heet de articulatie tussen calcaneus en talus?',
                options: ['Art. talocruralis', 'Art. subtalaris', 'Art. calcaneonavicularis', 'Art. tarsometatarsalis'],
                answerIndex: 1
              },
              {
                question: 'Welke bewegingen gebeuren in het subtalaire gewricht?',
                options: ['Flexie–extensie', 'Dorsiflexie–plantairflexie', 'Inversie–eversie', 'Supinatie–pronatie'],
                answerIndex: 2
              },
              {
                question: 'Wat ligt inferieur op de calcaneus?',
                options: ['Tuber calcanei', 'Sustentaculum tali', 'Processus anticus', 'Fossa calcanei'],
                answerIndex: 0
              },
              {
                question: 'Wat articuleert met de bovenkant van de calcaneus?',
                options: ['Talus', 'Naviculare', 'Cuboideum', 'Cuneiforme laterale'],
                answerIndex: 0
              },
              {
                question: 'Welke zijde van de calcaneus is breder?',
                options: ['Proximaal', 'Distaal', 'Mediaal', 'Lateraal'],
                answerIndex: 0
              },
              {
                question: 'Wat is de grootste functie van het calcaneus?',
                options: [
                  'Aanhechting voor adductor hallucis',
                  'Schokabsorptie & dragen lichaamsgewicht',
                  'Roteren van enkel',
                  'Verbinden van tibia met fibula'
                ],
                answerIndex: 1
              },
              {
                question: 'Welke structuur ligt mediaal op de calcaneus?',
                options: ['Sustentaculum tali', 'Trochlea calcanei', 'Cuboid facet', 'Achilles tubercle'],
                answerIndex: 0
              },
              {
                question: 'Wat vormt de achterzijde van de calcaneus?',
                options: ['Sustentaculum', 'Tuber calcanei', 'Tarsale sinus', 'Trochlea calcanei'],
                answerIndex: 1
              },
              {
                question: 'Wat articuleert met het calcaneus aan de laterale zijde?',
                options: ['Naviculare', 'Talus', 'Cuboideum', 'Tibia'],
                answerIndex: 2
              },
              {
                question: 'De calcaneus is…',
                options: ['Het grootste tarsale bot', 'Het hoogste tarsale bot', 'Het kleinste tarsale bot', 'Het minst dragende bot'],
                answerIndex: 0
              },
              {
                question: 'Welke pees loopt onder het sustentaculum tali door?',
                options: ['Achillespees', 'M. tibialis posterior', 'M. peroneus longus', 'M. extensor hallucis longus'],
                answerIndex: 1
              },
              {
                question: 'Wat is de belangrijkste aanhechting op het tuber calcanei?',
                options: ['Flexor digitorum', 'Achillespees', 'Quadratus plantae', 'Plantair ligament'],
                answerIndex: 1
              }
            ]
          }
        ]
      },
      {
        id: 'osteologie-check',
        domain: 'osteologie',
        section: 'osteo-proef',
        title: 'Proef examen',
        description: 'Een compacte toets met de osteologie-examens.',
        quizSets: [
          osteologieHoofdstuk,
          {
            title: 'Algemene osteologie',
            questions: [
              {
                question: 'De fovea dentis vinden we op:',
                options: ['Axis', 'Atlas', 'C3', 'Os occipitale'],
                answerIndex: 1
              },
              {
                question: 'De dens behoort tot:',
                options: ['Atlas', 'Axis', 'Sacrum', 'Sternum'],
                answerIndex: 1
              },
              {
                question: 'De crista iliaca is:',
                options: [
                  'De bovenrand van het os ilium',
                  'De onderrand van het os ischii',
                  'De voorrand van het os pubis',
                  'De rand van het acetabulum'
                ],
                answerIndex: 0
              },
              {
                question: 'De tuber ischiadicum:',
                options: ['Is de “zitknobbel”', 'Ligt op het os pubis', 'Ligt op de femurcondyl', 'Is een deel van het sacrum'],
                answerIndex: 0
              },
              {
                question: 'De facies lunata ligt:',
                options: [
                  'Op de femurkop',
                  'Binnenin het acetabulum van het os coxae',
                  'Op de tibia',
                  'Op de patella'
                ],
                answerIndex: 1
              },
              {
                question: 'De linea aspera bevindt zich op:',
                options: ['Humerus', 'Tibia', 'Femur', 'Fibula'],
                answerIndex: 2
              },
              {
                question: 'De trochanter major is een herkenningspunt van de:',
                options: ['Humerus', 'Femur', 'Tibia', 'Fibula'],
                answerIndex: 1
              },
              {
                question: 'De tuberositas tibiae is een aanhechtingsplaats voor:',
                options: ['Biceps brachii', 'Ligamentum patellae', 'Triceps surae', 'Hamstrings'],
                answerIndex: 1
              },
              {
                question: 'De malleolus medialis is een deel van de:',
                options: ['Fibula', 'Tibia', 'Talus', 'Calcaneus'],
                answerIndex: 1
              },
              {
                question: 'De malleolus lateralis is een deel van de:',
                options: ['Fibula', 'Tibia', 'Talus', 'Calcaneus'],
                answerIndex: 0
              },
              {
                question: 'De trochlea humeri articuleert met:',
                options: ['Caput radii', 'Incisura trochlearis ulnae', 'Capitulum humeri', 'Fossa olecrani'],
                answerIndex: 1
              },
              {
                question: 'De fossa olecrani ligt:',
                options: [
                  'Ventraal op de humerus',
                  'Dorsaal op de humerus, distaal',
                  'Op de ulna, proximaal',
                  'Op de radius, proximaal'
                ],
                answerIndex: 1
              },
              {
                question: 'Het caput radii bevindt zich:',
                options: ['Proximaal op de radius', 'Distaal op de radius', 'Proximaal op de ulna', 'Distaal op de ulna'],
                answerIndex: 0
              },
              {
                question: 'De tuberositas radii is de insertieplaats van:',
                options: ['Brachialis', 'Biceps brachii', 'Triceps brachii', 'Pronator teres'],
                answerIndex: 1
              },
              {
                question: 'De trochlea tali:',
                options: [
                  'Articuleert met de calcaneus',
                  'Articuleert met tibia en fibula',
                  'Articuleert met het naviculare',
                  'Articuleert met het cuboideum'
                ],
                answerIndex: 1
              },
              {
                question: 'Het tuber calcanei:',
                options: [
                  'Ligt op de talus',
                  'Is de hielknobbel van de calcaneus',
                  'Ligt op het naviculare',
                  'Is een deel van de fibula'
                ],
                answerIndex: 1
              },
              {
                question: 'Het os scaphoideum ligt:',
                options: [
                  'In de proximale carpale rij, duimzijde',
                  'In de distale carpale rij, pinkzijde',
                  'In de distale carpale rij, duimzijde',
                  'Tussen metacarpalen en phalangen'
                ],
                answerIndex: 0
              },
              {
                question: 'De incisura jugularis behoort tot het:',
                options: ['Os occipitale', 'Clavicula', 'Sternum', 'Scapula'],
                answerIndex: 2
              },
              {
                question: 'De facies articularis superior van de tibia articuleert met:',
                options: ['Fibula', 'Talus', 'Femur', 'Patella'],
                answerIndex: 2
              },
              {
                question: 'De massa lateralis atlantis:',
                options: [
                  'Draagt de dens',
                  'Draagt de schedelcondylen',
                  'Vormt het corpus van de atlas',
                  'Vormt het foramen transversarium'
                ],
                answerIndex: 1
              }
            ]
          }
        ]
      },
    ],
    examDomains: [
      {
        id: 'arthrologie',
        title: 'Arthrologie',
        description: 'Maak het gewrichtenblok van 20 vragen.',
        sections: [
          {
            id: 'arthrologie',
            title: 'Algemeen Examen',
            categoryIds: ['arthrologie-core']
          },
          { id: 'arthro-upper', title: 'Bovenste ledematen', categoryIds: ['arthro-upper'] },
          { id: 'arthro-lower', title: 'Onderste ledematen', categoryIds: ['arthro-lower'] }
        ]
      },
      {
        id: 'osteologie',
        title: 'Osteologie',
        description: 'Botkunde gespreid over drie delen en een proef examen.',
        sections: [
          { id: 'osteo-upper', title: 'Bovenste ledematen', categoryIds: ['upper', 'torso'] },
          { id: 'osteo-lower', title: 'Onderste ledematen', categoryIds: ['lower'] },
          { id: 'osteo-proef', title: 'Proef examen', categoryIds: ['osteologie-check'] }
        ]
      },
      {
        id: 'myologie',
        title: 'Myologie',
        description: 'Les 1 t.e.m. Les 7',
        sections: [
          { id: 'myo-les-1', title: 'Les 1', categoryIds: ['myo-les1'], description: '1. Dorsale Spieren Craniaal t.e.m Ademhalingsspieren' },
          { id: 'myo-les-2', title: 'Les 2', categoryIds: ['myo-les2'], description: '4. Borstspieren t.e.m Schouderspieren' },
          { id: 'myo-les-3', title: 'Les 3', categoryIds: ['myo-les3'], description: 'Dorsale Bovenarmspieren t.e.m. Oppervlakkig Gelegen Ventrale Voorarmspieren' },
          { id: 'myo-les-4', title: 'Les 4', categoryIds: ['myo-les4'], description: 'Radiale Spieren VD Onderarm t.e.m. Diepe Radiale Voorarmspieren' },
          { id: 'myo-les-5', title: 'Les 5', categoryIds: ['myo-les5'], description: 'Ventrale Heupspieren t.e.m. Dorsale Bovenbeenspieren' },
          { id: 'myo-les-6', title: 'Les 6', categoryIds: ['myo-les6'], description: 'Ventrale Onderbeenspieren t.e.m. Dorsale Onderbeenspieren' },
          { id: 'myo-les-7', title: 'Les 7', categoryIds: ['myo-les7'], description: 'Diepe Dorsale Onderbeenspieren' }
        ]
      }
    ]
  };

  const les1MC = [
    { question: 'Wat is een voordeel van bewegen voor de fysieke gezondheid?', options: ['Minder energieverbruik', 'Sterkere spieren en botten', 'Minder hongergevoel', 'Meer kans op blessures'], answerIndex: 1 },
    { question: 'Welk voordeel hoort bij mentale gezondheid?', options: ['Minder sociale contacten', 'Betere concentratie', 'Sneller moe zijn', 'Minder zelfstandigheid'], answerIndex: 1 },
    { question: 'Kinderen moeten per dag … intensief bewegen.', options: ['20 min', '30 min', '45 min', '60 min'], answerIndex: 3 },
    { question: 'De motorische ontwikkeling hangt af van:', options: ['Alleen genetica', 'Enkel sportclubs', 'Genetische aanleg én stimulansen uit de omgeving', 'De leeftijd van de leerkracht'], answerIndex: 2 },
    { question: 'Wat betekent motorische geletterdheid?', options: ['Hoeveel boeken een kind leest', 'Hoe goed een kind motorische vaardigheden beheerst', 'Hoe lang een kind stil kan zitten', 'Hoe goed een kind rekenen kan'], answerIndex: 1 },
    { question: 'Waarom bewegen kinderen minder in het dagelijkse leven?', options: ['Ze worden minder leergierig', 'Ze hebben te veel sport op school', 'Ze gebruiken te vaak iPads en gsm’s', 'Ze hebben te weinig huiswerk'], answerIndex: 2 },
    { question: 'Vlaamse kinderen zijn … dan Waalse kinderen.', options: ['minder actief', 'even actief', 'actiever', 'altijd binnen'], answerIndex: 2 },
    { question: 'De neurale ontwikkeling is sterk tot ongeveer:', options: ['4 jaar', '6 jaar', '8 jaar', '12 jaar'], answerIndex: 2 },
    { question: 'Waarom is 50 meter kunnen zwemmen belangrijk?', options: ['Het is een sportdiscipline', 'Het is goed voor je conditie', 'Kinderen kunnen zich 12 meter redden in open water', 'Het is leuk tijdens warme dagen'], answerIndex: 2 },
    { question: 'Wat is een functie van LO in het basisonderwijs?', options: ['Enkel topsporters creëren', 'Kinderen stereotiep laten bewegen', 'Bewegingsgebonden basiscompetenties aanleren', 'Enkel focussen op resultaten'], answerIndex: 2 }
  ];

  const les1Open = [
    { type: 'open', question: 'Noem twee voordelen van bewegen op emotioneel vlak.', answerKeywords: ['zelfvertrouwen', 'stress', 'angst', 'zelfstandigheid'] },
    { type: 'open', question: 'Waarom zijn kinderen tussen 3 en 8 jaar zo leergierig?', answerKeywords: ['motoriek', 'hersenontwikkeling', 'snel', 'kneedbaar'] },
    { type: 'open', question: 'Wat gebeurt er na de leeftijd van 8 jaar met de neurale ontwikkeling?', answerKeywords: ['vlakt', 'af', 'motorische', 'vaardigheden', 'moeilijker'] },
    { type: 'open', question: 'Geef een reden waarom brede motorische ontwikkeling belangrijk is.', answerKeywords: ['basis', 'sportspecifieke', 'technieken', 'aanleren'] },
    { type: 'open', question: 'Waarom moet een lesgever variëren in toonhoogte, mimiek en lichaamstaal?', answerKeywords: ['observatie', 'geboeid', 'leren'] },
    { type: 'open', question: 'Wat is een mogelijke oorzaak van overbelastingsletsels bij jonge kinderen?', answerKeywords: ['sporten', 'clubverband', 'zware', 'belasting', 'jonge', 'leeftijd'] },
    { type: 'open', question: 'Waarom is zelfredzaamheid in het water belangrijk?', answerKeywords: ['veilig', 'open', 'water', 'redden'] },
    { type: 'open', question: 'Noem twee factoren die bepalen hoeveel een kind beweegt.', answerKeywords: ['omgeving', 'stimulans', 'technologiegebruik', 'seizoenen', 'zomer', 'winter'] },
    { type: 'open', question: 'Wat is het doel van “levenslang bewegen”?', answerKeywords: ['levenslang', 'bewegen', 'belangrijk'] },
    { type: 'open', question: 'Wat betekent dat LO inzet op brede motorische ontwikkeling i.f.v succesbeleving?', answerKeywords: ['brede', 'motorische', 'ontwikkeling', 'succes', 'ervaren', 'domeinen'] }
  ];

  const les1Set = { title: 'Basisonderwijs – Les 1 (20 vragen)', questions: [...les1MC, ...les1Open] };



  const les2BasisMC = [
    {
      question: 'Welke van de volgende is GEEN voorbeeld van een ABV-basisbeweging?',
      options: ['Stappen', 'Kruipen', 'Stilzitten', 'Klimmen'],
      answerIndex: 2
    },
    {
      question: 'Waarom moet een instructie bij jonge kinderen kort zijn?',
      options: ['Zodat de leerkracht meer rust heeft', 'Omdat hun concentratieboog kort is en ze snel willen bewegen', 'Omdat ze anders te slim worden', 'Omdat de bel gaat'],
      answerIndex: 1
    },
    {
      question: 'Waarom mag je bij jonge kinderen (< 8 jaar) een beweging vaak NIET in spiegelbeeld voordoen?',
      options: ['Ze vinden dat grappig', 'Ze hebben nog moeite met de links-rechts omkering en kopiëren letterlijk', 'Het is te moeilijk voor de leerkracht', 'Ze zien het verschil niet'],
      answerIndex: 1
    },
    {
      question: 'Wat is een kenmerk van een "uitdagende beweegsituatie"?',
      options: ['Het is altijd competitief', 'Het prikkelt kinderen om grenzen te verleggen en motiveert', 'Het is altijd heel makkelijk', 'Het vereist duur materiaal'],
      answerIndex: 1
    },
    {
      question: 'Waarom is het goed om kinderen zelf oplossingen te laten bedenken voor bewegingsproblemen?',
      options: ['Dan hoeft de leerkracht niets te doen', 'Het stimuleert creativiteit en motorisch inzicht', 'Het duurt langer', 'Het is grappig om te zien'],
      answerIndex: 1
    },
    {
      question: 'Hoe zorg je ervoor dat leerlingen aandachtig blijven tijdens een uitleg?',
      options: ['Heel stil praten', 'Ze met de rug naar de zon/afleiding zetten', 'Heel lang praten', 'Ze laten rondlopen'],
      answerIndex: 1
    },
    {
      question: 'Wat is het doel van visuele wenken (focuspunten) tijdens een demonstratie?',
      options: ['De aandacht afleiden', 'De kern van de beweging accentueren voor beter begrip', 'Het kind laten lachen', 'De beweging moeilijker maken'],
      answerIndex: 1
    },
    {
      question: 'Wat bedoelt men met "toon en verwoord het kernidee"?',
      options: ['Vertel een lang verhaal', 'Laat de beweging zien en benoem kort de essentie', 'Doe de beweging zonder woorden', 'Laat een video zien'],
      answerIndex: 1
    },
    {
      question: 'Wanneer start je best met je instructie?',
      options: ['Als de meeste kinderen luisteren', 'Als het stil is en iedereen aandacht heeft', 'Terwijl ze nog bezig zijn', 'Als de bel gaat'],
      answerIndex: 1
    },
    {
      question: 'Wanneer is het nuttig om een leerling de demonstratie te laten doen?',
      options: ['Als de leerkracht moe is', 'Om betrokkenheid te verhogen en als de leerling het goed kan', 'Als straf', 'Nooit'],
      answerIndex: 1
    }
  ];

  const les2Open = [
    { type: 'open', question: 'Geef twee voorbeelden van ABV-basisbewegingen.', answerKeywords: ['stappen','lopen','sluipen','kruipen','klauteren','klimmen','balanceren','springen','landen','zwaaien','roteren','omgekeerde','houdingen','rollen','werpen','vangen','slaan','trappen','dribbelen','heffen','dragen','trekken','duwen'] },
    { type: 'open', question: 'Wat is het doel van uitdagende beweegsituaties?', answerKeywords: ['plezier','prikkelen','grenzen','verleggen','motivatie','uitdaging','inkleding','fantasiewereld','leuker','ervaring','actief'] },
    { type: 'open', question: 'Waarom mag een instructie niet te lang duren?', answerKeywords: ['aandacht','daalt','afgeleid','activiteitsprincipe','bewegen','informatie','verloren','prikkels','kort','duidelijker','veiligheid','snelle','start','focus'] },
    { type: 'open', question: 'Waarom moeten kinderen soms zelf oplossingen bedenken?', answerKeywords: ['bewegingsproblemen','oplossen','probleemoplossend','zelfstandigheid','creatief','inzicht','hoe','motorische','ontwikkeling','strategieën','variatie'] },
    { type: 'open', question: 'Wanneer gebruik je kinderen voor een demonstratie?', answerKeywords: ['kunnen','herhaling','gekende','eenvoudige','veilig','betrokkenheid','minder','technische'] },
    { type: 'open', question: 'Noem één manier om aandacht te behouden tijdens instructie.', answerKeywords: ['stoorder','benaderen','dichter','prikkels','vermijden','zon','tegenwind','signaalinstrument','zichtbaarheid','korte','instructie','herhalen'] },
    { type: 'open', question: 'Wat is de rol van visuele wenken bij een demo?', answerKeywords: ['observatie','sturen','aandachtspunten','accentueren','begrip','focussen','kern','inzicht','verbeteren','uitvoering'] },
    { type: 'open', question: 'Waarom mag je bij jonge kinderen (<8 jaar) niet in spiegelbeeld voordoen?', answerKeywords: ['links','rechts','verwarring','beheersen','kopiëren','foute','uitvoering','richting'] },
    { type: 'open', question: 'Wat betekent: ‘toon en verwoord het kernidee’? ', answerKeywords: ['essentie','spel','uitleggen','doel','tonen','demonstreren','duidelijk','inhoud','weten','begrijpbare','visuele'] },
    { type: 'open', question: 'Waarom moet je wachten tot ALLE leerlingen luisteren voor je instructie start?', answerKeywords: ['informatieoverdracht','iedereen','veiligheid','efficiëntie','geen','herhaling','voorkomen','fouten','concentratie','duidelijkheid'] }
  ];

  const les2Set = { title: 'Basisonderwijs – Les 2 (20 vragen)', questions: [...les2BasisMC, ...les2Open] };

  const les3MC = [
    { question: 'Wat is een kenmerk van een homogene groep?', options: ['Grote verschillen tussen leerlingen','Leerlingen met gelijkaardige kenmerken','Willekeurige indeling','Altijd heterogene niveaus'], answerIndex: 1 },
    { question: 'Wat kan een nadeel zijn van homogene groepen?', options: ['Kinderen durven minder','Meer motivatie','Lagere verwachtingen bij zwakkere groepen (Pygmalion)','Snellere vooruitgang'], answerIndex: 2 },
    { question: 'Wat is een voordeel van heterogene groepen?', options: ['Iedereen werkt trager','Zwakkere leerlingen leren van sterkere leerlingen','Er is geen differentiatie nodig','Iedereen krijgt dezelfde taak'], answerIndex: 1 },
    { question: 'Welke indeling hoort bij “ad random”?', options: ['Op basis van leeftijd','Willekeurig nummeren','Op basis van motoriek','Op basis van sociale vaardigheden'], answerIndex: 1 },
    { question: 'Bij welke situatie deel je in op basis van gestalte?', options: ['Dribbeloefeningen','Een quiz','Acrogym','Trefbal'], answerIndex: 2 },
    { question: 'Wat is een nadeel van groepen die leerlingen zelf maken?', options: ['Weinig motivatie','Grotere kans op ongelijke sterkte','Te veel voorbereiding','Te veel tijd nodig'], answerIndex: 1 },
    { question: 'Wat is een voordeel van indelen via een spelletje?', options: ['Kost minder tijd','Zorgt voor spanning en motivatie','Geeft altijd gelijke groepen','Verhoogt controle van de leerkracht'], answerIndex: 1 },
    { question: 'Wat is het “moeraseffect”?', options: ['Zwakkeren leren sneller','Zwakke leerlingen stromen moeilijk door naar sterkere groepen','Sterke leerlingen vertragen','Groepen worden kleiner'], answerIndex: 1 },
    { question: 'Wat is een voordeel van "de leerkracht deelt groepen in"?', options: ['Het duurt lang','Leerlingen kiezen zelf','Snelle en duidelijke methode','Altijd willekeurig'], answerIndex: 2 },
    { question: 'Welke maatstaf gebruik je voor een loopwedstrijd jongens/meisjes?', options: ['Leeftijd','Capaciteit','Sociale vaardigheden','Geslacht'], answerIndex: 3 }
  ];

  const les3Open = [
    { type: 'open', question: 'Geef twee voordelen van homogene groepen.', answerKeywords: ['leertempo','afstemmen','eigen','niveau','interesses','motivatie','durven','probleemoplossend'] },
    { type: 'open', question: 'Noem twee nadelen van homogene groepen.', answerKeywords: ['lagere','verwachtingen','pygmalion','minder','leerkansen','stigmatisering','superioriteits','inferioriteits','self-fulfilling','prophecy','minder','differentiatie','moeraseffect','gelijke','ses'] },
    { type: 'open', question: 'Geef twee voordelen van heterogene groepen.', answerKeywords: ['zwakkeren','leren','sterkeren','inzicht','uitleg','motivatie','sociaal','leerkansen','strategie','samenwerken','probleemoplossend','doorgroeimogelijkheden','differentiatie'] },
    { type: 'open', question: 'Geef één nadeel van heterogene groepen.', answerKeywords: ['zwakkeren','leiding','minder','kans','ongelijk','tijd','uitdaging','differentiatie'] },
    { type: 'open', question: 'Noem vier criteria/maatstaven om groepen in te delen.', answerKeywords: ['willekeurig','random','capaciteit','motorisch','niveau','gestalte','lichaamsbouw','gewicht','geslacht','leeftijd','interesse','sociale','vaardigheden'] },
    { type: 'open', question: 'Wat zijn twee voordelen van afnummeren?', answerKeywords: ['snelle','methode','eenvoudige','organisatie','onmiddellijk','zicht','groepen'] },
    { type: 'open', question: 'Wat zijn twee nadelen van afnummeren?', answerKeywords: ['vergeten','nummers','gerommel','achteraan','vrienden','ongelijke','sterkte','niet','motiverend'] },
    { type: 'open', question: 'Wat is een voordeel van “de leerkracht deelt groepen in”?', answerKeywords: ['snelle','duidelijke','methode','gelijke','sterkte','efficiënt','jonge','kinderen'] },
    { type: 'open', question: 'Wat is een nadeel van “de leerkracht deelt groepen in”?', answerKeywords: ['minder','zelfstandigheid','motivatie','dalen','minder','inspraak'] },
    { type: 'open', question: 'Noem twee voordelen van groepen vormen vanuit een bestaande opstelling.', answerKeywords: ['snelle','methode','eenvoudig','voortbouwen','bestaande','groepen','weinig','organisatie','logische','overgang'] }
  ];

  const les3Set = { title: 'Basisonderwijs – Les 3 (20 vragen)', questions: [...les3MC, ...les3Open] };

  const les4MC_v2 = [
    { question: 'Je wilt een klassikale opwarming geven aan een groep van het 1e of 2e leerjaar. Welk hulpmiddel wordt aangeraden om ervoor te zorgen dat ze goed verspreid staan?', options: ['Ze moeten elkaars hand vasthouden.', 'Je werkt met fluitsignalen.', 'Je gebruikt merktekens op de vloer.', 'Je zet ze in een flankkring.'], answerIndex: 2 },
    { question: 'Bekijk de afbeelding in de cursus (Pagina 13, middelste figuur links: cirkel met T\'s die naar het midden wijzen). Hoe heet deze opstelling?', options: ['Flankkring', 'Frontkring binnenwaarts', 'Frontrij', 'Halve kring'], answerIndex: 1 },
    { question: 'Bij welke organisatievorm is er sprake van een vast moment van recuperatie (rust) of terugkeren naar de startpositie, terwijl de andere leerlingen bezig zijn?', options: ['Klassikaal werken', 'Golven', 'Bewegingsomloop', 'Individueel werken'], answerIndex: 1 },
    { question: 'Wat is de hoofdfunctie van de lesgever bij de vernieuwde organisatievorm "Werken in Vakken"?', options: ['Rondlopen en overal een beetje helpen.', 'Aan de kant staan voor totaaloverzicht.', 'Het "Focusvak" begeleiden met de nieuwe leerstof.', 'De tijd opnemen en fluiten voor de wissel.'], answerIndex: 2 },
    { question: 'Je organiseert partneroefeningen waarbij kinderen elkaar moeten duwen of trekken. Waarop moet je, naast de positie, vooral letten bij de samenstelling van de duo\'s?', options: ['Dat vriendjes altijd samen zitten.', 'Dat lengte en gewicht op elkaar zijn afgestemd.', 'Dat jongens en meisjes apart werken.', 'Dat de snelste leerling bij de traagste zit.'], answerIndex: 1 },
    { question: 'Welk nadeel komt vaak voor bij een Bewegingsomloop als er twee moeilijke opdrachten in het parcours zitten?', options: ['De leerlingen worden te moe.', 'Er ontstaan \'bottlenecks\' of opstoppingen.', 'Het materiaal raakt te snel beschadigd.', 'De lesgever kan het niet alleen opbouwen.'], answerIndex: 1 },
    { question: 'Welke stelling over de positie van de lesgever is fout?', options: ['De lesgever verplaatst zich tijdens de les (is mobiel).', 'De lesgever staat aan de buitenzijde van de groep.', 'De lesgever staat vastgeroest op één centrale plaats.', 'De lesgever kiest een positie met een goed overzicht.'], answerIndex: 2 },
    { question: 'Wat is een kenmerk van "Fitnessposten" (Circuit) in de derde graad?', options: ['Ze worden vooral gebruikt in het 1e leerjaar.', 'Ze focussen op het aanleren van fijne motoriek.', 'De volgorde is zo gekozen dat grote spiergroepen afwisselend belast worden.', 'Er zijn maximaal 3 posten.'], answerIndex: 2 },
    { question: 'Bekijk de afbeelding op pagina 13 (onderste figuur: T\'s in een boogvorm rond de lesgever). Wanneer gebruik je deze halve kring vaak?', options: ['Als iedereen achter elkaar moet lopen.', 'Als de lesgever instructie geeft en iedereen hem moet kunnen zien.', 'Als de leerlingen tegen elkaar strijden.', 'Als de zaal te klein is voor een hele kring.'], answerIndex: 1 },
    { question: 'Waarom is tijdsefficiëntie een belangrijke vuistregel bij het kiezen van een opstelling?', options: ['Zodat de lesgever vroeger naar huis kan.', 'De opstelling mag niet veel tijd kosten om te organiseren.', 'Zodat de leerlingen sneller kunnen lopen.', 'Zodat het materiaal niet gebruikt hoeft te worden.'], answerIndex: 1 }
  ];

  const les4Open_v2 = [
    { type: 'open', question: 'Bij het werken in Golven (rij per rij): Wanneer mag de volgende leerling of rij vertrekken? Geef één concreet signaal of moment.', answerKeywords: ['voorganger', 'merkteken'], minMatches: 1 },
    { type: 'open', question: 'Je wilt gemakkelijk "Orde en Tucht" bewaren in een grote groep en ritmeoefeningen geven waarbij iedereen gelijktijdig werkt. Welke organisatievorm is hiervoor het meest geschikt volgens de theorie?', answerKeywords: ['klassikale', 'organisatie'], minMatches: 1 },
    { type: 'open', question: 'Wat doe je bij een bewegingsomloop als je merkt dat één opdracht veel langer duurt dan de andere en de kinderen moeten wachten (om opstoppingen te voorkomen)?', answerKeywords: ['parallelweg', 'voorzien'], minMatches: 1 },
    { type: 'open', question: 'Kijk naar de afbeeldingen van Rangen en Rijen (Pagina 14). Wat is het essentiële verschil in positie van de leerlingen tussen een Frontrij en een Flankrij?', answerKeywords: ['naast', 'achter'], minMatches: 1 },
    { type: 'open', question: 'Bij "Werken in Vakken" werken de leerlingen in het focusvak met de leerkracht. Hoe moeten de leerlingen in de andere vakken kunnen werken?', answerKeywords: ['zelfstandig', 'semi-zelfstandig'], minMatches: 1 },
    { type: 'open', question: 'Waarom is de organisatievorm Individueel (1-op-1 met de leerkracht) moeilijk toe te passen in een gemiddelde klas? Wat vereist dit van de groep?', answerKeywords: ['verantwoordelijkheidsgevoel', 'achterstand'], minMatches: 1 },
    { type: 'open', question: 'Wat is een belangrijk didactisch nadeel van de Klassikale organisatie als je kijkt naar het leerniveau van de kinderen?', answerKeywords: ['differentiatie', 'individueel', 'niveau'], minMatches: 1 },
    { type: 'open', question: 'Om het doorschuiven bij posten/vakken vlot te laten verlopen, geeft de cursus een praktische organisatietip met nummers. Wat moet je doen met de nummers en in welke richting laat je ze draaien?', answerKeywords: ['lamineren', 'wijzerzin'], minMatches: 1 },
    { type: 'open', question: 'Volgens de theorie over de leercurve (Pagina 39): Waarom is het beter om meerdere vaardigheden per les te oefenen (in vakken) zodat ze snel terugkomen, in plaats van één vaardigheid heel lang klassikaal?', answerKeywords: ['gevarieerde', 'herhaling', 'leerwinst'], minMatches: 1 },
    { type: 'open', question: 'Bij "Spelposten" (bijvoorbeeld balspelen) wordt aangeraden om de groepjes klein te houden. Hoe pas je de ruimte aan om dit mogelijk te maken in plaats van één groot veld in de lengte te gebruiken?', answerKeywords: ['terreintjes', 'breedte'], minMatches: 1 }
  ];

  const les4Set_v2 = { title: 'Basisonderwijs – Les 4 (20 vragen)', questions: [...les4MC_v2, ...les4Open_v2] };

  const les5MC = [
    { question: 'Met welke tool teken je digitaal een zaalopstelling volgens LES 5?', options: ['Word','Paint','3D SportsEditor','Autocad'], answerIndex: 2 },
    { question: 'Wat heb je zeker nodig om digitaal te tekenen volgens de les?', options: ['Enkel papier','Symbolenlijst van Chamilo','Een speciale tekenpen','Excel'], answerIndex: 1 },
    { question: 'Wat moet je tekenen bij een zaalopstelling in LES 5?', options: ['Enkel het materiaal','Enkel de leerlingen','De volledige organisatie: materiaal, LLN, LK','Enkel de looplijnen'], answerIndex: 2 },
    { question: 'Welke kleur gebruik je voor leerlingen in de digitale tekening?', options: ['Blauw','Geel','Rood','Groen'], answerIndex: 2 },
    { question: 'Welke kleur gebruik je voor de lesgever?', options: ['Rood','Blauw','Zwart','Oranje'], answerIndex: 1 },
    { question: 'Wat geeft een stippellijn weer?', options: ['Bewegingsbaan van een bal','Bewegingsbaan van een persoon','Opstelling van materiaal','Startpunt van een oefening'], answerIndex: 1 },
    { question: 'Wat geeft een volle lijn weer?', options: ['Looplijn leerlingen','Traject in touwtje springen','Bewegingsbaan van een object (bal)','Richting van de lesgever'], answerIndex: 2 },
    { question: 'Wat is een belangrijk aandachtspunt bij het tekenen van een zaalopstelling?', options: ['Teken zoveel mogelijk details','Teken altijd het hele gebouw','Hou rekening met deur/ramen/berging','Gebruik altijd drie kleuren'], answerIndex: 2 },
    { question: 'Wat teken je bij een synthese-oefening?', options: ['Enkel de kern van de les','De hele omloop met oefenstof én organisatie','Enkel het begin van de les','Alleen de leerlingen'], answerIndex: 1 },
    { question: 'Waar moet je staan als lesgever volgens de richtlijnen in LES 5?', options: ['Altijd in het midden','Waar je het beste overzicht hebt','Tegen de muur','Naast de uitgang'], answerIndex: 1 }
  ];

  const les5Open = [
    { type: 'open', question: 'Wat moet je ALTIJD weergeven in een digitale zaalopstelling?', answerKeywords: ['materiaal','aantal','leerlingen','rood','lesgever','blauw','terreinafbakening','looplijnen','stippellijn','ballijnen','volle','opstellingsvorm','overzicht','hele','zaal'] },
    { type: 'open', question: 'Wat zijn belangrijke aandachtspunten bij het tekenen van een opstelling in pen & papier?', answerKeywords: ['deuren','ramen','berging','logische','zaalopstelling','duidelijke','symbolen','juiste','schaal','materiaal','plaats'] },
    { type: 'open', question: 'Wat zijn voordelen van 3D SportsEditor?', answerKeywords: ['2d','3d','weergave','overzichtelijk','symbolen','materiaal','leerlingen','looplijnen','makkelijk','professionele','layout','lesvoorbereiding'] },
    { type: 'open', question: 'Wat is het doel van stokfiguurtjes tekenen?', answerKeywords: ['voorbereiding','kijkwijzer','zij','aanzicht','houding','positionering','oefening','motorisch','inzicht'] },
    { type: 'open', question: 'Wat moet je tekenen bij een estafette-oefening (oefening 3)?', answerKeywords: ['lln','rijen','rood','lesgever','blauw','looplijnen','stippellijnen','materiaal','plaats','start','eindpunten','overzicht'] },
    { type: 'open', question: 'Wat is het doel van looplijnen tekenen?', answerKeywords: ['aangeven','lopen','positie','beweging','overzicht','veiligheid','logische','doorstroom'] },
    { type: 'open', question: 'Wat moet je doen bij de synthese-oefening?', answerKeywords: ['grondplan','plakken','oefenstof','kolommen','materiaal','aantallen','noteren','aanpassen','organisatie'] },
    { type: 'open', question: 'Wat is belangrijk bij het kiezen van de lesgeverspositie?', answerKeywords: ['overzicht','alle','lln','dicht','gevaarlijke','oefening','nooit','rug','split','vision','veiligheid'] },
    { type: 'open', question: 'Waarom gebruik je symbolen uit de symbolenlijst (Chamilo)?', answerKeywords: ['uniformiteit','duidelijkheid','begrijpt','zelfde','symbolen','professionele','kwaliteit','fouten','vermijden'] },
    { type: 'open', question: 'Wat zijn de stappen bij het tekenen van een zaalopstelling voor een bewegingsomloop?', answerKeywords: ['opstellingsvorm','materiaal','lln','rood','lk','blauw','looplijnen','noteer','aantallen','zaalstructuur','overzicht','veiligheid'] }
  ];

  const les5Set = { title: 'Basisonderwijs – Les 5 (20 vragen)', questions: [...les5MC, ...les5Open] };

  const les6MC = [
    { question: 'Hoeveel cm en kg groeit een kind jaarlijks ongeveer in de lagere school?', options: ['2–3 cm & 1 kg','5–7 cm & 2–3 kg','10 cm & 5 kg','1–2 cm & 0,5 kg'], answerIndex: 1 },
    { question: 'Welke groeit sneller in deze fase?', options: ['Jongens','Meisjes','Gelijk','Niet in de samenvatting'], answerIndex: 1 },
    { question: 'Wat is een kenmerk van de strekkingsfase?', options: ['Ledematen groeien trager','Hoofd groeit snel','Lichaam wordt langer en smaller','Kinderen worden breder'], answerIndex: 2 },
    { question: 'Tot welke leeftijd is neurale groei sterk?', options: ['± 5 jaar','± 6 jaar','± 8 jaar','± 12 jaar'], answerIndex: 2 },
    { question: 'Waarom is 8–12 jaar de “gouden leeftijd” voor motorisch leren?', options: ['Omdat kinderen dan sterker zijn','Omdat kinderen dan nog fantasierijk zijn','Stabiele groei + volgroeide neurale ontwikkeling','Omdat ze minder spelen'], answerIndex: 2 },
    { question: 'Wanneer begint de fysiologische ontwikkeling meestal?', options: ['Jongens 10 / Meisjes 8','Jongens 13 / Meisjes 11','Jongens 16 / Meisjes 14','Jongens 12 / Meisjes 9'], answerIndex: 1 },
    { question: 'Bij welke graad start je met echte techniek-aanleren?', options: ['1e graad','2e graad','3e graad','Enkel secundair'], answerIndex: 1 },
    { question: 'Wat gebeurt er met nieuwe bewegingen in het begin?', options: ['Ze worden automatisch uitgevoerd','Ze worden bewust aangestuurd door de hersenen','Ze worden niet opgeslagen','Kinderen vergeten ze meteen'], answerIndex: 1 },
    { question: 'Wat hoort NIET bij de drie luiken van psychomotoriek?', options: ['Lichaamsperceptie','Ruimteperceptie','Emotionele perceptie','Lichaamshoudingen & lateraliteit'], answerIndex: 2 },
    { question: 'Wat is lateraliteit?', options: ['Ritmegevoel','Links-rechtsontwikkeling','Evenwicht','Uithouding'], answerIndex: 1 }
  ];

  const les6Open = [
    { type: 'open', question: 'Noem vier kenmerken van de lichamelijke ontwikkeling (fysiek) in de lagere school.', answerKeywords: ['5','7','cm','2','3','kg','meisjes','sneller','ledematen','groei','langer','smaller','hoofd','minder','spierweefsel','tandenwissel'] },
    { type: 'open', question: 'Geef drie kenmerken van de neurale ontwikkeling.', answerKeywords: ['tot','8','jaar','sterke','neurale','groei','cruciale','periode','basisbewegingen','basis','vast','na','8','moeilijk','inhalen','gericht','leren','bewegen','volgroeide','neurale','ontwikkeling','techniek'] },
    { type: 'open', question: 'Waarom is 8–12 jaar de “gouden leeftijd” voor motorisch leren?', answerKeywords: ['stabiele','groei','musculo','skeletaal','volgroeide','neurale','ontwikkeling','gericht','systematisch','techniek','fundament','sportspecifieke'] },
    { type: 'open', question: 'Beschrijf de zeven stappen van motorisch leren.', answerKeywords: ['waarnemen','nadenken','uitvoeren','feedback','bijsturen','herhalen','beheersen','automatiseren'] },
    { type: 'open', question: 'Noem de vier onderdelen van lichaamsperceptie.', answerKeywords: ['lichaamsbegrenzing','lichaamsdelen','aanvoelen','lichaamsassen','aanvoelen','lengteas','sagittale','breedteas','lichaamshoudingen','lateraliteit'] },
    { type: 'open', question: 'Wat zijn voorbeelden van activiteiten voor lichaamsbegrenzing?', answerKeywords: ['kruipen','tunnels','stoeien','matten','partneroefeningen','balans','contact','grond','materiaal'] },
    { type: 'open', question: 'Geef alle voorbeelden van lichaamsassen + bijhorende beweging.', answerKeywords: ['lengteas','springen','rollen','sagittale','voorwaarts','achterwaarts','radslag','frontale','breedteas','koprol','zijwaarts','schommelen'] },
    { type: 'open', question: 'Noem twee problemen die ontstaan bij onvoldoende lichaamsperceptie.', answerKeywords: ['links','rechts','moeite','slechte','houding','onzeker','bewegen','onvoldoende','coördinatie','fouten','teamsport','houding','minder','controle'] },
    { type: 'open', question: 'Wat houdt lateraliteit in?', answerKeywords: ['links','rechts','voorkeur','ontwikkelt','5','6','jaar','dissociatie','onafhankelijk','bewegen','verschillen','hand','voet','oog','voorbeelden','schoppen','slaan','dans'] },
    { type: 'open', question: 'Geef drie didactische tips per graad (1e, 2e, 3e graad).', answerKeywords: ['1e','basisbewegingen','gevarieerde','omstandigheden','herhaling','speels','leren','2e','gericht','techniek','systematisch','plezier','3e','sportspecifiek','juiste','techniek','uithoudingsvermogen','meisjes','11','jaar','precisie','technische','uitvoering'] }
  ];

  const les6Set = { title: 'Basisonderwijs – Les 6 (20 vragen)', questions: [...les6MC, ...les6Open] };

  const les7MC = [
    { question: 'Welke drie stappen horen bij het proces van motorisch leren?', options: ['Denken – Rust – Herhalen','Waarnemen – Uitvoeren – Feedback krijgen','Bewegen – Rusten – Denken','Start – Stop – Herstart'], answerIndex: 1 },
    { question: 'Wat gebeurt er naarmate een beweging beter gekend is?', options: ['Meer controle vanuit hersenen','Hersenen sturen steeds bewuster aan','Hersencontrole neemt af → automatisatie','Kinderen verliezen interesse'], answerIndex: 2 },
    { question: 'Wat is het eindstadium van motorisch leren?', options: ['Onbewust onbekwaam','Bewust onbekwaam','Bewust vaardig','Onbewust vaardig'], answerIndex: 3 },
    { question: 'Wanneer ontwikkelt een kind een duidelijke voorkeurszijde (hand/voet)?', options: ['2–3 jaar','4 jaar','5–6 jaar','10 jaar'], answerIndex: 2 },
    { question: 'Wat is lichaamsperceptie?', options: ['Hoe goed je kan kijken','Aanvoelen van het eigen lichaam','Hoe flexibel je bent','Hoe snel je loopt'], answerIndex: 1 },
    { question: 'Wat hoort NIET bij lichaamsassen?', options: ['Lengteas','Sagittale as','Horizontale as','Frontale/breedteas'], answerIndex: 2 },
    { question: 'Wat is dissociatie?', options: ['Bewegingen traag uitvoeren','Onafhankelijk bewegen van lichaamsdelen','Evenwicht houden','Ademhaling controleren'], answerIndex: 1 },
    { question: 'Wat hoort bij de sagittale as?', options: ['Springen','Radslag','Koprol','Om lengteas rollen'], answerIndex: 1 },
    { question: 'Wat is een kenmerk van jonge kinderen volgens de samenvatting?', options: ['Kunnen moeilijk automatiseren','Hebben sterke neurale controle','Leren vooral visueel','Geen voorkeurskant'], answerIndex: 1 },
    { question: 'Wat is een kenmerk van een beweging die geautomatiseerd is?', options: ['Je moet er bewust over nadenken','Hersenen sturen actief aan','Uitvoering is vloeiend en gecontroleerd','Je voert ze net aan het leren uit'], answerIndex: 2 }
  ];

  const les7Open = [
    { type: 'open', question: 'Geef de volledige keten van motorisch leren (7 stappen).', answerKeywords: ['waarnemen','nadenken','uitvoeren','feedback','krijgen','bijsturen','herhalen','beheersen','automatiseren'] },
    { type: 'open', question: 'Wat verandert er in hersencontrole naarmate een beweging beter gekend is?', answerKeywords: ['hersencontrole','neemt','af','minder','bewuste','aansturing','geautomatiseerd','vloeiend','gecontroleerd','minder','denkstappen','nodig'] },
    { type: 'open', question: 'Wat is lichaamsperceptie?', answerKeywords: ['aanvoelen','eigen','lichaam','weten','opgebouwd','grootte','verhoudingen','lichaamsschema','ontwikkelen','bewegingservaringen','opgeslagen','controle','eigen','bewegingen'] },
    { type: 'open', question: 'Noem alle onderdelen van lichaamsperceptie.', answerKeywords: ['lichaamsbegrenzing','lichaamsdelen','aanvoelen','lichaamsassen','aanvoelen','lengteas','sagittale','as','frontale','breedteas','lichaamshoudingen','aanvoelen','lateraliteit'] },
    { type: 'open', question: 'Geef voorbeelden van activiteiten die lichaamsbegrenzing stimuleren.', answerKeywords: ['kruipen','tunnels','stoeien','matten','partneroefeningen','balansoefeningen','balans','contact','materiaal','grond','toestellen','andere','kinderen'] },
    { type: 'open', question: 'Wat zijn voorbeelden van bewegingen bij de drie lichaamsassen?', answerKeywords: ['lengteas','springen','rollen','sagittale','voorwaarts','achterwaarts','radslag','frontale','breedteas','koprol','zijwaarts','schommelen'] },
    { type: 'open', question: 'Wat betekent lateraliteit?', answerKeywords: ['links','rechts','voorkeur','voorkeurskant','5','6','jaar','dissociatie','onafhankelijk','bewegen','lichaamsdelen','hand','voet','oog','schoppen','slaan','dansbewegingen'] },
    { type: 'open', question: 'Wat kan een probleem zijn bij kinderen met onvoldoende houdingsbewustzijn?', answerKeywords: ['armen','gestrekt','gebogen','slechte','houding','onzeker','bewegen','foutieve','positie','teamsport','minder','zelfvertrouwen','beperkte','motorische','controle'] },
    { type: 'open', question: 'Wat is het verband tussen houding en teamsporten?', answerKeywords: ['goede','houding','basis','verdedigen','positie','spel','zelfvertrouwen','rol','vermijden','acties','bewustzijn','houding','betere','besluitvorming'] },
    { type: 'open', question: 'Wat is de rol van variatie in beweging voor het lichaamsschema?', answerKeywords: ['verruimt','lichaamsschema','meer','verschillende','bewegingservaringen','betere','motorische','controle','snellere','automatisatie','meer','inzicht','eigen','lichaam','flexibiliteit','bewegingsopdrachten'] }
  ];

  const les7Set = { title: 'Basisonderwijs – Les 7 (20 vragen)', questions: [...les7MC, ...les7Open] };

  const les8MC = [
    { question: 'Vanaf welke leeftijd kan een kind conservatie begrijpen (Piaget)?', options: ['4 jaar','5 jaar','7 jaar','10 jaar'], answerIndex: 2 },
    { question: 'Wat is een kenmerk van gedecentreerd denken?', options: ['Fixeren op één aspect','Meerdere aspecten tegelijk kunnen beoordelen','Fantasie en realiteit door elkaar halen','Impulsief reageren'], answerIndex: 1 },
    { question: 'Wat betekent omkeerbaarheid (reversibiliteit)?', options: ['De volgorde vergeten','Mentaal een proces kunnen terugspoelen','Alleen het eindresultaat zien','Geen inzicht hebben'], answerIndex: 1 },
    { question: 'Vanaf welke leeftijd is klas-inclusie mogelijk?', options: ['Vanaf 4 jaar','Vanaf 5 jaar','Vanaf 7 jaar','Vanaf 12 jaar'], answerIndex: 2 },
    { question: 'Welk proces hoort bij perceptuele reorganisatie?', options: ['Nieuwe figuren herkennen in bestaande structuren','Onderdelen los zien van het geheel','Enkel letterlijk waarnemen','Geen verbanden leggen'], answerIndex: 0 },
    { question: 'Wat gebeurt er met fantasie vanaf 8 jaar?', options: ['Wordt sterker','Wordt minder, realistischer','Maakt geen onderscheid tussen echt en fantasie','Verdwijnt volledig'], answerIndex: 1 },
    { question: 'Wat hoort bij taalontwikkelend lesgeven (TOL)?', options: ['Veel verkleinwoorden','Niet herhalen','Functionele begrippen gebruiken','Spreken in kindertaal'], answerIndex: 2 },
    { question: 'Wat is een voorbeeld van perceptuele exploratie?', options: ['Snel gokken','Systematisch zoeken in info','Enkel het geheel bekijken','Enkel details bekijken'], answerIndex: 1 },
    { question: 'Vanaf welke graad kan je tactiek gebruiken in LO?', options: ['1e graad','2e graad','Kleuters','Secundair'], answerIndex: 1 },
    { question: 'Wat groeit sterk in het geheugen tijdens de lagere school?', options: ['Werkgeheugen & geheugenstrategieën','Enkel korte-termijngeheugen','Enkel metageheugen','Enkel visueel geheugen'], answerIndex: 0 }
  ];

  const les8Open = [
    { type: 'open', question: 'Noem de drie kenmerken van het concreet operationeel denken (conservatie).', answerKeywords: ['gedecentreerd','denken','niet','fixeren','aspect','transformatie','zien','tussenstappen','begrijpen','omkeerbaarheid','reversibiliteit','mentaal','terugspoelen'] },
    { type: 'open', question: 'Geef voorbeelden van situaties rond conservatie die kinderen vanaf 7 jaar wél begrijpen.', answerKeywords: ['water','breed','smal','glas','hoeveelheid','gelijk','klei','ballen','vorm','blijft','gelijk','stokjes','verschuiven','lengte','rij','kralen','dichter','uit','elkaar','aantal','gelijk'] },
    { type: 'open', question: 'Wat is classificatie?', answerKeywords: ['sorteren','kenmerken','ordenen','criterium','5','jaar','klasseninclusie','7','deelverzamelingen','herkennen','overkoepelende','categorie','begrijpen'] },
    { type: 'open', question: 'Wat is seriatie?', answerKeywords: ['rangschikken','volgorde','grootte','lengte','dikte','gewicht','systematisch','vergelijken','niet','gissen','kleuters','twee','objecten','tegelijk'] },
    { type: 'open', question: 'Wat hoort bij klassen- en relatielogica?', answerKeywords: ['logische','relaties','leggen','verbanden','categorieën','concreet','materiaal','strategie','verwoorden','argumenteren'] },
    { type: 'open', question: 'Geef alle vormen van sociaal denken volgens Piaget (rolneming).', answerKeywords: ['subjectieve','rolneming','6','jaar','begrijpt','anderen','denken','gebrek','info','zelfreflectieve','rolneming','8','jaar','inleven','ander','houdt','geen','rekening','oordeel','wederzijdse','rolneming','10','12','jaar','perspectieven','vergelijken','buitenstaander'] },
    { type: 'open', question: 'Noem de drie processen binnen perceptie.', answerKeywords: ['perceptuele','reorganisatie','perceptuele','schematisering','perceptuele','exploratie'] },
    { type: 'open', question: 'Geef drie didactische tips om perceptie te ondersteunen.', answerKeywords: ['focus','essentiële','zaken','structuur','bieden','herhaling','overbodige','prikkels','vermijden','duidelijke','visuele','info','materialen','eenvoudig'] },
    { type: 'open', question: 'Wat zijn kenmerken van fantasie vanaf 8 jaar?', answerKeywords: ['minder','pure','fantasie','strikte','scheiding','fantasie','realiteit','realistische','personages','leeftijdsgenoten','realistische','settings','verleden','toekomst','geloofwaardig','lo','1e','graad','fantasiethema’s','2e','3e','graad','niet','noodzakelijk'] },
    { type: 'open', question: 'Noem drie kenmerken van taalontwikkeling in de lagere school.', answerKeywords: ['explosieve','groei','woordenschat','betere','zinsbouw','rekening','gesprekspartner','creativiteit','taal','humor','manipuleren','omgevingsstimulatie','cruciaal'] }
  ];

  const les8Set = { title: 'Basisonderwijs – Les 8 (20 vragen)', questions: [...les8MC, ...les8Open] };

  const les9MC = [
    { question: 'Vanaf welke leeftijd neemt pure fantasie duidelijk af?', options: ['5 jaar','6 jaar','8 jaar','12 jaar'], answerIndex: 2 },
    { question: 'Kinderen vanaf 8 jaar verkiezen in fantasie vooral…', options: ['Pure magie','Realistische personages en herkenbare situaties','Dierenverhalen','Onlogische werelden'], answerIndex: 1 },
    { question: 'Wat hoort bij taalontwikkelend lesgeven (TOL)?', options: ['Veel verkleinwoorden gebruiken','Spreken in kindertaal','Kernwoorden vooraan zetten','Niet herhalen'], answerIndex: 2 },
    { question: 'Wat hoort NIET bij rijke taal?', options: ['Volzinnen','Geen kindertaal','Veel verkleinwoorden','Natuurlijke taal'], answerIndex: 2 },
    { question: 'Welke fase van vriendschap hoort bij 7–9 jaar?', options: ['Normatief stadium','Empathisch stadium','Kosten-batenstadium','Stabiliteitsstadium'], answerIndex: 2 },
    { question: 'In welk stadium van Kohlberg zitten lagere schoolkinderen meestal?', options: ['Preconventioneel','Conventioneel','Postconventioneel','Egoïstisch stadium'], answerIndex: 1 },
    { question: 'Wat is een kenmerk van wederzijdse rolneming (10–12 jaar)?', options: ['Enkel eigen perspectief zien','Denken dat iedereen hetzelfde denkt','Perspectieven vergelijken als een buitenstaander','Niet kunnen inleven'], answerIndex: 2 },
    { question: 'Wat leert een kind in de fase van Erikson (schoolperiode)?', options: ['Autonomie vs schaamte','Identiteit vs rolverwarring','Vlijt vs minderwaardigheid','Vertrouwen vs wantrouwen'], answerIndex: 2 },
    { question: 'Wat is een basisvoorwaarde voor schoolrijpheid?', options: ['Complexe geheugentechnieken','Sterke sportvaardigheden','Goede sensomotorische uitrusting (zien, horen, oog-handcoördinatie)','Kunnen lezen'], answerIndex: 2 },
    { question: 'Welke rekenvoorwaarde hoort bij schoolrijpheid?', options: ['Lange teksten kunnen lezen','Snel tot 5 kunnen inschatten','Schrijven zonder fouten','Lange vermenigvuldigingen kennen'], answerIndex: 1 }
  ];

  const les9Open = [
    { type: 'open', question: 'Noem alle kenmerken van fantasie vanaf 8 jaar.', answerKeywords: ['minder','pure','fantasie','scheiding','werkelijkheid','realistische','personages','leeftijdsgenoten','realistische','settings','avontuurlijk','geloofwaardig','minder','nood','fantasiethema’s','2e','3e','graad','inkleuring','rode','draad','geen','hoofdactiviteit','sportkampen','realistische','thema’s','avonturiers','sporthelden'] },
    { type: 'open', question: 'Geef alle kenmerken van taalontwikkeling in lagere school.', answerKeywords: ['explosieve','woordenschatgroei','evolutie','zinsbouw','rekening','gesprekspartner','creativiteit','taal','humor','manipulatie','taal','omgeving','stimulering','cruciaal'] },
    { type: 'open', question: 'Wat zijn alle componenten van Taalontwikkelend Lesgeven (TOL)?', answerKeywords: ['functionele','begrippen','materiaal','toestellen','richtingsbegrippen','boven','onder','links','houdingen','bewegingen','benoemen','kernwoorden','vooraan','herhalen','intonatie','wisselen','verwoorden','wat','doet','rijke','taal','geen','kindertaal','verkleinwoorden','beperken','volzinnen','natuurlijke','taal','samenwerking','stimuleren','analyseren','redeneren','open','vragen','hoe','waarom','vragen','beantwoorden','met','vragen','handelingen','verwoorden'] },
    { type: 'open', question: 'Noem de drie stadia van vriendschappen van 7–13 jaar.', answerKeywords: ['kosten','baten','zelfde','interesses','speelgoed','normatief','loyaliteit','opkomen','elkaar','empathisch','diepe','vriendschap','gevoelens','delen','geen','misbruik'] },
    { type: 'open', question: 'Wat is het belang van contact met leeftijdsgenoten?', answerKeywords: ['leren','samenwerken','conflicten','oplossen','feedback','sociale','spiegel','zelfkennis','vaardigheden','structuur','groepsvorming','bevorderen','buiten','comfortzone','functioneren'] },
    { type: 'open', question: 'Wat zijn kenmerken van het zelfconcept in lagere school?', answerKeywords: ['bewustzijn','sterke','zwakke','punten','realistischer','zelfbeeld','feedback','invloed','peers','ouders','leerkrachten','meisjes','onderschatten','jongens','overschatten','basis','positieve','zelfwaardering'] },
    { type: 'open', question: 'Noem de kenmerken van de morele ontwikkeling (Kohlberg) in lagere school.', answerKeywords: ['conventionele','moraal','niveau','2','algemeen','belang','stadium','3','braaf','gedrag','goedkeuring','stadium','4','plichtsbesef','niet','eigenbelang','niveau','1'] },
    { type: 'open', question: 'Geef alle kenmerken van emotionele ontwikkeling.', answerKeywords: ['emoties','herkennen','nauwkeuriger','context','rekening','gemengde','gevoelens','genuanceerd','uiten','emotieregulatie','verbetert','strategieën','negatieve','emoties'] },
    { type: 'open', question: 'Wat zijn algemene schoolvoorwaarden voor schoolrijpheid?', answerKeywords: ['lichamelijk','goede','gezondheid','sensomotoriek','zicht','gehoor','oog','handcoördinatie','cognitief','minimaal','iq','schooltaal','beheersen','concentratie','sociaal','openstaan','contacten','samenwerken','respecteren','regels','dynamisch','affectief','nieuwsgierigheid','leergierigheid','leerhonger','motivatie'] },
    { type: 'open', question: 'Noem alle specifieke schoolvoorwaarden (lezen – schrijven – rekenen).', answerKeywords: ['leesvoorwaarden','tekst','boodschap','vormperceptie','richtingsbewustzijn','klanken','letters','koppelen','schrijfvoorwaarden','goede','penhouding','woorden','fonemen','analyseren','rekenen','eenvoudige','bewerkingen','erbij','eraf','verdelen','hoeveelheidsbegrippen','meer','minder','evenveel','snel','inschatten'] }
  ];

  const les9Set = { title: 'Basisonderwijs – Les 9 (20 vragen)', questions: [...les9MC, ...les9Open] };

  const les10MC = [
    { question: 'Hoeveel procent van de evaluatie bestaat uit de lesvoorbereiding + microteaching?', options: ['10%','30%','50%','70%'], answerIndex: 1 },
    { question: 'Hoeveel procent van de evaluatie bestaat uit het schriftelijk examen?', options: ['10%','30%','50%','70%'], answerIndex: 3 },
    { question: 'Wat gebeurt er als je niet aanwezig bent op de microteaching?', options: ['Je verliest 10%','Je moet een vervangtaak doen','Je bent afwezig voor het OLOD','Je mag later inhalen'], answerIndex: 2 },
    { question: 'Wat gebeurt er als je de lesvoorbereiding te laat indient?', options: ['Je krijgt -1 punt','Je mag het opnieuw indienen','Je krijgt nul op twintig','Je bent afwezig voor het OLOD'], answerIndex: 3 },
    { question: 'Hoeveel leerlingen moet je voorzien in de lesvoorbereiding?', options: ['10','15','20','25'], answerIndex: 2 },
    { question: 'Hoe lang duurt de effectieve lestijd die je moet uitwerken?', options: ['20 minuten','30 minuten','40 minuten','50 minuten'], answerIndex: 2 },
    { question: 'Waar moet je je lesvoorbereiding indienen?', options: ['Via mail','In Smartschool','Op Chamilo bij ‘Opdrachten’','In de praktijkles afgeven'], answerIndex: 2 },
    { question: 'Wat moet er verplicht op het voorblad van de lesvoorbereiding staan?', options: ['Enkel onderwerp','Lesgever, onderwerp & doelgroep','Enkel doelgroep','Enkel naam lesgever'], answerIndex: 1 },
    { question: 'Wat moet er bij het 2e blad van de lesvoorbereiding?', options: ['Organisatie + materiaal + bronnen + rol gekwetsten','Enkel materiaal','Enkel bronnen','Enkel inleiding'], answerIndex: 0 },
    { question: 'Wat moet je op het 3e blad noteren?', options: ['Enkel de kern','Enkel de inleiding','Inleiding – kern – slot met timings, oefenstof & didactisch handelen','Enkel het slot'], answerIndex: 2 }
  ];

  const les10Open = [
    { type: 'open', question: 'Wat moet er verplicht op het voorblad staan?', answerKeywords: ['naam','lesgever','lesonderwerp','doelgroep','1e','2e','3e','leerjaar'] },
    { type: 'open', question: 'Wat moet je noteren bij het onderdeel ‘Organisatie’ op blad 2?', answerKeywords: ['zaalopstelling','materiaal','opstelling','leerlingen','lesgever','start','kern','digitale','tekening','verplicht','materiaal','bronnen','rol','gekwetsten'] },
    { type: 'open', question: 'Wat moet je uitwerken in stap 1 van de examenopdracht?', answerKeywords: ['inleiding','kern','slot','oefenstof','didactisch','handelen','passende','organisatievorm','correcte','doelgroep'] },
    { type: 'open', question: 'Wat moet er bij de oefenstof worden weergegeven?', answerKeywords: ['duidelijke','beschrijving','oefening','concreet','stappen','organisatievorm','materialen','aantallen','uitgangshouding','afspraken'] },
    { type: 'open', question: 'Wat moet je noteren bij didactisch handelen?', answerKeywords: ['lesgever','zegt','doet','timing','instructies','aandachtspunten','adp','begeleidende','feedback','zij','aanzicht','oefening'] },
    { type: 'open', question: 'Wat is verplicht bij het digitale tekenwerk?', answerKeywords: ['zaalopstelling','tekenen','correcte','symbolen','lln','rood','lk','blauw','looplijnen','stippellijnen','ballijn','volle','lijn','objectcontrole'] },
    { type: 'open', question: 'Welke documenten moet je raadplegen bij het maken van de lesvoorbereiding?', answerKeywords: ['syllabus','basisonderwijs','presentaties','lessen','lesmaterialen','chamilo','leerpad','oefenstof','leerlijn'] },
    { type: 'open', question: 'Wat is de deadline van de examenopdracht?', answerKeywords: ['vrijdag','19','december','2025','23u59','na','deadline','automatisch','geblokkeerd','niet','meer','indienen'] },
    { type: 'open', question: 'Wat gebeurt er als je de deadline mist?', answerKeywords: ['indienmogelijkheid','geblokkeerd','geen','lesvoorbereiding','afwezig','olod','geen','herkansing','moment','onmiddellijk','niet','geslaagd'] },
    { type: 'open', question: 'Waarom is een duidelijke lesvoorbereiding belangrijk?', answerKeywords: ['overzicht','lesgever','veiligheid','vlotte','organisatie','goede','opbouw','inleiding','kern','slot','correcte','leerlijnen','kwalitatieve','instructie','microteaching','efficiënt'] }
  ];

  const les10Set = { title: 'Basisonderwijs – Les 10 (20 vragen)', questions: [...les10MC, ...les10Open] };

  const basisonderwijs = normalizeSubject({
    name: 'Basisonderwijs',
    summary: 'Hier komen de samenvattingen van Basisonderwijs zodra ze beschikbaar zijn.',
    categories: [
      { id: 'les1', domain: 'basisonderwijs', section: 'les-1', title: 'Les 1', description: 'Les 1 – 20 vragen', quizSets: [les1Set] },
      { id: 'les2', domain: 'basisonderwijs', section: 'les-2', title: 'Les 2', description: 'Les 2 – 20 vragen', quizSets: [les2Set] },
      { id: 'les3', domain: 'basisonderwijs', section: 'les-3', title: 'Les 3', description: 'Les 3 – 20 vragen', quizSets: [les3Set] },
      { id: 'les4', domain: 'basisonderwijs', section: 'les-4', title: 'Les 4', description: 'Les 4 – 20 vragen', quizSets: [les4Set_v2] },
      { id: 'les5', domain: 'basisonderwijs', section: 'les-5', title: 'Les 5', description: 'Les 5 – 20 vragen', quizSets: [les5Set] },
      { id: 'les6', domain: 'basisonderwijs', section: 'les-6', title: 'Les 6', description: 'Les 6 – 20 vragen', quizSets: [les6Set] },
      { id: 'les7', domain: 'basisonderwijs', section: 'les-7', title: 'Les 7', description: 'Les 7 – 20 vragen', quizSets: [les7Set] },
      { id: 'les8', domain: 'basisonderwijs', section: 'les-8', title: 'Les 8', description: 'Les 8 – 20 vragen', quizSets: [les8Set] },
      { id: 'les9', domain: 'basisonderwijs', section: 'les-9', title: 'Les 9', description: 'Les 9 – 20 vragen', quizSets: [les9Set] },
      { id: 'les10', domain: 'basisonderwijs', section: 'les-10', title: 'Les 10', description: 'Les 10 – 20 vragen', quizSets: [les10Set] }
    ],
    examDomains: [
      {
        id: 'basisonderwijs',
        title: 'Basisonderwijs',
        description: 'Lesbundels met meerkeuze en open vragen.',
        sections: [
          { id: 'les-1', title: 'Les 1', categoryIds: ['les1'] },
          { id: 'les-2', title: 'Les 2', categoryIds: ['les2'] },
          { id: 'les-3', title: 'Les 3', categoryIds: ['les3'] },
          { id: 'les-4', title: 'Les 4', categoryIds: ['les4'] },
          { id: 'les-5', title: 'Les 5', categoryIds: ['les5'] },
          { id: 'les-6', title: 'Les 6', categoryIds: ['les6'] },
          { id: 'les-7', title: 'Les 7', categoryIds: ['les7'] },
          { id: 'les-8', title: 'Les 8', categoryIds: ['les8'] },
          { id: 'les-9', title: 'Les 9', categoryIds: ['les9'] },
          { id: 'les-10', title: 'Les 10', categoryIds: ['les10'] }
        ]
      }
    ]
  });

  const blessureLes1Set = {
    title: 'Les 1: Algemeen Kader & Omvang van Sportblessures',
    questions: [
      {
        question: 'Wat zijn de drie centrale pijlers van blessurepreventie?',
        options: [
          'Prestatie, Revalidatie, Competitie',
          "Levenslang sporten, Prestatie, Ethiek ('Gezond sporten')",
          'Techniek, Tactiek, Fysiek',
          'Topsport, Breedtesport, G-sport'
        ],
        answerIndex: 1
      },
      {
        question: 'Letsels zijn de voornaamste reden waarom mensen stoppen met fysieke activiteit.',
        options: ['Juist', 'Fout'],
        answerIndex: 0
      },
      {
        question: 'Volgens onderzoek is welk percentage van alle letsels in Vlaanderen toe te schrijven aan sport?',
        options: ['30%', '47%', '53%', '70%'],
        answerIndex: 1
      },
      {
        question: 'Welk percentage van de acute letsels bij Vlaamse jongeren (6-18 jaar) is ten gevolge van sport?',
        options: ['30%', '50%', '70%', '90%'],
        answerIndex: 2
      },
      {
        question: 'Bij sporten met veel trainingsuren (zoals zwemmen) treden blessures vaker op tijdens wedstrijden dan tijdens trainingen.',
        options: ['Juist', 'Fout'],
        answerIndex: 1
      },
      {
        question: 'Hoe ontstaan de meeste sportblessures (ongeveer 90%)?',
        options: ['Plots (acuut)', 'Geleidelijk (overbelasting)', 'Door ziekte', 'Door slecht materiaal'],
        answerIndex: 0
      },
      {
        question: 'Welk lichaamsdeel is het vaakst gekwetst bij sporters in het algemeen (alle leeftijden)?',
        options: ['Knie', 'Enkel', 'Schouder', 'Rug'],
        answerIndex: 1
      },
      {
        question: 'Wat is het meest voorkomende type letsel bij voetballers?',
        options: ['Breuken', 'Kneuzingen en verstuikingen', 'Hoofdletsels', 'Rugklachten'],
        answerIndex: 1
      },
      {
        question: 'Bij welke sport komen blessures aan de bovenste ledematen (schouder, elleboog) frequent voor?',
        options: ['Voetbal', 'Wielrennen', 'Fitness', 'Lopen'],
        answerIndex: 2
      },
      {
        question: 'De meeste sportblessures (ongeveer 75%) zijn contactblessures.',
        options: ['Juist', 'Fout'],
        answerIndex: 1
      },
      {
        question: 'Welk negatief gevolg kan een blessure hebben voor een schoolgaande sporter?',
        options: ['Betere punten op school', 'Afwezigheid op school', 'Meer tijd voor huiswerk', 'Verhoogde populariteit'],
        answerIndex: 1
      },
      {
        question: 'Wat is een specifiek veelvoorkomend letsel bij wielrenners (15% van de klachten)?',
        options: ['Hielspoor', 'Zadelpijn', 'Enkelverstuiking', 'Tenniselleboog'],
        answerIndex: 1
      },
      {
        question: 'Welk letseltype komt vaak voor bij lopers (32% van de letsels)?',
        options: ['Liesblessures', 'Knieblessures', 'Schouderluxaties', 'Polsbreuken'],
        answerIndex: 1
      },
      {
        question: 'Een blessure kan leiden tot een vermindering van de fysieke fitheid bij schoolkinderen tot wel 17-18%.',
        options: ['Juist', 'Fout'],
        answerIndex: 0
      },
      {
        question: 'Welk gevolg kan een blessure hebben voor de trainer?',
        options: ['Hinder bij het geven van training', 'Minder administratief werk', 'Meer tijd voor tactische analyse', 'Geen enkel gevolg'],
        answerIndex: 0
      },
      {
        question: 'Welk lichaamsdeel raakt bij basketbal het vaakst geblesseerd (15%)?',
        options: ['Pols', 'Rug', 'Enkel', 'Schouder'],
        answerIndex: 2
      },
      {
        question: "Wat is het doel van het project 'Get Fit 2 Sport'?",
        options: [
          'Topsporttalenten ontdekken',
          'Primaire preventie van sportletsels in en door de les L.O.',
          'Het verkopen van sportmateriaal',
          'Het promoten van fitnessabonnementen'
        ],
        answerIndex: 1
      },
      {
        question: 'Welk percentage van de blessures bij atletiek betreft de bovenbenen en heup?',
        options: ['10%', '20%', '31%', '50%'],
        answerIndex: 2
      },
      {
        question: 'Wat wordt bedoeld met "Levenslang sporten" als pijler?',
        options: [
          'Je moet elke dag sporten tot je sterft.',
          'Een duurzame sportbeoefening stimuleren.',
          'Enkel ouderen moeten aan blessurepreventie doen.',
          'Je mag nooit stoppen met competitie.'
        ],
        answerIndex: 1
      },
      {
        question: 'Ongeveer 1/3 van de blessures treedt op tijdens recreationele sportactiviteiten.',
        options: ['Juist', 'Fout'],
        answerIndex: 0
      }
    ]
  };

  const blessureLes2Set = {
    title: 'Les 2: Wat is Blessurepreventie & Preventie in Vlaanderen',
    questions: [
      {
        question: "Wat is de definitie van 'primaire preventie'?",
        options: [
          'Het behandelen van een blessure na het optreden ervan.',
          'Het voorkomen dat een blessure optreedt.',
          'Het voorkomen van herval na een eerdere blessure.',
          'Het leren leven met een blijvend letsel.'
        ],
        answerIndex: 1
      },
      {
        question: 'Welk model wordt gebruikt om het ontstaan van sportblessures schematisch weer te geven?',
        options: [
          'Het model van Maslow',
          'Het model van Meeuwisse (et al.)',
          'Het Cooper-model',
          'Het FIFA 11+ model'
        ],
        answerIndex: 1
      },
      {
        question: 'Wat is een voorbeeld van een intrinsieke risicofactor?',
        options: ['Slecht weer', 'Verkeerd schoeisel', 'Leeftijd of geslacht', 'Een slecht speelveld'],
        answerIndex: 2
      },
      {
        question:
          "Het 'Belasting-Belastbaarheidmodel' stelt dat blessures ontstaan wanneer de belasting lager is dan de belastbaarheid.",
        options: ['Juist', 'Fout'],
        answerIndex: 1
      },
      {
        question: 'Wat is het doel van de \"Functional Movement Screen\" (FMS)?',
        options: [
          'De maximale kracht meten.',
          'De uithouding testen.',
          'Zwakke schakels in stabiliteit, kracht en lenigheid opsporen.',
          'De snelheid meten.'
        ],
        answerIndex: 2
      },
      {
        question: 'Hoeveel basisbewegingen/testen omvat de FMS?',
        options: ['5', '7', '10', '12'],
        answerIndex: 1
      },
      {
        question: 'Bij secundaire preventie gaat het om het behandelen van omkeerbare blessures.',
        options: ['Juist', 'Fout'],
        answerIndex: 0
      },
      {
        question: 'Welke organisatie in Vlaanderen is verantwoordelijk voor het antidopingbeleid?',
        options: ['WADA', 'NADO Vlaanderen', 'Sport Vlaanderen', 'BOIC'],
        answerIndex: 1
      },
      {
        question: "Wat is een 'generieke' benadering van blessurepreventie?",
        options: [
          'Een programma op maat van één individu.',
          'Algemene blessurepreventie voor alle sporters.',
          'Een programma enkel voor geblesseerde spelers.',
          'Een programma gericht op ouderen.'
        ],
        answerIndex: 1
      },
      {
        question: 'Wat betekent \"Belastbaarheid\"?',
        options: [
          'Wat het lichaam niet gewend is.',
          'Wat het lichaam gewend is (intrinsieke factoren).',
          'De zwaarte van de training.',
          'De duur van de training.'
        ],
        answerIndex: 1
      },
      {
        question:
          'Welke sport had in 2020 het hoogste percentage dopingpraktijken bij controles buiten competitie in Vlaanderen?',
        options: ['Wielrennen (Road)', 'Fitness', 'Voetbal', 'Zwemmen'],
        answerIndex: 0
      },
      {
        question: 'Slaaptekort heeft geen invloed op het risico op sportblessures.',
        options: ['Juist', 'Fout'],
        answerIndex: 1
      },
      {
        question: 'Wat is een taak van de trainer in blessurepreventie?',
        options: [
          'De medische diagnose stellen.',
          'Consequent toepassen van preventie in trainingen.',
          'De sporter opereren.',
          'De sporter negeren.'
        ],
        answerIndex: 1
      },
      {
        question: 'Wat is \"Tertiaire preventie\"?',
        options: [
          'Het voorkomen van een eerste blessure.',
          'Omgaan met onomkeerbare blessures.',
          'Het trainen van topsporters.',
          'Het promoten van sport op school.'
        ],
        answerIndex: 1
      },
      {
        question: 'Welke factor hoort bij de \"omgevingsgebonden (extrinsieke) risicofactoren\"?',
        options: ['Lenigheid', 'Slecht weer', 'Eerdere blessures', 'Gewicht'],
        answerIndex: 1
      },
      {
        question: "Op de website 'sportkeuring.be' kun je nagaan of...",
        options: [
          '...je te zwaar bent.',
          '...een sportmedisch onderzoek voor jou nuttig of nodig is.',
          '...je doping hebt gebruikt.',
          '...je trainer gediplomeerd is.'
        ],
        answerIndex: 1
      },
      {
        question: 'Waarvoor staat de afkorting WADA?',
        options: [
          'World Anti-Doping Agency',
          'World Athletic Doping Association',
          'World Association against Doping in Athletics',
          'Worldwide Anti-Doping Authority'
        ],
        answerIndex: 0
      },
      {
        question: 'Bij de FMS-score staat een score van \"0\" voor:',
        options: [
          'Perfecte uitvoering.',
          'Uitvoering met compensatie.',
          'Er is pijn tijdens de uitvoering.',
          'Onvermogen om de beweging uit te voeren.'
        ],
        answerIndex: 2
      },
      {
        question: 'NADO Vlaanderen voert controles uit zowel binnen als buiten wedstrijdverband.',
        options: ['Juist', 'Fout'],
        answerIndex: 0
      },
      {
        question: 'Wat wordt bedoeld met \"Belasting\"?',
        options: [
          'De capaciteit van het lichaam.',
          'Wat het lichaam niet gewend is (extrinsieke factoren).',
          'De rustperiode na training.',
          'De voeding van de sporter.'
        ],
        answerIndex: 1
      }
    ]
  };

  const blessureLes3Set = {
    title: 'Les 3: Opwarming, Cooling-down & Stretching',
    questions: [
      {
        question: 'Wat is het belangrijkste fysiologische doel van een opwarming?',
        options: [
          'Spierverlenging',
          'Lichaamstemperatuur en hartslag geleidelijk laten stijgen.',
          'Melkzuur verwijderen',
          'Mentale rust'
        ],
        answerIndex: 1
      },
      {
        question: 'Hoe lang moet een goede opwarming idealiter duren?',
        options: ['2 minuten', '5 minuten', '10 à 20 minuten', '45 minuten'],
        answerIndex: 2
      },
      {
        question: 'Welk type stretching verdient de voorkeur tijdens de opwarming?',
        options: ['Statisch stretchen', 'Dynamisch stretchen (mobilisers)', 'Passief stretchen', 'Helemaal niet stretchen'],
        answerIndex: 1
      },
      {
        question: 'Waarom is statisch stretchen tijdens de cooling-down nuttig?',
        options: [
          'Het verhoogt de hartslag.',
          "Om spieren terug op 'startlengte' te brengen.",
          'Het is pijnlijk en bouwt karakter.',
          'Het zorgt voor een adrenalineboost.'
        ],
        answerIndex: 1
      },
      {
        question: 'Wat is het doel van de cooling-down?',
        options: [
          'De prestatie verbeteren.',
          'Ademhaling, hartslag en temperatuur terug naar beginniveau brengen.',
          'De spieren maximaal versterken.',
          'De lichaamstemperatuur verhogen.'
        ],
        answerIndex: 1
      },
      {
        question: "Een 'Leg Swing' (zwaaien met been) is een voorbeeld van:",
        options: ['Statische stretching', 'Dynamische stretching', 'Krachttraining', 'Balanstraining'],
        answerIndex: 1
      },
      {
        question: 'Een opgewarmde spier kan meer rek verdragen vooraleer hij scheurt dan een koude spier.',
        options: ['Juist', 'Fout'],
        answerIndex: 0
      },
      {
        question: 'Wat is een \"mobiliser\"?',
        options: [
          'Een statische rekoefening.',
          'Een dynamische oefening waarbij je gradueel grotere bewegingen maakt.',
          'Een krachtoefening met gewichten.',
          'Een balanstraining.'
        ],
        answerIndex: 1
      },
      {
        question: 'Mensen die hypermobiel zijn, moeten extra veel stretchen om blessures te voorkomen.',
        options: ['Juist', 'Fout'],
        answerIndex: 1
      },
      {
        question: 'Hoeveel tijd moet je minstens voorzien voor een effectieve cooling-down?',
        options: ['1 minuut', '5 à 20 minuten', '30 minuten', 'Uitsluitend als je tijd over hebt.'],
        answerIndex: 1
      },
      {
        question: 'Waarom mag je na een intensieve inspanning niet meteen gaan liggen?',
        options: [
          'Omdat je spieren verkrampen.',
          "Om duizeligheid te voorkomen doordat bloed in de benen blijft ('blood pooling').",
          'Omdat je dan te snel afkoelt.',
          'Omdat dit slecht is voor de spijsvertering.'
        ],
        answerIndex: 1
      },
      {
        question: 'Wat is het effect van regelmatige stretching op lange termijn?',
        options: [
          'Verminderde spierkracht.',
          'Verhoogde flexibiliteit en lager risico op blessures.',
          'Verhoogd risico op blessures.',
          'Geen effect.'
        ],
        answerIndex: 1
      },
      {
        question: 'Welke oefening rekt de Quadriceps (voorkant bovenbeen)?',
        options: ['Zittende beenrek', 'Butt Kicks (hak naar bil)', 'Toe Raises', 'Torso Twists'],
        answerIndex: 1
      },
      {
        question: 'Welke richtlijn geldt voor statische stretching na de sportactiviteit?',
        options: [
          'Verend uitvoeren.',
          'Tot ver voorbij de pijngrens gaan.',
          'De positie 20-30 seconden aanhouden (zonder veren).',
          'De ademhaling inhouden.'
        ],
        answerIndex: 2
      },
      {
        question: 'Een opwarming zorgt voor minder stijfheid na excentrische spieractiviteit.',
        options: ['Juist', 'Fout'],
        answerIndex: 0
      },
      {
        question: "Welke spiergroep rek je met 'Calf Raises' en wandelen op de tenen?",
        options: ['Hamstrings', 'Quadriceps', 'Kuiten (Gastrocnemius & Soleus)', 'Buikspieren'],
        answerIndex: 2
      },
      {
        question: 'Wat is een belangrijk aandachtspunt bij een goede stretchoefening?',
        options: [
          'De rug bol maken.',
          'De rug hol maken.',
          'De rug in een neutrale kromming behouden.',
          'Zo snel mogelijk bewegen.'
        ],
        answerIndex: 2
      },
      {
        question: 'Iemand met een zeer goede conditie moet ...',
        options: [
          'Korter opwarmen dan iemand met een slechte conditie.',
          'Langer opwarmen omdat de hartslag laag blijft en spieren minder snel warm worden.',
          'Niet opwarmen.',
          'Enkel statisch stretchen.'
        ],
        answerIndex: 1
      },
      {
        question: 'Wat gebeurt er met het waarnemingsvermogen van gewrichten (proprioceptie) na een opwarming?',
        options: ['Het vermindert.', 'Het blijft gelijk.', 'Er is een verhoogd bewustzijn van de gewrichtspositie.', 'Het verdwijnt volledig.'],
        answerIndex: 2
      },
      {
        question: 'Mag een opwarming licht zweten opwekken?',
        options: ['Nee, absoluut niet.', 'Ja, dit is een teken van goede intensiteit.', 'Enkel bij topsporters.', 'Enkel bij warm weer.'],
        answerIndex: 1
      }
    ]
  };

  const blessureLes5Set = {
    title: 'Les 5: Sprong, Kracht & Balans',
    questions: [
      {
        question: "Wat is een 'valgus' stand van de knieën?",
        options: ['Knieën wijzen naar buiten (O-benen).', 'Knieën wijzen naar binnen (X-benen).', 'Knieën zijn overstrekt.', 'Knieën zijn gebogen.'],
        answerIndex: 1
      },
      {
        question: 'Welk risico is verbonden aan een valgus-landing (X-benen) na een sprong?',
        options: ['Achillespeesletsel', 'Voorste kruisbandletsel', 'Liesbreuk', 'Hamstringscheur'],
        answerIndex: 1
      },
      {
        question: "Wat is de ideale kniehoek bij een zachte landing ('soft landing')?",
        options: ['30 graden', '60 graden', 'Ongeveer 100 graden (diepe buiging)', '180 graden (gestrekt)'],
        answerIndex: 2
      },
      {
        question: 'Bij een correcte landing mogen de knieën voorbij de tenen komen.',
        options: ['Juist', 'Fout'],
        answerIndex: 1
      },
      {
        question: "Wat wordt bedoeld met 'functionele krachttraining'?",
        options: ['Het trainen van geïsoleerde spieren op fitnesstoestellen.', 'Het trainen van bewegingsketens die lijken op de sportbeweging (groot-motorisch).', 'Het trainen met zo zwaar mogelijke gewichten.', 'Het trainen van enkel het bovenlichaam.'],
        answerIndex: 1
      },
      {
        question: 'Welk spieronevenwicht komt vaak voor bij sporters en vormt een risico?',
        options: ['Voorste keten (quadriceps) is sterker dan achterste keten (hamstrings/bil).', 'Hamstrings zijn sterker dan quadriceps.', 'Linkerarm is sterker dan rechterarm.', 'Buikspieren zijn sterker dan rugspieren.'],
        answerIndex: 0
      },
      {
        question: 'Welke spiergroep is cruciaal om te voorkomen dat de knie naar binnen knikt (valgus)?',
        options: ['De quadriceps', 'De bilspieren (Grote en zijdelingse).', 'De kuitspieren', 'De buikspieren'],
        answerIndex: 1
      },
      {
        question: 'Wat is het nut van balanstraining?',
        options: ['Het verhoogt de maximale sprintsnelheid.', 'Het vermindert het risico op enkelverstuikingen aanzienlijk.', 'Het vergroot de spiermassa.', 'Het verbetert de conditie.'],
        answerIndex: 1
      },
      {
        question: "Balanstraining is enkel effectief als je materiaal zoals een 'Balance board' gebruikt.",
        options: ['Juist', 'Fout'],
        answerIndex: 1
      },
      {
        question: "Wat is een 'externe focus' bij instructies voor een spronglanding?",
        options: ['Buig je knieën.', 'Span je quadriceps aan.', 'Ga net niet op een stoel zitten.', 'Houd je rug recht.'],
        answerIndex: 2
      },
      {
        question: 'Bij een correcte landing staan de voeten op ... breedte.',
        options: ['Schouder', 'Heup', 'Voet', 'Willekeurige'],
        answerIndex: 1
      },
      {
        question: 'Waarom zijn de hamstrings belangrijk ter preventie van voorste kruisbandletsels?',
        options: ['Ze duwen het onderbeen naar voren.', 'Ze trekken het onderbeen naar achteren en assisteren de kruisband.', 'Ze stabiliseren de enkel.', 'Ze hebben geen invloed op de kruisband.'],
        answerIndex: 1
      },
      {
        question: "Wat is een correcte uitvoering van een 'Lunge' (uitvalspas)?",
        options: ['De voorste knie wijst naar binnen.', 'De romp buigt ver naar voren.', 'De voorste knie blijft boven de enkel (niet voorbij tenen) en de rug blijft neutraal.', 'De hiel van de voorste voet komt van de grond.'],
        answerIndex: 2
      },
      {
        question: 'Welke spieren moeten extra getraind worden om enkelinstabiliteit tegen te gaan?',
        options: ['De kuitspieren (gastrocnemius).', 'De scheenbeenspieren en evertoren (peronei).', 'De quadriceps.', 'De hamstrings.'],
        answerIndex: 1
      },
      {
        question: 'Pijn achter de knieschijf kan ontstaan door een combinatie van diep doorbuigen en naar binnen knikken van de knie.',
        options: ['Juist', 'Fout'],
        answerIndex: 0
      },
      {
        question: 'Hoe bouw je balanstraining best op?',
        options: ['Meteen met ogen dicht op een wiebelplank.', 'Eerst statisch op stabiele ondergrond, dan dynamisch/met sprongen.', 'Altijd met gewichten in de handen.', 'Enkel tijdens de cooling-down.'],
        answerIndex: 1
      },
      {
        question: "Wat is het risico van 'stiff landings' (landen met gestrekte knieën)?",
        options: ['Minder impact op de gewrichten.', 'Verhoogde impact op rug, knieën en enkels.', 'Betere sprongkracht voor de volgende sprong.', 'Geen risico.'],
        answerIndex: 1
      },
      {
        question: "Wat is een 'Nordic Hamstring' oefening?",
        options: ['Een rekoefening voor de hamstrings.', 'Een excentrische krachtoefening voor de hamstrings.', 'Een massage techniek.', 'Een opwarmingsoefening.'],
        answerIndex: 1
      },
      {
        question: 'Bij een correcte squat of landing moeten de schouders zich ... de knieën bevinden.',
        options: ['Achter', 'Voor', 'Boven', 'Onder'],
        answerIndex: 2
      },
      {
        question: 'Welke spieren zijn belangrijk voor de stabiliteit van de schouder?',
        options: ['De borstspieren.', 'De rotatormanchetspieren.', 'De biceps.', 'De buikspieren.'],
        answerIndex: 1
      }
    ]
  };

  const blessureLes6Set = {
    title: 'Les 6: Rompstabiliteit, Materiaal & Multifactoriële aanpak',
    questions: [
      {
        question: 'Wat is het synoniem voor rompstabilisatietraining?',
        options: ['Cardio training', 'Core stability training', 'Plyometrie', 'Intervaltraining'],
        answerIndex: 1
      },
      {
        question: "Wat is 'Lumbale Bracing'?",
        options: [
          'Het dragen van een steungordel.',
          'Het passief hol trekken van de rug.',
          'Het actief aanspannen van zowel buik- als rugspieren om de wervelkolom te stabiliseren.',
          'Het inhouden van de adem.'
        ],
        answerIndex: 2
      },
      {
        question: 'De \"sit-up\" is de beste en veiligste oefening om rompstabiliteit te trainen.',
        options: ['Juist', 'Fout'],
        answerIndex: 1
      },
      {
        question: 'Welke spier is de dwarse buikspier die werkt als een natuurlijk korset?',
        options: ['Rectus Abdominis', 'Transversus Abdominis', 'Biceps', 'Hamstrings'],
        answerIndex: 1
      },
      {
        question: "Wat is de '10% regel' bij blessurepreventie (Luister naar je lichaam)?",
        options: [
          'Je mag maximaal 10% vetpercentage hebben.',
          'Verhoog de trainingsbelasting (duur/intensiteit) wekelijks met niet meer dan 10%.',
          'Je moet 10% van de trainingstijd rusten.',
          '10% van de sporters raakt geblesseerd.'
        ],
        answerIndex: 1
      },
      {
        question: 'Wat is het aanbevolen aantal uren slaap per nacht om het risico op blessures te verlagen bij adolescenten?',
        options: ['6 uur', '7 uur', 'Minstens 8 uur', '10 uur'],
        answerIndex: 2
      },
      {
        question: 'Versleten sportschoenen kunnen leiden tot minder stabiliteit en schokdemping.',
        options: ['Juist', 'Fout'],
        answerIndex: 0
      },
      {
        question: 'Welke functie heeft sportkledij bij warm weer?',
        options: ['Warmte vasthouden.', 'Zweet opnemen en verdampen (afkoeling).', 'Waterafstotend zijn.', 'De bloedsomloop afknellen.'],
        answerIndex: 1
      },
      {
        question: 'Wat is een belangrijke factor bij het voorkomen van hervalletsels?',
        options: [
          'Zo snel mogelijk weer wedstrijden spelen.',
          'De intensiteit gradueel opbouwen en revalidatie respecteren.',
          'Pijnstillers nemen.',
          'Tapen en meteen voluit gaan.'
        ],
        answerIndex: 1
      },
      {
        question: "Wat houdt een 'multifactoriële aanpak' in?",
        options: [
          'Focus op één aspect, bv. alleen schoeisel.',
          'Het combineren van verschillende preventiestrategieën (kracht, balans, core, materiaal, etc.).',
          'Het trainen van meerdere sporttakken.',
          'Het inschakelen van meerdere trainers.'
        ],
        answerIndex: 1
      },
      {
        question: 'Om de rug te beschermen tijdens oefeningen, moet je steeds de ... rugkromming behouden.',
        options: ['Holle', 'Bolle', 'Neutrale', 'Maximale'],
        answerIndex: 2
      },
      {
        question:
          'Hoeveel reeksen en herhalingen/duur worden vaak aangeraden voor basis rompstabilisatieoefeningen (bv. plank) bij 16-18 jarigen?',
        options: ['1x 10 seconden', '3x 30 seconden', '1x 5 minuten', '10x 1 minuut'],
        answerIndex: 1
      },
      {
        question: 'Wat is het nut van taping of bracing na een enkelblessure?',
        options: [
          'Het verhoogt de sprongkracht.',
          'Het biedt extra mechanische steun en proprioceptie om herval te voorkomen.',
          'Het geneest de breuk onmiddellijk.',
          'Het vervangt de opwarming.'
        ],
        answerIndex: 1
      },
      {
        question:
          'Pijn is een signaal van het lichaam dat genegeerd moet worden om sterker te worden ("No pain, no gain").',
        options: ['Juist', 'Fout'],
        answerIndex: 1
      },
      {
        question: 'Welke omgevingsfactor kan het risico op blessures beïnvloeden?',
        options: ['De kleur van de zaal.', 'De ondergrond (hard, glad, stroef).', 'Het merk van de bal.', 'Het tijdstip van de dag.'],
        answerIndex: 1
      },
      {
        question: 'Waarom is het belangrijk om schoeisel regelmatig (jaarlijks) te vervangen?',
        options: [
          'Omdat de mode verandert.',
          'Omdat de schokdemping en stabiliteit verminderen door slijtage.',
          'Omdat ze dan te klein worden.',
          'Omdat ze dan gaan stinken.'
        ],
        answerIndex: 1
      },
      {
        question: "Wat is een progressie (moeilijker maken) van de basis 'plank' oefening?",
        options: [
          'De knieën op de grond zetten.',
          'Op een onstabiel vlak steunen (bv. bal) of een ledemaat opheffen.',
          'De oefening korter aanhouden.',
          'De adem inhouden.'
        ],
        answerIndex: 1
      },
      {
        question: 'Bij lumbale bracing span je niet alleen de buikspieren aan, maar ook de ...',
        options: ['Kuitspieren', 'Rugspieren', 'Nekspieren', 'Armspieren'],
        answerIndex: 1
      },
      {
        question: 'Een atleet die net hersteld is van een blessure mag meteen weer volledige wedstrijden spelen.',
        options: ['Juist', 'Fout'],
        answerIndex: 1
      },
      {
        question: 'Welke website wordt in de cursus aangeraden voor oefeningen en kijkwijzers?',
        options: ['Youtube.com', 'Getfit2sport.be', 'Sporza.be', 'Wikipedia.org'],
        answerIndex: 1
      }
    ]
  };

  const blessurePreventie = normalizeSubject({
    name: 'Blessure preventie',
    summary: 'Quizzen rond blessurepreventie in onderwijs en sportcontext.',
    categories: [
      {
        id: 'les1',
        domain: 'blessurepreventie',
        section: 'les-1',
        title: 'Les 1',
        description: 'Les 1 – 20 vragen',
        quizSets: [blessureLes1Set]
      },
      {
        id: 'les2',
        domain: 'blessurepreventie',
        section: 'les-2',
        title: 'Les 2',
        description: 'Les 2 – 20 vragen',
        quizSets: [blessureLes2Set]
      },
      {
        id: 'les3',
        domain: 'blessurepreventie',
        section: 'les-3',
        title: 'Les 3',
        description: 'Les 3 – 20 vragen',
        quizSets: [blessureLes3Set]
      },
      {
        id: 'les5',
        domain: 'blessurepreventie',
        section: 'les-5',
        title: 'Les 5',
        description: 'Les 5 – 20 vragen',
        quizSets: [blessureLes5Set]
      },
      {
        id: 'les6',
        domain: 'blessurepreventie',
        section: 'les-6',
        title: 'Les 6',
        description: 'Les 6 – 20 vragen',
        quizSets: [blessureLes6Set]
      }
    ],
    examDomains: [
      {
        id: 'blessurepreventie',
        title: 'Blessurepreventie',
        description: 'Lesbundels met meerkeuzevragen.',
        sections: [
          { id: 'les-1', title: 'Les 1', categoryIds: ['les1'] },
          { id: 'les-2', title: 'Les 2', categoryIds: ['les2'] },
          { id: 'les-3', title: 'Les 3', categoryIds: ['les3'] },
          { id: 'les-5', title: 'Les 5', categoryIds: ['les5'] }
        ,  { id: 'les-6', title: 'Les 6', categoryIds: ['les6'] }
        ]
      }
    ]
  });

  const zdtLes1Set = {
    title: 'Les 1: Motivatie & Maslow',
    questions: [
      {
        question: 'Wat is de kern van de Zelfdeterminatietheorie (ZDT)?',
        options: [
          'Mensen worden enkel gemotiveerd door geld en beloningen.',
          'Motivatie stijgt wanneer drie basisbehoeften (Autonomie, Betrokkenheid, Competentie) vervuld zijn.',
          'Motivatie is een vaste persoonlijkheidstrek die niet kan veranderen.',
          'Straffen is de beste manier om leerlingen te motiveren.'
        ],
        answerIndex: 1
      },
      {
        question: 'Welke van de volgende is GEEN niveau in de behoeftepiramide van Maslow?',
        options: ['Fysiologische behoeften', 'Behoefte aan veiligheid', 'Behoefte aan rijkdom', 'Zelfontplooiing'],
        answerIndex: 2
      },
      {
        question:
          '(Juist/Fout) Volgens Maslow zijn sociale behoeften belangrijker en moeten ze eerst vervuld worden voordat fysiologische behoeften aan bod komen.',
        options: ['Juist', 'Fout'],
        answerIndex: 1
      },
      {
        question: "Wat wordt bedoeld met 'Autonome motivatie'?",
        options: [
          'Iets doen omdat je onder druk wordt gezet.',
          'Iets doen omdat je het zelf wilt of waardevol vindt.',
          'Iets doen zonder erbij na te denken.',
          'Iets doen om een straf te vermijden.'
        ],
        answerIndex: 1
      },
      {
        question: 'Iemand die studeert "omdat het moet van de ouders" vertoont welk type motivatie?',
        options: ['Intrinsieke motivatie', 'Geïdentificeerde motivatie', 'Externe motivatie', 'Amotivatie'],
        answerIndex: 2
      },
      {
        question: 'Wat is "Amotivatie"?',
        options: [
          'Motivatie door angst.',
          'Het gebrek aan motivatie of intentie om iets te doen.',
          'Motivatie om de beste te zijn.',
          'Een zeer sterke vorm van intrinsieke motivatie.'
        ],
        answerIndex: 1
      },
      {
        question: 'Vul aan: De drie basisbehoeften van de ZDT zijn Autonomie, Competentie en ...',
        options: ['Plezier', 'Verbondenheid (of Betrokkenheid)', 'Structuur', 'Beloning'],
        answerIndex: 1
      },
      {
        question: 'Welk voorbeeld hoort bij "fysiologische behoeften" volgens Maslow?',
        options: ['Vriendschap', 'Zelfvertrouwen', 'Voeding en slaap', 'Een veilig huis'],
        answerIndex: 2
      },
      {
        question: 'Wat is het verschil tussen intrinsieke en extrinsieke motivatie?',
        options: [
          'Intrinsiek komt van binnenuit (plezier), extrinsiek komt van buitenaf (beloning/straf).',
          'Intrinsiek is altijd slecht, extrinsiek is altijd goed.',
          'Intrinsiek duurt kort, extrinsiek duurt lang.',
          'Er is geen verschil.'
        ],
        answerIndex: 0
      },
      {
        question:
          '(Juist/Fout) Geïdentificeerde motivatie is een vorm van extrinsieke motivatie, maar ligt dicht bij intrinsieke motivatie.',
        options: ['Juist', 'Fout'],
        answerIndex: 0
      },
      {
        question: 'Wat houdt de "Causale attributietheorie" in?',
        options: [
          'Het verklaren van oorzaken voor slagen en falen (bv. intern vs extern).',
          'Het meten van intelligentie.',
          'Het indelen van leerlingen in niveaugroepen.',
          'Het bestraffen van slecht gedrag.'
        ],
        answerIndex: 0
      },
      {
        question:
          'Iemand die zegt: "Ik ben gebuisd omdat de leerkracht mij niet mag", maakt gebruik van welke attributie?',
        options: ['Intern', 'Extern', 'Stabiel', 'Controleerbaar'],
        answerIndex: 1
      },
      {
        question: 'Wat is de "fundamentele attributiefout"?',
        options: [
          'De neiging om gedrag te veel toe te schrijven aan persoonlijkheid en te weinig aan de situatie.',
          'De neiging om altijd jezelf de schuld te geven.',
          'Een rekenfout in de puntenverdeling.',
          'Het vergeten van een afspraak.'
        ],
        answerIndex: 0
      },
      {
        question: 'Welk niveau staat bovenaan in de piramide van Maslow?',
        options: ['Sociale behoeften', 'Eigenwaarde', 'Zelfontplooiing (Zelfrealisatie)', 'Veiligheid'],
        answerIndex: 2
      },
      {
        question: '(Juist/Fout) Controlerende beloningen verhogen de intrinsieke motivatie.',
        options: ['Juist', 'Fout'],
        answerIndex: 1
      },
      {
        question: 'Wat betekent "autonomie ondersteunen" in de les?',
        options: [
          'Leerlingen alles zelf laten doen zonder instructie.',
          'Keuzes bieden, inspraak geven en differentiëren.',
          'Strenge regels opleggen.',
          'Enkel de beste leerlingen helpen.'
        ],
        answerIndex: 1
      },
      {
        question: 'Hoe kan een leerkracht inspelen op de behoefte aan "competentie"?',
        options: [
          'Door leerlingen taken te geven die veel te moeilijk zijn.',
          'Door nooit feedback te geven.',
          'Door uitdagende maar haalbare taken en positieve feedback te geven.',
          'Door leerlingen met elkaar te vergelijken.'
        ],
        answerIndex: 2
      },
      {
        question: 'Welke uitspraak past bij "geïdentificeerde motivatie"?',
        options: [
          'Ik doe het omdat ik het leuk vind.',
          'Ik doe het omdat ik anders straf krijg.',
          'Ik doe het omdat ik het belangrijk vind voor mijn toekomst.',
          'Ik doe het niet.'
        ],
        answerIndex: 2
      },
      {
        question:
          '(Juist/Fout) Het ervaren van verbondenheid (bv. goede sfeer, relatie met leerkracht) is cruciaal voor motivatie.',
        options: ['Juist', 'Fout'],
        answerIndex: 0
      },
      {
        question: 'Wat is een kenmerk van "intrinsiek studeren"?',
        options: [
          'Leren om goede punten te halen.',
          'Leren om een diploma te krijgen.',
          'Leren omdat de leerstof zelf interessant is ("Leren om te leren").',
          'Leren om complimentjes van ouders te krijgen.'
        ],
        answerIndex: 2
      }
    ]
  };

  const zdtLes2Set = {
    title: 'Les 2: Lesgeefstijlen & Faalangst',
    questions: [
      {
        question:
          'Welke lesgeefstijl wordt gekenmerkt door het bieden van duidelijke structuur en heldere verwachtingen?',
        options: ['Participatief', 'Verduidelijkend', 'Afwachtend', 'Dominerend'],
        answerIndex: 1
      },
      {
        question: "Wat is een kenmerk van een 'afwachtende' lesgeefstijl?",
        options: [
          'Duidelijke regels.',
          'Veel structuur.',
          'Weinig structuur, waardoor leerlingen onzeker kunnen worden.',
          'Veel inspraak voor leerlingen.'
        ],
        answerIndex: 2
      },
      {
        question:
          "(Juist/Fout) Een 'dominerende' lesgeefstijl werkt motiverend omdat leerlingen precies weten wat ze moeten doen.",
        options: ['Juist', 'Fout'],
        answerIndex: 1
      },
      {
        question: "Welke lesgeefstijl ondersteunt de behoefte aan 'Autonomie'?",
        options: ['Participatief', 'Begeleidend', 'Verduidelijkend', 'Eisend'],
        answerIndex: 0
      },
      {
        question: "Wat houdt een 'afstemmende' lesgeefstijl in?",
        options: [
          'De leerkracht bepaalt alles.',
          'De leerkracht sluit aan bij de interesses en leefwereld van de leerlingen.',
          'De leerkracht geeft veel strafwerk.',
          'De leerkracht geeft geen les.'
        ],
        answerIndex: 1
      },
      {
        question:
          "(Juist/Fout) Een 'eisende' aanpak zorgt vaak voor passiviteit of rebellie bij leerlingen.",
        options: ['Juist', 'Fout'],
        answerIndex: 0
      },
      {
        question: 'Wat is faalangst?',
        options: [
          'Angst om te slagen.',
          'Angst die optreedt in prestatiesituaties waarbij men bang is om te mislukken.',
          'Angst voor spinnen.',
          'Angst voor de leerkracht.'
        ],
        answerIndex: 1
      },
      {
        question:
          'Welke vorm van faalangst heeft te maken met sociale interactie (bv. angst om uitgelachen te worden)?',
        options: ['Cognitieve faalangst', 'Motorische faalangst', 'Sociale faalangst', 'Fysiologische faalangst'],
        answerIndex: 2
      },
      {
        question: "Wat is een kenmerk van 'actieve' faalangst?",
        options: [
          'Uitstelgedrag en niets doen.',
          'Perfectionisme, overvoorbereiding en hard werken (maar blokkeren op het moment zelf).',
          'Ziek melden voor een toets.',
          'De les storen.'
        ],
        answerIndex: 1
      },
      {
        question:
          '(Juist/Fout) Passieve faalangst wordt vaak verward met luiheid of desinteresse.',
        options: ['Juist', 'Fout'],
        answerIndex: 0
      },
      {
        question: 'Welke tip kan helpen bij leerlingen met faalangst?',
        options: [
          'Zeggen dat ze niet moeten zeuren.',
          'Hen onverwacht voor het bord roepen.',
          'Een evenwicht zoeken tussen positieve en negatieve feedback, en focussen op het proces/inzet.',
          'Hen straffen bij fouten.'
        ],
        answerIndex: 2
      },
      {
        question: 'Wat is motorische faalangst?',
        options: [
          'Angst om te bewegen of een fysieke taak uit te voeren (bv. bij L.O.).',
          'Angst om te rekenen.',
          'Angst om te spreken in het openbaar.',
          'Angst om auto te rijden.'
        ],
        answerIndex: 0
      },
      {
        question:
          'Welke stelling over de begeleidende lesgeefstijl is correct?',
        options: [
          'Fouten worden afgestraft.',
          'Fouten worden gezien als leerkansen en de leerkracht biedt hulp op maat.',
          'De leerkracht laat de leerlingen aan hun lot over.',
          'De leerkracht lost alles op voor de leerling.'
        ],
        answerIndex: 1
      },
      {
        question:
          'Vul aan: Faalangst kan zich uiten in drie domeinen: cognitief, sociaal en ...',
        options: ['Emotioneel', 'Motorisch', 'Financieel', 'Spiritueel'],
        answerIndex: 1
      },
      {
        question:
          '(Juist/Fout) De lesgeefstijl van een docent is statisch en verandert nooit.',
        options: ['Juist', 'Fout'],
        answerIndex: 1
      },
      {
        question: 'Wat is een fysiek kenmerk van faalangst bij kinderen?',
        options: ['Veel lachen.', 'Zweethanden, buikpijn, hoofdpijn.', 'Ontspannen houding.', 'Diepe slaap.'],
        answerIndex: 1
      },
      {
        question:
          "Welke zone in het 'lesgevers-profiel' (de cirkel) staat voor een motiverende aanpak?",
        options: [
          'De linkerhelft (Chaos & Controle)',
          'De rechterhelft (Autonomie-ondersteuning & Structuur)',
          'De onderste helft',
          'De bovenste helft'
        ],
        answerIndex: 1
      },
      {
        question: "Wat is 'ontwijkingsgedrag' in de context van faalangst?",
        options: [
          'De confrontatie aangaan.',
          'Uitvluchten zoeken, ziekmelden of weigeren om deel te nemen aan de taak.',
          'Hulp vragen aan de leerkracht.',
          'Extra hard studeren.'
        ],
        answerIndex: 1
      },
      {
        question: '"Ik ben niet zo slim" is een voorbeeld van welke attributie?',
        options: [
          'Intern en stabiel (en oncontroleerbaar).',
          'Extern en instabiel.',
          'Intern en controleerbaar.',
          'Extern en stabiel.'
        ],
        answerIndex: 0
      },
      {
        question: '(Juist/Fout) Mislukken mag niet in een veilig leerklimaat.',
        options: ['Juist', 'Fout'],
        answerIndex: 1
      }
    ]
  };

  const zelfdeterminatie = normalizeSubject({
    name: 'Zelfdeterminatie theorie',
    summary: 'Quizzen rond motivatie, ZDT en Maslow.',
    categories: [
      { id: 'les1', domain: 'zelfdeterminatie', section: 'les-1', title: 'Les 1', description: 'Les 1 – 20 vragen', quizSets: [zdtLes1Set] },
      { id: 'les2', domain: 'zelfdeterminatie', section: 'les-2', title: 'Les 2', description: 'Les 2 – 20 vragen', quizSets: [zdtLes2Set] }
    ],
    examDomains: [
      {
        id: 'zelfdeterminatie',
        title: 'Zelfdeterminatie theorie',
        description: 'Motivatie, basisbehoeften en attributie.',
        sections: [
          { id: 'les-1', title: 'Les 1', categoryIds: ['les1'] },
          { id: 'les-2', title: 'Les 2', categoryIds: ['les2'] }
        ]
      }
    ]
  });

  const placeholder = (name) =>
    normalizeSubject({
      name,
      summary: 'Hier werken we nog aan. Deze bundel wordt later gevuld.',
      categories: [],
      examDomains: []
    });

  return [
    normalizeSubject(anatomie),
    basisonderwijs,
    blessurePreventie,
    placeholder('Individuele Fitness'),
    placeholder('Ondernemen in de sport'),
    zelfdeterminatie
  ];
}

const defaultSubjects = createDefaultSubjects();

let subjects = loadSubjects();
let progress = loadProgress();
let activeSubject = null;
let activeView = 'home';
let activePanel = 'quiz-panel';
let activeExamDomain = null;
let activeOsteologySection = null;
let activeQuizSetTitle = null;
let activeQuizQuestionIndex = 0;
let quizMode = 'picker';
let currentUser = null;
let profileExpanded = {};
let lastHash = '';

function dedupeQuizSets(list = []) {
  const seen = new Set();
  const result = [];

  list.forEach((set) => {
    const normalizedTitle = formatSetTitle(set?.title ?? '');
    const key = normalizedTitle.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    result.push(set);
  });

  return result;
}

function cleanSubject(subject) {
  const cleaned = { ...subject };

  if (Array.isArray(cleaned.categories)) {
    cleaned.categories = cleaned.categories.map((cat) => ({
      ...cat,
      quizSets: dedupeQuizSets(cat.quizSets)
    }));
  }

  cleaned.quizSets = dedupeQuizSets(getQuizSets(cleaned));

  return cleaned;
}

const mergeResult = mergeDefaultSubjects(subjects, defaultSubjects);
if (mergeResult.mutated) {
  subjects = mergeResult.subjects.map((s) => normalizeSubject(s));
  persistSubjects();
}

function migrateArthroGeneral(subjectsList) {
  let changed = false;
  const updated = subjectsList.map((subj) => {
    if (!subj || !Array.isArray(subj.categories)) return subj;
    const copy = { ...subj };
    copy.categories = copy.categories.map((cat) => {
      if (!cat) return cat;
      if (cat.id === 'arthrologie-core') {
        const c = { ...cat };
        if (c.title !== 'Algemeen Examen') {
          c.title = 'Algemeen Examen';
          changed = true;
        }
        if (Array.isArray(c.quizSets)) {
          c.quizSets = c.quizSets.map((set) => {
            if (!set || typeof set.title !== 'string') return set;
            if (set.title.trim().toLowerCase().startsWith('arthrologie')) {
              changed = true;
              return { ...set, title: 'Algemeen Examen – 20 vragen + oplossingen' };
            }
            return set;
          });
        }
        return c;
      }
      return cat;
    });

    if (Array.isArray(copy.examDomains)) {
      copy.examDomains = copy.examDomains.map((dom) => {
        if (dom.id !== 'arthrologie') return dom;
        const d = { ...dom };
        d.sections = (d.sections || []).map((sec) => {
          if (sec.id !== 'arthrologie') return sec;
          const s = { ...sec };
          if (s.title !== 'Algemeen Examen') {
            s.title = 'Algemeen Examen';
            changed = true;
          }
          return s;
        });
        return d;
      });
    }

    return copy;
  });

  return { subjects: updated, changed };
}

const mig = migrateArthroGeneral(subjects);
if (mig.changed) {
  subjects = mig.subjects.map((s) => normalizeSubject(s));
  persistSubjects();
}

function migrateCombineUpperSets(subjectsList) {
  let changed = false;
  const updated = subjectsList.map((subj) => {
    if (!subj || subj.name !== 'Anatomie' || !Array.isArray(subj.categories)) return subj;
    const copy = { ...subj };
    const idx = copy.categories.findIndex((c) => c.id === 'arthro-upper');
    if (idx === -1) return copy;
    const cat = { ...copy.categories[idx] };
    const sets = Array.isArray(cat.quizSets) ? cat.quizSets : [];
    const upperSets = sets.filter((s) => typeof s.title === 'string' && /bovenste\s+ledematen/i.test(s.title));
    if (upperSets.length >= 2) {
      const allQuestions = upperSets.flatMap((s) => Array.isArray(s.questions) ? s.questions : []);
      if (allQuestions.length >= 20) {
        const combined = { title: 'Bovenste Ledematen – 20 vragen', questions: allQuestions.slice(0, 20) };
        cat.quizSets = [combined];
        changed = true;
      }
    }
    // Ensure at least one combined set exists
    if ((!Array.isArray(cat.quizSets) || cat.quizSets.length === 0) && upperSets.length) {
      const allQuestions = upperSets.flatMap((s) => Array.isArray(s.questions) ? s.questions : []);
      if (allQuestions.length) {
        cat.quizSets = [{ title: 'Bovenste Ledematen – 20 vragen', questions: allQuestions.slice(0, 20) }];
        changed = true;
      }
    }
    copy.categories[idx] = cat;
    return copy;
  });
  return { subjects: updated, changed };
}

const migUpper = migrateCombineUpperSets(subjects);
if (migUpper.changed) {
  subjects = migUpper.subjects.map((s) => normalizeSubject(s));
  persistSubjects();
}

// Practice Session State
let practiceSession = {
  active: false,
  round: 1,
  currentItemIndex: 0,
  items: [],
  exerciseId: null
};

function migrateCombineLowerSets(subjectsList) {
  let changed = false;
  const updated = subjectsList.map((subj) => {
    if (!subj || subj.name !== 'Anatomie' || !Array.isArray(subj.categories)) return subj;
    const copy = { ...subj };
    const idx = copy.categories.findIndex((c) => c.id === 'arthro-lower');
    if (idx === -1) return copy;
    const cat = { ...copy.categories[idx] };
    const sets = Array.isArray(cat.quizSets) ? cat.quizSets : [];
    const lowerSets = sets.filter((s) => typeof s.title === 'string' && /onderste\s+ledematen/i.test(s.title));
    if (lowerSets.length >= 2) {
      const allQuestions = lowerSets.flatMap((s) => Array.isArray(s.questions) ? s.questions : []);
      if (allQuestions.length >= 20) {
        const combined = { title: 'Onderste Ledematen – 20 vragen', questions: allQuestions.slice(0, 20) };
        cat.quizSets = [combined];
        changed = true;
      }
    }
    if ((!Array.isArray(cat.quizSets) || cat.quizSets.length === 0) && lowerSets.length) {
      const allQuestions = lowerSets.flatMap((s) => Array.isArray(s.questions) ? s.questions : []);
      if (allQuestions.length) {
        cat.quizSets = [{ title: 'Onderste Ledematen – 20 vragen', questions: allQuestions.slice(0, 20) }];
        changed = true;
      }
    }
    copy.categories[idx] = cat;
    return copy;
  });
  return { subjects: updated, changed };
}

const migLower = migrateCombineLowerSets(subjects);
if (migLower.changed) {
  subjects = migLower.subjects.map((s) => normalizeSubject(s));
  persistSubjects();
}

const cleanedSubjects = subjects.map((s) => cleanSubject(normalizeSubject(s)));
const cleanedChanged = JSON.stringify(cleanedSubjects) !== JSON.stringify(subjects);
if (cleanedChanged || FORCE_CLEAN) {
  subjects = cleanedSubjects;
  persistSubjects();
}

function normalizeSubject(subject) {
  const categories = Array.isArray(subject.categories)
    ? subject.categories.map((cat) => ({
        ...cat,
        quizSets: dedupeQuizSets(Array.isArray(cat.quizSets) ? cat.quizSets : [])
      }))
    : [
        {
          id: 'hoofdstukken',
          title: 'Hoofdstukken',
          description: 'Vaste quizzen',
          quizSets: dedupeQuizSets(Array.isArray(subject.quizSets) ? subject.quizSets : [])
        }
      ];

  const normalized = { ...subject, categories };
  normalized.quizSets = dedupeQuizSets(categories.flatMap((cat) => cat.quizSets || []));

  if (Array.isArray(normalized.examDomains)) {
    normalized.examDomains = normalized.examDomains.map((domain) => ({
      ...domain,
      sections: getNormalizedSectionsForDomain(domain)
    }));
  }

  return normalized;
}

function getQuizSets(subject) {
  if (!subject) return [];
  if (Array.isArray(subject.categories)) {
    return subject.categories.flatMap((cat) => cat.quizSets || []);
  }
  return Array.isArray(subject.quizSets) ? subject.quizSets : [];
}

function getExamDomain(subject, domainId) {
  return subject?.examDomains?.find((d) => d.id === domainId) || null;
}

function getDomainSections(subject, domainId) {
  const domain = getExamDomain(subject, domainId);
  return getNormalizedSectionsForDomain(domain);
}

function getCategoriesByIds(subject, ids = []) {
  if (!subject?.categories?.length || !ids?.length) return [];
  return subject.categories.filter((cat) => ids.includes(cat.id));
}

function getDomainQuizSets(subject, domainId) {
  if (!subject) return [];
  const domain = getExamDomain(subject, domainId);
  if (!domain) return [];

  const sections = getNormalizedSectionsForDomain(domain);

  if (!sections.length) {
    const flat = subject.categories
      ?.filter((cat) => cat.domain === domain.id)
      .flatMap((cat) => cat.quizSets || []) || [];
    return dedupeQuizSets(flat);
  }

  const categoryIds = sections.flatMap((section) => section.categoryIds || []);
  const flat = getCategoriesByIds(subject, categoryIds).flatMap((cat) => cat.quizSets || []);
  return dedupeQuizSets(flat);
}

function getSectionQuizSets(subject, sectionId) {
  if (!subject || !sectionId) return [];
  const section = subject.examDomains
    ?.flatMap((domain) => getNormalizedSectionsForDomain(domain))
    .find((sec) => sec.id === sectionId);

  const categories = section?.categoryIds?.length
    ? getCategoriesByIds(subject, section.categoryIds)
    : subject.categories?.filter((cat) => cat.section === sectionId) || [];

  const flat = categories.flatMap((cat) => cat.quizSets || []);
  return dedupeQuizSets(flat);
}

function getAllQuizSets(subject) {
  if (!subject) return [];
  const flat = (subject.categories || []).flatMap((cat) => cat.quizSets || []);
  return dedupeQuizSets(flat);
}

function getVisibleSets(subject) {
  if (!subject) return [];
  const domain = getExamDomain(subject, activeExamDomain);
  if (!domain) return [];

  const normalizedSections = getNormalizedSectionsForDomain(domain);

  if (domain.id === 'osteologie' && activeOsteologySection) {
    const isValid = normalizedSections.some((s) => s.id === activeOsteologySection);
    if (!isValid) activeOsteologySection = null;
  }

  const sections = domain.id === 'osteologie'
    ? normalizedSections.filter((s) => s.id === activeOsteologySection)
    : normalizedSections;

  const categoryIds = sections?.length
    ? sections.flatMap((section) => section.categoryIds || [])
    : subject.categories
        ?.filter((cat) => cat.domain === domain.id)
        .map((cat) => cat.id) || [];

  const categories = getCategoriesByIds(subject, categoryIds);
  const flat = categories.flatMap((cat) => cat.quizSets || []);
  return dedupeQuizSets(flat);
}

function mergeDefaultSubjects(currentSubjects, defaults) {
  const list = Array.isArray(currentSubjects) ? currentSubjects : [];
  let mutated = false;

  defaults.forEach((defSubject) => {
    const existing = list.find((s) => s.name === defSubject.name);
    if (!existing) {
      list.push(deepClone(defSubject));
      mutated = true;
      return;
    }

    if (!Array.isArray(existing.examDomains)) {
      existing.examDomains = deepClone(defSubject.examDomains || []);
      mutated = true;
    } else if (Array.isArray(defSubject.examDomains)) {
      defSubject.examDomains.forEach((defDomain) => {
        const targetDomain = existing.examDomains.find((d) => d.id === defDomain.id);
        if (!targetDomain) {
          existing.examDomains.push(deepClone(defDomain));
          mutated = true;
          return;
        }

        let domainMutated = false;
        if (!Array.isArray(targetDomain.sections)) {
          targetDomain.sections = [];
          domainMutated = true;
        }

        defDomain.sections?.forEach((defSection) => {
          let targetSection = targetDomain.sections.find((sec) => sec.id === defSection.id);
          if (!targetSection) {
            targetDomain.sections.push(deepClone(defSection));
            domainMutated = true;
            return;
          }

          if (Array.isArray(defSection.categoryIds)) {
            const existingIds = Array.isArray(targetSection.categoryIds) ? targetSection.categoryIds : [];
            const mergedIds = Array.from(new Set([...existingIds, ...defSection.categoryIds]));
            const changed =
              mergedIds.length !== existingIds.length || mergedIds.some((id, idx) => id !== existingIds[idx]);
            if (changed) {
              targetSection.categoryIds = mergedIds;
              domainMutated = true;
            }
          }
        });

        if (targetDomain.id === 'osteologie') {
          const filtered = getNormalizedSectionsForDomain(targetDomain);
          if (filtered.length !== (targetDomain.sections?.length || 0)) {
            targetDomain.sections = filtered;
            domainMutated = true;
          }
        }

        if (!targetDomain.description && defDomain.description) {
          targetDomain.description = defDomain.description;
          domainMutated = true;
        }

        if (!targetDomain.title && defDomain.title) {
          targetDomain.title = defDomain.title;
          domainMutated = true;
        }

        mutated = mutated || domainMutated;
      });
    }

    if (!Array.isArray(existing.categories)) {
      existing.categories = [];
      mutated = true;
    }

    defSubject.categories?.forEach((defCat) => {
      let targetCat =
        existing.categories.find((c) => c.id === defCat.id) ||
        existing.categories.find((c) => c.title === defCat.title);

      if (!targetCat) {
        existing.categories.push(deepClone(defCat));
        mutated = true;
        return;
      }

      if (!Array.isArray(targetCat.quizSets)) {
        targetCat.quizSets = [];
        mutated = true;
      }

      defCat.quizSets?.forEach((defSet) => {
        let existingSet = targetCat.quizSets.find((set) => set.title === defSet.title);

        if (!existingSet) {
           const normDef = formatSetTitle(defSet.title).trim().toLowerCase();
           existingSet = targetCat.quizSets.find((set) => formatSetTitle(set.title).trim().toLowerCase() === normDef);
        }

        if (!existingSet) {
          targetCat.quizSets.push(deepClone(defSet));
          mutated = true;
        } else {
          if (defSet.description && existingSet.description !== defSet.description) {
            existingSet.description = defSet.description;
            mutated = true;
          }
          // Always ensure questions are up-to-date with code definition
          if (defSet.questions && JSON.stringify(existingSet.questions) !== JSON.stringify(defSet.questions)) {
            existingSet.questions = deepClone(defSet.questions);
            mutated = true;
          }
        }
      });
    });

    const defaultFlat = getQuizSets(defSubject);
    if (!Array.isArray(existing.quizSets)) {
      existing.quizSets = [];
      mutated = true;
    }
    defaultFlat.forEach((defSet) => {
      let existingSet = existing.quizSets.find((set) => set.title === defSet.title);
      if (!existingSet) {
         const normDef = formatSetTitle(defSet.title).trim().toLowerCase();
         existingSet = existing.quizSets.find((set) => formatSetTitle(set.title).trim().toLowerCase() === normDef);
      }

      if (!existingSet) {
        existing.quizSets.push(deepClone(defSet));
        mutated = true;
      } else {
        if (defSet.description && existingSet.description !== defSet.description) {
          existingSet.description = defSet.description;
          mutated = true;
        }
        // Always ensure questions are up-to-date with code definition
        if (defSet.questions && JSON.stringify(existingSet.questions) !== JSON.stringify(defSet.questions)) {
          existingSet.questions = deepClone(defSet.questions);
          mutated = true;
        }
      }
    });
  });

  return { subjects: list, mutated };
}

function loadSubjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((s) => normalizeSubject(s));
    }
    return defaultSubjects;
  } catch (error) {
    console.warn('Kon subjects niet laden, val terug op standaard.', error);
    return defaultSubjects;
  }
}

function persistSubjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
}

function getProgressKeyForUser(user) {
  if (!user || !user.uid) return null;
  return `${PROGRESS_NS}:${user.uid}`;
}

function getProgressKey() {
  const uid = currentUser?.uid || 'guest';
  return `${PROGRESS_NS}:${uid}`;
}

function loadProgress() {
  try {
    const key = getProgressKey();
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.warn('Kon voortgang niet laden.', error);
    return {};
  }
}

function persistProgress() {
  const key = getProgressKey();
  localStorage.setItem(key, JSON.stringify(progress));
}

function setActiveView(target) {
  activeView = target;
  views.forEach((view) => {
    const isMatch = view.dataset.view === target;
    view.classList.toggle('active', isMatch);
    view.classList.toggle('hidden', !isMatch);
  });

  viewToggles.forEach((toggle) => {
    const isPanelToggle = !!toggle.dataset.panelTarget;
    const isActive = !isPanelToggle && toggle.dataset.viewTarget === target;
    toggle.classList.toggle('is-active', isActive);
    toggle.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  updateHash();

  const inQuizMode = target === 'quizplay';
  document.body.classList.toggle('app--quizmode', inQuizMode);
  if (inQuizMode) {
    document.body.classList.add('app--quizmode-anim');
    document.body.classList.remove('app--returning');
    setTimeout(() => {
      if (document.body.classList.contains('app--quizmode')) {
        document.body.classList.add('app--quizmode-hidden');
        document.body.classList.remove('app--quizmode-anim');
      }
    }, 600);
  } else {
    document.body.classList.remove('app--quizmode-anim', 'app--quizmode-hidden');
  }
}

function setActivePanel(panelId) {
  activePanel = panelId;
  panels.forEach((panel) => {
    const match = panel.dataset.panel === panelId;
    panel.hidden = !match;
  });

  const localTabs = sectionTabs?.querySelectorAll('[data-panel-target]') ?? [];
  const allTabs = Array.from(document.querySelectorAll('[data-panel-target]'));
  const targets = [...new Set([...localTabs, ...allTabs])];
  targets.forEach((btn) => {
    const isPill = btn.classList.contains('pill');
    const matchesPanel = btn.dataset.panelTarget === panelId;
    const isActive = isPill ? (matchesPanel && btn.dataset.viewTarget === activeView) : matchesPanel;
    btn.classList.toggle(isPill ? 'is-active' : 'active', isActive);
    btn.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
  updateHash();
  const subject = getActiveSubject();
  if (panelId === 'flashcards-panel') {
    renderFlashcardsPanel(subject);
  } else if (panelId === 'flashcards-play-panel') {
    renderFlashcardsPlay(subject);
  }
}

function handleSubjectNavigation(subjectName, panelTarget = 'quiz-panel') {
  activeSubject = subjectName;
  quizMode = 'picker';
  activeExamDomain = null;
  activeOsteologySection = null;
  activeQuizSetTitle = null;
  activeQuizQuestionIndex = 0;
  render();
  setActiveView('anatomie');
  setActivePanel(panelTarget);
  closeSubjectMenu();
}

function updateHash() {
  const params = new URLSearchParams();
  if (activeSubject) params.set('subject', activeSubject);
  if (activePanel) params.set('panel', activePanel);
  if (activeExamDomain) params.set('domain', activeExamDomain);
  if (activeOsteologySection) params.set('section', activeOsteologySection);
  if (activeQuizSetTitle) params.set('set', encodeURIComponent(activeQuizSetTitle));
  const next = `#/${activeView}${params.toString() ? `?${params.toString()}` : ''}`;
  if (next !== lastHash) {
    lastHash = next;
    location.hash = next;
  }
}

function syncFromHash() {
  const raw = (location.hash || '').slice(1);
  if (!raw) return;
  const [path, query] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  const view = parts[0] || 'home';
  const params = new URLSearchParams(query || '');
  const subj = params.get('subject');
  const panel = params.get('panel');
  const domain = params.get('domain');
  const section = params.get('section');
  const setTitle = params.get('set');
  activeView = view;
  if (subj) activeSubject = subj;
  if (panel) activePanel = panel;
  activeExamDomain = domain || null;
  activeOsteologySection = section || null;
  activeQuizSetTitle = setTitle ? decodeURIComponent(setTitle) : null;
}

function openAccountPanel() {
  if (!accountPanel) return;
  accountPanel.hidden = false;
  requestAnimationFrame(() => accountPanel.classList.add('visible'));
  account?.classList.add('open');
  accountToggle?.setAttribute('aria-expanded', 'true');
  const loggedIn = !!currentUser;
  if (accountLogin) accountLogin.hidden = loggedIn;
  if (accountRegister) accountRegister.hidden = loggedIn;
  if (accountProfile) accountProfile.hidden = !loggedIn;
  if (accountLogout) accountLogout.hidden = !loggedIn;
}

function closeAccountPanel() {
  if (!accountPanel) return;
  accountPanel.classList.remove('visible');
  account?.classList.remove('open');
  accountToggle?.setAttribute('aria-expanded', 'false');
  setTimeout(() => {
    accountPanel.hidden = true;
  }, 160);
}

function toggleAccountPanel() {
  if (accountPanel?.hidden || !account?.classList.contains('open')) {
    openAccountPanel();
  } else {
    closeAccountPanel();
  }
}

function renderSubjectMenu() {
  if (!subjectMenuPanel) return;
  subjectMenuPanel.innerHTML = '';
  if (!subjects.length) {
    subjectMenuPanel.innerHTML = '<p class="caption">Geen vakken beschikbaar.</p>';
    return;
  }

  subjects.forEach((subject) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'subject-menu__item';
    item.textContent = subject.name;
    item.addEventListener('click', () => handleSubjectNavigation(subject.name, 'quiz-panel'));
    subjectMenuPanel.appendChild(item);
  });
}

function openSubjectMenu() {
  if (!subjectMenu) return;
  subjectMenu.classList.add('open');
  subjectMenuPanel.hidden = false;
  subjectMenuToggle?.setAttribute('aria-expanded', 'true');
}

function closeSubjectMenu() {
  if (!subjectMenu) return;
  subjectMenu.classList.remove('open');
  subjectMenuPanel.hidden = true;
  subjectMenuToggle?.setAttribute('aria-expanded', 'false');
}

function getActiveSubject() {
  return subjects.find((s) => s.name === activeSubject) ?? null;
}

function getActiveSet(subject = getActiveSubject()) {
  if (!subject || !activeQuizSetTitle) return null;
  return getQuizSets(subject).find((set) => set.title === activeQuizSetTitle) ?? null;
}

function getUserDisplayName(user) {
  if (!user) return 'Niet ingelogd';
  if (userPrefs && userPrefs.displayName && typeof userPrefs.displayName === 'string' && userPrefs.displayName.trim()) return userPrefs.displayName.trim();
  if (user.displayName) return user.displayName;
  if (user.email) return user.email.split('@')[0];
  return 'Gebruiker';
}

function ensureSetState(subjectName, setTitle) {
  const subjectProgress = progress[subjectName] || (progress[subjectName] = {});
  const state = subjectProgress[setTitle] || (subjectProgress[setTitle] = { answers: {} });
  if (!state.answers) state.answers = {};
  return state;
}

function computeSetCounts(set, state) {
  const answers = state.answers || {};
  const answered = set.questions.reduce((acc, _, idx) => acc + (pickAnswered(answers[idx]) ? 1 : 0), 0);
  const correct = set.questions.reduce((acc, question, idx) => acc + (computePickCorrect(question, answers[idx]) ? 1 : 0), 0);
  const total = set.questions.length;
  state.answered = answered;
  state.correct = correct;
  state.completed = answered === total;
  state.lastScore = { correct, total };
  state.updatedAt = Date.now();
  state.completedAt = state.completed ? state.completedAt || Date.now() : null;
  return state;
}

function getSetProgress(subjectName, setTitle, questions = []) {
  const subjectProgress = progress[subjectName] || {};
  const base = subjectProgress?.[setTitle] || { answers: {} };
  const state = { answers: base.answers || {} };
  const answered = questions.reduce((acc, _, idx) => acc + (pickAnswered(state.answers[idx]) ? 1 : 0), 0);
  const correct = questions.reduce((acc, question, idx) => acc + (computePickCorrect(question, state.answers[idx]) ? 1 : 0), 0);
  return {
    ...base,
    answers: state.answers,
    answered,
    correct,
    completed: questions.length ? answered === questions.length : false
  };
}

function resetSetProgress(subjectName, setTitle) {
  if (!progress[subjectName]) return;
  const prev = progress[subjectName][setTitle];
  if (prev) {
    progress[subjectName][setTitle] = { answers: {}, lastAttempt: {
      answers: deepClone(prev.answers || {}),
      answered: prev.answered || 0,
      correct: prev.correct || 0,
      total: prev.lastScore?.total || 0,
      updatedAt: Date.now()
    }};
  } else {
    progress[subjectName][setTitle] = { answers: {} };
  }
  persistProgress();
}

function findFirstUnanswered(set, state) {
  const unansweredIndex = set.questions.findIndex((_, idx) => !state.answers?.[idx]);
  return unansweredIndex === -1 ? 0 : unansweredIndex;
}

function updateProgressBanner(subject) {
  if (!subject) {
    progressBanner.textContent = '';
    return;
  }

  const visibleSets = getVisibleSets(subject);
  if (!visibleSets.length) {
    progressBanner.innerHTML = `
      <div class="progress-banner__top">
        <p class="eyebrow">Examens</p>
        <strong>Kies een discipline om voortgang te zien</strong>
      </div>
      <p class="caption">Selecteer eerst een examen en onderdeel.</p>
    `;
    return;
  }

  const totals = visibleSets.reduce(
    (acc, set) => {
      const state = getSetProgress(subject.name, set.title, set.questions);
      acc.answered += state.answered;
      acc.total += set.questions.length;
      return acc;
    },
    { answered: 0, total: 0 }
  );

  progressBanner.innerHTML = `
    <div class="progress-banner__top">
      <p class="eyebrow">Examens</p>
      <strong>${visibleSets.length} quizzen · ${totals.answered}/${totals.total} beantwoord</strong>
    </div>
    <p class="caption">Kies een set, maak de vragen en bekijk daarna je score.</p>
  `;
}

function buildProfileResults() {
  const list = [];
  subjects.forEach((subject) => {
    const sets = getQuizSets(subject);
    const subjectEntries = [];
    sets.forEach((set) => {
      const state = getSetProgress(subject.name, set.title, set.questions);
      const total = set.questions.length;
      const correct = state.correct || 0;
      const percent = total ? Math.round((correct / total) * 100) : 0;
      if (state.completed || state.answered > 0) {
        subjectEntries.push({
          title: formatSetTitle(set.title),
          correct,
          total,
          percent,
          completed: !!state.completed,
          hasArchive: !!progress[subject.name]?.[set.title]?.lastAttempt
        });
      }
    });
    if (subjectEntries.length) {
      list.push({ subject: subject.name, entries: subjectEntries });
    }
  });
  return list;
}

function renderPractice(subject) {
  if (!subject) {
    practiceDisplay.innerHTML = '<p class="caption">Kies eerst een vak via “Vakken”. Selecteer hierboven een vak en klik daarna op Oefenen.</p>';
    return;
  }

  // Data Structure for Practice Exercises
  const practiceContent = {
    "Anatomie": {
      categories: [
        {
          id: "arthrologie",
          title: "Arthrologie",
          exercises: [
            {
              id: "knie-oefenen",
              title: "Knie oefenen",
              type: "drag-drop",
              data: {
                title: "Knie Anatomie",
                image: "Oefenen/Knie.png",
                items: [
                  { id: 1, label: "Meniscus lateralis" },
                  { id: 2, label: "Ligamentum collaterale fibulare" },
                  { id: 3, label: "Ligamentum cruciatum anterius" },
                  { id: 4, label: "Ligamentum cruciatum posterius" },
                  { id: 5, label: "Meniscus medialis" },
                  { id: 6, label: "Ligamentum collaterale tibiale" },
                  { id: 7, label: "Femur (Os femoris)" },
                  { id: 8, label: "Musculus quadriceps femoris" }
                ]
              }
            },
            {
              id: "knie-ligamenten-sleep",
              title: "Knie Ligamenten",
              type: "drag-drop",
              data: {
                title: "Knie Ligamenten Anatomie",
                image: "Oefenen/KnieLigamenten.png",
                items: [
                  { id: "A", label: "Lig. cruciatum posterius" },
                  { id: "B", label: "Lig. collaterale mediale / tibiale" },
                  { id: "C", label: "Meniscus medialis" },
                  { id: "D", label: "Lig. transversum genus" },
                  { id: "E", label: "Insertio meniscus medialis" },
                  { id: "F", label: "Tibia" },
                  { id: "G", label: "Fibula" },
                  { id: "H", label: "Lig. cruciatum anterius" },
                  { id: "I", label: "Lig. collaterale laterale / fibulare" },
                  { id: "J", label: "Meniscus lateralis" },
                  { id: "K", label: "Femur" }
                ]
              }
            },
            {
              id: "soorten-gewrichten",
              title: "Soorten gewrichten",
              type: "container-sort",
              data: {
                title: "Soorten Gewrichten",
                instruction: "Sleep de kenmerken en voorbeelden naar het juiste gewrichtstype.",
                containers: [
                  { id: "c1", label: "Scharniergewricht (Ginglymus)" },
                  { id: "c2", label: "Rol- of Draaigewricht (Trochoidea)" },
                  { id: "c3", label: "Ei-gewricht (Ellipsoidea)" },
                  { id: "c4", label: "Zadelgewricht (Sellaris)" },
                  { id: "c5", label: "Kogelgewricht (Spheroidea)" }
                ],
                items: [
                  // Scharnier & Rol (Shared)
                  { id: "i1", label: "1-assig (Uniaciaal)", targets: ["c1", "c2"] },
                  
                  // Scharnier Only
                  { id: "i2", label: "Flexie / Extensie", targets: ["c1"] },
                  { id: "i3", label: "Humerus-ulna", targets: ["c1"] },
                  { id: "i4", label: "Vingers (Interphalangeaal)", targets: ["c1"] },
                  { id: "i5", label: "Knie (Functioneel)", targets: ["c1"] },

                  // Rol Only
                  { id: "i6", label: "Pronatie / Supinatie", targets: ["c2"] },
                  { id: "i7", label: "Radius-ulna", targets: ["c2"] },
                  { id: "i8", label: "Atlas-Axis (Dens)", targets: ["c2"] },

                  // Ei & Zadel (Shared)
                  { id: "i9", label: "2-assig (Biaxiaal)", targets: ["c3", "c4"] },

                  // Ei Only
                  { id: "i10", label: "Dorsiflexie / Palmaire flexie", targets: ["c3"] },
                  { id: "i11", label: "Pols (Art. Radiocarpalis)", targets: ["c3"] },

                  // Zadel Only
                  { id: "i12", label: "Voor- en achterwaarts + zijwaarts", targets: ["c4"] },
                  { id: "i13", label: "Duimbasis", targets: ["c4"] },

                  // Kogel Only
                  { id: "i14", label: "3-assig (Multiaxiaal)", targets: ["c5"] },
                  { id: "i15", label: "Alle vlakken + Circumductie", targets: ["c5"] },
                  { id: "i16", label: "Schouder (Art. Humeri)", targets: ["c5"] },
                  { id: "i17", label: "Heup (Art. Coxae)", targets: ["c5"] },
                  { id: "i18", label: "Humerus-radius", targets: ["c5"] },
                  { id: "i19", label: "Adductie / Abductie", targets: ["c5"] }
                ]
              }
            },
            {
              id: "skelet-gewrichten",
              title: "Gewrichten oefenen",
              type: "drag-drop",
              data: {
                title: "Gewrichten van het menselijk lichaam",
                image: "Oefenen/Skelet.png",
                items: [
                  { id: 1, label: "Articulatio trochoidea - Rol- of draaigewricht (Pivot joint)" },
                  { id: 2, label: "Articulatio sellaris - Zadelgewricht (Saddle joint)" },
                  { id: 3, label: "Articulatio plana - Vlak gewricht (Plane joint)" },
                  { id: 4, label: "Articulatio spheroidea - Kogelgewricht (Ball & socket joint)" },
                  { id: 5, label: "Articulatio ellipsoidea - Ei-gewricht (Condyloid joint)" },
                  { id: 6, label: "Ginglymus - Scharniergewricht (Hinge joint)" }
                ]
              }
            },
            {
              id: "ligamenten-wervelkolom",
              title: "Wervelkolom & Borstkas",
              type: "fill-in-blank",
              data: {
                title: "Wervelkolom & Borstkas",
                instruction: "Vul de juiste naam in bij elke omschrijving. Gebruik de hint als hulp.",
                items: [
                  { id: 1, term: "Ligamentum longitudinale anterius", hint: "Stabiliseert wervelkolom aan voorzijde" },
                  { id: 2, term: "Ligamentum longitudinale posterius", hint: "Stabiliseert wervelkolom aan achterzijde, binnen wervelkanaal" },
                  { id: 3, term: "Ligamentum flavum", hint: "Tussen wervelbogen, rijk aan elastine" },
                  { id: 4, term: "Ligamentum supraspinale", hint: "Verbindt toppen van spinaaluitsteeksels" },
                  { id: 5, term: "Ligamentum nuchae", hint: "Verbreed deel in de nek" },
                  { id: 6, term: "Ligamentum interspinale", hint: "Tussen spinaaluitsteeksels" },
                  { id: 7, term: "Discus intervertebralis", hint: "Schokdemping tussen wervellichamen" },
                  { id: 8, term: "Anulus fibrosus", hint: "Buitenste ring van tussenwervelschijf" },
                  { id: 9, term: "Nucleus pulposus", hint: "Gelei-achtige kern van tussenwervelschijf" }
                ]
              }
            },
            {
              id: "ligamenten-schouder",
              title: "Schouder & Elleboog",
              type: "fill-in-blank",
              data: {
                title: "Schouder & Elleboog",
                instruction: "Vul de juiste naam in bij elke omschrijving. Gebruik de hint als hulp.",
                items: [
                  { id: 1, term: "Ligamentum coraco-acromiale", hint: "Remt de abductie en anteversie van de schouder." },
                  { id: 2, term: "Ligamentum glenohumeralia", hint: "Drie banden (sup, med, inf) die de voorzijde van het kapsel stabiliseren." },
                  { id: 3, term: "Recessus axillaris", hint: "Hulp-plooi in de oksel voor grotere bewegingsvrijheid." },
                  { id: 4, term: "Vagina tendinis intertubercularis", hint: "De peesschede waar de lange bicepspees doorheen loopt." },
                  { id: 5, term: "Bursa synovialis", hint: "Zorgt voor vermindering van wrijving tussen structuren." },
                  { id: 6, term: "Ligamentum coracoclaviculare", hint: "Verbinding tussen ravenbekuitsteeksel en clavicula (bevat conoideum/trapezoideum)." },
                  { id: 7, term: "Ligamentum anulare radii", hint: "Lusvormige band die de draaiing van de radiuskop geleidt." },
                  { id: 8, term: "Ligamentum collaterale ulnare", hint: "Zorgt voor stabiliteit aan de binnenzijde van de elleboog." },
                  { id: 9, term: "Ligamentum collaterale radiale", hint: "Zorgt voor stabiliteit aan de buitenzijde van de elleboog." }
                ]
              }
            },
            {
              id: "ligamenten-heup",
              title: "Heup & Bekken",
              type: "fill-in-blank",
              data: {
                title: "Heup & Bekken",
                instruction: "Vul de juiste naam in bij elke omschrijving. Gebruik de hint als hulp.",
                items: [
                  { id: 1, term: "Ligamentum iliofemorale", hint: "Sterkste band, voorkomt overstrekking heup" },
                  { id: 2, term: "Ligamentum pubofemorale", hint: "Beperkt abductie heup" },
                  { id: 3, term: "Ligamentum ischiofemorale", hint: "Beperkt endorotatie, achterzijde heup" },
                  { id: 4, term: "Ligamentum capitis femoris", hint: "Loopt naar heupkop, bevat bloedvat" },
                  { id: 5, term: "Labrum acetabulare", hint: "Verdiept heupkom" },
                  { id: 6, term: "Ligamentum sacroiliacum ventrale", hint: "Voorzijde SI-gewricht" },
                  { id: 7, term: "Ligamentum sacroiliacum dorsale", hint: "Achterzijde SI-gewricht" },
                  { id: 8, term: "Ligamentum sacrospinale", hint: "Naar zitbeenstekel, vormt foramen" }
                ]
              }
            },
            {
              id: "ligamenten-knie",
              title: "Knie & Onderbeen",
              type: "fill-in-blank",
              data: {
                title: "Knie & Onderbeen",
                instruction: "Vul de juiste naam in bij elke omschrijving. Gebruik de hint als hulp.",
                items: [
                  { id: 1, term: "Ligamentum cruciatum anterius", hint: "Voorkomt naar voren schuiven tibia" },
                  { id: 2, term: "Ligamentum cruciatum posterius", hint: "Voorkomt naar achteren schuiven tibia" },
                  { id: 3, term: "Ligamentum collaterale tibiale", hint: "Mediale band, vergroeid met meniscus" },
                  { id: 4, term: "Ligamentum collaterale fibulare", hint: "Laterale band, los van meniscus" },
                  { id: 5, term: "Meniscus medialis", hint: "C-vormig kraakbeen, binnenkant knie" },
                  { id: 6, term: "Meniscus lateralis", hint: "O-vormig kraakbeen, buitenkant knie" },
                  { id: 7, term: "Ligamentum patellae", hint: "Voortzetting quadricepspees naar tibia" },
                  { id: 8, term: "Membrana interossea cruris", hint: "Verbindt tibia en fibula" }
                ]
              }
            },
            {
              id: "ligamenten-voet",
              title: "Voet",
              type: "fill-in-blank",
              data: {
                title: "Voet",
                instruction: "Vul de juiste naam in bij elke omschrijving. Gebruik de hint als hulp.",
                items: [
                  { id: 1, term: "Ligamentum talofibulare anterius", hint: "Vaakst gescheurd bij enkelverzwikking" },
                  { id: 2, term: "Ligamentum calcaneofibulare", hint: "Verbindt hielbeen en kuitbeen" },
                  { id: 3, term: "Ligamentum talofibulare posterius", hint: "Achterste buitenenkelband" },
                  { id: 4, term: "Ligamentum deltoideum", hint: "Sterke waaier aan binnenzijde enkel" },
                  { id: 5, term: "Ligamentum plantare longum", hint: "Belangrijk voor lengteboog voet" },
                  { id: 6, term: "Aponeurosis plantaris", hint: "Peesplaat voetzool" },
                  { id: 7, term: "Ligamentum calcaneonaviculare plantare", hint: "Spring ligament, steunt talus" },
                  { id: 8, term: "Retinaculum mm. extensorum", hint: "Houdt strekpezen op hun plek" },
                  { id: 9, term: "Retinaculum mm. flexorum", hint: "Houdt buigpezen op hun plek" },
                  { id: 10, term: "Retinaculum mm. peroneorum", hint: "Houdt peroneuspezen op hun plek" },
                  { id: 11, term: "Syndesmosis tibiofibularis", hint: "Verbinding scheen- en kuitbeen boven enkel" },
                  { id: 12, term: "Ligamentum bifurcatum", hint: "Y-vormig bandje op voetrug" }
                ]
              }
            }
          ]
        }
      ]
    }
  };

  const subjectPractice = practiceContent[subject.name];

  if (!subjectPractice) {
    practiceDisplay.innerHTML = `
      <div class="practice-content">
        <p class="lede">Oefenmodule voor ${subject.name}</p>
        <p class="caption">Nog geen oefeningen beschikbaar voor dit vak.</p>
      </div>
    `;
    return;
  }

  // Level 3: Exercise View (Drag & Drop or Container Sort)
  if (activePracticeExercise) {
    const category = subjectPractice.categories.find(c => c.id === activePracticeCategory);
    const exercise = category ? category.exercises.find(e => e.id === activePracticeExercise) : null;

    if (exercise) {
      if (exercise.type === 'container-sort') {
        const exerciseData = exercise.data;
        
        practiceDisplay.innerHTML = `
          <div class="practice-container">
            <div class="practice-header">
              <button class="btn ghost btn-back" id="btn-practice-back">
                ← Terug
              </button>
              <div>
                <h3>${exerciseData.title}</h3>
                <p>${exerciseData.instruction}</p>
              </div>
            </div>
            
            <div class="sort-grid">
              ${exerciseData.containers.map(c => `
                <div class="sort-container" data-container-id="${c.id}">
                  <div class="sort-container__header">${c.label}</div>
                </div>
              `).join('')}
            </div>

            <div class="draggable-pool">
              <div class="draggable-list" id="draggable-source">
                ${exerciseData.items
                  .sort(() => Math.random() - 0.5)
                  .map(item => `
                    <div class="draggable-item" draggable="true" data-id="${item.id}">
                      ${item.label}
                    </div>
                  `).join('')}
              </div>
            </div>

            <div class="practice-feedback" id="practice-feedback"></div>

            <div class="practice-actions">
              <button class="btn-reset" id="btn-reset-practice">Opnieuw</button>
              <button class="btn-check" id="btn-check-practice">Controleren</button>
            </div>
          </div>
        `;

        // Back Button
        document.getElementById('btn-practice-back').addEventListener('click', () => {
          activePracticeExercise = null;
          renderPractice(subject);
        });

        // Drag & Drop Logic
        const draggables = practiceDisplay.querySelectorAll('.draggable-item');
        const containers = practiceDisplay.querySelectorAll('.sort-container');
        const sourceContainer = practiceDisplay.querySelector('#draggable-source');
        let draggedItem = null;

        draggables.forEach(draggable => {
          draggable.addEventListener('dragstart', () => {
            draggedItem = draggable;
            draggable.classList.add('dragging');
          });
          draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
            draggedItem = null;
          });
        });

        function setupDropZone(zone, isSource = false) {
          zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!isSource) zone.classList.add('drag-over');
          });
          zone.addEventListener('dragleave', () => {
            if (!isSource) zone.classList.remove('drag-over');
          });
          zone.addEventListener('drop', (e) => {
            e.preventDefault();
            if (!isSource) zone.classList.remove('drag-over');
            if (draggedItem) {
              if (!isSource && !zone.classList.contains('draggable-list')) {
                // For sort containers, just append
                zone.appendChild(draggedItem);
              } else if (isSource) {
                 // Back to pool
                 zone.appendChild(draggedItem);
              }
            }
          });
        }

        containers.forEach(zone => setupDropZone(zone));
        setupDropZone(sourceContainer, true);

        // Check Logic
        document.getElementById('btn-check-practice').addEventListener('click', () => {
          let correctCount = 0;
          let totalPlaced = 0;
          const wrongItems = [];

          containers.forEach(container => {
            const containerId = container.dataset.containerId;
            const items = container.querySelectorAll('.draggable-item');
            
            container.classList.remove('correct', 'incorrect');
            
            items.forEach(item => {
              totalPlaced++;
              const itemId = item.dataset.id;
              const itemData = exerciseData.items.find(i => i.id === itemId);
              
              item.style.border = "2px solid transparent";
              
              if (itemData && itemData.targets.includes(containerId)) {
                item.style.borderColor = "var(--success)";
                correctCount++;
              } else {
                item.style.borderColor = "var(--error)";
                wrongItems.push({ item, itemData });
              }
            });
          });
          
          // Check for items still in pool
          const poolItems = sourceContainer.querySelectorAll('.draggable-item');
          poolItems.forEach(item => {
             const itemId = item.dataset.id;
             const itemData = exerciseData.items.find(i => i.id === itemId);
             wrongItems.push({ item, itemData });
          });

          const feedback = document.getElementById('practice-feedback');
          const totalItems = exerciseData.items.length;
          
          if (correctCount === totalItems && totalPlaced === totalItems) {
             feedback.textContent = "Perfect! Alle items staan in het juiste vak.";
             feedback.style.color = "var(--success)";
          } else {
             feedback.textContent = `Je hebt ${correctCount} van de ${totalItems} correct. Even geduld, we zetten alles op de juiste plaats...`;
             feedback.style.color = "var(--text)";
             
             // Disable interaction
             document.body.style.pointerEvents = 'none';
             
             // Animate wrong items to correct places
             wrongItems.forEach((obj, index) => {
               setTimeout(() => {
                 const { item, itemData } = obj;
                 // Find first valid target container
                 const targetId = itemData.targets[0];
                 const targetContainer = practiceDisplay.querySelector(`.sort-container[data-container-id="${targetId}"]`);
                 
                 if (targetContainer) {
                   // FLIP Animation
                   const firstRect = item.getBoundingClientRect();
                   targetContainer.appendChild(item);
                   const lastRect = item.getBoundingClientRect();
                   
                   const invertX = firstRect.left - lastRect.left;
                   const invertY = firstRect.top - lastRect.top;
                   
                   item.style.transform = `translate(${invertX}px, ${invertY}px)`;
                   item.style.transition = 'none';
                   item.style.borderColor = "var(--accent)"; // Highlight moving item
                   
                   requestAnimationFrame(() => {
                     // Force reflow
                     item.getBoundingClientRect();
                     
                     item.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                     item.style.transform = 'translate(0, 0)';
                     
                     setTimeout(() => {
                       item.style.transition = '';
                       item.style.transform = '';
                       item.style.borderColor = "var(--success)";
                       
                       // Check if this was the last one
                       if (index === wrongItems.length - 1) {
                         document.body.style.pointerEvents = '';
                         feedback.textContent = "Alles staat nu op de juiste plaats!";
                         feedback.style.color = "var(--success)";
                       }
                     }, 500);
                   });
                 }
               }, index * 600); // 600ms delay between each
             });
          }
        });

        document.getElementById('btn-reset-practice').addEventListener('click', () => {
          renderPractice(subject);
        });
        
        return;
      }

      if (exercise.type === 'drag-drop') {
      const exerciseData = exercise.data;
      
      practiceDisplay.innerHTML = `
        <div class="practice-container">
          <div class="practice-header">
            <button class="btn ghost btn-back" id="btn-practice-back">
              ← Terug
            </button>
            <div style="flex-grow: 1; margin-left: 16px;">
              <h3>${exerciseData.title}</h3>
              <p>Sleep de namen naar de juiste nummers.</p>
            </div>
            <button class="btn-focus-toggle" id="btn-toggle-focus">⛶ Oefenmodus</button>
          </div>
          
          <div class="draggable-pool">
            <div class="draggable-list" id="draggable-source">
              ${exerciseData.items
                .slice()
                .sort(() => Math.random() - 0.5)
                .map(item => `
                  <div class="draggable-item" draggable="true" data-id="${item.id}">
                    ${item.label}
                  </div>
                `).join('')}
            </div>
          </div>

          <div class="practice-layout">
            <div class="practice-visual">
              <div class="practice-image-container">
                <img src="${exerciseData.image}" alt="Anatomie Oefening" class="practice-image">
              </div>
            </div>
            
            <div class="practice-interaction">
              <div class="practice-zones-list">
                ${exerciseData.items.map(item => `
                  <div class="drop-zone-row">
                    <div class="zone-number">${item.id}</div>
                    <div class="drop-zone" data-correct-id="${item.id}"></div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="practice-feedback" id="practice-feedback"></div>

          <div class="practice-actions">
            <button class="btn-reset" id="btn-reset-practice">Opnieuw</button>
            <button class="btn-check" id="btn-check-practice">Controleren</button>
          </div>
        </div>
      `;

      // Back Button Logic
      document.getElementById('btn-practice-back').addEventListener('click', () => {
        activePracticeExercise = null;
        document.body.classList.remove('app--focus-mode');
        renderPractice(subject);
      });

      // Focus Mode Toggle
      const toggleBtn = document.getElementById('btn-toggle-focus');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          document.body.classList.toggle('app--focus-mode');
          const isFocus = document.body.classList.contains('app--focus-mode');
          toggleBtn.innerHTML = isFocus ? '⛶ Sluit Focus' : '⛶ Oefenmodus';
          if (isFocus) {
            window.scrollTo(0, 0);
          }
        });
      }

      // (Drag and Drop Logic remains the same, just wrapped)
      const draggables = practiceDisplay.querySelectorAll('.draggable-item');
      const dropZones = practiceDisplay.querySelectorAll('.drop-zone');
      const sourceContainer = practiceDisplay.querySelector('#draggable-source');
      let draggedItem = null;

      draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
          draggedItem = draggable;
          draggable.classList.add('dragging');
        });
        draggable.addEventListener('dragend', () => {
          draggable.classList.remove('dragging');
          draggedItem = null;
        });
      });

      function setupDropZone(zone, isSource = false) {
        zone.addEventListener('dragover', (e) => {
          e.preventDefault();
          if (!isSource) zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', () => {
          if (!isSource) zone.classList.remove('drag-over');
        });
        zone.addEventListener('drop', (e) => {
          e.preventDefault();
          if (!isSource) zone.classList.remove('drag-over');
          if (draggedItem) {
            if (!isSource && zone.children.length > 0) {
              const existingItem = zone.children[0];
              sourceContainer.appendChild(existingItem);
            }
            zone.appendChild(draggedItem);
          }
        });
      }

      dropZones.forEach(zone => setupDropZone(zone));
      setupDropZone(sourceContainer, true);

      let hasChecked = false;
      document.getElementById('btn-check-practice').addEventListener('click', () => {
        let correctCount = 0;
        const wrongItems = [];
        const allItems = Array.from(practiceDisplay.querySelectorAll('.draggable-item'));

        // Identify correct count and wrong items
        allItems.forEach(item => {
           const currentZone = item.closest('.drop-zone');
           const correctId = item.dataset.id;
           const targetZone = practiceDisplay.querySelector(`.drop-zone[data-correct-id="${correctId}"]`);
           
           if (currentZone && currentZone === targetZone) {
             correctCount++;
             if (currentZone) currentZone.classList.add('correct');
           } else {
             if (currentZone) currentZone.classList.add('incorrect');
             wrongItems.push(item);
           }
        });

        const feedback = document.getElementById('practice-feedback');
        if (correctCount === exerciseData.items.length) {
          feedback.textContent = "Geweldig! Alles is correct.";
          feedback.style.color = "var(--success)";
        } else {
          if (!hasChecked) {
             feedback.textContent = `Je hebt ${correctCount} van de ${exerciseData.items.length} goed. Foutieve antwoorden zijn rood gemarkeerd. Klik nogmaals om de oplossing te zien.`;
             feedback.style.color = "var(--text)";
             hasChecked = true;
             return;
          }

          feedback.textContent = `Oplossing wordt getoond...`;
          feedback.style.color = "var(--text)";
          
          // Disable interaction
          document.body.style.pointerEvents = 'none';

          wrongItems.forEach((item, index) => {
            setTimeout(() => {
               const correctId = item.dataset.id;
               const targetZone = practiceDisplay.querySelector(`.drop-zone[data-correct-id="${correctId}"]`);
               
               if (targetZone) {
                 // Clear target zone if occupied by a wrong item?
                 // Wait, if we move item A to zone A, and zone A has item B.
                 // Item B is also in "wrongItems" list, so it will move later.
                 // For now, just append. If CSS allows stacking, good.
                 // If not, maybe we should move the occupant back to source?
                 if (targetZone.children.length > 0) {
                    const occupant = targetZone.children[0];
                    if (occupant !== item) {
                       sourceContainer.appendChild(occupant); // Move occupant back to pool temporarily
                    }
                 }

                 // FLIP Animation
                 const firstRect = item.getBoundingClientRect();
                 targetZone.appendChild(item);
                 const lastRect = item.getBoundingClientRect();
                 
                 const invertX = firstRect.left - lastRect.left;
                 const invertY = firstRect.top - lastRect.top;
                 
                 item.style.transform = `translate(${invertX}px, ${invertY}px)`;
                 item.style.transition = 'none';
                 targetZone.classList.remove('incorrect');
                 targetZone.classList.add('corrected');
                 
                 requestAnimationFrame(() => {
                   item.getBoundingClientRect(); // Force reflow
                   
                   item.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                   item.style.transform = 'translate(0, 0)';
                   
                   setTimeout(() => {
                     item.style.transition = '';
                     item.style.transform = '';
                     
                     if (index === wrongItems.length - 1) {
                        document.body.style.pointerEvents = '';
                        feedback.textContent = "Alles staat nu op de juiste plaats!";
                        feedback.style.color = "var(--success)";
                     }
                   }, 500);
                 });
               }
            }, index * 600);
          });
        }
      });

      document.getElementById('btn-reset-practice').addEventListener('click', () => {
        renderPractice(subject);
      });
      return;
    }

    if (exercise.type === 'fill-in-blank') {
      const exerciseData = exercise.data;

      // Initialize session if needed
      if (!practiceSession.active || practiceSession.exerciseId !== exercise.id) {
        practiceSession = {
          active: true,
          round: 1,
          currentItemIndex: 0,
          items: [...exerciseData.items], // Copy items
          exerciseId: exercise.id,
          completed: false
        };
      }

      // Web Audio API Helper
      const playSound = (type) => {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        
        if (type === 'correct') {
          // Nice "Ding"
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
          
          // Slight overtone for richness
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1760, ctx.currentTime); // A6
          gain2.gain.setValueAtTime(0.05, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          
          osc2.start();
          osc2.stop(ctx.currentTime + 0.3);
          
        } else if (type === 'incorrect') {
          // Soft "Thud" / "Bonk" (less irritating)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'triangle'; // Softer than sawtooth, but audible
          osc.frequency.setValueAtTime(150, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
          
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
          
        } else if (type === 'complete') {
            // Confetti sound / Fanfare
            const now = ctx.currentTime;
            [440, 554, 659, 880].forEach((freq, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.connect(g);
                g.connect(ctx.destination);
                o.type = 'triangle';
                o.frequency.value = freq;
                g.gain.setValueAtTime(0, now + i*0.1);
                g.gain.linearRampToValueAtTime(0.2, now + i*0.1 + 0.05);
                g.gain.exponentialRampToValueAtTime(0.01, now + i*0.1 + 0.4);
                o.start(now + i*0.1);
                o.stop(now + i*0.1 + 0.4);
            });
        }
      };

      if (practiceSession.completed) {
        playSound('complete');
        practiceDisplay.innerHTML = `
          <div class="practice-container">
            <div class="practice-header">
              <button class="btn ghost btn-back" id="btn-practice-back">
                ← Terug
              </button>
              <div>
                <h3>${exerciseData.title}</h3>
                <p>Oefening voltooid</p>
              </div>
            </div>
            
            <div class="practice-result">
              <div class="result-icon">🎉</div>
              <h3>Gefeliciteerd!</h3>
              <p>Je hebt alle drie de rondes succesvol afgerond.</p>
              <button class="btn-primary" id="btn-restart-practice">Opnieuw Oefenen</button>
            </div>
          </div>
        `;
        
        document.getElementById('btn-practice-back').addEventListener('click', () => {
          activePracticeExercise = null;
          practiceSession.active = false;
          renderPractice(subject);
        });

        document.getElementById('btn-restart-practice').addEventListener('click', () => {
          practiceSession.active = false; // Reset will trigger init
          renderPractice(subject);
        });
        return;
      }

      const currentItem = practiceSession.items[practiceSession.currentItemIndex];
      const roundTitle = 
        practiceSession.round === 1 ? "Ronde 1: Leren" : 
        practiceSession.round === 2 ? "Ronde 2: Oefenen" : 
        "Ronde 3: Meesterschap";
      
      const roundInstruction = 
        practiceSession.round === 1 ? "Bekijk de hint en de naam." : 
        practiceSession.round === 2 ? "Vul de naam aan (eerste deel is gegeven)." : 
        "Vul de volledige naam in.";

      let contentHtml = '';
      const firstWord = currentItem.term.split(' ')[0] + ' ';

      if (practiceSession.round === 1) {
        contentHtml = `
          <div class="fill-blank-card">
            <div class="fill-blank-hint-large">
              <span class="hint-icon">💡</span>
              <span>${currentItem.hint}</span>
            </div>
            <div class="fill-blank-answer-reveal">
              ${currentItem.term}
            </div>
            <button class="btn-check-large" id="btn-next-item">Volgende</button>
          </div>
        `;
      } else if (practiceSession.round === 2) {
        contentHtml = `
          <div class="fill-blank-card">
            <div class="fill-blank-hint-large">
              <span class="hint-icon">💡</span>
              <span>${currentItem.hint}</span>
            </div>
            <div class="fill-blank-input-wrapper large">
              <input type="text" class="fill-blank-input" id="practice-input" value="${firstWord}" autocomplete="off">
              <div class="fill-blank-feedback" id="practice-feedback"></div>
            </div>
            <button class="btn-check-large" id="btn-check-item">Controleren</button>
          </div>
        `;
      } else {
        contentHtml = `
          <div class="fill-blank-card">
            <div class="fill-blank-hint-large">
              <span class="hint-icon">💡</span>
              <span>${currentItem.hint}</span>
            </div>
            <div class="fill-blank-input-wrapper large">
              <input type="text" class="fill-blank-input" id="practice-input" placeholder="Typ de volledige naam..." autocomplete="off">
              <div class="fill-blank-feedback" id="practice-feedback"></div>
            </div>
            <button class="btn-check-large" id="btn-check-item">Controleren</button>
          </div>
        `;
      }

      practiceDisplay.innerHTML = `
        <div class="practice-container">
          <div class="practice-header">
            <button class="btn ghost btn-back" id="btn-practice-back">
              ← Stop
            </button>
            <div>
              <h3>${exerciseData.title}</h3>
              <p>${roundTitle} (${practiceSession.currentItemIndex + 1}/${practiceSession.items.length})</p>
            </div>
          </div>
          <p class="practice-instruction">${roundInstruction}</p>
          
          ${contentHtml}
        </div>
      `;

      // Back Button
      document.getElementById('btn-practice-back').addEventListener('click', () => {
        activePracticeExercise = null;
        practiceSession.active = false;
        renderPractice(subject);
      });

      // Actions
      if (practiceSession.round === 1) {
        document.getElementById('btn-next-item').addEventListener('click', () => {
          nextItem();
        });
      } else {
        const input = document.getElementById('practice-input');
        const checkBtn = document.getElementById('btn-check-item');
        const feedback = document.getElementById('practice-feedback');

        // Focus input
        requestAnimationFrame(() => {
           input.focus();
           // Move cursor to end if value exists
           const val = input.value;
           input.value = '';
           input.value = val;
        });

        const checkAnswer = () => {
          if (checkBtn.textContent === 'Volgende') {
            nextItem();
            return;
          }

          const userVal = input.value.trim().toLowerCase();
          const correctVal = currentItem.term.toLowerCase();

          if (userVal === correctVal) {
            playSound('correct');
            input.classList.add('correct');
            feedback.textContent = 'Correct!';
            feedback.style.color = 'var(--success)';
            checkBtn.textContent = 'Volgende';
            checkBtn.focus();
          } else {
            playSound('incorrect');
            input.classList.add('incorrect');
            feedback.textContent = `Niet correct. Het was: ${currentItem.term}`;
            feedback.style.color = 'var(--error)';
            checkBtn.textContent = 'Volgende';
            
            // Push incorrect item to end of list for retry
            practiceSession.items.push(currentItem);
          }
        };

        checkBtn.addEventListener('click', checkAnswer);
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') checkAnswer();
        });
      }

      function nextItem() {
        practiceSession.currentItemIndex++;
        if (practiceSession.currentItemIndex >= practiceSession.items.length) {
          practiceSession.currentItemIndex = 0;
          practiceSession.round++;
          if (practiceSession.round > 3) {
            practiceSession.completed = true;
          }
        }
        renderPractice(subject);
      }
      
      return;
    }
  }
  }

  // Level 2: Exercise List (Category Selected)
  if (activePracticeCategory) {
    const category = subjectPractice.categories.find(c => c.id === activePracticeCategory);
    
    if (category) {
      const fillIn = category.exercises.filter(e => e.type === 'fill-in-blank');
      const dragDrop = category.exercises.filter(e => e.type === 'drag-drop');
      const sort = category.exercises.filter(e => e.type === 'container-sort');
      const other = category.exercises.filter(e => !['fill-in-blank', 'drag-drop', 'container-sort'].includes(e.type));

      const renderCard = (ex, icon, label) => `
        <div class="quiz-picker__card" data-exercise-id="${ex.id}">
          <div class="quiz-picker__icon-box ${ex.type}">
            ${icon}
          </div>
          <div class="quiz-picker__content">
            <h4 class="quiz-picker__title">${ex.title}</h4>
            <span class="quiz-picker__meta">${label}</span>
          </div>
          <div class="quiz-picker__arrow">→</div>
        </div>
      `;

      let listHtml = '';

      if (fillIn.length > 0) {
        listHtml += `
          <h4 class="quiz-section-title">Invuloefeningen</h4>
          <div class="quiz-category__list">
            ${fillIn.map(ex => renderCard(ex, '✍️', 'Invuloefening')).join('')}
          </div>
        `;
      }

      if (dragDrop.length > 0) {
        listHtml += `
          <h4 class="quiz-section-title">Sleepoefeningen</h4>
          <div class="quiz-category__list">
            ${dragDrop.map(ex => renderCard(ex, '👆', 'Sleepoefening')).join('')}
          </div>
        `;
      }

      if (sort.length > 0) {
        listHtml += `
          <h4 class="quiz-section-title">Sorteeroefeningen</h4>
          <div class="quiz-category__list">
            ${sort.map(ex => renderCard(ex, '🔄', 'Sorteeroefening')).join('')}
          </div>
        `;
      }

      if (other.length > 0) {
        listHtml += `
          <h4 class="quiz-section-title">Overige</h4>
          <div class="quiz-category__list">
            ${other.map(ex => renderCard(ex, '📝', 'Oefening')).join('')}
          </div>
        `;
      }

      practiceDisplay.innerHTML = `
        <div class="quiz-category">
          <div class="quiz-category__header" style="display: flex; align-items: center; gap: 16px;">
            <button class="btn ghost btn-back" id="btn-category-back">←</button>
            <h3 style="margin:0;">${category.title}</h3>
          </div>
          <div class="quiz-category__container">
            ${listHtml}
          </div>
        </div>
      `;

      document.getElementById('btn-category-back').addEventListener('click', () => {
        activePracticeCategory = null;
        renderPractice(subject);
      });

      practiceDisplay.querySelectorAll('.quiz-picker__card').forEach(card => {
        card.addEventListener('click', () => {
          activePracticeExercise = card.dataset.exerciseId;
          renderPractice(subject);
        });
      });
      return;
    }
  }

  // Level 1: Category List (No Category Selected)
  practiceDisplay.innerHTML = `
    <div class="quiz-category">
      <div class="quiz-category__header">
        <h3 style="margin:0;">Onderwerpen</h3>
      </div>
      <div class="quiz-category__list">
        ${subjectPractice.categories.map(cat => `
          <div class="quiz-picker__card" data-category-id="${cat.id}">
            <div class="quiz-picker__content">
              <h4 class="quiz-picker__title">${cat.title}</h4>
              <span class="quiz-picker__meta">${cat.exercises.length} oefeningen</span>
            </div>
            <div class="quiz-picker__arrow">→</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  practiceDisplay.querySelectorAll('.quiz-picker__card').forEach(card => {
    card.addEventListener('click', () => {
      activePracticeCategory = card.dataset.categoryId;
      renderPractice(subject);
    });
  });
}

function renderQuizPicker(subject) {
  quizPicker.innerHTML = '';
  if (!subject) {
    quizPicker.innerHTML = `
      <article class="summary">
        <h3>Examens</h3>
        <p class="lede">Kies eerst een vak via “Vakken”. Daarna verschijnen hier de examenpaden voor dat vak.</p>
        <p class="caption">Je voortgang blijft lokaal bewaard.</p>
      </article>
    `;
    return;
  }

  const domains = subject.examDomains || [];
  const domain = activeExamDomain ? getExamDomain(subject, activeExamDomain) : null;
  const normalizedSections = domain ? getNormalizedSectionsForDomain(domain) : [];

  const animatePicker = (next) => {
    if (!quizPicker) { next(); return; }
    quizPicker.classList.add('quiz-picker--out');
    setTimeout(() => {
      next();
      quizPicker.classList.remove('quiz-picker--out');
      quizPicker.classList.add('quiz-picker--in');
      requestAnimationFrame(() => {
        quizPicker.classList.remove('quiz-picker--in');
      });
    }, 160);
  };

  const resetToDomains = () => {
    animatePicker(() => {
      activeExamDomain = null;
      activeOsteologySection = null;
      activeQuizSetTitle = null;
      quizMode = 'picker';
      render();
    });
  };

  const resetToOsteologySections = () => {
    animatePicker(() => {
      activeOsteologySection = null;
      activeQuizSetTitle = null;
      quizMode = 'picker';
      render();
    });
  };

  if (activeOsteologySection) {
    const isValid = normalizedSections.some((sec) => sec.id === activeOsteologySection);
    if (!isValid) activeOsteologySection = null;
  }

  const createSetCard = (set, setIndex) => {
    const state = getSetProgress(subject.name, set.title, set.questions);
    const setHeading = formatSetTitle(set.title);
    
    // Status text logic
    let statusText = 'Start quiz';
    if (state.completed) statusText = 'Voltooid';
    else if (state.answered) statusText = 'Bezig';

    const card = document.createElement('article');
    card.className = 'quiz-picker__card';
    
    // New Compact HTML Structure
    card.innerHTML = `
      <div class="quiz-picker__content">
        <h3 class="quiz-picker__title">${setHeading}</h3>
        <span class="quiz-picker__meta">${statusText} · ${set.questions.length} vragen</span>
      </div>
      <div class="quiz-picker__status">
        ${state.completed ? `<span class="quiz-picker__score">${state.correct}/${set.questions.length}</span>` : ''}
        <svg class="quiz-picker__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </div>
    `;

    const statusEl = card.querySelector('.quiz-picker__status');
    if (statusEl) {
      const gmBtn = document.createElement('button');
      gmBtn.className = 'btn ghost';
      gmBtn.type = 'button';
      gmBtn.textContent = 'Gamemode';
      gmBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openGameHostModal(set.title);
      });
      statusEl.appendChild(gmBtn);
    }

    // Direct Click Action
    card.addEventListener('click', () => {
      card.classList.add('is-opening');
      setTimeout(() => {
        card.classList.remove('is-opening');
        if (state.answered && !state.completed) {
            restoreLastAttempt(subject.name, set.title);
        }
        startQuiz(set.title);
      }, 150);
    });

    return card;
  };

  if (!domain) {
    if (!domains.length) {
      quizPicker.innerHTML = `
        <section class="quiz-category">
          <header class="quiz-category__header">
            <div>
              <p class="eyebrow">Examens</p>
              <h3>${subject.name}</h3>
            </div>
          </header>
          <p class="caption">Hier werken we nog aan — voor dit vak staan er nog geen examendelen klaar.</p>
        </section>
      `;
      return;
    }

    const section = document.createElement('section');
    section.className = 'quiz-category';
    section.innerHTML = `
      <header class="quiz-category__header">
        <div>
          <p class="eyebrow">Examens</p>
          <h3>Kies je vak binnen ${subject.name}</h3>
        </div>
        <span class="chip ghost">${domains.length} opties</span>
      </header>
    `;

    const list = document.createElement('div');
    list.className = 'quiz-category__list';

    domains.forEach((dom) => {
      const totalSets = getDomainQuizSets(subject, dom.id).length;
      const card = document.createElement('article');
      card.className = 'quiz-picker__card';
      card.innerHTML = `
        <div class="quiz-picker__content">
            <h3 class="quiz-picker__title">${dom.title}</h3>
            <span class="quiz-picker__meta">${totalSets} sets beschikbaar</span>
        </div>
        <div class="quiz-picker__status">
            <svg class="quiz-picker__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </div>
      `;

      card.addEventListener('click', () => {
        card.classList.add('is-opening');
        setTimeout(() => card.classList.remove('is-opening'), 150);
        animatePicker(() => {
          activeExamDomain = dom.id;
          activeOsteologySection = null;
          activeQuizSetTitle = null;
          quizMode = 'picker';
          render();
        });
      });
      list.appendChild(card);
    });

    section.appendChild(list);
    quizPicker.appendChild(section);
    return;
  }

  // Handle Osteologie sub-sections selection
  if (domain.id === 'osteologie' && !activeOsteologySection) {
    const section = document.createElement('section');
    section.className = 'quiz-category';
    section.innerHTML = `
      <header class="quiz-category__header">
        <div>
          <p class="eyebrow">${domain.title}</p>
          <h3>Kies een onderdeel</h3>
        </div>
        <div class="quiz-picker__actions">
          <button class="btn ghost" type="button" id="back-to-domains">← Terug</button>
        </div>
      </header>
    `;

    const list = document.createElement('div');
    list.className = 'quiz-category__list';

    normalizedSections.forEach((sec) => {
      const totalSets = getSectionQuizSets(subject, sec.id).length;
      const card = document.createElement('article');
      card.className = 'quiz-picker__card';
      card.innerHTML = `
        <div class="quiz-picker__content">
            <h3 class="quiz-picker__title">${sec.title}</h3>
            <span class="quiz-picker__meta">${totalSets} sets</span>
        </div>
        <div class="quiz-picker__status">
            <svg class="quiz-picker__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </div>
      `;

      card.addEventListener('click', () => {
        card.classList.add('is-opening');
        setTimeout(() => card.classList.remove('is-opening'), 150);
        animatePicker(() => {
          activeOsteologySection = sec.id;
          activeQuizSetTitle = null;
          quizMode = 'picker';
          render();
        });
      });
      list.appendChild(card);
    });

    const backBtn = section.querySelector('#back-to-domains');
    backBtn?.addEventListener('click', resetToDomains);

    section.appendChild(list);
    quizPicker.appendChild(section);
    return;
  }

  const hasActiveSection = activeOsteologySection && normalizedSections.some((s) => s.id === activeOsteologySection);
  const sections = hasActiveSection
    ? normalizedSections.filter((s) => s.id === activeOsteologySection)
    : normalizedSections.length
      ? normalizedSections
      : [
          {
            id: domain.id,
            title: domain.title,
            categoryIds: subject.categories
              ?.filter((cat) => cat.domain === domain.id)
              .map((cat) => cat.id)
          }
        ];

  sections.forEach((sec, catIndex) => {
    const sectionEl = document.createElement('section');
    sectionEl.className = 'quiz-category';
    
    sectionEl.innerHTML = `
      <header class="quiz-category__header">
        <div>
           <p class="eyebrow">${catIndex + 1}. ${domain.title}</p>
           <h3>${sec.title}</h3>
        </div>
        <div class="quiz-picker__actions">
           ${domain.id === 'osteologie'
            ? '<button class="btn ghost" type="button" id="back-to-osteologie">← Terug</button>'
            : '<button class="btn ghost" type="button" id="back-to-domains-plain">← Andere vakken</button>'}
        </div>
      </header>
    `;

    const content = document.createElement('div');
    content.className = 'quiz-category__content';

    const list = document.createElement('div');
    list.className = 'quiz-category__list';
    const sets = getSectionQuizSets(subject, sec.id);

    if (!sets.length) {
      list.innerHTML = '<p class="caption">Nieuwe quizzen volgen hier zodra ze beschikbaar zijn.</p>';
    } else {
      sets.forEach((set, setIndex) => {
        list.appendChild(createSetCard(set, setIndex));
      });
    }
    
    content.appendChild(list);
    sectionEl.appendChild(content);

    const backOsteo = sectionEl.querySelector('#back-to-osteologie');
    backOsteo?.addEventListener('click', (e) => {
        e.stopPropagation();
        resetToOsteologySections();
    });

    const backDomainsPlain = sectionEl.querySelector('#back-to-domains-plain');
    backDomainsPlain?.addEventListener('click', (e) => {
        e.stopPropagation();
        resetToDomains();
    });

    quizPicker.appendChild(sectionEl);
  });
}
function renderSubjectSidebar(subject) {
  if (!subjectSidebar) return;
  subjectSidebar.innerHTML = '';
  if (!subject) {
    subjectSidebar.innerHTML = '<p class="caption">Kies een vak om te verkennen.</p>';
    return;
  }
  let domains = subject.examDomains || [];

  // Filter for practice mode
  if (activePanel === 'practice-panel') {
    domains = domains.filter(d => d.id === 'arthrologie');
  }

  const container = document.createElement('div');
  const title = document.createElement('h4');
  title.textContent = 'Onderdelen';
  const list = document.createElement('div');
  list.className = 'navlist';
  domains.forEach((dom) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'navitem' + (activeExamDomain === dom.id ? ' is-active' : '');
    item.textContent = dom.title;
    item.addEventListener('click', () => {
      activeExamDomain = dom.id;
      activeOsteologySection = null;
      activeQuizSetTitle = null;
      quizMode = 'picker';
      render();
    });
    list.appendChild(item);
    if (activeExamDomain === dom.id) {
      const sections = getNormalizedSectionsForDomain(dom);
      sections.forEach((sec) => {
        const secBtn = document.createElement('button');
        secBtn.type = 'button';
        secBtn.className = 'navitem' + (activeOsteologySection === sec.id ? ' is-active' : '');
        secBtn.textContent = sec.title;
        secBtn.style.marginLeft = '6px';
        secBtn.addEventListener('click', () => {
          activeOsteologySection = sec.id;
          activeQuizSetTitle = null;
          quizMode = 'picker';
          render();
        });
        list.appendChild(secBtn);
      });
    }
  });
  container.append(title, list);
  subjectSidebar.appendChild(container);
}

function startQuiz(setTitle) {
  const subject = getActiveSubject();
  if (!subject) return;
  const set = getQuizSets(subject).find((quizSet) => quizSet.title === setTitle);
  if (!set) return;
  activeQuizSetTitle = set.title;
  const state = getSetProgress(subject.name, set.title, set.questions);
  activeQuizQuestionIndex = findFirstUnanswered(set, state);
  quizMode = state.completed ? 'results' : 'runner';
  setActiveView('quizplay');
  render();
}

function exitQuiz() {
  quizMode = 'picker';
  activeQuizSetTitle = null;
  activeQuizQuestionIndex = 0;
  setActiveView('anatomie');
  setActivePanel('quiz-panel');
  render();
}

function renderDuringQuiz() {
  const subject = getActiveSubject();
  renderQuizRunner(subject);
  updateProgressBanner(subject);
}

function goToQuestion(delta) {
  const subject = getActiveSubject();
  const set = getActiveSet(subject);
  if (!set) return;
  const nextIndex = Math.min(Math.max(activeQuizQuestionIndex + delta, 0), set.questions.length - 1);
  activeQuizQuestionIndex = nextIndex;
  renderDuringQuiz();
}

function handleAnswerSelection(choiceIndex) {
  const subject = getActiveSubject();
  const set = getActiveSet(subject);
  if (!subject || !set) return;
  const state = ensureSetState(subject.name, set.title);
  state.answers[activeQuizQuestionIndex] = {
    choiceIndex,
    choice: choiceIndex,
    correct: computePickCorrect(set.questions[activeQuizQuestionIndex], { choice: choiceIndex })
  };
  computeSetCounts(set, state);
  persistProgress();
  Array.from(quizOptions.querySelectorAll('.option')).forEach((el, idx) => {
    el.classList.toggle('selected', idx === choiceIndex);
  });
  updateProgressBanner(subject);
  quizRunnerHint.textContent = 'Antwoord opgeslagen.';
}

function handleOpenAnswerInput(text) {
  const subject = getActiveSubject();
  const set = getActiveSet(subject);
  if (!subject || !set) return;
  const state = ensureSetState(subject.name, set.title);
  state.answers[activeQuizQuestionIndex] = {
    text,
    correct: computePickCorrect(set.questions[activeQuizQuestionIndex], { text })
  };
  computeSetCounts(set, state);
  persistProgress();
  updateProgressBanner(subject);
}

function renderQuizRunner(subject) {
  const set = getActiveSet(subject);
  const state = set ? getSetProgress(subject.name, set.title, set.questions) : null;
  const isRunner = quizMode === 'runner' && !!set;
  quizRunner.hidden = !isRunner;
  if (!isRunner || !set || !state) return;

  const question = set.questions[activeQuizQuestionIndex];
  
  if (!question) {
    if (set.questions.length > 0) {
       activeQuizQuestionIndex = 0;
       // Prevent infinite loop if 0 is also undefined (unlikely if length > 0)
       if (set.questions[0]) {
         renderDuringQuiz();
         return;
       }
    }
    // Fallback if no questions or catastrophic failure
    quizQuestionTitle.textContent = 'Fout bij laden vraag';
    quizQuestionText.textContent = 'Er ging iets mis bij het ophalen van deze vraag. Probeer de pagina te verversen of de quiz opnieuw te starten.';
    quizQuestionText.hidden = false;
    return;
  }

  const answer = state.answers?.[activeQuizQuestionIndex];

  quizRunnerTitle.textContent = formatSetTitle(set.title);
  quizRunnerSubtitle.textContent = `Vraag ${activeQuizQuestionIndex + 1} van ${set.questions.length}`;
  quizRunnerStep.textContent = `Vraag ${activeQuizQuestionIndex + 1} van ${set.questions.length}`;
  quizQuestionTitle.textContent = question.question;
  if (question.image) {
    quizQuestionText.textContent = '';
    quizQuestionText.hidden = true;
  } else {
    quizQuestionText.hidden = false;
    quizQuestionText.textContent = question.description || 'Kies het juiste antwoord hieronder.';
  }

  const cardEl = quizRunner.querySelector('.quiz-runner__card');
  const prevMedia = cardEl?.querySelector('.quiz-question__media');
  if (prevMedia) prevMedia.remove();
  if (question.image) {
    const media = document.createElement('figure');
    media.className = 'quiz-question__media';
    const frame = document.createElement('div');
    frame.className = 'quiz-question__frame';
    const img = document.createElement('img');
    img.className = 'quiz-question__image';
    img.src = question.image;
    img.alt = question.imageAlt || 'Quiz afbeelding';
    img.addEventListener('click', () => {
      showImageLightbox(question.image, img.alt);
    });
    img.addEventListener('error', () => {
      const attempted = img.dataset.fallbackAttempted === '1';
      if (!attempted) {
        img.dataset.fallbackAttempted = '1';
        const fixed = sanitizeImagePath(img.src);
        if (fixed !== img.src) {
          img.src = fixed;
          return;
        }
      }
      img.style.display = 'none';
      const ph = document.createElement('div');
      ph.className = 'quiz-question__placeholder';
      ph.textContent = 'Afbeelding kon niet geladen worden.';
      frame.appendChild(ph);
    });
    frame.appendChild(img);
    media.appendChild(frame);
    cardEl?.insertBefore(media, quizOptions);
  }

  quizOptions.innerHTML = '';
  if (isOpenQuestion(question)) {
    const field = document.createElement('div');
    field.className = 'field';
    const label = document.createElement('span');
    label.textContent = 'Typ je antwoord';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Schrijf hier je antwoord';
    input.value = state.answers?.[activeQuizQuestionIndex]?.text || '';
    input.addEventListener('input', () => handleOpenAnswerInput(input.value));
    input.addEventListener('change', () => {
      handleOpenAnswerInput(input.value);
      quizRunnerHint.textContent = 'Antwoord opgeslagen.';
    });
    field.appendChild(label);
    field.appendChild(input);
    quizOptions.appendChild(field);
  } else {
    question.options.forEach((option, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option';
      const letter = String.fromCharCode(65 + idx);
      btn.innerHTML = `<span class="option__label">${letter}</span><span class="option__text">${option}</span>`;
      if (answer?.choice === idx) {
        btn.classList.add('selected');
      }
      btn.addEventListener('click', () => {
        handleAnswerSelection(idx);
        quizRunnerHint.textContent = 'Antwoord opgeslagen.';
      });
      quizOptions.appendChild(btn);
    });
  }

  quizPrev.disabled = activeQuizQuestionIndex === 0;
  quizNext.disabled = activeQuizQuestionIndex === set.questions.length - 1;
  const onLastQuestion = activeQuizQuestionIndex === set.questions.length - 1;
  quizSubmit.hidden = !onLastQuestion;
  quizSubmit.disabled = !onLastQuestion;
  if (!prefersReducedMotion) {
    const card = quizRunner.querySelector('.quiz-runner__card');
    if (card) {
      if (!card.classList.contains('mounted')) card.classList.add('mounted');
      card.classList.remove('fade-in');
      // apply a single, subtle fade for next/prev
      card.classList.add('fade-in');
      setTimeout(() => {
        card.classList.remove('fade-in');
      }, 240);
    }
  }
  quizRunnerHint.textContent = !state.answered
    ? 'Kies een antwoord om verder te gaan.'
    : state.answered < set.questions.length
    ? 'Je kan ook je score bekijken; onbeantwoorde vragen tonen "Geen antwoord".'
    : 'Beantwoord deze laatste vraag en bekijk daarna je score.';
}

function showImageLightbox(src, alt) {
  const overlay = document.createElement('div');
  overlay.className = 'image-lightbox';
  const img = document.createElement('img');
  img.className = 'image-lightbox__img';
  img.src = src;
  img.alt = alt || '';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'image-lightbox__close';
  close.textContent = 'Sluiten';
  const dismiss = () => {
    overlay.remove();
    document.removeEventListener('keydown', onEsc);
  };
  const onEsc = (e) => { if (e.key === 'Escape') dismiss(); };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) dismiss(); });
  close.addEventListener('click', dismiss);
  document.addEventListener('keydown', onEsc);
  overlay.appendChild(img);
  overlay.appendChild(close);
  document.body.appendChild(overlay);
}

function sanitizeImagePath(src) {
  try {
    const u = new URL(src, location.href);
    let p = u.pathname;
    p = p.replace(/\/+/, '/');
    p = p.replace(/\/\s+/g, '/');
    p = p.replace(/\s{2,}/g, ' ');
    u.pathname = p;
    return u.toString();
  } catch (_) {
    return src.replace(/\/\s+/g, '/').replace(/\s{2,}/g, ' ');
  }
}

function renderQuizResults(subject) {
  const set = getActiveSet(subject);
  const state = set ? getSetProgress(subject.name, set.title, set.questions) : null;
  const isResults = quizMode === 'results' && !!set;
  quizResults.hidden = !isResults;
  if (!isResults || !set || !state) return;

  const percent = set.questions.length ? Math.round((state.correct / set.questions.length) * 100) : 0;
  quizResultsTitle.textContent = `${state.correct}/${set.questions.length} punten`;
  quizResultsSubtitle.textContent = `${percent}% · ${formatSetTitle(set.title)}`;

  quizResultsList.innerHTML = '';
  set.questions.forEach((question, idx) => {
    const userAnswer = state.answers?.[idx];
    const container = document.createElement('article');
    container.className = 'quiz-results__item';

    const isCorrect = computePickCorrect(question, userAnswer);
    const correctness = isCorrect ? 'correct' : 'incorrect';
    const userText = (() => {
      if (!userAnswer) return 'Geen antwoord';
      if (typeof userAnswer.choice === 'number') return question.options[userAnswer.choice];
      if (typeof userAnswer.text === 'string' && userAnswer.text.trim().length) return userAnswer.text;
      return 'Geen antwoord';
    })();
    const correctText = isOpenQuestion(question)
      ? (question.answerText || (question.answerKeywords ? question.answerKeywords.join(' ') : ''))
      : question.options[question.answerIndex];

    let headerHtml = `
      <header class="quiz-results__item-header">
        <p class="eyebrow">Vraag ${idx + 1}</p>
        <div style="display:flex; align-items:center;">
          <span class="chip ${correctness}">${correctness === 'correct' ? 'Juist' : 'Fout'}</span>
    `;

    // Add 'Juist' button for incorrect open answers
    if (!isCorrect && isOpenQuestion(question)) {
      headerHtml += `
          <button class="feedback-menu-btn" data-index="${idx}">Juist</button>
      `;
    }

    headerHtml += `
        </div>
      </header>
    `;

    container.innerHTML = `
      ${headerHtml}
      <h4>${question.question}</h4>
      <p class="caption"><strong>Jouw antwoord:</strong> ${userText}</p>
      <p class="caption"><strong>Correct:</strong> ${correctText}</p>
      ${userAnswer?.forceCorrect ? `<p class="caption" style="color:var(--accent); margin-top:4px;"><em>Gemarkeerd als juist: ${userAnswer.forceCorrectReason || 'Handmatig goedgekeurd'}</em></p>` : ''}
    `;

    // Event listener for the "Juist" button
    const feedbackBtn = container.querySelector('.feedback-menu-btn');
    if (feedbackBtn) {
      feedbackBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openFeedbackModal(idx);
      });
    }

    quizResultsList.appendChild(container);
  });
}

function profileCardActions() {
  return {
    login: profileLogin,
    register: profileRegister,
    logout: profileLogout
  };
}

function renderProfile() {
  const user = currentUser;
  const loggedIn = !!user;
  const resultsCard = document.querySelector('.profile-card--wide');
  const profileView = document.querySelector('.view--profile');
  profileView?.classList.toggle('is-authed', loggedIn);
  profileHeading.textContent = loggedIn ? 'Je profiel' : 'Log in om je profiel te zien';
  profileSubtitle.textContent = loggedIn
    ? 'Bekijk je gegevens en voortgang per vak.'
    : 'Meld je aan om je e-mail, gebruikersnaam en resultaten te bekijken.';
  profileName.textContent = getUserDisplayName(user);
  profileEmail.textContent = loggedIn ? user.email || 'Geen e-mail gevonden' : 'Geen e-mail bekend';
  profileStatus.textContent = loggedIn
    ? 'Je voortgang wordt lokaal bijgehouden.'
    : 'Geen account actief. Log in of registreer om verder te gaan.';

  if (profileUsernameField) profileUsernameField.hidden = !loggedIn;
  if (avatarChoose) avatarChoose.hidden = !loggedIn;
  if (avatarPicker) avatarPicker.hidden = !loggedIn || !avatarPicker.classList.contains('open');

  if (profileUsername) {
    const defaultName = getUserDisplayName(user);
    profileUsername.value = userPrefs && userPrefs.displayName ? userPrefs.displayName : (loggedIn ? defaultName : '');
    profileUsername.disabled = !loggedIn;
  }
  if (profileAvatarGrid) {
    profileAvatarGrid.innerHTML = '';
    AVAILABLE_AVATARS.forEach((file) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `avatar-option${userPrefs && userPrefs.avatar === file ? ' selected' : ''}`;
      btn.innerHTML = `<img src="Profiel/${file}" alt="${file.replace(/\.png$/,'')}" />`;
      btn.addEventListener('click', () => {
        userPrefs.avatar = file;
        persistUserPrefs();
        renderProfile();
        updateUserChip(currentUser);
      });
      btn.disabled = !loggedIn;
      profileAvatarGrid.appendChild(btn);
    });
  }

  const results = buildProfileResults();

  // Insert Difficult Flashcards Section
  const existingDiff = document.getElementById('profile-diff-card');
  if (existingDiff) existingDiff.remove();

  const flashSubject = subjects.find(s => s.name === 'Individuele Fitness');
  let difficultCount = 0;
  if (flashSubject) {
      const cats = getFlashcardCategories(flashSubject);
      const diffCat = cats.find(c => c.id === 'difficult');
      if (diffCat) difficultCount = diffCat.cards.length;
  }

  if (loggedIn && difficultCount > 0) {
      const diffCard = document.createElement('article');
      diffCard.id = 'profile-diff-card';
      diffCard.className = 'profile-card profile-card--wide';
      diffCard.style.marginBottom = '16px';
      diffCard.innerHTML = `
        <header class="profile-card__header">
          <div>
            <p class="eyebrow">Mijn flashcards</p>
            <h3>Mijn moeilijke flashcards</h3>
          </div>
          <span class="chip" style="background:rgba(220,50,50,0.16); color:#b71c1c;">${difficultCount} moeilijke flashcards</span>
        </header>
        <div class="profile-quiz-list">
          <div class="collapse open">
             <div class="collapse__body">
                <div class="collapse__row">
                   <div>
                     <strong>Praktische Examen & Meer</strong>
                     <p class="caption">Je hebt ${difficultCount} kaarten gemarkeerd als 'nog niet gekend'.</p>
                   </div>
                   <button class="btn ghost" type="button" id="profile-diff-open">Oefenen</button>
                </div>
             </div>
          </div>
        </div>
      `;
      if (resultsCard && resultsCard.parentNode) {
          resultsCard.parentNode.insertBefore(diffCard, resultsCard);
      }
      
      const openBtn = diffCard.querySelector('#profile-diff-open');
      if (openBtn) {
        openBtn.addEventListener('click', () => {
            activeSubject = 'Individuele Fitness'; 
            activePanel = 'flashcards-play-panel'; 
            setActiveView('anatomie'); 
            const fs = subjects.find(s => s.name === 'Individuele Fitness');
            const cats = getFlashcardCategories(fs);
            const diffCat = cats.find(c => c.id === 'difficult');
            if (diffCat) {
                activeFlashcardsCategory = diffCat;
                render();
            }
        });
      }
  }
  profileQuizList.innerHTML = '';
  if (!loggedIn) {
    profileQuizList.innerHTML = '';
    if (resultsCard) resultsCard.hidden = true;
    profileQuizCount.textContent = '';
  } else if (!results.length) {
    if (resultsCard) resultsCard.hidden = true;
    profileQuizList.innerHTML = '';
    profileQuizCount.textContent = '';
  } else {
    if (resultsCard) resultsCard.hidden = false;
    let completedTotal = 0;
    results.forEach((group) => {
      const isOpen = !!profileExpanded[group.subject];
      const collapse = document.createElement('div');
      collapse.className = `collapse${isOpen ? ' open' : ''}`;
      collapse.innerHTML = `
        <div class="collapse__header" data-subject="${group.subject}">
          <h4 class="collapse__title">${group.subject}</h4>
          <div class="collapse__actions">
            <span class="chip ghost">${group.entries.length} gemaakte quizzen</span>
            <button class="icon-btn collapse__arrow" aria-label="Uitklappen">▾</button>
          </div>
        </div>
        <div class="collapse__body" ${isOpen ? '' : 'hidden'}></div>
      `;

      const body = collapse.querySelector('.collapse__body');
      group.entries.forEach((entry) => {
        if (entry.completed) completedTotal += 1;
        const row = document.createElement('div');
        row.className = 'collapse__row';
        const actionBtn = document.createElement('button');
        actionBtn.className = 'btn ghost';
        actionBtn.type = 'button';
        actionBtn.textContent = entry.completed ? 'Bekijk score' : 'Ga verder';
        actionBtn.addEventListener('click', () => openSubjectResult(group.subject, entry.title));
        const resumeBtn = document.createElement('button');
        resumeBtn.className = 'btn ghost';
        resumeBtn.type = 'button';
        resumeBtn.textContent = 'Hervatten';
        resumeBtn.addEventListener('click', () => {
          const subject = subjects.find((s) => s.name === group.subject);
          if (!subject) return;
          const set = getQuizSets(subject).find((quizSet) => formatSetTitle(quizSet.title) === formatSetTitle(entry.title));
          if (!set) return;
          restoreLastAttempt(group.subject, set.title);
          activeSubject = group.subject;
          startQuiz(set.title);
        });
        row.innerHTML = `
          <div>
            <strong>${entry.title}</strong>
            <p class="caption">${entry.correct}/${entry.total} · ${entry.percent}% juist${entry.completed ? '' : ' (bezig)'} </p>
          </div>
        `;
        row.appendChild(actionBtn);
        if (entry.hasArchive) row.appendChild(resumeBtn);
        body.appendChild(row);
      });

      const header = collapse.querySelector('.collapse__header');
      header.addEventListener('click', () => {
        profileExpanded[group.subject] = !profileExpanded[group.subject];
        renderProfile();
      });

      profileQuizList.appendChild(collapse);
    });

    profileQuizCount.textContent = `${completedTotal || 0} voltooide quizzen`;
  }

  const actionButtons = profileCardActions();
  actionButtons.login.hidden = loggedIn;
  actionButtons.register.hidden = loggedIn;
  if (actionButtons.logout) actionButtons.logout.hidden = !loggedIn;
  if (profileSave) profileSave.hidden = !loggedIn;
}

function openSubjectResult(subjectName, setTitle) {
  const subject = subjects.find((s) => s.name === subjectName);
  if (!subject) return;
  const set = getQuizSets(subject).find((quizSet) => formatSetTitle(quizSet.title) === formatSetTitle(setTitle));
  if (!set) return;
  activeSubject = subject.name;
  activeQuizSetTitle = set.title;
  const state = getSetProgress(subject.name, set.title, set.questions);
  quizMode = state.completed ? 'results' : 'runner';
  setActiveView('quizplay');
  render();
}

function showResults() {
  const subject = getActiveSubject();
  const set = getActiveSet(subject);
  if (!set || !subject) return;
  const state = getSetProgress(subject.name, set.title, set.questions);
  quizMode = 'results';
  render();
}

function retakeActiveQuiz() {
  const subject = getActiveSubject();
  const set = getActiveSet(subject);
  if (!subject || !set) return;
  resetSetProgress(subject.name, set.title);
  activeQuizQuestionIndex = 0;
  quizMode = 'runner';
  render();
}

function restoreLastAttempt(subjectName, setTitle) {
  const state = ensureSetState(subjectName, setTitle);
  const snapshot = progress[subjectName]?.[setTitle]?.lastAttempt;
  if (!snapshot) return;
  state.answers = deepClone(snapshot.answers || {});
  const subject = subjects.find((s) => s.name === subjectName);
  const set = subject ? getQuizSets(subject).find((quizSet) => quizSet.title === setTitle) : null;
  if (set) computeSetCounts(set, state);
  persistProgress();
}

function render() {
  const subject = getActiveSubject();
  activeSubjectHeading.textContent = subject?.name || 'Kies een vak';
  const flashTab = sectionTabs?.querySelector('[data-panel-target="flashcards-panel"]');
  const allowFlashcards = subject && subject.name === 'Individuele Fitness';
  if (flashTab) flashTab.hidden = !allowFlashcards;
  if (!allowFlashcards && (activePanel === 'flashcards-panel' || activePanel === 'flashcards-play-panel')) {
    setActivePanel('quiz-panel');
  }
  if (!allowFlashcards) {
    const fcPanel = document.getElementById('flashcards-panel');
    const fcPlay = document.getElementById('flashcards-play-panel');
    if (fcPanel) fcPanel.hidden = true;
    if (fcPlay) fcPlay.hidden = true;
  }
  renderPractice(subject);
  renderQuizPicker(subject);
  renderFlashcardsPanel(subject);
  renderFlashcardsPlay(subject);
  renderSubjectSidebar(subject);
  renderQuizRunner(subject);
  renderQuizResults(subject);
  renderProfile();
  updateProgressBanner(subject);
  renderSubjectMenu();
  renderHomeCatalog();
  persistSubjects();
  renderGamemodeHost(subject);
  renderGamemodePlayer(subject);
}

const gamehostModal = document.getElementById('gamehost-modal');
const gamehostOverlay = document.getElementById('gamehost-overlay');
const gamehostClose = document.getElementById('gamehost-close');
const gamehostClose2 = document.getElementById('gamehost-close-2');
const gamehostQR = document.getElementById('gamehost-qr');
const gamehostCode = document.getElementById('gamehost-code');
const gamehostSpinner = document.getElementById('gamehost-spinner');
const gamehostMessage = document.getElementById('gamehost-message');

function openGameHostModal(setTitle) {
  if (!gamehostModal || !gamehostOverlay) return;
  gamehostMessage.textContent = '';
  gamehostQR.innerHTML = '';
  if (gamehostSpinner) gamehostSpinner.style.display = 'block';
  gamehostCode.textContent = '••••••';
  gamehostModal.hidden = false;
  gamehostOverlay.hidden = false;
  requestAnimationFrame(async () => {
    gamehostModal.classList.add('visible');
    gamehostOverlay.classList.add('visible');
    const subject = getActiveSubject();
    const code = makeLoginCode();
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'game');
    url.searchParams.set('code', code);
    if (subject?.name) url.searchParams.set('subject', subject.name);
    if (setTitle) url.searchParams.set('set', setTitle);
    gamehostCode.textContent = code;
    renderQRCode(gamehostQR, url.toString());
    if (gamehostSpinner) gamehostSpinner.style.display = 'none';
    try {
      const created = await createGameSession(subject?.name || '', setTitle);
      if (created && created.code) {
        gamehostCode.textContent = created.code;
        renderQRCode(gamehostQR, created.deepLink);
      }
    } catch (err) {
      // Fallback to local channel so joining still works offline/preview
      try {
        const chan = openGameChannel(code);
        if (chan) {
          WOENIE_LOCAL_SESSIONS[code] = WOENIE_LOCAL_SESSIONS[code] || { status: 'waiting', players: {}, answers: {}, scores: {} };
          chan.addEventListener('message', (e) => {
            const msg = e.data || {};
            if (msg.type === 'request-sync') {
              chan.postMessage({ type: 'session-start', subjectName: subject?.name || '', setTitle, status: 'waiting' });
            } else if (msg.type === 'join-request') {
              const id = msg.playerId;
              WOENIE_LOCAL_SESSIONS[code].players[id] = { nickname: msg.nickname || 'Speler', score: 0 };
              chan.postMessage({ type: 'session-start', subjectName: subject?.name || '', setTitle, status: 'waiting' });
            }
          });
        }
      } catch {}
      gamehostMessage.textContent = 'Backend niet bereikbaar. Join werkt lokaal met deze code.';
      console.error('[WoenieQuiz Gamemode] host modal error', err);
    }
  });
  document.body.classList.add('modal-open');
}

function closeGameHostModal() {
  if (!gamehostModal || !gamehostOverlay) return;
  gamehostModal.hidden = true;
  gamehostOverlay.hidden = true;
  gamehostModal.classList.remove('visible');
  gamehostOverlay.classList.remove('visible');
  document.body.classList.remove('modal-open');
}

gamehostClose?.addEventListener('click', closeGameHostModal);
gamehostClose2?.addEventListener('click', closeGameHostModal);
gamehostOverlay?.addEventListener('click', closeGameHostModal);
gamehostModal?.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeGameHostModal(); });

function setAuthMode(mode) {
  authMode = mode;
  authSubmit.textContent = mode === 'login' ? 'Inloggen' : 'Registreren';
  authToggle.textContent = mode === 'login' ? 'Nog geen account? Registreren' : 'Ik heb al een account';
  showAuthMessage('');
}

function openAuthModal(mode = 'login') {
  setAuthMode(mode);
  authMessage.textContent = '';
  authMessage.className = 'message';
  closeAccountPanel();
  authModal.hidden = false;
  authOverlay.hidden = false;
  requestAnimationFrame(() => {
    authModal.classList.add('visible');
    authOverlay.classList.add('visible');
  });
  authEmail.focus();
  lastFocusedElement = document.activeElement;
  document.body.classList.add('modal-open');
  const focusable = authModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const firstEl = focusable[0];
  const lastEl = focusable[focusable.length - 1];
  function handleTrap(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }
  authModal.addEventListener('keydown', handleTrap);
  authModal.dataset.trap = 'true';
  authModal._trapHandler = handleTrap;
  const disabled = !auth;
  authEmail.disabled = disabled;
  authPassword.disabled = disabled;
  authSubmit.disabled = disabled;
  googleBtn.disabled = disabled;
  if (disabled) {
    showAuthMessage('Accountfunctionaliteit is niet geconfigureerd.', 'error');
  }
}

function closeAuthModal() {
  authModal.classList.remove('visible');
  authOverlay.classList.remove('visible');
  setTimeout(() => {
    authModal.hidden = true;
    authOverlay.hidden = true;
  }, 180);
  document.body.classList.remove('modal-open');
  if (authModal.dataset.trap === 'true' && authModal._trapHandler) {
    authModal.removeEventListener('keydown', authModal._trapHandler);
    delete authModal._trapHandler;
    delete authModal.dataset.trap;
  }
  if (lastFocusedElement && lastFocusedElement.focus) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

function showAuthMessage(text, type = '') {
  authMessage.textContent = text;
  authMessage.className = 'message';
  if (type) authMessage.classList.add(type);
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const email = authEmail.value.trim();
  const password = authPassword.value.trim();
  if (!email || !password) {
    showAuthMessage('Vul e-mail en wachtwoord in.', 'error');
    return;
  }
  if (!auth) {
    showAuthMessage('Accountfunctionaliteit is niet geconfigureerd.', 'error');
    return;
  }
  showAuthMessage(authMode === 'login' ? 'Inloggen…' : 'Registreren…');
  try {
    if (authMode === 'login') {
      await signInWithEmailAndPassword(auth, email, password);
      showAuthMessage('Succesvol ingelogd!', 'success');
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
      showAuthMessage('Account aangemaakt en ingelogd!', 'success');
    }
    setTimeout(closeAuthModal, 800);
  } catch (error) {
    const msg = formatAuthError(error?.code) || error.message;
    showAuthMessage(msg, 'error');
  }
}

async function loginWithGoogle() {
  if (!auth) {
    showAuthMessage('Accountfunctionaliteit is niet geconfigureerd.', 'error');
    return;
  }
  showAuthMessage('Google login openen…');
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    showAuthMessage(`Welkom ${user.displayName || user.email}!`, 'success');
    setTimeout(closeAuthModal, 800);
  } catch (error) {
    const msg = formatAuthError(error?.code) || error.message;
    showAuthMessage(msg, 'error');
  }
}

function formatAuthError(code) {
  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Inschakelen vereist: ga naar Firebase → Authentication → Sign-in method en activeer E-mail/wachtwoord en Google.';
    case 'auth/invalid-credential':
      return 'Ongeldige inloggegevens. Controleer e-mail en wachtwoord of reset je wachtwoord.';
    case 'auth/user-not-found':
      return 'Geen account met dit e-mailadres. Registreer of controleer je invoer.';
    case 'auth/wrong-password':
      return 'Verkeerd wachtwoord. Probeer opnieuw of herstel je wachtwoord.';
    case 'auth/popup-closed-by-user':
      return 'Google-venster werd gesloten. Probeer opnieuw.';
    default:
      return null;
  }
}

function updateUserChip(user) {
  const loggedIn = !!user;
  account?.classList.toggle('is-authenticated', loggedIn);
  const name = getUserDisplayName(user);
  if (loggedIn && userPrefs && userPrefs.avatar) {
    loginBtn.classList.add('has-avatar');
    loginBtn.innerHTML = `<img class="avatar avatar--inline" src="Profiel/${userPrefs.avatar}" alt="Avatar" /> <span>${name}</span>`;
  } else {
    loginBtn.classList.remove('has-avatar');
    loginBtn.textContent = loggedIn ? name : 'Inloggen / Registreren';
  }
  loginBtn.classList.toggle('primary', loggedIn);
  const avatarFile = userPrefs && userPrefs.avatar ? userPrefs.avatar : '';
  if (loggedIn && avatarFile) {
    if (accountAvatar) accountAvatar.hidden = true;
    if (profileAvatarEl) { profileAvatarEl.hidden = false; profileAvatarEl.src = `Profiel/${avatarFile}`; }
    if (profileAvatarInline) { profileAvatarInline.hidden = false; profileAvatarInline.src = `Profiel/${avatarFile}`; }
  } else {
    if (accountAvatar) accountAvatar.hidden = true;
    if (profileAvatarEl) profileAvatarEl.hidden = true;
    if (profileAvatarInline) profileAvatarInline.hidden = true;
  }
  accountToggle?.setAttribute('aria-label', loggedIn ? 'Accountmenu (ingelogd)' : 'Accountmenu');
}

function goToProfile() {
  if (!currentUser) {
    openAuthModal('login');
    return;
  }
  closeAccountPanel();
  setActiveView('profile');
  renderProfile();
}

function goPrev() { lastQuestionDelta = -1; goToQuestion(-1); }
function goNext() { lastQuestionDelta = 1; goToQuestion(1); }
quizPrev?.addEventListener('click', goPrev);
quizNext?.addEventListener('click', goNext);
quizSubmit?.addEventListener('click', showResults);
quizExit?.addEventListener('click', exitQuiz);
quizExitCompact?.addEventListener('click', exitQuiz);
quizBack?.addEventListener('click', exitQuiz);
quizRetake?.addEventListener('click', retakeActiveQuiz);

loginBtn.addEventListener('click', () => {
  if (currentUser) {
    goToProfile();
  } else {
    openAuthModal('login');
  }
});
homeLogin?.addEventListener('click', () => openAuthModal('login'));
accountLogin?.addEventListener('click', () => openAuthModal('login'));
accountRegister?.addEventListener('click', () => openAuthModal('register'));
accountProfile?.addEventListener('click', goToProfile);
profileLogin?.addEventListener('click', () => openAuthModal('login'));
profileRegister?.addEventListener('click', () => openAuthModal('register'));
profileBack?.addEventListener('click', () => setActiveView('home'));
profileSave?.addEventListener('click', () => {
  const name = (profileUsername?.value || '').trim();
  if (name) userPrefs.displayName = name;
  persistUserPrefs();
  updateUserChip(currentUser);
  renderProfile();
});
avatarChoose?.addEventListener('click', () => {
  if (!currentUser) return;
  avatarPicker.classList.toggle('open');
  renderProfile();
});
profileName?.addEventListener('click', () => {
  if (!currentUser || !profileUsername) return;
  if (profileUsernameField?.hidden) profileUsernameField.hidden = false;
  profileUsername.focus();
});
async function logout() {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.warn('Uitloggen mislukt:', error);
  }
  closeAccountPanel();
  renderProfile();
}

accountLogout?.addEventListener('click', logout);
profileLogout?.addEventListener('click', logout);
accountToggle?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  toggleAccountPanel();
});
authClose.addEventListener('click', closeAuthModal);
authOverlay.addEventListener('click', closeAuthModal);
authToggle.addEventListener('click', () => {
  setAuthMode(authMode === 'login' ? 'register' : 'login');
});
authForm.addEventListener('submit', handleAuthSubmit);
googleBtn.addEventListener('click', loginWithGoogle);

sectionTabs?.addEventListener('click', (event) => {
  const target = event.target.closest('[data-panel-target]');
  if (!target) return;
  setActivePanel(target.dataset.panelTarget);
});

  viewToggles.forEach((toggle) => {
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      const viewTarget = toggle.dataset.viewTarget;
      const panelTarget = toggle.dataset.panelTarget;
      const subjectName = toggle.dataset.subjectName;
      if (subjectName) {
        handleSubjectNavigation(subjectName, panelTarget || 'quiz-panel');
        return;
      }
      if (viewTarget) setActiveView(viewTarget);
      if (panelTarget) setActivePanel(panelTarget);
    });
  });

subjectMenu?.addEventListener('mouseenter', openSubjectMenu);
subjectMenu?.addEventListener('mouseleave', closeSubjectMenu);
subjectMenuToggle?.addEventListener('mouseenter', openSubjectMenu);
subjectMenuToggle?.addEventListener('focus', openSubjectMenu);
subjectMenuPanel?.addEventListener('mouseenter', openSubjectMenu);
subjectMenuPanel?.addEventListener('focusin', openSubjectMenu);
subjectMenuToggle?.addEventListener('click', (event) => {
  event.preventDefault();
  if (subjectMenu.classList.contains('open')) {
    closeSubjectMenu();
  } else {
    openSubjectMenu();
  }
});

document.addEventListener('click', (event) => {
  if (subjectMenu?.classList.contains('open') && !subjectMenu.contains(event.target)) {
    closeSubjectMenu();
  }
  if (account?.classList.contains('open') && !account.contains(event.target)) {
    closeAccountPanel();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!authModal.hidden) closeAuthModal();
    if (account?.classList.contains('open')) closeAccountPanel();
    if (subjectMenu?.classList.contains('open')) closeSubjectMenu();
  }
});

function renderHomeCatalog() {
  if (!subjectCatalog) return;
  const term = (subjectSearch?.value || '').trim().toLowerCase();
  subjectCatalog.innerHTML = '';
  const list = subjects.filter((s) => {
    if (!term) return true;
    const catTitles = (s.categories || []).map((c) => c.title).join(' ');
    const domainTitles = (s.examDomains || []).map((d) => d.title).join(' ');
    const sectionTitles = (s.examDomains || []).flatMap((d) => (d.sections || []).map((sec) => sec.title)).join(' ');
    const quizTitles = getQuizSets(s).map((q) => q.title).join(' ');
    const hay = `${s.name} ${s.summary || ''} ${catTitles} ${domainTitles} ${sectionTitles} ${quizTitles}`.toLowerCase();
    return hay.includes(term);
  });
  const count = document.getElementById('catalog-count');
  if (count) count.textContent = `${list.length} vakken`;
  if (!list.length) {
    subjectCatalog.innerHTML = '<p class="caption">Geen vakken gevonden. Pas je zoekterm aan.</p>';
    return;
  }
  list.forEach((s) => {
    const card = document.createElement('article');
    card.className = 'catalog-card';
    const totalSets = getQuizSets(s).length;
    card.innerHTML = `
      <header class="catalog-card__header">
        <div>
          <p class="eyebrow">Vak</p>
          <h3>${s.name}</h3>
        </div>
        <span class="chip">${totalSets} quizzen</span>
      </header>
      <p class="caption">${s.summary || ''}</p>
    `;
    const actions = document.createElement('div');
    actions.className = 'catalog-card__actions';
    const examBtn = document.createElement('button');
    examBtn.className = 'btn ghost';
    examBtn.type = 'button';
    examBtn.textContent = 'Examens';
    examBtn.addEventListener('click', () => handleSubjectNavigation(s.name, 'quiz-panel'));
    const sumBtn = document.createElement('button');
    sumBtn.className = 'btn ghost';
    sumBtn.type = 'button';
    sumBtn.textContent = 'Oefenen';
    sumBtn.addEventListener('click', () => handleSubjectNavigation(s.name, 'practice-panel'));
    const flashBtn = document.createElement('button');
    flashBtn.className = 'btn ghost';
    flashBtn.type = 'button';
    flashBtn.textContent = 'Flashcards';
    flashBtn.addEventListener('click', () => handleSubjectNavigation(s.name, 'flashcards-panel'));
    actions.append(examBtn, sumBtn);
    if (s.name === 'Individuele Fitness') {
      actions.append(flashBtn);
    }
    card.appendChild(actions);
    subjectCatalog.appendChild(card);
  });
}

subjectSearch?.addEventListener('input', () => renderHomeCatalog());
subjectSearch?.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const term = (subjectSearch?.value || '').trim().toLowerCase();
  if (!term) return;
  let targetSubject = null;
  let targetDomain = null;
  for (const s of subjects) {
    const catTitles = (s.categories || []).map((c) => c.title.toLowerCase());
    const doms = (s.examDomains || []);
    const domMatch = doms.find((d) => d.title.toLowerCase().includes(term) || (d.id || '').toLowerCase().includes(term));
    const secMatch = doms.flatMap((d) => (d.sections || []).map((sec) => ({ d, sec }))).find((x) => x.sec.title.toLowerCase().includes(term) || (x.sec.id || '').toLowerCase().includes(term));
    const inSubject = s.name.toLowerCase().includes(term) || (s.summary || '').toLowerCase().includes(term) || catTitles.some((t) => t.includes(term)) || !!domMatch || !!secMatch || getQuizSets(s).some((q) => q.title.toLowerCase().includes(term));
    if (inSubject) {
      targetSubject = s.name;
      targetDomain = secMatch ? secMatch.d.id : (domMatch ? domMatch.id : null);
      break;
    }
  }
  if (targetSubject) {
    activeExamDomain = targetDomain || null;
    handleSubjectNavigation(targetSubject, 'quiz-panel');
  }
});

if (auth) {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    progress = loadProgress();
    if (currentUser && (!userPrefs || Object.keys(userPrefs).length === 0)) {
      userPrefs = loadUserPrefs();
      if (!userPrefs.displayName) userPrefs.displayName = getUserDisplayName(currentUser);
      persistUserPrefs();
    }
    updateUserChip(user);
    renderProfile();
  });
}

syncFromHash();
render();
setActiveView(activeView);
setActivePanel(activePanel);
window.addEventListener('hashchange', () => {
  if (location.hash === lastHash) return;
  syncFromHash();
  render();
  setActiveView(activeView);
  setActivePanel(activePanel);
});
// Logo klik: terug naar Start en nav langzaam terug
const logoEl = document.querySelector('.logo');
logoEl?.addEventListener('click', () => {
  setActiveView('home');
  document.body.classList.remove('app--quizmode');
  document.body.classList.remove('app--quizmode-anim', 'app--quizmode-hidden');
  document.body.classList.add('app--returning');
  setTimeout(() => {
    document.body.classList.remove('app--returning');
  }, 3000);
});
  if (quizExit) quizExit.textContent = 'Terug naar hoofdmenu';
function loadUserPrefs() {
  try {
    const raw = localStorage.getItem(USER_PREFS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch (_) {
    return {};
  }
}

function persistUserPrefs() {
  localStorage.setItem(USER_PREFS_KEY, JSON.stringify(userPrefs || {}));
}
function getFlashcardCategories(subject) {
  // Demo/test data if subject lacks flashcards
  const base = subject?.flashcards || [];
  const testStretch = [
    {
      question: 'Standing calf stretch (lange kuitspier)',
      answer: `
        <strong>Spieren:</strong> m. gastrocnemius, secundair m. soleus.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Voor muur, handen schouderhoogte.</li>
          <li>1 voet achteruit, tippen vooruit.</li>
          <li>Achterste been gestrekt, hiel op grond.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Leun voorwaarts.</li>
          <li>Achterste been gestrekt houden.</li>
          <li>30s aanhouden.</li>
        </ul>
        <strong>Fouten:</strong> Voeten niet recht, hiel los, holle rug.
      `
    },
    {
      question: 'Soleus stretch (korte kuitspier)',
      answer: `
        <strong>Spieren:</strong> m. soleus.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Voor muur, handen schouderhoogte.</li>
          <li>Beide voeten vooruit, achterste knie licht gebogen.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Buig knieën en leun voorwaarts.</li>
          <li>Hielen op de grond.</li>
          <li>30s aanhouden.</li>
        </ul>
      `
    },
    {
      question: 'Hamstring stretch (staande vooroverbuiging)',
      answer: `
        <strong>Spieren:</strong> hamstrings.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Voeten heupbreed, knieën licht gestrekt.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Buig vanuit heupen, rug neutraal.</li>
          <li>Handen naar scheenbenen/grond.</li>
          <li>20–30s aanhouden.</li>
        </ul>
      `
    },
    {
      question: 'Quadriceps stretch (staand, enkel vastpakken)',
      answer: `
        <strong>Spieren:</strong> quadriceps femoris.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Sta rechtop, houd enkel vast achter je.</li>
          <li>Knieën bij elkaar, bekken neutraal.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Breng hiel richting bil zonder holle rug.</li>
          <li>20–30s aanhouden per zijde.</li>
        </ul>
      `
    },
    {
      question: 'Hip flexor stretch (lunge)',
      answer: `
        <strong>Spieren:</strong> iliopsoas, rectus femoris.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Lunge-stand, achterste knie op grond.</li>
          <li>Borst omhoog, bekken licht achterover kantelen.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Leun door voorste heup, voel rek aan voorkant heup.</li>
          <li>20–30s aanhouden per zijde.</li>
        </ul>
      `
    },
    {
      question: 'Adductor stretch (staand breed)',
      answer: `
        <strong>Spieren:</strong> adductoren.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Voeten breder dan heupbreed.</li>
          <li>Gewicht naar één kant, andere knie gestrekt.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Zak door heup, houd rug neutraal.</li>
          <li>20–30s aanhouden per zijde.</li>
        </ul>
      `
    },
    {
      question: 'Glute stretch (liggende figuur-4)',
      answer: `
        <strong>Spieren:</strong> gluteus maximus/piriformis.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Lig rug, kruis enkel op knie (figuur-4).</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Trek onderbeen naar borst, voel rek bil.</li>
          <li>20–30s per zijde.</li>
        </ul>
      `
    },
    {
      question: 'Lat stretch (stand, arm boven hoofd)',
      answer: `
        <strong>Spieren:</strong> latissimus dorsi.<br><br>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Arm boven hoofd, buig zijwaarts.</li>
          <li>Voel rek zijkant romp, 20–30s.</li>
        </ul>
      `
    },
    {
      question: 'Chest stretch (deurpost)',
      answer: `
        <strong>Spieren:</strong> pectoralis major/minor.<br><br>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Onderarmen tegen deurpost, stap voorwaarts.</li>
          <li>Voel rek borst, 20–30s.</li>
        </ul>
      `
    },
    {
      question: 'Triceps stretch (arm boven hoofd)',
      answer: `
        <strong>Spieren:</strong> triceps brachii.<br><br>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Hand op bovenrug, andere hand duwt elleboog.</li>
          <li>20–30s per zijde.</li>
        </ul>
      `
    },
    {
      question: 'Neck stretch (lateroflexie)',
      answer: `
        <strong>Spieren:</strong> SCM/upper traps.<br><br>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Oor naar schouder, hand geeft lichte druk.</li>
          <li>20s per zijde, rustig ademen.</li>
        </ul>
      `
    }
  ];
  testStretch.push(
    {
      question: 'Standing quadriceps stretch',
      answer: `
        <strong>Spieren:</strong> Quadriceps (m. rectus femoris e.a.).<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Sta rechtop, rug neutraal.</li>
          <li>Plooi 1 been, neem enkel vast.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Breng hiel naar zitvlak.</li>
          <li>Knieën samen.</li>
          <li>Kantel bekken (retroversie).</li>
          <li>Hou 30s aan.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Balansverlies.</li>
          <li>Wreef vastnemen.</li>
          <li>Holle rug.</li>
          <li>Knieën uit elkaar.</li>
        </ul>
        <strong>Variant:</strong> Vereenvoudiging: Steun zoeken.
      `
    },
    {
      question: 'Butterfly stretch (adductoren)',
      answer: `
        <strong>Spieren:</strong> Adductoren, pectineus, gracilis.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Ga zitten, voetzolen tegen elkaar.</li>
          <li>Neem voeten vast, rug lang.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Laat knieën richting grond zakken.</li>
          <li>Eventueel licht naar voren kantelen uit heup.</li>
          <li>Hou 30–45s aan, rustig ademen.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Ronde rug.</li>
          <li>Druk op knieën i.p.v. ontspanning.</li>
        </ul>
        <strong>Variant:</strong> Gebruik blok onder knieën voor comfort.
      `
    },
    {
      question: 'Side lunge adductor stretch',
      answer: `
        <strong>Spieren:</strong> Adductoren (lange/korte), hamstrings mediaal.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Sta breed, voeten licht naar voren.</li>
          <li>Verplaats gewicht naar 1 kant, andere knie gestrekt.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Zak door heup, voel rek binnenzijde bovenbeen.</li>
          <li>Hou 20–30s, wissel zijde.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Instorting van knie naar binnen.</li>
          <li>Holle rug of overmatige vooroverkanteling.</li>
        </ul>
        <strong>Variant:</strong> Plaats handen op steun voor balans.
      `
    },
    {
      question: 'Kneeling hip flexor stretch',
      answer: `
        <strong>Spieren:</strong> Heupbuigers (iliopsoas), rectus femoris.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Half-lunge met achterste knie op mat.</li>
          <li>Bekken licht achterover (retroversie), ribben omlaag.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Schuif heup zachtjes naar voren tot lichte rek.</li>
          <li>Hou 30s, wissel zijde.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Holle onderrug.</li>
          <li>Bekken voorover (anteversie).</li>
        </ul>
        <strong>Variant:</strong> Arm boven hoofd voor extra lengte op psoas.
      `
    },
    {
      question: 'Figuur-4 bilspier stretch (liggend)',
      answer: `
        <strong>Spieren:</strong> Bilspieren, piriformis.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Lig op rug, enkel op tegenoverliggende knie.</li>
          <li>Handen achter het onderbeen.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Trek onderbeen naar borst tot rek in bil.</li>
          <li>Hou 20–30s per zijde.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Schouders optillen.</li>
          <li>Knie naar binnen forceren.</li>
        </ul>
        <strong>Variant:</strong> Gebruik strap indien bereik beperkt is.
      `
    },
    {
      question: 'Pigeon pose (bilspier/stretch heuprotatoren)',
      answer: `
        <strong>Spieren:</strong> Gluteus maximus/medius, diepe rotatoren.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Voorste knie gebogen naar buiten, achterste been gestrekt.</li>
          <li>Heupen vierkant naar voren, steun op handen/onderarmen.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Laat rompt langzaam zakken tot rek in bil/heup.</li>
          <li>Hou 20–40s, adem rustig.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Heupen kantelen en wegdraaien.</li>
          <li>Pijnlijke compressie op knie.</li>
        </ul>
        <strong>Variant:</strong> Plaats blok onder bil voor steun.
      `
    },
    {
      question: 'Seated single-leg hamstring stretch',
      answer: `
        <strong>Spieren:</strong> Hamstrings (m. biceps femoris e.a.).<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Zit, 1 been gestrekt, andere gebogen.</li>
          <li>Rug lang, borst omhoog.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Kantel vanuit heupen naar gestrekt been.</li>
          <li>Hou 20–30s, wissel.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Ronde rug.</li>
          <li>Overdruk op knie.</li>
        </ul>
        <strong>Variant:</strong> Strap rond voet voor extra bereik.
      `
    },
    {
      question: 'Frog stretch (adductoren)',
      answer: `
        <strong>Spieren:</strong> Adductoren, binnenzijde dij.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Op handen/knieën, knieën breed, voeten in lijn.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Verplaats heup zacht naar achter tot rek.</li>
          <li>Hou 20–40s, adem rustig.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Holle onderrug.</li>
          <li>Knieën draaien naar binnen.</li>
        </ul>
        <strong>Variant:</strong> Kussen onder knieën voor comfort.
      `
    },
    {
      question: 'Standing lat stretch (tegen muur)',
      answer: `
        <strong>Spieren:</strong> Latissimus dorsi, serratus anterior.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Handen tegen muur boven hoofd, voeten heupbreed.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Zak licht door knieën en duw borst naar beneden.</li>
          <li>Voel rek zijkant romp/oksels, 20–30s.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Overmatige holle rug.</li>
          <li>Schouders optrekken.</li>
        </ul>
        <strong>Variant:</strong> 1 arm tegelijk voor focus.
      `
    },
    {
      question: 'Doorway chest stretch (90-90)',
      answer: `
        <strong>Spieren:</strong> Pectoralis major/minor.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Elleboog 90°, schouder 90°, onderarmen tegen deurpost.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Stap klein voorwaarts tot rek in borst.</li>
          <li>Hou 20–30s, niet in schouders hangen.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Holle onderrug.</li>
          <li>Schouders naar oren.</li>
        </ul>
        <strong>Variant:</strong> Enkele arm voor gerichte rek.
      `
    }
  );
  testStretch.push(
    {
      question: '16. Kneeling back & shoulder stretch (Child pose)',
      answer: `
        <strong>Spieren:</strong> Erector spinae, latissimus dorsi.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Handen- en knieënsteun.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Bekken naar hielen.</li>
          <li>Handen ver naar voor (vingers kruipen).</li>
          <li>Borst naar beneden. Hou 30s aan.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Holle rug (moet bollen/verlengen).</li>
        </ul>
        <strong>Variant:</strong> Handen naar 1 zijde (accent lats).
      `
    },
    {
      question: '17. Prone lying back extension stretch',
      answer: `
        <strong>Spieren:</strong> Rectus abdominis.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Buiklig, ellebogen onder schouders.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Lift borstkas, maak rug lang.</li>
          <li>Nek lang.</li>
          <li>Hou 30s aan.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Inzinken schouders.</li>
          <li>Hyperlordose lage rug.</li>
        </ul>
      `
    },
    {
      question: '18. Standing side bending stretch',
      answer: `
        <strong>Spieren:</strong> Schuine buikspieren, quadratus lumborum, TFL.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Sta recht, kruis voeten.</li>
          <li>Hand in lenden.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Duw bekken zijwaarts, arm over hoofd ('banaan').</li>
          <li>Lift ribbenkast. Hou 30s aan.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Foutief wegduwen.</li>
          <li>Romp/arm naar voor.</li>
        </ul>
      `
    },
    {
      question: '19. Standing pectoral wall stretch',
      answer: `
        <strong>Spieren:</strong> Pectoralis major/minor, deltoideus.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Arm 90-90 tegen muur.</li>
          <li>Rug neutraal.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Span buikspieren.</li>
          <li>Leun licht voorwaarts. Hou 30s aan.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Schouder optillen.</li>
          <li>Holle rug.</li>
        </ul>
        <strong>Variant:</strong> Gestrekte arm (biceps mee).
      `
    },
    {
      question: '20. Standing chest stretch',
      answer: `
        <strong>Spieren:</strong> Pectoralis, deltoideus.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Handen haken achter rug.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Strek armen, beweeg licht opwaarts.</li>
          <li>Schouders laag. Hou 30s aan.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Schouders optillen/naar voor.</li>
          <li>Holle rug.</li>
        </ul>
      `
    },
    {
      question: '21. Cross body shoulder stretch',
      answer: `
        <strong>Spieren:</strong> Deltoideus (achter), kapsel.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Arm gestrekt voor borst.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Trek arm naar overkant.</li>
          <li>Torso stil. Hou 30s aan.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Meedraaien romp.</li>
        </ul>
      `
    },
    {
      question: '22. Shoulder stretch (Eagle pose)',
      answer: `
        <strong>Spieren:</strong> Deltoideus (achter), trapezius, rhomboidei.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Kruis armen, verstrengel voorarmen.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Lift ellebogen lichtjes.</li>
          <li>Nek recht. Hou 30s aan.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Teveel retractie schouders.</li>
        </ul>
        <strong>Variant:</strong> Vereenvoudiging: Gewoon kruisen zonder vingers.
      `
    },
    {
      question: '23. Shoulder endorotation stretch behind back',
      answer: `
        <strong>Spieren:</strong> Exorotatoren (onderste arm).<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Handdoek achter rug (1 nek, 1 laag).</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Bovenste hand trekt onderste omhoog.</li>
          <li>Rug neutraal. Hou 30s aan.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Bovenrug bollen.</li>
        </ul>
        <strong>Variant:</strong> Vingers haken (zonder gordel).
      `
    },
    {
      question: '24. Shoulder exorotation stretch behind back',
      answer: `
        <strong>Spieren:</strong> Endorotatoren (bovenste arm), triceps.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Handdoek achter rug.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Onderste hand trekt bovenste omlaag.</li>
          <li>Rug neutraal. Hou 30s aan.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Bovenrug bollen.</li>
        </ul>
        <strong>Variant:</strong> Vingers haken (zonder gordel).
      `
    },
    {
      question: '25. Sleepersstretch',
      answer: `
        <strong>Spieren:</strong> Achterste kapsel, exorotatoren.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Zijlig, hoofd op kussen.</li>
          <li>Elleboog 90° op schouderhoogte.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Duw pols naar grond.</li>
          <li>Elleboog blijft vast. Hou 30s aan.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Geen kussen.</li>
          <li>Elleboog verschuift.</li>
          <li>Pols forceren.</li>
        </ul>
      `
    },
    {
      question: '26. Standing/kneeling triceps stretch',
      answer: `
        <strong>Spieren:</strong> Triceps, latissimus dorsi.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Arm op, hand tussen schouderbladen.</li>
          <li>Andere hand pakt elleboog.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Trek elleboog omlaag.</li>
          <li>Rug neutraal. Hou 30s aan.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Hoofd naar voor.</li>
          <li>Vingers kruipen.</li>
          <li>Holle rug.</li>
        </ul>
      `
    },
    {
      question: '27. Standing biceps stretch',
      answer: `
        <strong>Spieren:</strong> Bovenarmflexoren (biceps).<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Armen zijwaarts, palmen voor.</li>
          <li>Rug neutraal.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Draai duimen neerwaarts (pronatie).</li>
          <li>Armen achteruit. Hou 30s aan.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Schouders naar voor.</li>
          <li>Hoofd naar voor.</li>
        </ul>
      `
    },
    {
      question: '28. Standing fore arm stretch',
      answer: `
        <strong>Spieren:</strong> Voorarmflexoren, biceps.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Arm voor, pols geplooid (vingers neer).</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Trek vingers naar je toe.</li>
          <li>Spreid duim. Arm gestrekt. Hou 30s aan.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Arm gebogen.</li>
          <li>Duim niet gespreid.</li>
        </ul>
      `
    },
    {
      question: '29. Kneeling fore arm stretch',
      answer: `
        <strong>Spieren:</strong> Voorarmflexoren, biceps.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Kniezit, handen op grond.</li>
          <li>Vingers naar knieën, palm op grond.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Duw palm in grond, schuif bekken achteruit.</li>
          <li>Ellebogen gestrekt. Hou 30s aan.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Armen gebogen.</li>
          <li>Palm komt los.</li>
        </ul>
        <strong>Variant:</strong> Handrug op grond (extensoren).
      `
    },
    {
      question: '30. Standing sideways neck stretch',
      answer: `
        <strong>Spieren:</strong> Trapezius (boven), scalenus.<br><br>
        <strong>Positie:</strong>
        <ul>
          <li>Sta/zit. Hand over hoofd boven oor.</li>
          <li>Romp aan.</li>
        </ul>
        <strong>Uitvoering:</strong>
        <ul>
          <li>Kantel hoofd zijwaarts.</li>
          <li>Reik met vrije hand neerwaarts.</li>
          <li>Hou 30s aan.</li>
        </ul>
        <strong>Fouten:</strong>
        <ul>
          <li>Schouder op.</li>
          <li>Flexie i.p.v. lateroflexie.</li>
        </ul>
        <strong>Variant:</strong> Hoofd draaien (Levator Scapulae).
      `
    }
  );
  if (testStretch.length > 30) {
    testStretch.splice(0, testStretch.length - 30);
  }
  const machinesData = [
    { titel: 'Abdominal crunch machine', spieren: 'M. rectus abdominis (primair), m. obliquus (secundair).', positie: '- Schoudersteunen comfortabel over schouders.<br>- Voeten op steunen.<br>- Buig voorwaarts vanuit de romp.', uitvoering: '- Duw schoudersteunen omlaag vanuit buikspieren (niet trekken met armen).<br>- Romp stabiliseren.<br>- Kijk voorwaarts.', fouten: '- Loskomen van schoudersteunen.<br>- Beweging vanuit armen.<br>- Nek overstrekken of te diep buigen.' },
    { titel: 'Rotary torso machine', spieren: 'M. obliquus externus en internus.', positie: '- Stel draaihoek in.<br>- Knieën en bekken gefixeerd tegen steunkussens.<br>- Schoudersteunen tegen schouders.', uitvoering: '- Roteer de romp naar het midden/overkant.<br>- Bekken en knieën blijven stil.', fouten: '- Compenseren met benen.<br>- Trekken met handen i.p.v. romp.' },
    { titel: 'Back extension (Roman chair)', spieren: 'M. erector spinae, m. multifidi.', positie: '- Bekken net over het steunkussen (heup moet vrij kunnen buigen).<br>- Kruis handen voor borst.', uitvoering: '- Buig vanuit de heup met rechte rug naar voor.<br>- Keer terug tot neutrale positie (één lijn).', fouten: '- Bolle rug.<br>- Hyperextensie (te ver terugkeren, holle rug).<br>- Steunkussen te hoog.' },
    { titel: 'Seated leg press', spieren: 'Quadriceps, hamstrings, gluteus maximus.', positie: '- Voeten op schouderbreedte op platform.<br>- Kniehoek net geen 90 graden bij start.<br>- Rug tegen kussen.', uitvoering: '- Duw weg vanuit hielen.<br>- Strek benen (niet volledig in slot).<br>- Keer terug tot 90 graden.', fouten: '- Knieën overstrekken (slot).<br>- Hielen los van platform.<br>- Knieën naar binnen knikken.' },
    { titel: 'Seated leg extension', spieren: 'Quadriceps.', positie: '- Rotatieas knie gelijk aan rotatieas toestel.<br>- Rolkussen op enkelplooi.<br>- Rug tegen leuning.', uitvoering: '- Strek benen gecontroleerd opwaarts.<br>- Tenen opwaarts trekken.', fouten: '- Trappende beweging.<br>- Loskomen onderrug.<br>- Rolkussen op scheenbeen.' },
    { titel: 'Seated leg curl', spieren: 'Hamstrings.', positie: '- Rotatieas knie gelijk aan toestel.<br>- Bovenste rolkussen klemt boven knie.<br>- Onderste kussen op achillespees.', uitvoering: '- Buig benen omlaag tot volledige flexie.<br>- Keer rustig terug.', fouten: '- Hyperlordose (holle rug).<br>- Verkeerde uitlijning knie.' },
    { titel: 'Adductor machine', spieren: 'Adductoren (longus, brevis, magnus), pectineus.', positie: '- Voeten op steunen, binnenkant knie tegen kussens.<br>- Startpositie zo wijd mogelijk (comfortabel).', uitvoering: '- Duw benen naar elkaar toe.<br>- Keer gecontroleerd terug.', fouten: '- Te kleine bewegingsuitslag.<br>- Bolle rug.' },
    { titel: 'Abductor machine', spieren: 'Gluteus medius/minimus, piriformis.', positie: '- Buitenkant knie tegen kussens.<br>- Benen gesloten bij start.', uitvoering: '- Duw benen buitenwaarts (maximaal).', fouten: '- Duwen vanuit voeten i.p.v. knieën.<br>- Bolle rug.' },
    { titel: 'Gluteus machine', spieren: 'Gluteus maximus.', positie: '- Steunkussen op heuphoogte.<br>- Buik en borst tegen steun.<br>- Rolkussen tegen achterkant dijbeen.', uitvoering: '- Breng been gestrekt achterwaarts/opwaarts.', fouten: '- Holle rug trekken.<br>- Heup overstrekken.<br>- Bekken open draaien.' },
    { titel: 'Seated calf raise (op leg press)', spieren: 'Gastrocnemius, soleus.', positie: '- Benen gestrekt (lichte buiging).<br>- Voorvoeten op rand platform.', uitvoering: '- Duw hielen weg (plantair flexie).<br>- Laat hielen zakken tot evenwijdig.', fouten: '- Te ver terugkeren (overbelasting achillespees).<br>- Knieën buigen tijdens beweging.' },
    { titel: 'Chest press', spieren: 'Pectoralis major, triceps brachii.', positie: '- Handgrepen op borsthoogte (tepellijn).<br>- Voeten stabiel.<br>- Rug tegen kussen.', uitvoering: '- Duw uit tot gestrekte armen (ellebogen onder schouderhoogte).<br>- Keer terug tot vuist afstand van borst.', fouten: '- Boven schouderhoogte duwen.<br>- Te ver naar achteren (overstrekking).<br>- Rug bollen.' },
    { titel: 'Pectoral fly machine (Pec-deck)', spieren: 'Pectoralis major.', positie: '- Ellebogen/handen op borsthoogte.<br>- 90 graden hoek (indien gebogen versie).', uitvoering: '- Breng armen naar elkaar toe voor de borst.<br>- Keer gecontroleerd terug (niet voorbij schouderlijn).', fouten: '- Ellebogen los van kussen.<br>- Overstrekking schouder.<br>- Hoofd naar voor.' },
    { titel: 'Vertical traction', spieren: 'Latissimus dorsi, teres major, trapezius.', positie: '- Stoelhoogte: vingertoppen aan grepen.<br>- Borst tegen steun.', uitvoering: '- Trek omlaag met brede ellebogen tot schouderhoogte.<br>- Keer rustig terug.', fouten: '- Asymmetrisch trekken.<br>- Te ver doortrekken (schouder kantelt).' },
    { titel: 'Lat machine (Front pull down)', spieren: 'Latissimus dorsi, teres major.', positie: '- Knieën klem onder rolkussens.<br>- Brede greep.<br>- Leun iets achterover.', uitvoering: '- Trek stang naar bovenkant borst.<br>- Ellebogen wijzen omlaag/buiten.', fouten: '- Stang in nek trekken.<br>- Te ver achterover hangen.' },
    { titel: 'Pull up assist machine', spieren: 'Latissimus dorsi, biceps.', positie: '- Kniel op platform.<br>- Brede greep (rug focus) of smal (biceps).', uitvoering: '- Trek op tot kin boven grepen is.<br>- Ellebogen breed.', fouten: '- Voeten los van platform.<br>- Holle rug.' },
    { titel: 'Upper back machine', spieren: 'Trapezius (transversus), rhomboidei.', positie: '- Borst tegen steun.<br>- Grepen op borsthoogte.', uitvoering: '- Trek naar achter (retractie schouderbladen).<br>- Ellebogen breed.', fouten: '- Borst los van steun.<br>- Schouders optrekken.' },
    { titel: 'Low row', spieren: 'Latissimus dorsi, teres major.', positie: '- Borst tegen steun.<br>- Neutrale greep.', uitvoering: '- Trek naar buik met smalle ellebogen langs lichaam.', fouten: '- Ellebogen breed (foutief).<br>- Borst los van steun.' },
    { titel: 'Shoulder press machine', spieren: 'Deltoideus (voor/zij), supraspinatus.', positie: '- Handgrepen op schouderhoogte.<br>- Rug tegen steun.', uitvoering: '- Duw verticaal omhoog.<br>- Ellebogen blijven breed.', fouten: '- Holle rug.<br>- Handen smaller dan ellebogen.' },
    { titel: 'Arm curl machine (Biceps)', spieren: 'Biceps brachii.', positie: '- Rotatieas elleboog gelijk aan toestel.<br>- Ellebogen op kussen.', uitvoering: '- Buig armen naar schouders.<br>- Keer terug (niet overstrekken).', fouten: '- Polsen plooien.<br>- Romp bewegen.' },
    { titel: 'Triceps extension machine', spieren: 'Triceps brachii.', positie: '- Ellebogen smal naast lenden.', uitvoering: '- Strek armen volledig uit.<br>- Keer terug tot 90 graden.', fouten: '- Ellebogen naar buiten.<br>- Niet simultaan strekken.' },
    { titel: 'Dip assist machine', spieren: 'Triceps brachii, pectoralis.', positie: '- Smalle greep (triceps) of breed (borst).<br>- Kniel op platform.', uitvoering: '- Duw omlaag, ellebogen naar achteren (triceps).', fouten: '- Ellebogen naar buiten (bij triceps focus).<br>- Te diep zakken.' }
  ];
  function toList(str) {
    const items = String(str || '').split(/<br>|\n/).map((s) => s.replace(/^\s*-\s*/, '').trim()).filter((s) => s.length);
    return `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
  }
  function stripCites(str) {
    return String(str || '').replace(/\[cite_start\]/g, '').replace(/\[cite:[^\]]+\]/g, '').trim();
  }
  const machinesCards = machinesData.map((d) => ({
    frontTitle: d.titel,
    back: `
      <strong>Spieren:</strong> ${d.spieren}<br><br>
      <strong>Positie:</strong>
      ${toList(d.positie)}
      <strong>Uitvoering:</strong>
      ${toList(d.uitvoering)}
      <strong>Fouten:</strong>
      ${toList(d.fouten)}
      ${d.variant ? `<strong>Variant:</strong> ${d.variant}` : ''}
    `
  }));
  const freeWeightsData = [
    { titel: 'Squat (Bodyweight / Dumbbell / Barbell)', spieren: 'Quadriceps, hamstrings, gluteus maximus[cite: 955, 1030, 1038].', positie: '- Voeten schouderbreedte.<br>- Rug neutraal (lichte lordose).<br>- Barbell op trapezius (indien barbell).', uitvoering: '- Zak door knieën (billen naar achter).<br>- Knieën niet voorbij tenen.<br>- Dijbenen parallel aan vloer.', fouten: '- Bolle rug.<br>- Knieën naar binnen.<br>- Hielen van de grond.' },
    { titel: 'Lunge (Front / Walking)', spieren: 'Quadriceps, hamstrings, gluteus[cite: 970, 1034, 1042].', positie: '- Rechtop, voeten heupbreedte.<br>- Dumbbells langs lichaam of barbell in nek.', uitvoering: '- Grote uitvalspas.<br>- Beide knieën naar 90 graden.<br>- Romp rechtop houden.', fouten: '- Voorste knie voorbij tenen.<br>- Romp naar voren.<br>- Voeten op één lijn (balans).' },
    { titel: 'Barbell Straight Leg Deadlift (Hinge)', spieren: 'Hamstrings, gluteus, erector spinae[cite: 1046].', positie: '- Lichte kniebuiging (slot eraf).<br>- Rug recht.', uitvoering: '- Buig vanuit heup naar voren.<br>- Barbell langs benen laten zakken.<br>- Rug blijft recht.', fouten: '- Bolle rug (gevaarlijk!).<br>- Knieën te veel buigen.<br>- Barbell te ver van lichaam.' },
    { titel: 'Standing Calf Raise (Dumbbell / Cable / Barbell)', spieren: 'Gastrocnemius, soleus[cite: 1026, 1036, 1048].', positie: '- Voorvoeten op verhoog.<br>- Benen gestrekt.', uitvoering: '- Hielen zakken diep.<br>- Krachtig uitduwen op tenen.', fouten: '- Knieën buigen.<br>- Veren.' },
    { titel: 'Push-up', spieren: 'Pectoralis major, triceps[cite: 1058].', positie: '- Plankhouding, handen breder dan schouders.', uitvoering: '- Zakken tot borst vuist van grond is.<br>- Ellebogen 45 gr t.o.v. romp.', fouten: '- Holle rug.<br>- Ellebogen te breed (T-vorm).' },
    { titel: "Cable Standing Fly's (Crossover)", spieren: 'Pectoralis major[cite: 1074].', positie: '- Uitvalspas.<br>- Armen licht gebogen.', uitvoering: '- Trek handen naar elkaar toe voor de borst.<br>- Romp stil houden.', fouten: '- Handen te ver naar achter (schouderstress).<br>- Ellebogen strekken.' },
    { titel: 'Dumbbell / Barbell Bench Press', spieren: 'Pectoralis major, triceps[cite: 1078, 1084].', positie: '- Ruglig op bank.<br>- Voeten stabiel.', uitvoering: '- Zakken tot borsthoogte (of vuist erboven).<br>- Uitduwen.', fouten: "- Holle rug.<br>- 'Guillotine' (stang naar nek).<br>- Asymmetrisch duwen." },
    { titel: "Dumbbell Fly's", spieren: 'Pectoralis major[cite: 1082].', positie: '- Ruglig.<br>- Armen licht gebogen boven borst.', uitvoering: '- Openen tot schouderhoogte.<br>- Sluiten (omhelsbeweging).', fouten: '- Ellebogen strekken.<br>- Te diep zakken.' },
    { titel: 'Barbell Pullover', spieren: 'Pectoralis major, latissimus dorsi[cite: 1086].', positie: '- Ruglig.<br>- Barbell boven borst.', uitvoering: '- Barbell met licht gebogen armen achter hoofd brengen.<br>- Terugkeren.', fouten: '- Holle rug trekken.<br>- Ellebogen plooien/strekken.' },
    { titel: 'Pull-up / Chin-up', spieren: 'Latissimus dorsi (pull-up) / Biceps (chin-up)[cite: 1092, 1093].', positie: '- Hangend aan stang.', uitvoering: '- Optrekken tot kin boven stang.<br>- Gecontroleerd zakken.', fouten: '- Zwaaien met benen.<br>- Holle rug.' },
    { titel: 'Cable Seated Row', spieren: 'Latissimus dorsi, rhomboidei[cite: 1101].', positie: '- Zittend op grond/bank.<br>- Benen licht gebogen.', uitvoering: '- Trek greep naar buik.<br>- Ellebogen smal langs lichaam.', fouten: '- Achterover leunen.<br>- Schouders optrekken.' },
    { titel: 'Bentover Row (Dumbbell / Barbell)', spieren: 'Latissimus dorsi, trapezius[cite: 1103, 1108].', positie: '- Voorovergebogen (rechte rug!).<br>- Knieën licht gebogen.', uitvoering: '- Trek gewicht naar heup/buik.<br>- Ellebogen langs lichaam.', fouten: '- Bolle rug.<br>- Roteren vanuit romp.<br>- Nek overstrekken.' },
    { titel: 'Shrugs (Dumbbell / Barbell)', spieren: 'Trapezius (bovenkant)[cite: 1104].', positie: '- Staand, gewichten in hand.', uitvoering: '- Schouders optrekken richting oren.<br>- Rustig zakken.', fouten: '- Rollen met schouders.<br>- Ellebogen plooien.' },
    { titel: 'Dumbbell Lying Rear Delt Raise/Row', spieren: 'Achterkant schouder, bovenrug[cite: 1105].', positie: '- Buiklig op bankje.', uitvoering: '- Gewichten zijwaarts (raise) of omhoog (row) trekken.', fouten: '- Borst los van bankje.<br>- Hoofd optillen.' },
    { titel: 'Upright Row (Barbell)', spieren: 'Trapezius, deltoideus[cite: 1110].', positie: '- Staand, smalle greep.', uitvoering: '- Trek stang langs lichaam omhoog tot kin.<br>- Ellebogen hoog.', fouten: '- Ellebogen lager dan polsen.<br>- Zwaaien.' },
    { titel: 'Tube Exorotation / Endorotation', spieren: 'Rotator cuff (Infraspinatus / Subscapularis)[cite: 1116].', positie: '- Elleboog 90 graden in zij.', uitvoering: '- Draai onderarm naar buiten of binnen.', fouten: '- Elleboog los van zij.<br>- Romp meedraaien.' },
    { titel: 'Side Raise (Cable / Dumbbell)', spieren: 'Deltoideus (zijkant)[cite: 1119, 1121].', positie: '- Staand.', uitvoering: '- Armen zijwaarts heffen tot schouderhoogte.<br>- Lichte buiging elleboog.', fouten: '- Boven schouderhoogte.<br>- Zwaaien.' },
    { titel: 'Front Raise (Cable / Dumbbell / Barbell)', spieren: 'Deltoideus (voorkant)[cite: 1123, 1125].', positie: '- Staand.', uitvoering: '- Armen voorwaarts heffen tot schouderhoogte.', fouten: '- Achterover leunen.<br>- Armen volledig strekken.' },
    { titel: 'Shoulder Press (Dumbbell / Barbell)', spieren: 'Deltoideus[cite: 1120, 1126].', positie: '- Zittend of staand.<br>- Gewicht op schouderhoogte.', uitvoering: '- Uitduwen tot boven hoofd.<br>- Rug recht.', fouten: '- Holle rug.<br>- Gewicht te ver naar achteren.' },
    { titel: 'Biceps Curl (Cable / Dumbbell / Barbell)', spieren: 'Biceps brachii[cite: 1133, 1134, 1142].', positie: '- Staand.<br>- Ellebogen in de zij.', uitvoering: '- Buigen onderarmen.<br>- Ellebogen blijven vast.', fouten: '- Zwaaien met rug.<br>- Ellebogen naar voren.' },
    { titel: 'Hammer Curl', spieren: 'Brachioradialis, brachialis[cite: 1136].', positie: '- Neutrale greep (duim omhoog).', uitvoering: '- Buigen als een hamer.', fouten: '- Zie biceps curl.' },
    { titel: 'Scott / Preacher Curl', spieren: 'Biceps brachii[cite: 1137, 1143].', positie: '- Armen rusten op bankje.', uitvoering: '- Geïsoleerd buigen.', fouten: '- Loskomen van bankje.<br>- Polsen plooien.' },
    { titel: 'Cable Push Down', spieren: 'Triceps brachii[cite: 1148].', positie: '- Staand voor kabel.<br>- Ellebogen in de zij.', uitvoering: '- Duw stang/touw omlaag.', fouten: '- Ellebogen los van zij.<br>- Polsen plooien.' },
    { titel: 'Overhead Extension (Cable / Dumbbell)', spieren: 'Triceps brachii[cite: 1150, 1152].', positie: '- Armen boven hoofd.', uitvoering: '- Gewicht achter hoofd laten zakken.<br>- Uitstrekken.', fouten: '- Ellebogen te ver naar buiten.<br>- Holle rug.' },
    { titel: 'Kickback (Dumbbell)', spieren: 'Triceps brachii[cite: 1154].', positie: '- Voorovergebogen.<br>- Bovenarm langs romp.', uitvoering: '- Onderarm uitstrekken naar achter.', fouten: '- Bovenarm zakt naar beneden.<br>- Zwaaien.' },
    { titel: 'Skull Crusher / French Press (Barbell)', spieren: 'Triceps brachii[cite: 1155, 1157].', positie: '- Ruglig.<br>- Barbell boven borst/hoofd.', uitvoering: '- Stang naar voorhoofd laten zakken.<br>- Uitduwen.', fouten: '- Ellebogen naar buiten.<br>- Beweging vanuit schouder.' },
    { titel: 'Wrist Curl (Barbell)', spieren: 'Voorarmflexoren/extensoren[cite: 1160].', positie: '- Onderarmen op bankje.', uitvoering: '- Polsen buigen en strekken.', fouten: '- Voorarmen los van bankje.<br>- Te wild.' }
  ];
  const freeWeightsCards = freeWeightsData.map((d) => ({
    frontTitle: d.titel,
    back: `
      <strong>Spieren:</strong> ${stripCites(d.spieren)}<br><br>
      <strong>Positie:</strong>
      ${toList(d.positie)}
      <strong>Uitvoering:</strong>
      ${toList(d.uitvoering)}
      <strong>Fouten:</strong>
      ${toList(d.fouten)}
    `
  }));
  const coreData = [
    { titel: 'Lage front plank (Front bridge) [cite: 534]', spieren: 'Primair: m. rectus abdominis, heupbuigers.<br>Secundair: obliques, transversus.', positie: '- Ellebogen loodrecht onder schouders.<br>- Voorarmen plat op de grond.<br>- Start op knieën.', uitvoering: '- Til lichaam op tot plank (steun op ellebogen/tenen).<br>- Lichaam in 1 lijn.<br>- Kantel bekken (retroversie): span bil- en buikspieren aan.', fouten: '- Doorhangen onderrug (hyperlordose).<br>- Bekken te hoog.<br>- Hoofd niet in 1 lijn.<br>- Ellebogen te ver naar voor.' },
    { titel: 'Hoge front plank [cite: 550]', spieren: 'Primair: m. rectus abdominis, heupbuigers.<br>Secundair: triceps, schouderspieren.', positie: '- Handen onder schouders (vingers naar voor).<br>- Start op handen en knieën.', uitvoering: '- Duw lichaam omhoog tot plank op handen en voeten.<br>- Lichaam in 1 lijn.<br>- Span buik- en bilspieren actief aan.', fouten: '- Doorhangen onderrug.<br>- Bekken te hoog.<br>- Handen te ver naar voor (voorbij schouders).' },
    { titel: 'Zijwaartse plank (Side bridge) [cite: 562]', spieren: 'Focus: m. quadratus lumborum.<br>Secundair: obliques (schuine buikspieren).', positie: '- Zijlig, voeten op elkaar.<br>- Elleboog loodrecht onder schouder.<br>- Hand op heup.', uitvoering: '- Duw bekken omhoog (lichaam in 1 lijn).<br>- Open borstkas, schouders boven elkaar.<br>- Heupen naar voor duwen.', fouten: '- Lichaam niet in 1 lijn (voeten te ver naar voor/achter).<br>- Schouders niet boven elkaar.<br>- Doorzakken van bekken.' },
    { titel: 'Supine bridge (Glute bridge) [cite: 577]', spieren: 'Focus: m. gluteus maximus, erector spinae.<br>Secundair: hamstrings.', positie: '- Ruglig, voeten plat op grond dicht bij zitvlak (heupbreedte).<br>- Armen 45 graden naast lichaam.', uitvoering: '- Kantel bekken (retroversie).<br>- Duw bekken omhoog tot knie-heup-schouder in 1 lijn zijn.', fouten: '- Geen bekkenkanteling (holle rug).<br>- Voeten te ver weg (hamstring dominantie).<br>- Voeten niet op schouderbreedte.' },
    { titel: 'Omgekeerde tafelpositie [cite: 590]', spieren: 'Focus: Rugstrekkers, gluteus maximus, hamstrings.<br>Stretch: Pectoralis, voorste schouder.', positie: '- Zit op zitvlak, handen naast zitvlak (vingers naar voor).<br>- Voeten plat op grond.', uitvoering: '- Lift zitvlak, span bil/romp aan.<br>- Duw heupen omhoog tot tafelpositie.<br>- Rechte lijn knie-heup-schouder-hoofd.', fouten: '- Hyperlordose onderrug.<br>- Hoofd gebogen (niet in lijn).<br>- Oneven heuphoogte.' },
    { titel: 'Bird dog [cite: 602]', spieren: 'Focus: m. erector spinae, gluteus maximus.<br>Secundair: armstrekkers.', positie: '- Handen- en knieënsteun (handen onder schouders, knieën onder heup).<br>- Rug neutraal.', uitvoering: '- Strek diagonaal arm en been uit tot in verlengde van wervelzuil.<br>- Duim wijst omhoog.<br>- Rug blijft stabiel (geen beweging).', fouten: '- Starten met holle/bolle rug.<br>- Arm/been te hoog liften (holle rug).<br>- Knieën/handen niet goed geplaatst.' },
    { titel: 'Side plank abduction on knee [cite: 618]', spieren: 'Focus: Gluteus medius/minimus, QL.<br>Secundair: schuine buikspieren.', positie: '- Zijlig, steun op elleboog en knie.<br>- Elleboog loodrecht onder schouder.', uitvoering: '- Duw op tot zijwaartse plank op knie.<br>- Strek heup naar voor.<br>- Lift bovenste been gestrekt op (abductie).', fouten: '- Heupstartpositie fout (meteen op 1 lijn).<br>- Hyperlordose bij strekken.<br>- Borstkas niet open.<br>- Bekken zakt in.' },
    { titel: 'Prone cobra (Back extension) [cite: 634]', spieren: 'Focus: m. erector spinae, gluteus maximus.', positie: '- Buiklig, armen naast lichaam (handpalmen naar grond).<br>- Voorhoofd op mat.', uitvoering: '- Activeer bil/buik (retroversie).<br>- Retractie schouderbladen.<br>- Lift borst en hoofd, roteer duimen omhoog.', fouten: '- Hyperlordose onderrug.<br>- Hyperextensie nek.<br>- Handpalmen blijven omlaag.' },
    { titel: 'Dead bug [cite: 644]', spieren: 'Focus: m. rectus abdominis, transversus abdominis.', positie: '- Ruglig, armen gestrekt omhoog.<br>- Heupen en knieën 90 graden.<br>- Onderrug neutraal.', uitvoering: '- Laat tegenoverliggende arm en been gecontroleerd zakken.<br>- Druk onderrug licht in mat.<br>- Keer terug en wissel.', fouten: '- Holle rug.<br>- Bekken kantelt.<br>- Snelle, ongecontroleerde beweging.' },
    { titel: 'Curl up (McGill) [cite: 657]', spieren: 'Focus: m. rectus abdominis.', positie: '- Ruglig, één knie gebogen, andere gestrekt.<br>- Handen onder onderrug (neutrale lordose).<br>- Hoofd in verlengde van wervelzuil.', uitvoering: '- Breng schouders licht van mat (mini-crunch).<br>- Houd nek neutraal.<br>- Pauzeer en zak gecontroleerd terug.', fouten: '- Trekken aan nek.<br>- Te hoog liften.<br>- Onderrug platdrukken.' },
    { titel: 'Crossover curl up [cite: 671]', spieren: 'Focus: m. rectus abdominis, obliques.', positie: '- Ruglig, knie gebogen.<br>- Handen achter oren of gekruist voor borst.', uitvoering: '- Breng tegenoverliggende elleboog richting knie met lichte rotatie.<br>- Controleer ademhaling.<br>- Keer terug en wissel.', fouten: '- Trekken aan nek.<br>- Bekken meedraaien.<br>- Te snelle rotatie.' },
    { titel: 'Mountain climber [cite: 685]', spieren: 'Focus: m. rectus abdominis, heupbuigers.<br>Secundair: schouders.', positie: '- Hoge plank op handen.<br>- Handen onder schouders.<br>- Lichaam in één lijn.', uitvoering: '- Breng afwisselend knieën richting borst in tempo.<br>- Romp stabiel.<br>- Adem gecontroleerd.', fouten: '- Doorhangen onderrug.<br>- Bekken draaien.<br>- Voeten springen wijd.' },
    { titel: 'Russian twist [cite: 699]', spieren: 'Focus: obliques, rectus abdominis.', positie: '- Zit, romp licht achterover.<br>- Voeten op grond of opgetild.<br>- Borst open.', uitvoering: '- Rotatie links/rechts met handen of gewicht.<br>- Heupen stil.<br>- Blik volgt handen.', fouten: '- Bolle rug.<br>- Alleen armen bewegen.<br>- Te diep achterover.' },
    { titel: 'Clam shells [cite: 709]', spieren: 'Focus: gluteus medius/minimus.', positie: '- Zijlig, heupen gestapeld.<br>- Knieën 90 graden.<br>- Hielen op elkaar.', uitvoering: '- Open bovenste knie (abductie/externe rotatie) zonder bekken te kantelen.<br>- Pauze en sluit gecontroleerd.', fouten: '- Bekken rollen achterover.<br>- Hielen los.<br>- Romp meebewegen.' },
    { titel: 'Side lying adductor raise [cite: 722]', spieren: 'Focus: adductoren (longus, brevis, gracilis).', positie: '- Zijlig.<br>- Onderste been gestrekt.<br>- Bovenste been gebogen en voor lichaam gesteund.', uitvoering: '- Lift onderbeen recht omhoog.<br>- Houd romp stil.<br>- Controleer neerwaartse fase.', fouten: '- Rotatie romp.<br>- Heupen niet gestapeld.<br>- Te ver omhoog zwaaien.' }
  ];
  const coreCards = coreData.map((d) => ({
    frontTitle: stripCites(d.titel),
    back: `
      <strong>Spieren:</strong> ${stripCites(d.spieren)}<br><br>
      <strong>Positie:</strong>
      ${toList(d.positie)}
      <strong>Uitvoering:</strong>
      ${toList(d.uitvoering)}
      <strong>Fouten:</strong>
      ${toList(d.fouten)}
    `
  }));
  const cardioData = [
    { titel: 'Algemene richtlijnen Cardio (ACSM)', spieren: 'Cardiovasculair systeem.', positie: 'Richtlijnen voor modale klant[cite: 1168].', uitvoering: '- Frequentie: 3 à 5 keer per week [cite: 1168][cite_start].<br>- Intensiteit: 60 tot 90% van het maximum [cite: 1168][cite_start].<br>- Tijd: 20 tot 60 min continue arbeid [cite: 1168][cite_start].<br>- Type: Grote spiergroepen, aerobe energielevering[cite: 1168].', fouten: 'N.v.t.' },
    { titel: 'Ligfietsergometer (Recumbent Bike)', spieren: 'Benen, Cardio.', positie: '- Stoelafstand: bij gestrekt been nog lichte buiging (5° flexie) in knie [cite: 1169][cite_start].<br>- Controleer na 1-2 omwentelingen [cite: 1169][cite_start].<br>- Span voetriempjes aan[cite: 1169].', uitvoering: '- Optimaal ritme: 70 à 80 RPM (rotaties per minuut) [cite: 1169][cite_start].<br>- Handvaten naast je vastnemen [cite: 1169][cite_start].<br>- Kijk ontspannen vooruit[cite: 1169].', fouten: '- Stoel te dicht (knie te gebogen) [cite: 1169][cite_start].<br>- Stoel te ver (knie overstrekt) [cite: 1169][cite_start].<br>- Cervicale hyperextensie (naar TV kijken)[cite: 1169].' },
    { titel: 'Fietsergometer (Upright Bike)', spieren: 'Benen, Cardio.', positie: '- Zadelhoogte: bij gestrekt been nog lichte buiging (5° flexie) in knie [cite: 1170][cite_start].<br>- Bekken mag niet dansen op zadel (te hoog) [cite: 1170][cite_start].<br>- Span voetriempjes aan[cite: 1170].', uitvoering: '- Optimaal ritme: 70 à 80 RPM [cite: 1170][cite_start].<br>- Handvaten vastnemen, kijk vooruit[cite: 1170].', fouten: '- Zadel te laag (knie te gebogen) [cite: 1170][cite_start].<br>- Zadel te hoog (overstrekking, bekken danst) [cite: 1170][cite_start].<br>- Cervicale hyperextensie[cite: 1170].' },
    { titel: 'Armergometer', spieren: 'Bovenlichaam, Armen, Cardio.', positie: '- As net onder schouderhoogte [cite: 1171][cite_start].<br>- Afstand: op verste punt nog 5° flexie in elleboog [cite: 1171][cite_start].<br>- Handvaten 45° naar binnen gedraaid (pronatie)[cite: 1171].', uitvoering: '- Optimaal ritme: 50 à 60 RPM [cite: 1171][cite_start].<br>- Kijk recht vooruit[cite: 1171].', fouten: '- Stoel te dicht (te gebogen) of te ver (overstrekt) [cite: 1171][cite_start].<br>- Boven schouderhoogte werken [cite: 1171][cite_start].<br>- Cervicale hyperextensie[cite: 1171].' },
    { titel: 'Crossover / Schaatser', spieren: 'Benen (abductoren/adductoren), Cardio.', positie: '- Voeten vooraan in midden van voetplatformen[cite: 1172].', uitvoering: '- Duw been zijwaarts naar buiten, ander been volgt binnenwaarts [cite: 1172][cite_start].<br>- Armen volgen gekruist [cite: 1172][cite_start].<br>- Optimaal ritme: 110 à 120 SPM (steps per minute)[cite: 1172].', fouten: '- Krampachtig binnenwaarts trekken [cite: 1172][cite_start].<br>- Bekken te veel fixeren [cite: 1172][cite_start].<br>- Trekken aan armen [cite: 1172][cite_start].<br>- Te traag of te grote amplitude[cite: 1172].' },
    { titel: 'Crosstrainer (Synchro)', spieren: 'Full Body, Cardio.', positie: '- Voeten vooraan in midden van platformen[cite: 1173].', uitvoering: '- Gewicht naar voor op 1 been om te starten [cite: 1173][cite_start].<br>- Voetpunt en knie recht vooruit [cite: 1173][cite_start].<br>- Armen volgen gekruist [cite: 1173][cite_start].<br>- Optimaal ritme: 110 à 120 SPM[cite: 1173].', fouten: '- Achteruit crossen [cite: 1173][cite_start].<br>- Cervicale hyperextensie [cite: 1173][cite_start].<br>- Knieën naar binnen knikken[cite: 1173].' },
    { titel: 'Vario', spieren: 'Full Body, Cardio.', positie: '- Voeten vooraan in midden van platformen[cite: 1174].', uitvoering: 'Kies variatie[cite: 1174]:<br>1. Stepping (trap).<br>2. Normale crossing.<br>3. [cite_start]Long strides (grote amplitude).<br>- Optimaal ritme: 110 à 120 SPM[cite: 1174].', fouten: '- Achteruit crossen [cite: 1174][cite_start].<br>- Knieën naar binnen knikken [cite: 1174][cite_start].<br>- Krampachtig steunen/hangen (bij stepping) [cite: 1174][cite_start].<br>- Te traag/te grote amplitude (end of motion raken)[cite: 1174].' },
    { titel: 'Roeiergometer', spieren: 'Rug, Benen, Biceps, Cardio.', positie: '- Weerstand: Witte zone (level 1-10) voor cardio [cite: 1175][cite_start].<br>- Voeten vast, riempjes aan [cite: 1175][cite_start].<br>- Stang in kneukelgreep[cite: 1175].', uitvoering: 'Coördinatie[cite: 1175]:<br>1. Duw benen (strekken).<br>2. Trek stang naar navel (armen buigen).<br>3. Armen terug strekken.<br>4. [cite_start]Benen terug buigen.<br>- Ritme: 28 à 30 slagen/min[cite: 1175].', fouten: '- Rug niet rechtop (achterover leunen) [cite: 1175][cite_start].<br>- Stang naar borst trekken i.p.v. navel [cite: 1175][cite_start].<br>- Foutieve volgorde/coördinatie [cite: 1175][cite_start].<br>- Werken op powerstand (rood) voor cardio[cite: 1175].' },
    { titel: 'Loopband', spieren: 'Benen, Cardio.', positie: '- Safety wasknijper bevestigen[cite: 1176].', uitvoering: '- Start traag (wandelen) [cite: 1176][cite_start].<br>- Gekruiste arminzet [cite: 1176][cite_start].<br>- Loop op eerste 2/3de van band [cite: 1176][cite_start].<br>- Knieën en voeten recht vooruit[cite: 1176].', fouten: '- Knieën naar binnen knikken [cite: 1176][cite_start].<br>- Voeten draaien [cite: 1176][cite_start].<br>- Lopen zonder arminzet [cite: 1176][cite_start].<br>- Op laatste deel band lopen[cite: 1176].' },
    { titel: 'Stairclimber (Trappenloper)', spieren: 'Benen, Bilspieren, Cardio.', positie: '- Start traag [cite: 1177][cite_start].<br>- Voeten recht vooruit[cite: 1177].', uitvoering: '- Blijf hoog op de trappen (hoogste 2-3 treden) [cite: 1177][cite_start].<br>- Handsteunen vast of los (uitdaging)[cite: 1177].', fouten: '- Knieën naar binnen knikken [cite: 1177][cite_start].<br>- Voeten draaien [cite: 1177][cite_start].<br>- Te laag zakken (gevaar voor struikelen)[cite: 1177].' }
  ];
  const cardioCards = cardioData.map((d) => ({
    frontTitle: stripCites(d.titel),
    back: `
      <strong>Spieren:</strong> ${stripCites(d.spieren)}<br><br>
      <strong>Positie:</strong>
      ${toList(stripCites(d.positie))}
      <strong>Uitvoering:</strong>
      ${toList(stripCites(d.uitvoering))}
      <strong>Fouten:</strong>
      ${toList(stripCites(d.fouten))}
    `
  }));

  function normalizeTitle(s = '') {
    return stripCites(String(s)).toLowerCase().replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  }
  function titleIncludes(cardTitle, target) {
    const a = normalizeTitle(cardTitle);
    const b = normalizeTitle(target);
    return a.includes(b) || b.includes(a);
  }
  function selectByTitles(cards = [], titles = []) {
    const res = [];
    titles.forEach((t) => {
      const found = cards.find((c) => titleIncludes(c.frontTitle || '', t));
      if (found) res.push(found);
    });
    return res;
  }

  const praktijkStretchData = [
    { titel: 'Standing hamstrings stretch', image: 'Individuele Fitness/Praktische Examen/Stretching/StandingHamstringStretch.png', spieren: 'Hamstrings (primair), gastrocnemius (secundair).', positie: '- Sta rechtop, 1 been gestrekt voorwaarts (hiel op grond).<br>- Achterste been licht gebogen.<br>- Bekken in anteversie (holle rug).', uitvoering: '- Buig door achterste been.<br>- Kantel romp naar voor met rechte rug.<br>- Reik naar tenen.', fouten: '- Bolle rug.<br>- Voeten op 1 lijn (balans).<br>- Stretchbeen buigen.' },
    { titel: 'Lying leg extension stretch', image: 'Individuele Fitness/Praktische Examen/Stretching/LyingLegExtentionStretch.png', spieren: 'Hamstrings.', positie: '- Ruglig.<br>- Lift 1 been gestrekt op.<br>- Pak vast in knieholte/dij.', uitvoering: '- Trek been naar schouders.<br>- Hou schouders/zitvlak op de grond.', fouten: '- Andere been komt los.<br>- Schouders los van grond.' },
    { titel: 'Kneeling adductor stretch', image: 'Individuele Fitness/Praktische Examen/Stretching/KneelingAdductorStretch.png', spieren: 'Lange adductoren.', positie: '- Kniel op 1 knie, ander been gestrekt opzij.<br>- Handen op grond.', uitvoering: '- Duw voet zijwaarts, heup naar grond.', fouten: '- Voetpunt niet naar voor.<br>- Gewicht op gestrekt been.' },
    { titel: 'Kneeling hip flexor stretch', image: 'Individuele Fitness/Praktische Examen/Stretching/KneelingHipFlexorStretch.png', spieren: 'Iliopsoas, rectus femoris.', positie: '- Kniezit (schutter).<br>- Bekken retroversie (bilspieren aan).', uitvoering: '- Duw bekken voorwaarts (heupextensie).<br>- Romp rechtop.', fouten: '- Holle rug (hyperextensie).<br>- Voeten op 1 lijn.' },
    { titel: 'Lying glute stretch (Figure 4)', image: 'Individuele Fitness/Praktische Examen/Stretching/LyingGlutStretch.png', spieren: 'Gluteus, piriformis.', positie: '- Ruglig.<br>- Enkel op bovenbeen andere knie.', uitvoering: '- Neem knieholte vast en trek naar borst.<br>- Hoofd op grond.', fouten: '- Te weinig exorotatie.<br>- Hoofd los van grond.' },
    { titel: 'Seated crossover glute stretch', image: 'Individuele Fitness/Praktische Examen/Stretching/SeatedCrossoverGluteStretch.png', spieren: 'Gluteus, piriformis.', positie: '- Zit, benen gestrekt.<br>- Zet voet over andere knie.', uitvoering: '- Draai romp naar knie.<br>- Duw knie naar binnen met elleboog.', fouten: '- Elleboog verkeerd.<br>- Doorzakken rug.' },
    { titel: 'Standing side bending stretch', image: 'Individuele Fitness/Praktische Examen/Stretching/StandingSideBendingStretch.png', spieren: 'Schuine buikspieren, QL, TFL.', positie: '- Sta recht, kruis voeten.<br>- Hand in lenden.', uitvoering: '- Duw bekken zijwaarts.<br>- Arm over hoofd (\'banaan\').', fouten: '- Romp naar voor buigen.' }
  ];
  const praktijkStretchCards = praktijkStretchData.map((d) => ({
    frontTitle: stripCites(d.titel),
    frontImage: d.image,
    back: `
      <strong>Spieren:</strong> ${stripCites(d.spieren)}<br><br>
      <strong>Positie:</strong>
      ${toList(d.positie)}
      <strong>Uitvoering:</strong>
      ${toList(d.uitvoering)}
      <strong>Fouten:</strong>
      ${toList(d.fouten)}
    `
  }));

  const praktijkCoreData = [
    { titel: 'Lage plank (Front bridge)', image: 'Individuele Fitness/Praktische Examen/Core Stability/LagePlank.png', spieren: 'Rectus abdominis, heupbuigers.', positie: '- Ellebogen onder schouders.<br>- Steun op tenen.', uitvoering: '- Lichaam in 1 lijn.<br>- Bekken kantelen (bil/buik aan).', fouten: '- Holle rug.<br>- Bekken te hoog.' },
    { titel: 'Zijwaartse plank (Side bridge)', image: 'Individuele Fitness/Praktische Examen/Core Stability/SideBridge.png', spieren: 'Quadratus lumborum, obliques.', positie: '- Zijlig, elleboog onder schouder.<br>- Voeten op elkaar.', uitvoering: '- Duw bekken omhoog.<br>- Lichaam in 1 lijn.', fouten: '- Schouders niet boven elkaar.<br>- Bekken zakt in.' },
    { titel: 'Supine bridge', image: 'Individuele Fitness/Praktische Examen/Core Stability/SupineBridge.png', spieren: 'Gluteus maximus, hamstrings.', positie: '- Ruglig, voeten plat op grond.', uitvoering: '- Duw bekken omhoog.<br>- Lijn knie-heup-schouder.', fouten: '- Holle rug (geen retroversie).<br>- Voeten te ver weg.' },
    { titel: 'Bird dog', image: 'Individuele Fitness/Praktische Examen/Core Stability/BirdDog.png', spieren: 'Erector spinae, gluteus.', positie: '- Handen- en knieënsteun.', uitvoering: '- Strek diagonaal arm en been uit.<br>- Rug stabiel houden.', fouten: '- Holle/bolle rug.<br>- Te hoog liften.' },
    { titel: 'Side plank abduction on knee', image: 'Individuele Fitness/Praktische Examen/Core Stability/SidePlankAbductionKnee.png', spieren: 'Gluteus medius/minimus.', positie: '- Zijwaartse plank op knie.', uitvoering: '- Lift bovenste been gestrekt op (abductie).', fouten: '- Bekken zakt in.<br>- Heup niet gestrekt.' },
    { titel: 'Dead bug', image: 'Individuele Fitness/Praktische Examen/Core Stability/DeadBug.png', spieren: 'Rectus abdominis.', positie: '- Ruglig, armen omhoog, benen 90-90.', uitvoering: '- Strek diagonaal arm en been uit.<br>- Rug neutraal houden.', fouten: '- Holle rug trekken.' },
    { titel: 'Clam shells', image: 'Individuele Fitness/Praktische Examen/Core Stability/ClamShell.png', spieren: 'Gluteus medius/minimus (exorotatoren).', positie: '- Zijlig, benen gebogen.<br>- Voeten op elkaar.', uitvoering: '- Draai bovenste knie open.', fouten: '- Romp draait mee.<br>- Voeten los van elkaar.' },
    { titel: 'Bodyweight Squat', image: 'Individuele Fitness/Praktische Examen/Core Stability/BodyWeightSquat.png', spieren: 'Primair: Quadriceps, Hamstrings, m. gluteus maximus.<br>Secundair: m. gastrocnemius, m. gluteus medius/minimus, adductorengroep.', positie: '- Zijwaartse spreidstand (schouderbreedte of iets breder).<br>- Tenen naar voor of licht buitenwaarts.<br>- Handen in de lenden of gestrekt voor het lichaam.<br>- Bekken licht kantelen (stabiele rugpositie), buik- en rugspieren aanspannen.<br>- Kijk recht voor je uit.', uitvoering: '- Buig gecontroleerd door de benen: knieën richting tenen, zitvlak naar achter.<br>- Niet dieper dan 90° flexie in de knie (fitnesscontext).<br>- Knieën niet voorbij de tenen, hielen blijven op de grond.<br>- Strek knieën en heupen gelijktijdig uit.', fouten: '- Bolle rug tijdens squatten.<br>- Binnenwaarts knikken van knieën (valgus).<br>- Hielen komen los van de grond.<br>- Foutieve coördinatie: eerst benen strekken, dan pas romp rechten.<br>- Neerwaarts kijken i.p.v. vooruit.' },
    { titel: 'Bodyweight Front Lunge', image: 'Individuele Fitness/Praktische Examen/Core Stability/BodyweightFrontLunge.png', spieren: 'Primair: Quadriceps, Hamstrings.<br>Secundair: m. gluteus maximus, m. gastrocnemius.', positie: '- Benen op schouderbreedte.<br>- Handen in de lenden of naast het lichaam.<br>- Buik- en rugspieren aanspannen (neutrale romp).<br>- Kijk recht voor je.', uitvoering: '- Maak een grote, stabiele voorwaartse uitvalspas.<br>- Buig het voorste been tot 90° en breng achterste knie richting de grond (ook 90°).<br>- Voorste knie niet verder dan de tenen.<br>- Romp rechtop houden, gecontroleerd terugkeren.', fouten: '- Vooroverbuigen van de romp (naar beneden kijken).<br>- Voorste knie voorbij de tenen door te veel gewicht naar voren.<br>- Voeten op één lijn (koorddansen) i.p.v. schouderbreedte (stabiliteit verlies).' },
    { titel: 'Push-up (Pompoefening)', image: 'Individuele Fitness/Praktische Examen/Core Stability/PushUp.png', spieren: 'Primair: m. pectoralis major, m. triceps brachii.<br>Secundair: m. serratus anterior, m. deltoïdeus (voorste deel), m. anconeus, corespieren (stabilisatoren).', positie: '- Hoge plankpositie op handen en voeten (of knieën voor vereenvoudiging).<br>- Handen iets breder dan schouderbreedte op borsthoogte.<br>- Rompspanning: lichaam vormt één rechte plank.<br>- Kijk schuin afwaarts (hoofd in lijn met rug).', uitvoering: '- Laat lichaam gecontroleerd zakken als een plank tot borstbeen ~10 cm boven de grond (vuist).<br>- Bovenarmen ~60° t.o.v. romp (ellebogen lager dan schouders).<br>- Ellebogen loodrecht boven polsen.<br>- Duw terug op tot gestrekte armen met blijvende core-spanning.', fouten: '- Doorhangen onderrug (hyperlordose) of bekken te hoog.<br>- Recht vooruit kijken (nek overstrekking).<br>- Ellebogen te breed (boven schouderhoogte).' }
  ];
  const praktijkCoreCards = praktijkCoreData.map((d) => ({
    frontTitle: stripCites(d.titel),
    frontImage: d.image,
    back: `
      <strong>Spieren:</strong> ${stripCites(d.spieren)}<br><br>
      <strong>Positie:</strong>
      ${toList(d.positie)}
      <strong>Uitvoering:</strong>
      ${toList(d.uitvoering)}
      <strong>Fouten:</strong>
      ${toList(d.fouten)}
    `
  }));

  const praktijkBodyweightStrengthData = [
    { titel: 'Push-up', image: 'Individuele Fitness/Praktische Examen/Core Stability/PushUp.png', spieren: 'Pectoralis major, triceps.', positie: '- Plankhouding, handen breed.', uitvoering: '- Zakken tot borst vlakbij grond.<br>- Ellebogen 45 graden.', fouten: '- Holle rug.<br>- Ellebogen te breed (T-vorm).' },
    { titel: 'Lunge (Bodyweight)', image: 'Individuele Fitness/Praktische Examen/Core Stability/BodyweightFrontLunge.png', spieren: 'Quadriceps, hamstrings, gluteus.', positie: '- Rechtop staan.', uitvoering: '- Grote uitvalspas.<br>- Knieën naar 90 graden.', fouten: '- Knie voorbij tenen.<br>- Romp naar voren.' },
    { titel: 'Squat (Bodyweight)', image: 'Individuele Fitness/Praktische Examen/Core Stability/BodyWeightSquat.png', spieren: 'Quadriceps, hamstrings, gluteus.', positie: '- Voeten schouderbreedte.', uitvoering: '- Zak door knieën (billen naar achter).<br>- Rug recht.', fouten: '- Bolle rug.<br>- Knieën naar binnen.<br>- Hielen los.' }
  ];
  const praktijkBodyweightStrengthCards = praktijkBodyweightStrengthData.map((d) => ({
    frontTitle: stripCites(d.titel),
    frontImage: d.image,
    back: `
      <strong>Spieren:</strong> ${stripCites(d.spieren)}<br><br>
      <strong>Positie:</strong>
      ${toList(d.positie)}
      <strong>Uitvoering:</strong>
      ${toList(d.uitvoering)}
      <strong>Fouten:</strong>
      ${toList(d.fouten)}
    `
  }));

  const praktijkFreeWeightsData = [
    { titel: 'Barbell squat', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Free Weight/BarbellSquat.png', spieren: 'Quadriceps, hamstrings, gluteus.', positie: '- Barbell op trapezius.<br>- Voeten schouderbreedte.', uitvoering: '- Zakken (rug recht).<br>- Knieën niet voorbij tenen.', fouten: '- Bolle rug.<br>- Knieën naar binnen.' },
    { titel: 'Barbell lunge', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Free Weight/BarbellLung.png', spieren: 'Quadriceps, hamstrings, gluteus.', positie: '- Barbell in nek.', uitvoering: '- Uitvalspas (90-90).<br>- Romp recht.', fouten: '- Knie voorbij tenen.<br>- Balansverlies.' },
    { titel: "Cable standing crossover/fly’s", image: 'Individuele Fitness/Praktische Examen/Krachttraining/Free Weight/CableStandingCrossover.png', spieren: 'Pectoralis major.', positie: '- Uitvalspas, kabels hoog.', uitvoering: '- Trek handen naar elkaar voor borst.', fouten: '- Ellebogen strekken.<br>- Te ver naar achter.' },
    { titel: 'Dumbbell press', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Free Weight/DumbellPress.png', spieren: 'Pectoralis major, triceps.', positie: '- Ruglig, dumbbells boven borst.', uitvoering: '- Zakken en uitduwen.', fouten: '- Asymmetrisch.<br>- Holle rug.' },
    { titel: "Dumbbell fly’s", image: 'Individuele Fitness/Praktische Examen/Krachttraining/Free Weight/DumbellFly.png', spieren: 'Pectoralis major.', positie: '- Ruglig, armen licht gebogen.', uitvoering: '- Openen en sluiten (omhelzing).', fouten: '- Ellebogen strekken.<br>- Te diep zakken.' },
    { titel: 'Dumbbell lying rear row / delt raise', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Free Weight/DumbellLyingRearRow.png', spieren: 'Achterkant schouder, rug.', positie: '- Buiklig op bankje.', uitvoering: '- Trek gewichten omhoog/zijwaarts.', fouten: '- Borst los van bank.<br>- Hoofd optillen.' },
    { titel: 'Dumbbell single arm bentover row', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Free Weight/DumbellSingleArmBentoverRow.png', spieren: 'Latissimus dorsi.', positie: '- Steun op bank (hand+knie).<br>- Rug recht (tafel).', uitvoering: '- Trek dumbbell naar heup.', fouten: '- Bolle rug.<br>- Roteren met romp.' },
    { titel: 'Barbell bench press', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Free Weight/BarbellChestPress.png', spieren: 'Pectoralis major, triceps.', positie: '- Ruglig, barbell boven borst.', uitvoering: '- Zakken tot borst, uitduwen.', fouten: '- Holle rug.<br>- Polsen plooien.<br>- Guillotine (naar nek).' },
    { titel: 'Seated military press (Barbell)', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Free Weight/SeatedMilitaryPress(Barbell).png', spieren: 'Deltoideus.', positie: '- Zit rechtop, barbell voor hoofd.', uitvoering: '- Duw verticaal uit.', fouten: '- Holle rug.<br>- Achterover leunen.' },
    { titel: 'Dumbbell seated shoulder press', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Free Weight/SeatedDumbellShoulderPress.png', spieren: 'Deltoideus.', positie: '- Zit rechtop, dumbbells op schouders.', uitvoering: '- Duw uit tot boven hoofd.', fouten: '- Holle rug.<br>- Gewichten naar voren.' },
    { titel: 'Barbell / Dumbbell skull crusher', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Free Weight/BarbellSkullCrusher.png', spieren: 'Triceps brachii.', positie: '- Ruglig, armen omhoog.', uitvoering: '- Buig ellebogen, gewicht naar voorhoofd.', fouten: '- Ellebogen naar buiten.<br>- Beweging uit schouder.' },
    { titel: 'Cable standing triceps pulldown', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Free Weight/CableStandingTricepPulldown.png', spieren: 'Triceps brachii.', positie: '- Staand, ellebogen in zij.', uitvoering: '- Duw stang/touw omlaag.', fouten: '- Ellebogen los van zij.<br>- Polsen plooien.' },
    { titel: 'Dumbbell triceps kickbacks', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Free Weight/DumbellTricepKickbacks.png', spieren: 'Triceps brachii.', positie: '- Voorovergebogen, bovenarm langs romp.', uitvoering: '- Strek onderarm naar achter.', fouten: '- Bovenarm zakt.<br>- Zwaaien.' },
    { titel: 'Dumbbell standing hammer curl', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Free Weight/DumbellStandingHammerCurl.png', spieren: 'Brachioradialis, brachialis.', positie: '- Staand, neutrale greep (duim op).', uitvoering: '- Buig armen.', fouten: '- Zwaaien.<br>- Ellebogen naar voor.' },
    { titel: 'Dumbbell standing biceps curl', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Free Weight/DumbellStandingBicepsCurl.png', spieren: 'Biceps brachii.', positie: '- Staand, handpalmen vooruit.', uitvoering: '- Buig armen.', fouten: '- Zwaaien.<br>- Polsen plooien.' },
    { titel: 'Dumbbell side / front raises', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Free Weight/DumbellSideFrontRaises.png', spieren: 'Deltoideus (Zij / Voor).', positie: '- Staand.', uitvoering: '- Hef armen zijwaarts of voorwaarts tot schouderhoogte.', fouten: '- Boven schouderhoogte.<br>- Zwaaien.' }
  ];
  const praktijkFreeWeightsCards = praktijkFreeWeightsData.map((d) => ({
    frontTitle: stripCites(d.titel),
    frontImage: d.image,
    back: `
      <strong>Spieren:</strong> ${stripCites(d.spieren)}<br><br>
      <strong>Positie:</strong>
      ${toList(d.positie)}
      <strong>Uitvoering:</strong>
      ${toList(d.uitvoering)}
      <strong>Fouten:</strong>
      ${toList(d.fouten)}
    `
  }));

  const praktijkMachinesStrengthData = [
    { titel: 'Seated leg press', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Machines/SeatedLegPress.png', spieren: 'Quadriceps, hamstrings, gluteus.', positie: '- Voeten op platform, knie < 90°.', uitvoering: '- Duw weg (niet overstrekken).', fouten: '- Knieën op slot.<br>- Hielen los.' },
    { titel: 'Chest press', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Machines/ChestPress.png', spieren: 'Pectoralis major, triceps.', positie: '- Grepen op borsthoogte.', uitvoering: '- Duw uit.<br>- Keer terug tot vuist van borst.', fouten: '- Boven schouderhoogte.<br>- Te ver terug (overstrekking).' },
    { titel: 'Low row', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Machines/LowRowMachine.png', spieren: 'Latissimus dorsi, teres major.', positie: '- Borst tegen steun.', uitvoering: '- Trek naar buik, ellebogen smal.', fouten: '- Ellebogen breed.<br>- Borst los van steun.' },
    { titel: 'Reverze fly machine', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Machines/ReverzeFlyMachine.png', spieren: 'Achterkant schouder (Deltoideus posterior).', positie: '- Borst tegen steun.', uitvoering: '- Armen zijwaarts naar achteren.', fouten: '- Armen overstrekken.<br>- Borst los.' },
    { titel: 'Pectoral fly machine', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Machines/PectoralFlyMachine.png', spieren: 'Pectoralis major.', positie: '- Ellebogen op schouderhoogte.', uitvoering: '- Breng armen samen voor borst.', fouten: '- Ellebogen los.<br>- Te ver terugkeren.' },
    { titel: 'Lat machine (Front pull down)', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Machines/LatMachineFrontPullDown.png', spieren: 'Latissimus dorsi.', positie: '- Knieën klem, brede greep.', uitvoering: '- Trek stang naar borst.', fouten: '- Stang in nek.<br>- Achterover hangen.' },
    { titel: 'Seated leg extension', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Machines/SeatedLegExtension.png', spieren: 'Quadriceps.', positie: '- Knie-as gelijk met toestel.', uitvoering: '- Strek benen opwaarts.', fouten: '- Trappen (snel).<br>- Loskomen onderrug.' },
    { titel: 'Seated leg curl', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Machines/SeatedLegCurl.png', spieren: 'Hamstrings.', positie: '- Knie-as gelijk met toestel.', uitvoering: '- Buig benen omlaag.', fouten: '- Holle rug.<br>- Knie schuift.' },
    { titel: 'Shoulder press', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Machines/ShoulderPressMachine.png', spieren: 'Deltoideus.', positie: '- Grepen op schouderhoogte.', uitvoering: '- Duw verticaal omhoog.', fouten: '- Holle rug.<br>- Smalle ellebogen.' },
    { titel: 'Abductor / Adductor machine', image: 'Individuele Fitness/Praktische Examen/Krachttraining/Machines/AbductorAdductorMachine.png', spieren: 'Abductoren (Gluteus) / Adductoren.', positie: '- Kussens buitenkant (Ab) of binnenkant (Ad).', uitvoering: '- Duw naar buiten (Ab) of binnen (Ad).', fouten: '- Kleine beweging.<br>- Bolle rug.' }
  ];
  const praktijkMachinesStrengthCards = praktijkMachinesStrengthData.map((d) => ({
    frontTitle: stripCites(d.titel),
    frontImage: d.image,
    back: `
      <strong>Spieren:</strong> ${stripCites(d.spieren)}<br><br>
      <strong>Positie:</strong>
      ${toList(d.positie)}
      <strong>Uitvoering:</strong>
      ${toList(d.uitvoering)}
      <strong>Fouten:</strong>
      ${toList(d.fouten)}
    `
  }));

  const praktijkCardioData = [
    { titel: 'Fietsergometer', image: 'Individuele Fitness/Praktische Examen/Cardio/Fietsergometer.png', spieren: 'Benen, Cardio.', positie: '- Zadelhoogte: been bijna gestrekt (5° flexie).', uitvoering: '- 70-80 RPM.<br>- Handen aan stuur, kijk vooruit.', fouten: '- Zadel te laag/hoog.<br>- Bekken danst.' },
    { titel: 'Crosstrainer', image: 'Individuele Fitness/Praktische Examen/Cardio/CrossTrainer.png', spieren: 'Full Body, Cardio.', positie: '- Voeten vooraan op pedalen.', uitvoering: '- Kruislingse beweging.<br>- 110-120 SPM.', fouten: '- Achteruit crossen.<br>- Knieën naar binnen.' },
    { titel: 'Stairclimber', image: 'Individuele Fitness/Praktische Examen/Cardio/StairClimber.png', spieren: 'Benen, Bilspieren, Cardio.', positie: '- Rechtop staan.', uitvoering: '- Stap trappen op.<br>- Blijf hoog op treden.', fouten: '- Leunen op armsteunen.<br>- Te laag zakken.' },
    { titel: 'Roeiergometer', image: 'Individuele Fitness/Praktische Examen/Cardio/Roeiergometer.png', spieren: 'Rug, Benen, Biceps, Cardio.', positie: '- Voeten vast, rug recht.', uitvoering: '- Duw benen -> romp -> armen.<br>- Keer omgekeerd terug.', fouten: '- Rug bollen/leunen.<br>- Stang te hoog trekken.' },
    { titel: 'Loopband', image: 'Individuele Fitness/Praktische Examen/Cardio/loopband.png', spieren: 'Benen, Cardio.', positie: '- Safety clip aan.', uitvoering: '- Loop op voorste deel.<br>- Gekruiste arminzet.', fouten: '- Vasthouden aan stang.<br>- Voeten draaien.' }
  ];
  const praktijkCardioCards = praktijkCardioData.map((d) => ({
    frontTitle: stripCites(d.titel),
    frontImage: d.image,
    back: `
      <strong>Spieren:</strong> ${stripCites(d.spieren)}<br><br>
      <strong>Positie:</strong>
      ${toList(d.positie)}
      <strong>Uitvoering:</strong>
      ${toList(d.uitvoering)}
      <strong>Fouten:</strong>
      ${toList(d.fouten)}
    `
  }));

  

  
  const allPraktijkCards = [
    ...praktijkStretchCards,
    ...praktijkFreeWeightsCards,
    ...praktijkMachinesStrengthCards,
    ...praktijkCoreCards,
    ...praktijkCardioCards
  ];

  const categories = [
    { id: 'stretching', title: 'Stretching', cards: testStretch.map((c) => ({ frontTitle: c.question, back: c.answer })) },
    { id: 'kracht', title: 'Krachttraining', subcategories: [
      { id: 'kracht-body', title: 'Free weights', cards: freeWeightsCards },
      { id: 'kracht-machines', title: 'Machines', cards: machinesCards }
    ]},
    { id: 'core', title: 'Corestability', cards: coreCards },
    { id: 'cardio', title: 'Cardio', cards: cardioCards },
    { id: 'praktijk', title: 'Praktisch examen', subcategories: [
      { id: 'praktijk-shuffle', title: 'Shuffle', cards: [] },
      { id: 'praktijk-stretch', title: 'Stretching', cards: praktijkStretchCards },
      { id: 'praktijk-kracht', title: 'Krachttraining', subcategories: [
        { id: 'praktijk-kracht-free', title: 'Free weights', cards: praktijkFreeWeightsCards },
        { id: 'praktijk-kracht-machines', title: 'Machines', cards: praktijkMachinesStrengthCards }
      ]},
      { id: 'praktijk-core', title: 'Corestability', cards: praktijkCoreCards },
      { id: 'praktijk-cardio', title: 'Cardio', cards: praktijkCardioCards }
    ]}
  ];

  const difficultCards = [];
  const status = userPrefs.flashcardStatus || {};
  
  const traverse = (list) => {
    list.forEach(item => {
      if (item.cards) {
        item.cards.forEach(c => {
           const key = c.frontTitle || c.question;
           if (key && status[key] === 'unknown') {
             if (!difficultCards.some(dc => (dc.frontTitle || dc.question) === key)) {
                difficultCards.push(c);
             }
           }
        });
      }
      if (item.subcategories) traverse(item.subcategories);
    });
  };
  traverse(categories);

  if (difficultCards.length > 0) {
    categories.unshift({
      id: 'difficult',
      title: 'Moeilijke Flashcards',
      cards: difficultCards
    });
  }

  return categories;
}

function findFlashcardNode(subject, id) {
  const cats = getFlashcardCategories(subject);
  for (const c of cats) {
    if (c.id === id) return c;
    const subs = c.subcategories || [];
    for (const s of subs) {
      if (s.id === id) return s;
      const subs2 = s.subcategories || [];
      for (const t of subs2) {
        if (t.id === id) return t;
      }
    }
  }
  return null;
}

function countCards(node) {
  if (!node) return 0;
  const own = (node.cards || []).length;
  const subs = node.subcategories || [];
  return own + subs.reduce((acc, s) => acc + countCards(s), 0);
}

function renderShuffleView(subject, cat) {
  if (!flashcardsDisplay) return;
  flashcardsDisplay.innerHTML = '';

  const headerGroup = document.createElement('div');
  headerGroup.style.marginBottom = '24px';

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'btn ghost';
  backBtn.textContent = '← Terug';
  backBtn.style.marginBottom = '12px';
  backBtn.addEventListener('click', () => {
    const allCats = getFlashcardCategories(subject);
    const findParent = (list, targetId) => {
        for (const item of list) {
            if (item.subcategories) {
                if (item.subcategories.some(sub => sub.id === targetId)) return item;
                const found = findParent(item.subcategories, targetId);
                if (found) return found;
            }
        }
        return null;
    };
    const parent = findParent(allCats, cat.id);
    renderFlashcardsPanel(subject, parent);
  });
  headerGroup.appendChild(backBtn);

  const titleDiv = document.createElement('div');
  titleDiv.innerHTML = `
    <p class="eyebrow">Bundel</p>
    <h3>${cat.title}</h3>
    <p class="lede">Selecteer categorieën om te shuffelen.</p>
  `;
  headerGroup.appendChild(titleDiv);
  flashcardsDisplay.appendChild(headerGroup);

  // Get selectable categories
  const allCats = getFlashcardCategories(subject);
  const praktijk = allCats.find(c => c.id === 'praktijk');
  const selectables = [];
  if (praktijk && praktijk.subcategories) {
     const traverse = (list) => {
         list.forEach(item => {
             if (item.id === 'praktijk-shuffle') return;
             if (item.subcategories && item.subcategories.length > 0) {
                 traverse(item.subcategories);
             } else if (item.cards && item.cards.length > 0) {
                 selectables.push(item);
             }
         });
     };
     traverse(praktijk.subcategories);
  }

  const selectedIds = new Set(selectables.map(s => s.id));

  const list = document.createElement('div');
  list.className = 'quiz-category__list';
  list.style.marginBottom = '32px';

  // Create card elements once and update their state on click
  const cardElements = new Map();

  selectables.forEach(s => {
      const card = document.createElement('article');
      card.className = 'quiz-picker__card';
      // Removed inline cursor: pointer; handled in CSS
      
      const updateCardState = () => {
          const isSelected = selectedIds.has(s.id);
          
          // Toggle active class
          if (isSelected) {
            card.classList.add('active-shuffle');
          } else {
            card.classList.remove('active-shuffle');
          }
          
          // Remove inline styles that conflict with CSS
          card.style.border = '';
          card.style.background = '';
          
          // Use CSS classes for layout and styling
          card.innerHTML = `
            <div class="quiz-picker__content">
                <div class="quiz-picker__checkbox ${isSelected ? 'checked' : ''}">
                    ${isSelected ? '✓' : ''}
                </div>
                <div class="quiz-picker__text-group">
                    <h3>${s.title}</h3>
                    <p class="caption">${s.cards.length} kaarten</p>
                </div>
            </div>
          `;
      };
      
      updateCardState();
      
      card.addEventListener('click', () => {
          if (selectedIds.has(s.id)) {
              selectedIds.delete(s.id);
          } else {
              selectedIds.add(s.id);
          }
          updateCardState();
          updateShuffleBtn();
      });
      
      list.appendChild(card);
      cardElements.set(s.id, card);
  });
  
  flashcardsDisplay.appendChild(list);

  const shuffleBtn = document.createElement('button');
  shuffleBtn.className = 'btn primary';
  shuffleBtn.style.width = '100%';
  shuffleBtn.style.padding = '16px';
  shuffleBtn.style.fontSize = '16px';
  shuffleBtn.style.borderRadius = '8px';
  
  const updateShuffleBtn = () => {
      const count = Array.from(selectedIds).reduce((acc, id) => {
          const s = selectables.find(x => x.id === id);
          return acc + (s ? s.cards.length : 0);
      }, 0);
      shuffleBtn.textContent = `Shuffle ${count} kaarten`;
      shuffleBtn.disabled = count === 0;
  };
  updateShuffleBtn();

  shuffleBtn.addEventListener('click', () => {
      shuffleBtn.innerHTML = 'Even schudden... 🎲';
      setTimeout(() => {
        let pool = [];
        selectables.forEach(s => {
            if (selectedIds.has(s.id)) {
                pool = pool.concat(s.cards);
            }
        });
        const shuffled = pool.sort(() => Math.random() - 0.5);
        activeFlashcardsCategory = { ...cat, title: 'Shuffle Sessie', cards: shuffled };
        setActivePanel('flashcards-play-panel');
        render();
      }, 600);
  });
  
  flashcardsDisplay.appendChild(shuffleBtn);
}

function renderFlashcardsPanel(subject, parentCategory = null) {
  if (!flashcardsPanel || !flashcardsDisplay) return;
  if (activePanel !== 'flashcards-panel') { flashcardsPanel.hidden = true; return; }
  flashcardsPanel.hidden = false;
  flashcardsDisplay.innerHTML = '';

  // Determine items to show
  let items = [];
  if (parentCategory) {
    items = parentCategory.subcategories || [];
  } else {
    const categories = getFlashcardCategories(subject);
    items = [...categories].sort((a, b) => {
      if (a.id === 'praktijk' && b.id !== 'praktijk') return -1;
      if (b.id === 'praktijk' && a.id !== 'praktijk') return 1;
      return 0;
    });
  }

  // Helper to find parent for "Back" button
  const findParent = (list, targetId) => {
    for (const item of list) {
       if (item.subcategories) {
         if (item.subcategories.some(sub => sub.id === targetId)) return item;
         const found = findParent(item.subcategories, targetId);
         if (found) return found;
       }
    }
    return null;
  };

  // Header Section
  const headerGroup = document.createElement('div');
  headerGroup.style.marginBottom = '24px';

  if (parentCategory) {
    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'btn ghost'; 
    backBtn.textContent = '← Terug';
    backBtn.style.marginBottom = '12px';
    backBtn.addEventListener('click', () => {
      const allCats = getFlashcardCategories(subject);
      const parent = findParent(allCats, parentCategory.id);
      renderFlashcardsPanel(subject, parent);
    });
    headerGroup.appendChild(backBtn);

    const titleDiv = document.createElement('div');
    titleDiv.innerHTML = `
      <p class="eyebrow">Categorie</p>
      <h3>${parentCategory.title}</h3>
    `;
    headerGroup.appendChild(titleDiv);
  } else {
    headerGroup.innerHTML = `
      <header class="quiz-category__header">
        <div>
          <p class="eyebrow">Flashcards</p>
          <h3>Kies een onderwerp</h3>
        </div>
      </header>
    `;
  }
  flashcardsDisplay.appendChild(headerGroup);

  // Grid List
  const list = document.createElement('div');
  list.className = 'quiz-category__list'; // Keeps the grid layout

  if (items.length === 0) {
      list.innerHTML = `<p class="caption">Geen subcategorieën gevonden.</p>`;
  } else {
      items.forEach((cat) => {
        const card = document.createElement('article');
        card.className = 'quiz-picker__card';
        if (cat.id === 'praktijk') card.classList.add('is-praktijk');
        if (cat.id === 'difficult') card.classList.add('is-difficult');
        
        const total = countCards(cat);
        const isLeaf = !cat.subcategories || cat.subcategories.length === 0;

        // Use a cleaner HTML structure
        card.innerHTML = `
          <div class="quiz-picker__content">
            <header class="quiz-picker__header" style="margin-bottom: 4px;">
               <h3 style="margin: 0;">${cat.title}</h3>
            </header>
            <p class="caption">${isLeaf ? 'Start set' : 'Bekijk opties'}</p>
          </div>
          <div class="quiz-picker__actions">
             <div class="chip">${total}</div>
          </div>
        `;
        
        // Make the card clickable
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            if (cat.id === 'praktijk-shuffle') {
                 renderShuffleView(subject, cat);
             } else if (isLeaf) {
                activeFlashcardsCategory = { id: cat.id, title: cat.title, cards: cat.cards || [] };
                setActivePanel('flashcards-play-panel');
                render();
            } else {
                renderFlashcardsPanel(subject, cat);
            }
        });

        list.appendChild(card);
      });
  }
  
  flashcardsDisplay.appendChild(list);
}

function renderFlashcardsList(cards) {
  flashcardsDisplay.innerHTML = '';
  if (!cards.length) {
    flashcardsDisplay.innerHTML = '<p class="caption">Nog geen kaarten in deze categorie.</p>';
    return;
  }
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
  grid.style.gap = '12px';
  cards.forEach((c) => {
    const card = document.createElement('div');
    card.className = 'flashcard';
    const inner = document.createElement('div');
    inner.className = 'flashcard__inner';
    const front = document.createElement('div');
    front.className = 'flashcard__face flashcard__front';
    const imgHtml = c.frontImage ? `<img src="${c.frontImage}" alt="${c.frontTitle || ''}" style="max-width:100%; max-height:150px; border-radius:4px; object-fit:contain;">` : '';
    front.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; width:100%; gap:12px;">${imgHtml}<strong>${c.frontTitle || c.question || ''}</strong></div>`;
    const back = document.createElement('div');
    back.className = 'flashcard__face flashcard__back';
    const html = c.back || c.backHtml || c.answer || '';
    back.innerHTML = `<div class="flashcard__content">${html}</div>`;
    inner.append(front, back);
    card.appendChild(inner);
    card.addEventListener('click', () => { card.classList.toggle('is-flipped'); });
    requestAnimationFrame(() => {
      const h = Math.max(front.scrollHeight, back.scrollHeight);
      card.style.height = `${h}px`;
    });
    grid.appendChild(card);
  });
  flashcardsDisplay.appendChild(grid);
}

function renderStretchingCategory(cat) {
  const cards = cat.cards || [];
  flashcardsDisplay.innerHTML = '';
  const header = document.createElement('section');
  header.className = 'quiz-category';
  header.innerHTML = `
    <header class="quiz-category__header">
      <div>
        <p class="eyebrow">Stretching</p>
        <h3>Oefen of bekijk kaarten</h3>
      </div>
    </header>
  `;
  const actions = document.createElement('div');
  actions.className = 'quiz-picker__actions';
  const oefenBtn = document.createElement('button');
  oefenBtn.type = 'button';
  oefenBtn.className = 'btn';
  oefenBtn.textContent = 'Oefen';
  oefenBtn.addEventListener('click', () => {
    activeFlashcardsCategory = cat;
    setActivePanel('flashcards-play-panel');
    render();
  });
  actions.appendChild(oefenBtn);
  header.appendChild(actions);
  flashcardsDisplay.appendChild(header);
  renderFlashcardsList(cards);
}
function renderFlashcardsPlay(subject) {
  if (!flashcardsPlayPanel) return;
  if (activePanel !== 'flashcards-play-panel') { flashcardsPlayPanel.hidden = true; flashcardsPlayPanel.classList.remove('is-flashcard-mode'); return; }
  flashcardsPlayPanel.hidden = false;
  flashcardsPlayPanel.classList.add('is-flashcard-mode');
  const cat = activeFlashcardsCategory || (getFlashcardCategories(subject).find((c) => c.id === 'stretching')) || null;
  const cards = cat?.cards || [];
  flashcardsPlayPanel.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'panel__header';
  header.style.justifyContent = 'flex-start';
  header.style.alignItems = 'flex-start';
  header.style.gap = '16px';
  
  const backBtn = document.createElement('button');
  backBtn.className = 'btn ghost';
  backBtn.type = 'button';
  backBtn.textContent = '← Terug';
  backBtn.style.marginTop = '4px'; // Align visually with the top text
  backBtn.addEventListener('click', () => { setActivePanel('flashcards-panel'); });
  
  const titleBlock = document.createElement('div');
  titleBlock.innerHTML = `
    <p class="eyebrow">Flashcards</p>
    <h2>${cat ? cat.title : 'Oefenen'}</h2>
    <p class="caption">Klik op de kaart om te draaien. Navigeer met de pijlen.</p>
  `;
  
  header.appendChild(backBtn);
  header.appendChild(titleBlock);
  if (!cards.length) {
    const node = (cat && cat.id) ? findFlashcardNode(subject, cat.id) : null;
    const subs = node?.subcategories || [];
    if (subs.length) {
      const chooser = document.createElement('section');
      chooser.className = 'quiz-category';
      chooser.innerHTML = `
        <header class="quiz-category__header">
          <div>
            <p class="eyebrow">Keuze</p>
            <h3>${node.title}</h3>
          </div>
        </header>
      `;
      const list = document.createElement('div');
      list.className = 'quiz-category__list';
      subs.forEach((sub) => {
        const subCard = document.createElement('article');
        subCard.className = 'quiz-picker__card';
        const count = countCards(sub);
        subCard.innerHTML = `
          <header class="quiz-picker__header">
            <div>
              <p class="eyebrow">Subcategorie</p>
              <h3>${sub.title}</h3>
            </div>
            <div class="chip">${count} kaarten</div>
          </header>
          <p class="caption">Open om te starten.</p>
        `;
        const actions = document.createElement('div');
        actions.className = 'quiz-picker__actions';
        const open = document.createElement('button');
        open.type = 'button';
        open.className = 'btn';
        open.textContent = 'Open';
        open.addEventListener('click', () => {
          activeFlashcardsCategory = { id: sub.id, title: sub.title, cards: sub.cards || [] };
          render();
        });
        actions.appendChild(open);
        subCard.appendChild(actions);
        list.appendChild(subCard);
      });
      chooser.appendChild(list);
      flashcardsPlayPanel.appendChild(header);
      flashcardsPlayPanel.appendChild(chooser);
      return;
    }
  }
  const runner = document.createElement('div');
  runner.className = 'quiz-runner';
  const practiceCard = document.createElement('div');
  practiceCard.className = 'quiz-runner__card';
  const practiceStep = document.createElement('p');
  practiceStep.className = 'quiz-runner__step';
  const big = document.createElement('div');
  big.className = 'flashcard flashcard--big';
  const bigInner = document.createElement('div');
  bigInner.className = 'flashcard__inner';
  const bigFront = document.createElement('div');
  bigFront.className = 'flashcard__face flashcard__front';
  const bigBack = document.createElement('div');
  bigBack.className = 'flashcard__face flashcard__back';
  bigInner.append(bigFront, bigBack);
  big.append(bigInner);
  big.addEventListener('click', () => { big.classList.toggle('is-flipped'); });
  const nav = document.createElement('div');
  nav.className = 'quiz-runner__nav';

  const unknownBtn = document.createElement('button');
  unknownBtn.type = 'button';
  unknownBtn.className = 'btn ghost';
  unknownBtn.style.color = '#d32f2f';
  unknownBtn.style.borderColor = '#ef9a9a';
  unknownBtn.style.backgroundColor = '#ffebee';
  unknownBtn.style.fontSize = '20px';
  unknownBtn.style.padding = '0 12px';
  unknownBtn.textContent = '👎';

  const knownBtn = document.createElement('button');
  knownBtn.type = 'button';
  knownBtn.className = 'btn ghost';
  knownBtn.style.color = '#388e3c';
  knownBtn.style.borderColor = '#a5d6a7';
  knownBtn.style.backgroundColor = '#e8f5e9';
  knownBtn.style.fontSize = '20px';
  knownBtn.style.padding = '0 12px';
  knownBtn.textContent = '👍';

  const spacer = document.createElement('div');
  spacer.style.flex = '1';

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button'; prevBtn.className = 'btn'; prevBtn.textContent = '<';
  
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button'; nextBtn.className = 'btn'; nextBtn.textContent = '>';
  
  nav.append(unknownBtn, knownBtn, spacer, prevBtn, nextBtn);
  
  let index = 0; 
  
  const handleNav = () => {
     if (index >= cards.length) index = cards.length - 1;
     if (index < 0) index = 0;
     update();
  };

  unknownBtn.addEventListener('click', () => {
    const current = cards[index];
    if (current) {
        const key = current.frontTitle || current.question;
        if (key) {
            userPrefs.flashcardStatus = userPrefs.flashcardStatus || {};
            userPrefs.flashcardStatus[key] = 'unknown';
            persistUserPrefs();
        }
    }
    // If we are in 'difficult' mode, 'unknown' just keeps it there. Move to next.
    if (index < cards.length - 1) { index += 1; update(); }
  });

  knownBtn.addEventListener('click', () => {
    const current = cards[index];
    if (current) {
        const key = current.frontTitle || current.question;
        if (key) {
            userPrefs.flashcardStatus = userPrefs.flashcardStatus || {};
            userPrefs.flashcardStatus[key] = 'known';
            persistUserPrefs();
        }
    }
    
    // If in difficult mode, remove the card immediately
    if (activeFlashcardsCategory && activeFlashcardsCategory.id === 'difficult') {
        cards.splice(index, 1);
        // If empty, go back
        if (cards.length === 0) {
            setActivePanel('flashcards-panel');
            render(); // Refresh main list
            return;
        }
        // Adjust index if needed (if we removed the last one)
        if (index >= cards.length) {
            index = Math.max(0, cards.length - 1);
        }
        update();
    } else {
        if (index < cards.length - 1) { index += 1; update(); }
    }
  });

  practiceCard.append(practiceStep, big);
  runner.append(practiceCard, nav);
  flashcardsPlayPanel.append(header, runner);
  
  function update() {
    big.classList.remove('is-flipped');
    if (!cards.length) return;
    const current = cards[index] || {};
    const imgHtml = current.frontImage ? `<img src="${current.frontImage}" alt="${current.frontTitle || ''}" style="max-width:100%; max-height:300px; border-radius:8px; object-fit:contain;">` : '';
    bigFront.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; width:100%; gap:16px;">${imgHtml}<strong>${current.frontTitle || current.question || 'Kaart'}</strong></div>`;
    const html = current.back || current.backHtml || current.answer || '';
    bigBack.innerHTML = `<div class="flashcard__content">${html}</div>`;
    practiceStep.textContent = `Kaart ${index + 1} van ${cards.length}`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index >= cards.length - 1;
    requestAnimationFrame(() => {
      const h = Math.max(bigFront.scrollHeight, bigBack.scrollHeight);
      big.style.height = `${h}px`;
    });
  }
  prevBtn.addEventListener('click', () => { if (index > 0) { index -= 1; update(); } });
  nextBtn.addEventListener('click', () => { if (index < cards.length - 1) { index += 1; update(); } });
  update();
}

/* Feedback Modal Logic */
let activeFeedbackIndex = null;
const feedbackModal = document.getElementById('feedback-modal');
const feedbackOptions = document.getElementById('feedback-options');
const feedbackOtherContainer = document.getElementById('feedback-other-container');
const feedbackOtherInput = document.getElementById('feedback-other-input');
const feedbackCancelBtn = document.getElementById('feedback-cancel');
const feedbackSubmitBtn = document.getElementById('feedback-submit');
let selectedFeedbackReason = null;

function openFeedbackModal(idx) {
  activeFeedbackIndex = idx;
  selectedFeedbackReason = null;
  if (feedbackOtherInput) feedbackOtherInput.value = '';
  if (feedbackOtherContainer) feedbackOtherContainer.hidden = true;
  if (feedbackModal) feedbackModal.hidden = false;
  
  // Reset selected state of options
  if (feedbackOptions) {
    const options = feedbackOptions.querySelectorAll('.feedback-option');
    options.forEach(opt => opt.classList.remove('selected'));
  }
}

function closeFeedbackModal() {
  if (feedbackModal) feedbackModal.hidden = true;
  activeFeedbackIndex = null;
  selectedFeedbackReason = null;
}

if (feedbackOptions) {
  feedbackOptions.addEventListener('click', (e) => {
    if (e.target.classList.contains('feedback-option')) {
      const value = e.target.dataset.value;
      
      // Update UI
      const options = feedbackOptions.querySelectorAll('.feedback-option');
      options.forEach(opt => opt.classList.remove('selected'));
      e.target.classList.add('selected');
      
      if (value === 'other') {
        if (feedbackOtherContainer) feedbackOtherContainer.hidden = false;
        selectedFeedbackReason = 'other';
        if (feedbackOtherInput) feedbackOtherInput.focus();
      } else {
        if (feedbackOtherContainer) feedbackOtherContainer.hidden = true;
        selectedFeedbackReason = e.target.textContent;
      }
    }
  });
}

if (feedbackCancelBtn) {
  feedbackCancelBtn.addEventListener('click', closeFeedbackModal);
}

if (feedbackSubmitBtn) {
  feedbackSubmitBtn.addEventListener('click', () => {
    if (!selectedFeedbackReason) return;
    
    let finalReason = selectedFeedbackReason;
    if (selectedFeedbackReason === 'other') {
      const otherText = feedbackOtherInput ? feedbackOtherInput.value.trim() : '';
      if (!otherText) {
        alert('Vul een reden in.');
        return;
      }
      finalReason = otherText;
    }
    
    submitFeedback(activeFeedbackIndex, finalReason);
    closeFeedbackModal();
  });
}

function submitFeedback(idx, reason) {
  const subject = getActiveSubject();
  const set = getActiveSet(subject);
  if (!subject || !set) return;
  
  const state = getSetProgress(subject.name, set.title, set.questions);
  if (!state || !state.answers) return;
  
  // Update the answer
  if (state.answers[idx]) {
    state.answers[idx].forceCorrect = true;
    state.answers[idx].forceCorrectReason = reason;
  } else {
    // Should not happen for an answered question, but safe fallback
    state.answers[idx] = { forceCorrect: true, forceCorrectReason: reason };
  }
  
  // Recalculate score
  computeSetCounts(set, state);
  
  // Persist
  persistProgress();
  
  // Re-render
  renderQuizResults(subject);
}
