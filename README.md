# Fitroenie.com

Een eenvoudige single-page webapp met kant-en-klare Anatomie-quizzen en ruimte voor samenvattingen.

## Gebruik
1. Open `index.html` in je browser.
2. Kies bovenaan voor **Quizzen** of **Samenvattingen** binnen het vak **Anatomie**.
3. Maak de vaste hoofdstuk-quizzen:
   - 🟦 Osteologie – 20 examenvragen (A–D)
   - 🟧 Arthrologie – 20 vragen + oplossingen
4. Klik op een optie om een vraag te beantwoorden; je ziet meteen goed/fout. Voortgang (beantwoord/correct) en scores per hoofdstuk worden lokaal bewaard.

Alle gegevens, inclusief je voortgang, worden lokaal in `localStorage` opgeslagen.

### Inloggen met e-mail of Google
- Klik rechtsboven op **Inloggen / Registreren** om het compacte venster te openen. Daar kun je:
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
