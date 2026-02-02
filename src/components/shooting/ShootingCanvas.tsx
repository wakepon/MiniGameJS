import { useRef, useEffect } from 'react'
import type { ShootingGameState } from '../../lib/games/shooting'
import { GAME_CONSTANTS, getPlayerHitboxRadius } from '../../lib/games/shooting'

interface ShootingCanvasProps {
  gameState: ShootingGameState
}

function ShootingCanvas({ gameState }: ShootingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 背景（グラデーション）
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#1a1a2e')
    gradient.addColorStop(1, '#16213e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // ゲームオーバーライン（参考線）
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.3)'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(0, GAME_CONSTANTS.GAME_OVER_LINE)
    ctx.lineTo(canvas.width, GAME_CONSTANTS.GAME_OVER_LINE)
    ctx.stroke()
    ctx.setLineDash([])

    // 敵を描画
    ctx.fillStyle = '#ff6b6b'
    for (const enemy of gameState.enemies) {
      ctx.beginPath()
      ctx.arc(
        enemy.position.x,
        enemy.position.y,
        GAME_CONSTANTS.ENEMY_SIZE / 2,
        0,
        Math.PI * 2
      )
      ctx.fill()

      // 敵の目（アクセント）
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(enemy.position.x - 5, enemy.position.y - 3, 3, 0, Math.PI * 2)
      ctx.arc(enemy.position.x + 5, enemy.position.y - 3, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ff6b6b'
    }

    // 弾を描画
    for (const bullet of gameState.bullets) {
      // 弾の光彩（貫通弾は金色、通常弾は水色）
      const bulletGradient = ctx.createRadialGradient(
        bullet.position.x,
        bullet.position.y,
        0,
        bullet.position.x,
        bullet.position.y,
        bullet.size
      )

      if (bullet.isPiercing) {
        // 貫通弾は金色
        bulletGradient.addColorStop(0, '#fff')
        bulletGradient.addColorStop(0.3, '#ffd700')
        bulletGradient.addColorStop(1, 'rgba(255, 215, 0, 0)')
      } else {
        // 通常弾は水色
        bulletGradient.addColorStop(0, '#fff')
        bulletGradient.addColorStop(0.3, '#4ecdc4')
        bulletGradient.addColorStop(1, 'rgba(78, 205, 196, 0)')
      }

      ctx.fillStyle = bulletGradient
      ctx.beginPath()
      ctx.arc(
        bullet.position.x,
        bullet.position.y,
        bullet.size,
        0,
        Math.PI * 2
      )
      ctx.fill()

      // 弾のコア
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(
        bullet.position.x,
        bullet.position.y,
        bullet.size / 3,
        0,
        Math.PI * 2
      )
      ctx.fill()

      // 貫通弾には外枠を追加
      if (bullet.isPiercing) {
        ctx.strokeStyle = '#ffd700'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(
          bullet.position.x,
          bullet.position.y,
          bullet.size * 0.7,
          0,
          Math.PI * 2
        )
        ctx.stroke()
      }
    }

    const { player } = gameState

    // 自機の当たり判定範囲を描画（溜め中は可視化）
    if (player.isCharging) {
      const hitboxRadius = getPlayerHitboxRadius(player)
      ctx.strokeStyle = `rgba(255, 200, 100, ${0.3 + player.chargeLevel * 0.4})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(
        player.position.x,
        player.position.y,
        hitboxRadius,
        0,
        Math.PI * 2
      )
      ctx.stroke()

      // 溜め中のエフェクト（パルス）
      ctx.fillStyle = `rgba(255, 200, 100, ${0.1 + player.chargeLevel * 0.2})`
      ctx.beginPath()
      ctx.arc(
        player.position.x,
        player.position.y,
        hitboxRadius,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }

    // 自機を描画
    const playerGradient = ctx.createRadialGradient(
      player.position.x,
      player.position.y - 5,
      0,
      player.position.x,
      player.position.y,
      GAME_CONSTANTS.PLAYER_WIDTH / 2
    )

    if (player.isCharging) {
      // 溜め中は光る
      playerGradient.addColorStop(0, '#fff')
      playerGradient.addColorStop(0.5, '#ffd93d')
      playerGradient.addColorStop(1, '#ff8c00')
    } else {
      playerGradient.addColorStop(0, '#6bcb77')
      playerGradient.addColorStop(1, '#2d6a4f')
    }

    ctx.fillStyle = playerGradient
    ctx.beginPath()

    // 三角形の自機
    const px = player.position.x
    const py = player.position.y
    const size = GAME_CONSTANTS.PLAYER_WIDTH / 2
    ctx.moveTo(px, py - size)
    ctx.lineTo(px - size, py + size * 0.6)
    ctx.lineTo(px + size, py + size * 0.6)
    ctx.closePath()
    ctx.fill()

    // 自機の光彩
    ctx.strokeStyle = player.isCharging ? '#ffd93d' : '#6bcb77'
    ctx.lineWidth = 2
    ctx.stroke()

    // ゲームオーバー時のオーバーレイ
    if (gameState.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#ff6b6b'
      ctx.font = 'bold 32px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20)

      ctx.fillStyle = '#fff'
      ctx.font = '20px sans-serif'
      ctx.fillText(
        `スコア: ${gameState.score}`,
        canvas.width / 2,
        canvas.height / 2 + 20
      )
    }
  }, [gameState])

  return (
    <canvas
      ref={canvasRef}
      width={GAME_CONSTANTS.CANVAS_WIDTH}
      height={GAME_CONSTANTS.CANVAS_HEIGHT}
      className="max-w-full h-auto border-2 border-gray-700 rounded-lg"
      style={{ touchAction: 'none' }}
    />
  )
}

export default ShootingCanvas
