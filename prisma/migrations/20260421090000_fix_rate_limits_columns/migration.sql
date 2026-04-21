-- Thêm cột window_start và updated_at vào bảng rate_limits
-- Các cột này cần thiết cho chức năng rate limiting của hệ thống Public Assessment

ALTER TABLE rate_limits
  ADD COLUMN IF NOT EXISTS window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
