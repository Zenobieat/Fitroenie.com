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

const quizPicker = document.getElementById('quiz-picker');
const quizRunner = document.getElementById('quiz-runner');
const quizResults = document.getElementById('quiz-results');
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
const userChip = document.getElementById('user-chip');
const statusDot = document.querySelector('.status-dot');
const views = document.querySelectorAll('.view');
const viewToggles = document.querySelectorAll('[data-view-target]');
const subjectMenu = document.getElementById('subject-menu');
const subjectMenuPanel = document.getElementById('subject-menu-panel');
const subjectMenuToggle = document.getElementById('subject-menu-toggle');
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
        title: 'Arthrologie – 20 vragen + oplossingen',
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
let activeQuizSetTitle = null;
let activeQuizQuestionIndex = 0;
let quizMode = 'picker';

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
  quizMode = 'picker';
  activeQuizSetTitle = null;
  activeQuizQuestionIndex = 0;
  render();
  setActiveView('anatomie');
  setActivePanel(panelTarget);
  closeSubjectMenu();
}

function openAccountPanel() {
  if (!accountPanel) return;
  accountPanel.hidden = false;
  requestAnimationFrame(() => accountPanel.classList.add('visible'));
  account?.classList.add('open');
  accountToggle?.setAttribute('aria-expanded', 'true');
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

function getActiveSubject() {
  return subjects.find((s) => s.name === activeSubject) ?? null;
}

function getActiveSet(subject = getActiveSubject()) {
  if (!subject || !activeQuizSetTitle) return null;
  return subject.quizSets.find((set) => set.title === activeQuizSetTitle) ?? null;
}

function ensureSetState(subjectName, setTitle) {
  const subjectProgress = progress[subjectName] || (progress[subjectName] = {});
  const state = subjectProgress[setTitle] || (subjectProgress[setTitle] = { answers: {} });
  if (!state.answers) state.answers = {};
  return state;
}

function computeSetCounts(set, state) {
  const answers = state.answers || {};
  const answered = Object.keys(answers).length;
  const correct = set.questions.reduce((acc, question, idx) => {
    const pick = answers[idx];
    return acc + (pick && pick.choice === question.answerIndex ? 1 : 0);
  }, 0);
  state.answered = answered;
  state.correct = correct;
  state.completed = answered === set.questions.length;
  return state;
}

function getSetProgress(subjectName, setTitle, questions = []) {
  const subjectProgress = progress[subjectName];
  const base = subjectProgress?.[setTitle] || { answers: {} };
  const state = { answers: base.answers || {} };
  const answered = Object.keys(state.answers).length;
  const correct = questions.reduce((acc, question, idx) => {
    const pick = state.answers[idx];
    return acc + (pick && pick.choice === question.answerIndex ? 1 : 0);
  }, 0);
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
  delete progress[subjectName][setTitle];
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

  const chips = subject.quizSets
    .map((set) => {
      const state = getSetProgress(subject.name, set.title, set.questions);
      const percent = set.questions.length ? Math.round((state.correct / set.questions.length) * 100) : 0;
      return `<span class="chip${set.title === activeQuizSetTitle ? ' active' : ''}">${set.title.split('–')[0].trim()} · ${
        state.correct
      }/${set.questions.length} · ${percent}%</span>`;
    })
    .join('');

  progressBanner.innerHTML = `
    <div class="progress-banner__top">
      <p class="eyebrow">Vaste hoofdstukken</p>
      <strong>${subject.quizSets.length} quizzen · elk 20 punten</strong>
    </div>
    <div class="progress-banner__chips">${chips}</div>
    <p class="caption">Kies een hoofdstuk, maak de 20 vragen en bekijk daarna je score.</p>
  `;
}

function renderSummary(subject) {
  if (!subject) {
    summaryDisplay.textContent = 'Geen vak geselecteerd.';
    return;
  }
  summaryDisplay.textContent = subject.summary || 'Nog geen samenvatting beschikbaar.';
}

function renderQuizPicker(subject) {
  quizPicker.innerHTML = '';
  if (!subject) {
    quizPicker.innerHTML = '<p class="caption">Geen vak beschikbaar.</p>';
    return;
  }

  subject.quizSets.forEach((set, setIndex) => {
    const state = getSetProgress(subject.name, set.title, set.questions);
    const percent = set.questions.length ? Math.round((state.correct / set.questions.length) * 100) : 0;
    const status = state.completed ? 'Voltooid' : state.answered ? 'Bezig' : 'Niet gestart';

    const card = document.createElement('article');
    card.className = 'quiz-picker__card';
    card.innerHTML = `
      <header class="quiz-picker__header">
        <div>
          <p class="eyebrow">Hoofdstuk ${setIndex + 1}</p>
          <h3>${set.title}</h3>
        </div>
        <div class="chip">${state.correct}/${set.questions.length} correct · ${percent}%</div>
      </header>
      <p class="caption">${status} · ${set.questions.length} vragen</p>
    `;

    const actions = document.createElement('div');
    actions.className = 'quiz-picker__actions';

    const primaryBtn = document.createElement('button');
    primaryBtn.type = 'button';
    primaryBtn.className = 'btn';
    primaryBtn.textContent = state.completed ? 'Bekijk score' : state.answered ? 'Ga verder' : 'Start quiz';
    primaryBtn.addEventListener('click', () => startQuiz(set.title));

    const secondaryBtn = document.createElement('button');
    secondaryBtn.type = 'button';
    secondaryBtn.className = 'btn ghost';
    secondaryBtn.textContent = 'Herstart';
    secondaryBtn.addEventListener('click', () => {
      resetSetProgress(subject.name, set.title);
      if (activeQuizSetTitle === set.title) {
        activeQuizQuestionIndex = 0;
      }
      render();
    });

    actions.append(primaryBtn, secondaryBtn);
    card.appendChild(actions);
    quizPicker.appendChild(card);
  });
}

function startQuiz(setTitle) {
  const subject = getActiveSubject();
  if (!subject) return;
  const set = subject.quizSets.find((quizSet) => quizSet.title === setTitle);
  if (!set) return;
  activeQuizSetTitle = set.title;
  const state = getSetProgress(subject.name, set.title, set.questions);
  activeQuizQuestionIndex = findFirstUnanswered(set, state);
  quizMode = state.completed ? 'results' : 'runner';
  render();
}

function exitQuiz() {
  quizMode = 'picker';
  activeQuizSetTitle = null;
  activeQuizQuestionIndex = 0;
  render();
}

function goToQuestion(delta) {
  const subject = getActiveSubject();
  const set = getActiveSet(subject);
  if (!set) return;
  const nextIndex = Math.min(Math.max(activeQuizQuestionIndex + delta, 0), set.questions.length - 1);
  activeQuizQuestionIndex = nextIndex;
  render();
}

function handleAnswerSelection(choiceIndex) {
  const subject = getActiveSubject();
  const set = getActiveSet(subject);
  if (!subject || !set) return;
  const state = ensureSetState(subject.name, set.title);
  state.answers[activeQuizQuestionIndex] = {
    choiceIndex,
    choice: choiceIndex,
    correct: choiceIndex === set.questions[activeQuizQuestionIndex].answerIndex
  };
  computeSetCounts(set, state);
  persistProgress();
  render();
}

function renderQuizRunner(subject) {
  const set = getActiveSet(subject);
  const state = set ? getSetProgress(subject.name, set.title, set.questions) : null;
  const isRunner = quizMode === 'runner' && !!set;
  quizRunner.hidden = !isRunner;
  if (!isRunner || !set || !state) return;

  const question = set.questions[activeQuizQuestionIndex];
  const answer = state.answers?.[activeQuizQuestionIndex];

  quizRunnerTitle.textContent = set.title;
  quizRunnerSubtitle.textContent = `${state.correct}/${set.questions.length} correct · ${state.answered}/${set.questions.length} beantwoord`;
  quizRunnerStep.textContent = `Vraag ${activeQuizQuestionIndex + 1} van ${set.questions.length}`;
  quizQuestionTitle.textContent = question.question;
  quizQuestionText.textContent = 'Kies het juiste antwoord hieronder.';

  quizOptions.innerHTML = '';
  question.options.forEach((option, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option';
    btn.textContent = option;
    if (answer?.choice === idx) {
      btn.classList.add('selected');
    }
    btn.addEventListener('click', () => {
      handleAnswerSelection(idx);
      quizRunnerHint.textContent = 'Antwoord opgeslagen.';
    });
    quizOptions.appendChild(btn);
  });

  quizPrev.disabled = activeQuizQuestionIndex === 0;
  quizNext.disabled = activeQuizQuestionIndex === set.questions.length - 1;
  quizSubmit.disabled = state.answered < set.questions.length;
  quizRunnerHint.textContent = state.answered < set.questions.length
    ? 'Beantwoord alle 20 vragen om je score te zien.'
    : 'Klaar? Toon je score en bekijk de oplossingen.';
}

function renderQuizResults(subject) {
  const set = getActiveSet(subject);
  const state = set ? getSetProgress(subject.name, set.title, set.questions) : null;
  const isResults = quizMode === 'results' && !!set;
  quizResults.hidden = !isResults;
  if (!isResults || !set || !state) return;

  const percent = set.questions.length ? Math.round((state.correct / set.questions.length) * 100) : 0;
  quizResultsTitle.textContent = `${state.correct}/${set.questions.length} punten`;
  quizResultsSubtitle.textContent = `${percent}% · ${set.title}`;

  quizResultsList.innerHTML = '';
  set.questions.forEach((question, idx) => {
    const userAnswer = state.answers?.[idx];
    const container = document.createElement('article');
    container.className = 'quiz-results__item';

    const correctness = userAnswer?.choice === question.answerIndex ? 'correct' : 'incorrect';
    const userText =
      userAnswer && typeof userAnswer.choice === 'number'
        ? question.options[userAnswer.choice]
        : 'Geen antwoord';

    container.innerHTML = `
      <header class="quiz-results__item-header">
        <p class="eyebrow">Vraag ${idx + 1}</p>
        <span class="chip ${correctness}">${correctness === 'correct' ? 'Juist' : 'Fout'}</span>
      </header>
      <h4>${question.question}</h4>
      <p class="caption"><strong>Jouw antwoord:</strong> ${userText}</p>
      <p class="caption"><strong>Correct:</strong> ${question.options[question.answerIndex]}</p>
    `;

    quizResultsList.appendChild(container);
  });
}

function showResults() {
  const subject = getActiveSubject();
  const set = getActiveSet(subject);
  if (!set || !subject) return;
  const state = getSetProgress(subject.name, set.title, set.questions);
  if (state.answered < set.questions.length) {
    quizRunnerHint.textContent = 'Beantwoord alle vragen voordat je de score bekijkt.';
    return;
  }
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

function render() {
  const subject = getActiveSubject();
  renderSummary(subject);
  renderQuizPicker(subject);
  renderQuizRunner(subject);
  renderQuizResults(subject);
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
  closeAccountPanel();
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
    statusDot?.classList.add('online');
  } else {
    userChip.textContent = 'Niet ingelogd';
    userChip.classList.remove('active');
    statusDot?.classList.remove('online');
  }
}

quizPrev?.addEventListener('click', () => goToQuestion(-1));
quizNext?.addEventListener('click', () => goToQuestion(1));
quizSubmit?.addEventListener('click', showResults);
quizExit?.addEventListener('click', exitQuiz);
quizBack?.addEventListener('click', exitQuiz);
quizRetake?.addEventListener('click', retakeActiveQuiz);

drawerToggle.addEventListener('click', toggleDrawer);
drawerClose.addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);

loginBtn.addEventListener('click', () => openAuthModal('login'));
homeLogin?.addEventListener('click', () => openAuthModal('login'));
accountLogin?.addEventListener('click', () => openAuthModal('login'));
accountRegister?.addEventListener('click', () => openAuthModal('register'));
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

onAuthStateChanged(auth, (user) => {
  updateUserChip(user);
});

render();
setActiveView(activeView);
setActivePanel(activePanel);
