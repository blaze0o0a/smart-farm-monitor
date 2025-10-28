#!/usr/bin/env node

/**
 * 🌱 Smart Farm Setup Checker
 *
 * 스마트팜 모니터링 시스템 설정을 검증하는 스크립트
 *
 * 사용법:
 * npm run check
 * 또는
 * node scripts/setup-check.js
 */

const fs = require('fs')
const path = require('path')

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logHeader(title) {
  console.log('\n' + '='.repeat(50))
  log(`🔍 ${title}`, 'cyan')
  console.log('='.repeat(50))
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

/**
 * 환경 변수 파일 확인
 */
function checkEnvFile() {
  logHeader('환경 변수 파일 확인')

  const envPath = path.join(process.cwd(), '.env.local')
  const envExamplePath = path.join(process.cwd(), 'env.local.example')

  if (fs.existsSync(envPath)) {
    logSuccess('.env.local 파일이 존재합니다.')

    // 환경 변수 로드
    require('dotenv').config({ path: envPath })

    // 필수 환경 변수 확인
    const requiredVars = [
      'DB_HOST',
      'DB_PORT',
      'DB_NAME',
      'DB_USER',
      'DB_PASSWORD',
    ]
    const missingVars = []

    requiredVars.forEach((varName) => {
      if (!process.env[varName]) {
        missingVars.push(varName)
      }
    })

    if (missingVars.length === 0) {
      logSuccess('모든 필수 환경 변수가 설정되었습니다.')
    } else {
      logWarning(`누락된 환경 변수: ${missingVars.join(', ')}`)
      logInfo('시뮬레이터 모드로 실행됩니다.')
    }
  } else {
    logError('.env.local 파일이 없습니다.')

    if (fs.existsSync(envExamplePath)) {
      logInfo('다음 명령어로 템플릿을 복사하세요:')
      log('cp env.local.example .env.local', 'yellow')
    } else {
      logError('env.local.example 템플릿 파일도 없습니다.')
    }
  }
}

/**
 * MariaDB 연결 테스트
 */
async function checkDatabaseConnection() {
  logHeader('MariaDB 연결 테스트')

  if (!process.env.DB_HOST) {
    logWarning('DB 환경 변수가 설정되지 않음 - 시뮬레이터 모드')
    return
  }

  try {
    const mysql = require('mysql2/promise')

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    })

    await connection.query('SELECT 1')
    await connection.end()

    logSuccess('MariaDB 연결 성공!')
  } catch (error) {
    logError(`MariaDB 연결 실패: ${error.message}`)

    if (error.code === 'ECONNREFUSED') {
      logInfo('MariaDB 서버가 실행되지 않았을 수 있습니다.')
      logInfo('다음 명령어로 MariaDB를 시작하세요:')
      log('sudo systemctl start mariadb', 'yellow')
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      logInfo('사용자명 또는 비밀번호가 잘못되었습니다.')
      logInfo('.env.local 파일의 DB_USER, DB_PASSWORD를 확인하세요.')
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      logInfo('데이터베이스가 존재하지 않습니다.')
      logInfo('다음 명령어로 데이터베이스를 생성하세요:')
      log('sudo mysql -u root -p', 'yellow')
      log(`CREATE DATABASE ${process.env.DB_NAME};`, 'yellow')
    }
  }
}

/**
 * 센서 연결 확인
 */
function checkSensorConnection() {
  logHeader('센서 연결 확인')

  const useRealSensor = process.env.USE_REAL_SENSOR === 'true'

  if (!useRealSensor) {
    logInfo('시뮬레이터 모드로 설정됨')
    logInfo(
      '실제 센서를 사용하려면 .env.local에서 USE_REAL_SENSOR=true로 설정하세요.'
    )
    return
  }

  logInfo('실제 센서 모드로 설정됨')

  // sensorReader.js 파일 확인
  const sensorReaderPath = path.join(process.cwd(), 'src/lib/sensorReader.js')
  const sensorReaderExamplePath = path.join(
    process.cwd(),
    'src/lib/sensorReader.js.example'
  )

  if (fs.existsSync(sensorReaderPath)) {
    logSuccess('sensorReader.js 파일이 존재합니다.')
  } else {
    logError('sensorReader.js 파일이 없습니다.')

    if (fs.existsSync(sensorReaderExamplePath)) {
      logInfo('다음 명령어로 템플릿을 복사하세요:')
      log(
        'cp src/lib/sensorReader.js.example src/lib/sensorReader.js',
        'yellow'
      )
    } else {
      logError('sensorReader.js.example 템플릿 파일도 없습니다.')
    }
  }

  // 센서 포트 확인
  const sensorPort = process.env.SENSOR_PORT || '/dev/ttyUSB0'

  if (fs.existsSync(sensorPort)) {
    logSuccess(`센서 포트가 존재합니다: ${sensorPort}`)
  } else {
    logWarning(`센서 포트를 찾을 수 없습니다: ${sensorPort}`)
    logInfo('다음 명령어로 사용 가능한 포트를 확인하세요:')
    log('ls /dev/tty*', 'yellow')
  }
}

/**
 * 필수 패키지 확인
 */
function checkRequiredPackages() {
  logHeader('필수 패키지 확인')

  const packageJsonPath = path.join(process.cwd(), 'package.json')

  if (!fs.existsSync(packageJsonPath)) {
    logError('package.json 파일이 없습니다.')
    return
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  }

  const requiredPackages = [
    'socket.io',
    'socket.io-client',
    'mysql2',
    'next',
    'react',
  ]

  const missingPackages = []

  requiredPackages.forEach((pkg) => {
    if (dependencies[pkg]) {
      logSuccess(`${pkg}: ${dependencies[pkg]}`)
    } else {
      missingPackages.push(pkg)
    }
  })

  if (missingPackages.length > 0) {
    logError(`누락된 패키지: ${missingPackages.join(', ')}`)
    logInfo('다음 명령어로 설치하세요:')
    log(`npm install ${missingPackages.join(' ')}`, 'yellow')
  }
}

/**
 * 포트 사용 확인
 */
function checkPortUsage() {
  logHeader('포트 사용 확인')

  const port = process.env.PORT || 3331

  const { exec } = require('child_process')

  exec(`lsof -ti:${port}`, (error, stdout) => {
    if (stdout.trim()) {
      logWarning(`포트 ${port}가 이미 사용 중입니다.`)
      logInfo('다음 명령어로 프로세스를 종료할 수 있습니다:')
      log(`lsof -ti:${port} | xargs kill -9`, 'yellow')
    } else {
      logSuccess(`포트 ${port}를 사용할 수 있습니다.`)
    }
  })
}

/**
 * 설정 요약 및 권장사항
 */
function showSummaryAndRecommendations() {
  logHeader('설정 요약 및 권장사항')

  const useRealSensor = process.env.USE_REAL_SENSOR === 'true'
  const hasDbConfig = process.env.DB_HOST && process.env.DB_USER

  logInfo('현재 설정:')
  log(
    `  - 데이터베이스: ${hasDbConfig ? 'MariaDB 모드' : '시뮬레이터 모드'}`,
    'blue'
  )
  log(
    `  - 센서: ${useRealSensor ? '실제 센서 모드' : '시뮬레이터 모드'}`,
    'blue'
  )

  console.log('\n📋 다음 단계:')

  if (!hasDbConfig) {
    log('1. MariaDB를 설치하고 .env.local에 DB 정보를 설정하세요.', 'yellow')
  }

  if (useRealSensor) {
    log('2. sensorReader.js 파일을 실제 센서에 맞게 수정하세요.', 'yellow')
  }

  log('3. npm run dev 명령어로 서버를 시작하세요.', 'green')
  log('4. http://localhost:3331에서 애플리케이션을 확인하세요.', 'green')
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.clear()
  log('🌱 Smart Farm Setup Checker', 'magenta')
  log('스마트팜 모니터링 시스템 설정을 확인합니다.\n', 'cyan')

  try {
    checkEnvFile()
    await checkDatabaseConnection()
    checkSensorConnection()
    checkRequiredPackages()
    checkPortUsage()

    // 잠시 대기 (포트 확인 완료를 위해)
    setTimeout(() => {
      showSummaryAndRecommendations()
    }, 1000)
  } catch (error) {
    logError(`설정 확인 중 오류 발생: ${error.message}`)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

module.exports = { main }
