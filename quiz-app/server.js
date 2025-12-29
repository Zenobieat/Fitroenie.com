const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const path = require('path')
const os = require('os')
const QRCode = require('qrcode')
const cors = require('cors')
const localtunnel = require('localtunnel')

const app = express()
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } })

function getLocalIp() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

const PORT = process.env.PORT || 3000
const LOCAL_IP = getLocalIp()
global.publicUrl = null

function detectNgrokPublicUrl() {
  return new Promise((resolve) => {
    try {
      const req = http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            const tunnels = json.tunnels || []
            const https = tunnels.find(t => (t.proto === 'https') && t.public_url)
            const httpTunnel = tunnels.find(t => (t.proto === 'http') && t.public_url)
            resolve((https && https.public_url) || (httpTunnel && httpTunnel.public_url) || null)
          } catch {
            resolve(null)
          }
        })
      })
      req.on('error', () => resolve(null))
    } catch {
      resolve(null)
    }
  })
}

app.get('/api/public-base', async (_req, res) => {
  const ngrokUrl = await detectNgrokPublicUrl()
  const base = (process.env.NGROK_URL || ngrokUrl || `http://${LOCAL_IP}:${PORT}`).replace(/\/+$/, '')
  res.json({ base })
})
let games = {}
function now() { return Date.now() }

io.on('connection', (socket) => {
  socket.on('host-create-game', () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString()
    games[pin] = {
      hostSocket: socket.id,
      players: [],
      state: 'lobby',
      codeStatus: 'active',
      usedBy: null,
      createdAt: now(),
      boundOrigin: null
    }
    socket.join(pin)
    const baseUrl = global.publicUrl || `http://${LOCAL_IP}:${PORT}`
    const joinUrl = `${baseUrl}/player.html?pin=${pin}`
    QRCode.toDataURL(joinUrl).then((url) => {
      socket.emit('game-info', { pin, qr: url, url: joinUrl })
      socket.emit('game-created', { pin })
    }).catch(() => {
      socket.emit('game-info', { pin, qr: '', url: joinUrl })
      socket.emit('game-created', { pin })
    })
  })
  socket.on('host-start-game', (pin) => {
    if (games[pin]) {
      games[pin].state = 'playing'
      io.to(pin).emit('game-started')
    }
  })
  socket.on('player-join', (data) => {
    const pin = data.pin
    const nickname = data.nickname
    const deviceId = data.deviceId || socket.id
    const game = games[pin]
    if (game && game.state === 'lobby') {
      if (game.codeStatus === 'active') {
        game.codeStatus = 'used'
        game.usedBy = deviceId
        game.boundOrigin = (data.origin || null)
        setTimeout(() => {
          const g = games[pin]
          if (!g) return
          if (g.state === 'lobby') {
            g.codeStatus = 'active'
            g.usedBy = null
            g.boundOrigin = null
          }
        }, 30000)
      } else if (game.usedBy && game.usedBy !== deviceId) {
        socket.emit('error-msg', 'Code alleen geldig op dit apparaat')
        return
      }
      const player = { id: socket.id, nickname, score: 0 }
      game.players.push(player)
      socket.join(pin)
      socket.emit('join-success')
      io.to(game.hostSocket).emit('update-players', game.players)
    } else {
      socket.emit('error-msg', 'Code bestaat niet of quiz is gestart')
    }
  })
  socket.on('player-answer', (data) => {
    const pin = data.pin
    const answer = data.answer
    if (games[pin]) {
      io.to(games[pin].hostSocket).emit('receive-answer', { playerId: socket.id, answer, pin })
    }
  })
  socket.on('heartbeat', (data) => {
    const pin = data.pin
    const game = games[pin]
    if (!game) return
    const p = game.players.find((pl) => pl.id === socket.id)
    if (p) p.lastSeen = now()
  })
  socket.on('disconnect', () => {
    // best-effort cleanup presence
    for (const pin of Object.keys(games)) {
      const game = games[pin]
      game.players = game.players.filter((pl) => pl.id !== socket.id)
      io.to(game.hostSocket).emit('update-players', game.players)
    }
  })
})

app.get('/health', (_req, res) => {
  res.json({ ok: true, ts: now() })
})
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`=== SERVER STARTED ===`)
  try {
    const tunnel = await localtunnel({ port: PORT })
    global.publicUrl = tunnel.url
    console.log(`🌍 PUBLIC URL: ${global.publicUrl}`)
    console.log(`👉 OPEN HOST: ${global.publicUrl}/host.html`)
    tunnel.on('close', () => { console.log('Tunnel closed') })
  } catch (e) {
    console.log('Localtunnel unavailable, falling back to LAN IP')
    console.log(`Host Screen: http://localhost:${PORT}/host.html`)
    console.log(`Players use: http://${LOCAL_IP}:${PORT}/player.html`)
  }
  console.log(`======================`)
})
