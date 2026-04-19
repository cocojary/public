import db from "../db";

// 120 câu hỏi SOTA V3.0 cho Developer (Trích xuất từ file DEV)
export const DEV_QUESTIONS = [
  // ── NHÓM 1: Chất lượng mã (trait_01) ──────────────────────
  { dimensionId: 'trait_01', reversed: false, isLieScale: false, textVi: 'Tôi chấp nhận dành thêm thời gian dọn dẹp các phần mã cũ ngay khi tìm ra cách trình bày gọn gàng hơn.' },
  { dimensionId: 'trait_01', reversed: false, isLieScale: false, textVi: 'Tôi ưu tiên đặt tên các thành phần rõ ràng để người sau đọc là hiểu ngay mà không cần giải thích.' },
  { dimensionId: 'trait_01', reversed: false, isLieScale: false, textVi: 'Tôi thường kiểm tra kỹ các trường hợp có thể gây lỗi ngay cả với những dòng mã đơn giản nhất.' },
  { dimensionId: 'trait_01', reversed: false, isLieScale: false, textVi: 'Tôi sẵn sàng viết lại một đoạn mã nếu nhận thấy cách làm đó giúp hệ thống chạy ổn định hơn.' },
  { dimensionId: 'trait_01', reversed: false, isLieScale: false, textVi: 'Tôi chủ động đề xuất dừng phát triển tính năng mới để tập trung xử lý dứt điểm các lỗi tồn đọng.' },
  { dimensionId: 'trait_01', reversed: true, isLieScale: false, textVi: 'Tôi chấp nhận bàn giao những đoạn mã chưa tối ưu để đảm bảo đúng thời hạn cam kết với cấp trên.' },
  { dimensionId: 'trait_01', reversed: true, isLieScale: false, textVi: 'Tôi thường bỏ qua việc ghi chú hướng dẫn nếu thấy phần việc đó đã hoạt động ổn định.' },
  { dimensionId: 'trait_01', reversed: true, isLieScale: false, textVi: 'Tôi thấy việc dành thời gian làm đẹp mã nguồn là sự lãng phí tài nguyên của công ty.' },
  { dimensionId: 'trait_01', reversed: true, isLieScale: false, textVi: 'Tôi thường để các hàm xử lý dài và phức tạp miễn là chúng hoàn thành đúng yêu cầu.' },
  { dimensionId: 'trait_01', reversed: true, isLieScale: false, textVi: 'Tôi ưu tiên việc viết mã cho chương trình chạy được trước, việc sắp xếp gọn gàng tính sau.' },

  // ── NHÓM 2: Tư duy hệ thống (trait_02) ──────────────────────
  { dimensionId: 'trait_02', reversed: false, isLieScale: false, textVi: 'Trước khi chỉnh sửa một phần nhỏ, tôi xem xét kỹ sự ảnh hưởng của nó đến toàn bộ hệ thống lớn.' },
  { dimensionId: 'trait_02', reversed: false, isLieScale: false, textVi: 'Tôi dành thời gian phác thảo sơ đồ vận hành trên giấy hoặc bảng trước khi bắt đầu viết mã.' },
  { dimensionId: 'trait_02', reversed: false, isLieScale: false, textVi: 'Tôi sẵn sàng thiết kế lại từ đầu nếu cấu trúc hiện tại gây khó khăn cho việc mở rộng về sau.' },
  { dimensionId: 'trait_02', reversed: false, isLieScale: false, textVi: 'Tôi thường tìm hiểu cách các bộ phận khác kết nối với nhau thay vì chỉ tập trung việc của mình.' },
  { dimensionId: 'trait_02', reversed: false, isLieScale: false, textVi: 'Tôi ưu tiên xây dựng các thành phần có tính dùng lại cao cho nhiều mục đích khác nhau.' },
  { dimensionId: 'trait_02', reversed: true, isLieScale: false, textVi: 'Tôi thích tập trung giải quyết phần việc được giao thay vì quan tâm đến cấu trúc tổng thể.' },
  { dimensionId: 'trait_02', reversed: true, isLieScale: false, textVi: 'Tôi thấy việc tính toán cho những tình huống giả định trong tương lai thường làm chậm tiến độ hiện tại.' },
  { dimensionId: 'trait_02', reversed: true, isLieScale: false, textVi: 'Tôi ưu tiên sử dụng các phương pháp quen thuộc để an toàn hơn là thử nghiệm mô hình tổ chức mới.' },
  { dimensionId: 'trait_02', reversed: true, isLieScale: false, textVi: 'Tôi thường cảm thấy khó khăn khi phải hình dung cách các khối dữ liệu tương tác với nhau.' },
  { dimensionId: 'trait_02', reversed: true, isLieScale: false, textVi: 'Tôi thích bắt tay vào viết mã ngay thay vì dành thời gian cho việc thiết kế sơ đồ.' },

  // ── NHÓM 3: Bảo mật (trait_03) ──────────────────────
  { dimensionId: 'trait_03', reversed: false, isLieScale: false, textVi: 'Tôi thường xuyên tự kiểm tra các kẽ hở thông tin ngay cả khi chức năng đó không yêu cầu cao.' },
  { dimensionId: 'trait_03', reversed: false, isLieScale: false, textVi: 'Tôi sẵn sàng phản đối một yêu cầu nếu nhận thấy nó gây nguy hiểm cho dữ liệu người dùng.' },
  { dimensionId: 'trait_03', reversed: false, isLieScale: false, textVi: 'Tôi thường xuyên cập nhật và thay thế các thành phần hỗ trợ cũ để phòng ngừa nguy cơ tiềm ẩn.' },
  { dimensionId: 'trait_03', reversed: false, isLieScale: false, textVi: 'Tôi coi việc bảo vệ thông tin khách hàng là nhiệm vụ ưu tiên hàng đầu trong mọi nhiệm vụ.' },
  { dimensionId: 'trait_03', reversed: false, isLieScale: false, textVi: 'Tôi chủ động tìm hiểu các phương thức tấn công mạng mới để phòng tránh cho sản phẩm của mình.' },
  { dimensionId: 'trait_03', reversed: true, isLieScale: false, textVi: 'Tôi chấp nhận tạm bỏ qua bước kiểm tra an toàn để việc thử nghiệm diễn ra nhanh chóng hơn.' },
  { dimensionId: 'trait_03', reversed: true, isLieScale: false, textVi: 'Tôi cho rằng bảo mật là trách nhiệm của bộ phận kiểm soát thay vì của người viết mã.' },
  { dimensionId: 'trait_03', reversed: true, isLieScale: false, textVi: 'Tôi đôi khi để các thông tin truy cập nhạy cảm ngay trong mã nguồn nhằm mục đích kiểm tra nhanh.' },
  { dimensionId: 'trait_03', reversed: true, isLieScale: false, textVi: 'Tôi thường phớt lờ các cảnh báo về an toàn nếu chúng làm chậm tốc độ xử lý của hệ thống.' },
  { dimensionId: 'trait_03', reversed: true, isLieScale: false, textVi: 'Tôi thấy việc cài đặt các lớp bảo vệ phức tạp thường gây phiền hà cho người sử dụng.' },

  // ── NHÓM 4: Chính trực (trait_04) ──────────────────────
  { dimensionId: 'trait_04', reversed: false, isLieScale: false, textVi: 'Tôi sẵn sàng nhận trách nhiệm về mình khi dự án thất bại dù nguyên nhân từ thành viên khác.' },
  { dimensionId: 'trait_04', reversed: false, isLieScale: false, textVi: 'Tôi chủ động báo cáo lỗi sai của mình ngay lập tức dù việc đó làm giảm điểm đánh giá.' },
  { dimensionId: 'trait_04', reversed: false, isLieScale: false, textVi: 'Tôi sẵn sàng làm việc thêm giờ để khắc phục sự cố do mình gây ra mà không đòi hỏi.' },
  { dimensionId: 'trait_04', reversed: false, isLieScale: false, textVi: 'Tôi thường thẳng thắn góp ý về những sai sót kỹ thuật của đồng nghiệp một cách chân thành.' },
  { dimensionId: 'trait_04', reversed: false, isLieScale: false, textVi: 'Tôi giữ đúng cam kết về thời gian và chất lượng công việc trong mọi tình huống khó khăn.' },
  { dimensionId: 'trait_04', reversed: true, isLieScale: false, textVi: 'Tôi thường đợi đến khi có người phát hiện ra lỗi rồi mới bắt đầu tìm cách xử lý.' },
  { dimensionId: 'trait_04', reversed: true, isLieScale: false, textVi: 'Tôi ưu tiên bảo vệ lợi ích và uy tín cá nhân hơn là phơi bày những sai sót của tập thể.' },
  { dimensionId: 'trait_04', reversed: true, isLieScale: false, textVi: 'Tôi có xu hướng báo cáo tiến độ tốt hơn thực tế để tránh những cuộc họp kéo dài.' },
  { dimensionId: 'trait_04', reversed: true, isLieScale: false, textVi: 'Tôi thỉnh thoảng giấu đi những lỗi nhỏ nếu tự tin rằng chúng không gây hậu quả ngay lập tức.' },
  { dimensionId: 'trait_04', reversed: true, isLieScale: false, textVi: 'Tôi thường đổ lỗi cho sự thiếu rõ ràng của yêu cầu khi công việc không đạt kết quả.' },

  // ── NHÓM 5: Thích nghi (trait_05) ──────────────────────
  { dimensionId: 'trait_05', reversed: false, isLieScale: false, textVi: 'Tôi giữ được sự bình tĩnh và làm việc hiệu quả khi yêu cầu thay đổi vào phút chót.' },
  { dimensionId: 'trait_05', reversed: false, isLieScale: false, textVi: 'Tôi sẵn sàng chuyển sang một dự án hoàn toàn mới dù chưa kịp làm quen hết đồng nghiệp cũ.' },
  { dimensionId: 'trait_05', reversed: false, isLieScale: false, textVi: 'Tôi thích nghi nhanh chóng với các quy trình quản lý mới khi công ty thay đổi cơ cấu.' },
  { dimensionId: 'trait_05', reversed: false, isLieScale: false, textVi: 'Tôi coi những thay đổi bất ngờ là cơ hội để rèn luyện khả năng xử lý tình huống của mình.' },
  { dimensionId: 'trait_05', reversed: false, isLieScale: false, textVi: 'Tôi có thể làm việc tốt với nhiều nhóm người có tính cách và phương pháp làm việc khác nhau.' },
  { dimensionId: 'trait_05', reversed: true, isLieScale: false, textVi: 'Tôi cảm thấy khó chịu khi phải bỏ dở những phần việc đã dày công xây dựng vì kế hoạch thay đổi.' },
  { dimensionId: 'trait_05', reversed: true, isLieScale: false, textVi: 'Tôi thường mất nhiều thời gian để làm quen khi phải sử dụng một bộ công cụ làm việc mới.' },
  { dimensionId: 'trait_05', reversed: true, isLieScale: false, textVi: 'Tôi ưu tiên sự ổn định và ngại thay đổi các thói quen làm việc lâu năm của bản thân.' },
  { dimensionId: 'trait_05', reversed: true, isLieScale: false, textVi: 'Tôi thường thấy lúng túng khi phải làm việc trong một môi trường thiếu quy trình rõ ràng.' },
  { dimensionId: 'trait_05', reversed: true, isLieScale: false, textVi: 'Tôi cảm thấy mệt mỏi nếu phải liên tục cập nhật những quy định mới trong dự án.' },

  // ── NHÓM 6: Tự học (trait_06) ──────────────────────
  { dimensionId: 'trait_06', reversed: false, isLieScale: false, textVi: 'Tôi thường tự học thêm các phương pháp lập trình mới vào thời gian rảnh dù không ai yêu cầu.' },
  { dimensionId: 'trait_06', reversed: false, isLieScale: false, textVi: 'Tôi chủ động yêu cầu những lời nhận xét khắt khe để nhận ra điểm yếu của bản thân.' },
  { dimensionId: 'trait_06', reversed: false, isLieScale: false, textVi: 'Tôi coi những sai sót trong công việc là bài học quy giá để nâng cao trình độ chuyên môn.' },
  { dimensionId: 'trait_06', reversed: false, isLieScale: false, textVi: 'Tôi thường xuyên theo dõi tin tức về sự thay đổi của công nghệ để không bị lạc hậu.' },
  { dimensionId: 'trait_06', reversed: false, isLieScale: false, textVi: 'Tôi sẵn sàng thử thách bản thân với những nhiệm vụ khó vượt quá khả năng hiện tại.' },
  { dimensionId: 'trait_06', reversed: true, isLieScale: false, textVi: 'Tôi thấy hài lòng với những kiến thức mình đang có và không có nhu cầu học thêm cái mới.' },
  { dimensionId: 'trait_06', reversed: true, isLieScale: false, textVi: 'Tôi tin rằng kinh nghiệm thực tế quan trọng hơn nhiều so với việc đọc sách hay học lý thuyết.' },
  { dimensionId: 'trait_06', reversed: true, isLieScale: false, textVi: 'Tôi thường cảm thấy nản lòng khi phải đối mặt với một công nghệ hoàn toàn xa lạ.' },
  { dimensionId: 'trait_06', reversed: true, isLieScale: false, textVi: 'Tôi chỉ học những gì thực sự cần thiết để hoàn thành công việc được giao hàng ngày.' },
  { dimensionId: 'trait_06', reversed: true, isLieScale: false, textVi: 'Tôi thấy việc tham gia các buổi chia sẻ kiến thức thường làm tốn thời gian làm việc chính.' },

  // ── NHÓM 7: Giải quyết vấn đề (trait_07) ──────────────────────
  { dimensionId: 'trait_07', reversed: false, isLieScale: false, textVi: 'Tôi thích cảm giác tự mình mày mò tìm ra nguyên nhân của một lỗi hệ thống hóc búa.' },
  { dimensionId: 'trait_07', reversed: false, isLieScale: false, textVi: 'Tôi thường đưa ra nhiều phương án dự phòng trước khi bắt tay vào giải quyết một vấn đề.' },
  { dimensionId: 'trait_07', reversed: false, isLieScale: false, textVi: 'Tôi có khả năng tập trung cao độ trong nhiều giờ để tìm ra cách xử lý một sai sót kỹ thuật.' },
  { dimensionId: 'trait_07', reversed: false, isLieScale: false, textVi: 'Tôi thường tìm cách phân tích vấn đề lớn thành những phần nhỏ để dễ dàng quản lý hơn.' },
  { dimensionId: 'trait_07', reversed: false, isLieScale: false, textVi: 'Tôi ưu tiên tìm kiếm giải pháp triệt để thay vì chỉ dùng các biện pháp tạm thời.' },
  { dimensionId: 'trait_07', reversed: true, isLieScale: false, textVi: 'Tôi thường cảm thấy bế tắc và thử các cách làm ngẫu nhiên khi gặp một lỗi phần mềm lạ.' },
  { dimensionId: 'trait_07', reversed: true, isLieScale: false, textVi: 'Tôi có xu hướng nhờ người khác giải quyết giúp thay vì tự mình tìm hiểu quá lâu.' },
  { dimensionId: 'trait_07', reversed: true, isLieScale: false, textVi: 'Tôi nhanh chóng bỏ cuộc nếu một cách làm không đem lại kết quả ngay lập tức.' },
  { dimensionId: 'trait_07', reversed: true, isLieScale: false, textVi: 'Tôi thường cảm thấy áp lực và mất phương hướng khi khối lượng công việc phát sinh quá nhiều.' },
  { dimensionId: 'trait_07', reversed: true, isLieScale: false, textVi: 'Tôi thích làm những việc đã có hướng dẫn sẵn hơn là phải tự tìm con đường mới.' },

  // ── NHÓM 8: Cộng tác (trait_08) ──────────────────────
  { dimensionId: 'trait_08', reversed: false, isLieScale: false, textVi: 'Tôi thấy vui khi hỗ trợ được thành viên mới làm quen với công việc nhanh chóng.' },
  { dimensionId: 'trait_08', reversed: false, isLieScale: false, textVi: 'Tôi chủ động chia sẻ những cách làm hay hoặc công cụ tốt mà mình mới tìm thấy cho cả nhóm.' },
  { dimensionId: 'trait_08', reversed: false, isLieScale: false, textVi: 'Tôi luôn lắng nghe và tôn trọng những ý kiến khác biệt của đồng nghiệp trong các buổi thảo luận.' },
  { dimensionId: 'trait_08', reversed: false, isLieScale: false, textVi: 'Tôi sẵn sàng dừng việc cá nhân để giúp đỡ đồng đội đang gặp khó khăn gây tắc nghẽn chung.' },
  { dimensionId: 'trait_08', reversed: false, isLieScale: false, textVi: 'Tôi ưu tiên lợi ích chung của tập thể hơn là việc chứng minh cái tôi cá nhân đúng.' },
  { dimensionId: 'trait_08', reversed: true, isLieScale: false, textVi: 'Tôi thấy việc phải giải thích cách làm của mình cho người khác là một việc gây phiền hà.' },
  { dimensionId: 'trait_08', reversed: true, isLieScale: false, textVi: 'Tôi thích làm việc độc lập trên một phần riêng biệt mà không cần tương tác nhiều với nhóm.' },
  { dimensionId: 'trait_08', reversed: true, isLieScale: false, textVi: 'Tôi thường giữ lại những bí quyết làm việc riêng cho mình thay vì chia sẻ hết cho người khác.' },
  { dimensionId: 'trait_08', reversed: true, isLieScale: false, textVi: 'Tôi cảm thấy việc hướng dẫn người mới là sự tiêu tốn thời gian quý giá của bản thân.' },
  { dimensionId: 'trait_08', reversed: true, isLieScale: false, textVi: 'Tôi thường đưa ra những lời chỉ trích hơn là những hướng dẫn có tính xây dựng cho đồng nghiệp.' },

  // ── NHÓM 9: Quản lý thời gian (trait_09) ──────────────────────
  { dimensionId: 'trait_09', reversed: false, isLieScale: false, textVi: 'Tôi thường chia nhỏ đầu việc lớn để đánh giá thời gian hoàn thành chính xác hơn.' },
  { dimensionId: 'trait_09', reversed: false, isLieScale: false, textVi: 'Tôi chủ động từ chối các yêu cầu phát sinh nếu chúng làm ảnh hưởng xấu đến kế hoạch chung.' },
  { dimensionId: 'trait_09', reversed: false, isLieScale: false, textVi: 'Tôi thường xuyên cập nhật tiến độ công việc một cách trung thực trên hệ thống quản lý.' },
  { dimensionId: 'trait_09', reversed: false, isLieScale: false, textVi: 'Tôi biết cách sắp xếp thứ tự ưu tiên cho các nhiệm vụ dựa trên tầm quan trọng của chúng.' },
  { dimensionId: 'trait_09', reversed: false, isLieScale: false, textVi: 'Tôi luôn hoàn thành các phần việc quan trọng nhất vào thời điểm mình tỉnh táo nhất trong ngày.' },
  { dimensionId: 'trait_09', reversed: true, isLieScale: false, textVi: 'Tôi thường xuyên bị trễ hạn bàn giao vì đánh giá thấp độ phức tạp của công việc.' },
  { dimensionId: 'trait_09', reversed: true, isLieScale: false, textVi: 'Tôi hay làm các việc vặt phát sinh thay vì tập trung vào nhiệm vụ quan trọng nhất.' },
  { dimensionId: 'trait_09', reversed: true, isLieScale: false, textVi: 'Tôi cảm thấy khó khăn khi phải làm việc trong môi trường có quá nhiều cuộc họp ngắt quãng.' },
  { dimensionId: 'trait_09', reversed: true, isLieScale: false, textVi: 'Tôi thường để nước đến chân mới nhảy và làm việc vội vàng khi sắp hết thời gian.' },
  { dimensionId: 'trait_09', reversed: true, isLieScale: false, textVi: 'Tôi thường xuyên thay đổi kế hoạch làm việc vì bị xao nhãng bởi các yếu tố xung quanh.' },

  // ── NHÓM 10: Sản phẩm (trait_10) ──────────────────────
  { dimensionId: 'trait_10', reversed: false, isLieScale: false, textVi: 'Tôi thường tự trải nghiệm sản phẩm của công ty dưới góc nhìn của một người sử dụng bình thường.' },
  { dimensionId: 'trait_10', reversed: false, isLieScale: false, textVi: 'Tôi chủ động đề xuất thay đổi nếu thấy yêu cầu kỹ thuật có thể gây khó khăn cho người dùng.' },
  { dimensionId: 'trait_10', reversed: false, isLieScale: false, textVi: 'Tôi ưu tiên xử lý các lỗi gây ảnh hưởng trực tiếp đến người dùng trước các lỗi kỹ thuật ẩn.' },
  { dimensionId: 'trait_10', reversed: false, isLieScale: false, textVi: 'Tôi luôn tìm hiểu mục đích thực sự của khách hàng trước khi bắt tay vào viết mã nguồn.' },
  { dimensionId: 'trait_10', reversed: false, isLieScale: false, textVi: 'Tôi coi sự hài lòng của người dùng cuối là thước đo thành công lớn nhất của một lập trình viên.' },
  { dimensionId: 'trait_10', reversed: true, isLieScale: false, textVi: 'Tôi chỉ quan tâm đến việc mã nguồn chạy đúng yêu cầu mà không bận tâm sản phẩm có ích hay không.' },
  { dimensionId: 'trait_10', reversed: true, isLieScale: false, textVi: 'Tôi thấy khó khăn khi phải giải thích các vấn đề kỹ thuật cho những người không có chuyên môn.' },
  { dimensionId: 'trait_10', reversed: true, isLieScale: false, textVi: 'Tôi ưu tiên sự thuận tiện của người viết mã hơn là trải nghiệm mượt mà của khách hàng.' },
  { dimensionId: 'trait_10', reversed: true, isLieScale: false, textVi: 'Tôi thường phớt lờ các ý kiến đóng góp của người dùng nếu thấy chúng không hợp ý mình về kỹ thuật.' },
  { dimensionId: 'trait_10', reversed: true, isLieScale: false, textVi: 'Tôi cho rằng mình chỉ cần hoàn thành phần mã, việc sản phẩm thành công hay không là của bộ phận khác.' },

  // ── NHÓM 11: Sáng tạo (trait_11) ──────────────────────
  { dimensionId: 'trait_11', reversed: false, isLieScale: false, textVi: 'Tôi thường tìm cách tự động hóa các công việc lặp đi lặp lại để tiết kiệm thời gian cho nhóm.' },
  { dimensionId: 'trait_11', reversed: false, isLieScale: false, textVi: 'Tôi thích thử thách các quy trình cũ bằng những cách làm mới có hiệu quả cao hơn.' },
  { dimensionId: 'trait_11', reversed: false, isLieScale: false, textVi: 'Tôi thường đưa ra những ý tưởng độc đáo để tối ưu hệ thống mà ít người nghĩ tới.' },
  { dimensionId: 'trait_11', reversed: false, isLieScale: false, textVi: 'Tôi khuyến khích nhóm thử nghiệm các công cụ mới nếu chúng giải quyết tốt vấn đề hiện tại.' },
  { dimensionId: 'trait_11', reversed: false, isLieScale: false, textVi: 'Tôi luôn tìm cách cải tiến quy trình làm việc để nâng cao năng suất chung của dự án.' },
  { dimensionId: 'trait_11', reversed: true, isLieScale: false, textVi: 'Tôi thấy hài lòng với cách làm truyền thống và không muốn thay đổi thêm điều gì.' },
  { dimensionId: 'trait_11', reversed: true, isLieScale: false, textVi: 'Tôi cho rằng việc sáng tạo quá mức trong kỹ thuật thường mang lại nhiều rủi ro hơn lợi ích.' },
  { dimensionId: 'trait_11', reversed: true, isLieScale: false, textVi: 'Tôi hiếm khi đưa ra các sáng kiến mới và chỉ làm theo những gì đã được định sẵn.' },
  { dimensionId: 'trait_11', reversed: true, isLieScale: false, textVi: 'Tôi thấy việc học các công cụ mới là một gánh nặng hơn là sự hứng thú.' },
  { dimensionId: 'trait_11', reversed: true, isLieScale: false, textVi: 'Tôi ưu tiên sử dụng lại các giải pháp cũ dù biết chúng không còn thực sự hiệu quả.' },

  // ── NHÓM 12: Thang đo trung thực (trait_12 - Lie Scale) ──────────────────────
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Tôi chưa bao giờ nảy sinh ý định giấu giếm lỗi sai của mình với cấp trên trong suốt sự nghiệp.' },
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Tôi luôn hiểu rõ hoàn toàn từng dòng mã mà mình đã tham khảo và sao chép từ trên mạng.' },
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Tôi chưa bao giờ cảm thấy ghen tị khi thấy đồng nghiệp được khen thưởng còn mình thì không.' },
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Tôi luôn giữ lời hứa trong mọi hoàn cảnh, ngay cả với những việc nhỏ nhặt nhất.' },
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Tôi chưa bao giờ nói xấu hay phàn nàn về đồng nghiệp sau lưng họ.' },
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Tôi luôn làm việc với sự tập trung tuyệt đối mà không bao giờ bị xao nhãng bởi việc riêng.' },
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Tôi hoàn toàn chưa bao giờ mắc bất kỳ sai sót nào trong tất cả các dự án tôi từng tham gia.' },
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Tôi luôn sẵn lòng giúp đỡ tất cả mọi người bất kể tôi đang bận rộn đến mức nào.' },
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Tôi chưa bao giờ đi làm muộn hay về sớm dù chỉ một phút trong suốt thời gian làm việc.' },
  { dimensionId: 'trait_12', reversed: false, isLieScale: true, textVi: 'Tôi luôn đọc kỹ và ghi nhớ mọi quy định của công ty ngay từ lần đầu tiên xem qua.' },
];

export async function seedDevQuestions() {
  console.log("--- Seeding DEV Questions (SOTA V3.0 - 120 Items) ---");

  // 1. Lấy role DEV
  const devRole = await db.targetRole.findUnique({
    where: { code: "DEV" }
  });

  if (!devRole) {
    console.error("Role DEV not found. Please run seedRoles first.");
    return { results: ["Role DEV not found"] };
  }

  // 2. Deactivate các bộ cũ
  await db.questionSet.updateMany({
    where: { roleId: devRole.id },
    data: { isActive: false }
  });

  // 3. Tạo bộ câu hỏi mới
  const newSet = await db.questionSet.create({
    data: {
      roleId: devRole.id,
      version: "v3.0-sota-120",
      isActive: true,
    }
  });

  // 4. Insert 120 câu hỏi
  for (const q of DEV_QUESTIONS) {
    await db.question.create({
      data: {
        setId: newSet.id,
        textVi: q.textVi,
        textEn: q.textVi, // Vì yêu cầu không cần đa ngôn ngữ, dùng chung textVi
        textJa: q.textVi,
        dimensionId: q.dimensionId,
        reversed: q.reversed,
        isLieScale: q.isLieScale,
      }
    });
  }

  console.log(`Successfully seeded 120 questions for DEV version ${newSet.version}`);
  return {
    results: [`Successfully seeded 120 questions for DEV version ${newSet.version}`]
  };
}
