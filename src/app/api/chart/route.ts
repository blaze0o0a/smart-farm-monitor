import { NextRequest, NextResponse } from 'next/server'
import { readDataFromDateRange } from '@/lib/fileDataManager'

export async function GET() {
  try {
    // 기본값: 최근 12시간 데이터
    const now = new Date()
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000)

    const data = readDataFromDateRange(
      twelveHoursAgo.toISOString(),
      now.toISOString()
    )

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error:
            '데이터 파일이 없습니다. npm run generate-data를 실행해주세요.',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Chart data reading error:', error)
    return NextResponse.json(
      { error: '차트 데이터를 읽는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate } = await request.json()

    // 기본값 설정
    const now = new Date()
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000)

    const start = startDate || twelveHoursAgo.toISOString()
    const end = endDate || now.toISOString()

    const data = readDataFromDateRange(start, end)

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: '해당 기간의 데이터 파일이 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Chart data reading error:', error)
    return NextResponse.json(
      { error: '차트 데이터를 읽는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
