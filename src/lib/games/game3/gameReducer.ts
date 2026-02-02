import type { Game3State, Game3Action, Size, Rectangle } from './types'
import { GAME_CONSTANTS } from './constants'
import { calculateRectArea, clampPointToRect } from './geometry'
import {
  createInitialPlayer,
  movePlayerOnBoundary,
  movePlayerCutting,
  startCutting,
  turnPlayerCutting,
  hasReachedBoundary,
  returnToBoundary,
} from './playerLogic'
import {
  createInitialEnemy,
  moveEnemy,
  checkCollisionWithPath,
} from './enemyLogic'
import { createInitialTerritory, occupyTerritory } from './territoryLogic'

// プレイエリアを計算
function createPlayArea(canvasSize: Size): Rectangle {
  const padding = GAME_CONSTANTS.CANVAS_PADDING
  return {
    x: padding,
    y: padding,
    width: canvasSize.width - padding * 2,
    height: canvasSize.height - padding * 2,
  }
}

// 初期状態を作成
export function createInitialState(canvasSize: Size): Game3State {
  const playArea = createPlayArea(canvasSize)
  const initialArea = calculateRectArea(playArea)

  return {
    status: 'idle',
    player: createInitialPlayer(playArea),
    enemy: createInitialEnemy(playArea),
    territory: createInitialTerritory(),
    playArea,
    canvasSize,
    initialArea,
  }
}

// ゲームReducer
export function game3Reducer(state: Game3State, action: Game3Action): Game3State {
  switch (action.type) {
    case 'START': {
      const playArea = createPlayArea(state.canvasSize)
      const initialArea = calculateRectArea(playArea)

      return {
        ...state,
        status: 'playing',
        player: createInitialPlayer(playArea),
        enemy: createInitialEnemy(playArea),
        territory: createInitialTerritory(),
        playArea,
        initialArea,
      }
    }

    case 'TICK': {
      if (state.status !== 'playing') {
        return state
      }

      const { deltaTime } = action

      // プレイヤーの移動
      let newPlayer = state.player
      if (newPlayer.mode === 'boundary') {
        newPlayer = movePlayerOnBoundary(newPlayer, state.playArea, deltaTime)
      } else {
        newPlayer = movePlayerCutting(newPlayer, state.playArea, deltaTime)
      }

      // 敵の移動
      const newEnemy = moveEnemy(state.enemy, state.playArea, deltaTime)

      // 衝突判定: 敵とパス
      if (newPlayer.mode === 'cutting' && checkCollisionWithPath(newEnemy, newPlayer.path)) {
        return {
          ...state,
          status: 'gameover',
          player: newPlayer,
          enemy: newEnemy,
        }
      }

      // 領域占領判定: パスが外周に到達したか
      if (newPlayer.mode === 'cutting' && hasReachedBoundary(newPlayer, state.playArea)) {
        const { newTerritory, newPlayArea } = occupyTerritory(
          state.territory,
          newPlayer.path,
          state.playArea,
          newEnemy.position,
          state.initialArea
        )

        // プレイヤーを新しい外周に配置
        const playerOnBoundary = returnToBoundary(newPlayer, newPlayArea)

        // 敵の位置を新しいplayArea内にクランプ
        const radius = GAME_CONSTANTS.ENEMY_RADIUS
        const clampedEnemyPos = clampPointToRect(newEnemy.position, {
          x: newPlayArea.x + radius,
          y: newPlayArea.y + radius,
          width: newPlayArea.width - radius * 2,
          height: newPlayArea.height - radius * 2,
        })
        const adjustedEnemy = {
          ...newEnemy,
          position: clampedEnemyPos,
        }

        return {
          ...state,
          player: playerOnBoundary,
          enemy: adjustedEnemy,
          territory: newTerritory,
          playArea: newPlayArea,
        }
      }

      return {
        ...state,
        player: newPlayer,
        enemy: newEnemy,
      }
    }

    case 'INPUT': {
      if (state.status !== 'playing') {
        return state
      }

      // 外周移動中: 切り込み開始
      if (state.player.mode === 'boundary') {
        return {
          ...state,
          player: startCutting(state.player),
        }
      }

      // 切り込み中: 時計回りに90度回転
      return {
        ...state,
        player: turnPlayerCutting(state.player),
      }
    }

    case 'GAME_OVER': {
      return {
        ...state,
        status: 'gameover',
      }
    }

    case 'RESET': {
      return createInitialState(state.canvasSize)
    }

    case 'RESIZE': {
      const newCanvasSize: Size = { width: action.width, height: action.height }

      // ゲームがidle状態なら、新しいサイズで再初期化
      if (state.status === 'idle') {
        return createInitialState(newCanvasSize)
      }

      // プレイ中はサイズのみ更新（ゲームには影響しない）
      return {
        ...state,
        canvasSize: newCanvasSize,
      }
    }

    default:
      return state
  }
}
