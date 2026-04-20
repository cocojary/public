import { AssessmentResult } from '../data/scoring';
import { PersonaType, CombatPower, DutyScore } from '../data/aiAnalysis';
import type { DbDimension } from '../../../server/services/assessmentDataService';

export interface AIReport {
  reliabilityVerdict: string;
  reliabilityAlert: boolean;
  personaTitle: string;
  personaEmoji: string;
  personaDescription: string;
  personaCombination: string;
  strengthsBlindSpots: {
    strengths: Array<{ title: string; behavior: string }>;
    blindSpots: Array<{ title: string; risk: string }>;
  };
  jobFit: {
    technical: { score: number; comment: string };
    business: { score: number; comment: string };
    operations: { score: number; comment: string };
    management: { score: number; comment: string };
  };
  coachingAdvice: Array<{ area: string; action: string; rationale: string }>;
  techzenCultureFitInsight: string;
  language: string;
  generatedAt: string;
  fromCache: boolean;
}

// ─── GIẢI THUẬT XÂY DỰNG PROMPT ────────────────────────────────
function buildPrompt(
  result: AssessmentResult,
  persona: PersonaType,
  combatPower: CombatPower,
  duties: DutyScore[],
  cultureFit: any, // TechzenCultureFit object
  lang: 'vi' | 'en' | 'ja',
  dimensions?: DbDimension[],
): string {
  // Đảm bảo có traits để phân tích (nếu result truyền vào chưa có traits thì map từ dimensions)
  const traits = result.traits || result.dimensions.map((d) => {
    const dim = dimensions?.find(dm => dm.id === d.dimensionId);
    return { trait: dim?.nameVi || d.dimensionId, score: d.percentile };
  }).sort((a, b) => b.score - a.score);

  const top5 = traits.slice(0, 5).map((t: { trait: string }) => t.trait);
  const bottom3 = traits.slice(-3).map((t: { trait: string }) => t.trait);
  const lieScore10 = Math.round(result.reliability.lieScore * 10) / 10;

  // Logic mâu thuẫn nội tại (Self-Contradiction)
  const contradictions: string[] = [];
  const traitValues = Object.fromEntries(traits.map((t: { trait: string; score: number }) => [t.trait, t.score]));

  if (traitValues['Tận tâm'] > 80 && traitValues['Sáng tạo'] > 80)
    contradictions.push('Nguyên tắc cao + Sáng tạo bay bổng → Mâu thuẫn giữa quy chuẩn và phá cách');
  if (traitValues['Hướng ngoại'] > 80 && traitValues['Điềm tĩnh'] > 80)
    contradictions.push('Nhu cầu giao thiệp lớn + Nội tâm tĩnh lặng → Dễ bị kiệt sức năng lượng (Social Burnout)');
  if (traitValues['Cẩn trọng'] > 80 && traitValues['Thách thức'] < 30)
    contradictions.push('Cẩn trọng quá mức + Tinh thần thách thức thấp → Ngại rủi ro, khó đổi mới');

  const contradictionNote = contradictions.length > 0
    ? `\nMÂU THUẪN ĐÁNG LƯU Ý:\n${contradictions.map(c => `  - ${c}`).join('\n')}`
    : '';

  // Job fit từ calcDutySuitability (SMA Algorithm)
  const topDuties = duties
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(d => `${d.duty}: ${d.score}%`)
    .join(', ');

  const langNote = lang === 'vi'
    ? 'Viết HOÀN TOÀN bằng tiếng Việt. Giọng văn chuyên nghiệp, sắc sảo, mang tính cố vấn chiến lược.'
    : lang === 'ja'
    ? '全て日本語で。プロフェッショナルで鋭いコンサルタントの口調。'
    : 'Write entirely in English. Professional, sharp, strategic consultant tone.';

  return `Bạn là "Cố vấn Nghề nghiệp Chiến lược" cao cấp của Techzen, chuyên trách đọc vị nhân sự theo hệ thống SOTA Universal V4.
${langNote}

NHIỆM VỤ CỐT LÕI:
1. Thẩm định tính khách quan của dữ liệu bài làm (dựa trên Lie Scale và Consistency).
2. Vẽ chân dung bản ngã chuyên sâu (Persona) của ứng viên, tập trung vào cách "Bạn" vận hành trong tổ chức.
3. Phân loại mức độ tương thích (Job-Fit) cho 4 nhóm ngành: Technical, Business, Operations, Management.
4. QUAN TRỌNG: Với mỗi nhóm ngành, không chỉ đưa ra điểm số, bạn phải phân tích sâu và đề xuất các "VAI TRÒ NGÁCH" (Niche roles) cụ thể mà người này sẽ tỏa sáng nhất (Ví dụ: Thay vì chỉ 'Lập trình viên', hãy gợi ý 'Kỹ sư hạ tầng chịu tải lớn' hoặc 'Frontend Engineer hướng UX').
5. Đánh giá MỨC ĐỘ PHÙ HỢP VĂN HÓA TECHZEN dựa trên 5 trụ cột: Người tử tế (core1Score), Học tập suốt đời (core2Score), Agile (core3Score), Giá trị thật (core4Score), Trọng văn hóa Nhật (core5Score). Viết đoạn nhận xét từ 3-4 câu, chuyên nghiệp, khích lệ. KHÔNG dùng từ tiêu cực nặng nề.
6. Đọc vị các mâu thuẫn trong điểm số (Nếu có) để đưa ra cảnh báo về rủi ro hành vi.

DỮ LIỆU ĐẦU VÀO CỦA ỨNG VIÊN:
- Chỉ số nói dối (Lie Scale): ${lieScore10}/10 ${lieScore10 > 7 ? '⚠️ CAO — nghi ngờ tô hồng' : '✓ Trong ngưỡng an toàn'}
- Độ nhất quán: ${result.reliability.consistencyScore}%
- Top 5 điểm mạnh: ${top5.join('; ')}
- Top 3 điểm yếu: ${bottom3.join('; ')}
- Combat Power: ${combatPower.total}/100 — Tầng bậc: ${combatPower.label}
- Persona hệ thống: ${persona.emoji} ${persona.title}
- Gợi ý vai trò (SMA Algorithm): ${topDuties}
- Độ phù hợp Văn hóa Techzen:
  + Người tử tế (Tâm/Minh bạch): ${cultureFit.core1Score}/100
  + Học tập suốt đời: ${cultureFit.core2Score}/100
  + Agile & Thích ứng: ${cultureFit.core3Score}/100
  + Tạo Giá trị thật: ${cultureFit.core4Score}/100
  + Trọng Văn hóa Nhật: ${cultureFit.core5Score}/100
  + Điểm tổng quát (Culture Fit): ${cultureFit.overallScore}/100
${contradictionNote}

QUY TẮC NGÔN NGỮ (BẮT BUỘC):
1. NGÔI THỨ HAI: Luôn sử dụng "Bạn" (Ví dụ: "Bạn có khả năng...", "Thách thức của Bạn là..."). Tuyệt đối không dùng "Người này", "Đối tượng" hay "Tôi".
2. TRUNG TÍNH (NEUTRAL): Loại bỏ toàn bộ các tính từ mang tính "văn chương" hoặc "phóng đại" (Ví dụ: KHÔNG dùng "ngọc ngà", "vạn quy tắc", "kiếp nào", "dịch chuyển thế giới", "đam mề", "tư tài", "hiệu lực hiệu quả" - nếu không rõ ràng). Hãy dùng từ vựng chuyên môn nhân sự thực tế.
3. CẤU TRÚC PHÂN TÍCH: Áp dụng công thức "1 Hành vi + 1 Kết quả" cho mỗi câu nhận xét. (Ví dụ: "Bạn thường xuyên kiểm tra chi tiết công việc (Hành vi) giúp giảm thiểu sai sót trong các báo cáo tài chính (Kết quả)").
4. SỬA LỖI CHÍNH TẢ: Rà soát kỹ chính tả tiếng Việt (Tránh các lỗi như "cùa", "đam mề", "팀").

ĐÂY LÀ CẤU TRÚC OUTPUT BẮT BUỘC (JSON thuần):

{
  "reliabilityVerdict": "Nhận định về độ trung thực của Bạn dựa trên lieScore và consistency (2-3 câu).",
  "reliabilityAlert": ${lieScore10 > 7 ? 'true' : 'false'},
  "personaTitle": "Tên bản ngã (3-5 từ, sáng tạo nhưng chuyên nghiệp)",
  "personaEmoji": "1 emoji",
  "personaDescription": "Phân tích cốt cách tổng thể của Bạn (60-80 từ). Sử dụng ngôi 'Bạn'. Tuân thủ quy tắc Hành vi + Kết quả.",
  "personaCombination": "Phân tích sự cộng hưởng hoặc mâu thuẫn giữa các nhóm điểm của Bạn. ${contradictions.length > 0 ? 'Đặc biệt lưu ý mâu thuẫn: ' + contradictions.join(', ') : 'Tập trung vào sự cộng hưởng các điểm mạnh.'} Sử dụng ngôi 'Bạn'.",
  "strengthsBlindSpots": {
    "strengths": [
      {"title": "Điểm mạnh 1", "behavior": "Hành vi thực tế + Kết quả thực tế giúp Bạn thành công (1 câu duy nhất)."},
      {"title": "Điểm mạnh 2", "behavior": "Hành vi thực tế + Kết quả thực tế giúp Bạn thành công (1 câu duy nhất)."},
      {"title": "Điểm mạnh 3", "behavior": "Hành vi thực tế + Kết quả thực tế giúp Bạn thành công (1 câu duy nhất)."}
    ],
    "blindSpots": [
      {"title": "Điểm mù 1", "risk": "Hành vi rủi ro + Kết quả tiêu cực Bạn có thể gặp phải (1 câu duy nhất)."},
      {"title": "Điểm mù 2", "risk": "Hành vi rủi ro + Kết quả tiêu cực Bạn có thể gặp phải (1 câu duy nhất)."}
    ]
  },
  "jobFit": {
    "technical":  {"score": số_0_đến_100, "comment": "Vai trò ngách cụ thể (Ví dụ: Security Auditor) + Lý do dựa trên năng lực (1-2 câu)."},
    "business":   {"score": số_0_đến_100, "comment": "Vai trò ngách cụ thể (Ví dụ: Strategic Partnership) + Lý do dựa trên năng lực (1-2 câu)."},
    "operations": {"score": số_0_đến_100, "comment": "Vai trò ngách cụ thể (Ví dụ: Compliance Officer) + Lý do dựa trên năng lực (1-2 câu)."},
    "management": {"score": số_0_đến_100, "comment": "Vai trò ngách cụ thể (Ví dụ: Operational Manager) + Lý do dựa trên năng lực (1-2 câu)."}
  },
  "coachingAdvice": [
    {"area": "Kỹ năng chuyên môn", "action": "Hành động 1", "rationale": "Lý do và kết quả kỳ vọng cho Bạn (1 câu)."},
    {"area": "Kỹ năng mềm/Quản trị", "action": "Hành động 2", "rationale": "Lý do và kết quả kỳ vọng cho Bạn (1 câu)."}
  ],
  "techzenCultureFitInsight": "Đoạn nhận xét (3-4 câu) đánh giá mức độ phù hợp văn hóa Techzen của Bạn, dựa trên 5 trụ cột và điểm số tương ứng. Viết bằng ngôi 'Bạn', chuyên nghiệp, xây dựng và không dùng từ ngữ tiêu cực nặng nề."
}
`;
}

// ─── RETRY LOGIC ───────────────────────────────────────────────
async function callOpenAIWithRetry(
  apiKey: string,
  prompt: string,
  retries = 2,
): Promise<string | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2500,
          temperature: 0.6,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.status === 429 || response.status >= 500) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1200 * (attempt + 1)));
          continue;
        }
        return null;
      }

      if (!response.ok) return null;

      const data = (await response.json()) as any;
      return data.choices[0]?.message?.content ?? null;
    } catch (err) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1200 * (attempt + 1)));
        continue;
      }
      return null;
    }
  }
  return null;
}

// ─── MAIN EXPORT ───────────────────────────────────────────────
export async function generateAIReport(
  result: AssessmentResult,
  persona: PersonaType,
  combatPower: CombatPower,
  duties: DutyScore[],
  cultureFit: any, // TechzenCultureFit object
  lang: 'vi' | 'en' | 'ja' = 'vi',
): Promise<AIReport | null> {
  const apiKey = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt = buildPrompt(result, persona, combatPower, duties, cultureFit, lang);
  const content = await callOpenAIWithRetry(apiKey, prompt);

  if (!content) return null;

  try {
    const parsed = JSON.parse(content) as any;
    return {
      ...parsed,
      language: lang,
      generatedAt: new Date().toISOString(),
      fromCache: false,
    };
  } catch (err) {
    return null;
  }
}
