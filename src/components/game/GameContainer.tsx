import type { ReactNode } from 'react'

interface GameContainerProps {
  title: string
  children: ReactNode
  controls: ReactNode
}

function GameContainer({ title, children, controls }: GameContainerProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 min-h-[200px] flex items-center justify-center">
        {children}
      </div>
      <div className="w-full max-w-md">
        {controls}
      </div>
    </div>
  )
}

export default GameContainer
