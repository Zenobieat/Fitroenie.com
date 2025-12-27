## Doel en Scope
- Ontwerp en bouw een robuuste koppelcode‑flow die precies één andere websitegebruiker koppelt aan de bronquiz.
- Realtime synchronisatie van alle actieve koppelcodes, statusbeheer (actief/gebruikt/verlopen), en duidelijke UI‑feedback.

## Architectuur
- Datastore: Firebase Realtime Database (RTDB) voor realtime tracking.
- Paden:
  - codes/{code}: { sessionId, quizKey, status: active|used|expired, createdAt, expiresAt, usedBy }
  - sessions/{sessionId}: bestaande quizsessie + velden currentQuestionIndex, questionStartTs
- Uniekheid: server‑side transacties op codes/{code} zorgen dat een code slechts één keer wordt aangemaakt/gebruikt.

## Codegeneratie en Uniekheid
- Generator: 6‑cijferige numerieke code (snelle invoer, laag foutpercentage).
- Aanmaak:
  1) Genereer kandidaatcode
  2) Transactie op codes/{code} → alleen schrijven als niet bestaat
  3) Bij conflict retry (max 5 pogingen)
- Koppeling: codes/{code} bevat quizKey en sessionId zodat elke code automatisch aan de juiste quiz is gekoppeld.

## Gebruik van de Koppelcode (1‑op‑1)
- Join flow:
  1) Resolve code → sessionId
  2) Transactie: als status==active → zet status=used, usedBy=playerId; anders weiger met foutmelding
  3) Schrijf spelerrecord (joinedAt, connected=true, lastSeen) en start heartbeat
- Resultaat: exact één andere gebruiker kan koppelen; volgende joinpogingen krijgen “code al gebruikt of verlopen”.

## Statusbeheer en Verlopen
- TTL: expiresAt (bijv. +2 uur). Clients/host tonen resterende tijd.
- Expire job (client‑side host of cloud function) zet status=expired en verwijdert oude codes.

## Realtime Synchronisatie
- Listeners op codes/{code} voor statusupdates (active→used/expired) voor beide apparaten.
- Heartbeat elke 10s (lastSeen) en presence op lastSeen≤15s.

## UI‑Updates
- Visuele bevestiging bij succesvol genereren: “Koppelcode geactiveerd” + chip/badge met code.
- Realtime feedback bij join: toast of banner “Gebruiker gekoppeld”, update connected/expected chips.
- “Volgende vraag” onder elke quizvraag: voeg de knop zichtbaar toe in de vraagweergave (alleen voor leader), naast bestaande controls.
- Duidelijke foutmeldingen: code ongeldig, verlopen, al gebruikt; retry‑opties.

## Logging en Monitoring
- events onder sessions/{sessionId}/events: join_start/success/fail/timeout/reconnect/code_generated/code_used/code_expired.
- Metrics: joins, reconnects, code conflicts, latentie gemeten client‑side.

## Testplan
- Gelijktijdige codegeneratie: race testen met transacties (verwacht geen dubbele codes).
- Meerdere actieve quizzes: codes correct gelinkt aan juiste quizKey.
- Time‑outs: codes verlopen → UI meldt “code verlopen”, join wordt geweigerd.
- Foutieve invoer: validatie exact 6 cijfers; duidelijke fouten.
- Multi‑device: ≥5 apparaten, QR + handmatige code; verschillende netwerken (3G‑slow/packet loss) en accounts.

## Prestatie en Betrouwbaarheid
- Doel: ≥99,9% uptime voor codecommunicatie; ≤200ms p95 voor code‑statusupdates.
- Optimalisaties: regionale RTDB, compacte payloads, throttling van UI‑updates.
- Automatisch herstel: reconnect backoff + resubscribe listeners, heartbeat hervatten.

## Levering
1) Implementatie transacties en statusvelden voor codes
2) Aanpassing join flow met 1‑op‑1 claim en fouten
3) UI‑bevestigingen, realtime feedback, “Volgende vraag” onder vraagweergave
4) Logging/metrics
5) E2E tests volgens testplan
6) Merge naar main en live verificatie

Bevestig, dan voer ik dit plan uit en lever tests + documentatie op.