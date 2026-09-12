-- Deposits increase an account balance but are not earned income.
ALTER TABLE "Transaction" ADD COLUMN "isDeposit" BOOLEAN NOT NULL DEFAULT false;