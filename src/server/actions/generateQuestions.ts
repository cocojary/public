"use server";

import OpenAI from 'openai';
import db from '../db';
import { DIMENSIONS } from '@/features/assessment/data/dimensions';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Using zod to parse and validate OpenAI JSON
const QuestionsArraySchema = z.object({
  questions: z.array(z.object({
    textVi: z.string(),
    textEn: z.string(),
    textJa: z.string(),
    reversed: z.boolean(),
  }))
});

export async function generateQuestionSet(roleCode: string, roleName: string) {
  console.log(`Bắt đầu tiến trình tạo bộ câu hỏi khảo sát cho chức danh: ${roleName}...`);

  // Ensure Role exists
  let role = await db.targetRole.findUnique({ where: { code: roleCode } });
  if (!role) {
    role = await db.targetRole.create({
      data: { code: roleCode, name: roleName, description: `Bộ câu hỏi chuyên sâu cho ${roleName}` }
    });
  }

  // Create Question Set version
  const qSet = await db.questionSet.create({
    data: { roleId: role.id, version: "v1.0" }
  });

  // Loop through all 19 dimensions and generate 6 questions each
  // To avoid hitting token limits, we'll process them sequentially or in small batches
  const BATCH_SIZE = 3;
  
  for (let i = 0; i < DIMENSIONS.length; i += BATCH_SIZE) {
    const batch = DIMENSIONS.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (dim) => {
      try {
        console.log(`Đang sinh 6 câu hỏi cho Dimension: ${dim.nameVi} (${roleCode})...`);
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `Bạn là chuyên gia thiết kế câu trắc nghiệm tâm lý học I/O (Industrial/Organizational Psychology).
Nhiệm vụ: Viết 6 câu hỏi tự đánh giá (Self-report Likert scale 1-5) để đo lường tiêu chí '${dim.nameEn} (${dim.nameVi})' dành riêng cho ứng viên ứng tuyển vị trí '${roleName}'.
Đặc thù chức danh: Hãy để ngữ cảnh câu hỏi dính dáng tới các công việc tự nhiên trên văn phòng của chức danh này (vd: nếu là Dev thì nói về viết code/fix bug, nếu HR thì nói về nhân sự).
Yêu cầu bắt buộc:
- 3 câu xuôi (thuận chiều - tức là điểm 5 là rất cao ở tiêu chí này).
- 3 câu ngược (reversed = true - tức là người trả lời "Rất đồng ý" lại tương đương điểm 1 ở tiêu chí này).
- Phải kèm theo bản dịch tiếng Anh và Nhật thương mại.
- Trả về JSON đúng định dạng: { "questions": [ { "textVi": "", "textEn": "", "textJa": "", "reversed": boolean } ] }`
            }
          ],
          temperature: 0.7,
        });

        const rawJson = response.choices[0].message.content || "{}";
        const parsed = QuestionsArraySchema.parse(JSON.parse(rawJson));

        // Insert exactly 6 questions
        await db.question.createMany({
          data: parsed.questions.map(q => ({
            setId: qSet.id,
            dimensionId: dim.id,
            textVi: q.textVi,
            textEn: q.textEn,
            textJa: q.textJa,
            reversed: q.reversed,
            isLieScale: false,
          }))
        });
      } catch (error) {
        console.error(`Lỗi khi tạo câu hỏi cho ${dim.id}:`, error);
      }
    }));
  }

  // Generate 6 Lie Scale questions
  try {
    console.log(`Đang sinh 6 câu hỏi Validation (Lie Scale)...`);
    const lieResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Tạo 6 câu hỏi kiểm tra độ thành thật (Lie Scale / Social Desirability Bias) cho ứng viên vị trí '${roleName}'. 
Cách làm: Đưa ra những tuyên bố phổ quát mà trên thực tế hầu như KHÔNG AI chưa từng mắc phải (VD: "Tôi chưa bao giờ nói dối dù chỉ 1 lần", "Tôi chưa bao giờ đến trễ"). Nếu họ chọn "Rất Đồng Ý", họ đang cố giả tạo bề ngoài.
Trả về JSON định dạng: { "questions": [ { "textVi": "", "textEn": "", "textJa": "", "reversed": false } ] }`
        }
      ]
    });
    const parsedLie = QuestionsArraySchema.parse(JSON.parse(lieResponse.choices[0].message.content || "{}"));
    await db.question.createMany({
      data: parsedLie.questions.map(q => ({
        setId: qSet.id,
        dimensionId: "lie_scale",
        textVi: q.textVi,
        textEn: q.textEn,
        textJa: q.textJa,
        reversed: false,
        isLieScale: true,
      }))
    });
  } catch (error) {
    console.error("Lỗi khi tạo Lie Scale:", error);
  }

  console.log(`Hoàn tất bộ câu hỏi 120 câu cho chức danh ${roleName}!`);
  return { success: true, setId: qSet.id };
}
