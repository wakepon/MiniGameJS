import type { Lane } from './types'
import { RACE_CONSTANTS } from './constants'

// 現在の車線に応じた目標速度を取得
export function getTargetSpeed(lane: Lane): number {
  return lane === 'overtaking'
    ? RACE_CONSTANTS.MAX_SPEED_OVERTAKING
    : RACE_CONSTANTS.MAX_SPEED_NORMAL
}

// deltaTimeに応じて速度を更新（段階的に変化）
export function updateSpeed(
  currentSpeed: number,
  targetSpeed: number,
  deltaTimeMs: number
): number {
  const deltaTimeSec = deltaTimeMs / 1000

  if (currentSpeed < targetSpeed) {
    // 加速
    const newSpeed = currentSpeed + RACE_CONSTANTS.ACCELERATION * deltaTimeSec
    return Math.min(newSpeed, targetSpeed)
  } else if (currentSpeed > targetSpeed) {
    // 減速
    const newSpeed = currentSpeed - RACE_CONSTANTS.DECELERATION * deltaTimeSec
    return Math.max(newSpeed, targetSpeed)
  }

  return currentSpeed
}

// 速度から移動距離を計算（メートル）
export function calculateDistance(speedKmh: number, deltaTimeMs: number): number {
  // km/h を m/ms に変換: km/h * 1000m/km / 3600000ms/h = km/h / 3600
  const speedMeterPerMs = speedKmh / 3600
  return speedMeterPerMs * deltaTimeMs
}

// 相対速度からピクセル移動量を計算（画面上の移動）
export function calculatePixelMovement(
  playerSpeedKmh: number,
  obstacleSpeedKmh: number,
  deltaTimeMs: number
): number {
  // 相対速度（プレイヤーが速いほど障害物が速く近づいてくる）
  const relativeSpeed = playerSpeedKmh - obstacleSpeedKmh
  return relativeSpeed * RACE_CONSTANTS.SPEED_TO_PIXELS * deltaTimeMs
}
