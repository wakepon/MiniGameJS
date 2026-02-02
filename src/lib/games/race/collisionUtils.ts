import type { PlayerCar, Obstacle } from './types'
import { RACE_CONSTANTS } from './constants'

interface Rectangle {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

// 矩形同士の衝突判定
function rectanglesIntersect(rect1: Rectangle, rect2: Rectangle): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  )
}

// プレイヤーの当たり判定矩形を取得
function getPlayerRect(player: PlayerCar): Rectangle {
  const centerX = player.lane === 'normal'
    ? RACE_CONSTANTS.NORMAL_LANE_X
    : RACE_CONSTANTS.OVERTAKING_LANE_X

  return {
    x: centerX - RACE_CONSTANTS.CAR_WIDTH / 2,
    y: RACE_CONSTANTS.PLAYER_Y,
    width: RACE_CONSTANTS.CAR_WIDTH,
    height: RACE_CONSTANTS.CAR_HEIGHT,
  }
}

// 障害物の当たり判定矩形を取得
function getObstacleRect(obstacle: Obstacle): Rectangle {
  const centerX = obstacle.lane === 'normal'
    ? RACE_CONSTANTS.NORMAL_LANE_X
    : RACE_CONSTANTS.OVERTAKING_LANE_X

  return {
    x: centerX - RACE_CONSTANTS.CAR_WIDTH / 2,
    y: obstacle.y,
    width: RACE_CONSTANTS.CAR_WIDTH,
    height: RACE_CONSTANTS.CAR_HEIGHT,
  }
}

// プレイヤーと障害物の衝突判定（衝突したかどうかのみ）
export function checkCollision(
  player: PlayerCar,
  obstacles: readonly Obstacle[]
): boolean {
  const playerRect = getPlayerRect(player)

  return obstacles.some(obstacle => {
    const obstacleRect = getObstacleRect(obstacle)
    return rectanglesIntersect(playerRect, obstacleRect)
  })
}

// 衝突判定を行い、衝突していない障害物のみを返す
export function filterCollidedObstacles(
  player: PlayerCar,
  obstacles: readonly Obstacle[]
): { hasCollision: boolean; remainingObstacles: readonly Obstacle[] } {
  const playerRect = getPlayerRect(player)
  let hasCollision = false

  const remainingObstacles = obstacles.filter(obstacle => {
    const obstacleRect = getObstacleRect(obstacle)
    const collided = rectanglesIntersect(playerRect, obstacleRect)
    if (collided) {
      hasCollision = true
      return false // 衝突した障害物を除外
    }
    return true // 衝突していない障害物は残す
  })

  return { hasCollision, remainingObstacles }
}
