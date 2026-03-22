// ============================================================
// Supabase データベース型定義
// 本番では: npx supabase gen types typescript --linked > src/types/database.ts
// ============================================================

export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'
export type UserRole = 'admin' | 'member'
export type ProjectStatus = 'active' | 'archived'

export interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  role: UserRole
  created_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  target_date: string | null
  revenue_goal: number | null
  status: ProjectStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assignee_id: string | null
  due_date: string | null
  position: number
  created_by: string | null
  created_at: string
  updated_at: string
  // JOINで取得する関連データ
  assignee?: Profile | null
}

export interface Note {
  id: string
  project_id: string
  title: string
  content: string
  tags: string[]
  pinned: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  // JOINで取得する関連データ
  author?: Profile | null
}

// カンバンボード用の列定義
export const KANBAN_COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'backlog',     label: '未着手',   color: 'bg-slate-100 border-slate-300' },
  { id: 'in_progress', label: '進行中',   color: 'bg-blue-50 border-blue-300' },
  { id: 'review',     label: 'レビュー中', color: 'bg-amber-50 border-amber-300' },
  { id: 'done',       label: '完了',     color: 'bg-green-50 border-green-300' },
]

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  high:   { label: '高',  color: 'text-red-600 bg-red-50 border-red-200' },
  medium: { label: '中',  color: 'text-amber-600 bg-amber-50 border-amber-200' },
  low:    { label: '低',  color: 'text-slate-500 bg-slate-50 border-slate-200' },
}
