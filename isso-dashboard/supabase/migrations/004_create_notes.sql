-- ============================================================
-- 004: notes テーブル
-- クイックメモ・会議メモのストック
-- ============================================================

CREATE TABLE public.notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT DEFAULT '',
  tags         TEXT[] NOT NULL DEFAULT '{}',
  pinned       BOOLEAN NOT NULL DEFAULT FALSE,
  created_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス（ピン留め・タグ検索の高速化）
CREATE INDEX idx_notes_project ON public.notes(project_id, pinned, updated_at DESC);
CREATE INDEX idx_notes_tags ON public.notes USING gin(tags);

-- updated_at トリガー
CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select" ON public.notes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "notes_insert" ON public.notes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "notes_update" ON public.notes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "notes_delete" ON public.notes
  FOR DELETE USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Realtime 有効化
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
