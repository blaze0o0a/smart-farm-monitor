/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * @fileoverview Next.js 커스텀 서버 설정
 * @description Next.js 애플리케이션과 Socket.IO 서버를 통합하는 커스텀 HTTP 서버
 * @module server
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { initializeSocketServer } = require('./src/lib/socketServer.js')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3331

/**
 * Next.js 앱 초기화
 * @type {import('next').NextServer}
 */
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

/**
 * 서버 시작 및 Socket.IO 초기화
 * @description Next.js 앱 준비 후 HTTP 서버와 Socket.IO 서버를 함께 시작
 */
app.prepare().then(async () => {
  // HTTP 서버 생성 (Next.js 요청 처리)
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

  // Socket.IO 서버 초기화 (실시간 통신 지원)
  await initializeSocketServer(httpServer)

  // 서버 시작
  httpServer.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Socket.IO server running on port ${port}`)
  })
})
