/**
 * 센서 데이터의 기본 구조
 */
export interface SensorData {
  time: string
  temperature: number
  humidity: number
  ec: number
  ph: number
  n: number
  p: number
  k: number
}

/**
 * 차트 데이터 포인트 (동적 키 지원)
 */
export interface ChartDataPoint extends SensorData {
  [key: string]: string | number
}

/**
 * 테이블 데이터 행 (시간이 포맷된 형태)
 */
export interface TableDataRow extends Omit<SensorData, 'time'> {
  time: string // "HH:mm:ss" 형식 (한국 시간)
}

/**
 * 센서 설정 정보
 */
export interface SensorConfig {
  title: string
  value: number | null
  unit: string
  icon: string
  iconAlt: string
  dataKey: string
  color: string
}

/**
 * 캘리브레이션 데이터
 */
export interface CalibrationData {
  [key: string]: number
}

/**
 * 캘리브레이션 항목
 */
export interface CalibrationItem {
  key: string
  label: string
  unit: string
  iconKey: string
}

/**
 * 정렬 설정
 */
export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

/**
 * 페이지네이션 설정
 */
export interface PaginationConfig {
  current: number
  pageSize: number
  total: number
}

/**
 * API 요청 타입
 */
export interface DateRangeRequest {
  startDate: string
  endDate: string
}

/**
 * API 응답 타입
 */
export interface ApiResponse<T> {
  data?: T
  error?: string
}
