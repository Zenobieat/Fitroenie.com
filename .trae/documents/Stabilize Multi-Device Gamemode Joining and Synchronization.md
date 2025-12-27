## Goals
- Ensure flawless multi-device joining (QR and manual code) with robust realtime sync
- Fix connection issues, add reconnection/heartbeat, and clear status indicators
- Optimize loading performance and add comprehensive logging/metrics

## Diagnosis & Root Causes
- ORB blocks external assets ⇒ avatar fallback needed (done), verify other externals
- Anonymous auth sometimes aborted ⇒ add retry/backoff; keep offline BroadcastChannel fallback
- Presence based on a single boolean can be stale ⇒ add heartbeat lastSeen-based presence
- Late-join clients miss current question ⇒ add state sync on subscribe

## Session Model Updates
- sessions/{sessionId}
  - status: waiting | playing | finished
  - currentQuestionIndex, questionStartTs
- sessions/{sessionId}/players/{playerId}
  - nickname, avatarUrl?, role: leader|player
  - connected: true/false, lastSeen (ms), deviceInfo
  - onDisconnect → connected=false
- codes/{code} → sessionId
- sessions/{sessionId}/events (ring buffer ≤ 200): {ts,severity,scope,msg,deviceInfo}

## Connection Manager (Client)
- Heartbeat: write lastSeen every 10s; host counts connected if now-lastSeen ≤ 15s
- Reconnect: exponential backoff (1s→2s→4s up to 15s); resume heartbeat/listeners
- Join handshake:
  1) Resolve code→sessionId
  2) Write player record connected=true
  3) Start heartbeat and subscribe to session + players
  4) On failure → fallback to BroadcastChannel local flow
- QR auto-join: parse mode=game&code, run handshake immediately

## Synchronization Logic
- Host broadcasts questionStartTs and index; players compute countdown client-side
- Clamp drift: if local remaining differs >1s, re-sync with startTs
- Late join: on subscribe, read currentQuestionIndex/startTs and render immediately
- Host-only controls (Start/Next/End); player-only answer buttons; guard by role

## UI/UX Changes
- Host
  - Code chip at top, realtime connected/expected chips
  - Hide QR after first join (or configurable N) and enter fullscreen lobby
  - Button states reflect readiness; open lobby in new tab
- Player
  - Connecting state chip with spinner; 30s timeout + retry
  - Avatar fallback (initials), nickname default for authenticated users
  - Fullscreen play; responsive layout for mobile/desktop

## Performance
- Cache active set; precompute option nodes; avoid innerHTML for frequent updates
- Throttle leaderboard updates to ≤4 fps (250ms)
- Lazy-load avatars; canvas fallback avoids external image fetch

## Error Handling & Logging
- Structured logs to /events and console with severity: info|warn|error
- User messages: code invalid, timeout, network offline
- Metrics counters: joins, submissions, reconnects

## Testing Plan
- Devices: 5–10 devices (iOS/Android/Windows/macOS), Chrome/Safari/Firefox/Edge
- Networks: normal, 3G-slow, offline/airplane toggles, packet loss via devtools
- Flows:
  - Host creates lobby → players join via QR and manual code
  - Verify realtime participant list and connection chips update
  - Start quiz → all clients get question and timer in sync
  - Drop/reconnect on some clients → auto recovery and presence updates
- Reliability: QR → lobby within ≤5s on normal networks; 100% redirect success in tests

## Implementation Steps
1) Implement ConnectionManager (heartbeat, reconnect, handshake)
2) Refactor joinGamemodeByCode and autoJoinFromUrl to use ConnectionManager
3) Update host presence counting from lastSeen + connected
4) Add late-join sync path in player render
5) Add structured logging and metrics writes
6) Throttle UI updates, pre-render option nodes
7) Add retry button in timeout UI; expose expected-min before hiding QR (optional)
8) Run multi-device E2E tests; fix issues found

## Acceptance Criteria
- Multiple devices join and see synchronized lobby/quiz; Start enables correctly
- QR and manual code both succeed reliably; timeout/retry UX clear
- Presence chips reflect real connections; reconnection recovers within ≤15s
- Logs/metrics captured for joins/submissions/reconnects

Please confirm to proceed with implementation and end-to-end testing.