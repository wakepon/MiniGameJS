export const RACE_CONSTANTS = {
  // 速度（km/h）
  MAX_SPEED_NORMAL: 30,
  MAX_SPEED_OVERTAKING: 300,
  ACCELERATION: 30,      // km/h per second（加速度）
  DECELERATION: 50,      // km/h per second（減速度）

  // 距離
  GOAL_DISTANCE: 500,    // メートル（500m）

  // 障害物
  OBSTACLE_SPAWN_INTERVAL: 2500,  // ミリ秒（2.5秒間隔）
  OBSTACLE_SPEED: 60,    // km/h（障害物の基本速度、高いほど相対速度が低くなる）
  OBSTACLE_MIN_DISTANCE: 150, // 最低距離（ピクセル）

  // 衝突
  CRASH_RECOVERY_TIME: 500,   // ミリ秒（0.5秒）

  // 描画
  TRACK_WIDTH: 280,
  LANE_WIDTH: 140,
  CAR_WIDTH: 50,
  CAR_HEIGHT: 80,
  TRACK_HEIGHT: 500,

  // 車線のX座標（中心位置）
  NORMAL_LANE_X: 70,      // 左側（通常車線）
  OVERTAKING_LANE_X: 210, // 右側（追い越し車線）

  // プレイヤーの固定Y位置（画面下部）
  PLAYER_Y: 380,

  // 速度からピクセル移動量への変換係数
  // 実際の速度感を出すための係数（km/h → pixels/ms）
  SPEED_TO_PIXELS: 0.05,
} as const
