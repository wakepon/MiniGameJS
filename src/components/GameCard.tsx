import { Link } from 'react-router-dom'
import type { GameInfo } from '../lib/games/gameRegistry'

interface GameCardProps {
  game: GameInfo
}

function GameCard({ game }: GameCardProps) {
  return (
    <Link
      to={`/game/${game.id}`}
      className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg
                 transition-shadow duration-200 min-h-[80px] min-w-[80px]
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                 active:bg-gray-50"
    >
      <h2 className="text-lg font-semibold text-gray-800 text-center">
        {game.name}
      </h2>
    </Link>
  )
}

export default GameCard
