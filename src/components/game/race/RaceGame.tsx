import { useRef } from 'react'
import type { RaceGameState, Lane } from '../../../lib/games/race/types'
import { useRaceInput } from '../../../hooks/useRaceInput'
import RaceTrack from './RaceTrack'
import PlayerCar from './PlayerCar'
import ObstacleCar from './ObstacleCar'
import SpeedMeter from './SpeedMeter'
import DistanceMeter from './DistanceMeter'

interface RaceGameProps {
  state: RaceGameState
  onLaneChange: (lane: Lane) => void
}

function RaceGame({ state, onLaneChange }: RaceGameProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 入力ハンドリング
  useRaceInput({
    containerRef,
    onLaneChange,
    enabled: state.status === 'playing' || state.status === 'crashed',
  })

  const formatTime = (ms: number): string => {
    const seconds = ms / 1000
    return seconds.toFixed(1)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 上部UI（速度・時間） */}
      <div className="flex justify-between items-center w-full max-w-[280px]">
        <SpeedMeter speed={state.player.speed} />
        <div className="flex flex-col items-center">
          <span className="text-2xl font-mono font-bold text-gray-700">
            {formatTime(state.elapsedTime)}
          </span>
          <span className="text-sm text-gray-500">秒</span>
        </div>
      </div>

      {/* 距離メーター */}
      <div className="w-full max-w-[280px]">
        <DistanceMeter distance={state.distanceTraveled} />
      </div>

      {/* ゲームエリア */}
      <div
        ref={containerRef}
        className="select-none cursor-pointer touch-none"
        style={{ touchAction: 'none' }}
      >
        <RaceTrack speed={state.player.speed}>
          {/* 障害物 */}
          {state.obstacles.map(obstacle => (
            <ObstacleCar key={obstacle.id} obstacle={obstacle} />
          ))}

          {/* プレイヤー */}
          <PlayerCar
            lane={state.player.lane}
            isCrashed={state.status === 'crashed'}
          />
        </RaceTrack>
      </div>

      {/* 操作説明 */}
      {state.status === 'playing' && (
        <p className="text-sm text-gray-500 text-center">
          タップ/クリック: 追い越し車線
          <br />
          離す: 通常車線に戻る
        </p>
      )}

      {/* クラッシュ時のメッセージ */}
      {state.status === 'crashed' && (
        <p className="text-lg font-bold text-red-500 animate-pulse">
          衝突! 回復中...
        </p>
      )}
    </div>
  )
}

export default RaceGame
