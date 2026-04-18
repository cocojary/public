import { getAssessmentRecord } from "@/server/actions/getRecordAction";
import { ResultView } from "@/features/assessment/components/ResultView";
import { notFound } from "next/navigation";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getAssessmentRecord(id);

  if (!record) {
    notFound();
  }

  // Pass necessary data to the Client Component for interactivity and Recharts
  return (
    <main className="min-h-screen bg-slate-100 p-4 py-10 selection:bg-blue-200">
      <ResultView 
        user={record.user} 
        resultData={record.resultData as any} 
        date={record.assessmentDate} 
      />
    </main>
  );
}
