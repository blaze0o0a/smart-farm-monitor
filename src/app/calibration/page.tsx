'use client'

import React, { useState, useEffect, useCallback } from 'react'
import useAppStore from '@/stores/useAppStore'
import CalibrationCard from '@/components/calibration/CalibrationCard'
import { CalibrationData } from '@/types/sensor'
import { CALIBRATION_ITEMS } from '@/constants/sensors'

export default function CalibrationPage() {
  const { setLoading, setError } = useAppStore()
  const [calibrationData, setCalibrationData] = useState<CalibrationData>({})
  const [modalVisible, setModalVisible] = useState(false)
  const [inputValue, setInputValue] = useState<string>('')
  const [selectedItem, setSelectedItem] = useState<string>('')

  // 캘리브레이션 데이터 가져오기
  const fetchCalibrationData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/calibration')

      if (!response.ok) {
        throw new Error('캘리브레이션 데이터를 불러오는데 실패했습니다.')
      }

      const data = await response.json()
      setCalibrationData(data)
    } catch (error) {
      console.error('캘리브레이션 데이터 가져오기 실패:', error)
      setError('캘리브레이션 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  useEffect(() => {
    fetchCalibrationData()
  }, [fetchCalibrationData])

  const handleCalibration = async (key: string, value: number) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/calibration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })

      if (!response.ok) {
        throw new Error('캘리브레이션 데이터 저장에 실패했습니다.')
      }

      const result = await response.json()
      setCalibrationData(result.data)
      alert(`${key} 캘리브레이션이 완료되었습니다.`)
      setModalVisible(false)
      setInputValue('')
      setSelectedItem('')
    } catch (error) {
      console.error('캘리브레이션 실패:', error)
      setError('캘리브레이션 데이터 저장에 실패했습니다.')
      alert('캘리브레이션에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleModalOpen = (value: number, item: string) => {
    setInputValue(value.toString())
    setSelectedItem(item)
    setModalVisible(true)
  }

  const handleModalClose = () => {
    setModalVisible(false)
    setInputValue('')
    setSelectedItem('')
  }

  const handleSave = () => {
    const numValue = parseFloat(inputValue)
    if (isNaN(numValue)) {
      alert('유효한 숫자를 입력해주세요.')
      return
    }
    handleCalibration(selectedItem, numValue)
  }

  const handleKeypadClick = (value: string) => {
    if (value === 'C') {
      setInputValue('')
    } else if (value === 'B') {
      setInputValue((prev) => prev.slice(0, -1))
    } else if (value === '.') {
      if (!inputValue.includes('.')) {
        setInputValue((prev) => prev + '.')
      }
    } else {
      setInputValue((prev) => prev + value)
    }
  }

  const keypadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'B'],
    ['C', 'Save', 'Cancel'],
  ]

  return (
    <div className="min-h-screen text-slate-100 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300"
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
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-100">
                  센서 캘리브레이션
                </h1>
                <p className="text-sm sm:text-base text-slate-400">
                  센서의 정확도를 높이기 위해 각 센서의 보정값을 설정할 수
                  있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 캘리브레이션 카드들 - 반응형 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {CALIBRATION_ITEMS.map((item) => {
            // 각 센서별 적절한 범위와 색상 설정
            const getSensorConfig = (key: string) => {
              switch (key) {
                case 'temperature':
                  return { min: -10, max: 50, color: '#f97316' }
                case 'humidity':
                  return { min: 0, max: 100, color: '#60a5fa' }
                case 'ph':
                  return { min: 0, max: 14, color: '#10b981' }
                case 'ec':
                  return { min: 0, max: 2000, color: '#fbbf24' }
                case 'n_factor':
                case 'p_factor':
                case 'k_factor':
                  return { min: 0, max: 2, color: '#ef4444' }
                case 'n_offset':
                case 'p_offset':
                case 'k_offset':
                  return { min: -100, max: 100, color: '#06b6d4' }
                default:
                  return { min: 0, max: 100, color: '#3b82f6' }
              }
            }

            const config = getSensorConfig(item.key)

            return (
              <CalibrationCard
                key={item.key}
                title={item.label}
                value={calibrationData[item.key]}
                unit={item.unit}
                icon={`/icons/${item.iconKey}_icon.png`}
                iconAlt={item.iconKey}
                onSetClick={() =>
                  handleModalOpen(calibrationData[item.key] || 0, item.key)
                }
                min={config.min}
                max={config.max}
                color={config.color}
              />
            )
          })}
        </div>
      </div>

      {/* 숫자 키패드 모달 */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-4 sm:p-6">
              <div className="mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-100">
                  {selectedItem} 설정
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  새로운 보정값을 입력하세요
                </p>
              </div>

              <div className="mb-6">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="값을 입력하세요"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-center text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {keypadButtons.flat().map((btn, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (btn === 'Save') {
                        handleSave()
                      } else if (btn === 'Cancel') {
                        handleModalClose()
                      } else {
                        handleKeypadClick(btn)
                      }
                    }}
                    className={`h-12 sm:h-14 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                      btn === 'Save'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : btn === 'Cancel'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
