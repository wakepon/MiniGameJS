import { useCallback } from 'react'
import { useRaceGame } from '../../hooks/useRaceGame'
import GameContainer from '../../components/game/GameContainer'
import ResultModal from '../../components/game/ResultModal'
import RaceGame from '../../components/game/race/RaceGame'

function Game1Page() {
  const { state, actions } = useRaceGame()

  const handleRetry = useCallback(() => {
    actions.reset()
  }, [actions])

  // 結果の計算（秒数をスコアとして表示）
  const result = state.status === 'finished' ? {
    score: parseFloat((state.elapsedTime / 1000).toFixed(1)),
    message: '秒でゴール!',
  } : null

  // 開始ボタン
  const controls = (
    <div className="flex flex-col gap-3">
      {state.status === 'idle' && (
        <button
          onClick={actions.start}
          className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 text-white
                     text-xl font-bold rounded-lg transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                     active:bg-green-700"
        >
          スタート
        </button>
      )}
    </div>
  )

  // ゲームコンテンツ
  const gameContent = state.status === 'idle' ? (
    <div className="text-center">
      <h3 className="text-xl font-bold text-gray-700 mb-4">レースゲーム</h3>
      <div className="text-gray-600 space-y-2">
        <p>500mを走り切ろう!</p>
        <p className="text-sm">
          タップ/クリック: 追い越し車線（速い）
          <br />
          離す: 通常車線（遅い）
        </p>
        <p className="text-sm text-gray-500">
          他の車にぶつかると停止します
        </p>
      </div>
    </div>
  ) : (
    <RaceGame state={state} onLaneChange={actions.changeLane} />
  )

  return (
    <>
      <GameContainer
        title="レースゲーム"
        controls={controls}
      >
        {gameContent}
      </GameContainer>
      <ResultModal
        isOpen={state.status === 'finished'}
        result={result}
        onRetry={handleRetry}
      />
    </>
  )
}

export default Game1Page
