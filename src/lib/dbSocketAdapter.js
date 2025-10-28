/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * DB-Socket 어댑터
 * 데이터베이스와 소켓 서버를 연결하는 어댑터 클래스
 *
 * 사용법:
 * 1. 환경 변수 설정 (.env.local)
 * 2. DB 연결 정보 확인
 * 3. 어댑터 초기화 및 사용
 */

// 환경 변수 기반 설정
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'smart_farm',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  connectionLimit: 20,
  acquireTimeout: 30000,
  timeout: 30000,
}

// DB 연결 상태
let dbPool = null
let isDbConnected = false

/**
 * 데이터베이스 연결 초기화
 */
async function initializeDatabase() {
  // DB 환경 변수가 설정되지 않은 경우 시뮬레이터 모드
  if (!process.env.DB_HOST) {
    console.log('🔧 DB 환경 변수가 설정되지 않음 - 시뮬레이터 모드로 실행')
    return false
  }

  try {
    // MariaDB 연결 (동적 import)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mysql = require('mysql2/promise')
    dbPool = mysql.createPool(DB_CONFIG)

    // 연결 테스트
    const connection = await dbPool.getConnection()
    await connection.query('SELECT NOW()')
    connection.release()

    isDbConnected = true
    console.log('✅ MariaDB 데이터베이스 연결 성공')
    return true
  } catch (error) {
    console.error('❌ MariaDB 데이터베이스 연결 실패:', error.message)
    console.log('🔧 시뮬레이터 모드로 전환')
    isDbConnected = false
    return false
  }
}

/**
 * DB 소켓 어댑터 클래스
 */
class DbSocketAdapter {
  constructor() {
    this.isConnected = isDbConnected
  }

  /**
   * 대시보드 데이터 조회 (최근 12시간)
   */
  async getDashboardData() {
    if (!this.isConnected) {
      throw new Error('데이터베이스가 연결되지 않음')
    }

    const query = `
      SELECT time, temperature, humidity, ec, ph, n, p, k
      FROM sensor_data
      WHERE time >= DATE_SUB(NOW(), INTERVAL 12 HOUR)
      ORDER BY time ASC
    `

    try {
      const [rows] = await dbPool.query(query)
      return rows
    } catch (error) {
      console.error('대시보드 데이터 조회 오류:', error)
      throw error
    }
  }

  /**
   * 차트 데이터 조회 (날짜 범위)
   */
  async getChartData(startDate, endDate) {
    if (!this.isConnected) {
      throw new Error('데이터베이스가 연결되지 않음')
    }

    const query = `
      SELECT time, temperature, humidity, ec, ph, n, p, k
      FROM sensor_data
      WHERE time >= ? AND time <= ?
      ORDER BY time ASC
    `

    try {
      const [rows] = await dbPool.query(query, [startDate, endDate])
      return rows
    } catch (error) {
      console.error('차트 데이터 조회 오류:', error)
      throw error
    }
  }

  /**
   * 테이블 데이터 조회 (날짜 범위)
   */
  async getTableData(startDate, endDate) {
    if (!this.isConnected) {
      throw new Error('데이터베이스가 연결되지 않음')
    }

    const query = `
      SELECT time, temperature, humidity, ec, ph, n, p, k
      FROM sensor_data
      WHERE time >= ? AND time <= ?
      ORDER BY time DESC
    `

    try {
      const [rows] = await dbPool.query(query, [startDate, endDate])
      return rows
    } catch (error) {
      console.error('테이블 데이터 조회 오류:', error)
      throw error
    }
  }

  /**
   * 캘리브레이션 데이터 조회
   */
  async getCalibrationData() {
    if (!this.isConnected) {
      throw new Error('데이터베이스가 연결되지 않음')
    }

    const query = `
      SELECT sensor_key, value
      FROM calibration
      ORDER BY sensor_key
    `

    try {
      const [rows] = await dbPool.query(query)
      const calibrationData = {}
      rows.forEach((row) => {
        calibrationData[row.sensor_key] = row.value
      })
      return calibrationData
    } catch (error) {
      console.error('캘리브레이션 데이터 조회 오류:', error)
      throw error
    }
  }

  /**
   * 캘리브레이션 데이터 업데이트
   */
  async updateCalibrationData(key, value) {
    if (!this.isConnected) {
      throw new Error('데이터베이스가 연결되지 않음')
    }

    const query = `
      INSERT INTO calibration (sensor_key, value, updated_at)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE value = ?, updated_at = NOW()
    `

    try {
      await dbPool.query(query, [key, value, value])
      console.log(`캘리브레이션 업데이트: ${key} = ${value}`)
    } catch (error) {
      console.error('캘리브레이션 업데이트 오류:', error)
      throw error
    }
  }

  /**
   * 센서 데이터 삽입 (실시간 데이터)
   */
  async insertSensorData(sensorData) {
    if (!this.isConnected) {
      throw new Error('데이터베이스가 연결되지 않음')
    }

    const query = `
      INSERT INTO sensor_data (time, temperature, humidity, ec, ph, n, p, k)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `

    const values = [
      sensorData.time,
      sensorData.temperature,
      sensorData.humidity,
      sensorData.ec,
      sensorData.ph,
      sensorData.n,
      sensorData.p,
      sensorData.k,
    ]

    try {
      await dbPool.query(query, values)
    } catch (error) {
      console.error('센서 데이터 삽입 오류:', error)
      throw error
    }
  }

  /**
   * 연결 상태 확인
   */
  isDbConnected() {
    return this.isConnected
  }

  /**
   * 연결 종료
   */
  async close() {
    if (dbPool) {
      await dbPool.end()
      console.log('데이터베이스 연결 종료')
    }
  }
}

/**
 * DB 스키마 생성 (초기 설정용)
 */
async function createSchema() {
  if (!isDbConnected) {
    console.log('데이터베이스가 연결되지 않음')
    return
  }

  const sensorDataTable = `
    CREATE TABLE IF NOT EXISTS sensor_data (
      id INT AUTO_INCREMENT PRIMARY KEY,
      time DATETIME NOT NULL,
      temperature FLOAT(5,2),
      humidity FLOAT(5,2),
      ec FLOAT(5,2),
      ph FLOAT(4,2),
      n FLOAT(5,2),
      p FLOAT(5,2),
      k FLOAT(5,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_sensor_data_time (time)
    );
  `

  const calibrationTable = `
    CREATE TABLE IF NOT EXISTS calibration (
      sensor_key VARCHAR(50) PRIMARY KEY,
      value DECIMAL(10,3) NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `

  try {
    await dbPool.query(sensorDataTable)
    await dbPool.query(calibrationTable)
    console.log('✅ MariaDB 데이터베이스 스키마 생성 완료')
  } catch (error) {
    console.error('❌ MariaDB 스키마 생성 오류:', error)
  }
}

module.exports = {
  initializeDatabase,
  DbSocketAdapter,
  createSchema,
  isDbConnected: () => isDbConnected,
}
