import { useState, useCallback } from 'react'
import type { GameState } from '../lib/games/types'

const initialState: GameState = {
  status: 'idle',
  score: null,
}

export function useGame() {
  const [state, setState] = useState<GameState>(initialState)

  const start = useCallback(() => {
    setState({
      status: 'playing',
      score: null,
    })
  }, [])

  const stop = useCallback((score: number) => {
    setState({
      status: 'finished',
      score,
    })
  }, [])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  return {
    status: state.status,
    score: state.score,
    start,
    stop,
    reset,
  }
}
