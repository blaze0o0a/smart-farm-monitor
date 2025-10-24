import { ChartDataPoint, TableDataRow, CalibrationData } from '@/types/sensor'

// Socket 이벤트 타입 정의
export interface ServerToClientEvents {
  'data:dashboard': (data: ChartDataPoint[]) => void
  'data:chart': (data: ChartDataPoint[]) => void
  'data:table': (data: TableDataRow[]) => void
  'data:calibration': (data: CalibrationData) => void
  'error': (message: string) => void
}

export interface ClientToServerEvents {
  'request:dashboard': () => void
  'request:chart': (params: { startDate: string; endDate: string }) => void
  'request:table': (params: { startDate: string; endDate: string }) => void
  'request:calibration': () => void
  'update:calibration': (data: { key: string; value: number }) => void
}

// Socket 연결 상태
export interface SocketState {
  connected: boolean
  connecting: boolean
  error: string | null
}
