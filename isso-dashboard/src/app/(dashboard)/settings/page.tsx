'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Profile } from '@/types/database'
import { formatDate, getInitials } from '@/lib/utils'
import { Save, Users, FolderKanban } from 'lucide-react'

export default function SettingsPage() {
  const [project, setProject]   = useState<Partial<Project>>({ name: '', description: '', target_date: null, revenue_goal: null })
  const [projectId, setProjectId] = useState<string | null>(null)
  const [members, setMembers]   = useState<Profile[]>([])
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setProject(data as Project)
          setProjectId((data as Project).id)
        }
      })

    supabase.from('profiles').select('*').then(({ data }) => {
      if (data) setMembers(data as Profile[])
    })
  }, [])

  async function handleSaveProject() {
    setSaving(true)
    const supabase = createClient()

    const payload = {
      name:         project.name,
      description:  project.description ?? null,
      target_date:  project.target_date ?? null,
      revenue_goal: project.revenue_goal ?? null,
    }

    if (projectId) {
      await supabase.from('projects').update(payload).eq('id', projectId)
    } else {
      const { data } = await supabase.from('projects').insert({ ...payload, status: 'active' }).select().single()
      if (data) setProjectId((data as Project).id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-white text-xl font-bold">設定</h1>
        <p className="text-slate-500 text-sm mt-0.5">プロジェクト情報とメンバーを管理</p>
      </div>

      {/* プロジェクト設定 */}
      <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-6">
          <FolderKanban size={18} className="text-indigo-400" />
          <h2 className="text-white font-semibold">プロジェクト情報</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">プロジェクト名 *</label>
            <input
              type="text"
              value={project.name ?? ''}
              onChange={(e) => setProject(p => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="例: 総合型選抜オンライン塾 開塾プロジェクト"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">説明</label>
            <textarea
              value={project.description ?? ''}
              onChange={(e) => setProject(p => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="プロジェクトのビジョンや目標を入力..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">開塾目標日</label>
              <input
                type="date"
                value={project.target_date ?? ''}
                onChange={(e) => setProject(p => ({ ...p, target_date: e.target.value || null }))}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">売上目標（円）</label>
              <input
                type="number"
                value={project.revenue_goal ?? ''}
                onChange={(e) => setProject(p => ({ ...p, revenue_goal: e.target.value ? Number(e.target.value) : null }))}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="5000000"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSaveProject}
            disabled={saving || !project.name?.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-xl transition"
          >
            <Save size={15} />
            {saved ? '保存しました' : saving ? '保存中...' : '変更を保存'}
          </button>
        </div>
      </section>

      {/* メンバー一覧 */}
      <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users size={18} className="text-indigo-400" />
          <h2 className="text-white font-semibold">チームメンバー</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">{members.length}名</span>
        </div>

        {members.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">メンバーがいません</p>
        ) : (
          <ul className="space-y-3">
            {members.map(member => (
              <li key={member.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {getInitials(member.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{member.full_name}</p>
                  <p className="text-slate-500 text-xs">{formatDate(member.created_at)} 参加</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  member.role === 'admin'
                    ? 'text-indigo-300 bg-indigo-950 border-indigo-800'
                    : 'text-slate-400 bg-slate-800 border-slate-700'
                }`}>
                  {member.role === 'admin' ? '管理者' : 'メンバー'}
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className="text-slate-600 text-xs mt-4">
          ※ メンバーの追加はSupabase Auth からメール招待で行ってください
        </p>
      </section>
    </div>
  )
}
