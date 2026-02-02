import { useReducer, useCallback, useRef, useEffect } from 'react'
import type { RaceGameState, Lane } from '../lib/games/race/types'
import { raceGameReducer, initialRaceGameState } from '../lib/games/race/raceGameReducer'

interface UseRaceGameReturn {
  state: RaceGameState
  actions: {
    start: () => void
    changeLane: (lane: Lane) => void
    reset: () => void
  }
}

export function useRaceGame(): UseRaceGameReturn {
  const [state, dispatch] = useReducer(raceGameReducer, initialRaceGameState)
  const frameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  // ゲームループ
  const gameLoop = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp
    }

    const deltaTime = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp

    // フレームレートを安定させる（最大60fps、デルタタイム上限）
    const clampedDelta = Math.min(deltaTime, 32) // 約30fps以下でもスムーズに

    dispatch({ type: 'TICK', deltaTime: clampedDelta })

    frameRef.current = requestAnimationFrame(gameLoop)
  }, [])

  // ゲームループの開始・停止
  useEffect(() => {
    if (state.status === 'playing' || state.status === 'crashed') {
      lastTimeRef.current = 0
      frameRef.current = requestAnimationFrame(gameLoop)
    }

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
  }, [state.status, gameLoop])

  const start = useCallback(() => {
    dispatch({ type: 'START' })
  }, [])

  const changeLane = useCallback((lane: Lane) => {
    dispatch({ type: 'CHANGE_LANE', lane })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return {
    state,
    actions: {
      start,
      changeLane,
      reset,
    },
  }
}
