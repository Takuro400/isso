import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { VisionCard } from '@/components/dashboard/VisionCard'
import { ProgressRing } from '@/components/dashboard/ProgressRing'
import { formatDate } from '@/lib/utils'
import { PRIORITY_CONFIG, KANBAN_COLUMNS } from '@/types/database'
import type { Task, Note, Project } from '@/types/database'
import { ArrowRight, Kanban, StickyNote, AlertCircle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // アクティブなプロジェクトを取得
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
        <div className="text-slate-400 text-6xl mb-4">🚀</div>
        <h2 className="text-white text-xl font-semibold mb-2">プロジェクトがまだありません</h2>
        <p className="text-slate-400 text-sm mb-6">設定からプロジェクトを作成してください</p>
        <Link
          href="/settings"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-500 transition"
        >
          プロジェクトを作成
        </Link>
      </div>
    )
  }

  // タスクとメモを並行取得
  const [{ data: tasks }, { data: notes }] = await Promise.all([
    supabase
      .from('tasks')
      .select('*, assignee:profiles!tasks_assignee_id_fkey(full_name, avatar_url)')
      .eq('project_id', project.id)
      .order('position'),
    supabase
      .from('notes')
      .select('*')
      .eq('project_id', project.id)
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(4),
  ])

  const allTasks  = (tasks ?? []) as Task[]
  const allNotes  = (notes ?? []) as Note[]
  const doneTasks = allTasks.filter(t => t.status === 'done')
  const inProgTasks = allTasks.filter(t => t.status === 'in_progress')

  // 優先度高・期日が近いタスク
  const urgentTasks = allTasks
    .filter(t => t.status !== 'done' && t.priority === 'high')
    .slice(0, 4)

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* ビジョンカード */}
      <VisionCard project={project} />

      {/* 進捗 & 急ぎタスク */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressRing
          total={allTasks.length}
          done={doneTasks.length}
          inProgress={inProgTasks.length}
        />

        {/* 高優先度タスク */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400" />
              <h3 className="text-slate-300 text-sm font-medium">優先度: 高のタスク</h3>
            </div>
            <Link href="/board" className="text-indigo-400 text-xs hover:text-indigo-300 flex items-center gap-1">
              すべて見る <ArrowRight size={12} />
            </Link>
          </div>
          {urgentTasks.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">高優先度のタスクはありません</p>
          ) : (
            <ul className="space-y-2">
              {urgentTasks.map(task => (
                <li key={task.id} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <span className={`text-xs px-1.5 py-0.5 rounded border font-medium shrink-0 mt-0.5 ${PRIORITY_CONFIG[task.priority].color}`}>
                    {PRIORITY_CONFIG[task.priority].label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{task.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {KANBAN_COLUMNS.find(c => c.id === task.status)?.label}
                      {task.due_date && ` · ${formatDate(task.due_date)}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ショートカット */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/board"
          className="group flex items-center gap-4 p-5 bg-slate-900 border border-slate-800 hover:border-indigo-700 rounded-2xl transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-600/30 transition-colors">
            <Kanban size={22} className="text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium">カンバンボード</p>
            <p className="text-slate-500 text-sm">{allTasks.length} 件のタスク</p>
          </div>
          <ArrowRight size={18} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
        </Link>

        <Link
          href="/notes"
          className="group flex items-center gap-4 p-5 bg-slate-900 border border-slate-800 hover:border-indigo-700 rounded-2xl transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/30 transition-colors">
            <StickyNote size={22} className="text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium">クイックメモ</p>
            <p className="text-slate-500 text-sm">{allNotes.length} 件のメモ</p>
          </div>
          <ArrowRight size={18} className="text-slate-600 group-hover:text-amber-400 transition-colors" />
        </Link>
      </div>

      {/* 最新メモ */}
      {allNotes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-300 text-sm font-medium">最新メモ</h3>
            <Link href="/notes" className="text-indigo-400 text-xs hover:text-indigo-300 flex items-center gap-1">
              すべて見る <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allNotes.map(note => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-2 mb-2">
                  {note.pinned && <span className="text-amber-400 text-xs shrink-0 mt-0.5">📌</span>}
                  <p className="text-white text-sm font-medium line-clamp-1">{note.title}</p>
                </div>
                {note.content && (
                  <p className="text-slate-500 text-xs line-clamp-2">{note.content}</p>
                )}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.map(tag => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
