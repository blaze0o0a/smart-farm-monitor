'use client'

import React, { useState, createContext, useContext } from 'react'
import Sidebar from '@/components/common/Sidebar'
import ErrorMessage from '@/components/common/ErrorMessage'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import useAppStore from '@/stores/useAppStore'

// 사이드바 상태를 전역으로 관리하기 위한 Context
const SidebarContext = createContext<{
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
}>({
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
})

export const useSidebar = () => useContext(SidebarContext)

interface AppWrapperProps {
  children: React.ReactNode
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const { error, isLoading, clearError, activeTab, setActiveTab } =
    useAppStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 w-screen overflow-x-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* 메인 콘텐츠 영역 */}
        <div
          className="min-h-screen"
          onClick={() => isSidebarOpen && setIsSidebarOpen(false)}
        >
          <ErrorMessage message={error} onClose={clearError} />
          {isLoading && <LoadingSpinner text="데이터를 불러오는 중..." />}
          <main className="min-h-screen">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

export default AppWrapper
