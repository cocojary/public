// ============================================================
// DIMENSION DEFINITIONS — Techzen HR Assessment
// Tham chiếu: Big Five / Scouter SS / Stress Research
// ============================================================

export type DimensionGroup = 'personality' | 'motivation' | 'thinking' | 'values' | 'stress' | 'competency' | 'leadership';
// 'leadership' = [INTERNAL ONLY] — ẩn khỏi quiz chính, chỉ dùng đánh giá C-level nội bộ


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
  {
    id: 'adaptability',
    group: 'motivation',
    nameVi: 'Linh Hoạt Thích Nghi',
    nameEn: 'Adaptability',
    descLow: 'Ưu tiên sự ổn định và quy trình rõ ràng, cần thời gian để thích nghi với thay đổi đột ngột.',
    descHigh: 'Chuyển đổi linh hoạt giữa các ngữ cảnh, thích nghi nhanh với thay đổi và xử lý tốt môi trường đa nhiệm.',
    color: '#14B8A6',
    icon: '🔄',
  },
  {
    id: 'grit',
    group: 'motivation',
    nameVi: 'Bền Bỉ (Grit)',
    nameEn: 'Grit',
    descLow: 'Dễ nản lòng khi gặp trở ngại kéo dài, phù hợp với các dự án ngắn hạn và mục tiêu rõ ràng.',
    descHigh: 'Kiên trì theo đuổi mục tiêu dài hạn dù gặp thất bại liên tiếp, không dễ từ bỏ trước nghịch cảnh.',
    color: '#B45309',
    icon: '🏔️',
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
  // ── NHÓM E.B: NĂNG LỰC BỔ TRỢ ──────────────────────────────
  {
    id: 'critical_thinking',
    group: 'competency',
    nameVi: 'Tư Duy Phản Biện',
    nameEn: 'Critical Thinking',
    descLow: 'Dễ dàng chấp nhận thông tin sẵn có mà không đặt câu hỏi hay đào sâu.',
    descHigh: 'Thường xuyên phân tích, đánh giá nhiều chiều trước khi tin tưởng một kết luận.',
    color: '#0284C7',
    icon: '🕵️',
  },
  {
    id: 'communication_clarity',
    group: 'competency',
    nameVi: 'Giao Tiếp Rõ Ràng',
    nameEn: 'Communication Clarity',
    descLow: 'Truyền đạt thông tin đôi khi vòng vo hoặc khiến người nghe khó nắm bắt trọng tâm.',
    descHigh: 'Trình bày ý tưởng ngắn gọn, súc tích và dễ hiểu cho mọi đối tượng.',
    color: '#2DD4BF',
    icon: '💬',
  },
  {
    id: 'time_management',
    group: 'competency',
    nameVi: 'Quản Lý Thời Gian',
    nameEn: 'Time Management',
    descLow: 'Thường xuyên gặp khó khăn trong việc ưu tiên công việc, hay làm việc quá giờ.',
    descHigh: 'Sắp xếp mức độ ưu tiên xuất sắc, luôn hoàn thành đúng hạn mà không quá tải.',
    color: '#EAB308',
    icon: '⏳',
  },
  {
    id: 'data_literacy',
    group: 'competency',
    nameVi: 'Năng Lực Hiểu Dữ Liệu',
    nameEn: 'Data Literacy',
    descLow: 'Ra quyết định chủ yếu dựa trên trực giác, gặp khó khăn khi làm việc với báo cáo số liệu.',
    descHigh: 'Nhạy bén với các con số, dễ dàng đọc hiểu và rút ra quyết định thông minh từ dữ liệu.',
    color: '#3B82F6',
    icon: '📊',
  },

  // ── NHÓM F: NĂNG LỰC LÃNH ĐẠO (C-LEVEL) ──────────────────────────────
  {
    id: 'strategic_vision', group: 'leadership',
    nameVi: 'Tầm Nhìn Chiến Lược', nameEn: 'Strategic Vision',
    descLow: 'Tập trung ngắn hạn, tối ưu hóa hiện diện, tránh rủi ro dài hạn.', descHigh: 'Tư duy dài hạn, sẵn sàng đánh đổi lợi ích trước mắt vì giá trị cốt lõi.', color: '#1E3A8A', icon: '🔭'
  },
  {
    id: 'decision_making', group: 'leadership',
    nameVi: 'Ra Quyết Định', nameEn: 'Decision Making',
    descLow: 'Trì hoãn chờ thông tin hoàn hảo, dựa dẫm vào hội đồng.', descHigh: 'Hành động nhanh dựa trên xác suất, dám mạo hiểm và cam kết kết quả.', color: '#3B82F6', icon: '⚡'
  },
  {
    id: 'ownership', group: 'leadership',
    nameVi: 'Ownership', nameEn: 'Ownership',
    descLow: 'Đẩy trách nhiệm cho cấp dưới hoặc ngoại cảnh khi có sự cố.', descHigh: 'Skin in the game, chịu trách nhiệm cuối cùng bằng tiền bạc & danh dự.', color: '#2563EB', icon: '🛡️'
  },
  {
    id: 'people_leadership', group: 'leadership',
    nameVi: 'Lãnh Đạo Con Người', nameEn: 'People Leadership',
    descLow: 'Can thiệp tiểu tiết (micromanage), yêu cầu phục tùng tuyệt đối.', descHigh: 'Trao quyền, khuyến khích phản biện, dám mạnh tay thay thế.', color: '#60A5FA', icon: '👤'
  },
  {
    id: 'organization_building', group: 'leadership',
    nameVi: 'Xây Dựng Tổ Chức', nameEn: 'Organization Building',
    descLow: 'Phụ thuộc cá nhân xuất sắc, quy trình lỏng lẻo.', descHigh: 'Xây dựng hệ thống tự vận hành, thiết lập các quy trình đóng gói vững chắc.', color: '#93C5FD', icon: '🏗️'
  },
  {
    id: 'performance_management', group: 'leadership',
    nameVi: 'Quản Trị Hiệu Suất', nameEn: 'Performance Management',
    descLow: 'Đánh giá cảm tính, nhạy cảm khi xử lý nhân viên yếu kém.', descHigh: 'Thưởng phạt minh bạch dựa trên dữ liệu, tàn nhẫn với hiệu suất yếu.', color: '#047857', icon: '📈'
  },
  {
    id: 'financial_management', group: 'leadership',
    nameVi: 'Quản Trị Tài Chính', nameEn: 'Financial Management',
    descLow: 'Bơm doanh thu mù quáng, bỏ qua rủi ro thâm hụt dòng tiền.', descHigh: 'Kiểm soát dòng tiền gắt gao, bảo vệ biên lợi nhuận, sẵn sàng từ chối deal rủi ro.', color: '#059669', icon: '💵'
  },
  {
    id: 'customer_partner_management', group: 'leadership',
    nameVi: 'Quản Trị Khách/Đối Tác', nameEn: 'Partner Management',
    descLow: 'Dễ dàng nhượng bộ, che giấu lỗi lầm với khách hàng.', descHigh: 'Minh bạch kể cả tin xấu, hợp tác công bằng, cắt bỏ đối tác vi phạm giá trị lõi.', color: '#10B981', icon: '🤝'
  },
  {
    id: 'executive_communication', group: 'leadership',
    nameVi: 'Giao Tiếp Điều Hành', nameEn: 'Executive Comms',
    descLow: 'Dài dòng, né tránh, truyền đạt cảm tính.', descHigh: 'Ngắn gọn, sắc lẹm, trực diện, không nói giảm nói tránh.', color: '#34D399', icon: '🗣️'
  },
  {
    id: 'change_management', group: 'leadership',
    nameVi: 'Quản Trị Thay Đổi', nameEn: 'Change Management',
    descLow: 'Bảo thủ với thói quen cũ, cả nể công thần.', descHigh: 'Dám đập bỏ hệ thống cũ chắp vá, tàn nhẫn thay thế nhân sự ngáng đường số hóa.', color: '#D97706', icon: '🔄'
  },
  {
    id: 'risk_management', group: 'leadership',
    nameVi: 'Quản Trị Rủi Ro', nameEn: 'Risk Management',
    descLow: 'Biết trước bỏ qua, tư duy nước đến chân mới nhảy.', descHigh: 'Chủ động bỏ chi phí phòng ngừa, tuyệt đối tuân thủ pháp lý và an toàn doanh nghiệp.', color: '#F59E0B', icon: '⚖️'
  },
  {
    id: 'self_discipline', group: 'leadership',
    nameVi: 'Kỷ Luật Cá Nhân', nameEn: 'Self Discipline',
    descLow: 'Thiết lập luật nhưng tự cho mình quyền miễn trừ.', descHigh: 'Đi đầu tự phạt nếu sai, duy trì năng lượng cực kỳ khắt khe mỗi ngày.', color: '#EF4444', icon: '⏱️'
  },
  {
    id: 'continuous_learning', group: 'leadership',
    nameVi: 'Học Hỏi & Phát Triển', nameEn: 'Continuous Learning',
    descLow: 'Giới hạn khả năng tiếp thu, ủy thác hoàn toàn viển vông khoa học.', descHigh: 'Sẵn sàng phủ nhận bản thân để học công nghệ mới, rèn giũa liên tục.', color: '#EC4899', icon: '🧠'
  },
  {
    id: 'pressure_balance', group: 'leadership',
    nameVi: 'Bản Lĩnh Dưới Áp Lực', nameEn: 'Pressure Balance',
    descLow: 'Bị cảm xúc chi phối, thay đổi quyết định để xoa dịu đám đông.', descHigh: 'Lý trí tĩnh lặng giữa giông bão, kiên định chiến lược bất chấp áp lực vây quanh.', color: '#8B5CF6', icon: '🛡️'
  }
];

export const GROUP_LABELS: Record<string, { nameVi: string; color: string; icon: string }> = {
  personality: { nameVi: 'Tính Cách Cơ Bản', color: '#3B82F6', icon: '🧬' },
  motivation:  { nameVi: 'Ý Chí & Động Lực', color: '#EF4444', icon: '🔥' },
  thinking:    { nameVi: 'Tư Duy & Phong Cách', color: '#F59E0B', icon: '🧠' },
  values:      { nameVi: 'Giá Trị & Định Hướng', color: '#10B981', icon: '🌿' },
  stress:      { nameVi: 'Chịu Đựng Áp Lực', color: '#7C3AED', icon: '💪' },
  competency:  { nameVi: 'Năng Lực Bổ Trợ', color: '#06B6D4', icon: '🎯' },
  // leadership: bị ẩn khỏi quiz chính [INTERNAL ONLY]
};

// Chỉ export các DIMENSIONS không phải nhóm leadership (dùng trong scoring quiz chính)
export const ACTIVE_DIMENSIONS = DIMENSIONS.filter(d => d.group !== 'leadership');
