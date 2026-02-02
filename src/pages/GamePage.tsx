import { useParams } from 'react-router-dom'
import { getGameById } from '../lib/games/gameRegistry'
import Game1Page from './games/Game1Page'
import Game2Page from './games/Game2Page'
import Game3Page from './games/Game3Page'
import NotFoundPage from './NotFoundPage'

const gameComponents: Record<string, React.ComponentType> = {
  game1: Game1Page,
  game2: Game2Page,
  game3: Game3Page,
}

function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()

  if (!gameId) {
    return <NotFoundPage />
  }

  const game = getGameById(gameId)
  if (!game) {
    return <NotFoundPage />
  }

  const GameComponent = gameComponents[gameId]
  if (!GameComponent) {
    return <NotFoundPage />
  }

  return <GameComponent />
}

export default GamePage
