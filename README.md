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

Firebase is al geconfigureerd in `script.js` met de meegeleverde projectgegevens. Mocht je een eigen project
willen gebruiken, vervang dan de `firebaseConfig` waarden en zorg dat in de Firebase Console de
authenticatiemethodes **E-mail/wachtwoord** en **Google** zijn ingeschakeld.
