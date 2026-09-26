ALTER TABLE "Transaction" ADD COLUMN "clientRequestId" TEXT;

CREATE UNIQUE INDEX "Transaction_userId_clientRequestId_key"
ON "Transaction"("userId", "clientRequestId");
