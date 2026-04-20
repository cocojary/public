import { AIReport } from "../utils/openaiService";

export const ADMIN_AI_REPORT_MOCK: AIReport = {
  reliabilityVerdict: "Dữ liệu bài đánh giá của Bạn có độ tin cậy rất cao. Chỉ số nói dối thấp (1.5/10) và độ nhất quán cao (92%) cho thấy Bạn đã trả lời các câu hỏi một cách khách quan và trung thực nhất, giúp kết quả phản ánh chính xác bản chất năng lực của Bạn.",
  reliabilityAlert: false,
  personaTitle: "Kiến Trúc Sư Vận Hành",
  personaEmoji: "🏗️",
  personaDescription: "Bạn là mẫu người có tinh thần trách nhiệm cực cao và luôn coi trọng sự chính xác. Bạn thường dành thời gian để rà soát kỹ lưỡng mọi khâu trong công việc (Hành vi) giúp hệ thống vận hành trơn tru và không xảy ra các sai sót đáng tiếc (Kết quả). Bạn tỏa sáng nhất trong những môi trường đòi hỏi sự tuân thủ quy trình và tính ổn định lâu dài.",
  personaCombination: "Sự kết hợp giữa tính Tận tâm cao và Điềm tĩnh tốt giúp Bạn giữ được sự tỉnh táo ngay cả khi đối mặt với khối lượng công tác hành chính khổng lồ. Tuy nhiên, do tinh thần Thách thức ở mức trung bình, Bạn nên chủ động tìm kiếm các giải pháp cải tiến quy trình thay vì chỉ dừng lại ở việc thực thi hoàn hảo các quy định sẵn có.",
  strengthsBlindSpots: {
    strengths: [
      { 
        title: "Tỉ mỉ & Chi tiết", 
        behavior: "Bạn luôn kiểm tra lại các số liệu và văn bản ít nhất hai lần (Hành vi) giúp loại bỏ 99% các lỗi đánh máy hoặc sai sót kỹ thuật trong báo cáo (Kết quả)." 
      },
      { 
        title: "Quản trị sự vụ", 
        behavior: "Bạn sắp xếp công việc theo thứ tự ưu tiên và lịch trình khoa học (Hành vi) đảm bảo mọi deadline hành chính đều được hoàn thành đúng hạn (Kết quả)." 
      },
      { 
        title: "Tính cam kết cao", 
        behavior: "Bạn luôn tuân thủ nghiêm túc các quy định và bảo mật thông tin nội bộ (Hành vi) tạo dựng niềm tin tuyệt đối từ ban lãnh đạo và đối tác (Kết quả)." 
      }
    ],
    blindSpots: [
      { 
        title: "Cầu toàn quá mức", 
        risk: "Bạn dành quá nhiều thời gian cho những chi tiết nhỏ không quan trọng (Hành vi) dẫn đến việc chậm trễ trong các quyết định đòi hỏi tốc độ (Kết quả)." 
      },
      { 
        title: "Ngại thay đổi", 
        risk: "Bạn có xu hướng bám víu vào các phương pháp làm việc cũ (Hành vi) khiến Bạn bỏ lỡ các công cụ công nghệ mới có thể tối ưu hiệu suất công việc (Kết quả)." 
      }
    ]
  },
  jobFit: {
    technical: { 
      score: 45, 
      comment: "Bạn phù hợp với vai trò Internal Auditor hoặc QA vì khả năng kiểm soát chất lượng tuyệt vời, tuy nhiên các mảng Deep Tech đòi hỏi tư duy sáng tạo cao hơn." 
    },
    business: { 
      score: 30, 
      comment: "Bạn có thể đảm nhận Inside Sales bởi tính kiên trì, nhưng các vai trò Hunter hoặc Strategic Sales có thể gây áp lực lớn do nhu cầu giao tiếp hướng ngoại liên tục." 
    },
    operations: { 
      score: 95, 
      comment: "Đây là vùng đất của Bạn. Đặc biệt là các vai trò Compliance Officer hoặc Admin Manager, nơi Bạn phát huy tối đa sự kỷ luật và năng lực tổ chức của mình." 
    },
    management: { 
      score: 70, 
      comment: "Bạn là một Operational Manager xuất sắc. Bạn quản trị con người dựa trên quy chuẩn và sự công bằng, giúp đội ngũ làm việc ổn định và có kỷ luật cao." 
    }
  },
  coachingAdvice: [
    {
      area: "Kỹ năng Công nghệ",
      action: "Bạn nên học cách sử dụng các công cụ AI và tự động hóa văn phòng (Hành động).",
      rationale: "Việc này giúp giải phóng 30% thời gian làm các tác vụ lặp lại để Bạn tập trung vào các công việc có giá trị gia tăng cao hơn."
    },
    {
      area: "Tư duy Chiến lược",
      action: "Bạn nên tham gia vào các buổi họp lập kế hoạch dài hạn của bộ phận (Hành động).",
      rationale: "Giúp Bạn mở rộng tầm nhìn thoát khỏi các sự vụ vụn vặt, từ đó đóng góp nhiều hơn vào mục tiêu chung của tổ chức."
    }
  ],
  language: "vi",
  generatedAt: new Date().toISOString(),
  fromCache: true,
  techzenCultureFitInsight: "Chuyên nghiệp, có tính ổn định phù hợp với môi trường kỷ luật nhưng có thể cần hỗ trợ thêm khi làm việc trong các startup hoặc đội nhóm có sự thay đổi liên tục."
};
