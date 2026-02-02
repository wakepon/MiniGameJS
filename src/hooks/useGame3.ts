import { useReducer, useCallback, useRef, useEffect } from 'react'
import type { Size } from '../lib/games/game3/types'
import { createInitialState, game3Reducer } from '../lib/games/game3/gameReducer'
import { renderGame } from '../lib/games/game3/renderer'
import { GAME_CONSTANTS } from '../lib/games/game3/constants'

const DEFAULT_SIZE: Size = {
  width: GAME_CONSTANTS.MAX_CANVAS_WIDTH,
  height: GAME_CONSTANTS.MAX_CANVAS_WIDTH,
}

export function useGame3() {
  const [state, dispatch] = useReducer(game3Reducer, DEFAULT_SIZE, createInitialState)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const statusRef = useRef(state.status)

  // statusRefを同期
  useEffect(() => {
    statusRef.current = state.status
  }, [state.status])

  // ゲームループ
  const gameLoop = useCallback((currentTime: number) => {
    if (statusRef.current !== 'playing') {
      return
    }

    const deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 1000 : 0
    lastTimeRef.current = currentTime

    // 最大deltaTimeを制限（タブ切り替え時の大きなジャンプを防ぐ）
    const clampedDeltaTime = Math.min(deltaTime, 0.1)

    dispatch({ type: 'TICK', deltaTime: clampedDeltaTime })
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [])

  // ゲームループの開始/停止
  useEffect(() => {
    if (state.status === 'playing') {
      lastTimeRef.current = 0
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [state.status, gameLoop])

  // Canvas描画
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    renderGame(ctx, state)
  }, [state])

  // アクション
  const start = useCallback(() => {
    dispatch({ type: 'START' })
  }, [])

  const handleInput = useCallback(() => {
    dispatch({ type: 'INPUT' })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const resize = useCallback((width: number, height: number) => {
    dispatch({ type: 'RESIZE', width, height })
  }, [])

  return {
    state,
    canvasRef,
    start,
    handleInput,
    reset,
    resize,
  }
}
