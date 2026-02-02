import { useCallback, useRef, useEffect } from 'react'

interface ShootingButtonProps {
  onPressStart: () => void
  onPressEnd: () => void
  disabled: boolean
  isCharging: boolean
}

function ShootingButton({
  onPressStart,
  onPressEnd,
  disabled,
  isCharging,
}: ShootingButtonProps) {
  const isPressedRef = useRef(false)

  const handlePressStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      if (disabled || isPressedRef.current) return
      isPressedRef.current = true
      onPressStart()
    },
    [disabled, onPressStart]
  )

  const handlePressEnd = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      if (!isPressedRef.current) return
      isPressedRef.current = false
      onPressEnd()
    },
    [onPressEnd]
  )

  // コンポーネントがdisabledになったらリリースイベントを発火
  useEffect(() => {
    if (disabled && isPressedRef.current) {
      isPressedRef.current = false
      onPressEnd()
    }
  }, [disabled, onPressEnd])

  // ウィンドウ外でマウスを離した場合の対応
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isPressedRef.current) {
        isPressedRef.current = false
        onPressEnd()
      }
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)
    window.addEventListener('touchend', handleGlobalMouseUp)
    window.addEventListener('touchcancel', handleGlobalMouseUp)

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      window.removeEventListener('touchend', handleGlobalMouseUp)
      window.removeEventListener('touchcancel', handleGlobalMouseUp)
    }
  }, [onPressEnd])

  return (
    <button
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
      disabled={disabled}
      className={`
        w-full py-6 px-8 text-xl font-bold rounded-lg
        transition-all duration-100 min-h-[72px]
        focus:outline-none focus:ring-2 focus:ring-offset-2
        select-none touch-none
        ${
          disabled
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : isCharging
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white scale-95 shadow-inner focus:ring-orange-500'
              : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg active:scale-95 focus:ring-blue-500'
        }
      `}
      aria-label={isCharging ? '離すと発射' : '長押しで溜め撃ち'}
    >
      {isCharging ? '離すと発射！' : '長押しで溜め撃ち'}
    </button>
  )
}

export default ShootingButton
