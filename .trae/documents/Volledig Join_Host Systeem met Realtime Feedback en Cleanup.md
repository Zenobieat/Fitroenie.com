## Doel
Bouw een strak, betrouwbaar join/host systeem dat op mobiele devices probleemloos werkt via QR of toegangscode, met directe feedback en opgeschoonde code.

## Architectuur
- Hoofdsysteem: Firebase RTDB voor realtime sessies, spelers en status.
- Lokale/Render test: Socket.IO quiz-app blijft als ontwikkel/testpad.
- cPanel fallback: PHP+MySQL polling blijft losstaand voor shared hosting.

## Host Flow
- Creëer lobby met unieke code en rol ‘Host’:
  - [createGameSession](file:///Users/rune/Fitroenie/Fitroenie.com/script.js#L168-L215) zet session + code en deeplink, forceert ensureAuth.
  - QR en deeplink gebruiken een geldige Public Base (HTTPS bij voorkeur).
- UI updates:
  - “Lobby aangemaakt”, connected count, startknop actief op drempel.

## Player Flow
- Speler voert code in of scant QR:
  - [joinGamemodeByCode](file:///Users/rune/Fitroenie/Fitroenie.com/script.js#L505-L582) zet rol ‘player’, presence (connected:true), heartbeat.
- Onmiddellijke bevestiging: “Succesvol gejoined”, toon lobby/controls.

## Realtime Communicatie
- Heartbeat elke 5s: [startHeartbeat](file:///Users/rune/Fitroenie/Fitroenie.com/script.js#L283-L292) en connected detectie ≤15s lastSeen.
- Duidelijke statusupdates in UI:
  - Host: “Lobby aangemaakt”, aantal verbonden.
  - Player: “Verbonden”, “Wachten op host”, “Quiz gestart”.
- Fouten met duidelijke oorzaken:
  - ‘paircode_expired’, ‘code_not_found’, ‘backend_unavailable’, retry-knop.

## QR/Deeplink Base
- Verplicht geldige Public Base (geen localhost; HTTP waarschuwen): [script.js:L9230-L9239](file:///Users/rune/Fitroenie/Fitroenie.com/script.js#L9230-L9239).
- Node QR: tunnel/LAN-IP, nooit localhost: [server.js:L66-L87](file:///Users/rune/Fitroenie/Fitroenie.com/quiz-app/server.js#L66-L87).

## Code Cleanup
- Centraliseer auth: [ensureAuth](file:///Users/rune/Fitroenie/Fitroenie.com/script.js#L167-L173) en gebruik bij alle writes.
- Verwijder/disable legacy en ongebruikte variabelen (diagnostics hints) in [script.js](file:///Users/rune/Fitroenie/Fitroenie.com/script.js).
- Consolidatie eventnamen en foutcodes.
- Device-binding UX verbeteren en auto-reset (30s) in Socket.IO: [server.js:L100-L110](file:///Users/rune/Fitroenie/Fitroenie.com/quiz-app/server.js#L100-L110).

## Mobiele Toegankelijkheid
- Toetsenbordnavigatie en duidelijke states; minimale layout shifts.
- Feedbackchips bovenaan voor verbinding/fout.

## Testscenario’s
- Mobiel (iOS/Android, Wi‑Fi/4G): QR en code-join; mixed-content vermijden.
- Meerdere gelijktijdige joins (10+): presence en UI respons.
- Netwerkissues: timeouts, retry, backend unavailable.
- Render service: health check en joins; Node device-binding reset.
- PHP fallback: API timeouts en foutmeldingen, host en player polling.

## Uitrol
- Hoofdsysteem: push naar main (Pages/Vercel) voor UI/logic updates.
- Render: quiz-app redeploy; health OK.
- cPanel: upload php-quiz en configureer DB.

## Resultaat
- Spelers kunnen via QR/code direct joinen en krijgen rol ‘Player’ + bevestiging.
- Host klikt ‘gamemode’, krijgt code/QR en realtime connected overzicht.
- Code opgeschoond, robuuste verbinding met heldere status en foutafhandeling.
