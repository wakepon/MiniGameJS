import type {
  Position,
  Bullet,
  Enemy,
  Player,
  CollisionResult,
  PlayerCollisionResult,
} from './types'
import { GAME_CONSTANTS } from './constants'
import { getPlayerHitboxRadius } from './playerUtils'
import { checkEnemyReachedBottom } from './enemyUtils'

/** 円と円の衝突判定 */
export function checkCircleCollision(
  pos1: Position,
  radius1: number,
  pos2: Position,
  radius2: number
): boolean {
  const dx = pos1.x - pos2.x
  const dy = pos1.y - pos2.y
  const distanceSquared = dx * dx + dy * dy
  const radiusSum = radius1 + radius2
  return distanceSquared < radiusSum * radiusSum
}

/**
 * 貫通弾の連続撃破スコアを計算
 * n匹目はn²点: 1匹目1点, 2匹目4点, 3匹目9点...
 * previousKillCount: これまでに倒した敵の数
 * newKills: 今回倒した敵の数
 * 戻り値: 今回獲得したスコア
 */
function calculatePiercingScoreIncrement(
  previousKillCount: number,
  newKills: number
): number {
  let score = 0
  for (let i = 1; i <= newKills; i++) {
    const n = previousKillCount + i
    score += n * n
  }
  return score
}

/** 弾と敵の衝突判定（複数対複数） */
export function checkBulletEnemyCollisions(
  bullets: readonly Bullet[],
  enemies: readonly Enemy[]
): CollisionResult {
  const hitEnemyIds = new Set<string>()
  const hitBulletIds = new Set<string>()
  const updatedBullets: Bullet[] = []
  let scoreGained = 0

  for (const bullet of bullets) {
    let bulletNewKills = 0

    for (const enemy of enemies) {
      if (hitEnemyIds.has(enemy.id)) continue

      const bulletRadius = bullet.size / 2
      const enemyRadius = GAME_CONSTANTS.ENEMY_SIZE / 2

      if (
        checkCircleCollision(
          bullet.position,
          bulletRadius,
          enemy.position,
          enemyRadius
        )
      ) {
        hitEnemyIds.add(enemy.id)
        bulletNewKills++

        // 貫通弾でなければ弾も消える
        if (!bullet.isPiercing) {
          hitBulletIds.add(bullet.id)
          scoreGained += 1 // 通常弾は1点
          break // 非貫通弾は1体の敵にしか当たらない
        }
        // 貫通弾は複数の敵に当たれるのでbreakしない
      }
    }

    // 貫通弾の場合、累計killCountを更新してスコアを計算
    if (bullet.isPiercing) {
      if (bulletNewKills > 0) {
        // n²スコアを計算（累計を考慮）
        scoreGained += calculatePiercingScoreIncrement(
          bullet.killCount,
          bulletNewKills
        )
        // 弾のkillCountを更新
        updatedBullets.push({
          ...bullet,
          killCount: bullet.killCount + bulletNewKills,
        })
      } else {
        updatedBullets.push(bullet)
      }
    } else if (!hitBulletIds.has(bullet.id)) {
      // 通常弾で当たらなかった場合
      updatedBullets.push(bullet)
    }
  }

  return {
    remainingBullets: updatedBullets.filter((b) => !hitBulletIds.has(b.id)),
    remainingEnemies: enemies.filter((e) => !hitEnemyIds.has(e.id)),
    killedCount: hitEnemyIds.size,
    scoreGained,
  }
}

/** 自機と敵の衝突判定、および敵が画面最下部に到達したかチェック */
export function checkPlayerCollisions(
  player: Player,
  enemies: readonly Enemy[]
): PlayerCollisionResult {
  const playerRadius = getPlayerHitboxRadius(player)
  const enemyRadius = GAME_CONSTANTS.ENEMY_SIZE / 2

  const isHit = enemies.some((enemy) =>
    checkCircleCollision(
      player.position,
      playerRadius,
      enemy.position,
      enemyRadius
    )
  )

  const isEnemyReachedBottom = checkEnemyReachedBottom(enemies)

  return {
    isHit,
    isEnemyReachedBottom,
  }
}
