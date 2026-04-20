"use server";

import prisma from "@/server/db";

export async function getAdminStats() {
  const [totalAssessments, totalUsers, recentAssessments] = await Promise.all([
    prisma.assessmentRecord.count(),
    prisma.user.count(),
    prisma.assessmentRecord.findMany({
      take: 50,
      orderBy: { assessmentDate: 'desc' },
      include: { user: true, questionSet: true },
    }),
  ]);

  return { totalAssessments, totalUsers, recentAssessments };
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
