import type { Lane } from '../../../lib/games/race/types'
import { RACE_CONSTANTS } from '../../../lib/games/race/constants'

interface PlayerCarProps {
  lane: Lane
  isCrashed: boolean
}

function PlayerCar({ lane, isCrashed }: PlayerCarProps) {
  const x = lane === 'normal'
    ? RACE_CONSTANTS.NORMAL_LANE_X
    : RACE_CONSTANTS.OVERTAKING_LANE_X

  return (
    <div
      className={`absolute transition-all duration-100 ${
        isCrashed ? 'animate-pulse' : ''
      }`}
      style={{
        left: x - RACE_CONSTANTS.CAR_WIDTH / 2,
        top: RACE_CONSTANTS.PLAYER_Y,
        width: RACE_CONSTANTS.CAR_WIDTH,
        height: RACE_CONSTANTS.CAR_HEIGHT,
      }}
    >
      {/* 車体 */}
      <div
        className={`w-full h-full rounded-lg ${
          isCrashed ? 'bg-red-500' : 'bg-blue-500'
        } shadow-lg relative`}
      >
        {/* フロントガラス */}
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 bg-sky-200 rounded"
          style={{
            width: RACE_CONSTANTS.CAR_WIDTH * 0.6,
            height: RACE_CONSTANTS.CAR_HEIGHT * 0.25,
          }}
        />

        {/* ヘッドライト */}
        <div className="absolute top-1 left-2 w-2 h-2 bg-yellow-300 rounded-full" />
        <div className="absolute top-1 right-2 w-2 h-2 bg-yellow-300 rounded-full" />

        {/* 車輪（左上） */}
        <div className="absolute -left-1 top-3 w-3 h-6 bg-gray-800 rounded" />
        {/* 車輪（右上） */}
        <div className="absolute -right-1 top-3 w-3 h-6 bg-gray-800 rounded" />
        {/* 車輪（左下） */}
        <div className="absolute -left-1 bottom-3 w-3 h-6 bg-gray-800 rounded" />
        {/* 車輪（右下） */}
        <div className="absolute -right-1 bottom-3 w-3 h-6 bg-gray-800 rounded" />
      </div>
    </div>
  )
}

export default PlayerCar
