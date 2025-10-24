'use client'

import React, { useEffect } from 'react'
import GrafanaStyleDashboard from '@/components/dashboard/GrafanaStyleDashboard'
import { useSidebar } from '@/components/AppWrapper'
import { useDashboardData } from '@/hooks/useSocketData'

export default function Dashboard() {
  const { isSidebarOpen } = useSidebar()
  const { data: dashboardData, loading, error, refetch } = useDashboardData()

  // 1분마다 데이터 갱신 (Grafana 스타일에 맞춰)
  useEffect(() => {
    const interval = setInterval(refetch, 60000) // 1분마다
    return () => clearInterval(interval)
  }, [refetch])

  if (error) {
    console.error('대시보드 데이터 오류:', error)
  }

  return (
    <GrafanaStyleDashboard
      dashboardData={dashboardData}
      isSidebarOpen={isSidebarOpen}
    />
  )
}
