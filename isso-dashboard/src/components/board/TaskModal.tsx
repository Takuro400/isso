'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, Profile, TaskStatus, TaskPriority } from '@/types/database'
import { KANBAN_COLUMNS, PRIORITY_CONFIG } from '@/types/database'
import { X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskModalProps {
  task: Task | null
  projectId: string
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

const EMPTY_TASK: Partial<Task> = {
  title: '',
  description: '',
  status: 'backlog',
  priority: 'medium',
  assignee_id: null,
  due_date: null,
}

export function TaskModal({ task, projectId, isOpen, onClose, onSaved }: TaskModalProps) {
  const [form, setForm] = useState<Partial<Task>>(EMPTY_TASK)
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (task) {
      setForm(task)
    } else {
      setForm(EMPTY_TASK)
    }
  }, [task])

  useEffect(() => {
    if (!isOpen) return
    const supabase = createClient()
    supabase.from('profiles').select('*').then(({ data }) => {
      if (data) setMembers(data as Profile[])
    })
  }, [isOpen])

  async function handleSave() {
    if (!form.title?.trim()) return
    setLoading(true)
    const supabase = createClient()

    const payload = {
      title:       form.title,
      description: form.description ?? null,
      status:      form.status as TaskStatus,
      priority:    form.priority as TaskPriority,
      assignee_id: form.assignee_id ?? null,
      due_date:    form.due_date ?? null,
      project_id:  projectId,
    }

    if (task) {
      await supabase.from('tasks').update(payload).eq('id', task.id)
    } else {
      // 末尾に追加
      const { data: lastTask } = await supabase
        .from('tasks')
        .select('position')
        .eq('project_id', projectId)
        .eq('status', form.status as string)
        .order('position', { ascending: false })
        .limit(1)
        .single()
      const position = lastTask ? lastTask.position + 1 : 0
      await supabase.from('tasks').insert({ ...payload, position })
    }

    setLoading(false)
    onSaved()
    onClose()
  }

  async function handleDelete() {
    if (!task) return
    if (!confirm('このタスクを削除しますか？')) return
    const supabase = createClient()
    await supabase.from('tasks').delete().eq('id', task.id)
    onSaved()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-white font-semibold">{task ? 'タスクを編集' : '新しいタスク'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* フォーム */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">タイトル *</label>
            <input
              type="text"
              value={form.title ?? ''}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="タスクのタイトル"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">説明</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="詳細を入力..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">ステータス</label>
              <select
                value={form.status}
                onChange={(e) => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {KANBAN_COLUMNS.map(col => (
                  <option key={col.id} value={col.id}>{col.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">優先度</label>
              <select
                value={form.priority}
                onChange={(e) => setForm(f => ({ ...f, priority: e.target.value as TaskPriority }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {(Object.entries(PRIORITY_CONFIG) as [TaskPriority, { label: string }][]).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">担当者</label>
              <select
                value={form.assignee_id ?? ''}
                onChange={(e) => setForm(f => ({ ...f, assignee_id: e.target.value || null }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">未割り当て</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">期日</label>
              <input
                type="date"
                value={form.due_date ?? ''}
                onChange={(e) => setForm(f => ({ ...f, due_date: e.target.value || null }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-6 border-t border-slate-800">
          <div>
            {task && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg text-sm transition"
              >
                <Trash2 size={14} />
                削除
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm transition"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !form.title?.trim()}
              className={cn(
                'px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition',
                (loading || !form.title?.trim()) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
