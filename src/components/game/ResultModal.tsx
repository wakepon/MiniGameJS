import { useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GameResult } from '../../lib/games/types'

interface ResultModalProps {
  isOpen: boolean
  result: GameResult | null
  onRetry: () => void
}

function ResultModal({ isOpen, result, onRetry }: ResultModalProps) {
  const navigate = useNavigate()
  const retryButtonRef = useRef<HTMLButtonElement>(null)

  const handleGoHome = useCallback(() => {
    navigate('/')
  }, [navigate])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleGoHome()
    }
  }, [handleGoHome])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      retryButtonRef.current?.focus()
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen || !result) {
    return null
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleGoHome}
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-title"
    >
      <div
        className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="result-title" className="text-2xl font-bold text-center text-gray-800 mb-4">
          結果発表
        </h2>
        <p className="text-4xl font-bold text-center text-blue-600 mb-2">
          {result.score}
        </p>
        {result.message && (
          <p className="text-center text-gray-600 mb-6">{result.message}</p>
        )}
        <div className="flex flex-col gap-3 mt-6">
          <button
            ref={retryButtonRef}
            onClick={onRetry}
            className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white
                       font-bold rounded-lg transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       active:bg-blue-700"
          >
            もう一回
          </button>
          <button
            onClick={handleGoHome}
            className="w-full py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-800
                       font-bold rounded-lg transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                       active:bg-gray-400"
          >
            タイトルに戻る
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultModal
