## Observed Issue
- Second device enters code and remains on “Bezig...”/loading without transitioning into lobby.
- Likely causes: blocked/aborted anonymous writes, unresolved DB reads without timeout, join flow missing retry/fallback on manual code entry, inconsistent presence detection.

## Debug Steps
- Inspect network requests for code→sessionId resolution and player write; capture error codes/timeouts.
- Verify Firebase rules permit anonymous players; confirm auth state on device.
- Check if host created lobby via backend or offline mode; ensure consistent fallback path.
- Review console logs for ORB or aborted requests.

## Implementation Plan
### 1) Player Join Hardening
- Add signInAnonymously before DB operations when user not logged in.
- Wrap code→sessionId GET and player write in a 10–15s timeout; resolve UI state on timeout.
- Manual Join modal: replace “Bezig...” with “Verbinden…”, show spinner, and add “Opnieuw proberen” button.
- On failure: fall back to BroadcastChannel local join (if host is offline or backend unavailable), with informative message.

### 2) Connection Manager Integration
- Ensure heartbeat lastSeen starts immediately after join; presence computed as lastSeen freshness ≤15s.
- Auto-reconnect resume heartbeat/listeners; log reconnect attempts.

### 3) Late-Join Sync
- On subscribe, immediately render currentQuestionIndex and questionStartTs; clamp timer drift.

### 4) Structured Logging & Metrics
- Log join_start, join_success, join_fail, timeout, fallback_used, reconnect events into sessions/{sessionId}/events; increment metrics counters for joins and reconnects.

### 5) UI/UX Updates
- Manual Join modal: spinner + retry; clear messaging on timeout and failure.
- Keep lobby code visible at top on both host and player; consistent labels.

### 6) Testing Matrix
- Devices: iOS/Android/Windows/macOS, Chrome/Safari/Firefox/Edge.
- Networks: normal, 3G-slow, toggled offline/packet loss via DevTools.
- Scenarios: 5+ simultaneous joins via QR and manual; mix of same/different accounts; backend reachable/unreachable.
- Verify: lobby updates in real-time; Start enables correctly; quiz sync across all participants; reconnection recovers within ≤15s.

### 7) Deliverables
- Code changes implementing auth, timeouts, fallback, logging, and UI improvements.
- Test report with results, issues found, and fixes applied.
- Merge to main and confirm site update after verification.

If approved, I will implement these changes, run the multi-device tests, resolve any issues found, and merge to main so the website updates.