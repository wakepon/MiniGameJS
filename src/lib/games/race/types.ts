// 車線
export type Lane = 'normal' | 'overtaking'

// 位置
export interface Position {
  readonly x: number  // 車線内のX座標（ピクセル）
  readonly y: number  // 画面上の縦位置（ピクセル）
}

// プレイヤー車両
export interface PlayerCar {
  readonly lane: Lane
  readonly speed: number      // km/h
  readonly position: Position
}

// 障害物
export interface Obstacle {
  readonly id: string
  readonly lane: Lane
  readonly y: number  // 画面上の縦位置（ピクセル）
}

// ゲーム状態
export type RaceGameStatus = 'idle' | 'playing' | 'crashed' | 'finished'

export interface RaceGameState {
  readonly status: RaceGameStatus
  readonly player: PlayerCar
  readonly obstacles: readonly Obstacle[]
  readonly distanceTraveled: number  // メートル
  readonly elapsedTime: number       // ミリ秒
  readonly crashRecoveryTime: number // 衝突回復までの残り時間（ミリ秒）
  readonly lastObstacleSpawnTime: number // 最後に障害物を生成した時刻
}

// アクション
export type RaceGameAction =
  | { type: 'START' }
  | { type: 'TICK'; deltaTime: number }
  | { type: 'CHANGE_LANE'; lane: Lane }
  | { type: 'RESET' }
