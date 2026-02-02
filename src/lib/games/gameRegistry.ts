export interface GameInfo {
  readonly id: string
  readonly name: string
}

// ゲームを追加する場合はこの配列に追記
export const games: readonly GameInfo[] = [
  { id: 'game1', name: 'レースゲーム' },
  { id: 'game2', name: 'ゲーム2' },
  { id: 'game3', name: 'ゲーム3' },
]

export function getGameById(id: string): GameInfo | undefined {
  return games.find(game => game.id === id)
}
