export const GAME_CONSTANTS = {
  // Canvas
  MAX_CANVAS_WIDTH: 400,
  CANVAS_PADDING: 20,  // 外周からのパディング

  // プレイヤー
  PLAYER_SPEED: 120,        // px/sec (外周移動時)
  PLAYER_CUT_SPEED: 150,    // px/sec (切り込み時)
  PLAYER_RADIUS: 6,

  // 敵
  ENEMY_SPEED: 100,         // px/sec
  ENEMY_RADIUS: 8,

  // 道
  PATH_WIDTH: 3,

  // 境界判定
  BOUNDARY_TOLERANCE: 5,      // 辺上判定の許容誤差
  MIN_PATH_LENGTH: 20,        // パスが有効とみなされる最小距離

  // 色
  COLORS: {
    BACKGROUND: '#1a1a2e',
    PLAY_AREA: '#16213e',
    OCCUPIED: '#0f3460',
    PLAYER: '#e94560',
    ENEMY: '#00ff88',
    PATH: '#ff6b6b',
    BOUNDARY: '#ffffff',
  },
} as const
