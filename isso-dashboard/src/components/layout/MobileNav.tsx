'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Kanban, StickyNote, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'ホーム',   icon: LayoutDashboard },
  { href: '/board',     label: 'カンバン', icon: Kanban },
  { href: '/notes',     label: 'メモ',     icon: StickyNote },
  { href: '/settings',  label: '設定',     icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 flex">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors',
              isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <Icon size={20} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
