import type { Enemy, GameArea } from './types'
import { GAME_CONSTANTS } from './constants'

/** 一意なIDを生成（Pure関数） */
function generateEnemyId(): string {
  return `enemy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/** 敵のスポーン間隔計算（時間とともに短くなる） */
export function calculateSpawnInterval(elapsedTime: number): number {
  const decreaseMultiplier = Math.floor(elapsedTime / 10000) // 10秒ごと
  const interval =
    GAME_CONSTANTS.ENEMY_SPAWN_INTERVAL_BASE -
    decreaseMultiplier * GAME_CONSTANTS.ENEMY_SPAWN_INTERVAL_DECREASE

  return Math.max(GAME_CONSTANTS.ENEMY_SPAWN_INTERVAL_MIN, interval)
}

/** 新しい敵を生成 */
export function createEnemy(gameArea: GameArea): Enemy {
  const margin = GAME_CONSTANTS.ENEMY_SIZE / 2
  const spawnRange = gameArea.width - GAME_CONSTANTS.ENEMY_SIZE

  return {
    id: generateEnemyId(),
    position: {
      x: margin + Math.random() * spawnRange,
      y: -GAME_CONSTANTS.ENEMY_SIZE, // 画面外から登場
    },
    speed: GAME_CONSTANTS.ENEMY_SPEED, // 固定速度
  }
}

/** 敵を移動 */
export function moveEnemies(
  enemies: readonly Enemy[],
  deltaTime: number
): readonly Enemy[] {
  return enemies.map((enemy) => ({
    ...enemy,
    position: {
      ...enemy.position,
      y: enemy.position.y + enemy.speed * (deltaTime / 1000),
    },
  }))
}

/** 敵が画面最下部に到達したかチェック */
export function checkEnemyReachedBottom(enemies: readonly Enemy[]): boolean {
  return enemies.some(
    (enemy) => enemy.position.y >= GAME_CONSTANTS.GAME_OVER_LINE
  )
}
