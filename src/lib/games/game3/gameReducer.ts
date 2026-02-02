import type { Game3State, Game3Action, Size, Polygon } from './types'
import { GAME_CONSTANTS } from './constants'
import { calculatePolygonArea, clampPointToPolygon, pointInPolygon } from './geometry'
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

// 矩形からポリゴンを作成
function createPlayArea(canvasSize: Size): Polygon {
  const padding = GAME_CONSTANTS.CANVAS_PADDING
  return {
    vertices: [
      { x: padding, y: padding },
      { x: canvasSize.width - padding, y: padding },
      { x: canvasSize.width - padding, y: canvasSize.height - padding },
      { x: padding, y: canvasSize.height - padding },
    ],
  }
}

// 初期状態を作成
export function createInitialState(canvasSize: Size): Game3State {
  const playArea = createPlayArea(canvasSize)
  const initialArea = calculatePolygonArea(playArea)

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
      const initialArea = calculatePolygonArea(playArea)

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
        // パスの終点を現在のプレイヤー位置で確定
        const finalPath = [...newPlayer.path, newPlayer.position]

        const { newTerritory, newPlayArea } = occupyTerritory(
          state.territory,
          finalPath,
          state.playArea,
          newEnemy.position,
          state.initialArea
        )

        // プレイヤーを新しい外周に配置
        const playerOnBoundary = returnToBoundary(newPlayer, newPlayArea)

        // 敵の位置を新しいplayArea内にクランプ
        let adjustedEnemy = newEnemy
        if (!pointInPolygon(newEnemy.position, newPlayArea)) {
          const clampedPos = clampPointToPolygon(newEnemy.position, newPlayArea)
          adjustedEnemy = { ...newEnemy, position: clampedPos }
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
          player: startCutting(state.player, state.playArea),
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
