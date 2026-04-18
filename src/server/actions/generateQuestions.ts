"use server";

import OpenAI from 'openai';
import db from '../db';
import { DIMENSIONS } from '@/features/assessment/data/dimensions';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_KEY,
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

  // Loop through all 19 dimensions and generate 7 questions each
  for (const dim of DIMENSIONS) {
    try {
      console.log(`Đang sinh 7 câu hỏi SOTA cho Dimension: ${dim.nameVi} (${roleCode})...`);
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a world-class Industrial/Organizational (I/O) Psychologist.
Task: Create 7 high-fidelity assessment questions for dimension '${dim.nameEn} (${dim.nameVi})' tailored for the role of '${roleName}'.

Core Quality Standards:
1. Reliability & Consistency: All questions must measure ${dim.nameEn} through diverse yet related scenarios.
2. Validity: Questions must reflect specific situations a ${roleName} actually faces.
3. Discrimination: Avoid obvious "good" answers.
4. Bias-free: Neutral professional language.
5. Anti-fake (Scenario-based): Use contextual dilemmas rather than abstract statements.
6. Key Balance: 4 Positive-keyed, 3 Negative-keyed (reversed: true).

Output Requirement:
- You MUST provide translations in 3 languages: Vietnamese (textVi), English (textEn), and Japanese (textJa).
- ALL 3 language fields are MANDATORY. Do not omit any field.

Response Format (Strict JSON):
{ "questions": [ { "textVi": "string", "textEn": "string", "textJa": "string", "reversed": boolean } ] }`
          }
        ],
        temperature: 0.7,
      });

      const rawJson = response.choices[0].message.content || "{}";
      const parsed = QuestionsArraySchema.parse(JSON.parse(rawJson));

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
  }

  // Generate 7 Lie Scale questions
  try {
    console.log(`Đang sinh 7 câu hỏi Validation (Lie Scale) cho Role: ${roleName}...`);
    const lieResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Create 7 sophisticated Validation questions (Lie Scale) for the role of '${roleName}'.
Standards:
- Reliability: Test for unrealistically perfect behavior.
- Anti-fake: Use impossible absolute claims (e.g., "I have never once made a mistake in a professional report").
- Consistency: 7 questions must form a coherent lie-detection battery.
- Trilingual output: Vietnamese, English, and Japanese.
- JSON: { "questions": [ { "textVi": "", "textEn": "", "textJa": "", "reversed": false } ] }`
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

  console.log(`Hoàn tất bộ câu hỏi 140 câu cho chức danh ${roleName}!`);
  return { success: true, setId: qSet.id };
}
