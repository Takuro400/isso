import { formatDate, formatCurrency, daysUntil } from '@/lib/utils'
import type { Project } from '@/types/database'
import { CalendarDays, TrendingUp, Clock } from 'lucide-react'

interface VisionCardProps {
  project: Project
}

export function VisionCard({ project }: VisionCardProps) {
  const days = daysUntil(project.target_date)

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 text-white">
      {/* 背景装飾 */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        <p className="text-indigo-200 text-sm font-medium mb-1">ビジョン</p>
        <h2 className="text-2xl font-bold leading-tight mb-2">{project.name}</h2>
        {project.description && (
          <p className="text-indigo-100 text-sm leading-relaxed mb-6 max-w-lg">
            {project.description}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 開塾目標日 */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 text-indigo-200 text-xs mb-2">
              <CalendarDays size={14} />
              開塾目標日
            </div>
            <p className="text-white font-semibold">{formatDate(project.target_date)}</p>
          </div>

          {/* 残り日数 */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 text-indigo-200 text-xs mb-2">
              <Clock size={14} />
              残り日数
            </div>
            <p className="text-white font-semibold">
              {days === null ? '未設定' : days > 0 ? `あと ${days} 日` : '期限超過'}
            </p>
          </div>

          {/* 売上目標 */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 text-indigo-200 text-xs mb-2">
              <TrendingUp size={14} />
              売上目標
            </div>
            <p className="text-white font-semibold">{formatCurrency(project.revenue_goal)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
