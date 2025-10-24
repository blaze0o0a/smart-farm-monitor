const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { initializeSocketServer } = require('./src/lib/socketServer')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3331

// Next.js 앱 초기화
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // HTTP 서버 생성
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Socket.IO 서버 초기화
  const io = initializeSocketServer(httpServer)

  // 서버 시작
  httpServer.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Socket.IO server running on port ${port}`)
  })
})
