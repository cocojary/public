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

  // Loop through all 19 dimensions and generate 6 questions each
  // To avoid hitting token limits, we'll process them sequentially or in small batches
  const BATCH_SIZE = 3;
  
  for (let i = 0; i < DIMENSIONS.length; i += BATCH_SIZE) {
    const batch = DIMENSIONS.slice(i, i + BATCH_SIZE);
    
    for (const dim of batch) {
      try {
        console.log(`Đang sinh 6 câu hỏi cho Dimension: ${dim.nameVi} (${roleCode})...`);
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are a world-class Industrial/Organizational (I/O) Psychologist and HR Assessment Specialist from top-tier firms like Korn Ferry or SHL.
Task: Create 6 high-fidelity self-assessment questions (Likert 1-5) for dimension '${dim.nameEn} (${dim.nameVi})' specifically tailored for the role of ${roleName}.

SOTA Quality Requirements:
1. Scenario-Infusion: Questions must NOT be generic ("I am organized"). Instead, embed them into professional scenarios relevant to a ${roleName} (e.g., if Tester: focus on bug verification, test planning under pressure; if Sales: focus on client rejection, pipeline management).
2. Cognitive Depth: Aim for behavioral indicators rather than simple attitudes.
3. Balance: 
   - 3 Positive-keyed (Forward): High score indicates higher ${dim.nameEn}.
   - 3 Negative-keyed (Reversed): Agreement indicates lower ${dim.nameEn}. Set 'reversed: true' for these.
4. Trilingual Precision: 
   - Vietnamese: Use professional, respectful, office-appropriate language.
   - English: Business professional level.
   - Japanese: Use Keigo (Teineigo/Sonkeigo) where appropriate for professional assessment context.

Response Format (JSON only):
{ "questions": [ { "textVi": "", "textEn": "", "textJa": "", "reversed": boolean } ] }`
            }
          ],
          temperature: 0.8,
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
    }
  }

  // Generate 6 Lie Scale questions (Option 2B: Context-sensitive)
  try {
    console.log(`Đang sinh 6 câu hỏi Validation (Lie Scale) theo bối cảnh Role: ${roleName}...`);
    const lieResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Create 6 sophisticated validation questions (Lie Scale / Social Desirability Bias) for the role of '${roleName}'. 
Requirements:
- Embed absolute negative behavioral claims within the context of a ${roleName}'s daily tasks.
- These must be humanly impossible absolute statements (e.g., "I have never once written a line of code I wasn't 100% proud of" or "I have never missed a minor detail in a 100-page requirement document").
- Goal: Capturing candidates who try to present an unrealistically perfect image.
- Agreement (Likert 4-5) should indicate high social desirability bias.
- Trilingual output: Vietnamese, English, and Japanese professional business tone.
- JSON structure: { "questions": [ { "textVi": "", "textEn": "", "textJa": "", "reversed": false } ] }`
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
