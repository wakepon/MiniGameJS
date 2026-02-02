import type { Territory, Rectangle, Point } from './types'
import { calculateRectArea } from './geometry'

// 初期領域状態を作成
export function createInitialTerritory(): Territory {
  return {
    occupiedArea: 0,
    percentage: 0,
  }
}

// 領域を占領
// パスで区切られた領域のうち、敵がいない側を占領する
export function occupyTerritory(
  territory: Territory,
  path: readonly Point[],
  playArea: Rectangle,
  enemyPos: Point,
  initialArea: number
): { newTerritory: Territory; newPlayArea: Rectangle } {
  if (path.length < 2) {
    return { newTerritory: territory, newPlayArea: playArea }
  }

  // パスの始点と終点を取得
  const startPoint = path[0]
  const endPoint = path[path.length - 1]

  // パスが縦か横かを判定（主要な移動方向）
  const isVerticalCut = isVerticalPath(path)

  let occupiedRect: Rectangle
  let newPlayArea: Rectangle

  if (isVerticalCut) {
    // 縦切り: 左右どちらを占領するか
    const cutX = (startPoint.x + endPoint.x) / 2
    const enemyOnRight = enemyPos.x > cutX

    if (enemyOnRight) {
      // 敵が右側にいる → 左側を占領
      occupiedRect = {
        x: playArea.x,
        y: playArea.y,
        width: cutX - playArea.x,
        height: playArea.height,
      }
      newPlayArea = {
        x: cutX,
        y: playArea.y,
        width: playArea.x + playArea.width - cutX,
        height: playArea.height,
      }
    } else {
      // 敵が左側にいる → 右側を占領
      occupiedRect = {
        x: cutX,
        y: playArea.y,
        width: playArea.x + playArea.width - cutX,
        height: playArea.height,
      }
      newPlayArea = {
        x: playArea.x,
        y: playArea.y,
        width: cutX - playArea.x,
        height: playArea.height,
      }
    }
  } else {
    // 横切り: 上下どちらを占領するか
    const cutY = (startPoint.y + endPoint.y) / 2
    const enemyBelow = enemyPos.y > cutY

    if (enemyBelow) {
      // 敵が下側にいる → 上側を占領
      occupiedRect = {
        x: playArea.x,
        y: playArea.y,
        width: playArea.width,
        height: cutY - playArea.y,
      }
      newPlayArea = {
        x: playArea.x,
        y: cutY,
        width: playArea.width,
        height: playArea.y + playArea.height - cutY,
      }
    } else {
      // 敵が上側にいる → 下側を占領
      occupiedRect = {
        x: playArea.x,
        y: cutY,
        width: playArea.width,
        height: playArea.y + playArea.height - cutY,
      }
      newPlayArea = {
        x: playArea.x,
        y: playArea.y,
        width: playArea.width,
        height: cutY - playArea.y,
      }
    }
  }

  // 新しい占領面積を計算
  const addedArea = calculateRectArea(occupiedRect)
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

// パスが主に縦方向か横方向かを判定
function isVerticalPath(path: readonly Point[]): boolean {
  if (path.length < 2) return true

  let totalDx = 0
  let totalDy = 0

  for (let i = 1; i < path.length; i++) {
    totalDx += Math.abs(path[i].x - path[i - 1].x)
    totalDy += Math.abs(path[i].y - path[i - 1].y)
  }

  // 縦移動が多ければ縦切り
  return totalDy > totalDx
}

// 占領率を計算
export function calculatePercentage(occupiedArea: number, totalArea: number): number {
  if (totalArea === 0) return 0
  return Math.round((occupiedArea / totalArea) * 100)
}
