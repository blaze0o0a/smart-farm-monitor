'use client'

import React from 'react'
import Header from '@/components/common/Header'
import ErrorMessage from '@/components/common/ErrorMessage'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import useAppStore from '@/stores/useAppStore'

interface AppWrapperProps {
  children: React.ReactNode
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const { error, isLoading, clearError } = useAppStore()

  return (
    <>
      <Header />
      <ErrorMessage message={error} onClose={clearError} />
      {isLoading && <LoadingSpinner text="데이터를 불러오는 중..." />}
      <main className="min-h-screen bg-gray-900">{children}</main>
    </>
  )
}

export default AppWrapper
