import { NextRequest, NextResponse } from 'next/server'

// 목 차트 데이터 생성 함수
function generateChartData(date: string, count: number = 60) {
  const startDate = new Date(date)
  const data = []

  for (let i = 0; i < count; i++) {
    const time = new Date(startDate.getTime() + i * 60000) // 1분 간격
    data.push({
      time: time.toISOString(),
      temperature: parseFloat(
        (25 + Math.sin(i * 0.1) * 5 + Math.random() * 2).toFixed(1)
      ),
      humidity: parseFloat(
        (60 + Math.cos(i * 0.1) * 10 + Math.random() * 3).toFixed(1)
      ),
      ec: parseFloat(
        (1.2 + Math.sin(i * 0.05) * 0.3 + Math.random() * 0.1).toFixed(1)
      ),
      ph: parseFloat(
        (6.5 + Math.sin(i * 0.08) * 0.5 + Math.random() * 0.2).toFixed(1)
      ),
      n: parseFloat(
        (0.5 + Math.sin(i * 0.12) * 0.2 + Math.random() * 0.1).toFixed(1)
      ),
      p: parseFloat(
        (0.3 + Math.cos(i * 0.15) * 0.2 + Math.random() * 0.1).toFixed(1)
      ),
      k: parseFloat(
        (0.4 + Math.sin(i * 0.1) * 0.2 + Math.random() * 0.1).toFixed(1)
      ),
    })
  }

  return data
}

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const data = generateChartData(today, 60)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Chart data generation error:', error)
    return NextResponse.json(
      { error: '차트 데이터 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json()
    const data = generateChartData(date, 60)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Chart data generation error:', error)
    return NextResponse.json(
      { error: '차트 데이터 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}

