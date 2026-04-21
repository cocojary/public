-- Indexes for Question table
CREATE INDEX IF NOT EXISTS "questions_setId_isActive_idx" ON "questions"("setId", "isActive");
CREATE INDEX IF NOT EXISTS "questions_dimensionId_idx" ON "questions"("dimensionId");
CREATE INDEX IF NOT EXISTS "questions_questionType_idx" ON "questions"("questionType");

-- Indexes for AssessmentRecord table
CREATE INDEX IF NOT EXISTS "assessment_records_userId_idx" ON "assessment_records"("userId");
CREATE INDEX IF NOT EXISTS "assessment_records_questionSetId_idx" ON "assessment_records"("questionSetId");
CREATE INDEX IF NOT EXISTS "assessment_records_assessmentDate_idx" ON "assessment_records"("assessmentDate");
CREATE INDEX IF NOT EXISTS "assessment_records_createdAt_idx" ON "assessment_records"("createdAt");

-- Index for RateLimit cleanup queries
CREATE INDEX IF NOT EXISTS "rate_limits_windowStart_idx" ON "rate_limits"("windowStart");
