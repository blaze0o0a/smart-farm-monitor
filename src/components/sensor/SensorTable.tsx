import React from 'react'
import { TableDataRow, SortConfig, PaginationConfig } from '@/types/sensor'

interface SensorTableProps {
  data: TableDataRow[]
  currentData: TableDataRow[]
  sortedData: TableDataRow[]
  sensorType: string
  sensorConfig: {
    title: string
    unit: string
  }
  isAnyLoading: boolean
  sortConfig: SortConfig | null
  pagination: PaginationConfig
  onSort: (key: string) => void
  onPaginationChange: (
    config: PaginationConfig | ((prev: PaginationConfig) => PaginationConfig)
  ) => void
}

export function SensorTable({
  data,
  currentData,
  sortedData,
  sensorType,
  sensorConfig,
  isAnyLoading,
  sortConfig,
  pagination,
  onSort,
  onPaginationChange,
}: SensorTableProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-lg">
      <div className="p-3 sm:p-4 border-b border-slate-800">
        <h2 className="text-base sm:text-lg font-medium text-slate-100">
          {sensorConfig.title} 데이터 테이블
        </h2>
        <div className="text-xs sm:text-sm text-slate-400">
          총 {data.length}개 데이터
        </div>
      </div>

      <div className="p-2 sm:p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-800">
              <tr>
                <th
                  className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-700"
                  onClick={() => onSort('time')}
                >
                  <div className="flex items-center gap-1">
                    <span>시간</span>
                    <div className="flex items-center ml-1">
                      <svg
                        className={`w-3 h-3 ${
                          sortConfig?.key === 'time' &&
                          sortConfig.direction === 'asc'
                            ? 'text-blue-400'
                            : 'text-gray-500'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                      <svg
                        className={`w-3 h-3 ml-0.5 ${
                          sortConfig?.key === 'time' &&
                          sortConfig.direction === 'desc'
                            ? 'text-blue-400'
                            : 'text-gray-500'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" />
                      </svg>
                    </div>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  {sensorConfig.title} ({sensorConfig.unit})
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-900 divide-y divide-slate-700">
              {isAnyLoading ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-3 sm:px-6 py-3 sm:py-4 text-center"
                  >
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-3 sm:px-6 py-3 sm:py-4 text-center text-slate-400 text-sm"
                  >
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                currentData.map((row: TableDataRow, index: number) => (
                  <tr key={index} className="hover:bg-slate-800">
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-200">
                      {row.time}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-200">
                      {typeof row[sensorType as keyof TableDataRow] === 'number'
                        ? (
                            row[sensorType as keyof TableDataRow] as number
                          )?.toFixed(1)
                        : row[sensorType as keyof TableDataRow] || '--'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {sortedData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-slate-300">
              {(pagination.current - 1) * pagination.pageSize + 1}-
              {Math.min(
                pagination.current * pagination.pageSize,
                sortedData.length
              )}{' '}
              / 총 {sortedData.length}개
            </div>
            <div className="flex space-x-1 sm:space-x-2">
              <button
                onClick={() =>
                  onPaginationChange((prev) => ({
                    ...prev,
                    current: prev.current - 1,
                  }))
                }
                disabled={pagination.current === 1}
                className="px-2 sm:px-3 py-1 border border-slate-600 rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-200 bg-slate-900"
              >
                이전
              </button>
              <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-slate-300">
                {pagination.current} /{' '}
                {Math.ceil(sortedData.length / pagination.pageSize)}
              </span>
              <button
                onClick={() =>
                  onPaginationChange((prev) => ({
                    ...prev,
                    current: prev.current + 1,
                  }))
                }
                disabled={
                  pagination.current >=
                  Math.ceil(sortedData.length / pagination.pageSize)
                }
                className="px-2 sm:px-3 py-1 border border-slate-600 rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-200 bg-slate-900"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
