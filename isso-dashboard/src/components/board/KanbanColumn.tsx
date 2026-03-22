'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import { TaskCard } from './TaskCard'
import type { Task, TaskStatus } from '@/types/database'
import { Plus } from 'lucide-react'

interface KanbanColumnProps {
  id: TaskStatus
  label: string
  color: string
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onAddTask: (status: TaskStatus) => void
}

export function KanbanColumn({ id, label, color, tasks, onTaskClick, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="flex flex-col min-w-72 w-72 shrink-0">
      {/* カラムヘッダー */}
      <div className={cn('flex items-center justify-between px-3 py-2.5 rounded-t-xl border-t border-x', color)}>
        <div className="flex items-center gap-2">
          <span className="text-slate-700 text-sm font-semibold">{label}</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/60 text-slate-600 font-medium">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(id)}
          className="text-slate-500 hover:text-slate-700 transition p-0.5 rounded"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* タスクリスト */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 min-h-48 p-2 rounded-b-xl border border-slate-200/50 space-y-2 transition-colors',
          isOver ? 'bg-indigo-50/30' : 'bg-slate-800/20'
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div
            className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-slate-700/50 text-slate-600 text-xs cursor-pointer hover:border-indigo-500/50 hover:text-indigo-400 transition-colors"
            onClick={() => onAddTask(id)}
          >
            + タスクを追加
          </div>
        )}
      </div>
    </div>
  )
}
