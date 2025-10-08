import { NextResponse } from 'next/server'
import { readDataFromDateRange } from '@/lib/fileDataManager'

export async function GET() {
  try {
    // 최근 12시간 데이터 읽기
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

    // 최근 12시간 데이터 반환
    const recent12Hours = data

    return NextResponse.json(recent12Hours)
  } catch (error) {
    console.error('Dashboard data reading error:', error)
    return NextResponse.json(
      { error: '대시보드 데이터를 읽는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
