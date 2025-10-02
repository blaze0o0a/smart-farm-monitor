import { useState, useEffect } from 'react'

export const useCardHeight = () => {
  const [cardHeight, setCardHeight] = useState('')

  useEffect(() => {
    const calculateHeight = () => {
      const screenHeight = window.innerHeight

      // 데스크톱 모드 (1024px 이상)에서만 화면 높이의 1/3 사용
      if (window.innerWidth >= 1024) {
        const availableHeight = screenHeight - 200 // 헤더, 여백 등 고려
        const calculatedHeight = Math.floor(availableHeight / 3) // 1/3로 나누기
        setCardHeight(`${calculatedHeight}px`)
      } else {
        // 모바일/태블릿에서는 기본 CSS 클래스 사용
        setCardHeight('')
      }
    }

    calculateHeight()
    window.addEventListener('resize', calculateHeight)

    return () => window.removeEventListener('resize', calculateHeight)
  }, [])

  return cardHeight
}
