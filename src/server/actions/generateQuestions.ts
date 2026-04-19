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
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a world-class Industrial/Organizational (I/O) Psychologist specializing in high-fidelity personality assessment for the Tech Industry.

Task: Create 7 sophisticated Self-Report Personality Inventory (SPI) items for the dimension '${dim.nameEn}' tailored for a ${roleName}.

## CRITICAL FORMAT RULE
Every item MUST be a FIRST-PERSON DECLARATIVE STATEMENT starting with "Tôi" (I).
- YES: "Tôi thường xuyên rà soát lại các rủi ro kỹ thuật trước khi bắt đầu một tính năng phức tạp."
- NO: "Bạn có hay rà soát..." or "Khi có rủi ro, tôi..."

## Item Writing Standards (SOTA Quality)
1. Behavioral Nuance: Avoid obvious "good/bad" answers. Use subtle, realistic professional situations (e.g., code reviews, technical debt, mentoring, architectural disputes).
2. Cognitive Depth: Reflect the mindset of a developer (e.g., focus on logic, efficiency, scalability, and long-term maintainability).
3. Single Construct: Each item must measure ONLY this dimension. No compound statements.
4. Keying: 4 forward-keyed (reversed: false), 3 reverse-keyed (reversed: true).
5. Language: Use natural, professional Vietnamese. Avoid translated-sounding phrases.

## Output Requirement
Mandatory: Vietnamese (textVi), English (textEn), Japanese (textJa).

Response Format (Strict JSON):
{ "questions": [ { "textVi": "string", "textEn": "string", "textJa": "string", "reversed": boolean } ] }`
          }
        ],
        temperature: 0.8,
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
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an I/O Psychologist. Create 7 Lie Scale (social desirability) items for a ${roleName}.

## CRITICAL FORMAT RULE
All items MUST start with "Tôi".

## Lie Scale Standards
- Describe unrealistically perfect behaviors that virtually NO developer actually exhibits 100% of the time.
- Examples: Never making a syntax error, always liking all feedback, having zero bias.
- All items are forward-keyed (reversed: false).
- Trilingual: Vietnamese, English, Japanese.

JSON: { "questions": [ { "textVi": "", "textEn": "", "textJa": "", "reversed": false } ] }`
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
