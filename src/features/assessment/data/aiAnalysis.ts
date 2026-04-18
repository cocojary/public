// ============================================================
// AI ANALYSIS ENGINE — Techzen HR Assessment
// Tạo phân tích văn bản chi tiết dựa trên điểm số
// Mô phỏng cấu trúc báo cáo Scouter SS Nhật Bản
// ============================================================

import type { DimensionScore, AssessmentResult } from './scoring';
import { DIMENSIONS } from './dimensions';

// ─── NARRATIVE TEMPLATES ──────────────────────────────────────
// Mỗi dimension có 5 mức mô tả: 1-2 / 3-4 / 5-6 / 7-8 / 9-10

const NARRATIVES: Record<string, string[]> = {
  // ── 性格 TÍNH CÁCH ──────────────────────────────────────────
  extraversion: [
    'Có xu hướng hướng nội rõ rệt. Tái tạo năng lượng tốt nhất khi ở một mình, cảm thấy mệt mỏi sau giao tiếp kéo dài. Phù hợp công việc độc lập, nghiên cứu, viết lách hoặc phân tích backend.',
    'Hơi thiên về hướng nội. Có thể giao tiếp tốt khi cần thiết nhưng không chủ động tìm kiếm. Cần được đặt trong môi trường ít áp lực xã hội.',
    'Cân bằng giữa hướng nội và hướng ngoại. Thích nghi tốt với nhiều môi trường làm việc khác nhau, tùy tình huống mà chủ động hoặc rút lui đúng lúc.',
    'Thiên về hướng ngoại. Thoải mái trong môi trường làm việc nhóm, dễ kết nối và xây dựng mối quan hệ. Phù hợp các vai trò cần giao tiếp thường xuyên.',
    'Hướng ngoại điển hình. Là người tạo năng lượng cho nhóm, rất giỏi xây dựng mạng lưới và truyền cảm hứng. Phù hợp Sales, PR, Team Leader, Business Development.',
  ],
  agreeableness: [
    'Thiên về độc lập trong quyết định và thẳng thắn trong giao tiếp. Ít nhân nhượng, có thể gây xung đột trong môi trường cần sự đồng thuận cao.',
    'Có khả năng hợp tác nhưng vẫn giữ quan điểm cá nhân. Cần phát triển thêm kỹ năng lắng nghe và thấu hiểu người khác.',
    'Cân bằng giữa tính hợp tác và tính độc lập. Biết khi nào cần nhường bộ và khi nào cần giữ vững lập trường. Làm việc nhóm hiệu quả.',
    'Nhiệt tình, hòa đồng và quan tâm đến nhu cầu của người khác. Là người kết nối tốt giữa các thành viên trong nhóm.',
    'Rất hướng đến sự hòa hợp và quan tâm người khác. Điểm mạnh lớn trong công việc liên quan đến dịch vụ, HR, đào tạo, hỗ trợ. Chú ý tránh để người khác lợi dụng sự tốt bụng.',
  ],
  conscientiousness: [
    'Có xu hướng trì hoãn và bỏ qua chi tiết. Cần cải thiện kỹ năng quản lý thời gian và sắp xếp công việc. Nên được giao deadline rõ ràng và có người nhắc nhở.',
    'Đôi khi gặp khó khăn trong việc duy trì tổ chức và hoàn thành đúng hạn. Cần cấu trúc hỗ trợ từ bên ngoài để làm việc hiệu quả nhất.',
    'Mức độ tận tâm ổn định. Hoàn thành công việc đúng hạn trong điều kiện bình thường. Cần áp lực vừa phải để duy trì hiệu suất.',
    'Đáng tin cậy và có tổ chức tốt. Chú ý chi tiết, ít để sai sót. Là người đồng đội đáng tin cậy trong các dự án đòi hỏi độ chính xác.',
    'Cực kỳ tận tâm và có kỷ luật cao. Xuất sắc trong các công việc yêu cầu độ chính xác và nhất quán. Có thể có xu hướng cầu toàn — cần cân bằng để không ảnh hưởng tốc độ.',
  ],
  openness: [
    'Thực dụng và ưa ổn định. Tin vào các phương pháp đã được kiểm chứng. Phù hợp môi trường quy trình rõ ràng, ít thay đổi. Có thể gặp khó khăn trong môi trường innovation.',
    'Thiên về thực dụng hơn sáng tạo. Có thể tiếp nhận ý tưởng mới nhưng không chủ động đề xuất. Phù hợp vai trò thực thi hơn là thiết kế.',
    'Cân bằng giữa sáng tạo và thực dụng. Có thể thích nghi với môi trường thay đổi và đề xuất cải tiến khi cần thiết.',
    'Sáng tạo và ham học hỏi. Thích thử nghiệm ý tưởng mới, đọc nhiều, tư duy đa chiều. Phù hợp các vị trí cần innovation.',
    'Rất sáng tạo và cởi mở với trải nghiệm mới. Tư duy phong phú, liên kết nhiều lĩnh vực. Xuất sắc trong R&D, thiết kế sản phẩm, content strategy. Có thể cảm thấy nhàm chán với công việc routine.',
  ],
  emotional_stability: [
    'Cảm xúc dễ bị ảnh hưởng bởi môi trường bên ngoài. Cần nhiều hỗ trợ tâm lý và môi trường làm việc tích cực. Dễ bị kiệt sức cảm xúc trong giai đoạn áp lực.',
    'Đôi khi gặp khó khăn trong việc kiểm soát cảm xúc. Cần môi trường làm việc ổn định và ít xung đột để phát huy tốt nhất.',
    'Ổn định cảm xúc ở mức trung bình. Có thể vượt qua hầu hết tình huống căng thẳng thông thường nhưng có thể bị xáo trộn ở cường độ cao.',
    'Bình tĩnh và ít bị xáo trộn bởi các sự kiện bên ngoài. Kiểm soát cảm xúc tốt, phục hồi nhanh sau thất bại.',
    'Rất ổn định và vững vàng về mặt cảm xúc. Là "neo cảm xúc" cho nhóm trong giai đoạn khó khăn. Hiệu suất không bị suy giảm kể cả trong tình huống khủng hoảng.',
  ],

  // ── 意欲 Ý CHÍ ──────────────────────────────────────────────
  achievement_drive: [
    'Không bị thúc đẩy bởi mục tiêu thành tích. Phù hợp hơn với công việc định hướng quy trình, ít cạnh tranh. Không phù hợp môi trường KPI-driven mạnh mẽ.',
    'Mức độ tham vọng thấp đến trung bình. Hài lòng với kết quả "đủ tốt". Cần sự khích lệ từ bên ngoài để đặt ra mục tiêu cao hơn.',
    'Có tham vọng vừa phải. Đặt ra mục tiêu và nỗ lực đạt được nhưng không hy sinh mọi thứ vì kết quả. Cân bằng tốt giữa công việc và cuộc sống.',
    'Có khát vọng thành tích cao. Luôn tìm kiếm kết quả tốt hơn và không ngừng cải thiện. Động lực nội tại mạnh, ít cần khích lệ từ bên ngoài.',
    'Khát vọng thành tích xuất sắc. Luôn đặt ra bar cao nhất và tìm mọi cách để vượt qua. Phù hợp vị trí leadership, startup environment, hoặc môi trường cạnh tranh cao.',
  ],
  challenge_spirit: [
    'Có xu hướng tránh rủi ro và thích sự ổn định. Không phù hợp môi trường đòi hỏi đổi mới sáng tạo liên tục hoặc chịu đựng thất bại.',
    'Thận trọng khi đối mặt với thách thức mới. Cần thời gian thích nghi và hỗ trợ trước khi nhận các dự án khó.',
    'Sẵn sàng nhận thách thức ở mức vừa phải. Không tránh né nhưng cũng không chủ động tìm kiếm khó khăn.',
    'Tinh thần thách thức tích cực. Không nản lòng trước thất bại, xem mỗi thất bại là bài học. Phù hợp môi trường agile và đổi mới.',
    'Đặc biệt thích thách thức và coi khó khăn là cơ hội. Tinh thần không bỏ cuộc mạnh mẽ. Xuất sắc trong vai trò tiên phong, mở thị trường mới, hoặc xử lý khủng hoảng.',
  ],
  autonomy: [
    'Phụ thuộc nhiều vào hướng dẫn chi tiết. Làm việc tốt nhất khi có supervisor kiểm tra thường xuyên. Không phù hợp vị trí đòi hỏi độc lập cao.',
    'Cần cấu trúc rõ ràng và hướng dẫn ban đầu trước khi có thể tự vận hành. Thích hợp môi trường có quy trình chuẩn hóa.',
    'Có thể làm việc độc lập trong phạm vi đã được xác định rõ. Cần check-in định kỳ để đảm bảo đúng hướng.',
    'Tự chủ cao. Có thể xác định phương pháp làm việc của mình mà không cần giám sát chi tiết. Phù hợp vị trí senior hoặc remote work.',
    'Cực kỳ tự chủ và độc lập. Có thể hoạt động hiệu quả với mục tiêu tổng quát và ít sự can thiệp. Tiêu biểu cho entrepreneur mindset.',
  ],
  learning_curiosity: [
    'Ít quan tâm đến việc tự học và phát triển ngoài phạm vi công việc hiện tại. Cần môi trường có training bài bản để duy trì năng lực.',
    'Học khi có yêu cầu nhưng không chủ động tìm kiếm kiến thức mới. Phù hợp công việc ổn định và ít thay đổi.',
    'Ham học hỏi ở mức trung bình. Đọc tài liệu liên quan và tham gia học khi có cơ hội, nhưng chưa thành thói quen thường xuyên.',
    'Chủ động học hỏi liên tục. Thường xuyên cập nhật kiến thức mới, theo dõi xu hướng ngành. Phù hợp môi trường công nghệ hoặc thay đổi nhanh.',
    'Đặc biệt ham học hỏi. Tự chủ trong việc phát triển bản thân, đọc nhiều, thử nghiệm nhiều. Là người có khả năng thích nghi cao với mọi môi trường.',
  ],
  recognition_need: [
    'Không phụ thuộc vào sự công nhận của người khác. Tự đánh giá kết quả của mình. Phù hợp công việc solo hoặc ít feedback.',
    'Đánh giá cao sự công nhận nhưng không phụ thuộc hoàn toàn vào đó. Làm tốt cả khi có lẫn không có feedback.',
    'Có nhu cầu được công nhận ở mức trung bình. Tăng động lực khi được khen ngợi nhưng vẫn hoạt động ổn khi không có.',
    'Động lực tăng đáng kể khi được ghi nhận công khai. Phát huy tốt nhất trong môi trường có feedback culture tốt.',
    'Nhu cầu được công nhận cao. Cần môi trường có recognition program rõ ràng. Rất phù hợp với các role customer-facing hoặc sales khi thành tích được trưng bày.',
  ],

  // ── 思考力 TƯ DUY ────────────────────────────────────────────
  logical_thinking: [
    'Thiên về trực giác và kinh nghiệm hơn là phân tích có hệ thống. Phù hợp công việc cần sợ cảm nhận hoặc quan hệ người, không phù hợp vai trò phân tích dữ liệu.',
    'Tư duy logic ở mức cơ bản. Có thể theo dõi các quy trình đơn giản nhưng gặp khó khăn với vấn đề phức tạp đa chiều.',
    'Tư duy logic ổn định. Có thể phân tích vấn đề và đưa ra giải pháp hợp lý trong hầu hết tình huống thông thường.',
    'Tư duy logic và phân tích tốt. Có khả năng xử lý vấn đề phức tạp, đưa ra quyết định dựa trên dữ liệu. Phù hợp vai trò analyst hoặc senior engineer.',
    'Tư duy logic xuất sắc. Có khả năng giải quyết vấn đề phức tạp đa chiều, nhìn thấy pattern mà người khác bỏ qua. Phù hợp vị trí architect, strategic planning, CTO.',
  ],
  empathy: [
    'Tập trung vào nhiệm vụ và kết quả, ít nhạy cảm với cảm xúc của người khác. Có thể giao tiếp thiếu tinh tế. Cần phát triển thêm kỹ năng lắng nghe.',
    'EQ ở mức thấp đến trung bình. Nhận biết được cảm xúc cơ bản của người khác nhưng phản ứng chưa nhạy bén.',
    'EQ ổn định. Có thể đồng cảm và điều chỉnh giao tiếp theo ngữ cảnh. Làm việc nhóm tốt ở mức trung bình.',
    'Khả năng đồng cảm cao. Nhạy bén với cảm xúc và nhu cầu của người khác, giao tiếp hiệu quả trong nhiều tình huống.',
    'EQ xuất sắc. Có thể "đọc phòng" và điều chỉnh hành vi ngay lập tức. Phù hợp vai trò leadership, HR, coaching, hoặc bất kỳ vị trí nào cần xây dựng quan hệ sâu.',
  ],
  execution_speed: [
    'Cần thời gian dài để suy nghĩ và chuẩn bị trước khi hành động. Phù hợp công việc đòi hỏi độ chính xác cao hơn là tốc độ.',
    'Thận trọng trong hành động. Hành động sau khi đã thu thập đủ thông tin. Có thể bỏ lỡ cơ hội do chờ đợi quá lâu.',
    'Tốc độ thực thi ở mức trung bình. Cân bằng giữa chuẩn bị và hành động. Phù hợp với hầu hết môi trường làm việc.',
    'Quyết đoán và hành động nhanh. Có thể ra quyết định kịp thời ngay cả khi thông tin chưa đầy đủ. Phù hợp môi trường fast-paced.',
    'Tốc độ thực thi rất cao. Quyết đoán, không do dự, linh hoạt chuyển hướng nhanh. Xuất sắc trong môi trường startup, crisis management, hoặc sales.',
  ],
  caution: [
    'Ít chú ý đến chi tiết. Có xu hướng bỏ sót lỗi sai. Cần kiểm tra lại công việc hoặc có người review trước khi gửi.',
    'Đôi khi bỏ qua chi tiết khi làm việc nhanh. Cần cải thiện thói quen kiểm tra kỹ trước khi submit.',
    'Mức độ thận trọng ổn định. Kiểm tra công việc trong điều kiện bình thường nhưng có thể bỏ sót dưới áp lực.',
    'Thận trọng và chú ý chi tiết tốt. Ít để xảy ra lỗi sai, phù hợp công việc đòi hỏi độ chính xác như kế toán, QA, testing.',
    'Cực kỳ thận trọng và tỉ mỉ với chi tiết. Hiếm khi để sót lỗi. Là "safety net" lý tưởng cho team. Chú ý xu hướng perfectionism có thể làm chậm tốc độ.',
  ],

  // ── 価値観 GIÁ TRỊ ──────────────────────────────────────────
  growth_orientation: [
    'Không quan tâm nhiều đến lộ trình phát triển cá nhân. Phù hợp môi trường ổn định, công việc ít thay đổi. Cần động lực từ bên ngoài để phát triển.',
    'Có chút quan tâm đến phát triển nhưng chưa chủ động. Cần môi trường có training và mentoring để khai thác tiềm năng.',
    'Định hướng phát triển ở mức trung bình. Quan tâm đến cả phát triển lẫn ổn định hiện tại.',
    'Rõ ràng định hướng phát triển. Chủ động xây dựng kế hoạch phát triển và tìm kiếm cơ hội học hỏi liên tục.',
    'Mạnh mẽ hướng tới phát triển và thăng tiến. Coi công việc là con đường phát triển bản thân. Phù hợp môi trường growth culture và career path rõ ràng.',
  ],
  stability_orientation: [
    'Không đặt nặng sự ổn định. Chấp nhận và thậm chí ưa thích sự thay đổi liên tục trong công việc và tổ chức.',
    'Có nhu cầu ổn định thấp. Linh hoạt với môi trường thay đổi, ít yêu cầu về sự an toàn công việc.',
    'Cân bằng giữa nhu cầu ổn định và khả năng thích nghi. Chấp nhận thay đổi trong phạm vi hợp lý.',
    'Coi trọng sự ổn định trong công việc. Cần môi trường có quy trình rõ ràng và ít biến động lớn.',
    'Rất coi trọng sự an toàn và ổn định. Làm việc tốt nhất trong môi trường có cấu trúc rõ ràng, ít rủi ro. Có thể lo lắng khi tổ chức có biến động lớn.',
  ],
  social_contribution: [
    'Định hướng cá nhân hơn là cộng đồng. Công việc chủ yếu phục vụ mục tiêu cá nhân và gia đình. Không thúc đẩy bởi tác động xã hội.',
    'Ít quan tâm đến tác động xã hội của công việc. Tập trung vào kết quả công việc cụ thể hơn là ý nghĩa rộng hơn.',
    'Có mong muốn vừa phải về đóng góp xã hội. Sẽ tích cực hơn nếu công ty có hoạt động CSR rõ ràng.',
    'Muốn công việc có ý nghĩa xã hội. Gắn kết hơn với tổ chức có sứ mệnh rõ ràng ngoài lợi nhuận.',
    'Mạnh mẽ định hướng đóng góp xã hội. Muốn thấy tác động tích cực đến cộng đồng từ công việc của mình. Phù hợp NGO, startup social impact, hoặc CSR team.',
  ],

  // ── ストレス耐性 STRESS ──────────────────────────────────────
  stress_mental: [
    'Sức chịu đựng stress tinh thần thấp. Dễ bị kiệt sức cảm xúc và burnout trong môi trường áp lực. Cần chú ý đặc biệt về wellbeing và môi trường làm việc phù hợp.',
    'Chịu đựng stress tinh thần dưới mức trung bình. Cần môi trường hỗ trợ và ít xung đột. Nên tránh các vai trò áp lực cao như sales target, deadline khắt khe.',
    'Chịu đựng stress tinh thần ở mức trung bình. Có thể vượt qua áp lực thông thường nhưng cần thời gian phục hồi đúng đắn.',
    'Chịu đựng stress tinh thần tốt. Duy trì hiệu suất trong hầu hết tình huống áp lực. Phục hồi nhanh sau giai đoạn khó khăn.',
    'Sức chịu đựng stress tinh thần xuất sắc. Ít bị ảnh hưởng bởi áp lực, xung đột hoặc thất bại. Phù hợp mọi môi trường kể cả cường độ cao nhất.',
  ],
  stress_physical: [
    'Sức chịu đựng thể chất thấp. Dễ mệt mỏi thể chất khi làm việc cường độ cao. Cần cân bằng công việc và nghỉ ngơi hợp lý, tránh overtime kéo dài.',
    'Chịu đựng stress thể chất dưới trung bình. Nên tránh các vai trò đòi hỏi làm việc nhiều giờ liên tục hoặc di chuyển nhiều.',
    'Sức bền thể chất ở mức trung bình. Có thể duy trì hiệu suất trong điều kiện làm việc bình thường, cần nghỉ ngơi đủ giấc.',
    'Sức bền thể chất tốt. Duy trì năng lượng tốt suốt ngày làm việc và có thể xử lý giai đoạn bận rộn mà không bị ảnh hưởng nhiều.',
    'Sức bền thể chất xuất sắc. Hiếm khi bị đánh gục bởi mệt mỏi thể chất. Phù hợp các vai trò đòi hỏi cường độ cao như sales field, operations manager, startup founder.',
  ],
};

// ─── NEGATIVE TENDENCY ANALYSIS ───────────────────────────────
// Phân tích xu hướng tiêu cực từ điểm Lie Scale + Consistency
export interface NegativeTendency {
  id: string;
  nameVi: string;
  level: 'safe' | 'caution' | 'risk'; // Scouter SS: safe=OK, caution=watch, risk=NG
  score: number;       // 0-100
  description: string;
  hrNote: string;
}

export function analyzeNegativeTendencies(result: AssessmentResult): NegativeTendency[] {
  const rel = result.reliability;
  const dims = result.dimensions;
  const get = (id: string) => dims.find(d => d.dimensionId === id)?.scaled ?? 5;

  const tendencies: NegativeTendency[] = [];

  // 1. Không trung thực / Tô vẽ bản thân
  const lieScore = rel.lieScore;
  tendencies.push({
    id: 'self_enhancement',
    nameVi: 'Xu Hướng Tô Vẽ Bản Thân',
    level: lieScore > 70 ? 'risk' : lieScore > 50 ? 'caution' : 'safe',
    score: lieScore,
    description: lieScore > 70
      ? 'Câu trả lời cho thấy xu hướng cố tình thể hiện bản thân tốt hơn thực tế. Kết quả không đáng tin cậy.'
      : lieScore > 50
      ? 'Có dấu hiệu muốn thể hiện hình ảnh lý tưởng. Một số câu trả lời có thể chưa phản ánh đúng thực tế.'
      : 'Câu trả lời thành thật và tự nhiên, không có dấu hiệu tô vẽ bản thân.',
    hrNote: lieScore > 70 ? 'Cần xác minh lại bằng phỏng vấn sâu.' : lieScore > 50 ? 'Lưu ý khi diễn giải kết quả.' : 'Không cần lưu ý đặc biệt.',
  });

  // 2. Không nhất quán / Thiếu tập trung
  const incScore = 100 - rel.consistencyScore;
  tendencies.push({
    id: 'inconsistency',
    nameVi: 'Xu Hướng Trả Lời Không Nhất Quán',
    level: incScore > 40 ? 'risk' : incScore > 20 ? 'caution' : 'safe',
    score: incScore,
    description: incScore > 40
      ? 'Câu trả lời mâu thuẫn đáng kể. Người dùng có thể không đọc kỹ câu hỏi hoặc thiếu tập trung.'
      : incScore > 20
      ? 'Một số câu trả lời có độ không nhất quán. Có thể do thiếu tập trung hoặc câu hỏi khó.'
      : 'Câu trả lời nhất quán và đáng tin cậy.',
    hrNote: incScore > 40 ? 'Đề nghị làm lại bài kiểm tra.' : incScore > 20 ? 'Xem xét thêm trong phỏng vấn.' : '',
  });

  // 3. Trả lời quá nhanh
  tendencies.push({
    id: 'speed_anomaly',
    nameVi: 'Tốc Độ Trả Lời Bất Thường',
    level: rel.speedFlag ? 'risk' : 'safe',
    score: rel.speedFlag ? 90 : 10,
    description: rel.speedFlag
      ? 'Tốc độ trả lời quá nhanh, có khả năng không đọc kỹ câu hỏi. Kết quả thiếu độ tin cậy.'
      : 'Tốc độ trả lời bình thường, trong ngưỡng chấp nhận được.',
    hrNote: rel.speedFlag ? 'Yêu cầu làm lại trong điều kiện có giám sát.' : '',
  });

  // 4. Ổn định cảm xúc thấp — nguy cơ burnout
  const emotionalStability = get('emotional_stability');
  const mentalStress = get('stress_mental');
  const burnoutRisk = Math.round(((10 - emotionalStability) + (10 - mentalStress)) / 20 * 100);
  tendencies.push({
    id: 'burnout_risk',
    nameVi: 'Nguy Cơ Kiệt Sức (Burnout)',
    level: burnoutRisk > 65 ? 'risk' : burnoutRisk > 40 ? 'caution' : 'safe',
    score: burnoutRisk,
    description: burnoutRisk > 65
      ? 'Kết hợp ổn định cảm xúc thấp + sức chịu đựng stress thấp tạo ra nguy cơ burnout đáng kể nếu đặt vào môi trường áp lực.'
      : burnoutRisk > 40
      ? 'Có một số yếu tố nguy cơ. Cần theo dõi và đảm bảo workload phù hợp.'
      : 'Ít nguy cơ burnout. Có sức bền tốt về mặt tâm lý.',
    hrNote: burnoutRisk > 65 ? 'Cân nhắc vị trí phù hợp, tránh OT thường xuyên.' : '',
  });

  // 5. Nguy cơ xung đột nội bộ
  const agreeableness = get('agreeableness');
  const emotional = get('emotional_stability');
  const conflictRisk = Math.round(((10 - agreeableness) + (10 - emotional)) / 20 * 100);
  tendencies.push({
    id: 'conflict_risk',
    nameVi: 'Nguy Cơ Xung Đột Nội Bộ',
    level: conflictRisk > 65 ? 'risk' : conflictRisk > 40 ? 'caution' : 'safe',
    score: conflictRisk,
    description: conflictRisk > 65
      ? 'Xu hướng thẳng thắn kết hợp với cảm xúc dễ bị kích động tạo ra nguy cơ xung đột trong môi trường nhóm.'
      : conflictRisk > 40
      ? 'Có thể đôi khi gây căng thẳng với đồng nghiệp. Cần hỗ trợ trong kỹ năng giao tiếp.'
      : 'Ít nguy cơ xung đột. Khả năng làm việc nhóm tốt.',
    hrNote: conflictRisk > 65 ? 'Đánh giá thêm khả năng teamwork trong phỏng vấn.' : '',
  });

  // 6. Nguy cơ từ bỏ sớm (Early Quit Risk)
  const stability = get('stability_orientation');
  const challengeSpirit = get('challenge_spirit');
  const autonomy = get('autonomy');
  // Người có stability thấp + challenge cao + autonomy cao → dễ nghỉ nếu cảm thấy bị kìm hãm
  const quitRisk = stability < 4 && challengeSpirit > 7 && autonomy > 7
    ? 75
    : stability < 4 && (challengeSpirit > 6 || autonomy > 6)
    ? 50
    : stability < 4
    ? 35
    : 15;
  tendencies.push({
    id: 'early_quit_risk',
    nameVi: 'Nguy Cơ Rời Bỏ Sớm',
    level: quitRisk > 65 ? 'risk' : quitRisk > 40 ? 'caution' : 'safe',
    score: quitRisk,
    description: quitRisk > 65
      ? 'Hồ sơ cho thấy người này rất coi trọng tự do và thách thức. Nếu môi trường thiếu sự phát triển hoặc quá kiểm soát, nguy cơ nghỉ việc cao.'
      : quitRisk > 40
      ? 'Có xu hướng tìm kiếm môi trường phát triển. Cần đảm bảo lộ trình sự nghiệp rõ ràng để giữ chân.'
      : 'Ổn định trong công việc. Ít có xu hướng rời đi đột ngột.',
    hrNote: quitRisk > 65 ? 'Thảo luận về career path ngay trong onboarding.' : '',
  });

  return tendencies;
}

// ─── DUTY SUITABILITY (職務適性) ─────────────────────────────────
export interface DutyScore {
  duty: string;
  score: number;  // 0-100
  description: string;
  suitable: boolean; // score >= 50
}

export function calcDutySuitability(dims: DimensionScore[]): DutyScore[] {
  const get = (id: string) => dims.find(d => d.dimensionId === id)?.scaled ?? 5;
  const pct = (val: number) => Math.round(val * 10); // scaled 1-10 → 0-100

  return [
    {
      duty: '🧑‍💻 Kỹ thuật / Lập trình',
      score: Math.round((pct(get('logical_thinking')) * 0.4 + pct(get('conscientiousness')) * 0.3 + pct(get('caution')) * 0.3)),
      description: 'Phân tích, lập trình, thiết kế hệ thống',
      suitable: false, // Will be computed
    },
    {
      duty: '📊 Phân tích dữ liệu',
      score: Math.round((pct(get('logical_thinking')) * 0.5 + pct(get('openness')) * 0.3 + pct(get('conscientiousness')) * 0.2)),
      description: 'Data analyst, business analyst, reporting',
      suitable: false,
    },
    {
      duty: '🗣️ Sales / Kinh doanh',
      score: Math.round((pct(get('extraversion')) * 0.4 + pct(get('challenge_spirit')) * 0.3 + pct(get('stress_mental')) * 0.3)),
      description: 'Làm việc với khách hàng, đạt doanh số',
      suitable: false,
    },
    {
      duty: '🎨 Sáng tạo / Design',
      score: Math.round((pct(get('openness')) * 0.5 + pct(get('autonomy')) * 0.3 + pct(get('achievement_drive')) * 0.2)),
      description: 'UI/UX, content, creative direction',
      suitable: false,
    },
    {
      duty: '👥 Quản lý / Leadership',
      score: Math.round((pct(get('empathy')) * 0.3 + pct(get('achievement_drive')) * 0.3 + pct(get('emotional_stability')) * 0.2 + pct(get('extraversion')) * 0.2)),
      description: 'Team lead, project manager, department head',
      suitable: false,
    },
    {
      duty: '📋 Hành chính / Quy trình',
      score: Math.round((pct(get('conscientiousness')) * 0.4 + pct(get('caution')) * 0.4 + pct(get('stability_orientation')) * 0.2)),
      description: 'Admin, compliance, operations',
      suitable: false,
    },
    {
      duty: '❤️ Dịch vụ / Hỗ trợ khách hàng',
      score: Math.round((pct(get('agreeableness')) * 0.4 + pct(get('empathy')) * 0.4 + pct(get('stress_mental')) * 0.2)),
      description: 'Customer service, support, training',
      suitable: false,
    },
    {
      duty: '🔬 Nghiên cứu / R&D',
      score: Math.round((pct(get('openness')) * 0.4 + pct(get('logical_thinking')) * 0.4 + pct(get('autonomy')) * 0.2)),
      description: 'Nghiên cứu, phát triển sản phẩm mới',
      suitable: false,
    },
  ].map(d => ({ ...d, suitable: d.score >= 50 }));
}

// ─── COMBAT POWER (戦闘力) ─────────────────────────────────────
// Tổng hợp sức mạnh tổng thể — đặc trưng của Scouter SS
export interface CombatPower {
  total: number;     // 0-100
  rank: string;       // S/A/B/C/D
  label: string;
  description: string;
  components: { name: string; score: number; weight: number }[];
}

export function calcCombatPower(dims: DimensionScore[]): CombatPower {
  const get = (id: string) => dims.find(d => d.dimensionId === id)?.scaled ?? 5;
  const pct = (val: number) => val * 10;

  const components = [
    { name: '⚡ Ý chí hành động', score: Math.round((pct(get('achievement_drive')) + pct(get('challenge_spirit'))) / 2 * 100), weight: 0.25 },
    { name: '🧠 Năng lực tư duy', score: Math.round((pct(get('logical_thinking')) + pct(get('empathy'))) / 2 * 100), weight: 0.25 },
    { name: '🛡️ Sức chịu đựng', score: Math.round((pct(get('stress_mental')) + pct(get('stress_physical'))) / 2 * 100), weight: 0.25 },
    { name: '🎯 Tính cách cốt lõi', score: Math.round((pct(get('conscientiousness')) + pct(get('emotional_stability'))) / 2 * 100), weight: 0.25 },
  ];

  const total = Math.round(components.reduce((sum, c) => sum + c.score * c.weight, 0));

  let rank = 'D';
  let label = 'Cần phát triển thêm';
  let description = 'Tổng năng lực cần được đầu tư phát triển đáng kể.';

  if (total >= 8500) { rank = 'S'; label = 'Xuất sắc'; description = 'Khả năng tạo ra tác động lớn trong tổ chức.'; }
  else if (total >= 7000) { rank = 'A'; label = 'Tốt'; description = 'Tiềm năng phát triển rõ ràng, sẵn sàng nhận trách nhiệm cao.'; }
  else if (total >= 5500) { rank = 'B'; label = 'Khá'; description = 'Đảm nhận tốt vai trò hiện tại, phát triển thêm với sự hỗ trợ.'; }
  else if (total >= 4000) { rank = 'C'; label = 'Trung bình'; description = 'Có một số điểm mạnh nhưng cần cải thiện rõ rệt.'; }

  return { total, rank, label, description, components };
}

// ─── NARRATIVE GENERATOR ─────────────────────────────────────
export function getNarrative(dimensionId: string, scaled: number): string {
  const template = NARRATIVES[dimensionId];
  if (!template) return '';
  const idx = Math.min(4, Math.floor((scaled - 1) / 2));
  return template[idx] ?? template[template.length - 1];
}

// ─── AI PERSONA TYPE ──────────────────────────────────────────
export interface PersonaType {
  title: string;
  emoji: string;
  traits: string[];
  bestEnvironment: string;
  watchOut: string;
}

export function detectPersona(dims: DimensionScore[]): PersonaType {
  const get = (id: string) => dims.find(d => d.dimensionId === id)?.scaled ?? 5;

  const ext  = get('extraversion');
  const agr  = get('agreeableness');
  const con  = get('conscientiousness');
  const ope  = get('openness');
  const emo  = get('emotional_stability');
  const ach  = get('achievement_drive');
  const log  = get('logical_thinking');
  const emp  = get('empathy');
  const aut  = get('autonomy');

  // Rule-based persona detection
  if (ach >= 8 && log >= 7 && aut >= 7) return {
    title: 'Nhà Chiến Lược', emoji: '♟️',
    traits: ['Tư duy chiến lược', 'Định hướng kết quả cao', 'Độc lập và tự chủ'],
    bestEnvironment: 'Môi trường cạnh tranh, vị trí senior hoặc leadership',
    watchOut: 'Có thể khó làm việc với người có tốc độ chậm hơn',
  };
  if (ext >= 7 && ach >= 7 && emp <= 5) return {
    title: 'Chiến Binh Sales', emoji: '🎯',
    traits: ['Năng động, quyết đoán', 'Khát vọng thành tích cao', 'Không ngại từ chối'],
    bestEnvironment: 'Sales, business development, account management',
    watchOut: 'Cần phát triển thêm kỹ năng lắng nghe và empathy',
  };
  if (emp >= 7 && agr >= 7 && ext >= 6) return {
    title: 'Nhà Kết Nối', emoji: '🤝',
    traits: ['Nhạy bén với cảm xúc', 'Xây dựng quan hệ tốt', 'Hòa giải xung đột'],
    bestEnvironment: 'HR, customer success, team lead, đào tạo',
    watchOut: 'Tránh để người khác lợi dụng sự tốt bụng',
  };
  if (log >= 8 && con >= 7 && ext <= 5) return {
    title: 'Kiến Trúc Sư Hệ Thống', emoji: '🏗️',
    traits: ['Tư duy logic sâu', 'Tỉ mỉ và có hệ thống', 'Làm việc tốt độc lập'],
    bestEnvironment: 'Engineering, data, architecture, research',
    watchOut: 'Cần cải thiện kỹ năng giao tiếp kết quả với non-technical',
  };
  if (ope >= 8 && ach >= 6 && log >= 6) return {
    title: 'Người Đổi Mới', emoji: '💡',
    traits: ['Sáng tạo và tò mò', 'Luôn tìm cách mới', 'Học nhanh và thích nghi tốt'],
    bestEnvironment: 'Product, R&D, startup, creative direction',
    watchOut: 'Có thể nhàm chán với công việc routine. Cần variety',
  };
  if (con >= 8 && emo >= 7 && agr >= 6) return {
    title: 'Trụ Cột Đáng Tin Cậy', emoji: '⚓',
    traits: ['Đáng tin cậy và ổn định', 'Tổ chức tốt', 'Thực thi xuất sắc'],
    bestEnvironment: 'Operations, admin, compliance, project execution',
    watchOut: 'Có thể ngại thay đổi đột ngột. Cần thích nghi dần dần',
  };
  // Default
  return {
    title: 'Đa Năng Cân Bằng', emoji: '⚖️',
    traits: ['Linh hoạt và thích nghi', 'Phù hợp nhiều vai trò', 'Cân bằng giữa các tính cách'],
    bestEnvironment: 'Hầu hết môi trường làm việc thông thường',
    watchOut: 'Nên xác định rõ hơn điểm mạnh nổi bật để phát triển sâu hơn',
  };
}
