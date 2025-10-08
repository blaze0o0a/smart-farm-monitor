/* eslint-disable */
const fs = require('fs')
const path = require('path')

// 센서 데이터 생성 함수 (기간별)
function generateSensorDataForPeriod(startDate, endDate) {
  const data = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  // 1분 간격으로 데이터 생성
  const interval = 60 * 1000 // 1분
  let current = new Date(start)

  while (current <= end) {
    const timeIndex = (current.getTime() / (1000 * 60)) % (24 * 60) // 하루를 기준으로 한 분 단위

    data.push({
      time: current.toISOString(),
      temperature: parseFloat(
        (25 + Math.sin(timeIndex * 0.1) * 5 + Math.random() * 2).toFixed(1)
      ),
      humidity: parseFloat(
        (60 + Math.cos(timeIndex * 0.1) * 10 + Math.random() * 3).toFixed(1)
      ),
      ec: parseFloat(
        (1.2 + Math.sin(timeIndex * 0.05) * 0.3 + Math.random() * 0.1).toFixed(
          1
        )
      ),
      ph: parseFloat(
        (6.5 + Math.sin(timeIndex * 0.08) * 0.5 + Math.random() * 0.2).toFixed(
          1
        )
      ),
      n: parseFloat(
        (0.5 + Math.sin(timeIndex * 0.12) * 0.2 + Math.random() * 0.1).toFixed(
          1
        )
      ),
      p: parseFloat(
        (0.3 + Math.cos(timeIndex * 0.15) * 0.2 + Math.random() * 0.1).toFixed(
          1
        )
      ),
      k: parseFloat(
        (0.4 + Math.sin(timeIndex * 0.1) * 0.2 + Math.random() * 0.1).toFixed(1)
      ),
    })

    current = new Date(current.getTime() + interval)
  }

  return data
}

// 샘플 데이터 생성 함수
function generateSampleData() {
  const dataDir = __dirname
  const filePath = path.join(dataDir, 'farm-data.json')

  console.log('🚀 한 달치 샘플 데이터 생성 시작...')

  // 한 달 전부터 오늘까지의 데이터 생성
  const today = new Date()
  const oneMonthAgo = new Date(today)
  oneMonthAgo.setDate(today.getDate() - 30)

  console.log(
    `📅 기간: ${oneMonthAgo.toISOString().split('T')[0]} ~ ${
      today.toISOString().split('T')[0]
    }`
  )

  const allData = generateSensorDataForPeriod(oneMonthAgo, today)

  // 파일에 저장
  fs.writeFileSync(filePath, JSON.stringify(allData, null, 2))

  console.log(`✅ farm-data.json 생성 완료 (${allData.length}개 데이터)`)
  console.log(`📁 파일 위치: ${filePath}`)
  console.log(
    `📊 데이터 크기: ${(fs.statSync(filePath).size / 1024 / 1024).toFixed(
      2
    )} MB`
  )
}

// 스크립트 실행
if (require.main === module) {
  generateSampleData()
}

module.exports = { generateSampleData }
