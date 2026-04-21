"use server";

import prisma from "@/server/db";

export async function getAdminStats() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [totalAssessments, totalUsers, todayCount, weekCount] = await Promise.all([
    prisma.assessmentRecord.count(),
    prisma.user.count(),
    prisma.assessmentRecord.count({
      where: { assessmentDate: { gte: startOfToday } },
    }),
    prisma.assessmentRecord.count({
      where: { assessmentDate: { gte: startOfWeek } },
    }),
  ]);

  return { totalAssessments, totalUsers, todayCount, weekCount };
}

export async function getAllAssessments(page = 1, pageSize = 20, _roleFilter?: string) {
  const skip = (page - 1) * pageSize;

  const [records, total] = await Promise.all([
    prisma.assessmentRecord.findMany({
      skip,
      take: pageSize,
      orderBy: { assessmentDate: 'desc' },
      include: {
        user: true,
        questionSet: true,
      },
    }),
    prisma.assessmentRecord.count(),
  ]);

  return { records, total, pages: Math.ceil(total / pageSize) };
}
