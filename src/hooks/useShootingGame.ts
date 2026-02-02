import { useReducer, useCallback, useRef, useEffect } from 'react'
import {
  shootingGameReducer,
  createInitialState,
  getDefaultGameArea,
  calculateSpawnInterval,
} from '../lib/games/shooting'
import type { ShootingGameState } from '../lib/games/shooting'

/** フレームスキップ防止の最大deltaTime */
const MAX_DELTA_TIME = 100

interface UseShootingGameReturn {
  state: ShootingGameState
  isPlaying: boolean
  start: () => void
  stop: () => void
  reset: () => void
  startCharge: () => void
  releaseCharge: () => void
}

export function useShootingGame(): UseShootingGameReturn {
  const gameArea = getDefaultGameArea()
  const [state, dispatch] = useReducer(
    shootingGameReducer,
    gameArea,
    createInitialState
  )

  const isPlayingRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const spawnTimerRef = useRef<number>(0)
  // stale closure問題を回避するためにstateをrefで追跡
  const stateRef = useRef(state)

  // stateが変更されたらrefを更新
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // ゲームループ（依存配列を空にしてstale closureを回避）
  const gameLoop = useCallback((currentTime: number) => {
    if (!isPlayingRef.current) return

    if (lastTimeRef.current === null) {
      lastTimeRef.current = currentTime
    }

    const deltaTime = Math.min(currentTime - lastTimeRef.current, MAX_DELTA_TIME)
    lastTimeRef.current = currentTime

    if (deltaTime > 0) {
      dispatch({ type: 'TICK', deltaTime })

      // 敵スポーン判定（refから最新の値を取得）
      spawnTimerRef.current += deltaTime
      const spawnInterval = calculateSpawnInterval(stateRef.current.elapsedTime)
      if (spawnTimerRef.current >= spawnInterval) {
        dispatch({ type: 'SPAWN_ENEMY' })
        spawnTimerRef.current = 0
      }
    }

    if (!stateRef.current.isGameOver && isPlayingRef.current) {
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
  }, [])

  // ゲームオーバー時にループを停止
  useEffect(() => {
    if (state.isGameOver && isPlayingRef.current) {
      isPlayingRef.current = false
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [state.isGameOver])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const start = useCallback(() => {
    if (isPlayingRef.current) return

    dispatch({ type: 'RESET' })
    isPlayingRef.current = true
    lastTimeRef.current = null
    spawnTimerRef.current = 0
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [gameLoop])

  const stop = useCallback(() => {
    isPlayingRef.current = false
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    stop()
    dispatch({ type: 'RESET' })
  }, [stop])

  const startCharge = useCallback(() => {
    if (!isPlayingRef.current || stateRef.current.isGameOver) return
    dispatch({ type: 'START_CHARGE' })
  }, [])

  const releaseCharge = useCallback(() => {
    if (!isPlayingRef.current || stateRef.current.isGameOver) return
    dispatch({ type: 'RELEASE_CHARGE' })
  }, [])

  return {
    state,
    isPlaying: isPlayingRef.current && !state.isGameOver,
    start,
    stop,
    reset,
    startCharge,
    releaseCharge,
  }
}
