import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { SocketState, ServerToClientEvents, ClientToServerEvents } from '@/types/socket'

const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? 'http://localhost:3331' 
  : 'http://localhost:3331'

export function useSocket() {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const [socketState, setSocketState] = useState<SocketState>({
    connected: false,
    connecting: false,
    error: null
  })
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // 소켓 연결
    const connectSocket = () => {
      if (socket?.connected) return

      setSocketState(prev => ({ ...prev, connecting: true, error: null }))
      
      const newSocket = io(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      })

      // 연결 성공
      newSocket.on('connect', () => {
        console.log('Socket 연결됨:', newSocket.id)
        setSocketState({
          connected: true,
          connecting: false,
          error: null
        })
        
        // 재연결 타이머 클리어
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
      })

      // 연결 해제
      newSocket.on('disconnect', (reason) => {
        console.log('Socket 연결 해제됨:', reason)
        setSocketState(prev => ({
          ...prev,
          connected: false,
          connecting: false
        }))
      })

      // 연결 오류
      newSocket.on('connect_error', (error) => {
        console.error('Socket 연결 오류:', error)
        setSocketState({
          connected: false,
          connecting: false,
          error: error.message
        })

        // 5초 후 재연결 시도
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSocket()
        }, 5000) as NodeJS.Timeout
      })

      setSocket(newSocket)
    }

    connectSocket()

    // 정리 함수
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  return {
    socket,
    socketState,
    isConnected: socketState.connected,
    isConnecting: socketState.connecting,
    error: socketState.error
  }
}
