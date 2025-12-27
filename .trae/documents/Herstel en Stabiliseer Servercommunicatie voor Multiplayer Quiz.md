## Doelstellingen
- 99,9% uptime voor communicatie en ≤200ms end‑to‑end berichtvertraging tussen services/devices
- Betrouwbare automatische reconnect, consistente sessiestatus, volledige logging/observability

## Audit & Analyse
- Inventariseer huidige architectuur (Firebase RTDB/BC channel, eventuele eigen API)
- Controleer domeinen: DNS/TLS, CORS/ORB policies, rate limits, timeouts, auth (anonymous sign‑in)
- Meet actuele latentie p95/p99, foutratio’s en reconnect‑gedrag

## Oorzaakidentificatie
- Identificeer blokkades: ORB/blokkade van externe assets, mislukte anonymous writes, CORS mismatches
- Detecteer sessie race‑conditions (late join zonder sync), stale presence (alleen boolean connected)

## Betrouwbare Verbindingsmethode
- Transport: WebSocket‑gateway (TLS) of gestabiliseerde Firebase RTDB‑kanalen
- Keepalive/Heartbeat: ping/pong elke 10s; presence op lastSeen ≤15s
- Reconnect: exponentiële backoff (1→2→4→8→15s), jitter; state resubscribe na herstel
- Idempotente operaties en sequence numbers voor vraagbroadcasts
- Region‑keuze: multi‑region RTDB of dichtstbijzijnde POP voor ≤200ms

## Sessiesynchronisatie
- Bij join: handshake (code→sessionId), schrijf spelerrecord, start heartbeat, subscribe staat
- Late‑join: lees currentQuestionIndex + startTs en render direct; timer drift clampen
- Rolafbakening: leader (Start/Next/End), player (A/B/C/D, timer); guard op rol

## Logging & Observability
- Structurele events: join_start/join_success/join_fail/timeout/reconnect/quiz_started
- Metrics: joins, reconnects, submissions, latency (client‑gemeten), foutratio
- Health checks: /health endpoint + synthetic pings tussen services, alerting bij overschrijdingen

## Foutafhandeling & Herstel
- Timeouts: 15–30s met duidelijke UI en Retry
- Offline fallback: BroadcastChannel voor lokale sessies indien backend onbereikbaar
- ORB/CORS: referrerpolicy en fallback avatars; consistente headers (Access‑Control‑Allow‑Origin)

## Performance Optimalisatie
- UI throttling (leaderboard ≤4 fps), pre‑render knoppen, minimaliseer innerHTML
- Batch updates, compressie, kleine payloads; regionale routing voor lage latentie

## Validatie & Testen
- Multi‑device (≥5) op iOS/Android/Windows/macOS; Chrome/Safari/Firefox/Edge
- Netwerken: normaal/3G‑slow/packet loss; offline/online toggles
- Testcases: QR en handmatige code, massale joins, reconnect scenari’s, rol‑isolatie, vraag‑sync
- SLO‑checks: p95 ≤200ms berichtvertraging; uptime simulaties met chaos tests

## Documentatie & Runbook
- Architectuuroverzicht, dataschema’s, SLO’s, herstelprocedures, logging‑event catalogus
- Operaties: rollouts, feature flags, incidentrespons en dashboards

## Levering
- Implementatie verbindingsmanager (heartbeat/reconnect), sessiesync en logging
- UI‑updates met duidelijke statusindicatoren en retry
- End‑to‑end testrapport en stabiliteitsmeting
- Merge naar main en live verificatie

Bevestig als je akkoord bent; daarna voer ik de implementatie, tests en merge uit. 