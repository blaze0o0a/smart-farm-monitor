'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { SENSOR_CONFIGS } from '@/constants/sensors'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
}) => {
  const [isSensorMenuOpen, setIsSensorMenuOpen] = useState(false)

  const menuItems = [
    {
      key: 'dashboard',
      label: '대시보드',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      key: 'sensors',
      label: '센서 데이터',
      icon: ChevronRight,
      hasSubmenu: true,
      isOpen: isSensorMenuOpen,
      onClick: () => setIsSensorMenuOpen(!isSensorMenuOpen),
    },
    {
      key: 'calibration',
      label: '캘리브레이션',
      href: '/calibration',
      icon: Settings,
    },
  ]

  const handleMenuClick = (key: string) => {
    setActiveTab(key)
    setIsOpen(false)
  }

  return (
    <>
      {/* 햄버거 메뉴 버튼 (사이드바가 닫혀있을 때만) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 left-4 md:top-4 md:left-4 md:bottom-auto z-50 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
          title="메뉴 열기"
        >
          <Menu size={20} />
        </button>
      )}

      {/* 반투명 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`
            fixed top-0 left-0 h-full w-64 bg-slate-900/95 backdrop-blur-sm border-r border-slate-800 z-40 transform transition-transform duration-150 ease-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
      >
        <div className="flex flex-col h-full">
          {/* 로고 영역 */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Image
                src="/icons/dashboard_icon.png"
                alt="Smart Farm"
                width={32}
                height={32}
                className="object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-slate-100">Smart Farm</h1>
                <p className="text-xs text-slate-400">Monitoring System</p>
              </div>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-200"
            >
              <X size={18} />
            </button>
          </div>

          {/* 네비게이션 메뉴 */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon

                if (item.hasSubmenu) {
                  return (
                    <div key={item.key}>
                      <button
                        onClick={item.onClick}
                        className={`
                          w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-left transition-colors
                          ${
                            activeTab === item.key
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={20} />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {item.isOpen ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>

                      {/* 센서 서브메뉴 */}
                      {item.isOpen && (
                        <div className="ml-4 mt-2 space-y-1">
                          {SENSOR_CONFIGS.map((sensor) => (
                            <Link
                              key={sensor.dataKey}
                              href={`/sensor/${sensor.dataKey}`}
                              onClick={() => setIsOpen(false)}
                            >
                              <div className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                                <Image
                                  src={sensor.icon}
                                  alt={sensor.iconAlt}
                                  width={16}
                                  height={16}
                                  className="object-contain"
                                />
                                <span className="text-sm">{sensor.title}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }

                return (
                  <Link key={item.key} href={item.href || '#'}>
                    <button
                      onClick={() => handleMenuClick(item.key)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                        ${
                          activeTab === item.key
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }
                      `}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* 하단 정보 */}
          <div className="p-4 border-t border-slate-800">
            <div className="text-xs text-slate-500 text-center">v1.0.0</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
