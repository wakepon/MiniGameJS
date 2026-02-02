import type { Game3State, Point, Polygon } from './types'
import { GAME_CONSTANTS } from './constants'

const { COLORS } = GAME_CONSTANTS

// メイン描画関数
export function renderGame(ctx: CanvasRenderingContext2D, state: Game3State): void {
  const { canvasSize, playArea, player, enemy, territory } = state

  // 背景をクリア
  ctx.fillStyle = COLORS.BACKGROUND
  ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

  // 占領済み領域の表示（ポリゴン外側を塗る）
  renderOccupiedArea(ctx, canvasSize, playArea)

  // プレイエリア（ポリゴン）
  renderPlayArea(ctx, playArea)

  // プレイヤーのパス（道）
  if (player.path.length > 0) {
    renderPath(ctx, player.path)
  }

  // プレイヤー
  renderPlayer(ctx, player.position)

  // 敵
  renderEnemy(ctx, enemy.position)

  // スコア（占領率）
  renderScore(ctx, territory.percentage, canvasSize)

  // ゲームオーバー表示
  if (state.status === 'gameover') {
    renderGameOver(ctx, canvasSize)
  }
}

// 占領済み領域（playArea以外の部分）を描画
function renderOccupiedArea(
  ctx: CanvasRenderingContext2D,
  canvasSize: { width: number; height: number },
  playArea: Polygon
): void {
  // 全体を占領色で塗る
  ctx.fillStyle = COLORS.OCCUPIED
  ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

  // playAreaをくり抜く（背景色で塗り直す）
  ctx.fillStyle = COLORS.BACKGROUND
  drawPolygonPath(ctx, playArea)
  ctx.fill()
}

// プレイエリアを描画（ポリゴン）
function renderPlayArea(ctx: CanvasRenderingContext2D, playArea: Polygon): void {
  ctx.fillStyle = COLORS.PLAY_AREA
  drawPolygonPath(ctx, playArea)
  ctx.fill()

  // 境界線
  ctx.strokeStyle = COLORS.BOUNDARY
  ctx.lineWidth = 2
  drawPolygonPath(ctx, playArea)
  ctx.stroke()
}

// ポリゴンのパスを描画
function drawPolygonPath(ctx: CanvasRenderingContext2D, polygon: Polygon): void {
  const v = polygon.vertices
  if (v.length === 0) return

  ctx.beginPath()
  ctx.moveTo(v[0].x, v[0].y)
  for (let i = 1; i < v.length; i++) {
    ctx.lineTo(v[i].x, v[i].y)
  }
  ctx.closePath()
}

// パス（道）を描画
function renderPath(ctx: CanvasRenderingContext2D, path: readonly Point[]): void {
  if (path.length < 2) return

  ctx.strokeStyle = COLORS.PATH
  ctx.lineWidth = GAME_CONSTANTS.PATH_WIDTH
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  ctx.moveTo(path[0].x, path[0].y)

  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y)
  }

  ctx.stroke()
}

// プレイヤーを描画
function renderPlayer(ctx: CanvasRenderingContext2D, position: Point): void {
  ctx.fillStyle = COLORS.PLAYER
  ctx.beginPath()
  ctx.arc(position.x, position.y, GAME_CONSTANTS.PLAYER_RADIUS, 0, Math.PI * 2)
  ctx.fill()

  // 光彩エフェクト
  ctx.shadowColor = COLORS.PLAYER
  ctx.shadowBlur = 10
  ctx.fill()
  ctx.shadowBlur = 0
}

// 敵を描画
function renderEnemy(ctx: CanvasRenderingContext2D, position: Point): void {
  ctx.fillStyle = COLORS.ENEMY
  ctx.beginPath()
  ctx.arc(position.x, position.y, GAME_CONSTANTS.ENEMY_RADIUS, 0, Math.PI * 2)
  ctx.fill()

  // 光彩エフェクト
  ctx.shadowColor = COLORS.ENEMY
  ctx.shadowBlur = 15
  ctx.fill()
  ctx.shadowBlur = 0
}

// スコアを描画
function renderScore(
  ctx: CanvasRenderingContext2D,
  percentage: number,
  canvasSize: { width: number; height: number }
): void {
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`占領率: ${percentage}%`, canvasSize.width / 2, 15)
}

// ゲームオーバー表示
function renderGameOver(
  ctx: CanvasRenderingContext2D,
  canvasSize: { width: number; height: number }
): void {
  // 半透明オーバーレイ
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

  // テキスト
  ctx.fillStyle = '#ff4444'
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('GAME OVER', canvasSize.width / 2, canvasSize.height / 2)
}
