## Overview
- Add a real-time, Kahoot-style “Gamemode” that works on desktop (host) and mobile (players)
- Reuse existing quiz sets and question structure from the current site [index.html](file:///Users/rune/Fitroenie/Fitroenie.com/index.html) and [script.js](file:///Users/rune/Fitroenie/Fitroenie.com/script.js)
- Use Firebase Realtime Database for low-latency session state, leveraging the already initialized Firebase app

## Architecture
- Client-only web app (no custom server) + Firebase Realtime Database (RTDB)
- New RTDB namespaces:
  - sessions/{sessionId}: session metadata and host-controlled state
  - sessions/{sessionId}/players/{playerId}: per-player state (nickname, score, presence)
  - sessions/{sessionId}/answers/{questionIndex}/{playerId}: players’ submitted answers + timing
- Deep links: https://fitroenie.com/?mode=game&code=XXXX-XXXX&subject=…&set=…
- QR contains the above URL; code lookup maps to sessionId

## Data Model
- Session:
  - { code, hostId, subjectName, setTitle, status: 'waiting'|'playing'|'finished', currentQuestionIndex, questionStartTs, createdAt, expiresAt }
- Player:
  - { nickname, joinedAt, score, connected: true, lastAnswer: { index, choice|text, elapsedMs, correct } }
- Answer (per question):
  - { playerId, choice|text, elapsedMs, correct, points }

## Security Rules (RTDB)
- Only hostId can write session state (currentQuestionIndex, status, questionStartTs)
- Players can write their own node under players/{playerId} and answers/{questionIndex}/{playerId}
- No one can write another player’s score; host writes scores
- Enforce code/session TTL via expiresAt checks

## Desktop Host UX
- Quiz selection: add Gamemode button in [quiz-picker](file:///Users/rune/Fitroenie/Fitroenie.com/script.js#L7392-L7675)
- Host creates session → generates unique XXXX-XXXX code + QR to deep link
- Waiting room: shows live join count and nicknames
- Play view: shows current question, 4 answers styled like Kahoot, 30s timer, live answer count
- Leaderboard: real-time top players during play
- End view: podium animation for top 3

## Mobile Player UX
- Add “Gamemode” tab next to “Oefenen” in the segmented tabbar [index.html](file:///Users/rune/Fitroenie/Fitroenie.com/index.html#L89-L93)
- Login methods:
  - Scan QR (camera + zxing-js or jsQR; fallback to file upload if camera denied)
  - Manual entry of XXXX-XXXX code
- Join: enter nickname (guest allowed), then lobby
- Play screen: large A/B/C/D buttons and prominent 30s countdown; shows question text
- Feedback: instant visual for correct/incorrect after reveal

## Game Flow
1. Host picks quiz set (existing sets), clicks Gamemode
2. Session created; players join via QR or code
3. Host starts each question → writes currentQuestionIndex + questionStartTs to RTDB
4. Players submit answer once; client records elapsed time (Date.now - questionStartTs)
5. Host resolves answers:
   - Correctness via existing logic [computePickCorrect](file:///Users/rune/Fitroenie/Fitroenie.com/script.js#L215-L225)
   - Scoring formula (below); host writes points to players/{playerId}/score and answers/{index}
6. Real-time leaderboard updates; next question
7. After 20 questions, show podium

## Scoring
- 20 questions per session
- Points only for correct answers
- Per-question points: base 1000 scaled by speed
  - elapsedSec = min(30, (now - questionStartTs) / 1000)
  - timeFactor = (30 - elapsedSec) / 30
  - points = correct ? round(1000 * (0.5 + 0.5 * timeFactor)) : 0
- Mandatory 30-second timer; late answers ignored

## Synchronization
- Host state drives question and timer; players listen via onValue
- Presence: players/{playerId}/connected toggled via onDisconnect()
- Latency: RTDB chosen for sub-200ms updates; debounce UI updates client-side

## Error Handling
- Camera/QR denied: fall back to manual code entry
- Connectivity loss: show reconnect banner and retry; use offline persistence where safe
- Invalid/expired code: friendly error and return to lobby
- Collision handling for codes; regenerate if taken

## Visual Design
- Keep Manrope typography and chip/button styles
- New components:
  - Gamemode button in quiz-picker; desktop host cards styled like existing [quiz-runner](file:///Users/rune/Fitroenie/Fitroenie.com/script.js#L7799-L7932)
  - Mobile A/B/C/D buttons using existing option rendering pattern [options](file:///Users/rune/Fitroenie/Fitroenie.com/script.js#L7893-L7907) but larger touch targets
  - Engaging podium CSS animation

## Technical Implementation Steps
1. Add Firebase RTDB import (10.12.x) alongside auth/analytics in script.js
2. Code generator: secure, unique XXXX-XXXX; store sessions/{sessionId} + codes/{code} → sessionId
3. QR generation: lightweight CDN lib (qrcode.js) or Canvas API
4. Host UI:
   - Gamemode creation in quiz-picker and waiting room
   - Question broadcast + timer start; lock answers at 30s
   - Score computation using computePickCorrect; write to RTDB
5. Player UI:
   - Gamemode tab
   - QR scanner and manual code entry
   - Large answer buttons + countdown
6. Leaderboard: subscribe to players/{}/score; show top N
7. Podium: compute final ranking; animation
8. Security: add RTDB rules file (host-only write to session; players write own subtrees)
9. Telemetry: minimal counters (joins, submissions) to help stress testing

## Testing Plan
- Cross-device: Mac/PC desktop Chrome/Safari + iOS Safari/Android Chrome
- Login methods: QR and manual code; camera permission matrix
- Validate scoring/timing: deterministic tests with mocked questionStartTs
- Podium accuracy: tie-breaking, same score ordering
- Concurrency: simulate 50–100 players using a scripted client; observe latency and dropped updates

## Notes on Existing Code
- Reuse question rendering and correctness:
  - Option rendering [script.js:L7893-L7907](file:///Users/rune/Fitroenie/Fitroenie.com/script.js#L7893-L7907)
  - Correctness logic [script.js:L215-L225](file:///Users/rune/Fitroenie/Fitroenie.com/script.js#L215-L225)
- Keep current progress storage intact; gamemode is separate, host-controlled

## Deliverables
- Desktop and mobile gamemode UIs
- RTDB-backed real-time engine with secure session codes
- QR + manual join
- Leaderboard + podium animation
- Error handling and stress test harness

Please confirm to proceed with implementation based on this plan.