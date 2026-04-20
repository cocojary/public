import db from "../db";

// 120 câu hỏi SOTA V3.0 (Đã được chuẩn hóa ngôn ngữ cho mọi vị trí - Universal Data)
export const UNIVERSAL_QUESTIONS = [
  // ── NHÓM 1: Chất lượng công việc (trait_01) ──────────────────────
  { dimensionId: 'trait_01', reversed: false, isLieScale: false, textVi: 'Bạn sẵn sàng dành thêm thời gian kiểm tra lại công việc nhằm đảm bảo kết quả tốt nhất.' },
  { dimensionId: 'trait_01', reversed: false, isLieScale: false, textVi: 'Bạn luôn sắp xếp và ghi chú tài liệu rõ ràng giúp đồng nghiệp dễ dàng tiếp nhận và xử lý.' },
  { dimensionId: 'trait_01', reversed: false, isLieScale: false, textVi: 'Bạn thường rà soát kỹ các chi tiết nhỏ để phòng ngừa các lỗi phát sinh không đáng có.' },
  { dimensionId: 'trait_01', reversed: false, isLieScale: false, textVi: 'Bạn chấp nhận làm lại nhiệm vụ nếu nhận thấy phương án mới mang lại chất lượng cao hơn.' },
  { dimensionId: 'trait_01', reversed: false, isLieScale: false, textVi: 'Bạn chủ động đề xuất giải quyết dứt điểm các vấn đề cũ trước khi tiếp nhận thêm nhiệm vụ mới.' },
  { dimensionId: 'trait_01', reversed: true, isLieScale: false, textVi: 'Bạn ưu tiên hoàn thành đúng thời hạn ngay cả khi kết quả chưa đạt mức độ hoàn hảo nhất.' },
  { dimensionId: 'trait_01', reversed: true, isLieScale: false, textVi: 'Bạn thường bỏ qua việc ghi chép hướng dẫn nếu công việc đang được vận hành ổn định.' },
  { dimensionId: 'trait_01', reversed: true, isLieScale: false, textVi: 'Bạn tối giản hóa hình thức báo cáo để dành thời gian cho các nội dung chuyên môn.' },
  { dimensionId: 'trait_01', reversed: true, isLieScale: false, textVi: 'Bạn duy trì các quy trình hiện tại miễn là chúng đáp ứng được yêu cầu công việc cơ bản.' },
  { dimensionId: 'trait_01', reversed: true, isLieScale: false, textVi: 'Bạn tập trung hoàn thành kết quả trước và sẽ thực hiện việc sắp xếp hệ thống sau.' },

  // ── NHÓM 2: Tư duy hệ thống (trait_02) ──────────────────────
  { dimensionId: 'trait_02', reversed: false, isLieScale: false, textVi: 'Trước khi thay đổi một chi tiết nhỏ, bạn luôn xem xét ảnh hưởng của nó tới toàn bộ quy trình.' },
  { dimensionId: 'trait_02', reversed: false, isLieScale: false, textVi: 'Bạn dành thời gian phác thảo luồng công việc giúp việc triển khai thực tế diễn ra thuận lợi hơn.' },
  { dimensionId: 'trait_02', reversed: false, isLieScale: false, textVi: 'Bạn sẵn sàng điều chỉnh lại cấu trúc dự án nếu việc đó giúp hệ thống dễ dàng mở rộng về sau.' },
  { dimensionId: 'trait_02', reversed: false, isLieScale: false, textVi: 'Bạn chủ động tìm hiểu cách các bộ phận kết nối với nhau để phối hợp công việc hiệu quả hơn.' },
  { dimensionId: 'trait_02', reversed: false, isLieScale: false, textVi: 'Bạn ưu tiên xây dựng các quy trình có tính ứng dụng cao để có thể tái sử dụng cho nhiều mục đích.' },
  { dimensionId: 'trait_02', reversed: true, isLieScale: false, textVi: 'Bạn thích tập trung hoàn thành phần việc cá nhân thay vì bận tâm đến cấu trúc tổng thể của tổ chức.' },
  { dimensionId: 'trait_02', reversed: true, isLieScale: false, textVi: 'Bạn thường bỏ qua việc tính toán các tình huống giả định để ưu tiên tiến độ công việc hiện tại.' },
  { dimensionId: 'trait_02', reversed: true, isLieScale: false, textVi: 'Bạn ưu tiên sử dụng các phương pháp quen thuộc thay vì thử nghiệm các quy trình vận hành mới.' },
  { dimensionId: 'trait_02', reversed: true, isLieScale: false, textVi: 'Bạn thường gặp khó khăn khi phải hình dung sự tương tác giữa các luồng thông tin trong tổ chức.' },
  { dimensionId: 'trait_02', reversed: true, isLieScale: false, textVi: 'Bạn thường bắt tay vào làm việc ngay thay vì dành thời gian cho việc thiết kế sơ đồ tổng thể.' },

  // ── NHÓM 3: Kiểm soát rủi ro & Bảo mật (trait_03) ──────────────────────
  { dimensionId: 'trait_03', reversed: false, isLieScale: false, textVi: 'Bạn thường xuyên tự kiểm tra các rủi ro tiềm ẩn để đảm bảo tính an toàn cho công việc.' },
  { dimensionId: 'trait_03', reversed: false, isLieScale: false, textVi: 'Bạn sẵn sàng phản đối các yêu cầu có thể gây ảnh hưởng tiêu cực tới dữ liệu hoặc uy tín công ty.' },
  { dimensionId: 'trait_03', reversed: false, isLieScale: false, textVi: 'Bạn thường xuyên rà soát lại các quy trình cũ nhằm phòng ngừa các sự cố có thể xảy ra.' },
  { dimensionId: 'trait_03', reversed: false, isLieScale: false, textVi: 'Bạn coi việc bảo mật thông tin nội bộ là trách nhiệm quan trọng hàng đầu trong mọi hành động.' },
  { dimensionId: 'trait_03', reversed: false, isLieScale: false, textVi: 'Bạn chủ động tìm hiểu các nguy cơ mất an toàn mới để áp dụng biện pháp phòng tránh cho đơn vị.' },
  { dimensionId: 'trait_03', reversed: true, isLieScale: false, textVi: 'Bạn chấp nhận lược bỏ một số bước kiểm tra an toàn để đảm bảo tiến độ triển khai công việc.' },
  { dimensionId: 'trait_03', reversed: true, isLieScale: false, textVi: 'Bạn cho rằng việc kiểm soát rủi ro thuộc trách nhiệm của các bộ phận chuyên môn khác.' },
  { dimensionId: 'trait_03', reversed: true, isLieScale: false, textVi: 'Bạn có thể chia sẻ thông tin nhạy cảm ở mức độ nhất định để giải quyết nhanh các đầu việc.' },
  { dimensionId: 'trait_03', reversed: true, isLieScale: false, textVi: 'Bạn thường bỏ qua các bước rà soát sự cố nếu chúng làm chậm tốc độ xử lý công việc cá nhân.' },
  { dimensionId: 'trait_03', reversed: true, isLieScale: false, textVi: 'Bạn thấy việc thiết lập các lớp kiểm soát phức tạp thường gây cản trở cho quá trình làm việc.' },

  // ── NHÓM 4: Chính trực (trait_04) ──────────────────────
  { dimensionId: 'trait_04', reversed: false, isLieScale: false, textVi: 'Bạn sẵn sàng chịu trách nhiệm khi kết quả công việc do bản thân phụ trách chưa đạt yêu cầu.' },
  { dimensionId: 'trait_04', reversed: false, isLieScale: false, textVi: 'Bạn chủ động báo cáo các lỗi cá nhân ngay lập tức để tìm giải pháp khắc phục kịp thời.' },
  { dimensionId: 'trait_04', reversed: false, isLieScale: false, textVi: 'Bạn sẵn sàng dành thêm thời gian sửa chữa các sai sót do bản thân gây ra mà không đòi hỏi thêm.' },
  { dimensionId: 'trait_04', reversed: false, isLieScale: false, textVi: 'Bạn luôn thẳng thắn đóng góp ý kiến về những điểm chưa tốt của đồng nghiệp trên tinh thần xây dựng.' },
  { dimensionId: 'trait_04', reversed: false, isLieScale: false, textVi: 'Bạn nỗ lực giữ đúng cam kết về tiến độ và chất lượng bất kể gặp phải những khó khăn khách quan.' },
  { dimensionId: 'trait_04', reversed: true, isLieScale: false, textVi: 'Bạn thường đợi đến khi nhận được yêu cầu giải trình mới bắt đầu xử lý các lỗi sai của bản thân.' },
  { dimensionId: 'trait_04', reversed: true, isLieScale: false, textVi: 'Bạn ưu tiên giữ sự hòa đồng thay vì chỉ ra những thiếu sót trong công việc của các thành viên khác.' },
  { dimensionId: 'trait_04', reversed: true, isLieScale: false, textVi: 'Bạn có xu hướng báo cáo kết quả tốt hơn thực tế để hạn chế các thủ tục giải trình phức tạp.' },
  { dimensionId: 'trait_04', reversed: true, isLieScale: false, textVi: 'Bạn thỉnh thoảng bỏ qua các lỗi nhỏ nếu nhận thấy chúng chưa gây ra hậu quả trực tiếp.' },
  { dimensionId: 'trait_04', reversed: true, isLieScale: false, textVi: 'Bạn thường cho rằng sự thất bại đến từ các yêu cầu chưa rõ ràng hơn là từ năng lực cá nhân.' },

  // ── NHÓM 5: Thích nghi (trait_05) ──────────────────────
  { dimensionId: 'trait_05', reversed: false, isLieScale: false, textVi: 'Bạn duy trì được sự bình tĩnh và hiệu quả công việc ngay cả khi các yêu cầu thay đổi đột ngột.' },
  { dimensionId: 'trait_05', reversed: false, isLieScale: false, textVi: 'Bạn sẵn sàng chuyển sang dự án hoặc nhóm làm việc mới theo sự điều động của tổ chức.' },
  { dimensionId: 'trait_05', reversed: false, isLieScale: false, textVi: 'Bạn nhanh chóng bắt nhịp với các quy trình hoạt động hoặc công cụ quản trị mới của công ty.' },
  { dimensionId: 'trait_05', reversed: false, isLieScale: false, textVi: 'Bạn xem những thay đổi ngoài dự kiến là cơ hội để rèn luyện kỹ năng xử lý tình huống.' },
  { dimensionId: 'trait_05', reversed: false, isLieScale: false, textVi: 'Bạn có thể phối hợp làm việc hiệu quả với nhiều tính cách và bộ phận khác nhau.' },
  { dimensionId: 'trait_05', reversed: true, isLieScale: false, textVi: 'Bạn cảm thấy không hài lòng khi phải thay đổi các kế hoạch mà bản thân đã dành nhiều công sức.' },
  { dimensionId: 'trait_05', reversed: true, isLieScale: false, textVi: 'Bạn thường mất nhiều thời gian hơn mức trung bình để làm quen với một phần mềm mới.' },
  { dimensionId: 'trait_05', reversed: true, isLieScale: false, textVi: 'Bạn thích làm việc theo các quy trình cố định và ngại thay đổi các thói quen cũ.' },
  { dimensionId: 'trait_05', reversed: true, isLieScale: false, textVi: 'Bạn thường bị lúng túng khi làm việc trong những môi trường chưa có quy định hoặc cấu trúc rõ ràng.' },
  { dimensionId: 'trait_05', reversed: true, isLieScale: false, textVi: 'Bạn gặp khó khăn trong việc bắt kịp các thay đổi liên tục về chiến lược hoặc quy trình của công ty.' },

  // ── NHÓM 6: Tự học (trait_06) ──────────────────────
  { dimensionId: 'trait_06', reversed: false, isLieScale: false, textVi: 'Bạn thường chủ động tìm hiểu các kỹ năng chuyên môn mới để phục vụ cho sự phát triển cá nhân.' },
  { dimensionId: 'trait_06', reversed: false, isLieScale: false, textVi: 'Bạn mong muốn nhận được những nhận xét thẳng thắn về khuyết điểm để có hướng hoàn thiện bản thân.' },
  { dimensionId: 'trait_06', reversed: false, isLieScale: false, textVi: 'Bạn coi các sai sót hoặc thất bại trong công việc là những bài học kinh nghiệm cần thiết.' },
  { dimensionId: 'trait_06', reversed: false, isLieScale: false, textVi: 'Bạn thường xuyên theo dõi các xu hướng và kiến thức mới để cập nhật cho công việc hiện tại.' },
  { dimensionId: 'trait_06', reversed: false, isLieScale: false, textVi: 'Bạn sẵn sàng tiếp nhận các nhiệm vụ khó khăn đòi hỏi trình độ cao hơn năng lực hiện tại.' },
  { dimensionId: 'trait_06', reversed: true, isLieScale: false, textVi: 'Bạn nhận thấy kỹ năng hiện tại đã đủ đáp ứng công việc nên chưa có kế hoạch học thêm.' },
  { dimensionId: 'trait_06', reversed: true, isLieScale: false, textVi: 'Bạn tin rằng kinh nghiệm thực tế của bản thân hiệu quả hơn các kiến thức từ sách vở hay đào tạo.' },
  { dimensionId: 'trait_06', reversed: true, isLieScale: false, textVi: 'Bạn thường thấy nản lòng khi bắt gặp những khái niệm hoặc công nghệ hoàn toàn mới.' },
  { dimensionId: 'trait_06', reversed: true, isLieScale: false, textVi: 'Bạn chỉ tham gia các hoạt động bồi dưỡng kỹ năng khi có sự yêu cầu bắt buộc từ phía quản lý.' },
  { dimensionId: 'trait_06', reversed: true, isLieScale: false, textVi: 'Bạn hạn chế tham gia các buổi đào tạo nội bộ nếu thấy kiến thức chưa áp dụng được ngay.' },

  // ── NHÓM 7: Giải quyết vấn đề (trait_07) ──────────────────────
  { dimensionId: 'trait_07', reversed: false, isLieScale: false, textVi: 'Bạn thích tìm kiếm nguyên nhân cốt lõi và đề xuất giải pháp cho các vấn đề phức tạp.' },
  { dimensionId: 'trait_07', reversed: false, isLieScale: false, textVi: 'Bạn luôn chuẩn bị sẵn các phương án dự phòng trước khi bắt đầu thực hiện một nhiệm vụ quan trọng.' },
  { dimensionId: 'trait_07', reversed: false, isLieScale: false, textVi: 'Bạn có khả năng tập trung cao độ trong thời gian dài để giải quyết triệt để một sự cố.' },
  { dimensionId: 'trait_07', reversed: false, isLieScale: false, textVi: 'Bạn thường phân tích các rủi ro lớn thành từng phần nhỏ để xử lý một cách có trình tự.' },
  { dimensionId: 'trait_07', reversed: false, isLieScale: false, textVi: 'Bạn ưu tiên giải quyết các vấn đề từ gốc rễ thay vì sử dụng các biện pháp xử lý tạm thời.' },
  { dimensionId: 'trait_07', reversed: true, isLieScale: false, textVi: 'Bạn thường lúng túng và thử nghiệm các cách giải quyết khác nhau một cách thiếu trình tự khi có sự cố.' },
  { dimensionId: 'trait_07', reversed: true, isLieScale: false, textVi: 'Khi gặp vướng mắc khó giải quyết, bạn thường tìm sự hỗ trợ ngay lập tức thay vì tự mình suy nghĩ.' },
  { dimensionId: 'trait_07', reversed: true, isLieScale: false, textVi: 'Bạn dễ dàng nản chí nếu phải dành nhiều thời gian suy nghĩ mà chưa tìm ra giải pháp khả thi.' },
  { dimensionId: 'trait_07', reversed: true, isLieScale: false, textVi: 'Khi phát sinh nhiều vấn đề cùng một lúc, bạn thường bị quá tải và lúng túng trong hành động.' },
  { dimensionId: 'trait_07', reversed: true, isLieScale: false, textVi: 'Bạn làm việc hiệu quả hơn khi đã có sẵn quy trình hướng dẫn cụ thể thay vì phải tự tìm giải pháp.' },

  // ── NHÓM 8: Cộng tác (trait_08) ──────────────────────
  { dimensionId: 'trait_08', reversed: false, isLieScale: false, textVi: 'Bạn thấy hài lòng khi hỗ trợ các thành viên mới nhanh chóng hòa nhập với tiến độ của nhóm.' },
  { dimensionId: 'trait_08', reversed: false, isLieScale: false, textVi: 'Bạn có thói quen chia sẻ các phương pháp làm việc hiệu quả giúp các thành viên cùng tiến bộ.' },
  { dimensionId: 'trait_08', reversed: false, isLieScale: false, textVi: 'Bạn luôn nỗ lực lắng nghe và tôn trọng các góc nhìn của đồng nghiệp ngay cả khi chúng khác biệt.' },
  { dimensionId: 'trait_08', reversed: false, isLieScale: false, textVi: 'Bạn sẵn sàng tạm dừng việc cá nhân để hỗ trợ đồng đội nếu việc đó mang lại lợi ích chung cho dự án.' },
  { dimensionId: 'trait_08', reversed: false, isLieScale: false, textVi: 'Bạn có thể điều chỉnh cái tôi cá nhân vì mục tiêu chung của tập thể và tổ chức.' },
  { dimensionId: 'trait_08', reversed: true, isLieScale: false, textVi: 'Bạn ưu tiên hoàn thành việc cá nhân thay vì dành thời gian hướng dẫn nghiệp vụ cho thành viên khác.' },
  { dimensionId: 'trait_08', reversed: true, isLieScale: false, textVi: 'Bạn nhận thấy bản thân làm việc hiệu quả hơn khi hoạt động độc lập thay vì phối hợp nhóm.' },
  { dimensionId: 'trait_08', reversed: true, isLieScale: false, textVi: 'Bạn ưu tiên giữ kín các phương pháp làm việc riêng biệt mà bản thân đã tốn nhiều công sức để có được.' },
  { dimensionId: 'trait_08', reversed: true, isLieScale: false, textVi: 'Bạn cho rằng việc đào tạo nhân sự mới là đang lãng phí thời gian quan trọng của bản thân.' },
  { dimensionId: 'trait_08', reversed: true, isLieScale: false, textVi: 'Bạn thường đưa ra các nhận xét tiêu cực về đồng nghiệp thay vì tập trung vào sự phát triển chung của nhóm.' },

  // ── NHÓM 9: Quản lý thời gian (trait_09) ──────────────────────
  { dimensionId: 'trait_09', reversed: false, isLieScale: false, textVi: 'Bạn luôn chia nhỏ nhiệm vụ lớn thành các đầu việc cụ thể để ước tính thời gian thực hiện chính xác.' },
  { dimensionId: 'trait_09', reversed: false, isLieScale: false, textVi: 'Bạn có khả năng từ chối các nhiệm vụ phát sinh nếu chúng gây ảnh hưởng nghiêm trọng tới kế hoạch hiện tại.' },
  { dimensionId: 'trait_09', reversed: false, isLieScale: false, textVi: 'Bạn thực hiện ghi nhận thời gian làm việc một cách trung thực trên các công cụ quản lý dự án.' },
  { dimensionId: 'trait_09', reversed: false, isLieScale: false, textVi: 'Bạn thường xuyên ưu tiên các nhiệm vụ dựa trên mức độ quan trọng và tính khẩn cấp của chúng.' },
  { dimensionId: 'trait_09', reversed: false, isLieScale: false, textVi: 'Bạn sắp xếp các công việc đòi hỏi sự tập trung cao vào thời điểm bản thân có năng suất tốt nhất trong ngày.' },
  { dimensionId: 'trait_09', reversed: true, isLieScale: false, textVi: 'Bạn thường xuyên rơi vào tình trạng chậm tiến độ do đánh giá chưa đúng độ phức tạp của nhiệm vụ.' },
  { dimensionId: 'trait_09', reversed: true, isLieScale: false, textVi: 'Bạn có xu hướng xử lý các việc đơn giản trước thay vì tập trung vào nhiệm vụ khó khăn nhất cần triển khai.' },
  { dimensionId: 'trait_09', reversed: true, isLieScale: false, textVi: 'Việc tham gia vào các cuộc thảo luận phát sinh thường xuyên phá vỡ kế hoạch làm việc trong ngày của bạn.' },
  { dimensionId: 'trait_09', reversed: true, isLieScale: false, textVi: 'Bạn chỉ đạt được hiệu suất làm việc cao nhất khi thời hạn hoàn thành công việc đã rất cận kề.' },
  { dimensionId: 'trait_09', reversed: true, isLieScale: false, textVi: 'Bạn dễ bị xao nhãng bởi các thông báo từ điện thoại hoặc mạng xã hội trong lúc đang tập trung làm việc.' },

  // ── NHÓM 10: Trải nghiệm khách hàng / Sản phẩm (trait_10) ──────────────────────
  { dimensionId: 'trait_10', reversed: false, isLieScale: false, textVi: 'Bạn thường đặt mình vào vị trí người dùng để đánh giá và cải thiện chất lượng dịch vụ của công ty.' },
  { dimensionId: 'trait_10', reversed: false, isLieScale: false, textVi: 'Bạn chủ động đề xuất điều chỉnh các quy trình nếu nhận thấy chúng gây khó khăn cho khách hàng.' },
  { dimensionId: 'trait_10', reversed: false, isLieScale: false, textVi: 'Bạn ưu tiên xử lý các phản hồi chưa tốt từ người dùng để nâng cao sự hài lòng đối với sản phẩm.' },
  { dimensionId: 'trait_10', reversed: false, isLieScale: false, textVi: 'Bạn luôn cố gắng hiểu rõ mục tiêu cuối cùng của khách hàng khi thực hiện bất kỳ nhiệm vụ nào.' },
  { dimensionId: 'trait_10', reversed: false, isLieScale: false, textVi: 'Bạn tin rằng sự hài lòng của người sử dụng là thước đo quan trọng nhất cho kết quả công việc cá nhân.' },
  { dimensionId: 'trait_10', reversed: true, isLieScale: false, textVi: 'Bạn ưu tiên hoàn thành yêu cầu của cấp trên hơn là bận tâm về tính hữu ích của nó đối với khách hàng.' },
  { dimensionId: 'trait_10', reversed: true, isLieScale: false, textVi: 'Bạn thường thiếu kiên nhẫn khi phải giải thích các chuyên môn sâu cho những khách hàng chưa có kiến thức.' },
  { dimensionId: 'trait_10', reversed: true, isLieScale: false, textVi: 'Bạn ưu tiên các giải pháp giúp nội bộ làm việc nhàn hơn mặc dù có thể làm giảm tiến độ phục vụ khách.' },
  { dimensionId: 'trait_10', reversed: true, isLieScale: false, textVi: 'Bạn thường bỏ qua các góp ý từ khách hàng nếu bản thân tự đánh giá họ chưa hiểu rõ về chuyên môn.' },
  { dimensionId: 'trait_10', reversed: true, isLieScale: false, textVi: 'Bạn cho rằng việc tư duy vì con người thuộc trách nhiệm của các bộ phận chức năng khác.' },

  // ── NHÓM 11: Sáng tạo (trait_11) ──────────────────────
  { dimensionId: 'trait_11', reversed: false, isLieScale: false, textVi: 'Bạn luôn tìm kiếm các công cụ hoặc phương pháp mới để thay thế cho những công việc lặp lại.' },
  { dimensionId: 'trait_11', reversed: false, isLieScale: false, textVi: 'Bạn thường xuyên đặt câu hỏi và tìm phương án thay thế cho những quy trình vận hành đã cũ.' },
  { dimensionId: 'trait_11', reversed: false, isLieScale: false, textVi: 'Trong các cuộc thảo luận, bạn chủ động đưa ra những ý tưởng mới mẻ để giải quyết khó khăn của nhóm.' },
  { dimensionId: 'trait_11', reversed: false, isLieScale: false, textVi: 'Bạn khuyến khích các thành viên thử nghiệm những cách làm mới thay vì luôn đi theo những lối mòn cũ.' },
  { dimensionId: 'trait_11', reversed: false, isLieScale: false, textVi: 'Bạn thường xuyên tư duy về việc cải tiến quy trình nhằm mang lại hiệu quả công việc cao hơn cho tập thể.' },
  { dimensionId: 'trait_11', reversed: true, isLieScale: false, textVi: 'Bạn thích thực hiện công việc theo đúng hướng dẫn có sẵn thay vì dành thời gian để biến tấu chúng.' },
  { dimensionId: 'trait_11', reversed: true, isLieScale: false, textVi: 'Bạn cho rằng việc thay đổi những gì đang vận hành ổn định sẽ mang lại thêm rủi ro không cần thiết.' },
  { dimensionId: 'trait_11', reversed: true, isLieScale: false, textVi: 'Bạn gặp khó khăn trong việc đưa ra các sáng kiến hoặc giải pháp mới khi đối diện với các tình huống lạ.' },
  { dimensionId: 'trait_11', reversed: true, isLieScale: false, textVi: 'Việc phải học hỏi và sử dụng một công nghệ mới thường tạo ra áp lực đối với bạn.' },
  { dimensionId: 'trait_11', reversed: true, isLieScale: false, textVi: 'Dù đã biết quy trình cũ chưa tối ưu, bạn vẫn cảm thấy an tâm hơn khi tiếp tục sử dụng nó.' },

  // ── NHÓM 12: Thang đo trung thực (trait_12 - Lie Scale) ──────────────────────
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Trong suốt sự nghiệp, bạn chưa bao giờ có ý định ưu tiên lợi ích cá nhân lên trên lợi ích của tổ chức.' },
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Bạn có thể ghi nhớ chính xác toàn bộ các quy định và hướng dẫn của công ty ngay sau lần đọc đầu tiên.' },
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Bạn chưa bao giờ cảm thấy không vui hay có thái độ ghen tị khi thấy đồng nghiệp đạt được thành công lớn.' },
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Bạn luôn giữ đúng cam kết về thời gian trong mọi tình huống, kể cả với những việc nhỏ nhặt nhất.' },
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Bạn chưa bao giờ đưa ra những lời phàn nàn hay nói những điều không tốt về đồng nghiệp sau lưng họ.' },
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Tại nơi làm việc, bạn luôn tập trung 100% cho công việc và chưa bao giờ bị xao nhãng bởi việc riêng.' },
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Bạn chưa bao giờ mắc phải bất kỳ một lỗi sai hay thiếu sót nào trong tất cả các nhiệm vụ đã thực hiện.' },
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Dù đang rất bận rộn với công việc cá nhân, bạn luôn sẵn sàng hỗ trợ đồng nghiệp ngay lập tức khi họ nhờ cậy.' },
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Bạn chưa bao giờ đi làm muộn hay nghỉ việc sớm dù chỉ một phút trong suốt quá trình công tác.' },
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Bạn có khả năng hiểu toàn bộ các quy tắc và quy trình phức tạp của tổ chức ngay trong ngày đầu nhận việc.' },
];

export async function seedDevQuestions() {
    console.log("--- Seeding Generic Questions (SOTA V4.0 Universal) ---");

    // Vẫn sử dụng role DEV cho seed nhưng với bộ câu hỏi đã đổi sang phổ quát
    // Nếu có nhiều vai trò hẵn, bạn có thể loop qua toàn bộ role. Ở đây giữ nguyên luồng cũ.
    const techRole = await db.targetRole.findUnique({
        where: { code: "TECHNOCRAT" }
    });

    if (!techRole) {
        console.error("Role TECHNOCRAT not found. Please run seedRoles first.");
        return { results: ["Role TECHNOCRAT not found"] };
    }

    // Deactivate các bộ cũ
    await db.questionSet.updateMany({
        where: { roleId: techRole.id },
        data: { isActive: false }
    });

    // Tạo bộ câu hỏi mới (Universal Version)
    const newSet = await db.questionSet.create({
        data: {
            roleId: techRole.id,
            version: "v4.0-sota-universal",
            isActive: true,
        }
    });

    // Insert 120 câu hỏi
    for (const q of UNIVERSAL_QUESTIONS) {
        await db.question.create({
            data: {
                setId: newSet.id,
                textVi: q.textVi,
                textEn: q.textVi,
                textJa: q.textVi,
                dimensionId: q.dimensionId,
                reversed: q.reversed,
                isLieScale: q.isLieScale,
            }
        });
    }

    console.log(`Successfully seeded 120 universal questions to DEV role, version ${newSet.version}`);
    return {
        results: [`Successfully seeded 120 universal questions to DEV role, version ${newSet.version}`]
    };
}
