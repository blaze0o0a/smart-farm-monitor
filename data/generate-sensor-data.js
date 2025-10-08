/* eslint-disable */
const fs = require('fs')
const path = require('path')

// 현재 시간의 센서 데이터 생성 함수
function generateCurrentSensorData() {
  const now = new Date()
  const timeIndex = (now.getTime() / (1000 * 60)) % (24 * 60) // 하루를 기준으로 한 분 단위

  return {
    time: now.toISOString(),
    temperature: parseFloat(
      (25 + Math.sin(timeIndex * 0.1) * 5 + Math.random() * 2).toFixed(1)
    ),
    humidity: parseFloat(
      (60 + Math.cos(timeIndex * 0.1) * 10 + Math.random() * 3).toFixed(1)
    ),
    ec: parseFloat(
      (1.2 + Math.sin(timeIndex * 0.05) * 0.3 + Math.random() * 0.1).toFixed(1)
    ),
    ph: parseFloat(
      (6.5 + Math.sin(timeIndex * 0.08) * 0.5 + Math.random() * 0.2).toFixed(1)
    ),
    n: parseFloat(
      (0.5 + Math.sin(timeIndex * 0.12) * 0.2 + Math.random() * 0.1).toFixed(1)
    ),
    p: parseFloat(
      (0.3 + Math.cos(timeIndex * 0.15) * 0.2 + Math.random() * 0.1).toFixed(1)
    ),
    k: parseFloat(
      (0.4 + Math.sin(timeIndex * 0.1) * 0.2 + Math.random() * 0.1).toFixed(1)
    ),
  }
}

// farm-data.json 파일 경로 가져오기
function getFarmDataFilePath() {
  const dataDir = __dirname
  return path.join(dataDir, 'farm-data.json')
}

// farm-data.json에서 데이터 읽기
function readFarmData() {
  const filePath = getFarmDataFilePath()

  if (!fs.existsSync(filePath)) {
    return []
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('파일 읽기 오류:', error)
    return []
  }
}

// farm-data.json에 데이터 저장
function saveFarmData(data) {
  const filePath = getFarmDataFilePath()

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('파일 저장 오류:', error)
    return false
  }
}

// 실시간 데이터 생성 및 저장
function generateAndSaveData() {
  const now = new Date()
  const currentData = generateCurrentSensorData()

  // 기존 데이터 읽기
  const existingData = readFarmData()

  // 새 데이터 추가
  existingData.push(currentData)

  // 파일에 저장
  const success = saveFarmData(existingData)

  if (success) {
    console.log(
      `✅ ${now.toLocaleTimeString('ko-KR')} - 데이터 생성 및 저장 완료 (총 ${
        existingData.length
      }개)`
    )
  } else {
    console.error('❌ 데이터 저장 실패')
  }
}

// 메인 실행 함수
function startRealTimeGeneration() {
  console.log('🚀 실시간 센서 데이터 생성 시작...')
  console.log('📁 데이터 파일: farm-data.json')
  console.log('⏰ 1분마다 데이터 생성됩니다. Ctrl+C로 종료하세요.')
  console.log('')

  // 1분마다 실행 (즉시 실행 제거)
  setInterval(() => {
    generateAndSaveData()
  }, 60 * 1000) // 60초 = 1분
}

// 스크립트 실행
if (require.main === module) {
  startRealTimeGeneration()
}

module.exports = {
  generateCurrentSensorData,
  generateAndSaveData,
  startRealTimeGeneration,
}
