// 基本型
export interface Point {
  readonly x: number
  readonly y: number
}

export interface Line {
  readonly start: Point
  readonly end: Point
}

export interface Rectangle {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export interface Size {
  readonly width: number
  readonly height: number
}

// ポリゴン型（時計回りで頂点を格納）
export interface Polygon {
  readonly vertices: readonly Point[]
}

// 辺（ポリゴンの辺情報用）
export interface Edge {
  readonly start: Point
  readonly end: Point
  readonly index: number
}

// プレイヤーの辺上位置
export interface EdgePosition {
  readonly edgeIndex: number  // 現在いる辺のインデックス
  readonly t: number          // 辺上の位置（0.0〜1.0）
}

// 方向（時計回りに定義）- cutting時のみ使用
export type Direction = 'up' | 'right' | 'down' | 'left'

// プレイヤーの移動状態
export type PlayerMode = 'boundary' | 'cutting'

// プレイヤー状態
export interface PlayerState {
  readonly position: Point
  readonly edgePosition: EdgePosition | null  // boundary時のみ使用
  readonly direction: Direction               // cutting時のみ使用（4方向）
  readonly mode: PlayerMode
  readonly path: readonly Point[]  // cutting中の経路（道）
}

// 敵状態
export interface EnemyState {
  readonly position: Point
  readonly velocity: Point
}

// 占領済み領域
export interface Territory {
  readonly occupiedArea: number  // 占領済み面積
  readonly percentage: number    // 0-100
}

// ゲーム全体の状態
export type Game3Status = 'idle' | 'playing' | 'gameover'

export interface Game3State {
  readonly status: Game3Status
  readonly player: PlayerState
  readonly enemy: EnemyState
  readonly territory: Territory
  readonly playArea: Polygon      // ポリゴン形状のプレイエリア
  readonly canvasSize: Size
  readonly initialArea: number    // 初期面積（占領率計算用）
}

// アクション
export type Game3Action =
  | { type: 'START' }
  | { type: 'TICK'; deltaTime: number }
  | { type: 'INPUT' }
  | { type: 'GAME_OVER' }
  | { type: 'RESET' }
  | { type: 'RESIZE'; width: number; height: number }
