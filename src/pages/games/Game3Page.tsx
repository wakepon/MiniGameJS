import { useCallback, useMemo } from 'react'
import { useGame3 } from '../../hooks/useGame3'
import Game3Canvas from '../../components/game3/Game3Canvas'
import ResultModal from '../../components/game/ResultModal'
import type { GameResult } from '../../lib/games/types'

function Game3Page() {
  const { state, canvasRef, start, handleInput, reset, resize } = useGame3()

  const handleRetry = useCallback(() => {
    reset()
  }, [reset])

  const handleStart = useCallback(() => {
    start()
  }, [start])

  const result: GameResult | null = useMemo(() => {
    if (state.status !== 'gameover') return null
    return {
      score: state.territory.percentage,
      message: `占領率: ${state.territory.percentage}%`,
    }
  }, [state.status, state.territory.percentage])

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold text-gray-800">領域占領</h2>

      <div className="w-full max-w-md">
        <Game3Canvas
          canvasRef={canvasRef}
          onInput={handleInput}
          onResize={resize}
          isPlaying={state.status === 'playing'}
        />
      </div>

      {state.status === 'idle' && (
        <div className="w-full max-w-md">
          <button
            onClick={handleStart}
            className="w-full py-4 px-8 text-xl font-bold rounded-lg
                      bg-green-500 hover:bg-green-600 text-white
                      transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                      active:bg-green-700"
          >
            スタート
          </button>
          <p className="text-center text-gray-600 mt-4 text-sm">
            クリック/タップで方向転換して領域を占領しよう
          </p>
        </div>
      )}

      {state.status === 'playing' && (
        <p className="text-center text-gray-600 text-sm">
          タップで切り込み開始・方向転換
        </p>
      )}

      <ResultModal
        isOpen={state.status === 'gameover'}
        result={result}
        onRetry={handleRetry}
      />
    </div>
  )
}

export default Game3Page
