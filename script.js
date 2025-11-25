import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-analytics.js';
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';

const subjectForm = document.getElementById('subject-form');
const subjectNameInput = document.getElementById('subject-name');
const tabs = document.getElementById('subject-tabs');
const summaryDisplay = document.getElementById('summary-display');
const summaryInput = document.getElementById('summary-input');
const saveSummaryBtn = document.getElementById('save-summary');
const quizInput = document.getElementById('quiz-input');
const importQuizBtn = document.getElementById('import-quiz');
const quizList = document.getElementById('quiz-list');
const currentSubjectLabel = document.getElementById('current-subject');
const quizMessage = document.getElementById('quiz-message');
const drawer = document.getElementById('subject-drawer');
const drawerList = document.getElementById('drawer-list');
const drawerToggle = document.getElementById('drawer-toggle');
const drawerOverlay = document.getElementById('drawer-overlay');
const drawerClose = document.getElementById('drawer-close');
const loginBtn = document.getElementById('login-btn');
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
const userChip = document.getElementById('user-chip');

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

const app = initializeApp(firebaseConfig);
isAnalyticsSupported()
  .then((ok) => {
    if (ok) getAnalytics(app);
  })
  .catch((err) => console.warn('Analytics niet beschikbaar:', err));

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

let authMode = 'login';

const STORAGE_KEY = 'fitroenie-subjects';
let subjects = loadSubjects();
let activeSubject = subjects[0]?.name ?? null;

function loadSubjects() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Kon opgeslagen data niet laden', err);
    return [];
  }
}

function persistSubjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
}

function renderTabs() {
  tabs.innerHTML = '';
  subjects.forEach((subject) => {
    const button = document.createElement('button');
    button.className = `tab${subject.name === activeSubject ? ' active' : ''}`;
    button.textContent = subject.name;
    button.type = 'button';
    button.addEventListener('click', () => selectSubject(subject.name));
    tabs.appendChild(button);
  });
}

function renderDrawerList() {
  drawerList.innerHTML = '';
  if (!subjects.length) {
    drawerList.innerHTML = '<p class="caption">Geen vakken toegevoegd.</p>';
    return;
  }
  subjects.forEach((subject) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `drawer__item${subject.name === activeSubject ? ' active' : ''}`;
    item.textContent = subject.name;
    item.addEventListener('click', () => selectSubject(subject.name));
    drawerList.appendChild(item);
  });
}

function renderSummary(subject) {
  if (!subject) {
    summaryDisplay.textContent = 'Selecteer een vak om de samenvatting te tonen.';
    return;
  }
  summaryDisplay.textContent = subject.summary?.trim() || 'Nog geen samenvatting opgeslagen.';
}

function renderQuizCard(question, index) {
  const card = document.createElement('div');
  card.className = 'quiz-card';

  const title = document.createElement('h3');
  title.textContent = `Vraag ${index + 1}`;
  card.appendChild(title);

  const prompt = document.createElement('p');
  prompt.textContent = question.question;
  card.appendChild(prompt);

  const optionsList = document.createElement('div');
  optionsList.className = 'options';

  question.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.type = 'button';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      const isCorrect = idx === question.answerIndex;
      btn.classList.toggle('correct', isCorrect);
      btn.classList.toggle('incorrect', !isCorrect);
      btn.textContent = isCorrect ? `${opt} ✓` : `${opt} ✕`;
    });
    optionsList.appendChild(btn);
  });

  card.appendChild(optionsList);
  return card;
}

function renderQuizList(subject) {
  quizList.innerHTML = '';
  if (!subject) {
    quizList.innerHTML = '<p class="caption">Voeg eerst een vak toe.</p>';
    return;
  }
  if (!subject.quiz?.length) {
    quizList.innerHTML = '<p class="caption">Nog geen quizvragen toegevoegd.</p>';
    return;
  }

  subject.quiz.forEach((question, idx) => {
    quizList.appendChild(renderQuizCard(question, idx));
  });
}

function render() {
  renderTabs();
  const subject = subjects.find((s) => s.name === activeSubject) ?? null;
  currentSubjectLabel.textContent = subject ? `Geselecteerd: ${subject.name}` : 'Nog geen vak geselecteerd';
  summaryInput.value = subject?.summary ?? '';
  renderSummary(subject);
  renderQuizList(subject);
  renderDrawerList();
  persistSubjects();
}

function normalizeQuestion(raw) {
  const question = raw.vraag ?? raw.question ?? raw.prompt;
  const options = raw.opties ?? raw.options ?? raw.choices;
  const answerIndex =
    typeof raw.antwoordIndex === 'number'
      ? raw.antwoordIndex
      : typeof raw.answerIndex === 'number'
        ? raw.answerIndex
        : typeof raw.answer === 'number'
          ? raw.answer
          : typeof raw.correct === 'number'
            ? raw.correct
            : null;

  if (!question || !Array.isArray(options) || options.length === 0 || answerIndex === null) {
    throw new Error('Onvolledige vraag, controleer de sleutel-namen.');
  }

  if (answerIndex < 0 || answerIndex >= options.length) {
    throw new Error('antwoordIndex moet binnen de opties vallen.');
  }

  return { question, options, answerIndex };
}

function addSubject(name) {
  const exists = subjects.some((s) => s.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    selectSubject(name);
    return;
  }
  subjects.push({ name, summary: '', quiz: [] });
  selectSubject(name);
}

function selectSubject(name) {
  activeSubject = name;
  render();
  closeDrawer();
}

function updateSummary() {
  const subject = subjects.find((s) => s.name === activeSubject);
  if (!subject) return;
  subject.summary = summaryInput.value;
  render();
}

function importQuiz() {
  quizMessage.textContent = '';
  quizMessage.className = 'message';
  const subject = subjects.find((s) => s.name === activeSubject);
  if (!subject) {
    quizMessage.textContent = 'Voeg en selecteer eerst een vak om quizzen te importeren.';
    quizMessage.classList.add('error');
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(quizInput.value);
  } catch (err) {
    quizMessage.textContent = 'Kon JSON niet lezen, controleer de syntaxis.';
    quizMessage.classList.add('error');
    return;
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    quizMessage.textContent = 'De quiz moet een array met vragen zijn.';
    quizMessage.classList.add('error');
    return;
  }

  try {
    const normalized = parsed.map(normalizeQuestion);
    subject.quiz.push(...normalized);
    quizMessage.textContent = `Toegevoegd: ${normalized.length} vraag/vragen.`;
    quizMessage.classList.add('success');
    quizInput.value = '';
    render();
  } catch (err) {
    quizMessage.textContent = err.message;
    quizMessage.classList.add('error');
  }
}

function openDrawer() {
  drawer.hidden = false;
  drawerOverlay.hidden = false;
  drawer.classList.add('open');
  drawerOverlay.classList.add('visible');
  drawerToggle.setAttribute('aria-expanded', 'true');
}

function closeDrawer() {
  drawer.classList.remove('open');
  drawerOverlay.classList.remove('visible');
  drawerToggle.setAttribute('aria-expanded', 'false');
  setTimeout(() => {
    drawer.hidden = true;
    drawerOverlay.hidden = true;
  }, 180);
}

function toggleDrawer() {
  if (drawer.classList.contains('open')) {
    closeDrawer();
  } else {
    openDrawer();
  }
}

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
  authModal.hidden = false;
  authOverlay.hidden = false;
  requestAnimationFrame(() => {
    authModal.classList.add('visible');
    authOverlay.classList.add('visible');
  });
  authEmail.focus();
}

function closeAuthModal() {
  authModal.classList.remove('visible');
  authOverlay.classList.remove('visible');
  setTimeout(() => {
    authModal.hidden = true;
    authOverlay.hidden = true;
  }, 180);
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
    showAuthMessage(error.message, 'error');
  }
}

async function loginWithGoogle() {
  showAuthMessage('Google login openen…');
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    showAuthMessage(`Welkom ${user.displayName || user.email}!`, 'success');
    setTimeout(closeAuthModal, 800);
  } catch (error) {
    showAuthMessage(error.message, 'error');
  }
}

function updateUserChip(user) {
  if (user) {
    userChip.textContent = user.displayName || user.email || 'Ingelogd';
    userChip.classList.add('active');
  } else {
    userChip.textContent = 'Niet ingelogd';
    userChip.classList.remove('active');
  }
}

subjectForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = subjectNameInput.value.trim();
  if (!name) return;
  addSubject(name);
  subjectNameInput.value = '';
});

saveSummaryBtn.addEventListener('click', updateSummary);
importQuizBtn.addEventListener('click', importQuiz);
drawerToggle.addEventListener('click', toggleDrawer);
drawerClose.addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);
loginBtn.addEventListener('click', () => openAuthModal('login'));
authClose.addEventListener('click', closeAuthModal);
authOverlay.addEventListener('click', closeAuthModal);
authToggle.addEventListener('click', () => {
  setAuthMode(authMode === 'login' ? 'register' : 'login');
});
authForm.addEventListener('submit', handleAuthSubmit);
googleBtn.addEventListener('click', loginWithGoogle);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !authModal.hidden) closeAuthModal();
});

onAuthStateChanged(auth, (user) => {
  updateUserChip(user);
});

render();
