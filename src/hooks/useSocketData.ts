import { useState, useEffect, useCallback } from 'react'
import { ChartDataPoint, TableDataRow, CalibrationData } from '@/types/sensor'
import { useSocket } from './useSocket'

// 대시보드 데이터 Hook
export function useDashboardData() {
  const { socket, isConnected } = useSocket()
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    if (!socket || !isConnected) return

    setLoading(true)
    setError(null)
    socket.emit('request:dashboard')
  }, [socket, isConnected])

  useEffect(() => {
    if (!socket) return

    // 대시보드 데이터 수신
    socket.on('data:dashboard', (newData) => {
      setData(newData)
      setLoading(false)
    })

    // 에러 수신
    socket.on('error', (errorMessage) => {
      setError(errorMessage)
      setLoading(false)
    })

    // 초기 데이터 요청
    fetchData()

    return () => {
      socket.off('data:dashboard')
      socket.off('error')
    }
  }, [socket, fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

// 차트 데이터 Hook
export function useChartData(startDate: string, endDate: string) {
  const { socket, isConnected } = useSocket()
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    if (!socket || !isConnected) return

    setLoading(true)
    setError(null)
    socket.emit('request:chart', { startDate, endDate })
  }, [socket, isConnected, startDate, endDate])

  useEffect(() => {
    if (!socket) return

    // 차트 데이터 수신
    socket.on('data:chart', (newData) => {
      setData(newData)
      setLoading(false)
    })

    // 에러 수신
    socket.on('error', (errorMessage) => {
      setError(errorMessage)
      setLoading(false)
    })

    // 데이터 요청
    fetchData()

    return () => {
      socket.off('data:chart')
      socket.off('error')
    }
  }, [socket, fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

// 테이블 데이터 Hook
export function useTableData(startDate: string, endDate: string) {
  const { socket, isConnected } = useSocket()
  const [data, setData] = useState<TableDataRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    if (!socket || !isConnected) return

    setLoading(true)
    setError(null)
    socket.emit('request:table', { startDate, endDate })
  }, [socket, isConnected, startDate, endDate])

  useEffect(() => {
    if (!socket) return

    // 테이블 데이터 수신
    socket.on('data:table', (newData) => {
      setData(newData)
      setLoading(false)
    })

    // 에러 수신
    socket.on('error', (errorMessage) => {
      setError(errorMessage)
      setLoading(false)
    })

    // 데이터 요청
    fetchData()

    return () => {
      socket.off('data:table')
      socket.off('error')
    }
  }, [socket, fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

// 캘리브레이션 데이터 Hook
export function useCalibrationData() {
  const { socket, isConnected } = useSocket()
  const [data, setData] = useState<CalibrationData>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    if (!socket || !isConnected) return

    setLoading(true)
    setError(null)
    socket.emit('request:calibration')
  }, [socket, isConnected])

  const updateCalibration = useCallback((key: string, value: number) => {
    if (!socket || !isConnected) return

    socket.emit('update:calibration', { key, value })
  }, [socket, isConnected])

  useEffect(() => {
    if (!socket) return

    // 캘리브레이션 데이터 수신
    socket.on('data:calibration', (newData) => {
      setData(newData)
      setLoading(false)
    })

    // 에러 수신
    socket.on('error', (errorMessage) => {
      setError(errorMessage)
      setLoading(false)
    })

    // 초기 데이터 요청
    fetchData()

    return () => {
      socket.off('data:calibration')
      socket.off('error')
    }
  }, [socket, fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    updateCalibration
  }
}
