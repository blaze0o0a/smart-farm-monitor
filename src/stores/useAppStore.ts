import { create } from 'zustand'

import { SensorData } from '@/types/sensor'

interface AppState {
  // UI 상태
  activeTab: string
  isLoading: boolean
  error: string | null

  // 데이터
  chartData: SensorData[]
  tableData: SensorData[]

  // 액션들
  setActiveTab: (tab: string) => void
  setChartData: (data: SensorData[]) => void
  addChartData: (newData: SensorData) => void
  setTableData: (data: SensorData[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  reset: () => void
}

const useAppStore = create<AppState>((set) => ({
  // 초기 상태
  activeTab: 'dashboard',
  isLoading: false,
  error: null,

  // 차트 데이터
  chartData: [],

  // 테이블 데이터
  tableData: [],

  // 액션들
  setActiveTab: (tab) => set({ activeTab: tab }),

  setChartData: (data) => set({ chartData: data }),

  addChartData: (newData) =>
    set((state) => ({
      chartData: [...state.chartData, newData],
    })),

  setTableData: (data) => set({ tableData: data }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  // 초기화
  reset: () =>
    set({
      activeTab: 'dashboard',
      chartData: [],
      tableData: [],
      isLoading: false,
      error: null,
    }),
}))

export default useAppStore
