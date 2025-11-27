# Fitroenie.com

Een eenvoudige single-page webapp met kant-en-klare Anatomie-quizzen en ruimte voor samenvattingen.

## Gebruik
1. Open `index.html` in je browser.
2. Gebruik de pillen **Start / Examens / Samenvattingen** of het hoverende **Vakken**-menu (toont nu meerdere vakken) om zonder scrollen van blad te wisselen.
3. In **Examens** kies je eerst een vak (bijv. *Anatomie*) en daarna een onderdeel:
   - *Arthrologie*: het vaste blok **Arthrologie – 20 examenvragen**.
   - *Osteologie*: tweede stap met onderdelen:
    - **Bovenste ledematen**: Atlas (C1), Axis (C2), Cervicale wervels (C3–C7), Thoracale wervels (T1–T12), Lumbale wervels (L1–L5), Os sacrum, Os coccygis, Sternum, Clavicula, Scapula, Humerus, Ulna, Radius, Ossa carpi (elk 20 vragen)
    - **Onderste ledematen**: Patella (mini-quiz, 5 vragen), Os coxae, Femur, Tibia, Fibula, Tarsalia, Talus, Calcaneus
    - **Proef examen**: Osteologie – 20 examenvragen (A–D) en Algemene osteologie (20 vragen)
   - *Myologie*: plaats­houder, volgt later.
   - *Basisonderwijs*, *Blessure preventie*, *Ondernemen in de sport*, *Zelfdeterminatie theorie*: klikbaar in het Vakken-menu met de melding “hier werken we nog aan” zolang er nog geen examens of samenvattingen bestaan.
   Kies een kaart om een examen te starten of te hervatten; elk onderdeel telt afzonderlijk en wordt niet samengenomen.
4. Zodra je start word je naar een apart blad binnen de site gestuurd met alleen de gekozen quiz; beantwoord vraag per vraag met **Vorige/Volgende**. Pas na het invullen van alle vragen verschijnt de knop **Toon score** en krijg je een eigen resultatenblad met je punten en de juiste antwoorden per vraag.

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
