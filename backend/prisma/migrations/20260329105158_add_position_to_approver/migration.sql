-- CreateEnum
CREATE TYPE "ApprovalRuleType" AS ENUM ('PERCENTAGE', 'SPECIFIC_APPROVER', 'HYBRID');

-- AlterTable
ALTER TABLE "Approver" ADD COLUMN     "position" INTEGER;

-- CreateTable
CREATE TABLE "ApprovalRule" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "ruleType" "ApprovalRuleType" NOT NULL DEFAULT 'HYBRID',
    "percentageThreshold" INTEGER,
    "requiredApproverId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalRule_workflowId_key" ON "ApprovalRule"("workflowId");

-- AddForeignKey
ALTER TABLE "ApprovalRule" ADD CONSTRAINT "ApprovalRule_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRule" ADD CONSTRAINT "ApprovalRule_requiredApproverId_fkey" FOREIGN KEY ("requiredApproverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
