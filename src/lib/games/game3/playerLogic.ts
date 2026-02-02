import type { PlayerState, Rectangle, Point, Direction } from './types'
import { GAME_CONSTANTS } from './constants'
import {
  directionToVector,
  rotateDirectionClockwise,
  getEdge,
  getDirectionForEdge,
  clampPointToRect,
  distance,
} from './geometry'

// パスに追加する最小距離
const MIN_PATH_POINT_DISTANCE = 3

// 初期プレイヤー状態を作成（左上から開始、右に移動）
export function createInitialPlayer(playArea: Rectangle): PlayerState {
  return {
    position: { x: playArea.x, y: playArea.y },
    direction: 'right',
    mode: 'boundary',
    path: [],
  }
}

// 外周移動時のプレイヤー更新
export function movePlayerOnBoundary(
  player: PlayerState,
  playArea: Rectangle,
  deltaTime: number
): PlayerState {
  const speed = GAME_CONSTANTS.PLAYER_SPEED * deltaTime
  const vector = directionToVector(player.direction)

  let newX = player.position.x + vector.x * speed
  let newY = player.position.y + vector.y * speed

  // 角に到達したら方向転換（時計回り）
  const { needsTurn, position, direction } = handleCornerTurn(
    { x: newX, y: newY },
    player.direction,
    playArea
  )

  if (needsTurn) {
    return {
      ...player,
      position,
      direction,
    }
  }

  // 辺に沿って移動
  const clampedPosition = clampToBoundary(
    { x: newX, y: newY },
    player.direction,
    playArea
  )

  return {
    ...player,
    position: clampedPosition,
  }
}

// 角での方向転換処理
function handleCornerTurn(
  position: Point,
  direction: Direction,
  playArea: Rectangle
): { needsTurn: boolean; position: Point; direction: Direction } {
  const { x, y, width, height } = playArea
  const right = x + width
  const bottom = y + height

  // 各角でのチェック
  if (direction === 'right' && position.x >= right) {
    return {
      needsTurn: true,
      position: { x: right, y: position.y },
      direction: 'down',
    }
  }
  if (direction === 'down' && position.y >= bottom) {
    return {
      needsTurn: true,
      position: { x: position.x, y: bottom },
      direction: 'left',
    }
  }
  if (direction === 'left' && position.x <= x) {
    return {
      needsTurn: true,
      position: { x, y: position.y },
      direction: 'up',
    }
  }
  if (direction === 'up' && position.y <= y) {
    return {
      needsTurn: true,
      position: { x: position.x, y },
      direction: 'right',
    }
  }

  return { needsTurn: false, position, direction }
}

// 辺に沿うように位置をクランプ
function clampToBoundary(
  position: Point,
  direction: Direction,
  playArea: Rectangle
): Point {
  const { x, y, width, height } = playArea

  // 移動方向に応じて、対応する辺の座標に固定
  switch (direction) {
    case 'right':
    case 'left':
      // 上辺または下辺を移動中
      if (position.y <= y) {
        return { x: position.x, y }
      }
      if (position.y >= y + height) {
        return { x: position.x, y: y + height }
      }
      break
    case 'up':
    case 'down':
      // 左辺または右辺を移動中
      if (position.x <= x) {
        return { x, y: position.y }
      }
      if (position.x >= x + width) {
        return { x: x + width, y: position.y }
      }
      break
  }

  return position
}

// 切り込み開始
export function startCutting(player: PlayerState): PlayerState {
  // 外周から内側に向かう方向を決定（時計回りに90度）
  const cuttingDirection = rotateDirectionClockwise(player.direction)

  return {
    ...player,
    mode: 'cutting',
    direction: cuttingDirection,
    path: [player.position],  // 開始点を記録
  }
}

// 切り込み中の移動
export function movePlayerCutting(
  player: PlayerState,
  playArea: Rectangle,
  deltaTime: number
): PlayerState {
  const speed = GAME_CONSTANTS.PLAYER_CUT_SPEED * deltaTime
  const vector = directionToVector(player.direction)

  const newPosition: Point = {
    x: player.position.x + vector.x * speed,
    y: player.position.y + vector.y * speed,
  }

  // 境界チェック
  const clamped = clampPointToRect(newPosition, playArea)

  // パスへの追加は一定距離以上移動した場合のみ
  const lastPoint = player.path[player.path.length - 1]
  const shouldAddPoint = lastPoint ? distance(lastPoint, clamped) >= MIN_PATH_POINT_DISTANCE : true

  return {
    ...player,
    position: clamped,
    path: shouldAddPoint ? [...player.path, clamped] : player.path,
  }
}

// 切り込み中の方向転換（時計回り）
export function turnPlayerCutting(player: PlayerState): PlayerState {
  return {
    ...player,
    direction: rotateDirectionClockwise(player.direction),
  }
}

// 外周に到達したかチェック
export function hasReachedBoundary(player: PlayerState, playArea: Rectangle): boolean {
  if (player.mode !== 'cutting' || player.path.length < 2) {
    return false
  }

  const currentPos = player.position
  const startPos = player.path[0]

  // 開始点とは異なる辺に到達したかチェック
  const currentEdge = getEdge(currentPos, playArea, 3)
  const startEdge = getEdge(startPos, playArea, 3)

  if (currentEdge === null) {
    return false
  }

  // 同じ辺上でも、十分離れていれば到達とみなす
  if (currentEdge === startEdge) {
    const dx = Math.abs(currentPos.x - startPos.x)
    const dy = Math.abs(currentPos.y - startPos.y)
    return dx > 10 || dy > 10
  }

  return true
}

// 外周到達時、境界移動モードに戻る
export function returnToBoundary(player: PlayerState, playArea: Rectangle): PlayerState {
  const edge = getEdge(player.position, playArea, 5)
  const newDirection = edge ? getDirectionForEdge(edge) : 'right'

  return {
    ...player,
    mode: 'boundary',
    direction: newDirection,
    path: [],
  }
}
