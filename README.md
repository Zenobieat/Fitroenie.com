# Fitroenie.com

Een eenvoudige single-page webapp met kant-en-klare Anatomie-quizzen en ruimte voor samenvattingen.

## Gebruik
1. Open `index.html` in je browser.
2. Gebruik de pillen **Start / Quizzen / Samenvattingen** of het hoverende **Vakken**-menu in de topbalk (zonder burger-icoon) om zonder scrollen van blad te wisselen.
3. In de tab **Quizzen** zie je vaste categorieën (Bovenste ledematen, Nek tot os coxae, Onderste ledematen) en daaronder het blok **Vaste hoofdstukken**:
    - *Bovenste ledematen*: Quiz 9 — Clavicula, Quiz 10 — Scapula, Quiz 11 — Humerus, Quiz 12 — Ulna, Quiz 13 — Radius, Quiz 14 — Ossa carpi (elk 20 vragen)
    - *Nek tot os coxae*: acht wervel-/rompsets van 20 vragen
      - Quiz 1 — Atlas (C1)
      - Quiz 2 — Axis (C2)
      - Quiz 3 — Cervicale wervels C3–C7
      - Quiz 4 — Thoracale wervels (T1–T12)
      - Quiz 5 — Lumbale wervels (L1–L5)
      - Quiz 6 — Os sacrum
      - Quiz 7 — Os coccygis
      - Quiz 8 — Sternum
   - *Onderste ledematen*: Patella — mini-quiz (5 vragen), Quiz 15 — Os coxae, Quiz 16 — Femur, Quiz 18 — Tibia, Quiz 19 — Fibula, Quiz 20 — Tarsalia, Quiz 21 — Talus, Quiz 22 — Calcaneus
   - *Test Mijn Vak: Osteologie*: Quiz — Algemene osteologie (20 vragen)
    - **Vaste hoofdstukken** blijven beschikbaar:
      - Osteologie – 20 examenvragen (A–D)
      - Arthrologie – 20 vragen + oplossingen
   Kies een kaart om een quiz te starten of te hervatten; elke quiz telt apart en wordt niet samengenomen.
4. Zodra je start word je naar een apart blad binnen de site gestuurd met alleen de gekozen quiz; beantwoord vraag per vraag met **Vorige/Volgende**. Pas na het invullen van alle 20 vragen verschijnt de knop **Toon score** en krijg je een eigen resultatenblad met je punten en de juiste antwoorden per vraag.

Alle gegevens, inclusief je voortgang, worden lokaal in `localStorage` opgeslagen.

### Inloggen met e-mail of Google
- Rechtsboven vind je een accountmenu zonder "Niet ingelogd"-badge:
  - Open direct de modal via **Inloggen / Registreren** (ook vanuit de snelkaart op Home).
  - Klik op het pijltje om het snelle accountpaneel te tonen en kies daar **Inloggen** of **Registreren**.
  In beide gevallen kun je:
  - Inloggen met e-mail & wachtwoord.
  - Een nieuw account registreren via e-mail & wachtwoord.
  - Inloggen met Google via de knop "Log in met Google".

### Firebase configureren
Omdat de voorbeeld-API-sleutel niet gebundeld mag worden, wordt standaard een leeg configuratieobject gebruikt.
Plaats je eigen Firebase-configuratie in `window.FITROENIE_FIREBASE_CONFIG` **vóór** je `script.js` laadt, bijvoorbeeld:

```html
<script>
  window.FITROENIE_FIREBASE_CONFIG = {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'YOUR_FIREBASE_AUTH_DOMAIN',
    projectId: 'YOUR_FIREBASE_PROJECT_ID',
    storageBucket: 'YOUR_FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_FIREBASE_MESSAGING_SENDER_ID',
    appId: 'YOUR_FIREBASE_APP_ID',
    measurementId: 'YOUR_FIREBASE_MEASUREMENT_ID'
  };
</script>
<script type="module" src="./script.js"></script>
```

Zorg dat in de Firebase Console de authenticatiemethodes **E-mail/wachtwoord** en **Google** zijn ingeschakeld.
