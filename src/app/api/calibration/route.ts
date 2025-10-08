import { NextRequest, NextResponse } from 'next/server'

// 메모리 기반 캘리브레이션 데이터 저장소
const calibrationData: Record<string, number> = {
  temperature: 0,
  humidity: 0,
  ec: 0,
  ph: 0,
  n_factor: 1,
  p_factor: 1,
  k_factor: 1,
  n_offset: 0,
  p_offset: 0,
  k_offset: 0,
}

export async function GET() {
  try {
    return NextResponse.json(calibrationData)
  } catch (error) {
    console.error('Calibration data fetch error:', error)
    return NextResponse.json(
      { error: '캘리브레이션 데이터 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json()

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: '키와 값이 필요합니다.' },
        { status: 400 }
      )
    }

    // 캘리브레이션 데이터 업데이트
    calibrationData[key] = value

    return NextResponse.json({
      message: '캘리브레이션 데이터가 성공적으로 업데이트되었습니다.',
      data: calibrationData,
    })
  } catch (error) {
    console.error('Calibration data update error:', error)
    return NextResponse.json(
      { error: '캘리브레이션 데이터 업데이트에 실패했습니다.' },
      { status: 500 }
    )
  }
}
