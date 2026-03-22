'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn, formatDate, getInitials } from '@/lib/utils'
import { PRIORITY_CONFIG } from '@/types/database'
import type { Task } from '@/types/database'
import { CalendarDays, GripVertical } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onClick: (task: Task) => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-slate-800 rounded-xl border border-slate-700 p-4 cursor-pointer hover:border-slate-600 transition-all group',
        isDragging && 'opacity-50 scale-95 shadow-2xl'
      )}
      onClick={() => onClick(task)}
    >
      <div className="flex items-start gap-2">
        {/* ドラッグハンドル */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </button>

        <div className="flex-1 min-w-0">
          {/* 優先度バッジ */}
          <span className={cn(
            'inline-block text-xs px-1.5 py-0.5 rounded border font-medium mb-2',
            PRIORITY_CONFIG[task.priority].color
          )}>
            {PRIORITY_CONFIG[task.priority].label}
          </span>

          {/* タイトル */}
          <p className="text-white text-sm font-medium leading-snug line-clamp-2">{task.title}</p>

          {/* 説明 */}
          {task.description && (
            <p className="text-slate-500 text-xs mt-1 line-clamp-2">{task.description}</p>
          )}

          {/* フッター */}
          <div className="flex items-center justify-between mt-3">
            {task.due_date ? (
              <div className="flex items-center gap-1 text-slate-500 text-xs">
                <CalendarDays size={11} />
                {formatDate(task.due_date)}
              </div>
            ) : (
              <span />
            )}

            {task.assignee && (
              <div
                className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0"
                title={(task.assignee as { full_name: string }).full_name}
              >
                {getInitials((task.assignee as { full_name: string }).full_name)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
