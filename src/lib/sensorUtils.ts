import { TableDataRow, SortConfig, ChartDataPoint } from '@/types/sensor'
import { CSV_CONFIG } from '@/constants/app'
import { MockDataGenerator } from '@/lib/mockData'

/**
 * 센서 데이터 정렬 유틸리티
 */
export class SensorDataUtils {
  /**
   * 테이블 데이터를 정렬합니다
   */
  static sortTableData(
    data: TableDataRow[],
    sortConfig: SortConfig | null
  ): TableDataRow[] {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key as keyof TableDataRow]
      let bValue = b[sortConfig.key as keyof TableDataRow]

      // 시간 컬럼의 경우 특별 처리
      if (sortConfig.key === 'time') {
        const today = new Date().toDateString()
        aValue = new Date(`${today} ${aValue}`).getTime()
        bValue = new Date(`${today} ${bValue}`).getTime()
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  /**
   * 페이지네이션된 데이터를 반환합니다
   */
  static getPaginatedData(
    data: TableDataRow[],
    current: number,
    pageSize: number
  ): TableDataRow[] {
    const startIndex = (current - 1) * pageSize
    const endIndex = startIndex + pageSize
    return data.slice(startIndex, endIndex)
  }

  /**
   * CSV 데이터를 생성합니다
   */
  static generateCSVData(
    data: TableDataRow[],
    sensorType: string,
    sensorTitle: string,
    sensorUnit: string
  ): string {
    const headers = ['time', `${sensorType}(${sensorUnit})`]
    const csvContent = [
      headers.join(','),
      ...data.map((row: TableDataRow) =>
        [row.time, row[sensorType as keyof TableDataRow] || '--'].join(',')
      ),
    ].join('\n')
    return csvContent
  }

  /**
   * CSV 파일을 다운로드합니다
   */
  static downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: `${CSV_CONFIG.MIME_TYPE};charset=${CSV_CONFIG.CHARSET};`,
    })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * 센서 데이터 API 호출 유틸리티 (목업 데이터 사용)
 */
export class SensorApiUtils {
  /**
   * 차트 데이터를 가져옵니다 (목업 데이터)
   */
  static async fetchChartData(
    startDate: string,
    endDate: string
  ): Promise<ChartDataPoint[]> {
    // API 호출 대신 목업 데이터 생성
    return new Promise((resolve) => {
      // 비동기 시뮬레이션을 위한 약간의 지연
      setTimeout(() => {
        const mockData = MockDataGenerator.generateChartData(startDate, endDate)
        resolve(mockData)
      }, 100)
    })
  }

  /**
   * 테이블 데이터를 가져옵니다 (목업 데이터)
   */
  static async fetchTableData(
    startDate: string,
    endDate: string
  ): Promise<TableDataRow[]> {
    // API 호출 대신 목업 데이터 생성
    return new Promise((resolve) => {
      // 비동기 시뮬레이션을 위한 약간의 지연
      setTimeout(() => {
        const mockData = MockDataGenerator.generateTableData(startDate, endDate)
        resolve(mockData)
      }, 100)
    })
  }
}
