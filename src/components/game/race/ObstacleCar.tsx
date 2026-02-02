import type { Obstacle } from '../../../lib/games/race/types'
import { RACE_CONSTANTS } from '../../../lib/games/race/constants'

interface ObstacleCarProps {
  obstacle: Obstacle
}

function ObstacleCar({ obstacle }: ObstacleCarProps) {
  const x = obstacle.lane === 'normal'
    ? RACE_CONSTANTS.NORMAL_LANE_X
    : RACE_CONSTANTS.OVERTAKING_LANE_X

  return (
    <div
      className="absolute"
      style={{
        left: x - RACE_CONSTANTS.CAR_WIDTH / 2,
        top: obstacle.y,
        width: RACE_CONSTANTS.CAR_WIDTH,
        height: RACE_CONSTANTS.CAR_HEIGHT,
      }}
    >
      {/* 車体（奥に向かって進む = プレイヤーと同じ方向） */}
      <div className="w-full h-full rounded-lg bg-gray-500 shadow-lg relative">
        {/* フロントガラス（上部 = 奥側） */}
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 bg-gray-300 rounded"
          style={{
            width: RACE_CONSTANTS.CAR_WIDTH * 0.6,
            height: RACE_CONSTANTS.CAR_HEIGHT * 0.25,
          }}
        />

        {/* ヘッドライト（上部 = 奥側） */}
        <div className="absolute top-1 left-2 w-2 h-2 bg-yellow-300 rounded-full" />
        <div className="absolute top-1 right-2 w-2 h-2 bg-yellow-300 rounded-full" />

        {/* テールライト（下部 = 手前側、プレイヤーに見える） */}
        <div className="absolute bottom-1 left-2 w-2 h-2 bg-red-500 rounded-full" />
        <div className="absolute bottom-1 right-2 w-2 h-2 bg-red-500 rounded-full" />

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

export default ObstacleCar
