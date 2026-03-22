'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task } from '@/types/database'

export function useRealtimeTasks(projectId: string, initialTasks: Task[]) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const fetchTasks = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('tasks')
      .select('*, assignee:profiles!tasks_assignee_id_fkey(full_name, avatar_url)')
      .eq('project_id', projectId)
      .order('position')
    if (data) setTasks(data as Task[])
  }, [projectId])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`tasks:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          // 変更があったら全件再取得（シンプルで確実な方法）
          fetchTasks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, fetchTasks])

  return { tasks, setTasks, refetch: fetchTasks }
}
