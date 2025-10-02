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
    <div className="min-h-screen bg-gray-900 p-6 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            센서 캘리브레이션
          </h1>
          <p className="text-gray-400 text-base">
            센서의 정확도를 높이기 위해 각 센서의 보정값을 설정할 수 있습니다.
          </p>
        </div>

        {/* 캘리브레이션 카드들 - 반응형 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6 md:gap-6 lg:gap-8">
          {CALIBRATION_ITEMS.map((item) => (
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
            />
          ))}
        </div>
      </div>

      {/* 숫자 키패드 모달 */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-80 max-w-md mx-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-200">
                {selectedItem} 설정
              </h3>
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="값을 입력하세요"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-center text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
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
                  className={`h-12 rounded-lg font-medium transition-colors ${
                    btn === 'Save'
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : btn === 'Cancel'
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
