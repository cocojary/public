import { AssessmentResult } from './scoring';

/**
 * Mock Profile: Chuyên viên Hành chính / Kế toán nội bộ
 * Đặc điểm: Tận tâm cực cao, Cẩn trọng, Ổn định cảm xúc tốt, Hướng ngoại vừa phải.
 */
export const ADMIN_PROFILE_MOCK: any = {
  dimensions: [
    { dimensionId: 'D1', raw: 18, max: 20, scaled: 9, percentile: 90 }, // Tận tâm (High)
    { dimensionId: 'D2', raw: 17, max: 20, scaled: 8.5, percentile: 85 }, // Cẩn trọng (High)
    { dimensionId: 'D3', raw: 15, max: 20, scaled: 7.5, percentile: 75 }, // Điềm tĩnh (High)
    { dimensionId: 'D4', raw: 12, max: 20, scaled: 6, percentile: 60 }, // Dễ chịu (Mid-High)
    { dimensionId: 'D5', raw: 8, max: 20, scaled: 4, percentile: 40 },  // Hướng ngoại (Mid-Low)
    { dimensionId: 'D6', raw: 6, max: 20, scaled: 3, percentile: 30 },  // Sáng tạo (Low) - Ưu tiên quy trình
    { dimensionId: 'D7', raw: 14, max: 20, scaled: 7, percentile: 70 }, // Thách thức (Mid-High)
    { dimensionId: 'D8', raw: 10, max: 20, scaled: 5, percentile: 50 }, // Thấu cảm (Mid)
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
    level: 'high',
    lieScore: 1.5,      // Rất trung thực
    consistencyScore: 92, // Rất nhất quán
    speedFlag: false,
    avgSecondsPerQ: 14,
    details: 'Kết quả đáng tin cậy'
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
