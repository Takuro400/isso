-- ============================================================
-- 003: tasks テーブル
-- カンバンボード用タスク管理
-- ============================================================

CREATE TYPE public.task_status AS ENUM ('backlog', 'in_progress', 'review', 'done');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high');

CREATE TABLE public.tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  status       public.task_status NOT NULL DEFAULT 'backlog',
  priority     public.task_priority NOT NULL DEFAULT 'medium',
  assignee_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date     DATE,
  position     INTEGER NOT NULL DEFAULT 0,
  created_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス（カンバン表示の高速化）
CREATE INDEX idx_tasks_project_status ON public.tasks(project_id, status, position);
CREATE INDEX idx_tasks_assignee ON public.tasks(assignee_id);

-- updated_at トリガー
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select" ON public.tasks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "tasks_insert" ON public.tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "tasks_update" ON public.tasks
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "tasks_delete" ON public.tasks
  FOR DELETE USING (
    auth.uid() = created_by
    OR auth.uid() = assignee_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Realtime 有効化
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
