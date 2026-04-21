"use server";

import db from "@/server/db";

const WINDOW_MS = 60 * 60 * 1000; // 1 giờ
const MAX_PER_WINDOW = 5;          // tối đa 5 lần submit/giờ

export async function checkRateLimit(key: string): Promise<{ allowed: boolean; remaining: number }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_MS);

  try {
    // Dùng Prisma ORM thay vì raw SQL để tránh schema drift
    const existing = await db.rateLimit.findUnique({ where: { key } });

    if (!existing) {
      // Chưa có record → tạo mới với count=1
      await db.rateLimit.create({
        data: { key, count: 1, windowStart: now },
      });
      return { allowed: true, remaining: MAX_PER_WINDOW - 1 };
    }

    // Nếu windowStart của record cũ < cửa sổ hiện tại → reset
    if (existing.windowStart < windowStart) {
      await db.rateLimit.update({
        where: { key },
        data: { count: 1, windowStart: now },
      });
      return { allowed: true, remaining: MAX_PER_WINDOW - 1 };
    }

    // Trong cùng cửa sổ — kiểm tra limit
    if (existing.count >= MAX_PER_WINDOW) {
      return { allowed: false, remaining: 0 };
    }

    // Tăng count
    await db.rateLimit.update({
      where: { key },
      data: { count: existing.count + 1 },
    });

    return { allowed: true, remaining: MAX_PER_WINDOW - existing.count - 1 };
  } catch (err) {
    // Nếu rate limit bị lỗi, cho phép qua để không chặn user
    console.warn("Rate limit check failed, allowing request:", err);
    return { allowed: true, remaining: MAX_PER_WINDOW };
  }
}
