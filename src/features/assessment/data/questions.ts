// ============================================================
// QUESTIONS BANK — Techzen HR Assessment (120 câu chính xác)
// + 8 Lie Scale + 4 Consistency = 132 câu tổng
// ============================================================

export interface Question {
  id: number;
  text: string;
  dimensionId: string;
  reversed: boolean;
  isLie?: boolean;
  consistencyGroup?: string;
}

export const QUESTIONS: Question[] = [
  // ─── EXTRAVERSION (8 câu) ──────────────────────────────────
  { id: 1,  text: 'Tôi thích tham gia các buổi gặp gỡ, sự kiện và tụ họp đông người.', dimensionId: 'extraversion', reversed: false },
  { id: 2,  text: 'Tôi dễ dàng bắt đầu cuộc trò chuyện với người mà tôi chưa quen.', dimensionId: 'extraversion', reversed: false },
  { id: 3,  text: 'Tôi cảm thấy tràn đầy năng lượng sau khi làm việc với nhiều người.', dimensionId: 'extraversion', reversed: false },
  { id: 4,  text: 'Tôi thường là người nói chuyện nhiều và dẫn dắt nhóm.', dimensionId: 'extraversion', reversed: false },
  { id: 5,  text: 'Sau một ngày tiếp xúc với nhiều người, tôi cảm thấy mệt mỏi và cần thời gian một mình.', dimensionId: 'extraversion', reversed: true, consistencyGroup: 'EXT' },
  { id: 6,  text: 'Tôi thích làm việc độc lập hơn là phối hợp liên tục với nhiều người.', dimensionId: 'extraversion', reversed: true },
  { id: 7,  text: 'Trong cuộc họp, tôi thường lắng nghe nhiều hơn là phát biểu.', dimensionId: 'extraversion', reversed: true },
  { id: 8,  text: 'Tôi cảm thấy thoải mái hơn khi làm việc trong không gian yên tĩnh.', dimensionId: 'extraversion', reversed: true },

  // ─── AGREEABLENESS (8 câu) ─────────────────────────────────
  { id: 9,  text: 'Tôi sẵn sàng giúp đỡ đồng nghiệp dù điều đó ảnh hưởng đến thời gian của mình.', dimensionId: 'agreeableness', reversed: false },
  { id: 10, text: 'Tôi cố gắng hiểu quan điểm của người khác trước khi đưa ra phán xét.', dimensionId: 'agreeableness', reversed: false },
  { id: 11, text: 'Tôi tin tưởng rằng hầu hết mọi người đều có ý định tốt.', dimensionId: 'agreeableness', reversed: false },
  { id: 12, text: 'Tôi thường nhường bộ trong tranh luận để giữ hòa khí.', dimensionId: 'agreeableness', reversed: false, consistencyGroup: 'AGR' },
  { id: 13, text: 'Tôi thẳng thắn nói quan điểm ngay cả khi biết người khác sẽ không thích.', dimensionId: 'agreeableness', reversed: true },
  { id: 14, text: 'Tôi ưu tiên kết quả công việc hơn là cảm xúc của mọi người trong nhóm.', dimensionId: 'agreeableness', reversed: true },
  { id: 15, text: 'Trong xung đột, tôi thường giữ vững lập trường của mình đến cùng.', dimensionId: 'agreeableness', reversed: true },
  { id: 16, text: 'Tôi đôi khi cảm thấy người khác đang lợi dụng sự tốt bụng của mình.', dimensionId: 'agreeableness', reversed: true },

  // ─── CONSCIENTIOUSNESS (8 câu) ─────────────────────────────
  { id: 17, text: 'Tôi luôn lập kế hoạch cụ thể trước khi bắt đầu một công việc quan trọng.', dimensionId: 'conscientiousness', reversed: false },
  { id: 18, text: 'Tôi hoàn thành công việc đúng deadline dù gặp khó khăn.', dimensionId: 'conscientiousness', reversed: false },
  { id: 19, text: 'Tôi giữ gìn không gian làm việc và tài liệu của mình ngăn nắp, có tổ chức.', dimensionId: 'conscientiousness', reversed: false },
  { id: 20, text: 'Tôi tuân thủ các quy định và quy trình của tổ chức một cách nhất quán.', dimensionId: 'conscientiousness', reversed: false },
  { id: 21, text: 'Tôi hay trì hoãn công việc và thường hoàn thành vào phút cuối.', dimensionId: 'conscientiousness', reversed: true, consistencyGroup: 'CON' },
  { id: 22, text: 'Tôi thường bỏ qua chi tiết nhỏ để tập trung vào bức tranh tổng thể.', dimensionId: 'conscientiousness', reversed: true },
  { id: 23, text: 'Tôi hay bắt đầu nhiều việc cùng lúc nhưng không hoàn thành đến nơi đến chốn.', dimensionId: 'conscientiousness', reversed: true },
  { id: 24, text: 'Tôi đôi khi quên các cuộc hẹn hoặc cam kết đã hứa với người khác.', dimensionId: 'conscientiousness', reversed: true },

  // ─── OPENNESS (7 câu) ──────────────────────────────────────
  { id: 25, text: 'Tôi thích khám phá những ý tưởng và cách tiếp cận hoàn toàn mới.', dimensionId: 'openness', reversed: false },
  { id: 26, text: 'Tôi thường nghĩ ra những cách giải quyết sáng tạo cho vấn đề quen thuộc.', dimensionId: 'openness', reversed: false },
  { id: 27, text: 'Tôi sẵn sàng thay đổi quan điểm khi có bằng chứng thuyết phục.', dimensionId: 'openness', reversed: false },
  { id: 28, text: 'Tôi đọc nhiều và quan tâm đến nhiều chủ đề đa dạng ngoài công việc.', dimensionId: 'openness', reversed: false },
  { id: 29, text: 'Tôi thích dùng các phương pháp đã được kiểm chứng hơn là thử nghiệm cái mới.', dimensionId: 'openness', reversed: true },
  { id: 30, text: 'Tôi cảm thấy không thoải mái khi mọi thứ thay đổi quá nhiều và quá nhanh.', dimensionId: 'openness', reversed: true },
  { id: 31, text: 'Trong công việc, tôi ưu tiên sự ổn định hơn là thử nghiệm cách làm mới.', dimensionId: 'openness', reversed: true },

  // ─── EMOTIONAL STABILITY (7 câu) ───────────────────────────
  { id: 32, text: 'Tôi giữ được bình tĩnh trong các tình huống áp lực cao.', dimensionId: 'emotional_stability', reversed: false },
  { id: 33, text: 'Tôi ít bị ảnh hưởng bởi lời chỉ trích hay phê phán từ người khác.', dimensionId: 'emotional_stability', reversed: false },
  { id: 34, text: 'Tôi nhanh chóng lấy lại tinh thần sau khi gặp thất bại hay thất vọng.', dimensionId: 'emotional_stability', reversed: false },
  { id: 35, text: 'Tôi có thể kiểm soát cảm xúc ngay cả trong những tranh luận gay gắt.', dimensionId: 'emotional_stability', reversed: false },
  { id: 36, text: 'Tôi hay lo lắng về những điều có thể xảy ra không tốt trong tương lai.', dimensionId: 'emotional_stability', reversed: true },
  { id: 37, text: 'Tôi dễ bị ảnh hưởng bởi bầu không khí tiêu cực hoặc căng thẳng trong nhóm.', dimensionId: 'emotional_stability', reversed: true },
  { id: 38, text: 'Đôi khi tôi phản ứng quá mức với các tình huống không như ý muốn.', dimensionId: 'emotional_stability', reversed: true },

  // ─── ACHIEVEMENT DRIVE (7 câu) ─────────────────────────────
  { id: 39, text: 'Tôi luôn đặt ra mục tiêu cao hơn so với yêu cầu tối thiểu được giao.', dimensionId: 'achievement_drive', reversed: false },
  { id: 40, text: 'Tôi cảm thấy buồn và không hài lòng khi không đạt được kết quả tốt nhất.', dimensionId: 'achievement_drive', reversed: false },
  { id: 41, text: 'Khi đạt được mục tiêu, tôi ngay lập tức đặt ra mục tiêu tiếp theo cao hơn.', dimensionId: 'achievement_drive', reversed: false },
  { id: 42, text: 'Tôi muốn là người giỏi nhất trong lĩnh vực chuyên môn của mình.', dimensionId: 'achievement_drive', reversed: false },
  { id: 43, text: 'Tôi hài lòng với việc hoàn thành công việc ở mức "đủ tốt" mà không cần xuất sắc.', dimensionId: 'achievement_drive', reversed: true },
  { id: 44, text: 'Tôi không đặt áp lực lớn cho bản thân về thành tích hay kết quả.', dimensionId: 'achievement_drive', reversed: true },
  { id: 45, text: 'Tôi ít cảm thấy cạnh tranh với người khác và không quan tâm đến việc so sánh.', dimensionId: 'achievement_drive', reversed: true },

  // ─── CHALLENGE SPIRIT (6 câu) ──────────────────────────────
  { id: 46, text: 'Tôi chủ động tham gia vào các dự án khó và nhiều thách thức.', dimensionId: 'challenge_spirit', reversed: false },
  { id: 47, text: 'Khi thất bại, tôi phân tích nguyên nhân và thử lại theo cách khác.', dimensionId: 'challenge_spirit', reversed: false },
  { id: 48, text: 'Tôi cảm thấy hứng khởi khi đối mặt với vấn đề chưa có lời giải.', dimensionId: 'challenge_spirit', reversed: false },
  { id: 49, text: 'Tôi sẵn sàng học kỹ năng hoàn toàn mới dù ban đầu rất khó.', dimensionId: 'challenge_spirit', reversed: false },
  { id: 50, text: 'Tôi thích tránh những tình huống có nhiều rủi ro thất bại.', dimensionId: 'challenge_spirit', reversed: true },
  { id: 51, text: 'Tôi ngại nhận công việc khi chưa chắc mình có thể làm tốt.', dimensionId: 'challenge_spirit', reversed: true },

  // ─── AUTONOMY (6 câu) ──────────────────────────────────────
  { id: 52, text: 'Tôi tự xác định phương pháp làm việc mà không cần chờ hướng dẫn chi tiết.', dimensionId: 'autonomy', reversed: false },
  { id: 53, text: 'Tôi chủ động giải quyết vấn đề thay vì chờ đợi quyết định từ cấp trên.', dimensionId: 'autonomy', reversed: false },
  { id: 54, text: 'Tôi cảm thấy tốt hơn khi được giao mục tiêu rõ ràng mà không bị kiểm soát từng bước.', dimensionId: 'autonomy', reversed: false },
  { id: 55, text: 'Tôi đề xuất cải tiến quy trình dù không ai yêu cầu.', dimensionId: 'autonomy', reversed: false },
  { id: 56, text: 'Tôi cần người hướng dẫn từng bước để hoàn thành công việc một cách tốt nhất.', dimensionId: 'autonomy', reversed: true },
  { id: 57, text: 'Tôi thích được kiểm tra và phê duyệt thường xuyên trong quá trình làm việc.', dimensionId: 'autonomy', reversed: true },

  // ─── LEARNING CURIOSITY (6 câu) ────────────────────────────
  { id: 58, text: 'Tôi dành thời gian tự học các kỹ năng mới ngoài công việc hàng ngày.', dimensionId: 'learning_curiosity', reversed: false },
  { id: 59, text: 'Tôi thường xuyên đọc sách, bài viết, hoặc nghe podcast về lĩnh vực chuyên môn.', dimensionId: 'learning_curiosity', reversed: false },
  { id: 60, text: 'Tôi đặt câu hỏi nhiều và tìm kiếm sự hiểu biết sâu hơn về mọi vấn đề.', dimensionId: 'learning_curiosity', reversed: false },
  { id: 61, text: 'Tôi chủ động tìm kiếm phản hồi từ người khác để cải thiện bản thân.', dimensionId: 'learning_curiosity', reversed: false },
  { id: 62, text: 'Tôi ít quan tâm đến các xu hướng và kiến thức mới trong lĩnh vực của mình.', dimensionId: 'learning_curiosity', reversed: true },
  { id: 63, text: 'Tôi cảm thấy những kỹ năng hiện tại đã đủ và không cần học thêm.', dimensionId: 'learning_curiosity', reversed: true },

  // ─── RECOGNITION NEED (5 câu) ──────────────────────────────
  { id: 64, text: 'Tôi cảm thấy có động lực hơn đáng kể khi được công nhận công khai.', dimensionId: 'recognition_need', reversed: false },
  { id: 65, text: 'Lời khen từ cấp trên hoặc đồng nghiệp có ý nghĩa lớn với tôi.', dimensionId: 'recognition_need', reversed: false },
  { id: 66, text: 'Tôi cảm thấy khó chịu khi đóng góp của mình không được ai ghi nhận.', dimensionId: 'recognition_need', reversed: false },
  { id: 67, text: 'Tôi làm tốt công việc ngay cả khi không ai biết hoặc ghi nhận.', dimensionId: 'recognition_need', reversed: true },
  { id: 68, text: 'Tôi không cần lời khen để duy trì động lực làm việc.', dimensionId: 'recognition_need', reversed: true },

  // ─── LOGICAL THINKING (7 câu) ──────────────────────────────
  { id: 69, text: 'Tôi phân tích nguyên nhân gốc rễ khi gặp vấn đề thay vì xử lý triệu chứng bề mặt.', dimensionId: 'logical_thinking', reversed: false },
  { id: 70, text: 'Tôi đưa ra quyết định dựa trên dữ liệu và bằng chứng cụ thể.', dimensionId: 'logical_thinking', reversed: false },
  { id: 71, text: 'Tôi thích xây dựng kế hoạch có cấu trúc rõ ràng với các bước cụ thể.', dimensionId: 'logical_thinking', reversed: false },
  { id: 72, text: 'Tôi dễ dàng nhận ra mâu thuẫn hoặc lỗ hổng trong lập luận của người khác.', dimensionId: 'logical_thinking', reversed: false },
  { id: 73, text: 'Tôi thích làm việc có hệ thống và phân loại thông tin theo cấu trúc rõ ràng.', dimensionId: 'logical_thinking', reversed: false },
  { id: 74, text: 'Tôi thường quyết định theo trực giác hơn là phân tích kỹ.', dimensionId: 'logical_thinking', reversed: true },
  { id: 75, text: 'Tôi ít kiên nhẫn với các cuộc thảo luận dài dòng về dữ liệu và lý thuyết.', dimensionId: 'logical_thinking', reversed: true },

  // ─── EMPATHY (6 câu) ───────────────────────────────────────
  { id: 76, text: 'Tôi dễ dàng nhận ra khi đồng nghiệp đang có vấn đề về cảm xúc.', dimensionId: 'empathy', reversed: false },
  { id: 77, text: 'Tôi điều chỉnh cách giao tiếp tùy theo tâm trạng và đặc điểm của từng người.', dimensionId: 'empathy', reversed: false },
  { id: 78, text: 'Khi nghe ai đó chia sẻ vấn đề, tôi thực sự cảm nhận được cảm xúc của họ.', dimensionId: 'empathy', reversed: false },
  { id: 79, text: 'Tôi quan tâm đến sự thoải mái của mọi người trước khi đi vào nội dung chính.', dimensionId: 'empathy', reversed: false },
  { id: 80, text: 'Tôi khó hiểu tại sao người khác lại cảm thấy buồn hay thất vọng về những điều nhỏ.', dimensionId: 'empathy', reversed: true },
  { id: 81, text: 'Tôi thường bỏ qua cảm xúc trong nhóm để tập trung vào kết quả công việc.', dimensionId: 'empathy', reversed: true },

  // ─── EXECUTION SPEED (5 câu) ───────────────────────────────
  { id: 82, text: 'Tôi hành động nhanh chóng khi có cơ hội, không chờ đến khi mọi thứ hoàn hảo.', dimensionId: 'execution_speed', reversed: false },
  { id: 83, text: 'Tôi đưa ra quyết định nhanh ngay cả khi thông tin chưa đầy đủ.', dimensionId: 'execution_speed', reversed: false },
  { id: 84, text: 'Tôi thích hoàn thành nhanh và điều chỉnh sau hơn là chuẩn bị kỹ rồi mới làm.', dimensionId: 'execution_speed', reversed: false },
  { id: 85, text: 'Tôi cần thời gian suy nghĩ kỹ trước khi cam kết với bất kỳ quyết định quan trọng nào.', dimensionId: 'execution_speed', reversed: true },
  { id: 86, text: 'Tôi thường trì hoãn hành động để thu thập đủ thông tin trước.', dimensionId: 'execution_speed', reversed: true },

  // ─── CAUTION (5 câu) ───────────────────────────────────────
  { id: 87, text: 'Tôi kiểm tra kỹ công việc ít nhất một lần trước khi gửi đi.', dimensionId: 'caution', reversed: false },
  { id: 88, text: 'Tôi đọc kỹ hướng dẫn và tài liệu trước khi bắt tay vào thực hiện.', dimensionId: 'caution', reversed: false },
  { id: 89, text: 'Tôi thường phát hiện lỗi sai trong tài liệu hoặc báo cáo của người khác.', dimensionId: 'caution', reversed: false },
  { id: 90, text: 'Tôi hay bỏ sót chi tiết khi làm việc dưới áp lực thời gian.', dimensionId: 'caution', reversed: true },
  { id: 91, text: 'Tôi ít khi đọc lại email trước khi gửi đi.', dimensionId: 'caution', reversed: true },

  // ─── GROWTH ORIENTATION (5 câu) ────────────────────────────
  { id: 92, text: 'Tôi muốn công việc giúp tôi phát triển và trở nên giỏi hơn mỗi ngày.', dimensionId: 'growth_orientation', reversed: false },
  { id: 93, text: 'Tôi xây dựng lộ trình sự nghiệp dài hạn và theo đuổi có kế hoạch.', dimensionId: 'growth_orientation', reversed: false },
  { id: 94, text: 'Tôi tìm kiếm cơ hội học hỏi từ những người giỏi hơn mình.', dimensionId: 'growth_orientation', reversed: false },
  { id: 95, text: 'Tôi không quan tâm nhiều đến việc thăng tiến hay mở rộng trách nhiệm.', dimensionId: 'growth_orientation', reversed: true },
  { id: 96, text: 'Tôi hài lòng với vị trí và công việc hiện tại, không muốn thay đổi nhiều.', dimensionId: 'growth_orientation', reversed: true },

  // ─── STABILITY ORIENTATION (5 câu) ─────────────────────────
  { id: 97,  text: 'Sự ổn định trong công việc và thu nhập quan trọng hơn cơ hội rủi ro cao.', dimensionId: 'stability_orientation', reversed: false },
  { id: 98,  text: 'Tôi thích có quy trình và quy định rõ ràng để làm theo.', dimensionId: 'stability_orientation', reversed: false },
  { id: 99,  text: 'Tôi ưu tiên an toàn công việc dài hạn hơn mức lương cao nhưng bấp bênh.', dimensionId: 'stability_orientation', reversed: false },
  { id: 100, text: 'Tôi không ngại thay đổi công việc hoặc tổ chức thường xuyên.', dimensionId: 'stability_orientation', reversed: true },
  { id: 101, text: 'Tôi thích môi trường làm việc linh hoạt và thay đổi liên tục.', dimensionId: 'stability_orientation', reversed: true },

  // ─── SOCIAL CONTRIBUTION (4 câu) ───────────────────────────
  { id: 102, text: 'Tôi muốn công việc của mình tạo ra tác động tích cực cho xã hội.', dimensionId: 'social_contribution', reversed: false },
  { id: 103, text: 'Tôi cảm thấy ý nghĩa hơn khi biết công việc mình làm giúp ích cho cộng đồng.', dimensionId: 'social_contribution', reversed: false },
  { id: 104, text: 'Tôi tham gia các hoạt động CSR hoặc tình nguyện khi có cơ hội.', dimensionId: 'social_contribution', reversed: false },
  { id: 105, text: 'Tôi ưu tiên lợi ích kinh doanh cá nhân hơn là tác động xã hội.', dimensionId: 'social_contribution', reversed: true },

  // ─── STRESS MENTAL (6 câu) ─────────────────────────────────
  { id: 106, text: 'Tôi có thể duy trì hiệu suất làm việc ngay cả khi môi trường có nhiều xung đột.', dimensionId: 'stress_mental', reversed: false },
  { id: 107, text: 'Tôi không để áp lực công việc làm ảnh hưởng đến cuộc sống cá nhân.', dimensionId: 'stress_mental', reversed: false },
  { id: 108, text: 'Khi gặp nhiều vấn đề cùng lúc, tôi vẫn giữ được sự tập trung và bình tĩnh.', dimensionId: 'stress_mental', reversed: false },
  { id: 109, text: 'Áp lực công việc cao khiến tôi khó ngủ hoặc lo lắng liên tục.', dimensionId: 'stress_mental', reversed: true, consistencyGroup: 'STR' },
  { id: 110, text: 'Tôi dễ bị kiệt sức tinh thần khi phải đối mặt với công việc căng thẳng kéo dài.', dimensionId: 'stress_mental', reversed: true },
  { id: 111, text: 'Bầu không khí làm việc tiêu cực ảnh hưởng lớn đến tâm trạng và hiệu suất của tôi.', dimensionId: 'stress_mental', reversed: true },

  // ─── STRESS PHYSICAL (5 câu) ───────────────────────────────
  { id: 112, text: 'Tôi có thể làm việc hiệu quả ngay cả khi ngủ ít trong vài ngày liên tiếp.', dimensionId: 'stress_physical', reversed: false },
  { id: 113, text: 'Tôi hiếm khi bị ốm hoặc mệt mỏi thể chất khi làm việc cường độ cao.', dimensionId: 'stress_physical', reversed: false },
  { id: 114, text: 'Tôi duy trì được năng lượng tốt suốt ngày làm việc, kể cả cuối ngày.', dimensionId: 'stress_physical', reversed: false },
  { id: 115, text: 'Tôi thường cảm thấy mệt mỏi thể chất sau các giai đoạn làm việc nhiều giờ.', dimensionId: 'stress_physical', reversed: true },
  { id: 116, text: 'Cơ thể tôi phản ứng mạnh (đau đầu, mất ngủ) khi áp lực công việc tăng cao.', dimensionId: 'stress_physical', reversed: true },

  // ─── LIE SCALE × 8 (ẩn hoàn toàn) ────────────────────────
  { id: 117, text: 'Tôi chưa bao giờ nói dối, dù chỉ là lời nói vô hại nhỏ nhặt.', dimensionId: 'lie_scale', reversed: false, isLie: true },
  { id: 118, text: 'Tôi luôn hoàn toàn hài lòng với mọi quyết định của cấp trên.', dimensionId: 'lie_scale', reversed: false, isLie: true },
  { id: 119, text: 'Tôi không bao giờ cảm thấy cáu kỉnh hay tức giận với bất kỳ ai.', dimensionId: 'lie_scale', reversed: false, isLie: true },
  { id: 120, text: 'Tôi luôn hoàn thành 100% mọi công việc được giao mà không có ngoại lệ.', dimensionId: 'lie_scale', reversed: false, isLie: true },
  { id: 121, text: 'Tôi chưa bao giờ cảm thấy ghen tị với thành công của người khác.', dimensionId: 'lie_scale', reversed: false, isLie: true },
  { id: 122, text: 'Tôi luôn trung thực tuyệt đối trong mọi tình huống, không có ngoại lệ.', dimensionId: 'lie_scale', reversed: false, isLie: true },
  { id: 123, text: 'Tôi chưa bao giờ cảm thấy lười biếng hay muốn trốn tránh trách nhiệm.', dimensionId: 'lie_scale', reversed: false, isLie: true },
  { id: 124, text: 'Tôi không bao giờ bỏ qua một quy định dù nhỏ, kể cả khi không ai biết.', dimensionId: 'lie_scale', reversed: false, isLie: true },

  // ─── CONSISTENCY PAIRS × 4 (ẩn, đặt cách xa câu gốc) ────────
  // Pair 1 — Extraversion (câu 5 ↔ 125): "mệt sau tiếp xúc nhiều người"
  { id: 125, text: 'Sau một buổi tối tụ họp đông người, tôi thường cần thời gian một mình để hồi phục năng lượng.', dimensionId: 'extraversion', reversed: true, consistencyGroup: 'EXT' },
  // Pair 2 — Conscientiousness (câu 21 ↔ 126): "trì hoãn đến phút cuối"
  { id: 126, text: 'Tôi thường bắt đầu làm công việc ngay trước deadline thay vì lên kế hoạch từ sớm.', dimensionId: 'conscientiousness', reversed: true, consistencyGroup: 'CON' },
  // Pair 3 — Agreeableness (câu 12 ↔ 127): "nhường bộ để giữ hòa khí"
  { id: 127, text: 'Tôi thường chọn cách hòa giải hơn là tiếp tục tranh luận đến cùng.', dimensionId: 'agreeableness', reversed: false, consistencyGroup: 'AGR' },
  // Pair 4 — Stress mental (câu 109 ↔ 128): "áp lực gây mất ngủ"
  { id: 128, text: 'Khi gặp áp lực cao ở công việc, tôi thường bị ảnh hưởng đến giấc ngủ và tâm trạng cá nhân.', dimensionId: 'stress_mental', reversed: true, consistencyGroup: 'STR' },
];

// ─── LIE SCALE IDs ────────────────────────────────────────────
export const LIE_QUESTION_IDS = [117, 118, 119, 120, 121, 122, 123, 124];

// ─── CONSISTENCY PAIRS ────────────────────────────────────────
export const CONSISTENCY_PAIRS: [number, number][] = [
  [5, 125],   // Extraversion reversed
  [21, 126],  // Conscientiousness reversed
  [12, 127],  // Agreeableness forward
  [109, 128], // Stress mental reversed
];

// ─── BUILD QUIZ ORDER (trả về đúng 120 câu chính + xen kẽ Lie/Consistency) ─
export function buildQuizOrder(): number[] {
  // Main questions (IDs 1–116, không phải Lie, không phải Consistency duplicate)
  const mainIds = QUESTIONS
    .filter(q => !q.isLie && !q.consistencyGroup)
    .map(q => q.id); // = 116 câu (1–116)

  const lieIds = LIE_QUESTION_IDS;           // 8 câu
  const consistencyIds = [125, 126, 127, 128]; // 4 câu

  // Tổng = 116 + 4 = 120 câu main + 8 Lie xen kẽ = 128 câu người dùng thấy
  // Nhưng người dùng không biết câu nào là Lie

  const result: number[] = [];
  let lieIdx = 0;
  let conIdx = 0;

  for (let i = 0; i < mainIds.length; i++) {
    result.push(mainIds[i]);

    // Thêm 1 câu Consistency sau câu 30, 60, 90, 116
    if ((i === 29 || i === 59 || i === 89 || i === 115) && conIdx < consistencyIds.length) {
      result.push(consistencyIds[conIdx++]);
    }

    // Thêm 1 câu Lie sau mỗi 14 câu chính
    if ((i + 1) % 14 === 0 && lieIdx < lieIds.length) {
      result.push(lieIds[lieIdx++]);
    }
  }

  // Thêm câu Lie còn lại
  while (lieIdx < lieIds.length) result.push(lieIds[lieIdx++]);

  return result;
}
