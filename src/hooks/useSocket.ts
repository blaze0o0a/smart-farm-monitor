/**
 * @fileoverview Socket.IO 클라이언트 연결 관리 Hook
 * @description React 컴포넌트에서 WebSocket 통신을 위한 커스텀 훅
 * @module hooks/useSocket
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import {
  SocketState,
  ServerToClientEvents,
  ClientToServerEvents,
} from '@/types/socket'

/**
 * Socket.IO 서버 URL
 * @constant {string}
 */
const SOCKET_URL =
  process.env.NODE_ENV === 'production'
    ? 'http://localhost:3331'
    : 'http://localhost:3331'

/**
 * Socket.IO 클라이언트 연결을 관리하는 커스텀 Hook
 * @returns {Object} Socket 연결 상태 및 소켓 인스턴스
 * @returns {Socket|null} socket - Socket.IO 클라이언트 인스턴스
 * @returns {SocketState} socketState - 연결 상태 정보
 * @returns {boolean} isConnected - 연결 여부
 * @returns {boolean} isConnecting - 연결 중 여부
 * @returns {string|null} error - 오류 메시지
 *
 * @example
 * ```tsx
 * const { socket, isConnected, error } = useSocket()
 *
 * useEffect(() => {
 *   if (socket && isConnected) {
 *     socket.emit('request:dashboard')
 *   }
 * }, [socket, isConnected])
 * ```
 */
export function useSocket() {
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null)
  /**
   * Socket 연결 상태
   * @type {[SocketState, Function]}
   */
  const [socketState, setSocketState] = useState<SocketState>({
    connected: false,
    connecting: false,
    error: null,
  })

  /**
   * 재연결 타이머 참조
   * @type {React.MutableRefObject<NodeJS.Timeout|null>}
   */
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * 소켓 연결 함수
   * @description Socket.IO 클라이언트 연결을 생성하고 이벤트 리스너를 등록
   * @private
   */
  const connectSocket = useCallback(
    () => {
      if (socket?.connected) return

      setSocketState((prev) => ({ ...prev, connecting: true, error: null }))

      const newSocket = io(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      })

      // 연결 성공 이벤트
      newSocket.on('connect', () => {
        console.log('Socket 연결됨:', newSocket.id)
        setSocketState({
          connected: true,
          connecting: false,
          error: null,
        })

        // 재연결 타이머 클리어
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
      })

      // 연결 해제 이벤트
      newSocket.on('disconnect', (reason) => {
        console.log('Socket 연결 해제됨:', reason)
        setSocketState((prev) => ({
          ...prev,
          connected: false,
          connecting: false,
        }))
      })

      // 연결 오류 이벤트 (자동 재연결 시도)
      newSocket.on('connect_error', (error) => {
        console.error('Socket 연결 오류:', error)
        setSocketState({
          connected: false,
          connecting: false,
          error: error.message,
        })

        // 5초 후 재연결 시도
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSocket()
        }, 5000) as NodeJS.Timeout
      })

      setSocket(newSocket)
    },
    [socket] // socket 의존성 추가
  )

  /**
   * 컴포넌트 마운트 시 소켓 연결 시작
   * @description 컴포넌트가 마운트될 때 소켓을 연결하고 언마운트 시 정리
   */
  useEffect(() => {
    connectSocket()

    // 정리 함수: 컴포넌트 언마운트 시 소켓 연결 해제
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (socket) {
        socket.disconnect()
      }
    }
  }, [connectSocket, socket]) // connectSocket과 socket을 의존성 배열에 추가

  return {
    socket,
    socketState,
    isConnected: socketState.connected,
    isConnecting: socketState.connecting,
    error: socketState.error,
  }
}
