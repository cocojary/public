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
    'Bạn có xu hướng hướng nội rõ rệt. Bạn tái tạo năng lượng tốt nhất khi ở một mình và thường cảm thấy mệt mỏi sau những cuộc giao tiếp kéo dài. Bạn phù hợp với các công việc độc lập, nghiên cứu hoặc phân tích chuyên sâu.',
    'Bạn hơi thiên về hướng nội. Bạn có thể giao tiếp hiệu quả khi cần thiết nhưng thường không chủ động tìm kiếm sự chú ý. Bạn phát huy tốt nhất trong môi trường làm việc ổn định, ít áp lực xã hội cao.',
    'Bạn cân bằng tốt giữa hướng nội và hướng ngoại. Bạn linh hoạt trong việc thích nghi với các tình huống giao tiếp khác nhau, biết khi nào cần chủ động và khi nào cần quan sát.',
    'Bạn thiên về hướng ngoại. Bạn cảm thấy thoải mái trong môi trường làm việc nhóm, dễ dàng kết nối và xây dựng các mối quan hệ mới. Bạn phù hợp với những vai trò cần tương tác thường xuyên.',
    'Bạn là người hướng ngoại điển hình. Bạn là nguồn năng lượng của nhóm, có khả năng xây dựng mạng lưới quan hệ rộng và truyền cảm hứng cho người xung quanh. Bạn rất phù hợp với các vai trò đại diện, đàm phán hoặc lãnh đạo.',
  ],
  agreeableness: [
    'Bạn đề cao tính độc lập và sự thẳng thắn trong giao tiếp. Bạn ưu tiên kết quả công việc và sự thực tế, đôi khi có thể bỏ qua yếu tố cảm xúc để bảo vệ quan điểm cá nhân.',
    'Bạn có khả năng hợp tác nhưng vẫn giữ vững lập trường riêng. Bạn thực tế trong cách giải quyết vấn đề và ưu tiên sự hiệu quả hơn là chỉ để làm hài lòng người khác.',
    'Bạn cân bằng tốt giữa tính hợp tác và tính độc lập. Bạn biết cách nhượng bộ đúng lúc để duy trì hòa khí nhưng vẫn giữ được những nguyên tắc cốt lõi của mình.',
    'Bạn nhiệt tình, hòa đồng và luôn quan tâm đến nhu cầu của đồng nghiệp. Bạn là người kết nối tốt, giúp tạo dựng môi trường làm việc tích cực và thân thiện.',
    'Bạn rất trân trọng sự hòa hợp và luôn nỗ lực hỗ trợ người khác. Bạn đặc biệt phù hợp với các công việc cần sự thấu cảm cao như dịch vụ khách hàng hoặc nhân sự. Hãy lưu ý cân bằng để không quên đi lợi ích cá nhân.',
  ],
  conscientiousness: [
    'Bạn linh hoạt và thích ứng nhanh nhưng đôi khi thiếu đi sự tỉ mỉ. Bạn có thể cảm thấy gò bó với các quy trình khắt khe và cần được nhắc nhở về kế hoạch làm việc định kỳ.',
    'Bạn ưu tiên sự thoải mái hơn là việc tuân thủ tuyệt đối các quy tắc. Bạn cần một môi trường làm việc có cấu trúc rõ ràng để duy trì sự tập trung và đảm bảo tiến độ công việc.',
    'Mức độ tận tâm của bạn ở mức ổn định. Bạn hoàn thành tốt các trách nhiệm được giao trong điều kiện bình thường và biết cách tổ chức công việc ở mức cơ bản.',
    'Bạn là người đáng tin cậy và có tổ chức tốt. Bạn chú trọng đến chất lượng và tính nhất quán của sản phẩm đầu ra, là người đồng đội mẫu mực trong những dự án chuyên nghiệp.',
    'Bạn có tính kỷ luật rất cao và sự tận tâm tuyệt đối. Bạn xuất sắc trong những công việc đòi hỏi độ chính xác và tính quy trình nghiêm ngặt. Sự cầu toàn giúp bạn tạo ra những kết quả không tì vết.',
  ],
  openness: [
    'Bạn là người thực tế, ưu tiên sự ổn định và tin tưởng vào các phương pháp đã được kiểm chứng. Bạn phát huy tốt nhất trong môi trường có quy trình rõ ràng và ít biến động.',
    'Bạn thiên về tính thực dụng hơn là sự sáng tạo thuần túy. Bạn có thể tiếp nhận ý tưởng mới nhưng thường không chủ động đề xuất. Bạn phù hợp với vai trò thực thi hơn là thiết kế chiến lược.',
    'Bạn có sự cân bằng tốt giữa tư duy sáng tạo và tính thực dụng. Bạn có khả năng thích nghi với các thay đổi và sẵn sàng đề xuất những cải tiến hữu ích khi cần thiết.',
    'Bạn là người sáng tạo, ham học hỏi và thích thử nghiệm những ý tưởng mới. Tư duy đa chiều giúp bạn phát triển tốt trong các môi trường đòi hỏi sự đổi mới không ngừng.',
    'Bạn rất sáng tạo và luôn cởi mở với những trải nghiệm mới. Khả năng liên kết nhiều lĩnh vực giúp bạn xuất sắc trong các vai trò chiến lược hoặc thiết kế sản phẩm đột phá.',
  ],
  emotional_stability: [
    'Cảm xúc của bạn dễ bị ảnh hưởng bởi môi trường bên ngoài. Bạn cần một môi trường làm việc tích cực và sự hỗ trợ từ đồng đội để duy trì hiệu suất ổn định.',
    'Bạn đôi khi gặp khó khăn trong việc kiểm soát cảm xúc khi đối mặt với áp lực. Bạn sẽ phát huy tốt nhất trong những điều kiện làm việc ổn định và ít xung đột.',
    'Mức độ ổn định cảm xúc của bạn ở mức trung bình. Bạn có thể xử lý tốt các tình huống căng thẳng thông thường nhưng có thể cảm thấy áp lực khi gặp những biến động lớn.',
    'Bạn là người bình tĩnh và ít bị tác động bởi các yếu tố bên ngoài. Sự vững vàng này giúp bạn duy trì sự tập trung và phục hồi nhanh chóng sau những thách thức.',
    'Bạn rất ổn định và luôn giữ được cái đầu lạnh trong mọi tình huống. Bạn là "điểm tựa cảm xúc" cho đội nhóm, giữ vững hiệu suất ngay cả trong những giai đoạn khó khăn nhất.',
  ],

  // ── 意欲 Ý CHÍ ──────────────────────────────────────────────
  achievement_drive: [
    'Bạn không quá đặt nặng vấn đề thành tích cá nhân mà ưu tiên sự cân bằng. Bạn phù hợp với các công việc có quy trình ổn định và môi trường làm việc hài hòa.',
    'Bạn có tham vọng ở mức vừa phải và thường hài lòng với những kết quả ổn định. Bạn cần những mục tiêu rõ ràng từ bên ngoài để thúc đẩy bản thân bứt phá hơn.',
    'Bạn có khát vọng thành công nhất định và luôn nỗ lực để đạt được các mục tiêu đề ra. Bạn biết cách cân bằng giữa công việc và các yếu tố khác trong cuộc sống.',
    'Bạn sở hữu động lực tự thân mạnh mẽ và luôn khao khát đạt được những kết quả cao hơn. Bạn ít cần sự thúc giục từ bên ngoài để duy trì hiệu suất công việc.',
    'Bạn có khát vọng thành công vượt trội và luôn đặt ra những tiêu chuẩn rất cao cho bản thân. Bạn đặc biệt phù hợp với các môi trường khởi nghiệp hoặc các vị trí lãnh đạo đầy thách thức.',
  ],
  challenge_spirit: [
    'Bạn có xu hướng ưa chuộng sự ổn định và thường thận trọng với những rủi ro. Bạn phát huy tốt nhất trong các môi trường làm việc có tính dự báo cao và ít biến động đột ngột.',
    'Bạn khá thận trọng khi đối mặt với những thách thức mới. Bạn cần thời gian để chuẩn bị và làm quen trước khi tự tin tiếp nhận những nhiệm vụ khó khăn hơn.',
    'Bạn sẵn lòng đối mặt với các thử thách ở mức độ vừa phải. Bạn không né tránh khó khăn nhưng cũng không chủ động tìm kiếm rủi ro nếu không thực sự cần thiết.',
    'Bạn sở hữu tinh thần cầu tiến và thái độ tích cực trước nghịch cảnh. Bạn xem mỗi thách thức là một cơ hội để rèn luyện, phù hợp với các môi trường làm việc năng động và đổi mới.',
    'Bạn là người đặc biệt thích chinh phục những mục tiêu khó khăn và coi thách thức là "nhiên liệu" để thăng tiến. Bạn xuất sắc trong các vai trò tiên phong, khai phá thị trường hoặc xử lý khủng hoảng.',
  ],
  autonomy: [
    'Bạn làm việc hiệu quả nhất khi có sự hướng dẫn chi tiết và lộ trình rõ ràng. Bạn trân trọng sự hỗ trợ và phản hồi thường xuyên từ cấp trên để đảm bảo công việc đi đúng hướng.',
    'Bạn cần một cấu trúc công việc cụ thể và sự định hướng ban đầu để có thể vận hành tốt. Bạn phù hợp với các môi trường có quy trình và tiêu chuẩn hóa rõ rệt.',
    'Bạn có khả năng làm việc độc lập trong phạm vi trách nhiệm được giao. Một chút check-in định kỳ sẽ giúp bạn duy trì sự tự tin và đảm bảo kết quả tối ưu.',
    'Bạn có tinh thần tự chủ cao và khả năng tự xác định phương pháp làm việc hiệu quả. Bạn rất phù hợp với các vị trí Senior hoặc các hình thức làm việc từ xa (Remote).',
    'Bạn là người cực kỳ độc lập và có tư duy của một người làm chủ. Bạn có thể hoạt động xuất sắc chỉ với những mục tiêu tổng quát mà không cần sự giám sát chi tiết nào.',
  ],
  learning_curiosity: [
    'Bạn ưu tiên việc vận hành những kiến thức đã có hơn là tìm kiếm sự đổi mới. Bạn phù hợp với những công việc đòi hỏi sự ổn định và quy trình đào tạo bài bản từ tổ chức.',
    'Bạn sẵn lòng học hỏi khi có yêu cầu cụ thể từ công việc nhưng thường không chủ động tìm kiếm kiến thức mới. Bạn phát huy tốt trong các vai trò vận hành ổn định.',
    'Bạn có mức độ ham học hỏi ổn định. Bạn tiếp nhận các kiến thức liên quan đến công việc và sẵn sàng tham gia các khóa đào tạo khi có cơ hội thuận lợi.',
    'Bạn là người chủ động trong việc tự học và luôn cập nhật những xu hướng mới trong ngành. Tư duy ham học hỏi giúp bạn thích nghi nhanh với các môi trường công nghệ.',
    'Bạn sở hữu niềm đam mê học hỏi không giới hạn và khả năng tự đào tạo xuất sắc. Bạn luôn là người dẫn đầu trong việc thử nghiệm kiến thức mới và thích nghi với mọi sự thay đổi.',
  ],
  recognition_need: [
    'Bạn có sự độc lập cao về mặt động lực và không phụ thuộc vào sự khen ngợi từ bên ngoài. Bạn tự đánh giá kết quả công việc dựa trên những tiêu chuẩn cá nhân khắt khe.',
    'Bạn đánh giá cao sự công nhận nhưng đó không phải là yếu tố tiên quyết để bạn hoàn thành công việc. Bạn có thể duy trì hiệu suất tốt ngay cả khi thiếu đi các phản hồi thường xuyên.',
    'Bạn có nhu cầu được ghi nhận ở mức độ vừa phải. Những lời khen ngợi đúng lúc sẽ là nguồn động viên quý giá giúp bạn tăng thêm nhiệt huyết trong công việc.',
    'Bạn cảm thấy đầy năng lượng và nhiệt tình hơn khi những đóng góp của mình được ghi nhận công khai. Bạn phát huy tốt nhất trong môi trường có văn hóa phản hồi tích cực.',
    'Bạn rất coi trọng sự ghi nhận và coi đó là động lực sống còn để bứt phá. Bạn rất phù hợp với các vai trò đại diện hoặc kinh doanh nơi thành tích thường xuyên được vinh danh.',
  ],

  // ── 思考力 TƯ DUY ────────────────────────────────────────────
  logical_thinking: [
    'Bạn thường đưa ra quyết định dựa trên trực giác và kinh nghiệm thực tế hơn là các phân tích số liệu phức tạp. Bạn rất nhạy bén trong việc cảm nhận các yếu tố con người và bối cảnh.',
    'Bạn có tư duy logic ở mức cơ bản, xử lý tốt các quy trình làm việc đơn giản. Bạn cần sự hỗ trợ nếu phải phân tích những bài toán có quá nhiều biến số phức tạp.',
    'Khả năng tư duy logic của bạn ở mức ổn định. Bạn có thể phân tích vấn đề một cách thấu đáo và đưa ra những giải pháp hợp lý trong hầu hết các tình huống công việc.',
    'Bạn sở hữu tư duy phân tích sắc bén và khả năng ra quyết định dựa trên dữ liệu. Bạn rất phù hợp với các vai trò kỹ thuật chuyên sâu hoặc các công việc phân tích dữ liệu.',
    'Bạn có tư duy logic xuất sắc, có khả năng nhìn thấu các mô hình (patterns) phức tạp mà người khác bỏ sót. Bạn đặc biệt phù hợp cho các vị trí hoạch định chiến lược hoặc kiến trúc sư hệ thống.',
  ],
  empathy: [
    'Bạn tập trung cao độ vào mục tiêu và kết quả công việc. Bạn đề cao sự thẳng thắn và thực tế, đôi khi có thể bỏ qua các yếu tố cảm xúc tinh tế trong giao tiếp nhóm.',
    'Mức độ nhạy cảm xã hội của bạn ở mức vừa phải. Bạn nhận diện được các cảm xúc cơ bản của đồng nghiệp nhưng có thể cần thêm thời gian để điều chỉnh phản ứng cho phù hợp nhất.',
    'Bạn có khả năng thấu cảm tốt và biết cách điều chỉnh phong thái giao tiếp theo từng ngữ cảnh. Điều này giúp bạn duy trì các mối quan hệ làm việc hài hòa và hiệu quả.',
    'Bạn rất nhạy bén với cảm xúc và nhu cầu của người xung quanh. Khả năng thấu cảm cao giúp bạn xây dựng lòng tin và sự kết nối mạnh mẽ trong mọi cuộc giao tiếp.',
    'Bạn sở hữu trí tuệ cảm xúc (EQ) xuất sắc, có khả năng thấu hiểu tâm lý người đối diện một cách sâu sắc. Bạn là người hòa giải lý tưởng và là chuyên gia trong việc phát triển nguồn nhân lực.',
  ],
  execution_speed: [
    'Bạn dành nhiều thời gian để suy nghĩ kỹ lưỡng và chuẩn bị chu đáo trước khi bắt tay vào hành động. Bạn phù hợp với những công việc đề cao sự chính xác tuyệt đối hơn là áp lực về tốc độ.',
    'Bạn hành động thận trọng và thường chỉ bắt đầu sau khi đã thu thập đủ lượng thông tin cần thiết. Bạn phát huy tốt trong các môi trường làm việc có tính ổn định cao.',
    'Tốc độ thực thi của bạn ở mức trung bình, có sự cân bằng tốt giữa khâu chuẩn bị và khâu hành động. Bạn có khả năng thích nghi linh hoạt với hầu hết các môi trường làm việc.',
    'Bạn là người quyết đoán và có khả năng hành động nhanh chóng. Bạn sẵn sàng đưa ra quyết định kịp thời ngay cả trong điều kiện thông tin chưa đầy đủ, phù hợp với môi trường làm việc năng động.',
    'Bạn sở hữu tốc độ thực thi rất cao, quyết đoán và linh hoạt trong mọi tình huống. Bạn cực kỳ xuất sắc trong các vai trò đòi hỏi sự xoay sở nhanh như quản lý khủng hoảng hoặc kinh doanh.',
  ],
  caution: [
    'Bạn ưu tiên tốc độ và sự linh hoạt, đôi khi có thể bỏ qua những chi tiết nhỏ. Bạn nên hình thành thói quen kiểm tra lại công việc hoặc nhờ đồng nghiệp rà soát giúp trước khi hoàn tất.',
    'Đôi khi bạn có thể bỏ sót một vài chi tiết trong quá trình làm việc nhanh. Việc xây dựng một danh mục kiểm tra (checklist) sẽ giúp bạn cải thiện độ chính xác đáng kể.',
    'Mức độ thận trọng của bạn ở mức ổn định. Bạn kiểm tra công việc kỹ lưỡng trong điều kiện bình thường nhưng đôi khi có thể gặp sơ suất khi phải đối mặt với áp lực thời gian lớn.',
    'Bạn là người thận trọng và luôn chú trọng đến từng chi tiết nhỏ. Sự tỉ mỉ này giúp bạn tạo ra những sản phẩm đầu ra chất lượng và đáng tin cậy.',
    'Bạn cực kỳ thận trọng và hiếm khi để xảy ra sai sót nhờ sự tỉ mỉ vượt trội. Bạn là "chốt chặn an toàn" lý tưởng cho đội nhóm trong những dự án đòi hỏi sự chính xác tuyệt đối.',
  ],

  // ── 価値観 GIÁ TRỊ ──────────────────────────────────────────
  growth_orientation: [
    'Bạn ưu tiên sự ổn định trong công việc hiện tại hơn là việc theo đuổi một lộ trình phát triển nhanh chóng. Bạn sẽ phát huy tốt trong các môi trường làm việc ít biến động.',
    'Bạn dành sự quan tâm ở mức vừa phải cho việc thăng tiến bản thân. Nếu có một lộ trình đào tạo và sự dẫn dắt rõ ràng từ tổ chức, tiềm năng của bạn sẽ được khai phá tốt hơn.',
    'Định hướng phát triển của bạn ở mức trung bình. Bạn cân bằng tốt giữa mong muốn hoàn thiện bản thân và nhu cầu duy trì sự ổn định trong cuộc sống.',
    'Bạn luôn có ý thức rõ ràng về lộ trình phát triển sự nghiệp của mình. Bạn chủ động tìm kiếm các cơ hội học hỏi và sẵn sàng nỗ lực để bứt phá lên những vị trí cao hơn.',
    'Bạn khao khát mạnh mẽ việc phát triển và hoàn thiện bản thân không ngừng. Bạn luôn coi mỗi nhiệm vụ là một bước đệm để thăng tiến, rất phù hợp với môi trường có lộ trình thăng tiến rõ rệt.',
  ],
  stability_orientation: [
    'Bạn không quá đặt nặng sự ổn định mà ngược lại, bạn thích thú và biết cách tận dụng sự thay đổi liên tục trong công việc để tạo ra những giá trị mới.',
    'Bạn có nhu cầu ổn định ở mức thấp, điều này giúp bạn trở nên linh hoạt và dễ dàng thích nghi với những biến động hoặc thay đổi trong cấu trúc tổ chức.',
    'Bạn biết cách cân bằng giữa nhu cầu về sự an toàn công việc và khả năng thích ứng với thực tế. Bạn chấp nhận những thay đổi cần thiết nếu chúng mang lại kết quả tốt.',
    'Bạn khá coi trọng sự ổn định và an toàn trong sự nghiệp. Bạn phát huy tốt nhất khi được làm việc trong những môi trường có quy trình và lộ trình phát triển rõ ràng.',
    'Sự ổn định và an toàn là ưu tiên hàng đầu của bạn. Bạn đặc biệt gắn bó với những tổ chức có cơ cấu vững chắc và ít rủi ro, nơi bạn có thể an tâm cống hiến lâu dài.',
  ],
  social_contribution: [
    'Bạn ưu tiên các mục tiêu phát triển cá nhân và sự hiệu quả trong công việc cụ thể. Bạn tập trung cao độ vào việc hoàn thành tốt trách nhiệm được giao hơn là các hoạt động cộng đồng rộng lớn.',
    'Bạn dành sự quan tâm ở mức vừa phải cho các tác động xã hội của công việc. Bạn ưu tiên kết quả thực tế và sự thăng tiến cá nhân trong giai đoạn này.',
    'Bạn có mong muốn được đóng góp cho cộng đồng thông qua công việc của mình. Bạn sẽ cảm thấy gắn kết hơn nếu tổ chức có những hoạt động trách nhiệm xã hội rõ ràng.',
    'Bạn khao khát công việc của mình mang lại những giá trị tích cực cho xã hội. Bạn luôn tìm kiếm ý nghĩa đằng sau những nhiệm vụ hàng ngày để tạo thêm động lực làm việc.',
    'Mong muốn đóng góp cho xã hội là kim chỉ nam cho sự nghiệp của bạn. Bạn khao khát kiến tạo những giá trị nhân văn và luôn ưu tiên những tổ chức có sứ mệnh phục vụ cộng đồng mạnh mẽ.',
  ],

  // ── ストレス耐性 STRESS ──────────────────────────────────────
  stress_mental: [
    'Sức chịu đựng áp lực tinh thần của bạn hiện tại ở mức thấp. Bạn dễ cảm thấy kiệt sức hoặc quá tải trong những môi trường có cường độ làm việc cao. Bạn nên chú trọng vào việc xây dựng sự cân bằng và lựa chọn môi trường làm việc ít xung đột.',
    'Bạn có khả năng chịu đựng áp lực tinh thần ở mức dưới trung bình. Bạn phát huy tốt nhất trong các môi trường có sự hỗ trợ tích cực và lộ trình công việc rõ rệt, tránh các vị trí có áp lực doanh số quá lớn.',
    'Khả năng chịu đựng áp lực tinh thần của bạn ở mức ổn định. Bạn có thể xử lý tốt các tình huống căng thẳng thông thường nhưng cần thời gian nghỉ ngơi hợp lý để tái tạo năng lượng sau những giai đoạn cao điểm.',
    'Bạn có sức chịu đựng áp lực tinh thần tốt và luôn duy trì được hiệu suất trong hầu hết các tình huống khó khăn. Khả năng phục hồi nhanh giúp bạn sẵn sàng đối mặt với những thử thách mới một cách tự tin.',
    'Bạn sở hữu bản lĩnh tinh thần xuất sắc, gần như không bị lay chuyển bởi các xung đột hay thất bại lớn. Bạn là người lý tưởng cho những vị trí có cường độ làm việc khắc nghiệt nhất.',
  ],
  stress_physical: [
    'Sức bền thể chất của bạn hiện tại chưa thực sự cao. Bạn dễ cảm thấy mệt mỏi khi phải làm việc với cường độ lớn trong thời gian dài. Hãy chú trọng vào việc phân bổ thời gian nghỉ ngơi và duy trì lối sống lành mạnh.',
    'Sức chịu đựng thể chất của bạn ở mức dưới trung bình. Bạn nên ưu tiên các công việc có tính chất văn phòng cố định và tránh những vai trò đòi hỏi phải di chuyển liên tục hoặc làm việc quá giờ thường xuyên.',
    'Bạn có sức bền thể chất ở mức ổn định, đáp ứng tốt các yêu cầu công việc trong điều kiện bình thường. Một chế độ sinh hoạt điều độ sẽ giúp bạn duy trì năng lượng bền bỉ suốt ngày dài.',
    'Sức bền thể chất của bạn rất tốt. Bạn duy trì được mức năng lượng cao trong suốt quá trình làm việc và có khả năng xử lý các giai đoạn bận rộn mà không bị ảnh hưởng nhiều đến sức khỏe.',
    'Bạn sở hữu một nguồn năng lượng thể chất dồi dào và sức bền xuất sắc. Bạn cực kỳ phù hợp với các vai trò đòi hỏi cường độ vận động hoặc làm việc ở mức độ cao nhất như quản trị vận hành hay sáng lập khởi nghiệp.',
  ],
  // ── 統率力 LEADERSHIP (CEO/C-LEVEL) ──────────────────────────
  strategic_vision: [
    'Tầm nhìn của bạn hiện tại còn khá hạn hẹp và dễ bị cuốn vào những sự vụ vụn vặt hàng ngày. Bạn cần rèn luyện thêm khả năng dự báo dài hạn để không bị lạc lối khi thị trường có những biến động lớn.',
    'Bạn đã có ý thức về tầm nhìn chiến lược nhưng đôi khi vẫn dễ bị lung lay bởi những áp lực ngắn hạn. Việc tham vấn ý kiến từ các chuyên gia hoặc cố vấn sẽ giúp bạn giữ vững định hướng phát triển cho tổ chức.',
    'Bạn có khả năng lập kế hoạch dài hạn ổn định, biết cách cân bằng giữa các mục tiêu trước mắt và chiến lược tương lai trong điều kiện thị trường ít biến động.',
    'Bạn sở hữu tầm nhìn xa và tư duy chiến lược sắc bén. Bạn sẵn sàng đưa ra những quyết sách mang tính dài hạn để bảo vệ sự phát triển bền vững của tổ chức, thay vì chạy theo những lợi ích nhất thời.',
    'Bạn là một nhà chiến lược xuất chúng với khả năng dự báo và thiết lập tương lai cho ngành. Bạn sở hữu bản lĩnh phi thường để thực hiện những cuộc chuyển đổi mang tính sống còn cho doanh nghiệp.',
  ],
  decision_making: [
    'Bạn có xu hướng thiếu quyết đoán và thường trì hoãn khi phải đối mặt với các quyết định quan trọng. Hãy rèn luyện sự tự tin và dám chịu trách nhiệm để nâng cao hiệu quả lãnh đạo của mình.',
    'Tốc độ ra quyết định của bạn còn khá chậm do bạn quá chú trọng vào việc tìm kiếm các dữ liệu hoàn hảo. Điều này có thể khiến bạn bỏ lỡ những cơ hội kinh doanh quý giá do sự thận trọng quá mức.',
    'Bạn có khả năng ra quyết định ổn định và quyết đoán trong phạm vi chuyên môn của mình. Tuy nhiên, bạn có thể vẫn còn ngập ngừng trước những rủi ro lớn mang tính đột ngột.',
    'Bạn là người quyết đoán, hành động nhanh chóng dựa trên các phân tích xác suất rõ ràng. Bạn dám chịu trách nhiệm về những quyết định mạo hiểm nhưng có sự tính toán kỹ lưỡng.',
    'Bạn có khả năng ra quyết định cực kỳ quyết đoán và sắc bén, đặc biệt là trong các tình huống khủng hoảng. Bạn chính là "điểm tựa cuối cùng" vững chắc nhất cho toàn bộ hệ thống.',
  ],
  ownership: [
    'Bạn có xu hướng thiếu tinh thần trách nhiệm cao nhất đối với kết quả công việc của tổ chức. Hãy rèn luyện sự dũng cảm để nhận trách nhiệm về mình thay vì đổ lỗi cho các yếu tố ngoại cảnh hay nhân sự cấp dưới.',
    'Mức độ cam kết của bạn ở mức trung bình. Bạn sẵn sàng thừa nhận sai sót nhưng đôi khi vẫn cố gắng giảm nhẹ vai trò cá nhân trong các sự cố. Hãy đề cao tính "tự chịu trách nhiệm" để tạo dựng lòng tin mạnh mẽ hơn.',
    'Bạn có trách nhiệm với các công việc điều hành và cam kết thực hiện các mục tiêu chung. Để bứt phá, bạn cần sẵn sàng dấn thân và hy sinh nhiều hơn cho lợi ích dài hạn của tổ chức.',
    'Bạn sở hữu tinh thần làm chủ (Ownership) mạnh mẽ. Bạn luôn sẵn sàng bảo vệ uy tín và quyền lợi của công ty cũng như đội ngũ của mình trong mọi hoàn cảnh khó khăn.',
    'Bạn sở hữu tinh thần "Skin in the game" tuyệt đối, coi sinh mệnh của doanh nghiệp chính là sinh mệnh của bản thân. Bạn luôn sẵn sàng chịu trách nhiệm cuối cùng và là tấm gương sáng về sự tận tụy.',
  ],
  people_leadership: [
    'Phong cách quản trị của bạn còn mang tính áp đặt và kiểm soát quá mức (micromanagement). Điều này có thể gây áp lực và làm giảm đi sự sáng tạo cũng như nhiệt huyết của những nhân sự giỏi.',
    'Bạn có xu hướng kiểm soát quá chi tiết công việc của cấp dưới và chưa thực sự tin tưởng để giao quyền hoàn toàn. Hãy rèn luyện kỹ năng lắng nghe và thúc đẩy sự tự chủ của đội ngũ.',
    'Bạn có phong cách lãnh đạo ổn định, biết cách trao quyền trong phạm vi kiểm soát nhất định. Việc thu hẹp khoảng cách và tăng cường sự kết nối sẽ giúp bạn điều hành hiệu quả hơn.',
    'Bạn là người lãnh đạo biết cách trao quyền mạnh mẽ và khuyến khích sự phản biện tích cực. Bạn có khả năng trọng dụng những nhân tài giỏi hơn mình và tạo ra không gian phát triển lý tưởng cho họ.',
    'Bạn là một bậc thầy trong việc dùng người và xây dựng văn hóa tin tưởng tuyệt đối. Khả năng truyền cảm hứng và sự quyết đoán của bạn chính là động lực giúp tổ chức thay đổi và bứt phá mạnh mẽ.',
  ],
  organization_building: [
    'Bạn hiện đang tập trung quá nhiều vào các sự vụ cụ thể mà chưa chú trọng đến việc xây dựng hệ thống. Điều này khiến tổ chức vận hành rời rạc và phụ thuộc hoàn toàn vào sự có mặt của bạn.',
    'Bạn đã bắt đầu có ý thức về việc xây dựng quy trình nhưng hệ thống vẫn còn thiếu tính đồng bộ. Bạn cần tối ưu hóa cấu trúc để loại bỏ các điểm nghẽn trong vận hành.',
    'Khả năng xây dựng hệ thống của bạn ở mức khá. Bạn đã thiết lập được các quy trình rõ ràng cho những mảng vận hành cốt lõi, giúp giảm thiểu sự phụ thuộc vào các cá nhân cụ thể.',
    'Bạn sở hữu tư duy hệ thống sắc bén và khả năng xây dựng bộ máy tự vận hành dựa trên các khung (Framework) quản trị hiện đại và quy trình chuyên nghiệp.',
    'Bạn là "kiến trúc sư tổ chức" tài ba, có khả năng xây dựng một bộ máy tự vận hành và mở rộng không giới hạn mà không cần đến sự can thiệp trực tiếp thường xuyên của người lãnh đạo.',
  ],
  performance_management: [
    'Cách quản trị hiệu suất của bạn hiện tại còn thiên về cảm xúc hoặc thiếu sự công bằng cần thiết. Các chỉ số đo lường lỏng lẻo có thể dẫn đến sự bóp méo kết quả thực tế của tổ chức.',
    'Bạn đã thiết lập hệ thống KPI nhưng việc thực thi chưa thực sự triệt để. Bạn có xu hướng nể nang hoặc chưa quyết liệt với các nhân sự có hiệu suất kém nhưng có thâm niên.',
    'Bạn quản trị hiệu suất dựa trên dữ liệu ổn định và minh bạch trong thưởng phạt. Một chút linh hoạt và thấu hiểu hơn sẽ giúp bạn tối ưu hóa động lực của đội ngũ.',
    'Bạn rất quyết liệt với các chỉ số và mục tiêu. Sự công bằng và tinh thần thưởng phạt phân minh của bạn giúp loại bỏ sự trì trệ và thúc đẩy sự cống hiến thực chất từ nhân viên.',
    'Bạn sở hữu kỷ luật thép trong điều hành và luôn thiết lập tiêu chuẩn hiệu suất cực cao. Khả năng xoay chuyển năng suất tổ chức bằng các cơ chế vận hành sắc lẹm là thế mạnh vượt trội của bạn.',
  ],
  financial_management: [
    'Bạn còn khá mơ hồ về các chỉ số tài chính sống còn, điều này có thể dẫn đến việc quản trị dòng tiền lỏng lẻo và gây rủi ro cho sự tồn tại lâu dài của tổ chức.',
    'Bạn quản trị tài chính ở mức an toàn nhưng còn thiếu tư duy tối ưu hóa nguồn vốn. Bạn dễ bị thụ động trước những biến động chi phí đột ngột từ thị trường.',
    'Bạn kiểm soát tài chính tốt, biết cách cân bằng giữa dòng tiền và doanh thu để duy trì biên lợi nhuận ở mức chấp nhận được cho doanh nghiệp.',
    'Bạn sở hữu tư duy tài chính sắc sảo, luôn kiểm soát chặt chẽ biên lợi nhuận và các quỹ dự phòng. Sức khỏe dòng tiền luôn là ưu tiên hàng đầu trong các quyết sách của bạn.',
    'Bạn là một chiến lược gia tài chính xuất sắc với khả năng tối ưu hóa cấu trúc vốn vượt trội. Bản lĩnh của bạn giúp bảo vệ tổ chức trước những rủi ro thâm hụt tài chính.',
  ],
  customer_partner_management: [
    'Bạn có xu hướng coi trọng lợi ích ngắn hạn hơn là uy tín lâu dài. Hãy cẩn trọng vì việc nhượng bộ sai lầm hoặc thiếu minh bạch có thể làm tổn hại đến các mối quan hệ chiến lược.',
    'Bạn giao tiếp với khách hàng tốt nhưng chưa xây dựng được các mối quan hệ đối tác chiến lược bền vững và công bằng. Sự minh bạch hơn sẽ giúp bạn tiến xa.',
    'Bạn duy trì sự minh bạch với đối tác và khách hàng ở mức tiêu chuẩn, luôn xử lý sự cố đúng quy trình và giữ vững các cam kết trong hợp đồng.',
    'Bạn xây dựng mối quan hệ dựa trên sự minh bạch tuyệt đối và sẵn lòng ưu tiên uy tín chiến lược hơn lợi ích nhất thời. Bạn biết cách chọn lọc và giữ lại những đối tác giá trị nhất.',
    'Bạn sở hữu tư duy hợp tác đẳng cấp, xây dựng được một hệ sinh thái đối tác bền vững. Sự chính trực của bạn chính là lợi thế cạnh tranh vô hình cực lớn của tổ chức.',
  ],
  executive_communication: [
    'Cách giao tiếp của bạn hiện tại còn khá dài dòng và thiếu trọng tâm, dễ dẫn đến những hiểu lầm hoặc làm loãng đi các thông điệp chiến lược quan trọng.',
    'Bạn truyền đạt thông tin rõ ràng nhưng đôi khi còn thiếu sức nặng và sự quyết đoán. Hãy thẳng thắn hơn khi đối mặt với những thông tin tiêu cực hoặc nhạy cảm.',
    'Bạn giao tiếp điều hành hiệu quả, luôn truyền tải thông điệp ngắn gọn và đúng mục tiêu trong hầu hết các hoạt động chỉ đạo công việc.',
    'Ngôn ngữ của bạn sắc bén và trực diện. Khả năng đơn giản hóa các vấn đề phức tạp thành những thông điệp đầy sức mạnh của bạn luôn nhận được sự nể phục từ đội ngũ.',
    'Bạn là bậc thầy trong truyền thông điều hành. Khả năng diễn thuyết truyền cảm hứng song hành với sự sắc lẹm trong chỉ đạo giúp mọi lời nói của bạn đều mang sức nặng ngàn cân.',
  ],
  change_management: [
    'Bạn có xu hướng ngại đổi mới và thường bám víu vào những cách làm cũ. Hãy cởi mở hơn với những thay đổi để tránh làm tổ chức bị trì trệ trong dòng chảy của thị trường.',
    'Bạn có ý định cải cách nhưng thường thiếu phương pháp cụ thể hoặc dễ bỏ cuộc khi gặp sự phản kháng từ nội bộ. Hãy kiên trì và tìm kiếm những hướng đi bài bản hơn.',
    'Bạn thích nghi tốt với sự thay đổi và luôn thực hiện các đợt cải tiến quy trình một cách ổn định, có lộ trình rõ ràng và dễ tiếp nhận.',
    'Bạn rất mạnh mẽ trong việc thúc đẩy cải cách. Bạn dám thay đổi những gì đã cũ kỹ và lỗi thời để hiện đại hóa tổ chức, chấp nhận những thử thách lớn để tiến lên.',
    'Bạn là nhà cách tân không ngừng nghỉ, luôn ở trạng thái chủ động đổi mới để dẫn dắt tổ chức nhảy vọt qua các giai đoạn khó khăn của thị trường.',
  ],
  risk_management: [
    'Tư duy ngắn hạn, bỏ qua các dấu hiệu cảnh báo đỏ. Coi thường pháp lý và bảo mật, dễ đẩy công ty vào vòng lao lý.',
    'Quản trị rủi ro theo kiểu "nước đến chân mới nhảy". Chỉ chú trọng phòng ngừa sau khi đã xảy ra sự cố nghiêm trọng.',
    'Có ý thức phòng ngừa rủi ro tiêu chuẩn. Tuân thủ pháp lý và có kịch bản dự phòng cho các mảng kinh doanh chính.',
    'Chủ động đầu tư cho hệ thống phòng ngừa rủi ro. Tuyệt đối thượng tôn pháp luật và an toàn. Có kịch bản khủng hoảng chi tiết.',
    'Năng lực dự báo và quản trị rủi ro tuyệt đỉnh. Biến các kịch bản bất lợi thành cơ hội phản ứng nhanh. Bảo vệ tổ chức bằng sự thận trọng thông minh.',
  ],
  self_discipline: [
    'Bạn hiện tại còn thiếu tính kỷ luật cá nhân và có xu hướng làm việc theo cảm hứng. Hãy tự hình thành nề nếp để làm gương tốt nhất cho đội ngũ của mình.',
    'Kỷ luật cá nhân của bạn ở mức trung bình. Đôi khi những áp lực từ sự vụ hàng ngày vẫn làm phá vỡ nề nếp và lịch trình chiến lược mà bạn đã đề ra.',
    'Bạn duy trì kỷ luật cá nhân tốt và luôn tuân thủ các cam kết nội bộ. Sự gương mẫu của bạn trong điều kiện bình thường là nền tảng vững chắc cho sự vận hành của đội ngũ.',
    'Bạn sở hữu kỷ luật cá nhân khắt khe và luôn đi đầu trong việc thực hiện các quy định chung. Năng lượng và sự tập trung của bạn là nguồn cảm hứng lớn cho nhân viên mỗi ngày.',
    'Bạn là hình mẫu lý tưởng về sự tự quản và kỷ luật bản thân. Khả năng kiểm soát thời gian và năng lượng xuất sắc giúp bạn duy trì quyền lực điều hành một cách thuyết phục nhất.',
  ],
  continuous_learning: [
    'Bạn có xu hướng tự mãn với những kinh nghiệm cũ và ít chú trọng đến việc cập nhật kiến thức mới. Hãy cởi mở hơn với những xu hướng mới để không bị tụt hậu.',
    'Bạn học hỏi một cách thụ động và thường chỉ thay đổi khi thực sự bắt buộc. Việc chủ động hơn trong học tập sẽ giúp bạn dẫn dắt tổ chức hiệu quả hơn.',
    'Bạn có tinh thần học hỏi ổn định và luôn cố gắng tham khảo các kiến thức mới để áp dụng vào thực tế điều hành công việc hàng ngày.',
    'Khao khát học hỏi của bạn rất mãnh liệt. Bạn sẵn lòng đầu tư lớn cho phát triển trí tuệ cá nhân và không ngại thay đổi những tư duy đã cũ để tiến bộ hơn.',
    'Bạn sở hữu tư duy "Học sinh vĩnh viễn", luôn cập nhật những kiến thức tiên phong nhất toàn cầu. Khả năng tự học và thay đổi tư duy cực nhanh giúp bạn luôn dẫn đầu.',
  ],
  pressure_balance: [
    'Bạn dễ mất bình tĩnh dưới áp lực và có thể có những phản ứng chưa phù hợp với đội ngũ. Hãy rèn luyện sự kiểm soát cảm xúc để đưa ra những quyết định sáng suốt hơn.',
    'Bạn chịu được áp lực vừa phải nhưng dễ bị dao động tâm lý trong các cuộc khủng hoảng lớn. Bạn cần một môi trường ổn định để duy trì sự sáng suốt trong điều hành.',
    'Bản lĩnh của bạn ổn định dưới áp lực. Bạn duy trì được sự tỉnh táo để đưa ra các quyết sách đúng đắn trong hầu hết các tình huống khó khăn và thách thức.',
    'Bạn luôn giữ được sự lý trí sắc lạnh giữa mọi biến động. Khả năng kiểm soát cảm xúc tuyệt vời giúp bạn kiên định với chiến lược bất chấp sóng gió của thị trường.',
    'Bạn sở hữu tinh thần thép và sự tĩnh lặng tuyệt đối trước mọi khủng hoảng sống còn. Sự điềm tĩnh của bạn chính là điểm tựa vững chắc nhất cho toàn bộ tổ chức.',
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
      ? 'Tốc độ trả lời quá nhanh, có khả năng người dùng không đọc kỹ câu hỏi.'
      : 'Tốc độ trả lời nằm trong giới hạn cho phép, đảm bảo tính suy nghĩ của người trả lời.',
    hrNote: rel.speedFlag ? 'Cần yêu cầu giải trình hoặc thực hiện lại để đảm bảo tính khách quan.' : 'Không có lưu ý đặc biệt.',
  });

  // 4. Nguy cơ kiệt sức (Burnout)
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

// ─── TOP-3 PERSONA DETECTION (v4.1) ───────────────────────────────────────
// Thay vì chỉ trả về 1 persona, tính similarity score cho tất cả archetype
// và trả về Top 3 kèm mức độ tin cậy.

export interface PersonaRankedResult {
  rank: number;
  persona: PersonaType;
  matchScore: number; // 0–100
  confidence: 'high' | 'medium' | 'low';
}

/**
 * detectPersonaRanked — Trả về top 3 persona phù hợp nhất với điểm similarity.
 * Rule: mỗi archetype có 1 "ideal profile" → tính Euclidean distance → score cao = gần ideal.
 */
export function detectPersonaRanked(dims: DimensionScore[]): PersonaRankedResult[] {
  const get = (id: string) => {
    const d = dims.find(d => d.dimensionId === id);
    // Ưu tiên scaledContinuous nếu có (v4.1)
    return (d as any)?.scaledContinuous ?? d?.scaled ?? 5;
  };

  const ext = get('extraversion');
  const agr = get('agreeableness');
  const con = get('conscientiousness');
  const ope = get('openness');
  const emo = get('emotional_stability');
  const ach = get('achievement_drive');
  const log = get('logical_thinking');
  const emp = get('empathy');
  const aut = get('autonomy');

  // Định nghĩa "ideal profile" cho từng archetype
  // Format: { dimensionId: idealScore } — chỉ các dimension quan trọng nhất
  const archetypes: Array<{ persona: PersonaType; profile: Record<string, number> }> = [
    {
      persona: { title: 'Nhà Chiến Lược', emoji: '♟️',
        traits: ['Tư duy chiến lược', 'Định hướng kết quả cao', 'Độc lập và tự chủ'],
        bestEnvironment: 'Môi trường cạnh tranh, vị trí senior hoặc leadership',
        watchOut: 'Có thể khó làm việc với người có tốc độ chậm hơn' },
      profile: { achievement_drive: 9, logical_thinking: 8, autonomy: 8, emotional_stability: 7 },
    },
    {
      persona: { title: 'Chiến Binh Sales', emoji: '🎯',
        traits: ['Năng động, quyết đoán', 'Khát vọng thành tích cao', 'Không ngại từ chối'],
        bestEnvironment: 'Sales, business development, account management',
        watchOut: 'Cần phát triển thêm kỹ năng lắng nghe và empathy' },
      profile: { extraversion: 8, achievement_drive: 8, empathy: 4, challenge_spirit: 8 },
    },
    {
      persona: { title: 'Nhà Kết Nối', emoji: '🤝',
        traits: ['Nhạy bén với cảm xúc', 'Xây dựng quan hệ tốt', 'Hòa giải xung đột'],
        bestEnvironment: 'HR, customer success, team lead, đào tạo',
        watchOut: 'Tránh để người khác lợi dụng sự tốt bụng' },
      profile: { empathy: 8, agreeableness: 8, extraversion: 7, emotional_stability: 7 },
    },
    {
      persona: { title: 'Kiến Trúc Sư Hệ Thống', emoji: '🏗️',
        traits: ['Tư duy logic sâu', 'Tỉ mỉ và có hệ thống', 'Làm việc tốt độc lập'],
        bestEnvironment: 'Engineering, data, architecture, research',
        watchOut: 'Cần cải thiện kỹ năng giao tiếp kết quả với non-technical' },
      profile: { logical_thinking: 9, conscientiousness: 8, extraversion: 3, autonomy: 7 },
    },
    {
      persona: { title: 'Người Đổi Mới', emoji: '💡',
        traits: ['Sáng tạo và tò mò', 'Luôn tìm cách mới', 'Học nhanh và thích nghi tốt'],
        bestEnvironment: 'Product, R&D, startup, creative direction',
        watchOut: 'Có thể nhàm chán với công việc routine. Cần variety' },
      profile: { openness: 9, achievement_drive: 7, logical_thinking: 7, learning_curiosity: 8 },
    },
    {
      persona: { title: 'Trụ Cột Đáng Tin Cậy', emoji: '⚓',
        traits: ['Đáng tin cậy và ổn định', 'Tổ chức tốt', 'Thực thi xuất sắc'],
        bestEnvironment: 'Operations, admin, compliance, project execution',
        watchOut: 'Có thể ngại thay đổi đột ngột. Cần thích nghi dần dần' },
      profile: { conscientiousness: 9, emotional_stability: 8, agreeableness: 7, caution: 8 },
    },
    {
      persona: { title: 'Đa Năng Cân Bằng', emoji: '⚖️',
        traits: ['Linh hoạt và thích nghi', 'Phù hợp nhiều vai trò', 'Cân bằng giữa các tính cách'],
        bestEnvironment: 'Hầu hết môi trường làm việc thông thường',
        watchOut: 'Nên xác định rõ hơn điểm mạnh nổi bật để phát triển sâu hơn' },
      profile: { extraversion: 5, agreeableness: 5, conscientiousness: 5, openness: 5 },
    },
  ];

  // Tính similarity score dựa trên distance từ ideal profile
  const dimValues: Record<string, number> = {
    extraversion: ext, agreeableness: agr, conscientiousness: con,
    openness: ope, emotional_stability: emo, achievement_drive: ach,
    logical_thinking: log, empathy: emp, autonomy: aut,
    // Fallback cho dimension khác
    challenge_spirit: get('challenge_spirit'),
    learning_curiosity: get('learning_curiosity'),
    caution: get('caution'),
  };

  const scored = archetypes.map(a => {
    const profileEntries = Object.entries(a.profile);
    let sumSquaredDiff = 0;
    for (const [dimId, ideal] of profileEntries) {
      const actual = dimValues[dimId] ?? 5;
      sumSquaredDiff += Math.pow(ideal - actual, 2);
    }
    // RMSE → convert thành score 0-100 (max RMSE ~9 khi ngược hoàn toàn)
    const rmse = Math.sqrt(sumSquaredDiff / profileEntries.length);
    const matchScore = Math.round(Math.max(0, Math.min(100, (1 - rmse / 7) * 100)));
    return { persona: a.persona, matchScore };
  });

  // Sắp xếp giảm dần và lấy Top 3
  const ranked = [...scored].sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);

  // Tính confidence dựa trên khoảng cách giữa rank 1 và rank 2
  const gap12 = ranked.length >= 2 ? ranked[0].matchScore - ranked[1].matchScore : 100;

  return ranked.map((r, i) => ({
    rank: i + 1,
    persona: r.persona,
    matchScore: r.matchScore,
    confidence: i === 0
      ? (gap12 >= 15 ? 'high' : gap12 >= 8 ? 'medium' : 'low')
      : (i === 1
        ? (gap12 < 8 ? 'medium' : 'low')
        : 'low'),
  }));
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
