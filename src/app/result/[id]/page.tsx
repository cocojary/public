import { getAssessmentRecord } from "@/server/actions/getRecordAction";
import { getFlaggedAnswers } from "@/server/actions/getFlaggedAnswersAction";
import { ResultView } from "@/features/assessment/components/ResultView";
import { notFound } from "next/navigation";
import type { AIReport } from "@/features/assessment/utils/openaiService";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getAssessmentRecord(id);

  if (!record) {
    notFound();
  }

  // Lấy danh sách các câu trả lời bị report độ tin cậy thấp
  const flaggedAnswers = await getFlaggedAnswers(id);

  return (
    <main className="min-h-screen bg-slate-100 p-4 py-10 selection:bg-blue-200">
      <ResultView
        recordId={id}
        user={record.user}
        resultData={record.resultData as any}
        date={record.assessmentDate}
        cachedAiReport={(record.aiReport as unknown as AIReport) ?? null}
        initialHrNotes={Array.isArray(record.hrNotes) ? record.hrNotes as any : []}
        flaggedAnswers={flaggedAnswers}
      />
    </main>
  );
}
