'use client'

import React from 'react'

interface LoadingSpinnerProps {
  text?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = '로딩 중...',
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 p-8 rounded-lg shadow-xl text-center max-w-sm mx-4">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
        <p className="text-slate-300 font-medium">{text}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
