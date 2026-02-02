/** 2D座標 */
export interface Position {
  readonly x: number
  readonly y: number
}

/** 自機の状態 */
export interface Player {
  readonly position: Position
  readonly direction: 1 | -1 // 1: 右移動, -1: 左移動
  readonly isCharging: boolean
  readonly chargeLevel: number // 0-1の範囲（溜め具合）
}

/** 弾の状態 */
export interface Bullet {
  readonly id: string
  readonly position: Position
  readonly size: number // チャージレベルに応じたサイズ
  readonly isPiercing: boolean // 貫通弾かどうか（フルチャージ時）
  readonly killCount: number // この弾が倒した敵の累計数（貫通弾用）
}

/** 敵の状態 */
export interface Enemy {
  readonly id: string
  readonly position: Position
  readonly speed: number
}

/** ゲームエリアのサイズ */
export interface GameArea {
  readonly width: number
  readonly height: number
}

/** ゲーム全体の状態 */
export interface ShootingGameState {
  readonly player: Player
  readonly bullets: readonly Bullet[]
  readonly enemies: readonly Enemy[]
  readonly score: number
  readonly elapsedTime: number // ミリ秒
  readonly isGameOver: boolean
  readonly gameArea: GameArea
}

/** ゲームアクション */
export type ShootingAction =
  | { type: 'TICK'; deltaTime: number }
  | { type: 'START_CHARGE' }
  | { type: 'RELEASE_CHARGE' }
  | { type: 'SPAWN_ENEMY' }
  | { type: 'RESET' }

/** 衝突判定の結果 */
export interface CollisionResult {
  readonly remainingBullets: readonly Bullet[]
  readonly remainingEnemies: readonly Enemy[]
  readonly killedCount: number
  readonly scoreGained: number // 獲得スコア（貫通連続撃破ボーナス込み）
}

/** 自機衝突判定の結果 */
export interface PlayerCollisionResult {
  readonly isHit: boolean
  readonly isEnemyReachedBottom: boolean
}
