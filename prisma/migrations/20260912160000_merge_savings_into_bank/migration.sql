-- Ensure users with historic savings have a bank account to hold the merged balance.
INSERT INTO "Bank" ("id", "name", "userId", "updatedAt")
SELECT 'legacy_savings_bank_' || "userId", 'Primary bank account', "userId", CURRENT_TIMESTAMP
FROM "Transaction"
WHERE "account" = 'SAVINGS'
GROUP BY "userId"
ON CONFLICT ("userId", "name") DO NOTHING;

-- Savings remain in the user's bank balance; no money is created or removed.
UPDATE "Transaction" AS transaction
SET "account" = 'BANK', "bankId" = bank."id"
FROM "Bank" AS bank
WHERE transaction."account" = 'SAVINGS'
  AND transaction."userId" = bank."userId"
  AND bank."name" = 'Primary bank account';