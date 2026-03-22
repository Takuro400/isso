import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NoteCard } from '@/components/notes/NoteCard'
import type { Note, Project } from '@/types/database'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function NotesPage() {
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
        <Link href="/settings" className="text-indigo-400 text-sm">設定からプロジェクトを作成</Link>
      </div>
    )
  }

  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .eq('project_id', project.id)
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  const allNotes = (notes ?? []) as Note[]
  const pinned   = allNotes.filter(n => n.pinned)
  const rest     = allNotes.filter(n => !n.pinned)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-xl font-bold">クイックメモ</h1>
          <p className="text-slate-500 text-sm mt-0.5">会議メモ・コンセプト・差別化ポイントをストック</p>
        </div>
        <Link
          href="/notes/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl transition"
        >
          <Plus size={16} />
          新規メモ
        </Link>
      </div>

      {allNotes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📝</p>
          <p className="text-slate-400 mb-2">まだメモがありません</p>
          <Link href="/notes/new" className="text-indigo-400 hover:text-indigo-300 text-sm">
            最初のメモを作成する
          </Link>
        </div>
      ) : (
        <>
          {/* ピン留め */}
          {pinned.length > 0 && (
            <div className="mb-6">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-3">
                📌 ピン留め
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinned.map(note => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          )}

          {/* その他 */}
          {rest.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-3">その他</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rest.map(note => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
