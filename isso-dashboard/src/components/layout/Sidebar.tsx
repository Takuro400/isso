'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn, getInitials } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import {
  LayoutDashboard,
  Kanban,
  StickyNote,
  Settings,
  LogOut,
  GraduationCap,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/board',     label: 'カンバン',       icon: Kanban },
  { href: '/notes',     label: 'メモ',           icon: StickyNote },
  { href: '/settings',  label: '設定',           icon: Settings },
]

interface SidebarProps {
  profile: Profile
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-slate-900 border-r border-slate-800 px-4 py-6">
      {/* ロゴ */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 shrink-0">
          <GraduationCap size={18} className="text-white" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-tight">塾チーム</p>
          <p className="text-slate-500 text-xs">ダッシュボード</p>
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* ユーザー情報 */}
      <div className="border-t border-slate-800 pt-4 mt-4">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {getInitials(profile.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{profile.full_name}</p>
            <p className="text-slate-500 text-xs">{profile.role === 'admin' ? '管理者' : 'メンバー'}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut size={16} />
          ログアウト
        </button>
      </div>
    </aside>
  )
}
