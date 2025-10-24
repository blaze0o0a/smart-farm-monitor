import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { readDataFromDateRange, readRecentData } from '@/lib/fileDataManager'

// 메모리 기반 캘리브레이션 데이터 저장소
const calibrationData: Record<string, number> = {
  temperature: 0,
  humidity: 0,
  ec: 0,
  ph: 0,
  n_factor: 1,
  p_factor: 1,
  k_factor: 1,
  n_offset: 0,
  p_offset: 0,
  k_offset: 0,
}

export function initializeSocketServer(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

  io.on('connection', (socket) => {
    console.log('클라이언트 연결됨:', socket.id)

    // 대시보드 데이터 요청
    socket.on('request:dashboard', async () => {
      try {
        const data = readRecentData(12) // 최근 12시간 데이터
        socket.emit('data:dashboard', data)
      } catch (error) {
        console.error('대시보드 데이터 오류:', error)
        socket.emit('error', '대시보드 데이터를 불러오는데 실패했습니다.')
      }
    })

    // 차트 데이터 요청
    socket.on('request:chart', async (params: { startDate: string; endDate: string }) => {
      try {
        const data = readDataFromDateRange(params.startDate, params.endDate)
        socket.emit('data:chart', data)
      } catch (error) {
        console.error('차트 데이터 오류:', error)
        socket.emit('error', '차트 데이터를 불러오는데 실패했습니다.')
      }
    })

    // 테이블 데이터 요청
    socket.on('request:table', async (params: { startDate: string; endDate: string }) => {
      try {
        const data = readDataFromDateRange(params.startDate, params.endDate)
        socket.emit('data:table', data)
      } catch (error) {
        console.error('테이블 데이터 오류:', error)
        socket.emit('error', '테이블 데이터를 불러오는데 실패했습니다.')
      }
    })

    // 캘리브레이션 데이터 조회
    socket.on('request:calibration', () => {
      try {
        socket.emit('data:calibration', calibrationData)
      } catch (error) {
        console.error('캘리브레이션 데이터 오류:', error)
        socket.emit('error', '캘리브레이션 데이터를 불러오는데 실패했습니다.')
      }
    })

    // 캘리브레이션 데이터 업데이트
    socket.on('update:calibration', (data: { key: string; value: number }) => {
      try {
        calibrationData[data.key] = data.value
        console.log('캘리브레이션 업데이트:', data)
        socket.emit('data:calibration', calibrationData)
      } catch (error) {
        console.error('캘리브레이션 업데이트 오류:', error)
        socket.emit('error', '캘리브레이션 업데이트에 실패했습니다.')
      }
    })

    // 연결 해제
    socket.on('disconnect', () => {
      console.log('클라이언트 연결 해제됨:', socket.id)
    })
  })

  return io
}
