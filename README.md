# Fitroenie.com

## Live Deployment (GitHub Pages)
- The repository includes a GitHub Actions workflow that builds and deploys the static site to GitHub Pages from the `main` branch.
- Enable GitHub Pages in repository settings with source: `GitHub Actions`.
- After pushing to `main`, the workflow publishes the site automatically.

## Mobile Connectivity
- For local testing, use your LAN IP or an ngrok URL; avoid `localhost` in QR links.
- In the Host UI, set the public base URL and regenerate the QR to point phones to the correct origin.
- Ensure the phone and PC are on the same WiFi (or use ngrok for HTTPS/4G).

## Node Quiz-App (Local)
- Located in `quiz-app/` for local/mobile testing.
- Install: `npm install` then `node server.js`.
- Host screen: `http://localhost:3000/host.html`
- Players: `http://<your-ip>:3000/player.html`

### Tunnel Mode (Localtunnel)
- Install localtunnel: `npm install localtunnel`
- Start: `node server.js`
- The terminal prints `🌍 PUBLIC URL: https://...loca.lt` — open `/host.html` on your PC and share the QR
- Phones can join over WiFi or 4G because the tunnel provides HTTPS

## Firebase Gamemode
- The main site uses Firebase RTDB for realtime lobby/quiz synchronization.
- Presence uses heartbeat (`lastSeen`) to ensure accurate connected counts.
- QR deep-link and manual code entry both supported.

## Render Deployment (Node)
- Render builds from the repo root by default, but the Node app is in `quiz-app/`.
- Use `render.yaml` (blueprint) or set in Dashboard:
  - Root Directory: `quiz-app`
  - Build Command: `npm install`
  - Start Command: `node server.js`
  - Environment: Node
  - Env Vars: `NODE_ENV=production` (optional)
- Node version on Render defaults to 22.16.0. We set package `engines` to `>=18.18.0 <23.0.0` for compatibility.
- After linking the repo and enabling auto-deploy on `main`, Render will build and start successfully.
