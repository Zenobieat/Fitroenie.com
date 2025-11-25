# Fitroenie.com

Een eenvoudige single-page webapp om vakken aan te maken, samenvattingen op te slaan en quizzen per vak te importeren.

## Gebruik
1. Open `index.html` in je browser.
2. Voeg een nieuw **vak** toe via het formulier.
3. Plak de **samenvatting** voor het geselecteerde vak en klik op "Samenvatting opslaan".
4. Importeer een **quiz** door JSON te plakken in het tekstvak. Verwacht formaat:
   ```json
   [
     { "vraag": "Wat is een cel?", "opties": ["Basiseenheid", "Atomaire kern"], "antwoordIndex": 0 }
   ]
   ```
   - Je kunt ook `question`, `options` en `answerIndex`/`answer`/`correct` gebruiken.
5. Elke quizvraag verschijnt in de tab van het gekozen vak met klikbare opties en feedback.

Alle gegevens worden lokaal in `localStorage` opgeslagen zodat je eigen invoer behouden blijft.

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
