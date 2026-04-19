"use server";

import prisma from "@/server/db";

export async function getAdminStats() {
  const [totalAssessments, totalUsers, recentAssessments, roleDistribution] = await Promise.all([
    prisma.assessmentRecord.count(),
    prisma.user.count(),
    prisma.assessmentRecord.findMany({
      take: 50,
      orderBy: { assessmentDate: 'desc' },
      include: { user: true, questionSet: { include: { role: true } } },
    }),
    prisma.assessmentRecord.groupBy({
      by: ['questionSetId'],
      _count: true,
    }),
  ]);

  return { totalAssessments, totalUsers, recentAssessments, roleDistribution };
}

export async function getAllAssessments(page = 1, pageSize = 20, roleFilter?: string) {
  const skip = (page - 1) * pageSize;

  const where = roleFilter
    ? { questionSet: { role: { code: roleFilter } } }
    : {};

  const [records, total] = await Promise.all([
    prisma.assessmentRecord.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { assessmentDate: 'desc' },
      include: {
        user: true,
        questionSet: { include: { role: true } },
      },
    }),
    prisma.assessmentRecord.count({ where }),
  ]);

  return { records, total, pages: Math.ceil(total / pageSize) };
}
