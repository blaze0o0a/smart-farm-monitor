'use client'

import React from 'react'
import Image from 'next/image'
interface CalibrationCardProps {
  title: string
  value: number | null
  unit: string
  icon: string
  iconAlt: string
  onSetClick: () => void
  min?: number
  max?: number
  color?: string
}

const CalibrationCard: React.FC<CalibrationCardProps> = React.memo(
  ({ title, value, unit, icon, iconAlt, onSetClick, min = 0, max = 100 }) => {
    return (
      <div className="bg-slate-900 border border-slate-800 shadow-lg rounded-lg flex flex-col h-64 sm:h-72">
        {/* 헤더 */}
        <div className="p-3 sm:p-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <Image
              src={icon}
              alt={iconAlt}
              width={16}
              height={16}
              className="object-contain sm:w-4 sm:h-4"
            />
            <div>
              <div className="text-slate-100 text-sm font-medium">{title}</div>
              <div className="text-slate-300 text-xs">캘리브레이션 설정</div>
            </div>
          </div>
        </div>

        {/* 중앙 설정값 표시 */}
        <div className="flex-1 flex items-center justify-center p-5 sm:p-7 min-h-0">
          <div className="text-center w-full">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-100 mb-2">
              {value !== null && !isNaN(value) ? `${value}` : '--'}
            </div>
            <div className="text-sm sm:text-base text-slate-400 font-medium mb-3 sm:mb-4 h-5 sm:h-6 flex items-center justify-center">
              {unit || ''}
            </div>
            <div className="text-xs sm:text-sm text-slate-500">
              범위: {min.toFixed(1)} — {max.toFixed(1)}
            </div>
          </div>
        </div>

        {/* 설정 버튼 */}
        <div className="p-3 sm:p-4 border-t border-slate-800 flex-shrink-0">
          <button
            onClick={onSetClick}
            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 hover:-translate-y-0.5 border border-blue-500/20 hover:border-blue-400/40"
          >
            <span className="flex items-center justify-center gap-1.5 sm:gap-2">
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              설정
            </span>
          </button>
        </div>
      </div>
    )
  }
)

CalibrationCard.displayName = 'CalibrationCard'

export default CalibrationCard
