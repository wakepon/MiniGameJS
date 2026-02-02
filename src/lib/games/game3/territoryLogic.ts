import type { Territory, Polygon, Point } from './types'
import { GAME_CONSTANTS } from './constants'
import {
  calculatePolygonArea,
  pointInPolygon,
  pointOnPolygonBoundary,
  getPolygonEdges,
  getPointOnEdge,
} from './geometry'

const { BOUNDARY_TOLERANCE } = GAME_CONSTANTS

// 初期領域状態を作成
export function createInitialTerritory(): Territory {
  return {
    occupiedArea: 0,
    percentage: 0,
  }
}

// 領域を占領
// パスの軌跡をそのままポリゴンの頂点として追加し、敵がいない側を占領
export function occupyTerritory(
  territory: Territory,
  path: readonly Point[],
  playArea: Polygon,
  enemyPos: Point,
  initialArea: number
): { newTerritory: Territory; newPlayArea: Polygon } {
  if (path.length < 2) {
    return { newTerritory: territory, newPlayArea: playArea }
  }

  // パスの始点と終点がポリゴンのどの辺上にあるか特定
  const startEdgePos = pointOnPolygonBoundary(path[0], playArea, BOUNDARY_TOLERANCE)
  const endEdgePos = pointOnPolygonBoundary(path[path.length - 1], playArea, BOUNDARY_TOLERANCE)

  if (!startEdgePos || !endEdgePos) {
    return { newTerritory: territory, newPlayArea: playArea }
  }

  // ポリゴンを2つに分割
  const { polygon1, polygon2 } = splitPolygonByPath(
    playArea,
    path,
    startEdgePos.edgeIndex,
    startEdgePos.t,
    endEdgePos.edgeIndex,
    endEdgePos.t
  )

  // 敵がいる方のポリゴンを新しいplayAreaとする
  const enemyInPolygon1 = pointInPolygon(enemyPos, polygon1)
  const newPlayArea = enemyInPolygon1 ? polygon1 : polygon2

  // 占領面積の更新
  const newAreaSize = calculatePolygonArea(newPlayArea)
  const oldAreaSize = calculatePolygonArea(playArea)
  const addedArea = oldAreaSize - newAreaSize

  const newOccupiedArea = territory.occupiedArea + addedArea
  const newPercentage = Math.round((newOccupiedArea / initialArea) * 100)

  return {
    newTerritory: {
      occupiedArea: newOccupiedArea,
      percentage: Math.min(newPercentage, 100),
    },
    newPlayArea,
  }
}

// ポリゴンをパスで2つに分割
function splitPolygonByPath(
  polygon: Polygon,
  path: readonly Point[],
  startEdgeIndex: number,
  startT: number,
  endEdgeIndex: number,
  endT: number
): { polygon1: Polygon; polygon2: Polygon } {
  const vertices = polygon.vertices
  const edges = getPolygonEdges(polygon)
  const n = vertices.length

  // 同一辺上の場合の処理
  if (startEdgeIndex === endEdgeIndex) {
    // ほぼ同じ位置の場合は分割しない
    if (Math.abs(startT - endT) < 0.05) {
      return { polygon1: polygon, polygon2: { vertices: [] } }
    }
    // 同一辺上で異なる位置の場合も分割しない（パスが短すぎる）
    return { polygon1: polygon, polygon2: { vertices: [] } }
  }

  // 始点と終点の正確な位置を計算
  const startPoint = getPointOnEdge(edges[startEdgeIndex], startT)
  const endPoint = getPointOnEdge(edges[endEdgeIndex], endT)

  // polygon1: startEdgeから時計回りにendEdgeまで + パスを逆順
  // polygon2: endEdgeから時計回りにstartEdgeまで + パスを順方向
  const polygon1Vertices: Point[] = []
  const polygon2Vertices: Point[] = []

  // パスの始点を追加
  polygon1Vertices.push(startPoint)
  polygon2Vertices.push(endPoint)

  // polygon1: startEdgeの次の頂点からendEdgeまでを追加
  // ループ回数を明示的に制限して無限ループを防止
  let idx = (startEdgeIndex + 1) % n
  let loopCount = 0
  const targetIdx1 = (endEdgeIndex + 1) % n
  while (idx !== targetIdx1 && loopCount < n) {
    polygon1Vertices.push(vertices[idx])
    idx = (idx + 1) % n
    loopCount++
  }

  // polygon1: パスの終点を追加
  polygon1Vertices.push(endPoint)

  // polygon1: パスを逆順で追加（始点と終点は既に追加済み）
  for (let i = path.length - 2; i >= 1; i--) {
    polygon1Vertices.push(path[i])
  }

  // polygon2: endEdgeの次の頂点からstartEdgeまでを追加
  idx = (endEdgeIndex + 1) % n
  loopCount = 0
  const targetIdx2 = (startEdgeIndex + 1) % n
  while (idx !== targetIdx2 && loopCount < n) {
    polygon2Vertices.push(vertices[idx])
    idx = (idx + 1) % n
    loopCount++
  }

  // polygon2: パスの始点を追加
  polygon2Vertices.push(startPoint)

  // polygon2: パスを順方向で追加（始点と終点は既に追加済み）
  for (let i = 1; i < path.length - 1; i++) {
    polygon2Vertices.push(path[i])
  }

  return {
    polygon1: { vertices: polygon1Vertices },
    polygon2: { vertices: polygon2Vertices },
  }
}

// 占領率を計算
export function calculatePercentage(occupiedArea: number, totalArea: number): number {
  if (totalArea === 0) return 0
  return Math.round((occupiedArea / totalArea) * 100)
}
