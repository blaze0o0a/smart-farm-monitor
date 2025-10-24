'use client'

import React, { useState, useEffect, useCallback } from 'react'
import GrafanaStyleDashboard from '@/components/dashboard/GrafanaStyleDashboard'
import { ChartDataPoint } from '@/types/sensor'
import { useSidebar } from '@/components/AppWrapper'
import { REFRESH_INTERVALS } from '@/constants/app'
import { MockDataGenerator } from '@/lib/mockData'

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<ChartDataPoint[]>([])
  const { isSidebarOpen } = useSidebar()

  // 12시간 대시보드 데이터 가져오기 (목업 데이터)
  const fetchDashboardData = useCallback(async () => {
    try {
      // API 호출 대신 목업 데이터 직접 생성
      const data = MockDataGenerator.generateDashboardData()
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
