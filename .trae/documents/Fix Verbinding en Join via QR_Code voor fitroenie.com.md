## Doel
Zorg dat gebruikers probleemloos kunnen joinen via QR en toegangscode, met duidelijke statusupdates en zonder “verbinden…” hangs.

## Bevindingen
- QR-deeplinks en codes: aanwezig in Firebase-gamemode [script.js](file:///Users/rune/Fitroenie/Fitroenie.com/script.js) en Node-app [server.js](file:///Users/rune/Fitroenie/Fitroenie.com/quiz-app/server.js); PHP-polling fallback in [php-quiz](file:///Users/rune/Fitroenie/Fitroenie.com/php-quiz).
- Mogelijke blockers: QR naar localhost, ontbrekende/ongeldige Firebase-auth, verlopen paircodes, mixed content (http vs https), presence/heartbeat niet robuust, Socket device-binding UX.

## Plan: Diagnostiek & Telemetrie
1. Voeg uitgebreide verbindingsstatus toe in de gamemode player-UI: onderscheid “code onbekend”, “paircode verlopen”, “backend niet bereikbaar” (edit [script.js:L880-L931](file:///Users/rune/Fitroenie/Fitroenie.com/script.js#L880-L931)).
2. Log events voor host create/join/failures; zichtbaar in console en optioneel chip in UI (edit [script.js:L289-L294](file:///Users/rune/Fitroenie/Fitroenie.com/script.js#L289-L294)).
3. Health endpoints testen:
   - Node: /health (reeds aanwezig) [server.js:L139-L142](file:///Users/rune/Fitroenie/Fitroenie.com/quiz-app/server.js#L139-L142)
   - PHP: valideer api.php?action=status, toon foutcodes in UI [php-quiz/index.html](file:///Users/rune/Fitroenie/Fitroenie.com/php-quiz/index.html)

## Plan: QR-base en Deeplinks
1. Forceer publieke base (https) in host UI; bij ontbreken geef expliciete waarschuwing en blokkering voor ‘localhost’. Opslag via localStorage en hergebruik (edit [index.html:L431-L437](file:///Users/rune/Fitroenie/Fitroenie.com/index.html#L431-L437), [script.js:L9150-L9226](file:///Users/rune/Fitroenie/Fitroenie.com/script.js#L9150-L9226)).
2. Node-app: gebruik autodetect van ngrok/localtunnel en val terug op LAN-IP, nooit ‘localhost’ in QR (confirm [server.js:L32-L87](file:///Users/rune/Fitroenie/Fitroenie.com/quiz-app/server.js#L32-L87); UI toont base [host.html:L55-L61](file:///Users/rune/Fitroenie/Fitroenie.com/quiz-app/public/host.html#L55-L61)).

## Plan: Auth & RTDB Writes
1. Centraliseer ensureAuth() vóór elke write (codes/paircodes/sessions) met retry/backoff en zichtbare UI-foutmelding (edit [script.js:L168-L175](file:///Users/rune/Fitroenie/Fitroenie.com/script.js#L168-L175)).
2. Voeg specifieke feedback toe bij mislukte set/update op RTDB (edit relevante write-punten [script.js:L203-L205](file:///Users/rune/Fitroenie/Fitroenie.com/script.js#L203-L205), [L232-L237](file:///Users/rune/Fitroenie/Fitroenie.com/script.js#L232-L237)).

## Plan: Presence/Heartbeat
1. Verlaag heartbeat naar 5s; bewaar serverTimestamp; connected-count op basis van lastSeen ≤ 15s en connected-flag (edit [script.js:L271-L287](file:///Users/rune/Fitroenie/Fitroenie.com/script.js#L271-L287), [L365-L370](file:///Users/rune/Fitroenie/Fitroenie.com/script.js#L365-L370)).
2. onDisconnect fallback en duidelijke status “verbinding verbroken” in UI bij tab suspend.

## Plan: Socket Device-Binding UX (Node)
1. Toon duidelijke melding “Code alleen geldig op dit apparaat”; bied reset van codeStatus na 30s indien niet gestart (edit [server.js:L88-L116](file:///Users/rune/Fitroenie/Fitroenie.com/quiz-app/server.js#L88-L116)).
2. Bind ook op origin; bij mismatch toon instructie QR opnieuw op dit toestel.

## Plan: PHP Polling Fallback
1. Voeg QR-tekst (PIN + link) en timeouts/foutmeldingen bij polling (edit [php-quiz/index.html](file:///Users/rune/Fitroenie/Fitroenie.com/php-quiz/index.html)).
2. Zorg dat db.php duidelijke DB-fouten doorgeeft (al aanwezig) [db_connect.php:L17-L31](file:///Users/rune/Fitroenie/Fitroenie.com/php-quiz/db_connect.php#L17-L31).

## Testscenario’s
1. Lokaal (LAN) en Tunnel (HTTPS): iOS/Android op Wi‑Fi en 4G; QR en code‑join.
2. OS varianten: macOS/Windows host; verschillende browsers (Safari/Chrome/Edge).
3. Netwerkomstandigheden: offline backend, trage verbinding, paircode expiry, firewall blok.
4. Gelijktijdig: 10+ spelers; presence correct; start en vraagbroadcast synchroon.

## Uitrol
1. Hoofsite: push naar main (GitHub Pages/Vercel) voor UI updates.
2. Render: service redeploy met quiz-app wijzigingen (rootDir=quiz-app; health check OK).
3. cPanel (PHP): upload php-quiz en configureer DB; test api.php acties.

## Resultaat
- QR en toegangscode join werken probleemloos, met heldere statusupdates en foutmeldingen.
- Geen “verbinden…” hangs: expliciete oorzaken + remedies in UI.
- Robuuste presence en auth; cross-device en multi‑user scenario’s doorstaan tests.
