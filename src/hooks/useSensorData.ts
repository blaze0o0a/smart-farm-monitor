import { useState, useEffect, useCallback, useMemo } from 'react'
import moment from 'moment'
import { DateUtils } from '@/lib/dateUtils'
import { SensorDataUtils } from '@/lib/sensorDataUtils'
import { useChartData, useTableData } from '@/hooks/useSocketData'
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

  // 소켓 기반 데이터 hooks
  const {
    data: socketChartData,
    loading: socketChartLoading,
    error: socketChartError,
  } = useChartData(
    DateUtils.getKoreanDayRange(startDate.toISOString().split('T')[0])
      .startDate,
    DateUtils.getKoreanDayRange(startDate.toISOString().split('T')[0]).endDate
  )

  const {
    data: socketTableData,
    loading: socketTableLoading,
    error: socketTableError,
  } = useTableData(
    DateUtils.getKoreanDayRange(startDate.toISOString().split('T')[0])
      .startDate,
    DateUtils.getKoreanDayRange(startDate.toISOString().split('T')[0]).endDate
  )

  // 소켓 데이터를 로컬 상태에 동기화
  useEffect(() => {
    if (socketChartData) {
      setChartData(socketChartData)
    }
  }, [socketChartData])

  useEffect(() => {
    if (socketTableData) {
      setTableData(socketTableData)
      setPagination((prev) => ({ ...prev, total: socketTableData.length }))
    }
  }, [socketTableData])

  useEffect(() => {
    setIsChartLoading(socketChartLoading)
  }, [socketChartLoading])

  useEffect(() => {
    setIsTableLoading(socketTableLoading)
  }, [socketTableLoading])

  useEffect(() => {
    if (socketChartError || socketTableError) {
      setError(
        socketChartError ||
          socketTableError ||
          '데이터를 불러오는데 실패했습니다.'
      )
    }
  }, [socketChartError, socketTableError])

  // 날짜 변경 시 자동으로 소켓 데이터가 업데이트됨

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
