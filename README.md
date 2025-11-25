# Fitroenie.com

Een eenvoudige single-page webapp met kant-en-klare Anatomie-quizzen en ruimte voor samenvattingen.

## Gebruik
1. Open `index.html` in je browser.
2. Gebruik de pillen **Start / Quizzen / Samenvattingen** of het hoverende **Vakken**-menu in de topbalk om zonder scrollen van blad te wisselen.
3. In de tab **Quizzen** zie je de twee vaste hoofdstuk-quizzen (elk 20 vragen / 20 punten):
   - Osteologie – 20 examenvragen (A–D)
   - Arthrologie – 20 vragen + oplossingen
   Kies één kaart om die quiz te starten of te hervatten; elke quiz telt apart en wordt niet samengenomen.
4. Beantwoord vraag per vraag met **Vorige/Volgende**. Pas na het invullen van alle 20 vragen verschijnt de knop **Toon score**; je krijgt daarna een apart resultatenblad met je punten en de juiste antwoorden per vraag.

Alle gegevens, inclusief je voortgang, worden lokaal in `localStorage` opgeslagen.

### Inloggen met e-mail of Google
- Rechtsboven vind je een accountmenu met statusdot en twee opties:
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
