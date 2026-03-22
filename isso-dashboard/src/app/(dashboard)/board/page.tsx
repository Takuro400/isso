import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { KanbanBoard } from '@/components/board/KanbanBoard'
import type { Task, Project } from '@/types/database'
import Link from 'next/link'
import { Settings2 } from 'lucide-react'

export default async function BoardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .single() as { data: Project | null }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        <p className="text-slate-400 mb-4">プロジェクトがありません</p>
        <Link href="/settings" className="text-indigo-400 hover:text-indigo-300 text-sm">
          設定からプロジェクトを作成
        </Link>
      </div>
    )
  }

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, assignee:profiles!tasks_assignee_id_fkey(full_name, avatar_url)')
    .eq('project_id', project.id)
    .order('position')

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 shrink-0">
        <div>
          <h1 className="text-white font-semibold">カンバンボード</h1>
          <p className="text-slate-500 text-sm">{project.name}</p>
        </div>
        <Link
          href="/settings"
          className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white text-sm rounded-lg hover:bg-slate-800 transition"
        >
          <Settings2 size={15} />
          設定
        </Link>
      </div>

      {/* ボード */}
      <div className="flex-1 overflow-hidden p-6">
        <KanbanBoard
          projectId={project.id}
          initialTasks={(tasks ?? []) as Task[]}
        />
      </div>
    </div>
  )
}
