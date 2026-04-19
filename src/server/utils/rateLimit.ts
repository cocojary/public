"use server";

import prisma from "@/server/db";

const WINDOW_MS = 60 * 60 * 1000; // 1 giờ
const MAX_PER_WINDOW = 5;          // tối đa 5 lần submit/giờ

export async function checkRateLimit(key: string): Promise<{ allowed: boolean; remaining: number }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_MS);

  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  if (!existing || existing.windowStart < windowStart) {
    // Cửa sổ mới hoặc chưa có record
    await prisma.rateLimit.upsert({
      where: { key },
      update: { count: 1, windowStart: now },
      create: { key, count: 1, windowStart: now },
    });
    return { allowed: true, remaining: MAX_PER_WINDOW - 1 };
  }

  if (existing.count >= MAX_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });

  return { allowed: true, remaining: MAX_PER_WINDOW - existing.count - 1 };
}
