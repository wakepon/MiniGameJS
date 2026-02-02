import { RACE_CONSTANTS } from '../../../lib/games/race/constants'

interface SpeedMeterProps {
  speed: number
}

function SpeedMeter({ speed }: SpeedMeterProps) {
  // 速度に応じた色（低速=青、高速=赤）
  const getSpeedColor = (currentSpeed: number): string => {
    const ratio = currentSpeed / RACE_CONSTANTS.MAX_SPEED_OVERTAKING
    if (ratio < 0.4) return 'text-blue-500'
    if (ratio < 0.7) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="flex flex-col items-center">
      <span className={`text-3xl font-bold ${getSpeedColor(speed)}`}>
        {Math.round(speed)}
      </span>
      <span className="text-sm text-gray-500">km/h</span>
    </div>
  )
}

export default SpeedMeter
