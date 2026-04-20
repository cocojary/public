-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "department" TEXT,
    "position" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dimensions" (
    "id" TEXT NOT NULL,
    "nameVi" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "descLow" TEXT NOT NULL,
    "descHigh" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dimensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dimension_relations" (
    "id" TEXT NOT NULL,
    "dimensionIdA" TEXT NOT NULL,
    "dimensionIdB" TEXT NOT NULL,
    "relationType" TEXT NOT NULL DEFAULT 'contradiction',
    "thresholdAMin" DOUBLE PRECISION,
    "thresholdAMax" DOUBLE PRECISION,
    "thresholdBMin" DOUBLE PRECISION,
    "thresholdBMax" DOUBLE PRECISION,
    "evidenceWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dimension_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_sets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalMain" INTEGER NOT NULL DEFAULT 0,
    "totalLie" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "setId" TEXT NOT NULL,
    "dimensionId" TEXT NOT NULL,
    "textVi" TEXT NOT NULL,
    "textEn" TEXT,
    "textJa" TEXT,
    "questionType" TEXT NOT NULL DEFAULT 'main',
    "reversed" BOOLEAN NOT NULL DEFAULT false,
    "lieWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "retiredAt" TIMESTAMP(3),
    "retiredReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_relations" (
    "id" TEXT NOT NULL,
    "questionIdA" TEXT NOT NULL,
    "questionIdB" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "flagThreshold" DOUBLE PRECISION,
    "evidenceWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_records" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL,
    "resultData" JSONB NOT NULL,
    "answers" JSONB NOT NULL,
    "answerTimes" JSONB,
    "aiReport" JSONB,
    "hrNote" TEXT,
    "exportedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "submissionIp" TEXT,
    "userId" TEXT NOT NULL,
    "questionSetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limits" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "dimension_relations_dimensionIdA_dimensionIdB_key" ON "dimension_relations"("dimensionIdA", "dimensionIdB");

-- CreateIndex
CREATE UNIQUE INDEX "questions_legacyId_key" ON "questions"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "question_relations_questionIdA_questionIdB_relationType_key" ON "question_relations"("questionIdA", "questionIdB", "relationType");

-- CreateIndex
CREATE UNIQUE INDEX "rate_limits_key_key" ON "rate_limits"("key");

-- AddForeignKey
ALTER TABLE "dimension_relations" ADD CONSTRAINT "dimension_relations_dimensionIdA_fkey" FOREIGN KEY ("dimensionIdA") REFERENCES "dimensions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dimension_relations" ADD CONSTRAINT "dimension_relations_dimensionIdB_fkey" FOREIGN KEY ("dimensionIdB") REFERENCES "dimensions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_setId_fkey" FOREIGN KEY ("setId") REFERENCES "question_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "dimensions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_relations" ADD CONSTRAINT "question_relations_questionIdA_fkey" FOREIGN KEY ("questionIdA") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_relations" ADD CONSTRAINT "question_relations_questionIdB_fkey" FOREIGN KEY ("questionIdB") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_records" ADD CONSTRAINT "assessment_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_records" ADD CONSTRAINT "assessment_records_questionSetId_fkey" FOREIGN KEY ("questionSetId") REFERENCES "question_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
