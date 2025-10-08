/**
 * 애플리케이션 전역 상수
 */

// 페이지네이션 기본값
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 10,
  INITIAL_PAGE: 1,
} as const

// 데이터 새로고침 간격 (밀리초)
export const REFRESH_INTERVALS = {
  DASHBOARD: 60 * 1000, // 1분
  SENSOR_DETAIL: 30 * 1000, // 30초
} as const

// 차트 설정
export const CHART_CONFIG = {
  HEIGHT: 400,
  STROKE_WIDTH: 2,
  DOT_SIZE: 4,
} as const

// 테이블 설정
export const TABLE_CONFIG = {
  MAX_ROWS_PER_PAGE: 50,
  MIN_ROWS_PER_PAGE: 5,
} as const

// CSV 설정
export const CSV_CONFIG = {
  CHARSET: 'utf-8',
  MIME_TYPE: 'text/csv',
} as const

// 색상 팔레트
export const COLOR_PALETTE = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4',
} as const

// 센서 색상 매핑
export const SENSOR_COLORS = {
  temperature: '#ff7300',
  humidity: '#0088fe',
  ph: '#00c49f',
  ec: '#ffbb28',
  n: '#ff6b6b',
  p: '#4ecdc4',
  k: '#45b7d1',
} as const
