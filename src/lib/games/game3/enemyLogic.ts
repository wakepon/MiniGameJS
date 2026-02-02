import type { EnemyState, Polygon, Point, Line } from './types'
import { GAME_CONSTANTS } from './constants'
import {
  lineIntersectsCircle,
  pointInPolygon,
  getPolygonEdges,
  lineSegmentIntersection,
  reflectVelocity,
  calculatePolygonCentroid,
} from './geometry'

// 初期敵状態を作成（ポリゴン重心からランダムな方向）
export function createInitialEnemy(playArea: Polygon): EnemyState {
  const centroid = calculatePolygonCentroid(playArea)

  // ランダムな角度で初期速度を決定
  const angle = Math.random() * Math.PI * 2
  const speed = GAME_CONSTANTS.ENEMY_SPEED

  return {
    position: centroid,
    velocity: {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    },
  }
}

// 敵の移動（ポリゴン辺での反射対応）
export function moveEnemy(
  enemy: EnemyState,
  playArea: Polygon,
  deltaTime: number
): EnemyState {
  const newPosition: Point = {
    x: enemy.position.x + enemy.velocity.x * deltaTime,
    y: enemy.position.y + enemy.velocity.y * deltaTime,
  }

  // ポリゴン内にいるかチェック
  if (pointInPolygon(newPosition, playArea)) {
    return { ...enemy, position: newPosition }
  }

  // ポリゴン外に出た場合、辺との交差を検出して反射
  const edges = getPolygonEdges(playArea)
  const moveLine: Line = { start: enemy.position, end: newPosition }

  let closestIntersection: { point: Point; edge: typeof edges[0]; t1: number } | null = null
  let minT1 = Infinity

  for (const edge of edges) {
    const edgeLine: Line = { start: edge.start, end: edge.end }
    const intersection = lineSegmentIntersection(moveLine, edgeLine)

    if (intersection && intersection.t1 < minT1 && intersection.t1 > 0.001) {
      minT1 = intersection.t1
      closestIntersection = { point: intersection.point, edge, t1: intersection.t1 }
    }
  }

  if (closestIntersection) {
    // 辺の法線で反射
    const newVelocity = reflectVelocity(enemy.velocity, closestIntersection.edge)

    // 反射後の位置を計算（少し内側に戻す）
    const remainingTime = (1 - closestIntersection.t1) * deltaTime
    const reflected: Point = {
      x: closestIntersection.point.x + newVelocity.x * remainingTime * 0.5,
      y: closestIntersection.point.y + newVelocity.y * remainingTime * 0.5,
    }

    // 反射後もポリゴン外の場合は交点に留まる
    const finalPosition = pointInPolygon(reflected, playArea)
      ? reflected
      : closestIntersection.point

    return { position: finalPosition, velocity: newVelocity }
  }

  // 交差が見つからない場合は元の位置に戻す
  return enemy
}

// 敵と経路（道）の衝突判定
export function checkCollisionWithPath(
  enemy: EnemyState,
  path: readonly Point[]
): boolean {
  if (path.length < 2) {
    return false
  }

  const radius = GAME_CONSTANTS.ENEMY_RADIUS + GAME_CONSTANTS.PATH_WIDTH

  // パスの各線分と敵の衝突をチェック
  for (let i = 0; i < path.length - 1; i++) {
    const line: Line = {
      start: path[i],
      end: path[i + 1],
    }

    if (lineIntersectsCircle(line, enemy.position, radius)) {
      return true
    }
  }

  return false
}
