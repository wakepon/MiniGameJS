import { useCallback, useState } from 'react'
import { useGame } from '../../hooks/useGame'
import GameContainer from '../../components/game/GameContainer'
import GameControls from '../../components/game/GameControls'
import ResultModal from '../../components/game/ResultModal'
import PlaceholderGame from './PlaceholderGame'
import type { GameResult } from '../../lib/games/types'

interface GenericGamePageProps {
  gameName: string
}

function GenericGamePage({ gameName }: GenericGamePageProps) {
  const { status, start, stop, reset } = useGame()
  const [result, setResult] = useState<GameResult | null>(null)

  const handleScoreGenerated = useCallback((score: number) => {
    setResult({ score, message: 'ポイント獲得!' })
  }, [])

  const handleStop = useCallback(() => {
    stop(0)
  }, [stop])

  const handleRetry = useCallback(() => {
    setResult(null)
    reset()
  }, [reset])

  return (
    <>
      <GameContainer
        title={gameName}
        controls={
          <GameControls status={status} onStart={start} onStop={handleStop} />
        }
      >
        <PlaceholderGame
          gameName={gameName}
          status={status}
          onScoreGenerated={handleScoreGenerated}
        />
      </GameContainer>
      <ResultModal
        isOpen={status === 'finished'}
        result={result}
        onRetry={handleRetry}
      />
    </>
  )
}

export default GenericGamePage
