-- FitWiz 数据库迁移：新增字段
-- 执行方式：在 Supabase Dashboard 的 SQL Editor 中运行
-- 执行时间：2026-06-21

-- 1. body_metrics 表新增基础代谢率字段
ALTER TABLE body_metrics ADD COLUMN IF NOT EXISTS bmr integer;

-- 2. diet_logs 表新增钠盐摄入量字段
ALTER TABLE diet_logs ADD COLUMN IF NOT EXISTS sodium_mg integer;

-- 3. exercise_logs 表新增力量训练相关字段
ALTER TABLE exercise_logs ADD COLUMN IF NOT EXISTS weight_kg numeric(6,2);
ALTER TABLE exercise_logs ADD COLUMN IF NOT EXISTS sets integer;
ALTER TABLE exercise_logs ADD COLUMN IF NOT EXISTS reps integer;

-- 4. 检查 exercise_logs 表的 duration 字段名
-- 如果实际列名是 duration_minutes 而代码用的是 duration，需要添加别名列：
-- ALTER TABLE exercise_logs ADD COLUMN IF NOT EXISTS duration integer DEFAULT 0;
-- 或者重命名：
-- ALTER TABLE exercise_logs RENAME COLUMN duration_minutes TO duration;

-- 5. 如果 diet_logs 表缺少 portion_size 字段（schema 中有定义但可能未创建）
-- 已在 schema 中定义，如果不存在则添加：
ALTER TABLE diet_logs ADD COLUMN IF NOT EXISTS portion_size numeric(6,2);

-- 验证：
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name IN ('body_metrics', 'diet_logs', 'exercise_logs') 
-- ORDER BY table_name, ordinal_position;
