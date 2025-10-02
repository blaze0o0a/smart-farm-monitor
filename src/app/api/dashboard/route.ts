import { NextRequest, NextResponse } from 'next/server'

// 12시간 대시보드 데이터 생성 함수
function generateDashboardData() {
  const now = new Date()
  const data = []

  // 12시간 전부터 현재까지 1시간 간격으로 데이터 생성
  for (let i = 11; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000) // 1시간 간격
    data.push({
      time: time.toISOString(),
      temperature: parseFloat(
        (25 + Math.sin(i * 0.5) * 8 + Math.random() * 3).toFixed(1)
      ),
      humidity: parseFloat(
        (60 + Math.cos(i * 0.3) * 15 + Math.random() * 5).toFixed(1)
      ),
      ec: parseFloat(
        (1.2 + Math.sin(i * 0.4) * 0.4 + Math.random() * 0.2).toFixed(1)
      ),
      ph: parseFloat(
        (6.5 + Math.sin(i * 0.2) * 0.8 + Math.random() * 0.3).toFixed(1)
      ),
      n: parseFloat(
        (0.5 + Math.sin(i * 0.6) * 0.3 + Math.random() * 0.1).toFixed(1)
      ),
      p: parseFloat(
        (0.3 + Math.cos(i * 0.4) * 0.2 + Math.random() * 0.1).toFixed(1)
      ),
      k: parseFloat(
        (0.4 + Math.sin(i * 0.3) * 0.2 + Math.random() * 0.1).toFixed(1)
      ),
    })
  }

  return data
}

export async function GET() {
  try {
    const data = generateDashboardData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Dashboard data generation error:', error)
    return NextResponse.json(
      { error: '대시보드 데이터 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}


