const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const path = require('path')
const os = require('os')
const QRCode = require('qrcode')

const app = express()
const server = http.createServer(app)
const io = new Server(server)
app.use(express.static(path.join(__dirname, 'public')))

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
let PUBLIC_BASE = null

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

async function computePublicBase() {
  if (process.env.NGROK_URL) {
    PUBLIC_BASE = process.env.NGROK_URL.replace(/\/+$/, '')
    return PUBLIC_BASE
  }
  const ngrokUrl = await detectNgrokPublicUrl()
  if (ngrokUrl) {
    PUBLIC_BASE = ngrokUrl.replace(/\/+$/, '')
  } else {
    PUBLIC_BASE = `http://${LOCAL_IP}:${PORT}`
  }
  return PUBLIC_BASE
}

app.get('/api/public-base', async (_req, res) => {
  const base = await computePublicBase()
  res.json({ base })
})
let games = {}

io.on('connection', (socket) => {
  socket.on('host-create-game', () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString()
    games[pin] = { hostSocket: socket.id, players: [], state: 'lobby' }
    socket.join(pin)
    computePublicBase().then((base) => {
      const joinUrl = `${base}/player.html?pin=${pin}`
      QRCode.toDataURL(joinUrl).then((url) => {
        socket.emit('game-created', { pin, qr: url, ip: LOCAL_IP, base })
      }).catch(() => {
        socket.emit('game-created', { pin, qr: '', ip: LOCAL_IP, base })
      })
    }).catch(() => {
      const fallback = `http://${LOCAL_IP}:${PORT}/player.html?pin=${pin}`
      QRCode.toDataURL(fallback).then((url) => {
        socket.emit('game-created', { pin, qr: url, ip: LOCAL_IP, base: `http://${LOCAL_IP}:${PORT}` })
      }).catch(() => {
        socket.emit('game-created', { pin, qr: '', ip: LOCAL_IP, base: `http://${LOCAL_IP}:${PORT}` })
      })
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
    const game = games[pin]
    if (game && game.state === 'lobby') {
      const player = { id: socket.id, nickname, score: 0 }
      game.players.push(player)
      socket.join(pin)
      socket.emit('join-success', { nickname })
      io.to(game.hostSocket).emit('update-players', game.players)
    } else {
      socket.emit('error-message', 'Game not found or already started!')
    }
  })
  socket.on('player-answer', (data) => {
    const pin = data.pin
    const answer = data.answer
    if (games[pin]) {
      io.to(games[pin].hostSocket).emit('player-answered', { playerId: socket.id, answer })
    }
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`)
  console.log(`Network access: http://${LOCAL_IP}:${PORT}`)
})
