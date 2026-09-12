-- CreateTable
CREATE TABLE "Bank" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "details" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "bankId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Bank_userId_name_key" ON "Bank"("userId", "name");
CREATE INDEX "Bank_userId_idx" ON "Bank"("userId");
CREATE INDEX "Transaction_bankId_idx" ON "Transaction"("bankId");

-- Backfill a single named account for each user with historic bank activity.
INSERT INTO "Bank" ("id", "name", "userId", "updatedAt")
SELECT 'legacy_bank_' || "userId", 'Primary bank account', "userId", CURRENT_TIMESTAMP
FROM "Transaction"
WHERE "account" = 'BANK'
GROUP BY "userId"
ON CONFLICT ("userId", "name") DO NOTHING;

UPDATE "Transaction" AS transaction
SET "bankId" = bank."id"
FROM "Bank" AS bank
WHERE transaction."account" = 'BANK'
  AND transaction."userId" = bank."userId"
  AND bank."name" = 'Primary bank account';

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;