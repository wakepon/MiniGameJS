import { games } from '../lib/games/gameRegistry'
import GameCard from '../components/GameCard'

function HomePage() {
  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          まだゲームが登録されていません
        </p>
        <p className="text-gray-400 text-sm mt-2">
          gameRegistry.ts にゲームを追加してください
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {games.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  )
}

export default HomePage
