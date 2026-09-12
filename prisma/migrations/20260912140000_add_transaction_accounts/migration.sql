-- CreateEnum
CREATE TYPE "Account" AS ENUM ('BANK', 'SAVINGS', 'POCKET_MONEY');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "account" "Account" NOT NULL DEFAULT 'BANK';
ALTER TABLE "Transaction" ADD COLUMN "transferId" TEXT;

-- CreateIndex
CREATE INDEX "Transaction_userId_account_idx" ON "Transaction"("userId", "account");

-- CreateIndex
CREATE INDEX "Transaction_userId_transferId_idx" ON "Transaction"("userId", "transferId");