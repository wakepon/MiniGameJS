export type GameStatus = 'idle' | 'playing' | 'finished'

export interface GameState {
  readonly status: GameStatus
  readonly score: number | null
}

export interface GameResult {
  readonly score: number
  readonly message?: string
}
