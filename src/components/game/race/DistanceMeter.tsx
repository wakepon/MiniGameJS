import { RACE_CONSTANTS } from '../../../lib/games/race/constants'

interface DistanceMeterProps {
  distance: number
}

function DistanceMeter({ distance }: DistanceMeterProps) {
  const progressPercent = Math.min(
    (distance / RACE_CONSTANTS.GOAL_DISTANCE) * 100,
    100
  )
  const distanceKm = (distance / 1000).toFixed(2)

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{distanceKm} km</span>
        <span>{RACE_CONSTANTS.GOAL_DISTANCE / 1000} km</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}

export default DistanceMeter
