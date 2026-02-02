interface ShootingUIProps {
  score: number
  chargeLevel: number
  isCharging: boolean
}

function ShootingUI({ score, chargeLevel, isCharging }: ShootingUIProps) {
  return (
    <div className="flex justify-between items-center w-full max-w-[320px] px-2">
      {/* スコア表示 */}
      <div className="text-white text-lg font-bold">
        スコア: <span className="text-yellow-400">{score}</span>
      </div>

      {/* チャージゲージ */}
      <div className="flex items-center gap-2">
        <span className="text-white text-sm">チャージ</span>
        <div className="w-24 h-4 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ${
              isCharging ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-500'
            }`}
            style={{ width: `${chargeLevel * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default ShootingUI
