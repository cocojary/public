// ============================================================
// DIMENSION DEFINITIONS — Techzen HR Assessment
// Tham chiếu: Big Five / Scouter SS / Stress Research
// ============================================================

export type DimensionGroup = 'personality' | 'motivation' | 'thinking' | 'values' | 'stress';

export interface Dimension {
  id: string;
  group: DimensionGroup;
  nameVi: string;
  nameEn: string;
  descLow: string;  // Mô tả khi điểm thấp
  descHigh: string; // Mô tả khi điểm cao
  color: string;
  icon: string;
}

export const DIMENSIONS: Dimension[] = [
  // ── NHÓM A: TÍNH CÁCH CƠ BẢN (Big Five) ──────────────────
  {
    id: 'extraversion',
    group: 'personality',
    nameVi: 'Hướng Ngoại',
    nameEn: 'Extraversion',
    descLow: 'Thích làm việc độc lập, cần không gian riêng để nạp lại năng lượng.',
    descHigh: 'Năng động, thích giao tiếp và hoạt động nhóm, dễ tạo mối quan hệ.',
    color: '#3B82F6',
    icon: '🗣️',
  },
  {
    id: 'agreeableness',
    group: 'personality',
    nameVi: 'Hòa Đồng',
    nameEn: 'Agreeableness',
    descLow: 'Thẳng thắn, độc lập trong quyết định, ít bị ảnh hưởng bởi ý kiến người khác.',
    descHigh: 'Hợp tác tốt, quan tâm người khác, dễ xây dựng lòng tin trong nhóm.',
    color: '#10B981',
    icon: '🤝',
  },
  {
    id: 'conscientiousness',
    group: 'personality',
    nameVi: 'Tận Tâm',
    nameEn: 'Conscientiousness',
    descLow: 'Linh hoạt, thoải mái với sự thay đổi, không bị ràng buộc bởi quy trình cứng nhắc.',
    descHigh: 'Kỷ luật cao, có tổ chức, đáng tin cậy, hoàn thành tốt công việc được giao.',
    color: '#6366F1',
    icon: '✅',
  },
  {
    id: 'openness',
    group: 'personality',
    nameVi: 'Cởi Mở',
    nameEn: 'Openness',
    descLow: 'Thực dụng, ưa ổn định, tin vào những phương pháp đã được kiểm chứng.',
    descHigh: 'Sáng tạo, tò mò, sẵn sàng thử nghiệm ý tưởng mới và cách tiếp cận khác biệt.',
    color: '#F59E0B',
    icon: '💡',
  },
  {
    id: 'emotional_stability',
    group: 'personality',
    nameVi: 'Ổn Định Cảm Xúc',
    nameEn: 'Emotional Stability',
    descLow: 'Nhạy cảm với môi trường xung quanh, cần hỗ trợ tâm lý trong giai đoạn áp lực.',
    descHigh: 'Bình tĩnh, kiên định trước thách thức, ít bị xáo trộn bởi tình huống tiêu cực.',
    color: '#8B5CF6',
    icon: '⚖️',
  },

  // ── NHÓM B: Ý CHÍ & ĐỘNG LỰC ────────────────────────────
  {
    id: 'achievement_drive',
    group: 'motivation',
    nameVi: 'Khát Vọng Thành Tích',
    nameEn: 'Achievement Drive',
    descLow: 'Hài lòng với hiện tại, không đặt áp lực lên bản thân về kết quả.',
    descHigh: 'Luôn đặt mục tiêu cao, mong muốn vượt qua giới hạn bản thân liên tục.',
    color: '#EF4444',
    icon: '🏆',
  },
  {
    id: 'challenge_spirit',
    group: 'motivation',
    nameVi: 'Tinh Thần Thách Thức',
    nameEn: 'Challenge Spirit',
    descLow: 'Thích ổn định và có thể dự đoán, tránh rủi ro không cần thiết.',
    descHigh: 'Chủ động tìm kiếm thử thách mới, không nản lòng trước thất bại.',
    color: '#F97316',
    icon: '🔥',
  },
  {
    id: 'autonomy',
    group: 'motivation',
    nameVi: 'Tự Chủ',
    nameEn: 'Autonomy',
    descLow: 'Làm việc tốt trong môi trường có hướng dẫn rõ ràng và cấu trúc chặt chẽ.',
    descHigh: 'Chủ động cao, có khả năng tự định hướng và ra quyết định độc lập.',
    color: '#EC4899',
    icon: '🦅',
  },
  {
    id: 'learning_curiosity',
    group: 'motivation',
    nameVi: 'Ham Học Hỏi',
    nameEn: 'Learning Curiosity',
    descLow: 'Tập trung vào công việc hiện tại, ít dành thời gian cho việc tự học thêm.',
    descHigh: 'Luôn tìm kiếm kiến thức mới, chủ động học ngoài giờ làm việc.',
    color: '#06B6D4',
    icon: '📚',
  },
  {
    id: 'recognition_need',
    group: 'motivation',
    nameVi: 'Nhu Cầu Được Công Nhận',
    nameEn: 'Recognition Need',
    descLow: 'Không phụ thuộc vào lời khen, tự đánh giá kết quả của bản thân.',
    descHigh: 'Động lực lớn khi được ghi nhận công khai, phù hợp với môi trường có feedback thường xuyên.',
    color: '#84CC16',
    icon: '⭐',
  },

  // ── NHÓM C: TƯ DUY & PHONG CÁCH LÀM VIỆC ────────────────
  {
    id: 'logical_thinking',
    group: 'thinking',
    nameVi: 'Tư Duy Logic',
    nameEn: 'Logical Thinking',
    descLow: 'Thiên về cảm tính và trực quan, đưa ra quyết định dựa trên kinh nghiệm.',
    descHigh: 'Phân tích có hệ thống, dựa trên dữ liệu, giỏi giải quyết vấn đề phức tạp.',
    color: '#0EA5E9',
    icon: '🧠',
  },
  {
    id: 'empathy',
    group: 'thinking',
    nameVi: 'Đồng Cảm / EQ',
    nameEn: 'Empathy',
    descLow: 'Tập trung vào nhiệm vụ và kết quả, ít chú trọng đến cảm xúc trong giao tiếp.',
    descHigh: 'Nhạy bén với cảm xúc người khác, giao tiếp hiệu quả và xây dựng quan hệ tốt.',
    color: '#F472B6',
    icon: '💗',
  },
  {
    id: 'execution_speed',
    group: 'thinking',
    nameVi: 'Tốc Độ Thực Thi',
    nameEn: 'Execution Speed',
    descLow: 'Cẩn thận, suy nghĩ kỹ trước khi hành động, tránh sai sót.',
    descHigh: 'Quyết đoán, hành động nhanh, phù hợp với môi trường yêu cầu tốc độ cao.',
    color: '#F59E0B',
    icon: '⚡',
  },
  {
    id: 'caution',
    group: 'thinking',
    nameVi: 'Thận Trọng / Cẩn Thận',
    nameEn: 'Caution',
    descLow: 'Linh hoạt, chấp nhận rủi ro tính toán, hành động dứt khoát.',
    descHigh: 'Kiểm tra kỹ lưỡng, ít mắc sai sót chi tiết, phù hợp công việc đòi hỏi độ chính xác cao.',
    color: '#6B7280',
    icon: '🔍',
  },

  // ── NHÓM D: GIÁ TRỊ & ĐỊNH HƯỚNG ────────────────────────
  {
    id: 'growth_orientation',
    group: 'values',
    nameVi: 'Định Hướng Phát Triển',
    nameEn: 'Growth Orientation',
    descLow: 'Tập trung vào công việc hiện tại, ít quan tâm đến lộ trình sự nghiệp dài hạn.',
    descHigh: 'Luôn hướng tới cải thiện bản thân và đóng góp vào sự phát triển của tổ chức.',
    color: '#10B981',
    icon: '📈',
  },
  {
    id: 'stability_orientation',
    group: 'values',
    nameVi: 'Định Hướng Ổn Định',
    nameEn: 'Stability Orientation',
    descLow: 'Thích sự thay đổi và đa dạng trong công việc, chịu được môi trường không ổn định.',
    descHigh: 'Coi trọng sự an toàn, môi trường rõ ràng và nhất quán trong công việc.',
    color: '#A78BFA',
    icon: '⚓',
  },
  {
    id: 'social_contribution',
    group: 'values',
    nameVi: 'Đóng Góp Xã Hội',
    nameEn: 'Social Contribution',
    descLow: 'Tập trung vào mục tiêu cá nhân và đội nhóm, ít quan tâm đến tác động xã hội rộng hơn.',
    descHigh: 'Muốn công việc có ý nghĩa xã hội, đóng góp tích cực cho cộng đồng.',
    color: '#34D399',
    icon: '🌱',
  },

  // ── NHÓM E: STRESS TOLERANCE ──────────────────────────────
  {
    id: 'stress_mental',
    group: 'stress',
    nameVi: 'Chịu Đựng Stress Tâm Lý',
    nameEn: 'Mental Stress Tolerance',
    descLow: 'Nhạy cảm với áp lực tinh thần, cần môi trường hỗ trợ và ít xung đột.',
    descHigh: 'Khả năng chịu đựng áp lực tâm lý cao, duy trì hiệu suất trong tình huống khó khăn.',
    color: '#7C3AED',
    icon: '🧘',
  },
  {
    id: 'stress_physical',
    group: 'stress',
    nameVi: 'Chịu Đựng Stress Thể Chất',
    nameEn: 'Physical Stress Tolerance',
    descLow: 'Cần cân bằng giữa công việc và nghỉ ngơi, không phù hợp cường độ làm việc liên tục cao.',
    descHigh: 'Duy trì năng lượng và sức khỏe tốt ngay cả khi làm việc cường độ cao kéo dài.',
    color: '#DC2626',
    icon: '💪',
  },
];

export const GROUP_LABELS: Record<DimensionGroup, { nameVi: string; color: string }> = {
  personality: { nameVi: 'Tính Cách Cơ Bản', color: '#3B82F6' },
  motivation: { nameVi: 'Ý Chí & Động Lực', color: '#EF4444' },
  thinking: { nameVi: 'Tư Duy & Phong Cách', color: '#F59E0B' },
  values: { nameVi: 'Giá Trị & Định Hướng', color: '#10B981' },
  stress: { nameVi: 'Chịu Đựng Stress', color: '#7C3AED' },
};
