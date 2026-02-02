import { type ReactNode, useState, useEffect, useRef } from 'react'
import { RACE_CONSTANTS } from '../../../lib/games/race/constants'

interface RaceTrackProps {
  speed: number
  children: ReactNode
}

function RaceTrack({ speed, children }: RaceTrackProps) {
  const [backgroundY, setBackgroundY] = useState(0)
  const lastTimeRef = useRef<number>(0)
  const frameRef = useRef<number | null>(null)
  const speedRef = useRef(speed)

  // speedの最新値をrefに保持
  speedRef.current = speed

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp
      }

      const deltaTime = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      const currentSpeed = speedRef.current
      if (currentSpeed > 0) {
        // 速度に比例してスクロール（速度 * 係数 * 時間）
        const scrollSpeed = currentSpeed * 0.05 // ピクセル/ms の係数
        const movement = scrollSpeed * deltaTime
        setBackgroundY(prev => (prev + movement) % 400)
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
  }, [])

  return (
    <div
      className="relative overflow-hidden bg-gray-700"
      style={{
        width: RACE_CONSTANTS.TRACK_WIDTH,
        height: RACE_CONSTANTS.TRACK_HEIGHT,
      }}
    >
      {/* 道路の背景（JSでスクロール制御） */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 160px,
            rgba(255,255,255,0.3) 160px,
            rgba(255,255,255,0.3) 240px
          )`,
          backgroundSize: '100% 400px',
          backgroundPositionY: `${backgroundY}px`,
        }}
      />

      {/* 中央線（車線の区切り） */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-yellow-400 pointer-events-none"
        style={{
          left: RACE_CONSTANTS.TRACK_WIDTH / 2 - 2,
        }}
      />

      {/* 左端の白線 */}
      <div className="absolute top-0 bottom-0 left-1 w-1 bg-white pointer-events-none" />

      {/* 右端の白線 */}
      <div className="absolute top-0 bottom-0 right-1 w-1 bg-white pointer-events-none" />

      {/* 車線ラベル */}
      <div className="absolute top-2 left-0 w-1/2 text-center text-xs text-white opacity-50 pointer-events-none">
        通常
      </div>
      <div className="absolute top-2 right-0 w-1/2 text-center text-xs text-white opacity-50 pointer-events-none">
        追越
      </div>

      {/* 子要素（プレイヤー、障害物など） */}
      {children}
    </div>
  )
}

export default RaceTrack
