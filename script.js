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

const quizList = document.getElementById('quiz-list');
const summaryDisplay = document.getElementById('summary-display');
const sectionTabs = document.getElementById('section-tabs');
const panels = document.querySelectorAll('[data-panel]');
const progressBanner = document.getElementById('progress-banner');
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
const views = document.querySelectorAll('.view');
const viewToggles = document.querySelectorAll('[data-view-target]');
const subjectMenu = document.getElementById('subject-menu');
const subjectMenuPanel = document.getElementById('subject-menu-panel');
const subjectMenuToggle = document.getElementById('subject-menu-toggle');

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

const STORAGE_KEY = 'fitroenie-anatomie';
const PROGRESS_KEY = 'fitroenie-progress';
const defaultSubjects = [
  {
    name: 'Anatomie',
    summary: 'Hier komen de samenvattingen van Anatomie zodra ze beschikbaar zijn.',
    quizSets: [
      {
        title: '🟦 Osteologie – 20 examenvragen (A–D)',
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
        title: '🟧 Arthrologie – 20 vragen + oplossingen',
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
    ]
  }
];

let subjects = loadSubjects();
let progress = loadProgress();
let activeSubject = subjects[0]?.name ?? 'Anatomie';
let activeView = 'home';
let activePanel = 'quiz-panel';

function loadSubjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((s) => Array.isArray(s.quizSets))) {
        return parsed;
      }
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

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.warn('Kon voortgang niet laden.', error);
    return {};
  }
}

function persistProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function setActiveView(target) {
  activeView = target;
  views.forEach((view) => {
    const isMatch = view.dataset.view === target;
    view.classList.toggle('active', isMatch);
    view.classList.toggle('hidden', !isMatch);
  });

  viewToggles.forEach((toggle) => {
    const isActive = toggle.dataset.viewTarget === target;
    toggle.classList.toggle('is-active', isActive);
    toggle.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setActivePanel(panelId) {
  activePanel = panelId;
  panels.forEach((panel) => {
    const match = panel.dataset.panel === panelId;
    panel.hidden = !match;
  });

  const tabButtons = sectionTabs?.querySelectorAll('[data-panel-target]') ?? [];
  tabButtons.forEach((btn) => {
    const isActive = btn.dataset.panelTarget === panelId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

function handleSubjectNavigation(subjectName, panelTarget = 'quiz-panel') {
  activeSubject = subjectName;
  render();
  setActiveView('anatomie');
  setActivePanel(panelTarget);
  closeSubjectMenu();
}

function renderSubjectMenu() {
  if (!subjectMenuPanel) return;
  subjectMenuPanel.innerHTML = '';
  if (!subjects.length) {
    subjectMenuPanel.innerHTML = '<p class="caption">Geen vakken beschikbaar.</p>';
    return;
  }

  subjects.forEach((subject) => {
    const item = document.createElement('div');
    item.className = 'subject-menu__item';

    const title = document.createElement('p');
    title.className = 'subject-menu__name';
    title.textContent = subject.name;

    const actions = document.createElement('div');
    actions.className = 'subject-menu__actions';

    const quizBtn = document.createElement('button');
    quizBtn.type = 'button';
    quizBtn.className = 'chip';
    quizBtn.textContent = 'Quizzen';
    quizBtn.addEventListener('click', () => handleSubjectNavigation(subject.name, 'quiz-panel'));

    const summaryBtn = document.createElement('button');
    summaryBtn.type = 'button';
    summaryBtn.className = 'chip ghost';
    summaryBtn.textContent = 'Samenvattingen';
    summaryBtn.addEventListener('click', () => handleSubjectNavigation(subject.name, 'summary-panel'));

    actions.append(quizBtn, summaryBtn);
    item.append(title, actions);
    subjectMenuPanel.appendChild(item);
  });
}

function renderDrawerList() {
  drawerList.innerHTML = '';
  if (!subjects.length) {
    drawerList.innerHTML = '<p class="caption">Geen vakken beschikbaar.</p>';
    return;
  }
  subjects.forEach((subject) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `drawer__item${subject.name === activeSubject ? ' active' : ''}`;
    item.textContent = subject.name;
    item.addEventListener('click', () => {
      activeSubject = subject.name;
      render();
      closeDrawer();
    });
    drawerList.appendChild(item);
  });
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

function getSetProgress(subjectName, setTitle) {
  const subjectProgress = progress[subjectName];
  if (!subjectProgress) return { answered: 0, correct: 0, answers: {} };
  return subjectProgress[setTitle] || { answered: 0, correct: 0, answers: {} };
}

function updateProgressBanner(subject) {
  if (!subject) {
    progressBanner.textContent = '';
    return;
  }
  const totalQuestions = subject.quizSets.reduce((acc, set) => acc + set.questions.length, 0);
  const totals = subject.quizSets.reduce(
    (acc, set) => {
      const state = getSetProgress(subject.name, set.title);
      acc.answered += state.answered || 0;
      acc.correct += state.correct || 0;
      return acc;
    },
    { answered: 0, correct: 0 }
  );
  const percent = totalQuestions ? Math.round((totals.correct / totalQuestions) * 100) : 0;
  progressBanner.innerHTML = `
    <div class="progress-banner__top">
      <p class="eyebrow">Voortgang Anatomie</p>
      <strong>${totals.correct}/${totalQuestions} correct</strong>
    </div>
    <div class="progress">
      <div class="progress__bar" style="width:${percent}%"></div>
    </div>
    <p class="caption">${totals.answered}/${totalQuestions} beantwoord · ${percent}% gescoord</p>
  `;
}

function renderSummary(subject) {
  if (!subject) {
    summaryDisplay.textContent = 'Geen vak geselecteerd.';
    return;
  }
  summaryDisplay.textContent = subject.summary || 'Nog geen samenvatting beschikbaar.';
}

function renderQuizCard(subject, setTitle, question, index) {
  const card = document.createElement('div');
  card.className = 'quiz-card';

  const header = document.createElement('div');
  header.className = 'quiz-card__header';
  header.innerHTML = `<h3>Vraag ${index + 1}</h3>`;
  card.appendChild(header);

  const prompt = document.createElement('p');
  prompt.textContent = question.question;
  card.appendChild(prompt);

  const optionsList = document.createElement('div');
  optionsList.className = 'options';

  const setProgress = getSetProgress(subject.name, setTitle);
  const answeredState = setProgress.answers?.[index];

  question.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.type = 'button';
    btn.textContent = opt;

    if (answeredState) {
      const isChosen = answeredState.choice === idx;
      const isCorrect = idx === question.answerIndex;
      if (isChosen) {
        btn.classList.add(answeredState.correct ? 'correct' : 'incorrect');
        btn.textContent = `${opt} ${answeredState.correct ? '✓' : '✕'}`;
      }
      btn.disabled = true;
      if (isCorrect && !isChosen) {
        btn.classList.add('ghost');
      }
    }

    btn.addEventListener('click', () => handleAnswer(subject, setTitle, index, idx, question, btn));
    optionsList.appendChild(btn);
  });

  card.appendChild(optionsList);
  return card;
}

function handleAnswer(subject, setTitle, questionIndex, optionIndex, question, button) {
  const isCorrect = optionIndex === question.answerIndex;
  const subjectProgress = progress[subject.name] || (progress[subject.name] = {});
  const setState = subjectProgress[setTitle] || (subjectProgress[setTitle] = { answered: 0, correct: 0, answers: {} });

  if (setState.answers[questionIndex]) return;

  setState.answers[questionIndex] = { choice: optionIndex, correct: isCorrect };
  setState.answered += 1;
  if (isCorrect) setState.correct += 1;

  button.classList.add(isCorrect ? 'correct' : 'incorrect');
  button.textContent = `${button.textContent} ${isCorrect ? '✓' : '✕'}`;
  button.disabled = true;

  persistProgress();
  render();
}

function renderQuizList(subject) {
  quizList.innerHTML = '';
  if (!subject) {
    quizList.innerHTML = '<p class="caption">Geen vak beschikbaar.</p>';
    return;
  }

  subject.quizSets.forEach((set, setIndex) => {
    const group = document.createElement('section');
    group.className = 'quiz-group';

    const state = getSetProgress(subject.name, set.title);
    const setPercent = set.questions.length
      ? Math.round((state.correct / set.questions.length) * 100)
      : 0;

    group.innerHTML = `
      <header class="quiz-group__header">
        <div>
          <p class="eyebrow">Hoofdstuk ${setIndex + 1}</p>
          <h3>${set.title}</h3>
        </div>
        <div class="chip">${state.correct}/${set.questions.length} correct · ${setPercent}%</div>
      </header>
    `;

    set.questions.forEach((question, idx) => {
      group.appendChild(renderQuizCard(subject, set.title, question, idx));
    });

    quizList.appendChild(group);
  });
}

function render() {
  const subject = subjects.find((s) => s.name === activeSubject) ?? null;
  renderSummary(subject);
  renderQuizList(subject);
  updateProgressBanner(subject);
  renderDrawerList();
  renderSubjectMenu();
  persistSubjects();
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
    if (viewTarget) setActiveView(viewTarget);
    if (panelTarget) setActivePanel(panelTarget);
  });
});

subjectMenu?.addEventListener('mouseenter', openSubjectMenu);
subjectMenu?.addEventListener('mouseleave', closeSubjectMenu);
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
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !authModal.hidden) closeAuthModal();
});

onAuthStateChanged(auth, (user) => {
  updateUserChip(user);
});

render();
setActiveView(activeView);
setActivePanel(activePanel);
