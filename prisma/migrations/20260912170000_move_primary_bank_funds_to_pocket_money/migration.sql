-- Historic transactions were placed in this generated placeholder before
-- Pocket money existed. Reclassify them without changing their amounts.
UPDATE "Transaction" AS transaction
SET "account" = 'POCKET_MONEY', "bankId" = NULL
FROM "Bank" AS bank
WHERE transaction."bankId" = bank."id"
  AND bank."name" = 'Primary bank account';

-- The placeholder has no remaining activity after the reclassification.
DELETE FROM "Bank"
WHERE "name" = 'Primary bank account';