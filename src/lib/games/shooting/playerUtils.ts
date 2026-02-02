import type { Player, GameArea, Bullet } from './types'
import { GAME_CONSTANTS } from './constants'

/** 一意なIDを生成（Pure関数） */
function generateBulletId(): string {
  return `bullet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/** 自機を移動（壁で反転） */
export function movePlayer(
  player: Player,
  deltaTime: number,
  gameArea: GameArea
): Player {
  const movement =
    GAME_CONSTANTS.PLAYER_SPEED * (deltaTime / 1000) * player.direction
  let newX = player.position.x + movement
  let newDirection = player.direction

  const minX = GAME_CONSTANTS.PLAYER_WIDTH / 2
  const maxX = gameArea.width - GAME_CONSTANTS.PLAYER_WIDTH / 2

  // 壁で反転
  if (newX <= minX) {
    newDirection = 1
    newX = minX
  } else if (newX >= maxX) {
    newDirection = -1
    newX = maxX
  }

  return {
    ...player,
    position: { ...player.position, x: newX },
    direction: newDirection,
  }
}

/** チャージレベルを更新 */
export function updateCharge(player: Player, deltaTime: number): Player {
  if (!player.isCharging) {
    return player
  }

  const chargeIncrement = deltaTime / GAME_CONSTANTS.MAX_CHARGE_TIME
  const newChargeLevel = Math.min(1, player.chargeLevel + chargeIncrement)

  return {
    ...player,
    chargeLevel: newChargeLevel,
  }
}

/** フルチャージ判定のしきい値 */
const FULL_CHARGE_THRESHOLD = 0.95

/** 弾を生成 */
export function createBullet(player: Player): Bullet {
  const size =
    GAME_CONSTANTS.BULLET_SIZE_MIN +
    (GAME_CONSTANTS.BULLET_SIZE_MAX - GAME_CONSTANTS.BULLET_SIZE_MIN) *
      player.chargeLevel

  // フルチャージ（95%以上）なら貫通弾
  const isPiercing = player.chargeLevel >= FULL_CHARGE_THRESHOLD

  return {
    id: generateBulletId(),
    position: {
      x: player.position.x,
      y: player.position.y - GAME_CONSTANTS.PLAYER_HEIGHT / 2,
    },
    size,
    isPiercing,
    killCount: 0,
  }
}

/** 弾を移動 */
export function moveBullets(
  bullets: readonly Bullet[],
  deltaTime: number
): readonly Bullet[] {
  const movement = GAME_CONSTANTS.BULLET_SPEED * (deltaTime / 1000)

  return bullets
    .map((bullet) => ({
      ...bullet,
      position: {
        ...bullet.position,
        y: bullet.position.y - movement,
      },
    }))
    .filter((bullet) => bullet.position.y + bullet.size > 0) // 画面外の弾を削除
}

/** 自機の当たり判定半径を計算 */
export function getPlayerHitboxRadius(player: Player): number {
  if (!player.isCharging) {
    return GAME_CONSTANTS.PLAYER_HITBOX_NORMAL
  }

  // チャージレベルに応じて当たり判定が大きくなる
  return (
    GAME_CONSTANTS.PLAYER_HITBOX_NORMAL +
    (GAME_CONSTANTS.PLAYER_HITBOX_CHARGING_MAX -
      GAME_CONSTANTS.PLAYER_HITBOX_NORMAL) *
      player.chargeLevel
  )
}

/** 初期の自機状態を生成 */
export function createInitialPlayer(gameArea: GameArea): Player {
  return {
    position: {
      x: gameArea.width / 2,
      y: GAME_CONSTANTS.PLAYER_Y_POSITION,
    },
    direction: 1,
    isCharging: false,
    chargeLevel: 0,
  }
}
