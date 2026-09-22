CREATE TYPE "EarningSourceType" AS ENUM ('MARKETPLACE', 'CREATOR_PLATFORM', 'DIRECT_CLIENT', 'OTHER');
CREATE TYPE "EarningStatus" AS ENUM ('PENDING', 'AVAILABLE', 'RECEIVED');

CREATE TABLE "FreelanceEarning" (
  "id" TEXT NOT NULL,
  "sourceType" "EarningSourceType" NOT NULL,
  "platform" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "client" TEXT,
  "grossAmount" DECIMAL(12,2) NOT NULL,
  "platformFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "otherFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "exchangeRate" DECIMAL(12,4) NOT NULL DEFAULT 1,
  "netAmountBdt" DECIMAL(12,2) NOT NULL,
  "status" "EarningStatus" NOT NULL DEFAULT 'PENDING',
  "expectedPayoutAt" TIMESTAMP(3),
  "receivedAt" TIMESTAMP(3),
  "note" TEXT,
  "transactionId" TEXT,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FreelanceEarning_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FreelanceEarning_transactionId_key" ON "FreelanceEarning"("transactionId");
CREATE INDEX "FreelanceEarning_userId_status_idx" ON "FreelanceEarning"("userId", "status");
CREATE INDEX "FreelanceEarning_userId_platform_idx" ON "FreelanceEarning"("userId", "platform");
CREATE INDEX "FreelanceEarning_userId_expectedPayoutAt_idx" ON "FreelanceEarning"("userId", "expectedPayoutAt");
ALTER TABLE "FreelanceEarning" ADD CONSTRAINT "FreelanceEarning_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FreelanceEarning" ADD CONSTRAINT "FreelanceEarning_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
