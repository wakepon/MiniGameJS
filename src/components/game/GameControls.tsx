import type { GameStatus } from '../../lib/games/types'

interface GameControlsProps {
  status: GameStatus
  onStart: () => void
  onStop: () => void
}

function GameControls({ status, onStart, onStop }: GameControlsProps) {
  if (status === 'finished') {
    return null
  }

  const isPlaying = status === 'playing'

  return (
    <button
      onClick={isPlaying ? onStop : onStart}
      aria-label={isPlaying ? 'ゲームを停止する' : 'ゲームを開始する'}
      className={`w-full py-4 px-8 text-xl font-bold rounded-lg
                  transition-colors duration-200 min-h-[56px]
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${isPlaying
                    ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 active:bg-red-700'
                    : 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500 active:bg-green-700'
                  }`}
    >
      {isPlaying ? 'ストップ' : 'スタート'}
    </button>
  )
}

export default GameControls
