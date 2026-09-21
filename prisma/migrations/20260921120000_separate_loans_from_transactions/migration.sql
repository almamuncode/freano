-- Remove ledger entries previously created automatically when recording a loan.
-- The match includes the loan owner, direction, exact principal, and generated source label.
DELETE FROM "Transaction" AS transaction
USING "Loan" AS loan
WHERE transaction."userId" = loan."userId"
  AND transaction.amount = loan.principal
  AND (
    (loan.direction = 'LENT' AND transaction.type = 'EXPENSE' AND transaction.source = 'Loan given to ' || loan.person)
    OR (loan.direction = 'BORROWED' AND transaction.type = 'INCOME' AND transaction.source = 'Loan received from ' || loan.person)
  );