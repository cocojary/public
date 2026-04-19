"use server";

import prisma from "@/server/db";

// Leadership roles sẽ nhận bộ câu hỏi lãnh đạo
const LEADERSHIP_ROLE_CODES = ['DIR', 'HEAD', 'MANAGER'];

// 56 câu hỏi leadership (14 dimensions × 4 câu)
const LEADERSHIP_QUESTIONS = [
  // STRATEGIC VISION
  { numericId: 200, textVi: 'Tôi thường suy nghĩ về hướng đi của tổ chức trong 3–5 năm tới và chủ động đề xuất định hướng.', textEn: 'I often think about where the organization is heading in 3–5 years and proactively propose directions.', textJa: '私は組織の3〜5年後の方向性を考え、積極的に方向性を提案することが多い。', dimensionId: 'strategic_vision', reversed: false, isLieScale: false },
  { numericId: 201, textVi: 'Tôi sẵn sàng từ bỏ lợi ích ngắn hạn để bảo vệ lợi thế cạnh tranh dài hạn của doanh nghiệp.', textEn: 'I am willing to sacrifice short-term gains to protect the long-term competitive advantage of the business.', textJa: '私は事業の長期的な競争優位性を守るために、短期的な利益を犠牲にすることをいとわない。', dimensionId: 'strategic_vision', reversed: false, isLieScale: false },
  { numericId: 202, textVi: 'Tôi nhận ra các xu hướng thị trường và công nghệ trước khi chúng ảnh hưởng đến ngành của mình.', textEn: 'I identify market and technology trends before they impact my industry.', textJa: '私は市場や技術のトレンドが自分の業界に影響を与える前にそれを認識する。', dimensionId: 'strategic_vision', reversed: false, isLieScale: false },
  { numericId: 203, textVi: 'Tôi thường tập trung vào việc giải quyết vấn đề hàng ngày hơn là xây dựng tầm nhìn dài hạn.', textEn: 'I tend to focus on solving daily problems rather than building a long-term vision.', textJa: '私は長期的なビジョンを構築するよりも、日常の問題解決に集中する傾向がある。', dimensionId: 'strategic_vision', reversed: true, isLieScale: false },

  // DECISION MAKING
  { numericId: 204, textVi: 'Tôi có thể đưa ra quyết định quan trọng ngay cả khi thông tin chưa đầy đủ, chấp nhận rủi ro có tính toán.', textEn: 'I can make important decisions even with incomplete information, accepting calculated risks.', textJa: '私は情報が不完全な場合でも、計算されたリスクを受け入れながら重要な意思決定を行うことができる。', dimensionId: 'decision_making', reversed: false, isLieScale: false },
  { numericId: 205, textVi: 'Tôi không do dự khi cần hành động quyết liệt, kể cả khi điều đó làm nhiều người không hài lòng.', textEn: 'I do not hesitate to act decisively, even when it makes many people unhappy.', textJa: '私は多くの人を不満にさせるときでも、果断に行動することをためらわない。', dimensionId: 'decision_making', reversed: false, isLieScale: false },
  { numericId: 206, textVi: 'Sau khi ra quyết định, tôi cam kết thực thi triệt để và không dao động trừ khi có bằng chứng mới rõ ràng.', textEn: 'After making a decision, I commit to thorough execution and do not waver unless there is clear new evidence.', textJa: '決定を下した後、私は徹底的な実行にコミットし、明確な新たな証拠がない限り揺らがない。', dimensionId: 'decision_making', reversed: false, isLieScale: false },
  { numericId: 207, textVi: 'Tôi thường trì hoãn các quyết định khó và chờ ý kiến đồng thuận từ nhiều người trước.', textEn: 'I tend to delay difficult decisions and wait for consensus from many people first.', textJa: '私は困難な決断を先延ばしにし、まず多くの人からの合意を待つ傾向がある。', dimensionId: 'decision_making', reversed: true, isLieScale: false },

  // OWNERSHIP
  { numericId: 208, textVi: 'Khi có sự cố trong phạm vi của mình, tôi nhận trách nhiệm trực tiếp và đưa ra giải pháp — không đổ lỗi.', textEn: 'When there is an incident within my scope, I take direct responsibility and provide solutions — without blaming others.', textJa: '自分の範囲内でインシデントが発生した場合、私は直接責任を負い、他者を責めることなく解決策を提供する。', dimensionId: 'ownership', reversed: false, isLieScale: false },
  { numericId: 209, textVi: 'Tôi xem thành bại của tổ chức như thành bại của bản thân — dù tôi không phải người thực thi trực tiếp.', textEn: 'I see the success or failure of the organization as my own — even when I am not the direct executor.', textJa: '私は自分が直接の実行者でない場合でも、組織の成功や失敗を自分のものとして捉える。', dimensionId: 'ownership', reversed: false, isLieScale: false },
  { numericId: 210, textVi: 'Tôi sẵn sàng đầu tư nguồn lực cá nhân (thời gian, uy tín) khi tổ chức cần, không đợi được yêu cầu.', textEn: 'I am willing to invest personal resources (time, reputation) when the organization needs it, without waiting to be asked.', textJa: '私は求められるのを待たずに、組織が必要とするときに個人のリソース（時間、評判）を喜んで投資する。', dimensionId: 'ownership', reversed: false, isLieScale: false },
  { numericId: 211, textVi: 'Khi dự án thất bại, tôi thường phân tích xem ai chịu trách nhiệm thay vì tự hỏi mình có thể làm gì khác.', textEn: 'When a project fails, I tend to analyze who is responsible rather than asking myself what I could have done differently.', textJa: 'プロジェクトが失敗したとき、私は自分が何をすべきだったかを問うのではなく、誰が責任を負うかを分析する傾向がある。', dimensionId: 'ownership', reversed: true, isLieScale: false },

  // PEOPLE LEADERSHIP
  { numericId: 212, textVi: 'Tôi trao quyền cho cấp dưới và tin tưởng họ tự ra quyết định trong phạm vi được giao.', textEn: 'I empower my subordinates and trust them to make decisions within their assigned scope.', textJa: '私は部下に権限を与え、割り当てられた範囲内で自ら意思決定することを信頼する。', dimensionId: 'people_leadership', reversed: false, isLieScale: false },
  { numericId: 213, textVi: 'Tôi đầu tư thời gian cá nhân để phát triển từng thành viên trong đội nhóm, không chỉ giao việc.', textEn: 'I invest personal time to develop each team member individually, not just assign tasks.', textJa: '私はただタスクを割り当てるだけでなく、チームの各メンバーを個別に育成するために個人の時間を投資する。', dimensionId: 'people_leadership', reversed: false, isLieScale: false },
  { numericId: 214, textVi: 'Tôi không ngần ngại thay thế nhân sự không phù hợp, kể cả khi họ là người thân thiết.', textEn: 'I do not hesitate to replace underperforming staff, even if they are close to me.', textJa: '私は親しい関係であっても、適切でないスタッフを交代させることをためらわない。', dimensionId: 'people_leadership', reversed: false, isLieScale: false },
  { numericId: 215, textVi: 'Tôi thường kiểm tra từng bước công việc của cấp dưới để đảm bảo mọi thứ đúng như ý mình.', textEn: 'I tend to check every step of my subordinates\' work to ensure everything is exactly as I want.', textJa: '私はすべてが自分の思い通りであることを確認するために、部下の仕事の各ステップを確認する傾向がある。', dimensionId: 'people_leadership', reversed: true, isLieScale: false },

  // ORGANIZATION BUILDING
  { numericId: 216, textVi: 'Tôi xây dựng quy trình và hệ thống để tổ chức vận hành tốt ngay cả khi tôi vắng mặt.', textEn: 'I build processes and systems so the organization runs well even in my absence.', textJa: '私は自分が不在の時でも組織がうまく機能するようにプロセスとシステムを構築する。', dimensionId: 'organization_building', reversed: false, isLieScale: false },
  { numericId: 217, textVi: 'Tôi chủ động chuẩn hóa quy trình và tài liệu hóa kiến thức thay vì dựa vào cá nhân giỏi.', textEn: 'I proactively standardize processes and document knowledge rather than relying on talented individuals.', textJa: '私は優秀な個人に依存するのではなく、積極的にプロセスを標準化し、知識を文書化する。', dimensionId: 'organization_building', reversed: false, isLieScale: false },
  { numericId: 218, textVi: 'Tôi thiết kế cấu trúc tổ chức và phân công trách nhiệm rõ ràng, có thể mở rộng khi cần.', textEn: 'I design clear organizational structures and role assignments that can scale when needed.', textJa: '私は必要に応じてスケールできる明確な組織構造と役割分担を設計する。', dimensionId: 'organization_building', reversed: false, isLieScale: false },
  { numericId: 219, textVi: 'Tổ chức của tôi phụ thuộc vào một vài cá nhân then chốt — nếu họ nghỉ, hoạt động sẽ bị ảnh hưởng lớn.', textEn: 'My organization depends on a few key individuals — if they leave, operations will be greatly affected.', textJa: '私の組織は少数の重要な個人に依存しており、彼らが離れると業務に大きな影響が出る。', dimensionId: 'organization_building', reversed: true, isLieScale: false },

  // PERFORMANCE MANAGEMENT
  { numericId: 220, textVi: 'Tôi thiết lập KPI rõ ràng và đánh giá hiệu suất một cách khách quan, dựa trên dữ liệu thực tế.', textEn: 'I set clear KPIs and evaluate performance objectively based on actual data.', textJa: '私は明確なKPIを設定し、実際のデータに基づいてパフォーマンスを客観的に評価する。', dimensionId: 'performance_management', reversed: false, isLieScale: false },
  { numericId: 221, textVi: 'Tôi khen thưởng người làm tốt và xử lý thẳng thắn người không đạt yêu cầu, bất kể mối quan hệ.', textEn: 'I reward high performers and address underperformers directly, regardless of personal relationships.', textJa: '私は個人的な関係に関係なく、高いパフォーマンスを発揮する人を報い、不十分な人に直接対処する。', dimensionId: 'performance_management', reversed: false, isLieScale: false },
  { numericId: 222, textVi: 'Tôi phản hồi hiệu suất của cấp dưới thường xuyên, không chờ đến cuối kỳ đánh giá.', textEn: 'I provide performance feedback to subordinates regularly, not waiting until the end of review periods.', textJa: '私は評価期間の終わりを待たずに、定期的に部下のパフォーマンスフィードバックを提供する。', dimensionId: 'performance_management', reversed: false, isLieScale: false },
  { numericId: 223, textVi: 'Tôi thường tránh đưa ra nhận xét tiêu cực vì sợ ảnh hưởng đến cảm xúc của cấp dưới.', textEn: 'I tend to avoid giving negative feedback for fear of affecting my subordinates\' emotions.', textJa: '私は部下の感情に影響を与えることを恐れて、否定的なフィードバックを避ける傾向がある。', dimensionId: 'performance_management', reversed: true, isLieScale: false },

  // FINANCIAL MANAGEMENT
  { numericId: 224, textVi: 'Tôi kiểm soát chặt chẽ dòng tiền và có thể dự báo tình hình tài chính tổ chức trong 3–6 tháng tới.', textEn: 'I maintain tight control over cash flow and can forecast the organization\'s financial position for the next 3–6 months.', textJa: '私はキャッシュフローを厳格に管理し、組織の財務状況を3〜6ヶ月先まで予測できる。', dimensionId: 'financial_management', reversed: false, isLieScale: false },
  { numericId: 225, textVi: 'Tôi từ chối các cơ hội doanh thu nếu nhận thấy rủi ro tài chính vượt mức chấp nhận được.', textEn: 'I decline revenue opportunities when I see financial risks exceeding acceptable levels.', textJa: '私は財務リスクが許容レベルを超えると判断した場合、収益機会を断る。', dimensionId: 'financial_management', reversed: false, isLieScale: false },
  { numericId: 226, textVi: 'Tôi thường xuyên review P&L và biết rõ lý do đằng sau từng biến động chi phí lớn.', textEn: 'I regularly review P&L and clearly understand the reasons behind each major cost fluctuation.', textJa: '私は定期的にP&Lをレビューし、主要なコスト変動の背景にある理由を明確に把握している。', dimensionId: 'financial_management', reversed: false, isLieScale: false },
  { numericId: 227, textVi: 'Tôi ưu tiên tăng doanh thu mà không chú trọng nhiều vào kiểm soát chi phí và biên lợi nhuận.', textEn: 'I prioritize revenue growth without paying much attention to cost control and profit margins.', textJa: '私はコスト管理や利益率にあまり注意を払わずに収益成長を優先する。', dimensionId: 'financial_management', reversed: true, isLieScale: false },

  // CUSTOMER/PARTNER MANAGEMENT
  { numericId: 228, textVi: 'Tôi minh bạch với khách hàng và đối tác ngay cả khi thông tin không có lợi cho mình.', textEn: 'I am transparent with customers and partners even when the information is not in my favor.', textJa: '私は情報が自分に不利な場合でも、顧客やパートナーに対して透明性を持つ。', dimensionId: 'customer_partner_management', reversed: false, isLieScale: false },
  { numericId: 229, textVi: 'Tôi cắt bỏ mối quan hệ với đối tác vi phạm giá trị cốt lõi, dù họ mang lại doanh thu lớn.', textEn: 'I sever relationships with partners who violate core values, even if they generate significant revenue.', textJa: '私はコアバリューに違反するパートナーとの関係を切断する、たとえ彼らが大きな収益をもたらしていても。', dimensionId: 'customer_partner_management', reversed: false, isLieScale: false },
  { numericId: 230, textVi: 'Tôi xây dựng quan hệ đối tác dựa trên sự công bằng và lợi ích hai chiều dài hạn.', textEn: 'I build partnerships based on fairness and long-term mutual benefit.', textJa: '私は公平性と長期的な相互利益に基づいてパートナーシップを構築する。', dimensionId: 'customer_partner_management', reversed: false, isLieScale: false },
  { numericId: 231, textVi: 'Tôi thường giữ thông tin bất lợi lại và chỉ chia sẻ khi không còn cách nào khác.', textEn: 'I tend to withhold unfavorable information and only share it when there is no other option.', textJa: '私は不利な情報を保留しておき、他に選択肢がない場合にのみ共有する傾向がある。', dimensionId: 'customer_partner_management', reversed: true, isLieScale: false },

  // EXECUTIVE COMMUNICATION
  { numericId: 232, textVi: 'Tôi truyền đạt ý kiến ngắn gọn, trực tiếp và đi thẳng vào vấn đề — không dài dòng hay vòng vo.', textEn: 'I communicate concisely, directly, and get straight to the point — without being verbose or roundabout.', textJa: '私は簡潔に、直接的に、そして要点に直接アプローチして伝える — 冗長さや遠回しを避ける。', dimensionId: 'executive_communication', reversed: false, isLieScale: false },
  { numericId: 233, textVi: 'Tôi có thể diễn đạt vấn đề phức tạp theo cách mà cả Board lẫn nhân viên cấp thấp đều hiểu được.', textEn: 'I can articulate complex issues in a way that both the Board and frontline employees can understand.', textJa: '私は取締役会と現場の従業員の両方が理解できる方法で複雑な問題を明確に伝えることができる。', dimensionId: 'executive_communication', reversed: false, isLieScale: false },
  { numericId: 234, textVi: 'Tôi không né tránh thông tin xấu — tôi truyền đạt rõ ràng và đưa ra giải pháp đi kèm.', textEn: 'I do not shy away from bad news — I communicate it clearly and provide accompanying solutions.', textJa: '私は悪いニュースを避けることなく、明確に伝え、解決策を提示する。', dimensionId: 'executive_communication', reversed: false, isLieScale: false },
  { numericId: 235, textVi: 'Tôi thường dùng nhiều câu chữ để đảm bảo không ai hiểu sai, kể cả khi điều đó khiến thông điệp dài hơn cần thiết.', textEn: 'I tend to use many words to ensure no one misunderstands, even when this makes the message longer than necessary.', textJa: '私はメッセージが必要以上に長くなっても、誰も誤解しないように多くの言葉を使う傾向がある。', dimensionId: 'executive_communication', reversed: true, isLieScale: false },

  // CHANGE MANAGEMENT
  { numericId: 236, textVi: 'Tôi chủ động dẫn dắt thay đổi trong tổ chức và xử lý sự kháng cự một cách có hệ thống.', textEn: 'I proactively lead change in the organization and systematically manage resistance.', textJa: '私は組織の変革を積極的に主導し、抵抗を体系的に管理する。', dimensionId: 'change_management', reversed: false, isLieScale: false },
  { numericId: 237, textVi: 'Tôi sẵn sàng phá bỏ quy trình cũ không còn hiệu quả, kể cả khi nó đã tồn tại lâu năm.', textEn: 'I am willing to dismantle old processes that are no longer effective, even if they have existed for many years.', textJa: '私は長年存在していても、もはや効果的でない古いプロセスを解体することをいとわない。', dimensionId: 'change_management', reversed: false, isLieScale: false },
  { numericId: 238, textVi: 'Tôi không cả nể những người có công lớn nhưng đang cản trở sự thay đổi cần thiết.', textEn: 'I do not pander to those with past merits who are now blocking necessary change.', textJa: '私は必要な変革を阻んでいる過去の功績がある人を甘やかすことはしない。', dimensionId: 'change_management', reversed: false, isLieScale: false },
  { numericId: 239, textVi: 'Tôi thường giữ nguyên cách làm cũ vì thay đổi sẽ tạo ra xáo trộn và rủi ro không cần thiết.', textEn: 'I tend to keep old ways of doing things because change creates unnecessary disruption and risk.', textJa: '私は変化が不必要な混乱とリスクをもたらすため、古いやり方を維持する傾向がある。', dimensionId: 'change_management', reversed: true, isLieScale: false },

  // RISK MANAGEMENT
  { numericId: 240, textVi: 'Tôi chủ động nhận diện rủi ro trước khi chúng xảy ra và có kế hoạch phòng ngừa cụ thể.', textEn: 'I proactively identify risks before they occur and have specific prevention plans.', textJa: '私はリスクが発生する前に積極的に特定し、具体的な予防計画を持っている。', dimensionId: 'risk_management', reversed: false, isLieScale: false },
  { numericId: 241, textVi: 'Tôi sẵn sàng đầu tư chi phí phòng ngừa rủi ro dù chưa có dấu hiệu sự cố rõ ràng.', textEn: 'I am willing to invest in risk prevention costs even when there are no clear signs of an incident.', textJa: '私はインシデントの明確な兆候がなくても、リスク予防コストに投資することをいとわない。', dimensionId: 'risk_management', reversed: false, isLieScale: false },
  { numericId: 242, textVi: 'Tôi tuân thủ nghiêm ngặt các yêu cầu pháp lý và an toàn, kể cả khi điều đó làm chậm tốc độ.', textEn: 'I strictly comply with legal and safety requirements, even when this slows things down.', textJa: '私は速度が落ちる場合でも、法的・安全要件を厳格に遵守する。', dimensionId: 'risk_management', reversed: false, isLieScale: false },
  { numericId: 243, textVi: 'Tôi thường xử lý rủi ro theo kiểu "đến đâu hay đến đó" thay vì lập kế hoạch từ trước.', textEn: 'I tend to handle risks reactively rather than planning ahead.', textJa: '私は事前に計画するのではなく、その場しのぎでリスクに対処する傾向がある。', dimensionId: 'risk_management', reversed: true, isLieScale: false },

  // SELF DISCIPLINE
  { numericId: 244, textVi: 'Tôi duy trì thói quen làm việc và sức khỏe nghiêm túc — kể cả trong giai đoạn bận rộn nhất.', textEn: 'I maintain strict work and health habits — even during the busiest periods.', textJa: '私は最も忙しい時期でも、厳格な仕事と健康の習慣を維持する。', dimensionId: 'self_discipline', reversed: false, isLieScale: false },
  { numericId: 245, textVi: 'Tôi áp dụng chính mình các tiêu chuẩn tôi đặt ra cho người khác — không có ngoại lệ cho bản thân.', textEn: 'I hold myself to the same standards I set for others — without exceptions for myself.', textJa: '私は他者に設定した基準を自分自身にも適用する — 自分への例外はない。', dimensionId: 'self_discipline', reversed: false, isLieScale: false },
  { numericId: 246, textVi: 'Tôi tự phạt hoặc công khai thừa nhận khi vi phạm cam kết của chính mình trước đội nhóm.', textEn: 'I self-penalize or publicly acknowledge when I violate my own commitments before my team.', textJa: '私はチームの前で自分のコミットメントに違反した場合、自分を罰するか公に認める。', dimensionId: 'self_discipline', reversed: false, isLieScale: false },
  { numericId: 247, textVi: 'Tôi đôi khi cho phép bản thân ngoại lệ những quy tắc tôi đặt ra vì hoàn cảnh đặc biệt.', textEn: 'I sometimes allow myself exceptions to the rules I set due to special circumstances.', textJa: '私は特別な状況を理由に、自分が設定したルールの例外を自分に許すことがある。', dimensionId: 'self_discipline', reversed: true, isLieScale: false },

  // CONTINUOUS LEARNING
  { numericId: 248, textVi: 'Tôi dành thời gian học hỏi về công nghệ và xu hướng mới ngay cả khi công việc hiện tại không yêu cầu.', textEn: 'I dedicate time to learning about new technologies and trends even when my current role does not require it.', textJa: '私は現在の役割が要求しない場合でも、新しい技術やトレンドの学習に時間を割く。', dimensionId: 'continuous_learning', reversed: false, isLieScale: false },
  { numericId: 249, textVi: 'Tôi sẵn sàng phủ nhận những gì mình biết để tiếp thu kiến thức và phương pháp mới hơn.', textEn: 'I am willing to discard what I know to absorb newer knowledge and methods.', textJa: '私はより新しい知識と方法を吸収するために、自分が知っていることを否定することをいとわない。', dimensionId: 'continuous_learning', reversed: false, isLieScale: false },
  { numericId: 250, textVi: 'Tôi tìm kiếm mentor và người giỏi hơn mình để học hỏi liên tục, không giới hạn ở vị trí hiện tại.', textEn: 'I seek mentors and people better than me to continuously learn, not limited by my current position.', textJa: '私は現在のポジションに制限されず、継続的に学ぶためにメンターや自分より優れた人を求める。', dimensionId: 'continuous_learning', reversed: false, isLieScale: false },
  { numericId: 251, textVi: 'Tôi cảm thấy kinh nghiệm và kiến thức hiện tại đã đủ để điều hành tổ chức mà không cần học thêm nhiều.', textEn: 'I feel my current experience and knowledge are sufficient to run the organization without needing to learn much more.', textJa: '私は現在の経験と知識が組織を運営するのに十分であり、それ以上学ぶ必要はないと感じている。', dimensionId: 'continuous_learning', reversed: true, isLieScale: false },

  // PRESSURE BALANCE
  { numericId: 252, textVi: 'Tôi duy trì sự tĩnh lặng và ra quyết định sáng suốt ngay cả trong khủng hoảng — không để cảm xúc chi phối.', textEn: 'I maintain calm and make sound decisions even in crises — without letting emotions dominate.', textJa: '私は危機の中でも冷静さを保ち、感情に支配されることなく賢明な意思決定を行う。', dimensionId: 'pressure_balance', reversed: false, isLieScale: false },
  { numericId: 253, textVi: 'Tôi kiên định với chiến lược bất chấp áp lực từ nhiều phía — cổ đông, đội nhóm, hay thị trường.', textEn: 'I remain steadfast in my strategy despite pressure from multiple sides — shareholders, team, or market.', textJa: '私は株主、チーム、市場など多方面からの圧力にも関わらず、戦略に対して揺るぎない姿勢を保つ。', dimensionId: 'pressure_balance', reversed: false, isLieScale: false },
  { numericId: 254, textVi: 'Trong giai đoạn khủng hoảng, tôi là người giữ bình tĩnh và trở thành điểm tựa cho đội nhóm.', textEn: 'During crisis periods, I am the one who stays calm and becomes an anchor for the team.', textJa: '危機の時期、私は冷静さを保ち、チームの拠り所となる人物である。', dimensionId: 'pressure_balance', reversed: false, isLieScale: false },
  { numericId: 255, textVi: 'Khi bị nhiều phía phản đối, tôi thường thay đổi quyết định để xoa dịu áp lực thay vì bảo vệ chiến lược đúng.', textEn: 'When opposed by many sides, I tend to change decisions to ease pressure rather than defending the right strategy.', textJa: '多くの側から反対されると、私は正しい戦略を守るのではなく、圧力を和らげるために決断を変える傾向がある。', dimensionId: 'pressure_balance', reversed: true, isLieScale: false },
];

export async function seedLeadershipQuestions() {
  const results: string[] = [];

  for (const roleCode of LEADERSHIP_ROLE_CODES) {
    // Tìm role
    const role = await prisma.targetRole.findUnique({ where: { code: roleCode } });
    if (!role) {
      results.push(`⚠️ Role ${roleCode} không tồn tại. Bỏ qua.`);
      continue;
    }

    // Lấy question set active mới nhất
    const qSet = await prisma.questionSet.findFirst({
      where: { roleId: role.id, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { questions: { select: { dimensionId: true } } },
    });

    if (!qSet) {
      results.push(`⚠️ ${roleCode}: Không tìm thấy QuestionSet active. Bỏ qua.`);
      continue;
    }

    // Kiểm tra đã có leadership questions chưa
    const existingLeadershipCount = qSet.questions.filter(
      q => ['strategic_vision', 'decision_making', 'ownership', 'people_leadership'].includes(q.dimensionId)
    ).length;

    if (existingLeadershipCount > 0) {
      results.push(`⏭️  ${roleCode}: Đã có ${existingLeadershipCount} leadership questions. Bỏ qua để tránh duplicate.`);
      continue;
    }

    // Thêm leadership questions vào question set
    await prisma.question.createMany({
      data: LEADERSHIP_QUESTIONS.map(q => ({
        setId: qSet.id,
        textVi: q.textVi,
        textEn: q.textEn,
        textJa: q.textJa,
        dimensionId: q.dimensionId,
        reversed: q.reversed,
        isLieScale: q.isLieScale,
      })),
    });

    results.push(`✅ ${roleCode}: Đã thêm ${LEADERSHIP_QUESTIONS.length} leadership questions vào QuestionSet ${qSet.id}`);
  }

  return { success: true, results };
}
