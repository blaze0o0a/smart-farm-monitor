import { SensorData, ChartDataPoint, TableDataRow } from '@/types/sensor'
import { DateUtils } from '@/lib/dateUtils'

/**
 * 목업 센서 데이터 생성기
 * Vercel 배포를 위해 파일 시스템 의존성을 제거하고 클라이언트에서 동적 생성
 */
export class MockDataGenerator {
  /**
   * 기본 센서 값 범위
   */
  private static readonly SENSOR_RANGES = {
    temperature: { min: 20, max: 35 }, // °C
    humidity: { min: 50, max: 80 }, // %
    ec: { min: 1.0, max: 2.5 }, // mS/cm
    ph: { min: 5.5, max: 7.5 }, // pH
    n: { min: 0.3, max: 1.0 }, // mg/L
    p: { min: 0.2, max: 0.8 }, // mg/L
    k: { min: 0.4, max: 1.0 }, // mg/L
  }

  /**
   * 랜덤 센서 값 생성
   */
  private static generateRandomValue(
    baseValue: number,
    range: { min: number; max: number },
    variation: number = 0.1
  ): number {
    const randomVariation = (Math.random() - 0.5) * 2 * variation
    const newValue = baseValue + randomVariation
    return Math.max(range.min, Math.min(range.max, newValue))
  }

  /**
   * 특정 시간의 센서 데이터 생성
   */
  private static generateSensorDataAtTime(
    time: Date,
    baseValues: Partial<SensorData> = {}
  ): SensorData {
    const hour = time.getHours()

    // 시간대별 기본값 조정 (낮에는 온도 높고, 밤에는 낮음)
    const timeFactor = Math.sin(((hour - 6) * Math.PI) / 12) * 0.3 + 0.7

    const temperature = this.generateRandomValue(
      baseValues.temperature || 25 + timeFactor * 5,
      this.SENSOR_RANGES.temperature,
      0.8
    )

    const humidity = this.generateRandomValue(
      baseValues.humidity || 65 - timeFactor * 10,
      this.SENSOR_RANGES.humidity,
      0.5
    )

    const ec = this.generateRandomValue(
      baseValues.ec || 1.8,
      this.SENSOR_RANGES.ec,
      0.3
    )

    const ph = this.generateRandomValue(
      baseValues.ph || 6.5,
      this.SENSOR_RANGES.ph,
      0.2
    )

    const n = this.generateRandomValue(
      baseValues.n || 0.6,
      this.SENSOR_RANGES.n,
      0.2
    )

    const p = this.generateRandomValue(
      baseValues.p || 0.4,
      this.SENSOR_RANGES.p,
      0.2
    )

    const k = this.generateRandomValue(
      baseValues.k || 0.7,
      this.SENSOR_RANGES.k,
      0.2
    )

    return {
      time: time.toISOString(),
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity * 10) / 10,
      ec: Math.round(ec * 10) / 10,
      ph: Math.round(ph * 10) / 10,
      n: Math.round(n * 10) / 10,
      p: Math.round(p * 10) / 10,
      k: Math.round(k * 10) / 10,
    }
  }

  /**
   * 날짜 범위의 목업 데이터 생성
   */
  static generateMockData(
    startDate: string,
    endDate: string,
    intervalMinutes: number = 1
  ): SensorData[] {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const data: SensorData[] = []

    // 시작 시간을 분 단위로 정렬
    const startMinute =
      Math.floor(start.getMinutes() / intervalMinutes) * intervalMinutes
    start.setMinutes(startMinute, 0, 0)

    let current = new Date(start)
    let baseValues: Partial<SensorData> = {}

    while (current <= end) {
      const sensorData = this.generateSensorDataAtTime(current, baseValues)
      data.push(sensorData)

      // 다음 데이터의 기본값을 현재 값으로 설정 (연속성 유지)
      baseValues = {
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        ec: sensorData.ec,
        ph: sensorData.ph,
        n: sensorData.n,
        p: sensorData.p,
        k: sensorData.k,
      }

      current = new Date(current.getTime() + intervalMinutes * 60 * 1000)
    }

    return data
  }

  /**
   * 최근 12시간 목업 데이터 생성
   */
  static generateRecent12HoursData(): SensorData[] {
    const now = new Date()
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000)

    return this.generateMockData(
      twelveHoursAgo.toISOString(),
      now.toISOString(),
      1 // 1분 간격
    )
  }

  /**
   * 특정 날짜의 목업 데이터 생성
   */
  static generateDataForDate(dateString: string): SensorData[] {
    const { startDate, endDate } = DateUtils.getKoreanDayRange(dateString)
    return this.generateMockData(startDate, endDate, 1)
  }

  /**
   * 차트용 데이터 포인트 생성
   */
  static generateChartData(
    startDate: string,
    endDate: string
  ): ChartDataPoint[] {
    const data = this.generateMockData(startDate, endDate, 1)
    // ChartDataPoint는 SensorData와 동일하지만 인덱스 시그니처가 필요
    return data.map((item) => ({ ...item } as ChartDataPoint))
  }

  /**
   * 테이블용 데이터 생성 (시간 포맷 변경)
   */
  static generateTableData(startDate: string, endDate: string): TableDataRow[] {
    const data = this.generateMockData(startDate, endDate, 1)

    return data.map((item) => ({
      ...item,
      time: DateUtils.formatKoreanTime(item.time, false), // 시간만 표시
    }))
  }

  /**
   * 대시보드용 최근 데이터 생성
   */
  static generateDashboardData(): ChartDataPoint[] {
    const data = this.generateRecent12HoursData()
    // ChartDataPoint는 SensorData와 동일하지만 인덱스 시그니처가 필요
    return data.map((item) => ({ ...item } as ChartDataPoint))
  }
}
