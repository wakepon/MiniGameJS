import { useCallback, useState, useEffect, useRef } from 'react'
import { useGame } from '../../hooks/useGame'
import { useShootingGame } from '../../hooks/useShootingGame'
import GameContainer from '../../components/game/GameContainer'
import ResultModal from '../../components/game/ResultModal'
import { ShootingCanvas, ShootingUI } from '../../components/shooting'
import type { GameResult } from '../../lib/games/types'

function Game2Page() {
  const { status, start: startGameStatus, stop: stopGameStatus, reset: resetGameStatus } = useGame()
  const {
    state: shootingState,
    start: startShooting,
    reset: resetShooting,
    startCharge,
    releaseCharge,
  } = useShootingGame()

  const [result, setResult] = useState<GameResult | null>(null)
  const isPressedRef = useRef(false)

  // ゲーム開始
  const handleStart = useCallback(() => {
    startGameStatus()
    startShooting()
  }, [startGameStatus, startShooting])

  // ゲームオーバー時の処理（useEffectで副作用を処理）
  useEffect(() => {
    if (shootingState.isGameOver && status !== 'finished') {
      stopGameStatus(shootingState.score)
      setResult({
        score: shootingState.score,
        message: `${shootingState.score}匹の敵を倒した！`,
      })
    }
  }, [shootingState.isGameOver, shootingState.score, status, stopGameStatus])

  // リトライ
  const handleRetry = useCallback(() => {
    setResult(null)
    resetGameStatus()
    resetShooting()
  }, [resetGameStatus, resetShooting])

  const isPlaying = status === 'playing' && !shootingState.isGameOver

  // 画面全体でのタッチ/クリックハンドラ
  const handlePressStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      if (!isPlaying || isPressedRef.current) return
      isPressedRef.current = true
      startCharge()
    },
    [isPlaying, startCharge]
  )

  const handlePressEnd = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      if (!isPressedRef.current) return
      isPressedRef.current = false
      releaseCharge()
    },
    [releaseCharge]
  )

  // グローバルなマウスアップ/タッチエンドの処理
  useEffect(() => {
    const handleGlobalEnd = () => {
      if (isPressedRef.current) {
        isPressedRef.current = false
        releaseCharge()
      }
    }

    window.addEventListener('mouseup', handleGlobalEnd)
    window.addEventListener('touchend', handleGlobalEnd)
    window.addEventListener('touchcancel', handleGlobalEnd)

    return () => {
      window.removeEventListener('mouseup', handleGlobalEnd)
      window.removeEventListener('touchend', handleGlobalEnd)
      window.removeEventListener('touchcancel', handleGlobalEnd)
    }
  }, [releaseCharge])

  // ゲームオーバー時にプレス状態をリセット
  useEffect(() => {
    if (!isPlaying && isPressedRef.current) {
      isPressedRef.current = false
    }
  }, [isPlaying])

  return (
    <>
      <GameContainer
        title="シューティング"
        controls={
          status === 'idle' ? (
            <button
              onClick={handleStart}
              className="w-full py-4 px-8 text-xl font-bold rounded-lg
                         bg-green-500 hover:bg-green-600 text-white
                         transition-colors duration-200 min-h-[56px]
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                         active:bg-green-700"
            >
              スタート
            </button>
          ) : (
            <div className="text-center text-gray-500 text-sm py-2">
              {shootingState.player.isCharging ? (
                <span className="text-orange-400 font-bold">離すと発射！</span>
              ) : (
                '画面をタッチして溜め撃ち'
              )}
            </div>
          )
        }
      >
        <div
          className={`flex flex-col items-center gap-4 bg-gray-900 p-4 rounded-lg select-none ${
            isPlaying ? 'cursor-pointer' : ''
          }`}
          onMouseDown={isPlaying ? handlePressStart : undefined}
          onMouseUp={isPlaying ? handlePressEnd : undefined}
          onMouseLeave={isPlaying ? handlePressEnd : undefined}
          onTouchStart={isPlaying ? handlePressStart : undefined}
          onTouchEnd={isPlaying ? handlePressEnd : undefined}
          onTouchCancel={isPlaying ? handlePressEnd : undefined}
          style={{ touchAction: 'none' }}
        >
          {status === 'idle' ? (
            <div className="text-center text-gray-400 py-8">
              <p className="text-lg mb-2">遊び方</p>
              <p className="text-sm">
                自機は自動で左右に移動します
                <br />
                画面をタッチして溜め、離すと発射！
                <br />
                溜めると弾が大きくなりますが
                <br />
                溜め中は被弾しやすくなります
              </p>
            </div>
          ) : (
            <>
              <ShootingUI
                score={shootingState.score}
                chargeLevel={shootingState.player.chargeLevel}
                isCharging={shootingState.player.isCharging}
              />
              <ShootingCanvas gameState={shootingState} />
            </>
          )}
        </div>
      </GameContainer>
      <ResultModal isOpen={status === 'finished'} result={result} onRetry={handleRetry} />
    </>
  )
}

export default Game2Page
