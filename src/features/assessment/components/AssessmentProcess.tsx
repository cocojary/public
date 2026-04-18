"use client";

import { useState } from "react";
import { IntroStep } from "./IntroStep";
import { UserInfoStep } from "./UserInfoStep";
import { QuizStep } from "./QuizStep";
import { useRouter } from "next/navigation";

type StepStatus = "intro" | "user-info" | "quiz";

export function AssessmentProcess() {
  const [step, setStep] = useState<StepStatus>("intro");
  const [userId, setUserId] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="w-full max-w-4xl animate-in fade-in zoom-in-95 duration-500">
      {step === "intro" && (
        <IntroStep onNext={() => setStep("user-info")} />
      )}
      
      {step === "user-info" && (
        <UserInfoStep onNext={(userId, role) => {
          setUserId(userId);
          setTargetRole(role);
          setStep("quiz");
        }} />
      )}

      {step === "quiz" && userId && targetRole && (
        <QuizStep 
          userId={userId} 
          targetRole={targetRole} 
          onComplete={(recordId) => {
            // Once quiz is submitted and record is created, navigate to Result
            router.push(`/result/${recordId}`);
          }} 
        />
      )}
    </div>
  );
}
