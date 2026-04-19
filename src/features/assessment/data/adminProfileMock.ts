import { AssessmentResult } from './scoring';

/**
 * Mock Profile: Chuyên viên Hành chính / Kế toán nội bộ
 * Đặc điểm: Tận tâm cực cao, Cẩn trọng, Ổn định cảm xúc tốt, Hướng ngoại vừa phải.
 */
export const ADMIN_PROFILE_MOCK: AssessmentResult = {
  dimensions: [
    { dimensionId: 'D1', score: 18, percentile: 90 }, // Tận tâm (High)
    { dimensionId: 'D2', score: 17, percentile: 85 }, // Cẩn trọng (High)
    { dimensionId: 'D3', score: 15, percentile: 75 }, // Điềm tĩnh (High)
    { dimensionId: 'D4', score: 12, percentile: 60 }, // Dễ chịu (Mid-High)
    { dimensionId: 'D5', score: 8, percentile: 40 },  // Hướng ngoại (Mid-Low)
    { dimensionId: 'D6', score: 6, percentile: 30 },  // Sáng tạo (Low) - Ưu tiên quy trình
    { dimensionId: 'D7', score: 14, percentile: 70 }, // Thách thức (Mid-High)
    { dimensionId: 'D8', score: 10, percentile: 50 }, // Thấu cảm (Mid)
  ],
  traits: [
    { trait: 'Tận tâm', score: 90 },
    { trait: 'Cẩn trọng', score: 85 },
    { trait: 'Điềm tĩnh', score: 75 },
    { trait: 'Dễ chịu', score: 60 },
    { trait: 'Hướng ngoại', score: 40 },
    { trait: 'Sáng tạo', score: 30 },
    { trait: 'Thách thức', score: 70 },
    { trait: 'Thấu cảm', score: 50 },
  ],
  reliability: {
    lieScore: 1.5,      // Rất trung thực
    consistencyScore: 92, // Rất nhất quán
    isReliable: true,
  },
  combatPower: {
    total: 78,
    label: 'Chuyên gia vận hành',
    potential: 'Cao',
  },
  metadata: {
    targetRole: 'ADMIN',
    testDuration: 1200,
    completedAt: new Date().toISOString(),
  }
};
