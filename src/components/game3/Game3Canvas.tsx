import { useEffect, useCallback, useRef } from 'react'
import { GAME_CONSTANTS } from '../../lib/games/game3/constants'

interface Game3CanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
  onInput: () => void
  onResize: (width: number, height: number) => void
  isPlaying: boolean
}

function Game3Canvas({ canvasRef, onInput, onResize, isPlaying }: Game3CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // クリック/タップハンドラ
  const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (isPlaying) {
      onInput()
    }
  }, [isPlaying, onInput])

  // リサイズハンドラ
  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current
      if (!container) return

      const containerWidth = container.clientWidth
      const size = Math.min(containerWidth, GAME_CONSTANTS.MAX_CANVAS_WIDTH)

      onResize(size, size)
    }

    updateSize()
    window.addEventListener('resize', updateSize)

    return () => {
      window.removeEventListener('resize', updateSize)
    }
  }, [onResize])

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center touch-none"
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <canvas
        ref={canvasRef}
        width={GAME_CONSTANTS.MAX_CANVAS_WIDTH}
        height={GAME_CONSTANTS.MAX_CANVAS_WIDTH}
        className="rounded-lg cursor-pointer"
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </div>
  )
}

export default Game3Canvas
