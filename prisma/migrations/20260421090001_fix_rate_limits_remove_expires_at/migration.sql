-- Xóa cột expires_at khỏi rate_limits (cột này không có trong Prisma schema và gây lỗi NOT NULL constraint)
ALTER TABLE rate_limits DROP COLUMN IF EXISTS expires_at;
