'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeTasks } from '@/hooks/useRealtimeTasks'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { TaskModal } from './TaskModal'
import { KANBAN_COLUMNS } from '@/types/database'
import type { Task, TaskStatus } from '@/types/database'

interface KanbanBoardProps {
  projectId: string
  initialTasks: Task[]
}

export function KanbanBoard({ projectId, initialTasks }: KanbanBoardProps) {
  const { tasks, setTasks, refetch } = useRealtimeTasks(projectId, initialTasks)

  const [activeTask, setActiveTask]     = useState<Task | null>(null)
  const [modalTask, setModalTask]       = useState<Task | null>(null)
  const [modalOpen, setModalOpen]       = useState(false)
  const [modalStatus, setModalStatus]   = useState<TaskStatus>('backlog')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function getTasksByStatus(status: TaskStatus) {
    return tasks
      .filter(t => t.status === status)
      .sort((a, b) => a.position - b.position)
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveTask(tasks.find(t => t.id === active.id) ?? null)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const activeId = active.id as string
    const overId   = over.id as string

    const activeTask = tasks.find(t => t.id === activeId)
    if (!activeTask) return

    // overがカラムIDの場合（空カラムへのドロップ）
    const overColumn = KANBAN_COLUMNS.find(c => c.id === overId)
    if (overColumn && activeTask.status !== overColumn.id) {
      setTasks(prev =>
        prev.map(t => t.id === activeId ? { ...t, status: overColumn.id } : t)
      )
      return
    }

    // overがタスクIDの場合
    const overTask = tasks.find(t => t.id === overId)
    if (!overTask) return

    if (activeTask.status !== overTask.status) {
      setTasks(prev =>
        prev.map(t => t.id === activeId ? { ...t, status: overTask.status } : t)
      )
    }
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null)
    if (!over) return

    const activeId = active.id as string
    const overId   = over.id as string
    if (activeId === overId) return

    const activeTaskObj = tasks.find(t => t.id === activeId)
    if (!activeTaskObj) return

    const supabase = createClient()

    // 最終ステータスを確定
    const overColumn = KANBAN_COLUMNS.find(c => c.id === overId)
    const newStatus: TaskStatus = overColumn
      ? overColumn.id
      : (tasks.find(t => t.id === overId)?.status ?? activeTaskObj.status)

    // 同カラム内の並び替え
    const columnTasks = tasks
      .filter(t => t.status === newStatus)
      .sort((a, b) => a.position - b.position)

    const oldIndex = columnTasks.findIndex(t => t.id === activeId)
    const newIndex = columnTasks.findIndex(t => t.id === overId)

    let reordered = columnTasks
    if (oldIndex !== -1 && newIndex !== -1) {
      reordered = arrayMove(columnTasks, oldIndex, newIndex)
    } else if (oldIndex === -1) {
      // 別カラムから移動してきた場合
      const withoutActive = columnTasks.filter(t => t.id !== activeId)
      const insertAt = newIndex !== -1 ? newIndex : withoutActive.length
      reordered = [
        ...withoutActive.slice(0, insertAt),
        { ...activeTaskObj, status: newStatus },
        ...withoutActive.slice(insertAt),
      ]
    }

    // 楽観的UI更新
    const updatedTasks = tasks.map(t => {
      const found = reordered.find(r => r.id === t.id)
      if (found) return { ...found, position: reordered.indexOf(found) }
      return t
    })
    setTasks(updatedTasks)

    // DB更新（バッチ）
    const updates = reordered.map((t, idx) =>
      supabase.from('tasks').update({ status: newStatus, position: idx }).eq('id', t.id)
    )
    await Promise.all(updates)
  }

  const handleAddTask = useCallback((status: TaskStatus) => {
    setModalTask(null)
    setModalStatus(status)
    setModalOpen(true)
  }, [])

  const handleTaskClick = useCallback((task: Task) => {
    setModalTask(task)
    setModalOpen(true)
  }, [])

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              label={col.label}
              color={col.color}
              tasks={getTasksByStatus(col.id)}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="opacity-90 rotate-2">
              <TaskCard task={activeTask} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskModal
        task={modalTask}
        projectId={projectId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={refetch}
      />
    </>
  )
}
