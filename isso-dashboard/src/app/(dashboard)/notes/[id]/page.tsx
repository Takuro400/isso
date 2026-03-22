'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Note, Project } from '@/types/database'
import { ArrowLeft, Pin, Trash2, Save } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function NoteDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const isNew   = id === 'new'
  const router  = useRouter()

  const [note, setNote]       = useState<Partial<Note>>({ title: '', content: '', tags: [], pinned: false })
  const [projectId, setProjectId] = useState<string | null>(null)
  const [tagInput, setTagInput]   = useState('')
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // アクティブプロジェクト取得
    supabase
      .from('projects')
      .select('id')
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setProjectId((data as Project).id)
      })

    if (!isNew) {
      supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) setNote(data as Note)
        })
    }
  }, [id, isNew])

  async function handleSave() {
    if (!note.title?.trim() || !projectId) return
    setSaving(true)
    const supabase = createClient()

    const payload = {
      title:      note.title,
      content:    note.content ?? '',
      tags:       note.tags ?? [],
      pinned:     note.pinned ?? false,
      project_id: projectId,
    }

    if (isNew) {
      const { data } = await supabase.from('notes').insert(payload).select().single()
      if (data) router.replace(`/notes/${(data as Note).id}`)
    } else {
      await supabase.from('notes').update(payload).eq('id', id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleDelete() {
    if (isNew || !confirm('このメモを削除しますか？')) return
    const supabase = createClient()
    await supabase.from('notes').delete().eq('id', id)
    router.push('/notes')
  }

  function addTag() {
    const tag = tagInput.trim()
    if (!tag || note.tags?.includes(tag)) return
    setNote(n => ({ ...n, tags: [...(n.tags ?? []), tag] }))
    setTagInput('')
  }

  function removeTag(tag: string) {
    setNote(n => ({ ...n, tags: (n.tags ?? []).filter(t => t !== tag) }))
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* ツールバー */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/notes"
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition"
          >
            <ArrowLeft size={16} /> 一覧に戻る
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setNote(n => ({ ...n, pinned: !n.pinned }))}
              className={cn(
                'p-2 rounded-lg transition',
                note.pinned
                  ? 'text-amber-400 bg-amber-400/10'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              )}
              title="ピン留め"
            >
              <Pin size={16} className={note.pinned ? 'fill-amber-400' : ''} />
            </button>

            {!isNew && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition"
                title="削除"
              >
                <Trash2 size={16} />
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !note.title?.trim()}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition',
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <Save size={14} />
              {saved ? '保存済み' : saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>

        {/* タイトル */}
        <input
          type="text"
          value={note.title ?? ''}
          onChange={(e) => setNote(n => ({ ...n, title: e.target.value }))}
          className="w-full bg-transparent text-white text-2xl font-bold placeholder:text-slate-700 focus:outline-none mb-4"
          placeholder="タイトルを入力..."
        />

        {/* タグ */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {(note.tags ?? []).map(tag => (
            <span
              key={tag}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="text-slate-500 hover:text-red-400 transition leading-none"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
            className="text-xs bg-transparent text-slate-400 placeholder:text-slate-700 focus:outline-none w-24"
            placeholder="+ タグを追加"
          />
        </div>

        {/* 本文 */}
        <textarea
          value={note.content ?? ''}
          onChange={(e) => setNote(n => ({ ...n, content: e.target.value }))}
          className="w-full min-h-96 bg-transparent text-slate-200 text-sm leading-relaxed placeholder:text-slate-700 focus:outline-none resize-none"
          placeholder="ここにメモを入力してください...&#10;&#10;例:&#10;# 塾のコンセプト&#10;「自分の言葉で語れる生徒を育てる」&#10;&#10;# 差別化ポイント&#10;- 現役AO合格者がメンター&#10;- 週1回の1on1フィードバック"
        />
      </div>
    </div>
  )
}
