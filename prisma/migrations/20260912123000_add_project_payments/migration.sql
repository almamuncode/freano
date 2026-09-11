CREATE TABLE "ProjectPayment" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "ProjectPayment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProjectPayment_projectId_paidAt_idx" ON "ProjectPayment"("projectId", "paidAt");
ALTER TABLE "ProjectPayment" ADD CONSTRAINT "ProjectPayment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;