import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAnalytics, isSupported as isAnalyticsSupported, setAnalyticsCollectionEnabled } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-analytics.js';
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
const subjectSidebar = document.getElementById('subject-sidebar');
const progressBanner = document.getElementById('progress-banner');
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
const profileBack = document.getElementById('profile-back');
const accountProfile = document.getElementById('account-profile');

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
if (firebaseAvailable) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
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
let authMode = 'login';
let lastFocusedElement = null;
let lastQuestionDelta = 0;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const STORAGE_KEY = 'fitroenie-anatomie';
const PROGRESS_KEY = 'fitroenie-progress';
const allowedOsteologySections = ['osteo-upper', 'osteo-lower', 'osteo-proef'];
const VERSION_KEY = 'fitroenie-version';
const CURRENT_VERSION = '2';
const FORCE_CLEAN = (localStorage.getItem(VERSION_KEY) !== CURRENT_VERSION);
if (FORCE_CLEAN) {
  localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
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

function openAnswerCorrect(userText = '', correct) {
  const uSet = new Set(normalizeWords(userText));
  const cWords = Array.isArray(correct) ? correct : normalizeWords(String(correct || ''));
  let matches = 0;
  const seen = new Set();
  for (const w of cWords) {
    if (uSet.has(w) && !seen.has(w)) {
      seen.add(w);
      matches += 1;
      if (matches >= 2) break;
    }
  }
  return matches >= 2;
}

function pickAnswered(pick) {
  if (!pick) return false;
  if (typeof pick.choice === 'number') return true;
  if (typeof pick.text === 'string' && pick.text.trim().length) return true;
  return false;
}

function computePickCorrect(question, pick) {
  if (!question || !pick) return false;
  if (typeof pick.choice === 'number' && typeof question.answerIndex === 'number') {
    return pick.choice === question.answerIndex;
  }
  if (isOpenQuestion(question)) {
    const correctText = question.answerText || (question.answerKeywords ? question.answerKeywords.join(' ') : '');
    return openAnswerCorrect(pick.text || '', correctText);
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
  ];

  const [osteologieHoofdstuk, arthrologieHoofdstuk] = vasteHoofdstukken;

  const anatomie = {
    name: 'Anatomie',
    summary: 'Hier komen de samenvattingen van Anatomie zodra ze beschikbaar zijn.',
    categories: [
      {
        id: 'arthrologie-core',
        domain: 'arthrologie',
        section: 'arthrologie',
        title: 'Arthrologie',
        description: 'Examenvragen over gewrichten en ligamenten.',
        quizSets: [arthrologieHoofdstuk]
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
            title: 'Arthrologie',
            categoryIds: ['arthrologie-core']
          }
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
        description: 'Spieren volgen binnenkort.',
        sections: []
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

  const les2MC = [
    { question: 'Wat zijn de drie fundamenten van goed bewegingsonderwijs?', options: ['Fun – Uithouding – Snelheid', 'Fun – Basis techniek – Basis tactiek', 'Conditie – Techniek – Sport', 'Tactiek – Kracht – Coördinatie'], answerIndex: 1 },
    { question: 'Welke is een klein-motorische vaardigheid?', options: ['Lopen', 'Bal trappen', 'Veters strikken', 'Springen'], answerIndex: 2 },
    { question: 'Wat hoort bij ABV (6–9 jaar)?', options: ['Trefspelen', 'Balanceren', 'Doelspelen', 'Terugslagspelen'], answerIndex: 1 },
    { question: 'Wat is FASE 1 van FRED?', options: ['Overleven', 'Waterwennen', 'Doelmatig voortbewegen', 'Ademtechniek'], answerIndex: 1 },
    { question: 'Waarom gebruik je inkleding?', options: ['Om kinderen rustig te houden', 'Om opdrachten leuker en uitdagender te maken', 'Om tijd te winnen', 'Om minder materiaal te gebruiken'], answerIndex: 1 },
    { question: 'Wie moet bewegingsproblemen leren oplossen?', options: ['Enkel sterke leerlingen', 'Enkel leerkrachten', 'Kinderen zelf', 'Niemand'], answerIndex: 2 },
    { question: 'Wat is een fout bij het noteren van een tikspel?', options: ['Sporttak in hoofdletters', 'Lichaamsdelen met hoofdletter', 'Samengestelde woorden uitschrijven', 'VTB – HB – BAB'], answerIndex: 2 },
    { question: 'Wat is het doel van instructie?', options: ['Kinderen laten spelen', 'Alleen tonen', 'Informatieoverdracht vóór uitvoering', 'Enkel vertellen'], answerIndex: 2 },
    { question: 'Wat hoort bij een goede demo?', options: ['Supersnel voordoen', 'Toon wat je zegt & zeg wat je toont', 'Fouten enkel tonen', 'Niet kijken'], answerIndex: 1 },
    { question: 'Wat is een signaalinstrument?', options: ['Bal', 'Muziek / handtrom / bellenring', 'Pylon', 'Satéstok'], answerIndex: 1 }
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

  const les2Set = { title: 'Basisonderwijs – Les 2 (20 vragen)', questions: [...les2MC, ...les2Open] };

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

  const les4MC = [
    { question: 'Wat is een opstellingsvorm?', options: ['Hoe leerlingen ingedeeld worden in groepen','De manier waarop deelnemers in de ruimte staan t.o.v. elkaar en materiaal','De manier waarop je feedback geeft','De methode om een spel uit te leggen'], answerIndex: 1 },
    { question: 'Wat is géén vuistregel voor opstellingsvormen van leerlingen?', options: ['Overzicht moet mogelijk zijn','Kinderen moeten 1 armlengte afstand houden','Opstelling mag veel tijd kosten','Volledige ruimte benutten'], answerIndex: 2 },
    { question: 'Waar moet de lesgever zich opstellen?', options: ['Tussen de leerlingen','In het midden','Aan de buitenzijde met overzicht','In een hoek van de zaal'], answerIndex: 2 },
    { question: 'Welke opstellingsvorm zie je bij ‘vrij verspreid’? ', options: ['LLN staan in rijen','LLN staan in een kring','LLN staan los verspreid in de zaal','LLN staan in groepen van vier'], answerIndex: 2 },
    { question: 'Welke opstellingsvorm gebruik je voor uitleg aan een grote groep?', options: ['Vrij verspreid','Groepen','Kring / halve kring','Rijen'], answerIndex: 2 },
    { question: 'Wat is een nadeel van oefenen in duo’s (partnerwerk)?', options: ['Geen betrokkenheid','Kans op kietelen, lachen en plagen','Moeilijk voor de leerkracht om overzicht te behouden','De oefeningen duren te lang'], answerIndex: 1 },
    { question: 'Wat is een voordeel van klassikaal werken?', options: ['Weinig feedbackkansen','Overzicht is moeilijk','Iedereen werkt tegelijk → hoge intensiteit','Differentiatie is makkelijk'], answerIndex: 2 },
    { question: 'Bij welke organisatievorm stoppen alle leerlingen tegelijk bij uitleg?', options: ['Postenwerk','Klassikaal','Groepswerk','Omloopvorm'], answerIndex: 1 },
    { question: 'Wanneer gebruik je klassieke organisatievormen?', options: ['Ritmeoefeningen, dans, balvaardigheden','Individuele testen','Lange wachtrijen','Spelen met één bal'], answerIndex: 0 },
    { question: 'Bij welke organisatievorm zijn er vaste hoeken met verschillende oefeningen?', options: ['Klassikaal','Postenwerk','Kringopstelling','Rijen'], answerIndex: 1 }
  ];

  const les4Open = [
    { type: 'open', question: 'Noem de vuistregels voor opstelling van leerlingen.', answerKeywords: ['overzichtelijk','ruimte','benutten','armlengte','afstand','niet','raken','minder','praten','snel','organiseren'] },
    { type: 'open', question: 'Noem de vuistregels voor de opstelling van de lesgever.', answerKeywords: ['overzicht','buitenzijde','mobiel','niet','plaats','blijven','verplaatsen'] },
    { type: 'open', question: 'Geef alle opstellingsvormen die voorkomen in LES 4.', answerKeywords: ['vrij','verspreid','groepen','kring','halve','kring','rangen','rijen'] },
    { type: 'open', question: 'Wat zijn voordelen van klassikaal werken?', answerKeywords: ['hoge','intensiteit','iedereen','tegelijk','overzicht','feedbackkansen','eenvoudige','organisatie','orde'] },
    { type: 'open', question: 'Wat zijn nadelen van klassikaal werken?', answerKeywords: ['geen','differentiatie','stilleggen','groep','uitleg','zelfstandigheid','moeilijk','verschillen'] },
    { type: 'open', question: 'Wanneer gebruik je klassikale organisatie?', answerKeywords: ['opwarming','aanleren','dans','rope','skipping','balvaardigheden','iedereen','tegelijk'] },
    { type: 'open', question: 'Wat zijn kenmerken van partneroefeningen?', answerKeywords: ['per','twee','helpen','ondersteunen','contact','lachen','kietelen','plagen','sociale','interactie'] },
    { type: 'open', question: 'Wat is het doel van organisatievormen?', answerKeywords: ['structuur','veiligheid','overzicht','efficiënt','les','verloop','oefenstof','vlot'] },
    { type: 'open', question: 'Wat moet je noteren bij de opstelling in een lesvoorbereiding?', answerKeywords: ['uitgangshouding','lln','aantal','positie','lk','terreinafbakening','materiaal','aantallen','organisatievorm'] },
    { type: 'open', question: 'Waarom moet een opstelling snel te organiseren zijn?', answerKeywords: ['tijdverlies','vermijden','efficiëntie','meer','beweegtijd','overgang','oefeningen','vlot','aandacht'] }
  ];

  const les4Set = { title: 'Basisonderwijs – Les 4 (20 vragen)', questions: [...les4MC, ...les4Open] };

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
      { id: 'les4', domain: 'basisonderwijs', section: 'les-4', title: 'Les 4', description: 'Les 4 – 20 vragen', quizSets: [les4Set] },
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
    placeholder('Blessure preventie'),
    placeholder('Ondernemen in de sport'),
    placeholder('Zelfdeterminatie theorie')
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
        const exists = targetCat.quizSets.some((set) => set.title === defSet.title);
        if (!exists) {
          targetCat.quizSets.push(deepClone(defSet));
          mutated = true;
        }
      });
    });

    const defaultFlat = getQuizSets(defSubject);
    if (!Array.isArray(existing.quizSets)) {
      existing.quizSets = [];
      mutated = true;
    }
    defaultFlat.forEach((defSet) => {
      const exists = existing.quizSets.some((set) => set.title === defSet.title);
      if (!exists) {
        existing.quizSets.push(deepClone(defSet));
        mutated = true;
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
    const isPanelToggle = !!toggle.dataset.panelTarget;
    const isActive = !isPanelToggle && toggle.dataset.viewTarget === target;
    toggle.classList.toggle('is-active', isActive);
    toggle.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  updateHash();
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
  const subjectProgress = progress[subjectName];
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
      if (!state.answered) return;
      const total = set.questions.length;
      const correct = state.correct || 0;
      const percent = Math.round((correct / total) * 100);
      subjectEntries.push({
        title: formatSetTitle(set.title),
        correct,
        total,
        percent,
        completed: !!state.completed
      });
    });
    if (subjectEntries.length) {
      list.push({ subject: subject.name, entries: subjectEntries });
    }
  });
  return list;
}

function renderSummary(subject) {
  if (!subject) {
    summaryDisplay.textContent = 'Kies eerst een vak via “Vakken”. In Samenvattingen lees je per vak de kernpunten. Selecteer hierboven een vak en klik daarna op Samenvattingen.';
    return;
  }
  summaryDisplay.textContent = subject.summary || 'Nog geen samenvatting beschikbaar.';
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

  if (domain?.id === 'osteologie' && activeOsteologySection) {
    const isValid = normalizedSections.some((sec) => sec.id === activeOsteologySection);
    if (!isValid) activeOsteologySection = null;
  }

  const createSetCard = (set, setIndex) => {
    const state = getSetProgress(subject.name, set.title, set.questions);
    const status = state.completed ? 'Voltooid' : state.answered ? 'Bezig' : 'Niet gestart';
    const setHeading = formatSetTitle(set.title);

    const card = document.createElement('article');
    card.className = 'quiz-picker__card';
    card.innerHTML = `
      <header class="quiz-picker__header">
        <div>
          <p class="eyebrow">Set ${setIndex + 1}</p>
          <h3>${setHeading}</h3>
        </div>
        <div class="chip">${state.answered}/${set.questions.length} beantwoord</div>
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
        <header class="quiz-picker__header">
          <div>
            <p class="eyebrow">Vak</p>
            <h3>${dom.title}</h3>
          </div>
          <div class="chip">${totalSets} sets</div>
        </header>
        <p class="caption">${dom.description || 'Open om te starten.'}</p>
      `;

      const actions = document.createElement('div');
      actions.className = 'quiz-picker__actions';

      const openBtn = document.createElement('button');
      openBtn.type = 'button';
      openBtn.className = 'btn';
      openBtn.textContent = 'Open';
      openBtn.addEventListener('click', () => {
        card.classList.add('is-opening');
        setTimeout(() => card.classList.remove('is-opening'), 240);
        animatePicker(() => {
          activeExamDomain = dom.id;
          activeOsteologySection = null;
          activeQuizSetTitle = null;
          quizMode = 'picker';
          render();
        });
      });

      actions.append(openBtn);
      card.appendChild(actions);
      list.appendChild(card);
    });

    section.appendChild(list);
    quizPicker.appendChild(section);
    return;
  }

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
        <header class="quiz-picker__header">
          <div>
            <p class="eyebrow">Onderdeel</p>
            <h3>${sec.title}</h3>
          </div>
          <div class="chip">${totalSets} sets</div>
        </header>
        <p class="caption">${domain.description || ''}</p>
      `;

      const actions = document.createElement('div');
      actions.className = 'quiz-picker__actions';

      const openBtn = document.createElement('button');
      openBtn.type = 'button';
      openBtn.className = 'btn';
      openBtn.textContent = 'Open';
      openBtn.addEventListener('click', () => {
        card.classList.add('is-opening');
        setTimeout(() => card.classList.remove('is-opening'), 240);
        animatePicker(() => {
          activeOsteologySection = sec.id;
          activeQuizSetTitle = null;
          quizMode = 'picker';
          render();
        });
      });

      actions.append(openBtn);
      card.appendChild(actions);
      list.appendChild(card);
    });

    const backBtn = section.querySelector('#back-to-domains');
    backBtn?.addEventListener('click', resetToDomains);

    section.appendChild(list);
    quizPicker.appendChild(section);
    return;
  }

  const sections = domain.id === 'osteologie'
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

    const backOsteo = sectionEl.querySelector('#back-to-osteologie');
    backOsteo?.addEventListener('click', resetToOsteologySections);

    const backDomainsPlain = sectionEl.querySelector('#back-to-domains-plain');
    backDomainsPlain?.addEventListener('click', resetToDomains);

    sectionEl.appendChild(list);
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
  const domains = subject.examDomains || [];
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
  renderDuringQuiz();
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
  renderDuringQuiz();
}

function renderQuizRunner(subject) {
  const set = getActiveSet(subject);
  const state = set ? getSetProgress(subject.name, set.title, set.questions) : null;
  const isRunner = quizMode === 'runner' && !!set;
  quizRunner.hidden = !isRunner;
  if (!isRunner || !set || !state) return;

  const question = set.questions[activeQuizQuestionIndex];
  const answer = state.answers?.[activeQuizQuestionIndex];

  quizRunnerTitle.textContent = formatSetTitle(set.title);
  quizRunnerSubtitle.textContent = `Vraag ${activeQuizQuestionIndex + 1} van ${set.questions.length}`;
  quizRunnerStep.textContent = `Vraag ${activeQuizQuestionIndex + 1} van ${set.questions.length}`;
  quizQuestionTitle.textContent = question.question;
  quizQuestionText.textContent = 'Kies het juiste antwoord hieronder.';

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
      card.classList.remove('slide-left', 'slide-right');
      if (lastQuestionDelta > 0) card.classList.add('slide-left');
      if (lastQuestionDelta < 0) card.classList.add('slide-right');
      setTimeout(() => {
        card.classList.remove('slide-left', 'slide-right');
      }, 320);
    }
  }
  quizRunnerHint.textContent = !state.answered
    ? 'Kies een antwoord om verder te gaan.'
    : state.answered < set.questions.length
    ? 'Je kan ook je score bekijken; onbeantwoorde vragen tonen "Geen antwoord".'
    : 'Beantwoord deze laatste vraag en bekijk daarna je score.';
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

    container.innerHTML = `
      <header class="quiz-results__item-header">
        <p class="eyebrow">Vraag ${idx + 1}</p>
        <span class="chip ${correctness}">${correctness === 'correct' ? 'Juist' : 'Fout'}</span>
      </header>
      <h4>${question.question}</h4>
      <p class="caption"><strong>Jouw antwoord:</strong> ${userText}</p>
      <p class="caption"><strong>Correct:</strong> ${correctText}</p>
  `;

    quizResultsList.appendChild(container);
  });
}

function profileCardActions() {
  return {
    login: profileLogin,
    register: profileRegister
  };
}

function renderProfile() {
  const user = currentUser;
  const loggedIn = !!user;
  profileHeading.textContent = loggedIn ? 'Je profiel' : 'Log in om je profiel te zien';
  profileSubtitle.textContent = loggedIn
    ? 'Bekijk je gegevens en voortgang per vak.'
    : 'Meld je aan om je e-mail, gebruikersnaam en resultaten te bekijken.';
  profileName.textContent = getUserDisplayName(user);
  profileEmail.textContent = loggedIn ? user.email || 'Geen e-mail gevonden' : 'Geen e-mail bekend';
  profileStatus.textContent = loggedIn
    ? 'Je voortgang wordt lokaal bijgehouden.'
    : 'Geen account actief. Log in of registreer om verder te gaan.';

  const results = buildProfileResults();
  profileQuizList.innerHTML = '';
  if (!results.length) {
    profileQuizList.innerHTML = '<p class="caption">Nog geen resultaten gevonden.</p>';
    profileQuizCount.textContent = '0 voltooide quizzen';
  } else {
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
        row.innerHTML = `
          <div>
            <strong>${entry.title}</strong>
            <p class="caption">${entry.correct}/${entry.total} · ${entry.percent}% juist${entry.completed ? '' : ' (bezig)'} </p>
          </div>
        `;
        row.appendChild(actionBtn);
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

function render() {
  const subject = getActiveSubject();
  activeSubjectHeading.textContent = subject?.name || 'Kies een vak';
  renderSummary(subject);
  renderQuizPicker(subject);
  renderSubjectSidebar(subject);
  renderQuizRunner(subject);
  renderQuizResults(subject);
  renderProfile();
  updateProgressBanner(subject);
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
  loginBtn.textContent = loggedIn ? user?.displayName || user?.email || 'Account' : 'Inloggen / Registreren';
  loginBtn.classList.toggle('primary', loggedIn);
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

if (auth) {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
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
