// 공통 센서 데이터 생성 함수 (분당 데이터)
export function generateSensorData(
  startDate: Date,
  endDate: Date,
  intervalMinutes: number = 1
) {
  const data = []
  const interval = intervalMinutes * 60 * 1000 // 밀리초로 변환
  let current = new Date(startDate)

  while (current <= endDate) {
    const timeIndex = (current.getTime() - startDate.getTime()) / (1000 * 60) // 분 단위

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

// 대시보드용 데이터 (분당 데이터, 12시간)
export function generateDashboardData() {
  const now = new Date()
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000)
  return generateSensorData(twelveHoursAgo, now, 1) // 1분 간격
}

// 차트용 데이터 (분당 데이터)
export function generateChartData(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return generateSensorData(start, end, 1) // 1분 간격
}

// 테이블용 데이터 (분당 데이터)
export function generateTableData(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const data = generateSensorData(start, end, 1) // 1분 간격

  // 테이블용으로 시간 형식 변경
  return data.map((item) => ({
    ...item,
    time: new Date(item.time).toLocaleTimeString('ko-KR', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  }))
}
