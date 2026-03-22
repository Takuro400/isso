interface ProgressRingProps {
  total: number
  done: number
  inProgress: number
}

export function ProgressRing({ total, done, inProgress }: ProgressRingProps) {
  const doneRate     = total > 0 ? Math.round((done / total) * 100) : 0
  const progressRate = total > 0 ? Math.round((inProgress / total) * 100) : 0

  const radius = 52
  const circumference = 2 * Math.PI * radius
  const doneOffset    = circumference - (doneRate / 100) * circumference

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
      <h3 className="text-slate-300 text-sm font-medium mb-4">タスク完了率</h3>
      <div className="flex items-center gap-6">
        {/* 円グラフ */}
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* 背景トラック */}
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="#1e293b"
              strokeWidth="10"
            />
            {/* 完了 */}
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="#6366f1"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={doneOffset}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{doneRate}%</span>
            <span className="text-xs text-slate-500">完了</span>
          </div>
        </div>

        {/* 凡例 */}
        <div className="space-y-3 text-sm flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-slate-400">完了</span>
            </div>
            <span className="text-white font-medium">{done} / {total}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span className="text-slate-400">進行中</span>
            </div>
            <span className="text-white font-medium">{inProgress} ({progressRate}%)</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span className="text-slate-400">未着手</span>
            </div>
            <span className="text-white font-medium">{total - done - inProgress}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
