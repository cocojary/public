import 'dotenv/config';
import OpenAI from 'openai';
import db from '../server/db';
import { DIMENSIONS } from '../features/assessment/data/dimensions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_KEY,
});

async function auditRole(roleCode: string) {
  console.log(`\n--- AUDITING ROLE: ${roleCode} ---`);
  
  const qSet = await db.questionSet.findFirst({
    where: { role: { code: roleCode }, isActive: true },
    include: { questions: true }
  });

  if (!qSet || qSet.questions.length < 140) {
    console.log(`❌ Role ${roleCode} does not have enough questions for audit (Found ${qSet?.questions.length || 0}).`);
    return null;
  }

  // Sample questions and map dimension names manually
  const sampledQuestions = qSet.questions
    .filter((_, index) => index % 3.5 === 0)
    .slice(0, 40)
    .map(q => {
      const dim = DIMENSIONS.find(d => d.id === q.dimensionId);
      return { ...q, dimensionName: dim ? dim.nameEn : q.dimensionId };
    });

  const auditPrompt = `You are a Senior Psychometrician auditing an HR Assessment.
Evaluate the following 40 questions for the role: ${roleCode}.
Criteria (Scale 1-10):
1. Reliability: Are questions consistent in measuring their intended dimensions?
2. Validity: Do scenarios reflect high-level professional challenges for ${roleCode}?
3. Discrimination: Are answers non-obvious?
4. Bias-free: Is the language neutral?
5. Anti-fake: How hard is it to "game" the test?

Questions Data:
${sampledQuestions.map(q => `- [${q.dimensionName}] ${q.textVi}`).join('\n')}

Response Format (JSON):
{
  "scores": { "reliability": 0, "validity": 0, "discrimination": 0, "biasFree": 0, "antiFake": 0 },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "overallTrustScore": 0
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [{ role: "system", content: auditPrompt }]
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

async function main() {
  const rolesToTest = ['DIR', 'HEAD', 'DEV'];
  const report: any[] = [];

  for (const role of rolesToTest) {
    const result = await auditRole(role);
    if (result) {
      report.push({ role, ...result });
    }
  }

  console.log("\n--- FINAL RELIABILITY REPORT ---");
  console.table(report.map(r => ({
    Role: r.role,
    'Trust Score (%)': r.overallTrustScore * 10,
    Reliability: r.scores.reliability,
    Validity: r.scores.validity,
    'Anti-Fake': r.scores.antiFake
  })));
  
  report.forEach(r => {
    console.log(`\n[${r.role}] Weaknesses to watch: ${r.weaknesses.join(", ")}`);
  });
}

main().catch(console.error);
