import type { Obstacle, Lane } from './types'
import { RACE_CONSTANTS } from './constants'
import { calculatePixelMovement } from './speedUtils'

// ユニークなIDを生成（純粋関数）
function generateId(): string {
  return crypto.randomUUID()
}

// 全障害物の中で最上部のものを取得
function getTopObstacle(obstacles: readonly Obstacle[]): Obstacle | null {
  return obstacles.reduce<Obstacle | null>(
    (top, current) => {
      if (!top || current.y < top.y) return current
      return top
    },
    null
  )
}

// 新しい障害物を生成（画面上部から出現）
// 両車線が同時にブロックされないよう、必ず片方の車線のみに生成
export function spawnObstacle(existingObstacles: readonly Obstacle[]): Obstacle | null {
  // 全障害物の最上部をチェック（車線問わず）
  const topObstacle = getTopObstacle(existingObstacles)

  // 最上部の障害物がまだ画面上部付近にある場合はスポーンしない
  if (topObstacle && topObstacle.y < RACE_CONSTANTS.OBSTACLE_MIN_DISTANCE) {
    return null
  }

  // スポーン可能な場合、最上部の障害物とは異なる車線を優先
  let lane: Lane
  if (topObstacle) {
    // 最上部の障害物とは反対の車線に生成（回避可能にする）
    lane = topObstacle.lane === 'normal' ? 'overtaking' : 'normal'
  } else {
    // 障害物がない場合はランダム
    lane = Math.random() < 0.5 ? 'normal' : 'overtaking'
  }

  return {
    id: generateId(),
    lane,
    y: -RACE_CONSTANTS.CAR_HEIGHT, // 画面外上部から出現
  }
}

// 障害物の移動と画面外削除を一括で処理（パフォーマンス改善）
export function updateObstacles(
  obstacles: readonly Obstacle[],
  playerSpeed: number,
  deltaTimeMs: number
): readonly Obstacle[] {
  const movement = calculatePixelMovement(
    playerSpeed,
    RACE_CONSTANTS.OBSTACLE_SPEED,
    deltaTimeMs
  )
  const maxY = RACE_CONSTANTS.TRACK_HEIGHT + RACE_CONSTANTS.CAR_HEIGHT

  return obstacles.reduce<Obstacle[]>((acc, obstacle) => {
    const newY = obstacle.y + movement
    if (newY < maxY) {
      acc.push({ ...obstacle, y: newY })
    }
    return acc
  }, [])
}
