import type { Point, Line, Rectangle, Direction } from './types'

// 2点間の距離
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

// 点が矩形内にあるかチェック
export function pointInRect(point: Point, rect: Rectangle): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
}

// 点が矩形の辺上にあるかチェック（許容誤差あり）
export function pointOnBoundary(point: Point, rect: Rectangle, tolerance: number = 2): boolean {
  const onLeftEdge = Math.abs(point.x - rect.x) <= tolerance &&
    point.y >= rect.y - tolerance && point.y <= rect.y + rect.height + tolerance
  const onRightEdge = Math.abs(point.x - (rect.x + rect.width)) <= tolerance &&
    point.y >= rect.y - tolerance && point.y <= rect.y + rect.height + tolerance
  const onTopEdge = Math.abs(point.y - rect.y) <= tolerance &&
    point.x >= rect.x - tolerance && point.x <= rect.x + rect.width + tolerance
  const onBottomEdge = Math.abs(point.y - (rect.y + rect.height)) <= tolerance &&
    point.x >= rect.x - tolerance && point.x <= rect.x + rect.width + tolerance

  return onLeftEdge || onRightEdge || onTopEdge || onBottomEdge
}

// 点が矩形のどの辺上にあるか判定
export function getEdge(point: Point, rect: Rectangle, tolerance: number = 2): 'top' | 'right' | 'bottom' | 'left' | null {
  if (Math.abs(point.y - rect.y) <= tolerance &&
      point.x >= rect.x - tolerance && point.x <= rect.x + rect.width + tolerance) {
    return 'top'
  }
  if (Math.abs(point.y - (rect.y + rect.height)) <= tolerance &&
      point.x >= rect.x - tolerance && point.x <= rect.x + rect.width + tolerance) {
    return 'bottom'
  }
  if (Math.abs(point.x - rect.x) <= tolerance &&
      point.y >= rect.y - tolerance && point.y <= rect.y + rect.height + tolerance) {
    return 'left'
  }
  if (Math.abs(point.x - (rect.x + rect.width)) <= tolerance &&
      point.y >= rect.y - tolerance && point.y <= rect.y + rect.height + tolerance) {
    return 'right'
  }
  return null
}

// 方向を時計回りに90度回転
export function rotateDirectionClockwise(dir: Direction): Direction {
  const rotations: Record<Direction, Direction> = {
    up: 'right',
    right: 'down',
    down: 'left',
    left: 'up',
  }
  return rotations[dir]
}

// 方向をベクトルに変換
export function directionToVector(dir: Direction): Point {
  const vectors: Record<Direction, Point> = {
    up: { x: 0, y: -1 },
    right: { x: 1, y: 0 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
  }
  return vectors[dir]
}

// 辺に対応する外周移動方向を取得（時計回り）
export function getDirectionForEdge(edge: 'top' | 'right' | 'bottom' | 'left'): Direction {
  const directions: Record<string, Direction> = {
    top: 'right',
    right: 'down',
    bottom: 'left',
    left: 'up',
  }
  return directions[edge]
}

// 線分と円の衝突判定
export function lineIntersectsCircle(line: Line, center: Point, radius: number): boolean {
  const dx = line.end.x - line.start.x
  const dy = line.end.y - line.start.y
  const fx = line.start.x - center.x
  const fy = line.start.y - center.y

  const a = dx * dx + dy * dy
  const b = 2 * (fx * dx + fy * dy)
  const c = fx * fx + fy * fy - radius * radius

  let discriminant = b * b - 4 * a * c
  if (discriminant < 0) {
    return false
  }

  discriminant = Math.sqrt(discriminant)
  const t1 = (-b - discriminant) / (2 * a)
  const t2 = (-b + discriminant) / (2 * a)

  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)
}

// 点から線分への最短距離
export function pointToLineDistance(point: Point, line: Line): number {
  const dx = line.end.x - line.start.x
  const dy = line.end.y - line.start.y
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared === 0) {
    return distance(point, line.start)
  }

  let t = ((point.x - line.start.x) * dx + (point.y - line.start.y) * dy) / lengthSquared
  t = Math.max(0, Math.min(1, t))

  const projection: Point = {
    x: line.start.x + t * dx,
    y: line.start.y + t * dy,
  }

  return distance(point, projection)
}

// 点を矩形内にクランプ
export function clampPointToRect(point: Point, rect: Rectangle): Point {
  return {
    x: Math.max(rect.x, Math.min(rect.x + rect.width, point.x)),
    y: Math.max(rect.y, Math.min(rect.y + rect.height, point.y)),
  }
}

// 矩形の面積を計算
export function calculateRectArea(rect: Rectangle): number {
  return rect.width * rect.height
}
