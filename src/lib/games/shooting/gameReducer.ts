import type { ShootingGameState, ShootingAction, GameArea } from './types'
import { GAME_CONSTANTS } from './constants'
import {
  movePlayer,
  updateCharge,
  moveBullets,
  createBullet,
  createInitialPlayer,
} from './playerUtils'
import { moveEnemies, createEnemy } from './enemyUtils'
import {
  checkBulletEnemyCollisions,
  checkPlayerCollisions,
} from './collisionUtils'

/** 初期状態を生成 */
export function createInitialState(gameArea: GameArea): ShootingGameState {
  return {
    player: createInitialPlayer(gameArea),
    bullets: [],
    enemies: [],
    score: 0,
    elapsedTime: 0,
    isGameOver: false,
    gameArea,
  }
}

/** デフォルトのゲームエリア */
export function getDefaultGameArea(): GameArea {
  return {
    width: GAME_CONSTANTS.CANVAS_WIDTH,
    height: GAME_CONSTANTS.CANVAS_HEIGHT,
  }
}

/** TICKアクションを処理 */
function handleTick(
  state: ShootingGameState,
  deltaTime: number
): ShootingGameState {
  if (state.isGameOver) return state

  // 1. 自機移動
  const movedPlayer = movePlayer(state.player, deltaTime, state.gameArea)

  // 2. チャージ更新
  const chargedPlayer = updateCharge(movedPlayer, deltaTime)

  // 3. 弾移動
  const movedBullets = moveBullets(state.bullets, deltaTime)

  // 4. 敵移動
  const movedEnemies = moveEnemies(state.enemies, deltaTime)

  // 5. 衝突判定（弾 vs 敵）
  const { remainingBullets, remainingEnemies, scoreGained } =
    checkBulletEnemyCollisions(movedBullets, movedEnemies)

  // 6. 衝突判定（自機 vs 敵）/ ゲームオーバー判定
  const { isHit, isEnemyReachedBottom } = checkPlayerCollisions(
    chargedPlayer,
    remainingEnemies
  )

  return {
    ...state,
    player: chargedPlayer,
    bullets: remainingBullets,
    enemies: remainingEnemies,
    score: state.score + scoreGained,
    elapsedTime: state.elapsedTime + deltaTime,
    isGameOver: isHit || isEnemyReachedBottom,
  }
}

/** チャージ開始を処理 */
function handleStartCharge(state: ShootingGameState): ShootingGameState {
  if (state.isGameOver) return state

  return {
    ...state,
    player: {
      ...state.player,
      isCharging: true,
      chargeLevel: 0,
    },
  }
}

/** チャージ解放（発射）を処理 */
function handleReleaseCharge(state: ShootingGameState): ShootingGameState {
  if (state.isGameOver) return state
  if (!state.player.isCharging) return state

  const newBullet = createBullet(state.player)

  return {
    ...state,
    player: {
      ...state.player,
      isCharging: false,
      chargeLevel: 0,
    },
    bullets: [...state.bullets, newBullet],
  }
}

/** 敵スポーンを処理 */
function handleSpawnEnemy(state: ShootingGameState): ShootingGameState {
  if (state.isGameOver) return state
  if (state.enemies.length >= GAME_CONSTANTS.MAX_ENEMIES) return state

  const newEnemy = createEnemy(state.gameArea)

  return {
    ...state,
    enemies: [...state.enemies, newEnemy],
  }
}

/** ゲームリセットを処理 */
function handleReset(state: ShootingGameState): ShootingGameState {
  return createInitialState(state.gameArea)
}

/** シューティングゲームのReducer */
export function shootingGameReducer(
  state: ShootingGameState,
  action: ShootingAction
): ShootingGameState {
  switch (action.type) {
    case 'TICK':
      return handleTick(state, action.deltaTime)
    case 'START_CHARGE':
      return handleStartCharge(state)
    case 'RELEASE_CHARGE':
      return handleReleaseCharge(state)
    case 'SPAWN_ENEMY':
      return handleSpawnEnemy(state)
    case 'RESET':
      return handleReset(state)
    default:
      return state
  }
}
