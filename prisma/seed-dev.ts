import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ══════════════════════════════════════════════════════════════
// DATA: 33 DIMENSIONS (20 active + 13 leadership)
// ══════════════════════════════════════════════════════════════
const DIMS = [
  // ── NHÓM A: PERSONALITY ──
  { id: 'extraversion',         group: 'personality', nameVi: 'Hướng Ngoại',              nameEn: 'Extraversion',          descLow: 'Thích làm việc độc lập, cần không gian riêng để nạp lại năng lượng.',           descHigh: 'Năng động, thích giao tiếp và hoạt động nhóm, dễ tạo mối quan hệ.',                                              color: '#3B82F6', icon: '🗣️',  displayOrder: 1  },
  { id: 'agreeableness',        group: 'personality', nameVi: 'Hòa Đồng',                 nameEn: 'Agreeableness',         descLow: 'Thẳng thắn, độc lập trong quyết định, ít bị ảnh hưởng bởi ý kiến người khác.', descHigh: 'Hợp tác tốt, quan tâm người khác, dễ xây dựng lòng tin trong nhóm.',                                              color: '#10B981', icon: '🤝',  displayOrder: 2  },
  { id: 'conscientiousness',    group: 'personality', nameVi: 'Tận Tâm',                  nameEn: 'Conscientiousness',     descLow: 'Linh hoạt, thoải mái với sự thay đổi, không bị ràng buộc bởi quy trình cứng nhắc.', descHigh: 'Kỷ luật cao, có tổ chức, đáng tin cậy, hoàn thành tốt công việc được giao.',                                      color: '#6366F1', icon: '✅',  displayOrder: 3  },
  { id: 'openness',             group: 'personality', nameVi: 'Cởi Mở',                   nameEn: 'Openness',              descLow: 'Thực dụng, ưa ổn định, tin vào những phương pháp đã được kiểm chứng.',           descHigh: 'Sáng tạo, tò mò, sẵn sàng thử nghiệm ý tưởng mới và cách tiếp cận khác biệt.',                                     color: '#F59E0B', icon: '💡',  displayOrder: 4  },
  { id: 'emotional_stability',  group: 'personality', nameVi: 'Ổn Định Cảm Xúc',          nameEn: 'Emotional Stability',   descLow: 'Nhạy cảm với môi trường xung quanh, cần hỗ trợ tâm lý trong giai đoạn áp lực.',  descHigh: 'Bình tĩnh, kiên định trước thách thức, ít bị xáo trộn bởi tình huống tiêu cực.',                                    color: '#8B5CF6', icon: '⚖️',  displayOrder: 5  },
  // ── NHÓM B: MOTIVATION ──
  { id: 'achievement_drive',    group: 'motivation',  nameVi: 'Khát Vọng Thành Tích',     nameEn: 'Achievement Drive',     descLow: 'Hài lòng với hiện tại, không đặt áp lực lên bản thân về kết quả.',              descHigh: 'Luôn đặt mục tiêu cao, mong muốn vượt qua giới hạn bản thân liên tục.',                                             color: '#EF4444', icon: '🏆',  displayOrder: 6  },
  { id: 'challenge_spirit',     group: 'motivation',  nameVi: 'Tinh Thần Thách Thức',     nameEn: 'Challenge Spirit',      descLow: 'Thích ổn định và có thể dự đoán, tránh rủi ro không cần thiết.',                descHigh: 'Chủ động tìm kiếm thử thách mới, không nản lòng trước thất bại.',                                                    color: '#F97316', icon: '🔥',  displayOrder: 7  },
  { id: 'autonomy',             group: 'motivation',  nameVi: 'Tự Chủ',                   nameEn: 'Autonomy',              descLow: 'Làm việc tốt trong môi trường có hướng dẫn rõ ràng và cấu trúc chặt chẽ.',    descHigh: 'Chủ động cao, có khả năng tự định hướng và ra quyết định độc lập.',                                                  color: '#EC4899', icon: '🦅',  displayOrder: 8  },
  { id: 'learning_curiosity',   group: 'motivation',  nameVi: 'Ham Học Hỏi',               nameEn: 'Learning Curiosity',   descLow: 'Tập trung vào công việc hiện tại, ít dành thời gian cho việc tự học thêm.',    descHigh: 'Luôn tìm kiếm kiến thức mới, chủ động học ngoài giờ làm việc.',                                                      color: '#06B6D4', icon: '📚',  displayOrder: 9  },
  { id: 'recognition_need',     group: 'motivation',  nameVi: 'Nhu Cầu Được Công Nhận',   nameEn: 'Recognition Need',      descLow: 'Không phụ thuộc vào lời khen, tự đánh giá kết quả của bản thân.',              descHigh: 'Động lực lớn khi được ghi nhận công khai, phù hợp với môi trường có feedback thường xuyên.', color: '#84CC16', icon: '⭐', displayOrder: 10 },
  // ── NHÓM C: THINKING ──
  { id: 'logical_thinking',     group: 'thinking',    nameVi: 'Tư Duy Logic',              nameEn: 'Logical Thinking',      descLow: 'Thiên về cảm tính và trực quan, đưa ra quyết định dựa trên kinh nghiệm.',      descHigh: 'Phân tích có hệ thống, dựa trên dữ liệu, giỏi giải quyết vấn đề phức tạp.',                                        color: '#0EA5E9', icon: '🧠',  displayOrder: 11 },
  { id: 'empathy',              group: 'thinking',    nameVi: 'Đồng Cảm / EQ',             nameEn: 'Empathy',              descLow: 'Tập trung vào nhiệm vụ và kết quả, ít chú trọng đến cảm xúc trong giao tiếp.', descHigh: 'Nhạy bén với cảm xúc người khác, giao tiếp hiệu quả và xây dựng quan hệ tốt.',                                      color: '#F472B6', icon: '💗',  displayOrder: 12 },
  { id: 'execution_speed',      group: 'thinking',    nameVi: 'Tốc Độ Thực Thi',           nameEn: 'Execution Speed',       descLow: 'Cẩn thận, suy nghĩ kỹ trước khi hành động, tránh sai sót.',                   descHigh: 'Quyết đoán, hành động nhanh, phù hợp với môi trường yêu cầu tốc độ cao.',                                           color: '#F59E0B', icon: '⚡',  displayOrder: 13 },
  { id: 'caution',              group: 'thinking',    nameVi: 'Thận Trọng / Cẩn Thận',     nameEn: 'Caution',              descLow: 'Linh hoạt, chấp nhận rủi ro tính toán, hành động dứt khoát.',                  descHigh: 'Kiểm tra kỹ lưỡng, ít mắc sai sót chi tiết, phù hợp công việc đòi hỏi độ chính xác cao.', color: '#6B7280', icon: '🔍', displayOrder: 14 },
  // ── NHÓM D: VALUES ──
  { id: 'growth_orientation',   group: 'values',      nameVi: 'Định Hướng Phát Triển',     nameEn: 'Growth Orientation',    descLow: 'Tập trung vào công việc hiện tại, ít quan tâm đến lộ trình sự nghiệp dài hạn.', descHigh: 'Luôn hướng tới cải thiện bản thân và đóng góp vào sự phát triển của tổ chức.',                                     color: '#10B981', icon: '📈',  displayOrder: 15 },
  { id: 'stability_orientation',group: 'values',      nameVi: 'Định Hướng Ổn Định',        nameEn: 'Stability Orientation', descLow: 'Thích sự thay đổi và đa dạng trong công việc, chịu được môi trường không ổn định.', descHigh: 'Coi trọng sự an toàn, môi trường rõ ràng và nhất quán trong công việc.',                                          color: '#A78BFA', icon: '⚓',  displayOrder: 16 },
  { id: 'social_contribution',  group: 'values',      nameVi: 'Đóng Góp Xã Hội',           nameEn: 'Social Contribution',   descLow: 'Tập trung vào mục tiêu cá nhân và đội nhóm, ít quan tâm đến tác động xã hội.', descHigh: 'Muốn công việc có ý nghĩa xã hội, đóng góp tích cực cho cộng đồng.',                                                color: '#34D399', icon: '🌱',  displayOrder: 17 },
  // ── NHÓM E: STRESS ──
  { id: 'stress_mental',        group: 'stress',      nameVi: 'Chịu Đựng Stress Tâm Lý',   nameEn: 'Mental Stress Tolerance', descLow: 'Nhạy cảm với áp lực tinh thần, cần môi trường hỗ trợ và ít xung đột.',       descHigh: 'Khả năng chịu đựng áp lực tâm lý cao, duy trì hiệu suất trong tình huống khó khăn.',                                color: '#7C3AED', icon: '🧘',  displayOrder: 18 },
  { id: 'stress_physical',      group: 'stress',      nameVi: 'Chịu Đựng Stress Thể Chất', nameEn: 'Physical Stress Tolerance', descLow: 'Cần cân bằng giữa công việc và nghỉ ngơi, không phù hợp cường độ cao kéo dài.', descHigh: 'Duy trì năng lượng và sức khỏe tốt ngay cả khi làm việc cường độ cao kéo dài.',                                  color: '#DC2626', icon: '💪',  displayOrder: 19 },
  // ── NHÓM E.B: COMPETENCY ──
  { id: 'critical_thinking',    group: 'competency',  nameVi: 'Tư Duy Phản Biện',          nameEn: 'Critical Thinking',    descLow: 'Dễ dàng chấp nhận thông tin sẵn có mà không đặt câu hỏi hay đào sâu.',         descHigh: 'Thường xuyên phân tích, đánh giá nhiều chiều trước khi tin tưởng một kết luận.',                                     color: '#0284C7', icon: '🕵️', displayOrder: 20 },
  { id: 'communication_clarity', group: 'competency', nameVi: 'Giao Tiếp Rõ Ràng',           nameEn: 'Communication Clarity', descLow: 'Truyền đạt thông tin đôi khi vòng vo hoặc khiến người nghe khó nắm bắt trọng tâm.', descHigh: 'Trình bày ý tưởng ngắn gọn, súc tích và dễ hiểu cho mọi đối tượng.',           color: '#2DD4BF', icon: '💬', displayOrder: 34 },
  { id: 'time_management',       group: 'competency', nameVi: 'Quản Lý Thời Gian',            nameEn: 'Time Management',       descLow: 'Thường xuyên gặp khó khăn trong việc ưu tiên công việc, hay làm việc quá giờ.',   descHigh: 'Sắp xếp mức độ ưu tiên xuất sắc, luôn hoàn thành đúng hạn mà không quá tải.',   color: '#EAB308', icon: '⏳', displayOrder: 35 },
  { id: 'data_literacy',         group: 'competency', nameVi: 'Năng Lực Hiểu Dữ Liệu',       nameEn: 'Data Literacy',         descLow: 'Ra quyết định chủ yếu dựa trên trực giác, gặp khó khăn khi làm việc với báo cáo số liệu.', descHigh: 'Nhạy bén với các con số, dễ dàng đọc hiểu và rút ra quyết định thông minh từ dữ liệu.', color: '#3B82F6', icon: '📊', displayOrder: 36 },
  // ── NHÓM G: ADAPTABILITY & GRIT (VUCA Dimensions) ──
  { id: 'adaptability',          group: 'motivation', nameVi: 'Khả Năng Thích Nghi',          nameEn: 'Adaptability',          descLow: 'Gặp khó khăn khi môi trường thay đổi đột ngột, cần thời gian dài để điều chỉnh.', descHigh: 'Linh hoạt cao, nhanh chóng điều chỉnh tư duy và hành động trong môi trường biến động.',                              color: '#06B6D4', icon: '🌊', displayOrder: 37 },
  { id: 'grit',                  group: 'motivation', nameVi: 'Bền Bỉ / Ý Chí',              nameEn: 'Grit',                  descLow: 'Dễ mất kiên nhẫn hoặc từ bỏ mục tiêu khi gặp trở ngại lớn hay tiến độ chậm.', descHigh: 'Duy trì đam mê và sự kiên trì với mục tiêu dài hạn bất chấp thất bại và khó khăn.', color: '#DC2626', icon: '🔩', displayOrder: 38 },
  // ── NHÓM F: LEADERSHIP (INTERNAL ONLY) ──
  { id: 'strategic_vision',          group: 'leadership', nameVi: 'Tầm Nhìn Chiến Lược',     nameEn: 'Strategic Vision',         descLow: 'Tập trung ngắn hạn.', descHigh: 'Tư duy dài hạn.', color: '#1E3A8A', icon: '🔭', displayOrder: 21 },
  { id: 'decision_making',           group: 'leadership', nameVi: 'Ra Quyết Định',            nameEn: 'Decision Making',          descLow: 'Trì hoãn.',           descHigh: 'Hành động nhanh.', color: '#3B82F6', icon: '⚡', displayOrder: 22 },
  { id: 'ownership',                 group: 'leadership', nameVi: 'Ownership',                nameEn: 'Ownership',                descLow: 'Đẩy trách nhiệm.',    descHigh: 'Chịu trách nhiệm.', color: '#2563EB', icon: '🛡️', displayOrder: 23 },
  { id: 'people_leadership',         group: 'leadership', nameVi: 'Lãnh Đạo Con Người',       nameEn: 'People Leadership',        descLow: 'Micromanage.',        descHigh: 'Trao quyền.', color: '#60A5FA', icon: '👤', displayOrder: 24 },
  { id: 'organization_building',     group: 'leadership', nameVi: 'Xây Dựng Tổ Chức',        nameEn: 'Organization Building',    descLow: 'Phụ thuộc cá nhân.',  descHigh: 'Hệ thống tự vận hành.', color: '#93C5FD', icon: '🏗️', displayOrder: 25 },
  { id: 'performance_management',    group: 'leadership', nameVi: 'Quản Trị Hiệu Suất',       nameEn: 'Performance Management',   descLow: 'Đánh giá cảm tính.',  descHigh: 'Dữ liệu minh bạch.', color: '#047857', icon: '📈', displayOrder: 26 },
  { id: 'financial_management',      group: 'leadership', nameVi: 'Quản Trị Tài Chính',       nameEn: 'Financial Management',     descLow: 'Bơm doanh thu mù.',   descHigh: 'Kiểm soát dòng tiền.', color: '#059669', icon: '💵', displayOrder: 27 },
  { id: 'customer_partner_management', group: 'leadership', nameVi: 'Quản Trị Khách/Đối Tác', nameEn: 'Partner Management',      descLow: 'Dễ nhượng bộ.',       descHigh: 'Minh bạch kể cả tin xấu.', color: '#10B981', icon: '🤝', displayOrder: 28 },
  { id: 'executive_communication',   group: 'leadership', nameVi: 'Giao Tiếp Điều Hành',      nameEn: 'Executive Comms',         descLow: 'Dài dòng.',           descHigh: 'Ngắn gọn, sắc lẹm.', color: '#34D399', icon: '🗣️', displayOrder: 29 },
  { id: 'change_management',         group: 'leadership', nameVi: 'Quản Trị Thay Đổi',        nameEn: 'Change Management',        descLow: 'Bảo thủ.',            descHigh: 'Dám đập bỏ cũ.', color: '#D97706', icon: '🔄', displayOrder: 30 },
  { id: 'risk_management',           group: 'leadership', nameVi: 'Quản Trị Rủi Ro',          nameEn: 'Risk Management',          descLow: 'Nước đến chân mới nhảy.', descHigh: 'Chủ động phòng ngừa.', color: '#F59E0B', icon: '⚖️', displayOrder: 31 },
  { id: 'self_discipline',           group: 'leadership', nameVi: 'Kỷ Luật Cá Nhân',          nameEn: 'Self Discipline',          descLow: 'Miễn trừ cho bản thân.', descHigh: 'Tự phạt nếu sai.', color: '#EF4444', icon: '⏱️', displayOrder: 32 },
  { id: 'continuous_learning',       group: 'leadership', nameVi: 'Học Hỏi & Phát Triển',    nameEn: 'Continuous Learning',      descLow: 'Giới hạn tiếp thu.',  descHigh: 'Phủ nhận bản thân để học mới.', color: '#EC4899', icon: '🧠', displayOrder: 33 },
  // lie_scale dimension — internal
  { id: 'lie_scale', group: 'competency', nameVi: 'Thang Đo Trung Thực', nameEn: 'Lie Scale', descLow: 'Có xu hướng tô hồng câu trả lời.', descHigh: 'Trả lời trung thực.', color: '#94A3B8', icon: '🎭', displayOrder: 99, isActive: false },
];

// ══════════════════════════════════════════════════════════════
// DATA: CROSS-DIMENSION RELATIONS (4 cặp mâu thuẫn tâm lý)
// ══════════════════════════════════════════════════════════════
const DIM_RELATIONS = [
  {
    dimensionIdA: 'extraversion', dimensionIdB: 'autonomy',
    thresholdAMin: 4.0, thresholdBMax: 2.5,
    description: 'Hướng ngoại dẫn dắt nhóm mà cần guide từng bước — mâu thuẫn (Big Five Agency Theory)',
  },
  {
    dimensionIdA: 'achievement_drive', dimensionIdB: 'stability_orientation',
    thresholdAMin: 4.2, thresholdBMin: 4.2,
    description: 'Tham vọng cao XÀ ưu tiên ổn định tuyệt đối — mâu thuẫn về động lực (FFM Research)',
  },
  {
    dimensionIdA: 'challenge_spirit', dimensionIdB: 'emotional_stability',
    thresholdAMin: 4.2, thresholdBMax: 2.0,
    description: 'Thích thách thức cao mà ổn định cảm xúc rất thấp — ít gặp, dấu hiệu bất nhất',
  },
  {
    dimensionIdA: 'learning_curiosity', dimensionIdB: 'openness',
    thresholdAMin: 4.2, thresholdBMax: 2.0,
    description: 'Ham học hỏi nhưng kín cởi với ý tưởng mới — mâu thuẫn nhận thức (Openness-Intellect Facet)',
  },
];

// ══════════════════════════════════════════════════════════════
// DATA: 132 QUESTIONS (120 main + 12 lie)
// ══════════════════════════════════════════════════════════════
const MAIN_QUESTIONS = [
  // ── EXTRAVERSION ──
  { legacyId: 1,   dimId: 'extraversion',         type: 'main', reversed: false, text: 'Tôi thích tham gia các buổi gặp gỡ, sự kiện và tụ họp đông người.' },
  { legacyId: 2,   dimId: 'extraversion',         type: 'main', reversed: false, text: 'Tôi dễ dàng bắt đầu cuộc trò chuyện với người mà tôi chưa quen.' },
  { legacyId: 3,   dimId: 'extraversion',         type: 'main', reversed: false, text: 'Tôi cảm thấy tràn đầy năng lượng sau khi làm việc với nhiều người.' },
  { legacyId: 4,   dimId: 'extraversion',         type: 'main', reversed: false, text: 'Tôi thường là người nói chuyện nhiều và dẫn dắt nhóm.' },
  { legacyId: 5,   dimId: 'extraversion',         type: 'main', reversed: true,  text: 'Sau một ngày tiếp xúc với nhiều người, tôi cảm thấy mệt mỏi và cần thời gian một mình.' },
  { legacyId: 6,   dimId: 'extraversion',         type: 'main', reversed: true,  text: 'Tôi thích làm việc độc lập hơn là phối hợp liên tục với nhiều người.' },
  // ── AGREEABLENESS ──
  { legacyId: 9,   dimId: 'agreeableness',        type: 'main', reversed: false, text: 'Tôi sẵn sàng giúp đỡ đồng nghiệp dù điều đó ảnh hưởng đến thời gian của mình.' },
  { legacyId: 10,  dimId: 'agreeableness',        type: 'main', reversed: false, text: 'Tôi cố gắng hiểu quan điểm của người khác trước khi đưa ra phán xét.' },
  { legacyId: 12,  dimId: 'agreeableness',        type: 'main', reversed: false, text: 'Tôi thường nhường bộ trong tranh luận để giữ hòa khí.' },
  { legacyId: 13,  dimId: 'agreeableness',        type: 'main', reversed: true,  text: 'Tôi thẳng thắn nói quan điểm ngay cả khi biết người khác sẽ không thích.' },
  { legacyId: 14,  dimId: 'agreeableness',        type: 'main', reversed: true,  text: 'Tôi ưu tiên kết quả công việc hơn là cảm xúc của mọi người trong nhóm.' },
  { legacyId: 15,  dimId: 'agreeableness',        type: 'main', reversed: true,  text: 'Trong xung đột, tôi thường giữ vững lập trường của mình đến cùng.' },
  // ── CONSCIENTIOUSNESS ──
  { legacyId: 17,  dimId: 'conscientiousness',    type: 'main', reversed: false, text: 'Tôi luôn lập kế hoạch cụ thể trước khi bắt đầu một công việc quan trọng.' },
  { legacyId: 18,  dimId: 'conscientiousness',    type: 'main', reversed: false, text: 'Tôi hoàn thành công việc đúng deadline dù gặp khó khăn.' },
  { legacyId: 19,  dimId: 'conscientiousness',    type: 'main', reversed: false, text: 'Tôi giữ gìn không gian làm việc và tài liệu của mình ngăn nắp, có tổ chức.' },
  { legacyId: 20,  dimId: 'conscientiousness',    type: 'main', reversed: false, text: 'Tôi tuân thủ các quy định và quy trình của tổ chức một cách nhất quán.' },
  { legacyId: 21,  dimId: 'conscientiousness',    type: 'main', reversed: true,  text: 'Tôi hay trì hoãn công việc và thường hoàn thành vào phút cuối.' },
  { legacyId: 23,  dimId: 'conscientiousness',    type: 'main', reversed: true,  text: 'Tôi hay bắt đầu nhiều việc cùng lúc nhưng không hoàn thành đến nơi đến chốn.' },
  // ── OPENNESS ──
  { legacyId: 25,  dimId: 'openness',             type: 'main', reversed: false, text: 'Tôi thích khám phá những ý tưởng và cách tiếp cận hoàn toàn mới.' },
  { legacyId: 26,  dimId: 'openness',             type: 'main', reversed: false, text: 'Tôi thường nghĩ ra những cách giải quyết sáng tạo cho vấn đề quen thuộc.' },
  { legacyId: 27,  dimId: 'openness',             type: 'main', reversed: false, text: 'Tôi sẵn sàng thay đổi quan điểm khi có bằng chứng thuyết phục.' },
  { legacyId: 28,  dimId: 'openness',             type: 'main', reversed: false, text: 'Tôi đọc nhiều và quan tâm đến nhiều chủ đề đa dạng ngoài công việc.' },
  { legacyId: 29,  dimId: 'openness',             type: 'main', reversed: true,  text: 'Tôi thích dùng các phương pháp đã được kiểm chứng hơn là thử nghiệm cái mới.' },
  { legacyId: 30,  dimId: 'openness',             type: 'main', reversed: true,  text: 'Tôi cảm thấy không thoải mái khi mọi thứ thay đổi quá nhiều và quá nhanh.' },
  // ── EMOTIONAL STABILITY ──
  { legacyId: 32,  dimId: 'emotional_stability',  type: 'main', reversed: false, text: 'Tôi giữ được bình tĩnh trong các tình huống áp lực cao.' },
  { legacyId: 33,  dimId: 'emotional_stability',  type: 'main', reversed: false, text: 'Tôi ít bị ảnh hưởng bởi lời chỉ trích hay phê phán từ người khác.' },
  { legacyId: 34,  dimId: 'emotional_stability',  type: 'main', reversed: false, text: 'Tôi nhanh chóng lấy lại tinh thần sau khi gặp thất bại hay thất vọng.' },
  { legacyId: 35,  dimId: 'emotional_stability',  type: 'main', reversed: false, text: 'Tôi có thể kiểm soát cảm xúc ngay cả trong những tranh luận gay gắt.' },
  { legacyId: 36,  dimId: 'emotional_stability',  type: 'main', reversed: true,  text: 'Tôi hay lo lắng về những điều có thể xảy ra không tốt trong tương lai.' },
  { legacyId: 37,  dimId: 'emotional_stability',  type: 'main', reversed: true,  text: 'Tôi dễ bị ảnh hưởng bởi bầu không khí tiêu cực hoặc căng thẳng trong nhóm.' },
  // ── ACHIEVEMENT DRIVE ──
  { legacyId: 39,  dimId: 'achievement_drive',    type: 'main', reversed: false, text: 'Tôi luôn đặt ra mục tiêu cao hơn so với yêu cầu tối thiểu được giao.' },
  { legacyId: 40,  dimId: 'achievement_drive',    type: 'main', reversed: false, text: 'Tôi cảm thấy buồn và không hài lòng khi không đạt được kết quả tốt nhất.' },
  { legacyId: 41,  dimId: 'achievement_drive',    type: 'main', reversed: false, text: 'Khi đạt được mục tiêu, tôi ngay lập tức đặt ra mục tiêu tiếp theo cao hơn.' },
  { legacyId: 42,  dimId: 'achievement_drive',    type: 'main', reversed: false, text: 'Tôi muốn là người giỏi nhất trong lĩnh vực chuyên môn của mình.' },
  { legacyId: 43,  dimId: 'achievement_drive',    type: 'main', reversed: true,  text: 'Tôi hài lòng với việc hoàn thành công việc ở mức "đủ tốt" mà không cần xuất sắc.' },
  { legacyId: 44,  dimId: 'achievement_drive',    type: 'main', reversed: true,  text: 'Tôi không đặt áp lực lớn cho bản thân về thành tích hay kết quả.' },
  // ── CHALLENGE SPIRIT ──
  { legacyId: 46,  dimId: 'challenge_spirit',     type: 'main', reversed: false, text: 'Tôi chủ động tham gia vào các dự án khó và nhiều thách thức.' },
  { legacyId: 47,  dimId: 'challenge_spirit',     type: 'main', reversed: false, text: 'Khi thất bại, tôi phân tích nguyên nhân và thử lại theo cách khác.' },
  { legacyId: 48,  dimId: 'challenge_spirit',     type: 'main', reversed: false, text: 'Tôi cảm thấy hứng khởi khi đối mặt với vấn đề chưa có lời giải.' },
  { legacyId: 49,  dimId: 'challenge_spirit',     type: 'main', reversed: false, text: 'Tôi sẵn sàng học kỹ năng hoàn toàn mới dù ban đầu rất khó.' },
  { legacyId: 50,  dimId: 'challenge_spirit',     type: 'main', reversed: true,  text: 'Tôi thích tránh những tình huống có nhiều rủi ro thất bại.' },
  { legacyId: 51,  dimId: 'challenge_spirit',     type: 'main', reversed: true,  text: 'Tôi ngại nhận công việc khi chưa chắc mình có thể làm tốt.' },
  // ── AUTONOMY ──
  { legacyId: 52,  dimId: 'autonomy',             type: 'main', reversed: false, text: 'Tôi tự xác định phương pháp làm việc mà không cần chờ hướng dẫn chi tiết.' },
  { legacyId: 53,  dimId: 'autonomy',             type: 'main', reversed: false, text: 'Tôi chủ động giải quyết vấn đề thay vì chờ đợi quyết định từ cấp trên.' },
  { legacyId: 54,  dimId: 'autonomy',             type: 'main', reversed: false, text: 'Tôi cảm thấy tốt hơn khi được giao mục tiêu rõ ràng mà không bị kiểm soát từng bước.' },
  { legacyId: 55,  dimId: 'autonomy',             type: 'main', reversed: false, text: 'Tôi đề xuất cải tiến quy trình dù không ai yêu cầu.' },
  { legacyId: 56,  dimId: 'autonomy',             type: 'main', reversed: true,  text: 'Tôi cần người hướng dẫn từng bước để hoàn thành công việc một cách tốt nhất.' },
  { legacyId: 57,  dimId: 'autonomy',             type: 'main', reversed: true,  text: 'Tôi thích được kiểm tra và phê duyệt thường xuyên trong quá trình làm việc.' },
  // ── LEARNING CURIOSITY ──
  { legacyId: 58,  dimId: 'learning_curiosity',   type: 'main', reversed: false, text: 'Tôi dành thời gian tự học các kỹ năng mới ngoài công việc hàng ngày.' },
  { legacyId: 59,  dimId: 'learning_curiosity',   type: 'main', reversed: false, text: 'Tôi thường xuyên đọc sách, bài viết, hoặc nghe podcast về lĩnh vực chuyên môn.' },
  { legacyId: 60,  dimId: 'learning_curiosity',   type: 'main', reversed: false, text: 'Tôi đặt câu hỏi nhiều và tìm kiếm sự hiểu biết sâu hơn về mọi vấn đề.' },
  { legacyId: 61,  dimId: 'learning_curiosity',   type: 'main', reversed: false, text: 'Tôi chủ động tìm kiếm phản hồi từ người khác để cải thiện bản thân.' },
  { legacyId: 62,  dimId: 'learning_curiosity',   type: 'main', reversed: true,  text: 'Tôi ít quan tâm đến các xu hướng và kiến thức mới trong lĩnh vực của mình.' },
  { legacyId: 63,  dimId: 'learning_curiosity',   type: 'main', reversed: true,  text: 'Tôi cảm thấy những kỹ năng hiện tại đã đủ và không cần học thêm.' },
  // ── RECOGNITION NEED ──
  { legacyId: 64,  dimId: 'recognition_need',     type: 'main', reversed: false, text: 'Tôi cảm thấy có động lực hơn đáng kể khi được công nhận công khai.' },
  { legacyId: 65,  dimId: 'recognition_need',     type: 'main', reversed: false, text: 'Lời khen từ cấp trên hoặc đồng nghiệp có ý nghĩa lớn với tôi.' },
  { legacyId: 66,  dimId: 'recognition_need',     type: 'main', reversed: false, text: 'Tôi cảm thấy khó chịu khi đóng góp của mình không được ai ghi nhận.' },
  { legacyId: 67,  dimId: 'recognition_need',     type: 'main', reversed: true,  text: 'Tôi làm tốt công việc ngay cả khi không ai biết hoặc ghi nhận.' },
  { legacyId: 68,  dimId: 'recognition_need',     type: 'main', reversed: true,  text: 'Tôi không cần lời khen để duy trì động lực làm việc.' },
  { legacyId: 150, dimId: 'recognition_need',     type: 'main', reversed: false, text: 'Khi được công nhận trước tập thể, tôi cảm thấy muốn cố gắng nhiều hơn.' },
  // ── LOGICAL THINKING ──
  { legacyId: 69,  dimId: 'logical_thinking',     type: 'main', reversed: false, text: 'Tôi phân tích nguyên nhân gốc rễ khi gặp vấn đề thay vì xử lý triệu chứng bề mặt.' },
  { legacyId: 70,  dimId: 'logical_thinking',     type: 'main', reversed: false, text: 'Tôi đưa ra quyết định dựa trên dữ liệu và bằng chứng cụ thể.' },
  { legacyId: 71,  dimId: 'logical_thinking',     type: 'main', reversed: false, text: 'Tôi thích xây dựng kế hoạch có cấu trúc rõ ràng với các bước cụ thể.' },
  { legacyId: 72,  dimId: 'logical_thinking',     type: 'main', reversed: false, text: 'Tôi dễ dàng nhận ra mâu thuẫn hoặc lỗ hổng trong lập luận của người khác.' },
  { legacyId: 74,  dimId: 'logical_thinking',     type: 'main', reversed: true,  text: 'Tôi thường quyết định theo trực giác hơn là phân tích kỹ.' },
  { legacyId: 158, dimId: 'logical_thinking',     type: 'main', reversed: true,  text: 'Tôi thường đưa ra kết luận dựa trên cảm giác hơn là phân tích có hệ thống.' },
  // ── EMPATHY ──
  { legacyId: 76,  dimId: 'empathy',              type: 'main', reversed: false, text: 'Tôi dễ dàng nhận ra khi đồng nghiệp đang có vấn đề về cảm xúc.' },
  { legacyId: 77,  dimId: 'empathy',              type: 'main', reversed: false, text: 'Tôi điều chỉnh cách giao tiếp tùy theo tâm trạng và đặc điểm của từng người.' },
  { legacyId: 78,  dimId: 'empathy',              type: 'main', reversed: false, text: 'Khi nghe ai đó chia sẻ vấn đề, tôi thực sự cảm nhận được cảm xúc của họ.' },
  { legacyId: 79,  dimId: 'empathy',              type: 'main', reversed: false, text: 'Tôi quan tâm đến sự thoải mái của mọi người trước khi đi vào nội dung chính.' },
  { legacyId: 80,  dimId: 'empathy',              type: 'main', reversed: true,  text: 'Tôi khó hiểu tại sao người khác lại cảm thấy buồn hay thất vọng về những điều nhỏ.' },
  { legacyId: 81,  dimId: 'empathy',              type: 'main', reversed: true,  text: 'Tôi thường bỏ qua cảm xúc trong nhóm để tập trung vào kết quả công việc.' },
  // ── EXECUTION SPEED ──
  { legacyId: 82,  dimId: 'execution_speed',      type: 'main', reversed: false, text: 'Tôi hành động nhanh chóng khi có cơ hội, không chờ đến khi mọi thứ hoàn hảo.' },
  { legacyId: 83,  dimId: 'execution_speed',      type: 'main', reversed: false, text: 'Tôi đưa ra quyết định nhanh ngay cả khi thông tin chưa đầy đủ.' },
  { legacyId: 84,  dimId: 'execution_speed',      type: 'main', reversed: false, text: 'Tôi thích hoàn thành nhanh và điều chỉnh sau hơn là chuẩn bị kỹ rồi mới làm.' },
  { legacyId: 85,  dimId: 'execution_speed',      type: 'main', reversed: true,  text: 'Tôi cần thời gian suy nghĩ kỹ trước khi cam kết với bất kỳ quyết định quan trọng nào.' },
  { legacyId: 86,  dimId: 'execution_speed',      type: 'main', reversed: true,  text: 'Tôi thường trì hoãn hành động để thu thập đủ thông tin trước.' },
  { legacyId: 151, dimId: 'execution_speed',      type: 'main', reversed: false, text: 'Khi gặp tình huống bất ngờ, tôi thích ứng và hành động ngay thay vì dừng lại phân tích.' },
  // ── CAUTION ──
  { legacyId: 87,  dimId: 'caution',              type: 'main', reversed: false, text: 'Tôi kiểm tra kỹ công việc ít nhất một lần trước khi gửi đi.' },
  { legacyId: 88,  dimId: 'caution',              type: 'main', reversed: false, text: 'Tôi đọc kỹ hướng dẫn và tài liệu trước khi bắt tay vào thực hiện.' },
  { legacyId: 89,  dimId: 'caution',              type: 'main', reversed: false, text: 'Tôi thường phát hiện lỗi sai trong tài liệu hoặc báo cáo của người khác.' },
  { legacyId: 90,  dimId: 'caution',              type: 'main', reversed: true,  text: 'Tôi hay bỏ sót chi tiết khi làm việc dưới áp lực thời gian.' },
  { legacyId: 91,  dimId: 'caution',              type: 'main', reversed: true,  text: 'Tôi ít khi đọc lại kết quả trước khi gửi đi.' },
  { legacyId: 152, dimId: 'caution',              type: 'main', reversed: false, text: 'Tôi thường đặt câu hỏi kiểm tra lại giả định của mình trước khi đưa ra kết luận cuối.' },
  // ── GROWTH ORIENTATION ──
  { legacyId: 92,  dimId: 'growth_orientation',   type: 'main', reversed: false, text: 'Tôi muốn công việc giúp tôi phát triển và trở nên giỏi hơn mỗi ngày.' },
  { legacyId: 93,  dimId: 'growth_orientation',   type: 'main', reversed: false, text: 'Tôi xây dựng lộ trình sự nghiệp dài hạn và theo đuổi có kế hoạch.' },
  { legacyId: 94,  dimId: 'growth_orientation',   type: 'main', reversed: false, text: 'Tôi tìm kiếm cơ hội học hỏi từ những người giỏi hơn mình.' },
  { legacyId: 95,  dimId: 'growth_orientation',   type: 'main', reversed: true,  text: 'Tôi không quan tâm nhiều đến việc thăng tiến hay mở rộng trách nhiệm.' },
  { legacyId: 96,  dimId: 'growth_orientation',   type: 'main', reversed: true,  text: 'Tôi hài lòng với vị trí và công việc hiện tại, không muốn thay đổi nhiều.' },
  { legacyId: 153, dimId: 'growth_orientation',   type: 'main', reversed: false, text: 'Tôi chủ động tìm kiếm cơ hội đảm nhận thêm trách nhiệm mới dù chưa được yêu cầu.' },
  // ── STABILITY ORIENTATION ──
  { legacyId: 97,  dimId: 'stability_orientation',type: 'main', reversed: false, text: 'Sự ổn định trong công việc và thu nhập quan trọng hơn cơ hội rủi ro cao.' },
  { legacyId: 98,  dimId: 'stability_orientation',type: 'main', reversed: false, text: 'Tôi thích có quy trình và quy định rõ ràng để làm theo.' },
  { legacyId: 99,  dimId: 'stability_orientation',type: 'main', reversed: false, text: 'Tôi ưu tiên an toàn công việc dài hạn hơn mức lương cao nhưng bấp bênh.' },
  { legacyId: 100, dimId: 'stability_orientation',type: 'main', reversed: true,  text: 'Tôi không ngại thay đổi công việc hoặc tổ chức thường xuyên.' },
  { legacyId: 101, dimId: 'stability_orientation',type: 'main', reversed: true,  text: 'Tôi thích môi trường làm việc linh hoạt và thay đổi liên tục.' },
  { legacyId: 154, dimId: 'stability_orientation',type: 'main', reversed: false, text: 'Tôi lo lắng khi tổ chức thay đổi cơ cấu hoặc quy trình làm việc quá thường xuyên.' },
  // ── SOCIAL CONTRIBUTION ──
  { legacyId: 102, dimId: 'social_contribution',  type: 'main', reversed: false, text: 'Tôi muốn công việc của mình tạo ra tác động tích cực cho xã hội.' },
  { legacyId: 103, dimId: 'social_contribution',  type: 'main', reversed: false, text: 'Tôi cảm thấy ý nghĩa hơn khi biết công việc mình làm giúp ích cho cộng đồng.' },
  { legacyId: 104, dimId: 'social_contribution',  type: 'main', reversed: false, text: 'Tôi tham gia các hoạt động tình nguyện hoặc hỗ trợ cộng đồng khi có cơ hội.' },
  { legacyId: 105, dimId: 'social_contribution',  type: 'main', reversed: true,  text: 'Tôi ưu tiên lợi ích kinh doanh cá nhân hơn là tác động xã hội.' },
  { legacyId: 155, dimId: 'social_contribution',  type: 'main', reversed: false, text: 'Tôi quan tâm đến việc sản phẩm hoặc dịch vụ của mình có thực sự tạo giá trị cho khách hàng và cộng đồng.' },
  { legacyId: 156, dimId: 'social_contribution',  type: 'main', reversed: true,  text: 'Đối với tôi, thu nhập cao quan trọng hơn việc công việc có ý nghĩa xã hội.' },
  // ── STRESS MENTAL ──
  { legacyId: 106, dimId: 'stress_mental',        type: 'main', reversed: false, text: 'Tôi có thể duy trì hiệu suất làm việc ngay cả khi môi trường có nhiều xung đột.' },
  { legacyId: 107, dimId: 'stress_mental',        type: 'main', reversed: false, text: 'Tôi không để áp lực công việc làm ảnh hưởng đến cuộc sống cá nhân.' },
  { legacyId: 108, dimId: 'stress_mental',        type: 'main', reversed: false, text: 'Khi gặp nhiều vấn đề cùng lúc, tôi vẫn giữ được sự tập trung và bình tĩnh.' },
  { legacyId: 109, dimId: 'stress_mental',        type: 'main', reversed: true,  text: 'Áp lực công việc cao khiến tôi khó ngủ hoặc lo lắng liên tục.' },
  { legacyId: 110, dimId: 'stress_mental',        type: 'main', reversed: true,  text: 'Tôi dễ bị kiệt sức tinh thần khi phải đối mặt với công việc căng thẳng kéo dài.' },
  { legacyId: 111, dimId: 'stress_mental',        type: 'main', reversed: true,  text: 'Bầu không khí làm việc tiêu cực ảnh hưởng lớn đến tâm trạng và hiệu suất của tôi.' },
  // ── STRESS PHYSICAL ──
  { legacyId: 112, dimId: 'stress_physical',      type: 'main', reversed: false, text: 'Tôi có thể làm việc hiệu quả ngay cả khi ngủ ít trong vài ngày liên tiếp.' },
  { legacyId: 113, dimId: 'stress_physical',      type: 'main', reversed: false, text: 'Tôi hiếm khi bị ốm hoặc mệt mỏi thể chất khi làm việc cường độ cao.' },
  { legacyId: 114, dimId: 'stress_physical',      type: 'main', reversed: false, text: 'Tôi duy trì được năng lượng tốt suốt ngày làm việc, kể cả cuối ngày.' },
  { legacyId: 115, dimId: 'stress_physical',      type: 'main', reversed: true,  text: 'Tôi thường cảm thấy mệt mỏi thể chất sau các giai đoạn làm việc nhiều giờ.' },
  { legacyId: 116, dimId: 'stress_physical',      type: 'main', reversed: true,  text: 'Cơ thể tôi phản ứng mạnh (đau đầu, mất ngủ) khi áp lực công việc tăng cao.' },
  { legacyId: 157, dimId: 'stress_physical',      type: 'main', reversed: false, text: 'Tôi duy trì được thể lực và sức khỏe tốt dù lịch làm việc dày đặc kéo dài nhiều tuần.' },
  // ── CRITICAL THINKING ──
  { legacyId: 159, dimId: 'critical_thinking',    type: 'main', reversed: false, text: 'Tôi thường đặt câu hỏi về cơ sở của các nhận định trước khi tin tưởng hoàn toàn.' },
  { legacyId: 160, dimId: 'critical_thinking',    type: 'main', reversed: false, text: 'Tôi phân biệt được sự kiện thực tế và ý kiến cá nhân khi đánh giá thông tin.' },
  { legacyId: 161, dimId: 'critical_thinking',    type: 'main', reversed: false, text: 'Tôi nhận ra khi người khác sử dụng lập luận cảm xúc thay vì bằng chứng.' },
  { legacyId: 162, dimId: 'critical_thinking',    type: 'main', reversed: false, text: 'Khi đưa ra quyết định quan trọng, tôi cân nhắc cả quan điểm phản biện.' },
  { legacyId: 163, dimId: 'critical_thinking',    type: 'main', reversed: true,  text: 'Tôi thường tin vào thông tin từ người có thẩm quyền mà không kiểm chứng thêm.' },
  { legacyId: 164, dimId: 'critical_thinking',    type: 'main', reversed: true,  text: 'Tôi ít khi xem xét lại giả định của mình ngay cả khi có dữ liệu mới.' },
  // ── ADAPTABILITY (6 câu — UUID khớp cache) ──
  // UUID sử dụng legacyId 300-305, khớp với ids trong cache: ada00001...ada00006
  { legacyId: 300, dimId: 'adaptability', type: 'main', reversed: false, text: 'Tôi nhanh chóng điều chỉnh cách làm việc khi tổ chức hoặc dự án thay đổi định hướng đột ngột.',  id: 'ada00001-0000-4000-a000-000000000001' },
  { legacyId: 301, dimId: 'adaptability', type: 'main', reversed: false, text: 'Khi quy trình làm việc thay đổi, tôi tiếp cận và thích nghi nhanh hơn đồng nghiệp.',            id: 'ada00002-0000-4000-a000-000000000002' },
  { legacyId: 302, dimId: 'adaptability', type: 'main', reversed: false, text: 'Tôi có thể chuyển đổi linh hoạt giữa nhiều dự án, ưu tiên khác nhau trong cùng một ngày làm việc.',id: 'ada00003-0000-4000-a000-000000000003' },
  { legacyId: 303, dimId: 'adaptability', type: 'main', reversed: true,  text: 'Tôi cảm thấy bất an và mất phương hướng khi kế hoạch công việc bị thay đổi đột ngột.',         id: 'ada00004-0000-4000-a000-000000000004' },
  { legacyId: 304, dimId: 'adaptability', type: 'main', reversed: true,  text: 'Tôi cần quy trình và môi trường cố định để làm việc hiệu quả, khó làm tốt với sự bất ổn.',     id: 'ada00005-0000-4000-a000-000000000005' },
  { legacyId: 305, dimId: 'adaptability', type: 'main', reversed: false, text: 'Khi môi trường thay đổi, tôi thường nhìn thấy cơ hội thay vì rủi ro và hành động theo đó.',     id: 'ada00006-0000-4000-a000-000000000006' },
  // ── GRIT — Bền Bỉ / Ý Chí (6 câu — UUID khớp cache) ──
  { legacyId: 306, dimId: 'grit', type: 'main', reversed: false, text: 'Tôi kiên trì theo đuổi mục tiêu dài hạn dù phải đối mặt với nhiều trở ngại và thất bại trên đường.',  id: 'grt00001-0000-4000-a000-000000000001' },
  { legacyId: 307, dimId: 'grit', type: 'main', reversed: false, text: 'Khi gặp thất bại, tôi tìm cách học hỏi và tiếp tục cố gắng thay vì từ bỏ mục tiêu ban đầu.',           id: 'grt00002-0000-4000-a000-000000000002' },
  { legacyId: 308, dimId: 'grit', type: 'main', reversed: false, text: 'Tôi tiếp tục duy trì nỗ lực ngay cả khi kết quả tiến triển chậm hơn kỳ vọng trong nhiều tuần.',        id: 'grt00003-0000-4000-a000-000000000003' },
  { legacyId: 309, dimId: 'grit', type: 'main', reversed: true,  text: 'Tôi thường từ bỏ mục tiêu dài hạn khi gặp quá nhiều trở ngại liên tiếp.',                              id: 'grt00004-0000-4000-a000-000000000004' },
  { legacyId: 310, dimId: 'grit', type: 'main', reversed: true,  text: 'Khi tiến độ chậm hơn kế hoạch, tôi dễ mất đi động lực và muốn chuyển sang mục tiêu khác.',             id: 'grt00005-0000-4000-a000-000000000005' },
  { legacyId: 311, dimId: 'grit', type: 'main', reversed: false, text: 'Tôi duy trì đam mê và cam kết với các mục tiêu quan trọng trong nhiều tháng hoặc nhiều năm liền.',      id: 'grt00006-0000-4000-a000-000000000006' },
];

const LIE_QUESTIONS = [
  // ── 8 CÂU ABSOLUTE (lieWeight = 1.0) ──
  { legacyId: 117, dimId: 'lie_scale', type: 'lie_absolute', lieWeight: 1.0, text: 'Tôi chưa bao giờ nói dối, dù chỉ là lời nói vô hại nhỏ nhặt.' },
  { legacyId: 118, dimId: 'lie_scale', type: 'lie_absolute', lieWeight: 1.0, text: 'Tôi luôn hoàn toàn hài lòng với mọi quyết định của cấp trên.' },
  { legacyId: 119, dimId: 'lie_scale', type: 'lie_absolute', lieWeight: 1.0, text: 'Tôi không bao giờ cảm thấy cáu kỉnh hay tức giận với bất kỳ ai.' },
  { legacyId: 120, dimId: 'lie_scale', type: 'lie_absolute', lieWeight: 1.0, text: 'Tôi luôn hoàn thành 100% mọi công việc được giao mà không có ngoại lệ.' },
  { legacyId: 121, dimId: 'lie_scale', type: 'lie_absolute', lieWeight: 1.0, text: 'Tôi chưa bao giờ cảm thấy ghen tị với thành công của người khác.' },
  { legacyId: 122, dimId: 'lie_scale', type: 'lie_absolute', lieWeight: 1.0, text: 'Tôi luôn trung thực tuyệt đối trong mọi tình huống, không có ngoại lệ.' },
  { legacyId: 123, dimId: 'lie_scale', type: 'lie_absolute', lieWeight: 1.0, text: 'Tôi chưa bao giờ cảm thấy lười biếng hay muốn trốn tránh trách nhiệm.' },
  { legacyId: 124, dimId: 'lie_scale', type: 'lie_absolute', lieWeight: 1.0, text: 'Tôi không bao giờ bỏ qua một quy định dù nhỏ, kể cả khi không ai biết.' },
  // ── 4 CÂU SUBTLE (lieWeight = 0.5) — tinh tế hơn, khó lách hơn ──
  { legacyId: 200, dimId: 'lie_scale', type: 'lie_subtle', lieWeight: 0.5, text: 'Tôi luôn vui vẻ và sẵn sàng giúp đỡ đồng nghiệp ngay cả khi bản thân đang rất bận và mệt mỏi.' },
  { legacyId: 201, dimId: 'lie_scale', type: 'lie_subtle', lieWeight: 0.5, text: 'Tôi không bao giờ nghĩ xấu về đồng nghiệp, kể cả khi họ làm việc không đúng kỳ vọng của tôi.' },
  { legacyId: 202, dimId: 'lie_scale', type: 'lie_subtle', lieWeight: 0.5, text: 'Mỗi cam kết và lời hứa tôi đã đưa ra, tôi đều thực hiện đúng 100% mà không để sót lần nào.' },
  { legacyId: 203, dimId: 'lie_scale', type: 'lie_subtle', lieWeight: 0.5, text: 'Tôi chưa bao giờ trì hoãn một nhiệm vụ quan trọng chỉ vì tôi không muốn làm vào lúc đó.' },
];

// ══════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ══════════════════════════════════════════════════════════════
async function main() {
  console.log('🚀 SPI V4.2 Seed bắt đầu...\n');

  // ── 1. Upsert Dimensions ──────────────────────────────────
  console.log('1️⃣  Seeding dimensions...');
  for (const d of DIMS) {
    await prisma.dimension.upsert({
      where: { id: d.id },
      update: { nameVi: d.nameVi, nameEn: d.nameEn, group: d.group, descLow: d.descLow, descHigh: d.descHigh, color: d.color, icon: d.icon, displayOrder: d.displayOrder, isActive: d.isActive ?? true },
      create: { id: d.id, nameVi: d.nameVi, nameEn: d.nameEn, group: d.group, descLow: d.descLow, descHigh: d.descHigh, color: d.color, icon: d.icon, displayOrder: d.displayOrder, isActive: d.isActive ?? true },
    });
  }
  console.log(`   ✅ ${DIMS.length} dimensions OK\n`);

  // ── 2. Upsert Dimension Relations ──────────────────────────
  console.log('2️⃣  Seeding dimension relations (cross-dim consistency)...');
  for (const r of DIM_RELATIONS) {
    await prisma.dimensionRelation.upsert({
      where: { dimensionIdA_dimensionIdB: { dimensionIdA: r.dimensionIdA, dimensionIdB: r.dimensionIdB } },
      update: { thresholdAMin: r.thresholdAMin ?? null, thresholdAMax: (r as any).thresholdAMax ?? null, thresholdBMin: (r as any).thresholdBMin ?? null, thresholdBMax: (r as any).thresholdBMax ?? null, description: r.description },
      create: { dimensionIdA: r.dimensionIdA, dimensionIdB: r.dimensionIdB, relationType: 'contradiction', thresholdAMin: r.thresholdAMin ?? null, thresholdAMax: (r as any).thresholdAMax ?? null, thresholdBMin: (r as any).thresholdBMin ?? null, thresholdBMax: (r as any).thresholdBMax ?? null, description: r.description, evidenceWeight: 1.5 },
    });
  }
  console.log(`   ✅ ${DIM_RELATIONS.length} dimension relations OK\n`);

  // ── 3. Create QuestionSet ──────────────────────────────────
  console.log('3️⃣  Tạo QuestionSet SPI V4.2...');
  // Deactivate các set cũ
  await prisma.questionSet.updateMany({ data: { isActive: false } });
  const qSet = await prisma.questionSet.create({
    data: {
      name: 'Techzen SPI Universal V4.2',
      version: 'v4.2',
      description: '132 câu chính (22 dimensions, bao gồm Adaptability & Grit) + 12 câu Lie Scale (8 absolute + 4 subtle)',
      isActive: true,
      totalMain: MAIN_QUESTIONS.length,
      totalLie: LIE_QUESTIONS.length,
    },
  });
  console.log(`   ✅ QuestionSet created: ${qSet.id}\n`);

  // ── 4. Seed Questions ─────────────────────────────────────
  console.log('4️⃣  Seeding questions...');

  // Xen kẽ lie questions đều đặn vào giữa main questions (mỗi 10 câu chính chèn 1 câu lie)
  // Mục đích: người dùng không nhận ra câu nào là lie scale → kết quả trung thực hơn
  const INTERLEAVE_EVERY = Math.floor(MAIN_QUESTIONS.length / LIE_QUESTIONS.length); // = 10
  type AnyQuestion = { legacyId: number; dimId: string; type: string; reversed?: boolean; lieWeight?: number; text: string };
  const interleavedQ: AnyQuestion[] = [];
  let lieIdx = 0;
  for (let i = 0; i < MAIN_QUESTIONS.length; i++) {
    interleavedQ.push(MAIN_QUESTIONS[i]);
    if ((i + 1) % INTERLEAVE_EVERY === 0 && lieIdx < LIE_QUESTIONS.length) {
      interleavedQ.push(LIE_QUESTIONS[lieIdx++]);
    }
  }
  while (lieIdx < LIE_QUESTIONS.length) {
    interleavedQ.push(LIE_QUESTIONS[lieIdx++]);
  }

  for (let qIdx = 0; qIdx < interleavedQ.length; qIdx++) {
    const q = interleavedQ[qIdx];
    await prisma.question.upsert({
      where: { legacyId: q.legacyId },
      update: { textVi: q.text, questionType: q.type, reversed: q.reversed ?? false, lieWeight: q.lieWeight ?? 1.0, setId: qSet.id, dimensionId: q.dimId, displayOrder: qIdx },
      create: { legacyId: q.legacyId, setId: qSet.id, dimensionId: q.dimId, textVi: q.text, questionType: q.type, reversed: q.reversed ?? false, lieWeight: q.lieWeight ?? 1.0, displayOrder: qIdx },
    });
  }
  console.log(`   ✅ ${interleavedQ.length} questions OK (${MAIN_QUESTIONS.length} main + ${LIE_QUESTIONS.length} lie, xen kẽ mỗi ${INTERLEAVE_EVERY} câu)\n`);

  // ── 5. Seed Question Relations (forward/reversed pairs) ───
  console.log('5️⃣  Seeding question relations (intra-dim pairs)...');
  // Lấy tất cả questions vừa seed
  const dbQuestions = await prisma.question.findMany({ where: { setId: qSet.id } });
  const qByLegId = new Map(dbQuestions.map(q => [q.legacyId, q]));

  // Các cặp forward/reversed đã biết theo dimension
  const knownPairs: Array<[number, number]> = [
    [1, 5], [2, 6],   // extraversion
    [9, 13], [10, 14], [12, 15], // agreeableness
    [17, 21], [18, 23], // conscientiousness
    [25, 29], [26, 30], // openness
    [32, 36], [33, 37], // emotional_stability
    [39, 43], [40, 44], // achievement_drive
    [46, 50], [47, 51], // challenge_spirit
    [52, 56], [53, 57], // autonomy
    [58, 62], [59, 63], // learning_curiosity
    [64, 67], [65, 68], // recognition_need
    [69, 74], [70, 158], // logical_thinking
    [76, 80], [77, 81], // empathy
    [82, 85], [83, 86], // execution_speed
    [87, 90], [88, 91], // caution
    [92, 95], [93, 96], // growth_orientation
    [97, 100], [98, 101], // stability_orientation
    [102, 105], [103, 156], // social_contribution
    [106, 109], [107, 110], // stress_mental
    [112, 115], [113, 116], // stress_physical
    [159, 163], [160, 164], // critical_thinking
  ];

  let relCount = 0;
  for (const [idA, idB] of knownPairs) {
    const qA = qByLegId.get(idA);
    const qB = qByLegId.get(idB);
    if (!qA || !qB) continue;
    try {
      await prisma.questionRelation.upsert({
        where: { questionIdA_questionIdB_relationType: { questionIdA: qA.id, questionIdB: qB.id, relationType: 'forward_reversed_pair' } },
        update: {},
        create: { questionIdA: qA.id, questionIdB: qB.id, relationType: 'forward_reversed_pair', description: `${qA.dimensionId} forward ↔ reversed pair` },
      });
      relCount++;
    } catch (_) { /* ignore duplicate */ }
  }
  console.log(`   ✅ ${relCount} question relations OK\n`);

  console.log('✨ Seed hoàn tất!');
  console.log(`   Dimensions: ${DIMS.length}`);
  console.log(`   DimRelations: ${DIM_RELATIONS.length}`);
  console.log(`   Questions: ${interleavedQ.length}`);
  console.log(`   QRelations: ${relCount}`);
}

main()
  .catch((e) => { console.error('❌ Seed lỗi:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
