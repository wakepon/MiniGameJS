export const GAME_CONSTANTS = {
  // ゲームエリア
  CANVAS_WIDTH: 320,
  CANVAS_HEIGHT: 480,

  // 自機
  PLAYER_WIDTH: 32,
  PLAYER_HEIGHT: 32,
  PLAYER_SPEED: 150, // px/sec
  PLAYER_Y_POSITION: 420, // 画面下部固定
  PLAYER_HITBOX_NORMAL: 12, // 通常時の当たり判定半径
  PLAYER_HITBOX_CHARGING_MAX: 36, // 溜め中の最大当たり判定半径

  // 弾
  BULLET_SPEED: 400, // px/sec
  BULLET_SIZE_MIN: 8,
  BULLET_SIZE_MAX: 32,
  MAX_CHARGE_TIME: 1500, // ミリ秒

  // 敵
  ENEMY_SIZE: 24,
  ENEMY_SPEED: 80, // px/sec（固定速度）
  ENEMY_SPAWN_INTERVAL_BASE: 2000, // ミリ秒（初期スポーン間隔）
  ENEMY_SPAWN_INTERVAL_MIN: 300, // 最小スポーン間隔
  ENEMY_SPAWN_INTERVAL_DECREASE: 150, // 10秒ごとの間隔短縮
  MAX_ENEMIES: 20,

  // ゲームオーバー判定ライン
  GAME_OVER_LINE: 450,
} as const
