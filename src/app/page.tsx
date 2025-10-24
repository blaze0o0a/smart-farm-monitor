'use client'

import React, { useState, useEffect, useCallback } from 'react'
import GrafanaStyleDashboard from '@/components/dashboard/GrafanaStyleDashboard'
import { ChartDataPoint } from '@/types/sensor'
import { useSidebar } from '@/components/AppWrapper'
import { REFRESH_INTERVALS } from '@/constants/app'

// 목업 데이터 - 최근 12시간 (1분 간격, 720개)
const generateMockData = (): ChartDataPoint[] => {
  return Array.from({ length: 720 }, (_, i) => {
    const now = new Date()
    const time = new Date(now.getTime() - (720 - i) * 60 * 1000)
    const hour = time.getHours()
    const timeFactor = Math.sin(((hour - 6) * Math.PI) / 12) * 0.3 + 0.7
    
    return {
      time: time.toISOString(),
      temperature: Number((25 + timeFactor * 5 + (Math.random() - 0.5) * 2).toFixed(1)),
      humidity: Number((65 - timeFactor * 10 + (Math.random() - 0.5) * 3).toFixed(1)),
      ec: Number((1.8 + (Math.random() - 0.5) * 0.5).toFixed(1)),
      ph: Number((6.5 + (Math.random() - 0.5) * 0.3).toFixed(1)),
      n: Number((0.6 + (Math.random() - 0.5) * 0.3).toFixed(1)),
      p: Number((0.4 + (Math.random() - 0.5) * 0.3).toFixed(1)),
      k: Number((0.7 + (Math.random() - 0.5) * 0.3).toFixed(1)),
    }
  })
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<ChartDataPoint[]>([])
  const { isSidebarOpen } = useSidebar()

  // 12시간 대시보드 데이터 가져오기 (목업 데이터)
  const fetchDashboardData = useCallback(async () => {
    try {
      // 그냥 목업 데이터 생성
      const data = generateMockData()
      setDashboardData(data)
    } catch (error) {
      console.error('대시보드 데이터 가져오기 실패:', error)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
    // 1분마다 데이터 갱신 (Grafana 스타일에 맞춰)
    const interval = setInterval(
      fetchDashboardData,
      REFRESH_INTERVALS.DASHBOARD
    )
    return () => clearInterval(interval)
  }, [fetchDashboardData])

  return (
    <GrafanaStyleDashboard
      dashboardData={dashboardData}
      isSidebarOpen={isSidebarOpen}
    />
  )
}
