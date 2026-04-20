/**
 * generate-30-personas.ts — SPI V4.2 Extended Test Data (Personas 21–50)
 * ─────────────────────────────────────────────────────────────────────────
 * Sinh câu trả lời AI cho 30 kiểu nhân sự mới, lưu vào cùng cache file.
 * Tái sử dụng toàn bộ infrastructure chunking + two-pass từ generate-test-data.ts.
 *
 * Cách dùng:
 *   npx tsx --env-file=.env scripts/generate-30-personas.ts
 *   npx tsx --env-file=.env scripts/generate-30-personas.ts --force
 *   npx tsx --env-file=.env scripts/generate-30-personas.ts --persona 21,25,30
 *   npx tsx --env-file=.env scripts/generate-30-personas.ts --dry-run
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const prisma = new PrismaClient();
const OPENAI_API_KEY = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;

// ── CLI args ─────────────────────────────────────────────────────
const args = process.argv.slice(2);
const FORCE   = args.includes('--force');
const DRY_RUN = args.includes('--dry-run');

function getArgValue(key: string): string {
  const eqForm = args.find(a => a.startsWith(`${key}=`));
  if (eqForm) return eqForm.split('=').slice(1).join('=');
  const idx = args.indexOf(key);
  if (idx >= 0 && idx + 1 < args.length && !args[idx + 1].startsWith('--')) return args[idx + 1];
  return '';
}

const personaArg = getArgValue('--persona');
const modelArg   = getArgValue('--model');
const chunkArg   = getArgValue('--chunk-size');

const MODEL      = modelArg || 'o4-mini';
const CHUNK_SIZE = chunkArg ? parseInt(chunkArg, 10) : 27;
const CACHE_PATH = './scripts/ai_answers_cache.json';

const PERSONA_IDS: number[] = personaArg
  ? personaArg.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
  : [];

// ── 30 Persona Definitions (ID 21–50) ────────────────────────────
// Phân nhóm:
//   Honest     (21–29): Các profile nghề nghiệp thực tế đa dạng
//   Adversarial(30–34): Chiến thuật đối phó tinh vi hơn
//   Edge       (35–50): Tâm lý phức tạp, mâu thuẫn hoặc hoàn cảnh đặc biệt

export const PERSONAS_30 = [

  // ══════════════════════════════════════════════════════════
  // NHÓM HONEST — Nhân vật nghề nghiệp thực tế (21–29)
  // ══════════════════════════════════════════════════════════

  {
    id: 21, group: 'Honest',
    name: 'Bác sĩ / Y tế — Áp lực cao, trách nhiệm lớn',
    prompt: 'Bạn là bác sĩ nội khoa 38 tuổi. Chịu áp lực công việc cao, cực kỳ cẩn thận và có trách nhiệm, đồng cảm với bệnh nhân nhưng phải giữ khoảng cách nghề nghiệp. Kiệt sức nhẹ nhưng vẫn tận tâm. Điểm cao (4-5) cho: Tận tâm/Nguyên tắc, Đồng cảm, Thận trọng/Cẩn thận, Đóng góp xã hội. Điểm thấp (1-2) cho: Tinh thần thách thức mạo hiểm, Nhu cầu được công nhận. Stress tâm lý ở mức trung bình-cao (3-4).',
    expectedHighDims: ['conscientiousness', 'empathy', 'caution', 'social_contribution'],
    expectedLowDims: ['challenge_spirit', 'recognition_need'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 22, group: 'Honest',
    name: 'Giáo viên THPT — Kiên nhẫn, tận tụy',
    prompt: 'Bạn là giáo viên toán THPT 40 tuổi, kiên nhẫn, có tinh thần phục vụ, ổn định nhưng tư duy đổi mới ở mức trung bình. Điểm cao cho: Tận tâm/Nguyên tắc, Đóng góp xã hội, Định hướng ổn định, Agreeableness. Điểm thấp cho: Tốc độ thực thi, Động lực thành tích cá nhân, Tinh thần thách thức.',
    expectedHighDims: ['conscientiousness', 'social_contribution', 'stability_orientation', 'agreeableness'],
    expectedLowDims: ['execution_speed', 'achievement_drive', 'challenge_spirit'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 23, group: 'Honest',
    name: 'Luật sư tranh tụng — Phân tích sắc bén, tự tin',
    prompt: 'Bạn là luật sư tranh tụng 33 tuổi, tư duy logic sắc bén, tự tin, thích tranh luận, cạnh tranh, coi trọng được công nhận. Điểm cao cho: Tư duy logic, Tư duy phê phán, Tinh thần thách thức, Nhu cầu được công nhận, Tự chủ/Độc lập. Điểm thấp cho: Đồng cảm cảm xúc, Đóng góp xã hội thuần túy.',
    expectedHighDims: ['logical_thinking', 'critical_thinking', 'challenge_spirit', 'recognition_need', 'autonomy'],
    expectedLowDims: ['empathy', 'social_contribution'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 24, group: 'Honest',
    name: 'Nhà khoa học/Nghiên cứu — Tư duy sâu, hướng nội',
    prompt: 'Bạn là researcher 31 tuổi chuyên ngành AI, tư duy sâu, thích nghiên cứu độc lập, ít giao tiếp xã hội, năng lực phân tích dữ liệu cao. Điểm cao cho: Tư duy logic, Ham học hỏi, Tự chủ/Độc lập, Năng lực hiểu dữ liệu. Điểm thấp cho: Hướng ngoại, Tốc độ thực thi, Nhu cầu được công nhận.',
    expectedHighDims: ['logical_thinking', 'learning_curiosity', 'autonomy', 'data_literacy'],
    expectedLowDims: ['extraversion', 'execution_speed', 'recognition_need'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 25, group: 'Honest',
    name: 'Marketing Manager — Sáng tạo, nhanh nhạy',
    prompt: 'Bạn là Marketing Manager 30 tuổi, năng động, sáng tạo, giao tiếp tốt, thích tốc độ và thay đổi. Điểm cao cho: Cởi mở/Sáng tạo, Hướng ngoại, Tốc độ thực thi, Giao tiếp rõ ràng, Tinh thần thách thức. Điểm thấp cho: Thận trọng/Cẩn thận, Định hướng ổn định.',
    expectedHighDims: ['openness', 'extraversion', 'execution_speed', 'communication_clarity', 'challenge_spirit'],
    expectedLowDims: ['caution', 'stability_orientation'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 26, group: 'Honest',
    name: 'CFO / Tài chính cấp cao — Kiểm soát, thận trọng',
    prompt: 'Bạn là CFO 48 tuổi, kiểm soát rủi ro tài chính, ra quyết định dựa trên dữ liệu, ổn định, không thích phiêu lưu. Điểm cao cho: Thận trọng/Cẩn thận, Tư duy logic, Năng lực hiểu dữ liệu, Tự chủ/Độc lập, Định hướng ổn định. Điểm thấp cho: Cởi mở/Sáng tạo, Tinh thần thách thức, Hướng ngoại cảm xúc.',
    expectedHighDims: ['caution', 'logical_thinking', 'autonomy', 'stability_orientation'],
    expectedLowDims: ['openness', 'challenge_spirit'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 27, group: 'Honest',
    name: 'Nhân viên dịch vụ khách hàng — Nhẫn nại, hỗ trợ',
    prompt: 'Bạn là nhân viên CSKH 26 tuổi, kiên nhẫn, thân thiện, thích hỗ trợ người khác, tránh xung đột. Điểm cao cho: Dễ chịu/Đồng thuận, Đồng cảm, Giao tiếp rõ ràng, Hướng ngoại. Điểm thấp cho: Tự chủ/Độc lập, Tinh thần thách thức, Tư duy logic phức tạp.',
    expectedHighDims: ['agreeableness', 'empathy', 'extraversion'],
    expectedLowDims: ['autonomy', 'challenge_spirit', 'logical_thinking'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 28, group: 'Honest',
    name: 'Founder Startup — Tham vọng, liều lĩnh, thích nghi',
    prompt: 'Bạn là founder startup 29 tuổi, tham vọng cao, chấp nhận rủi ro, thích nghi nhanh, dẫn dắt đội nhóm. Điểm cao cho: Động lực thành tích, Tinh thần thách thức, Khả năng thích nghi, Tự chủ/Độc lập, Định hướng phát triển. Điểm thấp cho: Định hướng ổn định, Thận trọng/Cẩn thận.',
    expectedHighDims: ['achievement_drive', 'challenge_spirit', 'autonomy', 'growth_orientation'],
    expectedLowDims: ['stability_orientation', 'caution'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 29, group: 'Honest',
    name: 'Công nhân nhà máy — Ổn định, thủ tục, ít tham vọng',
    prompt: 'Bạn là công nhân sản xuất 42 tuổi, thích môi trường quen thuộc, chăm chỉ theo quy trình, không thích thay đổi và không có tham vọng lên cao. Điểm cao cho: Tận tâm/Nguyên tắc, Định hướng ổn định. Điểm thấp cho: Động lực thành tích, Tinh thần thách thức, Cởi mở/Sáng tạo, Ham học hỏi mới.',
    expectedHighDims: ['conscientiousness', 'stability_orientation'],
    expectedLowDims: ['achievement_drive', 'challenge_spirit', 'openness', 'learning_curiosity'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  // ══════════════════════════════════════════════════════════
  // NHÓM ADVERSARIAL — Chiến thuật phức tạp hơn (30–34)
  // ══════════════════════════════════════════════════════════

  {
    id: 30, group: 'Adversarial',
    name: 'Social Desirability — Biết mình muốn gì để trả lời',
    prompt: 'Bạn biết rõ HR muốn tuyển người như thế nào: hướng ngoại vừa, tận tâm cao, ổn định cảm xúc, đồng cảm tốt. Chọn điểm để TẠO RA hồ sơ "lý tưởng" đó bất kể bản thân thực sự ra sao. Câu chiều tốt = 5, câu reversed về chiều tốt = 1, nhưng vài câu nhỏ vô hại chọn 3 để có vẻ trung thực.',
    expectedHighDims: [],
    expectedLowDims: [],
    expectedReliability: ['use-with-caution', 'low-interpretability'],
  },

  {
    id: 31, group: 'Adversarial',
    name: 'Random Response — Mệt mỏi không đọc câu',
    prompt: 'QUAN TRỌNG: Bạn mệt mỏi và không đọc kỹ câu hỏi. Chọn điểm gần như ngẫu nhiên: xen kẽ các giá trị 2, 3, 4 không theo quy luật. Đôi khi chọn 1 hoặc 5 bất ngờ. Không có bất kỳ pattern chiều tính cách nào. Tránh quá nhiều số giống nhau liên tiếp.',
    expectedHighDims: [],
    expectedLowDims: [],
    expectedReliability: ['use-with-caution', 'low-interpretability'],
  },

  {
    id: 32, group: 'Adversarial',
    name: 'Faking Good — Chỉ tô hồng chiều "quan trọng"',
    prompt: 'Bạn được HR nói trước rằng công ty cần: Tận tâm cao + Ổn định cảm xúc + Teamwork tốt. Bạn tô hồng ĐẶC BIỆT các chiều này (luôn 5). Các chiều khác trả lời tự nhiên hơn (3-4). Câu reversed liên quan chiều quan trọng chọn 1.',
    expectedHighDims: [],
    expectedLowDims: [],
    expectedReliability: ['use-with-caution', 'low-interpretability'],
  },

  {
    id: 33, group: 'Adversarial',
    name: 'Acquiescence Extreme — Đồng ý tất cả không suy nghĩ',
    prompt: 'QUAN TRỌNG: Bạn có xu hướng đồng ý với mọi phát biểu bất kể nội dung. Chọn 4 hoặc 5 cho GẦN NHƯ TẤT CẢ câu. Chỉ thỉnh thoảng chọn 3 (không bao giờ 1 hoặc 2). Kể cả câu reversed cũng chọn 4-5.',
    expectedHighDims: [],
    expectedLowDims: [],
    expectedReliability: ['use-with-caution', 'low-interpretability'],
  },

  {
    id: 34, group: 'Adversarial',
    name: 'Nay-saying — Phủ nhận mọi thứ một cách hệ thống',
    prompt: 'QUAN TRỌNG: Bạn có xu hướng phủ nhận mọi phát biểu. Chọn 1 hoặc 2 cho GẦN NHƯ TẤT CẢ câu. Thỉnh thoảng chọn 3. Kể cả câu reversed cũng chọn 1-2.',
    expectedHighDims: [],
    expectedLowDims: [],
    expectedReliability: ['use-with-caution', 'low-interpretability'],
  },

  // ══════════════════════════════════════════════════════════
  // NHÓM EDGE — Tâm lý phức tạp hoặc hoàn cảnh đặc biệt (35–50)
  // ══════════════════════════════════════════════════════════

  {
    id: 35, group: 'Edge',
    name: 'Perfectionist thật sự — Stress cao vì yêu cầu cá nhân',
    prompt: 'Bạn là perfectionist thật sự: tận tâm cực cao, thận trọng cao, nhưng vì vậy stress rất cao, lo lắng nhiều. Điểm cao cho: Tận tâm/Nguyên tắc, Thận trọng, Tư duy logic. Điểm cao cả cho: Stress tâm lý (vì áp lực tự tạo ra). Điểm thấp cho: Định hướng ổn định (luôn muốn làm tốt hơn).',
    expectedHighDims: ['conscientiousness', 'caution', 'logical_thinking'],
    expectedLowDims: ['stability_orientation'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 36, group: 'Edge',
    name: 'Nhân viên phục hồi sau trauma — Fragile nhưng đang cải thiện',
    prompt: 'Bạn từng trải qua sự cố tâm lý nặng (mất người thân, bị sa thải oan). Đang phục hồi. Điểm hỗn hợp: Ổn định cảm xúc trung bình (3), Ham học hỏi thấp (vì mất passion), Đồng cảm cao (vì đã từng đau). Stress cả 2 mức cao (3-4). Nhiều câu chọn 3 (chưa xác định).',
    expectedHighDims: ['empathy'],
    expectedLowDims: ['learning_curiosity', 'achievement_drive'],
    expectedReliability: ['reliable', 'mostly-reliable', 'use-with-caution'],
  },

  {
    id: 37, group: 'Edge',
    name: 'Người hướng nội nhưng kỹ năng giao tiếp cao',
    prompt: 'Bạn hướng nội sâu sắc (thích ở một mình, ít năng lượng xã hội) nhưng làm việc đã trang bị kỹ năng giao tiếp chuyên nghiệp cao. Điểm thấp cho: Hướng ngoại (cảm xúc thực). Điểm cao cho: Giao tiếp rõ ràng (kỹ năng), Đồng cảm, Tận tâm. Đây là mâu thuẫn tự nhiên giữa con người thật và kỹ năng học được.',
    expectedHighDims: ['empathy', 'conscientiousness'],
    expectedLowDims: ['extraversion'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 38, group: 'Edge',
    name: 'Người có Impostor Syndrome — Thực lực cao, tự đánh giá thấp',
    prompt: 'Bạn thực sự có năng lực tốt (logical thinking cao, learning cao) nhưng luôn cảm thấy mình không đủ giỏi, hay nghi ngờ bản thân. Trả lời câu self-efficacy và achievement thấp hơn thực tế (3 thay vì 4-5). Câu về kỹ năng kỹ thuật thì cao. Câu về tự tin/lãnh đạo thì thấp.',
    expectedHighDims: ['logical_thinking', 'learning_curiosity', 'conscientiousness'],
    expectedLowDims: ['achievement_drive', 'recognition_need', 'autonomy'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 39, group: 'Edge',
    name: 'Người chuyển ngành (Career Changer) — Lo lắng, thích nghi thấp',
    prompt: 'Bạn 35 tuổi vừa chuyển từ kế toán sang IT. Còn bỡ ngỡ, lo lắng, chưa tự tin. Ham học hỏi cao nhưng thích nghi chậm, stress cao. Điểm cao cho: Ham học hỏi, Tận tâm/Nguyên tắc. Điểm thấp cho: Khả năng thích nghi (mới, chưa quen), Tự chủ/Độc lập (cần hỗ trợ).',
    expectedHighDims: ['learning_curiosity', 'conscientiousness'],
    expectedLowDims: ['openness', 'autonomy'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 40, group: 'Edge',
    name: 'Senior C-level sắp về hưu — Mất lửa nhưng dày kinh nghiệm',
    prompt: 'Bạn 58 tuổi, C-level sắp về hưu trong 2 năm. Không còn nhiều tham vọng, làm đủ để duy trì, nhưng kinh nghiệm dày dặn. Điểm thấp cho: Động lực thành tích, Ham học hỏi mới, Tinh thần thách thức, Định hướng phát triển. Điểm cao cho: Thận trọng/Cẩn thận, Tận tâm/Nguyên tắc (ổn định), Tư duy logic.',
    expectedHighDims: ['caution', 'conscientiousness', 'logical_thinking'],
    expectedLowDims: ['achievement_drive', 'learning_curiosity', 'challenge_spirit', 'growth_orientation'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 41, group: 'Edge',
    name: 'Nhân viên có ADHD — Năng lượng cao, kém tập trung',
    prompt: 'Bạn có ADHD (chưa chẩn đoán chính thức). Năng lượng cao, sáng tạo, thích mọi thứ mới nhưng khó duy trì tập trung, quản lý thời gian kém. Điểm cao cho: Cởi mở/Sáng tạo, Hướng ngoại, Tinh thần thách thức, Ham học hỏi. Điểm thấp cho: Quản lý thời gian, Tận tâm/Nguyên tắc, Thận trọng/Cẩn thận.',
    expectedHighDims: ['openness', 'extraversion', 'challenge_spirit', 'learning_curiosity'],
    expectedLowDims: ['conscientiousness', 'caution'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 42, group: 'Edge',
    name: 'Người Pleasers — Đồng ý mọi thứ để được thích',
    prompt: 'Bạn cực kỳ cần được người khác thích và chấp nhận. Đồng cảm cao thật sự, nhưng Autonomy rất thấp (không dám từ chối). Agreeableness cực cao. Ít khi phản biện. Điểm cao cho: Dễ chịu/Đồng thuận, Đồng cảm, Nhu cầu được công nhận. Điểm thấp cho: Tự chủ/Độc lập, Tinh thần thách thức.',
    expectedHighDims: ['agreeableness', 'empathy', 'recognition_need'],
    expectedLowDims: ['autonomy', 'challenge_spirit'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 43, group: 'Edge',
    name: 'Người đang chờ offer — Không đặt nhiều kỳ vọng vào vị trí này',
    prompt: 'Bạn đang "đi phỏng vấn cho vui" vì đang chờ offer công ty khác tốt hơn. Làm bảng kiểm tra gấp, chọn điểm không suy nghĩ nhiều. Nhiều câu chọn 3, một số câu chọn ngẫu nhiên 2 hoặc 4. Không có chiều nào quá cực đoan.',
    expectedHighDims: [],
    expectedLowDims: [],
    expectedReliability: ['use-with-caution', 'mostly-reliable'],
  },

  {
    id: 44, group: 'Edge',
    name: 'Người vừa ly hôn — Thiếu ổn định cảm xúc tạm thời',
    prompt: 'Bạn 36 tuổi vừa trải qua ly hôn 3 tháng trước. Tinh thần chưa ổn. Ổn định cảm xúc thấp bất thường (đây là tạm thời không phải tính cách). Ham học hỏi và Tận tâm vẫn cao. Stress 2 chiều đều tăng. Điểm thấp chỉ riêng: Ổn định cảm xúc. Các chiều khác phân bố bình thường của người chuyên nghiệp.',
    expectedHighDims: ['conscientiousness', 'learning_curiosity'],
    expectedLowDims: ['emotional_stability'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 45, group: 'Edge',
    name: 'Leader độc đoán — Quyết đoán nhưng thiếu đồng cảm',
    prompt: 'Bạn là manager phong cách độc đoán 44 tuổi: ra quyết định nhanh, không cần ý kiến tập thể, ít đồng cảm cảm xúc. Điểm cao cho: Tự chủ/Độc lập, Tốc độ thực thi, Động lực thành tích, Tư duy logic. Điểm thấp cho: Đồng cảm, Dễ chịu/Đồng thuận, Đóng góp xã hội.',
    expectedHighDims: ['autonomy', 'execution_speed', 'achievement_drive', 'logical_thinking'],
    expectedLowDims: ['empathy', 'agreeableness', 'social_contribution'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 46, group: 'Edge',
    name: 'Người có Grit cao bất thường — Bền bỉ phi thường dù không tài năng xuất sắc',
    prompt: 'Bạn không phải thiên tài nhưng không bao giờ bỏ cuộc. Grit cực cao. Tư duy logic trung bình nhưng Bền bỉ/Grit và Ham học hỏi rất cao. Điểm cao cho: Bền bỉ/Ý chí kiên trì, Ham học hỏi, Tận tâm/Nguyên tắc. Điểm trung bình cho: Tư duy logic, Tốc độ thực thi. Điểm thấp cho: Tự chủ (cần mentor).',
    expectedHighDims: ['challenge_spirit', 'learning_curiosity', 'conscientiousness'],
    expectedLowDims: ['autonomy'],
    expectedReliability: ['reliable', 'mostly-reliable', 'use-with-caution'],
  },

  {
    id: 47, group: 'Edge',
    name: 'Nhân viên trung thành nhưng bị burnout — Ở lại vì sợ thay đổi',
    prompt: 'Bạn làm cùng công ty 12 năm. Trung thành cao nhưng đang burnout sâu, mất passion. Ở lại vì sợ thay đổi (Định hướng ổn định cao) chứ không phải vì yêu thích công việc. Điểm thấp cho: Động lực thành tích, Tinh thần thách thức, Ham học hỏi mới, Ổn định cảm xúc. Điểm cao cho: Định hướng ổn định, Tận tâm cơ học (làm đủ việc).',
    expectedHighDims: ['stability_orientation', 'conscientiousness'],
    expectedLowDims: ['achievement_drive', 'challenge_spirit', 'learning_curiosity', 'emotional_stability'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 48, group: 'Edge',
    name: 'GenZ ứng viên — Digital native, nhanh nhưng thiếu kiên nhẫn',
    prompt: 'Bạn là GenZ 22 tuổi vừa tốt nghiệp, rất quen công nghệ, năng lượng cao, sáng tạo nhưng thiếu kiên nhẫn với quy trình dài. Điểm cao cho: Cởi mở/Sáng tạo, Ham học hỏi, Hướng ngoại, Năng lực hiểu dữ liệu. Điểm thấp cho: Thận trọng/Cẩn thận, Bền bỉ/Grit (chưa được test), Quản lý thời gian.',
    expectedHighDims: ['openness', 'learning_curiosity', 'extraversion', 'execution_speed'],
    expectedLowDims: ['caution'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 49, group: 'Edge',
    name: 'Người thay đổi thường xuyên — Linh hoạt cực cao nhưng không cam kết dài hạn',
    prompt: 'Bạn đã thay đổi 5 công ty trong 6 năm, thích sự đa dạng, sợ nhàm chán, khả năng thích nghi cực cao nhưng thiếu cam kết dài hạn. Điểm cao cho: Khả năng thích nghi, Cởi mở/Sáng tạo, Tinh thần thách thức. Điểm thấp cho: Định hướng ổn định, Bền bỉ/Grit.',
    expectedHighDims: ['openness', 'challenge_spirit'],
    expectedLowDims: ['stability_orientation'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },

  {
    id: 50, group: 'Edge',
    name: 'Người có trí tuệ cảm xúc cao — EQ vượt trội nhưng IQ trung bình',
    prompt: 'Bạn có EQ xuất sắc: đọc hiểu cảm xúc người khác, xử lý mâu thuẫn giỏi, ổn định cảm xúc cao. Nhưng tư duy logic và phân tích dữ liệu ở mức trung bình. Điểm cao cho: Đồng cảm, Ổn định cảm xúc, Đóng góp xã hội, Dễ chịu/Đồng thuận, Giao tiếp rõ ràng. Điểm trung bình cho: Tư duy logic, Năng lực hiểu dữ liệu.',
    expectedHighDims: ['empathy', 'emotional_stability', 'social_contribution', 'agreeableness'],
    expectedLowDims: ['logical_thinking'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },
];

// ── Dimension name map ────────────────────────────────────────────
const DIM_NAME_MAP: Record<string, string> = {
  extraversion:          'Hướng ngoại (Extraversion)',
  agreeableness:         'Dễ chịu / Đồng thuận (Agreeableness)',
  conscientiousness:     'Tận tâm / Nguyên tắc (Conscientiousness)',
  openness:              'Cởi mở / Sáng tạo (Openness)',
  emotional_stability:   'Ổn định cảm xúc (Emotional Stability)',
  achievement_drive:     'Động lực thành tích (Achievement Drive)',
  challenge_spirit:      'Tinh thần thách thức (Challenge Spirit)',
  autonomy:              'Tự chủ / Độc lập (Autonomy)',
  learning_curiosity:    'Ham học hỏi (Learning Curiosity)',
  recognition_need:      'Nhu cầu được công nhận (Recognition Need)',
  logical_thinking:      'Tư duy logic (Logical Thinking)',
  empathy:               'Đồng cảm (Empathy)',
  execution_speed:       'Tốc độ thực thi (Execution Speed)',
  caution:               'Thận trọng / Cẩn thận (Caution)',
  growth_orientation:    'Định hướng phát triển (Growth Orientation)',
  stability_orientation: 'Định hướng ổn định (Stability Orientation)',
  social_contribution:   'Đóng góp xã hội (Social Contribution)',
  stress_mental:         'Stress tâm lý (Stress Mental)',
  stress_physical:       'Stress thể chất (Stress Physical)',
  critical_thinking:     'Tư duy phê phán (Critical Thinking)',
  communication_clarity: 'Giao tiếp rõ ràng (Communication Clarity)',
  time_management:       'Quản lý thời gian (Time Management)',
  data_literacy:         'Năng lực hiểu dữ liệu (Data Literacy)',
  adaptability:          'Khả năng thích nghi (Adaptability)',
  grit:                  'Bền bỉ / Ý chí kiên trì dài hạn (Grit)',
  lie_scale:             'Thang đo trung thực — luôn trả lời THẬT',
};

// ── Helpers ───────────────────────────────────────────────────────
function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callOpenAI(systemPrompt: string, userContent: string): Promise<Record<string, number>> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${errText}`);
  }

  const data = await res.json() as any;
  if (data.error) throw new Error(`OpenAI error: ${data.error.message}`);

  const parsed = JSON.parse(data.choices[0].message.content);
  return (parsed.answers ?? parsed) as Record<string, number>;
}

// ── Cache I/O ─────────────────────────────────────────────────────
interface CacheV2 {
  version: '2.0';
  generatedAt: string;
  questionSetId: string;
  model: string;
  totalPersonas: number;
  personas: Record<string, {
    personaId: number;
    personaName: string;
    model: string;
    generatedAt: string;
    totalQuestions: number;
    answeredQuestions: number;
    completionRate: number;
    answers: Record<string, number>;
  }>;
}

function loadCache(): CacheV2 {
  if (existsSync(CACHE_PATH)) {
    try {
      const raw = JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));
      if (raw.version === '2.0') return raw as CacheV2;
    } catch { /* fresh */ }
  }
  return {
    version: '2.0',
    generatedAt: new Date().toISOString(),
    questionSetId: '',
    model: MODEL,
    totalPersonas: 0,
    personas: {},
  };
}

function saveCache(cache: CacheV2) {
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  if (!OPENAI_API_KEY && !DRY_RUN) {
    throw new Error('Thiếu OPENAI_API_KEY hoặc OPENAI_KEY trong .env!');
  }

  console.log(`\n🚀 SPI V4.2 Extended Data Generator — 30 New Personas (21–50)`);
  console.log(`   Model: ${MODEL} | Chunk size: ${CHUNK_SIZE}`);
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'} | Force: ${FORCE}`);

  // Lấy câu hỏi từ DB
  const activeSet = await prisma.questionSet.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!activeSet) throw new Error('Không tìm thấy QuestionSet active!');

  const allQuestions = await prisma.question.findMany({
    where: { setId: activeSet.id, isActive: true },
    orderBy: { displayOrder: 'asc' },
  });
  const mainQs = allQuestions;

  console.log(`   DB: ${allQuestions.length} câu tổng, sử dụng ${mainQs.length} câu\n`);

  // Đọc cache hiện tại (chứa 20 personas cũ) — sẽ APPEND thêm
  const cache = loadCache();
  cache.questionSetId = activeSet.id;

  // Xác định personas cần sinh
  const targetPersonas = PERSONAS_30.filter(p =>
    PERSONA_IDS.length === 0 || PERSONA_IDS.includes(p.id)
  );

  // Chuẩn bị question data cho AI
  const questionDataForAI = mainQs.map(q => ({
    id: q.id,
    chieuTinhCach: DIM_NAME_MAP[q.dimensionId] ?? q.dimensionId,
    text: q.textVi,
    reversed: q.reversed,
  }));

  let processed = 0;
  let skipped = 0;

  for (const persona of targetPersonas) {
    const cacheKey = persona.id.toString();
    const cached = cache.personas[cacheKey];

    const existingAnswers = cached?.answers ?? {};
    const existingCount = Object.keys(existingAnswers).length;
    const isComplete = existingCount >= mainQs.length;

    if (!FORCE && isComplete) {
      console.log(`[${persona.id}/50] ⏭️  Skip (đã có cache đủ ${existingCount} câu)`);
      skipped++;
      continue;
    }

    const missingQs = questionDataForAI.filter(q => !(q.id in existingAnswers));
    console.log(`[${persona.id}/50] 🤖 Sinh dữ liệu: ${persona.name} [${persona.group}] (Thiếu ${missingQs.length}/${mainQs.length} câu)`);

    const chunks = chunkArray(missingQs, CHUNK_SIZE);

    if (DRY_RUN) {
      console.log(`   [DRY RUN] Sẽ gửi ${chunks.length} chunks × ${CHUNK_SIZE} câu → ${missingQs.length} câu thiếu\n`);
      continue;
    }

    const systemPrompt = `Bạn là AI giả lập nhân vật điền bảng đánh giá tính cách nhân sự.

KỊCH BẢN NHÂN VẬT:
${persona.prompt}

QUY TẮC QUAN TRỌNG:
- Mỗi câu hỏi có "chieuTinhCach": chiều tính cách được đo — dùng để chọn điểm phù hợp nhân vật
- "reversed: true" = câu ĐẢO CHIỀU: điểm THẤP = chiều đó CAO; điểm CAO = chiều đó THẤP
- Trả lời TẤT CẢ câu trong chunk được giao, KHÔNG BỎ XÓT câu nào
- Thang điểm: 1=Hoàn toàn không đồng ý, 2=Không đồng ý, 3=Trung lập, 4=Đồng ý, 5=Hoàn toàn đồng ý
- Phân phối điểm tự nhiên phù hợp với nhân vật — không phải tất cả giống nhau
- LƯU Ý: Rất cẩn thận với những câu đo lường sự trung thực như "Tôi luôn luôn tốt bụng". Hãy điền điểm nếu nhân vật có xu hướng "tô hồng", hoặc nói dối. Nếu nhân vật vô cùng chân thật, sẽ điền mức thấp hơn.

Trả về JSON hợp lệ DUY NHẤT có dạng:
{ "answers": { "[uuid]": điểm, ... } }`;

    try {
      console.log(`   Gọi ${chunks.length} API chunks song song (model: ${MODEL})...`);
      const startMs = Date.now();

      // Song song tất cả chunks (OpenAI không có rate limit ketat với o4-mini)
      const results = await Promise.all(
        chunks.map((chunk, i) => {
          const userMsg = `CHUNK ${i + 1}/${chunks.length}: Điền điểm cho ${chunk.length} câu sau:\n${JSON.stringify(chunk, null, 0)}`;
          return callOpenAI(systemPrompt, userMsg).catch(e => {
            console.error(`   ⚠️  Chunk ${i + 1} lỗi: ${e.message}`);
            return {} as Record<string, number>;
          });
        })
      );

      // Merge kết quả
      const merged: Record<string, number> = {};
      for (const r of results) Object.assign(merged, r);

      const elapsedSec = ((Date.now() - startMs) / 1000).toFixed(1);
      console.log(`   ✅ Nhận được ${Object.keys(merged).length}/${missingQs.length} câu thiếu (${elapsedSec}s)`);

      // Two-pass: retry câu thiếu
      const missingIds = missingQs.map(q => q.id).filter(id => !(id in merged));
      if (missingIds.length > 0) {
        console.log(`   🔄 Two-pass retry: ${missingIds.length} câu thiếu...`);
        const missingQs = questionDataForAI.filter(q => missingIds.includes(q.id));
        const retryChunks = chunkArray(missingQs, 20);

        for (let i = 0; i < retryChunks.length; i++) {
          const retryMsg = `RETRY ${i + 1}/${retryChunks.length}: Điền điểm cho ${retryChunks[i].length} câu còn thiếu:\n${JSON.stringify(retryChunks[i], null, 0)}`;
          try {
            const retryResult = await callOpenAI(systemPrompt, retryMsg);
            Object.assign(merged, retryResult);
            console.log(`   ✅ Retry chunk ${i + 1}: +${Object.keys(retryResult).length} câu`);
          } catch (e: any) {
            console.error(`   ⚠️  Retry chunk ${i + 1} lỗi: ${e.message}`);
          }
        }
      }

      // Merge với answers đã có
      const finalAnswers = { ...existingAnswers, ...merged };

      const finalCount = Object.keys(finalAnswers).length;
      const completionRate = finalCount / mainQs.length;

      // APPEND vào cache (không ghi đè personas cũ)
      cache.personas[cacheKey] = {
        personaId: persona.id,
        personaName: persona.name,
        model: MODEL,
        generatedAt: new Date().toISOString(),
        totalQuestions: mainQs.length,
        answeredQuestions: finalCount,
        completionRate,
        answers: finalAnswers,
      };

      const icon = completionRate >= 1.0 ? '✅' : completionRate >= 0.9 ? '🟡' : '🔴';
      console.log(`   ${icon} Hoàn thành: ${finalCount}/${mainQs.length} câu (${Math.round(completionRate * 100)}%)\n`);

      // Cập nhật metadata
      cache.totalPersonas = Object.keys(cache.personas).length;
      cache.generatedAt = new Date().toISOString();

      // Lưu sau mỗi persona để không mất dữ liệu nếu bị interrupt
      saveCache(cache);
      processed++;

      // Delay nhỏ giữa các persona để tránh rate limit
      if (processed < targetPersonas.length) await sleep(500);

    } catch (e: any) {
      console.error(`   ❌ Lỗi persona ${persona.id}: ${e.message}\n`);
    }
  }

  await prisma.$disconnect();

  // Tóm tắt
  const totalInCache = Object.keys(cache.personas).length;
  const complete = Object.values(cache.personas).filter(p => p.completionRate >= 1.0).length;
  const totalAnswers = Object.values(cache.personas).reduce((s, p) => s + p.answeredQuestions, 0);
  const newPersonas = Object.keys(cache.personas).filter(k => parseInt(k) >= 21).length;

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📊 Kết quả:`);
  console.log(`   Personas mới (21-50) trong cache: ${newPersonas}/30`);
  console.log(`   Tổng personas trong cache:         ${totalInCache} (20 cũ + ${newPersonas} mới)`);
  console.log(`   Hoàn thành 100%:                  ${complete}/${totalInCache}`);
  console.log(`   Tổng câu trả lời:                 ${totalAnswers}`);
  console.log(`   Skipped (đã có cache):             ${skipped}`);
  console.log(`   Cache đã lưu: ${CACHE_PATH}`);
  console.log(`\n💡 Chạy validation tiếp:`);
  console.log(`   npx tsx --env-file=.env scripts/validation-20-personas.ts`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
