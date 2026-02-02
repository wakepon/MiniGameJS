import type { Point, Line, Rectangle, Direction, Polygon, Edge, EdgePosition } from './types'

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

// ============================================================
// ポリゴン用関数
// ============================================================

// ポリゴンの辺リストを取得
export function getPolygonEdges(polygon: Polygon): Edge[] {
  const edges: Edge[] = []
  const v = polygon.vertices
  for (let i = 0; i < v.length; i++) {
    edges.push({
      start: v[i],
      end: v[(i + 1) % v.length],
      index: i,
    })
  }
  return edges
}

// 辺上の位置（t: 0〜1）から座標を取得
export function getPointOnEdge(edge: Edge, t: number): Point {
  return {
    x: edge.start.x + (edge.end.x - edge.start.x) * t,
    y: edge.start.y + (edge.end.y - edge.start.y) * t,
  }
}

// 辺の長さを取得
export function getEdgeLength(edge: Edge): number {
  return distance(edge.start, edge.end)
}

// 点がポリゴン内にあるかチェック（レイキャスティング法）
export function pointInPolygon(point: Point, polygon: Polygon): boolean {
  const vertices = polygon.vertices

  // 有効なポリゴンでない場合はfalse
  if (vertices.length < 3) {
    return false
  }

  let inside = false

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x, yi = vertices[i].y
    const xj = vertices[j].x, yj = vertices[j].y

    if (((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  return inside
}

// ポリゴンの面積を計算（シューレースの公式）
export function calculatePolygonArea(polygon: Polygon): number {
  const v = polygon.vertices

  // 有効なポリゴンでない場合は0
  if (v.length < 3) {
    return 0
  }

  let area = 0
  for (let i = 0; i < v.length; i++) {
    const j = (i + 1) % v.length
    area += v[i].x * v[j].y
    area -= v[j].x * v[i].y
  }
  return Math.abs(area) / 2
}

// ポリゴンの重心を計算
export function calculatePolygonCentroid(polygon: Polygon): Point {
  const v = polygon.vertices
  let cx = 0, cy = 0
  for (const vertex of v) {
    cx += vertex.x
    cy += vertex.y
  }
  return { x: cx / v.length, y: cy / v.length }
}

// 点からポリゴンの辺上で最も近い位置を取得
export function getNearestEdgePosition(point: Point, polygon: Polygon): EdgePosition {
  const edges = getPolygonEdges(polygon)
  let nearestEdgeIndex = 0
  let nearestT = 0
  let minDist = Infinity

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i]
    const dx = edge.end.x - edge.start.x
    const dy = edge.end.y - edge.start.y
    const lengthSq = dx * dx + dy * dy

    if (lengthSq === 0) continue

    let t = ((point.x - edge.start.x) * dx + (point.y - edge.start.y) * dy) / lengthSq
    t = Math.max(0, Math.min(1, t))

    const closest: Point = {
      x: edge.start.x + t * dx,
      y: edge.start.y + t * dy,
    }
    const dist = distance(point, closest)

    if (dist < minDist) {
      minDist = dist
      nearestEdgeIndex = i
      nearestT = t
    }
  }

  return { edgeIndex: nearestEdgeIndex, t: nearestT }
}

// 点がポリゴンの辺上にあるかチェック
export function pointOnPolygonBoundary(
  point: Point,
  polygon: Polygon,
  tolerance: number = 3
): EdgePosition | null {
  const edges = getPolygonEdges(polygon)

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i]
    const dist = pointToLineDistance(point, { start: edge.start, end: edge.end })

    if (dist <= tolerance) {
      // 辺上のパラメータtを計算
      const dx = edge.end.x - edge.start.x
      const dy = edge.end.y - edge.start.y
      const lengthSq = dx * dx + dy * dy

      if (lengthSq === 0) continue

      let t = ((point.x - edge.start.x) * dx + (point.y - edge.start.y) * dy) / lengthSq
      t = Math.max(0, Math.min(1, t))

      return { edgeIndex: i, t }
    }
  }

  return null
}

// 線分同士の交点を計算
export function lineSegmentIntersection(
  line1: Line,
  line2: Line
): { point: Point; t1: number; t2: number } | null {
  const x1 = line1.start.x, y1 = line1.start.y
  const x2 = line1.end.x, y2 = line1.end.y
  const x3 = line2.start.x, y3 = line2.start.y
  const x4 = line2.end.x, y4 = line2.end.y

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)

  // より安全な閾値で平行判定
  if (Math.abs(denom) < 1e-6) {
    return null // 平行
  }

  const t1 = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
  const t2 = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom

  if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
    return {
      point: {
        x: x1 + t1 * (x2 - x1),
        y: y1 + t1 * (y2 - y1),
      },
      t1,
      t2,
    }
  }

  return null
}

// 速度ベクトルを辺で反射
export function reflectVelocity(velocity: Point, edge: Edge): Point {
  // 辺の方向ベクトル
  const dx = edge.end.x - edge.start.x
  const dy = edge.end.y - edge.start.y
  const length = Math.sqrt(dx * dx + dy * dy)

  if (length === 0) return velocity

  // 辺の法線ベクトル（内向き）
  const nx = dy / length
  const ny = -dx / length

  // 反射計算: v' = v - 2(v·n)n
  const dot = velocity.x * nx + velocity.y * ny
  return {
    x: velocity.x - 2 * dot * nx,
    y: velocity.y - 2 * dot * ny,
  }
}

// ベクトルを4方向に量子化
export function quantizeToFourDirections(vector: Point): Direction {
  const angle = Math.atan2(vector.y, vector.x)

  // 角度を4方向に分類
  if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
    return 'right'
  } else if (angle >= Math.PI / 4 && angle < 3 * Math.PI / 4) {
    return 'down'
  } else if (angle >= -3 * Math.PI / 4 && angle < -Math.PI / 4) {
    return 'up'
  } else {
    return 'left'
  }
}

// 辺からポリゴン内部への方向を取得
export function getInwardNormal(edge: Edge, polygon: Polygon): Point {
  // 辺の中点
  const midX = (edge.start.x + edge.end.x) / 2
  const midY = (edge.start.y + edge.end.y) / 2

  // 辺の法線（2つの候補）
  const dx = edge.end.x - edge.start.x
  const dy = edge.end.y - edge.start.y
  const length = Math.sqrt(dx * dx + dy * dy)

  if (length === 0) return { x: 0, y: -1 }

  const n1 = { x: dy / length, y: -dx / length }
  const n2 = { x: -dy / length, y: dx / length }

  // どちらがポリゴン内部を向いているかチェック
  const testPoint1 = { x: midX + n1.x * 5, y: midY + n1.y * 5 }

  if (pointInPolygon(testPoint1, polygon)) {
    return n1
  }
  return n2
}

// ポリゴン内に点をクランプ
export function clampPointToPolygon(point: Point, polygon: Polygon): Point {
  if (pointInPolygon(point, polygon)) {
    return point
  }

  // ポリゴン外の場合、最も近い辺上の点を返す
  const edgePos = getNearestEdgePosition(point, polygon)
  const edges = getPolygonEdges(polygon)
  const edge = edges[edgePos.edgeIndex]
  return getPointOnEdge(edge, edgePos.t)
}
