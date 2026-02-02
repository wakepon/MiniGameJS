import { useEffect, useCallback, type RefObject } from 'react'
import type { Lane } from '../lib/games/race/types'

interface UseRaceInputOptions {
  containerRef: RefObject<HTMLElement | null>
  onLaneChange: (lane: Lane) => void
  enabled: boolean
}

export function useRaceInput({
  containerRef,
  onLaneChange,
  enabled,
}: UseRaceInputOptions): void {
  const handlePressStart = useCallback(() => {
    if (enabled) {
      onLaneChange('overtaking')
    }
  }, [onLaneChange, enabled])

  const handlePressEnd = useCallback(() => {
    if (enabled) {
      onLaneChange('normal')
    }
  }, [onLaneChange, enabled])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !enabled) return

    // マウスイベント
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      handlePressStart()
    }

    const handleMouseUp = () => {
      handlePressEnd()
    }

    // タッチイベント（スマホ対応）
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      handlePressStart()
    }

    const handleTouchEnd = () => {
      handlePressEnd()
    }

    // キーボードイベント（スペースキー）
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        handlePressStart()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        handlePressEnd()
      }
    }

    // イベントリスナー登録
    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('mouseleave', handlePressEnd)
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)
    container.addEventListener('touchcancel', handleTouchEnd)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('mouseleave', handlePressEnd)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('touchcancel', handleTouchEnd)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [containerRef, enabled, handlePressStart, handlePressEnd])
}
