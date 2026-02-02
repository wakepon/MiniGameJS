import { useEffect } from 'react'
import type { GameStatus } from '../../lib/games/types'

const MAX_SCORE = 1000

interface PlaceholderGameProps {
  gameName: string
  status: GameStatus
  onScoreGenerated: (score: number) => void
}

function PlaceholderGame({ gameName, status, onScoreGenerated }: PlaceholderGameProps) {
  useEffect(() => {
    if (status === 'finished') {
      const score = Math.floor(Math.random() * (MAX_SCORE + 1))
      onScoreGenerated(score)
    }
  }, [status, onScoreGenerated])

  if (status === 'idle') {
    return (
      <div className="text-center">
        <p className="text-xl text-gray-600">{gameName}</p>
        <p className="text-gray-400 mt-2">スタートボタンを押してください</p>
      </div>
    )
  }

  if (status === 'playing') {
    return (
      <div className="text-center">
        <p className="text-2xl text-blue-600 font-bold animate-pulse">
          プレイ中...
        </p>
      </div>
    )
  }

  return null
}

export default PlaceholderGame
