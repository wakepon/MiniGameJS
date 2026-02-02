import type { EnemyState, Rectangle, Point, Line } from './types'
import { GAME_CONSTANTS } from './constants'
import { lineIntersectsCircle } from './geometry'

// 初期敵状態を作成（中央付近からランダムな方向）
export function createInitialEnemy(playArea: Rectangle): EnemyState {
  const centerX = playArea.x + playArea.width / 2
  const centerY = playArea.y + playArea.height / 2

  // ランダムな角度で初期速度を決定
  const angle = Math.random() * Math.PI * 2
  const speed = GAME_CONSTANTS.ENEMY_SPEED

  return {
    position: { x: centerX, y: centerY },
    velocity: {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    },
  }
}

// 敵の移動
export function moveEnemy(
  enemy: EnemyState,
  playArea: Rectangle,
  deltaTime: number
): EnemyState {
  const newPosition: Point = {
    x: enemy.position.x + enemy.velocity.x * deltaTime,
    y: enemy.position.y + enemy.velocity.y * deltaTime,
  }

  // 壁との衝突判定と反射
  let newVelocity = enemy.velocity
  let finalPosition = newPosition

  const { x, y, width, height } = playArea
  const radius = GAME_CONSTANTS.ENEMY_RADIUS

  // 左壁
  if (newPosition.x - radius < x) {
    finalPosition = { ...finalPosition, x: x + radius }
    newVelocity = { ...newVelocity, x: Math.abs(newVelocity.x) }
  }
  // 右壁
  if (newPosition.x + radius > x + width) {
    finalPosition = { ...finalPosition, x: x + width - radius }
    newVelocity = { ...newVelocity, x: -Math.abs(newVelocity.x) }
  }
  // 上壁
  if (newPosition.y - radius < y) {
    finalPosition = { ...finalPosition, y: y + radius }
    newVelocity = { ...newVelocity, y: Math.abs(newVelocity.y) }
  }
  // 下壁
  if (newPosition.y + radius > y + height) {
    finalPosition = { ...finalPosition, y: y + height - radius }
    newVelocity = { ...newVelocity, y: -Math.abs(newVelocity.y) }
  }

  return {
    position: finalPosition,
    velocity: newVelocity,
  }
}

// 敵と経路（道）の衝突判定
export function checkCollisionWithPath(
  enemy: EnemyState,
  path: readonly Point[]
): boolean {
  if (path.length < 2) {
    return false
  }

  const radius = GAME_CONSTANTS.ENEMY_RADIUS + GAME_CONSTANTS.PATH_WIDTH

  // パスの各線分と敵の衝突をチェック
  for (let i = 0; i < path.length - 1; i++) {
    const line: Line = {
      start: path[i],
      end: path[i + 1],
    }

    if (lineIntersectsCircle(line, enemy.position, radius)) {
      return true
    }
  }

  return false
}
