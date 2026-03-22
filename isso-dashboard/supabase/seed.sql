-- ============================================================
-- seed.sql: 開発・デモ用初期データ
-- ※ Supabase Auth でユーザー作成後に実行してください
-- ============================================================

-- サンプルプロジェクト
INSERT INTO public.projects (name, description, target_date, revenue_goal, status)
VALUES (
  '総合型選抜オンライン塾 開塾プロジェクト',
  '2024年9月開塾を目標に、コンセプト策定から生徒募集まで一気通貫で進める。',
  '2024-09-01',
  5000000,
  'active'
);

-- サンプルタスク（プロジェクトIDは実際のUUIDに差し替えてください）
-- INSERT INTO public.tasks (project_id, title, status, priority, position)
-- VALUES
--   ('<project-id>', 'ターゲット生徒ペルソナ定義', 'backlog', 'high', 0),
--   ('<project-id>', '差別化ポイント整理（競合調査）', 'in_progress', 'high', 0),
--   ('<project-id>', 'LP（ランディングページ）ワイヤーフレーム', 'backlog', 'medium', 1),
--   ('<project-id>', '料金プラン策定', 'review', 'high', 0),
--   ('<project-id>', 'SNSアカウント開設', 'done', 'low', 0);

-- サンプルメモ
-- INSERT INTO public.notes (project_id, title, content, tags, pinned)
-- VALUES
--   ('<project-id>', '塾のコンセプト', '# 塾のコンセプト\n\n「自分の言葉で語れる生徒を育てる」\n\n総合型選抜は単なる受験テクニックではなく、自己理解と表現力が鍵。', ARRAY['コンセプト', '重要'], true),
--   ('<project-id>', '差別化ポイント', '1. 現役AO合格者がメンター\n2. 週1回の1on1フィードバック\n3. Slack で24時間質問対応', ARRAY['差別化', 'サービス'], false);
