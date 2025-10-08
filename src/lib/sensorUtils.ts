import { TableDataRow, SortConfig, ChartDataPoint } from '@/types/sensor'
import { CSV_CONFIG } from '@/constants/app'

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
 * 센서 데이터 API 호출 유틸리티
 */
export class SensorApiUtils {
  /**
   * 차트 데이터를 가져옵니다
   */
  static async fetchChartData(
    startDate: string,
    endDate: string
  ): Promise<ChartDataPoint[]> {
    const response = await fetch('/api/chart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate }),
    })

    if (!response.ok) {
      throw new Error('차트 데이터를 불러오는데 실패했습니다.')
    }

    return response.json()
  }

  /**
   * 테이블 데이터를 가져옵니다
   */
  static async fetchTableData(
    startDate: string,
    endDate: string
  ): Promise<TableDataRow[]> {
    const response = await fetch('/api/table', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate }),
    })

    if (!response.ok) {
      throw new Error('테이블 데이터를 불러오는데 실패했습니다.')
    }

    return response.json()
  }
}
