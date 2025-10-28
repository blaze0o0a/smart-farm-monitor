/**
 * @fileoverview Socket.IO 서버 및 데이터 관리 모듈
 * @description 실시간 센서 데이터 브로드캐스트, 데이터베이스 연동, 센서 시뮬레이터 제공
 * @module lib/socketServer
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { Server: SocketIOServer } = require('socket.io')
const {
  initializeDatabase,
  DbSocketAdapter,
  createSchema,
} = require('./dbSocketAdapter')

/**
 * 메모리 기반 캘리브레이션 데이터 저장소 (DB 미연결 시 사용)
 * @type {Object}
 * @property {number} temperature - 온도 보정값
 * @property {number} humidity - 습도 보정값
 * @property {number} ec - EC 보정값
 * @property {number} ph - pH 보정값
 * @property {number} n_factor - N 계수
 * @property {number} p_factor - P 계수
 * @property {number} k_factor - K 계수
 * @property {number} n_offset - N 오프셋
 * @property {number} p_offset - P 오프셋
 * @property {number} k_offset - K 오프셋
 */
const calibrationData = {
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

/**
 * 전역 데이터 소스 변수
 * @type {DbSocketAdapter|null} dbAdapter - 데이터베이스 어댑터 인스턴스
 * @type {DataBuffer|null} dataBuffer - 메모리 버퍼 인스턴스
 * @type {RealSensorReader|null} sensorReader - 실제 센서 리더 인스턴스
 * @type {SocketIOServer|null} io - Socket.IO 서버 인스턴스
 * @type {boolean} isUsingDatabase - 데이터베이스 사용 여부
 * @type {boolean} isUsingRealSensor - 실제 센서 사용 여부
 */
let dbAdapter = null
let dataBuffer = null
let sensorReader = null
let io = null
let isUsingDatabase = false
let isUsingRealSensor = false

/**
 * 시뮬레이터를 위한 가짜 센서 데이터 생성
 * @description 시간대별 패턴과 랜덤 노이즈를 포함한 센서 데이터 생성
 * @returns {Object} 센서 데이터 객체
 * @returns {string} time - ISO 8601 시간 문자열
 * @returns {number} temperature - 온도 (°C)
 * @returns {number} humidity - 습도 (%)
 * @returns {number} ec - EC (μS/cm)
 * @returns {number} ph - pH
 * @returns {number} n - 질소 (mg/L)
 * @returns {number} p - 인산 (mg/L)
 * @returns {number} k - 칼륨 (mg/L)
 */
function generateSensorData() {
  const now = new Date()
  const timeIndex = (now.getTime() / (1000 * 60)) % (24 * 60)
  const hour = now.getHours()

  const baseTemp = hour >= 6 && hour <= 18 ? 25 : 20
  const baseHumidity = hour >= 6 && hour <= 18 ? 55 : 65

  return {
    time: now.toISOString(),
    temperature: parseFloat(
      (
        baseTemp +
        Math.sin(timeIndex * 0.1) * 3 +
        Math.random() * 2 -
        1
      ).toFixed(1)
    ),
    humidity: parseFloat(
      (
        baseHumidity +
        Math.cos(timeIndex * 0.1) * 8 +
        Math.random() * 3 -
        1.5
      ).toFixed(1)
    ),
    ec: parseFloat(
      (
        1.2 +
        Math.sin(timeIndex * 0.05) * 0.3 +
        Math.random() * 0.1 -
        0.05
      ).toFixed(1)
    ),
    ph: parseFloat(
      (
        6.5 +
        Math.sin(timeIndex * 0.08) * 0.5 +
        Math.random() * 0.2 -
        0.1
      ).toFixed(1)
    ),
    n: parseFloat(
      (
        0.5 +
        Math.sin(timeIndex * 0.12) * 0.2 +
        Math.random() * 0.1 -
        0.05
      ).toFixed(1)
    ),
    p: parseFloat(
      (
        0.3 +
        Math.cos(timeIndex * 0.15) * 0.2 +
        Math.random() * 0.1 -
        0.05
      ).toFixed(1)
    ),
    k: parseFloat(
      (
        0.4 +
        Math.sin(timeIndex * 0.1) * 0.2 +
        Math.random() * 0.1 -
        0.05
      ).toFixed(1)
    ),
  }
}

// 데이터 버퍼 클래스
class DataBuffer {
  constructor() {
    this.buffer = []
    this.maxSize = 24 * 60 // 24시간 (1분마다)
  }

  add(data) {
    this.buffer.push(data)
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift()
    }
  }

  getRecent(hours) {
    const cutoff = Date.now() - hours * 60 * 60 * 1000
    return this.buffer.filter((d) => new Date(d.time).getTime() > cutoff)
  }

  getRange(startDate, endDate) {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    return this.buffer.filter((d) => {
      const dataTime = new Date(d.time).getTime()
      return dataTime >= start && dataTime <= end
    })
  }

  getStatus() {
    return {
      size: this.buffer.length,
      maxSize: this.maxSize,
    }
  }
}

// 센서 시뮬레이터 시작
function startSensorSimulator() {
  if (!dataBuffer) {
    dataBuffer = new DataBuffer()
  }

  setInterval(() => {
    const newData = generateSensorData()
    dataBuffer.add(newData)

    // 모든 클라이언트에게 broadcast
    if (io) {
      io.emit('data:realtime', newData)
      console.log('실시간 센서 데이터:', {
        time: newData.time,
        temperature: newData.temperature,
        humidity: newData.humidity,
        bufferSize: dataBuffer.getStatus().size,
      })
    }
  }, 60000) // 1분마다

  console.log('센서 시뮬레이터 시작됨 - 1분 간격으로 데이터 생성')
}

async function startRealSensor() {
  try {
    // 실제 센서 리더 동적 import
    const { RealSensorReader } = require('./sensorReader')

    sensorReader = new RealSensorReader({
      type: process.env.SENSOR_TYPE || 'serial',
      port: process.env.SENSOR_PORT || '/dev/ttyUSB0',
      baudRate: process.env.SENSOR_BAUDRATE || '9600',
      interval: process.env.SENSOR_INTERVAL || '60000',
    })

    // 센서 데이터 수신 콜백
    sensorReader.onData(async (newData) => {
      try {
        // DB에 저장 (DB 모드인 경우)
        if (isUsingDatabase && dbAdapter) {
          await dbAdapter.insertSensorData(newData)
        }

        // 메모리 버퍼에 저장 (시뮬레이터 모드 호환)
        if (dataBuffer) {
          dataBuffer.add(newData)
        }

        // 실시간 브로드캐스트
        if (io) {
          io.emit('data:realtime', newData)
          console.log('실제 센서 데이터:', {
            time: newData.time,
            temperature: newData.temperature,
            humidity: newData.humidity,
            source: '실제센서',
          })
        }
      } catch (error) {
        console.error('센서 데이터 처리 오류:', error)
      }
    })

    // 센서 오류 콜백
    sensorReader.onError((error) => {
      console.error('센서 연결 오류:', error.message)
      console.log('🔄 시뮬레이터 모드로 폴백합니다.')

      // 실제 센서 실패 시 시뮬레이터로 폴백
      isUsingRealSensor = false
      if (!dataBuffer) {
        dataBuffer = new DataBuffer()
      }
      startSensorSimulator()
    })

    // 센서 연결 시작
    await sensorReader.start()
    console.log('✅ 실제 센서 연결 성공')
  } catch (error) {
    console.error('❌ 실제 센서 초기화 실패:', error.message)
    console.log('🔧 sensorReader.js 파일이 없거나 센서 연결에 실패했습니다.')
    console.log('🔄 시뮬레이터 모드로 전환합니다.')

    // 실제 센서 실패 시 시뮬레이터로 폴백
    isUsingRealSensor = false
    if (!dataBuffer) {
      dataBuffer = new DataBuffer()
    }
    startSensorSimulator()
  }
}

// 시간 포맷 유틸
function formatKoreanTime(timeString) {
  const date = new Date(timeString)
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

async function initializeSocketServer(httpServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  // 데이터베이스 연결 시도
  isUsingDatabase = await initializeDatabase()

  if (isUsingDatabase) {
    // DB 연결 성공 시
    dbAdapter = new DbSocketAdapter()
    await createSchema() // 스키마 생성
    console.log('🗄️ 데이터베이스 모드로 실행')
  }

  // 실제 센서 사용 여부 확인
  isUsingRealSensor = process.env.USE_REAL_SENSOR === 'true'

  if (isUsingRealSensor) {
    // 실제 센서 모드
    console.log('🔌 실제 센서 모드로 실행')
    if (!dataBuffer) {
      dataBuffer = new DataBuffer() // 실제 센서도 버퍼 사용 (호환성)
    }
    await startRealSensor()
  } else {
    // 시뮬레이터 모드
    console.log('🔧 시뮬레이터 모드로 실행')
    if (!dataBuffer) {
      dataBuffer = new DataBuffer()
    }
    startSensorSimulator()
  }

  io.on('connection', (socket) => {
    console.log('클라이언트 연결됨:', socket.id)

    // 대시보드 데이터 요청
    socket.on('request:dashboard', async () => {
      try {
        let data
        if (isUsingDatabase) {
          data = await dbAdapter.getDashboardData()
        } else {
          data = dataBuffer.getRecent(12)
        }
        socket.emit('data:dashboard', data)
        console.log(
          `대시보드 데이터 전송: ${data.length}개 데이터 (${
            isUsingDatabase ? 'DB' : '시뮬레이터'
          })`
        )
      } catch (error) {
        console.error('대시보드 데이터 오류:', error)
        socket.emit('error', '대시보드 데이터를 불러오는데 실패했습니다.')
      }
    })

    // 차트 데이터 요청
    socket.on('request:chart', async (params) => {
      try {
        let data
        if (isUsingDatabase) {
          data = await dbAdapter.getChartData(params.startDate, params.endDate)
        } else {
          data = dataBuffer.getRange(params.startDate, params.endDate)
        }
        socket.emit('data:chart', data)
        console.log(
          `차트 데이터 전송: ${data.length}개 데이터 (${
            isUsingDatabase ? 'DB' : '시뮬레이터'
          })`
        )
      } catch (error) {
        console.error('차트 데이터 오류:', error)
        socket.emit('error', '차트 데이터를 불러오는데 실패했습니다.')
      }
    })

    // 테이블 데이터 요청
    socket.on('request:table', async (params) => {
      try {
        let data
        if (isUsingDatabase) {
          data = await dbAdapter.getTableData(params.startDate, params.endDate)
        } else {
          data = dataBuffer.getRange(params.startDate, params.endDate)
        }
        const tableData = data.map((item) => ({
          ...item,
          time: formatKoreanTime(item.time),
        }))
        socket.emit('data:table', tableData)
        console.log(
          `테이블 데이터 전송: ${tableData.length}개 데이터 (${
            isUsingDatabase ? 'DB' : '시뮬레이터'
          })`
        )
      } catch (error) {
        console.error('테이블 데이터 오류:', error)
        socket.emit('error', '테이블 데이터를 불러오는데 실패했습니다.')
      }
    })

    // 캘리브레이션 데이터 조회
    socket.on('request:calibration', async () => {
      try {
        let data
        if (isUsingDatabase) {
          data = await dbAdapter.getCalibrationData()
        } else {
          data = calibrationData
        }
        socket.emit('data:calibration', data)
        console.log(
          `캘리브레이션 데이터 전송 (${isUsingDatabase ? 'DB' : '메모리'})`
        )
      } catch (error) {
        console.error('캘리브레이션 데이터 오류:', error)
        socket.emit('error', '캘리브레이션 데이터를 불러오는데 실패했습니다.')
      }
    })

    // 캘리브레이션 업데이트
    socket.on('update:calibration', async (data) => {
      try {
        if (isUsingDatabase) {
          await dbAdapter.updateCalibrationData(data.key, data.value)
          const updatedData = await dbAdapter.getCalibrationData()
          io.emit('data:calibration', updatedData)
        } else {
          calibrationData[data.key] = data.value
          io.emit('data:calibration', calibrationData)
        }
        console.log(
          `캘리브레이션 업데이트: ${data.key} = ${data.value} (${
            isUsingDatabase ? 'DB' : '메모리'
          })`
        )
      } catch (error) {
        console.error('캘리브레이션 업데이트 오류:', error)
        socket.emit('error', '캘리브레이션 업데이트에 실패했습니다.')
      }
    })

    socket.on('disconnect', () => {
      console.log('클라이언트 연결 해제됨:', socket.id)
    })
  })

  console.log('Socket.IO 서버 초기화 완료 - 실시간 센서 데이터 스트림 활성화')
  return io
}

module.exports = { initializeSocketServer }
