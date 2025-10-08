import { useState, useEffect, useCallback, useMemo } from 'react'
import moment from 'moment'
import { DateUtils } from '@/lib/dateUtils'
import { SensorDataUtils, SensorApiUtils } from '@/lib/sensorUtils'
import {
  ChartDataPoint,
  TableDataRow,
  SortConfig,
  PaginationConfig,
} from '@/types/sensor'
import { PAGINATION_DEFAULTS } from '@/constants/app'

interface UseSensorDataReturn {
  // 데이터
  chartData: ChartDataPoint[]
  tableData: TableDataRow[]
  sortedData: TableDataRow[]
  currentData: TableDataRow[]

  // 상태
  isChartLoading: boolean
  isTableLoading: boolean
  isAnyLoading: boolean
  error: string | null
  startDate: Date
  pagination: PaginationConfig
  sortConfig: SortConfig | null

  // 액션
  setStartDate: (date: Date) => void
  handleSort: (key: string) => void
  setPagination: (
    config: PaginationConfig | ((prev: PaginationConfig) => PaginationConfig)
  ) => void
  exportToCSV: (
    sensorType: string,
    sensorTitle: string,
    sensorUnit: string
  ) => void
  onDateChange: (date: moment.Moment | null) => void
}

export function useSensorData(): UseSensorDataReturn {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [tableData, setTableData] = useState<TableDataRow[]>([])
  const [isChartLoading, setIsChartLoading] = useState<boolean>(false)
  const [isTableLoading, setIsTableLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [pagination, setPagination] = useState<PaginationConfig>({
    current: PAGINATION_DEFAULTS.INITIAL_PAGE,
    pageSize: PAGINATION_DEFAULTS.PAGE_SIZE,
    total: 0,
  })
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)

  // 전체 로딩 상태 계산
  const isAnyLoading = isChartLoading || isTableLoading

  // 정렬된 데이터 계산 (useMemo로 최적화)
  const sortedData = useMemo(() => {
    return SensorDataUtils.sortTableData(tableData, sortConfig)
  }, [tableData, sortConfig])

  // 페이지네이션된 데이터 계산 (useMemo로 최적화)
  const currentData = useMemo(() => {
    return SensorDataUtils.getPaginatedData(
      sortedData,
      pagination.current,
      pagination.pageSize
    )
  }, [sortedData, pagination])

  // 차트 데이터 가져오기
  const fetchChartData = useCallback(async (dateString: string) => {
    try {
      setIsChartLoading(true)
      setError(null)

      const { startDate, endDate } = DateUtils.getKoreanDayRange(dateString)
      const data = await SensorApiUtils.fetchChartData(startDate, endDate)
      setChartData(data)
    } catch (error) {
      console.error('차트 데이터 가져오기 실패:', error)
      setError('차트 데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsChartLoading(false)
    }
  }, [])

  // 테이블 데이터 가져오기
  const fetchTableData = useCallback(async (dateString: string) => {
    try {
      setIsTableLoading(true)
      setError(null)

      const { startDate, endDate } = DateUtils.getKoreanDayRange(dateString)
      const data = await SensorApiUtils.fetchTableData(startDate, endDate)
      setTableData(data)
      setPagination((prev) => ({ ...prev, total: data.length }))
    } catch (error) {
      console.error('테이블 데이터 가져오기 실패:', error)
      setError('테이블 데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsTableLoading(false)
    }
  }, [])

  // 날짜 변경 시 데이터 새로고침
  useEffect(() => {
    const dateString = startDate.toISOString().split('T')[0]
    fetchChartData(dateString)
    fetchTableData(dateString)
  }, [startDate, fetchChartData, fetchTableData])

  // 날짜 변경 핸들러
  const onDateChange = useCallback((date: moment.Moment | null) => {
    if (date) {
      const utcDate = DateUtils.parseDateInput(date.format('YYYY-MM-DD'))
      setStartDate(utcDate)
      setPagination((prev) => ({
        ...prev,
        current: PAGINATION_DEFAULTS.INITIAL_PAGE,
      }))
    }
  }, [])

  // 정렬 함수
  const handleSort = useCallback(
    (key: string) => {
      let direction: 'asc' | 'desc' = 'asc'
      if (
        sortConfig &&
        sortConfig.key === key &&
        sortConfig.direction === 'asc'
      ) {
        direction = 'desc'
      }
      setSortConfig({ key, direction })
      setPagination((prev) => ({
        ...prev,
        current: PAGINATION_DEFAULTS.INITIAL_PAGE,
      }))
    },
    [sortConfig]
  )

  // CSV 내보내기
  const exportToCSV = useCallback(
    (sensorType: string, sensorTitle: string, sensorUnit: string) => {
      const csvContent = SensorDataUtils.generateCSVData(
        tableData,
        sensorType,
        sensorTitle,
        sensorUnit
      )

      const filename = `${sensorTitle}_${moment(startDate).format(
        'YYYY-MM-DD'
      )}.csv`
      SensorDataUtils.downloadCSV(csvContent, filename)
    },
    [tableData, startDate]
  )

  return {
    // 데이터
    chartData,
    tableData,
    sortedData,
    currentData,

    // 상태
    isChartLoading,
    isTableLoading,
    isAnyLoading,
    error,
    startDate,
    pagination,
    sortConfig,

    // 액션
    setStartDate,
    handleSort,
    setPagination,
    exportToCSV,
    onDateChange,
  }
}
