import { NextRequest, NextResponse } from 'next/server'
import { readDataFromDateRange } from '@/lib/fileDataManager'
import { DateUtils } from '@/lib/dateUtils'

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

    // 테이블용으로 시간 형식 변경 (UTC 정보 제거)
    const tableData = data.map((item) => ({
      ...item,
      time: DateUtils.formatKoreanTime(item.time, false), // 시간만 표시
    }))

    return NextResponse.json(tableData)
  } catch (error) {
    console.error('Table data reading error:', error)
    return NextResponse.json(
      { error: '테이블 데이터를 읽는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
