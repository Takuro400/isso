import Link from 'next/link'
import { cn, formatDate } from '@/lib/utils'
import type { Note } from '@/types/database'
import { Pin } from 'lucide-react'

interface NoteCardProps {
  note: Note
}

export function NoteCard({ note }: NoteCardProps) {
  return (
    <Link
      href={`/notes/${note.id}`}
      className={cn(
        'group block p-5 rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20',
        note.pinned
          ? 'bg-amber-950/20 border-amber-800/40 hover:border-amber-700/60'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
      )}
    >
      <div className="flex items-start gap-2 mb-2">
        {note.pinned && (
          <Pin size={13} className="text-amber-400 mt-0.5 shrink-0 fill-amber-400" />
        )}
        <h3 className="text-white font-medium text-sm leading-snug line-clamp-2 flex-1">
          {note.title}
        </h3>
      </div>

      {note.content && (
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-3">
          {note.content}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {note.tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="text-slate-600 text-xs shrink-0">{formatDate(note.updated_at)}</span>
      </div>
    </Link>
  )
}
