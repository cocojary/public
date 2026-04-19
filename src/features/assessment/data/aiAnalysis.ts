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
  // ── 統率力 LEADERSHIP (CEO/C-LEVEL) ──────────────────────────
  strategic_vision: [
    'Tầm nhìn hạn hẹp, bị cuốn vào sự vụ hàng ngày. Thiếu khả năng dự báo dài hạn, dễ khiến tổ chức lạc lối khi thị trường biến động.',
    'Có ý thức về chiến lược nhưng dễ bị lung lay bởi áp lực doanh thu ngắn hạn. Cần sự hỗ trợ từ cố vấn để giữ vững định hướng.',
    'Có khả năng lập kế hoạch dài hạn ổn định, cân bằng được mục tiêu ngắn hạn và dài hạn trong điều kiện bình thường.',
    'Tầm nhìn xa, tư duy chiến lược sắc bén. Sẵn sàng đánh đổi lợi ích trước mắt để bảo vệ mục tiêu dài hạn của tổ chức.',
    'Nhà chiến lược xuất chúng. Khả năng dự báo và thiết lập tương lai cho cả ngành. Dũng cảm thực hiện những cú chuyển đổi mang tính sống còn.',
  ],
  decision_making: [
    'Thiếu quyết đoán, hay trì hoãn, sợ sai lầm. Thói quen đùn đẩy trách nhiệm ra quyết định cho hội đồng hoặc cấp dưới.',
    'Ra quyết định chậm, phụ thuộc quá nhiều vào dữ liệu hoàn hảo. Dễ bỏ lỡ cơ hội do sự thận trọng quá mức.',
    'Khả năng ra quyết định ổn định. Quyết đoán trong phạm vi chuyên môn nhưng có thể ngập ngừng trước các rủi ro lớn đột ngột.',
    'Quyết đoán, hành động nhanh dựa trên xác suất rõ ràng. Dám chịu trách nhiệm về các quyết định mạo hiểm có tính toán.',
    'Quyết đoán cực độ. Khả năng chốt hạ phương án sắc bén trong khủng hoảng. Bản lĩnh "chốt chặn cuối cùng" rất mạnh mẽ.',
  ],
  ownership: [
    'Thiếu ý thức trách nhiệm tối cao. Có xu hướng đổ lỗi cho ngoại cảnh hoặc nhân sự dưới quyền khi kết quả không đạt.',
    'Trách nhiệm ở mức trung bình. Thừa nhận sai sót nhưng đôi khi vẫn tìm cách giảm nhẹ vai trò cá nhân trong sự cố.',
    'Có trách nhiệm với công việc điều hành. Cam kết thực hiện mục tiêu nhưng chưa sẵn sàng hy sinh lợi ích cá nhân vì tổ chức.',
    'Ownership mạnh mẽ. Sẵn sàng hy sinh thu nhập, uy tín cá nhân để bảo vệ quyền lợi công ty và nhân viên.',
    'Tinh thần "Skin in the game" tuyệt đối. Coi sinh mệnh công ty là sinh mệnh cá nhân. Chịu trách nhiệm cuối cùng trong mọi hoàn cảnh.',
  ],
  people_leadership: [
    'Phong cách quản trị độc đoán, micromanagement mạnh. Dễ bóp chết sự sáng tạo và làm nhân sự giỏi nản lòng.',
    'Có xu hướng kiểm soát chi tiết công việc của cấp dưới. Chưa tin tưởng giao quyền hoàn toàn, giao tiếp còn áp đặt.',
    'Lãnh đạo ở mức ổn định. Trao quyền trong phạm vi kiểm soát, lắng nghe ý kiến nhưng vẫn giữ khoảng cách điều hành.',
    'Trao quyền mạnh mẽ, khuyến khích phản biện gay gắt. Biết cách dùng người giỏi hơn mình và tạo không gian phát triển cho họ.',
    'Bậc thầy về dùng người. Xây dựng văn hóa tin tưởng và tự chủ cực cao. Khả năng truyền cảm hứng và thay máu tổ chức tàn nhẫn khi cần.',
  ],
  organization_building: [
    'Tư duy sự vụ, lười xây hệ thống. Tổ chức vận hành chắp vá, phụ thuộc hoàn toàn vào sự hiện diện của người lãnh đạo.',
    'Đã bắt đầu ý thức xây dựng quy trình nhưng chưa đồng bộ. Tổ chức vẫn còn nhiều điểm nghẽn do cấu trúc cũ phình to.',
    'Xây dựng hệ thống ở mức khá. Quy trình rõ ràng cho các mảng vận hành chính, giảm dần sự phụ thuộc vào cá nhân.',
    'Tư duy hệ thống sắc bén. Xây dựng tổ chức tự vận hành với các Framework quản trị hiện đại. Đóng gói quy trình chuyên nghiệp.',
    'Kiến trúc sư tổ chức tài ba. Xây dựng bộ máy có khả năng tự tiến hóa và scale-up không giới hạn mà không cần sự can thiệp trực tiếp.',
  ],
  performance_management: [
    'Quản trị theo cảm xúc, nể nang thái quá hoặc trừng phạt không công bằng. Các chỉ số đo lường lỏng lẻo và dễ bị bóp méo.',
    'Có KPI nhưng thực thi chưa triệt để. Còn nương tay với các nhân sự "công thần" có hiệu suất kém.',
    'Quản trị hiệu suất dựa trên dữ liệu ổn định. Thưởng phạt minh bạch nhưng đôi khi còn thiếu sự linh hoạt trong đánh giá.',
    'Quyết liệt với con số. Thưởng phạt phân minh, tàn nhẫn với sự trì trệ nhưng công bằng với sự cống hiến thực chất.',
    'Kỷ luật thép trong điều hành. Thiết lập tiêu chuẩn hiệu suất cực cao. Khả năng xoay chuyển toàn bộ năng suất tổ chức bằng cơ chế khoán sắc lẹm.',
  ],
  financial_management: [
    'Mù mờ về các chỉ số tài chính sống còn. Quản trị dòng tiền lỏng lẻo, dễ rơi vào bẫy phá sản kỹ thuật dù doanh thu cao.',
    'Quản trị tài chính ở mức an toàn nhưng thiếu tư duy tối ưu hóa vốn. Thường bị động trước các biến động chi phí đột ngột.',
    'Kiểm soát tài chính tốt. Cân bằng được dòng tiền và doanh thu, duy trì biên lợi nhuận ở mức chấp nhận được.',
    'Tư duy tài chính sắc sảo. Kiểm soát biên lợi nhuận, chi phí R&D và quỹ dự phòng gắt gao. Luôn ưu tiên sức khỏe dòng tiền.',
    'Chiến lược gia tài chính. Khả năng đọc vị bảng cân đối kế toán và tối ưu hóa cấu trúc vốn cực tốt. Bản lĩnh từ chối các cơ hội lớn nếu rủi ro thâm hụt.',
  ],
  customer_partner_management: [
    'Coi trọng lợi ích trước mắt hơn uy tín. Dễ dàng nhượng bộ khách hàng lớn hoặc lừa dối đối tác để đạt mục tiêu kinh doanh.',
    'Giao tiếp khách hàng tốt nhưng chưa xây dựng được mối quan hệ đối tác chiến lược công bằng. Đôi khi che giấu lỗi hệ thống.',
    'Minh bạch với đối tác và khách hàng ở mức tiêu chuẩn. Xử lý sự cố đúng quy trình và giữ cam kết hợp đồng.',
    'Xây dựng quan hệ dựa trên sự minh bạch tuyệt đối. Sẵn sàng chịu lỗ để giữ uy tín chiến lược. Cắt bỏ khách hàng/đối tác độc hại.',
    'Tư duy Win-Win đẳng cấp. Xây dựng hệ sinh thái đối tác bền vững. Sự minh bạch và chính trực tạo nên lợi thế cạnh tranh vô hình cực lớn.',
  ],
  executive_communication: [
    'Giao tiếp dài dòng, thiếu trọng tâm. Ngôn ngữ không thoát ý, gây hiểu lầm hoặc làm loãng thông điệp chiến lược.',
    'Truyền đạt rõ ràng nhưng còn thiếu sức nặng và sự quyết đoán. Đôi khi né tránh các thông tin tiêu cực hoặc nhạy cảm.',
    'Giao tiếp điều hành hiệu quả. Truyền tải thông điệp ngắn gọn, đúng người đúng việc trong hầu hết các cuộc họp.',
    'Ngôn ngữ sắc bén, trực diện. Khả năng tóm tắt vấn đề phức tạp thành thông điệp đơn giản, đầy sức mạnh làm nhân viên nể phục.',
    'Bậc thầy truyền thông điều hành. Khả năng diễn thuyết truyền cảm hứng đi đôi với sự sắc lẹm trong chỉ đạo công việc. Một từ nói ra có sức nặng ngàn cân.',
  ],
  change_management: [
    'Sợ thay đổi, bám víu vào hào quang quá khứ. Ngại va chạm với những người cũ, làm trì trệ quá trình tiến hóa của tổ chức.',
    'Muốn cải cách nhưng thiếu phương pháp. Dễ bỏ cuộc khi gặp sự phản kháng từ nội bộ hoặc vướng mắc về chi phí.',
    'Thích nghi tốt với sự thay đổi của thị trường. Thực hiện các đợt cải tiến quy trình ổn định, có lộ trình rõ ràng.',
    'Mạnh mẽ trong cải cách. Dám đập bỏ những gì đã lỗi thời, chấp nhận thay máu nhân sự để số hóa và hiện đại hóa tổ chức.',
    'Nhà cách tân tàn nhẫn. Luôn ở trạng thái "phá hủy sáng tạo". Khả năng dẫn dắt toàn bộ tổ chức nhảy vọt qua các giai đoạn thoái trào thị trường.',
  ],
  risk_management: [
    'Tư duy ngắn hạn, bỏ qua các dấu hiệu cảnh báo đỏ. Coi thường pháp lý và bảo mật, dễ đẩy công ty vào vòng lao lý.',
    'Quản trị rủi ro theo kiểu "nước đến chân mới nhảy". Chỉ chú trọng phòng ngừa sau khi đã xảy ra sự cố nghiêm trọng.',
    'Có ý thức phòng ngừa rủi ro tiêu chuẩn. Tuân thủ pháp lý và có kịch bản dự phòng cho các mảng kinh doanh chính.',
    'Chủ động đầu tư cho hệ thống phòng ngừa rủi ro. Tuyệt đối thượng tôn pháp luật và an toàn. Có kịch bản khủng hoảng chi tiết.',
    'Năng lực dự báo và quản trị rủi ro tuyệt đỉnh. Biến các kịch bản bất lợi thành cơ hội phản ứng nhanh. Bảo vệ tổ chức bằng sự thận trọng thông minh.',
  ],
  self_discipline: [
    'Thiếu kỷ luật cá nhân, làm việc theo cảm hứng. Tự cho mình quyền đứng ngoài các quy định mà mình ban hành cho nhân viên.',
    'Kỷ luật cá nhân ở mức trung bình. Thỉnh thoảng vẫn để áp lực sự vụ phá vỡ lịch trình chiến lược và nề nếp cá nhân.',
    'Duy trì kỷ luật cá nhân tốt. Tuân thủ lịch làm việc và các cam kết nội bộ, làm gương cho nhân viên trong điều kiện bình thường.',
    'Kỷ luật cá nhân khắt khe. Đi đầu trong việc thực hiện các quy chế thưởng phạt. Duy trì năng lượng và sự tập trung cực độ mỗi ngày.',
    'Hình mẫu lý tưởng về sự tự quản. Kỷ luật bản thân là nền tảng cho quyền lực điều hành. Khả năng kiểm soát thời gian và năng lượng xuất sắc.',
  ],
  continuous_learning: [
    'Ngừng học hỏi, tự mãn với kinh nghiệm cũ. Coi thường kiến thức mới hoặc những xu hướng công nghệ của thế hệ trẻ.',
    'Học hỏi thụ động, chỉ cập nhật khi bắt buộc phải thay đổi. Phụ thuộc hoàn toàn vào đội ngũ tư vấn bên ngoài.',
    'Có tinh thần học hỏi, tham khảo kiến thức mới để áp dụng vào công việc điều hành hiện tại.',
    'Ham học hỏi mãnh liệt. Sẵn sàng phủ nhận bản thân để học những mảng kiến thức hoàn toàn mới. Đầu tư lớn cho phát triển trí tuệ cá nhân.',
    'Tư duy "Học sinh vĩnh viễn". Luôn cập nhật những kiến thức tiên phong nhất toàn cầu. Khả năng tự học và thay đổi tư duy cực nhanh.',
  ],
  pressure_balance: [
    'Dễ mất bình tĩnh dưới áp lực, hay trút giận lên nhân viên. Quyết định thường mang tính xoa dịu đám đông thay vì giải quyết gốc rễ.',
    'Chịu được áp lực vừa phải nhưng dễ bị dao động cảm xúc khi gặp khủng hoảng lớn. Cần sự ổn định ngoại cảnh để sáng suốt.',
    'Bản lĩnh ổn định dưới áp lực. Duy trì được sự tỉnh táo để ra quyết định trong hầu hết các tình huống khó khăn thông thường.',
    'Lý trí sắc lạnh giữa giông bão. Kiên định với chiến lược bất chấp sự phản đối hay sóng gió thị trường. Kiểm soát cảm xúc tuyệt vời.',
    'Tinh thần thép, tĩnh lặng tuyệt đối trước khủng hoảng sống còn. Sự điềm tĩnh của người lãnh đạo là điểm tựa vững chắc nhất cho toàn bộ tổ chức.',
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

  // 4. Ổn định cảm xúc thấp — nguy cơ burnout (3 trụ cột: mental, emotional, physical)
  const emotionalStability = get('emotional_stability');
  const mentalStress = get('stress_mental');
  const physicalStress = get('stress_physical');
  const burnoutRisk = Math.round(
    ((10 - emotionalStability) + (10 - mentalStress) + (10 - physicalStress)) / 30 * 100
  );
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

  // 6. Nguy cơ từ bỏ sớm (Early Quit Risk) — công thức liên tục, không bậc thang cứng
  const stability = get('stability_orientation');
  const challengeSpirit = get('challenge_spirit');
  const autonomy = get('autonomy');
  // Unstability + high drive + high autonomy = người dễ nghỉ nếu bị kìm hãm
  const instabilityFactor = Math.max(0, 10 - stability) / 9;         // 0–1
  const driveFactor = Math.max(0, Math.max(challengeSpirit, autonomy) - 5) / 5; // 0–1
  const quitRisk = Math.min(100, Math.round((instabilityFactor * 0.5 + driveFactor * 0.5) * 100));
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

  const duties = [
    {
      duty: '🧑‍💻 Kỹ thuật / Lập trình (DEV)',
      score: Math.round(pct(get('logical_thinking')) * 0.4 + pct(get('conscientiousness')) * 0.3 + pct(get('caution')) * 0.3),
      description: 'Phân tích, lập trình, thiết kế hệ thống và giải quyết vấn đề kỹ thuật.',
    },
    {
      duty: '💰 Kế toán / Tài chính (Accountant)',
      score: Math.round(pct(get('caution')) * 0.5 + pct(get('conscientiousness')) * 0.3 + pct(get('stability_orientation')) * 0.2),
      description: 'Quản lý con số, tính toán chi tiết, đảm bảo tính tuân thủ và chính xác tài chính.',
    },
    {
      duty: '🗣️ Kinh doanh / Bán hàng (SALES)',
      score: Math.round(pct(get('extraversion')) * 0.4 + pct(get('challenge_spirit')) * 0.3 + pct(get('stress_mental')) * 0.3),
      description: 'Mở rộng thị trường, thuyết phục khách hàng và chịu áp lực doanh số cao.',
    },
    {
      duty: '🎨 Sáng tạo / Truyền thông',
      score: Math.round(pct(get('openness')) * 0.5 + pct(get('autonomy')) * 0.3 + pct(get('achievement_drive')) * 0.2),
      description: 'UI/UX, sáng tạo nội dung, định hướng thương hiệu và đổi mới.',
    },
    {
      duty: '👥 Nhân sự / Đào tạo (HR)',
      score: Math.round(pct(get('empathy')) * 0.4 + pct(get('agreeableness')) * 0.3 + pct(get('social_contribution')) * 0.3),
      description: 'Kết nối con người, xây dựng văn hóa và phát triển đội ngũ.',
    },
    {
      duty: '📋 Hành chính / Vận hành',
      score: Math.round(pct(get('conscientiousness')) * 0.4 + pct(get('caution')) * 0.4 + pct(get('stability_orientation')) * 0.2),
      description: 'Quản lý quy trình, đảm bảo bộ máy vận hành trơn tru và tuân thủ.',
    },
    {
      duty: '👑 CEO / Giám đốc điều hành',
      score: Math.round(
        pct(get('strategic_vision')) * 0.15 +
        pct(get('decision_making')) * 0.15 +
        pct(get('ownership')) * 0.15 +
        pct(get('pressure_balance')) * 0.15 +
        pct(get('logical_thinking')) * 0.1 +
        pct(get('achievement_drive')) * 0.1 +
        pct(get('emotional_stability')) * 0.1 +
        pct(get('organization_building')) * 0.1
      ),
      description: 'Lãnh đạo tối cao, chịu trách nhiệm chiến lược và sinh mệnh tổ chức.',
    },
  ];

  return duties.map(d => ({ ...d, suitable: d.score >= 50 }));
}

// ─── RELIABILITY ANALYTICS ────────────────────────────────────
// Chuyển đổi các chỉ số Validation thành nhận xét chuyên sâu
export function getReliabilityNarrative(reliability: any): { label: string; details: string[] } {
  const { lieScore, consistencyScore, speedFlag } = reliability;
  const details: string[] = [];

  // 1. Lie Scale
  if (lieScore > 75) details.push('⚠️ Độ lệch Lie Scale cao: Ứng viên có xu hướng chọn các đáp án mang tính "lý tưởng hóa" bản thân (Social Desirability Bias).');
  else if (lieScore > 50) details.push('🟡 Cần lưu ý: Một số câu trả lời có dấu hiệu muốn tạo ấn tượng tốt một cách thiếu tự nhiên.');
  else details.push('✅ Trung thực cao: Ứng viên sẵn sàng thừa nhận những thiếu sót thông thường của bản thân.');

  // 2. Consistency
  if (consistencyScore < 60) details.push('❌ Mâu thuẫn nội tại: Hệ thống phát hiện sự không đồng nhất giữa các cặp câu hỏi tương đồng. Có thể do ứng viên trả lời thiếu tập trung hoặc cố tình che giấu bản chất.');
  else if (consistencyScore < 85) details.push('🟡 Tính nhất quán trung bình: Có một vài điểm mâu thuẫn nhỏ trong quan điểm hành vi.');
  else details.push('✅ Nhất quán tuyệt đối: Các phản ứng vô thức và có ý thức có sự đồng bộ chặt chẽ.');

  // 3. Speed
  if (speedFlag) details.push('⚠️ Tốc độ phản ứng quá nhanh: Khả năng cao ứng viên trả lời theo quán tính mà không qua xử lý nhận thức sâu.');
  else details.push('✅ Tốc độ phản ứng tiêu chuẩn: Đảm bảo thời gian đọc hiểu và phản hồi tự nhiên.');

  let label = 'Kết quả Đáng tin';
  if (speedFlag || lieScore > 70 || consistencyScore < 60) label = 'Độ tin cậy Thấp / Cần phỏng vấn lại';
  else if (lieScore > 50 || consistencyScore < 80) label = 'Độ tin cậy Trung bình / Cần xác minh thêm';

  return { label, details };
}

// ─── COMBAT POWER (戦闘力) v2 — Anthropological Model ────────
export interface CombatPower {
  total: number;
  rank: string;
  label: string;
  description: string;
  pillars: Record<string, { name: string; value: number; desc: string }>;
  penaltyFactor: number;
  bonusPoints: number;
}

export function calcCombatPower(dims: DimensionScore[]): CombatPower {
  const get = (id: string) => dims.find(d => d.dimensionId === id)?.scaled ?? 5;
  const isCEO = dims.some(d => d.dimensionId === 'strategic_vision');
  
  const pct = (val: number) => val * 10;

  // 4 Trụ cột Thực chiến (Pillars) - Anthropology Model
  const vitalityVal = Math.round((pct(get('achievement_drive')) + pct(get('challenge_spirit')) + pct(get('autonomy'))) / 3);
  const intelligenceVal = Math.round((pct(get('logical_thinking')) + pct(get('openness')) + (isCEO ? pct(get('strategic_vision')) : 50)) / 3);
  const resilienceVal = Math.round((pct(get('emotional_stability')) + pct(get('stress_mental')) + pct(get('empathy'))) / 3);
  const disciplineVal = Math.round((pct(get('conscientiousness')) + pct(get('caution')) + (isCEO ? pct(get('decision_making')) : pct(get('execution_speed')))) / 3);

  const pillars = {
    vitality: { name: '🔥 VITALITY', value: vitalityVal, desc: 'Sức sống, ý chí sinh tồn và khao khát khẳng định.' },
    intelligence: { name: '🧠 INTELLIGENCE', value: intelligenceVal, desc: 'Trí tuệ hệ thống, khả năng thích nghi và tầm nhìn.' },
    resilience: { name: '🛡️ RESILIENCE', value: resilienceVal, desc: 'Bản lĩnh, sức chịu đựng tâm lý và sự thấu cảm.' },
    discipline: { name: '🎯 DISCIPLINE', value: disciplineVal, desc: 'Kỷ luật cá nhân, khả năng ra quyết định và thực thi.' },
  };

  // Logic Penalty (Gót chân Achilles)
  // Nếu bất kỳ trụ cột nào < 30 (quá yếu), tổng lực giảm mạnh vì lỗ hổng chí mạng
  const values = [vitalityVal, intelligenceVal, resilienceVal, disciplineVal];
  const minPillar = Math.min(...values);
  let penaltyFactor = 1.0;
  if (minPillar < 30) penaltyFactor = 0.65;
  else if (minPillar < 45) penaltyFactor = 0.85;

  // Logic Bonus (Synergy - Cộng hưởng lãnh đạo)
  let bonusPoints = 0;
  if (isCEO && get('strategic_vision') >= 8 && get('decision_making') >= 8) {
    bonusPoints = 500; // Cộng thẳng điểm thưởng cho sự kết hợp Tầm nhìn + Quyết đoán
  }

  const baseTotal = (vitalityVal + intelligenceVal + resilienceVal + disciplineVal) * 25; // Max 10000
  const total = Math.round(baseTotal * penaltyFactor) + bonusPoints;

  let rank = 'D';
  let label = 'Người thừa hành';
  let description = 'Năng lực thực chiến ở mức cơ bản, cần được dẫn dắt chặt chẽ.';

  if (total >= 9000) { rank = 'S+'; label = 'Bậc thầy Chiến lược'; description = 'Sức mạnh áp đảo, có khả năng thay đổi vận mệnh doanh nghiệp.'; }
  else if (total >= 8000) { rank = 'S'; label = 'Lãnh đạo Xuất chúng'; description = 'Năng lực thực chiến toàn diện, bản lĩnh điều hành vững vàng.'; }
  else if (total >= 7000) { rank = 'A'; label = 'Cốt cán Thực chiến'; description = 'Hiệu suất cao, là trụ cột vững chắc của tổ chức.'; }
  else if (total >= 5500) { rank = 'B'; label = 'Nhân sự Ổn định'; description = 'Có năng lực chuyên môn tốt, đáp ứng tốt kỳ vọng.'; }
  else if (total >= 4000) { rank = 'C'; label = 'Cần được rèn luyện'; description = 'Hệ thống năng lực còn nhiều lỗ hổng, cần lộ trình đào tạo.'; }

  return { total, rank, label, description, pillars, penaltyFactor, bonusPoints };
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

/**
 * detectCEOPersona: Đặc quyền dành riêng cho role CEO
 */
export function detectCEOPersona(dims: DimensionScore[]): PersonaType | null {
  const get = (id: string) => dims.find(d => d.dimensionId === id)?.scaled ?? 5;
  
  const vision = get('strategic_vision');
  const decision = get('decision_making');
  const owner = get('ownership');
  const balance = get('pressure_balance');
  const sys = get('organization_building');

  if (vision < 4 && decision < 4) return null; // Không đủ dữ liệu leadership

  if (vision >= 8 && owner >= 8 && balance >= 8) return {
    title: 'Thủ Lĩnh Bản Lĩnh', emoji: '🎖️',
    traits: ['Tầm nhìn vĩ đại', 'Ownership tuyệt đối', 'Tĩnh lặng trong bão'],
    bestEnvironment: 'Tổ chức lớn, tái cấu trúc, hoặc giai đoạn khủng hoảng',
    watchOut: 'Có thể bị coi là cực đoan hoặc quá khắt khe với tiêu chuẩn của mình'
  };
  
  if (decision >= 8 && sys >= 8 && owner >= 7) return {
    title: 'Nhà Kỹ Trị Hệ Thống', emoji: '⚙️',
    traits: ['Quyết liệt thực thi', 'Xây dựng bộ máy tự chạy', 'Dựa trên dữ liệu'],
    bestEnvironment: 'Scale-up nhanh, doanh nghiệp cần tính ổn định vận hành cao',
    watchOut: 'Dễ sa vào máy móc, cần chú ý thêm yếu tố cảm xúc con người'
  };

  if (vision >= 7 && decision >= 8 && owner >= 6) return {
    title: 'Sát Thủ Cơ Hội', emoji: '🦅',
    traits: ['Nhạy bén thị trường', 'Ra đòn nhanh', 'Dám đánh đổi'],
    bestEnvironment: 'Startup mạo hiểm, thị trường mới nổi, cạnh tranh khốc liệt',
    watchOut: 'Rủi ro dòng tiền và rủi ro pháp lý cần được kiểm soát gắt gao'
  };

  return {
    title: 'Giám Đốc Vận Hành', emoji: '👔',
    traits: ['Quản trị sự vụ tốt', 'Ổn định hệ thống', 'Trách nhiệm cao'],
    bestEnvironment: 'Doanh nghiệp SMEs, giai đoạn duy trì tăng trưởng ổn định',
    watchOut: 'Cần nâng tầm tư duy chiến lược và năng lực thay đổi'
  };
}
