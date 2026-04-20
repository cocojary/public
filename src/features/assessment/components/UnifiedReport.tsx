"use client";

// ============================================================
// UnifiedReport — Báo cáo SPI Techzen (Phiên bản cải tiến)
// Nhận dữ liệu dạng UnifiedReportData từ unifiedScoring.ts
// Thiết kế: Gauge Chart + Tab Navigation + Role Matrix + AI Card
// ============================================================

import React, { useState, useMemo, useRef } from 'react';
import type { UnifiedReportData, UnifiedGroup, UnifiedScoreItem } from '../utils/unifiedScoring';
import type { AIReport } from '../utils/openaiService';
import { detectPersonaRanked } from '../data/aiAnalysis';
import type { DimensionScore } from '../data/scoring';

// ─── PROPS ────────────────────────────────────────────────────
interface UnifiedReportProps {
  data: UnifiedReportData;
  aiReport?: AIReport | null;
  candidateName?: string;
  reportDate?: Date;
}

// ─── NHÃN MỨC ĐỘ ─────────────────────────────────────────────
function getScoreLabel(score: number): { text: string; color: string; bg: string } {
  if (score >= 8.5) return { text: 'Xuất sắc',       color: '#059669', bg: '#D1FAE5' };
  if (score >= 7.0) return { text: 'Tốt',             color: '#2563EB', bg: '#DBEAFE' };
  if (score >= 5.0) return { text: 'Trung bình',      color: '#D97706', bg: '#FEF3C7' };
  if (score >= 3.0) return { text: 'Cần phát triển',  color: '#DC2626', bg: '#FEE2E2' };
  return               { text: 'Yếu',              color: '#7C3AED', bg: '#EDE9FE' };
}

// ─── SEMI-CIRCLE GAUGE SVG ────────────────────────────────────
function GaugeChart({ value, max = 10, color, size = 100 }: {
  value: number; max?: number; color: string; size?: number;
}) {
  const pct = Math.min(1, Math.max(0, value / max));
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size * 0.58;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const startDeg = -180, endDeg = 0;
  const arcX = (deg: number) => cx + r * Math.cos(toRad(deg));
  const arcY = (deg: number) => cy + r * Math.sin(toRad(deg));
  const valDeg = startDeg + pct * (endDeg - startDeg);

  const bgPath = `M ${arcX(startDeg)} ${arcY(startDeg)} A ${r} ${r} 0 0 1 ${arcX(endDeg)} ${arcY(endDeg)}`;
  const fgPath = pct > 0.001
    ? `M ${arcX(startDeg)} ${arcY(startDeg)} A ${r} ${r} 0 0 1 ${arcX(valDeg)} ${arcY(valDeg)}`
    : '';

  return (
    <svg width={size} height={size * 0.7} viewBox={`-${size*0.15} -${size*0.15} ${size*1.3} ${size*1.3}`}>
      <path d={bgPath} fill="none" stroke="#E5E7EB" strokeWidth={size * 0.09} strokeLinecap="round" />
      {fgPath && (
        <path d={fgPath} fill="none" stroke={color} strokeWidth={size * 0.09} strokeLinecap="round"
          style={{ transition: 'all 0.8s ease-out' }} />
      )}
      <text x={cx} y={cy - 2} textAnchor="middle" fill={color}
        fontSize={size * 0.22} fontWeight="700" fontFamily="system-ui">
        {value.toFixed(1)}
      </text>
      <text x={cx} y={cy + size * 0.13} textAnchor="middle" fill="#9CA3AF"
        fontSize={size * 0.1} fontFamily="system-ui">/10</text>
    </svg>
  );
}

// ─── COMMENT THEO TỪNG CHỈ SỐ & MỨC ĐIỂM ────────────────────
// Thứ tự: [Yếu <3, Cần phát triển 3–4.9, Trung bình 5–6.9, Tốt 7–8.4, Xuất sắc ≥8.5]
type CommentTiers = [string, string, string, string, string];
const DIM_COMMENTS: Record<string, CommentTiers> = {
  extraversion: [
    'Xu hướng hướng nội rõ rệt. Phù hợp công việc nghiên cứu, phân tích độc lập. Cần hỗ trợ khi đảm nhận vai trò tiếp xúc khách hàng.',
    'Thích không gian cá nhân, ít chủ động trong giao tiếp nhóm. Nên luyện tập tham gia cuộc họp và nêu ý kiến tích cực hơn.',
    'Cân bằng hướng nội – hướng ngoại. Có thể thích nghi theo ngữ cảnh, nhưng chưa thật sự nổi bật ở cả hai môi trường.',
    'Giao tiếp tự nhiên, cởi mở và năng động. Hoạt động tốt cả trong làm việc nhóm lẫn trình bày trước đám đông.',
    'Năng lượng xã hội nổi bật — dễ dàng dẫn dắt nhóm và tạo bầu không khí tích cực. Tài sản quý cho vai trò Sale, PR, Team Lead.',
  ],
  agreeableness: [
    'Rất độc lập trong quyết định, đôi khi bị xem là khó hợp tác. Cần lắng nghe quan điểm đồng nghiệp nhiều hơn.',
    'Thẳng thắn, có chính kiến riêng. Cần chú ý đến cách truyền đạt để tránh gây căng thẳng không cần thiết.',
    'Hợp tác ở mức vừa phải. Cần phát triển thêm kỹ năng đàm phán và đồng cảm để làm việc nhóm hiệu quả hơn.',
    'Hợp tác tốt, sẵn sàng lắng nghe và hỗ trợ đồng đội. Dễ xây dựng lòng tin và giữ không khí nhóm tích cực.',
    'Đồng cảm và hợp tác xuất sắc. Là chất kết dính của đội nhóm — phù hợp vai trò điều phối, HR, chăm sóc khách hàng.',
  ],
  conscientiousness: [
    'Thiếu tính kỷ luật và tổ chức. Hay bỏ lỡ deadline hoặc bỏ sót chi tiết quan trọng. Cần cải thiện kỹ năng quản lý công việc.',
    'Đôi khi thiếu nhất quán trong việc hoàn thành cam kết. Nên dùng công cụ quản lý task để tăng độ tin cậy.',
    'Có tổ chức ở mức cơ bản nhưng chưa xuất sắc. Có thể nâng cao bằng cách xây dựng thói quen và quy trình rõ ràng hơn.',
    'Kỷ luật, đáng tin cậy và hoàn thành tốt công việc được giao. Đồng nghiệp và quản lý đều có thể tin tưởng bạn.',
    'Kỷ luật và tổ chức ở mức xuất sắc. Bạn là hình mẫu về sự nhất quán — rất phù hợp vai trò quản lý dự án.',
  ],
  openness: [
    'Tư duy cứng nhắc, khó thích nghi với thay đổi hoặc ý tưởng mới. Cần mở rộng tiếp xúc với các quan điểm khác nhau.',
    'Thực dụng và ổn định nhưng đôi khi bỏ lỡ cơ hội cải tiến vì ngại thay đổi. Nên thử một ý tưởng mới mỗi tháng.',
    'Cân bằng giữa sáng tạo và thực tế. Có thể cởi mở hơn với các phương pháp mới trong khi vẫn giữ nền tảng vững chắc.',
    'Sáng tạo và tò mò. Bạn sẵn sàng thử nghiệm cách tiếp cận mới và không ngại thay đổi khi có lý do chính đáng.',
    'Tư duy sáng tạo vượt trội — luôn tìm kiếm ý tưởng đột phá và cách làm khác biệt. Là nhân tố đổi mới quan trọng của tổ chức.',
  ],
  emotional_stability: [
    'Rất nhạy cảm với áp lực và cảm xúc tiêu cực, dễ mất bình tĩnh. Cần môi trường làm việc hỗ trợ và kỹ năng điều tiết cảm xúc.',
    'Cảm xúc chưa thật sự ổn định trong tình huống căng thẳng. Nên thực hành mindfulness và kỹ thuật kiểm soát stress.',
    'Ổn định cảm xúc ở mức trung bình. Có thể bị ảnh hưởng bởi áp lực, nhưng thường hồi phục tốt sau đó.',
    'Bình tĩnh và kiên định trước thử thách. Ít bị dao động bởi tình huống tiêu cực, là chỗ dựa tinh thần cho đội nhóm.',
    'Trạng thái cảm xúc cực kỳ ổn định — bạn là "neo" của đội trong các giai đoạn khó khăn. Rất phù hợp vai trò lãnh đạo.',
  ],
  achievement_drive: [
    'Thiếu động lực để vươn lên. Cần xác định lại mục tiêu cá nhân và lý do làm việc để tạo thêm năng lượng nội tại.',
    'Hài lòng với hiện trạng, ít đặt áp lực cho bản thân. Có thể phát triển bằng cách đặt mục tiêu nhỏ cụ thể hàng tuần.',
    'Có động lực nhưng chưa đủ mạnh để vươn xa. Cần môi trường cạnh tranh lành mạnh hoặc mentor để kích thích phát triển.',
    'Luôn đặt mục tiêu cao và nỗ lực vượt qua giới hạn bản thân. Đây là nguồn năng lượng quan trọng cho sự nghiệp dài hạn.',
    'Khát vọng thành tích ở đỉnh cao — bạn không dừng lại ở "đủ tốt". Đặc tính cốt lõi của người thành công xuất sắc.',
  ],
  challenge_spirit: [
    'Ngại rủi ro và thách thức mới. Xu hướng ở lại vùng thoải mái có thể hạn chế tốc độ phát triển cá nhân.',
    'Thích ổn định hơn là thử thách. Cần dần dần tăng ngưỡng chịu đựng rủi ro bằng các bước nhỏ có kiểm soát.',
    'Chấp nhận thách thức khi được chuẩn bị kỹ. Có thể chủ động hơn trong việc tìm kiếm cơ hội học ngoài vùng quen thuộc.',
    'Chủ động đón nhận thử thách và không dễ dàng bỏ cuộc khi gặp khó khăn. Phù hợp môi trường startup và thay đổi nhanh.',
    'Tinh thần chinh phục mạnh mẽ — khó khăn là nhiên liệu thúc đẩy bạn. Là người tiên phong lý tưởng trong bất kỳ tổ chức nào.',
  ],
  autonomy: [
    'Phụ thuộc nhiều vào hướng dẫn và sự giám sát. Cần phát triển khả năng tự ra quyết định và giải quyết vấn đề độc lập.',
    'Làm việc tốt khi có hướng dẫn rõ ràng, nhưng còn ngại tự khởi xướng. Nên luyện tập đưa ra đề xuất mà không chờ được yêu cầu.',
    'Có thể tự làm việc trong phạm vi rõ ràng nhưng cần thêm sự tự tin để chủ động trong các tình huống mơ hồ.',
    'Chủ động cao, tự định hướng và ra quyết định tốt. Không cần giám sát chặt chẽ — phù hợp môi trường làm việc linh hoạt.',
    'Tinh thần tự chủ xuất sắc — bạn xác định hướng đi, tự tổ chức và tạo ra kết quả mà không cần thúc đẩy từ bên ngoài.',
  ],
  learning_curiosity: [
    'Ít quan tâm đến việc học hỏi và phát triển kỹ năng mới. Trong môi trường thay đổi nhanh, đây là điểm cần cải thiện khẩn cấp.',
    'Chủ yếu học khi bắt buộc. Nên dành ít nhất 30 phút mỗi ngày để đọc sách, xem video hoặc làm bài tập nâng cao.',
    'Có tò mò học hỏi nhưng chưa đủ nhất quán. Cần xây dựng thói quen học tập bền vững hơn.',
    'Luôn tìm kiếm kiến thức mới và chủ động nâng cao kỹ năng. Đây là lợi thế cạnh tranh quan trọng trong thời đại thay đổi nhanh.',
    'Tinh thần học hỏi không ngừng nghỉ — bạn luôn đứng ở đỉnh của đường cong học tập. Rất phù hợp vai trò đòi hỏi chuyên môn sâu.',
  ],
  recognition_need: [
    'Hoàn toàn không cần sự công nhận từ bên ngoài. Lưu ý: đôi khi khiến người khác hiểu nhầm là bạn không quan tâm đến kết quả.',
    'Ít phụ thuộc vào lời khen. Có thể cần thêm feedback định kỳ để biết mình đang tiến triển đúng hướng.',
    'Cần được ghi nhận ở mức độ vừa phải. Phù hợp với hầu hết môi trường làm việc có feedback đều đặn.',
    'Động lực tăng cao khi được công nhận công khai. Nên trao đổi với quản lý về cách nhận feedback thường xuyên hơn.',
    'Nhu cầu được công nhận rất cao — bạn phát huy tốt nhất khi kết quả được ghi nhận rõ ràng. Cần quản lý nội tâm khi thiếu feedback.',
  ],
  logical_thinking: [
    'Tư duy chủ yếu dựa trên trực giác. Cần rèn luyện kỹ năng phân tích dữ liệu và lập luận có cấu trúc.',
    'Tư duy logic ở mức cơ bản. Nên luyện tập qua các case study và thực hành đặt câu hỏi "Tại sao?" trước mỗi quyết định.',
    'Có tư duy logic tương đối nhưng chưa đủ sắc bén. Có thể cải thiện bằng cách thực hành phân tích vấn đề nhiều chiều hơn.',
    'Phân tích có hệ thống, giỏi phân loại vấn đề và tìm nguyên nhân gốc rễ. Thế mạnh quan trọng trong xử lý tình huống phức tạp.',
    'Tư duy logic xuất sắc — bạn giải quyết vấn đề phức tạp một cách có hệ thống và dựa trên dữ liệu. Rất phù hợp vai trò phân tích, kỹ thuật, chiến lược.',
  ],
  empathy: [
    'Ít chú trọng đến cảm xúc người khác trong giao tiếp. Cần cải thiện kỹ năng lắng nghe chủ động và nhận diện cảm xúc.',
    'Tập trung vào kết quả hơn là cảm xúc. Nên luyện tập đặt mình vào vị trí người khác trước khi phản hồi.',
    'EQ ở mức trung bình — đủ để giao tiếp cơ bản nhưng chưa đủ để xây dựng quan hệ sâu. Cần phát triển thêm kỹ năng đọc vibe nhóm.',
    'Nhạy bén với cảm xúc người khác và phản hồi phù hợp. Nền tảng xây dựng quan hệ làm việc bền vững và hiệu quả.',
    'EQ xuất sắc — bạn đọc được cảm xúc tinh tế và phản ứng đúng lúc. Tài sản hiếm có, đặc biệt trong vai trò quản lý và lãnh đạo.',
  ],
  execution_speed: [
    'Tốc độ xử lý và ra quyết định chậm. Cần rèn luyện kỹ năng quyết đoán và đặt deadline chặt chẽ hơn cho bản thân.',
    'Thường mất nhiều thời gian hơn mức cần thiết. Thử áp dụng kỹ thuật "đủ tốt và tiến lên" thay vì tìm kiếm giải pháp hoàn hảo.',
    'Tốc độ thực thi ở mức ổn. Đôi khi còn do dự, nhưng thường hoàn thành được nhiệm vụ trong thời gian hợp lý.',
    'Quyết đoán và hành động nhanh khi cần thiết. Bạn không bị tê liệt bởi sự không chắc chắn và luôn giữ được momentum.',
    'Tốc độ thực thi cực nhanh và hiệu quả. Bạn là người "make things happen" — rất phù hợp môi trường đòi hỏi phản ứng tức thì.',
  ],
  caution: [
    'Có xu hướng hành động thiếu cân nhắc, dễ mắc sai sót do chủ quan. Cần xây dựng thói quen kiểm tra lại trước khi gửi/triển khai.',
    'Đôi khi bỏ qua chi tiết quan trọng. Nên áp dụng checklist hoặc review partner để giảm tỉ lệ lỗi.',
    'Mức độ thận trọng vừa phải — đủ để tránh sai sót lớn nhưng vẫn giữ được tốc độ làm việc. Có thể cân chỉnh theo từng loại công việc.',
    'Kiểm tra kỹ lưỡng trước khi hành động. Ít mắc sai sót chi tiết, phù hợp công việc đòi hỏi độ chính xác cao như finance, QA, legal.',
    'Cẩn thận và tỉ mỉ ở mức xuất sắc. Gần như không để lọt lỗi — là người không thể thiếu trong các quy trình kiểm soát chất lượng.',
  ],
  growth_orientation: [
    'Ít quan tâm đến lộ trình phát triển bản thân và sự nghiệp dài hạn. Cần xác định lại kỳ vọng tương lai để có thêm động lực.',
    'Tập trung vào công việc hiện tại, chưa có kế hoạch phát triển rõ ràng. Nên tạo bản đồ kỹ năng và lộ trình 1–3 năm cụ thể.',
    'Có định hướng phát triển nhưng chưa nhất quán. Cần cam kết cụ thể hơn với mục tiêu học tập và thăng tiến.',
    'Luôn hướng tới cải thiện bản thân và đóng góp vào sự phát triển tổ chức. Nền tảng để thăng tiến nhanh và bền vững.',
    'Định hướng phát triển ở đỉnh cao — bạn không ngừng nâng cấp bản thân và truyền cảm hứng cho người xung quanh. Tiềm năng lãnh đạo rõ rệt.',
  ],
  stability_orientation: [
    'Rất thích thay đổi và đa dạng — có thể gặp khó khăn ở môi trường cần sự ổn định dài hạn. Cần cân nhắc khi chọn vị trí.',
    'Ít coi trọng sự ổn định, thích môi trường linh hoạt. Phù hợp startup nhưng cần điều chỉnh kỳ vọng ở doanh nghiệp truyền thống.',
    'Cân bằng giữa ổn định và thay đổi — sự linh hoạt đáng quý trong nhiều môi trường làm việc khác nhau.',
    'Coi trọng sự an toàn và nhất quán. Làm việc tốt nhất trong môi trường có quy trình rõ ràng và lộ trình sự nghiệp minh bạch.',
    'Định hướng ổn định rất cao — bạn là người gắn bó lâu dài và xây dựng nền tảng vững chắc. Phù hợp tổ chức cần sự liên tục và đáng tin cậy.',
  ],
  social_contribution: [
    'Tập trung vào mục tiêu cá nhân, ít quan tâm đến tác động xã hội rộng hơn. Không phải điểm yếu, nhưng cần chú ý đến văn hóa tổ chức.',
    'Mục tiêu xã hội chưa phải ưu tiên hàng đầu. Có thể tìm kiếm những dự án có tác động cụ thể để tăng thêm ý nghĩa trong công việc.',
    'Có ý thức về đóng góp xã hội nhưng chưa phải động lực chính. Phù hợp hầu hết môi trường doanh nghiệp thông thường.',
    'Muốn công việc có ý nghĩa xã hội — nguồn động lực bền vững, phù hợp tổ chức có sứ mệnh rõ ràng.',
    'Đóng góp xã hội là giá trị cốt lõi của bạn. Rất phù hợp tổ chức phi lợi nhuận, B-Corp, hoặc doanh nghiệp có CSR mạnh mẽ.',
  ],
  stress_mental: [
    'Rất nhạy cảm với áp lực tâm lý. Cần môi trường làm việc ít xung đột, có hỗ trợ sức khỏe tinh thần và thời gian phục hồi.',
    'Dễ bị ảnh hưởng bởi áp lực tinh thần. Nên học kỹ thuật thở, mindfulness và thiết lập ranh giới công việc – cuộc sống rõ ràng.',
    'Chịu được stress tâm lý ở mức trung bình. Hoạt động tốt trong điều kiện bình thường nhưng cần hỗ trợ trong giai đoạn cao điểm.',
    'Khả năng chịu đựng áp lực tâm lý tốt, duy trì hiệu suất trong hầu hết tình huống khó khăn. Là điểm tựa tinh thần cho nhóm.',
    'Sức chịu đựng tâm lý xuất sắc — bạn giữ được bình tĩnh và hiệu suất ngay cả trong khủng hoảng. Rất phù hợp môi trường áp lực cao.',
  ],
  stress_physical: [
    'Sức bền thể chất thấp, dễ kiệt sức khi làm việc cường độ cao. Cần ưu tiên sức khỏe thể chất và quản lý tải công việc cẩn thận.',
    'Cần cân bằng nghiêm túc giữa làm việc và nghỉ ngơi. Không phù hợp với vị trí yêu cầu làm thêm giờ liên tục hoặc xuất sai đột xuất.',
    'Sức bền thể chất ở mức trung bình — đủ cho cường độ làm việc bình thường nhưng cần theo dõi khi dự án căng thẳng kéo dài.',
    'Sức khỏe và năng lượng tốt, duy trì hiệu suất ngay cả khi áp lực công việc tăng cao.',
    'Sức bền thể chất xuất sắc — bạn duy trì cường độ làm việc cao mà không ảnh hưởng đến chất lượng. Lợi thế lớn trong các giai đoạn sprint dự án.',
  ],
  critical_thinking: [
    'Có xu hướng chấp nhận thông tin mà không kiểm chứng. Cần rèn luyện thói quen đặt câu hỏi và tìm kiếm nguồn thứ hai.',
    'Tư duy phản biện còn hạn chế. Nên thực hành kỹ thuật "5 Whys" và socratic questioning trong công việc hàng ngày.',
    'Có khả năng phản biện cơ bản nhưng chưa nhất quán. Cần chủ động hơn trong việc thách thức các giả định mặc định.',
    'Thường xuyên phân tích đa chiều trước khi tin vào một kết luận. Lá chắn quan trọng tránh sai lầm chiến lược.',
    'Tư duy phản biện sắc bén — bạn luôn đặt câu hỏi đúng và phát hiện lỗ hổng logic mà người khác bỏ qua. Giá trị cao trong mọi vị trí.',
  ],
  communication_clarity: [
    'Trình bày thường mơ hồ hoặc vòng vo, khiến người nghe khó nắm bắt. Cần luyện tập cấu trúc PREP hoặc Pyramid Principle.',
    'Đôi khi truyền đạt chưa rõ ràng, dẫn đến hiểu lầm. Nên tập tóm tắt key message trước khi đi vào chi tiết.',
    'Giao tiếp ở mức ổn, đủ hiểu nhưng chưa đặc biệt ấn tượng. Có thể cải thiện bằng cách đơn giản hóa ngôn ngữ và dùng ví dụ cụ thể.',
    'Trình bày ý tưởng ngắn gọn, súc tích và dễ hiểu. Kỹ năng then chốt giúp ảnh hưởng và thuyết phục người khác.',
    'Kỹ năng giao tiếp xuất sắc — bạn truyền đạt thông điệp phức tạp một cách đơn giản và thuyết phục. Rất phù hợp vai trò lãnh đạo, training, sales.',
  ],
  time_management: [
    'Hay trễ deadline và bị quá tải. Cần áp dụng ngay các hệ thống quản lý thời gian như GTD, time-blocking hoặc Pomodoro.',
    'Thường gặp khó khăn trong việc ưu tiên và hay bị phân tán. Thử dùng ma trận Eisenhower để phân loại việc quan trọng vs. khẩn cấp.',
    'Quản lý thời gian ở mức trung bình — thỉnh thoảng bị trễ hoặc quá tải nhưng thường kiểm soát được. Cần ổn định hơn.',
    'Sắp xếp ưu tiên tốt và hoàn thành công việc đúng hạn trong phần lớn trường hợp. Ít khi rơi vào tình huống "cháy".',
    'Quản lý thời gian đỉnh cao — bạn làm được nhiều hơn người khác trong cùng thời gian mà không cần làm thêm giờ. Năng suất là thế mạnh hàng đầu.',
  ],
  data_literacy: [
    'Ra quyết định chủ yếu bằng trực giác, khó làm việc với báo cáo số. Cần học cơ bản về Excel/Google Sheets và tư duy dữ liệu.',
    'Hiểu số liệu cơ bản nhưng gặp khó khăn với phân tích phức tạp. Nên học thêm về data visualization và các công cụ BI đơn giản.',
    'Có thể đọc hiểu báo cáo thông thường nhưng chưa khai thác hết giá trị từ dữ liệu. Cần nâng cao kỹ năng phân tích sâu hơn.',
    'Nhạy bén với số liệu và dễ dàng rút ra quyết định từ dữ liệu. Đây là lợi thế cạnh tranh lớn trong thời đại data-driven.',
    'Năng lực phân tích dữ liệu xuất sắc — bạn biến số liệu thành insight hành động. Rất phù hợp vai trò analyst, product, strategy.',
  ],
};

function getDimComment(dimId: string, score: number): string {
  const tiers = DIM_COMMENTS[dimId];
  if (!tiers) return '';
  const idx = score >= 8.5 ? 4 : score >= 7 ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0;
  return tiers[idx];
}

// ─── RADAR CHART SVG ──────────────────────────────────────────
const RADAR_LABEL_PAD = 52;

function RadarChart({ groups, size = 280 }: { groups: UnifiedGroup[]; size?: number }) {
  const [hover, setHover] = useState<{ x: number, y: number, text: string } | null>(null);

  const points = groups
    .filter(g => g.id !== 'integrity' && g.id !== 'leadership')
    .flatMap(g => g.items.slice(0, 3))
    .slice(0, 16);

  const n = points.length;
  if (n < 3) return null;

  // viewBox với padding đủ cho nhãn không bị cắt
  const totalW = size + RADAR_LABEL_PAD * 2;
  const totalH = size + RADAR_LABEL_PAD * 2;
  const cx = totalW / 2, cy = totalH / 2;
  const r = size * 0.38;
  const angleStep = (2 * Math.PI) / n;
  const labelR = r + RADAR_LABEL_PAD * 0.82;

  const r4 = (v: number) => Math.round(v * 10000) / 10000;
  const ptX = (i: number, radius: number) => r4(cx + radius * Math.sin(i * angleStep));
  const ptY = (i: number, radius: number) => r4(cy - radius * Math.cos(i * angleStep));

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const dataPath = points
    .map((p, i) => {
      const frac = (p.score ?? 0) / 10;
      return `${i === 0 ? 'M' : 'L'} ${ptX(i, r * frac)} ${ptY(i, r * frac)}`;
    }).join(' ') + ' Z';

  return (
    <div style={{ position: 'relative' }} onMouseLeave={() => setHover(null)}>
      <svg width="100%" viewBox={`0 0 ${totalW} ${totalH}`}>
      {/* Grid rings */}
      {gridLevels.map((lvl, li) => {
        const d = Array.from({ length: n }, (_, i) =>
          `${i === 0 ? 'M' : 'L'} ${ptX(i, r * lvl)} ${ptY(i, r * lvl)}`
        ).join(' ') + ' Z';
        return <path key={li} d={d} fill="none" stroke="#E5E7EB" strokeWidth={li === 4 ? 1.5 : 0.8} />;
      })}
      {/* Spokes */}
      {Array.from({ length: n }, (_, i) => (
        <line key={i} x1={cx} y1={cy} x2={ptX(i, r)} y2={ptY(i, r)} stroke="#E5E7EB" strokeWidth={0.8} />
      ))}
      {/* Data polygon */}
      <path d={dataPath} fill="rgba(59,130,246,0.15)" stroke="#3B82F6" strokeWidth={2} />
      {points.map((p, i) => {
        const frac = (p.score ?? 0) / 10;
        const comment = getDimComment(p.id, p.score) || p.description;
        return (
          <circle key={i} cx={ptX(i, r * frac)} cy={ptY(i, r * frac)} r={5} fill="#3B82F6" stroke="white" strokeWidth={1.5}
            style={{ cursor: 'help' }}
            onMouseMove={(e) => setHover({ x: e.clientX, y: e.clientY, text: comment })}
            onMouseLeave={() => setHover(null)}
          />
        );
      })}
      {/* Labels — full text, anchor theo vị trí trái/phải */}
      {points.map((p, i) => {
        const lx = r4(cx + labelR * Math.sin(i * angleStep));
        const ly = r4(cy - labelR * Math.cos(i * angleStep));
        const anchor = lx > cx + 10 ? 'start' : lx < cx - 10 ? 'end' : 'middle';
        const comment = getDimComment(p.id, p.score) || p.description;
        return (
          <text key={i} x={lx} y={ly}
            textAnchor={anchor} dominantBaseline="middle"
            fontSize={11} fontWeight="500" fill="#374151" fontFamily="system-ui"
            style={{ cursor: 'help', pointerEvents: 'all' }}
            onMouseMove={(e) => setHover({ x: e.clientX, y: e.clientY, text: comment })}
            onMouseLeave={() => setHover(null)}
          >
            {p.label}
          </text>
        );
      })}
      </svg>
      {hover && (
        <div style={{
          position: 'fixed',
          top: hover.y + 15,
          left: hover.x,
          transform: 'translateX(-50%)',
          background: '#1F2937', color: '#FFFFFF',
          padding: '8px 12px', borderRadius: 6, fontSize: 12,
          lineHeight: 1.4, maxWidth: 280, width: 'max-content',
          zIndex: 9999, pointerEvents: 'none',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}>
          {hover.text}
        </div>
      )}
    </div>
  );
}

function DimRow({ item, color }: { item: UnifiedScoreItem; color: string }) {
  const label = getScoreLabel(item.score);

  return (
    <div 
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 10,
        background: '#FAFAFA', 
        border: '1px solid #F0F0F0', marginBottom: 6,
        position: 'relative',
        transition: 'background 0.2s ease',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: '#1F2937' }}>{item.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color }}>{item.score.toFixed(1)}</span>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
              color: label.color, background: label.bg, whiteSpace: 'nowrap',
            }}>{label.text}</span>
          </div>
        </div>
        <div style={{ height: 5, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${(item.score / 10) * 100}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            borderRadius: 3, transition: 'width 0.8s ease-out',
          }} />
        </div>
      </div>
    </div>
  );
}

// ─── ROLE BAR ─────────────────────────────────────────────────
function RoleBar({ role, score, icon, description }: { role: string; score: number; icon: string; description: string }) {
  const pct = Math.round(score);
  const color = pct >= 75 ? '#059669' : pct >= 55 ? '#2563EB' : pct >= 40 ? '#D97706' : '#DC2626';
  const label = pct >= 75 ? '✅ Phù hợp cao' : pct >= 55 ? '✅ Phù hợp' : pct >= 40 ? '⚠️ Cần phát triển' : '❌ Chưa phù hợp';
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{icon} {role}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color }}>{pct}%</span>
          <span style={{ fontSize: 10, color, fontWeight: 500 }}>{label}</span>
        </div>
      </div>
      <div style={{ height: 8, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 4,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          transition: 'width 0.8s ease-out',
        }} />
      </div>
      <div style={{ fontSize: 11, color: '#6B7280', marginTop: 5, lineHeight: 1.4, fontStyle: 'italic' }}>
        {description}
      </div>
    </div>
  );
}

// ─── GROUP TAB ─────────────────────────────────────────────────
// Mapping group id sang label Việt + icon cho tab
const GROUP_META: Record<string, { label: string; icon: string; color: string }> = {
  integrity:    { label: 'Tin cậy',    icon: '🛡️',  color: '#6366F1' },
  personality:  { label: 'Tính Cách', icon: '🧬',  color: '#3B82F6' },
  motivation:   { label: 'Ý Chí',     icon: '🔥',  color: '#EF4444' },
  thinking:     { label: 'Tư Duy',    icon: '🧠',  color: '#F59E0B' },
  values:       { label: 'Giá Trị',   icon: '🌿',  color: '#10B981' },
  stress:       { label: 'Áp Lực',    icon: '💪',  color: '#7C3AED' },
  work_ethic:   { label: 'Công việc', icon: '⚙️',  color: '#0EA5E9' },
  social:       { label: 'Xã hội',    icon: '🤝',  color: '#14B8A6' },
};

const ROLE_ICON: Record<string, string> = {
  'Người Mở cõi':       '🎯',
  'Người Cầm lái':      '👑',
  'Chuyên gia Đào sâu': '🔬',
  'Người Chăm chút':    '⚙️',
  'Nhà Sáng tạo':       '🎨',
  'Người Kiến tạo':     '⚡',
  'Cố vấn Phân tích':   '📊',
  'Chất Kết Dính':      '🤝',
};

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function UnifiedReport({ data, aiReport, candidateName, reportDate }: UnifiedReportProps) {
  // Xác định tab đầu tiên có dữ liệu (bỏ integrity)
  const mainGroups = data.groups.filter(g => g.id !== 'integrity');
  const [activeTab, setActiveTab] = useState<string>(mainGroups[0]?.id ?? 'personality');

  // Điểm tổng hợp (bỏ integrity)
  const overallScore = useMemo(() => {
    const vals = mainGroups.map(g => g.groupScore).filter(s => s > 0);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, [mainGroups]);

  const integrityGroup = data.groups.find(g => g.id === 'integrity');
  const combatPower = data.combatPower;
  const suitability = data.suitability ?? [];
  const topRole = data.topRole;
  const overallLabel = getScoreLabel(overallScore);

  const activeGroup = mainGroups.find(g => g.id === activeTab);
  const activeMeta = GROUP_META[activeTab] ?? { label: activeTab, icon: '📊', color: '#6B7280' };

  // Top 3 mạnh / 3 yếu
  const allItems = mainGroups.flatMap(g => g.items);
  const topStrong = [...allItems].sort((a, b) => b.score - a.score).slice(0, 3);
  const topWeak   = [...allItems].filter(i => i.score > 0).sort((a, b) => a.score - b.score).slice(0, 3);

  // [v4.1] Top 3 Persona — dùng detectPersonaRanked
  const allDims = mainGroups.flatMap(g => g.items).map(item => ({
    dimensionId: item.id,
    raw: 0,
    scaled: Math.round(item.score),
    scaledContinuous: item.score,
    percentile: Math.round((item.score / 10) * 100),
    count: 1,
    max: 10,
  })) as DimensionScore[];
  const top3Personas = useMemo(() => detectPersonaRanked(allDims), [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reliability info
  const reliabilityScore = data.reliabilityScore;
  const interpretationCaveat = data.interpretationCaveat;
  const interpretationConfidence = data.interpretationConfidence ?? 'high';

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      maxWidth: 920, margin: '0 auto', padding: '0 16px 48px',
      color: '#1F2937',
    }}>

      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #60A5FA 100%)',
        borderRadius: 20, padding: '28px 32px', marginBottom: 24,
        color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 200, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', right: 40, bottom: -40, width: 140, height: 140, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Techzen · Báo Cáo Năng Lực Nhân Sự
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
              {candidateName ?? 'Kết Quả Đánh Giá'}
            </h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {topRole && (
                <span style={{
                  background: 'rgba(255,255,255,0.2)', padding: '4px 14px', borderRadius: 20,
                  fontSize: 13, fontWeight: 600, backdropFilter: 'blur(4px)',
                }}>
                  {ROLE_ICON[topRole.role] ?? '🎯'} {topRole.role}
                </span>
              )}
              <span style={{
                background: 'rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: 20,
                fontSize: 11, opacity: 0.85,
              }}>
                {data.sourceType === 'SPI_DEV_V3_LEGACY' ? 'SPI Dev V3' : 'SPI Universal'}
              </span>
              {reportDate && (
                <span style={{ fontSize: 11, opacity: 0.6 }}>
                  {reportDate.toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>
          </div>

          {/* Nhóm thẻ điểm: Điểm tổng & Năng lực */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end', alignItems: 'stretch' }}>
            
            {/* Chỉ số Năng Lực (Hero Metric) */}
            {combatPower && (
              <div 
                style={{
                  background: 'linear-gradient(to bottom right, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
                  borderRadius: 16, padding: '20px 24px', border: '1px solid rgba(255,255,255,0.3)', 
                  maxWidth: 340, minWidth: 280, display: 'flex', flexDirection: 'column',
                  position: 'relative', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                }}
                title="Thuật toán tính điểm thực chiến có trừ hao các rủi ro năng lực tiềm ẩn"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, opacity: 0.95, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    💼 Năng lực thực chiến <span style={{ cursor: 'help', opacity: 0.6, fontSize: 12, verticalAlign: 'top' }}>(i)</span>
                  </div>
                  <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {combatPower.total}<span style={{fontSize: 14, fontWeight: 600, opacity: 0.7, marginLeft: 2}}>/100</span>
                  </div>
                </div>
                
                <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.5, marginBottom: 16, flex: 1 }}>
                  Dự báo khả năng tạo ra kết quả thực tế, kết hợp tư duy, động lực và khả năng kháng áp lực.
                </div>
                
                {/* Auto Insight Highlight (Gót chân Achilles) */}
                {(() => {
                  const hasSanction = combatPower.penaltyApplied || (overallScore * 10 - combatPower.total > 8);
                  if (hasSanction) {
                    const weakestDim = topWeak[0];
                    return (
                      <div style={{ 
                        background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)',
                        padding: '8px 12px', borderRadius: 8, fontSize: 11, marginBottom: 12, lineHeight: 1.4 
                      }}>
                        ⚠️ <strong>Cảnh báo:</strong> Điểm thực chiến bị giảm mạnh do điểm yếu ở <strong>{weakestDim?.label || 'một vài yếu tố'} ({(weakestDim?.score ?? 0).toFixed(1)}/10)</strong>. Nguy cơ gót chân Achilles trong công việc.
                      </div>
                    );
                  }
                  return (
                    <div style={{ 
                      background: 'rgba(52, 211, 153, 0.2)', border: '1px solid rgba(52, 211, 153, 0.4)',
                      padding: '8px 12px', borderRadius: 8, fontSize: 11, marginBottom: 12, lineHeight: 1.4 
                    }}>
                      ✅ <strong>Độ ổn định tốt:</strong> Năng lực phát triển đồng đều, không phát hiện rủi ro chí mạng.
                    </div>
                  );
                })()}

                <div style={{
                  fontSize: 13, fontWeight: 700, color: '#1E3A8A', background: '#FEF08A',
                  padding: '6px 12px', borderRadius: 6, marginTop: 'auto', lineHeight: 1.3, textAlign: 'center',
                  textTransform: 'uppercase', letterSpacing: '0.02em', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  Xếp hạng: {combatPower.label}
                </div>
              </div>
            )}

            {/* Điểm tổng (Secondary Metric) */}
            <div 
              style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 20px',
                textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                minWidth: 130
              }}
              title="Điểm bình quân toán học (Lý thuyết) - Dễ bị san phẳng điểm số"
            >
              <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, marginBottom: 10 }}>
                Điểm Tr.Bình <span style={{ cursor: 'help', opacity: 0.7 }}>(i)</span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>
                {overallScore.toFixed(1)}<span style={{fontSize: 12, opacity: 0.6, fontWeight: 500}}>/10</span>
              </div>
              <div style={{
                marginTop: 12, fontSize: 11, fontWeight: 600, padding: '4px 10px',
                background: 'rgba(255,255,255,0.15)', borderRadius: 20, whiteSpace: 'nowrap'
              }}>
                {overallLabel.text}
              </div>
            </div>

          </div>
        </div>

        {/* Reliability strip — [v4.1] hiển thị reliabilityScore dạng progress bar */}
        <div style={{
          marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.15)',
          display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
        }}>
          <span style={{ fontSize: 11, opacity: 0.6, marginRight: 4 }}>Độ tin cậy:</span>
          {reliabilityScore != null ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 100, height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    width: `${reliabilityScore}%`,
                    background: reliabilityScore >= 80 ? '#34D399' : reliabilityScore >= 60 ? '#FBBF24' : reliabilityScore >= 35 ? '#F97316' : '#F87171',
                    transition: 'width 0.8s ease-out',
                  }} />
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  background: reliabilityScore >= 80 ? 'rgba(52,211,153,0.25)' : reliabilityScore >= 60 ? 'rgba(251,191,36,0.25)' : reliabilityScore >= 35 ? 'rgba(249,115,22,0.25)' : 'rgba(248,113,113,0.25)',
                  padding: '3px 12px', borderRadius: 20,
                }}>
                  {reliabilityScore >= 80 ? '✅' : reliabilityScore >= 60 ? '🟡' : reliabilityScore >= 35 ? '🟠' : '🔴'}
                  {` ${reliabilityScore}/100`}
                </span>
              </div>
            </>
          ) : (
            <span style={{
              fontSize: 12, fontWeight: 700,
              background: data.integrityLevel === 'ok' ? 'rgba(16,185,129,0.25)' : data.integrityLevel === 'warning' ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)',
              padding: '3px 12px', borderRadius: 20,
            }}>
              {data.integrityLevel === 'ok' ? '✅ Cao' : data.integrityLevel === 'warning' ? '🟡 Trung bình' : '🔴 Rủi ro'}
            </span>
          )}
          {integrityGroup?.items.map(item => (
            <span key={item.id} style={{ fontSize: 11, background: 'rgba(255,255,255,0.1)', padding: '3px 10px', borderRadius: 20 }}>
              {item.label}: <strong>{item.score.toFixed(1)}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* ── ĐỘ PHÙ HỢP VĂN HÓA TECHZEN (Culture Fit) ─────────────────────── */}
      {data.techzenCultureFit && (
        <div style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#DB2777', marginBottom: 16, letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: 6 }}>
            🌸 ĐỘ PHÙ HỢP VĂN HÓA TECHZEN
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 1fr', gap: 20 }}>
            {/* Cột trái: 5 Trụ cột văn hóa */}
            <div>
              {[
                { key: 'core1Score', label: '1. Người tử tế (Làm việc từ Tâm)', color: '#F472B6' },
                { key: 'core2Score', label: '2. Học tập suốt đời & Chia sẻ', color: '#60A5FA' },
                { key: 'core3Score', label: '3. Agile & Thích ứng linh hoạt', color: '#34D399' },
                { key: 'core4Score', label: '4. Tạo ra Giá trị thật', color: '#FBBF24' },
                { key: 'core5Score', label: '5. Cẩn trọng & Trọng Văn hóa Nhật', color: '#A78BFA' }
              ].map((col, i) => {
                const score = (data.techzenCultureFit as any)[col.key] || 0;
                return (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#334155', marginBottom: 5, fontWeight: 700 }}>
                      <span>{col.label}</span>
                      <span style={{ color: col.color, fontWeight: 800 }}>{score}/100</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${score}%`, background: col.color, borderRadius: 3, transition: 'width 1s ease-out' }} />
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Cột phải: Nhận xét AI */}
            {((aiReport as any)?.techzenCultureFitInsight || data.techzenCultureFit.overallScore) && (
              <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 10, padding: '16px 20px', display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid rgba(236,72,153,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg, #BE185D, #DB2777)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, boxShadow: '0 4px 12px rgba(190,24,93,0.35)' }}>
                    {data.techzenCultureFit.overallScore}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#BE185D', letterSpacing: '0.02em' }}>CULTURE FIT SCORE</div>
                    <div style={{ fontSize: 11, color: '#DB2777', fontWeight: 500, marginTop: 2 }}>Mức độ phù hợp với tổ chức</div>
                  </div>
                </div>
                
                {/* Nhận xét từ AI */}
                {(aiReport as any)?.techzenCultureFitInsight ? (
                  <div style={{ fontSize: 13, lineHeight: 1.65, color: '#334155', borderTop: '1px solid rgba(236,72,153,0.2)', paddingTop: 12, marginTop: 'auto', flex: 1 }}>
                    {(aiReport as any).techzenCultureFitInsight}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic', marginTop: 10, borderTop: '1px solid rgba(236,72,153,0.2)', paddingTop: 12, flex: 1 }}>
                    (Đang chờ phân tích tự động từ AI...)
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ BẢN ĐỒ NĂNG LỰC — Full width ══════════════════════ */}
      <div style={{
        background: 'white', borderRadius: 16, padding: '20px 24px',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #F0F0F0', marginBottom: 24,
      }}>
        <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: 15, color: '#374151' }}>
          🕸️ Bản Đồ Năng Lực
        </h3>
        <RadarChart groups={data.groups} size={520} />
      </div>

      {/* ══ TAB CHI TIẾT ════════════════════════════════════════ */}
      <div style={{
        background: 'white', borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #F0F0F0', marginBottom: 24,
      }}>
        {/* Tab headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0', background: '#FAFAFA', overflowX: 'auto' }}>
          {mainGroups.map(g => {
            const meta = GROUP_META[g.id] ?? { label: g.title, icon: '📊', color: '#6B7280' };
            const isA = activeTab === g.id;
            return (
              <button key={g.id} onClick={() => setActiveTab(g.id)} style={{
                flex: 1, minWidth: 80, padding: '11px 6px', border: 'none', background: 'transparent',
                cursor: 'pointer', borderBottom: isA ? `3px solid ${meta.color}` : '3px solid transparent',
                color: isA ? meta.color : '#6B7280', fontWeight: isA ? 700 : 500,
                fontSize: 11, transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}>
                <div style={{ fontSize: 16 }}>{meta.icon}</div>
                {meta.label}
                <div style={{ fontSize: 10, marginTop: 1, fontWeight: 700 }}>
                  {g.groupScore.toFixed(1)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div style={{ padding: '20px 24px' }}>
          {activeGroup && (
            <>
              {/* Group header với gauge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 20,
                marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #F5F5F5',
              }}>
                <GaugeChart value={activeGroup.groupScore} color={activeMeta.color} size={100} />
                <div>
                  <h3 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 16, color: '#1F2937' }}>
                    {activeMeta.icon} {activeGroup.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>{activeGroup.subtitle}</p>
                </div>
              </div>

              {/* Items */}
              {activeGroup.items.map(item => (
                <DimRow key={item.id} item={item} color={activeMeta.color} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ══ TOP 3 PERSONA — [v4.1] ══════════════════════════════ */}
      {top3Personas.length > 0 && (
        <div style={{
          background: 'white', borderRadius: 16, padding: '20px 24px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #F0F0F0', marginBottom: 24,
        }}>
          {/* Section header — Tầng 3: Diễn giải */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#1F2937' }}>
              🧬 Hồ Sơ Cốt Cách (Persona)
            </h3>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
              background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE',
            }}>💡 Tầng Diễn Giải</span>
          </div>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#6B7280' }}>
            Phân tích tương đồng với 7 archetype nhân sự. Khoảng cách giữa lý thuyết và thực tế được tính bằng RMSE.
          </p>

          {/* Caveat banner nếu cần */}
          {interpretationCaveat && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 10,
              background: interpretationConfidence === 'low' ? '#FFF7ED' : '#FFFBEB',
              border: `1px solid ${interpretationConfidence === 'low' ? '#FED7AA' : '#FDE68A'}`,
              fontSize: 12, color: interpretationConfidence === 'low' ? '#9A3412' : '#92400E',
            }}>
              {interpretationCaveat}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {top3Personas.map((item, idx) => {
              const isTop = idx === 0;
              const confidenceColor = item.confidence === 'high' ? '#059669' : item.confidence === 'medium' ? '#D97706' : '#6B7280';
              const confidenceLabel = item.confidence === 'high' ? 'Phù hợp rõ' : item.confidence === 'medium' ? 'Có thể phù hợp' : 'Tham khảo';
              return (
                <div key={idx} style={{
                  borderRadius: 14, padding: '16px',
                  background: isTop ? 'linear-gradient(135deg, #F0F9FF, #E0F2FE)' : '#FAFAFA',
                  border: isTop ? '2px solid #BAE6FD' : '1px solid #E5E7EB',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {isTop && (
                    <span style={{
                      position: 'absolute', top: 8, right: 8,
                      fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                      background: '#0EA5E9', color: 'white',
                    }}>✦ PHÙ HỢP NHẤT</span>
                  )}
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{item.persona.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1F2937', marginBottom: 4 }}>
                    {item.persona.title}
                  </div>
                  {/* Match score bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ flex: 1, height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        width: `${item.matchScore}%`,
                        background: isTop ? '#0EA5E9' : '#94A3B8',
                        transition: 'width 0.8s ease-out',
                      }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isTop ? '#0369A1' : '#64748B', whiteSpace: 'nowrap' }}>
                      {item.matchScore}%
                    </span>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                    color: confidenceColor,
                    background: item.confidence === 'high' ? '#D1FAE5' : item.confidence === 'medium' ? '#FEF3C7' : '#F3F4F6',
                  }}>{confidenceLabel}</span>
                  <p style={{ fontSize: 11, color: '#6B7280', margin: '8px 0 0', lineHeight: 1.5 }}>
                    {item.persona.bestEnvironment}
                  </p>
                  <p style={{ fontSize: 10, color: '#F59E0B', margin: '6px 0 0', lineHeight: 1.4, fontStyle: 'italic' }}>
                    ⚠ {item.persona.watchOut}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Lưu ý về dual-type nếu rank1 và rank2 sát nhau */}
          {top3Personas.length >= 2 && top3Personas[0].matchScore - top3Personas[1].matchScore < 8 && (
            <div style={{
              marginTop: 14, padding: '10px 14px', background: '#EFF6FF',
              borderRadius: 10, border: '1px solid #BFDBFE', fontSize: 12, color: '#1D4ED8',
            }}>
              💡 <strong>Hồ sơ 2 chiều:</strong> Sự khác biệt giữa <em>{top3Personas[0].persona.title}</em> và <em>{top3Personas[1].persona.title}</em> rất nhỏ — người này có thể linh hoạt thể hiện cả hai phong cách tùy bối cảnh.
            </div>
          )}
        </div>
      )}

      {/* ══ PHÙ HỢP VAI TRÒ ════════════════════════════════════ */}
      {suitability.length > 0 && (
        <div style={{
          background: 'white', borderRadius: 16, padding: '20px 24px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #F0F0F0', marginBottom: 24,
        }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: 16, color: '#1F2937' }}>
            🎯 Mức Độ Phù Hợp Theo Vị Trí
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 28px' }}>
            {suitability.map(s => (
              <RoleBar key={s.role} role={s.role} score={s.matchScore} icon={ROLE_ICON[s.role] ?? '📌'} description={s.description} />
            ))}
          </div>
          {topRole && (
            <div style={{
              marginTop: 16, padding: '12px 16px', background: '#F0FDF4',
              borderRadius: 10, border: '1px solid #BBF7D0', display: 'flex', gap: 10, alignItems: 'center',
            }}>
              <span style={{ fontSize: 22 }}>{ROLE_ICON[topRole.role] ?? '🎯'}</span>
              <div>
                <div style={{ fontWeight: 700, color: '#166534', fontSize: 14 }}>
                  Vai trò phù hợp nhất: {topRole.role} ({topRole.matchScore}%)
                </div>
                <p style={{ margin: 0, fontSize: 12, color: '#15803D' }}>
                  {topRole.positions?.join(' · ')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ 3 CỘT: ĐIỂM MẠNH / CẦN PHÁT TRIỂN / DATA SOURCE ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Điểm mạnh */}
        <div style={{ background: '#F0FDF4', borderRadius: 16, padding: '16px 18px', border: '1px solid #BBF7D0' }}>
          <h4 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 14, color: '#166534' }}>💪 Điểm Mạnh Nổi Trội</h4>
          {topStrong.map((item, i) => (
            <div key={`strong-${i}-${item.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #DCFCE7' }}>
              <span style={{ fontSize: 12, color: '#15803D', fontWeight: 500 }}>{item.label}</span>
              <span style={{ fontWeight: 800, fontSize: 14, color: '#166534', background: '#BBF7D0', padding: '1px 8px', borderRadius: 20 }}>
                {item.score.toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        {/* Cần phát triển */}
        <div style={{ background: '#FFF7ED', borderRadius: 16, padding: '16px 18px', border: '1px solid #FED7AA' }}>
          <h4 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 14, color: '#9A3412' }}>📈 Cần Phát Triển</h4>
          {topWeak.map((item, i) => (
            <div key={`weak-${i}-${item.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #FED7AA' }}>
              <span style={{ fontSize: 12, color: '#C2410C', fontWeight: 500 }}>{item.label}</span>
              <span style={{ fontWeight: 800, fontSize: 14, color: '#9A3412', background: '#FED7AA', padding: '1px 8px', borderRadius: 20 }}>
                {item.score.toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        {/* Thông tin nguồn */}
        <div style={{ background: '#F5F3FF', borderRadius: 16, padding: '16px 18px', border: '1px solid #DDD6FE' }}>
          <h4 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 14, color: '#5B21B6' }}>📊 Thông Tin Đánh Giá</h4>
          {[
            { label: 'Loại bài', value: data.sourceType === 'SPI_DEV_V3_LEGACY' ? 'SPI Dev V3' : 'SPI Universal' },
            { label: 'Tổng nhóm', value: `${mainGroups.length} nhóm` },
            { label: 'Tổng chỉ số', value: `${allItems.length} chỉ số` },
            { label: 'Độ tin cậy', value: data.integrityLevel === 'ok' ? 'Cao ✅' : data.integrityLevel === 'warning' ? 'Trung bình 🟡' : 'Rủi ro 🔴' },
            combatPower ? { label: '💼 Chỉ số Năng Lực', value: `${combatPower.total}/100` } : null,
            reliabilityScore != null ? { label: '🎯 Điểm Tin Cậy', value: `${reliabilityScore}/100` } : null,
          ].filter(Boolean).map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #EDE9FE' }}>
              <span style={{ fontSize: 11, color: '#7C3AED' }}>{item!.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#5B21B6' }}>{item!.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ AI ASSESSMENT CARD — "Đọc Vị Nhân Sự" ═══════════════ */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        borderRadius: 20, padding: '28px 32px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        color: 'white',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, fontSize: 24,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
          }}>🔮</div>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: 'white' }}>
              Đọc Vị Nhân Sự — AI Analysis
            </h3>
            <p style={{ margin: 0, fontSize: 11, color: '#94A3B8' }}>
              Chuyên gia Tâm lý học Tổ chức · SPI SOTA · Techzen
            </p>
          </div>
        </div>

        {aiReport && (aiReport as any).personaTitle ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── 1. Độ tin cậy ──────────────────────────────────── */}
            <div style={{
              background: (aiReport as any).reliabilityAlert ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
              border: `1px solid ${(aiReport as any).reliabilityAlert ? 'rgba(239,68,68,0.35)' : 'rgba(16,185,129,0.35)'}`,
              borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 22 }}>{(aiReport as any).reliabilityAlert ? '⚠️' : '✅'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 5, letterSpacing: '0.07em',
                  color: (aiReport as any).reliabilityAlert ? '#FCA5A5' : '#6EE7B7' }}>
                  1 · THẨM ĐỊNH ĐỘ TIN CẬY
                </div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: '#E2E8F0' }}>
                  {(aiReport as any).reliabilityVerdict ?? (aiReport as any).executiveSummary}
                </p>
                {(aiReport as any).reliabilityAlert && (
                  <div style={{ marginTop: 8, padding: '6px 12px', background: 'rgba(239,68,68,0.2)',
                    borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#FCA5A5' }}>
                    🚨 Cần kiểm chứng lại qua phỏng vấn trực tiếp
                  </div>
                )}
              </div>
            </div>

            {/* ── 2. Chân dung cốt cách ───────────────────────────── */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.12))',
              border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: '18px 20px',
            }}>
              <div style={{ fontWeight: 700, fontSize: 11, color: '#A5B4FC', marginBottom: 10, letterSpacing: '0.07em' }}>
                2 · PHÁC HỌA CHÂN DUNG CỐT CÁCH
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 40 }}>{(aiReport as any).personaEmoji ?? '🧠'}</span>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
                    {(aiReport as any).personaTitle}
                  </div>
                  <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>BẢN NGÃ NHÂN SỰ</div>
                </div>
              </div>
              <p style={{ margin: '0 0 10px', fontSize: 13, lineHeight: 1.75, color: '#CBD5E1' }}>
                {(aiReport as any).personaDescription}
              </p>
              {(aiReport as any).personaCombination && (
                <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, borderLeft: '3px solid #6366F1' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#818CF8', marginBottom: 4, letterSpacing: '0.05em' }}>PHÂN TÍCH TỔ HỢP</div>
                  <p style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: '#94A3B8' }}>
                    {(aiReport as any).personaCombination}
                  </p>
                </div>
              )}
            </div>

            {/* ── 3. Thế mạnh & Điểm mù ──────────────────────────── */}
            {((aiReport as any).strengths || (aiReport as any).blindSpots) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: 11, color: '#6EE7B7', marginBottom: 10, letterSpacing: '0.07em' }}>3A · THẾ MẠNH NỔI TRỘI</div>
                  {((aiReport as any).strengths ?? []).map((s: any, i: number) => (
                    <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < ((aiReport as any).strengths.length - 1) ? '1px solid rgba(16,185,129,0.15)' : 'none' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#A7F3D0', marginBottom: 3 }}>⚡ {s.title}</div>
                      <p style={{ margin: 0, fontSize: 11, color: '#6EE7B7', lineHeight: 1.55 }}>{s.behavior}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: 11, color: '#FCA5A5', marginBottom: 10, letterSpacing: '0.07em' }}>3B · ĐIỂM MÙ & RỦI RO</div>
                  {((aiReport as any).blindSpots ?? []).map((b: any, i: number) => (
                    <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < ((aiReport as any).blindSpots.length - 1) ? '1px solid rgba(239,68,68,0.15)' : 'none' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#FECACA', marginBottom: 3 }}>🔍 {b.title}</div>
                      <p style={{ margin: 0, fontSize: 11, color: '#FCA5A5', lineHeight: 1.55 }}>{b.risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 4. Job-Fit Mapping ──────────────────────────────── */}
            {(aiReport as any).jobFit && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: '#FCD34D', marginBottom: 14, letterSpacing: '0.07em' }}>
                  4 · ĐÁNH GIÁ ĐỘ PHÙ HỢP CÔNG VIỆC
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {([
                    { label: '💻 Kỹ Thuật (Dev/R&D)',     block: (aiReport as any).jobFit?.technical },
                    { label: '💰 Kinh Doanh (Sales/CS)',  block: (aiReport as any).jobFit?.business },
                    { label: '📋 Vận Hành (KT/Hành chính)', block: (aiReport as any).jobFit?.operations },
                    { label: '🌟 Quản Lý (Lead/Manager)', block: (aiReport as any).jobFit?.management },
                  ]).map(({ label, block }, i) => {
                    if (!block) return null;
                    const pct = Math.min(100, Math.max(0, block.score ?? 0));
                    const col = pct >= 75 ? '#34D399' : pct >= 55 ? '#60A5FA' : pct >= 40 ? '#FBBF24' : '#F87171';
                    return (
                      <div key={i} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>{label}</span>
                          <span style={{ fontWeight: 900, fontSize: 18, color: col }}>{pct}%</span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 8, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: `linear-gradient(90deg, ${col}88, ${col})` }} />
                        </div>
                        <p style={{ margin: 0, fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>{block.comment}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 5. Coaching Advice ──────────────────────────────── */}
            {((aiReport as any).coachingAdvice ?? []).length > 0 && (
              <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: '#A5B4FC', marginBottom: 12, letterSpacing: '0.07em' }}>
                  5 · LỜI KHUYÊN PHÁT TRIỂN (COACHING ADVICE)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {(aiReport as any).coachingAdvice.map((c: any, i: number) => (
                    <div key={i} style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, borderLeft: '3px solid #6366F1' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#C7D2FE', marginBottom: 6 }}>🚀 {c.action}</div>
                      <p style={{ margin: 0, fontSize: 11, color: '#94A3B8', lineHeight: 1.55 }}>{c.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}



          </div>
        ) : aiReport ? (
          /* Fallback: hiển thị format cũ nếu dữ liệu chưa được cập nhật */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(aiReport as any).executiveSummary && (
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 18px' }}>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: '#CBD5E1' }}>{(aiReport as any).executiveSummary}</p>
              </div>
            )}
            {(aiReport as any).strengthsNarrative && (
              <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: '#6EE7B7', marginBottom: 6 }}>💪 Thế mạnh</div>
                <p style={{ margin: 0, fontSize: 12, color: '#A7F3D0', lineHeight: 1.6 }}>{(aiReport as any).strengthsNarrative}</p>
              </div>
            )}
            {(aiReport as any).hrRecommendation && (
              <div style={{ background: 'rgba(245,158,11,0.1)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: '#FCD34D', marginBottom: 6 }}>📋 Khuyến nghị HR</div>
                <p style={{ margin: 0, fontSize: 12, color: '#FDE68A', lineHeight: 1.6 }}>{(aiReport as any).hrRecommendation}</p>
              </div>
            )}
            <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 11, color: '#475569' }}>
              ⚠️ Báo cáo này dùng format cũ. Làm mới để nhận phân tích AI mới nhất.
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔮</div>
            <p style={{ margin: 0, fontSize: 14, color: '#64748B' }}>Hệ thống AI đang phân tích dữ liệu nhân sự...</p>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#475569' }}>Quá trình này mất khoảng 10–20 giây</p>
          </div>
        )}
      </div>
    </div>
  );
}


