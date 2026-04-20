import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();
const OPENAI_API_KEY = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Error: Provide OPENAI_API_KEY in .env');
  process.exit(1);
}

const myEvaluation = `
Dưới góc độ một nhà nghiên cứu Tâm lý học Doanh nghiệp và hành vi học (Psychometrics), tôi đánh giá bộ 132 câu hỏi hiện tại như sau:

1. Về độ phủ (Coverage): 
Bộ câu hỏi đang bao phủ được 20 chiều đo lường (Dimensions) kết hợp giữa mô hình tính cách cốt lõi (Big 5) và các năng lực thực chiến trong doanh nghiệp (Combat logic, Resilience, Corporate Skills). Số lượng 6 câu hỏi cho mỗi chiều tính cách là con số lý tưởng để đảm bảo độ tin cậy (Cronbach's alpha) lớn hơn 0.7 mà không làm bài test quá dài gây mệt mỏi.

2. Về màng lọc chống gian lận (Validity Scales):
Hệ thống bố trí 12 câu hỏi bẫy (Lie scale, Random Response Detector) nằm rải rác khéo léo trong bộ câu hỏi. Đây là bước đi cực kỳ thông minh đối với một hệ thống đánh giá nhân sự. Nó đảm bảo lọc được ứng viên có ý định "Tô hồng bản thân" (Faking Good), hoặc "Đánh bừa" (Random responding). 

3. Nhược điểm và cải thiện:
Mặc dù dùng thang đo Likert (1-5) rất phổ biến, tuy nhiên, với các ứng dụng tuyển dụng cấp cao (CEO/Management), các bài khảo sát dạng Tự báo cáo (Self-report) có thể bị thao túng bởi ứng viên quá thông minh. Trong tương lai, có thể nên đưa thêm một số câu dạng Đánh giá tình huống (Situational Judgment Test - SJT) hoặc dạng Forced-Choice (bắt buộc chọn 1 trong 2 phẩm chất tốt) để chống gian lận triệt để hơn nữa.

Nhìn chung, với 132 câu hỏi, bộ công cụ hiện tại đã ĐỦ LỚN và ĐỦ BẢO MẬT để dùng làm màng lọc tính cách nhân sự cấp cao thực tế cho doanh nghiệp.
`;

async function main() {
  console.log('Fetching questions from DB...');
  const questions = await prisma.question.findMany({
    orderBy: { id: 'asc' },
    include: { dimension: true }
  }) as any[];

  console.log(`Found ${questions.length} questions.`);

  const formattedQuestions = questions.map(q => 
    "- [ID: " + q.id + "] [" + q.dimension.name + "] (" + (q.reversed ? "Reversed" : "Normal") + "): " + q.textVi
  ).join("\\n");

  const prompt = `
Hãy đóng vai trò là một chuyên gia đánh giá công cụ đo lường tâm lý học.
Tôi đã phân tích một bộ khảo sát tính cách nhân sự gồm ${questions.length} câu hỏi.
Dưới đây là phần đánh giá của tôi (Vai trò Nhà nghiên cứu):
${myEvaluation}

Và dưới đây là danh sách ${questions.length} câu hỏi thực tế đang được sử dụng trong hệ thống:
${formattedQuestions}

Dựa trên Đánh giá của tôi và Nội dung thực tế của danh sách câu hỏi, hãy:
1. Đọc và Review (phản biện) lại nhận định của tôi. Nhận định đó đã chính xác chưa? Có bỏ sót điểm mù nào về nội dung của 132 câu hỏi này không?
2. Báo cáo đánh giá tổng thể (Report) về chất lượng của 132 câu hỏi này dành cho ứng dụng phân tích nhân sự Công ty. Nêu ra điểm mạnh và điểm cần cải thiện dựa trên nội dung thực tế của câu hỏi.
3. Xuất kết quả báo cáo bằng Markdown rõ ràng, chuyên nghiệp bằng tiếng Việt.
`;

  console.log('Sending to ChatGPT API (GPT-4o) ...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000
    })
  });

  const data = await response.json();
  if (data.error) {
    console.error('API Error:', data.error);
    return;
  }

  const reviewContent = data.choices[0].message.content;
  
  fs.writeFileSync('chatgpt-question-review.md', reviewContent);
  console.log('Done! Review saved to chatgpt-question-review.md');
}

main().catch(console.error).finally(() => prisma.$disconnect());
