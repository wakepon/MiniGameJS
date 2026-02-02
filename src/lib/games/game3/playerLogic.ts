import type { PlayerState, Polygon, Point } from './types'
import { GAME_CONSTANTS } from './constants'
import {
  distance,
  directionToVector,
  rotateDirectionClockwise,
  getPolygonEdges,
  getPointOnEdge,
  getEdgeLength,
  pointOnPolygonBoundary,
  clampPointToPolygon,
  getInwardNormal,
  quantizeToFourDirections,
} from './geometry'

const { BOUNDARY_TOLERANCE } = GAME_CONSTANTS

// パスに追加する最小距離
const MIN_PATH_POINT_DISTANCE = 3

// 初期プレイヤー状態を作成（最初の辺の開始点から）
export function createInitialPlayer(playArea: Polygon): PlayerState {
  return {
    position: playArea.vertices[0],
    edgePosition: { edgeIndex: 0, t: 0 },
    direction: 'right',
    mode: 'boundary',
    path: [],
  }
}

// 外周移動時のプレイヤー更新（ポリゴンの辺に沿って移動）
export function movePlayerOnBoundary(
  player: PlayerState,
  playArea: Polygon,
  deltaTime: number
): PlayerState {
  if (!player.edgePosition) return player

  const edges = getPolygonEdges(playArea)
  const currentEdge = edges[player.edgePosition.edgeIndex]
  const edgeLength = getEdgeLength(currentEdge)

  if (edgeLength === 0) {
    // 長さゼロの辺は次の辺へ
    const nextEdgeIndex = (player.edgePosition.edgeIndex + 1) % edges.length
    return {
      ...player,
      edgePosition: { edgeIndex: nextEdgeIndex, t: 0 },
    }
  }

  const speed = GAME_CONSTANTS.PLAYER_SPEED * deltaTime
  const tIncrement = speed / edgeLength

  let newT = player.edgePosition.t + tIncrement
  let edgeIndex = player.edgePosition.edgeIndex

  // 辺の端に到達したら次の辺へ（時計回り）
  // ループ回数を制限して無限ループを防止
  let loopGuard = edges.length + 1
  while (newT >= 1 && loopGuard > 0) {
    newT -= 1
    edgeIndex = (edgeIndex + 1) % edges.length
    loopGuard--
  }

  // ガードに引っかかった場合は現在位置を維持
  if (loopGuard <= 0) {
    newT = 0
  }

  const newEdge = edges[edgeIndex]
  const newPosition = getPointOnEdge(newEdge, newT)

  return {
    ...player,
    position: newPosition,
    edgePosition: { edgeIndex, t: newT },
  }
}

// 切り込み開始
export function startCutting(player: PlayerState, playArea: Polygon): PlayerState {
  if (!player.edgePosition) return player

  const edges = getPolygonEdges(playArea)
  const currentEdge = edges[player.edgePosition.edgeIndex]

  // 現在の辺からポリゴン内部への方向を取得し、4方向に量子化
  const inwardNormal = getInwardNormal(currentEdge, playArea)
  const cuttingDirection = quantizeToFourDirections(inwardNormal)

  return {
    ...player,
    mode: 'cutting',
    direction: cuttingDirection,
    edgePosition: null,
    path: [player.position],
  }
}

// 切り込み中の移動
export function movePlayerCutting(
  player: PlayerState,
  playArea: Polygon,
  deltaTime: number
): PlayerState {
  const speed = GAME_CONSTANTS.PLAYER_CUT_SPEED * deltaTime
  const vector = directionToVector(player.direction)

  const newPosition: Point = {
    x: player.position.x + vector.x * speed,
    y: player.position.y + vector.y * speed,
  }

  // ポリゴン内にクランプ
  const clamped = clampPointToPolygon(newPosition, playArea)

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
export function hasReachedBoundary(player: PlayerState, playArea: Polygon): boolean {
  if (player.mode !== 'cutting' || player.path.length < 2) {
    return false
  }

  const currentPos = player.position
  const startPos = player.path[0]

  // 開始位置から十分離れていなければ到達とみなさない（最低距離）
  if (distance(currentPos, startPos) < GAME_CONSTANTS.MIN_PATH_LENGTH) {
    return false
  }

  // 現在の位置と開始位置がポリゴンの辺上かチェック
  const tolerance = GAME_CONSTANTS.BOUNDARY_TOLERANCE
  const currentEdgePos = pointOnPolygonBoundary(currentPos, playArea, tolerance)
  const startEdgePos = pointOnPolygonBoundary(startPos, playArea, tolerance)

  if (!currentEdgePos) {
    return false
  }

  // 異なる辺に到達した場合のみ有効
  if (currentEdgePos.edgeIndex !== startEdgePos?.edgeIndex) {
    return true
  }

  // 同じ辺の場合は到達とみなさない（同一辺分割は無効化したため）
  return false
}

// 外周到達時、境界移動モードに戻る
export function returnToBoundary(player: PlayerState, playArea: Polygon): PlayerState {
  const edgePos = pointOnPolygonBoundary(player.position, playArea, BOUNDARY_TOLERANCE)

  return {
    ...player,
    mode: 'boundary',
    edgePosition: edgePos ?? { edgeIndex: 0, t: 0 },
    path: [],
  }
}
